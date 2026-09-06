"""
Aadhaar & ABHA Government ID Authentication Service (Demo Simulation)
Provides simulated OTP verification, instant demographic extraction, photo/address fetching,
and automatic priority qualification mapping (Age 60+ Senior, PwD, Maternity).
"""

from typing import Dict, Any, Optional
import random

DEMO_CITIZENS: Dict[str, Dict[str, Any]] = {
    "982144321109": {
        "aadhaar_id": "982144321109",
        "abha_id": "ABHA-9821-4432-1109",
        "full_name": "Aarav Sharma",
        "gender": "Male",
        "dob": "1958-04-12",
        "age": 68,
        "phone": "+91 98765 43210",
        "address": "Flat 402, Royal Palms, Sector 62, Noida, UP - 201309",
        "photo_url": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
        "is_senior": True,
        "is_pregnant": False,
        "is_pwd": False,
        "blood_group": "B+"
    },
    "884210953218": {
        "aadhaar_id": "884210953218",
        "abha_id": "ABHA-8842-1095-3218",
        "full_name": "Pooja Verma",
        "gender": "Female",
        "dob": "1996-08-24",
        "age": 30,
        "phone": "+91 98112 34567",
        "address": "B-12, Green Park Extension, New Delhi - 110016",
        "photo_url": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
        "is_senior": False,
        "is_pregnant": True,
        "is_pwd": False,
        "blood_group": "O+"
    },
    "771923048512": {
        "aadhaar_id": "771923048512",
        "abha_id": "ABHA-7719-2304-8512",
        "full_name": "Rohan Deshmukh",
        "gender": "Male",
        "dob": "1992-11-05",
        "age": 33,
        "phone": "+91 99201 88472",
        "address": "Plot 104, Shivaji Nagar, Pune, Maharashtra - 411005",
        "photo_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
        "is_senior": False,
        "is_pregnant": False,
        "is_pwd": True,
        "disability_type": "Locomotor (45% UDID Certified)",
        "blood_group": "A+"
    },
    "663019482751": {
        "aadhaar_id": "663019482751",
        "abha_id": "ABHA-6630-1948-2751",
        "full_name": "Meera Nair",
        "gender": "Female",
        "dob": "1998-02-17",
        "age": 28,
        "phone": "+91 97451 22910",
        "address": "House 45, MG Road, Ernakulam, Kerala - 682016",
        "photo_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        "is_senior": False,
        "is_pregnant": False,
        "is_pwd": False,
        "blood_group": "AB+"
    }
}


class AadhaarABHAService:
    @staticmethod
    def send_otp(aadhaar_or_phone: str) -> Dict[str, Any]:
        """Simulates sending an OTP to the linked mobile number."""
        clean_id = aadhaar_or_phone.replace("-", "").replace(" ", "").replace("+91", "")
        # Default fallback demo OTP
        demo_otp = "123456"
        return {
            "status": "success",
            "message": f"Demo OTP successfully sent to mobile registered with Aadhaar ending in ...{clean_id[-4:] if len(clean_id) >= 4 else '0000'}",
            "demo_otp_hint": demo_otp,
            "aadhaar_query": clean_id
        }

    @staticmethod
    def verify_otp_and_fetch_profile(aadhaar_or_phone: str, otp: str) -> Dict[str, Any]:
        """Verifies OTP and returns government authorized demographic profile."""
        clean_id = aadhaar_or_phone.replace("-", "").replace(" ", "").replace("+91", "")
        
        # Check if in pre-configured demo citizens
        if clean_id in DEMO_CITIZENS:
            citizen = DEMO_CITIZENS[clean_id]
        else:
            # Generate deterministic realistic profile for any custom 12-digit Aadhaar
            age = (int(clean_id[-2:]) % 50) + 20 if clean_id[-2:].isdigit() else 35
            citizen = {
                "aadhaar_id": clean_id if len(clean_id) == 12 else "982144321109",
                "abha_id": f"ABHA-{clean_id[:4]}-{clean_id[4:8]}-{clean_id[8:]}" if len(clean_id) == 12 else "ABHA-9821-4432-1109",
                "full_name": "Citizen User",
                "gender": "Male",
                "dob": f"{2026 - age}-01-01",
                "age": age,
                "phone": f"+91 {clean_id[:10]}" if len(clean_id) >= 10 else "+91 98765 43210",
                "address": "Govt Verified Resident Address, Sector 12, New Delhi - 110001",
                "photo_url": "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
                "is_senior": age >= 60,
                "is_pregnant": False,
                "is_pwd": False,
                "blood_group": "O+"
            }

        return {
            "status": "authenticated",
            "auth_method": "Aadhaar UIDAI e-KYC Demo",
            "citizen_data": citizen,
            "priority_eligibility": {
                "senior_citizen": citizen["is_senior"],
                "maternal_priority": citizen["is_pregnant"],
                "pwd_priority": citizen["is_pwd"]
            }
        }
