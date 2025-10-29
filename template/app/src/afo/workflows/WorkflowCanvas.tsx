/**
 * Visual Workflow Builder - Drag & Drop Canvas
 * Interactive workflow creation interface using React Flow
 */

import React, { useState, useCallback, useEffect } from 'react';
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Background,
  Controls,
  MiniMap,
  Connection,
  useNodesState,
  useEdgesState,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../lib/api-client';

export function WorkflowCanvas() {
  const { agentId, workflowId } = useParams<{ agentId: string; workflowId?: string }>();
  const navigate = useNavigate();
  
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [workflowName, setWorkflowName] = useState('New Workflow');
  const [workflowDescription, setWorkflowDescription] = useState('');
  const [nodeTypes, setNodeTypes] = useState<any[]>([]);
  const [integrationStatus, setIntegrationStatus] = useState<any>(null);
  const [validationErrors, setValidationErrors] = useState<any[]>([]);
  const [validationWarnings, setValidationWarnings] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [showValidation, setShowValidation] = useState(false);

  // TODO: Get actual user ID from auth context
  const userId = 'user-123'; // Placeholder

  // Load node types and workflow data
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load available node types
        const typesData = await apiClient.getWorkflowNodeTypes();
        setNodeTypes(typesData.node_types || []);

        // Load integration status
        if (agentId) {
          const integrations = await apiClient.getAgentIntegrationStatus(agentId, userId);
          setIntegrationStatus(integrations);
        }

        // Load existing workflow if editing
        if (workflowId) {
          const workflow = await apiClient.getWorkflow(workflowId);
          setWorkflowName(workflow.name);
          setWorkflowDescription(workflow.description);
          
          // Convert workflow nodes to React Flow format
          const flowNodes = workflow.nodes.map((node: any) => ({
            id: node.id,
            type: 'default',
            position: node.position || { x: 100, y: 100 },
            data: {
              label: `${node.type}\n${JSON.stringify(node.config).substring(0, 30)}...`,
              type: node.type,
              config: node.config,
            },
          }));
          
          const flowEdges = workflow.nodes
            .filter((node: any) => node.next)
            .map((node: any) => ({
              id: `${node.id}-${node.next}`,
              source: node.id,
              target: node.next,
              markerEnd: { type: MarkerType.ArrowClosed },
            }));
          
          setNodes(flowNodes);
          setEdges(flowEdges);
        }
      } catch (error) {
        console.error('Failed to load workflow data:', error);
      }
    };

    loadData();
  }, [workflowId, agentId, userId, setNodes, setEdges]);

  // Handle connections between nodes
  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            markerEnd: { type: MarkerType.ArrowClosed },
          },
          eds
        )
      );
    },
    [setEdges]
  );

  // Handle node click
  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  // Add new node
  const handleAddNode = (nodeType: string) => {
    const newNode: Node = {
      id: `${nodeType}_${Date.now()}`,
      type: 'default',
      position: { x: 250, y: 50 + nodes.length * 100 },
      data: {
        label: nodeType,
        type: nodeType,
        config: {},
      },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  // Delete selected node
  const handleDeleteNode = () => {
    if (selectedNode) {
      setNodes((nds) => nds.filter((n) => n.id !== selectedNode.id));
      setEdges((eds) =>
        eds.filter((e) => e.source !== selectedNode.id && e.target !== selectedNode.id)
      );
      setSelectedNode(null);
    }
  };

  // Validate workflow
  const handleValidate = async () => {
    const workflowNodes = nodes.map((node) => ({
      id: node.id,
      type: node.data.type || node.data.label,
      config: node.data.config || {},
      position: node.position,
      next: edges.find((e) => e.source === node.id)?.target || null,
    }));

    const workflowData = {
      agent_id: agentId,
      name: workflowName,
      description: workflowDescription,
      trigger: 'conversation_start',
      nodes: workflowNodes,
    };

    try {
      const validation = await apiClient.validateWorkflow(workflowData, userId);
      setValidationErrors(validation.errors || []);
      setValidationWarnings(validation.warnings || []);
      setShowValidation(true);
      return validation.valid;
    } catch (error) {
      console.error('Validation failed:', error);
      return false;
    }
  };

  // Check if node type requires integration
  const getNodeIntegrationRequirement = (nodeType: string) => {
    if (!integrationStatus) return null;

    const integrations = integrationStatus.integrations;
    
    if (nodeType === 'schedule_meeting') {
      return {
        required: true,
        type: 'calendar',
        configured: integrations.calendar?.configured,
        message: integrations.calendar?.configured 
          ? `Calendar: ${integrations.calendar.provider}` 
          : 'Calendar integration required'
      };
    } else if (nodeType === 'crm_update') {
      return {
        required: true,
        type: 'crm',
        configured: integrations.crm?.configured,
        message: integrations.crm?.configured 
          ? `CRM: ${integrations.crm.provider}` 
          : 'CRM integration required'
      };
    } else if (nodeType === 'email') {
      return {
        required: false,
        type: 'email',
        configured: integrations.email?.configured,
        message: integrations.email?.configured 
          ? `Email: ${integrations.email.provider}` 
          : 'Email integration recommended'
      };
    }
    
    return null;
  };

  // Check if node can be added (integration available)
  const canAddNode = (nodeType: string) => {
    const requirement = getNodeIntegrationRequirement(nodeType);
    if (!requirement) return true; // No integration required
    if (!requirement.required) return true; // Optional integration
    return requirement.configured; // Required integration must be configured
  };

  // Save workflow
  const handleSave = async () => {
    if (!workflowName) {
      alert('Please enter a workflow name');
      return;
    }

    // Validate before saving
    const isValid = await handleValidate();
    if (!isValid) {
      const proceed = window.confirm(
        `Workflow has ${validationErrors.length} error(s). Cannot save until errors are fixed.\n\n` +
        validationErrors.map(e => `• ${e.message}`).join('\n')
      );
      return;
    }

    // Show warnings but allow saving
    if (validationWarnings.length > 0) {
      const proceed = window.confirm(
        `Workflow has ${validationWarnings.length} warning(s). Save anyway?\n\n` +
        validationWarnings.map(w => `• ${w.message}`).join('\n')
      );
      if (!proceed) return;
    }

    setIsSaving(true);
    try {
      const workflowNodes = nodes.map((node) => ({
        id: node.id,
        type: node.data.type || node.data.label,
        config: node.data.config || {},
        position: node.position,
        next: edges.find((e) => e.source === node.id)?.target || null,
      }));

      const workflowData = {
        agent_id: agentId,
        name: workflowName,
        description: workflowDescription,
        trigger: 'conversation_start',
        nodes: workflowNodes,
      };

      if (workflowId) {
        await apiClient.updateWorkflow(workflowId, workflowData);
        alert('Workflow updated!');
      } else {
        const response = await apiClient.createWorkflow(workflowData);
        alert('Workflow created!');
        navigate(`/workflows/${agentId}/${response.id}`);
      }
    } catch (error) {
      console.error('Failed to save workflow:', error);
      alert('Failed to save workflow');
    } finally {
      setIsSaving(false);
    }
  };

  // Load template
  const loadTemplate = async (templateId: string) => {
    try {
      const templates = await apiClient.getWorkflowTemplates();
      const template = templates.templates.find((t: any) => t.id === templateId);
      
      if (template) {
        setWorkflowName(template.name);
        setWorkflowDescription(template.description);
        
        const flowNodes = template.nodes.map((node: any) => ({
          id: node.id,
          type: 'default',
          position: node.position || { x: 0, y: 0 },
          data: {
            label: node.type,
            type: node.type,
            config: node.config,
          },
        }));
        
        const flowEdges = template.nodes
          .filter((node: any) => node.next)
          .map((node: any) => ({
            id: `${node.id}-${node.next}`,
            source: node.id,
            target: node.next,
            markerEnd: { type: MarkerType.ArrowClosed },
          }));
        
        setNodes(flowNodes);
        setEdges(flowEdges);
      }
    } catch (error) {
      console.error('Failed to load template:', error);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex-1 max-w-2xl">
            <input
              type="text"
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
              className="text-2xl font-bold w-full border-none focus:outline-none focus:ring-2 focus:ring-blue-500 px-2 py-1 rounded"
            />
            <input
              type="text"
              value={workflowDescription}
              onChange={(e) => setWorkflowDescription(e.target.value)}
              placeholder="Add description..."
              className="text-sm text-gray-600 w-full mt-1 border-none focus:outline-none focus:ring-2 focus:ring-blue-500 px-2 py-1 rounded"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => navigate(`/agents/${agentId}`)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Node Palette */}
        <div className="w-64 bg-white border-r overflow-y-auto">
          <div className="p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Node Types</h3>
            <div className="space-y-2">
              {nodeTypes.map((type) => (
                <button
                  key={type.type}
                  onClick={() => handleAddNode(type.type)}
                  className="w-full text-left px-3 py-2 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition"
                >
                  <div className="font-medium text-sm">{type.label}</div>
                  <div className="text-xs text-gray-500 mt-1">{type.description}</div>
                </button>
              ))}
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Templates</h3>
              <button
                onClick={() => loadTemplate('lead_qualification')}
                className="w-full text-left px-3 py-2 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition mb-2"
              >
                <div className="font-medium text-sm">Lead Qualification</div>
                <div className="text-xs text-gray-500 mt-1">Qualify & schedule</div>
              </button>
              <button
                onClick={() => loadTemplate('support_ticket')}
                className="w-full text-left px-3 py-2 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition"
              >
                <div className="font-medium text-sm">Support Ticket</div>
                <div className="text-xs text-gray-500 mt-1">Create tickets</div>
              </button>
            </div>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            fitView
          >
            <Background color="#ddd" gap={16} />
            <Controls />
            <MiniMap />
          </ReactFlow>
        </div>

        {/* Right Sidebar - Node Config */}
        {selectedNode && (
          <div className="w-80 bg-white border-l overflow-y-auto">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Node Configuration</h3>
                <button
                  onClick={() => setSelectedNode(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Node ID
                  </label>
                  <input
                    type="text"
                    value={selectedNode.id}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <input
                    type="text"
                    value={selectedNode.data.type || selectedNode.data.label}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Configuration (JSON)
                  </label>
                  <textarea
                    value={JSON.stringify(selectedNode.data.config, null, 2)}
                    onChange={(e) => {
                      try {
                        const config = JSON.parse(e.target.value);
                        setNodes((nds) =>
                          nds.map((node) =>
                            node.id === selectedNode.id
                              ? { ...node, data: { ...node.data, config } }
                              : node
                          )
                        );
                      } catch (err) {
                        // Invalid JSON, ignore
                      }
                    }}
                    rows={10}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-xs"
                  />
                </div>

                <button
                  onClick={handleDeleteNode}
                  className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  Delete Node
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
