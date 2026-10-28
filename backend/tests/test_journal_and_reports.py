from fastapi.testclient import TestClient
from app.main import app

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
