from __future__ import annotations

from contextlib import asynccontextmanager
from typing import Any, Dict, List, Optional
import io
import os

import numpy as np
import pandas as pd
from fastapi import FastAPI, File, HTTPException, UploadFile
from pydantic import BaseModel

from api.process_ai.entity.inference import (
    predict_driver_risk,
    predict_fleet_risk,
    predict_ops_risk,
)
from api.process_ai.process.core.features import build_case_feature_matrix
from api.process_ai.process.core.inference import load_process_artifacts
from api.process_ai.process.core.validate import validate_events_df


# ======================================================
# Paths / Config
# ======================================================
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(CURRENT_DIR)

MODEL_DIR = os.path.join(PROJECT_ROOT, "model")
PROCESS_MODEL_ROOT = os.path.join(MODEL_DIR, "process_models")
REGISTRY_DIR = os.path.join(
    PROJECT_ROOT,
    "data",
    "synth_optimal_3process_v1",
    "registry",
)

# Process artifacts cache
_process_artifacts_cache: Dict[str, Any] = {}

# process_code -> process_id
PROCESS_ID_MAP = {
    "TRUCKING_DELIVERY_FLOW": 1,
    "WAREHOUSE_FULFILLMENT": 2,
    "IMPORT_CUSTOMS_CLEARANCE": 3,
}

# aliases -> canonical process_code
PROCESS_ALIAS_MAP = {
    "TRUCKING": "TRUCKING_DELIVERY_FLOW",
    "WAREHOUSE": "WAREHOUSE_FULFILLMENT",
    "CUSTOMS": "IMPORT_CUSTOMS_CLEARANCE",
}

# process_code -> batch wrapper key
PROCESS_BATCH_KEY_MAP = {
    "TRUCKING_DELIVERY_FLOW": "trucking_result",
    "WAREHOUSE_FULFILLMENT": "warehouse_result",
    "IMPORT_CUSTOMS_CLEARANCE": "customs_result",
}


# ======================================================
# Entity influence config
# ======================================================
DRIVER_FEATURE_COLS = [
    "years_experience",
    "total_accidents",
    "avg_ontime_rate",
    "avg_miles_per_month",
    "avg_mpg",
]

FLEET_FEATURE_COLS = [
    "truck_age",
    "lifetime_maint_cost",
    "maint_frequency",
    "total_downtime",
    "avg_monthly_miles",
]

OPS_FEATURE_COLS = [
    "detention_hours",
    "real_mpg",
    "delay_hours",
    "actual_distance_miles",
]

ENTITY_FUSION_WEIGHTS = {
    "driver": 0.4,
    "fleet": 0.3,
    "ops": 0.3,
}

PROCESS_ENTITY_BLEND = {
    "process_weight": 0.7,
    "entity_weight": 0.3,
}


# ======================================================
# Lifespan
# ======================================================
@asynccontextmanager
async def lifespan(_app: FastAPI):
    print("✅ Logistics AI app started.")
    yield


app = FastAPI(title="Logistics AI Core", lifespan=lifespan)


@app.get("/")
def root():
    return {"status": "ok"}


@app.get("/health")
def health():
    return {"status": "healthy"}


@app.get("/entity/info")
def entity_info():
    return {
        "supported_entities": ["driver", "fleet", "ops"],
    }


@app.get("/process/info")
def process_info():
    return {
        "supported_processes": [
            {
                "process_code": process_code,
                "process_id": process_id,
                "batch_key": PROCESS_BATCH_KEY_MAP[process_code],
            }
            for process_code, process_id in PROCESS_ID_MAP.items()
        ],
        "aliases": PROCESS_ALIAS_MAP,
    }


# ======================================================
# Shared helpers
# ======================================================

def _compress_process_result_v2(process_code: str, payload: Dict[str, Any]) -> Dict[str, Any]:

    ps = payload.get("process_specific", {})

    base = {
        "case_count": payload.get("case_count", 0),
        "avg_risk_score": payload.get("avg_risk_score", 0.0),
        "anomaly_rate": payload.get("anomaly_rate", 0.0),
    }

    if process_code == "TRUCKING_DELIVERY_FLOW":
        base.update({
            "avg_transit_delay_min": ps.get("avg_transit_delay_min", 0.0),
            "avg_hub_touch_count": ps.get("avg_hub_touch_count", 0.0),
            "avg_delivery_attempt_count": ps.get("avg_delivery_attempt_count", 0.0),
        })
        return base

    if process_code == "WAREHOUSE_FULFILLMENT":
        base.update({
            "avg_pick_pack_time_min": ps.get("avg_pick_pack_time_min", 0.0),
            "qc_rework_rate": ps.get("qc_rework_rate", 0.0),
            "avg_staging_wait_min": ps.get("avg_staging_wait_min", 0.0),
        })
        return base

    if process_code == "IMPORT_CUSTOMS_CLEARANCE":
        base.update({
            "avg_inspection_delay_min": ps.get("avg_inspection_delay_min", 0.0),
            "document_recheck_rate": ps.get("document_recheck_rate", 0.0),
            "avg_clearance_cycle_time_min": ps.get("avg_clearance_cycle_time_min", 0.0),
        })
        return base

    return base

def _normalize_process_code(process_code: str) -> str:
    s = str(process_code).strip().upper()

    if s in PROCESS_ID_MAP:
        return s

    if s in PROCESS_ALIAS_MAP:
        return PROCESS_ALIAS_MAP[s]

    raise HTTPException(status_code=400, detail=f"Unknown process_code: {process_code}")


def _normalize_process_code_value(value: Any) -> str:
    s = str(value).strip().upper()
    if not s:
        raise ValueError("Empty process_code")

    if s in PROCESS_ID_MAP:
        return s

    if s in PROCESS_ALIAS_MAP:
        return PROCESS_ALIAS_MAP[s]

    raise ValueError(f"Unsupported process_code: {value}")


