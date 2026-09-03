"""
Builds a short, human-readable explanation of *why* a congestion score
came out the way it did, e.g.:

    "Queue increased 34%; 3 doctors unavailable; waiting time 52 min
     exceeds 45 min target"

The reason string always reflects the rule-based sub-scores (not the raw
ML score), since those are the interpretable drivers. This keeps the
explanation stable and meaningful even when the ML component is blended
in or swapped out.
"""
from typing import List

from . import config
from .schemas import SubScore


def build_reason(sub_scores: List[SubScore], max_factors: int = None) -> str:
    max_factors = max_factors or config.MAX_REASON_FACTORS

    available = [s for s in sub_scores if s.available]
    unavailable = [s for s in sub_scores if not s.available]

    # Rank by contribution to the final score (score * weight), not raw
    # score alone, so a high-weight moderate issue can outrank a
    # low-weight extreme one -- matching what actually drives the number.
    significant = [s for s in available if s.score >= config.MIN_FACTOR_SCORE_TO_REPORT]
    ranked = sorted(significant, key=lambda s: s.contribution, reverse=True)
    top = ranked[:max_factors]

    if top:
        reason = "; ".join(s.detail for s in top)
    elif available:
        reason = "No significant congestion drivers detected; metrics are near typical levels."
    else:
        reason = "Not enough data to assess congestion."

    # Always disclose partial data, even when the available drivers alone
    # look calm or paint a clear picture -- a score built on 2 of 4 drivers
    # should never read identically to one built on all 4.
    if unavailable:
        names = ", ".join(s.name.replace("_", " ") for s in unavailable)
        reason += f" (no data for: {names})"

    return reason
