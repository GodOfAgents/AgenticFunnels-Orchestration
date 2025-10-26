import { useState, useEffect } from 'react';
import apiClient from '../lib/api-client';
import WebSocketClient from '../lib/websocket-client';

export default function AdminSystemPage() {
  const [metrics, setMetrics] = useState<any>(null);
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [wsClient] = useState(new WebSocketClient());

  useEffect(() => {
    loadData();
    setupWebSocket();

    return () => {
      wsClient.disconnect();
    };
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [metricsData, dashboardData] = await Promise.all([
        apiClient.getSystemMetrics(),
        apiClient.getAdminDashboard(),
      ]);
      setMetrics(metricsData);
      setDashboard(dashboardData);
    } catch (error) {
      console.error('Failed to load system data:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupWebSocket = () => {
    wsClient.connect('/ws/admin');
    wsClient.on('system.metrics', (data) => {
      setMetrics(data);
    });
    wsClient.on('anomaly.detected', (data) => {
      // Show notification
      console.log('Anomaly detected:', data);
    });
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  const getStatusColor = (status: string) => {
    return status === 'healthy' ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">System Monitoring</h1>
        <button
          onClick={loadData}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Refresh
        </button>
      </div>

      {/* System Health */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-2">Backend</div>
          <div className={`text-2xl font-bold ${getStatusColor(metrics.backendStatus)}`}>
            {metrics.backendStatus}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-2">Milvus</div>
          <div className={`text-2xl font-bold ${getStatusColor(metrics.milvusStatus)}`}>
            {metrics.milvusStatus}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-2">Redis</div>
          <div className={`text-2xl font-bold ${getStatusColor(metrics.redisStatus)}`}>
            {metrics.redisStatus}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-2">Database</div>
          <div className={`text-2xl font-bold ${getStatusColor(metrics.dbStatus)}`}>
            {metrics.dbStatus}
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-2">Avg Response Time</div>
          <div className="text-3xl font-bold text-gray-900">{metrics.avgResponseTime}s</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-2">Active Connections</div>
          <div className="text-3xl font-bold text-gray-900">{metrics.activeConnections}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-2">Queued Jobs</div>
          <div className="text-3xl font-bold text-gray-900">{metrics.queuedJobs}</div>
        </div>
      </div>

      {/* Resource Usage */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Resource Usage</h2>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">CPU Usage</span>
              <span className="font-medium">{metrics.cpuUsage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${metrics.cpuUsage}%` }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Memory Usage</span>
              <span className="font-medium">{metrics.memoryUsage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-600 h-2 rounded-full" style={{ width: `${metrics.memoryUsage}%` }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Disk Usage</span>
              <span className="font-medium">{metrics.diskUsage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${metrics.diskUsage}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Platform Overview */}
      {dashboard && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-2">Total Agents</div>
            <div className="text-3xl font-bold text-gray-900">{dashboard.agents.total}</div>
            <div className="text-sm text-green-600 mt-2">+{dashboard.agents.active} active</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-2">Conversations</div>
            <div className="text-3xl font-bold text-gray-900">{dashboard.conversations.total}</div>
            <div className="text-sm text-blue-600 mt-2">{dashboard.conversations.active} active</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-2">Total Users</div>
            <div className="text-3xl font-bold text-gray-900">{dashboard.users.total}</div>
            <div className="text-sm text-purple-600 mt-2">{dashboard.users.paid} paid</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-2">System Status</div>
            <div className={`text-3xl font-bold ${getStatusColor(dashboard.system.status)}`}>
              {dashboard.system.status}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}