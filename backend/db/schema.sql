-- =============================================================================
-- schema.sql
-- PostgreSQL schema for the hospital patient-flow / queue management system.
--
-- Covers: users, patients, hospitals, departments, doctors, appointments,
-- tokens, queues, triage_assessments, referrals, visits, notifications,
-- hospital_statistics, queue_events.
--
-- Conventions:
--   * All tables use a surrogate UUID primary key named `id`.
--   * All tables have `created_at` (and `updated_at` where rows are mutated
--     after creation), maintained via the `set_updated_at` trigger.
--   * All identifiers are snake_case.
--   * Enumerated status/type fields use native PostgreSQL ENUM types so
--     invalid values are rejected at the database layer.
--   * Indexes are added specifically to support the live queue (real-time
--     polling of queues/tokens) and analytics endpoints (aggregation over
--     hospital_statistics, visits, appointments).
-- =============================================================================

BEGIN;

-- -----------------------------------------------------------------------------
-- Extensions
-- -----------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS pgcrypto;   -- gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS citext;     -- case-insensitive email columns
CREATE EXTENSION IF NOT EXISTS pg_trgm;    -- trigram search on patient names

-- -----------------------------------------------------------------------------
-- Reusable trigger to maintain updated_at columns
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- -----------------------------------------------------------------------------
-- Enumerated types
-- -----------------------------------------------------------------------------
CREATE TYPE user_role AS ENUM ('admin', 'hospital_admin', 'doctor', 'staff', 'patient');

CREATE TYPE gender_type AS ENUM ('male', 'female', 'other', 'unspecified');

CREATE TYPE appointment_status AS ENUM (
  'scheduled', 'confirmed', 'cancelled', 'completed', 'no_show'
);

CREATE TYPE queue_status AS ENUM ('open', 'paused', 'closed');

CREATE TYPE token_status AS ENUM (
  'waiting', 'called', 'in_progress', 'completed', 'skipped', 'cancelled'
);

CREATE TYPE token_priority AS ENUM ('normal', 'urgent', 'emergency');

CREATE TYPE triage_severity AS ENUM (
  'non_urgent', 'less_urgent', 'urgent', 'emergent', 'immediate'
);

CREATE TYPE referral_status AS ENUM ('pending', 'accepted', 'rejected', 'completed', 'cancelled');

CREATE TYPE visit_type AS ENUM ('walk_in', 'appointment', 'referral', 'emergency');

CREATE TYPE visit_status AS ENUM ('in_progress', 'completed', 'cancelled');

CREATE TYPE notification_channel AS ENUM ('sms', 'email', 'push', 'in_app');

CREATE TYPE notification_status AS ENUM ('pending', 'sent', 'failed', 'read');

CREATE TYPE queue_event_type AS ENUM (
  'queue_opened', 'queue_paused', 'queue_resumed', 'queue_closed',
  'token_issued', 'token_called', 'token_started', 'token_completed',
  'token_skipped', 'token_cancelled', 'token_requeued'
);

-- =============================================================================
-- users
-- Base authentication/identity table for anyone who can log in:
-- admins, hospital admins, doctors, staff, and (optionally) patients.
-- =============================================================================
CREATE TABLE users (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email             CITEXT UNIQUE,
  phone             VARCHAR(20) UNIQUE,
  password_hash     TEXT NOT NULL,
  role              user_role NOT NULL DEFAULT 'patient',
  full_name         VARCHAR(255) NOT NULL,
  is_active         BOOLEAN NOT NULL DEFAULT TRUE,
  last_login_at     TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT users_email_or_phone_present CHECK (email IS NOT NULL OR phone IS NOT NULL)
);

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX idx_users_role ON users (role);

