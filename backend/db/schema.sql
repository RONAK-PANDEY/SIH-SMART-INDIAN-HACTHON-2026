-- ==========================================================
-- SmartCare PostgreSQL Database Schema
-- Maintainer: Rishikesh (SIH 2026)
-- Target DB: PostgreSQL 15+
-- ==========================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table (Patients, Doctors, Staff, Admins)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(32) UNIQUE NOT NULL,
    abha_id VARCHAR(64) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(32) NOT NULL DEFAULT 'patient', -- patient, doctor, staff, admin, superadmin
    age INT,
    gender VARCHAR(16),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Hospitals Table
CREATE TABLE IF NOT EXISTS hospitals (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    tier VARCHAR(32) NOT NULL, -- primary, secondary, tertiary
    total_beds INT DEFAULT 0,
    available_beds INT DEFAULT 0,
    current_load_pct FLOAT DEFAULT 0.0,
    latitude DECIMAL(10, 7),
    longitude DECIMAL(10, 7),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Departments Table
CREATE TABLE IF NOT EXISTS departments (
    id VARCHAR(64) PRIMARY KEY,
    hospital_id VARCHAR(64) REFERENCES hospitals(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    room_prefix VARCHAR(16),
    max_daily_capacity INT DEFAULT 200,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Doctors Profile Table
CREATE TABLE IF NOT EXISTS doctors (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    hospital_id VARCHAR(64) REFERENCES hospitals(id) ON DELETE CASCADE,
    department_id VARCHAR(64) REFERENCES departments(id) ON DELETE CASCADE,
    speciality VARCHAR(100) NOT NULL,
    room_number VARCHAR(32) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    avg_consult_time_mins FLOAT DEFAULT 7.5
);

-- 5. Queue Tokens Table
CREATE TABLE IF NOT EXISTS queue_tokens (
    id VARCHAR(64) PRIMARY KEY,
    token_number VARCHAR(32) NOT NULL,
    patient_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    hospital_id VARCHAR(64) REFERENCES hospitals(id) ON DELETE CASCADE,
    department_id VARCHAR(64) REFERENCES departments(id) ON DELETE CASCADE,
    doctor_id VARCHAR(64) REFERENCES doctors(id) ON DELETE SET NULL,
    triage_level INT DEFAULT 4, -- 1 to 5 (ESI Scale)
    priority_score FLOAT DEFAULT 1.0,
    status VARCHAR(32) NOT NULL DEFAULT 'WAITING', -- WAITING, NEXT, IN_CONSULTATION, COMPLETED, SKIPPED, REFERRED
    estimated_wait_mins INT DEFAULT 15,
    issued_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    called_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- 6. Triage Records Table
CREATE TABLE IF NOT EXISTS triage_records (
    id VARCHAR(64) PRIMARY KEY,
    patient_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    token_id VARCHAR(64) REFERENCES queue_tokens(id) ON DELETE SET NULL,
    symptoms JSONB NOT NULL,
    vitals JSONB,
    esi_level INT NOT NULL,
    assessed_by VARCHAR(64) DEFAULT 'AI_ASSISTANT',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Inter-Hospital Referrals Table
CREATE TABLE IF NOT EXISTS referrals (
    id VARCHAR(64) PRIMARY KEY,
    patient_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    from_hospital_id VARCHAR(64) REFERENCES hospitals(id),
    to_hospital_id VARCHAR(64) REFERENCES hospitals(id),
    department_id VARCHAR(64) REFERENCES departments(id),
    reason TEXT NOT NULL,
    fast_track_token VARCHAR(32),
    status VARCHAR(32) DEFAULT 'PENDING', -- PENDING, ACCEPTED, COMPLETED, EXPIRED
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_tokens_hospital_dept ON queue_tokens(hospital_id, department_id, status);
CREATE INDEX IF NOT EXISTS idx_tokens_priority ON queue_tokens(priority_score DESC);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
