from fastapi import WebSocket

class WSManager:
    def __init__(self):
        self.active_connections: dict[str, list[WebSocket]] = {}

    async def connect(self, job_id: str, websocket: WebSocket):
        await websocket.accept()
        if job_id not in self.active_connections:
            self.active_connections[job_id] = []
        self.active_connections[job_id].append(websocket)

    def disconnect(self, job_id: str, websocket: WebSocket):
        if job_id in self.active_connections:
            self.active_connections[job_id].remove(websocket)

    async def broadcast(self, job_id: str, message: dict):
        if job_id in self.active_connections:
            for ws in self.active_connections[job_id]:
                await ws.send_json(message)

ws_manager = WSManager()
