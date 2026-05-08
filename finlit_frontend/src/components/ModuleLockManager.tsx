/**
 * Module Lock Manager Component
 * Used by both Super Admin and Org Admin to lock/unlock modules
 *
 * - Super Admin: Can lock modules for specific organizations (org admins cannot override)
 * - Org Admin: Can lock modules for their students (only if not locked by super admin)
 */

import React, { useState, useEffect } from 'react';
import {
  Lock,
  Unlock,
  Shield,
  ShieldAlert,
  AlertCircle,
  Check,
  X,
  Loader2,
  Search,
} from 'lucide-react';
import {
  getOrganizationLocks,
  setModuleLockBySuperAdmin,
  setModuleLockByOrgAdmin,
  setCaseStudyLockBySuperAdmin,
  setCaseStudyLockByOrgAdmin,
  setCaseStudyWeekLockBySuperAdmin,
  setCaseStudyWeekLockByOrgAdmin,
  getActiveCaseStudy,
} from '../firebase/firestore.service';
import { MODULES } from '../hooks/useModuleScore';
import type { ContentLock, WeekLock } from '../auth/types/auth.types';

interface ModuleLockManagerProps {
  organizationId: string;
  organizationName: string;
  userId: string;
  isSuperAdmin: boolean; // Is this a website super admin (owner)?
}

interface ModuleInfo {
  id: string;
  name: string;
  icon?: string;
  phase?: string;
}

