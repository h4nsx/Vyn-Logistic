import logging

from fastapi import APIRouter, Query

from app.database import get_db

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/anomalies", summary="Get analyses with anomalies sorted by anomaly rate")
async def get_anomalies(
    limit: int = Query(100, ge=1, le=1000, description="Max results to return"),
    min_anomaly_rate: float = Query(0.0, ge=0.0, le=1.0, description="Minimum anomaly_rate filter"),
):
    db = get_db()

    query: dict = {"overall_result.anomaly_count": {"$gt": 0}}
    if min_anomaly_rate > 0:
        query["overall_result.anomaly_rate"] = {"$gte": min_anomaly_rate}

    cursor = (
        db.integrated_analyses.find(query, {"_id": 0, "raw_result": 0})
        .sort("overall_result.anomaly_rate", -1)
        .limit(limit)
    )
    anomalies = await cursor.to_list(length=limit)
    total = await db.integrated_analyses.count_documents(query)

    return {"anomalies": anomalies, "total_count": total}
