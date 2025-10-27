import httpx
from typing import Dict, Optional, Any
import json

class WebhookService:
    """
    Generic Webhook Service for CRM and other integrations
    Allows users to send data to any webhook URL
    """
    
    async def send_webhook(
        self,
        webhook_url: str,
        data: dict,
        headers: Optional[Dict[str, str]] = None,
        method: str = "POST",
        auth: Optional[dict] = None
    ) -> dict:
        """
        Send data to a webhook URL
        
        Args:
            webhook_url: Target webhook URL
            data: Data to send
            headers: Additional headers
            method: HTTP method (POST, PUT, PATCH)
            auth: Authentication config
            {
                "type": "bearer" | "basic" | "api_key",
                "token": "...",  # for bearer
                "username": "...", "password": "...",  # for basic
                "key_name": "X-API-Key", "key_value": "..."  # for api_key
            }
        
        Returns:
            Response data
        """
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                # Prepare headers
                request_headers = headers or {}
                request_headers.setdefault("Content-Type", "application/json")
                
                # Add authentication
                if auth:
                    auth_type = auth.get("type")
                    if auth_type == "bearer":
                        request_headers["Authorization"] = f"Bearer {auth['token']}"
                    elif auth_type == "basic":
                        # httpx handles basic auth
                        auth_tuple = (auth.get("username"), auth.get("password"))
                    elif auth_type == "api_key":
                        request_headers[auth.get("key_name", "X-API-Key")] = auth.get("key_value")
                
                # Send request
                if method.upper() == "POST":
                    response = await client.post(
                        webhook_url,
                        json=data,
                        headers=request_headers
                    )
                elif method.upper() == "PUT":
                    response = await client.put(
                        webhook_url,
                        json=data,
                        headers=request_headers
                    )
                elif method.upper() == "PATCH":
                    response = await client.patch(
                        webhook_url,
                        json=data,
                        headers=request_headers
                    )
                else:
                    raise ValueError(f"Unsupported method: {method}")
                
                # Parse response
                return {
                    "success": response.status_code < 400,
                    "status_code": response.status_code,
                    "response_data": response.json() if response.headers.get("content-type", "").startswith("application/json") else response.text,
                    "headers": dict(response.headers)
                }
                
        except Exception as e:
            print(f"Webhook send error: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    async def send_crm_lead(
        self,
        webhook_url: str,
        lead_data: dict,
        auth: Optional[dict] = None,
        field_mapping: Optional[Dict[str, str]] = None
    ) -> dict:
        """
        Send lead data to CRM webhook
        
        Args:
            webhook_url: CRM webhook URL
            lead_data: Lead information
            auth: Authentication config
            field_mapping: Map AFO fields to CRM fields
            {
                "customerName": "first_name",
                "customerEmail": "email",
                "company": "company_name"
            }
        
        Returns:
            Response data
        """
        # Apply field mapping
        if field_mapping:
            mapped_data = {}
            for afo_field, crm_field in field_mapping.items():
                if afo_field in lead_data:
                    mapped_data[crm_field] = lead_data[afo_field]
        else:
            mapped_data = lead_data
        
        # Send to webhook
        return await self.send_webhook(
            webhook_url=webhook_url,
            data=mapped_data,
            auth=auth,
            method="POST"
        )
    
    async def test_webhook(
        self,
        webhook_url: str,
        auth: Optional[dict] = None
    ) -> dict:
        """
        Test webhook connection
        
        Args:
            webhook_url: Webhook URL to test
            auth: Authentication config
        
        Returns:
            Test result
        """
        test_data = {
            "test": True,
            "message": "AFO Platform webhook test",
            "timestamp": json.dumps({"$date": "2025-01-01T00:00:00Z"})
        }
        
        result = await self.send_webhook(
            webhook_url=webhook_url,
            data=test_data,
            auth=auth
        )
        
        return {
            "success": result.get("success", False),
            "status_code": result.get("status_code"),
            "message": "Webhook connection successful" if result.get("success") else "Webhook connection failed"
        }

# Global instance
webhook_service = WebhookService()