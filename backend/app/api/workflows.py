from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.services.workflow_service import workflow_service
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime

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


@router.get("/node-types")
async def get_node_types():
    """
    Get available workflow node types and their configurations
    """
    return {
        "node_types": [
            {
                "type": "trigger",
                "label": "Trigger",
                "description": "Start the workflow based on an event",
                "icon": "play",
                "config_schema": {
                    "event": {"type": "select", "options": ["conversation_start", "lead_qualified", "meeting_requested", "webhook"]}
                }
            },
            {
                "type": "message",
                "label": "Send Message",
                "description": "Send a text message to the user",
                "icon": "message",
                "config_schema": {
                    "text": {"type": "textarea", "placeholder": "Enter message text..."}
                }
            },
            {
                "type": "collect_info",
                "label": "Collect Information",
                "description": "Collect specific information from user",
                "icon": "form",
                "config_schema": {
                    "fields": {"type": "array", "placeholder": "e.g., name, email, phone"}
                }
            },
            {
                "type": "decision",
                "label": "Decision/Condition",
                "description": "Branch based on a condition",
                "icon": "git-branch",
                "config_schema": {
                    "condition": {"type": "text", "placeholder": "e.g., interested_in_demo"},
                    "true_path": {"type": "text", "placeholder": "Node ID for true path"},
                    "false_path": {"type": "text", "placeholder": "Node ID for false path"}
                }
            },
            {
                "type": "rag_query",
                "label": "RAG Query",
                "description": "Query knowledge base for information",
                "icon": "database",
                "config_schema": {
                    "agent_id": {"type": "text", "placeholder": "Agent ID"},
                    "query": {"type": "text", "placeholder": "Search query (supports {{variables}})"}
                }
            },
            {
                "type": "api_call",
                "label": "API Call",
                "description": "Call external REST API",
                "icon": "cloud",
                "config_schema": {
                    "url": {"type": "text", "placeholder": "https://api.example.com/endpoint"},
                    "method": {"type": "select", "options": ["GET", "POST", "PUT", "DELETE"]},
                    "headers": {"type": "json", "placeholder": "{\"Authorization\": \"Bearer token\"}"},
                    "body": {"type": "json", "placeholder": "{\"key\": \"{{value}}\"}"}
                }
            },
            {
                "type": "webhook",
                "label": "Webhook",
                "description": "Send data to webhook URL",
                "icon": "send",
                "config_schema": {
                    "url": {"type": "text", "placeholder": "https://hooks.example.com/webhook"},
                    "payload": {"type": "json", "placeholder": "{\"event\": \"lead_captured\"}"}
                }
            },
            {
                "type": "schedule_meeting",
                "label": "Schedule Meeting",
                "description": "Schedule a meeting via calendar",
                "icon": "calendar",
                "config_schema": {
                    "calendar_type": {"type": "select", "options": ["google", "calendly"]},
                    "duration": {"type": "number", "placeholder": "30"},
                    "title": {"type": "text", "placeholder": "Meeting title"}
                }
            },
            {
                "type": "crm_update",
                "label": "CRM Update",
                "description": "Update CRM with lead data",
                "icon": "users",
                "config_schema": {
                    "data": {"type": "json", "placeholder": "{\"lead_name\": \"{{name}}\"}"}
                }
            },
            {
                "type": "email",
                "label": "Send Email",
                "description": "Send an email notification",
                "icon": "mail",
                "config_schema": {
                    "to": {"type": "text", "placeholder": "{{email}}"},
                    "subject": {"type": "text", "placeholder": "Email subject"},
                    "body": {"type": "textarea", "placeholder": "Email body"}
                }
            },
            {
                "type": "delay",
                "label": "Delay",
                "description": "Wait for specified time",
                "icon": "clock",
                "config_schema": {
                    "seconds": {"type": "number", "placeholder": "5"}
                }
            }
        ]
    }

