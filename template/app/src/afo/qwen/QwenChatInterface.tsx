import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@src/lib/auth';
import apiClient from '../lib/api-client';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  emotion?: string;
}

export default function QwenChatInterface({ agentId }: { agentId?: string }) {
  const { data: user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [qwenInfo, setQwenInfo] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initializeChat();
    loadQwenInfo();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadQwenInfo = async () => {
    try {
      const info = await apiClient.getQwenInfo();
      setQwenInfo(info);
    } catch (error) {
      console.error('Failed to load Qwen info:', error);
    }
  };

  const initializeChat = async () => {
    try {
      setLoading(true);
      
      const session = await apiClient.createQwenSession({
        agent_id: agentId || 'demo-agent',
        agent_config: {
          system_prompt: 'You are a helpful AI assistant powered by Qwen 3 Omni.',
          voice_id: 3,
          language: 'en',
        },
      });

      setSessionId(session.session_id);
      setConnected(true);
      
      // Add welcome message
      addMessage({
        id: 'welcome',
        role: 'assistant',
        content: '👋 Hello! I\'m powered by Qwen 3 Omni. How can I help you today?',
        timestamp: new Date(),
      });
    } catch (error: any) {
      console.error('Failed to initialize chat:', error);
      addMessage({
        id: 'error',
        role: 'assistant',
        content: '⚠️ Failed to connect to Qwen 3 Omni. Please check if the model is loaded.',
        timestamp: new Date(),
      });
    } finally {
      setLoading(false);
    }
  };

  const addMessage = (message: Message) => {
    setMessages(prev => [...prev, message]);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async () => {
    if (!input.trim() || !sessionId) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    addMessage(userMessage);
    setInput('');
    setLoading(true);

    try {
      const response = await apiClient.qwenChat(sessionId, input, false);
      
      addMessage({
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.text || 'I received your message.',
        timestamp: new Date(),
        emotion: response.emotion,
      });
    } catch (error: any) {
      addMessage({
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `⚠️ Error: ${error.message}`,
        timestamp: new Date(),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="text-3xl mr-3">🎙️</div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Qwen 3 Omni Chat
                </h2>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                    connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                  }`}></span>
                  {connected ? 'Connected' : 'Disconnected'}
                  {sessionId && ` • ${sessionId.substring(0, 8)}...`}
                </div>
              </div>
            </div>

            {/* Status Badge */}
            {qwenInfo && (
              <div className="hidden sm:flex items-center space-x-4 text-xs">
                <div className="flex items-center">
                  <span className="text-gray-500 dark:text-gray-400">Latency:</span>
                  <span className="ml-1 font-semibold text-green-600">211ms</span>
                </div>
                <div className="flex items-center">
                  <span className="text-gray-500 dark:text-gray-400">Languages:</span>
                  <span className="ml-1 font-semibold text-blue-600">19</span>
                </div>
                <div className="flex items-center">
                  <span className="text-gray-500 dark:text-gray-400">Voices:</span>
                  <span className="ml-1 font-semibold text-purple-600">17</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="space-y-4">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            
            {loading && (
              <div className="flex items-center space-x-2 text-gray-500">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-end space-x-4">
            <div className="flex-1">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message... (Enter to send, Shift+Enter for new line)"
                rows={1}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white resize-none"
                style={{ minHeight: '52px', maxHeight: '150px' }}
              />
            </div>
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading || !connected}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>

          {/* Quick Actions */}
          <div className="mt-3 flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
            <span>Powered by Qwen 3 Omni</span>
            <span>•</span>
            <span>Multi-language support</span>
            <span>•</span>
            <span>Emotion detection enabled</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[70%] ${isUser ? 'order-2' : 'order-1'}`}>
        <div
          className={`rounded-2xl px-4 py-3 ${
            isUser
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
              : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white'
          }`}
        >
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          
          {message.emotion && (
            <div className="mt-2 text-xs opacity-75">
              Detected emotion: {message.emotion}
            </div>
          )}
        </div>

        <div className={`mt-1 text-xs text-gray-500 ${isUser ? 'text-right' : 'text-left'}`}>
          {new Date(message.timestamp).toLocaleTimeString()}
        </div>
      </div>

      {/* Avatar */}
      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
        isUser ? 'order-1 ml-3 bg-blue-600' : 'order-2 mr-3 bg-gray-300 dark:bg-gray-700'
      }`}>
        <span className="text-sm">
          {isUser ? '👤' : '🤖'}
        </span>
      </div>
    </div>
  );
}
