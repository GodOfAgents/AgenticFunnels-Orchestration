from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class AgentBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    role: str = Field(..., min_length=1, max_length=200)
    persona: str = Field(..., description="Agent persona: formal, casual, expert")
    systemPrompt: str = Field(..., description="System prompt for the agent")
    voiceEnabled: bool = False
    voiceId: Optional[str] = None

class AgentCreate(AgentBase):
    userId: str

class AgentUpdate(BaseModel):
    name: Optional[str] = None
    role: Optional[str] = None
    persona: Optional[str] = None
    systemPrompt: Optional[str] = None
    voiceEnabled: Optional[bool] = None
    voiceId: Optional[str] = None
    isActive: Optional[bool] = None

class AgentResponse(AgentBase):
    id: str
    userId: str
    createdAt: datetime
    updatedAt: datetime
    isActive: bool
    isFlagged: bool
    totalConversations: int
    successRate: float
    avgResponseTime: float
    
    class Config:
        from_attributes = True