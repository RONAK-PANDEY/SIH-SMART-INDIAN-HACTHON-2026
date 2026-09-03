-- ============================================================================
-- Hospital Admin Dashboard — core schema
-- Target: PostgreSQL 13+
--
-- This models a typical OPD (outpatient) flow:
--   patient books/gets an appointment with a doctor in a department
--   -> checks in at reception (check_in_time)
--   -> consultation starts (consult_start_time)  [wait = check_in -> start]
--   -> consultation ends (consult_end_time)       [duration = start -> end]
--
-- Doctor "capacity" is modeled with a weekly recurring schedule
-- (doctor_schedules), which the analytics endpoints expand over a date
-- range to compute available slots vs. booked appointments.
-- ============================================================================

CREATE TABLE departments (
    id          SERIAL PRIMARY KEY,
    name        TEXT NOT NULL UNIQUE,
    code        TEXT NOT NULL UNIQUE
);

CREATE TABLE doctors (
    id              SERIAL PRIMARY KEY,
    full_name       TEXT NOT NULL,
    department_id   INTEGER NOT NULL REFERENCES departments(id),
    specialization  TEXT,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE
);

-- Recurring weekly availability. day_of_week follows Postgres ISODOW:
-- 1 = Monday ... 7 = Sunday.
CREATE TABLE doctor_schedules (
    id                      SERIAL PRIMARY KEY,
    doctor_id               INTEGER NOT NULL REFERENCES doctors(id),
    day_of_week             SMALLINT NOT NULL CHECK (day_of_week BETWEEN 1 AND 7),
    start_time              TIME NOT NULL,
    end_time                TIME NOT NULL CHECK (end_time > start_time),
    slot_duration_minutes   SMALLINT NOT NULL DEFAULT 15 CHECK (slot_duration_minutes > 0)
);

CREATE TABLE patients (
    id              SERIAL PRIMARY KEY,
    full_name       TEXT NOT NULL,
    date_of_birth   DATE,
    gender          TEXT,
    phone           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE appointments (
    id                  SERIAL PRIMARY KEY,
    patient_id          INTEGER NOT NULL REFERENCES patients(id),
    doctor_id           INTEGER NOT NULL REFERENCES doctors(id),
    department_id       INTEGER NOT NULL REFERENCES departments(id),
    scheduled_at        TIMESTAMPTZ NOT NULL,
    check_in_time       TIMESTAMPTZ,
    consult_start_time  TIMESTAMPTZ,
    consult_end_time    TIMESTAMPTZ,
    status              TEXT NOT NULL DEFAULT 'scheduled'
                         CHECK (status IN ('scheduled', 'checked_in', 'in_progress',
                                            'completed', 'cancelled', 'no_show')),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_appointments_scheduled_at   ON appointments (scheduled_at);
CREATE INDEX idx_appointments_check_in_time  ON appointments (check_in_time);
CREATE INDEX idx_appointments_department_id  ON appointments (department_id);
CREATE INDEX idx_appointments_doctor_id      ON appointments (doctor_id);
CREATE INDEX idx_appointments_status         ON appointments (status);
CREATE INDEX idx_doctor_schedules_doctor_id  ON doctor_schedules (doctor_id);
