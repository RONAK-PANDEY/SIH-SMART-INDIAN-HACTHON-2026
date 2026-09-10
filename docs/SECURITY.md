# 🔒 SmartCare Security Architecture & Compliance Documentation

> **Version**: v3.0.0 | **Problem Statement**: SIH26133  
> **Classification**: Public — Approved for SIH 2026 evaluation  
> **Last Audit**: September 2026

---

## 1. Security Overview

SmartCare implements a defense-in-depth security architecture designed for handling sensitive patient health information in compliance with Indian and international healthcare data protection standards.

### Security Principles

| Principle | Implementation |
|-----------|---------------|
| **Defense in Depth** | Multi-layer security: transport, application, database, infrastructure |
| **Least Privilege** | RBAC with 4-tier role isolation |
| **Zero Trust** | Every API request authenticated, no implicit trust |
| **Data Minimization** | Only collect essential health data |
| **Encryption Everywhere** | TLS 1.3 in transit, AES-256 at rest |

---

## 2. HIPAA Compliance Mapping

While HIPAA is a US standard, SmartCare maps to HIPAA safeguards as a gold-standard baseline for healthcare data protection:

### Administrative Safeguards

| HIPAA Requirement | SmartCare Implementation | Status |
|-------------------|-------------------------|--------|
| **Security Management Process** | Documented security policies, risk assessment conducted | ✅ Compliant |
| **Assigned Security Responsibility** | Dedicated security lead (Arpan — System Architect) | ✅ Compliant |
| **Workforce Security** | RBAC with 4 distinct roles, no shared credentials | ✅ Compliant |
| **Information Access Management** | Role-based data access, API-level authorization | ✅ Compliant |
| **Security Awareness Training** | Team trained on PHI handling, secure coding practices | ✅ Compliant |
| **Security Incident Procedures** | Incident response plan documented (Section 9) | ✅ Compliant |
| **Contingency Plan** | In-memory fallback mode, automated failover | ✅ Compliant |
| **Evaluation** | Regular security reviews, automated testing | ✅ Compliant |

### Physical Safeguards

| HIPAA Requirement | SmartCare Implementation | Status |
|-------------------|-------------------------|--------|
| **Facility Access Controls** | Cloud infrastructure (Supabase) with SOC 2 compliance | ✅ Compliant |
| **Workstation Security** | Encrypted connections, no local PHI storage on client | ✅ Compliant |
| **Device & Media Controls** | No PHI stored on Android scanner devices | ✅ Compliant |

### Technical Safeguards

| HIPAA Requirement | SmartCare Implementation | Status |
|-------------------|-------------------------|--------|
| **Access Control** | JWT + RBAC, unique user IDs, auto-logoff (24h expiry) | ✅ Compliant |
| **Audit Controls** | Full request logging with user attribution | ✅ Compliant |
| **Integrity Controls** | SHA-256 token hashing, tamper detection on QR passes | ✅ Compliant |
| **Transmission Security** | TLS 1.3 for all API/WebSocket communications | ✅ Compliant |
| **Authentication** | JWT HS256, unique credentials per user and role | ✅ Compliant |

---

## 3. ABDM (Ayushman Bharat Digital Mission) Compliance

SmartCare adheres to India's national health data standards as defined by the Ayushman Bharat Digital Mission:

| ABDM Standard | Implementation | Status |
|----------------|---------------|--------|
| **ABHA ID Integration** | Patient registration supports 14-digit ABHA ID as primary identifier | ✅ Implemented |
| **Health Information Exchange** | Structured health data format compatible with ABDM HIP/HIU protocols | ✅ Implemented |
| **Consent Management** | Patient-initiated consent for data sharing (opt-in model) | ✅ Implemented |
| **Health Record Standards** | FHIR-aligned patient records structure | ✅ Implemented |
| **Data Portability** | Patient health vault with export capability | ✅ Implemented |
| **Provider Registry** | Doctor profiles linked to NMC registration numbers | ✅ Implemented |
| **Facility Registry** | Hospital profiles with NIN (National Institution Number) | ✅ Implemented |
| **Digital Health ID** | ABHA ID used as primary patient identifier across the platform | ✅ Implemented |
| **Privacy by Design** | Data minimization, pseudonymization, purpose limitation | ✅ Implemented |

---

## 4. Encryption Protocols

### Data in Transit

| Protocol | Usage | Configuration |
|----------|-------|---------------|
| **TLS 1.3** | All REST API communications | Enforced via HTTPS in production |
| **WSS** | WebSocket connections | TLS-encrypted WebSocket in production |
| **HTTPS** | Frontend portal access | SSL certificates via Let's Encrypt / Vercel |

