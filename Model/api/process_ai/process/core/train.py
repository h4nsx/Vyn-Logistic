from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Dict

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler

from api.process_ai.process.core.registry_loader import load_registry, get_step_codes
from api.process_ai.process.core.validate import validate_events_df
from api.process_ai.process.core.features import build_case_feature_matrix, compute_baselines


def _ensure_dir(path: Path) -> None:
    path.mkdir(parents=True, exist_ok=True)


def train_process_model(
    data_dir: str | Path,
    registry_dir: str | Path,
    model_root_dir: str | Path,
    process_code: str,
    events_filename: str = "events.csv",
    context_filename: str = "cases_context.csv",
    include_context_numeric: bool = False,
    n_estimators: int = 200,
    contamination: float = 0.06,
    random_state: int = 42,
    allow_unknown_steps: bool = False,
) -> Dict[str, Any]:
    """
    Trains 1 IsolationForest model for 1 process_code.
    Saves artifacts under: <model_root_dir>/<process_code>/
    """
    data_dir = Path(data_dir)
    registry_dir = Path(registry_dir)
    model_root_dir = Path(model_root_dir)

    reg = load_registry(registry_dir, process_code)
    step_codes = get_step_codes(reg)

    events_path = data_dir / events_filename
    if not events_path.exists():
        raise FileNotFoundError(f"Events file not found: {events_path}")

    df_events = pd.read_csv(events_path)

    # validate + parse + duration_sec
    df_events, report = validate_events_df(
        df_events,
        process_code=process_code,
        valid_steps=step_codes,
        allow_unknown_steps=allow_unknown_steps,
    )
    if not report.ok:
        raise ValueError("Event validation failed:\n" + "\n".join(report.errors))

    # Load context (optional)
    ctx_path = data_dir / context_filename
    ctx_df = None
    normal_case_ids = None
    if ctx_path.exists():
        ctx_df = pd.read_csv(ctx_path)
        # Use mix_type to compute baselines from NORMAL_LIKE only (if present)
        if "mix_type" in ctx_df.columns:
            normal_case_ids = ctx_df.loc[ctx_df["mix_type"] == "NORMAL_LIKE", "case_id"].astype(str).tolist()

    # Build feature matrix
    feat_df, schema, feat_report = build_case_feature_matrix(
        df_events,
        step_codes=step_codes,
        cases_context_df=ctx_df,
        include_context_numeric=include_context_numeric,
    )

    # Scale + train
    X = feat_df.values.astype(float)
    scaler = StandardScaler()
    Xs = scaler.fit_transform(X)

    model = IsolationForest(
        n_estimators=n_estimators,
        contamination=contamination,
        random_state=random_state,
    )
    model.fit(Xs)

    # Score: higher = more anomalous
    raw_anomaly = (-model.score_samples(Xs)).astype(float)

    # Save quantiles for risk mapping (percentile)
    # 0..100 percentiles
    q = np.quantile(raw_anomaly, np.linspace(0, 1, 101)).astype(float).tolist()

    # Baselines (use normal-like subset if available)
    baselines = compute_baselines(feat_df, step_codes=step_codes, normal_case_ids=normal_case_ids)

    # Persist artifacts
    out_dir = model_root_dir / process_code
    _ensure_dir(out_dir)

    joblib.dump(model, out_dir / "model.pkl")
    joblib.dump(scaler, out_dir / "scaler.pkl")

    (out_dir / "feature_schema.json").write_text(
        json.dumps(schema, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    (out_dir / "baselines.json").write_text(
        json.dumps(baselines, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    (out_dir / "score_quantiles.json").write_text(
        json.dumps({"raw_anomaly_quantiles": q}, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    # Training summary
    summary = {
        "process_code": process_code,
        "events_rows_used": int(report.rows),
        "cases_used": int(feat_df.shape[0]),
        "include_context_numeric": bool(include_context_numeric),
        "n_estimators": n_estimators,
        "contamination": contamination,
        "random_state": random_state,
        "artifacts_dir": str(out_dir),
        "validation_warnings": report.warnings,
        "feature_report": feat_report.__dict__,
    }
    (out_dir / "train_summary.json").write_text(
        json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    return summary
