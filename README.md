# AFO Platform - Agentic Funnel Orchestration

> Multi-tenant SaaS platform for deploying AI agents with voice and text capabilities for customer engagement, lead qualification, and automated scheduling.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.11+](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org/downloads/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-green.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)

## 🎯 Overview

AFO (Agentic Funnel Orchestration) is an enterprise-grade platform that enables B2B companies, sales teams, and service-based businesses to deploy intelligent AI agents for automated customer engagement across voice and text channels.

### Key Features

- **🎙️ End-to-End Voice AI** - Single model (Qwen 3 Omni) handles STT + LLM + TTS with 211ms latency
- **🤖 Agent Persona Configuration** - 17 voice personas, customizable behaviors
- **📚 RAG-Powered Knowledge Base** - Vector search with Milvus for context-aware responses
- **⚙️ Workflow Orchestration** - Visual workflow builder with pre-built templates
- **📅 Calendar Integration** - Google Calendar and Calendly scheduling
- **🔗 CRM Integration** - Webhook-based integration with popular CRMs
- **🌍 Multi-Language Support** - 19 input languages, 10 output languages with auto-detection
- **🎭 17 Voice Personas** - Professional, friendly, casual - match your brand
- **🎥 Video Support** - Screen sharing during calls for enhanced support
- **😊 Emotion Detection** - Understands tone and urgency from voice
- **🔐 Multi-tenant Architecture** - Complete data isolation per tenant
- **📊 Real-time Analytics** - Live monitoring, conversation history, and anomaly detection
- **👥 Admin Dashboard** - Comprehensive management and monitoring tools
- **💰 85% Cost Savings** - Self-hosted option, no per-minute charges

## 🏗️ Architecture

### Tech Stack

**Backend:**
- **FastAPI** - High-performance Python web framework
- **MongoDB** - Primary database for application data
- **Milvus** - Vector database for RAG and semantic search
- **Redis** - Caching and real-time messaging
- **Qwen 3 Omni** - End-to-end multimodal AI (STT + LLM + TTS)
- **LiveKit** - Open-source WebRTC infrastructure
- **Pipecat** - Real-time voice pipeline orchestration (optional)

**Frontend:**
- **React 18** - UI framework
- **Wasp** - Full-stack framework for rapid development
- **TailwindCSS** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives

**Infrastructure:**
- **Docker** - Containerization
- **Supervisor** - Process management
- **Nginx** - Reverse proxy

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React/Wasp)                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Landing  │  │  Agents  │  │Workflows │  │Dashboard │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                     REST API / WebSocket
                            │
┌─────────────────────────────────────────────────────────────┐
│                    Backend (FastAPI)                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │            Qwen 3 Omni (End-to-End Voice AI)         │  │
│  │  STT + LLM + TTS in Single Model • 211ms latency     │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Agents   │  │Workflows │  │Knowledge │  │Calendar  │   │
│  │ Service  │  │ Service  │  │ Service  │  │ Service  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
    ┌───────┐          ┌────────┐          ┌────────┐
    │MongoDB│          │ Milvus │          │LiveKit │
    └───────┘          └────────┘          └────────┘
```

## 🚀 Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- MongoDB 6.0+
- Redis 7.0+
- Milvus 2.3+ (optional for vector search)
- Docker & Docker Compose (for LiveKit)
- **GPU (Recommended):** NVIDIA GPU with 14GB+ VRAM for Qwen 3 Omni

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/afo-platform.git
cd afo-platform
```

2. **Backend Setup**
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env  # Configure your environment variables
```

3. **Frontend Setup**
```bash
cd template/app
npm install
# or
yarn install
```

4. **Start LiveKit Server (Docker)**
```bash
# Start LiveKit and Redis for voice features
docker-compose up -d livekit redis-livekit
```

5. **Download Qwen 3 Omni Model (Optional - for voice features)**
```bash
cd backend
python -c "from transformers import AutoModelForCausalLM; \
           AutoModelForCausalLM.from_pretrained('Qwen/Qwen3-Omni-30B-A3B-Instruct')"
# Note: ~60GB download, requires GPU with 14GB+ VRAM
# Skip this for development - use text-only features first
```

6. **Start Services**
```bash
# Start backend
cd backend
uvicorn server:app --host 0.0.0.0 --port 8001 --reload

# Start frontend (in another terminal)
cd template/app
wasp start
```

### Environment Variables

**Backend (.env)**
```env
# Core
ENVIRONMENT=development
HOST=0.0.0.0
PORT=8001

# Database
MONGO_URL=mongodb://localhost:27017/afo_db

# External Services (Optional - users can provide their own)
REDIS_URL=redis://localhost:6379
MILVUS_HOST=localhost
MILVUS_PORT=19530

# LiveKit Configuration (for voice features)
LIVEKIT_URL=ws://localhost:7880
LIVEKIT_API_KEY=devkey
LIVEKIT_API_SECRET=devsecret

