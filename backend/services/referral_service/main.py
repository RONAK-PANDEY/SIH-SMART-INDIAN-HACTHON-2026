from fastapi import FastAPI

from .routers.referral import router as referral_router

app = FastAPI(
    title="Referral Service",
    description=(
        "Evaluates triage completions/upgrades against the condition-to-"
        "specialty mapping, department registry, and equipment/resource "
        "availability (per docs/business-rules.md rules 1-6) to decide "
        "whether a referral prompt should be triggered, and produces a "
        "ranked list of alternate facilities. Staff confirm the final "
        "transfer decision; the system never auto-transfers."
    ),
    version="0.1.0",
)

app.include_router(referral_router)


@app.get("/health", tags=["health"])
def health() -> dict:
    return {"status": "ok", "service": "referral_service"}


# Run with: uvicorn referral_service.main:app --reload --port 8000
