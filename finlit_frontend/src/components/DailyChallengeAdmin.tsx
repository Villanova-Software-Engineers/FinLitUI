/**
 * Daily Challenge Admin Page
 * Manage daily challenge questions for the dashboard
 * NOTE: Only super admin (owner) can add/edit/delete challenges
 *       Regular admins can only view the current challenge
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
  Flame,
  CheckCircle,
  AlertTriangle,
  Lock,
  Eye
} from 'lucide-react';
import { useAuthContext } from '../auth/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import type { DailyChallengeQuestion } from '../auth/types/auth.types';
import {
  getDailyChallengeQuestions,
  addDailyChallengeQuestion,
  deleteDailyChallengeQuestion,
  updateDailyChallengeQuestion,
  setActiveDailyChallenge,
  getActiveDailyChallenge
} from '../firebase/firestore.service';

interface NewDailyChallengeQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

const DailyChallengeAdmin: React.FC = () => {
  const { user } = useAuthContext();
  const navigate = useNavigate();

  // Daily Challenge State
  const [dailyChallenges, setDailyChallenges] = useState<DailyChallengeQuestion[]>([]);
  const [activeChallengeId, setActiveChallengeId] = useState<string | null>(null);
  const [loadingChallenges, setLoadingChallenges] = useState(true);
  const [showChallengeForm, setShowChallengeForm] = useState(false);
  const [editingChallengeId, setEditingChallengeId] = useState<string | null>(null);
  const [newChallenge, setNewChallenge] = useState<NewDailyChallengeQuestion>({
    question: '',
    options: ['', '', '', ''],
    correct: 0,
    explanation: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (user?.role !== 'admin' && user?.role !== 'owner') {
      navigate('/auth');
      return;
    }
    loadDailyChallenges();
    loadActiveChallenge();
  }, [user, navigate]);

  const loadDailyChallenges = async () => {
    setLoadingChallenges(true);
    try {
      const challenges = await getDailyChallengeQuestions();
      setDailyChallenges(challenges);
    } catch (err) {
      console.error('Error loading daily challenges:', err);
      setError('Failed to load daily challenges');
    } finally {
      setLoadingChallenges(false);
    }
  };

  const loadActiveChallenge = async () => {
    try {
      const activeId = await getActiveDailyChallenge();
      setActiveChallengeId(activeId);
    } catch (err) {
      console.error('Error loading active challenge:', err);
    }
  };

  const handleAddChallenge = async () => {
    setError(null);
    setIsSubmitting(true);
    
    try {
      if (!user) throw new Error('User not authenticated');
      if (user.role !== 'owner') {
        setError('Only super administrators can edit daily challenges');
        setIsSubmitting(false);
        return;
      }
      
      if (editingChallengeId) {
        // Update existing challenge
        await updateDailyChallengeQuestion(editingChallengeId, {
          question: newChallenge.question,
          options: newChallenge.options,
          correct: newChallenge.correct,
          explanation: newChallenge.explanation
        });
        setSuccessMessage('Challenge updated successfully!');
      } else {
        // For daily challenge, we only want one question at a time
        // Delete all existing challenges before adding the new one
        if (dailyChallenges.length > 0) {
          for (const challenge of dailyChallenges) {
            await deleteDailyChallengeQuestion(challenge.id);
          }
        }
        
        // Add new challenge
        const newChallengeDoc = await addDailyChallengeQuestion(
          newChallenge.question,
          newChallenge.options,
          newChallenge.correct,
          user.id,
          newChallenge.explanation
        );
        
        // Automatically set the new challenge as active
        await setActiveDailyChallenge(newChallengeDoc.id);
        setActiveChallengeId(newChallengeDoc.id);
        
        setSuccessMessage('New daily challenge set successfully! This will reset all user progress.');
      }
      
      // Reset form
      setNewChallenge({
        question: '',
        options: ['', '', '', ''],
        correct: 0,
        explanation: '',
      });
      setEditingChallengeId(null);
      setShowChallengeForm(false);
      
      // Reload challenges and active challenge
      await loadDailyChallenges();
      await loadActiveChallenge();
    } catch (err) {
      console.error('Error saving challenge:', err);
      setError('Failed to save challenge');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteChallenge = async (challengeId: string) => {
    if (!user || user.role !== 'owner') {
      setError('Only super administrators can delete daily challenges');
      return;
    }
    
    if (!confirm('Are you sure you want to delete this challenge?')) return;
    
    try {
      await deleteDailyChallengeQuestion(challengeId);
      setSuccessMessage('Challenge deleted successfully!');
      await loadDailyChallenges();
      
      // If deleted challenge was active, clear active status
      if (challengeId === activeChallengeId) {
        setActiveChallengeId(null);
      }
    } catch (err) {
      console.error('Error deleting challenge:', err);
      setError('Failed to delete challenge');
    }
  };

  const handleEditChallenge = (challenge: DailyChallengeQuestion) => {
    if (!user || user.role !== 'owner') {
      setError('Only super administrators can edit daily challenges');
      return;
    }
    
    setNewChallenge({
      question: challenge.question,
      options: challenge.options,
      correct: challenge.correct,
      explanation: challenge.explanation || '',
    });
    setEditingChallengeId(challenge.id);
    setShowChallengeForm(true);
  };


  const updateOption = (index: number, value: string) => {
    const updatedOptions = [...newChallenge.options];
    updatedOptions[index] = value;
    setNewChallenge({ ...newChallenge, options: updatedOptions });
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

  if (!user || (user.role !== 'admin' && user.role !== 'owner')) return null;

  // Check if user is super admin (owner) - only they can edit
  const isSuperAdmin = user.role === 'owner';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-4 sm:p-6 md:p-8">
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
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                Daily Challenge {isSuperAdmin ? 'Manager' : 'Viewer'}
              </h1>
              <p className="text-slate-600 mt-1 text-sm sm:text-base font-medium">
                {isSuperAdmin
                  ? 'Manage daily challenge questions for the dashboard'
                  : 'View the current daily challenge question'}
              </p>
            </div>
          </div>
          {!isSuperAdmin && (
            <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-xl">
              <Eye size={16} className="text-amber-600" />
              <span className="text-sm font-medium text-amber-700">View Only</span>
            </div>
          )}
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

        {/* Current Challenge Notice */}
        {dailyChallenges.length > 0 && (
          <div className="mb-6 px-5 py-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/60 rounded-xl text-sm text-amber-700 flex items-center gap-3 shadow-sm">
            <Flame size={18} className="text-amber-500" />
            <span className="font-medium">
              Current challenge: {dailyChallenges[0]?.question.substring(0, 50)}...
            </span>
          </div>
        )}

        {/* Daily Challenges Section */}
        <div className="bg-white/70 backdrop-blur-sm border border-slate-200/60 rounded-2xl shadow-xl mb-8">
          <div className="px-6 py-5 border-b border-slate-200/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                <Flame className="text-white" size={20} />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-800">Daily Challenge</h2>
              <span className="px-3 py-1 bg-slate-100 rounded-full text-sm font-semibold text-slate-600">
                {dailyChallenges.length > 0 ? 'Active' : 'None set'}
              </span>
            </div>
            {isSuperAdmin && (
              <button
                onClick={() => {
                  setShowChallengeForm(true);
                  setEditingChallengeId(null);
                  setNewChallenge({
                    question: '',
                    options: ['', '', '', ''],
                    correct: 0,
                    explanation: '',
                  });
                }}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white text-sm font-semibold rounded-xl hover:from-amber-600 hover:to-orange-700 transition-all duration-200 shadow-lg"
              >
                <Plus size={18} />
                {dailyChallenges.length > 0 ? 'Replace Challenge' : 'Add Challenge'}
              </button>
            )}
          </div>

          <div className="p-6">
            {loadingChallenges ? (
              <div className="text-center py-12">
                <Loader2 className="animate-spin mx-auto text-amber-600" size={32} />
                <p className="text-slate-600 mt-3">Loading challenges...</p>
              </div>
            ) : dailyChallenges.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gradient-to-r from-amber-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Flame className="text-amber-600" size={40} />
                </div>
                <h3 className="text-lg font-bold text-slate-700 mb-2">No daily challenge set</h3>
                <p className="text-slate-500">Add a daily challenge question to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {dailyChallenges.map((challenge) => (
                  <div
                    key={challenge.id}
                    className={`border rounded-xl p-4 transition-all duration-200 ${
                      challenge.id === activeChallengeId
                        ? 'border-amber-400 bg-gradient-to-r from-amber-50 to-orange-50'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {challenge.id === activeChallengeId && (
                            <span className="px-2 py-1 bg-amber-500 text-white text-xs font-bold rounded-lg">
                              ACTIVE
                            </span>
                          )}
                          <p className="font-semibold text-slate-800">{challenge.question}</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                          {challenge.options.map((option, idx) => (
                            <div
                              key={idx}
                              className={`px-3 py-2 rounded-lg text-sm ${
                                idx === challenge.correct
                                  ? 'bg-green-100 text-green-700 font-semibold'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {option}
                            </div>
                          ))}
                        </div>
                        <p className="text-xs text-slate-500">
                          Added {challenge.createdAt.toLocaleDateString()}
                        </p>
                      </div>
                      {isSuperAdmin && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditChallenge(challenge)}
                            className="p-2 hover:bg-blue-100 rounded-lg transition-colors text-blue-600"
                            title="Edit challenge"
                          >
                            <Edit3 size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteChallenge(challenge.id)}
                            className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-600"
                            title="Replace with new challenge"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 px-4 py-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200">
              <div className="flex items-start gap-3">
                {isSuperAdmin ? (
                  <AlertTriangle size={18} className="text-amber-600 mt-0.5" />
                ) : (
                  <Lock size={18} className="text-amber-600 mt-0.5" />
                )}
                <div className="text-sm text-amber-700">
                  <p className="font-semibold mb-1">{isSuperAdmin ? 'How it works:' : 'View Only Mode:'}</p>
                  {isSuperAdmin ? (
                    <p>Only one daily challenge can be active at a time. Adding a new challenge will replace the current one and reset all user progress.</p>
                  ) : (
                    <p>Only <strong>Super Administrators</strong> can add, edit, or delete daily challenges. Contact your super admin to make changes.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Add/Edit Challenge Form - Only for Super Admins */}
        {showChallengeForm && isSuperAdmin && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200/60 max-h-[90vh] overflow-y-auto">
              <div className="px-6 py-5 border-b border-slate-200/60 bg-gradient-to-r from-slate-50 to-amber-50">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-3">
                  <Flame className="text-amber-600" size={20} />
                  {editingChallengeId ? 'Edit Challenge' : (dailyChallenges.length > 0 ? 'Replace Daily Challenge' : 'Add Daily Challenge')}
                </h3>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Question</label>
                  <textarea
                    value={newChallenge.question}
                    onChange={(e) => setNewChallenge({ ...newChallenge, question: e.target.value })}
                    className="w-full px-4 py-3 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-600 focus:border-transparent bg-slate-50 hover:bg-white transition-colors"
                    placeholder="Enter the challenge question..."
                    rows={3}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Answer Options</label>
                  <div className="space-y-2">
                    {newChallenge.options.map((option, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="correct-answer"
                          checked={newChallenge.correct === idx}
                          onChange={() => setNewChallenge({ ...newChallenge, correct: idx })}
                          className="w-4 h-4 text-amber-600"
                        />
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => updateOption(idx, e.target.value)}
                          className="flex-1 px-4 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-600 focus:border-transparent bg-slate-50 hover:bg-white transition-colors"
                          placeholder={`Option ${idx + 1}`}
                          required
                        />
                        {newChallenge.correct === idx && (
                          <CheckCircle className="text-green-500" size={20} />
                        )}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-slate-500 mt-2">Select the correct answer by clicking the radio button</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Explanation</label>
                  <textarea
                    value={newChallenge.explanation}
                    onChange={(e) => setNewChallenge({ ...newChallenge, explanation: e.target.value })}
                    className="w-full px-4 py-3 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-600 focus:border-transparent bg-slate-50 hover:bg-white transition-colors"
                    placeholder="Explain why this is the correct answer..."
                    rows={3}
                    required
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowChallengeForm(false);
                      setEditingChallengeId(null);
                    }}
                    className="flex-1 py-3 text-sm font-semibold text-slate-600 border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddChallenge}
                    disabled={isSubmitting || !newChallenge.question || newChallenge.options.some(opt => !opt) || !newChallenge.explanation}
                    className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white text-sm font-semibold rounded-xl hover:from-amber-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        {editingChallengeId ? 'Updating...' : 'Adding...'}
                      </>
                    ) : (
                      <>
                        {editingChallengeId ? <Check size={16} /> : <Plus size={16} />}
                        {editingChallengeId ? 'Update Challenge' : (dailyChallenges.length > 0 ? 'Replace Challenge' : 'Add Challenge')}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyChallengeAdmin;