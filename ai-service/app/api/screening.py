from fastapi import APIRouter, UploadFile
from fastapi.responses import JSONResponse
from app.tasks.process_csv import process_csv_file
import os
import shutil

router = APIRouter()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload-csv")
def upload_csv(file: UploadFile ):
    '''
        Receive CSV from laravel, store it and trigger Celery task.
    '''
    try:
        # Save the file to uploads folder
        file_path = os.path.join(UPLOAD_DIR, file.filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Process csv file with celery task
        task = process_csv_file.delay(file_path)

        return JSONResponse({
            "message": "File received. Processing started.",
            "task_id": task.id
        })
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)

@router.get('/task/{task_id}')
def get_task_info(task_id):
    '''
        Get task information
    '''
    pass