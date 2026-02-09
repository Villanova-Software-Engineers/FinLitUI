import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Calculator,
  ChevronRight,
  Sparkles,
  Save,
  Download,
  FileText,
  Check,
  Loader2,
  Trash2,
  FolderOpen,
  Clock
} from 'lucide-react';
import { db } from '../firebase/config';
import { useAuthContext } from '../auth/context/AuthContext';
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, where, serverTimestamp, Timestamp } from 'firebase/firestore';

// Types
interface SavedBudget {
  id: string;
  name: string;
  data: {
    monthlyIncome: number;
    method: '503020' | 'ramsey';
    methodName: string;
  };
  results: Record<string, number>;
  savedAt: Timestamp | Date;
}

// Budget breakdown configurations
const BREAKDOWN_503020 = [
  { label: "Needs", percent: 0.50, color: "bg-green-100", text: "text-green-800", icon: "🏠" },
  { label: "Wants", percent: 0.30, color: "bg-blue-100", text: "text-blue-800", icon: "🎯" },
  { label: "Savings", percent: 0.20, color: "bg-purple-100", text: "text-purple-800", icon: "💰" }
];

const BREAKDOWN_RAMSEY = [
  { label: "Giving", percent: 0.10, color: "bg-yellow-100", text: "text-yellow-800", icon: "🤲" },
  { label: "Saving", percent: 0.10, color: "bg-purple-100", text: "text-purple-800", icon: "🐷" },
  { label: "Housing", percent: 0.25, color: "bg-green-100", text: "text-green-800", icon: "🏡" },
  { label: "Food", percent: 0.10, color: "bg-orange-100", text: "text-orange-800", icon: "🛒" },
  { label: "Transportation", percent: 0.10, color: "bg-blue-100", text: "text-blue-800", icon: "🚗" },
  { label: "Utilities", percent: 0.05, color: "bg-cyan-100", text: "text-cyan-800", icon: "💡" },
  { label: "Insurance", percent: 0.10, color: "bg-red-100", text: "text-red-800", icon: "🛡️" },
  { label: "Health", percent: 0.05, color: "bg-pink-100", text: "text-pink-800", icon: "⚕️" },
  { label: "Recreation", percent: 0.05, color: "bg-indigo-100", text: "text-indigo-800", icon: "🎉" },
  { label: "Personal", percent: 0.05, color: "bg-teal-100", text: "text-teal-800", icon: "👤" },
  { label: "Misc", percent: 0.05, color: "bg-gray-100", text: "text-gray-800", icon: "📦" }
];

// Format date helper
const formatDate = (date: Timestamp | Date | undefined): string => {
  if (!date) return '';
  const d = date instanceof Timestamp ? date.toDate() : date;
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Calculator Input Component
const CalculatorInput = React.memo(({ calculatorIncome, onIncomeChange }: { calculatorIncome: string; onIncomeChange: (value: string) => void }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9.]/g, '');
    onIncomeChange(value);
  };

  return (
    <div className="mb-10 text-center">
      <label className="block text-gray-600 font-semibold mb-3 text-lg">Monthly After-Tax Income</label>
      <div className="relative inline-block w-full max-w-md">
        <span className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-500 text-2xl pointer-events-none">$</span>
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={calculatorIncome}
          onChange={handleChange}
          placeholder="0"
          className="w-full pl-14 pr-6 py-5 text-4xl font-bold text-center border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:outline-none transition shadow-sm"
        />
      </div>
    </div>
  );
});

