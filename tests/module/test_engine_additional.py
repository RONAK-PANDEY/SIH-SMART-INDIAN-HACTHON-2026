"""
Supplementary tests for QueueEngine (Section 1.4 dispatch algorithm).

`test_engine.py` already covers the core assignment rules, resolve_priority_category,
and the primary dispatch scenarios (emergency-first, category-rank FIFO, the 4th-slot
NORMAL reservation, and the hard-wait cap). This file adds edge cases around the
anti-starvation mechanics that aren't exercised there:

  - tie-breaking *within* the hard-cap group (overage, then check-in order)
  - tie-breaking *within* the 4th-slot NORMAL reservation (wait score, then check-in)
  - slot_count persisting correctly across repeated dispatch cycles (every 4th, not
    just the first 4th)
  - peek_next() being read-only (doesn't advance slot_count or remove patients)
  - EMERGENCY dispatches not consuming a slot
  - a patient exactly at (not over) the hard cap is NOT force-dispatched
"""

from datetime import datetime, timedelta

import pytest

from backend.services.queue_engine.config import QueueEngineConfig
from backend.services.queue_engine.engine import QueueEngine
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


def assign_senior(engine, pid, t):
    engine.check_in(pid, t)
    return engine.assign_category(
        pid,
        PriorityCategory.SENIOR,
        staff_id="frontdesk1",
        staff_is_clinical=False,
        verification_method=VerificationMethod.GOVERNMENT_ID,
        timestamp=t,
    )


# ---------------------------------------------------------------------
# Hard-cap tie-breaking: "ties broken by longest overage, then earliest
# check-in" (Section 1.4 step 2).
# ---------------------------------------------------------------------


def test_hard_cap_tiebreak_by_longest_overage():
    cfg = QueueEngineConfig(normal_max_wait_minutes=60)
    engine = QueueEngine(cfg)
    # n_more_over waited 70 min past cap-eligible time (i.e. checked in earlier),
    # n_less_over waited less overage.
    assign_normal(engine, "n_less_over", T0 + _mins(30))  # will have waited 61 min
    assign_normal(engine, "n_more_over", T0)  # will have waited 91 min
    now = T0 + _mins(91)
    # Both are over the 60-min cap; n_more_over has the larger overage (31 vs 1).
    assert engine.dispatch_next(now).patient_id == "n_more_over"
    assert engine.dispatch_next(now).patient_id == "n_less_over"


def test_hard_cap_tiebreak_by_earliest_checkin_when_overage_equal():
    cfg = QueueEngineConfig(normal_max_wait_minutes=60)
    engine = QueueEngine(cfg)
    # Same check-in time -> identical overage at any `now`; tie broken by
    # arrival sequence (n_first was checked in first).
    assign_normal(engine, "n_first", T0)
    assign_normal(engine, "n_second", T0)
    now = T0 + _mins(90)
    assert engine.dispatch_next(now).patient_id == "n_first"


def test_patient_exactly_at_cap_not_force_dispatched():
    # Spec says "waited *more than*" the cap -- exactly at the cap should
    # not trigger the hard-cap override.
    cfg = QueueEngineConfig(normal_max_wait_minutes=60)
    engine = QueueEngine(cfg)
    assign_normal(engine, "n1", T0)
    assign_senior(engine, "sen1", T0 + _mins(1))
    now = T0 + _mins(60)  # exactly at cap, not over
    # Not a multiple-of-4 slot, so normal category-rank order applies:
    # SENIOR outranks NORMAL, so sen1 goes first.
    assert engine.dispatch_next(now).patient_id == "sen1"


# ---------------------------------------------------------------------
# 4th-slot reservation tie-breaking: "highest wait-time score (ties
# broken by earliest check-in)" (Section 1.4 step 3).
# ---------------------------------------------------------------------


