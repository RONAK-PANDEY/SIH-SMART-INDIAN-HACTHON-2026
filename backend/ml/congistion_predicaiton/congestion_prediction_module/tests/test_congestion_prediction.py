import pytest

from backend.ml.congestion_prediction import config
from backend.ml.congestion_prediction.schemas import CongestionInput, SubScore
from backend.ml.congestion_prediction.features import pct_change, clip
from backend.ml.congestion_prediction.rules import compute_rule_score
from backend.ml.congestion_prediction.reason_generator import build_reason
from backend.ml.congestion_prediction.hybrid import HybridCongestionPredictor
from backend.ml.congestion_prediction.ml_model import CongestionMLModel
from backend.ml.congestion_prediction.service import predict_congestion


# ---------------------------------------------------------------------------
# Low-level feature helpers
# ---------------------------------------------------------------------------
def test_pct_change_normal():
    assert pct_change(120, 100) == pytest.approx(20.0)
    assert pct_change(80, 100) == pytest.approx(-20.0)


def test_pct_change_zero_baseline():
    assert pct_change(0, 0) == 0.0
    assert pct_change(5, 0) == 100.0


def test_clip_bounds():
    assert clip(-10) == 0.0
    assert clip(150) == 100.0
    assert clip(50) == 50.0


# ---------------------------------------------------------------------------
# Threshold classification
# ---------------------------------------------------------------------------
@pytest.mark.parametrize("score,expected", [
    (0, "green"),
    (39, "green"),
    (40, "yellow"),
    (69, "yellow"),
    (70, "red"),
    (100, "red"),
])
def test_classify_status_boundaries(score, expected):
    assert config.classify_status(score) == expected


# ---------------------------------------------------------------------------
# Rule-based scoring
# ---------------------------------------------------------------------------
def calm_input(**overrides) -> CongestionInput:
    base = dict(
        department="Emergency",
        timestamp="2026-09-02T14:30:00Z",
        current_queue_length=10,
        historical_avg_queue_length=10,
        patient_arrivals_last_hour=10,
        historical_avg_arrivals_last_hour=10,
        discharges_last_hour=10,
        avg_wait_time_minutes=20,
        target_wait_time_minutes=45,
        doctors_on_duty=8,
        doctors_required=8,
        doctors_unavailable=0,
        bed_occupancy_rate=0.5,
    )
    base.update(overrides)
    return CongestionInput.from_dict(base)


def busy_input(**overrides) -> CongestionInput:
    base = dict(
        department="Emergency",
        timestamp="2026-09-02T14:30:00Z",
        current_queue_length=42,
        historical_avg_queue_length=31,       # +34% queue
        patient_arrivals_last_hour=18,
        historical_avg_arrivals_last_hour=14,
        discharges_last_hour=9,
        avg_wait_time_minutes=52,              # exceeds 45 min target
        target_wait_time_minutes=45,
        doctors_on_duty=5,
        doctors_required=8,
        doctors_unavailable=3,                  # 3 doctors unavailable
        bed_occupancy_rate=0.91,
    )
    base.update(overrides)
    return CongestionInput.from_dict(base)


def test_rule_score_calm_is_low():
    rule_score, sub_scores, _ = compute_rule_score(calm_input())
    assert rule_score < 15
    assert all(isinstance(s, SubScore) for s in sub_scores)


def test_rule_score_busy_is_high():
    rule_score, sub_scores, _ = compute_rule_score(busy_input())
    assert rule_score > 40


def test_rule_score_monotonic_in_queue_growth():
    low, _, _ = compute_rule_score(busy_input(current_queue_length=32))
    high, _, _ = compute_rule_score(busy_input(current_queue_length=62))
    assert high > low


def test_staffing_deficit_zero_when_overstaffed():
    from backend.ml.congestion_prediction.features import compute_staffing_subscore
    inp = calm_input(doctors_on_duty=12, doctors_required=8)
    score, detail, _ = compute_staffing_subscore(inp)
    assert score == 0.0
    assert "meet" in detail.lower()


# ---------------------------------------------------------------------------
# Reason generation
# ---------------------------------------------------------------------------
def test_reason_mentions_top_drivers_for_busy_scenario():
    _, sub_scores, _ = compute_rule_score(busy_input())
    reason = build_reason(sub_scores)
    assert "queue" in reason.lower() or "increased" in reason.lower()
    assert "doctor" in reason.lower()
    # No more than MAX_REASON_FACTORS clauses
    assert reason.count(";") <= config.MAX_REASON_FACTORS - 1


