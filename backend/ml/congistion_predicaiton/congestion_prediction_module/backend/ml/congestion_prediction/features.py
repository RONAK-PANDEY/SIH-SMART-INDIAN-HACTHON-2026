"""
Feature engineering: converts raw operational metrics into normalized
0-100 sub-scores, each paired with a human-readable "detail" string and
a raw metric value (used both for the reason string and as ML features).

Every function here is pure and independently unit-testable.
"""
from typing import Tuple

from . import config
from .schemas import CongestionInput


def clip(x: float, lo: float = 0.0, hi: float = 100.0) -> float:
    return max(lo, min(hi, x))


def pct_change(current: float, baseline: float) -> float:
    """Percent change of `current` relative to `baseline`.

    Handles the zero-baseline edge case explicitly:
      - baseline <= 0 and current <= 0  -> 0% (nothing happening)
      - baseline <= 0 and current > 0   -> +100% (treated as maximal increase,
        since any ratio is technically undefined/infinite)
    """
    if baseline <= 0:
        return 100.0 if current > 0 else 0.0
    return (current - baseline) / baseline * 100.0


# ---------------------------------------------------------------------------
# Queue pressure
# ---------------------------------------------------------------------------
def compute_queue_subscore(inp: CongestionInput) -> Tuple[float, str, float]:
    pct = pct_change(inp.current_queue_length, inp.historical_avg_queue_length)
    score = clip(pct / config.QUEUE_INCREASE_SATURATION_PCT * 100)

    if pct >= 1:
        detail = f"Queue increased {pct:.0f}% vs typical for this time"
    elif pct <= -1:
        detail = f"Queue is {abs(pct):.0f}% below typical for this time"
    else:
        detail = "Queue length is in line with typical levels"

    return score, detail, pct


# ---------------------------------------------------------------------------
# Staffing pressure
# ---------------------------------------------------------------------------
def compute_staffing_subscore(inp: CongestionInput) -> Tuple[float, str, float]:
    required = max(inp.doctors_required, 1)
    deficit = required - inp.doctors_on_duty
    deficit_pct = deficit / required * 100.0
    score = clip(deficit_pct / config.STAFFING_DEFICIT_SATURATION_PCT * 100)

    if inp.doctors_unavailable > 0:
        plural = "s" if inp.doctors_unavailable != 1 else ""
        detail = f"{inp.doctors_unavailable} doctor{plural} unavailable"
    elif deficit > 0:
        plural = "s" if deficit != 1 else ""
        detail = f"Short {deficit} doctor{plural} vs required staffing level"
    else:
        detail = "Staffing levels meet requirements"

    return score, detail, deficit_pct


# ---------------------------------------------------------------------------
# Wait time pressure
# ---------------------------------------------------------------------------
def compute_wait_subscore(inp: CongestionInput) -> Tuple[float, str, float]:
    target = inp.target_wait_time_minutes or config.DEFAULT_TARGET_WAIT_MINUTES
    overage_pct = pct_change(inp.avg_wait_time_minutes, target)
    score = clip(overage_pct / config.WAIT_OVERAGE_SATURATION_PCT * 100) if overage_pct > 0 else 0.0

    if inp.avg_wait_time_minutes > target:
        detail = f"Waiting time {inp.avg_wait_time_minutes:.0f} min exceeds {target:.0f} min target"
    else:
        detail = f"Waiting time {inp.avg_wait_time_minutes:.0f} min within {target:.0f} min target"

    return score, detail, overage_pct


# ---------------------------------------------------------------------------
# Patient flow pressure (arrivals surging and/or outpacing discharges)
# ---------------------------------------------------------------------------
def compute_flow_subscore(inp: CongestionInput) -> Tuple[float, str, float]:
    arrivals = max(inp.patient_arrivals_last_hour, 0)
    discharges = max(inp.discharges_last_hour, 0)

    arrival_pct = pct_change(arrivals, inp.historical_avg_arrivals_last_hour)
    arrival_component = clip(arrival_pct / config.ARRIVAL_SURGE_SATURATION_PCT * 100) if arrival_pct > 0 else 0.0

    ratio = arrivals / discharges if discharges > 0 else (2.0 if arrivals > 0 else 1.0)
    imbalance_component = 0.0
    if ratio > 1:
        span = config.FLOW_IMBALANCE_SATURATION_RATIO - 1
        imbalance_component = clip((ratio - 1) / span * 100) if span > 0 else 100.0

    score = clip((arrival_component + imbalance_component) / 2.0)

    if arrival_component >= imbalance_component and arrival_pct > 1:
        detail = f"Patient arrivals up {arrival_pct:.0f}% vs typical"
    elif ratio > 1.05:
        detail = f"Admissions outpacing discharges ({arrivals} in vs {discharges} out this hour)"
    else:
        detail = "Patient inflow/outflow is balanced"

    return score, detail, ratio
