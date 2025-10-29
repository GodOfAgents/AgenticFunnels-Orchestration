import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from 'wasp/client/auth';
import apiClient from '../lib/api-client';

interface WorkflowNode {
  id: string;
  type: 'trigger' | 'qwen' | 'decision' | 'action' | 'integration';
  label: string;
  config: any;
  position: { x: number; y: number };
}

interface Workflow {
  id?: string;
  name: string;
  description: string;
  trigger: string;
  nodes: WorkflowNode[];
  active: boolean;
}

const NODE_TYPES = {
  trigger: {
    icon: '⚡',
    color: 'bg-yellow-100 border-yellow-500 text-yellow-800',
    label: 'Trigger',
    options: ['Incoming Call', 'Webhook', 'Schedule', 'User Action'],
  },
  qwen: {
    icon: '🎙️',
    color: 'bg-blue-100 border-blue-500 text-blue-800',
    label: 'Qwen 3 Omni',
    options: ['Voice Conversation', 'Text Chat', 'Emotion Detection', 'Language Detection'],
  },
  decision: {
    icon: '🔀',
    color: 'bg-purple-100 border-purple-500 text-purple-800',
    label: 'Decision',
    options: ['If/Then/Else', 'Switch/Case', 'Loop', 'Qualified?'],
  },
  action: {
    icon: '⚙️',
    color: 'bg-green-100 border-green-500 text-green-800',
    label: 'Action',
    options: ['Send Message', 'Wait/Delay', 'Update Database', 'Log Event'],
  },
  integration: {
    icon: '🔌',
    color: 'bg-pink-100 border-pink-500 text-pink-800',
    label: 'Integration',
    options: ['Google Calendar', 'Calendly', 'CRM Webhook', 'Send Email', 'Send SMS'],
  },
};

const WORKFLOW_TEMPLATES = [
  {
    id: 'lead-qualification',
    name: 'Lead Qualification',
    description: 'Qualify leads, schedule meetings, update CRM',
    icon: '💼',
    nodes: [
      { type: 'trigger', label: 'Incoming Call' },
      { type: 'qwen', label: 'Greet & Qualify' },
      { type: 'decision', label: 'Qualified?' },
      { type: 'integration', label: 'Schedule Meeting' },
      { type: 'integration', label: 'Update CRM' },
    ],
  },
  {
    id: 'customer-support',
    name: 'Customer Support',
    description: 'Troubleshoot issues, create tickets, follow up',
    icon: '🎧',
    nodes: [
      { type: 'trigger', label: 'Support Request' },
      { type: 'qwen', label: 'Understand Issue' },
      { type: 'action', label: 'Search Knowledge Base' },
      { type: 'decision', label: 'Resolved?' },
      { type: 'integration', label: 'Create Ticket' },
    ],
  },
  {
    id: 'appointment-booking',
    name: 'Appointment Booking',
    description: 'Check availability, book appointments, send reminders',
    icon: '📅',
    nodes: [
      { type: 'trigger', label: 'Schedule Request' },
      { type: 'qwen', label: 'Ask Preferences' },
      { type: 'integration', label: 'Check Calendar' },
      { type: 'integration', label: 'Book Appointment' },
      { type: 'action', label: 'Send Confirmation' },
    ],
  },
];

