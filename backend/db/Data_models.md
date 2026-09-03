# Data Models

This document is the shared contract describing every table in the PostgreSQL
schema (`backend/db/schema.sql`). It should be updated in the same PR as any
schema change.

General conventions:

- Every table has a UUID primary key `id` (`gen_random_uuid()`).
- `created_at` / `updated_at` are `TIMESTAMPTZ`, defaulting to `now()`;
  `updated_at` is auto-maintained by the `set_updated_at` trigger.
- Enumerated columns use native Postgres `ENUM` types (listed under each
  table) so invalid values are rejected by the database.
- Foreign keys are named `<column>` → `<table>.id` unless otherwise noted.

---

## users

Base authentication/identity record for anyone who logs in: admins, hospital
admins, doctors, staff, and (optionally) patients.

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | Surrogate key |
| email | CITEXT | UNIQUE, nullable | Case-insensitive login email |
| phone | VARCHAR(20) | UNIQUE, nullable | Login phone number |
| password_hash | TEXT | NOT NULL | Hashed credential |
| role | user_role ENUM | NOT NULL, default `patient` | `admin`, `hospital_admin`, `doctor`, `staff`, `patient` |
| full_name | VARCHAR(255) | NOT NULL | Display name |
| is_active | BOOLEAN | NOT NULL, default TRUE | Soft-disable flag |
| last_login_at | TIMESTAMPTZ | nullable | Last successful login |
| created_at | TIMESTAMPTZ | NOT NULL | Row creation time |
| updated_at | TIMESTAMPTZ | NOT NULL | Auto-updated on write |

Check constraint: at least one of `email` / `phone` must be present.

---

## patients

