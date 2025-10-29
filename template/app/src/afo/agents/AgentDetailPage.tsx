import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../lib/api-client';

export default function AgentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [agent, setAgent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const history = useNavigate();

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading agent...</div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Agent not found</h2>
          <button
            onClick={() => history.push('/agents')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Back to Agents
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => history.push('/agents')}
          className="text-blue-600 hover:text-blue-700 mb-4"
        >
          ← Back to Agents
        </button>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{agent.name}</h1>
            <p className="text-gray-600 mt-2">{agent.role}</p>
          </div>
          <div className="flex gap-3">
            <span
              className={`px-4 py-2 rounded-lg font-medium ${
                agent.isActive
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {agent.isActive ? 'Active' : 'Inactive'}
            </span>
            <button
              onClick={() => history.push(`/workflows/${agent.id}`)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Workflows
            </button>
            <button
              onClick={() => history.push(`/voice/config/${agent.id}`)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Voice Setup
            </button>
            <button
              onClick={() => history.push(`/conversations?agent_id=${agent.id}`)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Conversations
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600">Total Conversations</div>
          <div className="text-3xl font-bold text-gray-900 mt-2">{agent.totalConversations}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600">Success Rate</div>
          <div className="text-3xl font-bold text-green-600 mt-2">
            {(agent.successRate * 100).toFixed(1)}%
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600">Avg Response Time</div>
          <div className="text-3xl font-bold text-blue-600 mt-2">
            {agent.avgResponseTime.toFixed(1)}s
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600">Voice Enabled</div>
          <div className="text-3xl font-bold text-purple-600 mt-2">
            {agent.voiceEnabled ? 'Yes' : 'No'}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <div className="flex">
            {['overview', 'knowledge', 'settings'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-4 font-medium capitalize ${
                  activeTab === tab
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Persona</h3>
                <p className="text-gray-700 capitalize">{agent.persona}</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">System Prompt</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                    {agent.systemPrompt}
                  </pre>
                </div>
              </div>

              {agent.voiceEnabled && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Voice Configuration</h3>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="text-sm text-purple-900">
                      <div><span className="font-medium">Voice ID:</span> {agent.voiceId || 'Default'}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'knowledge' && (
            <div className="text-center py-8">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Knowledge Base</h3>
              <p className="mt-2 text-gray-500">Upload documents to enhance your agent's knowledge</p>
              <button
                onClick={() => history.push(`/knowledge?agent_id=${agent.id}`)}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Manage Knowledge Base
              </button>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Agent Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">Agent Status</div>
                      <div className="text-sm text-gray-600">Enable or disable this agent</div>
                    </div>
                    <button
                      onClick={() => {
                        /* Toggle status */
                      }}
                      className={`px-4 py-2 rounded-lg font-medium ${
                        agent.isActive
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {agent.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="font-medium text-gray-900 mb-2">Deployment Options</div>
                    <div className="text-sm text-gray-600 mb-4">
                      Embed this agent on your website or integrate via API
                    </div>
                    <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                      View Deployment Options
                    </button>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="font-medium text-red-600 mb-2">Danger Zone</div>
                    <div className="text-sm text-gray-600 mb-4">
                      Permanently delete this agent and all associated data
                    </div>
                    <button
                      onClick={async () => {
                        if (confirm('Are you sure? This action cannot be undone.')) {
                          await apiClient.deleteAgent(agent.id);
                          history.push('/agents');
                        }
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      Delete Agent
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}