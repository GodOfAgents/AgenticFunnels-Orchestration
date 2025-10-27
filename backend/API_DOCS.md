# AFO Platform - API Documentation

## Base URL
`http://localhost:8001`

---

## 📋 Core Endpoints

### Health Check
```bash
GET /
GET /health
```

**Response:**
```json
{
  "service": "AFO Agent Service",
  "status": "running",
  "version": "1.0.0"
}
```

---

## 🤖 Agent Management (`/api/agents`)

### Create Agent
```bash
POST /api/agents/
Content-Type: application/json

{
  "userId": "user-id",
  "name": "Sales Agent",
  "role": "Lead Qualification Specialist",
  "persona": "professional",
  "systemPrompt": "You are a helpful sales agent...",
  "voiceEnabled": false,
  "voiceId": "EXAVITQu4vr4xnSDxMaL"
}
```

### List Agents
```bash
GET /api/agents/?user_id={userId}&skip=0&limit=100
```

### Get Agent by ID
```bash
GET /api/agents/{agent_id}
```

### Update Agent
```bash
PUT /api/agents/{agent_id}
Content-Type: application/json

{
  "name": "Updated Name",
  "isActive": true
}
```

### Delete Agent
```bash
DELETE /api/agents/{agent_id}
```

### Activate/Deactivate Agent
```bash
POST /api/agents/{agent_id}/activate
POST /api/agents/{agent_id}/deactivate
```

---

## 💬 Conversation Management (`/api/conversations`)

### Create Conversation
```bash
POST /api/conversations/
Content-Type: application/json

{
  "agentId": "agent-id",
  "channel": "text",
  "customerName": "John Doe",
  "customerEmail": "john@example.com",
  "customerPhone": "+1234567890"
}
```

### List Conversations
```bash
GET /api/conversations/?agent_id={agentId}&status={status}&skip=0&limit=100
```

### Get Conversation by ID
```bash
GET /api/conversations/{conversation_id}
```

### Add Message to Conversation
```bash
POST /api/conversations/{conversation_id}/messages
Content-Type: application/json

{
  "role": "user",
  "content": "Hello, I need help",
  "audioUrl": null,
  "metadata": {}
}
```

---

## 📚 Knowledge Base (`/api/knowledge`)

### Upload Document
```bash
POST /api/knowledge/upload?agent_id={agentId}
Content-Type: multipart/form-data

file: [PDF/DOCX/TXT file]
```

### Get Agent Knowledge Base
```bash
GET /api/knowledge/agent/{agent_id}
```

### Delete Knowledge Item
```bash
DELETE /api/knowledge/{kb_id}
```

### Query Knowledge (RAG)
```bash
POST /api/knowledge/query?agent_id={agentId}&query={text}&top_k=5
```

---

## 🔌 Integration Management (`/api/integrations`)

### Create Integration
```bash
POST /api/integrations/
Content-Type: application/json

{
  "userId": "user-id",
  "type": "elevenlabs",
  "provider": "elevenlabs",
  "credentials": {
    "api_key": "your-elevenlabs-key"
  }
}
```

**Supported Integration Types:**
- `elevenlabs` - Voice/TTS
- `twilio` - Voice/SMS/WhatsApp
- `google_calendar` - Calendar booking
- `calendly` - Meeting scheduling
- `salesforce` - CRM
- `hubspot` - CRM
- `pipedrive` - CRM

### List User Integrations
```bash
GET /api/integrations/user/{user_id}
```

### Update Integration
```bash
PUT /api/integrations/{integration_id}
Content-Type: application/json

{
  "credentials": {
    "api_key": "new-key"
  }
}
```

### Delete Integration
```bash
DELETE /api/integrations/{integration_id}
```

### Test Integration
```bash
POST /api/integrations/{integration_id}/test
```

---

## 🎙️ Voice & TTS (`/api/voice`)

### Text-to-Speech
```bash
POST /api/voice/tts?user_id={userId}
Content-Type: application/json

{
  "text": "Hello, how can I help you today?",
  "voice_id": "EXAVITQu4vr4xnSDxMaL",
  "model_id": "eleven_monolingual_v1",
  "voice_settings": {
    "stability": 0.5,
    "similarity_boost": 0.75,
    "style": 0.0,
    "use_speaker_boost": true
  }
}
```

**Response:** Audio file (MP3)

### Get Available Voices
```bash
GET /api/voice/voices?user_id={userId}
```

**Response:**
```json
{
  "voices": [
    {
      "id": "EXAVITQu4vr4xnSDxMaL",
      "name": "Sarah",
      "category": "premade",
      "description": "Professional female voice",
      "preview_url": "https://..."
    }
  ]
}
```

### Get Available Models
```bash
GET /api/voice/models?user_id={userId}
```

### Test ElevenLabs Integration
```bash
POST /api/voice/test-integration?user_id={userId}&api_key={your-elevenlabs-key}
```

