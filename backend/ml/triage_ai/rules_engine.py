"""
Deterministic rules engine implementing docs/business-rules.md Section 2
(Triage Risk-Category Criteria), adapted to the fields the patient-facing
questionnaire (Triage.tsx) actually collects.

Design principles, in priority order:

1. Evaluate URGENT criteria first. Any single match -> URGENT, full stop
   (business-rules.md 2.1: "Any ONE of the following present triggers
   URGENT"). We never let a PRIORITY-level signal cancel out an URGENT one.

2. Never let missing data cause a *false negative* on urgency. Where the
   questionnaire can't structurally confirm a business-rules.md URGENT
   criterion (stroke signs, suicidal ideation, anaphylaxis, uncontrolled
   bleeding, pregnancy complications — see README "Known gaps"), we do
   NOT silently treat it as absent. We record it in `unevaluable_red_flags`
   and the classifier layer (classifier.py) turns that into an expedited
   clinician-review flag, per business-rules.md's own model where a human
   clinician makes the actual triage call (Section 2 preamble: "Every
   patient receives a triage risk category from a clinical staff member").

3. Where a questionnaire field is a coarser proxy for a documented
   criterion (e.g. a `severity` enum standing in for a 0-10 pain score,
   or a `fever` boolean standing in for a temperature reading), we map
   conservatively toward *higher* urgency and say so in the matched
   criterion's description, rather than silently assuming the milder
   interpretation.

4. business-rules.md 2.2 explicitly reserves upgrade authority to staff
   discretion ("staff discretion may upgrade PRIORITY to URGENT but may
   NOT downgrade"). This engine only ever suggests; nothing here writes
   a final category to a patient record.
"""

from __future__ import annotations

from typing import List, Tuple

from .config import FacilityTriageConfig
from .schema import (
    AgeGroup,
    ConsciousnessLevel,
    MatchedCriterion,
    RiskCategory,
    SeverityOption,
    TriageQuestionnaireInput,
)

# Criteria business-rules.md 2.1 (URGENT) lists that this questionnaire has
# no structured field for at all. Always surfaced to the reviewing
# clinician regardless of which category the rules engine lands on —
# see classifier.py for how these become an expedited-review flag.
STRUCTURALLY_UNEVALUABLE_URGENT_CRITERIA = [
    "Uncontrolled bleeding or suspected internal bleeding "
    "(no structured field; only free-text injury_details)",
    "Signs of stroke — facial droop, arm weakness, speech difficulty "
    "(FAST) (not captured by this questionnaire)",
    "Suspected anaphylaxis or severe allergic reaction "
    "(not captured by this questionnaire)",
    "Active seizure or post-ictal state (not captured by this questionnaire)",
    "Suicidal ideation with a stated plan, or acute psychiatric emergency "
    "(not captured by this questionnaire — no mental-health screening "
    "question exists on the current form; do not infer this from free-text "
    "chief_complaint)",
    "Pregnancy-related red flags — vaginal bleeding, severe abdominal pain, "
    "reduced fetal movement (no pregnancy-status field exists)",
]

# business-rules.md 2.2 (PRIORITY) also has a criterion with no structured
# field at all. Same rationale as the URGENT list above: absence of a field
# must never be silently read as absence of the symptom. Kept as a separate
# list (rather than merged into the URGENT one) so callers can distinguish
# "unconfirmable URGENT red flag" from "unconfirmable PRIORITY signal" if
# they ever need to weight review urgency differently.
STRUCTURALLY_UNEVALUABLE_PRIORITY_CRITERIA = [
    "Persistent vomiting or diarrhea with visible signs of dehydration "
    "(no structured field on this questionnaire — not the same as "
    "existing_conditions/severity, which are proxies for other 2.2 bullets)",
]


