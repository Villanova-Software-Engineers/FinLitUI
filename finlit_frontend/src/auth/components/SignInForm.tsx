import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, AlertCircle } from 'lucide-react';
import { useFormValidation } from '../hooks/useFormValidation';
import type { SignInRequest } from '../types/auth.types';

interface SignInFormProps {
  onSubmit: (credentials: SignInRequest) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  onForgotPassword: () => void;
  isDarkMode: boolean;
}

export const SignInForm: React.FC<SignInFormProps> = ({
  onSubmit,
  isLoading,
  error,
  onForgotPassword,
  isDarkMode,
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
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="text-red-500" size={20} />
          <span className="text-red-700 dark:text-red-300 text-sm">{error}</span>
        </div>
      )}

      <div className="relative">
        <label 
          htmlFor="email" 
          style={{ color: isDarkMode ? '#ffffff' : '#1B254B' }}
          className="block text-sm font-medium text-gray-700 dark:text-white mb-2"
        >
          Email*
        </label>
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 transition-colors duration-200" size={20} />
          <input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            onBlur={() => handleBlur('email')}
            style={{ 
              backgroundColor: isDarkMode ? '#111c44' : 'white', 
              color: isDarkMode ? '#ffffff' : '#1B254B' 
            }}
            className={`w-full pl-12 pr-4 py-3.5 rounded-xl border bg-white dark:bg-navy-800 focus:ring-2 focus:ring-brand-100 dark:focus:ring-brand-900/30 focus:border-brand-500 dark:focus:border-brand-400 outline-none transition-all duration-200 text-navy-700 dark:text-white ${
              fieldErrors.email 
                ? 'border-red-300 !bg-red-50 dark:!bg-red-900/20 dark:border-red-600 focus:ring-red-100 dark:focus:ring-red-800 focus:border-red-500' 
                : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
            }`}
            placeholder="mail@example.com"
            disabled={isLoading}
          />
        </div>
        {fieldErrors.email && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
            <AlertCircle size={16} />
            {fieldErrors.email}
          </p>
        )}
      </div>

      <div className="relative">
        <label 
          htmlFor="password" 
          style={{ color: isDarkMode ? '#ffffff' : '#1B254B' }}
          className="block text-sm font-medium text-gray-700 dark:text-white mb-2"
        >
          Password*
        </label>
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 transition-colors duration-200" size={20} />
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            onBlur={() => handleBlur('password')}
            style={{ 
              backgroundColor: isDarkMode ? '#111c44' : 'white', 
              color: isDarkMode ? '#ffffff' : '#1B254B' 
            }}
            className={`w-full pl-12 pr-14 py-3.5 rounded-xl border bg-white dark:bg-navy-800 focus:ring-2 focus:ring-brand-100 dark:focus:ring-brand-900/30 focus:border-brand-500 dark:focus:border-brand-400 outline-none transition-all duration-200 text-navy-700 dark:text-white ${
              fieldErrors.password 
                ? 'border-red-300 !bg-red-50 dark:!bg-red-900/20 dark:border-red-600 focus:ring-red-100 dark:focus:ring-red-800 focus:border-red-500' 
                : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
            }`}
            placeholder="Min. 8 characters"
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200 p-1 rounded-md hover:bg-gray-100 dark:hover:bg-navy-700"
            disabled={isLoading}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        {fieldErrors.password && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
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
            style={{ backgroundColor: isDarkMode ? '#111c44' : 'white' }}
            className="h-4 w-4 text-brand-600 dark:text-brand-400 focus:ring-brand-500 dark:focus:ring-brand-400 border-gray-300 dark:border-gray-500 bg-white dark:bg-navy-800 rounded"
            disabled={isLoading}
          />
          <span style={{ color: isDarkMode ? '#ffffff' : '#1B254B' }} className="ml-3 text-sm font-medium text-gray-700 dark:text-white">Remember me</span>
        </label>
        
        <button
          type="button"
          onClick={onForgotPassword}
          className="text-sm text-brand-600 dark:text-brand-400 hover:text-brand-800 dark:hover:text-brand-300 font-semibold transition-colors"
          disabled={isLoading}
        >
          Forgot password?
        </button>
      </div>

      <button
        type="submit"
        disabled={isLoading || Object.keys(fieldErrors).length > 0}
        className="linear mt-2 w-full rounded-xl bg-brand-500 py-3 text-base font-medium text-white transition duration-200 hover:bg-brand-600 active:bg-brand-700 dark:bg-brand-400 dark:text-white dark:hover:bg-brand-300 dark:active:bg-brand-200 disabled:opacity-50 disabled:cursor-not-allowed"
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