// Upload page - Allows users to upload PDF files for processing by the RAG system
import { useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';

export default function UploadPage() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'
  const router = useRouter();

  // Handle file selection
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setMessage('Only PDF files are allowed.');
        setMessageType('error');
        setSelectedFile(null);
        return;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        setMessage('File size must be less than 10MB.');
        setMessageType('error');
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
      setMessage('');
      setMessageType('');
    }
  };

  // Handle upload submission
  const handleUpload = async () => {
    if (!selectedFile) {
      setMessage('Please select a PDF file to upload.');
      setMessageType('error');
      return;
    }

    setUploading(true);
    setMessage('');

    const formData = new FormData();
    formData.append('pdf', selectedFile);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (response.ok) {
        setMessage(`Upload successful! Document ID: ${result.document_id}`);
        setMessageType('success');
        // Store document_id in localStorage for other pages
        localStorage.setItem('document_id', result.document_id);
        localStorage.setItem('document_title', result.title || selectedFile.name);
      } else {
        setMessage(`Upload failed: ${result.error}`);
        setMessageType('error');
      }
    } catch (error) {
      setMessage('An error occurred during upload.');
      setMessageType('error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">📁 Upload PDF Document</h1>
          
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select PDF File
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-gray-400 transition-colors">
              <div className="space-y-1 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div className="flex text-sm text-gray-600">
                  <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                    <span>Upload a PDF file</span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                      accept=".pdf"
                      onChange={handleFileSelect}
                      disabled={uploading}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">PDF up to 10MB</p>
              </div>
            </div>
            
            {selectedFile && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  📄 Selected: <span className="font-medium">{selectedFile.name}</span>
                  <span className="text-gray-600 ml-2">({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                </p>
              </div>
            )}
            
            <p className="mt-2 text-sm text-gray-500">
              Upload a PDF document to generate summaries, quizzes, and enable Q&A. Maximum file size: 10MB.
            </p>
          </div>
          
          <div className="flex justify-center space-x-4">
            <button
              onClick={handleUpload}
              disabled={uploading || !selectedFile}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:cursor-not-allowed"
            >
              {uploading ? '⏳ Uploading...' : '📤 Upload PDF'}
            </button>
          </div>
          
          {/* Messages */}
          {message && (
            <div className={`mt-6 p-4 rounded-lg ${
              messageType === 'success' 
                ? 'bg-green-50 border border-green-200 text-green-800'
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              <p>{messageType === 'success' ? '✅' : '❌'} {message}</p>
            </div>
          )}
          
          {/* Upload Progress */}
          {uploading && (
            <div className="mt-6 text-center">
              <div className="inline-flex items-center px-4 py-2 bg-blue-50 rounded-lg">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                <span className="text-blue-600">Processing your PDF...</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
