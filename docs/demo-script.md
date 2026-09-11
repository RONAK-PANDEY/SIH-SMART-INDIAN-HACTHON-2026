# SmartCare 5-Minute SIH Jury Demo Script
> **Maintainer**: Kartik  
> **Target Audience**: SIH Evaluation Jury & Healthcare Domain Experts

---

## ⏱️ Timeline & Walkthrough

### 0:00 - 0:45: The Problem & Regional Context
* **Hook**: Show crowded AIIMS/Civil Hospital OPD footage & 4+ hour wait times.
* **Core Pain Point**: Lack of dynamic triage, opaque queues, unbalanced hospital load.

### 0:45 - 2:00: Patient PWA Experience (Multi-lingual & Triage)
* Switch language to Hindi / Punjabi.
* Input symptoms: "Severe chest discomfort with sweating".
* AI Triage scores as **Level 2 (Emergent)**, issues dynamic fast-track token.
* Show Live Turn-by-Turn Queue Tracker with estimated wait time.

### 2:00 - 3:30: Doctor Console & Realtime Queue Engine
* Doctor logs in, sees prioritised queue on Live WebSocket feed.
* Calls Next Patient (`CARD-042`), patient's mobile app instantly triggers alert sound and visual notification.
* Doctor initiates inter-hospital referral to secondary hospital due to bed capacity limit.

### 3:30 - 4:30: Admin Dashboard, Heatmap & AI Predictions
* Show city-wide hospital load balancing heatmap.
* Display ML Wait Time forecast curve vs actual historical data.
* Demonstrate automatic load shedding recommendation to nearby civil hospital.

### 4:30 - 5:00: Architecture, ABHA Compliance & Q&A
* Highlight offline PWA caching, PostgreSQL + Redis stack, scalability to 100,000+ daily OPD tokens.
