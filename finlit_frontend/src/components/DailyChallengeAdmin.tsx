/**
 * Daily Challenge Admin Page
 * Schedule up to 30 daily challenges that auto-rotate at midnight Eastern Time.
 * Super admins (owner) can add/edit/delete; regular admins can view only.
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
  Eye,
  Upload,
  Calendar,
  Copy,
  ChevronDown,
  ChevronUp,
  FileJson,
  Info,
  Clock,
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
  clearAllDailyChallenges,
  bulkAddDailyChallengeQuestions,
  getEdtDateString,
} from '../firebase/firestore.service';

const MAX_CHALLENGES = 30;

const SAMPLE_JSON = `[
  {
    "question": "What is compound interest?",
    "options": [
      "Interest calculated only on the principal amount",
      "Interest calculated on both principal and accumulated interest",
      "A fixed rate of return on investments",
      "Interest paid only on savings accounts"
    ],
    "correct": 1,
    "explanation": "Compound interest is calculated on the initial principal and also on the accumulated interest from previous periods, resulting in exponential growth over time."
  },
  {
    "question": "What is a budget?",
    "options": [
      "A plan for spending and saving money",
      "A type of bank account",
      "A government tax document",
      "A credit card limit"
    ],
    "correct": 0,
    "explanation": "A budget is a financial plan that outlines expected income and expenses over a period of time, helping you track and control your spending."
  }
]`;

interface ParsedChallenge {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

interface ChallengeFormState {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  scheduledDate: string;
}

const emptyForm = (): ChallengeFormState => ({
  question: '',
  options: ['', '', '', ''],
  correct: 0,
  explanation: '',
  scheduledDate: '',
});

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function addDays(dateStr: string, n: number): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(y, m - 1, d + n);
  return dt.toLocaleDateString('en-CA'); // YYYY-MM-DD
}

function getStatusLabel(scheduledDate: string | undefined, today: string): 'today' | 'upcoming' | 'past' | 'manual' {
  if (!scheduledDate) return 'manual';
  if (scheduledDate === today) return 'today';
  return scheduledDate > today ? 'upcoming' : 'past';
}

// ─── Sub-components ──────────────────────────────────────────────────────────

const StatusBadge: React.FC<{ status: ReturnType<typeof getStatusLabel> }> = ({ status }) => {
  const map = {
    today: 'bg-amber-100 text-amber-700 border-amber-200',
    upcoming: 'bg-blue-100 text-blue-700 border-blue-200',
    past: 'bg-slate-100 text-slate-500 border-slate-200',
    manual: 'bg-purple-100 text-purple-700 border-purple-200',
  } as const;
  const labels = { today: 'Today', upcoming: 'Upcoming', past: 'Past', manual: 'Manual' };
  return (
    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${map[status]}`}>
      {labels[status]}
    </span>
  );
};

const StatCard: React.FC<{
  label: string;
  value: string;
  icon: React.ReactNode;
  colorClass: string;
}> = ({ label, value, icon, colorClass }) => (
  <div className="bg-white/70 border border-slate-200/60 rounded-xl p-4 shadow-sm">
    <div className={`w-8 h-8 ${colorClass} rounded-lg flex items-center justify-center text-white mb-2`}>
      {icon}
    </div>
    <p className="text-xs text-slate-500 font-medium">{label}</p>
    <p className="text-base font-bold text-slate-800 mt-0.5">{value}</p>
  </div>
);

// ─── Main Component ──────────────────────────────────────────────────────────

const DailyChallengeAdmin: React.FC = () => {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const today = getEdtDateString();

  // ── Core state
  const [challenges, setChallenges] = useState<DailyChallengeQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // ── Single-challenge form
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ChallengeFormState>(emptyForm());

  // ── JSON upload
  const [showJsonModal, setShowJsonModal] = useState(false);
  const [jsonInput, setJsonInput] = useState('');
  const [jsonStartDate, setJsonStartDate] = useState('');
  const [parsed, setParsed] = useState<ParsedChallenge[] | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [showSample, setShowSample] = useState(false);
  const [copied, setCopied] = useState(false);
  const [bulkUploading, setBulkUploading] = useState(false);

  const isSuperAdmin = user?.role === 'owner';

  useEffect(() => {
    if (user?.role !== 'admin' && user?.role !== 'owner') {
      navigate('/auth');
      return;
    }
    loadChallenges();
  }, [user]);

  const loadChallenges = async () => {
    setLoading(true);
    try {
      const data = await getDailyChallengeQuestions();
      const sorted = [...data].sort((a, b) => {
        if (a.scheduledDate && b.scheduledDate) return a.scheduledDate.localeCompare(b.scheduledDate);
        if (a.scheduledDate) return -1;
        if (b.scheduledDate) return 1;
        return 0;
      });
      setChallenges(sorted);
    } catch {
      setError('Failed to load daily challenges');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (success) { const t = setTimeout(() => setSuccess(null), 5000); return () => clearTimeout(t); }
  }, [success]);
  useEffect(() => {
    if (error) { const t = setTimeout(() => setError(null), 8000); return () => clearTimeout(t); }
  }, [error]);

  // ── Stats
  const scheduledCount = challenges.filter(c => c.scheduledDate).length;
  const todayChallenge = challenges.find(c => c.scheduledDate === today);
  const upcoming = challenges.filter(c => c.scheduledDate && c.scheduledDate > today);

  // ── Single challenge CRUD

  const openAdd = () => {
    setForm(emptyForm());
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (c: DailyChallengeQuestion) => {
    setForm({
      question: c.question,
      options: [...c.options],
      correct: c.correct,
      explanation: c.explanation || '',
      scheduledDate: c.scheduledDate || '',
    });
    setEditingId(c.id);
    setShowForm(true);
  };

  const saveChallenge = async () => {
    if (!user || !isSuperAdmin) return;
    if (!form.question.trim() || form.options.some(o => !o.trim()) || !form.explanation.trim()) {
      setError('Please fill in all fields.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      // Duplicate date check
      if (form.scheduledDate) {
        const conflict = challenges.find(c => c.scheduledDate === form.scheduledDate && c.id !== editingId);
        if (conflict) {
          setError(`A challenge is already scheduled for ${formatDate(form.scheduledDate)}.`);
          setSubmitting(false);
          return;
        }
      }

      if (editingId) {
        await updateDailyChallengeQuestion(editingId, {
          question: form.question,
          options: form.options,
          correct: form.correct,
          explanation: form.explanation,
          ...(form.scheduledDate ? { scheduledDate: form.scheduledDate } : {}),
        });
        setSuccess('Challenge updated!');
      } else {
        if (challenges.length >= MAX_CHALLENGES) {
          setError(`Maximum ${MAX_CHALLENGES} challenges allowed.`);
          setSubmitting(false);
          return;
        }
        const newDoc = await addDailyChallengeQuestion(
          form.question, form.options, form.correct, user.id, form.explanation,
          form.scheduledDate || undefined
        );
        if (form.scheduledDate === today) {
          await setActiveDailyChallenge(newDoc.id);
        }
        setSuccess('Challenge added!');
      }

      setShowForm(false);
      await loadChallenges();
    } catch {
      setError('Failed to save challenge.');
    } finally {
      setSubmitting(false);
    }
  };

  const deleteChallenge = async (id: string) => {
    if (!isSuperAdmin || !confirm('Delete this challenge?')) return;
    try {
      await deleteDailyChallengeQuestion(id);
      setSuccess('Challenge deleted.');
      await loadChallenges();
    } catch {
      setError('Failed to delete challenge.');
    }
  };

  const clearAll = async () => {
    if (!isSuperAdmin || !confirm('Delete ALL scheduled challenges? This cannot be undone.')) return;
    try {
      await clearAllDailyChallenges();
      setSuccess('All challenges cleared.');
      await loadChallenges();
    } catch {
      setError('Failed to clear challenges.');
    }
  };

  // ── JSON upload

  const parseJson = () => {
    setParseError(null);
    setParsed(null);
    if (!jsonInput.trim()) { setParseError('Please paste your JSON data.'); return; }
    if (!jsonStartDate) { setParseError('Please select a start date.'); return; }
    try {
      const raw = JSON.parse(jsonInput);
      if (!Array.isArray(raw)) { setParseError('JSON must be an array of challenge objects.'); return; }
      if (raw.length === 0) { setParseError('JSON array is empty.'); return; }
      if (raw.length > MAX_CHALLENGES) { setParseError(`Maximum ${MAX_CHALLENGES} challenges allowed. You provided ${raw.length}.`); return; }

      const validated: ParsedChallenge[] = [];
      for (let i = 0; i < raw.length; i++) {
        const item = raw[i];
        if (!item.question || typeof item.question !== 'string')
          { setParseError(`Challenge ${i + 1}: "question" is missing or not a string.`); return; }
        if (!Array.isArray(item.options) || item.options.length !== 4 || item.options.some((o: unknown) => typeof o !== 'string' || !o))
          { setParseError(`Challenge ${i + 1}: "options" must be an array of exactly 4 non-empty strings.`); return; }
        if (typeof item.correct !== 'number' || item.correct < 0 || item.correct > 3)
          { setParseError(`Challenge ${i + 1}: "correct" must be a number 0–3.`); return; }
        if (!item.explanation || typeof item.explanation !== 'string')
          { setParseError(`Challenge ${i + 1}: "explanation" is missing or not a string.`); return; }
        validated.push({ question: item.question, options: item.options, correct: item.correct, explanation: item.explanation });
      }
      setParsed(validated);
    } catch {
      setParseError('Invalid JSON. Please check for syntax errors.');
    }
  };

  const confirmBulkUpload = async () => {
    if (!user || !isSuperAdmin || !parsed || !jsonStartDate) return;
    setBulkUploading(true);
    setError(null);
    try {
      await clearAllDailyChallenges();
      const withDates = parsed.map((q, i) => ({ ...q, scheduledDate: addDays(jsonStartDate, i) }));
      const added = await bulkAddDailyChallengeQuestions(withDates, user.id);
      const todayAdded = added.find(c => c.scheduledDate === today);
      if (todayAdded) await setActiveDailyChallenge(todayAdded.id);
      setSuccess(`Successfully scheduled ${parsed.length} challenge${parsed.length !== 1 ? 's' : ''}!`);
      setShowJsonModal(false);
      setParsed(null);
      setJsonInput('');
      setJsonStartDate('');
      await loadChallenges();
    } catch {
      setError('Failed to upload challenges. Please try again.');
    } finally {
      setBulkUploading(false);
    }
  };

  const copySample = async () => {
    await navigator.clipboard.writeText(SAMPLE_JSON);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!user || (user.role !== 'admin' && user.role !== 'owner')) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-4 sm:p-6 md:p-8">
      <div className="max-w-6xl mx-auto">

        {/* ── Header */}
        <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/admin')} className="p-2 hover:bg-white/60 rounded-lg transition-colors">
              <ArrowLeft size={20} className="text-slate-700" />
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                Daily Challenge {isSuperAdmin ? 'Manager' : 'Viewer'}
              </h1>
              <p className="text-slate-600 mt-1 text-sm font-medium">
                {isSuperAdmin
                  ? 'Schedule up to 30 challenges — auto-rotates at midnight Eastern Time'
                  : 'View the current daily challenge schedule'}
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

        {/* ── Alerts */}
        {error && (
          <div className="mb-6 px-5 py-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200/60 rounded-xl text-sm text-red-700 flex items-center gap-3 shadow-sm">
            <XCircle size={18} className="text-red-500 shrink-0" />
            <span className="font-medium">{error}</span>
          </div>
        )}
        {success && (
          <div className="mb-6 px-5 py-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200/60 rounded-xl text-sm text-green-700 flex items-center gap-3 shadow-sm">
            <CheckCircle size={18} className="text-green-500 shrink-0" />
            <span className="font-medium">{success}</span>
          </div>
        )}

        {/* ── Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <StatCard label="Scheduled" value={`${scheduledCount} / ${MAX_CHALLENGES}`} icon={<Calendar size={18} />} colorClass="bg-gradient-to-r from-amber-500 to-orange-500" />
          <StatCard label="Today" value={todayChallenge ? 'Active' : 'None set'} icon={<Flame size={18} />} colorClass={todayChallenge ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gradient-to-r from-slate-400 to-slate-500'} />
          <StatCard label="Upcoming" value={String(upcoming.length)} icon={<Check size={18} />} colorClass="bg-gradient-to-r from-blue-500 to-indigo-500" />
          <StatCard label="Next After Today" value={upcoming[0]?.scheduledDate ? formatDate(upcoming[0].scheduledDate) : '—'} icon={<Clock size={18} />} colorClass="bg-gradient-to-r from-purple-500 to-violet-500" />
        </div>

        {/* ── Schedule Table */}
        <div className="bg-white/70 backdrop-blur-sm border border-slate-200/60 rounded-2xl shadow-xl mb-8">
          <div className="px-6 py-5 border-b border-slate-200/60 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                <Calendar className="text-white" size={20} />
              </div>
              <h2 className="text-lg font-bold text-slate-800">30-Day Schedule</h2>
              <span className="px-3 py-1 bg-slate-100 rounded-full text-sm font-semibold text-slate-600">
                {challenges.length} challenge{challenges.length !== 1 ? 's' : ''}
              </span>
            </div>
            {isSuperAdmin && (
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={openAdd}
                  disabled={challenges.length >= MAX_CHALLENGES}
                  className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white text-sm font-semibold rounded-xl hover:from-amber-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
                >
                  <Plus size={15} /> Add Single
                </button>
                <button
                  onClick={() => { setShowJsonModal(true); setParsed(null); setParseError(null); setJsonInput(''); setJsonStartDate(''); setShowSample(false); }}
                  className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-semibold rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all shadow-md"
                >
                  <Upload size={15} /> Upload JSON
                </button>
                {challenges.length > 0 && (
                  <button
                    onClick={clearAll}
                    className="flex items-center gap-1.5 px-3 py-2 bg-red-50 text-red-600 border border-red-200 text-sm font-semibold rounded-xl hover:bg-red-100 transition-all"
                  >
                    <Trash2 size={15} /> Clear All
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="p-6">
            {loading ? (
              <div className="text-center py-12">
                <Loader2 className="animate-spin mx-auto text-amber-600" size={32} />
                <p className="text-slate-600 mt-3">Loading schedule...</p>
              </div>
            ) : challenges.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gradient-to-r from-amber-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="text-amber-600" size={40} />
                </div>
                <h3 className="text-lg font-bold text-slate-700 mb-2">No challenges scheduled</h3>
                <p className="text-slate-500 mb-6">Add individual challenges or upload a JSON batch to get started.</p>
                {isSuperAdmin && (
                  <div className="flex justify-center gap-3 flex-wrap">
                    <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white text-sm font-semibold rounded-xl hover:bg-amber-600 transition-colors shadow">
                      <Plus size={16} /> Add Single
                    </button>
                    <button onClick={() => setShowJsonModal(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white text-sm font-semibold rounded-xl hover:bg-blue-600 transition-colors shadow">
                      <Upload size={16} /> Upload JSON
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-3 font-semibold text-slate-500 w-10">#</th>
                      <th className="text-left py-3 px-3 font-semibold text-slate-500 w-36">Date (EDT)</th>
                      <th className="text-left py-3 px-3 font-semibold text-slate-500">Question</th>
                      <th className="text-left py-3 px-3 font-semibold text-slate-500 w-28">Status</th>
                      {isSuperAdmin && <th className="text-right py-3 px-3 font-semibold text-slate-500 w-20">Actions</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {challenges.map((c, idx) => {
                      const status = getStatusLabel(c.scheduledDate, today);
                      return (
                        <tr
                          key={c.id}
                          className={`transition-colors ${status === 'today' ? 'bg-amber-50/60' : 'hover:bg-slate-50/50'}`}
                        >
                          <td className="py-3 px-3 font-bold text-slate-400 text-xs">{idx + 1}</td>
                          <td className="py-3 px-3">
                            {c.scheduledDate ? (
                              <span className="font-medium text-slate-700">{formatDate(c.scheduledDate)}</span>
                            ) : (
                              <span className="text-slate-400 italic text-xs">No date</span>
                            )}
                          </td>
                          <td className="py-3 px-3 max-w-xs">
                            <p className="text-slate-700 font-medium truncate">{c.question}</p>
                            <p className="text-slate-400 text-xs mt-0.5 truncate">
                              Correct: <span className="text-green-600">{c.options[c.correct]}</span>
                            </p>
                          </td>
                          <td className="py-3 px-3">
                            <StatusBadge status={status} />
                          </td>
                          {isSuperAdmin && (
                            <td className="py-3 px-3 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button onClick={() => openEdit(c)} className="p-1.5 hover:bg-blue-100 rounded-lg transition-colors text-blue-500" title="Edit">
                                  <Edit3 size={14} />
                                </button>
                                <button onClick={() => deleteChallenge(c.id)} className="p-1.5 hover:bg-red-100 rounded-lg transition-colors text-red-500" title="Delete">
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* ── Info card */}
        <div className="px-5 py-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl">
          <div className="flex items-start gap-3">
            {isSuperAdmin
              ? <AlertTriangle size={18} className="text-amber-600 mt-0.5 shrink-0" />
              : <Lock size={18} className="text-amber-600 mt-0.5 shrink-0" />}
            <div className="text-sm text-amber-700">
              <p className="font-semibold mb-1">{isSuperAdmin ? 'How auto-rotation works:' : 'View Only Mode:'}</p>
              {isSuperAdmin ? (
                <p>Each challenge is tied to a specific date. The system automatically serves the correct challenge based on the current date in Eastern Time — no manual switching needed. Schedule up to 30 days in advance using the form or JSON batch upload.</p>
              ) : (
                <p>Only <strong>Super Administrators</strong> can manage the daily challenge schedule. Contact your super admin to make changes.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════
          Add / Edit Single Challenge Modal
      ════════════════════════════════════════════════════════════ */}
      {showForm && isSuperAdmin && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200/60 max-h-[92vh] overflow-y-auto">
            <div className="px-6 py-5 border-b border-slate-200/60 bg-gradient-to-r from-slate-50 to-amber-50">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-3">
                <Flame className="text-amber-600" size={20} />
                {editingId ? 'Edit Challenge' : 'Add Challenge'}
              </h3>
            </div>

            <div className="p-6 space-y-5">
              {/* Scheduled Date */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Scheduled Date <span className="text-amber-500">*</span>
                  <span className="ml-1 text-xs font-normal text-slate-400">(Eastern Time)</span>
                </label>
                <input
                  type="date"
                  value={form.scheduledDate}
                  onChange={e => setForm({ ...form, scheduledDate: e.target.value })}
                  className="w-full px-4 py-3 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 bg-slate-50"
                />
                {form.scheduledDate && form.scheduledDate < today && (
                  <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                    <Info size={12} /> This date is in the past — the challenge won't be shown to users today.
                  </p>
                )}
              </div>

              {/* Question */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Question <span className="text-amber-500">*</span></label>
                <textarea
                  value={form.question}
                  onChange={e => setForm({ ...form, question: e.target.value })}
                  className="w-full px-4 py-3 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 bg-slate-50 hover:bg-white transition-colors"
                  placeholder="Enter the challenge question..."
                  rows={3}
                />
              </div>

              {/* Options */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Answer Options <span className="text-amber-500">*</span>
                  <span className="ml-1 text-xs font-normal text-slate-400">(select the correct answer)</span>
                </label>
                <div className="space-y-2">
                  {form.options.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="correct-answer"
                        checked={form.correct === idx}
                        onChange={() => setForm({ ...form, correct: idx })}
                        className="w-4 h-4 text-amber-600 shrink-0"
                      />
                      <input
                        type="text"
                        value={opt}
                        onChange={e => {
                          const opts = [...form.options];
                          opts[idx] = e.target.value;
                          setForm({ ...form, options: opts });
                        }}
                        className="flex-1 px-4 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 bg-slate-50 hover:bg-white transition-colors"
                        placeholder={`Option ${idx + 1}`}
                      />
                      {form.correct === idx && <CheckCircle className="text-green-500 shrink-0" size={18} />}
                    </div>
                  ))}
                </div>
              </div>

              {/* Explanation */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Explanation <span className="text-amber-500">*</span></label>
                <textarea
                  value={form.explanation}
                  onChange={e => setForm({ ...form, explanation: e.target.value })}
                  className="w-full px-4 py-3 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 bg-slate-50 hover:bg-white transition-colors"
                  placeholder="Explain why this is the correct answer..."
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => { setShowForm(false); setEditingId(null); }}
                  className="flex-1 py-3 text-sm font-semibold text-slate-600 border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={saveChallenge}
                  disabled={submitting || !form.question.trim() || form.options.some(o => !o.trim()) || !form.explanation.trim()}
                  className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white text-sm font-semibold rounded-xl hover:from-amber-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  {submitting
                    ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
                    : <>{editingId ? <Check size={16} /> : <Plus size={16} />} {editingId ? 'Update Challenge' : 'Add Challenge'}</>
                  }
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════
          JSON Upload Modal
      ════════════════════════════════════════════════════════════ */}
      {showJsonModal && isSuperAdmin && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 rounded-2xl shadow-2xl max-w-4xl w-full border border-slate-200/60 max-h-[95vh] overflow-y-auto">

            {/* Modal header */}
            <div className="px-6 py-5 border-b border-slate-200/60 bg-gradient-to-r from-slate-50 to-blue-50 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-3">
                <FileJson className="text-blue-600" size={20} />
                Upload JSON Schedule
              </h3>
              <button onClick={() => setShowJsonModal(false)} className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors">
                <XCircle size={20} className="text-slate-500" />
              </button>
            </div>

            <div className="p-6 space-y-6">

              {/* ── Sample JSON */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setShowSample(!showSample)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors text-sm font-semibold text-slate-700"
                >
                  <span className="flex items-center gap-2">
                    <FileJson size={16} className="text-blue-500" />
                    View Sample JSON Format
                  </span>
                  {showSample ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                {showSample && (
                  <div className="relative">
                    <pre className="p-4 text-xs bg-slate-900 text-green-400 font-mono overflow-x-auto max-h-72 overflow-y-auto leading-relaxed">
                      {SAMPLE_JSON}
                    </pre>
                    <button
                      onClick={copySample}
                      className="absolute top-2 right-2 flex items-center gap-1.5 px-3 py-1.5 bg-white/90 text-slate-700 text-xs font-semibold rounded-lg hover:bg-white transition-colors shadow"
                    >
                      <Copy size={12} />
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                )}
                {/* Format reference */}
                <div className="px-4 py-3 bg-blue-50 border-t border-slate-200 text-xs text-blue-700">
                  <p className="font-semibold mb-1">Required fields per challenge:</p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
                    <p><code className="bg-blue-100 px-1 rounded">question</code> — string</p>
                    <p><code className="bg-blue-100 px-1 rounded">correct</code> — number 0–3 (index)</p>
                    <p><code className="bg-blue-100 px-1 rounded">options</code> — array of exactly 4 strings</p>
                    <p><code className="bg-blue-100 px-1 rounded">explanation</code> — string</p>
                  </div>
                </div>
              </div>

              {/* ── Start Date + info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Start Date <span className="text-blue-500">*</span>
                    <span className="ml-1 text-xs font-normal text-slate-400">(Challenge #1 = this date)</span>
                  </label>
                  <input
                    type="date"
                    value={jsonStartDate}
                    onChange={e => { setJsonStartDate(e.target.value); setParsed(null); }}
                    className="w-full px-4 py-3 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
                  />
                </div>
                <div className="flex items-end">
                  <div className="px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-700 w-full">
                    <p className="font-semibold mb-1">Date assignment:</p>
                    <p>Challenge 1 → Start date<br />Challenge 2 → Start date + 1 day<br />… and so on.</p>
                  </div>
                </div>
              </div>

              {/* ── JSON textarea */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Paste JSON <span className="text-blue-500">*</span>
                  <span className="ml-1 text-xs font-normal text-slate-400">(array of up to {MAX_CHALLENGES} challenges)</span>
                </label>
                <textarea
                  value={jsonInput}
                  onChange={e => { setJsonInput(e.target.value); setParsed(null); setParseError(null); }}
                  className="w-full px-4 py-3 text-sm font-mono border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 hover:bg-white transition-colors"
                  placeholder={`[\n  {\n    "question": "...",\n    "options": ["A", "B", "C", "D"],\n    "correct": 0,\n    "explanation": "..."\n  }\n]`}
                  rows={10}
                />
              </div>

              {/* Parse error */}
              {parseError && (
                <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-start gap-2">
                  <XCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
                  {parseError}
                </div>
              )}

              {/* Parse button */}
              {!parsed && (
                <button
                  onClick={parseJson}
                  className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-semibold rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all shadow-md"
                >
                  Parse &amp; Preview
                </button>
              )}

              {/* ── Preview table */}
              {parsed && (
                <div>
                  <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                    <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                      <CheckCircle size={16} className="text-green-500" />
                      Preview — {parsed.length} challenge{parsed.length !== 1 ? 's' : ''} parsed successfully
                    </h4>
                    <button onClick={() => setParsed(null)} className="text-xs text-slate-500 hover:text-slate-700 underline">
                      Re-parse
                    </button>
                  </div>

                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <div className="overflow-x-auto max-h-80 overflow-y-auto">
                      <table className="w-full text-sm">
                        <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 z-10">
                          <tr>
                            <th className="text-left py-2.5 px-3 font-semibold text-slate-500 w-10">#</th>
                            <th className="text-left py-2.5 px-3 font-semibold text-slate-500 w-32">Date (EDT)</th>
                            <th className="text-left py-2.5 px-3 font-semibold text-slate-500">Question</th>
                            <th className="text-left py-2.5 px-3 font-semibold text-slate-500 w-36">Correct Answer</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {parsed.map((c, idx) => {
                            const date = addDays(jsonStartDate, idx);
                            const isToday = date === today;
                            return (
                              <tr key={idx} className={isToday ? 'bg-amber-50' : 'hover:bg-slate-50'}>
                                <td className="py-2.5 px-3 font-bold text-slate-400 text-xs">{idx + 1}</td>
                                <td className="py-2.5 px-3">
                                  <span className="font-medium text-slate-700 text-xs">{formatDate(date)}</span>
                                  {isToday && <span className="ml-1 text-xs text-amber-500 font-semibold">Today</span>}
                                </td>
                                <td className="py-2.5 px-3 text-slate-700 max-w-xs">
                                  <p className="truncate text-xs">{c.question}</p>
                                </td>
                                <td className="py-2.5 px-3 text-green-600 font-medium text-xs">
                                  <p className="truncate">{c.options[c.correct]}</p>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="mt-4 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700">
                    <p className="font-semibold mb-0.5">This will replace ALL existing challenges</p>
                    <p className="text-xs">All currently scheduled challenges will be deleted and replaced with these {parsed.length} new ones.</p>
                  </div>

                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={() => { setShowJsonModal(false); setParsed(null); }}
                      className="flex-1 py-3 text-sm font-semibold text-slate-600 border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={confirmBulkUpload}
                      disabled={bulkUploading}
                      className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-semibold rounded-xl hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg flex items-center justify-center gap-2"
                    >
                      {bulkUploading
                        ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Uploading...</>
                        : <><Upload size={16} /> Confirm Upload ({parsed.length} challenge{parsed.length !== 1 ? 's' : ''})</>
                      }
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyChallengeAdmin;
