import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Moon, Sun } from 'lucide-react';
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
  const [isDarkMode, setIsDarkMode] = useState(false);
  
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

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };


  return (
    <div className={`min-h-screen flex ${isDarkMode ? 'dark bg-navy-900' : 'bg-white'}`}>
      {/* Dark Mode Toggle - Fixed position */}
      <button
        onClick={toggleDarkMode}
        className={`fixed top-6 right-6 z-50 p-3 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 ${
          isDarkMode 
            ? 'bg-navy-800/80 backdrop-blur-sm border border-white/20 hover:bg-navy-700/80' 
            : 'bg-white/80 backdrop-blur-sm border border-gray-200 hover:bg-white'
        }`}
      >
        {isDarkMode ? (
          <Sun className="w-5 h-5 text-yellow-400 transition-colors" />
        ) : (
          <Moon className="w-5 h-5 text-gray-700 transition-colors" />
        )}
      </button>

      {/* Left Side - Journey Section with animations */}
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

          {/* Journey Steps with colorful icons */}
          <div className="space-y-6">
            {[
              { icon: "💰", title: "Budgeting Basics", description: "Master the fundamentals of personal finance", color: "#e8f5e9", delay: 0.2 },
              { icon: "📈", title: "Investment Growth", description: "Learn to grow your wealth over time", color: "#e3f2fd", delay: 0.4 },
              { icon: "🏆", title: "Financial Freedom", description: "Achieve your financial goals", color: "#fff3e0", delay: 0.6 }
            ].map((step, index) => (
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
      <div className={`flex-1 flex items-center justify-center px-4 py-12 transition-all duration-500 ${
        isDarkMode ? 'bg-navy-900' : 'bg-white'
      }`}>
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mt-[10vh] w-full max-w-full flex-col items-center md:pl-4 lg:pl-0 xl:max-w-[420px]">
            {authMode === 'signin' ? (
              <>
                <h4 className={`mb-2.5 text-4xl font-bold transition-colors ${
                  isDarkMode ? 'text-white' : 'text-navy-700'
                }`}>
                  Sign In
                </h4>
                <p className={`mb-9 ml-1 text-base transition-colors ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Enter your email and password to sign in!
                </p>
              </>
            ) : (
              <>
                <h4 className={`mb-2.5 text-4xl font-bold transition-colors ${
                  isDarkMode ? 'text-white' : 'text-navy-700'
                }`}>
                  Sign Up
                </h4>
                <p className={`mb-9 ml-1 text-base transition-colors ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Enter your information to create an account!
                </p>
              </>
            )}

            {authMode === 'signin' ? (
              <SignInForm
                onSubmit={handleSignIn}
                isLoading={isLoading}
                error={error}
                onForgotPassword={handleForgotPassword}
                isDarkMode={isDarkMode}
              />
            ) : (
              <SignUpForm
                onSubmit={handleSignUp}
                isLoading={isLoading}
                error={error}
                isDarkMode={isDarkMode}
              />
            )}

            <div className="mt-4">
              {authMode === 'signin' ? (
                <>
                  <span className={`text-sm font-medium transition-colors ${
                    isDarkMode ? 'text-gray-400' : 'text-navy-700'
                  }`}>
                    Not registered yet?
                  </span>
                  <button
                    onClick={() => handleModeSwitch('signup')}
                    className={`ml-1 text-sm font-medium transition-colors ${
                      isDarkMode 
                        ? 'text-white hover:text-gray-200' 
                        : 'text-brand-500 hover:text-brand-600'
                    }`}
                    disabled={isLoading}
                  >
                    Create an account
                  </button>
                </>
              ) : (
                <>
                  <span className={`text-sm font-medium transition-colors ${
                    isDarkMode ? 'text-gray-400' : 'text-navy-700'
                  }`}>
                    Already have an account?
                  </span>
                  <button
                    onClick={() => handleModeSwitch('signin')}
                    className={`ml-1 text-sm font-medium transition-colors ${
                      isDarkMode 
                        ? 'text-white hover:text-gray-200' 
                        : 'text-brand-500 hover:text-brand-600'
                    }`}
                    disabled={isLoading}
                  >
                    Sign in here
                  </button>
                </>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      <ForgotPasswordModal
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
      />
    </div>
  );
};