"""
Event payload schemas for the realtime queue WebSocket gateway.

These models are the single source of truth for wire format. The
documentation in docs/api-contracts.md is generated/kept in sync with
this file by hand -- if you change a model here, update the doc too.
"""
from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Literal, Optional, Union

from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# Envelope
# ---------------------------------------------------------------------------

class EventName(str, Enum):
    # Server -> Client
    QUEUE_POSITION_UPDATED = "queue.position_updated"
    QUEUE_NOW_SERVING_CHANGED = "queue.now_serving_changed"
    QUEUE_CALL_NEXT = "queue.call_next"
    CONNECTION_ACK = "connection.ack"
    ERROR = "error"

    # Client -> Server
    QUEUE_SUBSCRIBE = "queue.subscribe"
    QUEUE_UNSUBSCRIBE = "queue.unsubscribe"
    DOCTOR_CALL_NEXT_REQUEST = "doctor.call_next_request"
    PING = "ping"


class Meta(BaseModel):
    """Metadata attached to every message, both directions."""
    event_id: str = Field(..., description="ULID/UUID unique to this message")
    ts: datetime = Field(..., description="UTC timestamp the event was emitted")
    queue_id: str = Field(..., description="Queue this event pertains to")


class Envelope(BaseModel):
    """
    Common wrapper for every message sent over the socket in either
    direction. `data` shape depends on `event` (see per-event models below).
    """
    event: EventName
    data: dict
    meta: Meta


# ---------------------------------------------------------------------------
# Server -> Client payloads
# ---------------------------------------------------------------------------

class QueuePositionUpdatedData(BaseModel):
    """
    Sent to every subscriber of a queue whenever any patient's position
    changes (new join, someone served, someone leaves/no-shows).
    Contains the full ordered snapshot so clients never need to diff.
    """
    patient_id: str
    token_number: str
    position: int = Field(..., description="1-indexed position in the queue")
    previous_position: Optional[int] = Field(
        None, description="Null if this is the patient's first position event"
    )
    estimated_wait_minutes: Optional[int] = None


class NowServingChangedData(BaseModel):
    """
    Sent to every subscriber when the "now serving" token for a queue
    changes (doctor finishes with a patient / calls a new one manually).
    """
    doctor_id: str
    room: Optional[str] = None
    now_serving_token: Optional[str] = Field(
        None, description="Null when the doctor goes idle / no one is being served"
    )
    now_serving_patient_id: Optional[str] = None
    previous_token: Optional[str] = None


class CallNextData(BaseModel):
    """
    Broadcast the moment a doctor presses "call next" in their console.
    This fires BEFORE now_serving_changed is persisted, so the frontend
    can show an immediate "Calling token #42..." UI, with
    now_serving_changed following shortly after as the confirmed state.
    """
    doctor_id: str
    room: Optional[str] = None
    called_token: str
    called_patient_id: str
    called_at: datetime


class ConnectionAckData(BaseModel):
    """Sent once, immediately after a successful subscribe."""
    queue_id: str
    subscriber_count: int


class ErrorData(BaseModel):
    code: Literal[
        "QUEUE_NOT_FOUND",
        "UNAUTHORIZED",
        "INVALID_PAYLOAD",
        "RATE_LIMITED",
        "INTERNAL_ERROR",
    ]
    message: str


# ---------------------------------------------------------------------------
# Client -> Server payloads
# ---------------------------------------------------------------------------

class QueueSubscribeData(BaseModel):
    queue_id: str
    role: Literal["patient", "display_board", "doctor", "staff"] = "patient"
    auth_token: Optional[str] = Field(
        None, description="Required when role is 'doctor' or 'staff'"
    )


class QueueUnsubscribeData(BaseModel):
    queue_id: str


class DoctorCallNextRequestData(BaseModel):
    """
    Sent by the doctor console to request the next patient be called.
    The server validates + persists, then broadcasts CALL_NEXT followed
    by NOW_SERVING_CHANGED to all subscribers (including the requester).
    This event itself is NOT broadcast back verbatim.
    """
    doctor_id: str
    queue_id: str
    room: Optional[str] = None
    auth_token: str


ServerEventData = Union[
    QueuePositionUpdatedData,
    NowServingChangedData,
    CallNextData,
    ConnectionAckData,
    ErrorData,
]

ClientEventData = Union[
    QueueSubscribeData,
    QueueUnsubscribeData,
    DoctorCallNextRequestData,
]
