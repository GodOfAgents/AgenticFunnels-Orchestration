from openai import AsyncOpenAI
from app.core.config import settings
from app.services.knowledge_service import KnowledgeService
from typing import Optional, Dict
import uuid
from datetime import datetime

class ChatService:
    def __init__(self):
        self.client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        self.conversation_history: Dict[str, list] = {}
    
    async def process_message(
        self,
        agent_id: str,
        message: str,
        conversation_id: Optional[str] = None,
        user_info: dict = None
    ) -> dict:
        """
        Process a user message through the agent
        """
        # Create new conversation if needed
        if not conversation_id:
            conversation_id = str(uuid.uuid4())
            self.conversation_history[conversation_id] = []
        
        # Get agent configuration
        # TODO: Fetch from database
        agent_config = {
            "systemPrompt": "You are a helpful AI assistant for lead qualification and meeting scheduling.",
            "model": "gpt-4",
            "temperature": 0.7
        }
        
        # Get relevant context from knowledge base
        context = ""
        # TODO: Query knowledge base with RAG
        
        # Build conversation history
        if conversation_id not in self.conversation_history:
            self.conversation_history[conversation_id] = []
        
        messages = [
            {"role": "system", "content": agent_config["systemPrompt"]}
        ]
        
        if context:
            messages.append({
                "role": "system",
                "content": f"Relevant context from knowledge base:\n{context}"
            })
        
        # Add conversation history
        messages.extend(self.conversation_history[conversation_id])
        
        # Add current user message
        messages.append({"role": "user", "content": message})
        
        try:
            # Call OpenAI API
            response = await self.client.chat.completions.create(
                model=agent_config["model"],
                messages=messages,
                temperature=agent_config["temperature"],
                max_tokens=500
            )
            
            assistant_message = response.choices[0].message.content
            
            # Update conversation history
            self.conversation_history[conversation_id].append(
                {"role": "user", "content": message}
            )
            self.conversation_history[conversation_id].append(
                {"role": "assistant", "content": assistant_message}
            )
            
            # Limit history to last 20 messages
            if len(self.conversation_history[conversation_id]) > 20:
                self.conversation_history[conversation_id] = \
                    self.conversation_history[conversation_id][-20:]
            
            # TODO: Save messages to database
            
            return {
                "conversation_id": conversation_id,
                "message": assistant_message,
                "timestamp": datetime.utcnow().isoformat(),
                "tokens_used": response.usage.total_tokens if response.usage else 0
            }
            
        except Exception as e:
            print(f"Error processing message: {e}")
            return {
                "conversation_id": conversation_id,
                "error": "Failed to process message",
                "message": "I apologize, but I'm having trouble processing your request right now. Please try again."
            }
    
    async def analyze_intent(self, message: str) -> dict:
        """
        Analyze user intent from message
        """
        try:
            response = await self.client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {
                        "role": "system",
                        "content": "Analyze the user's intent. Classify as: information_request, meeting_scheduling, support, or other. Also extract any entities like name, email, company."
                    },
                    {"role": "user", "content": message}
                ],
                temperature=0.3
            )
            
            # TODO: Parse response and return structured intent
            return {
                "intent": "information_request",
                "entities": {}
            }
            
        except Exception as e:
            print(f"Error analyzing intent: {e}")
            return {"intent": "other", "entities": {}}