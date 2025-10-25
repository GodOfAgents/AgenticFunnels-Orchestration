from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.services.knowledge_service import KnowledgeService

router = APIRouter()

@router.post("/upload")
async def upload_document(
    agent_id: str,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db)
):
    """
    Upload a document to agent's knowledge base
    """
    service = KnowledgeService(db)
    result = await service.upload_document(agent_id, file)
    return result

@router.get("/agent/{agent_id}")
async def get_knowledge_base(
    agent_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Get all knowledge base items for an agent
    """
    service = KnowledgeService(db)
    items = await service.get_agent_knowledge(agent_id)
    return items

@router.delete("/{kb_id}")
async def delete_knowledge_item(
    kb_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Delete a knowledge base item
    """
    service = KnowledgeService(db)
    success = await service.delete_knowledge(kb_id)
    if not success:
        raise HTTPException(status_code=404, detail="Knowledge base item not found")
    return {"message": "Knowledge base item deleted"}

@router.post("/query")
async def query_knowledge(
    agent_id: str,
    query: str,
    top_k: int = 5,
    db: AsyncSession = Depends(get_db)
):
    """
    Query the knowledge base using RAG
    """
    service = KnowledgeService(db)
    results = await service.query_knowledge(agent_id, query, top_k)
    return results