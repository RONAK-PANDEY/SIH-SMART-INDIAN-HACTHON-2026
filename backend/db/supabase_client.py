import logging
from typing import Dict, List, Optional, Any
from datetime import datetime
from config import settings

logger = logging.getLogger("smartcare.supabase")

try:
    from supabase import create_client, Client
    SUPABASE_AVAILABLE = True
except ImportError:
    SUPABASE_AVAILABLE = False
    Client = Any

class SupabaseKeyPoolManager:
    """
    Manages 6-member Supabase API key rotation pools with service-level quota isolation,
    round-robin load balancing, automatic failover, and in-memory local fallback.
    
    Key Allocations:
      - 'patient': Member 1 (Arpan) & Member 2 (Rishikesh) [Round-Robin]
      - 'doctor':  Member 3 (Kartik) & Member 4 (Alok) [Round-Robin]
      - 'observer': Member 5 (Ajay Kumar) [Dedicated]
      - 'android_scanner': Member 6 (Shristi) [Dedicated]
    """

    def __init__(self):
        self.pools: Dict[str, List[Dict[str, str]]] = {
            "patient": [
                {"member": "Arpan", "key": settings.SUPABASE_KEY_PATIENT_1},
                {"member": "Rishikesh", "key": settings.SUPABASE_KEY_PATIENT_2},
            ],
            "doctor": [
                {"member": "Kartik", "key": settings.SUPABASE_KEY_DOCTOR_1},
                {"member": "Alok", "key": settings.SUPABASE_KEY_DOCTOR_2},
            ],
            "observer": [
                {"member": "Ajay Kumar", "key": settings.SUPABASE_KEY_OBSERVER},
            ],
            "android_scanner": [
                {"member": "Shristi", "key": settings.SUPABASE_KEY_SCANNER},
            ],
        }

        self._indices: Dict[str, int] = {
            "patient": 0,
            "doctor": 0,
            "observer": 0,
            "android_scanner": 0,
        }

        # Cached client instances by key
        self._clients: Dict[str, Any] = {}
        # In-memory synchronized store for offline resilience
        self._in_memory_tokens: Dict[str, dict] = {}
        self._in_memory_users: Dict[str, dict] = {}

    def get_pool_status(self) -> Dict[str, Any]:
        """Returns the active status of all 4 service rotation pools"""
        return {
            role: {
                "active_member": pool[self._indices[role] % len(pool)]["member"],
                "total_members": len(pool),
                "current_index": self._indices[role]
            }
            for role, pool in self.pools.items()
        }

    def _get_next_key_info(self, service_role: str) -> Dict[str, str]:
        """Rotates to the next member key in the pool (Round-Robin)"""
        pool = self.pools.get(service_role, self.pools["patient"])
        idx = self._indices.get(service_role, 0)
        key_info = pool[idx % len(pool)]
        # Advance index for next call
        self._indices[service_role] = (idx + 1) % len(pool)
        return key_info

    def get_client(self, service_role: str = "patient") -> Optional[Any]:
        """Gets a Supabase client instance using the current pool key"""
        if not SUPABASE_AVAILABLE or not settings.SUPABASE_URL:
            return None

        # Check if URL is valid HTTP
        if not settings.SUPABASE_URL.startswith("http"):
            return None

        key_info = self._get_next_key_info(service_role)
        key = key_info["key"]

        if key in self._clients:
            return self._clients[key]

        try:
            client = create_client(settings.SUPABASE_URL, key)
            self._clients[key] = client
            return client
        except Exception as e:
            logger.warning(f"Failed to initialize Supabase client for member {key_info['member']}: {e}")
            return None

    # =========================================================================
    # User / Auth Repository Operations
    # =========================================================================

    def save_user(self, user_record: dict) -> dict:
        phone = user_record.get("phone")
        self._in_memory_users[phone] = user_record
        client = self.get_client("patient")
        if client:
            try:
                client.table("users").upsert(user_record).execute()
            except Exception as e:
                logger.warning(f"Supabase user upsert failed, using memory store: {e}")
        return user_record

    def get_user_by_phone(self, phone: str) -> Optional[dict]:
        if phone in self._in_memory_users:
            return self._in_memory_users[phone]
        client = self.get_client("patient")
        if client:
            try:
                res = client.table("users").select("*").eq("phone", phone).execute()
                if res.data and len(res.data) > 0:
                    self._in_memory_users[phone] = res.data[0]
                    return res.data[0]
            except Exception as e:
                logger.warning(f"Supabase user lookup failed: {e}")
        return None

    # =========================================================================
    # Token Repository Operations (with Automatic Failover & In-Memory Fallback)
    # =========================================================================

    def insert_token(self, token_record: dict, service_role: str = "patient") -> dict:
        """
        Inserts a newly issued token into the Supabase 'tokens' table.
        Rotates key in the 'patient' pool. Falls back to in-memory store.
        """
        token_id = token_record.get("id") or token_record.get("token_id")
        # Store in memory for resilience
        self._in_memory_tokens[token_id] = token_record
        if token_record.get("token_number"):
            self._in_memory_tokens[token_record.get("token_number")] = token_record

        client = self.get_client(service_role)
        if client:
            try:
                # Prepare payload matching table schema
                db_payload = {
                    "id": token_id,
                    "token_number": token_record.get("token_number"),
                    "patient_id": token_record.get("patient_id"),
                    "dept": token_record.get("dept") or token_record.get("department_id") or token_record.get("department"),
                    "hospital_id": token_record.get("hospital_id", "hosp-001"),
                    "hash": token_record.get("qr_hash") or token_record.get("hash"),
                    "status": (token_record.get("status") or "waiting").lower(),
                    "assigned_room": token_record.get("assigned_room"),
                    "assigned_doctor_name": token_record.get("assigned_doctor_name"),
                    "priority_score": token_record.get("priority_score", 1.0),
                    "estimated_wait_minutes": token_record.get("estimated_wait_minutes", 15),
                    "created_at": token_record.get("created_at") or datetime.utcnow().isoformat()
                }
                res = client.table("tokens").insert(db_payload).execute()
                if res.data and len(res.data) > 0:
                    merged = {**token_record, **res.data[0]}
                    self._in_memory_tokens[token_id] = merged
                    return merged
            except Exception as e:
                logger.warning(f"Supabase insert failed, using fallback in-memory: {e}")

        return token_record

    def get_token_by_id(self, token_id: str, service_role: str = "doctor") -> Optional[dict]:
        """
        Retrieves a token by ID from Supabase or in-memory fallback.
        """
        # In-memory fast lookup
        if token_id in self._in_memory_tokens:
            return self._in_memory_tokens[token_id]

        client = self.get_client(service_role)
        if client:
            try:
                res = client.table("tokens").select("*").eq("id", token_id).execute()
                if res.data and len(res.data) > 0:
                    self._in_memory_tokens[token_id] = res.data[0]
                    return res.data[0]
                # Also try matching on token_number
                res2 = client.table("tokens").select("*").eq("token_number", token_id).execute()
                if res2.data and len(res2.data) > 0:
                    self._in_memory_tokens[token_id] = res2.data[0]
                    return res2.data[0]
            except Exception as e:
                logger.warning(f"Supabase query failed, checking in-memory: {e}")

        # In-memory fallback iteration
        for tok in self._in_memory_tokens.values():
            if tok.get("token_number") == token_id or tok.get("id") == token_id or tok.get("token_id") == token_id:
                return tok

        return None

    def update_token_scanned(
        self,
        token_id: str,
        scanned_by: str,
        timestamp: Optional[str] = None,
        service_role: str = "android_scanner"
    ) -> Optional[dict]:
        """
        Updates token status to 'scanned_by_staff' when verified by the Android QR scanner.
        Uses the dedicated Android Scanner pool key (Member 6 Shristi).
        """
        now_iso = timestamp or datetime.utcnow().isoformat()
        
        # Update in-memory
        local_tok = self.get_token_by_id(token_id)
        if local_tok:
            local_tok["status"] = "scanned_by_staff"
            local_tok["scanned_at"] = now_iso
            local_tok["scanned_by"] = scanned_by
            tid = local_tok.get("id") or local_tok.get("token_id") or token_id
            self._in_memory_tokens[tid] = local_tok

        client = self.get_client(service_role)
        if client:
            try:
                res = client.table("tokens").update({
                    "status": "scanned_by_staff",
                    "scanned_at": now_iso,
                    "scanned_by": scanned_by
                }).eq("id", token_id).execute()
                if res.data and len(res.data) > 0:
                    return res.data[0]
            except Exception as e:
                logger.warning(f"Supabase scan update failed, updated in-memory: {e}")

        return local_tok

    def update_token_status(
        self,
        token_id: str,
        new_status: str,
        service_role: str = "doctor"
    ) -> Optional[dict]:
        """Updates token lifecycle status (waiting, scanned_by_staff, in_consultation, completed, cancelled)"""
        local_tok = self.get_token_by_id(token_id)
        now_iso = datetime.utcnow().isoformat()
        if local_tok:
            local_tok["status"] = new_status.lower()
            if new_status.lower() == "completed":
                local_tok["completed_at"] = now_iso
            tid = local_tok.get("id") or local_tok.get("token_id") or token_id
            self._in_memory_tokens[tid] = local_tok

        client = self.get_client(service_role)
        if client:
            try:
                payload = {"status": new_status.lower()}
                if new_status.lower() == "completed":
                    payload["completed_at"] = now_iso
                res = client.table("tokens").update(payload).eq("id", token_id).execute()
                if res.data and len(res.data) > 0:
                    return res.data[0]
            except Exception as e:
                logger.warning(f"Supabase status update failed: {e}")

        return local_tok

    def list_tokens_for_dept(
        self,
        dept: str,
        hospital_id: str = "hosp-001",
        service_role: str = "doctor"
    ) -> List[dict]:
        """Lists active queue tokens for a department"""
        client = self.get_client(service_role)
        if client:
            try:
                res = client.table("tokens").select("*").eq("dept", dept).execute()
                if res.data:
                    return res.data
            except Exception as e:
                logger.warning(f"Supabase list failed: {e}")

        # In-memory fallback
        return [
            t for t in self._in_memory_tokens.values()
            if (t.get("dept") == dept or t.get("department_id") == dept or t.get("department") == dept)
        ]

    def list_all_tokens(self) -> List[dict]:
        """Returns all tokens for observer dashboard"""
        client = self.get_client("observer")
        if client:
            try:
                res = client.table("tokens").select("*").order("created_at", desc=True).limit(50).execute()
                if res.data:
                    return res.data
            except Exception as e:
                logger.warning(f"Supabase list all tokens failed: {e}")
        return list(self._in_memory_tokens.values())

# Global Singleton Pool Manager
supabase_pool = SupabaseKeyPoolManager()
