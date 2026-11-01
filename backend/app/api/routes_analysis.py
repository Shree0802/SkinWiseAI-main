import json
import io
import logging
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends, status
from sqlalchemy.orm import Session
from typing import List, Optional
from PIL import Image

from app.config import settings
from app.database import get_db
from app.models.schemas import SkinAnalysisResult, AnalysisReportSummary
from app.models.db_models import AnalysisReportDB, JournalEntryDB
from app.services.youcam_client import youcam_client, sanitize_secret, FaceValidationError

logger = logging.getLogger("skinwise.analysis")
router = APIRouter(tags=["Skin Analysis"])

def validate_image_payload(contents: bytes, declared_content_type: Optional[str]) -> str:
    """
    Validates uploaded file:
    - Byte length (non-empty, <= MAX_UPLOAD_SIZE_BYTES)
    - Declared MIME type
    - Actual binary decoding via Pillow to verify image validity and format.
    """
    if len(contents) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The uploaded image file is empty."
        )

    if len(contents) > settings.MAX_UPLOAD_SIZE_BYTES:
        max_mb = settings.MAX_UPLOAD_SIZE_BYTES // (1024 * 1024)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Image size exceeds the maximum limit of {max_mb}MB."
        )

    if declared_content_type and declared_content_type not in settings.ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file type '{declared_content_type}'. Allowed types: {', '.join(settings.ALLOWED_IMAGE_TYPES)}"
        )

    # Actual image content verification using Pillow
    try:
        with Image.open(io.BytesIO(contents)) as img:
            img.verify()
            detected_format = (img.format or "").upper()
            if detected_format not in ("JPEG", "JPG", "PNG", "WEBP"):
                raise ValueError(f"Decoded image format '{detected_format}' is not an accepted format.")
    except Exception as e:
        logger.warning(f"Image content validation rejected file: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid image content. Uploaded file could not be decoded as a valid JPEG, PNG, or WebP photo."
        )

    # Map format to normalized content-type
    format_mime_map = {
        "JPEG": "image/jpeg",
        "JPG": "image/jpeg",
        "PNG": "image/png",
        "WEBP": "image/webp"
    }
    return format_mime_map.get(detected_format, declared_content_type or "image/jpeg")

@router.post("/skin-analysis", response_model=SkinAnalysisResult)
async def analyze_skin(
    image: UploadFile = File(...),
    demo: Optional[bool] = Form(False),
    save_report: Optional[bool] = Form(True),
    db: Session = Depends(get_db)
):
    """
    Analyzes skin features from an uploaded selfie:
    - Validates MIME type, size, and actual image content in memory (never written to disk).
    - Interfaces with YouCam S2S API or provides clearly marked demo analysis.
    - Saves structured metrics to database if requested.
    """
    # Read binary bytes in memory
    try:
        contents = await image.read()
    except Exception as e:
        logger.error(f"Error reading uploaded file: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to read uploaded image bytes."
        )

    normalized_content_type = validate_image_payload(contents, image.content_type)
    file_name = image.filename or "selfie.jpg"

    # Run analysis
    try:
        result = await youcam_client.analyze_image_bytes(
            image_bytes=contents,
            file_name=file_name,
            content_type=normalized_content_type,
            force_demo=bool(demo)
        )
    except FaceValidationError as fve:
        clean_msg = sanitize_secret(str(fve))
        logger.info(f"Photo framing validation notice: {clean_msg}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Photo Framing Notice: {clean_msg}. Please take a closer selfie or crop closer to your face (face must occupy >60% of frame width)."
        )
    except PermissionError as pe:
        logger.warning(f"Analysis authorization error: {pe}")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=sanitize_secret(str(pe)))
    except TimeoutError as te:
        logger.error(f"Analysis task timeout: {te}")
        raise HTTPException(status_code=status.HTTP_504_GATEWAY_TIMEOUT, detail=sanitize_secret(str(te)))
    except Exception as e:
        clean_msg = sanitize_secret(str(e))
        logger.error(f"Analysis error: {clean_msg}")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Skin analysis provider error: {clean_msg}"
        )

    # Store structured results in database (no raw selfie is stored)
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
            logger.info(f"Report '{result.report_id}' persisted successfully (is_demo={result.is_demo}).")
        except Exception as dbe:
            db.rollback()
            logger.error(f"Failed to persist analysis report '{result.report_id}': {dbe}", exc_info=True)

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

    try:
        raw_summary = json.loads(report.raw_data_json or "{}")
    except Exception:
        raw_summary = {}

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
        raw_data_summary=raw_summary
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
    
    try:
        # Unlink any journal entries associated with this report
        journal_entries = db.query(JournalEntryDB).filter(JournalEntryDB.report_id == report_id).all()
        for je in journal_entries:
            je.report_id = None

        db.delete(report)
        db.commit()
        logger.info(f"Report '{report_id}' and associated references deleted.")
        return {"message": f"Report '{report_id}' deleted successfully.", "deleted_id": report_id}
    except Exception as e:
        db.rollback()
        logger.error(f"Error deleting report '{report_id}': {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete report."
        )
