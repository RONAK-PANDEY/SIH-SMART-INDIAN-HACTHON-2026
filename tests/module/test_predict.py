"""
Tests for predict.py: `predict()` returns a sane, bounded wait-time
estimate, validates input, and behaves consistently across the
dict/BaseModel calling conventions.

Two layers are used:

1. Unit-level tests that monkeypatch `_load_pipeline()` with a small
   fake pipeline, so validation/shape/error-handling logic is tested
   in isolation from the real trained model artifact (fast, no I/O,
   no sklearn-version coupling).
2. Integration-level "sane range" tests that load the real trained
   `model.joblib` (skipped automatically if the artifact isn't present
   in this checkout) and assert predictions across a spread of inputs
   land within a clinically plausible range.
"""

from pathlib import Path

import pytest

import predict as predict_module
from predict import predict, WaitTimeRequest, _load_pipeline
from features import ALL_FEATURES, DEPARTMENTS, DAYS

VALID_ROW = {
    "queue_length": 10,
    "doctors_available": 2,
    "average_consultation_time": 12.5,
    "patients_per_hour": 8.0,
    "priority_cases": 1,
    "department": "Cardiology",
    "hour": 10,
    "day": "Mon",
}

# A generous but still "sane" bound for predicted minutes. Real predictions
# on the synthetic training data top out well under a few hours; anything
# negative or absurdly large (e.g. > 24h) signals the model/pipeline is
# broken rather than merely imprecise.
MIN_SANE_MINUTES = 0.0
MAX_SANE_MINUTES = 6 * 60.0  # 6 hours


# ---------------------------------------------------------------------
# Fake pipeline for isolated unit tests
# ---------------------------------------------------------------------


class _FakeRegressor:
    def __init__(self, importances):
        self.feature_importances_ = importances


class _FakePreprocessor:
    """Mimics the bit of the real ColumnTransformer's API predict.py touches."""

    class _CatEncoder:
        def get_feature_names_out(self, cols):
            return [f"{cols[0]}_A", f"{cols[0]}_B", f"{cols[1]}_Mon"]

    named_transformers_ = {"cat": _CatEncoder()}


class _FakePipeline:
    """Deterministic stand-in for the sklearn Pipeline predict.py loads."""

    def __init__(self, fixed_prediction=42.345):
        self.fixed_prediction = fixed_prediction
        import numpy as np

        self.named_steps = {
            "preprocessor": _FakePreprocessor(),
            "regressor": _FakeRegressor(importances=np.array([0.5, 0.3, 0.1, 0.06, 0.03, 0.01])),
        }

    def predict(self, X):
        import numpy as np

        return np.array([self.fixed_prediction] * len(X))


@pytest.fixture(autouse=False)
def fake_pipeline(monkeypatch):
    """Bypasses disk/model loading entirely for pure unit tests."""
    fake = _FakePipeline()
    predict_module._load_pipeline.cache_clear()
    monkeypatch.setattr(predict_module, "_load_pipeline", lambda: fake)
    yield fake
    predict_module._load_pipeline.cache_clear()


# ---------------------------------------------------------------------
# Unit tests (fake pipeline): shape, rounding, input handling
# ---------------------------------------------------------------------


def test_predict_returns_expected_keys(fake_pipeline):
    result = predict(WaitTimeRequest(**VALID_ROW))
    assert set(result.keys()) == {"predicted_waiting_time", "top_features"}


def test_predicted_waiting_time_is_rounded_float(fake_pipeline):
    result = predict(VALID_ROW)
    assert isinstance(result["predicted_waiting_time"], float)
    assert result["predicted_waiting_time"] == 42.3  # rounded to 1 decimal


def test_accepts_plain_dict_and_basemodel_equivalently(fake_pipeline):
    from_dict = predict(dict(VALID_ROW))
    from_model = predict(WaitTimeRequest(**VALID_ROW))
    assert from_dict["predicted_waiting_time"] == from_model["predicted_waiting_time"]


def test_top_features_respects_top_n(fake_pipeline):
    result = predict(VALID_ROW, top_n=2)
    assert len(result["top_features"]) == 2


def test_top_features_sorted_descending_by_importance(fake_pipeline):
    result = predict(VALID_ROW, top_n=6)
    importances = [f["importance"] for f in result["top_features"]]
    assert importances == sorted(importances, reverse=True)


def test_missing_required_feature_raises_value_error(fake_pipeline):
    incomplete = dict(VALID_ROW)
    del incomplete["queue_length"]
    with pytest.raises(ValueError, match="Missing required features"):
        predict(incomplete)


