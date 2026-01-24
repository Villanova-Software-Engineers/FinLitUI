import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  serverTimestamp,
  Timestamp,
  FieldValue,
  orderBy,
} from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { db, getSecondaryAuth, cleanupSecondaryApp } from './config';
import type {
  Organization,
  ClassCode,
  StudentProgress,
  ModuleScore,
  ModuleAttempt,
  CodeValidation,
  User,
  RegisteredStudent,
  StudentWithProgress,
  UserDashboardData,
  CrosswordProgress,
  QuizQuestion,
  QuickQuizProgress,
} from '../auth/types/auth.types';

// Type helper for Firestore documents with serverTimestamp
type WithServerTimestamp<T, K extends keyof T> = Omit<T, K> & {
  [P in K]: FieldValue;
};

// Collection references
const ORGANIZATIONS = 'organizations';
const CLASS_CODES = 'classCodes';
const USERS = 'users';
const STUDENT_PROGRESS = 'studentProgress';

// ============== Helper Functions ==============

function generateCode(length: number = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function generatePassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

// ============== Super Admin Functions ==============

export async function checkIsSuperAdmin(userId: string): Promise<boolean> {
  try {
    const superAdminRef = doc(db, 'superAdmins', userId);
    const snapshot = await getDoc(superAdminRef);
    return snapshot.exists();
  } catch (error) {
    console.error('Error checking super admin status:', error);
    return false;
  }
}

// ============== Organization Functions (Super Admin Only) ==============

export async function createOrganizationWithAdmin(
  orgName: string,
  contactEmail: string,
  createdBy: string
): Promise<{ organization: Organization; password: string }> {
  // Generate a random password for the admin
  const password = generatePassword();

  // Use secondary auth instance to create admin user without signing out super admin
  const { secondaryAuth } = await getSecondaryAuth();

  try {
    // Create Firebase Auth account for the admin using secondary auth
    const userCredential = await createUserWithEmailAndPassword(secondaryAuth, contactEmail, password);
    const adminUser = userCredential.user;

    // Create organization in Firestore
    const orgRef = doc(collection(db, ORGANIZATIONS));
    const orgData: WithServerTimestamp<Omit<Organization, 'id'>, 'createdAt'> = {
      name: orgName,
      contactEmail,
      adminId: adminUser.uid,
      createdBy,
      createdAt: serverTimestamp(),
    };

    await setDoc(orgRef, orgData);

    // Create admin user profile in Firestore
    await setDoc(doc(db, USERS, adminUser.uid), {
      id: adminUser.uid,
      email: contactEmail,
      role: 'admin',
      displayName: orgName + ' Admin',
      organizationId: orgRef.id,
      organizationName: orgName,
      createdAt: serverTimestamp(),
    });

    return {
      organization: {
        id: orgRef.id,
        name: orgName,
        contactEmail,
        adminId: adminUser.uid,
        createdBy,
        createdAt: new Date(),
      },
      password,
    };
  } finally {
    // Clean up secondary app
    await cleanupSecondaryApp();
  }
}

export async function getAllOrganizations(): Promise<Organization[]> {
  const snapshot = await getDocs(collection(db, ORGANIZATIONS));

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: (doc.data().createdAt as Timestamp)?.toDate() || new Date(),
  })) as Organization[];
}

// ============== Class Code Functions (Admin Only) ==============

export async function createClassCode(
  name: string,
  organizationId: string,
  createdBy: string
): Promise<ClassCode> {
  const code = generateCode(6);

  const codeRef = doc(collection(db, CLASS_CODES));
  const codeData: WithServerTimestamp<Omit<ClassCode, 'id'>, 'createdAt'> = {
    code,
    name,
    organizationId,
    createdBy,
    isActive: true,
    createdAt: serverTimestamp(),
  };

  await setDoc(codeRef, codeData);

  return {
    id: codeRef.id,
    code,
    name,
    organizationId,
    createdBy,
    isActive: true,
    createdAt: new Date(),
  };
}

export async function getClassCodesByOrganization(organizationId: string): Promise<ClassCode[]> {
  const q = query(
    collection(db, CLASS_CODES),
    where('organizationId', '==', organizationId),
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: (doc.data().createdAt as Timestamp)?.toDate() || new Date(),
  })) as ClassCode[];
}

export async function toggleClassCodeActive(codeId: string, isActive: boolean): Promise<void> {
  const codeRef = doc(db, CLASS_CODES, codeId);
  await updateDoc(codeRef, { isActive });
}

