from fastapi import APIRouter
from app.api.routes_health import router as health_router
from app.api.routes_analysis import router as analysis_router
from app.api.routes_routine import router as routine_router
from app.api.routes_products import router as products_router
from app.api.routes_journal import router as journal_router

api_router = APIRouter()
api_router.include_router(health_router)
api_router.include_router(analysis_router)
api_router.include_router(routine_router)
api_router.include_router(products_router)
api_router.include_router(journal_router)
