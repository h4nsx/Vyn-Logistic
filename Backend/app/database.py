import logging
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from app.config import settings

logger = logging.getLogger(__name__)

_client: AsyncIOMotorClient = None


def get_client() -> AsyncIOMotorClient:
    global _client
    if _client is None:
        _client = AsyncIOMotorClient(settings.MONGODB_URL)
    return _client


def get_db() -> AsyncIOMotorDatabase:
    return get_client()[settings.MONGODB_DB_NAME]


async def create_indexes() -> None:
    """Create MongoDB indexes. Logs a warning on failure instead of crashing."""
    try:
        db = get_db()

        await db.case_results.create_index("case_id")
        await db.case_results.create_index("process_code")
        await db.case_results.create_index("upload_id")
        await db.case_results.create_index("is_anomaly")
        await db.case_results.create_index([("risk_score", -1)])
        await db.case_results.create_index("analyzed_at")

        await db.uploads.create_index("upload_id", unique=True)
        await db.uploads.create_index("process_code")
        await db.uploads.create_index([("uploaded_at", -1)])

        await db.entity_results.create_index("entity_type")
        await db.entity_results.create_index([("predicted_at", -1)])

        # Auth collections
        await db.users.create_index("email", unique=True)
        await db.users.create_index("role")
        await db.users.create_index([("created_at", -1)])

        await db.refresh_tokens.create_index("token_hash", unique=True)
        await db.refresh_tokens.create_index([("user_id", 1), ("jti", 1)], unique=True)
        await db.refresh_tokens.create_index("expires_at", expireAfterSeconds=0)

        await db.password_reset_tokens.create_index("token_hash", unique=True)
        await db.password_reset_tokens.create_index("user_id")
        await db.password_reset_tokens.create_index("expires_at", expireAfterSeconds=0)

        logger.info("MongoDB indexes created successfully")
    except Exception as exc:
        logger.warning(
            f"Could not create MongoDB indexes (check Atlas Network Access / credentials): {exc}"
        )


async def close_connection() -> None:
    global _client
    if _client is not None:
        _client.close()
        _client = None
        logger.info("MongoDB connection closed")