def _entity_response(result_df: pd.DataFrame, metadata: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "meta": metadata,
        "rows": result_df.to_dict(orient="records"),
    }


def _clip_risk(x: float) -> int:
    return int(round(max(0.0, min(100.0, float(x)))))


def _extract_entity_risk_series(result_df: pd.DataFrame) -> pd.Series:
    """
    Try to extract a row-level risk score from entity inference output.
    If the entity inference returns a 0-1 probability, convert to 0-100.
    """
    candidate_cols = [
        "risk_score",
        "final_risk_score",
        "score",
        "probability",
        "predicted_probability",
        "risk_probability",
        "prediction_score",
    ]

    for col in candidate_cols:
        if col in result_df.columns:
            s = pd.Series(pd.to_numeric(result_df[col], errors="coerce"))
            if s.notna().any():
                s = s.fillna(0.0)
                if float(s.max()) <= 1.0:
                    s = s * 100.0
                return s.clip(0.0, 100.0)

    numeric_cols = [c for c in result_df.columns if pd.api.types.is_numeric_dtype(result_df[c])]
    if not numeric_cols:
        raise ValueError("Could not find any numeric score column in entity inference output")

    s = pd.Series(pd.to_numeric(result_df[numeric_cols[0]], errors="coerce")).fillna(0.0)
    if float(s.max()) <= 1.0:
        s = s * 100.0
    return s.clip(0.0, 100.0)


def _score_entity_slice(
    entity_df: pd.DataFrame,
    entity_type: str,
    feature_cols: List[str],
) -> pd.DataFrame:
    part = entity_df[entity_df["entity_type"].astype(str).str.lower() == entity_type.lower()].copy()
    if part.empty:
        return pd.DataFrame(columns=["scenario_id", f"{entity_type}_risk"])

    missing = [c for c in feature_cols if c not in part.columns]
    if missing:
        raise HTTPException(
            status_code=400,
            detail=f"Integrated CSV missing {entity_type} feature columns: {missing}",
        )

    model_input = part[feature_cols].copy().to_dict(orient="records")

    try:
        if entity_type == "driver":
            result_df, _ = predict_driver_risk(model_input, return_metadata=True)
        elif entity_type == "fleet":
            result_df, _ = predict_fleet_risk(model_input, return_metadata=True)
        elif entity_type == "ops":
            result_df, _ = predict_ops_risk(model_input, return_metadata=True)
        else:
            raise ValueError(f"Unsupported entity_type: {entity_type}")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"{entity_type} entity scoring failed: {e}")

    score_series = _extract_entity_risk_series(result_df).reset_index(drop=True)

    out = part[["scenario_id"]].reset_index(drop=True).copy()
    out[f"{entity_type}_risk"] = score_series.astype(float)
    return out


def _compute_entity_score_map_from_integrated(raw_df: pd.DataFrame) -> Dict[str, float]:
    """
    From an integrated CSV, compute one fused entity score per scenario_id.
    This is used internally only; process output schema remains unchanged.
    """
    if "row_group" not in raw_df.columns:
        return {}

    df = raw_df.copy()
    df["row_group"] = df["row_group"].astype(str).str.strip().str.lower()

    entity_df = df[df["row_group"] == "entity"].copy()
    if entity_df.empty:
        return {}

    if "scenario_id" not in entity_df.columns or "entity_type" not in entity_df.columns:
        raise HTTPException(
            status_code=400,
            detail="Integrated CSV entity rows must contain scenario_id and entity_type",
        )

    driver_scores = _score_entity_slice(entity_df, "driver", DRIVER_FEATURE_COLS)
    fleet_scores = _score_entity_slice(entity_df, "fleet", FLEET_FEATURE_COLS)
    ops_scores = _score_entity_slice(entity_df, "ops", OPS_FEATURE_COLS)

    merged = None
    for piece in [driver_scores, fleet_scores, ops_scores]:
        if piece.empty:
            continue
        merged = piece if merged is None else merged.merge(piece, on="scenario_id", how="outer")

    if merged is None or merged.empty:
        return {}

    def fuse_row(row: pd.Series) -> float:
        total = 0.0
        total_w = 0.0

        for entity_type, weight in ENTITY_FUSION_WEIGHTS.items():
            col = f"{entity_type}_risk"
            val = row.get(col, np.nan)
            if pd.notna(val):
                total += weight * float(val)
                total_w += weight

        if total_w <= 0:
            return np.nan

        return total / total_w

    merged["entity_score"] = merged.apply(fuse_row, axis=1)
    merged = merged.dropna(subset=["entity_score"]).copy()

    return {
        str(row["scenario_id"]): float(row["entity_score"])
        for _, row in merged.iterrows()
    }


def _fuse_process_with_entity(process_risk: float, entity_risk: Optional[float]) -> int:
    """
    Keep output schema unchanged, only change internal risk calculation.
    """
    if entity_risk is None or pd.isna(entity_risk):
        return _clip_risk(process_risk)

    fused = (
        PROCESS_ENTITY_BLEND["process_weight"] * float(process_risk)
        + PROCESS_ENTITY_BLEND["entity_weight"] * float(entity_risk)
    )
    return _clip_risk(fused)


