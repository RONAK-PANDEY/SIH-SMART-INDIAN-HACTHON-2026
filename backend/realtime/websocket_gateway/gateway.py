"""
FastAPI WebSocket endpoint for the realtime queue gateway.

Mount with:

    from backend.realtime.websocket_gateway.gateway import router as ws_router
    app.include_router(ws_router)

Endpoint: ws://<host>/ws/queues/{queue_id}

Protocol summary (full contract lives in docs/api-contracts.md):
  1. Client opens the socket to a specific queue_id.
  2. Client immediately sends a `queue.subscribe` envelope naming its role.
  3. Server replies with `connection.ack`.
  4. Server pushes `queue.position_updated` / `queue.now_serving_changed` /
     `queue.call_next` events as they happen -- client does not poll.
  5. Doctor consoles may send `doctor.call_next_request`; server validates,
     persists, then broadcasts `queue.call_next` followed by
     `queue.now_serving_changed` to all subscribers (including the sender).
  6. Either side may send `ping` / expect a `pong`-shaped ack (handled by
     the underlying ASGI server's ping/pong frames in production; the
     `ping` event here is an app-level heartbeat for proxies that eat
     WS-protocol pings).
"""
from __future__ import annotations

import json
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from pydantic import ValidationError

from .connection_manager import manager
from .events import emit_call_next, emit_now_serving_changed
from .schemas import (
    CallNextData,
    DoctorCallNextRequestData,
    Envelope,
    ErrorData,
    EventName,
    Meta,
    NowServingChangedData,
    QueueSubscribeData,
    QueueUnsubscribeData,
)
from .services.queue_service import (
    QueueServiceError,
    authorize_doctor,
    call_next_patient,
)

router = APIRouter()


def _meta(queue_id: str) -> Meta:
    return Meta(event_id=str(uuid.uuid4()), ts=datetime.now(timezone.utc), queue_id=queue_id)


async def _send_error(websocket: WebSocket, queue_id: str, code: str, message: str) -> None:
    envelope = Envelope(
        event=EventName.ERROR,
        data=ErrorData(code=code, message=message).model_dump(),
        meta=_meta(queue_id),
    )
    await manager.send_to(websocket, envelope)


@router.websocket("/ws/queues/{queue_id}")
async def queue_socket(websocket: WebSocket, queue_id: str) -> None:
    await websocket.accept()

    try:
        while True:
            raw = await websocket.receive_text()
            try:
                msg = json.loads(raw)
                event = msg["event"]
                data = msg.get("data", {})
            except (json.JSONDecodeError, KeyError):
                await _send_error(websocket, queue_id, "INVALID_PAYLOAD", "Malformed envelope")
                continue

            if event == EventName.QUEUE_SUBSCRIBE.value:
                try:
                    payload = QueueSubscribeData(**data)
                except ValidationError as e:
                    await _send_error(websocket, queue_id, "INVALID_PAYLOAD", str(e))
                    continue

                if payload.queue_id != queue_id:
                    await _send_error(
                        websocket, queue_id, "INVALID_PAYLOAD",
                        "queue_id in payload must match the connected queue"
                    )
                    continue

                if payload.role in ("doctor", "staff") and not payload.auth_token:
                    await _send_error(websocket, queue_id, "UNAUTHORIZED", "auth_token required for this role")
                    continue

                count = manager.subscribe(websocket, queue_id)
                ack = Envelope(
                    event=EventName.CONNECTION_ACK,
                    data={"queue_id": queue_id, "subscriber_count": count},
                    meta=_meta(queue_id),
                )
                await manager.send_to(websocket, ack)

            elif event == EventName.QUEUE_UNSUBSCRIBE.value:
                try:
                    payload = QueueUnsubscribeData(**data)
                except ValidationError as e:
                    await _send_error(websocket, queue_id, "INVALID_PAYLOAD", str(e))
                    continue
                manager.unsubscribe(websocket, payload.queue_id)

            elif event == EventName.DOCTOR_CALL_NEXT_REQUEST.value:
                try:
                    payload = DoctorCallNextRequestData(**data)
                except ValidationError as e:
                    await _send_error(websocket, queue_id, "INVALID_PAYLOAD", str(e))
                    continue

                try:
                    authorize_doctor(payload.doctor_id, payload.auth_token)
                    result = call_next_patient(payload.queue_id, payload.doctor_id, payload.room)
                except QueueServiceError as e:
                    await _send_error(websocket, queue_id, e.code, str(e))
                    continue

                await emit_call_next(
                    payload.queue_id,
                    CallNextData(
                        doctor_id=payload.doctor_id,
                        room=payload.room,
                        called_token=result.token_number,
                        called_patient_id=result.patient_id,
                        called_at=datetime.now(timezone.utc),
                    ),
                )
                await emit_now_serving_changed(
                    payload.queue_id,
                    NowServingChangedData(
                        doctor_id=payload.doctor_id,
                        room=payload.room,
                        now_serving_token=result.token_number,
                        now_serving_patient_id=result.patient_id,
                        previous_token=result.previous_token,
                    ),
                )

            elif event == EventName.PING.value:
                pong = Envelope(event=EventName.PING, data={}, meta=_meta(queue_id))
                await manager.send_to(websocket, pong)

            else:
                await _send_error(websocket, queue_id, "INVALID_PAYLOAD", f"Unknown event '{event}'")

    except WebSocketDisconnect:
        manager.disconnect(websocket)
