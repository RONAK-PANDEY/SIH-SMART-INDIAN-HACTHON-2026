import random
from typing import List, Dict

class SyntheticDataGenerator:
    """
    Generates realistic synthetic hospital OPD queue records for model pre-training.
    """
    DEPARTMENTS = ["Cardiology", "General Medicine", "Pediatrics", "Orthopedics", "Neurology", "ENT"]
    
    @classmethod
    def generate_opd_visits(cls, n: int = 500) -> List[Dict]:
        records = []
        for i in range(1, n + 1):
            esi = random.choices([1, 2, 3, 4, 5], weights=[0.02, 0.08, 0.25, 0.40, 0.25])[0]
            dept = random.choice(cls.DEPARTMENTS)
            consult_time = round(random.uniform(4.0, 15.0), 1)
            wait_time = round(random.uniform(10.0, 65.0) * (6 - esi) / 3.0, 1)
            
            records.append({
                "patient_id": f"usr_{i:04d}",
                "department": dept,
                "esi_level": esi,
                "consult_duration_mins": consult_time,
                "actual_wait_mins": wait_time,
                "referred": random.random() < 0.05
            })
        return records

if __name__ == "__main__":
    sample = SyntheticDataGenerator.generate_opd_visits(10)
    print(f"Generated {len(sample)} sample synthetic OPD records.")
