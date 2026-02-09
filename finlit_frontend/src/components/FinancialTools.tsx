import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Calculator,
  PiggyBank,
  TrendingUp,
  Wallet,
  DollarSign,
  Target,
  CreditCard,
  BarChart3,
  Calendar,
  ChevronRight,
  X,
  Sparkles,
  ArrowUpRight,
  Check,
  Shield,
  AlertTriangle,
  Save,
  Download,
  Trash2,
  Clock,
  FileText,
  FolderOpen,
  Loader2
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { db } from '../firebase/config';
import { useAuthContext } from '../auth/context/AuthContext';
import {
  collection,
  doc,
  addDoc,
  getDocs,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
  Timestamp,
  writeBatch
} from 'firebase/firestore';

// Tool Types (moved up for use in SavedCalculation interface)
type ToolId = 'budget' | 'savings' | 'loan' | 'networth' | 'compound' | 'debt-payoff' | 'emergency-fund';

// Types for saved calculations
interface SavedCalculation {
  id: string;
  type: ToolId;
  name: string;
  data: Record<string, any>;
  results: Record<string, any>;
  savedAt: Timestamp | Date;
}

// Tool names for display
const TOOL_NAMES: Record<ToolId, string> = {
  'budget': 'Budget Planner',
  'savings': 'Savings Goals',
  'loan': 'Loan Calculator',
  'networth': 'Net Worth',
  'compound': 'Compound Interest',
  'debt-payoff': 'Debt Payoff',
  'emergency-fund': 'Emergency Fund'
};

