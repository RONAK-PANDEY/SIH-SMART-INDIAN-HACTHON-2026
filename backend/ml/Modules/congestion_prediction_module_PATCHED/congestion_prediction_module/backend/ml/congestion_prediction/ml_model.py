"""
ML component of the hybrid congestion predictor.

Wraps a scikit-learn regressor trained to predict a 0-100 congestion
outcome from engineered features. Designed to fail *soft*: if no trained
model artifact exists (or it fails to load), `is_available` is False and
the hybrid predictor transparently falls back to the rule-based score.

Feature vector order is fixed by FEATURE_ORDER so training and inference
never drift apart.
"""
import os
from typing import Optional, Dict

import numpy as np

FEATURE_ORDER = [
    "queue_pct_change",
    "staffing_deficit_pct",
    "wait_overage_pct",
    "arrival_discharge_ratio",
    "bed_occupancy_rate",
]

DEFAULT_MODEL_PATH = os.path.join(os.path.dirname(__file__), "artifacts", "congestion_model.joblib")


def _get_or_default(raw_metrics: Dict[str, float], key: str, default: float) -> float:
    """Like dict.get, but also falls back to `default` when the value is
    present but None -- which now happens for drivers whose underlying
    input (e.g. staffing, wait time) wasn't reported (see features.py).
    These are neutral fill-in values for the ML model only; they never
    feed the rule-based score or the reason string, which correctly
    exclude unavailable drivers instead of guessing a value for them."""
    value = raw_metrics.get(key)
    return default if value is None else value


def featurize(raw_metrics: Dict[str, float], bed_occupancy_rate: Optional[float]) -> np.ndarray:
    """Builds the fixed-order feature vector expected by the model."""
    row = [
        _get_or_default(raw_metrics, "queue_pct_change", 0.0),
        _get_or_default(raw_metrics, "staffing_deficit_pct", 0.0),
        _get_or_default(raw_metrics, "wait_overage_pct", 0.0),
        _get_or_default(raw_metrics, "arrival_discharge_ratio", 1.0),
        bed_occupancy_rate if bed_occupancy_rate is not None else 0.5,
    ]
    return np.array([row], dtype=float)


class CongestionMLModel:
    """Thin, load-safe wrapper around a trained regressor."""

    def __init__(self, model_path: str = DEFAULT_MODEL_PATH):
        self.model_path = model_path
        self.model = None
        self._try_load()

    def _try_load(self) -> None:
        if not os.path.exists(self.model_path):
            self.model = None
            return
        try:
            import joblib  # imported lazily so the module works without it installed
            self.model = joblib.load(self.model_path)
        except Exception:
            # Never let a corrupt/incompatible artifact take the service down.
            self.model = None

    @property
    def is_available(self) -> bool:
        return self.model is not None

    def predict(self, raw_metrics: Dict[str, float], bed_occupancy_rate: Optional[float]) -> Optional[float]:
        if not self.is_available:
            return None
        try:
            X = featurize(raw_metrics, bed_occupancy_rate)
            pred = self.model.predict(X)[0]
            return float(np.clip(pred, 0.0, 100.0))
        except Exception:
            # A prediction-time failure should degrade to rules, not crash the request.
            return None

    def save(self, model, model_path: Optional[str] = None) -> str:
        import joblib
        path = model_path or self.model_path
        os.makedirs(os.path.dirname(path), exist_ok=True)
        joblib.dump(model, path)
        self.model = model
        self.model_path = path
        return path
