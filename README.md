# VYN Logistics AI

> AI-Powered Process Intelligence Platform

---

## Overview

VYN Logistics AI is a data-driven platform that analyzes operational workflows from structured datasets (CSV, Excel, Google Sheets) to detect anomalies, identify bottlenecks, and generate actionable insights.

The system uses a **process-agnostic approach**, meaning users do not need to define workflows in advance. Instead, the platform automatically learns and evaluates process behavior directly from data.

---

## Problem

Operational teams often struggle with:

- Limited visibility into end-to-end processes
- Difficulty identifying inefficiencies and bottlenecks
- Manual analysis of large datasets
- Inconsistent data structures across systems

---

## Solution

VYN Logistics AI provides:

- Automated process understanding without predefined flows
- AI-based anomaly detection
- Segment-level performance analysis
- Clear, actionable insights for decision-making

---

## Core Features

### Multi-Format Data Ingestion
- Supports CSV, Excel (`.xlsx`), and Google Sheets
- Automatic parsing and normalization

### AI-Based Analysis
- Process reconstruction from event data
- Feature engineering (duration, variability, statistical metrics)
- Anomaly detection using **Isolation Forest**

### Insight Generation
- Risk scoring (0–100)
- Anomaly rate calculation
- Bottleneck identification
- Natural language insight summaries

### Segment Analysis
- Automatic grouping of process data into logical segments
- Comparative analysis across segments

### Drill-Down Exploration
- Case-level anomaly detection
- Filtering and sorting of high-risk cases
- Root cause investigation

---

## System Workflow

```
User uploads dataset (CSV / Excel / Google Sheets)
        │
        ▼
  Data Parsing & Normalization
        │
        ▼
  Feature Engineering
  (duration, variability, statistical metrics)
        │
        ▼
  Anomaly Detection (Isolation Forest)
        │
        ▼
  Risk Scoring & Segment Analysis
        │
        ▼
  Insight Generation (Natural Language)
        │
        ▼
  Dashboard Visualization & Drill-Down
```

---

## System Architecture

### Backend

| Technology | Purpose |
|------------|---------|
| FastAPI (Python) | REST API framework |
| Pandas, NumPy | Data processing |
| scikit-learn (Isolation Forest) | Anomaly detection |
| MongoDB + Beanie (ODM) | Database & object mapping |
| Celery + Redis | Asynchronous task processing |
| Docker | Containerization |

### Frontend

| Technology | Purpose |
|------------|---------|
| React + TypeScript | UI framework |
| Vite | Build tool |
| TailwindCSS | Styling |
| Zustand | State management |
| TanStack Query | Server state & data fetching |

---

## API Endpoints

### Core

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/upload` | Upload dataset and trigger analysis |
| `GET` | `/api/results` | Retrieve analysis history |
| `GET` | `/api/results/{process_id}` | Retrieve detailed analysis by ID |

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/signup` | Register a new user |
| `POST` | `/api/auth/signin` | Authenticate user |
| `GET` | `/api/auth/me` | Get current authenticated user |

### Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Check system status |

---

## Example Response

```json
{
  "overall": {
    "total_case_count": 250,
    "avg_risk_score": 64.34,
    "anomaly_rate": 0.24
  },
  "segments": [
    {
      "name": "Customs",
      "risk_score": 68.5,
      "anomaly_rate": 0.35,
      "top_issue": "Inspection Delay"
    }
  ],
  "insight": "Customs exhibits the highest anomaly rate, primarily due to prolonged inspection delays."
}
```

---

## Team Members

| Name | Role | Responsibilities |
|------|------|------------------|
| Your Name | Fullstack Developer | System architecture, backend development, frontend implementation |
| Member 2 | AI Engineer | Model development, data processing, feature engineering |
| Member 3 | Frontend Developer | UI/UX design, dashboard implementation |
| Member 4 | Backend Developer | API development, database design, integration |

---

## Getting Started

### Prerequisites

- Docker & Docker Compose
- Node.js 18+
- Python 3.10+

### Run with Docker

```bash
git clone https://github.com/your-org/vyn-logistics-ai.git
cd vyn-logistics-ai
docker compose up --build
```

### Run Locally

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

---

## License

This project is licensed under the [MIT License](LICENSE).