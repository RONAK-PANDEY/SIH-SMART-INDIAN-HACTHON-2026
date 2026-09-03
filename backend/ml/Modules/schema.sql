-- =============================================================================
-- backend/db/schema.sql
--
-- STATUS: This file did not exist in any of the three uploaded modules.
-- It is reconstructed here from the field names each module's own Python
-- code actually reads/writes (dataclasses, Pydantic schemas, docstrings),
-- so that all three modules can be checked against ONE source of truth
-- going forward instead of three independently-drifting sets of feature
-- names. Treat this as a first draft for the team to review, not a
-- migration to run blindly -- in particular, check it against whatever
-- schema backend/ml/datasets/ (the synthetic data generator referenced in
-- project memory) already produces, and reconcile any differences there
-- rather than here.
--
-- Naming reconciliation notes (see inline comments below for detail):
--   * wait_time_prediction's "queue_length"          == congestion's "current_queue_length"
--   * wait_time_prediction's "doctors_available"     == congestion's "doctors_on_duty"
--   * wait_time_prediction's "average_consultation_time" has NO equivalent
--     field in congestion_prediction at all (see notes on wait_time_snapshots).
--   * wait_time_prediction's target "predicted_waiting_time" and
--     congestion's input "avg_wait_time_minutes" describe the same real-world
--     quantity (minutes a patient waits) but are never wired together in the
--     code -- congestion currently expects a caller to supply its own
--     measured average, it does not call the wait-time model. Decide
--     deliberately whether congestion should consume the wait-time model's
--     *predicted* value, a separately measured *actual* average, or both,
--     and name the column accordingly.
--   * triage_ai has no "department" field at all (see triage_assessments
--     below) -- it triages a patient in isolation from queue placement.
--     If a department needs to be attached to a triage record, that has to
--     be added to the questionnaire/schema deliberately; do not infer it.
-- =============================================================================

PRAGMA foreign_keys = ON;

-- ---------------------------------------------------------------------------
-- Core reference tables
-- ---------------------------------------------------------------------------

CREATE TABLE hospitals (
    hospital_id     TEXT PRIMARY KEY,
    name            TEXT NOT NULL,
    timezone        TEXT NOT NULL DEFAULT 'UTC'
);

CREATE TABLE departments (
    department_id   TEXT PRIMARY KEY,
    hospital_id     TEXT NOT NULL REFERENCES hospitals(hospital_id),
    -- Free-text name. wait_time_prediction and generate_synthetic_data.py
    -- both hard-code an 8-value department list (General Medicine,
    -- Pediatrics, Orthopedics, Cardiology, Dermatology, Emergency, ENT,
    -- Dental) as both the training categories AND the Pydantic validator's
    -- allow-list (predict.py VALID_DEPARTMENTS). If this table's `name`
    -- values diverge from that list even by punctuation/casing, the
    -- wait-time API will reject valid departments with a 422. Recommend a
    -- CHECK constraint or a departments-lookup enum table, not free text,
    -- once the list is considered stable -- see "Concrete fixes" item W3
    -- in the review.
    name            TEXT NOT NULL,
    UNIQUE (hospital_id, name)
);

CREATE TABLE doctors (
    doctor_id       TEXT PRIMARY KEY,
    hospital_id     TEXT NOT NULL REFERENCES hospitals(hospital_id),
    department_id   TEXT NOT NULL REFERENCES departments(department_id),
    name            TEXT NOT NULL,
    active          INTEGER NOT NULL DEFAULT 1  -- 0/1; on shift roster, not the same as doctors_on_duty at a point in time
);

CREATE TABLE patients (
    patient_id      TEXT PRIMARY KEY,
    hospital_id     TEXT NOT NULL REFERENCES hospitals(hospital_id),
    -- Matches triage_ai/schema.py AgeGroup buckets exactly (child_0_12,
    -- teen_13_17, adult_18_64, senior_65plus) so a patient row's computed
    -- age bucket and the triage questionnaire's age_group can never disagree
    -- due to different bucket boundaries defined in two places.
    date_of_birth   TEXT  -- ISO 8601 date; derive age_group at query time, don't duplicate-store it
);

