# api/process_ai/entity/builders/fleet.py
from __future__ import annotations

from pathlib import Path
from typing import Dict, List, Tuple

import numpy as np
import pandas as pd

from ...core.task_spec import TaskSpec
from ..entity_configs import get_entity_task_spec


PROJECT_ROOT = Path(__file__).resolve().parents[4]

FLEET_TARGET_COL = "target_next_3m_emergency_maintenance"

BASE_FLEET_FEATURES = [
    # static
    "model_year",
    "acquisition_mileage",
    "tank_capacity_gallons",
    "vehicle_age_years",
    "fleet_tenure_months",

    # monthly utilization
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

    "maintenance_events",
    "maintenance_events_avg_3m",
    "maintenance_events_delta_1m",

    "maintenance_cost",
    "maintenance_cost_avg_3m",
    "maintenance_cost_delta_1m",

    "downtime_hours",
    "downtime_hours_avg_3m",
    "downtime_hours_delta_1m",

    "utilization_rate",
    "utilization_rate_avg_3m",
    "utilization_rate_delta_1m",

    # monthly maintenance history
    "maintenance_count_last_3m",
    "maintenance_count_last_6m",
    "maintenance_count_last_12m",

    "emergency_count_last_3m",
    "emergency_count_last_6m",
    "emergency_count_last_12m",

    "total_cost_sum_last_3m",
    "total_cost_sum_last_6m",
    "downtime_hours_sum_last_3m",
    "downtime_hours_sum_last_6m",
    "labor_hours_sum_last_3m",
    "labor_hours_sum_last_6m",

    "months_since_last_maintenance",
    "months_since_last_emergency",

    "maintenance_rate_per_1000_miles_3m",
    "emergency_rate_per_1000_miles_6m",
    "maintenance_cost_rate_per_mile_6m",
]


def default_fleet_task_spec() -> TaskSpec:
    return get_entity_task_spec("fleet_ai")


def resolve_fleet_data_paths() -> Dict[str, Path]:
    candidates = [
        PROJECT_ROOT / "data" / "entity_data" / "fleet",
        PROJECT_ROOT / "data" / "archive",
        PROJECT_ROOT / "data",
    ]

    for base in candidates:
        trucks = base / "trucks.csv"
        maintenance = base / "maintenance_records.csv"
        utilization = base / "truck_utilization_metrics.csv"

        if trucks.exists() and maintenance.exists() and utilization.exists():
            return {
                "trucks": trucks,
                "maintenance": maintenance,
                "utilization": utilization,
            }

    searched = "\n".join(str(p) for p in candidates)
    raise FileNotFoundError(
        "Không tìm thấy bộ dữ liệu fleet cần thiết.\n"
        f"Đã tìm trong:\n{searched}"
    )


def load_fleet_tables() -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
    paths = resolve_fleet_data_paths()

    trucks = pd.read_csv(paths["trucks"])
    maintenance = pd.read_csv(paths["maintenance"])
    utilization = pd.read_csv(paths["utilization"])

    if "acquisition_date" in trucks.columns:
        trucks["acquisition_date"] = pd.to_datetime(trucks["acquisition_date"], errors="coerce")

    if "maintenance_date" in maintenance.columns:
        maintenance["maintenance_date"] = pd.to_datetime(maintenance["maintenance_date"], errors="coerce")
        maintenance["maintenance_month"] = maintenance["maintenance_date"].dt.to_period("M").dt.to_timestamp()

    if "month" in utilization.columns:
        utilization["month"] = pd.to_datetime(utilization["month"], errors="coerce")
        utilization["month"] = utilization["month"].dt.to_period("M").dt.to_timestamp()

    return trucks, maintenance, utilization


def build_fleet_static_table(trucks: pd.DataFrame) -> pd.DataFrame:
    keep_cols = [
        "truck_id",
        "model_year",
        "acquisition_date",
        "acquisition_mileage",
        "fuel_type",
        "tank_capacity_gallons",
        "status",
        "home_terminal",
        "make",
    ]
    existing = [c for c in keep_cols if c in trucks.columns]
    return trucks[existing].copy()


