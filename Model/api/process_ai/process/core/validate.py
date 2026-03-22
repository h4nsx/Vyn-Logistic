from __future__ import annotations

from dataclasses import dataclass
from typing import List, Optional, Tuple

import pandas as pd


REQUIRED_EVENT_COLUMNS = ["process_code", "case_id", "step_code", "start_time", "end_time"]


@dataclass
class ValidationReport:
    ok: bool
    errors: List[str]
    warnings: List[str]
    rows: int
    invalid_time_rows: int
    unknown_step_rows: int
    negative_duration_rows: int


def validate_events_df(
    df: pd.DataFrame,
    process_code: str,
    valid_steps: List[str],
    allow_unknown_steps: bool = False,
) -> Tuple[pd.DataFrame, ValidationReport]:
    """
    - Ensures required columns exist
    - Filters to process_code
    - Parses timestamps
    - Checks unknown steps and negative durations
    Returns: (clean_df, report)
    """
    errors: List[str] = []
    warnings: List[str] = []

    for c in REQUIRED_EVENT_COLUMNS:
        if c not in df.columns:
            errors.append(f"Missing required column: {c}")

    if errors:
        return df, ValidationReport(
            ok=False,
            errors=errors,
            warnings=warnings,
            rows=len(df),
            invalid_time_rows=0,
            unknown_step_rows=0,
            negative_duration_rows=0,
        )

    # Filter process
    df = df.copy()
    df = df[df["process_code"] == process_code].copy()
    if df.empty:
        errors.append(f"No rows found for process_code={process_code}")
        return df, ValidationReport(
            ok=False,
            errors=errors,
            warnings=warnings,
            rows=0,
            invalid_time_rows=0,
            unknown_step_rows=0,
            negative_duration_rows=0,
        )

    # Parse timestamps
    df["start_time"] = pd.to_datetime(df["start_time"], errors="coerce", utc=False)
    df["end_time"] = pd.to_datetime(df["end_time"], errors="coerce", utc=False)

    invalid_time_mask = df["start_time"].isna() | df["end_time"].isna()
    invalid_time_rows = int(invalid_time_mask.sum())
    if invalid_time_rows > 0:
        warnings.append(f"{invalid_time_rows} rows have invalid timestamps and will be dropped.")
        df = df[~invalid_time_mask].copy()

    # Unknown steps
    valid_set = set(valid_steps)
    unknown_mask = ~df["step_code"].isin(valid_set)
    unknown_step_rows = int(unknown_mask.sum())
    if unknown_step_rows > 0:
        msg = f"{unknown_step_rows} rows have step_code not in registry."
        if allow_unknown_steps:
            warnings.append(msg + " (dropped)")
            df = df[~unknown_mask].copy()
        else:
            errors.append(msg + " (set allow_unknown_steps=True to drop them)")

    # Duration checks
    df["duration_sec"] = (df["end_time"] - df["start_time"]).dt.total_seconds()
    negative_mask = df["duration_sec"] < 0
    negative_duration_rows = int(negative_mask.sum())
    if negative_duration_rows > 0:
        warnings.append(f"{negative_duration_rows} rows have negative duration and will be dropped.")
        df = df[~negative_mask].copy()

    ok = len(errors) == 0
    return df, ValidationReport(
        ok=ok,
        errors=errors,
        warnings=warnings,
        rows=len(df),
        invalid_time_rows=invalid_time_rows,
        unknown_step_rows=unknown_step_rows,
        negative_duration_rows=negative_duration_rows,
    )
