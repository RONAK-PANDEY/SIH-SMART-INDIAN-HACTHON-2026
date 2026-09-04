import numpy as np

class WaitTimePredictor:
    """
    Predicts patient waiting time (in minutes) based on queue size,
    active doctors, historical consultation speeds, and time of day.
    """
    def __init__(self):
        # Base linear coefficients derived from historical OPD regression
        self.base_consult_time = 7.2  # minutes per patient
        self.time_of_day_surge_multiplier = {
            8: 1.0, 9: 1.3, 10: 1.5, 11: 1.6, 12: 1.2,
            13: 0.8, 14: 1.1, 15: 1.2, 16: 0.9
        }

    def predict(self, queue_position: int, active_doctors: int, current_hour: int = 10) -> float:
        if active_doctors <= 0:
            active_doctors = 1
        
        surge = self.time_of_day_surge_multiplier.get(current_hour, 1.0)
        estimated_minutes = (queue_position * self.base_consult_time / active_doctors) * surge
        return round(max(3.0, estimated_minutes), 1)

wait_time_model = WaitTimePredictor()
