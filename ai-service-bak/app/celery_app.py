from celery_app import Celery
from app.core.config import settings

celery_app = Celery(
    "ai_screening",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
    include=[
        "app.tasks.jd_processing",
        "app.tasks.screening",
        "app.tasks.calibration",
        "app.tasks.training",
    ]
)

# Celery configuration
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=3600,  # 1 hour
    task_soft_time_limit=3300,  # 55 minutes
    worker_prefetch_multiplier=1,
    worker_max_tasks_per_child=100,
)

# Periodic tasks (optional)
celery_app.conf.beat_schedule = {
    "weekly-model-refinement": {
        "task": "app.tasks.training.refine_model",
        "schedule": 604800.0,  # Every 7 days
    },
}