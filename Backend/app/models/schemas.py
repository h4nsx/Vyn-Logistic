from pydantic import BaseModel, Field
from typing import Any, Optional
from datetime import datetime


# ── Upload ────────────────────────────────────────────────────────────────────

class UploadResponse(BaseModel):
    status: str
    upload_id: str
    process_code: str
    cases_analyzed: int
    anomalies_detected: int
    processing_time_seconds: float


class UploadRecord(BaseModel):
    upload_id: str
    filename: str
    process_code: str
    status: str
    cases_analyzed: int
    uploaded_at: datetime
    processing_time_seconds: float
    error: Optional[str] = None


# ── Case Result ───────────────────────────────────────────────────────────────

class CaseResult(BaseModel):
    upload_id: str
    process_code: str
    case_id: str
    result: dict[str, Any]
    risk_score: Optional[float] = None
    is_anomaly: bool = False
    analyzed_at: datetime


# ── Anomaly ───────────────────────────────────────────────────────────────────

class AnomalyItem(BaseModel):
    upload_id: str
    process_code: str
    case_id: str
    risk_score: Optional[float]
    is_anomaly: bool
    analyzed_at: datetime


class AnomaliesResponse(BaseModel):
    anomalies: list[AnomalyItem]
    total_count: int


# ── Process Detail ────────────────────────────────────────────────────────────

class ProcessDetailResponse(BaseModel):
    case_id: str
    process_code: str
    risk_score: Optional[float]
    is_anomaly: bool
    analyzed_at: datetime
    result: dict[str, Any]


# ── Entity Prediction ─────────────────────────────────────────────────────────

class EntityPredictRequest(BaseModel):
    data: dict[str, Any] = Field(..., description="Entity feature data")


class EntityBatchPredictRequest(BaseModel):
    rows: list[dict[str, Any]] = Field(..., description="List of entity feature rows")


# ── Results / Uploads ─────────────────────────────────────────────────────────

class ResultsResponse(BaseModel):
    results: list[dict[str, Any]]
    total_count: int


class UploadsResponse(BaseModel):
    uploads: list[dict[str, Any]]
    total_count: int