export async function validateClassCode(code: string): Promise<CodeValidation> {
  console.log('[validateClassCode] Validating code:', code.toUpperCase());

  // Query only by code to avoid needing a composite index
  const q = query(
    collection(db, CLASS_CODES),
    where('code', '==', code.toUpperCase())
  );

  const snapshot = await getDocs(q);
  console.log('[validateClassCode] Found documents:', snapshot.size);

  if (snapshot.empty) {
    console.log('[validateClassCode] No matching code found in database');
    return { valid: false };
  }

  const codeDoc = snapshot.docs[0];
  const data = codeDoc.data();
  console.log('[validateClassCode] Code data:', data);

  // Check if code is active
  if (!data.isActive) {
    console.log('[validateClassCode] Code exists but is not active');
    return { valid: false };
  }

  // Get organization name
  const orgDoc = await getDoc(doc(db, ORGANIZATIONS, data.organizationId));
  const orgData = orgDoc.data();
  console.log('[validateClassCode] Organization data:', orgData);

  return {
    valid: true,
    codeId: codeDoc.id,
    codeName: data.name,
    organizationId: data.organizationId,
    organizationName: orgData?.name || 'Unknown',
  };
}

// ============== Student Functions ==============

export async function getStudentsByClassCode(classCode: string): Promise<RegisteredStudent[]> {
  const q = query(
    collection(db, USERS),
    where('classCode', '==', classCode),
    where('role', '==', 'student'),
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      userId: doc.id,
      email: data.email,
      displayName: data.displayName || 'Unknown',
      classCode: data.classCode,
      organizationId: data.organizationId,
      registeredAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
    };
  }) as RegisteredStudent[];
}

export async function getStudentCountByCode(classCode: string): Promise<number> {
  const q = query(
    collection(db, USERS),
    where('classCode', '==', classCode),
    where('role', '==', 'student')
  );

  const snapshot = await getDocs(q);
  return snapshot.size;
}

// ============== User Functions ==============

export async function createUserProfile(user: Omit<User, 'createdAt'>): Promise<void> {
  const userRef = doc(db, USERS, user.id);
  await setDoc(userRef, {
    ...user,
    createdAt: serverTimestamp(),
  });
}

export async function getUserProfile(userId: string): Promise<User | null> {
  const userRef = doc(db, USERS, userId);
  const snapshot = await getDoc(userRef);

  if (!snapshot.exists()) {
    return null;
  }

  const data = snapshot.data();
  return {
    id: snapshot.id,
    ...data,
    createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
  } as User;
}

// ============== Student Progress Functions ==============

export async function initializeStudentProgress(
  userId: string,
  classCode: string,
  organizationId: string
): Promise<void> {
  const progressRef = doc(db, STUDENT_PROGRESS, userId);

  const progress: WithServerTimestamp<Omit<StudentProgress, 'id'>, 'lastActivityAt'> = {
    userId,
    classCode,
    organizationId,
    xpLevel: 1,
    streak: 0,
    totalXP: 0,
    moduleScores: [],
    achievements: [],
    lastActivityAt: serverTimestamp(),
  };

  await setDoc(progressRef, progress);
}

export async function getStudentProgress(userId: string): Promise<StudentProgress | null> {
  const progressRef = doc(db, STUDENT_PROGRESS, userId);
  const snapshot = await getDoc(progressRef);

  if (!snapshot.exists()) {
    return null;
  }

  const data = snapshot.data();
  return {
    id: snapshot.id,
    ...data,
    lastActivityAt: (data.lastActivityAt as Timestamp)?.toDate() || new Date(),
    lastStreakDate: data.lastStreakDate || undefined,
    lastDailyChallengeDate: data.lastDailyChallengeDate || undefined,
    moduleScores: data.moduleScores?.map((score: ModuleScore & { attemptHistory?: ModuleAttempt[] }) => ({
      ...score,
      completedAt: (score.completedAt as unknown as Timestamp)?.toDate() || new Date(),
      passed: score.passed ?? false,
      attemptHistory: (score.attemptHistory || []).map((attempt: ModuleAttempt) => ({
        ...attempt,
        completedAt: (attempt.completedAt as unknown as Timestamp)?.toDate() || new Date(),
      })),
    })) || [],
  } as StudentProgress;
}

