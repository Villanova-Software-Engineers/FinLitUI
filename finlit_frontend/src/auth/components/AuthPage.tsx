import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { BookOpen, UserPlus, LogIn, Sparkles } from 'lucide-react';
import { SignInForm } from './SignInForm';
import { SignUpForm } from './SignUpForm';
import { ForgotPasswordModal } from './ForgotPasswordModal';
import { useAuth } from '../hooks/useAuth';
import type { AuthMode, SignInRequest, SignUpRequest } from '../types/auth.types';

// Note: navigation is handled in useAuth hook after successful login/signup

const MovingFinanceKeywords: React.FC = () => {
  const keywords = [
    "Budgeting", "Investing", "Savings", "Credit Score", "Compound Interest",
    "Diversification", "Emergency Fund", "Asset Allocation", "ROI", "Inflation",
    "Net Worth", "Portfolio", "Risk Management", "Financial Planning", "Retirement"
  ];

  return (
    <div className="bg-white/10 rounded-xl p-6 backdrop-blur-md border border-white/30 overflow-hidden shadow-xl">
      <div className="relative">
        <motion.div
          className="flex space-x-8 text-white"
          animate={{ x: [0, -200] }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 20,
              ease: "linear",
            },
          }}
        >
          {[...keywords, ...keywords].map((keyword, index) => (
            <span
              key={index}
              className="text-yellow-300 font-medium whitespace-nowrap text-lg"
            >
              {keyword}
            </span>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export const AuthPage: React.FC = () => {
  const [authMode, setAuthMode] = useState<AuthMode>('signin');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  
  const { signIn, signUp, isLoading, error, clearError, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // Redirect authenticated users to appropriate dashboard
  React.useEffect(() => {
    if (isAuthenticated && user && !isLoading) {
      if (user.role === 'owner') {
        navigate('/admin-setup', { replace: true });
      } else if (user.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, user, isLoading, navigate]);

  const handleSignIn = async (credentials: SignInRequest) => {
    clearError();
    await signIn(credentials);
    // Navigation is handled in useAuth hook
  };

  const handleSignUp = async (userData: SignUpRequest) => {
    clearError();
    await signUp(userData);
    // Navigation is handled in useAuth hook
  };

  const handleModeSwitch = (mode: AuthMode) => {
    setAuthMode(mode);
    clearError();
  };

  const handleForgotPassword = () => {
    setShowForgotPassword(true);
  };

  const journeySteps = [
    {
      icon: "💰",
      title: "Budgeting Basics",
      description: "Master the fundamentals of personal finance",
      color: "#e8f5e9",
      delay: 0.2
    },
    {
      icon: "📈",
      title: "Investment Growth",
      description: "Learn to grow your wealth over time",
      color: "#e3f2fd",
      delay: 0.4
    },
    {
      icon: "🏆",
      title: "Financial Freedom",
      description: "Achieve your financial goals",
      color: "#fff3e0",
      delay: 0.6
    }
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Journey Section */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-emerald-400 via-blue-500 to-blue-600 relative overflow-hidden">
        <div className="relative z-10 flex flex-col justify-center px-8 py-8 text-gray-900 min-h-screen w-full">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-12"
          >
            <motion.div
              className="flex items-center gap-3 mb-6"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-lg">
                <BookOpen className="text-blue-600" size={24} />
              </div>
              <span className="text-xl font-bold text-white">FinLit</span>
            </motion.div>
            
            <motion.h1
              className="text-5xl font-bold mb-6 leading-tight text-white"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              Your Financial
              <br />
              <span className="text-yellow-300">
                Journey Starts Here
              </span>
            </motion.h1>
            
            <motion.p
              className="text-xl text-white leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              Transform your relationship with money through interactive learning, 
              gamified challenges, and personalized financial guidance.
            </motion.p>
          </motion.div>

          {/* Journey Steps */}
          <div className="space-y-6">
            {journeySteps.map((step, index) => (
              <motion.div
                key={index}
                className="flex items-center gap-4 p-4 rounded-lg"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: step.delay }}
                whileHover={{ scale: 1.02 }}
              >
                <motion.div
                  className="w-16 h-16 rounded-lg flex items-center justify-center text-2xl"
                  style={{ backgroundColor: step.color }}
                  whileHover={{ rotate: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  {step.icon}
                </motion.div>
                <div>
                  <h3 className="font-semibold text-lg text-white">{step.title}</h3>
                  <p className="text-white text-sm">{step.description}</p>
                </div>
                <motion.div
                  className="ml-auto"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="text-yellow-300" size={20} />
                </motion.div>
              </motion.div>
            ))}
          </div>

          {/* Finance Concepts Slider */}
          <motion.div
            className="mt-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
          >
            <MovingFinanceKeywords />
          </motion.div>
        </div>
      </div>

      {/* Right Side - Auth Section */}
      <div className="flex-1 flex items-center justify-center px-4 py-12 bg-gradient-to-br from-gray-50 to-white">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="p-8">
              <div className="text-center mb-8">
                <motion.div
                  className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4 shadow-lg"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <BookOpen className="text-white" size={28} />
                </motion.div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Welcome Back
                </h1>
                <p className="text-gray-600">
                  {authMode === 'signin' 
                    ? 'Continue your financial journey' 
                    : 'Start your path to financial freedom'
                  }
                </p>
              </div>

              <div className="mb-6">
                <div className="flex rounded-xl bg-gray-100 p-1">
                  <motion.button
                    onClick={() => handleModeSwitch('signin')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-medium transition-all ${
                      authMode === 'signin'
                        ? 'bg-white text-gray-900 shadow-md'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                    disabled={isLoading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <LogIn size={16} />
                    Sign In
                  </motion.button>
                  <motion.button
                    onClick={() => handleModeSwitch('signup')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-medium transition-all ${
                      authMode === 'signup'
                        ? 'bg-white text-gray-900 shadow-md'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                    disabled={isLoading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <UserPlus size={16} />
                    Sign Up
                  </motion.button>
                </div>
              </div>

              <motion.div
                key={authMode}
                initial={{ opacity: 0, x: authMode === 'signin' ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                {authMode === 'signin' ? (
                  <SignInForm
                    onSubmit={handleSignIn}
                    isLoading={isLoading}
                    error={error}
                    onForgotPassword={handleForgotPassword}
                  />
                ) : (
                  <SignUpForm
                    onSubmit={handleSignUp}
                    isLoading={isLoading}
                    error={error}
                  />
                )}
              </motion.div>

              <div className="mt-6 text-center text-sm text-gray-600">
                {authMode === 'signin' ? (
                  <span>
                    New to FinLit?{' '}
                    <button
                      onClick={() => handleModeSwitch('signup')}
                      className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
                      disabled={isLoading}
                    >
                      Create an account
                    </button>
                  </span>
                ) : (
                  <span>
                    Already have an account?{' '}
                    <button
                      onClick={() => handleModeSwitch('signin')}
                      className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
                      disabled={isLoading}
                    >
                      Sign in here
                    </button>
                  </span>
                )}
              </div>
            </div>

            {/* Bottom gradient bar */}
            <div className="h-2 bg-gradient-to-r from-emerald-400 via-blue-500 to-blue-600"></div>
          </motion.div>

          <motion.div
            className="mt-8 text-center text-sm text-gray-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <p>© 2026 FinLit. All rights reserved.</p>
            <div className="mt-2 space-x-4">
              <a href="/privacy" className="hover:text-gray-700 transition-colors">Privacy Policy</a>
              <a href="/terms" className="hover:text-gray-700 transition-colors">Terms of Service</a>
              <a href="/support" className="hover:text-gray-700 transition-colors">Support</a>
            </div>
          </motion.div>
        </motion.div>
      </div>

      <ForgotPasswordModal
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
      />
    </div>
  );
};