import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@src/lib/auth';
import apiClient from '../lib/api-client';

const VOICE_PERSONAS = [
  { id: 0, name: 'Professional Female', description: 'Clear, authoritative, business-focused' },
  { id: 1, name: 'Professional Male', description: 'Confident, warm, trustworthy' },
  { id: 2, name: 'Friendly Female', description: 'Approachable, enthusiastic, helpful' },
  { id: 3, name: 'Friendly Male', description: 'Casual, engaging, personable' },
  { id: 4, name: 'Casual Female', description: 'Relaxed, conversational, natural' },
  { id: 5, name: 'Casual Male', description: 'Easy-going, authentic, relatable' },
  { id: 6, name: 'Energetic Female', description: 'Dynamic, upbeat, motivating' },
  { id: 7, name: 'Energetic Male', description: 'Enthusiastic, passionate, inspiring' },
  { id: 8, name: 'Calm Female', description: 'Soothing, patient, empathetic' },
  { id: 9, name: 'Calm Male', description: 'Composed, reassuring, steady' },
  { id: 10, name: 'Authoritative Female', description: 'Expert, decisive, commanding' },
  { id: 11, name: 'Authoritative Male', description: 'Strong, knowledgeable, assertive' },
  { id: 12, name: 'Empathetic Female', description: 'Understanding, caring, supportive' },
  { id: 13, name: 'Empathetic Male', description: 'Compassionate, attentive, kind' },
  { id: 14, name: 'Technical Female', description: 'Precise, analytical, detailed' },
  { id: 15, name: 'Technical Male', description: 'Logical, methodical, accurate' },
  { id: 16, name: 'Multilingual Neutral', description: 'Universal, adaptable, clear' },
];

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'zh', name: 'Chinese (Mandarin)' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'ar', name: 'Arabic' },
  { code: 'hi', name: 'Hindi' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ru', name: 'Russian' },
  { code: 'it', name: 'Italian' },
  { code: 'tr', name: 'Turkish' },
  { code: 'vi', name: 'Vietnamese' },
  { code: 'th', name: 'Thai' },
  { code: 'id', name: 'Indonesian' },
  { code: 'pl', name: 'Polish' },
  { code: 'nl', name: 'Dutch' },
  { code: 'sv', name: 'Swedish' },
];

