"""
Data contracts for the congestion prediction module.

Plain dataclasses are used (rather than pydantic) to keep this module
dependency-light and easy to drop into any backend framework. If your
service already uses pydantic/FastAPI, `CongestionInput.from_dict` /
`CongestionResult.to_dict` make it trivial to wrap these in pydantic
models at the API boundary (see api.py for an example).
"""
from dataclasses import dataclass, field, asdict
from typing import Optional, List, Dict, Any

from . import config


@dataclass
class CongestionInput:
    """Raw snapshot of a department/unit at a point in time."""

    department: str
    timestamp: str  # ISO 8601 string, e.g. "2026-09-02T14:30:00Z"

    # --- Queue / patient flow -------------------------------------------------
    current_queue_length: int
    historical_avg_queue_length: float          # typical queue for this hour/day-of-week
    patient_arrivals_last_hour: int
    historical_avg_arrivals_last_hour: float
    admissions_last_hour: int = 0
    discharges_last_hour: Optional[int] = None  # None = not reported (see features.py)

    # --- Wait times -------------------------------------------------------------
    # None (not 0.0) means "not reported". A real 0-minute wait is possible
    # (empty department) but is rare enough that treating an *unset* value
    # as "0 minutes, well within target" would fabricate a reassuring
    # reading from missing data. See features.compute_wait_subscore.
    avg_wait_time_minutes: Optional[float] = None
    target_wait_time_minutes: float = config.DEFAULT_TARGET_WAIT_MINUTES

    # --- Doctor / staffing availability -----------------------------------------
    # None (not 0) means "not reported". Defaulting an unset value to 0 would
    # silently read as "zero doctors on duty" -- the worst possible staffing
    # reading -- rather than "we don't know". See features.compute_staffing_subscore.
    doctors_on_duty: Optional[int] = None
    doctors_required: Optional[int] = None
    doctors_unavailable: int = 0  # on leave / sick / reassigned - used for reason text

    # --- Optional extra context ---------------------------------------------------
    bed_occupancy_rate: Optional[float] = None       # 0.0 - 1.0
    recent_score_history: Optional[List[float]] = None  # most recent last

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "CongestionInput":
        known = {f for f in cls.__dataclass_fields__}
        return cls(**{k: v for k, v in data.items() if k in known})

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class SubScore:
    """A single interpretable driver of the composite score."""

    name: str        # "queue" | "staffing" | "wait_time" | "flow"
    score: float      # 0-100, this driver's own severity
    weight: float     # weight this driver WOULD carry if all drivers are available
    detail: str       # human-readable metric, e.g. "Queue length up 34% vs typical"

    # False when the underlying input data wasn't provided. An unavailable
    # sub-score is excluded from the weighted rule score (weights are
    # renormalized across the remaining available sub-scores) and is never
    # used to imply "this dimension is fine" or "this dimension is critical" --
    # see rules.compute_rule_score and features.py.
    available: bool = True

    @property
    def contribution(self) -> float:
        """How much this driver contributes to the final rule score (0-100 scale).
        0 for unavailable drivers -- they don't contribute at all, rather than
        contributing a fabricated reading."""
        if not self.available:
            return 0.0
        return self.score * self.weight

    def to_dict(self) -> Dict[str, Any]:
        return {
            "name": self.name,
            "score": round(self.score, 1) if self.available else None,
            "weight": self.weight,
            "contribution": round(self.contribution, 1),
            "detail": self.detail,
            "available": self.available,
        }


@dataclass
class CongestionResult:
    """Output of the hybrid congestion predictor."""

    department: str
    timestamp: str
    score: int                       # final 0-100 congestion score
    status: str                       # "green" | "yellow" | "red"
    status_label: str                 # "Normal" | "Elevated" | "Critical"
    reason: str                       # human-readable summary of top drivers
    rule_score: float
    ml_score: Optional[float]
    blend_alpha: float                # actual alpha used (0 if ML unavailable)
    sub_scores: List[SubScore] = field(default_factory=list)

    @property
    def missing_inputs(self) -> List[str]:
        """Names of drivers that could not be scored because their inputs
        weren't provided. Non-empty means the score is based on partial
        data -- surface this in any UI/dashboard, not just the reason text."""
        return [s.name for s in self.sub_scores if not s.available]

    def to_dict(self) -> Dict[str, Any]:
        return {
            "department": self.department,
            "timestamp": self.timestamp,
            "score": self.score,
            "status": self.status,
            "status_label": self.status_label,
            "reason": self.reason,
            "rule_score": round(self.rule_score, 1),
            "ml_score": round(self.ml_score, 1) if self.ml_score is not None else None,
            "blend_alpha": self.blend_alpha,
            "sub_scores": [s.to_dict() for s in self.sub_scores],
            "missing_inputs": self.missing_inputs,
        }
