import logging
from typing import Any, Optional

import httpx

from app.config import settings

logger = logging.getLogger(__name__)

AI_BASE_URL = settings.AI_MODEL_URL.rstrip("/")

# Timeout: batch analysis of large files can take a while
BATCH_TIMEOUT = 180.0
SINGLE_TIMEOUT = 60.0
ENTITY_TIMEOUT = 30.0


async def analyze_batch_file(
    file_bytes: bytes,
    filename: str,
    process_code: str,
    max_cases: Optional[int] = None,
) -> dict[str, Any]:
    """Forward CSV file to AI model for batch process analysis."""
    params: dict[str, Any] = {"process_code": process_code}
    if max_cases is not None:
        params["max_cases"] = max_cases

    async with httpx.AsyncClient(timeout=BATCH_TIMEOUT) as client:
        response = await client.post(
            f"{AI_BASE_URL}/process/analyze_batch_file_numeric",
            params=params,
            files={"file": (filename, file_bytes, "text/csv")},
        )
        response.raise_for_status()
        return response.json()


async def analyze_case_file(
    file_bytes: bytes,
    filename: str,
    process_code: str,
    case_id: Optional[str] = None,
) -> dict[str, Any]:
    """Forward a single-case CSV file to AI model."""
    params: dict[str, Any] = {"process_code": process_code}
    if case_id:
        params["case_id"] = case_id

    async with httpx.AsyncClient(timeout=SINGLE_TIMEOUT) as client:
        response = await client.post(
            f"{AI_BASE_URL}/process/analyze_case_file_numeric",
            params=params,
            files={"file": (filename, file_bytes, "text/csv")},
        )
        response.raise_for_status()
        return response.json()


async def analyze_case_json(
    process_code: str,
    events: list[dict[str, Any]],
    case_id: Optional[str] = None,
) -> dict[str, Any]:
    """Send structured JSON events to AI model for single case analysis."""
    payload: dict[str, Any] = {"process_code": process_code, "events": events}
    if case_id:
        payload["case_id"] = case_id

    async with httpx.AsyncClient(timeout=SINGLE_TIMEOUT) as client:
        response = await client.post(
            f"{AI_BASE_URL}/process/analyze_case_numeric",
            json=payload,
        )
        response.raise_for_status()
        return response.json()


async def predict_entity(
    entity_type: str,
    data: dict[str, Any],
) -> dict[str, Any]:
    """Predict risk for a single entity (driver / fleet / ops)."""
    async with httpx.AsyncClient(timeout=ENTITY_TIMEOUT) as client:
        response = await client.post(
            f"{AI_BASE_URL}/entity/{entity_type}/predict",
            json={"data": data},
        )
        response.raise_for_status()
        return response.json()


async def predict_entity_batch(
    entity_type: str,
    rows: list[dict[str, Any]],
) -> dict[str, Any]:
    """Predict risk for multiple entities in one request."""
    async with httpx.AsyncClient(timeout=ENTITY_TIMEOUT) as client:
        response = await client.post(
            f"{AI_BASE_URL}/entity/{entity_type}/predict_batch",
            json={"rows": rows},
        )
        response.raise_for_status()
        return response.json()


def extract_risk_score(case: dict[str, Any]) -> Optional[float]:
    """
    Best-effort extraction of a numeric risk score from an AI result dict.
    Checks common key names used by the model.
    """
    candidate_keys = [
        "risk_score",
        "risk_percent",
        "overall_risk",
        "risk",
        "score",
        "anomaly_score",
    ]
    for key in candidate_keys:
        value = case.get(key)
        if value is not None:
            try:
                return float(value)
            except (ValueError, TypeError):
                continue

    # Fallback: look one level deeper in nested dicts
    for v in case.values():
        if isinstance(v, dict):
            score = extract_risk_score(v)
            if score is not None:
                return score

    return None