CREATE TABLE appointments (
    appointment_id      TEXT PRIMARY KEY,
    patient_id          TEXT NOT NULL REFERENCES patients(patient_id),
    department_id       TEXT NOT NULL REFERENCES departments(department_id),
    doctor_id           TEXT REFERENCES doctors(doctor_id),
    scheduled_at        TEXT NOT NULL,   -- ISO 8601 timestamp
    checked_in_at       TEXT,
    seen_at             TEXT,
    -- Actual, observed wait in minutes once seen_at is known. This is the
    -- ground-truth label wait_time_prediction/train.py needs when you swap
    -- generate_synthetic_data.py's CSV for real data (README.md "Swapping
    -- in real data later" says to keep the same column NAME,
    -- predicted_waiting_time, for the target -- consider renaming that
    -- target to actual_waiting_time in a future revision so "predicted_*"
    -- isn't used for both the label and the model's output).
    actual_wait_minutes REAL
);

-- ---------------------------------------------------------------------------
-- wait_time_prediction: one row per (department, point-in-time) feature
-- snapshot used for training/serving. Column names below are copied
-- VERBATIM from wait_time_prediction/train.py NUMERIC_FEATURES /
-- CATEGORICAL_FEATURES / TARGET so a query against this table can be
-- fed to predict_waiting_time() without any renaming.
-- ---------------------------------------------------------------------------

CREATE TABLE wait_time_snapshots (
    snapshot_id                     TEXT PRIMARY KEY,
    department_id                   TEXT NOT NULL REFERENCES departments(department_id),
    observed_at                     TEXT NOT NULL,  -- ISO 8601 timestamp; hour/day below are derived from this

    queue_length                    INTEGER NOT NULL,   -- == congestion's current_queue_length (see notes)
    doctors_available                INTEGER NOT NULL,   -- == congestion's doctors_on_duty (see notes)
    average_consultation_time       REAL NOT NULL,       -- minutes/patient; NOT present in congestion_prediction at all
    patients_per_hour               REAL NOT NULL,       -- incoming demand rate
    priority_cases                   INTEGER NOT NULL,   -- urgent/queue-jumping cases
    hour                             INTEGER NOT NULL CHECK (hour BETWEEN 0 AND 23),
    day                              INTEGER NOT NULL CHECK (day BETWEEN 0 AND 6),  -- 0=Monday .. 6=Sunday, per train.py

    predicted_waiting_time          REAL,  -- label when this is training data; NULL for a live snapshot awaiting prediction

    FOREIGN KEY (department_id) REFERENCES departments(department_id)
);

-- ---------------------------------------------------------------------------
-- congestion_prediction: one row per (department, point-in-time) reading
-- fed to predict_congestion(). Column names copied verbatim from
-- congestion_prediction/schemas.py CongestionInput.
--
-- IMPORTANT (see review "Concrete fixes" C1): doctors_on_duty,
-- doctors_required, discharges_last_hour, and avg_wait_time_minutes are
-- nullable here ON PURPOSE, matching the patched CongestionInput. Do NOT
-- backfill these with 0 when a feed doesn't populate them yet -- 0 has a
-- specific, different meaning ("confirmed zero") from NULL ("not reported")
-- in the scoring logic, and collapsing that distinction silently produces
-- worst-case or best-case fabricated readings (see the review for a
-- reproduced example).
-- ---------------------------------------------------------------------------

CREATE TABLE congestion_snapshots (
    snapshot_id                         TEXT PRIMARY KEY,
    department_id                       TEXT NOT NULL REFERENCES departments(department_id),
    observed_at                         TEXT NOT NULL,  -- ISO 8601 timestamp; == CongestionInput.timestamp

    current_queue_length                INTEGER NOT NULL,   -- == wait_time's queue_length (see notes)
    historical_avg_queue_length         REAL NOT NULL,
    patient_arrivals_last_hour          INTEGER NOT NULL,
    historical_avg_arrivals_last_hour   REAL NOT NULL,
    admissions_last_hour                INTEGER,   -- accepted by the API but NOT currently used by any scoring
                                                     -- function (see review item C4) -- keep nullable until wired up
    discharges_last_hour                INTEGER,   -- NULL = not reported (see header note)

    avg_wait_time_minutes               REAL,      -- NULL = not reported (see header note)
    target_wait_time_minutes            REAL,

    doctors_on_duty                     INTEGER,   -- NULL = not reported (see header note)
    doctors_required                    INTEGER,   -- NULL = not reported (see header note)
    doctors_unavailable                 INTEGER NOT NULL DEFAULT 0,  -- informational only; see review item C3

    bed_occupancy_rate                  REAL CHECK (bed_occupancy_rate IS NULL OR bed_occupancy_rate BETWEEN 0 AND 1),

    -- Computed result, stored for audit/trend history rather than
    -- recomputed on read. Mirrors CongestionResult.to_dict().
    score                                INTEGER CHECK (score BETWEEN 0 AND 100),
    status                               TEXT CHECK (status IN ('green','yellow','red')),
    reason                               TEXT,
    missing_inputs                      TEXT  -- store as JSON array, e.g. '["staffing","wait_time"]'
);

