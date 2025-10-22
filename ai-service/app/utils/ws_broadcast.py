from fastapi import APIRouter, Request
from utils.ws_manager import ws_manager

router = APIRouter()

@router.post("/ws-broadcast/{job_id}")
async def ws_broadcast(job_id: str, request: Request):
    data = await request.json()
    await ws_manager.broadcast(job_id, data)
    return {"status": "ok"}
