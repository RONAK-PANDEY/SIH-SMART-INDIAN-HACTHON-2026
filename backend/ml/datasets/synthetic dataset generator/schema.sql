-- ============================================================================
-- Hospital Queue / Appointment System — Schema
-- ============================================================================
-- NOTE: The original schema only defined `users`, `hospitals`, and
-- `queue_tokens` as bare stubs (no FKs, minimal columns). This file keeps
-- those three tables and their column names/types unchanged, and extends
-- them with the tables required to support departments, doctors, patients,
-- appointments, and historical wait-time/queue data used by the ML pipeline.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Original tables (kept as-is, FKs added below via ALTER-free inline refs
-- where possible; columns unchanged)
-- ---------------------------------------------------------------------------

CREATE TABLE users (
    id VARCHAR(64) PRIMARY KEY,
    phone VARCHAR(32) UNIQUE
);

CREATE TABLE hospitals (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255)
);

-- ---------------------------------------------------------------------------
-- New: departments
-- ---------------------------------------------------------------------------

CREATE TABLE departments (
    id VARCHAR(64) PRIMARY KEY,
    hospital_id VARCHAR(64) NOT NULL REFERENCES hospitals(id),
    name VARCHAR(255) NOT NULL,           -- e.g. "Cardiology", "General Medicine"
    floor VARCHAR(16),
    avg_consult_minutes INTEGER DEFAULT 15  -- baseline consult duration for this dept
);

-- ---------------------------------------------------------------------------
-- New: doctors
-- ---------------------------------------------------------------------------

CREATE TABLE doctors (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id),
    hospital_id VARCHAR(64) NOT NULL REFERENCES hospitals(id),
    department_id VARCHAR(64) NOT NULL REFERENCES departments(id),
    name VARCHAR(255) NOT NULL,
    specialization VARCHAR(255),
    years_experience INTEGER,
    avg_consult_minutes INTEGER DEFAULT 15,  -- this doctor's typical pace
    punctuality_factor REAL DEFAULT 1.0       -- >1.0 = tends to run behind schedule
);

-- ---------------------------------------------------------------------------
-- New: doctor_availability (weekly recurring shifts)
-- ---------------------------------------------------------------------------

CREATE TABLE doctor_availability (
    id VARCHAR(64) PRIMARY KEY,
    doctor_id VARCHAR(64) NOT NULL REFERENCES doctors(id),
    day_of_week INTEGER NOT NULL,   -- 0=Monday ... 6=Sunday
    start_time VARCHAR(8) NOT NULL, -- "09:00"
    end_time VARCHAR(8) NOT NULL,   -- "13:00"
    slot_minutes INTEGER DEFAULT 15,
    is_active BOOLEAN DEFAULT TRUE
);

-- ---------------------------------------------------------------------------
-- New: patients
-- ---------------------------------------------------------------------------

CREATE TABLE patients (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    age INTEGER,
    gender VARCHAR(16),
    home_hospital_id VARCHAR(64) REFERENCES hospitals(id)
);

-- ---------------------------------------------------------------------------
-- New: appointments
-- ---------------------------------------------------------------------------

CREATE TABLE appointments (
    id VARCHAR(64) PRIMARY KEY,
    patient_id VARCHAR(64) NOT NULL REFERENCES patients(id),
    doctor_id VARCHAR(64) NOT NULL REFERENCES doctors(id),
    hospital_id VARCHAR(64) NOT NULL REFERENCES hospitals(id),
    department_id VARCHAR(64) NOT NULL REFERENCES departments(id),
    scheduled_time TIMESTAMP NOT NULL,
    check_in_time TIMESTAMP,
    consult_start_time TIMESTAMP,
    consult_end_time TIMESTAMP,
    status VARCHAR(16) DEFAULT 'scheduled',  -- scheduled|checked_in|in_consult|completed|no_show|cancelled
    is_walk_in BOOLEAN DEFAULT FALSE,
    day_of_week INTEGER,     -- denormalized for fast ML feature lookup
    hour_of_day INTEGER      -- denormalized for fast ML feature lookup
);

-- ---------------------------------------------------------------------------
-- Original: queue_tokens (kept, extended with FKs + fields needed for
-- queue-length / wait-time features)
-- ---------------------------------------------------------------------------

CREATE TABLE queue_tokens (
    id VARCHAR(64) PRIMARY KEY,
    token_number VARCHAR(32),
    appointment_id VARCHAR(64) REFERENCES appointments(id),
    hospital_id VARCHAR(64) REFERENCES hospitals(id),
    department_id VARCHAR(64) REFERENCES departments(id),
    doctor_id VARCHAR(64) REFERENCES doctors(id),
    issued_at TIMESTAMP,
    called_at TIMESTAMP,
    queue_position_at_issue INTEGER,   -- how many ahead when token was issued
    patients_ahead_at_issue INTEGER
);

-- ---------------------------------------------------------------------------
-- New: wait_time_history (materialized per-appointment ML training rows)
-- ---------------------------------------------------------------------------

CREATE TABLE wait_time_history (
    id VARCHAR(64) PRIMARY KEY,
    appointment_id VARCHAR(64) NOT NULL REFERENCES appointments(id),
    hospital_id VARCHAR(64) NOT NULL REFERENCES hospitals(id),
    department_id VARCHAR(64) NOT NULL REFERENCES departments(id),
    doctor_id VARCHAR(64) NOT NULL REFERENCES doctors(id),
    scheduled_time TIMESTAMP NOT NULL,
    day_of_week INTEGER NOT NULL,
    hour_of_day INTEGER NOT NULL,
    queue_length_at_arrival INTEGER,     -- patients waiting when this patient arrived
    doctor_backlog_minutes INTEGER,      -- how far behind doctor was running
    actual_wait_minutes INTEGER NOT NULL,   -- target variable for ML
    consult_duration_minutes INTEGER
);
