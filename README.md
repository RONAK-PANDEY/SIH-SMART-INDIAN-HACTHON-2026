# SmartCare: Next-Gen AI Smart OPD & Emergency Queue Management System
### Smart India Hackathon (SIH) 2026 • Release v1.0.0

![SmartCare Banner](https://img.shields.io/badge/SIH-2026-blue?style=for-the-badge) ![Version](https://img.shields.io/badge/Release-v1.0.0-success?style=for-the-badge) ![Status](https://img.shields.io/badge/Status-Production_Ready-brightgreen?style=for-the-badge) ![License](https://img.shields.io/badge/License-MIT-purple?style=for-the-badge)

SmartCare is an intelligent, multi-lingual, AI-driven OPD queue, triage, and hospital congestion load-balancing platform designed to eliminate overcrowded waiting rooms, optimize doctor utilization, and streamline patient referrals across government and private healthcare facilities.

---

## 🚀 What's New in Release v1.0.0 (SIH 2026)

### 1. 🤖 Problem-Based Direct Department Recommender & AI Triage
- **Direct Department Recommendation**: In `Book Appointment`, patients can click one-touch problem cards (e.g. *Chest Pain*, *Child High Fever*, *Fracture / Bone Injury*, *Skin Rash*, *Severe Eye Redness*, *Pregnancy Care*) or type custom symptoms. The system automatically recommends and pre-selects the exact department (Cardiology, Pediatrics, Orthopedics, Dermatology, Ophthalmology, Obstetrics & Gynecology, General Medicine, Neurology, ENT, Psychiatry).
- **100+ Symptom AI Classifier**: Automated severity calculation with emergency red-flag triggers that instantly prompt for 108 ambulance dispatch.
- **Vulnerability Weighting**: Dedicated scoring for Senior Citizens (60+), Pregnant Women, and Persons with Disabilities (PwD).

### 2. 🌐 Comprehensive 11 Indian Languages with Live Switcher
- Full localized translations and instantaneous switching across:
  - **English**, **हिन्दी (Hindi)**, **ਪੰਜਾਬੀ (Punjabi)**, **বাংলা (Bengali)**, **தமிழ் (Tamil)**, **తెలుగు (Telugu)**, **मराठी (Marathi)**, **ગુજરાતી (Gujarati)**, **ಕನ್ನಡ (Kannada)**, **മലയാളം (Malayalam)**, **ଓଡ଼ିଆ (Odia)**.
- Global `LanguageSwitcherPill` with `localStorage` persistence and cross-portal consistency.

### 3. 🎫 High-Density Scannable Digital QR Passes & Token History
- **Real Scannable QR Codes**: Canvas-based scannable QR tokens containing token code, patient name, department, time slot, and verification hash.
- **Recent Tokens History**: Tabular & card history tracking past visits, active appointments, doctor details, and status (`Consultation Done`, `In Queue`, `Expired`).
- **Quick Nav QR Icon**: Direct access to active digital pass right from top navigation.

### 4. 💳 Multi-Modal Payment Gateway
- **Ayushman Bharat PM-JAY Cashless (₹0)**: Instant verification for scheme beneficiaries.
- **UPI Dynamic QR Code**: Google Pay, PhonePe, Paytm, BHIM instant scan-and-pay with auto-verification simulation.
- **Net Banking & Card Gateway**: HDFC, SBI, ICICI, Axis and all major Visa/MasterCard/RuPay networks.
- **Hospital Counter Cash Receipt**: Token generated with cash payment verification pending at counter.

### 5. 🚑 24x7 108 Emergency Ambulance Telematics
- **Patient SOS Dispatch**: One-tap emergency request with live GPS map mockup, vehicle telematics (Oxygen/Ventilator/ALS equipped), driver phone, real-time ETA countdown, and hospital handoff.
- **Admin Fleet Command**: Emergency ambulance fleet tracking panel with live vehicle status, driver dispatch, and hospital bay coordination.

### 6. 📁 Unified Digital Health Records Vault (`/health-records`)
- Dedicated portal section storing:
  - **Prescriptions (Rx)**: Doctor signatures, diagnosis, dosages, medication duration, and PDF export.
  - **Diagnostic Lab Reports**: Pathology, X-Ray, ECG, MRI with download capability.
  - **Billing & Tax Invoices**: Itemized OPD consultation fees, GST breakdown, payment mode, and printable receipts.

### 7. 🔐 Role-Based Authentication & Login Consoles
- **Patient Login (`/login`)**: Aadhaar / ABHA (Ayushman Bharat Health Account) OTP simulation, fast demo login, and secure session management.
- **Admin & Doctor Login (`/login`)**: Role-based access control (Doctor, OPD Reception Counter, Hospital Administrator, Fleet Dispatcher).

### 8. 🩺 Doctor Consultation Panel & Counter Reception Desk
- **Interactive Doctor Tools**: Call next patient, mark completed, issue e-prescriptions, place diagnostic lab orders, initiate inter-hospital emergency referrals, and view full patient medical history.
- **Counter Reception Desk**: High-throughput walk-in OPD token generation and fast receipt printing.

---

## 👥 Team Ownership & Matrix

| Module / Component | Primary Owner | Secondary / Collaborator | Core Responsibilities |
| :--- | :--- | :--- | :--- |
| **System Architecture & API Contracts** | **Arpan** | Rishikesh / Kartik | System design, REST & WebSocket specifications, backend integration |
| **Backend & Realtime Engine** | **Rishikesh** | Ajay / Arpan | FastAPI backend, PostgreSQL schema, Auth/RBAC, WebSocket gateway |
| **Business Rules & Queue Logic** | **Ajay** | Rishikesh / Shristi | Triage prioritization formulas, dynamic referral workflows, i18n/PWA |
| **Patient Portal & Admin UI** | **Shristi** | Ajay / Alok | Responsive Patient Web/PWA, Admin & Doctor Realtime Dashboards |
| **AI / ML & Predictive Analytics** | **Alok** | Shristi | Wait-time regression models, triage NLP classifier, congestion heatmap |
| **Infra, CI/CD, Demo & Testing** | **Kartik** | Team | Docker-compose, cloud deployment, E2E tests, pitch deck & jury demo |

---

## 🗂️ Project File Structure

```
smartcare/
├── README.md                          # Project documentation & release guide
├── docs/
│   ├── architecture.md                # System architecture & data flow (Arpan)
│   ├── api-contracts.md               # REST & WebSocket API specification (Arpan)
│   ├── data-models.md                 # PostgreSQL & Pydantic schemas (Rishikesh)
│   ├── business-rules.md              # Triage rules & priority queue algorithms (Ajay)
│   ├── demo-script.md                 # 5-Minute SIH Jury presentation & demo flow (Kartik)
│   └── pitch-deck/                    # Presentation outline & slide assets (Kartik)
│
├── patient-portal/                    # Patient Web App & PWA (Port 5173)
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.tsx               # Landing, Quick Queue Search & Services
│   │   │   ├── Login.tsx              # Aadhaar / ABHA OTP Demo Login
│   │   │   ├── Register.tsx           # Patient Registration & ABHA Link
│   │   │   ├── HospitalSelect.tsx     # Hospital & OPD Department Discovery
│   │   │   ├── Triage.tsx             # Interactive Symptom AI Assessment
│   │   │   ├── BookAppointment.tsx    # Problem Recommender + Multi-Gateway Payment
│   │   │   ├── MyToken.tsx            # Digital Scannable QR Pass & Recent Tokens
│   │   │   ├── LiveQueue.tsx          # Realtime Turn-by-Turn Queue Tracker
│   │   │   ├── HealthRecords.tsx      # Rx Prescriptions, Lab Reports & Billing Vault
│   │   │   ├── Ambulance.tsx          # 108 Emergency Ambulance Dispatch & ETA Tracker
│   │   │   ├── Referral.tsx           # Inter-Hospital Transfer & Digital Pass
│   │   │   └── Profile.tsx            # Personal, Medical, Family History, Tokens & Bills
│   │   ├── components/                # Navbar, Footer, Token Cards, LanguageSwitcherPill
│   │   ├── i18n/                      # 11 Indian Languages Localization Engine
│   │   └── pwa/                       # Service workers & Offline caching
│   └── package.json
│
├── admin-portal/                      # Hospital Staff, Doctor & Admin Dashboard (Port 5174)
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.tsx              # Staff & Doctor Role-Based Login
│   │   │   ├── Dashboard.tsx          # Realtime OPD overview & vital KPI cards
│   │   │   ├── CounterDesk.tsx        # Walk-in counter triage & token printing
│   │   │   ├── DoctorPanel.tsx        # Doctor patient calling, Rx, lab orders & EMR
│   │   │   ├── AmbulanceFleet.tsx     # 108 Fleet management & emergency dispatch
│   │   │   ├── LiveQueues.tsx         # Realtime queue manager per doctor/OPD
│   │   │   ├── Analytics.tsx          # Flow rates, average wait time analysis
│   │   │   ├── Alerts.tsx             # Congestion spikes & emergency surge alerts
│   │   │   └── Heatmap.tsx            # City-wide hospital load balancing map
│   │   ├── components/                # Shared dashboard layouts, Sidebar & Header
│   │   └── charts/                    # Recharts visualization widgets
│   └── package.json
│
├── backend/                           # Core FastAPI, Realtime & ML Backend (Port 8000)
│   ├── main.py                        # Application entrypoint & ASGI router
│   ├── config.py                      # Environment configuration & settings
│   ├── requirements.txt               # Python dependencies
│   ├── services/
│   │   ├── patient_service/           # ABHA ID integration & profile management
│   │   ├── appointment_service/       # Booking, cancellation, re-scheduling
│   │   ├── queue_engine/              # Dynamic priority algorithm & token dispatcher
│   │   ├── triage_service/            # Automated acuity & symptom taxonomy service
│   │   ├── referral_service/          # Cross-hospital transfers & bed availability
│   │   ├── notification_service/      # SMS, WhatsApp & Web Push alerts
│   │   └── auth_service/              # Aadhaar/ABHA e-KYC & JWT RBAC
│   ├── realtime/
│   │   ├── websocket_gateway/         # High-throughput pub/sub for queue tickers
│   │   └── doctor_console/            # Low-latency doctor action sync
│   ├── ml/
│   │   ├── wait_time_prediction/      # Gradient boosting wait-time estimator
│   │   ├── congestion_prediction/     # Time-series hospital OPD surge forecast
│   │   └── triage_ai/                 # NLP symptom classifier & severity scoring
│   └── db/
│       ├── schema.sql                 # PostgreSQL 16 relational DDL schema
│       └── seed_demo_data.py          # Demo seeder
│
└── infra/                             # Infrastructure, Containerization & CI/CD
    ├── docker-compose.yml             # Full-stack local orchestration
    └── deploy/                        # Deployment specs
```

---

## ⚡ Quick Start Guide

### 1. Prerequisites
- **Node.js**: `>= 18.x`
- **Python**: `>= 3.10`
- **Git**

### 2. Running Backend (FastAPI - Port 8000)
```bash
cd backend
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
python db/seed_demo_data.py
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
- **API Documentation (Swagger UI)**: `http://localhost:8000/docs`
- **Health Check**: `http://localhost:8000/health`

### 3. Running Patient Portal (Port 5173)
```bash
cd patient-portal
npm install
npm run dev -- --port 5173 --host 0.0.0.0
```
- Access at: `http://localhost:5173`

### 4. Running Admin & Doctor Console (Port 5174)
```bash
cd admin-portal
npm install
npm run dev -- --port 5174 --host 0.0.0.0
```
- Access at: `http://localhost:5174`

---

## 🌟 Key User Journeys

1. **AI Smart OPD Booking**:
   Navigate to `Book Appointment` -> Click on a symptom category (e.g. *Chest Pain*) -> System automatically selects *Cardiology* and suggests Dr. Rajesh Sharma -> Choose slot -> Select payment method (PM-JAY ₹0, UPI QR, Cards) -> Generate token pass with scannable QR.
2. **Emergency 108 Ambulance Dispatch**:
   Tap `108 Ambulance` in top navigation -> Select emergency type and pickup address -> Instant live dispatch confirmation with driver name, oxygen-equipped ambulance details, and live ETA countdown.
3. **Health Records & Prescriptions**:
   Tap `Rx & Bills` in navbar -> View all digital prescriptions, diagnostic lab reports, and billing receipts with one-click download/print.
4. **Doctor Consultation Console**:
   Open Admin Portal at `http://localhost:5174` -> Login as Doctor -> Call next patient in queue -> Review medical history -> Issue digital prescriptions and lab tests -> Complete consultation.

---

## 📜 License
SmartCare is open source software licensed under the [MIT License](LICENSE). Developed for **Smart India Hackathon (SIH) 2026**.
