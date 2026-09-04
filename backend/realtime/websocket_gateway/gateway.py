from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import List, Dict
import json
from datetime import datetime

class WebSocketManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.channel_subscriptions: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, channel: str):
        await websocket.accept()
        self.active_connections.append(websocket)
        if channel not in self.channel_subscriptions:
            self.channel_subscriptions[channel] = []
        self.channel_subscriptions[channel].append(websocket)

    def disconnect(self, websocket: WebSocket, channel: str):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        if channel in self.channel_subscriptions and websocket in self.channel_subscriptions[channel]:
            self.channel_subscriptions[channel].remove(websocket)

    async def broadcast_to_channel(self, channel: str, message: dict):
        if channel in self.channel_subscriptions:
            for connection in self.channel_subscriptions[channel]:
                try:
                    await connection.send_text(json.dumps(message))
                except Exception:
                    pass

ws_manager = WebSocketManager()
ws_router = APIRouter()

@ws_router.websocket("/queue/{hospital_id}/{department_id}")
async def queue_websocket_endpoint(websocket: WebSocket, hospital_id: str, department_id: str):
    channel = f"{hospital_id}:{department_id}"
    await ws_manager.connect(websocket, channel)
    try:
        # Send initial state snapshot
        await websocket.send_text(json.dumps({
            "event": "INITIAL_SYNC",
            "hospital_id": hospital_id,
            "department_id": department_id,
            "current_token": "CARD-038",
            "next_token": "CARD-039",
            "active_doctors": 4,
            "timestamp": datetime.utcnow().isoformat()
        }))
        while True:
            data = await websocket.receive_text()
            # Handle client heartbeats or messages
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket, channel)
