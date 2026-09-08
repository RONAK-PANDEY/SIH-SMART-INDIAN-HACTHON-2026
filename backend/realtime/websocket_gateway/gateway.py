from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import List, Dict, Set, Union
import json
import logging
from datetime import datetime

logger = logging.getLogger("smartcare.websocket")

class ConnectionManager:
    """
    Unified WebSocket Connection Manager supporting multi-tenant channels:
      - patient:{patient_id}
      - token:{token_id}
      - doctor:{department_id} and doctor:{hospital_id}:{department_id}
      - observer:global and global
    """
    def __init__(self):
        # channel_name -> set of WebSocket connections
        self.channels: Dict[str, Set[WebSocket]] = {}
        # websocket -> set of subscribed channels
        self.socket_to_channels: Dict[WebSocket, Set[str]] = {}

    @property
    def active_connections(self) -> List[WebSocket]:
        return list(self.socket_to_channels.keys())

    async def connect(self, websocket: WebSocket, channel: str = "global"):
        await websocket.accept()
        self.subscribe(websocket, channel)

    def subscribe(self, websocket: WebSocket, channel: str):
        # Normalize channel
        channel = channel.strip()
        if channel not in self.channels:
            self.channels[channel] = set()
        self.channels[channel].add(websocket)

        if websocket not in self.socket_to_channels:
            self.socket_to_channels[websocket] = set()
        self.socket_to_channels[websocket].add(channel)

    def unsubscribe(self, websocket: WebSocket, channel: str):
        channel = channel.strip()
        if channel in self.channels and websocket in self.channels[channel]:
            self.channels[channel].remove(websocket)
            if len(self.channels[channel]) == 0:
                del self.channels[channel]

        if websocket in self.socket_to_channels and channel in self.socket_to_channels[websocket]:
            self.socket_to_channels[websocket].remove(channel)

    def disconnect(self, websocket: WebSocket, channel: str = None):
        if channel:
            self.unsubscribe(websocket, channel)
        
        # Remove from all subscribed channels
        if websocket in self.socket_to_channels:
            subscribed = list(self.socket_to_channels[websocket])
            for ch in subscribed:
                if ch in self.channels and websocket in self.channels[ch]:
                    self.channels[ch].remove(websocket)
                    if len(self.channels[ch]) == 0:
                        del self.channels[ch]
            del self.socket_to_channels[websocket]

    async def broadcast(self, channels: Union[str, List[str]], event: dict):
        if isinstance(channels, str):
            target_channels = [channels]
        else:
            target_channels = list(channels)

        # Build alias list
        expanded_channels = set()
        for ch in target_channels:
            expanded_channels.add(ch)
            # Add common aliases
            if ch == "observer:global" or ch == "global":
                expanded_channels.add("observer:global")
                expanded_channels.add("global")
            elif ch.startswith("doctor:"):
                # e.g. doctor:dept-cardio or doctor:hosp-001:dept-cardio
                parts = ch.split(":")
                dept = parts[-1]
                expanded_channels.add(f"doctor:{dept}")
                expanded_channels.add(f"hosp-001:{dept}")
                expanded_channels.add(dept)
            elif ch.startswith("patient:"):
                expanded_channels.add(ch)
            elif ch.startswith("token:"):
                expanded_channels.add(ch)

        # Collect unique target sockets
        recipients = set()
        for ch in expanded_channels:
            if ch in self.channels:
                recipients.update(self.channels[ch])

        message_text = json.dumps(event)
        dead_sockets = []
        for ws in recipients:
            try:
                await ws.send_text(message_text)
            except Exception as e:
                logger.warning(f"Error broadcasting to websocket: {e}")
                dead_sockets.append(ws)

        for ws in dead_sockets:
            self.disconnect(ws)

    # Backward compatibility alias
    async def broadcast_to_channel(self, channel: str, message: dict):
        await self.broadcast(channel, message)

# Singleton manager instance
ws_manager = ConnectionManager()
ConnectionManagerInstance = ws_manager

ws_router = APIRouter()

@ws_router.websocket("/connect")
@ws_router.websocket("/connect/{channel_name:path}")
async def dynamic_websocket_endpoint(websocket: WebSocket, channel_name: str = "global"):
    """
    Unified WebSocket endpoint supporting any channel format:
      - /api/v1/ws/connect
      - /api/v1/ws/connect/patient:{patient_id}
      - /api/v1/ws/connect/token:{token_id}
      - /api/v1/ws/connect/doctor:{dept}
      - /api/v1/ws/connect/observer:global
    """
    await ws_manager.connect(websocket, channel_name)
    try:
        # Initial greeting snapshot
        await websocket.send_text(json.dumps({
            "event": "CONNECTED",
            "channel": channel_name,
            "status": "active",
            "timestamp": datetime.utcnow().isoformat()
        }))
        while True:
            raw_text = await websocket.receive_text()
            try:
                payload = json.loads(raw_text)
                action = payload.get("action") or payload.get("type")
                target_channel = payload.get("channel")
                if action == "subscribe" and target_channel:
                    ws_manager.subscribe(websocket, target_channel)
                    await websocket.send_text(json.dumps({
                        "event": "SUBSCRIBED",
                        "channel": target_channel
                    }))
                elif action == "unsubscribe" and target_channel:
                    ws_manager.unsubscribe(websocket, target_channel)
                    await websocket.send_text(json.dumps({
                        "event": "UNSUBSCRIBED",
                        "channel": target_channel
                    }))
                elif action == "ping":
                    await websocket.send_text(json.dumps({"event": "pong", "timestamp": datetime.utcnow().isoformat()}))
            except Exception:
                pass
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket, channel_name)

@ws_router.websocket("/queue/{hospital_id}/{department_id}")
async def queue_websocket_endpoint(websocket: WebSocket, hospital_id: str, department_id: str):
    channel = f"{hospital_id}:{department_id}"
    await ws_manager.connect(websocket, channel)
    # Also auto-subscribe to doctor:{dept}
    ws_manager.subscribe(websocket, f"doctor:{department_id}")
    try:
        await websocket.send_text(json.dumps({
            "event": "INITIAL_SYNC",
            "hospital_id": hospital_id,
            "department_id": department_id,
            "timestamp": datetime.utcnow().isoformat()
        }))
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket, channel)

@ws_router.websocket("/global")
async def global_websocket_endpoint(websocket: WebSocket):
    channel = "observer:global"
    await ws_manager.connect(websocket, channel)
    ws_manager.subscribe(websocket, "global")
    try:
        await websocket.send_text(json.dumps({
            "event": "INITIAL_SYNC",
            "channel": "observer:global",
            "system_status": "OPERATIONAL",
            "timestamp": datetime.utcnow().isoformat()
        }))
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket, channel)
