"""
Core data models for the queue engine.

Implements the category set and staff-verified assignment model from
docs/business-rules.md Section 1 (Priority Queue Algorithm) and the
triage -> priority-category mapping from Section 2.4.
"""

from __future__ import annotations

import itertools
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from typing import Dict, Optional


class PriorityCategory(str, Enum):
    """Section 1.1 categories, ranked highest to lowest."""

    EMERGENCY = "EMERGENCY"
    CRITICAL = "CRITICAL"
    SENIOR = "SENIOR"
    PWD = "PWD"
    NORMAL = "NORMAL"
    # Not a queue-visible category: patients sit here until a staff member
    # performs the separate assignment action (Section 1.2). They are not
    # part of live queue order until moved out of UNASSIGNED.
    UNASSIGNED = "UNASSIGNED"


# Rank used for step 4 of the dispatch algorithm (Section 1.4):
# "dispatch in category rank order (CRITICAL > SENIOR > PWD > NORMAL)".
# EMERGENCY is not looked up here -- it is handled unconditionally in
# step 1 of the dispatch algorithm before this table is ever consulted.
CATEGORY_DISPATCH_RANK: Dict[PriorityCategory, int] = {
    PriorityCategory.EMERGENCY: 0,
    PriorityCategory.CRITICAL: 1,
    PriorityCategory.SENIOR: 2,
    PriorityCategory.PWD: 3,
    PriorityCategory.NORMAL: 4,
}


class TriageResult(str, Enum):
    """Section 2 triage risk categories."""

    URGENT = "URGENT"
    PRIORITY = "PRIORITY"
    ROUTINE = "ROUTINE"


class VerificationMethod(str, Enum):
    """How a staff member verified eligibility for a category (Section 1.2)."""

    CLINICAL_TRIAGE = "CLINICAL_TRIAGE"          # EMERGENCY / CRITICAL
    GOVERNMENT_ID = "GOVERNMENT_ID"               # SENIOR
    PATIENT_RECORD = "PATIENT_RECORD"             # SENIOR
    PWD_ID_CARD = "PWD_ID_CARD"                   # PWD
    DISABILITY_CERTIFICATE = "DISABILITY_CERTIFICATE"  # PWD
    PROVISIONAL_VISIBLE_DISABILITY = "PROVISIONAL_VISIBLE_DISABILITY"  # PWD, provisional
    DEFAULT_UNQUALIFIED = "DEFAULT_UNQUALIFIED"   # NORMAL


# Monotonic tie-breaker so two patients enqueued in the same microsecond
# still have a strict, stable arrival order.
_seq_counter = itertools.count()


@dataclass
class AssignmentLogEntry:
    """
    Immutable, append-only audit record for every category assignment or
    re-assignment action (Section 1.2, final two bullets).
    """

    staff_id: str
    timestamp: datetime
    category_assigned: PriorityCategory
    verification_method: VerificationMethod
    patient_id: str
    reason: Optional[str] = None  # required for re-assignments
    provisional: bool = False     # True for the "provisional - no ID presented" PWD case
    id_last4: Optional[str] = None  # last 4 digits/number of the verifying ID, if applicable


@dataclass
class Patient:
    patient_id: str
    category: PriorityCategory
    check_in_time: datetime

    # Wait-time score bookkeeping for NORMAL-category anti-starvation
    # (Section 1.4 / 2.4). Meaningless for non-NORMAL categories.
    #
    # base_wait_score: the score the patient starts at when placed into
    # NORMAL. Per Section 2.4, ROUTINE-triaged patients start at 0;
    # PRIORITY-triaged patients start at `priority_starting_wait_score`
    # (default 6), so they reach the anti-starvation slot sooner.
    base_wait_score: float = 0.0

    triage_result: Optional[TriageResult] = None

    # Free-form metadata (name, chief complaint, DOB, etc.) -- not used
    # for ordering, just carried along.
    metadata: dict = field(default_factory=dict)

    # Internal bookkeeping.
    _seq: int = field(default=None, init=False, repr=False)

    def __post_init__(self):
        if self._seq is None:
            object.__setattr__(self, "_seq", next(_seq_counter))

    def wait_minutes(self, now: datetime) -> float:
        return (now - self.check_in_time).total_seconds() / 60.0

    def wait_score(self, now: datetime, aging_interval_minutes: float) -> float:
        """
        Section 1.4: "Each NORMAL patient accrues a wait-time score
        starting at [base_wait_score], incrementing by 1 point for every
        [aging_interval_minutes] minutes waited."
        """
        elapsed = self.wait_minutes(now)
        import math

        return self.base_wait_score + math.floor(elapsed / aging_interval_minutes)
