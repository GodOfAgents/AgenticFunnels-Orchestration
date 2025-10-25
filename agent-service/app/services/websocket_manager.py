from fastapi import WebSocket
from typing import Dict, List, Set
import json
import asyncio

class WebSocketManager:
    def __init__(self):
        # Agent chat connections: {agent_id: [websockets]}
        self.agent_connections: Dict[str, List[WebSocket]] = {}
        # Admin monitoring connections
        self.admin_connections: Set[WebSocket] = set()
        # User connections: {user_id: [websockets]}
        self.user_connections: Dict[str, List[WebSocket]] = {}
    
    async def connect(self, websocket: WebSocket, agent_id: str):
        """Connect a client to an agent chat"""
        await websocket.accept()
        if agent_id not in self.agent_connections:
            self.agent_connections[agent_id] = []
        self.agent_connections[agent_id].append(websocket)
        print(f"Client connected to agent {agent_id}. Total: {len(self.agent_connections[agent_id])}")
    
    async def connect_admin(self, websocket: WebSocket):
        """Connect an admin client for monitoring"""
        await websocket.accept()
        self.admin_connections.add(websocket)
        print(f"Admin connected. Total admins: {len(self.admin_connections)}")
    
    def disconnect(self, websocket: WebSocket, agent_id: str):
        """Disconnect a client from agent chat"""
        if agent_id in self.agent_connections:
            if websocket in self.agent_connections[agent_id]:
                self.agent_connections[agent_id].remove(websocket)
            if not self.agent_connections[agent_id]:
                del self.agent_connections[agent_id]
        print(f"Client disconnected from agent {agent_id}")
    
    def disconnect_admin(self, websocket: WebSocket):
        """Disconnect an admin client"""
        self.admin_connections.discard(websocket)
        print(f"Admin disconnected. Total admins: {len(self.admin_connections)}")
    
    async def send_to_agent(self, agent_id: str, message: dict):
        """Send message to all clients connected to an agent"""
        if agent_id in self.agent_connections:
            disconnected = []
            for websocket in self.agent_connections[agent_id]:
                try:
                    await websocket.send_json(message)
                except Exception as e:
                    print(f"Error sending to client: {e}")
                    disconnected.append(websocket)
            
            # Clean up disconnected websockets
            for ws in disconnected:
                self.disconnect(ws, agent_id)
    
    async def broadcast_to_admins(self, event_type: str, data: dict):
        """Broadcast event to all admin connections"""
        message = {
            "event": event_type,
            "data": data,
            "timestamp": asyncio.get_event_loop().time()
        }
        
        disconnected = []
        for websocket in self.admin_connections:
            try:
                await websocket.send_json(message)
            except Exception as e:
                print(f"Error sending to admin: {e}")
                disconnected.append(websocket)
        
        # Clean up disconnected websockets
        for ws in disconnected:
            self.disconnect_admin(ws)
    
    async def emit_system_event(self, event_type: str, data: dict):
        """Emit system-wide event to admins"""
        await self.broadcast_to_admins(event_type, data)
    
    async def close_all(self):
        """Close all WebSocket connections"""
        # Close agent connections
        for agent_id, connections in self.agent_connections.items():
            for ws in connections:
                try:
                    await ws.close()
                except:
                    pass
        
        # Close admin connections
        for ws in self.admin_connections:
            try:
                await ws.close()
            except:
                pass
        
        self.agent_connections.clear()
        self.admin_connections.clear()
        print("All WebSocket connections closed")

# Global WebSocket manager instance
ws_manager = WebSocketManager()