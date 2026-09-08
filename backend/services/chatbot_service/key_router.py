import time
import logging
import httpx
from typing import Dict, List, Optional, Tuple
from config import settings

logger = logging.getLogger("smartcare.chatbot")

class KeySlot:
    def __init__(self, member_name: str, key_value: str, rpm_limit: int = 15):
        self.member_name = member_name
        self.key_value = key_value.strip()
        self.rpm_limit = rpm_limit
        self.request_timestamps: List[float] = []
        self.total_requests_served = 0

    def is_available(self) -> bool:
        if not self.key_value:
            return False
        now = time.time()
        # Clean timestamps older than 60 seconds
        self.request_timestamps = [t for t in self.request_timestamps if now - t < 60.0]
        return len(self.request_timestamps) < self.rpm_limit

    def record_usage(self):
        now = time.time()
        self.request_timestamps.append(now)
        self.total_requests_served += 1

    @property
    def current_rpm_usage(self) -> int:
        now = time.time()
        self.request_timestamps = [t for t in self.request_timestamps if now - t < 60.0]
        return len(self.request_timestamps)

class GeminiMultiKeyRouter:
    """
    Manages a 6-key round-robin rotation pool across all 6 SIH team members
    with per-minute rate-limit isolation, automated failover, and fallback response engine.
    """
    def __init__(self):
        rpm = settings.GEMINI_RPM_LIMIT_PER_KEY
        self.slots: List[KeySlot] = [
            KeySlot("Member 1 (Arpan)", settings.GEMINI_KEY_1, rpm),
            KeySlot("Member 2 (Rishikesh)", settings.GEMINI_KEY_2, rpm),
            KeySlot("Member 3 (Kartik)", settings.GEMINI_KEY_3, rpm),
            KeySlot("Member 4 (Alok)", settings.GEMINI_KEY_4, rpm),
            KeySlot("Member 5 (Ajay Kumar)", settings.GEMINI_KEY_5, rpm),
            KeySlot("Member 6 (Shristi)", settings.GEMINI_KEY_6, rpm),
        ]
        self._current_index = 0

    def get_pool_status(self) -> List[Dict]:
        return [
            {
                "member": slot.member_name,
                "has_key": bool(slot.key_value),
                "rpm_used": slot.current_rpm_usage,
                "rpm_limit": slot.rpm_limit,
                "total_served": slot.total_requests_served
            }
            for slot in self.slots
        ]

    def _acquire_next_key(self) -> Optional[Tuple[KeySlot, int]]:
        num_slots = len(self.slots)
        for i in range(num_slots):
            idx = (self._current_index + i) % num_slots
            slot = self.slots[idx]
            if slot.is_available():
                self._current_index = (idx + 1) % num_slots
                slot.record_usage()
                return slot, idx
        return None

    async def generate_response(self, user_message: str, session_id: str = "default") -> Dict:
        """
        Routes the prompt to Google Gemini API using the next available key slot.
        Falls back intelligently if all keys are busy or unconfigured.
        """
        acquired = self._acquire_next_key()

        system_instruction = (
            "You are SmartCare AI, an empathetic, intelligent hospital queue assistant for the "
            "SmartCare Smart Hospital Queue & Healthcare Management System (SIH26133). "
            "You help patients understand how to get OPD tokens, how scannable QR passes work, "
            "what their token status means (waiting -> scanned_by_staff -> in_consultation -> completed), "
            "guide symptoms to the correct clinical department (e.g. Chest pain -> Cardiology, Fever -> General Medicine), "
            "and explain government priority rules (Senior Citizens, Pregnant women, PwD). "
            "Keep responses concise, clear, reassuring, and well-structured."
        )

        if acquired:
            slot, slot_idx = acquired
            logger.info(f"[GeminiRouter] Routing query using {slot.member_name} (Slot {slot_idx+1})")
            
            try:
                # Call Google Gemini API (gemini-1.5-flash)
                url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={slot.key_value}"
                payload = {
                    "contents": [
                        {
                            "parts": [
                                {"text": f"{system_instruction}\n\nUser Question: {user_message}"}
                            ]
                        }
                    ]
                }

                async with httpx.AsyncClient(timeout=10.0) as client:
                    resp = await client.post(url, json=payload)
                    if resp.status_code == 200:
                        data = resp.json()
                        candidates = data.get("candidates", [])
                        if candidates:
                            reply_text = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "")
                            if reply_text:
                                return {
                                    "status": "success",
                                    "reply": reply_text.strip(),
                                    "served_by": slot.member_name,
                                    "session_id": session_id,
                                    "fallback_used": False
                                }
                    else:
                        logger.warning(f"Gemini API error ({resp.status_code}): {resp.text}")
            except Exception as e:
                logger.warning(f"Gemini API request exception: {e}")

        # Intelligent Medical Rule-based Fallback
        fallback_reply = self._get_smart_fallback(user_message)
        return {
            "status": "success",
            "reply": fallback_reply,
            "served_by": "SmartCare Medical AI Engine (Local Fallback)",
            "session_id": session_id,
            "fallback_used": True
        }

    def _get_smart_fallback(self, query: str) -> str:
        q = query.lower()
        if "token" in q and ("get" in q or "book" in q or "how" in q or "generate" in q):
            return (
                "To get an OPD Queue Token:\n"
                "1. Go to **'Book OPD Token'** in your dashboard.\n"
                "2. Pick your health problem or clinical specialty (Cardiology, General Medicine, Orthopedics, Pediatrics, Neurology).\n"
                "3. Choose your preferred hospital and time slot, then click **'Generate OPD Token'**.\n"
                "4. Your real scannable QR pass will be created instantly with your estimated wait time."
            )
        elif "status" in q or "scanned" in q or "what does" in q or "stage" in q:
            return (
                "Your SmartCare OPD Token moves through 4 real-time stages:\n"
                "• **1. WAITING:** Your pass is generated and queued in the hospital database.\n"
                "• **2. SCANNED AT DOOR (`scanned_by_staff`):** Turnstile guard or Android scanner verified your QR code at the entrance.\n"
                "• **3. IN CONSULTATION:** The doctor called your token number into the consultation chamber.\n"
                "• **4. COMPLETED:** The doctor finished checkup, submitted digital notes, and unlocked your feedback survey."
            )
        elif "chest" in q or "heart" in q or "bp" in q or "palpitation" in q:
            return (
                "For symptoms like chest pain, rapid palpitations, or high blood pressure, please book an appointment with **Cardiology & Heart Care** (Room 204, AIIMS Apex Center with Dr. Rajesh Sharma). If you have sudden severe pain, please alert emergency triage immediately."
            )
        elif "fever" in q or "cough" in q or "flu" in q or "cold" in q or "weakness" in q:
            return (
                "For fever, body aches, seasonal flu, or general weakness, please select **General & Internal Medicine OPD** (Room 102 with Dr. Harpreet Singh)."
            )
        elif "bone" in q or "fracture" in q or "knee" in q or "joint" in q or "back pain" in q:
            return (
                "For bone pain, knee swelling, or joint stiffness, please book with **Orthopedics & Joint Care** (Room 108 with Dr. Vikram Sethi)."
            )
        elif "child" in q or "baby" in q or "infant" in q or "pediatric" in q or "vaccine" in q:
            return (
                "For infants and children under 14 years, please choose **Pediatrics & Child Health** (Room 301 with Dr. Priya Patel)."
            )
        elif "senior" in q or "pregnant" in q or "disability" in q or "priority" in q:
            return (
                "SmartCare applies automatic priority triage:\n"
                "• **P2 Priority:** Senior Citizens (Age 60+), Pregnant Mothers, and Persons with Disabilities (PwD) receive accelerated queue placement.\n"
                "• Ensure your priority checkboxes are selected in your profile to fast-track your appointment."
            )
        else:
            return (
                f"Hello! I am your SmartCare Hospital Queue Assistant. You can ask me:\n"
                "• *How do I get an OPD token?*\n"
                "• *What does my token status mean?*\n"
                "• *Which department should I consult for my symptoms?*\n"
                "• *How does the Android Turnstile QR scanner work?*"
            )

gemini_router = GeminiMultiKeyRouter()