export async function updateModuleScore(
  userId: string,
  moduleScore: Omit<ModuleScore, 'attemptHistory' | 'passed' | 'attempts'>
): Promise<{ passed: boolean; attemptNumber: number }> {
  const progressRef = doc(db, STUDENT_PROGRESS, userId);
  const snapshot = await getDoc(progressRef);

  if (!snapshot.exists()) {
    throw new Error('Student progress not found');
  }

  const data = snapshot.data();
  const existingScores: ModuleScore[] = data.moduleScores || [];

  const existingIndex = existingScores.findIndex(
    s => s.moduleId === moduleScore.moduleId
  );

  const isPassed = moduleScore.score === moduleScore.maxScore; // 100% to pass
  const now = new Date();

  // Create the new attempt record
  const newAttempt: ModuleAttempt = {
    attemptNumber: existingIndex >= 0 ? existingScores[existingIndex].attempts + 1 : 1,
    score: moduleScore.score,
    maxScore: moduleScore.maxScore,
    passed: isPassed,
    completedAt: now,
  };

  let updatedScores: ModuleScore[];
  let xpToAward = 0;
  
  if (existingIndex >= 0) {
    const existingScore = existingScores[existingIndex];
    const newAttemptHistory = [...(existingScore.attemptHistory || []), newAttempt];
    const wasAlreadyPassed = existingScore.passed;
    const isNowPassed = existingScore.passed || isPassed;

    updatedScores = [...existingScores];
    updatedScores[existingIndex] = {
      ...existingScore,
      // Update best score if new score is higher
      score: Math.max(moduleScore.score, existingScore.score),
      completedAt: now,
      attempts: existingScore.attempts + 1,
      // Once passed, always passed
      passed: isNowPassed,
      attemptHistory: newAttemptHistory,
    };
    
    // Only award XP if this is the first time passing (was not passed before)
    if (!wasAlreadyPassed && isNowPassed) {
      xpToAward = moduleScore.score;
    }
  } else {
    // First attempt for this module
    updatedScores = [...existingScores, {
      ...moduleScore,
      completedAt: now,
      attempts: 1,
      passed: isPassed,
      attemptHistory: [newAttempt],
    }];
    
    // Award XP if this first attempt passes
    if (isPassed) {
      xpToAward = moduleScore.score;
    }
  }

  // Calculate totalXP: sum of scores only for passed modules (no cap)
  const currentTotalXP = data.totalXP || 0;
  const newTotalXP = currentTotalXP + xpToAward;
  const xpLevel = Math.floor(newTotalXP / 100) + 1;

  await updateDoc(progressRef, {
    moduleScores: updatedScores,
    totalXP: newTotalXP,
    xpLevel,
    lastActivityAt: serverTimestamp(),
  });

  return { passed: isPassed, attemptNumber: newAttempt.attemptNumber };
}

export async function updateStreak(userId: string, streak: number, lastStreakDate?: string): Promise<void> {
  const progressRef = doc(db, STUDENT_PROGRESS, userId);
  const updateData: Record<string, unknown> = {
    streak,
    lastActivityAt: serverTimestamp(),
  };
  if (lastStreakDate) {
    updateData.lastStreakDate = lastStreakDate;
  }
  await updateDoc(progressRef, updateData);
}

/**
 * Calculate and update streak based on daily activity
 * Returns the new streak value and whether it was incremented today
 */
export async function calculateDailyStreak(userId: string): Promise<{ streak: number; incrementedToday: boolean }> {
  const progressRef = doc(db, STUDENT_PROGRESS, userId);
  const snapshot = await getDoc(progressRef);

  if (!snapshot.exists()) {
    return { streak: 0, incrementedToday: false };
  }

  const data = snapshot.data();
  const currentStreak = data.streak || 0;
  const lastStreakDate = data.lastStreakDate;

  // Get today's date in YYYY-MM-DD format (local time)
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  // Get yesterday's date
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  // If already incremented today, return current streak
  if (lastStreakDate === todayStr) {
    return { streak: currentStreak, incrementedToday: false };
  }

  // Calculate new streak
  let newStreak: number;
  if (lastStreakDate === yesterdayStr) {
    // Consecutive day - increment streak
    newStreak = currentStreak + 1;
  } else if (!lastStreakDate) {
    // First time - start streak at 1
    newStreak = 1;
  } else {
    // Streak broken - reset to 1
    newStreak = 1;
  }

  // Update streak in database
  await updateDoc(progressRef, {
    streak: newStreak,
    lastStreakDate: todayStr,
    lastActivityAt: serverTimestamp(),
  });

  return { streak: newStreak, incrementedToday: true };
}

