"""
Department registry: for each facility, which specialties/departments
exist, whether they are `active`, and their staff roster with shift
windows (used to determine "on-shift" for the current time).

Shift times are stored as (start_hour, end_hour) in 24h local facility
time. A shift that wraps midnight (e.g. 20 -> 6) is supported.
"""

from __future__ import annotations
from datetime import datetime, time


class Staff:
    def __init__(self, staff_id: str, name: str, shift_start: int, shift_end: int):
        self.staff_id = staff_id
        self.name = name
        self.shift_start = shift_start  # hour 0-23
        self.shift_end = shift_end      # hour 0-23

    def is_on_shift(self, now: datetime) -> bool:
        current_hour = now.hour
        start, end = self.shift_start, self.shift_end
        if start == end:
            # 24h shift
            return True
        if start < end:
            return start <= current_hour < end
        # wraps past midnight, e.g. 20 -> 6
        return current_hour >= start or current_hour < end


# facility_id -> specialty -> {"active": bool, "staff": [Staff, ...]}
DEPARTMENT_REGISTRY: dict[str, dict[str, dict]] = {
    "FAC-001": {
        "cardiology": {"active": True, "staff": [
            Staff("S-101", "Dr. Rao", 8, 20),
            Staff("S-102", "Dr. Iyer", 20, 8),
        ]},
        "neurology": {"active": True, "staff": [
            Staff("S-103", "Dr. Chen", 9, 17),
        ]},
        "orthopedics": {"active": True, "staff": [
            Staff("S-104", "Dr. Singh", 0, 0),  # 24h
        ]},
        "internal_medicine": {"active": True, "staff": [
            Staff("S-105", "Dr. Patel", 0, 0),
        ]},
        "general_medicine": {"active": True, "staff": [
            Staff("S-106", "Dr. Mehta", 0, 0),
        ]},
        "obstetrics": {"active": False, "staff": []},
        "psychiatry": {"active": True, "staff": [
            Staff("S-107", "Dr. Kapoor", 9, 21),
        ]},
        "neurosurgery": {"active": False, "staff": []},
        "trauma_surgery": {"active": True, "staff": []},  # active dept, currently unstaffed
        "general_surgery": {"active": True, "staff": [
            Staff("S-108", "Dr. Nair", 8, 22),
        ]},
        "pediatrics": {"active": True, "staff": [
            Staff("S-109", "Dr. Bose", 9, 18),
        ]},
        "pulmonology": {"active": True, "staff": [
            Staff("S-110", "Dr. Verma", 8, 16),
        ]},
        "nephrology": {"active": True, "staff": [
            Staff("S-111", "Dr. Gupta", 9, 17),
        ]},
        "urology": {"active": True, "staff": [
            Staff("S-112", "Dr. Rao", 9, 17),
        ]},
        "burns_unit": {"active": False, "staff": []},
    },
    "FAC-002": {
        "cardiology": {"active": True, "staff": [
            Staff("S-201", "Dr. Fernandes", 0, 0),
        ]},
        "neurology": {"active": True, "staff": [
            Staff("S-202", "Dr. Roy", 8, 20),
        ]},
        "neurosurgery": {"active": True, "staff": [
            Staff("S-203", "Dr. Malhotra", 8, 20),
        ]},
        "obstetrics": {"active": True, "staff": [
            Staff("S-204", "Dr. Sen", 0, 0),
        ]},
        "trauma_surgery": {"active": True, "staff": [
            Staff("S-205", "Dr. D'Souza", 0, 0),
        ]},
        "orthopedics": {"active": True, "staff": [
            Staff("S-206", "Dr. Anand", 8, 20),
        ]},
        "internal_medicine": {"active": True, "staff": [
            Staff("S-207", "Dr. Joshi", 0, 0),
        ]},
        "pediatrics": {"active": True, "staff": [
            Staff("S-208", "Dr. Kulkarni", 8, 20),
        ]},
        "burns_unit": {"active": True, "staff": [
            Staff("S-209", "Dr. Pillai", 8, 20),
        ]},
        "psychiatry": {"active": False, "staff": []},
        "general_surgery": {"active": True, "staff": [
            Staff("S-210", "Dr. Menon", 8, 22),
        ]},
        "pulmonology": {"active": False, "staff": []},
        "nephrology": {"active": True, "staff": [
            Staff("S-211", "Dr. Bhat", 9, 17),
        ]},
        "urology": {"active": True, "staff": [
            Staff("S-212", "Dr. Shetty", 9, 17),
        ]},
        "general_medicine": {"active": True, "staff": [
            Staff("S-213", "Dr. Dutta", 0, 0),
        ]},
    },
    "FAC-003": {
        "cardiology": {"active": False, "staff": []},
        "orthopedics": {"active": True, "staff": [
            Staff("S-301", "Dr. Khan", 8, 18),
        ]},
        "internal_medicine": {"active": True, "staff": [
            Staff("S-302", "Dr. Reddy", 0, 0),
        ]},
        "general_medicine": {"active": True, "staff": [
            Staff("S-303", "Dr. Thomas", 0, 0),
        ]},
        "pediatrics": {"active": True, "staff": [
            Staff("S-304", "Dr. George", 8, 18),
        ]},
        "obstetrics": {"active": True, "staff": [
            Staff("S-305", "Dr. Jacob", 8, 18),
        ]},
        "general_surgery": {"active": True, "staff": [
            Staff("S-306", "Dr. Varghese", 8, 20),
        ]},
        "neurology": {"active": False, "staff": []},
        "psychiatry": {"active": True, "staff": [
            Staff("S-307", "Dr. Abraham", 9, 17),
        ]},
        "trauma_surgery": {"active": False, "staff": []},
        "neurosurgery": {"active": False, "staff": []},
        "pulmonology": {"active": True, "staff": [
            Staff("S-308", "Dr. Mathew", 8, 16),
        ]},
        "nephrology": {"active": False, "staff": []},
        "urology": {"active": True, "staff": [
            Staff("S-309", "Dr. Philip", 9, 17),
        ]},
        "burns_unit": {"active": False, "staff": []},
    },
    "FAC-004": {
        # Northside Specialty Hospital - strong in neuro/cardiac/burns
        "cardiology": {"active": True, "staff": [
            Staff("S-401", "Dr. Sharma", 0, 0),
        ]},
        "neurology": {"active": True, "staff": [
            Staff("S-402", "Dr. Kumar", 0, 0),
        ]},
        "neurosurgery": {"active": True, "staff": [
            Staff("S-403", "Dr. Chopra", 0, 0),
        ]},
        "burns_unit": {"active": True, "staff": [
            Staff("S-404", "Dr. Ahluwalia", 0, 0),
        ]},
        "trauma_surgery": {"active": True, "staff": [
            Staff("S-405", "Dr. Bajaj", 0, 0),
        ]},
        "orthopedics": {"active": True, "staff": [
            Staff("S-406", "Dr. Grewal", 8, 20),
        ]},
        "obstetrics": {"active": False, "staff": []},
        "internal_medicine": {"active": True, "staff": [
            Staff("S-407", "Dr. Kohli", 0, 0),
        ]},
        "pediatrics": {"active": False, "staff": []},
        "psychiatry": {"active": False, "staff": []},
        "general_surgery": {"active": True, "staff": [
            Staff("S-408", "Dr. Arora", 8, 22),
        ]},
        "pulmonology": {"active": True, "staff": [
            Staff("S-409", "Dr. Sinha", 8, 16),
        ]},
        "nephrology": {"active": True, "staff": [
            Staff("S-410", "Dr. Dutta", 9, 17),
        ]},
        "urology": {"active": True, "staff": [
            Staff("S-411", "Dr. Basu", 9, 17),
        ]},
        "general_medicine": {"active": True, "staff": [
            Staff("S-412", "Dr. Kaur", 0, 0),
        ]},
    },
}


def get_department(facility_id: str, specialty: str) -> dict | None:
    return DEPARTMENT_REGISTRY.get(facility_id, {}).get(specialty)


def is_specialty_active_and_staffed(facility_id: str, specialty: str, now: datetime) -> tuple[bool, bool]:
    """Returns (is_active, is_staffed_now)."""
    dept = get_department(facility_id, specialty)
    if dept is None:
        return False, False
    active = bool(dept.get("active"))
    if not active:
        return False, False
    staffed = any(s.is_on_shift(now) for s in dept.get("staff", []))
    return True, staffed
