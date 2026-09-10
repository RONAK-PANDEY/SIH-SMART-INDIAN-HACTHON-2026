# 📈 SmartCare Scalability & Testing Strategy

> **Version**: v3.0.0 | **Problem Statement**: SIH26133  
> **Target Scale**: 500+ concurrent users per hospital, multi-hospital deployment

---

## 1. Horizontal Scaling Architecture

SmartCare is designed for horizontal scalability from a single laptop demo to national deployment across India's 25,000+ government hospitals.

### Scaling Tiers

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         NATIONAL DEPLOYMENT TIER                           │
│  Load Balancer (Nginx/HAProxy) → N × Backend Instances                     │
│  Supabase → PostgreSQL Cluster (Read Replicas)                             │
│  Redis Cluster (3+ nodes) → WebSocket Pub/Sub                              │
│  CDN (CloudFlare) → Static Frontend Assets                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                         REGIONAL HOSPITAL TIER                              │
│  Single Backend Instance per Hospital                                       │
│  Shared Supabase Project (6-Key Pool)                                       │
│  Local Redis Instance                                                       │
│  All 3 Portals + Scanner App                                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                         DEMO / DEV TIER (Current)                           │
│  Single Machine: Backend + 3 Portals + Android Scanner                      │
│  Supabase Cloud OR In-Memory Fallback                                       │
│  Optional Redis                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Scaling Strategy per Component

| Component | Current | Medium Scale | National Scale |
|-----------|---------|-------------|----------------|
| **Backend** | 1 instance | 3–5 instances + Load Balancer | Auto-scaling (K8s) |
| **Database** | Supabase (6-key) | Supabase Pro + Read Replicas | Self-hosted PostgreSQL Cluster |
| **Cache** | Optional Redis | Dedicated Redis | Redis Cluster (3 nodes) |
| **WebSocket** | In-process | Redis Pub/Sub bridge | Redis Cluster + Sticky Sessions |
| **Frontend** | Dev server | CDN (Vercel/CloudFlare) | CDN with edge caching |
| **Scanner** | Direct to backend | Via API Gateway | Via Regional API Gateway |

---

## 2. Load Testing Results

### Test Scenario: Typical Government Hospital OPD

Simulated a busy OPD session at a district hospital with realistic user distribution:

| User Role | Count | Actions/min | Total Actions |
|-----------|-------|-------------|---------------|
| Patients (booking, triage) | 300 | 2 | 6,000 |
| Doctors (calling, consulting) | 50 | 5 | 2,500 |
| Scanners (turnstile verification) | 20 | 8 | 1,600 |
| Observers (dashboard monitoring) | 10 | 3 | 300 |
| WebSocket connections | 120 | continuous | — |
| **Total** | **500** | — | **10,400** |

### Results Summary

| Metric | Result | Threshold | Verdict |
|--------|--------|-----------|---------|
| Success rate | **99.8%** | > 99% | ✅ Exceeds |
| Average response time | **142ms** | < 200ms | ✅ Exceeds |
| p95 response time | **285ms** | < 500ms | ✅ Exceeds |
| WebSocket delivery | **99.9%** | > 99% | ✅ Exceeds |
| Memory usage | **480 MB** | < 1 GB | ✅ Exceeds |
| CPU usage | **72%** | < 90% | ✅ Exceeds |

> Full breakdown: [benchmarks/benchmark_report.md](../benchmarks/benchmark_report.md)

---

## 3. Database Optimization

### Indexing Strategy

SmartCare uses targeted composite indexes optimized for the most frequent real-time query patterns:

| Index | Table | Columns | Query Pattern | Impact |
|-------|-------|---------|---------------|--------|
| `idx_tokens_dept_status` | tokens | `(department_id, status)` | Active tokens by department | **60% faster** |
| `idx_tokens_hospital_dept` | tokens | `(hospital_id, department_id, status)` | Hospital-specific queues | **55% faster** |
| `idx_patients_abha` | patients | `(abha_id)` | Patient lookup by ABHA | **90% faster** |
| `idx_queue_priority` | queue | `(department_id, priority DESC, created_at)` | Priority-ordered queue | **70% faster** |
| `idx_surveys_doctor` | surveys | `(doctor_id, created_at)` | DPI aggregation | **45% faster** |
| `idx_consultations_patient` | consultations | `(patient_id, created_at DESC)` | Patient history | **50% faster** |

### Partial Indexes

```sql
-- Only index active tokens (reduces index size by ~70%)
CREATE INDEX idx_active_tokens ON tokens (department_id, priority)
WHERE status IN ('active', 'waiting', 'scanned_by_staff');

-- Only index unresolved grievances
CREATE INDEX idx_open_grievances ON grievances (hospital_id, created_at)
WHERE status = 'open';
```

### Connection Pooling

| Strategy | Configuration | Benefit |
|----------|--------------|---------|
| **Supabase 6-Key Pool** | 2 Patient + 2 Doctor + 1 Observer + 1 Scanner | Bypass per-key rate limits |
| **Round-Robin Rotation** | Patient & Doctor pools alternate keys | Even load distribution |
| **Dedicated Isolation** | Observer & Scanner pools have exclusive keys | No interference with patient path |
| **In-Memory Fallback** | Auto-activates when all keys exhausted | Zero downtime |

---

## 4. Redis Caching Strategy

### Cache Architecture

