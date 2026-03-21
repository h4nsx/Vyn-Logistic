import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pymongo.errors import PyMongoError

from app.config import settings
from app.database import create_indexes, close_connection
from app.api import upload, anomalies, process, results, entity, auth, integrated_csv_proxy


logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting Vyn Logistics Backend...")
    await create_indexes()
    logger.info(f"Connected to MongoDB: {settings.MONGODB_DB_NAME}")
    logger.info(f"AI Model URL: {settings.AI_MODEL_URL}")
    yield
    await close_connection()
    logger.info("Backend shutdown complete")


app = FastAPI(
    title="Vyn Logistics Backend",
    description="Real-time logistics analytics with AI-powered bottleneck detection",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload.router, prefix="/api", tags=["Upload"])
app.include_router(anomalies.router, prefix="/api", tags=["Anomalies"])
app.include_router(process.router, prefix="/api", tags=["Process"])
app.include_router(results.router, prefix="/api", tags=["Results"])
app.include_router(entity.router, prefix="/api", tags=["Entity"])
app.include_router(auth.router, prefix="/api", tags=["Auth"])
app.include_router(integrated_csv_proxy.router, prefix="/api", tags=["Integrated CSV"])


@app.exception_handler(PyMongoError)
async def pymongo_error_handler(_: Request, exc: PyMongoError):
    logger.error(f"MongoDB operation failed: {exc}")
    return JSONResponse(
        status_code=503,
        content={
            "status": "error",
            "message": "Database is unavailable. Check MongoDB credentials and Atlas Network Access.",
        },
    )


@app.get("/", tags=["Health"])
async def root():
    return {"status": "ok", "service": "Vyn Logistics Backend", "version": "0.1.0"}


@app.get("/health", tags=["Health"])
async def health():
    return {"status": "ok"}
