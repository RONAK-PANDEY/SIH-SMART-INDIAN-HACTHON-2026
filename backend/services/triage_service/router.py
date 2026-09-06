"""
FastAPI Router for Triage AI, 100+ Symptoms Taxonomy, Aadhaar Verification, and Inter-Hospital Referrals.
"""

from fastapi import APIRouter, HTTPException, Body
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from services.triage_service.triage_ai_service import TriageAIService
from services.auth_service.aadhaar_abha_service import AadhaarABHAService
from services.referral_service.hospital_network_service import HospitalNetworkService

triage_router = APIRouter()


class TriageEvaluationRequest(BaseModel):
    symptom_ids: List[str] = []
    free_text_description: str = ""
    vulnerability: Dict[str, bool] = {"senior": False, "pregnant": False, "differentlyAbled": False}
    aadhaar_age: Optional[int] = None
    hospital_id: Optional[str] = "hosp-aiims-delhi"


class AadhaarOTPRequest(BaseModel):
    aadhaar_or_phone: str


class AadhaarVerifyRequest(BaseModel):
    aadhaar_or_phone: str
    otp: str


@triage_router.get("/symptoms-taxonomy")
async def get_symptoms_taxonomy():
    """Retrieve full 100+ categorized medical symptoms list."""
    return {
        "status": "success",
        "taxonomy": TriageAIService.get_all_symptoms()
    }


@triage_router.get("/helpdesk-contacts")
async def get_helpdesk_contacts():
    """Retrieve verified doctor, triage nurse, ambulance, and counter helpline numbers."""
    return {
        "status": "success",
        "contacts": TriageAIService.get_contacts()
    }


@triage_router.post("/evaluate")
async def evaluate_triage(req: TriageEvaluationRequest):
    """
    Evaluates patient symptoms, free-text description, and priority criteria.
    Returns urgency rating, predicted specialty, doctor details, and hospital referral suggestions.
    """
    evaluation = TriageAIService.evaluate_triage(
        selected_symptom_ids=req.symptom_ids,
        free_text_description=req.free_text_description,
        vulnerability=req.vulnerability,
        aadhaar_age=req.aadhaar_age
    )
    
    # Check hospital load & inter-hospital referral suggestion
    load_analysis = HospitalNetworkService.check_hospital_load_and_suggest_referral(
        current_hospital_id=req.hospital_id or "hosp-aiims-delhi",
        department_id=evaluation["department_id"]
    )

    return {
        "status": "success",
        "evaluation": evaluation,
        "hospital_load_analysis": load_analysis
    }


@triage_router.get("/hospitals-network")
async def get_hospitals_network():
    """Returns real-time congestion and wait times across connected city hospitals."""
    return {
        "status": "success",
        "hospitals": HospitalNetworkService.get_all_hospitals()
    }


@triage_router.post("/auth/aadhaar/send-otp")
async def send_aadhaar_otp(req: AadhaarOTPRequest):
    """Simulates sending an OTP to linked Aadhaar / ABHA mobile."""
    return AadhaarABHAService.send_otp(req.aadhaar_or_phone)


@triage_router.post("/auth/aadhaar/verify-otp")
async def verify_aadhaar_otp(req: AadhaarVerifyRequest):
    """Verifies simulated OTP and returns government verified citizen demographic data."""
    return AadhaarABHAService.verify_otp_and_fetch_profile(req.aadhaar_or_phone, req.otp)
