# SmartCare — Pitch Deck Structure (8–10 Slides)

Matches the demo script's narrative arc: problem → solution in action → intelligence layer → government view → impact → ask. Build each slide as its own file/section in `docs/pitch-deck/` (e.g. `01-title.md`, `02-problem.md`, ...) or as one deck — structure below works either way.

---

### Slide 1 — Title
- Product name: **SmartCare**
- One-line tagline: *"Real-time, AI-powered patient flow and hospital load balancing for public healthcare."*
- Team name, SIH problem statement ID, event name
- Clean visual: hospital + AI/network motif, minimal text

### Slide 2 — The Problem
- 3 pain points, one line each, ideally with a stat if you have one:
  - Long unpredictable queues at registration/OPD counters
  - No real-time visibility for hospital staff into load/urgency
  - No cross-hospital visibility for government — overload discovered too late
- Optional: a photo/illustration of a crowded hospital counter for emotional grounding

### Slide 3 — Our Solution (Overview)
- One sentence: what SmartCare is
- 3-part pipeline diagram: **Registration → AI Triage & Token → Live Queue + Prediction**, feeding up into **Government Dashboard**
- This slide is the "map" — every later slide zooms into one part of this diagram

### Slide 4 — Patient Experience: Registration, Triage, Token
- Screenshot(s) from the live app: registration form → triage badge → token
- 3 short callouts: "<30 sec registration," "AI-assigned urgency," "instant digital token with ETA"
- Emphasize: no paper, no manual sorting, fair + fast

### Slide 5 — Live Queue Management (Hospital Side)
- Screenshot of hospital live queue dashboard
- Key points: real-time updates, urgency-based re-ordering (emergency jumps the line), single-screen staff view replacing multiple registers

### Slide 6 — AI Intelligence Layer: Wait-Time & Congestion Prediction
- Screenshot of prediction panel / congestion trend graph
- Explain in plain terms: model inputs (historical footfall, current queue depth, time-of-day) → outputs (per-department wait time, congestion forecast)
- This is your key differentiator slide — spend real time on it

### Slide 7 — Government Command Dashboard
- Screenshot of the district map view (green/yellow/red hospitals)
- Explain: real-time, color-coded, district/state-wide visibility in one screen
- One click → drill into any hospital's live data

### Slide 8 — AI-Driven Load Balancing (The Recommendation)
- Screenshot of the AI recommendation card (redirect suggestion, distance, capacity, projected impact)
- Frame as the "so what": this turns monitoring into action — from reactive to proactive resource allocation

### Slide 9 — Impact & Feasibility
- Impact metrics (even projected/estimated is fine for SIH): reduction in wait time, more even load distribution, faster emergency response
- Feasibility: tech stack summary (keep to logos/short labels, not deep architecture), scalability (works for any hospital that can adopt the app), alignment with existing government health infra (e.g. can plug into ABDM/state health systems — mention only if genuinely true)

### Slide 10 — Vision / Roadmap + Closing Ask
- Short roadmap: pilot district → state rollout → integration with national health stack
- Closing line matching the demo: *"Less waiting for patients. Less guessing for hospitals. Less crisis for the government."*
- Team contact / thank-you

---

## Design Notes
- Keep text per slide minimal — screenshots and live-app visuals do the talking, especially for slides 4–8 which should mirror the demo flow almost 1:1 so judges recognize what they just saw.
- Use one consistent color scheme carried through from the app itself (e.g. reuse the same green/yellow/red from the dashboard) so the deck and the live demo feel like one product.
- If short on time, slides 4–8 can compress to 3 slides (Patient Flow / Hospital Intelligence / Government Dashboard) — keep total to 8 minimum, 10 maximum.
