# API Contracts — Analytics

> Note: no `docs/api-contracts.md` existed in the project, so this file was created
> to define the contract before implementation, based on the schema in `db/schema.sql`.

Base path: `/api/v1/analytics`

All endpoints are read-only (`GET`), return JSON, and are backed by a single SQL
aggregation query each (see `app/queries/analytics.py`). All accept these common
query parameters unless noted otherwise:

| Param        | Type   | Default             | Description                                      |
|--------------|--------|---------------------|---------------------------------------------------|
| `start_date` | date   | today - 7 days      | Inclusive start of the reporting window (`YYYY-MM-DD`) |
| `end_date`   | date   | today               | Inclusive end of the reporting window (`YYYY-MM-DD`)   |
| `department_id` | int | none (all depts)   | Filter to a single department                     |

Dates are interpreted as calendar dates in the server's configured timezone and
applied to `appointments.scheduled_at` / `check_in_time` as appropriate (see each
query for the exact column used).

---

## 1. `GET /api/v1/analytics/summary`

High-level counters for the dashboard header.

**Response 200**
```json
{
  "start_date": "2026-08-27",
  "end_date": "2026-09-03",
  "total_appointments": 1240,
  "completed": 980,
  "cancelled": 60,
  "no_show": 75,
  "in_progress_or_scheduled": 125,
  "unique_patients": 1102,
  "avg_wait_time_minutes": 18.4,
  "avg_consult_duration_minutes": 12.1,
  "completion_rate_pct": 79.0
}
```

## 2. `GET /api/v1/analytics/patients-per-hour`

Patient check-in volume bucketed by hour of day (0–23), aggregated across the
whole window. Used for the "patients/hour" load chart.

**Response 200**
```json
{
  "start_date": "2026-08-27",
  "end_date": "2026-09-03",
  "hours": [
    { "hour": 8, "patient_count": 42, "avg_wait_time_minutes": 9.2 },
    { "hour": 9, "patient_count": 88, "avg_wait_time_minutes": 14.5 }
  ]
}
```

## 3. `GET /api/v1/analytics/department-wait-times`

Wait time distribution (check-in → consultation start) grouped by department.

**Response 200**
```json
{
  "start_date": "2026-08-27",
  "end_date": "2026-09-03",
  "departments": [
    {
      "department_id": 3,
      "department_name": "Cardiology",
      "patient_count": 210,
      "avg_wait_time_minutes": 22.7,
      "median_wait_time_minutes": 18.0,
      "p90_wait_time_minutes": 41.5
    }
  ]
}
```

## 4. `GET /api/v1/analytics/hospital-performance`

Composite performance percentages for the window.

**Response 200**
```json
{
  "start_date": "2026-08-27",
  "end_date": "2026-09-03",
  "completion_rate_pct": 79.0,
  "no_show_rate_pct": 6.0,
  "cancellation_rate_pct": 4.8,
  "on_time_rate_pct": 61.3,
  "doctor_utilization_pct": 74.2,
  "overall_performance_pct": 71.5
}
```
`on_time_rate_pct` = share of completed consults where `consult_start_time <=
scheduled_at + 10 minutes`. `overall_performance_pct` is an equally-weighted
average of completion, on-time, and utilization rates (no-show/cancellation
pull it down implicitly via completion rate).

## 5. `GET /api/v1/analytics/doctor-availability`

Per-doctor scheduled capacity vs. booked/completed load for the window.

**Response 200**
```json
{
  "start_date": "2026-08-27",
  "end_date": "2026-09-03",
  "doctors": [
    {
      "doctor_id": 5,
      "doctor_name": "Dr. A. Rao",
      "department_name": "Cardiology",
      "capacity_slots": 160,
      "booked_appointments": 132,
      "completed_appointments": 118,
      "utilization_pct": 82.5,
      "available_slots": 28
    }
  ]
}
```
Accepts an optional `doctor_id` filter in addition to the common params.

## 6. `GET /api/v1/analytics/peak-hours`

Busiest hour-of-day / day-of-week combinations, for capacity planning.

**Response 200**
```json
{
  "start_date": "2026-08-27",
  "end_date": "2026-09-03",
  "top_peak_windows": [
    { "day_of_week": "Monday", "hour": 10, "patient_count": 34 },
    { "day_of_week": "Wednesday", "hour": 9, "patient_count": 31 }
  ],
  "heatmap": [
    { "day_of_week": "Monday", "hour": 8, "patient_count": 12 },
    { "day_of_week": "Monday", "hour": 9, "patient_count": 27 }
  ]
}
```
`top_peak_windows` is the top 5 (day, hour) cells by volume; `heatmap` is the
full day × hour matrix for rendering a heatmap chart.

---

### Error handling
- `422` — invalid/malformed `start_date`/`end_date` (FastAPI/Pydantic validation).
- `400` — `end_date` before `start_date`.
- `404` — `department_id` or `doctor_id` filter does not match any row.
