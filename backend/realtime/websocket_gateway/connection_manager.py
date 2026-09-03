"""
In-memory connection registry for the WebSocket gateway.

NOTE: this is single-process. If the gateway is ever run with multiple
workers/pods, broadcasts need to go through a shared pub/sub (e.g. Redis)
instead of the in-memory dict below -- swap out `ConnectionManager.broadcast`
for a publish call and add a subscriber task that fans out to local sockets.
"""
from __future__ import annotations

import json
from collections import defaultdict
from typing import Dict, Set

from fastapi import WebSocket

from .schemas import Envelope


class ConnectionManager:
    def __init__(self) -> None:
        # queue_id -> set of live sockets subscribed to it
        self._subscribers: Dict[str, Set[WebSocket]] = defaultdict(set)
        # socket -> set of queue_ids it is subscribed to (for cleanup on disconnect)
        self._socket_queues: Dict[WebSocket, Set[str]] = defaultdict(set)

    def subscribe(self, websocket: WebSocket, queue_id: str) -> int:
        self._subscribers[queue_id].add(websocket)
        self._socket_queues[websocket].add(queue_id)
        return len(self._subscribers[queue_id])

    def unsubscribe(self, websocket: WebSocket, queue_id: str) -> None:
        self._subscribers.get(queue_id, set()).discard(websocket)
        self._socket_queues.get(websocket, set()).discard(queue_id)

    def disconnect(self, websocket: WebSocket) -> None:
        for queue_id in list(self._socket_queues.get(websocket, set())):
            self.unsubscribe(websocket, queue_id)
        self._socket_queues.pop(websocket, None)

    def subscriber_count(self, queue_id: str) -> int:
        return len(self._subscribers.get(queue_id, set()))

    async def send_to(self, websocket: WebSocket, envelope: Envelope) -> None:
        await websocket.send_text(envelope.model_dump_json())

    async def broadcast(self, queue_id: str, envelope: Envelope) -> None:
        """Fan out an envelope to every socket subscribed to queue_id."""
        dead: Set[WebSocket] = set()
        for ws in self._subscribers.get(queue_id, set()):
            try:
                await ws.send_text(envelope.model_dump_json())
            except Exception:
                dead.add(ws)
        for ws in dead:
            self.disconnect(ws)


manager = ConnectionManager()
