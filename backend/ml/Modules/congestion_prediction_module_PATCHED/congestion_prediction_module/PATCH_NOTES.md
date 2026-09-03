# Patch: graceful degradation for missing operational data

Applied to `backend/ml/congestion_prediction/`. See the main review for
full context. Summary of the bug this fixes:

**Before:** `CongestionInput.doctors_on_duty`, `doctors_required`,
`discharges_last_hour`, and `avg_wait_time_minutes` defaulted to `0`/`0.0`.
A caller that omitted them (e.g. a department whose staffing feed isn't
wired up yet) got a score built from *fabricated* readings: "0 doctors on
duty" (worst-case staffing alarm), "0-minute wait" (best-case wait
reading), and a hardcoded arrivals:discharges ratio of 2.0 (worst-case flow
imbalance) — all invented from absence of data, not real signal.
Reproduced: a calm, mostly-empty-payload request scored 32.5/100 (borderline
yellow) purely from these defaults.

**After:** those four fields are `Optional`, defaulting to `None` ("not
reported"). Each `compute_*_subscore` function now returns a 4th
`available: bool`. `compute_rule_score` excludes unavailable drivers from
the weighted sum and renormalizes weights across the drivers that *are*
available. `CongestionResult.missing_inputs` and the reason string both
disclose which drivers had no data, so a score built on partial data never
looks identical to one built on a full picture.

Same calm-but-incomplete payload now scores ~0-2/100 (green) with
`missing_inputs: ["staffing", "wait_time"]` and reason text: *"No
significant congestion drivers detected; metrics are near typical levels.
(no data for: staffing, wait time)"*.

## Files touched
- `schemas.py` — `CongestionInput` fields now `Optional[...] = None`;
  `SubScore.available` added; `CongestionResult.missing_inputs` property added.
- `features.py` — each `compute_*_subscore` returns `(score, detail, raw, available)`;
  missing inputs produce a "not provided" detail instead of a fabricated reading.
- `rules.py` — `compute_rule_score` renormalizes weights over available drivers only.
- `reason_generator.py` — appends "(no data for: ...)" when any driver is unavailable.
- `ml_model.py` — `featurize()` now tolerates `None` values in `raw_metrics`
  (previously only tolerated missing keys) with neutral fill-ins *for the ML
  component only* — the rule score and reason string never use these fill-ins.
- `api.py` — `CongestionRequest` fields made `Optional`; response schema
  exposes `available` per sub-score and `missing_inputs`; fixed a pydantic
  v1/v2 `.dict()`/`.model_dump()` compatibility gap.
- `tests/test_congestion_prediction.py` — updated for the new 4-tuple
  return shape; added 4 regression tests for the missing-data behavior.

All 24 tests pass (20 original + 4 new).
