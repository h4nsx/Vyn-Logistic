from __future__ import annotations

import json
import shutil
from pathlib import Path
from typing import Any, Dict, Tuple

import joblib
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd

from sklearn.inspection import permutation_importance
import seaborn as sns
from sklearn.base import clone
from sklearn.ensemble import HistGradientBoostingClassifier, RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    average_precision_score,
    classification_report,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
)
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

from ..core.task_spec import TaskSpec, TrainingBundle
from ..core.train_engine import run_training_pipeline
from .builders.driver import (
    DRIVER_TARGET_COL,
    build_driver_training_frame,
    default_driver_task_spec,
    get_curated_feature_columns,
)

from .builders.fleet import (
    FLEET_TARGET_COL,
    build_fleet_training_frame,
    default_fleet_task_spec,
    get_curated_fleet_feature_columns,
)
from .builders.ops import (
    OPS_TARGET_COL,
    build_ops_training_frame,
    default_ops_task_spec,
    get_curated_ops_feature_columns,
)

def split_by_time(df: pd.DataFrame, test_months: int) -> Tuple[pd.DataFrame, pd.DataFrame, Any, list]:
    months = sorted(df["month"].dropna().unique())
    if len(months) <= test_months:
        raise ValueError(
            f"Không đủ số tháng để chia train/test. Có {len(months)} tháng, cần lớn hơn {test_months}."
        )

    test_month_values = months[-test_months:]
    cutoff_month = test_month_values[0]

    train_df = df[df["month"] < cutoff_month].copy()
    test_df = df[df["month"] >= cutoff_month].copy()

    return train_df, test_df, cutoff_month, test_month_values


def split_train_val_by_time(train_df: pd.DataFrame, val_months: int) -> Tuple[pd.DataFrame, pd.DataFrame, Any, list]:
    months = sorted(train_df["month"].dropna().unique())
    if len(months) <= val_months:
        raise ValueError(
            f"Không đủ số tháng trong train để chia validation. Có {len(months)} tháng, cần lớn hơn {val_months}."
        )

    val_month_values = months[-val_months:]
    val_cutoff_month = val_month_values[0]

    subtrain_df = train_df[train_df["month"] < val_cutoff_month].copy()
    val_df = train_df[train_df["month"] >= val_cutoff_month].copy()

    return subtrain_df, val_df, val_cutoff_month, val_month_values


def build_model_candidates(random_state: int) -> Dict[str, Any]:
    return {
        "logreg": Pipeline(
            steps=[
                ("scaler", StandardScaler()),
                (
                    "model",
                    LogisticRegression(
                        class_weight="balanced",
                        max_iter=2000,
                        random_state=random_state,
                    ),
                ),
            ]
        ),
        "rf": RandomForestClassifier(
            n_estimators=300,
            max_depth=8,
            min_samples_split=10,
            min_samples_leaf=5,
            class_weight="balanced_subsample",
            random_state=random_state,
            n_jobs=-1,
        ),
        "hgb": HistGradientBoostingClassifier(
            max_depth=6,
            learning_rate=0.05,
            max_iter=200,
            random_state=random_state,
        ),
    }


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


def extract_feature_importance(model: Any, feature_names: list[str], X_ref=None, y_ref=None) -> Dict[str, float]:
    # Tree models
    if hasattr(model, "feature_importances_"):
        values = np.asarray(model.feature_importances_, dtype=float)
        return {
            name: float(val)
            for name, val in sorted(
                zip(feature_names, values),
                key=lambda x: x[1],
                reverse=True,
            )
        }

    # Pipeline(LogReg)
    if hasattr(model, "named_steps") and "model" in model.named_steps:
        inner = model.named_steps["model"]
        if hasattr(inner, "coef_"):
            coef = np.abs(np.asarray(inner.coef_)).ravel()
            return {
                name: float(val)
                for name, val in sorted(
                    zip(feature_names, coef),
                    key=lambda x: x[1],
                    reverse=True,
                )
            }

    # Raw linear model
    if hasattr(model, "coef_"):
        coef = np.abs(np.asarray(model.coef_)).ravel()
        return {
            name: float(val)
            for name, val in sorted(
                zip(feature_names, coef),
                key=lambda x: x[1],
                reverse=True,
            )
        }

    # Fallback: permutation importance
    if X_ref is not None and y_ref is not None:
        try:
            perm = permutation_importance(
                model,
                X_ref,
                y_ref,
                n_repeats=5,
                random_state=42,
                scoring="average_precision",
                n_jobs=-1,
            )
            values = np.asarray(perm.importances_mean, dtype=float)
            return {
                name: float(val)
                for name, val in sorted(
                    zip(feature_names, values),
                    key=lambda x: x[1],
                    reverse=True,
                )
            }
        except Exception:
            return {}

    return {}

