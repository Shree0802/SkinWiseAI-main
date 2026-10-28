from sqlalchemy import Column, String, Integer, Float, Boolean, Text
from datetime import datetime, timezone
import uuid
from app.database import Base

def utc_now_iso():
    return datetime.now(timezone.utc).isoformat()

class AnalysisReportDB(Base):
    __tablename__ = "analysis_reports"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    created_at = Column(String, default=utc_now_iso)
    skin_type = Column(String, nullable=True)
    skin_age = Column(Integer, nullable=True)
    overall_score = Column(Float, nullable=True)
    metrics_json = Column(Text, nullable=False, default="[]")
    summary = Column(Text, nullable=False, default="")
    is_demo = Column(Boolean, default=False)
    source = Column(String, default="youcam_api")
    raw_data_json = Column(Text, nullable=True)

class JournalEntryDB(Base):
    __tablename__ = "journal_entries"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    created_at = Column(String, default=utc_now_iso)
    report_id = Column(String, nullable=True)
    title = Column(String, nullable=False)
    notes = Column(Text, nullable=True)
    skin_feel = Column(String, default="Good")
    products_used_json = Column(Text, default="[]")

class ProductDB(Base):
    __tablename__ = "products"

    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    brand = Column(String, nullable=False)
    category = Column(String, nullable=False)
    price_inr = Column(Float, nullable=False)
    description = Column(Text, nullable=False)
    key_ingredients_json = Column(Text, default="[]")
    all_ingredients_json = Column(Text, default="[]")
    suitability_tags_json = Column(Text, default="[]")
    target_concerns_json = Column(Text, default="[]")
    is_fragrance_free = Column(Boolean, default=False)
    is_cruelty_free = Column(Boolean, default=True)
    is_sample_catalogue = Column(Boolean, default=True)
    verified_url = Column(String, nullable=True)
