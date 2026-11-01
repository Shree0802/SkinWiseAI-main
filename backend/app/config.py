from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator, model_validator
from typing import List, Union
import logging

logger = logging.getLogger("skinwise.config")

DEFAULT_CORS_ORIGINS = [
    "https://skin-wise-ai-main.vercel.app",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8000",
    "http://127.0.0.1:8000"
]

class Settings(BaseSettings):
    APP_NAME: str = "SkinWise AI"
    APP_ENV: str = "development"
    DEBUG: bool = True
    API_V1_PREFIX: str = "/api/v1"
    
    # YouCam Skin AI API Configuration (Perfect Corp S2S Enterprise API)
    YOUCAM_API_KEY: str = ""
    YOUCAM_API_BASE_URL: str = "https://yce-api-01.makeupar.com"
    YOUCAM_POLL_INTERVAL: float = 1.5
    YOUCAM_POLL_TIMEOUT: float = 60.0
    
    # Fallback / Demo Mode Settings
    ALLOW_DEMO_FALLBACK: bool = True
    
    # Upload constraints
    MAX_UPLOAD_SIZE_BYTES: int = 10 * 1024 * 1024  # 10 MB
    ALLOWED_IMAGE_TYPES: List[str] = ["image/jpeg", "image/png", "image/webp"]
    
    # CORS
    CORS_ORIGINS: Union[List[str], str] = DEFAULT_CORS_ORIGINS
    
    # Database (SQLite for local, PostgreSQL for Render/cloud)
    DATABASE_URL: str = "sqlite:///./skinwise.db"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="allow"
    )

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str):
            # Split comma-separated string from env var
            origins = [orig.strip() for orig in v.split(",") if orig.strip()]
            return origins if origins else DEFAULT_CORS_ORIGINS
        if isinstance(v, list):
            return [str(orig).strip() for orig in v if str(orig).strip()]
        return DEFAULT_CORS_ORIGINS

    @field_validator("MAX_UPLOAD_SIZE_BYTES")
    @classmethod
    def validate_max_upload_size(cls, v: int) -> int:
        if v <= 0:
            raise ValueError("MAX_UPLOAD_SIZE_BYTES must be positive.")
        return v

    @field_validator("YOUCAM_POLL_INTERVAL", "YOUCAM_POLL_TIMEOUT")
    @classmethod
    def validate_positive_floats(cls, v: float) -> float:
        if v <= 0:
            raise ValueError("Poll settings must be positive numbers.")
        return v

    @model_validator(mode="after")
    def validate_environment_settings(self) -> "Settings":
        # Prevent production from silently running with development settings
        if self.APP_ENV.lower() == "production":
            if self.DEBUG:
                logger.warning("APP_ENV is 'production' but DEBUG is True. Forcing DEBUG=False for safety.")
                self.DEBUG = False
        return self

    def get_cors_origins(self) -> List[str]:
        if isinstance(self.CORS_ORIGINS, list):
            return self.CORS_ORIGINS
        return DEFAULT_CORS_ORIGINS

settings = Settings()
