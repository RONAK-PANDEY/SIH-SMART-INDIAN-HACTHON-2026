import asyncio
import sys
import os

# Add backend directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

async def test_patient_service():
    from services.patient_service import PatientService, PatientProfile, PatientCreateRequest, PatientUpdateRequest
    # Legacy compatibility import (deprecated):
    # from service.patient_service import PatientService as CompatibilityPatientService

    # 1. Lookup by phone
    p1 = await PatientService.get_patient_by_phone("9876543210")
    assert p1 is not None, "Patient 9876543210 should exist"
    assert p1.full_name == "Aarav Sharma"
    print(f"[PASS] Found patient by phone: {p1.full_name} ({p1.id})")

    # 2. Lookup by ABHA ID
    p_abha = await PatientService.get_patient_by_abha("ABHA-9821-4432-1109")
    assert p_abha is not None
    assert p_abha.id == p1.id
    print(f"[PASS] Found patient by ABHA ID: {p_abha.abha_id}")

    # 3. Register new patient
    new_req = PatientCreateRequest(
        full_name="Meera Nair",
        phone="9845012345",
        abha_id="ABHA-7788-9900-1122",
        age=29,
        gender="female",
        allergies=["Aspirin"],
        chronic_conditions=["Hypothyroidism"]
    )
    created = await PatientService.register_patient(new_req)
    assert created.id.startswith("usr-pat-")
    assert created.full_name == "Meera Nair"
    print(f"[PASS] Registered new patient: {created.full_name} with ID: {created.id}")

    # 4. Update patient
    updated = await PatientService.update_patient(created.id, PatientUpdateRequest(age=30))
    assert updated.age == 30
    print(f"[PASS] Updated patient age to {updated.age}")

    # 5. History & Vitals
    history = await PatientService.get_patient_history("usr-pat-001")
    assert len(history) > 0
    print(f"[PASS] Retrieved patient history: {len(history)} record(s)")

    vitals = await PatientService.get_patient_vitals("usr-pat-001")
    assert vitals is not None
    print(f"[PASS] Retrieved vitals: HR {vitals.heart_rate} bpm, BP {vitals.blood_pressure_systolic}/{vitals.blood_pressure_diastolic}")

async def test_appointment_service():
    print("\n--- Testing Appointment Service ---")
    from services.appointment_service import (
        AppointmentService,
        TokenGenerateRequest,
        SlotAvailabilityRequest,
        AppointmentBookingRequest
    )
    # Legacy compatibility import (deprecated):
    # from service.appointment_service import AppointmentService as CompatibilityAppointmentService

    # 1. Generate Token
    tok_req = TokenGenerateRequest(
        patient_id="usr-pat-001",
        hospital_id="hosp-001",
        department_id="dept-cardio",
        triage_score=1,
        is_senior=False,
        is_pregnant=False,
        is_differently_abled=False
    )
    token = AppointmentService.generate_token(tok_req)
    assert token.token_id is not None
    assert token.token_number.startswith("CARD-")
    assert token.position >= 1
    print(f"[PASS] Generated Token: {token.token_number} (ID: {token.token_id}) in pos {token.position} with est wait {token.estimated_wait_minutes} mins")

    # 2. Check Available Slots
    slot_req = SlotAvailabilityRequest(
        hospital_id="hosp-001",
        department_id="dept-cardio",
        date="2026-09-04"
    )
    slots = AppointmentService.get_available_slots(slot_req)
    assert len(slots) > 0
    print(f"[PASS] Found {len(slots)} available slots for dept-cardio")

    # 3. Book Appointment
    book_req = AppointmentBookingRequest(
        patient_id="usr-pat-002",
        hospital_id="hosp-001",
        department_id="dept-genmed",
        slot_id="slot-0930",
        appointment_date="2026-09-04",
        reason_for_visit="Severe migraine and nausea",
        triage_score=2,
        is_senior=True
    )
    appointment = await AppointmentService.book_appointment(book_req)
    assert appointment.appointment_id.startswith("apt_")
    assert appointment.token_number.startswith("GENM-") or appointment.token_number.startswith("GEN-")
    print(f"[PASS] Booked Appointment: {appointment.appointment_id} with token {appointment.token_number}")

    # 4. Check Queue Status
    queue_stat = AppointmentService.get_department_queue_status("hosp-001", "dept-cardio")
    assert queue_stat.total_waiting >= 1
    print(f"[PASS] Department queue status: {queue_stat.total_waiting} waiting, avg wait: {queue_stat.average_wait_minutes} mins")

