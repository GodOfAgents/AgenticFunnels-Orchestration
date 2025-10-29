import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import apiClient from '../lib/api-client';

export default function WorkflowBuilderPage({ user }: any) {
  const { agentId } = useParams<{ agentId: string }>();
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const history = useNavigate();

  useEffect(() => {
    loadWorkflows();
  }, [agentId]);

  const loadWorkflows = async () => {
    try {
      setLoading(true);
      if (agentId) {
        const response = await apiClient.listWorkflows(agentId);
        setWorkflows(response.workflows || []);
      }
    } catch (error) {
      console.error('Failed to load workflows:', error);
      setWorkflows([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Workflows</h1>
          <p className="text-gray-600 mt-2">Automate your agent's actions and responses</p>
        </div>
        <button
          onClick={() => navigate(`/workflows/${agentId}/builder`)}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          + Create Visual Workflow
        </button>
      </div>

      {/* Pre-built Templates */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Pre-built Templates</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              name: 'Lead Qualification',
              description: 'Qualify leads and collect contact information',
              nodes: 5,
              icon: '🎯'
            },
            {
              name: 'Meeting Scheduler',
              description: 'Schedule meetings and send calendar invites',
              nodes: 6,
              icon: '📅'
            },
            {
              name: 'Support Ticket',
              description: 'Create support tickets and route to team',
              nodes: 4,
              icon: '🎫'
            },
            {
              name: 'Product Demo',
              description: 'Guide prospects through product demo flow',
              nodes: 7,
              icon: '🎬'
            }
          ].map((template) => (
            <div
              key={template.name}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition cursor-pointer"
              onClick={() => {/* Create from template */}}
            >
              <div className="text-4xl mb-4">{template.icon}</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{template.name}</h3>
              <p className="text-sm text-gray-600 mb-4">{template.description}</p>
              <div className="text-xs text-gray-500">{template.nodes} nodes</div>
              <button className="mt-4 w-full px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100">
                Use Template
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Custom Workflows */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Custom Workflows</h2>
        {workflows.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-lg">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No custom workflows yet</h3>
            <p className="mt-2 text-gray-500">Create a workflow to automate your agent's behavior</p>
            <button
              onClick={() => setShowCreate(true)}
              className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Create Workflow
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workflows.map((workflow) => (
              <div
                key={workflow.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition cursor-pointer"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{workflow.name}</h3>
                <p className="text-sm text-gray-600 mb-4">{workflow.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">{workflow.nodes?.length || 0} nodes</span>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    workflow.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {workflow.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Workflow Node Types Reference */}
      <div className="mt-8 bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Workflow Nodes</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { type: 'message', icon: '💬', name: 'Message' },
            { type: 'collect_info', icon: '📝', name: 'Collect Info' },
            { type: 'decision', icon: '🔀', name: 'Decision' },
            { type: 'schedule_meeting', icon: '📅', name: 'Schedule Meeting' },
            { type: 'api_call', icon: '🔗', name: 'API Call' },
            { type: 'crm_update', icon: '💼', name: 'CRM Update' },
            { type: 'send_info', icon: '📤', name: 'Send Info' },
            { type: 'webhook', icon: '🪝', name: 'Webhook' }
          ].map((node) => (
            <div key={node.type} className="flex items-center space-x-2 text-sm">
              <span className="text-xl">{node.icon}</span>
              <span className="text-gray-700">{node.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}