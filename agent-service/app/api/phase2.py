from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.services.voice_session_service import voice_session_service
from app.services.calendar_service import calendar_service
from app.services.webhook_service import webhook_service
from pydantic import BaseModel
from typing import Dict, Optional, Any
from datetime import datetime

router = APIRouter()

# Voice Session Models
class VoiceSessionCreate(BaseModel):
    agent_id: str
    agent_config: dict
    user_credentials: Dict[str, str]  # deepgram_api_key, elevenlabs_api_key, openai_api_key
    room_url: Optional[str] = None

# Calendar Models
class GoogleAvailabilityCheck(BaseModel):
    credentials: dict
    start_time: datetime
    end_time: datetime

class GoogleEventCreate(BaseModel):
    credentials: dict
    event_details: dict

class CalendlyAvailabilityCheck(BaseModel):
    api_key: str
    user_uri: str

class CalendlySchedulingLink(BaseModel):
    api_key: str
    event_type_uri: str
    invitee_data: dict

# Webhook Models
class WebhookSend(BaseModel):
    webhook_url: str
    data: dict
    headers: Optional[Dict[str, str]] = None
    method: str = "POST"
    auth: Optional[dict] = None

class CRMLeadSend(BaseModel):
    webhook_url: str
    lead_data: dict
    auth: Optional[dict] = None
    field_mapping: Optional[Dict[str, str]] = None

class WebhookTest(BaseModel):
    webhook_url: str
    auth: Optional[dict] = None

# Voice Session Endpoints
@router.post("/voice/session")
async def create_voice_session(
    session_data: VoiceSessionCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new voice session
    User must provide their own API keys for Deepgram, ElevenLabs, and OpenAI
    """
    try:
        session = await voice_session_service.create_voice_session(
            agent_id=session_data.agent_id,
            agent_config=session_data.agent_config,
            user_credentials=session_data.user_credentials,
            room_url=session_data.room_url
        )
        return session
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/voice/session/{session_id}")
async def end_voice_session(
    session_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    End a voice session
    """
    success = await voice_session_service.end_session(session_id)
    if not success:
        raise HTTPException(status_code=404, detail="Session not found")
    return {"message": "Session ended successfully"}

@router.get("/voice/sessions")
async def list_voice_sessions(
    db: AsyncSession = Depends(get_db)
):
    """
    List active voice sessions
    """
    sessions = voice_session_service.get_active_sessions()
    return {"sessions": sessions}

@router.get("/voice/session/{session_id}")
async def get_voice_session_status(
    session_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Get voice session status
    """
    status = voice_session_service.get_session_status(session_id)
    if not status:
        raise HTTPException(status_code=404, detail="Session not found")
    return status

# Calendar Endpoints
@router.post("/calendar/google/availability")
async def check_google_availability(
    availability_data: GoogleAvailabilityCheck,
    db: AsyncSession = Depends(get_db)
):
    """
    Check availability on Google Calendar
    """
    slots = await calendar_service.check_availability_google(
        credentials=availability_data.credentials,
        start_time=availability_data.start_time,
        end_time=availability_data.end_time
    )
    return {"available_slots": slots}

@router.post("/calendar/google/event")
async def create_google_event(
    event_data: GoogleEventCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    Create event on Google Calendar
    """
    try:
        event = await calendar_service.create_event_google(
            credentials=event_data.credentials,
            event_details=event_data.event_details
        )
        return event
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/calendar/calendly/availability")
async def check_calendly_availability(
    availability_data: CalendlyAvailabilityCheck,
    db: AsyncSession = Depends(get_db)
):
    """
    Check availability on Calendly
    """
    event_types = await calendar_service.check_availability_calendly(
        api_key=availability_data.api_key,
        user_uri=availability_data.user_uri
    )
    return {"event_types": event_types}

@router.post("/calendar/calendly/scheduling-link")
async def create_calendly_link(
    link_data: CalendlySchedulingLink,
    db: AsyncSession = Depends(get_db)
):
    """
    Create Calendly scheduling link
    """
    try:
        link = await calendar_service.create_scheduling_link_calendly(
            api_key=link_data.api_key,
            event_type_uri=link_data.event_type_uri,
            invitee_data=link_data.invitee_data
        )
        return link
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Webhook/CRM Endpoints
@router.post("/webhook/send")
async def send_webhook(
    webhook_data: WebhookSend,
    db: AsyncSession = Depends(get_db)
):
    """
    Send data to a webhook URL
    Generic endpoint for any webhook integration
    """
    result = await webhook_service.send_webhook(
        webhook_url=webhook_data.webhook_url,
        data=webhook_data.data,
        headers=webhook_data.headers,
        method=webhook_data.method,
        auth=webhook_data.auth
    )
    return result

@router.post("/webhook/crm/lead")
async def send_crm_lead(
    lead_data: CRMLeadSend,
    db: AsyncSession = Depends(get_db)
):
    """
    Send lead data to CRM webhook
    """
    result = await webhook_service.send_crm_lead(
        webhook_url=lead_data.webhook_url,
        lead_data=lead_data.lead_data,
        auth=lead_data.auth,
        field_mapping=lead_data.field_mapping
    )
    return result

@router.post("/webhook/test")
async def test_webhook(
    test_data: WebhookTest,
    db: AsyncSession = Depends(get_db)
):
    """
    Test webhook connection
    """
    result = await webhook_service.test_webhook(
        webhook_url=test_data.webhook_url,
        auth=test_data.auth
    )
    return result