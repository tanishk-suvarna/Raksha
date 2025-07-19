import React, { useState } from 'react';
import { MessageSquare, Send, Bot } from 'lucide-react';
import api from '../config/api';

const AIAssistant: React.FC = () => {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('Hello! I\'m Raksha AI, your safety assistant. How can I help keep you safe today?');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!message.trim() || loading) return;

    const userMessage = message;
    setMessage('');
    setLoading(true);

    try {
      const apiResponse = await api.post('/api/ai/chat', {
        message: userMessage,
        user_id: 'current-user', // This will be handled by auth context
      });

      setResponse(apiResponse.data.response);
    } catch (error) {
      console.error('Error chatting with AI:', error);
      setResponse('I apologize, but I\'m having trouble responding right now. Please use the emergency buttons if you need immediate help.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickQuestions = [
    "Am I in a safe area?",
    "What should I do if I feel unsafe?",
    "How do I share my location?",
    "Emergency contact tips",
  ];

  const handleQuickQuestion = (question: string) => {
    setMessage(question);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
      <div className="flex items-center mb-4">
        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white mr-3">
          <Bot className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold">Raksha AI</h2>
      </div>

      {/* AI Response */}
      <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 mb-4">
        <div className="flex items-start">
          <Bot className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
          <p className="text-sm leading-relaxed">
            {loading ? (
              <span className="flex items-center">
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></span>
                Thinking...
              </span>
            ) : (
              response
            )}
          </p>
        </div>
      </div>

      {/* Quick Questions */}
      <div className="mb-4">
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Quick questions:</p>
        <div className="flex flex-wrap gap-2">
          {quickQuestions.map((question, index) => (
            <button
              key={index}
              onClick={() => handleQuickQuestion(question)}
              className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
            >
              {question}
            </button>
          ))}
        </div>
      </div>

      {/* Message Input */}
      <div className="flex">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask me anything about safety..."
          className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-l-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border-r-0"
          disabled={loading}
        />
        <button
          onClick={sendMessage}
          disabled={loading || !message.trim()}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 rounded-r-lg transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default AIAssistant;