def _vitals_urgent_match(inp: TriageQuestionnaireInput) -> List[MatchedCriterion]:
    """business-rules.md 2.1, vital-sign bullet. Only fires if vitals were
    actually supplied — the standard questionnaire doesn't collect them."""
    matches: List[MatchedCriterion] = []

    def add(desc: str):
        matches.append(MatchedCriterion("URGENT.vitals", desc, RiskCategory.URGENT))

    if inp.heart_rate_bpm is not None and (inp.heart_rate_bpm < 50 or inp.heart_rate_bpm > 130):
        add(f"Heart rate {inp.heart_rate_bpm} bpm outside safe range (<50 or >130)")
    if inp.systolic_bp_mmhg is not None and (inp.systolic_bp_mmhg < 90 or inp.systolic_bp_mmhg > 180):
        add(f"Systolic BP {inp.systolic_bp_mmhg} mmHg outside safe range (<90 or >180)")
    if inp.respiratory_rate is not None and (inp.respiratory_rate < 10 or inp.respiratory_rate > 28):
        add(f"Respiratory rate {inp.respiratory_rate}/min outside safe range (<10 or >28)")
    if inp.spo2_percent is not None and inp.spo2_percent < 92:
        add(f"SpO2 {inp.spo2_percent}% below 92% on room air")
    if (
        inp.temperature_celsius is not None
        and inp.temperature_celsius >= 39.5
        and inp.consciousness != ConsciousnessLevel.ALERT
    ):
        add(
            f"Temperature {inp.temperature_celsius}\u00b0C \u2265 39.5\u00b0C with "
            "altered mental status"
        )
    return matches


def _evaluate_urgent(
    inp: TriageQuestionnaireInput, config: FacilityTriageConfig
) -> List[MatchedCriterion]:
    matches: List[MatchedCriterion] = []

    matches.extend(_vitals_urgent_match(inp))

    if inp.consciousness in (ConsciousnessLevel.DROWSY, ConsciousnessLevel.UNRESPONSIVE):
        matches.append(
            MatchedCriterion(
                "URGENT.altered_consciousness",
                f"Reported consciousness level '{inp.consciousness.value}' "
                "(not fully alert) — business-rules.md 2.1 altered "
                "consciousness / new-onset confusion",
                RiskCategory.URGENT,
            )
        )

    if inp.chest_discomfort:
        matches.append(
            MatchedCriterion(
                "URGENT.chest_discomfort",
                "Patient reports chest discomfort. The questionnaire cannot "
                "structurally distinguish 'suspected cardiac origin' from "
                "other chest discomfort, so this is treated conservatively "
                "as URGENT-eligible pending clinician confirmation "
                "(business-rules.md 2.1)",
                RiskCategory.URGENT,
            )
        )

    if inp.breathing_difficulty:
        matches.append(
            MatchedCriterion(
                "URGENT.breathing_difficulty",
                "Patient reports difficulty breathing (business-rules.md "
                "2.1: respiratory distress at rest)",
                RiskCategory.URGENT,
            )
        )

    if inp.has_injury and inp.severity == SeverityOption.SEVERE:
        matches.append(
            MatchedCriterion(
                "URGENT.severe_trauma",
                "Injury reported with self-rated 'severe' severity. "
                "business-rules.md 2.1 requires specific findings (deformity, "
                "loss of consciousness, or penetrating injury) that this "
                "questionnaire cannot structurally confirm from free text — "
                "treated conservatively as URGENT-eligible; verify specifics "
                "against injury_details during clinical review",
                RiskCategory.URGENT,
            )
        )

    # Pediatric high fever + lethargy (business-rules.md 2.1 says "<5 years";
    # our age bucket is 0-12, see config.treat_child_bucket_as_under_5_conservatively)
    if (
        inp.age_group == AgeGroup.CHILD_0_12
        and inp.fever
        and inp.consciousness == ConsciousnessLevel.DROWSY
        and config.treat_child_bucket_as_under_5_conservatively
    ):
        matches.append(
            MatchedCriterion(
                "URGENT.pediatric_fever_lethargy",
                "Child (0-12 bucket) with reported fever and drowsy/lethargic "
                "presentation. business-rules.md 2.1 specifies this for <5 "
                "years and \u226539\u00b0C; the exact age and temperature "
                "couldn't be confirmed from this questionnaire's coarser "
                "fields, so this is treated conservatively as URGENT-eligible",
                RiskCategory.URGENT,
            )
        )

    return matches


