from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class SkinMetric(BaseModel):
    key: str
    label: str
    score: Optional[float] = None
    raw_score: Optional[float] = None
    severity: Optional[str] = None
    explanation: str
    mask_url: Optional[str] = None

class SkinAnalysisResult(BaseModel):
    report_id: str
    created_at: str
    skin_type: Optional[str] = None
    skin_age: Optional[int] = None
    overall_score: Optional[float] = None
    metrics: List[SkinMetric] = []
    summary: str
    is_demo: bool = False
    source: str = "youcam_api"  # "youcam_api" or "demo_mock"
    disclaimer: str = (
        "Cosmetic information only. Not a medical diagnosis or clinical evaluation. "
        "For skin health conditions or persistent symptoms, consult a certified dermatologist."
    )
    raw_data_summary: Optional[Dict[str, Any]] = None

class AnalysisReportSummary(BaseModel):
    report_id: str
    created_at: str
    skin_type: Optional[str] = None
    overall_score: Optional[float] = None
    is_demo: bool = False
    concerns_highlighted: List[str] = []

class RoutineStep(BaseModel):
    step_number: int
    phase: str  # "morning" or "evening"
    step_name: str
    product_category: str
    rationale: str
    recommended_ingredients: List[str] = []
    ingredients_to_avoid: List[str] = []

class RoutineRequest(BaseModel):
    skin_type: Optional[str] = None
    primary_concerns: List[str] = []
    budget_tier: Optional[str] = "moderate"  # "budget", "moderate", "premium"
    preferences: List[str] = []  # "fragrance_free", "vegan", "cruelty_free", "minimalist"
    avoid_ingredients: List[str] = []
    report_id: Optional[str] = None

class RoutineResponse(BaseModel):
    routine_id: str
    created_at: str
    target_skin_type: str
    target_concerns: List[str]
    morning_steps: List[RoutineStep]
    evening_steps: List[RoutineStep]
    patch_test_guidelines: str
    medical_disclaimer: str

class ProductItem(BaseModel):
    id: str
    name: str
    brand: str
    category: str
    price_inr: float
    description: str
    key_ingredients: List[str] = []
    all_ingredients: List[str] = []
    suitability_tags: List[str] = []
    target_concerns: List[str] = []
    is_fragrance_free: bool = False
    is_cruelty_free: bool = True
    is_sample_catalogue: bool = True
    verified_url: Optional[str] = None
    match_score: Optional[float] = None
    match_reasons: Optional[List[str]] = None

class ProductMatchRequest(BaseModel):
    skin_type: Optional[str] = None
    concerns: List[str] = []
    max_budget_inr: Optional[float] = None
    categories: List[str] = []
    preferences: List[str] = []
    avoid_ingredients: List[str] = []

class JournalEntryCreate(BaseModel):
    report_id: Optional[str] = None
    title: str
    notes: Optional[str] = None
    skin_feel: Optional[str] = "Good"
    products_used: List[str] = []

class JournalEntryResponse(BaseModel):
    id: str
    created_at: str
    report_id: Optional[str] = None
    title: str
    notes: Optional[str] = None
    skin_feel: Optional[str] = None
    products_used: List[str] = []
    report_summary: Optional[Dict[str, Any]] = None

class HealthResponse(BaseModel):
    status: str
    app_name: str
    environment: str
    youcam_configured: bool
    database_connected: bool
    version: str = "1.0.0"
