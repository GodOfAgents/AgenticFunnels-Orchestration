from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from app.core.database import get_db
from app.services.admin_service import AdminService

router = APIRouter()

@router.get("/dashboard")
async def get_admin_dashboard(
    db: AsyncSession = Depends(get_db)
):
    """
    Get admin dashboard overview with real-time metrics
    """
    service = AdminService(db)
    dashboard_data = await service.get_dashboard_metrics()
    return dashboard_data

@router.get("/agents")
async def list_all_agents(
    status: Optional[str] = None,
    flagged: Optional[bool] = None,
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db)
):
    """
    List all agents across all users (admin view)
    """
    service = AdminService(db)
    agents = await service.list_all_agents(status, flagged, skip, limit)
    return agents

@router.get("/conversations")
async def list_all_conversations(
    status: Optional[str] = None,
    flagged: Optional[bool] = None,
    search: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db)
):
    """
    List all conversations with search and filters
    """
    service = AdminService(db)
    conversations = await service.list_all_conversations(status, flagged, search, skip, limit)
    return conversations

@router.get("/integrations")
async def list_all_integrations(
    type: Optional[str] = None,
    status: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """
    List all integrations across users
    """
    service = AdminService(db)
    integrations = await service.list_all_integrations(type, status)
    return integrations

@router.get("/anomalies")
async def get_anomalies(
    severity: Optional[str] = None,
    resolved: Optional[bool] = None,
    skip: int = 0,
    limit: int = 50,
    db: AsyncSession = Depends(get_db)
):
    """
    Get detected anomalies
    """
    service = AdminService(db)
    anomalies = await service.get_anomalies(severity, resolved, skip, limit)
    return anomalies

@router.post("/anomalies/{anomaly_id}/resolve")
async def resolve_anomaly(
    anomaly_id: str,
    resolved_by: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Mark anomaly as resolved
    """
    service = AdminService(db)
    anomaly = await service.resolve_anomaly(anomaly_id, resolved_by)
    if not anomaly:
        raise HTTPException(status_code=404, detail="Anomaly not found")
    return anomaly

@router.get("/system-metrics")
async def get_system_metrics(
    db: AsyncSession = Depends(get_db)
):
    """
    Get current system health metrics
    """
    service = AdminService(db)
    metrics = await service.get_system_metrics()
    return metrics

@router.get("/analytics")
async def get_platform_analytics(
    days: int = Query(30, ge=1, le=365),
    db: AsyncSession = Depends(get_db)
):
    """
    Get platform analytics for specified period
    """
    service = AdminService(db)
    analytics = await service.get_platform_analytics(days)
    return analytics

@router.get("/audit-logs")
async def get_audit_logs(
    user_id: Optional[str] = None,
    action: Optional[str] = None,
    resource: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db)
):
    """
    Get audit logs with filters
    """
    service = AdminService(db)
    logs = await service.get_audit_logs(user_id, action, resource, skip, limit)
    return logs

@router.post("/agents/{agent_id}/flag")
async def flag_agent(
    agent_id: str,
    reason: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Flag an agent for review
    """
    service = AdminService(db)
    result = await service.flag_agent(agent_id, reason)
    return result

@router.post("/conversations/{conversation_id}/flag")
async def flag_conversation(
    conversation_id: str,
    reason: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Flag a conversation for review
    """
    service = AdminService(db)
    result = await service.flag_conversation(conversation_id, reason)
    return result