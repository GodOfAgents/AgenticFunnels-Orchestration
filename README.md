# 🚀 The Revenue Engine You Control: Agentic Funnels Orchestration (AFO)

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)
[![Platform: FastAPI + React](https://img.shields.io/badge/Platform-FastAPI%20%2B%20React-green.svg)]()
[![Status: Production Ready](https://img.shields.io/badge/Status-Production%20Ready-brightgreen.svg)]()

> **Stop Missing Leads. Start Automating Revenue. Deploy Voice & Text AI Agents in Minutes.**

---

## 🎯 What is AFO? The Future of Customer Engagement is Autonomous

**AFO (Agentic Funnel Orchestration)** is a comprehensive, self-hosted, and multi-tenant platform designed to automate your entire customer engagement funnel—from lead qualification to 24/7 support—using intelligent, multimodal AI agents.

Built for **Sales Managers, Support Leads, and Operations Directors**, AFO transforms manual, expensive, and slow customer interactions into a high-speed, cost-effective, and always-on revenue engine.

### 💡 The Problem We Solve

| The Old Way (Pain Points) | The AFO Solution (The Trigger/Hook) |
| :--- | :--- |
| **Manual** customer engagement is time-consuming and expensive. | **Autonomous Agents** handle lead qualification, scheduling, and support 24/7. |
| **Traditional chatbots** lack intelligence, context, and can't handle complex workflows. | **Intelligent Workflows** built with a visual, no-code builder for complex, multi-step conversations. |
| **Third-party AI services** are costly, have high latency, and lead to vendor lock-in. | **Self-Hosted & Cost-Effective.** Deploy on your own infrastructure for **85% lower cost** and complete data control. |
| **Integration complexity** requires technical expertise and creates data silos. | **17+ Pre-built Integrations** (CRM, Calendar, Email) connect your entire tech stack seamlessly. |

---

## ✨ Key Features: Why AFO is Your Competitive Edge

| Feature | The Simple Explanation | The Marketing Benefit (The Hook) |
| :--- | :--- | :--- |
| **Visual Workflow Builder** | A drag-and-drop interface with 11 node types for designing conversation logic. | **No-Code Automation.** Build complex, multi-step funnels in minutes—no developer needed. |
| **End-to-End Voice & Text** | Multimodal AI agents powered by Qwen 3 Omni for natural, real-time communication. | **Unmatched Performance.** Achieve ultra-low latency (**211ms**) and natural voice conversations that convert. |
| **4-Step Agent Creation Wizard** | A guided, simple process to define your agent's role, persona, voice, and integrations. | **Rapid Deployment.** Go from zero to a fully-configured, integrated agent in under 5 minutes. |
| **Self-Hosted & Multi-Tenant** | Deploy the platform on your own servers with white-label readiness. | **Total Control & White-Label Ready.** Own your data, reduce costs, and offer AI-as-a-Service to your clients. |
| **17+ Seamless Integrations** | Pre-built connectors for Google Calendar, Salesforce, HubSpot, SendGrid, and custom webhooks. | **System Harmony.** Connect your agents directly to your CRM, calendar, and email for zero-friction operations. |
| **Knowledge Base (RAG)** | Integrate your documentation and data for context-aware, accurate agent responses. | **Intelligent Support.** Provide instant, accurate answers by connecting your agent to your company's knowledge. |

---

## 🛠️ Quick Start: Deploy Your AFO Platform

AFO is built with a modern, scalable stack: **TypeScript/React** (Frontend), **Python** (Backend/Workflow Engine), **Qwen 3 Omni** (Voice AI), and **MongoDB/Milvus** (Data/RAG).

### Prerequisites

*   Docker and Docker Compose
*   A Linux-based environment (for `supervisorctl`)

### 1. Clone & Install

```bash
# Clone the repository
git clone https://github.com/GodOfAgents/AgenticFunnels-Orchestration.git
cd AgenticFunnels-Orchestration

# Install dependencies for backend and frontend
cd backend && pip install -r requirements.txt
cd ../template/app && yarn install
```

### 2. Launch Services

```bash
# Start all core services (database, backend, frontend)
docker-compose up -d

# Start the supervisor processes (agents, workers)
sudo supervisorctl start all
```

### 3. Access the Platform

Open your browser and navigate to:

**`http://localhost:3000`**

See the full [SETUP_GUIDE.md](SETUP_GUIDE.md) for detailed configuration, API key setup, and production deployment instructions.

---

## 📚 Documentation & Resources

*   [**COMPLETE_PLAN.md**](COMPLETE_PLAN.md) - The full product vision and roadmap.
*   [**PRD.md**](PRD.md) - Detailed product requirements and user personas.
*   [**AGENT_CREATION_ENHANCED.md**](AGENT_CREATION_ENHANCED.md) - Deep dive into the agent creation process.
*   [**DEPLOYMENT_GUIDE.md**](DEPLOYMENT_GUIDE.md) - Instructions for production deployment.
*   [**CONTRIBUTING.md**](CONTRIBUTING.md) - Guidelines for community contributions.

---

## 🤝 Contributing

We welcome all contributions! Whether it's code, documentation, or feedback, your input helps shape the future of autonomous customer engagement. Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the **MIT**. See the [LICENSE](LICENSE) file for more details.

---
*Developed by GodOfAgents - Orchestrating the next generation of AI-powered business.*