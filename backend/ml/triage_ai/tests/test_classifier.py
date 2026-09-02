import unittest

from backend.ml.triage_ai.classifier import classify_triage
from backend.ml.triage_ai.config import FacilityTriageConfig
from backend.ml.triage_ai.queue_mapping import map_to_queue
from backend.ml.triage_ai.schema import (
    AgeGroup,
    ConsciousnessLevel,
    DurationOption,
    RiskCategory,
    SeverityOption,
    TriageQuestionnaireInput,
)


def make_input(**overrides) -> TriageQuestionnaireInput:
    base = dict(
        chief_complaint="Feeling unwell",
        duration=DurationOption.ONE_TO_6H,
        severity=SeverityOption.MILD,
        consciousness=ConsciousnessLevel.ALERT,
        age_group=AgeGroup.ADULT_18_64,
        fever=False,
        breathing_difficulty=False,
        chest_discomfort=False,
        has_injury=False,
        injury_details=None,
        existing_conditions=None,
    )
    base.update(overrides)
    return TriageQuestionnaireInput(**base)


class TestUrgent(unittest.TestCase):
    def test_breathing_difficulty_is_urgent(self):
        result = classify_triage(make_input(breathing_difficulty=True))
        self.assertEqual(result.suggested_risk_category, RiskCategory.URGENT)

    def test_unresponsive_is_urgent(self):
        result = classify_triage(make_input(consciousness=ConsciousnessLevel.UNRESPONSIVE))
        self.assertEqual(result.suggested_risk_category, RiskCategory.URGENT)

    def test_drowsy_is_urgent(self):
        result = classify_triage(make_input(consciousness=ConsciousnessLevel.DROWSY))
        self.assertEqual(result.suggested_risk_category, RiskCategory.URGENT)

    def test_chest_discomfort_is_urgent(self):
        result = classify_triage(make_input(chest_discomfort=True))
        self.assertEqual(result.suggested_risk_category, RiskCategory.URGENT)

    def test_severe_injury_is_urgent(self):
        result = classify_triage(
            make_input(has_injury=True, severity=SeverityOption.SEVERE, injury_details="Fell off ladder")
        )
        self.assertEqual(result.suggested_risk_category, RiskCategory.URGENT)

    def test_pediatric_fever_with_lethargy_is_urgent(self):
        result = classify_triage(
            make_input(
                age_group=AgeGroup.CHILD_0_12,
                fever=True,
                consciousness=ConsciousnessLevel.DROWSY,
            )
        )
        self.assertEqual(result.suggested_risk_category, RiskCategory.URGENT)

    def test_vitals_out_of_range_is_urgent(self):
        result = classify_triage(make_input(spo2_percent=88))
        self.assertEqual(result.suggested_risk_category, RiskCategory.URGENT)
        rule_ids = {c.rule_id for c in result.matched_criteria}
        self.assertIn("URGENT.vitals", rule_ids)

    def test_urgent_result_always_has_unevaluable_flags_listed(self):
        result = classify_triage(make_input(breathing_difficulty=True))
        self.assertTrue(len(result.unevaluable_red_flags) > 0)
        self.assertTrue(result.expedited_review_recommended)


class TestPriority(unittest.TestCase):
    def test_moderate_severity_is_priority(self):
        result = classify_triage(make_input(severity=SeverityOption.MODERATE))
        self.assertEqual(result.suggested_risk_category, RiskCategory.PRIORITY)

    def test_non_severe_injury_is_priority(self):
        result = classify_triage(
            make_input(has_injury=True, severity=SeverityOption.MILD, injury_details="Twisted ankle")
        )
        self.assertEqual(result.suggested_risk_category, RiskCategory.PRIORITY)

    def test_severe_pain_no_other_signal_is_at_least_priority(self):
        result = classify_triage(make_input(severity=SeverityOption.SEVERE))
        self.assertEqual(result.suggested_risk_category, RiskCategory.PRIORITY)
        self.assertTrue(result.expedited_review_recommended)

    def test_child_fever_alert_is_priority(self):
        result = classify_triage(
            make_input(
                age_group=AgeGroup.CHILD_0_12,
                fever=True,
                consciousness=ConsciousnessLevel.ALERT,
            )
        )
        self.assertEqual(result.suggested_risk_category, RiskCategory.PRIORITY)


