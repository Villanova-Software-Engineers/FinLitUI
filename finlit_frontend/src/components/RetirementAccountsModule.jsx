import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Landmark, TrendingUp, CheckCircle, AlertCircle, Play, Sparkles, Clock, DollarSign, PiggyBank, Building2, Briefcase, Heart, Calculator, Gift, Shield, Percent } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useModuleScore, MODULES } from '../hooks/useModuleScore';
import { shuffleQuizOptions } from '../utils/shuffleQuizOptions';

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
  const [showAnswerResult, setShowAnswerResult] = useState(false);

  // Module score saving state
  const [isSaving, setIsSaving] = useState(false);
  const [saveResult, setSaveResult] = useState(null);

  // Matching game state
  const [matchingPairs, setMatchingPairs] = useState({});
  const [selectedTerm, setSelectedTerm] = useState(null);
  const [matchingScore, setMatchingScore] = useState(0);
  const [matchingComplete, setMatchingComplete] = useState(false);

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
      intro: "The big question: Pay taxes now or later? Your answer depends on your situation. Both 401(k)s and IRAs (Individual Retirement Accounts) come in Traditional and Roth varieties.",
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
      intro: "The Roth IRA (Individual Retirement Account) is incredibly powerful - tax-free growth AND tax-free withdrawals!",
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
  // MATCHING GAME DATA
  // ==========================================
  const matchingGameData = [
    { id: 1, term: "401(k)", definition: "Employer-sponsored retirement plan with tax-deferred contributions", emoji: "🏢" },
    { id: 2, term: "Roth IRA", definition: "After-tax contributions with tax-free withdrawals in retirement", emoji: "🌟" },
    { id: 3, term: "Traditional IRA", definition: "Tax-deductible contributions, taxed on withdrawal", emoji: "📋" },
    { id: 4, term: "Employer Match", definition: "Free money from your company when you contribute to 401(k)", emoji: "🎁" },
    { id: 5, term: "Vesting", definition: "Time required before employer contributions are fully yours", emoji: "⏰" },
    { id: 6, term: "Target-Date Fund", definition: "Investment that automatically adjusts risk as you near retirement", emoji: "🎯" }
  ];

  // Shuffle definitions for matching game - memoized so it stays consistent during the game
  const shuffledDefinitions = useMemo(() => {
    const shuffled = [...matchingGameData];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }, []);

  // ==========================================
  // QUIZ QUESTIONS
  // ==========================================
  const quizQuestionsBase = [
    {
      id: 1,
      question: "What is the 2024 contribution limit for a 401(k) if you're under 50?",
      options: ["$6,500", "$23,000", "$19,500", "$30,500"],
      correctIndex: 1,
      explanation: "The 2024 401(k) contribution limit is $23,000 for those under 50. The $30,500 limit is for those 50+ (includes catch-up contributions)."
    },
    {
      id: 2,
      question: "What's the key benefit of a Roth IRA compared to a Traditional IRA?",
      options: ["Higher contribution limits", "Immediate tax deduction", "Tax-free withdrawals in retirement", "No income limits"],
      correctIndex: 2,
      explanation: "Roth IRA contributions are made with after-tax money, but all qualified withdrawals in retirement are completely tax-free!"
    },
    {
      id: 3,
      question: "Your employer offers a 50% match on 401(k) contributions up to 6% of your salary. If you earn $60,000 and contribute 6%, how much FREE money do you get from your employer annually?",
      options: ["$1,800", "$3,600", "$900", "$6,000"],
      correctIndex: 0,
      explanation: "6% of $60,000 = $3,600. Employer matches 50% of that = $1,800 FREE per year! Always get the full match."
    },
    {
      id: 4,
      question: "What happens if you withdraw from a Traditional 401(k) before age 59½?",
      options: ["No penalty, just taxes", "10% penalty plus income taxes", "Only 5% penalty", "Tax-free if for emergency"],
      correctIndex: 1,
      explanation: "Early withdrawals typically face a 10% penalty PLUS regular income taxes. A $10K withdrawal could cost you $3,500+ in penalties and taxes!"
    },
    {
      id: 5,
      question: "Which retirement strategy is generally recommended for young people in lower tax brackets?",
      options: ["Only Traditional accounts", "Roth accounts (pay taxes now)", "No retirement savings until 40", "Keep cash in savings account"],
      correctIndex: 1,
      explanation: "Young people often benefit more from Roth accounts - pay taxes at today's lower rate and enjoy tax-free growth for decades!"
    },
    {
      id: 6,
      question: "What is a target-date fund?",
      options: ["A fund that only invests in bonds", "A fund that automatically adjusts risk as you approach retirement", "A fund with a guaranteed return by a specific date", "A short-term investment option"],
      correctIndex: 1,
      explanation: "Target-date funds automatically become more conservative (less risky) as you get closer to retirement. Perfect for hands-off investors!"
    },
    {
      id: 7,
      question: "What is the 'backdoor Roth' strategy used for?",
      options: ["Avoiding all taxes on retirement savings", "Allowing high earners to contribute to a Roth IRA", "Withdrawing early without penalties", "Doubling contribution limits"],
      correctIndex: 1,
      explanation: "High earners who exceed Roth IRA income limits can contribute to a Traditional IRA and then convert it to a Roth - the 'backdoor' method."
    },
    {
      id: 8,
      question: "At what age must you start taking Required Minimum Distributions (RMDs) from a Traditional 401(k)?",
      options: ["59½", "65", "73", "There are no required distributions"],
      correctIndex: 2,
      explanation: "As of 2024, RMDs from Traditional retirement accounts must begin at age 73. Roth IRAs have NO RMDs!"
    },
    {
      id: 9,
      question: "Why are low-cost index funds often recommended for retirement accounts?",
      options: ["They guarantee higher returns", "They have no risk", "Lower fees mean more money stays invested and growing", "They are FDIC insured"],
      correctIndex: 2,
      explanation: "A 1% fee difference can cost $200K+ over 40 years! Index funds typically have fees under 0.1% vs 1%+ for actively managed funds."
    },
    {
      id: 10,
      question: "How much can you withdraw penalty-free from a Roth IRA for a first-time home purchase (after 5 years)?",
      options: ["$5,000", "$10,000", "$25,000", "Unlimited if it's your first home"],
      correctIndex: 1,
      explanation: "Up to $10,000 of earnings can be withdrawn penalty-free for a first-time home purchase, plus you can always withdraw your contributions tax and penalty-free."
    }
  ];

  // Shuffle quiz options
  const quizQuestions = useMemo(() => shuffleQuizOptions(quizQuestionsBase), []);

  const handleAnswerSelect = (questionIndex, answerId) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionIndex]: answerId
    });
    setShowAnswerResult(true);
  };

  const handleNextQuestion = async () => {
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setShowAnswerResult(false);
    } else {
      // Last question - finish quiz
      const finalScore = calculateScore();
      setScore(finalScore);
      setShowResults(true);
      await saveModuleScore(finalScore);
    }
  };

  const calculateScore = () => {
    let correct = 0;
    quizQuestions.forEach((q, index) => {
      const selectedAnswer = selectedAnswers[index];
      if (selectedAnswer === q.correctIndex) {
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
    setShowAnswerResult(false);
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
            <div className="text-2xl mb-1">
              {i === 0 ? '🎓' : i === 4 ? '🏖️' : '💰'}
            </div>
            <div className="text-white font-bold text-sm">Age {age}</div>
          </motion.div>
        ))}
      </div>
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
          <div className="text-6xl sm:text-7xl mb-4">
            🏦
          </div>
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
              <div className="text-4xl sm:text-5xl mb-3 relative z-10">
                {section.emoji}
              </div>
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
                    <div className="text-2xl sm:text-3xl flex-shrink-0">
                      {point.emoji}
                    </div>
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
                <span className="text-2xl">
                  🤯
                </span>
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
                  setCurrentPhase('matching-game');
                }
              }}
              className={`w-full bg-gradient-to-r ${section.color} text-white font-bold py-4 rounded-2xl text-lg shadow-lg flex items-center justify-center gap-2`}
            >
              {learnStep < learningSections.length - 1 ? "CONTINUE JOURNEY" : (isReviewMode ? "FINISH REVIEW" : "PLAY MATCHING GAME")}
              <ArrowRight size={20} />
            </motion.button>
          </motion.div>
        </div>
      </motion.div>
    );
  };

  // ==========================================
  // RENDER: MATCHING GAME PHASE
  // ==========================================
  const renderMatchingGame = () => {
    const handleMatch = (termId, definitionId) => {
      const isCorrect = termId === definitionId;
      // Store both the definitionId and whether it's correct
      const newPairs = { ...matchingPairs, [termId]: { definitionId, isCorrect } };
      setMatchingPairs(newPairs);

      if (isCorrect) {
        setMatchingScore(prev => prev + 1);
      }

      // Check if all matched
      if (Object.keys(newPairs).length === matchingGameData.length) {
        setTimeout(() => setMatchingComplete(true), 500);
      }
    };

    const handleTermClick = (termId) => {
      const matchInfo = matchingPairs[termId];
      // If already matched correctly, don't allow clicking
      if (matchInfo && matchInfo.isCorrect) return;

      // If matched incorrectly, clear the incorrect match to allow retry
      if (matchInfo && !matchInfo.isCorrect) {
        const newPairs = { ...matchingPairs };
        delete newPairs[termId];
        setMatchingPairs(newPairs);
        setSelectedTerm(termId);
        return;
      }

      setSelectedTerm(selectedTerm === termId ? null : termId);
    };

    const handleDefinitionClick = (defId) => {
      if (!selectedTerm) return;

      // Check if this definition is already matched correctly
      const matchedTermId = Object.keys(matchingPairs).find(
        termId => matchingPairs[termId].definitionId === defId
      );
      if (matchedTermId && matchingPairs[matchedTermId].isCorrect) return;

      // If matched incorrectly, allow clicking to clear and retry
      if (matchedTermId && !matchingPairs[matchedTermId].isCorrect) {
        const newPairs = { ...matchingPairs };
        delete newPairs[matchedTermId];
        setMatchingPairs(newPairs);
        handleMatch(selectedTerm, defId);
        setSelectedTerm(null);
        return;
      }

      handleMatch(selectedTerm, defId);
      setSelectedTerm(null);
    };

    if (matchingComplete) {
      const correctMatches = Object.values(matchingPairs).filter(pair => pair.isCorrect).length;
      return (
        <motion.div
          className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-6 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="bg-white rounded-3xl p-8 shadow-2xl max-w-md w-full text-center"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
          >
            <div className="text-6xl mb-4">{correctMatches >= 5 ? '🎉' : '📚'}</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              {correctMatches >= 5 ? 'Well Done!' : 'Keep Learning!'}
            </h2>
            <p className="text-xl text-gray-600 mb-6">
              You matched <span className="font-bold text-emerald-600">{correctMatches}/{matchingGameData.length}</span> correctly
            </p>
            <button
              onClick={() => setCurrentPhase('quiz')}
              className="w-full px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl font-bold text-lg shadow-lg transition transform hover:scale-105"
            >
              Continue to Quiz
            </button>
          </motion.div>
        </motion.div>
      );
    }

    return (
      <motion.div
        className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            className="text-center mb-8"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-3">Match the Terms!</h1>
            <p className="text-gray-600 text-lg">Connect each retirement term with its definition</p>
            <div className="mt-4 text-sm text-gray-500">
              Matched: {Object.keys(matchingPairs).length}/{matchingGameData.length}
            </div>
          </motion.div>

          {/* Matching Grid */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Left Column - Terms */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-emerald-700 mb-4 text-center">TERMS</h3>
              {matchingGameData.map(item => {
                const matchInfo = matchingPairs[item.id];
                const isMatched = !!matchInfo;
                const isCorrectMatch = matchInfo?.isCorrect;

                return (
                  <motion.button
                    key={`term-${item.id}`}
                    onClick={() => handleTermClick(item.id)}
                    disabled={isMatched && isCorrectMatch}
                    className={`w-full p-5 rounded-2xl border-3 font-bold text-left transition-all flex items-center gap-3 ${
                      isMatched
                        ? isCorrectMatch
                          ? 'bg-green-100 border-green-400 opacity-50 cursor-not-allowed'
                          : 'bg-red-100 border-red-400 hover:border-red-500 hover:shadow-md cursor-pointer'
                        : selectedTerm === item.id
                          ? 'bg-blue-100 border-blue-500 shadow-lg scale-105'
                          : 'bg-white border-gray-300 hover:border-emerald-400 hover:shadow-md cursor-pointer'
                    }`}
                    whileHover={!(isMatched && isCorrectMatch) ? { scale: 1.02 } : {}}
                    whileTap={!(isMatched && isCorrectMatch) ? { scale: 0.98 } : {}}
                  >
                    <span className="text-3xl">{item.emoji}</span>
                    <span className="text-lg flex-1">{item.term}</span>
                    {isMatched && (
                      isCorrectMatch
                        ? <CheckCircle className="text-green-600" size={24} />
                        : <AlertCircle className="text-red-600" size={24} />
                    )}
                  </motion.button>
                );
              })}
            </div>

            {/* Right Column - Definitions */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-teal-700 mb-4 text-center">DEFINITIONS</h3>
              {shuffledDefinitions.map(item => {
                // Find which term (if any) matched to this definition
                const matchedTermId = Object.keys(matchingPairs).find(
                  termId => matchingPairs[termId].definitionId === item.id
                );
                const isMatched = !!matchedTermId;
                const isCorrectMatch = isMatched && matchingPairs[matchedTermId].isCorrect;

                return (
                  <motion.button
                    key={`def-${item.id}`}
                    onClick={() => handleDefinitionClick(item.id)}
                    disabled={isMatched && isCorrectMatch}
                    className={`w-full p-5 rounded-2xl border-3 text-left transition-all ${
                      isMatched
                        ? isCorrectMatch
                          ? 'bg-green-100 border-green-400 opacity-50 cursor-not-allowed'
                          : 'bg-red-100 border-red-400 hover:border-red-500 hover:shadow-md cursor-pointer'
                        : 'bg-white border-gray-300 hover:border-teal-400 hover:shadow-md cursor-pointer'
                    }`}
                    whileHover={!(isMatched && isCorrectMatch) ? { scale: 1.02 } : {}}
                    whileTap={!(isMatched && isCorrectMatch) ? { scale: 0.98 } : {}}
                  >
                    <span className="text-gray-700">{item.definition}</span>
                    {isMatched && (
                      isCorrectMatch
                        ? <CheckCircle className="text-green-600 mt-2" size={20} />
                        : <AlertCircle className="text-red-600 mt-2" size={20} />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Instructions */}
          {Object.keys(matchingPairs).length === 0 && (
            <motion.div
              className="mt-8 bg-blue-50 border-2 border-blue-300 rounded-2xl p-6 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Sparkles className="w-8 h-8 mx-auto mb-3 text-blue-600" />
              <p className="text-blue-800 font-semibold">
                Click a term on the left, then click its matching definition on the right!
              </p>
            </motion.div>
          )}
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
      <div className="max-w-4xl mx-auto pt-16 px-4">
        {/* Navigation Buttons */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {(currentQuestion > 0 && !showAnswerResult) && (
              <button
                onClick={() => setCurrentQuestion(prev => prev - 1)}
                className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors font-medium"
              >
                <ArrowLeft size={20} />
                <span>Previous Question</span>
              </button>
            )}
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors font-medium"
          >
            <ArrowLeft size={20} />
            <span>Back to Dashboard</span>
          </button>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden flex flex-col min-h-[500px]">
          <div className="flex-1 p-8 lg:p-16 flex flex-col justify-center">
            <div className="flex justify-between items-end mb-8 border-b border-gray-100 pb-6">
              <div>
                <span className="text-sm font-bold text-emerald-600 uppercase tracking-wider block mb-2">
                  Question {currentQuestion + 1} of {quizQuestions.length}
                </span>
                <h2 className="text-2xl lg:text-4xl font-bold text-slate-900 leading-tight">
                  {question.question}
                </h2>
              </div>
              <div className="hidden lg:block text-slate-300">
                <span className="text-5xl">🏦</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {question.options.map((option, idx) => {
                const isSelected = selectedAnswers[currentQuestion] === idx;
                const isCorrect = idx === question.correctIndex;
                const showCorrectness = showAnswerResult && (isSelected || isCorrect);

                return (
                  <button
                    key={idx}
                    onClick={() => !showAnswerResult && handleAnswerSelect(currentQuestion, idx)}
                    disabled={showAnswerResult}
                    className={`p-6 lg:p-8 rounded-2xl text-left border-2 transition-all flex items-start gap-4 ${
                      showCorrectness
                        ? isCorrect
                          ? 'bg-green-50 border-green-500 text-green-900'
                          : isSelected
                            ? 'bg-red-50 border-red-500 text-red-900'
                            : 'bg-white border-slate-100 opacity-50'
                        : isSelected
                          ? 'bg-blue-50 border-blue-600 shadow-lg scale-[1.02]'
                          : 'bg-white border-slate-200 hover:border-blue-400 hover:shadow-md'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                      showCorrectness && isCorrect
                        ? 'bg-green-500 text-white'
                        : showCorrectness && isSelected
                          ? 'bg-red-500 text-white'
                          : isSelected
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 text-slate-500'
                    }`}>
                      {String.fromCharCode(65 + idx)}
                    </div>
                    <span className="text-lg font-medium leading-snug flex-1">{option}</span>
                    {showCorrectness && isCorrect && <span className="ml-auto text-green-600 shrink-0 text-2xl">✓</span>}
                    {showCorrectness && isSelected && !isCorrect && <span className="ml-auto text-red-600 shrink-0 text-2xl">✗</span>}
                  </button>
                );
              })}
            </div>

            {showAnswerResult && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 bg-slate-900 text-white p-8 rounded-3xl flex flex-col md:flex-row items-center gap-8 shadow-2xl"
              >
                <div className="flex-1">
                  <h4 className="font-bold text-emerald-400 uppercase tracking-wider text-sm mb-2">Explanation</h4>
                  <p className="text-lg leading-relaxed text-slate-200">
                    {question.explanation}
                  </p>
                </div>
                <button
                  onClick={handleNextQuestion}
                  className="w-full md:w-auto px-8 py-4 bg-white text-slate-900 rounded-xl font-bold hover:bg-blue-50 transition-colors whitespace-nowrap"
                >
                  {currentQuestion < quizQuestions.length - 1 ? 'Next Question' : 'Complete Quiz'}
                </button>
              </motion.div>
            )}
          </div>
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
      <div className="max-w-4xl mx-auto pt-16 px-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-3xl shadow-xl p-12 text-center border border-gray-100"
        >
          <div className={`w-32 h-32 mx-auto rounded-full flex items-center justify-center mb-8 shadow-2xl ${
            passed ? 'bg-green-500' : 'bg-amber-500'
          }`}>
            <span className="text-6xl">{passed ? '🏆' : '📚'}</span>
          </div>

          <h2 className="text-5xl font-black text-slate-900 mb-4">
            {passed ? 'Outstanding!' : 'Keep Learning!'}
          </h2>
          <p className="text-2xl text-slate-500 mb-10">
            You scored <span className="font-bold text-slate-900">{score}/{quizQuestions.length}</span> ({percentage}%)
          </p>

          {passed ? (
            <div className="bg-green-50 border-2 border-green-500 rounded-2xl p-8 mb-10">
              <p className="text-green-800 font-bold text-xl mb-2">🎊 Congratulations! You passed!</p>
              <p className="text-green-700 text-lg">You've mastered the Retirement Accounts module</p>
            </div>
          ) : (
            <div className="bg-amber-50 border-2 border-amber-500 rounded-2xl p-8 mb-10">
              <p className="text-amber-800 font-bold text-xl mb-2">You need 80% to pass ({Math.ceil(quizQuestions.length * 0.8)}/{quizQuestions.length} correct)</p>
              <p className="text-amber-700 text-lg">Review the material and try again - you're getting there!</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={resetModule}
              className="px-8 py-4 rounded-xl bg-slate-900 text-white hover:bg-slate-800 font-bold text-lg transition-all shadow-lg"
            >
              Retake Quiz
            </button>
            <button
              onClick={() => navigate('/roadmap')}
              className="px-8 py-4 rounded-xl border-2 border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-lg transition-all"
            >
              Back to Roadmap
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
          <div className="text-6xl mb-4">
            🏦
          </div>
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
      {currentPhase === 'matching-game' && renderMatchingGame()}
      {currentPhase === 'quiz' && !showResults && renderQuiz()}
      {currentPhase === 'quiz' && showResults && renderResults()}
    </AnimatePresence>
  );
};

export default RetirementAccountsModule;
