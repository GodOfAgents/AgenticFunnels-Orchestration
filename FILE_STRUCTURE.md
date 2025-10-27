# AFO Platform - File Structure

Complete file structure and organization of the AFO (Agentic Funnel Orchestration) Platform.

## 📁 Root Directory Structure

```
afo-platform/
├── backend/                      # FastAPI Backend Service
├── agent-service/                # Backup/Development backend
├── template/                     # Frontend Application (Wasp + React)
├── opensaas-sh/                  # Original OpenSaaS template
├── tools/                        # Development tools
├── .github/                      # GitHub workflows and templates
├── docker-compose.yml            # Docker services configuration
├── README.md                     # Main project documentation
├── SETUP_GUIDE.md               # Setup instructions
├── PROJECT_STATUS.md            # Current development status
├── DEPLOYMENT_GUIDE.md          # Deployment instructions
├── test_result.md               # Testing results and logs
└── package.json                 # Root package configuration
```

---

## 🔧 Backend (`/backend/`)

### Core Files
```
backend/
├── server.py                    # Main entry point for uvicorn
├── main.py                      # FastAPI app initialization
├── requirements.txt             # Python dependencies
├── .env                         # Environment variables
└── API_DOCS.md                  # API documentation
```

### Application Structure
```
backend/app/
├── __init__.py
├── main.py                      # Application factory (duplicate for import)
│
├── api/                         # API Route Handlers
│   ├── __init__.py
│   ├── agents.py               # Agent CRUD operations
│   ├── conversations.py        # Conversation management
│   ├── knowledge.py            # Knowledge base operations
│   ├── integrations.py         # Third-party integrations
│   ├── admin.py                # Admin panel endpoints
│   ├── websocket.py            # WebSocket connections
│   ├── voice.py                # Voice/TTS endpoints
│   ├── workflows.py            # Workflow management (Phase 2)
│   └── phase2.py               # Phase 2 specific endpoints
│
├── core/                        # Core Application Logic
│   ├── __init__.py
│   ├── config.py               # Configuration settings
│   ├── database.py             # MongoDB connection
│   └── security.py             # Authentication & authorization
│
├── schemas/                     # Pydantic Models (Data Validation)
│   ├── __init__.py
│   ├── agent.py                # Agent data models
│   ├── conversation.py         # Conversation data models
│   ├── knowledge.py            # Knowledge base models
│   └── integration.py          # Integration models
│
└── services/                    # Business Logic & External Services
    ├── __init__.py
    ├── agent_service.py        # Agent business logic
    ├── chat_service.py         # Chat/conversation logic
    ├── conversation_service.py # Conversation management
    ├── knowledge_service.py    # Knowledge base operations
    ├── integration_service.py  # Integration management
    ├── admin_service.py        # Admin operations
    ├── websocket_manager.py    # WebSocket connection manager
    ├── anomaly_detector.py     # Anomaly detection system
    │
    ├── # Phase 2 Services
    ├── elevenlabs_service.py   # ElevenLabs TTS integration
    ├── voice_session_service.py # Voice session management (Pipecat)
    ├── workflow_service.py     # Workflow orchestration
    ├── calendar_service.py     # Calendar integration (Google, Calendly)
    └── webhook_service.py      # Webhook & CRM integration
```

### Key Backend Files

#### `server.py` - Entry Point
```python
from main import app
__all__ = ['app']
```

#### `main.py` - FastAPI Application
```python
app = FastAPI(title="AFO Agent Service", version="1.0.0")

# Routers
app.include_router(agents.router, prefix="/api/agents")
app.include_router(conversations.router, prefix="/api/conversations")
app.include_router(knowledge.router, prefix="/api/knowledge")
app.include_router(integrations.router, prefix="/api/integrations")
app.include_router(voice.router, prefix="/api/voice")
app.include_router(workflows.router, prefix="/api/workflows")
app.include_router(phase2.router, prefix="/api/phase2")
app.include_router(admin.router, prefix="/api/admin")
app.include_router(websocket.router, prefix="/ws")
```

---

## 🎨 Frontend (`/template/app/`)

### Root Files
```
template/app/
├── main.wasp                    # Wasp application definition
├── package.json                 # Node dependencies
├── .env                         # Frontend environment variables
├── vite.config.ts              # Vite configuration
├── tsconfig.json               # TypeScript configuration
└── tailwind.config.js          # TailwindCSS configuration
```

