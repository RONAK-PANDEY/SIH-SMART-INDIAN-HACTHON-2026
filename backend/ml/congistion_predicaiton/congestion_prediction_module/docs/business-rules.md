# Business Rules — Hospital Congestion Score

Source of truth for thresholds/weights: `backend/ml/congestion_prediction/config.py`.
If the two ever disagree, the code wins — update this file to match.

## What it is

The Hospital Congestion Score is a **0–100** number produced per
department/unit, refreshed on each new snapshot of operational metrics
(queue length, doctor availability, wait times, patient flow, and
historical patterns for the same hour/day-of-week). It comes with:

- a **status** — `green` / `yellow` / `red` — for at-a-glance dashboards and alerting, and
- a **reason string** — the top 1–3 factors actually driving the score, e.g.:

  > "Queue increased 34%; 3 doctors unavailable; waiting time 52 min exceeds 45 min target"

## Status thresholds

| Score range | Status | Label | Meaning | Recommended action |
|---|---|---|---|---|
| **0–39** | 🟢 Green | Normal | Operating within typical capacity for this time/day | No action required; continue routine monitoring |
| **40–69** | 🟡 Yellow | Elevated | Meaningful strain on at least one dimension (queue, staffing, wait time, or flow) | Charge nurse/shift lead reviews drivers in the reason string; consider calling in on-call staff or reallocating from a less-busy unit |
| **70–100** | 🔴 Red | Critical | Multiple compounding pressures or one severe pressure; sustained levels typically precede overcrowding | Escalate to unit/hospital administrator; activate surge protocol (e.g. call in additional staff, open overflow capacity, divert non-critical incoming transfers per hospital policy); reassess hourly until back to yellow/green |

Thresholds are **inclusive**: a score of exactly 40 is Yellow, exactly 70 is Red.

These bands are a starting point tuned for general applicability — sites
should revisit them using retrospective data (did red episodes actually
correspond to real overcrowding events at this hospital?) and adjust
`Thresholds.green_max` / `Thresholds.yellow_max` in `config.py` accordingly.

## How the score is computed

**Rules + ML hybrid.** Four operational drivers are each turned into a
0–100 "pressure" sub-score, then combined two ways:

### 1. Rule-based composite (always computed; powers the reason string)

| Driver | Weight | What it measures | Saturates (sub-score = 100) at |
|---|---|---|---|
| Queue pressure | 0.35 | % increase in current queue vs. historical average for this hour/day | Queue at ≥2× typical |
| Staffing pressure | 0.25 | % shortfall of doctors on duty vs. doctors required | ≥60% short-staffed |
| Wait-time pressure | 0.25 | % by which average wait exceeds the target wait time (default 45 min) | Wait ≥150% over target |
| Flow pressure | 0.15 | Surge in arrivals vs. historical average, and/or admissions outpacing discharges | Arrivals at ≥2× typical, or arrivals ≥2× discharges |

`rule_score = 0.35·queue + 0.25·staffing + 0.25·wait_time + 0.15·flow`

### 2. ML model (when a trained model is available)

A gradient-boosted regressor trained on historical outcomes predicts a
score from the same underlying raw metrics plus bed occupancy rate,
capturing nonlinear/compounding effects (e.g. a queue spike combined with
short staffing is worse than the sum of the two treated independently).

### 3. Blend

```
final_score = 0.5 × ml_score + 0.5 × rule_score      (if ML model available)
final_score = rule_score                              (fallback, if not)
```

The blend weight (`ML_BLEND_ALPHA`) and all saturation points above are
configurable in `config.py`.

### Reason string

Built from the rule-based sub-scores only (so it stays interpretable
regardless of the ML blend). The top 3 factors by **contribution**
(sub-score × its weight — not raw severity alone) are joined into one
sentence. Factors below a minor-impact threshold (sub-score < 5) are
omitted; if nothing is significant, the reason reads "No significant
congestion drivers detected."

## Change management

Any change to thresholds, weights, or saturation constants should:

1. Be made in `backend/ml/congestion_prediction/config.py` only.
2. Be reflected in the tables above in the same change/PR.
3. Ideally be validated against retrospective data before shipping to
   production dashboards/alerting, since these numbers directly drive
   staffing and escalation decisions.
