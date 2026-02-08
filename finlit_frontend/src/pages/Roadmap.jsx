import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../auth/context/AuthContext';
import { useModuleScore, MODULES } from '../hooks/useModuleScore';

const FinancialRoadmap = () => {
  const { scrollYProgress } = useScroll();
const pathDrawProgress = useTransform(scrollYProgress, [0, 0.7], [0, 1]);
  const [visibleModules, setVisibleModules] = useState(3);
  const [pathProgress, setPathProgress] = useState(0);
  const [lockedMessage, setLockedMessage] = useState(null);
  const scrollRef = useRef(null);
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { isModulePassed, progress } = useModuleScore();


  // Show locked message temporarily
  const showLockedMessage = (moduleIndex) => {
    const previousModule = allModulesBase[moduleIndex - 1];
    const message = `Complete "${previousModule?.title}" first to unlock this module!`;
    setLockedMessage(message);
    setTimeout(() => setLockedMessage(null), 3000);
  };

  // Module order for sequential access enforcement
  const moduleOrder = [
    MODULES.BUDGETING_50_30_20.id,    // 1. Budgeting Basics
    MODULES.NEEDS_WANTS.id,            // 2. Needs vs Wants
    MODULES.CREDIT_SCORE.id,           // 3. Credit Score
    MODULES.EMERGENCY_FUND.id,         // 4. Emergency Fund
    MODULES.BONDS.id,                  // 5. Bonds
    MODULES.STOCK_MARKET.id,           // 6. Stock Market
    MODULES.INSURANCE.id,              // 7. Insurance
    MODULES.DEBT_MANAGEMENT.id,        // 8. Debt Management
    MODULES.RETIREMENT_ACCOUNTS.id,    // 9. Retirement Accounts
    MODULES.CRYPTO.id,                 // 10. Cryptocurrency
    MODULES.INVESTMENT_BANKING.id,     // 11. Investment Banking
  ];

  // Check if a module is accessible (previous module passed or is first module)
  const isModuleAccessible = (moduleIndex) => {
    if (moduleIndex === 0) return true; // First module always accessible
    const previousModuleId = moduleOrder[moduleIndex - 1];
    return isModulePassed(previousModuleId);
  };

  // Get module status based on progress
  const getModuleStatus = (moduleId, moduleIndex) => {
    if (isModulePassed(moduleId)) return 'Completed';
    if (!isModuleAccessible(moduleIndex)) return 'Locked';
    // Check if there's any progress on this module
    const moduleScore = progress?.moduleScores?.find(s => s.moduleId === moduleId);
    if (moduleScore && moduleScore.attempts > 0) return 'In Progress';
    return 'Next Up';
  };

  // All modules in one continuous journey - status is now dynamically calculated
  const allModulesBase = [
    {
      id: 1,
      moduleId: MODULES.BUDGETING_50_30_20.id,
      title: "Budgeting Basics",
      subtitle: "50-30-20 Rule",
      icon: "💰",
      color: "#e3f2fd",
      position: "left",
      route: "/50-30-20",
      component: "50-30-20",
      description: "Master the 50-30-20 budgeting rule for effective money management.",
      quizType: "interactive-budget"
    },
    {
      id: 2,
      moduleId: MODULES.NEEDS_WANTS.id,
      title: "Needs vs Wants",
      subtitle: "Financial Priorities",
      icon: "⚖️",
      color: "#e8f5e9",
      position: "right",
      route: "/needs-wants",
      component: "needs-wants",
      description: "Learn to distinguish between essential needs and desired wants.",
      quizType: "swipe-categorize"
    },
    
    {
      id: 3,
      moduleId: MODULES.CREDIT_SCORE.id,
      title: "Credit Score Mastery",
      subtitle: "Credit Management",
      icon: "📊",
      color: "#e8f5e9",
      position: "left",
      route: "/credit-score",
      component: "credit-module",
      description: "Understand credit scores, factors that affect them, and improvement strategies.",
      quizType: "mcq"
    },
    {
      id: 4,
      moduleId: MODULES.EMERGENCY_FUND.id,
      title: "Emergency Fund",
      subtitle: "Financial Safety",
      icon: "🆘",
      color: "#e3f2fd",
      position: "right",
      route: "/emergency-fund",
      component: "emergency-module",
      description: "Build a robust emergency fund to protect against unexpected expenses.",
      quizType: "calculation"
    },
    {
      id: 5,
      moduleId: MODULES.BONDS.id,
      title: "Bonds",
      subtitle: "Fixed-Income Securities",
      icon: "📜",
      color: "#e8f5e9",
      position: "left",
      route: "/bonds",
      component: "bonds-module",
      description: "Learn about bonds, fixed-income investing, and steady returns.",
      quizType: "mcq"
    },
    {
      id: 6,
      moduleId: MODULES.STOCK_MARKET.id,
      title: "Stock Market Basics",
      subtitle: "Investment Fundamentals",
      icon: "📈",
      color: "#f5f5f5",
      position: "right",
      route: "/stock-market",
      component: "stock-module",
      description: "Learn the fundamentals of stock market investing and portfolio building.",
      quizType: "matching"
    },
    {
      id: 7,
      moduleId: MODULES.INSURANCE.id,
      title: "Insurance Protection",
      subtitle: "Risk Management",
      icon: "🛡️",
      color: "#f5f5f5",
      position: "left",
      route: "/insurance",
      component: "insurance-module",
      description: "Understand different types of insurance and how to protect your assets.",
      quizType: "drag-drop"
    },
    {
      id: 8,
      moduleId: MODULES.DEBT_MANAGEMENT.id,
      title: "Debt Management",
      subtitle: "Debt Freedom",
      icon: "🔓",
      color: "#f5f5f5",
      position: "right",
      route: "/debt-management",
      component: "debt-module",
      description: "Strategies for managing and eliminating debt effectively.",
      quizType: "scenario"
    },
    {
      id: 9,
      moduleId: MODULES.RETIREMENT_ACCOUNTS.id,
      title: "Retirement Accounts",
      subtitle: "401(k) & Roth IRA",
      icon: "🏛️",
      color: "#e8f5e9",
      position: "left",
      route: "/retirement-accounts",
      component: "retirement-module",
      description: "Master retirement savings with 401(k)s, Roth IRAs, and tax-advantaged investing.",
      quizType: "mcq"
    },
    {
      id: 10,
      moduleId: MODULES.CRYPTO.id,
      title: "Cryptocurrency Fundamentals",
      subtitle: "Digital Assets",
      icon: "🪙",
      color: "#f5f5f5",
      position: "right",
      route: "/crypto",
      component: "crypto-module",
      description: "Learn the fundamentals of cryptocurrency and blockchain technology.",
      quizType: "mcq"
    },
    {
      id: 11,
      moduleId: MODULES.INVESTMENT_BANKING.id,
      title: "Investment Banking",
      subtitle: "IPO Knowledge",
      icon: "🏦",
      color: "#e3f2fd",
      position: "left",
      route: "/investment-quiz",
      component: "truefalse",
      description: "Test your knowledge about Initial Public Offerings and investment banking.",
      quizType: "true-false"
    },
  ];

  // Compute modules with dynamic status
  const allModules = useMemo(() => {
    return allModulesBase.map((module, index) => ({
      ...module,
      status: getModuleStatus(module.moduleId, index)
    }));
  }, [progress]);

  // Reveal modules based on path draw progress
  // Modules should appear slightly ahead of path reaching them
  useEffect(() => {
    const unsubscribe = pathDrawProgress.on('change', (progress) => {
      setPathProgress(progress);
      // Multiply progress to reveal modules faster than path draws
      // This makes modules appear just as path approaches their position
      const modulesToShow = Math.max(3, Math.floor(progress * allModules.length * 1.5) + 3);
      setVisibleModules(Math.min(modulesToShow, allModules.length));
    });

    return () => unsubscribe();
  }, [pathDrawProgress, allModules.length]);

  const [activeModule, setActiveModule] = useState(null);

  const handleModuleClick = (moduleId) => {
    setActiveModule(activeModule === moduleId ? null : moduleId);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case "Completed": return "text-green-500";
      case "In Progress": return "text-blue-500";
      case "Next Up": return "text-purple-500";
      case "Locked": return "text-gray-400";
      default: return "text-gray-600";
    }
  };

  const getStatusBgColor = (status) => {
    switch(status) {
      case "Completed": return "bg-green-100";
      case "In Progress": return "bg-blue-100";
      case "Next Up": return "bg-purple-100";
      case "Locked": return "bg-gray-100";
      default: return "bg-gray-100";
    }
  };

  // Background animation elements
  const bgElements = [
    { emoji: "💰", size: "text-lg", delay: 0 },
    { emoji: "💳", size: "text-xl", delay: 2 },
    { emoji: "📊", size: "text-2xl", delay: 4 },
    { emoji: "📈", size: "text-lg", delay: 6 },
    { emoji: "🏦", size: "text-xl", delay: 8 },
    { emoji: "🛡️", size: "text-lg", delay: 10 },
    { emoji: "🏠", size: "text-2xl", delay: 12 },
    { emoji: "📝", size: "text-lg", delay: 14 },
  ];
    const svgHeight = allModules.length * 380; // rough estimate px per module + spacing


  return (
    <div 
      className="min-h-screen p-6 font-sans relative overflow-hidden"
      style={{
        background: "linear-gradient(120deg, #e0f7fa 0%, #e8f5e9 50%, #e3f2fd 100%)",
      }}
      ref={scrollRef}
    >
      {/* Animated background elements */}
      {bgElements.map((el, index) => (
        <motion.div
          key={index}
          className={`absolute opacity-10 ${el.size} z-0`}
          initial={{ 
            x: Math.random() * 100 - 50, 
            y: -20,
          }}
          animate={{ 
            y: [null, window.innerHeight + 50],
            x: [null, Math.random() * 100 - 50 + (index % 2 === 0 ? 100 : -100)],
          }}
          transition={{ 
            repeat: Infinity, 
            duration: 15 + Math.random() * 10,
            delay: el.delay,
            ease: "linear"
          }}
          style={{
            left: `${(index * 12) % 100}%`,
          }}
        >
          {el.emoji}
        </motion.div>
      ))}

      {/* Header with profile and streak */}
      <div className="flex items-center justify-between mb-10 sticky top-0 z-50 bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-lg shadow-md">
        {/* Back to Dashboard Button */}
        <motion.button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 rounded-lg shadow-sm transition border border-gray-200"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <span>←</span>
          <span className="font-medium">Dashboard</span>
        </motion.button>

        {/* User Profile */}
        <motion.div
          className="flex items-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="relative">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-500 shadow-md flex items-center justify-center border-2 border-white">
              <span className="text-white text-lg font-bold">
                {user?.displayName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || '?'}
              </span>
            </div>
          </div>
          <div className="ml-3">
            <h1 className="text-xl font-bold text-gray-800">{user?.displayName || 'Student'}</h1>
            <p className="text-xs text-gray-500">{user?.email || ''}</p>
          </div>
        </motion.div>

        {/* Daily Streak */}
        <motion.div
          className="bg-white p-2 rounded-xl shadow-lg"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex items-center">
            <span className="text-orange-500 text-xl mr-2">🔥</span>
            <div>
              <div className="text-xs font-semibold text-gray-600">Daily Streak</div>
              <div className="text-2xl font-bold text-orange-500">{progress?.streak || 0} days</div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Title */}
      <motion.h2 
        className="text-3xl font-bold mb-12 text-center text-gray-800 relative z-10"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        Financial Education Journey
      </motion.h2>
      
      {/* Road Map with Curved Path */}
      <div className="max-w-4xl mx-auto relative mb-16 pb-20" style={{ minHeight: pathProgress >= 0.55 ? 'auto' : `${allModules.length * 500}px` }}>

        {/* Path visual - Creating a curved, winding path */}
