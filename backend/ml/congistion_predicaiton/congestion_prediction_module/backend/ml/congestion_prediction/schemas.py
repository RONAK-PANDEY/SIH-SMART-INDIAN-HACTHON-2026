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
    discharges_last_hour: int = 0

    # --- Wait times -------------------------------------------------------------
    avg_wait_time_minutes: float = 0.0
    target_wait_time_minutes: float = config.DEFAULT_TARGET_WAIT_MINUTES

    # --- Doctor / staffing availability -----------------------------------------
    doctors_on_duty: int = 0
    doctors_required: int = 0
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
    weight: float     # contribution weight used in the rule-based blend
    detail: str       # human-readable metric, e.g. "Queue length up 34% vs typical"

    @property
    def contribution(self) -> float:
        """How much this driver contributes to the final rule score (0-100 scale)."""
        return self.score * self.weight

    def to_dict(self) -> Dict[str, Any]:
        return {
            "name": self.name,
            "score": round(self.score, 1),
            "weight": self.weight,
            "contribution": round(self.contribution, 1),
            "detail": self.detail,
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
        }
