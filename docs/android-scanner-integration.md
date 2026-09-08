# SmartCare Android QR Turnstile Scanner — Integration Specification
### Smart India Hackathon (SIH) 2026 • MoHFW Official Specification v2.0.0

This technical specification details the complete integration contract for the **SmartCare Android QR Turnstile Scanner Client**.

---

## 1. Architectural Architecture & Gateway Boundary

```
  ┌─────────────────────────────────┐
  │ 📱 Android Mobile Scanner App   │
  │ • Security Gate / Turnstile     │
  │ • Camera QR Scanner (ML Kit)    │
  └────────────────┬────────────────┘
                   │
                   │ POST /api/v1/tokens/scan (HTTPS / HTTP)
                   ▼
  ┌──────────────────────────────────────────────────────────────────┐
  │ 🚀 FastAPI Central Backend Gateway (Port 8000)                   │
  │ • Validates SHA-256 Tamper-Proof Cryptographic Hash              │
  │ • Checks Duplicate Scans & Token Expiration                     │
  │ • Updates Status to 'scanned' in Supabase (Android Key Pool)     │
  │ • Broadcasts WebSocket Event to Doctor Consultation Chamber     │
  └────────────────┬────────────────────────────────┬────────────────┘
                   │                                │
                   ▼                                ▼
  ┌─────────────────────────────────┐  ┌─────────────────────────────┐
  │ 🗄️ Supabase PostgreSQL          │  │ 🩺 Doctor Console (:5174)   │
  │ • Key Pool: Member 6 (Shristi)   │  │ • WebSocket: /ws/queue/...  │
  │ • RLS Enforced                   │  │ • Live "At Door" badge     │
  └─────────────────────────────────┘  └─────────────────────────────┘
```

> [!IMPORTANT]
> **Strict Gateway Policy**:
> The Android mobile client **must NEVER** communicate with Supabase directly. All database interactions, authentication, and state transitions are routed exclusively through the FastAPI backend gateway.

---

## 2. Dynamic QR Code JSON Payload Schema

When a citizen presents their appointment pass on the **Citizen Portal** (`:5173`) or prints an OPD ticket at the **Counter Helpdesk** (`:5175`), the QR code encodes a compact JSON string with a cryptographic hash.

### QR Code Content Format:
```json
{
  "token_id": "tok-a91298ef-6a54-4a24-9b2f-7640fa889d12",
  "token_number": "CARD-204",
  "patient_id": "P-10024",
  "dept": "dept-cardio",
  "hospital_id": "hosp-001",
  "hash": "7d9a1f28b493c04f9815e98218175b5b4819266184519965384666f7d0ef802e",
  "timestamp": "2026-09-07T10:30:00Z"
}
```

### Field Definitions:
| Field | Type | Description |
| :--- | :--- | :--- |
| `token_id` | `string` | Unique Token UUID generated at booking. |
| `token_number` | `string` | Human-readable token index (e.g., `CARD-204`). |
| `patient_id` | `string` | Unique patient citizen identifier. |
| `dept` | `string` | Clinical Department code (`dept-cardio`, `dept-ortho`, etc.). |
| `hospital_id` | `string` | Hospital facility code (`hosp-001`, `hosp-002`, etc.). |
| `hash` | `string` | SHA-256 hash computed over `token_number:patient_id:dept:hospital_id:secret`. |
| `timestamp` | `string` | ISO 8601 creation timestamp. |

---

## 3. Scanner REST API Endpoint Specification

### Endpoint:
```http
POST /api/v1/tokens/scan
POST /api/v1/appointments/tokens/scan
```

### Request Headers:
```http
Content-Type: application/json
Accept: application/json
```

### Request Body:
```json
{
  "token_id": "tok-a91298ef-6a54-4a24-9b2f-7640fa889d12",
  "token_number": "CARD-204",
  "hash": "7d9a1f28b493c04f9815e98218175b5b4819266184519965384666f7d0ef802e",
  "scanner_id": "turnstile-gate-02-cardio",
  "device_info": "Samsung Galaxy Tab Active 4 / Android 14 / App v1.2.0"
}
```