def test_all_all_features_present_is_sufficient_even_with_extra_keys(fake_pipeline):
    # Extra, unrecognized keys shouldn't break prediction -- only the
    # ALL_FEATURES columns are ever selected out of the row.
    extra = dict(VALID_ROW)
    extra["some_unrelated_field"] = "ignored"
    result = predict(extra)
    assert "predicted_waiting_time" in result


# ---------------------------------------------------------------------
# WaitTimeRequest schema validation (pydantic-backed field constraints).
# predict.py degrades gracefully to a no-op BaseModel stub when pydantic
# isn't installed, so these only apply when real pydantic is present
# (it always is alongside FastAPI in the actual service).
# ---------------------------------------------------------------------

requires_pydantic = pytest.mark.skipif(
    not predict_module._HAS_PYDANTIC,
    reason="pydantic not installed -- WaitTimeRequest falls back to a non-validating stub",
)


@requires_pydantic
def test_negative_queue_length_rejected():
    bad = dict(VALID_ROW, queue_length=-1)
    with pytest.raises(Exception):
        WaitTimeRequest(**bad)


@requires_pydantic
def test_zero_doctors_available_rejected():
    # doctors_available uses ge=1 -- zero doctors on duty is not a valid input.
    bad = dict(VALID_ROW, doctors_available=0)
    with pytest.raises(Exception):
        WaitTimeRequest(**bad)


@requires_pydantic
def test_hour_out_of_range_rejected():
    bad = dict(VALID_ROW, hour=24)
    with pytest.raises(Exception):
        WaitTimeRequest(**bad)


@requires_pydantic
def test_non_positive_consultation_time_rejected():
    bad = dict(VALID_ROW, average_consultation_time=0)
    with pytest.raises(Exception):
        WaitTimeRequest(**bad)


# ---------------------------------------------------------------------
# Integration tests against the real trained artifact: output range.
# Skipped gracefully if model.joblib isn't present in this checkout.
# ---------------------------------------------------------------------


def _real_model_available() -> bool:
    try:
        predict_module._load_pipeline.cache_clear()
        _load_pipeline()
        return True
    except FileNotFoundError:
        return False
    finally:
        predict_module._load_pipeline.cache_clear()


requires_real_model = pytest.mark.skipif(
    not _real_model_available(),
    reason="model.joblib not found -- run train.py first, or this is a unit-only environment",
)


@requires_real_model
@pytest.mark.parametrize(
    "row",
    [
        VALID_ROW,
        dict(VALID_ROW, queue_length=0, priority_cases=0),
        dict(VALID_ROW, queue_length=50, doctors_available=1, priority_cases=10),
        dict(VALID_ROW, department="Emergency", hour=2, day="Sun"),
        dict(VALID_ROW, department="Pediatrics", hour=23, day="Sat"),
    ],
)
def test_predict_output_within_sane_range_real_model(row):
    result = predict(row)
    minutes = result["predicted_waiting_time"]
    assert isinstance(minutes, float)
    assert MIN_SANE_MINUTES <= minutes <= MAX_SANE_MINUTES, (
        f"predicted_waiting_time={minutes} outside sane bounds "
        f"[{MIN_SANE_MINUTES}, {MAX_SANE_MINUTES}] for input {row}"
    )


@requires_real_model
def test_predict_is_deterministic_for_same_input():
    r1 = predict(VALID_ROW)
    r2 = predict(VALID_ROW)
    assert r1["predicted_waiting_time"] == r2["predicted_waiting_time"]


@requires_real_model
def test_more_queue_length_generally_increases_wait():
    # Directional sanity check rather than an exact-value check: all else
    # equal, a much longer queue should not predict a *shorter* wait than
    # an empty one. Guards against, e.g., a badly wired feature column.
    short_queue = predict(dict(VALID_ROW, queue_length=1))
    long_queue = predict(dict(VALID_ROW, queue_length=40))
    assert long_queue["predicted_waiting_time"] >= short_queue["predicted_waiting_time"]


@requires_real_model
def test_all_department_and_day_categories_produce_valid_output():
    # Every category in the fixed one-hot vocabulary should be handled
    # without error (guards against vocabulary drift between train/predict).
    for dept in DEPARTMENTS:
        for day in (DAYS[0], DAYS[-1]):
            row = dict(VALID_ROW, department=dept, day=day)
            result = predict(row)
            assert MIN_SANE_MINUTES <= result["predicted_waiting_time"] <= MAX_SANE_MINUTES


if __name__ == "__main__":
    import sys

    sys.exit(pytest.main([__file__, "-v"]))
