import io
from PIL import Image
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def make_test_photo() -> bytes:
    buf = io.BytesIO()
    img = Image.new("RGB", (200, 200), color=(240, 220, 210))
    img.save(buf, format="JPEG")
    return buf.getvalue()

def test_complete_end_to_end_user_journey():
    # 1. Open homepage / Root check
    root_resp = client.get("/")
    assert root_resp.status_code == 200
    assert root_resp.json()["status"] == "online"

    # 2. Check health endpoint
    health_resp = client.get("/api/v1/health")
    assert health_resp.status_code == 200
    health = health_resp.json()
    assert health["database_connected"] is True
    assert health["status"] in ("healthy", "degraded")

    # 3. Upload a valid photo for skin analysis
    photo_bytes = make_test_photo()
    files = {"image": ("my_selfie.jpg", io.BytesIO(photo_bytes), "image/jpeg")}
    data = {"demo": "true", "save_report": "true"}
    analysis_resp = client.post("/api/v1/skin-analysis", files=files, data=data)
    assert analysis_resp.status_code == 200
    report = analysis_resp.json()
    report_id = report["report_id"]
    assert report["is_demo"] is True
    assert report["source"] == "demo_mock"
    assert len(report["metrics"]) > 0

    # 4. Display / retrieve report by ID
    get_rep_resp = client.get(f"/api/v1/skin-analysis/{report_id}")
    assert get_rep_resp.status_code == 200
    retrieved = get_rep_resp.json()
    assert retrieved["report_id"] == report_id
    assert retrieved["skin_type"] == report["skin_type"]

    # 5. Open report history / list reports
    list_rep_resp = client.get("/api/v1/reports")
    assert list_rep_resp.status_code == 200
    reports = list_rep_resp.json()
    assert any(r["report_id"] == report_id for r in reports)

    # 6. Generate a personalized routine from analysis findings
    concerns = [m["key"] for m in report["metrics"] if m["score"] and m["score"] < 70]
    routine_payload = {
        "skin_type": report["skin_type"],
        "primary_concerns": concerns if concerns else ["pores", "moisture"],
        "budget_tier": "moderate",
        "preferences": ["fragrance_free", "cruelty_free"],
        "avoid_ingredients": ["Synthetic Fragrance"],
        "report_id": report_id
    }
    routine_resp = client.post("/api/v1/routine", json=routine_payload)
    assert routine_resp.status_code == 200
    routine = routine_resp.json()
    assert len(routine["morning_steps"]) >= 3
    assert len(routine["evening_steps"]) >= 3
    assert "patch-test" in routine["patch_test_guidelines"].lower()

    # 7. Browse products with filters
    products_resp = client.get("/api/v1/products?skin_type=Combination&max_budget=800")
    assert products_resp.status_code == 200
    products = products_resp.json()
    assert len(products) > 0

    # 8. Match products with explainability
    match_payload = {
        "skin_type": report["skin_type"],
        "concerns": ["pores", "moisture"],
        "max_budget_inr": 600.0,
        "preferences": ["fragrance_free"]
    }
    match_resp = client.post("/api/v1/products/match", json=match_payload)
    assert match_resp.status_code == 200
    matched = match_resp.json()
    assert len(matched) > 0
    assert matched[0]["match_score"] is not None
    assert matched[0]["match_reasons"] is not None

    # 9. Compare products
    comp_ids = [matched[0]["id"]]
    if len(matched) > 1:
        comp_ids.append(matched[1]["id"])
    comp_resp = client.get(f"/api/v1/products/compare?ids={','.join(comp_ids)}")
    assert comp_resp.status_code == 200
    assert len(comp_resp.json()) == len(comp_ids)

    # 10. Create a journal entry linked to this report
    journal_payload = {
        "title": "Post-Analysis Week 1 Observation",
        "notes": "Skin feeling balanced after introducing Niacinamide and sunscreen.",
        "skin_feel": "Good",
        "report_id": report_id,
        "products_used": ["Gentle Hydrating Cleanser", "Ultra-Light Invisible Fluid Sunscreen"]
    }
    journal_resp = client.post("/api/v1/journal", json=journal_payload)
    assert journal_resp.status_code == 200
    entry = journal_resp.json()
    entry_id = entry["id"]
    assert entry["report_summary"] is not None
    assert entry["report_summary"]["skin_type"] == report["skin_type"]

    # 11. Retrieve journal entries
    list_journal = client.get("/api/v1/journal")
    assert list_journal.status_code == 200
    entries = list_journal.json()
    assert any(e["id"] == entry_id for e in entries)

    # 12. Delete the journal entry
    del_entry = client.delete(f"/api/v1/journal/{entry_id}")
    assert del_entry.status_code == 200

    # 13. Delete the analysis report
    del_rep = client.delete(f"/api/v1/reports/{report_id}")
    assert del_rep.status_code == 200

    # 14. Confirm report is removed
    confirm_del = client.get(f"/api/v1/skin-analysis/{report_id}")
    assert confirm_del.status_code == 404
