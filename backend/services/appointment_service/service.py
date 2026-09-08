import uuid
import hashlib
from datetime import datetime, timedelta
from typing import Dict, List, Optional
from fastapi import HTTPException, status
from services.queue_engine.engine import queue_engine, QueueTokenItem
from services.queue_engine.priority import VulnerabilityFactors
from services.appointment_service.models import (
    TokenCreateRequest,
    TokenGenerateRequest,
    TokenResponse,
    TokenScanRequest,
    TokenScanResponse,
    TokenCompleteResponse,
    SlotItem,
    SlotAvailabilityRequest,
    AppointmentBookingRequest,
    AppointmentDetails,
    QueueStatusResponse
)
from db.supabase_client import supabase_pool
from realtime.websocket_gateway.gateway import ws_manager

class AppointmentService:
    """
    Manages Token Generation, dynamic OPD Queue Prioritization,
    Slot Scheduling, QR Verification, and Real-Time State Lifecycle.
    Synchronized with Supabase DB pool and local failover store.
    """

    # Synchronized in-memory token registry
    _tokens: Dict[str, TokenResponse] = {}
    _appointments: Dict[str, AppointmentDetails] = {}

    # Standard Department room & doctor mappings
    _dept_rooms = {
        "dept-cardio": {"room": "Room 204, Block B", "doctor": "Dr. Rajesh Sharma (Senior Cardiologist)"},
        "cardio": {"room": "Room 204, Block B", "doctor": "Dr. Rajesh Sharma (Senior Cardiologist)"},
        "dept-genmed": {"room": "Room 102, Block A", "doctor": "Dr. Harpreet Singh (General Medicine)"},
        "genmed": {"room": "Room 102, Block A", "doctor": "Dr. Harpreet Singh (General Medicine)"},
        "dept-ortho": {"room": "Room 108, Block C", "doctor": "Dr. Vikram Sethi (Orthopedics)"},
        "ortho": {"room": "Room 108, Block C", "doctor": "Dr. Vikram Sethi (Orthopedics)"},
        "dept-peds": {"room": "Room 301, Block A", "doctor": "Dr. Priya Patel (Pediatrician)"},
        "peds": {"room": "Room 301, Block A", "doctor": "Dr. Priya Patel (Pediatrician)"},
        "dept-neuro-sjh": {"room": "Room 402, Super Speciality", "doctor": "Dr. Arjun Nambiar (Neurology)"},
        "neuro": {"room": "Room 402, Super Speciality", "doctor": "Dr. Arjun Nambiar (Neurology)"},
    }

    @classmethod
    def _normalize_dept(cls, dept: Optional[str]) -> str:
        if not dept:
            return "dept-cardio"
        dept_str = str(dept).strip().lower()
        if not dept_str.startswith("dept-") and "-" not in dept_str:
            return f"dept-{dept_str}"
        return dept_str

    @classmethod
    async def create_token(cls, req: TokenCreateRequest) -> TokenResponse:
        dept_id = cls._normalize_dept(req.department_id or req.department)
        now = datetime.utcnow()
        seq = abs(hash(req.patient_id + str(now))) % 900 + 100
        dept_prefix = (dept_id.split("-")[-1][:4] if "-" in dept_id else dept_id[:4]).upper()
        token_num = f"{dept_prefix}-{seq:03d}"
        token_id = f"tok_{uuid.uuid4().hex[:8]}"

        vuln = VulnerabilityFactors(
            is_senior=req.is_senior,
            is_pregnant=req.is_pregnant,
            is_differently_abled=req.is_differently_abled
        )

        token_item = QueueTokenItem(
            token_id=token_id,
            token_number=token_num,
            patient_id=req.patient_id,
            hospital_id=req.hospital_id or "hosp-001",
            department_id=dept_id,
            triage_level=req.triage_score,
            vulnerability=vuln
        )

        pos = queue_engine.enqueue(token_item)
        est_wait = max(5, pos * 7)

        dept_info = cls._dept_rooms.get(dept_id, cls._dept_rooms.get(dept_id.replace("dept-", ""), {
            "room": "Room 101, Main Wing",
            "doctor": "Duty Medical Officer"
        }))

        # Cryptographic verification hash for QR code scanning
        hash_payload = f"{token_id}:{req.patient_id}:{dept_id}:{now.isoformat()}"
        qr_hash = hashlib.sha256(hash_payload.encode()).hexdigest()

        response = TokenResponse(
            id=token_id,
            token_id=token_id,
            token_number=token_num,
            patient_id=req.patient_id,
            hospital_id=req.hospital_id or "hosp-001",
            department=dept_id,
            department_id=dept_id,
            position=pos,
            estimated_wait_minutes=est_wait,
            assigned_room=dept_info["room"],
            assigned_doctor_name=dept_info["doctor"],
            priority_score=token_item.priority_score,
            status="waiting",
            issued_at=now,
            created_at=now,
            qr_hash=qr_hash,
            hash=qr_hash
        )

        # 1. Update in-memory registry
        cls._tokens[token_id] = response
        cls._tokens[token_num] = response

        # 2. Persist to Supabase tokens table
        supabase_pool.insert_token({
            "id": token_id,
            "token_id": token_id,
            "token_number": token_num,
            "patient_id": req.patient_id,
            "dept": dept_id,
            "department_id": dept_id,
            "hospital_id": req.hospital_id or "hosp-001",
            "qr_hash": qr_hash,
            "hash": qr_hash,
            "status": "waiting",
            "created_at": now.isoformat(),
            "assigned_room": dept_info["room"],
            "assigned_doctor_name": dept_info["doctor"],
            "priority_score": token_item.priority_score,
            "estimated_wait_minutes": est_wait
        }, service_role="patient")

        # 3. Broadcast real-time WebSocket creation event
        ws_event = {
            "event": "token_created",
            "token_id": token_id,
            "token_number": token_num,
            "patient_id": req.patient_id,
            "department": dept_id,
            "status": "waiting",
            "position": pos,
            "estimated_wait_minutes": est_wait,
            "assigned_room": dept_info["room"],
            "created_at": now.isoformat()
        }
        await ws_manager.broadcast([
            f"patient:{req.patient_id}",
            f"token:{token_id}",
            f"doctor:{dept_id}",
            f"doctor:{req.hospital_id or 'hosp-001'}:{dept_id}",
            "observer:global",
            "global"
        ], ws_event)

        return response

    @classmethod
    def generate_token(cls, req: TokenGenerateRequest) -> TokenResponse:
        import asyncio
        # Synchronous bridge for legacy callers
        dept_id = cls._normalize_dept(req.department_id or req.department)
        now = datetime.utcnow()
        seq = abs(hash(req.patient_id + str(now))) % 900 + 100
        dept_prefix = (dept_id.split("-")[-1][:4] if "-" in dept_id else dept_id[:4]).upper()
        token_num = f"{dept_prefix}-{seq:03d}"
        token_id = f"tok_{uuid.uuid4().hex[:8]}"

        vuln = VulnerabilityFactors(
            is_senior=req.is_senior,
            is_pregnant=req.is_pregnant,
            is_differently_abled=req.is_differently_abled
        )

        token_item = QueueTokenItem(
            token_id=token_id,
            token_number=token_num,
            patient_id=req.patient_id,
            hospital_id=req.hospital_id or "hosp-001",
            department_id=dept_id,
            triage_level=req.triage_score,
            vulnerability=vuln
        )

        pos = queue_engine.enqueue(token_item)
        est_wait = max(5, pos * 7)
        dept_info = cls._dept_rooms.get(dept_id, {"room": "Room 101, Main Wing", "doctor": "Duty Medical Officer"})
        hash_payload = f"{token_id}:{req.patient_id}:{dept_id}:{now.isoformat()}"
        qr_hash = hashlib.sha256(hash_payload.encode()).hexdigest()

        response = TokenResponse(
            id=token_id,
            token_id=token_id,
            token_number=token_num,
            patient_id=req.patient_id,
            hospital_id=req.hospital_id or "hosp-001",
            department=dept_id,
            department_id=dept_id,
            position=pos,
            estimated_wait_minutes=est_wait,
            assigned_room=dept_info["room"],
            assigned_doctor_name=dept_info["doctor"],
            priority_score=token_item.priority_score,
            status="waiting",
            issued_at=now,
            created_at=now,
            qr_hash=qr_hash,
            hash=qr_hash
        )

        cls._tokens[token_id] = response
        cls._tokens[token_num] = response

        supabase_pool.insert_token({
            "id": token_id,
            "token_id": token_id,
            "token_number": token_num,
            "patient_id": req.patient_id,
            "dept": dept_id,
            "department_id": dept_id,
            "hospital_id": req.hospital_id or "hosp-001",
            "qr_hash": qr_hash,
            "hash": qr_hash,
            "status": "waiting",
            "created_at": now.isoformat(),
            "assigned_room": dept_info["room"],
            "assigned_doctor_name": dept_info["doctor"],
            "priority_score": token_item.priority_score,
            "estimated_wait_minutes": est_wait
        }, service_role="patient")

        return response

    @classmethod
    def get_token_by_id(cls, token_id: str) -> Optional[TokenResponse]:
        if token_id in cls._tokens:
            return cls._tokens[token_id]

        db_tok = supabase_pool.get_token_by_id(token_id, service_role="doctor")
        if db_tok:
            try:
                dept_val = db_tok.get("dept") or db_tok.get("department_id") or "dept-cardio"
                created_at_dt = datetime.utcnow()
                if db_tok.get("created_at"):
                    try:
                        created_at_dt = datetime.fromisoformat(db_tok["created_at"].replace("Z", "+00:00"))
                    except Exception:
                        pass
                
                resp = TokenResponse(
                    id=db_tok.get("id") or db_tok.get("token_id"),
                    token_id=db_tok.get("id") or db_tok.get("token_id"),
                    token_number=db_tok.get("token_number", "TOKEN"),
                    patient_id=db_tok.get("patient_id", "patient"),
                    hospital_id=db_tok.get("hospital_id", "hosp-001"),
                    department=dept_val,
                    department_id=dept_val,
                    position=1,
                    estimated_wait_minutes=db_tok.get("estimated_wait_minutes", 10),
                    assigned_room=db_tok.get("assigned_room", "Room 101"),
                    assigned_doctor_name=db_tok.get("assigned_doctor_name", "Duty Doctor"),
                    priority_score=db_tok.get("priority_score", 1.0),
                    status=db_tok.get("status", "waiting").lower(),
                    issued_at=created_at_dt,
                    created_at=created_at_dt,
                    qr_hash=db_tok.get("hash") or db_tok.get("qr_hash"),
                    hash=db_tok.get("hash") or db_tok.get("qr_hash")
                )
                cls._tokens[token_id] = resp
                return resp
            except Exception:
                pass

        return None

    @classmethod
    def get_active_tokens_by_patient(cls, patient_id: str) -> List[TokenResponse]:
        return [
            tok for tok in cls._tokens.values()
            if tok.patient_id == patient_id and tok.status in ("waiting", "scanned_by_staff", "in_consultation", "issued", "scanned", "next")
        ]

    @classmethod
    async def scan_token(cls, req: TokenScanRequest) -> TokenScanResponse:
        """
        Validates QR verification hash against DB, checks duplicate/cancelled/expired status,
        updates status to 'scanned_by_staff' in DB, and broadcasts WebSocket events to
        patient, doctor, and observer portals simultaneously.
        """
        query_key = req.token_id or req.token_number or req.token or req.tokenId or req.tokenNumber
        token = cls._tokens.get(query_key) if query_key else None
        
        if not token and query_key:
            token = cls.get_token_by_id(query_key)

        if not token and (req.hash or req.qr_hash):
            search_h = req.hash or req.qr_hash
            for t in cls._tokens.values():
                if (t.hash and t.hash == search_h) or (t.qr_hash and t.qr_hash == search_h):
                    token = t
                    break

        if not token:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Token '{query_key or 'unknown'}' not found in active hospital registry"
            )

        # 1. Cryptographic QR Hash Validation (if hash was provided in request)
        provided_hash = req.qr_hash or req.hash
        expected_hash = token.qr_hash or token.hash
        if provided_hash and expected_hash and provided_hash != expected_hash:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid QR verification hash error. Token integrity check failed."
            )

        # 2. Status Validation
        current_status = token.status.lower()
        if current_status in ("scanned", "scanned_by_staff", "in_consultation"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Token {token.token_number} has already been scanned at turnstile."
            )
        if current_status == "cancelled":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Token {token.token_number} is cancelled and cannot be scanned."
            )
        if current_status == "completed":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Token {token.token_number} has already completed consultation."
            )

        # 3. Expiration Check (Valid for 24 hours)
        now = datetime.utcnow()
        if token.issued_at and (now - token.issued_at.replace(tzinfo=None)) > timedelta(hours=24):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Token {token.token_number} has expired (>24 hours). Please generate a new OPD pass."
            )

        # 4. Update status to 'scanned_by_staff'
        scanner_identity = req.scanned_by or req.scanner_id or "turnstile-guard"
        now_iso = req.timestamp or now.isoformat()
        token.status = "scanned_by_staff"
        token.scanned_at = now
        token.scanned_by = scanner_identity
        cls._tokens[token.token_id] = token
        cls._tokens[token.token_number] = token

        # 5. Persist to Supabase
        supabase_pool.update_token_scanned(
            token_id=token.token_id,
            scanned_by=scanner_identity,
            timestamp=now_iso,
            service_role="android_scanner"
        )

        # Patient name lookup
        patient_name = "Patient"
        from services.patient_service.service import PatientService
        try:
            pat = await PatientService.get_patient_by_id(token.patient_id)
            if pat:
                patient_name = pat.full_name
        except Exception:
            pass

        # 6. Broadcast WebSocket events to Patient, Doctor, and Observer
        ws_event = {
            "event": "token_scanned",
            "token_id": token.token_id,
            "token_number": token.token_number,
            "patient_id": token.patient_id,
            "patient_name": patient_name,
            "department": token.department_id,
            "dept": token.department_id,
            "hospital_id": token.hospital_id,
            "status": "scanned_by_staff",
            "scanned_at": now_iso,
            "scanned_by": scanner_identity,
            "assigned_room": token.assigned_room,
            "assigned_doctor_name": token.assigned_doctor_name,
            "timestamp": now_iso,
            "message": f"Token {token.token_number} scanned by {scanner_identity}. Patient verified and waiting at door."
        }

        await ws_manager.broadcast([
            f"patient:{token.patient_id}",
            f"token:{token.token_id}",
            f"doctor:{token.department_id}",
            f"doctor:{token.hospital_id}:{token.department_id}",
            "observer:global",
            "global"
        ], ws_event)

        return TokenScanResponse(
            status="ok",
            patient_name=patient_name,
            dept=token.department_id,
            token_id=token.token_id,
            token_number=token.token_number,
            token_status="scanned_by_staff",
            message=f"Token {token.token_number} verified and scanned successfully."
        )

    @classmethod
    async def complete_token(cls, token_id: str) -> TokenCompleteResponse:
        """
        Transitions token status to 'completed' in DB and broadcasts completion event
        to patient, doctor console, and govt observer portal simultaneously.
        """
        token = cls.get_token_by_id(token_id)
        if not token:
            for t in cls._tokens.values():
                if t.token_number == token_id or t.token_id == token_id:
                    token = t
                    break

        if not token:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Token '{token_id}' not found"
            )

        now = datetime.utcnow()
        now_iso = now.isoformat()
        token.status = "completed"
        token.completed_at = now
        cls._tokens[token.token_id] = token
        cls._tokens[token.token_number] = token

        # Update in Supabase
        supabase_pool.update_token_status(token.token_id, "completed", service_role="doctor")

        # Broadcast completion WebSocket event
        ws_event = {
            "event": "token_completed",
            "token_id": token.token_id,
            "token_number": token.token_number,
            "patient_id": token.patient_id,
            "department": token.department_id,
            "dept": token.department_id,
            "hospital_id": token.hospital_id,
            "status": "completed",
            "completed_at": now_iso,
            "timestamp": now_iso,
            "message": f"Consultation for token {token.token_number} has been completed."
        }

        await ws_manager.broadcast([
            f"patient:{token.patient_id}",
            f"token:{token.token_id}",
            f"doctor:{token.department_id}",
            f"doctor:{token.hospital_id}:{token.department_id}",
            "observer:global",
            "global"
        ], ws_event)

        return TokenCompleteResponse(
            status="ok",
            token_id=token.token_id,
            token_number=token.token_number,
            token_status="completed",
            completed_at=now_iso,
            message="Consultation completed successfully."
        )

    @classmethod
    def get_available_slots(cls, req: SlotAvailabilityRequest) -> List[SlotItem]:
        dept_info = cls._dept_rooms.get(cls._normalize_dept(req.department_id), {"doctor": "Duty Medical Officer"})
        doctor_name = dept_info["doctor"]

        return [
            SlotItem(slot_id="slot-0900", start_time="09:00 AM", end_time="09:30 AM", doctor_id="doc-001", doctor_name=doctor_name, available_tokens=4, is_available=True),
            SlotItem(slot_id="slot-0930", start_time="09:30 AM", end_time="10:00 AM", doctor_id="doc-001", doctor_name=doctor_name, available_tokens=2, is_available=True),
            SlotItem(slot_id="slot-1000", start_time="10:00 AM", end_time="10:30 AM", doctor_id="doc-001", doctor_name=doctor_name, available_tokens=5, is_available=True),
            SlotItem(slot_id="slot-1100", start_time="11:00 AM", end_time="11:30 AM", doctor_id="doc-001", doctor_name=doctor_name, available_tokens=1, is_available=True),
            SlotItem(slot_id="slot-1400", start_time="02:00 PM", end_time="02:30 PM", doctor_id="doc-001", doctor_name=doctor_name, available_tokens=6, is_available=True),
        ]

    @classmethod
    async def book_appointment(cls, req: AppointmentBookingRequest) -> AppointmentDetails:
        dept_id = cls._normalize_dept(req.department_id or req.department)
        tok_req = TokenCreateRequest(
            patient_id=req.patient_id,
            hospital_id=req.hospital_id or "hosp-001",
            department_id=dept_id,
            department=dept_id,
            triage_score=req.triage_score,
            is_senior=req.is_senior,
            is_pregnant=req.is_pregnant,
            is_differently_abled=req.is_differently_abled
        )
        token_res = await cls.create_token(tok_req)

        dept_info = cls._dept_rooms.get(dept_id, {"room": "Room 101", "doctor": "Duty Medical Officer"})
        appointment_id = f"apt_{uuid.uuid4().hex[:8]}"
        apt_date = req.appointment_date or datetime.utcnow().strftime("%Y-%m-%d")

        app_details = AppointmentDetails(
            appointment_id=appointment_id,
            token_id=token_res.token_id,
            token_number=token_res.token_number,
            patient_id=req.patient_id,
            hospital_id=req.hospital_id or "hosp-001",
            hospital_name="AIIMS New Delhi - Apex Trauma & OPD Center",
            department_id=dept_id,
            department_name=dept_id.replace("dept-", "").capitalize() + " Department",
            doctor_id="doc-001",
            doctor_name=dept_info["doctor"],
            appointment_date=apt_date,
            time_slot="09:30 AM - 10:00 AM",
            consultation_type=req.consultation_type,
            reason_for_visit=req.reason_for_visit or "General OPD Consultation",
            status="BOOKED",
            created_at=datetime.utcnow(),
            qr_hash=token_res.qr_hash,
            hash=token_res.qr_hash
        )

        cls._appointments[appointment_id] = app_details
        return app_details

    @classmethod
    def cancel_token(cls, token_id: str) -> bool:
        token = cls.get_token_by_id(token_id)
        if token:
            token.status = "cancelled"
            cls._tokens[token.token_id] = token
            cls._tokens[token.token_number] = token
            supabase_pool.update_token_status(token.token_id, "cancelled", service_role="doctor")
            return True
        return False

    @classmethod
    def get_department_queue_status(cls, hospital_id: str, department_id: str) -> QueueStatusResponse:
        dept_id = cls._normalize_dept(department_id)
        all_dept_tokens = [
            t for t in cls._tokens.values()
            if (t.department_id == dept_id or t.department == dept_id) and t.status in ("waiting", "scanned_by_staff", "in_consultation")
        ]

        waiting_tokens = [t.token_number for t in all_dept_tokens if t.status in ("waiting", "scanned_by_staff")]
        in_consult = [t.token_number for t in all_dept_tokens if t.status == "in_consultation"]
        current_token = in_consult[0] if in_consult else (waiting_tokens[0] if waiting_tokens else None)

        return QueueStatusResponse(
            hospital_id=hospital_id,
            department_id=dept_id,
            total_waiting=len(waiting_tokens),
            current_serving_token=current_token,
            next_up_tokens=waiting_tokens[:3],
            average_wait_minutes=max(5, len(waiting_tokens) * 6)
        )
