from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class CallNextRequest(BaseModel):
    doctor_id: str
    department_id: str
    room_id: Optional[str] = None  # physical/virtual consult room, if used for socket routing


class TokenOut(BaseModel):
    token_id: str
    patient_id: str
    department_id: str
    queue_position: int
    status: str
    doctor_id: Optional[str] = None


class CallNextResponse(BaseModel):
    called: bool
    token: Optional[TokenOut] = None
    message: Optional[str] = None


class ReferralInfo(BaseModel):
    target_department_id: str
    reason: str


class CompleteConsultationRequest(BaseModel):
    token_id: str
    doctor_id: str
    visit_summary: str = Field(..., min_length=1)
    notes: Optional[str] = None
    prescription_summary: Optional[str] = None
    follow_up: Optional[str] = None  # e.g. "return in 2 weeks", or an ISO date string
    referral: Optional[ReferralInfo] = None


class ConsultationRecordOut(BaseModel):
    token_id: str
    patient_id: str
    doctor_id: str
    visit_summary: str
    notes: Optional[str]
    prescription_summary: Optional[str]
    follow_up: Optional[str]
    referral_token_id: Optional[str] = None
    completed_at: datetime


class CompleteConsultationResponse(BaseModel):
    completed: bool
    record: ConsultationRecordOut