export default function AgentCreatePage() {
  const { data: user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    role: '',
    useCase: 'sales',
    systemPrompt: '',
    voicePersona: 3, // Friendly Male default
    language: 'auto', // Auto-detect
    voiceEnabled: true, // Qwen 3 Omni by default
    emotionDetection: true,
    videoSupport: false,
  });

  const handleChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      const agentData = {
        userId: user.id,
        name: formData.name,
        role: formData.role,
        useCase: formData.useCase,
        systemPrompt: formData.systemPrompt || generateDefaultPrompt(),
        voiceSettings: {
          enabled: formData.voiceEnabled,
          voicePersona: formData.voicePersona,
          language: formData.language,
          emotionDetection: formData.emotionDetection,
          videoSupport: formData.videoSupport,
        },
        isActive: true,
      };

      const response = await apiClient.createAgent(agentData);
      alert('Agent created successfully! 🎉');
      navigate(`/agent/${response.id}`);
    } catch (error: any) {
      alert(`Failed to create agent: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const generateDefaultPrompt = () => {
    const useCasePrompts = {
      sales: `You are ${formData.name}, a professional sales assistant. Your goal is to:
- Qualify leads by understanding their needs and budget
- Schedule product demonstrations or meetings
- Provide product information and answer questions
- Create a positive, helpful experience that moves leads through the funnel`,
      
      support: `You are ${formData.name}, a customer support specialist. Your goal is to:
- Help customers resolve their issues quickly and effectively
- Provide step-by-step troubleshooting guidance
- Create support tickets when needed
- Ensure customer satisfaction and follow up on unresolved issues`,
      
      booking: `You are ${formData.name}, an appointment scheduling assistant. Your goal is to:
- Understand customer scheduling preferences
- Check calendar availability and suggest suitable times
- Book appointments and send confirmations
- Handle rescheduling and cancellations professionally`,
    };

    return useCasePrompts[formData.useCase] || useCasePrompts.sales;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Create New Agent
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Powered by Qwen 3 Omni • End-to-end voice AI
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((stepNum) => (
              <div key={stepNum} className="flex items-center flex-1">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  step >= stepNum 
                    ? 'border-blue-600 bg-blue-600 text-white' 
                    : 'border-gray-300 bg-white text-gray-500'
                }`}>
                  {stepNum}
                </div>
                {stepNum < 4 && (
                  <div className={`flex-1 h-1 mx-2 ${
                    step > stepNum ? 'bg-blue-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-sm">
            <span className={step === 1 ? 'text-blue-600 font-medium' : 'text-gray-500'}>Basic Info</span>
            <span className={step === 2 ? 'text-blue-600 font-medium' : 'text-gray-500'}>Voice Setup</span>
            <span className={step === 3 ? 'text-blue-600 font-medium' : 'text-gray-500'}>Prompt</span>
            <span className={step === 4 ? 'text-blue-600 font-medium' : 'text-gray-500'}>Review</span>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-8">
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Agent Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="e.g., Sales Assistant, Support Bot"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Role/Title
                </label>
                <input
                  type="text"
                  value={formData.role}
                  onChange={(e) => handleChange('role', e.target.value)}
                  placeholder="e.g., Customer Success Manager, Sales Rep"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Primary Use Case *
                </label>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { value: 'sales', icon: '💼', label: 'Sales & Lead Gen' },
                    { value: 'support', icon: '🎧', label: 'Customer Support' },
                    { value: 'booking', icon: '📅', label: 'Appointment Booking' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleChange('useCase', option.value)}
                      className={`p-4 border-2 rounded-lg text-center transition-all ${
                        formData.useCase === option.value
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                      }`}
                    >
                      <div className="text-3xl mb-2">{option.icon}</div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {option.label}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Voice Setup */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-start">
                  <span className="text-2xl mr-3">🎙️</span>
                  <div>
                    <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-1">
                      Powered by Qwen 3 Omni
                    </h3>
                    <p className="text-sm text-blue-800 dark:text-blue-400">
                      End-to-end voice AI with 211ms latency, 17 voice personas, and emotion detection
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Voice Persona (Choose from 17) *
                </label>
                <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                  {VOICE_PERSONAS.map((voice) => (
                    <button
                      key={voice.id}
                      onClick={() => handleChange('voicePersona', voice.id)}
                      className={`p-3 border-2 rounded-lg text-left transition-all ${
                        formData.voicePersona === voice.id
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                      }`}
                    >
                      <div className="font-medium text-gray-900 dark:text-white text-sm">
                        {voice.name}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {voice.description}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Primary Language
                </label>
                <select
                  value={formData.language}
                  onChange={(e) => handleChange('language', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="auto">Auto-detect (Recommended)</option>
                  {LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  Qwen 3 Omni supports 19 input languages automatically
                </p>
              </div>

              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.emotionDetection}
                    onChange={(e) => handleChange('emotionDetection', e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    😊 Enable Emotion Detection (detect tone, urgency, frustration)
                  </span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.videoSupport}
                    onChange={(e) => handleChange('videoSupport', e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    🎥 Enable Video Support (screen sharing for troubleshooting)
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Step 3: System Prompt */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  System Prompt
                </label>
                <textarea
                  value={formData.systemPrompt}
                  onChange={(e) => handleChange('systemPrompt', e.target.value)}
                  placeholder={generateDefaultPrompt()}
                  rows={12}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white font-mono text-sm"
                />
                <p className="mt-2 text-xs text-gray-500">
                  Leave empty to use default prompt based on use case
                </p>
              </div>

              <button
                onClick={() => handleChange('systemPrompt', generateDefaultPrompt())}
                className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Generate Default Prompt
              </button>
            </div>
          )}

          {/* Step 4: Review */}
          {step === 4 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Review Your Agent
              </h3>

              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 space-y-4">
                <ReviewItem label="Name" value={formData.name} />
                <ReviewItem label="Role" value={formData.role} />
                <ReviewItem label="Use Case" value={formData.useCase} />
                <ReviewItem 
                  label="Voice Persona" 
                  value={VOICE_PERSONAS.find(v => v.id === formData.voicePersona)?.name} 
                />
                <ReviewItem 
                  label="Language" 
                  value={formData.language === 'auto' ? 'Auto-detect' : LANGUAGES.find(l => l.code === formData.language)?.name} 
                />
                <ReviewItem 
                  label="Emotion Detection" 
                  value={formData.emotionDetection ? '✅ Enabled' : '❌ Disabled'} 
                />
                <ReviewItem 
                  label="Video Support" 
                  value={formData.videoSupport ? '✅ Enabled' : '❌ Disabled'} 
                />
              </div>

              <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
                <h4 className="font-semibold mb-2">🚀 Ready to Deploy!</h4>
                <p className="text-sm text-blue-100">
                  Your agent will use Qwen 3 Omni with 211ms latency and support 19 languages
                </p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="mt-8 flex justify-between">
            {step > 1 && (
              <button
                onClick={prevStep}
                className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Back
              </button>
            )}
            
            {step < 4 ? (
              <button
                onClick={nextStep}
                disabled={step === 1 && !formData.name}
                className="ml-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="ml-auto px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 font-semibold"
              >
                {loading ? 'Creating...' : 'Create Agent 🚀'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ReviewItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{label}:</span>
      <span className="text-sm text-gray-900 dark:text-white font-medium">{value}</span>
    </div>
  );
}
