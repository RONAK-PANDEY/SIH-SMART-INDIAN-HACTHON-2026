"""
Typed data contracts for the triage classifier.

`TriageQuestionnaireInput` mirrors the fields actually collected by the
patient-facing form (frontend/.../Triage.tsx), field-for-field, using the
same snake_case names the component already posts to the API:

    chief_complaint, duration, severity, fever, breathing_difficulty,
    chest_discomfort, has_injury, injury_details, consciousness,
    existing_conditions, age_group

No vital-sign fields (HR, BP, RR, SpO2, temperature) exist here because
the questionnaire never collects them — see README.md, "Known gap:
vitals", for how the rules engine handles that.

`TriageAssessmentResult` is the response object. The "not a diagnosis"
disclaimer and the clinical-confirmation flag are non-optional fields on
this object (not strings the caller has to remember to add), so it is
structurally impossible to serialize a result without them.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import Enum
from typing import List, Optional


# ---------------------------------------------------------------------------
# Enums — match the TypeScript union types in Triage.tsx exactly.
# ---------------------------------------------------------------------------

class DurationOption(str, Enum):
    LT_1H = "<1h"
    ONE_TO_6H = "1-6h"
    SIX_TO_24H = "6-24h"
    ONE_TO_3D = "1-3d"
    GT_3D = ">3d"


class SeverityOption(str, Enum):
    MILD = "mild"
    MODERATE = "moderate"
    SEVERE = "severe"


class ConsciousnessLevel(str, Enum):
    ALERT = "alert"
    DROWSY = "drowsy"
    UNRESPONSIVE = "unresponsive"


class AgeGroup(str, Enum):
    CHILD_0_12 = "child_0_12"
    TEEN_13_17 = "teen_13_17"
    ADULT_18_64 = "adult_18_64"
    SENIOR_65PLUS = "senior_65plus"


class RiskCategory(str, Enum):
    ROUTINE = "ROUTINE"
    PRIORITY = "PRIORITY"
    URGENT = "URGENT"

    @property
    def rank(self) -> int:
        """Higher = more urgent. Used for escalate-only comparisons."""
        return {"ROUTINE": 0, "PRIORITY": 1, "URGENT": 2}[self.value]


# ---------------------------------------------------------------------------
# Input
# ---------------------------------------------------------------------------

@dataclass(frozen=True)
class TriageQuestionnaireInput:
    """Field-for-field mirror of the Triage.tsx POST body."""

    chief_complaint: str
    duration: DurationOption
    severity: SeverityOption
    consciousness: ConsciousnessLevel
    age_group: AgeGroup

    fever: bool = False
    breathing_difficulty: bool = False
    chest_discomfort: bool = False
    has_injury: bool = False
    injury_details: Optional[str] = None
    existing_conditions: Optional[str] = None

    # Not part of the current Triage.tsx payload, but accepted if the
    # caller (e.g. a clinician-facing intake screen) has them — the rules
    # engine will use them when present and fall back to the coarse
    # self-report fields when they're absent. Keeping these optional
    # means this schema doesn't break when the frontend adds vitals
    # capture later (see README "Known gap: vitals").
    patient_id: Optional[str] = None
    heart_rate_bpm: Optional[int] = None
    systolic_bp_mmhg: Optional[int] = None
    respiratory_rate: Optional[int] = None
    spo2_percent: Optional[int] = None
    temperature_celsius: Optional[float] = None

    @classmethod
    def from_api_payload(cls, payload: dict) -> "TriageQuestionnaireInput":
        """Build from the exact JSON body Triage.tsx sends."""
        return cls(
            patient_id=payload.get("patient_id"),
            chief_complaint=payload["chief_complaint"],
            duration=DurationOption(payload["duration"]),
            severity=SeverityOption(payload["severity"]),
            consciousness=ConsciousnessLevel(payload["consciousness"]),
            age_group=AgeGroup(payload["age_group"]),
            fever=bool(payload.get("fever", False)),
            breathing_difficulty=bool(payload.get("breathing_difficulty", False)),
            chest_discomfort=bool(payload.get("chest_discomfort", False)),
            has_injury=bool(payload.get("has_injury", False)),
            injury_details=payload.get("injury_details"),
            existing_conditions=payload.get("existing_conditions"),
            heart_rate_bpm=payload.get("heart_rate_bpm"),
            systolic_bp_mmhg=payload.get("systolic_bp_mmhg"),
            respiratory_rate=payload.get("respiratory_rate"),
            spo2_percent=payload.get("spo2_percent"),
            temperature_celsius=payload.get("temperature_celsius"),
        )


# ---------------------------------------------------------------------------
# Output
# ---------------------------------------------------------------------------

DISCLAIMER_TEXT = (
    "This is an automated decision-support suggestion, not a medical "
    "diagnosis and not a finalized triage determination. Per facility "
    "policy, every patient's risk category must be confirmed or set by "
    "a clinical staff member (nurse or physician) before it is acted on. "
    "If the patient's condition changes at any point, escalate to staff "
    "immediately regardless of this result."
)


@dataclass(frozen=True)
class MatchedCriterion:
    """One rule that fired, for auditability and clinician review."""
    rule_id: str
    description: str
    category: RiskCategory


@dataclass(frozen=True)
class TriageAssessmentResult:
    """
    The response object. `disclaimer` and `requires_clinical_confirmation`
    are always populated by the classifier — there is no code path that
    produces a result without them.
    """

    suggested_risk_category: RiskCategory
    matched_criteria: List[MatchedCriterion]

    # Confidence in [0.0, 1.0] from the lightweight scoring layer.
    # None if the confidence layer was skipped (e.g. disabled in config).
    confidence: Optional[float]

    # Rules criteria that could NOT be evaluated because the questionnaire
    # doesn't collect the needed data (e.g. vitals, stroke signs). Surfaced
    # so a reviewing clinician knows what to specifically check for.
    unevaluable_red_flags: List[str]

    # Was a safety-net escalation applied (independent of the rules engine
    # verdict), and why? Mirrors the client-side hasRedFlags() escalation
    # in Triage.tsx, re-implemented authoritatively server-side.
    safety_escalated: bool
    safety_escalation_reason: Optional[str]

    # Every result requires clinical confirmation (see below), but some
    # cases warrant jumping the queue for that review rather than waiting
    # for routine review — e.g. self-reported "severe" pain that doesn't
    # match a specific structured URGENT criterion, unevaluable red flags
    # a clinician should specifically screen for, or low model confidence.
    expedited_review_recommended: bool
    expedited_review_reasons: List[str]

    # --- Non-negotiable fields -------------------------------------------------
    is_diagnosis: bool = field(default=False, init=False)
    requires_clinical_confirmation: bool = field(default=True, init=False)
    disclaimer: str = field(default=DISCLAIMER_TEXT, init=False)

    engine_version: str = "triage_ai-1.0.0"
    assessed_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))

    def to_dict(self) -> dict:
        """JSON-serializable representation for the API layer."""
        return {
            "suggested_risk_category": self.suggested_risk_category.value,
            "matched_criteria": [
                {
                    "rule_id": c.rule_id,
                    "description": c.description,
                    "category": c.category.value,
                }
                for c in self.matched_criteria
            ],
            "confidence": self.confidence,
            "unevaluable_red_flags": self.unevaluable_red_flags,
            "safety_escalated": self.safety_escalated,
            "safety_escalation_reason": self.safety_escalation_reason,
            "expedited_review_recommended": self.expedited_review_recommended,
            "expedited_review_reasons": self.expedited_review_reasons,
            "is_diagnosis": self.is_diagnosis,
            "requires_clinical_confirmation": self.requires_clinical_confirmation,
            "disclaimer": self.disclaimer,
            "engine_version": self.engine_version,
            "assessed_at": self.assessed_at.isoformat(),
        }