Patient master record. May or may not have a login (`user_id` is nullable —
walk-in patients registered by staff won't have one initially).

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | Surrogate key |
| user_id | UUID | FK → users.id, UNIQUE, nullable, ON DELETE SET NULL | Optional patient login |
| medical_record_number | VARCHAR(50) | UNIQUE, nullable | Hospital-assigned MRN |
| full_name | VARCHAR(255) | NOT NULL | Patient name |
| date_of_birth | DATE | nullable | DOB |
| gender | gender_type ENUM | NOT NULL, default `unspecified` | `male`, `female`, `other`, `unspecified` |
| phone | VARCHAR(20) | nullable | Contact number |
| email | CITEXT | nullable | Contact email |
| address | TEXT | nullable | Home address |
| blood_group | VARCHAR(5) | nullable | e.g. `O+` |
| emergency_contact_name | VARCHAR(255) | nullable | Emergency contact |
| emergency_contact_phone | VARCHAR(20) | nullable | Emergency contact phone |
| allergies | TEXT | nullable | Free-text allergy notes |
| created_at | TIMESTAMPTZ | NOT NULL | Row creation time |
| updated_at | TIMESTAMPTZ | NOT NULL | Auto-updated on write |

---

## hospitals

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | Surrogate key |
| name | VARCHAR(255) | NOT NULL | Hospital name |
| code | VARCHAR(50) | NOT NULL, UNIQUE | Short internal code |
| address | TEXT | nullable | Street address |
| city | VARCHAR(120) | nullable | City |
| state | VARCHAR(120) | nullable | State/region |
| postal_code | VARCHAR(20) | nullable | Postal/ZIP code |
| country | VARCHAR(120) | NOT NULL, default `India` | Country |
| phone | VARCHAR(20) | nullable | Main phone number |
| email | CITEXT | nullable | Contact email |
| latitude | NUMERIC(9,6) | nullable | Geolocation |
| longitude | NUMERIC(9,6) | nullable | Geolocation |
| is_active | BOOLEAN | NOT NULL, default TRUE | Soft-disable flag |
| created_at | TIMESTAMPTZ | NOT NULL | Row creation time |
| updated_at | TIMESTAMPTZ | NOT NULL | Auto-updated on write |

---

## departments

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | Surrogate key |
| hospital_id | UUID | FK → hospitals.id, NOT NULL, ON DELETE CASCADE | Owning hospital |
| name | VARCHAR(150) | NOT NULL | e.g. "Cardiology" |
| code | VARCHAR(50) | NOT NULL | Short code, unique per hospital |
| description | TEXT | nullable | Free text |
| floor | VARCHAR(20) | nullable | Physical location hint |
| is_active | BOOLEAN | NOT NULL, default TRUE | Soft-disable flag |
| created_at | TIMESTAMPTZ | NOT NULL | Row creation time |
| updated_at | TIMESTAMPTZ | NOT NULL | Auto-updated on write |

Unique constraint: `(hospital_id, code)`.

---

## doctors

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | Surrogate key |
| user_id | UUID | FK → users.id, UNIQUE, nullable, ON DELETE SET NULL | Doctor's login account |
| hospital_id | UUID | FK → hospitals.id, NOT NULL, ON DELETE CASCADE | Home hospital |
| department_id | UUID | FK → departments.id, NOT NULL, ON DELETE RESTRICT | Home department |
| full_name | VARCHAR(255) | NOT NULL | Display name |
| specialization | VARCHAR(150) | nullable | e.g. "Pediatrics" |
| license_number | VARCHAR(100) | UNIQUE, nullable | Medical license/registration number |
| phone | VARCHAR(20) | nullable | Contact number |
| email | CITEXT | nullable | Contact email |
| consultation_duration_minutes | SMALLINT | NOT NULL, default 15 | Used for wait-time estimates |
| is_active | BOOLEAN | NOT NULL, default TRUE | Soft-disable flag |
| created_at | TIMESTAMPTZ | NOT NULL | Row creation time |
| updated_at | TIMESTAMPTZ | NOT NULL | Auto-updated on write |

---

## appointments

Scheduled (as opposed to walk-in) patient visits.

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | Surrogate key |
| patient_id | UUID | FK → patients.id, NOT NULL, ON DELETE CASCADE | Patient |
| doctor_id | UUID | FK → doctors.id, NOT NULL, ON DELETE RESTRICT | Assigned doctor |
| hospital_id | UUID | FK → hospitals.id, NOT NULL, ON DELETE RESTRICT | Hospital |
| department_id | UUID | FK → departments.id, NOT NULL, ON DELETE RESTRICT | Department |
| scheduled_at | TIMESTAMPTZ | NOT NULL | Scheduled date/time |
| status | appointment_status ENUM | NOT NULL, default `scheduled` | `scheduled`, `confirmed`, `cancelled`, `completed`, `no_show` |
| reason | TEXT | nullable | Reason for visit |
| notes | TEXT | nullable | Staff/doctor notes |
| created_at | TIMESTAMPTZ | NOT NULL | Row creation time |
| updated_at | TIMESTAMPTZ | NOT NULL | Auto-updated on write |

---

## queues

One live queue instance, typically scoped to a department (and optionally a
specific doctor) for a given day.

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | Surrogate key |
| hospital_id | UUID | FK → hospitals.id, NOT NULL, ON DELETE CASCADE | Hospital |
| department_id | UUID | FK → departments.id, NOT NULL, ON DELETE CASCADE | Department |
| doctor_id | UUID | FK → doctors.id, nullable, ON DELETE SET NULL | Optional doctor-specific queue |
| queue_date | DATE | NOT NULL | Operating date of this queue |
| status | queue_status ENUM | NOT NULL, default `open` | `open`, `paused`, `closed` |
| current_token_number | INTEGER | NOT NULL, default 0 | Token currently being served |
| last_token_number | INTEGER | NOT NULL, default 0 | Last token number issued |
| created_at | TIMESTAMPTZ | NOT NULL | Row creation time |
| updated_at | TIMESTAMPTZ | NOT NULL | Auto-updated on write |

Unique constraint: `(department_id, doctor_id, queue_date)`.

**Live-queue indexes:** `(hospital_id, queue_date, status)`,
`(department_id, queue_date, status)`, `(doctor_id, queue_date)` — support the
"today's open queues for hospital/department/doctor" lookups used by polling
clients.

---

## tokens

Individual queue tickets issued to a patient within a `queue`.

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | Surrogate key |
| queue_id | UUID | FK → queues.id, NOT NULL, ON DELETE CASCADE | Parent queue |
| patient_id | UUID | FK → patients.id, NOT NULL, ON DELETE CASCADE | Patient holding this token |
| appointment_id | UUID | FK → appointments.id, nullable, ON DELETE SET NULL | Linked appointment, if any |
| token_number | INTEGER | NOT NULL | Sequential number within the queue |
| status | token_status ENUM | NOT NULL, default `waiting` | `waiting`, `called`, `in_progress`, `completed`, `skipped`, `cancelled` |
| priority | token_priority ENUM | NOT NULL, default `normal` | `normal`, `urgent`, `emergency` |
| estimated_wait_minutes | INTEGER | nullable | Computed ETA shown to patient |
| issued_at | TIMESTAMPTZ | NOT NULL, default now() | When the token was created |
| called_at | TIMESTAMPTZ | nullable | When patient was called |
| started_at | TIMESTAMPTZ | nullable | When consultation started |
| completed_at | TIMESTAMPTZ | nullable | When consultation ended |
| created_at | TIMESTAMPTZ | NOT NULL | Row creation time |
| updated_at | TIMESTAMPTZ | NOT NULL | Auto-updated on write |

Unique constraint: `(queue_id, token_number)`.

**Live-queue indexes:** `(queue_id, status, priority, token_number)` for the
main queue-ordering query, plus a partial index on `(queue_id, token_number)
WHERE status IN ('waiting','called','in_progress')` covering the hot path of
fetching only active tokens.

---

## triage_assessments

Clinical triage performed on a patient, optionally tied to a specific visit
or token.

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | Surrogate key |
| patient_id | UUID | FK → patients.id, NOT NULL, ON DELETE CASCADE | Patient assessed |
| visit_id | UUID | FK → visits.id, nullable, ON DELETE SET NULL | Associated visit |
| token_id | UUID | FK → tokens.id, nullable, ON DELETE SET NULL | Associated queue token |
| assessed_by | UUID | FK → users.id, nullable, ON DELETE SET NULL | Staff/nurse who performed triage |
| severity_level | triage_severity ENUM | NOT NULL | `non_urgent`, `less_urgent`, `urgent`, `emergent`, `immediate` |
| chief_complaint | TEXT | nullable | Patient's stated complaint |
| vital_signs | JSONB | NOT NULL, default `{}` | Structured vitals (BP, HR, temp, SpO2, etc.) |
| notes | TEXT | nullable | Free-text notes |
| assessed_at | TIMESTAMPTZ | NOT NULL, default now() | When triage occurred |
| created_at | TIMESTAMPTZ | NOT NULL | Row creation time |
| updated_at | TIMESTAMPTZ | NOT NULL | Auto-updated on write |

> Note: `visit_id`'s foreign key is added after `visits` is created in the
> schema file, since the two tables reference each other conceptually.

---

## referrals

Tracks a patient being referred from one doctor/hospital to another.

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | Surrogate key |
| patient_id | UUID | FK → patients.id, NOT NULL, ON DELETE CASCADE | Patient being referred |
| visit_id | UUID | FK → visits.id, nullable, ON DELETE SET NULL | Visit that triggered the referral |
| referring_doctor_id | UUID | FK → doctors.id, NOT NULL, ON DELETE RESTRICT | Doctor making the referral |
| referring_hospital_id | UUID | FK → hospitals.id, NOT NULL, ON DELETE RESTRICT | Originating hospital |
| referred_to_doctor_id | UUID | FK → doctors.id, nullable, ON DELETE SET NULL | Target doctor, if known |
| referred_to_hospital_id | UUID | FK → hospitals.id, nullable, ON DELETE SET NULL | Target hospital |
| referred_to_department_id | UUID | FK → departments.id, nullable, ON DELETE SET NULL | Target department |
| reason | TEXT | NOT NULL | Clinical reason for referral |
| status | referral_status ENUM | NOT NULL, default `pending` | `pending`, `accepted`, `rejected`, `completed`, `cancelled` |
| notes | TEXT | nullable | Additional notes |
| created_at | TIMESTAMPTZ | NOT NULL | Row creation time |
| updated_at | TIMESTAMPTZ | NOT NULL | Auto-updated on write |

---

## visits

A single episode of care, from check-in to check-out. Central record linking
patients to hospitals/departments/doctors/appointments/tokens for a
particular encounter.

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | Surrogate key |
| patient_id | UUID | FK → patients.id, NOT NULL, ON DELETE CASCADE | Patient |
| hospital_id | UUID | FK → hospitals.id, NOT NULL, ON DELETE RESTRICT | Hospital |
| department_id | UUID | FK → departments.id, nullable, ON DELETE SET NULL | Department seen |
| doctor_id | UUID | FK → doctors.id, nullable, ON DELETE SET NULL | Doctor seen |
| appointment_id | UUID | FK → appointments.id, nullable, ON DELETE SET NULL | Linked appointment, if any |
| token_id | UUID | FK → tokens.id, nullable, ON DELETE SET NULL | Linked queue token, if any |
| visit_type | visit_type ENUM | NOT NULL, default `walk_in` | `walk_in`, `appointment`, `referral`, `emergency` |
| status | visit_status ENUM | NOT NULL, default `in_progress` | `in_progress`, `completed`, `cancelled` |
| check_in_time | TIMESTAMPTZ | NOT NULL, default now() | Check-in timestamp |
| check_out_time | TIMESTAMPTZ | nullable | Check-out timestamp |
| diagnosis | TEXT | nullable | Diagnosis recorded |
| notes | TEXT | nullable | Clinical/administrative notes |
| created_at | TIMESTAMPTZ | NOT NULL | Row creation time |
| updated_at | TIMESTAMPTZ | NOT NULL | Auto-updated on write |

**Analytics indexes:** `(hospital_id, check_in_time)`,
`(department_id, check_in_time)`, `(doctor_id, check_in_time)` — support
date-range aggregation used by dashboards.

---

## notifications

Outbound messages to users and/or patients across channels.

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | Surrogate key |
| user_id | UUID | FK → users.id, nullable, ON DELETE CASCADE | Recipient user (staff/doctor/admin) |
| patient_id | UUID | FK → patients.id, nullable, ON DELETE CASCADE | Recipient patient |
| type | VARCHAR(100) | NOT NULL | Notification type key, e.g. `token_called` |
| title | VARCHAR(255) | NOT NULL | Short title |
| message | TEXT | NOT NULL | Body text |
| channel | notification_channel ENUM | NOT NULL, default `in_app` | `sms`, `email`, `push`, `in_app` |
| status | notification_status ENUM | NOT NULL, default `pending` | `pending`, `sent`, `failed`, `read` |
| related_entity_type | VARCHAR(50) | nullable | e.g. `token`, `appointment` |
| related_entity_id | UUID | nullable | ID of the related entity (polymorphic, not FK-enforced) |
| sent_at | TIMESTAMPTZ | nullable | When it was sent |
| read_at | TIMESTAMPTZ | nullable | When it was read |
| created_at | TIMESTAMPTZ | NOT NULL | Row creation time |

Check constraint: at least one of `user_id` / `patient_id` must be present.

---

## hospital_statistics

Pre-aggregated daily rollups consumed by analytics dashboards. One row per
`(hospital, department, day)` — `department_id` may be `NULL` for a
hospital-wide rollup.

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | Surrogate key |
| hospital_id | UUID | FK → hospitals.id, NOT NULL, ON DELETE CASCADE | Hospital |
| department_id | UUID | FK → departments.id, nullable, ON DELETE CASCADE | Department (NULL = hospital-wide) |
| stat_date | DATE | NOT NULL | Day this rollup covers |
| total_patients | INTEGER | NOT NULL, default 0 | Distinct patients seen |
| total_appointments | INTEGER | NOT NULL, default 0 | Appointments that day |
| total_walk_ins | INTEGER | NOT NULL, default 0 | Walk-in visits that day |
| total_tokens_issued | INTEGER | NOT NULL, default 0 | Tokens issued |
| total_tokens_completed | INTEGER | NOT NULL, default 0 | Tokens completed |
| total_tokens_cancelled | INTEGER | NOT NULL, default 0 | Tokens cancelled/skipped |
| avg_wait_time_minutes | NUMERIC(8,2) | nullable | Average patient wait time |
| avg_consultation_time_minutes | NUMERIC(8,2) | nullable | Average consultation duration |
| peak_hour | SMALLINT | nullable | Hour (0–23) with highest volume |
| created_at | TIMESTAMPTZ | NOT NULL | Row creation time |
| updated_at | TIMESTAMPTZ | NOT NULL | Auto-updated on write |

Unique constraint: `(hospital_id, department_id, stat_date)`.

**Analytics indexes:** `(hospital_id, stat_date)`,
`(department_id, stat_date)`, `(stat_date)` — support dashboard queries
filtering by hospital/department over a date range.

---

## queue_events

Append-only audit/event log for everything that happens to a queue or token.
Powers both the live queue's real-time event feed and historical analytics
replay.

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK | Surrogate key |
| queue_id | UUID | FK → queues.id, NOT NULL, ON DELETE CASCADE | Queue the event belongs to |
| token_id | UUID | FK → tokens.id, nullable, ON DELETE SET NULL | Token the event relates to, if any |
| event_type | queue_event_type ENUM | NOT NULL | `queue_opened`, `queue_paused`, `queue_resumed`, `queue_closed`, `token_issued`, `token_called`, `token_started`, `token_completed`, `token_skipped`, `token_cancelled`, `token_requeued` |
| event_data | JSONB | NOT NULL, default `{}` | Arbitrary structured payload for the event |
| created_by | UUID | FK → users.id, nullable, ON DELETE SET NULL | Actor who triggered the event (system events leave this NULL) |
| created_at | TIMESTAMPTZ | NOT NULL, default now() | Event timestamp |

**Live-queue / analytics indexes:** `(queue_id, created_at DESC)` for the
real-time feed/polling of the latest events per queue, `(token_id)` for
per-token history, and `(event_type, created_at)` for analytics on event
volume over time.

---

## Entity relationship overview

```
hospitals ──< departments ──< doctors ──< appointments >── patients
    │              │              │              │             │
    │              └──< queues >──┘              │             ├──< visits
    │                     │                       │             ├──< tokens
    │                     └──< tokens >────────────────────────┘
    │                            │
    │                            └──< queue_events
    │
    └──< hospital_statistics

patients ──< triage_assessments (optionally linked to visits / tokens)
patients ──< referrals (between doctors / hospitals / departments)
users ──< notifications, and users ──< doctors (1:1 optional login)
```

## Enum reference

| Enum type | Values |
|---|---|
| user_role | admin, hospital_admin, doctor, staff, patient |
| gender_type | male, female, other, unspecified |
| appointment_status | scheduled, confirmed, cancelled, completed, no_show |
| queue_status | open, paused, closed |
| token_status | waiting, called, in_progress, completed, skipped, cancelled |
| token_priority | normal, urgent, emergency |
| triage_severity | non_urgent, less_urgent, urgent, emergent, immediate |
| referral_status | pending, accepted, rejected, completed, cancelled |
| visit_type | walk_in, appointment, referral, emergency |
| visit_status | in_progress, completed, cancelled |
| notification_channel | sms, email, push, in_app |
| notification_status | pending, sent, failed, read |
| queue_event_type | queue_opened, queue_paused, queue_resumed, queue_closed, token_issued, token_called, token_started, token_completed, token_skipped, token_cancelled, token_requeued |
