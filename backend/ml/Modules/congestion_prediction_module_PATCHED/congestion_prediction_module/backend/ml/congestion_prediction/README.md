# Hospital Congestion Score — `backend/ml/congestion_prediction/`

Produces a **0–100 Hospital Congestion Score**, a **green / yellow / red status**,
and a **human-readable reason string** from patient flow, doctor availability,
queue length, and historical patterns.

Approach: **rules + ML hybrid**.

- A **rule-based scorer** turns four operational drivers (queue pressure,
  staffing pressure, wait-time pressure, patient-flow pressure) into
  interpretable 0–100 sub-scores, weighted into a composite "rule score."
  This is always computed and is what powers the reason string.
- An **ML regressor** (gradient boosted trees, trained on historical
  outcomes) predicts a score from the same underlying metrics, capturing
  nonlinear interactions the fixed rule weights can't (e.g. "short-staffed
  AND a queue spike is worse than either alone").
- The **final score blends the two** (configurable `ML_BLEND_ALPHA`,
  default 0.5). If no trained model is available, the system **falls back
  to the pure rule score** automatically — it never fails just because a
  model artifact is missing.

## Why hybrid, not pure ML

Congestion outcomes are hard to label at scale (what really counts as
"critical"?), and a pure ML score is a black box that can't tell a charge
nurse *why* it fired. The rules component guarantees an always-available,
inspectable baseline and generates the reason string; the ML component
lets the score improve over time as real outcome data accumulates,
without giving up interpretability.

## Files

| File | Purpose |
|---|---|
| `config.py` | Thresholds, rule weights, saturation constants, blend alpha — single source of truth (mirrored in `docs/business-rules.md`) |
| `schemas.py` | `CongestionInput`, `CongestionResult`, `SubScore` dataclasses |
| `features.py` | Pure functions turning raw metrics into 0–100 sub-scores + detail strings |
| `rules.py` | Combines sub-scores into the weighted rule score |
| `ml_model.py` | Load-safe wrapper around a trained scikit-learn regressor |
| `train.py` | Training pipeline (ships with a synthetic data generator — **swap for real historical outcomes in production**) |
| `hybrid.py` | Blends rule score + ML score, classifies status, builds the reason |
| `reason_generator.py` | Builds the top-N-factor human-readable reason string |
| `service.py` | Framework-agnostic entry point: `predict_congestion(payload: dict) -> dict` |
| `api.py` | Optional FastAPI router example (not imported by default — no hard web-framework dependency) |
| `artifacts/congestion_model.joblib` | Pre-trained demo model (synthetic data) so the hybrid path works out of the box |

## Usage

```python
from backend.ml.congestion_prediction import predict_congestion

result = predict_congestion({
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
})

print(result["score"])    # 45
print(result["status"])   # "yellow"
print(result["reason"])   # "3 doctors unavailable; Queue increased 35% vs typical for this time; ..."
```

## Input fields (`CongestionInput`)

| Field | Type | Notes |
|---|---|---|
| `department` | str | Unit/department identifier |
| `timestamp` | str (ISO 8601) | Snapshot time |
| `current_queue_length` | int | Patients currently waiting |
| `historical_avg_queue_length` | float | Typical queue for this hour/day-of-week |
| `patient_arrivals_last_hour` | int | New patients in the last hour |
| `historical_avg_arrivals_last_hour` | float | Typical arrivals for this hour/day-of-week |
| `admissions_last_hour` | int | Optional, informational |
| `discharges_last_hour` | int | Patients discharged in the last hour |
| `avg_wait_time_minutes` | float | Current average wait |
| `target_wait_time_minutes` | float | Defaults to 45 (see `config.DEFAULT_TARGET_WAIT_MINUTES`) |
| `doctors_on_duty` | int | Currently staffed |
| `doctors_required` | int | Required for current patient load |
| `doctors_unavailable` | int | On leave/sick/reassigned — surfaced directly in the reason string |
| `bed_occupancy_rate` | float 0–1, optional | Used as an ML feature |
| `recent_score_history` | list[float], optional | Reserved for future trend-based features |

## Retraining

```bash
python -m backend.ml.congestion_prediction.train
```

Replace `generate_synthetic_dataset()` in `train.py` with a loader over
real historical records once labeled outcome data is available (e.g. an
ops-team-assigned congestion score, or a proxy like realized wait time
N hours later, rescaled to 0–100). Feature order is fixed in
`ml_model.FEATURE_ORDER` — keep training and inference features aligned.

## Extending

- **New driver** (e.g. bed availability as its own pressure signal): add a
  `compute_x_subscore()` in `features.py`, wire it into `rules.py`'s
  `compute_rule_score`, add a weight in `config.RULE_WEIGHTS` (keep the
  weights summing to 1.0).
- **Retuning thresholds/weights**: edit `config.py` only, then update the
  table in `docs/business-rules.md` to match.
- **Trend-based features** (e.g. "queue growing for 3 consecutive
  readings"): `CongestionInput.recent_score_history` is reserved for this.
