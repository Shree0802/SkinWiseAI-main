from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
import logging

from app.config import settings
from app.database import get_db
from app.models.schemas import HealthResponse
from app.services.youcam_client import youcam_client

logger = logging.getLogger("skinwise.health")
router = APIRouter(tags=["Health"])

@router.get("/health", response_model=HealthResponse)
def get_health_status(db: Session = Depends(get_db)):
    """
    Health and readiness check reporting backend availability,
    database connectivity, YouCam configuration status, environment,
    and service mode without falsely claiming live connection.
    """
    db_ok = True
    try:
        db.execute(text("SELECT 1"))
    except Exception as e:
        logger.error(f"Database health check query failed: {e}")
        db_ok = False

    is_configured = youcam_client.is_configured
    if is_configured:
        service_mode = "live_api"
    elif settings.ALLOW_DEMO_FALLBACK:
        service_mode = "demo_fallback"
    else:
        service_mode = "unconfigured"

    db_type = "postgresql" if "postgres" in settings.DATABASE_URL.lower() else "sqlite"

    return HealthResponse(
        status="healthy" if db_ok else "degraded",
        app_name=settings.APP_NAME,
        environment=settings.APP_ENV,
        youcam_configured=is_configured,
        database_connected=db_ok,
        version="1.0.0",
        service_mode=service_mode,
        database_type=db_type
    )
