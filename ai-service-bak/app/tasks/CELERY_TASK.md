# Celery Tasks - Complete Documentation

All asynchronous background tasks for the AI Screening Service.

## 📁 File Structure

```
app/tasks/
├── __init__.py              # Module initialization
├── jd_processing.py         # JD profile processing tasks
├── screening.py             # Candidate screening tasks
├── calibration.py           # Threshold calibration tasks
└── training.py              # Model training & refinement tasks
```

---

## 📄 Tasks Overview

### 1. JD Processing Tasks (`jd_processing.py`)

| Task | Description | Trigger |
|------|-------------|---------|
| `process_jd_profile` | Full JD processing workflow | Job creation |
| `regenerate_embeddings` | Regenerate embeddings for a job | JD updated / Model updated |
| `batch_process_jd_profiles` | Process multiple JDs in batch | Bulk operation |
| `update_jd_competencies` | Update competencies when description changes | JD edit |
| `validate_embeddings` | Validate embedding integrity | Health check |

**Main Workflow: `process_jd_profile`**
```
1. Load job posting
2. Parse JD → competencies (responsibilities, skills, etc.)
3. Generate embeddings for each competency
4. Cache embeddings in database
5. Calibrate thresholds using similar historical JDs
6. Mark job as "active"
```

**Usage Example:**
```python
# From API
from app.tasks.jd_processing import process_jd_profile

task = process_jd_profile.delay(
    job_posting_id=1,
    questions=[
        {"id": 1, "text": "...", "weight": 0.4, "mapped_competencies": [0,1,2]},
        ...
    ]
)

# Check status
result = task.get()  # Blocks until complete
# or
status = task.state  # "PENDING", "SUCCESS", "FAILURE"
```

---

### 2. Screening Tasks (`screening.py`)

| Task | Description | Trigger |
|------|-------------|---------|
| `screen_candidate_async` | Screen single candidate | Candidate applies |
| `screen_candidates_batch_async` | Screen multiple candidates | Bulk screening |
| `rescore_with_new_weights_async` | Re-score all with new weights | Weights updated |
| `bulk_screen_new_candidates` | Find and screen unscreened candidates | Periodic (hourly) |
| `rescreen_all_for_job` | Re-screen all for a job | Model updated |
| `generate_screening_report` | Generate detailed report | On-demand |

**Main Workflow: `screen_candidate_async`**
```
1. Load candidate & job posting
2. Get JD embeddings from cache
3. Generate answer embeddings
4. For each question:
   - Compute max-pool cosine similarity
   - Apply question weight
5. Aggregate: S(c) = Σ(w_q × s_q)
6. Determine decision (shortlist/review/flag)
7. Save screening result
```

**Usage Example:**
```python
from app.tasks.screening import screen_candidate_async, rescore_with_new_weights_async

# Screen a candidate
task = screen_candidate_async.delay(candidate_id=1, job_posting_id=1)

# Re-score all candidates (weights changed)
task = rescore_with_new_weights_async.delay(job_posting_id=1)
# This is FAST - just recalculates aggregation, no embedding regeneration!
```

---

### 3. Calibration Tasks (`calibration.py`)

| Task | Description | Trigger |
|------|-------------|---------|
| `calibrate_thresholds_async` | Zero-shot calibration | Job created |
| `recalibrate_with_current_scores` | Recalibrate with actual scores | 10+ applicants |
| `batch_calibrate_jobs` | Calibrate multiple jobs | Bulk operation |
| `find_similar_jobs_for_calibration` | Analyze similar jobs | Analysis |
| `auto_recalibrate_jobs` | Auto-recalibrate all eligible jobs | Periodic (daily) |
| `validate_thresholds` | Check threshold effectiveness | Health check |

**Zero-Shot Calibration Workflow:**
```
1. Get JD aggregate embedding (mean of all competencies)
2. Find top-K similar historical JDs (cosine similarity)
3. Collect their screening score distributions
4. Calculate P75 (shortlist threshold) & P25 (flag threshold)
5. Update job posting with thresholds
```