def _extract_process_rows_from_any_csv(df: pd.DataFrame, process_code: str) -> pd.DataFrame:
    """
    Backward-compatible extractor for old explicit process endpoints.
    If row_group exists, it will use only process_event rows.
    For explicit endpoints, process_code is still provided by caller.
    """
    df = df.copy()

    if "row_group" in df.columns:
        df["row_group"] = df["row_group"].astype(str).str.strip().str.lower()
        df = df[df["row_group"] == "process_event"].copy()

        if df.empty:
            raise HTTPException(
                status_code=400,
                detail="Integrated CSV contains no process_event rows",
            )

        if "process_code" not in df.columns:
            df["process_code"] = process_code
        else:
            df["process_code"] = df["process_code"].astype(str).str.strip()
            df.loc[df["process_code"] == "", "process_code"] = process_code
            df.loc[df["process_code"].isna(), "process_code"] = process_code

    else:
        if "process_code" not in df.columns:
            df["process_code"] = process_code
        else:
            df["process_code"] = df["process_code"].astype(str).str.strip()
            df.loc[df["process_code"] == "", "process_code"] = process_code
            df.loc[df["process_code"].isna(), "process_code"] = process_code

    required_cols = ["process_code", "case_id", "step_code", "start_time", "end_time"]
    missing = [c for c in required_cols if c not in df.columns]
    if missing:
        raise HTTPException(
            status_code=400,
            detail=f"CSV missing required process columns: {missing}",
        )

    keep_cols = required_cols.copy()
    if "scenario_id" in df.columns:
        keep_cols = ["scenario_id"] + keep_cols

    out = df[keep_cols].copy()
    out = out.dropna(subset=["case_id", "step_code", "start_time", "end_time"]).copy()
    out["process_code"] = out["process_code"].astype(str).str.strip()

    return out.reset_index(drop=True)


def _extract_integrated_process_df(raw_df: pd.DataFrame) -> pd.DataFrame:
    """
    Extract and normalize process_event rows from an integrated CSV.
    Detection is based ONLY on process_code.
    """
    if "row_group" not in raw_df.columns:
        raise HTTPException(status_code=400, detail="Missing required column: row_group")

    df = raw_df.copy()
    df["row_group"] = df["row_group"].fillna("").astype(str).str.strip().str.lower()
    process_df = df[df["row_group"] == "process_event"].copy()

    if process_df.empty:
        raise HTTPException(status_code=400, detail="No process_event rows found in file")

    required_cols = ["scenario_id", "process_code", "case_id", "step_code", "start_time", "end_time"]
    missing = [c for c in required_cols if c not in process_df.columns]
    if missing:
        raise HTTPException(
            status_code=400,
            detail=f"Missing required process columns: {missing}",
        )

    process_df["scenario_id"] = process_df["scenario_id"].fillna("").astype(str).str.strip()
    process_df["process_code"] = process_df["process_code"].fillna("").astype(str).str.strip()
    process_df["case_id"] = process_df["case_id"].fillna("").astype(str).str.strip()
    process_df["step_code"] = process_df["step_code"].fillna("").astype(str).str.strip()
    process_df["start_time"] = process_df["start_time"].fillna("").astype(str).str.strip()
    process_df["end_time"] = process_df["end_time"].fillna("").astype(str).str.strip()

    invalid_process_codes = []
    normalized_codes: List[str] = []
    for val in process_df["process_code"].tolist():
        try:
            normalized_codes.append(_normalize_process_code_value(val))
        except Exception:
            invalid_process_codes.append(val)

    if invalid_process_codes:
        bad_vals = sorted(set([str(x) for x in invalid_process_codes if str(x).strip()]))
        raise HTTPException(
            status_code=400,
            detail=f"Invalid process_code values found: {bad_vals}",
        )

    process_df["process_code"] = normalized_codes

    for c in ["scenario_id", "case_id", "step_code", "start_time", "end_time"]:
        missing_count = int((process_df[c] == "").sum())
        if missing_count > 0:
            raise HTTPException(
                status_code=400,
                detail=f"Process rows missing {c}: {missing_count}",
            )

    return process_df[
        ["scenario_id", "process_code", "case_id", "step_code", "start_time", "end_time"]
    ].reset_index(drop=True)


