import React, { useRef } from 'react';
import { Download, Award, Star, CheckCircle, Calendar, ArrowLeft, Lock } from 'lucide-react';
import { useAuthContext } from '../auth/context/AuthContext';
import { useModuleScore, MODULES } from '../hooks/useModuleScore';
import { useNavigate } from 'react-router-dom';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const Certificate: React.FC = () => {
  const { user } = useAuthContext();
  const { progress, isModulePassed } = useModuleScore();
  const navigate = useNavigate();
  const certificateRef = useRef<HTMLDivElement>(null);

  const downloadPDF = async () => {
    if (!certificateRef.current) return;
    
    try {
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
        allowTaint: true,
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = (pdfHeight - imgHeight * ratio) / 2;
      
      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      pdf.save(`FinLit_Certificate_${user?.displayName?.replace(/\s+/g, '_') || 'Certificate'}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const totalXP = progress?.totalXP ?? 0;
  
  // Check if user has completed all modules
  const allModules = Object.values(MODULES);
  const completedModules = allModules.filter(module => isModulePassed(module.id)).length;
  const totalModules = allModules.length;
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
                <Star size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-8">
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
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center shadow-lg">
              <Award className="text-white" size={32} />
            </div>
            <h1 className="text-4xl font-bold text-slate-800 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Congratulations!
            </h1>
          </div>
          <p className="text-xl text-slate-600 font-medium">
            You have successfully completed the FinLit Financial Literacy Program
          </p>
        </div>

        {/* Certificate */}
        <div className="flex justify-center mb-8">
          <div
            ref={certificateRef}
            className="bg-white border-8 border-gradient-to-r from-emerald-200 to-teal-200 rounded-3xl shadow-2xl p-12 max-w-4xl w-full"
            style={{
              background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
              borderImage: 'linear-gradient(145deg, #10b981, #14b8a6) 1'
            }}
          >
            {/* Certificate Header */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="w-24 h-24 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center shadow-xl">
                    <Award className="text-white" size={48} />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full flex items-center justify-center">
                    <Star className="text-white fill-current" size={16} />
                  </div>
                </div>
              </div>
              
              <h2 className="text-5xl font-bold text-slate-800 mb-2">Certificate of Achievement</h2>
              <div className="w-32 h-1 bg-gradient-to-r from-emerald-500 to-teal-600 mx-auto rounded-full"></div>
            </div>

            {/* Certificate Body */}
            <div className="text-center space-y-6">
              <p className="text-2xl text-slate-700 font-medium">This is to certify that</p>
              
              <div className="py-4">
                <h3 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  {user?.displayName || user?.email?.split('@')[0] || 'Student'}
                </h3>
                <div className="w-64 h-0.5 bg-gradient-to-r from-emerald-500 to-teal-600 mx-auto mt-2"></div>
              </div>

              <p className="text-2xl text-slate-700 font-medium leading-relaxed">
                has successfully completed the comprehensive
              </p>

              <div className="py-4">
                <h4 className="text-3xl font-bold text-slate-800">FinLit Financial Literacy Program</h4>
                <p className="text-lg text-slate-600 mt-2">
                  Mastering Essential Financial Skills for Life Success
                </p>
              </div>

              <div className="grid grid-cols-3 gap-8 my-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="text-blue-600" size={32} />
                  </div>
                  <p className="text-sm font-semibold text-slate-600">All Modules</p>
                  <p className="text-sm text-slate-500">Completed</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-yellow-100 to-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Star className="text-yellow-600 fill-current" size={32} />
                  </div>
                  <p className="text-sm font-semibold text-slate-600">{totalXP} XP</p>
                  <p className="text-sm text-slate-500">Total Earned</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Calendar className="text-emerald-600" size={32} />
                  </div>
                  <p className="text-sm font-semibold text-slate-600">{currentDate}</p>
                  <p className="text-sm text-slate-500">Date Earned</p>
                </div>
              </div>

              <p className="text-lg text-slate-600 leading-relaxed max-w-3xl mx-auto">
                This achievement represents a comprehensive understanding of budgeting, investing, 
                credit management, debt strategies, insurance, and financial planning principles 
                essential for building long-term financial wellness.
              </p>
            </div>

            {/* Certificate Footer */}
            <div className="flex justify-between items-end mt-12">
              <div className="text-left">
                <div className="w-32 h-0.5 bg-slate-300 mb-2"></div>
                <p className="text-sm font-semibold text-slate-600">FinLit Program</p>
                <p className="text-xs text-slate-500">Authorized Institution</p>
              </div>
              
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center shadow-lg mb-2">
                  <span className="text-white font-bold text-xl">FL</span>
                </div>
                <p className="text-xs text-slate-500">Official Seal</p>
              </div>
              
              <div className="text-right">
                <div className="w-32 h-0.5 bg-slate-300 mb-2"></div>
                <p className="text-sm font-semibold text-slate-600">Certificate ID</p>
                <p className="text-xs text-slate-500 font-mono">
                  FL-{new Date().getFullYear()}-{user?.id?.slice(0, 8).toUpperCase() || 'CERT001'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Download Button */}
        <div className="text-center">
          <button
            onClick={downloadPDF}
            className="inline-flex items-center gap-3 px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
          >
            <Download size={24} />
            Download Certificate as PDF
          </button>
          <p className="text-sm text-slate-500 mt-3">
            Save your achievement to share with employers, schools, or for your personal records
          </p>
        </div>

        {/* Achievement Summary */}
        <div className="mt-12 bg-white/70 backdrop-blur-sm border border-slate-200/60 rounded-2xl p-8 shadow-lg">
          <h3 className="text-2xl font-bold text-slate-800 mb-6 text-center">Your Learning Journey</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
              <p className="text-3xl font-bold text-blue-600">8</p>
              <p className="text-sm text-slate-600">Modules Mastered</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl">
              <p className="text-3xl font-bold text-emerald-600">{totalXP}</p>
              <p className="text-sm text-slate-600">Experience Points</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl">
              <p className="text-3xl font-bold text-yellow-600">{progress?.streak ?? 0}</p>
              <p className="text-sm text-slate-600">Day Streak</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
              <p className="text-3xl font-bold text-purple-600">100%</p>
              <p className="text-sm text-slate-600">Completion Rate</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Certificate;