def evaluate_model_generic(model, X_test, y_test, feature_names, threshold=0.5) -> Dict[str, Any]:
    y_prob = get_positive_class_proba(model, X_test)
    y_pred = (y_prob >= threshold).astype(int)

    metrics = {
        "threshold": float(threshold),
        "accuracy": float(accuracy_score(y_test, y_pred)),
        "precision": float(precision_score(y_test, y_pred, zero_division=0)),
        "recall": float(recall_score(y_test, y_pred, zero_division=0)),
        "f1": float(f1_score(y_test, y_pred, zero_division=0)),
        "roc_auc": float(roc_auc_score(y_test, y_prob)) if len(set(y_test)) > 1 else None,
        "pr_auc": float(average_precision_score(y_test, y_prob)) if len(set(y_test)) > 1 else None,
        "positive_rate_test": float(pd.Series(y_test).mean()),
        "predicted_positive_rate": float(pd.Series(y_pred).mean()),
        "classification_report": classification_report(
            y_test, y_pred, output_dict=True, zero_division=0
        ),
        "confusion_matrix": confusion_matrix(y_test, y_pred).tolist(),
    }

    fi = extract_feature_importance(
        model=model,
        feature_names=feature_names,
        X_ref=X_test,
        y_ref=y_test,
    )
    if fi:
        metrics["feature_importance"] = fi

    return metrics

def evaluate_threshold_grid(y_true, y_prob, thresholds=None) -> pd.DataFrame:
    if thresholds is None:
        thresholds = np.arange(0.10, 0.91, 0.05)

    y_true = np.asarray(y_true).astype(int)
    rows = []

    for threshold in thresholds:
        y_pred = (y_prob >= threshold).astype(int)
        rows.append(
            {
                "threshold": float(threshold),
                "accuracy": float(accuracy_score(y_true, y_pred)),
                "precision": float(precision_score(y_true, y_pred, zero_division=0)),
                "recall": float(recall_score(y_true, y_pred, zero_division=0)),
                "f1": float(f1_score(y_true, y_pred, zero_division=0)),
                "predicted_positive_rate": float(np.mean(y_pred)),
                "tp": int(((y_true == 1) & (y_pred == 1)).sum()),
                "fp": int(((y_true == 0) & (y_pred == 1)).sum()),
                "tn": int(((y_true == 0) & (y_pred == 0)).sum()),
                "fn": int(((y_true == 1) & (y_pred == 0)).sum()),
            }
        )

    return pd.DataFrame(rows)


def add_threshold_diagnostics(threshold_df: pd.DataFrame, validation_positive_rate: float) -> pd.DataFrame:
    df = threshold_df.copy()
    df["validation_positive_rate"] = float(validation_positive_rate)
    df["alert_rate_gap"] = (df["predicted_positive_rate"] - validation_positive_rate).abs()
    df["alert_ratio_vs_base"] = df["predicted_positive_rate"] / max(validation_positive_rate, 1e-6)
    return df


def pick_balanced_threshold(threshold_df: pd.DataFrame, validation_positive_rate: float):
    df = add_threshold_diagnostics(threshold_df, validation_positive_rate)

    strict_alert_cap = max(0.35, 2.5 * validation_positive_rate)
    relaxed_alert_cap = max(0.45, 3.0 * validation_positive_rate)

    strict = df[
        (df["recall"] >= 0.20) &
        (df["predicted_positive_rate"] <= strict_alert_cap)
    ].copy()

    if not strict.empty:
        strict["selection_bucket"] = "strict"
        ranked = strict.sort_values(
            ["f1", "precision", "alert_rate_gap", "recall"],
            ascending=[False, False, True, False],
        ).reset_index(drop=True)
        chosen_row = ranked.iloc[0].copy()
        return float(chosen_row["threshold"]), "balanced_guardrails_strict", df, ranked

    relaxed = df[
        (df["recall"] >= 0.15) &
        (df["predicted_positive_rate"] <= relaxed_alert_cap)
    ].copy()

    if not relaxed.empty:
        relaxed["selection_bucket"] = "relaxed"
        ranked = relaxed.sort_values(
            ["f1", "precision", "alert_rate_gap", "recall"],
            ascending=[False, False, True, False],
        ).reset_index(drop=True)
        chosen_row = ranked.iloc[0].copy()
        return float(chosen_row["threshold"]), "balanced_guardrails_relaxed", df, ranked

    df["balanced_score"] = (
        0.45 * df["f1"]
        + 0.20 * df["precision"]
        + 0.15 * df["recall"]
        - 0.20 * df["alert_rate_gap"]
    )

    ranked = df.sort_values(
        ["balanced_score", "precision", "recall"],
        ascending=[False, False, False],
    ).reset_index(drop=True)

    chosen_row = ranked.iloc[0].copy()
    return float(chosen_row["threshold"]), "balanced_score_fallback", df, ranked


def save_metrics(metrics: dict, save_path: Path):
    save_path.parent.mkdir(parents=True, exist_ok=True)
    with open(save_path, "w", encoding="utf-8") as f:
        json.dump(metrics, f, ensure_ascii=False, indent=2)


