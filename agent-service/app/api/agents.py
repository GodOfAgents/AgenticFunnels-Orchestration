from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from app.core.database import get_db
from app.schemas.agent import AgentCreate, AgentResponse, AgentUpdate
from app.services.agent_service import AgentService

router = APIRouter()

@router.post("/", response_model=AgentResponse, status_code=status.HTTP_201_CREATED)
async def create_agent(
    agent_data: AgentCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new AI agent
    """
    service = AgentService(db)
    agent = await service.create_agent(agent_data)
    return agent

@router.get("/", response_model=List[AgentResponse])
async def list_agents(
    user_id: str,
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db)
):
    """
    List all agents for a user
    """
    service = AgentService(db)
    agents = await service.list_agents(user_id, skip, limit)
    return agents

@router.get("/{agent_id}", response_model=AgentResponse)
async def get_agent(
    agent_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Get agent by ID
    """
    service = AgentService(db)
    agent = await service.get_agent(agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    return agent

@router.put("/{agent_id}", response_model=AgentResponse)
async def update_agent(
    agent_id: str,
    agent_data: AgentUpdate,
    db: AsyncSession = Depends(get_db)
):
    """
    Update agent configuration
    """
    service = AgentService(db)
    agent = await service.update_agent(agent_id, agent_data)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    return agent

@router.delete("/{agent_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_agent(
    agent_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Delete an agent
    """
    service = AgentService(db)
    success = await service.delete_agent(agent_id)
    if not success:
        raise HTTPException(status_code=404, detail="Agent not found")
    return {"message": "Agent deleted successfully"}

@router.post("/{agent_id}/activate")
async def activate_agent(
    agent_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Activate an agent
    """
    service = AgentService(db)
    agent = await service.toggle_agent_status(agent_id, True)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    return {"message": "Agent activated", "agent": agent}

@router.post("/{agent_id}/deactivate")
async def deactivate_agent(
    agent_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Deactivate an agent
    """
    service = AgentService(db)
    agent = await service.toggle_agent_status(agent_id, False)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    return {"message": "Agent deactivated", "agent": agent}