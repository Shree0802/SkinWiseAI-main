import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.config import settings

logger = logging.getLogger("skinwise.database")

# Normalize database URL for SQLAlchemy 2.0 (PostgreSQL URLs on Render start with postgres://)
raw_db_url = settings.DATABASE_URL
if raw_db_url.startswith("postgres://"):
    raw_db_url = raw_db_url.replace("postgres://", "postgresql://", 1)

connect_args = {}
engine_kwargs = {"echo": False}

if raw_db_url.startswith("sqlite"):
    connect_args["check_same_thread"] = False
else:
    # Production PostgreSQL connection pool configuration
    engine_kwargs.update({
        "pool_pre_ping": True,
        "pool_recycle": 300,
        "pool_size": 10,
        "max_overflow": 20
    })

try:
    engine = create_engine(
        raw_db_url,
        connect_args=connect_args,
        **engine_kwargs
    )
except Exception as e:
    logger.error(f"Failed to create database engine for '{raw_db_url}': {e}")
    raise

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    """
    FastAPI dependency yielding a SQLAlchemy session.
    Guarantees session rollback on exception and proper closure in all circumstances.
    """
    db = SessionLocal()
    try:
        yield db
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()

def init_db():
    """
    Idempotent schema initialization for both SQLite and PostgreSQL.
    """
    from app.models import db_models  # noqa: F401
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables verified and initialized successfully.")
    except Exception as e:
        logger.error(f"Database schema initialization failure: {e}", exc_info=True)
        raise