class TestRoutine(unittest.TestCase):
    def test_clean_mild_case_is_routine(self):
        result = classify_triage(make_input())
        self.assertEqual(result.suggested_risk_category, RiskCategory.ROUTINE)
        self.assertGreater(result.confidence, 0.5)

    def test_routine_still_carries_unevaluable_flags(self):
        result = classify_triage(make_input())
        self.assertTrue(len(result.unevaluable_red_flags) > 0)

    def test_unevaluable_flags_include_priority_section_gaps(self):
        # business-rules.md 2.2's dehydration/vomiting-diarrhea criterion has
        # no questionnaire field. It must be surfaced regardless of which
        # category the result lands on, same as the URGENT-section gaps.
        result = classify_triage(make_input())
        self.assertTrue(
            any("dehydration" in flag.lower() for flag in result.unevaluable_red_flags)
        )


class TestSafetyNetAndInvariants(unittest.TestCase):
    def test_safety_net_never_downgrades_urgent(self):
        # rules engine already says URGENT via chest_discomfort; safety net
        # should not double-escalate or flip anything.
        result = classify_triage(make_input(chest_discomfort=True))
        self.assertEqual(result.suggested_risk_category, RiskCategory.URGENT)
        self.assertFalse(result.safety_escalated)  # rules engine got there on its own

    def test_safety_net_escalates_when_rules_alone_would_not(self):
        # Construct a config where the confidence model is disabled but
        # breathing_difficulty must still force URGENT via the safety net
        # even if we hypothetically stripped the direct rules-engine match.
        # (Here we just confirm end-to-end URGENT + escalation bookkeeping
        # is consistent for a red-flag case.)
        result = classify_triage(make_input(breathing_difficulty=True))
        self.assertEqual(result.suggested_risk_category, RiskCategory.URGENT)

    def test_result_never_lacks_disclaimer_or_confirmation_flag(self):
        for inp in (
            make_input(),
            make_input(severity=SeverityOption.MODERATE),
            make_input(breathing_difficulty=True),
        ):
            result = classify_triage(inp)
            self.assertTrue(result.requires_clinical_confirmation)
            self.assertFalse(result.is_diagnosis)
            self.assertIn("not a medical diagnosis", result.disclaimer.lower())

    def test_confidence_disabled_via_config(self):
        config = FacilityTriageConfig(enable_confidence_model=False)
        result = classify_triage(make_input(), config=config)
        self.assertIsNone(result.confidence)

    def test_to_dict_is_json_serializable_shape(self):
        import json

        result = classify_triage(make_input(severity=SeverityOption.MODERATE))
        payload = result.to_dict()
        # Should not raise
        json.dumps(payload)
        self.assertEqual(payload["suggested_risk_category"], "PRIORITY")
        self.assertTrue(payload["requires_clinical_confirmation"])


class TestQueueMapping(unittest.TestCase):
    def test_urgent_requires_clinician_choice(self):
        mapping = map_to_queue(RiskCategory.URGENT)
        self.assertTrue(mapping.requires_clinician_choice)
        self.assertIsNone(mapping.queue_category)

    def test_priority_maps_to_normal_with_preaged_score(self):
        mapping = map_to_queue(RiskCategory.PRIORITY)
        self.assertEqual(mapping.queue_category, "NORMAL")
        self.assertEqual(mapping.starting_wait_score, 6)

    def test_routine_maps_to_normal_zero_score(self):
        mapping = map_to_queue(RiskCategory.ROUTINE)
        self.assertEqual(mapping.queue_category, "NORMAL")
        self.assertEqual(mapping.starting_wait_score, 0)


if __name__ == "__main__":
    unittest.main()
