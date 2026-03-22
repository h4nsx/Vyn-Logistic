from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    MONGODB_URL: str = "mongodb://localhost:27017"
    MONGODB_DB_NAME: str = "vyn_logistics"
    AI_MODEL_URL: str = "https://vyn-logistic-model.onrender.com"
    PORT: int = 8000
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:5173"]
    JWT_SECRET_KEY: str = "change-this-secret-in-production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_MINUTES: int = 1440
    RESET_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_COOKIE_NAME: str = "refresh_token"
    COOKIE_SECURE: bool = False
    COOKIE_SAMESITE: str = "lax"
    FRONTEND_URL: str = "http://localhost:3000"
    RESEND_API_KEY: str = ""
    RESEND_FROM_EMAIL: str = "onboarding@resend.dev"
    GOOGLE_CLIENT_ID: str = ""

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()

# AI model constants
SUPPORTED_PROCESSES = [
    "TRUCKING_DELIVERY_FLOW",
    "WAREHOUSE_FULFILLMENT",
    "IMPORT_CUSTOMS_CLEARANCE",
]

PROCESS_ALIASES = {
    "TRUCKING": "TRUCKING_DELIVERY_FLOW",
    "WAREHOUSE": "WAREHOUSE_FULFILLMENT",
    "CUSTOMS": "IMPORT_CUSTOMS_CLEARANCE",
}

PROCESS_BATCH_KEYS = {
    "TRUCKING_DELIVERY_FLOW": "trucking_result",
    "WAREHOUSE_FULFILLMENT": "warehouse_result",
    "IMPORT_CUSTOMS_CLEARANCE": "customs_result",
}

ENTITY_TYPES = ["driver", "fleet", "ops"]

RISK_THRESHOLDS = {
    "normal": 80.0,
    "warning": 100.0,
}
