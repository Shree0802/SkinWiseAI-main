from app.services.catalog_service import catalog_service
from app.models.schemas import ProductMatchRequest

def test_get_all_products():
    products = catalog_service.get_all_products()
    assert len(products) >= 10
    # Every item must have INR price and sample catalogue tag
    for p in products:
        assert p.price_inr > 0
        assert p.is_sample_catalogue is True

def test_filter_by_budget():
    budget_500 = catalog_service.get_all_products(max_budget=500.0)
    assert len(budget_500) > 0
    for p in budget_500:
        assert p.price_inr <= 500.0

def test_explainable_product_matching():
    req = ProductMatchRequest(
        skin_type="Oily",
        concerns=["acne", "pores"],
        max_budget_inr=700.0,
        preferences=["fragrance_free"]
    )
    matches = catalog_service.match_products(req)
    assert len(matches) > 0
    top_match = matches[0]
    assert top_match.match_score is not None
    assert top_match.match_score > 50
    assert top_match.match_reasons is not None
    assert len(top_match.match_reasons) > 0
    # Price must be within budget
    assert top_match.price_inr <= 700.0

def test_product_comparison():
    products = catalog_service.get_all_products()
    ids = [products[0].id, products[1].id]
    compared = catalog_service.compare_products(ids)
    assert len(compared) == 2
    assert compared[0].id == ids[0]
    assert compared[1].id == ids[1]
