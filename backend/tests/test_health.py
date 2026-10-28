from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["app"] == "SkinWise AI"
    assert data["status"] == "online"
    assert data["api_v1"] == "/api/v1"

def test_health_endpoint():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] in ("healthy", "degraded")
    assert "youcam_configured" in data
    assert "database_connected" in data
    assert data["database_connected"] is True
