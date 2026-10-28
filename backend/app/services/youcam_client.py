import asyncio
import logging
import uuid
from datetime import datetime, timezone
from typing import Dict, Any, Optional, Tuple, List
import httpx

from app.config import settings
from app.models.schemas import SkinAnalysisResult, SkinMetric

logger = logging.getLogger("skinwise.youcam")

# Officially verified Standard Definition (SD) dst_actions for YouCam Skin Analysis API v2.1
# Note: Never mix with HD actions (hd_*) in the same request.
SUPPORTED_SD_ACTIONS: List[str] = [
    "wrinkle",
    "pore",
    "texture",
    "acne",
    "age_spot",     # Replaced invalid "spots" (which triggered value 4 rejected)
    "redness",
    "oiliness",
    "moisture",
    "dark_circle",  # Replaced invalid "dark_circles" (which triggered value 8 rejected)
    "eye_bag",      # Replaced invalid "eyebags" (which triggered value 9 rejected)
    "skin_type",
    "radiance",
    "firmness"
]

METRIC_DEFINITIONS = {
    "wrinkle": {
        "key": "wrinkles",
        "label": "Wrinkles & Fine Lines",
        "explanation": "Evaluates depth and prevalence of facial expression lines and creases."
    },
    "pore": {
        "key": "pores",
        "label": "Pores & Surface Smoothness",
        "explanation": "Analyzes the visibility and dilation of facial pores."
    },
    "texture": {
        "key": "texture",
        "label": "Skin Texture & Uniformity",
        "explanation": "Assesses skin surface smoothness and cellular micro-relief."
    },
    "acne": {
        "key": "acne",
        "label": "Acne & Blemishes",
        "explanation": "Identifies active papules, pustules, and inflammatory breakouts."
    },
    "age_spot": {
        "key": "spots",
        "label": "Spots & Hyperpigmentation",
        "explanation": "Measures UV spots, age spots, and uneven melanin deposition."
    },
    "redness": {
        "key": "redness",
        "label": "Redness & Erythema",
        "explanation": "Detects micro-vascular flush and surface sensitivity."
    },
    "oiliness": {
        "key": "oiliness",
        "label": "Sebum & Oiliness",
        "explanation": "Evaluates surface reflection indicating excess sebum secretion."
    },
    "moisture": {
        "key": "moisture",
        "label": "Hydration & Moisture",
        "explanation": "Estimates skin barrier moisture balance and epidermal hydration."
    },
    "dark_circle": {
        "key": "dark_circles",
        "label": "Dark Eye Circles",
        "explanation": "Measures infra-orbital hyperpigmentation under the lower eyelid."
    },
    "eye_bag": {
        "key": "eyebags",
        "label": "Under-Eye Puffiness & Bags",
        "explanation": "Analyzes lower orbital volume variation and puffiness."
    },
    "firmness": {
        "key": "firmness",
        "label": "Skin Firmness & Elasticity",
        "explanation": "Assesses structural skin tautness and contour support."
    },
    "radiance": {
        "key": "radiance",
        "label": "Radiance & Glow",
        "explanation": "Measures overall skin luminosity and healthy optical reflectivity."
    }
}

def determine_severity(score: Optional[float]) -> Optional[str]:
    """
    Derives user-friendly cosmetic severity categories based on 0-100 scores.
    Scores above 75 indicate optimal health/low concern;
    Scores 50-74 indicate mild to moderate concern;
    Scores below 50 indicate areas that benefit from targeted care.
    """
    if score is None:
        return None
    if score >= 80:
        return "Optimal"
    elif score >= 65:
        return "Mild Concern"
    elif score >= 45:
        return "Moderate Concern"
    else:
        return "Needs Targeted Care"

