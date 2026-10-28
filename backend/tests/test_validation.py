import io
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_upload_invalid_mime_type():
    file_content = b"fake pdf content"
    files = {"image": ("document.pdf", io.BytesIO(file_content), "application/pdf")}
    response = client.post("/api/v1/skin-analysis", files=files)
    assert response.status_code == 400
    assert "Unsupported file type" in response.json()["detail"]

def test_upload_empty_file():
    empty_content = b""
    files = {"image": ("empty.jpg", io.BytesIO(empty_content), "image/jpeg")}
    response = client.post("/api/v1/skin-analysis", files=files)
    assert response.status_code == 400
    assert "empty" in response.json()["detail"].lower()

def test_upload_demo_mode_allowed():
    # Valid JPEG byte header
    jpeg_bytes = b"\xff\xd8\xff\xe0" + b"\x00" * 200
    files = {"image": ("selfie.jpg", io.BytesIO(jpeg_bytes), "image/jpeg")}
    data = {"demo": "true"}
    response = client.post("/api/v1/skin-analysis", files=files, data=data)
    assert response.status_code == 200
    res_data = response.json()
    assert res_data["is_demo"] is True
    assert res_data["source"] == "demo_mock"
    assert len(res_data["metrics"]) > 0
    assert res_data["report_id"] is not None
