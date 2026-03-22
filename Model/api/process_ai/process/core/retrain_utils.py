import json
import shutil
from datetime import datetime
from pathlib import Path
from typing import Iterable, Optional

import pandas as pd

from api.process_ai.process.process_configs import ProcessConfig, ensure_report_dir


DEFAULT_ARTIFACT_FILES = [
    "model.pkl",
    "scaler.pkl",
    "baselines.json",
    "feature_schema.json",
    "score_quantiles.json",
    "train_summary.json",
]


def build_version_tag() -> str:
    return datetime.now().strftime("%Y%m%d_%H%M%S")


def build_retrain_package_dir(
    versioned_model_dir: str | Path,
    process_code: str,
    version_tag: Optional[str] = None,
) -> Path:
    versioned_model_dir = Path(versioned_model_dir)
    versioned_model_dir.mkdir(parents=True, exist_ok=True)

    version_tag = version_tag or build_version_tag()
    retrain_package_dir = versioned_model_dir / f"{process_code}__{version_tag}"
    retrain_package_dir.mkdir(parents=True, exist_ok=True)
    return retrain_package_dir


def load_current_train_summary(current_model_dir: str | Path) -> dict:
    current_model_dir = Path(current_model_dir)
    summary_path = current_model_dir / "train_summary.json"
    with open(summary_path, "r", encoding="utf-8") as f:
        return json.load(f)


def backup_artifacts(
    current_model_dir: str | Path,
    retrain_package_dir: str | Path,
    artifact_files: Optional[Iterable[str]] = None,
) -> pd.DataFrame:
    current_model_dir = Path(current_model_dir)
    retrain_package_dir = Path(retrain_package_dir)
    retrain_package_dir.mkdir(parents=True, exist_ok=True)

    files = list(artifact_files or DEFAULT_ARTIFACT_FILES)

    rows = []
    for fname in files:
        src = current_model_dir / fname
        dst = retrain_package_dir / fname

        if src.exists():
            shutil.copy2(src, dst)
            copied = True
        else:
            copied = False

        rows.append({
            "artifact": fname,
            "source_exists": src.exists(),
            "copied": copied,
            "backup_path": str(dst.resolve()),
        })

    return pd.DataFrame(rows)


def build_current_manifest_df(
    process_code: str,
    current_model_dir: str | Path,
    current_train_summary: dict,
) -> pd.DataFrame:
    current_model_dir = Path(current_model_dir)
    return pd.DataFrame([{
        "process_code": process_code,
        "current_model_dir": str(current_model_dir.resolve()),
        "trained_with_include_context_numeric": current_train_summary.get("include_context_numeric"),
        "trained_n_estimators": current_train_summary.get("n_estimators"),
        "trained_contamination": current_train_summary.get("contamination"),
        "trained_random_state": current_train_summary.get("random_state"),
    }])


def build_retrain_config_df(
    process_code: str,
    retrain_feature_set: str,
    include_context_numeric: bool,
    n_estimators: int,
    contamination: float,
    random_state: int,
) -> pd.DataFrame:
    return pd.DataFrame([{
        "process_code": process_code,
        "retrain_feature_set": retrain_feature_set,
        "include_context_numeric": include_context_numeric,
        "n_estimators": n_estimators,
        "contamination": contamination,
        "random_state": random_state,
    }])


def build_retrain_decision_df(
    backup_status_df: pd.DataFrame,
    registry_loaded: bool,
    current_model_exists: bool,
    retrain_config_ready: bool,
    retrain_executed_now: bool,
) -> pd.DataFrame:
    return pd.DataFrame([
        {"decision_item": "backup_completed", "status": bool(backup_status_df["copied"].all())},
        {"decision_item": "registry_loaded", "status": bool(registry_loaded)},
        {"decision_item": "current_model_exists", "status": bool(current_model_exists)},
        {"decision_item": "retrain_config_ready", "status": bool(retrain_config_ready)},
        {"decision_item": "retrain_executed_now", "status": bool(retrain_executed_now)},
    ])


def build_acceptance_criteria_df(items: Optional[list[dict]] = None) -> pd.DataFrame:
    if items is None:
        items = [
            {"metric": "anomaly_rate_stable", "description": "Tỷ lệ anomaly không lệch bất hợp lý sau retrain"},
            {"metric": "top_steps_stable", "description": "Top bottleneck steps không thay đổi vô lý"},
            {"metric": "score_distribution_reasonable", "description": "Phân phối score còn đủ phân tán"},
            {"metric": "artifacts_complete", "description": "Đủ model/scaler/baselines/schema/quantiles/summary"},
            {"metric": "rollback_possible", "description": "Có backup artifact trước retrain"},
        ]
    return pd.DataFrame(items)


def build_rollback_manifest_df(
    process_code: str,
    rollback_source_dir: str | Path,
    rollback_target_dir: str | Path,
) -> pd.DataFrame:
    rollback_source_dir = Path(rollback_source_dir)
    rollback_target_dir = Path(rollback_target_dir)

    return pd.DataFrame([{
        "process_code": process_code,
        "rollback_source_dir": str(rollback_source_dir.resolve()),
        "rollback_target_dir": str(rollback_target_dir.resolve()),
        "rollback_rule": "Nếu model mới không đạt acceptance criteria thì copy artifact backup về target_dir",
    }])


def export_retrain_reports(
    cfg: ProcessConfig,
    current_manifest_df: pd.DataFrame,
    data_footprint_df: pd.DataFrame,
    registry_snapshot_df: pd.DataFrame,
    backup_status_df: pd.DataFrame,
    retrain_config_df: pd.DataFrame,
    retrain_decision_df: pd.DataFrame,
    acceptance_criteria_df: pd.DataFrame,
    rollback_manifest_df: pd.DataFrame,
) -> Path:
    out_dir = ensure_report_dir(cfg)

    current_manifest_df.to_csv(out_dir / "retrain_current_manifest.csv", index=False, encoding="utf-8-sig")
    data_footprint_df.to_csv(out_dir / "retrain_data_footprint.csv", index=False, encoding="utf-8-sig")
    registry_snapshot_df.to_csv(out_dir / "retrain_registry_snapshot.csv", index=False, encoding="utf-8-sig")
    backup_status_df.to_csv(out_dir / "retrain_backup_status.csv", index=False, encoding="utf-8-sig")
    retrain_config_df.to_csv(out_dir / "retrain_config.csv", index=False, encoding="utf-8-sig")
    retrain_decision_df.to_csv(out_dir / "retrain_decision_checklist.csv", index=False, encoding="utf-8-sig")
    acceptance_criteria_df.to_csv(out_dir / "retrain_acceptance_criteria.csv", index=False, encoding="utf-8-sig")
    rollback_manifest_df.to_csv(out_dir / "retrain_rollback_manifest.csv", index=False, encoding="utf-8-sig")

    return out_dir