import { useState, useCallback, useEffect } from 'react';
import { useAuthContext } from '../auth/context/AuthContext';
import {
  getStudentProgress,
  updateModuleScore,
  updateStreak,
  addAchievement,
  resetModuleProgress,
  calculateDailyStreak,
  completeDailyChallenge,
  saveCrosswordProgress,
  getCrosswordProgress,
  getCurrentCrosswordWeekId,
  getQuizQuestions,
  saveQuickQuizProgress,
  getQuickQuizProgress,
  getCurrentQuizVersion,
} from '../firebase/firestore.service';
import type { StudentProgress, ModuleScore, CrosswordProgress, QuizQuestion, QuickQuizProgress } from '../auth/types/auth.types';

// Module definitions
export const MODULES = {
  CREDIT_SCORE: { id: 'credit-score', name: 'Credit Score', maxScore: 100 },
  STOCK_MARKET: { id: 'stock-market', name: 'Stock Market', maxScore: 100 },
  INVESTMENT_BANKING: { id: 'investment-banking', name: 'Investment Banking', maxScore: 100 },
  EMERGENCY_FUND: { id: 'emergency-fund', name: 'Emergency Fund', maxScore: 100 },
  INSURANCE: { id: 'insurance', name: 'Insurance', maxScore: 100 },
  DEBT_MANAGEMENT: { id: 'debt-management', name: 'Debt Management', maxScore: 100 },
  BUDGETING_50_30_20: { id: '50-30-20', name: 'Budgeting 50/30/20', maxScore: 100 },
  NEEDS_WANTS: { id: 'needs-wants', name: 'Needs vs Wants', maxScore: 100 },
  TRUE_FALSE: { id: 'true-false', name: 'True or False Quiz', maxScore: 100 },
  RETIREMENT_ACCOUNTS: { id: 'retirement-accounts', name: 'Retirement Accounts', maxScore: 100 },
  CRYPTO: { id: 'crypto', name: 'Cryptocurrency Basics', maxScore: 100 },
} as const;

export type ModuleId = typeof MODULES[keyof typeof MODULES]['id'];

// Pass requirement: 100%
export const PASS_THRESHOLD = 100;

interface SaveScoreResult {
  passed: boolean;
  attemptNumber: number;
  needsRetake: boolean;
}

interface SaveCrosswordResult {
  xpAwarded: number;
  totalCorrectWords: number;
}

interface SaveQuizAnswerResult {
  xpAwarded: number;
  alreadyAnswered: boolean;
}

interface UseModuleScoreReturn {
  progress: StudentProgress | null;
  isLoading: boolean;
  error: string | null;
  saveScore: (moduleId: ModuleId, score: number, maxScore?: number) => Promise<SaveScoreResult>;
  incrementStreak: () => Promise<void>;
  resetStreak: () => Promise<void>;
  checkAndUpdateDailyStreak: () => Promise<{ streak: number; incrementedToday: boolean }>;
  unlockAchievement: (achievement: string) => Promise<void>;
  getModuleScore: (moduleId: ModuleId) => ModuleScore | undefined;
  isModulePassed: (moduleId: ModuleId) => boolean;
  resetModule: (moduleId: ModuleId) => Promise<void>;
  refreshProgress: () => Promise<void>;
  submitDailyChallenge: () => Promise<{ awarded: boolean; alreadyCompleted: boolean }>;
  // Crossword functions
  saveCrossword: (answers: { [key: string]: string }, newlyCorrectWords: string[], allCorrectWords: string[]) => Promise<SaveCrosswordResult>;
  loadCrosswordProgress: () => Promise<CrosswordProgress | null>;
  getCrosswordWeekId: () => string;
  // Quick Quiz functions
  loadQuizQuestions: () => Promise<QuizQuestion[]>;
  saveQuizAnswer: (questionId: string, selectedAnswer: number, isCorrect: boolean, quizVersion: string) => Promise<SaveQuizAnswerResult>;
  loadQuizProgress: (quizVersion: string) => Promise<QuickQuizProgress | null>;
  getQuizVersion: () => Promise<string>;
}

