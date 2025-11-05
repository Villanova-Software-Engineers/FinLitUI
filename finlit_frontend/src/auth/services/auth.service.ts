import type { SignInRequest, SignUpRequest, AuthResponse, AuthError } from '../types/auth.types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export class AuthService {
  private static async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Request failed');
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error occurred');
    }
  }

  static async signIn(credentials: SignInRequest): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/signin', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  static async signUp(userData: SignUpRequest): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  static async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    return this.request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  static async validateOrganizationCode(code: string): Promise<{ valid: boolean; organizationName?: string }> {
    return this.request(`/auth/validate-org-code/${code}`, {
      method: 'GET',
    });
  }

  static async refreshToken(): Promise<AuthResponse> {
    const token = localStorage.getItem('authToken');
    return this.request<AuthResponse>('/auth/refresh', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  static async signOut(): Promise<void> {
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        await this.request('/auth/signout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      } catch (error) {
        console.warn('Sign out request failed:', error);
      }
    }
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
  }

  static getStoredToken(): string | null {
    return localStorage.getItem('authToken');
  }

  static storeAuthData(token: string, userData: any): void {
    localStorage.setItem('authToken', token);
    localStorage.setItem('userData', JSON.stringify(userData));
  }

  static getStoredUserData(): any | null {
    const data = localStorage.getItem('userData');
    return data ? JSON.parse(data) : null;
  }
}