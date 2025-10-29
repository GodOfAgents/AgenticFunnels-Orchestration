import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Link as WaspRouterLink, routes } from '@src/lib/router';
import apiClient from '../lib/api-client';

const VOICE_PERSONAS = {
  0: 'Professional Female',
  1: 'Professional Male',
  2: 'Friendly Female',
  3: 'Friendly Male',
  4: 'Casual Female',
  5: 'Casual Male',
  6: 'Energetic Female',
  7: 'Energetic Male',
  8: 'Calm Female',
  9: 'Calm Male',
  10: 'Authoritative Female',
  11: 'Authoritative Male',
  12: 'Empathetic Female',
  13: 'Empathetic Male',
  14: 'Technical Female',
  15: 'Technical Male',
  16: 'Multilingual Neutral',
};

export default function AgentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const history = useNavigate();
  const [agent, setAgent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [testing, setTesting] = useState(false);
  const [qwenSession, setQwenSession] = useState<any>(null);

  useEffect(() => {
    loadAgent();
  }, [id]);

  const loadAgent = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getAgent(id);
      setAgent(response);
    } catch (error) {
      console.error('Failed to load agent:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTestAgent = async () => {
    try {
      setTesting(true);
      
      const session = await apiClient.createQwenSession({
        agent_id: agent.id,
        agent_config: {
          system_prompt: agent.systemPrompt,
          voice_id: agent.voiceSettings?.voicePersona || 3,
          language: agent.voiceSettings?.language || 'auto',
        },
      });

      setQwenSession(session);
      alert('Test session created! Opening chat...');
      history.push('/qwen/chat');
    } catch (error: any) {
      alert(`Failed to test agent: ${error.message}`);
    } finally {
      setTesting(false);
    }
  };

  const toggleAgentStatus = async () => {
    try {
      if (agent.isActive) {
        await apiClient.deactivateAgent(id);
      } else {
        await apiClient.activateAgent(id);
      }
      loadAgent();
    } catch (error: any) {
      alert(`Failed to update agent status: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Agent not found
          </h2>
          <WaspRouterLink
            to={routes.AgentsRoute.to}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Agents
          </WaspRouterLink>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <WaspRouterLink
                to={routes.AgentsRoute.to}
                className="mr-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </WaspRouterLink>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {agent.name}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {agent.role || 'AI Assistant'}
                </p>
              </div>
            </div>

            <div className="flex space-x-3">
              <span
                className={`px-4 py-2 rounded-lg font-medium ${
                  agent.isActive
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                }`}
              >
                {agent.isActive ? 'Active' : 'Inactive'}
              </span>
              
              <button
                onClick={handleTestAgent}
                disabled={testing}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50"
              >
                {testing ? 'Starting...' : '🧪 Test Agent'}
              </button>

              <button
                onClick={toggleAgentStatus}
                className={`px-4 py-2 rounded-lg ${
                  agent.isActive
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {agent.isActive ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
          <nav className="-mb-px flex space-x-8">
            {['overview', 'voice', 'workflows', 'analytics'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Info Card */}
            <div className="lg:col-span-2 bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Agent Information
              </h2>
              
              <div className="space-y-4">
                <InfoRow label="Name" value={agent.name} />
                <InfoRow label="Role" value={agent.role || 'Not specified'} />
                <InfoRow label="Use Case" value={agent.useCase || 'General'} />
                <InfoRow label="Status" value={agent.isActive ? '🟢 Active' : '🔴 Inactive'} />
                <InfoRow label="Created" value={new Date(agent.createdAt).toLocaleDateString()} />
              </div>

              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  System Prompt
                </h3>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 text-sm text-gray-700 dark:text-gray-300 font-mono whitespace-pre-wrap">
                  {agent.systemPrompt || 'No system prompt configured'}
                </div>
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Quick Actions
                </h2>
                
                <div className="space-y-3">
                  <ActionButton
                    onClick={handleTestAgent}
                    icon="🧪"
                    label="Test Agent"
                    description="Start test conversation"
                  />
                  
                  <WaspRouterLink to={`/workflows/${agent.id}`}>
                    <ActionButton
                      icon="🔧"
                      label="Workflows"
                      description="Manage automations"
                    />
                  </WaspRouterLink>
                  
                  <WaspRouterLink to={`/voice/config/${agent.id}`}>
                    <ActionButton
                      icon="🎙️"
                      label="Voice Setup"
                      description="Configure voice"
                    />
                  </WaspRouterLink>
                  
                  <WaspRouterLink to={routes.ConversationsRoute.to}>
                    <ActionButton
                      icon="💬"
                      label="Conversations"
                      description="View history"
                    />
                  </WaspRouterLink>
                </div>
              </div>

              {/* Stats Card */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
                <h3 className="font-semibold mb-4">Agent Stats</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-100">Total Calls:</span>
                    <span className="font-bold">0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-100">Avg Duration:</span>
                    <span className="font-bold">0m</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-100">Success Rate:</span>
                    <span className="font-bold">0%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Voice Tab */}
        {activeTab === 'voice' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                🎙️ Qwen 3 Omni Configuration
              </h2>
              
              <div className="space-y-4">
                <InfoRow 
                  label="Voice Persona" 
                  value={VOICE_PERSONAS[agent.voiceSettings?.voicePersona || 3]} 
                />
                <InfoRow 
                  label="Language" 
                  value={agent.voiceSettings?.language === 'auto' ? 'Auto-detect' : agent.voiceSettings?.language || 'Auto-detect'} 
                />
                <InfoRow 
                  label="Emotion Detection" 
                  value={agent.voiceSettings?.emotionDetection ? '✅ Enabled' : '❌ Disabled'} 
                />
                <InfoRow 
                  label="Video Support" 
                  value={agent.voiceSettings?.videoSupport ? '✅ Enabled' : '❌ Disabled'} 
                />
              </div>

              <div className="mt-6">
                <WaspRouterLink
                  to={`/voice/config/${agent.id}`}
                  className="block w-full px-4 py-2 bg-blue-600 text-white text-center rounded-lg hover:bg-blue-700"
                >
                  Configure Voice Settings
                </WaspRouterLink>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                🚀 Powered by Qwen 3 Omni
              </h3>
              <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <li className="flex items-start">
                  <span className="mr-2">⚡</span>
                  <span><strong>211ms latency</strong> - Ultra-fast responses</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">🌍</span>
                  <span><strong>19 languages</strong> - Auto-detection included</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">🎭</span>
                  <span><strong>17 voice personas</strong> - Match your brand</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">😊</span>
                  <span><strong>Emotion detection</strong> - Understand tone & urgency</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">🎥</span>
                  <span><strong>Video support</strong> - Screen sharing ready</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">💰</span>
                  <span><strong>85% cheaper</strong> - vs traditional pipelines</span>
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Workflows Tab */}
        {activeTab === 'workflows' && (
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Workflows
              </h2>
              <WaspRouterLink
                to={`/workflows/${agent.id}`}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                + Create Workflow
              </WaspRouterLink>
            </div>
            
            <div className="text-center py-12 text-gray-500">
              <p>No workflows configured yet</p>
              <p className="text-sm mt-2">Create your first workflow to automate agent actions</p>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Analytics
            </h2>
            
            <div className="text-center py-12 text-gray-500">
              <p>No analytics data yet</p>
              <p className="text-sm mt-2">Start using your agent to see analytics here</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700">
      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
        {label}
      </span>
      <span className="text-sm text-gray-900 dark:text-white font-medium">
        {value}
      </span>
    </div>
  );
}

function ActionButton({ onClick, icon, label, description }: any) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-start p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all text-left"
    >
      <span className="text-2xl mr-3">{icon}</span>
      <div>
        <div className="font-medium text-gray-900 dark:text-white text-sm">
          {label}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {description}
        </div>
      </div>
    </button>
  );
}
