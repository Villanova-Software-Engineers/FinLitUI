import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Landmark, TrendingUp, CheckCircle, AlertCircle, Play, Sparkles, Clock, DollarSign, PiggyBank, Building2, Briefcase, Heart, Calculator, Gift, Shield, Percent } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useModuleScore, MODULES } from '../hooks/useModuleScore';

const RetirementAccountsModule = () => {
  const navigate = useNavigate();
  const { isModulePassed, saveScore } = useModuleScore();

  // Check if module is already passed
  const modulePassed = isModulePassed(MODULES.RETIREMENT_ACCOUNTS?.id);

  // Review mode - allows viewing content without answering
  const [isReviewMode, setIsReviewMode] = useState(false);

  // Phase management
  const [currentPhase, setCurrentPhase] = useState('intro');
  const [learnStep, setLearnStep] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  // Module score saving state
  const [isSaving, setIsSaving] = useState(false);
  const [saveResult, setSaveResult] = useState(null);

  // ==========================================
  // LEARNING CONTENT - Retirement Journey
  // ==========================================
  const learningSections = [
    {
      id: 'why-retirement',
      title: "Why Save for Retirement?",
      emoji: "🏖️",
      color: "from-sky-400 to-blue-600",
      bgColor: "bg-sky-50",
      borderColor: "border-sky-200",
      icon: Clock,
      intro: "Time is your greatest asset. Starting early can mean millions more at retirement.",
      points: [
        {
          emoji: "⏰",
          title: "The Power of Time",
          desc: "Starting at 25 vs 35 can double your retirement savings, even with the same contributions.",
          example: "$500/month from age 25 = $1.4M at 65. Starting at 35 = only $680K!"
        },
        {
          emoji: "📈",
          title: "Compound Growth",
          desc: "Your money earns returns, then those returns earn returns. It snowballs over decades.",
          example: "$10K invested at 7% = $76K in 30 years without adding a penny!"
        },
        {
          emoji: "🎯",
          title: "The Goal",
          desc: "Most experts suggest saving 10-15% of income for retirement. More if you start late.",
          example: "At $60K salary, aim for $6K-$9K per year in retirement savings."
        }
      ],
      funFact: "The average retirement lasts 20+ years. That's a lot of expenses to cover! 💰"
    },
    {
      id: '401k-basics',
      title: "401(k) Essentials",
      emoji: "🏢",
      color: "from-violet-400 to-purple-600",
      bgColor: "bg-violet-50",
      borderColor: "border-violet-200",
      icon: Building2,
      intro: "Your employer's 401(k) is often the best place to start saving for retirement.",
      points: [
        {
          emoji: "💼",
          title: "What is a 401(k)?",
          desc: "An employer-sponsored retirement account. Money comes out of your paycheck before taxes.",
          example: "Earn $5K/month, contribute $500 = only taxed on $4,500!"
        },
        {
          emoji: "🎁",
          title: "Employer Match = Free Money",
          desc: "Many employers match your contributions up to a percentage. ALWAYS get the full match!",
          example: "50% match on 6% = You put $3K, employer adds $1.5K. That's 50% instant return!"
        },
        {
          emoji: "📊",
          title: "2024 Contribution Limits",
          desc: "$23,000/year if under 50. $30,500 if 50+ (catch-up contribution).",
          example: "Maxing out at $23K/year for 30 years at 7% = over $2.3 million!"
        }
      ],
      funFact: "About 1 in 4 employees don't contribute enough to get their full employer match! 😱"
    },
    {
      id: 'traditional-vs-roth',
      title: "Traditional vs Roth",
      emoji: "⚖️",
      color: "from-amber-400 to-orange-500",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-200",
      icon: Calculator,
      intro: "The big question: Pay taxes now or later? Your answer depends on your situation.",
      points: [
        {
          emoji: "📜",
          title: "Traditional (Pre-Tax)",
          desc: "Contribute pre-tax money, pay taxes when you withdraw in retirement.",
          example: "Best if you're in a HIGH tax bracket now and expect LOWER taxes in retirement."
        },
        {
          emoji: "🌟",
          title: "Roth (After-Tax)",
          desc: "Contribute after-tax money, withdrawals in retirement are TAX-FREE!",
          example: "Best if you're in a LOW tax bracket now and expect HIGHER taxes later."
        },
        {
          emoji: "🎯",
          title: "The Strategy",
          desc: "Many experts suggest having both types for tax diversification in retirement.",
          example: "Young? Often Roth is better. Higher earner? Traditional may save more now."
        }
      ],
      funFact: "Roth accounts have NO required minimum distributions (RMDs) - you control when to withdraw! 🎉"
    },
    {
      id: 'roth-ira-deep-dive',
      title: "Roth IRA Deep Dive",
      emoji: "⭐",
      color: "from-emerald-400 to-teal-600",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-200",
      icon: PiggyBank,
      intro: "The Roth IRA is incredibly powerful - tax-free growth AND tax-free withdrawals!",
      points: [
        {
          emoji: "💵",
          title: "2024 Contribution Limits",
          desc: "$7,000/year if under 50. $8,000 if 50+. Income limits apply!",
          example: "Single filers: Full contribution if income under $146K. Phases out by $161K."
        },
        {
          emoji: "🔓",
          title: "Flexible Withdrawals",
          desc: "You can withdraw YOUR contributions (not earnings) anytime, tax and penalty-free.",
          example: "Emergency fund backup! Contributed $20K over years? Access that $20K anytime."
        },
        {
          emoji: "🚀",
          title: "Backdoor Roth",
          desc: "Too high income? Contribute to Traditional IRA, then convert to Roth.",
          example: "High earners use this loophole to still benefit from Roth advantages."
        }
      ],
      funFact: "A 25-year-old maxing Roth IRA ($7K/year) until 65 could have $1.5M+ TAX-FREE! 🤑"
    },
    {
      id: 'investment-strategies',
      title: "Investment Strategies",
      emoji: "🎯",
      color: "from-rose-400 to-pink-600",
      bgColor: "bg-rose-50",
      borderColor: "border-rose-200",
      icon: TrendingUp,
      intro: "How you invest matters as much as how much you save.",
      points: [
        {
          emoji: "📅",
          title: "Target-Date Funds",
          desc: "Set-and-forget funds that automatically adjust risk as you approach retirement.",
          example: "Target 2055 Fund = aggressive now, conservative by 2055. Perfect for beginners!"
        },
        {
          emoji: "📊",
          title: "Asset Allocation",
          desc: "Rule of thumb: 110 minus your age = % in stocks. Rest in bonds.",
          example: "Age 30: 80% stocks, 20% bonds. Age 60: 50% stocks, 50% bonds."
        },
        {
          emoji: "💸",
          title: "Low-Cost Index Funds",
          desc: "Fees eat returns! A 1% fee can cost $200K+ over 40 years.",
          example: "S&P 500 index fund at 0.03% fee vs actively managed at 1% = HUGE difference!"
        }
      ],
      funFact: "Over 20+ years, 90% of actively managed funds UNDERPERFORM simple index funds! 📉"
    },
    {
      id: 'retirement-rules',
      title: "Key Rules & Penalties",
      emoji: "📋",
      color: "from-indigo-400 to-blue-600",
      bgColor: "bg-indigo-50",
      borderColor: "border-indigo-200",
      icon: Shield,
      intro: "Know the rules to avoid costly penalties and maximize your benefits.",
      points: [
        {
          emoji: "⚠️",
          title: "Early Withdrawal Penalty",
          desc: "Generally, withdrawing before 59½ = 10% penalty PLUS income taxes.",
          example: "Withdraw $10K early from Traditional = $1K penalty + ~$2.5K taxes = only $6.5K!"
        },
        {
          emoji: "👴",
          title: "Required Minimum Distributions",
          desc: "Traditional accounts require withdrawals starting at age 73 (as of 2024).",
          example: "Roth IRAs have NO RMDs - your money can grow tax-free your entire life!"
        },
        {
          emoji: "🏠",
          title: "Exceptions Exist",
          desc: "First-time home purchase ($10K), disability, and other exceptions avoid penalties.",
          example: "Roth IRA: $10K penalty-free for first home after 5 years account age."
        }
      ],
      funFact: "The 'Rule of 55' lets you access 401(k) penalty-free if you leave your job at 55+! 🎂"
    }
  ];

  // ==========================================
  // QUIZ QUESTIONS
  // ==========================================
  const quizQuestions = [
    {
      id: 1,
      question: "What is the 2024 contribution limit for a 401(k) if you're under 50?",
      options: [
        { id: 'a', text: "$6,500", correct: false },
        { id: 'b', text: "$23,000", correct: true },
        { id: 'c', text: "$19,500", correct: false },
        { id: 'd', text: "$30,500", correct: false }
      ],
      explanation: "The 2024 401(k) contribution limit is $23,000 for those under 50. The $30,500 limit is for those 50+ (includes catch-up contributions)."
    },
    {
      id: 2,
      question: "What's the key benefit of a Roth IRA compared to a Traditional IRA?",
      options: [
        { id: 'a', text: "Higher contribution limits", correct: false },
        { id: 'b', text: "Immediate tax deduction", correct: false },
        { id: 'c', text: "Tax-free withdrawals in retirement", correct: true },
        { id: 'd', text: "No income limits", correct: false }
      ],
      explanation: "Roth IRA contributions are made with after-tax money, but all qualified withdrawals in retirement are completely tax-free!"
    },
    {
      id: 3,
      question: "Your employer offers a 50% match on 401(k) contributions up to 6% of your salary. If you earn $60,000 and contribute 6%, how much FREE money do you get from your employer annually?",
      options: [
        { id: 'a', text: "$1,800", correct: true },
        { id: 'b', text: "$3,600", correct: false },
        { id: 'c', text: "$900", correct: false },
        { id: 'd', text: "$6,000", correct: false }
      ],
      explanation: "6% of $60,000 = $3,600. Employer matches 50% of that = $1,800 FREE per year! Always get the full match."
    },
    {
      id: 4,
      question: "What happens if you withdraw from a Traditional 401(k) before age 59½?",
      options: [
        { id: 'a', text: "No penalty, just taxes", correct: false },
        { id: 'b', text: "10% penalty plus income taxes", correct: true },
        { id: 'c', text: "Only 5% penalty", correct: false },
        { id: 'd', text: "Tax-free if for emergency", correct: false }
      ],
      explanation: "Early withdrawals typically face a 10% penalty PLUS regular income taxes. A $10K withdrawal could cost you $3,500+ in penalties and taxes!"
    },
    {
      id: 5,
      question: "Which retirement strategy is generally recommended for young people in lower tax brackets?",
      options: [
        { id: 'a', text: "Only Traditional accounts", correct: false },
        { id: 'b', text: "Roth accounts (pay taxes now)", correct: true },
        { id: 'c', text: "No retirement savings until 40", correct: false },
        { id: 'd', text: "Keep cash in savings account", correct: false }
      ],
      explanation: "Young people often benefit more from Roth accounts - pay taxes at today's lower rate and enjoy tax-free growth for decades!"
    },
    {
      id: 6,
      question: "What is a target-date fund?",
      options: [
        { id: 'a', text: "A fund that only invests in bonds", correct: false },
        { id: 'b', text: "A fund that automatically adjusts risk as you approach retirement", correct: true },
        { id: 'c', text: "A fund with a guaranteed return by a specific date", correct: false },
        { id: 'd', text: "A short-term investment option", correct: false }
      ],
      explanation: "Target-date funds automatically become more conservative (less risky) as you get closer to retirement. Perfect for hands-off investors!"
    },
    {
      id: 7,
      question: "What is the 'backdoor Roth' strategy used for?",
      options: [
        { id: 'a', text: "Avoiding all taxes on retirement savings", correct: false },
        { id: 'b', text: "Allowing high earners to contribute to a Roth IRA", correct: true },
        { id: 'c', text: "Withdrawing early without penalties", correct: false },
        { id: 'd', text: "Doubling contribution limits", correct: false }
      ],
      explanation: "High earners who exceed Roth IRA income limits can contribute to a Traditional IRA and then convert it to a Roth - the 'backdoor' method."
    },
    {
      id: 8,
      question: "At what age must you start taking Required Minimum Distributions (RMDs) from a Traditional 401(k)?",
      options: [
        { id: 'a', text: "59½", correct: false },
        { id: 'b', text: "65", correct: false },
        { id: 'c', text: "73", correct: true },
        { id: 'd', text: "There are no required distributions", correct: false }
      ],
      explanation: "As of 2024, RMDs from Traditional retirement accounts must begin at age 73. Roth IRAs have NO RMDs!"
    },
    {
      id: 9,
      question: "Why are low-cost index funds often recommended for retirement accounts?",
      options: [
        { id: 'a', text: "They guarantee higher returns", correct: false },
        { id: 'b', text: "They have no risk", correct: false },
        { id: 'c', text: "Lower fees mean more money stays invested and growing", correct: true },
        { id: 'd', text: "They are FDIC insured", correct: false }
      ],
      explanation: "A 1% fee difference can cost $200K+ over 40 years! Index funds typically have fees under 0.1% vs 1%+ for actively managed funds."
    },
    {
      id: 10,
      question: "How much can you withdraw penalty-free from a Roth IRA for a first-time home purchase (after 5 years)?",
      options: [
        { id: 'a', text: "$5,000", correct: false },
        { id: 'b', text: "$10,000", correct: true },
        { id: 'c', text: "$25,000", correct: false },
        { id: 'd', text: "Unlimited if it's your first home", correct: false }
      ],
      explanation: "Up to $10,000 of earnings can be withdrawn penalty-free for a first-time home purchase, plus you can always withdraw your contributions tax and penalty-free."
    }
  ];

  const handleAnswerSelect = (questionIndex, answerId) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionIndex]: answerId
    });
  };

  const calculateScore = () => {
    let correct = 0;
    quizQuestions.forEach((q, index) => {
      const selectedAnswer = selectedAnswers[index];
      const correctOption = q.options.find(opt => opt.correct);
      if (selectedAnswer === correctOption?.id) {
        correct++;
      }
    });
    return correct;
  };

  // Pass threshold for this module is 80%
  const RETIREMENT_PASS_THRESHOLD = 80;

  const saveModuleScore = async (finalScore) => {
    setIsSaving(true);
    try {
      const percentageScore = Math.round((finalScore / quizQuestions.length) * 100);
      // For retirement module, 80% is passing - we scale the score so 80% becomes 100% for the system
      const adjustedScore = percentageScore >= RETIREMENT_PASS_THRESHOLD ? 100 : percentageScore;
      const result = await saveScore(MODULES.RETIREMENT_ACCOUNTS.id, adjustedScore, 100);
      // Override the passed status based on our 80% threshold
      setSaveResult({
        ...result,
        passed: percentageScore >= RETIREMENT_PASS_THRESHOLD,
        actualPercentage: percentageScore
      });
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
    await saveModuleScore(finalScore);
  };

  const resetModule = () => {
    setCurrentPhase('intro');
    setLearnStep(0);
    setCurrentQuestion(0);
    setSelectedAnswers({});
    setShowResults(false);
    setScore(0);
    setSaveResult(null);
  };

  // ==========================================
  // UNIQUE TIMELINE PROGRESS COMPONENT
  // ==========================================
  const TimelineProgress = ({ current, total }) => (
    <div className="relative py-4">
      <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -translate-y-1/2" />
      <div
        className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-emerald-400 to-teal-500 -translate-y-1/2 transition-all duration-500"
        style={{ width: `${(current / total) * 100}%` }}
      />
      <div className="relative flex justify-between">
        {Array.from({ length: total }, (_, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
              i < current
                ? 'bg-gradient-to-r from-emerald-400 to-teal-500 text-white shadow-lg'
                : i === current
                  ? 'bg-white border-2 border-teal-500 text-teal-600 shadow-md'
                  : 'bg-gray-100 text-gray-400'
            }`}
          >
            {i < current ? '✓' : i + 1}
          </motion.div>
        ))}
      </div>
    </div>
  );

  // ==========================================
  // ANIMATED RETIREMENT CALCULATOR VISUAL
  // ==========================================
  const RetirementVisual = () => (
    <div className="relative h-32 mb-6 overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500">
      <div className="absolute inset-0 flex items-center justify-around">
        {/* Age markers */}
        {[25, 35, 45, 55, 65].map((age, i) => (
          <motion.div
            key={age}
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: i * 0.15 }}
            className="text-center"
          >
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
              className="text-2xl mb-1"
            >
              {i === 0 ? '🎓' : i === 4 ? '🏖️' : '💰'}
            </motion.div>
            <div className="text-white font-bold text-sm">Age {age}</div>
          </motion.div>
        ))}
      </div>
      {/* Moving coin animation */}
      <motion.div
        animate={{ x: [0, 300], y: [-10, 10, -10] }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        className="absolute top-4 left-4 text-2xl"
      >
        💵
      </motion.div>
    </div>
  );

  // ==========================================
  // RENDER: INTRO PHASE
  // ==========================================
  const renderIntro = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-4 sm:p-6">
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
        <h1 className="text-lg sm:text-xl font-bold text-gray-800">Retirement Accounts</h1>
        <div className="flex items-center gap-2 text-emerald-600">
          <Landmark className="w-5 h-5" />
          <span className="font-semibold text-sm sm:text-base">200 XP</span>
        </div>
      </motion.div>

      <div className="max-w-2xl mx-auto">
        {/* Hero with Animated Visual */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-6"
        >
          <RetirementVisual />
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-6xl sm:text-7xl mb-4"
          >
            🏦
          </motion.div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mb-2">
            Retirement Accounts Mastery
          </h1>
          <p className="text-gray-600 text-base sm:text-lg">
            401(k), Roth IRA, and your path to financial freedom!
          </p>
        </motion.div>

        {/* Account Types Preview */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 gap-3 mb-6"
        >
          {[
            { icon: Building2, label: "401(k)", color: "bg-violet-100 text-violet-600" },
            { icon: PiggyBank, label: "Roth IRA", color: "bg-emerald-100 text-emerald-600" },
            { icon: Briefcase, label: "Traditional IRA", color: "bg-amber-100 text-amber-600" },
            { icon: Calculator, label: "Tax Strategy", color: "bg-rose-100 text-rose-600" },
          ].map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3 + idx * 0.1 }}
              className={`${item.color} rounded-2xl p-4 text-center`}
            >
              <item.icon className="w-8 h-8 mx-auto mb-2" />
              <div className="text-sm font-semibold">{item.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Stats Preview */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-3 gap-3 mb-6"
        >
          {[
            { icon: "📚", label: "6 Lessons", color: "bg-blue-100" },
            { icon: "⏱️", label: "~15 min", color: "bg-green-100" },
            { icon: "❓", label: "10 Questions", color: "bg-amber-100" },
          ].map((item, idx) => (
            <div key={idx} className={`${item.color} rounded-2xl p-3 sm:p-4 text-center`}>
              <div className="text-xl sm:text-2xl mb-1">{item.icon}</div>
              <div className="text-xs sm:text-sm font-semibold text-gray-700">{item.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Key Highlights */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-gray-100 mb-6"
        >
          <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Sparkles className="text-amber-500" size={20} />
            What you'll master
          </h2>
          <div className="space-y-3">
            {learningSections.map((section, idx) => (
              <motion.div
                key={idx}
                className="flex items-center gap-3"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.5 + idx * 0.1 }}
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${section.color} flex items-center justify-center`}>
                  <span className="text-lg">{section.emoji}</span>
                </div>
                <span className="text-gray-700 font-medium">{section.title}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Start Button */}
        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setCurrentPhase('learn')}
          className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold py-4 px-8 rounded-2xl text-lg shadow-lg shadow-emerald-200 flex items-center justify-center gap-2"
        >
          <Play size={24} fill="white" />
          START YOUR JOURNEY
        </motion.button>
      </div>
    </motion.div>
  );

  // ==========================================
  // RENDER: LEARN PHASE
  // ==========================================
  const renderLearn = () => {
    const section = learningSections[learnStep];
    const Icon = section.icon;

    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`min-h-screen ${section.bgColor}`}>
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-sm border-b border-teal-100 py-3 px-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/game')}
                className="flex items-center gap-2 text-gray-600 hover:text-teal-600 transition-colors font-medium group"
              >
                <div className="p-2 rounded-lg bg-teal-50 group-hover:bg-teal-100 transition-colors">
                  <ArrowLeft size={18} />
                </div>
                <span className="hidden sm:inline">Learning Path</span>
              </button>
              {learnStep > 0 && (
                <>
                  <div className="h-6 w-px bg-gray-300"></div>
                  <button
                    onClick={() => setLearnStep(prev => prev - 1)}
                    className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm font-medium"
                  >
                    <ArrowLeft size={14} />
                    <span>Previous Lesson</span>
                  </button>
                </>
              )}
            </div>

            <div className="flex-1 max-w-md mx-8">
              <div className="flex justify-between mb-1">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Progress</span>
                <span className="text-xs font-bold text-teal-600 uppercase tracking-wider">
                  {learnStep + 1} / {learningSections.length}
                </span>
              </div>
              <div className="w-full bg-teal-100 h-1.5 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                  initial={{ width: `${(learnStep / learningSections.length) * 100}%` }}
                  animate={{ width: `${((learnStep + 1) / learningSections.length) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-right">
                <span className="block text-xs font-bold text-gray-900 leading-tight">Retirement Accounts</span>
                <span className="block text-[10px] font-semibold text-gray-500 uppercase">Module</span>
              </span>
            </div>
          </div>
        </header>

        <div className="max-w-2xl mx-auto px-4 py-3">
          <TimelineProgress current={learnStep + 1} total={learningSections.length} />
        </div>

        <div className="max-w-2xl mx-auto px-4 py-4">
          <motion.div key={learnStep} initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-4">
            {/* Title Card */}
            <div className={`bg-gradient-to-r ${section.color} rounded-3xl p-5 sm:p-6 text-white shadow-lg relative overflow-hidden`}>
              {/* Background Icon */}
              <div className="absolute right-4 top-4 opacity-20">
                <Icon size={80} />
              </div>
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                className="text-4xl sm:text-5xl mb-3 relative z-10"
              >
                {section.emoji}
              </motion.div>
              <h2 className="text-xl sm:text-2xl font-black mb-2 relative z-10">{section.title}</h2>
              <p className="text-white/90 text-sm leading-relaxed relative z-10">{section.intro}</p>
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
                    <motion.div
                      className="text-2xl sm:text-3xl flex-shrink-0"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity, delay: idx * 0.3 }}
                    >
                      {point.emoji}
                    </motion.div>
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
                <motion.span
                  className="text-2xl"
                  animate={{ rotate: [0, 15, -15, 0] }}
                  transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
                >
                  🤯
                </motion.span>
                <div>
                  <span className="font-bold text-gray-800">Did You Know? </span>
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
                } else if (isReviewMode) {
                  navigate('/game');
                } else {
                  setCurrentPhase('quiz');
                }
              }}
              className={`w-full bg-gradient-to-r ${section.color} text-white font-bold py-4 rounded-2xl text-lg shadow-lg flex items-center justify-center gap-2`}
            >
              {learnStep < learningSections.length - 1 ? "CONTINUE JOURNEY" : (isReviewMode ? "FINISH REVIEW" : "START QUIZ")}
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
  const renderQuiz = () => {
    const question = quizQuestions[currentQuestion];

    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-4 sm:p-6">
        {/* Header */}
        <motion.div
          className="flex items-center justify-between mb-6 bg-white rounded-xl p-4 shadow-lg max-w-2xl mx-auto"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/game')}
              className="flex items-center gap-2 text-gray-600 hover:text-teal-600 transition-colors font-medium group"
            >
              <div className="p-2 rounded-lg bg-teal-50 group-hover:bg-teal-100 transition-colors">
                <ArrowLeft size={18} />
              </div>
              <span className="hidden sm:inline">Learning Path</span>
            </button>
            {currentQuestion > 0 && (
              <>
                <div className="h-6 w-px bg-gray-300"></div>
                <button
                  onClick={() => setCurrentQuestion(prev => prev - 1)}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm font-medium"
                >
                  <ArrowLeft size={14} />
                  <span>Previous</span>
                </button>
              </>
            )}
          </div>
          <div className="text-center">
            <h1 className="text-lg sm:text-xl font-bold text-gray-800">Knowledge Check</h1>
            <p className="text-xs sm:text-sm text-gray-600">Question {currentQuestion + 1} of {quizQuestions.length}</p>
          </div>
          <div className="flex items-center gap-2 text-emerald-600">
            <Landmark className="w-5 h-5" />
            <span className="font-semibold text-sm">200 XP</span>
          </div>
        </motion.div>

        <div className="max-w-2xl mx-auto">
          {/* Progress Dots */}
          <div className="flex items-center justify-center gap-2 mb-6 flex-wrap">
            {quizQuestions.map((_, index) => (
              <motion.div
                key={index}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className={`w-3 h-3 rounded-full transition-all ${
                  selectedAnswers[index]
                    ? 'bg-emerald-500'
                    : index === currentQuestion
                      ? 'bg-teal-400 ring-4 ring-teal-200'
                      : 'bg-gray-200'
                }`}
              />
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion}
              className="bg-white rounded-2xl p-5 sm:p-8 shadow-lg"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
            >
              {/* Question */}
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center text-white font-bold">
                    {currentQuestion + 1}
                  </div>
                  <div className="text-sm text-gray-500">Question</div>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-800 leading-relaxed">
                  {question.question}
                </h2>
              </div>

              {/* Options */}
              <div className="space-y-3 mb-6">
                {question.options.map((option, idx) => (
                  <motion.button
                    key={option.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                      selectedAnswers[currentQuestion] === option.id
                        ? 'border-teal-500 bg-teal-50 shadow-md'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                    onClick={() => handleAnswerSelect(currentQuestion, option.id)}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-sm ${
                        selectedAnswers[currentQuestion] === option.id
                          ? 'border-teal-500 bg-teal-500 text-white'
                          : 'border-gray-300 text-gray-500'
                      }`}>
                        {option.id.toUpperCase()}
                      </div>
                      <span className="text-gray-800 font-medium">{option.text}</span>
                    </div>
                  </motion.button>
                ))}
              </div>

              {/* Navigation */}
              <div className="flex justify-between">
                <button
                  onClick={() => currentQuestion === 0 ? setCurrentPhase('learn') : setCurrentQuestion(prev => prev - 1)}
                  className="px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-medium bg-gray-200 hover:bg-gray-300 text-gray-700 transition"
                >
                  Previous
                </button>

                {currentQuestion < quizQuestions.length - 1 ? (
                  <button
                    onClick={() => setCurrentQuestion(prev => prev + 1)}
                    disabled={!selectedAnswers[currentQuestion]}
                    className={`px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-medium transition ${
                      !selectedAnswers[currentQuestion]
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-md'
                    }`}
                  >
                    Next Question
                  </button>
                ) : (
                  <button
                    onClick={handleFinish}
                    disabled={!selectedAnswers[currentQuestion]}
                    className={`px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-medium transition ${
                      !selectedAnswers[currentQuestion]
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-md'
                    }`}
                  >
                    See Results
                  </button>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    );
  };

  // ==========================================
  // RENDER: RESULTS PHASE
  // ==========================================
  const renderResults = () => {
    const percentage = Math.round((score / quizQuestions.length) * 100);
    const passed = percentage >= RETIREMENT_PASS_THRESHOLD;

    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-4 sm:p-6">
        <motion.div
          className="max-w-2xl mx-auto"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          {/* Results Card */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg mb-6">
            <div className="text-center mb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="text-6xl sm:text-7xl mb-4"
              >
                {passed ? '🎉' : '📚'}
              </motion.div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
                {passed ? 'Retirement Expert!' : 'Keep Learning!'}
              </h2>
              <p className="text-lg text-gray-600">
                You scored {score} out of {quizQuestions.length} ({percentage}%)
              </p>

              {/* Score Visual */}
              <div className="mt-6 flex justify-center">
                <div className="relative w-32 h-32">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="12"
                    />
                    <motion.circle
                      cx="64"
                      cy="64"
                      r="56"
                      fill="none"
                      stroke={passed ? "#10b981" : "#f59e0b"}
                      strokeWidth="12"
                      strokeLinecap="round"
                      initial={{ strokeDasharray: "0 352" }}
                      animate={{ strokeDasharray: `${(percentage / 100) * 352} 352` }}
                      transition={{ duration: 1, delay: 0.5 }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`text-2xl font-bold ${passed ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {percentage}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Save Status */}
              {isSaving && (
                <div className="mt-4 text-blue-600 flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span>Saving your progress...</span>
                </div>
              )}

              {!isSaving && saveResult && (
                <div className={`mt-4 p-3 rounded-lg ${saveResult.passed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  {saveResult.passed ? (
                    <div className="flex items-center justify-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-semibold">Module Completed! 🎉</span>
                    </div>
                  ) : (
                    <div>
                      <div className="font-semibold">Progress Saved</div>
                      <div className="text-sm">You need 80% to pass. Review and try again!</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Detailed Results */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-lg mb-6">
            <h3 className="font-bold text-gray-800 mb-4">Review Your Answers</h3>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {quizQuestions.map((q, idx) => {
                const selectedAnswer = selectedAnswers[idx];
                const correctOption = q.options.find(opt => opt.correct);
                const isCorrect = selectedAnswer === correctOption?.id;
                const selectedOption = q.options.find(opt => opt.id === selectedAnswer);

                return (
                  <div key={q.id} className={`p-4 rounded-xl border-2 ${isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                    <div className="flex items-start gap-2 mb-2">
                      {isCorrect ? (
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-gray-800 text-sm">{q.question}</p>
                        <p className="text-xs text-gray-600 mt-1">
                          Your answer: <span className={isCorrect ? 'text-green-600' : 'text-red-600'}>{selectedOption?.text}</span>
                        </p>
                        {!isCorrect && (
                          <p className="text-xs text-green-600 mt-1">
                            Correct: {correctOption?.text}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 mt-2 italic">{q.explanation}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate('/game')}
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition"
            >
              Back to Learning Path
            </button>
            <button
              onClick={resetModule}
              className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-medium transition"
            >
              Try Again
            </button>
          </div>
        </motion.div>
      </div>
    );
  };

  // Start review mode
  const startReviewMode = () => {
    setIsReviewMode(true);
    setCurrentPhase('intro');
    setLearnStep(0);
  };

  // ==========================================
  // ALREADY PASSED VIEW
  // ==========================================
  if (modulePassed && !isReviewMode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-6 flex items-center justify-center">
        <motion.div
          className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <motion.div
            className="text-6xl mb-4"
            animate={{ rotate: [0, -10, 10, -10, 0] }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            🏦
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Module Completed!</h2>
          <p className="text-gray-600 mb-6">
            You've mastered Retirement Accounts! You now understand 401(k)s, IRAs, and how to build wealth for your future.
          </p>
          <div className="bg-emerald-50 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-center gap-2 text-emerald-600">
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
  // MAIN RENDER
  // ==========================================
  return (
    <AnimatePresence mode="wait">
      {currentPhase === 'intro' && renderIntro()}
      {currentPhase === 'learn' && renderLearn()}
      {currentPhase === 'quiz' && !showResults && renderQuiz()}
      {currentPhase === 'quiz' && showResults && renderResults()}
    </AnimatePresence>
  );
};

export default RetirementAccountsModule;
