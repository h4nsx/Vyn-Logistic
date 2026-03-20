from typing import Iterable, Optional

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt


def _validate_columns(df: pd.DataFrame, required: Iterable[str], df_name: str = "DataFrame") -> None:
    missing = [c for c in required if c not in df.columns]
    if missing:
        raise ValueError(f"{df_name} is missing required columns: {missing}")


def plot_anomaly_score_distribution(
    results_df: pd.DataFrame,
    process_label: str,
    figsize: tuple = (9, 5),
    bins: int = 30,
) -> None:
    _validate_columns(results_df, ["anomaly_score"], "results_df")

    scores = results_df["anomaly_score"].dropna().values
    p50 = np.percentile(scores, 50)
    p80 = np.percentile(scores, 80)
    p95 = np.percentile(scores, 95)

    plt.figure(figsize=figsize)
    plt.hist(scores, bins=bins, edgecolor="white")
    plt.axvline(p50, linestyle="--", linewidth=2, label=f"P50 = {p50:.3f}")
    plt.axvline(p80, linestyle="--", linewidth=2, label=f"P80 = {p80:.3f}")
    plt.axvline(p95, linestyle="--", linewidth=2, label=f"P95 = {p95:.3f}")
    plt.title(f"{process_label} - Distribution of Anomaly Scores")
    plt.xlabel("Anomaly Score")
    plt.ylabel("Case Count")
    plt.legend()
    plt.tight_layout()
    plt.show()


def plot_normal_vs_anomaly_rate(
    results_df: pd.DataFrame,
    process_label: str,
    figsize: tuple = (6, 4),
) -> pd.DataFrame:
    _validate_columns(results_df, ["is_anomaly"], "results_df")

    normal_count = int((~results_df["is_anomaly"]).sum())
    anomaly_count = int(results_df["is_anomaly"].sum())
    total_count = max(1, len(results_df))

    count_df = pd.DataFrame({
        "label": ["normal", "anomaly"],
        "count": [normal_count, anomaly_count],
    })
    count_df["rate_pct"] = (count_df["count"] / total_count * 100).round(2)

    plt.figure(figsize=figsize)
    bars = plt.bar(count_df["label"], count_df["count"])
    plt.title(f"{process_label} - Normal vs Anomaly Rate")
    plt.xlabel("Label")
    plt.ylabel("Case Count")

    for bar, pct in zip(bars, count_df["rate_pct"]):
        plt.text(
            bar.get_x() + bar.get_width() / 2,
            bar.get_height(),
            f"{pct}%",
            ha="center",
            va="bottom",
        )

    plt.tight_layout()
    plt.show()
    return count_df


def plot_executive_model_separation_curve(
    results_df: pd.DataFrame,
    process_label: str,
    figsize: tuple = (10, 5),
) -> pd.DataFrame:
    _validate_columns(results_df, ["case_id", "anomaly_score", "is_anomaly"], "results_df")

    rank_df = (
        results_df[["case_id", "anomaly_score", "is_anomaly"]]
        .sort_values("anomaly_score", ascending=False)
        .reset_index(drop=True)
        .copy()
    )
    rank_df["case_rank"] = np.arange(1, len(rank_df) + 1)

    p80 = np.percentile(rank_df["anomaly_score"], 80)
    p95 = np.percentile(rank_df["anomaly_score"], 95)

    anomaly_count = int(rank_df["is_anomaly"].sum())
    anomaly_cutoff = None
    if anomaly_count > 0:
        anomaly_cutoff = float(rank_df.loc[rank_df["is_anomaly"], "anomaly_score"].min())

    plt.figure(figsize=figsize)
    plt.plot(rank_df["case_rank"], rank_df["anomaly_score"], linewidth=2)

    plt.axhline(p80, linestyle="--", linewidth=2, label=f"P80 = {p80:.3f}")
    plt.axhline(p95, linestyle="--", linewidth=2, label=f"P95 = {p95:.3f}")

    if anomaly_cutoff is not None:
        plt.axhline(anomaly_cutoff, linestyle="--", linewidth=2, label=f"Anomaly cutoff = {anomaly_cutoff:.3f}")

    if anomaly_count > 0:
        plt.axvspan(1, anomaly_count, alpha=0.15)
        plt.text(
            anomaly_count,
            rank_df["anomaly_score"].max(),
            f"  flagged anomalies: {anomaly_count}",
            va="top",
        )

    plt.title(f"{process_label} - Executive Model Separation Curve")
    plt.xlabel("Case Rank (sorted by anomaly score desc)")
    plt.ylabel("Anomaly Score")
    plt.legend()
    plt.tight_layout()
    plt.show()

    return rank_df


