import json
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.config import settings
from app.database import get_db
from app.models.schemas import SkinAnalysisResult, AnalysisReportSummary
from app.models.db_models import AnalysisReportDB
from app.services.youcam_client import youcam_client

router = APIRouter(tags=["Skin Analysis"])

@router.post("/skin-analysis", response_model=SkinAnalysisResult)
async def analyze_skin(
    image: UploadFile = File(...),
    demo: Optional[bool] = Form(False),
    save_report: Optional[bool] = Form(True),
    db: Session = Depends(get_db)
):
    # Validate MIME type
    if image.content_type not in settings.ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file type '{image.content_type}'. Allowed types: {', '.join(settings.ALLOWED_IMAGE_TYPES)}"
        )

    # Read binary bytes
    contents = await image.read()
    if len(contents) > settings.MAX_UPLOAD_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Image size exceeds the maximum limit of {settings.MAX_UPLOAD_SIZE_BYTES // (1024 * 1024)}MB."
        )

    if len(contents) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The uploaded image file is empty."
        )

    # Run analysis through YouCam client (or demo if demo=True or unconfigured)
    try:
        result = await youcam_client.analyze_image_bytes(
            image_bytes=contents,
            file_name=image.filename or "selfie.jpg",
            content_type=image.content_type or "image/jpeg",
            force_demo=bool(demo)
        )
    except PermissionError as pe:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(pe))
    except TimeoutError as te:
        raise HTTPException(status_code=status.HTTP_504_GATEWAY_TIMEOUT, detail=str(te))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=f"Skin analysis provider error: {str(e)}")

    # Store structured results in SQLite (no raw selfie is stored)
    if save_report:
        try:
            metrics_payload = [m.model_dump() for m in result.metrics]
            db_report = AnalysisReportDB(
                id=result.report_id,
                created_at=result.created_at,
                skin_type=result.skin_type,
                skin_age=result.skin_age,
                overall_score=result.overall_score,
                metrics_json=json.dumps(metrics_payload),
                summary=result.summary,
                is_demo=result.is_demo,
                source=result.source,
                raw_data_json=json.dumps(result.raw_data_summary or {})
            )
            db.add(db_report)
            db.commit()
        except Exception as dbe:
            db.rollback()
            # Non-fatal to client response, but log
            pass

    return result

@router.get("/skin-analysis/{report_id}", response_model=SkinAnalysisResult)
def get_report_by_id(report_id: str, db: Session = Depends(get_db)):
    report = db.query(AnalysisReportDB).filter(AnalysisReportDB.id == report_id).first()
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Report '{report_id}' not found.")

    try:
        metrics_data = json.loads(report.metrics_json or "[]")
    except Exception:
        metrics_data = []

    return SkinAnalysisResult(
        report_id=report.id,
        created_at=report.created_at,
        skin_type=report.skin_type,
        skin_age=report.skin_age,
        overall_score=report.overall_score,
        metrics=metrics_data,
        summary=report.summary,
        is_demo=report.is_demo,
        source=report.source,
        raw_data_summary=json.loads(report.raw_data_json or "{}")
    )

@router.get("/reports", response_model=List[AnalysisReportSummary])
def list_reports(db: Session = Depends(get_db)):
    reports = db.query(AnalysisReportDB).order_by(AnalysisReportDB.created_at.desc()).all()
    summaries = []
    for r in reports:
        concerns = []
        try:
            metrics = json.loads(r.metrics_json or "[]")
            concerns = [m.get("label", "") for m in metrics if m.get("score") and m.get("score") < 65][:3]
        except Exception:
            pass

        summaries.append(AnalysisReportSummary(
            report_id=r.id,
            created_at=r.created_at,
            skin_type=r.skin_type,
            overall_score=r.overall_score,
            is_demo=r.is_demo,
            concerns_highlighted=concerns
        ))
    return summaries

@router.delete("/reports/{report_id}")
def delete_report(report_id: str, db: Session = Depends(get_db)):
    report = db.query(AnalysisReportDB).filter(AnalysisReportDB.id == report_id).first()
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Report '{report_id}' not found.")
    
    db.delete(report)
    db.commit()
    return {"message": f"Report '{report_id}' deleted successfully.", "deleted_id": report_id}
