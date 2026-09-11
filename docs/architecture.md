# SmartCare Architecture

SmartCare consists of a FastAPI backend, three React frontends, and an Android turnstile scanner. The backend provides REST endpoints and WebSocket updates for the OPD queue.

## High-level flow

```text
Patient Portal (:5173)      Doctor Console (:5174)      Govt Dashboard (:5175)
        |                            ^                              ^
        | REST                       | WebSocket                    |
        v                            |                              |
Android Turnstile Scanner ---> FastAPI Backend (:8000) -------------
                                 |
                                 v
                          Supabase/Postgres + Redis
```

## Components

### Web applications

- **Patient portal:** appointment booking, triage input, and QR pass display.
- **Admin portal:** consultation workflow and live queue operations.
- **Government portal:** aggregate queue monitoring and doctor-performance reporting.

### Backend

- **Module layout:** domain code lives in `core/` (appointments, patients, queue, triage, referrals, and observer), access control in `auth/`, and external services in `integrations/`.
- **Authentication and RBAC:** JWT sessions and role checks.
- **Appointment and token services:** booking, QR hash generation, scan verification, and queue status.
- **Triage service:** structured symptoms and free-text complaints are mapped to a severity level and department.
- **Queue engine:** orders waiting patients using wait time, triage severity, and vulnerability factors.
- **WebSocket gateway:** broadcasts relevant queue changes to connected clients.
- **Integrations:** chatbot and notification support.

### Data layer

The prototype can use Supabase/Postgres and Redis configuration supplied by the environment. Its tests use local or mocked data paths; infrastructure hardening and a production data deployment remain out of scope.
