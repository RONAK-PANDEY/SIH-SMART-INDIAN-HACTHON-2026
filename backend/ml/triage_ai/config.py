"""
Configurable constants for the triage_ai module.

business-rules.md Section 2 (triage risk criteria) is written as fixed
clinical thresholds and is NOT listed in the doc's Section 5 configuration
summary — unlike the priority-queue and congestion constants, which are
explicitly required to be facility-tunable. We treat that as intentional:
clinical URGENT/PRIORITY criteria are standardized, not something a
front-desk config screen should be able to loosen. See README.md,
"Why triage thresholds are not in the facility config table".

What IS configurable here is the behavior of this module's own
decision-support layer — things the doc doesn't specify and that
reasonably differ by facility risk tolerance / staffing:

- whether the lightweight ML confidence layer runs at all
- the confidence floor below which a result is flagged for
  expedited clinician review rather than routine review
- the pediatric age (in years) below which the "high fever + lethargy"
  URGENT criterion (2.1) applies — the doc says "< 5 years" but the
  questionnaire's age_group buckets are coarser (see README); this lets
  ops tune how conservatively the child_0_12 bucket is treated
"""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class FacilityTriageConfig:
    facility_id: str = "default"

    # Confidence layer
    enable_confidence_model: bool = True
    low_confidence_review_threshold: float = 0.55  # below this -> flag for
    # expedited clinician review, even if the rules verdict is ROUTINE

    # Pediatric handling: business-rules.md 2.1 says "< 5 years", but the
    # questionnaire only offers a 0-12 bucket. When True, any URGENT-eligible
    # fever+consciousness combination in the 0-12 bucket is treated with the
    # <5 rule (conservative default). When False, 0-12 is treated as the
    # general pediatric population without the extra <5 sensitivity.
    treat_child_bucket_as_under_5_conservatively: bool = True

    # If True, any rules-engine criterion that could not be evaluated
    # because required data is missing (e.g. vitals) is treated as a
    # reason to route the case for expedited clinician review rather
    # than silently proceeding on incomplete information.
    unevaluable_criteria_forces_review: bool = True


DEFAULT_CONFIG = FacilityTriageConfig()