### Source Structure
```
template/app/src/
├── client/                      # Client-side utilities
│   ├── App.tsx                 # Root React component
│   └── components/             # Shared components
│
├── afo/                         # AFO Platform Features
│   ├── agents/                 # Agent Management
│   │   ├── AgentsPage.tsx
│   │   ├── AgentCreatePage.tsx
│   │   └── AgentDetailPage.tsx
│   │
│   ├── conversations/          # Conversation Management
│   │   ├── ConversationsPage.tsx
│   │   └── ConversationDetailPage.tsx
│   │
│   ├── knowledge/              # Knowledge Base
│   │   └── KnowledgePage.tsx
│   │
│   ├── integrations/           # Integrations
│   │   └── IntegrationsPage.tsx
│   │
│   ├── admin/                  # Admin Panel
│   │   ├── AdminAgentsPage.tsx
│   │   ├── AdminConversationsPage.tsx
│   │   ├── AdminAnomaliesPage.tsx
│   │   └── AdminSystemPage.tsx
│   │
│   ├── # Phase 2 Components
│   ├── voice/                  # Voice Features
│   │   └── VoiceConfigPage.tsx
│   │
│   ├── workflows/              # Workflow Management
│   │   └── WorkflowBuilderPage.tsx
│   │
│   ├── components/             # Shared AFO Components
│   │   └── VoiceInterface.tsx
│   │
│   └── lib/                    # Utility Libraries
│       ├── api-client.ts       # Backend API client
│       └── websocket-client.ts # WebSocket client
│
├── landing-page/               # Marketing Landing Page
│   └── LandingPage.tsx
│
├── auth/                       # Authentication Pages
│   ├── LoginPage.tsx
│   ├── SignupPage.tsx
│   └── email-and-pass/
│
├── user/                       # User Management
│   └── AccountPage.tsx
│
├── admin/                      # Admin Dashboard (OpenSaaS)
│   ├── dashboards/
│   └── elements/
│
├── demo-ai-app/                # Demo AI Application
│   └── DemoAppPage.tsx
│
├── payment/                    # Payment Integration
│   └── PricingPage.tsx
│
└── file-upload/                # File Upload Features
    └── FileUploadPage.tsx
```

### Key Frontend Files

#### `main.wasp` - Application Routes
```wasp
// AFO Platform Routes
route AgentsRoute { path: "/agents", to: AgentsPage }
route AgentDetailRoute { path: "/agent/:id", to: AgentDetailPage }
route ConversationsRoute { path: "/conversations", to: ConversationsPage }
route KnowledgeRoute { path: "/knowledge", to: KnowledgePage }
route IntegrationsRoute { path: "/integrations", to: IntegrationsPage }
route WorkflowsRoute { path: "/workflows/:agentId", to: WorkflowBuilderPage }
route VoiceConfigRoute { path: "/voice/config/:agentId", to: VoiceConfigPage }
```

#### `api-client.ts` - Backend Integration
```typescript
class APIClient {
  // Agent APIs
  async createAgent(data: any) { ... }
  async listAgents(userId: string) { ... }
  
  // Phase 2 APIs
  async createVoiceSession(data: any) { ... }
  async createWorkflow(data: any) { ... }
  async checkGoogleAvailability(...) { ... }
  async sendWebhook(...) { ... }
}
```

---

## 📊 Database Schema (`/template/app/prisma/`)

```
prisma/
├── schema.prisma               # Database schema definition
└── migrations/                 # Database migrations
```

### Main Models
```prisma
model User { ... }              // User accounts
model Task { ... }              // Demo tasks
model GptResponse { ... }       // GPT responses
model File { ... }              // File uploads
model DailyStats { ... }        // Analytics
model Logs { ... }              // Activity logs
model PageViewSource { ... }    // Page view tracking

// AFO Models (Custom)
model Agent { ... }             // AI agents
model Conversation { ... }      // Conversations
model Message { ... }           // Chat messages
model KnowledgeBase { ... }     // Knowledge entries
model Integration { ... }       // External integrations
model Workflow { ... }          // Workflow definitions
model Anomaly { ... }           // Detected anomalies
```

---

## 🐳 Infrastructure

### Docker Configuration
```
docker-compose.yml              # Services: Milvus, Redis
├── Milvus (Vector DB)
│   ├── Port: 19530
│   └── Port: 9091 (metrics)
└── Redis (Cache/Messaging)
    └── Port: 6379
```

