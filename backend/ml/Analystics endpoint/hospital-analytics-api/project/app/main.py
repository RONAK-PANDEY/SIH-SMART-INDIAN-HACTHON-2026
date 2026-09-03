import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import analytics

app = FastAPI(
    title="Hospital Admin Dashboard API",
    version="1.0.0",
    description="Analytics endpoints backing the admin dashboard. See docs/api-contracts.md.",
)

# Comma-separated list of allowed dashboard origins, e.g.
# "http://localhost:3000,https://admin.example.com"
_origins = os.getenv("ADMIN_DASHBOARD_ORIGINS", "http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in _origins if o.strip()],
    allow_methods=["GET"],
    allow_headers=["*"],
)

app.include_router(analytics.router)


@app.get("/health", tags=["health"])
async def health():
    return {"status": "ok"}
