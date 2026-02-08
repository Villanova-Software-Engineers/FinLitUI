import React from 'react';
import type { ReactNode } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, Play, CheckCircle } from 'lucide-react';
import { useModuleScore, MODULES, type ModuleId } from '../hooks/useModuleScore';

interface ModuleAccessControlProps {
  children: ReactNode;
  moduleId: ModuleId;
  moduleName: string;
}

// Module order must match the LEARNING_MODULES order in Home.tsx
const MODULE_ORDER: ModuleId[] = [
  MODULES.BUDGETING_50_30_20.id,
  MODULES.NEEDS_WANTS.id,
  MODULES.CREDIT_SCORE.id,
  MODULES.EMERGENCY_FUND.id,
  MODULES.BONDS.id,
  MODULES.STOCK_MARKET.id,
  MODULES.INSURANCE.id,
  MODULES.DEBT_MANAGEMENT.id,
  MODULES.RETIREMENT_ACCOUNTS.id,
  MODULES.CRYPTO.id,
  MODULES.INVESTMENT_BANKING.id,
];

const ModuleAccessControl: React.FC<ModuleAccessControlProps> = ({
  children,
  moduleId,
  moduleName,
}) => {
  const navigate = useNavigate();
  const { isModulePassed } = useModuleScore();

  // Find module index in the sequence
  const moduleIndex = MODULE_ORDER.indexOf(moduleId);
  
  if (moduleIndex === -1) {
    // Module not found in order - this shouldn't happen, but allow access as fallback
    console.warn(`Module ${moduleId} not found in MODULE_ORDER`);
    return <>{children}</>;
  }

  // Check if module is accessible (previous module passed or is first module)
  const isModuleAccessible = (idx: number): boolean => {
    if (idx === 0) return true; // First module always accessible
    const previousModuleId = MODULE_ORDER[idx - 1] as ModuleId;
    return isModulePassed(previousModuleId);
  };

  // If module is not accessible, show access denied screen
  if (!isModuleAccessible(moduleIndex)) {
    const previousModuleIndex = moduleIndex - 1;
    const previousModuleId = MODULE_ORDER[previousModuleIndex];
    
    // Get previous module name for display
    const previousModule = Object.values(MODULES).find(m => m.id === previousModuleId);
    const previousModuleName = previousModule?.name || 'previous module';

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-500 to-orange-600 px-6 py-8 text-center">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Module Locked</h1>
            <p className="text-red-100 text-sm">Complete previous modules to unlock this content</p>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-3">{moduleName}</h2>
              <p className="text-gray-600 text-sm leading-relaxed">
                To access this module, you must first complete{' '}
                <span className="font-semibold text-blue-600">"{previousModuleName}"</span>.
                Our learning path is designed to build your knowledge step by step.
              </p>
            </div>

            {/* Progress indicator */}
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

            {/* Action buttons */}
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

          {/* Footer with helpful tip */}
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

  // Module is accessible, render the actual content
  return <>{children}</>;
};

export default ModuleAccessControl;