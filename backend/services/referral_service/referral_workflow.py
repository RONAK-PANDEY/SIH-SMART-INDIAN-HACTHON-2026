from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ReferralRequest(BaseModel):
    patient_id: str
    from_hospital_id: str
    to_hospital_id: str
    department_id: str
    reason: str
    clinical_notes: Optional[str] = None
    urgency_level: str = "HIGH"

class ReferralResponse(BaseModel):
    referral_id: str
    status: str
    assigned_destination_token: str
    fast_track_validity_hours: int
    created_at: str

class ReferralWorkflowService:
    @staticmethod
    def process_referral(request: ReferralRequest) -> ReferralResponse:
        return ReferralResponse(
            referral_id=f"REF-2026-{abs(hash(request.patient_id)) % 10000}",
            status="ACCEPTED",
            assigned_destination_token="FAST-CARD-007",
            fast_track_validity_hours=3,
            created_at=datetime.utcnow().isoformat()
        )