def plot_confusion_matrix(metrics: dict, save_path: Path, title_prefix: str = "Model"):
    import numpy as np
    import matplotlib.pyplot as plt
    import seaborn as sns

    cm = np.array(metrics["confusion_matrix"])

    plt.figure(figsize=(6, 5), facecolor="white")
    ax = plt.gca()
    ax.set_facecolor("white")

    sns.heatmap(
        cm,
        annot=True,
        fmt="d",
        cmap="Blues",
        cbar=False,
        square=True,
        linewidths=1.5,
        linecolor="white",
        annot_kws={"size": 16, "weight": "bold"},
        ax=ax,
    )

    ax.set_title(f"{title_prefix} - Confusion Matrix", fontsize=14, color="black", pad=12)
    ax.set_xlabel("Predicted", fontsize=12, color="black")
    ax.set_ylabel("Actual", fontsize=12, color="black")

    ax.tick_params(axis="x", colors="black", labelsize=11)
    ax.tick_params(axis="y", colors="black", labelsize=11)

    plt.tight_layout()
    save_path.parent.mkdir(parents=True, exist_ok=True)
    plt.savefig(save_path, dpi=180, bbox_inches="tight", facecolor="white")
    plt.close()
def plot_feature_importance(metrics: dict, save_path: Path, top_n: int = 15, title_prefix: str = "Model"):
    if "feature_importance" not in metrics:
        return

    fi = pd.Series(metrics["feature_importance"]).sort_values(ascending=False).head(top_n)
    fi = fi.sort_values(ascending=True)

    plt.figure(figsize=(8, 5), facecolor="white")
    ax = plt.gca()
    ax.set_facecolor("white")

    fi.plot(kind="barh", ax=ax)

    ax.set_title(f"{title_prefix} - Top {top_n} Feature Importance", fontsize=14, color="black", pad=12)
    ax.set_xlabel("Importance", fontsize=12, color="black")
    ax.set_ylabel("Feature", fontsize=12, color="black")
    ax.tick_params(axis="x", colors="black")
    ax.tick_params(axis="y", colors="black")

    plt.tight_layout()
    save_path.parent.mkdir(parents=True, exist_ok=True)
    plt.savefig(save_path, dpi=180, bbox_inches="tight", facecolor="white")
    plt.close()

