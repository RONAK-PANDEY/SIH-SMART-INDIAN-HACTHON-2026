"""
Hospital Network & AI Load Balancing Service
Monitors queue congestion across connected city hospitals and provides intelligent
inter-hospital referral suggestions with distance, real-time wait times, and fast-track transfer tokens.
"""

from typing import List, Dict, Any

CITY_HOSPITALS: List[Dict[str, Any]] = [
    {
        "id": "hosp-aiims-delhi",
        "name": "AIIMS New Delhi (Apex Medical Center)",
        "city": "New Delhi",
        "address": "Ansari Nagar, New Delhi - 110029",
        "distance_km": 0.0,  # Reference hospital
        "active_queue_count": 48,
        "avg_wait_mins": 75,
        "status": "CONGESTED",
        "capacity_utilization": "94%",
        "emergency_beds_free": 2,
        "opd_active_doctors": 18
    },
    {
        "id": "hosp-safdarjung",
        "name": "Safdarjung Multi-Speciality Hospital",
        "city": "New Delhi",
        "address": "Ring Road, Opposite AIIMS, New Delhi - 110029",
        "distance_km": 1.2,
        "active_queue_count": 22,
        "avg_wait_mins": 25,
        "status": "OPTIMAL",
        "capacity_utilization": "60%",
        "emergency_beds_free": 14,
        "opd_active_doctors": 12
    },
    {
        "id": "hosp-ram-manohar-lohia",
        "name": "Dr. Ram Manohar Lohia (RML) Hospital",
        "city": "New Delhi",
        "address": "Baba Kharak Singh Marg, Connaught Place, New Delhi - 110001",
        "distance_km": 4.8,
        "active_queue_count": 16,
        "avg_wait_mins": 18,
        "status": "LOW_CONGESTION",
        "capacity_utilization": "45%",
        "emergency_beds_free": 20,
        "opd_active_doctors": 15
    },
    {
        "id": "hosp-gtb-hospital",
        "name": "Guru Teg Bahadur (GTB) Hospital",
        "city": "New Delhi",
        "address": "Dilshad Garden, Shahdara, Delhi - 110095",
        "distance_km": 8.5,
        "active_queue_count": 12,
        "avg_wait_mins": 14,
        "status": "LOW_CONGESTION",
        "capacity_utilization": "38%",
        "emergency_beds_free": 28,
        "opd_active_doctors": 14
    },
    {
        "id": "hosp-max-saket",
        "name": "Max Super Speciality Partner Hospital",
        "city": "New Delhi",
        "address": "1, 2, Press Enclave Marg, Saket, New Delhi - 110017",
        "distance_km": 5.1,
        "active_queue_count": 9,
        "avg_wait_mins": 10,
        "status": "OPTIMAL",
        "capacity_utilization": "30%",
        "emergency_beds_free": 18,
        "opd_active_doctors": 10
    }
]


class HospitalNetworkService:
    @staticmethod
    def get_all_hospitals() -> List[Dict[str, Any]]:
        return CITY_HOSPITALS

    @staticmethod
    def check_hospital_load_and_suggest_referral(
        current_hospital_id: str = "hosp-aiims-delhi",
        department_id: str = "dept-genmed"
    ) -> Dict[str, Any]:
        """
        Analyzes the congestion in current hospital. If wait time > 40 mins or queue count > 20,
        it suggests optimal nearby partner hospitals with lower wait times.
        """
        current_hosp = next((h for h in CITY_HOSPITALS if h["id"] == current_hospital_id), CITY_HOSPITALS[0])
        is_high_load = current_hosp["avg_wait_mins"] >= 40 or current_hosp["active_queue_count"] >= 20

        # Filter alternatives sorted by avg_wait_mins and distance
        alternatives = [h for h in CITY_HOSPITALS if h["id"] != current_hosp["id"]]
        alternatives.sort(key=lambda x: (x["avg_wait_mins"], x["distance_km"]))

        best_alternative = alternatives[0] if alternatives else None
        time_saved_mins = max(0, current_hosp["avg_wait_mins"] - best_alternative["avg_wait_mins"]) if best_alternative else 0

        return {
            "is_congested": is_high_load,
            "current_hospital": current_hosp,
            "time_saved_mins": time_saved_mins,
            "recommendation_reason": (
                f"Current hospital ({current_hosp['name']}) has an estimated wait time of {current_hosp['avg_wait_mins']} mins. "
                f"We recommend transferring your queue token to {best_alternative['name']} ({best_alternative['distance_km']} km away) "
                f"to save ~{time_saved_mins} mins of waiting time."
                if is_high_load and best_alternative else "Current hospital load is within normal operating capacity."
            ),
            "suggested_alternatives": alternatives[:3]
        }
