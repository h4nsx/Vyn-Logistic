from __future__ import annotations

import json
from dataclasses import dataclass
from typing import Any, Dict, List, Optional, Tuple

import numpy as np
import pandas as pd


@dataclass
class FeatureBuildReport:
    cases: int
    dropped_cases: int
    repeated_case_count: int
    missing_step_cases: int


def _duration_minutes(df: pd.DataFrame) -> pd.Series:
    # expects duration_sec exists
    return df["duration_sec"] / 60.0


def build_case_feature_matrix(
    events_df: pd.DataFrame,
    step_codes: List[str],
    cases_context_df: Optional[pd.DataFrame] = None,
    include_context_numeric: bool = True,
) -> Tuple[pd.DataFrame, Dict[str, Any], FeatureBuildReport]:
    """
    Converts event rows -> one numeric row per case_id.

    Output columns:
      - <STEP_CODE>_duration_min for each step in registry
      - total_process_time_min, max_step_duration_min, mean_step_duration_min, std_step_duration_min
      - step_count_present, missing_step_flag, repeated_step_flag, repeated_step_total
      - (optional) numeric context columns (excluding debug columns)
    """
    df = events_df.copy()

    # Aggregate repeated steps per case: sum durations, but also count repeats
    df["duration_min"] = _duration_minutes(df)

    # Count occurrences per (case, step)
    counts = df.groupby(["case_id", "step_code"]).size().rename("step_occurrences").reset_index()

    # Sum duration per (case, step)
    agg = (
        df.groupby(["case_id", "step_code"], as_index=False)["duration_min"]
        .sum()
        .rename(columns={"duration_min": "step_duration_min"})
    )
    agg = agg.merge(counts, on=["case_id", "step_code"], how="left")

    # Pivot to wide
    pivot = agg.pivot(index="case_id", columns="step_code", values="step_duration_min")
    # Ensure all steps exist as columns
    for s in step_codes:
        if s not in pivot.columns:
            pivot[s] = np.nan
    pivot = pivot[step_codes]  # order by registry
    pivot = pivot.fillna(0.0)

    # Rename step columns
    pivot = pivot.rename(columns={s: f"{s}_duration_min" for s in step_codes})

    # Repeated flags
    rep = agg[agg["step_occurrences"] > 1].copy()
    repeated_by_case = rep.groupby("case_id")["step_occurrences"].sum().rename("repeated_step_total")
    repeated_flag = (repeated_by_case > 0).astype(int).rename("repeated_step_flag")

    # Missing steps: any step duration = 0
    step_cols = [f"{s}_duration_min" for s in step_codes]
    missing_count = (pivot[step_cols] == 0).sum(axis=1).rename("missing_step_count")
    missing_flag = (missing_count > 0).astype(int).rename("missing_step_flag")

    # Step count present
    present_count = (pivot[step_cols] > 0).sum(axis=1).rename("step_count_present")

    # Process-level metrics
    total_time = pivot[step_cols].sum(axis=1).rename("total_process_time_min")
    max_step = pivot[step_cols].max(axis=1).rename("max_step_duration_min")
    mean_step = pivot[step_cols].replace(0, np.nan).mean(axis=1).fillna(0.0).rename("mean_step_duration_min")
    std_step = pivot[step_cols].replace(0, np.nan).std(axis=1).fillna(0.0).rename("std_step_duration_min")

    # Assemble
    feat = pivot.copy()
    feat = feat.join([total_time, max_step, mean_step, std_step, present_count, missing_count, missing_flag], how="left")
    feat = feat.join([repeated_by_case, repeated_flag], how="left")
    feat["repeated_step_total"] = feat["repeated_step_total"].fillna(0).astype(int)
    feat["repeated_step_flag"] = feat["repeated_step_flag"].fillna(0).astype(int)

    # Merge context numeric (optional)
    if cases_context_df is not None and include_context_numeric:
        ctx = cases_context_df.copy()
        if "case_id" not in ctx.columns:
            raise ValueError("cases_context_df must include case_id")

        # Drop debug/label columns if present
        drop_cols = {"scenario_tag", "mix_type"}
        cols_to_keep = [c for c in ctx.columns if c not in drop_cols]

        ctx = ctx[cols_to_keep].copy()

        # Keep numeric only + case_id (avoid strings)
        numeric_cols = [c for c in ctx.columns if c == "case_id" or pd.api.types.is_numeric_dtype(ctx[c])]
        ctx = ctx[numeric_cols].copy()

        feat = feat.reset_index().merge(ctx, on="case_id", how="left").set_index("case_id")

        # Fill NaNs for numeric context with 0 (safe default)
        for c in feat.columns:
            if c not in step_cols and pd.api.types.is_numeric_dtype(feat[c]):
                feat[c] = feat[c].fillna(0.0)

    # Feature schema (ordered)
    schema = {
        "step_codes": step_codes,
        "step_feature_cols": step_cols,
        "all_feature_cols": list(feat.columns),
    }

    # Report
    repeated_case_count = int((feat["repeated_step_flag"] > 0).sum()) if "repeated_step_flag" in feat.columns else 0
    missing_step_cases = int((feat["missing_step_flag"] > 0).sum()) if "missing_step_flag" in feat.columns else 0

    report = FeatureBuildReport(
        cases=int(feat.shape[0]),
        dropped_cases=0,
        repeated_case_count=repeated_case_count,
        missing_step_cases=missing_step_cases,
    )

    return feat, schema, report


def compute_baselines(
    feature_df: pd.DataFrame,
    step_codes: List[str],
    normal_case_ids: Optional[List[str]] = None,
) -> Dict[str, Any]:
    """
    Computes baselines (mean/std/p95/p99) per step and for total_process_time_min.
    Baselines are computed using ONLY normal_case_ids if provided.
    """
    df = feature_df.copy()
    if normal_case_ids is not None:
        df = df[df.index.isin(normal_case_ids)].copy()

    step_cols = [f"{s}_duration_min" for s in step_codes]

    baselines_steps: Dict[str, Any] = {}
    for s, col in zip(step_codes, step_cols):
        x = df[col].astype(float)
        present = x[x > 0]
        missing_rate = float((x == 0).mean())
        if len(present) == 0:
            baselines_steps[s] = {
                "mean": 0.0,
                "std": 0.0,
                "p95": 0.0,
                "p99": 0.0,
                "missing_rate": missing_rate,
            }
            continue

        baselines_steps[s] = {
            "mean": float(present.mean()),
            "std": float(present.std(ddof=0)),
            "p95": float(np.quantile(present, 0.95)),
            "p99": float(np.quantile(present, 0.99)),
            "missing_rate": missing_rate,
        }

    total = df["total_process_time_min"].astype(float) if "total_process_time_min" in df.columns else pd.Series(dtype=float)
    total_present = total[total > 0]
    total_stats = {
        "mean": float(total_present.mean()) if len(total_present) else 0.0,
        "std": float(total_present.std(ddof=0)) if len(total_present) else 0.0,
        "p95": float(np.quantile(total_present, 0.95)) if len(total_present) else 0.0,
        "p99": float(np.quantile(total_present, 0.99)) if len(total_present) else 0.0,
    }

    return {
        "steps": baselines_steps,
        "total_process_time_min": total_stats,
        "n_cases_for_baseline": int(df.shape[0]),
    }
