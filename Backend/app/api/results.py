import logging

from fastapi import APIRouter, HTTPException, Query

from app.database import get_db

router = APIRouter()
logger = logging.getLogger(__name__)


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
    db = get_db()
    doc = await db.integrated_analyses.find_one({"analysis_id": analysis_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail=f"Analysis '{analysis_id}' not found")
    return doc
