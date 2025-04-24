import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { DocumentArrowUpIcon, DocumentTextIcon, ChatBubbleLeftRightIcon, SparklesIcon } from '@heroicons/react/24/outline';

function Upload() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [askingQuestion, setAskingQuestion] = useState(false);

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    setFile(file);
    setLoading(true);
    setError('');
    setContent('');
    setSummary('');
    setAnswer('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        setSummary(data.summary);
        setContent(data.content);
        // Store content for slide generation
        localStorage.setItem('documentContent', data.content);
        localStorage.setItem('documentSummary', data.summary);
      } else {
        setError(data.error || 'Error processing file');
      }
    } catch (err) {
      setError('Error uploading file');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleAskQuestion = async () => {
    if (!question.trim() || !file) return;

    setAskingQuestion(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename: file.name,
          question: question.trim()
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setAnswer(data.answer);
      } else {
        setError(data.error || 'Error getting answer');
      }
    } catch (err) {
      setError('Error communicating with server');
    } finally {
      setAskingQuestion(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    maxFiles: 1
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-6xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h2 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Smart Document Processor
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Transform your documents into intelligent presentations with AI-powered insights
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Upload and Summary */}
          <div className="space-y-8">
            {/* Upload Card */}
            <div className="bg-white rounded-2xl shadow-xl p-8 backdrop-blur-lg bg-opacity-90 border border-gray-100">
              <div 
                {...getRootProps()} 
                className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all transform hover:scale-[1.02]
                  ${isDragActive 
                    ? 'border-blue-400 bg-blue-50' 
                    : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'}`}
              >
                <input {...getInputProps()} />
                <DocumentArrowUpIcon className="mx-auto h-16 w-16 text-blue-500 mb-4" />
                <p className="text-lg text-gray-600 mb-2">
                  {isDragActive ? 'Drop your file here' : 'Drag & drop your file here'}
                </p>
                <p className="text-sm text-gray-500">
                  Supports PDF, DOCX, CSV, XLS, XLSX
                </p>
              </div>
            </div>

            {/* Summary Card */}
            {summary && (
              <div className="bg-white rounded-2xl shadow-xl p-8 backdrop-blur-lg bg-opacity-90 border border-gray-100">
                <div className="flex items-center mb-6">
                  <SparklesIcon className="h-8 w-8 text-purple-500 mr-3" />
                  <h3 className="text-2xl font-semibold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    AI Summary
                  </h3>
                </div>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">{summary}</p>
              </div>
            )}
          </div>

          {/* Right Column - Content and Q&A */}
          <div className="space-y-8">
            {/* Content Preview Card */}
            {content && (
              <div className="bg-white rounded-2xl shadow-xl p-8 backdrop-blur-lg bg-opacity-90 border border-gray-100">
                <div className="flex items-center mb-6">
                  <DocumentTextIcon className="h-8 w-8 text-blue-500 mr-3" />
                  <h3 className="text-2xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Document Content
                  </h3>
                </div>
                <div className="bg-gray-50 rounded-xl p-6">
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono overflow-auto max-h-64">
                    {content}
                  </pre>
                </div>
              </div>
            )}

            {/* Q&A Card */}
            {file && (
              <div className="bg-white rounded-2xl shadow-xl p-8 backdrop-blur-lg bg-opacity-90 border border-gray-100">
                <div className="flex items-center mb-6">
                  <ChatBubbleLeftRightIcon className="h-8 w-8 text-green-500 mr-3" />
                  <h3 className="text-2xl font-semibold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                    Ask Questions
                  </h3>
                </div>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <input
                      type="text"
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      placeholder="Ask a question about your document..."
                      className="flex-1 rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                    />
                    <button
                      onClick={handleAskQuestion}
                      disabled={!question.trim() || askingQuestion}
                      className={`px-6 py-3 rounded-xl text-white font-medium transition-all transform hover:scale-105
                        ${question.trim() && !askingQuestion
                          ? 'bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600'
                          : 'bg-gray-400 cursor-not-allowed'}`}
                    >
                      {askingQuestion ? 'Thinking...' : 'Ask'}
                    </button>
                  </div>
                  {answer && (
                    <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-gray-100">
                      <p className="text-gray-700 leading-relaxed">{answer}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Continue Button */}
        {content && (
          <div className="mt-8 flex justify-end">
            <button
              onClick={() => navigate('/audience')}
              className="px-8 py-3 rounded-xl text-white font-medium transition-all transform hover:scale-105
                bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700
                flex items-center space-x-2"
            >
              <span>Continue to Audience Selection</span>
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
              <p className="text-lg text-gray-700">Processing your document...</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="fixed bottom-8 right-8 bg-red-50 border border-red-200 rounded-xl p-6 shadow-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Upload;
