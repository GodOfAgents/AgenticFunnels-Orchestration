from pipecat.pipeline.pipeline import Pipeline
from pipecat.pipeline.runner import PipelineRunner
from pipecat.pipeline.task import PipelineParams, PipelineTask
from pipecat.processors.aggregators.openai_llm_context import OpenAILLMContext
from pipecat.services.deepgram import DeepgramSTTService
from pipecat.services.elevenlabs import ElevenLabsTTSService
from pipecat.services.openai import OpenAILLMService
from pipecat.transports.services.livekit import LiveKitTransport, LiveKitParams
from livekit import api
from typing import Optional, Dict
import asyncio
import uuid
import os

class VoiceSessionService:
    """
    Voice Session Management using Pipecat + LiveKit
    Handles real-time voice conversations with user-specific API keys
    """
    
    def __init__(self):
        self.active_sessions: Dict[str, PipelineTask] = {}
        self.livekit_url = os.getenv("LIVEKIT_URL", "ws://localhost:7880")
        self.livekit_api_key = os.getenv("LIVEKIT_API_KEY", "devkey")
        self.livekit_api_secret = os.getenv("LIVEKIT_API_SECRET", "devsecret")
    
    async def create_voice_session(
        self,
        agent_id: str,
        agent_config: dict,
        user_credentials: dict,
        room_url: str = None
    ) -> dict:
        """
        Create a new voice session for an agent
        
        Args:
            agent_id: Agent ID
            agent_config: Agent configuration (system prompt, etc.)
            user_credentials: User's API keys (deepgram, elevenlabs, openai)
            room_url: Daily.co room URL for WebRTC (optional)
        
        Returns:
            Session details including session_id and connection info
        """
        session_id = str(uuid.uuid4())
        
        try:
            # Initialize services with user's API keys
            stt_service = DeepgramSTTService(
                api_key=user_credentials.get('deepgram_api_key'),
                model="nova-2",
                language="en-US"
            )
            
            tts_service = ElevenLabsTTSService(
                api_key=user_credentials.get('elevenlabs_api_key'),
                voice_id=agent_config.get('voiceId', 'EXAVITQu4vr4xnSDxMaL')
            )
            
            llm_service = OpenAILLMService(
                api_key=user_credentials.get('openai_api_key'),
                model="gpt-4-turbo-preview"
            )
            
            # Setup transport (Daily.co for WebRTC)
            transport_params = DailyParams(
                audio_in_enabled=True,
                audio_out_enabled=True,
                transcription_enabled=True,
                vad_enabled=True,
                vad_audio_passthrough=True
            )
            
            transport = DailyTransport(
                room_url=room_url or f"https://daily.co/{session_id}",
                token=None,  # Generate Daily token if needed
                bot_name=f"afo-agent-{agent_id[:8]}",
                params=transport_params
            )
            
            # Create LLM context with agent's system prompt
            context = OpenAILLMContext(
                [
                    {
                        "role": "system",
                        "content": agent_config.get('systemPrompt', "You are a helpful assistant.")
                    }
                ]
            )
            
            # Build pipeline: STT -> LLM -> TTS
            pipeline = Pipeline(
                [
                    transport.input(),
                    stt_service,
                    llm_service,
                    tts_service,
                    transport.output()
                ]
            )
            
            # Create pipeline task
            task = PipelineTask(pipeline, params=PipelineParams(allow_interruptions=True))
            
            # Store active session
            self.active_sessions[session_id] = task
            
            # Start pipeline in background
            asyncio.create_task(self._run_pipeline(session_id, task))
            
            return {
                "session_id": session_id,
                "room_url": transport.room_url,
                "status": "active",
                "agent_id": agent_id
            }
            
        except Exception as e:
            print(f"Error creating voice session: {e}")
            raise
    
    async def _run_pipeline(self, session_id: str, task: PipelineTask):
        """Run pipeline task"""
        try:
            runner = PipelineRunner()
            await runner.run(task)
        except Exception as e:
            print(f"Pipeline error for session {session_id}: {e}")
        finally:
            # Clean up session
            if session_id in self.active_sessions:
                del self.active_sessions[session_id]
    
    async def end_session(self, session_id: str) -> bool:
        """End a voice session"""
        if session_id in self.active_sessions:
            task = self.active_sessions[session_id]
            # Cancel the task
            # task.cancel()  # Implement proper cancellation
            del self.active_sessions[session_id]
            return True
        return False
    
    def get_active_sessions(self) -> list:
        """Get list of active voice sessions"""
        return list(self.active_sessions.keys())
    
    def get_session_status(self, session_id: str) -> Optional[dict]:
        """Get status of a voice session"""
        if session_id in self.active_sessions:
            return {
                "session_id": session_id,
                "status": "active"
            }
        return None

# Global instance
voice_session_service = VoiceSessionService()