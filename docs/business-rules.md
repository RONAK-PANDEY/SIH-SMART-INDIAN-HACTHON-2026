# Business Rules

Version: 1.0
Status: Implementation-ready

This document specifies the four core rule sets governing patient flow: the priority queue, triage risk classification, referral triggers, and facility congestion scoring. All thresholds below are defaults and must be implemented as configurable constants (not hardcoded), scoped per facility, so they can be tuned post-launch without a code change.

---

## 1. Priority Queue Algorithm

### 1.1 Priority Categories

Every patient in a queue is assigned exactly one priority category, ranked highest to lowest:

| Rank | Category | Code |
|------|----------|------|
| 1 | Emergency | `EMERGENCY` |
| 2 | Critical | `CRITICAL` |
| 3 | Senior Citizen | `SENIOR` |
| 4 | PWD (Person with Disability) | `PWD` |
| 5 | Normal | `NORMAL` |

A patient holds one category at a time. If a patient qualifies for more than one non-clinical category (e.g., a senior citizen who is also PWD), the **higher-ranked category wins** (SENIOR and PWD tie-break: PWD takes precedence over SENIOR, since PWD rank 4 < SENIOR rank 3 numerically — to avoid ambiguity, the explicit tie-break order when both apply is: **PWD > SENIOR**).

### 1.2 Assignment Rules (Staff-Verified, Not Self-Selected)

- Patients **cannot self-select** their priority category at check-in. The check-in form only collects intake data (name, complaint, ID, date of birth if available).
- Category assignment is a **separate staff action**, performed by a registration/triage staff member with an authenticated staff account, before the patient enters the queue (or immediately after, but the patient is held in an `UNASSIGNED` pending state until this happens — they are not visible in the live queue order until assigned).
- Assignment rules per category:
  - **EMERGENCY**: Assigned only by clinical staff (nurse or physician role) based on triage risk category `URGENT` (see Section 2). This is a clinical judgment call, not a queue-desk decision.
  - **CRITICAL**: Assigned only by clinical staff, for patients who are triage `URGENT` but do not meet the resuscitation/immediate-danger bar for `EMERGENCY`. In practice: EMERGENCY = immediate life threat, CRITICAL = urgent but stable enough to wait for the next available slot (target: seen within 15 minutes).
  - **SENIOR**: Assigned by front-desk/registration staff upon verifying age ≥ 60 years via a government-issued ID or existing patient record. Self-reported age without ID verification is not sufficient; staff must record the ID type and last 4 digits/number used for verification.
  - **PWD**: Assigned by front-desk/registration staff upon verifying a PWD ID card, disability certificate, or equivalent documented proof. If the patient does not have documentation on hand but presents an obvious/visible disability (e.g., wheelchair user, visible mobility aid), a staff member may assign PWD provisionally with a note `"provisional - no ID presented"`; this must be reconciled with documentation on the same visit before discharge, or it reverts to NORMAL for any future visit if never reconciled.
  - **NORMAL**: Default category for anyone not qualifying for the above, or pending qualification.
- Every assignment action is logged with: `staff_id`, `timestamp`, `category_assigned`, `verification_method`, `patient_id`. This log is immutable (append-only) and auditable.
- Re-assignment (category change after initial assignment) is permitted only by staff and must also be logged with a `reason` field. A patient cannot request their own re-assignment; a staff member must independently verify and act.

### 1.3 Within-Category Ordering

Within a single category, patients are ordered by **check-in timestamp** (FIFO — first come, first served), except where the anti-starvation rule (1.4) inserts a NORMAL patient ahead of schedule.

### 1.4 Anti-Starvation Rule

To prevent NORMAL-category patients from being indefinitely pushed back by a continuous stream of higher-priority arrivals, the following aging mechanism applies:

- Each NORMAL patient accrues a **wait-time score** starting at 0 the moment they are assigned to the queue, incrementing by 1 point for every **10 minutes** waited.
- **Every 4th queue dispatch slot is reserved for the NORMAL patient with the highest wait-time score**, regardless of whether EMERGENCY/CRITICAL/SENIOR/PWD patients are also waiting — *unless* an EMERGENCY patient is present, in which case EMERGENCY always takes the very next slot with no exception (life-threatening cases are never deferred by the anti-starvation rule).
- Concretely, the dispatch sequence is computed as follows for every "next patient" decision:
  1. If any patient is `EMERGENCY`: dispatch the longest-waiting EMERGENCY patient. (No exceptions.)
  2. Else, maintain a rolling counter `slot_count` per queue, incremented each time a patient is dispatched.
  3. If `slot_count % 4 == 0` AND at least one NORMAL patient exists: dispatch the NORMAL patient with the highest wait-time score (ties broken by earliest check-in).
  4. Else: dispatch in category rank order (CRITICAL > SENIOR > PWD > NORMAL), FIFO within category.
