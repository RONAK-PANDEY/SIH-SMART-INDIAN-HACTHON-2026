from __future__ import annotations

from fastapi import APIRouter, HTTPException

from .interfaces import TokenNotFoundError
from .schemas import (
    CallNextRequest,
    CallNextResponse,
    CompleteConsultationRequest,
    CompleteConsultationResponse,
)
from .service import ConsultationNotActiveError, doctor_console_service

router = APIRouter(prefix="/doctor-console", tags=["doctor-console"])


@router.post("/call-next", response_model=CallNextResponse)
async def call_next_patient(req: CallNextRequest) -> CallNextResponse:
    """Pull the next token off the queue for this doctor's department and
    broadcast the call to the department board, the patient, and the
    doctor's own connected clients."""
    return await doctor_console_service.call_next_patient(req)


@router.post("/complete-consultation", response_model=CompleteConsultationResponse)
async def complete_consultation(
    req: CompleteConsultationRequest,
) -> CompleteConsultationResponse:
    """Record the outcome of a consultation (summary, notes, prescription,
    follow-up, optional referral) and broadcast completion."""
    try:
        return await doctor_console_service.complete_consultation(req)
    except TokenNotFoundError as exc:
        raise HTTPException(status_code=404, detail=f"Token not found: {exc}") from exc
    except ConsultationNotActiveError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc
