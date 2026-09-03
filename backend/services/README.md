# Referral & Notification Services

Two independent FastAPI services for the prototype.

## Layout

```
backend/services/
├── referral_service/
│   ├── main.py                 # FastAPI app (port 8000 by default)
│   ├── models.py                # Pydantic schemas
│   ├── rules_engine.py          # Rules 1-6 from docs/business-rules.md
│   ├── store.py                 # In-memory referral records
│   ├── notifier_client.py       # Calls notification_service (best-effort)
│   ├── data/
│   │   ├── condition_specialty_map.py   # Rule 1 lookup table
│   │   ├── department_registry.py       # Rule 2: active flag + on-shift staff
│   │   ├── equipment_registry.py        # Rule 4 / Section 3.2 equipment capacity
│   │   └── facilities.py                # Facility master data + transfer ETA matrix
│   └── routers/referral.py      # /referrals/* endpoints
│
└── notification_service/
    ├── main.py                  # FastAPI app (port 8001 by default)
    ├── models.py                # Pydantic schemas (6 notification types)
    ├── store.py                 # In-memory notification records
    ├── templates.py             # Copy builders for the 6 event types
    └── routers/notifications.py # /notifications/* endpoints
```

## Running locally

```bash
pip install -r backend/services/referral_service/requirements.txt
pip install -r backend/services/notification_service/requirements.txt

# Terminal 1
cd backend/services
uvicorn notification_service.main:app --reload --port 8001

# Terminal 2
cd backend/services
NOTIFICATION_SERVICE_URL=http://localhost:8001 \
  uvicorn referral_service.main:app --reload --port 8000
```

Docs: `http://localhost:8000/docs` and `http://localhost:8001/docs`.

## Referral service — rule mapping

| business-rules.md step | Implementation |
|---|---|
| 1. Look up required specialty for condition | `data/condition_specialty_map.py` via `rules_engine.evaluate()` |
| 2. Check destination facility's department registry: active? on-shift? | `data/department_registry.py: is_specialty_active_and_staffed()` |
| 3. Missing/unstaffed → trigger regardless of triage category | `rules_engine.evaluate()`, checked before priority is consulted |
| 4. Present+staffed → check equipment (Sec 3.2); zero-capacity + URGENT/PRIORITY → trigger | `data/equipment_registry.py: is_equipment_available()` |
| 5. Otherwise → no referral, in-facility | returns `triggered=False` |
| 6. Ranked alternate facilities; staff confirm, no auto-transfer | `rules_engine._build_recommendations()` ranks by (specialty staffed, equipment available, ETA); `POST /referrals/{id}/confirm` is the only path that sets a destination facility |

### Key endpoints

- `POST /referrals/evaluate` — call on triage completion or triage upgrade. Body: `patient_id`, `facility_id`, `condition`, `triage_priority`, `event_type`, optional `requested_by_staff_id`. Returns whether a referral was triggered and, if so, the persisted `ReferralRecord` (status `PENDING`) with ranked `recommendations`.
- `GET /referrals/{referral_id}` / `GET /referrals?facility_id=&status=`
- `POST /referrals/{referral_id}/confirm` — staff picks a facility from the recommendations (or any valid facility) to finalize the transfer (status → `CONFIRMED`). Sends a `REFERRAL_GENERATED` notification to the patient.
- `POST /referrals/{referral_id}/reject` — staff declines the referral prompt (status → `REJECTED`).

The system **never** sets `to_facility_id` except via the explicit `/confirm` call made by staff.

## Notification service

In-app notification records only — no external SMS/push integration, per the prototype scope. Six event types are modeled in `NotificationType`:
`APPOINTMENT_CONFIRMED`, `TOKEN_GENERATED`, `QUEUE_APPROACHING`, `DOCTOR_CALLED`, `RESCHEDULED`, `REFERRAL_GENERATED`.

`templates.py` has one builder function per event type (e.g. `templates.token_generated(user_id, token_number, department)`) that other services/routers can import to build consistent copy before calling `store.create(...)` or `POST /notifications`.

### Key endpoints

- `POST /notifications` — create a notification (`user_id`, `type`, `title`, `message`, `metadata`).
- `GET /notifications/user/{user_id}?unread_only=` — list a user's notifications + unread count.
- `PATCH /notifications/{notification_id}/read` — mark one as read.
- `POST /notifications/user/{user_id}/read-all` — mark all as read.

## Notes / assumptions

- Storage is in-memory (thread-safe dicts) for both services, matching the "prototype" scope — swap `store.py` for a real DB layer later without touching routers/rules_engine.
- `docs/business-rules.md` was not available in this environment; the rule text quoted in the request was implemented verbatim. The condition→specialty map, department registry, equipment registry, and facility distance matrix are seed/mock data (Section 3.2 equipment list is inferred) — replace with real reference data.
- Cross-service notification calls use stdlib `urllib` (no extra HTTP client dependency) and fail soft: if `notification_service` is down, referral creation/confirmation still succeeds.
