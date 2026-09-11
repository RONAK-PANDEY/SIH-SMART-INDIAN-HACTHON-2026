from core.queue.engine import queue_engine
from realtime.websocket_gateway.gateway import ws_manager
from datetime import datetime

class DoctorConsoleHandler:
    @staticmethod
    async def call_next_patient(doctor_id: str, hospital_id: str, department_id: str, room: str):
        dept = department_id
        if not dept.startswith("dept-") and "-" not in dept:
            dept = f"dept-{dept}"
        
        token = queue_engine.pop_next(hospital_id, dept) or queue_engine.pop_next(hospital_id, department_id)
        if not token:
            return {"status": "empty_queue", "message": "No waiting patients in queue"}
        
        channel = f"{hospital_id}:{dept}"
        await ws_manager.broadcast_to_channel(channel, {
            "event": "PATIENT_CALLED",
            "token_number": token.token_number,
            "room": room,
            "doctor_id": doctor_id,
            "called_at": datetime.utcnow().isoformat()
        })
        return {
            "status": "success",
            "active_token": token.token_number,
            "room": room,
            "patient_id": token.patient_id
        }
