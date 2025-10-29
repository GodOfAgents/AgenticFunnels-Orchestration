from typing import Dict, List, Optional, Any
import json
import uuid
from datetime import datetime
import httpx

class WorkflowService:
    """
    Workflow Orchestration Service
    Manages workflow creation, execution, and state
    """
    
    def __init__(self):
        self.workflows: Dict[str, dict] = {}
        self.executions: Dict[str, dict] = {}
    
    async def create_workflow(
        self,
        agent_id: str,
        workflow_data: dict
    ) -> dict:
        """
        Create a new workflow
        
        Args:
            agent_id: Agent ID
            workflow_data: Workflow configuration
            {
                "name": "Lead Qualification",
                "description": "Qualify leads and route to sales",
                "trigger": "conversation_start",
                "nodes": [
                    {
                        "id": "node1",
                        "type": "message",
                        "config": {"text": "Hello! How can I help?"},
                        "next": "node2"
                    },
                    {
                        "id": "node2",
                        "type": "collect_info",
                        "config": {"fields": ["name", "email", "company"]},
                        "next": "node3"
                    },
                    {
                        "id": "node3",
                        "type": "decision",
                        "config": {
                            "condition": "interested_in_demo",
                            "true_path": "node4",
                            "false_path": "node5"
                        }
                    },
                    {
                        "id": "node4",
                        "type": "schedule_meeting",
                        "config": {"calendar_type": "google"},
                        "next": null
                    },
                    {
                        "id": "node5",
                        "type": "send_info",
                        "config": {"content_type": "product_brochure"},
                        "next": null
                    }
                ]
            }
        """
        workflow_id = str(uuid.uuid4())
        
        workflow = {
            "id": workflow_id,
            "agent_id": agent_id,
            "name": workflow_data.get("name"),
            "description": workflow_data.get("description"),
            "trigger": workflow_data.get("trigger"),
            "nodes": workflow_data.get("nodes", []),
            "is_active": True,
            "created_at": datetime.utcnow().isoformat(),
            "execution_count": 0
        }
        
        self.workflows[workflow_id] = workflow
        return workflow
    
    async def execute_workflow(
        self,
        workflow_id: str,
        context: dict,
        user_integrations: dict
    ) -> dict:
        """
        Execute a workflow
        
        Args:
            workflow_id: Workflow ID
            context: Execution context (conversation data, user input, etc.)
            user_integrations: User's integration credentials
        
        Returns:
            Execution result
        """
        if workflow_id not in self.workflows:
            raise ValueError(f"Workflow {workflow_id} not found")
        
        workflow = self.workflows[workflow_id]
        execution_id = str(uuid.uuid4())
        
        execution = {
            "id": execution_id,
            "workflow_id": workflow_id,
            "status": "running",
            "started_at": datetime.utcnow().isoformat(),
            "context": context,
            "current_node": None,
            "results": {},
            "errors": []
        }
        
        self.executions[execution_id] = execution
        
        try:
            # Execute workflow nodes
            result = await self._execute_nodes(
                workflow["nodes"],
                context,
                user_integrations,
                execution
            )
            
            execution["status"] = "completed"
            execution["completed_at"] = datetime.utcnow().isoformat()
            execution["results"] = result
            
            # Increment execution count
            workflow["execution_count"] += 1
            
            return execution
            
        except Exception as e:
            execution["status"] = "failed"
            execution["errors"].append(str(e))
            execution["failed_at"] = datetime.utcnow().isoformat()
            raise
    
    async def _execute_nodes(
        self,
        nodes: List[dict],
        context: dict,
        user_integrations: dict,
        execution: dict
    ) -> dict:
        """
        Execute workflow nodes sequentially
        """
        results = {}
        current_node_id = nodes[0]["id"] if nodes else None
        
        while current_node_id:
            node = next((n for n in nodes if n["id"] == current_node_id), None)
            if not node:
                break
            
            execution["current_node"] = current_node_id
            
            # Execute node based on type
            node_result = await self._execute_node(node, context, user_integrations)
            results[current_node_id] = node_result
            
            # Determine next node
            if node["type"] == "decision":
                # Handle conditional branching
                condition_met = node_result.get("condition_met", False)
                current_node_id = (
                    node["config"].get("true_path") if condition_met
                    else node["config"].get("false_path")
                )
            else:
                current_node_id = node.get("next")
        
        return results
    
    async def _execute_node(
        self,
        node: dict,
        context: dict,
        user_integrations: dict
    ) -> dict:
        """
        Execute a single workflow node
        """
        node_type = node["type"]
        config = node["config"]
        
        if node_type == "message":
            return {"message_sent": config.get("text")}
        
        elif node_type == "collect_info":
            # Collect information from context
            fields = config.get("fields", [])
            collected = {field: context.get(field) for field in fields}
            return {"collected_data": collected}
        
        elif node_type == "decision":
            # Evaluate condition
            condition = config.get("condition")
            condition_met = self._evaluate_condition(condition, context)
            return {"condition_met": condition_met}
        
        elif node_type == "schedule_meeting":
            # Schedule meeting via calendar integration
            # TODO: Implement calendar booking
            return {"meeting_scheduled": True, "meeting_time": None}
        
        elif node_type == "send_info":
            # Send information
            return {"info_sent": True}
        
        elif node_type == "api_call":
            # Call external API via webhook
            try:
                url = config.get("url")
                method = config.get("method", "POST")
                headers = config.get("headers", {})
                body = config.get("body", {})
                
                # Replace variables in body with context values
                body = self._replace_variables(body, context)
                
                async with httpx.AsyncClient() as client:
                    if method.upper() == "GET":
                        response = await client.get(url, headers=headers)
                    elif method.upper() == "POST":
                        response = await client.post(url, headers=headers, json=body)
                    elif method.upper() == "PUT":
                        response = await client.put(url, headers=headers, json=body)
                    elif method.upper() == "DELETE":
                        response = await client.delete(url, headers=headers)
                    else:
                        return {"error": f"Unsupported HTTP method: {method}"}
                    
                    return {
                        "api_response": response.json() if response.status_code == 200 else None,
                        "status_code": response.status_code
                    }
            except Exception as e:
                return {"error": str(e)}
        
        elif node_type == "webhook":
            # Send webhook
            try:
                url = config.get("url")
                payload = config.get("payload", {})
                
                # Replace variables in payload with context values
                payload = self._replace_variables(payload, context)
                
                async with httpx.AsyncClient() as client:
                    response = await client.post(url, json=payload, timeout=10.0)
                    return {
                        "webhook_sent": True,
                        "status_code": response.status_code,
                        "response": response.json() if response.status_code == 200 else None
                    }
            except Exception as e:
                return {"error": str(e)}
        
        elif node_type == "crm_update":
            # Update CRM via webhook
            try:
                crm_url = user_integrations.get("crm_webhook_url")
                if not crm_url:
                    return {"error": "CRM webhook URL not configured"}
                
                lead_data = config.get("data", {})
                # Replace variables in lead data with context values
                lead_data = self._replace_variables(lead_data, context)
                
                async with httpx.AsyncClient() as client:
                    response = await client.post(crm_url, json=lead_data, timeout=10.0)
                    return {
                        "crm_updated": True,
                        "status_code": response.status_code,
                        "response": response.json() if response.status_code == 200 else None
                    }
            except Exception as e:
                return {"error": str(e)}
        
        elif node_type == "rag_query":
            # Query knowledge base via RAG
            try:
                agent_id = config.get("agent_id")
                query = config.get("query", "")
                
                # Replace variables in query with context values
                query = self._replace_variables(query, context)
                
                if not agent_id:
                    return {"error": "Agent ID not provided for RAG query"}
                
                # TODO: Integrate with actual RAG/knowledge service
                # For now, return placeholder
                return {
                    "rag_results": [],
                    "query": query,
                    "message": "RAG integration pending"
                }
            except Exception as e:
                return {"error": str(e)}
        
        elif node_type == "email":
            # Send email (placeholder - would integrate with email service)
            try:
                to_email = config.get("to")
                subject = config.get("subject", "")
                body = config.get("body", "")
                
                # Replace variables with context values
                to_email = self._replace_variables(to_email, context)
                subject = self._replace_variables(subject, context)
                body = self._replace_variables(body, context)
                
                # TODO: Integrate with actual email service
                return {
                    "email_sent": True,
                    "to": to_email,
                    "subject": subject
                }
            except Exception as e:
                return {"error": str(e)}
        
        elif node_type == "delay":
            # Add delay (in seconds)
            import asyncio
            delay_seconds = config.get("seconds", 1)
            await asyncio.sleep(delay_seconds)
            return {"delayed": True, "seconds": delay_seconds}
        
        else:
            return {"node_type": node_type, "executed": True}
    
    def _replace_variables(self, data: Any, context: dict) -> Any:
        """
        Replace variables in data with context values
        Supports {{variable_name}} syntax
        """
        if isinstance(data, str):
            # Replace {{variable}} with context value
            for key, value in context.items():
                placeholder = f"{{{{{key}}}}}"
                if placeholder in data:
                    data = data.replace(placeholder, str(value))
            return data
        elif isinstance(data, dict):
            return {k: self._replace_variables(v, context) for k, v in data.items()}
        elif isinstance(data, list):
            return [self._replace_variables(item, context) for item in data]
        else:
            return data
    
    def _evaluate_condition(self, condition: str, context: dict) -> bool:
        """
        Evaluate a condition against context
        Simple implementation - can be enhanced with expression parser
        """
        # Simple key existence check
        return condition in context and bool(context[condition])
    
    async def get_workflow(self, workflow_id: str) -> Optional[dict]:
        """Get workflow by ID"""
        return self.workflows.get(workflow_id)
    
    async def list_workflows(self, agent_id: str) -> List[dict]:
        """List workflows for an agent"""
        return [
            w for w in self.workflows.values()
            if w["agent_id"] == agent_id
        ]
    
    async def delete_workflow(self, workflow_id: str) -> bool:
        """Delete a workflow"""
        if workflow_id in self.workflows:
            del self.workflows[workflow_id]
            return True
        return False
    
    async def get_execution(self, execution_id: str) -> Optional[dict]:
        """Get execution details"""
        return self.executions.get(execution_id)

# Global instance
workflow_service = WorkflowService()