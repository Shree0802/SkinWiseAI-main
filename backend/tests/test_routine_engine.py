from app.services.routine_engine import routine_engine
from app.models.schemas import RoutineRequest

def test_routine_engine_oily_acne():
    req = RoutineRequest(
        skin_type="Oily",
        primary_concerns=["acne", "pores", "oiliness"],
        budget_tier="budget",
        preferences=["fragrance_free"],
        avoid_ingredients=["fragrance"]
    )
    routine = routine_engine.generate_routine(req)
    assert routine.target_skin_type == "Oily"
    assert len(routine.morning_steps) >= 3
    assert len(routine.evening_steps) >= 3

    # Morning should include gentle/purifying cleanser and broad spectrum sunscreen
    am_categories = [s.product_category for s in routine.morning_steps]
    assert "Cleanser" in am_categories
    assert "Sunscreen" in am_categories

    # Evening should have clarifying / acne-targeted treatment
    pm_names = " ".join([s.step_name for s in routine.evening_steps])
    assert "BHA" in pm_names or "Azelaic" in pm_names

    # Verify medical disclaimer and patch-test guidelines are present
    assert "disclaimer" in routine.medical_disclaimer.lower()
    assert "patch-test" in routine.patch_test_guidelines.lower()

def test_routine_engine_dry_mature():
    req = RoutineRequest(
        skin_type="Dry",
        primary_concerns=["wrinkles", "moisture"],
        budget_tier="moderate"
    )
    routine = routine_engine.generate_routine(req)
    assert routine.target_skin_type == "Dry"
    pm_names = " ".join([s.step_name for s in routine.evening_steps])
    assert "Retinoid" in pm_names or "Retinal" in pm_names
    assert "Repair Cream" in pm_names