# LLM Integration (if using Emergent LLM key)
EMERGENT_LLM_KEY=your_emergent_key_here
```

**Frontend (.env)**
```env
REACT_APP_BACKEND_URL=http://localhost:8001
```

## 📖 API Documentation

### Core Endpoints

#### Agents
- `POST /api/agents/` - Create new agent
- `GET /api/agents/` - List agents
- `GET /api/agents/{id}` - Get agent details
- `PUT /api/agents/{id}` - Update agent
- `DELETE /api/agents/{id}` - Delete agent
- `POST /api/agents/{id}/activate` - Activate agent
- `POST /api/agents/{id}/deactivate` - Deactivate agent

#### Conversations
- `POST /api/conversations/` - Create conversation
- `GET /api/conversations/` - List conversations
- `GET /api/conversations/{id}` - Get conversation details

#### Knowledge Base
- `POST /api/knowledge/upload` - Upload document
- `GET /api/knowledge/agent/{agent_id}` - Get agent knowledge base
- `DELETE /api/knowledge/{kb_id}` - Delete knowledge

#### Phase 2: Voice & Workflows

**Voice Sessions**
- `POST /api/phase2/voice/session` - Create voice session
- `GET /api/phase2/voice/sessions` - List active sessions
- `GET /api/phase2/voice/session/{id}` - Get session status
- `DELETE /api/phase2/voice/session/{id}` - End session

**Workflows**
- `POST /api/workflows/` - Create workflow
- `GET /api/workflows/agent/{agent_id}` - List workflows
- `GET /api/workflows/{id}` - Get workflow details
- `POST /api/workflows/{id}/execute` - Execute workflow
- `DELETE /api/workflows/{id}` - Delete workflow

**Calendar Integration**
- `POST /api/phase2/calendar/google/availability` - Check Google Calendar
- `POST /api/phase2/calendar/google/event` - Create Google event
- `POST /api/phase2/calendar/calendly/availability` - Check Calendly
- `POST /api/phase2/calendar/calendly/scheduling-link` - Create Calendly link

**Webhooks**
- `POST /api/phase2/webhook/send` - Send generic webhook
- `POST /api/phase2/webhook/crm/lead` - Send CRM lead
- `POST /api/phase2/webhook/test` - Test webhook connection

Full API documentation available at: `http://localhost:8001/docs` (Swagger UI)

## 🎯 Use Cases

### 1. Lead Qualification & Scheduling
```
Customer Contact → AI Agent → Intent Recognition
                                ├─ Info Request → RAG Response
                                └─ Schedule Meeting → Collect Details
                                                   → Calendar Integration
                                                   → Send Confirmation
                                                   → CRM Update
```

### 2. Customer Support
- 24/7 automated support via voice or text
- Knowledge base-powered responses
- Ticket creation and routing
- Escalation to human agents

### 3. Sales Outreach
- Automated follow-ups
- Product demonstrations
- Meeting scheduling
- CRM synchronization

## 🔐 Security Features

- **Multi-tenant Isolation** - Complete data separation per tenant
- **BYOK Model** - Users provide their own API keys
- **Encrypted Credentials** - Secure storage of sensitive data
- **Role-based Access Control** - Admin, user, and agent-level permissions
- **Anomaly Detection** - Real-time monitoring for suspicious activity

## 🧪 Testing

### Backend Tests
```bash
cd backend
pytest tests/ -v
```

### Frontend Tests
```bash
cd template/app
npm test
# or
yarn test
```

### E2E Tests
```bash
cd e2e-tests
playwright test
```

## 📊 Monitoring & Analytics

The platform includes comprehensive monitoring:

- **Real-time Dashboard** - Live agent status and metrics
- **Conversation Analytics** - Success rates, response times, user satisfaction
- **Anomaly Detection** - Automated detection of unusual patterns
- **System Metrics** - CPU, memory, database performance
- **WebSocket Monitoring** - Real-time connection tracking

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- Python: Follow PEP 8, use Black formatter
- JavaScript/TypeScript: Use ESLint + Prettier
- Commit messages: Follow Conventional Commits

## 📋 Roadmap

### Phase 1 (✅ Complete)
- [x] Core agent management
- [x] Text-based conversations
- [x] Knowledge base with vector search
- [x] Basic integrations (CRM, webhooks)
- [x] Admin dashboard

### Phase 2 (✅ Complete)
- [x] Voice capabilities (Deepgram + ElevenLabs + Pipecat)
- [x] Workflow orchestration
- [x] Calendar integrations (Google, Calendly)
- [x] Enhanced webhook system
- [x] Voice configuration UI

### Phase 3 (🚧 Planned)
- [ ] Twilio integration for phone calls
- [ ] WebRTC direct calling
- [ ] Advanced workflow templates
- [ ] Multi-language support
- [ ] Analytics dashboard enhancements
- [ ] Mobile app

## 🐛 Known Issues

- Voice session creation requires LiveKit server running (included in docker-compose)
- Google Calendar integration requires complete OAuth2 credentials
- Calendly API endpoint may experience DNS resolution issues (intermittent)

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [LiveKit](https://livekit.io/) - Open-source WebRTC infrastructure
- [Pipecat](https://github.com/pipecat-ai/pipecat) - Real-time voice pipeline
- [OpenSaaS](https://opensaas.sh/) - Base SaaS template
- [FastAPI](https://fastapi.tiangolo.com/) - Modern Python web framework
- [Wasp](https://wasp-lang.dev/) - Full-stack framework

## 📞 Support

- **Documentation**: [docs.example.com](https://docs.example.com)
- **Issues**: [GitHub Issues](https://github.com/yourusername/afo-platform/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/afo-platform/discussions)
- **Email**: support@example.com

## 🌟 Star History

If you find this project helpful, please consider giving it a star!

---

**Built with ❤️ by the AFO Team**
