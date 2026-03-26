import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Target, User, Settings, Bug, LogOut, Menu, X, GraduationCap, Zap, Gamepad2, BookOpen, Calculator, DollarSign, Brain, Mail, Flame, HelpCircle } from 'lucide-react';
import { useAuthContext } from '../auth/context/AuthContext';
import { useModuleScore } from '../hooks/useModuleScore';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, title }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuthContext();
  const { progress } = useModuleScore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showStreakTooltip, setShowStreakTooltip] = useState(false);
  const [showCertTooltip, setShowCertTooltip] = useState(false);

  const totalModules = 10;
  const completedModules = progress?.completedModules || 0;
  const totalXP = progress?.totalXP || 0;
  const streak = progress?.dailyStreak || 0;

  const isActivePath = (path: string) => location.pathname === path;

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 p-2 sm:p-3 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-base">
              FL
            </div>
            <h1 className="text-base sm:text-xl font-bold text-gray-900">FinLit</h1>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          {/* Certificate Icon - Hidden on mobile in header */}
          <div
            className="hidden sm:block relative cursor-pointer"
            onMouseEnter={() => setShowCertTooltip(true)}
            onMouseLeave={() => setShowCertTooltip(false)}
            onClick={() => {
              if (completedModules === totalModules) {
                navigate('/certificate');
              }
            }}
          >
            <GraduationCap
              className={`${completedModules === totalModules ? 'text-emerald-500' : 'text-yellow-500'}`}
              size={24}
            />
            {showCertTooltip && (
              <div className="absolute top-10 -left-20 bg-white p-3 rounded-lg shadow-lg text-sm w-52 z-10 border">
                <p className="font-bold mb-1">Financial Literacy Certificate</p>
                <p className="text-gray-600">
                  {completedModules === totalModules
                    ? 'Congratulations! Click to view your certificate!'
                    : `Complete ${totalModules - completedModules} more modules to unlock your certificate!`
                  }
                </p>
              </div>
            )}
          </div>

          {/* Streak Display */}
          <div
            className="flex items-center gap-1 text-base sm:text-lg relative cursor-pointer"
            onMouseEnter={() => setShowStreakTooltip(true)}
            onMouseLeave={() => setShowStreakTooltip(false)}
            onClick={() => setShowStreakTooltip(!showStreakTooltip)}
          >
            <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
            <span className="font-bold text-orange-600">{streak}</span>
            {showStreakTooltip && (
              <div className="absolute top-10 -left-12 sm:-left-16 bg-white p-3 rounded-lg shadow-lg text-sm w-40 sm:w-48 z-10 border">
                <p className="font-bold text-orange-600">Daily Login Streak</p>
                <p className="text-gray-600 mt-1">
                  {streak === 0 ? 'Start your streak today!' : `${streak} day${streak !== 1 ? 's' : ''} in a row!`}
                </p>
              </div>
            )}
          </div>

          {/* XP Display */}
          <div className="text-base sm:text-lg">
            <span className="font-bold">{totalXP}</span>
            <span className="text-gray-600 ml-1">XP</span>
          </div>

          {/* Logout Button */}
          <button
            onClick={() => signOut().then(() => navigate('/auth'))}
            className="px-2 py-1.5 sm:px-4 sm:py-2 text-gray-600 rounded-md hover:bg-gray-200 transition text-sm sm:text-lg"
          >
            <span className="hidden sm:inline">Log out</span>
            <span className="sm:hidden">⏏</span>
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className={`
          fixed lg:static inset-y-0 left-0 z-40
          bg-blue-400 w-64 text-white p-4 flex flex-col gap-3 sm:gap-4
          transform transition-transform duration-300 ease-in-out
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          mt-[57px] sm:mt-[65px] lg:mt-0
          overflow-y-auto overflow-x-hidden
          max-h-[calc(100vh-57px)] sm:max-h-[calc(100vh-65px)] lg:max-h-none
        `}>
          <button
            onClick={() => navigate('/dashboard')}
            className={`flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg text-sm sm:text-base lg:text-lg ${isActivePath('/dashboard') ? 'bg-blue-500' : 'hover:bg-blue-500'}`}
          >
            <Home size={20} className="sm:w-6 sm:h-6" />
            <span className="font-medium">Home</span>
          </button>

          <button
            onClick={() => navigate('/game')}
            className={`flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg text-sm sm:text-base lg:text-lg ${isActivePath('/game') ? 'bg-blue-500' : 'hover:bg-blue-500'}`}
          >
            <Target size={20} className="sm:w-6 sm:h-6" />
            <span className="font-medium">Learning Path</span>
          </button>

          <button
            onClick={() => navigate('/economic-quiz')}
            className={`flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg text-sm sm:text-base lg:text-lg ${isActivePath('/economic-quiz') ? 'bg-blue-500' : 'hover:bg-blue-500'}`}
          >
            <Zap size={20} className="sm:w-6 sm:h-6" />
            <span className="font-medium">Quick Quiz</span>
          </button>

          <button
            onClick={() => navigate('/games')}
            className={`flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg text-sm sm:text-base lg:text-lg ${isActivePath('/games') ? 'bg-blue-500' : 'hover:bg-blue-500'}`}
          >
            <Gamepad2 size={20} className="sm:w-6 sm:h-6" />
            <span className="font-medium">Games</span>
          </button>

          <button
            onClick={() => navigate('/case-study')}
            className={`flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg text-sm sm:text-base lg:text-lg ${isActivePath('/case-study') ? 'bg-blue-500' : 'hover:bg-blue-500'}`}
          >
            <BookOpen size={20} className="sm:w-6 sm:h-6" />
            <span className="font-medium">Case Study</span>
          </button>

          <button
            onClick={() => navigate('/financial-tools')}
            className={`flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg text-sm sm:text-base lg:text-lg ${isActivePath('/financial-tools') ? 'bg-blue-500' : 'hover:bg-blue-500'}`}
          >
            <Calculator size={20} className="sm:w-6 sm:h-6" />
            <span className="font-medium">Financial Tools</span>
          </button>

          <button
            onClick={() => navigate('/big-money-decisions')}
            className={`flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg text-sm sm:text-base lg:text-lg ${isActivePath('/big-money-decisions') ? 'bg-blue-500' : 'hover:bg-blue-500'}`}
          >
            <DollarSign size={20} className="sm:w-6 sm:h-6" />
            <span className="font-medium">Big Money Decisions</span>
          </button>

          <button
            onClick={() => navigate('/money-personality')}
            className={`flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg text-sm sm:text-base lg:text-lg ${isActivePath('/money-personality') ? 'bg-blue-500' : 'hover:bg-blue-500'}`}
          >
            <Brain size={20} className="sm:w-6 sm:h-6" />
            <span className="font-medium">Money Personality</span>
          </button>

          <button
            onClick={() => navigate('/certificate')}
            className={`flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg text-sm sm:text-base lg:text-lg ${completedModules === totalModules ? 'bg-emerald-500' : isActivePath('/certificate') ? 'bg-blue-500' : 'hover:bg-blue-500'}`}
          >
            <GraduationCap
              size={20}
              className={`sm:w-6 sm:h-6 ${completedModules === totalModules ? 'text-white' : 'text-yellow-200'}`}
            />
            <span className="font-medium">Certificate</span>
          </button>

          {/* Admin Panel - Only for admin and owner roles */}
          {(user?.role === 'admin' || user?.role === 'owner') && (
            <button
              onClick={() => navigate(user?.role === 'owner' ? '/admin-setup' : '/admin')}
              className={`flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg text-sm sm:text-base lg:text-lg bg-blue-600/50 border border-white/20 ${isActivePath('/admin') || isActivePath('/admin-setup') ? 'bg-blue-500' : 'hover:bg-blue-500'}`}
            >
              <Settings size={20} className="sm:w-6 sm:h-6" />
              <span className="font-medium">Admin Panel</span>
            </button>
          )}

          {/* Contact Us Link */}
          <button
            onClick={() => navigate('/contact')}
            className={`flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg text-sm sm:text-base lg:text-lg ${isActivePath('/contact') ? 'bg-blue-500' : 'hover:bg-blue-500'}`}
          >
            <Mail size={20} className="sm:w-6 sm:h-6" />
            <span className="font-medium">Contact Us</span>
          </button>

          {/* Bug Report Link */}
          <button
            onClick={() => navigate('/bug-report')}
            className={`flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg text-sm sm:text-base lg:text-lg ${isActivePath('/bug-report') ? 'bg-blue-500' : 'hover:bg-blue-500'}`}
          >
            <Bug size={20} className="sm:w-6 sm:h-6" />
            <span className="font-medium">Report Bug</span>
          </button>

          {/* Logout Button - Mobile sidebar */}
          <button
            onClick={() => signOut().then(() => navigate('/auth'))}
            className="lg:hidden flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 hover:bg-red-500/80 rounded-lg text-sm sm:text-base mt-auto bg-red-500/60 border border-red-300/50"
          >
            <LogOut size={20} className="sm:w-6 sm:h-6" />
            <span className="font-medium">Log out</span>
          </button>
        </div>

        {/* Mobile Overlay */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            style={{ top: '57px' }}
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Main content */}
        <div className="flex-1 p-2 sm:p-3 md:p-4 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