def _validate_integrated_csv_structure(raw_df: pd.DataFrame) -> Dict[str, Any]:
    """
    Validate integrated CSV structure and report compact validation info.

    Public response:
    - show entity summary again
    - remove detected_processes
    """
    errors: List[str] = []
    warnings: List[str] = []

    summary: Dict[str, Any] = {
        "total_rows": int(len(raw_df)),
        "entity_rows": 0,
        "process_event_rows": 0,
        "scenario_count": 0,
        "entity_type_counts": {},
    }

    process_row_counts: Dict[str, int] = {}
    process_case_counts: Dict[str, int] = {}

    required_common_cols = ["row_group", "scenario_id"]
    missing_common = [c for c in required_common_cols if c not in raw_df.columns]
    if missing_common:
        errors.append(f"Missing common columns: {missing_common}")
        return {
            "valid": False,
            "errors": errors,
            "warnings": warnings,
            "summary": summary,
            "process_row_counts": process_row_counts,
            "process_case_counts": process_case_counts,
        }

    df = raw_df.copy()
    df["row_group"] = df["row_group"].fillna("").astype(str).str.strip().str.lower()
    df["scenario_id"] = df["scenario_id"].fillna("").astype(str).str.strip()

    summary["scenario_count"] = int(df.loc[df["scenario_id"] != "", "scenario_id"].nunique())

    allowed_row_groups = {"entity", "process_event"}
    invalid_row_groups = sorted(set(df["row_group"]) - allowed_row_groups - {""})
    if invalid_row_groups:
        errors.append(f"Invalid row_group values found: {invalid_row_groups}")

    entity_df = df[df["row_group"] == "entity"].copy()
    process_df = df[df["row_group"] == "process_event"].copy()

    summary["entity_rows"] = int(len(entity_df))
    summary["process_event_rows"] = int(len(process_df))

    if entity_df.empty:
        warnings.append("No entity rows found.")
    if process_df.empty:
        errors.append("No process_event rows found.")

    # ---------- entity checks ----------
    if not entity_df.empty:
        if "entity_type" not in entity_df.columns:
            errors.append("Missing entity_type column for entity rows.")
        else:
            entity_df["entity_type"] = (
                entity_df["entity_type"].fillna("").astype(str).str.strip().str.lower()
            )

            entity_counts = entity_df["entity_type"].value_counts().to_dict()
            summary["entity_type_counts"] = {
                str(k): int(v) for k, v in entity_counts.items()
            }

            allowed_entity_types = {"driver", "fleet", "ops"}
            invalid_entity_types = sorted(set(entity_df["entity_type"]) - allowed_entity_types - {""})
            if invalid_entity_types:
                errors.append(f"Invalid entity_type values found: {invalid_entity_types}")

            for entity_type, feature_cols in [
                ("driver", DRIVER_FEATURE_COLS),
                ("fleet", FLEET_FEATURE_COLS),
                ("ops", OPS_FEATURE_COLS),
            ]:
                part = entity_df[entity_df["entity_type"] == entity_type].copy()
                if part.empty:
                    warnings.append(f"No {entity_type} rows found.")
                    continue

                missing_feature_cols = [c for c in feature_cols if c not in entity_df.columns]
                if missing_feature_cols:
                    errors.append(f"Missing {entity_type} feature columns: {missing_feature_cols}")

        missing_entity_scenario = int((entity_df["scenario_id"] == "").sum())
        if missing_entity_scenario > 0:
            errors.append(f"Entity rows missing scenario_id: {missing_entity_scenario}")

    # ---------- process checks ----------
    if not process_df.empty:
        required_process_cols = ["process_code", "case_id", "step_code", "start_time", "end_time"]
        missing_process_cols = [c for c in required_process_cols if c not in process_df.columns]
        if missing_process_cols:
            errors.append(f"Missing required process columns: {missing_process_cols}")
        else:
            process_df["process_code"] = (
                process_df["process_code"].fillna("").astype(str).str.strip()
            )
            process_df["case_id"] = process_df["case_id"].fillna("").astype(str).str.strip()
            process_df["step_code"] = process_df["step_code"].fillna("").astype(str).str.strip()
            process_df["start_time"] = process_df["start_time"].fillna("").astype(str).str.strip()
            process_df["end_time"] = process_df["end_time"].fillna("").astype(str).str.strip()

            for c in ["scenario_id", "process_code", "case_id", "step_code", "start_time", "end_time"]:
                missing_count = int((process_df[c] == "").sum())
                if missing_count > 0:
                    errors.append(f"Process rows missing {c}: {missing_count}")

            normalized_codes: List[str] = []
            invalid_codes: List[str] = []

            for val in process_df["process_code"].tolist():
                try:
                    normalized_codes.append(_normalize_process_code_value(val))
                except Exception:
                    invalid_codes.append(val)

            if invalid_codes:
                bad_vals = sorted(set([str(x) for x in invalid_codes if str(x).strip()]))
                errors.append(f"Invalid process_code values found: {bad_vals}")
            else:
                process_df["process_code"] = normalized_codes
                process_row_counts = {
                    code: int(cnt)
                    for code, cnt in process_df["process_code"].value_counts().to_dict().items()
                }
                process_case_counts = {
                    code: int(cnt)
                    for code, cnt in process_df.groupby("process_code")["case_id"].nunique().to_dict().items()
                }

    # ---------- cross-check scenario matching ----------
    entity_scenarios = set(entity_df.loc[entity_df["scenario_id"] != "", "scenario_id"])
    process_scenarios = set(process_df.loc[process_df["scenario_id"] != "", "scenario_id"])

    if entity_scenarios and process_scenarios:
        only_entity = entity_scenarios - process_scenarios
        only_process = process_scenarios - entity_scenarios

        if only_entity:
            warnings.append(
                f"Some scenario_id values appear only in entity rows but not in process_event rows. Count={len(only_entity)}"
            )
        if only_process:
            warnings.append(
                f"Some scenario_id values appear only in process_event rows but not in entity rows. Count={len(only_process)}"
            )

    return {
        "valid": len(errors) == 0,
        "errors": errors,
        "warnings": warnings,
        "summary": summary,
        "process_row_counts": process_row_counts,
        "process_case_counts": process_case_counts,
    }


def _build_overall_result(process_results: Dict[str, Dict[str, Any]]) -> Dict[str, Any]:

    if not process_results:
        return {
            "total_case_count": 0,
            "avg_risk_score": 0.0,
            "avg_anomaly_score": 0.0,
            "anomaly_count": 0,
            "anomaly_rate": 0.0,
            "avg_total_process_time_min": 0.0,
        }

    total_case_count = int(sum(int(v["case_count"]) for v in process_results.values()))
    anomaly_count = int(sum(int(v["anomaly_count"]) for v in process_results.values()))

    if total_case_count <= 0:
        return {
            "total_case_count": 0,
            "avg_risk_score": 0.0,
            "avg_anomaly_score": 0.0,
            "anomaly_count": 0,
            "anomaly_rate": 0.0,
            "avg_total_process_time_min": 0.0,
        }

    weighted_risk_sum = sum(
        float(v["avg_risk_score"]) * int(v["case_count"])
        for v in process_results.values()
    )

    weighted_anomaly_score_sum = sum(
        float(v["avg_anomaly_score"]) * int(v["case_count"])
        for v in process_results.values()
    )

    weighted_total_time_sum = sum(
        float(v["avg_total_process_time_min"]) * int(v["case_count"])
        for v in process_results.values()
    )

    avg_risk_score = round(float(weighted_risk_sum / total_case_count), 3)
    avg_anomaly_score = round(float(weighted_anomaly_score_sum / total_case_count), 6)
    anomaly_rate = round(float(anomaly_count / total_case_count), 4)
    avg_total_process_time_min = round(float(weighted_total_time_sum / total_case_count), 3)

    return {
        "total_case_count": total_case_count,
        "avg_risk_score": avg_risk_score,
        "avg_anomaly_score": avg_anomaly_score,
        "anomaly_count": anomaly_count,
        "anomaly_rate": anomaly_rate,
        "avg_total_process_time_min": avg_total_process_time_min,
    }