class YouCamClient:
    def __init__(self):
        self.api_key = settings.YOUCAM_API_KEY
        self.base_url = settings.YOUCAM_API_BASE_URL.rstrip("/")
        self.poll_interval = settings.YOUCAM_POLL_INTERVAL
        self.poll_timeout = settings.YOUCAM_POLL_TIMEOUT

    @property
    def is_configured(self) -> bool:
        return bool(self.api_key and self.api_key.strip() and self.api_key != "YOUR_YOUCAM_API_KEY_HERE")

    def _get_headers(self) -> Dict[str, str]:
        # YouCam API expects Bearer authorization header
        return {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

    async def request_file_upload(self, file_name: str, file_size: int, content_type: str) -> Tuple[str, str]:
        """
        Calls POST /s2s/v2.0/file to obtain pre-signed PUT upload URL and file_id.
        """
        url = f"{self.base_url}/s2s/v2.0/file"
        payload = {
            "files": [
                {
                    "content_type": content_type,
                    "file_name": file_name,
                    "file_size": file_size
                }
            ]
        }
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(url, headers=self._get_headers(), json=payload)
            if response.status_code in (401, 403):
                raise PermissionError("YouCam API authentication failed. Verify YOUCAM_API_KEY.")
            if response.status_code != 200:
                raise RuntimeError(f"YouCam File API initialization failed ({response.status_code}): {response.text}")

            data = response.json()
            # Standard YouCam response structure: data.data.files[0] or data.files[0]
            files_list = data.get("data", {}).get("files") or data.get("files")
            if not files_list or len(files_list) == 0:
                raise ValueError("Malformed YouCam response: missing file registration data.")

            file_info = files_list[0]
            file_id = file_info.get("file_id")
            requests = file_info.get("requests", [])
            if not file_id or not requests or "url" not in requests[0]:
                raise ValueError("Malformed YouCam file upload response structure.")

            upload_url = requests[0]["url"]
            return file_id, upload_url

    async def upload_image_binary(self, upload_url: str, image_bytes: bytes, content_type: str) -> None:
        """
        Uploads the binary payload directly to the pre-signed S3 / storage URL.
        """
        async with httpx.AsyncClient(timeout=60.0) as client:
            headers = {"Content-Type": content_type}
            response = await client.put(upload_url, content=image_bytes, headers=headers)
            if response.status_code not in (200, 201):
                raise RuntimeError(f"Binary image upload to signed URL failed with HTTP {response.status_code}")

    def build_task_payload(self, file_id: str) -> Dict[str, Any]:
        """
        Constructs the task creation payload for YouCam Skin Analysis API v2.1.
        Adheres strictly to the official YouCam API specification:
        - Uses pure Standard Definition (SD) actions.
        - Does not mix SD and HD actions (e.g. no 'hd_' prefixes).
        - Replaces unaccepted values (spots -> age_spot, dark_circles -> dark_circle, eyebags -> eye_bag).
        - miniserver_args includes only valid SD flags (enable_mask_overlay=True) without HD-pore background conflicts.
        """
        return {
            "src_file_id": file_id,
            "dst_actions": list(SUPPORTED_SD_ACTIONS),
            "miniserver_args": {
                "enable_mask_overlay": True
            }
        }

    async def create_skin_analysis_task(self, file_id: str) -> str:
        """
        Calls POST /s2s/v2.0/task/skin-analysis to kick off asynchronous AI skin analysis.
        """
        url = f"{self.base_url}/s2s/v2.0/task/skin-analysis"
        payload = self.build_task_payload(file_id)

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(url, headers=self._get_headers(), json=payload)
            if response.status_code in (401, 403):
                raise PermissionError("YouCam task creation authentication failed.")
            if response.status_code not in (200, 201, 202):
                raise RuntimeError(f"YouCam task creation failed ({response.status_code}): {response.text}")

            data = response.json()
            task_id = (
                data.get("data", {}).get("task_id")
                or data.get("task_id")
                or data.get("data", {}).get("id")
            )
            if not task_id:
                raise ValueError("No task_id returned by YouCam Skin Analysis task endpoint.")
            return str(task_id)

    async def poll_task_result(self, task_id: str) -> Dict[str, Any]:
        """
        Periodically polls GET /s2s/v2.0/task/skin-analysis/{task_id} until terminal state.
        """
        url = f"{self.base_url}/s2s/v2.0/task/skin-analysis/{task_id}"
        start_time = asyncio.get_event_loop().time()

        async with httpx.AsyncClient(timeout=30.0) as client:
            while True:
                elapsed = asyncio.get_event_loop().time() - start_time
                if elapsed > self.poll_timeout:
                    raise TimeoutError(f"YouCam Skin Analysis task {task_id} timed out after {self.poll_timeout}s.")

                response = await client.get(url, headers=self._get_headers())
                if response.status_code != 200:
                    raise RuntimeError(f"Error polling YouCam task {task_id}: {response.status_code} {response.text}")

                data = response.json()
                task_data = data.get("data", data)
                task_status = task_data.get("task_status") or task_data.get("status")

                if task_status in ("success", "done", "completed"):
                    return task_data
                elif task_status in ("error", "failed"):
                    error_msg = task_data.get("error_message") or task_data.get("message") or "Unknown YouCam error"
                    raise RuntimeError(f"YouCam task {task_id} failed: {error_msg}")
                elif task_status in ("running", "processing", "pending", "queued"):
                    await asyncio.sleep(self.poll_interval)
                else:
                    logger.warning(f"Unexpected task_status '{task_status}', waiting...")
                    await asyncio.sleep(self.poll_interval)

    def normalize_results(self, raw_data: Dict[str, Any]) -> SkinAnalysisResult:
        """
        Parses actual data fields returned by YouCam Skin AI API into typed SkinAnalysisResult.
        Never invents missing metrics.
        """
        results_container = raw_data.get("results") or raw_data.get("data", {}).get("results") or {}
        
        # Skin type
        skin_type_raw = results_container.get("skin_type")
        skin_type = None
        if isinstance(skin_type_raw, str):
            skin_type = skin_type_raw.capitalize()
        elif isinstance(skin_type_raw, dict):
            skin_type = skin_type_raw.get("type", "").capitalize() or None

        # Skin age
        skin_age = results_container.get("skin_age")
        if skin_age is not None:
            try:
                skin_age = int(skin_age)
            except (ValueError, TypeError):
                skin_age = None

        # Overall score
        overall = results_container.get("overall_score")
        overall_score = None
        if isinstance(overall, dict):
            overall_score = overall.get("ui_score") or overall.get("raw_score")
        elif isinstance(overall, (int, float)):
            overall_score = float(overall)

        # Parse individual metrics
        concerns_dict = results_container.get("concerns", {})
        metrics: List[SkinMetric] = []

        # Iterate over known definitions
        for action_name, meta in METRIC_DEFINITIONS.items():
            concern_data = None
            if action_name in concerns_dict:
                concern_data = concerns_dict[action_name]
            elif meta["key"] in concerns_dict:
                concern_data = concerns_dict[meta["key"]]
            elif action_name == "dark_circle" and "dark_circle_v2" in concerns_dict:
                concern_data = concerns_dict["dark_circle_v2"]
            elif action_name == "age_spot" and ("spot" in concerns_dict or "spots" in concerns_dict):
                concern_data = concerns_dict.get("spot") or concerns_dict.get("spots")
            elif action_name == "eye_bag" and ("eyebag" in concerns_dict or "eyebags" in concerns_dict):
                concern_data = concerns_dict.get("eyebag") or concerns_dict.get("eyebags")
            elif action_name in results_container:
                concern_data = results_container[action_name]
            elif meta["key"] in results_container:
                concern_data = results_container[meta["key"]]

            score_val = None
            raw_score_val = None
            mask_url_val = None

            if isinstance(concern_data, dict):
                score_val = concern_data.get("ui_score")
                if score_val is None and "score" in concern_data:
                    score_val = concern_data.get("score")
                raw_score_val = concern_data.get("raw_score")
                
                # Check for mask overlay URL
                mask_info = concern_data.get("mask_urls") or concern_data.get("masks")
                if isinstance(mask_info, dict):
                    mask_url_val = mask_info.get("alpha_mask") or mask_info.get("url")
                elif isinstance(mask_info, str):
                    mask_url_val = mask_info
            elif isinstance(concern_data, (int, float)):
                score_val = float(concern_data)

            if score_val is not None:
                try:
                    score_val = round(float(score_val), 1)
                except (ValueError, TypeError):
                    score_val = None

            if raw_score_val is not None:
                try:
                    raw_score_val = round(float(raw_score_val), 2)
                except (ValueError, TypeError):
                    raw_score_val = None

            # Only append metrics with assessed scores or meaningful data
            if score_val is not None or raw_score_val is not None:
                severity = determine_severity(score_val)
                metrics.append(SkinMetric(
                    key=meta["key"],
                    label=meta["label"],
                    score=score_val,
                    raw_score=raw_score_val,
                    severity=severity,
                    explanation=meta["explanation"],
                    mask_url=mask_url_val
                ))

        # Generate readable summary
        concerns_requiring_care = [m.label for m in metrics if m.score is not None and m.score < 65]
        optimal_areas = [m.label for m in metrics if m.score is not None and m.score >= 80]
        
        summary_parts = []
        if skin_type:
            summary_parts.append(f"Skin type assessed as {skin_type}.")
        if skin_age:
            summary_parts.append(f"Skin vitality age estimated around {skin_age} years.")
        if concerns_requiring_care:
            summary_parts.append(f"Key areas to support: {', '.join(concerns_requiring_care)}.")
        if optimal_areas:
            summary_parts.append(f"Strengths with healthy scores: {', '.join(optimal_areas)}.")
        if not summary_parts:
            summary_parts.append("Analysis completed successfully.")

        summary_text = " ".join(summary_parts)

        return SkinAnalysisResult(
            report_id=str(uuid.uuid4()),
            created_at=datetime.now(timezone.utc).isoformat(),
            skin_type=skin_type,
            skin_age=skin_age,
            overall_score=overall_score,
            metrics=metrics,
            summary=summary_text,
            is_demo=False,
            source="youcam_api",
            raw_data_summary={"action_count": len(metrics)}
        )

    def generate_demo_analysis(self) -> SkinAnalysisResult:
        """
        Generates clearly labeled demo analysis for offline review, UI development, and fallback.
        Must be visibly tagged as demo data and never presented as genuine YouCam analysis.
        """
        metrics = [
            SkinMetric(
                key="texture",
                label="Skin Texture & Uniformity",
                score=78.0,
                raw_score=76.2,
                severity="Mild Concern",
                explanation="Slight uneven surface micro-relief observed around cheek zones."
            ),
            SkinMetric(
                key="pores",
                label="Pores & Surface Smoothness",
                score=68.0,
                raw_score=66.5,
                severity="Mild Concern",
                explanation="Moderate pore dilation along the T-zone and nose bridge."
            ),
            SkinMetric(
                key="moisture",
                label="Hydration & Moisture",
                score=62.0,
                raw_score=60.8,
                severity="Moderate Concern",
                explanation="Sub-optimal epidermal moisture retention; benefits from barrier support."
            ),
            SkinMetric(
                key="spots",
                label="Spots & Hyperpigmentation",
                score=82.0,
                raw_score=81.0,
                severity="Optimal",
                explanation="Even skin tone with minimal UV spots or post-inflammatory marks."
            ),
            SkinMetric(
                key="redness",
                label="Redness & Erythema",
                score=74.0,
                raw_score=72.9,
                severity="Mild Concern",
                explanation="Subtle capillary sensitivity noted around the mid-face."
            ),
            SkinMetric(
                key="dark_circles",
                label="Dark Eye Circles",
                score=70.0,
                raw_score=68.7,
                severity="Mild Concern",
                explanation="Mild infra-orbital shadow; common with screen fatigue and sleep variability."
            )
        ]

        return SkinAnalysisResult(
            report_id=str(uuid.uuid4()),
            created_at=datetime.now(timezone.utc).isoformat(),
            skin_type="Combination",
            skin_age=25,
            overall_score=72.0,
            metrics=metrics,
            summary="[DEMO MODE] Skin shows overall balanced vitality with combination T-zone tendencies and mild dehydration.",
            is_demo=True,
            source="demo_mock",
            raw_data_summary={"mode": "demo_synthetic_sample"}
        )

    async def analyze_image_bytes(
        self,
        image_bytes: bytes,
        file_name: str = "selfie.jpg",
        content_type: str = "image/jpeg",
        force_demo: bool = False
    ) -> SkinAnalysisResult:
        """
        Complete end-to-end analysis orchestration:
        1. Checks configuration
        2. In demo mode or if unconfigured (and fallback allowed), returns clearly labeled demo result
        3. In real mode: requests upload URL -> PUTs image binary -> creates task -> polls result -> normalizes.
        """
        if force_demo or (not self.is_configured and settings.ALLOW_DEMO_FALLBACK):
            logger.info("Executing demo analysis (API key not configured or demo requested)")
            return self.generate_demo_analysis()

        if not self.is_configured:
            raise PermissionError(
                "YouCam API key is not configured in backend/.env (YOUCAM_API_KEY). "
                "Configure a valid key or enable demo mode."
            )

        # 1. Request upload URL
        file_size = len(image_bytes)
        file_id, upload_url = await self.request_file_upload(file_name, file_size, content_type)

        # 2. Upload binary to signed URL
        await self.upload_image_binary(upload_url, image_bytes, content_type)

        # 3. Create analysis task
        task_id = await self.create_skin_analysis_task(file_id)

        # 4. Poll until completion
        task_data = await self.poll_task_result(task_id)

        # 5. Normalize response
        return self.normalize_results(task_data)

youcam_client = YouCamClient()
