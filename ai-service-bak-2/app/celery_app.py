from celery import Celery
import pandas as pd
import time
from model.indoBERT import IndoBERT
import redis
import asyncio
import httpx

# Redis setup
r = redis.Redis(host="localhost", port=6379, db=1)

# IndoBERT model
scorer = IndoBERT()

# Celery configuration
celery_app = Celery(
    "worker",
    broker="redis://localhost:6379/0",
    backend="redis://localhost:6379/0"
)

# ==========================================================
# Helper: broadcast to FastAPI WebSocket clients
# ==========================================================
async def ws_broadcast(job_id: str, result: dict):
    async with httpx.AsyncClient() as client:
        try:
            await client.post(f"http://localhost:8100/ws-broadcast/{job_id}", json=result)
        except Exception as e:
            print(f"⚠️ WebSocket broadcast error: {e}")

# ==========================================================
# Task: Process a single applicant's answers
# ==========================================================
@celery_app.task(bind=True)
def process_user_rows(self, user_id: str, user_name: str, rows: list, job_description: str):
    """
    Process all question-answer pairs for a single user.
    Each row contains: question, answer, weight.
    """
    user_results = []
    total_weight = 0.0
    weighted_sum = 0.0

    for row in rows:
        question = row.get("question", "")
        answer = row.get("answer", "")
        weight = float(row.get("weight", 1.0))

        # Compute IndoBERT similarity
        score = scorer.semantic_similarity(answer, job_description)
        weighted_score = score * weight

        total_weight += weight
        weighted_sum += weighted_score

        row_result = {
            "user_id": user_id,
            "name": user_name,
            "question": question,
            "answer": answer,
            "weight": weight,
            "score": round(score, 4),
            "weighted_score": round(weighted_score, 4),
            "status": "processed"
        }

        # Store individual row result in Redis
        r.hset(f"user:{user_id}", question, str(row_result))

        # Real-time broadcast for this row
        asyncio.run(ws_broadcast(job_description, row_result))

        user_results.append(row_result)

    # Aggregate per-user score
    avg_score = round(weighted_sum / total_weight, 4) if total_weight else 0.0
    user_summary = {
        "user_id": user_id,
        "name": user_name,
        "average_score": avg_score,
        "total_questions": len(rows),
        "status": "completed"
    }

    # Save summary in Redis
    r.hset("user_summaries", user_id, str(user_summary))

    # Final broadcast summary for user
    asyncio.run(ws_broadcast(job_description, {"summary": user_summary}))

    return user_summary

# ==========================================================
# Task: Process CSV File (group rows per user)
# ==========================================================
@celery_app.task(bind=True)
def process_csv_file(self, file_path: str, job_description: str, callback_url: str = None):
    """
    Reads CSV and creates per-user Celery tasks.
    Expected columns: user_id, name, question, answer, weight
    """
    print(f"🔹 Processing CSV file: {file_path}")
    df = pd.read_csv(file_path)
    df["user_id"] = df["user_id"].astype(str)  # or int if you prefer
    df["weight"] = df["weight"].astype(float)

    required_columns = {"user_id", "name", "question", "answer"}
    print(f"🔹 CSV columns: {df.columns.tolist()}")
    if not required_columns.issubset(df.columns):
        raise ValueError(f"CSV must contain columns: {required_columns}")

    # Group rows by user_id
    grouped = df.groupby(["user_id", "name"])
    task_ids = []

    for (user_id, user_name), group in grouped:
        rows = group.to_dict(orient="records")
        task = process_user_rows.delay(user_id, user_name, rows, job_description)
        task_ids.append(task.id)

    return {"total_users": len(task_ids), "task_ids": task_ids}
