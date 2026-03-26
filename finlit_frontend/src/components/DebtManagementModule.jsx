import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, CreditCard, Calculator, TrendingDown, CheckCircle, AlertCircle, Play, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useModuleScore, MODULES } from '../hooks/useModuleScore';

const DebtManagementModule = () => {
  const navigate = useNavigate();
  const { isModulePassed, saveScore } = useModuleScore();

  // Check if module is already passed
  const modulePassed = isModulePassed(MODULES.DEBT_MANAGEMENT?.id);

  // Review mode - allows viewing content without answering
  const [isReviewMode, setIsReviewMode] = useState(false);

  // Phase management - intro, learn, quiz, results
  const [currentPhase, setCurrentPhase] = useState('intro');
  const [learnStep, setLearnStep] = useState(0);

  const [currentScenario, setCurrentScenario] = useState(0);
  const [selectedStrategies, setSelectedStrategies] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  // Module score saving state
  const [isSaving, setIsSaving] = useState(false);
  const [saveResult, setSaveResult] = useState(null);

  // ==========================================
  // LEARNING CONTENT
  // ==========================================
  const learningSections = [
    {
      id: 'what-is-debt',
      title: "Understanding Debt",
      emoji: "💳",
      color: "from-red-400 to-orange-500",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      intro: "Debt is money you owe. It can help achieve goals, but too much becomes a burden.",
      points: [
        { emoji: "📊", title: "Good vs Bad Debt", desc: "Good debt builds wealth (mortgages, student loans). Bad debt costs money without value (high-interest cards).", example: "Student loan at 5% = good. Credit card at 25% for wants = bad." },
        { emoji: "💰", title: "Interest Costs", desc: "Interest is the fee for borrowing. Higher rates = more expensive debt over time.", example: "$10K at 5% = $500/year. At 25% = $2,500/year!" },
        { emoji: "⚠️", title: "The Debt Trap", desc: "Minimum payments keep you in debt longer. Most goes to interest, not balance.", example: "$5K at 20% with minimums = 25+ years to pay off!" }
      ],
      funFact: "Americans owe over $1 TRILLION in credit card debt! 😱"
    },
    {
      id: 'debt-strategies',
      title: "Payoff Strategies",
      emoji: "🎯",
      color: "from-blue-400 to-indigo-500",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      intro: "Two popular methods to pay off debt — choose what works for you.",
      points: [
        { emoji: "🏔️", title: "Avalanche Method", desc: "Pay extra toward HIGHEST interest rate first. Saves the most money.", example: "Debts at 25%, 18%, 12%? Attack 25% first." },
        { emoji: "⛷️", title: "Snowball Method", desc: "Pay extra toward SMALLEST balance first. Quick wins boost motivation.", example: "Paying off small $500 debt gives momentum!" },
        { emoji: "🔄", title: "Balance Transfer", desc: "Move debt to 0% promo card. Pay it off before rates jump.", example: "$5K from 25% to 0% for 18mo saves $1,875!" }
      ],
      funFact: "Avalanche saves more money, but snowball has higher success rates! 🧠"
    },
    {
      id: 'emergency-situations',
      title: "Debt in Crisis",
      emoji: "🆘",
      color: "from-amber-400 to-yellow-500",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-200",
      intro: "Struggling with payments? Don't panic — options exist.",
      points: [
        { emoji: "📞", title: "Call Creditors", desc: "Ask about hardship programs BEFORE missing payments.", example: "They'd rather help than send you to collections." },
        { emoji: "🛡️", title: "Keep Emergency Fund", desc: "Don't drain savings for debt. Basic survival comes first.", example: "That $3K fund = 2 months rent if you lose your job." },
        { emoji: "⚖️", title: "Bankruptcy = Last Resort", desc: "Explore all options first. Bankruptcy hurts credit 7-10 years.", example: "Try negotiating, counseling, consolidation first." }
      ],
      funFact: "40% of Americans can't cover a $400 emergency! 💡"
    },
    {
      id: 'staying-debt-free',
      title: "Stay Debt-Free",
      emoji: "🏆",
      color: "from-emerald-400 to-teal-500",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-200",
      intro: "Paid off debt? Now keep it that way with good habits.",
      points: [
        { emoji: "📝", title: "Budget Realistically", desc: "Use 50/30/20: needs, wants, savings. Include fun money!", example: "Too restrictive = failure. Balance is key." },
        { emoji: "🚫", title: "Build Emergency Fund", desc: "#1 reason people get back in debt: unexpected expenses.", example: "Start with $1K goal. Small cushion = big protection." },
        { emoji: "💳", title: "Use Credit Wisely", desc: "Pay FULL balance monthly. Only charge what you can afford.", example: "Treat credit card like debit card." }
      ],
      funFact: "Writing down financial goals = 42% more likely to achieve them! 📝"
    }
  ];

  const scenarios = [
    {
      id: 1,
      title: "Credit Card Debt Crisis",
      description: "Sarah has $15,000 in credit card debt across 3 cards. She earns $4,000/month and has $1,200 left after paying bills.",
      situation: {
        totalDebt: 15000,
        cards: [
          { name: "Store Card", balance: 4000, rate: 22, minPayment: 120 },
          { name: "Visa Card", balance: 5000, rate: 18, minPayment: 150 },
          { name: "Mastercard", balance: 6000, rate: 25, minPayment: 180 }
        ],
        monthlyIncome: 4000,
        expenses: 2800,
        extraMoney: 1200
      },
      question: "Sarah wants to get out of debt as fast as possible. What's her BEST strategy?",
      strategies: [
        {
          id: 'snowball',
          name: 'Pay Smallest Balance First (Snowball)',
          description: 'Pay minimums, then put extra $750 toward the $4,000 Store Card',
          correct: false,
          explanation: 'Not the best choice here. While the Snowball method (smallest balance first) feels good psychologically, Sarah\'s smallest debt is also her middle interest rate (22%). She\'ll pay more interest than Avalanche and take longer to be debt-free.',
          mathBreakdown: 'This costs Sarah about $1,200 more in interest than Avalanche.'
        },
        {
          id: 'equal-split',
          name: 'Split Money Equally Across All Cards',
          description: 'Pay minimums, then split the extra $750 three ways ($250 each card)',
          correct: false,
          explanation: 'Not effective. Spreading money thin means all debts stick around longer, especially the 25% one. Each month that high-interest debt exists costs Sarah money.',
          mathBreakdown: 'This is the slowest approach and costs the most in total interest.'
        },
        {
          id: 'avalanche',
          name: 'Attack Highest Interest First (Avalanche)',
          description: 'Pay $450 minimums total, then put remaining $750 toward the 25% Mastercard each month',
          correct: true,
          explanation: 'CORRECT! The Avalanche method targets the highest interest rate first (25% Mastercard). This saves Sarah the most money because high-interest debt grows fastest. She\'ll pay less interest overall and get debt-free sooner.',
          mathBreakdown: 'By attacking 25% first instead of 18%, Sarah saves about $2,400 in interest!'
        },
        {
          id: 'minimum',
          name: 'Just Pay Minimum Payments',
          description: 'Only pay the required $450/month total minimums',
          correct: false,
          explanation: 'WORST option! Minimum payments are designed to keep you in debt. At this rate, Sarah will be paying for 25+ YEARS and pay over $20,000 in interest on her $15,000 debt. Almost nothing goes toward the actual balance.',
          mathBreakdown: 'Total paid: $35,000+ over 25 years. That\'s more than DOUBLE what she borrowed!'
        }
      ]
    },
    {
      id: 2,
      title: "Student Loan Dilemma",
      description: "Michael graduated with $45,000 in student loans. He has $2,300/month left after expenses and wants to pay them off smartly.",
      situation: {
        totalDebt: 45000,
        loans: [
          { name: "Federal Loan A", balance: 20000, rate: 4.5, type: "federal", minPayment: 200 },
          { name: "Federal Loan B", balance: 15000, rate: 3.8, type: "federal", minPayment: 150 },
          { name: "Private Bank Loan", balance: 10000, rate: 7.2, type: "private", minPayment: 150 }
        ],
        monthlyIncome: 5500,
        expenses: 3200,
        extraMoney: 2300
      },
      question: "Michael has $2,300/month to put toward loans. Which loan should he prioritize?",
      strategies: [
        {
          id: 'target-highest-balance',
          name: 'Pay the Biggest Loan First',
          description: 'Target the $20,000 Federal Loan A since it\'s the largest',
          correct: false,
          explanation: 'Not the best move. Yes, Federal Loan A is the biggest, but it has a lower rate (4.5%) than the private loan (7.2%). Plus, federal loans have safety features like payment pause options if you hit hard times. The private loan is more dangerous.',
          mathBreakdown: 'You\'d save about $600 more by targeting the 7.2% private loan instead.'
        },
        {
          id: 'invest-instead',
          name: 'Pay Minimums, Invest the Rest',
          description: 'Pay $500 minimums, invest remaining $1,800 in the stock market',
          correct: false,
          explanation: 'Too risky! While the stock market averages 10% over decades, that\'s not guaranteed. The 7.2% private loan IS a guaranteed "debt return." Paying off a 7.2% loan is like earning 7.2% risk-free. Stock market is volatile and could lose money. Pay off high-rate debt first!',
          mathBreakdown: 'Even if stocks average 10%, you\'re risking it all while paying 7.2% guaranteed interest.'
        },
        {
          id: 'split-equally',
          name: 'Split Extra Money Across All Three',
          description: 'Pay minimums, then divide remaining $1,800 equally ($600 to each loan)',
          correct: false,
          explanation: 'This spreads your money too thin. By keeping all three loans alive longer, you pay more interest overall, especially on the expensive 7.2% private loan. It\'s better to focus your firepower.',
          mathBreakdown: 'You\'ll pay about $2,000 more in interest using this approach vs. targeting private first.'
        },
        {
          id: 'target-private',
          name: 'Pay Off Private Loan First',
          description: 'Pay all minimums ($500), then throw remaining $1,800/month at the 7.2% private loan',
          correct: true,
          explanation: 'CORRECT! Private loans are the MOST DANGEROUS type of debt. They have the highest interest rate (7.2%) AND no safety features. Federal loans offer forbearance if you lose your job, income-based repayment, and potential forgiveness. Private loans offer NONE of this. Always kill private loans first!',
          mathBreakdown: 'At 7.2%, Michael pays $720/year just in interest on that $10K. Paying it off fast saves money AND risk.'
        }
      ]
    },
    {
      id: 3,
      title: "Job Loss Emergency",
      description: "Lisa just lost her job. She has $3,000 saved and gets $1,400/month in unemployment. Her debt payments total $790/month.",
      situation: {
        totalDebt: 25000,
        debts: [
          { name: "Credit Cards", balance: 12000, minPayment: 360 },
          { name: "Car Loan", balance: 8000, minPayment: 280 },
          { name: "Personal Loan", balance: 5000, minPayment: 150 }
        ],
        emergencyFund: 3000,
        unemploymentBenefit: 1400,
        totalMinPayments: 790,
        rentAndFood: 1200
      },
      question: "Lisa's debt payments ($790) plus rent/food ($1,200) = $1,990/month, but she only has $1,400 unemployment income. What should she do FIRST?",
      strategies: [
        {
          id: 'use-emergency',
          name: 'Use Savings to Pay Debts',
          description: 'Drain the $3,000 emergency fund to make debt payments',
          correct: false,
          explanation: 'BAD IDEA! That $3,000 is her SURVIVAL MONEY. If she drains it paying debts, what happens when the car breaks down or she needs medicine? Then she\'ll need to use credit cards for emergencies, creating MORE debt. Emergency fund = keep you alive. Keep at least 1-2 months expenses saved.',
          mathBreakdown: '$3,000 might cover 3 months of debt payments, then she\'s broke with no income. What about month 4?'
        },
        {
          id: 'contact-creditors',
          name: 'Call Creditors for Help NOW',
          description: 'Contact all lenders BEFORE missing any payments to ask about hardship programs',
          correct: true,
          explanation: 'CORRECT! Most lenders have "hardship programs" for people who lose jobs. They can temporarily reduce or pause payments. The KEY is calling BEFORE you miss payments. Once you\'re late, your options shrink and your credit gets damaged. Lenders would rather help you than send you to collections!',
          mathBreakdown: 'Example: Credit card companies often reduce minimums from $360 to $100 during hardship. Car lenders can defer 2-3 months of payments. This buys Lisa time to find work.'
        },
        {
          id: 'take-new-loan',
          name: 'Get a Debt Consolidation Loan',
          description: 'Apply for a big loan to combine all debts into one payment',
          correct: false,
          explanation: 'Won\'t work when unemployed. Banks won\'t approve loans without income - you can\'t pay them back! Also, this doesn\'t solve the problem, it just reshuffles debt. The real issue is Lisa needs lower payments RIGHT NOW while she finds work.',
          mathBreakdown: 'Loan applications require proof of income. With $1,400 unemployment and $1,990 in payments, no bank will approve this.'
        },
        {
          id: 'ignore-problem',
          name: 'Skip Payments, Deal With It Later',
          description: 'Stop paying debts and hope it works out',
          correct: false,
          explanation: 'TERRIBLE IDEA! Missed payments immediately hurt your credit score (drops 100+ points). After 30 days, lenders report you as delinquent. After 90 days, they send you to collections. Then you get harassing calls, potential lawsuits, and a wrecked credit score for 7 years. Call creditors FIRST!',
          mathBreakdown: 'One 30-day late payment can drop your credit score from 720 to 600, making future loans much more expensive.'
        }
      ]
    }
  ];

  const handleStrategySelect = (scenarioIndex, strategyId) => {
    setSelectedStrategies({
      ...selectedStrategies,
      [scenarioIndex]: strategyId
    });
  };

  const calculateScore = () => {
    let correctCount = 0;
    scenarios.forEach((scenario, index) => {
      const selectedStrategy = selectedStrategies[index];
      const strategy = scenario.strategies.find(s => s.id === selectedStrategy);
      if (strategy && strategy.correct) {
        correctCount++;
      }
    });
    return correctCount;
  };


  // Save the module score when quiz is completed
  const saveModuleScore = async (finalScore) => {
    setIsSaving(true);
    try {
      // Convert score to percentage (0-100)
      const percentageScore = Math.round((finalScore / scenarios.length) * 100);
      const result = await saveScore(MODULES.DEBT_MANAGEMENT.id, percentageScore, 100);
      setSaveResult(result);
    } catch (err) {
      console.error('Error saving score:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleFinish = async () => {
    const finalScore = calculateScore();
    setScore(finalScore);
    setShowResults(true);

    // Save the score to Firestore
    await saveModuleScore(finalScore);
  };

  const resetModule = () => {
    setCurrentPhase('intro');
    setLearnStep(0);
    setCurrentScenario(0);
    setSelectedStrategies({});
    setShowResults(false);
    setScore(0);
    setSaveResult(null);
  };

  // ==========================================
  // PROGRESS BAR COMPONENT
  // ==========================================
  const ProgressBar = ({ current, total, color = "bg-orange-500" }) => (
    <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
      <motion.div
        className={`h-full ${color} rounded-full`}
        initial={{ width: 0 }}
        animate={{ width: `${(current / total) * 100}%` }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      />
    </div>
  );

  // ==========================================
  // RENDER: INTRO PHASE
  // ==========================================
  const renderIntro = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 p-4 sm:p-6">
      {/* Header */}
      <motion.div
        className="flex items-center justify-between mb-6 bg-white rounded-xl p-4 shadow-lg max-w-2xl mx-auto"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <button
          onClick={() => navigate('/game')}
          className="flex items-center gap-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="hidden sm:inline">Back</span>
        </button>
        <h1 className="text-lg sm:text-xl font-bold text-gray-800">Debt Management</h1>
        <div className="flex items-center gap-2 text-orange-600">
          <CreditCard className="w-5 h-5" />
          <span className="font-semibold text-sm sm:text-base">200 XP</span>
        </div>
      </motion.div>

      <div className="max-w-2xl mx-auto">
        {/* Hero */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-8"
        >
          <div className="text-7xl sm:text-8xl mb-4">
            💳
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mb-2">
            Debt Management Mastery
          </h1>
          <p className="text-gray-600 text-base sm:text-lg">
            Learn to conquer debt and achieve financial freedom!
          </p>
        </motion.div>

        {/* Stats Preview */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-3 gap-3 mb-8"
        >
          {[
            { icon: "📚", label: "4 Lessons", color: "bg-blue-100" },
            { icon: "⏱️", label: "~12 min", color: "bg-green-100" },
            { icon: "🎯", label: "3 Scenarios", color: "bg-amber-100" },
          ].map((item, idx) => (
            <div key={idx} className={`${item.color} rounded-2xl p-3 sm:p-4 text-center`}>
              <div className="text-xl sm:text-2xl mb-1">{item.icon}</div>
              <div className="text-xs sm:text-sm font-semibold text-gray-700">{item.label}</div>
            </div>
          ))}
        </motion.div>

        {/* What You'll Learn */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-gray-100 mb-8"
        >
          <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Sparkles className="text-amber-500" size={20} />
            What you'll learn
          </h2>
          <div className="space-y-3">
            {learningSections.map((section, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <span className="text-2xl">{section.emoji}</span>
                <span className="text-gray-700">{section.title}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Start Button */}
        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setCurrentPhase('learn')}
          className="w-full bg-gradient-to-r from-orange-400 to-red-500 text-white font-bold py-4 px-8 rounded-2xl text-lg shadow-lg shadow-orange-200 flex items-center justify-center gap-2"
        >
          <Play size={24} fill="white" />
          {isReviewMode ? 'REVIEW CONTENT' : 'START LEARNING'}
        </motion.button>
      </div>
    </motion.div>
  );

  // ==========================================
  // RENDER: LEARN PHASE
  // ==========================================
  const renderLearn = () => {
    const section = learningSections[learnStep];

    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`min-h-screen ${section.bgColor}`}>
        {/* Header */}
        <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            <button
              onClick={() => learnStep > 0 ? setLearnStep(prev => prev - 1) : setCurrentPhase('intro')}
              className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft size={24} className="text-gray-600" />
            </button>
            <span className="font-bold text-gray-800">Lesson {learnStep + 1} of {learningSections.length}</span>
            <div className="w-10"></div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-2">
          <ProgressBar current={learnStep + 1} total={learningSections.length} color="bg-gradient-to-r from-orange-400 to-red-500" />
        </div>

        <div className="max-w-2xl mx-auto px-4 py-4">
          <motion.div key={learnStep} initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-4">
            {/* Title Card */}
            <div className={`bg-gradient-to-r ${section.color} rounded-3xl p-5 sm:p-6 text-white shadow-lg`}>
              <div className="text-4xl sm:text-5xl mb-3">
                {section.emoji}
              </div>
              <h2 className="text-xl sm:text-2xl font-black mb-2">{section.title}</h2>
              {section.intro && (
                <p className="text-white/90 text-sm leading-relaxed">{section.intro}</p>
              )}
            </div>

            {/* Learning Points */}
            <div className="space-y-3">
              {section.points.map((point, idx) => (
                <motion.div
                  key={idx}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 + idx * 0.1 }}
                  className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
                >
                  <div className="flex gap-3 sm:gap-4">
                    <div className="text-2xl sm:text-3xl flex-shrink-0">{point.emoji}</div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 mb-2">{point.title}</h3>
                      <p className="text-gray-600 text-sm mb-3 leading-relaxed">{point.desc}</p>
                      <div className={`${section.bgColor} ${section.borderColor} border rounded-xl p-3`}>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          <span className="font-semibold">💡 Example: </span>
                          {point.example}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Fun Fact */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="bg-gradient-to-r from-yellow-100 to-amber-100 rounded-2xl p-4 border border-yellow-200"
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">🤯</span>
                <div>
                  <span className="font-bold text-gray-800">Fun Fact: </span>
                  <span className="text-gray-700">{section.funFact}</span>
                </div>
              </div>
            </motion.div>

            {/* Continue Button */}
            <motion.button
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                if (learnStep < learningSections.length - 1) {
                  setLearnStep(prev => prev + 1);
                } else {
                  setCurrentPhase('quiz');
                }
              }}
              className={`w-full bg-gradient-to-r ${section.color} text-white font-bold py-4 rounded-2xl text-lg shadow-lg flex items-center justify-center gap-2`}
            >
              {learnStep < learningSections.length - 1 ? "CONTINUE" : (isReviewMode ? "REVIEW QUIZ" : "START QUIZ")}
              <ArrowRight size={20} />
            </motion.button>
          </motion.div>
        </div>
      </motion.div>
    );
  };

  // ==========================================
  // RENDER: QUIZ PHASE
  // ==========================================
  const renderQuiz = () => (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 p-4 sm:p-6">
      {/* Header */}
      <motion.div
        className="flex items-center justify-between mb-6 sm:mb-8 bg-white rounded-xl p-4 shadow-lg max-w-4xl mx-auto"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <button
          onClick={() => setCurrentPhase('learn')}
          className="flex items-center gap-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="hidden sm:inline">Back to Lessons</span>
        </button>

        <div className="text-center">
          <h1 className="text-lg sm:text-2xl font-bold text-gray-800">
            {isReviewMode ? 'Quiz Review' : 'Scenario Quiz'}
          </h1>
          <p className="text-xs sm:text-sm text-gray-600">
            {isReviewMode ? 'Reviewing correct answers' : 'Apply what you learned'}
          </p>
        </div>

        <div className="flex items-center gap-2 text-orange-600">
          <CreditCard className="w-5 h-5" />
          <span className="font-semibold text-sm sm:text-base">200 XP</span>
        </div>
      </motion.div>

      <div className="max-w-4xl mx-auto">
        {/* Progress Indicator */}
        <div className="flex items-center justify-center mb-6 sm:mb-8">
          {scenarios.map((_, index) => (
            <div key={index} className="flex items-center">
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-semibold text-sm sm:text-base ${currentScenario >= index ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                {index + 1}
              </div>
              {index < scenarios.length - 1 && <div className={`w-8 sm:w-16 h-1 ${currentScenario > index ? 'bg-orange-500' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentScenario}
            className="bg-white rounded-2xl p-5 sm:p-8 shadow-lg"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
                {scenarios[currentScenario].title}
              </h2>
              <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                {scenarios[currentScenario].description}
              </p>
            </div>

            {/* Situation Details */}
            <div className="bg-gray-50 rounded-lg p-4 sm:p-6 mb-6">
              <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                Financial Situation
              </h3>

              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {scenarios[currentScenario].situation.totalDebt && (
                  <div>
                    <span className="text-xs sm:text-sm text-gray-600">Total Debt</span>
                    <div className="text-lg sm:text-xl font-bold text-red-600">
                      ${scenarios[currentScenario].situation.totalDebt.toLocaleString()}
                    </div>
                  </div>
                )}

                {scenarios[currentScenario].situation.monthlyIncome && (
                  <div>
                    <span className="text-xs sm:text-sm text-gray-600">Monthly Income</span>
                    <div className="text-lg sm:text-xl font-bold text-green-600">
                      ${scenarios[currentScenario].situation.monthlyIncome.toLocaleString()}
                    </div>
                  </div>
                )}

                {scenarios[currentScenario].situation.expenses && (
                  <div>
                    <span className="text-xs sm:text-sm text-gray-600">Monthly Expenses</span>
                    <div className="text-lg sm:text-xl font-bold text-orange-600">
                      ${scenarios[currentScenario].situation.expenses.toLocaleString()}
                    </div>
                  </div>
                )}

                {scenarios[currentScenario].situation.emergencyFund && (
                  <div>
                    <span className="text-xs sm:text-sm text-gray-600">Emergency Fund</span>
                    <div className="text-lg sm:text-xl font-bold text-blue-600">
                      ${scenarios[currentScenario].situation.emergencyFund.toLocaleString()}
                    </div>
                  </div>
                )}
              </div>

              {/* Detailed Debt Breakdown */}
              {scenarios[currentScenario].situation.cards && (
                <div className="mt-4">
                  <h4 className="font-bold text-gray-700 mb-2 text-sm sm:text-base">Credit Cards:</h4>
                  <div className="space-y-2">
                    {scenarios[currentScenario].situation.cards.map((card, index) => (
                      <div key={index} className="flex justify-between text-xs sm:text-sm">
                        <span>{card.name}</span>
                        <span>${card.balance.toLocaleString()} at {card.rate}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {scenarios[currentScenario].situation.loans && (
                <div className="mt-4">
                  <h4 className="font-bold text-gray-700 mb-2 text-sm sm:text-base">Loans:</h4>
                  <div className="space-y-2">
                    {scenarios[currentScenario].situation.loans.map((loan, index) => (
                      <div key={index} className="flex justify-between text-xs sm:text-sm">
                        <span>{loan.name}</span>
                        <span>${loan.balance.toLocaleString()} at {loan.rate}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Strategy Options */}
            <div className="mb-6 sm:mb-8">
              <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-4">
                {isReviewMode ? 'Correct answer:' : "What's the best debt management strategy?"}
              </h3>
              {isReviewMode && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-sm">
                  You're reviewing this module. Answers are shown but cannot be changed.
                </div>
              )}
              <div className="space-y-3">
                {scenarios[currentScenario].strategies.map((strategy) => {
                  const isSelected = selectedStrategies[currentScenario] === strategy.id;
                  const showAsCorrect = isReviewMode && strategy.correct;
                  const showAsIncorrect = isReviewMode && !strategy.correct;

                  return (
                    <motion.div
                      key={strategy.id}
                      className={`w-full p-3 sm:p-4 rounded-lg border-2 text-left transition-all ${
                        showAsCorrect
                          ? 'border-green-500 bg-green-50'
                          : showAsIncorrect
                          ? 'border-gray-200 bg-gray-50 opacity-60'
                          : isSelected
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      } ${isReviewMode ? 'cursor-default' : 'cursor-pointer'}`}
                      onClick={() => !isReviewMode && handleStrategySelect(currentScenario, strategy.id)}
                      whileHover={!isReviewMode ? { scale: 1.01 } : {}}
                      whileTap={!isReviewMode ? { scale: 0.99 } : {}}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 mt-0.5 flex-shrink-0 ${
                          showAsCorrect
                            ? 'border-green-500 bg-green-500'
                            : isSelected
                            ? 'border-orange-500 bg-orange-500'
                            : 'border-gray-300'
                        }`}>
                          {(isSelected || showAsCorrect) && (
                            <div className="w-full h-full rounded-full bg-white scale-50"></div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-gray-800 text-sm sm:text-base">{strategy.name}</h4>
                            {showAsCorrect && (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            )}
                          </div>
                          <p className="text-xs sm:text-sm text-gray-600">{strategy.description}</p>
                          {isReviewMode && strategy.correct && (
                            <p className="text-xs sm:text-sm text-green-700 mt-2 font-medium">
                              {strategy.explanation}
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between">
              <button
                onClick={() => currentScenario === 0 ? setCurrentPhase('learn') : setCurrentScenario(Math.max(0, currentScenario - 1))}
                className="px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition bg-gray-300 hover:bg-gray-400 text-gray-700 text-sm sm:text-base"
              >
                Previous
              </button>

              {currentScenario < scenarios.length - 1 ? (
                <button
                  onClick={() => setCurrentScenario(currentScenario + 1)}
                  disabled={!isReviewMode && !selectedStrategies[currentScenario]}
                  className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition text-sm sm:text-base ${
                    !isReviewMode && !selectedStrategies[currentScenario]
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-orange-500 hover:bg-orange-600 text-white'
                  }`}
                >
                  Next Scenario
                </button>
              ) : isReviewMode ? (
                <button
                  onClick={() => navigate('/game')}
                  className="px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition text-sm sm:text-base bg-blue-500 hover:bg-blue-600 text-white"
                >
                  Finish Review
                </button>
              ) : (
                <button
                  onClick={handleFinish}
                  disabled={!selectedStrategies[currentScenario]}
                  className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition text-sm sm:text-base ${!selectedStrategies[currentScenario]
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-green-500 hover:bg-green-600 text-white'
                    }`}
                >
                  Get Results
                </button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );

  // ==========================================
  // RENDER: RESULTS PHASE
  // ==========================================
  const renderResults = () => (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 p-4 sm:p-6">
      <motion.div
        className="max-w-4xl mx-auto"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="bg-white rounded-2xl p-5 sm:p-8 shadow-lg">
          <div className="text-center mb-6 sm:mb-8">
            <TrendingDown className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-green-500 mb-4" />
            <h2 className="text-xl sm:text-3xl font-bold text-gray-800 mb-2">Debt Analysis Complete!</h2>
            <p className="text-lg sm:text-xl text-gray-600">
              You scored {score} out of {scenarios.length} scenarios correctly
            </p>

            {/* Save Status Indicator */}
            {isSaving && (
              <div className="mt-4 text-blue-600 flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span>Saving your progress...</span>
              </div>
            )}

            {!isSaving && saveResult && (
              <div className={`mt-4 p-3 rounded-lg ${saveResult.passed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                {saveResult.passed ? (
                  <>
                    <div className="font-semibold flex items-center justify-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      Module Completed! 🎉
                    </div>
                    <div className="text-sm mt-1">Your progress has been saved</div>
                  </>
                ) : (
                  <>
                    <div className="font-semibold">Progress Saved</div>
                    <div className="text-sm mt-1">You need 100% to pass. Try again!</div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Detailed Results */}
          <div className="space-y-4 sm:space-y-6 mb-6 sm:mb-8">
            {scenarios.map((scenario, index) => {
              const selectedStrategy = selectedStrategies[index];
              const strategy = scenario.strategies.find(s => s.id === selectedStrategy);
              const isCorrect = strategy && strategy.correct;

              return (
                <div key={scenario.id} className={`p-4 sm:p-6 rounded-lg border-2 ${isCorrect ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'
                  }`}>
                  <div className="flex items-start gap-3 mb-3">
                    {isCorrect ? (
                      <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-500 mt-1 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-500 mt-1 flex-shrink-0" />
                    )}
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-gray-800">{scenario.title}</h3>
                      <p className="text-xs sm:text-sm text-gray-600 mb-2">Your choice: {strategy?.name}</p>
                      <p className={`text-xs sm:text-sm font-medium ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                        {strategy?.explanation}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <button
              onClick={() => navigate('/game')}
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition"
            >
              Back to Roadmap
            </button>
            <button
              onClick={resetModule}
              className="px-6 py-3 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-xl font-medium transition"
            >
              Try Again
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );

  // Start review mode - pre-populate correct answers for display
  const startReviewMode = () => {
    // Pre-select correct answers for each scenario
    const correctAnswers = {};
    scenarios.forEach((scenario, index) => {
      const correctStrategy = scenario.strategies.find(s => s.correct);
      if (correctStrategy) {
        correctAnswers[index] = correctStrategy.id;
      }
    });
    setSelectedStrategies(correctAnswers);
    setIsReviewMode(true);
    setCurrentPhase('intro');
  };

  // If module is already passed and not in review mode, show completion screen
  if (modulePassed && !isReviewMode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 p-6 flex items-center justify-center">
        <motion.div
          className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="text-6xl mb-4"
            animate={{ rotate: [0, -10, 10, -10, 0] }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            💳
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Module Completed!</h2>
          <p className="text-gray-600 mb-6">
            You've already passed the Debt Management module. Great job learning how to manage and eliminate debt!
          </p>
          <div className="bg-green-50 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-center gap-2 text-green-600">
              <span className="text-2xl">✓</span>
              <span className="font-semibold">100% Complete</span>
            </div>
          </div>
          <div className="space-y-3">
            <motion.button
              onClick={startReviewMode}
              className="w-full px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-semibold transition"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Review Module
            </motion.button>
            <motion.button
              onClick={() => navigate('/game')}
              className="w-full px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold transition"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Back to Learning Path
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ==========================================
  // MAIN RENDER - PHASE-BASED
  // ==========================================
  return (
    <AnimatePresence mode="wait">
      {currentPhase === 'intro' && renderIntro()}
      {currentPhase === 'learn' && renderLearn()}
      {currentPhase === 'quiz' && !showResults && renderQuiz()}
      {(currentPhase === 'quiz' && showResults) && renderResults()}
    </AnimatePresence>
  );
};

export default DebtManagementModule;