export interface User {
  id: number;
  email: string;
  role: 'admin' | 'user' | 'viewer';
  organizationName: string;
  permissions: string[];
  redirectUrl: string;
}

export interface SignInRequest {
  email: string;
  password: string;
  role?: string;
  rememberMe?: boolean;
}

export interface SignUpRequest {
  email: string;
  password: string;
  confirmPassword: string;
  organizationCode: string;
  acceptedTerms: boolean;
}

export interface AuthResponse {
  success: boolean;
  token: string;
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