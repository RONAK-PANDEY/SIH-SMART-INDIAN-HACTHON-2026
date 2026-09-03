"""
High-level, framework-agnostic entry point for the congestion prediction
module. This is what the rest of the backend (API routes, batch jobs,
schedulers) should import -- not the internal rules/ml_model/hybrid
modules directly.

The predictor and ML model are loaded once at import time (module-level
singleton) so repeated calls don't reload the model artifact from disk.
"""
from typing import Dict, Any

from .schemas import CongestionInput, CongestionResult
from .hybrid import HybridCongestionPredictor

_predictor = HybridCongestionPredictor()


def predict_congestion(payload: Dict[str, Any]) -> Dict[str, Any]:
    """Computes a Hospital Congestion Score from a raw metrics payload.

    Args:
        payload: dict matching the CongestionInput fields, e.g.:
            {
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

    Returns:
        dict with keys: department, timestamp, score, status, status_label,
        reason, rule_score, ml_score, blend_alpha, sub_scores.
    """
    inp = CongestionInput.from_dict(payload)
    result = _predictor.predict(inp)
    return result.to_dict()


def predict_congestion_typed(inp: CongestionInput) -> CongestionResult:
    """Typed variant for internal callers that already have a CongestionInput."""
    return _predictor.predict(inp)


def reload_model() -> bool:
    """Re-reads the ML model artifact from disk (e.g. after a retrain).

    Returns True if a model was found and loaded, False if the predictor
    is now/still running in pure rule-based fallback mode.
    """
    global _predictor
    _predictor = HybridCongestionPredictor()
    return _predictor.ml_model.is_available
