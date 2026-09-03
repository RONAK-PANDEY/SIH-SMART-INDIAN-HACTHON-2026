"""
Tests for QueueEngine against docs/business-rules.md Section 1.
"""

from datetime import datetime, timedelta

import pytest

from backend.services.queue_engine.config import QueueEngineConfig
from backend.services.queue_engine.engine import (
    InvalidAssignmentError,
    PatientNotFoundError,
    QueueEngine,
    resolve_priority_category,
)
from backend.services.queue_engine.models import PriorityCategory, TriageResult, VerificationMethod

T0 = datetime(2026, 1, 1, 8, 0, 0)


def _mins(m):
    return timedelta(minutes=m)


def assign_normal(engine, pid, t, triage=TriageResult.ROUTINE):
    engine.check_in(pid, t)
    return engine.assign_category(
        pid,
        PriorityCategory.NORMAL,
        staff_id="staffA",
        staff_is_clinical=False,
        verification_method=VerificationMethod.DEFAULT_UNQUALIFIED,
        timestamp=t,
        triage_result=triage,
    )


def assign_emergency(engine, pid, t):
    engine.check_in(pid, t)
    return engine.assign_category(
        pid,
        PriorityCategory.EMERGENCY,
        staff_id="nurseA",
        staff_is_clinical=True,
        verification_method=VerificationMethod.CLINICAL_TRIAGE,
        timestamp=t,
        triage_result=TriageResult.URGENT,
    )


def assign_critical(engine, pid, t):
    engine.check_in(pid, t)
    return engine.assign_category(
        pid,
        PriorityCategory.CRITICAL,
        staff_id="nurseA",
        staff_is_clinical=True,
        verification_method=VerificationMethod.CLINICAL_TRIAGE,
        timestamp=t,
        triage_result=TriageResult.URGENT,
    )


def assign_senior(engine, pid, t):
    engine.check_in(pid, t)
    return engine.assign_category(
        pid,
        PriorityCategory.SENIOR,
        staff_id="frontdesk1",
        staff_is_clinical=False,
        verification_method=VerificationMethod.GOVERNMENT_ID,
        timestamp=t,
        id_last4="1234",
    )


def assign_pwd(engine, pid, t):
    engine.check_in(pid, t)
    return engine.assign_category(
        pid,
        PriorityCategory.PWD,
        staff_id="frontdesk1",
        staff_is_clinical=False,
        verification_method=VerificationMethod.PWD_ID_CARD,
        timestamp=t,
    )


# ---------------------------------------------------------------------
# Section 1.2: staff-verified assignment rules
# ---------------------------------------------------------------------


def test_patient_not_visible_until_assigned():
    engine = QueueEngine()
    engine.check_in("p1", T0)
    assert engine.unassigned_count() == 1
    assert len(engine) == 0
    assert engine.peek_next(T0) is None


def test_emergency_requires_clinical_staff():
    engine = QueueEngine()
    engine.check_in("p1", T0)
    with pytest.raises(InvalidAssignmentError):
        engine.assign_category(
            "p1",
            PriorityCategory.EMERGENCY,
            staff_id="frontdesk1",
            staff_is_clinical=False,
            verification_method=VerificationMethod.CLINICAL_TRIAGE,
            timestamp=T0,
            triage_result=TriageResult.URGENT,
        )


def test_emergency_requires_urgent_triage():
    engine = QueueEngine()
    engine.check_in("p1", T0)
    with pytest.raises(InvalidAssignmentError):
        engine.assign_category(
            "p1",
            PriorityCategory.EMERGENCY,
            staff_id="nurseA",
            staff_is_clinical=True,
            verification_method=VerificationMethod.CLINICAL_TRIAGE,
            timestamp=T0,
            triage_result=TriageResult.PRIORITY,
        )