def plot_top_steps_horizontal(
    top_steps_df: pd.DataFrame,
    process_label: str,
    title: Optional[str] = None,
    figsize: tuple = (10, 5),
) -> None:
    _validate_columns(top_steps_df, ["top_step_name", "case_count"], "top_steps_df")

    plot_df = top_steps_df.sort_values("case_count", ascending=True).copy()

    plt.figure(figsize=figsize)
    bars = plt.barh(plot_df["top_step_name"], plot_df["case_count"])

    chart_title = title or f"{process_label} - Top Bottleneck Steps"
    plt.title(chart_title)
    plt.xlabel("Case Count")
    plt.ylabel("Step")

    if "case_rate_pct" in plot_df.columns:
        for bar, pct in zip(bars, plot_df["case_rate_pct"]):
            plt.text(
                bar.get_width(),
                bar.get_y() + bar.get_height() / 2,
                f"  {pct}%",
                va="center",
            )

    plt.tight_layout()
    plt.show()


def plot_total_process_time_distribution(
    results_df: pd.DataFrame,
    process_label: str,
    figsize: tuple = (8, 5),
    bins: int = 20,
) -> None:
    _validate_columns(results_df, ["total_process_time_min"], "results_df")

    plt.figure(figsize=figsize)
    plt.hist(results_df["total_process_time_min"].dropna(), bins=bins, edgecolor="white")
    plt.title(f"{process_label} - Total Process Time Distribution")
    plt.xlabel("Total Process Time (min)")
    plt.ylabel("Case Count")
    plt.tight_layout()
    plt.show()


def plot_step_duration_horizontal(
    step_duration_df: pd.DataFrame,
    process_label: str,
    title: Optional[str] = None,
    top_n: int = 10,
    figsize: tuple = (10, 5),
) -> None:
    _validate_columns(step_duration_df, ["top_step_name", "avg_top_step_duration_min"], "step_duration_df")

    plot_df = (
        step_duration_df.head(top_n)
        .sort_values("avg_top_step_duration_min", ascending=True)
        .copy()
    )

    plt.figure(figsize=figsize)
    plt.barh(plot_df["top_step_name"], plot_df["avg_top_step_duration_min"])

    chart_title = title or f"{process_label} - Avg Duration of Bottleneck Steps"
    plt.title(chart_title)
    plt.xlabel("Average Duration (min)")
    plt.ylabel("Step")
    plt.tight_layout()
    plt.show()


def plot_metric_by_risk_group(
    results_df: pd.DataFrame,
    metric_col: str,
    process_label: str,
    title: str,
    ylabel: str,
    figsize: tuple = (7, 5),
) -> pd.DataFrame:
    _validate_columns(results_df, [metric_col, "is_anomaly"], "results_df")

    plot_df = results_df.copy()
    plot_df["risk_group"] = np.where(plot_df["is_anomaly"], "anomaly", "normal")

    summary_df = (
        plot_df.groupby("risk_group")[metric_col]
        .agg(["mean", "median", "count"])
        .reset_index()
    )

    ordered = ["normal", "anomaly"]
    summary_df["risk_group"] = pd.Categorical(summary_df["risk_group"], categories=ordered, ordered=True)
    summary_df = summary_df.sort_values("risk_group")

    plt.figure(figsize=figsize)
    bars = plt.bar(summary_df["risk_group"].astype(str), summary_df["mean"])

    plt.title(f"{process_label} - {title}")
    plt.xlabel("Risk Group")
    plt.ylabel(ylabel)

    for bar, v in zip(bars, summary_df["mean"]):
        plt.text(
            bar.get_x() + bar.get_width() / 2,
            bar.get_height(),
            f"{v:.2f}",
            ha="center",
            va="bottom",
        )

    plt.tight_layout()
    plt.show()
    return summary_df


# =========================
# Trucking-specific charts
# =========================

def plot_trucking_cycle_time_by_risk_group(results_df: pd.DataFrame) -> pd.DataFrame:
    return plot_metric_by_risk_group(
        results_df=results_df,
        metric_col="total_process_time_min",
        process_label="TRUCKING",
        title="Cycle Time by Risk Group",
        ylabel="Average Total Process Time (min)",
    )


def plot_trucking_step_deviation_vs_p95(
    results_df: pd.DataFrame,
    top_n: int = 10,
    figsize: tuple = (10, 5),
) -> pd.DataFrame:
    _validate_columns(results_df, ["top_step_name", "top_step_deviation_p95"], "results_df")

    plot_df = (
        results_df.groupby("top_step_name")["top_step_deviation_p95"]
        .mean()
        .reset_index()
        .rename(columns={"top_step_deviation_p95": "avg_step_deviation_p95"})
        .sort_values("avg_step_deviation_p95", ascending=False)
        .head(top_n)
        .sort_values("avg_step_deviation_p95", ascending=True)
    )

    plt.figure(figsize=figsize)
    plt.barh(plot_df["top_step_name"], plot_df["avg_step_deviation_p95"])
    plt.title("TRUCKING - Top Step Deviation vs P95")
    plt.xlabel("Average Deviation vs P95")
    plt.ylabel("Step")
    plt.tight_layout()
    plt.show()
    return plot_df


# ==========================
# Warehouse-specific charts
# ==========================

def plot_warehouse_process_time_by_risk_group(results_df: pd.DataFrame) -> pd.DataFrame:
    return plot_metric_by_risk_group(
        results_df=results_df,
        metric_col="total_process_time_min",
        process_label="WAREHOUSE",
        title="Process Time by Risk Group",
        ylabel="Average Total Process Time (min)",
    )


