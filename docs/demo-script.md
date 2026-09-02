# SmartCare — 5-Minute SIH Demo Script

**Total time:** ~5:00
**Presenters:** 1 speaker (primary) + 1 operator (drives the screen), swap only if needed
**Setup before you go on stage:** two browser tabs pre-loaded and logged in — Tab 1: SmartCare patient/hospital app, Tab 2: Government dashboard. Have a second device (phone) ready to simulate a live token push if possible.

---

## 0:00–0:40 — The Problem (40 sec)

**Speaker, standing, no screen yet (or a simple problem slide):**

> "Walk into any government hospital in India today and you'll see the same scene: a crowded registration desk, people crushing around a paper token counter, no idea how long the wait is, and no idea that the hospital two kilometers away is empty. Patients lose hours. Hospitals have no real-time visibility. And the government has no way to see, across a district, which hospitals are overloaded *right now* — until it's already a crisis."

> "We built SmartCare — an AI-powered patient registration, triage, and queue system that fixes this from the ground up, and gives the government a live, predictive command view across every hospital."

**Cue:** switch to screen.

---

## 0:40–1:40 — Registration → Triage → Token (60 sec)

**Operator:** open SmartCare patient app.

**Speaker (narrating live actions):**

> "Here's a patient walking in. Instead of a paper form and a queue, they register in under 30 seconds — name, ID, symptoms."

- Operator fills the registration form live (name, age, symptom keywords) → submit.

> "The moment they submit, our AI triage engine reads the symptoms and assigns an urgency level — see it flag this as [e.g. 'Moderate — suspected viral fever'] automatically. No manual sorting, no bias, no delay."

- Show triage result badge (color-coded: green/yellow/red).

> "Based on urgency and current load, SmartCare instantly issues a digital token — token number, department, and an estimated call time — sent straight to their phone."

- Show token generated on screen with QR/number + estimated time.

**Transition line:**
> "That's one patient. Now let's see what happens as hundreds of patients do this at once."

---

## 1:40–2:30 — Live Queue Update (50 sec)

**Operator:** switch to the hospital-side live queue dashboard.

**Speaker:**

> "This is the hospital's live queue view. Every registration, every triage result, every token — updates here in real time, no refresh needed."

- Trigger a new token push (from phone or a second pre-scripted registration) so the queue visibly updates on screen live.

> "Watch — as a new patient registers, the queue re-orders itself instantly based on urgency, not just first-come-first-served. A red-flagged emergency case jumps the line automatically, while routine cases keep their fair position."

- Point to queue re-ordering, current serving token, and counts per department.

> "Hospital staff get a single live screen instead of six different registers and a shouting match at the counter."

---

## 2:30–3:20 — AI Wait-Time & Congestion Prediction (50 sec)

**Operator:** scroll/click to the prediction panel within the same hospital view.

**Speaker:**

> "This is where SmartCare goes beyond a queue tracker. Using historical footfall, current queue depth, and time-of-day patterns, our model predicts wait time per department — not a static average, a live prediction that updates as conditions change."

- Point to the wait-time numbers per department (e.g., "OPD: 42 min", "Emergency: 6 min").

> "And it doesn't stop at wait time — it predicts *congestion* before it happens. See this trend line: the model is forecasting this hospital will cross overload threshold in the next 30 minutes based on current intake rate."

- Highlight the congestion forecast graph/indicator ticking toward red.

> "This is the difference between reacting to a crowded hospital and preventing one."

---

## 3:20–4:10 — Government Dashboard: Spot the Red Hospital (50 sec)

**Operator:** switch to Tab 2 — Government dashboard (district/state map view).

**Speaker:**

> "Now zoom out. This is the government dashboard — a live map of every connected hospital in the district, color-coded green, yellow, red by real-time load and our congestion prediction."

- Point to the map: mostly green/yellow, one hospital marked red.

> "Here's a hospital flashing red — overloaded right now, and trending worse."

- **Operator clicks the red hospital marker.**

> "One click, and the official sees exactly what's happening inside — queue length, average wait, department-wise breakdown, and the congestion forecast we just saw on the hospital's own screen."

---

## 4:10–4:40 — The AI Recommendation (30 sec)

**Operator:** stay on the red hospital's detail panel, scroll to the recommendation section.

**Speaker:**

> "But SmartCare doesn't just report the problem — it recommends the fix. Here, the AI is suggesting: redirect incoming non-critical patients to [Nearby Hospital name], which is under 30% capacity and 4 km away. It's already estimated the load-balancing impact — a 25% drop in wait time here within the hour."

- Point to the recommendation card: suggested hospital, distance, capacity, projected impact.

> "This turns a district health office from reactive firefighting into proactive, data-driven load balancing — across every hospital, every day."

---

## 4:40–5:00 — Closing Line (20 sec)

**Speaker, facing judges, screen still on dashboard:**

> "SmartCare takes a patient from a chaotic queue to a fair, AI-prioritized token in seconds — and gives the government the first real-time, predictive nervous system for public healthcare capacity. Less waiting for patients. Less guessing for hospitals. Less crisis for the government. That's SmartCare."

**[End — hold on dashboard, don't fumble to close it]**

---

## Timing Cheat Sheet

| Segment | Duration | Cumulative |
|---|---|---|
| Problem | 0:40 | 0:40 |
| Registration → Triage → Token | 1:00 | 1:40 |
| Live Queue Update | 0:50 | 2:30 |
| AI Wait-Time & Congestion Prediction | 0:50 | 3:20 |
| Government Dashboard + Red Hospital Click | 0:50 | 4:10 |
| AI Recommendation | 0:30 | 4:40 |
| Closing Line | 0:20 | 5:00 |

## Backup / Risk Notes
- **If live demo breaks:** have a 30-second screen-recorded fallback video cued up for each segment; operator switches to video without announcing it, speaker keeps narrating over it.
- **If Wi-Fi/network is unreliable:** pre-seed the queue with mock patients so the "live update" segment doesn't rely on real-time submission working perfectly — one live action is enough to prove it.
- **Practice the click handoff** between Tab 1 and Tab 2 (2:30 and 3:20 marks) — these are the two moments most likely to fumble.
- Keep language plain when talking to non-technical judges; save any model/architecture detail for Q&A, not the demo.