@router.get("/templates")
async def get_workflow_templates():
    """
    Get pre-built workflow templates
    """
    return {
        "templates": [
            {
                "id": "lead_qualification",
                "name": "Lead Qualification & Scheduling",
                "description": "Qualify leads and schedule demo meetings",
                "nodes": [
                    {
                        "id": "trigger_1",
                        "type": "trigger",
                        "config": {"event": "conversation_start"},
                        "next": "message_1",
                        "position": {"x": 100, "y": 100}
                    },
                    {
                        "id": "message_1",
                        "type": "message",
                        "config": {"text": "Hello! Thanks for your interest. Let me help you."},
                        "next": "collect_1",
                        "position": {"x": 100, "y": 200}
                    },
                    {
                        "id": "collect_1",
                        "type": "collect_info",
                        "config": {"fields": ["name", "email", "company"]},
                        "next": "decision_1",
                        "position": {"x": 100, "y": 300}
                    },
                    {
                        "id": "decision_1",
                        "type": "decision",
                        "config": {
                            "condition": "interested_in_demo",
                            "true_path": "schedule_1",
                            "false_path": "email_1"
                        },
                        "position": {"x": 100, "y": 400}
                    },
                    {
                        "id": "schedule_1",
                        "type": "schedule_meeting",
                        "config": {"calendar_type": "google", "duration": 30},
                        "next": "crm_1",
                        "position": {"x": 300, "y": 500}
                    },
                    {
                        "id": "email_1",
                        "type": "email",
                        "config": {
                            "to": "{{email}}",
                            "subject": "Thank you for your interest",
                            "body": "We've sent you more information."
                        },
                        "next": "crm_1",
                        "position": {"x": -100, "y": 500}
                    },
                    {
                        "id": "crm_1",
                        "type": "crm_update",
                        "config": {
                            "data": {
                                "lead_name": "{{name}}",
                                "email": "{{email}}",
                                "company": "{{company}}",
                                "status": "qualified"
                            }
                        },
                        "next": None,
                        "position": {"x": 100, "y": 600}
                    }
                ]
            },
            {
                "id": "support_ticket",
                "name": "Support Ticket Creation",
                "description": "Create support tickets from conversations",
                "nodes": [
                    {
                        "id": "trigger_1",
                        "type": "trigger",
                        "config": {"event": "conversation_start"},
                        "next": "collect_1",
                        "position": {"x": 100, "y": 100}
                    },
                    {
                        "id": "collect_1",
                        "type": "collect_info",
                        "config": {"fields": ["name", "email", "issue_description"]},
                        "next": "rag_1",
                        "position": {"x": 100, "y": 200}
                    },
                    {
                        "id": "rag_1",
                        "type": "rag_query",
                        "config": {
                            "agent_id": "{{agent_id}}",
                            "query": "{{issue_description}}"
                        },
                        "next": "decision_1",
                        "position": {"x": 100, "y": 300}
                    },
                    {
                        "id": "decision_1",
                        "type": "decision",
                        "config": {
                            "condition": "issue_resolved",
                            "true_path": "message_1",
                            "false_path": "webhook_1"
                        },
                        "position": {"x": 100, "y": 400}
                    },
                    {
                        "id": "message_1",
                        "type": "message",
                        "config": {"text": "Great! I found a solution for you."},
                        "next": None,
                        "position": {"x": 300, "y": 500}
                    },
                    {
                        "id": "webhook_1",
                        "type": "webhook",
                        "config": {
                            "url": "https://support.example.com/api/tickets",
                            "payload": {
                                "customer_name": "{{name}}",
                                "email": "{{email}}",
                                "description": "{{issue_description}}"
                            }
                        },
                        "next": None,
                        "position": {"x": -100, "y": 500}
                    }
                ]
            }
        ]
    }

@router.put("/{workflow_id}")
async def update_workflow(
    workflow_id: str,
    workflow_data: WorkflowCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    Update an existing workflow
    """
    workflow = await workflow_service.get_workflow(workflow_id)
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    
    # Update workflow
    workflow.update({
        "name": workflow_data.name,
        "description": workflow_data.description,
        "trigger": workflow_data.trigger,
        "nodes": [node.dict() for node in workflow_data.nodes],
        "updated_at": datetime.utcnow().isoformat()
    })
    
    return workflow
