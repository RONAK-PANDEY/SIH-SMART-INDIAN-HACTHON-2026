from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.db import Base, engine
from app.routers import auth, users

settings = get_settings()

# Dev convenience: auto-create tables. In staging/prod, use Alembic migrations
# instead (see README) and remove this call.
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
    description="Authentication & RBAC service: registration, login, token refresh, "
    "and role management for patient/doctor/staff/admin/superadmin.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)


@app.get("/health", tags=["health"])
def health():
    return {"status": "ok", "service": settings.APP_NAME}
