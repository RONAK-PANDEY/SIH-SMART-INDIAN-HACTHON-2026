from fastapi import APIRouter, HTTPException, status
from typing import List, Optional
from services.appointment_service.service import AppointmentService
from services.appointment_service.models import (
    TokenCreateRequest,
    TokenGenerateRequest,
    TokenResponse,
    TokenScanRequest,
    TokenScanResponse,
    TokenCompleteResponse,
    SlotAvailabilityRequest,
    SlotItem,
    AppointmentBookingRequest,
    AppointmentDetails,
    QueueStatusResponse
)

appointment_router = APIRouter()
tokens_router = APIRouter()

# ---------------------------------------------------------
# Direct Turnstile / Android QR Scanner Router: /api/v1/tokens
# ---------------------------------------------------------

@tokens_router.post("/create", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def create_token_endpoint(req: TokenCreateRequest):
    """
    Create a real OPD queue token with SHA-256 QR verification hash,
    persist to Supabase DB, and notify WebSocket subscribers.
    """
    return await AppointmentService.create_token(req)

@tokens_router.post("/generate", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def generate_token_alias(req: TokenCreateRequest):
    """Alias for /create"""
    return await AppointmentService.create_token(req)

@tokens_router.post("/scan", response_model=TokenScanResponse)
async def scan_token_direct(req: TokenScanRequest):
    """
    Validate QR verification hash against DB record and transition status to 'scanned_by_staff'.
    Broadcasts real-time WebSocket event to patient, doctor console, and observer feed.
    """
    return await AppointmentService.scan_token(req)

@tokens_router.post("/{token_id}/complete", response_model=TokenCompleteResponse)
async def complete_token_direct(token_id: str):
    """
    Mark consultation as 'completed' in Supabase and broadcast completion event
    to patient, doctor, and observer portals simultaneously.
    """
    return await AppointmentService.complete_token(token_id)

@tokens_router.get("/{token_id}", response_model=TokenResponse)
async def get_token_direct(token_id: str):
    """
    Lookup real-time token tracking status.
    """
    token = AppointmentService.get_token_by_id(token_id)
    if not token:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Token {token_id} not found"
        )
    return token

@tokens_router.get("/active/{patient_id}", response_model=List[TokenResponse])
async def get_active_tokens_by_patient_direct(patient_id: str):
    """
    Retrieve all active queue tokens for a patient.
    """
    return AppointmentService.get_active_tokens_by_patient(patient_id)

@tokens_router.post("/{token_id}/cancel")
async def cancel_token_direct(token_id: str):
    """
    Cancel an active token.
    """
    success = AppointmentService.cancel_token(token_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Token {token_id} not found"
        )
    return {"status": "success", "message": f"Token {token_id} cancelled"}

# ---------------------------------------------------------
# Full Appointments Router: /api/v1/appointments
# ---------------------------------------------------------

@appointment_router.post("/tokens/create", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def apt_create_token(req: TokenCreateRequest):
    return await AppointmentService.create_token(req)

@appointment_router.post("/tokens/generate", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def apt_generate_token(req: TokenCreateRequest):
    return await AppointmentService.create_token(req)

@appointment_router.post("/tokens/scan", response_model=TokenScanResponse)
async def apt_scan_token(req: TokenScanRequest):
    return await AppointmentService.scan_token(req)

@appointment_router.post("/tokens/{token_id}/complete", response_model=TokenCompleteResponse)
async def apt_complete_token(token_id: str):
    return await AppointmentService.complete_token(token_id)

@appointment_router.get("/tokens/{token_id}", response_model=TokenResponse)
async def apt_get_token_by_id(token_id: str):
    token = AppointmentService.get_token_by_id(token_id)
    if not token:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Token {token_id} not found"
        )
    return token

@appointment_router.get("/tokens/active/{patient_id}", response_model=List[TokenResponse])
async def apt_get_active_tokens(patient_id: str):
    return AppointmentService.get_active_tokens_by_patient(patient_id)

@appointment_router.post("/slots/available", response_model=List[SlotItem])
async def get_available_slots(req: SlotAvailabilityRequest):
    return AppointmentService.get_available_slots(req)

@appointment_router.post("/book", response_model=AppointmentDetails, status_code=status.HTTP_201_CREATED)
async def book_appointment(req: AppointmentBookingRequest):
    return await AppointmentService.book_appointment(req)

@appointment_router.post("/tokens/{token_id}/cancel")
async def apt_cancel_token(token_id: str):
    success = AppointmentService.cancel_token(token_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Token {token_id} not found"
        )
    return {"status": "success", "message": f"Token {token_id} cancelled"}

@appointment_router.get("/hospital/{hospital_id}/department/{department_id}/queue", response_model=QueueStatusResponse)
async def get_department_queue(hospital_id: str, department_id: str):
    return AppointmentService.get_department_queue_status(hospital_id, department_id)
