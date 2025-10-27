import { useState } from 'react';
import { useHistory } from 'react-router-dom';
import apiClient from '../lib/api-client';

export default function AgentCreatePage({ user }: any) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const history = useHistory();

  const [formData, setFormData] = useState({
    name: '',
    role: '',
    persona: 'professional',
    systemPrompt: '',
    voiceEnabled: false,
    voiceId: '',
    deepgramApiKey: '',
    elevenLabsApiKey: '',
  });

  const handleChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      const agentData = {
        userId: user.id,
        ...formData,
        systemPrompt: formData.systemPrompt || generateDefaultPrompt(),
      };

      const response = await apiClient.createAgent(agentData);
      alert('Agent created successfully!');
      history.push(`/agent/${response.id}`);
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

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Agent Name *</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="e.g., Sales Agent, Support Bot"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          data-testid="agent-name-input"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Role *</label>
        <input
          type="text"
          value={formData.role}
          onChange={(e) => handleChange('role', e.target.value)}
          placeholder="e.g., Lead Qualification Specialist"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          data-testid="agent-role-input"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Persona *</label>
        <select
          value={formData.persona}
          onChange={(e) => handleChange('persona', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          data-testid="agent-persona-select"
        >
          <option value="professional">Professional</option>
          <option value="friendly">Friendly</option>
          <option value="casual">Casual</option>
          <option value="formal">Formal</option>
          <option value="expert">Expert</option>
        </select>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          System Prompt (Optional)
        </label>
        <p className="text-sm text-gray-600 mb-2">
          Customize your agent's behavior. Leave blank to use auto-generated prompt.
        </p>
        <textarea
          value={formData.systemPrompt}
          onChange={(e) => handleChange('systemPrompt', e.target.value)}
          rows={10}
          placeholder={generateDefaultPrompt()}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
          data-testid="agent-prompt-textarea"
        />
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">Prompt Tips:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Define the agent's role and purpose clearly</li>
          <li>• Specify tone and communication style</li>
          <li>• List key objectives and tasks</li>
          <li>• Include guidelines for lead qualification</li>
        </ul>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="flex items-center">
        <input
          type="checkbox"
          checked={formData.voiceEnabled}
          onChange={(e) => handleChange('voiceEnabled', e.target.checked)}
          className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          data-testid="voice-enabled-checkbox"
        />
        <label className="ml-3 text-sm font-medium text-gray-700">
          Enable Voice Conversations
        </label>
      </div>

      {formData.voiceEnabled && (
        <div className="pl-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">Voice ID</label>
          <input
            type="text"
            value={formData.voiceId}
            onChange={(e) => handleChange('voiceId', e.target.value)}
            placeholder="ElevenLabs Voice ID"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            data-testid="voice-id-input"
          />
          <p className="text-sm text-gray-600 mt-2">
            Add your ElevenLabs integration in Settings to select from available voices.
          </p>
        </div>
      )}

      <div className="bg-gray-50 p-6 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-4">Agent Summary</h4>
        <div className="space-y-2 text-sm">
          <div><span className="font-medium">Name:</span> {formData.name}</div>
          <div><span className="font-medium">Role:</span> {formData.role}</div>
          <div><span className="font-medium">Persona:</span> {formData.persona}</div>
          <div><span className="font-medium">Voice:</span> {formData.voiceEnabled ? 'Enabled' : 'Disabled'}</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create New Agent</h1>
        <p className="text-gray-600 mt-2">Set up your AI agent in 3 simple steps</p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-medium ${
                step >= s
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {s}
            </div>
            {s < 3 && (
              <div
                className={`w-20 h-1 ${
                  step > s ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Form Content */}
      <div className="bg-white rounded-lg shadow-md p-8">
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8 pt-6 border-t">
          <button
            onClick={() => {
              if (step === 1) {
                history.push('/agents');
              } else {
                setStep(step - 1);
              }
            }}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
          >
            {step === 1 ? 'Cancel' : 'Back'}
          </button>

          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!formData.name || !formData.role}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
              data-testid="next-step-btn"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:bg-gray-300"
              data-testid="create-agent-submit-btn"
            >
              {loading ? 'Creating...' : 'Create Agent'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}