<svg
  className="absolute top-0 left-0 w-full pointer-events-none"
height={svgHeight}
  viewBox={`0 0 100 ${svgHeight / 5}`}   // maintain ~5:1 ratio
  preserveAspectRatio="none"
>
  <motion.path
    d="M50,0 Q60,30 40,60 Q20,90 60,120 Q100,150 50,180 Q0,210 50,240 Q100,270 50,300 Q0,330 50,360 Q100,390 50,420 Q0,450 50,480 Q100,510 50,540 Q0,570 50,600 Q100,630 50,640"
    stroke="#3182ce"
    strokeWidth="4"
    strokeLinecap="round"
    strokeLinejoin="round"
    fill="none"
    style={{ pathLength: pathDrawProgress }}
  />
</svg>

        {/* Modules */}
        <div className="relative z-10">
          {allModules.slice(0, visibleModules).map((module, index) => (
            <motion.div 
              key={module.id} 
              className={`flex ${module.position === 'left' ? 'justify-start pr-8 ml-6' : 'justify-end pl-8 mr-6'} mb-24 relative`}
              initial={{ opacity: 0, x: module.position === 'left' ? -50 : 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * (index % 3) }}
              whileHover={{ scale: 1.03 }}
            >
              {/* Curved connector from path to module */}
              <svg className={`absolute ${module.position === 'left' ? 'right-0' : 'left-0'} top-1/2 -mt-3 ${module.position === 'left' ? '-translate-y-6' : '-translate-y-3'} z-0`} width="60" height="40" viewBox="0 0 60 40">
                <path 
                  d={module.position === 'left' ? "M0,20 C30,20 30,0 60,0" : "M60,20 C30,20 30,0 0,0"} 
                  stroke="#4299e1" 
                  strokeWidth="2" 
                  fill="none" 
                  className="opacity-70"
                />

              </svg>
              
              {/* Module card */}
              <div 
                className={`w-full max-w-xs rounded-2xl shadow-lg overflow-hidden cursor-pointer transition-all duration-300 border border-gray-200 ${activeModule === module.id ? 'ring-4 ring-blue-300' : ''}`}
                style={{ 
                  background: 'rgba(255, 255, 255, 0.9)',
                  transform: module.position === 'left' ? 'rotate(-2deg)' : 'rotate(2deg)'
                }}
                onClick={() => handleModuleClick(module.id)}
              >
                {/* Card header */}
                <div className="p-4">
                  <div className="flex items-center">
                    <div className={`p-3 rounded-full mr-4 ${getStatusBgColor(module.status)}`}>
                      <span className="text-2xl">{module.icon}</span>
                    </div>
                    <div className="flex-grow">
                      <h3 className="text-lg font-bold text-gray-800">{module.title}</h3>
                      <p className={`${getStatusColor(module.status)} font-medium text-sm`}>
                        {module.status}
                      </p>
                    </div>
                    {module.status !== 'Locked' && (
                      <div className="text-blue-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Card details (expandable) */}
                {activeModule === module.id && (
                  <motion.div 
                    className="px-4 pb-4 border-t border-gray-100"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.3 }}
                  >
                    <p className="py-3 text-gray-600 text-sm">{module.description}</p>
                    <div className="space-y-2">
                      {module.status !== 'Locked' ? (
                        <>
                          <button
                            className="mt-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors w-full font-medium text-sm"
                            onClick={() => {
                              if (module.route) {
                                navigate(module.route);
                              }
                            }}
                          >
                            {module.status === 'Completed' ? 'Review Module' :
                             module.status === 'In Progress' ? 'Continue Learning' : 'Start Module'}
                          </button>
                          <div className="text-xs text-gray-500 text-center">
                            Quiz Type: {module.quizType?.replace('-', ' ') || 'Interactive'}
                          </div>
                        </>
                      ) : (
                        <div className="mt-2 p-3 bg-gray-100 rounded-lg text-center">
                          <div className="text-gray-500 text-sm font-medium mb-1">Module Locked</div>
                          <div className="text-xs text-gray-400">
                            Complete the previous module to unlock
                          </div>
                        </div>
                      )}
                    </div>

                  </motion.div>
                )}
              </div>
              
              {/* Node on the path */}
              <div 
                className={`absolute top-1/2 -mt-3 ${module.position === 'left' ? 'right-4' : 'left-4'} w-6 h-6 rounded-full z-10 flex items-center justify-center ${module.status === 'Locked' ? 'bg-gray-300' : 'bg-blue-500'}`} 
              >
                {module.status === 'Completed' && (
                  <motion.svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-4 w-4 text-white" 
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5, type: "spring" }}
                  >
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </motion.svg>
                )}
                {module.status === 'In Progress' && (
                  <motion.div
                    className="h-2 w-2 rounded-full bg-white"
                    animate={{ scale: [1, 1.5, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  />
                )}
                {module.status === 'Next Up' && (
                  <motion.div
                    className="h-2 w-2 rounded-full bg-white"
                  />
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Scroll indicator if more modules can be revealed */}
      {visibleModules < allModules.length && (
        <motion.div
          className="fixed bottom-10 left-1/2 transform -translate-x-1/2 z-20 flex flex-col items-center"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <p className="text-blue-600 font-medium mb-2">Scroll down to see more</p>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </motion.div>
      )}

      {/* Completion indicator when all modules visible */}
      {visibleModules >= allModules.length && (
        <motion.div
          className="text-center mt-10 mb-10 relative z-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-block bg-green-100 text-green-800 px-4 py-2 rounded-full font-medium">
            🎉 You've reached the end of your financial journey map!
          </div>
        </motion.div>
      )}

    </div>
  );
};

export default FinancialRoadmap;