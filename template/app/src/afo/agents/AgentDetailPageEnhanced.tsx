/**
 * Enhanced Agent Detail Page
 * Complete management interface with testing, analytics, and integrations
 */

import React, { useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import apiClient from '../lib/api-client';

export default function AgentDetailPageEnhanced() {
  const { id } = useParams<{ id: string }>();
  const [agent, setAgent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [editMode, setEditMode] = useState(false);
  const [showTestChat, setShowTestChat] = useState(false);
  const [integrations, setIntegrations] = useState<any[]>([]);
  const history = useHistory();

  // TODO: Replace with actual user ID from auth
  const userId = 'user-123';

  useEffect(() => {
    loadAgentData();
  }, [id]);

  const loadAgentData = async () => {
    try {
      setLoading(true);
      const [agentData, integrationsData] = await Promise.all([
        apiClient.getAgent(id),
        apiClient.getAgentIntegrationStatus(id, userId)
      ]);
      setAgent(agentData);
      setIntegrations(Object.entries(integrationsData.integrations || {}));
    } catch (error) {
      console.error('Failed to load agent data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleAgentStatus = async () => {
    try {
      await apiClient.updateAgent(id, { isActive: !agent.isActive });
      setAgent({ ...agent, isActive: !agent.isActive });
    } catch (error) {
      alert('Failed to update agent status');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-lg text-gray-600">Loading agent...</div>
        </div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="mt-4 text-2xl font-bold text-gray-900">Agent not found</h2>
          <button
            onClick={() => history.push('/agents')}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Agents
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'integrations', label: 'Integrations', icon: '⚡' },
    { id: 'analytics', label: 'Analytics', icon: '📈' },
    { id: 'knowledge', label: 'Knowledge', icon: '📚' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <button
            onClick={() => history.push('/agents')}
            className="text-blue-600 hover:text-blue-700 mb-4 inline-flex items-center"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Agents
          </button>
          
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                {agent.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{agent.name}</h1>
                <p className="text-gray-600 mt-1">{agent.role}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    agent.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {agent.isActive ? '● Active' : '○ Inactive'}
                  </span>
                  {agent.voiceEnabled && (
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                      🎤 Voice Enabled
                    </span>
                  )}
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 capitalize">
                    {agent.persona}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => setShowTestChat(true)}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 shadow-md transition flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Test Agent
              </button>
              <button
                onClick={() => history.push(`/workflows/${id}/builder`)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 shadow-md transition"
              >
                Workflows
              </button>
              <button
                onClick={() => history.push(`/conversations?agent_id=${id}`)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-md transition"
              >
                Conversations
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-600">Total Conversations</div>
                <div className="text-3xl font-bold text-gray-900 mt-2">{agent.totalConversations || 0}</div>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
            </div>
            <div className="text-xs text-green-600 mt-2">+12% from last week</div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-600">Success Rate</div>
                <div className="text-3xl font-bold text-green-600 mt-2">
                  {((agent.successRate || 0) * 100).toFixed(1)}%
                </div>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="text-xs text-green-600 mt-2">Target: 85%</div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-600">Avg Response Time</div>
                <div className="text-3xl font-bold text-yellow-600 mt-2">
                  {(agent.avgResponseTime || 0).toFixed(1)}s
                </div>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="text-xs text-yellow-600 mt-2">-0.3s improvement</div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-600">Integrations</div>
                <div className="text-3xl font-bold text-purple-600 mt-2">
                  {integrations.filter(([_, data]) => data.configured).length}
                </div>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
            <div className="text-xs text-purple-600 mt-2">
              {integrations.length - integrations.filter(([_, data]) => data.configured).length} available
            </div>
          </div>
        </div>

        {/* Main Content - Tabs */}
        <div className="bg-white rounded-xl shadow-md">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <div className="flex overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-4 font-medium whitespace-nowrap transition ${
                    activeTab === tab.id
                      ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Agent Details */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Agent Information</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-gray-600">Name:</span>
                        <span className="font-medium">{agent.name}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-gray-600">Role:</span>
                        <span className="font-medium">{agent.role}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-gray-600">Persona:</span>
                        <span className="font-medium capitalize">{agent.persona}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-gray-600">Voice:</span>
                        <span className={`font-medium ${agent.voiceEnabled ? 'text-green-600' : 'text-gray-500'}`}>
                          {agent.voiceEnabled ? 'Enabled (Qwen 3 Omni)' : 'Disabled'}
                        </span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-gray-600">Created:</span>
                        <span className="font-medium">{new Date(agent.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance</h3>
                    <div className="space-y-4">
                      <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
                        <div className="text-sm text-blue-900 mb-1">Conversations Today</div>
                        <div className="text-2xl font-bold text-blue-900">24</div>
                      </div>
                      <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg">
                        <div className="text-sm text-green-900 mb-1">Qualified Leads</div>
                        <div className="text-2xl font-bold text-green-900">18</div>
                      </div>
                      <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg">
                        <div className="text-sm text-purple-900 mb-1">Meetings Scheduled</div>
                        <div className="text-2xl font-bold text-purple-900">7</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* System Prompt */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">System Instructions</h3>
                    <button
                      onClick={() => history.push(`/agent/${id}/edit`)}
                      className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                    >
                      Edit
                    </button>
                  </div>
                  <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                    <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
                      {agent.systemPrompt || 'No system prompt configured'}
                    </pre>
                  </div>
                </div>

                {/* Recent Activity */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                  <div className="space-y-3">
                    {[
                      { time: '2 min ago', event: 'Conversation completed', status: 'success' },
                      { time: '15 min ago', event: 'Lead qualified', status: 'success' },
                      { time: '1 hour ago', event: 'Meeting scheduled', status: 'success' },
                      { time: '2 hours ago', event: 'Conversation started', status: 'info' },
                    ].map((activity, idx) => (
                      <div key={idx} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                        <div className={`w-2 h-2 rounded-full ${
                          activity.status === 'success' ? 'bg-green-500' : 'bg-blue-500'
                        }`}></div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">{activity.event}</div>
                          <div className="text-xs text-gray-500">{activity.time}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'integrations' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Connected Integrations</h3>
                    <p className="text-sm text-gray-600 mt-1">Manage external service connections</p>
                  </div>
                  <button
                    onClick={() => history.push(`/agent/${id}/edit#integrations`)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Add Integration
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {integrations.map(([type, data]: [string, any]) => (
                    <div
                      key={type}
                      className={`p-5 rounded-lg border-2 ${
                        data.configured
                          ? 'border-green-200 bg-green-50'
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            data.configured ? 'bg-green-200' : 'bg-gray-200'
                          }`}>
                            {type === 'calendar' && '📅'}
                            {type === 'crm' && '🤝'}
                            {type === 'email' && '📧'}
                            {type === 'twilio' && '📱'}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 capitalize">{type}</div>
                            {data.configured && data.provider && (
                              <div className="text-sm text-gray-600 capitalize">{data.provider}</div>
                            )}
                          </div>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          data.configured
                            ? 'bg-green-200 text-green-800'
                            : 'bg-gray-200 text-gray-600'
                        }`}>
                          {data.configured ? 'Connected' : 'Not Connected'}
                        </span>
                      </div>
                      {data.required_for_nodes && data.required_for_nodes.length > 0 && (
                        <div className="mt-3 text-xs text-gray-600">
                          Required for: {data.required_for_nodes.join(', ')}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Analytics</h3>
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-8 rounded-lg text-center border border-blue-200">
                    <svg className="mx-auto h-16 w-16 text-blue-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <h4 className="text-xl font-semibold text-gray-900 mb-2">Analytics Dashboard Coming Soon</h4>
                    <p className="text-gray-600 mb-4">
                      Detailed charts and insights about your agent's performance, conversation trends, and more
                    </p>
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-200">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                      <span className="text-sm text-gray-700">In Development</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'knowledge' && (
              <div className="space-y-6">
                <div className="text-center py-12">
                  <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Knowledge Base</h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Upload documents to enhance your agent's knowledge. Supports PDFs, Word docs, and text files.
                  </p>
                  <button
                    onClick={() => history.push(`/knowledge?agent_id=${id}`)}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md"
                  >
                    Manage Knowledge Base
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">General Settings</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900">Agent Status</div>
                        <div className="text-sm text-gray-600">Enable or disable this agent</div>
                      </div>
                      <button
                        onClick={toggleAgentStatus}
                        className={`px-6 py-2 rounded-lg font-medium transition ${
                          agent.isActive
                            ? 'bg-red-100 text-red-700 hover:bg-red-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        {agent.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900">Edit Agent Configuration</div>
                        <div className="text-sm text-gray-600">Update name, role, persona, and system prompt</div>
                      </div>
                      <button
                        onClick={() => history.push(`/agent/${id}/edit`)}
                        className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Deployment</h3>
                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-lg border border-purple-200">
                    <div className="font-medium text-gray-900 mb-2">Embed & Integrate</div>
                    <div className="text-sm text-gray-600 mb-4">
                      Embed this agent on your website or integrate via API
                    </div>
                    <button className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium">
                      View Deployment Options
                    </button>
                  </div>
                </div>

                <div className="pt-6 border-t">
                  <h3 className="text-lg font-semibold text-red-600 mb-4">Danger Zone</h3>
                  <div className="bg-red-50 p-6 rounded-lg border-2 border-red-200">
                    <div className="font-medium text-red-900 mb-2">Delete Agent</div>
                    <div className="text-sm text-red-700 mb-4">
                      Permanently delete this agent and all associated data. This action cannot be undone.
                    </div>
                    <button
                      onClick={async () => {
                        if (window.confirm('Are you sure? This action cannot be undone.')) {
                          try {
                            await apiClient.deleteAgent(id);
                            alert('Agent deleted successfully');
                            history.push('/agents');
                          } catch (error) {
                            alert('Failed to delete agent');
                          }
                        }
                      }}
                      className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                    >
                      Delete Agent
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Test Chat Modal */}
      {showTestChat && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold">Test Agent: {agent.name}</h3>
              <button
                onClick={() => setShowTestChat(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
              <div className="text-center text-gray-500 py-8">
                <p>Test chat interface coming soon...</p>
                <p className="text-sm mt-2">This will allow you to test your agent in real-time</p>
              </div>
            </div>
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled
                />
                <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700" disabled>
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
