"""
Per-facility tunable configuration (docs/business-rules.md Section 5).

All thresholds referenced by the queue algorithm must be configurable
per facility rather than hardcoded. This dataclass is the in-memory
representation of a facility's row in the configuration table; callers
are expected to load values from persistent per-facility storage and
construct one of these per facility (or per queue), never share a
single global instance across facilities with different tuning needs.
"""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class QueueEngineConfig:
    facility_id: str = "default"

    # Section 1.4 anti-starvation constants.
    normal_aging_interval_minutes: float = 10.0
    normal_priority_slot_ratio: int = 4
    normal_max_wait_minutes: float = 120.0

    # Section 2.4: starting wait-time score for a NORMAL-queued patient
    # whose triage result was PRIORITY (elevates them within the NORMAL
    # band so they reach the anti-starvation slot faster).
    priority_starting_wait_score: float = 6.0

    def __post_init__(self):
        if self.normal_aging_interval_minutes <= 0:
            raise ValueError("normal_aging_interval_minutes must be > 0")
        if self.normal_priority_slot_ratio <= 0:
            raise ValueError("normal_priority_slot_ratio must be > 0")
        if self.normal_max_wait_minutes <= 0:
            raise ValueError("normal_max_wait_minutes must be > 0")
