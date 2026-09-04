import pytest
import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../backend')))

from services.triage_service.triage_logic import TriageService, TriageAssessmentRequest
from services.appointment_service.service import AppointmentService, TokenGenerateRequest

def test_full_patient_triage_to_token_journey():
    # 1. Patient performs triage assessment
    triage_req = TriageAssessmentRequest(
        patient_id="usr_test_100",
        symptoms=["severe_chest_pain", "shortness_of_breath"]
    )
    triage_res = TriageService.evaluate(triage_req)
    assert triage_res.esi_level == 2
    assert triage_res.auto_priority_boost is True

    # 2. Patient books token with triage score
    token_req = TokenGenerateRequest(
        patient_id="usr_test_100",
        hospital_id="hosp-001",
        department_id="cardiology",
        triage_score=triage_res.esi_level,
        is_senior=False
    )
    token_res = AppointmentService.generate_token(token_req)
    assert token_res.token_number.startswith("CARD-")
    assert token_res.position >= 1
