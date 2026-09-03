"""
Queue engine package: priority-aware patient queue management per
docs/business-rules.md Section 1.
"""

from .config import QueueEngineConfig
from .engine import (
    InvalidAssignmentError,
    PatientNotFoundError,
    QueueEngine,
    QueueEngineError,
    resolve_priority_category,
)
from .models import (
    AssignmentLogEntry,
    CATEGORY_DISPATCH_RANK,
    Patient,
    PriorityCategory,
    TriageResult,
    VerificationMethod,
)

__all__ = [
    "QueueEngine",
    "QueueEngineConfig",
    "QueueEngineError",
    "PatientNotFoundError",
    "InvalidAssignmentError",
    "resolve_priority_category",
    "Patient",
    "PriorityCategory",
    "TriageResult",
    "VerificationMethod",
    "AssignmentLogEntry",
    "CATEGORY_DISPATCH_RANK",
]