-- ---------------------------------------------------------------------------
-- triage_ai: this table did not exist anywhere in the uploaded modules.
-- triage_ai/README.md explicitly describes the intended write pattern:
-- classify_triage() produces a SUGGESTION that creates/updates a row here
-- in a `pending` state for a clinician to confirm -- it must never set a
-- patient's live risk category directly (README "Before you wire this
-- into an endpoint"). Column names below are copied verbatim from
-- triage_ai/schema.py TriageQuestionnaireInput and TriageAssessmentResult.
-- ---------------------------------------------------------------------------

CREATE TABLE triage_assessments (
    assessment_id                   TEXT PRIMARY KEY,
    patient_id                      TEXT REFERENCES patients(patient_id),  -- nullable: schema.py's patient_id is Optional
    submitted_at                    TEXT NOT NULL,  -- ISO 8601 timestamp

    -- --- questionnaire input, verbatim field names from TriageQuestionnaireInput ---
    chief_complaint                 TEXT NOT NULL,
    duration                        TEXT NOT NULL CHECK (duration IN ('<1h','1-6h','6-24h','1-3d','>3d')),
    severity                        TEXT NOT NULL CHECK (severity IN ('mild','moderate','severe')),
    consciousness                   TEXT NOT NULL CHECK (consciousness IN ('alert','drowsy','unresponsive')),
    age_group                       TEXT NOT NULL CHECK (age_group IN ('child_0_12','teen_13_17','adult_18_64','senior_65plus')),
    fever                           INTEGER NOT NULL DEFAULT 0,
    breathing_difficulty            INTEGER NOT NULL DEFAULT 0,
    chest_discomfort                INTEGER NOT NULL DEFAULT 0,
    has_injury                      INTEGER NOT NULL DEFAULT 0,
    injury_details                  TEXT,
    existing_conditions              TEXT,

    -- Optional vitals -- almost always NULL today since Triage.tsx doesn't
    -- collect them (see triage_ai/README.md "Known gap: vitals"). Leave
    -- nullable; do NOT default to 0, which would read as a fatal vital
    -- sign under rules_engine.py's URGENT thresholds.
    heart_rate_bpm                  INTEGER,
    systolic_bp_mmhg                INTEGER,
    respiratory_rate                INTEGER,
    spo2_percent                    INTEGER,
    temperature_celsius              REAL,

    -- --- classify_triage() output, verbatim field names from TriageAssessmentResult ---
    suggested_risk_category         TEXT CHECK (suggested_risk_category IN ('ROUTINE','PRIORITY','URGENT')),
    matched_criteria                TEXT,   -- JSON array of {rule_id, description, category}
    confidence                      REAL CHECK (confidence IS NULL OR confidence BETWEEN 0 AND 1),
    unevaluable_red_flags            TEXT,  -- JSON array of strings
    safety_escalated                 INTEGER NOT NULL DEFAULT 0,
    safety_escalation_reason         TEXT,
    expedited_review_recommended     INTEGER NOT NULL DEFAULT 0,
    expedited_review_reasons         TEXT,  -- JSON array of strings
    engine_version                   TEXT,
    assessed_at                      TEXT,

    -- --- clinician confirmation workflow (README.md's "pending" model) ---
    -- This is the human-in-the-loop gate the README requires:
    -- suggested_risk_category is NEVER the patient's live/effective triage
    -- category until a clinician confirms it here.
    status                           TEXT NOT NULL DEFAULT 'pending'
                                       CHECK (status IN ('pending','confirmed','overridden')),
    confirmed_risk_category          TEXT CHECK (confirmed_risk_category IN ('ROUTINE','PRIORITY','URGENT')),
    confirmed_by_staff_id            TEXT,
    confirmed_at                     TEXT
);