-- =============================================================================
-- hospitals
-- =============================================================================
CREATE TABLE hospitals (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          VARCHAR(255) NOT NULL,
  code          VARCHAR(50) NOT NULL UNIQUE,
  address       TEXT,
  city          VARCHAR(120),
  state         VARCHAR(120),
  postal_code   VARCHAR(20),
  country       VARCHAR(120) NOT NULL DEFAULT 'India',
  phone         VARCHAR(20),
  email         CITEXT,
  latitude      NUMERIC(9, 6),
  longitude     NUMERIC(9, 6),
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_hospitals_updated_at
  BEFORE UPDATE ON hospitals
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX idx_hospitals_city ON hospitals (city);
CREATE INDEX idx_hospitals_is_active ON hospitals (is_active) WHERE is_active;

-- =============================================================================
-- departments
-- =============================================================================
CREATE TABLE departments (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id   UUID NOT NULL REFERENCES hospitals (id) ON DELETE CASCADE,
  name          VARCHAR(150) NOT NULL,
  code          VARCHAR(50) NOT NULL,
  description   TEXT,
  floor         VARCHAR(20),
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT departments_hospital_code_unique UNIQUE (hospital_id, code)
);

CREATE TRIGGER trg_departments_updated_at
  BEFORE UPDATE ON departments
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX idx_departments_hospital_id ON departments (hospital_id);
CREATE INDEX idx_departments_hospital_active ON departments (hospital_id, is_active);

-- =============================================================================
-- patients
-- =============================================================================
CREATE TABLE patients (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                   UUID UNIQUE REFERENCES users (id) ON DELETE SET NULL,
  medical_record_number     VARCHAR(50) UNIQUE,
  full_name                 VARCHAR(255) NOT NULL,
  date_of_birth             DATE,
  gender                    gender_type NOT NULL DEFAULT 'unspecified',
  phone                     VARCHAR(20),
  email                     CITEXT,
  address                   TEXT,
  blood_group               VARCHAR(5),
  emergency_contact_name    VARCHAR(255),
  emergency_contact_phone   VARCHAR(20),
  allergies                 TEXT,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_patients_updated_at
  BEFORE UPDATE ON patients
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX idx_patients_full_name ON patients USING GIN (full_name gin_trgm_ops);
CREATE INDEX idx_patients_phone ON patients (phone);

-- =============================================================================
-- doctors
-- =============================================================================
CREATE TABLE doctors (
  id                            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                       UUID UNIQUE REFERENCES users (id) ON DELETE SET NULL,
  hospital_id                   UUID NOT NULL REFERENCES hospitals (id) ON DELETE CASCADE,
  department_id                 UUID NOT NULL REFERENCES departments (id) ON DELETE RESTRICT,
  full_name                     VARCHAR(255) NOT NULL,
  specialization                VARCHAR(150),
  license_number                VARCHAR(100) UNIQUE,
  phone                         VARCHAR(20),
  email                         CITEXT,
  consultation_duration_minutes SMALLINT NOT NULL DEFAULT 15,
  is_active                     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at                    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_doctors_updated_at
  BEFORE UPDATE ON doctors
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX idx_doctors_hospital_id ON doctors (hospital_id);
CREATE INDEX idx_doctors_department_id ON doctors (department_id);
CREATE INDEX idx_doctors_hospital_department_active ON doctors (hospital_id, department_id, is_active);

-- =============================================================================
-- appointments
-- =============================================================================
CREATE TABLE appointments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id      UUID NOT NULL REFERENCES patients (id) ON DELETE CASCADE,
  doctor_id       UUID NOT NULL REFERENCES doctors (id) ON DELETE RESTRICT,
  hospital_id     UUID NOT NULL REFERENCES hospitals (id) ON DELETE RESTRICT,
  department_id   UUID NOT NULL REFERENCES departments (id) ON DELETE RESTRICT,
  scheduled_at    TIMESTAMPTZ NOT NULL,
  status          appointment_status NOT NULL DEFAULT 'scheduled',
  reason          TEXT,
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX idx_appointments_patient_id ON appointments (patient_id);
CREATE INDEX idx_appointments_doctor_scheduled_at ON appointments (doctor_id, scheduled_at);
CREATE INDEX idx_appointments_hospital_scheduled_at ON appointments (hospital_id, scheduled_at);
CREATE INDEX idx_appointments_status_scheduled_at ON appointments (status, scheduled_at);

-- =============================================================================
-- queues
-- One row per live queue instance (typically one per department/doctor/day).
-- =============================================================================
CREATE TABLE queues (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id           UUID NOT NULL REFERENCES hospitals (id) ON DELETE CASCADE,
  department_id         UUID NOT NULL REFERENCES departments (id) ON DELETE CASCADE,
  doctor_id             UUID REFERENCES doctors (id) ON DELETE SET NULL,
  queue_date            DATE NOT NULL,
  status                queue_status NOT NULL DEFAULT 'open',
  current_token_number  INTEGER NOT NULL DEFAULT 0,
  last_token_number     INTEGER NOT NULL DEFAULT 0,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT queues_unique_per_doctor_day UNIQUE (department_id, doctor_id, queue_date)
);

CREATE TRIGGER trg_queues_updated_at
  BEFORE UPDATE ON queues
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Live-queue lookups: "give me today's open queues for hospital X / department Y"
CREATE INDEX idx_queues_hospital_date_status ON queues (hospital_id, queue_date, status);
CREATE INDEX idx_queues_department_date_status ON queues (department_id, queue_date, status);
CREATE INDEX idx_queues_doctor_date ON queues (doctor_id, queue_date);

-- =============================================================================
-- tokens
-- Individual queue tickets issued to patients within a queue.
-- =============================================================================
CREATE TABLE tokens (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  queue_id                UUID NOT NULL REFERENCES queues (id) ON DELETE CASCADE,
  patient_id              UUID NOT NULL REFERENCES patients (id) ON DELETE CASCADE,
  appointment_id          UUID REFERENCES appointments (id) ON DELETE SET NULL,
  token_number            INTEGER NOT NULL,
  status                  token_status NOT NULL DEFAULT 'waiting',
  priority                token_priority NOT NULL DEFAULT 'normal',
  estimated_wait_minutes  INTEGER,
  issued_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
  called_at               TIMESTAMPTZ,
  started_at              TIMESTAMPTZ,
  completed_at            TIMESTAMPTZ,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT tokens_unique_number_per_queue UNIQUE (queue_id, token_number)
);

CREATE TRIGGER trg_tokens_updated_at
  BEFORE UPDATE ON tokens
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Live-queue lookups: current waiting/called tokens ordered by priority/number
CREATE INDEX idx_tokens_queue_status_priority ON tokens (queue_id, status, priority, token_number);
CREATE INDEX idx_tokens_patient_id ON tokens (patient_id);
CREATE INDEX idx_tokens_appointment_id ON tokens (appointment_id);
-- Partial index for the hot path: fetching only active (not-yet-finished) tokens
CREATE INDEX idx_tokens_active ON tokens (queue_id, token_number)
  WHERE status IN ('waiting', 'called', 'in_progress');

-- =============================================================================
-- triage_assessments
-- =============================================================================
CREATE TABLE triage_assessments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id      UUID NOT NULL REFERENCES patients (id) ON DELETE CASCADE,
  visit_id        UUID,           -- FK added after `visits` is created (circular ref)
  token_id        UUID REFERENCES tokens (id) ON DELETE SET NULL,
  assessed_by     UUID REFERENCES users (id) ON DELETE SET NULL,
  severity_level  triage_severity NOT NULL,
  chief_complaint TEXT,
  vital_signs     JSONB NOT NULL DEFAULT '{}'::jsonb,
  notes           TEXT,
  assessed_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_triage_assessments_updated_at
  BEFORE UPDATE ON triage_assessments
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX idx_triage_patient_id ON triage_assessments (patient_id);
CREATE INDEX idx_triage_token_id ON triage_assessments (token_id);
CREATE INDEX idx_triage_severity_assessed_at ON triage_assessments (severity_level, assessed_at);

-- =============================================================================
-- visits
-- A single episode of care: check-in through check-out.
-- =============================================================================
CREATE TABLE visits (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id      UUID NOT NULL REFERENCES patients (id) ON DELETE CASCADE,
  hospital_id     UUID NOT NULL REFERENCES hospitals (id) ON DELETE RESTRICT,
  department_id   UUID REFERENCES departments (id) ON DELETE SET NULL,
  doctor_id       UUID REFERENCES doctors (id) ON DELETE SET NULL,
  appointment_id  UUID REFERENCES appointments (id) ON DELETE SET NULL,
  token_id        UUID REFERENCES tokens (id) ON DELETE SET NULL,
  visit_type      visit_type NOT NULL DEFAULT 'walk_in',
  status          visit_status NOT NULL DEFAULT 'in_progress',
  check_in_time   TIMESTAMPTZ NOT NULL DEFAULT now(),
  check_out_time  TIMESTAMPTZ,
  diagnosis       TEXT,
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_visits_updated_at
  BEFORE UPDATE ON visits
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX idx_visits_patient_id ON visits (patient_id);
-- Analytics: aggregate visits per hospital/department over a date range
CREATE INDEX idx_visits_hospital_checkin ON visits (hospital_id, check_in_time);
CREATE INDEX idx_visits_department_checkin ON visits (department_id, check_in_time);
CREATE INDEX idx_visits_doctor_checkin ON visits (doctor_id, check_in_time);
CREATE INDEX idx_visits_status ON visits (status);

-- Now that `visits` exists, add the deferred FK from triage_assessments.
ALTER TABLE triage_assessments
  ADD CONSTRAINT fk_triage_visit
  FOREIGN KEY (visit_id) REFERENCES visits (id) ON DELETE SET NULL;

CREATE INDEX idx_triage_visit_id ON triage_assessments (visit_id);

-- =============================================================================
-- referrals
-- =============================================================================
CREATE TABLE referrals (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id                UUID NOT NULL REFERENCES patients (id) ON DELETE CASCADE,
  visit_id                  UUID REFERENCES visits (id) ON DELETE SET NULL,
  referring_doctor_id       UUID NOT NULL REFERENCES doctors (id) ON DELETE RESTRICT,
  referring_hospital_id     UUID NOT NULL REFERENCES hospitals (id) ON DELETE RESTRICT,
  referred_to_doctor_id     UUID REFERENCES doctors (id) ON DELETE SET NULL,
  referred_to_hospital_id   UUID REFERENCES hospitals (id) ON DELETE SET NULL,
  referred_to_department_id UUID REFERENCES departments (id) ON DELETE SET NULL,
  reason                    TEXT NOT NULL,
  status                    referral_status NOT NULL DEFAULT 'pending',
  notes                     TEXT,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_referrals_updated_at
  BEFORE UPDATE ON referrals
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX idx_referrals_patient_id ON referrals (patient_id);
CREATE INDEX idx_referrals_referring_doctor_id ON referrals (referring_doctor_id);
CREATE INDEX idx_referrals_referred_to_doctor_id ON referrals (referred_to_doctor_id);
CREATE INDEX idx_referrals_status ON referrals (status);

-- =============================================================================
-- notifications
-- =============================================================================
CREATE TABLE notifications (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID REFERENCES users (id) ON DELETE CASCADE,
  patient_id            UUID REFERENCES patients (id) ON DELETE CASCADE,
  type                  VARCHAR(100) NOT NULL,
  title                 VARCHAR(255) NOT NULL,
  message               TEXT NOT NULL,
  channel               notification_channel NOT NULL DEFAULT 'in_app',
  status                notification_status NOT NULL DEFAULT 'pending',
  related_entity_type   VARCHAR(50),
  related_entity_id     UUID,
  sent_at               TIMESTAMPTZ,
  read_at               TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT notifications_recipient_present CHECK (user_id IS NOT NULL OR patient_id IS NOT NULL)
);

CREATE INDEX idx_notifications_user_id_status ON notifications (user_id, status);
CREATE INDEX idx_notifications_patient_id_status ON notifications (patient_id, status);
CREATE INDEX idx_notifications_related_entity ON notifications (related_entity_type, related_entity_id);
CREATE INDEX idx_notifications_created_at ON notifications (created_at);

-- =============================================================================
-- hospital_statistics
-- Pre-aggregated daily rollups used by analytics dashboards.
-- =============================================================================
CREATE TABLE hospital_statistics (
  id                              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id                     UUID NOT NULL REFERENCES hospitals (id) ON DELETE CASCADE,
  department_id                   UUID REFERENCES departments (id) ON DELETE CASCADE,
  stat_date                       DATE NOT NULL,
  total_patients                  INTEGER NOT NULL DEFAULT 0,
  total_appointments               INTEGER NOT NULL DEFAULT 0,
  total_walk_ins                  INTEGER NOT NULL DEFAULT 0,
  total_tokens_issued             INTEGER NOT NULL DEFAULT 0,
  total_tokens_completed          INTEGER NOT NULL DEFAULT 0,
  total_tokens_cancelled          INTEGER NOT NULL DEFAULT 0,
  avg_wait_time_minutes           NUMERIC(8, 2),
  avg_consultation_time_minutes   NUMERIC(8, 2),
  peak_hour                       SMALLINT,
  created_at                      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                      TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT hospital_statistics_unique_day UNIQUE (hospital_id, department_id, stat_date)
);

CREATE TRIGGER trg_hospital_statistics_updated_at
  BEFORE UPDATE ON hospital_statistics
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Analytics: dashboards filter/aggregate by hospital+date range, and by department
CREATE INDEX idx_hospital_statistics_hospital_date ON hospital_statistics (hospital_id, stat_date);
CREATE INDEX idx_hospital_statistics_department_date ON hospital_statistics (department_id, stat_date);
CREATE INDEX idx_hospital_statistics_stat_date ON hospital_statistics (stat_date);

-- =============================================================================
-- queue_events
-- Append-only audit/event log for everything that happens to a queue/token.
-- Powers both the live queue's real-time feed and historical analytics.
-- =============================================================================
CREATE TABLE queue_events (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  queue_id      UUID NOT NULL REFERENCES queues (id) ON DELETE CASCADE,
  token_id      UUID REFERENCES tokens (id) ON DELETE SET NULL,
  event_type    queue_event_type NOT NULL,
  event_data    JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by    UUID REFERENCES users (id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Live-queue lookups: "give me the latest events for this queue" (real-time feed / polling)
CREATE INDEX idx_queue_events_queue_created_at ON queue_events (queue_id, created_at DESC);
CREATE INDEX idx_queue_events_token_id ON queue_events (token_id);
CREATE INDEX idx_queue_events_event_type_created_at ON queue_events (event_type, created_at);

COMMIT;
