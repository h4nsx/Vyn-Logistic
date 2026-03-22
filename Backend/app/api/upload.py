import logging
import time
import uuid
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, File, HTTPException, Query, UploadFile

from app.config import (
    PROCESS_ALIASES,
    PROCESS_BATCH_KEYS,
    RISK_THRESHOLDS,
    SUPPORTED_PROCESSES,
)
from app.database import get_db
from app.services.ai_client import analyze_batch_file, extract_risk_score

router = APIRouter()
logger = logging.getLogger(__name__)

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


@router.post("/upload", summary="Upload CSV and trigger AI analysis")
async def upload_csv(
    file: UploadFile = File(..., description="CSV file with logistics execution data"),
    process_code: str = Query(
        ...,
        description="Process type: TRUCKING_DELIVERY_FLOW | WAREHOUSE_FULFILLMENT | IMPORT_CUSTOMS_CLEARANCE",
    ),
    max_cases: Optional[int] = Query(None, description="Limit number of cases to analyze"),
):
    # ── Validate file type ────────────────────────────────────────────────────
    if not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are accepted")

    # ── Normalize process_code ─────────────────────────────────────────────────
    normalized_code = PROCESS_ALIASES.get(process_code.upper(), process_code.upper())
    if normalized_code not in SUPPORTED_PROCESSES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid process_code '{process_code}'. Supported values: {SUPPORTED_PROCESSES} or aliases {list(PROCESS_ALIASES.keys())}",
        )

    # ── Read file ─────────────────────────────────────────────────────────────
    file_bytes = await file.read()
    if len(file_bytes) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail=f"File too large. Maximum size is {MAX_FILE_SIZE // (1024 * 1024)} MB",
        )
    if len(file_bytes) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty")

    upload_id = str(uuid.uuid4())
    db = get_db()
    start_ts = time.perf_counter()

    # ── Call AI model ──────────────────────────────────────────────────────────
    try:
        ai_response = await analyze_batch_file(
            file_bytes=file_bytes,
            filename=file.filename,
            process_code=normalized_code,
            max_cases=max_cases,
        )
    except Exception as exc:
        logger.error(f"AI model request failed for upload {upload_id}: {exc}")
        await db.uploads.insert_one(
            {
                "upload_id": upload_id,
                "filename": file.filename,
                "process_code": normalized_code,
                "status": "error",
                "cases_analyzed": 0,
                "uploaded_at": datetime.now(timezone.utc),
                "processing_time_seconds": round(time.perf_counter() - start_ts, 2),
                "error": str(exc),
            }
        )
        raise HTTPException(status_code=502, detail=f"AI model error: {exc}")

    # ── Extract case results ──────────────────────────────────────────────────
    batch_key = PROCESS_BATCH_KEYS[normalized_code]
    raw_cases: list = ai_response.get(batch_key, [])

    processing_time = round(time.perf_counter() - start_ts, 2)
    anomaly_count = 0

    # ── Persist case results ──────────────────────────────────────────────────
    if raw_cases:
        docs = []
        for case in raw_cases:
            case_id = (
                case.get("case_id")
                or case.get("id")
                or case.get("process_id")
                or str(uuid.uuid4())
            )
            risk = extract_risk_score(case)
            is_anomaly = risk is not None and risk >= RISK_THRESHOLDS["normal"]
            if is_anomaly:
                anomaly_count += 1

            docs.append(
                {
                    "upload_id": upload_id,
                    "process_code": normalized_code,
                    "case_id": str(case_id),
                    "result": case,
                    "risk_score": risk,
                    "is_anomaly": is_anomaly,
                    "analyzed_at": datetime.now(timezone.utc),
                }
            )

        await db.case_results.insert_many(docs)

    # ── Persist upload record ─────────────────────────────────────────────────
    await db.uploads.insert_one(
        {
            "upload_id": upload_id,
            "filename": file.filename,
            "process_code": normalized_code,
            "status": "success",
            "cases_analyzed": len(raw_cases),
            "uploaded_at": datetime.now(timezone.utc),
            "processing_time_seconds": processing_time,
            "error": None,
        }
    )

    logger.info(
        f"Upload {upload_id} complete | process={normalized_code} "
        f"cases={len(raw_cases)} anomalies={anomaly_count} time={processing_time}s"
    )

    return {
        "status": "success",
        "upload_id": upload_id,
        "process_code": normalized_code,
        "cases_analyzed": len(raw_cases),
        "anomalies_detected": anomaly_count,
        "processing_time_seconds": processing_time,
    }
