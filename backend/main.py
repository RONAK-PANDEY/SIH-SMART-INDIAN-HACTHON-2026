from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from services.auth_service.jwt_handler import auth_router
from services.patient_service.router import patient_router
from services.appointment_service.router import appointment_router
from realtime.websocket_gateway.gateway import ws_router

app = FastAPI(title="SmartCare Backend", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

app.include_router(auth_router, prefix="/api/v1/auth", tags=["Auth"])
app.include_router(patient_router, prefix="/api/v1/patients", tags=["Patients"])
app.include_router(appointment_router, prefix="/api/v1/appointments", tags=["Appointments"])
app.include_router(ws_router, prefix="/api/v1/ws", tags=["WebSocket"])

@app.get("/health")
def health(): return {"status": "ok"}
