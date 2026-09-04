from pydantic import BaseModel
from typing import List, Optional, Dict
from services.triage_service.rules import evaluate_esi_level

class TriageAssessmentRequest(BaseModel):
    patient_id: str
    symptoms: List[str]
    chief_complaint: Optional[str] = None
    vitals: Optional[Dict[str, float]] = None

class TriageAssessmentResponse(BaseModel):
    esi_level: int
    category: str
    recommended_action: str
    auto_priority_boost: bool

class TriageService:
    @staticmethod
    def evaluate(request: TriageAssessmentRequest) -> TriageAssessmentResponse:
        level = evaluate_esi_level(request.symptoms, request.vitals)
        
        category_map = {
            1: "Resuscitation (Immediate)",
            2: "Emergent (High Risk)",
            3: "Urgent",
            4: "Less Urgent",
            5: "Non-Urgent"
        }
        
        action_map = {
            1: "Direct transfer to Emergency Trauma / Resuscitation Bay",
            2: "Expedited Head-of-Queue OPD Allocation",
            3: "Priority OPD Allocation",
            4: "Standard Queuing",
            5: "Routine Queue / Tele-consultation Eligible"
        }
        
        return TriageAssessmentResponse(
            esi_level=level,
            category=category_map.get(level, "Standard"),
            recommended_action=action_map.get(level, "Standard OPD"),
            auto_priority_boost=(level <= 3)
        )
