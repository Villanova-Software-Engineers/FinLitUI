export { AuthPage } from './components/AuthPage';
export { DevAuthPage } from './components/DevAuthPage';
export { SignInForm } from './components/SignInForm';
export { SignUpForm } from './components/SignUpForm';
export { ForgotPasswordModal } from './components/ForgotPasswordModal';
export { ProtectedRoute } from './components/ProtectedRoute';

export { AuthProvider, useAuthContext } from './context/AuthContext';

export { useAuth } from './hooks/useAuth';
export { useFormValidation } from './hooks/useFormValidation';

export { AuthService } from './services/auth.service';

export type {
  User,
  UserRole,
  Organization,
  ClassCode,
  RegisteredStudent,
  ModuleScore,
  ModuleAttempt,
  StudentProgress,
  SignInRequest,
  SignUpRequest,
  AuthResponse,
  AuthError,
  FormValidation,
  PasswordStrength,
  AuthMode,
  AuthState,
  CodeValidation,
  StudentWithProgress,
  UserDashboardData,
} from './types/auth.types';
