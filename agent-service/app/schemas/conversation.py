from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class MessageCreate(BaseModel):
    role: str = Field(..., description="user, agent, or system")
    content: str
    audioUrl: Optional[str] = None
    metadata: Optional[dict] = None

class MessageResponse(MessageCreate):
    id: str
    conversationId: str
    createdAt: datetime
    isFlagged: bool
    
    class Config:
        from_attributes = True

class ConversationCreate(BaseModel):
    agentId: str
    channel: str = Field(..., description="text, voice, whatsapp, sms")
    customerName: Optional[str] = None
    customerEmail: Optional[str] = None
    customerPhone: Optional[str] = None

class ConversationResponse(BaseModel):
    id: str
    agentId: str
    channel: str
    status: str
    customerName: Optional[str]
    customerEmail: Optional[str]
    customerPhone: Optional[str]
    sentiment: Optional[str]
    duration: Optional[int]
    isFlagged: bool
    createdAt: datetime
    updatedAt: datetime
    messages: List[MessageResponse] = []
    
    class Config:
        from_attributes = True

class LeadDataCreate(BaseModel):
    name: str
    email: str
    company: Optional[str] = None
    phone: Optional[str] = None
    qualified: bool = False
    qualificationScore: Optional[float] = None
    customFields: Optional[dict] = None

class LeadDataResponse(LeadDataCreate):
    id: str
    conversationId: str
    meetingScheduled: bool
    meetingTime: Optional[datetime]
    crmSynced: bool
    crmId: Optional[str]
    createdAt: datetime
    
    class Config:
        from_attributes = True