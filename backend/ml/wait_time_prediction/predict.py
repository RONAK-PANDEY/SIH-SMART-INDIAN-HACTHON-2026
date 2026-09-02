"""
predict.py

Small, FastAPI-ready inference module for the wait-time prediction model.

Usage as a library:

    from predict import predict, WaitTimeRequest

    result = predict(WaitTimeRequest(
        queue_length=10,
        doctors_available=2,
        average_consultation_time=12.5,
        patients_per_hour=8.0,
        priority_cases=1,
        department="Cardiology",
        hour=10,
        day="Mon",
    ))
    # result -> {"predicted_waiting_time": 47.3, "top_features": [...]}

Usage from FastAPI (see fastapi_app.py for a full example route):

    from fastapi import FastAPI
    from predict import predict, WaitTimeRequest

    app = FastAPI()

    @app.post("/predict")
    def predict_endpoint(payload: WaitTimeRequest):
        return predict(payload)
"""

from functools import lru_cache
from pathlib import Path
from typing import List, Optional

import joblib
import pandas as pd

try:
    from pydantic import BaseModel, Field

    _HAS_PYDANTIC = True
except ImportError:  # pydantic ships with FastAPI; degrade gracefully otherwise
    _HAS_PYDANTIC = False

    def Field(default=..., **kwargs):  # noqa: E731
        return default if default is not ... else None

    class BaseModel:  # minimal stand-in so this module still works standalone
        def __init__(self, **kwargs):
            for key, value in kwargs.items():
                setattr(self, key, value)

        def dict(self):
            return self.__dict__

from features import ALL_FEATURES, DAYS, DEPARTMENTS

THIS_DIR = Path(__file__).parent
MODEL_PATH = THIS_DIR / "model" / "model.joblib"


class WaitTimeRequest(BaseModel):
    """Request schema matching the model's feature columns exactly."""

    queue_length: int = Field(..., ge=0, description="Number of patients currently waiting")
    doctors_available: int = Field(..., ge=1, description="Doctors currently on duty")
    average_consultation_time: float = Field(..., gt=0, description="Avg minutes per consultation")
    patients_per_hour: float = Field(..., ge=0, description="Patient inflow rate")
    priority_cases: int = Field(..., ge=0, description="Number of urgent/priority cases in queue")
    department: str = Field(..., description=f"One of: {', '.join(DEPARTMENTS)}")
    hour: int = Field(..., ge=0, le=23, description="Hour of day, 0-23")
    day: str = Field(..., description=f"One of: {', '.join(DAYS)}")


class WaitTimeResponse(BaseModel):
    predicted_waiting_time: float
    top_features: List[dict]


@lru_cache(maxsize=1)
def _load_pipeline():
    """Loads (and caches) the trained sklearn Pipeline (preprocessor + model)."""
    if not MODEL_PATH.exists():
        raise FileNotFoundError(
            f"No trained model found at {MODEL_PATH}. Run `python train.py` first."
        )
    return joblib.load(MODEL_PATH)


def _get_feature_names(preprocessor) -> List[str]:
    cat_encoder = preprocessor.named_transformers_["cat"]
    cat_names = list(cat_encoder.get_feature_names_out(["department", "day"]))
    from features import NUMERIC_FEATURES

    return NUMERIC_FEATURES + cat_names


def predict(request: "WaitTimeRequest | dict", top_n: int = 5) -> dict:
    """
    Run inference for a single request.

    Args:
        request: WaitTimeRequest instance, or a plain dict with the same keys.
        top_n: how many top global feature importances to include for
            explainability context (these are the model's global importances,
            not a per-prediction attribution -- see note below).

    Returns:
        dict with `predicted_waiting_time` (float, minutes) and
        `top_features` (list of {feature, importance} for context).
    """
    pipeline = _load_pipeline()

    if isinstance(request, dict):
        row = request
    else:
        row = request.dict() if hasattr(request, "dict") else vars(request)

    missing = set(ALL_FEATURES) - set(row.keys())
    if missing:
        raise ValueError(f"Missing required features: {missing}")

    X = pd.DataFrame([{k: row[k] for k in ALL_FEATURES}])
    prediction = float(pipeline.predict(X)[0])

    regressor = pipeline.named_steps["regressor"]
    feature_names = _get_feature_names(pipeline.named_steps["preprocessor"])
    importances = regressor.feature_importances_
    top_features = sorted(
        zip(feature_names, importances), key=lambda p: p[1], reverse=True
    )[:top_n]

    return {
        "predicted_waiting_time": round(prediction, 1),
        "top_features": [
            {"feature": name, "importance": round(float(imp), 4)}
            for name, imp in top_features
        ],
    }


if __name__ == "__main__":
    # Quick manual smoke test
    sample = WaitTimeRequest(
        queue_length=12,
        doctors_available=2,
        average_consultation_time=14.0,
        patients_per_hour=9.5,
        priority_cases=2,
        department="Emergency",
        hour=17,
        day="Fri",
    )
    print(predict(sample))
