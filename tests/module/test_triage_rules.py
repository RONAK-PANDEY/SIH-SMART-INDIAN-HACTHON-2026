import pytest
import sys
import os

backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../backend'))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from core.triage.rules import evaluate_esi_level

def test_evaluate_severe_symptoms():
    assert evaluate_esi_level(["severe chest pain", "shortness of breath"]) == 2
    assert evaluate_esi_level(["cardiac arrest"]) == 1
    assert evaluate_esi_level(["mild cold cough"]) == 5

def test_vital_overrides():
    assert evaluate_esi_level(["mild cold cough"], vitals={"spo2": 82.0}) == 2 # Critical hypoxia override
