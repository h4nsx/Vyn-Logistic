import logging
from typing import Optional

from fastapi import APIRouter, Query

from app.database import get_db

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/results", summary="Get all case analysis results")
async def get_results(
    process_code: Optional[str] = Query(None, description="Filter by process type"),
    upload_id: Optional[str] = Query(None, description="Filter by upload batch"),
    is_anomaly: Optional[bool] = Query(None, description="Filter anomalies only"),
    limit: int = Query(100, ge=1, le=1000),
):
    db = get_db()

    query: dict = {}
    if process_code:
        query["process_code"] = process_code.upper()
    if upload_id:
        query["upload_id"] = upload_id
    if is_anomaly is not None:
        query["is_anomaly"] = is_anomaly

    cursor = (
        db.case_results.find(query, {"_id": 0})
        .sort("analyzed_at", -1)
        .limit(limit)
    )
    results = await cursor.to_list(length=limit)
    total = await db.case_results.count_documents(query)

    return {"results": results, "total_count": total}


@router.get("/uploads", summary="Get upload history")
async def get_uploads(
    process_code: Optional[str] = Query(None),
    limit: int = Query(20, ge=1, le=100),
):
    db = get_db()

    query: dict = {}
    if process_code:
        query["process_code"] = process_code.upper()

    cursor = db.uploads.find(query, {"_id": 0}).sort("uploaded_at", -1).limit(limit)
    uploads = await cursor.to_list(length=limit)
    total = await db.uploads.count_documents(query)

    return {"uploads": uploads, "total_count": total}


@router.get("/uploads/{upload_id}", summary="Get details of a specific upload batch")
async def get_upload_detail(upload_id: str):
    from fastapi import HTTPException

    db = get_db()
    upload = await db.uploads.find_one({"upload_id": upload_id}, {"_id": 0})
    if not upload:
        raise HTTPException(status_code=404, detail=f"Upload '{upload_id}' not found")

    cases = await db.case_results.find(
        {"upload_id": upload_id}, {"_id": 0, "result": 0}
    ).to_list(length=None)

    return {
        "upload": upload,
        "cases": cases,
        "anomaly_count": sum(1 for c in cases if c.get("is_anomaly")),
    }


@router.get("/integrated_analyses", summary="Get integrated CSV analysis history")
async def get_integrated_analyses(
    limit: int = Query(20, ge=1, le=100),
):
    db = get_db()
    cursor = (
        db.integrated_analyses.find({}, {"_id": 0, "raw_result": 0})
        .sort("analyzed_at", -1)
        .limit(limit)
    )
    records = await cursor.to_list(length=limit)
    total = await db.integrated_analyses.count_documents({})
    return {"records": records, "total_count": total}


@router.get("/integrated_analyses/{analysis_id}", summary="Get a specific integrated CSV analysis")
async def get_integrated_analysis(analysis_id: str):
    from fastapi import HTTPException

    db = get_db()
    doc = await db.integrated_analyses.find_one({"analysis_id": analysis_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail=f"Analysis '{analysis_id}' not found")
    return doc
