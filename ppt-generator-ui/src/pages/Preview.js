import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PresentationChartBarIcon,
  ArrowPathIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import ReactMarkdown from 'react-markdown';

function Preview() {
  const navigate = useNavigate();
  const [slides, setSlides] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [regenerating, setRegenerating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('generatedSlides');
    if (!saved) {
      navigate('/audience');
      return;
    }
    const parsed = JSON.parse(saved);
    if (!parsed.length) {
      navigate('/audience');
      return;
    }
    setSlides(parsed);
    setSelectedIndex(0);
  }, [navigate]);

  const handleRegenerate = async () => {
    setRegenerating(true);
    setError('');
    try {
      const res = await fetch('http://localhost:5000/generate-slides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audienceType: localStorage.getItem('audienceType'),
          technicalLevel: localStorage.getItem('technicalLevel'),
          preferences: JSON.parse(localStorage.getItem('preferences') || '{}'),
          audienceInput: localStorage.getItem('audienceInput'),
          documentContent: localStorage.getItem('documentContent'),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Regeneration failed');
      if (!data.slides?.length) throw new Error('No slides generated');
      setSlides(data.slides);
      localStorage.setItem('generatedSlides', JSON.stringify(data.slides));
      setSelectedIndex(0);
    } catch (e) {
      setError(e.message);
    } finally {
      setRegenerating(false);
    }
  };

  const selected = slides[selectedIndex] || {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <PresentationChartBarIcon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Preview Your Presentation
          </h2>
          <p className="text-xl text-gray-600">
            Review and customize your AI-generated slides
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-8">
          {/* Slide List */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Slides</h3>
              <div className="space-y-2">
                {slides.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedIndex(idx)}
                    className={`w-full text-left p-3 rounded-lg transition-all hover:scale-105 ${
                      selectedIndex === idx
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className="font-medium">
                      {s.title || `Slide ${idx + 1}`}
                    </div>
                    <div className="text-sm">
                      {s.layout
                        ? `${s.layout.charAt(0).toUpperCase() + s.layout.slice(1)} Layout`
                        : 'Layout'}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Slide Detail */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 mb-4">
              <h3 className="text-3xl font-bold text-blue-700 mb-6">
                {selected.title || 'Untitled Slide'}
              </h3>
              <div className="prose max-w-none prose-blue prose-lg">
                <ReactMarkdown>
                  {selected.content || 'No content available.'}
                </ReactMarkdown>
              </div>
            </div>

            {error && <p className="text-red-600 mb-4">{error}</p>}

            <div className="flex items-center space-x-4">
              <button
                onClick={handleRegenerate}
                disabled={regenerating}
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
              >
                {regenerating ? (
                  <>
                    <ArrowPathIcon className="h-5 w-5 animate-spin mr-2" />
                    Regenerating…
                  </>
                ) : (
                  <>Regenerate Slides</>
                )}
              </button>

              <button
                onClick={() => navigate('/export')}
                className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition"
              >
                <CheckCircleIcon className="h-5 w-5 mr-2" />
                Proceed to Export
              </button>
            </div>
          </div>
        </div>

        <footer className="text-center text-sm text-gray-500">
          &copy; 2025 PPT Generator
        </footer>
      </div>
    </div>
  );
}

export default Preview;