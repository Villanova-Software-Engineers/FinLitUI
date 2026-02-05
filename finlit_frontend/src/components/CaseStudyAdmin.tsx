/**
 * Case Study Admin Page
 * Manage weekly case study uploads for students
 * NOTE: Only super admin (owner) can add/edit/delete case studies
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Edit3,
  Check,
  XCircle,
  Loader2,
  BookOpen,
  CheckCircle,
  AlertTriangle,
  Upload,
  Image,
  FileJson,
  Eye,
  EyeOff,
  ChevronRight,
  User,
  Building2,
  Sparkles,
} from 'lucide-react';
import { useAuthContext } from '../auth/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import type { CaseStudy, CaseStudyContent } from '../auth/types/auth.types';
import {
  getAllCaseStudies,
  createCaseStudy,
  deleteCaseStudy,
  setActiveCaseStudy,
  deactivateCaseStudy,
  getCaseStudyById,
} from '../firebase/firestore.service';

const CaseStudyAdmin: React.FC = () => {
  const { user } = useAuthContext();
  const navigate = useNavigate();

  // State
  const [caseStudies, setCaseStudies] = useState<CaseStudy[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form state
  const [jsonContent, setJsonContent] = useState<CaseStudyContent | null>(null);
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [personImage, setPersonImage] = useState<File | null>(null);
  const [companyImage1, setCompanyImage1] = useState<File | null>(null);
  const [companyImage2, setCompanyImage2] = useState<File | null>(null);
  const [personImagePreview, setPersonImagePreview] = useState<string | null>(null);
  const [companyImage1Preview, setCompanyImage1Preview] = useState<string | null>(null);
  const [companyImage2Preview, setCompanyImage2Preview] = useState<string | null>(null);

  // Preview state
  const [previewCaseStudy, setPreviewCaseStudy] = useState<CaseStudy | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // File input refs
  const jsonInputRef = useRef<HTMLInputElement>(null);
  const personImageRef = useRef<HTMLInputElement>(null);
  const companyImage1Ref = useRef<HTMLInputElement>(null);
  const companyImage2Ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user?.role !== 'owner') {
      navigate('/auth');
      return;
    }
    loadCaseStudies();
  }, [user, navigate]);

  const loadCaseStudies = async () => {
    setLoading(true);
    try {
      const studies = await getAllCaseStudies();
      setCaseStudies(studies);
    } catch (err) {
      console.error('Error loading case studies:', err);
      setError('Failed to load case studies');
    } finally {
      setLoading(false);
    }
  };

  const handleJsonUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = JSON.parse(event.target?.result as string);
        if (content.case_study) {
          setJsonContent(content.case_study);
          setJsonError(null);
        } else {
          setJsonError('Invalid format: Missing "case_study" key');
        }
      } catch {
        setJsonError('Invalid JSON file');
      }
    };
    reader.readAsText(file);
  };

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'person' | 'company1' | 'company2'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const preview = event.target?.result as string;
      switch (type) {
        case 'person':
          setPersonImage(file);
          setPersonImagePreview(preview);
          break;
        case 'company1':
          setCompanyImage1(file);
          setCompanyImage1Preview(preview);
          break;
        case 'company2':
          setCompanyImage2(file);
          setCompanyImage2Preview(preview);
          break;
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!jsonContent || !personImage || !companyImage1 || !companyImage2 || !user) {
      setError('Please provide JSON content and all 3 images');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await createCaseStudy(
        jsonContent,
        personImage,
        companyImage1,
        companyImage2,
        user.id
      );

      setSuccessMessage('Case study created successfully!');
      resetForm();
      await loadCaseStudies();
    } catch (err) {
      console.error('Error creating case study:', err);
      setError('Failed to create case study');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setJsonContent(null);
    setJsonError(null);
    setPersonImage(null);
    setCompanyImage1(null);
    setCompanyImage2(null);
    setPersonImagePreview(null);
    setCompanyImage1Preview(null);
    setCompanyImage2Preview(null);
    setShowForm(false);
    if (jsonInputRef.current) jsonInputRef.current.value = '';
    if (personImageRef.current) personImageRef.current.value = '';
    if (companyImage1Ref.current) companyImage1Ref.current.value = '';
    if (companyImage2Ref.current) companyImage2Ref.current.value = '';
  };

  const handleDelete = async (caseStudyId: string) => {
    if (!confirm('Are you sure you want to delete this case study? This action cannot be undone.')) return;

    try {
      await deleteCaseStudy(caseStudyId);
      setSuccessMessage('Case study deleted successfully!');
      await loadCaseStudies();
    } catch (err) {
      console.error('Error deleting case study:', err);
      setError('Failed to delete case study');
    }
  };

  const handleSetActive = async (caseStudyId: string) => {
    try {
      await setActiveCaseStudy(caseStudyId);
      setSuccessMessage('Case study is now active and visible to students!');
      await loadCaseStudies();
    } catch (err) {
      console.error('Error setting active case study:', err);
      setError('Failed to activate case study');
    }
  };

  const handleDeactivate = async (caseStudyId: string) => {
    try {
      await deactivateCaseStudy(caseStudyId);
      setSuccessMessage('Case study deactivated');
      await loadCaseStudies();
    } catch (err) {
      console.error('Error deactivating case study:', err);
      setError('Failed to deactivate case study');
    }
  };

  const handlePreview = async (caseStudyId: string) => {
    try {
      const study = await getCaseStudyById(caseStudyId);
      if (study) {
        setPreviewCaseStudy(study);
        setShowPreview(true);
      }
    } catch (err) {
      console.error('Error loading preview:', err);
      setError('Failed to load preview');
    }
  };

  // Clear messages after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  if (!user || user.role !== 'owner') return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/30 p-4 sm:p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin')}
              className="p-2 hover:bg-white/60 rounded-lg transition-colors"
              title="Back to Admin Dashboard"
            >
              <ArrowLeft size={20} className="text-slate-700" />
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Case Study Manager
              </h1>
              <p className="text-slate-600 mt-1 text-sm sm:text-base font-medium">
                Upload and manage weekly case studies for students
              </p>
            </div>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 px-5 py-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200/60 rounded-xl text-sm text-red-700 flex items-center gap-3 shadow-sm">
            <XCircle size={18} className="text-red-500" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 px-5 py-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200/60 rounded-xl text-sm text-green-700 flex items-center gap-3 shadow-sm">
            <CheckCircle size={18} className="text-green-500" />
            <span className="font-medium">{successMessage}</span>
          </div>
        )}

        {/* Main Content */}
        <div className="bg-white/70 backdrop-blur-sm border border-slate-200/60 rounded-2xl shadow-xl mb-8">
          <div className="px-6 py-5 border-b border-slate-200/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <BookOpen className="text-white" size={20} />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-800">Case Studies</h2>
              <span className="px-3 py-1 bg-slate-100 rounded-full text-sm font-semibold text-slate-600">
                {caseStudies.length} total
              </span>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-semibold rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 shadow-lg"
            >
              <Plus size={18} />
              Add Case Study
            </button>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="text-center py-12">
                <Loader2 className="animate-spin mx-auto text-indigo-600" size={32} />
                <p className="text-slate-600 mt-3">Loading case studies...</p>
              </div>
            ) : caseStudies.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="text-indigo-600" size={40} />
                </div>
                <h3 className="text-lg font-bold text-slate-700 mb-2">No case studies yet</h3>
                <p className="text-slate-500">Upload your first weekly case study to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {caseStudies.map((study) => (
                  <div
                    key={study.id}
                    className={`border rounded-xl p-5 transition-all duration-200 ${
                      study.isActive
                        ? 'border-indigo-400 bg-gradient-to-r from-indigo-50 to-purple-50'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          {study.isActive && (
                            <span className="px-2 py-1 bg-indigo-500 text-white text-xs font-bold rounded-lg">
                              ACTIVE
                            </span>
                          )}
                          <span className="px-2 py-1 bg-slate-200 text-slate-700 text-xs font-bold rounded-lg">
                            Week {study.case_study.week}
                          </span>
                          <h3 className="font-bold text-slate-800 text-lg">
                            {study.case_study.subject}
                          </h3>
                        </div>
                        <p className="text-slate-600 mb-3">{study.case_study.topic}</p>
                        <div className="flex items-center gap-4 mb-3">
                          <img
                            src={study.personImageUrl}
                            alt="Person"
                            className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md"
                          />
                          <img
                            src={study.companyImageUrl1}
                            alt="Company 1"
                            className="w-12 h-12 rounded-lg object-cover border-2 border-white shadow-md"
                          />
                          <img
                            src={study.companyImageUrl2}
                            alt="Company 2"
                            className="w-12 h-12 rounded-lg object-cover border-2 border-white shadow-md"
                          />
                        </div>
                        <p className="text-xs text-slate-500">
                          Created {study.createdAt.toLocaleDateString()} | {study.case_study.quiz.length} quiz questions
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handlePreview(study.id)}
                          className="p-2 hover:bg-indigo-100 rounded-lg transition-colors text-indigo-600"
                          title="Preview"
                        >
                          <Eye size={18} />
                        </button>
                        {study.isActive ? (
                          <button
                            onClick={() => handleDeactivate(study.id)}
                            className="p-2 hover:bg-orange-100 rounded-lg transition-colors text-orange-600"
                            title="Deactivate"
                          >
                            <EyeOff size={18} />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleSetActive(study.id)}
                            className="p-2 hover:bg-green-100 rounded-lg transition-colors text-green-600"
                            title="Set as Active"
                          >
                            <CheckCircle size={18} />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(study.id)}
                          className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-600"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 px-4 py-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
              <div className="flex items-start gap-3">
                <AlertTriangle size={18} className="text-indigo-600 mt-0.5" />
                <div className="text-sm text-indigo-700">
                  <p className="font-semibold mb-1">How it works:</p>
                  <p>Only one case study can be active at a time. The active case study will be visible to all students. Use the Preview button to test before making it live.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Add Case Study Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl max-w-3xl w-full border border-slate-200/60 max-h-[90vh] overflow-y-auto">
              <div className="px-6 py-5 border-b border-slate-200/60 bg-gradient-to-r from-slate-50 to-indigo-50">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-3">
                  <BookOpen className="text-indigo-600" size={20} />
                  Add New Case Study
                </h3>
              </div>

              <div className="p-6 space-y-6">
                {/* JSON Upload */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    <FileJson className="inline mr-2" size={16} />
                    Upload JSON File
                  </label>
                  <input
                    ref={jsonInputRef}
                    type="file"
                    accept=".json"
                    onChange={handleJsonUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => jsonInputRef.current?.click()}
                    className="w-full px-4 py-8 border-2 border-dashed border-slate-300 rounded-xl hover:border-indigo-400 hover:bg-indigo-50/50 transition-all duration-200 flex flex-col items-center gap-2"
                  >
                    <Upload size={24} className="text-slate-400" />
                    <span className="text-sm text-slate-600">
                      {jsonContent ? `Loaded: Week ${jsonContent.week} - ${jsonContent.subject}` : 'Click to upload JSON file'}
                    </span>
                  </button>
                  {jsonError && (
                    <p className="text-red-500 text-sm mt-2">{jsonError}</p>
                  )}
                  {jsonContent && (
                    <div className="mt-3 p-4 bg-green-50 border border-green-200 rounded-xl">
                      <div className="flex items-center gap-2 text-green-700">
                        <CheckCircle size={16} />
                        <span className="font-semibold">JSON Loaded Successfully</span>
                      </div>
                      <div className="mt-2 text-sm text-green-600">
                        <p><strong>Week:</strong> {jsonContent.week}</p>
                        <p><strong>Subject:</strong> {jsonContent.subject}</p>
                        <p><strong>Topic:</strong> {jsonContent.topic}</p>
                        <p><strong>Quiz Questions:</strong> {jsonContent.quiz?.length || 0}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Image Uploads */}
                <div className="grid grid-cols-3 gap-4">
                  {/* Person Image */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      <User className="inline mr-1" size={14} />
                      Person Image
                    </label>
                    <input
                      ref={personImageRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'person')}
                      className="hidden"
                    />
                    <button
                      onClick={() => personImageRef.current?.click()}
                      className="w-full aspect-square border-2 border-dashed border-slate-300 rounded-xl hover:border-indigo-400 hover:bg-indigo-50/50 transition-all duration-200 flex flex-col items-center justify-center overflow-hidden"
                    >
                      {personImagePreview ? (
                        <img src={personImagePreview} alt="Person" className="w-full h-full object-cover" />
                      ) : (
                        <>
                          <Image size={24} className="text-slate-400" />
                          <span className="text-xs text-slate-500 mt-1">Upload</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Company Image 1 */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      <Building2 className="inline mr-1" size={14} />
                      Company Image 1
                    </label>
                    <input
                      ref={companyImage1Ref}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'company1')}
                      className="hidden"
                    />
                    <button
                      onClick={() => companyImage1Ref.current?.click()}
                      className="w-full aspect-square border-2 border-dashed border-slate-300 rounded-xl hover:border-indigo-400 hover:bg-indigo-50/50 transition-all duration-200 flex flex-col items-center justify-center overflow-hidden"
                    >
                      {companyImage1Preview ? (
                        <img src={companyImage1Preview} alt="Company 1" className="w-full h-full object-cover" />
                      ) : (
                        <>
                          <Image size={24} className="text-slate-400" />
                          <span className="text-xs text-slate-500 mt-1">Upload</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Company Image 2 */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      <Sparkles className="inline mr-1" size={14} />
                      Company Image 2
                    </label>
                    <input
                      ref={companyImage2Ref}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'company2')}
                      className="hidden"
                    />
                    <button
                      onClick={() => companyImage2Ref.current?.click()}
                      className="w-full aspect-square border-2 border-dashed border-slate-300 rounded-xl hover:border-indigo-400 hover:bg-indigo-50/50 transition-all duration-200 flex flex-col items-center justify-center overflow-hidden"
                    >
                      {companyImage2Preview ? (
                        <img src={companyImage2Preview} alt="Company 2" className="w-full h-full object-cover" />
                      ) : (
                        <>
                          <Image size={24} className="text-slate-400" />
                          <span className="text-xs text-slate-500 mt-1">Upload</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 py-3 text-sm font-semibold text-slate-600 border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting || !jsonContent || !personImage || !companyImage1 || !companyImage2}
                    className="flex-1 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-semibold rounded-xl hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Plus size={16} />
                        Create Case Study
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Preview Modal */}
        {showPreview && previewCaseStudy && (
          <CaseStudyPreview
            caseStudy={previewCaseStudy}
            onClose={() => {
              setShowPreview(false);
              setPreviewCaseStudy(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

// Preview Component
interface CaseStudyPreviewProps {
  caseStudy: CaseStudy;
  onClose: () => void;
}

const CaseStudyPreview: React.FC<CaseStudyPreviewProps> = ({ caseStudy, onClose }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const content = caseStudy.case_study;

  const pages = [
    { title: 'Introduction', key: 'intro' },
    { title: content.who_is_this.title, key: 'who' },
    { title: content.what_happened.title, key: 'what' },
    { title: content.money_idea.title, key: 'money' },
    { title: 'Quiz', key: 'quiz' },
  ];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Preview Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-indigo-500 to-purple-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Eye size={20} />
            <span className="font-bold">Preview Mode</span>
            <span className="px-2 py-1 bg-white/20 rounded text-xs">Week {content.week}</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <XCircle size={20} />
          </button>
        </div>

        {/* Page Navigation */}
        <div className="px-6 py-3 border-b border-slate-200 bg-slate-50 flex items-center gap-2 overflow-x-auto">
          {pages.map((page, index) => (
            <button
              key={page.key}
              onClick={() => setCurrentPage(index)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                currentPage === index
                  ? 'bg-indigo-500 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-100'
              }`}
            >
              {index + 1}. {page.title}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {currentPage === 0 && (
            <div className="text-center space-y-6">
              <img
                src={caseStudy.personImageUrl}
                alt={content.subject}
                className="w-48 h-48 rounded-full object-cover mx-auto shadow-2xl border-4 border-white"
              />
              <div>
                <h1 className="text-3xl font-bold text-slate-800 mb-2">{content.subject}</h1>
                <p className="text-xl text-indigo-600 font-medium">{content.topic}</p>
              </div>
              <div className="flex justify-center gap-4">
                <img
                  src={caseStudy.companyImageUrl1}
                  alt="Company 1"
                  className="w-24 h-24 rounded-xl object-cover shadow-lg"
                />
                <img
                  src={caseStudy.companyImageUrl2}
                  alt="Company 2"
                  className="w-24 h-24 rounded-xl object-cover shadow-lg"
                />
              </div>
            </div>
          )}

          {currentPage === 1 && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <img
                  src={caseStudy.personImageUrl}
                  alt={content.subject}
                  className="w-20 h-20 rounded-full object-cover shadow-lg"
                />
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">{content.who_is_this.title}</h2>
                  <p className="text-indigo-600">{content.subject}</p>
                </div>
              </div>
              <p className="text-slate-700 leading-relaxed text-lg">{content.who_is_this.content}</p>
            </div>
          )}

          {currentPage === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-800">{content.what_happened.title}</h2>
              <p className="text-slate-700 leading-relaxed text-lg">{content.what_happened.content}</p>
              <div className="flex gap-4 mt-6">
                <img
                  src={caseStudy.companyImageUrl1}
                  alt="Company 1"
                  className="w-32 h-32 rounded-xl object-cover shadow-lg"
                />
                <img
                  src={caseStudy.companyImageUrl2}
                  alt="Company 2"
                  className="w-32 h-32 rounded-xl object-cover shadow-lg"
                />
              </div>
            </div>
          )}

          {currentPage === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-800">{content.money_idea.title}</h2>

              <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-200">
                <h3 className="font-bold text-indigo-800 mb-2">What It Means</h3>
                <p className="text-slate-700">{content.money_idea.what_it_means}</p>
              </div>

              <div className="bg-green-50 p-6 rounded-xl border border-green-200">
                <h3 className="font-bold text-green-800 mb-2">Why It Matters</h3>
                <p className="text-slate-700">{content.money_idea.why_it_matters}</p>
              </div>

              {content.money_idea.formula && (
                <div className="bg-purple-50 p-6 rounded-xl border border-purple-200">
                  <h3 className="font-bold text-purple-800 mb-2">Formula</h3>
                  <p className="text-slate-700 font-mono">{content.money_idea.formula}</p>
                </div>
              )}

              <div className="bg-red-50 p-6 rounded-xl border border-red-200">
                <h3 className="font-bold text-red-800 mb-2">Risk</h3>
                <p className="text-slate-700">{content.money_idea.risk}</p>
              </div>

              <div className="bg-amber-50 p-6 rounded-xl border border-amber-200">
                <h3 className="font-bold text-amber-800 mb-2">Real Life Example</h3>
                <p className="text-slate-700">{content.money_idea.real_life}</p>
              </div>
            </div>
          )}

          {currentPage === 4 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-800">Quiz ({content.quiz.length} Questions)</h2>
              <div className="space-y-4">
                {content.quiz.map((q, idx) => (
                  <div key={idx} className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                    <p className="font-semibold text-slate-800 mb-3">
                      {idx + 1}. {q.question}
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {q.options.map((opt, optIdx) => (
                        <div
                          key={optIdx}
                          className={`px-4 py-2 rounded-lg text-sm ${
                            opt === q.answer
                              ? 'bg-green-100 text-green-700 font-semibold border border-green-300'
                              : 'bg-white text-slate-600 border border-slate-200'
                          }`}
                        >
                          {opt}
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-slate-500 mt-3 italic">
                      Teaching Point: {q.teaching_point}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Navigation Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
            disabled={currentPage === 0}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          <span className="text-sm text-slate-500">
            Page {currentPage + 1} of {pages.length}
          </span>
          <button
            onClick={() => setCurrentPage(Math.min(pages.length - 1, currentPage + 1))}
            disabled={currentPage === pages.length - 1}
            className="px-4 py-2 text-sm font-medium bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
          >
            Next
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CaseStudyAdmin;
