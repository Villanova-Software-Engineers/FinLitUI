/**
 * Quiz Questions Admin Page
 * Manage quiz questions for the Global Economic News Quiz
 */

import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Edit3,
  Check,
  XCircle,
  Loader2,
  HelpCircle,
  Zap,
  CheckCircle,
  Shield,
  Lock,
  Download
} from 'lucide-react';
import { getQuizQuestions, addQuizQuestion, deleteQuizQuestion, updateQuizQuestion, checkIsSuperAdmin } from '../firebase/firestore.service';
import { useAuthContext } from '../auth/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import type { QuizQuestion } from '../auth/types/auth.types';

interface NewQuizQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  emoji: string;
}

const EMOJI_OPTIONS = ['📊', '🏦', '💳', '💼', '💰', '📈', '🏛️', '💵', '📉', '🏠', '🚗', '💎', '🌍', '⚡', '🔒', '📱'];

// Default questions (same as in EconomicNewsQuiz)
const DEFAULT_QUESTIONS: Omit<QuizQuestion, 'id' | 'createdAt' | 'createdBy'>[] = [
  {
    question: "Which country recently delayed its expected interest rate cut after inflation data came in higher than expected?",
    options: ["United States", "United Kingdom", "Australia", "Turkey"],
    correct: 1,
    explanation: "United Kingdom — analysts pushed the Bank of England's rate-cut forecast to March 2026 after stronger inflation readings.",
    emoji: "📊"
  },
  {
    question: "Turkey's central bank recently cut interest rates, but by less than expected. What was the main reason given?",
    options: ["Deflation concerns", "Political pressure", "Persistent inflation worries", "Falling currency"],
    correct: 2,
    explanation: "Persistent inflation worries — inflation is still high so the cut was smaller than markets expected.",
    emoji: "🏦"
  },
  {
    question: "What major policy proposal at the World Economic Forum is stirring debate in U.S. financial markets?",
    options: ["Higher corporate taxes", "A cap on credit card interest rates", "New tariffs on Chinese goods", "A new digital dollar"],
    correct: 1,
    explanation: "A cap on credit card interest rates — a proposed 10% cap is controversial among bankers and economists.",
    emoji: "💳"
  },
  {
    question: "Recent jobs data in Australia surprised markets by showing:",
    options: ["A sharp rise in unemployment", "Inflation dropping sharply", "A lower unemployment rate than expected", "A freeze on job growth"],
    correct: 2,
    explanation: "A lower unemployment rate than expected — the rate unexpectedly fell, fueling speculation about rate hikes.",
    emoji: "💼"
  },
  {
    question: "In the U.S. economic news cycle, what remains strong and supports consumer spending?",
    options: ["Housing prices", "Consumer spending and wages", "Export demand", "Manufacturing output"],
    correct: 1,
    explanation: "Consumer spending and wages — household finances remain resilient.",
    emoji: "💰"
  },
  {
    question: "Markets have recently reacted positively when inflation data came in cooler, leading to gains in:",
    options: ["Real estate bonds", "Energy prices", "U.S. major stock indices", "Gold only"],
    correct: 2,
    explanation: "U.S. major stock indices — cooler inflation readings helped lift stocks.",
    emoji: "📈"
  },
  {
    question: "Why might the Federal Reserve not cut interest rates soon, despite recent rate cuts in 2025?",
    options: ["Inflation is already zero", "The economy is shrinking rapidly", "Jobs and price pressures still look relatively strong", "Banks refuse to lend money"],
    correct: 2,
    explanation: "Jobs and price pressures still look relatively strong — strong labor and inflation data make immediate cuts unlikely.",
    emoji: "🏛️"
  }
];

