# 🇮🇳 SmartCare Regulatory Compliance Documentation

> **Version**: v3.0.0 | **Problem Statement**: SIH26133  
> **Regulatory Jurisdiction**: Republic of India  
> **Applicable Ministries**: MoHFW, MeitY, NHA

---

## 1. Applicable Indian Regulations

SmartCare has been designed to comply with the following Indian regulatory frameworks governing health data, digital technology, and patient rights:

| Regulation | Authority | Applicability | Compliance Status |
|------------|-----------|---------------|-------------------|
| **Information Technology Act, 2000** | MeitY | Digital data processing & security | ✅ Compliant |
| **IT (Reasonable Security Practices) Rules, 2011** | MeitY | Sensitive personal data protection | ✅ Compliant |
| **Digital Information Security in Healthcare Act (DISHA)** | MoHFW | Health data-specific protection (proposed) | ✅ Aligned |
| **Digital Personal Data Protection Act (DPDPA), 2023** | MeitY | Personal data processing & consent | ✅ Compliant |
| **Ayushman Bharat Digital Mission (ABDM)** | NHA | National health data interoperability | ✅ Compliant |
| **Clinical Establishments Act, 2010** | MoHFW | Hospital registration & standards | ✅ Compatible |
| **Indian Medical Council Regulations** | NMC | Doctor registration & practice standards | ✅ Compatible |
| **Consumer Protection Act, 2019** | MoCA | Patient rights & grievance redressal | ✅ Compliant |

---

## 2. IT Act 2000 — Compliance Mapping

### Section 43A: Compensation for Failure to Protect Data

| Requirement | SmartCare Implementation |
|-------------|-------------------------|
| Implement reasonable security practices | AES-256 encryption, RBAC, JWT auth, SHA-256 QR verification |
| Protect sensitive personal data | Health records encrypted at rest and in transit |
| Documented security policy | `docs/SECURITY.md` with complete audit checklist |
| Notification on breach | Incident response plan with 72-hour notification SLA |

### Section 72A: Disclosure of Personal Information

| Requirement | SmartCare Implementation |
|-------------|-------------------------|
| Prevent unauthorized disclosure | 4-tier RBAC — doctors see only assigned patients |
| Purpose limitation | Data collected only for OPD queue management & clinical care |
| Data minimization | Minimal required fields: name, ABHA ID, symptoms, vitals |

### IT (RSPP) Rules, 2011

| Rule | Requirement | Implementation |
|------|-------------|----------------|
| Rule 3 | Sensitive personal data definition | Health data classified as SPDI; treated with highest protection |
| Rule 4 | Privacy policy publication | Privacy policy accessible in all portals |
| Rule 5 | Consent before collection | Explicit consent during patient registration |
| Rule 6 | Purpose limitation | Health data used solely for OPD management |
| Rule 7 | Retention limitation | Data retention schedule: 30 days to 5 years by data type |
| Rule 8 | Security practices | ISO 27001-aligned security controls (see Security Audit) |

---

## 3. Digital Personal Data Protection Act (DPDPA) 2023

### Compliance Matrix

| DPDPA Principle | SmartCare Implementation | Status |
|-----------------|-------------------------|--------|
| **Lawful Purpose** | Data processed for healthcare delivery — legitimate purpose | ✅ |
| **Purpose Limitation** | Used exclusively for OPD queue management & clinical care | ✅ |
| **Data Minimization** | Only essential fields collected (name, ABHA, symptoms) | ✅ |
| **Data Accuracy** | Patient can update profile; doctor verifies clinical data | ✅ |
| **Storage Limitation** | Defined retention schedule; purge after expiry | ✅ |
| **Security Safeguards** | Encryption, RBAC, audit logging, incident response | ✅ |
| **Accountability** | Security lead designated; documentation maintained | ✅ |

### Data Principal Rights (Patient Rights)

| Right | Implementation | Access Point |
|-------|---------------|-------------|
| **Right to Access** | Patient can view all their health records | Patient Portal → Health Vault |
| **Right to Correction** | Patient can update personal information | Patient Portal → Profile |
| **Right to Erasure** | Account deletion removes personal data | Patient Portal → Settings |
| **Right to Grievance Redressal** | Formal grievance mechanism | Govt Portal → Grievance Tribunal |
| **Right to Nominate** | Emergency contact/nominee designation | Patient Portal → Registration |

---

## 4. DISHA Bill Alignment

While DISHA (Digital Information Security in Healthcare Act) is still proposed, SmartCare proactively aligns with its key provisions:

### Anticipated DISHA Requirements

| DISHA Provision | SmartCare Implementation | Status |
|-----------------|-------------------------|--------|
| **Digital health data ownership** | Patient owns their data; can export/delete | ✅ Aligned |
| **Health Information Exchange** | ABDM-compatible data structures | ✅ Aligned |
| **Consent framework** | Explicit opt-in consent for data sharing | ✅ Aligned |
| **Standardized health records** | FHIR-compatible patient records | ✅ Aligned |
| **Data localization** | All data stored on Indian servers (Supabase Mumbai region) | ✅ Aligned |
| **Breach notification** | 72-hour notification SLA in incident response plan | ✅ Aligned |
| **Penalties for unauthorized access** | RBAC prevents unauthorized access; audit trail for accountability | ✅ Aligned |
| **National Health Authority oversight** | Government Vigilance Portal provides real-time oversight | ✅ Aligned |

---

## 5. ABDM Integration Standards

### Health Data Exchange Compliance

