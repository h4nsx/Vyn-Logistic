# api/process_ai/entity/builders/ops.py
from __future__ import annotations

from pathlib import Path
from typing import Dict, List, Tuple

import numpy as np
import pandas as pd

from ...core.task_spec import TaskSpec
from ..entity_configs import get_entity_task_spec


PROJECT_ROOT = Path(__file__).resolve().parents[4]

OPS_TARGET_COL = "target_next_3m_severe_ops_disruption"

BASE_OPS_FEATURES = [
    # route static
    "typical_distance_miles",
    "base_rate_per_mile",
    "fuel_surcharge_rate",
    "typical_transit_days",

    # monthly trip/load metrics
    "trips_completed",
    "total_miles",
    "total_duration_hours",
    "fuel_gallons_used",
    "average_mpg",
    "total_idle_hours",
    "total_revenue",
    "total_fuel_surcharge",
    "total_accessorial_charges",
    "avg_weight_lbs",
    "avg_pieces",

    # monthly event metrics
    "event_count",
    "pickup_count",
    "delivery_count",
    "late_event_count",
    "late_rate",
    "detention_sum",
    "detention_avg",
    "detention_p95",

    # monthly fuel metrics
    "fuel_purchase_count",
    "fuel_card_spend",
    "fuel_gallons_purchased",
    "avg_fuel_price",

    # rolling avg / sum / delta
    "trips_completed_avg_3m",
    "trips_completed_delta_1m",
    "total_miles_avg_3m",
    "total_miles_delta_1m",
    "total_duration_hours_avg_3m",
    "total_duration_hours_delta_1m",
    "average_mpg_avg_3m",
    "average_mpg_delta_1m",
    "total_idle_hours_avg_3m",
    "total_idle_hours_delta_1m",
    "total_revenue_avg_3m",
    "total_revenue_delta_1m",
    "late_rate_avg_3m",
    "late_rate_delta_1m",
    "detention_avg_avg_3m",
    "detention_avg_delta_1m",
    "fuel_card_spend_avg_3m",
    "fuel_card_spend_delta_1m",

    # history
    "severe_ops_month_count_last_3m",
    "severe_ops_month_count_last_6m",
    "late_event_count_last_3m",
    "late_event_count_last_6m",
    "detention_sum_last_3m",
    "detention_sum_last_6m",
    "fuel_card_spend_last_3m",
    "fuel_card_spend_last_6m",

    # rates
    "late_events_per_trip_3m",
    "detention_per_trip_3m",
    "fuel_spend_per_mile_3m",
    "fuel_gallons_per_mile_3m",
    "idle_hours_per_trip_3m",

    # time since
    "months_since_last_severe_ops_month",
]


def default_ops_task_spec() -> TaskSpec:
    return get_entity_task_spec("ops_ai")


def resolve_ops_data_paths() -> Dict[str, Path]:
    candidates = [
        PROJECT_ROOT / "data" / "entity_data" / "ops",
        PROJECT_ROOT / "data" / "archive",
        PROJECT_ROOT / "data",
    ]

    for base in candidates:
        trips = base / "trips.csv"
        routes = base / "routes.csv"
        loads = base / "loads.csv"
        fuel = base / "fuel_purchases.csv"
        delivery = base / "delivery_events.csv"

        if trips.exists() and routes.exists() and loads.exists() and fuel.exists() and delivery.exists():
            return {
                "trips": trips,
                "routes": routes,
                "loads": loads,
                "fuel": fuel,
                "delivery": delivery,
            }

    searched = "\n".join(str(p) for p in candidates)
    raise FileNotFoundError(
        "Không tìm thấy bộ dữ liệu ops cần thiết.\n"
        f"Đã tìm trong:\n{searched}"
    )


