from elevenlabs.client import ElevenLabs
from elevenlabs import save
from typing import Optional, List
import uuid
import os
import aiofiles

class ElevenLabsService:
    """
    Service for Text-to-Speech using ElevenLabs API
    Users provide their own API keys stored encrypted in integrations
    """
    
    def __init__(self, api_key: str):
        self.client = ElevenLabs(api_key=api_key)
    
    async def text_to_speech(
        self,
        text: str,
        voice_id: str = "EXAVITQu4vr4xnSDxMaL",  # Default voice (Sarah)
        model_id: str = "eleven_monolingual_v1",
        voice_settings: Optional[dict] = None
    ) -> bytes:
        """
        Convert text to speech audio
        
        Args:
            text: Text to convert to speech
            voice_id: ElevenLabs voice ID
            model_id: Model to use (eleven_monolingual_v1, eleven_multilingual_v2, etc)
            voice_settings: Optional voice settings (stability, similarity_boost, style, use_speaker_boost)
        
        Returns:
            Audio bytes in MP3 format
        """
        try:
            # Default voice settings
            if voice_settings is None:
                voice_settings = {
                    "stability": 0.5,
                    "similarity_boost": 0.75,
                    "style": 0.0,
                    "use_speaker_boost": True
                }
            
            # Generate audio
            audio = self.client.generate(
                text=text,
                voice=voice_id,
                model=model_id,
                voice_settings=voice_settings
            )
            
            # Convert generator to bytes
            audio_bytes = b"".join(audio)
            return audio_bytes
            
        except Exception as e:
            print(f"ElevenLabs TTS error: {e}")
            raise
    
    async def save_audio(
        self,
        audio_bytes: bytes,
        filename: Optional[str] = None
    ) -> str:
        """
        Save audio bytes to file
        
        Args:
            audio_bytes: Audio data
            filename: Optional filename (auto-generated if not provided)
        
        Returns:
            Path to saved file
        """
        if not filename:
            filename = f"{uuid.uuid4()}.mp3"
        
        filepath = f"/tmp/audio/{filename}"
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        
        async with aiofiles.open(filepath, 'wb') as f:
            await f.write(audio_bytes)
        
        return filepath
    
    def get_voices(self) -> List[dict]:
        """
        Get list of available voices from ElevenLabs
        
        Returns:
            List of voice dictionaries with id, name, category, description
        """
        try:
            voices_response = self.client.voices.get_all()
            voices = []
            
            for voice in voices_response.voices:
                voices.append({
                    "id": voice.voice_id,
                    "name": voice.name,
                    "category": voice.category,
                    "description": voice.description if hasattr(voice, 'description') else None,
                    "preview_url": voice.preview_url if hasattr(voice, 'preview_url') else None
                })
            
            return voices
            
        except Exception as e:
            print(f"Error fetching voices: {e}")
            return []
    
    def get_models(self) -> List[dict]:
        """
        Get list of available TTS models
        
        Returns:
            List of model dictionaries
        """
        try:
            models_response = self.client.models.get_all()
            models = []
            
            for model in models_response:
                models.append({
                    "id": model.model_id,
                    "name": model.name,
                    "description": model.description if hasattr(model, 'description') else None,
                    "can_do_text_to_speech": model.can_do_text_to_speech if hasattr(model, 'can_do_text_to_speech') else True,
                    "can_do_voice_conversion": model.can_do_voice_conversion if hasattr(model, 'can_do_voice_conversion') else False
                })
            
            return models
            
        except Exception as e:
            print(f"Error fetching models: {e}")
            return []

# Helper function to get service with user's API key
async def get_elevenlabs_service(api_key: str) -> ElevenLabsService:
    """Factory function to create ElevenLabsService instance"""
    return ElevenLabsService(api_key=api_key)