"""
Lightweight confidence layer that sits ON TOP of the rules engine.

Important: this layer never overrides the rules engine's category. Per
business-rules.md's own model (a clinical staff member makes the actual
triage call, Section 2 preamble) and the "not a diagnosis" requirement,
an ML score here is a *confidence signal to help a clinician prioritize
their own review queue*, not a second vote on the category.

No training data was provided with this task, so `HeuristicConfidenceModel`
is a transparent, hand-tunable scorer (not a trained model) that estimates
"how much structured signal supports this verdict" — e.g. a ROUTINE verdict
built on mild severity + fully alert + no red-flag booleans is
high-confidence; a ROUTINE verdict where several fields are borderline or
missing is lower-confidence. It exists so the interface is stable: it is
built to be swapped for a real trained model (scikit-learn / a small
gradient-boosted tree / calibrated logistic regression) later without
touching any other module.

To plug in a trained model, implement `ConfidenceModel.score()` against
a persisted model artifact and register it in classifier.py — everything
else (rules engine, schema, disclaimers, review flags) stays the same.
"""

from __future__ import annotations

from abc import ABC, abstractmethod
from typing import List

from .schema import (
    ConsciousnessLevel,
    MatchedCriterion,
    RiskCategory,
    SeverityOption,
    TriageQuestionnaireInput,
)


class ConfidenceModel(ABC):
    @abstractmethod
    def score(
        self,
        inp: TriageQuestionnaireInput,
        category: RiskCategory,
        matched_criteria: List[MatchedCriterion],
    ) -> float:
        """Return a confidence score in [0.0, 1.0]."""
        raise NotImplementedError


class HeuristicConfidenceModel(ConfidenceModel):
    """
    Deterministic, explainable stand-in. Weights are hand-set, not learned.

    Signal sources:
    - Number of independent matched criteria supporting the verdict
      (more corroborating signals -> higher confidence)
    - Whether any matched criterion is flagged as a "conservative proxy"
      (i.e. its description says the questionnaire couldn't structurally
      confirm the real business-rules.md criterion) -> lowers confidence,
      since we know we're guessing at intent from a coarse field
    - Presence of vitals (objective data) vs. self-report only ->
      vitals present raises confidence
    """

    PROXY_MARKERS = (
        "conservative",
        "couldn't be confirmed",
        "cannot structurally",
        "cannot distinguish",
        "not explicitly classify",
    )

    def score(
        self,
        inp: TriageQuestionnaireInput,
        category: RiskCategory,
        matched_criteria: List[MatchedCriterion],
    ) -> float:
        if not matched_criteria:
            return 0.5  # shouldn't happen; neutral fallback

        base = 0.55
        base += min(0.20, 0.07 * (len(matched_criteria) - 1))  # corroboration

        proxy_count = sum(
            1
            for c in matched_criteria
            if any(marker in c.description.lower() for marker in self.PROXY_MARKERS)
        )
        base -= 0.10 * proxy_count

        vitals_present = any(
            v is not None
            for v in (
                inp.heart_rate_bpm,
                inp.systolic_bp_mmhg,
                inp.respiratory_rate,
                inp.spo2_percent,
                inp.temperature_celsius,
            )
        )
        if vitals_present:
            base += 0.10

        if category == RiskCategory.ROUTINE and inp.consciousness == ConsciousnessLevel.ALERT and inp.severity == SeverityOption.MILD:
            base += 0.05  # clean, unambiguous routine case

        return max(0.0, min(1.0, round(base, 3)))
