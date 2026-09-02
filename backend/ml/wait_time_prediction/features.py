"""
features.py

Single source of truth for the feature schema shared between training and
inference, so the two never drift apart.
"""

from typing import List

NUMERIC_FEATURES: List[str] = [
    "queue_length",
    "doctors_available",
    "average_consultation_time",
    "patients_per_hour",
    "priority_cases",
    "hour",
]

CATEGORICAL_FEATURES: List[str] = [
    "department",
    "day",
]

ALL_FEATURES: List[str] = NUMERIC_FEATURES + CATEGORICAL_FEATURES

TARGET: str = "predicted_waiting_time"

# Fixed category vocabularies so one-hot encoding is stable across
# train/predict even if a batch is missing a category.
DEPARTMENTS = [
    "General Medicine",
    "Pediatrics",
    "Orthopedics",
    "Cardiology",
    "ENT",
    "Dermatology",
    "Emergency",
]

DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
