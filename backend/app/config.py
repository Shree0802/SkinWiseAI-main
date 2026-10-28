from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List

class Settings(BaseSettings):
    APP_NAME: str = "SkinWise AI"
    APP_ENV: str = "development"
    DEBUG: bool = True
    API_V1_PREFIX: str = "/api/v1"
    
    # YouCam Skin AI API Configuration
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
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000"
    ]
    
    # Database
    DATABASE_URL: str = "sqlite:///./skinwise.db"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="allow"
    )

settings = Settings()