def test_fastapi_app_routes():
    print("\n--- Testing FastAPI App Router Registration ---")
    from main import app
    openapi = app.openapi()
    paths = list(openapi.get("paths", {}).keys())
    print(f"Registered openapi endpoints count: {len(paths)}")
    
    expected_routes = [
        "/api/v1/patients/register",
        "/api/v1/patients/{phone}",
        "/api/v1/patients/id/{patient_id}",
        "/api/v1/patients/abha/{abha_id}",
        "/api/v1/appointments/tokens/generate",
        "/api/v1/appointments/slots/available",
        "/api/v1/appointments/book",
        "/api/v1/appointments/tokens/{token_id}",
        "/api/v1/appointments/tokens/active/{patient_id}"
    ]

    for er in expected_routes:
        assert er in paths, f"Expected route {er} not found in openapi paths!"
        print(f"[PASS] Route confirmed: {er}")


def test_triage_and_aadhaar_services():
    print("\n--- Testing AI Triage, 100+ Symptoms Taxonomy & Aadhaar Auth ---")
    from services.triage_service.triage_ai_service import TriageAIService
    from services.auth_service.aadhaar_abha_service import AadhaarABHAService
    from services.referral_service.hospital_network_service import HospitalNetworkService

    # 1. Symptoms Taxonomy
    taxonomy = TriageAIService.get_all_symptoms()
    total_symptoms = sum(len(v) for v in taxonomy.values())
    assert total_symptoms >= 40, f"Expected rich taxonomy, found {total_symptoms}"
    print(f"[PASS] Loaded {len(taxonomy)} medical categories with {total_symptoms} distinct symptoms")

    # 2. Emergency Red Flag Detection
    eval_res = TriageAIService.evaluate_triage(
        selected_symptom_ids=["sym_cp_severe"],
        free_text_description="Radiating chest pain and diaphoresis",
        vulnerability={"senior": True, "pregnant": False, "differentlyAbled": False}
    )
    assert eval_res["triage_level"] == 1, "Chest pain must trigger P1 Emergency"
    assert eval_res["is_emergency"] is True
    print(f"[PASS] Emergency Red-Flag verified: {eval_res['priority_tag']} -> {eval_res['department_name']}")

    # 3. Free-text Custom Complaint without pre-selected options
    custom_eval = TriageAIService.evaluate_triage(
        selected_symptom_ids=[],
        free_text_description="Continuous coughing with asthma wheezing since yesterday night",
        vulnerability={}
    )
    assert custom_eval["department_id"] == "dept-pulmo", f"Expected dept-pulmo, got {custom_eval['department_id']}"
    print(f"[PASS] Custom Free-Text NLP Matcher verified: Assigned to {custom_eval['department_name']}")

    # 4. Aadhaar Auth Verification
    otp_resp = AadhaarABHAService.send_otp("982144321109")
    assert otp_resp["status"] == "success"
    profile = AadhaarABHAService.verify_otp_and_fetch_profile("982144321109", "123456")
    assert profile["citizen_data"]["is_senior"] is True
    assert profile["citizen_data"]["full_name"] == "Aarav Sharma"
    print(f"[PASS] Aadhaar Verified Citizen: {profile['citizen_data']['full_name']} (Senior Priority: {profile['citizen_data']['is_senior']})")

    # 5. Hospital Network & Congestion Referral
    load_analysis = HospitalNetworkService.check_hospital_load_and_suggest_referral("hosp-aiims-delhi")
    assert load_analysis["is_congested"] is True
    assert len(load_analysis["suggested_alternatives"]) > 0
    print(f"[PASS] Inter-Hospital Load Balancer verified: Suggested transfer saves ~{load_analysis['time_saved_mins']} mins")


async def main():
    await test_patient_service()
    await test_appointment_service()
    test_fastapi_app_routes()
    test_triage_and_aadhaar_services()
    print("\n==========================================")
    print("ALL TESTS PASSED SUCCESSFULLY!")
    print("==========================================")

if __name__ == "__main__":
    asyncio.run(main())
