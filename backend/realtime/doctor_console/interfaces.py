"""
Integration boundary for doctor_console.

This module does NOT own queue or socket transport logic. It expects two
sibling modules elsewhere in the backend:

    backend.realtime.queue_engine
    backend.realtime.websocket_gateway

Expected contracts (documented here so the real modules can be verified
against them):

queue_engine
------------
    async def pull_next(department_id: str, doctor_id: str) -> Token | None
        Atomically pops the next eligible token for a department/queue and
        marks it as "in_consultation". Returns None if queue is empty.
        Must be safe under concurrent calls (multiple doctors calling next
        at once should never receive the same token).

    async def get_token(token_id: str) -> Token | None
        Fetch a token by id regardless of its current state.

    async def mark_completed(token_id: str) -> Token
        Marks a token as "completed". Raises TokenNotFoundError if missing.

    async def requeue_for_referral(token_id: str, target_department_id: str) -> Token
        Creates/moves a token into another department's queue (e.g. lab,
        specialist) as part of a referral. Returns the new/updated token.

    class Token (pydantic-like, duck-typed):
        id: str
        patient_id: str
        department_id: str
        queue_position: int
        status: str
        doctor_id: str | None

websocket_gateway
-----------------
    async def broadcast(channel: str, event: str, payload: dict) -> None
        Publishes an event to all sockets subscribed to `channel`.
        Typical channels used here: f"department:{department_id}",
        f"patient:{patient_id}", f"doctor:{doctor_id}".

    async def send_to_socket(session_id: str, event: str, payload: dict) -> None
        Sends an event to one specific connected client/session.

If the real modules aren't importable (e.g. running this module in
isolation, unit tests, or before the rest of the backend exists), we fall
back to minimal in-memory stand-ins so doctor_console stays runnable.
"""

from __future__ import annotations

import itertools
import time
from dataclasses import dataclass, field
from typing import Optional, Protocol


class TokenNotFoundError(Exception):
    pass


class QueueEmptyError(Exception):
    pass


@dataclass
class Token:
    id: str
    patient_id: str
    department_id: str
    queue_position: int
    status: str = "waiting"  # waiting | in_consultation | completed | referred
    doctor_id: Optional[str] = None


class QueueEngine(Protocol):
    async def pull_next(self, department_id: str, doctor_id: str) -> Optional[Token]: ...
    async def get_token(self, token_id: str) -> Optional[Token]: ...
    async def mark_completed(self, token_id: str) -> Token: ...
    async def requeue_for_referral(self, token_id: str, target_department_id: str) -> Token: ...


class WebsocketGateway(Protocol):
    async def broadcast(self, channel: str, event: str, payload: dict) -> None: ...
    async def send_to_socket(self, session_id: str, event: str, payload: dict) -> None: ...


try:
    # Real implementations, if present in the backend tree.
    from backend.realtime.queue_engine import queue_engine as _queue_engine  # type: ignore
except Exception:  # pragma: no cover - fallback path
    _queue_engine = None

try:
    from backend.realtime.websocket_gateway import websocket_gateway as _websocket_gateway  # type: ignore
except Exception:  # pragma: no cover - fallback path
    _websocket_gateway = None


class _InMemoryQueueEngine:
    """Minimal stand-in used only when the real queue_engine is unavailable."""

    def __init__(self) -> None:
        self._queues: dict[str, list[Token]] = {}
        self._tokens: dict[str, Token] = {}
        self._ids = itertools.count(1)

    def seed(self, department_id: str, patient_id: str) -> Token:
        token = Token(
            id=f"tok_{next(self._ids)}",
            patient_id=patient_id,
            department_id=department_id,
            queue_position=len(self._queues.get(department_id, [])) + 1,
        )
        self._queues.setdefault(department_id, []).append(token)
        self._tokens[token.id] = token
        return token

    async def pull_next(self, department_id: str, doctor_id: str) -> Optional[Token]:
        queue = self._queues.get(department_id, [])
        for token in queue:
            if token.status == "waiting":
                token.status = "in_consultation"
                token.doctor_id = doctor_id
                return token
        return None

    async def get_token(self, token_id: str) -> Optional[Token]:
        return self._tokens.get(token_id)

    async def mark_completed(self, token_id: str) -> Token:
        token = self._tokens.get(token_id)
        if token is None:
            raise TokenNotFoundError(token_id)
        token.status = "completed"
        return token

    async def requeue_for_referral(self, token_id: str, target_department_id: str) -> Token:
        source = self._tokens.get(token_id)
        if source is None:
            raise TokenNotFoundError(token_id)
        source.status = "referred"
        new_token = Token(
            id=f"tok_{next(self._ids)}",
            patient_id=source.patient_id,
            department_id=target_department_id,
            queue_position=len(self._queues.get(target_department_id, [])) + 1,
        )
        self._queues.setdefault(target_department_id, []).append(new_token)
        self._tokens[new_token.id] = new_token
        return new_token


class _InMemoryWebsocketGateway:
    """Minimal stand-in used only when the real websocket_gateway is unavailable."""

    def __init__(self) -> None:
        self.sent: list[dict] = field(default_factory=list)  # type: ignore

    async def broadcast(self, channel: str, event: str, payload: dict) -> None:
        self._record("broadcast", channel=channel, event=event, payload=payload)

    async def send_to_socket(self, session_id: str, event: str, payload: dict) -> None:
        self._record("direct", session_id=session_id, event=event, payload=payload)

    def _record(self, kind: str, **kwargs) -> None:
        if not hasattr(self, "sent") or not isinstance(getattr(self, "sent"), list):
            self.sent = []
        self.sent.append({"kind": kind, "ts": time.time(), **kwargs})


queue_engine: QueueEngine = _queue_engine or _InMemoryQueueEngine()
websocket_gateway: WebsocketGateway = _websocket_gateway or _InMemoryWebsocketGateway()
