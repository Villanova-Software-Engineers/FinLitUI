import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Star, Trophy, CheckCircle, XCircle, Heart, Zap, Award, Target, Play, BookOpen, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TrueFalseCard from '../TrueFalse/TrueFalseCard';

const InvestmentBankingModule = () => {
  const navigate = useNavigate();
  const [currentPhase, setCurrentPhase] = useState('lessons'); // 'lessons', 'practice', 'truefalse', 'results'
  const [currentLesson, setCurrentLesson] = useState(0);
  const [currentActivity, setCurrentActivity] = useState(0);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [totalXP, setTotalXP] = useState(0);
  const [streak, setStreak] = useState(0);
  const [achievements, setAchievements] = useState([]);
  
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
      if (selectedTerm) {
        checkMatch(selectedTerm, definitionId);
      }
    }
  };

  const checkMatch = (termId, definitionId) => {
    const activity = practiceActivities[currentActivity];
    const pair = activity.pairs.find(p => p.id === termId);
    
    if (pair && pair.id === definitionId) {
      // Correct match
      setMatchedPairs([...matchedPairs, termId, definitionId]);
      setSelectedTerm(null);
      setSelectedDefinition(null);
      
      // Check if all pairs are matched
      if (matchedPairs.length + 2 >= activity.pairs.length * 2) {
        setGameCompleted(true);
        setTotalXP(totalXP + 100);
      }
    } else {
      // Incorrect match - briefly show error then reset
      setTimeout(() => {
        setSelectedTerm(null);
        setSelectedDefinition(null);
      }, 1000);
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

  // Sequence game logic
  const handleSequenceSubmit = () => {
    const activity = practiceActivities[currentActivity];
    const isCorrect = draggedItems.every((item, index) => item.order === index + 1);
    
    if (isCorrect) {
      setSequenceCorrect(true);
      setTotalXP(totalXP + 100);
    }
  };

  // Navigation functions
  const completeLesson = (lessonId) => {
    if (!completedLessons.includes(lessonId)) {
      setCompletedLessons([...completedLessons, lessonId]);
      setTotalXP(totalXP + 50);
      setStreak(streak + 1);
      
      if (streak === 2) {
        setAchievements([...achievements, { id: 'streak3', name: 'Learning Streak!', desc: '3 lessons completed', emoji: '🔥' }]);
      }
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
    setSelectedAnswers({});
    setShowExplanations({});
    setDraggedItems([]);
    setSequenceCorrect(false);
    
    if (currentActivity < practiceActivities.length - 1) {
      setCurrentActivity(currentActivity + 1);
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
    setSelectedAnswers({});
    setShowExplanations({});
    setDraggedItems([]);
    setSequenceCorrect(false);
    
    if (currentActivity > 0) {
      setCurrentActivity(currentActivity - 1);
    }
  };

  // Initialize sequence game
  useEffect(() => {
    if (currentPhase === 'practice' && practiceActivities[currentActivity]?.type === 'sequence') {
      const activity = practiceActivities[currentActivity];
      const shuffled = [...activity.items].sort(() => Math.random() - 0.5);
      setDraggedItems(shuffled);
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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Professional Header */}
      <motion.div
        className="flex items-center justify-between mb-8 bg-white rounded-lg p-6 shadow-sm border border-gray-200"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <button
          onClick={() => navigate('/game')}
          className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Roadmap
        </button>
        
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900">Investment Banking</h1>
          <p className="text-sm text-slate-600">Professional Development Module</p>
          <div className="flex gap-2 mt-3 justify-center">
            <span className={`text-xs px-3 py-1 rounded-full ${currentPhase === 'lessons' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'}`}>Lessons</span>
            <span className={`text-xs px-3 py-1 rounded-full ${currentPhase === 'practice' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'}`}>Practice</span>
            <span className={`text-xs px-3 py-1 rounded-full ${currentPhase === 'truefalse' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'}`}>Assessment</span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-slate-600">
            <Trophy className="w-5 h-5" />
            <span className="font-medium">{completedLessons.length}/{lessons.length}</span>
          </div>
          
          <div className="flex items-center gap-2 text-slate-600">
            <Star className="w-5 h-5" />
            <span className="font-medium">{totalXP} XP</span>
          </div>
          
          {streak > 0 && (
            <div className="flex items-center gap-2 text-amber-600">
              <Zap className="w-5 h-5" />
              <span className="font-medium">{streak}🔥</span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Achievement Notifications */}
      <AnimatePresence>
        {achievements.length > 0 && (
          <motion.div
            className="fixed top-4 right-4 z-50"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
          >
            {achievements.slice(-1).map(achievement => (
              <div key={achievement.id} className="bg-white border border-amber-200 rounded-lg p-4 shadow-lg">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{achievement.emoji}</span>
                  <div>
                    <div className="font-semibold text-slate-900">{achievement.name}</div>
                    <div className="text-sm text-slate-600">{achievement.desc}</div>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content Sections */}
      {currentPhase === 'truefalse' ? (
        <TrueFalseCard />
      ) : currentPhase === 'lessons' ? (
        /* Professional Lessons */
        <motion.div
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-slate-600 mb-3">
              <span>Lesson {currentLesson + 1} of {lessons.length}</span>
              <span>{Math.round(((currentLesson + 1) / lessons.length) * 100)}% Complete</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <motion.div
                className="bg-slate-900 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${((currentLesson + 1) / lessons.length) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          {/* Lesson Card */}
          <motion.div
            key={currentLesson}
            className="bg-white rounded-lg p-8 shadow-sm border border-gray-200 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Header */}
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">{lessons[currentLesson].icon}</div>
              <h2 className="text-2xl font-bold text-slate-900 mb-3">
                {lessons[currentLesson].title}
              </h2>
            </div>

            {/* Content */}
            <div className="space-y-6">
              <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900 mb-3">Key Concept</h3>
                <p className="text-slate-700 leading-relaxed">
                  {lessons[currentLesson].concept}
                </p>
              </div>

              <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900 mb-3">Explanation</h3>
                <p className="text-slate-700 leading-relaxed">
                  {lessons[currentLesson].explanation}
                </p>
              </div>

              <div className="bg-amber-50 rounded-lg p-6 border border-amber-200">
                <h3 className="text-lg font-semibold text-amber-800 mb-3">Key Takeaway</h3>
                <p className="text-amber-800 font-medium">
                  {lessons[currentLesson].keyPoint}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <button
              onClick={prevLesson}
              disabled={currentLesson === 0}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                currentLesson === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
              }`}
            >
              ← Previous
            </button>

            <div className="flex gap-2">
              {lessons.map((_, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full ${
                    index === currentLesson ? 'bg-slate-900' : 
                    completedLessons.includes(index + 1) ? 'bg-slate-600' : 'bg-slate-300'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={() => {
                completeLesson(currentLesson + 1);
                nextLesson();
              }}
              className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              {currentLesson === lessons.length - 1 ? 'Start Practice' : 'Continue'}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      ) : currentPhase === 'practice' ? (
        /* Practice Activities */
        <motion.div
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-slate-600 mb-3">
              <span>Activity {currentActivity + 1} of {practiceActivities.length}</span>
              <span>{Math.round(((currentActivity + 1) / practiceActivities.length) * 100)}% Complete</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <motion.div
                className="bg-slate-900 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${((currentActivity + 1) / practiceActivities.length) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          {/* Activity Card */}
          <motion.div
            key={currentActivity}
            className="bg-white rounded-lg p-8 shadow-sm border border-gray-200 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Activity Header */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                {practiceActivities[currentActivity].title}
              </h2>
              <p className="text-slate-600">
                {practiceActivities[currentActivity].instruction}
              </p>
            </div>

            {/* Activity Content */}
            <div className="space-y-6">
              {/* Matching Game */}
              {practiceActivities[currentActivity].type === 'matching' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Terms Column */}
                    <div className="space-y-3">
                      <h3 className="font-semibold text-slate-900 text-center pb-3 border-b border-slate-200">Services</h3>
                      {practiceActivities[currentActivity].pairs.map((pair, index) => (
                        <motion.button
                          key={`term-${pair.id}`}
                          onClick={() => handleTermClick(pair.id)}
                          className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                            matchedPairs.includes(pair.id) 
                              ? 'bg-green-50 border-green-300 text-green-800' 
                              : selectedTerm === pair.id 
                                ? 'bg-blue-50 border-blue-300 text-blue-800'
                                : 'bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-700'
                          }`}
                          whileHover={!matchedPairs.includes(pair.id) ? { scale: 1.02 } : {}}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{pair.emoji}</span>
                            <span className="font-medium">{pair.term}</span>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                    
                    {/* Definitions Column */}
                    <div className="space-y-3">
                      <h3 className="font-semibold text-slate-900 text-center pb-3 border-b border-slate-200">Descriptions</h3>
                      {practiceActivities[currentActivity].pairs.map((pair, index) => (
                        <motion.button
                          key={`def-${pair.id}`}
                          onClick={() => handleDefinitionClick(pair.id)}
                          className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                            matchedPairs.includes(pair.id) 
                              ? 'bg-green-50 border-green-300 text-green-800' 
                              : selectedDefinition === pair.id 
                                ? 'bg-blue-50 border-blue-300 text-blue-800'
                                : 'bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-700'
                          }`}
                          whileHover={!matchedPairs.includes(pair.id) ? { scale: 1.02 } : {}}
                          whileTap={{ scale: 0.98 }}
                        >
                          <span className="font-medium">{pair.definition}</span>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                  
                  {gameCompleted && (
                    <motion.div
                      className="bg-green-50 border border-green-300 rounded-lg p-6 text-center"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      <div className="text-3xl mb-2">✅</div>
                      <div className="font-semibold text-green-800">Excellent Work!</div>
                      <div className="text-sm text-green-600">All pairs matched correctly! +100 XP</div>
                    </motion.div>
                  )}
                </div>
              )}

              {/* MCQ Game */}
              {practiceActivities[currentActivity].type === 'mcq' && (
                <div className="space-y-8">
                  {practiceActivities[currentActivity].questions.map((question, qIndex) => (
                    <div key={question.id} className="bg-slate-50 rounded-lg p-6 border border-slate-200">
                      <div className="mb-4">
                        <p className="text-slate-600 text-sm mb-2">Scenario:</p>
                        <p className="text-slate-800 leading-relaxed mb-4">{question.scenario}</p>
                        <p className="font-semibold text-slate-900">{question.question}</p>
                      </div>
                      
                      <div className="space-y-3 mb-4">
                        {question.options.map((option, index) => (
                          <button
                            key={option.id}
                            onClick={() => handleAnswerSelect(question.id, option.id)}
                            className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                              selectedAnswers[question.id] === option.id
                                ? option.correct
                                  ? 'bg-green-50 border-green-300 text-green-800'
                                  : 'bg-red-50 border-red-300 text-red-800'
                                : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                            }`}
                            disabled={showExplanations[question.id]}
                          >
                            <span className="font-medium">{option.text}</span>
                          </button>
                        ))}
                      </div>
                      
                      {showExplanations[question.id] && (
                        <motion.div
                          className="bg-blue-50 border border-blue-300 rounded-lg p-4"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                        >
                          <p className="text-blue-800 font-medium">Explanation:</p>
                          <p className="text-blue-700">{question.explanation}</p>
                        </motion.div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Sequence Game */}
              {practiceActivities[currentActivity].type === 'sequence' && (
                <div className="space-y-6">
                  <div className="space-y-3">
                    {draggedItems.map((item, index) => (
                      <motion.div
                        key={item.id}
                        className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-move ${
                          sequenceCorrect 
                            ? 'bg-green-50 border-green-300' 
                            : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                        }`}
                        whileHover={{ scale: 1.01 }}
                        drag="y"
                        dragConstraints={{ top: 0, bottom: 0 }}
                        onDragEnd={(event, info) => {
                          const draggedIndex = index;
                          const targetIndex = Math.max(0, Math.min(draggedItems.length - 1, 
                            Math.round(draggedIndex + info.offset.y / 80)));
                          
                          if (draggedIndex !== targetIndex) {
                            const newItems = [...draggedItems];
                            const [removed] = newItems.splice(draggedIndex, 1);
                            newItems.splice(targetIndex, 0, removed);
                            setDraggedItems(newItems);
                          }
                        }}
                      >
                        <div className="w-8 h-8 bg-slate-200 text-slate-700 rounded-full flex items-center justify-center font-semibold text-sm">
                          {index + 1}
                        </div>
                        <div className="text-2xl">{item.icon}</div>
                        <div className="flex-1">
                          <span className="font-medium text-slate-700">{item.text}</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  
                  {!sequenceCorrect && (
                    <div className="text-center">
                      <button
                        onClick={handleSequenceSubmit}
                        className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-medium transition-colors"
                      >
                        Submit Order
                      </button>
                    </div>
                  )}
                  
                  {sequenceCorrect && (
                    <motion.div
                      className="bg-green-50 border border-green-300 rounded-lg p-6 text-center"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      <div className="text-3xl mb-2">✅</div>
                      <div className="font-semibold text-green-800">Perfect Sequence!</div>
                      <div className="text-sm text-green-600">Correct IPO process order! +100 XP</div>
                    </motion.div>
                  )}
                </div>
              )}

              {/* Analysis Game */}
              {practiceActivities[currentActivity].type === 'analysis' && (
                <div className="space-y-6">
                  <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
                    <h3 className="font-semibold text-slate-900 mb-4">Company Analysis: {practiceActivities[currentActivity].company}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(practiceActivities[currentActivity].data).map(([key, value]) => (
                        <div key={key} className="bg-white rounded-lg p-4 border border-slate-200">
                          <div className="font-medium text-slate-700 capitalize">{key.replace(/([A-Z])/g, ' $1')}:</div>
                          <div className="text-lg font-semibold text-slate-900">{value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <p className="font-semibold text-slate-900 mb-4">What is your investment recommendation?</p>
                    <div className="flex justify-center gap-4">
                      {practiceActivities[currentActivity].options.map((option, index) => (
                        <button
                          key={index}
                          className={`px-6 py-3 rounded-lg border-2 font-medium transition-all ${
                            option.correct 
                              ? 'border-green-300 bg-green-50 text-green-800 hover:bg-green-100'
                              : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          {option.rating}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <button
              onClick={prevActivity}
              disabled={currentActivity === 0}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                currentActivity === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
              }`}
            >
              ← Previous
            </button>

            <div className="flex gap-2">
              {practiceActivities.map((_, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full ${
                    index === currentActivity ? 'bg-slate-900' : 
                    index < currentActivity ? 'bg-slate-600' : 'bg-slate-300'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={() => {
                setTotalXP(totalXP + 75);
                nextActivity();
              }}
              className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              {currentActivity === practiceActivities.length - 1 ? 'Take Assessment' : 'Next Activity'}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      ) : (
        /* Results/Completion Screen */
        <motion.div
          className="max-w-2xl mx-auto text-center"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <Trophy className="w-20 h-20 mx-auto text-amber-500 mb-6" />
            </motion.div>
            
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Module Completed!</h2>
            <p className="text-xl text-slate-600 mb-8">
              {getProgressMessage()}
            </p>

            {/* Final Stats */}
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
                <div className="text-3xl font-bold text-slate-900">{totalXP}</div>
                <div className="text-sm text-slate-600 font-medium">Total XP Earned</div>
              </div>
              <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
                <div className="text-3xl font-bold text-slate-900">{completedLessons.length}</div>
                <div className="text-sm text-slate-600 font-medium">Lessons Completed</div>
              </div>
            </div>

            {/* Achievements */}
            {achievements.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">🏆 Achievements Unlocked:</h3>
                <div className="flex flex-wrap justify-center gap-3">
                  {achievements.map(achievement => (
                    <div key={achievement.id} className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-2">
                      <span className="text-lg mr-2">{achievement.emoji}</span>
                      <span className="text-sm font-medium text-amber-800">{achievement.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/game')}
                className="px-8 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-medium transition-colors"
              >
                Back to Roadmap
              </button>
              <button
                onClick={() => {
                  setCurrentPhase('lessons');
                  setCurrentLesson(0);
                  setCurrentActivity(0);
                  setCompletedLessons([]);
                  setStreak(0);
                  setTotalXP(0);
                  setAchievements([]);
                }}
                className="px-8 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-medium transition-colors"
              >
                Restart Module
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default InvestmentBankingModule;