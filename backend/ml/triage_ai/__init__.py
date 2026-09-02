"""
backend/ml/triage_ai
=====================

Rules-first (optionally ML-assisted) classifier that maps a patient's
self-reported triage questionnaire answers to a suggested risk category
(ROUTINE / PRIORITY / URGENT), per docs/business-rules.md Section 2.

Public entry point:

    from backend.ml.triage_ai import classify_triage

    result = classify_triage(questionnaire_input)
    result.suggested_risk_category   # RiskCategory
    result.requires_clinical_confirmation  # always True — see README
    result.disclaimer                # baked into the object, not bolted on

See README.md in this package for the important caveats about what this
module does and does NOT do — in particular, it is decision support for
a clinician, not an autonomous diagnostic or triage-assignment system.
"""

from .classifier import classify_triage
from .schema import (
    AgeGroup,
    ConsciousnessLevel,
    DurationOption,
    RiskCategory,
    SeverityOption,
    TriageAssessmentResult,
    TriageQuestionnaireInput,
)
from .config import FacilityTriageConfig, DEFAULT_CONFIG

__all__ = [
    "classify_triage",
    "AgeGroup",
    "ConsciousnessLevel",
    "DurationOption",
    "RiskCategory",
    "SeverityOption",
    "TriageAssessmentResult",
    "TriageQuestionnaireInput",
    "FacilityTriageConfig",
    "DEFAULT_CONFIG",
]