def test_senior_requires_valid_verification_method():
    engine = QueueEngine()
    engine.check_in("p1", T0)
    with pytest.raises(InvalidAssignmentError):
        engine.assign_category(
            "p1",
            PriorityCategory.SENIOR,
            staff_id="frontdesk1",
            staff_is_clinical=False,
            verification_method=VerificationMethod.PWD_ID_CARD,
            timestamp=T0,
        )


def test_assignment_is_logged():
    engine = QueueEngine()
    assign_senior(engine, "p1", T0)
    assert len(engine.assignment_log) == 1
    entry = engine.assignment_log[0]
    assert entry.staff_id == "frontdesk1"
    assert entry.category_assigned == PriorityCategory.SENIOR
    assert entry.patient_id == "p1"


def test_reassignment_requires_reason():
    engine = QueueEngine()
    assign_normal(engine, "p1", T0)
    with pytest.raises(InvalidAssignmentError):
        engine.reassign_category(
            "p1",
            PriorityCategory.CRITICAL,
            staff_id="nurseA",
            staff_is_clinical=True,
            verification_method=VerificationMethod.CLINICAL_TRIAGE,
            timestamp=T0,
            reason="",
            triage_result=TriageResult.URGENT,
        )


def test_reassignment_logged_with_reason():
    engine = QueueEngine()
    assign_normal(engine, "p1", T0)
    engine.reassign_category(
        "p1",
        PriorityCategory.CRITICAL,
        staff_id="nurseA",
        staff_is_clinical=True,
        verification_method=VerificationMethod.CLINICAL_TRIAGE,
        timestamp=T0 + _mins(5),
        reason="Condition worsened, re-triaged URGENT",
        triage_result=TriageResult.URGENT,
    )
    assert engine.assignment_log[-1].reason == "Condition worsened, re-triaged URGENT"
    assert len(engine) == 1
    assert list(engine._patients.values())[0].category == PriorityCategory.CRITICAL


def test_reassignment_of_unknown_patient_raises():
    engine = QueueEngine()
    with pytest.raises(PatientNotFoundError):
        engine.reassign_category(
            "ghost",
            PriorityCategory.NORMAL,
            staff_id="s",
            staff_is_clinical=False,
            verification_method=VerificationMethod.DEFAULT_UNQUALIFIED,
            timestamp=T0,
            reason="test",
        )


# ---------------------------------------------------------------------
# resolve_priority_category: Section 1.1 tie-break + Section 2.4 mapping
# ---------------------------------------------------------------------


def test_pwd_beats_senior_tiebreak():
    cat = resolve_priority_category(is_pwd=True, is_senior=True)
    assert cat == PriorityCategory.PWD


def test_urgent_triage_with_life_threat_is_emergency():
    cat = resolve_priority_category(
        triage_result=TriageResult.URGENT, clinician_deems_immediate_life_threat=True
    )
    assert cat == PriorityCategory.EMERGENCY


def test_urgent_triage_without_life_threat_is_critical():
    cat = resolve_priority_category(
        triage_result=TriageResult.URGENT, clinician_deems_immediate_life_threat=False
    )
    assert cat == PriorityCategory.CRITICAL


def test_senior_stacks_over_routine_triage():
    # A senior citizen triaged ROUTINE is still SENIOR, not NORMAL.
    cat = resolve_priority_category(triage_result=TriageResult.ROUTINE, is_senior=True)
    assert cat == PriorityCategory.SENIOR


def test_default_normal():
    cat = resolve_priority_category(triage_result=TriageResult.ROUTINE)
    assert cat == PriorityCategory.NORMAL


# ---------------------------------------------------------------------
# Section 1.4: dispatch algorithm
# ---------------------------------------------------------------------


def test_emergency_always_dispatched_first_no_exceptions():
    engine = QueueEngine()
    assign_critical(engine, "crit1", T0)
    assign_senior(engine, "sen1", T0)
    assign_emergency(engine, "em1", T0 + _mins(1))  # arrives later than others
    assert engine.dispatch_next(T0 + _mins(5)).patient_id == "em1"


