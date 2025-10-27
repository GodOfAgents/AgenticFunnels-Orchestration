from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.services.qwen_omni_service import qwen_service
from pydantic import BaseModel
from typing import Optional, Dict, Any
import json
import asyncio

router = APIRouter()

# Request Models
class QwenSessionCreate(BaseModel):
    agent_id: str
    agent_config: Dict[str, Any]
    session_config: Optional[Dict[str, Any]] = None

class QwenTextMessage(BaseModel):
    session_id: str
    text: str
    stream: bool = True

class QwenAudioMessage(BaseModel):
    session_id: str
    sample_rate: int = 16000
    stream: bool = True


# Session Management Endpoints
@router.post("/sessions")
async def create_qwen_session(
    session_data: QwenSessionCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new Qwen 3 Omni voice/multimodal session
    
    This replaces the need for separate STT, LLM, and TTS services.
    Qwen 3 Omni handles everything end-to-end!
    
    Agent config should include:
    - system_prompt: System instructions for the agent
    - voice_id: Voice persona (0-16, Qwen supports 17 voices)
    - language: Language code (auto-detect if not specified)
    - persona: Agent personality (friendly, professional, etc.)
    """
    try:
        session = await qwen_service.create_voice_session(
            agent_id=session_data.agent_id,
            agent_config=session_data.agent_config,
            session_config=session_data.session_config
        )
        return session
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create session: {str(e)}")


@router.get("/sessions")
async def list_qwen_sessions(
    db: AsyncSession = Depends(get_db)
):
    """
    List all active Qwen 3 Omni sessions
    """
    sessions = qwen_service.get_active_sessions()
    return {
        "sessions": sessions,
        "count": len(sessions)
    }


@router.get("/sessions/{session_id}")
async def get_qwen_session_status(
    session_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Get status of a specific Qwen 3 Omni session
    """
    status = qwen_service.get_session_status(session_id)
    if not status:
        raise HTTPException(status_code=404, detail="Session not found")
    return status


@router.delete("/sessions/{session_id}")
async def end_qwen_session(
    session_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    End a Qwen 3 Omni session and cleanup resources
    """
    success = await qwen_service.end_session(session_id)
    if not success:
        raise HTTPException(status_code=404, detail="Session not found")
    return {"message": "Session ended successfully"}


# Text Conversation Endpoint
@router.post("/chat")
async def qwen_text_chat(
    message: QwenTextMessage,
    db: AsyncSession = Depends(get_db)
):
    """
    Send text message to Qwen 3 Omni and get response
    
    Supports streaming responses for real-time interaction
    """
    try:
        if message.stream:
            # Return streaming response
            async def generate():
                async for chunk in qwen_service.process_text(
                    session_id=message.session_id,
                    text=message.text,
                    stream=True
                ):
                    yield f"data: {json.dumps(chunk)}\n\n"
            
            return StreamingResponse(
                generate(),
                media_type="text/event-stream"
            )
        else:
            # Return complete response
            response = None
            async for chunk in qwen_service.process_text(
                session_id=message.session_id,
                text=message.text,
                stream=False
            ):
                response = chunk
            return response
            
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat error: {str(e)}")


# WebSocket for Real-Time Voice
@router.websocket("/ws/{session_id}")
async def qwen_voice_websocket(
    websocket: WebSocket,
    session_id: str
):
    """
    WebSocket endpoint for real-time voice communication with Qwen 3 Omni
    
    Protocol:
    - Client sends audio chunks (binary)
    - Server responds with JSON messages containing:
      - Text transcriptions
      - Text responses
      - Audio responses
      - Status updates
    
    This provides ultra-low latency voice interaction (211ms average)
    """
    await websocket.accept()
    
    try:
        # Verify session exists
        status = qwen_service.get_session_status(session_id)
        if not status:
            await websocket.send_json({
                "type": "error",
                "message": "Session not found"
            })
            await websocket.close()
            return
        
        # Send welcome message
        await websocket.send_json({
            "type": "connected",
            "session_id": session_id,
            "capabilities": {
                "audio_input": True,
                "video_input": True,
                "real_time": True,
                "latency_ms": 211
            }
        })
        
        # Main message loop
        while True:
            # Receive audio data from client
            data = await websocket.receive()
            
            if "bytes" in data:
                # Audio data received
                audio_bytes = data["bytes"]
                
                # Process audio and stream responses
                async for response in qwen_service.process_audio(
                    session_id=session_id,
                    audio_data=audio_bytes,
                    stream=True
                ):
                    if response["type"] == "audio":
                        # Send audio response as binary
                        await websocket.send_bytes(response["content"])
                    else:
                        # Send text/status as JSON
                        await websocket.send_json(response)
                        
            elif "text" in data:
                # Text message received
                message = json.loads(data["text"])
                
                if message.get("type") == "ping":
                    # Respond to ping
                    await websocket.send_json({"type": "pong"})
                    
                elif message.get("type") == "text":
                    # Process text message
                    async for response in qwen_service.process_text(
                        session_id=session_id,
                        text=message.get("content", ""),
                        stream=True
                    ):
                        await websocket.send_json(response)
                        
    except WebSocketDisconnect:
        print(f"WebSocket disconnected for session {session_id}")
    except Exception as e:
        print(f"WebSocket error for session {session_id}: {e}")
        try:
            await websocket.send_json({
                "type": "error",
                "message": str(e)
            })
        except:
            pass
    finally:
        try:
            await websocket.close()
        except:
            pass


# Model Information Endpoint
@router.get("/info")
async def qwen_model_info():
    """
    Get information about the Qwen 3 Omni model
    """
    return {
        "model": "Qwen 3 Omni",
        "version": "30B-A3B-Instruct",
        "license": "Apache 2.0",
        "capabilities": {
            "modalities": ["text", "audio", "video", "image"],
            "languages": {
                "input": 19,
                "output": 10
            },
            "voices": 17,
            "features": [
                "End-to-end voice",
                "Multi-modal understanding",
                "Real-time streaming",
                "Voice activity detection",
                "Emotion detection",
                "Speaker diarization",
                "Low latency (211ms)",
                "Multi-language auto-detection"
            ]
        },
        "performance": {
            "latency_ms": 211,
            "audio_input_max_minutes": 40,
            "real_time_capable": True
        },
        "status": "loaded" if qwen_service.is_loaded else "not_loaded"
    }


# Health Check
@router.get("/health")
async def qwen_health_check():
    """
    Check if Qwen 3 Omni service is healthy
    """
    return {
        "status": "healthy" if qwen_service.is_loaded else "loading",
        "model_loaded": qwen_service.is_loaded,
        "device": qwen_service.device,
        "active_sessions": len(qwen_service.get_active_sessions())
    }
