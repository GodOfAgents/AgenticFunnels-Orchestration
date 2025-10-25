from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from app.core.database import get_db
from app.schemas.conversation import ConversationCreate, ConversationResponse, MessageCreate
from app.services.conversation_service import ConversationService

router = APIRouter()

@router.post("/", status_code=201)
async def create_conversation(
    conversation_data: ConversationCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new conversation
    """
    service = ConversationService(db)
    conversation = await service.create_conversation(conversation_data)
    return conversation

@router.get("/", response_model=List[ConversationResponse])
async def list_conversations(
    agent_id: str = None,
    status: str = None,
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db)
):
    """
    List conversations with filters
    """
    service = ConversationService(db)
    conversations = await service.list_conversations(agent_id, status, skip, limit)
    return conversations

@router.get("/{conversation_id}", response_model=ConversationResponse)
async def get_conversation(
    conversation_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Get conversation by ID with all messages
    """
    service = ConversationService(db)
    conversation = await service.get_conversation(conversation_id)
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return conversation

@router.post("/{conversation_id}/messages")
async def add_message(
    conversation_id: str,
    message_data: MessageCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    Add a message to a conversation
    """
    service = ConversationService(db)
    message = await service.add_message(conversation_id, message_data)
    return message