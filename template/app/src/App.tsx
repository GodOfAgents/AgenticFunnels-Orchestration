import { Routes, Route, Navigate } from 'react-router-dom';

// Landing & Auth
import LandingPage from './landing-page/LandingPage';
import LoginPage from './auth/LoginPage';

// AFO Pages
import DashboardPage from './afo/dashboard/DashboardPage';
import AgentsPage from './afo/agents/AgentsPage';
import AgentCreatePage from './afo/agents/AgentCreatePage';
import AgentCreatePageEnhanced from './afo/agents/AgentCreatePageEnhanced';
import AgentDetailPage from './afo/agents/AgentDetailPage';
import AgentDetailPageEnhanced from './afo/agents/AgentDetailPageEnhanced';
import WorkflowBuilderPage from './afo/workflows/WorkflowBuilderPage';
import WorkflowCanvas from './afo/workflows/WorkflowCanvas';
import ConversationsPage from './afo/conversations/ConversationsPage';
import ConversationDetailPage from './afo/conversations/ConversationDetailPage';
import IntegrationsPage from './afo/integrations/IntegrationsPage';
import KnowledgePage from './afo/knowledge/KnowledgePage';
import QwenChatInterface from './afo/qwen/QwenChatInterface';

// Mock user for now (replace with real auth later)
const mockUser = {
  id: 'user-123',
  email: 'demo@afo.com',
  name: 'Demo User'
};

// Simple auth wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  // TODO: Implement real auth check
  const isAuthenticated = true; // Mock for now
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardPage user={mockUser} />
          </ProtectedRoute>
        } />

        {/* Agents */}
        <Route path="/agents" element={
          <ProtectedRoute>
            <AgentsPage user={mockUser} />
          </ProtectedRoute>
        } />
        <Route path="/agent/create" element={
          <ProtectedRoute>
            <AgentCreatePage user={mockUser} />
          </ProtectedRoute>
        } />
        <Route path="/agent/create-new" element={
          <ProtectedRoute>
            <AgentCreatePageEnhanced user={mockUser} />
          </ProtectedRoute>
        } />
        <Route path="/agent/:id" element={
          <ProtectedRoute>
            <AgentDetailPage />
          </ProtectedRoute>
        } />
        <Route path="/agent/:id/dashboard" element={
          <ProtectedRoute>
            <AgentDetailPageEnhanced />
          </ProtectedRoute>
        } />

        {/* Workflows */}
        <Route path="/workflows/:agentId" element={
          <ProtectedRoute>
            <WorkflowBuilderPage />
          </ProtectedRoute>
        } />
        <Route path="/workflows/:agentId/builder/:workflowId?" element={
          <ProtectedRoute>
            <WorkflowCanvas />
          </ProtectedRoute>
        } />

        {/* Conversations */}
        <Route path="/conversations" element={
          <ProtectedRoute>
            <ConversationsPage />
          </ProtectedRoute>
        } />
        <Route path="/conversation/:id" element={
          <ProtectedRoute>
            <ConversationDetailPage />
          </ProtectedRoute>
        } />

        {/* Integrations */}
        <Route path="/integrations" element={
          <ProtectedRoute>
            <IntegrationsPage user={mockUser} />
          </ProtectedRoute>
        } />

        {/* Knowledge */}
        <Route path="/knowledge" element={
          <ProtectedRoute>
            <KnowledgePage />
          </ProtectedRoute>
        } />

        {/* Qwen Chat */}
        <Route path="/qwen-chat/:agentId?" element={
          <ProtectedRoute>
            <QwenChatInterface />
          </ProtectedRoute>
        } />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
