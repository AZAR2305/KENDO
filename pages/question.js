// Question page - Chat-like interface for asking questions about the PDF
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';

export default function QuestionPage() {
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sessionStarted, setSessionStarted] = useState(false);
  const router = useRouter();
  const messagesEndRef = useRef(null);

  // Sample questions for quick start
  const sampleQuestions = [
    "What are the main topics covered in this document?",
    "Can you summarize the key points?",
    "What are the most important concepts?",
    "Are there any practical examples mentioned?",
    "What conclusions does the document reach?"
  ];

  useEffect(() => {
    const documentId = localStorage.getItem('document_id');
    if (!documentId) {
      setError('No document uploaded. Please upload a PDF first.');
    } else {
      // Welcome message
      setMessages([{
        type: 'ai',
        text: '👋 Hello! I\'m your AI assistant. I\'ve analyzed your document and I\'m ready to answer any questions you have about it. What would you like to know?',
        timestamp: new Date().toISOString()
      }]);
      setSessionStarted(true);
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    const documentId = localStorage.getItem('document_id');
    if (!documentId) {
      setError('No document uploaded.');
      return;
    }

    const userMessage = { 
      type: 'user', 
      text: question,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setQuestion('');
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/question', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ document_id: documentId, question: userMessage.text }),
      });

      const result = await response.json();

      if (response.ok) {
        const aiMessage = { 
          type: 'ai', 
          text: result.answer,
          confidence: result.confidence,
          sources: result.sources || [],
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        setError(result.error || 'Failed to get answer.');
      }
    } catch (err) {
      setError('An error occurred while getting the answer.');
    } finally {
      setLoading(false);
    }
  };

  const askSampleQuestion = (sampleQ) => {
    setQuestion(sampleQ);
  };

  const clearChat = () => {
    setMessages([{
      type: 'ai',
      text: '👋 Chat cleared! I\'m still here to help with questions about your document.',
      timestamp: new Date().toISOString()
    }]);
    setError('');
  };

  if (!sessionStarted && error) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <span className="text-red-400 text-xl">⚠️</span>
                </div>
                <div className="ml-3">
                  <p className="text-red-700">{error}</p>
                  <button 
                    className="mt-3 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors"
                    onClick={() => router.push('/upload')}
                  >
                    📁 Upload PDF
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-500 to-blue-600 px-6 py-4 text-white">
            <h1 className="text-2xl font-bold flex items-center">
              💬 <span className="ml-2">Q&A Chat</span>
            </h1>
            <p className="mt-1 opacity-90">Ask me anything about your document</p>
          </div>

          {/* Quick Actions */}
          <div className="bg-gray-50 px-6 py-3 border-b flex items-center justify-between">
            <div className="flex space-x-2">
              <button 
                onClick={clearChat}
                className="border border-gray-300 hover:border-gray-400 text-gray-700 font-medium py-1 px-3 rounded text-sm transition-colors"
              >
                🗑️ Clear Chat
              </button>
            </div>
            <div className="text-sm text-gray-500">
              {messages.length - 1} messages • AI Ready 🟢
            </div>
          </div>

          {/* Chat Messages */}
          <div className="h-96 overflow-y-auto p-6 bg-gray-50">
            {messages.length === 1 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">💡 Try these sample questions:</h3>
                <div className="grid gap-2">
                  {sampleQuestions.map((sample, index) => (
                    <button
                      key={index}
                      onClick={() => askSampleQuestion(sample)}
                      className="text-left p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors text-sm"
                    >
                      {sample}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((message, index) => (
              <div
                key={index}
                className={`mb-4 flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                    message.type === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-gray-800 shadow-sm border'
                  }`}
                >
                  <div className="flex items-start">
                    <div className="mr-2 text-lg">
                      {message.type === 'user' ? '👤' : '🤖'}
                    </div>
                    <div className="flex-1">
                      <p className="whitespace-pre-wrap leading-relaxed">{message.text}</p>
                      {message.type === 'ai' && message.confidence && (
                        <div className="mt-2 text-xs opacity-70">
                          Confidence: {Math.round(message.confidence * 100)}%
                        </div>
                      )}
                      {message.type === 'ai' && message.sources && message.sources.length > 0 && (
                        <div className="mt-2 text-xs opacity-70">
                          📚 Sources referenced
                        </div>
                      )}
                      <div className="text-xs opacity-50 mt-1">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="mb-4 flex justify-start">
                <div className="max-w-xs lg:max-w-md px-4 py-3 rounded-lg bg-white text-gray-800 shadow-sm border">
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-1 border-gray-600"></div>
                    <span className="ml-2 text-sm">🤖 AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t bg-white p-4">
            {error && (
              <div className="mb-3 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex space-x-3">
              <div className="flex-1">
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Type your question here... (e.g., 'What are the main topics?')"
                  rows={2}
                  className="w-full resize-none border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                />
                <div className="text-xs text-gray-500 mt-1">
                  Press Enter to send, Shift+Enter for new line
                </div>
              </div>
              <button
                type="submit"
                disabled={loading || !question.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                {loading ? '⏳' : '📤'} Send
              </button>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}
