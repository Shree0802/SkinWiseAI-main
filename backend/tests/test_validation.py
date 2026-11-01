import io
from PIL import Image
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def create_test_image(format="JPEG", size=(100, 100), color="white") -> bytes:
    """Helper creating genuine decodable image bytes in memory."""
    buf = io.BytesIO()
    img = Image.new("RGB", size, color=color)
    img.save(buf, format=format)
    return buf.getvalue()

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

def test_upload_corrupted_image_content():
    """
    Verifies that files with image/jpeg MIME type but invalid/corrupted
    image bytes are rejected by content validation.
    """
    corrupted_bytes = b"not a real image payload even if declared as jpeg"
    files = {"image": ("selfie.jpg", io.BytesIO(corrupted_bytes), "image/jpeg")}
    response = client.post("/api/v1/skin-analysis", files=files)
    assert response.status_code == 400
    assert "invalid image content" in response.json()["detail"].lower()

def test_upload_demo_mode_allowed():
    # Valid decodable JPEG byte payload
    jpeg_bytes = create_test_image(format="JPEG")
    files = {"image": ("selfie.jpg", io.BytesIO(jpeg_bytes), "image/jpeg")}
    data = {"demo": "true"}
    response = client.post("/api/v1/skin-analysis", files=files, data=data)
    assert response.status_code == 200
    res_data = response.json()
    assert res_data["is_demo"] is True
    assert res_data["source"] == "demo_mock"
    assert len(res_data["metrics"]) > 0
    assert res_data["report_id"] is not None