def load_ops_tables() -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame, pd.DataFrame, pd.DataFrame]:
    paths = resolve_ops_data_paths()

    trips = pd.read_csv(paths["trips"])
    routes = pd.read_csv(paths["routes"])
    loads = pd.read_csv(paths["loads"])
    fuel = pd.read_csv(paths["fuel"])
    delivery = pd.read_csv(paths["delivery"])

    if "dispatch_date" in trips.columns:
        trips["dispatch_date"] = pd.to_datetime(trips["dispatch_date"], errors="coerce")
        trips["month"] = trips["dispatch_date"].dt.to_period("M").dt.to_timestamp()

    if "load_date" in loads.columns:
        loads["load_date"] = pd.to_datetime(loads["load_date"], errors="coerce")

    if "purchase_date" in fuel.columns:
        fuel["purchase_date"] = pd.to_datetime(fuel["purchase_date"], errors="coerce")
        fuel["month"] = fuel["purchase_date"].dt.to_period("M").dt.to_timestamp()

    for col in ["scheduled_datetime", "actual_datetime"]:
        if col in delivery.columns:
            delivery[col] = pd.to_datetime(delivery[col], errors="coerce")

    if "scheduled_datetime" in delivery.columns:
        delivery["month"] = delivery["scheduled_datetime"].dt.to_period("M").dt.to_timestamp()

    return trips, routes, loads, fuel, delivery


def build_ops_static_table(routes: pd.DataFrame) -> pd.DataFrame:
    keep_cols = [
        "route_id",
        "origin_city",
        "origin_state",
        "destination_city",
        "destination_state",
        "typical_distance_miles",
        "base_rate_per_mile",
        "fuel_surcharge_rate",
        "typical_transit_days",
    ]
    existing = [c for c in keep_cols if c in routes.columns]
    return routes[existing].copy()


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


