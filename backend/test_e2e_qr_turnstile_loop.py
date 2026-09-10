import asyncio
import sys
import os
import json
import pytest
from httpx import AsyncClient, ASGITransport

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from main import app
from services.appointment_service.service import AppointmentService

@pytest.mark.asyncio
async def test_end_to_end_loop():
    print("\n=======================================================")
    print("STARTING SMARTCARE E2E QR TURNSTILE & WS INTEGRATION TEST")
    print("=======================================================")

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        # 1. Health check
        health_resp = await client.get("/health")
        assert health_resp.status_code == 200, "Health check failed"
        print("[PASS] 1. Central FastAPI Gateway is Healthy")

        # 2. Book appointment / Generate Token via API
        book_payload = {
            "patient_id": "usr-pat-001",
            "hospital_id": "hosp-001",
            "department_id": "dept-cardio",
            "slot_id": "slot-0930",
            "appointment_date": "2026-09-08",
            "consultation_type": "NEW",
            "reason_for_visit": "Exertional chest tightness",
            "triage_score": 2,
            "is_senior": True,
            "is_pregnant": False,
            "is_differently_abled": False
        }
        book_resp = await client.post("/api/v1/appointments/book", json=book_payload)
        assert book_resp.status_code == 201, f"Booking failed: {book_resp.text}"
        book_data = book_resp.json()

        token_id = book_data["token_id"]
        token_number = book_data["token_number"]
        token_hash = book_data["hash"]

        assert token_id is not None, "token_id must not be None"
        assert token_number.startswith("CARD-"), f"Expected CARD- prefix, got {token_number}"
        assert token_hash is not None and len(token_hash) == 64, f"Valid SHA-256 hash expected, got {token_hash}"
        print(f"[PASS] 2. Booked Token: {token_number} (ID: {token_id}) with Server Hash: {token_hash[:16]}...")

        # 3. Simulate QR Payload encoding
        qr_encoded_payload = {
            "token_id": token_id,
            "token_number": token_number,
            "patient_id": "usr-pat-001",
            "dept": "dept-cardio",
            "hospital_id": "hosp-001",
            "hash": token_hash,
            "timestamp": "2026-09-08T09:30:00Z"
        }
        qr_string = json.dumps(qr_encoded_payload)
        print(f"[PASS] 3. Patient QR SVG Encoded Payload: {qr_string}")

        # 4. Test Tampered QR Hash (Should Fail with 400 INVALID_HASH)
        tampered_scan = {
            "token_id": token_id,
            "token_number": token_number,
            "hash": "0000000000000000000000000000000000000000000000000000000000000000",
            "scanner_id": "turnstile-gate-02-cardio",
            "device_info": "Samsung Galaxy Tab Active 4 / Android 14"
        }
        bad_scan_resp = await client.post("/api/v1/tokens/scan", json=tampered_scan)
        assert bad_scan_resp.status_code == 400, f"Expected 400 for tampered hash, got {bad_scan_resp.status_code}"
        print("[PASS] 4. Tampered Hash Rejected (400 Bad Request)")

        # 5. Test Legitimate Android Scanner Scan
        legit_scan = {
            "token_id": token_id,
            "token_number": token_number,
            "hash": token_hash,
            "scanned_by": "turnstile-gate-02-cardio",
            "scanner_id": "turnstile-gate-02-cardio",
            "device_info": "Samsung Galaxy Tab Active 4 / Android 14 / App v1.2.0"
        }
        scan_resp = await client.post("/api/v1/tokens/scan", json=legit_scan)
        assert scan_resp.status_code == 200, f"Scan failed: {scan_resp.text}"
        scan_data = scan_resp.json()
        assert scan_data["status"] == "ok"
        assert scan_data["token_number"] == token_number
        assert scan_data["dept"] == "dept-cardio"
        print(f"[PASS] 5. Scan Verified by Turnstile Gate: {scan_data['message']}")

        # 6. Test Duplicate Scan Rejection (Should Fail with 400 ALREADY_SCANNED)
        dup_scan_resp = await client.post("/api/v1/tokens/scan", json=legit_scan)
        assert dup_scan_resp.status_code == 400, f"Expected 400 for duplicate scan, got {dup_scan_resp.status_code}"
        print("[PASS] 6. Duplicate Scan Blocked (400 Bad Request - ALREADY_SCANNED)")

        # 7. Test Second Department Token (e.g., General Medicine)
        book_payload_2 = {
            "patient_id": "usr-pat-002",
            "hospital_id": "hosp-001",
            "department_id": "dept-genmed",
            "slot_id": "slot-1000",
            "appointment_date": "2026-09-08",
            "consultation_type": "NEW",
            "reason_for_visit": "Persistent seasonal fever",
            "triage_score": 3,
            "is_senior": False,
            "is_pregnant": False,
            "is_differently_abled": False
        }
        resp2 = await client.post("/api/v1/appointments/book", json=book_payload_2)
        assert resp2.status_code == 201, f"Second booking failed: {resp2.text}"
        data2 = resp2.json()

        demo_scan = {
            "token_id": data2["token_id"],
            "token_number": data2["token_number"],
            "hash": data2["hash"],
            "scanner_id": "gate-genmed-01",
            "scanned_by": "turnstile-gate-01"
        }
        demo_resp = await client.post("/api/v1/tokens/scan", json=demo_scan)
        assert demo_resp.status_code == 200, f"Demo token scan failed: {demo_resp.text}"
        print(f"[PASS] 7. Multi-Department Token {data2['token_number']} Verified Successfully")

    print("\n=======================================================")
    print("ALL END-TO-END VERIFICATIONS PASSED SUCCESSFULLY!")
    print("=======================================================")

if __name__ == "__main__":
    asyncio.run(test_end_to_end_loop())