### Data at Rest

| Method | Usage | Key Management |
|--------|-------|----------------|
| **AES-256** | Patient health records in database | Supabase-managed encryption keys |
| **SHA-256** | QR token pass integrity verification | Per-token unique hash with salt |
| **HS256** | JWT token signing | Environment-variable secret key (rotate monthly) |
| **bcrypt** | Password hashing | Cost factor 12, per-user salt |

### QR Token Security Pipeline

```
Token Generation:
  token_data = {patient_id, hospital_id, department_id, timestamp, expiry}
  hash = SHA-256(token_data + server_secret)
  qr_payload = {token_number, hash, expiry_ts}

Token Verification (Scan):
  1. Extract {token_number, hash} from QR
  2. Fetch token_data from database
  3. Recompute: expected_hash = SHA-256(token_data + server_secret)
  4. Compare: hash === expected_hash (constant-time comparison)
  5. Check: current_time < expiry_ts
  6. Check: status !== 'already_scanned'
  7. If all pass → Mark SCANNED, broadcast WebSocket event
```

### Security Guarantees

| Threat | Countermeasure | Verification |
|--------|---------------|-------------|
| QR Forgery | SHA-256 cryptographic hash with server secret | `test_token_scanner.py` — tamper rejection test |
| QR Replay | Duplicate scan detection (`ALREADY_SCANNED` 400) | `test_token_scanner.py` — duplicate blocking test |
| Expired Token | Server-side expiry check | `test_token_scanner.py` — expiry test |
| Token Enumeration | Non-sequential token IDs, hash required for scan | API enforces both token_number + hash |
| Man-in-the-Middle | TLS 1.3 on all channels | Infrastructure-level enforcement |

---

## 5. RBAC Access Control Matrix

SmartCare implements 4-tier Role-Based Access Control:

### Role Definitions

| Role | Description | Scope |
|------|-------------|-------|
| **Patient** | Citizens booking OPD appointments | Own data only |
| **Doctor** | Clinical staff managing patient consultations | Assigned department patients |
| **Observer** | Government vigilance officers (MoHFW) | National-level read access |
| **Scanner** | Turnstile gate security staff | Scan verification only |

### Permission Matrix

| Resource | Patient | Doctor | Observer | Scanner |
|----------|---------|--------|----------|---------|
| **Own Profile** | Read/Write | Read/Write | Read | — |
| **Book Appointment** | ✅ Create | — | — | — |
| **View Own Tokens** | ✅ Read | — | — | — |
| **Generate QR Token** | ✅ Create | — | — | — |
| **Scan QR Token** | — | — | — | ✅ Create |
| **View Department Queue** | Own position | ✅ Full queue | ✅ All queues | — |
| **Call Patient** | — | ✅ Own dept | — | — |
| **Complete Consultation** | — | ✅ Create | — | — |
| **Write Prescription** | — | ✅ Create | — | — |
| **View Patient EMR** | Own records | ✅ Assigned patients | — | — |
| **Submit Doctor Rating** | ✅ Create | — | — | — |
| **View DPI Scores** | — | — | ✅ Read | — |
| **Calculate Bonus** | — | — | ✅ Create | — |
| **View Sentinel Dashboard** | — | — | ✅ Read | — |
| **Manage Grievances** | ✅ Create | — | ✅ Read/Update | — |
| **Access Chatbot** | ✅ Use | ✅ Use | — | — |

---

## 6. Security Audit Checklist

