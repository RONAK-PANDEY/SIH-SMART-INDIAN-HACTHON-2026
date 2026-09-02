"""
Facility master data and a static transfer distance/time matrix.

In production the distance/time would come from a routing service (e.g.
live traffic ETA). For the prototype we use a static symmetric matrix
of estimated transfer minutes between facilities.
"""

from __future__ import annotations

FACILITIES: dict[str, dict] = {
    "FAC-001": {"id": "FAC-001", "name": "City General Hospital"},
    "FAC-002": {"id": "FAC-002", "name": "St. Mary's Medical Center"},
    "FAC-003": {"id": "FAC-003", "name": "Riverside Community Hospital"},
    "FAC-004": {"id": "FAC-004", "name": "Northside Specialty Hospital"},
}

# Symmetric estimated transfer time in minutes between facility pairs.
_TRANSFER_MINUTES: dict[tuple[str, str], int] = {
    ("FAC-001", "FAC-002"): 18,
    ("FAC-001", "FAC-003"): 25,
    ("FAC-001", "FAC-004"): 40,
    ("FAC-002", "FAC-003"): 30,
    ("FAC-002", "FAC-004"): 22,
    ("FAC-003", "FAC-004"): 35,
}


def get_facility(facility_id: str) -> dict | None:
    return FACILITIES.get(facility_id)


def all_other_facilities(exclude_facility_id: str) -> list[str]:
    return [fid for fid in FACILITIES if fid != exclude_facility_id]


def estimated_transfer_minutes(from_facility_id: str, to_facility_id: str) -> int:
    if from_facility_id == to_facility_id:
        return 0
    key = (from_facility_id, to_facility_id)
    if key in _TRANSFER_MINUTES:
        return _TRANSFER_MINUTES[key]
    key = (to_facility_id, from_facility_id)
    if key in _TRANSFER_MINUTES:
        return _TRANSFER_MINUTES[key]
    # Unknown pair - large default so it sorts last.
    return 9999