- **Hard cap**: no NORMAL patient may wait longer than **120 minutes** without being dispatched, regardless of the slot-counter state. If a NORMAL patient's wait exceeds 120 minutes, they are force-inserted at the front of the effective dispatch order for the next available slot (this overrides step 4 but still yields to an EMERGENCY patient per step 1).
- The wait-time score and 120-minute cap are configurable per facility (`normal_aging_interval_minutes` default 10, `normal_priority_slot_ratio` default 4, `normal_max_wait_minutes` default 120).

---

## 2. Triage Risk-Category Criteria

Every patient receives a triage risk category from a clinical staff member (nurse/physician) using a structured assessment. Three categories exist: `ROUTINE`, `PRIORITY`, `URGENT`.

### 2.1 URGENT (see within 15 minutes)

Any **one** of the following present triggers URGENT:

- Vital signs outside safe range: HR < 50 or > 130 bpm; systolic BP < 90 or > 180 mmHg; respiratory rate < 10 or > 28/min; SpO2 < 92% on room air; temperature ≥ 39.5°C (103.1°F) with altered mental status.
- Altered consciousness (not fully alert/oriented) or new-onset confusion.
- Active chest pain with suspected cardiac origin.
- Difficulty breathing / respiratory distress at rest.
- Uncontrolled bleeding, or suspected internal bleeding.
- Signs of stroke (facial droop, arm weakness, speech difficulty — FAST positive).
- Severe trauma (suspected fracture with deformity, head injury with loss of consciousness, penetrating injury).
- Suspected anaphylaxis or severe allergic reaction.
- Active seizure or post-ictal state.
- Suicidal ideation with a stated plan, or acute psychiatric emergency.
- Pediatric patient (< 5 years) with high fever (≥ 39°C) and lethargy.
- Pregnant patient with vaginal bleeding, severe abdominal pain, or reduced fetal movement.

### 2.2 PRIORITY (see within 60 minutes)

Any **one** of the following, with **no URGENT criteria present**:

- Vital signs mildly abnormal but not in URGENT range (e.g., HR 100–130, SpO2 92–94%, temp 38.5–39.5°C without altered mental status).
- Moderate pain (self-reported pain score 6–8 out of 10).
- Persistent vomiting or diarrhea with visible signs of dehydration but patient is alert and stable.
- Non-severe trauma (suspected sprain/simple fracture without deformity, laceration requiring stitches but bleeding controlled).
- Known chronic condition (e.g., diabetes, hypertension, asthma) presenting with symptom flare-up that is uncomfortable but not immediately dangerous.
- Fever in a child aged 5–12 without lethargy or the URGENT-level threshold.
- Any patient the triage staff member has clinical concern about but who does not meet a specific URGENT criterion — staff discretion may **upgrade** PRIORITY to URGENT but may **not downgrade** a patient meeting a URGENT criterion to PRIORITY.

### 2.3 ROUTINE (standard queue, no time guarantee beyond normal wait)

Default category when **no URGENT or PRIORITY criteria are met**. Examples: mild pain (1–5/10), stable chronic disease follow-up/check-up, prescription refill visit, minor cold/flu symptoms without fever ≥ 38.5°C, routine screening/consultation appointments.

### 2.4 Mapping to Priority Queue

Triage risk category feeds the priority queue assignment (Section 1.2) as follows:

| Triage Result | Priority Queue Category (default, absent SENIOR/PWD override) |
|---|---|
| URGENT | EMERGENCY or CRITICAL (clinician chooses based on immediacy — see 1.2) |
| PRIORITY | Elevated within NORMAL band: treated as NORMAL but with wait-time score starting at 6 (equivalent to 60 minutes pre-aged) instead of 0, so PRIORITY patients reach the anti-starvation reserved slot faster |
| ROUTINE | NORMAL, wait-time score starts at 0 |

Note: SENIOR and PWD category assignment (Section 1.2) is independent of and can stack with triage outcome — e.g., a senior citizen triaged ROUTINE is still queued under SENIOR category, not NORMAL.

---

## 3. Referral Trigger Conditions

A referral to another facility is triggered when the current facility cannot adequately treat the patient. The system must surface a referral prompt to staff (not silently redirect) whenever any of the following is true:

### 3.1 Missing Specialist/Department

- The patient's triaged condition maps to a required specialty/department (per a maintained condition-to-specialty mapping table, e.g., "chest pain, cardiac" → Cardiology) **and** the current facility's department registry does not list that specialty as `active` and `currently staffed` (i.e., a specialist is on the roster for the current shift).
- If the specialty exists at the facility but the *only* specialist on record is marked unavailable (on leave, no active shift for the current time window) → same trigger applies.

