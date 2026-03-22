import json
from pathlib import Path
from typing import Dict, Any, Tuple

import numpy as np
import pandas as pd

from api.process_ai.process.core.inference import load_process_artifacts
from api.process_ai.process.core.validate import validate_events_df
from api.process_ai.process.core.features import build_case_feature_matrix
from api.process_ai.process.process_configs import ProcessConfig, ensure_report_dir


def risk_from_quantiles(raw_anomaly: float, quantiles: list) -> int:
    q = np.array(quantiles, dtype=float)
    idx = int(np.searchsorted(q, raw_anomaly, side="right") - 1)
    return int(max(0, min(100, idx)))


def compute_top_step_from_row(row: pd.Series, art) -> Dict[str, Any]:
    best_step_name = None
    best_step_index = 0
    best_dev = -1.0
    best_dur = 0.0
    best_p95 = 0.0
    best_z = 0.0

    for i, s in enumerate(art.step_codes, start=1):
        dur = float(row.get(f"{s}_duration_min", 0.0))
        b = art.baselines.get("steps", {}).get(s, {})
        mean = float(b.get("mean", 0.0))
        std = float(b.get("std", 0.0))
        p95 = float(b.get("p95", 0.0))

        dev = (dur / p95) if p95 > 0 else 0.0
        z = ((dur - mean) / std) if std > 1e-9 else 0.0

        if dev > best_dev:
            best_step_name = s
            best_step_index = i
            best_dev = dev
            best_dur = dur
            best_p95 = p95
            best_z = z

    return {
        "top_step_name": best_step_name,
        "top_step_index": int(best_step_index),
        "top_step_deviation_p95": round(float(best_dev), 3),
        "top_step_p95_min": round(float(best_p95), 3),
        "top_step_zscore": round(float(best_z), 3),
        "top_step_duration_min": round(float(best_dur), 3),
    }


def load_validation_inputs(cfg: ProcessConfig) -> Tuple[pd.DataFrame, pd.DataFrame, Any, bool]:
    events_path = Path(cfg.data_dir) / "events.csv"
    ctx_path = Path(cfg.data_dir) / "cases_context.csv"

    events_raw = pd.read_csv(events_path)
    events = events_raw[events_raw["process_code"] == cfg.process_code].copy()

    art = load_process_artifacts(
        process_code=cfg.process_code,
        model_root_dir=cfg.model_dir,
        registry_dir=cfg.registry_dir,
    )

    events_valid, rep = validate_events_df(
        events.copy(),
        process_code=cfg.process_code,
        valid_steps=art.step_codes,
        allow_unknown_steps=False,
    )

    if not getattr(rep, "ok", False):
        raise ValueError(f"Validation failed for {cfg.process_code}: {getattr(rep, 'errors', [])}")

    ctx_raw = pd.read_csv(ctx_path)
    valid_case_ids = set(events_valid["case_id"].astype(str).unique())
    ctx = ctx_raw[ctx_raw["case_id"].astype(str).isin(valid_case_ids)].copy()

    train_summary_path = Path(cfg.model_dir) / cfg.process_code / "train_summary.json"
    with open(train_summary_path, "r", encoding="utf-8") as f:
        train_summary = json.load(f)

    include_context_numeric = bool(train_summary.get("include_context_numeric", False))
    return events_valid, ctx, art, include_context_numeric


def build_validation_results(
    cfg: ProcessConfig,
    events_valid: pd.DataFrame,
    ctx: pd.DataFrame,
    art,
    include_context_numeric: bool,
) -> pd.DataFrame:
    results = []

    for case_id, one in events_valid.groupby("case_id", sort=False):
        feat_df, _, _ = build_case_feature_matrix(
            one,
            step_codes=art.step_codes,
            cases_context_df=ctx if include_context_numeric else None,
            include_context_numeric=include_context_numeric,
        )

        if feat_df.empty:
            continue

        feat_df = feat_df.fillna(0.0)
        row = feat_df.iloc[0]

        X = row.values.reshape(1, -1).astype(float)
        Xs = art.scaler.transform(X)

        raw_anomaly = float(-art.model.score_samples(Xs)[0])
        risk_score = risk_from_quantiles(raw_anomaly, art.score_quantiles)
        top = compute_top_step_from_row(row, art)

        results.append({
            "process_code": cfg.process_code,
            "case_id": str(case_id),
            "risk_score": int(risk_score),
            "anomaly_score": round(float(raw_anomaly), 6),
            "is_anomaly": bool(risk_score >= 80),
            "total_process_time_min": round(float(row.get("total_process_time_min", 0.0)), 3),
            **top,
        })

    return pd.DataFrame(results)


def build_summary_df(results_df: pd.DataFrame, cfg: ProcessConfig) -> pd.DataFrame:
    dominant_step_name = results_df["top_step_name"].mode().iloc[0]
    dominant_step_case_count = int((results_df["top_step_name"] == dominant_step_name).sum())

    return pd.DataFrame([{
        "process_code": cfg.process_code,
        "case_count": int(len(results_df)),
        "avg_risk_score": round(float(results_df["risk_score"].mean()), 3),
        "avg_anomaly_score": round(float(results_df["anomaly_score"].mean()), 6),
        "anomaly_count": int(results_df["is_anomaly"].sum()),
        "anomaly_rate": round(float(results_df["is_anomaly"].mean()), 4),
        "dominant_step_name": dominant_step_name,
        "dominant_step_case_count": dominant_step_case_count,
        "dominant_step_case_rate": round(dominant_step_case_count / max(1, len(results_df)), 4),
        "avg_dominant_step_duration_min": round(
            float(
                results_df.loc[
                    results_df["top_step_name"] == dominant_step_name,
                    "top_step_duration_min"
                ].mean()
            ),
            3,
        ),
        "avg_total_process_time_min": round(float(results_df["total_process_time_min"].mean()), 3),
        "max_risk_score": int(results_df["risk_score"].max()),
    }])