export const useModuleScore = (): UseModuleScoreReturn => {
  const { user, isAuthenticated } = useAuthContext();
  const [progress, setProgress] = useState<StudentProgress | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch student progress on mount and when user changes
  const refreshProgress = useCallback(async () => {
    if (!user || !isAuthenticated) {
      setProgress(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const studentProgress = await getStudentProgress(user.id);
      setProgress(studentProgress);
    } catch (err) {
      console.error('Error fetching progress:', err);
      setError('Failed to load progress');
    } finally {
      setIsLoading(false);
    }
  }, [user, isAuthenticated]);

  useEffect(() => {
    refreshProgress();
  }, [refreshProgress]);

  // Save module score and return pass/fail result
  const saveScore = useCallback(async (
    moduleId: ModuleId,
    score: number,
    maxScore: number = 100
  ): Promise<SaveScoreResult> => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Find module name
    const module = Object.values(MODULES).find(m => m.id === moduleId);
    if (!module) {
      throw new Error('Invalid module ID');
    }

    const moduleScore = {
      moduleId,
      moduleName: module.name,
      score,
      maxScore,
      completedAt: new Date(),
    };

    try {
      const result = await updateModuleScore(user.id, moduleScore);
      await refreshProgress();

      // Calculate percentage score
      const percentageScore = (score / maxScore) * 100;
      const needsRetake = percentageScore < PASS_THRESHOLD;

      return {
        passed: result.passed,
        attemptNumber: result.attemptNumber,
        needsRetake,
      };
    } catch (err) {
      console.error('Error saving score:', err);
      throw new Error('Failed to save score');
    }
  }, [user, refreshProgress]);

  // Increment streak
  const incrementStreak = useCallback(async () => {
    if (!user || !progress) return;

    const newStreak = (progress.streak || 0) + 1;
    try {
      await updateStreak(user.id, newStreak);
      setProgress(prev => prev ? { ...prev, streak: newStreak } : null);
    } catch (err) {
      console.error('Error updating streak:', err);
    }
  }, [user, progress]);

  // Reset streak
  const resetStreak = useCallback(async () => {
    if (!user) return;

    try {
      await updateStreak(user.id, 0);
      setProgress(prev => prev ? { ...prev, streak: 0 } : null);
    } catch (err) {
      console.error('Error resetting streak:', err);
    }
  }, [user]);

  // Check and update daily streak (proper calculation based on consecutive days)
  const checkAndUpdateDailyStreak = useCallback(async (): Promise<{ streak: number; incrementedToday: boolean }> => {
    if (!user) return { streak: 0, incrementedToday: false };

    try {
      const result = await calculateDailyStreak(user.id);
      if (result.incrementedToday) {
        setProgress(prev => prev ? { ...prev, streak: result.streak } : null);
      }
      return result;
    } catch (err) {
      console.error('Error checking daily streak:', err);
      return { streak: progress?.streak || 0, incrementedToday: false };
    }
  }, [user, progress?.streak]);

  // Unlock achievement
  const unlockAchievement = useCallback(async (achievement: string) => {
    if (!user) return;

    try {
      await addAchievement(user.id, achievement);
      await refreshProgress();
    } catch (err) {
      console.error('Error unlocking achievement:', err);
    }
  }, [user, refreshProgress]);

  // Get specific module score
  const getModuleScore = useCallback((moduleId: ModuleId): ModuleScore | undefined => {
    if (!progress) return undefined;
    return progress.moduleScores?.find(s => s.moduleId === moduleId);
  }, [progress]);

  // Check if a module has been passed (100%)
  const isModulePassed = useCallback((moduleId: ModuleId): boolean => {
    const moduleScore = progress?.moduleScores?.find(s => s.moduleId === moduleId);
    return moduleScore?.passed ?? false;
  }, [progress]);

  // Reset a module to allow retaking
  const resetModule = useCallback(async (moduleId: ModuleId): Promise<void> => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      await resetModuleProgress(user.id, moduleId);
      await refreshProgress();
    } catch (err) {
      console.error('Error resetting module:', err);
      throw new Error('Failed to reset module');
    }
  }, [user, refreshProgress]);

  // Submit daily challenge and award XP (5 XP, once per day)
  const submitDailyChallenge = useCallback(async (): Promise<{ awarded: boolean; alreadyCompleted: boolean }> => {
    if (!user) {
      return { awarded: false, alreadyCompleted: false };
    }

    try {
      const result = await completeDailyChallenge(user.id, 5);
      if (result.awarded) {
        await refreshProgress();
      }
      return result;
    } catch (err) {
      console.error('Error completing daily challenge:', err);
      return { awarded: false, alreadyCompleted: false };
    }
  }, [user, refreshProgress]);

  // Save crossword progress and award XP (2 XP per newly correct word)
  const saveCrossword = useCallback(async (
    answers: { [key: string]: string },
    newlyCorrectWords: string[],
    allCorrectWords: string[]
  ): Promise<SaveCrosswordResult> => {
    if (!user) {
      return { xpAwarded: 0, totalCorrectWords: 0 };
    }

    try {
      const result = await saveCrosswordProgress(user.id, answers, newlyCorrectWords, allCorrectWords);
      if (result.xpAwarded > 0) {
        await refreshProgress();
      }
      return result;
    } catch (err) {
      console.error('Error saving crossword progress:', err);
      return { xpAwarded: 0, totalCorrectWords: allCorrectWords.length };
    }
  }, [user, refreshProgress]);

  // Load crossword progress for current week
  const loadCrosswordProgress = useCallback(async (): Promise<CrosswordProgress | null> => {
    if (!user) {
      return null;
    }

    try {
      return await getCrosswordProgress(user.id);
    } catch (err) {
      console.error('Error loading crossword progress:', err);
      return null;
    }
  }, [user]);

  // Get current crossword week ID
  const getCrosswordWeekId = useCallback((): string => {
    return getCurrentCrosswordWeekId();
  }, []);

  // Load quiz questions from Firestore
  const loadQuizQuestions = useCallback(async (): Promise<QuizQuestion[]> => {
    try {
      return await getQuizQuestions();
    } catch (err) {
      console.error('Error loading quiz questions:', err);
      return [];
    }
  }, []);

  // Save quiz answer and award XP (3 XP per correct answer)
  const saveQuizAnswer = useCallback(async (
    questionId: string,
    selectedAnswer: number,
    isCorrect: boolean,
    quizVersion: string
  ): Promise<SaveQuizAnswerResult> => {
    if (!user) {
      return { xpAwarded: 0, alreadyAnswered: false };
    }

    try {
      const result = await saveQuickQuizProgress(user.id, questionId, selectedAnswer, isCorrect, quizVersion);
      if (result.xpAwarded > 0) {
        await refreshProgress();
      }
      return result;
    } catch (err) {
      console.error('Error saving quiz answer:', err);
      return { xpAwarded: 0, alreadyAnswered: false };
    }
  }, [user, refreshProgress]);

  // Load quiz progress for current version
  const loadQuizProgress = useCallback(async (quizVersion: string): Promise<QuickQuizProgress | null> => {
    if (!user) {
      return null;
    }

    try {
      return await getQuickQuizProgress(user.id, quizVersion);
    } catch (err) {
      console.error('Error loading quiz progress:', err);
      return null;
    }
  }, [user]);

  // Get current quiz version
  const getQuizVersion = useCallback(async (): Promise<string> => {
    try {
      return await getCurrentQuizVersion();
    } catch (err) {
      console.error('Error getting quiz version:', err);
      return 'v0';
    }
  }, []);

  return {
    progress,
    isLoading,
    error,
    saveScore,
    incrementStreak,
    resetStreak,
    checkAndUpdateDailyStreak,
    unlockAchievement,
    getModuleScore,
    isModulePassed,
    resetModule,
    refreshProgress,
    submitDailyChallenge,
    saveCrossword,
    loadCrosswordProgress,
    getCrosswordWeekId,
    loadQuizQuestions,
    saveQuizAnswer,
    loadQuizProgress,
    getQuizVersion,
  };
};
