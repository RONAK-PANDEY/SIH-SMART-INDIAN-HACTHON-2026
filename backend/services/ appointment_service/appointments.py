from __future__ import annotations

import datetime as dt
import uuid
from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.crud import appointment as crud
from app.crud.availability import compute_availability, slot_start_is_valid
from app.database import get_db
from app.schemas.schemas import (
    AppointmentCancel,
    AppointmentComplete,
    AppointmentCreate,
    AppointmentOut,
    AppointmentUpdate,
    AvailabilityOut,
)
from shared.auth import CurrentUser, forbidden, get_current_user, not_found, validation_error
from shared.pagination import PageParams, build_page

router = APIRouter(prefix="/api/v1/appointments", tags=["appointments"])


def _is_own_patient_appt(user: CurrentUser, appt) -> bool:
    return user.role == "patient" and user.patient_id is not None and str(appt.patient_id) == user.patient_id


def _is_own_doctor_appt(user: CurrentUser, appt) -> bool:
    return user.role == "doctor" and user.doctor_id is not None and str(appt.doctor_id) == user.doctor_id


def _get_or_404(db: Session, appointment_id: uuid.UUID):
    appt = crud.get_appointment(db, appointment_id)
    if appt is None:
        raise not_found("Appointment not found")
    return appt


@router.post("", response_model=dict, status_code=201)
def create_appointment(
    body: AppointmentCreate,
    db: Session = Depends(get_db),
    user: CurrentUser = Depends(get_current_user),
):
    if user.role == "patient":
        if user.patient_id is None:
            raise validation_error("Your account is not linked to a patient record")
        patient_id = uuid.UUID(user.patient_id)
    elif user.has_min_role("staff"):
        if body.patient_id is None:
            raise validation_error("patient_id is required")
        patient_id = body.patient_id
    else:
        raise forbidden()

    if crud.get_patient(db, patient_id) is None:
        raise validation_error("patient_id does not reference an existing patient")
    doctor = crud.get_doctor(db, body.doctor_id)
    if doctor is None or not doctor.is_active:
        raise validation_error("doctor_id does not reference an active doctor")
    if crud.get_hospital(db, body.hospital_id) is None:
        raise validation_error("hospital_id does not reference an existing hospital")
    if crud.get_department(db, body.department_id) is None:
        raise validation_error("department_id does not reference an existing department")

    scheduled_at = body.scheduled_at
    if scheduled_at.tzinfo is None:
        scheduled_at = scheduled_at.replace(tzinfo=dt.timezone.utc)
    if scheduled_at <= dt.datetime.now(dt.timezone.utc):
        raise validation_error("scheduled_at must be in the future")
    if not slot_start_is_valid(db, doctor, scheduled_at):
        raise validation_error("scheduled_at does not align with this doctor's available slots")

    data = {
        "patient_id": patient_id,
        "doctor_id": body.doctor_id,
        "hospital_id": body.hospital_id,
        "department_id": body.department_id,
        "scheduled_at": scheduled_at,
        "reason": body.reason,
        "status": "scheduled",
    }
    appt = crud.create_appointment(db, data)
    return {"appointment": AppointmentOut.model_validate(appt).model_dump(mode="json")}


@router.get("", response_model=dict)
def list_appointments(
    patient_id: Optional[uuid.UUID] = None,
    doctor_id: Optional[uuid.UUID] = None,
    hospital_id: Optional[uuid.UUID] = None,
    department_id: Optional[uuid.UUID] = None,
    status: Optional[str] = None,
    date_from: Optional[dt.datetime] = None,
    date_to: Optional[dt.datetime] = None,
    params: PageParams = Depends(),
    db: Session = Depends(get_db),
    user: CurrentUser = Depends(get_current_user),
):
    if user.role == "patient":
        if user.patient_id is None:
            raise forbidden()
        patient_id = uuid.UUID(user.patient_id)
    elif user.role == "doctor":
        if user.doctor_id is None:
            raise forbidden()
        doctor_id = uuid.UUID(user.doctor_id)
    elif not user.has_min_role("staff"):
        raise forbidden()

    rows, total = crud.list_appointments(
        db,
        patient_id=patient_id,
        doctor_id=doctor_id,
        hospital_id=hospital_id,
        department_id=department_id,
        status=status,
        date_from=date_from,
        date_to=date_to,
        offset=params.offset,
        limit=params.page_size,
    )
    items = [AppointmentOut.model_validate(r).model_dump(mode="json") for r in rows]
    return build_page(items, total, params)


@router.get("/availability", response_model=dict)
def get_availability(
    doctor_id: uuid.UUID,
    date: dt.date,
    db: Session = Depends(get_db),
    user: CurrentUser = Depends(get_current_user),
):
    doctor = crud.get_doctor(db, doctor_id)
    if doctor is None:
        raise not_found("Doctor not found")
    slots = compute_availability(db, doctor, date)
    return {
        "doctor_id": str(doctor_id),
        "date": date.isoformat(),
        "slots": [s.model_dump() for s in slots],
    }


