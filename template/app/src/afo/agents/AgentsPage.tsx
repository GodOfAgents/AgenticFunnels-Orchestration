import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../lib/api-client';

export default function AgentsPage({ user }: any) {
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const history = useNavigate();

  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = async () => {
    try {
      setLoading(true);
      const response = await apiClient.listAgents(user.id);
      setAgents(response || []);
    } catch (error) {
      console.error('Failed to load agents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (agentId: string, isActive: boolean) => {
    try {
      if (isActive) {
        await apiClient.deactivateAgent(agentId);
      } else {
        await apiClient.activateAgent(agentId);
      }
      loadAgents();
    } catch (error) {
      console.error('Failed to toggle agent status:', error);
    }
  };

  const handleDelete = async (agentId: string) => {
    if (!confirm('Are you sure you want to delete this agent?')) return;
    
    try {
      await apiClient.deleteAgent(agentId);
      loadAgents();
    } catch (error) {
      console.error('Failed to delete agent:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading agents...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Agents</h1>
          <p className="text-gray-600 mt-2">Manage your AI agents for lead qualification and customer engagement</p>
        </div>
        <button
          onClick={() => navigate('/agent/create')}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          data-testid="create-agent-btn"
        >
          + Create New Agent
        </button>
      </div>

      {/* Agents Grid */}
      {agents.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">No agents yet</h3>
          <p className="mt-2 text-gray-500">Get started by creating your first AI agent</p>
          <button
            onClick={() => navigate('/agent/create')}
            className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Create Agent
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent) => (
            <div
              key={agent.id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition cursor-pointer"
              onClick={() => navigate(`/agent/${agent.id}`)}
              data-testid={`agent-card-${agent.id}`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900">{agent.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{agent.role}</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    agent.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {agent.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <span className="font-medium mr-2">Persona:</span>
                  <span className="capitalize">{agent.persona}</span>
                </div>
                {agent.voiceEnabled && (
                  <div className="flex items-center text-sm text-gray-600">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                    Voice Enabled
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 gap-4 py-4 border-t border-gray-200">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{agent.totalConversations}</div>
                  <div className="text-xs text-gray-600">Conversations</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{(agent.successRate * 100).toFixed(0)}%</div>
                  <div className="text-xs text-gray-600">Success Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{agent.avgResponseTime.toFixed(1)}s</div>
                  <div className="text-xs text-gray-600">Avg Response</div>
                </div>
              </div>

              <div className="flex gap-2 mt-4" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => handleToggleStatus(agent.id, agent.isActive)}
                  className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition ${
                    agent.isActive
                      ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                >
                  {agent.isActive ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  onClick={() => handleDelete(agent.id)}
                  className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}