def plot_warehouse_internal_step_duration(
    step_duration_df: pd.DataFrame,
    top_n: int = 10,
    figsize: tuple = (10, 5),
) -> None:
    plot_step_duration_horizontal(
        step_duration_df=step_duration_df,
        process_label="WAREHOUSE",
        title="WAREHOUSE - Average Internal Step Duration",
        top_n=top_n,
        figsize=figsize,
    )


# =======================
# Customs-specific charts
# =======================

def plot_customs_clearance_cycle_time_by_risk_group(results_df: pd.DataFrame) -> pd.DataFrame:
    return plot_metric_by_risk_group(
        results_df=results_df,
        metric_col="total_process_time_min",
        process_label="CUSTOMS",
        title="Clearance Cycle Time by Risk Group",
        ylabel="Average Clearance Cycle Time (min)",
    )


def plot_customs_inspection_recheck_concentration(
    results_df: pd.DataFrame,
    top_n: int = 10,
    figsize: tuple = (10, 5),
    keywords: Optional[list[str]] = None,
) -> pd.DataFrame:
    _validate_columns(results_df, ["top_step_name"], "results_df")

    if keywords is None:
        keywords = ["INSPECTION", "CHECK", "RECHECK", "DOC", "DOCUMENT", "REVIEW", "RELEASE"]

    temp = results_df.copy()
    temp["is_inspection_recheck_related"] = temp["top_step_name"].astype(str).apply(
        lambda x: any(k in x.upper() for k in keywords)
    )

    plot_df = (
        temp.groupby("top_step_name")
        .agg(
            case_count=("case_id", "count"),
            related=("is_inspection_recheck_related", "max"),
        )
        .reset_index()
        .sort_values("case_count", ascending=False)
        .head(top_n)
        .sort_values("case_count", ascending=True)
    )

    plt.figure(figsize=figsize)
    bars = plt.barh(plot_df["top_step_name"], plot_df["case_count"])
    plt.title("CUSTOMS - Inspection / Recheck Concentration")
    plt.xlabel("Case Count")
    plt.ylabel("Step")

    for bar, related in zip(bars, plot_df["related"]):
        if related:
            plt.text(
                bar.get_width(),
                bar.get_y() + bar.get_height() / 2,
                "  related",
                va="center",
            )

    plt.tight_layout()
    plt.show()
    return plot_df
def plot_warehouse_risk_decile_vs_process_time(
    results_df: pd.DataFrame,
    figsize: tuple = (10, 5),
) -> pd.DataFrame:
    _validate_columns(results_df, ["anomaly_score", "total_process_time_min"], "results_df")

    plot_df = results_df[["anomaly_score", "total_process_time_min"]].dropna().copy()

    # decile 10 = rủi ro cao nhất
    plot_df["risk_decile"] = pd.qcut(
        plot_df["anomaly_score"],
        q=10,
        labels=False,
        duplicates="drop"
    ) + 1

    decile_df = (
        plot_df.groupby("risk_decile")
        .agg(
            avg_process_time_min=("total_process_time_min", "mean"),
            case_count=("total_process_time_min", "count"),
        )
        .reset_index()
        .sort_values("risk_decile")
    )

    plt.figure(figsize=figsize)
    bars = plt.bar(
        decile_df["risk_decile"].astype(str),
        decile_df["avg_process_time_min"]
    )

    plt.title("WAREHOUSE - Risk Decile vs Average Process Time")
    plt.xlabel("Risk Decile (1=lowest, 10=highest)")
    plt.ylabel("Average Process Time (min)")

    for bar, v in zip(bars, decile_df["avg_process_time_min"]):
        plt.text(
            bar.get_x() + bar.get_width() / 2,
            bar.get_height(),
            f"{v:.1f}",
            ha="center",
            va="bottom",
        )

    plt.tight_layout()
    plt.show()
    return decile_df
def plot_customs_score_vs_cycle_time_scatter(
    results_df: pd.DataFrame,
    figsize: tuple = (8, 5),
) -> pd.DataFrame:
    _validate_columns(results_df, ["anomaly_score", "total_process_time_min", "is_anomaly"], "results_df")

    plot_df = results_df[
        ["case_id", "anomaly_score", "total_process_time_min", "is_anomaly"]
    ].dropna().copy()

    plt.figure(figsize=figsize)
    plt.scatter(
        plot_df["anomaly_score"],
        plot_df["total_process_time_min"],
        alpha=0.7
    )

    plt.title("CUSTOMS - Anomaly Score vs Clearance Cycle Time")
    plt.xlabel("Anomaly Score")
    plt.ylabel("Clearance Cycle Time (min)")
    plt.tight_layout()
    plt.show()

    corr_df = pd.DataFrame([{
        "case_count": int(len(plot_df)),
        "corr_anomaly_score_vs_cycle_time": round(
            float(plot_df["anomaly_score"].corr(plot_df["total_process_time_min"])),
            6
        ) if len(plot_df) > 1 else None,
        "avg_cycle_time_min": round(float(plot_df["total_process_time_min"].mean()), 3),
    }])

    return corr_df