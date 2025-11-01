from fastapi import APIRouter, Depends, HTTPException, UploadFile

import os
import uuid
import shutil

router = APIRouter()

@router.post('/upload')
def upload_file(file: UploadFile = File(...)):
    """Receive CSV from Laravel, store it, and trigger Celery task."""
    try:
        job_id = str(uuid.uuid4())
        file_path = os.path.join(UPLOAD_DIR, f"{job_id}.csv")

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Trigger Celery background job
        task = process_csv_file.delay(file_path, job_description, callback_url)

        return JSONResponse({
            "message": "File received. Processing started.",
            "job_id": job_id,
            "task_id": task.id,
            "job_description": job_description
        })
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)