@router.get("/{appointment_id}", response_model=dict)
def get_appointment(
    appointment_id: uuid.UUID,
    db: Session = Depends(get_db),
    user: CurrentUser = Depends(get_current_user),
):
    appt = _get_or_404(db, appointment_id)
    if not (user.has_min_role("staff") or _is_own_patient_appt(user, appt) or _is_own_doctor_appt(user, appt)):
        raise forbidden()
    return {"appointment": AppointmentOut.model_validate(appt).model_dump(mode="json")}


@router.patch("/{appointment_id}", response_model=dict)
def update_appointment(
    appointment_id: uuid.UUID,
    body: AppointmentUpdate,
    db: Session = Depends(get_db),
    user: CurrentUser = Depends(get_current_user),
):
    appt = _get_or_404(db, appointment_id)
    data = body.model_dump(exclude_unset=True)

    if user.has_min_role("staff"):
        pass  # staff+ may reschedule freely
    elif _is_own_patient_appt(user, appt):
        if appt.status != "scheduled":
            raise forbidden("You can only edit your own upcoming scheduled appointments")
        if appt.scheduled_at <= dt.datetime.now(dt.timezone.utc):
            raise forbidden("This appointment is no longer upcoming")
        disallowed = set(data.keys()) - {"reason"}
        if disallowed:
            raise forbidden("Patients may only update the 'reason' field")
    else:
        raise forbidden()

    if "doctor_id" in data:
        doctor = crud.get_doctor(db, data["doctor_id"])
        if doctor is None or not doctor.is_active:
            raise validation_error("doctor_id does not reference an active doctor")
    if "department_id" in data and crud.get_department(db, data["department_id"]) is None:
        raise validation_error("department_id does not reference an existing department")

    if "scheduled_at" in data:
        scheduled_at = data["scheduled_at"]
        if scheduled_at.tzinfo is None:
            scheduled_at = scheduled_at.replace(tzinfo=dt.timezone.utc)
        data["scheduled_at"] = scheduled_at
        doctor_for_check = crud.get_doctor(db, data.get("doctor_id", appt.doctor_id))
        if not slot_start_is_valid(db, doctor_for_check, scheduled_at):
            raise validation_error("scheduled_at does not align with this doctor's available slots")
        # Rescheduling a confirmed appointment reverts it to pending review
        # by staff; per api-contracts.md the only statuses are scheduled/
        # confirmed/cancelled/completed/no_show (no separate "pending"
        # status exists here), so we revert to 'scheduled' to signal it
        # needs re-confirmation.
        if appt.status == "confirmed":
            data["status"] = "scheduled"

    appt = crud.update_appointment(db, appt, data)
    return {"appointment": AppointmentOut.model_validate(appt).model_dump(mode="json")}


@router.post("/{appointment_id}/confirm", response_model=dict)
def confirm_appointment(
    appointment_id: uuid.UUID,
    db: Session = Depends(get_db),
    user: CurrentUser = Depends(get_current_user),
):
    if not user.has_min_role("staff"):
        raise forbidden()
    appt = _get_or_404(db, appointment_id)
    if appt.status != "scheduled":
        raise validation_error("Only 'scheduled' appointments can be confirmed")
    appt = crud.set_status(db, appt, "confirmed")
    return {"appointment": AppointmentOut.model_validate(appt).model_dump(mode="json")}


@router.post("/{appointment_id}/cancel", response_model=dict)
def cancel_appointment(
    appointment_id: uuid.UUID,
    body: AppointmentCancel,
    db: Session = Depends(get_db),
    user: CurrentUser = Depends(get_current_user),
):
    appt = _get_or_404(db, appointment_id)
    if not (user.has_min_role("staff") or _is_own_patient_appt(user, appt)):
        raise forbidden()
    if appt.status in ("cancelled", "completed", "no_show"):
        raise validation_error(f"Cannot cancel an appointment with status '{appt.status}'")
    notes = f"Cancelled: {body.reason}" if body.reason else appt.notes
    appt = crud.set_status(db, appt, "cancelled", notes=notes)
    return {"appointment": AppointmentOut.model_validate(appt).model_dump(mode="json")}


@router.post("/{appointment_id}/complete", response_model=dict)
def complete_appointment(
    appointment_id: uuid.UUID,
    body: AppointmentComplete,
    db: Session = Depends(get_db),
    user: CurrentUser = Depends(get_current_user),
):
    appt = _get_or_404(db, appointment_id)
    if not (user.has_min_role("staff") or _is_own_doctor_appt(user, appt)):
        raise forbidden()
    if appt.status not in ("scheduled", "confirmed"):
        raise validation_error(f"Cannot complete an appointment with status '{appt.status}'")
    appt = crud.set_status(db, appt, "completed", notes=body.notes if body.notes is not None else appt.notes)
    return {"appointment": AppointmentOut.model_validate(appt).model_dump(mode="json")}


@router.post("/{appointment_id}/no-show", response_model=dict)
def no_show_appointment(
    appointment_id: uuid.UUID,
    db: Session = Depends(get_db),
    user: CurrentUser = Depends(get_current_user),
):
    if not user.has_min_role("staff"):
        raise forbidden()
    appt = _get_or_404(db, appointment_id)
    if appt.status not in ("scheduled", "confirmed"):
        raise validation_error(f"Cannot mark a '{appt.status}' appointment as no-show")
    appt = crud.set_status(db, appt, "no_show")
    return {"appointment": AppointmentOut.model_validate(appt).model_dump(mode="json")}
