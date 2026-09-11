from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from config import settings
from auth.jwt_handler import auth_router
from core.patients.router import patient_router
from core.appointments.router import appointment_router, tokens_router
from core.triage.router import triage_router
from core.observer.router import observer_router
from integrations.chatbot.router import chatbot_router
from realtime.websocket_gateway.gateway import ws_manager, ws_router
from db.supabase_client import supabase_pool

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    docs_url="/docs",
    openapi_url=f"{settings.API_V1_PREFIX}/openapi.json",
)

# CORS middleware for Web, PWA, Admin, Govt Observer and Android Scanner clients
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routers
app.include_router(auth_router, prefix=f"{settings.API_V1_PREFIX}/auth", tags=["Authentication & RBAC"])
app.include_router(patient_router, prefix=f"{settings.API_V1_PREFIX}/patients", tags=["Patient Services"])
app.include_router(tokens_router, prefix=f"{settings.API_V1_PREFIX}/tokens", tags=["Turnstile & Android QR Scanner"])
app.include_router(appointment_router, prefix=f"{settings.API_V1_PREFIX}/appointments", tags=["Appointments & Tokens"])
app.include_router(triage_router, prefix=f"{settings.API_V1_PREFIX}/triage", tags=["AI Triage, Aadhaar & Network Referrals"])
app.include_router(observer_router, prefix=f"{settings.API_V1_PREFIX}/observer", tags=["Govt Observer, Vigilance & Doctor Bonus Engine"])
app.include_router(chatbot_router, prefix=f"{settings.API_V1_PREFIX}/chatbot", tags=["Google Gemini AI Chatbot & 6-Key Pool"])
app.include_router(ws_router, prefix=f"{settings.API_V1_PREFIX}/ws", tags=["Realtime WebSocket Gateway"])


@app.on_event("startup")
async def seed_demo_tokens():
    """
    Pre-seeds hardcoded demo tokens into the in-memory registry at startup.
    This ensures the Android QR Turnstile Scanner can always find tok_01 and the
    seeded demo tokens (tok_seed_01/02/03) even before any patient books a real appointment.
    Root-cause fix for: 'Token tok_01 not found in active hospital registry'
    """
    from datetime import datetime
    from core.appointments.service import AppointmentService
    from core.appointments.models import TokenResponse

    # This is the same hash that MyToken.tsx hardcodes in the QR payload
    DEMO_QR_HASH = "7d9a1f28b493c04f9815e98218175b5b4819266184519965384666f7d0ef802e"

    demo_tokens = [
        TokenResponse(
            id="tok_01",
            token_id="tok_01",
            token_number="A-024",
            patient_id="P-10024",
            hospital_id="hosp-001",
            department="dept-genmed",
            department_id="dept-genmed",
            position=1,
            estimated_wait_minutes=12,
            assigned_room="Room 102, Block A",
            assigned_doctor_name="Dr. Harpreet Singh (General Medicine)",
            priority_score=3.5,
            status="waiting",
            issued_at=datetime.utcnow(),
            qr_hash=DEMO_QR_HASH,
            hash=DEMO_QR_HASH,
        ),
        TokenResponse(
            id="tok_seed_01",
            token_id="tok_seed_01",
            token_number="CARD-201",
            patient_id="P-10025",
            hospital_id="hosp-001",
            department="dept-cardio",
            department_id="dept-cardio",
            position=2,
            estimated_wait_minutes=22,
            assigned_room="Room 204, Block B",
            assigned_doctor_name="Dr. Rajesh Sharma (Senior Cardiologist)",
            priority_score=4.2,
            status="waiting",
            issued_at=datetime.utcnow(),
            qr_hash=DEMO_QR_HASH,
            hash=DEMO_QR_HASH,
        ),
        TokenResponse(
            id="tok_seed_02",
            token_id="tok_seed_02",
            token_number="CARD-202",
            patient_id="P-10026",
            hospital_id="hosp-001",
            department="dept-cardio",
            department_id="dept-cardio",
            position=3,
            estimated_wait_minutes=30,
            assigned_room="Room 204, Block B",
            assigned_doctor_name="Dr. Rajesh Sharma (Senior Cardiologist)",
            priority_score=3.0,
            status="waiting",
            issued_at=datetime.utcnow(),
            qr_hash=DEMO_QR_HASH,
            hash=DEMO_QR_HASH,
        ),
        TokenResponse(
            id="tok_seed_03",
            token_id="tok_seed_03",
            token_number="CARD-203",
            patient_id="P-10027",
            hospital_id="hosp-001",
            department="dept-cardio",
            department_id="dept-cardio",
            position=4,
            estimated_wait_minutes=40,
            assigned_room="Room 204, Block B",
            assigned_doctor_name="Dr. Rajesh Sharma (Senior Cardiologist)",
            priority_score=4.0,
            status="waiting",
            issued_at=datetime.utcnow(),
            qr_hash=DEMO_QR_HASH,
            hash=DEMO_QR_HASH,
        ),
    ]

    for tok in demo_tokens:
        # Dual-key: by token_id AND token_number for flexible lookup
        AppointmentService._tokens[tok.token_id] = tok
        AppointmentService._tokens[tok.token_number] = tok

    print(f"[STARTUP][OK] Seeded {len(demo_tokens)} demo tokens: {[t.token_id for t in demo_tokens]}")


@app.get("/health")
@app.head("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": "1.0.0",
        "active_ws_connections": len(ws_manager.active_connections),
        "supabase_pool": supabase_pool.get_pool_status()
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
