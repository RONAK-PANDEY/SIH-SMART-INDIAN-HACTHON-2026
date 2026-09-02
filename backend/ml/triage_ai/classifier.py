"""
Top-level orchestrator. This is the module's public API.

    result = classify_triage(questionnaire_input)

Pipeline:
  1. rules_engine.evaluate()      -> deterministic category + matched
                                      criteria + unevaluable red flags
                                      (business-rules.md 2.1-2.3)
  2. safety-net escalation         -> server-side equivalent of Triage.tsx's
                                      hasRedFlags()/escalate(): certain
                                      booleans always force at least URGENT,
                                      independent of the rules engine path,
                                      so a bug in step 1 can never silently
                                      under-triage a red-flag patient
  3. confidence_model.score()      -> optional lightweight confidence signal
                                      layered on top, never overriding
                                      the category from steps 1-2
  4. expedited-review flagging     -> unevaluable red flags, low confidence,
                                      or proxy-based matches all route the
                                      case for faster clinician attention
  5. TriageAssessmentResult        -> disclaimer + requires_clinical_confirmation
                                      are structural fields on this object,
                                      not optional add-ons (schema.py)
"""

from __future__ import annotations

from typing import Optional

from . import rules_engine
from .config import DEFAULT_CONFIG, FacilityTriageConfig
from .confidence_model import ConfidenceModel, HeuristicConfidenceModel
from .schema import (
    ConsciousnessLevel,
    MatchedCriterion,
    RiskCategory,
    TriageAssessmentResult,
    TriageQuestionnaireInput,
)

_DEFAULT_CONFIDENCE_MODEL = HeuristicConfidenceModel()


def _safety_net_escalation_reason(inp: TriageQuestionnaireInput) -> Optional[str]:
    """
    Mirrors Triage.tsx's hasRedFlags(): breathing_difficulty,
    chest_discomfort, or consciousness in (drowsy, unresponsive) always
    force at least URGENT. Re-implemented here as the *authoritative*
    server-side check per the component's own TODO note ("that logic
    should ultimately live server-side and be owned/signed off by
    clinical staff") — the client-side version remains a defense-in-depth
    fallback for network/server failures, not the source of truth.
    """
    reasons = []
    if inp.breathing_difficulty:
        reasons.append("breathing_difficulty=true")
    if inp.chest_discomfort:
        reasons.append("chest_discomfort=true")
    if inp.consciousness in (ConsciousnessLevel.DROWSY, ConsciousnessLevel.UNRESPONSIVE):
        reasons.append(f"consciousness={inp.consciousness.value}")

    if not reasons:
        return None
    return "Safety-net escalation (mirrors Triage.tsx hasRedFlags): " + ", ".join(reasons)


def classify_triage(
    inp: TriageQuestionnaireInput,
    config: FacilityTriageConfig = DEFAULT_CONFIG,
    confidence_model: Optional[ConfidenceModel] = None,
) -> TriageAssessmentResult:
    """
    Classify a completed questionnaire into a suggested risk category.

    This NEVER returns a category lower than what the rules engine or the
    safety net independently determine — only equal or escalated, matching
    business-rules.md 2.2's "staff discretion may upgrade... may NOT
    downgrade" principle applied to this automated layer as well.
    """
    category, matched_criteria, unevaluable = rules_engine.evaluate(inp, config)

    # --- Safety-net escalation (independent second check) ---------------
    safety_reason = _safety_net_escalation_reason(inp)
    safety_escalated = False
    if safety_reason is not None and category != RiskCategory.URGENT:
        safety_escalated = True
        matched_criteria = list(matched_criteria) + [
            MatchedCriterion("SAFETY_NET.escalation", safety_reason, RiskCategory.URGENT)
        ]
        category = RiskCategory.URGENT
    elif safety_reason is not None:
        # Rules engine already reached URGENT independently; record that
        # the safety net agreed, for audit purposes, without changing anything.
        safety_escalated = False

    # --- Confidence layer --------------------------------------------------
    confidence = None
    if config.enable_confidence_model:
        model = confidence_model or _DEFAULT_CONFIDENCE_MODEL
        confidence = model.score(inp, category, matched_criteria)

    # --- Expedited review flagging -----------------------------------------
    expedited_reasons = []
    if unevaluable and config.unevaluable_criteria_forces_review:
        expedited_reasons.append(
            "One or more URGENT criteria could not be evaluated from the "
            "submitted questionnaire (see unevaluable_red_flags) — "
            "clinician should screen for these directly"
        )
    if confidence is not None and confidence < config.low_confidence_review_threshold:
        expedited_reasons.append(
            f"Confidence score {confidence} is below the facility's review "
            f"threshold ({config.low_confidence_review_threshold})"
        )
    proxy_matches = [
        c for c in matched_criteria
        if "conservative" in c.description.lower() or "cannot structurally" in c.description.lower()
    ]
    if proxy_matches and category == RiskCategory.URGENT:
        expedited_reasons.append(
            "URGENT suggestion relies on a conservative proxy mapping "
            "rather than a directly-confirmed criterion — verify promptly"
        )

    return TriageAssessmentResult(
        suggested_risk_category=category,
        matched_criteria=matched_criteria,
        confidence=confidence,
        unevaluable_red_flags=unevaluable,
        safety_escalated=safety_escalated,
        safety_escalation_reason=safety_reason if safety_escalated else None,
        expedited_review_recommended=bool(expedited_reasons),
        expedited_review_reasons=expedited_reasons,
    )
