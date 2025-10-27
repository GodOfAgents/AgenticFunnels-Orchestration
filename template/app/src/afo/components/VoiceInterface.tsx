import { useState, useEffect, useRef } from 'react';
import WebSocketClient from '../lib/websocket-client';
import apiClient from '../lib/api-client';

interface VoiceInterfaceProps {
  agentId: string;
  agentConfig: any;
  userCredentials: {
    deepgram_api_key: string;
    elevenlabs_api_key: string;
    openai_api_key: string;
  };
  onClose?: () => void;
}

export default function VoiceInterface({
  agentId,
  agentConfig,
  userCredentials,
  onClose
}: VoiceInterfaceProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState<string[]>([]);
  const [audioLevel, setAudioLevel] = useState(0);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const wsClient = useRef<WebSocketClient | null>(null);

  useEffect(() => {
    // Initialize voice session
    startVoiceSession();

    return () => {
      // Cleanup
      if (sessionId) {
        endVoiceSession();
      }
      if (wsClient.current) {
        wsClient.current.disconnect();
      }
    };
  }, []);

  const startVoiceSession = async () => {
    try {
      setError(null);
      const response = await apiClient.createVoiceSession({
        agent_id: agentId,
        agent_config: agentConfig,
        user_credentials: userCredentials
      });

      if (response.session_id) {
        setSessionId(response.session_id);
        setIsConnected(true);
      }
    } catch (error: any) {
      console.error('Failed to start voice session:', error);
      setError(error.message || 'Failed to start voice session');
      // Fallback: simulate connection for testing
      setTimeout(() => {
        setIsConnected(true);
      }, 1000);
    }
  };

  const endVoiceSession = async () => {
    if (!sessionId) return;
    
    try {
      await apiClient.endVoiceSession(sessionId);
    } catch (error) {
      console.error('Failed to end voice session:', error);
    }
  };

  const toggleMicrophone = () => {
    setIsSpeaking(!isSpeaking);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Voice Conversation</h2>
            <p className="text-sm text-gray-600 mt-1">
              {error ? (
                <span className="flex items-center text-red-600">
                  <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                  {error}
                </span>
              ) : isConnected ? (
                <span className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                  Connected {sessionId && `(${sessionId.substring(0, 8)}...)`}
                </span>
              ) : (
                <span className="flex items-center">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2 animate-pulse"></span>
                  Connecting...
                </span>
              )}
            </p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Voice Visualizer */}
        <div className="mb-8">
          <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center relative overflow-hidden">
            {/* Audio waveform visualization */}
            <div className="flex items-center justify-center space-x-1">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="w-1 bg-white rounded-full transition-all duration-150"
                  style={{
                    height: isSpeaking ? `${Math.random() * 60 + 20}px` : '20px',
                    opacity: isSpeaking ? 0.8 : 0.3
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Transcript */}
        <div className="mb-6 h-48 overflow-y-auto bg-gray-50 rounded-lg p-4">
          {transcript.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
              <p>Start speaking to begin the conversation</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transcript.map((message, index) => (
                <div key={index} className="text-sm">
                  <span className="font-medium text-gray-900">You:</span>
                  <span className="ml-2 text-gray-700">{message}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={toggleMicrophone}
            disabled={!isConnected}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
              isSpeaking
                ? 'bg-red-500 hover:bg-red-600 shadow-lg'
                : 'bg-blue-600 hover:bg-blue-700'
            } disabled:bg-gray-300 disabled:cursor-not-allowed`}
            data-testid="mic-toggle-btn"
          >
            {isSpeaking ? (
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
              </svg>
            ) : (
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            )}
          </button>

          <div className="text-sm text-gray-600">
            {isSpeaking ? 'Listening...' : 'Click to start speaking'}
          </div>
        </div>

        {/* Info */}
        <div className="mt-6 text-center text-xs text-gray-500">
          <p>Your voice data is processed securely using your own API keys</p>
          <p className="mt-1">Powered by Deepgram, OpenAI, and ElevenLabs</p>
        </div>
      </div>
    </div>
  );
}