# ======================================================
# Validation / Unified integrated CSV endpoints
# ======================================================
@app.post("/validate/integrated_csv")
async def validate_integrated_csv(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        raw_df = pd.read_csv(io.BytesIO(contents))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid CSV file: {e}")

    return _validate_integrated_csv_structure(raw_df)


@app.post("/analyze/integrated_csv")
async def analyze_integrated_csv(file: UploadFile = File(...)):

    try:
        contents = await file.read()
        raw_df = pd.read_csv(io.BytesIO(contents))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid CSV file: {e}")

    validation_report = _validate_integrated_csv_structure(raw_df)
    if not validation_report["valid"]:
        raise HTTPException(status_code=400, detail=validation_report)

    entity_score_map = _compute_entity_score_map_from_integrated(raw_df)
    process_df = _extract_integrated_process_df(raw_df)

    full_process_results: Dict[str, Dict[str, Any]] = {}
    compact_process_results: Dict[str, Dict[str, Any]] = {}

    for process_code in sorted(process_df["process_code"].drop_duplicates().tolist()):
        try:
            art = _get_process_artifacts(process_code)
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Process artifacts load failed for {process_code}: {e}",
            )

        one_process_df = process_df[process_df["process_code"] == process_code].copy()

        case_to_scenario = (
            one_process_df[["case_id", "scenario_id"]]
            .dropna()
            .drop_duplicates()
            .assign(
                case_id=lambda d: d["case_id"].astype(str),
                scenario_id=lambda d: d["scenario_id"].astype(str),
            )
            .set_index("case_id")["scenario_id"]
            .to_dict()
        )

        df_for_validate = one_process_df[
            ["process_code", "case_id", "step_code", "start_time", "end_time"]
        ].copy()

        df_valid, vrep = validate_events_df(
            df_for_validate,
            process_code=process_code,
            valid_steps=art.step_codes,
            allow_unknown_steps=False,
        )
        if not vrep.ok:
            raise HTTPException(
                status_code=400,
                detail={
                    "process_code": process_code,
                    "errors": vrep.errors,
                    "warnings": vrep.warnings,
                },
            )

        case_ids = df_valid["case_id"].astype(str).drop_duplicates().tolist()
        results: List[Dict[str, Any]] = []

        for cid in case_ids:
            one_case = df_valid[df_valid["case_id"].astype(str) == cid].copy()
            try:
                out = _analyze_single_case_df(process_code, one_case, art)
                if out is None:
                    continue

                scenario_id = case_to_scenario.get(str(cid))
                entity_risk = entity_score_map.get(str(scenario_id)) if scenario_id is not None else None
                fused_risk = _fuse_process_with_entity(out["risk_score"], entity_risk)

                out["risk_score"] = fused_risk
                out["is_anomaly"] = bool(fused_risk >= 80)

                results.append(out)
            except Exception:
                continue

        if not results:
            continue

        batch_block = _build_batch_output(process_code, results)
        wrapper_key = PROCESS_BATCH_KEY_MAP[process_code]
        full_payload = batch_block[wrapper_key]

        full_process_results[wrapper_key] = full_payload
        compact_process_results[wrapper_key] = _compress_process_result_v2(process_code, full_payload)

    if not full_process_results:
        raise HTTPException(status_code=400, detail="No valid process results were produced from file")

    overall_result = _build_overall_result(full_process_results)

    return {
        "overall_result": overall_result,
        "process_results": compact_process_results,
    }


# ======================================================
# Entity AI endpoints
# ======================================================
class EntityPredictRequest(BaseModel):
    data: Dict[str, Any]


class EntityBatchPredictRequest(BaseModel):
    rows: List[Dict[str, Any]]


@app.post("/entity/driver/predict")
def entity_driver_predict(req: EntityPredictRequest):
    try:
        result_df, meta = predict_driver_risk(req.data, return_metadata=True)
        return _entity_response(result_df, meta)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Driver prediction failed: {e}")


@app.post("/entity/fleet/predict")
def entity_fleet_predict(req: EntityPredictRequest):
    try:
        result_df, meta = predict_fleet_risk(req.data, return_metadata=True)
        return _entity_response(result_df, meta)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Fleet prediction failed: {e}")


@app.post("/entity/ops/predict")
def entity_ops_predict(req: EntityPredictRequest):
    try:
        result_df, meta = predict_ops_risk(req.data, return_metadata=True)
        return _entity_response(result_df, meta)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Ops prediction failed: {e}")


@app.post("/entity/driver/predict_batch")
def entity_driver_predict_batch(req: EntityBatchPredictRequest):
    try:
        result_df, meta = predict_driver_risk(req.rows, return_metadata=True)
        return _entity_response(result_df, meta)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Driver batch prediction failed: {e}")


@app.post("/entity/fleet/predict_batch")
def entity_fleet_predict_batch(req: EntityBatchPredictRequest):
    try:
        result_df, meta = predict_fleet_risk(req.rows, return_metadata=True)
        return _entity_response(result_df, meta)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Fleet batch prediction failed: {e}")


@app.post("/entity/ops/predict_batch")
def entity_ops_predict_batch(req: EntityBatchPredictRequest):
    try:
        result_df, meta = predict_ops_risk(req.rows, return_metadata=True)
        return _entity_response(result_df, meta)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Ops batch prediction failed: {e}")


# ======================================================
# Process AI endpoints (explicit / backward-compatible)
# ======================================================
class EventRow(BaseModel):
    step_code: str
    start_time: str
    end_time: str


class ProcessAnalyzeCaseRequest(BaseModel):
    process_code: str
    case_id: Optional[str] = None
    events: List[EventRow]


def _get_process_artifacts(process_code: str):
    if process_code in _process_artifacts_cache:
        return _process_artifacts_cache[process_code]

    art = load_process_artifacts(
        process_code=process_code,
        model_root_dir=PROCESS_MODEL_ROOT,
        registry_dir=REGISTRY_DIR,
    )
    _process_artifacts_cache[process_code] = art
    return art