| # | Category | Check | Status |
|---|----------|-------|--------|
| 1 | **Authentication** | JWT tokens with HS256 signing | ✅ Pass |
| 2 | **Authentication** | Token expiry enforced (24h) | ✅ Pass |
| 3 | **Authentication** | Password hashing (bcrypt, cost 12) | ✅ Pass |
| 4 | **Authorization** | RBAC enforced on all endpoints | ✅ Pass |
| 5 | **Authorization** | No privilege escalation paths | ✅ Pass |
| 6 | **Input Validation** | Pydantic schema validation on all inputs | ✅ Pass |
| 7 | **Input Validation** | SQL injection prevention (parameterized queries) | ✅ Pass |
| 8 | **Input Validation** | XSS prevention (React auto-escaping) | ✅ Pass |
| 9 | **Cryptography** | SHA-256 QR token integrity | ✅ Pass |
| 10 | **Cryptography** | Constant-time hash comparison | ✅ Pass |
| 11 | **Cryptography** | No hardcoded secrets in source code | ✅ Pass |
| 12 | **Transport** | TLS 1.3 enforced in production | ✅ Pass |
| 13 | **Transport** | WSS for WebSocket connections | ✅ Pass |
| 14 | **CORS** | Configured for known origins (production) | ✅ Pass |
| 15 | **Headers** | Security headers (X-Frame-Options, CSP) | ✅ Pass |
| 16 | **Rate Limiting** | Per-key rate tracking with pool rotation | ✅ Pass |
| 17 | **Logging** | Request logging with user attribution | ✅ Pass |
| 18 | **Logging** | No PHI in application logs | ✅ Pass |
| 19 | **Dependencies** | No known CVEs in production dependencies | ✅ Pass |
| 20 | **Secrets** | Environment variables, not hardcoded | ✅ Pass |
| 21 | **Data** | PHI encrypted at rest (Supabase AES-256) | ✅ Pass |
| 22 | **Data** | Data retention policy defined | ✅ Pass |
| 23 | **Resilience** | Graceful fallback on service failure | ✅ Pass |
| 24 | **Testing** | Security-focused unit tests (token scanner) | ✅ Pass |

**Audit Result: 24/24 checks passed** ✅

---

## 7. Data Retention & Anonymization Policy

### Retention Schedule

| Data Type | Retention Period | After Expiry |
|-----------|-----------------|-------------|
| Active OPD tokens | Duration of visit + 24h | Archived → anonymized |
| Consultation records | 5 years (medical-legal) | Pseudonymized, retained |
| Patient demographics | Active account lifetime | Deleted on account closure |
| Doctor performance (DPI) | 3 years (rolling) | Aggregated, individual removed |
| QR scan logs | 90 days | Purged |
| WebSocket event logs | 30 days | Purged |
| System access logs | 1 year | Purged |
| Grievance records | 5 years | Archived |

### Anonymization Techniques

| Technique | Applied To | Method |
|-----------|-----------|--------|
| **Pseudonymization** | Patient records in analytics | Replace PII with reversible pseudonyms |
| **K-Anonymity** | Aggregate statistics | Ensure k ≥ 5 for any cohort |
| **Data Masking** | ABHA ID in logs | Show only last 4 digits |
| **Tokenization** | Patient ID in external systems | Non-reversible surrogate keys |

---

## 8. API Security Architecture

```
Client Request
    │
    ▼
┌──────────────────┐
│ TLS 1.3 Layer    │ ← Transport encryption
└────────┬─────────┘
         │
    ▼
┌──────────────────┐
│ CORS Middleware   │ ← Origin validation
└────────┬─────────┘
         │
    ▼
┌──────────────────┐
│ Rate Limiter      │ ← Per-key rate tracking
└────────┬─────────┘
         │
    ▼
┌──────────────────┐
│ JWT Validation    │ ← Token signature + expiry check
└────────┬─────────┘
         │
    ▼
┌──────────────────┐
│ RBAC Enforcer     │ ← Role-based permission check
└────────┬─────────┘
         │
    ▼
┌──────────────────┐
│ Input Validation  │ ← Pydantic schema enforcement
│ (Pydantic)        │
└────────┬─────────┘
         │
    ▼
┌──────────────────┐
│ Business Logic    │ ← Service layer processing
└────────┬─────────┘
         │
    ▼
┌──────────────────┐
│ Parameterized DB  │ ← SQL injection prevention
│ Queries           │
└──────────────────┘
```

---

## 9. Incident Response Plan

### Severity Levels

| Level | Definition | Response Time | Example |
|-------|-----------|---------------|---------|
| **P1 — Critical** | Data breach, system compromise | **< 1 hour** | Unauthorized PHI access |
| **P2 — High** | Service outage, auth bypass | **< 4 hours** | JWT signing key compromise |
| **P3 — Medium** | Degraded service, minor vuln | **< 24 hours** | Rate limit bypass |
| **P4 — Low** | Cosmetic, informational | **< 1 week** | Deprecated dependency |

### Response Procedure

```
1. DETECT    → Automated monitoring alerts or user report
2. TRIAGE    → Classify severity (P1–P4)
3. CONTAIN   → Isolate affected systems, revoke compromised credentials
4. ERADICATE → Patch vulnerability, deploy fix
5. RECOVER   → Restore normal operations, verify integrity
6. REVIEW    → Post-incident analysis, update procedures
7. NOTIFY    → Inform affected users (if PHI involved, within 72 hours)
```

### Contact

For security concerns or vulnerability reports, see [SECURITY.md](../SECURITY.md) in the project root.
