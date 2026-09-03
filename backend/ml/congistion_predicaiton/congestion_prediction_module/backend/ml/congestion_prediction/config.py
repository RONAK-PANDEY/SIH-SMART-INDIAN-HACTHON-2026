"""
Configuration and tunable constants for the Hospital Congestion Score.

This module is the single source of truth for:
  - Score thresholds (green / yellow / red)
  - Rule weights used by the rule-based scorer
  - Saturation constants used to normalize raw metrics onto a 0-100 scale
  - The ML/rules blend factor

Keeping these in one place means `docs/business-rules.md` and the code
can never silently drift apart -- if you change a threshold or weight,
update it here and re-run `scripts/render_business_rules.py` (see bottom
of this file) or just update the doc table by hand to match.
"""
from dataclasses import dataclass


# ---------------------------------------------------------------------------
# Status thresholds
# ---------------------------------------------------------------------------
# Score bands are inclusive on both ends. They must be contiguous and cover
# the full 0-100 range: green -> [0, GREEN_MAX], yellow -> (GREEN_MAX, YELLOW_MAX],
# red -> (YELLOW_MAX, 100].
@dataclass(frozen=True)
class Thresholds:
    green_max: int = 39     # 0-39   -> green  (Normal)
    yellow_max: int = 69    # 40-69  -> yellow (Elevated)
    # 70-100 -> red (Critical)


THRESHOLDS = Thresholds()

STATUS_LABELS = {
    "green": "Normal",
    "yellow": "Elevated",
    "red": "Critical",
}

STATUS_COLORS_HEX = {
    "green": "#2E7D32",
    "yellow": "#F9A825",
    "red": "#C62828",
}


def classify_status(score: float) -> str:
    """Map a 0-100 congestion score to a green/yellow/red status."""
    score = round(score)
    if score <= THRESHOLDS.green_max:
        return "green"
    if score <= THRESHOLDS.yellow_max:
        return "yellow"
    return "red"


# ---------------------------------------------------------------------------
# Rule-based sub-score weights
# ---------------------------------------------------------------------------
# Must sum to 1.0. These express *relative* operational importance of each
# driver of congestion. Tune based on retrospective analysis of what best
# predicted real overcrowding events at a given site.
RULE_WEIGHTS = {
    "queue": 0.35,
    "staffing": 0.25,
    "wait_time": 0.25,
    "flow": 0.15,
}

assert abs(sum(RULE_WEIGHTS.values()) - 1.0) < 1e-9, "RULE_WEIGHTS must sum to 1.0"


# ---------------------------------------------------------------------------
# Saturation constants
# ---------------------------------------------------------------------------
# Each raw metric (a % change, a deficit, a ratio) is rescaled onto 0-100 by
# dividing by a "saturation" value -- the point past which we consider the
# metric maximally bad and clip further increases. These are the main knobs
# for tuning sensitivity without touching the scoring logic itself.
DEFAULT_TARGET_WAIT_MINUTES = 45.0

QUEUE_INCREASE_SATURATION_PCT = 100.0     # queue at 2x baseline => sub-score 100
STAFFING_DEFICIT_SATURATION_PCT = 60.0    # 60% short-staffed => sub-score 100
WAIT_OVERAGE_SATURATION_PCT = 150.0       # wait 150% over target => sub-score 100
ARRIVAL_SURGE_SATURATION_PCT = 100.0      # arrivals at 2x baseline => component 100
FLOW_IMBALANCE_SATURATION_RATIO = 2.0     # arrivals = 2x discharges => component 100

# ---------------------------------------------------------------------------
# ML / rules blend
# ---------------------------------------------------------------------------
# Final score = ML_BLEND_ALPHA * ml_score + (1 - ML_BLEND_ALPHA) * rule_score,
# but ONLY when a trained ML model is available. If unavailable, the system
# falls back to the pure rule-based score (alpha effectively 0) so the
# service degrades gracefully rather than failing.
ML_BLEND_ALPHA = 0.5

# ---------------------------------------------------------------------------
# Reason string generation
# ---------------------------------------------------------------------------
MAX_REASON_FACTORS = 3          # top-N contributing factors surfaced in the reason string
MIN_FACTOR_SCORE_TO_REPORT = 5  # ignore near-zero contributors when building the reason
