"""
Equipment / resource availability registry, referenced by business-rules.md
Section 3.2. Each specialty has a set of required equipment/resources; a
facility's availability for that specialty is tracked per equipment item
with a capacity count. "Available" means capacity > 0 for all required
items of that specialty (a simplification for the prototype).
"""

from __future__ import annotations

# specialty -> list of required equipment/resource keys
REQUIRED_EQUIPMENT_FOR_SPECIALTY: dict[str, list[str]] = {
    "cardiology": ["cath_lab"],
    "neurology": ["ct_scanner"],
    "neurosurgery": ["ct_scanner", "or_suite"],
    "trauma_surgery": ["or_suite", "blood_bank"],
    "orthopedics": ["or_suite"],
    "general_surgery": ["or_suite"],
    "obstetrics": ["delivery_suite"],
    "pediatrics": [],
    "burns_unit": ["burns_bed", "or_suite"],
    "psychiatry": [],
    "internal_medicine": [],
    "general_medicine": [],
    "pulmonology": ["ventilator"],
    "nephrology": ["dialysis_unit"],
    "urology": ["or_suite"],
}

# facility_id -> equipment_key -> capacity (int, 0 = unavailable)
EQUIPMENT_CAPACITY: dict[str, dict[str, int]] = {
    "FAC-001": {
        "cath_lab": 1, "ct_scanner": 1, "or_suite": 2, "blood_bank": 1,
        "delivery_suite": 0, "burns_bed": 0, "ventilator": 3,
        "dialysis_unit": 2,
    },
    "FAC-002": {
        "cath_lab": 2, "ct_scanner": 2, "or_suite": 3, "blood_bank": 1,
        "delivery_suite": 2, "burns_bed": 4, "ventilator": 5,
        "dialysis_unit": 3,
    },
    "FAC-003": {
        "cath_lab": 0, "ct_scanner": 1, "or_suite": 1, "blood_bank": 0,
        "delivery_suite": 1, "burns_bed": 0, "ventilator": 1,
        "dialysis_unit": 0,
    },
    "FAC-004": {
        "cath_lab": 2, "ct_scanner": 2, "or_suite": 2, "blood_bank": 1,
        "delivery_suite": 0, "burns_bed": 3, "ventilator": 4,
        "dialysis_unit": 2,
    },
}


def get_required_equipment(specialty: str) -> list[str]:
    return REQUIRED_EQUIPMENT_FOR_SPECIALTY.get(specialty, [])


def is_equipment_available(facility_id: str, specialty: str) -> bool:
    """True if all required equipment/resources for `specialty` at
    `facility_id` have capacity > 0. A specialty with no required
    equipment is trivially available."""
    required = get_required_equipment(specialty)
    if not required:
        return True
    capacities = EQUIPMENT_CAPACITY.get(facility_id, {})
    return all(capacities.get(item, 0) > 0 for item in required)


def equipment_snapshot(facility_id: str, specialty: str) -> dict[str, int]:
    required = get_required_equipment(specialty)
    capacities = EQUIPMENT_CAPACITY.get(facility_id, {})
    return {item: capacities.get(item, 0) for item in required}