def build_monthly_maintenance_table(maintenance: pd.DataFrame) -> pd.DataFrame:
    df = maintenance.copy()

    for col in ["labor_hours", "labor_cost", "parts_cost", "total_cost", "downtime_hours", "odometer_reading"]:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0.0)

    df["maintenance_count"] = 1
    df["is_emergency"] = df["service_description"].astype(str).str.contains("Emergency", case=False, na=False).astype(int)

    grouped = (
        df.groupby(["truck_id", "maintenance_month"], as_index=False)
        .agg(
            maintenance_count=("maintenance_count", "sum"),
            emergency_count=("is_emergency", "sum"),
            labor_hours_sum=("labor_hours", "sum"),
            labor_cost_sum=("labor_cost", "sum"),
            parts_cost_sum=("parts_cost", "sum"),
            total_cost_sum=("total_cost", "sum"),
            downtime_hours_sum=("downtime_hours", "sum"),
            odometer_max=("odometer_reading", "max"),
        )
        .sort_values(["truck_id", "maintenance_month"])
        .reset_index(drop=True)
    )

    grouped["has_maintenance"] = (grouped["maintenance_count"] > 0).astype(int)
    grouped["has_emergency"] = (grouped["emergency_count"] > 0).astype(int)

    # maintenance_type pivot
    if "maintenance_type" in df.columns:
        type_df = df.copy()
        type_df["maintenance_type_clean"] = (
            type_df["maintenance_type"]
            .astype(str)
            .str.strip()
            .str.lower()
            .str.replace(r"[^a-z0-9]+", "_", regex=True)
            .str.strip("_")
        )
        type_df["type_count"] = 1

        type_pivot = (
            type_df.pivot_table(
                index=["truck_id", "maintenance_month"],
                columns="maintenance_type_clean",
                values="type_count",
                aggfunc="sum",
                fill_value=0,
            )
            .reset_index()
        )

        type_pivot.columns = [
            c if c in ["truck_id", "maintenance_month"] else f"maintenance_type_{c}_count"
            for c in type_pivot.columns
        ]

        grouped = grouped.merge(type_pivot, on=["truck_id", "maintenance_month"], how="left")

    numeric_cols = [c for c in grouped.columns if c not in ["truck_id", "maintenance_month"]]
    grouped[numeric_cols] = grouped[numeric_cols].fillna(0.0)

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


def build_next_3m_emergency_target(
    utilization: pd.DataFrame,
    monthly_maintenance: pd.DataFrame,
) -> pd.DataFrame:
    base_keys = utilization[["truck_id", "month"]].drop_duplicates().copy()

    emergency_base = monthly_maintenance[
        ["truck_id", "maintenance_month", "emergency_count"]
    ].copy()

    target = base_keys.copy()

    for horizon in [1, 2, 3]:
        temp = emergency_base.copy()
        temp["month"] = temp["maintenance_month"] - pd.DateOffset(months=horizon)

        temp = (
            temp.groupby(["truck_id", "month"], as_index=False)["emergency_count"]
            .sum()
            .rename(columns={"emergency_count": f"emergency_in_{horizon}m_count"})
        )

        target = target.merge(temp, on=["truck_id", "month"], how="left")

    for col in ["emergency_in_1m_count", "emergency_in_2m_count", "emergency_in_3m_count"]:
        target[col] = target[col].fillna(0).astype(int)

    target["target_next_3m_emergency_count"] = (
        target["emergency_in_1m_count"]
        + target["emergency_in_2m_count"]
        + target["emergency_in_3m_count"]
    )
    target[FLEET_TARGET_COL] = (target["target_next_3m_emergency_count"] > 0).astype(int)

    # chỉ giữ dòng có đủ 3 tháng tương lai
    future_keys = base_keys.copy()

    target["month_p1"] = target["month"] + pd.DateOffset(months=1)
    target["month_p2"] = target["month"] + pd.DateOffset(months=2)
    target["month_p3"] = target["month"] + pd.DateOffset(months=3)

    future_1 = future_keys.rename(columns={"month": "month_p1"}).assign(has_p1=1)
    future_2 = future_keys.rename(columns={"month": "month_p2"}).assign(has_p2=1)
    future_3 = future_keys.rename(columns={"month": "month_p3"}).assign(has_p3=1)

    target = target.merge(future_1, on=["truck_id", "month_p1"], how="left")
    target = target.merge(future_2, on=["truck_id", "month_p2"], how="left")
    target = target.merge(future_3, on=["truck_id", "month_p3"], how="left")

    target = target[
        (target["has_p1"] == 1) &
        (target["has_p2"] == 1) &
        (target["has_p3"] == 1)
    ].copy()

    target = target.drop(
        columns=["month_p1", "month_p2", "month_p3", "has_p1", "has_p2", "has_p3"]
    )

    return target.sort_values(["truck_id", "month"]).reset_index(drop=True)


