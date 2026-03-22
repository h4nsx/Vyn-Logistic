from __future__ import annotations

from pathlib import Path
from typing import Dict, List, Tuple

import numpy as np
import pandas as pd

from ...core.task_spec import TaskSpec
from ..entity_configs import get_entity_task_spec

PROJECT_ROOT = Path(__file__).resolve().parents[4]

DRIVER_TARGET_COL = "target_next_3m_incident"

CURATED_FEATURES = [
    "years_experience",
    "age_years",
    "tenure_months",
    "trips_completed",
    "trips_completed_avg_3m",
    "trips_completed_delta_1m",
    "total_miles",
    "total_miles_avg_3m",
    "total_miles_delta_1m",
    "total_revenue",
    "total_revenue_avg_3m",
    "total_revenue_delta_1m",
    "average_mpg",
    "average_mpg_avg_3m",
    "average_mpg_delta_1m",
    "on_time_delivery_rate",
    "on_time_delivery_rate_avg_3m",
    "on_time_delivery_rate_delta_1m",
    "average_idle_hours",
    "average_idle_hours_avg_3m",
    "average_idle_hours_delta_1m",
    "incident_count_last_3m",
    "incident_count_last_6m",
    "incident_count_last_12m",
    "at_fault_count_last_3m",
    "at_fault_count_last_6m",
    "preventable_count_last_3m",
    "preventable_count_last_6m",
    "claim_amount_sum_last_6m",
    "vehicle_damage_cost_sum_last_6m",
    "months_since_last_incident",
    "months_since_last_at_fault_incident",
    "months_since_last_preventable_incident",
    "incident_rate_per_1000_miles_3m",
    "claim_rate_per_mile_6m",
]


def default_driver_task_spec() -> TaskSpec:
    return get_entity_task_spec("driver_ai")


def resolve_driver_data_paths() -> Dict[str, Path]:
    candidates = [
        PROJECT_ROOT / "data" / "entity_data" / "driver",
        PROJECT_ROOT / "data" / "archive",
    ]

    for base in candidates:
        drivers = base / "drivers.csv"
        safety = base / "safety_incidents.csv"
        metrics = base / "driver_monthly_metrics.csv"

        if drivers.exists() and safety.exists() and metrics.exists():
            return {
                "drivers": drivers,
                "safety": safety,
                "metrics": metrics,
            }

    searched = "\n".join(str(p) for p in candidates)
    raise FileNotFoundError(
        "Không tìm thấy bộ dữ liệu driver cần thiết.\n"
        f"Đã tìm trong:\n{searched}"
    )


def load_driver_tables() -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
    paths = resolve_driver_data_paths()

    drivers = pd.read_csv(paths["drivers"])
    safety = pd.read_csv(paths["safety"])
    metrics = pd.read_csv(paths["metrics"])

    for col in ["hire_date", "termination_date", "date_of_birth"]:
        if col in drivers.columns:
            drivers[col] = pd.to_datetime(drivers[col], errors="coerce")

    if "incident_date" in safety.columns:
        safety["incident_date"] = pd.to_datetime(safety["incident_date"], errors="coerce")
        safety["incident_month"] = safety["incident_date"].dt.to_period("M").dt.to_timestamp()

    if "month" in metrics.columns:
        metrics["month"] = pd.to_datetime(metrics["month"], errors="coerce")
        metrics["month"] = metrics["month"].dt.to_period("M").dt.to_timestamp()

    return drivers, safety, metrics


def build_driver_static_table(drivers: pd.DataFrame) -> pd.DataFrame:
    keep_cols = [
        "driver_id",
        "hire_date",
        "termination_date",
        "date_of_birth",
        "years_experience",
    ]
    existing = [c for c in keep_cols if c in drivers.columns]
    return drivers[existing].copy()