def _events_to_df(process_code: str, case_id: str, events: List[EventRow]) -> pd.DataFrame:
    return pd.DataFrame(
        [
            {
                "process_code": process_code,
                "case_id": case_id,
                "step_code": e.step_code,
                "start_time": e.start_time,
                "end_time": e.end_time,
            }
            for e in events
        ]
    )


def _risk_from_quantiles(raw_anomaly: float, quantiles: list) -> int:
    q = np.array(quantiles, dtype=float)
    idx = int(np.searchsorted(q, raw_anomaly, side="right") - 1)
    return int(max(0, min(100, idx)))


def _compute_top_step_p95_and_z(row: pd.Series, art) -> Dict[str, float]:
    best_step_idx, best_dev, best_dur = 0, 0.0, 0.0
    best_mean, best_std, best_p95 = 0.0, 0.0, 0.0

    for i, s in enumerate(art.step_codes, start=1):
        dur = float(row.get(f"{s}_duration_min", 0.0))

        b = art.baselines.get("steps", {}).get(s, {})
        mean = float(b.get("mean", 0.0))
        std = float(b.get("std", 0.0))
        p95 = float(b.get("p95", 0.0))

        dev = (dur / p95) if p95 > 0 else 0.0

        if dev > best_dev:
            best_dev, best_step_idx, best_dur = dev, i, dur
            best_mean, best_std, best_p95 = mean, std, p95

    best_z = ((best_dur - best_mean) / best_std) if best_std > 1e-9 else 0.0

    return {
        "best_step_idx": int(best_step_idx),
        "best_dev": float(best_dev),
        "best_dur": float(best_dur),
        "best_p95": float(best_p95),
        "best_z": float(best_z),
    }


def _extract_step_index(step_name: str) -> int:
    try:
        parts = str(step_name).split("_")
        if len(parts) >= 2:
            return int(parts[1])
    except Exception:
        pass
    return 0


def compute_process_specific(process_code: str, case_df: pd.DataFrame) -> Dict[str, Any]:
    case_df = case_df.copy()
    case_df["start_time"] = pd.to_datetime(case_df["start_time"], errors="coerce")
    case_df["end_time"] = pd.to_datetime(case_df["end_time"], errors="coerce")
    case_df = case_df.dropna(subset=["start_time", "end_time"]).copy()

    if case_df.empty:
        return {}

    case_df["duration_min"] = (
        case_df["end_time"] - case_df["start_time"]
    ).dt.total_seconds() / 60.0

    if process_code == "TRUCKING_DELIVERY_FLOW":
        transit_delay_min = float(
            case_df.loc[
                case_df["step_code"].astype(str).str.contains(
                    "TRANSIT|LINEHAUL|EN_ROUTE", case=False, regex=True
                ),
                "duration_min",
            ].sum()
        )

        hub_touch_count = int(
            case_df["step_code"].astype(str).str.contains("HUB", case=False, regex=False).sum()
        )

        delivery_attempt_count = int(
            case_df["step_code"]
            .astype(str)
            .str.contains("DELIVERY_ATTEMPT", case=False, regex=False)
            .sum()
        )

        return {
            "transit_delay_min": round(transit_delay_min, 3),
            "hub_touch_count": hub_touch_count,
            "delivery_attempt_count": delivery_attempt_count,
        }

    if process_code == "WAREHOUSE_FULFILLMENT":
        pick_pack_time_min = float(
            case_df.loc[
                case_df["step_code"].astype(str).str.contains("PICK|PACK", case=False, regex=True),
                "duration_min",
            ].sum()
        )

        qc_rework_flag = int(
            case_df["step_code"]
            .astype(str)
            .str.contains("REWORK|RECHECK", case=False, regex=True)
            .any()
        )

        staging_wait_min = float(
            case_df.loc[
                case_df["step_code"].astype(str).str.contains(
                    "STAGING|DOCK_ASSIGN", case=False, regex=True
                ),
                "duration_min",
            ].sum()
        )

        return {
            "pick_pack_time_min": round(pick_pack_time_min, 3),
            "qc_rework_flag": qc_rework_flag,
            "staging_wait_min": round(staging_wait_min, 3),
        }

    if process_code == "IMPORT_CUSTOMS_CLEARANCE":
        inspection_delay_min = float(
            case_df.loc[
                case_df["step_code"].astype(str).str.contains(
                    "INSPECTION", case=False, regex=False
                ),
                "duration_min",
            ].sum()
        )

        document_recheck_flag = int(
            case_df["step_code"]
            .astype(str)
            .str.contains(
                "ADDITIONAL_DOCS|AMENDMENT|RECHECK|DOC_VALIDATION",
                case=False,
                regex=True,
            )
            .any()
        )

        submit_rows = case_df[
            case_df["step_code"].astype(str).str.contains(
                "SUBMIT_DECLARATION", case=False, regex=False
            )
        ]
        release_rows = case_df[
            case_df["step_code"].astype(str).str.contains(
                "RELEASED|FINAL_CLEARANCE", case=False, regex=True
            )
        ]

        clearance_cycle_time_min = 0.0
        if not submit_rows.empty and not release_rows.empty:
            start_submit = submit_rows["start_time"].min()
            end_release = release_rows["end_time"].max()
            clearance_cycle_time_min = (end_release - start_submit).total_seconds() / 60.0

        return {
            "inspection_delay_min": round(inspection_delay_min, 3),
            "document_recheck_flag": document_recheck_flag,
            "clearance_cycle_time_min": round(clearance_cycle_time_min, 3),
        }

    return {}


