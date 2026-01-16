import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Mail, Lock, AlertCircle, CheckCircle, Users, Shield, User } from 'lucide-react';
import { useFormValidation } from '../hooks/useFormValidation';
import type { SignUpRequest, PasswordStrength, CodeValidation } from '../types/auth.types';
import { AuthService } from '../services/auth.service';

interface SignUpFormProps {
  onSubmit: (userData: SignUpRequest) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export const SignUpForm: React.FC<SignUpFormProps> = ({
  onSubmit,
  isLoading,
  error,
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
        <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-center gap-3">
          <AlertCircle className="text-red-500" size={20} />
          <span className="text-red-700 text-sm">{error}</span>
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
          Email Address
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            onBlur={() => handleBlur('email')}
            className={`w-full pl-10 pr-4 py-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
              fieldErrors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
            placeholder="Enter your email"
            disabled={isLoading}
          />
        </div>
        {fieldErrors.email && (
          <p className="mt-1 text-sm text-red-600">{fieldErrors.email}</p>
        )}
      </div>

      <div>
        <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-2">
          Display Name
        </label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            id="displayName"
            type="text"
            value={formData.displayName}
            onChange={(e) => handleInputChange('displayName', e.target.value)}
            onBlur={() => handleBlur('displayName')}
            className={`w-full pl-10 pr-4 py-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
              fieldErrors.displayName ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
            placeholder="Enter your name"
            disabled={isLoading}
          />
        </div>
        {fieldErrors.displayName && (
          <p className="mt-1 text-sm text-red-600">{fieldErrors.displayName}</p>
        )}
      </div>

      <div>
        <label htmlFor="classCode" className="block text-sm font-medium text-gray-700 mb-2">
          Class Code
        </label>
        <div className="relative">
          <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            id="classCode"
            type="text"
            value={formData.classCode}
            onChange={(e) => handleInputChange('classCode', e.target.value.toUpperCase())}
            onBlur={() => handleBlur('classCode')}
            className={`w-full pl-10 pr-4 py-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
              fieldErrors.classCode ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
            placeholder="Enter class code from instructor"
            disabled={isLoading}
          />
        </div>
        {fieldErrors.classCode && (
          <p className="mt-1 text-sm text-red-600">{fieldErrors.classCode}</p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
          Password
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            onBlur={() => handleBlur('password')}
            className={`w-full pl-10 pr-12 py-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
              fieldErrors.password ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
            placeholder="Create a password"
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            disabled={isLoading}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        {passwordStrength && formData.password && (
          <div className="mt-2 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Password strength:</span>
              <span className={`font-medium ${
                passwordStrength.score < 2 ? 'text-red-600' :
                passwordStrength.score < 4 ? 'text-yellow-600' : 'text-green-600'
              }`}>
                {getPasswordStrengthText(passwordStrength.score)}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor(passwordStrength.score)}`}
                style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
              ></div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className={`flex items-center gap-1 ${passwordStrength.hasUppercase ? 'text-green-600' : 'text-gray-400'}`}>
                <CheckCircle size={12} />
                Uppercase letter
              </div>
              <div className={`flex items-center gap-1 ${passwordStrength.hasLowercase ? 'text-green-600' : 'text-gray-400'}`}>
                <CheckCircle size={12} />
                Lowercase letter
              </div>
              <div className={`flex items-center gap-1 ${passwordStrength.hasNumber ? 'text-green-600' : 'text-gray-400'}`}>
                <CheckCircle size={12} />
                Number
              </div>
              <div className={`flex items-center gap-1 ${passwordStrength.hasSpecialChar ? 'text-green-600' : 'text-gray-400'}`}>
                <CheckCircle size={12} />
                Special character
              </div>
              <div className={`flex items-center gap-1 ${passwordStrength.isMinLength ? 'text-green-600' : 'text-gray-400'}`}>
                <CheckCircle size={12} />
                8+ characters
              </div>
            </div>
          </div>
        )}

        {fieldErrors.password && (
          <p className="mt-1 text-sm text-red-600">{fieldErrors.password}</p>
        )}
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
          Confirm Password
        </label>
        <div className="relative">
          <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            id="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            value={formData.confirmPassword}
            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
            onBlur={() => handleBlur('confirmPassword')}
            className={`w-full pl-10 pr-12 py-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
              fieldErrors.confirmPassword ? 'border-red-300 bg-red-50' :
              formData.confirmPassword && !fieldErrors.confirmPassword && formData.password === formData.confirmPassword ? 'border-green-300 bg-green-50' :
              'border-gray-300'
            }`}
            placeholder="Confirm your password"
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            disabled={isLoading}
          >
            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        {fieldErrors.confirmPassword && (
          <p className="mt-1 text-sm text-red-600">{fieldErrors.confirmPassword}</p>
        )}
      </div>

      <div>
        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={formData.acceptedTerms}
            onChange={(e) => handleInputChange('acceptedTerms', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-0.5"
            disabled={isLoading}
          />
          <span className="text-sm text-gray-600">
            I agree to the{' '}
            <a href="/terms" className="text-blue-600 hover:text-blue-800 font-medium">
              Terms and Conditions
            </a>{' '}
            and{' '}
            <a href="/privacy" className="text-blue-600 hover:text-blue-800 font-medium">
              Privacy Policy
            </a>
          </span>
        </label>
        {fieldErrors.acceptedTerms && (
          <p className="mt-1 text-sm text-red-600">{fieldErrors.acceptedTerms}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading || codeValidation.isValidating || Object.keys(fieldErrors).length > 0 || !formData.acceptedTerms}
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
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
