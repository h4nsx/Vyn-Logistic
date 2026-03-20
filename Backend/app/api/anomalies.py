import logging
from typing import Optional

from fastapi import APIRouter, Query

from app.database import get_db

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/anomalies", summary="Get detected anomalies sorted by risk level")
async def get_anomalies(
    limit: int = Query(100, ge=1, le=1000, description="Max results to return"),
    min_risk: float = Query(0.0, ge=0.0, le=200.0, description="Minimum risk_score filter"),
    process_code: Optional[str] = Query(None, description="Filter by process type"),
    upload_id: Optional[str] = Query(None, description="Filter by upload batch"),
):
    db = get_db()

    query: dict = {"is_anomaly": True}
    if min_risk > 0:
        query["risk_score"] = {"$gte": min_risk}
    if process_code:
        query["process_code"] = process_code.upper()
    if upload_id:
        query["upload_id"] = upload_id

    projection = {"_id": 0, "result": 0}

    cursor = (
        db.case_results.find(query, projection)
        .sort("risk_score", -1)
        .limit(limit)
    )
    anomalies = await cursor.to_list(length=limit)
    total = await db.case_results.count_documents(query)

    return {"anomalies": anomalies, "total_count": total}