def _build_final_output(
    process_code: str,
    raw_anomaly: float,
    risk_score: int,
    row: pd.Series,
    art,
    case_df: pd.DataFrame,
) -> Dict[str, Any]:
    is_anomaly = bool(risk_score >= 80)

    top = _compute_top_step_p95_and_z(row, art)
    best_step_idx = top["best_step_idx"]
    top_step_name = art.step_codes[best_step_idx - 1] if best_step_idx > 0 else ""

    total_process_time_min = float(row.get("total_process_time_min", 0.0))
    process_specific = compute_process_specific(process_code, case_df)

    return {
        "process_id": PROCESS_ID_MAP[process_code],
        "risk_score": int(risk_score),
        "anomaly_score": round(float(raw_anomaly), 6),
        "is_anomaly": bool(is_anomaly),
        "top_step_name": top_step_name,
        "top_step_deviation_p95": round(float(top["best_dev"]), 3),
        "top_step_p95_min": round(float(top["best_p95"]), 3),
        "top_step_zscore": round(float(top["best_z"]), 3),
        "top_step_duration_min": round(float(top["best_dur"]), 3),
        "total_process_time_min": round(float(total_process_time_min), 3),
        "process_specific": process_specific,
    }


def _analyze_single_case_df(
    process_code: str,
    case_df: pd.DataFrame,
    art,
) -> Optional[Dict[str, Any]]:
    feat_df, _, _ = build_case_feature_matrix(
        case_df,
        step_codes=art.step_codes,
        cases_context_df=None,
        include_context_numeric=False,
    )

    if feat_df.empty:
        return None

    row = feat_df.iloc[0]
    X = row.values.reshape(1, -1).astype(float)
    Xs = art.scaler.transform(X)

    raw_anomaly = float(-art.model.score_samples(Xs)[0])
    risk_score = _risk_from_quantiles(raw_anomaly, art.score_quantiles)

    result = _build_final_output(process_code, raw_anomaly, risk_score, row, art, case_df)
    result["case_id"] = str(case_df["case_id"].astype(str).iloc[0])
    return result


def _build_batch_output(process_code: str, results: List[Dict[str, Any]]) -> Dict[str, Any]:
    if not results:
        raise ValueError("results is empty")

    case_count = len(results)
    anomaly_count = int(sum(1 for r in results if r["is_anomaly"]))
    avg_risk_score = round(float(np.mean([r["risk_score"] for r in results])), 3)
    avg_anomaly_score = round(float(np.mean([r["anomaly_score"] for r in results])), 6)
    avg_total_process_time_min = round(
        float(np.mean([r["total_process_time_min"] for r in results])),
        3,
    )

    step_counter: Dict[str, int] = {}
    step_duration_map: Dict[str, List[float]] = {}

    for r in results:
        step_name = r["top_step_name"]
        step_counter[step_name] = step_counter.get(step_name, 0) + 1
        step_duration_map.setdefault(step_name, []).append(float(r["top_step_duration_min"]))

    dominant_step_name = max(step_counter, key=step_counter.get)
    dominant_step_index = _extract_step_index(dominant_step_name)
    dominant_step_case_count = int(step_counter[dominant_step_name])
    dominant_step_case_rate = round(dominant_step_case_count / max(1, case_count), 4)
    avg_dominant_step_duration_min = round(
        float(np.mean(step_duration_map[dominant_step_name])),
        3,
    )

    if process_code == "TRUCKING_DELIVERY_FLOW":
        process_specific = {
            "avg_transit_delay_min": round(
                float(np.mean([r["process_specific"].get("transit_delay_min", 0.0) for r in results])),
                3,
            ),
            "avg_hub_touch_count": round(
                float(np.mean([r["process_specific"].get("hub_touch_count", 0.0) for r in results])),
                3,
            ),
            "avg_delivery_attempt_count": round(
                float(
                    np.mean([r["process_specific"].get("delivery_attempt_count", 0.0) for r in results])
                ),
                3,
            ),
        }

    elif process_code == "WAREHOUSE_FULFILLMENT":
        process_specific = {
            "avg_pick_pack_time_min": round(
                float(np.mean([r["process_specific"].get("pick_pack_time_min", 0.0) for r in results])),
                3,
            ),
            "qc_rework_rate": round(
                float(np.mean([r["process_specific"].get("qc_rework_flag", 0.0) for r in results])),
                4,
            ),
            "avg_staging_wait_min": round(
                float(np.mean([r["process_specific"].get("staging_wait_min", 0.0) for r in results])),
                3,
            ),
        }

    elif process_code == "IMPORT_CUSTOMS_CLEARANCE":
        process_specific = {
            "avg_inspection_delay_min": round(
                float(np.mean([r["process_specific"].get("inspection_delay_min", 0.0) for r in results])),
                3,
            ),
            "document_recheck_rate": round(
                float(np.mean([r["process_specific"].get("document_recheck_flag", 0.0) for r in results])),
                4,
            ),
            "avg_clearance_cycle_time_min": round(
                float(
                    np.mean([r["process_specific"].get("clearance_cycle_time_min", 0.0) for r in results])
                ),
                3,
            ),
        }

    else:
        process_specific = {}

    payload = {
        "process_id": PROCESS_ID_MAP[process_code],
        "case_count": int(case_count),
        "avg_risk_score": avg_risk_score,
        "avg_anomaly_score": avg_anomaly_score,
        "anomaly_count": anomaly_count,
        "anomaly_rate": round(anomaly_count / max(1, case_count), 4),
        "dominant_step_index": int(dominant_step_index),
        "dominant_step_case_count": dominant_step_case_count,
        "dominant_step_case_rate": dominant_step_case_rate,
        "avg_dominant_step_duration_min": avg_dominant_step_duration_min,
        "avg_total_process_time_min": avg_total_process_time_min,
        "process_specific": process_specific,
    }

    wrapper_key = PROCESS_BATCH_KEY_MAP[process_code]
    return {wrapper_key: payload}


