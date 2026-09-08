from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from typing import Optional, List, Dict
from datetime import datetime
from services.chatbot_service.key_router import gemini_router

chatbot_router = APIRouter()

class ChatMessageRequest(BaseModel):
    message: str
    session_id: Optional[str] = "default_session"

class ChatMessageResponse(BaseModel):
    status: str
    reply: str
    served_by: str
    session_id: str
    fallback_used: bool = False
    timestamp: str

@chatbot_router.post("/message", response_model=ChatMessageResponse)
async def send_chatbot_message(req: ChatMessageRequest):
    """
    Accepts user question, routes across 6 Google Gemini API keys (round-robin with RPM rate-limiting),
    and returns empathetic clinical / queue response.
    """
    if not req.message or not req.message.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Message content cannot be empty."
        )

    res = await gemini_router.generate_response(
        user_message=req.message.strip(),
        session_id=req.session_id or "default_session"
    )

    return ChatMessageResponse(
        status=res.get("status", "success"),
        reply=res.get("reply", ""),
        served_by=res.get("served_by", "Gemini Multi-Key Router"),
        session_id=res.get("session_id", req.session_id or "default_session"),
        fallback_used=res.get("fallback_used", False),
        timestamp=datetime.utcnow().isoformat()
    )

@chatbot_router.get("/status")
async def get_chatbot_key_status():
    """
    Returns the status and current RPM usage of all 6 member key slots.
    """
    return {
        "status": "active",
        "service": "Google Gemini Multi-Key Routing Pool",
        "total_slots": 6,
        "key_pool": gemini_router.get_pool_status()
    }
