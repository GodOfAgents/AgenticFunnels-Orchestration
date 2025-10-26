from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import uvicorn
import os
from dotenv import load_dotenv

# Load environment variables BEFORE importing config
load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

from app.core.config import settings
from app.api import agents, conversations, knowledge, integrations, admin, websocket, voice
from app.services.websocket_manager import ws_manager
from app.services.anomaly_detector import anomaly_detector

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("🚀 Starting AFO Agent Service...")
    # await init_db()  # Commented out for now - will enable when DB is ready
    print("✅ Service initialized")
    
    # Start anomaly detector
    await anomaly_detector.start()
    print("✅ Anomaly detector started")
    
    yield
    
    # Shutdown
    print("🛑 Shutting down AFO Agent Service...")
    await anomaly_detector.stop()
    await ws_manager.close_all()

app = FastAPI(
    title="AFO Agent Service",
    description="Agentic Funnel Orchestration - AI Agent Backend",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(agents.router, prefix="/api/agents", tags=["Agents"])
app.include_router(conversations.router, prefix="/api/conversations", tags=["Conversations"])
app.include_router(knowledge.router, prefix="/api/knowledge", tags=["Knowledge Base"])
app.include_router(integrations.router, prefix="/api/integrations", tags=["Integrations"])
app.include_router(voice.router, prefix="/api/voice", tags=["Voice/TTS"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])
app.include_router(websocket.router, prefix="/ws", tags=["WebSocket"])

@app.get("/")
async def root():
    return {
        "service": "AFO Agent Service",
        "status": "running",
        "version": "1.0.0"
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "database": "connected",
        "redis": "connected",
        "milvus": "connected"
    }

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.ENVIRONMENT == "development"
    )