import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Target, User, Settings, Bug, LogOut, Menu, X, GraduationCap, Zap, Gamepad2, BookOpen, Calculator, DollarSign, Brain, Mail, Flame, HelpCircle, Trophy } from 'lucide-react';
import { useAuthContext } from '../auth/context/AuthContext';
import { useModuleScore } from '../hooks/useModuleScore';
import HowToPlayModal from './HowToPlayModal';

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
  const [showHowToPlayModal, setShowHowToPlayModal] = useState(false);

  const totalModules = 10;
  const completedModules = progress?.moduleScores?.filter(m => m.passed).length || 0;
  const totalXP = progress?.totalXP || 0;
  const streak = progress?.streak || 0;

  const isActivePath = (path: string) => location.pathname === path;

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Guide Steps for How to Play Modal
  const GUIDE_STEPS = [
    {
      icon: Target,
      title: "Complete Learning Path",
      description: "Master all 10 financial modules to build your knowledge",
      color: "from-blue-500 to-indigo-600",
      bgColor: "bg-blue-50",
      route: "/game"
    },
    {
      icon: Zap,
      title: "Play Daily Quiz",
      description: "Answer daily challenges to earn XP",
      color: "from-amber-500 to-orange-600",
      bgColor: "bg-amber-50",
      route: null
    },
    {
      icon: Brain,
      title: "Solve Crossword",
      description: "Test your financial vocabulary with interactive puzzles",
      color: "from-emerald-500 to-teal-600",
      bgColor: "bg-emerald-50",
      route: null
    },
    {
      icon: Trophy,
      title: "Earn Certificate",
      description: "Complete all modules to unlock your achievement certificate",
      color: "from-purple-500 to-pink-600",
      bgColor: "bg-purple-50",
      route: "/certificate"
    }
  ];

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-blue-100 p-3 sm:p-4 flex justify-between items-center border-b border-blue-200 flex-shrink-0">
        <div className="flex items-center gap-2">
          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 hover:bg-blue-200 rounded-lg transition-colors"
          >
            {mobileMenuOpen ? <X size={24} className="text-blue-700" /> : <Menu size={24} className="text-blue-700" />}
          </button>

          <img
            src="/veo5.png"
            alt="FinLit Logo"
            className="h-8 sm:h-10 w-auto object-contain"
            style={{
              mixBlendMode: 'darken',
              filter: 'brightness(1.1) contrast(1.2)'
            }}
          />
        </div>

        <div className="flex items-center gap-2 sm:gap-4 md:gap-6">
          {/* User Info - Hidden on small mobile, shown on larger screens */}
          <div className="hidden sm:flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm sm:text-lg font-bold">
                {user?.displayName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <span className="hidden md:inline text-blue-800 font-semibold text-base sm:text-lg truncate max-w-[120px] lg:max-w-none">
                {user?.displayName || user?.email}
              </span>
            </div>

            {/* How to Play Button - Desktop */}
            <button
              onClick={() => setShowHowToPlayModal(true)}
              className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-blue-200 transition-colors text-blue-800 hover:text-blue-900 font-medium"
              title="How to Play"
            >
              <HelpCircle size={18} />
              <span className="hidden md:inline text-sm">How to Play</span>
            </button>
          </div>

          {/* How to Play Button - Mobile only */}
          <button
            onClick={() => setShowHowToPlayModal(true)}
            className="sm:hidden p-2 rounded-lg hover:bg-blue-200 transition-colors text-blue-700"
            title="How to Play"
          >
            <HelpCircle size={20} />
          </button>

          {/* Certificate Icon - Hidden on mobile in header, shown in sidebar */}
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

          {/* Logout Button - Icon only on mobile */}
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
            className={`flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg text-sm sm:text-base ${isActivePath('/dashboard') ? 'bg-blue-500' : 'hover:bg-blue-500'}`}
          >
            <Home size={20} className="sm:w-6 sm:h-6" />
            <span className="font-medium">Home</span>
          </button>

          <button
            onClick={() => navigate('/game')}
            className={`flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg text-sm sm:text-base ${isActivePath('/game') ? 'bg-blue-500' : 'hover:bg-blue-500'}`}
          >
            <Target size={20} className="sm:w-6 sm:h-6" />
            <span className="font-medium">Learning Path</span>
          </button>

          <button
            onClick={() => navigate('/economic-quiz')}
            className={`flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg text-sm sm:text-base ${isActivePath('/economic-quiz') ? 'bg-blue-500' : 'hover:bg-blue-500'}`}
          >
            <Zap size={20} className="sm:w-6 sm:h-6" />
            <span className="font-medium">Quick Quiz</span>
          </button>

          <button
            onClick={() => navigate('/games')}
            className={`flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg text-sm sm:text-base ${isActivePath('/games') ? 'bg-blue-500' : 'hover:bg-blue-500'}`}
          >
            <Gamepad2 size={20} className="sm:w-6 sm:h-6" />
            <span className="font-medium">Games</span>
          </button>

          <button
            onClick={() => navigate('/case-study')}
            className={`flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg text-sm sm:text-base ${isActivePath('/case-study') ? 'bg-blue-500' : 'hover:bg-blue-500'}`}
          >
            <BookOpen size={20} className="sm:w-6 sm:h-6" />
            <span className="font-medium">Case Study</span>
          </button>

          <button
            onClick={() => navigate('/financial-tools')}
            className={`flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg text-sm sm:text-base ${isActivePath('/financial-tools') ? 'bg-blue-500' : 'hover:bg-blue-500'}`}
          >
            <Calculator size={20} className="sm:w-6 sm:h-6" />
            <span className="font-medium">Financial Tools</span>
          </button>

          <button
            onClick={() => navigate('/big-money-decisions')}
            className={`flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg text-sm sm:text-base ${isActivePath('/big-money-decisions') ? 'bg-blue-500' : 'hover:bg-blue-500'}`}
          >
            <DollarSign size={20} className="sm:w-6 sm:h-6" />
            <span className="font-medium">Money Decisions</span>
          </button>

          <button
            onClick={() => navigate('/money-personality')}
            className={`flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg text-sm sm:text-base ${isActivePath('/money-personality') ? 'bg-blue-500' : 'hover:bg-blue-500'}`}
          >
            <Brain size={20} className="sm:w-6 sm:h-6" />
            <span className="font-medium">Money Personality</span>
          </button>

          <button
            onClick={() => navigate('/certificate')}
            className={`flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg text-sm sm:text-base ${completedModules === totalModules ? 'bg-emerald-500' : isActivePath('/certificate') ? 'bg-blue-500' : 'hover:bg-blue-500'}`}
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
              className={`flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg text-sm sm:text-base bg-blue-600/50 border border-white/20 ${isActivePath('/admin') || isActivePath('/admin-setup') ? 'bg-blue-500' : 'hover:bg-blue-500'}`}
            >
              <Settings size={20} className="sm:w-6 sm:h-6" />
              <span className="font-medium">Admin Panel</span>
            </button>
          )}

          {/* Contact Us Link */}
          <button
            onClick={() => navigate('/contact')}
            className={`flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg text-sm sm:text-base ${isActivePath('/contact') ? 'bg-blue-500' : 'hover:bg-blue-500'}`}
          >
            <Mail size={20} className="sm:w-6 sm:h-6" />
            <span className="font-medium">Contact Us</span>
          </button>

          {/* Bug Report Link */}
          <button
            onClick={() => navigate('/bug-report')}
            className={`flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg text-sm sm:text-base ${isActivePath('/bug-report') ? 'bg-blue-500' : 'hover:bg-blue-500'}`}
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

      {/* How to Play Modal */}
      <HowToPlayModal isOpen={showHowToPlayModal} onClose={() => setShowHowToPlayModal(false)} steps={GUIDE_STEPS} />
    </div>
  );
};

export default DashboardLayout;
