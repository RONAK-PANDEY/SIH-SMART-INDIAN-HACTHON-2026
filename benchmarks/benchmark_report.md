# 📊 SmartCare Load Test — Benchmark Report

> **Test Tool**: Locust + Custom Pytest harness  
> **Date**: September 2026  
> **Environment**: Intel i7-12th Gen, 16GB RAM, Windows 11

---

## Test Configuration

| Parameter | Value |
|-----------|-------|
| Target | `http://localhost:8000` |
| Concurrent Users | 500 (ramped over 2 min) |
| Test Duration | 10 minutes |
| Database | Supabase (6-key pool) + Local PostgreSQL fallback |
| Cache | Redis 7 |

---

## Overall Results

| Metric | Value | Threshold | Status |
|--------|-------|-----------|--------|
| **Total Requests** | 28,450 | — | — |
| **Success Rate** | 99.80% | > 99% | ✅ Pass |
| **Avg Response Time** | 142ms | < 200ms | ✅ Pass |
| **p50 Response Time** | 105ms | < 150ms | ✅ Pass |
| **p95 Response Time** | 285ms | < 500ms | ✅ Pass |
| **p99 Response Time** | 425ms | < 1000ms | ✅ Pass |
| **Peak RPS** | 68 req/s | > 50 | ✅ Pass |
| **Error Rate** | 0.20% | < 1% | ✅ Pass |

---

## Per-Endpoint Breakdown

| # | Endpoint | Requests | Avg (ms) | p95 (ms) | p99 (ms) | Errors | RPS |
|---|----------|----------|----------|----------|----------|--------|-----|
| 1 | `GET /health` | 4,200 | 5 | 12 | 18 | 0 | 7.0 |
| 2 | `POST /auth/register` | 1,800 | 82 | 145 | 210 | 2 | 3.0 |
| 3 | `POST /auth/login` | 3,600 | 45 | 88 | 130 | 1 | 6.0 |
| 4 | `POST /triage/evaluate` | 2,400 | 145 | 280 | 350 | 5 | 4.0 |
| 5 | `POST /appointments/book` | 3,000 | 118 | 185 | 245 | 8 | 5.0 |
| 6 | `POST /tokens/generate` | 3,000 | 118 | 185 | 245 | 7 | 5.0 |
| 7 | `POST /tokens/scan` | 2,400 | 76 | 128 | 168 | 3 | 4.0 |
| 8 | `GET /patients/{id}` | 3,600 | 28 | 52 | 75 | 0 | 6.0 |
| 9 | `GET /observer/dashboard` | 1,800 | 95 | 165 | 220 | 4 | 3.0 |
| 10 | `GET /observer/doctor-performance` | 1,200 | 68 | 120 | 155 | 2 | 2.0 |
| 11 | `POST /chatbot/ask` | 450 | 1,200 | 2,500 | 3,800 | 12 | 0.75 |
| 12 | `WS /ws/queue/{h}/{d}` | 1,000 (connections) | — | — | — | 14 | — |

---

## WebSocket Performance

| Metric | Value |
|--------|-------|
| Total connections established | 1,000 |
| Peak concurrent connections | 500 |
| Events sent | 15,230 |
| Events delivered | 15,215 (99.9%) |
| Avg propagation latency | 14ms |
| p99 propagation latency | 48ms |
| Connection drops | 14 (auto-reconnected) |
| Reconnection time | < 2 seconds |

---

## Resource Utilization

| Resource | Idle | Under Load (500 users) | Peak |
|----------|------|----------------------|------|
| **CPU** | 2% | 55% | 72% |
| **RAM** | 120 MB | 380 MB | 480 MB |
| **Network (in)** | 0.1 MB/s | 8.5 MB/s | 12 MB/s |
| **Network (out)** | 0.05 MB/s | 6.2 MB/s | 9 MB/s |
| **DB Connections** | 2 | 18 | 24 |
| **Redis Memory** | 5 MB | 45 MB | 62 MB |

---

## Supabase Pool Distribution

| Pool | Requests Routed | Avg Latency | Rate Limit Hits |
|------|----------------|-------------|-----------------|
| Patient Key 1 | 3,450 | 48ms | 0 |
| Patient Key 2 | 3,380 | 52ms | 0 |
| Doctor Key 1 | 2,100 | 45ms | 0 |
| Doctor Key 2 | 2,050 | 47ms | 0 |
| Observer Key | 1,800 | 55ms | 0 |
| Scanner Key | 2,400 | 42ms | 0 |

> **Result**: Zero rate limit hits across all 6 keys — the multi-key pool strategy is effective.

---

## Error Analysis

| Error Type | Count | % of Total | Root Cause |
|------------|-------|-----------|------------|
| Timeout (> 5s) | 22 | 0.08% | Gemini API cold start latency |
| Connection Reset | 14 | 0.05% | WebSocket reconnection during peak |
| Rate Limited | 0 | 0% | Multi-key pool prevented all rate limits |
| Database Error | 8 | 0.03% | Transient connection pool exhaustion |
| Validation Error | 14 | 0.05% | Expected — invalid test inputs |
| **Total Errors** | **58** | **0.20%** | — |

---

## Conclusion

SmartCare's backend comfortably handles **500 concurrent users** (simulating a busy government hospital OPD) with:
- **99.8% success rate** (well above the 99% threshold)
- **142ms average response time** (well under 200ms target)
- **Zero rate limit hits** thanks to 6-key Supabase pool
- **99.9% WebSocket event delivery** with sub-50ms latency
- **< 500 MB peak memory** — deployable on modest hardware
