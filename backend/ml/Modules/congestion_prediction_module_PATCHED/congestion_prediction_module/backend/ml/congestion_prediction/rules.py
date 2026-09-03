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

    Missing-data handling: any driver whose required inputs weren't
    supplied (SubScore.available == False) is EXCLUDED from the weighted
    sum, and the remaining drivers' weights are renormalized to sum to 1.
    This means a reading built from partial data is scored purely on what
    was actually reported, rather than having missing fields silently
    default to "no pressure" or "maximum pressure" and skew the result.
    If nothing at all is available, rule_score is 0.0 with every driver
    flagged unavailable -- callers should treat that as "no data", not
    "no congestion" (check CongestionResult.missing_inputs).
    """
    queue_score, queue_detail, queue_pct, queue_available = features.compute_queue_subscore(inp)
    staffing_score, staffing_detail, staffing_deficit_pct, staffing_available = features.compute_staffing_subscore(inp)
    wait_score, wait_detail, wait_overage_pct, wait_available = features.compute_wait_subscore(inp)
    flow_score, flow_detail, flow_ratio, flow_available = features.compute_flow_subscore(inp)

    weights = config.RULE_WEIGHTS
    sub_scores = [
        SubScore("queue", queue_score, weights["queue"], queue_detail, queue_available),
        SubScore("staffing", staffing_score, weights["staffing"], staffing_detail, staffing_available),
        SubScore("wait_time", wait_score, weights["wait_time"], wait_detail, wait_available),
        SubScore("flow", flow_score, weights["flow"], flow_detail, flow_available),
    ]

    available = [s for s in sub_scores if s.available]
    total_available_weight = sum(s.weight for s in available)
    if total_available_weight > 0:
        rule_score = sum(s.score * s.weight for s in available) / total_available_weight
    else:
        rule_score = 0.0  # no data at all -- see docstring; caller must check missing_inputs

    raw_metrics = {
        "queue_pct_change": queue_pct,
        "staffing_deficit_pct": staffing_deficit_pct,
        "wait_overage_pct": wait_overage_pct,
        "arrival_discharge_ratio": flow_ratio,
    }

    return rule_score, sub_scores, raw_metrics