export default function VisualWorkflowBuilder() {
  const { agentId } = useParams<{ agentId: string }>();
  const { data: user } = useAuth();
  const [workflow, setWorkflow] = useState<Workflow>({
    name: '',
    description: '',
    trigger: 'incoming_call',
    nodes: [],
    active: false,
  });
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null);
  const [showTemplates, setShowTemplates] = useState(true);
  const [showNodeLibrary, setShowNodeLibrary] = useState(false);

  useEffect(() => {
    if (agentId) {
      loadWorkflows();
    }
  }, [agentId]);

  const loadWorkflows = async () => {
    try {
      setLoading(true);
      const response = await apiClient.listWorkflows(agentId);
      setWorkflows(response.workflows || []);
    } catch (error) {
      console.error('Failed to load workflows:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUseTemplate = (template: any) => {
    const nodes = template.nodes.map((node: any, index: number) => ({
      id: `node-${Date.now()}-${index}`,
      type: node.type,
      label: node.label,
      config: {},
      position: { x: 50 + index * 200, y: 100 },
    }));

    setWorkflow({
      ...workflow,
      name: template.name,
      description: template.description,
      nodes,
    });
    setShowTemplates(false);
  };

  const handleAddNode = (type: string) => {
    const newNode: WorkflowNode = {
      id: `node-${Date.now()}`,
      type: type as any,
      label: NODE_TYPES[type].label,
      config: {},
      position: { x: 50 + workflow.nodes.length * 200, y: 100 },
    };

    setWorkflow({
      ...workflow,
      nodes: [...workflow.nodes, newNode],
    });
    setShowNodeLibrary(false);
  };

  const handleRemoveNode = (nodeId: string) => {
    setWorkflow({
      ...workflow,
      nodes: workflow.nodes.filter(n => n.id !== nodeId),
    });
    setSelectedNode(null);
  };

  const handleSaveWorkflow = async () => {
    try {
      setLoading(true);
      
      const workflowData = {
        agent_id: agentId,
        name: workflow.name,
        description: workflow.description,
        trigger: workflow.trigger,
        nodes: workflow.nodes.map(n => ({
          id: n.id,
          type: n.type,
          config: n.config,
        })),
      };

      await apiClient.createWorkflow(workflowData);
      alert('Workflow saved successfully! 🎉');
      loadWorkflows();
    } catch (error: any) {
      alert(`Failed to save workflow: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Visual Workflow Builder
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Drag, drop, and connect nodes to automate your agent
              </p>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowNodeLibrary(!showNodeLibrary)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                📦 Add Node
              </button>
              <button
                onClick={() => setShowTemplates(!showTemplates)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                📋 Templates
              </button>
              <button
                onClick={handleSaveWorkflow}
                disabled={loading || !workflow.name || workflow.nodes.length === 0}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50"
              >
                {loading ? 'Saving...' : '💾 Save Workflow'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Templates Modal */}
        {showTemplates && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Workflow Templates
                  </h2>
                  <button
                    onClick={() => setShowTemplates(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {WORKFLOW_TEMPLATES.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => handleUseTemplate(template)}
                      className="p-6 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 hover:shadow-lg transition-all text-left"
                    >
                      <div className="text-4xl mb-3">{template.icon}</div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                        {template.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {template.description}
                      </p>
                      <div className="text-xs text-gray-500">
                        {template.nodes.length} nodes
                      </div>
                    </button>
                  ))}
                </div>
                
                <div className="mt-6 text-center">
                  <button
                    onClick={() => {
                      setShowTemplates(false);
                      setWorkflow({ ...workflow, nodes: [] });
                    }}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Start from scratch →
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Node Library Modal */}
        {showNodeLibrary && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full mx-4">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Add Node
                  </h2>
                  <button
                    onClick={() => setShowNodeLibrary(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(NODE_TYPES).map(([type, config]) => (
                    <button
                      key={type}
                      onClick={() => handleAddNode(type)}
                      className={`p-4 border-2 rounded-lg text-left transition-all hover:shadow-lg ${config.color}`}
                    >
                      <div className="text-3xl mb-2">{config.icon}</div>
                      <div className="font-semibold mb-1">{config.label}</div>
                      <div className="text-xs opacity-75">
                        {config.options[0]}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Workflow Config */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Workflow Name
              </label>
              <input
                type="text"
                value={workflow.name}
                onChange={(e) => setWorkflow({ ...workflow, name: e.target.value })}
                placeholder="e.g., Lead Qualification Flow"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <input
                type="text"
                value={workflow.description}
                onChange={(e) => setWorkflow({ ...workflow, description: e.target.value })}
                placeholder="Brief description of what this workflow does"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Canvas */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 min-h-[500px] relative overflow-auto">
          {workflow.nodes.length === 0 ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <div className="text-6xl mb-4">🎨</div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Start Building Your Workflow
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Choose a template or add nodes from the library
                </p>
                <div className="flex justify-center space-x-3">
                  <button
                    onClick={() => setShowTemplates(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Use Template
                  </button>
                  <button
                    onClick={() => setShowNodeLibrary(true)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
                  >
                    Add Node
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="relative">
              {/* Node Flow */}
              <div className="flex items-start space-x-8">
                {workflow.nodes.map((node, index) => (
                  <div key={node.id} className="flex items-center">
                    <div
                      className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        NODE_TYPES[node.type].color
                      } ${selectedNode?.id === node.id ? 'ring-4 ring-blue-300' : ''}`}
                      onClick={() => setSelectedNode(node)}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveNode(node.id);
                        }}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                      >
                        ×
                      </button>
                      
                      <div className="text-3xl mb-2">{NODE_TYPES[node.type].icon}</div>
                      <div className="font-semibold text-sm">{node.label}</div>
                      <div className="text-xs mt-1 opacity-75">{NODE_TYPES[node.type].label}</div>
                    </div>
                    
                    {index < workflow.nodes.length - 1 && (
                      <div className="flex items-center text-gray-400">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Existing Workflows */}
        {workflows.length > 0 && (
          <div className="mt-8 bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Saved Workflows
            </h2>
            
            <div className="space-y-3">
              {workflows.map((wf) => (
                <div
                  key={wf.id}
                  className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">{wf.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{wf.description}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      wf.active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {wf.active ? 'Active' : 'Inactive'}
                    </span>
                    <button className="text-blue-600 hover:text-blue-700 text-sm">
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
