from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.services.workflow_service import workflow_service
from pydantic import BaseModel
from typing import List, Dict, Any, Optional

router = APIRouter()

class WorkflowNode(BaseModel):
    id: str
    type: str  # message, collect_info, decision, schedule_meeting, api_call, crm_update
    config: Dict[str, Any]
    next: Optional[str] = None

class WorkflowCreate(BaseModel):
    agent_id: str
    name: str
    description: str
    trigger: str  # conversation_start, lead_qualified, etc.
    nodes: List[WorkflowNode]

class WorkflowExecute(BaseModel):
    context: Dict[str, Any]
    user_integrations: Dict[str, Any]

@router.post("/")
async def create_workflow(
    workflow_data: WorkflowCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new workflow
    """
    workflow = await workflow_service.create_workflow(
        agent_id=workflow_data.agent_id,
        workflow_data=workflow_data.dict()
    )
    return workflow

@router.get("/agent/{agent_id}")
async def list_workflows(
    agent_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    List workflows for an agent
    """
    workflows = await workflow_service.list_workflows(agent_id)
    return {"workflows": workflows}

@router.get("/{workflow_id}")
async def get_workflow(
    workflow_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Get workflow details
    """
    workflow = await workflow_service.get_workflow(workflow_id)
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return workflow

@router.post("/{workflow_id}/execute")
async def execute_workflow(
    workflow_id: str,
    execution_data: WorkflowExecute,
    db: AsyncSession = Depends(get_db)
):
    """
    Execute a workflow
    """
    execution = await workflow_service.execute_workflow(
        workflow_id=workflow_id,
        context=execution_data.context,
        user_integrations=execution_data.user_integrations
    )
    return execution

@router.delete("/{workflow_id}")
async def delete_workflow(
    workflow_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Delete a workflow
    """
    success = await workflow_service.delete_workflow(workflow_id)
    if not success:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return {"message": "Workflow deleted successfully"}

@router.get("/execution/{execution_id}")
async def get_execution(
    execution_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Get workflow execution details
    """
    execution = await workflow_service.get_execution(execution_id)
    if not execution:
        raise HTTPException(status_code=404, detail="Execution not found")
    return execution