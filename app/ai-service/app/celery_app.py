from celery import Celery
from app.core.config import settings
from app.core.logging import setup_logging

setup_logging()
celery_app = Celery(
  "ai_service_worker",
  broker=settings.CELERY_BROKER_URL,
  backend=settings.CELERY_RESULT_BACKEND,
  include=[
    "app.tasks.job_posting_processing",
    "app.tasks.screening"
  ]
)

# Celery Configuration
celery_app.conf.update(
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='UTC',
    enable_utc=True,
    task_track_started=True,
    task_time_limit=3600, # 1 hour
    task_soft_time_limit=3300, # 55 minutes
    worker_prefetch_multiplier=1,
    worker_max_tasks_per_child=100
)

# Periodic tasks (optional)
celery_app.conf.beat_schedule = {
  "weekly-model-refinement": {
      "task": "app.tasks.training.refine_model",
      "schedule": 604800.0,  # every week
  }
}
