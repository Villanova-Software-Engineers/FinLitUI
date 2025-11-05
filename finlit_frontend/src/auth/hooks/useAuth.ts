import { useState, useCallback } from 'react';
import { AuthService } from '../services/auth.service';
import type { SignInRequest, SignUpRequest, AuthState, User } from '../types/auth.types';

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: AuthService.getStoredUserData(),
    isAuthenticated: !!AuthService.getStoredToken(),
    isLoading: false,
    error: null,
  });

  const signIn = useCallback(async (credentials: SignInRequest) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await AuthService.signIn(credentials);
      
      if (response.success) {
        AuthService.storeAuthData(response.token, response.user);
        setAuthState({
          user: response.user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        return { success: true, user: response.user };
      } else {
        throw new Error('Sign in failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign in failed';
      setAuthState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: errorMessage 
      }));
      return { success: false, error: errorMessage };
    }
  }, []);

  const signUp = useCallback(async (userData: SignUpRequest) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await AuthService.signUp(userData);
      
      if (response.success) {
        AuthService.storeAuthData(response.token, response.user);
        setAuthState({
          user: response.user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        return { success: true, user: response.user };
      } else {
        throw new Error('Sign up failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign up failed';
      setAuthState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: errorMessage 
      }));
      return { success: false, error: errorMessage };
    }
  }, []);

  const signOut = useCallback(async () => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    try {
      await AuthService.signOut();
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const clearError = useCallback(() => {
    setAuthState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...authState,
    signIn,
    signUp,
    signOut,
    clearError,
  };
};