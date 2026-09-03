"""
Training entry point for the ML component of the hybrid predictor.

IMPORTANT: This ships with a SYNTHETIC data generator so the pipeline is
runnable and testable out of the box. In production, replace
`generate_synthetic_dataset` with a loader that pulls labeled historical
records from your data warehouse -- e.g. rows of
(queue_pct_change, staffing_deficit_pct, wait_overage_pct,
arrival_discharge_ratio, bed_occupancy_rate) paired with a real outcome
label such as an ops-team-assigned congestion score, or a proxy like
"actual wait time two hours later" rescaled to 0-100.

Usage:
    python -m backend.ml.congestion_prediction.train
"""
import argparse

import numpy as np
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error

from .ml_model import CongestionMLModel, FEATURE_ORDER, DEFAULT_MODEL_PATH


def generate_synthetic_dataset(n_samples: int = 4000, seed: int = 42):
    """Generates a synthetic (X, y) dataset with a realistic, nonlinear
    relationship between raw metrics and an outcome congestion score, plus
    noise -- standing in for real historical outcomes.
    """
    rng = np.random.default_rng(seed)

    queue_pct_change = rng.normal(20, 40, n_samples).clip(-80, 300)
    staffing_deficit_pct = rng.normal(10, 25, n_samples).clip(-50, 100)
    wait_overage_pct = rng.normal(10, 50, n_samples).clip(-80, 300)
    arrival_discharge_ratio = rng.normal(1.1, 0.5, n_samples).clip(0.1, 4.0)
    bed_occupancy_rate = rng.uniform(0.3, 1.0, n_samples)

    X = np.column_stack([
        queue_pct_change,
        staffing_deficit_pct,
        wait_overage_pct,
        arrival_discharge_ratio,
        bed_occupancy_rate,
    ])

    # Nonlinear "true" outcome generator: interactions between staffing
    # shortfall and queue growth compound congestion more than either alone.
    y = (
        0.30 * np.clip(queue_pct_change, 0, None)
        + 0.25 * np.clip(staffing_deficit_pct, 0, None)
        + 0.20 * np.clip(wait_overage_pct, 0, None) * 0.6
        + 15.0 * np.clip(arrival_discharge_ratio - 1, 0, None)
        + 20.0 * np.clip(bed_occupancy_rate - 0.85, 0, None) * 10
        + 0.10 * np.clip(queue_pct_change, 0, None) * np.clip(staffing_deficit_pct, 0, None) / 50.0
    )
    y += rng.normal(0, 6, n_samples)  # measurement/label noise
    y = np.clip(y, 0, 100)

    return X, y


def train(n_samples: int = 4000, seed: int = 42, model_path: str = DEFAULT_MODEL_PATH) -> dict:
    X, y = generate_synthetic_dataset(n_samples=n_samples, seed=seed)
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=seed)

    model = GradientBoostingRegressor(
        n_estimators=200,
        max_depth=3,
        learning_rate=0.05,
        random_state=seed,
    )
    model.fit(X_train, y_train)

    preds = model.predict(X_test)
    mae = mean_absolute_error(y_test, preds)

    wrapper = CongestionMLModel(model_path=model_path)
    saved_path = wrapper.save(model, model_path=model_path)

    feature_importances = dict(zip(FEATURE_ORDER, model.feature_importances_.tolist()))

    return {
        "model_path": saved_path,
        "test_mae": mae,
        "n_train": len(X_train),
        "n_test": len(X_test),
        "feature_importances": feature_importances,
    }


def main():
    parser = argparse.ArgumentParser(description="Train the congestion prediction ML component.")
    parser.add_argument("--n-samples", type=int, default=4000)
    parser.add_argument("--seed", type=int, default=42)
    parser.add_argument("--model-path", type=str, default=DEFAULT_MODEL_PATH)
    args = parser.parse_args()

    result = train(n_samples=args.n_samples, seed=args.seed, model_path=args.model_path)

    print(f"Saved model to: {result['model_path']}")
    print(f"Test MAE: {result['test_mae']:.2f} points (0-100 scale)")
    print(f"Train/test sizes: {result['n_train']}/{result['n_test']}")
    print("Feature importances:")
    for name, importance in sorted(result["feature_importances"].items(), key=lambda kv: -kv[1]):
        print(f"  {name:28s} {importance:.3f}")


if __name__ == "__main__":
    main()
