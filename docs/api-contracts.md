# SmartCare API Contracts & Specifications
> **Maintainer**: Arpan  
> **Mandatory**: All developers must adhere to these schemas before writing frontend or service modules.

---

## 1. Authentication Endpoints

### `POST /api/v1/auth/register`
* **Description**: Register a new patient or hospital staff.
* **Request**:
```json
{
  "full_name": "Rohan Sharma",
  "phone": "+919876543210",
  "abha_id": "12-3456-7890-1234",
  "role": "patient",
  "password": "SecurePassword123!"
}
```
* **Response (201)**:
```json
{
  "user_id": "usr_981a8bc",
  "access_token": "eyJhbGciOi...",
  "token_type": "bearer",
  "expires_in": 86400
}
```

---

## 2. Queue & Token Endpoints

### `POST /api/v1/queue/tokens/generate`
* **Description**: Generate a smart token with automated priority calculation.
* **Request**:
```json
{
  "patient_id": "usr_981a8bc",
  "hospital_id": "hosp_aiims_delhi",
  "department_id": "dept_cardiology",
  "triage_score": 2,
  "is_emergency": false,
  "vulnerability_flags": {
    "is_senior": false,
    "is_pregnant": false,
    "is_differently_abled": false
  }
}
```
* **Response (200)**:
```json
{
  "token_id": "tok_c0192",
  "token_number": "CARD-042",
  "estimated_call_time": "2026-09-01T11:45:00Z",
  "estimated_wait_minutes": 25,
  "current_queue_position": 4,
  "assigned_room": "OPD Room 104"
}
```

---

## 3. Realtime WebSocket API

### `WS /api/v1/ws/queue/{hospital_id}/{department_id}`
* **Events Emitted**:
```json
{
  "event": "QUEUE_UPDATE",
  "current_token": "CARD-038",
  "next_token": "CARD-039",
  "active_doctors": 4,
  "avg_consult_time_mins": 7.5,
  "timestamp": "2026-09-01T11:20:15Z"
}
```