// Custom hook for Firestore calculations - optimized with caching
const useCalculations = (userId: string | undefined) => {
  const [calculations, setCalculations] = useState<SavedCalculation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCalculations = useCallback(async () => {
    if (!userId) {
      setCalculations([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const calcsRef = collection(db, 'users', userId, 'savedCalculations');
      const q = query(calcsRef, orderBy('savedAt', 'desc'));
      const snapshot = await getDocs(q);

      const calcs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as SavedCalculation[];

      setCalculations(calcs);
      setError(null);
    } catch (err) {
      console.error('Error fetching calculations:', err);
      setError('Failed to load saved calculations');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchCalculations();
  }, [fetchCalculations]);

  const saveCalculation = async (
    type: ToolId,
    name: string,
    data: Record<string, any>,
    results: Record<string, any>
  ): Promise<boolean> => {
    if (!userId) return false;

    try {
      const calcsRef = collection(db, 'users', userId, 'savedCalculations');
      const newCalc = {
        type,
        name,
        data,
        results,
        savedAt: serverTimestamp()
      };

      const docRef = await addDoc(calcsRef, newCalc);

      // Optimistically update local state
      setCalculations(prev => [{
        id: docRef.id,
        type,
        name,
        data,
        results,
        savedAt: new Date()
      }, ...prev]);

      return true;
    } catch (err) {
      console.error('Error saving calculation:', err);
      return false;
    }
  };

  const deleteCalculation = async (calcId: string): Promise<boolean> => {
    if (!userId) return false;

    try {
      const calcRef = doc(db, 'users', userId, 'savedCalculations', calcId);
      await deleteDoc(calcRef);

      // Optimistically update local state
      setCalculations(prev => prev.filter(c => c.id !== calcId));
      return true;
    } catch (err) {
      console.error('Error deleting calculation:', err);
      return false;
    }
  };

  const clearAllCalculations = async (): Promise<boolean> => {
    if (!userId || calculations.length === 0) return false;

    try {
      const batch = writeBatch(db);
      calculations.forEach(calc => {
        const calcRef = doc(db, 'users', userId, 'savedCalculations', calc.id);
        batch.delete(calcRef);
      });
      await batch.commit();

      setCalculations([]);
      return true;
    } catch (err) {
      console.error('Error clearing calculations:', err);
      return false;
    }
  };

  return {
    calculations,
    loading,
    error,
    saveCalculation,
    deleteCalculation,
    clearAllCalculations,
    refresh: fetchCalculations
  };
};

// Export utility functions
const formatDate = (date: Timestamp | Date | undefined): string => {
  if (!date) return new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const d = date instanceof Timestamp ? date.toDate() : date;
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Format a value for display
const formatValue = (key: string, value: any): string => {
  if (typeof value === 'number') {
    if (key.toLowerCase().includes('percent') || key.toLowerCase().includes('rate') || key.toLowerCase().includes('progress') || key.toLowerCase().includes('growth')) {
      return `${value.toFixed(2)}%`;
    }
    if (key.toLowerCase().includes('months') || key.toLowerCase().includes('years')) {
      return value.toFixed(1);
    }
    return `$${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  }
  return String(value);
};

// Format key for display
const formatKey = (key: string): string => {
  return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).trim();
};

// Export single calculation as CSV with proper formatting
const exportSingleAsCSV = (type: ToolId, name: string, data: Record<string, any>, results: Record<string, any>): void => {
  const lines: string[] = [];

  // Header
  lines.push(`${TOOL_NAMES[type]} - ${name}`);
  lines.push(`Generated: ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`);
  lines.push('');

  // Input section
  lines.push('INPUT VALUES');
  lines.push('Field,Value');
  Object.entries(data).forEach(([key, value]) => {
    if (typeof value !== 'object') {
      lines.push(`"${formatKey(key)}","${formatValue(key, value)}"`);
    }
  });
  lines.push('');

  // Results section
  lines.push('RESULTS');
  lines.push('Metric,Value');
  Object.entries(results).forEach(([key, value]) => {
    if (typeof value !== 'object') {
      lines.push(`"${formatKey(key)}","${formatValue(key, value)}"`);
    }
  });

  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const safeName = name.replace(/[^a-z0-9]/gi, '_').substring(0, 30);
  downloadBlob(blob, `${TOOL_NAMES[type].replace(/\s/g, '_')}_${safeName}_${new Date().toISOString().split('T')[0]}.csv`);
};

// Export single calculation as PDF
const exportSingleAsPDF = (type: ToolId, name: string, data: Record<string, any>, results: Record<string, any>): void => {
  const formatTableRows = (obj: Record<string, any>): string => {
    return Object.entries(obj)
      .filter(([, value]) => typeof value !== 'object')
      .map(([key, value]) => {
        return `<tr><td style="padding: 10px 15px; border-bottom: 1px solid #e5e7eb;">${formatKey(key)}</td><td style="padding: 10px 15px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 600;">${formatValue(key, value)}</td></tr>`;
      })
      .join('');
  };

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${TOOL_NAMES[type]} - ${name}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; color: #333; max-width: 800px; margin: 0 auto; }
        h1 { color: #1e40af; margin-bottom: 5px; }
        .subtitle { color: #6b7280; margin-bottom: 30px; }
        .section { margin: 25px 0; }
        .section-title { font-size: 14px; font-weight: 600; color: #374151; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 10px; padding-bottom: 5px; border-bottom: 2px solid #e5e7eb; }
        table { width: 100%; border-collapse: collapse; background: #f9fafb; border-radius: 8px; overflow: hidden; }
        .results-table { background: #eff6ff; }
        .results-table td { color: #1e40af; }
        .footer { margin-top: 40px; text-align: center; color: #9ca3af; font-size: 12px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
        @media print { body { padding: 20px; } }
      </style>
    </head>
    <body>
      <h1>${TOOL_NAMES[type]}</h1>
      <p class="subtitle">${name}<br/>Generated on ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>

      <div class="section">
        <div class="section-title">Input Values</div>
        <table>${formatTableRows(data)}</table>
      </div>

      <div class="section">
        <div class="section-title">Results</div>
        <table class="results-table">${formatTableRows(results)}</table>
      </div>

      <div class="footer">Generated by FinLit Financial Tools</div>
    </body>
    </html>
  `;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 250);
  }
};

// Export multiple saved calculations as CSV (for bulk export)
const exportMultipleAsCSV = (calculations: SavedCalculation[]): void => {
  if (calculations.length === 0) return;

  // Get all unique result keys across all calculations
  const allResultKeys = new Set<string>();
  calculations.forEach(calc => {
    Object.keys(calc.results).forEach(key => {
      if (typeof calc.results[key] !== 'object') {
        allResultKeys.add(key);
      }
    });
  });
  const resultKeys = Array.from(allResultKeys);

  // Build header
  const headers = ['Calculator', 'Name', 'Date', ...resultKeys.map(formatKey)];

  // Build rows
  const rows = calculations.map(calc => {
    const row = [
      TOOL_NAMES[calc.type] || calc.type,
      calc.name,
      formatDate(calc.savedAt),
      ...resultKeys.map(key => calc.results[key] !== undefined ? formatValue(key, calc.results[key]) : '')
    ];
    return row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',');
  });

  const csvContent = [headers.map(h => `"${h}"`).join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, `financial_calculations_${new Date().toISOString().split('T')[0]}.csv`);
};

// Export multiple as PDF (for bulk export)
const exportMultipleAsPDF = (calculations: SavedCalculation[]): void => {
  if (calculations.length === 0) return;

  const formatResultsTable = (calc: SavedCalculation): string => {
    return Object.entries(calc.results)
      .filter(([, value]) => typeof value !== 'object')
      .map(([key, value]) => {
        return `<tr><td style="padding: 8px; border-bottom: 1px solid #eee;">${formatKey(key)}</td><td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right; font-weight: 600;">${formatValue(key, value)}</td></tr>`;
      })
      .join('');
  };

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Financial Calculations Report</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; color: #333; }
        h1 { color: #1e40af; border-bottom: 2px solid #1e40af; padding-bottom: 10px; }
        .calculation { margin: 30px 0; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px; page-break-inside: avoid; }
        .calc-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
        .calc-type { background: #dbeafe; color: #1e40af; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
        .calc-name { font-size: 18px; font-weight: 700; color: #111; }
        .calc-date { color: #6b7280; font-size: 12px; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        .footer { margin-top: 40px; text-align: center; color: #6b7280; font-size: 12px; }
        @media print { body { padding: 20px; } }
      </style>
    </head>
    <body>
      <h1>Financial Calculations Report</h1>
      <p style="color: #6b7280;">Generated on ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      ${calculations.map(calc => `
        <div class="calculation">
          <div class="calc-header">
            <div>
              <span class="calc-type">${TOOL_NAMES[calc.type] || calc.type}</span>
              <div class="calc-name">${calc.name}</div>
            </div>
            <div class="calc-date">${formatDate(calc.savedAt)}</div>
          </div>
          <table>${formatResultsTable(calc)}</table>
        </div>
      `).join('')}
      <div class="footer">
        <p>Generated by FinLit Financial Tools</p>
      </div>
    </body>
    </html>
  `;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 250);
  }
};

const downloadBlob = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Calculator Action Buttons Component - Save and Export
const CalculatorActions: React.FC<{
  onSave: (customName?: string) => void;
  onExportCSV: () => void;
  onExportPDF: () => void;
  saving?: boolean;
  saved?: boolean;
  isLoadedCalculation?: boolean;
  loadedCalculationName?: string;
}> = ({ onSave, onExportCSV, onExportPDF, saving, saved, isLoadedCalculation, loadedCalculationName }) => {
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [showNameInput, setShowNameInput] = useState(false);
  const [calculationName, setCalculationName] = useState('');

  const handleSaveClick = () => {
    if (!showNameInput) {
      setShowNameInput(true);
    }
  };

  const handleSaveWithName = () => {
    onSave(calculationName.trim() || undefined);
    setShowNameInput(false);
    setCalculationName('');
  };

  const handleCancelSave = () => {
    setShowNameInput(false);
    setCalculationName('');
  };

  return (
    <div className="flex flex-col gap-3 mt-6 pt-4 border-t border-gray-200">
      {/* Name Input Field - Shows when user wants to save */}
      <AnimatePresence>
        {showNameInput && !saved && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-col gap-3"
          >
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Enter calculation name (optional)"
                value={calculationName}
                onChange={(e) => setCalculationName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSaveWithName()}
                className="flex-1 px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                autoFocus
              />
            </div>
            <div className="flex gap-2">
              <motion.button
                onClick={handleSaveWithName}
                disabled={saving}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all ${
                  saving
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-500 hover:bg-blue-600 text-white shadow-md hover:shadow-lg'
                }`}
                whileHover={!saving ? { scale: 1.02 } : {}}
                whileTap={!saving ? { scale: 0.98 } : {}}
              >
                {saving ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
                {saving ? 'Saving...' : 'Save'}
              </motion.button>
              <motion.button
                onClick={handleCancelSave}
                className="px-4 py-3 rounded-xl font-semibold text-gray-600 hover:bg-gray-100 transition-all"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Cancel
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Save Button or Loaded Indicator */}
      <div className="flex items-center gap-3">
        {isLoadedCalculation ? (
          <div className="flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-semibold text-lg bg-emerald-100 text-emerald-700 border-2 border-emerald-300">
            <FolderOpen className="w-6 h-6" />
            <div className="text-left">
              <div>Loaded: {loadedCalculationName}</div>
              <div className="text-sm font-normal opacity-75">Already saved - no need to save again</div>
            </div>
          </div>
        ) : (
          <motion.button
            onClick={saved ? undefined : handleSaveClick}
            disabled={saving || showNameInput}
            className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-semibold text-lg transition-all ${
              saved
                ? 'bg-emerald-100 text-emerald-700 border-2 border-emerald-300'
                : saving || showNameInput
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-xl'
            }`}
            whileHover={!saved && !saving && !showNameInput ? { scale: 1.02 } : {}}
            whileTap={!saved && !saving && !showNameInput ? { scale: 0.98 } : {}}
          >
            {saving ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : saved ? (
              <Check className="w-6 h-6" />
            ) : (
              <Save className="w-6 h-6" />
            )}
            {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Calculation'}
          </motion.button>
        )}

        {/* Export Button - Dropdown */}
        <div className="relative">
        <motion.button
          onClick={() => setExportMenuOpen(!exportMenuOpen)}
          className="flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-semibold text-lg bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg hover:shadow-xl transition-all"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Download className="w-6 h-6" />
          Export
        </motion.button>
        <AnimatePresence>
          {exportMenuOpen && (
            <>
              {/* Backdrop to close menu */}
              <div
                className="fixed inset-0 z-10"
                onClick={() => setExportMenuOpen(false)}
              />
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="absolute right-0 bottom-full mb-2 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-20 min-w-[200px]"
              >
                <button
                  onClick={() => { onExportPDF(); setExportMenuOpen(false); }}
                  className="flex items-center justify-between px-4 py-4 hover:bg-blue-50 w-full text-left transition border-b border-gray-100"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-blue-500" />
                    <span className="font-semibold text-gray-800">Export PDF</span>
                  </div>
                  <span className="text-xs font-bold bg-blue-500 text-white px-2 py-1 rounded-full">
                    RECOMMENDED
                  </span>
                </button>
                <button
                  onClick={() => { onExportCSV(); setExportMenuOpen(false); }}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 w-full text-left transition"
                >
                  <FileText className="w-5 h-5 text-emerald-500" />
                  <span className="font-medium">Export CSV</span>
                </button>
              </motion.div>
            </>
          )}
        </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

// Legacy Save Button Component (keeping for compatibility)
const SaveButton: React.FC<{
  onSave: () => void;
  disabled?: boolean;
  saved?: boolean;
  saving?: boolean;
}> = ({ onSave, disabled, saved, saving }) => (
  <motion.button
    onClick={onSave}
    disabled={disabled || saving}
    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
      saved
        ? 'bg-emerald-100 text-emerald-700 border-2 border-emerald-300'
        : disabled || saving
          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
          : 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-xl'
    }`}
    whileHover={!disabled && !saved && !saving ? { scale: 1.02 } : {}}
    whileTap={!disabled && !saved && !saving ? { scale: 0.98 } : {}}
  >
    {saving ? (
      <Loader2 className="w-5 h-5 animate-spin" />
    ) : saved ? (
      <Check className="w-5 h-5" />
    ) : (
      <Save className="w-5 h-5" />
    )}
    {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Calculation'}
  </motion.button>
);

// Saved Calculations Panel Component
const SavedCalculationsPanel: React.FC<{
  calculations: SavedCalculation[];
  loading: boolean;
  onDelete: (id: string) => Promise<boolean>;
  onClearAll: () => Promise<boolean>;
  onClose: () => void;
  onViewCalculation: (calculation: SavedCalculation) => void;
}> = ({ calculations, loading, onDelete, onClearAll, onClose, onViewCalculation }) => {
  const [deleting, setDeleting] = useState<string | null>(null);
  const [clearing, setClearing] = useState(false);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [individualExportOpen, setIndividualExportOpen] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setDeleting(id);
    await onDelete(id);
    setDeleting(null);
  };

  const handleClearAll = async () => {
    if (window.confirm('Are you sure you want to delete all saved calculations? This cannot be undone.')) {
      setClearing(true);
      await onClearAll();
      setClearing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <FolderOpen className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">Saved Calculations</h2>
              <p className="text-sm text-gray-500">{calculations.length} saved</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Export Dropdown */}
            <div className="relative">
              <button
                onClick={() => setExportMenuOpen(!exportMenuOpen)}
                disabled={calculations.length === 0}
                className="flex items-center gap-2 px-3 py-2 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4" />
                <span className="text-sm font-medium">Export</span>
              </button>
              <AnimatePresence>
                {exportMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-10 min-w-[220px]"
                  >
                    <button
                      onClick={() => { exportMultipleAsPDF(calculations); setExportMenuOpen(false); }}
                      className="flex items-center justify-between px-4 py-3 hover:bg-blue-50 w-full text-left border-b border-gray-100"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-4 h-4 text-blue-500" />
                        <span className="text-sm font-semibold">Export All as PDF</span>
                      </div>
                      <span className="text-xs font-bold bg-blue-500 text-white px-2 py-0.5 rounded-full">
                        RECOMMENDED
                      </span>
                    </button>
                    <button
                      onClick={() => { exportMultipleAsCSV(calculations); setExportMenuOpen(false); }}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 w-full text-left"
                    >
                      <FileText className="w-4 h-4 text-emerald-500" />
                      <span className="text-sm">Export All as CSV</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            {calculations.length > 0 && (
              <button
                onClick={handleClearAll}
                disabled={clearing}
                className="flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
              >
                {clearing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                <span className="text-sm font-medium">Clear All</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[70vh] p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
          ) : calculations.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calculator className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium">No saved calculations yet</p>
              <p className="text-sm text-gray-400 mt-1">Use the calculators and save your results</p>
            </div>
          ) : (
            <div className="space-y-4">
              {calculations.map(calc => (
                <motion.div
                  key={calc.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-gray-50 rounded-xl p-5 border border-gray-200 hover:border-gray-300 transition"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                          {TOOL_NAMES[calc.type]}
                        </span>
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(calc.savedAt)}
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-800 text-lg mb-3">{calc.name}</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {Object.entries(calc.results).filter(([, v]) => typeof v !== 'object').slice(0, 6).map(([key, value]) => (
                          <div key={key} className="bg-white px-3 py-2 rounded-lg border border-gray-200">
                            <div className="text-xs text-gray-500 mb-1">{formatKey(key)}</div>
                            <div className="font-semibold text-gray-800">{formatValue(key, value)}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 lg:ml-4">
                      {/* View Calculator Button */}
                      <button
                        onClick={() => {
                          onViewCalculation(calc);
                          onClose();
                        }}
                        className="flex items-center justify-center gap-2 px-3 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition font-medium text-sm sm:text-base"
                        title="View Calculator"
                      >
                        <Calculator className="w-4 h-4" />
                        <span className="hidden sm:inline">View Calculator</span>
                        <span className="sm:hidden">View</span>
                      </button>
                      
                      {/* Export individual calculation with dropdown */}
                      <div className="relative">
                        <button
                          onClick={() => setIndividualExportOpen(individualExportOpen === calc.id ? null : calc.id)}
                          className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-medium text-sm sm:text-base"
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                          <span className="hidden sm:inline">Download</span>
                          <span className="sm:hidden">Export</span>
                        </button>
                        <AnimatePresence>
                          {individualExportOpen === calc.id && (
                            <>
                              <div 
                                className="fixed inset-0 z-10"
                                onClick={() => setIndividualExportOpen(null)}
                              />
                              <motion.div
                                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-20 min-w-[180px]"
                              >
                                <button
                                  onClick={() => {
                                    exportSingleAsPDF(calc.type, calc.name, calc.data, calc.results);
                                    setIndividualExportOpen(null);
                                  }}
                                  className="flex items-center justify-between px-4 py-3 hover:bg-blue-50 w-full text-left border-b border-gray-100"
                                >
                                  <div className="flex items-center gap-3">
                                    <FileText className="w-4 h-4 text-blue-500" />
                                    <span className="text-sm font-semibold">Download PDF</span>
                                  </div>
                                  <span className="text-xs font-bold bg-blue-500 text-white px-2 py-0.5 rounded-full">
                                    RECOMMENDED
                                  </span>
                                </button>
                                <button
                                  onClick={() => {
                                    exportSingleAsCSV(calc.type, calc.name, calc.data, calc.results);
                                    setIndividualExportOpen(null);
                                  }}
                                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 w-full text-left"
                                >
                                  <FileText className="w-4 h-4 text-emerald-500" />
                                  <span className="text-sm">Download CSV</span>
                                </button>
                              </motion.div>
                            </>
                          )}
                        </AnimatePresence>
                      </div>
                      <button
                        onClick={() => handleDelete(calc.id)}
                        disabled={deleting === calc.id}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition ml-2"
                        title="Delete"
                      >
                        {deleting === calc.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

interface Tool {
  id: ToolId;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  iconBg: string;
  hoverBorder: string;
}

const FINANCIAL_TOOLS: Tool[] = [
  {
    id: 'budget',
    title: 'Budget Planner',
    subtitle: '50/30/20 Rule',
    description: 'Smart allocation for needs, wants, and savings',
    icon: <img src="https://cdn-icons-png.flaticon.com/512/2830/2830284.png" alt="Budget" className="w-8 h-8 object-contain" />,
    gradient: 'from-blue-100 via-indigo-50 to-blue-50',
    iconBg: 'bg-gradient-to-br from-blue-500 to-indigo-600',
    hoverBorder: 'hover:border-blue-400'
  },
  {
    id: 'savings',
    title: 'Savings Goals',
    subtitle: 'Goal Tracker',
    description: 'Track progress toward your financial goals',
    icon: <img src="https://cdn-icons-png.flaticon.com/512/2529/2529395.png" alt="Savings" className="w-8 h-8 object-contain" />,
    gradient: 'from-emerald-100 via-teal-50 to-emerald-50',
    iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-600',
    hoverBorder: 'hover:border-emerald-400'
  },
  {
    id: 'loan',
    title: 'Loan Calculator',
    subtitle: 'Payment Estimator',
    description: 'Calculate payments and total interest',
    icon: <img src="https://cdn-icons-png.flaticon.com/512/2830/2830305.png" alt="Loan" className="w-8 h-8 object-contain" />,
    gradient: 'from-violet-100 via-purple-50 to-violet-50',
    iconBg: 'bg-gradient-to-br from-violet-500 to-purple-600',
    hoverBorder: 'hover:border-violet-400'
  },
  {
    id: 'networth',
    title: 'Net Worth',
    subtitle: 'Financial Snapshot',
    description: 'Track assets minus liabilities',
    icon: <img src="https://cdn-icons-png.flaticon.com/512/3135/3135706.png" alt="Net Worth" className="w-8 h-8 object-contain" />,
    gradient: 'from-amber-100 via-orange-50 to-amber-50',
    iconBg: 'bg-gradient-to-br from-amber-500 to-orange-600',
    hoverBorder: 'hover:border-amber-400'
  },
  {
    id: 'compound',
    title: 'Compound Interest',
    subtitle: 'Growth Calculator',
    description: 'See how investments grow over time',
    icon: <img src="https://cdn-icons-png.flaticon.com/512/2936/2936690.png" alt="Compound Interest" className="w-8 h-8 object-contain" />,
    gradient: 'from-cyan-100 via-teal-50 to-cyan-50',
    iconBg: 'bg-gradient-to-br from-teal-500 to-cyan-600',
    hoverBorder: 'hover:border-teal-400'
  },
  {
    id: 'debt-payoff',
    title: 'Debt Payoff',
    subtitle: 'Freedom Planner',
    description: 'Plan your journey to debt freedom',
    icon: <img src="https://cdn-icons-png.flaticon.com/512/2920/2920276.png" alt="Debt Payoff" className="w-8 h-8 object-contain" />,
    gradient: 'from-rose-100 via-pink-50 to-rose-50',
    iconBg: 'bg-gradient-to-br from-rose-500 to-pink-600',
    hoverBorder: 'hover:border-rose-400'
  },
  {
    id: 'emergency-fund',
    title: 'Emergency Fund',
    subtitle: 'Safety Net Calculator',
    description: 'Calculate your ideal emergency fund size',
    icon: <img src="https://cdn-icons-png.flaticon.com/512/2830/2830312.png" alt="Emergency Fund" className="w-8 h-8 object-contain" />,
    gradient: 'from-orange-100 via-red-50 to-orange-50',
    iconBg: 'bg-gradient-to-br from-orange-500 to-red-600',
    hoverBorder: 'hover:border-orange-400'
  }
];

// Shared Input Component
const InputField: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  prefix?: React.ReactNode;
  suffix?: string;
  type?: string;
}> = ({ label, value, onChange, placeholder, prefix, suffix, type = 'number' }) => (
  <div className="space-y-2">
    <label className="block text-sm font-semibold text-gray-600">{label}</label>
    <div className="relative">
      {prefix && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
          {prefix}
        </div>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full ${prefix ? 'pl-11' : 'pl-4'} ${suffix ? 'pr-12' : 'pr-4'} py-3.5 bg-slate-50/80 border border-gray-200/80 rounded-xl text-gray-800 placeholder-gray-400 focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-100/50 transition-all duration-200 outline-none`}
      />
      {suffix && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">
          {suffix}
        </div>
      )}
    </div>
  </div>
);

// Result Card Component
const ResultCard: React.FC<{
  label: string;
  value: string;
  subValue?: string;
  icon?: React.ReactNode;
  color?: string;
  large?: boolean;
}> = ({ label, value, subValue, icon, color = 'text-gray-800', large }) => (
  <div className={`bg-white/80 backdrop-blur-sm rounded-2xl p-5 border border-gray-200/60 shadow-sm hover:shadow-md transition-shadow ${large ? 'col-span-full' : ''}`}>
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-gray-500 mb-1">{label}</p>
        <p className={`${large ? 'text-3xl' : 'text-2xl'} font-bold ${color}`}>{value}</p>
        {subValue && <p className="text-sm text-gray-400 mt-1">{subValue}</p>}
      </div>
      {icon && (
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
          {icon}
        </div>
      )}
    </div>
  </div>
);

// Progress Bar Component
const ProgressBar: React.FC<{
  progress: number;
  color: string;
  showLabel?: boolean;
  height?: string;
}> = ({ progress, color, showLabel = true, height = 'h-3' }) => (
  <div className="space-y-2">
    <div className={`w-full bg-gray-100 rounded-full ${height} overflow-hidden`}>
      <motion.div
        className={`${color} ${height} rounded-full`}
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(progress, 100)}%` }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      />
    </div>
    {showLabel && (
      <div className="flex justify-between text-sm text-gray-500">
        <span>{progress.toFixed(0)}% complete</span>
      </div>
    )}
  </div>
);

// Back Button Component
const BackButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <motion.button
    onClick={onClick}
    className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors mb-6"
    whileHover={{ x: -4 }}
  >
    <ArrowLeft className="w-5 h-5" />
    <span className="font-medium">Back to Tools</span>
  </motion.button>
);

// Tool Header Component
const ToolHeader: React.FC<{
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
}> = ({ title, subtitle, icon, color }) => (
  <div className="flex items-center gap-4 mb-8 p-4 bg-white/50 backdrop-blur-sm rounded-2xl border border-gray-200/40">
    <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center text-white shadow-lg`}>
      {icon}
    </div>
    <div>
      <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
      <p className="text-gray-500">{subtitle}</p>
    </div>
  </div>
);

// Common props for calculator components
interface CalculatorProps {
  onBack: () => void;
  onSave: (type: ToolId, name: string, data: Record<string, any>, results: Record<string, any>) => Promise<boolean>;
  loadedData?: Record<string, any>;
  loadedName?: string;
}

// Budget Calculator Component
const BudgetCalculator: React.FC<CalculatorProps> = ({ onBack, onSave, loadedData, loadedName }) => {
  const [income, setIncome] = useState(loadedData?.monthlyIncome?.toString() || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const monthlyIncome = parseFloat(income) || 0;
  const needs = monthlyIncome * 0.5;
  const wants = monthlyIncome * 0.3;
  const savings = monthlyIncome * 0.2;

  const categories = [
    { name: 'Needs', amount: needs, percent: 50, color: 'bg-blue-500', textColor: 'text-blue-600', bgColor: 'bg-blue-50', description: 'Housing, utilities, groceries, insurance' },
    { name: 'Wants', amount: wants, percent: 30, color: 'bg-violet-500', textColor: 'text-violet-600', bgColor: 'bg-violet-50', description: 'Entertainment, dining out, hobbies' },
    { name: 'Savings', amount: savings, percent: 20, color: 'bg-emerald-500', textColor: 'text-emerald-600', bgColor: 'bg-emerald-50', description: 'Emergency fund, retirement, investments' },
  ];

  const handleSave = async (customName?: string) => {
    setSaving(true);
    const defaultName = `Budget Plan - $${monthlyIncome.toLocaleString()}/mo`;
    const success = await onSave(
      'budget',
      customName || defaultName,
      { monthlyIncome },
      { needs, wants, savings, annualSavings: savings * 12, weeklySpending: wants / 4 }
    );
    setSaving(false);
    if (success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <BackButton onClick={onBack} />
      <ToolHeader
        title="Budget Planner"
        subtitle="50/30/20 Rule Calculator"
        icon={<Calculator className="w-7 h-7" />}
        color="bg-blue-500"
      />

      <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/60 shadow-sm mb-6">
        <InputField
          label="Monthly After-Tax Income"
          value={income}
          onChange={setIncome}
          placeholder="5,000"
          prefix={<DollarSign className="w-5 h-5" />}
        />
      </div>

      <AnimatePresence>
        {monthlyIncome > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {categories.map((cat, idx) => (
              <motion.div
                key={cat.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`${cat.bgColor} rounded-2xl p-5 border border-gray-100`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 ${cat.color} rounded-xl flex items-center justify-center text-white font-bold`}>
                      {cat.percent}%
                    </div>
                    <div>
                      <h3 className={`font-semibold ${cat.textColor}`}>{cat.name}</h3>
                      <p className="text-sm text-gray-500">{cat.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-2xl font-bold ${cat.textColor}`}>
                      ${cat.amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </p>
                    <p className="text-sm text-gray-400">/month</p>
                  </div>
                </div>
                <div className="w-full bg-white/60 rounded-full h-2">
                  <motion.div
                    className={`${cat.color} h-2 rounded-full`}
                    initial={{ width: 0 }}
                    animate={{ width: `${cat.percent}%` }}
                    transition={{ duration: 0.6, delay: idx * 0.1 }}
                  />
                </div>
              </motion.div>
            ))}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-2 gap-4 mt-6"
            >
              <ResultCard
                label="Annual Savings"
                value={`$${(savings * 12).toLocaleString()}`}
                icon={<PiggyBank className="w-5 h-5 text-emerald-500" />}
                color="text-emerald-600"
              />
              <ResultCard
                label="Weekly Spending"
                value={`$${Math.round(wants / 4).toLocaleString()}`}
                icon={<Wallet className="w-5 h-5 text-violet-500" />}
                color="text-violet-600"
              />
            </motion.div>

            {/* Save & Export Actions */}
            <CalculatorActions
              onSave={handleSave}
              onExportCSV={() => exportSingleAsCSV('budget', `Budget Plan - $${monthlyIncome.toLocaleString()}/mo`, { monthlyIncome }, { needs, wants, savings, annualSavings: savings * 12, weeklySpending: wants / 4 })}
              onExportPDF={() => exportSingleAsPDF('budget', `Budget Plan - $${monthlyIncome.toLocaleString()}/mo`, { monthlyIncome }, { needs, wants, savings, annualSavings: savings * 12, weeklySpending: wants / 4 })}
              saving={saving}
              saved={saved}
              isLoadedCalculation={!!loadedData}
              loadedCalculationName={loadedName}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Savings Planner Component
const SavingsPlanner: React.FC<CalculatorProps> = ({ onBack, onSave, loadedData, loadedName }) => {
  const [goalName, setGoalName] = useState(loadedData?.goalName || loadedName || '');
  const [goalAmount, setGoalAmount] = useState(loadedData?.goal?.toString() || '');
  const [currentSavings, setCurrentSavings] = useState(loadedData?.current?.toString() || '');
  const [monthlyContribution, setMonthlyContribution] = useState(loadedData?.monthly?.toString() || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const goal = parseFloat(goalAmount) || 0;
  const current = parseFloat(currentSavings) || 0;
  const monthly = parseFloat(monthlyContribution) || 0;
  const remaining = Math.max(0, goal - current);
  const monthsToGoal = monthly > 0 ? Math.ceil(remaining / monthly) : 0;
  const progress = goal > 0 ? Math.min(100, (current / goal) * 100) : 0;

  const targetDate = monthsToGoal > 0
    ? new Date(Date.now() + monthsToGoal * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'Set your goal';

  const handleSave = async (customName?: string) => {
    setSaving(true);
    const defaultName = goalName || 'Savings Goal';
    const success = await onSave(
      'savings',
      customName || defaultName,
      { goalName, goal, current, monthly },
      { progress, remaining, monthsToGoal, yearlySavings: monthly * 12, targetDate }
    );
    setSaving(false);
    if (success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <BackButton onClick={onBack} />
      <ToolHeader
        title="Savings Goals"
        subtitle="Track your progress"
        icon={<PiggyBank className="w-7 h-7" />}
        color="bg-emerald-500"
      />

      <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/60 shadow-sm mb-6 space-y-5">
        <InputField
          label="What are you saving for?"
          value={goalName}
          onChange={setGoalName}
          placeholder="Emergency Fund, Vacation, New Car..."
          type="text"
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <InputField
            label="Goal Amount"
            value={goalAmount}
            onChange={setGoalAmount}
            placeholder="10,000"
            prefix={<DollarSign className="w-5 h-5" />}
          />
          <InputField
            label="Current Savings"
            value={currentSavings}
            onChange={setCurrentSavings}
            placeholder="2,000"
            prefix={<DollarSign className="w-5 h-5" />}
          />
          <InputField
            label="Monthly Savings"
            value={monthlyContribution}
            onChange={setMonthlyContribution}
            placeholder="500"
            prefix={<DollarSign className="w-5 h-5" />}
          />
        </div>
      </div>

      <AnimatePresence>
        {goal > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-emerald-100 text-sm mb-1">Your Goal</p>
                  <h3 className="text-xl font-bold">{goalName || 'Savings Goal'}</h3>
                </div>
                <div className="text-right">
                  <p className="text-emerald-100 text-sm mb-1">Progress</p>
                  <p className="text-2xl font-bold">{progress.toFixed(0)}%</p>
                </div>
              </div>
              <div className="w-full bg-white/20 rounded-full h-3 mb-4">
                <motion.div
                  className="bg-white h-3 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.8 }}
                />
              </div>
              <div className="flex justify-between text-sm">
                <span>${current.toLocaleString()} saved</span>
                <span>${goal.toLocaleString()} goal</span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <ResultCard
                label="Months to Goal"
                value={monthsToGoal.toString()}
                icon={<Calendar className="w-5 h-5 text-blue-500" />}
              />
              <ResultCard
                label="Remaining"
                value={`$${remaining.toLocaleString()}`}
                icon={<Target className="w-5 h-5 text-amber-500" />}
              />
              <ResultCard
                label="Yearly Savings"
                value={`$${(monthly * 12).toLocaleString()}`}
                icon={<TrendingUp className="w-5 h-5 text-emerald-500" />}
              />
              <ResultCard
                label="Target Date"
                value={targetDate}
                icon={<Sparkles className="w-5 h-5 text-violet-500" />}
              />
            </div>

            {/* Save & Export Actions */}
            <CalculatorActions
              onSave={handleSave}
              onExportCSV={() => exportSingleAsCSV('savings', goalName || 'Savings Goal', { goalName, goal, current, monthly }, { progress, remaining, monthsToGoal, yearlySavings: monthly * 12, targetDate })}
              onExportPDF={() => exportSingleAsPDF('savings', goalName || 'Savings Goal', { goalName, goal, current, monthly }, { progress, remaining, monthsToGoal, yearlySavings: monthly * 12, targetDate })}
              saving={saving}
              saved={saved}
              isLoadedCalculation={!!loadedData}
              loadedCalculationName={loadedName}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Loan Calculator Component
const LoanCalculator: React.FC<CalculatorProps> = ({ onBack, onSave, loadedData, loadedName }) => {
  const [loanAmount, setLoanAmount] = useState(loadedData?.principal?.toString() || '');
  const [interestRate, setInterestRate] = useState(loadedData?.interestRate?.toString() || '');
  const [loanTerm, setLoanTerm] = useState(loadedData?.termYears?.toString() || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const principal = parseFloat(loanAmount) || 0;
  const ratePercent = parseFloat(interestRate) || 0;
  const rate = ratePercent / 100 / 12;
  const years = parseFloat(loanTerm) || 0;
  const months = years * 12;

  const monthlyPayment = rate > 0 && months > 0
    ? (principal * rate * Math.pow(1 + rate, months)) / (Math.pow(1 + rate, months) - 1)
    : principal / Math.max(months, 1);

  const totalPayment = monthlyPayment * months;
  const totalInterest = totalPayment - principal;
  const principalPercent = totalPayment > 0 ? (principal / totalPayment) * 100 : 0;

  const handleSave = async (customName?: string) => {
    setSaving(true);
    const defaultName = `Loan - $${principal.toLocaleString()} at ${ratePercent}%`;
    const success = await onSave(
      'loan',
      customName || defaultName,
      { principal, interestRate: ratePercent, termYears: years },
      { monthlyPayment, totalPayment, totalInterest, principalPercent }
    );
    setSaving(false);
    if (success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <BackButton onClick={onBack} />
      <ToolHeader
        title="Loan Calculator"
        subtitle="Payment estimator"
        icon={<CreditCard className="w-7 h-7" />}
        color="bg-violet-500"
      />

      <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/60 shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <InputField
            label="Loan Amount"
            value={loanAmount}
            onChange={setLoanAmount}
            placeholder="25,000"
            prefix={<DollarSign className="w-5 h-5" />}
          />
          <InputField
            label="Interest Rate"
            value={interestRate}
            onChange={setInterestRate}
            placeholder="5.5"
            suffix="%"
          />
          <InputField
            label="Loan Term"
            value={loanTerm}
            onChange={setLoanTerm}
            placeholder="5"
            suffix="years"
          />
        </div>
      </div>

      <AnimatePresence>
        {principal > 0 && months > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl p-6 text-white text-center">
              <p className="text-violet-100 mb-2">Monthly Payment</p>
              <motion.p
                className="text-4xl font-bold"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
              >
                ${monthlyPayment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </motion.p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <ResultCard
                label="Principal"
                value={`$${principal.toLocaleString()}`}
                color="text-blue-600"
              />
              <ResultCard
                label="Total Interest"
                value={`$${totalInterest.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                color="text-rose-600"
              />
              <ResultCard
                label="Total Payment"
                value={`$${totalPayment.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                color="text-gray-800"
              />
            </div>

            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-gray-200/60 shadow-sm">
              <p className="text-sm font-medium text-gray-600 mb-4">Payment Breakdown</p>
              <div className="flex h-4 rounded-full overflow-hidden mb-3">
                <motion.div
                  className="bg-blue-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${principalPercent}%` }}
                  transition={{ duration: 0.8 }}
                />
                <motion.div
                  className="bg-rose-400"
                  initial={{ width: 0 }}
                  animate={{ width: `${100 - principalPercent}%` }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                />
              </div>
              <div className="flex justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full" />
                  <span className="text-gray-600">Principal ({principalPercent.toFixed(0)}%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-rose-400 rounded-full" />
                  <span className="text-gray-600">Interest ({(100 - principalPercent).toFixed(0)}%)</span>
                </div>
              </div>
            </div>

            {/* Save & Export Actions */}
            <CalculatorActions
              onSave={handleSave}
              onExportCSV={() => exportSingleAsCSV('loan', `Loan - $${principal.toLocaleString()}`, { principal, interestRate: ratePercent, termYears: years }, { monthlyPayment, totalPayment, totalInterest, principalPercent })}
              onExportPDF={() => exportSingleAsPDF('loan', `Loan - $${principal.toLocaleString()}`, { principal, interestRate: ratePercent, termYears: years }, { monthlyPayment, totalPayment, totalInterest, principalPercent })}
              saving={saving}
              saved={saved}
              isLoadedCalculation={!!loadedData}
              loadedCalculationName={loadedName}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Net Worth Calculator Component
const NetWorthCalculator: React.FC<CalculatorProps> = ({ onBack, onSave, loadedData, loadedName }) => {
  const [assets, setAssets] = useState({
    cash: '', investments: '', retirement: '', realEstate: '', vehicles: '', other: ''
  });
  const [liabilities, setLiabilities] = useState({
    mortgage: '', carLoans: '', studentLoans: '', creditCards: '', other: ''
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const totalAssets = Object.values(assets).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
  const totalLiabilities = Object.values(liabilities).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
  const netWorth = totalAssets - totalLiabilities;

  const assetFields = [
    { key: 'cash', label: 'Cash & Savings' },
    { key: 'investments', label: 'Investments' },
    { key: 'retirement', label: 'Retirement' },
    { key: 'realEstate', label: 'Real Estate' },
    { key: 'vehicles', label: 'Vehicles' },
    { key: 'other', label: 'Other' }
  ];

  const liabilityFields = [
    { key: 'mortgage', label: 'Mortgage' },
    { key: 'carLoans', label: 'Car Loans' },
    { key: 'studentLoans', label: 'Student Loans' },
    { key: 'creditCards', label: 'Credit Cards' },
    { key: 'other', label: 'Other' }
  ];

  const handleSave = async (customName?: string) => {
    setSaving(true);
    const defaultName = `Net Worth - ${netWorth >= 0 ? '' : '-'}$${Math.abs(netWorth).toLocaleString()}`;
    const success = await onSave(
      'networth',
      customName || defaultName,
      { assets, liabilities },
      { totalAssets, totalLiabilities, netWorth }
    );
    setSaving(false);
    if (success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <BackButton onClick={onBack} />
      <ToolHeader
        title="Net Worth"
        subtitle="Your financial snapshot"
        icon={<BarChart3 className="w-7 h-7" />}
        color="bg-amber-500"
      />

      <motion.div
        className={`rounded-2xl p-6 text-white text-center mb-6 ${netWorth >= 0 ? 'bg-gradient-to-br from-emerald-500 to-teal-600' : 'bg-gradient-to-br from-rose-500 to-red-600'}`}
        key={netWorth >= 0 ? 'positive' : 'negative'}
      >
        <p className="text-white/80 mb-1">Net Worth</p>
        <motion.p
          className="text-4xl font-bold"
          key={netWorth}
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
        >
          {netWorth >= 0 ? '' : '-'}${Math.abs(netWorth).toLocaleString()}
        </motion.p>
        <p className="text-sm text-white/70 mt-2">
          {netWorth >= 0 ? 'Great job building wealth!' : 'Focus on reducing liabilities'}
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-100">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            <h3 className="font-semibold text-emerald-800">Assets</h3>
          </div>
          <div className="space-y-3">
            {assetFields.map(field => (
              <div key={field.key} className="flex items-center gap-3">
                <span className="text-sm text-gray-600 w-24">{field.label}</span>
                <div className="relative flex-1">
                  <DollarSign className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="number"
                    value={assets[field.key as keyof typeof assets]}
                    onChange={(e) => setAssets({ ...assets, [field.key]: e.target.value })}
                    placeholder="0"
                    className="w-full pl-8 pr-3 py-2.5 bg-white border border-emerald-200 rounded-xl text-sm focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-emerald-200 flex justify-between">
            <span className="font-medium text-emerald-700">Total Assets</span>
            <span className="font-bold text-emerald-600">${totalAssets.toLocaleString()}</span>
          </div>
        </div>

        <div className="bg-rose-50 rounded-2xl p-5 border border-rose-100">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="w-5 h-5 text-rose-600" />
            <h3 className="font-semibold text-rose-800">Liabilities</h3>
          </div>
          <div className="space-y-3">
            {liabilityFields.map(field => (
              <div key={field.key} className="flex items-center gap-3">
                <span className="text-sm text-gray-600 w-24">{field.label}</span>
                <div className="relative flex-1">
                  <DollarSign className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="number"
                    value={liabilities[field.key as keyof typeof liabilities]}
                    onChange={(e) => setLiabilities({ ...liabilities, [field.key]: e.target.value })}
                    placeholder="0"
                    className="w-full pl-8 pr-3 py-2.5 bg-white border border-rose-200 rounded-xl text-sm focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-none transition-all"
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-rose-200 flex justify-between">
            <span className="font-medium text-rose-700">Total Liabilities</span>
            <span className="font-bold text-rose-600">${totalLiabilities.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Save & Export Actions */}
      {(totalAssets > 0 || totalLiabilities > 0) && (
        <CalculatorActions
          onSave={handleSave}
          onExportCSV={() => exportSingleAsCSV('networth', `Net Worth - $${Math.abs(netWorth).toLocaleString()}`, { assets, liabilities }, { totalAssets, totalLiabilities, netWorth })}
          onExportPDF={() => exportSingleAsPDF('networth', `Net Worth - $${Math.abs(netWorth).toLocaleString()}`, { assets, liabilities }, { totalAssets, totalLiabilities, netWorth })}
          saving={saving}
          saved={saved}
        />
      )}
    </motion.div>
  );
};

// Compound Interest Calculator Component
const CompoundInterestCalculator: React.FC<CalculatorProps> = ({ onBack, onSave, loadedData, loadedName }) => {
  const [principal, setPrincipal] = useState(loadedData?.principal?.toString() || '');
  const [monthlyContribution, setMonthlyContribution] = useState(loadedData?.monthlyContribution?.toString() || '');
  const [interestRate, setInterestRate] = useState(loadedData?.interestRate?.toString() || '');
  const [years, setYears] = useState(loadedData?.years?.toString() || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const p = parseFloat(principal) || 0;
  const pmt = parseFloat(monthlyContribution) || 0;
  const ratePercent = parseFloat(interestRate) || 0;
  const r = ratePercent / 100 / 12;
  const yearsNum = parseFloat(years) || 0;
  const n = yearsNum * 12;

  let futureValue = 0;
  if (r > 0 && n > 0) {
    const fvPrincipal = p * Math.pow(1 + r, n);
    const fvContributions = pmt * ((Math.pow(1 + r, n) - 1) / r);
    futureValue = fvPrincipal + fvContributions;
  } else if (n > 0) {
    futureValue = p + (pmt * n);
  }

  const totalContributed = p + (pmt * n);
  const totalInterest = futureValue - totalContributed;
  const growthPercent = totalContributed > 0 ? ((futureValue / totalContributed) - 1) * 100 : 0;

  const handleSave = async (customName?: string) => {
    setSaving(true);
    const defaultName = `Investment - $${p.toLocaleString()} + $${pmt}/mo for ${yearsNum}yrs`;
    const success = await onSave(
      'compound',
      customName || defaultName,
      { principal: p, monthlyContribution: pmt, interestRate: ratePercent, years: yearsNum },
      { futureValue, totalContributed, totalInterest, growthPercent }
    );
    setSaving(false);
    if (success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <BackButton onClick={onBack} />
      <ToolHeader
        title="Compound Interest"
        subtitle="Watch your money grow"
        icon={<TrendingUp className="w-7 h-7" />}
        color="bg-teal-500"
      />

      <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/60 shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="Initial Investment"
            value={principal}
            onChange={setPrincipal}
            placeholder="10,000"
            prefix={<DollarSign className="w-5 h-5" />}
          />
          <InputField
            label="Monthly Contribution"
            value={monthlyContribution}
            onChange={setMonthlyContribution}
            placeholder="500"
            prefix={<DollarSign className="w-5 h-5" />}
          />
          <InputField
            label="Annual Interest Rate"
            value={interestRate}
            onChange={setInterestRate}
            placeholder="7"
            suffix="%"
          />
          <InputField
            label="Time Period"
            value={years}
            onChange={setYears}
            placeholder="30"
            suffix="years"
          />
        </div>
      </div>

      <AnimatePresence>
        {n > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <div className="bg-gradient-to-br from-teal-500 to-emerald-600 rounded-2xl p-6 text-white text-center">
              <p className="text-teal-100 mb-2">Future Value</p>
              <motion.p
                className="text-4xl font-bold"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
              >
                ${futureValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </motion.p>
              <p className="text-sm text-teal-100 mt-2">
                After {years} years of investing
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <ResultCard
                label="You Contributed"
                value={`$${totalContributed.toLocaleString()}`}
                icon={<Wallet className="w-5 h-5 text-blue-500" />}
              />
              <ResultCard
                label="Interest Earned"
                value={`$${totalInterest.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                color="text-emerald-600"
                icon={<Sparkles className="w-5 h-5 text-emerald-500" />}
              />
              <ResultCard
                label="Total Growth"
                value={`${growthPercent.toFixed(0)}%`}
                color="text-teal-600"
                icon={<ArrowUpRight className="w-5 h-5 text-teal-500" />}
              />
            </div>

            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-gray-200/60 shadow-sm">
              <p className="text-sm font-medium text-gray-600 mb-4">Your Money vs Interest</p>
              <div className="flex h-4 rounded-full overflow-hidden mb-3">
                <motion.div
                  className="bg-blue-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${(totalContributed / futureValue) * 100}%` }}
                  transition={{ duration: 0.8 }}
                />
                <motion.div
                  className="bg-emerald-400"
                  initial={{ width: 0 }}
                  animate={{ width: `${(totalInterest / futureValue) * 100}%` }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                />
              </div>
              <div className="flex justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full" />
                  <span className="text-gray-600">Your Money ({((totalContributed / futureValue) * 100).toFixed(0)}%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-emerald-400 rounded-full" />
                  <span className="text-gray-600">Interest ({((totalInterest / futureValue) * 100).toFixed(0)}%)</span>
                </div>
              </div>
            </div>

            {/* Save & Export Actions */}
            <CalculatorActions
              onSave={handleSave}
              onExportCSV={() => exportSingleAsCSV('compound', `Investment - $${p.toLocaleString()}`, { principal: p, monthlyContribution: pmt, interestRate: ratePercent, years: yearsNum }, { futureValue, totalContributed, totalInterest, growthPercent })}
              onExportPDF={() => exportSingleAsPDF('compound', `Investment - $${p.toLocaleString()}`, { principal: p, monthlyContribution: pmt, interestRate: ratePercent, years: yearsNum }, { futureValue, totalContributed, totalInterest, growthPercent })}
              saving={saving}
              saved={saved}
              isLoadedCalculation={!!loadedData}
              loadedCalculationName={loadedName}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Debt Payoff Planner Component
const DebtPayoffPlanner: React.FC<CalculatorProps> = ({ onBack, onSave, loadedData, loadedName }) => {
  const [debts, setDebts] = useState([
    { id: 1, name: '', balance: '', rate: '', minPayment: '' }
  ]);
  const [extraPayment, setExtraPayment] = useState('');
  const [method, setMethod] = useState<'avalanche' | 'snowball'>('avalanche');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const addDebt = () => {
    setDebts([...debts, { id: Date.now(), name: '', balance: '', rate: '', minPayment: '' }]);
  };

  const removeDebt = (id: number) => {
    if (debts.length > 1) setDebts(debts.filter(d => d.id !== id));
  };

  const updateDebt = (id: number, field: string, value: string) => {
    setDebts(debts.map(d => d.id === id ? { ...d, [field]: value } : d));
  };

  const totalDebt = debts.reduce((sum, d) => sum + (parseFloat(d.balance) || 0), 0);
  const totalMinPayment = debts.reduce((sum, d) => sum + (parseFloat(d.minPayment) || 0), 0);
  const extra = parseFloat(extraPayment) || 0;
  const totalMonthlyPayment = totalMinPayment + extra;
  const monthsToPayoff = totalDebt > 0 && totalMonthlyPayment > 0 ? Math.ceil(totalDebt / totalMonthlyPayment) : 0;

  const targetDate = monthsToPayoff > 0
    ? new Date(Date.now() + monthsToPayoff * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'Add your debts';

  const handleSave = async (customName?: string) => {
    setSaving(true);
    const debtNames = debts.filter(d => d.name).map(d => d.name).join(', ') || 'Debts';
    const defaultName = `${debtNames} - $${totalDebt.toLocaleString()} total`;
    const success = await onSave(
      'debt-payoff',
      customName || defaultName,
      { debts, extraPayment: extra, method },
      { totalDebt, totalMinPayment, totalMonthlyPayment, monthsToPayoff, targetDate }
    );
    setSaving(false);
    if (success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <BackButton onClick={onBack} />
      <ToolHeader
        title="Debt Payoff"
        subtitle="Plan your path to freedom"
        icon={<Target className="w-7 h-7" />}
        color="bg-rose-500"
      />

      <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/60 shadow-sm mb-6">
        <div className="flex items-center justify-between mb-5">
          <p className="font-medium text-gray-700">Payoff Strategy</p>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-6">
          {[
            { id: 'avalanche', name: 'Avalanche', desc: 'Highest interest first', icon: '⛰️' },
            { id: 'snowball', name: 'Snowball', desc: 'Smallest balance first', icon: '⛄' }
          ].map((m) => (
            <motion.button
              key={m.id}
              onClick={() => setMethod(m.id as 'avalanche' | 'snowball')}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                method === m.id
                  ? 'border-rose-500 bg-rose-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{m.icon}</span>
                <div>
                  <p className="font-semibold text-gray-800">{m.name}</p>
                  <p className="text-xs text-gray-500">{m.desc}</p>
                </div>
                {method === m.id && <Check className="w-5 h-5 text-rose-500 ml-auto" />}
              </div>
            </motion.button>
          ))}
        </div>

        <div className="space-y-4">
          {debts.map((debt, idx) => (
            <motion.div
              key={debt.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-50 rounded-xl p-4"
            >
              <div className="flex items-center gap-3 mb-3">
                <input
                  type="text"
                  value={debt.name}
                  onChange={(e) => updateDebt(debt.id, 'name', e.target.value)}
                  placeholder={`Debt ${idx + 1} (e.g., Credit Card)`}
                  className="flex-1 px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:border-rose-400 outline-none"
                />
                {debts.length > 1 && (
                  <button
                    onClick={() => removeDebt(debt.id)}
                    className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Balance</label>
                  <div className="relative">
                    <DollarSign className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="number"
                      value={debt.balance}
                      onChange={(e) => updateDebt(debt.id, 'balance', e.target.value)}
                      placeholder="5,000"
                      className="w-full pl-8 pr-2 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:border-rose-400 outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">APR %</label>
                  <input
                    type="number"
                    value={debt.rate}
                    onChange={(e) => updateDebt(debt.id, 'rate', e.target.value)}
                    placeholder="18.9"
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:border-rose-400 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Min Payment</label>
                  <div className="relative">
                    <DollarSign className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="number"
                      value={debt.minPayment}
                      onChange={(e) => updateDebt(debt.id, 'minPayment', e.target.value)}
                      placeholder="100"
                      className="w-full pl-8 pr-2 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:border-rose-400 outline-none"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <button
          onClick={addDebt}
          className="mt-4 w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-rose-400 hover:text-rose-500 transition font-medium"
        >
          + Add Another Debt
        </button>

        <div className="mt-6">
          <InputField
            label="Extra Monthly Payment"
            value={extraPayment}
            onChange={setExtraPayment}
            placeholder="200"
            prefix={<DollarSign className="w-5 h-5" />}
          />
        </div>
      </div>

      {totalDebt > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="bg-gradient-to-br from-rose-500 to-red-600 rounded-2xl p-6 text-white text-center">
            <p className="text-rose-100 mb-1">Total Debt</p>
            <p className="text-4xl font-bold">${totalDebt.toLocaleString()}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <ResultCard
              label="Months to Freedom"
              value={monthsToPayoff.toString()}
              icon={<Calendar className="w-5 h-5 text-blue-500" />}
            />
            <ResultCard
              label="Monthly Payment"
              value={`$${totalMonthlyPayment.toLocaleString()}`}
              icon={<Wallet className="w-5 h-5 text-emerald-500" />}
            />
          </div>

          <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-semibold text-emerald-800">Debt-Free Date</p>
                <p className="text-emerald-600">{targetDate}</p>
              </div>
            </div>
          </div>

          {/* Save & Export Actions */}
          <CalculatorActions
            onSave={handleSave}
            onExportCSV={() => exportSingleAsCSV('debt-payoff', `Debts - $${totalDebt.toLocaleString()}`, { debts, extraPayment: extra, method }, { totalDebt, totalMinPayment, totalMonthlyPayment, monthsToPayoff, targetDate })}
            onExportPDF={() => exportSingleAsPDF('debt-payoff', `Debts - $${totalDebt.toLocaleString()}`, { debts, extraPayment: extra, method }, { totalDebt, totalMinPayment, totalMonthlyPayment, monthsToPayoff, targetDate })}
            saving={saving}
            saved={saved}
          />
        </motion.div>
      )}
    </motion.div>
  );
};

// Emergency Fund Calculator Component
const EmergencyFundCalculator: React.FC<CalculatorProps> = ({ onBack, onSave, loadedData, loadedName }) => {
  const [monthlyExpenses, setMonthlyExpenses] = useState({
    housing: '',
    utilities: '',
    groceries: '',
    transportation: '',
    insurance: '',
    other: ''
  });
  const [currentSavings, setCurrentSavings] = useState('');
  const [selectedScenario, setSelectedScenario] = useState('');
  const [monthlySavings, setMonthlySavings] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const expenses = Object.values(monthlyExpenses);
  const totalMonthlyExpenses = expenses.reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
  const current = parseFloat(currentSavings) || 0;
  const monthly = parseFloat(monthlySavings) || 0;

  // Calculate emergency fund targets based on different scenarios
  const scenarios = [
    { id: 'basic', months: 3, description: 'Basic Safety Net', riskLevel: 'Low Risk Job', color: 'text-emerald-600' },
    { id: 'recommended', months: 6, description: 'Recommended Standard', riskLevel: 'Average Job Security', color: 'text-blue-600' },
    { id: 'conservative', months: 9, description: 'Conservative Approach', riskLevel: 'High Risk Job/Self-Employed', color: 'text-orange-600' }
  ];

  const selectedScenarioObj = scenarios.find(s => s.id === selectedScenario);
  const targetAmount = totalMonthlyExpenses * (selectedScenarioObj?.months || 6);
  const remaining = Math.max(0, targetAmount - current);
  const monthsToGoal = monthly > 0 ? Math.ceil(remaining / monthly) : 0;
  const progress = targetAmount > 0 ? Math.min(100, (current / targetAmount) * 100) : 0;
  const coverageMonths = totalMonthlyExpenses > 0 ? current / totalMonthlyExpenses : 0;

  const handleSave = async (customName?: string) => {
    setSaving(true);
    const defaultName = `Emergency Fund - ${selectedScenarioObj?.months || 6} months target`;
    const success = await onSave(
      'emergency-fund',
      customName || defaultName,
      { monthlyExpenses, currentSavings: current, monthlySavings: monthly, scenario: selectedScenario },
      { targetAmount, remaining, monthsToGoal, progress, totalMonthlyExpenses, coverageMonths }
    );
    setSaving(false);
    if (success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const expenseFields = [
    { key: 'housing', label: 'Housing (Rent/Mortgage)' },
    { key: 'utilities', label: 'Utilities (Electric, Water, Internet)' },
    { key: 'groceries', label: 'Groceries & Food' },
    { key: 'transportation', label: 'Transportation' },
    { key: 'insurance', label: 'Insurance Premiums' },
    { key: 'other', label: 'Other Essential Expenses' }
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <BackButton onClick={onBack} />
      <ToolHeader
        title="Emergency Fund"
        subtitle="Build your financial safety net"
        icon={<Shield className="w-7 h-7" />}
        color="bg-orange-500"
      />

      {/* Monthly Expenses Section */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/60 shadow-sm mb-6">
        <div className="flex items-center gap-2 mb-5">
          <Calculator className="w-5 h-5 text-orange-600" />
          <h3 className="font-semibold text-gray-800">Monthly Essential Expenses</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {expenseFields.map(field => (
            <InputField
              key={field.key}
              label={field.label}
              value={monthlyExpenses[field.key as keyof typeof monthlyExpenses]}
              onChange={(value) => setMonthlyExpenses({ ...monthlyExpenses, [field.key]: value })}
              prefix={<DollarSign className="w-5 h-5" />}
              placeholder="0"
            />
          ))}
        </div>
        {totalMonthlyExpenses > 0 && (
          <div className="mt-5 pt-5 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-700">Total Monthly Expenses</span>
              <span className="text-2xl font-bold text-orange-600">
                ${totalMonthlyExpenses.toLocaleString()}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Scenario Selection */}
      {totalMonthlyExpenses > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/60 shadow-sm mb-6"
        >
          <div className="flex items-center gap-2 mb-5">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            <h3 className="font-semibold text-gray-800">Choose Your Emergency Fund Target</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {scenarios.map(scenario => (
              <motion.button
                key={scenario.id}
                onClick={() => setSelectedScenario(scenario.id)}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  selectedScenario === scenario.id
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="text-center">
                  <p className="text-3xl font-bold text-gray-800 mb-1">{scenario.months}</p>
                  <p className="text-sm text-gray-500 mb-2">months</p>
                  <p className="font-semibold text-gray-800 mb-1">{scenario.description}</p>
                  <p className="text-xs text-gray-500">{scenario.riskLevel}</p>
                  <p className={`text-lg font-bold mt-2 ${scenario.color}`}>
                    ${(totalMonthlyExpenses * scenario.months).toLocaleString()}
                  </p>
                </div>
                {selectedScenario === scenario.id && (
                  <div className="absolute top-2 right-2">
                    <Check className="w-5 h-5 text-orange-500" />
                  </div>
                )}
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Current Status and Planning */}
      {selectedScenario && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/60 shadow-sm mb-6"
        >
          <h3 className="font-semibold text-gray-800 mb-5">Current Status & Planning</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="Current Emergency Savings"
              value={currentSavings}
              onChange={setCurrentSavings}
              prefix={<DollarSign className="w-5 h-5" />}
              placeholder="0"
            />
            <InputField
              label="Monthly Savings for Emergency Fund"
              value={monthlySavings}
              onChange={setMonthlySavings}
              prefix={<DollarSign className="w-5 h-5" />}
              placeholder="200"
            />
          </div>
        </motion.div>
      )}

      {/* Results */}
      {targetAmount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Progress Card */}
          <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-orange-100 text-sm mb-1">Emergency Fund Target</p>
                <h3 className="text-2xl font-bold">${targetAmount.toLocaleString()}</h3>
              </div>
              <div className="text-right">
                <p className="text-orange-100 text-sm mb-1">Progress</p>
                <p className="text-3xl font-bold">{progress.toFixed(0)}%</p>
              </div>
            </div>
            <div className="w-full bg-white/20 rounded-full h-3 mb-4">
              <motion.div
                className="bg-white h-3 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.8 }}
              />
            </div>
            <div className="flex justify-between text-sm">
              <span>${current.toLocaleString()} saved</span>
              <span>{scenarios.find(s => s.id === selectedScenario)?.months} months coverage</span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <ResultCard
              label="Remaining Needed"
              value={`$${remaining.toLocaleString()}`}
              icon={<Target className="w-5 h-5 text-orange-500" />}
              color="text-orange-600"
            />
            <ResultCard
              label="Months to Goal"
              value={monthsToGoal > 0 ? monthsToGoal.toString() : 'Set savings'}
              icon={<Calendar className="w-5 h-5 text-blue-500" />}
            />
            <ResultCard
              label="Monthly Expenses"
              value={`$${totalMonthlyExpenses.toLocaleString()}`}
              icon={<Calculator className="w-5 h-5 text-gray-500" />}
            />
            <ResultCard
              label="Coverage Months"
              value={current > 0 ? (current / totalMonthlyExpenses).toFixed(1) : '0'}
              icon={<Shield className="w-5 h-5 text-emerald-500" />}
              color="text-emerald-600"
            />
          </div>

          {/* Tips Card */}
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-200">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-emerald-800 mb-2">Emergency Fund Tips</h4>
                <ul className="text-sm text-emerald-700 space-y-1">
                  <li>• Keep your emergency fund in a high-yield savings account</li>
                  <li>• Start small - even $500 can help with minor emergencies</li>
                  <li>• Consider your job security when choosing 3, 6, or 9+ months</li>
                  <li>• Don't invest emergency funds - prioritize accessibility over returns</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Save & Export Actions */}
          <CalculatorActions
            onSave={handleSave}
            onExportCSV={() => exportSingleAsCSV('emergency-fund', `Emergency Fund - ${selectedScenarioObj?.months || 6} months`, { monthlyExpenses, currentSavings: current, monthlySavings: monthly, scenario: selectedScenario }, { targetAmount, remaining, monthsToGoal, progress, totalMonthlyExpenses, coverageMonths })}
            onExportPDF={() => exportSingleAsPDF('emergency-fund', `Emergency Fund - ${selectedScenarioObj?.months || 6} months`, { monthlyExpenses, currentSavings: current, monthlySavings: monthly, scenario: selectedScenario }, { targetAmount, remaining, monthsToGoal, progress, totalMonthlyExpenses, coverageMonths })}
            saving={saving}
            saved={saved}
          />
        </motion.div>
      )}
    </motion.div>
  );
};

// Main Financial Tools Component
const FinancialTools: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const [searchParams] = useSearchParams();
  const [selectedTool, setSelectedTool] = useState<ToolId | null>(null);
  const [showSavedPanel, setShowSavedPanel] = useState(false);
  const [loadedCalculation, setLoadedCalculation] = useState<SavedCalculation | null>(null);

  // Auto-select tool from query parameter
  useEffect(() => {
    const toolParam = searchParams.get('tool') as ToolId | null;
    if (toolParam && ['budget', 'savings', 'loan', 'networth', 'compound', 'debt-payoff', 'emergency-fund'].includes(toolParam)) {
      setSelectedTool(toolParam);
    }
  }, [searchParams]);

  const {
    calculations,
    loading: calcsLoading,
    saveCalculation,
    deleteCalculation,
    clearAllCalculations
  } = useCalculations(user?.id);

  const handleSave = async (
    type: ToolId,
    name: string,
    data: Record<string, any>,
    results: Record<string, any>
  ) => {
    return await saveCalculation(type, name, data, results);
  };

  const handleViewCalculation = (calculation: SavedCalculation) => {
    setLoadedCalculation(calculation);
    setSelectedTool(calculation.type);
    setShowSavedPanel(false);
  };

  const renderTool = () => {
    const props = {
      onBack: () => {
        navigate('/financial-tools');
      },
      onSave: handleSave,
      loadedData: loadedCalculation?.data,
      loadedName: loadedCalculation?.name
    };
    switch (selectedTool) {
      case 'budget': return <BudgetCalculator {...props} />;
      case 'savings': return <SavingsPlanner {...props} />;
      case 'loan': return <LoanCalculator {...props} />;
      case 'networth': return <NetWorthCalculator {...props} />;
      case 'compound': return <CompoundInterestCalculator {...props} />;
      case 'debt-payoff': return <DebtPayoffPlanner {...props} />;
      case 'emergency-fund': return <EmergencyFundCalculator {...props} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-100/60 to-indigo-100/80">
      {/* Saved Calculations Panel */}
      <AnimatePresence>
        {showSavedPanel && (
          <SavedCalculationsPanel
            calculations={calculations}
            loading={calcsLoading}
            onDelete={deleteCalculation}
            onClearAll={clearAllCalculations}
            onClose={() => setShowSavedPanel(false)}
            onViewCalculation={handleViewCalculation}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="bg-white/90 backdrop-blur-md border-b border-gray-200/60 sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline font-medium">Dashboard</span>
            </button>
            <div className="text-center">
              <h1 className="text-xl font-bold text-gray-800">Financial Tools</h1>
              <p className="text-sm text-gray-500 hidden sm:block">Your personal finance toolkit</p>
            </div>
            <button
              onClick={() => setShowSavedPanel(true)}
              className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition"
            >
              <FolderOpen className="w-4 h-4" />
              <span className="hidden sm:inline text-sm font-medium">Saved ({calculations.length})</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <AnimatePresence mode="wait">
          {selectedTool ? (
            <motion.div
              key="tool"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {renderTool()}
            </motion.div>
          ) : (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Welcome Section */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Choose a Tool</h2>
                <p className="text-gray-500">Select a calculator to help with your financial planning</p>
              </div>

              {/* Tools Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {FINANCIAL_TOOLS.map((tool, index) => (
                  <motion.button
                    key={tool.id}
                    onClick={() => setSelectedTool(tool.id)}
                    className={`group relative overflow-hidden rounded-2xl p-6 border-2 border-transparent ${tool.hoverBorder} hover:shadow-2xl text-left transition-all duration-300 bg-gradient-to-br ${tool.gradient}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ y: -6, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {/* Decorative Elements */}
                    <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full bg-white/30" />
                    <div className="absolute -right-3 -bottom-3 w-16 h-16 rounded-full bg-white/20" />

                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`w-14 h-14 ${tool.iconBg} rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300`}>
                          {tool.icon}
                        </div>
                        <div className="w-9 h-9 rounded-full bg-white/60 group-hover:bg-white flex items-center justify-center transition-all duration-300 shadow-sm">
                          <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-gray-700 group-hover:translate-x-0.5 transition-all" />
                        </div>
                      </div>
                      <h3 className="font-bold text-gray-800 text-lg mb-1">{tool.title}</h3>
                      <p className="text-sm font-semibold text-gray-600 mb-2">{tool.subtitle}</p>
                      <p className="text-sm text-gray-600">{tool.description}</p>
                    </div>
                  </motion.button>
                ))}
              </div>

              {/* Tip Card */}
              <motion.div
                className="mt-8 relative overflow-hidden bg-gradient-to-r from-indigo-600 via-blue-600 to-violet-600 rounded-2xl p-6 text-white shadow-xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

                <div className="relative z-10 flex items-start gap-4">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">Pro Tip</h3>
                    <p className="text-blue-100">
                      Use these tools regularly to track your financial progress. Small, consistent actions lead to big results over time.
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default FinancialTools;
