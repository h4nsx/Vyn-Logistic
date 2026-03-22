import logging
import uuid
from datetime import datetime, timezone

import httpx
from fastapi import APIRouter, File, HTTPException, UploadFile

from app.config import settings
from app.database import get_db

router = APIRouter()
logger = logging.getLogger(__name__)

MODEL_BASE_URL = settings.AI_MODEL_URL.rstrip("/")
INTEGRATED_TIMEOUT = 300.0
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50 MB
ALLOWED_EXTENSIONS = (".csv", ".xlsx", ".xls")


def _check_file(filename: str, file_bytes: bytes) -> None:
    if not filename.lower().endswith(ALLOWED_EXTENSIONS):
        raise HTTPException(
            status_code=400,
            detail="Only CSV, XLSX, and XLS files are accepted",
        )
    if not file_bytes:
        raise HTTPException(status_code=400, detail="File is empty")
    if len(file_bytes) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail=f"File too large. Maximum size is {MAX_FILE_SIZE // (1024 * 1024)} MB",
        )


async def _call_model(endpoint: str, filename: str, file_bytes: bytes, content_type: str) -> dict:
    try:
        async with httpx.AsyncClient(timeout=INTEGRATED_TIMEOUT) as client:
            response = await client.post(
                f"{MODEL_BASE_URL}{endpoint}",
                files={"file": (filename, file_bytes, content_type)},
            )
    except httpx.RequestError as exc:
        logger.error("Cannot connect to model API [%s]: %s", endpoint, exc)
        raise HTTPException(status_code=502, detail=f"Cannot connect to model API: {exc}")

    if response.status_code >= 400:
        try:
            detail = response.json()
        except Exception:
            detail = response.text
        logger.error("Model API returned error [%s]: %s", endpoint, detail)
        raise HTTPException(status_code=response.status_code, detail=detail)

    try:
        return response.json()
    except Exception:
        logger.error("Model API returned non-JSON response [%s]", endpoint)
        raise HTTPException(status_code=502, detail="Model API returned non-JSON response")


@router.post("/validate/integrated_csv", summary="Validate integrated CSV by forwarding file to the model API")
async def validate_integrated_csv(file: UploadFile = File(...)):
    filename = file.filename or "integrated_input"
    file_bytes = await file.read()
    _check_file(filename, file_bytes)

    return await _call_model(
        "/validate/integrated_csv",
        filename,
        file_bytes,
        file.content_type or "application/octet-stream",
    )


@router.post("/analyze/integrated_csv", summary="Analyze integrated CSV by forwarding file to the model API")
async def analyze_integrated_csv(file: UploadFile = File(...)):
    filename = file.filename or "integrated_input"
    file_bytes = await file.read()
    _check_file(filename, file_bytes)

    content_type = file.content_type or "application/octet-stream"

    # Step 1: Validate first
    validation = await _call_model("/validate/integrated_csv", filename, file_bytes, content_type)

    if not validation.get("valid", False):
        raise HTTPException(
            status_code=400,
            detail={
                "message": "CSV validation failed. Please fix the errors before analyzing.",
                "errors": validation.get("errors", []),
                "warnings": validation.get("warnings", []),
            },
        )

    # Step 2: Analyze
    result = await _call_model("/analyze/integrated_csv", filename, file_bytes, content_type)

    # Step 3: Save to MongoDB
    analysis_id = str(uuid.uuid4())
    db = get_db()
    await db.integrated_analyses.insert_one(
        {
            "analysis_id": analysis_id,
            "filename": filename,
            "validation_summary": validation.get("summary"),
            "overall_result": result.get("overall_result"),
            "process_results": result.get("process_results"),
            "raw_result": result,
            "analyzed_at": datetime.now(timezone.utc),
        }
    )

    logger.info(
        "Integrated analysis %s saved | file=%s cases=%s anomalies=%s",
        analysis_id,
        filename,
        result.get("overall_result", {}).get("total_case_count", "?"),
        result.get("overall_result", {}).get("anomaly_count", "?"),
    )

    return {
        "status": "success",
        "analysis_id": analysis_id,
        "filename": filename,
        "validation_summary": validation.get("summary"),
        "overall_result": result.get("overall_result"),
        "process_results": result.get("process_results"),
    }
