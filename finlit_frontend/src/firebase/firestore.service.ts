import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
  Timestamp,
  FieldValue,
  orderBy,
} from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { getSecondaryAuth, cleanupSecondaryApp, auth } from './config';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import { db, storage } from './config';
import type {
  Organization,
  OrganizationAdmin,
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
  DailyChallengeQuestion,
  CaseStudy,
  CaseStudyContent,
  CaseStudyProgress,
  CaseStudyAttempt,
  MoneyPersonalityResult,
  SavedCalculation,
  ContentLock,
  WeekLock,
  CertificateData,
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

    // Create the first admin (super admin) entry
    const firstAdmin: OrganizationAdmin = {
      userId: adminUser.uid,
      email: contactEmail,
      displayName: orgName + ' Admin',
      isSuperAdmin: true, // First admin is always super admin
      addedBy: createdBy, // Added by website super admin
      addedAt: new Date(),
    };

    const orgData: WithServerTimestamp<Omit<Organization, 'id'>, 'createdAt'> = {
      name: orgName,
      contactEmail,
      adminId: adminUser.uid, // Keep for backwards compatibility
      admins: [firstAdmin], // Initialize with first admin
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
        admins: [firstAdmin],
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

  return snapshot.docs.map(doc => {
    const data = doc.data();

    // Backwards compatibility: if admins array doesn't exist, create it from adminId
    let admins = data.admins || [];
    if (admins.length === 0 && data.adminId) {
      // Create first admin from legacy adminId
      admins = [{
        userId: data.adminId,
        email: data.contactEmail,
        displayName: data.name + ' Admin',
        isSuperAdmin: true,
        addedBy: data.createdBy,
        addedAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
      }];
    }

    return {
      id: doc.id,
      ...data,
      admins,
      createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
    };
  }) as Organization[];
}

// ============== Organization Admin Management Functions ==============

/**
 * Add a new admin to an organization
 * @param organizationId - The organization ID
 * @param adminEmail - Email of the new admin
 * @param addedByUserId - User ID of the admin adding this person
 * @returns The newly created admin user and password
 */
export async function addOrganizationAdmin(
  organizationId: string,
  adminEmail: string,
  addedByUserId: string
): Promise<{ admin: OrganizationAdmin; password: string }> {
  // Check if user adding is an admin of this organization
  const org = await getOrganization(organizationId);
  if (!org) {
    throw new Error('Organization not found');
  }

  const isAdmin = org.admins.some(admin => admin.userId === addedByUserId);
  if (!isAdmin) {
    throw new Error('Only organization admins can add new admins');
  }

  // Check if email is already an admin
  const existingAdmin = org.admins.find(admin => admin.email === adminEmail);
  if (existingAdmin) {
    throw new Error('This email is already an admin of this organization');
  }

  // Generate a random password for the new admin
  const password = generatePassword();

  // Use secondary auth instance to create admin user
  const { secondaryAuth } = await getSecondaryAuth();

  try {
    // Create Firebase Auth account for the new admin
    const userCredential = await createUserWithEmailAndPassword(secondaryAuth, adminEmail, password);
    const newAdminUser = userCredential.user;

    // Create the new admin entry
    const newAdmin: OrganizationAdmin = {
      userId: newAdminUser.uid,
      email: adminEmail,
      displayName: org.name + ' Admin',
      isSuperAdmin: false, // Only first admin is super admin
      addedBy: addedByUserId,
      addedAt: new Date(),
    };

    // Update organization with new admin
    const orgRef = doc(db, ORGANIZATIONS, organizationId);
    const updatedAdmins = [...org.admins, newAdmin];
    await updateDoc(orgRef, { admins: updatedAdmins });

    // Create admin user profile in Firestore
    await setDoc(doc(db, USERS, newAdminUser.uid), {
      id: newAdminUser.uid,
      email: adminEmail,
      role: 'admin',
      displayName: org.name + ' Admin',
      organizationId: organizationId,
      organizationName: org.name,
      createdAt: serverTimestamp(),
    });

    return {
      admin: newAdmin,
      password,
    };
  } finally {
    await cleanupSecondaryApp();
  }
}

/**
 * Remove an admin from an organization
 * @param organizationId - The organization ID
 * @param adminUserId - User ID of the admin to remove
 * @param removedByUserId - User ID of the admin performing the removal
 */
export async function removeOrganizationAdmin(
  organizationId: string,
  adminUserId: string,
  removedByUserId: string
): Promise<void> {
  const org = await getOrganization(organizationId);
  if (!org) {
    throw new Error('Organization not found');
  }

  // Check if user removing is the super admin of this organization
  const removingUser = org.admins.find(admin => admin.userId === removedByUserId);
  if (!removingUser) {
    throw new Error('You are not an admin of this organization');
  }

  // Only organization super admin can remove other admins
  if (!removingUser.isSuperAdmin) {
    throw new Error('Only the organization super admin can remove other admins');
  }

  // Find the admin to remove
  const adminToRemove = org.admins.find(admin => admin.userId === adminUserId);
  if (!adminToRemove) {
    throw new Error('Admin not found in this organization');
  }

  // Prevent removing super admin
  if (adminToRemove.isSuperAdmin) {
    throw new Error('Cannot remove the organization super admin (first admin created)');
  }

  // Remove admin from organization
  const orgRef = doc(db, ORGANIZATIONS, organizationId);
  const updatedAdmins = org.admins.filter(admin => admin.userId !== adminUserId);
  await updateDoc(orgRef, { admins: updatedAdmins });

  // Delete user from Firestore
  const userRef = doc(db, USERS, adminUserId);
  await deleteDoc(userRef);

  // Note: Firebase Auth account will remain active but user has no Firestore profile
  // They won't be able to access the app since getUserProfile will return null
  // To fully delete from Firebase Auth, you would need:
  // 1. Firebase Admin SDK (backend/cloud function)
  // 2. Or have the user delete their own account
  // For security, the app will deny access to users without a Firestore profile
}

/**
 * Get organization by ID
 */
export async function getOrganization(organizationId: string): Promise<Organization | null> {
  const orgDoc = await getDoc(doc(db, ORGANIZATIONS, organizationId));
  if (!orgDoc.exists()) {
    return null;
  }

  const data = orgDoc.data();

  // Backwards compatibility: if admins array doesn't exist, create it from adminId
  let admins = data.admins || [];

  // Convert Firestore Timestamps to Date objects in admins array
  if (admins.length > 0) {
    admins = admins.map((admin: any) => ({
      ...admin,
      addedAt: admin.addedAt?.toDate ? admin.addedAt.toDate() : admin.addedAt,
    }));
  } else if (data.adminId) {
    // Create first admin from legacy adminId
    admins = [{
      userId: data.adminId,
      email: data.contactEmail,
      displayName: data.name + ' Admin',
      isSuperAdmin: true,
      addedBy: data.createdBy,
      addedAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
    }];
  }

  return {
    id: orgDoc.id,
    ...data,
    admins,
    createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
  } as Organization;
}

/**
 * Get all admins for an organization
 */
export async function getOrganizationAdmins(organizationId: string): Promise<OrganizationAdmin[]> {
  const org = await getOrganization(organizationId);
  if (!org) {
    return [];
  }
  return org.admins;
}

/**
 * Check if a user is an admin of an organization
 */
export async function isOrganizationAdmin(userId: string, organizationId: string): Promise<boolean> {
  const org = await getOrganization(organizationId);
  if (!org) {
    return false;
  }
  return org.admins.some(admin => admin.userId === userId);
}

/**
 * Check if a user is the super admin (first admin) of an organization
 */
export async function isOrganizationSuperAdmin(userId: string, organizationId: string): Promise<boolean> {
  const org = await getOrganization(organizationId);
  if (!org) {
    return false;
  }
  const admin = org.admins.find(admin => admin.userId === userId);
  return admin?.isSuperAdmin || false;
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

  // Fetch saved calculations from subcollection
  const savedCalculationsRef = collection(db, USERS, userId, 'savedCalculations');
  const calcSnapshot = await getDocs(savedCalculationsRef);
  const savedCalculations = calcSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    savedAt: (doc.data().savedAt as Timestamp)?.toDate() || new Date(),
  }));

  // Parse crosswordProgress if it exists
  const crosswordProgress = data.crosswordProgress ? {
    ...data.crosswordProgress,
    lastUpdated: (data.crosswordProgress.lastUpdated as Timestamp)?.toDate() || new Date(),
  } : undefined;

  // Parse quickQuizProgress if it exists
  const quickQuizProgress = data.quickQuizProgress ? {
    ...data.quickQuizProgress,
    lastUpdated: (data.quickQuizProgress.lastUpdated as Timestamp)?.toDate() || new Date(),
  } : undefined;

  // Parse moneyPersonality if it exists
  const moneyPersonality = data.moneyPersonality ? {
    ...data.moneyPersonality,
    completedAt: (data.moneyPersonality.completedAt as Timestamp)?.toDate() || new Date(),
  } : undefined;

  // Parse caseStudyProgress if it exists
  const caseStudyProgress = data.caseStudyProgress?.map((cs: any) => ({
    ...cs,
    completedAt: cs.completedAt ? (cs.completedAt as Timestamp)?.toDate() : undefined,
    attemptHistory: (cs.attemptHistory || []).map((attempt: any) => ({
      ...attempt,
      completedAt: (attempt.completedAt as Timestamp)?.toDate() || new Date(),
    })),
  })) || undefined;

  return {
    id: snapshot.id,
    ...data,
    lastActivityAt: (data.lastActivityAt as Timestamp)?.toDate() || new Date(),
    lastStreakDate: data.lastStreakDate || undefined,
    lastDailyChallengeDate: data.lastDailyChallengeDate || undefined,
    crosswordProgress,
    quickQuizProgress,
    moneyPersonality,
    caseStudyProgress,
    savedCalculations,
    dailyChallengesCompleted: data.dailyChallengesCompleted || 0,
    quickQuizzesCompleted: data.quickQuizzesCompleted || 0,
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

  const isPassed = (moduleScore.score / moduleScore.maxScore) * 100 >= 80; // 80% to pass
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
  const currentChallengesCompleted = data.dailyChallengesCompleted || 0;

  await updateDoc(progressRef, {
    totalXP: newTotalXP,
    xpLevel,
    lastDailyChallengeDate: today,
    dailyChallengesCompleted: currentChallengesCompleted + 1,
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

/**
 * Increment the quickQuizzesCompleted counter
 * Called when a user finishes answering all questions in a quick quiz
 * Only increments if this quiz version hasn't been completed before
 */
export async function incrementQuickQuizCompleted(userId: string, quizVersion: string): Promise<{ incremented: boolean }> {
  const progressRef = doc(db, STUDENT_PROGRESS, userId);
  const snapshot = await getDoc(progressRef);

  if (!snapshot.exists()) return { incremented: false };

  const data = snapshot.data();
  const currentCount = data.quickQuizzesCompleted || 0;
  const completedQuizVersions: string[] = data.completedQuizVersions || [];

  // Check if this version was already completed
  if (completedQuizVersions.includes(quizVersion)) {
    return { incremented: false };
  }

  // Mark this version as completed and increment counter
  await updateDoc(progressRef, {
    quickQuizzesCompleted: currentCount + 1,
    completedQuizVersions: [...completedQuizVersions, quizVersion],
    lastActivityAt: serverTimestamp(),
  });

  return { incremented: true };
}

// ============== Daily Challenge Functions ==============

const DAILY_CHALLENGES = 'dailyChallenges';
const DAILY_CHALLENGE_CONFIG = 'dailyChallengeConfig';

/**
 * Get all daily challenge questions
 */
export async function getDailyChallengeQuestions(): Promise<DailyChallengeQuestion[]> {
  const q = query(
    collection(db, DAILY_CHALLENGES),
    orderBy('createdAt', 'asc')
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: (doc.data().createdAt as Timestamp)?.toDate() || new Date(),
  })) as DailyChallengeQuestion[];
}

/**
 * Add a new daily challenge question
 */
export async function addDailyChallengeQuestion(
  question: string,
  options: string[],
  correct: number,
  createdBy: string,
  explanation?: string
): Promise<DailyChallengeQuestion> {
  const challengeRef = doc(collection(db, DAILY_CHALLENGES));

  const challengeData = {
    question,
    options,
    correct,
    explanation: explanation || '',
    createdAt: serverTimestamp(),
    createdBy,
  };

  await setDoc(challengeRef, challengeData);

  return {
    id: challengeRef.id,
    question,
    options,
    correct,
    explanation: explanation || '',
    createdAt: new Date(),
    createdBy,
  };
}

/**
 * Delete a daily challenge question
 */
export async function deleteDailyChallengeQuestion(challengeId: string): Promise<void> {
  const { deleteDoc } = await import('firebase/firestore');
  await deleteDoc(doc(db, DAILY_CHALLENGES, challengeId));
}

/**
 * Update a daily challenge question
 */
export async function updateDailyChallengeQuestion(
  challengeId: string,
  updates: Partial<Omit<DailyChallengeQuestion, 'id' | 'createdAt' | 'createdBy'>>
): Promise<void> {
  const challengeRef = doc(db, DAILY_CHALLENGES, challengeId);
  await updateDoc(challengeRef, updates);
}

/**
 * Set the active daily challenge
 * This will reset progress for all users on the next day
 */
export async function setActiveDailyChallenge(challengeId: string): Promise<void> {
  const configRef = doc(db, DAILY_CHALLENGE_CONFIG, 'active');
  
  // Update the active challenge ID and reset date
  await setDoc(configRef, {
    activeChallengeId: challengeId,
    lastChanged: serverTimestamp(),
    changedDate: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
  }, { merge: true });
}

/**
 * Get the currently active daily challenge ID
 */
export async function getActiveDailyChallenge(): Promise<string | null> {
  const configRef = doc(db, DAILY_CHALLENGE_CONFIG, 'active');
  const snapshot = await getDoc(configRef);

  if (!snapshot.exists()) {
    return null;
  }

  const data = snapshot.data();
  return data.activeChallengeId || null;
}

/**
 * Get the active daily challenge question
 */
export async function getActiveDailyChallengeQuestion(): Promise<DailyChallengeQuestion | null> {
  const activeChallengeId = await getActiveDailyChallenge();
  
  if (!activeChallengeId) {
    return null;
  }

  const challengeRef = doc(db, DAILY_CHALLENGES, activeChallengeId);
  const snapshot = await getDoc(challengeRef);

  if (!snapshot.exists()) {
    return null;
  }

  return {
    id: snapshot.id,
    ...snapshot.data(),
    createdAt: (snapshot.data().createdAt as Timestamp)?.toDate() || new Date(),
  } as DailyChallengeQuestion;
}

// ============== Case Study Functions ==============

const CASE_STUDIES = 'caseStudies';

/**
 * Upload an image to Firebase Storage for case studies
 * Returns the download URL
 */
export async function uploadCaseStudyImage(
  file: File,
  caseStudyId: string,
  imageType: 'person' | 'company1' | 'company2',
  weekNumber?: number
): Promise<string> {
  const fileExtension = file.name.split('.').pop() || 'jpg';
  const weekPath = weekNumber ? `/week-${weekNumber}` : '';
  const fileName = `case-studies/${caseStudyId}${weekPath}/${imageType}.${fileExtension}`;
  const storageRef = ref(storage, fileName);

  await uploadBytes(storageRef, file);
  const downloadUrl = await getDownloadURL(storageRef);

  return downloadUrl;
}

/**
 * Delete a case study image from Firebase Storage
 */
export async function deleteCaseStudyImage(
  caseStudyId: string,
  imageType: 'person' | 'company1' | 'company2'
): Promise<void> {
  try {
    // Try common extensions
    const extensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    for (const ext of extensions) {
      try {
        const storageRef = ref(storage, `case-studies/${caseStudyId}/${imageType}.${ext}`);
        await deleteObject(storageRef);
        return;
      } catch {
        // Continue trying other extensions
      }
    }
  } catch (error) {
    console.error('Error deleting case study image:', error);
  }
}

/**
 * Create/Update the permanent case study (adds weeks to existing one)
 * There is only ONE case study that accumulates all weeks
 */
export async function createCaseStudy(
  weeksContent: { [weekNumber: number]: CaseStudyContent },
  weekImages: { [weekNumber: number]: { person: File | null; company1: File | null; company2: File | null } },
  createdBy: string
): Promise<CaseStudy> {
  const PERMANENT_CASE_STUDY_ID = 'permanent-case-study';
  const caseStudyRef = doc(db, CASE_STUDIES, PERMANENT_CASE_STUDY_ID);

  // Get existing case study to determine week offset
  const existingDoc = await getDoc(caseStudyRef);
  let weekOffset = 0;
  let existingWeeks: { [weekNumber: number]: CaseStudyContent } = {};
  let existingWeekImages: { [week: number]: { personImageUrl: string; companyImageUrl1: string; companyImageUrl2: string } } = {};
  let isFirstTime = false;

  if (existingDoc.exists()) {
    const data = existingDoc.data();
    existingWeeks = data.weeks || {};
    existingWeekImages = data.weekImages || {};

    // Find the maximum week number in existing data
    const existingWeekNumbers = Object.keys(existingWeeks).map(Number);
    if (existingWeekNumbers.length > 0) {
      weekOffset = Math.max(...existingWeekNumbers);
    }
  } else {
    isFirstTime = true;
  }

  // Renumber new weeks to append after existing ones
  // Normalize incoming weeks to be sequential starting from 1
  const renumberedWeeks: { [weekNumber: number]: CaseStudyContent } = {};
  const renumberedImageSlots: { [weekNumber: number]: typeof weekImages[number] } = {};

  // Sort incoming weeks to get sequential order
  const incomingWeeks = Object.keys(weeksContent).map(Number).sort((a, b) => a - b);

  incomingWeeks.forEach((originalWeek, index) => {
    // New week number = weekOffset + sequential index (starting from 1)
    const newWeekNumber = weekOffset + index + 1;
    const content = weeksContent[originalWeek];

    renumberedWeeks[newWeekNumber] = {
      ...content,
      week: newWeekNumber,
    };

    if (weekImages[originalWeek]) {
      renumberedImageSlots[newWeekNumber] = weekImages[originalWeek];
    }
  });

  // Upload all images for new weeks in parallel
  const uploadPromises: Promise<{ week: number; type: string; url: string }>[] = [];

  Object.entries(renumberedImageSlots).forEach(([weekStr, images]) => {
    const week = Number(weekStr);

    if (images?.person) {
      uploadPromises.push(
        uploadCaseStudyImage(images.person, PERMANENT_CASE_STUDY_ID, 'person', week)
          .then(url => ({ week, type: 'person', url }))
      );
    }
    if (images?.company1) {
      uploadPromises.push(
        uploadCaseStudyImage(images.company1, PERMANENT_CASE_STUDY_ID, 'company1', week)
          .then(url => ({ week, type: 'company1', url }))
      );
    }
    if (images?.company2) {
      uploadPromises.push(
        uploadCaseStudyImage(images.company2, PERMANENT_CASE_STUDY_ID, 'company2', week)
          .then(url => ({ week, type: 'company2', url }))
      );
    }
  });

  const uploadedImages = await Promise.all(uploadPromises);

  // Organize new images by week
  const newWeekImageUrls: { [week: number]: { personImageUrl: string; companyImageUrl1: string; companyImageUrl2: string } } = {};

  uploadedImages.forEach(({ week, type, url }) => {
    if (!newWeekImageUrls[week]) {
      newWeekImageUrls[week] = { personImageUrl: '', companyImageUrl1: '', companyImageUrl2: '' };
    }

    if (type === 'person') newWeekImageUrls[week].personImageUrl = url;
    else if (type === 'company1') newWeekImageUrls[week].companyImageUrl1 = url;
    else if (type === 'company2') newWeekImageUrls[week].companyImageUrl2 = url;
  });

  // Merge with existing weeks and images
  const mergedWeeks = { ...existingWeeks, ...renumberedWeeks };
  const mergedWeekImages = { ...existingWeekImages, ...newWeekImageUrls };

  // Auto-detect first available week
  const allWeekNumbers = Object.keys(mergedWeeks).map(Number).sort((a, b) => a - b);
  const firstWeek = allWeekNumbers.length > 0 ? allWeekNumbers[0] : 1;

  const caseStudyData = {
    weeks: mergedWeeks,
    weekImages: mergedWeekImages,
    isActive: isFirstTime ? false : existingDoc.data()?.isActive || false,
    activeWeek: isFirstTime ? firstWeek : existingDoc.data()?.activeWeek || firstWeek,
    createdAt: isFirstTime ? serverTimestamp() : existingDoc.data()?.createdAt,
    updatedAt: serverTimestamp(),
    createdBy: isFirstTime ? createdBy : existingDoc.data()?.createdBy,
  };

  await setDoc(caseStudyRef, caseStudyData, { merge: true });

  return {
    id: PERMANENT_CASE_STUDY_ID,
    weeks: mergedWeeks,
    weekImages: mergedWeekImages,
    isActive: caseStudyData.isActive as boolean,
    activeWeek: caseStudyData.activeWeek as number,
    createdAt: isFirstTime ? new Date() : (existingDoc.data()?.createdAt as Timestamp)?.toDate() || new Date(),
    createdBy: caseStudyData.createdBy as string,
  };
}

/**
 * Get all case studies (for admin)
 */
export async function getAllCaseStudies(): Promise<CaseStudy[]> {
  const q = query(
    collection(db, CASE_STUDIES),
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: (doc.data().createdAt as Timestamp)?.toDate() || new Date(),
    updatedAt: doc.data().updatedAt ? (doc.data().updatedAt as Timestamp)?.toDate() : undefined,
  })) as CaseStudy[];
}

