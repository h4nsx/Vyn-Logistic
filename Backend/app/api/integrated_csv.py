import logging

from fastapi import APIRouter, File, HTTPException, UploadFile

from app.services.ai_client import analyze_integrated_csv, validate_integrated_csv

router = APIRouter()
logger = logging.getLogger(__name__)

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


@router.post("/validate/integrated_csv", summary="Validate integrated CSV by forwarding file to the model API")
async def validate_integrated_csv_endpoint(
    file: UploadFile = File(...),
):
    if not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are accepted")

    file_bytes = await file.read()
    if len(file_bytes) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty")
    if len(file_bytes) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail=f"File too large. Maximum size is {MAX_FILE_SIZE // (1024 * 1024)} MB",
        )

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
    if not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are accepted")

    file_bytes = await file.read()
    if len(file_bytes) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty")
    if len(file_bytes) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail=f"File too large. Maximum size is {MAX_FILE_SIZE // (1024 * 1024)} MB",
        )

    try:
        result = await analyze_integrated_csv(
            file_bytes=file_bytes,
            filename=file.filename,
        )
    except Exception as exc:
        logger.error(f"AI model error on /analyze/integrated_csv: {exc}")
        raise HTTPException(status_code=502, detail=f"AI model error: {exc}")

    return result