def test_category_rank_order_fifo_within_category():
    engine = QueueEngine()
    assign_senior(engine, "sen1", T0)
    assign_pwd(engine, "pwd1", T0 + _mins(1))
    assign_senior(engine, "sen2", T0 + _mins(2))
    assign_critical(engine, "crit1", T0 + _mins(3))
    now = T0 + _mins(4)
    # slot 1 (not a multiple of 4) -> category rank order: CRITICAL > SENIOR > PWD
    assert engine.dispatch_next(now).patient_id == "crit1"
    # slot 2 -> next highest rank category, FIFO: sen1 before sen2
    assert engine.dispatch_next(now).patient_id == "sen1"
    # slot 3 -> sen2 before pwd1 (SENIOR ranks above PWD in dispatch order)
    assert engine.dispatch_next(now).patient_id == "sen2"


def test_every_4th_slot_reserved_for_highest_wait_score_normal():
    engine = QueueEngine()
    # Three NORMAL patients with different check-in times -> different
    # wait scores at `now`.
    assign_normal(engine, "n1", T0)                 # waited longest
    assign_normal(engine, "n2", T0 + _mins(5))
    assign_normal(engine, "n3", T0 + _mins(8))
    # Plenty of SENIOR patients to fill non-reserved slots.
    for i in range(5):
        assign_senior(engine, f"sen{i}", T0 + _mins(i))

    now = T0 + _mins(30)  # n1 waited 30 min -> score 3; n2 -> score 2; n3 -> score 2 (22min/10=2)
    order = []
    for _ in range(4):
        order.append(engine.dispatch_next(now).patient_id)
    # Slots 1-3: SENIOR FIFO. Slot 4: reserved for highest wait-score NORMAL (n1).
    assert order[3] == "n1"
    assert all(pid.startswith("sen") for pid in order[:3])


def test_hard_cap_forces_normal_dispatch_even_off_slot():
    engine = QueueEngine(QueueEngineConfig(normal_max_wait_minutes=120))
    assign_normal(engine, "n_over", T0)  # will be 121+ minutes old
    assign_critical(engine, "crit1", T0 + _mins(100))
    now = T0 + _mins(121)
    # Not a multiple-of-4 slot, and CRITICAL outranks NORMAL by category,
    # but the 120-minute hard cap forces n_over to the front anyway.
    assert engine.dispatch_next(now).patient_id == "n_over"


def test_hard_cap_still_yields_to_emergency():
    engine = QueueEngine(QueueEngineConfig(normal_max_wait_minutes=120))
    assign_normal(engine, "n_over", T0)
    assign_emergency(engine, "em1", T0 + _mins(100))
    now = T0 + _mins(121)
    assert engine.dispatch_next(now).patient_id == "em1"


def test_priority_triage_normal_gets_head_start_wait_score():
    cfg = QueueEngineConfig(priority_starting_wait_score=6, normal_aging_interval_minutes=10)
    engine = QueueEngine(cfg)
    assign_normal(engine, "routine1", T0, triage=TriageResult.ROUTINE)
    assign_normal(engine, "priority1", T0, triage=TriageResult.PRIORITY)
    now = T0  # no time has passed
    routine_p = engine._patients["routine1"]
    priority_p = engine._patients["priority1"]
    assert routine_p.wait_score(now, cfg.normal_aging_interval_minutes) == 0
    assert priority_p.wait_score(now, cfg.normal_aging_interval_minutes) == 6


def test_snapshot_is_non_destructive():
    engine = QueueEngine()
    assign_emergency(engine, "em1", T0)
    assign_normal(engine, "n1", T0)
    before = len(engine)
    snap = engine.snapshot(T0 + _mins(1))
    assert len(engine) == before
    assert snap[0]["patient_id"] == "em1"


def test_dispatch_on_empty_queue_returns_none():
    engine = QueueEngine()
    assert engine.dispatch_next(T0) is None
    assert engine.peek_next(T0) is None
