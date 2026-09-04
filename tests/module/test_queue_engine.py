import pytest
from datetime import datetime, timedelta
import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../backend')))

from services.queue_engine.priority import PriorityCalculator, VulnerabilityFactors
from services.queue_engine.engine import QueueEngine, QueueTokenItem

def test_priority_calculation_emergency():
    now = datetime.utcnow()
    # Level 1 should have highest priority component
    p1 = PriorityCalculator.calculate(now, triage_level=1, vulnerability=VulnerabilityFactors())
    p5 = PriorityCalculator.calculate(now, triage_level=5, vulnerability=VulnerabilityFactors())
    assert p1 > p5

def test_vulnerability_boost():
    now = datetime.utcnow()
    p_standard = PriorityCalculator.calculate(now, triage_level=4, vulnerability=VulnerabilityFactors())
    p_senior = PriorityCalculator.calculate(now, triage_level=4, vulnerability=VulnerabilityFactors(is_senior=True))
    assert p_senior > p_standard

def test_queue_ordering():
    engine = QueueEngine()
    t1 = QueueTokenItem("tok-1", "GEN-001", "usr-1", "hosp-1", "dept-1", triage_level=5)
    t2 = QueueTokenItem("tok-2", "GEN-002", "usr-2", "hosp-1", "dept-1", triage_level=2) # Emergency arrives later
    
    engine.enqueue(t1)
    engine.enqueue(t2)
    
    next_token = engine.pop_next("hosp-1", "dept-1")
    assert next_token.token_id == "tok-2" # Emergency token prioritised ahead of routine token