def build_monthly_incident_table(safety: pd.DataFrame) -> pd.DataFrame:
    df = safety.copy()

    for col in ["at_fault_flag", "injury_flag", "preventable_flag"]:
        if col in df.columns:
            df[col] = df[col].fillna(False).astype(int)

    for col in ["vehicle_damage_cost", "cargo_damage_cost", "claim_amount"]:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0.0)

    df["incident_count"] = 1

    grouped = (
        df.groupby(["driver_id", "incident_month"], as_index=False)
        .agg(
            incident_count=("incident_count", "sum"),
            at_fault_count=("at_fault_flag", "sum"),
            injury_count=("injury_flag", "sum"),
            preventable_count=("preventable_flag", "sum"),
            vehicle_damage_cost_sum=("vehicle_damage_cost", "sum"),
            cargo_damage_cost_sum=("cargo_damage_cost", "sum"),
            claim_amount_sum=("claim_amount", "sum"),
        )
        .sort_values(["driver_id", "incident_month"])
        .reset_index(drop=True)
    )

    grouped["has_incident"] = (grouped["incident_count"] > 0).astype(int)
    grouped["has_at_fault_incident"] = (grouped["at_fault_count"] > 0).astype(int)
    grouped["has_preventable_incident"] = (grouped["preventable_count"] > 0).astype(int)

    return grouped


def _months_since_last_flag(series: pd.Series) -> pd.Series:
    values = series.fillna(0).astype(int).tolist()
    out = []
    months_since = None

    for val in values:
        if val > 0:
            months_since = 0
            out.append(0)
        else:
            if months_since is None:
                out.append(99)
            else:
                months_since += 1
                out.append(months_since)

    return pd.Series(out, index=series.index)


def build_next_3m_target(metrics: pd.DataFrame, monthly_incidents: pd.DataFrame) -> pd.DataFrame:
    base_keys = metrics[["driver_id", "month"]].drop_duplicates().copy()

    incident_base = monthly_incidents[["driver_id", "incident_month", "incident_count"]].copy()
    target = base_keys.copy()

    for horizon in [1, 2, 3]:
        temp = incident_base.copy()
        temp["month"] = temp["incident_month"] - pd.DateOffset(months=horizon)

        temp = (
            temp.groupby(["driver_id", "month"], as_index=False)["incident_count"]
            .sum()
            .rename(columns={"incident_count": f"incident_in_{horizon}m_count"})
        )
        target = target.merge(temp, on=["driver_id", "month"], how="left")

    for col in ["incident_in_1m_count", "incident_in_2m_count", "incident_in_3m_count"]:
        target[col] = target[col].fillna(0).astype(int)

    target["target_next_3m_incident_count"] = (
        target["incident_in_1m_count"]
        + target["incident_in_2m_count"]
        + target["incident_in_3m_count"]
    )
    target[DRIVER_TARGET_COL] = (target["target_next_3m_incident_count"] > 0).astype(int)

    # Chỉ giữ các dòng có đủ 3 tháng tương lai
    future_keys = base_keys.copy()

    target["month_p1"] = target["month"] + pd.DateOffset(months=1)
    target["month_p2"] = target["month"] + pd.DateOffset(months=2)
    target["month_p3"] = target["month"] + pd.DateOffset(months=3)

    future_1 = future_keys.rename(columns={"month": "month_p1"}).assign(has_p1=1)
    future_2 = future_keys.rename(columns={"month": "month_p2"}).assign(has_p2=1)
    future_3 = future_keys.rename(columns={"month": "month_p3"}).assign(has_p3=1)

    target = target.merge(future_1, on=["driver_id", "month_p1"], how="left")
    target = target.merge(future_2, on=["driver_id", "month_p2"], how="left")
    target = target.merge(future_3, on=["driver_id", "month_p3"], how="left")

    target = target[
        (target["has_p1"] == 1) &
        (target["has_p2"] == 1) &
        (target["has_p3"] == 1)
    ].copy()

    target = target.drop(
        columns=["month_p1", "month_p2", "month_p3", "has_p1", "has_p2", "has_p3"]
    )

    target = target.sort_values(["driver_id", "month"]).reset_index(drop=True)
    return target


