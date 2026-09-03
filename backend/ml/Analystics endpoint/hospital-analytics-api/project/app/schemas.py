from datetime import date

from pydantic import BaseModel


class SummaryStats(BaseModel):
    start_date: date
    end_date: date
    total_appointments: int
    completed: int
    cancelled: int
    no_show: int
    in_progress_or_scheduled: int
    unique_patients: int
    avg_wait_time_minutes: float | None
    avg_consult_duration_minutes: float | None
    completion_rate_pct: float | None


class HourBucket(BaseModel):
    hour: int
    patient_count: int
    avg_wait_time_minutes: float | None


class PatientsPerHour(BaseModel):
    start_date: date
    end_date: date
    hours: list[HourBucket]


class DepartmentWait(BaseModel):
    department_id: int
    department_name: str
    patient_count: int
    avg_wait_time_minutes: float | None
    median_wait_time_minutes: float | None
    p90_wait_time_minutes: float | None


class DepartmentWaitTimes(BaseModel):
    start_date: date
    end_date: date
    departments: list[DepartmentWait]


class HospitalPerformance(BaseModel):
    start_date: date
    end_date: date
    completion_rate_pct: float | None
    no_show_rate_pct: float | None
    cancellation_rate_pct: float | None
    on_time_rate_pct: float | None
    doctor_utilization_pct: float | None
    overall_performance_pct: float | None


class DoctorAvailability(BaseModel):
    doctor_id: int
    doctor_name: str
    department_name: str
    capacity_slots: int
    booked_appointments: int
    completed_appointments: int
    utilization_pct: float | None
    available_slots: int


class DoctorAvailabilityBreakdown(BaseModel):
    start_date: date
    end_date: date
    doctors: list[DoctorAvailability]


class PeakWindow(BaseModel):
    day_of_week: str
    hour: int
    patient_count: int


class PeakHours(BaseModel):
    start_date: date
    end_date: date
    top_peak_windows: list[PeakWindow]
    heatmap: list[PeakWindow]
