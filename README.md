# SmartCare: Next-Gen AI Smart OPD & Emergency Queue Management System
### Smart India Hackathon (SIH) 2026

![SmartCare Banner](https://img.shields.io/badge/SIH-2026-blue?style=for-the-badge) ![Status](https://img.shields.io/badge/Status-Active_Development-brightgreen?style=for-the-badge) ![License](https://img.shields.io/badge/License-MIT-purple?style=for-the-badge)

SmartCare is an intelligent, multi-lingual, AI-driven OPD queue, triage, and hospital congestion load-balancing platform designed to eliminate overcrowded waiting rooms, optimize doctor utilization, and streamline patient referrals across government and private healthcare facilities.

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
├── README.md                          # Project root documentation & team guide
├── docs/
│   ├── architecture.md                # System architecture & data flow (Arpan)
│   ├── api-contracts.md               # REST & WebSocket API specification (Arpan)
│   ├── data-models.md                 # PostgreSQL & Pydantic schemas (Rishikesh)
│   ├── business-rules.md              # Triage rules & priority queue algorithms (Ajay)
│   ├── demo-script.md                 # 5-Minute SIH Jury presentation & demo flow (Kartik)
│   └── pitch-deck/                    # Presentation outline & slide assets (Kartik)
│       └── README.md
│
├── patient-portal/                    # Patient Web App & PWA (Shristi / Ajay)
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.tsx               # Landing & Quick Token Tracker
│   │   │   ├── Register.tsx           # ABHA / Phone Authentication
│   │   │   ├── HospitalSelect.tsx     # Hospital & OPD Department Discovery
│   │   │   ├── Triage.tsx             # Interactive Symptom AI Assessment
│   │   │   ├── BookAppointment.tsx    # Slot & Dynamic Token Generator
│   │   │   ├── MyToken.tsx            # Digital OPD Pass & Live Status
│   │   │   ├── LiveQueue.tsx          # Realtime Turn-by-Turn Queue Tracker
│   │   │   ├── Referral.tsx           # Inter-Hospital Transfer & Digital Pass
│   │   │   └── Profile.tsx            # Medical History & Family Profiles
│   │   ├── components/                # Reusable UI components & Token Cards
│   │   ├── hooks/                     # Custom React hooks (useQueue, useAuth)
│   │   ├── i18n/                      # Multi-language dictionary (EN, HI, PB)
│   │   └── pwa/                       # Service workers & Offline caching
│   └── package.json
│
├── admin-portal/                      # Hospital Staff, Doctor & Admin Dashboard (Shristi / Alok)
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx          # Realtime OPD overview & vital KPI cards
│   │   │   ├── HospitalList.tsx       # Regional hospital network explorer
│   │   │   ├── HospitalDetail.tsx     # Facility capacity & department health
│   │   │   ├── LiveQueues.tsx         # Realtime queue manager per doctor/OPD
│   │   │   ├── Analytics.tsx          # Flow rates, average wait time analysis
│   │   │   ├── Alerts.tsx             # Congestion spikes & emergency surge alerts
│   │   │   ├── Heatmap.tsx            # City-wide hospital load balancing map
│   │   │   └── DoctorPanel.tsx        # Doctor patient calling & consultation console
│   │   ├── components/                # Shared dashboard layouts & header
│   │   └── charts/                    # Recharts visualization widgets (Alok)
│   └── package.json
│
├── backend/                           # Core FastAPI, Realtime & ML Backend (Rishikesh / Team)
│   ├── main.py                        # Application entrypoint & ASGI router
│   ├── config.py                      # Environment configuration & settings
│   ├── requirements.txt               # Python dependencies
│   ├── services/
│   │   ├── patient_service/           # ABHA ID integration & profile management
│   │   ├── appointment_service/       # Booking, cancellation, re-scheduling
│   │   ├── queue_engine/              # Dynamic priority algorithm & token dispatcher
│   │   ├── triage_service/            # Automated acuity evaluation
│   │   ├── referral_service/          # Cross-hospital transfers & bed availability
│   │   ├── notification_service/      # SMS, WhatsApp & Web Push alerts
│   │   └── auth_service/              # JWT & RBAC (Patient, Doctor, Staff, Admin)
│   ├── realtime/
│   │   ├── websocket_gateway/         # High-throughput pub/sub for queue tickers
│   │   └── doctor_console/            # Low-latency doctor action sync
│   ├── ml/
│   │   ├── wait_time_prediction/      # Gradient boosting wait-time estimator
│   │   ├── congestion_prediction/     # Time-series hospital OPD surge forecast
│   │   ├── triage_ai/                 # NLP symptom classifier & severity scoring
│   │   └── datasets/                  # Synthetic dataset generators
│   └── db/
│       ├── schema.sql                 # PostgreSQL 16 relational DDL schema
│       └── seed_demo_data.py          # Demo seeder (3 hospitals, 15 doctors, 250 patients)
│
├── infra/                             # Infrastructure, Containerization & CI/CD (Kartik)
│   ├── docker-compose.yml             # Full-stack local orchestration
│   ├── deploy/                        # AWS ECS, Vercel & Cloud deployment specs
│   └── env.example                    # Template environment variables
│
└── tests/                             # Automated Test Suites (Kartik)
    ├── e2e/                           # End-to-end patient & doctor journey simulations
    └── module/                        # Unit tests for queue engine, triage & auth
```

---

## ⚡ Quick Start

### 1. Prerequisites
- Node.js >= 18.x
- Python >= 3.10
- PostgreSQL >= 15 / Docker

### 2. Run with Docker Compose
```bash
cd infra
cp env.example .env
docker compose up --build
```

### 3. Run Backend Locally
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Or `venv\Scripts\activate` on Windows
pip install -r requirements.txt
python db/seed_demo_data.py
uvicorn main:app --reload --port 8000
```

### 4. Run Patient Portal
```bash
cd patient-portal
npm install
npm run dev
```

### 5. Run Admin Portal
```bash
cd admin-portal
npm install
npm run dev
```
