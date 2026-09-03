"""
Hybrid rules+ML congestion predictor.

Pipeline:
  1. Always compute the rule-based score + interpretable sub-scores.
  2. If a trained ML model is available, compute an ML score from the
     same underlying raw metrics.
  3. Blend: final = alpha * ml_score + (1 - alpha) * rule_score.
     If the ML model is unavailable, alpha is forced to 0 (pure rules),
     so the service degrades gracefully rather than failing.
  4. Classify the final score into green/yellow/red.
  5. Build a human-readable reason string from the rule sub-scores.
"""
from typing import Optional

from . import config
from .schemas import CongestionInput, CongestionResult
from .rules import compute_rule_score
from .reason_generator import build_reason
from .ml_model import CongestionMLModel


class HybridCongestionPredictor:
    def __init__(self, ml_model: Optional[CongestionMLModel] = None, blend_alpha: float = None):
        self.ml_model = ml_model if ml_model is not None else CongestionMLModel()
        self.blend_alpha = config.ML_BLEND_ALPHA if blend_alpha is None else blend_alpha

    def predict(self, inp: CongestionInput) -> CongestionResult:
        rule_score, sub_scores, raw_metrics = compute_rule_score(inp)

        ml_score = self.ml_model.predict(raw_metrics, inp.bed_occupancy_rate)

        if ml_score is not None:
            alpha = self.blend_alpha
            final_score = alpha * ml_score + (1 - alpha) * rule_score
        else:
            alpha = 0.0
            final_score = rule_score

        final_score = max(0.0, min(100.0, final_score))
        status = config.classify_status(final_score)
        reason = build_reason(sub_scores)

        return CongestionResult(
            department=inp.department,
            timestamp=inp.timestamp,
            score=round(final_score),
            status=status,
            status_label=config.STATUS_LABELS[status],
            reason=reason,
            rule_score=rule_score,
            ml_score=ml_score,
            blend_alpha=alpha,
            sub_scores=sub_scores,
        )
