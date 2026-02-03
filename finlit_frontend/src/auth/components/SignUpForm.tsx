import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Mail, Lock, AlertCircle, CheckCircle, Users, Shield, User } from 'lucide-react';
import { useFormValidation } from '../hooks/useFormValidation';
import type { SignUpRequest, PasswordStrength, CodeValidation } from '../types/auth.types';
import { AuthService } from '../services/auth.service';

interface SignUpFormProps {
  onSubmit: (userData: SignUpRequest) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  isDarkMode: boolean;
}

export const SignUpForm: React.FC<SignUpFormProps> = ({
  onSubmit,
  isLoading,
  error,
  isDarkMode,
}) => {
  const [formData, setFormData] = useState({
    email: '',
    displayName: '',
    password: '',
    confirmPassword: '',
    classCode: '',
    acceptedTerms: false,
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength | null>(null);
  const [codeValidation, setCodeValidation] = useState<{
    isValidating: boolean;
    result: CodeValidation | null;
  }>({
    isValidating: false,
    result: null,
  });

  const {
    validateEmail,
    validatePassword,
    getPasswordStrength,
    validateConfirmPassword,
    validateOrganizationCode
  } = useFormValidation();

  useEffect(() => {
    if (formData.password) {
      setPasswordStrength(getPasswordStrength(formData.password));
    } else {
      setPasswordStrength(null);
    }
  }, [formData.password, getPasswordStrength]);


  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    if (touched[field]) {
      validateField(field, value);
    }
  };

  const validateField = (field: string, value: string | boolean) => {
    const errors = { ...fieldErrors };

    switch (field) {
      case 'email':
        const emailError = validateEmail(value as string);
        if (emailError) {
          errors.email = emailError;
        } else {
          delete errors.email;
        }
        break;

      case 'displayName':
        if (!(value as string).trim()) {
          errors.displayName = 'Display name is required';
        } else if ((value as string).length < 2) {
          errors.displayName = 'Display name must be at least 2 characters';
        } else {
          delete errors.displayName;
        }
        break;

      case 'password':
        const passwordError = validatePassword(value as string);
        if (passwordError) {
          errors.password = passwordError;
        } else {
          delete errors.password;
        }

        if (formData.confirmPassword && touched.confirmPassword) {
          const confirmError = validateConfirmPassword(value as string, formData.confirmPassword);
          if (confirmError) {
            errors.confirmPassword = confirmError;
          } else {
            delete errors.confirmPassword;
          }
        }
        break;

      case 'confirmPassword':
        const confirmError = validateConfirmPassword(formData.password, value as string);
        if (confirmError) {
          errors.confirmPassword = confirmError;
        } else {
          delete errors.confirmPassword;
        }
        break;

      case 'classCode':
        const codeError = validateOrganizationCode(value as string);
        if (codeError) {
          errors.classCode = codeError;
        } else {
          delete errors.classCode;
        }
        break;
    }

    setFieldErrors(errors);
  };

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateField(field, formData[field as keyof typeof formData]);
  };

  const getPasswordStrengthColor = (score: number) => {
    if (score < 2) return 'bg-red-500';
    if (score < 4) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = (score: number) => {
    if (score < 2) return 'Weak';
    if (score < 4) return 'Medium';
    return 'Strong';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors: Record<string, string> = {};

    const emailError = validateEmail(formData.email);
    if (emailError) errors.email = emailError;

    if (!formData.displayName.trim()) {
      errors.displayName = 'Display name is required';
    }

    const passwordError = validatePassword(formData.password);
    if (passwordError) errors.password = passwordError;

    const confirmError = validateConfirmPassword(formData.password, formData.confirmPassword);
    if (confirmError) errors.confirmPassword = confirmError;

    const codeError = validateOrganizationCode(formData.classCode);
    if (codeError) errors.classCode = codeError;

    if (!formData.acceptedTerms) {
      errors.acceptedTerms = 'You must accept the terms and conditions';
    }

    setFieldErrors(errors);
    setTouched({
      email: true,
      displayName: true,
      password: true,
      confirmPassword: true,
      classCode: true,
      acceptedTerms: true,
    });

    // Only proceed if no validation errors so far
    if (Object.keys(errors).length > 0) {
      return;
    }

    // Validate class code with the server on submit
    setCodeValidation({ isValidating: true, result: null });
    try {
      const result = await AuthService.validateClassCode(formData.classCode);
      setCodeValidation({ isValidating: false, result });

      if (!result.valid) {
        setFieldErrors(prev => ({
          ...prev,
          classCode: 'Invalid class code. Please check with your instructor.',
        }));
        return;
      }

      // All validations passed, submit the form
      await onSubmit({
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        displayName: formData.displayName,
        classCode: formData.classCode,
        acceptedTerms: formData.acceptedTerms,
      });
    } catch (error) {
      console.error('[SignUpForm] Class code validation error:', error);
      setCodeValidation({ isValidating: false, result: { valid: false } });
      setFieldErrors(prev => ({
        ...prev,
        classCode: 'Unable to verify class code. Please try again.',
      }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="text-red-500" size={20} />
          <span className="text-red-700 dark:text-red-300 text-sm">{error}</span>
        </div>
      )}

      <div>
        <label htmlFor="email" style={{ color: isDarkMode ? '#ffffff' : '#1B254B' }} className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
          Email Address
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
          <input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            onBlur={() => handleBlur('email')}
            style={{ backgroundColor: isDarkMode ? '#111c44' : 'white', color: isDarkMode ? '#ffffff' : '#1B254B' }}
            className={`w-full pl-10 pr-4 py-3 border rounded-xl bg-white dark:bg-navy-800 focus:ring-2 focus:ring-brand-100 dark:focus:ring-brand-900/30 focus:border-brand-500 dark:focus:border-brand-400 outline-none transition-all duration-200 text-navy-700 dark:text-white ${
              fieldErrors.email ? 'border-red-300 !bg-red-50 dark:!bg-red-900/20 dark:border-red-600' : 'border-gray-200 dark:border-gray-600'
            }`}
            placeholder="Enter your email"
            disabled={isLoading}
          />
        </div>
        {fieldErrors.email && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{fieldErrors.email}</p>
        )}
      </div>

      <div>
        <label htmlFor="displayName" style={{ color: isDarkMode ? '#ffffff' : '#1B254B' }} className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
          Display Name
        </label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
          <input
            id="displayName"
            type="text"
            value={formData.displayName}
            onChange={(e) => handleInputChange('displayName', e.target.value)}
            onBlur={() => handleBlur('displayName')}
            style={{ backgroundColor: isDarkMode ? '#111c44' : 'white', color: isDarkMode ? '#ffffff' : '#1B254B' }}
            className={`w-full pl-10 pr-4 py-3 border rounded-xl bg-white dark:bg-navy-800 focus:ring-2 focus:ring-brand-100 dark:focus:ring-brand-900/30 focus:border-brand-500 dark:focus:border-brand-400 outline-none transition-all duration-200 text-navy-700 dark:text-white ${
              fieldErrors.displayName ? 'border-red-300 !bg-red-50 dark:!bg-red-900/20 dark:border-red-600' : 'border-gray-200 dark:border-gray-600'
            }`}
            placeholder="Enter your name"
            disabled={isLoading}
          />
        </div>
        {fieldErrors.displayName && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{fieldErrors.displayName}</p>
        )}
      </div>

      <div>
        <label htmlFor="classCode" style={{ color: isDarkMode ? '#ffffff' : '#1B254B' }} className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
          Class Code
        </label>
        <div className="relative">
          <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
          <input
            id="classCode"
            type="text"
            value={formData.classCode}
            onChange={(e) => handleInputChange('classCode', e.target.value.toUpperCase())}
            onBlur={() => handleBlur('classCode')}
            style={{ backgroundColor: isDarkMode ? '#111c44' : 'white', color: isDarkMode ? '#ffffff' : '#1B254B' }}
            className={`w-full pl-10 pr-4 py-3 border rounded-xl bg-white dark:bg-navy-800 focus:ring-2 focus:ring-brand-100 dark:focus:ring-brand-900/30 focus:border-brand-500 dark:focus:border-brand-400 outline-none transition-all duration-200 text-navy-700 dark:text-white ${
              fieldErrors.classCode ? 'border-red-300 !bg-red-50 dark:!bg-red-900/20 dark:border-red-600' : 'border-gray-200 dark:border-gray-600'
            }`}
            placeholder="Enter class code from instructor"
            disabled={isLoading}
          />
        </div>
        {fieldErrors.classCode && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{fieldErrors.classCode}</p>
        )}
      </div>

      <div>
        <label htmlFor="password" style={{ color: isDarkMode ? '#ffffff' : '#1B254B' }} className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
          Password
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            onBlur={() => handleBlur('password')}
            style={{ backgroundColor: isDarkMode ? '#111c44' : 'white', color: isDarkMode ? '#ffffff' : '#1B254B' }}
            className={`w-full pl-10 pr-12 py-3 border rounded-xl bg-white dark:bg-navy-800 focus:ring-2 focus:ring-brand-100 dark:focus:ring-brand-900/30 focus:border-brand-500 dark:focus:border-brand-400 outline-none transition-all duration-200 text-navy-700 dark:text-white ${
              fieldErrors.password ? 'border-red-300 !bg-red-50 dark:!bg-red-900/20 dark:border-red-600' : 'border-gray-200 dark:border-gray-600'
            }`}
            placeholder="Create a password"
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
            disabled={isLoading}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        {passwordStrength && formData.password && (
          <div className="mt-2 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-300">Password strength:</span>
              <span className={`font-medium ${
                passwordStrength.score < 2 ? 'text-red-600 dark:text-red-400' :
                passwordStrength.score < 4 ? 'text-yellow-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400'
              }`}>
                {getPasswordStrengthText(passwordStrength.score)}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor(passwordStrength.score)}`}
                style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
              ></div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className={`flex items-center gap-1 ${passwordStrength.hasUppercase ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'}`}>
                <CheckCircle size={12} />
                Uppercase letter
              </div>
              <div className={`flex items-center gap-1 ${passwordStrength.hasLowercase ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'}`}>
                <CheckCircle size={12} />
                Lowercase letter
              </div>
              <div className={`flex items-center gap-1 ${passwordStrength.hasNumber ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'}`}>
                <CheckCircle size={12} />
                Number
              </div>
              <div className={`flex items-center gap-1 ${passwordStrength.hasSpecialChar ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'}`}>
                <CheckCircle size={12} />
                Special character
              </div>
              <div className={`flex items-center gap-1 ${passwordStrength.isMinLength ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'}`}>
                <CheckCircle size={12} />
                8+ characters
              </div>
            </div>
          </div>
        )}

        {fieldErrors.password && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{fieldErrors.password}</p>
        )}
      </div>

      <div>
        <label htmlFor="confirmPassword" style={{ color: isDarkMode ? '#ffffff' : '#1B254B' }} className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
          Confirm Password
        </label>
        <div className="relative">
          <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
          <input
            id="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            value={formData.confirmPassword}
            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
            onBlur={() => handleBlur('confirmPassword')}
            style={{ backgroundColor: isDarkMode ? '#111c44' : 'white', color: isDarkMode ? '#ffffff' : '#1B254B' }}
            className={`w-full pl-10 pr-12 py-3 border rounded-xl bg-white dark:bg-navy-800 focus:ring-2 focus:ring-brand-100 dark:focus:ring-brand-900/30 focus:border-brand-500 dark:focus:border-brand-400 outline-none transition-all duration-200 text-navy-700 dark:text-white ${
              fieldErrors.confirmPassword ? 'border-red-300 !bg-red-50 dark:!bg-red-900/20 dark:border-red-600' :
              formData.confirmPassword && !fieldErrors.confirmPassword && formData.password === formData.confirmPassword ? 'border-green-300 !bg-green-50 dark:!bg-green-900/20 dark:border-green-600' :
              'border-gray-200 dark:border-gray-600'
            }`}
            placeholder="Confirm your password"
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
            disabled={isLoading}
          >
            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        {fieldErrors.confirmPassword && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{fieldErrors.confirmPassword}</p>
        )}
      </div>

      <div>
        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={formData.acceptedTerms}
            onChange={(e) => handleInputChange('acceptedTerms', e.target.checked)}
            className="h-4 w-4 text-brand-600 dark:text-brand-400 focus:ring-brand-500 dark:focus:ring-brand-400 border-gray-300 dark:border-gray-500 dark:bg-navy-800 rounded mt-0.5"
            disabled={isLoading}
          />
          <span style={{ color: isDarkMode ? '#ffffff' : '#1B254B' }} className="text-sm text-gray-600 dark:text-gray-300">
            I agree to the{' '}
            <a href="/terms" className="text-brand-600 dark:text-brand-400 hover:text-brand-800 dark:hover:text-brand-300 font-medium">
              Terms and Conditions
            </a>{' '}
            and{' '}
            <a href="/privacy" className="text-brand-600 dark:text-brand-400 hover:text-brand-800 dark:hover:text-brand-300 font-medium">
              Privacy Policy
            </a>
          </span>
        </label>
        {fieldErrors.acceptedTerms && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{fieldErrors.acceptedTerms}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading || codeValidation.isValidating || Object.keys(fieldErrors).length > 0 || !formData.acceptedTerms}
        className="linear mt-2 w-full rounded-xl bg-brand-500 py-3 text-base font-medium text-white transition duration-200 hover:bg-brand-600 active:bg-brand-700 dark:bg-brand-400 dark:text-white dark:hover:bg-brand-300 dark:active:bg-brand-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading || codeValidation.isValidating ? (
          <div className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            {codeValidation.isValidating ? 'Verifying class code...' : 'Creating account...'}
          </div>
        ) : (
          'Create Account'
        )}
      </button>
    </form>
  );
};
