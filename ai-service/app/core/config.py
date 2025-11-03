from pydantic_settings import BaseSettings
from typing import List
import os

class Settings(BaseSettings):
    # API Settings
    API_NAME: str = "AI-Service"
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8100
    DEBUG: bool = True

    GATEWAY_BASE_URL: str = "http://localhost:8000"

    # OAuth
    OAUTH_PUBLIC_KEY: str = "/keys/oauth_public.key"
    OAUTH_EXPECTED_AUDIENCES: str = ""  # Comma-separated list of acceptable 'aud' values (optional)

    # Machine-to-machine (client_credentials) settings
    API_CLIENT_ID: str = os.getenv("API_CLIENT_ID", "supersecretkey")
    API_CLIENT_SECRET: str = os.getenv("API_CLIENT_SECRET", "supersecretkey")
    OAUTH_TOKEN_URL: str = GATEWAY_BASE_URL + "/oauth/token"
    API_TOKEN_SCOPE: str = "ai-service:*"
    TOKEN_CACHE_BUFFER: int = 30  # seconds to subtract from token expiry when caching

    # CORS
    CORS_ORIGINS: List[str] = ["*"]

    # Database
    # Default to a local sqlite file for development (supports embedding JSON storage).
    # Override with DATABASE_URL in .env for production (e.g. postgresql://...)
    DATABASE_URL: str = "sqlite:///./data/dev.db"

    # Path where vector index files will be stored (used by local dev vector search)
    VECTOR_INDEX_PATH: str = "./data/embeddings/embeddings_hnsw.bin"

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # Celery
    CELERY_BROKER_URL: str = "redis://localhost:6379/0"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/0"

    # Model Settings
    MODEL_NAME: str = "indobenchmark/indobert-base-p1"
    MODEL_PATH: str = "./data/models"
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

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
