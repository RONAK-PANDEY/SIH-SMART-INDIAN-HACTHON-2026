# Triage Acuity Rules (Structure by Rishikesh, Rules by Ajay)
from typing import List, Dict

CRITICAL_SYMPTOMS = {
    "cardiac_arrest": 1,
    "respiratory_failure": 1,
    "severe_trauma_unconscious": 1,
    "severe_chest_pain": 2,
    "shortness_of_breath": 2,
    "stroke_symptoms": 2,
    "high_fever_convulsions": 3,
    "severe_abdominal_pain": 3,
    "fracture_moderate_pain": 4,
    "mild_cold_cough": 5,
    "routine_checkup": 5,
}

def evaluate_esi_level(symptoms: List[str], vitals: Dict[str, float] = None) -> int:
    """
    Returns ESI Level (1 = Most severe / Immediate, 5 = Non-urgent).
    """
    min_level = 5
    for s in symptoms:
        norm_s = s.lower().replace(" ", "_")
        level = CRITICAL_SYMPTOMS.get(norm_s, 4)
        if level < min_level:
            min_level = level
    
    # Vital checks override
    if vitals:
        spo2 = vitals.get("spo2", 98.0)
        pulse = vitals.get("pulse", 75.0)
        if spo2 < 88.0 or pulse > 140:
            return min(min_level, 2)
            
    return min_level
