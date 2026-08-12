from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

from app.core.database import get_db
from app.core.config import settings

router = APIRouter()


@router.get("/health", summary="System Health Status Check")
async def health_check(db: AsyncSession = Depends(get_db)):
    """
    Health check endpoint suitable for local connectivity checks and AWS App Runner deployment probes.
    """
    db_status = "disconnected"
    try:
        result = await db.execute(text("SELECT 1"))
        if result.scalar() == 1:
            db_status = "connected"
    except Exception as e:
        db_status = f"error: {str(e)}"

    return {
        "status": "healthy",
        "app_name": settings.PROJECT_NAME,
        "environment": settings.ENV,
        "database_status": db_status,
        "database_engine": settings.DATABASE_URL.split("://")[0]
    }