### Supervisor Configuration
Located in `/etc/supervisor/conf.d/supervisord.conf`:
```ini
[program:backend]
command=uvicorn server:app --host 0.0.0.0 --port 8001
directory=/app/backend

[program:frontend]
command=yarn start
directory=/app/frontend

[program:mongodb]
command=/usr/bin/mongod --bind_ip_all
```

---

## 📝 Documentation Files

```
/app/
├── README.md                    # Main project README
├── SETUP_GUIDE.md              # Installation guide
├── PROJECT_STATUS.md           # Development status
├── DEPLOYMENT_GUIDE.md         # Deployment instructions
├── API_DOCS.md                 # API documentation (backend/)
└── test_result.md              # Testing results
```

---

## 🔑 Environment Files

### Backend `.env`
```env
ENVIRONMENT=development
HOST=0.0.0.0
PORT=8001
MONGO_URL=mongodb://localhost:27017/afo_db
REDIS_URL=redis://localhost:6379
MILVUS_HOST=localhost
MILVUS_PORT=19530
EMERGENT_LLM_KEY=your_key_here
```

### Frontend `.env`
```env
REACT_APP_BACKEND_URL=http://localhost:8001
```

---

## 📦 Dependencies

### Backend (`requirements.txt`)
```
fastapi==0.104.1
uvicorn==0.24.0
motor==3.3.2                    # MongoDB async driver
pymongo==4.6.0
pydantic==2.5.0
pydantic-settings==2.1.0
python-dotenv==1.0.0
redis==5.0.1
pymilvus==2.3.4
httpx==0.25.2
python-multipart==0.0.6
cryptography==41.0.7

# Phase 2 - Voice & Workflows
pipecat-ai==0.0.91
deepgram-sdk==4.7.0
elevenlabs==1.0.0
google-api-python-client==2.108.0
google-auth-httplib2==0.1.1
google-auth-oauthlib==1.1.0
```

### Frontend (`package.json`)
```json
{
  "dependencies": {
    "@radix-ui/react-*": "latest",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "tailwindcss": "^3.3.0"
  }
}
```

---

## 🧪 Testing Structure

```
/app/
├── test_result.md              # Main testing log
├── backend/tests/              # Backend unit tests
│   ├── test_agents.py
│   ├── test_conversations.py
│   └── test_workflows.py
│
└── template/app/e2e-tests/    # Frontend E2E tests
    └── playwright.config.ts
```

---

## 📈 Analytics & Monitoring

```
backend/app/services/
├── anomaly_detector.py         # ML-based anomaly detection
└── websocket_manager.py        # Real-time connection tracking

template/app/src/admin/
└── dashboards/
    ├── analytics/              # Analytics dashboard
    └── users/                  # User management
```

---

## 🔄 Git Structure

```
.git/                           # Git repository
.github/
├── workflows/                  # CI/CD pipelines
└── ISSUE_TEMPLATE/            # Issue templates

.gitignore                      # Git ignore rules
.gitattributes                  # Git attributes
```

---

## 🎯 Key Integration Points

### Backend ↔ Frontend
- **API Base URL**: `process.env.REACT_APP_BACKEND_URL`
- **WebSocket**: `ws://localhost:8001/ws`
- **Health Check**: `GET /health`

### Backend ↔ Databases
- **MongoDB**: `MONGO_URL` (motor/pymongo)
- **Milvus**: `MILVUS_HOST:MILVUS_PORT` (pymilvus)
- **Redis**: `REDIS_URL` (redis-py)

### External Services
- **Deepgram API**: User-provided API key (STT)
- **ElevenLabs API**: User-provided API key (TTS)
- **OpenAI API**: User-provided API key (LLM)
- **Google Calendar**: OAuth2 credentials
- **Calendly**: API key
- **Daily.co**: Room URL for voice sessions

---

## 📊 Data Flow

```
User Request
    ↓
Frontend (React) → API Client
    ↓
Backend (FastAPI) → Router → Service → Database
    ↓                              ↓
Response ←─────────────────────────┘
```

---

## 🚀 Build & Deploy

### Development
```bash
# Backend
cd backend && uvicorn server:app --reload

# Frontend
cd template/app && wasp start
```

### Production
```bash
# Backend
cd backend && uvicorn server:app --workers 4

# Frontend
cd template/app && wasp build && wasp start
```

---

This file structure supports:
- ✅ Modular architecture
- ✅ Clear separation of concerns
- ✅ Easy testing and maintenance
- ✅ Scalable service architecture
- ✅ Multi-tenant security
- ✅ Phase 2 voice and workflow features

**Last Updated**: October 27, 2024