const ModuleLockManager: React.FC<ModuleLockManagerProps> = ({
  organizationId,
  organizationName,
  userId,
  isSuperAdmin,
}) => {
  const [moduleLocks, setModuleLocks] = useState<{ [key: string]: ContentLock }>({});
  const [caseStudyLocks, setCaseStudyLocks] = useState<{ [key: string]: ContentLock }>({});
  const [caseStudyWeekLocks, setCaseStudyWeekLocks] = useState<{ [key: string]: WeekLock }>({});
  const [caseStudyWeeks, setCaseStudyWeeks] = useState<ModuleInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showOnlyLocked, setShowOnlyLocked] = useState(false);

  // Module order matching the Roadmap (all 27 modules in sequential order)
  const allModules: ModuleInfo[] = [
    // Phase 1 — Foundations
    { id: MODULES.WHAT_IS_MONEY.id, name: MODULES.WHAT_IS_MONEY.name, icon: '💵', phase: 'Phase 1: Foundations' },
    { id: MODULES.BUDGETING_50_30_20.id, name: MODULES.BUDGETING_50_30_20.name, icon: '💰', phase: 'Phase 1: Foundations' },
    { id: MODULES.NEEDS_WANTS.id, name: MODULES.NEEDS_WANTS.name, icon: '⚖️', phase: 'Phase 1: Foundations' },
    { id: MODULES.BANKING.id, name: MODULES.BANKING.name, icon: '🏧', phase: 'Phase 1: Foundations' },
    { id: MODULES.EMERGENCY_FUND.id, name: MODULES.EMERGENCY_FUND.name, icon: '🆘', phase: 'Phase 1: Foundations' },

    // Phase 2 — Taxes, Saving & Credit
    { id: MODULES.TAX_BASICS.id, name: MODULES.TAX_BASICS.name, icon: '🧾', phase: 'Phase 2: Taxes, Saving & Credit' },
    { id: MODULES.INTEREST_RATES.id, name: MODULES.INTEREST_RATES.name, icon: '📊', phase: 'Phase 2: Taxes, Saving & Credit' },
    { id: MODULES.CREDIT_SCORE.id, name: MODULES.CREDIT_SCORE.name, icon: '💳', phase: 'Phase 2: Taxes, Saving & Credit' },
    { id: MODULES.DEBT_MANAGEMENT.id, name: MODULES.DEBT_MANAGEMENT.name, icon: '💸', phase: 'Phase 2: Taxes, Saving & Credit' },
    { id: MODULES.CONSUMER_TRAPS.id, name: MODULES.CONSUMER_TRAPS.name, icon: '🎯', phase: 'Phase 2: Taxes, Saving & Credit' },

    // Phase 3 — Protection
    { id: MODULES.RISK_TAKING.id, name: MODULES.RISK_TAKING.name, icon: '🎲', phase: 'Phase 3: Protection' },
    { id: MODULES.INSURANCE.id, name: MODULES.INSURANCE.name, icon: '🛡️', phase: 'Phase 3: Protection' },
    { id: MODULES.FINANCIAL_SAFETY.id, name: MODULES.FINANCIAL_SAFETY.name, icon: '🔒', phase: 'Phase 3: Protection' },

    // Phase 4 — Investing & Assets
    { id: MODULES.COMPOUNDING.id, name: MODULES.COMPOUNDING.name, icon: '📈', phase: 'Phase 4: Investing & Assets' },
    { id: MODULES.INFLATION_DEFLATION.id, name: MODULES.INFLATION_DEFLATION.name, icon: '💹', phase: 'Phase 4: Investing & Assets' },
    { id: MODULES.BONDS.id, name: MODULES.BONDS.name, icon: '📜', phase: 'Phase 4: Investing & Assets' },
    { id: MODULES.STOCK_MARKET.id, name: MODULES.STOCK_MARKET.name, icon: '📊', phase: 'Phase 4: Investing & Assets' },
    { id: MODULES.INVESTMENT_VEHICLES.id, name: MODULES.INVESTMENT_VEHICLES.name, icon: '🚗', phase: 'Phase 4: Investing & Assets' },
    { id: MODULES.REAL_ESTATE.id, name: MODULES.REAL_ESTATE.name, icon: '🏠', phase: 'Phase 4: Investing & Assets' },
    { id: MODULES.RETIREMENT_ACCOUNTS.id, name: MODULES.RETIREMENT_ACCOUNTS.name, icon: '👴', phase: 'Phase 4: Investing & Assets' },

    // Phase 5 — Accounting
    { id: MODULES.ACCOUNTING.id, name: MODULES.ACCOUNTING.name, icon: '📋', phase: 'Phase 5: Accounting' },
    { id: MODULES.BALANCE_SHEET.id, name: MODULES.BALANCE_SHEET.name, icon: '⚖️', phase: 'Phase 5: Accounting' },
    { id: MODULES.INCOME_STATEMENT.id, name: MODULES.INCOME_STATEMENT.name, icon: '📊', phase: 'Phase 5: Accounting' },
    { id: MODULES.CASH_FLOW_STATEMENT.id, name: MODULES.CASH_FLOW_STATEMENT.name, icon: '💧', phase: 'Phase 5: Accounting' },

    // Phase 6 — Advanced
    { id: MODULES.CRYPTO.id, name: MODULES.CRYPTO.name, icon: '₿', phase: 'Phase 6: Advanced' },
    { id: MODULES.INVESTMENT_BANKING.id, name: MODULES.INVESTMENT_BANKING.name, icon: '🏦', phase: 'Phase 6: Advanced' },
    { id: MODULES.GIVING.id, name: MODULES.GIVING.name, icon: '💝', phase: 'Phase 6: Advanced' },
    { id: MODULES.GLOBAL_MARKETS.id, name: MODULES.GLOBAL_MARKETS.name, icon: '🌍', phase: 'Phase 6: Advanced' },
    { id: MODULES.ESG_INVESTING.id, name: MODULES.ESG_INVESTING.name, icon: '🌱', phase: 'Phase 6: Advanced' },
    { id: MODULES.NEGOTIATING.id, name: MODULES.NEGOTIATING.name, icon: '🤝', phase: 'Phase 6: Advanced' },
  ];

  useEffect(() => {
    loadLocks();
  }, [organizationId]);

  const loadLocks = async () => {
    try {
      setLoading(true);

      // Load locks
      const locks = await getOrganizationLocks(organizationId);
      setModuleLocks(locks.modules);
      setCaseStudyLocks(locks.caseStudies);
      setCaseStudyWeekLocks(locks.caseStudyWeeks);

      // Load case study weeks dynamically from Firebase
      const caseStudy = await getActiveCaseStudy();
      if (caseStudy?.weeks) {
        const weeksData = caseStudy.weeks as Record<string | number, any>;
        const weekNumbers = Object.keys(weeksData).map(Number).sort((a, b) => a - b);
        const weeks: ModuleInfo[] = weekNumbers.map(weekNum => {
          const weekContent = weeksData[weekNum] || weeksData[String(weekNum)];
          return {
            id: String(weekNum),
            name: weekContent?.subject ? `Week ${weekNum}: ${weekContent.subject}` : `Week ${weekNum} Case Study`,
            icon: '📚',
          };
        });
        setCaseStudyWeeks(weeks);
      }
    } catch (err) {
      console.error('Error loading locks:', err);
      setError('Failed to load content locks');
    } finally {
      setLoading(false);
    }
  };

  const toggleModuleLock = async (moduleId: string, moduleName: string) => {
    const currentLock = moduleLocks[moduleId];
    const isCurrentlyLocked = currentLock?.lockedBySuperAdmin || currentLock?.lockedByOrgAdmin;

    // Check if org admin is trying to unlock a super-admin-locked module
    if (!isSuperAdmin && currentLock?.lockedBySuperAdmin) {
      setError('Cannot modify modules locked by super admin');
      setTimeout(() => setError(null), 3000);
      return;
    }

    try {
      setProcessing(moduleId);
      setError(null);
      setSuccess(null);

      if (isSuperAdmin) {
        await setModuleLockBySuperAdmin(organizationId, moduleId, !isCurrentlyLocked, userId);
      } else {
        await setModuleLockByOrgAdmin(organizationId, moduleId, !isCurrentlyLocked, userId);
      }

      setSuccess(`${moduleName} ${isCurrentlyLocked ? 'unlocked' : 'locked'} successfully`);
      setTimeout(() => setSuccess(null), 3000);
      await loadLocks();
    } catch (err: any) {
      setError(err.message || `Failed to ${isCurrentlyLocked ? 'unlock' : 'lock'} module`);
      setTimeout(() => setError(null), 3000);
    } finally {
      setProcessing(null);
    }
  };

  const toggleCaseStudyLock = async (caseStudyId: string, caseStudyName: string) => {
    const currentLock = caseStudyLocks[caseStudyId];
    const isCurrentlyLocked = currentLock?.lockedBySuperAdmin || currentLock?.lockedByOrgAdmin;

    if (!isSuperAdmin && currentLock?.lockedBySuperAdmin) {
      setError('Cannot modify case studies locked by super admin');
      setTimeout(() => setError(null), 3000);
      return;
    }

    try {
      setProcessing(caseStudyId);
      setError(null);
      setSuccess(null);

      if (isSuperAdmin) {
        await setCaseStudyLockBySuperAdmin(organizationId, caseStudyId, !isCurrentlyLocked, userId);
      } else {
        await setCaseStudyLockByOrgAdmin(organizationId, caseStudyId, !isCurrentlyLocked, userId);
      }

      setSuccess(`${caseStudyName} ${isCurrentlyLocked ? 'unlocked' : 'locked'} successfully`);
      setTimeout(() => setSuccess(null), 3000);
      await loadLocks();
    } catch (err: any) {
      setError(err.message || `Failed to ${isCurrentlyLocked ? 'unlock' : 'lock'} case study`);
      setTimeout(() => setError(null), 3000);
    } finally {
      setProcessing(null);
    }
  };

  const toggleCaseStudyWeekLock = async (weekNumber: number, weekName: string) => {
    const weekKey = weekNumber.toString();
    const currentLock = caseStudyWeekLocks[weekKey];
    const isCurrentlyLocked = currentLock?.lockedBySuperAdmin || currentLock?.lockedByOrgAdmin;

    if (!isSuperAdmin && currentLock?.lockedBySuperAdmin) {
      setError('Cannot modify case study weeks locked by super admin');
      setTimeout(() => setError(null), 3000);
      return;
    }

    try {
      setProcessing(`week-${weekNumber}`);
      setError(null);
      setSuccess(null);

      if (isSuperAdmin) {
        await setCaseStudyWeekLockBySuperAdmin(organizationId, weekNumber, !isCurrentlyLocked, userId);
      } else {
        await setCaseStudyWeekLockByOrgAdmin(organizationId, weekNumber, !isCurrentlyLocked, userId);
      }

      setSuccess(`${weekName} ${isCurrentlyLocked ? 'unlocked' : 'locked'} successfully`);
      setTimeout(() => setSuccess(null), 3000);
      await loadLocks();
    } catch (err: any) {
      setError(err.message || `Failed to ${isCurrentlyLocked ? 'unlock' : 'lock'} case study week`);
      setTimeout(() => setError(null), 3000);
    } finally {
      setProcessing(null);
    }
  };

  const lockAllModules = async () => {
    if (!confirm(`Lock all modules for ${organizationName}? Students will not be able to access them.`)) {
      return;
    }

    try {
      setLoading(true);
      let lockedCount = 0;
      let skippedCount = 0;

      for (const module of allModules) {
        if (isSuperAdmin) {
          await setModuleLockBySuperAdmin(organizationId, module.id, true, userId);
          lockedCount++;
        } else {
          // Skip modules locked by super admin
          const lock = moduleLocks[module.id];
          if (!lock?.lockedBySuperAdmin) {
            await setModuleLockByOrgAdmin(organizationId, module.id, true, userId);
            lockedCount++;
          } else {
            skippedCount++;
          }
        }
      }

      if (skippedCount > 0) {
        setSuccess(`Locked ${lockedCount} modules. ${skippedCount} modules were already locked by super admin.`);
      } else {
        setSuccess(`All ${lockedCount} modules locked successfully`);
      }
      setTimeout(() => setSuccess(null), 5000);
      await loadLocks();
    } catch (err: any) {
      setError(err.message || 'Failed to lock all modules');
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const unlockAllModules = async () => {
    if (!confirm(`Unlock all modules for ${organizationName}? Students will be able to access them.`)) {
      return;
    }

    try {
      setLoading(true);
      let unlockedCount = 0;
      let skippedCount = 0;

      for (const module of allModules) {
        if (isSuperAdmin) {
          await setModuleLockBySuperAdmin(organizationId, module.id, false, userId);
          unlockedCount++;
        } else {
          // Skip modules locked by super admin
          const lock = moduleLocks[module.id];
          if (lock?.lockedBySuperAdmin) {
            skippedCount++;
          } else if (lock?.lockedByOrgAdmin) {
            // Only unlock if it's locked by org admin
            await setModuleLockByOrgAdmin(organizationId, module.id, false, userId);
            unlockedCount++;
          }
        }
      }

      if (skippedCount > 0) {
        setSuccess(`Unlocked ${unlockedCount} modules. ${skippedCount} modules remain locked by super admin.`);
      } else if (unlockedCount > 0) {
        setSuccess(`All ${unlockedCount} modules unlocked successfully`);
      } else {
        setSuccess('No modules were locked by you to unlock');
      }
      setTimeout(() => setSuccess(null), 5000);
      await loadLocks();
    } catch (err: any) {
      setError(err.message || 'Failed to unlock all modules');
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Filter modules based on search and locked status
  const filteredModules = allModules.filter(module => {
    const matchesSearch = module.name.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;

    if (showOnlyLocked) {
      const lock = moduleLocks[module.id];
      return lock?.lockedBySuperAdmin || lock?.lockedByOrgAdmin;
    }

    return true;
  });

  // Group modules by phase
  const modulesByPhase = filteredModules.reduce((acc, module) => {
    const phase = module.phase || 'Other';
    if (!acc[phase]) {
      acc[phase] = [];
    }
    acc[phase].push(module);
    return acc;
  }, {} as { [phase: string]: ModuleInfo[] });

  const getStatusBadge = (lock: ContentLock | undefined, contentType: 'module' | 'caseStudy') => {
    if (!lock) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <Unlock className="h-3 w-3 mr-1" />
          Unlocked
        </span>
      );
    }

    if (lock.lockedBySuperAdmin) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <Shield className="h-3 w-3 mr-1" />
          Locked by Super Admin
        </span>
      );
    }

    if (lock.lockedByOrgAdmin) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <Lock className="h-3 w-3 mr-1" />
          Locked by Org Admin
        </span>
      );
    }

    return null;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Content Access Control
        </h2>
        <p className="text-gray-600">
          Manage module and case study access for <span className="font-semibold">{organizationName}</span>
        </p>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-red-700">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="text-red-600 hover:text-red-800">
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
          <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-green-700">{success}</p>
          </div>
          <button onClick={() => setSuccess(null)} className="text-green-600 hover:text-green-800">
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Info Box */}
      {!isSuperAdmin && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Org Admin Permissions:</p>
              <ul className="list-disc list-inside space-y-1 text-blue-700">
                <li>You can lock/unlock modules for your students</li>
                <li>Modules locked by super admin cannot be modified</li>
                <li>Use this to control curriculum pacing for your organization</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Actions */}
      <div className="mb-6 flex flex-wrap gap-3">
        <button
          onClick={lockAllModules}
          disabled={loading}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          <Lock className="h-4 w-4" />
          Lock All Modules
        </button>
        <button
          onClick={unlockAllModules}
          disabled={loading}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          <Unlock className="h-4 w-4" />
          Unlock All Modules
        </button>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search modules..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showOnlyLocked}
            onChange={(e) => setShowOnlyLocked(e.target.checked)}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">Show only locked</span>
        </label>
      </div>

      {/* Modules List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
        <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Modules ({filteredModules.length})
          </h3>
          <p className="text-sm text-gray-600 mt-1">Listed in the same order as the student roadmap</p>
        </div>

        {Object.keys(modulesByPhase).length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-500">
            <p>No modules found matching your search</p>
          </div>
        ) : (
          <div>
            {Object.entries(modulesByPhase).map(([phase, modules]) => (
              <div key={phase}>
                {/* Phase Header */}
                <div className="px-6 py-3 bg-gray-50 border-y border-gray-200">
                  <h4 className="text-sm font-bold text-gray-700">{phase}</h4>
                </div>

                {/* Modules in this phase */}
                <div className="divide-y divide-gray-100">
                  {modules.map((module, index) => {
                    const lock = moduleLocks[module.id];
                    const isLocked = lock?.lockedBySuperAdmin || lock?.lockedByOrgAdmin;
                    const canModify = isSuperAdmin || !lock?.lockedBySuperAdmin;

                    return (
                      <div
                        key={module.id}
                        className="px-6 py-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-2xl">{module.icon}</span>
                              <span className="text-sm text-gray-500 font-mono w-6">#{index + 1}</span>
                              <span className="font-medium text-gray-900">{module.name}</span>
                              {getStatusBadge(lock, 'module')}
                            </div>
                            {lock && (
                              <p className="text-xs text-gray-500 ml-14">
                                Last modified {new Date(lock.lockedAt).toLocaleString()}
                              </p>
                            )}
                          </div>

                          <button
                            onClick={() => toggleModuleLock(module.id, module.name)}
                            disabled={!canModify || processing === module.id}
                            className={`ml-4 px-4 py-2 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                              isLocked
                                ? 'bg-green-600 text-white hover:bg-green-700'
                                : 'bg-red-600 text-white hover:bg-red-700'
                            }`}
                            title={!canModify ? 'Locked by super admin' : ''}
                          >
                            {processing === module.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : isLocked ? (
                              <Unlock className="h-4 w-4" />
                            ) : (
                              <Lock className="h-4 w-4" />
                            )}
                            {isLocked ? 'Unlock' : 'Lock'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Case Study Weeks */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Case Study Weeks ({caseStudyWeeks.length} Weeks)
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Control access to individual case study weeks
          </p>
        </div>

        <div className="divide-y divide-gray-200">
          {caseStudyWeeks.map((week) => {
            const weekNumber = parseInt(week.id);
            const weekKey = week.id;
            const lock = caseStudyWeekLocks[weekKey];
            const isLocked = lock?.lockedBySuperAdmin || lock?.lockedByOrgAdmin;
            const canModify = isSuperAdmin || !lock?.lockedBySuperAdmin;

            return (
              <div
                key={week.id}
                className="px-6 py-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{week.icon}</span>
                      <span className="font-medium text-gray-900">{week.name}</span>
                      {getStatusBadge(lock, 'caseStudy')}
                    </div>
                    {lock && (
                      <p className="text-xs text-gray-500">
                        Last modified {new Date(lock.lockedAt).toLocaleString()}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => toggleCaseStudyWeekLock(weekNumber, week.name)}
                    disabled={!canModify || processing === `week-${weekNumber}`}
                    className={`ml-4 px-4 py-2 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                      isLocked
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-red-600 text-white hover:bg-red-700'
                    }`}
                    title={!canModify ? 'Locked by super admin' : ''}
                  >
                    {processing === `week-${weekNumber}` ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : isLocked ? (
                      <Unlock className="h-4 w-4" />
                    ) : (
                      <Lock className="h-4 w-4" />
                    )}
                    {isLocked ? 'Unlock' : 'Lock'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ModuleLockManager;
