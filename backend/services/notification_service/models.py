from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field


class NotificationType(str, Enum):
    APPOINTMENT_CONFIRMED = "APPOINTMENT_CONFIRMED"
    TOKEN_GENERATED = "TOKEN_GENERATED"
    QUEUE_APPROACHING = "QUEUE_APPROACHING"
    DOCTOR_CALLED = "DOCTOR_CALLED"
    RESCHEDULED = "RESCHEDULED"
    REFERRAL_GENERATED = "REFERRAL_GENERATED"


class NotificationCreate(BaseModel):
    user_id: str = Field(..., description="Recipient (patient or staff) ID")
    type: NotificationType
    title: str
    message: str
    metadata: dict = Field(default_factory=dict)


class Notification(BaseModel):
    notification_id: str
    user_id: str
    type: NotificationType
    title: str
    message: str
    metadata: dict = Field(default_factory=dict)
    is_read: bool = False
    created_at: datetime
    read_at: Optional[datetime] = None


class NotificationListResponse(BaseModel):
    total: int
    unread_count: int
    notifications: list[Notification]
