from fastapi import FastAPI

from .routers.notifications import router as notifications_router

app = FastAPI(
    title="Notification Service",
    description=(
        "In-app notification records for: appointment confirmed, token "
        "generated, queue approaching, doctor called, rescheduled, and "
        "referral generated. No external SMS integration (prototype)."
    ),
    version="0.1.0",
)

app.include_router(notifications_router)


@app.get("/health", tags=["health"])
def health() -> dict:
    return {"status": "ok", "service": "notification_service"}


# Run with: uvicorn notification_service.main:app --reload --port 8001
