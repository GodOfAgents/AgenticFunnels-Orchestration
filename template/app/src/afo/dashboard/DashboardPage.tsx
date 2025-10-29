import { useState, useEffect } from 'react';
import { useAuth } from '@src/lib/auth';
import { Link as WaspRouterLink, routes } from '@src/lib/router';
import apiClient from '../lib/api-client';

export default function DashboardPage() {
  const { data: user } = useAuth();
  const [stats, setStats] = useState({
    activeAgents: 0,
    totalCalls: 0,
    avgLatency: 211,
    costSavings: 85
  });
  const [liveSessions, setLiveSessions] = useState([]);
  const [recentConversations, setRecentConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load agents
      const agents = await apiClient.listAgents(user.id);
      const activeAgents = agents.filter(a => a.isActive);
      
      // Load Qwen sessions
      const qwenSessions = await apiClient.listQwenSessions();
      
      // Load conversations
      const conversations = await apiClient.listConversations(user.id);
      
      setStats({
        activeAgents: activeAgents.length,
        totalCalls: conversations.length,
        avgLatency: 211,
        costSavings: 85
      });
      
      setLiveSessions(qwenSessions.sessions || []);
      setRecentConversations(conversations.slice(0, 5) || []);
      
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Dashboard
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Welcome back, {user?.email}
              </p>
            </div>
            <div className="flex space-x-3">
              <WaspRouterLink
                to={routes.AgentCreateRoute.to}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Agent
              </WaspRouterLink>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <StatCard
            title="Active Agents"
            value={stats.activeAgents}
            change="+1 today"
            icon="🤖"
            color="blue"
          />
          <StatCard
            title="Total Calls"
            value={stats.totalCalls}
            change={`+${Math.floor(stats.totalCalls * 0.2)} today`}
            icon="📞"
            color="green"
          />
          <StatCard
            title="Avg Response"
            value={`${stats.avgLatency}ms`}
            change="⚡ Excellent"
            icon="⚡"
            color="purple"
          />
          <StatCard
            title="Cost Savings"
            value={`${stats.costSavings}%`}
            change="vs traditional"
            icon="💰"
            color="yellow"
          />
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Live Sessions */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  🟢 Live Sessions ({liveSessions.length})
                </h2>
                <WaspRouterLink
                  to={routes.ConversationsRoute.to}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  View All
                </WaspRouterLink>
              </div>
            </div>
            <div className="p-6">
              {liveSessions.length > 0 ? (
                <div className="space-y-4">
                  {liveSessions.map((session) => (
                    <LiveSessionCard key={session.session_id} session={session} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No active sessions</p>
                  <p className="text-sm mt-2">Your agents will appear here when calls start</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Quick Actions
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <QuickActionButton
                  to={routes.AgentCreateRoute.to}
                  icon="🤖"
                  title="Create Agent"
                  description="New AI agent"
                />
                <QuickActionButton
                  to={routes.WorkflowsRoute.to}
                  icon="🔧"
                  title="New Workflow"
                  description="Build automation"
                />
                <QuickActionButton
                  to={routes.KnowledgeRoute.to}
                  icon="📚"
                  title="Upload Knowledge"
                  description="Train your agent"
                />
                <QuickActionButton
                  to={routes.IntegrationsRoute.to}
                  icon="🔌"
                  title="Integrations"
                  description="Connect services"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Conversations */}
        <div className="mt-8 bg-white dark:bg-gray-800 shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Recent Conversations
              </h2>
              <WaspRouterLink
                to={routes.ConversationsRoute.to}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                View All
              </WaspRouterLink>
            </div>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {recentConversations.length > 0 ? (
              recentConversations.map((conv) => (
                <ConversationRow key={conv.id} conversation={conv} />
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No conversations yet</p>
                <p className="text-sm mt-2">Deploy your first agent to see conversations here</p>
              </div>
            )}
          </div>
        </div>

        {/* Qwen 3 Omni Banner */}
        <div className="mt-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-8 sm:px-10 sm:py-12">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  🚀 Powered by Qwen 3 Omni
                </h3>
                <p className="text-blue-100 mb-4">
                  End-to-end voice AI • 211ms latency • 17 voice personas • 19 languages
                </p>
                <div className="flex space-x-4 text-sm text-white">
                  <span>⚡ 85% cheaper</span>
                  <span>🌍 Global ready</span>
                  <span>🎭 17 voices</span>
                  <span>😊 Emotion aware</span>
                </div>
              </div>
              <div className="hidden sm:block">
                <div className="text-white text-6xl">🎙️</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({ title, value, change, icon, color }) {
  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
    yellow: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400',
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <span className={`text-3xl ${colorClasses[color]}`}>{icon}</span>
      </div>
      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
      <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{change}</p>
    </div>
  );
}

// Live Session Card
function LiveSessionCard({ session }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="flex-1">
        <div className="flex items-center">
          <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
          <span className="font-medium text-gray-900 dark:text-white">
            Session {session.session_id.substring(0, 8)}
          </span>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Agent: {session.agent_id} • Active
        </p>
      </div>
      <button className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700">
        View
      </button>
    </div>
  );
}

// Quick Action Button
function QuickActionButton({ to, icon, title, description }) {
  return (
    <WaspRouterLink
      to={to}
      className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 hover:shadow-md transition-all"
    >
      <div className="text-3xl mb-2">{icon}</div>
      <h3 className="font-medium text-gray-900 dark:text-white">{title}</h3>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{description}</p>
    </WaspRouterLink>
  );
}

// Conversation Row
function ConversationRow({ conversation }) {
  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
  };

  return (
    <div className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center">
            <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
            <span className="font-medium text-gray-900 dark:text-white">
              {conversation.agentName || 'Agent'}
            </span>
            <span className="mx-2 text-gray-400">•</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {timeAgo(conversation.createdAt)}
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {conversation.summary || 'Conversation in progress...'}
          </p>
        </div>
        <WaspRouterLink
          to={`${routes.ConversationDetailRoute.to}?id=${conversation.id}`}
          className="text-blue-600 hover:text-blue-700 text-sm"
        >
          View →
        </WaspRouterLink>
      </div>
    </div>
  );
}