@app.post("/process/analyze_case_numeric")
def process_analyze_case_numeric(req: ProcessAnalyzeCaseRequest):
    process_code = _normalize_process_code(req.process_code)

    try:
        art = _get_process_artifacts(process_code)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Process artifacts load failed: {e}")

    case_id = req.case_id or "CASE_UNKNOWN"
    df_case = _events_to_df(process_code, case_id, req.events)

    df_valid, vrep = validate_events_df(
        df_case,
        process_code=process_code,
        valid_steps=art.step_codes,
        allow_unknown_steps=False,
    )
    if not vrep.ok:
        raise HTTPException(
            status_code=400,
            detail={"errors": vrep.errors, "warnings": vrep.warnings},
        )

    out = _analyze_single_case_df(process_code, df_valid, art)
    if out is None:
        raise HTTPException(status_code=400, detail="No valid features produced for case")

    return out


@app.post("/process/analyze_case_file_numeric")
async def process_analyze_case_file_numeric(
    process_code: str,
    file: UploadFile = File(...),
    case_id: Optional[str] = None,
):
    process_code = _normalize_process_code(process_code)

    try:
        art = _get_process_artifacts(process_code)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Process artifacts load failed: {e}")

    try:
        contents = await file.read()
        raw_df = pd.read_csv(io.BytesIO(contents))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid CSV file: {e}")

    entity_score_map = _compute_entity_score_map_from_integrated(raw_df)
    extracted_df = _extract_process_rows_from_any_csv(raw_df, process_code)

    case_to_scenario: Dict[str, str] = {}
    if "scenario_id" in extracted_df.columns:
        case_to_scenario = (
            extracted_df[["case_id", "scenario_id"]]
            .dropna()
            .drop_duplicates()
            .assign(
                case_id=lambda d: d["case_id"].astype(str),
                scenario_id=lambda d: d["scenario_id"].astype(str),
            )
            .set_index("case_id")["scenario_id"]
            .to_dict()
        )

    df = extracted_df[["process_code", "case_id", "step_code", "start_time", "end_time"]].copy()

    df_valid, vrep = validate_events_df(
        df,
        process_code=process_code,
        valid_steps=art.step_codes,
        allow_unknown_steps=False,
    )
    if not vrep.ok:
        raise HTTPException(
            status_code=400,
            detail={"errors": vrep.errors, "warnings": vrep.warnings},
        )

    unique_cases = df_valid["case_id"].astype(str).unique().tolist()

    if case_id is None:
        if len(unique_cases) != 1:
            raise HTTPException(
                status_code=400,
                detail=f"CSV must contain exactly 1 case_id, found {len(unique_cases)}. Provide case_id to select.",
            )
        case_id = unique_cases[0]
    else:
        case_id = str(case_id)
        if case_id not in unique_cases:
            raise HTTPException(status_code=400, detail=f"case_id not found in file: {case_id}")

    one = df_valid[df_valid["case_id"].astype(str) == case_id].copy()

    out = _analyze_single_case_df(process_code, one, art)
    if out is None:
        raise HTTPException(status_code=400, detail="No valid features produced for case")

    scenario_id = case_to_scenario.get(str(case_id))
    entity_risk = entity_score_map.get(str(scenario_id)) if scenario_id is not None else None
    fused_risk = _fuse_process_with_entity(out["risk_score"], entity_risk)

    out["risk_score"] = fused_risk
    out["is_anomaly"] = bool(fused_risk >= 80)

    return out


@app.post("/process/analyze_batch_file_numeric")
async def process_analyze_batch_file_numeric(
    process_code: str,
    file: UploadFile = File(...),
    max_cases: Optional[int] = None,
):
    """
    Explicit per-process batch analysis.
    Kept for backward compatibility / debugging.
    """
    process_code = _normalize_process_code(process_code)

    try:
        art = _get_process_artifacts(process_code)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Process artifacts load failed: {e}")

    try:
        contents = await file.read()
        raw_df = pd.read_csv(io.BytesIO(contents))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid CSV file: {e}")

    entity_score_map = _compute_entity_score_map_from_integrated(raw_df)
    extracted_df = _extract_process_rows_from_any_csv(raw_df, process_code)

    case_to_scenario: Dict[str, str] = {}
    if "scenario_id" in extracted_df.columns:
        case_to_scenario = (
            extracted_df[["case_id", "scenario_id"]]
            .dropna()
            .drop_duplicates()
            .assign(
                case_id=lambda d: d["case_id"].astype(str),
                scenario_id=lambda d: d["scenario_id"].astype(str),
            )
            .set_index("case_id")["scenario_id"]
            .to_dict()
        )

    df = extracted_df[["process_code", "case_id", "step_code", "start_time", "end_time"]].copy()

    df_valid, vrep = validate_events_df(
        df,
        process_code=process_code,
        valid_steps=art.step_codes,
        allow_unknown_steps=False,
    )
    if not vrep.ok:
        raise HTTPException(
            status_code=400,
            detail={"errors": vrep.errors, "warnings": vrep.warnings},
        )

    df_valid = df_valid[df_valid["process_code"].astype(str) == process_code].copy()
    if df_valid.empty:
        raise HTTPException(
            status_code=400,
            detail=f"No rows found for process_code={process_code}",
        )

    case_ids = df_valid["case_id"].astype(str).drop_duplicates().tolist()
    if max_cases is not None:
        case_ids = case_ids[:max_cases]

    results: List[Dict[str, Any]] = []

    for cid in case_ids:
        one = df_valid[df_valid["case_id"].astype(str) == cid].copy()
        try:
            out = _analyze_single_case_df(process_code, one, art)
            if out is not None:
                scenario_id = case_to_scenario.get(str(cid))
                entity_risk = entity_score_map.get(str(scenario_id)) if scenario_id is not None else None
                fused_risk = _fuse_process_with_entity(out["risk_score"], entity_risk)

                out["risk_score"] = fused_risk
                out["is_anomaly"] = bool(fused_risk >= 80)

                results.append(out)
        except Exception:
            continue

    if not results:
        raise HTTPException(status_code=400, detail="No valid cases analyzed from file")

    return _build_batch_output(process_code, results)