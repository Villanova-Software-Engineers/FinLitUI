export type UserRole = 'owner' | 'admin' | 'student';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  displayName?: string;
  organizationId?: string;
  organizationName?: string;
  classCode?: string; // For students - the class code they registered with
  createdAt: Date;
}

// Organization structure in Firestore
export interface Organization {
  id: string;
  name: string;
  contactEmail: string; // Admin contact email
  adminId: string; // Firebase Auth UID of the admin
  createdBy: string; // Owner who created this org
  createdAt: Date;
}

// Class/Code structure in Firestore (created by admin)
export interface ClassCode {
  id: string;
  code: string; // The actual code students use to register
  name: string; // Display name for this code (e.g., "Fall 2024 Section A")
  organizationId: string;
  createdBy: string; // Admin who created this code
  createdAt: Date;
  isActive: boolean;
}

// Student registered with a code
export interface RegisteredStudent {
  userId: string;
  email: string;
  displayName: string;
  classCode: string;
  organizationId: string;
  registeredAt: Date;
}

// Individual module attempt record
export interface ModuleAttempt {
  attemptNumber: number;
  score: number;
  maxScore: number;
  passed: boolean;  // 100% to pass
  completedAt: Date;
}

// Student's module score with detailed attempts
export interface ModuleScore {
  moduleId: string;
  moduleName: string;
  score: number;        // Best score
  maxScore: number;
  completedAt: Date;    // Most recent attempt
  attempts: number;     // Total number of attempts
  passed: boolean;      // Has achieved 100%
  attemptHistory: ModuleAttempt[];  // All attempts with timestamps
}

// Crossword answer tracking
export interface CrosswordProgress {
  answers: { [key: string]: string }; // Cell key "row-col" -> letter
  correctWords: string[]; // List of word IDs that were answered correctly
  lastUpdated: Date;
  weekId: string; // Format: "YYYY-WW" to track which week's crossword
}

// Quick Quiz question structure (stored in Firestore)
export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct: number; // Index of correct answer (0-3)
  explanation: string;
  emoji: string;
  createdAt: Date;
  createdBy: string;
}

// Quick Quiz progress tracking
export interface QuickQuizProgress {
  answeredQuestions: { [questionId: string]: number }; // questionId -> selected answer index
  correctAnswers: string[]; // List of question IDs answered correctly
  quizVersion: string; // Hash/ID to detect when questions change
  lastUpdated: Date;
}

// Daily Challenge question structure (stored in Firestore)
export interface DailyChallengeQuestion {
  id: string;
  question: string;
  options: string[];
  correct: number; // Index of correct answer (0-3)
  explanation: string; // Explanation for the correct answer
  createdAt: Date;
  createdBy: string;
}

// Student progress document in Firestore
export interface StudentProgress {
  id: string;
  userId: string;
  classCode: string;
  organizationId: string;
  xpLevel: number;
  streak: number;
  totalXP: number;
  moduleScores: ModuleScore[];
  achievements: string[];
  lastActivityAt: Date;
  lastStreakDate?: string; // YYYY-MM-DD format for tracking daily streak
  lastDailyChallengeDate?: string; // YYYY-MM-DD format for tracking daily challenge completion
  crosswordProgress?: CrosswordProgress; // Crossword answers and progress
  quickQuizProgress?: QuickQuizProgress; // Quick Quiz answers and progress
}

export interface SignInRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

// Student registration - uses class code
export interface SignUpRequest {
  email: string;
  password: string;
  confirmPassword: string;
  displayName: string;
  classCode: string; // Class code for students to register
  acceptedTerms: boolean;
}

export interface AuthResponse {
  success: boolean;
  user: User;
  message?: string;
}

export interface AuthError {
  success: false;
  message: string;
  errors?: Record<string, string>;
}

export interface FormValidation {
  isValid: boolean;
  errors: Record<string, string>;
}

export interface PasswordStrength {
  score: number;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
  isMinLength: boolean;
}

export type AuthMode = 'signin' | 'signup';

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Code validation response
export interface CodeValidation {
  valid: boolean;
  codeId?: string;
  codeName?: string;
  organizationId?: string;
  organizationName?: string;
}

// Student with progress for instructor view
export interface StudentWithProgress extends RegisteredStudent {
  progress: StudentProgress | null;
}

// Aggregated data for optimized single-read on login
export interface UserDashboardData {
  user: User;
  progress: StudentProgress | null;
}

// ============ CASE STUDY TYPES ============

// Quiz question within a case study
export interface CaseStudyQuizQuestion {
  question: string;
  options: string[];
  answer: string; // The correct answer text
  teaching_point: string;
}

// Case Study section types
export interface CaseStudyWhoIsThis {
  title: string;
  content: string;
}

export interface CaseStudyWhatHappened {
  title: string;
  content: string;
}

export interface CaseStudyMoneyIdea {
  title: string;
  what_it_means: string;
  why_it_matters: string;
  formula?: string; // LaTeX formula (optional)
  risk: string;
  real_life: string;
}

// Main Case Study content structure (matches JSON format)
export interface CaseStudyContent {
  week: number;
  subject: string;
  topic: string;
  who_is_this: CaseStudyWhoIsThis;
  what_happened: CaseStudyWhatHappened;
  money_idea: CaseStudyMoneyIdea;
  quiz: CaseStudyQuizQuestion[];
}

// Case Study document in Firestore
export interface CaseStudy {
  id: string;
  case_study: CaseStudyContent;
  // Image URLs (stored in Firebase Storage)
  personImageUrl: string;      // Image of the person (e.g., Elon Musk)
  companyImageUrl1: string;    // First company/related image
  companyImageUrl2: string;    // Second company/related image
  isActive: boolean;           // Whether this is the current week's case study
  createdAt: Date;
  createdBy: string;
  updatedAt?: Date;
}

// Case Study progress tracking for students
export interface CaseStudyProgress {
  caseStudyId: string;
  week: number;
  quizAnswers: { [questionIndex: number]: string }; // Index -> selected answer
  correctAnswers: number[];    // Indices of correctly answered questions
  completedAt?: Date;
  score?: number;              // Final score (correct/total * 100)
}
