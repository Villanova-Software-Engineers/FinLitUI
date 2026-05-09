import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../auth/context/AuthContext';
import { useModuleScore, MODULES } from '../hooks/useModuleScore';
import { isModuleAccessible as checkModuleAccessibility } from '../firebase/firestore.service';

const FinancialRoadmap = () => {
  const { scrollYProgress } = useScroll();
const pathDrawProgress = useTransform(scrollYProgress, [0, 0.7], [0, 1]);
  const [visibleModules, setVisibleModules] = useState(3);
  const [pathProgress, setPathProgress] = useState(0);
  const [lockedMessage, setLockedMessage] = useState(null);
  const [adminLockedModules, setAdminLockedModules] = useState(new Set());
  const scrollRef = useRef(null);
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { isModulePassed, progress } = useModuleScore();

  // Load admin-locked modules on mount
  useEffect(() => {
    const loadLockedModules = async () => {
      if (user?.organizationId && user?.role === 'student') {
        const locked = new Set();
        // Check all modules for locks
        for (const moduleId of Object.values(MODULES).map(m => m.id)) {
          const accessible = await checkModuleAccessibility(user.organizationId, moduleId);
          if (!accessible) {
            locked.add(moduleId);
          }
        }
        setAdminLockedModules(locked);
      }
    };
    loadLockedModules();
  }, [user?.organizationId, user?.role]);


  // Show locked message temporarily
  const showLockedMessage = (moduleIndex) => {
    const previousModule = allModulesBase[moduleIndex - 1];
    const message = `Complete "${previousModule?.title}" first to unlock this module!`;
    setLockedMessage(message);
    setTimeout(() => setLockedMessage(null), 3000);
  };

  // Module order for sequential access enforcement
  // Phase 1 — Foundations
  const moduleOrder = [
    MODULES.WHAT_IS_MONEY.id,          // 1. What is Money
    MODULES.BUDGETING_50_30_20.id,     // 2. Budgeting Basics
    MODULES.NEEDS_WANTS.id,            // 3. Needs vs Wants
    MODULES.BANKING.id,                // 4. Banking Basics
    MODULES.EMERGENCY_FUND.id,         // 5. Emergency Fund

    // Phase 2 — Taxes, Saving & Credit
    MODULES.TAX_BASICS.id,             // 6. Tax Basics
    MODULES.INTEREST_RATES.id,         // 7. Interest Rates
    MODULES.CREDIT_SCORE.id,           // 8. Credit Score Mastery
    MODULES.DEBT_MANAGEMENT.id,        // 9. Debt Management
    MODULES.CONSUMER_TRAPS.id,         // 10. Consumer Traps

    // Phase 3 — Protection
    MODULES.RISK_TAKING.id,            // 11. Risk Management
    MODULES.INSURANCE.id,              // 12. Insurance Protection
    MODULES.FINANCIAL_SAFETY.id,       // 13. Financial Safety

    // Phase 4 — Investing & Assets
    MODULES.COMPOUNDING.id,            // 14. Power of Compounding
    MODULES.INFLATION_DEFLATION.id,    // 15. Inflation & Deflation
    MODULES.BONDS.id,                  // 16. Bonds
    MODULES.STOCK_MARKET.id,           // 17. Stock Market Basics
    MODULES.INVESTMENT_VEHICLES.id,    // 18. Investment Vehicles
    MODULES.REAL_ESTATE.id,            // 19. Real Estate
    MODULES.RETIREMENT_ACCOUNTS.id,    // 20. Retirement Accounts

    // Phase 5 — Accounting
    MODULES.ACCOUNTING.id,             // 21. What is Accounting
    MODULES.BALANCE_SHEET.id,          // 22. Balance Sheet
    MODULES.INCOME_STATEMENT.id,       // 23. Income Statement
    MODULES.CASH_FLOW_STATEMENT.id,    // 24. Cash Flow Statement

    // Phase 6 — Advanced (Chapter 3)
    MODULES.CRYPTO.id,                 // 25. Crypto Fundamentals
    MODULES.INVESTMENT_BANKING.id,     // 26. Investment Banking
    MODULES.GIVING.id,                 // 27. Giving Back
    MODULES.GLOBAL_MARKETS.id,         // 28. Global Markets
    MODULES.ESG_INVESTING.id,          // 29. ESG & Ethical Investing
    MODULES.NEGOTIATING.id,            // 30. The Art of Negotiating
  ];

  // Check if a module is accessible (previous module passed AND not locked by admin)
  const isModuleAccessible = useCallback((moduleIndex, moduleId) => {
    // Check if locked by admin first
    if (adminLockedModules.has(moduleId)) return false;

    if (moduleIndex === 0) return true; // First module always accessible (unless locked by admin)
    const previousModuleId = moduleOrder[moduleIndex - 1];
    return isModulePassed(previousModuleId);
  }, [isModulePassed, adminLockedModules]);

  // Get module status based on progress
  const getModuleStatus = useCallback((moduleId, moduleIndex) => {
    // Check if locked by admin first
    if (adminLockedModules.has(moduleId)) return 'Locked by Admin';

    if (isModulePassed(moduleId)) return 'Completed';
    if (!isModuleAccessible(moduleIndex, moduleId)) return 'Locked';
    // Check if there's any progress on this module
    const moduleScore = progress?.moduleScores?.find(s => s.moduleId === moduleId);
    if (moduleScore && moduleScore.attempts > 0) return 'In Progress';
    return 'Next Up';
  }, [isModulePassed, isModuleAccessible, progress?.moduleScores, adminLockedModules]);

  // All modules in one continuous journey - status is now dynamically calculated
  const allModulesBase = [
    // Phase 1 — Foundations
    {
      id: 1,
      moduleId: MODULES.WHAT_IS_MONEY.id,
      title: "What is Money",
      subtitle: "Money Fundamentals",
      icon: "💵",
      color: "#e3f2fd",
      position: "left",
      route: "/what-is-money",
      component: "what-is-money-module",
      description: "Understand the concept of money, its purpose, and how to set financial goals and plan for the future.",
      quizType: "mcq"
    },
    {
      id: 2,
      moduleId: MODULES.BUDGETING_50_30_20.id,
      title: "Budgeting Basics",
      subtitle: "50-30-20 Rule",
      icon: "💰",
      color: "#e8f5e9",
      position: "right",
      route: "/50-30-20",
      component: "50-30-20",
      description: "Master the 50-30-20 budgeting rule for effective money management.",
      quizType: "interactive-budget"
    },
    {
      id: 3,
      moduleId: MODULES.NEEDS_WANTS.id,
      title: "Needs vs Wants",
      subtitle: "Financial Priorities",
      icon: "⚖️",
      color: "#e3f2fd",
      position: "left",
      route: "/needs-wants",
      component: "needs-wants",
      description: "Learn to distinguish between essential needs and desired wants.",
      quizType: "swipe-categorize"
    },
    {
      id: 4,
      moduleId: MODULES.BANKING.id,
      title: "Banking Basics",
      subtitle: "Accounts & Cards",
      icon: "🏧",
      color: "#e8f5e9",
      position: "right",
      route: "/banking",
      component: "banking-module",
      description: "Learn about bank accounts, fees, debit vs credit cards, and checking vs savings.",
      quizType: "swipe-categorize"
    },
    {
      id: 5,
      moduleId: MODULES.EMERGENCY_FUND.id,
      title: "Emergency Fund",
      subtitle: "Financial Safety",
      icon: "🆘",
      color: "#e3f2fd",
      position: "left",
      route: "/emergency-fund",
      component: "emergency-module",
      description: "Build a robust emergency fund to protect against unexpected expenses.",
      quizType: "calculation"
    },

    // Phase 2 — Taxes, Saving & Credit
    {
      id: 6,
      moduleId: MODULES.TAX_BASICS.id,
      title: "Tax Basics",
      subtitle: "Understanding Taxes",
      icon: "🧾",
      color: "#e8f5e9",
      position: "right",
      route: "/tax-basics",
      component: "tax-basics",
      description: "Learn how taxes work, tax brackets, deductions, and legal ways to reduce your tax burden.",
      quizType: "mcq"
    },
    {
      id: 7,
      moduleId: MODULES.INTEREST_RATES.id,
      title: "Interest Rates",
      subtitle: "Borrowing & Lending",
      icon: "📊",
      color: "#e3f2fd",
      position: "left",
      route: "/interest-rates",
      component: "interest-rates-module",
      description: "Understand how interest rates work, who controls them, and their impact on your finances.",
      quizType: "simulation"
    },
    {
      id: 8,
      moduleId: MODULES.CREDIT_SCORE.id,
      title: "Credit Score Mastery",
      subtitle: "Credit Management",
      icon: "💳",
      color: "#e8f5e9",
      position: "right",
      route: "/credit-score",
      component: "credit-module",
      description: "Understand credit scores, factors that affect them, and improvement strategies.",
      quizType: "mcq"
    },
    {
      id: 9,
      moduleId: MODULES.DEBT_MANAGEMENT.id,
      title: "Debt Management",
      subtitle: "Debt Freedom",
      icon: "🔓",
      color: "#e3f2fd",
      position: "left",
      route: "/debt-management",
      component: "debt-module",
      description: "Strategies for managing and eliminating debt effectively.",
      quizType: "scenario"
    },
    {
      id: 10,
      moduleId: MODULES.CONSUMER_TRAPS.id,
      title: "Consumer Traps",
      subtitle: "Spending Pitfalls",
      icon: "🪤",
      color: "#e8f5e9",
      position: "right",
      route: "/consumer-traps",
      component: "consumer-traps-module",
      description: "Recognize and avoid common consumer traps, marketing tricks, and spending pitfalls.",
      quizType: "scenario"
    },

    // Phase 3 — Protection
    {
      id: 11,
      moduleId: MODULES.RISK_TAKING.id,
      title: "Risk Management",
      subtitle: "Smart Risk Taking",
      icon: "⚖️",
      color: "#e3f2fd",
      position: "left",
      route: "/risk-taking",
      component: "risk-taking-module",
      description: "Learn how to assess and manage financial risk responsibly.",
      quizType: "simulation"
    },
    {
      id: 12,
      moduleId: MODULES.INSURANCE.id,
      title: "Insurance Protection",
      subtitle: "Risk Management",
      icon: "🛡️",
      color: "#e8f5e9",
      position: "right",
      route: "/insurance",
      component: "insurance-module",
      description: "Understand different types of insurance and how to protect your assets.",
      quizType: "drag-drop"
    },
    {
      id: 13,
      moduleId: MODULES.FINANCIAL_SAFETY.id,
      title: "Financial Safety",
      subtitle: "Fraud Prevention",
      icon: "🔒",
      color: "#e3f2fd",
      position: "left",
      route: "/financial-safety",
      component: "financial-safety-module",
      description: "Recognize red flags, avoid scams, and protect your financial identity.",
      quizType: "scenario"
    },

    // Phase 4 — Investing & Assets
    {
      id: 14,
      moduleId: MODULES.COMPOUNDING.id,
      title: "Power of Compounding",
      subtitle: "Wealth Building",
      icon: "📈",
      color: "#e8f5e9",
      position: "right",
      route: "/compounding",
      component: "compounding-module",
      description: "Discover the magic of compound interest and how time grows your money exponentially.",
      quizType: "calculator"
    },
    {
      id: 15,
      moduleId: MODULES.INFLATION_DEFLATION.id,
      title: "Inflation & Deflation",
      subtitle: "Price Changes",
      icon: "📊",
      color: "#e3f2fd",
      position: "left",
      route: "/inflation-deflation",
      component: "inflation-deflation-module",
      description: "Understand how inflation and deflation affect your money's purchasing power and learn strategies to protect your wealth.",
      quizType: "simulation"
    },
    {
      id: 16,
      moduleId: MODULES.BONDS.id,
      title: "Bonds",
      subtitle: "Fixed-Income Securities",
      icon: "📜",
      color: "#e8f5e9",
      position: "right",
      route: "/bonds",
      component: "bonds-module",
      description: "Learn about bonds, fixed-income investing, and steady returns.",
      quizType: "mcq"
    },
    {
      id: 17,
      moduleId: MODULES.STOCK_MARKET.id,
      title: "Stock Market Basics",
      subtitle: "Investment Fundamentals",
      icon: "📉",
      color: "#e3f2fd",
      position: "left",
      route: "/stock-market",
      component: "stock-module",
      description: "Learn the fundamentals of stock market investing and portfolio building.",
      quizType: "matching"
    },
    {
      id: 18,
      moduleId: MODULES.INVESTMENT_VEHICLES.id,
      title: "Investment Vehicles",
      subtitle: "ETFs & Mutual Funds",
      icon: "🚗",
      color: "#e8f5e9",
      position: "right",
      route: "/investment-vehicles",
      component: "investment-vehicles-module",
      description: "Compare ETFs, mutual funds, value vs growth investing strategies.",
      quizType: "matching"
    },
    {
      id: 19,
      moduleId: MODULES.REAL_ESTATE.id,
      title: "Real Estate",
      subtitle: "Property Investment",
      icon: "🏠",
      color: "#e3f2fd",
      position: "left",
      route: "/real-estate",
      component: "real-estate-module",
      description: "Learn about real estate investing, mortgages, and property ownership strategies.",
      quizType: "mcq"
    },
    {
      id: 20,
      moduleId: MODULES.RETIREMENT_ACCOUNTS.id,
      title: "Retirement Accounts",
      subtitle: "401(k) & Roth IRA",
      icon: "🏛️",
      color: "#e8f5e9",
      position: "right",
      route: "/retirement-accounts",
      component: "retirement-module",
      description: "Master retirement savings with 401(k)s, Roth IRAs, and tax-advantaged investing.",
      quizType: "mcq"
    },

    // Phase 5 — Accounting
    {
      id: 21,
      moduleId: MODULES.ACCOUNTING.id,
      title: "What is Accounting",
      subtitle: "Business Language",
      icon: "📋",
      color: "#f3e7f9",
      position: "left",
      route: "/accounting",
      component: "accounting-module",
      description: "Master accounting fundamentals: the accounting equation, debits & credits, and financial reporting.",
      quizType: "interactive"
    },
    {
      id: 22,
      moduleId: MODULES.BALANCE_SHEET.id,
      title: "Balance Sheet",
      subtitle: "Financial Statements",
      icon: "⚖️",
      color: "#e0f2fe",
      position: "right",
      route: "/balance-sheet",
      component: "balance-sheet-module",
      description: "Learn to read and analyze balance sheets, understand assets, liabilities, and equity.",
      quizType: "interactive"
    },
    {
      id: 23,
      moduleId: MODULES.INCOME_STATEMENT.id,
      title: "Income Statement",
      subtitle: "Profit & Loss",
      icon: "📊",
      color: "#d1fae5",
      position: "left",
      route: "/income-statement",
      component: "income-statement-module",
      description: "Master the income statement: from revenue to net income, understand COGS, operating expenses, and profit margins.",
      quizType: "interactive"
    },
    {
      id: 24,
      moduleId: MODULES.CASH_FLOW_STATEMENT.id,
      title: "Cash Flow Statement",
      subtitle: "Where Money Moves",
      icon: "💧",
      color: "#cffafe",
      position: "right",
      route: "/cash-flow-statement",
      component: "cash-flow-statement-module",
      description: "Learn how cash actually flows through a business: operating, investing, and financing activities, and master free cash flow analysis.",
      quizType: "interactive"
    },

    // Phase 6 — Advanced
    {
      id: 25,
      moduleId: MODULES.CRYPTO.id,
      title: "Crypto Fundamentals",
      subtitle: "Digital Assets",
      icon: "🪙",
      color: "#e3f2fd",
      position: "left",
      route: "/crypto",
      component: "crypto-module",
      description: "Learn the fundamentals of cryptocurrency and blockchain technology.",
      quizType: "mcq"
    },
    {
      id: 26,
      moduleId: MODULES.INVESTMENT_BANKING.id,
      title: "Investment Banking",
      subtitle: "IPO Knowledge",
      icon: "🏦",
      color: "#e8f5e9",
      position: "right",
      route: "/investment-quiz",
      component: "truefalse",
      description: "Test your knowledge about Initial Public Offerings and investment banking.",
      quizType: "true-false"
    },
    {
      id: 27,
      moduleId: MODULES.GIVING.id,
      title: "Giving Back",
      subtitle: "Charitable Giving",
      icon: "❤️",
      color: "#e3f2fd",
      position: "left",
      route: "/giving",
      component: "giving-module",
      description: "Understand the importance of giving back and how to allocate for charitable causes.",
      quizType: "mcq"
    },
    {
      id: 28,
      moduleId: MODULES.GLOBAL_MARKETS.id,
      title: "Global Markets",
      subtitle: "World Economies",
      icon: "🌐",
      color: "#ccfbf1",
      position: "right",
      route: "/global-markets",
      component: "global-markets-module",
      description: "Understand how world economies connect through trade flows, exchange rates, and financial contagion.",
      quizType: "mcq"
    },
    {
      id: 29,
      moduleId: MODULES.ESG_INVESTING.id,
      title: "ESG & Ethical Investing",
      subtitle: "Values-Aligned Finance",
      icon: "🌱",
      color: "#d1fae5",
      position: "left",
      route: "/esg-investing",
      component: "esg-investing-module",
      description: "Learn how Environmental, Social, and Governance factors shape modern investing — and how to align your portfolio with your values.",
      quizType: "mcq"
    },
    {
      id: 30,
      moduleId: MODULES.NEGOTIATING.id,
      title: "The Art of Negotiating",
      subtitle: "Raises & Offers",
      icon: "🤝",
      color: "#fef3c7",
      position: "right",
      route: "/negotiating",
      component: "negotiating-module",
      description: "Master salary negotiation: research market rates, use your BATNA, deliver confident counter-offers, and ask for more at any job.",
      quizType: "scenario"
    },
  ];

  // Compute modules with dynamic status
  const allModules = useMemo(() => {
    return allModulesBase.map((module, index) => ({
      ...module,
      status: getModuleStatus(module.moduleId, index)
    }));
  }, [getModuleStatus]);

  // Split modules into three chapters
  const chapter1Modules = allModules.slice(0, 12);      // Modules 1-12
  const chapter2Modules = allModules.slice(12, 24);     // Modules 13-24 (ending at Cash Flow Statement)
  const chapter3Modules = allModules.slice(24);          // Modules 25+ (Crypto, Investment Banking, Giving Back, Global Markets, ESG...)

  // Check if chapters are complete
  const isChapter1Complete = chapter1Modules.every(m => m.status === 'Completed');
  const isChapter2Complete = chapter2Modules.every(m => m.status === 'Completed');

  // Auto-determine which chapter to show based on completion
  const getInitialChapter = () => {
    if (!isChapter1Complete) return 1;
    if (!isChapter2Complete) return 2;
    // If chapter 1 and 2 are complete, show chapter 3
    return 3;
  };

  const [currentChapter, setCurrentChapter] = useState(getInitialChapter);
  const [manualNavigation, setManualNavigation] = useState(false);

  // Auto-switch chapters when previous chapter becomes complete (only if user hasn't manually navigated)
  useEffect(() => {
    if (isChapter1Complete && currentChapter === 1 && !manualNavigation) {
      setCurrentChapter(2);
    }
    if (isChapter2Complete && currentChapter === 2 && !manualNavigation) {
      setCurrentChapter(3);
    }
  }, [isChapter1Complete, isChapter2Complete, currentChapter, manualNavigation]);

  // Get current chapter's modules
  const currentModules = currentChapter === 1 ? chapter1Modules :
                         currentChapter === 2 ? chapter2Modules :
                         chapter3Modules;

  // Reveal modules based on path draw progress
  // Modules should appear slightly ahead of path reaching them
  const currentModulesLength = currentModules.length;

  useEffect(() => {
    // Reset when currentChapter changes
    setPathProgress(0);
    setVisibleModules(3);
    // Scroll to top when changing parts
    window.scrollTo({ top: 0, behavior: 'instant' });

    const unsubscribe = pathDrawProgress.on('change', (progress) => {
      setPathProgress(progress);
      // Multiply progress to reveal modules faster than path draws
      // This makes modules appear just as path approaches their position
      const modulesToShow = Math.max(3, Math.floor(progress * currentModulesLength * 1.5) + 3);
      setVisibleModules(Math.min(modulesToShow, currentModulesLength));
    });

    return () => {
      unsubscribe();
    };
  }, [pathDrawProgress, currentModulesLength, currentChapter]);

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
      case "Locked by Admin": return "text-red-500";
      default: return "text-gray-600";
    }
  };

  const getStatusBgColor = (status) => {
    switch(status) {
      case "Completed": return "bg-green-100";
      case "In Progress": return "bg-blue-100";
      case "Next Up": return "bg-purple-100";
      case "Locked": return "bg-gray-100";
      case "Locked by Admin": return "bg-red-100";
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
  const svgHeight = useMemo(() => currentModules.length * 380, [currentModules.length]);

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
        className="text-3xl font-bold mb-8 text-center text-gray-800 relative z-10"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        Financial Education Journey
      </motion.h2>

      {/* Progress indicator */}
      <div className="flex justify-center mb-8 relative z-10">
        <div className="bg-white px-6 py-2 rounded-full shadow-sm border border-gray-200">
          <span className="text-gray-600 font-medium">
            {allModules.filter(m => m.status === 'Completed').length} / {allModules.length} modules completed
          </span>
        </div>
      </div>

      {/* Road Map with Curved Path */}
      <div key={currentChapter} className="max-w-4xl mx-auto relative mb-16 pb-20" style={{ minHeight: pathProgress >= 0.55 ? 'auto' : `${currentModules.length * 500}px` }}>

        {/* Path visual - Creating a curved, winding path */}
<svg
  key={`svg-path-${currentChapter}`}
  className="absolute top-0 left-0 w-full pointer-events-none"
height={svgHeight}
  viewBox={`0 0 100 ${svgHeight / 5}`}   // maintain ~5:1 ratio
  preserveAspectRatio="none"
>
  <motion.path
    key={`motion-path-${currentChapter}`}
    d="M50,0 Q60,30 40,60 Q20,90 60,120 Q100,150 50,180 Q0,210 50,240 Q100,270 50,300 Q0,330 50,360 Q100,390 50,420 Q0,450 50,480 Q100,510 50,540 Q0,570 50,600 Q100,630 50,660 Q0,690 50,720 Q100,750 50,780 C60,800 55,820 50,840"
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
          {currentModules.slice(0, visibleModules).map((module, index) => (
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
                    {module.status !== 'Locked' && module.status !== 'Locked by Admin' && (
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
                      {module.status !== 'Locked' && module.status !== 'Locked by Admin' ? (
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
                        <div className={`mt-2 p-3 rounded-lg text-center ${module.status === 'Locked by Admin' ? 'bg-red-50' : 'bg-gray-100'}`}>
                          <div className={`text-sm font-medium mb-1 ${module.status === 'Locked by Admin' ? 'text-red-600' : 'text-gray-500'}`}>
                            {module.status === 'Locked by Admin' ? '🔒 Locked by Instructor' : 'Module Locked'}
                          </div>
                          <div className={`text-xs ${module.status === 'Locked by Admin' ? 'text-red-500' : 'text-gray-400'}`}>
                            {module.status === 'Locked by Admin'
                              ? 'Contact your instructor to unlock this module'
                              : 'Complete the previous module to unlock'}
                          </div>
                        </div>
                      )}
                    </div>

                  </motion.div>
                )}
              </div>
              
              {/* Node on the path */}
              <div 
                className={`absolute top-1/2 -mt-3 ${module.position === 'left' ? 'right-4' : 'left-4'} w-6 h-6 rounded-full z-10 flex items-center justify-center ${module.status === 'Locked' || module.status === 'Locked by Admin' ? (module.status === 'Locked by Admin' ? 'bg-red-400' : 'bg-gray-300') : 'bg-blue-500'}`} 
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
      {visibleModules < currentModules.length && (
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

      {/* End of path navigation */}
      {visibleModules >= currentModules.length && (
        <motion.div
          className="text-center mt-10 mb-10 relative z-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {currentChapter === 1 ? (
            <button
              onClick={() => {
                setManualNavigation(true);
                setCurrentChapter(2);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="px-8 py-3 bg-blue-500 text-white rounded-xl font-bold hover:bg-blue-600 transition-all shadow-lg"
            >
              Continue to Chapter 2 →
            </button>
          ) : currentChapter === 2 ? (
            <div className="flex justify-center gap-4">
              <button
                onClick={() => {
                  setManualNavigation(true);
                  setCurrentChapter(1);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-6 py-2 bg-white text-gray-600 rounded-xl font-medium hover:bg-gray-50 transition-all shadow-sm border border-gray-200"
              >
                ← Back to Chapter 1
              </button>
              <button
                onClick={() => {
                  setManualNavigation(true);
                  setCurrentChapter(3);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-8 py-3 bg-blue-500 text-white rounded-xl font-bold hover:bg-blue-600 transition-all shadow-lg"
              >
                Continue to Chapter 3 →
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <button
                onClick={() => {
                  setManualNavigation(true);
                  setCurrentChapter(2);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-6 py-2 bg-white text-gray-600 rounded-xl font-medium hover:bg-gray-50 transition-all shadow-sm border border-gray-200"
              >
                ← Back to Chapter 2
              </button>
              {chapter3Modules.every(m => m.status === 'Completed') && (
                <div className="inline-block bg-green-100 text-green-800 px-4 py-2 rounded-full font-medium">
                  🏆 Congratulations! You've completed all modules!
                </div>
              )}
            </div>
          )}
        </motion.div>
      )}

    </div>
  );
};

export default FinancialRoadmap;
