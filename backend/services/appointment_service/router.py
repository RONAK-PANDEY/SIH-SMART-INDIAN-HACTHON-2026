from fastapi import APIRouter, HTTPException, status
from typing import List
from services.appointment_service.service import AppointmentService
from services.appointment_service.models import (
    TokenGenerateRequest,
    TokenResponse,
    SlotAvailabilityRequest,
    SlotItem,
    AppointmentBookingRequest,
    AppointmentDetails,
    QueueStatusResponse
)

appointment_router = APIRouter()

@appointment_router.post("/tokens/generate", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def generate_token(req: TokenGenerateRequest):
    """
    Generate dynamic OPD Queue Token with AI Triage priority scoring & vulnerability weights.
    """
    return AppointmentService.generate_token(req)

@appointment_router.get("/tokens/{token_id}", response_model=TokenResponse)
async def get_token_by_id(token_id: str):
    """
    Get real-time token tracking status, current queue position and estimated wait.
    """
    token = AppointmentService.get_token_by_id(token_id)
    if not token:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Token {token_id} not found"
        )
    return token

@appointment_router.get("/tokens/active/{patient_id}", response_model=List[TokenResponse])
async def get_active_tokens_by_patient(patient_id: str):
    """
    Retrieve all currently active tokens for a given patient.
    """
    return AppointmentService.get_active_tokens_by_patient(patient_id)

@appointment_router.post("/slots/available", response_model=List[SlotItem])
async def get_available_slots(req: SlotAvailabilityRequest):
    """
    Retrieve available OPD consultation slots for a specific hospital and clinical department.
    """
    return AppointmentService.get_available_slots(req)

@appointment_router.post("/book", response_model=AppointmentDetails, status_code=status.HTTP_201_CREATED)
async def book_appointment(req: AppointmentBookingRequest):
    """
    Book scheduled OPD consultation appointment and issue priority queue token.
    """
    return AppointmentService.book_appointment(req)

@appointment_router.post("/tokens/{token_id}/cancel")
async def cancel_token(token_id: str):
    """
    Cancel an active token or appointment.
    """
    success = AppointmentService.cancel_token(token_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Token {token_id} not found"
        )
    return {"status": "success", "message": f"Token {token_id} cancelled"}

@appointment_router.get("/hospital/{hospital_id}/department/{department_id}/queue", response_model=QueueStatusResponse)
async def get_department_queue(hospital_id: str, department_id: str):
    """
    Get live OPD department queue status including currently serving token and wait estimates.
    """
    return AppointmentService.get_department_queue_status(hospital_id, department_id)
