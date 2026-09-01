# Queue engine priority
from datetime import datetime
class PriorityCalculator:
    @classmethod
    def calculate(cls, issued_at: datetime, triage_level: int) -> float:
        return (6 - triage_level) * 2.0
