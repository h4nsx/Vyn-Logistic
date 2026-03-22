import logging
from typing import Any, Optional

from fastapi import APIRouter, File, HTTPException, Query, UploadFile
from pydantic import BaseModel

from app.config import PROCESS_ALIASES, SUPPORTED_PROCESSES
from app.database import get_db
from app.services.ai_client import analyze_case_file, analyze_case_json

router = APIRouter()
logger = logging.getLogger(__name__)


# ── GET /api/process/{case_id} ─────────────────────────────────────────────────

@router.get("/process/{case_id}", summary="Get AI analysis result for a specific case")
async def get_process(case_id: str):
    db = get_db()
    doc = await db.case_results.find_one({"case_id": case_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail=f"Case '{case_id}' not found")

    return {
        "case_id": doc["case_id"],
        "process_code": doc.get("process_code"),
        "risk_score": doc.get("risk_score"),
        "is_anomaly": doc.get("is_anomaly"),
        "analyzed_at": doc.get("analyzed_at"),
        "result": doc.get("result"),
    }


# ── POST /api/process/analyze ──────────────────────────────────────────────────

class EventRow(BaseModel):
    step_code: str
    start_time: str
    end_time: str


class AnalyzeCaseRequest(BaseModel):
    process_code: str
    case_id: Optional[str] = None
    events: list[EventRow]


@router.post("/process/analyze", summary="Analyze a single case via JSON events")
async def analyze_single_case(body: AnalyzeCaseRequest):
    normalized_code = PROCESS_ALIASES.get(
        body.process_code.upper(), body.process_code.upper()
    )
    if normalized_code not in SUPPORTED_PROCESSES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid process_code. Supported: {SUPPORTED_PROCESSES}",
        )

    try:
        result = await analyze_case_json(
            process_code=normalized_code,
            events=[e.model_dump() for e in body.events],
            case_id=body.case_id,
        )
    except Exception as exc:
        logger.error(f"AI model error on /process/analyze: {exc}")
        raise HTTPException(status_code=502, detail=f"AI model error: {exc}")

    return {
        "process_code": normalized_code,
        "case_id": body.case_id,
        "result": result,
    }


# ── POST /api/process/analyze-file ────────────────────────────────────────────

@router.post("/process/analyze-file", summary="Analyze a single case from CSV file")
async def analyze_single_case_file(
    file: UploadFile = File(...),
    process_code: str = Query(...),
    case_id: Optional[str] = Query(None),
):
    normalized_code = PROCESS_ALIASES.get(process_code.upper(), process_code.upper())
    if normalized_code not in SUPPORTED_PROCESSES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid process_code. Supported: {SUPPORTED_PROCESSES}",
        )

    file_bytes = await file.read()
    if not file_bytes:
        raise HTTPException(status_code=400, detail="File is empty")

    try:
        result = await analyze_case_file(
            file_bytes=file_bytes,
            filename=file.filename,
            process_code=normalized_code,
            case_id=case_id,
        )
    except Exception as exc:
        logger.error(f"AI model error on /process/analyze-file: {exc}")
        raise HTTPException(status_code=502, detail=f"AI model error: {exc}")

    return {
        "process_code": normalized_code,
        "case_id": case_id,
        "result": result,
    }