class DriverTrainer:
    """
    Adapter entity đầu tiên cho driver.
    Dùng với core/train_engine.py
    """

    def build_bundle(self, spec: TaskSpec) -> TrainingBundle:
        df = build_driver_training_frame()
        feature_cols = get_curated_feature_columns(df)

        train_df, test_df, cutoff_month, test_month_values = split_by_time(df, spec.test_months)
        subtrain_df, val_df, val_cutoff_month, val_month_values = split_train_val_by_time(
            train_df,
            spec.validation_months,
        )

        return TrainingBundle(
            full_df=df,
            feature_columns=feature_cols,
            target_column=spec.label_column,
            subtrain_df=subtrain_df,
            validation_df=val_df,
            train_df=train_df,
            test_df=test_df,
            metadata={
                "time_split": {
                    "test_cutoff_month": str(pd.Timestamp(cutoff_month).date()),
                    "test_months": [str(pd.Timestamp(m).date()) for m in test_month_values],
                    "val_cutoff_month": str(pd.Timestamp(val_cutoff_month).date()),
                    "val_months": [str(pd.Timestamp(m).date()) for m in val_month_values],
                }
            },
        )

    def fit(self, bundle: TrainingBundle, spec: TaskSpec) -> Dict[str, Any]:
        X_subtrain = bundle.subtrain_df[bundle.feature_columns]
        y_subtrain = bundle.subtrain_df[bundle.target_column]

        X_val = bundle.validation_df[bundle.feature_columns]
        y_val = bundle.validation_df[bundle.target_column]

        all_candidates = build_model_candidates(spec.random_state)
        candidate_names = spec.model_candidates or list(all_candidates.keys())
        selected = {k: v for k, v in all_candidates.items() if k in candidate_names}

        best_name = None
        best_model_template = None
        best_val_metrics = None
        best_val_score = -1.0

        print("=== MODEL BENCHMARK ON VALIDATION ===")
        for name, model in selected.items():
            candidate = clone(model)
            print(f"\n--- TRAIN {name.upper()} ---")
            candidate.fit(X_subtrain, y_subtrain)

            val_metrics = evaluate_model_generic(
                model=candidate,
                X_test=X_val,
                y_test=y_val,
                feature_names=bundle.feature_columns,
                threshold=0.5,
            )

            print(
                f"{name} | "
                f"PR-AUC={val_metrics['pr_auc']} | "
                f"ROC-AUC={val_metrics['roc_auc']} | "
                f"Recall={val_metrics['recall']} | "
                f"Pred+Rate={val_metrics['predicted_positive_rate']}"
            )

            score = val_metrics["pr_auc"] if val_metrics["pr_auc"] is not None else -1.0
            if score > best_val_score:
                best_val_score = score
                best_name = name
                best_model_template = model
                best_val_metrics = val_metrics

        print("\n=== BEST MODEL ON VALIDATION ===")
        print(f"Best model: {best_name}")
        print(f"Best validation PR-AUC: {best_val_score}")

        best_val_model = clone(best_model_template)
        best_val_model.fit(X_subtrain, y_subtrain)
        val_prob = get_positive_class_proba(best_val_model, X_val)

        raw_threshold_df = evaluate_threshold_grid(y_val, val_prob)

        # Driver: ép threshold cố định để giảm false positive
        threshold_df = raw_threshold_df.copy()

        if spec.threshold_policy == "fixed_0_45":
            chosen_threshold = 0.45
            selection_mode = "fixed_0_45"
        elif spec.threshold_policy == "fixed_0_45":
            chosen_threshold = 0.45
            selection_mode = "fixed_0_45"
        else:
            chosen_threshold, selection_mode, threshold_df, ranked_thresholds = pick_balanced_threshold(
                raw_threshold_df,
                float(y_val.mean()),
            )

        print("\n=== THRESHOLD SWEEP ON VALIDATION ===")
        print(threshold_df.head(10).to_string(index=False))
        print(f"\nChosen threshold: {chosen_threshold:.2f}")
        print(f"Threshold selection mode: {selection_mode}")

        # Refit trên full train
        X_train = bundle.train_df[bundle.feature_columns]
        y_train = bundle.train_df[bundle.target_column]

        final_model = clone(best_model_template)
        final_model.fit(X_train, y_train)

        return {
            "model": final_model,
            "best_model_name": best_name,
            "chosen_threshold": float(chosen_threshold),
            "threshold_selection_metric": selection_mode,
            "threshold_df": threshold_df,
            "validation_metrics_at_0_5": best_val_metrics,
        }

    def evaluate(self, fitted: Dict[str, Any], bundle: TrainingBundle, spec: TaskSpec) -> Dict[str, Any]:
        model = fitted["model"]
        chosen_threshold = fitted["chosen_threshold"]

        X_test = bundle.test_df[bundle.feature_columns]
        y_test = bundle.test_df[bundle.target_column]

        X_train = bundle.train_df[bundle.feature_columns]
        y_train = bundle.train_df[bundle.target_column]
        y_val = bundle.validation_df[bundle.target_column]

        metrics_result = evaluate_model_generic(
            model=model,
            X_test=X_test,
            y_test=y_test,
            feature_names=bundle.feature_columns,
            threshold=chosen_threshold,
        )

        metrics_result["threshold"] = float(chosen_threshold)
        metrics_result["threshold_selection_metric"] = fitted["threshold_selection_metric"]
        metrics_result["best_model_name"] = fitted["best_model_name"]

        val_metrics = fitted["validation_metrics_at_0_5"]
        metrics_result["validation_pr_auc_at_0_5"] = val_metrics["pr_auc"]
        metrics_result["validation_roc_auc_at_0_5"] = val_metrics["roc_auc"]
        metrics_result["validation_recall_at_0_5"] = val_metrics["recall"]

        metrics_result["model_name"] = spec.task_key
        metrics_result["target_definition"] = "Predict whether driver has incident in next 3 months"

        metrics_result["train_rows"] = int(len(bundle.train_df))
        metrics_result["test_rows"] = int(len(bundle.test_df))
        metrics_result["subtrain_rows"] = int(len(bundle.subtrain_df))
        metrics_result["validation_rows"] = int(len(bundle.validation_df))

        metrics_result["train_positive_rate"] = float(y_train.mean())
        metrics_result["test_positive_rate"] = float(y_test.mean())
        metrics_result["validation_positive_rate"] = float(y_val.mean())

        metrics_result["feature_count"] = int(len(bundle.feature_columns))
        metrics_result["feature_columns"] = list(bundle.feature_columns)

        metrics_result["subtrain_start_month"] = str(pd.Timestamp(bundle.subtrain_df["month"].min()).date())
        metrics_result["subtrain_end_month"] = str(pd.Timestamp(bundle.subtrain_df["month"].max()).date())
        metrics_result["validation_start_month"] = str(pd.Timestamp(bundle.validation_df["month"].min()).date())
        metrics_result["validation_end_month"] = str(pd.Timestamp(bundle.validation_df["month"].max()).date())
        metrics_result["train_start_month"] = str(pd.Timestamp(bundle.train_df["month"].min()).date())
        metrics_result["train_end_month"] = str(pd.Timestamp(bundle.train_df["month"].max()).date())
        metrics_result["test_start_month"] = str(pd.Timestamp(bundle.test_df["month"].min()).date())
        metrics_result["test_end_month"] = str(pd.Timestamp(bundle.test_df["month"].max()).date())

        return metrics_result

    def save_artifacts(
        self,
        fitted: Dict[str, Any],
        bundle: TrainingBundle,
        metrics: Dict[str, Any],
        spec: TaskSpec,
    ) -> Dict[str, str]:
        spec.ensure_dirs()

        artifact_dir = spec.artifact_dir
        model_path = artifact_dir / "model.pkl"
        feature_columns_path = artifact_dir / "feature_columns.json"
        metrics_path = artifact_dir / "metrics.json"
        threshold_sweep_path = artifact_dir / "threshold_sweep.csv"
        confusion_matrix_png = artifact_dir / "confusion_matrix.png"
        feature_importance_png = artifact_dir / "feature_importance.png"

        joblib.dump(fitted["model"], model_path)

        with open(feature_columns_path, "w", encoding="utf-8") as f:
            json.dump(bundle.feature_columns, f, ensure_ascii=False, indent=2)

        save_metrics(metrics, metrics_path)
        fitted["threshold_df"].to_csv(threshold_sweep_path, index=False)

        plot_confusion_matrix(metrics, confusion_matrix_png, title_prefix="Driver Model")
        plot_feature_importance(metrics, feature_importance_png, title_prefix="Driver Model")

        if spec.legacy_model_path is not None:
            shutil.copy2(model_path, spec.legacy_model_path)

        artifact_paths = {
            "model_path": str(model_path),
            "feature_columns_path": str(feature_columns_path),
            "metrics_path": str(metrics_path),
            "threshold_sweep_path": str(threshold_sweep_path),
            "confusion_matrix_png": str(confusion_matrix_png),
            "feature_importance_png": str(feature_importance_png),
        }

        if spec.legacy_model_path is not None:
            artifact_paths["legacy_model_path"] = str(spec.legacy_model_path)

        print("\n=== SAVE ARTIFACTS ===")
        for k, v in artifact_paths.items():
            print(f"{k}: {v}")

        return artifact_paths