def build_fleet_month_feature_frame(
    utilization: pd.DataFrame,
    fleet_static: pd.DataFrame,
    monthly_maintenance: pd.DataFrame,
) -> pd.DataFrame:
    df = utilization.copy().sort_values(["truck_id", "month"]).reset_index(drop=True)
    df = df.merge(fleet_static, on="truck_id", how="left")

    # static-derived features
    if "model_year" in df.columns:
        df["vehicle_age_years"] = (df["month"].dt.year - df["model_year"]).clip(lower=0)
    else:
        df["vehicle_age_years"] = 0.0

    if "acquisition_date" in df.columns:
        df["fleet_tenure_months"] = (
            (df["month"].dt.year - df["acquisition_date"].dt.year) * 12
            + (df["month"].dt.month - df["acquisition_date"].dt.month)
        ).clip(lower=0)
    else:
        df["fleet_tenure_months"] = 0.0

    maintenance_df = monthly_maintenance.rename(columns={"maintenance_month": "month"}).copy()
    maintenance_cols = [c for c in maintenance_df.columns if c not in ["truck_id", "month"]]

    df = df.merge(
        maintenance_df[["truck_id", "month"] + maintenance_cols],
        on=["truck_id", "month"],
        how="left",
    )

    if maintenance_cols:
        df[maintenance_cols] = df[maintenance_cols].fillna(0.0)

    grp = df.groupby("truck_id", group_keys=False)

    # base monthly metrics
    base_metric_cols = [
        "trips_completed",
        "total_miles",
        "total_revenue",
        "average_mpg",
        "maintenance_events",
        "maintenance_cost",
        "downtime_hours",
        "utilization_rate",
    ]

    for col in base_metric_cols:
        if col not in df.columns:
            df[col] = 0.0

        df[f"{col}_avg_3m"] = grp[col].transform(lambda s: s.rolling(3, min_periods=1).mean())
        df[f"{col}_lag1"] = grp[col].shift(1)
        df[f"{col}_delta_1m"] = df[col] - df[f"{col}_lag1"]

    df["total_miles_sum_3m"] = grp["total_miles"].transform(lambda s: s.rolling(3, min_periods=1).sum())
    df["total_miles_sum_6m"] = grp["total_miles"].transform(lambda s: s.rolling(6, min_periods=1).sum())

    history_cols = [
        "maintenance_count",
        "emergency_count",
        "labor_hours_sum",
        "labor_cost_sum",
        "parts_cost_sum",
        "total_cost_sum",
        "downtime_hours_sum",
    ]

    for col in history_cols:
        if col not in df.columns:
            df[col] = 0.0

        df[f"{col}_last_3m"] = grp[col].transform(lambda s: s.rolling(3, min_periods=1).sum())
        df[f"{col}_last_6m"] = grp[col].transform(lambda s: s.rolling(6, min_periods=1).sum())
        df[f"{col}_last_12m"] = grp[col].transform(lambda s: s.rolling(12, min_periods=1).sum())

    # maintenance type rolling 6m
    type_cols = [c for c in df.columns if c.startswith("maintenance_type_") and c.endswith("_count")]
    for col in type_cols:
        df[f"{col}_last_6m"] = grp[col].transform(lambda s: s.rolling(6, min_periods=1).sum())

    # months since
    for flag_col, out_col in [
        ("has_maintenance", "months_since_last_maintenance"),
        ("has_emergency", "months_since_last_emergency"),
    ]:
        if flag_col not in df.columns:
            df[flag_col] = 0

        df[out_col] = (
            grp[flag_col]
            .apply(_months_since_last_flag)
            .reset_index(level=0, drop=True)
        )

    # rates
    df["maintenance_rate_per_1000_miles_3m"] = (
        df["maintenance_count_last_3m"] / (df["total_miles_sum_3m"] / 1000.0 + 1e-6)
    )
    df["emergency_rate_per_1000_miles_6m"] = (
        df["emergency_count_last_6m"] / (df["total_miles_sum_6m"] / 1000.0 + 1e-6)
    )
    df["maintenance_cost_rate_per_mile_6m"] = (
        df["total_cost_sum_last_6m"] / (df["total_miles_sum_6m"] + 1e-6)
    )

    # fill lags and deltas
    lag_cols = [c for c in df.columns if c.endswith("_lag1")]
    for col in lag_cols:
        source = col.replace("_lag1", "")
        df[col] = df[col].fillna(df[source])

    delta_cols = [c for c in df.columns if c.endswith("_delta_1m")]
    for col in delta_cols:
        df[col] = df[col].fillna(0.0)

    # categorical encoding
    categorical_cols = [c for c in ["fuel_type", "status", "home_terminal", "make"] if c in df.columns]
    for col in categorical_cols:
        df[col] = df[col].fillna("Unknown").astype(str)

    df = pd.get_dummies(
        df,
        columns=categorical_cols,
        drop_first=False,
        dtype=int,
    )

    # clean
    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    df[numeric_cols] = df[numeric_cols].replace([np.inf, -np.inf], np.nan).fillna(0.0)

    drop_cols = [c for c in ["acquisition_date"] if c in df.columns]
    if drop_cols:
        df = df.drop(columns=drop_cols)

    return df.sort_values(["truck_id", "month"]).reset_index(drop=True)


