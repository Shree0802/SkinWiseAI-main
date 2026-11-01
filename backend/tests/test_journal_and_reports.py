from fastapi.testclient import TestClient
from app.main import app
from app.services.youcam_client import youcam_client
from app.models.db_models import AnalysisReportDB
from app.database import SessionLocal
import json

client = TestClient(app)

def test_journal_crud_flow():
    # 1. Create a journal entry
    payload = {
        "title": "Day 1 Routine Check",
        "notes": "Skin felt refreshed, no irritation from gentle cleanser.",
        "skin_feel": "Good",
        "products_used": ["Gentle Hydrating Cleanser", "Ultra-Light Fluid Sunscreen"]
    }
    create_resp = client.post("/api/v1/journal", json=payload)
    assert create_resp.status_code == 200
    entry = create_resp.json()
    entry_id = entry["id"]
    assert entry["title"] == payload["title"]
    assert entry["skin_feel"] == "Good"

    # 2. List journal entries
    list_resp = client.get("/api/v1/journal")
    assert list_resp.status_code == 200
    entries = list_resp.json()
    assert any(e["id"] == entry_id for e in entries)

    # 3. Delete journal entry
    del_resp = client.delete(f"/api/v1/journal/{entry_id}")
    assert del_resp.status_code == 200

    # 4. Confirm deleted
    list_after = client.get("/api/v1/journal").json()
    assert not any(e["id"] == entry_id for e in list_after)

def test_report_creation_linking_and_deletion():
    # 1. Directly insert a report
    db = SessionLocal()
    demo_report = youcam_client.generate_demo_analysis()
    db_report = AnalysisReportDB(
        id=demo_report.report_id,
        created_at=demo_report.created_at,
        skin_type=demo_report.skin_type,
        skin_age=demo_report.skin_age,
        overall_score=demo_report.overall_score,
        metrics_json=json.dumps([m.model_dump() for m in demo_report.metrics]),
        summary=demo_report.summary,
        is_demo=True,
        source="demo_mock",
        raw_data_json="{}"
    )
    db.add(db_report)
    db.commit()
    db.close()

    # 2. Link report to a new journal entry
    j_payload = {
        "title": "Scan Followup",
        "notes": "Reviewing scan results",
        "skin_feel": "Good",
        "report_id": demo_report.report_id,
        "products_used": ["Niacinamide"]
    }
    j_resp = client.post("/api/v1/journal", json=j_payload)
    assert j_resp.status_code == 200
    j_entry = j_resp.json()
    assert j_entry["report_summary"] is not None
    assert j_entry["report_summary"]["skin_type"] == demo_report.skin_type

    # 3. Fetch report via endpoint
    rep_resp = client.get(f"/api/v1/skin-analysis/{demo_report.report_id}")
    assert rep_resp.status_code == 200

    # 4. Delete the report
    del_rep_resp = client.delete(f"/api/v1/reports/{demo_report.report_id}")
    assert del_rep_resp.status_code == 200

    # 5. Confirm report deleted
    rep_after = client.get(f"/api/v1/skin-analysis/{demo_report.report_id}")
    assert rep_after.status_code == 404

    # 6. Clean up journal entry
    client.delete(f"/api/v1/journal/{j_entry['id']}")
