from fastapi import APIRouter, Query
from typing import List, Optional
from app.models.schemas import ProductItem, ProductMatchRequest
from app.services.catalog_service import catalog_service

router = APIRouter(tags=["Smart Shopping"])

@router.get("/products", response_model=List[ProductItem])
def get_products(
    category: Optional[str] = Query(None, description="Product category filter"),
    skin_type: Optional[str] = Query(None, description="Skin type filter"),
    max_budget: Optional[float] = Query(None, description="Maximum budget in INR")
):
    return catalog_service.get_all_products(
        category=category,
        skin_type=skin_type,
        max_budget=max_budget
    )

@router.post("/products/match", response_model=List[ProductItem])
def match_products(request: ProductMatchRequest):
    return catalog_service.match_products(request)

@router.get("/products/compare", response_model=List[ProductItem])
def compare_products(ids: str = Query(..., description="Comma separated list of product IDs")):
    id_list = [i.strip() for i in ids.split(",") if i.strip()]
    return catalog_service.compare_products(id_list)
