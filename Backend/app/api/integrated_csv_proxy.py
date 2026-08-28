import logging
import uuid
from datetime import datetime, timezone

import httpx
from fastapi import APIRouter, File, HTTPException, UploadFile, Query

from app.config import settings
from app.database import get_db

router = APIRouter()
logger = logging.getLogger(__name__)

MODEL_BASE_URL = settings.AI_MODEL_URL.rstrip("/")
INTEGRATED_TIMEOUT = 300.0
MAX_FILE_SIZE = 20 * 1024 * 1024  # 20 MB


async def _forward_integrated_csv(endpoint: str, file: UploadFile):
    filename = file.filename or "integrated.csv"

    if not filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are accepted")

    file_bytes = await file.read()
    if not file_bytes:
        raise HTTPException(status_code=400, detail="File is empty")
    if len(file_bytes) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail=f"File too large. Maximum size is {MAX_FILE_SIZE // (1024 * 1024)} MB",
        )

    try:
        async with httpx.AsyncClient(timeout=INTEGRATED_TIMEOUT) as client:
            response = await client.post(
                f"{MODEL_BASE_URL}{endpoint}",
                files={"file": (filename, file_bytes, file.content_type or "text/csv")},
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
    except Exception as exc:
        logger.error("Model API returned non-JSON response [%s]: %s", endpoint, exc)
        raise HTTPException(status_code=502, detail="Model API returned non-JSON response")


@router.post(
    "/validate/integrated_csv",
    summary="Validate integrated CSV by forwarding file to the model API",
)
async def validate_integrated_csv(file: UploadFile = File(...)):
    return await _forward_integrated_csv("/validate/integrated_csv", file)


@router.post(
    "/analyze/integrated_csv",
    summary="Analyze integrated CSV by forwarding file to the model API",
)
async def analyze_integrated_csv(file: UploadFile = File(...)):
    filename = file.filename or "integrated.csv"
    
    # 1. Forward to Model API
    model_result = await _forward_integrated_csv("/analyze/integrated_csv", file)
    
    # 2. Save to database
    analysis_id = str(uuid.uuid4())
    db = get_db()
    
    doc = {
        "analysis_id": analysis_id,
        "filename": filename,
        "result": model_result,
        "analyzed_at": datetime.now(timezone.utc),
    }
    
    try:
        await db.integrated_analyses.insert_one(doc.copy())
    except Exception as e:
        logger.error(f"Failed to save integrated analysis {analysis_id} to DB: {e}")
    
    # Return the document, excluding the MongoDB '_id' which is not serializable
    doc.pop("_id", None)
    return doc


@router.get(
    "/integrated_analyses",
    summary="Get history of integrated analyses",
)
async def get_integrated_analyses(limit: int = Query(50, ge=1, le=100)):
    db = get_db()
    cursor = db.integrated_analyses.find({}, {"_id": 0, "result": 0}).sort("analyzed_at", -1).limit(limit)
    analyses = await cursor.to_list(length=limit)
    total = await db.integrated_analyses.count_documents({})
    
    return {"analyses": analyses, "total_count": total}


@router.get(
    "/integrated_analyses/{analysis_id}",
    summary="Get details of a specific integrated analysis",
)
async def get_integrated_analysis_by_id(analysis_id: str):
    db = get_db()
    analysis = await db.integrated_analyses.find_one({"analysis_id": analysis_id}, {"_id": 0})
    if not analysis:
        raise HTTPException(status_code=404, detail=f"Analysis '{analysis_id}' not found")
        
    return analysis