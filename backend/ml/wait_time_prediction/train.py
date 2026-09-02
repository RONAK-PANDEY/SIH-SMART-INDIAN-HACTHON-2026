"""
train.py

Trains a Random Forest regressor to predict `predicted_waiting_time`
(minutes) for outpatient queues.

Usage:
    python train.py [--data data/synthetic_wait_times.csv] [--out model/model.joblib]

Notes on model choice:
    Random Forest is used as the baseline here since it's robust to feature
    scale differences, handles the mixed numeric/categorical feature set
    well after one-hot encoding, and gives free, easily-explainable feature
    importances. Swapping in XGBoost / GradientBoostingRegressor later is a
    drop-in change -- see the `build_model()` function below.
"""

import argparse
import json
import logging
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder

from features import (
    ALL_FEATURES,
    CATEGORICAL_FEATURES,
    DAYS,
    DEPARTMENTS,
    NUMERIC_FEATURES,
    TARGET,
)

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("train")

THIS_DIR = Path(__file__).parent
DEFAULT_DATA_PATH = THIS_DIR / "data" / "synthetic_wait_times.csv"
DEFAULT_MODEL_DIR = THIS_DIR / "model"
DEFAULT_MODEL_PATH = DEFAULT_MODEL_DIR / "model.joblib"
DEFAULT_METRICS_PATH = DEFAULT_MODEL_DIR / "metrics.json"
DEFAULT_IMPORTANCE_PATH = DEFAULT_MODEL_DIR / "feature_importances.json"


def build_preprocessor() -> ColumnTransformer:
    """Numeric passthrough + one-hot encode categoricals with a fixed vocab."""
    categories = [DEPARTMENTS, DAYS]  # order must match CATEGORICAL_FEATURES
    return ColumnTransformer(
        transformers=[
            ("num", "passthrough", NUMERIC_FEATURES),
            (
                "cat",
                OneHotEncoder(categories=categories, handle_unknown="ignore"),
                CATEGORICAL_FEATURES,
            ),
        ]
    )


def build_model(random_state: int = 42) -> RandomForestRegressor:
    """
    Baseline regressor. To swap in XGBoost later:

        from xgboost import XGBRegressor
        return XGBRegressor(
            n_estimators=400, max_depth=6, learning_rate=0.05,
            subsample=0.8, colsample_bytree=0.8, random_state=random_state,
        )

    The rest of the pipeline (ColumnTransformer, feature names, save/load,
    predict.py) does not need to change.
    """
    return RandomForestRegressor(
        n_estimators=300,
        max_depth=12,
        min_samples_leaf=3,
        n_jobs=-1,
        random_state=random_state,
    )


def get_feature_names(preprocessor: ColumnTransformer) -> list:
    """Human-readable expanded feature names after one-hot encoding."""
    cat_encoder = preprocessor.named_transformers_["cat"]
    cat_names = list(cat_encoder.get_feature_names_out(CATEGORICAL_FEATURES))
    return NUMERIC_FEATURES + cat_names


def train(data_path: Path = DEFAULT_DATA_PATH, model_path: Path = DEFAULT_MODEL_PATH):
    logger.info("Loading data from %s", data_path)
    df = pd.read_csv(data_path)
    missing_cols = set(ALL_FEATURES + [TARGET]) - set(df.columns)
    if missing_cols:
        raise ValueError(f"Dataset is missing required columns: {missing_cols}")

    X = df[ALL_FEATURES]
    y = df[TARGET]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    logger.info("Train rows: %d | Test rows: %d", len(X_train), len(X_test))

    preprocessor = build_preprocessor()
    model = build_model()

    pipeline = Pipeline(
        steps=[
            ("preprocessor", preprocessor),
            ("regressor", model),
        ]
    )

    logger.info("Fitting pipeline...")
    pipeline.fit(X_train, y_train)

    # --- Evaluation ---
    y_pred = pipeline.predict(X_test)
    mae = mean_absolute_error(y_test, y_pred)
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    r2 = r2_score(y_test, y_pred)

    metrics = {"mae_minutes": round(mae, 3), "rmse_minutes": round(rmse, 3), "r2": round(r2, 4)}
    logger.info("Evaluation on held-out test set: %s", metrics)

    # --- Explainability: feature importances ---
    feature_names = get_feature_names(pipeline.named_steps["preprocessor"])
    importances = pipeline.named_steps["regressor"].feature_importances_
    importance_pairs = sorted(
        zip(feature_names, importances), key=lambda p: p[1], reverse=True
    )

    logger.info("Feature importances (descending):")
    for name, importance in importance_pairs:
        logger.info("  %-30s %.4f", name, importance)

    # --- Persist artifacts ---
    model_path.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(pipeline, model_path)
    logger.info("Saved trained pipeline to %s", model_path)

    with open(DEFAULT_METRICS_PATH, "w") as f:
        json.dump(metrics, f, indent=2)
    logger.info("Saved metrics to %s", DEFAULT_METRICS_PATH)

    with open(DEFAULT_IMPORTANCE_PATH, "w") as f:
        json.dump(
            [{"feature": n, "importance": round(float(i), 6)} for n, i in importance_pairs],
            f,
            indent=2,
        )
    logger.info("Saved feature importances to %s", DEFAULT_IMPORTANCE_PATH)

    return pipeline, metrics, importance_pairs


def parse_args():
    parser = argparse.ArgumentParser(description="Train wait-time prediction model")
    parser.add_argument("--data", type=Path, default=DEFAULT_DATA_PATH)
    parser.add_argument("--out", type=Path, default=DEFAULT_MODEL_PATH)
    return parser.parse_args()


if __name__ == "__main__":
    args = parse_args()
    train(data_path=args.data, model_path=args.out)
