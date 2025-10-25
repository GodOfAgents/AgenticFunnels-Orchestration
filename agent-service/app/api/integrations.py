from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.schemas.integration import IntegrationCreate, IntegrationResponse
from app.services.integration_service import IntegrationService

router = APIRouter()

@router.post("/", status_code=201)
async def create_integration(
    integration_data: IntegrationCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new integration
    """
    service = IntegrationService(db)
    integration = await service.create_integration(integration_data)
    return integration

@router.get("/user/{user_id}")
async def list_user_integrations(
    user_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    List all integrations for a user
    """
    service = IntegrationService(db)
    integrations = await service.list_user_integrations(user_id)
    return integrations

@router.put("/{integration_id}")
async def update_integration(
    integration_id: str,
    integration_data: dict,
    db: AsyncSession = Depends(get_db)
):
    """
    Update integration credentials
    """
    service = IntegrationService(db)
    integration = await service.update_integration(integration_id, integration_data)
    if not integration:
        raise HTTPException(status_code=404, detail="Integration not found")
    return integration

@router.delete("/{integration_id}")
async def delete_integration(
    integration_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Delete an integration
    """
    service = IntegrationService(db)
    success = await service.delete_integration(integration_id)
    if not success:
        raise HTTPException(status_code=404, detail="Integration not found")
    return {"message": "Integration deleted"}

@router.post("/{integration_id}/test")
async def test_integration(
    integration_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Test integration connection
    """
    service = IntegrationService(db)
    result = await service.test_connection(integration_id)
    return result