"""
Referral rules engine.

Implements docs/business-rules.md rules 1-6 verbatim:

1. On triage completion (or triage upgrade), look up the required specialty
   for the diagnosed/suspected condition in the condition-to-specialty
   mapping table.
2. Check the destination facility's department registry for that specialty:
   is it `active`? Is at least one specialist `on-shift` for the current
   time?
3. If specialty is missing or unstaffed -> trigger referral prompt
   immediately, regardless of triage category.
4. If specialty is present and staffed, check required equipment/resource
   availability (Section 3.2). If unavailable or at zero capacity AND
   triage is URGENT/PRIORITY -> trigger referral prompt.
5. If none of the above apply -> no referral triggered; patient proceeds
   in-facility.
6. A referral trigger produces a recommended list of alternate facilities,
   ranked by: (a) has required specialty active + staffed, (b) has required
   equipment/capacity available, (c) shortest estimated transfer
   distance/time. Staff make the final referral decision; the system never
   auto-transfers a patient without staff confirmation.
"""

from __future__ import annotations

from datetime import datetime, timezone

from .data.condition_specialty_map import get_required_specialty
from .data.department_registry import is_specialty_active_and_staffed
from .data.equipment_registry import is_equipment_available
from .data.facilities import all_other_facilities, estimated_transfer_minutes, get_facility
from .models import FacilityRecommendation, TriageEvaluationRequest, TriagePriority


class UnmappedConditionError(Exception):
    """Raised when the condition is not present in the mapping table."""


class RuleEvaluationResult:
    def __init__(self, triggered: bool, reason: str, specialty: str,
                 recommendations: list[FacilityRecommendation]):
        self.triggered = triggered
        self.reason = reason
        self.specialty = specialty
        self.recommendations = recommendations


def _build_recommendations(exclude_facility_id: str, specialty: str, now: datetime) -> list[FacilityRecommendation]:
    """Rule 6: rank alternate facilities by
    (a) specialty active+staffed, (b) equipment available, (c) shortest ETA."""
    candidates: list[FacilityRecommendation] = []
    for fid in all_other_facilities(exclude_facility_id):
        facility = get_facility(fid)
        if not facility:
            continue
        active, staffed = is_specialty_active_and_staffed(fid, specialty, now)
        specialty_ok = active and staffed
        equipment_ok = is_equipment_available(fid, specialty) if specialty_ok else False
        eta = estimated_transfer_minutes(exclude_facility_id, fid)
        candidates.append(FacilityRecommendation(
            facility_id=fid,
            facility_name=facility["name"],
            specialty=specialty,
            has_specialty_active_and_staffed=specialty_ok,
            has_equipment_available=equipment_ok,
            estimated_transfer_minutes=eta,
            rank=0,  # set after sort
        ))

    # Sort: specialty staffed first (desc), then equipment available (desc),
    # then shortest transfer time (asc).
    candidates.sort(key=lambda c: (
        not c.has_specialty_active_and_staffed,
        not c.has_equipment_available,
        c.estimated_transfer_minutes,
    ))
    for i, c in enumerate(candidates, start=1):
        c.rank = i
    return candidates


def evaluate(request: TriageEvaluationRequest) -> RuleEvaluationResult:
    now = request.evaluated_at or datetime.now(timezone.utc)

    # Rule 1: look up required specialty for the condition.
    specialty = get_required_specialty(request.condition)
    if specialty is None:
        raise UnmappedConditionError(
            f"Condition '{request.condition}' is not present in the "
            f"condition-to-specialty mapping table."
        )

    # Rule 2: check destination facility's department registry.
    active, staffed = is_specialty_active_and_staffed(request.facility_id, specialty, now)

    # Rule 3: missing or unstaffed specialty -> trigger immediately,
    # regardless of triage category.
    if not active:
        reason = (
            f"Required specialty '{specialty}' is not active at facility "
            f"{request.facility_id}."
        )
        recs = _build_recommendations(request.facility_id, specialty, now)
        return RuleEvaluationResult(True, reason, specialty, recs)

    if not staffed:
        reason = (
            f"Required specialty '{specialty}' is active at facility "
            f"{request.facility_id} but no specialist is currently on-shift."
        )
        recs = _build_recommendations(request.facility_id, specialty, now)
        return RuleEvaluationResult(True, reason, specialty, recs)

    # Rule 4: specialty present and staffed -> check equipment/resources.
    equipment_ok = is_equipment_available(request.facility_id, specialty)
    if not equipment_ok and request.triage_priority in (TriagePriority.URGENT, TriagePriority.PRIORITY):
        reason = (
            f"Required equipment/resources for '{specialty}' are unavailable "
            f"or at zero capacity at facility {request.facility_id}, and "
            f"triage priority is {request.triage_priority.value}."
        )
        recs = _build_recommendations(request.facility_id, specialty, now)
        return RuleEvaluationResult(True, reason, specialty, recs)

    # Rule 5: none of the above apply -> no referral triggered.
    reason = (
        f"Specialty '{specialty}' is active and staffed at facility "
        f"{request.facility_id}"
        + ("" if equipment_ok else ", and equipment shortage does not "
                                    "meet the URGENT/PRIORITY trigger threshold")
        + ". Patient proceeds in-facility."
    )
    return RuleEvaluationResult(False, reason, specialty, [])
