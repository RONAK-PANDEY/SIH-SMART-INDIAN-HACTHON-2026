"""
Rule-based congestion scorer.

Combines the four interpretable sub-scores (queue, staffing, wait_time,
flow) into a single weighted 0-100 "rule score". This score is always
computed -- even when the ML model is available -- because:

  1. It is the fallback when the ML model is missing/unavailable.
  2. Its sub-scores are the basis for the human-readable reason string,
     which the ML model alone cannot provide.
"""
from typing import Tuple, List, Dict

from . import config
from .schemas import CongestionInput, SubScore
from . import features


def compute_rule_score(inp: CongestionInput) -> Tuple[float, List[SubScore], Dict[str, float]]:
    """Returns (rule_score, sub_scores, raw_metrics).

    raw_metrics carries the underlying raw values (percent changes, ratios)
    so the ML model can reuse them as features without recomputation.
    """
    queue_score, queue_detail, queue_pct = features.compute_queue_subscore(inp)
    staffing_score, staffing_detail, staffing_deficit_pct = features.compute_staffing_subscore(inp)
    wait_score, wait_detail, wait_overage_pct = features.compute_wait_subscore(inp)
    flow_score, flow_detail, flow_ratio = features.compute_flow_subscore(inp)

    weights = config.RULE_WEIGHTS
    sub_scores = [
        SubScore("queue", queue_score, weights["queue"], queue_detail),
        SubScore("staffing", staffing_score, weights["staffing"], staffing_detail),
        SubScore("wait_time", wait_score, weights["wait_time"], wait_detail),
        SubScore("flow", flow_score, weights["flow"], flow_detail),
    ]

    rule_score = sum(s.score * s.weight for s in sub_scores)

    raw_metrics = {
        "queue_pct_change": queue_pct,
        "staffing_deficit_pct": staffing_deficit_pct,
        "wait_overage_pct": wait_overage_pct,
        "arrival_discharge_ratio": flow_ratio,
    }

    return rule_score, sub_scores, raw_metrics
