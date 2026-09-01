# Realtime WebSocket gateway
from fastapi import APIRouter, WebSocket
ws_router = APIRouter()
@ws_router.websocket("/queue/{hospital_id}/{department_id}")
async def ws_endpoint(websocket: WebSocket, hospital_id: str, department_id: str):
    await websocket.accept()
