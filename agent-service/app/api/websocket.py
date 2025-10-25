from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from app.services.websocket_manager import ws_manager
from app.services.chat_service import ChatService
import json

router = APIRouter()

@router.websocket("/chat/{agent_id}")
async def websocket_chat(websocket: WebSocket, agent_id: str):
    """
    WebSocket endpoint for real-time agent chat
    """
    await ws_manager.connect(websocket, agent_id)
    chat_service = ChatService()
    
    try:
        while True:
            # Receive message from client
            data = await websocket.receive_text()
            message_data = json.loads(data)
            
            # Process message through agent
            response = await chat_service.process_message(
                agent_id=agent_id,
                message=message_data.get("message"),
                conversation_id=message_data.get("conversation_id"),
                user_info=message_data.get("user_info", {})
            )
            
            # Send response back to client
            await websocket.send_json(response)
            
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket, agent_id)
    except Exception as e:
        print(f"WebSocket error: {e}")
        await websocket.close()
        ws_manager.disconnect(websocket, agent_id)

@router.websocket("/admin")
async def websocket_admin(websocket: WebSocket):
    """
    WebSocket endpoint for admin real-time monitoring
    """
    await ws_manager.connect_admin(websocket)
    
    try:
        while True:
            # Keep connection alive and receive any admin commands
            data = await websocket.receive_text()
            # Admin can send commands if needed
            
    except WebSocketDisconnect:
        ws_manager.disconnect_admin(websocket)
    except Exception as e:
        print(f"Admin WebSocket error: {e}")
        await websocket.close()
        ws_manager.disconnect_admin(websocket)