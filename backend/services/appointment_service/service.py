import uuid
from datetime import datetime
from typing import Dict, List, Optional
from services.queue_engine.engine import queue_engine, QueueTokenItem
from services.queue_engine.priority import VulnerabilityFactors
from services.appointment_service.models import (
    TokenGenerateRequest,
    TokenResponse,
    SlotItem,
    SlotAvailabilityRequest,
    AppointmentBookingRequest,
    AppointmentDetails,
    QueueStatusResponse
)

class AppointmentService:
    """
    Manages Token Generation, dynamic OPD Queue Prioritization,
    Slot Scheduling, and Appointment Management.
    """

    # In-memory store for tokens and appointments
    _tokens: Dict[str, TokenResponse] = {}
    _appointments: Dict[str, AppointmentDetails] = {}

    # Department room mappings
    _dept_rooms = {
        "dept-cardio": {"room": "Room 204, Block B", "doctor": "Dr. Priya Sharma (Cardiologist)"},
        "dept-genmed": {"room": "Room 102, Block A", "doctor": "Dr. Rajesh Khanna (General Physician)"},
        "dept-ortho": {"room": "Room 108, Block C", "doctor": "Dr. Vikram Seth (Orthopedics)"},
        "dept-peds": {"room": "Room 301, Block A", "doctor": "Dr. Anita Desai (Pediatrician)"},
        "dept-neuro-sjh": {"room": "Room 402, Super Speciality", "doctor": "Dr. Arjun Nambiar (Neurology)"},
    }

    @classmethod
    def generate_token(cls, req: TokenGenerateRequest) -> TokenResponse:
        seq = abs(hash(req.patient_id + str(datetime.utcnow()))) % 900 + 100
        dept_prefix = (req.department_id.split("-")[-1][:4] if "-" in req.department_id else req.department_id[:4]).upper()
        token_num = f"{dept_prefix}-{seq:03d}"
        token_id = f"tok_{uuid.uuid4().hex[:8]}"

        vuln = VulnerabilityFactors(
            is_senior=req.is_senior,
            is_pregnant=req.is_pregnant,
            is_differently_abled=req.is_differently_abled
        )

        token_item = QueueTokenItem(
            token_id=token_id,
            token_number=token_num,
            patient_id=req.patient_id,
            hospital_id=req.hospital_id,
            department_id=req.department_id,
            triage_level=req.triage_score,
            vulnerability=vuln
        )

        pos = queue_engine.enqueue(token_item)
        est_wait = max(5, pos * 7)

        dept_info = cls._dept_rooms.get(req.department_id, {"room": "Room 101, Main Wing", "doctor": "Duty Medical Officer"})

        response = TokenResponse(
            token_id=token_id,
            token_number=token_num,
            patient_id=req.patient_id,
            hospital_id=req.hospital_id,
            department_id=req.department_id,
            position=pos,
            estimated_wait_minutes=est_wait,
            assigned_room=dept_info["room"],
            assigned_doctor_name=dept_info["doctor"],
            priority_score=token_item.priority_score,
            status="WAITING",
            issued_at=token_item.issued_at
        )

        cls._tokens[token_id] = response
        return response

    @classmethod
    def get_token_by_id(cls, token_id: str) -> Optional[TokenResponse]:
        return cls._tokens.get(token_id)

    @classmethod
    def get_active_tokens_by_patient(cls, patient_id: str) -> List[TokenResponse]:
        return [
            tok for tok in cls._tokens.values()
            if tok.patient_id == patient_id and tok.status in ("WAITING", "NEXT", "IN_CONSULTATION")
        ]

    @classmethod
    def get_available_slots(cls, req: SlotAvailabilityRequest) -> List[SlotItem]:
        dept_info = cls._dept_rooms.get(req.department_id, {"doctor": "Duty Medical Officer"})
        doctor_name = dept_info["doctor"]

        return [
            SlotItem(
                slot_id="slot-0900",
                start_time="09:00 AM",
                end_time="09:30 AM",
                doctor_id="doc-001",
                doctor_name=doctor_name,
                available_tokens=4,
                is_available=True
            ),
            SlotItem(
                slot_id="slot-0930",
                start_time="09:30 AM",
                end_time="10:00 AM",
                doctor_id="doc-001",
                doctor_name=doctor_name,
                available_tokens=2,
                is_available=True
            ),
            SlotItem(
                slot_id="slot-1000",
                start_time="10:00 AM",
                end_time="10:30 AM",
                doctor_id="doc-001",
                doctor_name=doctor_name,
                available_tokens=5,
                is_available=True
            ),
            SlotItem(
                slot_id="slot-1100",
                start_time="11:00 AM",
                end_time="11:30 AM",
                doctor_id="doc-001",
                doctor_name=doctor_name,
                available_tokens=1,
                is_available=True
            ),
            SlotItem(
                slot_id="slot-1400",
                start_time="02:00 PM",
                end_time="02:30 PM",
                doctor_id="doc-001",
                doctor_name=doctor_name,
                available_tokens=6,
                is_available=True
            )
        ]

    @classmethod
    def book_appointment(cls, req: AppointmentBookingRequest) -> AppointmentDetails:
        # 1. Generate real-time priority token
        tok_req = TokenGenerateRequest(
            patient_id=req.patient_id,
            hospital_id=req.hospital_id,
            department_id=req.department_id,
            triage_score=req.triage_score,
            is_senior=req.is_senior,
            is_pregnant=req.is_pregnant,
            is_differently_abled=req.is_differently_abled
        )
        token_res = cls.generate_token(tok_req)

        dept_info = cls._dept_rooms.get(req.department_id, {"room": "Room 101", "doctor": "Duty Medical Officer"})
        appointment_id = f"apt_{uuid.uuid4().hex[:8]}"

        app_details = AppointmentDetails(
            appointment_id=appointment_id,
            token_id=token_res.token_id,
            token_number=token_res.token_number,
            patient_id=req.patient_id,
            hospital_id=req.hospital_id,
            hospital_name="AIIMS New Delhi - Apex Trauma & OPD Center" if "hosp-001" in req.hospital_id or "AIIMS" in req.hospital_id else "Safdarjung Super Speciality Hospital",
            department_id=req.department_id,
            department_name=req.department_id.replace("dept-", "").capitalize() + " Department",
            doctor_id="doc-001",
            doctor_name=dept_info["doctor"],
            appointment_date=req.appointment_date,
            time_slot="09:30 AM - 10:00 AM",
            consultation_type=req.consultation_type,
            reason_for_visit=req.reason_for_visit,
            status="BOOKED",
            created_at=datetime.utcnow()
        )

        cls._appointments[appointment_id] = app_details
        return app_details

    @classmethod
    def cancel_token(cls, token_id: str) -> bool:
        if token_id in cls._tokens:
            cls._tokens[token_id].status = "CANCELLED"
            return True
        return False

    @classmethod
    def get_department_queue_status(cls, hospital_id: str, department_id: str) -> QueueStatusResponse:
        key = f"{hospital_id}:{department_id}"
        queue_items = queue_engine._queues.get(key, [])
        waiting_items = [q for q in queue_items if q.status == "WAITING"]
        in_consult = [q for q in queue_items if q.status == "IN_CONSULTATION"]

        current_token = in_consult[0].token_number if in_consult else (waiting_items[0].token_number if waiting_items else None)
        next_tokens = [q.token_number for q in waiting_items[:3]]

        return QueueStatusResponse(
            hospital_id=hospital_id,
            department_id=department_id,
            total_waiting=len(waiting_items),
            current_serving_token=current_token,
            next_up_tokens=next_tokens,
            average_wait_minutes=max(5, len(waiting_items) * 6)
        )
