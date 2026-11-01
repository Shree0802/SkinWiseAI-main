import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import init_db
from app.api import api_router

# Configure structured logging
logging.basicConfig(
    level=logging.DEBUG if settings.DEBUG else logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("skinwise")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize database schema
    logger.info(f"Starting {settings.APP_NAME} in '{settings.APP_ENV}' environment (DEBUG={settings.DEBUG})")
    init_db()
    yield
    # Shutdown
    logger.info(f"Shutting down {settings.APP_NAME}")

# Ensure database tables exist upon module load (essential for TestClient without context manager)
init_db()

app = FastAPI(
    title=settings.APP_NAME,
    description="Explainable Skincare Decision Assistant powered by YouCam Skin AI API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS configuration: explicit origins only, no wildcard with credentials
cors_origins = settings.get_cors_origins()
logger.info(f"Configuring CORS with origins: {cors_origins}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=600,
)

# Register versioned API router
app.include_router(api_router, prefix=settings.API_V1_PREFIX)

@app.get("/")
def read_root():
    return {
        "app": settings.APP_NAME,
        "version": "1.0.0",
        "status": "online",
        "environment": settings.APP_ENV,
        "docs": "/docs",
        "api_v1": settings.API_V1_PREFIX
    }

if __name__ == "__main__":
    import uvicorn
    # Render assigns dynamic port via $PORT
    port = int(os.environ.get("PORT", 8000))
    host = "0.0.0.0"
    logger.info(f"Binding uvicorn server to {host}:{port}")
    uvicorn.run("app.main:app", host=host, port=port, reload=settings.DEBUG)