def build_fleet_training_frame() -> pd.DataFrame:
    trucks, maintenance, utilization = load_fleet_tables()

    fleet_static = build_fleet_static_table(trucks)
    monthly_maintenance = build_monthly_maintenance_table(maintenance)

    feature_frame = build_fleet_month_feature_frame(
        utilization=utilization,
        fleet_static=fleet_static,
        monthly_maintenance=monthly_maintenance,
    )

    target_frame = build_next_3m_emergency_target(
        utilization=utilization,
        monthly_maintenance=monthly_maintenance,
    )

    final_df = feature_frame.merge(
        target_frame,
        on=["truck_id", "month"],
        how="inner",
    )

    return final_df.sort_values(["truck_id", "month"]).reset_index(drop=True)


def get_curated_fleet_feature_columns(df=None) -> List[str]:
    features = list(BASE_FLEET_FEATURES)

    # dynamic one-hot features
    dynamic_prefixes = [
        "fuel_type_",
        "status_",
        "home_terminal_",
        "make_",
        "maintenance_type_",
    ]

    if df is None:
        return features

    dynamic_cols = [
        c for c in df.columns
        if any(c.startswith(prefix) for prefix in dynamic_prefixes)
    ]

    return [c for c in features if c in df.columns] + sorted(dynamic_cols)