"""
Optional helper: maps a triage risk category to the priority-queue
category and starting wait-time score, per business-rules.md Section 2.4.

Not part of the core classify_triage() contract (that module only owns
ROUTINE/PRIORITY/URGENT triage classification), but exposed separately
since downstream queueing code will need exactly this mapping and
business-rules.md defines it right next to the triage criteria.

Per business-rules.md 2.4:
- URGENT   -> EMERGENCY or CRITICAL (a clinician chooses based on
              immediacy; this function cannot make that call and returns
              None for the queue category, surfacing that it needs a
              clinical decision — see docstring on `map_to_queue`)
- PRIORITY -> NORMAL band, wait-time score starts at 6 (not 0)
- ROUTINE  -> NORMAL band, wait-time score starts at 0

SENIOR/PWD assignment is independent of triage outcome and out of scope
here (business-rules.md 1.2) — this function only covers the triage ->
queue-category mapping.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Optional

from .config import FacilityTriageConfig, DEFAULT_CONFIG
from .schema import RiskCategory


@dataclass(frozen=True)
class QueueMappingResult:
    queue_category: Optional[str]  # "EMERGENCY" | "CRITICAL" | "NORMAL" | None
    starting_wait_score: int
    requires_clinician_choice: bool
    note: str


def map_to_queue(
    triage_category: RiskCategory,
    config: FacilityTriageConfig = DEFAULT_CONFIG,
) -> QueueMappingResult:
    if triage_category == RiskCategory.URGENT:
        return QueueMappingResult(
            queue_category=None,
            starting_wait_score=0,
            requires_clinician_choice=True,
            note=(
                "business-rules.md 2.4: URGENT maps to EMERGENCY or CRITICAL "
                "based on clinical immediacy judgment (1.2) — not something "
                "this module decides automatically. A clinician must choose."
            ),
        )
    if triage_category == RiskCategory.PRIORITY:
        return QueueMappingResult(
            queue_category="NORMAL",
            starting_wait_score=6,  # business-rules.md priority_starting_wait_score
            requires_clinician_choice=False,
            note="Queued as NORMAL with a pre-aged wait-time score (2.4).",
        )
    return QueueMappingResult(
        queue_category="NORMAL",
        starting_wait_score=0,
        requires_clinician_choice=False,
        note="Queued as NORMAL, wait-time score starts at 0 (2.4).",
    )
