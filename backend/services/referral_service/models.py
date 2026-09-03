from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field


class TriagePriority(str, Enum):
    """Triage category. URGENT/PRIORITY are the categories rule 4 checks
    equipment-driven referrals against; ROUTINE/NON_URGENT never trigger
    on equipment shortage alone (rule 4), but always trigger on missing
    specialty/staffing (rule 3, "regardless of triage category")."""
    URGENT = "URGENT"
    PRIORITY = "PRIORITY"
    ROUTINE = "ROUTINE"
    NON_URGENT = "NON_URGENT"


class TriageEventType(str, Enum):
    TRIAGE_COMPLETED = "TRIAGE_COMPLETED"
    TRIAGE_UPGRADED = "TRIAGE_UPGRADED"


class ReferralStatus(str, Enum):
    NONE = "NONE"                # evaluated, not triggered
    PENDING = "PENDING"          # triggered, awaiting staff decision
    CONFIRMED = "CONFIRMED"      # staff confirmed transfer to a facility
    REJECTED = "REJECTED"        # staff declined the referral
    CANCELLED = "CANCELLED"


class TriageEvaluationRequest(BaseModel):
    patient_id: str
    facility_id: str = Field(..., description="Current/origin facility ID")
    condition: str = Field(..., description="Diagnosed or suspected condition")
    triage_priority: TriagePriority
    event_type: TriageEventType = TriageEventType.TRIAGE_COMPLETED
    evaluated_at: Optional[datetime] = None  # defaults to now if omitted
    requested_by_staff_id: Optional[str] = None


class FacilityRecommendation(BaseModel):
    facility_id: str
    facility_name: str
    specialty: str
    has_specialty_active_and_staffed: bool
    has_equipment_available: bool
    estimated_transfer_minutes: int
    rank: int


class ReferralRecord(BaseModel):
    referral_id: str
    patient_id: str
    from_facility_id: str
    from_facility_name: str
    to_facility_id: Optional[str] = None
    to_facility_name: Optional[str] = None
    department: str  # required specialty
    condition: str
    priority: TriagePriority
    status: ReferralStatus
    trigger_reason: str
    recommendations: list[FacilityRecommendation] = []
    created_at: datetime
    updated_at: datetime
    confirmed_by_staff_id: Optional[str] = None
    confirmed_at: Optional[datetime] = None


class ReferralEvaluationResponse(BaseModel):
    triggered: bool
    reason: str
    referral: Optional[ReferralRecord] = None


class ReferralConfirmRequest(BaseModel):
    chosen_facility_id: str
    staff_id: str


class ReferralRejectRequest(BaseModel):
    staff_id: str
    reason: Optional[str] = None