// Export as PDF function
const exportBudgetAsPDF = (income: number, method: string, breakdown: typeof BREAKDOWN_503020, budgetName?: string) => {
  const methodName = method === '503020' ? '50/30/20 Rule' : 'Dave Ramsey Method';

  const formatTableRows = () => {
    return breakdown.map(item => {
      const amount = (income * item.percent).toFixed(2);
      return `<tr>
        <td style="padding: 12px 15px; border-bottom: 1px solid #e5e7eb;">
          <span style="margin-right: 8px;">${item.icon}</span>${item.label}
        </td>
        <td style="padding: 12px 15px; border-bottom: 1px solid #e5e7eb; text-align: center;">${(item.percent * 100).toFixed(0)}%</td>
        <td style="padding: 12px 15px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 600; color: #1e40af;">$${parseFloat(amount).toLocaleString()}</td>
      </tr>`;
    }).join('');
  };

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Budget Plan - ${methodName}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; color: #333; max-width: 800px; margin: 0 auto; }
        h1 { color: #1e40af; margin-bottom: 5px; }
        .subtitle { color: #6b7280; margin-bottom: 30px; }
        .income-box { background: linear-gradient(135deg, #3b82f6, #6366f1); color: white; padding: 20px 30px; border-radius: 16px; margin-bottom: 30px; }
        .income-label { font-size: 14px; opacity: 0.9; }
        .income-value { font-size: 32px; font-weight: 700; }
        .section { margin: 25px 0; }
        .section-title { font-size: 14px; font-weight: 600; color: #374151; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 10px; padding-bottom: 5px; border-bottom: 2px solid #e5e7eb; }
        table { width: 100%; border-collapse: collapse; background: #f9fafb; border-radius: 8px; overflow: hidden; }
        th { background: #1e40af; color: white; padding: 12px 15px; text-align: left; font-weight: 600; }
        th:last-child { text-align: right; }
        th:nth-child(2) { text-align: center; }
        .footer { margin-top: 40px; text-align: center; color: #9ca3af; font-size: 12px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
        .total-row { background: #dbeafe; font-weight: 700; }
        .total-row td { padding: 15px; }
        @media print { body { padding: 20px; } }
      </style>
    </head>
    <body>
      <h1>${budgetName || 'Budget Plan'}</h1>
      <p class="subtitle">${methodName}<br/>Generated on ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>

      <div class="income-box">
        <div class="income-label">Monthly After-Tax Income</div>
        <div class="income-value">$${income.toLocaleString()}</div>
      </div>

      <div class="section">
        <div class="section-title">Budget Breakdown</div>
        <table>
          <thead>
            <tr>
              <th>Category</th>
              <th>Percentage</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            ${formatTableRows()}
            <tr class="total-row">
              <td>Total</td>
              <td style="text-align: center;">100%</td>
              <td style="text-align: right;">$${income.toLocaleString()}</td>
            </tr>
          </tbody>
        </table>
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

// Budget Calculator Full Page Component
const BudgetCalculatorPage = ({
  onBack
}: {
  onBack: () => void;
}) => {
  const { user } = useAuthContext();
  const [calculatorIncome, setCalculatorIncome] = useState('');
  const [calculatorMethod, setCalculatorMethod] = useState<'503020' | 'ramsey'>('503020');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [showNameInput, setShowNameInput] = useState(false);
  const [calculationName, setCalculationName] = useState('');

  // Saved budgets state
  const [savedBudgets, setSavedBudgets] = useState<SavedBudget[]>([]);
  const [loadingSaved, setLoadingSaved] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [loadedBudget, setLoadedBudget] = useState<SavedBudget | null>(null);

  const income = parseFloat(calculatorIncome) || 0;
  const currentBreakdown = calculatorMethod === '503020' ? BREAKDOWN_503020 : BREAKDOWN_RAMSEY;

  // Fetch saved budgets
  useEffect(() => {
    const fetchSavedBudgets = async () => {
      if (!user) {
        setLoadingSaved(false);
        return;
      }

      try {
        const calcsRef = collection(db, 'users', user.id, 'savedCalculations');
        const q = query(
          calcsRef,
          where('type', '==', 'budget'),
          orderBy('savedAt', 'desc')
        );
        const snapshot = await getDocs(q);

        const budgets = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as SavedBudget[];

        setSavedBudgets(budgets);
      } catch (err) {
        console.error('Error fetching saved budgets:', err);
      } finally {
        setLoadingSaved(false);
      }
    };

    fetchSavedBudgets();
  }, [user]);

  const handleIncomeChange = useCallback((value: string) => {
    setCalculatorIncome(value);
    setSaved(false);
    setLoadedBudget(null);
  }, []);

  const handleSave = async (customName?: string) => {
    if (!user || income <= 0) return;

    setSaving(true);
    try {
      const calcsRef = collection(db, 'users', user.id, 'savedCalculations');
      const methodName = calculatorMethod === '503020' ? '50/30/20 Rule' : 'Dave Ramsey Method';
      const name = customName || `Budget Plan - ${methodName}`;

      const breakdownResults: Record<string, number> = {};
      currentBreakdown.forEach(item => {
        breakdownResults[item.label] = income * item.percent;
      });

      const docRef = await addDoc(calcsRef, {
        type: 'budget',
        name,
        data: {
          monthlyIncome: income,
          method: calculatorMethod,
          methodName
        },
        results: {
          ...breakdownResults,
          totalIncome: income
        },
        savedAt: serverTimestamp()
      });

      // Add to local state
      const newBudget: SavedBudget = {
        id: docRef.id,
        name,
        data: {
          monthlyIncome: income,
          method: calculatorMethod,
          methodName
        },
        results: {
          ...breakdownResults,
          totalIncome: income
        },
        savedAt: new Date()
      };
      setSavedBudgets(prev => [newBudget, ...prev]);

      setSaved(true);
      setShowNameInput(false);
      setCalculationName('');
      setLoadedBudget(newBudget);
    } catch (err) {
      console.error('Error saving calculation:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (budgetId: string) => {
    if (!user) return;

    setDeletingId(budgetId);
    try {
      const budgetRef = doc(db, 'users', user.id, 'savedCalculations', budgetId);
      await deleteDoc(budgetRef);
      setSavedBudgets(prev => prev.filter(b => b.id !== budgetId));

      // If deleted budget was loaded, clear it
      if (loadedBudget?.id === budgetId) {
        setLoadedBudget(null);
      }
    } catch (err) {
      console.error('Error deleting budget:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleLoadBudget = (budget: SavedBudget) => {
    setCalculatorIncome(budget.data.monthlyIncome.toString());
    setCalculatorMethod(budget.data.method);
    setLoadedBudget(budget);
    setSaved(true);
  };

  const handleExportPDF = () => {
    if (income > 0) {
      exportBudgetAsPDF(income, calculatorMethod, currentBreakdown, loadedBudget?.name);
    }
    setExportMenuOpen(false);
  };

  const handleNewCalculation = () => {
    setCalculatorIncome('');
    setCalculatorMethod('503020');
    setSaved(false);
    setLoadedBudget(null);
    setShowNameInput(false);
    setCalculationName('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 pt-24 pb-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors mb-6"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Back to Financial Tools</span>
          </button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-5xl font-bold bg-gradient-to-r from-slate-900 via-blue-700 to-indigo-700 bg-clip-text text-transparent mb-4" style={{ fontFamily: '"Playfair Display", "Georgia", serif' }}>
              Budget Calculator
            </h1>
            <p className="text-gray-600 text-lg" style={{ fontFamily: '"Inter", sans-serif' }}>
              See exactly where your money should go
            </p>
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-1 gap-6 items-start">
          {/* Main Calculator - Full width */}
          <div className="w-full">
            {/* Calculator Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-3xl shadow-xl p-8 md:p-10 mb-8"
            >
              {/* Loaded Budget Indicator */}
              {loadedBudget && (
                <div className="mb-6 flex items-center justify-between bg-blue-50 border border-blue-200 rounded-xl px-5 py-4">
                  <div className="flex items-center gap-3">
                    <FolderOpen className="w-5 h-5 text-blue-600" />
                    <div>
                      <span className="font-semibold text-blue-900">{loadedBudget.name}</span>
                      <span className="text-blue-600 text-sm ml-2">• Loaded</span>
                    </div>
                  </div>
                  <button
                    onClick={handleNewCalculation}
                    className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                  >
                    New Calculation
                  </button>
                </div>
              )}

              {/* Method Toggle */}
              <div className="flex justify-center mb-10">
                <div className="bg-gray-100 p-1.5 rounded-2xl flex">
                  <button
                    onClick={() => { setCalculatorMethod('503020'); setSaved(false); setLoadedBudget(null); }}
                    className={`px-8 py-4 rounded-xl font-bold text-lg transition ${
                      calculatorMethod === '503020'
                        ? 'bg-white shadow-lg text-blue-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    50/30/20 Rule
                  </button>
                  <button
                    onClick={() => { setCalculatorMethod('ramsey'); setSaved(false); setLoadedBudget(null); }}
                    className={`px-8 py-4 rounded-xl font-bold text-lg transition ${
                      calculatorMethod === 'ramsey'
                        ? 'bg-white shadow-lg text-green-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Dave Ramsey
                  </button>
                </div>
              </div>

              {/* Income Input */}
              <CalculatorInput
                calculatorIncome={calculatorIncome}
                onIncomeChange={handleIncomeChange}
              />

              {/* Breakdown */}
              {income > 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`grid gap-4 ${calculatorMethod === 'ramsey' ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' : 'md:grid-cols-3'}`}
                >
                  {currentBreakdown.map((item, idx) => (
                    <motion.div
                      key={`${item.label}-${idx}`}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className={`${item.color} p-5 rounded-2xl flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow`}
                    >
                      <span className="text-3xl mb-2">{item.icon}</span>
                      <span className={`font-bold ${item.text}`}>{item.label}</span>
                      <span className="text-xs text-gray-600 font-semibold mb-1">{(item.percent * 100).toFixed(0)}%</span>
                      <span className={`text-2xl font-bold ${item.text}`}>
                        ${(income * item.percent).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </span>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <span className="text-5xl block mb-4">⌨️</span>
                  <p className="text-lg">Enter your income above to see the breakdown</p>
                </div>
              )}

              {/* Save & Export Actions */}
              {income > 0 && (
                <div className="mt-8 pt-6 border-t border-gray-200">
                  {/* Name Input */}
                  <AnimatePresence>
                    {showNameInput && !saved && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-4"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <input
                            type="text"
                            placeholder="Enter calculation name (optional)"
                            value={calculationName}
                            onChange={(e) => setCalculationName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSave(calculationName.trim() || undefined)}
                            className="flex-1 px-4 py-3 text-lg rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                            autoFocus
                          />
                        </div>
                        <div className="flex gap-3">
                          <motion.button
                            onClick={() => handleSave(calculationName.trim() || undefined)}
                            disabled={saving}
                            className={`flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold transition-all ${
                              saving
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-blue-500 hover:bg-blue-600 text-white shadow-md hover:shadow-lg'
                            }`}
                            whileHover={!saving ? { scale: 1.02 } : {}}
                            whileTap={!saving ? { scale: 0.98 } : {}}
                          >
                            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                            {saving ? 'Saving...' : 'Save'}
                          </motion.button>
                          <motion.button
                            onClick={() => { setShowNameInput(false); setCalculationName(''); }}
                            className="px-5 py-3 rounded-xl font-semibold text-gray-600 hover:bg-gray-100 transition-all"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            Cancel
                          </motion.button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="flex items-center gap-3">
                    {/* Save Button */}
                    {loadedBudget ? (
                      <div className="flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-semibold text-lg bg-emerald-100 text-emerald-700 border-2 border-emerald-300">
                        <FolderOpen className="w-6 h-6" />
                        <span>Loaded: {loadedBudget.name}</span>
                      </div>
                    ) : (
                      <motion.button
                        onClick={() => saved ? null : setShowNameInput(true)}
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

                    {/* Export Button */}
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
                            <div
                              className="fixed inset-0 z-10"
                              onClick={() => setExportMenuOpen(false)}
                            />
                            <motion.div
                              initial={{ opacity: 0, y: -10, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: -10, scale: 0.95 }}
                              className="absolute right-0 bottom-full mb-3 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-20 min-w-[200px]"
                            >
                              <button
                                onClick={handleExportPDF}
                                className="flex items-center justify-between px-4 py-4 hover:bg-blue-50 w-full text-left transition"
                              >
                                <div className="flex items-center gap-3">
                                  <FileText className="w-5 h-5 text-blue-500" />
                                  <span className="font-semibold text-gray-800">Export PDF</span>
                                </div>
                                <span className="text-xs font-bold bg-blue-500 text-white px-2 py-1 rounded-full">
                                  RECOMMENDED
                                </span>
                              </button>
                            </motion.div>
                          </>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Info Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 text-white shadow-xl"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                  <Sparkles className="w-6 h-6" strokeWidth={2} />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2" style={{ fontFamily: '"Playfair Display", "Georgia", serif' }}>
                    {calculatorMethod === '503020' ? 'About the 50/30/20 Rule' : 'About Dave Ramsey\'s Method'}
                  </h3>
                  <p className="text-white/90" style={{ fontFamily: '"Inter", sans-serif' }}>
                    {calculatorMethod === '503020'
                      ? 'The 50/30/20 rule is a simple budgeting guideline: 50% of your income goes to needs (housing, utilities, groceries), 30% to wants (entertainment, dining out), and 20% to savings and debt repayment.'
                      : 'Dave Ramsey\'s approach provides detailed category breakdowns with specific percentages for each area of spending. It emphasizes giving, saving first, and keeping housing costs at 25% of take-home pay.'
                    }
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Saved Budgets Section - Below Calculator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-lg p-6 mt-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FolderOpen className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Saved Budgets</h3>
              <p className="text-gray-500 text-sm">{savedBudgets.length} saved</p>
            </div>
          </div>

          {loadingSaved ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          ) : savedBudgets.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Save className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">No saved budgets yet</p>
              <p className="text-sm mt-1">Save a calculation to see it here</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedBudgets.map((budget) => (
                <motion.div
                  key={budget.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                    loadedBudget?.id === budget.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                  }`}
                  onClick={() => handleLoadBudget(budget)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 truncate">{budget.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          budget.data.method === '503020'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {budget.data.method === '503020' ? '50/30/20' : 'Ramsey'}
                        </span>
                        <span className="text-gray-500 text-xs">
                          ${budget.data.monthlyIncome.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 mt-2 text-gray-400 text-xs">
                        <Clock className="w-3 h-3" />
                        <span>{formatDate(budget.savedAt)}</span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(budget.id);
                      }}
                      disabled={deletingId === budget.id}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    >
                      {deletingId === budget.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

const FinancialToolsHorizon = () => {
  const navigate = useNavigate();
  const [activeTool, setActiveTool] = useState<string | null>(null);

  const calculators = [
    {
      id: 'budget',
      title: 'Budget Planner',
      subtitle: 'Track & Plan Your Money',
      iconImage: 'ft1.png',
      cardBg: 'bg-gradient-to-br from-blue-50 to-indigo-100',
      visualBg: 'bg-gradient-to-br from-blue-100/60 to-indigo-200/60',
      categoryBg: 'bg-blue-100',
      categoryText: 'text-blue-700',
      category: 'Planning'
    },
    {
      id: 'savings',
      title: 'Savings Goals',
      subtitle: 'Build Your Wealth',
      iconImage: 'ft2.png',
      cardBg: 'bg-gradient-to-br from-emerald-50 to-teal-100',
      visualBg: 'bg-gradient-to-br from-emerald-100/60 to-teal-200/60',
      categoryBg: 'bg-emerald-100',
      categoryText: 'text-emerald-700',
      category: 'Savings'
    },
    {
      id: 'compound',
      title: 'Compound Interest',
      subtitle: 'Investment Growth Calculator',
      iconImage: 'ft3.png',
      cardBg: 'bg-gradient-to-br from-violet-50 to-purple-100',
      visualBg: 'bg-gradient-to-br from-violet-100/60 to-purple-200/60',
      categoryBg: 'bg-violet-100',
      categoryText: 'text-violet-700',
      category: 'Investment'
    },
    {
      id: 'loan',
      title: 'Loan Calculator',
      subtitle: 'Manage Your Borrowing',
      iconImage: 'ft7.png',
      cardBg: 'bg-gradient-to-br from-amber-50 to-orange-100',
      visualBg: 'bg-gradient-to-br from-amber-100/60 to-orange-200/60',
      categoryBg: 'bg-orange-100',
      categoryText: 'text-orange-700',
      category: 'Borrowing'
    },
    {
      id: 'networth',
      title: 'Net Worth Tracker',
      subtitle: 'Track Your Total Wealth',
      iconImage: 'ft4.png',
      cardBg: 'bg-gradient-to-br from-cyan-50 to-sky-100',
      visualBg: 'bg-gradient-to-br from-cyan-100/60 to-sky-200/60',
      categoryBg: 'bg-cyan-100',
      categoryText: 'text-cyan-700',
      category: 'Tracking'
    },
    {
      id: 'debt-payoff',
      title: 'Debt Payoff Planner',
      subtitle: 'Become Debt-Free',
      iconImage: 'ft5.png',
      cardBg: 'bg-gradient-to-br from-rose-50 to-pink-100',
      visualBg: 'bg-gradient-to-br from-rose-100/60 to-pink-200/60',
      categoryBg: 'bg-rose-100',
      categoryText: 'text-rose-700',
      category: 'Debt'
    },
    {
      id: 'emergency-fund',
      title: 'Emergency Fund',
      subtitle: 'Build Your Safety Net',
      iconImage: 'ft6.png',
      cardBg: 'bg-gradient-to-br from-lime-50 to-green-100',
      visualBg: 'bg-gradient-to-br from-lime-100/60 to-green-200/60',
      categoryBg: 'bg-green-100',
      categoryText: 'text-green-700',
      category: 'Protection'
    }
  ];

  const handleToolClick = (tool: any) => {
    if (tool.id === 'budget') {
      setActiveTool('budget');
    } else {
      navigate(`/financial-tools-original?tool=${tool.id}`);
    }
  };

  const renderCard = (tool: any, index: number) => (
    <motion.div
      key={tool.id}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -8 }}
      onClick={() => handleToolClick(tool)}
      className={`${tool.cardBg} rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer border border-white/50`}
    >
      {/* Visual Area with Main Image */}
      <div className={`w-full h-44 ${tool.visualBg} rounded-2xl mb-4 relative overflow-hidden flex items-center justify-center backdrop-blur-sm`}>
        <img src={tool.iconImage} alt={tool.title} className="w-28 h-28 object-contain drop-shadow-lg hover:scale-110 transition-transform duration-300" />
      </div>

      {/* Title */}
      <h3 className="text-lg font-bold text-gray-900 mb-1" style={{ fontFamily: '"Playfair Display", "Georgia", serif' }}>{tool.title}</h3>
      <p className="text-sm text-gray-500 font-medium mb-4" style={{ fontFamily: '"Inter", sans-serif' }}>{tool.subtitle}</p>

      {/* Bottom Section */}
      <div className="flex items-center justify-between">
        <span className={`px-3 py-1 ${tool.categoryBg} ${tool.categoryText} text-xs font-semibold rounded-full`}>
          {tool.category}
        </span>
        <ChevronRight className="w-5 h-5 text-gray-400" />
      </div>
    </motion.div>
  );

  // Show Budget Calculator full page
  if (activeTool === 'budget') {
    return <BudgetCalculatorPage onBack={() => setActiveTool(null)} />;
  }

  // Show main tools grid
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 pt-24 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors mb-6"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Back to Dashboard</span>
          </button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-5xl font-bold bg-gradient-to-r from-slate-900 via-blue-700 to-indigo-700 bg-clip-text text-transparent mb-4" style={{ fontFamily: '"Playfair Display", "Georgia", serif' }}>
              Financial Toolkit
            </h1>
            <p className="text-gray-600 text-lg" style={{ fontFamily: '"Inter", sans-serif' }}>
              Powerful calculators to master your finances
            </p>
          </motion.div>
        </div>

        {/* Calculators Section */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Calculator className="w-6 h-6 text-blue-600" strokeWidth={2} />
            <h2 className="text-2xl font-bold text-gray-900" style={{ fontFamily: '"Playfair Display", "Georgia", serif' }}>Financial Calculators</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {calculators.map((tool, index) => renderCard(tool, index))}
          </div>
        </div>

        {/* Pro Tip Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 text-white shadow-xl"
        >
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
              <Sparkles className="w-7 h-7" strokeWidth={2} />
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-2" style={{ fontFamily: '"Playfair Display", "Georgia", serif' }}>Pro Tip</h3>
              <p className="text-white/90 text-lg" style={{ fontFamily: '"Inter", sans-serif' }}>
                Use these tools regularly to track your financial progress. Small, consistent actions lead to big results over time. Start with the Budget Planner to get a clear picture of your finances!
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default FinancialToolsHorizon;
