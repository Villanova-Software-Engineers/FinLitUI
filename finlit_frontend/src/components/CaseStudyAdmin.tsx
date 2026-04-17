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
  setActiveWeek,
} from '../firebase/firestore.service';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { CaseStudyWeekViewer } from './CaseStudyWeekViewer';

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
  const [jsonContent, setJsonContent] = useState<{ [week: number]: CaseStudyContent } | null>(null);
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [weekImages, setWeekImages] = useState<{ [week: number]: { person: File | null; company1: File | null; company2: File | null } }>({});
  const [weekImagePreviews, setWeekImagePreviews] = useState<{ [week: number]: { person: string | null; company1: string | null; company2: string | null } }>({});

  // Preview state
  const [previewCaseStudy, setPreviewCaseStudy] = useState<CaseStudy | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  const [editMode, setEditMode] = useState(false);
  const [editedContent, setEditedContent] = useState<CaseStudyContent | null>(null);

  // File input refs
  const jsonInputRef = useRef<HTMLInputElement>(null);

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

        // Check if it's multi-week format with "weeks" array
        if (content.weeks && Array.isArray(content.weeks)) {
          const weeksObj: { [week: number]: CaseStudyContent } = {};
          content.weeks.forEach((weekContent: CaseStudyContent) => {
            if (weekContent.week) {
              weeksObj[weekContent.week] = weekContent;
            }
          });

          if (Object.keys(weeksObj).length > 0) {
            setJsonContent(weeksObj);
            setJsonError(null);

            // Initialize empty image slots for each week
            const initialImages: typeof weekImages = {};
            const initialPreviews: typeof weekImagePreviews = {};
            Object.keys(weeksObj).forEach(week => {
              const weekNum = Number(week);
              initialImages[weekNum] = { person: null, company1: null, company2: null };
              initialPreviews[weekNum] = { person: null, company1: null, company2: null };
            });
            setWeekImages(initialImages);
            setWeekImagePreviews(initialPreviews);
          } else {
            setJsonError('No valid weeks found in JSON');
          }
        } else {
          setJsonError('Invalid format: Must contain "weeks" array. See sample format.');
        }
      } catch {
        setJsonError('Invalid JSON file');
      }
    };
    reader.readAsText(file);
  };

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    weekNumber: number,
    type: 'person' | 'company1' | 'company2'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const preview = event.target?.result as string;

      setWeekImages(prev => ({
        ...prev,
        [weekNumber]: {
          ...prev[weekNumber],
          [type]: file
        }
      }));

      setWeekImagePreviews(prev => ({
        ...prev,
        [weekNumber]: {
          ...prev[weekNumber],
          [type]: preview
        }
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!jsonContent || !user) {
      setError('Please provide JSON content');
      return;
    }

    // Validate all weeks have images
    const weeks = Object.keys(jsonContent).map(Number);
    for (const week of weeks) {
      const images = weekImages[week];
      if (!images || !images.person || !images.company1 || !images.company2) {
        setError(`Please upload all 3 images for Week ${week}`);
        return;
      }
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await createCaseStudy(
        jsonContent,
        weekImages,
        user.id
      );

      setSuccessMessage('Multi-week case study created successfully!');
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
    setWeekImages({});
    setWeekImagePreviews({});
    setShowForm(false);
    if (jsonInputRef.current) jsonInputRef.current.value = '';
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
        // Set first available week as default
        if (study.weeks) {
          const weeks = Object.keys(study.weeks).map(Number).sort((a, b) => a - b);
          setSelectedWeek(weeks[0] || 1);
        }
        setEditMode(false);
        setShowPreview(true);
      }
    } catch (err) {
      console.error('Error loading preview:', err);
      setError('Failed to load preview');
    }
  };

  const handleEditWeek = () => {
    if (!previewCaseStudy || !previewCaseStudy.weeks) return;
    const weekContent = previewCaseStudy.weeks[selectedWeek];
    if (weekContent) {
      setEditedContent(JSON.parse(JSON.stringify(weekContent))); // Deep copy
      setEditMode(true);
    }
  };

  const handleSaveEdit = async () => {
    if (!previewCaseStudy || !editedContent) return;

    try {
      setIsSubmitting(true);
      const PERMANENT_CASE_STUDY_ID = 'permanent-case-study';

      // Update the specific week content in Firestore
      await updateDoc(doc(db, 'caseStudies', PERMANENT_CASE_STUDY_ID), {
        [`weeks.${selectedWeek}`]: editedContent,
        updatedAt: serverTimestamp(),
      });

      setSuccessMessage(`Week ${selectedWeek} updated successfully!`);
      setEditMode(false);

      // Reload case study
      const updated = await getCaseStudyById(PERMANENT_CASE_STUDY_ID);
      if (updated) {
        setPreviewCaseStudy(updated);
      }
      await loadCaseStudies();
    } catch (err) {
      console.error('Error saving week:', err);
      setError('Failed to save changes');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setEditedContent(null);
  };

  const handleCleanupOldCaseStudies = async () => {
    if (!confirm('This will DELETE all old case studies and keep only the permanent one. Are you sure?')) {
      return;
    }

    try {
      setIsSubmitting(true);
      const PERMANENT_ID = 'permanent-case-study';

      // Get all case studies
      const allStudies = await getAllCaseStudies();

      // Delete all except permanent
      const deletePromises = allStudies
        .filter(cs => cs.id !== PERMANENT_ID)
        .map(cs => deleteCaseStudy(cs.id));

      await Promise.all(deletePromises);

      // Activate the permanent one
      await setActiveCaseStudy(PERMANENT_ID);

      setSuccessMessage(`Cleaned up ${deletePromises.length} old case studies. Permanent case study is now active!`);
      await loadCaseStudies();
    } catch (err) {
      console.error('Error cleaning up:', err);
      setError('Failed to cleanup case studies');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSetActiveWeek = async (caseStudyId: string, weekNumber: number) => {
    try {
      await setActiveWeek(caseStudyId, weekNumber);
      setSuccessMessage(`Week ${weekNumber} is now the active week!`);
      await loadCaseStudies();
    } catch (err) {
      console.error('Error setting active week:', err);
      setError('Failed to set active week');
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
                          {study.weeks ? (
                            <>
                              <span className="px-2 py-1 bg-slate-200 text-slate-700 text-xs font-bold rounded-lg">
                                {Object.keys(study.weeks).length} Weeks
                              </span>
                              <h3 className="font-bold text-slate-800 text-lg">
                                Multi-Week Case Study
                              </h3>
                            </>
                          ) : (
                            <>
                              <span className="px-2 py-1 bg-slate-200 text-slate-700 text-xs font-bold rounded-lg">
                                Week {study.case_study?.week}
                              </span>
                              <h3 className="font-bold text-slate-800 text-lg">
                                {study.case_study?.subject}
                              </h3>
                            </>
                          )}
                        </div>
                        <p className="text-slate-600 mb-3">
                          {study.weeks
                            ? `Weeks: ${Object.keys(study.weeks).sort((a, b) => Number(a) - Number(b)).join(', ')}`
                            : study.case_study?.topic
                          }
                        </p>

                        {study.isActive && study.weeks && (
                          <div className="mb-3 flex items-center gap-2">
                            <span className="text-xs font-semibold text-indigo-700">Active Week:</span>
                            <select
                              value={study.activeWeek || 1}
                              onChange={(e) => handleSetActiveWeek(study.id, Number(e.target.value))}
                              className="px-3 py-1 text-xs font-semibold border-2 border-indigo-400 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                              {Object.keys(study.weeks).map(Number).sort((a, b) => a - b).map(week => (
                                <option key={week} value={week}>Week {week}</option>
                              ))}
                            </select>
                            <span className="text-xs text-slate-500">(Students can access weeks 1-{study.activeWeek || 1})</span>
                          </div>
                        )}

                        <div className="flex items-center gap-4 mb-3">
                          {study.weekImages && study.activeWeek && study.weekImages[study.activeWeek] ? (
                            <>
                              <img
                                src={study.weekImages[study.activeWeek].personImageUrl}
                                alt="Person"
                                className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md"
                              />
                              <img
                                src={study.weekImages[study.activeWeek].companyImageUrl1}
                                alt="Company 1"
                                className="w-12 h-12 rounded-lg object-cover border-2 border-white shadow-md"
                              />
                              <img
                                src={study.weekImages[study.activeWeek].companyImageUrl2}
                                alt="Company 2"
                                className="w-12 h-12 rounded-lg object-cover border-2 border-white shadow-md"
                              />
                            </>
                          ) : (
                            <>
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
                            </>
                          )}
                        </div>
                        <p className="text-xs text-slate-500">
                          Created {study.createdAt.toLocaleDateString()}
                          {study.weeks ? ` | ${Object.keys(study.weeks).length} weeks with content` : ` | ${study.case_study?.quiz?.length || 0} quiz questions`}
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
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 px-4 py-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
              <div className="flex items-start gap-3">
                <AlertTriangle size={18} className="text-indigo-600 mt-0.5" />
                <div className="text-sm text-indigo-700 flex-1">
                  <p className="font-semibold mb-1">How it works:</p>
                  <p><strong>Permanent Case Study System:</strong> There is ONE case study that accumulates all weeks. When you upload a new JSON with weeks 1-11, they become weeks {caseStudies[0]?.weeks ? Math.max(...Object.keys(caseStudies[0].weeks).map(Number)) + 1 : 12}-{caseStudies[0]?.weeks ? Math.max(...Object.keys(caseStudies[0].weeks).map(Number)) + 11 : 22}. Toggle active/inactive with the buttons above. Set which week students can currently access using the week selector.</p>
                </div>
              </div>
            </div>

            {caseStudies.length > 1 && (
              <div className="mt-4 px-4 py-3 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg border border-red-200">
                <div className="flex items-start gap-3">
                  <AlertTriangle size={18} className="text-red-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-red-700 font-semibold mb-2">Old case studies detected!</p>
                    <p className="text-sm text-red-600 mb-3">You have {caseStudies.length - 1} old case studies. Click below to delete them and keep only the permanent one.</p>
                    <button
                      onClick={handleCleanupOldCaseStudies}
                      disabled={isSubmitting}
                      className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold text-sm transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      <Trash2 size={16} />
                      {isSubmitting ? 'Cleaning up...' : 'Delete Old Case Studies'}
                    </button>
                  </div>
                </div>
              </div>
            )}
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
                        <p><strong>Total Weeks:</strong> {Object.keys(jsonContent).length}</p>
                        <p><strong>Weeks:</strong> {Object.keys(jsonContent).map(w => `Week ${w}`).join(', ')}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Image Uploads Per Week */}
                {jsonContent && Object.keys(jsonContent).length > 0 && (
                  <div className="space-y-6">
                    <h4 className="font-bold text-slate-800 text-sm">Upload Images for Each Week</h4>
                    {Object.keys(jsonContent).sort((a, b) => Number(a) - Number(b)).map(weekStr => {
                      const week = Number(weekStr);
                      const weekContent = jsonContent[week];
                      const images = weekImages[week] || {};
                      const previews = weekImagePreviews[week] || {};

                      return (
                        <div key={week} className="p-4 border-2 border-indigo-200 rounded-xl bg-indigo-50/30">
                          <h5 className="font-bold text-indigo-900 mb-3 flex items-center gap-2">
                            <span className="px-2 py-0.5 bg-indigo-600 text-white text-xs rounded">Week {week}</span>
                            <span className="text-sm">{weekContent.subject}</span>
                          </h5>

                          <div className="grid grid-cols-3 gap-3">
                            {/* Person Image */}
                            <div>
                              <label className="block text-xs font-semibold text-slate-700 mb-1">
                                <User className="inline mr-1" size={12} />
                                Person
                              </label>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleImageUpload(e, week, 'person')}
                                className="hidden"
                                id={`person-${week}`}
                              />
                              <label
                                htmlFor={`person-${week}`}
                                className="block w-full aspect-square border-2 border-dashed border-slate-300 rounded-lg hover:border-indigo-400 hover:bg-indigo-50 transition-all duration-200 cursor-pointer overflow-hidden"
                              >
                                {previews.person ? (
                                  <img src={previews.person} alt="Person" className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex flex-col items-center justify-center">
                                    <Image size={20} className="text-slate-400" />
                                    <span className="text-xs text-slate-500 mt-1">Upload</span>
                                  </div>
                                )}
                              </label>
                            </div>

                            {/* Company Image 1 */}
                            <div>
                              <label className="block text-xs font-semibold text-slate-700 mb-1">
                                <Building2 className="inline mr-1" size={12} />
                                Company 1
                              </label>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleImageUpload(e, week, 'company1')}
                                className="hidden"
                                id={`company1-${week}`}
                              />
                              <label
                                htmlFor={`company1-${week}`}
                                className="block w-full aspect-square border-2 border-dashed border-slate-300 rounded-lg hover:border-indigo-400 hover:bg-indigo-50 transition-all duration-200 cursor-pointer overflow-hidden"
                              >
                                {previews.company1 ? (
                                  <img src={previews.company1} alt="Company 1" className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex flex-col items-center justify-center">
                                    <Image size={20} className="text-slate-400" />
                                    <span className="text-xs text-slate-500 mt-1">Upload</span>
                                  </div>
                                )}
                              </label>
                            </div>

                            {/* Company Image 2 */}
                            <div>
                              <label className="block text-xs font-semibold text-slate-700 mb-1">
                                <Sparkles className="inline mr-1" size={12} />
                                Company 2
                              </label>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleImageUpload(e, week, 'company2')}
                                className="hidden"
                                id={`company2-${week}`}
                              />
                              <label
                                htmlFor={`company2-${week}`}
                                className="block w-full aspect-square border-2 border-dashed border-slate-300 rounded-lg hover:border-indigo-400 hover:bg-indigo-50 transition-all duration-200 cursor-pointer overflow-hidden"
                              >
                                {previews.company2 ? (
                                  <img src={previews.company2} alt="Company 2" className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex flex-col items-center justify-center">
                                    <Image size={20} className="text-slate-400" />
                                    <span className="text-xs text-slate-500 mt-1">Upload</span>
                                  </div>
                                )}
                              </label>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

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
                    disabled={isSubmitting || !jsonContent || Object.keys(weekImages).length === 0}
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

        {/* Preview/Edit Modal */}
        {showPreview && previewCaseStudy && (
          <CaseStudyWeekViewer
            caseStudy={previewCaseStudy}
            selectedWeek={selectedWeek}
            onWeekChange={setSelectedWeek}
            editMode={editMode}
            editedContent={editedContent}
            onContentChange={setEditedContent}
            onEdit={handleEditWeek}
            onSave={handleSaveEdit}
            onCancelEdit={handleCancelEdit}
            isSubmitting={isSubmitting}
            onClose={() => {
              setShowPreview(false);
              setPreviewCaseStudy(null);
              setEditMode(false);
              setEditedContent(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default CaseStudyAdmin;

