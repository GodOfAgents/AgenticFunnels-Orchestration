from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.services.elevenlabs_service import ElevenLabsService, get_elevenlabs_service
from app.services.integration_service import IntegrationService
from pydantic import BaseModel
from typing import Optional
import io

router = APIRouter()

class TTSRequest(BaseModel):
    text: str
    voice_id: str = "EXAVITQu4vr4xnSDxMaL"  # Default: Sarah
    model_id: str = "eleven_monolingual_v1"
    voice_settings: Optional[dict] = None

class VoiceSettingsUpdate(BaseModel):
    voice_id: Optional[str] = None
    voice_settings: Optional[dict] = None

@router.post("/tts")
async def text_to_speech(
    user_id: str,
    tts_request: TTSRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Convert text to speech using user's ElevenLabs API key
    
    User must have ElevenLabs integration configured
    """
    # Get user's ElevenLabs integration
    integration_service = IntegrationService(db)
    
    # TODO: Query user's elevenlabs integration from DB
    # For now, using mock response
    api_key = None  # Would be: await integration_service.get_decrypted_credentials(integration_id)
    
    if not api_key:
        raise HTTPException(
            status_code=400,
            detail="ElevenLabs integration not configured. Please add your ElevenLabs API key in integrations."
        )
    
    try:
        # Create ElevenLabs service with user's API key
        elevenlabs_service = await get_elevenlabs_service(api_key)
        
        # Generate audio
        audio_bytes = await elevenlabs_service.text_to_speech(
            text=tts_request.text,
            voice_id=tts_request.voice_id,
            model_id=tts_request.model_id,
            voice_settings=tts_request.voice_settings
        )
        
        # Return audio as streaming response
        return StreamingResponse(
            io.BytesIO(audio_bytes),
            media_type="audio/mpeg",
            headers={
                "Content-Disposition": "attachment; filename=speech.mp3"
            }
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"TTS generation failed: {str(e)}")

@router.get("/voices")
async def get_voices(
    user_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Get list of available ElevenLabs voices for user
    """
    # Get user's ElevenLabs API key
    integration_service = IntegrationService(db)
    
    # TODO: Query user's elevenlabs integration
    api_key = None
    
    if not api_key:
        raise HTTPException(
            status_code=400,
            detail="ElevenLabs integration not configured"
        )
    
    try:
        elevenlabs_service = await get_elevenlabs_service(api_key)
        voices = elevenlabs_service.get_voices()
        return {"voices": voices}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch voices: {str(e)}")

@router.get("/models")
async def get_models(
    user_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Get list of available ElevenLabs TTS models
    """
    # Get user's ElevenLabs API key
    integration_service = IntegrationService(db)
    
    # TODO: Query user's elevenlabs integration
    api_key = None
    
    if not api_key:
        raise HTTPException(
            status_code=400,
            detail="ElevenLabs integration not configured"
        )
    
    try:
        elevenlabs_service = await get_elevenlabs_service(api_key)
        models = elevenlabs_service.get_models()
        return {"models": models}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch models: {str(e)}")

@router.post("/test-integration")
async def test_elevenlabs_integration(
    user_id: str,
    api_key: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Test ElevenLabs API key before saving
    """
    try:
        elevenlabs_service = await get_elevenlabs_service(api_key)
        voices = elevenlabs_service.get_voices()
        
        if voices:
            return {
                "status": "success",
                "message": "ElevenLabs API key is valid",
                "voices_count": len(voices)
            }
        else:
            return {
                "status": "warning",
                "message": "API key valid but no voices found"
            }
            
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid ElevenLabs API key: {str(e)}"
        )