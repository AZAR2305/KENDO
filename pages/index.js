// Home page for StudySphere - Landing page with navigation to main features
import Link from 'next/link';
import Layout from '../components/Layout';

export default function Home() {
  return (
    <Layout>
      <div className="text-center mb-12">
        <h1 className="text-5xl font-extrabold text-gray-900 mb-4">
          📚 StudySphere
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Transform your PDF documents into interactive learning experiences with AI-powered summaries, quizzes, and intelligent Q&A.
        </p>
      </div>
      
      <div className="max-w-4xl mx-auto grid gap-8 lg:grid-cols-2">
        {/* Upload Card */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden border-l-4 border-blue-500">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-6 py-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              📁 <span className="ml-2">Upload PDF</span>
            </h2>
          </div>
          <div className="px-6 py-4">
            <p className="text-gray-600 mb-4">Start your learning journey by uploading a PDF document to our AI system.</p>
            <Link href="/upload" className="inline-block w-full">
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors">
                📤 Upload Document
              </button>
            </Link>
          </div>
        </div>
        
        {/* Summary Card */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden border-l-4 border-green-500">
          <div className="bg-gradient-to-r from-green-50 to-green-100 px-6 py-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              📝 <span className="ml-2">AI Summary</span>
            </h2>
          </div>
          <div className="px-6 py-4">
            <p className="text-gray-600 mb-4">Get intelligent, concise summaries of your PDF content powered by advanced AI.</p>
            <Link href="/summary" className="inline-block w-full">
              <button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors">
                🤖 Generate Summary
              </button>
            </Link>
          </div>
        </div>
        
        {/* Quiz Card */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden border-l-4 border-yellow-500">
          <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 px-6 py-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              🧠 <span className="ml-2">Smart Quiz</span>
            </h2>
          </div>
          <div className="px-6 py-4">
            <p className="text-gray-600 mb-4">Test your understanding with AI-generated multiple-choice questions.</p>
            <Link href="/quiz" className="inline-block w-full">
              <button className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-3 px-6 rounded-lg transition-colors">
                🎯 Start Quiz
              </button>
            </Link>
          </div>
        </div>
        
        {/* Q&A Card */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden border-l-4 border-purple-500">
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 px-6 py-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              ❓ <span className="ml-2">Interactive Q&A</span>
            </h2>
          </div>
          <div className="px-6 py-4">
            <p className="text-gray-600 mb-4">Ask questions about your document and get intelligent, contextual answers.</p>
            <Link href="/question" className="inline-block w-full">
              <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-colors">
                💬 Ask Questions
              </button>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Features Section */}
      <div className="mt-16 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Why Choose StudySphere?</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-6">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="text-lg font-semibold mb-2">Lightning Fast</h3>
            <p className="text-gray-600">Advanced RAG technology processes your documents in seconds</p>
          </div>
          <div className="p-6">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-lg font-semibold mb-2">Accurate AI</h3>
            <p className="text-gray-600">Context-aware responses based on your specific document content</p>
          </div>
          <div className="p-6">
            <div className="text-4xl mb-4">🔒</div>
            <h3 className="text-lg font-semibold mb-2">Secure & Private</h3>
            <p className="text-gray-600">Your documents are processed securely with user-specific knowledge boxes</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