/**
 * Get the currently active case study (for students)
 */
export async function getActiveCaseStudy(): Promise<CaseStudy | null> {
  // Always fetch the permanent case study (only one exists)
  const PERMANENT_CASE_STUDY_ID = 'permanent-case-study';
  const caseStudyRef = doc(db, CASE_STUDIES, PERMANENT_CASE_STUDY_ID);
  const snapshot = await getDoc(caseStudyRef);

  if (!snapshot.exists()) {
    return null;
  }

  const data = snapshot.data();

  // Only return if it's marked as active
  if (!data.isActive) {
    return null;
  }

  return {
    id: snapshot.id,
    ...data,
    createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
    updatedAt: data.updatedAt ? (data.updatedAt as Timestamp)?.toDate() : undefined,
  } as CaseStudy;
}

/**
 * Get a case study by ID
 */
export async function getCaseStudyById(caseStudyId: string): Promise<CaseStudy | null> {
  const caseStudyRef = doc(db, CASE_STUDIES, caseStudyId);
  const snapshot = await getDoc(caseStudyRef);

  if (!snapshot.exists()) {
    return null;
  }

  return {
    id: snapshot.id,
    ...snapshot.data(),
    createdAt: (snapshot.data().createdAt as Timestamp)?.toDate() || new Date(),
    updatedAt: snapshot.data().updatedAt ? (snapshot.data().updatedAt as Timestamp)?.toDate() : undefined,
  } as CaseStudy;
}

