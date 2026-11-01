from fastapi.testclient import TestClient
from app.main import app
from app.config import settings

client = TestClient(app)

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["app"] == "SkinWise AI"
    assert data["status"] == "online"
    assert data["api_v1"] == "/api/v1"
    assert "environment" in data

def test_health_endpoint():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] in ("healthy", "degraded")
    assert "youcam_configured" in data
    assert "database_connected" in data
    assert data["database_connected"] is True
    assert "service_mode" in data
    assert data["service_mode"] in ("live_api", "demo_fallback", "unconfigured")
    assert "database_type" in data
    assert data["version"] == "1.0.0"

def test_cors_configuration():
    origins = settings.get_cors_origins()
    assert "https://skin-wise-ai-main.vercel.app" in origins
    assert "http://localhost:5173" in origins
