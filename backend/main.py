from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from config import settings
from services.auth_service.jwt_handler import auth_router
from services.patient_service.router import patient_router
from services.appointment_service.router import appointment_router
from realtime.websocket_gateway.gateway import ws_manager, ws_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    docs_url="/docs",
    openapi_url=f"{settings.API_V1_PREFIX}/openapi.json",
)

# CORS middleware for Web, PWA and Admin clients
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
app.include_router(appointment_router, prefix=f"{settings.API_V1_PREFIX}/appointments", tags=["Appointments & Tokens"])
app.include_router(ws_router, prefix=f"{settings.API_V1_PREFIX}/ws", tags=["Realtime WebSocket Gateway"])

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": "1.0.0",
        "active_ws_connections": len(ws_manager.active_connections)
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