export async function addAchievement(userId: string, achievement: string): Promise<void> {
  const progressRef = doc(db, STUDENT_PROGRESS, userId);
  const snapshot = await getDoc(progressRef);

  if (!snapshot.exists()) {
    throw new Error('Student progress not found');
  }

  const data = snapshot.data();
  const achievements: string[] = data.achievements || [];

  if (!achievements.includes(achievement)) {
    await updateDoc(progressRef, {
      achievements: [...achievements, achievement],
      lastActivityAt: serverTimestamp(),
    });
  }
}

/**
 * Complete daily challenge and award XP
 * Only awards XP once per day
 */
export async function completeDailyChallenge(userId: string, xpReward: number = 5): Promise<{ awarded: boolean; alreadyCompleted: boolean }> {
  const progressRef = doc(db, STUDENT_PROGRESS, userId);
  const snapshot = await getDoc(progressRef);

  if (!snapshot.exists()) {
    return { awarded: false, alreadyCompleted: false };
  }

  const data = snapshot.data();
  const lastDailyChallengeDate = data.lastDailyChallengeDate;

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  // Check if already completed today
  if (lastDailyChallengeDate === today) {
    return { awarded: false, alreadyCompleted: true };
  }

  // Award XP and mark as completed
  const currentXP = data.totalXP || 0;
  const newTotalXP = currentXP + xpReward;
  const xpLevel = Math.floor(newTotalXP / 100) + 1;

  await updateDoc(progressRef, {
    totalXP: newTotalXP,
    xpLevel,
    lastDailyChallengeDate: today,
    lastActivityAt: serverTimestamp(),
  });

  return { awarded: true, alreadyCompleted: false };
}

// ============== Optimized Data Fetching ==============

/**
 * Fetch user profile and progress in a single optimized call
 * Use this on login to minimize read operations
 */
export async function getUserDashboardData(userId: string): Promise<UserDashboardData | null> {
  // Fetch both user and progress in parallel
  const [userProfile, progress] = await Promise.all([
    getUserProfile(userId),
    getStudentProgress(userId),
  ]);

  if (!userProfile) {
    return null;
  }

  return {
    user: userProfile,
    progress,
  };
}

/**
 * Get all students for a class code with their full progress data
 * For instructor/admin dashboard view
 */
export async function getStudentsWithProgress(classCode: string): Promise<StudentWithProgress[]> {
  // First, get all students for this class code
  const students = await getStudentsByClassCode(classCode);

  if (students.length === 0) {
    return [];
  }

  // Fetch all progress records in parallel
  const progressPromises = students.map(student =>
    getStudentProgress(student.userId)
  );

  const progressResults = await Promise.all(progressPromises);

  // Combine students with their progress
  return students.map((student, index) => ({
    ...student,
    progress: progressResults[index],
  }));
}

/**
 * Get all students across all class codes for an organization with their progress
 * For comprehensive admin view
 */
export async function getAllStudentsWithProgressByOrganization(
  organizationId: string
): Promise<{ classCode: ClassCode; students: StudentWithProgress[] }[]> {
  // Get all class codes for this organization
  const classCodes = await getClassCodesByOrganization(organizationId);

  if (classCodes.length === 0) {
    return [];
  }

  // Fetch students with progress for each class code in parallel
  const results = await Promise.all(
    classCodes.map(async (code) => ({
      classCode: code,
      students: await getStudentsWithProgress(code.code),
    }))
  );

  return results;
}

/**
 * Reset a specific module's progress for a student (allows retaking)
 * Note: This keeps the attempt history but resets the passed status
 */
export async function resetModuleProgress(
  userId: string,
  moduleId: string
): Promise<void> {
  const progressRef = doc(db, STUDENT_PROGRESS, userId);
  const snapshot = await getDoc(progressRef);

  if (!snapshot.exists()) {
    throw new Error('Student progress not found');
  }

  const data = snapshot.data();
  const existingScores: ModuleScore[] = data.moduleScores || [];

  const existingIndex = existingScores.findIndex(
    s => s.moduleId === moduleId
  );

  if (existingIndex < 0) {
    return; // Module not found, nothing to reset
  }

  // Keep the module but mark as not passed (history is preserved)
  const updatedScores = [...existingScores];
  updatedScores[existingIndex] = {
    ...updatedScores[existingIndex],
    passed: false,
    // Keep score as 0 for display but preserve history
    score: 0,
  };

  // Recalculate total XP - only count XP for passed modules (no cap)
  const totalXP = updatedScores.reduce((sum, s) => sum + (s.passed ? s.score : 0), 0);
  const xpLevel = Math.floor(totalXP / 100) + 1;

  await updateDoc(progressRef, {
    moduleScores: updatedScores,
    totalXP,
    xpLevel,
    lastActivityAt: serverTimestamp(),
  });
}

