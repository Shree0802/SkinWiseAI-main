import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from app.services.youcam_client import YouCamClient, determine_severity, SUPPORTED_SD_ACTIONS
from app.config import settings

def test_build_task_payload_pure_sd_and_valid_actions():
    """
    Validates YouCam Skin Analysis task payload:
    - dst_actions contains only valid documented strings.
    - No numeric values (4, 8, 9) are sent where strings are expected.
    - No mixing of SD and HD (no 'hd_' prefixes in SD mode).
    - Unaccepted legacy strings ('spots', 'dark_circles', 'eyebags') are replaced with
      the documented actions ('age_spot', 'dark_circle', 'eye_bag').
    - miniserver_args contains valid SD configuration without HD-pore background parameters.
    """
    client = YouCamClient()
    payload = client.build_task_payload("file_test_456")

    assert payload["src_file_id"] == "file_test_456"
    assert "dst_actions" in payload
    dst_actions = payload["dst_actions"]

    # 1. Assert all actions are strings, non-empty, and no integers
    assert len(dst_actions) > 0
    for action in dst_actions:
        assert isinstance(action, str), f"Expected string in dst_actions, got: {type(action)}"
        assert action.strip() != "", "Empty action string detected"
        assert not action.isdigit(), f"Numeric string detected: {action}"

    # 2. Assert no numeric values like 4, 8, 9
    assert 4 not in dst_actions
    assert 8 not in dst_actions
    assert 9 not in dst_actions

    # 3. Assert unaccepted legacy names are NOT present
    assert "spots" not in dst_actions, "'spots' was rejected by YouCam; must use 'age_spot'"
    assert "dark_circles" not in dst_actions, "'dark_circles' was rejected; must use 'dark_circle'"
    assert "eyebags" not in dst_actions, "'eyebags' was rejected; must use 'eye_bag'"

    # 4. Assert verified replacements ARE present
    assert "age_spot" in dst_actions
    assert "dark_circle" in dst_actions
    assert "eye_bag" in dst_actions

    # 5. Assert strict SD mode: NO HD actions mixed in
    for action in dst_actions:
        assert not action.startswith("hd_"), f"HD action '{action}' mixed into SD request!"

    # 6. Assert all actions match documented SUPPORTED_SD_ACTIONS
    for action in dst_actions:
        assert action in SUPPORTED_SD_ACTIONS, f"Undocumented action '{action}' in payload"

    # 7. Check miniserver_args
    assert "miniserver_args" in payload
    miniserver_args = payload["miniserver_args"]
    assert miniserver_args.get("enable_mask_overlay") is True
    # Ensure no HD pore background parameters are mixed in
    assert "enable_dark_background_hd_pore" not in miniserver_args

def test_determine_severity():
    assert determine_severity(None) is None
    assert determine_severity(85) == "Optimal"
    assert determine_severity(70) == "Mild Concern"
    assert determine_severity(50) == "Moderate Concern"
    assert determine_severity(30) == "Needs Targeted Care"

def test_youcam_client_not_configured_by_default():
    client = YouCamClient()
    # When api_key is empty or dummy, is_configured must be False
    client.api_key = ""
    assert client.is_configured is False
    client.api_key = "YOUR_YOUCAM_API_KEY_HERE"
    assert client.is_configured is False

@pytest.mark.asyncio
async def test_request_file_upload_success():
    client = YouCamClient()
    client.api_key = "test_key_123"

    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_resp.json.return_value = {
        "status": 200,
        "data": {
            "files": [
                {
                    "content_type": "image/jpeg",
                    "file_name": "selfie.jpg",
                    "file_id": "test_file_id_abc",
                    "requests": [
                        {
                            "method": "PUT",
                            "url": "https://upload.example.com/signed-slot-1"
                        }
                    ]
                }
            ]
        }
    }

    with patch("httpx.AsyncClient.post", new_callable=AsyncMock) as mock_post:
        mock_post.return_value = mock_resp
        file_id, upload_url = await client.request_file_upload("selfie.jpg", 1024, "image/jpeg")
        assert file_id == "test_file_id_abc"
        assert upload_url == "https://upload.example.com/signed-slot-1"

@pytest.mark.asyncio
async def test_create_task_success():
    client = YouCamClient()
    client.api_key = "test_key_123"

    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_resp.json.return_value = {
        "status": 200,
        "data": {
            "task_id": "task_xyz_789"
        }
    }

    with patch("httpx.AsyncClient.post", new_callable=AsyncMock) as mock_post:
        mock_post.return_value = mock_resp
        task_id = await client.create_skin_analysis_task("test_file_id_abc")
        assert task_id == "task_xyz_789"

        # Verify posted payload
        called_kwargs = mock_post.call_args.kwargs
        json_body = called_kwargs.get("json", {})
        assert json_body["src_file_id"] == "test_file_id_abc"
        assert "age_spot" in json_body["dst_actions"]
        assert "dark_circle" in json_body["dst_actions"]
        assert "eye_bag" in json_body["dst_actions"]
        assert "spots" not in json_body["dst_actions"]
        assert "dark_circles" not in json_body["dst_actions"]
        assert "eyebags" not in json_body["dst_actions"]