const QuizQuestionsAdmin: React.FC = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuthContext();
  const navigate = useNavigate();

  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean | null>(null);
  const [checkingAccess, setCheckingAccess] = useState(true);

  // Quiz Questions State
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [showQuizForm, setShowQuizForm] = useState(false);
  const [quizError, setQuizError] = useState<string | null>(null);
  const [savingQuestion, setSavingQuestion] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuizQuestion | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [importingDefaults, setImportingDefaults] = useState(false);
  const [newQuestion, setNewQuestion] = useState<NewQuizQuestion>({
    question: '',
    options: ['', '', '', ''],
    correct: 0,
    explanation: '',
    emoji: '📊'
  });

  useEffect(() => {
    const checkAccess = async () => {
      if (authLoading) return;
      if (!isAuthenticated || !user) {
        setCheckingAccess(false);
        setIsSuperAdmin(false);
        return;
      }
      try {
        const isSA = await checkIsSuperAdmin(user.id);
        setIsSuperAdmin(isSA);
      } catch {
        setIsSuperAdmin(false);
      } finally {
        setCheckingAccess(false);
      }
    };
    checkAccess();
  }, [user, isAuthenticated, authLoading]);

  useEffect(() => {
    if (isSuperAdmin) {
      loadQuizQuestions();
    }
  }, [isSuperAdmin]);

  const loadQuizQuestions = async () => {
    setLoadingQuestions(true);
    try {
      const questions = await getQuizQuestions();
      setQuizQuestions(questions);
    } catch {
      setQuizError('Failed to load quiz questions');
    } finally {
      setLoadingQuestions(false);
    }
  };

  const resetQuizForm = () => {
    setNewQuestion({
      question: '',
      options: ['', '', '', ''],
      correct: 0,
      explanation: '',
      emoji: '📊'
    });
    setEditingQuestion(null);
    setShowQuizForm(false);
    setQuizError(null);
  };

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Validate
    if (!newQuestion.question.trim()) {
      setQuizError('Question text is required');
      return;
    }
    if (newQuestion.options.some(opt => !opt.trim())) {
      setQuizError('All four options are required');
      return;
    }
    if (!newQuestion.explanation.trim()) {
      setQuizError('Explanation is required');
      return;
    }

    setSavingQuestion(true);
    setQuizError(null);

    try {
      if (editingQuestion) {
        await updateQuizQuestion(editingQuestion.id, {
          question: newQuestion.question.trim(),
          options: newQuestion.options.map(o => o.trim()),
          correct: newQuestion.correct,
          explanation: newQuestion.explanation.trim(),
          emoji: newQuestion.emoji
        });
      } else {
        await addQuizQuestion({
          question: newQuestion.question.trim(),
          options: newQuestion.options.map(o => o.trim()),
          correct: newQuestion.correct,
          explanation: newQuestion.explanation.trim(),
          emoji: newQuestion.emoji,
          createdBy: user.id
        }, user.id);
      }
      resetQuizForm();
      loadQuizQuestions();
    } catch (err) {
      setQuizError(err instanceof Error ? err.message : 'Failed to save question');
    } finally {
      setSavingQuestion(false);
    }
  };

  const handleEditQuestion = (question: QuizQuestion) => {
    setEditingQuestion(question);
    setNewQuestion({
      question: question.question,
      options: [...question.options],
      correct: question.correct,
      explanation: question.explanation,
      emoji: question.emoji
    });
    setShowQuizForm(true);
    setQuizError(null);
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm('Are you sure you want to delete this question?\n\nThis will reset all users\' quiz progress for the entire quiz.')) {
      return;
    }
    setDeletingId(questionId);
    try {
      await deleteQuizQuestion(questionId);
      loadQuizQuestions();
    } catch (err) {
      setQuizError(err instanceof Error ? err.message : 'Failed to delete question');
    } finally {
      setDeletingId(null);
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...newQuestion.options];
    newOptions[index] = value;
    setNewQuestion({ ...newQuestion, options: newOptions });
  };

  const handleImportDefaults = async () => {
    if (!user) return;

    if (!confirm(`This will import all ${DEFAULT_QUESTIONS.length} default questions to the database as custom questions.\n\nYou'll then be able to edit, delete, or add more questions.\n\nContinue?`)) {
      return;
    }

    setImportingDefaults(true);
    setQuizError(null);

    try {
      // Import each default question to Firestore
      for (const q of DEFAULT_QUESTIONS) {
        await addQuizQuestion({
          question: q.question,
          options: q.options,
          correct: q.correct,
          explanation: q.explanation,
          emoji: q.emoji,
          createdBy: user.id
        }, user.id);
      }

      // Reload questions to show the newly imported ones
      await loadQuizQuestions();
    } catch (err) {
      setQuizError(err instanceof Error ? err.message : 'Failed to import default questions');
    } finally {
      setImportingDefaults(false);
    }
  };

  if (authLoading || checkingAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50/30 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-emerald-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !isSuperAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50/30 flex items-center justify-center p-6">
        <div className="max-w-sm text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="text-slate-400" size={28} />
          </div>
          <h1 className="text-xl font-bold text-slate-800 mb-2">Access Denied</h1>
          <p className="text-slate-600 mb-6">
            {!isAuthenticated ? 'Please sign in to continue.' : 'Super admin access required.'}
          </p>
          <button
            onClick={() => navigate('/auth')}
            className="text-emerald-600 font-semibold hover:text-emerald-700"
          >
            Go to login →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50/30">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200/60 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/admin-setup')}
                className="p-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-all"
              >
                <ArrowLeft size={20} />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                  <HelpCircle className="text-white" size={20} />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-800">Quiz Questions</h1>
                  <p className="text-sm text-slate-500">Global Economic News Quiz</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg">
                <Zap size={16} />
                <span className="font-medium">3 XP per correct answer</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg">
                <Shield size={16} />
                <span className="font-medium">Super Admin</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                <HelpCircle className="text-white" size={24} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{quizQuestions.length > 0 ? quizQuestions.length : DEFAULT_QUESTIONS.length}</p>
                <p className="text-sm text-slate-500 font-medium">{quizQuestions.length > 0 ? 'Custom Questions' : 'Default Questions'}</p>
              </div>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
                <Zap className="text-white" size={24} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{(quizQuestions.length > 0 ? quizQuestions.length : DEFAULT_QUESTIONS.length) * 3}</p>
                <p className="text-sm text-slate-500 font-medium">Max XP Available</p>
              </div>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <CheckCircle className="text-white" size={24} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{quizQuestions.length > 0 ? 'Custom' : 'Default'}</p>
                <p className="text-sm text-slate-500 font-medium">Quiz Status</p>
              </div>
            </div>
          </div>
        </div>

        {/* Add Question Button */}
        {!showQuizForm && (
          <div className="mb-6">
            <button
              onClick={() => {
                resetQuizForm();
                setShowQuizForm(true);
              }}
              className="w-full py-4 bg-white/80 backdrop-blur-sm border-2 border-dashed border-emerald-300 rounded-xl text-emerald-600 font-semibold hover:bg-emerald-50 hover:border-emerald-400 transition-all flex items-center justify-center gap-2"
            >
              <Plus size={20} />
              Add New Question
            </button>
          </div>
        )}

        {/* Add/Edit Question Form */}
        {showQuizForm && (
          <div className="bg-white/90 backdrop-blur-sm border border-slate-200/60 rounded-2xl shadow-xl mb-8 overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-emerald-500 to-teal-600">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  {editingQuestion ? <Edit3 size={20} /> : <Plus size={20} />}
                  {editingQuestion ? 'Edit Question' : 'Add New Question'}
                </h2>
                <button
                  onClick={resetQuizForm}
                  className="p-1.5 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-all"
                >
                  <XCircle size={22} />
                </button>
              </div>
            </div>

            <form onSubmit={handleSaveQuestion} className="p-6 space-y-6">
              {/* Emoji Picker */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-3">Select Emoji</label>
                <div className="flex gap-2 flex-wrap">
                  {EMOJI_OPTIONS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setNewQuestion({ ...newQuestion, emoji })}
                      className={`text-2xl p-2.5 rounded-xl transition-all ${
                        newQuestion.emoji === emoji
                          ? 'bg-emerald-100 ring-2 ring-emerald-500 scale-110'
                          : 'bg-slate-100 hover:bg-slate-200 hover:scale-105'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question Text */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Question Text</label>
                <textarea
                  value={newQuestion.question}
                  onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
                  className="w-full px-4 py-3 text-base border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white resize-none"
                  rows={3}
                  placeholder="Enter your question here..."
                  required
                />
              </div>

              {/* Options */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-3">
                  Answer Options <span className="font-normal text-slate-500">(click letter to mark correct answer)</span>
                </label>
                <div className="space-y-3">
                  {newQuestion.options.map((option, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setNewQuestion({ ...newQuestion, correct: index })}
                        className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-base transition-all ${
                          newQuestion.correct === index
                            ? 'bg-emerald-500 text-white ring-4 ring-emerald-200 scale-110'
                            : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                        }`}
                      >
                        {String.fromCharCode(65 + index)}
                      </button>
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => updateOption(index, e.target.value)}
                        className={`flex-1 px-4 py-3 text-base border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all ${
                          newQuestion.correct === index
                            ? 'border-emerald-300 bg-emerald-50'
                            : 'border-slate-300 bg-white'
                        }`}
                        placeholder={`Option ${String.fromCharCode(65 + index)}`}
                        required
                      />
                      {newQuestion.correct === index && (
                        <CheckCircle className="text-emerald-500 flex-shrink-0" size={24} />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Explanation */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Explanation <span className="font-normal text-slate-500">(shown after user answers)</span>
                </label>
                <textarea
                  value={newQuestion.explanation}
                  onChange={(e) => setNewQuestion({ ...newQuestion, explanation: e.target.value })}
                  className="w-full px-4 py-3 text-base border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white resize-none"
                  rows={2}
                  placeholder="Explain why this is the correct answer..."
                  required
                />
              </div>

              {/* Error Message */}
              {quizError && (
                <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-center gap-2">
                  <XCircle size={18} />
                  {quizError}
                </div>
              )}

              {/* Form Actions */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={resetQuizForm}
                  className="px-6 py-3 text-slate-600 font-medium hover:bg-slate-100 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingQuestion}
                  className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-xl hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 transition-all flex items-center gap-2 shadow-lg hover:shadow-xl"
                >
                  {savingQuestion ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check size={20} />
                      {editingQuestion ? 'Update Question' : 'Add Question'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Warning Banner */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-start gap-3">
          <Zap className="text-amber-600 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <p className="text-sm font-semibold text-amber-800">Important: Changing questions resets user progress</p>
            <p className="text-sm text-amber-700 mt-1">When you add, edit, or delete questions, all users' quiz progress will be reset and they can earn XP again on the new questions.</p>
          </div>
        </div>

        {/* Questions List */}
        <div className="bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-2xl shadow-xl overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-slate-50 to-emerald-50/50 border-b border-slate-200/60">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">
                {quizQuestions.length > 0 ? 'Custom Questions' : 'Default Questions (Read-Only)'}
              </h2>
              <span className="text-sm font-medium text-slate-600 bg-white px-3 py-1 rounded-lg border border-slate-200">
                {quizQuestions.length > 0 ? quizQuestions.length : DEFAULT_QUESTIONS.length} question{(quizQuestions.length > 0 ? quizQuestions.length : DEFAULT_QUESTIONS.length) !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          <div className="p-6">
            {loadingQuestions ? (
              <div className="text-center py-12">
                <Loader2 className="w-10 h-10 text-emerald-600 animate-spin mx-auto" />
                <p className="text-slate-600 mt-4 font-medium">Loading questions...</p>
              </div>
            ) : quizQuestions.length === 0 ? (
              <div>
                {/* Header for default questions */}
                <div className="text-center py-6 border-b border-slate-200/60 mb-6">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-800 rounded-full text-sm font-semibold mb-3">
                    <HelpCircle size={16} />
                    Using Default Questions
                  </div>
                  <p className="text-slate-500 max-w-lg mx-auto">
                    No custom questions have been added yet. The quiz is currently showing these {DEFAULT_QUESTIONS.length} default questions to students.
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-4">
                    <button
                      onClick={handleImportDefaults}
                      disabled={importingDefaults}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transition-all shadow-lg"
                    >
                      {importingDefaults ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          Importing...
                        </>
                      ) : (
                        <>
                          <Download size={18} />
                          Convert to Custom Questions
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        resetQuizForm();
                        setShowQuizForm(true);
                      }}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg"
                    >
                      <Plus size={18} />
                      Add New Question
                    </button>
                  </div>
                  <p className="text-xs text-slate-400 mt-3">
                    Converting will save all default questions to the database so you can edit or delete them.
                  </p>
                </div>

                {/* Show default questions */}
                <div className="space-y-4">
                  {DEFAULT_QUESTIONS.map((q, index) => (
                    <div
                      key={`default-${index}`}
                      className="bg-slate-50 border border-slate-200 rounded-xl p-5 opacity-80"
                    >
                      <div className="flex items-start gap-4">
                        {/* Question Number & Emoji */}
                        <div className="flex flex-col items-center gap-2">
                          <span className="text-xs font-bold text-slate-400 bg-slate-200 px-2.5 py-1 rounded-lg">
                            #{index + 1}
                          </span>
                          <div className="text-4xl">{q.emoji}</div>
                          <span className="text-xs text-amber-600 font-medium bg-amber-50 px-2 py-0.5 rounded">
                            Default
                          </span>
                        </div>

                        {/* Question Content */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-slate-700 text-lg mb-4 leading-relaxed">{q.question}</h4>

                          {/* Options Grid */}
                          <div className="grid grid-cols-2 gap-2 mb-4">
                            {q.options.map((opt, optIndex) => (
                              <div
                                key={optIndex}
                                className={`text-sm px-4 py-2.5 rounded-lg flex items-center gap-2 ${
                                  optIndex === q.correct
                                    ? 'bg-emerald-100 text-emerald-800 font-medium border border-emerald-200'
                                    : 'bg-white text-slate-600 border border-slate-100'
                                }`}
                              >
                                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                                  optIndex === q.correct
                                    ? 'bg-emerald-500 text-white'
                                    : 'bg-slate-300 text-slate-600'
                                }`}>
                                  {String.fromCharCode(65 + optIndex)}
                                </span>
                                <span className="truncate">{opt}</span>
                                {optIndex === q.correct && <CheckCircle size={16} className="ml-auto text-emerald-600 flex-shrink-0" />}
                              </div>
                            ))}
                          </div>

                          {/* Explanation */}
                          <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                            <p className="text-sm text-blue-800">
                              <span className="font-semibold">Explanation:</span> {q.explanation}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {quizQuestions.map((q, index) => (
                  <div
                    key={q.id}
                    className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-lg transition-all group"
                  >
                    <div className="flex items-start gap-4">
                      {/* Question Number & Emoji */}
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                          #{index + 1}
                        </span>
                        <div className="text-4xl">{q.emoji}</div>
                      </div>

                      {/* Question Content */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-slate-800 text-lg mb-4 leading-relaxed">{q.question}</h4>

                        {/* Options Grid */}
                        <div className="grid grid-cols-2 gap-2 mb-4">
                          {q.options.map((opt, optIndex) => (
                            <div
                              key={optIndex}
                              className={`text-sm px-4 py-2.5 rounded-lg flex items-center gap-2 ${
                                optIndex === q.correct
                                  ? 'bg-emerald-100 text-emerald-800 font-medium border border-emerald-200'
                                  : 'bg-slate-50 text-slate-600 border border-slate-100'
                              }`}
                            >
                              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                                optIndex === q.correct
                                  ? 'bg-emerald-500 text-white'
                                  : 'bg-slate-300 text-slate-600'
                              }`}>
                                {String.fromCharCode(65 + optIndex)}
                              </span>
                              <span className="truncate">{opt}</span>
                              {optIndex === q.correct && <CheckCircle size={16} className="ml-auto text-emerald-600 flex-shrink-0" />}
                            </div>
                          ))}
                        </div>

                        {/* Explanation */}
                        <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                          <p className="text-sm text-blue-800">
                            <span className="font-semibold">Explanation:</span> {q.explanation}
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEditQuestion(q)}
                          className="p-2.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          title="Edit question"
                        >
                          <Edit3 size={20} />
                        </button>
                        <button
                          onClick={() => handleDeleteQuestion(q.id)}
                          disabled={deletingId === q.id}
                          className="p-2.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50"
                          title="Delete question"
                        >
                          {deletingId === q.id ? (
                            <Loader2 size={20} className="animate-spin" />
                          ) : (
                            <Trash2 size={20} />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default QuizQuestionsAdmin;
