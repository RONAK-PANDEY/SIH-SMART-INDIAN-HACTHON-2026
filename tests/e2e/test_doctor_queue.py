import pytest
import sys
import os
import asyncio

backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../backend'))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from core.appointments.service import AppointmentService
from core.appointments.models import TokenGenerateRequest
from realtime.doctor_console.console_handler import DoctorConsoleHandler

@pytest.mark.asyncio
async def test_doctor_call_patient_lifecycle():
    # 1. Generate token
    token_req = TokenGenerateRequest(
        patient_id="usr_doc_test",
        hospital_id="hosp-001",
        department_id="cardiology",
        triage_score=2
    )
    token_res = AppointmentService.generate_token(token_req)
    
    # 2. Doctor calls next patient from console
    call_res = await DoctorConsoleHandler.call_next_patient(
        doctor_id="doc-01",
        hospital_id="hosp-001",
        department_id="cardiology",
        room="104"
    )
    assert call_res["status"] == "success"
    assert "active_token" in call_res