@pytest.mark.asyncio
async def test_poll_task_success_after_running():
    client = YouCamClient()
    client.api_key = "test_key_123"
    client.poll_interval = 0.01

    running_resp = MagicMock()
    running_resp.status_code = 200
    running_resp.json.return_value = {"status": 200, "data": {"task_status": "running"}}

    success_resp = MagicMock()
    success_resp.status_code = 200
    success_resp.json.return_value = {
        "status": 200,
        "data": {
            "task_status": "success",
            "results": {
                "skin_type": "combination",
                "skin_age": 27,
                "overall_score": {"ui_score": 84, "raw_score": 82.5},
                "concerns": {
                    "wrinkles": {"ui_score": 88, "raw_score": 86.4},
                    "pores": {"ui_score": 72, "raw_score": 70.1}
                }
            }
        }
    }

    with patch("httpx.AsyncClient.get", new_callable=AsyncMock) as mock_get:
        mock_get.side_effect = [running_resp, success_resp]
        result_data = await client.poll_task_result("task_xyz_789")
        assert result_data["task_status"] == "success"
        assert "results" in result_data

@pytest.mark.asyncio
async def test_poll_task_error_handling():
    client = YouCamClient()
    client.api_key = "test_key_123"
    client.poll_interval = 0.01

    error_resp = MagicMock()
    error_resp.status_code = 200
    error_resp.json.return_value = {
        "status": 200,
        "data": {
            "task_status": "error",
            "error_message": "Face not detected in image"
        }
    }

    with patch("httpx.AsyncClient.get", new_callable=AsyncMock) as mock_get:
        mock_get.return_value = error_resp
        with pytest.raises(RuntimeError, match="Face not detected"):
            await client.poll_task_result("task_xyz_789")

def test_normalize_results_without_fabrication():
    client = YouCamClient()
    raw_api_payload = {
        "results": {
            "skin_type": "oily",
            "skin_age": 24,
            "overall_score": {"ui_score": 79},
            "concerns": {
                "pores": {
                    "ui_score": 64.0,
                    "raw_score": 62.3,
                    "mask_urls": {"alpha_mask": "https://example.com/mask-pore.png"}
                },
                "oiliness": {
                    "ui_score": 52.0,
                    "raw_score": 50.1
                }
            }
        }
    }

    result = client.normalize_results(raw_api_payload)
    assert result.is_demo is False
    assert result.skin_type == "Oily"
    assert result.skin_age == 24
    assert result.overall_score == 79.0
    
    # We returned pores and oiliness in the payload; verify only returned metrics exist
    metric_keys = [m.key for m in result.metrics]
    assert "pores" in metric_keys
    assert "oiliness" in metric_keys
    # Unassessed metrics like wrinkles or dark_circles must NOT be fabricated
    assert "wrinkles" not in metric_keys
    assert "dark_circles" not in metric_keys

    # Check mask url extraction
    pore_metric = next(m for m in result.metrics if m.key == "pores")
    assert pore_metric.mask_url == "https://example.com/mask-pore.png"
    assert pore_metric.severity == "Moderate Concern"

def test_normalize_results_with_age_spot_and_dark_circle():
    """
    Verifies that real YouCam response payloads returning 'age_spot', 'dark_circle',
    and 'eye_bag' correctly normalize into SkinMetric models with UI keys 'spots',
    'dark_circles', and 'eyebags'.
    """
    client = YouCamClient()
    payload = {
        "results": {
            "skin_type": "combination",
            "skin_age": 25,
            "overall_score": 83.0,
            "concerns": {
                "age_spot": {
                    "ui_score": 88.0,
                    "raw_score": 86.5,
                    "mask_urls": {"alpha_mask": "https://example.com/spot.png"}
                },
                "dark_circle": {
                    "ui_score": 71.0,
                    "raw_score": 69.2
                },
                "eye_bag": {
                    "ui_score": 75.0,
                    "raw_score": 74.0
                }
            }
        }
    }
    result = client.normalize_results(payload)
    metric_keys = {m.key: m for m in result.metrics}

    assert "spots" in metric_keys
    assert metric_keys["spots"].score == 88.0
    assert metric_keys["spots"].mask_url == "https://example.com/spot.png"
    assert metric_keys["spots"].severity == "Optimal"

    assert "dark_circles" in metric_keys
    assert metric_keys["dark_circles"].score == 71.0
    assert metric_keys["dark_circles"].severity == "Mild Concern"

    assert "eyebags" in metric_keys
    assert metric_keys["eyebags"].score == 75.0
    assert metric_keys["eyebags"].severity == "Mild Concern"
