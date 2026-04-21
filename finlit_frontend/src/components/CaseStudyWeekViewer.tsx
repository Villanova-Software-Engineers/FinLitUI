import React, { useState, useRef } from 'react';
import { XCircle, Eye, Edit3, Save, X, ChevronRight, Upload, Image, Loader2 } from 'lucide-react';
import type { CaseStudy, CaseStudyContent } from '../auth/types/auth.types';
import { updateCaseStudyWeekImage } from '../firebase/firestore.service';

interface CaseStudyWeekViewerProps {
  caseStudy: CaseStudy;
  selectedWeek: number;
  onWeekChange: (week: number) => void;
  editMode: boolean;
  editedContent: CaseStudyContent | null;
  onContentChange: (content: CaseStudyContent) => void;
  onEdit: () => void;
  onSave: () => void;
  onCancelEdit: () => void;
  isSubmitting: boolean;
  onClose: () => void;
}

export const CaseStudyWeekViewer: React.FC<CaseStudyWeekViewerProps> = ({
  caseStudy,
  selectedWeek,
  onWeekChange,
  editMode,
  editedContent,
  onContentChange,
  onEdit,
  onSave,
  onCancelEdit,
  isSubmitting,
  onClose,
}) => {
  const [currentSection, setCurrentSection] = useState(0);
  const [uploadingImage, setUploadingImage] = useState<string | null>(null);
  const [localImageUrls, setLocalImageUrls] = useState<{
    personImageUrl?: string;
    companyImageUrl1?: string;
    companyImageUrl2?: string;
  }>({});

  const personInputRef = useRef<HTMLInputElement>(null);
  const company1InputRef = useRef<HTMLInputElement>(null);
  const company2InputRef = useRef<HTMLInputElement>(null);

  // Get content for the selected week
  const weeksData = caseStudy.weeks as Record<string | number, typeof editedContent> | undefined;
  const weekContent = editMode && editedContent
    ? editedContent
    : weeksData?.[selectedWeek] || weeksData?.[String(selectedWeek)];

  if (!weekContent) {
    return null;
  }

  const weekImagesData = caseStudy.weekImages as Record<string | number, any> | undefined;
  const weekImageData = weekImagesData?.[selectedWeek] || weekImagesData?.[String(selectedWeek)];

  // Merge local (newly uploaded) images with existing ones
  const displayImages = {
    personImageUrl: localImageUrls.personImageUrl || weekImageData?.personImageUrl || '',
    companyImageUrl1: localImageUrls.companyImageUrl1 || weekImageData?.companyImageUrl1 || '',
    companyImageUrl2: localImageUrls.companyImageUrl2 || weekImageData?.companyImageUrl2 || '',
  };

  const handleImageUpload = async (
    imageType: 'person' | 'company1' | 'company2',
    file: File
  ) => {
    if (!file) return;

    setUploadingImage(imageType);
    try {
      const newUrl = await updateCaseStudyWeekImage(
        caseStudy.id,
        selectedWeek,
        imageType,
        file
      );

      // Update local state to show the new image immediately
      const fieldName = imageType === 'person'
        ? 'personImageUrl'
        : imageType === 'company1'
          ? 'companyImageUrl1'
          : 'companyImageUrl2';

      setLocalImageUrls(prev => ({
        ...prev,
        [fieldName]: newUrl,
      }));
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploadingImage(null);
    }
  };

  const sections = [
    { title: 'Overview', key: 'overview' },
    { title: 'Who is this?', key: 'who' },
    { title: 'What happened?', key: 'what' },
    { title: 'Money Idea', key: 'money' },
    { title: 'Quiz', key: 'quiz' },
  ];

  const availableWeeks = caseStudy.weeks
    ? Object.keys(caseStudy.weeks).map(Number).sort((a, b) => a - b)
    : [];

  const handleFieldChange = (path: string, value: string) => {
    if (!editedContent || !onContentChange) return;

    const keys = path.split('.');
    const updated = JSON.parse(JSON.stringify(editedContent));

    let current: any = updated;
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;

    onContentChange(updated);
  };

  const handleQuizChange = (questionIndex: number, field: string, value: string | string[]) => {
    if (!editedContent || !onContentChange) return;

    const updated = JSON.parse(JSON.stringify(editedContent));
    if (field === 'options') {
      updated.quiz[questionIndex].options = value;
    } else {
      updated.quiz[questionIndex][field] = value;
    }
    onContentChange(updated);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-indigo-500 to-purple-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            {editMode ? <Edit3 size={20} /> : <Eye size={20} />}
            <span className="font-bold">{editMode ? 'Edit Mode' : 'View Mode'}</span>

            {/* Week Selector */}
            <select
              value={selectedWeek}
              onChange={(e) => onWeekChange(Number(e.target.value))}
              disabled={editMode}
              className="px-3 py-1 bg-white/20 border border-white/30 rounded-lg text-sm font-semibold disabled:opacity-50"
            >
              {availableWeeks.map(week => (
                <option key={week} value={week} className="text-gray-900">
                  Week {week}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            {!editMode ? (
              <button
                onClick={onEdit}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
              >
                <Edit3 size={16} />
                Edit Week
              </button>
            ) : (
              <>
                <button
                  onClick={onCancelEdit}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium disabled:opacity-50"
                >
                  <X size={16} />
                  Cancel
                </button>
                <button
                  onClick={onSave}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium disabled:opacity-50"
                >
                  <Save size={16} />
                  {isSubmitting ? 'Saving...' : 'Save'}
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <XCircle size={20} />
            </button>
          </div>
        </div>

        {/* Section Navigation */}
        <div className="px-6 py-3 border-b border-slate-200 bg-slate-50 flex items-center gap-2 overflow-x-auto">
          {sections.map((section, index) => (
            <button
              key={section.key}
              onClick={() => setCurrentSection(index)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                currentSection === index
                  ? 'bg-indigo-500 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-100'
              }`}
            >
              {section.title}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Overview */}
          {currentSection === 0 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-800">Week {weekContent.week} Overview</h2>

              {editMode ? (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Subject</label>
                    <input
                      type="text"
                      value={editedContent?.subject || ''}
                      onChange={(e) => handleFieldChange('subject', e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Topic</label>
                    <input
                      type="text"
                      value={editedContent?.topic || ''}
                      onChange={(e) => handleFieldChange('topic', e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  {/* Image Upload Section */}
                  <div className="border-t border-slate-200 pt-6 mt-6">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                      <Image size={20} />
                      Week Images
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Person Image */}
                      <div className="space-y-3">
                        <label className="block text-sm font-semibold text-slate-700">Person Image</label>
                        <div className="relative group">
                          <div className="w-full aspect-square rounded-xl overflow-hidden bg-slate-100 border-2 border-dashed border-slate-300">
                            {displayImages.personImageUrl ? (
                              <img
                                src={displayImages.personImageUrl}
                                alt="Person"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-400">
                                <Image size={48} />
                              </div>
                            )}
                            {uploadingImage === 'person' && (
                              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                <Loader2 className="w-8 h-8 text-white animate-spin" />
                              </div>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => personInputRef.current?.click()}
                            disabled={uploadingImage !== null}
                            className="mt-2 w-full px-3 py-2 bg-indigo-500 text-white rounded-lg text-sm font-medium hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                          >
                            <Upload size={16} />
                            {displayImages.personImageUrl ? 'Replace' : 'Upload'}
                          </button>
                          <input
                            ref={personInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleImageUpload('person', file);
                              e.target.value = '';
                            }}
                          />
                        </div>
                      </div>

                      {/* Company Image 1 */}
                      <div className="space-y-3">
                        <label className="block text-sm font-semibold text-slate-700">Company Image 1</label>
                        <div className="relative group">
                          <div className="w-full aspect-square rounded-xl overflow-hidden bg-slate-100 border-2 border-dashed border-slate-300">
                            {displayImages.companyImageUrl1 ? (
                              <img
                                src={displayImages.companyImageUrl1}
                                alt="Company 1"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-400">
                                <Image size={48} />
                              </div>
                            )}
                            {uploadingImage === 'company1' && (
                              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                <Loader2 className="w-8 h-8 text-white animate-spin" />
                              </div>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => company1InputRef.current?.click()}
                            disabled={uploadingImage !== null}
                            className="mt-2 w-full px-3 py-2 bg-indigo-500 text-white rounded-lg text-sm font-medium hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                          >
                            <Upload size={16} />
                            {displayImages.companyImageUrl1 ? 'Replace' : 'Upload'}
                          </button>
                          <input
                            ref={company1InputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleImageUpload('company1', file);
                              e.target.value = '';
                            }}
                          />
                        </div>
                      </div>

                      {/* Company Image 2 */}
                      <div className="space-y-3">
                        <label className="block text-sm font-semibold text-slate-700">Company Image 2</label>
                        <div className="relative group">
                          <div className="w-full aspect-square rounded-xl overflow-hidden bg-slate-100 border-2 border-dashed border-slate-300">
                            {displayImages.companyImageUrl2 ? (
                              <img
                                src={displayImages.companyImageUrl2}
                                alt="Company 2"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-400">
                                <Image size={48} />
                              </div>
                            )}
                            {uploadingImage === 'company2' && (
                              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                <Loader2 className="w-8 h-8 text-white animate-spin" />
                              </div>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => company2InputRef.current?.click()}
                            disabled={uploadingImage !== null}
                            className="mt-2 w-full px-3 py-2 bg-indigo-500 text-white rounded-lg text-sm font-medium hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                          >
                            <Upload size={16} />
                            {displayImages.companyImageUrl2 ? 'Replace' : 'Upload'}
                          </button>
                          <input
                            ref={company2InputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleImageUpload('company2', file);
                              e.target.value = '';
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 mt-4">
                      Images are uploaded immediately when selected. Supported formats: JPG, PNG, GIF, WebP
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-200">
                    <h3 className="font-bold text-indigo-800 text-lg mb-2">{weekContent.subject}</h3>
                    <p className="text-slate-700">{weekContent.topic}</p>
                  </div>

                  {(displayImages.personImageUrl || displayImages.companyImageUrl1 || displayImages.companyImageUrl2) && (
                    <div className="flex gap-4 justify-center">
                      {displayImages.personImageUrl && (
                        <img
                          src={displayImages.personImageUrl}
                          alt="Person"
                          className="w-32 h-32 rounded-full object-cover shadow-lg border-4 border-white"
                        />
                      )}
                      {displayImages.companyImageUrl1 && (
                        <img
                          src={displayImages.companyImageUrl1}
                          alt="Company 1"
                          className="w-32 h-32 rounded-xl object-cover shadow-lg"
                        />
                      )}
                      {displayImages.companyImageUrl2 && (
                        <img
                          src={displayImages.companyImageUrl2}
                          alt="Company 2"
                          className="w-32 h-32 rounded-xl object-cover shadow-lg"
                        />
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Who is this */}
          {currentSection === 1 && (
            <div className="space-y-6">
              {editMode ? (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Title</label>
                    <input
                      type="text"
                      value={editedContent?.who_is_this?.title || ''}
                      onChange={(e) => handleFieldChange('who_is_this.title', e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Content</label>
                    <textarea
                      value={editedContent?.who_is_this?.content || ''}
                      onChange={(e) => handleFieldChange('who_is_this.content', e.target.value)}
                      rows={10}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-slate-800">{weekContent.who_is_this.title}</h2>
                  <p className="text-slate-700 leading-relaxed text-lg whitespace-pre-wrap">{weekContent.who_is_this.content}</p>
                </>
              )}
            </div>
          )}

          {/* What happened */}
          {currentSection === 2 && (
            <div className="space-y-6">
              {editMode ? (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Title</label>
                    <input
                      type="text"
                      value={editedContent?.what_happened?.title || ''}
                      onChange={(e) => handleFieldChange('what_happened.title', e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Content</label>
                    <textarea
                      value={editedContent?.what_happened?.content || ''}
                      onChange={(e) => handleFieldChange('what_happened.content', e.target.value)}
                      rows={10}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-slate-800">{weekContent.what_happened.title}</h2>
                  <p className="text-slate-700 leading-relaxed text-lg whitespace-pre-wrap">{weekContent.what_happened.content}</p>
                </>
              )}
            </div>
          )}

          {/* Money Idea */}
          {currentSection === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-800">{weekContent.money_idea.title}</h2>

              {editMode ? (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Title</label>
                    <input
                      type="text"
                      value={editedContent?.money_idea?.title || ''}
                      onChange={(e) => handleFieldChange('money_idea.title', e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">What It Means</label>
                    <textarea
                      value={editedContent?.money_idea?.what_it_means || ''}
                      onChange={(e) => handleFieldChange('money_idea.what_it_means', e.target.value)}
                      rows={4}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Why It Matters</label>
                    <textarea
                      value={editedContent?.money_idea?.why_it_matters || ''}
                      onChange={(e) => handleFieldChange('money_idea.why_it_matters', e.target.value)}
                      rows={4}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Formula (optional)</label>
                    <input
                      type="text"
                      value={editedContent?.money_idea?.formula || ''}
                      onChange={(e) => handleFieldChange('money_idea.formula', e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Risk</label>
                    <textarea
                      value={editedContent?.money_idea?.risk || ''}
                      onChange={(e) => handleFieldChange('money_idea.risk', e.target.value)}
                      rows={4}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Real Life Example</label>
                    <textarea
                      value={editedContent?.money_idea?.real_life || ''}
                      onChange={(e) => handleFieldChange('money_idea.real_life', e.target.value)}
                      rows={4}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-200">
                    <h3 className="font-bold text-indigo-800 mb-2">What It Means</h3>
                    <p className="text-slate-700 whitespace-pre-wrap">{weekContent.money_idea.what_it_means}</p>
                  </div>
                  <div className="bg-green-50 p-6 rounded-xl border border-green-200">
                    <h3 className="font-bold text-green-800 mb-2">Why It Matters</h3>
                    <p className="text-slate-700 whitespace-pre-wrap">{weekContent.money_idea.why_it_matters}</p>
                  </div>
                  {weekContent.money_idea.formula && (
                    <div className="bg-purple-50 p-6 rounded-xl border border-purple-200">
                      <h3 className="font-bold text-purple-800 mb-2">Formula</h3>
                      <p className="text-slate-700 font-mono">{weekContent.money_idea.formula}</p>
                    </div>
                  )}
                  <div className="bg-red-50 p-6 rounded-xl border border-red-200">
                    <h3 className="font-bold text-red-800 mb-2">Risk</h3>
                    <p className="text-slate-700 whitespace-pre-wrap">{weekContent.money_idea.risk}</p>
                  </div>
                  <div className="bg-amber-50 p-6 rounded-xl border border-amber-200">
                    <h3 className="font-bold text-amber-800 mb-2">Real Life Example</h3>
                    <p className="text-slate-700 whitespace-pre-wrap">{weekContent.money_idea.real_life}</p>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Quiz */}
          {currentSection === 4 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-800">Quiz ({weekContent.quiz.length} Questions)</h2>

              {weekContent.quiz.map((q, idx) => (
                <div key={idx} className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4">
                  <p className="font-semibold text-slate-800">Question {idx + 1}</p>

                  {editMode ? (
                    <>
                      <textarea
                        value={editedContent?.quiz[idx]?.question || ''}
                        onChange={(e) => handleQuizChange(idx, 'question', e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                        placeholder="Question"
                      />

                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-slate-600">Options (one per line)</p>
                        <textarea
                          value={editedContent?.quiz[idx]?.options?.join('\n') || ''}
                          onChange={(e) => handleQuizChange(idx, 'options', e.target.value.split('\n'))}
                          rows={4}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                        />
                      </div>

                      <input
                        type="text"
                        value={editedContent?.quiz[idx]?.answer || ''}
                        onChange={(e) => handleQuizChange(idx, 'answer', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                        placeholder="Correct Answer"
                      />

                      <textarea
                        value={editedContent?.quiz[idx]?.teaching_point || ''}
                        onChange={(e) => handleQuizChange(idx, 'teaching_point', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                        placeholder="Teaching Point"
                      />
                    </>
                  ) : (
                    <>
                      <p className="text-slate-700">{q.question}</p>
                      <div className="grid grid-cols-2 gap-2">
                        {q.options.map((opt, optIdx) => (
                          <div
                            key={optIdx}
                            className={`px-4 py-2 rounded-lg text-sm ${
                              opt === q.answer
                                ? 'bg-green-100 border-2 border-green-500 font-semibold'
                                : 'bg-white border border-slate-200'
                            }`}
                          >
                            {String.fromCharCode(65 + optIdx)}. {opt}
                          </div>
                        ))}
                      </div>
                      <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                        <p className="text-xs font-semibold text-blue-800 mb-1">Teaching Point:</p>
                        <p className="text-sm text-slate-700">{q.teaching_point}</p>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            onClick={() => setCurrentSection(Math.max(0, currentSection - 1))}
            disabled={currentSection === 0}
            className="px-4 py-2 text-sm font-medium bg-white border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          <span className="text-sm text-slate-500">
            Section {currentSection + 1} of {sections.length}
          </span>
          <button
            onClick={() => setCurrentSection(Math.min(sections.length - 1, currentSection + 1))}
            disabled={currentSection === sections.length - 1}
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
