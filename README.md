# SmartCare: Next-Gen AI Smart OPD, Emergency Queue & Government Vigilance Platform
### Smart India Hackathon (SIH) 2026 • Official Release v2.0.0

![SmartCare Banner](https://img.shields.io/badge/SIH-2026-blue?style=for-the-badge) ![Release](https://img.shields.io/badge/Release-v2.0.0-success?style=for-the-badge) ![Status](https://img.shields.io/badge/Status-Production_Ready-brightgreen?style=for-the-badge) ![License](https://img.shields.io/badge/License-MIT-purple?style=for-the-badge)

SmartCare is an intelligent, multi-lingual, AI-driven OPD queue, triage, and hospital congestion load-balancing ecosystem. It brings together **Citizens/Patients**, **Hospital Clinical Staff & Doctors**, and **Government Vigilance Observers** to ensure transparent healthcare delivery, eliminate waiting room congestion, and incentivize compassionate patient care through performance-linked salary bonuses.

---

## 🏛️ Ecosystem Architecture & 3 Specialized Portals (V2.0.0 Architecture)

```
                               ┌─────────────────────────────────────────┐
                               │  Government of India / MoHFW / ABDM     │
                               └────────────────────┬────────────────────┘
                                                    │
            ┌───────────────────────────────────────┼───────────────────────────────────────┐
            │                                       │                                       │
            ▼                                       ▼                                       ▼
┌─────────────────────────┐             ┌─────────────────────────┐             ┌─────────────────────────┐
│ 1. Citizen / Patient    │             │ 2. Clinical & Doctor    │             │ 3. National Vigilance   │
│ Portal (:5173)          │             │ Console (:5174)         │             │ & Oversight (:5175)     │
├─────────────────────────┤             ├─────────────────────────┤             ├─────────────────────────┤
│ • Official Govt Landing │             │ • Doctor Duty Login     │             │ • Sentinel Dashboard    │
│ • Direct AI Dept Match  │ ──Token───► │ • Patient Calling Desk  │ ◄──Surveys─ │ • Doctor Behavioral DPI │
│ • 11 Indian Languages   │             │ • E-Prescription (Rx)   │             │ • Salary Bonus (+15%)   │
│ • Scannable QR Passes   │ ◄──Rx/Lab── │ • Diagnostic Lab Orders │ ──Disburse─►│ • Grievance Tribunal    │
│ • 108 Ambulance SOS     │             │ • Referral Transfers    │             │ • Counter Helpdesk      │
│ • Post-Consult Surveys  │             │ • Longitudinal EMR      │             │ • 108 Ambulance Fleet   │
│ • Universal Vault       │             │ • Consultation Pacing   │             │ • Live Queues & Netwrok │
└─────────────────────────┘             └─────────────────────────┘             │ • Flow Analytics & Map  │
            ▲                                       ▲                           └─────────────────────────┘
            └───────────────────────────────────────┼───────────────────────────────────────┘
                                                    │
                               ┌────────────────────┴────────────────────┐
                               │     FastAPI Backend & Realtime Gateway  │
                               │     Port 8000 (Swagger: /docs)          │
                               └─────────────────────────────────────────┘
```

---

## 🚀 Module Distribution across Portals (v2.0.0 Release)

### 1. 🇮🇳 Citizen / Patient Portal (`http://localhost:5173`)
- **Official Government of India Entry Page**:
  - Authentic MoHFW / National Health Authority (NHA) & Ayushman Bharat branding with National Emblem, Tri-color ribbon, and 24x7 Helplines (**1075**, **108**, **1098**, **14555**).
  - Top-Right corner and bottom Register (`/register`) & Login (`/login`) buttons.
  - Live national OPD statistics counters (Tokens Issued Today, Average Wait Reduced, Participating Hospitals).
  - Step-by-step citizen walkthrough, services grid, and Doctor Behavioral Rating Guarantee.
- **Problem-Based Direct Department Recommender**:
  - One-touch symptom cards (*Chest Pain*, *Child High Fever*, *Fracture / Bone Injury*, *Skin Rash*, *Severe Eye Redness*, *Pregnancy Care*) with automatic clinical department and doctor selection.
- **11 Indian Languages with Live Switcher**:
  - English, हिन्दी (Hindi), ਪੰਜਾਬੀ (Punjabi), বাংলা (Bengali), தமிழ் (Tamil), తెలుగు (Telugu), मराठी (Marathi), ગુજરાતી (Gujarati), ಕನ್ನಡ (Kannada), മലയാളം (Malayalam), ଓଡ଼ିଆ (Odia).
- **Real Scannable QR Passes & Token History**:
  - Canvas-rendered scannable QR tokens with verification hashes and full recent token archive.
- **Multi-Modal Payment Gateways**:
  - Ayushman Bharat PM-JAY Cashless (₹0), UPI Dynamic QR, Net Banking, Cards, and Cash Counter receipts.
- **24x7 108 Emergency Ambulance Telematics**:
  - One-tap SOS request with live GPS map mockup, vehicle telematics (Oxygen/Ventilator/ALS), and ETA countdown.
- **Universal Health Records Vault (`/health-records`)**:
  - Digital Prescriptions (Rx), Diagnostic Lab Reports, and Billing Invoices.
- **Citizen Post-Consultation Doctor Feedback Survey**:
  - Rate doctor talking courtesy, explanation clarity, examination thoroughness, and punctuality directly to the Government Observer.

---

### 2. 🩺 SmartCare Clinical & Doctor Console (`http://localhost:5174`)
- **Doctor Consultation Suite (`/` and `/doctor-panel`)**:
  - Real-time patient calling with audio queue chimes.
  - Digital prescription writer with dosage schedules and one-click PDF export.
  - Diagnostic lab order requisition (CBC, Lipid Profile, Chest X-Ray, ECG, MRI).
  - Inter-hospital emergency referrals with bed availability load balancing.
  - Full longitudinal patient medical history inspector.
- **Live Turn Calling Matrix (`/live-queues`)**:
  - Pacing monitor and queue sequence tracker.
- **Doctor Duty Sign-in & Authentication (`/login`)**:
  - Fast credential login and direct link to the National Oversight Console (`:5175`).

---

### 3. 🛡️ National OPD Vigilance & Doctor Salary Bonus Oversight Console (`http://localhost:5175`)
- **Centralized Government Oversight & Operations Headquarters**:
  1. **Hospital Sentinel Dashboard (`/`)**:
     - Real-time queue integrity surveillance, wait-time anomaly alerts (>40 mins), and ghost token bypassing flags across AIIMS New Delhi, Safdarjung, and RML.
     - Live KPI cards, OPD inflow telemetry, acuity triage spectrum, and regional cluster load balancing.
  2. **Doctor Behavioral & Performance Index - DPI (`/doctor-performance`)**:
     - Real-time aggregation of citizen surveys across 4 pillars (Courtesy, Communication, Examination, Punctuality).
     - Live citizen review stream with doctor filtering.
  3. **Doctor Performance Salary Bonus Calculator (`/salary-bonus`)**:
     - Automatically calculates monthly salary bonuses and deductions based on citizen survey feedback:
       - **Grade A+ (Rating ≥ 4.75★)**: **+15% Performance Salary Bonus** (Distinguished Excellence)
       - **Grade A (Rating 4.2 - 4.7★)**: **+8% Performance Incentive** (Meritorious)
       - **Grade B (Rating 3.5 - 4.1★)**: **0% Base Salary** (Standard Compliance)
       - **Grade C (Rating < 3.2★ / Grievance)**: **-10% Disciplinary Deduction & Audit Show-Cause Notice**
     - Interactive Simulator: Test citizen reviews and watch payroll update live!
  4. **Citizen Grievance Redressal Desk (`/grievances`)**:
     - Case management for citizen complaints with actions: *Issue Show-Cause Notice*, *Initiate Inquiry*, *Apply Penalty*, *Mark Resolved*.
  5. **Hospital Quality Ranking & Compliance Leaderboard (`/compliance`)**:
     - Benchmarking compliance scores, average wait times, and bonus pool eligibility.
  6. **Counter Helpdesk (`/counter-desk`)**:
     - Walk-in patient triage, UIDAI Aadhaar lookup, and thermal token generation.
  7. **108 Emergency Ambulance Fleet Command (`/ambulance-fleet`)**:
     - Fleet GPS telematics, live vehicle status, and ER trauma bed coordination.
  8. **Live Queues Monitor (`/live-queues`)**:
     - Turn-by-turn OPD matrix for all active hospital chambers.
  9. **Regional Hospital Network (`/hospitals` & `/hospital/:id`)**:
     - Bed capacity, department telemetry, and facility discovery.
  10. **OPD Flow Rate Analytics (`/analytics`)**:
      - Wait time regression models, patient throughput velocity, and AI prediction accuracy.
  11. **Operational Alerts & Incidents (`/alerts`)**:
      - Surge alerts, queue bottlenecks, and emergency triage escalations.
  12. **Geospatial Load Heatmap (`/heatmap`)**:
      - NCR hospital cluster load map and load shedding routes.

---

## ⚡ Quick Start: Running All 4 Services

### 🚀 One-Click Launch (Windows)
Double-click `start-all.bat` or run:
```bash
.\start-all.bat
```

---

### 💻 Manual Step-by-Step Launch

#### 1. Start FastAPI Backend (Port 8000)
```bash
cd backend
python -m venv venv
.\venv\Scripts\activate       # Linux/macOS: source venv/bin/activate
pip install -r requirements.txt
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
- API Docs: `http://localhost:8000/docs`

#### 2. Start Citizen / Patient Portal (Port 5173)
```bash
cd patient-portal
npm install
npm run dev -- --port 5173 --host 0.0.0.0
```
- Access at: `http://localhost:5173`

#### 3. Start Clinical & Doctor Console (Port 5174)
```bash
cd admin-portal
npm install
npm run dev -- --port 5174 --host 0.0.0.0
```
- Access at: `http://localhost:5174`

#### 4. Start National Oversight & Bonus Console (Port 5175)
```bash
cd govt-portal
npm install
npm run dev -- --port 5175 --host 0.0.0.0
```
- Access at: `http://localhost:5175`

---

## 🌐 Local Live Running Services

| Portal / Service | Port | Local URL | Role |
| :--- | :--- | :--- | :--- |
| **Citizen / Patient Portal** | `5173` | [http://localhost:5173](http://localhost:5173) | Patients, OPD Booking, AI Triage, 108 SOS, Surveys |
| **Clinical & Doctor Console** | `5174` | [http://localhost:5174](http://localhost:5174) | Doctors, Calling Desk, E-Prescriptions, EMR |
| **National Oversight & Bonus Console** | `5175` | [http://localhost:5175](http://localhost:5175) | MoHFW Ombudsman, Sentinel, Fleet, Counters, Bonus |
| **FastAPI Backend & Swagger API** | `8000` | [http://localhost:8000/docs](http://localhost:8000/docs) | REST API, WebSocket Gateway & AI ML Services |

---

## 📜 License
SmartCare is open source software developed for **Smart India Hackathon (SIH) 2026** under the [MIT License](LICENSE).
