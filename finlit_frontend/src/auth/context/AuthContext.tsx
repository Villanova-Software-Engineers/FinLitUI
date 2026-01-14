import React, { createContext, useContext, useEffect, useState } from 'react';
import type { AuthState, User } from '../types/auth.types';
import { AuthService } from '../services/auth.service';
import { authReady } from '../../firebase/config';

interface AuthContextType extends AuthState {
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  clearError: () => void;
  setUser: (user: User) => void;
  setError: (error: string) => void;
  setLoading: (loading: boolean) => void;
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
    let unsubscribe: (() => void) | null = null;

    // Wait for persistence to be ready before subscribing to auth state
    const initAuth = async () => {
      // Wait for Firebase persistence to be configured
      await authReady;

      // Subscribe to Firebase auth state changes
      unsubscribe = AuthService.onAuthStateChanged(async (firebaseUser) => {
        if (firebaseUser) {
          try {
            // Get user profile from Firestore
            const userProfile = await AuthService.getUserProfile(firebaseUser.uid);

            if (userProfile) {
              setAuthState({
                user: userProfile,
                isAuthenticated: true,
                isLoading: false,
                error: null,
              });
            } else {
              // User exists in Firebase but not in Firestore
              setAuthState({
                user: null,
                isAuthenticated: false,
                isLoading: false,
                error: 'User profile not found',
              });
            }
          } catch (error) {
            console.error('Error fetching user profile:', error);
            setAuthState({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: 'Failed to load user profile',
            });
          }
        } else {
          // No user signed in
          setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      });
    };

    initAuth();

    // Cleanup subscription on unmount
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
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
        error: 'Failed to sign out properly',
      }));
    }
  };

  const refreshUser = async () => {
    const firebaseUser = AuthService.getCurrentFirebaseUser();
    if (firebaseUser) {
      try {
        const userProfile = await AuthService.getUserProfile(firebaseUser.uid);
        if (userProfile) {
          setAuthState(prev => ({
            ...prev,
            user: userProfile,
            isAuthenticated: true,
            error: null,
          }));
        }
      } catch (error) {
        console.error('Error refreshing user:', error);
      }
    }
  };

  const clearError = () => {
    setAuthState(prev => ({ ...prev, error: null }));
  };

  const setUser = (user: User) => {
    setAuthState(prev => ({
      ...prev,
      user,
      isAuthenticated: true,
    }));
  };

  const setError = (error: string) => {
    setAuthState(prev => ({ ...prev, error }));
  };

  const setLoading = (loading: boolean) => {
    setAuthState(prev => ({ ...prev, isLoading: loading }));
  };

  const contextValue: AuthContextType = {
    ...authState,
    signOut,
    refreshUser,
    clearError,
    setUser,
    setError,
    setLoading,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