---

## 🛡️ Admin Panel (`/api/admin`)

### Dashboard Overview
```bash
GET /api/admin/dashboard
```

**Response:**
```json
{
  "system": {
    "status": "healthy",
    "activeConnections": 0,
    "queuedJobs": 0,
    "avgResponseTime": 0.5
  },
  "agents": {
    "total": 0,
    "active": 0,
    "inactive": 0,
    "flagged": 0
  },
  "conversations": {
    "total": 0,
    "active": 0,
    "completed": 0,
    "failed": 0
  },
  "users": {
    "total": 0,
    "active": 0,
    "paid": 0,
    "new_today": 0
  }
}
```

### List All Agents (Admin)
```bash
GET /api/admin/agents?status={status}&flagged={bool}&skip=0&limit=100
```

### List All Conversations (Admin)
```bash
GET /api/admin/conversations?status={status}&flagged={bool}&search={query}&skip=0&limit=100
```

### List All Integrations (Admin)
```bash
GET /api/admin/integrations?type={type}&status={status}
```

### Get Anomalies
```bash
GET /api/admin/anomalies?severity={severity}&resolved={bool}&skip=0&limit=50
```

### Resolve Anomaly
```bash
POST /api/admin/anomalies/{anomaly_id}/resolve?resolved_by={admin_user_id}
```

### System Metrics
```bash
GET /api/admin/system-metrics
```

### Platform Analytics
```bash
GET /api/admin/analytics?days=30
```

### Audit Logs
```bash
GET /api/admin/audit-logs?user_id={userId}&action={action}&resource={resource}&skip=0&limit=100
```

### Flag Agent
```bash
POST /api/admin/agents/{agent_id}/flag
Content-Type: application/json

{
  "reason": "Suspicious behavior detected"
}
```

### Flag Conversation
```bash
POST /api/admin/conversations/{conversation_id}/flag
Content-Type: application/json

{
  "reason": "Inappropriate content"
}
```

---

## 🔄 WebSocket Endpoints

### Agent Chat (Real-time)
```
WS /ws/chat/{agent_id}

Send:
{
  "message": "Hello",
  "conversation_id": "optional-id",
  "user_info": {}
}

Receive:
{
  "conversation_id": "id",
  "message": "Response from agent",
  "timestamp": "2025-10-26T20:30:00Z",
  "tokens_used": 150
}
```

### Admin Monitoring (Real-time)
```
WS /ws/admin

Receive events:
- conversation.started
- conversation.ended
- anomaly.detected
- system.metrics
- agent.created
- agent.deactivated
```

---

## 🔐 Authentication

**Note:** Currently, endpoints use query parameters for user identification.
In production, implement JWT/OAuth tokens.

---

## 📊 Response Status Codes

- `200` - Success
- `201` - Created
- `204` - No Content (successful deletion)
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## 🎯 Integration Flow Example

### Setting up ElevenLabs Voice Agent

1. **Add ElevenLabs Integration:**
```bash
POST /api/integrations/
{
  "userId": "user-123",
  "type": "elevenlabs",
  "provider": "elevenlabs",
  "credentials": {
    "api_key": "your-elevenlabs-api-key"
  }
}
```

2. **Get Available Voices:**
```bash
GET /api/voice/voices?user_id=user-123
```

3. **Create Voice-Enabled Agent:**
```bash
POST /api/agents/
{
  "userId": "user-123",
  "name": "Voice Sales Agent",
  "role": "Sales Representative",
  "persona": "friendly",
  "systemPrompt": "You are a friendly sales agent...",
  "voiceEnabled": true,
  "voiceId": "EXAVITQu4vr4xnSDxMaL"
}
```

4. **Test TTS:**
```bash
POST /api/voice/tts?user_id=user-123
{
  "text": "Hello! How can I assist you today?",
  "voice_id": "EXAVITQu4vr4xnSDxMaL"
}
```

---

## 🚀 Quick Start Commands

### Start Service
```bash
cd /app/agent-service
uvicorn main:app --host 0.0.0.0 --port 8001 --reload
```

### Test Endpoints
```bash
# Health check
curl http://localhost:8001/health

# Create agent
curl -X POST http://localhost:8001/api/agents/ \
  -H "Content-Type: application/json" \
  -d '{"userId":"test","name":"Test Agent","role":"Helper","persona":"friendly","systemPrompt":"You are helpful"}'

# Admin dashboard
curl http://localhost:8001/api/admin/dashboard
```

---

## 📝 Notes

- All timestamps are in UTC ISO 8601 format
- File uploads limited to 50MB
- RAG queries return top 5 results by default
- WebSocket connections timeout after 30 minutes of inactivity
- Anomaly detector runs every 5 minutes
- Audio files are MP3 format, mono, 24kHz sampling rate
