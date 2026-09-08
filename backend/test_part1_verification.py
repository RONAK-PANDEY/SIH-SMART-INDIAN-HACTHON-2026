import asyncio
import httpx
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_auth_and_token_lifecycle():
    print("\n--- 1. Testing Registration & Login ---")
    reg_res = client.post("/api/v1/auth/register", json={
        "full_name": "Rohan Verma",
        "phone": "9811223344",
        "password": "Password123!",
        "role": "patient"
    })
    print(f"Register status: {reg_res.status_code}, data: {reg_res.json()}")
    assert reg_res.status_code == 200
    token_jwt = reg_res.json()["access_token"]
    user_id = reg_res.json()["user_id"]
    assert token_jwt is not None

    login_res = client.post("/api/v1/auth/login", json={
        "phone": "9811223344",
        "password": "Password123!"
    })
    print(f"Login status: {login_res.status_code}, access_token: {login_res.json().get('access_token')[:15]}...")
    assert login_res.status_code == 200

    print("\n--- 2. Testing Real Token Creation (POST /api/v1/tokens/create) ---")
    tok_res = client.post("/api/v1/tokens/create", json={
        "patient_id": user_id,
        "department": "dept-cardio",
        "hospital_id": "hosp-001",
        "triage_score": 3,
        "is_senior": False
    })
    print(f"Token Create status: {tok_res.status_code}, data: {tok_res.json()}")
    assert tok_res.status_code == 201
    tok_data = tok_res.json()
    token_id = tok_data["token_id"]
    qr_hash = tok_data["qr_hash"]
    token_number = tok_data["token_number"]
    assert tok_data["status"] == "waiting"
    assert qr_hash is not None

    print("\n--- 3. Testing Real Token Scan with Hash (POST /api/v1/tokens/scan) ---")
    scan_res = client.post("/api/v1/tokens/scan", json={
        "token_id": token_id,
        "token_number": token_number,
        "qr_hash": qr_hash,
        "scanned_by": "turnstile-gate-01"
    })
    print(f"Token Scan status: {scan_res.status_code}, data: {scan_res.json()}")
    assert scan_res.status_code == 200
    assert scan_res.json()["token_status"] == "scanned_by_staff"

    # Verify lookup reflects scanned_by_staff
    get_res = client.get(f"/api/v1/tokens/{token_id}")
    print(f"Get Token after scan: status={get_res.status_code}, status={get_res.json()['status']}")
    assert get_res.json()["status"] == "scanned_by_staff"

    print("\n--- 4. Testing Consultation Completion (POST /api/v1/tokens/{id}/complete) ---")
    comp_res = client.post(f"/api/v1/tokens/{token_id}/complete")
    print(f"Token Complete status: {comp_res.status_code}, data: {comp_res.json()}")
    assert comp_res.status_code == 200
    assert comp_res.json()["token_status"] == "completed"

    get_final = client.get(f"/api/v1/tokens/{token_id}")
    print(f"Get Token after complete: status={get_final.status_code}, status={get_final.json()['status']}")
    assert get_final.json()["status"] == "completed"

    print("\n--- 5. Testing WebSocket Gateway Connection ---")
    with client.websocket_connect("/api/v1/ws/connect/token:" + token_id) as websocket:
        data = websocket.receive_json()
        print(f"WebSocket Initial Message: {data}")
        assert data["event"] == "CONNECTED"

    print("\n[SUCCESS] All Part 1 Backend tests passed successfully!")

if __name__ == "__main__":
    test_auth_and_token_lifecycle()
