from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional

from .interfaces import (
    Token,
    TokenNotFoundError,
    queue_engine,
    websocket_gateway,
)
from .schemas import (
    CallNextRequest,
    CallNextResponse,
    CompleteConsultationRequest,
    CompleteConsultationResponse,
    ConsultationRecordOut,
    TokenOut,
)

# Socket event names — keep in sync with any frontend/socket client contract.
EVENT_PATIENT_CALLED = "patient_called"
EVENT_QUEUE_UPDATED = "queue_updated"
EVENT_CONSULTATION_COMPLETED = "consultation_completed"
EVENT_REFERRAL_CREATED = "referral_created"


class ConsultationNotActiveError(Exception):
    """Raised when trying to complete a consultation for a token that isn't
    currently assigned to the requesting doctor / isn't in_consultation."""


def _token_to_out(token: Token) -> TokenOut:
    return TokenOut(
        token_id=token.id,
        patient_id=token.patient_id,
        department_id=token.department_id,
        queue_position=token.queue_position,
        status=token.status,
        doctor_id=token.doctor_id,
    )


class ConsultationStore:
    """Persists completed-consultation records.

    In-memory by default; swap out with a real repository (DB-backed) by
    passing a compatible object into DoctorConsoleService(store=...).
    """

    def __init__(self) -> None:
        self._records: dict[str, ConsultationRecordOut] = {}

    async def save(self, record: ConsultationRecordOut) -> None:
        self._records[record.token_id] = record

    async def get(self, token_id: str) -> Optional[ConsultationRecordOut]:
        return self._records.get(token_id)


class DoctorConsoleService:
    def __init__(self, store: Optional[ConsultationStore] = None) -> None:
        self.store = store or ConsultationStore()

    async def call_next_patient(self, req: CallNextRequest) -> CallNextResponse:
        token = await queue_engine.pull_next(
            department_id=req.department_id,
            doctor_id=req.doctor_id,
        )

        if token is None:
            return CallNextResponse(
                called=False,
                token=None,
                message="Queue is empty for this department.",
            )

        token_out = _token_to_out(token)
        payload = token_out.model_dump()
        payload["room_id"] = req.room_id

        # Notify the department board (waiting room screens / other staff)
        await websocket_gateway.broadcast(
            channel=f"department:{req.department_id}",
            event=EVENT_PATIENT_CALLED,
            payload=payload,
        )
        # Notify the specific patient's client/device
        await websocket_gateway.broadcast(
            channel=f"patient:{token.patient_id}",
            event=EVENT_PATIENT_CALLED,
            payload=payload,
        )
        # Let the doctor's own console(s) sync state (e.g. if open in 2 tabs)
        await websocket_gateway.broadcast(
            channel=f"doctor:{req.doctor_id}",
            event=EVENT_QUEUE_UPDATED,
            payload=payload,
        )

        return CallNextResponse(called=True, token=token_out, message=None)

    async def complete_consultation(
        self, req: CompleteConsultationRequest
    ) -> CompleteConsultationResponse:
        token = await queue_engine.get_token(req.token_id)
        if token is None:
            raise TokenNotFoundError(req.token_id)

        if token.status != "in_consultation" or token.doctor_id != req.doctor_id:
            raise ConsultationNotActiveError(
                f"Token {req.token_id} is not an active consultation for "
                f"doctor {req.doctor_id} (status={token.status}, "
                f"assigned_doctor={token.doctor_id})."
            )

        completed_token = await queue_engine.mark_completed(req.token_id)

        referral_token_id: Optional[str] = None
        if req.referral is not None:
            referral_token = await queue_engine.requeue_for_referral(
                token_id=req.token_id,
                target_department_id=req.referral.target_department_id,
            )
            referral_token_id = referral_token.id

        record = ConsultationRecordOut(
            token_id=completed_token.id,
            patient_id=completed_token.patient_id,
            doctor_id=req.doctor_id,
            visit_summary=req.visit_summary,
            notes=req.notes,
            prescription_summary=req.prescription_summary,
            follow_up=req.follow_up,
            referral_token_id=referral_token_id,
            completed_at=datetime.now(timezone.utc),
        )
        await self.store.save(record)

        payload = record.model_dump(mode="json")

        await websocket_gateway.broadcast(
            channel=f"department:{completed_token.department_id}",
            event=EVENT_CONSULTATION_COMPLETED,
            payload=payload,
        )
        await websocket_gateway.broadcast(
            channel=f"patient:{completed_token.patient_id}",
            event=EVENT_CONSULTATION_COMPLETED,
            payload=payload,
        )

        if req.referral is not None and referral_token_id is not None:
            referral_payload = {
                "source_token_id": req.token_id,
                "new_token_id": referral_token_id,
                "patient_id": completed_token.patient_id,
                "target_department_id": req.referral.target_department_id,
                "reason": req.referral.reason,
            }
            await websocket_gateway.broadcast(
                channel=f"department:{req.referral.target_department_id}",
                event=EVENT_REFERRAL_CREATED,
                payload=referral_payload,
            )
            await websocket_gateway.broadcast(
                channel=f"patient:{completed_token.patient_id}",
                event=EVENT_REFERRAL_CREATED,
                payload=referral_payload,
            )

        return CompleteConsultationResponse(completed=True, record=record)


# Module-level singleton for convenience; router and socket handlers share it
# so state (e.g. the in-memory ConsultationStore) is consistent per-process.
doctor_console_service = DoctorConsoleService()
