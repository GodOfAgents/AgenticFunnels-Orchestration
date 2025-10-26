/**
 * AFO Platform API Client
 * Connects React frontend to Python FastAPI backend
 */

// Use environment variable for backend URL, fallback to localhost for development
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

class APIClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Request failed' }));
        throw new Error(error.detail || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Agent APIs
  async createAgent(data: any) {
    return this.request('/api/agents/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async listAgents(userId: string, skip = 0, limit = 100) {
    return this.request(`/api/agents/?user_id=${userId}&skip=${skip}&limit=${limit}`);
  }

  async getAgent(agentId: string) {
    return this.request(`/api/agents/${agentId}`);
  }

  async updateAgent(agentId: string, data: any) {
    return this.request(`/api/agents/${agentId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteAgent(agentId: string) {
    return this.request(`/api/agents/${agentId}`, {
      method: 'DELETE',
    });
  }

  async activateAgent(agentId: string) {
    return this.request(`/api/agents/${agentId}/activate`, {
      method: 'POST',
    });
  }

  async deactivateAgent(agentId: string) {
    return this.request(`/api/agents/${agentId}/deactivate`, {
      method: 'POST',
    });
  }

  // Conversation APIs
  async createConversation(data: any) {
    return this.request('/api/conversations/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async listConversations(agentId?: string, status?: string, skip = 0, limit = 100) {
    let url = `/api/conversations/?skip=${skip}&limit=${limit}`;
    if (agentId) url += `&agent_id=${agentId}`;
    if (status) url += `&status=${status}`;
    return this.request(url);
  }

  async getConversation(conversationId: string) {
    return this.request(`/api/conversations/${conversationId}`);
  }

  // Knowledge Base APIs
  async uploadDocument(agentId: string, file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(
      `${this.baseURL}/api/knowledge/upload?agent_id=${agentId}`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    return response.json();
  }

  async getKnowledgeBase(agentId: string) {
    return this.request(`/api/knowledge/agent/${agentId}`);
  }

  async deleteKnowledge(kbId: string) {
    return this.request(`/api/knowledge/${kbId}`, {
      method: 'DELETE',
    });
  }

  // Integration APIs
  async createIntegration(data: any) {
    return this.request('/api/integrations/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async listIntegrations(userId: string) {
    return this.request(`/api/integrations/user/${userId}`);
  }

  async deleteIntegration(integrationId: string) {
    return this.request(`/api/integrations/${integrationId}`, {
      method: 'DELETE',
    });
  }

  async testIntegration(integrationId: string) {
    return this.request(`/api/integrations/${integrationId}/test`, {
      method: 'POST',
    });
  }

  // Voice APIs
  async getVoices(userId: string) {
    return this.request(`/api/voice/voices?user_id=${userId}`);
  }

  async testElevenLabsKey(userId: string, apiKey: string) {
    return this.request(`/api/voice/test-integration?user_id=${userId}&api_key=${apiKey}`, {
      method: 'POST',
    });
  }

  // Admin APIs
  async getAdminDashboard() {
    return this.request('/api/admin/dashboard');
  }

  async getSystemMetrics() {
    return this.request('/api/admin/system-metrics');
  }

  async getAllAgents(status?: string, flagged?: boolean, skip = 0, limit = 100) {
    let url = `/api/admin/agents?skip=${skip}&limit=${limit}`;
    if (status) url += `&status=${status}`;
    if (flagged !== undefined) url += `&flagged=${flagged}`;
    return this.request(url);
  }

  async getAllConversations(status?: string, flagged?: boolean, search?: string, skip = 0, limit = 100) {
    let url = `/api/admin/conversations?skip=${skip}&limit=${limit}`;
    if (status) url += `&status=${status}`;
    if (flagged !== undefined) url += `&flagged=${flagged}`;
    if (search) url += `&search=${search}`;
    return this.request(url);
  }

  async getAnomalies(severity?: string, resolved?: boolean, skip = 0, limit = 50) {
    let url = `/api/admin/anomalies?skip=${skip}&limit=${limit}`;
    if (severity) url += `&severity=${severity}`;
    if (resolved !== undefined) url += `&resolved=${resolved}`;
    return this.request(url);
  }

  async resolveAnomaly(anomalyId: string, resolvedBy: string) {
    return this.request(`/api/admin/anomalies/${anomalyId}/resolve?resolved_by=${resolvedBy}`, {
      method: 'POST',
    });
  }

  async getPlatformAnalytics(days = 30) {
    return this.request(`/api/admin/analytics?days=${days}`);
  }
}

export const apiClient = new APIClient(BACKEND_URL);
export default apiClient;