def test_reason_calm_scenario_is_reassuring():
    _, sub_scores, _ = compute_rule_score(calm_input())
    reason = build_reason(sub_scores)
    assert "no significant" in reason.lower()


def test_reason_ranks_by_contribution_not_raw_score():
    # A low-weight, high-severity factor should not always beat a
    # high-weight, moderately-severe one -- contribution = score * weight.
    sub_scores = [
        SubScore("flow", 100, config.RULE_WEIGHTS["flow"], "Flow detail"),      # 0.15 * 100 = 15
        SubScore("queue", 50, config.RULE_WEIGHTS["queue"], "Queue detail"),     # 0.35 * 50 = 17.5
    ]
    reason = build_reason(sub_scores, max_factors=1)
    assert reason == "Queue detail"


# ---------------------------------------------------------------------------
# Hybrid predictor (ML available vs. fallback)
# ---------------------------------------------------------------------------
class _StubUnavailableModel(CongestionMLModel):
    def __init__(self):
        self.model = None
        self.model_path = "does-not-exist"


class _StubMLModel(CongestionMLModel):
    """Always returns a fixed ML score, for deterministic blend testing."""
    def __init__(self, fixed_score: float):
        self.model = object()  # truthy sentinel -> is_available True
        self.model_path = "stub"
        self._fixed_score = fixed_score

    def predict(self, raw_metrics, bed_occupancy_rate):
        return self._fixed_score


def test_hybrid_falls_back_to_rules_when_ml_unavailable():
    predictor = HybridCongestionPredictor(ml_model=_StubUnavailableModel())
    result = predictor.predict(busy_input())
    assert result.ml_score is None
    assert result.blend_alpha == 0.0
    assert result.score == round(result.rule_score)


def test_hybrid_blends_when_ml_available():
    predictor = HybridCongestionPredictor(ml_model=_StubMLModel(fixed_score=90.0), blend_alpha=0.5)
    result = predictor.predict(calm_input())  # rule_score will be near 0
    assert result.ml_score == 90.0
    assert result.blend_alpha == 0.5
    expected = 0.5 * 90.0 + 0.5 * result.rule_score
    assert result.score == round(expected)


def test_hybrid_output_always_within_bounds():
    predictor = HybridCongestionPredictor(ml_model=_StubMLModel(fixed_score=100.0), blend_alpha=1.0)
    result = predictor.predict(busy_input())
    assert 0 <= result.score <= 100
    assert result.status in ("green", "yellow", "red")


# ---------------------------------------------------------------------------
# End-to-end service function
# ---------------------------------------------------------------------------
def test_predict_congestion_end_to_end_busy_scenario():
    payload = {
        "department": "Emergency",
        "timestamp": "2026-09-02T14:30:00Z",
        "current_queue_length": 42,
        "historical_avg_queue_length": 31,
        "patient_arrivals_last_hour": 18,
        "historical_avg_arrivals_last_hour": 14,
        "discharges_last_hour": 9,
        "avg_wait_time_minutes": 52,
        "target_wait_time_minutes": 45,
        "doctors_on_duty": 5,
        "doctors_required": 8,
        "doctors_unavailable": 3,
        "bed_occupancy_rate": 0.91,
    }
    result = predict_congestion(payload)

    assert 0 <= result["score"] <= 100
    assert result["status"] in ("green", "yellow", "red")
    assert isinstance(result["reason"], str) and len(result["reason"]) > 0
    assert len(result["sub_scores"]) == 4
    # This scenario is clearly congested -> should not be green
    assert result["status"] != "green"


def test_predict_congestion_end_to_end_calm_scenario():
    payload = {
        "department": "Radiology",
        "timestamp": "2026-09-02T03:00:00Z",
        "current_queue_length": 2,
        "historical_avg_queue_length": 3,
        "patient_arrivals_last_hour": 1,
        "historical_avg_arrivals_last_hour": 2,
        "discharges_last_hour": 2,
        "avg_wait_time_minutes": 10,
        "target_wait_time_minutes": 45,
        "doctors_on_duty": 3,
        "doctors_required": 3,
        "doctors_unavailable": 0,
        "bed_occupancy_rate": 0.4,
    }
    result = predict_congestion(payload)
    assert result["status"] == "green"