def build_driver_month_feature_frame(
    metrics: pd.DataFrame,
    driver_static: pd.DataFrame,
    monthly_incidents: pd.DataFrame,
) -> pd.DataFrame:
    df = metrics.copy().sort_values(["driver_id", "month"]).reset_index(drop=True)
    df = df.merge(driver_static, on="driver_id", how="left")

    # Age + tenure
    df["age_years"] = ((df["month"] - df["date_of_birth"]).dt.days / 365.25).clip(lower=18)
    df["tenure_months"] = (
        (df["month"].dt.year - df["hire_date"].dt.year) * 12
        + (df["month"].dt.month - df["hire_date"].dt.month)
    )

    incident_df = monthly_incidents.rename(columns={"incident_month": "month"}).copy()
    incident_cols = [c for c in incident_df.columns if c not in ["driver_id", "month"]]

    df = df.merge(
        incident_df[["driver_id", "month"] + incident_cols],
        on=["driver_id", "month"],
        how="left",
    )

    if incident_cols:
        df[incident_cols] = df[incident_cols].fillna(0)

    grp = df.groupby("driver_id", group_keys=False)

    base_metric_cols = [
        "trips_completed",
        "total_miles",
        "total_revenue",
        "average_mpg",
        "on_time_delivery_rate",
        "average_idle_hours",
    ]

    # Base rolling / lag / delta
    for col in base_metric_cols:
        if col not in df.columns:
            df[col] = 0.0

        df[f"{col}_avg_3m"] = grp[col].transform(lambda s: s.rolling(3, min_periods=1).mean())
        df[f"{col}_lag1"] = grp[col].shift(1)
        df[f"{col}_delta_1m"] = df[col] - df[f"{col}_lag1"]

    # Need rolling miles sums for rates
    if "total_miles" not in df.columns:
        df["total_miles"] = 0.0

    df["total_miles_sum_3m"] = grp["total_miles"].transform(lambda s: s.rolling(3, min_periods=1).sum())
    df["total_miles_sum_6m"] = grp["total_miles"].transform(lambda s: s.rolling(6, min_periods=1).sum())

    history_cols = [
        "incident_count",
        "at_fault_count",
        "preventable_count",
        "claim_amount_sum",
        "vehicle_damage_cost_sum",
    ]

    for col in history_cols:
        if col not in df.columns:
            df[col] = 0.0

        df[f"{col}_last_3m"] = grp[col].transform(lambda s: s.rolling(3, min_periods=1).sum())
        df[f"{col}_last_6m"] = grp[col].transform(lambda s: s.rolling(6, min_periods=1).sum())
        df[f"{col}_last_12m"] = grp[col].transform(lambda s: s.rolling(12, min_periods=1).sum())

    # Months since flags
    for flag_col, out_col in [
        ("has_incident", "months_since_last_incident"),
        ("has_at_fault_incident", "months_since_last_at_fault_incident"),
        ("has_preventable_incident", "months_since_last_preventable_incident"),
    ]:
        if flag_col not in df.columns:
            df[flag_col] = 0

        df[out_col] = (
            grp[flag_col]
            .apply(_months_since_last_flag)
            .reset_index(level=0, drop=True)
        )

    # Ratios
    df["incident_rate_per_1000_miles_3m"] = (
        df["incident_count_last_3m"] / (df["total_miles_sum_3m"] / 1000.0 + 1e-6)
    )
    df["claim_rate_per_mile_6m"] = (
        df["claim_amount_sum_last_6m"] / (df["total_miles_sum_6m"] + 1e-6)
    )

    # Fill lag/delta
    lag_cols = [c for c in df.columns if c.endswith("_lag1")]
    for col in lag_cols:
        source = col.replace("_lag1", "")
        df[col] = df[col].fillna(df[source])

    delta_cols = [c for c in df.columns if c.endswith("_delta_1m")]
    for col in delta_cols:
        df[col] = df[col].fillna(0.0)

    # Clean numeric
    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    df[numeric_cols] = df[numeric_cols].replace([np.inf, -np.inf], np.nan).fillna(0.0)

    drop_cols = [c for c in ["hire_date", "termination_date", "date_of_birth"] if c in df.columns]
    if drop_cols:
        df = df.drop(columns=drop_cols)

    return df.sort_values(["driver_id", "month"]).reset_index(drop=True)


def build_driver_training_frame() -> pd.DataFrame:
    drivers, safety, metrics = load_driver_tables()

    driver_static = build_driver_static_table(drivers)
    monthly_incidents = build_monthly_incident_table(safety)

    feature_frame = build_driver_month_feature_frame(
        metrics=metrics,
        driver_static=driver_static,
        monthly_incidents=monthly_incidents,
    )
    target_frame = build_next_3m_target(metrics, monthly_incidents)

    final_df = feature_frame.merge(
        target_frame,
        on=["driver_id", "month"],
        how="inner",
    )

    final_df = final_df.sort_values(["driver_id", "month"]).reset_index(drop=True)
    return final_df


def get_curated_feature_columns(df: pd.DataFrame) -> List[str]:
    return [c for c in CURATED_FEATURES if c in df.columns]