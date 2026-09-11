# SmartCare — Smart OPD Queue, Triage & Vigilance Platform

Built for Smart India Hackathon 2026, Problem Statement **SIH26133** (Ministry of Health & Family Welfare): an AI-assisted system for OPD queue management, triage, and doctor-performance vigilance in public hospitals.

## What it does

Patients book an appointment and receive an AI-assisted triage score plus a SHA-256-signed QR pass. A physical turnstile scan, using the Android app, confirms the patient is present before they are added to a doctor's live queue. This is intended to prevent ghost tokens and proxy queue-jumping.

Doctors work from a real-time calling console. A separate government dashboard tracks aggregate queue health and a doctor performance index derived from patient feedback.

## Components

- `patient-portal/` — citizen booking, triage, and QR pass (React/TypeScript)
- `admin-portal/` — doctor and clinical console (React/TypeScript)
- `govt-portal/` — vigilance and oversight dashboard (React/TypeScript)
- `backend/` — FastAPI service for authentication, queueing, triage, appointments, observer logic, and chatbot support
- `smartcare-scanner/` — Android QR verification app (Kotlin/Jetpack Compose, ML Kit)

## Status

This is a hackathon prototype, not a production deployment. The local/mocked core flow — book, triage, QR issue, scan, and doctor queue update — is covered by the backend verification tests.

Production load, a real Supabase/Postgres deployment, and multi-cloud deployment have not been verified. Treat any latency or scale figures elsewhere in the repository as illustrative targets, not measured results.

## Quick start

Prerequisites: Python 3.11+, Node 18+, and npm 9+.

```bash
git clone https://github.com/RONAK-PANDEY/SIH-SMART-INDIAN-HACTHON-2026.git
cd SIH-SMART-INDIAN-HACTHON-2026
```

### Backend (port 8000)

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
python -m uvicorn main:app --host 0.0.0.0 --port 8000
```

### Frontends

Run each portal on its own port: patient portal `5173`, admin portal `5174`, and government portal `5175`.

```bash
cd <portal-dir>
npm install
npm run dev -- --host
```

On Windows, `start-all.bat` starts the services and prints the LAN IP for configuring the Android scanner.

Run backend tests with:

```bash
cd backend
python -m pytest -v
```

## Architecture

```text
Patient Portal (:5173)      Doctor Console (:5174)      Govt Dashboard (:5175)
  - Triage + booking          - Live calling queue         - Aggregate queue health
  - QR pass                   - E-Rx, referrals            - Doctor performance index
        |                            ^                              ^
        |                            | scan events (WebSocket)      |
        v                            |                              |
Android Turnstile Scanner ---> FastAPI Backend (:8000) -------------
                                 - auth (JWT/RBAC)
                                 - queue engine, triage, appointments
                                 - WebSocket gateway
                                       |
                                       v
                          Supabase (Postgres) + Redis
```

## API reference

| Area | Method | Endpoint |
| --- | --- | --- |
| Auth | `POST` | `/api/v1/auth/register`, `/api/v1/auth/login` |
| Appointments | `POST` | `/api/v1/appointments/book`, `/api/v1/tokens/generate` |
| Turnstile | `POST` | `/api/v1/tokens/scan` |
| Triage | `POST` | `/api/v1/triage/evaluate` |
| Observer | `GET` | `/api/v1/observer/dashboard`, `/api/v1/observer/doctor-performance` |
| Realtime | `WS` | `/api/v1/ws/queue/{hospital_id}/{department_id}` |

Interactive API documentation is available at `http://localhost:8000/docs` while the backend is running.

See `docs/` for architecture notes, data models, business rules, Android integration, and security notes.

## Demo and presentation

- System walkthrough frame: `docs/screenshots/video_complete_walkthrough.png`
- Slide deck: `SIH_2026_SmartCare_Quantum_Coders_FINAL.pptx`

## Deployment

A basic Docker Compose setup is in `infra/`:

```bash
cd infra
cp env.example .env
docker-compose up -d
```

## License

No license file is currently checked in. Add one before reusing this project.
