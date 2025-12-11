from pydantic_settings import BaseSettings
from pydantic import computed_field
from typing import List
import os

BASE_DIR = os.path.abspath(os.path.join(os.getcwd(), ""))

class Settings(BaseSettings):
    # API Settings
    API_NAME: str = "AI-Service"
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8100
    DEBUG: bool = True

    GATEWAY_BASE_URL: str = os.getenv("GATEWAY_BASE_URL", "http://localhost:8000")

    # OAuth
    OAUTH_CLIENT_ID: str = os.getenv("OAUTH_CLIENT_ID", "")
    OAUTH_CLIENT_SECRET: str = os.getenv("OAUTH_CLIENT_SECRET", "")
    OAUTH_TOKEN_SCOPE: str = os.getenv("OAUTH_TOKEN_SCOPE", "ai-service:*")  # OAuth scope for client_credentials
    OAUTH_PUBLIC_KEY: str = os.path.join(BASE_DIR, "keys/oauth-public.key")
    OAUTH_EXPECTED_AUDIENCES: str = ""  # Comma-separated list of acceptable 'aud' values (optional)
    OAUTH_TOKEN_FETCH_TIMEOUT: int = 10
    OAUTH_TOKEN_MAX_RETRIES: int = 3
    OAUTH_TOKEN_BACKOFF_BASE: float = 0.5

    @computed_field
    @property
    def OAUTH_TOKEN_URL(self) -> str:
        """Compute OAUTH_TOKEN_URL dynamically from GATEWAY_BASE_URL"""
        return f"{self.GATEWAY_BASE_URL}/oauth/token"

    # Machine-to-machine (client_credentials) settings
    TOKEN_CACHE_BUFFER: int = 30  # seconds to subtract from token expiry when caching

    # CORS
    CORS_ORIGINS: List[str] = ["*"]

    # Database
    # Default to a local sqlite file for development (supports embedding JSON storage).
    # Override with DATABASE_URL in .env for production (e.g. postgresql://...)
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{os.path.join(BASE_DIR, 'data/dev.db')}")

    # Path where vector index files will be stored (used by local dev vector search)
    VECTOR_INDEX_PATH: str = os.getenv("VECTOR_INDEX_PATH", os.path.join(BASE_DIR, "data/embeddings/embeddings_hnsw.bin"))

    # Redis
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")

    # Celery
    CELERY_BROKER_URL: str = os.getenv("CELERY_BROKER_URL", "redis://localhost:6379/0")
    CELERY_RESULT_BACKEND: str = os.getenv("CELERY_RESULT_BACKEND", "redis://localhost:6379/0")

    # Model Settings
    MODEL_NAME: str = "indobenchmark/indobert-base-p1"
    MODEL_PATH: str = os.getenv("MODEL_PATH", os.path.join(BASE_DIR, "data/models/indobert-base-p1"))
    MAX_SEQ_LENGTH: int = 512
    EMBEDDING_DIM: int = 768

    # Scoring Settings
    SIMILARITY_THRESHOLD: float = 0.5
    DEFAULT_SHORTLIST_PERCENTILE: float = 75.0
    DEFAULT_FLAG_PERCENTILE: float = 25.0

    # Training Settings
    REPLAY_BUFFER_SIZE: int = 10000
    BATCH_SIZE: int = 16
    LEARNING_RATE: float = 2e-5
    REFINEMENT_EPOCHS: int = 3

    # Cache Settings
    EMBEDDING_CACHE_TTL: int = 86400 * 30  # 30 days

settings = Settings()
