# backend/ml/triage_ai

Rules-first (optionally ML-assisted) classifier that turns a patient's
self-reported triage questionnaire answers into a **suggested** risk
category (`ROUTINE` / `PRIORITY` / `URGENT`), per `docs/business-rules.md`
Section 2.

```python
from backend.ml.triage_ai import classify_triage, TriageQuestionnaireInput

result = classify_triage(TriageQuestionnaireInput.from_api_payload(request_json))
result.suggested_risk_category        # RiskCategory.URGENT / PRIORITY / ROUTINE
result.requires_clinical_confirmation  # always True
result.disclaimer                      # baked into the object, always present
result.to_dict()                       # JSON-serializable for the API layer
```

## Before you wire this into an endpoint — read this first

Triage.tsx (the patient-facing form) already flags an important open
question in its own header comment: **the only documented API endpoint,
`POST /api/v1/triage-assessments`, is staff-restricted and expects a
clinician-determined `severity_level` — it does not accept raw patient
symptoms or return a computed category.** The component posts to a
placeholder path (`/api/v1/patient-triage`) pending a decision.

This module doesn't resolve that decision for you, but it's built
assuming the **safer of the two options the component itself proposes**:
that a call to `classify_triage()` produces a *suggestion* which creates
or updates a `triage_assessment` in a **pending** state for a clinician
to confirm — not something that sets a patient's live risk category
directly. That's why `requires_clinical_confirmation` is a non-optional,
always-`True` field on the result object (`schema.py`), not something an
API handler has to remember to check. If you wire this module up so that
`suggested_risk_category` gets written straight into a patient record
without a clinician confirming it, you've silently removed the human in
the loop that `docs/business-rules.md` Section 2's preamble requires
("Every patient receives a triage risk category **from a clinical staff
member** ... using a structured assessment").

## Architecture

```
schema.py            Enums + TriageQuestionnaireInput + TriageAssessmentResult
config.py             FacilityTriageConfig (per-facility tunables — see below)
rules_engine.py        Deterministic classifier: business-rules.md 2.1-2.3
confidence_model.py    Optional lightweight confidence layer (heuristic, pluggable)
classifier.py           Orchestrator: rules -> safety net -> confidence -> result
queue_mapping.py       Bonus: business-rules.md 2.4 (triage -> queue category)
tests/test_classifier.py  Unit tests
```

`classify_triage()` in `classifier.py` is the only function most callers
need. The pipeline:

1. **`rules_engine.evaluate()`** — deterministic, auditable, implements
   2.1 (URGENT) then 2.2 (PRIORITY) then 2.3 (ROUTINE default), exactly
   as ranked in the business rules doc: "any ONE of the following
   present triggers URGENT."
2. **Safety-net escalation** — a server-side, authoritative version of
   Triage.tsx's own `hasRedFlags()` / `escalate()` client-side fallback.
   `breathing_difficulty`, `chest_discomfort`, or `consciousness` in
   `{drowsy, unresponsive}` always force at least `URGENT`, independent
   of the rules engine, so a bug in step 1 can't silently under-triage
   a red-flag patient. The Triage.tsx comment explicitly says this logic
   "should ultimately live server-side and be owned/signed off by
   clinical staff" — that's what this step is.
3. **Confidence layer (optional)** — see "Why the ML layer is a
   heuristic, not a trained model" below. It **never overrides** the
   category from steps 1-2; it only informs review prioritization.
4. **Expedited-review flagging** — unevaluable red flags, low confidence,
   or an URGENT verdict built on a conservative proxy (see below) all
   set `expedited_review_recommended = True` so these cases don't sit in
   a routine review queue.
5. **`TriageAssessmentResult`** — `disclaimer`,
   `requires_clinical_confirmation`, and `is_diagnosis` are fields with
   fixed values set by the dataclass itself (`init=False`), not strings
   an API handler has to remember to attach.

## Field mapping: questionnaire → business-rules.md 2.1-2.3

| Triage.tsx field | business-rules.md criterion it maps to | Notes |
|---|---|---|
| `consciousness` (alert/drowsy/unresponsive) | 2.1 "altered consciousness / new-onset confusion" | drowsy or unresponsive → URGENT |
| `breathing_difficulty` | 2.1 "difficulty breathing / respiratory distress at rest" | direct match |
| `chest_discomfort` | 2.1 "active chest pain with suspected cardiac origin" | **conservative**: the form can't distinguish cardiac-origin pain from other chest discomfort, so any `true` is treated as URGENT-eligible |
| `has_injury` + `severity=severe` | 2.1 "severe trauma (deformity / LOC / penetrating)" | **conservative**: specifics can't be structurally confirmed from a boolean + free text; flagged for clinician verification against `injury_details` |
| `age_group=child_0_12` + `fever` + `consciousness=drowsy` | 2.1 pediatric fever + lethargy (doc says "<5 years, ≥39°C") | **conservative proxy**: bucket is 0-12 not <5, `fever` is boolean not a reading — see `config.treat_child_bucket_as_under_5_conservatively` |
| `severity=moderate` | 2.2 "moderate pain (6-8/10)" | proxy: 3-point scale standing in for 0-10 |
| `has_injury` + `severity` in {mild, moderate} | 2.2 "non-severe trauma" | direct-ish match |
| `existing_conditions` (non-empty) + `severity=moderate` | 2.2 "chronic condition flare-up" | weak/additive signal only |
| `age_group=child_0_12` + `fever` + `consciousness=alert` | 2.2 "fever in child 5-12 without lethargy" | bucket mismatch (0-12 vs 5-12), same caveat as above |
| everything else / no match | 2.3 ROUTINE default | |

### Known gap: vitals

business-rules.md 2.1/2.2's *first* bullet in each category is a set of
vital-sign thresholds (HR, systolic BP, respiratory rate, SpO2,
temperature). **Triage.tsx does not collect any of these** — it's a
patient self-report form, not a clinical measurement screen. This
module's schema has optional `heart_rate_bpm`, `systolic_bp_mmhg`,
`respiratory_rate`, `spo2_percent`, `temperature_celsius` fields so that
if a clinician-facing intake screen (or a vitals device integration)
supplies them, the exact documented thresholds are evaluated precisely
(`rules_engine._vitals_urgent_match`). When absent — the current
Triage.tsx case — those specific bullets simply can't fire, which is
one reason the safety-net escalation (step 2 above) and the
`unevaluable_red_flags` list exist: to make sure the *absence* of vitals
data isn't mistaken for the *absence* of a red flag.

### Known gap: criteria with no questionnaire field at all

These business-rules.md 2.1 (URGENT) bullets have **no corresponding
field** on the current form and are always listed in
`unevaluable_red_flags` on every result, regardless of category:

- Uncontrolled bleeding / suspected internal bleeding
- Signs of stroke (FAST positive)
- Suspected anaphylaxis / severe allergic reaction
- Active seizure or post-ictal state
- Suicidal ideation with a plan, or acute psychiatric emergency
- Pregnancy-related red flags (bleeding, severe abdominal pain, reduced
  fetal movement — there's no pregnancy-status field at all)

**Deliberate design choice:** this module does **not** attempt to infer
any of these from the free-text `chief_complaint` field via keyword
matching or NLP. That's especially true for suicidal ideation — a
false negative from a brittle keyword heuristic is worse than
transparently saying "this form can't check for that." If a facility
wants machine-assisted screening for any of these, that should be a
deliberate, clinically-reviewed addition to the questionnaire itself
(structured yes/no fields) rather than text inference bolted onto this
module. Recommend raising this with Shristi/clinical stakeholders as a
possible v2 form addition, prioritizing the psychiatric-emergency and
pregnancy fields since those are structured yes/no questions that would
be cheap to add.

### Why the "severe, no other signal" case isn't ROUTINE

business-rules.md 2.2 explicitly lists moderate pain (6-8/10) but its
lists don't name a plain "severe pain, no injury, no breathing/chest
signal" combination anywhere in 2.1 or 2.2. Rather than let that fall
through to the 2.3 ROUTINE default (which would mean self-reported
"severe" symptoms get treated identically to "mild" for triage purposes),
this is treated as PRIORITY at minimum, with `expedited_review_recommended
= True`, deferring to 2.2's own clause that "staff discretion may upgrade
PRIORITY to URGENT." Worth flagging to Ajay as a possible gap in the
written criteria.

## Why the ML layer is a heuristic, not a trained model

No labeled training data was provided with this task. `HeuristicConfidenceModel`
in `confidence_model.py` is a transparent, hand-tunable scorer — not
learned — that estimates how much structured signal backs a verdict
(more corroborating matched criteria, presence of objective vitals vs.
self-report only, and whether the verdict leans on a "conservative
proxy" mapping all move the score). It exists mainly to (a) demonstrate
where a trained model would plug in, and (b) drive the
`expedited_review_recommended` flag today, without pretending to have
predictive power it doesn't have. The `ConfidenceModel` abstract base
class defines the swap-in point: implement `.score()` against a real
persisted model and pass it to `classify_triage(..., confidence_model=...)`;
nothing else in the pipeline needs to change. The confidence score is
never used to change the category, only to prioritize clinician review —
consistent with "never present this as a diagnosis."

## Why triage thresholds are not in the facility config table

`docs/business-rules.md` Section 5 lists configurable constants for the
priority queue and congestion scoring, but **not** for Section 2's
triage criteria (the vital-sign thresholds, pain-score bands, etc.). We
treat that as intentional rather than an oversight: those are
standardized clinical criteria, not something a facility config screen
should be able to loosen. `config.py`'s `FacilityTriageConfig` only
exposes knobs for this *module's own* decision-support behavior (whether
the confidence layer runs, the review-escalation threshold, how
conservatively to treat the 0-12 pediatric bucket) — never the clinical
thresholds themselves. If a facility genuinely needs different clinical
thresholds, that should go through clinical sign-off and probably a
versioned criteria set, not a config toggle.

## Running the tests

```bash
python3 -m unittest backend.ml.triage_ai.tests.test_classifier -v
```

No external dependencies — everything here is Python stdlib, so it runs
in any environment without a `pip install`.