def test_slot_reservation_tiebreak_by_earliest_checkin_when_score_equal():
    cfg = QueueEngineConfig(normal_aging_interval_minutes=10)
    engine = QueueEngine(cfg)
    # Both NORMAL patients checked in at the same time -> identical wait
    # score at any `now`; tie broken by arrival order.
    assign_normal(engine, "n_first", T0)
    assign_normal(engine, "n_second", T0)
    for i in range(3):
        assign_senior(engine, f"sen{i}", T0 + _mins(i))

    now = T0 + _mins(5)
    order = [engine.dispatch_next(now).patient_id for _ in range(4)]
    # Slots 1-3 -> SENIOR FIFO, slot 4 -> reserved NORMAL slot, tie broken
    # to whichever NORMAL patient arrived first.
    assert order[3] == "n_first"


# ---------------------------------------------------------------------
# slot_count bookkeeping across repeated cycles and EMERGENCY exemption.
# ---------------------------------------------------------------------


def test_slot_reservation_recurs_every_4th_dispatch_across_multiple_cycles():
    # Enough NORMAL patients to still have one waiting at every 4th slot,
    # and enough SENIOR patients to fill all the non-reserved slots, so we
    # can observe the reservation firing at slots 4, 8, and 12 -- not just
    # the first cycle.
    cfg = QueueEngineConfig(normal_priority_slot_ratio=4)
    engine = QueueEngine(cfg)
    for i in range(3):
        assign_normal(engine, f"n{i}", T0 + _mins(i))
    for i in range(20):
        assign_senior(engine, f"sen{i}", T0 + _mins(i))

    now = T0 + _mins(30)
    categories_by_position = []
    for _ in range(12):
        dispatched = engine.dispatch_next(now)
        categories_by_position.append(dispatched.category)

    reserved_positions = [
        i + 1 for i, cat in enumerate(categories_by_position) if cat == PriorityCategory.NORMAL
    ]
    assert reserved_positions == [4, 8, 12]


def test_slot_count_advances_even_without_eligible_normal_patient():
    # Section 1.4 step 3 only fires "if at least one NORMAL patient exists".
    # If slot 4 arrives with no NORMAL patients, dispatch must fall through
    # to step 4 (category rank), but slot_count still increments so the
    # *next* 4th-slot boundary is still 4 dispatches later, not reset.
    cfg = QueueEngineConfig(normal_priority_slot_ratio=4)
    engine = QueueEngine(cfg)
    for i in range(4):
        assign_senior(engine, f"sen{i}", T0 + _mins(i))
    now = T0 + _mins(10)

    for _ in range(4):
        p = engine.dispatch_next(now)
        assert p.category == PriorityCategory.SENIOR
    assert engine._slot_count == 4


def test_emergency_dispatch_does_not_consume_a_slot():
    cfg = QueueEngineConfig(normal_priority_slot_ratio=4)
    engine = QueueEngine(cfg)
    assign_emergency(engine, "em1", T0)
    assign_emergency(engine, "em2", T0 + _mins(1))
    assign_emergency(engine, "em3", T0 + _mins(2))
    assign_emergency(engine, "em4", T0 + _mins(3))
    assign_normal(engine, "n1", T0)
    now = T0 + _mins(5)

    for _ in range(4):
        engine.dispatch_next(now)
    # All 4 dispatches were EMERGENCY (they always win step 1), so
    # slot_count should still be 0 -- none of them should have consumed
    # the anti-starvation slot counter.
    assert engine._slot_count == 0
    # The NORMAL patient is still waiting; the next dispatch is slot 1
    # (category rank), not the reserved 4th slot.
    assert engine.dispatch_next(now).patient_id == "n1"


def test_peek_next_does_not_mutate_state():
    cfg = QueueEngineConfig(normal_priority_slot_ratio=4)
    engine = QueueEngine(cfg)
    assign_senior(engine, "sen1", T0)
    now = T0 + _mins(1)

    first_peek = engine.peek_next(now)
    second_peek = engine.peek_next(now)
    assert first_peek.patient_id == second_peek.patient_id == "sen1"
    assert engine._slot_count == 0
    assert len(engine) == 1  # patient not removed by peeking


if __name__ == "__main__":
    import sys

    sys.exit(pytest.main([__file__, "-v"]))
