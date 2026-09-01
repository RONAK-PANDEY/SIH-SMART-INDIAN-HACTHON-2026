# ML congestion predictor
class CongestionPredictor:
    def predict(self, inflow, cap): return {"load_pct": round(inflow/cap*100, 1)}
