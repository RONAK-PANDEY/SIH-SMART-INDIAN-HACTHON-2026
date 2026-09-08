import pytest
from datetime import datetime, timedelta
import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../backend')))

from services.queue_engine.priority import PriorityCalculator, VulnerabilityFactors
from services.queue_engine.engine import QueueEngine, QueueTokenItem

def test_emergency_override_never_overtaken_by_routine_wait():
    """
    Verify Level 1 (Resuscitation) emergency arrival is prioritized ahead of
    a routine Level 5 patient who has been waiting for 60 minutes.
    """
    past_60m = datetime.utcnow() - timedelta(minutes=60)
    now = datetime.utcnow()

    # Routine patient waiting 60 minutes
    p_routine_waited = PriorityCalculator.calculate(past_60m, triage_level=5, vulnerability=VulnerabilityFactors())

    # Acute Level 1 Emergency patient arriving right now
    p_emergency_new = PriorityCalculator.calculate(now, triage_level=1, vulnerability=VulnerabilityFactors())

    assert p_emergency_new > p_routine_waited, (
        f"Emergency score {p_emergency_new} must exceed routine waited score {p_routine_waited}"
    )

def test_deterministic_queue_tie_breaking():
    """
    Verify when two patients have identical priority scores,
    the patient with earlier arrival time is consistently popped first.
    """
    engine = QueueEngine()
    t_early = datetime.utcnow() - timedelta(minutes=10)
    t_late = datetime.utcnow() - timedelta(minutes=5)

    item1 = QueueTokenItem("tok-early", "CARD-101", "usr-1", "hosp-test", "dept-test", triage_level=3)
    item1.issued_at = t_early
    item1.priority_score = 15.0

    item2 = QueueTokenItem("tok-late", "CARD-102", "usr-2", "hosp-test", "dept-test", triage_level=3)
    item2.issued_at = t_late
    item2.priority_score = 15.0

    # Insert later item first, then earlier item
    engine.enqueue(item2)
    engine.enqueue(item1)

    popped = engine.pop_next("hosp-test", "dept-test")
    assert popped.token_id == "tok-early", "Earlier arrival must be served first on score ties"
