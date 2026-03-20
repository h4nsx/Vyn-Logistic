# Vyn Logistics Backend

Real-time logistics analytics backend with AI-powered bottleneck detection.

## Stack
- **FastAPI** — Web framework
- **MongoDB (Motor)** — Async database
- **httpx** — Async HTTP client to call AI model
- **AI Model** — `https://logistics-ai-api.onrender.com`

## Setup

```bash
cd Backend
pip install -r requirements.txt
```

Copy `.env.example` to `.env` and fill in your values (already configured for this project).

## Run

```bash
uvicorn app.main:app --reload --port 8000
```

Swagger UI: http://localhost:8000/docs

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/upload` | Upload CSV → AI analysis → store results |
| GET | `/api/anomalies` | Get detected anomalies sorted by risk |
| GET | `/api/process/{case_id}` | Get AI analysis for a specific case |
| POST | `/api/process/analyze` | Analyze single case via JSON events |
| POST | `/api/process/analyze-file` | Analyze single case via CSV file |
| GET | `/api/results` | Get all case results |
| GET | `/api/uploads` | Get upload history |
| GET | `/api/uploads/{upload_id}` | Get upload batch details |
| POST | `/api/entity/{type}/predict` | Predict risk for single entity |
| POST | `/api/entity/{type}/predict_batch` | Batch entity risk prediction |
| GET | `/api/entity/results` | Get entity prediction history |

## Upload Flow

```
POST /api/upload?process_code=TRUCKING_DELIVERY_FLOW
  │
  ├── Validate file (CSV, ≤10MB)
  ├── Forward to AI model /process/analyze_batch_file_numeric
  ├── Store case results in MongoDB (collection: case_results)
  ├── Store upload record (collection: uploads)
  └── Return { status, cases_analyzed, anomalies_detected, processing_time_seconds }
```

## Process Codes

| Alias | Full Code | Batch Key |
|-------|-----------|-----------|
| TRUCKING | TRUCKING_DELIVERY_FLOW | trucking_result |
| WAREHOUSE | WAREHOUSE_FULFILLMENT | warehouse_result |
| CUSTOMS | IMPORT_CUSTOMS_CLEARANCE | customs_result |

## Entity Types
- `driver`
- `fleet`
- `ops`

## Risk Levels

| Risk Score | Category |
|------------|----------|
| < 80 | Normal |
| 80–100 | Warning |
| ≥ 100 | High Risk (Anomaly) |