---

## 4. Responses & Error Codes

### Case 1: Successful Verification (`200 OK`)
```json
{
  "success": true,
  "status": "scanned",
  "token_number": "CARD-204",
  "patient_name": "Aarav Sharma",
  "dept": "dept-cardio",
  "hospital_id": "hosp-001",
  "scanned_at": "2026-09-07T10:45:12.823104Z",
  "message": "Token CARD-204 verified successfully. Patient cleared through turnstile turnstile-gate-02-cardio."
}
```

### Case 2: Tampered / Invalid Hash (`400 Bad Request`)
Returned when the QR code data was tampered with or does not match backend SHA-256 integrity verification.
```json
{
  "detail": "Invalid token QR hash. Token may be forged or tampered."
}
```

### Case 3: Duplicate Scan Attempt (`400 Bad Request`)
Returned if a citizen tries to reuse an already scanned token pass to enter twice.
```json
{
  "detail": "Token CARD-204 has already been scanned at 2026-09-07T10:45:12.823104Z. Duplicate scans are prohibited."
}
```

### Case 4: Token Expired or Already Consulted (`400 Bad Request`)
Returned if the token status is `completed` or `cancelled`.
```json
{
  "detail": "Token CARD-204 is in status 'completed' and cannot be scanned."
}
```

### Case 5: Token Not Found (`404 Not Found`)
Returned if the token record does not exist in the database or in-memory repository.
```json
{
  "detail": "Token 'CARD-999' not found in system records."
}
```

---

## 5. Doctor Console WebSocket Broadcast Schema

Whenever a successful scan occurs, the backend automatically publishes a real-time event to the consultation chamber's WebSocket channel:

### WebSocket Endpoint:
```
ws://<BACKEND_HOST>:8000/api/v1/ws/queue/{hospital_id}/{dept}
```

### Event Payload (`token_scanned`):
```json
{
  "event": "token_scanned",
  "token_number": "CARD-204",
  "patient_name": "Aarav Sharma",
  "scanned_at": "2026-09-07T10:45:12.823104Z",
  "status": "scanned",
  "scanned_by": "turnstile-gate-02-cardio",
  "device_info": "Samsung Galaxy Tab Active 4 / Android 14 / App v1.2.0",
  "message": "Patient Aarav Sharma (CARD-204) scanned at turnstile turnstile-gate-02-cardio. Ready for consultation."
}
```

### Doctor Console Behavior:
- **Instant Toast Alert**: Displays the patient's name, token, and turnstile location.
- **Visual Badge**: Shows `AT DOOR (SCANNED)` badge beside the citizen's token in the queue roster.
- **Audio Chime**: Notifies the consulting physician that the next patient has entered the waiting corridor.

---

## 6. Android Network Configuration & Setup

### A. Android Emulator
Set backend base URL in Retrofit / OkHttp client:
```kotlin
val BASE_URL = "http://10.0.2.2:8000"
```

### B. Physical Android Tablet / Phone
Ensure the device is connected to the same Wi-Fi network as the host computer:
```kotlin
val BASE_URL = "http://192.168.1.100:8000" // Replace with computer IP from `ipconfig`
```

### C. Android Network Security Configuration (`res/xml/network_security_config.xml`)
To permit local HTTP during hackathon deployment:
```xml
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <domain-config cleartextTrafficPermitted="true">
        <domain includeSubdomains="true">10.0.2.2</domain>
        <domain includeSubdomains="true">192.168.1.100</domain>
        <domain includeSubdomains="true">localhost</domain>
    </domain-config>
</network-security-config>
```

---

## 7. Verification cURL Example

You can test the turnstile endpoint locally from terminal:

```bash
# 1. Test token scan
curl -X POST "http://localhost:8000/api/v1/tokens/scan" \
  -H "Content-Type: application/json" \
  -d '{
    "token_number": "CARD-204",
    "hash": "7d9a1f28b493c04f9815e98218175b5b4819266184519965384666f7d0ef802e",
    "scanner_id": "gate-cardio-01",
    "device_info": "Pixel 7 Pro Android 14"
  }'
```
