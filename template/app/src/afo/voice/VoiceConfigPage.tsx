import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import apiClient from '../lib/api-client';

export default function VoiceConfigPage({ user }: any) {
  const { agentId } = useParams<{ agentId: string }>();
  const [agent, setAgent] = useState<any>(null);
  const [voices, setVoices] = useState<any[]>([]);
  const [models, setModels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [testingKey, setTestingKey] = useState(false);
  
  // Form state
  const [deepgramKey, setDeepgramKey] = useState('');
  const [elevenLabsKey, setElevenLabsKey] = useState('');
  const [selectedVoice, setSelectedVoice] = useState('');
  const [selectedModel, setSelectedModel] = useState('eleven_monolingual_v1');
  
  // Test state
  const [testText, setTestText] = useState('Hello! This is a test of the text to speech system.');
  const [testResult, setTestResult] = useState<any>(null);

  useEffect(() => {
    if (agentId) {
      loadAgentData();
    }
  }, [agentId]);

  const loadAgentData = async () => {
    try {
      setLoading(true);
      const agentData = await apiClient.getAgent(agentId);
      setAgent(agentData);
      
      // Pre-fill if agent already has keys configured
      if (agentData.deepgram_api_key) {
        setDeepgramKey('••••••••••••');
      }
      if (agentData.elevenlabs_api_key) {
        setElevenLabsKey('••••••••••••');
      }
      if (agentData.voice_settings?.voice_id) {
        setSelectedVoice(agentData.voice_settings.voice_id);
      }
    } catch (error) {
      console.error('Failed to load agent:', error);
    } finally {
      setLoading(false);
    }
  };

  const testElevenLabsKey = async () => {
    if (!elevenLabsKey || elevenLabsKey.includes('•')) {
      alert('Please enter a valid ElevenLabs API key');
      return;
    }

    try {
      setTestingKey(true);
      const result = await apiClient.testElevenLabsKey(user.id, elevenLabsKey);
      
      if (result.status === 'success') {
        setTestResult({ type: 'success', message: result.message });
        // Load available voices
        loadVoices();
        loadModels();
      }
    } catch (error: any) {
      setTestResult({ type: 'error', message: error.message || 'Failed to test API key' });
    } finally {
      setTestingKey(false);
    }
  };

  const loadVoices = async () => {
    try {
      const response = await apiClient.getVoices(user.id);
      setVoices(response.voices || []);
    } catch (error) {
      console.error('Failed to load voices:', error);
    }
  };

  const loadModels = async () => {
    try {
      const response = await apiClient.getTTSModels(user.id);
      setModels(response.models || []);
    } catch (error) {
      console.error('Failed to load models:', error);
    }
  };

  const saveVoiceConfig = async () => {
    try {
      await apiClient.updateAgent(agentId, {
        deepgram_api_key: deepgramKey.includes('•') ? undefined : deepgramKey,
        elevenlabs_api_key: elevenLabsKey.includes('•') ? undefined : elevenLabsKey,
        voice_settings: {
          voice_id: selectedVoice,
          model_id: selectedModel,
        }
      });
      alert('Voice configuration saved successfully!');
    } catch (error) {
      console.error('Failed to save voice config:', error);
      alert('Failed to save voice configuration');
    }
  };

  const testTTS = async () => {
    if (!testText) {
      alert('Please enter test text');
      return;
    }

    try {
      const audioBlob = await apiClient.textToSpeech(
        user.id,
        testText,
        selectedVoice,
        selectedModel
      );
      
      // Play the audio
      const audio = new Audio(URL.createObjectURL(audioBlob));
      audio.play();
      
      setTestResult({ type: 'success', message: 'Audio generated successfully!' });
    } catch (error: any) {
      setTestResult({ type: 'error', message: error.message || 'Failed to generate audio' });
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
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Voice Configuration</h1>
          <p className="text-gray-600 mt-2">
            Configure voice capabilities for agent: <span className="font-semibold">{agent?.name}</span>
          </p>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <div className="flex">
            <svg className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">Bring Your Own API Keys</p>
              <p>For voice capabilities, you need to provide your own API keys:</p>
              <ul className="list-disc ml-5 mt-2">
                <li><strong>Deepgram:</strong> For Speech-to-Text (STT)</li>
                <li><strong>ElevenLabs:</strong> For Text-to-Speech (TTS)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* API Keys Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">API Keys</h2>
          
          {/* Deepgram */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Deepgram API Key (Speech-to-Text)
            </label>
            <input
              type="password"
              value={deepgramKey}
              onChange={(e) => setDeepgramKey(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your Deepgram API key"
            />
            <p className="text-xs text-gray-500 mt-1">
              Get your API key from <a href="https://console.deepgram.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Deepgram Console</a>
            </p>
          </div>

          {/* ElevenLabs */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ElevenLabs API Key (Text-to-Speech)
            </label>
            <div className="flex space-x-2">
              <input
                type="password"
                value={elevenLabsKey}
                onChange={(e) => setElevenLabsKey(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your ElevenLabs API key"
              />
              <button
                onClick={testElevenLabsKey}
                disabled={testingKey}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300"
              >
                {testingKey ? 'Testing...' : 'Test Key'}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Get your API key from <a href="https://elevenlabs.io/app/settings/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">ElevenLabs Settings</a>
            </p>
            
            {testResult && (
              <div className={`mt-2 p-2 rounded text-sm ${
                testResult.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {testResult.message}
              </div>
            )}
          </div>
        </div>

        {/* Voice Settings */}
        {voices.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Voice Settings</h2>
            
            {/* Voice Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Voice
              </label>
              <select
                value={selectedVoice}
                onChange={(e) => setSelectedVoice(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Choose a voice...</option>
                {voices.map((voice) => (
                  <option key={voice.voice_id} value={voice.voice_id}>
                    {voice.name} - {voice.labels?.accent || 'Unknown accent'}
                  </option>
                ))}
              </select>
            </div>

            {/* Model Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                TTS Model
              </label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {models.map((model) => (
                  <option key={model.model_id} value={model.model_id}>
                    {model.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Test TTS */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Test Text-to-Speech
              </label>
              <textarea
                value={testText}
                onChange={(e) => setTestText(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Enter text to test..."
              />
              <button
                onClick={testTTS}
                className="mt-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                🔊 Generate & Play Audio
              </button>
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="flex justify-end space-x-4">
          <button
            onClick={() => window.history.back()}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={saveVoiceConfig}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
}