// ============== Crossword Functions ==============

/**
 * Get current week ID in format "YYYY-WW"
 * Crossword refreshes every 2 weeks
 */
export function getCurrentCrosswordWeekId(): string {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const days = Math.floor((now.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
  const weekNumber = Math.floor(days / 14); // 2-week periods
  return `${now.getFullYear()}-${weekNumber.toString().padStart(2, '0')}`;
}

/**
 * Save crossword progress and award XP for newly correct words
 * Returns the number of XP awarded (2 per new correct word)
 */
export async function saveCrosswordProgress(
  userId: string,
  answers: { [key: string]: string },
  newlyCorrectWords: string[],
  allCorrectWords: string[]
): Promise<{ xpAwarded: number; totalCorrectWords: number }> {
  const progressRef = doc(db, STUDENT_PROGRESS, userId);
  const snapshot = await getDoc(progressRef);

  if (!snapshot.exists()) {
    return { xpAwarded: 0, totalCorrectWords: 0 };
  }

  const data = snapshot.data();
  const currentWeekId = getCurrentCrosswordWeekId();

  // Calculate XP to award (2 XP per newly correct word)
  const xpToAward = newlyCorrectWords.length * 2;

  const currentXP = data.totalXP || 0;
  const newTotalXP = currentXP + xpToAward;
  const xpLevel = Math.floor(newTotalXP / 100) + 1;

  const crosswordProgress: CrosswordProgress = {
    answers,
    correctWords: allCorrectWords,
    lastUpdated: new Date(),
    weekId: currentWeekId,
  };

  await updateDoc(progressRef, {
    crosswordProgress,
    totalXP: newTotalXP,
    xpLevel,
    lastActivityAt: serverTimestamp(),
  });

  return { xpAwarded: xpToAward, totalCorrectWords: allCorrectWords.length };
}

/**
 * Get crossword progress for current week
 * Returns null if no progress or if it's from a different week (needs refresh)
 */
export async function getCrosswordProgress(
  userId: string
): Promise<CrosswordProgress | null> {
  const progressRef = doc(db, STUDENT_PROGRESS, userId);
  const snapshot = await getDoc(progressRef);

  if (!snapshot.exists()) {
    return null;
  }

  const data = snapshot.data();
  const crosswordProgress = data.crosswordProgress as CrosswordProgress | undefined;

  if (!crosswordProgress) {
    return null;
  }

  // Check if it's current week
  const currentWeekId = getCurrentCrosswordWeekId();
  if (crosswordProgress.weekId !== currentWeekId) {
    return null; // Needs refresh for new week
  }

  return {
    ...crosswordProgress,
    lastUpdated: (crosswordProgress.lastUpdated as unknown as Timestamp)?.toDate() || new Date(),
  };
}

// ============== Quick Quiz Functions ==============

const QUIZ_QUESTIONS = 'quizQuestions';

/**
 * Generate a version hash from quiz questions to detect changes
 */
function generateQuizVersion(questions: QuizQuestion[]): string {
  const ids = questions.map(q => q.id).sort().join(',');
  // Simple hash based on question IDs and count
  return `v${questions.length}-${ids.slice(0, 20)}`;
}

/**
 * Get all quiz questions from Firestore
 */
export async function getQuizQuestions(): Promise<QuizQuestion[]> {
  const q = query(
    collection(db, QUIZ_QUESTIONS),
    orderBy('createdAt', 'asc')
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: (doc.data().createdAt as Timestamp)?.toDate() || new Date(),
  })) as QuizQuestion[];
}

/**
 * Add a new quiz question (super admin only)
 */
export async function addQuizQuestion(
  question: Omit<QuizQuestion, 'id' | 'createdAt'>,
  createdBy: string
): Promise<QuizQuestion> {
  const questionRef = doc(collection(db, QUIZ_QUESTIONS));

  const questionData = {
    ...question,
    createdBy,
    createdAt: serverTimestamp(),
  };

  await setDoc(questionRef, questionData);

  return {
    id: questionRef.id,
    ...question,
    createdBy,
    createdAt: new Date(),
  };
}

