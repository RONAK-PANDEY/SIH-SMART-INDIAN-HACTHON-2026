-- ====================================================================
-- SmartCare SIH 2026 - Supabase Storage Migration
-- Purpose: Tokens table, Status Enum, Indexes & Row Level Security (RLS)
-- Target: Supabase / PostgreSQL 15+
-- ====================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Create Token Status Enum
DO $$ BEGIN
    CREATE TYPE token_status AS ENUM ('issued', 'scanned', 'called', 'completed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. Create Tokens Table
CREATE TABLE IF NOT EXISTS tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token_number VARCHAR(32) NOT NULL,
    patient_id VARCHAR(64) NOT NULL,
    dept VARCHAR(64) NOT NULL,
    hospital_id VARCHAR(64) NOT NULL DEFAULT 'hosp-001',
    hash VARCHAR(255) NOT NULL,
    status token_status NOT NULL DEFAULT 'issued',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    scanned_at TIMESTAMPTZ,
    scanned_by VARCHAR(64),
    assigned_room VARCHAR(64),
    assigned_doctor_name VARCHAR(128),
    priority_score FLOAT DEFAULT 1.0,
    estimated_wait_minutes INT DEFAULT 15,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- 4. High-Performance Query Indexes
CREATE INDEX IF NOT EXISTS idx_tokens_token_number ON tokens (token_number);
CREATE INDEX IF NOT EXISTS idx_tokens_patient_id ON tokens (patient_id);
CREATE INDEX IF NOT EXISTS idx_tokens_dept ON tokens (dept);
CREATE INDEX IF NOT EXISTS idx_tokens_status ON tokens (status);
CREATE INDEX IF NOT EXISTS idx_tokens_hash ON tokens (hash);
CREATE INDEX IF NOT EXISTS idx_tokens_created_at ON tokens (created_at DESC);

-- ====================================================================
-- 5. Row Level Security (RLS) Policies
-- ====================================================================

ALTER TABLE tokens ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if re-running
DROP POLICY IF EXISTS "tokens_patient_read_policy" ON tokens;
DROP POLICY IF EXISTS "tokens_doctor_read_write_policy" ON tokens;
DROP POLICY IF EXISTS "tokens_govt_observer_read_policy" ON tokens;
DROP POLICY IF EXISTS "tokens_scanner_read_update_policy" ON tokens;
DROP POLICY IF EXISTS "tokens_service_role_all" ON tokens;

-- Policy A: Service role key bypass for Backend API Gateway
-- Since all client operations (Patient, Doctor, Observer, Android) are brokered
-- strictly through the single FastAPI backend service keys.
CREATE POLICY "tokens_service_role_all"
ON tokens
FOR ALL
USING (auth.role() = 'service_role' OR auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'service_role' OR auth.role() = 'authenticated');

-- Policy B: Citizen / Patients can only read their own tokens
CREATE POLICY "tokens_patient_read_policy"
ON tokens
FOR SELECT
USING (
    patient_id = auth.uid()::text
    OR current_setting('request.jwt.claim.patient_id', true) = patient_id
);

-- Policy C: Doctor Console role can read & write tokens for its hospital
CREATE POLICY "tokens_doctor_read_write_policy"
ON tokens
FOR ALL
USING (
    (current_setting('request.jwt.claim.role', true) IN ('doctor', 'staff')
     AND hospital_id = current_setting('request.jwt.claim.hospital_id', true))
    OR current_setting('request.jwt.claim.service_role', true) = 'doctor_console'
)
WITH CHECK (
    (current_setting('request.jwt.claim.role', true) IN ('doctor', 'staff')
     AND hospital_id = current_setting('request.jwt.claim.hospital_id', true))
    OR current_setting('request.jwt.claim.service_role', true) = 'doctor_console'
);

-- Policy D: Govt Vigilance & Observer role is read-only on aggregates
CREATE POLICY "tokens_govt_observer_read_policy"
ON tokens
FOR SELECT
USING (
    current_setting('request.jwt.claim.role', true) IN ('observer', 'ombudsman', 'admin')
    OR current_setting('request.jwt.claim.service_role', true) = 'govt_observer'
);

-- Policy E: Android Turnstile Scanner client can read & update scan timestamps
CREATE POLICY "tokens_scanner_read_update_policy"
ON tokens
FOR ALL
USING (
    current_setting('request.jwt.claim.role', true) = 'scanner'
    OR current_setting('request.jwt.claim.service_role', true) = 'android_scanner'
)
WITH CHECK (
    status IN ('issued', 'scanned')
);

-- Comments for DB documentation
COMMENT ON TABLE tokens IS 'SmartCare central OPD queue tokens table with cryptographic verification hashes';
COMMENT ON COLUMN tokens.hash IS 'SHA-256 HMAC verification hash embedded into patient digital QR passes';
COMMENT ON COLUMN tokens.status IS 'Current token lifecycle status: issued -> scanned -> called -> completed';
