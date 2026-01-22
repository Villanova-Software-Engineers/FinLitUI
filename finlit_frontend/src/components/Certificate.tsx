import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Download, ArrowLeft, Lock } from 'lucide-react';
import { useAuthContext } from '../auth/context/AuthContext';
import { useModuleScore, MODULES } from '../hooks/useModuleScore';
import { useNavigate } from 'react-router-dom';

const Certificate: React.FC = () => {
  const { user } = useAuthContext();
  const { isModulePassed } = useModuleScore();
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [certificateImage, setCertificateImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const generateCertificate = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas || isGenerating) return;
    
    setIsGenerating(true);
    setError(null);
    setCertificateImage(null);
    
    try {
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Canvas context not available');
      }
      
      // Set canvas dimensions
      canvas.width = 800;
      canvas.height = 600;
      
      // Load the certificate background image with cache busting and retry logic
      const img = new Image();
      
      const loadImageWithRetry = (attempts = 3): Promise<void> => {
        return new Promise((resolve, reject) => {
          const attemptLoad = (attemptsLeft: number) => {
            if (attemptsLeft <= 0) {
              reject(new Error('Failed to load certificate image after multiple attempts'));
              return;
            }
            
            img.onload = () => {
              console.log('Certificate image loaded successfully');
              resolve();
            };
            
            img.onerror = () => {
              console.warn(`Image load attempt failed, ${attemptsLeft - 1} attempts remaining`);
              // Retry with cache busting
              setTimeout(() => attemptLoad(attemptsLeft - 1), 1000);
            };
            
            // Add cache busting parameter
            const cacheBuster = new Date().getTime();
            img.src = `/cert.png?v=${cacheBuster}`;
          };
          
          attemptLoad(attempts);
        });
      };
      
      // Wait for image to load
      await loadImageWithRetry();
      
      // Clear canvas and draw background
      ctx.clearRect(0, 0, 800, 600);
      ctx.drawImage(img, 0, 0, 800, 600);
      
      // Set text properties
      ctx.fillStyle = '#2c3e50';
      ctx.textAlign = 'center';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
      ctx.shadowBlur = 2;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;
      
      // Student Name (at 54% from top)
      ctx.font = 'bold 48px serif';
      const studentName = user?.displayName || user?.email?.split('@')[0] || 'Student';
      ctx.fillText(studentName, 400, 350);
      
      // Date (at 16% from bottom, 45% from left)
      ctx.font = 'bold 24px serif';
      const dateY = 600 - (18 * 6);
      const dateX = 45 * 8;
      ctx.fillText(currentDate, dateX, dateY);
      
      // Certificate ID (at 16% from bottom, 75% from right)
      const certId = `FL-${new Date().getFullYear()}-${user?.id?.slice(0, 6).toUpperCase() || 'CERT01'}`;
      const certX = 800 - (25 * 8);
      ctx.fillText(certId, certX, dateY);
      
      // Convert to image and set state
      const imageData = canvas.toDataURL('image/jpeg', 0.95);
      setCertificateImage(imageData);
      console.log('Certificate generated successfully');
      
    } catch (err) {
      console.error('Certificate generation failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate certificate');
    } finally {
      setIsGenerating(false);
    }
  }, [user, currentDate, isGenerating]);

  const downloadJPG = () => {
    if (!certificateImage) return;
    
    const link = document.createElement('a');
    link.download = `FinLit_Certificate_${user?.displayName?.replace(/\s+/g, '_') || 'Certificate'}.jpg`;
    link.href = certificateImage;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    console.log('Certificate useEffect triggered, user:', user?.displayName || 'No user');
    // Reset states
    setCertificateImage(null);
    setError(null);
    setIsGenerating(false);
    
    const timer = setTimeout(() => {
      console.log('Attempting to generate certificate...');
      if (user) {
        generateCertificate();
      }
    }, 500);
    
    return () => {
      console.log('Cleaning up certificate generation timer');
      clearTimeout(timer);
    };
  }, [user?.id, user?.displayName, user?.email]); // Only depend on specific user properties

  
  // Check if user has completed all modules
  const allModules = Object.values(MODULES);
  const completedModules = allModules.filter(module => isModulePassed(module.id)).length;
  const totalModules = allModules.length-1;
  const hasCompletedAllModules = completedModules === totalModules;
  
  // If not completed, show access denied page
  if (!hasCompletedAllModules) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center gap-2 mb-8 px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
            >
              <ArrowLeft size={20} />
              Back to Dashboard
            </button>
            
            <div className="bg-white/70 backdrop-blur-sm border border-slate-200/60 rounded-2xl p-12 shadow-xl">
              <div className="flex justify-center mb-6">
                <div className="w-24 h-24 bg-gradient-to-r from-slate-300 to-gray-400 rounded-full flex items-center justify-center shadow-lg">
                  <Lock className="text-white" size={48} />
                </div>
              </div>
              
              <h2 className="text-3xl font-bold text-slate-800 mb-4">Certificate Not Yet Available</h2>
              <p className="text-xl text-slate-600 mb-6 leading-relaxed">
                Complete all {totalModules} learning modules to unlock your Financial Literacy Certificate!
              </p>
              
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 mb-8">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Your Progress</h3>
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex-1 bg-slate-200 rounded-full h-4">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-indigo-600 h-4 rounded-full transition-all duration-300"
                      style={{width: `${(completedModules / totalModules) * 100}%`}}
                    ></div>
                  </div>
                  <span className="text-lg font-bold text-slate-800">
                    {completedModules}/{totalModules}
                  </span>
                </div>
                <p className="text-slate-600">
                  {totalModules - completedModules} modules remaining
                </p>
              </div>
              
              <button
                onClick={() => navigate('/game')}
                className="inline-flex items-center gap-3 px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              >
                Continue Learning
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center gap-2 mb-6 px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </button>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white text-xl sm:text-2xl">🏆</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-800 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent text-center">
              Congratulations!
            </h1>
          </div>
          <p className="text-lg sm:text-xl text-slate-600 font-medium px-4">
            You have successfully completed the FinLit Financial Literacy Program
          </p>
        </div>

        {/* Certificate */}
        <div className="flex justify-center mb-8 px-4">
          <div className="relative w-full max-w-4xl">
            {/* Hidden Canvas for generation */}
            <canvas
              ref={canvasRef}
              className="hidden"
            />
            
            {/* Display the generated certificate image */}
            {certificateImage ? (
              <img 
                src={certificateImage} 
                alt="Generated Certificate" 
                className="w-full h-auto object-contain rounded-lg shadow-xl"
                style={{ maxWidth: '800px', width: '100%' }}
              />
            ) : error ? (
              <div className="w-full h-96 bg-red-50 border-2 border-red-200 rounded-lg shadow-xl flex flex-col items-center justify-center p-8">
                <p className="text-red-600 text-center mb-4">
                  Failed to generate certificate: {error}
                </p>
                <button
                  onClick={generateCertificate}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Retry
                </button>
              </div>
            ) : (
              <div className="w-full h-96 bg-gray-100 rounded-lg shadow-xl flex flex-col items-center justify-center">
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                    <p className="text-gray-500">Generating certificate...</p>
                  </>
                ) : (
                  <>
                    <p className="text-gray-500 mb-4">Certificate will load shortly...</p>
                    <button
                      onClick={generateCertificate}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Generate Certificate
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Download Button */}
        <div className="text-center">
          <button
            onClick={downloadJPG}
            disabled={!certificateImage}
            className={`inline-flex items-center gap-3 px-8 py-4 text-lg font-semibold text-white rounded-lg shadow-lg transition-all duration-200 ${
              certificateImage 
                ? 'bg-blue-600 hover:bg-blue-700 hover:shadow-xl' 
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            <Download size={24} />
            {certificateImage 
              ? 'Download Certificate as Image' 
              : error 
                ? 'Certificate Generation Failed'
                : isGenerating 
                  ? 'Generating Certificate...'
                  : 'Preparing Certificate...'
            }
          </button>
          <p className="text-sm text-gray-500 mt-3">
            {error 
              ? 'Please retry certificate generation above' 
              : 'Save your achievement for your records'
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export default Certificate;