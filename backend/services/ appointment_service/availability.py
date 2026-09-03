"""
Slot availability logic.

schema.sql has no recurring-weekly-schedule or schedule-exception table for
doctors -- the only per-doctor scheduling input it provides is
`doctors.consultation_duration_minutes`. There is therefore no schema-backed
way to know a doctor's working hours or day-off exceptions.

ASSUMPTION (flagged in NOTES.md): every active doctor is available on every
day within a fixed clinic-wide working window, configurable via env vars
`CLINIC_OPEN_TIME` / `CLINIC_CLOSE_TIME` (defaults 09:00-17:00, UTC, matching
the ISO-8601 UTC convention in api-contracts.md). The window is sliced into
back-to-back slots of `doctor.consultation_duration_minutes` each. A slot is
`available: false` if any *active* (`scheduled` or `confirmed`) appointment
for that doctor overlaps it.

If/when a real doctor-schedule table is added to schema.sql, replace
`_working_window()` with a lookup against it -- everything downstream
(slot slicing, overlap check) stays the same.
"""
from __future__ import annotations

import datetime as dt
import os
import uuid
from typing import List

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.models import Appointment, Doctor
from app.schemas.schemas import AvailabilitySlot

_OPEN = dt.time.fromisoformat(os.environ.get("CLINIC_OPEN_TIME", "09:00"))
_CLOSE = dt.time.fromisoformat(os.environ.get("CLINIC_CLOSE_TIME", "17:00"))


def _working_window(target_date: dt.date) -> tuple[dt.datetime, dt.datetime]:
    start = dt.datetime.combine(target_date, _OPEN, tzinfo=dt.timezone.utc)
    end = dt.datetime.combine(target_date, _CLOSE, tzinfo=dt.timezone.utc)
    return start, end


def compute_availability(
    db: Session, doctor: Doctor, target_date: dt.date
) -> List[AvailabilitySlot]:
    window_start, window_end = _working_window(target_date)
    duration = dt.timedelta(minutes=doctor.consultation_duration_minutes or 15)

    booked_stmt = select(Appointment.scheduled_at).where(
        Appointment.doctor_id == doctor.id,
        Appointment.status.in_(("scheduled", "confirmed")),
        Appointment.scheduled_at >= window_start,
        Appointment.scheduled_at < window_end,
    )
    booked_starts = {row[0] for row in db.execute(booked_stmt).all()}

    slots: List[AvailabilitySlot] = []
    cursor = window_start
    while cursor + duration <= window_end:
        is_booked = cursor in booked_starts
        slots.append(
            AvailabilitySlot(
                start_time=cursor.time().isoformat(timespec="minutes"),
                end_time=(cursor + duration).time().isoformat(timespec="minutes"),
                available=not is_booked,
            )
        )
        cursor += duration
    return slots


def slot_start_is_valid(db: Session, doctor: Doctor, scheduled_at: dt.datetime) -> bool:
    """A booking is only valid if it lands exactly on one of the doctor's slot boundaries."""
    window_start, window_end = _working_window(scheduled_at.date())
    if not (window_start <= scheduled_at < window_end):
        return False
    duration = dt.timedelta(minutes=doctor.consultation_duration_minutes or 15)
    delta = scheduled_at - window_start
    return delta.total_seconds() % duration.total_seconds() == 0