class FleetTrainer:
    """
    Fleet trainer thật, dùng cùng engine entity như driver.
    """

    def build_bundle(self, spec: TaskSpec) -> TrainingBundle:
        df = build_fleet_training_frame()
        feature_cols = get_curated_fleet_feature_columns(df)

        train_df, test_df, cutoff_month, test_month_values = split_by_time(df, spec.test_months)
        subtrain_df, val_df, val_cutoff_month, val_month_values = split_train_val_by_time(
            train_df,
            spec.validation_months,
        )

        return TrainingBundle(
            full_df=df,
            feature_columns=feature_cols,
            target_column=spec.label_column,
            subtrain_df=subtrain_df,
            validation_df=val_df,
            train_df=train_df,
            test_df=test_df,
            metadata={
                "time_split": {
                    "test_cutoff_month": str(pd.Timestamp(cutoff_month).date()),
                    "test_months": [str(pd.Timestamp(m).date()) for m in test_month_values],
                    "val_cutoff_month": str(pd.Timestamp(val_cutoff_month).date()),
                    "val_months": [str(pd.Timestamp(m).date()) for m in val_month_values],
                }
            },
        )

    def fit(self, bundle: TrainingBundle, spec: TaskSpec):
        X_subtrain = bundle.subtrain_df[bundle.feature_columns]
        y_subtrain = bundle.subtrain_df[bundle.target_column]

        X_val = bundle.validation_df[bundle.feature_columns]
        y_val = bundle.validation_df[bundle.target_column]

        all_candidates = build_model_candidates(spec.random_state)
        candidate_names = spec.model_candidates or list(all_candidates.keys())
        selected = {k: v for k, v in all_candidates.items() if k in candidate_names}

        best_name = None
        best_model_template = None
        best_val_metrics = None
        best_val_score = -1.0

        print("=== MODEL BENCHMARK ON VALIDATION ===")
        for name, model in selected.items():
            candidate = clone(model)
            print(f"\n--- TRAIN {name.upper()} ---")
            candidate.fit(X_subtrain, y_subtrain)

            val_metrics = evaluate_model_generic(
                model=candidate,
                X_test=X_val,
                y_test=y_val,
                feature_names=bundle.feature_columns,
                threshold=0.5,
            )

            print(
                f"{name} | "
                f"PR-AUC={val_metrics['pr_auc']} | "
                f"ROC-AUC={val_metrics['roc_auc']} | "
                f"Recall={val_metrics['recall']} | "
                f"Pred+Rate={val_metrics['predicted_positive_rate']}"
            )

            score = val_metrics["pr_auc"] if val_metrics["pr_auc"] is not None else -1.0
            if score > best_val_score:
                best_val_score = score
                best_name = name
                best_model_template = model
                best_val_metrics = val_metrics

        print("\n=== BEST MODEL ON VALIDATION ===")
        print(f"Best model: {best_name}")
        print(f"Best validation PR-AUC: {best_val_score}")

        best_val_model = clone(best_model_template)
        best_val_model.fit(X_subtrain, y_subtrain)
        val_prob = get_positive_class_proba(best_val_model, X_val)

        raw_threshold_df = evaluate_threshold_grid(y_val, val_prob)

        # Fleet dùng threshold cố định 0.5 ở bước này
        threshold_df = raw_threshold_df.copy()
        chosen_threshold = 0.5
        selection_mode = "fixed_0_5"

        ranked_thresholds = threshold_df.sort_values(
            ["threshold"],
            ascending=[True],
        ).reset_index(drop=True)

        print("\n=== THRESHOLD SWEEP ON VALIDATION ===")
        print(threshold_df.head(10).to_string(index=False))
        print(f"\nChosen threshold: {chosen_threshold:.2f}")
        print(f"Threshold selection mode: {selection_mode}")

        X_train = bundle.train_df[bundle.feature_columns]
        y_train = bundle.train_df[bundle.target_column]

        final_model = clone(best_model_template)
        final_model.fit(X_train, y_train)

        return {
            "model": final_model,
            "best_model_name": best_name,
            "chosen_threshold": float(chosen_threshold),
            "threshold_selection_metric": selection_mode,
            "threshold_df": threshold_df,
            "validation_metrics_at_0_5": best_val_metrics,
        }

    def evaluate(self, fitted, bundle: TrainingBundle, spec: TaskSpec):
        model = fitted["model"]
        chosen_threshold = fitted["chosen_threshold"]

        X_test = bundle.test_df[bundle.feature_columns]
        y_test = bundle.test_df[bundle.target_column]

        X_train = bundle.train_df[bundle.feature_columns]
        y_train = bundle.train_df[bundle.target_column]
        y_val = bundle.validation_df[bundle.target_column]

        metrics_result = evaluate_model_generic(
            model=model,
            X_test=X_test,
            y_test=y_test,
            feature_names=bundle.feature_columns,
            threshold=chosen_threshold,
        )

        metrics_result["threshold"] = float(chosen_threshold)
        metrics_result["threshold_selection_metric"] = fitted["threshold_selection_metric"]
        metrics_result["best_model_name"] = fitted["best_model_name"]

        val_metrics = fitted["validation_metrics_at_0_5"]
        metrics_result["validation_pr_auc_at_0_5"] = val_metrics["pr_auc"]
        metrics_result["validation_roc_auc_at_0_5"] = val_metrics["roc_auc"]
        metrics_result["validation_recall_at_0_5"] = val_metrics["recall"]

        metrics_result["model_name"] = spec.task_key
        metrics_result["target_definition"] = "Predict whether truck has emergency maintenance in next 3 months"

        metrics_result["train_rows"] = int(len(bundle.train_df))
        metrics_result["test_rows"] = int(len(bundle.test_df))
        metrics_result["subtrain_rows"] = int(len(bundle.subtrain_df))
        metrics_result["validation_rows"] = int(len(bundle.validation_df))

        metrics_result["train_positive_rate"] = float(y_train.mean())
        metrics_result["test_positive_rate"] = float(y_test.mean())
        metrics_result["validation_positive_rate"] = float(y_val.mean())

        metrics_result["feature_count"] = int(len(bundle.feature_columns))
        metrics_result["feature_columns"] = list(bundle.feature_columns)

        metrics_result["subtrain_start_month"] = str(pd.Timestamp(bundle.subtrain_df["month"].min()).date())
        metrics_result["subtrain_end_month"] = str(pd.Timestamp(bundle.subtrain_df["month"].max()).date())
        metrics_result["validation_start_month"] = str(pd.Timestamp(bundle.validation_df["month"].min()).date())
        metrics_result["validation_end_month"] = str(pd.Timestamp(bundle.validation_df["month"].max()).date())
        metrics_result["train_start_month"] = str(pd.Timestamp(bundle.train_df["month"].min()).date())
        metrics_result["train_end_month"] = str(pd.Timestamp(bundle.train_df["month"].max()).date())
        metrics_result["test_start_month"] = str(pd.Timestamp(bundle.test_df["month"].min()).date())
        metrics_result["test_end_month"] = str(pd.Timestamp(bundle.test_df["month"].max()).date())

        return metrics_result

    def save_artifacts(self, fitted, bundle: TrainingBundle, metrics, spec: TaskSpec):
        spec.ensure_dirs()

        artifact_dir = spec.artifact_dir
        model_path = artifact_dir / "model.pkl"
        feature_columns_path = artifact_dir / "feature_columns.json"
        metrics_path = artifact_dir / "metrics.json"
        threshold_sweep_path = artifact_dir / "threshold_sweep.csv"
        confusion_matrix_png = artifact_dir / "confusion_matrix.png"
        feature_importance_png = artifact_dir / "feature_importance.png"

        joblib.dump(fitted["model"], model_path)

        with open(feature_columns_path, "w", encoding="utf-8") as f:
            json.dump(bundle.feature_columns, f, ensure_ascii=False, indent=2)

        save_metrics(metrics, metrics_path)
        fitted["threshold_df"].to_csv(threshold_sweep_path, index=False)

        plot_confusion_matrix(metrics, confusion_matrix_png, title_prefix="Fleet Model")
        plot_feature_importance(metrics, feature_importance_png, title_prefix="Fleet Model")

        if spec.legacy_model_path is not None:
            shutil.copy2(model_path, spec.legacy_model_path)

        artifact_paths = {
            "model_path": str(model_path),
            "feature_columns_path": str(feature_columns_path),
            "metrics_path": str(metrics_path),
            "threshold_sweep_path": str(threshold_sweep_path),
            "confusion_matrix_png": str(confusion_matrix_png),
            "feature_importance_png": str(feature_importance_png),
        }

        if spec.legacy_model_path is not None:
            artifact_paths["legacy_model_path"] = str(spec.legacy_model_path)

        print("\n=== SAVE ARTIFACTS ===")
        for k, v in artifact_paths.items():
            print(f"{k}: {v}")

        return artifact_paths

