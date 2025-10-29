/**
 * Enhanced Agent Creation Page
 * 4-step wizard with integrations configuration
 */

import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import apiClient from '../lib/api-client';

// Integration types
interface Integration {
  type: 'calendar' | 'crm' | 'email' | 'twilio';
  provider: string;
  enabled: boolean;
  credentials: any;
}

export default function AgentCreatePageEnhanced({ user }: any) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const history = useHistory();

  const [formData, setFormData] = useState({
    name: '',
    role: '',
    persona: 'professional',
    systemPrompt: '',
    voiceEnabled: false,
    // Qwen 3 Omni settings (no API keys needed if using self-hosted)
    liveKitEnabled: false,
  });

  const [integrations, setIntegrations] = useState<Integration[]>([
    { type: 'calendar', provider: '', enabled: false, credentials: {} },
    { type: 'crm', provider: '', enabled: false, credentials: {} },
    { type: 'email', provider: '', enabled: false, credentials: {} },
    { type: 'twilio', provider: 'twilio', enabled: false, credentials: {} },
  ]);

  const handleChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
    // Clear error for this field
    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }
  };

  const handleIntegrationChange = (index: number, field: string, value: any) => {
    const updated = [...integrations];
    updated[index] = { ...updated[index], [field]: value };
    setIntegrations(updated);
  };

  const validateStep1 = () => {
    const newErrors: any = {};
    if (!formData.name.trim()) newErrors.name = 'Agent name is required';
    if (!formData.role.trim()) newErrors.role = 'Role is required';
    if (formData.name.length > 100) newErrors.name = 'Name must be under 100 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    // No validation needed for Qwen 3 Omni + LiveKit (self-hosted)
    return true;
  };

  const handleNext = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 3 && !validateStep3()) return;
    setStep(step + 1);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      // Create agent
      const agentData = {
        userId: user.id,
        ...formData,
        systemPrompt: formData.systemPrompt || generateDefaultPrompt(),
      };

      const agentResponse = await apiClient.createAgent(agentData);
      const agentId = agentResponse.id;

      // Create integrations
      for (const integration of integrations) {
        if (integration.enabled && integration.provider) {
          try {
            await apiClient.createIntegration({
              userId: user.id,
              type: integration.type,
              provider: integration.provider,
              credentials: integration.credentials,
            });
          } catch (err) {
            console.error(`Failed to create ${integration.type} integration:`, err);
          }
        }
      }

      alert('Agent created successfully!');
      history.push(`/agent/${agentId}`);
    } catch (error: any) {
      alert(`Failed to create agent: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const generateDefaultPrompt = () => {
    return `You are ${formData.name}, a ${formData.role}. Your persona is ${formData.persona}. 

Your role is to:
- Engage with customers professionally
- Qualify leads by asking relevant questions
- Schedule meetings when appropriate
- Provide helpful information about our products/services

Always be helpful, courteous, and focused on the customer's needs.`;
  };

  // Step 1: Basic Information
  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>
        <p className="text-sm text-gray-600 mt-1">Define your agent's identity and purpose</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Agent Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="e.g., Sales Assistant, Support Bot"
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.name ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Role <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.role}
          onChange={(e) => handleChange('role', e.target.value)}
          placeholder="e.g., Lead Qualification Specialist"
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.role ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.role && <p className="text-sm text-red-600 mt-1">{errors.role}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Persona <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { value: 'professional', label: 'Professional', icon: '💼' },
            { value: 'friendly', label: 'Friendly', icon: '😊' },
            { value: 'casual', label: 'Casual', icon: '👋' },
            { value: 'formal', label: 'Formal', icon: '🎩' },
            { value: 'expert', label: 'Expert', icon: '🎓' },
            { value: 'helpful', label: 'Helpful', icon: '🤝' },
          ].map((persona) => (
            <button
              key={persona.value}
              type="button"
              onClick={() => handleChange('persona', persona.value)}
              className={`p-3 border-2 rounded-lg text-center transition ${
                formData.persona === persona.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-2xl mb-1">{persona.icon}</div>
              <div className="text-sm font-medium">{persona.label}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">💡 Quick Tip</h4>
        <p className="text-sm text-blue-800">
          The persona defines how your agent communicates. Choose one that matches your brand and audience.
        </p>
      </div>
    </div>
  );

  // Step 2: System Prompt
  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
          <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900">System Instructions</h2>
        <p className="text-sm text-gray-600 mt-1">Define how your agent should behave</p>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">
            System Prompt (Optional)
          </label>
          <button
            type="button"
            onClick={() => handleChange('systemPrompt', generateDefaultPrompt())}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            Use Default
          </button>
        </div>
        <p className="text-sm text-gray-600 mb-2">
          Customize your agent's behavior or use the auto-generated prompt
        </p>
        <textarea
          value={formData.systemPrompt}
          onChange={(e) => handleChange('systemPrompt', e.target.value)}
          rows={12}
          placeholder={generateDefaultPrompt()}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
        />
      </div>

      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <h4 className="font-medium text-purple-900 mb-3">✨ Prompt Best Practices:</h4>
        <ul className="text-sm text-purple-800 space-y-2">
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Define the agent's role and responsibilities clearly</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Specify tone, style, and personality traits</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Include guidelines for lead qualification and next steps</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Add constraints (e.g., "Always ask for email before scheduling")</span>
          </li>
        </ul>
      </div>
    </div>
  );

  // Step 3: Voice Configuration (Qwen 3 Omni + LiveKit)
  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900">Voice & Multimodal AI</h2>
        <p className="text-sm text-gray-600 mt-1">Powered by Qwen 3 Omni + LiveKit</p>
      </div>

      <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
        <div className="flex items-start">
          <input
            type="checkbox"
            checked={formData.voiceEnabled}
            onChange={(e) => handleChange('voiceEnabled', e.target.checked)}
            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
          />
          <div className="ml-3 flex-1">
            <label className="text-base font-medium text-gray-900">
              Enable Voice Conversations
            </label>
            <p className="text-sm text-gray-600 mt-1">
              Allow users to interact with your agent via voice using our self-hosted multimodal AI
            </p>
          </div>
        </div>
      </div>

      {formData.voiceEnabled && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="ml-4">
                <h4 className="font-semibold text-gray-900 mb-2">🚀 Qwen 3 Omni Multimodal AI</h4>
                <p className="text-sm text-gray-700 mb-3">
                  Your agent will use <strong>Qwen 3 Omni</strong> - a state-of-the-art multimodal model that handles:
                </p>
                <ul className="text-sm text-gray-700 space-y-1 ml-4">
                  <li>• <strong>Speech-to-Text</strong> - Understands spoken input</li>
                  <li>• <strong>Text-to-Speech</strong> - Responds with natural voice</li>
                  <li>• <strong>Text Understanding</strong> - Processes complex queries</li>
                  <li>• <strong>Multimodal Reasoning</strong> - All in one model</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-5">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="ml-4">
                <h4 className="font-semibold text-green-900 mb-2">📡 LiveKit WebRTC</h4>
                <p className="text-sm text-green-800">
                  Real-time communication powered by <strong>LiveKit</strong> - self-hosted, secure, and scalable WebRTC infrastructure.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-5">
            <h4 className="font-medium text-yellow-900 mb-2">🎉 No API Keys Required!</h4>
            <p className="text-sm text-yellow-800 mb-2">
              Unlike traditional voice services (Deepgram, ElevenLabs), our self-hosted solution means:
            </p>
            <ul className="text-sm text-yellow-800 space-y-1 ml-4">
              <li>• No external API keys needed</li>
              <li>• No per-minute charges</li>
              <li>• Complete data privacy</li>
              <li>• Unlimited usage</li>
            </ul>
          </div>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mb-3">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h4 className="font-medium text-gray-900 mb-2">Advanced Configuration</h4>
              <p className="text-sm text-gray-600 mb-3">
                Voice settings are automatically configured for optimal performance.
              </p>
              <p className="text-xs text-gray-500">
                Need custom voice models or languages? Contact support after agent creation.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Step 4: Integrations
  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
          <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900">Integrations</h2>
        <p className="text-sm text-gray-600 mt-1">Connect external services (optional)</p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <h4 className="font-medium text-blue-900 mb-2">ℹ️ Setup Later</h4>
        <p className="text-sm text-blue-800">
          You can skip this step and configure integrations later from the agent settings page.
        </p>
      </div>

      {/* Calendar Integration */}
      <div className="border border-gray-200 rounded-lg p-5">
        <div className="flex items-start mb-4">
          <input
            type="checkbox"
            checked={integrations[0].enabled}
            onChange={(e) => handleIntegrationChange(0, 'enabled', e.target.checked)}
            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
          />
          <div className="ml-3 flex-1">
            <label className="text-base font-medium text-gray-900">📅 Calendar Integration</label>
            <p className="text-sm text-gray-600 mt-1">Schedule meetings automatically</p>
          </div>
        </div>

        {integrations[0].enabled && (
          <div className="pl-8 space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Provider</label>
              <select
                value={integrations[0].provider}
                onChange={(e) => handleIntegrationChange(0, 'provider', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select provider...</option>
                <option value="google">Google Calendar</option>
                <option value="calendly">Calendly</option>
                <option value="outlook">Microsoft Outlook</option>
              </select>
            </div>

            {integrations[0].provider === 'google' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Google Calendar API Key</label>
                <input
                  type="password"
                  placeholder="Enter API key..."
                  onChange={(e) => handleIntegrationChange(0, 'credentials', { apiKey: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Get from <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google Cloud Console</a>
                </p>
              </div>
            )}

            {integrations[0].provider === 'calendly' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Calendly API Key</label>
                <input
                  type="password"
                  placeholder="Enter API key..."
                  onChange={(e) => handleIntegrationChange(0, 'credentials', { apiKey: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Get from <a href="https://calendly.com/integrations/api_webhooks" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Calendly Settings</a>
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Video Meeting Integration */}
      <div className="border border-gray-200 rounded-lg p-5 bg-gradient-to-r from-purple-50 to-blue-50">
        <div className="flex items-start mb-4">
          <input
            type="checkbox"
            checked={integrations[0].enabled && ['google_meet', 'zoom', 'teams'].includes(integrations[0].provider)}
            onChange={(e) => {
              if (e.target.checked) {
                handleIntegrationChange(0, 'enabled', true);
              }
            }}
            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
          />
          <div className="ml-3 flex-1">
            <label className="text-base font-medium text-gray-900">🎥 Video Meeting Integration</label>
            <p className="text-sm text-gray-600 mt-1">Create and schedule video meetings</p>
          </div>
        </div>

        {integrations[0].enabled && (
          <div className="pl-8 space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Platform</label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => handleIntegrationChange(0, 'provider', 'google_meet')}
                  className={`p-3 border-2 rounded-lg text-center transition ${
                    integrations[0].provider === 'google_meet'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-1">🔵</div>
                  <div className="text-xs font-medium">Google Meet</div>
                </button>
                <button
                  type="button"
                  onClick={() => handleIntegrationChange(0, 'provider', 'zoom')}
                  className={`p-3 border-2 rounded-lg text-center transition ${
                    integrations[0].provider === 'zoom'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-1">📹</div>
                  <div className="text-xs font-medium">Zoom</div>
                </button>
                <button
                  type="button"
                  onClick={() => handleIntegrationChange(0, 'provider', 'teams')}
                  className={`p-3 border-2 rounded-lg text-center transition ${
                    integrations[0].provider === 'teams'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-1">💼</div>
                  <div className="text-xs font-medium">MS Teams</div>
                </button>
              </div>
            </div>

            {integrations[0].provider === 'google_meet' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Google Meet API Credentials</label>
                <input
                  type="password"
                  placeholder="OAuth 2.0 Client ID..."
                  onChange={(e) => handleIntegrationChange(0, 'credentials', { clientId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            {integrations[0].provider === 'zoom' && (
              <div className="space-y-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Zoom API Key</label>
                  <input
                    type="password"
                    placeholder="Enter API key..."
                    onChange={(e) => handleIntegrationChange(0, 'credentials', { apiKey: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Zoom API Secret</label>
                  <input
                    type="password"
                    placeholder="Enter API secret..."
                    onChange={(e) => handleIntegrationChange(0, 'credentials', { ...integrations[0].credentials, apiSecret: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Get from <a href="https://marketplace.zoom.us/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Zoom App Marketplace</a>
                </p>
              </div>
            )}

            {integrations[0].provider === 'teams' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Microsoft Teams Webhook URL</label>
                <input
                  type="url"
                  placeholder="https://outlook.office.com/webhook/..."
                  onChange={(e) => handleIntegrationChange(0, 'credentials', { webhookUrl: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* CRM Integration */}
      <div className="border border-gray-200 rounded-lg p-5">
        <div className="flex items-start mb-4">
          <input
            type="checkbox"
            checked={integrations[1].enabled}
            onChange={(e) => handleIntegrationChange(1, 'enabled', e.target.checked)}
            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
          />
          <div className="ml-3 flex-1">
            <label className="text-base font-medium text-gray-900">🤝 CRM Integration</label>
            <p className="text-sm text-gray-600 mt-1">Sync leads to your CRM automatically</p>
          </div>
        </div>

        {integrations[1].enabled && (
          <div className="pl-8 space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Provider</label>
              <select
                value={integrations[1].provider}
                onChange={(e) => handleIntegrationChange(1, 'provider', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select provider...</option>
                <option value="salesforce">Salesforce</option>
                <option value="hubspot">HubSpot</option>
                <option value="pipedrive">Pipedrive</option>
                <option value="zoho">Zoho CRM</option>
                <option value="webhook">Custom Webhook</option>
              </select>
            </div>

            {integrations[1].provider === 'webhook' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Webhook URL</label>
                <input
                  type="url"
                  placeholder="https://your-crm.com/webhook"
                  onChange={(e) => handleIntegrationChange(1, 'credentials', { webhookUrl: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            {integrations[1].provider && integrations[1].provider !== 'webhook' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">API Key</label>
                <input
                  type="password"
                  placeholder="Enter API key..."
                  onChange={(e) => handleIntegrationChange(1, 'credentials', { apiKey: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Email Integration */}
      <div className="border border-gray-200 rounded-lg p-5">
        <div className="flex items-start mb-4">
          <input
            type="checkbox"
            checked={integrations[2].enabled}
            onChange={(e) => handleIntegrationChange(2, 'enabled', e.target.checked)}
            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
          />
          <div className="ml-3 flex-1">
            <label className="text-base font-medium text-gray-900">📧 Email Integration</label>
            <p className="text-sm text-gray-600 mt-1">Send automated email notifications</p>
          </div>
        </div>

        {integrations[2].enabled && (
          <div className="pl-8 space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Provider</label>
              <select
                value={integrations[2].provider}
                onChange={(e) => handleIntegrationChange(2, 'provider', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select provider...</option>
                <option value="sendgrid">SendGrid</option>
                <option value="ses">AWS SES</option>
                <option value="mailgun">Mailgun</option>
                <option value="smtp">Custom SMTP</option>
              </select>
            </div>

            {integrations[2].provider === 'sendgrid' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">SendGrid API Key</label>
                <input
                  type="password"
                  placeholder="Enter API key..."
                  onChange={(e) => handleIntegrationChange(2, 'credentials', { apiKey: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            {integrations[2].provider === 'smtp' && (
              <div className="space-y-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Host</label>
                  <input
                    type="text"
                    placeholder="smtp.example.com"
                    onChange={(e) => handleIntegrationChange(2, 'credentials', { host: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Port</label>
                    <input
                      type="number"
                      placeholder="587"
                      onChange={(e) => handleIntegrationChange(2, 'credentials', { ...integrations[2].credentials, port: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                    <input
                      type="text"
                      placeholder="user@example.com"
                      onChange={(e) => handleIntegrationChange(2, 'credentials', { ...integrations[2].credentials, username: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                  <input
                    type="password"
                    placeholder="Enter password..."
                    onChange={(e) => handleIntegrationChange(2, 'credentials', { ...integrations[2].credentials, password: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Twilio / SMS Integration */}
      <div className="border border-gray-200 rounded-lg p-5 bg-gradient-to-r from-green-50 to-teal-50">
        <div className="flex items-start mb-4">
          <input
            type="checkbox"
            checked={integrations[3].enabled}
            onChange={(e) => handleIntegrationChange(3, 'enabled', e.target.checked)}
            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
          />
          <div className="ml-3 flex-1">
            <label className="text-base font-medium text-gray-900">📱 Twilio / SMS / VoIP Integration</label>
            <p className="text-sm text-gray-600 mt-1">Enable SMS messaging and phone calls via Twilio</p>
          </div>
        </div>

        {integrations[3].enabled && (
          <div className="pl-8 space-y-3">
            <div className="bg-green-100 border border-green-300 rounded-lg p-3 mb-3">
              <p className="text-sm text-green-800">
                <strong>Twilio</strong> provides SMS, voice calls, and VoIP bridging for your agent
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Twilio Account SID</label>
              <input
                type="text"
                placeholder="AC..."
                onChange={(e) => handleIntegrationChange(3, 'credentials', { accountSid: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Twilio Auth Token</label>
              <input
                type="password"
                placeholder="Enter auth token..."
                onChange={(e) => handleIntegrationChange(3, 'credentials', { ...integrations[3].credentials, authToken: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Twilio Phone Number</label>
              <input
                type="tel"
                placeholder="+1234567890"
                onChange={(e) => handleIntegrationChange(3, 'credentials', { ...integrations[3].credentials, phoneNumber: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Get from <a href="https://console.twilio.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Twilio Console</a>
              </p>
            </div>

            <div className="flex items-start bg-blue-50 border border-blue-200 rounded-lg p-3">
              <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-xs text-blue-800">
                <strong>VoIP Bridge:</strong> Twilio automatically bridges LiveKit voice calls to phone networks
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Google Drive Integration */}
      <div className="border border-gray-200 rounded-lg p-5">
        <div className="flex items-start mb-4">
          <input
            type="checkbox"
            checked={integrations[0].enabled && integrations[0].provider === 'google_drive'}
            onChange={(e) => {
              if (e.target.checked) {
                handleIntegrationChange(0, 'enabled', true);
                handleIntegrationChange(0, 'provider', 'google_drive');
              }
            }}
            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
          />
          <div className="ml-3 flex-1">
            <label className="text-base font-medium text-gray-900">📁 Google Drive Integration</label>
            <p className="text-sm text-gray-600 mt-1">Store and share files via Google Drive</p>
          </div>
        </div>

        {integrations[0].enabled && integrations[0].provider === 'google_drive' && (
          <div className="pl-8 space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Google Drive API Key</label>
              <input
                type="password"
                placeholder="Enter API key..."
                onChange={(e) => handleIntegrationChange(0, 'credentials', { apiKey: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Enable Google Drive API in <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google Cloud Console</a>
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="bg-gray-50 rounded-lg p-5">
        <h4 className="font-medium text-gray-900 mb-3">Agent Summary</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Name:</span>
            <span className="font-medium">{formData.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Role:</span>
            <span className="font-medium">{formData.role}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Persona:</span>
            <span className="font-medium capitalize">{formData.persona}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Voice:</span>
            <span className={`font-medium ${formData.voiceEnabled ? 'text-green-600' : 'text-gray-500'}`}>
              {formData.voiceEnabled ? 'Enabled (Qwen 3 Omni)' : 'Disabled'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Integrations:</span>
            <span className="font-medium">
              {integrations.filter(i => i.enabled).length} configured
            </span>
          </div>
          {integrations.filter(i => i.enabled).length > 0 && (
            <div className="mt-2 pt-2 border-t border-gray-200">
              <p className="text-xs text-gray-600 mb-1">Enabled:</p>
              <div className="flex flex-wrap gap-1">
                {integrations.filter(i => i.enabled).map((int, idx) => (
                  <span key={idx} className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                    {int.provider || int.type}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const steps = [
    { number: 1, title: 'Basic Info', icon: '📋' },
    { number: 2, title: 'Instructions', icon: '📝' },
    { number: 3, title: 'Voice', icon: '🎤' },
    { number: 4, title: 'Integrations', icon: '⚡' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Create Your AI Agent</h1>
          <p className="text-gray-600">Build a powerful AI agent in 4 simple steps</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {steps.map((s, idx) => (
              <React.Fragment key={s.number}>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-medium text-lg transition-all ${
                      step >= s.number
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {step > s.number ? '✓' : s.icon}
                  </div>
                  <div className="text-xs mt-2 text-center">
                    <div className={`font-medium ${step >= s.number ? 'text-blue-600' : 'text-gray-500'}`}>
                      Step {s.number}
                    </div>
                    <div className="text-gray-600">{s.title}</div>
                  </div>
                </div>
                {idx < steps.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-4 transition-all ${
                      step > s.number ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={() => {
                if (step === 1) {
                  history.push('/agents');
                } else {
                  setStep(step - 1);
                  setErrors({});
                }
              }}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition font-medium"
            >
              {step === 1 ? 'Cancel' : 'Back'}
            </button>

            {step < 4 ? (
              <button
                onClick={handleNext}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium shadow-md"
              >
                Continue →
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Agent...
                  </span>
                ) : (
                  '✨ Create Agent'
                )}
              </button>
            )}
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Need help? Check out our{' '}
            <a href="/docs" className="text-blue-600 hover:underline">documentation</a>
            {' '}or{' '}
            <a href="/support" className="text-blue-600 hover:underline">contact support</a>
          </p>
        </div>
      </div>
    </div>
  );
}
