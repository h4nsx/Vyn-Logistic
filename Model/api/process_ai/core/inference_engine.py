from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Dict, List, Tuple

import joblib
import numpy as np
import pandas as pd


LOW_RISK_MAX = 0.30
MEDIUM_RISK_MAX = 0.60


def load_json(path: Path) -> Dict[str, Any]:
    if not path.exists():
        return {}
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def load_model(model_path: Path):
    return joblib.load(model_path)


def load_feature_columns(feature_columns_path: Path) -> List[str]:
    with open(feature_columns_path, "r", encoding="utf-8") as f:
        return json.load(f)


def get_threshold_from_metrics(metrics: Dict[str, Any], default: float = 0.5) -> float:
    try:
        return float(metrics.get("threshold", default))
    except (TypeError, ValueError):
        return float(default)


def assign_risk_band(
    probability: float,
    low_risk_max: float = LOW_RISK_MAX,
    medium_risk_max: float = MEDIUM_RISK_MAX,
) -> str:
    if pd.isna(probability):
        return "Unknown"
    if probability < low_risk_max:
        return "Low"
    if probability < medium_risk_max:
        return "Medium"
    return "High"


def _to_dataframe(input_data: Any) -> pd.DataFrame:
    if isinstance(input_data, pd.DataFrame):
        return input_data.copy()
    if isinstance(input_data, dict):
        return pd.DataFrame([input_data])
    if isinstance(input_data, list):
        return pd.DataFrame(input_data)
    raise TypeError("input_data phải là dict, list[dict], hoặc pandas.DataFrame")


def prepare_feature_frame(
    input_data: Any,
    feature_columns: List[str],
) -> Tuple[pd.DataFrame, pd.DataFrame, List[str], List[str]]:
    raw_df = _to_dataframe(input_data)

    missing_features = [col for col in feature_columns if col not in raw_df.columns]
    extra_input_cols = [col for col in raw_df.columns if col not in feature_columns]

    X = raw_df.copy()

    for col in missing_features:
        X[col] = 0.0

    X = X[feature_columns].copy()

    for col in feature_columns:
        X[col] = pd.to_numeric(X[col], errors="coerce").fillna(0.0)

    return raw_df, X, missing_features, extra_input_cols


def get_positive_class_proba(model, X: pd.DataFrame) -> np.ndarray:
    if hasattr(model, "predict_proba"):
        return model.predict_proba(X)[:, 1]

    if hasattr(model, "decision_function"):
        scores = np.asarray(model.decision_function(X), dtype=float)
        min_s, max_s = scores.min(), scores.max()
        if max_s - min_s < 1e-12:
            return np.full_like(scores, 0.5, dtype=float)
        return (scores - min_s) / (max_s - min_s)

    return np.asarray(model.predict(X), dtype=float)


def run_tabular_inference(
    input_data: Any,
    model_path: Path,
    feature_columns_path: Path,
    metrics_path: Path,
    probability_col: str = "risk_probability",
    prediction_col: str = "prediction",
    prediction_label_col: str = "prediction_label",
    positive_label: str = "Event Likely",
    negative_label: str = "No Event Likely",
    low_risk_max: float = LOW_RISK_MAX,
    medium_risk_max: float = MEDIUM_RISK_MAX,
    include_input_columns: bool = True,
    return_metadata: bool = False,
):
    model = load_model(model_path)
    feature_columns = load_feature_columns(feature_columns_path)
    metrics = load_json(metrics_path)
    threshold = get_threshold_from_metrics(metrics, default=0.5)

    raw_df, X, missing_features, extra_input_cols = prepare_feature_frame(
        input_data=input_data,
        feature_columns=feature_columns,
    )

    probabilities = get_positive_class_proba(model, X)
    predictions = (probabilities >= threshold).astype(int)
    prediction_labels = np.where(predictions == 1, positive_label, negative_label)
    risk_bands = [assign_risk_band(p, low_risk_max, medium_risk_max) for p in probabilities]

    if include_input_columns:
        result = raw_df.copy()
    else:
        result = pd.DataFrame(index=raw_df.index)

    result[probability_col] = np.round(probabilities, 6)
    result["risk_band"] = risk_bands
    result[prediction_col] = predictions
    result[prediction_label_col] = prediction_labels
    result["model_threshold"] = float(threshold)
    result["best_model_name"] = metrics.get("best_model_name", "unknown")

    if "month" in result.columns:
        try:
            result["month"] = pd.to_datetime(result["month"], errors="coerce").dt.strftime("%Y-%m-%d")
        except Exception:
            pass

    preferred_order = [
        "driver_id",
        "truck_id",
        "month",
        probability_col,
        "risk_band",
        prediction_col,
        prediction_label_col,
        "model_threshold",
        "best_model_name",
    ]
    ordered_cols = [c for c in preferred_order if c in result.columns]
    remaining_cols = [c for c in result.columns if c not in ordered_cols]
    result = result[ordered_cols + remaining_cols]

    sort_col = probability_col if probability_col in result.columns else None
    if sort_col is not None:
        result = result.sort_values(sort_col, ascending=False).reset_index(drop=True)

    metadata = {
        "threshold": float(threshold),
        "expected_feature_count": int(len(feature_columns)),
        "used_feature_count": int(X.shape[1]),
        "missing_feature_count": int(len(missing_features)),
        "missing_features": missing_features,
        "extra_input_count": int(len(extra_input_cols)),
        "extra_input_columns": extra_input_cols,
        "target_definition": metrics.get("target_definition"),
        "feature_count_from_training": metrics.get("feature_count"),
    }

    if return_metadata:
        return result, metadata

    return result


def format_prediction_output(
    result_df: pd.DataFrame,
    probability_col: str,
    prediction_col: str,
    prediction_label_col: str,
    max_rows: int | None = None,
) -> str:
    df = result_df.copy()

    if max_rows is not None:
        df = df.head(max_rows)

    display_cols = [
        c for c in [
            "driver_id",
            "truck_id",
            "month",
            probability_col,
            "risk_band",
            prediction_col,
            prediction_label_col,
            "model_threshold",
            "best_model_name",
        ]
        if c in df.columns
    ]

    if display_cols:
        df = df[display_cols]

    return df.to_string(index=False)