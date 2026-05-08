/**
 * Schedule Manager
 * Admin tool to set release dates and due dates for modules and case study weeks,
 * scoped per class code. Supports:
 *   - Individual scheduling with inline edit form
 *   - Multi-select + bulk scheduling
 *   - Auto-Review the explanations and try againizard (pick start date + cadence)
 *   - Copy schedules from another class code
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Calendar,
  Trash2,
  Edit3,
  Plus,
  Check,
  X,
  Loader2,
  AlertCircle,
  Info,
  Lock,
  ChevronDown,
  ChevronUp,
  BookOpen,
  FileText,
  Copy,
  Wand2,
  CheckSquare,
  Square,
  Minus,
} from 'lucide-react';
import {
  getContentSchedulesByClassCode,
  setContentSchedule,
  deleteContentSchedule,
  getActiveCaseStudy,
} from '../firebase/firestore.service';
import { MODULES } from '../hooks/useModuleScore';
import type { ClassCode, ContentSchedule } from '../auth/types/auth.types';

interface ScheduleManagerProps {
  classCodes: ClassCode[];
  organizationId: string;
  userId: string;
}

interface ContentItem {
  id: string;
  name: string;
  icon: string;
  phase?: string;
  contentType: 'module' | 'caseStudyWeek';
}

interface BulkEditState {
  releaseDate: string;
  dueDate: string;
  hasDueDate: boolean;
  onDueDateAction: 'lock' | 'report-only';
}

interface WizardState {
  startDate: string;
  cadenceDays: number;
  hasDueDate: boolean;
  dueDaysAfterRelease: number;
  onDueDateAction: 'lock' | 'report-only';
  applyTo: 'all' | 'modules' | 'caseStudies';
}

const ALL_MODULES: ContentItem[] = [
  { id: MODULES.WHAT_IS_MONEY.id, name: MODULES.WHAT_IS_MONEY.name, icon: '💵', phase: 'Phase 1: Foundations', contentType: 'module' },
  { id: MODULES.BUDGETING_50_30_20.id, name: MODULES.BUDGETING_50_30_20.name, icon: '💰', phase: 'Phase 1: Foundations', contentType: 'module' },
  { id: MODULES.NEEDS_WANTS.id, name: MODULES.NEEDS_WANTS.name, icon: '⚖️', phase: 'Phase 1: Foundations', contentType: 'module' },
  { id: MODULES.BANKING.id, name: MODULES.BANKING.name, icon: '🏧', phase: 'Phase 1: Foundations', contentType: 'module' },
  { id: MODULES.EMERGENCY_FUND.id, name: MODULES.EMERGENCY_FUND.name, icon: '🆘', phase: 'Phase 1: Foundations', contentType: 'module' },
  { id: MODULES.TAX_BASICS.id, name: MODULES.TAX_BASICS.name, icon: '🧾', phase: 'Phase 2: Taxes, Saving & Credit', contentType: 'module' },
  { id: MODULES.INTEREST_RATES.id, name: MODULES.INTEREST_RATES.name, icon: '📊', phase: 'Phase 2: Taxes, Saving & Credit', contentType: 'module' },
  { id: MODULES.CREDIT_SCORE.id, name: MODULES.CREDIT_SCORE.name, icon: '💳', phase: 'Phase 2: Taxes, Saving & Credit', contentType: 'module' },
  { id: MODULES.DEBT_MANAGEMENT.id, name: MODULES.DEBT_MANAGEMENT.name, icon: '💸', phase: 'Phase 2: Taxes, Saving & Credit', contentType: 'module' },
  { id: MODULES.CONSUMER_TRAPS.id, name: MODULES.CONSUMER_TRAPS.name, icon: '🎯', phase: 'Phase 2: Taxes, Saving & Credit', contentType: 'module' },
  { id: MODULES.RISK_TAKING.id, name: MODULES.RISK_TAKING.name, icon: '🎲', phase: 'Phase 3: Protection', contentType: 'module' },
  { id: MODULES.INSURANCE.id, name: MODULES.INSURANCE.name, icon: '🛡️', phase: 'Phase 3: Protection', contentType: 'module' },
  { id: MODULES.FINANCIAL_SAFETY.id, name: MODULES.FINANCIAL_SAFETY.name, icon: '🔒', phase: 'Phase 3: Protection', contentType: 'module' },
  { id: MODULES.COMPOUNDING.id, name: MODULES.COMPOUNDING.name, icon: '📈', phase: 'Phase 4: Investing & Assets', contentType: 'module' },
  { id: MODULES.INFLATION_DEFLATION.id, name: MODULES.INFLATION_DEFLATION.name, icon: '💹', phase: 'Phase 4: Investing & Assets', contentType: 'module' },
  { id: MODULES.BONDS.id, name: MODULES.BONDS.name, icon: '📜', phase: 'Phase 4: Investing & Assets', contentType: 'module' },
  { id: MODULES.STOCK_MARKET.id, name: MODULES.STOCK_MARKET.name, icon: '📊', phase: 'Phase 4: Investing & Assets', contentType: 'module' },
  { id: MODULES.INVESTMENT_VEHICLES.id, name: MODULES.INVESTMENT_VEHICLES.name, icon: '🚗', phase: 'Phase 4: Investing & Assets', contentType: 'module' },
  { id: MODULES.REAL_ESTATE.id, name: MODULES.REAL_ESTATE.name, icon: '🏠', phase: 'Phase 4: Investing & Assets', contentType: 'module' },
  { id: MODULES.RETIREMENT_ACCOUNTS.id, name: MODULES.RETIREMENT_ACCOUNTS.name, icon: '👴', phase: 'Phase 4: Investing & Assets', contentType: 'module' },
  { id: MODULES.ACCOUNTING.id, name: MODULES.ACCOUNTING.name, icon: '📋', phase: 'Phase 5: Accounting', contentType: 'module' },
  { id: MODULES.BALANCE_SHEET.id, name: MODULES.BALANCE_SHEET.name, icon: '⚖️', phase: 'Phase 5: Accounting', contentType: 'module' },
  { id: MODULES.INCOME_STATEMENT.id, name: MODULES.INCOME_STATEMENT.name, icon: '📊', phase: 'Phase 5: Accounting', contentType: 'module' },
  { id: MODULES.CASH_FLOW_STATEMENT.id, name: MODULES.CASH_FLOW_STATEMENT.name, icon: '💧', phase: 'Phase 5: Accounting', contentType: 'module' },
  { id: MODULES.CRYPTO.id, name: MODULES.CRYPTO.name, icon: '₿', phase: 'Phase 6: Advanced', contentType: 'module' },
  { id: MODULES.INVESTMENT_BANKING.id, name: MODULES.INVESTMENT_BANKING.name, icon: '🏦', phase: 'Phase 6: Advanced', contentType: 'module' },
  { id: MODULES.GIVING.id, name: MODULES.GIVING.name, icon: '💝', phase: 'Phase 6: Advanced', contentType: 'module' },
  { id: MODULES.GLOBAL_MARKETS.id, name: MODULES.GLOBAL_MARKETS.name, icon: '🌍', phase: 'Phase 6: Advanced', contentType: 'module' },
  { id: MODULES.ESG_INVESTING.id, name: MODULES.ESG_INVESTING.name, icon: '🌱', phase: 'Phase 6: Advanced', contentType: 'module' },
  { id: MODULES.NEGOTIATING.id, name: MODULES.NEGOTIATING.name, icon: '🤝', phase: 'Phase 6: Advanced', contentType: 'module' },
];

function toInputDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function addDays(d: Date, days: number): Date {
  const result = new Date(d);
  result.setDate(result.getDate() + days);
  return result;
}

function formatDate(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function scheduleStatus(s: ContentSchedule): 'upcoming' | 'active' | 'overdue' {
  const now = new Date();
  if (s.releaseDate > now) return 'upcoming';
  if (s.dueDate && s.dueDate < now) return 'overdue';
  return 'active';
}

const itemKey = (item: ContentItem) => `${item.contentType}:${item.id}`;

const ScheduleManager: React.FC<ScheduleManagerProps> = ({ classCodes, organizationId, userId }) => {
  const [selectedClassCode, setSelectedClassCode] = useState<ClassCode | null>(
    classCodes.length === 1 ? classCodes[0] : null
  );
  const [schedules, setSchedules] = useState<ContentSchedule[]>([]);
  const [caseStudyWeeks, setCaseStudyWeeks] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [bulkSaving, setBulkSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'modules' | 'caseStudies'>('modules');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Inline single-item edit
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editRelease, setEditRelease] = useState('');
  const [editDue, setEditDue] = useState('');
  const [editHasDue, setEditHasDue] = useState(false);
  const [editAction, setEditAction] = useState<'lock' | 'report-only'>('lock');
  const [editSaving, setEditSaving] = useState(false);

  // Multi-select
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [selectionMode, setSelectionMode] = useState(false);

  // Bulk edit panel
  const [showBulkPanel, setShowBulkPanel] = useState(false);
  const [bulk, setBulk] = useState<BulkEditState>({
    releaseDate: toInputDate(new Date()),
    dueDate: '',
    hasDueDate: false,
    onDueDateAction: 'lock',
  });

  // Wizard
  const [showWizard, setShowWizard] = useState(false);
  const [wizard, setWizard] = useState<WizardState>({
    startDate: toInputDate(new Date()),
    cadenceDays: 7,
    hasDueDate: true,
    dueDaysAfterRelease: 6,
    onDueDateAction: 'lock',
    applyTo: 'all',
  });
  const [wizardSaving, setWizardSaving] = useState(false);

  // Copy-from-class
  const [showCopy, setShowCopy] = useState(false);
  const [copySourceCode, setCopySourceCode] = useState<string>('');
  const [copySaving, setCopySaving] = useState(false);

  // Sidebar toggle
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Phase expansion
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(new Set(
    ['Phase 1: Foundations', 'Phase 2: Taxes, Saving & Credit', 'Phase 3: Protection',
     'Phase 4: Investing & Assets', 'Phase 5: Accounting', 'Phase 6: Advanced']
  ));

  useEffect(() => {
    (async () => {
      try {
        const study = await getActiveCaseStudy();
        if (study?.weeks) {
          const weeksData = study.weeks as Record<string | number, { subject?: string }>;
          setCaseStudyWeeks(
            Object.keys(weeksData).map(Number).sort((a, b) => a - b).map(n => ({
              id: String(n),
              name: weeksData[n]?.subject ? `Week ${n}: ${weeksData[n].subject}` : `Week ${n} Case Study`,
              icon: '📚',
              contentType: 'caseStudyWeek' as const,
            }))
          );
        }
      } catch { /* no active case study */ }
    })();
  }, []);

  const loadSchedules = useCallback(async (code: string) => {
    setLoading(true);
    setError(null);
    try {
      setSchedules(await getContentSchedulesByClassCode(code));
    } catch {
      setError('Failed to load schedules. Make sure Firestore rules are deployed.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedClassCode) { loadSchedules(selectedClassCode.code); setSelected(new Set()); setEditingKey(null); setShowBulkPanel(false); }
  }, [selectedClassCode, loadSchedules]);

  const getSchedule = (id: string, ct: 'module' | 'caseStudyWeek') =>
    schedules.find(s => s.contentId === id && s.contentType === ct) ?? null;

  // ── Single-item edit ──────────────────────────────────────────────────────
  const openEdit = (item: ContentItem) => {
    const ex = getSchedule(item.id, item.contentType);
    setEditingKey(itemKey(item));
    setEditRelease(ex ? toInputDate(ex.releaseDate) : toInputDate(new Date()));
    setEditDue(ex?.dueDate ? toInputDate(ex.dueDate) : '');
    setEditHasDue(!!ex?.dueDate);
    setEditAction(ex?.onDueDateAction ?? 'lock');
    setShowBulkPanel(false);
    setSelected(new Set());
  };

  const saveEdit = async (item: ContentItem) => {
    if (!selectedClassCode || !editRelease) return;
    if (editHasDue && editDue && editDue <= editRelease) { setError('Due date must be after release date'); return; }
    setEditSaving(true);
    setError(null);
    try {
      await setContentSchedule(
        selectedClassCode.code, organizationId, item.contentType, item.id,
        new Date(editRelease + 'T00:00:00'),
        editHasDue && editDue ? new Date(editDue + 'T23:59:59') : null,
        editAction, userId
      );
      setSuccess('Schedule saved');
      setEditingKey(null);
      setTimeout(() => setSuccess(null), 3000);
      await loadSchedules(selectedClassCode.code);
    } catch { setError('Failed to save schedule'); }
    finally { setEditSaving(false); }
  };

  const removeSchedule = async (s: ContentSchedule) => {
    if (!confirm('Remove this schedule?')) return;
    setError(null);
    try {
      await deleteContentSchedule(s.id);
      setSchedules(prev => prev.filter(x => x.id !== s.id));
      setSuccess('Schedule removed');
      setTimeout(() => setSuccess(null), 3000);
    } catch { setError('Failed to remove schedule'); }
  };

  // ── Selection helpers ─────────────────────────────────────────────────────
  const currentItems = activeTab === 'modules' ? ALL_MODULES : caseStudyWeeks;
  const phaseItems = (phase: string) => ALL_MODULES.filter(m => m.phase === phase);
  const toggleItem = (item: ContentItem) =>
    setSelected(prev => { const n = new Set(prev); n.has(itemKey(item)) ? n.delete(itemKey(item)) : n.add(itemKey(item)); return n; });
  const togglePhaseItems = (phase: string) => {
    const keys = phaseItems(phase).map(itemKey);
    const allSelected = keys.every(k => selected.has(k));
    setSelected(prev => { const n = new Set(prev); keys.forEach(k => allSelected ? n.delete(k) : n.add(k)); return n; });
  };
  const selectAll = () => setSelected(new Set(currentItems.map(itemKey)));
  const clearAll = () => setSelected(new Set());
  const togglePhase = (phase: string) =>
    setExpandedPhases(prev => { const n = new Set(prev); n.has(phase) ? n.delete(phase) : n.add(phase); return n; });

  // ── Bulk schedule ─────────────────────────────────────────────────────────
  const saveBulk = async () => {
    if (!selectedClassCode || selected.size === 0 || !bulk.releaseDate) return;
    if (bulk.hasDueDate && bulk.dueDate && bulk.dueDate <= bulk.releaseDate) { setError('Due date must be after release date'); return; }
    setBulkSaving(true);
    setError(null);
    const release = new Date(bulk.releaseDate + 'T00:00:00');
    const due = bulk.hasDueDate && bulk.dueDate ? new Date(bulk.dueDate + 'T23:59:59') : null;
    try {
      const selectedItems = [...ALL_MODULES, ...caseStudyWeeks].filter(i => selected.has(itemKey(i)));
      await Promise.all(selectedItems.map(item =>
        setContentSchedule(selectedClassCode.code, organizationId, item.contentType, item.id, release, due, bulk.onDueDateAction, userId)
      ));
      setSuccess(`Scheduled ${selectedItems.length} item${selectedItems.length > 1 ? 's' : ''}`);
      setTimeout(() => setSuccess(null), 4000);
      setSelected(new Set());
      setShowBulkPanel(false);
      setSelectionMode(false);
      await loadSchedules(selectedClassCode.code);
    } catch { setError('Bulk save failed — check permissions'); }
    finally { setBulkSaving(false); }
  };

  // ── Auto-schedule Wizard ──────────────────────────────────────────────────
  const runWizard = async () => {
    if (!selectedClassCode || !wizard.startDate) return;
    setWizardSaving(true);
    setError(null);
    try {
      const items =
        wizard.applyTo === 'modules' ? ALL_MODULES :
        wizard.applyTo === 'caseStudies' ? caseStudyWeeks :
        [...ALL_MODULES, ...caseStudyWeeks];
      let base = new Date(wizard.startDate + 'T00:00:00');
      await Promise.all(items.map((item, i) => {
        const release = addDays(base, i * wizard.cadenceDays);
        const due = wizard.hasDueDate ? addDays(release, wizard.dueDaysAfterRelease) : null;
        return setContentSchedule(selectedClassCode.code, organizationId, item.contentType, item.id, release, due, wizard.onDueDateAction, userId);
      }));
      setSuccess(`Auto-scheduled ${items.length} items starting ${formatDate(new Date(wizard.startDate + 'T00:00:00'))}`);
      setTimeout(() => setSuccess(null), 5000);
      setShowWizard(false);
      await loadSchedules(selectedClassCode.code);
    } catch { setError('Wizard failed — check permissions'); }
    finally { setWizardSaving(false); }
  };

  // ── Copy from class ───────────────────────────────────────────────────────
  const runCopy = async () => {
    if (!selectedClassCode || !copySourceCode) return;
    const sourceCode = classCodes.find(c => c.code === copySourceCode);
    if (!sourceCode) return;
    setCopySaving(true);
    setError(null);
    try {
      const sourceSchedules = await getContentSchedulesByClassCode(copySourceCode);
      if (sourceSchedules.length === 0) { setError('Source class has no schedules to copy'); setCopySaving(false); return; }
      await Promise.all(sourceSchedules.map(s =>
        setContentSchedule(selectedClassCode.code, organizationId, s.contentType, s.contentId, s.releaseDate, s.dueDate ?? null, s.onDueDateAction, userId)
      ));
      setSuccess(`Copied ${sourceSchedules.length} schedule${sourceSchedules.length > 1 ? 's' : ''} from ${sourceCode.name}`);
      setTimeout(() => setSuccess(null), 4000);
      setShowCopy(false);
      await loadSchedules(selectedClassCode.code);
    } catch { setError('Copy failed'); }
    finally { setCopySaving(false); }
  };

  // ── Badge ─────────────────────────────────────────────────────────────────
  const renderBadge = (s: ContentSchedule | null) => {
    if (!s) return null;
    const status = scheduleStatus(s);
    const cfg = {
      upcoming: { cls: 'bg-blue-100 text-blue-700', label: `Opens ${formatDate(s.releaseDate)}` },
      active: { cls: 'bg-green-100 text-green-700', label: s.dueDate ? `Due ${formatDate(s.dueDate)}` : `Open since ${formatDate(s.releaseDate)}` },
      overdue: { cls: s.onDueDateAction === 'lock' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700', label: s.onDueDateAction === 'lock' ? 'Locked (past due)' : 'Past due (report only)' },
    }[status];
    return <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.cls}`}><Calendar className="h-3 w-3" />{cfg.label}</span>;
  };

  // ── Row renderer ──────────────────────────────────────────────────────────
  const renderRow = (item: ContentItem, index?: number) => {
    const sched = getSchedule(item.id, item.contentType);
    const key = itemKey(item);
    const isEditing = editingKey === key;
    const isChecked = selected.has(key);

    return (
      <div key={key}>
        <div className={`px-4 py-3 hover:bg-gray-50 transition-colors ${isChecked ? 'bg-blue-50' : ''}`}>
          <div className="flex items-center gap-3">
            {/* Checkbox (selection mode) */}
            {selectionMode && (
              <button onClick={() => toggleItem(item)} className="flex-shrink-0 text-blue-600">
                {isChecked ? <CheckSquare className="h-5 w-5" /> : <Square className="h-5 w-5 text-gray-400" />}
              </button>
            )}

            <span className="text-xl flex-shrink-0">{item.icon}</span>
            {index !== undefined && <span className="text-xs text-gray-400 font-mono w-6 flex-shrink-0">#{index + 1}</span>}

            <div className="flex-1 min-w-0">
              <span className="text-sm font-medium text-gray-900 block truncate">{item.name}</span>
              {renderBadge(sched)}
            </div>

            {!selectionMode && (
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {sched && !isEditing && (
                  <button onClick={() => removeSchedule(sched)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors" title="Remove">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
                <button
                  onClick={() => isEditing ? setEditingKey(null) : openEdit(item)}
                  className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                    isEditing ? 'bg-gray-100 text-gray-600' : sched ? 'bg-blue-50 text-blue-700 hover:bg-blue-100' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {isEditing ? <><X className="h-3 w-3" />Cancel</> : sched ? <><Edit3 className="h-3 w-3" />Edit</> : <><Plus className="h-3 w-3" />Schedule</>}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Inline edit form */}
        {isEditing && (
          <div className="mx-4 mb-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <p className="text-xs font-bold text-blue-800 mb-3 uppercase tracking-wide">Schedule: {item.name}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Release Date <span className="text-red-500">*</span></label>
                <input type="date" value={editRelease} onChange={e => setEditRelease(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white" />
              </div>
              <div>
                <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 mb-1 cursor-pointer">
                  <input type="checkbox" checked={editHasDue} onChange={e => setEditHasDue(e.target.checked)} className="w-3.5 h-3.5 text-blue-600 rounded" />
                  Add Due Date
                </label>
                <input type="date" value={editDue} disabled={!editHasDue} onChange={e => setEditDue(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-gray-100 disabled:text-gray-400" />
              </div>
            </div>
            {editHasDue && (
              <div className="mb-3">
                <label className="block text-xs font-semibold text-gray-700 mb-2">When due date passes…</label>
                <div className="flex gap-2">
                  {(['lock', 'report-only'] as const).map(v => (
                    <label key={v} className={`flex-1 flex items-start gap-2 p-2.5 border-2 rounded-lg cursor-pointer ${editAction === v ? (v === 'lock' ? 'border-red-400 bg-red-50' : 'border-orange-400 bg-orange-50') : 'border-gray-200 bg-white'}`}>
                      <input type="radio" name={`action-${key}`} value={v} checked={editAction === v} onChange={() => setEditAction(v)} className="mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-gray-800">{v === 'lock' ? '🔒 Lock content' : '📊 Report only'}</p>
                        <p className="text-xs text-gray-500">{v === 'lock' ? 'Students lose access' : 'Stays open, flagged late'}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}
            <div className="flex gap-2 justify-end">
              <button onClick={() => setEditingKey(null)} className="px-3 py-1.5 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={() => saveEdit(item)} disabled={editSaving || !editRelease} className="px-3 py-1.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-1.5 disabled:opacity-50">
                {editSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                Save
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const modulesByPhase = ALL_MODULES.reduce((acc, m) => {
    const ph = m.phase!;
    (acc[ph] ??= []).push(m);
    return acc;
  }, {} as Record<string, ContentItem[]>);

  const scheduledCount = schedules.length;

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Content Scheduler</h2>
        <p className="text-gray-600">Set release and due dates for modules and case study weeks, per class code.</p>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700 flex-1">{error}</p>
          <button onClick={() => setError(null)}><X className="h-4 w-4 text-red-500" /></button>
        </div>
      )}
      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-3 flex items-start gap-3">
          <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-green-700 flex-1">{success}</p>
          <button onClick={() => setSuccess(null)}><X className="h-4 w-4 text-green-500" /></button>
        </div>
      )}

      <div className={`grid gap-6 ${sidebarOpen ? 'grid-cols-1 xl:grid-cols-12' : 'grid-cols-1'}`}>
        {/* ── Left: class selector ─────────────────────────────────────── */}
        {sidebarOpen && (
          <div className="xl:col-span-3 space-y-4">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-gray-800">Select Class</p>
                  <p className="text-xs text-gray-500 mt-0.5">Schedules are per class code</p>
                </div>
                <button onClick={() => setSidebarOpen(false)} title="Hide sidebar" className="p-1.5 hover:bg-blue-100 rounded-lg transition-colors text-gray-500 hover:text-gray-700">
                  <X className="h-5 w-5" />
                </button>
              </div>
              {classCodes.length === 0 ? (
                <p className="p-4 text-center text-sm text-gray-500">No class codes yet.</p>
              ) : (
                <div className="divide-y divide-gray-100 max-h-[320px] overflow-y-auto">
                  {classCodes.map(code => (
                    <button key={code.id} onClick={() => setSelectedClassCode(code)}
                      className={`w-full px-4 py-3 text-left transition-colors ${selectedClassCode?.id === code.id ? 'bg-blue-50 border-l-4 border-blue-500' : 'hover:bg-gray-50'}`}>
                      <p className="text-sm font-semibold text-gray-800">{code.name}</p>
                      <p className="text-xs text-gray-400 font-mono mt-0.5">{code.code}</p>
                    </button>
                  ))}
                </div>
              )}
              {selectedClassCode && (
                <div className="px-4 py-2.5 bg-gray-50 border-t text-xs text-gray-600 flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-blue-500" />
                  <span className="font-semibold">{scheduledCount}</span> item{scheduledCount !== 1 ? 's' : ''} scheduled
                </div>
              )}
            </div>

            {/* Legend */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 space-y-1.5">
              <p className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Status</p>
              {[['bg-blue-500','Upcoming — not released'],['bg-green-500','Active — open'],['bg-red-500','Locked — past due'],['bg-orange-500','Past due — report only']].map(([color, label]) => (
                <div key={label} className="flex items-center gap-2 text-xs text-gray-600">
                  <span className={`w-2 h-2 rounded-full ${color}`} />{label}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Toggle button when sidebar is hidden */}
        {!sidebarOpen && (
          <button onClick={() => setSidebarOpen(true)} title="Show sidebar" className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 w-fit mb-2">
            <ChevronDown className="h-4 w-4" />
            Classes
          </button>
        )}

        {/* ── Right: content list ───────────────────────────────────────── */}
        <div className={sidebarOpen ? 'xl:col-span-9' : 'col-span-1 xl:col-span-12'}>
          {!selectedClassCode ? (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
              <Calendar className="h-12 w-12 text-blue-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-800 mb-2">Select a class to manage schedules</h3>
              <p className="text-gray-500 text-sm">Choose a class code from the left panel.</p>
            </div>
          ) : (
            <>
              {/* Toolbar */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {/* Tabs */}
                <div className="flex gap-1 bg-gray-100 p-1 rounded-xl flex-shrink-0">
                  {([['modules','Modules','BookOpen'],['caseStudies','Case Studies','FileText']] as [string,string,string][]).map(([v, label]) => (
                    <button key={v} onClick={() => { setActiveTab(v as 'modules'|'caseStudies'); setSelected(new Set()); }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-lg transition-colors ${activeTab === v ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'}`}>
                      {v === 'modules' ? <BookOpen className="h-3.5 w-3.5" /> : <FileText className="h-3.5 w-3.5" />}
                      {label}
                    </button>
                  ))}
                </div>

                <div className="flex-1" />

                {/* Selection toggle */}
                <button onClick={() => { setSelectionMode(m => !m); setSelected(new Set()); setShowBulkPanel(false); }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-lg border transition-colors ${selectionMode ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}>
                  <CheckSquare className="h-4 w-4" />
                  {selectionMode ? 'Exit Select' : 'Multi-Schedule'}
                </button>

                {/* Wizard */}
                <button onClick={() => { setShowWizard(true); setShowCopy(false); setShowBulkPanel(false); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-purple-700 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors">
                  <Wand2 className="h-4 w-4" />
                  Auto-Schedule
                </button>

                {/* Copy from class */}
                {classCodes.length > 1 && (
                  <button onClick={() => { setShowCopy(true); setShowWizard(false); setShowBulkPanel(false); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-teal-700 bg-teal-50 border border-teal-200 rounded-lg hover:bg-teal-100 transition-colors">
                    <Copy className="h-4 w-4" />
                    Copy from Class
                  </button>
                )}
              </div>

              {/* Selection bar */}
              {selectionMode && (
                <div className="mb-3 flex flex-wrap items-center gap-2 px-4 py-2.5 bg-blue-50 border border-blue-200 rounded-xl">
                  <span className="text-sm font-semibold text-blue-800">{selected.size} selected</span>
                  <button onClick={selectAll} className="text-xs text-blue-600 hover:underline font-medium">Select all</button>
                  <button onClick={clearAll} className="text-xs text-blue-600 hover:underline font-medium">Clear</button>
                  <div className="flex-1" />
                  {selected.size > 0 && (
                    <button onClick={() => setShowBulkPanel(p => !p)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
                      <Calendar className="h-4 w-4" />
                      Schedule {selected.size} item{selected.size > 1 ? 's' : ''}
                    </button>
                  )}
                </div>
              )}

              {/* Bulk panel */}
              {showBulkPanel && selectionMode && selected.size > 0 && (
                <div className="mb-4 p-4 bg-blue-50 border border-blue-300 rounded-xl">
                  <p className="text-sm font-bold text-blue-900 mb-3">Apply to {selected.size} selected item{selected.size > 1 ? 's' : ''}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Release Date <span className="text-red-500">*</span></label>
                      <input type="date" value={bulk.releaseDate} onChange={e => setBulk(b => ({ ...b, releaseDate: e.target.value }))}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white" />
                    </div>
                    <div>
                      <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 mb-1 cursor-pointer">
                        <input type="checkbox" checked={bulk.hasDueDate} onChange={e => setBulk(b => ({ ...b, hasDueDate: e.target.checked }))} className="w-3.5 h-3.5 text-blue-600 rounded" />
                        Add Due Date
                      </label>
                      <input type="date" value={bulk.dueDate} disabled={!bulk.hasDueDate} onChange={e => setBulk(b => ({ ...b, dueDate: e.target.value }))}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white disabled:bg-gray-100" />
                    </div>
                  </div>
                  {bulk.hasDueDate && (
                    <div className="flex gap-2 mb-3">
                      {(['lock','report-only'] as const).map(v => (
                        <label key={v} className={`flex-1 flex items-center gap-2 p-2 border-2 rounded-lg cursor-pointer text-xs ${bulk.onDueDateAction === v ? (v === 'lock' ? 'border-red-400 bg-red-50' : 'border-orange-400 bg-orange-50') : 'border-gray-200 bg-white'}`}>
                          <input type="radio" name="bulk-action" value={v} checked={bulk.onDueDateAction === v} onChange={() => setBulk(b => ({ ...b, onDueDateAction: v }))} />
                          <span className="font-semibold">{v === 'lock' ? '🔒 Lock' : '📊 Report only'}</span>
                        </label>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => setShowBulkPanel(false)} className="px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                    <button onClick={saveBulk} disabled={bulkSaving || !bulk.releaseDate} className="px-4 py-1.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-2 disabled:opacity-50">
                      {bulkSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                      Apply Schedule
                    </button>
                  </div>
                </div>
              )}

              {/* Wizard panel */}
              {showWizard && (
                <div className="mb-4 p-5 bg-purple-50 border border-purple-200 rounded-xl">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Wand2 className="h-5 w-5 text-purple-600" />
                      <p className="text-base font-bold text-purple-900">Auto-Schedule Wizard</p>
                    </div>
                    <button onClick={() => setShowWizard(false)}><X className="h-4 w-4 text-purple-500" /></button>
                  </div>
                  <p className="text-xs text-purple-700 mb-4">Automatically assigns dates to all content with a regular cadence. Each item gets its own release date spaced evenly.</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">First item opens on</label>
                      <input type="date" value={wizard.startDate} onChange={e => setWizard(w => ({ ...w, startDate: e.target.value }))}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Release every N days</label>
                      <input type="number" min={1} max={90} value={wizard.cadenceDays} onChange={e => setWizard(w => ({ ...w, cadenceDays: Number(e.target.value) }))}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Apply to</label>
                      <select value={wizard.applyTo} onChange={e => setWizard(w => ({ ...w, applyTo: e.target.value as WizardState['applyTo'] }))}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white">
                        <option value="all">All content ({ALL_MODULES.length + caseStudyWeeks.length} items)</option>
                        <option value="modules">Modules only ({ALL_MODULES.length} items)</option>
                        <option value="caseStudies">Case studies only ({caseStudyWeeks.length} items)</option>
                      </select>
                    </div>
                    <div>
                      <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 mb-1 cursor-pointer">
                        <input type="checkbox" checked={wizard.hasDueDate} onChange={e => setWizard(w => ({ ...w, hasDueDate: e.target.checked }))} className="w-3.5 h-3.5 text-purple-600 rounded" />
                        Add due dates
                      </label>
                      {wizard.hasDueDate && (
                        <div className="flex items-center gap-2">
                          <input type="number" min={1} max={365} value={wizard.dueDaysAfterRelease} onChange={e => setWizard(w => ({ ...w, dueDaysAfterRelease: Number(e.target.value) }))}
                            className="w-20 px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white" />
                          <span className="text-xs text-gray-600">days after release</span>
                        </div>
                      )}
                    </div>
                  </div>
                  {wizard.hasDueDate && (
                    <>
                      <label className="block text-xs font-semibold text-gray-700 mb-2">What do you want to do when deadline is passed?</label>
                      <div className="flex gap-2 mb-3">
                        {(['lock','report-only'] as const).map(v => (
                          <label key={v} className={`flex-1 flex items-center gap-2 p-2 border-2 rounded-lg cursor-pointer text-xs ${wizard.onDueDateAction === v ? (v === 'lock' ? 'border-red-400 bg-red-50' : 'border-orange-400 bg-orange-50') : 'border-gray-200 bg-white'}`}>
                            <input type="radio" name="wizard-action" value={v} checked={wizard.onDueDateAction === v} onChange={() => setWizard(w => ({ ...w, onDueDateAction: v }))} />
                            <span className="font-semibold">{v === 'lock' ? '🔒 Lock' : '📊 Report only'}</span>
                          </label>
                        ))}
                      </div>
                    </>
                  )}
                  {wizard.startDate && (
                    <div className="mb-3 p-3 bg-white rounded-lg border border-purple-200 text-xs text-purple-800">
                      <span className="font-semibold">Preview:</span>{' '}
                      Item 1 opens {formatDate(new Date(wizard.startDate + 'T00:00:00'))},{' '}
                      Item 2 opens {formatDate(addDays(new Date(wizard.startDate + 'T00:00:00'), wizard.cadenceDays))},
                      {wizard.hasDueDate && ` due ${wizard.dueDaysAfterRelease} days later…`}
                    </div>
                  )}
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => setShowWizard(false)} className="px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                    <button onClick={runWizard} disabled={wizardSaving || !wizard.startDate} className="px-4 py-1.5 text-sm font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-lg flex items-center gap-2 disabled:opacity-50">
                      {wizardSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                      Run Wizard
                    </button>
                  </div>
                </div>
              )}

              {/* Copy-from-class panel */}
              {showCopy && (
                <div className="mb-4 p-4 bg-teal-50 border border-teal-200 rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Copy className="h-4 w-4 text-teal-600" />
                      <p className="text-sm font-bold text-teal-900">Copy Schedules from Another Class</p>
                    </div>
                    <button onClick={() => setShowCopy(false)}><X className="h-4 w-4 text-teal-500" /></button>
                  </div>
                  <p className="text-xs text-teal-700 mb-3">All schedules from the selected class will be copied to <strong>{selectedClassCode.name}</strong>. Existing schedules will be overwritten.</p>
                  <div className="flex gap-2 items-end">
                    <div className="flex-1">
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Copy from</label>
                      <select value={copySourceCode} onChange={e => setCopySourceCode(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white">
                        <option value="">Select a class…</option>
                        {classCodes.filter(c => c.code !== selectedClassCode.code).map(c => (
                          <option key={c.id} value={c.code}>{c.name} ({c.code})</option>
                        ))}
                      </select>
                    </div>
                    <button onClick={runCopy} disabled={copySaving || !copySourceCode} className="px-4 py-2 text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg flex items-center gap-2 disabled:opacity-50">
                      {copySaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Copy className="h-4 w-4" />}
                      Copy
                    </button>
                  </div>
                </div>
              )}

              {/* Info */}
              <div className="mb-4 bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-start gap-2.5">
                <Info className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-blue-800">
                  Content is <strong>locked</strong> until its release date. After release, sequential unlock still applies.
                  Due dates with <strong>Lock</strong> close content; <strong>Report Only</strong> keeps it open but flags late submissions.
                  Schedules apply only to students in <strong>{selectedClassCode.code}</strong>.
                </p>
              </div>

              {/* Content list */}
              {loading ? (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex items-center justify-center p-12">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                </div>
              ) : activeTab === 'modules' ? (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="px-5 py-3.5 bg-gradient-to-r from-indigo-50 to-blue-50 border-b border-gray-200 flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-gray-900">Modules</h3>
                      <p className="text-xs text-gray-500">{ALL_MODULES.filter(m => getSchedule(m.id,'module')).length}/{ALL_MODULES.length} scheduled</p>
                    </div>
                    {selectionMode && (
                      <div className="flex gap-2">
                        <button onClick={selectAll} className="text-xs text-blue-600 font-semibold hover:underline">All</button>
                        <button onClick={clearAll} className="text-xs text-gray-500 font-semibold hover:underline">None</button>
                      </div>
                    )}
                  </div>
                  {Object.entries(modulesByPhase).map(([phase, items]) => {
                    const phaseSelected = items.every(i => selected.has(itemKey(i)));
                    const phaseSome = !phaseSelected && items.some(i => selected.has(itemKey(i)));
                    return (
                      <div key={phase} className="border-b border-gray-100 last:border-0">
                        <div className={`flex items-center px-4 py-2.5 bg-gray-50 border-y border-gray-100 ${selectionMode ? 'cursor-pointer hover:bg-gray-100' : ''}`}
                          onClick={() => selectionMode && togglePhaseItems(phase)}>
                          {selectionMode && (
                            <span className="mr-2 text-blue-600">
                              {phaseSelected ? <CheckSquare className="h-4 w-4" /> : phaseSome ? <Minus className="h-4 w-4" /> : <Square className="h-4 w-4 text-gray-400" />}
                            </span>
                          )}
                          <span className="text-xs font-bold text-gray-700 uppercase tracking-wide flex-1">{phase}</span>
                          <span className="text-xs text-blue-600 font-medium mr-2">{items.filter(m => getSchedule(m.id,'module')).length}/{items.length}</span>
                          {!selectionMode && (
                            <button onClick={() => togglePhase(phase)}>
                              {expandedPhases.has(phase) ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
                            </button>
                          )}
                        </div>
                        {(selectionMode || expandedPhases.has(phase)) && (
                          <div className="divide-y divide-gray-50">
                            {items.map((m, idx) => renderRow(m, idx))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="px-5 py-3.5 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-200 flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-gray-900">Case Study Weeks</h3>
                      <p className="text-xs text-gray-500">{caseStudyWeeks.filter(w => getSchedule(w.id,'caseStudyWeek')).length}/{caseStudyWeeks.length} scheduled</p>
                    </div>
                    {selectionMode && (
                      <div className="flex gap-2">
                        <button onClick={selectAll} className="text-xs text-blue-600 font-semibold hover:underline">All</button>
                        <button onClick={clearAll} className="text-xs text-gray-500 font-semibold hover:underline">None</button>
                      </div>
                    )}
                  </div>
                  {caseStudyWeeks.length === 0 ? (
                    <p className="p-8 text-center text-sm text-gray-500">No active case study. Create one in Case Study Admin.</p>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {caseStudyWeeks.map(w => renderRow(w))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScheduleManager;
