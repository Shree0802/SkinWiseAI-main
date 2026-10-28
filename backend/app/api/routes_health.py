from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.config import settings
from app.database import get_db
from app.models.schemas import HealthResponse
from app.services.youcam_client import youcam_client

router = APIRouter(tags=["Health"])

@router.get("/health", response_model=HealthResponse)
def get_health_status(db: Session = Depends(get_db)):
    db_ok = True
    try:
        db.execute(text("SELECT 1"))
    except Exception:
        db_ok = False

    return HealthResponse(
        status="healthy" if db_ok else "degraded",
        app_name=settings.APP_NAME,
        environment=settings.APP_ENV,
        youcam_configured=youcam_client.is_configured,
        database_connected=db_ok,
        version="1.0.0"
    )
