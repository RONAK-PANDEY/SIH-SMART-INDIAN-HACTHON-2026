from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class TokenCreateRequest(BaseModel):
    patient_id: str
    department: Optional[str] = None
    department_id: Optional[str] = None
    hospital_id: Optional[str] = "hosp-001"
    triage_score: int = 4  # 1 (Resuscitation) to 5 (Non-urgent)
    is_senior: bool = False
    is_pregnant: bool = False
    is_differently_abled: bool = False
    notes: Optional[str] = None

class TokenGenerateRequest(TokenCreateRequest):
    pass

class TokenResponse(BaseModel):
    id: Optional[str] = None
    token_id: str
    token_number: str
    patient_id: str
    hospital_id: str = "hosp-001"
    department: Optional[str] = None
    department_id: str
    position: int = 1
    estimated_wait_minutes: int = 5
    assigned_room: str = "Room 101"
    assigned_doctor_name: Optional[str] = "OPD Duty Doctor"
    priority_score: float = 1.0
    status: str = "waiting"  # waiting, scanned_by_staff, in_consultation, completed, cancelled
    issued_at: datetime = Field(default_factory=datetime.utcnow)
    created_at: Optional[datetime] = None
    qr_hash: Optional[str] = None
    hash: Optional[str] = None
    scanned_at: Optional[datetime] = None
    scanned_by: Optional[str] = None
    completed_at: Optional[datetime] = None

class TokenScanRequest(BaseModel):
    token_id: Optional[str] = None
    token_number: Optional[str] = None
    token: Optional[str] = None
    tokenId: Optional[str] = None
    tokenNumber: Optional[str] = None
    dept: Optional[str] = None
    department: Optional[str] = None
    department_id: Optional[str] = None
    hospital_id: Optional[str] = None
    hospitalId: Optional[str] = None
    patient_id: Optional[str] = None
    patientId: Optional[str] = None
    patient_name: Optional[str] = None
    patientName: Optional[str] = None
    qr_hash: Optional[str] = None
    hash: Optional[str] = None
    scanned_by: Optional[str] = "turnstile-guard"
    scanner_id: Optional[str] = None
    device_info: Optional[str] = None
    timestamp: Optional[str] = None

class TokenScanResponse(BaseModel):
    status: str = "ok"
    patient_name: str
    dept: str
    token_id: str
    token_number: str
    token_status: str = "scanned_by_staff"
    message: Optional[str] = "Token verified and scanned successfully"

class TokenCompleteResponse(BaseModel):
    status: str = "ok"
    token_id: str
    token_number: str
    token_status: str = "completed"
    completed_at: str
    message: Optional[str] = "Consultation completed successfully"

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
    hospital_id: str = "hosp-001"
    department_id: Optional[str] = None
    department: Optional[str] = None
    slot_id: Optional[str] = "slot-0900"
    appointment_date: Optional[str] = None
    consultation_type: str = "NEW"  # NEW, FOLLOW_UP, EMERGENCY_WALKIN
    reason_for_visit: Optional[str] = "General OPD Consultation"
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
    qr_hash: Optional[str] = None
    hash: Optional[str] = None

class QueueStatusResponse(BaseModel):
    hospital_id: str
    department_id: str
    total_waiting: int
    current_serving_token: Optional[str] = None
    next_up_tokens: List[str] = Field(default_factory=list)
    average_wait_minutes: int
