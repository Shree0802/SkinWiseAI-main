import json
import logging
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.schemas import JournalEntryCreate, JournalEntryResponse
from app.models.db_models import JournalEntryDB, AnalysisReportDB

logger = logging.getLogger("skinwise.journal")
router = APIRouter(tags=["Skin Journal"])

@router.post("/journal", response_model=JournalEntryResponse)
def create_journal_entry(entry: JournalEntryCreate, db: Session = Depends(get_db)):
    if not entry.title or not entry.title.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Journal entry title is required."
        )

    db_entry = JournalEntryDB(
        report_id=entry.report_id,
        title=entry.title.strip(),
        notes=entry.notes.strip() if entry.notes else None,
        skin_feel=entry.skin_feel or "Good",
        products_used_json=json.dumps(entry.products_used)
    )

    try:
        db.add(db_entry)
        db.commit()
        db.refresh(db_entry)
        logger.info(f"Journal entry '{db_entry.id}' created successfully.")
    except Exception as e:
        db.rollback()
        logger.error(f"Error persisting journal entry: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create journal observation."
        )

    report_summary = None
    if db_entry.report_id:
        try:
            report = db.query(AnalysisReportDB).filter(AnalysisReportDB.id == db_entry.report_id).first()
            if report:
                report_summary = {
                    "skin_type": report.skin_type,
                    "overall_score": report.overall_score,
                    "created_at": report.created_at,
                    "is_demo": report.is_demo
                }
        except Exception as e:
            logger.warning(f"Error loading report summary for journal entry '{db_entry.id}': {e}")

    return JournalEntryResponse(
        id=db_entry.id,
        created_at=db_entry.created_at,
        report_id=db_entry.report_id,
        title=db_entry.title,
        notes=db_entry.notes,
        skin_feel=db_entry.skin_feel,
        products_used=entry.products_used,
        report_summary=report_summary
    )

@router.get("/journal", response_model=List[JournalEntryResponse])
def get_journal_entries(db: Session = Depends(get_db)):
    entries = db.query(JournalEntryDB).order_by(JournalEntryDB.created_at.desc()).all()
    results = []
    for e in entries:
        products = []
        try:
            products = json.loads(e.products_used_json or "[]")
        except Exception:
            pass

        report_summary = None
        if e.report_id:
            try:
                report = db.query(AnalysisReportDB).filter(AnalysisReportDB.id == e.report_id).first()
                if report:
                    report_summary = {
                        "skin_type": report.skin_type,
                        "overall_score": report.overall_score,
                        "created_at": report.created_at,
                        "is_demo": report.is_demo
                    }
            except Exception:
                pass

        results.append(JournalEntryResponse(
            id=e.id,
            created_at=e.created_at,
            report_id=e.report_id,
            title=e.title,
            notes=e.notes,
            skin_feel=e.skin_feel,
            products_used=products,
            report_summary=report_summary
        ))
    return results

@router.delete("/journal/{entry_id}")
def delete_journal_entry(entry_id: str, db: Session = Depends(get_db)):
    entry = db.query(JournalEntryDB).filter(JournalEntryDB.id == entry_id).first()
    if not entry:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Journal entry '{entry_id}' not found.")
    
    try:
        db.delete(entry)
        db.commit()
        logger.info(f"Journal entry '{entry_id}' deleted successfully.")
        return {"message": f"Journal entry '{entry_id}' deleted successfully.", "deleted_id": entry_id}
    except Exception as e:
        db.rollback()
        logger.error(f"Error deleting journal entry '{entry_id}': {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete journal entry."
        )
