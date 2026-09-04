# SmartCare Business Rules & Triage Logic
> **Maintainer**: Ajay  
> **Scope**: Triage Acuity Mapping, Dynamic Priority Scoring, Referral Constraints

---

## 1. Triage Acuity Levels (Emergency Severity Index - ESI)

| Level | Severity | Color Code | Max Target Wait Time | Action |
| :--- | :--- | :--- | :--- | :--- |
| **Level 1** | Resuscitation / Critical | Red | Immediate (0 mins) | Bypasses all OPD queues straight to Trauma/ICU |
| **Level 2** | Emergent / High Risk | Orange | < 10 mins | Injected at head of queue (Top Priority) |
| **Level 3** | Urgent | Yellow | < 30 mins | Boosted priority factor $w_s = 2.5$ |
| **Level 4** | Less Urgent | Green | < 60 mins | Standard FIFO with age/vulnerability adjustments |
| **Level 5** | Non-Urgent | Blue | < 120 mins | Standard FIFO OPD queuing |

---

## 2. Dynamic Priority Formula

The Queue Engine computes every token's queue priority $P_i$ dynamically:

$$P_i = (W_{time} \times T_{waiting\_mins}) + (W_{triage} \times (6 - L_{esi})) + (W_{vuln} \times V_{score})$$

Where:
- $T_{waiting\_mins}$: Minutes elapsed since token issue
- $L_{esi}$: ESI Level (1 to 5)
- $V_{score} = 1.5$ if Age $\ge 65$ or Pregnant or Differently-abled, else $1.0$
- $W_{time} = 0.5$, $W_{triage} = 2.0$, $W_{vuln} = 1.0$

---

## 3. Inter-Hospital Referral Logic
1. If sending hospital OPD wait time exceeds 180 mins OR ICU bed occupancy is 100%, trigger automated referral suggestions to nearest tier-2/tier-3 partner facility within 15km radius.
2. Patient receives a "Fast-Track Digital Referral Pass" with pre-booked slot at receiving facility.