### 3.2 Capacity/Equipment Shortfall

- The condition requires equipment or a procedure (e.g., CT scan, dialysis, ICU bed, ventilator) that the facility's resource registry marks as `unavailable` or `out of service`.
- The relevant department exists and is staffed, but has zero available capacity (e.g., ICU beds at 100% occupancy) **and** the patient's triage category is URGENT or PRIORITY (ROUTINE patients are not auto-flagged for capacity-based referral; they are queued normally).

### 3.3 Escalation of Severity Mid-Visit

- A patient's triage category is upgraded from ROUTINE/PRIORITY to URGENT while awaiting care at a facility that lacks the matching specialty/department per 3.1 or 3.2.

### 3.4 Referral Trigger Logic (evaluation order)

1. On triage completion (or triage upgrade), look up the required specialty for the diagnosed/suspected condition in the condition-to-specialty mapping table.
2. Check the destination facility's department registry for that specialty: is it `active`? Is at least one specialist `on-shift` for the current time?
3. If specialty is missing or unstaffed → trigger referral prompt immediately, regardless of triage category.
4. If specialty is present and staffed, check required equipment/resource availability (Section 3.2). If unavailable or at zero capacity **and** triage is URGENT/PRIORITY → trigger referral prompt.
5. If none of the above apply → no referral triggered; patient proceeds in-facility.
6. A referral trigger produces a recommended list of alternate facilities, ranked by: (a) has required specialty active + staffed, (b) has required equipment/capacity available, (c) shortest estimated transfer distance/time. Staff make the final referral decision; the system never auto-transfers a patient without staff confirmation.

---

## 4. Congestion Score Thresholds

Each facility (or department within a facility) is assigned a live congestion status of `GREEN`, `YELLOW`, or `RED`, derived from a congestion score.

### 4.1 Congestion Score Formula

```
congestion_score = (active_patients_in_queue / staffed_capacity) * 100
```

Where:
- `active_patients_in_queue` = count of all patients currently in an unassigned/waiting state across all priority categories at that facility/department.
- `staffed_capacity` = number of patients the currently on-shift clinical staff can reasonably handle per hour, computed as `on_shift_clinicians * patients_per_clinician_per_hour` (default `patients_per_clinician_per_hour` = 4, configurable per department/specialty).

The score is recalculated on every queue state change (patient added, dispatched, or re-categorized), and additionally on a scheduled tick every 5 minutes to account for staffing shift changes.

### 4.2 Status Thresholds

| Status | Congestion Score Range | Meaning |
|---|---|---|
| GREEN | 0 – 74 | Normal operating capacity; no action needed |
| YELLOW | 75 – 99 | Approaching capacity; system displays a warning to staff; new ROUTINE walk-ins may be advised of extended wait times |
| RED | 100+ | At or over capacity; system flags facility as overloaded; triggers automatic evaluation of referral candidacy for any newly-arriving PRIORITY/URGENT patient (per Section 3.2 logic), and displays a prominent alert on the facility dashboard |

### 4.3 Additional Rules

- These thresholds (74/99/100) are configurable defaults per facility (`congestion_green_max`, `congestion_yellow_max`), not hardcoded, to allow facilities with different acuity mixes to tune sensitivity.
- Congestion status is computed **per department** where department-level staffing data exists (e.g., Emergency department vs. General OPD may have different scores), and a facility-level aggregate score is the **maximum** of all department scores (the facility is only as "green" as its most congested active department).
- A RED status does not, by itself, force a referral — it triggers the **evaluation** described in Section 3.2 for URGENT/PRIORITY patients only; ROUTINE patients remain queued locally under RED status but staff/dashboard messaging should reflect longer expected waits.
- Status transitions are logged (timestamp, old status, new status, triggering score) for later analysis of load patterns.

---

## 5. Configuration Summary

All tunable constants referenced above, collected for implementation convenience:

| Constant | Default | Section |
|---|---|---|
| `normal_aging_interval_minutes` | 10 | 1.4 |
| `normal_priority_slot_ratio` | 4 | 1.4 |
| `normal_max_wait_minutes` | 120 | 1.4 |
| `priority_starting_wait_score` (PRIORITY triage → NORMAL queue) | 6 | 2.4 |
| `patients_per_clinician_per_hour` | 4 | 4.1 |
| `congestion_green_max` | 74 | 4.2 |
| `congestion_yellow_max` | 99 | 4.2 |

All of these must live in a per-facility configuration table, not application code, so operations staff can adjust them without a deployment.
