# SmartCare: Next-Gen AI Smart OPD, Emergency Queue & Government Vigilance Platform
### Smart India Hackathon (SIH) 2026 — Official Release v3.0.0 (V3 Master Release)

![SmartCare Banner](https://img.shields.io/badge/SIH-2026-blue?style=for-the-badge) ![Release](https://img.shields.io/badge/Release-v3.0.0_V3-success?style=for-the-badge) ![Status](https://img.shields.io/badge/Status-Production_Ready-brightgreen?style=for-the-badge) ![License](https://img.shields.io/badge/License-MIT-purple?style=for-the-badge) ![FastAPI](https://img.shields.io/badge/Backend-FastAPI_0.110-teal?style=for-the-badge) ![React](https://img.shields.io/badge/Frontend-React_18_TypeScript-blue?style=for-the-badge) ![Supabase](https://img.shields.io/badge/Database-Supabase_Multi--Key_Pool-emerald?style=for-the-badge)

---

## 📌 Problem Statement Details (SIH Format)

| Field | Detail |
| :--- | :--- |
| **Problem Statement ID** | SIH26133 |
| **Problem Statement Title** | Smart Hospital Queue and Healthcare Management System |
| **Theme** | MedTech / BioTech / HealthTech |
| **Category** | Software |
| **Team Name** | Quantum Coders |

---

## 💡 Idea / Proposed Solution

Indian government hospitals face three chronic problems: unmanaged physical OPD queues causing hours-long waits, no structured tooling for doctors to manage patient flow, and zero real-time visibility for the government into hospital performance, doctor conduct, or queue-jumping ("ghost tokens").

**SmartCare** solves this with an intelligent, multi-lingual, AI-driven OPD queue, triage, and hospital congestion load-balancing ecosystem built for the **Ministry of Health & Family Welfare (MoHFW), Government of India**.

It unifies **Citizens/Patients**, **Hospital Clinical Staff & Doctors**, **Turnstile Security Gate Attendants**, and **Government Vigilance Observers** into a single synchronized platform to eliminate OPD congestion, prevent queue jumping, guarantee emergency fast-tracking, and incentivize compassionate patient care through citizen-governed performance bonuses.

---

## 🛠️ Technical Approach

**Tech Stack:**
- **Frontend (3 Portals):** React 18 + TypeScript + Tailwind CSS
- **Backend Gateway:** FastAPI (Python) with WebSocket real-time broadcasting
- **Database:** Supabase (PostgreSQL) with Row Level Security and a 6-Key multi-account connection pool
- **Mobile Client:** Android (Kotlin + Jetpack Compose + CameraX + Google ML Kit Barcode Scanning)
- **Security:** SHA-256 cryptographic token hashing, dynamic QR validation

**Methodology:**
1. Citizen reports symptoms → AI triage engine classifies acuity and department → dynamic QR token issued.
2. Token scanned at hospital turnstile (Android app) → backend validates hash → WebSocket broadcasts status to Doctor Console and Government Console simultaneously.
3. Doctor completes consultation → patient rates the doctor → Government Console aggregates ratings into a Doctor Performance Index (DPI) that drives an automatic salary bonus/penalty.

---

## 🏛️ Complete Ecosystem Architecture (V3.0.0)

```
                               ┌─────────────────────────────────────────────────────────────┐
                               │   Government of India / MoHFW / National Health Portal      │
                               └──────────────────────────────┬──────────────────────────────┘
                                                              │
        ┌─────────────────────────────────────────────────────┼─────────────────────────────────────────────────────┐
        │                                                     │                                                     │
        ▼                                                     ▼                                                     ▼
┌────────────────────────────────┐           ┌────────────────────────────────┐           ┌────────────────────────────────┐
│ 1. Citizen / Patient Portal    │           │ 2. Clinical & Doctor Console   │           │ 3. National OPD Vigilance      │
│ Port :5173 (React/TS/Tailwind) │           │ Port :5174 (React/TS/Tailwind) │           │ & Oversight Console (:5175)    │
├────────────────────────────────┤           ├────────────────────────────────┤           ├────────────────────────────────┤
│ • Official MoHFW Entryway      │           │ • Doctor Duty Login            │           │ • Sentinel Command Dashboard   │
│ • Problem-Based AI Triage      │ ──Tokens──► • Live Patient Calling Desk    │ ◄─Surveys─┤ • Doctor Behavioral DPI Index  │
│ • 11 Indian Languages Switch   │           │ • E-Prescription (Rx) Writer   │           │ • Monthly Salary Bonus (+15%)  │
│ • Dynamic SHA-256 QR Passes    │ ◄─Rx/Lab──┤ • Diagnostic Lab Order System  │ ──Disburse► • Grievance Redressal Tribunal │
│ • 24x7 108 Ambulance SOS       │           │ • Inter-Hospital Referrals     │           │ • OPD Counter Walk-in Desk     │
│ • Digital Health Vault         │           │ • Longitudinal Patient EMR     │           │ • 108 Ambulance Fleet Map      │
│ • Citizen Doctor Rating Survey │           │ • Live WebSocket Pacing Matrix │           │ • NCR Heatmap & Load Shedding  │
└────────────────────────────────┘           └────────────────────────────────┘           └────────────────────────────────┘
        │                                                     ▲                                                     ▲
        │                                                     │                                                     │
        │                                    ┌────────────────┴───────────────┐                                     │
        │                                    │ 4. Android QR Turnstile        │                                     │
        │                                    │ Scanner Client (Gate Security) │                                     │
        │                                    └────────────────┬───────────────┘                                     │
        │                                                     │ POST /api/v1/tokens/scan                            │
        └─────────────────────────────────────────────────────┴─────────────────────────────────────────────────────┘
                                                              │
                                                              ▼
                                             ┌────────────────────────────────┐
                                             │ FastAPI Gateway Core (Port 8000)│
                                             │ • Real-time WebSocket Broker   │
                                             │ • Dynamic QR Validator & SHA256│
                                             │ • AI Triage Engine & Acuity    │
                                             │ • Supabase 6-Key Pool Manager  │
                                             └────────────────┬───────────────┘
                                                              │
                                                              ▼
                                             ┌────────────────────────────────┐
                                             │ Supabase Multi-Key DB Pool     │
                                             │ (Patient, Doctor, Observer,    │
                                             │  Scanner Isolated Key Chains)  │
                                             └────────────────────────────────┘
```

---

## 🔑 Supabase Multi-Key High-Concurrency Resilience Pool

To eliminate single API rate limits during massive OPD surges across India, the SmartCare backend orchestrates a 6-Key Supabase Connection Pool:

```
                          ┌───────────────────────────────────────────────┐
                          │            FastAPI Backend Engine             │
                          │        SupabaseKeyPoolManager                 │
                          └──────────────────────┬────────────────────────┘
                                                 │
      ┌──────────────────────┬───────────────────┴───────────────┬──────────────────────┐
      ▼                      ▼                                   ▼                      ▼
┌────────────────┐    ┌────────────────┐                    ┌────────────────┐     ┌────────────────┐
│ PATIENT Pool   │    │ DOCTOR Pool    │                    │ OBSERVER Pool  │     │ SCANNER Pool   │
│ (2 Keys RR)    │    │ (2 Keys RR)    │                    │ (1 Key)        │     │ (1 Key)        │
├────────────────┤    ├────────────────┤                    ├────────────────┤     ├────────────────┤
│ • Arpan        │    │ • Kartik       │                    │ • Ajay Kumar   │     │ • Shristi      │
│ • Rishikesh    │    │ • Alok         │                    │                │     │                │
└────────────────┘    └────────────────┘                    └────────────────┘     └────────────────┘
```

1. **Patient Service Pool (Round-Robin)**: Rotates token issuance and citizen appointment bookings.
2. **Doctor Console Pool (Round-Robin)**: Manages clinical diagnosis records, chamber status updates, and e-prescriptions.
3. **Observer Vigilance Pool (Dedicated)**: Dedicated key for continuous high-throughput national oversight queries.
4. **Android Scanner Pool (Dedicated)**: Dedicated key for gate turnstile check-ins to prevent rate-limit interference with bookings.
5. **Dual-Mode Offline Fallback**: If Supabase environment credentials are not present, the system runs smoothly via local in-memory fallback without throwing runtime crashes.

---

## 📱 Android QR Turnstile Scanner Client & API Integration

The native Android client (`smartcare-scanner/`) enables turnstile security staff to verify citizen passes instantly:

- **Endpoint**: `POST /api/v1/tokens/scan`
- **Architecture**: Kotlin + Jetpack Compose + CameraX + Google ML Kit Barcode Scanning
- **Gateway Policy**: The Android mobile app **only** contacts the FastAPI backend. It **never** contacts Supabase directly.
- **Request Format**:
  ```json
  {
    "token_number": "CARD-204",
    "hash": "7d9a1f28b493c04f9815e98218175b5b4819266184519965384666f7d0ef802e",
    "scanner_id": "gate-cardio-01",
    "scanned_by": "guard-01"
  }
  ```
- **Validation Pipeline**:
  1. Resolves token by `token_id` or `token_number`.
  2. Cryptographically verifies SHA-256 hash.
  3. Rejects duplicate scans (`ALREADY_SCANNED` 400).
  4. Enforces expiration (`TOKEN_EXPIRED` 400).
  5. Updates status to `SCANNED` in Supabase via Android Scanner Pool.
  6. Broadcasts `token_scanned` WebSocket event to `ws://localhost:8000/api/v1/ws/queue/{hosp}/{dept}`.
- **Doctor Console UI Reaction**:
  - Displays an animated turnstile scanner banner alert.
  - Updates queue position with a glowing `AT DOOR` badge.

---

## ⚡ Quick Start: Running the Entire Ecosystem

### 🚀 Option 1: One-Click Launch (Windows)
Double-click `start-all.bat` or run from PowerShell/CMD:
```bat
start-all.bat
```
This automatically:
- Kills any conflicting processes on ports 8000, 5173, 5174, 5175
- Configures Windows Firewall for port 8000
- Prints current Wi-Fi IP for phone app setup
- Launches FastAPI Backend (:8000), Patient Portal (:5173), Doctor Console (:5174), and Govt Vigilance Portal (:5175)

---

### 💻 Option 2: Manual Launch

#### 1. Start FastAPI Backend Gateway (Port 8000)
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --host 0.0.0.0 --port 8000
```
- API Docs: `http://localhost:8000/docs`

#### 2. Start Citizen / Patient Portal (Port 5173)
```bash
cd patient-portal
npm install
npm run dev -- --port 5173 --host
```
- Access at: `http://localhost:5173`

#### 3. Start Clinical & Doctor Console (Port 5174)
```bash
cd admin-portal
npm install
npm run dev -- --port 5174 --host
```
- Access at: `http://localhost:5174`

#### 4. Start National Oversight & Bonus Console (Port 5175)
```bash
cd govt-portal
npm install
npm run dev -- --port 5175 --host
```
- Access at: `http://localhost:5175`

---

## 🌐 Local Live Running Services & Port Map

| Portal / Service | Port | Local URL | Target Users & Responsibilities |
| :--- | :--- | :--- | :--- |
| **Citizen / Patient Portal** | `5173` | [http://localhost:5173](http://localhost:5173) | Patients: OPD booking, 11 languages, dynamic QR tokens, 108 SOS, surveys |
| **Clinical & Doctor Console** | `5174` | [http://localhost:5174](http://localhost:5174) | Doctors: Calling desk, live turnstile attendance sync, E-Prescriptions, EMR |
| **National Vigilance Console** | `5175` | [http://localhost:5175](http://localhost:5175) | MoHFW: Sentinel monitor, Doctor DPI, salary bonus engine, grievance tribunal |
| **FastAPI Backend Gateway** | `8000` | [http://localhost:8000/docs](http://localhost:8000/docs) | REST API, WebSocket Broadcaster, Supabase Key Pool, AI ML Services |
| **Android QR Scanner Client** | `Mobile`| `http://<HOST_IP>:8000/api/v1/tokens/scan` | Turnstile Guards: Dynamic QR check-in & automated door synchronization |

---

## ⏱️ 60-Second Hackathon Demo Script (Full End-to-End Loop)

Follow this exact click-path during judge evaluations to demonstrate the entire cross-portal loop in under 60 seconds:

```
[1. Patient Portal :5173] ──► [2. Turnstile Scan :8000] ──► [3. Doctor Console :5174] ──► [4. Govt Sentinel :5175]
Citizen Generates Token       Entrance QR Ingress          Consults & Completes           Audits DPI & Bonus
```

1. **Step 1 — Citizen Triage & Token Generation (Port :5173)**
   - Open `http://localhost:5173/triage`.
   - Select symptoms (e.g., *Chest Pain* + *Shortness of Breath*) or click **"Evaluate Urgency"**.
   - The AI Department Triage automatically classifies acuity as **Priority 2 (Cardiology)** and routes the citizen to **AIIMS New Delhi - Chamber 204**.
   - Click **"Generate Official OPD Token Pass"** → Citizen receives live scannable QR ticket `CARD-201` at `http://localhost:5173/my-token`.

2. **Step 2 — Anti-Ghost Turnstile Ingress (Port :8000 / Android App)**
   - Turnstile guard scans the QR code via Android App (or curl `POST /api/v1/tokens/scan`).
   - Patient status instantly updates across all WebSockets: `waiting` → `scanned_by_staff` (verified at turnstile door).

3. **Step 3 — Doctor Live Consultation & Complete (Port :5174)**
   - Open `http://localhost:5174/doctor-panel` (Dr. Rajesh Sharma, AIIMS Cardiology Chamber 204).
   - The doctor sees `CARD-201 (Suresh Patel)` at the top with green **"AT DOOR"** badge.
   - Doctor enters clinical notes: *"Stable Angina CCS-II, Tab Sorbitrate prescribed"*, clicks **"Complete Consultation"**.
   - The patient is **instantly removed from the active queue** and saved to the verified consultation history archive.
   - The citizen on `:5173` sees the **"✅ Consultation Completed"** celebration modal!

4. **Step 4 — Citizen Survey & Government Vigilance Oversight (Port :5175)**
   - On `:5173`, patient clicks **"Submit Doctor Rating"** (5 Stars ★★★★★) rating courtesy, communication, examination, and punctuality.
   - Switch to `http://localhost:5175/` (Govt Vigilance Sentinel Dashboard) to show the live queue clear from AIIMS Cardiology.
   - Navigate to `http://localhost:5175/doctor-performance` to show Dr. Rajesh Sharma's DPI score update in real time with the new 5-star review.
   - Navigate to `http://localhost:5175/salary-bonus` to show the automatic bonus calculator reflect the updated rating — closing the full citizen-to-payroll accountability loop live in front of judges.

---

## ✅ Feasibility & Challenges

**Feasibility:**
- Built entirely on production-grade, freely available technology (React, FastAPI, Supabase, Android/Kotlin) — no proprietary dependencies.
- Designed to integrate with existing government infrastructure (Ayushman Bharat PM-JAY, UPI, Aadhaar/UIDAI) rather than replace it.
- Modular portal architecture allows phased hospital-by-hospital rollout.

**Potential Challenges & Mitigation:**
| Challenge | Mitigation |
| :--- | :--- |
| Network/connectivity issues in rural hospitals | Dual-mode offline fallback (local in-memory mode) when Supabase/network is unavailable |
| Rate limits under high OPD surge load | 6-Key Supabase multi-account connection pool with round-robin distribution |
| Fake/manipulated doctor ratings | Ratings tied to verified, scanned consultation tokens only — no rating without a completed visit |
| Digital literacy barriers | 11 Indian language support + simple symptom-card based triage (no typing required) |

---

## 🌍 Impact & Benefits

- **For Citizens**: Transparent, fair queueing; drastically reduced wait times; access in native language; instant emergency ambulance dispatch.
- **For Doctors**: Streamlined consultation workflow; fair, data-backed performance recognition instead of subjective evaluation.
- **For Government**: Real-time national visibility into hospital operations; objective, corruption-resistant doctor accountability; data-driven resource allocation via heatmaps and analytics.
- **Social Impact**: Strengthens public trust in government healthcare infrastructure and supports Digital India / Ayushman Bharat Digital Mission goals.

---

## 🧪 Verification & Hardening Test Suite (v3.0.0)

SmartCare is engineered with comprehensive automated verification:
- **Pytest Suite (`tests/module/`)**: 19 / 19 tests passing (100%)
  - `test_bonus_calculator.py`: Zero-review unrated handling, low-sample provisional guardrails, strict grade thresholds.
  - `test_priority_hardening.py`: Emergency acuity override safeguard, deterministic arrival tie-breaking.
  - `test_queue_engine.py`: Dynamic priority math, vulnerability boosts.
  - `test_token_scanner.py`: SHA-256 hash generation, tampered QR rejection, duplicate scan blocking.
- **End-to-End Ingress Verification (`backend/test_e2e_qr_turnstile_loop.py`)**: All 7 integration steps passing.
- **Frontend Production Builds**: `patient-portal` (:5173), `admin-portal` (:5174), `govt-portal` (:5175) all build with 0 TypeScript/compilation errors.

---

## 📚 References

- Ministry of Health & Family Welfare (MoHFW), Government of India — https://mohfw.gov.in
- Ayushman Bharat Digital Mission (ABDM) — https://abdm.gov.in
- Ayushman Bharat PM-JAY — https://pmjay.gov.in

---

## 👥 Team — Quantum Coders

| Name | Role |
| :--- | :--- |
| Arpan | Team Captain / Full-Stack Lead |
| Shristi | Front-End Developer |
| Rishikesh | Back-End / Database Engineer |
| Alok | Data / AI Engineer |
| Kartik | DevOps / QA |
| Ajay | Domain Specialist |

---

## 📜 License
SmartCare is open source software developed for the **Smart India Hackathon (SIH) 2026** under the [MIT License](LICENSE).
