"""
Unit tests for rules_engine.evaluate(), covering the boundary cases in
docs/business-rules.md Section 3 (Referral Trigger Conditions).

Test data relies on the seed data in referral_service/data/*.py. Where a
specific boundary condition (e.g. "specialty staffed but equipment at zero
capacity") doesn't occur naturally in the seed data, the test patches the
registry directly via monkeypatch rather than hardcoding a fragile
data-dependent scenario, so these tests stay valid if the seed data changes.
"""
from __future__ import annotations

from datetime import datetime, timezone

import pytest

from referral_service.data import department_registry, equipment_registry
from referral_service.models import TriageEvaluationRequest, TriagePriority
from referral_service.rules_engine import UnmappedConditionError, evaluate

NOON = datetime(2026, 9, 2, 12, 0, tzinfo=timezone.utc)


def make_request(**overrides) -> TriageEvaluationRequest:
    defaults = dict(
        patient_id="P-TEST",
        facility_id="FAC-001",
        condition="stroke",
        triage_priority=TriagePriority.ROUTINE,
        evaluated_at=NOON,
    )
    defaults.update(overrides)
    return TriageEvaluationRequest(**defaults)


# ---------------------------------------------------------------------------
# Rule 3: missing/unstaffed specialty -> trigger regardless of triage
# ---------------------------------------------------------------------------

@pytest.mark.parametrize("priority", [TriagePriority.ROUTINE, TriagePriority.URGENT])
def test_inactive_specialty_triggers_regardless_of_triage(priority):
    # obstetrics is not active at FAC-001
    req = make_request(condition="obstetric hemorrhage", triage_priority=priority)
    result = evaluate(req)
    assert result.triggered is True
    assert "not active" in result.reason
    assert result.specialty == "obstetrics"


@pytest.mark.parametrize("priority", [TriagePriority.ROUTINE, TriagePriority.URGENT])
def test_active_but_unstaffed_specialty_triggers_regardless_of_triage(priority):
    # trauma_surgery at FAC-001 is active but has an empty staff roster
    req = make_request(condition="polytrauma", triage_priority=priority)
    result = evaluate(req)
    assert result.triggered is True
    assert "no specialist is currently on-shift" in result.reason
    assert result.specialty == "trauma_surgery"


def test_active_and_staffed_no_equipment_gap_does_not_trigger():
    # neurology at FAC-001 is active, staffed at noon (Dr. Chen 9-17),
    # and ct_scanner has capacity at FAC-001 -> no referral.
    req = make_request(condition="stroke", triage_priority=TriagePriority.URGENT)
    result = evaluate(req)
    assert result.triggered is False
    assert result.recommendations == []


def test_staff_off_shift_counts_as_unstaffed():
    # neurology staff (Dr. Chen) only works 9-17; at 2am the department is
    # active but nobody is on shift -> should trigger same as an empty roster.
    late_night = datetime(2026, 9, 2, 2, 0, tzinfo=timezone.utc)
    req = make_request(condition="stroke", triage_priority=TriagePriority.ROUTINE,
                        evaluated_at=late_night)
    result = evaluate(req)
    assert result.triggered is True
    assert "no specialist is currently on-shift" in result.reason


# ---------------------------------------------------------------------------
# Rule 4: equipment/capacity shortfall -> trigger only for URGENT/PRIORITY
# ---------------------------------------------------------------------------

@pytest.fixture
def zero_capacity_equipment(monkeypatch):
    """Force FAC-001's cardiology equipment (cath_lab) to zero capacity,
    while cardiology itself stays active + staffed, isolating the
    equipment-shortfall branch (Section 3.2 / 3.4 step 4)."""
    patched = dict(equipment_registry.EQUIPMENT_CAPACITY["FAC-001"])
    patched["cath_lab"] = 0
    monkeypatch.setitem(equipment_registry.EQUIPMENT_CAPACITY, "FAC-001", patched)
    yield


def test_equipment_shortfall_with_routine_triage_does_not_trigger(zero_capacity_equipment):
    req = make_request(condition="stemi", triage_priority=TriagePriority.ROUTINE)
    result = evaluate(req)
    assert result.triggered is False
    assert "does not meet the URGENT/PRIORITY trigger threshold" in result.reason


@pytest.mark.parametrize("priority", [TriagePriority.URGENT, TriagePriority.PRIORITY])
def test_equipment_shortfall_with_urgent_or_priority_triage_triggers(zero_capacity_equipment, priority):
    req = make_request(condition="stemi", triage_priority=priority)
    result = evaluate(req)
    assert result.triggered is True
    assert "unavailable or at zero capacity" in result.reason
    assert priority.value in result.reason


def test_specialty_with_no_required_equipment_is_trivially_available():
    # psychiatry has no required equipment in equipment_registry -> even
    # URGENT triage should not trigger on equipment grounds.
    req = make_request(condition="acute psychosis", triage_priority=TriagePriority.URGENT)
    result = evaluate(req)
    assert result.triggered is False


# ---------------------------------------------------------------------------
# Rule 1: unmapped condition
# ---------------------------------------------------------------------------

def test_unmapped_condition_raises():
    req = make_request(condition="totally unknown condition xyz")
    with pytest.raises(UnmappedConditionError):
        evaluate(req)


def test_condition_lookup_is_case_and_whitespace_insensitive():
    req = make_request(condition="  StRoKe  ")
    result = evaluate(req)
    assert result.specialty == "neurology"


# ---------------------------------------------------------------------------
# Rule 6: recommendation ranking
# ---------------------------------------------------------------------------

def test_recommendations_ranked_by_specialty_then_equipment_then_eta():
    # obstetrics missing at FAC-001 -> recommendations should rank
    # facilities with the specialty active+staffed above those without,
    # and among qualifying facilities, shortest ETA first.
    req = make_request(condition="obstetric hemorrhage", triage_priority=TriagePriority.ROUTINE)
    result = evaluate(req)
    assert result.triggered is True

    recs = result.recommendations
    assert len(recs) >= 2

    # ranks are contiguous starting at 1, in list order
    assert [r.rank for r in recs] == list(range(1, len(recs) + 1))

    # facilities with the specialty active+staffed must all sort before
    # those without it
    staffed_flags = [r.has_specialty_active_and_staffed for r in recs]
    first_false = next((i for i, f in enumerate(staffed_flags) if not f), len(staffed_flags))
    assert all(staffed_flags[:first_false])
    assert not any(staffed_flags[first_false:])

    # within the staffed group, ETA must be non-decreasing
    staffed_etas = [r.estimated_transfer_minutes for r in recs[:first_false]]
    assert staffed_etas == sorted(staffed_etas)


def test_recommendations_exclude_origin_facility():
    req = make_request(condition="obstetric hemorrhage", triage_priority=TriagePriority.ROUTINE)
    result = evaluate(req)
    assert all(r.facility_id != req.facility_id for r in result.recommendations)


# ---------------------------------------------------------------------------
# Rule 5: happy path, nothing triggered
# ---------------------------------------------------------------------------

def test_no_trigger_returns_empty_recommendations():
    req = make_request(condition="renal colic", triage_priority=TriagePriority.URGENT)
    result = evaluate(req)
    assert result.triggered is False
    assert result.recommendations == []