| ABDM Standard | Specification | SmartCare Status |
|---------------|--------------|------------------|
| **ABHA (Ayushman Bharat Health Account)** | 14-digit unique health ID | ✅ Primary patient identifier |
| **HIP (Health Information Provider)** | Hospital as data source | ✅ Backend APIs emit structured health data |
| **HIU (Health Information User)** | Authorized data consumer | ✅ Consent-gated data access for doctors |
| **Health Record Format** | FHIR R4 compatible | ✅ Structured JSON records |
| **Consent Manager** | Patient-initiated consent | ✅ Explicit consent during data sharing |
| **Health Facility Registry (HFR)** | Facility identification | ✅ Hospital profiles with NIN |
| **Healthcare Professional Registry (HPR)** | Doctor identification | ✅ Doctor profiles with NMC registration |

### Data Flow with ABDM Compliance

```
Patient Registration:
  Patient → ABHA ID (14-digit) → SmartCare → Verify with ABDM Gateway

Consultation Record:
  Doctor → Clinical Notes → SmartCare → Structured Health Record
    → Patient Health Vault (encrypted)
    → Available for HIU access (with patient consent)

Consent Flow:
  HIU Request → Patient Consent (via Patient Portal) → SmartCare releases data
  Patient can revoke consent at any time → Access immediately terminated
```

---

## 6. Data Localization

### Indian Data Residency

| Data Type | Storage Location | Provider | Region |
|-----------|-----------------|----------|--------|
| Patient records | Supabase Cloud | AWS Mumbai (ap-south-1) | 🇮🇳 India |
| Consultation data | Supabase Cloud | AWS Mumbai (ap-south-1) | 🇮🇳 India |
| QR token data | Supabase Cloud | AWS Mumbai (ap-south-1) | 🇮🇳 India |
| Session tokens | In-memory (backend server) | Local | 🇮🇳 India |
| Redis cache | Local Redis / AWS ElastiCache | Mumbai region | 🇮🇳 India |
| Frontend assets | Vercel CDN | Edge nodes (India preferred) | 🌐 CDN |
| AI model inference | Google Gemini API | API call (no data retained) | — |

### Cross-Border Data Transfer

| Transfer Type | Status | Safeguard |
|---------------|--------|-----------|
| Patient health data | ❌ Never leaves India | Data localization enforced |
| Analytics (aggregated) | ❌ Not transferred | All processing on Indian servers |
| AI chatbot queries | ⚠️ API call to Gemini | No PHI in prompts; symptom descriptions only |
| Frontend static assets | ✅ CDN distribution | No sensitive data in static assets |

---

## 7. Consent Management Framework

### Consent Collection Points

| Point | Consent Type | Mechanism | Withdrawal |
|-------|-------------|-----------|------------|
| Patient Registration | Data processing consent | Checkbox + Terms acceptance | Account deletion |
| OPD Booking | Treatment data sharing | Implicit (healthcare delivery) | — |
| Doctor Rating | Survey data usage | Opt-in ("Submit Rating" action) | Rating can be deleted |
| Health Vault Export | Data sharing consent | Explicit per-request | Revoke anytime |
| Chatbot Interaction | Symptom data processing | Implicit (service usage) | Clear chat history |

### Consent Records

```json
{
  "consent_id": "cns_a1b2c3",
  "patient_id": "usr_981a8bc",
  "purpose": "opd_queue_management",
  "data_categories": ["demographics", "symptoms", "vitals"],
  "granted_at": "2026-09-01T10:30:00Z",
  "valid_until": "2027-09-01T10:30:00Z",
  "status": "active",
  "withdrawal_mechanism": "patient_portal_settings"
}
```

---

## 8. Audit Trail Documentation

### What is Logged

| Event | Data Captured | Retention |
|-------|--------------|-----------|
| User login/logout | User ID, timestamp, IP, role | 1 year |
| Patient registration | User ID, timestamp | 5 years |
| Token generation | Token ID, patient ID, department, timestamp | 1 year |
| QR scan | Token ID, scanner ID, guard ID, timestamp, result | 90 days |
| Consultation start/end | Doctor ID, patient ID, department, timestamps | 5 years |
| Prescription created | Doctor ID, patient ID, medications, timestamp | 5 years |
| Doctor rating submitted | Patient ID, doctor ID, score, timestamp | 3 years |
| API errors | Endpoint, error type, user ID, timestamp | 30 days |
| Admin actions | User ID, action, target, timestamp | 1 year |

### What is NOT Logged

| Data | Reason |
|------|--------|
| Passwords (even hashed) | Security best practice |
| Full ABHA ID | Data minimization — only last 4 digits |
| Clinical notes content | PHI protection — only metadata logged |
| Chat conversations | Patient privacy |
| Biometric data | Not collected |

---

## 9. Regulatory Compliance Summary

```
┌─────────────────────────────────────────────────────────────────┐
│                    SmartCare Compliance Status                   │
├─────────────────────┬──────────────────┬────────────────────────┤
│ Regulation          │ Status           │ Evidence               │
├─────────────────────┼──────────────────┼────────────────────────┤
│ IT Act 2000         │ ✅ Compliant     │ docs/SECURITY.md       │
│ IT (RSPP) Rules     │ ✅ Compliant     │ Security Audit (24/24) │
│ DPDPA 2023          │ ✅ Compliant     │ Consent framework      │
│ DISHA (Proposed)    │ ✅ Aligned       │ Proactive compliance   │
│ ABDM Standards      │ ✅ Compliant     │ ABHA integration       │
│ HIPAA (Reference)   │ ✅ Compliant     │ docs/SECURITY.md       │
│ Consumer Protection │ ✅ Compliant     │ Grievance tribunal     │
│ NMC Regulations     │ ✅ Compatible    │ Doctor registry        │
└─────────────────────┴──────────────────┴────────────────────────┘
```
