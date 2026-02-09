import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  updateProfile,
  type User as FirebaseUser,
} from 'firebase/auth';
import { auth } from '../../firebase/config';
import {
  validateClassCode,
  createUserProfile,
  getUserProfile,
  initializeStudentProgress,
} from '../../firebase/firestore.service';
import type {
  SignInRequest,
  SignUpRequest,
  AuthResponse,
  User,
  CodeValidation,
} from '../types/auth.types';

export class AuthService {
  // Helper function to translate Firebase auth errors to user-friendly messages
  private static getAuthErrorMessage(error: any): string {
    const errorCode = error?.code || '';

    switch (errorCode) {
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
      case 'auth/user-not-found':
        return 'Invalid email or password. Please check your credentials and try again.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/user-disabled':
        return 'This account has been disabled. Please contact support.';
      case 'auth/too-many-requests':
        return 'Too many failed login attempts. Please try again later.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your internet connection.';
      default:
        return 'An error occurred during sign in. Please try again.';
    }
  }

  // Sign in with email and password
  static async signIn(credentials: SignInRequest): Promise<AuthResponse> {
    const { email, password } = credentials;

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Get user profile from Firestore
      const userProfile = await getUserProfile(firebaseUser.uid);

      if (!userProfile) {
        throw new Error('User profile not found. Please contact support.');
      }

      return {
        success: true,
        user: userProfile,
      };
    } catch (error) {
      throw new Error(this.getAuthErrorMessage(error));
    }
  }

  // Sign up as a student with class code
  static async signUp(userData: SignUpRequest): Promise<AuthResponse> {
    const { email, password, displayName, classCode } = userData;

    // Validate class code first
    const codeValidation = await validateClassCode(classCode);
    if (!codeValidation.valid) {
      throw new Error('Invalid class code. Please check with your instructor.');
    }

    // Create Firebase auth user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    // Update display name
    await updateProfile(firebaseUser, { displayName });

    // Create user profile in Firestore
    const user: Omit<User, 'createdAt'> = {
      id: firebaseUser.uid,
      email: firebaseUser.email!,
      role: 'student',
      displayName,
      organizationId: codeValidation.organizationId!,
      organizationName: codeValidation.organizationName!,
      classCode: classCode.toUpperCase(),
    };

    await createUserProfile(user);

    // Initialize student progress
    await initializeStudentProgress(
      firebaseUser.uid,
      classCode.toUpperCase(),
      codeValidation.organizationId!
    );

    return {
      success: true,
      user: { ...user, createdAt: new Date() },
    };
  }

  // Sign out
  static async signOut(): Promise<void> {
    await firebaseSignOut(auth);
  }

  // Send password reset email
  static async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    await sendPasswordResetEmail(auth, email);
    return {
      success: true,
      message: 'Password reset email sent. Please check your inbox and spam folder.',
    };
  }

  // Validate class code
  static async validateClassCode(code: string): Promise<CodeValidation> {
    return validateClassCode(code);
  }

  // Get current Firebase user
  static getCurrentFirebaseUser(): FirebaseUser | null {
    return auth.currentUser;
  }

  // Subscribe to auth state changes
  static onAuthStateChanged(callback: (user: FirebaseUser | null) => void): () => void {
    return onAuthStateChanged(auth, callback);
  }

  // Get user profile from Firestore
  static async getUserProfile(userId: string): Promise<User | null> {
    return getUserProfile(userId);
  }
}
