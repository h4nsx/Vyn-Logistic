import logging
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, Query

from app.config import ENTITY_TYPES
from app.database import get_db
from app.models.schemas import EntityBatchPredictRequest, EntityPredictRequest
from app.services.ai_client import predict_entity, predict_entity_batch

router = APIRouter()
logger = logging.getLogger(__name__)


def _validate_entity_type(entity_type: str) -> str:
    et = entity_type.lower()
    if et not in ENTITY_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid entity_type '{entity_type}'. Supported: {ENTITY_TYPES}",
        )
    return et


@router.post(
    "/entity/{entity_type}/predict",
    summary="Predict risk for a single entity (driver / fleet / ops)",
)
async def predict_single(entity_type: str, body: EntityPredictRequest):
    et = _validate_entity_type(entity_type)

    try:
        result = await predict_entity(et, body.data)
    except Exception as exc:
        logger.error(f"AI entity predict error [{et}]: {exc}")
        raise HTTPException(status_code=502, detail=f"AI model error: {exc}")

    db = get_db()
    await db.entity_results.insert_one(
        {
            "entity_type": et,
            "input": body.data,
            "result": result,
            "predicted_at": datetime.now(timezone.utc),
        }
    )

    return result


@router.post(
    "/entity/{entity_type}/predict_batch",
    summary="Predict risk for multiple entities in one request",
)
async def predict_batch(entity_type: str, body: EntityBatchPredictRequest):
    et = _validate_entity_type(entity_type)

    if not body.rows:
        raise HTTPException(status_code=400, detail="rows list cannot be empty")

    try:
        result = await predict_entity_batch(et, body.rows)
    except Exception as exc:
        logger.error(f"AI entity batch predict error [{et}]: {exc}")
        raise HTTPException(status_code=502, detail=f"AI model error: {exc}")

    db = get_db()
    await db.entity_results.insert_one(
        {
            "entity_type": et,
            "input": body.rows,
            "result": result,
            "predicted_at": datetime.now(timezone.utc),
        }
    )

    return result


@router.get(
    "/entity/results",
    summary="Get stored entity prediction history",
)
async def get_entity_results(
    entity_type: str = Query(None, description="Filter by entity type"),
    limit: int = Query(50, ge=1, le=500),
):
    db = get_db()

    query: dict = {}
    if entity_type:
        query["entity_type"] = entity_type.lower()

    cursor = (
        db.entity_results.find(query, {"_id": 0})
        .sort("predicted_at", -1)
        .limit(limit)
    )
    records = await cursor.to_list(length=limit)
    total = await db.entity_results.count_documents(query)

    return {"records": records, "total_count": total}
