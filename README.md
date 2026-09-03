<div align="center">

<img src="Frontend/public/favicon.webp" alt="Vyn Logistics Logo" width="96" height="96" style="border-radius: 20px;" />

# VYN LOGISTICS

### AI-Powered Supply Chain Process Intelligence Platform

[![Live Demo](https://img.shields.io/badge/Live%20Demo-vyn--logistic.vercel.app-orange?style=for-the-badge&logo=vercel)](https://vyn-logistic.vercel.app)
[![Backend](https://img.shields.io/badge/Backend-Render-46E3B7?style=for-the-badge&logo=render)](https://vyn-logistic-backend.onrender.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)

</div>

---

## Overview

**Vyn Logistics** is a full-stack, AI-powered process intelligence platform designed for logistics and supply chain teams. It ingests structured event-log data (CSV), automatically reconstructs business workflows, and applies machine learning to surface anomalies, bottlenecks, and risk — with no manual workflow configuration required.

The platform is built for decision-makers who need **clear, fast, and actionable intelligence** from complex operational data, not another BI tool that still requires a data analyst to interpret results.

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 🤖 **AI Anomaly Detection** | Isolation Forest model detects process deviations with risk scores from 0–100 |
| 🔄 **Zero-Config Process Discovery** | Automatically reconstructs workflows from raw event logs — no templates needed |
| 📊 **Segment Analysis** | Groups cases into logical segments and performs comparative risk analysis |
| 🔍 **Case-Level Drill-Down** | Investigate individual anomalous cases and trace root causes step-by-step |
| 🔐 **Secure Multi-Tenant Architecture** | Every dataset is strictly isolated by `user_id` — users can only see their own data |
| ⚡ **Rate-Limited API** | SlowAPI guards auth endpoints against brute-force (5 req/min for signup) |
| 🗑️ **Full Account Lifecycle** | Register, manage, and permanently delete accounts with cascading data removal |
| 🌐 **Real-Time Dashboard** | KPI cards, trend indicators, anomaly priority feed, and recent analyses table |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────┐
│                  CLIENT (Vercel)                 │
│          React 19 + TypeScript + Vite            │
│   Zustand · TanStack Query · Framer Motion       │
└─────────────────────┬───────────────────────────┘
                      │ HTTPS / REST API
┌─────────────────────▼───────────────────────────┐
│                BACKEND (Render)                  │
│          FastAPI · Uvicorn · SlowAPI             │
│     JWT Auth · bcrypt · Motor (async MongoDB)    │
└─────────────────────┬───────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────┐
│              AI MODEL SERVICE                    │
│   scikit-learn (Isolation Forest) · Pandas       │
│        Feature Engineering · Risk Scoring        │
└─────────────────────┬───────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────┐
│              DATABASE (MongoDB Atlas)            │
│   Tenant-Isolated Collections (by user_id)      │
│      uploads · case_results · users             │
└─────────────────────────────────────────────────┘
```

---

## 📂 Project Structure

```
Vyn-Logistic/
├── Frontend/               # React + TypeScript SPA
│   ├── src/
│   │   ├── app/            # Router, layouts, global providers
│   │   ├── features/       # Auth, datasets (feature-sliced design)
│   │   ├── pages/          # Route-level page components
│   │   └── shared/         # UI components, hooks, axios client
│   └── public/             # Static assets & favicon
│
├── Backend/                # FastAPI REST API
│   ├── app/
│   │   ├── api/            # Route handlers (auth, upload, results, entity...)
│   │   ├── models/         # Pydantic schemas
│   │   ├── services/       # Email, AI client, business logic
│   │   ├── config.py       # Environment & settings (Pydantic-Settings)
│   │   ├── database.py     # Motor async MongoDB connection
│   │   └── main.py         # FastAPI app entry point
│   └── requirements.txt
│
└── Model/                  # AI / ML model & experiments
    ├── reports/            # Feature experiment results
    └── ...
```

---

## 🔌 API Reference

### Authentication
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/signup` | Public · `5/min` | Register a new user |
| `POST` | `/api/auth/signin` | Public · `10/min` | Authenticate & receive JWT |
| `GET` | `/api/auth/me` | 🔒 JWT | Get current user profile |
| `PATCH` | `/api/auth/me/password` | 🔒 JWT | Change password |
| `DELETE` | `/api/auth/me` | 🔒 JWT | Permanently delete account & all data |
| `POST` | `/api/auth/forgot-password` | Public · `3/min` | Send password reset email |
| `POST` | `/api/auth/reset-password` | Public | Reset password via token |

### Data & Analysis
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/upload` | 🔒 JWT | Upload CSV and trigger AI analysis |
| `GET` | `/api/results` | 🔒 JWT | List all case results (user-scoped) |
| `GET` | `/api/uploads` | 🔒 JWT | List all upload batches (user-scoped) |
| `GET` | `/api/uploads/{id}` | 🔒 JWT | Get details of a specific upload |
| `GET` | `/api/anomalies` | 🔒 JWT | List anomalous cases sorted by risk |
| `POST` | `/api/analyze/integrated_csv` | 🔒 JWT | Analyze integrated multi-process CSV |
| `GET` | `/api/integrated_analyses` | 🔒 JWT | History of integrated analyses |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18+
- **Python** 3.10+
- **MongoDB Atlas** account (or local MongoDB instance)

### Backend

```bash
cd Backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# → Fill in MONGODB_URL, JWT_SECRET, CORS_ORIGINS, etc.

# Start the server
uvicorn app.main:app --reload
# API docs available at: http://localhost:8000/docs
```

### Frontend

```bash
cd Frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# → Set VITE_API_URL=http://localhost:8000/api

# Start dev server
npm run dev
# → App available at: http://localhost:5173
```

---

## 🌍 Deployment

| Service | Platform | URL |
|---------|----------|-----|
| Frontend | Vercel | [vyn-logistic.vercel.app](https://vyn-logistic.vercel.app) |
| Backend | Render | [vyn-logistic-backend.onrender.com](https://vyn-logistic-backend.onrender.com) |
| Database | MongoDB Atlas | Managed cloud |

### Environment Variables

**Backend (`.env`)**
```env
MONGODB_URL=mongodb+srv://...
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
CORS_ORIGINS=https://vyn-logistic.vercel.app
AI_MODEL_URL=http://...
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=...
EMAIL_PASS=...
```

**Frontend (`.env.local`)**
```env
VITE_API_URL=https://vyn-logistic-backend.onrender.com/api
```

---

## 👥 Team

| Name | Role |
|------|------|
| **Võ Tuấn Hùng** | Team Lead · Full-Stack Architecture & Implementation |
| **Trần Quốc Huy** | AI Engineer · Model Development & Feature Engineering |
| **Nguyễn Văn Linh** | Frontend Developer · UI/UX Design & Dashboard |
| **Nguyễn Tăng Minh Thông** | Backend Developer · API Design & Database |

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

Built with ❤️ by the Vyn team &nbsp;·&nbsp; © 2026 Vyn Logistics

</div>
