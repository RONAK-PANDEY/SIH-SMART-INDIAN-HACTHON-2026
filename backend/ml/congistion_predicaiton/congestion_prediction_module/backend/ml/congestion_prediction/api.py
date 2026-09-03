"""
Optional FastAPI router exposing the congestion score as an HTTP endpoint.

This is illustrative -- wire it into your main app with:

    from backend.ml.congestion_prediction.api import router as congestion_router
    app.include_router(congestion_router)

Requires `fastapi` and `pydantic` to be installed in the host project;
this file is intentionally NOT imported by __init__.py so the core module
has no hard dependency on a web framework.
"""
from typing import Optional, List, Dict, Any

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from .service import predict_congestion

router = APIRouter(prefix="/congestion", tags=["congestion"])


class CongestionRequest(BaseModel):
    department: str
    timestamp: str
    current_queue_length: int
    historical_avg_queue_length: float
    patient_arrivals_last_hour: int
    historical_avg_arrivals_last_hour: float
    admissions_last_hour: int = 0
    discharges_last_hour: int = 0
    avg_wait_time_minutes: float = 0.0
    target_wait_time_minutes: Optional[float] = None
    doctors_on_duty: int = 0
    doctors_required: int = 0
    doctors_unavailable: int = 0
    bed_occupancy_rate: Optional[float] = None


class SubScoreResponse(BaseModel):
    name: str
    score: float
    weight: float
    contribution: float
    detail: str


class CongestionResponse(BaseModel):
    department: str
    timestamp: str
    score: int = Field(..., ge=0, le=100)
    status: str
    status_label: str
    reason: str
    rule_score: float
    ml_score: Optional[float]
    blend_alpha: float
    sub_scores: List[SubScoreResponse]


@router.post("/score", response_model=CongestionResponse)
def get_congestion_score(request: CongestionRequest) -> Dict[str, Any]:
    payload = request.dict(exclude_none=True)
    try:
        return predict_congestion(payload)
    except Exception as exc:  # pragma: no cover - defensive HTTP boundary
        raise HTTPException(status_code=422, detail=str(exc))
