"""
Condition-to-specialty mapping table.

Per business-rules.md, rule 1: on triage completion (or triage upgrade),
the diagnosed/suspected condition must be looked up here to find the
specialty required to treat it. This is a simple seed table for the
prototype; in production this would live in a proper reference-data
store / admin-managed table.

Keys are normalized (lowercase, stripped) condition names or ICD-style
codes. Extend freely.
"""

from __future__ import annotations

CONDITION_TO_SPECIALTY: dict[str, str] = {
    # Cardiac
    "acute myocardial infarction": "cardiology",
    "stemi": "cardiology",
    "unstable angina": "cardiology",
    "arrhythmia": "cardiology",
    "heart failure": "cardiology",

    # Neuro
    "stroke": "neurology",
    "suspected stroke": "neurology",
    "seizure": "neurology",
    "head injury": "neurosurgery",
    "traumatic brain injury": "neurosurgery",

    # Trauma / surgical
    "polytrauma": "trauma_surgery",
    "fracture - compound": "orthopedics",
    "fracture - simple": "orthopedics",
    "appendicitis": "general_surgery",
    "acute abdomen": "general_surgery",

    # Obstetric
    "labor - active": "obstetrics",
    "obstetric hemorrhage": "obstetrics",
    "pre-eclampsia": "obstetrics",

    # Pediatric
    "pediatric respiratory distress": "pediatrics",
    "pediatric fever": "pediatrics",

    # Respiratory / general medicine
    "severe asthma exacerbation": "pulmonology",
    "pneumonia": "internal_medicine",
    "sepsis": "internal_medicine",

    # Psychiatric
    "acute psychosis": "psychiatry",
    "suicidal ideation": "psychiatry",

    # Renal
    "acute kidney injury": "nephrology",
    "renal colic": "urology",

    # Burns
    "major burns": "burns_unit",

    # Default / fallback
    "general illness": "internal_medicine",
    "minor injury": "general_medicine",
}


def normalize_condition(condition: str) -> str:
    return condition.strip().lower()


def get_required_specialty(condition: str) -> str | None:
    """Return the specialty required to treat `condition`, or None if the
    condition is not in the mapping table (treated as an unmapped/unknown
    condition upstream)."""
    return CONDITION_TO_SPECIALTY.get(normalize_condition(condition))
