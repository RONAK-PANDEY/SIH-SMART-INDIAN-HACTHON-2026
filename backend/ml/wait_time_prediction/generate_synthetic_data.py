"""
generate_synthetic_data.py

Generates a synthetic dataset for the wait-time prediction model.
Simulates outpatient queue conditions across departments, hours, and days,
with a hand-crafted (but noisy) ground-truth formula for the target,
predicted_waiting_time (minutes).

Run directly to (re)create data/synthetic_wait_times.csv:
    python generate_synthetic_data.py
"""

import numpy as np
import pandas as pd
from pathlib import Path

RANDOM_SEED = 42
N_ROWS = 8000

DEPARTMENTS = [
    "General Medicine",
    "Pediatrics",
    "Orthopedics",
    "Cardiology",
    "ENT",
    "Dermatology",
    "Emergency",
]

# Rough relative "load factor" per department -> baseline consultation time (mins)
DEPT_BASE_CONSULT_TIME = {
    "General Medicine": 12,
    "Pediatrics": 10,
    "Orthopedics": 15,
    "Cardiology": 18,
    "ENT": 9,
    "Dermatology": 8,
    "Emergency": 20,
}

DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]


def generate(n_rows: int = N_ROWS, seed: int = RANDOM_SEED) -> pd.DataFrame:
    rng = np.random.default_rng(seed)

    department = rng.choice(DEPARTMENTS, size=n_rows)
    hour = rng.integers(0, 24, size=n_rows)
    day = rng.choice(DAYS, size=n_rows)

    # Queue / staffing features, loosely correlated with hour-of-day (peak 9-12, 16-18)
    peak_boost = np.where(
        ((hour >= 9) & (hour <= 12)) | ((hour >= 16) & (hour <= 18)), 1.5, 1.0
    )
    weekend_boost = np.where(np.isin(day, ["Sat", "Sun"]), 0.7, 1.0)

    queue_length = np.clip(
        rng.poisson(lam=8 * peak_boost * weekend_boost), 0, 60
    )
    doctors_available = np.clip(
        rng.integers(1, 8, size=n_rows)
        - np.where((hour < 8) | (hour > 20), 2, 0),
        1,
        10,
    )

    base_consult = np.array([DEPT_BASE_CONSULT_TIME[d] for d in department])
    average_consultation_time = np.clip(
        rng.normal(loc=base_consult, scale=3.0), 4, 40
    )

    patients_per_hour = np.clip(
        rng.normal(loc=6 * peak_boost * weekend_boost, scale=2.0), 1, 30
    )
    priority_cases = np.clip(
        rng.poisson(lam=np.where(department == "Emergency", 3, 1)), 0, 15
    )

    # --- Ground truth formula (with noise) ---
    # Core queueing intuition: wait ~ (queue_length * avg_consult_time) / doctors_available
    # adjusted upward by priority cases jumping the queue and patient inflow rate.
    base_wait = (queue_length * average_consultation_time) / doctors_available
    priority_penalty = priority_cases * 4.0
    inflow_penalty = patients_per_hour * 1.2
    dept_adjust = np.where(department == "Emergency", -15, 0) + np.where(
        department == "Dermatology", -5, 0
    )

    noise = rng.normal(loc=0, scale=6.0, size=n_rows)

    predicted_waiting_time = np.clip(
        base_wait + priority_penalty + inflow_penalty + dept_adjust + noise,
        1,
        None,
    )

    df = pd.DataFrame(
        {
            "queue_length": queue_length,
            "doctors_available": doctors_available,
            "average_consultation_time": np.round(average_consultation_time, 1),
            "patients_per_hour": np.round(patients_per_hour, 1),
            "priority_cases": priority_cases,
            "department": department,
            "hour": hour,
            "day": day,
            "predicted_waiting_time": np.round(predicted_waiting_time, 1),
        }
    )
    return df


if __name__ == "__main__":
    df = generate()
    out_dir = Path(__file__).parent / "data"
    out_dir.mkdir(exist_ok=True)
    out_path = out_dir / "synthetic_wait_times.csv"
    df.to_csv(out_path, index=False)
    print(f"Wrote {len(df)} rows to {out_path}")
    print(df.describe(include="all"))
