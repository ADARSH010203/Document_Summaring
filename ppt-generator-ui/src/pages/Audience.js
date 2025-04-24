import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserGroupIcon, AcademicCapIcon, BriefcaseIcon, BeakerIcon, ArrowPathIcon, SparklesIcon } from '@heroicons/react/24/outline';

function Audience() {
  const navigate = useNavigate();
  const [audienceType, setAudienceType] = useState('');
  const [technicalLevel, setTechnicalLevel] = useState('');
  const [preferences, setPreferences] = useState({
    includeGraphics: true,
    includeExamples: true,
    detailLevel: 'balanced'
  });
  const [audienceInput, setAudienceInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  const audienceTypes = [
    { id: 'academic', name: 'Academic', icon: AcademicCapIcon, description: 'University students and researchers' },
    { id: 'business', name: 'Business', icon: BriefcaseIcon, description: 'Business professionals and stakeholders' },
    { id: 'technical', name: 'Technical', icon: BeakerIcon, description: 'Engineers and technical experts' },
  ];

  const technicalLevels = [
    { id: 'beginner', name: 'Beginner', description: 'New to the subject' },
    { id: 'intermediate', name: 'Intermediate', description: 'Familiar with basics' },
    { id: 'advanced', name: 'Advanced', description: 'Expert in the field' },
  ];

  useEffect(() => {
    const documentContent = localStorage.getItem('documentContent');
    if (!documentContent) {
      setError('No document content found. Please upload a document first.');
      navigate('/');
    }
  }, [navigate]);

  const handleSubmit = async () => {
    const documentContent = localStorage.getItem('documentContent');
    if (!documentContent) {
      setError('No document content found. Please upload a document first.');
      navigate('/');
      return;
    }

    if (audienceType && technicalLevel) {
      setError('');
      setIsGenerating(true);
      try {
        const response = await fetch('http://localhost:5000/generate-slides', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            audienceType,
            technicalLevel,
            preferences,
            audienceInput,
            documentContent
          }),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.detail || 'Failed to generate slides');
        }

        if (!data.slides || data.slides.length === 0) {
          throw new Error('No slides were generated');
        }

        // Save all the context for potential regeneration
        localStorage.setItem('generatedSlides', JSON.stringify(data.slides));
        localStorage.setItem('audienceType', audienceType);
        localStorage.setItem('technicalLevel', technicalLevel);
        localStorage.setItem('preferences', JSON.stringify(preferences));
        localStorage.setItem('audienceInput', audienceInput);

        navigate('/preview');
      } catch (error) {
        console.error('Error generating slides:', error);
        setError(error.message || 'Failed to generate slides. Please try again.');
      } finally {
        setIsGenerating(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <UserGroupIcon className="h-12 w-12 text-blue-600" />
          </div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Define Your Audience
          </h2>
          <p className="text-xl text-gray-600">
            Help us tailor the presentation to your target audience
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8 rounded-xl">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Audience Type Selection */}
        <div className="bg-white rounded-2xl shadow-xl p-8 backdrop-blur-lg bg-opacity-90 border border-gray-100 mb-8">
          <h3 className="text-2xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
            Audience Type
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {audienceTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setAudienceType(type.id)}
                className={`p-6 rounded-xl border-2 transition-all transform hover:scale-105 ${
                  audienceType === type.id
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-200 hover:border-blue-200'
                }`}
              >
                <type.icon className={`h-8 w-8 mb-4 ${
                  audienceType === type.id ? 'text-blue-500' : 'text-gray-400'
                }`} />
                <h4 className="text-lg font-medium mb-2">{type.name}</h4>
                <p className="text-sm text-gray-600">{type.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Technical Level Selection */}
        <div className="bg-white rounded-2xl shadow-xl p-8 backdrop-blur-lg bg-opacity-90 border border-gray-100 mb-8">
          <h3 className="text-2xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
            Technical Level
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {technicalLevels.map((level) => (
              <button
                key={level.id}
                onClick={() => setTechnicalLevel(level.id)}
                className={`p-6 rounded-xl border-2 transition-all transform hover:scale-105 ${
                  technicalLevel === level.id
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-200 hover:border-blue-200'
                }`}
              >
                <h4 className="text-lg font-medium mb-2">{level.name}</h4>
                <p className="text-sm text-gray-600">{level.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Audience Input */}
        <div className="bg-white rounded-2xl shadow-xl p-8 backdrop-blur-lg bg-opacity-90 border border-gray-100 mb-8">
          <h3 className="text-2xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
            Additional Context
          </h3>
          <div className="space-y-4">
            <p className="text-gray-600">
              Provide any specific requirements or context for the presentation
            </p>
            <textarea
              value={audienceInput}
              onChange={(e) => setAudienceInput(e.target.value)}
              placeholder="E.g., Focus on recent market trends, Include case studies, etc."
              className="w-full h-32 px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all resize-none"
            />
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-white rounded-2xl shadow-xl p-8 backdrop-blur-lg bg-opacity-90 border border-gray-100 mb-8">
          <h3 className="text-2xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
            Presentation Preferences
          </h3>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <label className="text-gray-700 font-medium">Include Graphics</label>
              <button
                onClick={() => setPreferences(prev => ({ ...prev, includeGraphics: !prev.includeGraphics }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  preferences.includeGraphics ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    preferences.includeGraphics ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <label className="text-gray-700 font-medium">Include Examples</label>
              <button
                onClick={() => setPreferences(prev => ({ ...prev, includeExamples: !prev.includeExamples }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  preferences.includeExamples ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    preferences.includeExamples ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-gray-700 font-medium block">Detail Level</label>
              <div className="grid grid-cols-3 gap-4">
                {['concise', 'balanced', 'detailed'].map((level) => (
                  <button
                    key={level}
                    onClick={() => setPreferences(prev => ({ ...prev, detailLevel: level }))}
                    className={`py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                      preferences.detailLevel === level
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-end space-x-4">
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 rounded-xl text-gray-600 font-medium hover:bg-gray-50 transition-all"
          >
            Back
          </button>
          <button
            onClick={handleSubmit}
            disabled={!audienceType || !technicalLevel || isGenerating}
            className={`px-8 py-3 rounded-xl text-white font-medium transition-all transform hover:scale-105 flex items-center space-x-2
              ${audienceType && technicalLevel && !isGenerating
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                : 'bg-gray-400 cursor-not-allowed'}`}
          >
            {isGenerating ? (
              <>
                <ArrowPathIcon className="h-5 w-5 animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <SparklesIcon className="h-5 w-5" />
                <span>Generate Presentation</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Audience;
