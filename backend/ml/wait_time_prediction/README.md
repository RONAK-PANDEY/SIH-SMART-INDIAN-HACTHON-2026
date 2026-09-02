# wait_time_prediction

Predicts outpatient `predicted_waiting_time` (minutes) from live queue
conditions using a Random Forest regressor.

## Files

| File | Purpose |
|---|---|
| `generate_synthetic_data.py` | Builds `data/synthetic_wait_times.csv` (8,000 rows) with a noisy, queueing-theory-inspired ground truth. |
| `features.py` | Single source of truth for feature names / categories, shared by training and inference so they can't drift apart. |
| `train.py` | Builds a `ColumnTransformer` + `RandomForestRegressor` pipeline, trains, evaluates on a held-out split, logs feature importances, saves artifacts to `model/`. |
| `predict.py` | Loads the saved pipeline and exposes `predict()` + a `WaitTimeRequest` pydantic schema, ready to import into FastAPI. |
| `fastapi_app.py` | Minimal runnable FastAPI app (`/predict`, `/health`) wiring `predict()` to a route. |
| `model/model.joblib` | Saved trained pipeline (preprocessing + regressor bundled together). |
| `model/metrics.json` | Held-out test-set MAE / RMSE / R². |
| `model/feature_importances.json` | Full sorted feature importances. |

## Features -> target

Input: `queue_length`, `doctors_available`, `average_consultation_time`,
`patients_per_hour`, `priority_cases`, `department`, `hour`, `day`.

Target: `predicted_waiting_time` (minutes).

`department` and `day` are one-hot encoded with a fixed vocabulary (see
`features.py`) so inference is stable even if a batch never sees every
category. Numeric features pass straight through — Random Forests don't
need scaling.

## Usage

```bash
# 1. (Re)generate the synthetic dataset
python generate_synthetic_data.py

# 2. Train + save the model
python train.py

# 3. Try a prediction
python predict.py

# 4. Run the API locally
uvicorn fastapi_app:app --reload --port 8001
curl -X POST http://localhost:8001/predict -H "Content-Type: application/json" -d '{
  "queue_length": 12, "doctors_available": 2, "average_consultation_time": 14.0,
  "patients_per_hour": 9.5, "priority_cases": 2, "department": "Emergency",
  "hour": 17, "day": "Fri"
}'
```

## Latest run (held-out test set, 20% split, n=1600)

- MAE: ~6.5 minutes
- RMSE: ~8.6 minutes
- R²: ~0.97

Feature importances (descending): `doctors_available` > `queue_length` >
`average_consultation_time` >> `patients_per_hour` > `priority_cases` >
`hour` > department/day (each individually small — plausible, since the
synthetic ground truth is dominated by the queueing-theory core:
`queue_length * average_consultation_time / doctors_available`).

## Swapping in XGBoost

`train.py`'s `build_model()` has the XGBoost-equivalent constructor call
commented inline — swap it in and nothing else in the pipeline (feature
handling, saving, `predict.py`, `fastapi_app.py`) needs to change. It
wasn't installed in this environment, so Random Forest is the shipped
baseline; XGBoost is a drop-in upgrade once the package is available.

## Explainability

- `train.py` logs and saves full feature importances every run
  (`model/feature_importances.json`).
- `predict()` returns the top-N global feature importances alongside each
  prediction as context. Note these are *global* (model-level) importances,
  not a per-prediction attribution (e.g. SHAP) — if per-request attribution
  is needed later, `shap.TreeExplainer` drops in cleanly on this same
  pipeline.
