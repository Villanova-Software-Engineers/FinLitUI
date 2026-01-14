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
  // Sign in with email and password
  static async signIn(credentials: SignInRequest): Promise<AuthResponse> {
    const { email, password } = credentials;

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
      message: 'Password reset email sent. Please check your inbox.',
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
