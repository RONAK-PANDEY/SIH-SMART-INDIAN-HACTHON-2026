import asyncio
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_chatbot():
    print("\n--- 1. Testing Chatbot Endpoint (POST /api/v1/chatbot/message) ---")
    res = client.post("/api/v1/chatbot/message", json={
        "message": "How do I get an OPD queue token?",
        "session_id": "test_patient_1"
    })
    print(f"Chatbot response status: {res.status_code}")
    assert res.status_code == 200
    data = res.json()
    print(f"Chatbot Reply: {data['reply'][:120]}...")
    print(f"Served by: {data['served_by']}")
    assert data["status"] == "success"
    assert len(data["reply"]) > 10

    print("\n--- 2. Testing Chatbot Key Pool Status (GET /api/v1/chatbot/status) ---")
    status_res = client.get("/api/v1/chatbot/status")
    print(f"Status response: {status_res.status_code}, data: {status_res.json()}")
    assert status_res.status_code == 200
    assert status_res.json()["total_slots"] == 6

    print("\n[SUCCESS] Chatbot & 6-Key Pool verification passed!")

if __name__ == "__main__":
    test_chatbot()
