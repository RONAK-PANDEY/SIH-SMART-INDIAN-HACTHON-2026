from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class TokenGenerateRequest(BaseModel):
    patient_id: str
    hospital_id: str
    department_id: str
    triage_score: int = 4  # 1 (Resuscitation) to 5 (Non-urgent)
    is_senior: bool = False
    is_pregnant: bool = False
    is_differently_abled: bool = False
    notes: Optional[str] = None

class TokenResponse(BaseModel):
    token_id: str
    token_number: str
    patient_id: str
    hospital_id: str
    department_id: str
    position: int
    estimated_wait_minutes: int
    assigned_room: str
    assigned_doctor_name: Optional[str] = "OPD Duty Doctor"
    priority_score: float
    status: str  # WAITING, NEXT, IN_CONSULTATION, COMPLETED, CANCELLED
    issued_at: datetime = Field(default_factory=datetime.utcnow)

class SlotItem(BaseModel):
    slot_id: str
    start_time: str
    end_time: str
    doctor_id: str
    doctor_name: str
    available_tokens: int
    is_available: bool = True

class SlotAvailabilityRequest(BaseModel):
    hospital_id: str
    department_id: str
    date: str  # YYYY-MM-DD

class AppointmentBookingRequest(BaseModel):
    patient_id: str
    hospital_id: str
    department_id: str
    slot_id: str
    appointment_date: str
    consultation_type: str = "NEW"  # NEW, FOLLOW_UP, EMERGENCY_WALKIN
    reason_for_visit: str
    triage_score: int = 4
    is_senior: bool = False
    is_pregnant: bool = False
    is_differently_abled: bool = False

class AppointmentDetails(BaseModel):
    appointment_id: str
    token_id: str
    token_number: str
    patient_id: str
    hospital_id: str
    hospital_name: str
    department_id: str
    department_name: str
    doctor_id: str
    doctor_name: str
    appointment_date: str
    time_slot: str
    consultation_type: str
    reason_for_visit: str
    status: str  # BOOKED, COMPLETED, CANCELLED, RESCHEDULED
    created_at: datetime = Field(default_factory=datetime.utcnow)

class QueueStatusResponse(BaseModel):
    hospital_id: str
    department_id: str
    total_waiting: int
    current_serving_token: Optional[str] = None
    next_up_tokens: List[str] = Field(default_factory=list)
    average_wait_minutes: int