def build_route_month_base(
    trips: pd.DataFrame,
    loads: pd.DataFrame,
    fuel: pd.DataFrame,
    delivery: pd.DataFrame,
) -> pd.DataFrame:
    # -------------------------
    # trips + loads
    # -------------------------
    trip_load = trips.merge(
        loads[
            [
                "load_id",
                "route_id",
                "load_type",
                "weight_lbs",
                "pieces",
                "revenue",
                "fuel_surcharge",
                "accessorial_charges",
                "booking_type",
            ]
        ],
        on="load_id",
        how="left",
    )

    numeric_trip_cols = [
        "actual_distance_miles",
        "actual_duration_hours",
        "fuel_gallons_used",
        "average_mpg",
        "idle_time_hours",
        "weight_lbs",
        "pieces",
        "revenue",
        "fuel_surcharge",
        "accessorial_charges",
    ]
    for col in numeric_trip_cols:
        if col in trip_load.columns:
            trip_load[col] = pd.to_numeric(trip_load[col], errors="coerce").fillna(0.0)

    route_trip_month = (
        trip_load.groupby(["route_id", "month"], as_index=False)
        .agg(
            trips_completed=("trip_id", "nunique"),
            total_miles=("actual_distance_miles", "sum"),
            total_duration_hours=("actual_duration_hours", "sum"),
            fuel_gallons_used=("fuel_gallons_used", "sum"),
            average_mpg=("average_mpg", "mean"),
            total_idle_hours=("idle_time_hours", "sum"),
            total_revenue=("revenue", "sum"),
            total_fuel_surcharge=("fuel_surcharge", "sum"),
            total_accessorial_charges=("accessorial_charges", "sum"),
            avg_weight_lbs=("weight_lbs", "mean"),
            avg_pieces=("pieces", "mean"),
        )
        .sort_values(["route_id", "month"])
        .reset_index(drop=True)
    )

    # load_type monthly counts
    if "load_type" in trip_load.columns:
        tmp = trip_load.copy()
        tmp["load_type_clean"] = (
            tmp["load_type"]
            .astype(str)
            .str.strip()
            .str.lower()
            .str.replace(r"[^a-z0-9]+", "_", regex=True)
            .str.strip("_")
        )
        tmp["load_type_count"] = 1
        pivot = (
            tmp.pivot_table(
                index=["route_id", "month"],
                columns="load_type_clean",
                values="load_type_count",
                aggfunc="sum",
                fill_value=0,
            )
            .reset_index()
        )
        pivot.columns = [
            c if c in ["route_id", "month"] else f"load_type_{c}_count"
            for c in pivot.columns
        ]
        route_trip_month = route_trip_month.merge(pivot, on=["route_id", "month"], how="left")

    # booking_type monthly counts
    if "booking_type" in trip_load.columns:
        tmp = trip_load.copy()
        tmp["booking_type_clean"] = (
            tmp["booking_type"]
            .astype(str)
            .str.strip()
            .str.lower()
            .str.replace(r"[^a-z0-9]+", "_", regex=True)
            .str.strip("_")
        )
        tmp["booking_type_count"] = 1
        pivot = (
            tmp.pivot_table(
                index=["route_id", "month"],
                columns="booking_type_clean",
                values="booking_type_count",
                aggfunc="sum",
                fill_value=0,
            )
            .reset_index()
        )
        pivot.columns = [
            c if c in ["route_id", "month"] else f"booking_type_{c}_count"
            for c in pivot.columns
        ]
        route_trip_month = route_trip_month.merge(pivot, on=["route_id", "month"], how="left")

    # -------------------------
    # delivery events
    # -------------------------
    delivery_route = delivery.merge(
        loads[["load_id", "route_id"]],
        on="load_id",
        how="left",
    )

    delivery_route["detention_minutes"] = pd.to_numeric(
        delivery_route["detention_minutes"],
        errors="coerce",
    ).fillna(0.0)

    delivery_route["late_flag"] = (~delivery_route["on_time_flag"].fillna(True)).astype(int)

    route_event_month = (
        delivery_route.groupby(["route_id", "month"], as_index=False)
        .agg(
            event_count=("event_id", "count"),
            pickup_count=("event_type", lambda s: (s == "Pickup").sum()),
            delivery_count=("event_type", lambda s: (s == "Delivery").sum()),
            late_event_count=("late_flag", "sum"),
            detention_sum=("detention_minutes", "sum"),
            detention_avg=("detention_minutes", "mean"),
            detention_p95=("detention_minutes", lambda s: float(np.percentile(s, 95)) if len(s) else 0.0),
        )
        .sort_values(["route_id", "month"])
        .reset_index(drop=True)
    )

    route_event_month["late_rate"] = (
        route_event_month["late_event_count"] / (route_event_month["event_count"] + 1e-6)
    )

    # -------------------------
    # fuel purchases
    # -------------------------
    fuel_route = (
        fuel.merge(trips[["trip_id", "load_id"]], on="trip_id", how="left")
            .merge(loads[["load_id", "route_id"]], on="load_id", how="left")
    )

    for col in ["gallons", "price_per_gallon", "total_cost"]:
        if col in fuel_route.columns:
            fuel_route[col] = pd.to_numeric(fuel_route[col], errors="coerce").fillna(0.0)

    route_fuel_month = (
        fuel_route.groupby(["route_id", "month"], as_index=False)
        .agg(
            fuel_purchase_count=("fuel_purchase_id", "count"),
            fuel_card_spend=("total_cost", "sum"),
            fuel_gallons_purchased=("gallons", "sum"),
            avg_fuel_price=("price_per_gallon", "mean"),
        )
        .sort_values(["route_id", "month"])
        .reset_index(drop=True)
    )

    # -------------------------
    # merge all
    # -------------------------
    base = (
        route_trip_month
        .merge(route_event_month, on=["route_id", "month"], how="left")
        .merge(route_fuel_month, on=["route_id", "month"], how="left")
    )

    numeric_cols = base.select_dtypes(include=[np.number]).columns.tolist()
    base[numeric_cols] = base[numeric_cols].fillna(0.0)

    return base.sort_values(["route_id", "month"]).reset_index(drop=True)


