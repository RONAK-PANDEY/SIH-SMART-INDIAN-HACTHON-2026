# Hospital Admin Dashboard — Analytics API

FastAPI service exposing `/api/v1/analytics/*` endpoints for the admin
dashboard. Every endpoint is backed by a single SQL aggregation query (see
`app/queries/analytics.py`) run against PostgreSQL.

Contract: [`docs/api-contracts.md`](docs/api-contracts.md)
Schema: [`db/schema.sql`](db/schema.sql)

## Endpoints

| Endpoint                                    | What it returns                                 |
|----------------------------------------------|--------------------------------------------------|
| `GET /api/v1/analytics/summary`              | Headline counters (totals, completion rate, avg wait) |
| `GET /api/v1/analytics/patients-per-hour`    | Check-in volume by hour of day                    |
| `GET /api/v1/analytics/department-wait-times`| Avg/median/p90 wait time per department           |
| `GET /api/v1/analytics/hospital-performance` | Completion / on-time / utilization %s             |
| `GET /api/v1/analytics/doctor-availability`  | Per-doctor capacity vs. booked load                |
| `GET /api/v1/analytics/peak-hours`           | Top peak (day, hour) windows + full heatmap        |

All accept `start_date`, `end_date` (default: trailing 7 days) and
`department_id`; `doctor-availability` also accepts `doctor_id`.

## Setup

```bash
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

# Point at your Postgres instance (schema is created by the seed script)
export DATABASE_URL="postgresql+asyncpg://postgres:postgres@localhost:5432/hospital"

# Creates db/schema.sql tables and fills them with ~14 days of synthetic
# appointments so the endpoints return non-empty results.
python scripts/seed_db.py --days 14 --patients 600

export ADMIN_DASHBOARD_ORIGINS="http://localhost:3000"
uvicorn app.main:app --reload
```

Then, e.g.:

```bash
curl "http://localhost:8000/api/v1/analytics/summary?start_date=2026-08-27&end_date=2026-09-03"
curl "http://localhost:8000/api/v1/analytics/peak-hours"
```

Interactive docs at `http://localhost:8000/docs`.

## Notes / assumptions

This repo had no existing `docs/api-contracts.md`, database schema, or app
code, so both were created from scratch based on the six analytics
capabilities requested (summary stats, patients/hour, department-wise wait,
hospital performance %, doctor availability breakdown, peak hours). The
domain modeled is a typical outpatient (OPD) flow: appointment scheduled →
patient checks in → consultation starts → consultation ends, with doctors
having a recurring weekly availability schedule used to compute capacity.

If you already have a real schema, the pieces to swap are:
- `db/schema.sql` / `app/models.py` — table definitions
- `app/queries/analytics.py` — the six SQL queries (column/table names)
- `app/schemas.py` — response shapes, if you change what's aggregated

SQL uses PostgreSQL-specific features (`FILTER`, `PERCENTILE_CONT`,
`generate_series`, `EXTRACT(ISODOW ...)`) — targeting another database would
require rewriting the queries in `app/queries/analytics.py`.

## Environment note

This project was written and syntax-checked in a sandbox with no network
access and no running Postgres instance, so the SQL and application code
were validated by (a) `python -m py_compile` on every module and (b) running
the aggregation logic against an equivalent SQLite schema with seeded data
to confirm the joins, wait-time math, and grouping logic produce correct
results — but the app itself has not been run end-to-end against a live
FastAPI + PostgreSQL stack. Run `scripts/seed_db.py` against a real Postgres
instance and smoke-test each endpoint before deploying.
