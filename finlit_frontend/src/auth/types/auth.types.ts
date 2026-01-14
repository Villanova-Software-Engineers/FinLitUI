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
