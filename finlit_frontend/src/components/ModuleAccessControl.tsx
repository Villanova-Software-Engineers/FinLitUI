import React, { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, Play, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { useModuleScore, MODULES, type ModuleId } from '../hooks/useModuleScore';
import { useAuthContext } from '../auth/context/AuthContext';
import { getScheduleForContent } from '../firebase/firestore.service';
import type { ContentSchedule } from '../auth/types/auth.types';

interface ModuleAccessControlProps {
  children: ReactNode;
  moduleId: ModuleId;
  moduleName: string;
}

// Module order must match the order in Roadmap.jsx
const MODULE_ORDER: ModuleId[] = [
  MODULES.WHAT_IS_MONEY.id,
  MODULES.BUDGETING_50_30_20.id,
  MODULES.NEEDS_WANTS.id,
  MODULES.BANKING.id,
  MODULES.EMERGENCY_FUND.id,
  MODULES.TAX_BASICS.id,
  MODULES.INTEREST_RATES.id,
  MODULES.CREDIT_SCORE.id,
  MODULES.DEBT_MANAGEMENT.id,
  MODULES.CONSUMER_TRAPS.id,
  MODULES.RISK_TAKING.id,
  MODULES.INSURANCE.id,
  MODULES.FINANCIAL_SAFETY.id,
  MODULES.COMPOUNDING.id,
  MODULES.INFLATION_DEFLATION.id,
  MODULES.BONDS.id,
  MODULES.STOCK_MARKET.id,
  MODULES.INVESTMENT_VEHICLES.id,
  MODULES.REAL_ESTATE.id,
  MODULES.RETIREMENT_ACCOUNTS.id,
  MODULES.CRYPTO.id,
  MODULES.INVESTMENT_BANKING.id,
  MODULES.GIVING.id,
  MODULES.GLOBAL_MARKETS.id,
  MODULES.ESG_INVESTING.id,
  MODULES.NEGOTIATING.id,
];

function formatDate(d: Date): string {
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

const ModuleAccessControl: React.FC<ModuleAccessControlProps> = ({
  children,
  moduleId,
  moduleName,
}) => {
  const navigate = useNavigate();
  const { isModulePassed } = useModuleScore();
  const { user } = useAuthContext();

  const [schedule, setSchedule] = useState<ContentSchedule | null | 'loading'>('loading');

  // Load schedule for this module + classCode (students only)
  useEffect(() => {
    if (!user || user.role !== 'student' || !user.classCode) {
      setSchedule(null);
      return;
    }
    let cancelled = false;
    getScheduleForContent(user.classCode, 'module', moduleId)
      .then(s => { if (!cancelled) setSchedule(s); })
      .catch(() => { if (!cancelled) setSchedule(null); });
    return () => { cancelled = true; };
  }, [user, moduleId]);

  const moduleIndex = MODULE_ORDER.indexOf(moduleId);

  if (moduleIndex === -1) {
    console.warn(`Module ${moduleId} not found in MODULE_ORDER`);
    return <>{children}</>;
  }

  // Admins and owners bypass all access checks
  if (user?.role === 'admin' || user?.role === 'owner') {
    return <>{children}</>;
  }

  // Show loading spinner while schedule is being fetched
  if (schedule === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const now = new Date();

  // Schedule check: content not yet released
  if (schedule && schedule.releaseDate > now) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-8 text-center">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Not Yet Available</h1>
            <p className="text-blue-100 text-sm">Your instructor has scheduled this module for a future date</p>
          </div>
          <div className="p-6">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-3">{moduleName}</h2>
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                <p className="text-sm text-blue-700 font-medium">Opens on</p>
                <p className="text-lg font-bold text-blue-900 mt-1">{formatDate(schedule.releaseDate)}</p>
              </div>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/game')}
                className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all font-semibold shadow-md"
              >
                <Play className="w-5 h-5" fill="currentColor" />
                View Learning Path
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-semibold"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Schedule check: due date passed and action is lock
  if (schedule?.dueDate && schedule.dueDate < now && schedule.onDueDateAction === 'lock') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-red-500 to-orange-600 px-6 py-8 text-center">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Due Date Passed</h1>
            <p className="text-red-100 text-sm">Your instructor has closed this module</p>
          </div>
          <div className="p-6">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-3">{moduleName}</h2>
              <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                <p className="text-sm text-red-700 font-medium">Due date was</p>
                <p className="text-lg font-bold text-red-900 mt-1">{formatDate(schedule.dueDate)}</p>
                <p className="text-xs text-red-600 mt-2">Contact your instructor if you need access</p>
              </div>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/game')}
                className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-gradient-to-r from-red-500 to-orange-600 text-white rounded-xl hover:from-red-600 hover:to-orange-700 transition-all font-semibold shadow-md"
              >
                <Play className="w-5 h-5" fill="currentColor" />
                View Learning Path
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-semibold"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Sequential access check: previous module must be passed
  const isModuleAccessible = (idx: number): boolean => {
    if (idx === 0) return true;
    const previousModuleId = MODULE_ORDER[idx - 1] as ModuleId;
    return isModulePassed(previousModuleId);
  };

  if (!isModuleAccessible(moduleIndex)) {
    const previousModuleId = MODULE_ORDER[moduleIndex - 1];
    const previousModule = Object.values(MODULES).find(m => m.id === previousModuleId);
    const previousModuleName = previousModule?.name || 'previous module';

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-red-500 to-orange-600 px-6 py-8 text-center">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Module Locked</h1>
            <p className="text-red-100 text-sm">Complete previous modules to unlock this content</p>
          </div>
          <div className="p-6">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-3">{moduleName}</h2>
              <p className="text-gray-600 text-sm leading-relaxed">
                To access this module, you must first complete{' '}
                <span className="font-semibold text-blue-600">"{previousModuleName}"</span>.
                Our learning path is designed to build your knowledge step by step.
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <span>Learning Progress</span>
                <span>{moduleIndex}/{MODULE_ORDER.length}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(moduleIndex / MODULE_ORDER.length) * 100}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Complete the previous module to continue your journey
              </p>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/game')}
                className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-[1.02] font-semibold"
              >
                <Play className="w-5 h-5" fill="currentColor" />
                View Learning Path
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 font-semibold"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Dashboard
              </button>
            </div>
          </div>
          <div className="bg-blue-50 px-6 py-4 border-t border-blue-100">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-blue-800 font-medium">Pro Tip</p>
                <p className="text-xs text-blue-700">
                  Each module builds on the previous one. This ensures you have the foundation needed to succeed!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ModuleAccessControl;
