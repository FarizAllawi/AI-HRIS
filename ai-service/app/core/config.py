from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # API Settings
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8100
    DEBUG: bool = True

    HRMS_BASE_URL: str = "http://localhost:8000"

    # CORS
    CORS_ORIGINS: List[str] = ["*"]

    # Database
    DATABASE_URL: str = "postgresql://admin:secret@localhost:5432/fastapi_db"

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
