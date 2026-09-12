# SmartCare System Architecture
> **Primary Maintainer**: Arpan  
> **Status**: Approved for Development (SIH 2026)

---

## 1. Executive Summary
SmartCare is built on a high-concurrency modular backend with WebSocket pub/sub for real-time queue synchronization, integrated with machine learning models for predictive waiting time estimation and automated multi-lingual triage scoring.

---

## 2. High-Level Architecture Diagram

```
                 +-------------------------------------------------------+
                 |                     Clients Layer                     |
                 |  +------------------------+  +---------------------+  |
                 |  | Patient Web/PWA App    |  | Admin/Doctor Portal |  |
                 |  | (React + Vite + i18n)  |  | (React + Recharts)  |  |
                 |  +-----------+------------+  +----------+----------+  |
                 +--------------|--------------------------|-------------+
                                | REST / JSON              | WebSocket (WSS)
                                v                          v
                 +-------------------------------------------------------+
                 |                    API Gateway Layer                  |
                 |              (FastAPI ASGI Router & Auth)             |
                 +--------------------------+----------------------------+
                                            |
                 +--------------------------v----------------------------+
                 |                     Core Services                     |
                 |  +--------------------+  +-------------------------+  |
                 |  | Auth & RBAC        |  | Dynamic Queue Engine    |  |
                 |  +--------------------+  +-------------------------+  |
                 |  | Triage Evaluator   |  | Referral Engine         |  |
                 |  +--------------------+  +-------------------------+  |
                 |  | Appointment Mgr    |  | Notification Engine     |  |
                 |  +--------------------+  +-------------------------+  |
                 +--------------------------+----------------------------+
                                            |
                 +--------------------------v----------------------------+
                 |                  AI / ML Inference                    |
                 |  +--------------------+  +-------------------------+  |
                 |  | Wait-Time Regressor|  | Congestion Forecaster   |  |
                 |  +--------------------+  +-------------------------+  |
                 |  | NLP Triage Assessor|  | Synthetic Gen           |  |
                 |  +--------------------+  +-------------------------+  |
                 +--------------------------+----------------------------+
                                            |
                 +--------------------------v----------------------------+
                 |                 Data Persistence Layer                |
                 |  +--------------------+  +-------------------------+  |
                 |  | PostgreSQL 16      |  | Redis 7 (Queue Cache &  |  |
                 |  | (Relational State) |  | Pub/Sub Broker)         |  |
                 |  +--------------------+  +-------------------------+  |
                 +-------------------------------------------------------+
```

---

## 3. Component Breakdown

### 3.1 Frontend Web Applications
* **Patient Portal (PWA)**:
  * Built using React 18, TypeScript, Tailwind CSS, Lucide Icons.
  * Local caching & service workers for poor connectivity in rural areas.
  * Multi-language support (English, Hindi, Punjabi) for diverse accessibility.
* **Admin & Doctor Console**:
  * Realtime consultation workflow, one-click patient call/skip/transfer.
  * Live hospital capacity analytics with Recharts and geospatial heatmap.

### 3.2 Backend Service Layers
* **Queue Engine**:
  * Calculates dynamic composite priority score $P(t) = w_t \cdot \Delta t + w_s \cdot S_{triage} + w_a \cdot A_{vulnerability}$.
  * Handles queue re-ordering upon emergency walk-in arrivals.
* **WebSocket Gateway**:
  * Realtime channel multiplexing per hospital/department/doctor room.
* **Triage Service**:
  * Accepts structured symptoms + free-text complaints, maps to 5-tier Emergency Severity Index (ESI).

---

## 4. Security & Compliance
* **ABHA & Data Privacy**: Pseudonymized health records adhering to ABDM (Ayushman Bharat Digital Mission) standards.
* **Authentication**: JWT-based session management with role-based access control (RBAC).
