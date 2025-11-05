import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, AlertCircle } from 'lucide-react';
import { useFormValidation } from '../hooks/useFormValidation';
import type { SignInRequest } from '../types/auth.types';

interface SignInFormProps {
  onSubmit: (credentials: SignInRequest) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  onForgotPassword: () => void;
}

export const SignInForm: React.FC<SignInFormProps> = ({
  onSubmit,
  isLoading,
  error,
  onForgotPassword,
}) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const { validateEmail, validatePassword } = useFormValidation();

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (touched[field]) {
      const errors = { ...fieldErrors };
      
      if (field === 'email') {
        const emailError = validateEmail(value as string);
        if (emailError) {
          errors.email = emailError;
        } else {
          delete errors.email;
        }
      }
      
      if (field === 'password') {
        const passwordError = validatePassword(value as string);
        if (passwordError) {
          errors.password = passwordError;
        } else {
          delete errors.password;
        }
      }
      
      setFieldErrors(errors);
    }
  };

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    
    const errors = { ...fieldErrors };
    
    if (field === 'email') {
      const emailError = validateEmail(formData.email);
      if (emailError) {
        errors.email = emailError;
      } else {
        delete errors.email;
      }
    }
    
    if (field === 'password') {
      const passwordError = validatePassword(formData.password);
      if (passwordError) {
        errors.password = passwordError;
      } else {
        delete errors.password;
      }
    }
    
    setFieldErrors(errors);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const errors: Record<string, string> = {};
    
    const emailError = validateEmail(formData.email);
    if (emailError) errors.email = emailError;
    
    const passwordError = validatePassword(formData.password);
    if (passwordError) errors.password = passwordError;
    
    setFieldErrors(errors);
    setTouched({ email: true, password: true });
    
    if (Object.keys(errors).length === 0) {
      await onSubmit({
        email: formData.email,
        password: formData.password,
        rememberMe: formData.rememberMe,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-center gap-3">
          <AlertCircle className="text-red-500" size={20} />
          <span className="text-red-700 text-sm">{error}</span>
        </div>
      )}

      <div className="relative">
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 transition-colors duration-200" size={20} />
          <input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            onBlur={() => handleBlur('email')}
            className={`w-full pl-12 pr-4 py-4 border-2 rounded-xl bg-gray-50 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all duration-200 placeholder-transparent peer ${
              fieldErrors.email ? 'border-red-300 bg-red-50 focus:ring-red-100 focus:border-red-500' : 'border-gray-200 hover:border-gray-300'
            }`}
            placeholder="Enter your email"
            disabled={isLoading}
          />
          <label 
            htmlFor="email" 
            className={`absolute left-12 transition-all duration-200 pointer-events-none ${
              formData.email 
                ? 'top-2 text-xs text-gray-500 font-medium' 
                : 'top-1/2 -translate-y-1/2 text-gray-400 peer-focus:top-2 peer-focus:text-xs peer-focus:text-blue-600 peer-focus:font-medium'
            }`}
          >
            Email Address
          </label>
        </div>
        {fieldErrors.email && (
          <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
            <AlertCircle size={16} />
            {fieldErrors.email}
          </p>
        )}
      </div>

      <div className="relative">
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 transition-colors duration-200" size={20} />
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            onBlur={() => handleBlur('password')}
            className={`w-full pl-12 pr-14 py-4 border-2 rounded-xl bg-gray-50 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all duration-200 placeholder-transparent peer ${
              fieldErrors.password ? 'border-red-300 bg-red-50 focus:ring-red-100 focus:border-red-500' : 'border-gray-200 hover:border-gray-300'
            }`}
            placeholder="Enter your password"
            disabled={isLoading}
          />
          <label 
            htmlFor="password" 
            className={`absolute left-12 transition-all duration-200 pointer-events-none ${
              formData.password 
                ? 'top-2 text-xs text-gray-500 font-medium' 
                : 'top-1/2 -translate-y-1/2 text-gray-400 peer-focus:top-2 peer-focus:text-xs peer-focus:text-blue-600 peer-focus:font-medium'
            }`}
          >
            Password
          </label>
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1 rounded-md hover:bg-gray-100"
            disabled={isLoading}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        {fieldErrors.password && (
          <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
            <AlertCircle size={16} />
            {fieldErrors.password}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={formData.rememberMe}
            onChange={(e) => handleInputChange('rememberMe', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            disabled={isLoading}
          />
          <span className="ml-2 text-sm text-gray-600">Remember me</span>
        </label>
        
        <button
          type="button"
          onClick={onForgotPassword}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          disabled={isLoading}
        >
          Forgot password?
        </button>
      </div>

      <button
        type="submit"
        disabled={isLoading || Object.keys(fieldErrors).length > 0}
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
      >
        {isLoading ? (
          <div className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Signing in...
          </div>
        ) : (
          'Sign In'
        )}
      </button>
    </form>
  );
};