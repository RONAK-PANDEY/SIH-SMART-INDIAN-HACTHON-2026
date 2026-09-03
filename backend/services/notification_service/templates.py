"""
Convenience builders that produce a title/message pair for each of the six
required notification events:
appointment confirmed, token generated, queue approaching, doctor called,
rescheduled, referral generated.

Routers/other services can call these instead of hand-writing copy, so
wording stays consistent.
"""

from __future__ import annotations

from .models import NotificationCreate, NotificationType


def appointment_confirmed(user_id: str, appointment_time: str, doctor_name: str, department: str) -> NotificationCreate:
    return NotificationCreate(
        user_id=user_id,
        type=NotificationType.APPOINTMENT_CONFIRMED,
        title="Appointment confirmed",
        message=f"Your appointment with {doctor_name} ({department}) is confirmed for {appointment_time}.",
        metadata={"appointment_time": appointment_time, "doctor_name": doctor_name, "department": department},
    )


def token_generated(user_id: str, token_number: str, department: str) -> NotificationCreate:
    return NotificationCreate(
        user_id=user_id,
        type=NotificationType.TOKEN_GENERATED,
        title="Token generated",
        message=f"Your token number is {token_number} for {department}.",
        metadata={"token_number": token_number, "department": department},
    )


def queue_approaching(user_id: str, token_number: str, patients_ahead: int) -> NotificationCreate:
    return NotificationCreate(
        user_id=user_id,
        type=NotificationType.QUEUE_APPROACHING,
        title="Your turn is approaching",
        message=f"Token {token_number}: {patients_ahead} patient(s) ahead of you. Please be ready.",
        metadata={"token_number": token_number, "patients_ahead": patients_ahead},
    )


def doctor_called(user_id: str, token_number: str, doctor_name: str, room: str) -> NotificationCreate:
    return NotificationCreate(
        user_id=user_id,
        type=NotificationType.DOCTOR_CALLED,
        title="Please proceed to the doctor",
        message=f"Token {token_number}: {doctor_name} is ready for you in {room}.",
        metadata={"token_number": token_number, "doctor_name": doctor_name, "room": room},
    )


def rescheduled(user_id: str, old_time: str, new_time: str, reason: str | None = None) -> NotificationCreate:
    message = f"Your appointment has been rescheduled from {old_time} to {new_time}."
    if reason:
        message += f" Reason: {reason}."
    return NotificationCreate(
        user_id=user_id,
        type=NotificationType.RESCHEDULED,
        title="Appointment rescheduled",
        message=message,
        metadata={"old_time": old_time, "new_time": new_time, "reason": reason},
    )


def referral_generated(user_id: str, referral_id: str, department: str, to_facility_name: str | None = None) -> NotificationCreate:
    if to_facility_name:
        message = f"A referral ({referral_id}) to {to_facility_name} for {department} has been generated."
    else:
        message = f"A referral ({referral_id}) for {department} has been generated and is pending facility selection."
    return NotificationCreate(
        user_id=user_id,
        type=NotificationType.REFERRAL_GENERATED,
        title="Referral generated",
        message=message,
        metadata={"referral_id": referral_id, "department": department, "to_facility_name": to_facility_name},
    )
