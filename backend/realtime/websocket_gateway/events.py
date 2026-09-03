"""
Helpers that build and broadcast the three domain events. These are the
functions the queue service / doctor console API should call whenever
queue state changes -- they are the "publish" side of the contract.
"""
from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Optional

from .connection_manager import manager
from .schemas import (
    CallNextData,
    Envelope,
    EventName,
    Meta,
    NowServingChangedData,
    QueuePositionUpdatedData,
)


def _meta(queue_id: str) -> Meta:
    return Meta(event_id=str(uuid.uuid4()), ts=datetime.now(timezone.utc), queue_id=queue_id)


async def emit_position_updated(queue_id: str, data: QueuePositionUpdatedData) -> None:
    envelope = Envelope(
        event=EventName.QUEUE_POSITION_UPDATED,
        data=data.model_dump(mode="json"),
        meta=_meta(queue_id),
    )
    await manager.broadcast(queue_id, envelope)


async def emit_now_serving_changed(queue_id: str, data: NowServingChangedData) -> None:
    envelope = Envelope(
        event=EventName.QUEUE_NOW_SERVING_CHANGED,
        data=data.model_dump(mode="json"),
        meta=_meta(queue_id),
    )
    await manager.broadcast(queue_id, envelope)


async def emit_call_next(queue_id: str, data: CallNextData) -> None:
    envelope = Envelope(
        event=EventName.QUEUE_CALL_NEXT,
        data=data.model_dump(mode="json"),
        meta=_meta(queue_id),
    )
    await manager.broadcast(queue_id, envelope)