def build_next_3m_ops_target(route_month_base: pd.DataFrame) -> pd.DataFrame:
    df = route_month_base[["route_id", "month", "late_rate", "detention_avg"]].copy()

    late_thresh = float(df["late_rate"].quantile(0.90))
    detention_thresh = float(df["detention_avg"].quantile(0.90))

    df["severe_ops_month_flag"] = (
        (df["late_rate"] >= late_thresh) |
        (df["detention_avg"] >= detention_thresh)
    ).astype(int)

    base_keys = df[["route_id", "month"]].drop_duplicates().copy()
    target = base_keys.copy()

    severe_base = df[["route_id", "month", "severe_ops_month_flag"]].copy()

    for horizon in [1, 2, 3]:
        temp = severe_base.copy()
        temp["month"] = temp["month"] - pd.DateOffset(months=horizon)
        temp = (
            temp.groupby(["route_id", "month"], as_index=False)["severe_ops_month_flag"]
            .sum()
            .rename(columns={"severe_ops_month_flag": f"severe_ops_in_{horizon}m_count"})
        )
        target = target.merge(temp, on=["route_id", "month"], how="left")

    for col in ["severe_ops_in_1m_count", "severe_ops_in_2m_count", "severe_ops_in_3m_count"]:
        target[col] = target[col].fillna(0).astype(int)

    target["target_next_3m_severe_ops_count"] = (
        target["severe_ops_in_1m_count"]
        + target["severe_ops_in_2m_count"]
        + target["severe_ops_in_3m_count"]
    )
    target[OPS_TARGET_COL] = (target["target_next_3m_severe_ops_count"] > 0).astype(int)

    # chỉ giữ dòng có đủ 3 tháng tương lai
    future_keys = base_keys.copy()

    target["month_p1"] = target["month"] + pd.DateOffset(months=1)
    target["month_p2"] = target["month"] + pd.DateOffset(months=2)
    target["month_p3"] = target["month"] + pd.DateOffset(months=3)

    future_1 = future_keys.rename(columns={"month": "month_p1"}).assign(has_p1=1)
    future_2 = future_keys.rename(columns={"month": "month_p2"}).assign(has_p2=1)
    future_3 = future_keys.rename(columns={"month": "month_p3"}).assign(has_p3=1)

    target = target.merge(future_1, on=["route_id", "month_p1"], how="left")
    target = target.merge(future_2, on=["route_id", "month_p2"], how="left")
    target = target.merge(future_3, on=["route_id", "month_p3"], how="left")

    target = target[
        (target["has_p1"] == 1) &
        (target["has_p2"] == 1) &
        (target["has_p3"] == 1)
    ].copy()

    target = target.drop(
        columns=["month_p1", "month_p2", "month_p3", "has_p1", "has_p2", "has_p3"]
    )

    target["severe_late_rate_threshold"] = late_thresh
    target["severe_detention_avg_threshold"] = detention_thresh

    return target.sort_values(["route_id", "month"]).reset_index(drop=True)


