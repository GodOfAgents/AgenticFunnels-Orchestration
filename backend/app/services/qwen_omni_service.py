"""
Qwen 3 Omni Service for AFO Platform
Handles end-to-end multimodal voice conversations
Replaces the STT -> LLM -> TTS pipeline with a single model
"""

from typing import Optional, Dict, AsyncIterator
import asyncio
import uuid
import os
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer, TextIteratorStreamer
from threading import Thread
import numpy as np
import soundfile as sf
import io


class Qwen3OmniService:
    """
    Qwen 3 Omni Service - End-to-End Voice AI
    Handles: Speech Recognition + Understanding + Response + Speech Synthesis
    All in one model!
    """
    
    def __init__(self):
        self.model = None
        self.tokenizer = None
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.model_id = os.getenv("QWEN_MODEL_ID", "Qwen/Qwen3-Omni-30B-A3B-Instruct")
        self.active_sessions: Dict[str, Dict] = {}
        self.is_loaded = False
        
    async def load_model(self):
        """
        Load Qwen 3 Omni model into memory
        This is resource-intensive, do it once at startup
        """
        if self.is_loaded:
            return
            
        print(f"🚀 Loading Qwen 3 Omni model: {self.model_id}")
        print(f"📍 Device: {self.device}")
        
        try:
            # Load tokenizer
            self.tokenizer = AutoTokenizer.from_pretrained(
                self.model_id,
                trust_remote_code=True
            )
            
            # Load model with optimizations
            self.model = AutoModelForCausalLM.from_pretrained(
                self.model_id,
                device_map="auto",
                torch_dtype=torch.float16 if self.device == "cuda" else torch.float32,
                trust_remote_code=True,
                # Use Flash Attention 2 if available (faster, lower memory)
                attn_implementation="flash_attention_2" if self.device == "cuda" else None
            )
            
            self.model.eval()  # Set to evaluation mode
            self.is_loaded = True
            
            print("✅ Qwen 3 Omni model loaded successfully!")
            
        except Exception as e:
            print(f"❌ Failed to load Qwen 3 Omni model: {e}")
            raise
    
    async def create_voice_session(
        self,
        agent_id: str,
        agent_config: dict,
        session_config: Optional[dict] = None
    ) -> dict:
        """
        Create a new voice session with Qwen 3 Omni
        
        Args:
            agent_id: Agent identifier
            agent_config: Agent configuration (system prompt, persona, voice settings)
            session_config: Optional session configuration
            
        Returns:
            Session details including session_id and configuration
        """
        if not self.is_loaded:
            await self.load_model()
        
        session_id = str(uuid.uuid4())
        
        # Extract configuration
        system_prompt = agent_config.get("system_prompt", "You are a helpful AI assistant.")
        voice_id = agent_config.get("voice_id", 0)  # Qwen supports multiple voices
        language = agent_config.get("language", "en")  # Auto-detect by default
        
        # Create session context
        session = {
            "session_id": session_id,
            "agent_id": agent_id,
            "system_prompt": system_prompt,
            "voice_id": voice_id,
            "language": language,
            "conversation_history": [],
            "status": "active",
            "created_at": asyncio.get_event_loop().time()
        }
        
        self.active_sessions[session_id] = session
        
        return {
            "session_id": session_id,
            "agent_id": agent_id,
            "status": "active",
            "capabilities": {
                "audio_input": True,
                "video_input": True,
                "text_input": True,
                "audio_output": True,
                "text_output": True,
                "multi_language": True,
                "emotion_detection": True,
                "voice_personas": 17
            },
            "latency_ms": 211,  # Qwen 3 Omni average latency
            "model": self.model_id
        }
    
    async def process_audio(
        self,
        session_id: str,
        audio_data: bytes,
        sample_rate: int = 16000,
        stream: bool = True
    ) -> AsyncIterator[Dict]:
        """
        Process audio input and generate response
        
        Args:
            session_id: Session identifier
            audio_data: Raw audio bytes (PCM format)
            sample_rate: Audio sample rate (default 16kHz)
            stream: Whether to stream responses
            
        Yields:
            Response chunks with audio and text
        """
        if session_id not in self.active_sessions:
            raise ValueError(f"Session {session_id} not found")
        
        session = self.active_sessions[session_id]
        
        try:
            # 1. Audio Understanding (Built-in to Qwen 3 Omni)
            # Convert audio bytes to tensor
            audio_array = np.frombuffer(audio_data, dtype=np.int16)
            audio_tensor = torch.from_numpy(audio_array).float() / 32768.0
            
            # 2. Construct multimodal prompt
            messages = [
                {"role": "system", "content": session["system_prompt"]},
            ]
            
            # Add conversation history
            for turn in session["conversation_history"]:
                messages.append(turn)
            
            # Add current audio input
            messages.append({
                "role": "user",
                "content": [
                    {"type": "audio", "audio": audio_tensor},
                ]
            })
            
            # 3. Generate response with audio output
            if stream:
                async for chunk in self._stream_response(messages, session):
                    yield chunk
            else:
                response = await self._generate_response(messages, session)
                yield response
                
        except Exception as e:
            print(f"❌ Error processing audio: {e}")
            yield {
                "type": "error",
                "message": str(e),
                "session_id": session_id
            }
    
    async def _stream_response(
        self,
        messages: list,
        session: dict
    ) -> AsyncIterator[Dict]:
        """
        Stream response generation with audio output
        """
        # Prepare input for model
        text = self.tokenizer.apply_chat_template(
            messages,
            tokenize=False,
            add_generation_prompt=True
        )
        
        # Create streamer for real-time text generation
        streamer = TextIteratorStreamer(
            self.tokenizer,
            skip_prompt=True,
            skip_special_tokens=True
        )
        
        # Tokenize input
        inputs = self.tokenizer(
            text,
            return_tensors="pt",
            padding=True
        ).to(self.device)
        
        # Generation parameters
        generation_kwargs = dict(
            inputs,
            streamer=streamer,
            max_new_tokens=1024,
            temperature=0.7,
            top_p=0.9,
            do_sample=True,
            # Enable audio generation
            output_audio=True,
            voice_id=session["voice_id"]
        )
        
        # Generate in background thread
        thread = Thread(target=self.model.generate, kwargs=generation_kwargs)
        thread.start()
        
        # Stream responses
        full_response = ""
        for text_chunk in streamer:
            full_response += text_chunk
            
            yield {
                "type": "text",
                "content": text_chunk,
                "session_id": session["session_id"]
            }
        
        # Add to conversation history
        session["conversation_history"].append({
            "role": "assistant",
            "content": full_response
        })
        
        # Generate audio for complete response
        # Note: In production, you'd stream audio chunks too
        audio_output = await self._generate_audio(full_response, session)
        
        yield {
            "type": "audio",
            "content": audio_output,
            "format": "wav",
            "sample_rate": 24000,
            "session_id": session["session_id"]
        }
        
        yield {
            "type": "complete",
            "session_id": session["session_id"]
        }
    
    async def _generate_response(
        self,
        messages: list,
        session: dict
    ) -> Dict:
        """
        Generate complete response (non-streaming)
        """
        # Prepare input
        text = self.tokenizer.apply_chat_template(
            messages,
            tokenize=False,
            add_generation_prompt=True
        )
        
        inputs = self.tokenizer(
            text,
            return_tensors="pt",
            padding=True
        ).to(self.device)
        
        # Generate
        with torch.no_grad():
            outputs = self.model.generate(
                **inputs,
                max_new_tokens=1024,
                temperature=0.7,
                top_p=0.9,
                do_sample=True,
                output_audio=True,
                voice_id=session["voice_id"]
            )
        
        # Decode text response
        response_text = self.tokenizer.decode(
            outputs[0],
            skip_special_tokens=True
        )
        
        # Get audio output
        audio_output = await self._generate_audio(response_text, session)
        
        # Update conversation history
        session["conversation_history"].append({
            "role": "assistant",
            "content": response_text
        })
        
        return {
            "type": "complete",
            "text": response_text,
            "audio": audio_output,
            "session_id": session["session_id"]
        }
    
    async def _generate_audio(
        self,
        text: str,
        session: dict
    ) -> bytes:
        """
        Generate audio from text using Qwen 3 Omni's built-in TTS
        """
        # This is a placeholder - actual implementation depends on
        # Qwen 3 Omni's audio generation API
        # The model can generate audio directly, but the exact API
        # may vary based on the model version
        
        try:
            # Use Qwen's built-in audio generation
            # Note: This is conceptual - adjust based on actual Qwen API
            audio_tensor = self.model.generate_audio(
                text=text,
                voice_id=session["voice_id"],
                language=session["language"]
            )
            
            # Convert to WAV bytes
            audio_np = audio_tensor.cpu().numpy()
            audio_bytes = io.BytesIO()
            sf.write(audio_bytes, audio_np, 24000, format='WAV')
            audio_bytes.seek(0)
            
            return audio_bytes.read()
            
        except Exception as e:
            print(f"⚠️ Audio generation error: {e}")
            # Fallback to empty audio
            return b""
    
    async def process_text(
        self,
        session_id: str,
        text: str,
        stream: bool = True
    ) -> AsyncIterator[Dict]:
        """
        Process text input (for text-only conversations)
        
        Args:
            session_id: Session identifier
            text: User text input
            stream: Whether to stream responses
            
        Yields:
            Response chunks
        """
        if session_id not in self.active_sessions:
            raise ValueError(f"Session {session_id} not found")
        
        session = self.active_sessions[session_id]
        
        # Construct messages
        messages = [
            {"role": "system", "content": session["system_prompt"]},
        ]
        
        for turn in session["conversation_history"]:
            messages.append(turn)
        
        messages.append({
            "role": "user",
            "content": text
        })
        
        # Generate response
        if stream:
            async for chunk in self._stream_response(messages, session):
                yield chunk
        else:
            response = await self._generate_response(messages, session)
            yield response
    
    async def end_session(self, session_id: str) -> bool:
        """
        End a voice session and cleanup resources
        
        Args:
            session_id: Session identifier
            
        Returns:
            True if session was ended successfully
        """
        if session_id in self.active_sessions:
            del self.active_sessions[session_id]
            return True
        return False
    
    def get_session_status(self, session_id: str) -> Optional[Dict]:
        """
        Get status of a voice session
        
        Args:
            session_id: Session identifier
            
        Returns:
            Session status or None if not found
        """
        session = self.active_sessions.get(session_id)
        if not session:
            return None
        
        return {
            "session_id": session_id,
            "agent_id": session["agent_id"],
            "status": session["status"],
            "message_count": len(session["conversation_history"]),
            "created_at": session["created_at"],
            "uptime_seconds": asyncio.get_event_loop().time() - session["created_at"]
        }
    
    def get_active_sessions(self) -> list:
        """
        Get all active voice sessions
        
        Returns:
            List of active session IDs
        """
        return list(self.active_sessions.keys())


# Global instance
qwen_service = Qwen3OmniService()
