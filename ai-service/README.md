# Requirements
- PostgreSQL
- Redis

# Run FastAPI
```bash
  uvicorn app.main:app --reload --port 8100
```

# In another terminal: Run Celery worker
```bash
  celery -A app.celery_app worker --loglevel=info
```

# Optional: Run Celery beat (periodic tasks)
```bash
  celery -A app.celery_app beat --loglevel=info
```

# Optional: Run Celery flower for monitoring purpose
```bash
  celery -A app.celery_app flower --port=5555
```
