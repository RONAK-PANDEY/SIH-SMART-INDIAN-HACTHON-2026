# ML wait time predictor
class WaitTimePredictor:
    def predict(self, pos, docs): return round(pos * 6.5 / max(1, docs), 1)