def build_ops_month_feature_frame(
    route_month_base: pd.DataFrame,
    ops_static: pd.DataFrame,
) -> pd.DataFrame:
    df = route_month_base.copy().sort_values(["route_id", "month"]).reset_index(drop=True)
    df = df.merge(ops_static, on="route_id", how="left")

    grp = df.groupby("route_id", group_keys=False)

    base_metric_cols = [
        "trips_completed",
        "total_miles",
        "total_duration_hours",
        "fuel_gallons_used",
        "average_mpg",
        "total_idle_hours",
        "total_revenue",
        "total_fuel_surcharge",
        "total_accessorial_charges",
        "avg_weight_lbs",
        "avg_pieces",
        "event_count",
        "pickup_count",
        "delivery_count",
        "late_event_count",
        "late_rate",
        "detention_sum",
        "detention_avg",
        "detention_p95",
        "fuel_purchase_count",
        "fuel_card_spend",
        "fuel_gallons_purchased",
        "avg_fuel_price",
    ]

    for col in base_metric_cols:
        if col not in df.columns:
            df[col] = 0.0

        df[f"{col}_avg_3m"] = grp[col].transform(lambda s: s.rolling(3, min_periods=1).mean())
        df[f"{col}_lag1"] = grp[col].shift(1)
        df[f"{col}_delta_1m"] = df[col] - df[f"{col}_lag1"]

    # create current severe month flag for historical features
    late_thresh = float(df["late_rate"].quantile(0.90))
    detention_thresh = float(df["detention_avg"].quantile(0.90))
    df["severe_ops_month_flag"] = (
            (df["late_rate"] >= late_thresh) |
            (df["detention_avg"] >= detention_thresh)
    ).astype(int)

    history_cols = [
        "severe_ops_month_flag",
        "late_event_count",
        "detention_sum",
        "fuel_card_spend",
    ]

    for col in history_cols:
        df[f"{col}_last_3m"] = grp[col].transform(lambda s: s.rolling(3, min_periods=1).sum())
        df[f"{col}_last_6m"] = grp[col].transform(lambda s: s.rolling(6, min_periods=1).sum())

    df = df.rename(
        columns={
            "severe_ops_month_flag_last_3m": "severe_ops_month_count_last_3m",
            "severe_ops_month_flag_last_6m": "severe_ops_month_count_last_6m",
        }
    )

    # rolling denominators
    df["trips_completed_sum_3m"] = grp["trips_completed"].transform(lambda s: s.rolling(3, min_periods=1).sum())
    df["total_miles_sum_3m"] = grp["total_miles"].transform(lambda s: s.rolling(3, min_periods=1).sum())
    df["fuel_gallons_purchased_sum_3m"] = grp["fuel_gallons_purchased"].transform(lambda s: s.rolling(3, min_periods=1).sum())
    df["total_idle_hours_sum_3m"] = grp["total_idle_hours"].transform(lambda s: s.rolling(3, min_periods=1).sum())

    # rates
    df["late_events_per_trip_3m"] = (
        df["late_event_count_last_3m"] / (df["trips_completed_sum_3m"] + 1e-6)
    )
    df["detention_per_trip_3m"] = (
        df["detention_sum_last_3m"] / (df["trips_completed_sum_3m"] + 1e-6)
    )
    df["fuel_spend_per_mile_3m"] = (
        df["fuel_card_spend_last_3m"] / (df["total_miles_sum_3m"] + 1e-6)
    )
    df["fuel_gallons_per_mile_3m"] = (
        df["fuel_gallons_purchased_sum_3m"] / (df["total_miles_sum_3m"] + 1e-6)
    )
    df["idle_hours_per_trip_3m"] = (
        df["total_idle_hours_sum_3m"] / (df["trips_completed_sum_3m"] + 1e-6)
    )

    # months since last severe month
    df["months_since_last_severe_ops_month"] = (
        grp["severe_ops_month_flag"]
        .apply(_months_since_last_flag)
        .reset_index(level=0, drop=True)
    )

    # dynamic monthly category counts rolling 6m
    dynamic_monthly_cols = [
        c for c in df.columns
        if c.startswith("load_type_") or c.startswith("booking_type_")
    ]
    for col in dynamic_monthly_cols:
        df[f"{col}_last_6m"] = grp[col].transform(lambda s: s.rolling(6, min_periods=1).sum())

    # fill lags and deltas
    lag_cols = [c for c in df.columns if c.endswith("_lag1")]
    for col in lag_cols:
        source = col.replace("_lag1", "")
        df[col] = df[col].fillna(df[source])

    delta_cols = [c for c in df.columns if c.endswith("_delta_1m")]
    for col in delta_cols:
        df[col] = df[col].fillna(0.0)

    categorical_cols = [
        c for c in ["origin_state", "destination_state", "origin_city", "destination_city"]
        if c in df.columns
    ]
    for col in categorical_cols:
        df[col] = df[col].fillna("Unknown").astype(str)

    df = pd.get_dummies(
        df,
        columns=categorical_cols,
        drop_first=False,
        dtype=int,
    )

    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    df[numeric_cols] = df[numeric_cols].replace([np.inf, -np.inf], np.nan).fillna(0.0)

    return df.sort_values(["route_id", "month"]).reset_index(drop=True)


def build_ops_training_frame() -> pd.DataFrame:
    trips, routes, loads, fuel, delivery = load_ops_tables()

    ops_static = build_ops_static_table(routes)
    route_month_base = build_route_month_base(
        trips=trips,
        loads=loads,
        fuel=fuel,
        delivery=delivery,
    )

    feature_frame = build_ops_month_feature_frame(
        route_month_base=route_month_base,
        ops_static=ops_static,
    )

    target_frame = build_next_3m_ops_target(route_month_base)

    final_df = feature_frame.merge(
        target_frame,
        on=["route_id", "month"],
        how="inner",
    )

    return final_df.sort_values(["route_id", "month"]).reset_index(drop=True)


def get_curated_ops_feature_columns(df=None) -> List[str]:
    features = list(BASE_OPS_FEATURES)

    dynamic_prefixes = [
        "origin_state_",
        "destination_state_",
        "origin_city_",
        "destination_city_",
        "load_type_",
        "booking_type_",
    ]

    if df is None:
        return features

    dynamic_cols = [
        c for c in df.columns
        if any(c.startswith(prefix) for prefix in dynamic_prefixes)
    ]

    return [c for c in features if c in df.columns] + sorted(dynamic_cols)