```
┌─────────────────────────────────────────────────┐
│                  Redis 7 Instance                │
├─────────────────────────────────────────────────┤
│                                                  │
│  ┌─────────────────┐  ┌──────────────────────┐  │
│  │ Queue Cache      │  │ WebSocket Pub/Sub    │  │
│  │ TTL: 30 seconds  │  │ Channels per dept    │  │
│  │ Key: queue:{dept} │  │ Real-time events    │  │
│  └─────────────────┘  └──────────────────────┘  │
│                                                  │
│  ┌─────────────────┐  ┌──────────────────────┐  │
│  │ Session Cache    │  │ Rate Limit Counters  │  │
│  │ TTL: 24 hours    │  │ Per-key usage track  │  │
│  │ Key: sess:{uid}  │  │ Window: 1 minute     │  │
│  └─────────────────┘  └──────────────────────┘  │
│                                                  │
│  ┌─────────────────┐                             │
│  │ DPI Score Cache  │                             │
│  │ TTL: 5 minutes   │                             │
│  │ Key: dpi:{doc}   │                             │
│  └─────────────────┘                             │
└─────────────────────────────────────────────────┘
```

### Cache Performance

| Cache Type | Hit Rate | Avg Latency | TTL |
|------------|----------|-------------|-----|
| Queue state | **85%** | 0.8ms | 30s |
| Session tokens | **95%** | 0.5ms | 24h |
| DPI scores | **78%** | 0.6ms | 5min |
| Rate counters | **100%** | 0.3ms | 60s |

---

## 5. WebSocket Connection Management at Scale

### Architecture

```
Client (Browser/Mobile)
    │
    ▼
WebSocket Connection (wss://)
    │
    ▼
FastAPI WebSocket Handler
    │
    ├──► ConnectionManager (in-memory registry)
    │       • Tracks active connections by hospital/department
    │       • O(1) lookup, O(n) broadcast per channel
    │
    └──► Redis Pub/Sub (cross-instance)
            • Channel per hospital/department pair
            • Enables multi-instance WebSocket without sticky sessions
```

### Connection Limits & Management

| Parameter | Value | Strategy |
|-----------|-------|----------|
| Max connections per instance | **1,000** | OS-level file descriptor tuning |
| Memory per connection | **~2.5 KB** | Minimal state tracking |
| Heartbeat interval | **30 seconds** | Keep-alive + dead connection cleanup |
| Auto-reconnect | **< 2 seconds** | Client-side exponential backoff |
| Channel multiplexing | **Per hospital/dept** | Targeted broadcasts, not global |

### Broadcast Efficiency

| Scenario | Connections | Broadcast Time | Per-Connection |
|----------|------------|----------------|----------------|
| Small hospital (1 dept) | 10 | **< 1ms** | 0.1ms |
| Medium hospital (5 depts) | 50 | **< 5ms** | 0.1ms |
| Large hospital (20 depts) | 200 | **< 20ms** | 0.1ms |
| National (100 hospitals) | 1,000 | **< 50ms** (via Redis) | 0.05ms |

---

## 6. Existing Test Suite Summary

SmartCare maintains a comprehensive test suite across unit, integration, and end-to-end layers:

### Unit Tests (`tests/module/`) — 19+ Tests

| Test File | Tests | Coverage |
|-----------|-------|----------|
| `test_bonus_calculator.py` | 6 | Zero-review handling, provisional guardrails, grade thresholds (A/B/C/D) |
| `test_priority_hardening.py` | 4 | Emergency P1 override, deterministic arrival tie-breaking |
| `test_queue_engine.py` | 3 | Dynamic priority math, vulnerability boosts, queue reordering |
| `test_token_scanner.py` | 4 | SHA-256 generation, tamper rejection, duplicate blocking, expiry |
| `test_auth_rbac.py` | 1 | Role-based permission enforcement |
| `test_triage_rules.py` | 1 | Symptom-to-department mapping accuracy |

### Integration Tests (`backend/`) — Service Verification

| Test File | Scope |
|-----------|-------|
| `test_e2e_qr_turnstile_loop.py` | 7-step full scan pipeline (token → scan → verify → WebSocket) |
| `test_part1_verification.py` | Core service initialization & dependency checks |
| `tests_service_verification.py` | Cross-service integration validation |
| `test_chatbot_verification.py` | Gemini AI chatbot pool functionality |

### End-to-End Tests (`tests/e2e/`) — Full User Journeys

| Test File | Scope |
|-----------|-------|
| `test_patient_journey.py` | Registration → booking → consultation flow |
| `test_doctor_queue.py` | Queue management, patient calling, completion |
| `patient-journey.spec.ts` | Playwright browser automation (full UI flow) |

### Frontend Production Builds

| Portal | Build Status | TypeScript Errors | Bundle Size |
|--------|-------------|-------------------|-------------|
| Patient Portal (`:5173`) | ✅ Success | 0 | ~1.2 MB |
| Admin Portal (`:5174`) | ✅ Success | 0 | ~980 KB |
| Govt Portal (`:5175`) | ✅ Success | 0 | ~1.1 MB |

### Running Tests

```bash
# Run all unit tests
cd backend && python -m pytest tests/module/ -v --tb=short

# Run integration tests
python -m pytest test_e2e_qr_turnstile_loop.py -v

# Run E2E tests
cd tests/e2e && python -m pytest -v

# Run Playwright browser tests
npx playwright test tests/e2e/patient-journey.spec.ts

# Run ALL tests with coverage
python -m pytest tests/ --cov=services --cov-report=html -v
```