class OpsTrainer:
    """
    Ops trainer thật, dùng cùng engine entity như driver/fleet.
    """

    def build_bundle(self, spec: TaskSpec) -> TrainingBundle:
        df = build_ops_training_frame()
        feature_cols = get_curated_ops_feature_columns(df)

        train_df, test_df, cutoff_month, test_month_values = split_by_time(df, spec.test_months)
        subtrain_df, val_df, val_cutoff_month, val_month_values = split_train_val_by_time(
            train_df,
            spec.validation_months,
        )

        return TrainingBundle(
            full_df=df,
            feature_columns=feature_cols,
            target_column=spec.label_column,
            subtrain_df=subtrain_df,
            validation_df=val_df,
            train_df=train_df,
            test_df=test_df,
            metadata={
                "time_split": {
                    "test_cutoff_month": str(pd.Timestamp(cutoff_month).date()),
                    "test_months": [str(pd.Timestamp(m).date()) for m in test_month_values],
                    "val_cutoff_month": str(pd.Timestamp(val_cutoff_month).date()),
                    "val_months": [str(pd.Timestamp(m).date()) for m in val_month_values],
                }
            },
        )

    def fit(self, bundle: TrainingBundle, spec: TaskSpec):
        X_subtrain = bundle.subtrain_df[bundle.feature_columns]
        y_subtrain = bundle.subtrain_df[bundle.target_column]

        X_val = bundle.validation_df[bundle.feature_columns]
        y_val = bundle.validation_df[bundle.target_column]

        all_candidates = build_model_candidates(spec.random_state)
        candidate_names = spec.model_candidates or list(all_candidates.keys())
        selected = {k: v for k, v in all_candidates.items() if k in candidate_names}

        best_name = None
        best_model_template = None
        best_val_metrics = None
        best_val_score = -1.0

        print("=== MODEL BENCHMARK ON VALIDATION ===")
        for name, model in selected.items():
            candidate = clone(model)
            print(f"\n--- TRAIN {name.upper()} ---")
            candidate.fit(X_subtrain, y_subtrain)

            val_metrics = evaluate_model_generic(
                model=candidate,
                X_test=X_val,
                y_test=y_val,
                feature_names=bundle.feature_columns,
                threshold=0.5,
            )

            print(
                f"{name} | "
                f"PR-AUC={val_metrics['pr_auc']} | "
                f"ROC-AUC={val_metrics['roc_auc']} | "
                f"Recall={val_metrics['recall']} | "
                f"Pred+Rate={val_metrics['predicted_positive_rate']}"
            )

            score = val_metrics["pr_auc"] if val_metrics["pr_auc"] is not None else -1.0
            if score > best_val_score:
                best_val_score = score
                best_name = name
                best_model_template = model
                best_val_metrics = val_metrics

        print("\n=== BEST MODEL ON VALIDATION ===")
        print(f"Best model: {best_name}")
        print(f"Best validation PR-AUC: {best_val_score}")

        best_val_model = clone(best_model_template)
        best_val_model.fit(X_subtrain, y_subtrain)
        val_prob = get_positive_class_proba(best_val_model, X_val)

        raw_threshold_df = evaluate_threshold_grid(y_val, val_prob)

        # Ops dùng threshold cố định 0.5 ở bước này
        threshold_df = raw_threshold_df.copy()
        chosen_threshold = 0.5
        selection_mode = "fixed_0_5"

        print("\n=== THRESHOLD SWEEP ON VALIDATION ===")
        print(threshold_df.head(10).to_string(index=False))
        print(f"\nChosen threshold: {chosen_threshold:.2f}")
        print(f"Threshold selection mode: {selection_mode}")

        X_train = bundle.train_df[bundle.feature_columns]
        y_train = bundle.train_df[bundle.target_column]

        final_model = clone(best_model_template)
        final_model.fit(X_train, y_train)

        return {
            "model": final_model,
            "best_model_name": best_name,
            "chosen_threshold": float(chosen_threshold),
            "threshold_selection_metric": selection_mode,
            "threshold_df": threshold_df,
            "validation_metrics_at_0_5": best_val_metrics,
        }

    def evaluate(self, fitted, bundle: TrainingBundle, spec: TaskSpec):
        model = fitted["model"]
        chosen_threshold = fitted["chosen_threshold"]

        X_test = bundle.test_df[bundle.feature_columns]
        y_test = bundle.test_df[bundle.target_column]

        X_train = bundle.train_df[bundle.feature_columns]
        y_train = bundle.train_df[bundle.target_column]
        y_val = bundle.validation_df[bundle.target_column]

        metrics_result = evaluate_model_generic(
            model=model,
            X_test=X_test,
            y_test=y_test,
            feature_names=bundle.feature_columns,
            threshold=chosen_threshold,
        )

        metrics_result["threshold"] = float(chosen_threshold)
        metrics_result["threshold_selection_metric"] = fitted["threshold_selection_metric"]
        metrics_result["best_model_name"] = fitted["best_model_name"]

        val_metrics = fitted["validation_metrics_at_0_5"]
        metrics_result["validation_pr_auc_at_0_5"] = val_metrics["pr_auc"]
        metrics_result["validation_roc_auc_at_0_5"] = val_metrics["roc_auc"]
        metrics_result["validation_recall_at_0_5"] = val_metrics["recall"]

        metrics_result["model_name"] = spec.task_key
        metrics_result["target_definition"] = "Predict whether route has severe operational disruption in next 3 months"

        metrics_result["train_rows"] = int(len(bundle.train_df))
        metrics_result["test_rows"] = int(len(bundle.test_df))
        metrics_result["subtrain_rows"] = int(len(bundle.subtrain_df))
        metrics_result["validation_rows"] = int(len(bundle.validation_df))

        metrics_result["train_positive_rate"] = float(y_train.mean())
        metrics_result["test_positive_rate"] = float(y_test.mean())
        metrics_result["validation_positive_rate"] = float(y_val.mean())

        metrics_result["feature_count"] = int(len(bundle.feature_columns))
        metrics_result["feature_columns"] = list(bundle.feature_columns)

        metrics_result["subtrain_start_month"] = str(pd.Timestamp(bundle.subtrain_df["month"].min()).date())
        metrics_result["subtrain_end_month"] = str(pd.Timestamp(bundle.subtrain_df["month"].max()).date())
        metrics_result["validation_start_month"] = str(pd.Timestamp(bundle.validation_df["month"].min()).date())
        metrics_result["validation_end_month"] = str(pd.Timestamp(bundle.validation_df["month"].max()).date())
        metrics_result["train_start_month"] = str(pd.Timestamp(bundle.train_df["month"].min()).date())
        metrics_result["train_end_month"] = str(pd.Timestamp(bundle.train_df["month"].max()).date())
        metrics_result["test_start_month"] = str(pd.Timestamp(bundle.test_df["month"].min()).date())
        metrics_result["test_end_month"] = str(pd.Timestamp(bundle.test_df["month"].max()).date())

        return metrics_result

    def save_artifacts(self, fitted, bundle: TrainingBundle, metrics, spec: TaskSpec):
        spec.ensure_dirs()

        artifact_dir = spec.artifact_dir
        model_path = artifact_dir / "model.pkl"
        feature_columns_path = artifact_dir / "feature_columns.json"
        metrics_path = artifact_dir / "metrics.json"
        threshold_sweep_path = artifact_dir / "threshold_sweep.csv"
        confusion_matrix_png = artifact_dir / "confusion_matrix.png"
        feature_importance_png = artifact_dir / "feature_importance.png"

        joblib.dump(fitted["model"], model_path)

        with open(feature_columns_path, "w", encoding="utf-8") as f:
            json.dump(bundle.feature_columns, f, ensure_ascii=False, indent=2)

        save_metrics(metrics, metrics_path)
        fitted["threshold_df"].to_csv(threshold_sweep_path, index=False)

        plot_confusion_matrix(metrics, confusion_matrix_png, title_prefix="Ops Model")
        plot_feature_importance(metrics, feature_importance_png, title_prefix="Ops Model")

        if spec.legacy_model_path is not None:
            shutil.copy2(model_path, spec.legacy_model_path)

        artifact_paths = {
            "model_path": str(model_path),
            "feature_columns_path": str(feature_columns_path),
            "metrics_path": str(metrics_path),
            "threshold_sweep_path": str(threshold_sweep_path),
            "confusion_matrix_png": str(confusion_matrix_png),
            "feature_importance_png": str(feature_importance_png),
        }

        if spec.legacy_model_path is not None:
            artifact_paths["legacy_model_path"] = str(spec.legacy_model_path)

        print("\n=== SAVE ARTIFACTS ===")
        for k, v in artifact_paths.items():
            print(f"{k}: {v}")

        return artifact_paths
def get_entity_trainer(task_key: str):
    if task_key == "driver_ai":
        return DriverTrainer()
    if task_key == "fleet_ai":
        return FleetTrainer()
    if task_key == "ops_ai":
        return OpsTrainer()
    raise ValueError(f"Chưa có trainer cho entity task: {task_key}")


def train_driver_entity_model(spec: TaskSpec | None = None):
    if spec is None:
        spec = default_driver_task_spec()

    trainer = DriverTrainer()
    return run_training_pipeline(spec=spec, trainer=trainer, save_artifacts=True, verbose=True)

def train_fleet_entity_model(spec: TaskSpec | None = None):
    if spec is None:
        spec = default_fleet_task_spec()

    trainer = FleetTrainer()
    return run_training_pipeline(spec=spec, trainer=trainer, save_artifacts=True, verbose=True)

def train_ops_entity_model(spec: TaskSpec | None = None):
    if spec is None:
        spec = default_ops_task_spec()

    trainer = OpsTrainer()
    return run_training_pipeline(spec=spec, trainer=trainer, save_artifacts=True, verbose=True)