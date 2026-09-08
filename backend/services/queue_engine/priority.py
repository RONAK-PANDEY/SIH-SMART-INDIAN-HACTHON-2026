from dataclasses import dataclass
from datetime import datetime

@dataclass
class VulnerabilityFactors:
    is_senior: bool = False
    is_pregnant: bool = False
    is_differently_abled: bool = False

class PriorityCalculator:
    """
    Implements dynamic priority formula with Emergency Acuity Safeguard:
    P = Emergency_Override + (W_time * T_waiting_mins) + (W_triage * (6 - L_esi)) + (W_vuln * V_score)
    """
    W_TIME = 0.5
    W_TRIAGE = 2.0
    W_VULN = 1.0

    @classmethod
    def calculate(
        cls,
        issued_at: datetime,
        triage_level: int,  # 1 (Resuscitation) to 5 (Non-urgent)
        vulnerability: VulnerabilityFactors
    ) -> float:
        clean_issued = issued_at.replace(tzinfo=None) if hasattr(issued_at, 'replace') else issued_at
        waiting_mins = max(0.0, (datetime.utcnow() - clean_issued).total_seconds() / 60.0)
        
        # Clinical Emergency Tier Override (Level 1: Resuscitation +1000, Level 2: Emergent +500)
        # Prevents normal wait accumulation from overtaking life-threatening trauma
        emergency_boost = 0.0
        if triage_level == 1:
            emergency_boost = 1000.0
        elif triage_level == 2:
            emergency_boost = 500.0
        
        # Invert triage score so Level 1 yields highest numerical boost
        triage_component = max(1, 6 - triage_level)

        # Vulnerability multiplier
        vuln_score = 1.0
        if vulnerability.is_senior or vulnerability.is_pregnant or vulnerability.is_differently_abled:
            vuln_score = 1.5

        priority_score = (
            emergency_boost +
            (cls.W_TIME * waiting_mins) +
            (cls.W_TRIAGE * triage_component) +
            (cls.W_VULN * vuln_score)
        )
        return round(priority_score, 2)
