from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Dict, List, Optional

import joblib
import numpy as np
import pandas as pd

from api.process_ai.process.core.registry_loader import load_registry, get_step_codes
from api.process_ai.process.core.validate import validate_events_df
from api.process_ai.process.core.features import build_case_feature_matrix


@dataclass
class ProcessArtifacts:
    process_code: str
    step_codes: List[str]
    model: Any
    scaler: Any
    schema: Dict[str, Any]
    baselines: Dict[str, Any]
    score_quantiles: List[float]


def load_process_artifacts(
    process_code: str,
    model_root_dir: str | Path,
    registry_dir: str | Path,
) -> ProcessArtifacts:
    model_root_dir = Path(model_root_dir)
    registry_dir = Path(registry_dir)

    reg = load_registry(registry_dir, process_code)
    step_codes = get_step_codes(reg)

    proc_dir = model_root_dir / process_code
    if not proc_dir.exists():
        raise FileNotFoundError(f"Process model directory not found: {proc_dir}")

    model = joblib.load(proc_dir / "model.pkl")
    scaler = joblib.load(proc_dir / "scaler.pkl")
    schema = json.loads((proc_dir / "feature_schema.json").read_text(encoding="utf-8"))
    baselines = json.loads((proc_dir / "baselines.json").read_text(encoding="utf-8"))
    score_q = json.loads((proc_dir / "score_quantiles.json").read_text(encoding="utf-8"))["raw_anomaly_quantiles"]

    return ProcessArtifacts(
        process_code=process_code,
        step_codes=step_codes,
        model=model,
        scaler=scaler,
        schema=schema,
        baselines=baselines,
        score_quantiles=score_q,
    )


def _risk_from_quantiles(raw_anomaly: float, quantiles: List[float]) -> float:
    """
    Maps raw anomaly score to 0..100 risk based on training quantiles.
    """
    # quantiles length = 101
    idx = int(np.searchsorted(quantiles, raw_anomaly, side="right") - 1)
    idx = max(0, min(100, idx))
    return float(idx)


def _step_explain(
    feature_row: pd.Series,
    step_codes: List[str],
    baselines: Dict[str, Any],
) -> List[Dict[str, Any]]:
    out: List[Dict[str, Any]] = []
    for s in step_codes:
        col = f"{s}_duration_min"
        dur = float(feature_row.get(col, 0.0))
        b = baselines["steps"].get(s, {})
        p95 = float(b.get("p95", 0.0))
        mean = float(b.get("mean", 0.0))
        std = float(b.get("std", 0.0))

        deviation = 0.0
        if p95 > 0:
            deviation = dur / p95

        z = 0.0
        if std > 1e-9:
            z = (dur - mean) / std

        # severity by deviation vs p95
        if deviation >= 1.50:
            sev = "CRITICAL"
        elif deviation >= 1.15:
            sev = "BOTTLENECK"
        elif deviation >= 1.00:
            sev = "WATCHLIST"
        else:
            sev = "NORMAL"

        out.append(
            {
                "step_code": s,
                "duration_min": round(dur, 3),
                "p95": round(p95, 3),
                "deviation_factor": round(deviation, 3),
                "z_score": round(z, 3),
                "severity": sev,
            }
        )

    # Rank: deviation_factor desc, then duration
    out.sort(key=lambda x: (x["deviation_factor"], x["duration_min"]), reverse=True)
    return out


def analyze_case(
    case_events_df: pd.DataFrame,
    artifacts: ProcessArtifacts,
    allow_unknown_steps: bool = False,
) -> Dict[str, Any]:
    """
    Analyze single case's events (must be only one case_id ideally).
    Returns risk + step explanations.
    """
    df = case_events_df.copy()

    # Ensure required columns exist; process_code must match
    df, report = validate_events_df(
        df,
        process_code=artifacts.process_code,
        valid_steps=artifacts.step_codes,
        allow_unknown_steps=allow_unknown_steps,
    )
    if not report.ok:
        return {"ok": False, "errors": report.errors, "warnings": report.warnings}

    # Build features for this case
    feat_df, schema, feat_report = build_case_feature_matrix(
        df,
        step_codes=artifacts.step_codes,
        cases_context_df=None,
        include_context_numeric=False,
    )
    if feat_df.empty:
        return {"ok": False, "errors": ["No valid case features produced"], "warnings": report.warnings}

    # If multiple cases accidentally provided, analyze first
    case_id = str(feat_df.index[0])
    row = feat_df.loc[case_id]

    X = row.values.reshape(1, -1).astype(float)
    Xs = artifacts.scaler.transform(X)

    raw_anomaly = float(-artifacts.model.score_samples(Xs)[0])
    risk = _risk_from_quantiles(raw_anomaly, artifacts.score_quantiles)

    steps_ranked = _step_explain(row, artifacts.step_codes, artifacts.baselines)

    # Overall severity: based on top step severity + risk
    top = steps_ranked[0] if steps_ranked else None
    if top and top["severity"] in ("CRITICAL", "BOTTLENECK"):
        overall = top["severity"]
    else:
        overall = "WATCHLIST" if risk >= 80 else ("ELEVATED" if risk >= 60 else "NORMAL")

    return {
        "ok": True,
        "process_code": artifacts.process_code,
        "case_id": case_id,
        "risk_score": round(risk, 1),
        "raw_anomaly": round(raw_anomaly, 6),
        "overall_severity": overall,
        "top_steps": steps_ranked[:5],
        "validation_warnings": report.warnings,
    }


def analyze_batch(
    events_df: pd.DataFrame,
    artifacts: ProcessArtifacts,
    allow_unknown_steps: bool = False,
    max_cases: Optional[int] = None,
) -> Dict[str, Any]:
    """
    Batch analysis. Returns list results and simple summary.
    """
    df = events_df.copy()
    df = df[df["process_code"] == artifacts.process_code].copy()

    results: List[Dict[str, Any]] = []
    grouped = df.groupby("case_id", sort=False)

    for i, (case_id, g) in enumerate(grouped):
        if max_cases is not None and i >= max_cases:
            break
        res = analyze_case(g, artifacts, allow_unknown_steps=allow_unknown_steps)
        results.append(res)

    # Summary
    ok_results = [r for r in results if r.get("ok")]
    risks = [r["risk_score"] for r in ok_results]
    summary = {
        "process_code": artifacts.process_code,
        "cases_analyzed": len(results),
        "cases_ok": len(ok_results),
        "avg_risk": float(np.mean(risks)) if risks else 0.0,
        "p95_risk": float(np.quantile(risks, 0.95)) if len(risks) >= 5 else (float(np.max(risks)) if risks else 0.0),
    }
    return {"summary": summary, "results": results}
