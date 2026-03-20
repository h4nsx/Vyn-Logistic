from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    MONGODB_URL: str = "mongodb://localhost:27017"
    MONGODB_DB_NAME: str = "vyn_logistics"
    AI_MODEL_URL: str = "https://logistics-ai-api.onrender.com"
    PORT: int = 8000
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:5173"]

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
