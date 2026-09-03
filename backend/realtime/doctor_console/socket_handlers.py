"""
Socket handlers for doctor console actions.

These wrap the same DoctorConsoleService used by the REST router, so a
doctor's console can trigger "call next" / "complete consultation" either
via HTTP POST or directly over its existing websocket connection (e.g. if
the console UI is already socket-connected and wants to avoid a separate
HTTP round trip).

This module is framework-agnostic about the socket layer: it exposes plain
async functions `handle_call_next` / `handle_complete_consultation` that
take a dict payload and a `session_id`/`sid`, and return a dict suitable for
an ack callback. Wire these into your actual socket server (python-socketio,
Starlette WebSocketEndpoint, etc.) in whatever event-registration style it
uses. An example registration for python-socketio's AsyncServer is included
below, guarded by an import check so this file doesn't hard-require it.
"""

from __future__ import annotations

from typing import Any

from pydantic import ValidationError

from .interfaces import TokenNotFoundError, websocket_gateway
from .schemas import CallNextRequest, CompleteConsultationRequest
from .service import ConsultationNotActiveError, doctor_console_service

EVENT_CALL_NEXT = "doctor_console:call_next"
EVENT_COMPLETE_CONSULTATION = "doctor_console:complete_consultation"
EVENT_ERROR = "doctor_console:error"


async def handle_call_next(payload: dict, session_id: str) -> dict[str, Any]:
    try:
        req = CallNextRequest(**payload)
    except ValidationError as exc:
        await _send_error(session_id, "invalid_payload", str(exc))
        return {"ok": False, "error": "invalid_payload", "detail": exc.errors()}

    response = await doctor_console_service.call_next_patient(req)
    return {"ok": True, "data": response.model_dump()}


async def handle_complete_consultation(payload: dict, session_id: str) -> dict[str, Any]:
    try:
        req = CompleteConsultationRequest(**payload)
    except ValidationError as exc:
        await _send_error(session_id, "invalid_payload", str(exc))
        return {"ok": False, "error": "invalid_payload", "detail": exc.errors()}

    try:
        response = await doctor_console_service.complete_consultation(req)
    except TokenNotFoundError as exc:
        await _send_error(session_id, "token_not_found", str(exc))
        return {"ok": False, "error": "token_not_found", "detail": str(exc)}
    except ConsultationNotActiveError as exc:
        await _send_error(session_id, "consultation_not_active", str(exc))
        return {"ok": False, "error": "consultation_not_active", "detail": str(exc)}

    return {"ok": True, "data": response.model_dump(mode="json")}


async def _send_error(session_id: str, code: str, detail: str) -> None:
    await websocket_gateway.send_to_socket(
        session_id=session_id,
        event=EVENT_ERROR,
        payload={"code": code, "detail": detail},
    )


def register_socketio_handlers(sio) -> None:  # pragma: no cover - integration glue
    """Optional helper: wire these handlers into a python-socketio
    AsyncServer instance.

        import socketio
        from backend.realtime.doctor_console.socket_handlers import (
            register_socketio_handlers,
        )

        sio = socketio.AsyncServer(async_mode="asgi")
        register_socketio_handlers(sio)
    """

    @sio.on(EVENT_CALL_NEXT)
    async def _on_call_next(sid, data):
        return await handle_call_next(data or {}, session_id=sid)

    @sio.on(EVENT_COMPLETE_CONSULTATION)
    async def _on_complete_consultation(sid, data):
        return await handle_complete_consultation(data or {}, session_id=sid)