def build_top_steps_df(results_df: pd.DataFrame, top_n: int = 8) -> pd.DataFrame:
    top_steps_df = (
        results_df["top_step_name"]
        .value_counts()
        .head(top_n)
        .reset_index()
    )
    top_steps_df.columns = ["top_step_name", "case_count"]
    top_steps_df["case_rate_pct"] = (
        top_steps_df["case_count"] / max(1, len(results_df)) * 100
    ).round(2)
    return top_steps_df


def build_step_duration_df(results_df: pd.DataFrame) -> pd.DataFrame:
    return (
        results_df.groupby("top_step_name")
        .agg(
            avg_top_step_duration_min=("top_step_duration_min", "mean"),
            case_count=("case_id", "count"),
        )
        .reset_index()
        .sort_values("avg_top_step_duration_min", ascending=False)
    )


def build_score_summary_df(results_df: pd.DataFrame) -> pd.DataFrame:
    scores = results_df["anomaly_score"].values
    return pd.DataFrame([{
        "score_mean": round(float(np.mean(scores)), 6),
        "score_std": round(float(np.std(scores)), 6),
        "score_min": round(float(np.min(scores)), 6),
        "score_p50": round(float(np.percentile(scores, 50)), 6),
        "score_p80": round(float(np.percentile(scores, 80)), 6),
        "score_p95": round(float(np.percentile(scores, 95)), 6),
        "score_max": round(float(np.max(scores)), 6),
    }])


def build_executive_view_df(results_df: pd.DataFrame, cfg: ProcessConfig) -> pd.DataFrame:
    dominant_step_name = results_df["top_step_name"].mode().iloc[0]
    dominant_step_case_count = int((results_df["top_step_name"] == dominant_step_name).sum())

    return pd.DataFrame([{
        "process_code": cfg.process_code,
        "case_count": int(len(results_df)),
        "avg_risk_score": round(float(results_df["risk_score"].mean()), 3),
        "anomaly_rate": round(float(results_df["is_anomaly"].mean()), 4),
        "dominant_step_name": dominant_step_name,
        "dominant_step_case_rate": round(dominant_step_case_count / max(1, len(results_df)), 4),
        "avg_total_process_time_min": round(float(results_df["total_process_time_min"].mean()), 3),
    }])


def build_ranking_summary_df(results_df: pd.DataFrame) -> pd.DataFrame:
    rank_df = (
        results_df[["case_id", "anomaly_score", "is_anomaly"]]
        .sort_values("anomaly_score", ascending=False)
        .reset_index(drop=True)
        .copy()
    )
    anomaly_count = int(rank_df["is_anomaly"].sum())

    return pd.DataFrame([{
        "case_count": int(len(rank_df)),
        "anomaly_count": int(anomaly_count),
        "anomaly_rate": round(float(anomaly_count / max(1, len(rank_df))), 4),
        "score_max": round(float(rank_df["anomaly_score"].max()), 6),
        "score_p95": round(float(np.percentile(rank_df["anomaly_score"], 95)), 6),
        "score_p80": round(float(np.percentile(rank_df["anomaly_score"], 80)), 6),
        "score_min": round(float(rank_df["anomaly_score"].min()), 6),
    }])


def export_validation_reports(
    cfg: ProcessConfig,
    summary_df: pd.DataFrame,
    results_df: pd.DataFrame,
    top_steps_df: pd.DataFrame,
    step_duration_df: pd.DataFrame,
    score_summary_df: pd.DataFrame,
    executive_view_df: pd.DataFrame,
    ranking_summary_df: pd.DataFrame,
) -> Path:
    out_dir = ensure_report_dir(cfg)

    top_cases_df = results_df.sort_values(
        ["risk_score", "anomaly_score"],
        ascending=False
    ).head(20)

    summary_df.to_csv(out_dir / "model_validation_summary.csv", index=False, encoding="utf-8-sig")
    results_df.to_csv(out_dir / "model_validation_case_results.csv", index=False, encoding="utf-8-sig")
    top_steps_df.to_csv(out_dir / "model_validation_top_steps.csv", index=False, encoding="utf-8-sig")
    step_duration_df.to_csv(out_dir / "model_validation_step_duration.csv", index=False, encoding="utf-8-sig")
    top_cases_df.to_csv(out_dir / "model_validation_top_cases.csv", index=False, encoding="utf-8-sig")
    score_summary_df.to_csv(out_dir / "model_validation_score_summary.csv", index=False, encoding="utf-8-sig")
    executive_view_df.to_csv(out_dir / "model_validation_executive_view.csv", index=False, encoding="utf-8-sig")
    ranking_summary_df.to_csv(out_dir / "model_validation_ranking_summary.csv", index=False, encoding="utf-8-sig")

    return out_dir