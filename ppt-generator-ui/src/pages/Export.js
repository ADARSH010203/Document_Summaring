import  pptxgen from 'pptxgenjs';
import { ArrowDownTrayIcon, SparklesIcon } from '@heroicons/react/24/outline';

function Export() {
  const slides = JSON.parse(localStorage.getItem('generatedSlides') || '[]');

  const handleDownload = async () => {
    const pptx = new pptxgen();
    
    // Modern slide master
    pptx.defineSlideMaster({
      title: 'MODERN_MASTER',
      background: { color: 'F8FAFC' },
      objects: [
        { 
          rect: { 
            x: 0, y: 0, w: '100%', h: 1, 
            fill: { 
              type: 'gradient',
              gradientType: 'linear',
              stops: [
                { color: '3B82F6', position: 0 }, // blue-500
                { color: '8B5CF6', position: 100 } // purple-500
              ]
            },
            shadow: { type: 'outer', blur: 3, opacity: 0.3 }
          } 
        }
      ]
    });

    // Add slides with modern layout
    slides.forEach((slide, idx) => {
      const sld = pptx.addSlide('MODERN_MASTER');
      
      // Title with accent bar
      sld.addText(slide.title || `Slide ${idx + 1}`, {
        x: 0.5, y: 0.3, w: 9, h: 0.8,
        fontSize: 28,
        bold: true,
        color: 'FFFFFF',
        align: 'left'
      });

      // Content with modern bullets
      const bulletOptions = {
        x: 0.8, y: 1.5, w: 8.5, h: 5,
        fontSize: 16,
        bullet: { code: '25CF', color: '3B82F6' }, // blue bullet points
        lineSpacing: 18,
        paraSpaceAfter: 12,
        color: '334155' // gray-700
      };
      
      sld.addText(slide.content, bulletOptions);
    });

    await pptx.writeFile({ 
      fileName: `AI-Presentation-${new Date().toLocaleDateString()}.pptx` 
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8 mx-auto">
        {/* Header with icon */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mb-4">
            <SparklesIcon className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Your Presentation is Ready!
          </h2>
          <p className="text-lg text-gray-600">
            Download your AI-generated slides below
          </p>
        </div>

        {/* Card-style download area */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-semibold text-gray-900">
                  Final Presentation
                </h3>
                <p className="text-gray-500">
                  {slides.length} professionally designed slides
                </p>
              </div>
              <div className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-sm font-medium">
                AI-Powered
              </div>
            </div>

            {/* Preview image placeholder */}
            <div className="bg-gray-50 rounded-lg h-48 mb-6 flex items-center justify-center border-2 border-dashed border-gray-200">
              <p className="text-gray-400">Presentation Preview</p>
            </div>

            {/* Download button with icon */}
            <button
              onClick={handleDownload}
              className="w-full flex items-center justify-center px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-semibold text-lg hover:from-blue-600 hover:to-purple-600 transition-all transform hover:scale-[1.01] shadow-lg"
            >
              <ArrowDownTrayIcon className="h-6 w-6 mr-2" />
              Download PowerPoint File
            </button>
          </div>
          
          {/* Footer note */}
          <div className="bg-gray-50 px-8 py-4 border-t border-gray-100">
            <p className="text-sm text-gray-500 text-center">
              Need changes? Go back to edit your slides.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Export;