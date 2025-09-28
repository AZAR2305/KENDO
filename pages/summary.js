// Summary page - Displays AI-generated summary of the uploaded PDF
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router'; 
import Layout from '../components/Layout';

export default function SummaryPage() {
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const documentId = localStorage.getItem('document_id');
    if (!documentId) {
      setError('No document uploaded. Please upload a PDF first.');
      return;
    }

    fetchSummary(documentId);
  }, []);

  const fetchSummary = async (documentId) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ document_id: documentId }),
      });

      const result = await response.json();

      if (response.ok) {
        setSummary(result.summary);
      } else {
        setError(result.error || 'Failed to generate summary.');
      }
    } catch (err) {
      setError('An error occurred while fetching the summary.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-center text-gray-900 mb-8 flex items-center justify-center">
            📝 <span className="ml-2">Document Summary</span>
          </h1>
          
          {loading && (
            <div className="flex justify-center items-center mb-8 p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-lg text-gray-600">🤖 AI is analyzing your document...</span>
            </div>
          )}
          
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <span className="text-red-400 text-xl">⚠️</span>
                </div>
                <div className="ml-3">
                  <p className="text-red-700">{error}</p>
                  {error.includes('No document uploaded') && (
                    <button 
                      className="mt-3 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors"
                      onClick={() => router.push('/upload')}
                    >
                      Upload PDF
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {summary && (
            <div className="mb-8">
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 border-l-4 border-green-400">
                <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
                  ✨ <span className="ml-2">AI-Generated Summary</span>
                </h2>
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-700 leading-relaxed text-base">{summary}</p>
                </div>
                
                {/* Summary Stats */}
                <div className="mt-4 flex items-center space-x-4 text-sm text-gray-500">
                  <span>📊 Words: {summary.split(' ').length}</span>
                  <span>⏱️ Generated: {new Date().toLocaleTimeString()}</span>
                </div>
              </div>
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="flex justify-center space-x-4 flex-wrap">
            <button 
              onClick={() => router.push('/')}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 px-6 rounded-lg transition-colors"
            >
              🏠 Home
            </button>
            
            {summary && (
              <>
                <button 
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                  onClick={() => router.push('/quiz')}
                >
                  🧠 Take Quiz
                </button>
                <button 
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                  onClick={() => router.push('/question')}
                >
                  ❓ Ask Questions
                </button>
              </>
            )}
          </div>
          
          {/* Refresh Summary */}
          {summary && !loading && (
            <div className="mt-6 text-center">
              <button 
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-lg transition-colors"
                onClick={() => {
                  const documentId = localStorage.getItem('document_id');
                  if (documentId) fetchSummary(documentId);
                }}
              >
                🔄 Regenerate Summary
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
