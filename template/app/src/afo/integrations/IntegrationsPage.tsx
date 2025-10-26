import { useState, useEffect } from 'react';
import apiClient from '../lib/api-client';

const INTEGRATION_TYPES = [
  { type: 'elevenlabs', name: 'ElevenLabs', description: 'Voice & Text-to-Speech' },
  { type: 'twilio', name: 'Twilio', description: 'Voice, SMS & WhatsApp' },
  { type: 'google_calendar', name: 'Google Calendar', description: 'Meeting scheduling' },
  { type: 'salesforce', name: 'Salesforce', description: 'CRM Integration' },
  { type: 'hubspot', name: 'HubSpot', description: 'CRM Integration' },
];

export default function IntegrationsPage({ user }: any) {
  const [integrations, setIntegrations] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedType, setSelectedType] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadIntegrations();
  }, []);

  const loadIntegrations = async () => {
    try {
      const response = await apiClient.listIntegrations(user.id);
      setIntegrations(response || []);
    } catch (error) {
      console.error('Failed to load integrations:', error);
    }
  };

  const handleAddIntegration = async () => {
    try {
      setLoading(true);
      await apiClient.createIntegration({
        userId: user.id,
        type: selectedType,
        provider: selectedType,
        credentials: { api_key: apiKey },
      });
      alert('Integration added successfully!');
      setShowAddModal(false);
      setApiKey('');
      setSelectedType('');
      loadIntegrations();
    } catch (error: any) {
      alert(`Failed to add integration: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Integrations</h1>
          <p className="text-gray-600 mt-2">Connect your tools and services</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          + Add Integration
        </button>
      </div>

      {/* Integration Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {INTEGRATION_TYPES.map((int) => {
          const userIntegration = integrations.find((i) => i.type === int.type);
          const isConnected = !!userIntegration;

          return (
            <div key={int.type} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{int.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{int.description}</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    isConnected ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {isConnected ? 'Connected' : 'Not Connected'}
                </span>
              </div>

              {isConnected ? (
                <div className="flex gap-2">
                  <button className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                    Configure
                  </button>
                  <button
                    onClick={async () => {
                      if (confirm('Remove this integration?')) {
                        await apiClient.deleteIntegration(userIntegration.id);
                        loadIntegrations();
                      }
                    }}
                    className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setSelectedType(int.type);
                    setShowAddModal(true);
                  }}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Connect
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Integration Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Add Integration</h2>
            
            {!selectedType ? (
              <div className="space-y-2">
                {INTEGRATION_TYPES.map((int) => (
                  <button
                    key={int.type}
                    onClick={() => setSelectedType(int.type)}
                    className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg"
                  >
                    <div className="font-medium text-gray-900">{int.name}</div>
                    <div className="text-sm text-gray-600">{int.description}</div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    API Key
                  </label>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Enter your API key"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowAddModal(false);
                      setSelectedType('');
                      setApiKey('');
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddIntegration}
                    disabled={!apiKey || loading}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300"
                  >
                    {loading ? 'Connecting...' : 'Connect'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}