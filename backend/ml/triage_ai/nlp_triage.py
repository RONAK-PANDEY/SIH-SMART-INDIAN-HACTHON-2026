import re
from typing import Dict, Any

class NLPTriageClassifier:
    """
    Parses unstructured text complaints (English/Hindi transliteration)
    and classifies clinical urgency.
    """
    HIGH_ACUITY_KEYWORDS = [
        "chest pain", "chhati me dard", "dil ka daura", "heart", "breathless",
        "saans lene me dikkat", "unconscious", "behoshi", "stroke", "paralysis"
    ]
    
    MODERATE_ACUITY_KEYWORDS = [
        "high fever", "tez bukhar", "blood in vomit", "pet me tez dard",
        "fracture", "haddi toot", "severe burn"
    ]

    def classify_complaint(self, text: str) -> Dict[str, Any]:
        text_lower = text.lower()
        
        for kw in self.HIGH_ACUITY_KEYWORDS:
            if re.search(r'\b' + re.escape(kw) + r'\b', text_lower):
                return {
                    "matched_keyword": kw,
                    "confidence": 0.94,
                    "esi_level": 2,
                    "urgency": "EMERGENT"
                }
                
        for kw in self.MODERATE_ACUITY_KEYWORDS:
            if re.search(r'\b' + re.escape(kw) + r'\b', text_lower):
                return {
                    "matched_keyword": kw,
                    "confidence": 0.88,
                    "esi_level": 3,
                    "urgency": "URGENT"
                }
                
        return {
            "matched_keyword": None,
            "confidence": 0.90,
            "esi_level": 4,
            "urgency": "ROUTINE"
        }

nlp_triage = NLPTriageClassifier()
