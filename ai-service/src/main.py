from fastapi import FastAPI, UploadFile, Form, WebSocket, WebSocketDisconnect
from fastapi.responses import JSONResponse
from celery_app import process_csv_file
from utils.ws_manager import ws_manager
from utils.ws_broadcast import router as ws_broadcast_router
import os
import uuid
import shutil

app = FastAPI(title="AI Screening Service")

# Mount WebSocket router
app.include_router(ws_broadcast_router)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@app.post("/upload-csv")
async def upload_csv(
    file: UploadFile,
    job_description: str = Form(...),
    callback_url: str = Form(None)
):
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


@app.websocket("/ws/{job_id}")
async def websocket_endpoint(websocket: WebSocket, job_id: str):
    """WebSocket endpoint for Laravel to receive real-time updates."""
    await ws_manager.connect(job_id, websocket)
    try:
        while True:
            await websocket.receive_text()  # Keep connection alive
    except WebSocketDisconnect:
        ws_manager.disconnect(job_id, websocket)


@app.get("/")
async def root():
    return {"status": "running", "service": "FastAPI IndoBERT Screening"}
