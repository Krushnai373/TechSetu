from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from app.routers import translate, curriculum, worksheets, sync, classroom, auth
import json
import time

app = FastAPI(
    title="PALASH TechSetu Backend API",
    description="AI-Powered Vernacular Pedagogy & Real-Time Tribal Translation Tool for SIH 2026",
    version="1.0.0"
)

# Enable CORS for local Vite dev server and PWA
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Routers
app.include_router(auth.router)
app.include_router(translate.router)
app.include_router(curriculum.router)
app.include_router(worksheets.router)
app.include_router(sync.router)
app.include_router(classroom.router)

@app.get("/")
def root():
    return {
        "status": "online",
        "service": "PALASH TechSetu MTB-MLE AI Engine",
        "version": "1.0.0",
        "supported_tribal_languages": ["santhali", "ho", "mundari"]
    }

@app.websocket("/ws/voice-stream")
async def websocket_voice_stream(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()
            payload = json.loads(data)
            text = payload.get("text", "")
            target_lang = payload.get("target_lang", "santhali")
            
            # Real-time sub-3s translation response
            from app.services.nlp_engine import nlp_engine
            res = nlp_engine.translate(text, target_lang=target_lang)
            res["stream_type"] = "live_transcription_and_translation"
            res["timestamp"] = time.time()
            
            await websocket.send_text(json.dumps(res))
    except WebSocketDisconnect:
        pass