/**
 * Activate the permanent case study
 */
export async function setActiveCaseStudy(caseStudyId?: string): Promise<void> {
  const PERMANENT_CASE_STUDY_ID = 'permanent-case-study';
  const caseStudyRef = doc(db, CASE_STUDIES, PERMANENT_CASE_STUDY_ID);
  const caseStudyDoc = await getDoc(caseStudyRef);

  if (!caseStudyDoc.exists()) {
    throw new Error('Permanent case study does not exist. Please add weeks first.');
  }

  const data = caseStudyDoc.data();
  let firstWeek = 1;
  if (data.weeks) {
    const weekNumbers = Object.keys(data.weeks).map(Number).sort((a, b) => a - b);
    if (weekNumbers.length > 0) {
      firstWeek = weekNumbers[0];
    }
  }

  await updateDoc(caseStudyRef, {
    isActive: true,
    activeWeek: data.activeWeek || firstWeek,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Deactivate the permanent case study
 */
export async function deactivateCaseStudy(caseStudyId?: string): Promise<void> {
  const PERMANENT_CASE_STUDY_ID = 'permanent-case-study';
  await updateDoc(doc(db, CASE_STUDIES, PERMANENT_CASE_STUDY_ID), {
    isActive: false,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Set the active week for the permanent case study
 */
export async function setActiveWeek(caseStudyId: string, weekNumber: number): Promise<void> {
  const PERMANENT_CASE_STUDY_ID = 'permanent-case-study';
  await updateDoc(doc(db, CASE_STUDIES, PERMANENT_CASE_STUDY_ID), {
    activeWeek: weekNumber,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Migrate case study weeks: shift all week numbers by an offset
 * This updates both weeks content and weekImages keys
 */
export async function migrateCaseStudyWeeks(caseStudyId: string, offset: number): Promise<void> {
  const caseStudyRef = doc(db, CASE_STUDIES, caseStudyId);
  const caseStudyDoc = await getDoc(caseStudyRef);

  if (!caseStudyDoc.exists()) {
    throw new Error('Case study not found');
  }

  const data = caseStudyDoc.data();
  const oldWeeks = data.weeks || {};
  const oldWeekImages = data.weekImages || {};

  // Create new weeks object with shifted keys
  const newWeeks: Record<number, CaseStudyContent> = {};
  const newWeekImages: Record<number, { personImageUrl: string; companyImageUrl1: string; companyImageUrl2: string }> = {};

  // Shift week content
  for (const [weekKey, content] of Object.entries(oldWeeks)) {
    const oldWeekNum = Number(weekKey);
    const newWeekNum = oldWeekNum + offset;
    const weekContent = content as CaseStudyContent;
    newWeeks[newWeekNum] = {
      ...weekContent,
      week: newWeekNum, // Update the week number inside the content too
    };
  }

  // Shift week images
  for (const [weekKey, images] of Object.entries(oldWeekImages)) {
    const oldWeekNum = Number(weekKey);
    const newWeekNum = oldWeekNum + offset;
    newWeekImages[newWeekNum] = images as { personImageUrl: string; companyImageUrl1: string; companyImageUrl2: string };
  }

  // Update the document
  await updateDoc(caseStudyRef, {
    weeks: newWeeks,
    weekImages: newWeekImages,
    activeWeek: (data.activeWeek || 1) + offset,
    updatedAt: serverTimestamp(),
  });

  console.log(`Migrated case study ${caseStudyId}: shifted weeks by ${offset}`);
}

/**
 * Update a case study's content
 */
export async function updateCaseStudyContent(
  caseStudyId: string,
  caseStudyContent: CaseStudyContent
): Promise<void> {
  await updateDoc(doc(db, CASE_STUDIES, caseStudyId), {
    case_study: caseStudyContent,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Update a case study's image
 */
export async function updateCaseStudyImage(
  caseStudyId: string,
  imageType: 'person' | 'company1' | 'company2',
  newImage: File
): Promise<string> {
  // Delete old image
  await deleteCaseStudyImage(caseStudyId, imageType);

  // Upload new image
  const newUrl = await uploadCaseStudyImage(newImage, caseStudyId, imageType);

  // Update document with new URL
  const fieldName = imageType === 'person'
    ? 'personImageUrl'
    : imageType === 'company1'
      ? 'companyImageUrl1'
      : 'companyImageUrl2';

  await updateDoc(doc(db, CASE_STUDIES, caseStudyId), {
    [fieldName]: newUrl,
    updatedAt: serverTimestamp(),
  });

  return newUrl;
}

/**
 * Update a case study's week-specific image
 */
export async function updateCaseStudyWeekImage(
  caseStudyId: string,
  weekNumber: number,
  imageType: 'person' | 'company1' | 'company2',
  newImage: File
): Promise<string> {
  // Get the file extension
  const ext = newImage.name.split('.').pop()?.toLowerCase() || 'jpg';

  // Create storage path for week-specific image
  const storagePath = `case-studies/${caseStudyId}/week${weekNumber}/${imageType}.${ext}`;
  const storageRef = ref(storage, storagePath);

  // Upload the new image
  await uploadBytes(storageRef, newImage);
  const newUrl = await getDownloadURL(storageRef);

  // Get current weekImages data
  const caseStudyRef = doc(db, CASE_STUDIES, caseStudyId);
  const caseStudyDoc = await getDoc(caseStudyRef);

  if (!caseStudyDoc.exists()) {
    throw new Error('Case study not found');
  }

  const data = caseStudyDoc.data();
  const weekImages = data.weekImages || {};
  const currentWeekImages = weekImages[weekNumber] || {};

  // Update the specific image URL
  const fieldName = imageType === 'person'
    ? 'personImageUrl'
    : imageType === 'company1'
      ? 'companyImageUrl1'
      : 'companyImageUrl2';

  const updatedWeekImages = {
    ...weekImages,
    [weekNumber]: {
      ...currentWeekImages,
      [fieldName]: newUrl,
    },
  };

  // Update the document
  await updateDoc(caseStudyRef, {
    weekImages: updatedWeekImages,
    updatedAt: serverTimestamp(),
  });

  return newUrl;
}

/**
 * Delete a case study and all its images
 */
export async function deleteCaseStudy(caseStudyId: string): Promise<void> {
  const { deleteDoc: deleteDocument } = await import('firebase/firestore');

  // Delete images
  await Promise.all([
    deleteCaseStudyImage(caseStudyId, 'person'),
    deleteCaseStudyImage(caseStudyId, 'company1'),
    deleteCaseStudyImage(caseStudyId, 'company2'),
  ]);

  // Delete document
  await deleteDocument(doc(db, CASE_STUDIES, caseStudyId));
}

/**
 * Save case study progress for a student
 */
export async function saveCaseStudyProgress(
  userId: string,
  caseStudyId: string,
  week: number,
  questionIndex: number,
  selectedAnswer: string,
  isCorrect: boolean
): Promise<{ xpAwarded: number; alreadyAnswered: boolean }> {
  const progressRef = doc(db, STUDENT_PROGRESS, userId);
  const snapshot = await getDoc(progressRef);

  if (!snapshot.exists()) {
    return { xpAwarded: 0, alreadyAnswered: false };
  }

  const data = snapshot.data();
  const caseStudyProgressArray: CaseStudyProgress[] = data.caseStudyProgress || [];

  // Find existing progress for this case study AND week
  let existingProgressIndex = caseStudyProgressArray.findIndex(
    p => p.caseStudyId === caseStudyId && p.week === week
  );

  let currentProgress: CaseStudyProgress;

  if (existingProgressIndex >= 0) {
    currentProgress = caseStudyProgressArray[existingProgressIndex];

    // Check if already answered this question
    if (currentProgress.quizAnswers[questionIndex] !== undefined) {
      return { xpAwarded: 0, alreadyAnswered: true };
    }
  } else {
    currentProgress = {
      caseStudyId,
      week,
      quizAnswers: {},
      correctAnswers: [],
    };
  }

  // Update answers
  currentProgress.quizAnswers[questionIndex] = selectedAnswer;
  if (isCorrect && !currentProgress.correctAnswers.includes(questionIndex)) {
    currentProgress.correctAnswers.push(questionIndex);
  }

  // Award XP (5 XP per correct answer)
  const xpToAward = isCorrect ? 5 : 0;
  const currentXP = data.totalXP || 0;
  const newTotalXP = currentXP + xpToAward;
  const xpLevel = Math.floor(newTotalXP / 100) + 1;

  // Update the progress array
  if (existingProgressIndex >= 0) {
    caseStudyProgressArray[existingProgressIndex] = currentProgress;
  } else {
    caseStudyProgressArray.push(currentProgress);
  }

  await updateDoc(progressRef, {
    caseStudyProgress: caseStudyProgressArray,
    totalXP: newTotalXP,
    xpLevel,
    lastActivityAt: serverTimestamp(),
  });

  return { xpAwarded: xpToAward, alreadyAnswered: false };
}

/**
 * Get case study progress for a student
 * If week is provided, returns progress for that specific week
 * If week is not provided, returns the most recent week's progress
 */
export async function getCaseStudyProgress(
  userId: string,
  caseStudyId: string,
  week?: number
): Promise<CaseStudyProgress | null> {
  const progressRef = doc(db, STUDENT_PROGRESS, userId);
  const snapshot = await getDoc(progressRef);

  if (!snapshot.exists()) {
    return null;
  }

  const data = snapshot.data();
  const caseStudyProgressArray: CaseStudyProgress[] = data.caseStudyProgress || [];

  if (week !== undefined) {
    // Return progress for specific week
    return caseStudyProgressArray.find(p => p.caseStudyId === caseStudyId && p.week === week) || null;
  } else {
    // Return the most recent week's progress (highest week number)
    const allProgress = caseStudyProgressArray.filter(p => p.caseStudyId === caseStudyId);
    if (allProgress.length === 0) return null;
    return allProgress.reduce((latest, current) =>
      current.week > latest.week ? current : latest
    );
  }
}

/**
 * Mark a case study week as completed and calculate final score
 * Tracks attempt history similar to module attempts
 */
export async function completeCaseStudy(
  userId: string,
  caseStudyId: string,
  totalQuestions: number,
  week: number
): Promise<{ score: number; passed: boolean; attemptNumber: number }> {
  const progressRef = doc(db, STUDENT_PROGRESS, userId);
  const snapshot = await getDoc(progressRef);

  if (!snapshot.exists()) {
    return { score: 0, passed: false, attemptNumber: 0 };
  }

  const data = snapshot.data();
  const caseStudyProgressArray: CaseStudyProgress[] = data.caseStudyProgress || [];

  const progressIndex = caseStudyProgressArray.findIndex(
    p => p.caseStudyId === caseStudyId && p.week === week
  );

  if (progressIndex < 0) {
    return { score: 0, passed: false, attemptNumber: 0 };
  }

  const progress = caseStudyProgressArray[progressIndex];
  const correctCount = progress.correctAnswers.length;
  const score = Math.round((correctCount / totalQuestions) * 100);
  // Dynamic pass threshold: need 75% or more correct to pass
  const requiredCorrect = Math.ceil(totalQuestions * 0.75);
  const passed = correctCount >= requiredCorrect;

  // Track attempt history
  const currentAttempts = progress.attempts || 0;
  const newAttemptNumber = currentAttempts + 1;
  const now = new Date();

  const newAttempt: CaseStudyAttempt = {
    attemptNumber: newAttemptNumber,
    score,
    correctCount,
    totalQuestions,
    passed,
    completedAt: now,
  };

  const existingHistory = progress.attemptHistory || [];

  // Update progress with completion info and attempt history
  // Only set completedAt if passed (for first pass tracking)
  // But always track attempts
  caseStudyProgressArray[progressIndex] = {
    ...progress,
    score,
    attempts: newAttemptNumber,
    attemptHistory: [...existingHistory, newAttempt],
    ...(passed && !progress.completedAt && { completedAt: now }),
  };

  await updateDoc(progressRef, {
    caseStudyProgress: caseStudyProgressArray,
    lastActivityAt: serverTimestamp(),
  });

  return { score, passed, attemptNumber: newAttemptNumber };
}

/**
 * Reset case study week progress to allow retaking
 * Preserves attempt history for admin tracking
 */
export async function resetCaseStudyWeekProgress(
  userId: string,
  caseStudyId: string,
  week: number
): Promise<void> {
  const progressRef = doc(db, STUDENT_PROGRESS, userId);
  const snapshot = await getDoc(progressRef);

  if (!snapshot.exists()) return;

  const data = snapshot.data();
  const caseStudyProgressArray: CaseStudyProgress[] = data.caseStudyProgress || [];

  // Find existing progress for this week
  const existingIndex = caseStudyProgressArray.findIndex(
    p => p.caseStudyId === caseStudyId && p.week === week
  );

  if (existingIndex < 0) return;

  const existingProgress = caseStudyProgressArray[existingIndex];

  // Reset quiz answers but preserve attempt history
  // IMPORTANT: Create a completely new object to avoid any reference issues
  const resetProgress: CaseStudyProgress = {
    caseStudyId,
    week,
    quizAnswers: {},  // Empty object - no questions answered yet
    correctAnswers: [],  // Empty array - no correct answers yet
    // Preserve attempt tracking
    attempts: existingProgress.attempts || 0,
    attemptHistory: existingProgress.attemptHistory || [],
    // Don't reset completedAt or score - those track best result
    // They will be updated if student passes again
  };

  caseStudyProgressArray[existingIndex] = resetProgress;

  await updateDoc(progressRef, {
    caseStudyProgress: caseStudyProgressArray,
    lastActivityAt: serverTimestamp(),
  });
}

// ============== Money Personality Functions ==============

const PERSONALITY_QUIZ_VERSION = 1; // Increment when quiz questions change significantly

/**
 * Save money personality quiz result
 * Awards XP on first completion (10 XP)
 */
export async function saveMoneyPersonalityResult(
  userId: string,
  primaryPersonalityId: string,
  secondaryPersonalityId: string | null,
  scores: { [personalityId: string]: number },
  answers: number[]
): Promise<{ xpAwarded: number; isFirstTime: boolean }> {
  const progressRef = doc(db, STUDENT_PROGRESS, userId);
  const snapshot = await getDoc(progressRef);

  if (!snapshot.exists()) {
    return { xpAwarded: 0, isFirstTime: false };
  }

  const data = snapshot.data();
  const existingPersonality = data.moneyPersonality as MoneyPersonalityResult | undefined;

  // Check if this is the first time taking the quiz
  const isFirstTime = !existingPersonality;

  // Award 10 XP on first completion
  const xpToAward = isFirstTime ? 10 : 0;
  const currentXP = data.totalXP || 0;
  const newTotalXP = currentXP + xpToAward;
  const xpLevel = Math.floor(newTotalXP / 100) + 1;

  const personalityResult: MoneyPersonalityResult = {
    primaryPersonalityId,
    secondaryPersonalityId,
    scores,
    answers,
    completedAt: new Date(),
    version: PERSONALITY_QUIZ_VERSION,
  };

  await updateDoc(progressRef, {
    moneyPersonality: personalityResult,
    totalXP: newTotalXP,
    xpLevel,
    lastActivityAt: serverTimestamp(),
  });

  return { xpAwarded: xpToAward, isFirstTime };
}

/**
 * Get money personality result for a user
 * Returns null if no result exists
 */
export async function getMoneyPersonalityResult(
  userId: string
): Promise<MoneyPersonalityResult | null> {
  const progressRef = doc(db, STUDENT_PROGRESS, userId);
  const snapshot = await getDoc(progressRef);

  if (!snapshot.exists()) {
    return null;
  }

  const data = snapshot.data();
  const personality = data.moneyPersonality as MoneyPersonalityResult | undefined;

  if (!personality) {
    return null;
  }

  return {
    ...personality,
    completedAt: (personality.completedAt as unknown as Timestamp)?.toDate() || new Date(),
  };
}

/**
 * Clear money personality result (allows retaking)
 */
export async function clearMoneyPersonalityResult(userId: string): Promise<void> {
  const progressRef = doc(db, STUDENT_PROGRESS, userId);

  await updateDoc(progressRef, {
    moneyPersonality: null,
    lastActivityAt: serverTimestamp(),
  });
}

// ============== Content Locking Functions ==============

/**
 * Lock/Unlock a module for an organization (Super Admin only)
 * When locked by super admin, org admins cannot unlock it
 */
export async function setModuleLockBySuperAdmin(
  organizationId: string,
  moduleId: string,
  locked: boolean,
  userId: string
): Promise<void> {
  const orgRef = doc(db, ORGANIZATIONS, organizationId);
  const org = await getOrganization(organizationId);

  if (!org) {
    throw new Error('Organization not found');
  }

  const lockedModules = org.lockedModules || {};

  if (locked) {
    // Lock the module for this organization
    lockedModules[moduleId] = {
      lockedBySuperAdmin: true,
      lockedByOrgAdmin: false, // Super admin lock overrides org admin lock
      lockedAt: new Date(),
      lockedBy: userId,
    };
  } else {
    // Unlock the module - remove the lock entirely
    delete lockedModules[moduleId];
  }

  await updateDoc(orgRef, {
    lockedModules,
  });
}

/**
 * Lock/Unlock a module for students (Org Admin only)
 * Can only lock/unlock if not locked by super admin
 */
export async function setModuleLockByOrgAdmin(
  organizationId: string,
  moduleId: string,
  locked: boolean,
  userId: string
): Promise<void> {
  const orgRef = doc(db, ORGANIZATIONS, organizationId);
  const org = await getOrganization(organizationId);

  if (!org) {
    throw new Error('Organization not found');
  }

  const lockedModules = org.lockedModules || {};
  const existingLock = lockedModules[moduleId];

  // Check if locked by super admin
  if (existingLock?.lockedBySuperAdmin) {
    throw new Error('Cannot modify module locked by super admin');
  }

  if (locked) {
    // Lock the module for students
    lockedModules[moduleId] = {
      lockedBySuperAdmin: false,
      lockedByOrgAdmin: true,
      lockedAt: new Date(),
      lockedBy: userId,
    };
  } else {
    // Unlock the module for students
    delete lockedModules[moduleId];
  }

  await updateDoc(orgRef, {
    lockedModules,
  });
}

/**
 * Lock/Unlock a case study for an organization (Super Admin only)
 */
export async function setCaseStudyLockBySuperAdmin(
  organizationId: string,
  caseStudyId: string,
  locked: boolean,
  userId: string
): Promise<void> {
  const orgRef = doc(db, ORGANIZATIONS, organizationId);
  const org = await getOrganization(organizationId);

  if (!org) {
    throw new Error('Organization not found');
  }

  const lockedCaseStudies = org.lockedCaseStudies || {};

  if (locked) {
    lockedCaseStudies[caseStudyId] = {
      lockedBySuperAdmin: true,
      lockedByOrgAdmin: false,
      lockedAt: new Date(),
      lockedBy: userId,
    };
  } else {
    delete lockedCaseStudies[caseStudyId];
  }

  await updateDoc(orgRef, {
    lockedCaseStudies,
  });
}

/**
 * Lock/Unlock a case study for students (Org Admin only)
 */
export async function setCaseStudyLockByOrgAdmin(
  organizationId: string,
  caseStudyId: string,
  locked: boolean,
  userId: string
): Promise<void> {
  const orgRef = doc(db, ORGANIZATIONS, organizationId);
  const org = await getOrganization(organizationId);

  if (!org) {
    throw new Error('Organization not found');
  }

  const lockedCaseStudies = org.lockedCaseStudies || {};
  const existingLock = lockedCaseStudies[caseStudyId];

  if (existingLock?.lockedBySuperAdmin) {
    throw new Error('Cannot modify case study locked by super admin');
  }

  if (locked) {
    lockedCaseStudies[caseStudyId] = {
      lockedBySuperAdmin: false,
      lockedByOrgAdmin: true,
      lockedAt: new Date(),
      lockedBy: userId,
    };
  } else {
    delete lockedCaseStudies[caseStudyId];
  }

  await updateDoc(orgRef, {
    lockedCaseStudies,
  });
}

/**
 * Check if a module is accessible to a student
 * Returns true if student can access (not locked)
 */
export async function isModuleAccessible(
  organizationId: string,
  moduleId: string
): Promise<boolean> {
  const org = await getOrganization(organizationId);

  if (!org) {
    return true; // Default to accessible if org not found
  }

  const lock = org.lockedModules?.[moduleId];

  if (!lock) {
    return true; // No lock = accessible
  }

  // Locked if either super admin or org admin has locked it
  return !(lock.lockedBySuperAdmin || lock.lockedByOrgAdmin);
}

/**
 * Check if a case study is accessible to a student (legacy - checks whole case study)
 */
export async function isCaseStudyAccessible(
  organizationId: string,
  caseStudyId: string
): Promise<boolean> {
  const org = await getOrganization(organizationId);

  if (!org) {
    return true;
  }

  const lock = org.lockedCaseStudies?.[caseStudyId];

  if (!lock) {
    return true;
  }

  return !(lock.lockedBySuperAdmin || lock.lockedByOrgAdmin);
}

/**
 * Lock/Unlock a specific case study week for an organization (Super Admin only)
 */
export async function setCaseStudyWeekLockBySuperAdmin(
  organizationId: string,
  weekNumber: number,
  locked: boolean,
  userId: string
): Promise<void> {
  const orgRef = doc(db, ORGANIZATIONS, organizationId);
  const org = await getOrganization(organizationId);

  if (!org) {
    throw new Error('Organization not found');
  }

  const lockedCaseStudyWeeks = org.lockedCaseStudyWeeks || {};
  const weekKey = weekNumber.toString();

  if (locked) {
    lockedCaseStudyWeeks[weekKey] = {
      lockedBySuperAdmin: true,
      lockedByOrgAdmin: false,
      lockedAt: new Date(),
      lockedBy: userId,
    };
  } else {
    delete lockedCaseStudyWeeks[weekKey];
  }

  await updateDoc(orgRef, {
    lockedCaseStudyWeeks,
  });
}

/**
 * Lock/Unlock a specific case study week for students (Org Admin only)
 */
export async function setCaseStudyWeekLockByOrgAdmin(
  organizationId: string,
  weekNumber: number,
  locked: boolean,
  userId: string
): Promise<void> {
  const orgRef = doc(db, ORGANIZATIONS, organizationId);
  const org = await getOrganization(organizationId);

  if (!org) {
    throw new Error('Organization not found');
  }

  const lockedCaseStudyWeeks = org.lockedCaseStudyWeeks || {};
  const weekKey = weekNumber.toString();
  const existingLock = lockedCaseStudyWeeks[weekKey];

  if (existingLock?.lockedBySuperAdmin) {
    throw new Error('Cannot modify case study week locked by super admin');
  }

  if (locked) {
    lockedCaseStudyWeeks[weekKey] = {
      lockedBySuperAdmin: false,
      lockedByOrgAdmin: true,
      lockedAt: new Date(),
      lockedBy: userId,
    };
  } else {
    delete lockedCaseStudyWeeks[weekKey];
  }

  await updateDoc(orgRef, {
    lockedCaseStudyWeeks,
  });
}

/**
 * Check if a specific case study week is accessible to a student
 */
export async function isCaseStudyWeekAccessible(
  organizationId: string,
  weekNumber: number
): Promise<boolean> {
  const org = await getOrganization(organizationId);

  if (!org) {
    return true;
  }

  const weekKey = weekNumber.toString();
  const lock = org.lockedCaseStudyWeeks?.[weekKey];

  if (!lock) {
    return true;
  }

  return !(lock.lockedBySuperAdmin || lock.lockedByOrgAdmin);
}

/**
 * Get all locked content for an organization
 */
export async function getOrganizationLocks(organizationId: string): Promise<{
  modules: { [moduleId: string]: ContentLock };
  caseStudies: { [caseStudyId: string]: ContentLock };
  caseStudyWeeks: { [weekNumber: string]: WeekLock };
}> {
  const org = await getOrganization(organizationId);

  if (!org) {
    return { modules: {}, caseStudies: {}, caseStudyWeeks: {} };
  }

  return {
    modules: org.lockedModules || {},
    caseStudies: org.lockedCaseStudies || {},
    caseStudyWeeks: org.lockedCaseStudyWeeks || {},
  };
}

// ============== Certificate Functions ==============

/**
 * Generate a unique certificate ID
 */
function generateCertificateId(userId: string): string {
  const year = new Date().getFullYear();
  const userSuffix = userId.slice(0, 6).toUpperCase();
  return `FL-${year}-${userSuffix}`;
}

/**
 * Save certificate data for a user
 * Only saves if certificate doesn't already exist
 */
export async function saveCertificateData(
  userId: string,
  studentName: string
): Promise<CertificateData> {
  const progressRef = doc(db, STUDENT_PROGRESS, userId);
  const snapshot = await getDoc(progressRef);

  if (!snapshot.exists()) {
    throw new Error('Student progress not found');
  }

  const data = snapshot.data();

  // If certificate already exists, return existing data
  if (data.certificateData) {
    return {
      ...data.certificateData,
      completionDate: (data.certificateData.completionDate as Timestamp)?.toDate() || new Date(),
      generatedAt: (data.certificateData.generatedAt as Timestamp)?.toDate() || new Date(),
    };
  }

  // Generate new certificate data
  const certificateData: CertificateData = {
    certificateId: generateCertificateId(userId),
    studentName,
    completionDate: new Date(),
    generatedAt: new Date(),
  };

  await updateDoc(progressRef, {
    certificateData,
    lastActivityAt: serverTimestamp(),
  });

  return certificateData;
}

/**
 * Get certificate data for a user
 * Returns null if no certificate exists
 */
export async function getCertificateData(
  userId: string
): Promise<CertificateData | null> {
  const progressRef = doc(db, STUDENT_PROGRESS, userId);
  const snapshot = await getDoc(progressRef);

  if (!snapshot.exists()) {
    return null;
  }

  const data = snapshot.data();
  const certificateData = data.certificateData as CertificateData | undefined;

  if (!certificateData) {
    return null;
  }

  return {
    ...certificateData,
    completionDate: (certificateData.completionDate as unknown as Timestamp)?.toDate() || new Date(),
    generatedAt: (certificateData.generatedAt as unknown as Timestamp)?.toDate() || new Date(),
  };
}
