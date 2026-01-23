import React, { useState } from "react";
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, ArrowRight, Star, Trophy, CheckCircle, XCircle,
  Zap, TrendingUp, TrendingDown, Coins, Target,
  DollarSign, BarChart3, Activity, BookOpen, GraduationCap,
  Play, RefreshCw, Loader2, Shield, Globe, Lock,
  AlertTriangle, Lightbulb, Award, Sparkles, Bitcoin, Wallet,
  Clock, Users, Database, Heart, Flame, PartyPopper
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useModuleScore, MODULES } from '../hooks/useModuleScore';

const CryptoModule = () => {
  const navigate = useNavigate();
  const { saveScore, resetModule, isLoading: progressLoading } = useModuleScore();

  // Phase management
  const [currentPhase, setCurrentPhase] = useState('intro');
  const [learnStep, setLearnStep] = useState(0);
  const [quizQuestion, setQuizQuestion] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [hearts, setHearts] = useState(3);

  // Module score saving state
  const [isSaving, setIsSaving] = useState(false);
  const [saveResult, setSaveResult] = useState(null);
  const [isResetting, setIsResetting] = useState(false);

  // ==========================================
  // LEARNING CONTENT
  // ==========================================
  const learningSections = [
    {
      id: 'what-is-crypto',
      title: "What is Cryptocurrency?",
      emoji: "🪙",
      color: "from-amber-400 to-orange-500",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-200",
      visual: "https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=500&q=80",
      points: [
        { emoji: "💻", title: "Digital Money", desc: "Exists only online - no physical coins!", example: "Like V-Bucks, but for real purchases" },
        { emoji: "🔐", title: "Cryptography", desc: "Protected by unbreakable math codes", example: "A lock that would take 1000 years to crack" },
        { emoji: "🌍", title: "Decentralized", desc: "No bank controls it", example: "Thousands of computers verify every transaction" }
      ],
      funFact: "The first Bitcoin purchase? 10,000 BTC for two pizzas — now worth $600M+ 🍕"
    },
    {
      id: 'blockchain',
      title: "How Blockchain Works",
      emoji: "⛓️",
      color: "from-blue-400 to-indigo-500",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      visual: "https://images.unsplash.com/photo-1639322537228-f710d846310a?w=500&q=80",
      points: [
        { emoji: "🧱", title: "Blocks", desc: "Transactions grouped together", example: "Like pages in a permanent diary" },
        { emoji: "🔗", title: "Chain", desc: "Each block links to the previous one", example: "LEGO blocks that can't be separated" },
        { emoji: "📡", title: "Network", desc: "Copies on thousands of computers", example: "A Google Doc everyone can see" }
      ],
      funFact: "A new Bitcoin block is mined every ~10 minutes! ⏱️"
    },
    {
      id: 'wallets',
      title: "Crypto Wallets",
      emoji: "👛",
      color: "from-purple-400 to-pink-500",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      visual: "https://images.unsplash.com/photo-1622630998477-20aa696ecb05?w=500&q=80",
      points: [
        { emoji: "🔥", title: "Hot Wallet", desc: "Online & convenient", example: "Your everyday spending wallet" },
        { emoji: "🧊", title: "Cold Wallet", desc: "Offline & ultra-secure", example: "A bank vault for big savings" },
        { emoji: "🔑", title: "Private Key", desc: "NEVER share this!", example: "Lose it = lose everything forever" }
      ],
      funFact: "~20% of all Bitcoin ($140B+) is lost forever from forgotten passwords! 😱"
    },
    {
      id: 'types',
      title: "Types of Crypto",
      emoji: "🎨",
      color: "from-emerald-400 to-teal-500",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-200",
      visual: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=500&q=80",
      points: [
        { emoji: "₿", title: "Bitcoin", desc: "The OG 'digital gold'", example: "Limited to 21 million coins ever" },
        { emoji: "◊", title: "Ethereum", desc: "Powers apps & NFTs", example: "Bitcoin + programmable features" },
        { emoji: "💵", title: "Stablecoins", desc: "Always worth ~$1", example: "USDC, USDT - no wild price swings" }
      ],
      funFact: "There are 20,000+ cryptocurrencies, but most are worthless! 🗑️"
    }
  ];

  // ==========================================
  // PROS & CONS DATA
  // ==========================================
  const prosData = [
    { emoji: "🌐", title: "Decentralized", desc: "No bank can freeze your money", color: "from-green-400 to-emerald-500" },
    { emoji: "🕐", title: "24/7 Markets", desc: "Trade anytime, anywhere", color: "from-blue-400 to-cyan-500" },
    { emoji: "📈", title: "Growth Potential", desc: "Early BTC investors made 10,000x+", color: "from-purple-400 to-pink-500" },
    { emoji: "🤝", title: "Financial Freedom", desc: "Anyone with internet can join", color: "from-amber-400 to-orange-500" },
    { emoji: "👁️", title: "Transparent", desc: "All transactions are public", color: "from-teal-400 to-green-500" },
  ];

  const consData = [
    { emoji: "📉", title: "Volatile", desc: "Can drop 50% in a week", color: "from-red-400 to-rose-500" },
    { emoji: "🎭", title: "Scams", desc: "Many fake projects & hacks", color: "from-orange-400 to-red-500" },
    { emoji: "⚖️", title: "Regulations", desc: "Laws change constantly", color: "from-gray-400 to-slate-500" },
    { emoji: "⚡", title: "Energy Use", desc: "Mining uses lots of power", color: "from-yellow-400 to-amber-500" },
    { emoji: "🧠", title: "Complexity", desc: "Steep learning curve", color: "from-indigo-400 to-purple-500" },
  ];

  // ==========================================
  // TIPS DATA
  // ==========================================
  const tipsData = [
    { emoji: "💸", rule: "Rule #1", title: "Only Risk What You Can Lose", desc: "Never invest rent or emergency money", color: "bg-red-100 border-red-300" },
    { emoji: "🔍", rule: "Rule #2", title: "DYOR", desc: "Do Your Own Research - don't follow hype", color: "bg-blue-100 border-blue-300" },
    { emoji: "🥧", rule: "Rule #3", title: "Diversify", desc: "Don't put all eggs in one basket", color: "bg-green-100 border-green-300" },
    { emoji: "🛡️", rule: "Rule #4", title: "Security First", desc: "Use 2FA, hardware wallets, never share keys", color: "bg-purple-100 border-purple-300" },
    { emoji: "⏳", rule: "Rule #5", title: "HODL", desc: "Think long-term, ignore daily noise", color: "bg-amber-100 border-amber-300" },
    { emoji: "🚨", rule: "Rule #6", title: "Spot Scams", desc: "'Double your BTC' = 100% SCAM", color: "bg-rose-100 border-rose-300" },
  ];

  // ==========================================
  // QUIZ DATA
  // ==========================================
  const quizQuestions = [
    { q: "What powers most cryptocurrencies?", opts: ["Cloud Computing", "Blockchain", "AI", "Quantum"], correct: 1, emoji: "⛓️" },
    { q: "Who created Bitcoin?", opts: ["Elon Musk", "Satoshi Nakamoto", "Mark Zuckerberg", "Vitalik Buterin"], correct: 1, emoji: "🎭" },
    { q: "What is a 'stablecoin'?", opts: ["Never changes price", "Pegged to $1 USD", "The oldest crypto", "A physical coin"], correct: 1, emoji: "💵" },
    { q: "What should you NEVER share?", opts: ["Your wallet address", "Transaction history", "Private key", "Portfolio value"], correct: 2, emoji: "🔑" },
    { q: "What does 'HODL' mean?", opts: ["A crypto exchange", "Hold On for Dear Life", "A trading strategy", "A type of wallet"], correct: 1, emoji: "💎" },
    { q: "Most secure wallet for savings?", opts: ["Hot wallet", "Exchange wallet", "Cold wallet", "Email wallet"], correct: 2, emoji: "🧊" },
    { q: "First rule of crypto investing?", opts: ["Invest everything", "Only risk what you can lose", "Follow influencers", "Buy cheap coins"], correct: 1, emoji: "⚠️" },
    { q: "What makes blockchain 'immutable'?", opts: ["It's fast", "Data can't be changed", "Uses AI", "Bank controlled"], correct: 1, emoji: "🔒" },
  ];

  // ==========================================
  // HANDLERS
  // ==========================================
  const handleQuizAnswer = (idx) => {
    if (showFeedback) return;
    setSelectedAnswer(idx);
    const isCorrect = idx === quizQuestions[quizQuestion].correct;

    if (isCorrect) {
      setQuizScore(prev => prev + 1);
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 1500);
    } else {
      setHearts(prev => Math.max(0, prev - 1));
    }

    setQuizAnswers([...quizAnswers, { question: quizQuestion, answer: idx, correct: isCorrect }]);
    setShowFeedback(true);
  };

  const handleNextQuestion = () => {
    setShowFeedback(false);
    setSelectedAnswer(null);
    if (quizQuestion < quizQuestions.length - 1) {
      setQuizQuestion(prev => prev + 1);
    } else {
      handleQuizComplete();
    }
  };

  const handleQuizComplete = async () => {
    setCurrentPhase('results');
    const finalScore = Math.round((quizScore / quizQuestions.length) * 100);
    setIsSaving(true);
    try {
      const result = await saveScore(MODULES.CRYPTO.id, finalScore, 100);
      setSaveResult(result);
    } catch (error) {
      console.error('Error saving score:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRetake = async () => {
    setIsResetting(true);
    try {
      await resetModule(MODULES.CRYPTO.id);
      setCurrentPhase('intro');
      setLearnStep(0);
      setQuizQuestion(0);
      setQuizScore(0);
      setQuizAnswers([]);
      setSelectedAnswer(null);
      setShowFeedback(false);
      setSaveResult(null);
      setHearts(3);
    } catch (error) {
      console.error('Error resetting:', error);
    } finally {
      setIsResetting(false);
    }
  };

  const triggerCelebration = () => {
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 2000);
  };

  const finalPercentage = Math.round((quizScore / quizQuestions.length) * 100);
  const passed = finalPercentage === 100;

  // ==========================================
  // CELEBRATION OVERLAY
  // ==========================================
  const CelebrationOverlay = () => (
    <AnimatePresence>
      {showCelebration && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            className="text-8xl"
          >
            🎉
          </motion.div>
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 1, y: 0, x: 0 }}
              animate={{
                opacity: 0,
                y: (Math.random() - 0.5) * 400,
                x: (Math.random() - 0.5) * 400,
              }}
              transition={{ duration: 1, delay: i * 0.05 }}
              className="absolute text-4xl"
            >
              {['⭐', '✨', '🌟', '💫', '🎊'][i % 5]}
            </motion.div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );

  // ==========================================
  // HEADER COMPONENT
  // ==========================================
  const Header = ({ onBack, title, rightContent }) => (
    <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between max-w-2xl mx-auto">
        <button onClick={onBack} className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft size={24} className="text-gray-600" />
        </button>
        <span className="font-bold text-gray-800">{title}</span>
        <div className="w-10">{rightContent}</div>
      </div>
    </div>
  );

  // ==========================================
  // PROGRESS BAR
  // ==========================================
  const ProgressBar = ({ current, total, color = "bg-green-500" }) => (
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
  // RENDER: INTRO
  // ==========================================
  const renderIntro = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
      <Header onBack={() => navigate('/dashboard')} title="Crypto Basics" />

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Hero */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-8"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-8xl mb-4"
          >
            🪙
          </motion.div>
          <h1 className="text-3xl font-black text-gray-900 mb-2">
            Cryptocurrency 101
          </h1>
          <p className="text-gray-600 text-lg">
            Master the basics of digital money!
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
            { icon: "⏱️", label: "~10 min", color: "bg-green-100" },
            { icon: "🏆", label: "8 Quiz Qs", color: "bg-amber-100" },
          ].map((item, idx) => (
            <div key={idx} className={`${item.color} rounded-2xl p-4 text-center`}>
              <div className="text-2xl mb-1">{item.icon}</div>
              <div className="text-sm font-semibold text-gray-700">{item.label}</div>
            </div>
          ))}
        </motion.div>

        {/* What You'll Learn */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-8"
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
          className="w-full bg-gradient-to-r from-amber-400 to-orange-500 text-white font-bold py-4 px-8 rounded-2xl text-lg shadow-lg shadow-orange-200 flex items-center justify-center gap-2"
        >
          <Play size={24} fill="white" />
          START LEARNING
        </motion.button>
      </div>
    </motion.div>
  );

  // ==========================================
  // RENDER: LEARN
  // ==========================================
  const renderLearn = () => {
    const section = learningSections[learnStep];

    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`min-h-screen ${section.bgColor}`}>
        <CelebrationOverlay />
        <Header
          onBack={() => learnStep > 0 ? setLearnStep(prev => prev - 1) : setCurrentPhase('intro')}
          title={`Lesson ${learnStep + 1} of ${learningSections.length}`}
        />

        <div className="max-w-2xl mx-auto px-4 py-2">
          <ProgressBar current={learnStep + 1} total={learningSections.length} color="bg-gradient-to-r from-green-400 to-emerald-500" />
        </div>

        <div className="max-w-2xl mx-auto px-4 py-4">
          <motion.div key={learnStep} initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-4">
            {/* Title Card */}
            <div className={`bg-gradient-to-r ${section.color} rounded-3xl p-6 text-white shadow-lg`}>
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                className="text-5xl mb-3"
              >
                {section.emoji}
              </motion.div>
              <h2 className="text-2xl font-black mb-1">{section.title}</h2>
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
                  <div className="flex gap-4">
                    <div className="text-3xl">{point.emoji}</div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 mb-1">{point.title}</h3>
                      <p className="text-gray-600 text-sm mb-2">{point.desc}</p>
                      <div className={`${section.bgColor} ${section.borderColor} border rounded-xl p-3`}>
                        <p className="text-sm text-gray-700">
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
                <p className="text-gray-800 font-medium">{section.funFact}</p>
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
                triggerCelebration();
                setTimeout(() => {
                  if (learnStep < learningSections.length - 1) {
                    setLearnStep(prev => prev + 1);
                  } else {
                    setCurrentPhase('proscons');
                  }
                }, 500);
              }}
              className={`w-full bg-gradient-to-r ${section.color} text-white font-bold py-4 rounded-2xl text-lg shadow-lg flex items-center justify-center gap-2`}
            >
              {learnStep < learningSections.length - 1 ? "CONTINUE" : "NEXT: PROS & CONS"}
              <ArrowRight size={20} />
            </motion.button>
          </motion.div>
        </div>
      </motion.div>
    );
  };

  // ==========================================
  // RENDER: PROS & CONS
  // ==========================================
  const renderProsCons = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <CelebrationOverlay />
      <Header onBack={() => setCurrentPhase('learn')} title="Pros & Cons" />

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Pros Section */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-green-500 p-2 rounded-xl">
              <TrendingUp className="text-white" size={20} />
            </div>
            <h2 className="text-xl font-black text-gray-900">The Good Stuff</h2>
          </div>
          <div className="space-y-3">
            {prosData.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ x: -30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ scale: 1.02, x: 5 }}
                className={`bg-gradient-to-r ${item.color} rounded-2xl p-4 text-white shadow-md cursor-default`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{item.emoji}</span>
                  <div>
                    <h3 className="font-bold">{item.title}</h3>
                    <p className="text-white/90 text-sm">{item.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Cons Section */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-red-500 p-2 rounded-xl">
              <TrendingDown className="text-white" size={20} />
            </div>
            <h2 className="text-xl font-black text-gray-900">The Risks</h2>
          </div>
          <div className="space-y-3">
            {consData.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ x: 30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.5 + idx * 0.1 }}
                whileHover={{ scale: 1.02, x: -5 }}
                className={`bg-gradient-to-r ${item.color} rounded-2xl p-4 text-white shadow-md cursor-default`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{item.emoji}</span>
                  <div>
                    <h3 className="font-bold">{item.title}</h3>
                    <p className="text-white/90 text-sm">{item.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Continue Button */}
        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            triggerCelebration();
            setTimeout(() => setCurrentPhase('tips'), 500);
          }}
          className="w-full bg-gradient-to-r from-violet-500 to-purple-600 text-white font-bold py-4 rounded-2xl text-lg shadow-lg flex items-center justify-center gap-2"
        >
          <Lightbulb size={20} />
          NEXT: SMART TIPS
        </motion.button>
      </div>
    </motion.div>
  );

  // ==========================================
  // RENDER: TIPS
  // ==========================================
  const renderTips = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-gradient-to-b from-violet-50 to-purple-50">
      <CelebrationOverlay />
      <Header onBack={() => setCurrentPhase('proscons')} title="Golden Rules" />

      <div className="max-w-2xl mx-auto px-4 py-6">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-6"
        >
          <div className="text-5xl mb-2">🧠</div>
          <h2 className="text-2xl font-black text-gray-900">6 Rules to Remember</h2>
          <p className="text-gray-600">Before you invest a single dollar...</p>
        </motion.div>

        <div className="space-y-3 mb-6">
          {tipsData.map((tip, idx) => (
            <motion.div
              key={idx}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: idx * 0.1 }}
              className={`${tip.color} border-2 rounded-2xl p-4`}
            >
              <div className="flex items-start gap-3">
                <span className="text-3xl">{tip.emoji}</span>
                <div>
                  <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">{tip.rule}</div>
                  <h3 className="font-bold text-gray-900">{tip.title}</h3>
                  <p className="text-gray-600 text-sm">{tip.desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Quiz Button */}
        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setCurrentPhase('quiz')}
          className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-4 rounded-2xl text-lg shadow-lg flex items-center justify-center gap-2"
        >
          <GraduationCap size={24} />
          TAKE THE QUIZ
        </motion.button>
      </div>
    </motion.div>
  );

  // ==========================================
  // RENDER: QUIZ
  // ==========================================
  const renderQuiz = () => {
    const q = quizQuestions[quizQuestion];

    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-white">
        <CelebrationOverlay />

        {/* Quiz Header */}
        <div className="sticky top-0 z-30 bg-white border-b border-gray-200">
          <div className="max-w-2xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between mb-2">
              <button onClick={() => navigate('/dashboard')} className="p-2 -ml-2 hover:bg-gray-100 rounded-full">
                <XCircle size={28} className="text-gray-400" />
              </button>
              <div className="flex-1 mx-4">
                <ProgressBar current={quizQuestion + 1} total={quizQuestions.length} />
              </div>
              <div className="flex items-center gap-1">
                {[...Array(3)].map((_, i) => (
                  <Heart
                    key={i}
                    size={24}
                    className={i < hearts ? "text-red-500 fill-red-500" : "text-gray-300"}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-6">
          <motion.div key={quizQuestion} initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
            {/* Question */}
            <div className="text-center mb-8">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
                className="text-6xl mb-4"
              >
                {q.emoji}
              </motion.div>
              <h2 className="text-xl font-bold text-gray-900">{q.q}</h2>
            </div>

            {/* Options */}
            <div className="space-y-3">
              {q.opts.map((opt, idx) => {
                const isSelected = selectedAnswer === idx;
                const isCorrect = idx === q.correct;
                const showResult = showFeedback && isSelected;

                return (
                  <motion.button
                    key={idx}
                    onClick={() => handleQuizAnswer(idx)}
                    disabled={showFeedback}
                    whileHover={!showFeedback ? { scale: 1.02 } : {}}
                    whileTap={!showFeedback ? { scale: 0.98 } : {}}
                    className={`w-full p-4 rounded-2xl text-left border-2 transition-all ${
                      showResult
                        ? isCorrect
                          ? 'bg-green-100 border-green-500 text-green-800'
                          : 'bg-red-100 border-red-500 text-red-800'
                        : showFeedback && isCorrect
                          ? 'bg-green-100 border-green-500 text-green-800'
                          : isSelected
                            ? 'bg-blue-100 border-blue-500 text-blue-800'
                            : 'bg-gray-50 border-gray-200 hover:border-gray-400 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                        showResult
                          ? isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                          : showFeedback && isCorrect
                            ? 'bg-green-500 text-white'
                            : isSelected
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-200 text-gray-600'
                      }`}>
                        {showResult ? (isCorrect ? '✓' : '✗') : String.fromCharCode(65 + idx)}
                      </div>
                      <span className="font-medium">{opt}</span>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Continue after answer */}
            {showFeedback && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="mt-6"
              >
                <button
                  onClick={handleNextQuestion}
                  className={`w-full py-4 rounded-2xl font-bold text-lg ${
                    selectedAnswer === q.correct
                      ? 'bg-green-500 text-white'
                      : 'bg-red-500 text-white'
                  }`}
                >
                  {quizQuestion < quizQuestions.length - 1 ? 'CONTINUE' : 'SEE RESULTS'}
                </button>
              </motion.div>
            )}
          </motion.div>
        </div>
      </motion.div>
    );
  };

  // ==========================================
  // RENDER: RESULTS
  // ==========================================
  const renderResults = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Header onBack={() => navigate('/dashboard')} title="Results" />

      <div className="max-w-2xl mx-auto px-4 py-8 text-center">
        {/* Trophy/Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", bounce: 0.5 }}
          className="mb-6"
        >
          <div className={`inline-block p-8 rounded-full ${passed ? 'bg-gradient-to-r from-yellow-400 to-amber-500' : 'bg-gradient-to-r from-gray-300 to-gray-400'}`}>
            <span className="text-7xl">{passed ? '🏆' : '📚'}</span>
          </div>
        </motion.div>

        {/* Score */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className={`text-5xl font-black mb-2 ${passed ? 'text-green-600' : 'text-amber-600'}`}>
            {finalPercentage}%
          </h2>
          <p className="text-gray-600 text-lg">{quizScore} of {quizQuestions.length} correct</p>
        </motion.div>

        {/* Message */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className={`mt-6 p-6 rounded-3xl ${passed ? 'bg-green-100' : 'bg-amber-100'}`}
        >
          {passed ? (
            <>
              <h3 className="text-2xl font-bold text-green-800 mb-2">🎉 AMAZING!</h3>
              <p className="text-green-700">You're officially crypto-literate! Remember: DYOR always.</p>
            </>
          ) : (
            <>
              <h3 className="text-2xl font-bold text-amber-800 mb-2">Almost there!</h3>
              <p className="text-amber-700">You need 100% to pass. Review and try again!</p>
            </>
          )}
        </motion.div>

        {/* Status */}
        {isSaving && (
          <div className="mt-4 flex items-center justify-center gap-2 text-gray-500">
            <Loader2 className="animate-spin" size={20} />
            <span>Saving...</span>
          </div>
        )}

        {saveResult && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`mt-4 p-3 rounded-xl ${saveResult.passed ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}
          >
            {saveResult.passed ? '✓ Progress saved!' : `Attempt #${saveResult.attemptNumber} recorded`}
          </motion.div>
        )}

        {/* Buttons */}
        <div className="mt-8 space-y-3">
          {!passed && (
            <button
              onClick={handleRetake}
              disabled={isResetting}
              className="w-full bg-gradient-to-r from-amber-400 to-orange-500 text-white font-bold py-4 rounded-2xl text-lg shadow-lg flex items-center justify-center gap-2"
            >
              {isResetting ? <Loader2 className="animate-spin" size={20} /> : <RefreshCw size={20} />}
              {isResetting ? 'RESETTING...' : 'TRY AGAIN'}
            </button>
          )}

          <button
            onClick={() => navigate('/dashboard')}
            className={`w-full font-bold py-4 rounded-2xl text-lg flex items-center justify-center gap-2 ${
              passed
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            {passed ? <><Award size={20} /> CONTINUE LEARNING</> : 'BACK TO DASHBOARD'}
          </button>
        </div>
      </div>
    </motion.div>
  );

  // ==========================================
  // MAIN RENDER
  // ==========================================
  if (progressLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="text-6xl mb-4"
          >
            🪙
          </motion.div>
          <p className="text-gray-500 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {currentPhase === 'intro' && renderIntro()}
      {currentPhase === 'learn' && renderLearn()}
      {currentPhase === 'proscons' && renderProsCons()}
      {currentPhase === 'tips' && renderTips()}
      {currentPhase === 'quiz' && renderQuiz()}
      {currentPhase === 'results' && renderResults()}
    </AnimatePresence>
  );
};

export default CryptoModule;
