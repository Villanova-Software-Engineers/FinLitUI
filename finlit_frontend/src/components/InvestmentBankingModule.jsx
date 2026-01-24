import React, { useState, useEffect } from 'react';
import { motion, Reorder } from 'framer-motion';
import { ArrowLeft, Trophy, CheckCircle, XCircle, ChevronRight, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TrueFalseCard from '../TrueFalse/TrueFalseCard';
import { useModuleScore, MODULES } from '../hooks/useModuleScore';

// Analysis Game Component - tracks user selection properly
const AnalysisGame = ({ activity, onComplete }) => {
  const [selectedRating, setSelectedRating] = useState(null);
  const [showResult, setShowResult] = useState(false);

  const handleSelect = (index, option) => {
    if (showResult) return;
    setSelectedRating(index);
    setShowResult(true);
    if (option.correct) {
      onComplete();
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
        <h3 className="font-semibold text-slate-800 mb-4">Company Analysis: {activity.company}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(activity.data).map(([key, value]) => (
            <div key={key} className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
              <div className="font-medium text-slate-500 capitalize text-sm">{key.replace(/([A-Z])/g, ' $1')}:</div>
              <div className="text-lg font-semibold text-slate-800">{value}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="text-center">
        <p className="font-semibold text-slate-800 mb-4">What is your investment recommendation?</p>
        <div className="flex justify-center gap-4 flex-wrap">
          {activity.options.map((option, index) => (
            <motion.button
              key={index}
              onClick={() => handleSelect(index, option)}
              disabled={showResult}
              className={`px-6 py-3 rounded-xl border-2 font-semibold transition-all duration-300 ${
                showResult
                  ? selectedRating === index
                    ? option.correct
                      ? 'border-emerald-400 bg-emerald-50 text-emerald-700 shadow-lg shadow-emerald-500/15'
                      : 'border-red-400 bg-red-50 text-red-700 shadow-lg shadow-red-500/15'
                    : option.correct
                      ? 'border-emerald-400 bg-emerald-50 text-emerald-700'
                      : 'border-slate-200 bg-white text-slate-400'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300'
              }`}
              whileHover={!showResult ? { scale: 1.02, y: -2 } : {}}
              whileTap={{ scale: 0.98 }}
            >
              {option.rating}
            </motion.button>
          ))}
        </div>

        {showResult && (
          <motion.div
            className={`mt-6 p-4 rounded-xl ${
              activity.options[selectedRating]?.correct
                ? 'bg-emerald-50 border border-emerald-300'
                : 'bg-red-50 border border-red-300'
            }`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className={`font-semibold ${
              activity.options[selectedRating]?.correct ? 'text-emerald-700' : 'text-red-700'
            }`}>
              {activity.options[selectedRating]?.correct ? '✅ Correct!' : '❌ Incorrect'}
            </p>
            <p className={`text-sm mt-1 ${
              activity.options[selectedRating]?.correct ? 'text-emerald-600' : 'text-red-600'
            }`}>
              {activity.options[selectedRating]?.explanation}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

const InvestmentBankingModule = () => {
  const navigate = useNavigate();
  const { saveScore, resetModule, isModulePassed, isLoading: progressLoading } = useModuleScore();

  // Check if module is already passed
  const modulePassed = isModulePassed(MODULES.INVESTMENT_BANKING?.id);

  // Review mode - allows viewing content without answering
  const [isReviewMode, setIsReviewMode] = useState(false);

  const [currentPhase, setCurrentPhase] = useState('lessons'); // 'lessons', 'practice', 'truefalse', 'results'
  const [currentLesson, setCurrentLesson] = useState(0);
  const [currentActivity, setCurrentActivity] = useState(0);
  const [completedLessons, setCompletedLessons] = useState([]);

  // Module score saving state
  const [isSaving, setIsSaving] = useState(false);
  const [saveResult, setSaveResult] = useState(null);
  const [isResetting, setIsResetting] = useState(false);
  

  // Game states
  const [selectedMatches, setSelectedMatches] = useState({});
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [selectedTerm, setSelectedTerm] = useState(null);
  const [selectedDefinition, setSelectedDefinition] = useState(null);
  const [gameCompleted, setGameCompleted] = useState(false);
  
  // MCQ states
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showExplanations, setShowExplanations] = useState({});
  
  // Sequence game states
  const [draggedItems, setDraggedItems] = useState([]);
  const [sequenceCorrect, setSequenceCorrect] = useState(false);
  const [sequenceWrong, setSequenceWrong] = useState(false);
  const [selectedSequenceIndex, setSelectedSequenceIndex] = useState(null);

  // Quiz completion state
  const [quizPassed, setQuizPassed] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);

  // Track completed activities
  const [completedActivities, setCompletedActivities] = useState([]);

  // Check if current activity is completed
  const isCurrentActivityCompleted = () => {
    // In review mode, all activities are considered completed
    if (isReviewMode) return true;

    const activity = practiceActivities[currentActivity];
    if (!activity) return false;

    switch (activity.type) {
      case 'matching':
        return gameCompleted;
      case 'mcq':
        // Check if all questions are answered
        return activity.questions.every(q => showExplanations[q.id]);
      case 'sequence':
        return sequenceCorrect;
      case 'analysis':
        // Analysis is completed when user has made a selection and seen result
        return completedActivities.includes(currentActivity);
      default:
        return false;
    }
  };

  // Mark activity as completed (used for analysis game)
  const markActivityCompleted = () => {
    if (!completedActivities.includes(currentActivity)) {
      setCompletedActivities([...completedActivities, currentActivity]);
    }
  };

  // Professional lessons with working activities
  const lessons = [
    {
      id: 1,
      title: "Investment Banking Fundamentals",
      icon: "🏦",
      concept: "Investment banks facilitate capital markets and provide financial advisory services",
      explanation: "Investment banks serve as intermediaries between capital seekers (companies) and capital providers (investors), enabling efficient allocation of financial resources in the economy.",
      keyPoint: "Primary function: Connect capital seekers with capital providers"
    },
    {
      id: 2,
      title: "Initial Public Offerings (IPOs)",
      icon: "📊",
      concept: "IPOs transform private companies into publicly-traded entities",
      explanation: "An IPO allows private companies to raise capital from public investors by selling shares on stock exchanges, providing liquidity and growth opportunities.",
      keyPoint: "IPO Process: Private → Public company transformation"
    },
    {
      id: 3,
      title: "Mergers & Acquisitions",
      icon: "🤝",
      concept: "M&A transactions create value through strategic business combinations",
      explanation: "Investment banks advise on mergers, acquisitions, and corporate restructuring to help companies achieve strategic objectives and operational synergies.",
      keyPoint: "M&A Strategy: Combining entities for enhanced value creation"
    },
    {
      id: 4,
      title: "Securities Trading",
      icon: "📈",
      concept: "Trading operations provide market liquidity and price discovery",
      explanation: "Investment banks facilitate buying and selling of securities, ensuring efficient market operations and helping clients execute large transactions.",
      keyPoint: "Trading Function: Market liquidity and efficient price discovery"
    },
    {
      id: 5,
      title: "Research & Analysis",
      icon: "🔍",
      concept: "Research provides data-driven investment recommendations",
      explanation: "Investment bank research teams analyze companies, industries, and markets to provide institutional and retail clients with informed investment guidance.",
      keyPoint: "Research Goal: Data-driven investment decision support"
    }
  ];

  // Working practice activities
  const practiceActivities = [
    {
      id: 1,
      type: "matching",
      title: "Investment Banking Services",
      instruction: "Match each service with its correct description",
      pairs: [
        { id: 'ipo', term: "IPO Underwriting", definition: "Managing the process of taking a company public", emoji: "📊" },
        { id: 'ma', term: "M&A Advisory", definition: "Advising on mergers and acquisitions", emoji: "🤝" },
        { id: 'trading', term: "Securities Trading", definition: "Buying and selling financial instruments", emoji: "📈" },
        { id: 'research', term: "Equity Research", definition: "Analyzing companies for investment recommendations", emoji: "🔍" }
      ]
    },
    {
      id: 2,
      type: "mcq",
      title: "M&A Transaction Types",
      instruction: "Identify the correct transaction type for each scenario",
      questions: [
        {
          id: 1,
          scenario: "Microsoft acquires LinkedIn for $26.2 billion. LinkedIn becomes a wholly-owned subsidiary.",
          question: "What type of transaction is this?",
          options: [
            { id: 'a', text: "Merger", correct: false },
            { id: 'b', text: "Acquisition", correct: true },
            { id: 'c', text: "Joint Venture", correct: false },
            { id: 'd', text: "Strategic Alliance", correct: false }
          ],
          explanation: "This is an acquisition because Microsoft purchased LinkedIn completely, making it a subsidiary."
        },
        {
          id: 2,
          scenario: "Two equal-sized companies combine to form a new entity with shared leadership.",
          question: "What type of transaction is this?",
          options: [
            { id: 'a', text: "Acquisition", correct: false },
            { id: 'b', text: "Merger", correct: true },
            { id: 'c', text: "Spin-off", correct: false },
            { id: 'd', text: "Divestiture", correct: false }
          ],
          explanation: "This is a merger because both companies combine as equals to form a new entity."
        }
      ]
    },
    {
      id: 3,
      type: "sequence",
      title: "IPO Process Timeline",
      instruction: "Arrange the IPO steps in the correct chronological order",
      items: [
        { id: 'decide', text: "Company decides to go public", order: 1, icon: "💡" },
        { id: 'banks', text: "Select underwriting investment banks", order: 2, icon: "🏦" },
        { id: 'filing', text: "File S-1 registration with SEC", order: 3, icon: "📋" },
        { id: 'roadshow', text: "Conduct investor roadshow", order: 4, icon: "✈️" },
        { id: 'pricing', text: "Price shares and begin trading", order: 5, icon: "💰" }
      ]
    },
    {
      id: 4,
      type: "analysis",
      title: "Investment Research Analysis",
      instruction: "Analyze the company data and provide an investment recommendation",
      company: "TechCorp Inc.",
      data: {
        revenue: "$2.5B (Growing 28% YoY)",
        profitMargin: "22% (Industry avg: 15%)",
        debtToEquity: "0.3x (Conservative)",
        marketPosition: "Market leader with 35% share",
        valuation: "Trading at 18x P/E (Sector avg: 25x)"
      },
      options: [
        { rating: "Strong Buy", correct: true, explanation: "Strong growth, superior margins, conservative debt, market leadership, and attractive valuation justify a Strong Buy rating." },
        { rating: "Hold", correct: false, explanation: "The strong fundamentals and attractive valuation suggest more upside potential than a Hold rating." },
        { rating: "Sell", correct: false, explanation: "Excellent financial metrics and competitive position do not support a Sell rating." }
      ]
    }
  ];

  // Matching game logic
  const handleTermClick = (termId) => {
    if (matchedPairs.includes(termId)) return;
    
    if (selectedTerm === termId) {
      setSelectedTerm(null);
    } else {
      setSelectedTerm(termId);
      if (selectedDefinition) {
        checkMatch(termId, selectedDefinition);
      }
    }
  };

  const handleDefinitionClick = (definitionId) => {
    if (matchedPairs.includes(definitionId)) return;

    if (selectedDefinition === definitionId) {
      setSelectedDefinition(null);
    } else {
      setSelectedDefinition(definitionId);
    }
  };

  // State for match validation feedback
  const [matchFeedback, setMatchFeedback] = useState({ show: false, correct: false });

  const checkMatch = () => {
    if (!selectedTerm || !selectedDefinition) return;

    const activity = practiceActivities[currentActivity];
    const pair = activity.pairs.find(p => p.id === selectedTerm);

    if (pair && pair.id === selectedDefinition) {
      // Correct match
      setMatchedPairs([...matchedPairs, selectedTerm]);
      setSelectedTerm(null);
      setSelectedDefinition(null);
      setMatchFeedback({ show: true, correct: true });

      // Check if all pairs are matched
      if (matchedPairs.length + 1 >= activity.pairs.length) {
        setGameCompleted(true);
      }

      // Hide feedback after delay
      setTimeout(() => setMatchFeedback({ show: false, correct: false }), 1500);
    } else {
      // Incorrect match - show error feedback
      setMatchFeedback({ show: true, correct: false });
      setTimeout(() => {
        setSelectedTerm(null);
        setSelectedDefinition(null);
        setMatchFeedback({ show: false, correct: false });
      }, 1500);
    }
  };

  // MCQ logic
  const handleAnswerSelect = (questionId, optionId) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionId]: optionId
    });
    
    setShowExplanations({
      ...showExplanations,
      [questionId]: true
    });
  };

  // Sequence game logic - click to swap
  const handleSequenceItemClick = (index) => {
    if (sequenceCorrect) return;

    if (selectedSequenceIndex === null) {
      // First selection
      setSelectedSequenceIndex(index);
    } else if (selectedSequenceIndex === index) {
      // Clicking same item deselects it
      setSelectedSequenceIndex(null);
    } else {
      // Swap the two items
      const newItems = [...draggedItems];
      const temp = newItems[selectedSequenceIndex];
      newItems[selectedSequenceIndex] = newItems[index];
      newItems[index] = temp;
      setDraggedItems(newItems);
      setSelectedSequenceIndex(null);
    }
  };

  const handleSequenceSubmit = () => {
    const isCorrect = draggedItems.every((item, index) => item.order === index + 1);

    if (isCorrect) {
      setSequenceCorrect(true);
      setSequenceWrong(false);
    } else {
      setSequenceWrong(true);
      // Hide wrong feedback after delay
      setTimeout(() => setSequenceWrong(false), 2000);
    }
  };

  // Navigation functions
  const completeLesson = (lessonId) => {
    if (!completedLessons.includes(lessonId)) {
      setCompletedLessons([...completedLessons, lessonId]);
    }
  };

  const nextLesson = () => {
    if (currentLesson < lessons.length - 1) {
      setCurrentLesson(currentLesson + 1);
    } else {
      setCurrentPhase('practice');
    }
  };

  const prevLesson = () => {
    if (currentLesson > 0) {
      setCurrentLesson(currentLesson - 1);
    }
  };

  const nextActivity = () => {
    // Reset game states
    setSelectedMatches({});
    setMatchedPairs([]);
    setSelectedTerm(null);
    setSelectedDefinition(null);
    setGameCompleted(false);
    setMatchFeedback({ show: false, correct: false });
    setSelectedAnswers({});
    setShowExplanations({});
    setDraggedItems([]);
    setSequenceCorrect(false);
    setSequenceWrong(false);
    setSelectedSequenceIndex(null);

    if (currentActivity < practiceActivities.length - 1) {
      setCurrentActivity(currentActivity + 1);
    } else if (isReviewMode) {
      // In review mode, go back to game after practice activities
      navigate('/game');
    } else {
      setCurrentPhase('truefalse');
    }
  };

  const prevActivity = () => {
    // Reset game states
    setSelectedMatches({});
    setMatchedPairs([]);
    setSelectedTerm(null);
    setSelectedDefinition(null);
    setGameCompleted(false);
    setMatchFeedback({ show: false, correct: false });
    setSelectedAnswers({});
    setShowExplanations({});
    setDraggedItems([]);
    setSequenceCorrect(false);
    setSequenceWrong(false);
    setSelectedSequenceIndex(null);

    if (currentActivity > 0) {
      setCurrentActivity(currentActivity - 1);
    }
  };

  // Shuffled definitions for matching game
  const [shuffledDefinitions, setShuffledDefinitions] = useState([]);

  // Initialize sequence game and shuffle matching definitions
  useEffect(() => {
    if (currentPhase === 'practice' && practiceActivities[currentActivity]?.type === 'sequence') {
      const activity = practiceActivities[currentActivity];
      const shuffled = [...activity.items].sort(() => Math.random() - 0.5);
      setDraggedItems(shuffled);
    }
    // Shuffle definitions for matching game
    if (currentPhase === 'practice' && practiceActivities[currentActivity]?.type === 'matching') {
      const activity = practiceActivities[currentActivity];
      const shuffled = [...activity.pairs].sort(() => Math.random() - 0.5);
      setShuffledDefinitions(shuffled);
    }
  }, [currentActivity, currentPhase]);

  const getProgressMessage = () => {
    const completed = completedLessons.length;
    const total = lessons.length;
    const percentage = (completed / total) * 100;
    
    if (percentage === 100) return "🏆 Investment Banking Expert! You're ready for Wall Street!";
    if (percentage >= 75) return "⭐ Excellent progress in investment banking!";
    if (percentage >= 50) return "📈 Great work! You're learning effectively!";
    return "🚀 Keep going! Building strong foundations!";
  };

  // Start review mode
  const startReviewMode = () => {
    setIsReviewMode(true);
    setCurrentPhase('lessons');
    setCurrentLesson(0);
  };

  // If module is already passed and not in review mode, show completion screen
  if (modulePassed && !isReviewMode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-6 flex items-center justify-center">
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
            🏦
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Module Completed!</h2>
          <p className="text-gray-600 mb-6">
            You've already passed the Investment Banking module. Great job understanding capital markets!
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-6 font-['Inter',system-ui,sans-serif]">
      {/* Premium Header */}
      <motion.div
        className="flex items-center justify-between mb-8 bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-200/60"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <button
          onClick={() => navigate('/game')}
          className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all duration-300 font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Roadmap
        </button>

        <div className="text-center">
          <h1 className="text-2xl font-semibold text-slate-800 tracking-tight">Investment Banking</h1>
          <p className="text-sm text-slate-500 font-medium">Professional Development Module</p>
          <div className="flex gap-2 mt-3 justify-center">
            <span className={`text-xs px-4 py-1.5 rounded-full font-semibold transition-all duration-300 ${currentPhase === 'lessons' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'bg-slate-100 text-slate-500'}`}>Lessons</span>
            <span className={`text-xs px-4 py-1.5 rounded-full font-semibold transition-all duration-300 ${currentPhase === 'practice' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'bg-slate-100 text-slate-500'}`}>Practice</span>
            <span className={`text-xs px-4 py-1.5 rounded-full font-semibold transition-all duration-300 ${currentPhase === 'truefalse' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'bg-slate-100 text-slate-500'}`}>Assessment</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-slate-700 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200">
            <Trophy className="w-5 h-5 text-emerald-500" />
            <span className="font-semibold">{completedLessons.length}/{lessons.length} Lessons</span>
          </div>
        </div>
      </motion.div>

      {/* Content Sections */}
      {currentPhase === 'truefalse' ? (
        <div className="max-w-4xl mx-auto">
          <TrueFalseCard
            onQuizComplete={(result) => setQuizPassed(result.passed)}
            onQuizFinished={(finished) => setQuizFinished(finished)}
          />
          {/* Complete Module Section - Only show after quiz is finished */}
          {quizFinished && (
            <div className="mt-8 p-6 bg-white rounded-2xl shadow-lg border border-slate-200 text-center">
              <h3 className="text-lg font-semibold text-slate-700 mb-4">
                {quizPassed ? 'Congratulations! You passed the quiz!' : 'You need to pass the quiz to complete this module'}
              </h3>

              {!quizPassed && (
                <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-amber-600 text-lg">📝</span>
                    <span className="font-semibold text-amber-700">Score at least 70% on the quiz to pass. The quiz will restart automatically.</span>
                  </div>
                </div>
              )}

              {saveResult && (
                <div className={`mb-4 p-3 rounded-xl ${saveResult.passed ? 'bg-green-50 border border-green-200' : 'bg-orange-50 border border-orange-200'}`}>
                  <div className="flex items-center justify-center gap-2">
                    {saveResult.passed ? (
                      <>
                        <CheckCircle className="text-green-600" size={20} />
                        <span className="font-semibold text-green-700">Module Passed! Attempt #{saveResult.attemptNumber}</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="text-orange-600" size={20} />
                        <span className="font-semibold text-orange-700">Complete the assessment for 100% to pass. Attempt #{saveResult.attemptNumber}</span>
                      </>
                    )}
                  </div>
                </div>
              )}

              <div className="flex gap-4 justify-center">
                <button
                  onClick={async () => {
                    setIsSaving(true);
                    try {
                      // For this module, completing the assessment = 100%
                      const result = await saveScore('investment-banking', 100, 100);
                      setSaveResult(result);
                    } catch (err) {
                      console.error('Error saving score:', err);
                    } finally {
                      setIsSaving(false);
                    }
                  }}
                  disabled={isSaving || saveResult?.passed || !quizPassed}
                  className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      Saving...
                    </>
                  ) : saveResult?.passed ? (
                    <>
                      <CheckCircle size={18} />
                      Completed!
                    </>
                  ) : !quizPassed ? (
                    <>
                      <Trophy size={18} />
                      Pass Quiz First
                    </>
                  ) : (
                    <>
                      <Trophy size={18} />
                      Complete Module
                    </>
                  )}
                </button>
                <button
                  onClick={() => navigate('/game')}
                  className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold transition"
                >
                  Back to Roadmap
                </button>
              </div>
            </div>
          )}
        </div>
      ) : currentPhase === 'lessons' ? (
        /* Premium Lessons */
        <motion.div
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-slate-500 mb-3 font-medium">
              <span>Lesson {currentLesson + 1} of {lessons.length}</span>
              <span>{Math.round(((currentLesson + 1) / lessons.length) * 100)}% Complete</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
              <motion.div
                className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2.5 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${((currentLesson + 1) / lessons.length) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          {/* Lesson Card - Premium */}
          <motion.div
            key={currentLesson}
            className="bg-white rounded-2xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-200/60 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Header */}
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">{lessons[currentLesson].icon}</div>
              <h2 className="text-2xl font-semibold text-slate-800 mb-3 tracking-tight">
                {lessons[currentLesson].title}
              </h2>
            </div>

            {/* Content */}
            <div className="space-y-6">
              <div className="bg-slate-50 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-slate-200">
                <h3 className="text-lg font-semibold text-emerald-600 mb-3">Key Concept</h3>
                <p className="text-slate-700 leading-relaxed">
                  {lessons[currentLesson].concept}
                </p>
              </div>

              <div className="bg-slate-50 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-slate-200">
                <h3 className="text-lg font-semibold text-teal-600 mb-3">Explanation</h3>
                <p className="text-slate-700 leading-relaxed">
                  {lessons[currentLesson].explanation}
                </p>
              </div>

              <div className="bg-emerald-50 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-emerald-200">
                <h3 className="text-lg font-semibold text-emerald-700 mb-3">Key Takeaway</h3>
                <p className="text-emerald-800 font-medium">
                  {lessons[currentLesson].keyPoint}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Navigation - Premium */}
          <div className="flex justify-between items-center">
            <motion.button
              onClick={prevLesson}
              disabled={currentLesson === 0}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                currentLesson === 0
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm'
              }`}
              whileHover={currentLesson !== 0 ? { scale: 1.02 } : {}}
              whileTap={currentLesson !== 0 ? { scale: 0.98 } : {}}
            >
              ← Previous
            </motion.button>

            <div className="flex gap-2">
              {lessons.map((_, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentLesson ? 'bg-emerald-500 shadow-lg shadow-emerald-500/40' :
                    completedLessons.includes(index + 1) ? 'bg-teal-500' : 'bg-slate-300'
                  }`}
                />
              ))}
            </div>

            <motion.button
              onClick={() => {
                completeLesson(currentLesson + 1);
                nextLesson();
              }}
              className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 shadow-lg shadow-emerald-500/25"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              {currentLesson === lessons.length - 1 ? 'Start Practice' : 'Continue'}
              <ChevronRight className="w-4 h-4" />
            </motion.button>
          </div>
        </motion.div>
      ) : currentPhase === 'practice' ? (
        /* Practice Activities - Premium UI */
        <motion.div
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-slate-500 mb-3 font-medium">
              <span>Activity {currentActivity + 1} of {practiceActivities.length}</span>
              <span>{Math.round(((currentActivity + 1) / practiceActivities.length) * 100)}% Complete</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
              <motion.div
                className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2.5 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${((currentActivity + 1) / practiceActivities.length) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          {/* Activity Card - Premium */}
          <motion.div
            key={currentActivity}
            className="bg-white rounded-2xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-200/60 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Review Mode Banner */}
            {isReviewMode && (
              <div className="mb-6 bg-orange-50 border border-orange-200 rounded-xl p-4 text-center">
                <p className="text-orange-700 font-medium">
                  📖 Review Mode - Try the activity or skip to next
                </p>
              </div>
            )}

            {/* Activity Header */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold text-slate-800 mb-2 tracking-tight">
                {practiceActivities[currentActivity].title}
              </h2>
              <p className="text-slate-500 font-medium">
                {practiceActivities[currentActivity].instruction}
              </p>
            </div>

            {/* Activity Content */}
            <div className="space-y-6">
              {/* Matching Game - Premium */}
              {practiceActivities[currentActivity].type === 'matching' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
                    {/* Terms Column */}
                    <div className="space-y-3">
                      <h3 className="font-semibold text-slate-700 text-center pb-3 border-b border-slate-200">Services</h3>
                      {practiceActivities[currentActivity].pairs.map((pair) => (
                        <motion.button
                          key={`term-${pair.id}`}
                          onClick={() => handleTermClick(pair.id)}
                          className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-300 ${
                            matchedPairs.includes(pair.id)
                              ? 'bg-emerald-50 border-emerald-400 text-emerald-700 shadow-lg shadow-emerald-500/15'
                              : selectedTerm === pair.id
                                ? 'bg-teal-50 border-teal-400 text-teal-700 shadow-lg shadow-teal-500/15'
                                : 'bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-white text-slate-700'
                          }`}
                          whileHover={!matchedPairs.includes(pair.id) ? { scale: 1.02, y: -2 } : {}}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{pair.emoji}</span>
                            <span className="font-medium">{pair.term}</span>
                          </div>
                        </motion.button>
                      ))}
                    </div>

                    {/* Definitions Column - Using shuffled definitions */}
                    <div className="space-y-3">
                      <h3 className="font-semibold text-slate-700 text-center pb-3 border-b border-slate-200">Descriptions</h3>
                      {shuffledDefinitions.map((pair) => (
                        <motion.button
                          key={`def-${pair.id}`}
                          onClick={() => handleDefinitionClick(pair.id)}
                          className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-300 ${
                            matchedPairs.includes(pair.id)
                              ? 'bg-emerald-50 border-emerald-400 text-emerald-700 shadow-lg shadow-emerald-500/15'
                              : selectedDefinition === pair.id
                                ? 'bg-teal-50 border-teal-400 text-teal-700 shadow-lg shadow-teal-500/15'
                                : 'bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-white text-slate-700'
                          }`}
                          whileHover={!matchedPairs.includes(pair.id) ? { scale: 1.02, y: -2 } : {}}
                          whileTap={{ scale: 0.98 }}
                        >
                          <span className="font-medium">{pair.definition}</span>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Check Match Button */}
                  {!gameCompleted && (
                    <div className="text-center">
                      <motion.button
                        onClick={checkMatch}
                        disabled={!selectedTerm || !selectedDefinition}
                        className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 ${
                          selectedTerm && selectedDefinition
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg shadow-emerald-500/25'
                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        }`}
                        whileHover={selectedTerm && selectedDefinition ? { scale: 1.02, y: -2 } : {}}
                        whileTap={{ scale: 0.98 }}
                      >
                        Check Match
                      </motion.button>
                    </div>
                  )}

                  {/* Match Feedback */}
                  {matchFeedback.show && (
                    <motion.div
                      className={`p-4 rounded-xl text-center ${
                        matchFeedback.correct
                          ? 'bg-emerald-50 border border-emerald-300'
                          : 'bg-red-50 border border-red-300'
                      }`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <div className="text-2xl mb-1">{matchFeedback.correct ? '✅' : '❌'}</div>
                      <div className={`font-semibold ${matchFeedback.correct ? 'text-emerald-700' : 'text-red-700'}`}>
                        {matchFeedback.correct ? 'Correct Match!' : 'Wrong Match! Try again.'}
                      </div>
                    </motion.div>
                  )}

                  {gameCompleted && (
                    <motion.div
                      className="bg-emerald-50 border border-emerald-300 rounded-2xl p-6 text-center"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      <div className="text-3xl mb-2">✅</div>
                      <div className="font-semibold text-emerald-700">Excellent Work!</div>
                      <div className="text-sm text-emerald-600">All pairs matched correctly!</div>
                    </motion.div>
                  )}
                </div>
              )}

              {/* MCQ Game - Premium */}
              {practiceActivities[currentActivity].type === 'mcq' && (
                <div className="space-y-8">
                  {practiceActivities[currentActivity].questions.map((question, qIndex) => (
                    <div key={question.id} className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                      <div className="mb-4">
                        <p className="text-slate-500 text-sm font-medium mb-2">Scenario:</p>
                        <p className="text-slate-700 leading-relaxed mb-4">{question.scenario}</p>
                        <p className="font-semibold text-slate-800">{question.question}</p>
                      </div>

                      <div className="space-y-3 mb-4">
                        {question.options.map((option, index) => (
                          <motion.button
                            key={option.id}
                            onClick={() => handleAnswerSelect(question.id, option.id)}
                            className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-300 ${
                              selectedAnswers[question.id] === option.id
                                ? option.correct
                                  ? 'bg-emerald-50 border-emerald-400 text-emerald-700 shadow-lg shadow-emerald-500/15'
                                  : 'bg-red-50 border-red-400 text-red-700 shadow-lg shadow-red-500/15'
                                : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                            }`}
                            disabled={showExplanations[question.id]}
                            whileHover={!showExplanations[question.id] ? { scale: 1.01, y: -1 } : {}}
                            whileTap={{ scale: 0.99 }}
                          >
                            <span className="font-medium">{option.text}</span>
                          </motion.button>
                        ))}
                      </div>

                      {showExplanations[question.id] && (
                        <motion.div
                          className="bg-teal-50 border border-teal-300 rounded-xl p-4"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                        >
                          <p className="text-teal-700 font-semibold">Explanation:</p>
                          <p className="text-teal-600">{question.explanation}</p>
                        </motion.div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Sequence Game - Premium */}
              {practiceActivities[currentActivity].type === 'sequence' && (
                <div className="space-y-6">
                  <p className="text-center text-slate-500 text-sm">Drag items to reorder them</p>
                  <Reorder.Group
                    axis="y"
                    values={draggedItems}
                    onReorder={setDraggedItems}
                    className="space-y-3"
                  >
                    {draggedItems.map((item, index) => (
                      <Reorder.Item
                        key={item.id}
                        value={item}
                        className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-grab active:cursor-grabbing transition-colors ${
                          sequenceCorrect
                            ? 'bg-emerald-50 border-emerald-400 shadow-lg shadow-emerald-500/15'
                            : 'bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-white'
                        }`}
                        whileDrag={{ scale: 1.02, boxShadow: '0 10px 30px rgba(0,0,0,0.15)' }}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${
                          sequenceCorrect ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-600'
                        }`}>
                          {index + 1}
                        </div>
                        <div className="text-2xl">{item.icon}</div>
                        <div className="flex-1">
                          <span className={`font-medium ${sequenceCorrect ? 'text-emerald-700' : 'text-slate-700'}`}>{item.text}</span>
                        </div>
                      </Reorder.Item>
                    ))}
                  </Reorder.Group>

                  {!sequenceCorrect && (
                    <div className="text-center">
                      <motion.button
                        onClick={handleSequenceSubmit}
                        className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-emerald-500/25"
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Submit Order
                      </motion.button>
                    </div>
                  )}

                  {/* Wrong Answer Alert */}
                  {sequenceWrong && (
                    <motion.div
                      className="bg-red-50 border border-red-300 rounded-2xl p-6 text-center"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      <div className="text-3xl mb-2">❌</div>
                      <div className="font-semibold text-red-700">Wrong Order!</div>
                      <div className="text-sm text-red-600">The sequence is not correct. Try rearranging the steps.</div>
                    </motion.div>
                  )}

                  {sequenceCorrect && (
                    <motion.div
                      className="bg-emerald-50 border border-emerald-300 rounded-2xl p-6 text-center"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      <div className="text-3xl mb-2">✅</div>
                      <div className="font-semibold text-emerald-700">Perfect Sequence!</div>
                      <div className="text-sm text-emerald-600">Correct IPO process order!</div>
                    </motion.div>
                  )}
                </div>
              )}

              {/* Analysis Game - Premium */}
              {practiceActivities[currentActivity].type === 'analysis' && (
                <AnalysisGame
                  activity={practiceActivities[currentActivity]}
                  onComplete={markActivityCompleted}
                />
              )}
            </div>
          </motion.div>

          {/* Navigation - Premium */}
          <div className="flex justify-between items-center">
            <motion.button
              onClick={prevActivity}
              disabled={currentActivity === 0}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                currentActivity === 0
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm'
              }`}
              whileHover={currentActivity !== 0 ? { scale: 1.02 } : {}}
              whileTap={currentActivity !== 0 ? { scale: 0.98 } : {}}
            >
              ← Previous
            </motion.button>

            <div className="flex gap-2">
              {practiceActivities.map((_, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentActivity ? 'bg-emerald-500 shadow-lg shadow-emerald-500/40' :
                    index < currentActivity ? 'bg-teal-500' : 'bg-slate-300'
                  }`}
                />
              ))}
            </div>

            <motion.button
              onClick={nextActivity}
              disabled={!isCurrentActivityCompleted()}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${
                isCurrentActivityCompleted()
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg shadow-emerald-500/25'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
              whileHover={isCurrentActivityCompleted() ? { scale: 1.02, y: -2 } : {}}
              whileTap={isCurrentActivityCompleted() ? { scale: 0.98 } : {}}
            >
              {currentActivity === practiceActivities.length - 1
                ? (isReviewMode ? 'Finish Review' : 'Take Assessment')
                : 'Next Activity'}
              <ChevronRight className="w-4 h-4" />
            </motion.button>
          </div>
        </motion.div>
      ) : (
        /* Results/Completion Screen - Premium */
        <motion.div
          className="max-w-2xl mx-auto text-center"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="bg-white rounded-2xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-200/60">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <Trophy className="w-20 h-20 mx-auto text-emerald-500 mb-6" />
            </motion.div>

            <h2 className="text-3xl font-semibold text-slate-800 mb-4 tracking-tight">Module Completed!</h2>
            <p className="text-xl text-slate-600 mb-8">
              {getProgressMessage()}
            </p>

            {/* Final Stats */}
            <div className="mb-8">
              <div className="bg-slate-50 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-slate-200">
                <div className="text-2xl sm:text-3xl font-bold text-teal-600">{completedLessons.length}/{lessons.length}</div>
                <div className="text-sm text-slate-500 font-medium">Lessons Completed</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                onClick={() => navigate('/game')}
                className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-emerald-500/25"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                Back to Roadmap
              </motion.button>
              <motion.button
                onClick={() => {
                  setCurrentPhase('lessons');
                  setCurrentLesson(0);
                  setCurrentActivity(0);
                  setCompletedLessons([]);
                }}
                className="px-8 py-3 bg-white hover:bg-slate-50 text-slate-700 rounded-xl font-semibold transition-all duration-300 border border-slate-200 shadow-sm"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                Restart Module
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default InvestmentBankingModule;