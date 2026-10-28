import json
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.schemas import JournalEntryCreate, JournalEntryResponse
from app.models.db_models import JournalEntryDB, AnalysisReportDB

router = APIRouter(tags=["Skin Journal"])

@router.post("/journal", response_model=JournalEntryResponse)
def create_journal_entry(entry: JournalEntryCreate, db: Session = Depends(get_db)):
    db_entry = JournalEntryDB(
        report_id=entry.report_id,
        title=entry.title,
        notes=entry.notes,
        skin_feel=entry.skin_feel or "Good",
        products_used_json=json.dumps(entry.products_used)
    )
    db.add(db_entry)
    db.commit()
    db.refresh(db_entry)

    report_summary = None
    if db_entry.report_id:
        report = db.query(AnalysisReportDB).filter(AnalysisReportDB.id == db_entry.report_id).first()
        if report:
            report_summary = {
                "skin_type": report.skin_type,
                "overall_score": report.overall_score,
                "created_at": report.created_at,
                "is_demo": report.is_demo
            }

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
            report = db.query(AnalysisReportDB).filter(AnalysisReportDB.id == e.report_id).first()
            if report:
                report_summary = {
                    "skin_type": report.skin_type,
                    "overall_score": report.overall_score,
                    "created_at": report.created_at,
                    "is_demo": report.is_demo
                }

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
    
    db.delete(entry)
    db.commit()
    return {"message": f"Journal entry '{entry_id}' deleted successfully.", "deleted_id": entry_id}
