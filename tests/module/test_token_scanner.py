import pytest
import sys
import os
from datetime import datetime

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../backend')))

from fastapi.testclient import TestClient
from main import app
from services.appointment_service.service import AppointmentService
from services.appointment_service.models import TokenGenerateRequest
from db.supabase_client import supabase_pool

client = TestClient(app)

def test_token_hash_generation():
    """Verify newly issued token generates cryptographic verification hash"""
    req = TokenGenerateRequest(
        patient_id="usr-pat-001",
        hospital_id="hosp-001",
        department_id="dept-cardio",
        triage_score=2,
        is_senior=True
    )
    token = AppointmentService.generate_token(req)
    assert token.token_id is not None
    assert token.hash is not None
    assert len(token.hash) == 64  # SHA-256 hex string

def test_token_scan_valid():
    """Verify valid token and hash returns 200 and updates status to scanned"""
    # 1. Issue token
    gen_resp = client.post("/api/v1/appointments/tokens/generate", json={
        "patient_id": "usr-pat-001",
        "hospital_id": "hosp-001",
        "department_id": "dept-cardio",
        "triage_score": 2,
        "is_senior": True
    })
    assert gen_resp.status_code == 201
    tok_data = gen_resp.json()
    token_id = tok_data["token_id"]
    token_hash = tok_data["hash"]

    # 2. Scan via new /api/v1/tokens/scan endpoint
    scan_resp = client.post("/api/v1/tokens/scan", json={
        "token_id": token_id,
        "hash": token_hash,
        "scanned_by": "Turnstile-North-Gate-01",
        "timestamp": datetime.utcnow().isoformat()
    })
    assert scan_resp.status_code == 200
    res = scan_resp.json()
    assert res["status"] == "ok"
    assert res["token_id"] == token_id
    assert res["dept"] == "dept-cardio"
    assert "token_number" in res
    assert "patient_name" in res

def test_token_scan_invalid_hash():
    """Verify mismatched hash returns 400 error with message field"""
    gen_resp = client.post("/api/v1/appointments/tokens/generate", json={
        "patient_id": "usr-pat-002",
        "hospital_id": "hosp-001",
        "department_id": "dept-genmed",
        "triage_score": 4
    })
    assert gen_resp.status_code == 201
    token_id = gen_resp.json()["token_id"]

    scan_resp = client.post("/api/v1/tokens/scan", json={
        "token_id": token_id,
        "hash": "invalid_forged_tampered_hash_12345",
        "scanned_by": "Turnstile-Gate-02"
    })
    assert scan_resp.status_code == 400
    res = scan_resp.json()
    # Ensure error has a message field
    assert "detail" in res
    detail = res["detail"]
    assert "message" in detail or "error" in detail

def test_token_scan_already_scanned():
    """Verify duplicate scan returns 400 error"""
    gen_resp = client.post("/api/v1/appointments/tokens/generate", json={
        "patient_id": "usr-pat-003",
        "hospital_id": "hosp-001",
        "department_id": "dept-ortho",
        "triage_score": 3
    })
    assert gen_resp.status_code == 201
    tok_data = gen_resp.json()
    token_id = tok_data["token_id"]
    token_hash = tok_data["hash"]

    # First scan succeeds
    resp1 = client.post("/api/v1/tokens/scan", json={
        "token_id": token_id,
        "hash": token_hash,
        "scanned_by": "Turnstile-Gate-01"
    })
    assert resp1.status_code == 200

    # Second scan must be rejected
    resp2 = client.post("/api/v1/tokens/scan", json={
        "token_id": token_id,
        "hash": token_hash,
        "scanned_by": "Turnstile-Gate-01"
    })
    assert resp2.status_code == 400
    assert "already" in str(resp2.json()).lower()

def test_token_scan_not_found():
    """Verify non-existent token returns 404 with message field"""
    scan_resp = client.post("/api/v1/tokens/scan", json={
        "token_id": "non_existent_token_9999",
        "hash": "some_hash_value",
        "scanned_by": "Turnstile-Gate-01"
    })
    assert scan_resp.status_code == 404
    res = scan_resp.json()
    assert "detail" in res
    assert "message" in res["detail"] or "not found" in str(res["detail"]).lower()

def test_supabase_key_pool_rotation():
    """Verify 6-member key pools rotate round-robin across requests"""
    status_before = supabase_pool.get_pool_status()
    assert "patient" in status_before
    assert "doctor" in status_before
    assert "observer" in status_before
    assert "android_scanner" in status_before
    assert status_before["patient"]["total_members"] == 2
    assert status_before["doctor"]["total_members"] == 2

    # Rotate patient pool
    k1 = supabase_pool._get_next_key_info("patient")
    k2 = supabase_pool._get_next_key_info("patient")
    assert k1["member"] != k2["member"]
    assert {k1["member"], k2["member"]} == {"Arpan", "Rishikesh"}

    # Rotate doctor pool
    d1 = supabase_pool._get_next_key_info("doctor")
    d2 = supabase_pool._get_next_key_info("doctor")
    assert d1["member"] != d2["member"]
    assert {d1["member"], d2["member"]} == {"Kartik", "Alok"}
