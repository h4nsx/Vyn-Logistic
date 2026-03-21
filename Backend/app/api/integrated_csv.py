import logging
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, File, HTTPException, UploadFile

from app.database import get_db
from app.services.ai_client import analyze_integrated_csv, validate_integrated_csv

router = APIRouter()
logger = logging.getLogger(__name__)

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


def _check_file(file: UploadFile, file_bytes: bytes) -> None:
    if not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are accepted")
    if len(file_bytes) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty")
    if len(file_bytes) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail=f"File too large. Maximum size is {MAX_FILE_SIZE // (1024 * 1024)} MB",
        )


@router.post("/validate/integrated_csv", summary="Validate integrated CSV by forwarding file to the model API")
async def validate_integrated_csv_endpoint(
    file: UploadFile = File(...),
):
    file_bytes = await file.read()
    _check_file(file, file_bytes)

    try:
        result = await validate_integrated_csv(
            file_bytes=file_bytes,
            filename=file.filename,
        )
    except Exception as exc:
        logger.error(f"AI model error on /validate/integrated_csv: {exc}")
        raise HTTPException(status_code=502, detail=f"AI model error: {exc}")

    return result


@router.post("/analyze/integrated_csv", summary="Analyze integrated CSV by forwarding file to the model API")
async def analyze_integrated_csv_endpoint(
    file: UploadFile = File(...),
):
    file_bytes = await file.read()
    _check_file(file, file_bytes)

    # Step 1: Validate first
    try:
        validation = await validate_integrated_csv(
            file_bytes=file_bytes,
            filename=file.filename,
        )
    except Exception as exc:
        logger.error(f"AI model validation error on /analyze/integrated_csv: {exc}")
        raise HTTPException(status_code=502, detail=f"AI model error during validation: {exc}")

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
    try:
        result = await analyze_integrated_csv(
            file_bytes=file_bytes,
            filename=file.filename,
        )
    except Exception as exc:
        logger.error(f"AI model error on /analyze/integrated_csv: {exc}")
        raise HTTPException(status_code=502, detail=f"AI model error during analysis: {exc}")

    # Step 3: Save to MongoDB
    analysis_id = str(uuid.uuid4())
    db = get_db()
    await db.integrated_analyses.insert_one(
        {
            "analysis_id": analysis_id,
            "filename": file.filename,
            "validation_summary": validation.get("summary"),
            "overall_result": result.get("overall_result"),
            "process_results": result.get("process_results"),
            "raw_result": result,
            "analyzed_at": datetime.now(timezone.utc),
        }
    )

    logger.info(
        f"Integrated analysis {analysis_id} saved | file={file.filename} "
        f"cases={result.get('overall_result', {}).get('total_case_count', '?')} "
        f"anomalies={result.get('overall_result', {}).get('anomaly_count', '?')}"
    )

    return {
        "status": "success",
        "analysis_id": analysis_id,
        "filename": file.filename,
        "validation_summary": validation.get("summary"),
        "overall_result": result.get("overall_result"),
        "process_results": result.get("process_results"),
    }
