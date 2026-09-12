# Changelog

All notable changes to the SmartCare project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [3.0.0] — 2026-09-10 (V3 Master Release)

### 🚀 Added
- **Government Vigilance Portal** (`:5175`) — National OPD oversight console for MoHFW
  - Sentinel Command Dashboard with real-time national OPD monitoring
  - Doctor Performance Index (DPI) computation from citizen surveys
  - Automated monthly salary bonus engine (+15% for Grade A doctors)
  - Grievance Redressal Tribunal with escalation workflows
  - NCR Heatmap & Load Shedding visualization
  - 108 Ambulance Fleet Map with live GPS tracking
  - OPD Counter Walk-in Desk for non-digital citizens
  - Live Scan Feed — real-time turnstile activity monitor
- **Android QR Turnstile Scanner** — Native Kotlin + Jetpack Compose app
  - CameraX + Google ML Kit barcode scanning
  - SHA-256 cryptographic QR verification
  - Real-time WebSocket event broadcast on scan
  - Settings UI for backend URL configuration
  - Duplicate scan detection & expired token rejection
- **Supabase 6-Key Connection Pool** — Multi-key rotation for OPD surge resilience
  - Patient Pool (2 keys, round-robin)
  - Doctor Pool (2 keys, round-robin)
  - Observer Pool (1 dedicated key)
  - Scanner Pool (1 dedicated key)
  - Automatic in-memory fallback when all keys exhausted
- **Google Gemini AI Chatbot** — 6-key round-robin health assistant
  - Multi-key pool prevents free-tier rate limiting
  - Health-focused conversational AI
- **Inter-Hospital Referral System** — One-click patient referral with data transfer
- **Longitudinal Patient EMR** — Complete electronic medical record across visits
- **Comprehensive test suite** — 26/26 tests passing (unit + integration + E2E)
- **Performance benchmarks** — Load testing for 500 concurrent users
- **Security & compliance documentation** — HIPAA, ABDM, DPDPA, IT Act compliance

### 🔧 Changed
- Upgraded queue engine to composite priority scoring: `P(t) = w_t·Δt + w_s·S + w_a·A`
- Enhanced WebSocket gateway with per-hospital/department channel multiplexing
- Improved AI triage with 5-tier ESI (Emergency Severity Index) classification
- Docker Compose updated with PostgreSQL 16 and Redis 7

### 🐛 Fixed
- Queue jumping vulnerability via token number guessing (now SHA-256 enforced)
- Ghost patient problem (now enforced via turnstile QR scan verification)
- Doctor idle time due to no-shows (real-time "AT DOOR" status sync)
- Race condition in concurrent token generation (Supabase pool isolation)

---

## [2.0.0] — 2026-08-20 (V2 Integration Release)

### 🚀 Added
- **Doctor Console** (`:5174`) — Clinical workflow portal
  - Live patient calling desk with real-time queue
  - E-Prescription (Rx) writer with medication database
  - Diagnostic lab order system
  - Patient consultation history and notes
- **WebSocket real-time sync** — Live event propagation across all portals
  - Queue position updates
  - Consultation completion notifications
  - Turnstile scan events
- **AI Triage Engine** — NLP-powered symptom analysis
  - Symptom → department auto-routing
  - 5-tier acuity classification (ESI-1 to ESI-5)
  - Emergency override for P1 patients
- **Dynamic QR Token System** — SHA-256 signed, time-expiring OPD passes
- **108 Ambulance SOS** — One-tap emergency dispatch with GPS

### 🔧 Changed
- Migrated from Express.js to FastAPI for async performance
- Replaced MongoDB with Supabase (PostgreSQL) for relational data integrity
- Redesigned patient portal UI with Tailwind CSS

### 🐛 Fixed
- Token collision under high concurrency
- Language switch causing page reload
- WebSocket reconnection after mobile sleep

---

## [1.0.0] — 2026-07-15 (V1 MVP Release)

### 🚀 Added
- **Patient Portal** (`:5173`) — Basic citizen OPD booking interface
  - Patient registration with ABHA ID
  - Manual department selection
  - Basic token number generation (sequential)
  - Hindi and English language support
- **Basic Backend** — Express.js REST API
  - Patient CRUD operations
  - Simple FIFO queue management
  - JWT authentication
- **Basic Admin Panel** — Doctor view with patient list
- **Documentation** — Initial README, API contracts, architecture doc
- **Startup script** — `start-all.bat` for Windows one-click launch

### Known Limitations (V1)
- No AI triage (manual department selection)
- No QR verification (token numbers only)
- No government oversight portal
- No mobile scanner app
- FIFO queue only (no priority scoring)
- English + Hindi only (no other Indian languages)
- Single database key (rate limit issues under load)

---

## Version Comparison

| Feature | v1.0.0 | v2.0.0 | v3.0.0 |
|---------|--------|--------|--------|
| Portals | 2 (Patient + Admin) | 2 (Patient + Doctor) | **4** (+ Govt + Scanner) |
| Backend | Express.js | FastAPI | **FastAPI + 6-Key Pool** |
| Queue | FIFO | Priority | **AI Priority + Vulnerability** |
| Token security | Sequential numbers | SHA-256 hash | **SHA-256 + Turnstile QR** |
| Triage | Manual selection | AI symptom analysis | **AI + ESI-5 + Emergency Override** |
| Languages | 2 (EN, HI) | 5 | **11 Indian languages** |
| Real-time | Polling | WebSocket | **WebSocket + Redis Pub/Sub** |
| Mobile | None | None | **Android QR Scanner** |
| Govt oversight | None | None | **National Sentinel Dashboard** |
| Tests | 0 | 8 | **26 (100% pass)** |
| Load capacity | ~20 users | ~100 users | **500+ users** |

---

*SmartCare Team SIH26133 | Ministry of Health & Family Welfare, Government of India*