def _evaluate_priority(
    inp: TriageQuestionnaireInput, config: FacilityTriageConfig
) -> List[MatchedCriterion]:
    matches: List[MatchedCriterion] = []

    if (
        inp.heart_rate_bpm is not None
        and 100 <= inp.heart_rate_bpm <= 130
    ):
        matches.append(
            MatchedCriterion(
                "PRIORITY.vitals_mild",
                f"Heart rate {inp.heart_rate_bpm} bpm mildly elevated (100-130)",
                RiskCategory.PRIORITY,
            )
        )
    if inp.spo2_percent is not None and 92 <= inp.spo2_percent <= 94:
        matches.append(
            MatchedCriterion(
                "PRIORITY.vitals_mild",
                f"SpO2 {inp.spo2_percent}% mildly low (92-94%)",
                RiskCategory.PRIORITY,
            )
        )
    if (
        inp.temperature_celsius is not None
        and 38.5 <= inp.temperature_celsius < 39.5
        and inp.consciousness == ConsciousnessLevel.ALERT
    ):
        matches.append(
            MatchedCriterion(
                "PRIORITY.vitals_mild",
                f"Temperature {inp.temperature_celsius}\u00b0C in 38.5-39.5\u00b0C "
                "range without altered mental status",
                RiskCategory.PRIORITY,
            )
        )

    if inp.severity == SeverityOption.MODERATE:
        matches.append(
            MatchedCriterion(
                "PRIORITY.moderate_severity",
                "Self-reported 'moderate' severity — treated as a proxy for "
                "business-rules.md 2.2's 6-8/10 moderate pain band (the "
                "questionnaire uses a 3-point scale, not 0-10)",
                RiskCategory.PRIORITY,
            )
        )

    if inp.severity == SeverityOption.SEVERE and not (inp.has_injury or inp.chest_discomfort or inp.breathing_difficulty):
        # Self-reported "severe" that didn't already trigger an URGENT match
        # above (e.g. severe pain with no injury/breathing/chest signal).
        # business-rules.md's explicit lists cover mild(1-5) and moderate
        # (6-8) pain but don't name a >8/10 non-injury case; we don't
        # silently drop this to ROUTINE. Flagged for clinician discretion
        # per 2.2's staff-upgrade-authority clause.
        matches.append(
            MatchedCriterion(
                "PRIORITY.severe_unclassified",
                "Self-reported 'severe' severity without a matching specific "
                "URGENT criterion. business-rules.md does not explicitly "
                "classify this combination; treated as at minimum PRIORITY "
                "with a recommendation for clinician discretion to consider "
                "an URGENT upgrade (2.2)",
                RiskCategory.PRIORITY,
            )
        )

    if inp.has_injury and inp.severity in (SeverityOption.MILD, SeverityOption.MODERATE):
        matches.append(
            MatchedCriterion(
                "PRIORITY.non_severe_trauma",
                "Injury reported with mild/moderate self-rated severity "
                "(business-rules.md 2.2: non-severe trauma)",
                RiskCategory.PRIORITY,
            )
        )

    if inp.existing_conditions and inp.severity == SeverityOption.MODERATE:
        matches.append(
            MatchedCriterion(
                "PRIORITY.chronic_flareup",
                "Existing condition noted alongside moderate-severity "
                "symptoms — possible chronic-condition flare-up "
                "(business-rules.md 2.2)",
                RiskCategory.PRIORITY,
            )
        )

    if (
        inp.age_group == AgeGroup.CHILD_0_12
        and inp.fever
        and inp.consciousness == ConsciousnessLevel.ALERT
    ):
        matches.append(
            MatchedCriterion(
                "PRIORITY.pediatric_fever",
                "Child with fever, fully alert (no lethargy) — "
                "business-rules.md 2.2 fever-in-child criterion",
                RiskCategory.PRIORITY,
            )
        )

    return matches


def evaluate(
    inp: TriageQuestionnaireInput, config: FacilityTriageConfig
) -> Tuple[RiskCategory, List[MatchedCriterion], List[str]]:
    """
    Returns (category, matched_criteria, unevaluable_red_flags).

    Unevaluable red flags are always returned (not just when they'd change
    the outcome) — a clinician confirming a ROUTINE or PRIORITY suggestion
    still needs to know what the form couldn't check for.
    """
    all_unevaluable = (
        STRUCTURALLY_UNEVALUABLE_URGENT_CRITERIA
        + STRUCTURALLY_UNEVALUABLE_PRIORITY_CRITERIA
    )

    urgent_matches = _evaluate_urgent(inp, config)
    if urgent_matches:
        return RiskCategory.URGENT, urgent_matches, list(all_unevaluable)

    priority_matches = _evaluate_priority(inp, config)
    if priority_matches:
        return RiskCategory.PRIORITY, priority_matches, list(all_unevaluable)

    routine_match = [
        MatchedCriterion(
            "ROUTINE.default",
            "No URGENT or PRIORITY criteria met (business-rules.md 2.3 default)",
            RiskCategory.ROUTINE,
        )
    ]
    return RiskCategory.ROUTINE, routine_match, list(all_unevaluable)
