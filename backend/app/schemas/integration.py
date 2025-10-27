from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class IntegrationCreate(BaseModel):
    userId: str
    type: str  # twilio, calendar, crm
    provider: str  # google, salesforce, hubspot, etc
    credentials: dict  # Will be encrypted before storage

class IntegrationUpdate(BaseModel):
    credentials: Optional[dict] = None
    isActive: Optional[bool] = None

class IntegrationResponse(BaseModel):
    id: str
    userId: str
    type: str
    provider: str
    isActive: bool
    lastSyncedAt: Optional[datetime]
    syncStatus: Optional[str]
    errorCount: int
    createdAt: datetime
    # Note: credentials are not returned for security
    
    class Config:
        from_attributes = True