from datetime import date, timedelta
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.queries import analytics as q
from app.schemas import (
    DepartmentWaitTimes,
    DoctorAvailabilityBreakdown,
    HospitalPerformance,
    PatientsPerHour,
    PeakHours,
    SummaryStats,
)

router = APIRouter(prefix="/api/v1/analytics", tags=["analytics"])


class DateRange:
    """Shared query params: start_date, end_date, department_id.

    Defaults to the trailing 7-day window (inclusive) ending today when the
    caller omits the dates. Raises 400 if end_date precedes start_date.
    """

    def __init__(
        self,
        start_date: Annotated[date | None, Query(description="Inclusive start date")] = None,
        end_date: Annotated[date | None, Query(description="Inclusive end date")] = None,
        department_id: Annotated[int | None, Query(description="Filter to one department")] = None,
    ):
        today = date.today()
        self.end_date = end_date or today
        self.start_date = start_date or (self.end_date - timedelta(days=7))
        self.department_id = department_id

        if self.end_date < self.start_date:
            raise HTTPException(status_code=400, detail="end_date must be on or after start_date")

    @property
    def params(self) -> dict:
        return {
            "start_date": self.start_date,
            "end_date": self.end_date,
            "department_id": self.department_id,
        }


@router.get("/summary", response_model=SummaryStats)
async def get_summary_stats(
    dr: Annotated[DateRange, Depends()],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    result = await db.execute(text(q.SUMMARY_STATS), dr.params)
    row = result.mappings().one()
    return SummaryStats(start_date=dr.start_date, end_date=dr.end_date, **row)


@router.get("/patients-per-hour", response_model=PatientsPerHour)
async def get_patients_per_hour(
    dr: Annotated[DateRange, Depends()],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    result = await db.execute(text(q.PATIENTS_PER_HOUR), dr.params)
    rows = result.mappings().all()
    return PatientsPerHour(start_date=dr.start_date, end_date=dr.end_date, hours=rows)


@router.get("/department-wait-times", response_model=DepartmentWaitTimes)
async def get_department_wait_times(
    dr: Annotated[DateRange, Depends()],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    result = await db.execute(text(q.DEPARTMENT_WAIT_TIMES), dr.params)
    rows = result.mappings().all()
    if dr.department_id is not None and not rows:
        raise HTTPException(status_code=404, detail="No data for that department_id")
    return DepartmentWaitTimes(start_date=dr.start_date, end_date=dr.end_date, departments=rows)


@router.get("/hospital-performance", response_model=HospitalPerformance)
async def get_hospital_performance(
    dr: Annotated[DateRange, Depends()],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    result = await db.execute(text(q.HOSPITAL_PERFORMANCE), dr.params)
    row = result.mappings().one()
    return HospitalPerformance(start_date=dr.start_date, end_date=dr.end_date, **row)


@router.get("/doctor-availability", response_model=DoctorAvailabilityBreakdown)
async def get_doctor_availability(
    dr: Annotated[DateRange, Depends()],
    db: Annotated[AsyncSession, Depends(get_db)],
    doctor_id: Annotated[int | None, Query(description="Filter to one doctor")] = None,
):
    params = {**dr.params, "doctor_id": doctor_id}
    result = await db.execute(text(q.DOCTOR_AVAILABILITY), params)
    rows = result.mappings().all()
    if doctor_id is not None and not rows:
        raise HTTPException(status_code=404, detail="No matching doctor_id")
    return DoctorAvailabilityBreakdown(start_date=dr.start_date, end_date=dr.end_date, doctors=rows)


@router.get("/peak-hours", response_model=PeakHours)
async def get_peak_hours(
    dr: Annotated[DateRange, Depends()],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    result = await db.execute(text(q.PEAK_HOURS), dr.params)
    rows = result.mappings().all()

    top_peak = rows[:5]
    heatmap = sorted(rows, key=lambda r: (r["iso_dow"], r["hour"]))

    return PeakHours(
        start_date=dr.start_date,
        end_date=dr.end_date,
        top_peak_windows=[dict(r) for r in top_peak],
        heatmap=[dict(r) for r in heatmap],
    )
