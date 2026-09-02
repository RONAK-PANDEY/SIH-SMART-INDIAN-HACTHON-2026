from __future__ import annotations

from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, Query

from .. import store
from ..data.facilities import get_facility
from ..models import (
    ReferralConfirmRequest,
    ReferralEvaluationResponse,
    ReferralRecord,
    ReferralRejectRequest,
    ReferralStatus,
    TriageEvaluationRequest,
)
from ..notifier_client import send_notification
from ..rules_engine import UnmappedConditionError, evaluate

router = APIRouter(prefix="/referrals", tags=["referrals"])


@router.post("/evaluate", response_model=ReferralEvaluationResponse)
def evaluate_triage(payload: TriageEvaluationRequest) -> ReferralEvaluationResponse:
    """
    Entry point for rule 1: called on triage completion or triage upgrade.
    Runs the full rules-engine chain (rules 1-6) and, if triggered,
    persists a PENDING referral record with ranked alternate-facility
    recommendations. Never auto-transfers - staff must confirm via
    /referrals/{id}/confirm.
    """
    from_facility = get_facility(payload.facility_id)
    if from_facility is None:
        raise HTTPException(status_code=404, detail=f"Unknown facility_id '{payload.facility_id}'")

    try:
        result = evaluate(payload)
    except UnmappedConditionError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc

    if not result.triggered:
        return ReferralEvaluationResponse(triggered=False, reason=result.reason, referral=None)

    now = datetime.now(timezone.utc)
    record = ReferralRecord(
        referral_id=store.next_referral_id(),
        patient_id=payload.patient_id,
        from_facility_id=payload.facility_id,
        from_facility_name=from_facility["name"],
        to_facility_id=None,
        to_facility_name=None,
        department=result.specialty,
        condition=payload.condition,
        priority=payload.triage_priority,
        status=ReferralStatus.PENDING,
        trigger_reason=result.reason,
        recommendations=result.recommendations,
        created_at=now,
        updated_at=now,
    )
    store.save(record)

    # Notify the requesting staff member (and/or care team) that a referral
    # prompt has been generated. Best-effort; does not block the response.
    if payload.requested_by_staff_id:
        send_notification(
            user_id=payload.requested_by_staff_id,
            notification_type="REFERRAL_GENERATED",
            title="Referral generated",
            message=(
                f"Referral {record.referral_id} generated for patient "
                f"{payload.patient_id} ({result.specialty}). "
                f"{len(result.recommendations)} alternate facility option(s) available."
            ),
            metadata={"referral_id": record.referral_id, "department": result.specialty},
        )

    return ReferralEvaluationResponse(triggered=True, reason=result.reason, referral=record)


@router.get("", response_model=list[ReferralRecord])
def list_referrals(
    facility_id: str | None = Query(None),
    status: ReferralStatus | None = Query(None),
) -> list[ReferralRecord]:
    return store.list_all(facility_id=facility_id, status=status.value if status else None)


@router.get("/{referral_id}", response_model=ReferralRecord)
def get_referral(referral_id: str) -> ReferralRecord:
    record = store.get(referral_id)
    if record is None:
        raise HTTPException(status_code=404, detail="Referral not found")
    return record


@router.post("/{referral_id}/confirm", response_model=ReferralRecord)
def confirm_referral(referral_id: str, payload: ReferralConfirmRequest) -> ReferralRecord:
    """
    Staff confirmation step (rule 6, final sentence): the system never
    auto-transfers a patient. Staff explicitly pick one of the
    recommended facilities (or any valid facility) to finalize the
    transfer.
    """
    record = store.get(referral_id)
    if record is None:
        raise HTTPException(status_code=404, detail="Referral not found")
    if record.status != ReferralStatus.PENDING:
        raise HTTPException(status_code=409, detail=f"Referral is not pending (status={record.status.value})")

    chosen = get_facility(payload.chosen_facility_id)
    if chosen is None:
        raise HTTPException(status_code=404, detail=f"Unknown facility_id '{payload.chosen_facility_id}'")

    now = datetime.now(timezone.utc)
    record.to_facility_id = payload.chosen_facility_id
    record.to_facility_name = chosen["name"]
    record.status = ReferralStatus.CONFIRMED
    record.confirmed_by_staff_id = payload.staff_id
    record.confirmed_at = now
    record.updated_at = now
    store.save(record)

    send_notification(
        user_id=record.patient_id,
        notification_type="REFERRAL_GENERATED",
        title="Referral confirmed",
        message=(
            f"Your referral to {chosen['name']} ({record.department}) has "
            f"been confirmed by staff."
        ),
        metadata={"referral_id": record.referral_id, "to_facility_id": record.to_facility_id},
    )

    return record


@router.post("/{referral_id}/reject", response_model=ReferralRecord)
def reject_referral(referral_id: str, payload: ReferralRejectRequest) -> ReferralRecord:
    record = store.get(referral_id)
    if record is None:
        raise HTTPException(status_code=404, detail="Referral not found")
    if record.status != ReferralStatus.PENDING:
        raise HTTPException(status_code=409, detail=f"Referral is not pending (status={record.status.value})")

    now = datetime.now(timezone.utc)
    record.status = ReferralStatus.REJECTED
    record.confirmed_by_staff_id = payload.staff_id
    record.updated_at = now
    if payload.reason:
        record.trigger_reason += f" | Rejected: {payload.reason}"
    store.save(record)
    return record