**Usage Example:**
```python
from app.tasks.calibration import calibrate_thresholds_async, validate_thresholds

# Calibrate new job
task = calibrate_thresholds_async.delay(job_posting_id=1, top_k=5)

# Validate thresholds
report = validate_thresholds(job_posting_id=1)
# Returns distribution analysis and suggestions
```

---

### 4. Training Tasks (`training.py`)

| Task | Description | Trigger |
|------|-------------|---------|
| `refine_model_async` | Full model refinement | Weekly / Manual |
| `collect_training_data_from_feedback` | Extract data from HR feedback | Periodic (daily) |
| `cleanup_old_training_data` | Remove old training examples | Periodic (monthly) |
| `export_training_dataset` | Export to JSONL for analysis | On-demand |
| `compare_model_versions` | Compare two model versions | Before activation |
| `activate_model_version` | Activate a model checkpoint | Manual |
| `get_training_stats` | Get training statistics | Monitoring |

**Continual Learning Workflow: `refine_model_async`**
```
1. Check training data count (need 100+)
2. Load current IndoBERT model
3. Load replay buffer (historical data)
4. Collect new training examples from HR feedback
5. Mix new (70%) + replay (30%) data
6. Fine-tune model with contrastive loss
7. Validate on hold-out set
8. Save checkpoint with version
9. Update replay buffer
10. Return results (don't auto-activate)
```

**Usage Example:**
```python
from app.tasks.training import (
    refine_model_async,
    collect_training_data_from_feedback,
    get_training_stats
)

# Check if ready for training
stats = get_training_stats()
# {'ready_for_training': True, 'active_examples': 523, ...}

# Collect latest feedback
collect_training_data_from_feedback.delay()

# Train model
task = refine_model_async.delay(epochs=3, batch_size=16)
result = task.get()  # Wait for completion
# {'version': 'v1.20250124_103045', 'val_accuracy': 0.87, ...}

# Compare with current
from app.tasks.training import compare_model_versions
comparison = compare_model_versions(
    version1="v1.20250120_000000",
    version2="v1.20250124_103045"
)

# Activate if better
if comparison['recommendation'].startswith('Use v1.20250124'):
    activate_model_version.delay("v1.20250124_103045")
    # Then restart services!
```

---

## 🔄 Task Scheduling (Celery Beat)

Configure periodic tasks in `app/celery_app.py`:

```python
celery_app.conf.beat_schedule = {
    # Weekly model refinement (Sunday 2 AM)
    "weekly-model-refinement": {
        "task": "app.tasks.training.refine_model",
        "schedule": crontab(hour=2, minute=0, day_of_week=0),
    },
    
    # Daily HR feedback collection (Every day 1 AM)
    "daily-collect-feedback": {
        "task": "app.tasks.training.collect_training_data_from_feedback",
        "schedule": crontab(hour=1, minute=0),
    },
    
    # Hourly bulk screening check
    "hourly-bulk-screening": {
        "task": "app.tasks.screening.bulk_screen_new_candidates",
        "schedule": crontab(minute=0),
    },
    
    # Daily auto-recalibration
    "daily-auto-recalibrate": {
        "task": "app.tasks.calibration.auto_recalibrate_jobs",
        "schedule": crontab(hour=3, minute=0),
    },
    
    # Monthly cleanup (1st of month, 4 AM)
    "monthly-cleanup": {
        "task": "app.tasks.training.cleanup_old_training_data",
        "schedule": crontab(hour=4, minute=0, day_of_month=1),
        "kwargs": {"keep_count": 10000}
    },
}
```

---

## 🎯 Task Execution Patterns

### 1. Fire and Forget
```python
# Don't wait for result
task = process_jd_profile.delay(job_id, questions)
# Returns immediately
```

