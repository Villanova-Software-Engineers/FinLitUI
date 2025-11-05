import React, { createContext, useContext, useEffect, useState } from 'react';
import type { AuthState, User } from '../types/auth.types';
import { AuthService } from '../services/auth.service';

interface AuthContextType extends AuthState {
  signOut: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    const initializeAuth = async () => {
      const token = AuthService.getStoredToken();
      const userData = AuthService.getStoredUserData();

      if (token && userData) {
        try {
          const response = await AuthService.refreshToken();
          if (response.success) {
            AuthService.storeAuthData(response.token, response.user);
            setAuthState({
              user: response.user,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          } else {
            await AuthService.signOut();
            setAuthState({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: null,
            });
          }
        } catch (error) {
          await AuthService.signOut();
          setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      } else {
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      }
    };

    initializeAuth();
  }, []);

  const signOut = async () => {
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
      setAuthState(prev => ({ 
        ...prev, 
        isLoading: false,
        error: 'Failed to sign out properly'
      }));
    }
  };

  const refreshAuth = async () => {
    try {
      const response = await AuthService.refreshToken();
      if (response.success) {
        AuthService.storeAuthData(response.token, response.user);
        setAuthState(prev => ({
          ...prev,
          user: response.user,
          isAuthenticated: true,
          error: null,
        }));
      }
    } catch (error) {
      await signOut();
    }
  };

  const clearError = () => {
    setAuthState(prev => ({ ...prev, error: null }));
  };

  const contextValue: AuthContextType = {
    ...authState,
    signOut,
    refreshAuth,
    clearError,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};