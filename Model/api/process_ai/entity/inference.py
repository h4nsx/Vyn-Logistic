from __future__ import annotations

from pathlib import Path
from typing import Any

from ..core.inference_engine import format_prediction_output, run_tabular_inference
from .builders.driver import default_driver_task_spec
from .builders.fleet import default_fleet_task_spec
from .builders.ops import default_ops_task_spec


def resolve_driver_artifact_paths():
    spec = default_driver_task_spec()
    artifact_dir = Path(spec.artifact_dir)

    return {
        "model_path": artifact_dir / "model.pkl",
        "feature_columns_path": artifact_dir / "feature_columns.json",
        "metrics_path": artifact_dir / "metrics.json",
    }


def resolve_fleet_artifact_paths():
    spec = default_fleet_task_spec()
    artifact_dir = Path(spec.artifact_dir)

    return {
        "model_path": artifact_dir / "model.pkl",
        "feature_columns_path": artifact_dir / "feature_columns.json",
        "metrics_path": artifact_dir / "metrics.json",
    }


def resolve_ops_artifact_paths():
    spec = default_ops_task_spec()
    artifact_dir = Path(spec.artifact_dir)

    return {
        "model_path": artifact_dir / "model.pkl",
        "feature_columns_path": artifact_dir / "feature_columns.json",
        "metrics_path": artifact_dir / "metrics.json",
    }


def predict_driver_risk(
    input_data: Any,
    include_input_columns: bool = True,
    return_metadata: bool = False,
):
    paths = resolve_driver_artifact_paths()

    return run_tabular_inference(
        input_data=input_data,
        model_path=paths["model_path"],
        feature_columns_path=paths["feature_columns_path"],
        metrics_path=paths["metrics_path"],
        probability_col="driver_risk_probability",
        prediction_col="driver_prediction",
        prediction_label_col="driver_prediction_label",
        positive_label="Incident Likely",
        negative_label="No Incident Likely",
        include_input_columns=include_input_columns,
        return_metadata=return_metadata,
    )


def predict_fleet_risk(
    input_data: Any,
    include_input_columns: bool = True,
    return_metadata: bool = False,
):
    paths = resolve_fleet_artifact_paths()

    return run_tabular_inference(
        input_data=input_data,
        model_path=paths["model_path"],
        feature_columns_path=paths["feature_columns_path"],
        metrics_path=paths["metrics_path"],
        probability_col="fleet_risk_probability",
        prediction_col="fleet_prediction",
        prediction_label_col="fleet_prediction_label",
        positive_label="Emergency Maintenance Likely",
        negative_label="No Emergency Likely",
        include_input_columns=include_input_columns,
        return_metadata=return_metadata,
    )


def predict_ops_risk(
    input_data: Any,
    include_input_columns: bool = True,
    return_metadata: bool = False,
):
    paths = resolve_ops_artifact_paths()

    return run_tabular_inference(
        input_data=input_data,
        model_path=paths["model_path"],
        feature_columns_path=paths["feature_columns_path"],
        metrics_path=paths["metrics_path"],
        probability_col="ops_risk_probability",
        prediction_col="ops_prediction",
        prediction_label_col="ops_prediction_label",
        positive_label="Severe Ops Disruption Likely",
        negative_label="No Severe Ops Disruption Likely",
        include_input_columns=include_input_columns,
        return_metadata=return_metadata,
    )


def print_driver_prediction_report(result_df, metadata: dict | None = None, max_rows: int | None = None):
    print("=== DRIVER RISK PREDICTION REPORT ===")

    if metadata:
        print(f"Threshold               : {metadata.get('threshold')}")
        print(f"Expected feature count  : {metadata.get('expected_feature_count')}")
        print(f"Used feature count      : {metadata.get('used_feature_count')}")
        print(f"Missing feature count   : {metadata.get('missing_feature_count')}")
        print(f"Extra input count       : {metadata.get('extra_input_count')}")
        print(f"Target definition       : {metadata.get('target_definition')}")

        if metadata.get("missing_features"):
            print(f"Missing features        : {metadata['missing_features']}")

        if metadata.get("extra_input_columns"):
            print(f"Extra input columns     : {metadata['extra_input_columns']}")

    print()
    print(
        format_prediction_output(
            result_df=result_df,
            probability_col="driver_risk_probability",
            prediction_col="driver_prediction",
            prediction_label_col="driver_prediction_label",
            max_rows=max_rows,
        )
    )


def print_fleet_prediction_report(result_df, metadata: dict | None = None, max_rows: int | None = None):
    print("=== FLEET RISK PREDICTION REPORT ===")

    if metadata:
        print(f"Threshold               : {metadata.get('threshold')}")
        print(f"Expected feature count  : {metadata.get('expected_feature_count')}")
        print(f"Used feature count      : {metadata.get('used_feature_count')}")
        print(f"Missing feature count   : {metadata.get('missing_feature_count')}")
        print(f"Extra input count       : {metadata.get('extra_input_count')}")
        print(f"Target definition       : {metadata.get('target_definition')}")

        if metadata.get("missing_features"):
            print(f"Missing features        : {metadata['missing_features']}")

        if metadata.get("extra_input_columns"):
            print(f"Extra input columns     : {metadata['extra_input_columns']}")

    print()
    print(
        format_prediction_output(
            result_df=result_df,
            probability_col="fleet_risk_probability",
            prediction_col="fleet_prediction",
            prediction_label_col="fleet_prediction_label",
            max_rows=max_rows,
        )
    )


def print_ops_prediction_report(result_df, metadata: dict | None = None, max_rows: int | None = None):
    print("=== OPS RISK PREDICTION REPORT ===")

    if metadata:
        print(f"Threshold               : {metadata.get('threshold')}")
        print(f"Expected feature count  : {metadata.get('expected_feature_count')}")
        print(f"Used feature count      : {metadata.get('used_feature_count')}")
        print(f"Missing feature count   : {metadata.get('missing_feature_count')}")
        print(f"Extra input count       : {metadata.get('extra_input_count')}")
        print(f"Target definition       : {metadata.get('target_definition')}")

        if metadata.get("missing_features"):
            print(f"Missing features        : {metadata['missing_features']}")

        if metadata.get("extra_input_columns"):
            print(f"Extra input columns     : {metadata['extra_input_columns']}")

    print()
    print(
        format_prediction_output(
            result_df=result_df,
            probability_col="ops_risk_probability",
            prediction_col="ops_prediction",
            prediction_label_col="ops_prediction_label",
            max_rows=max_rows,
        )
    )