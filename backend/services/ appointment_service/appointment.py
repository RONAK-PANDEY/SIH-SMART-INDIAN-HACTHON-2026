from __future__ import annotations

import datetime as dt
import uuid
from typing import Optional

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.models import Appointment, Department, Doctor, Hospital, Patient
from shared.auth import conflict, not_found, validation_error

ACTIVE_STATUSES = ("scheduled", "confirmed")


def get_doctor(db: Session, doctor_id: uuid.UUID) -> Optional[Doctor]:
    return db.get(Doctor, doctor_id)


def get_department(db: Session, department_id: uuid.UUID) -> Optional[Department]:
    return db.get(Department, department_id)


def get_hospital(db: Session, hospital_id: uuid.UUID) -> Optional[Hospital]:
    return db.get(Hospital, hospital_id)


def get_patient(db: Session, patient_id: uuid.UUID) -> Optional[Patient]:
    return db.get(Patient, patient_id)


def get_appointment(db: Session, appointment_id: uuid.UUID) -> Optional[Appointment]:
    return db.get(Appointment, appointment_id)


def _check_double_booking(db: Session, doctor_id: uuid.UUID, scheduled_at: dt.datetime, exclude_id: Optional[uuid.UUID] = None) -> None:
    """
    schema.sql has no unique/exclusion constraint on (doctor_id, scheduled_at) --
    unlike an earlier scaffold's assumption, double-booking must be enforced
    entirely at the application layer here. We take a row-level lock on the
    doctor row first (SELECT ... FOR UPDATE) so concurrent booking attempts
    for the same doctor serialize against each other before the overlap
    check runs, closing the race window a plain SELECT-then-INSERT would
    leave open.
    """
    db.execute(select(Doctor.id).where(Doctor.id == doctor_id).with_for_update())

    stmt = select(func.count()).select_from(Appointment).where(
        Appointment.doctor_id == doctor_id,
        Appointment.scheduled_at == scheduled_at,
        Appointment.status.in_(ACTIVE_STATUSES),
    )
    if exclude_id is not None:
        stmt = stmt.where(Appointment.id != exclude_id)

    if db.execute(stmt).scalar_one() > 0:
        raise conflict("This doctor already has an active appointment at that time")


def create_appointment(db: Session, data: dict) -> Appointment:
    # The FOR UPDATE lock inside _check_double_booking plus this single
    # commit form the atomic unit: the lock is held until commit/rollback,
    # so no other transaction can pass its own lock acquisition for the
    # same doctor until this one has either committed the new appointment
    # or rolled back.
    try:
        _check_double_booking(db, data["doctor_id"], data["scheduled_at"])
        appointment = Appointment(**data)
        db.add(appointment)
        db.commit()
    except Exception:
        db.rollback()
        raise
    db.refresh(appointment)
    return appointment


def update_appointment(db: Session, appointment: Appointment, data: dict) -> Appointment:
    new_doctor_id = data.get("doctor_id", appointment.doctor_id)
    new_scheduled_at = data.get("scheduled_at", appointment.scheduled_at)

    try:
        if "doctor_id" in data or "scheduled_at" in data:
            _check_double_booking(db, new_doctor_id, new_scheduled_at, exclude_id=appointment.id)
        for key, value in data.items():
            setattr(appointment, key, value)
        db.commit()
    except Exception:
        db.rollback()
        raise
    db.refresh(appointment)
    return appointment


def set_status(db: Session, appointment: Appointment, status: str, notes: Optional[str] = None) -> Appointment:
    appointment.status = status
    if notes is not None:
        appointment.notes = notes
    db.commit()
    db.refresh(appointment)
    return appointment


def list_appointments(
    db: Session,
    *,
    patient_id: Optional[uuid.UUID],
    doctor_id: Optional[uuid.UUID],
    hospital_id: Optional[uuid.UUID],
    department_id: Optional[uuid.UUID],
    status: Optional[str],
    date_from: Optional[dt.datetime],
    date_to: Optional[dt.datetime],
    offset: int,
    limit: int,
):
    stmt = select(Appointment)
    if patient_id:
        stmt = stmt.where(Appointment.patient_id == patient_id)
    if doctor_id:
        stmt = stmt.where(Appointment.doctor_id == doctor_id)
    if hospital_id:
        stmt = stmt.where(Appointment.hospital_id == hospital_id)
    if department_id:
        stmt = stmt.where(Appointment.department_id == department_id)
    if status:
        stmt = stmt.where(Appointment.status == status)
    if date_from:
        stmt = stmt.where(Appointment.scheduled_at >= date_from)
    if date_to:
        stmt = stmt.where(Appointment.scheduled_at <= date_to)

    total = db.execute(select(func.count()).select_from(stmt.subquery())).scalar_one()
    rows = (
        db.execute(stmt.order_by(Appointment.scheduled_at.desc()).offset(offset).limit(limit))
        .scalars()
        .all()
    )
    return rows, total