### 2. Wait for Result
```python
# Block until complete
task = screen_candidate_async.delay(candidate_id, job_id)
result = task.get(timeout=300)  # Wait max 5 minutes
```

### 3. Check Status
```python
task = refine_model_async.delay()

# Later...
if task.ready():
    result = task.result
    if task.successful():
        print(f"Success: {result}")
    else:
        print(f"Failed: {task.traceback}")
```

### 4. Chain Tasks
```python
from celery import chain

# Process JD → Calibrate → Screen all candidates
workflow = chain(
    process_jd_profile.s(job_id, questions),
    calibrate_thresholds_async.s(job_id),
    screen_candidates_batch_async.s(job_id)
)
workflow.apply_async()
```

### 5. Group Tasks
```python
from celery import group

# Screen multiple candidates in parallel
job = group(
    screen_candidate_async.s(1, job_id),
    screen_candidate_async.s(2, job_id),
    screen_candidate_async.s(3, job_id)
)
result = job.apply_async()
```

---

## 🔍 Monitoring Tasks

### Using Flower (Web UI)
```bash
# Start Flower
docker compose up flower

# Visit http://localhost:5555
# - View active tasks
# - Task history
# - Worker status
# - Success/failure rates
```

### Programmatic Monitoring
```python
from app.celery_app import celery_app

# Get active tasks
i = celery_app.control.inspect()

active = i.active()
scheduled = i.scheduled()
reserved = i.reserved()

# Revoke a task
celery_app.control.revoke(task_id, terminate=True)
```

---

## ⚡ Performance Tips

### 1. Task Retry Strategy
```python
@celery_app.task(
    bind=True,
    max_retries=3,
    default_retry_delay=60  # Wait 60s before retry
)
def my_task(self, arg):
    try:
        # do work
        pass
    except Exception as e:
        # Exponential backoff
        raise self.retry(exc=e, countdown=2 ** self.request.retries)
```

### 2. Task Prioritization
```python
# High priority
screen_candidate_async.apply_async(
    args=[candidate_id, job_id],
    priority=9
)

# Low priority
cleanup_old_training_data.apply_async(priority=1)
```

### 3. Task Time Limits
```python
@celery_app.task(
    time_limit=3600,      # Hard limit: 1 hour
    soft_time_limit=3300  # Soft limit: 55 minutes
)
def long_running_task():
    pass
```

### 4. Rate Limiting
```python
@celery_app.task(rate_limit='10/m')  # Max 10 per minute
def rate_limited_task():
    pass
```

---

## 🐛 Troubleshooting

### Task Stuck in PENDING
```bash
# Check if worker is running
docker compose ps celery-worker

# Check worker logs
docker compose logs celery-worker

# Restart worker
docker compose restart celery-worker
```

### Task Failed Silently
```python
# Enable task result tracking
celery_app.conf.task_track_started = True

# Check result
task = my_task.delay()
print(task.state)  # PENDING, STARTED, SUCCESS, FAILURE
print(task.info)   # Result or error info
```

### Memory Issues
```python
# Limit tasks per worker
celery_app.conf.worker_max_tasks_per_child = 100

# Or restart workers periodically
docker compose restart celery-worker
```

---

## 📊 Task Status Codes

| Status | Meaning |
|--------|---------|
| `PENDING` | Task waiting to be executed |
| `STARTED` | Task has started |
| `RETRY` | Task is being retried |
| `SUCCESS` | Task completed successfully |
| `FAILURE` | Task failed |
| `REVOKED` | Task was cancelled |

---

## 🎉 Summary

All Celery tasks are production-ready with:

✅ **Proper error handling** - Retry logic with exponential backoff
✅ **Logging** - Detailed console output for debugging
✅ **Database transactions** - Proper commit/rollback
✅ **Task chaining** - Support for complex workflows
✅ **Monitoring** - Flower integration
✅ **Scalability** - Can run multiple workers
✅ **Reliability** - Automatic retries on failure

Ready to handle production workloads! 🚀