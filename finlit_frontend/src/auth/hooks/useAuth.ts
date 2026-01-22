import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '../services/auth.service';
import { useAuthContext } from '../context/AuthContext';
import type { SignInRequest, SignUpRequest } from '../types/auth.types';

export const useAuth = () => {
  const authContext = useAuthContext();
  const navigate = useNavigate();

  const signIn = useCallback(async (credentials: SignInRequest) => {
    authContext.setLoading(true);
    authContext.clearError();

    try {
      const response = await AuthService.signIn(credentials);

      if (response.success) {
        authContext.setUser(response.user);

        // Redirect based on role
        if (response.user.role === 'owner') {
          navigate('/admin-setup');
        } else if (response.user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
        return { success: true, user: response.user };
      } else {
        throw new Error('Sign in failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign in failed';
      authContext.setError(errorMessage);
      authContext.setLoading(false);
      return { success: false, error: errorMessage };
    }
  }, [authContext, navigate]);

  const signUp = useCallback(async (userData: SignUpRequest) => {
    authContext.setLoading(true);
    authContext.clearError();

    try {
      const response = await AuthService.signUp(userData);

      if (response.success) {
        authContext.setUser(response.user);
        navigate('/dashboard');
        return { success: true, user: response.user };
      } else {
        throw new Error('Sign up failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign up failed';
      authContext.setError(errorMessage);
      authContext.setLoading(false);
      return { success: false, error: errorMessage };
    }
  }, [authContext, navigate]);

  const signOut = useCallback(async () => {
    await authContext.signOut();
    navigate('/auth');
  }, [authContext, navigate]);

  const validateClassCode = useCallback(async (code: string) => {
    return AuthService.validateClassCode(code);
  }, []);

  const forgotPassword = useCallback(async (email: string) => {
    try {
      const response = await AuthService.forgotPassword(email);
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send reset email';
      return { success: false, message: errorMessage };
    }
  }, []);

  return {
    user: authContext.user,
    isAuthenticated: authContext.isAuthenticated,
    isLoading: authContext.isLoading,
    error: authContext.error,
    signIn,
    signUp,
    signOut,
    clearError: authContext.clearError,
    validateClassCode,
    forgotPassword,
  };
};