/**
 * Delete a quiz question (super admin only)
 */
export async function deleteQuizQuestion(questionId: string): Promise<void> {
  const { deleteDoc } = await import('firebase/firestore');
  await deleteDoc(doc(db, QUIZ_QUESTIONS, questionId));
}

/**
 * Update a quiz question (super admin only)
 */
export async function updateQuizQuestion(
  questionId: string,
  updates: Partial<Omit<QuizQuestion, 'id' | 'createdAt' | 'createdBy'>>
): Promise<void> {
  const questionRef = doc(db, QUIZ_QUESTIONS, questionId);
  await updateDoc(questionRef, updates);
}

/**
 * Save quick quiz progress and award XP for newly correct answers
 * Returns XP awarded (3 per new correct answer)
 */
export async function saveQuickQuizProgress(
  userId: string,
  questionId: string,
  selectedAnswer: number,
  isCorrect: boolean,
  currentQuizVersion: string
): Promise<{ xpAwarded: number; alreadyAnswered: boolean }> {
  const progressRef = doc(db, STUDENT_PROGRESS, userId);
  const snapshot = await getDoc(progressRef);

  if (!snapshot.exists()) {
    return { xpAwarded: 0, alreadyAnswered: false };
  }

  const data = snapshot.data();
  const existingProgress: QuickQuizProgress | undefined = data.quickQuizProgress;

  // Check if quiz version changed (questions were updated)
  const versionChanged = existingProgress && existingProgress.quizVersion !== currentQuizVersion;

  // Reset progress if version changed
  const baseProgress: QuickQuizProgress = versionChanged || !existingProgress
    ? {
        answeredQuestions: {},
        correctAnswers: [],
        quizVersion: currentQuizVersion,
        lastUpdated: new Date(),
      }
    : existingProgress;

  // Check if already answered this question
  if (baseProgress.answeredQuestions[questionId] !== undefined) {
    return { xpAwarded: 0, alreadyAnswered: true };
  }

  // Update progress
  const newAnsweredQuestions = {
    ...baseProgress.answeredQuestions,
    [questionId]: selectedAnswer,
  };

  const newCorrectAnswers = isCorrect
    ? [...baseProgress.correctAnswers, questionId]
    : baseProgress.correctAnswers;

  // Award XP only for correct answers (3 XP per correct)
  const xpToAward = isCorrect ? 3 : 0;
  const currentXP = data.totalXP || 0;
  const newTotalXP = currentXP + xpToAward;
  const xpLevel = Math.floor(newTotalXP / 100) + 1;

  const quickQuizProgress: QuickQuizProgress = {
    answeredQuestions: newAnsweredQuestions,
    correctAnswers: newCorrectAnswers,
    quizVersion: currentQuizVersion,
    lastUpdated: new Date(),
  };

  await updateDoc(progressRef, {
    quickQuizProgress,
    totalXP: newTotalXP,
    xpLevel,
    lastActivityAt: serverTimestamp(),
  });

  return { xpAwarded: xpToAward, alreadyAnswered: false };
}

/**
 * Get quick quiz progress for a user
 * Returns null if no progress or if quiz version changed
 */
export async function getQuickQuizProgress(
  userId: string,
  currentQuizVersion: string
): Promise<QuickQuizProgress | null> {
  const progressRef = doc(db, STUDENT_PROGRESS, userId);
  const snapshot = await getDoc(progressRef);

  if (!snapshot.exists()) {
    return null;
  }

  const data = snapshot.data();
  const quickQuizProgress = data.quickQuizProgress as QuickQuizProgress | undefined;

  if (!quickQuizProgress) {
    return null;
  }

  // Check if quiz version matches (questions haven't changed)
  if (quickQuizProgress.quizVersion !== currentQuizVersion) {
    return null; // Progress reset needed due to question changes
  }

  return {
    ...quickQuizProgress,
    lastUpdated: (quickQuizProgress.lastUpdated as unknown as Timestamp)?.toDate() || new Date(),
  };
}

/**
 * Get current quiz version based on questions
 */
export async function getCurrentQuizVersion(): Promise<string> {
  const questions = await getQuizQuestions();
  return generateQuizVersion(questions);
}
