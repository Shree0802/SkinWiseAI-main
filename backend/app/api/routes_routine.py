from fastapi import APIRouter
from app.models.schemas import RoutineRequest, RoutineResponse
from app.services.routine_engine import routine_engine

router = APIRouter(tags=["Routine Builder"])

@router.post("/routine", response_model=RoutineResponse)
def build_personalized_routine(request: RoutineRequest):
    return routine_engine.generate_routine(request)
