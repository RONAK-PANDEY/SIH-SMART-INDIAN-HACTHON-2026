# ML triage AI
class NLPTriage:
    def classify(self, text): return {"esi": 2 if "chest" in text.lower() else 4}
