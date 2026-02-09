import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Shield, Trophy, RotateCcw, CheckCircle, XCircle, BookOpen, Loader2, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useModuleScore, MODULES } from '../hooks/useModuleScore';

const InsuranceModule = () => {
  const navigate = useNavigate();
  const { saveScore, isModulePassed, resetModule, refreshProgress } = useModuleScore();

  // Review mode - allows viewing content without answering
  const [isReviewMode, setIsReviewMode] = useState(false);

  const [currentPhase, setCurrentPhase] = useState('learning'); // 'learning', 'game', 'quiz', 'results'
  const [lessonStep, setLessonStep] = useState(0);
  const [gameState, setGameState] = useState('playing');
  const [draggedItem, setDraggedItem] = useState(null);
  const [assignments, setAssignments] = useState({});
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // Track all answers like CreditScoreModule
  const [showFeedback, setShowFeedback] = useState(false);
  const [shuffledQuiz, setShuffledQuiz] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveResult, setSaveResult] = useState(null);
  const [isResetting, setIsResetting] = useState(false);

  // Check if module is already passed
  const modulePassed = isModulePassed(MODULES.INSURANCE?.id);

  // Shuffle array helper
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Teaching content about insurance types
  const lessons = [
    {
      id: 1,
      title: "What is Insurance?",
      emoji: "🛡️",
      character: "Insurance Agent Ian",
      content: "Insurance is a contract where you pay a premium to protect yourself from financial loss. If something bad happens, the insurance company helps cover the costs!",
      keyPoints: [
        "You pay regular premiums (monthly or yearly)",
        "Insurance protects you from major financial losses",
        "Different types of insurance protect different things",
        "The deductible is what you pay before insurance kicks in"
      ],
      background: "bg-gradient-to-br from-blue-100 to-indigo-100"
    },
    {
      id: 2,
      title: "Health Insurance",
      emoji: "🏥",
      character: "Dr. Health",
      content: "Health insurance helps pay for medical care including doctor visits, hospital stays, surgeries, and prescription medications. It's one of the most important types of insurance!",
      keyPoints: [
        "Covers doctor visits and check-ups",
        "Pays for hospital stays and surgeries",
        "Includes prescription drug coverage",
        "May cover preventive care like vaccines"
      ],
      background: "bg-gradient-to-br from-red-100 to-pink-100"
    },
    {
      id: 3,
      title: "Auto Insurance",
      emoji: "🚗",
      character: "Driver Dave",
      content: "Auto insurance protects you when driving. It covers damage to your car, injuries you cause to others, and even theft. Most states require it by law!",
      keyPoints: [
        "Liability covers damage you cause to others",
        "Collision covers damage to your car in accidents",
        "Comprehensive covers theft and weather damage",
        "Required by law in most states"
      ],
      background: "bg-gradient-to-br from-blue-100 to-cyan-100"
    },
    {
      id: 4,
      title: "Home Insurance",
      emoji: "🏠",
      character: "Homeowner Holly",
      content: "Home insurance protects your house and belongings. It covers damage from fires, storms, theft, and even liability if someone gets hurt on your property.",
      keyPoints: [
        "Covers structural damage to your home",
        "Protects personal belongings inside",
        "Includes liability protection",
        "May cover temporary living expenses"
      ],
      background: "bg-gradient-to-br from-green-100 to-emerald-100"
    },
    {
      id: 5,
      title: "Life Insurance",
      emoji: "❤️",
      character: "Family Fred",
      content: "Life insurance provides money to your family if you pass away. It helps replace lost income and cover expenses so your loved ones are financially secure.",
      keyPoints: [
        "Provides death benefit to beneficiaries",
        "Replaces lost income for your family",
        "Can cover funeral costs and debts",
        "Term life is temporary, whole life is permanent"
      ],
      background: "bg-gradient-to-br from-purple-100 to-violet-100"
    },
    {
      id: 6,
      title: "Travel Insurance",
      emoji: "✈️",
      character: "Traveler Tina",
      content: "Travel insurance protects you while traveling. It covers trip cancellations, lost luggage, medical emergencies abroad, and evacuation if needed.",
      keyPoints: [
        "Covers trip cancellation and delays",
        "Protects lost or stolen luggage",
        "Medical coverage while abroad",
        "Emergency evacuation if needed"
      ],
      background: "bg-gradient-to-br from-yellow-100 to-orange-100"
    }
  ];

  const insuranceTypes = [
    { id: 1, name: "Health Insurance", color: "bg-red-100 border-red-300" },
    { id: 2, name: "Auto Insurance", color: "bg-blue-100 border-blue-300" },
    { id: 3, name: "Life Insurance", color: "bg-purple-100 border-purple-300" },
    { id: 4, name: "Home Insurance", color: "bg-green-100 border-green-300" },
    { id: 5, name: "Travel Insurance", color: "bg-yellow-100 border-yellow-300" }
  ];

  const scenarios = [
    {
      id: 'scenario1',
      text: "Your car was damaged in a hailstorm while parked",
      correctInsurance: 2,
      explanation: "Auto insurance covers damage to your vehicle from weather events like hailstorms."
    },
    {
      id: 'scenario2',
      text: "You need surgery and hospital care",
      correctInsurance: 1,
      explanation: "Health insurance covers medical expenses including surgeries and hospital stays."
    },
    {
      id: 'scenario3',
      text: "A tree falls on your house during a storm",
      correctInsurance: 4,
      explanation: "Home insurance covers structural damage to your house from natural disasters."
    },
    {
      id: 'scenario4',
      text: "You want to provide financial security for your family after your death",
      correctInsurance: 3,
      explanation: "Life insurance provides financial support to your beneficiaries after your death."
    },
    {
      id: 'scenario5',
      text: "Your flight is cancelled and you need to pay extra hotel costs",
      correctInsurance: 5,
      explanation: "Travel insurance covers unexpected expenses like accommodation due to flight delays or cancellations."
    },
    {
      id: 'scenario6',
      text: "You're in a car accident and hurt a pedestrian",
      correctInsurance: 2,
      explanation: "Auto insurance includes liability coverage for injuries you cause to others."
    },
    {
      id: 'scenario7',
      text: "Your prescription medications are very expensive",
      correctInsurance: 1,
      explanation: "Health insurance often includes prescription drug coverage to reduce medication costs."
    },
    {
      id: 'scenario8',
      text: "A burglar steals valuables from your home",
      correctInsurance: 4,
      explanation: "Home insurance covers theft of personal property from your home."
    },
    {
      id: 'scenario9',
      text: "You get sick while traveling abroad",
      correctInsurance: 5,
      explanation: "Travel insurance covers medical emergencies and evacuation while traveling internationally."
    },
    {
      id: 'scenario10',
      text: "Your income needs to replace your spouse's salary after they pass away",
      correctInsurance: 3,
      explanation: "Life insurance replaces lost income and helps families maintain their standard of living."
    }
  ];

  // Final Quiz Questions - 10 questions, 80% (8/10) to pass
  const quizQuestions = [
    {
      id: 1,
      question: "What is the purpose of a deductible in insurance?",
      options: [
        { id: 'A', text: "The amount the insurance company pays you", correct: false },
        { id: 'B', text: "The monthly payment for insurance", correct: false },
        { id: 'C', text: "The amount you pay before insurance coverage kicks in", correct: true },
        { id: 'D', text: "A bonus for not filing claims", correct: false }
      ],
      explanation: "A deductible is the amount you must pay out-of-pocket before your insurance starts covering costs.",
      xp: 25
    },
    {
      id: 2,
      question: "Which type of insurance is typically required by law for drivers?",
      options: [
        { id: 'A', text: "Life Insurance", correct: false },
        { id: 'B', text: "Health Insurance", correct: false },
        { id: 'C', text: "Travel Insurance", correct: false },
        { id: 'D', text: " Auto Insurance", correct: true }
      ],
      explanation: "Auto insurance is required by law in most states to protect other drivers and pedestrians.",
      xp: 25
    },
    {
      id: 3,
      question: "What does 'liability coverage' in auto insurance protect against?",
      options: [
        { id: 'A', text: "Damage to your own car", correct: false },
        { id: 'B', text: "Damage or injuries you cause to others", correct: true },
        { id: 'C', text: "Theft of your vehicle", correct: false },
        { id: 'D', text: "Weather damage to your car", correct: false }
      ],
      explanation: "Liability coverage pays for damage or injuries you cause to other people or their property.",
      xp: 25
    },
    {
      id: 4,
      question: "Which insurance would help your family financially if you passed away?",
      options: [
        { id: 'A', text: "Health Insurance", correct: false },
        { id: 'B', text: "Home Insurance", correct: false },
        { id: 'C', text: "Life Insurance", correct: true },
        { id: 'D', text: "Auto Insurance", correct: false }
      ],
      explanation: "Life insurance provides a death benefit to your beneficiaries to replace lost income.",
      xp: 25
    },
    {
      id: 5,
      question: "What is NOT typically covered by standard home insurance?",
      options: [
        { id: 'A', text: "Fire damage to your house", correct: false },
        { id: 'B', text: "Theft of belongings", correct: false },
        { id: 'C', text: "Wind damage from storms", correct: false },
        { id: 'D', text: "Flood damage", correct: true },

      ],
      explanation: "Flood damage typically requires separate flood insurance and is not covered by standard home insurance.",
      xp: 25
    },
    {
      id: 6,
      question: "What is a 'premium' in insurance?",
      options: [
        { id: 'A', text: "The regular payment you make to keep your insurance active", correct: true },
        { id: 'B', text: "The maximum amount insurance will pay", correct: false },
        { id: 'C', text: "A bonus for staying healthy", correct: false },
        { id: 'D', text: "The amount you pay when you make a claim", correct: false }
      ],
      explanation: "A premium is the regular payment (monthly, quarterly, or annually) you make to maintain your insurance coverage.",
      xp: 25
    },
    {
      id: 7,
      question: "What is the difference between term life and whole life insurance?",
      options: [
        { id: 'A', text: "Term life is permanent, whole life is temporary", correct: false },
        { id: 'B', text: "Term life covers a specific period, whole life covers your entire life", correct: true },
        { id: 'C', text: "Term life is more expensive than whole life", correct: false },
        { id: 'D', text: "There is no difference", correct: false }
      ],
      explanation: "Term life insurance covers you for a specific period (like 20 years), while whole life insurance provides coverage for your entire lifetime and often includes a cash value component.",
      xp: 25
    },
    {
      id: 8,
      question: "What does 'comprehensive coverage' in auto insurance typically cover?",
      options: [
        { id: 'A', text: "Only accidents with other vehicles", correct: false },
        { id: 'B', text: "Theft, vandalism, weather damage, and animal collisions", correct: true },
        { id: 'C', text: "Only medical expenses", correct: false },
        { id: 'D', text: "Only liability to others", correct: false }
      ],
      explanation: "Comprehensive coverage protects your vehicle from non-collision events like theft, vandalism, natural disasters, falling objects, and animal strikes.",
      xp: 25
    },
    {
      id: 9,
      question: "Why might travel insurance be important for international trips?",
      options: [
        { id: 'A', text: "Your regular health insurance typically doesn't cover you abroad", correct: true },
        { id: 'B', text: "It's required by all countries", correct: false },
        { id: 'C', text: "It makes your passport valid", correct: false },
        { id: 'D', text: "It guarantees good weather", correct: false }
      ],
      explanation: "Most domestic health insurance plans have limited or no coverage outside your home country, making travel insurance essential for medical emergencies abroad.",
      xp: 25
    },
    {
      id: 10,
      question: "What is a 'beneficiary' in life insurance?",
      options: [
        { id: 'A', text: "The insurance company", correct: false },
        { id: 'B', text: "The person who sells the insurance", correct: false },
        { id: 'C', text: "The person or entity who receives the death benefit", correct: true },
        { id: 'D', text: "The doctor who examines you", correct: false }
      ],
      explanation: "A beneficiary is the person, people, or organization you designate to receive the life insurance payout (death benefit) when you pass away.",
      xp: 25
    }
  ];

  // Initialize shuffled quiz when entering quiz phase
  useEffect(() => {
    if (currentPhase === 'quiz' && shuffledQuiz.length === 0) {
      const shuffled = quizQuestions.map(q => ({
        ...q,
        options: shuffleArray(q.options)
      }));
      setShuffledQuiz(shuffled);
    }
  }, [currentPhase]);


  const handleDragStart = (e, insurance) => {
    setDraggedItem(insurance);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, scenario) => {
    e.preventDefault();
    if (!draggedItem || assignments[scenario.id]) return;

    setAttempts(attempts + 1);

    const isCorrect = draggedItem.id === scenario.correctInsurance;

    setAssignments({
      ...assignments,
      [scenario.id]: {
        insuranceId: draggedItem.id,
        insuranceName: draggedItem.name,
        correct: isCorrect
      }
    });

    if (isCorrect) {
      setScore(score + 1);
    }

    setDraggedItem(null);

    // Check if all scenarios are completed
    const newAssignments = {...assignments, [scenario.id]: { insuranceId: draggedItem.id, correct: isCorrect }};
    if (Object.keys(newAssignments).length === scenarios.length) {
      setTimeout(() => {
        setGameState('completed');
      }, 1000);
    }
  };

  const resetGame = () => {
    setAssignments({});
    setScore(0);
    setAttempts(0);
    setGameState('playing');
    setDraggedItem(null);
  };

  const getAccuracy = () => {
    return attempts > 0 ? Math.round((score / attempts) * 100) : 0;
  };

  const handleAnswerSelect = (questionIndex, optionId) => {
    if (selectedAnswers[questionIndex]) return; // Already answered

    setSelectedAnswers({
      ...selectedAnswers,
      [questionIndex]: optionId
    });

    const question = quizQuestions[questionIndex];
    const selectedOption = question.options.find(opt => opt.id === optionId);

    if (selectedOption.correct) {
      setQuizScore(prev => prev + 1);
    }
  };

  const handleNextQuestion = async () => {
    if (quizIndex < quizQuestions.length - 1) {
      setQuizIndex(prev => prev + 1);
    } else {
      // Quiz finished - calculate and save score
      const finalScore = calculateQuizScore();
      await saveModuleScore(finalScore);
      setCurrentPhase('results');
    }
  };

  const handlePreviousQuestion = () => {
    if (quizIndex > 0) {
      setQuizIndex(prev => prev - 1);
    }
  };

  const calculateQuizScore = () => {
    let correctAnswers = 0;
    quizQuestions.forEach((question, index) => {
      const selectedOption = selectedAnswers[index];
      const correctOption = question.options.find(opt => opt.correct);
      if (selectedOption === correctOption.id) {
        correctAnswers++;
      }
    });
    setQuizScore(correctAnswers);
    return correctAnswers;
  };

  const saveModuleScore = async (finalScore) => {
    setIsSaving(true);
    try {
      // Convert score to percentage (0-100)
      const percentageScore = Math.round((finalScore / quizQuestions.length) * 100);

      // If student passed the threshold (80%), save it as 100 to mark as passed
      const scoreToSave = percentageScore >= 80 ? 100 : percentageScore;
      const result = await saveScore(MODULES.INSURANCE?.id || 'insurance', scoreToSave, 100);
      setSaveResult(result);
      await refreshProgress();
    } catch (error) {
      console.error('Failed to save score:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle reset module
  const handleResetModule = async () => {
    setIsResetting(true);
    try {
      await resetModule(MODULES.INSURANCE?.id || 'insurance');
      // Reset local state to start over
      setCurrentPhase('learning');
      setLessonStep(0);
      setGameState('playing');
      setAssignments({});
      setScore(0);
      setAttempts(0);
      setQuizIndex(0);
      setQuizScore(0);
      setSelectedAnswer(null);
      setSelectedAnswers({});
      setShowFeedback(false);
      setShuffledQuiz([]);
      setSaveResult(null);
    } catch (err) {
      console.error('Error resetting module:', err);
    } finally {
      setIsResetting(false);
    }
  };

  const isGameComplete = Object.keys(assignments).length === scenarios.length;

  // Start review mode
  const startReviewMode = () => {
    setIsReviewMode(true);
    setCurrentPhase('learning');
    setLessonStep(0);
  };

  // If module is already passed and not in review mode, show completion screen
  if (modulePassed && !isReviewMode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-purple-50 p-4 sm:p-6 flex items-center justify-center">
        <motion.div
          className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 max-w-md text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="text-6xl mb-4"
            animate={{ rotate: [0, -10, 10, -10, 0] }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            🛡️
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Module Completed!</h2>
          <p className="text-gray-600 mb-6">
            You've already passed the Insurance Protection module. Great job understanding how insurance protects you!
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-purple-50 p-4 sm:p-6">
      {/* Header */}
      <motion.div
        className="flex items-center justify-between mb-8 bg-white rounded-xl p-4 shadow-lg"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <button
          onClick={() => navigate('/game')}
          className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Roadmap
        </button>

        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">Insurance Protection</h1>
          <p className="text-sm text-gray-600">
            {currentPhase === 'learning' ? 'Learn About Insurance Types' :
             currentPhase === 'game' ? 'Match Insurance to Scenarios' :
             currentPhase === 'quiz' ? 'Final Quiz' : 'Results'}
          </p>
        </div>

        <div className="flex items-center gap-2 text-green-600">
          <Shield className="w-5 h-5" />
          <span className="font-semibold">90 XP</span>
        </div>
      </motion.div>

      {/* Learning Phase */}
      {currentPhase === 'learning' && (
        <motion.div
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {/* Progress */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Lesson {lessonStep + 1} of {lessons.length}</span>
              <span>{Math.round(((lessonStep + 1) / lessons.length) * 100)}% Complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <motion.div
                className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${((lessonStep + 1) / lessons.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Lesson Card */}
          <motion.div
            key={lessonStep}
            className={`${lessons[lessonStep].background} rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-lg mb-6`}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="text-center mb-6">
              <motion.div
                className="text-6xl mb-4"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {lessons[lessonStep].emoji}
              </motion.div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {lessons[lessonStep].title}
              </h2>
              <p className="text-sm text-gray-600 italic">
                With {lessons[lessonStep].character}
              </p>
            </div>

            <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 mb-6 shadow-md">
              <p className="text-gray-700 text-lg leading-relaxed">
                {lessons[lessonStep].content}
              </p>
            </div>

            <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-md">
              <h4 className="font-bold text-gray-800 mb-3">Key Points:</h4>
              <ul className="space-y-2">
                {lessons[lessonStep].keyPoints.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <button
              onClick={() => setLessonStep(prev => prev - 1)}
              disabled={lessonStep === 0}
              className={`px-6 py-3 rounded-xl font-medium transition ${
                lessonStep === 0
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-300 hover:bg-gray-400 text-gray-700'
              }`}
            >
              Previous
            </button>

            <div className="flex gap-2">
              {lessons.map((_, idx) => (
                <div
                  key={idx}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    idx === lessonStep ? 'bg-blue-500' :
                    idx < lessonStep ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={() => {
                if (lessonStep < lessons.length - 1) {
                  setLessonStep(prev => prev + 1);
                } else if (isReviewMode) {
                  navigate('/game');
                } else {
                  setCurrentPhase('game');
                }
              }}
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition"
            >
              {lessonStep === lessons.length - 1 ? (isReviewMode ? 'Finish Review' : 'Start Matching Game!') : 'Next'}
            </button>
          </div>
        </motion.div>
      )}

      {/* Game Phase */}
      {currentPhase === 'game' && gameState === 'playing' && (
        <div className="max-w-6xl mx-auto">
          {/* Score Panel */}
          <motion.div
            className="bg-white rounded-xl p-4 shadow-lg mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">{score}</div>
                <div className="text-sm text-gray-600">Correct Matches</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">{Object.keys(assignments).length}</div>
                <div className="text-sm text-gray-600">Scenarios Completed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">{getAccuracy()}%</div>
                <div className="text-sm text-gray-600">Accuracy</div>
              </div>
            </div>
          </motion.div>

          {/* Instructions */}
          <motion.div
            className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-4 mb-8 border border-blue-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="text-center">
              <h3 className="font-bold text-gray-800 mb-2">How to Play</h3>
              <p className="text-sm text-gray-600">
                Drag the insurance types to the scenarios where they would apply.
                Match all 10 scenarios to continue to the quiz!
              </p>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
            {/* Insurance Types */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Insurance Types</h3>
              <div className="space-y-4">
                {insuranceTypes.map((insurance) => (
                  <motion.div
                    key={insurance.id}
                    className={`p-4 rounded-lg border-2 cursor-move transition-all ${insurance.color} hover:shadow-md hover:scale-[1.02]`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, insurance)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center gap-3">
                      <Shield className="w-6 h-6 text-gray-600" />
                      <span className="font-semibold text-gray-800">{insurance.name}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Scenarios */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Scenarios</h3>
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {scenarios.map((scenario) => {
                  const assignment = assignments[scenario.id];
                  return (
                    <motion.div
                      key={scenario.id}
                      className={`p-4 rounded-lg border-2 border-dashed min-h-[80px] transition-all ${
                        assignment
                          ? assignment.correct
                            ? 'bg-green-50 border-green-400'
                            : 'bg-red-50 border-red-400'
                          : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
                      }`}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, scenario)}
                    >
                      <p className="text-gray-700 text-sm leading-relaxed mb-2">
                        {scenario.text}
                      </p>

                      {assignment && (
                        <motion.div
                          className="flex items-center justify-between"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                        >
                          <div className="flex items-center gap-2">
                            {assignment.correct ? (
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            ) : (
                              <XCircle className="w-5 h-5 text-red-500" />
                            )}
                            <span className={`text-sm font-medium ${
                              assignment.correct ? 'text-green-700' : 'text-red-700'
                            }`}>
                              {assignment.insuranceName}
                            </span>
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </div>

          {/* Progress and Continue Button */}
          <motion.div
            className="mt-8 bg-white rounded-xl p-4 shadow-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Progress</span>
              <span>{Object.keys(assignments).length}/{scenarios.length} scenarios</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
              <motion.div
                className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full"
                animate={{ width: `${(Object.keys(assignments).length / scenarios.length) * 100}%` }}
              />
            </div>
            {isGameComplete && (
              <button
                onClick={() => setCurrentPhase('quiz')}
                className="w-full px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition"
              >
                Continue to Final Quiz
              </button>
            )}
          </motion.div>
        </div>
      )}

      {/* Game Completed - Transition to Quiz */}
      {currentPhase === 'game' && gameState === 'completed' && (
        <motion.div
          className="max-w-2xl mx-auto text-center"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-lg">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Matching Game Complete!</h2>
            <p className="text-gray-600 mb-6">
              You matched {score} out of {scenarios.length} scenarios correctly.
              Now let's test your knowledge with a final quiz!
            </p>
            <button
              onClick={() => setCurrentPhase('quiz')}
              className="px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium text-lg transition"
            >
              Start Final Quiz
            </button>
          </div>
        </motion.div>
      )}

      {/* Quiz Phase - CreditScoreModule Style */}
      {currentPhase === 'quiz' && (
        <motion.div
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {/* Review Mode Banner */}
          {isReviewMode && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl text-blue-700">
              <div className="font-semibold mb-1">Review Mode</div>
              <div className="text-sm">You're reviewing correct answers. Options cannot be changed.</div>
            </div>
          )}

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between mb-2">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Progress</span>
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">{quizIndex + 1} / {quizQuestions.length}</span>
            </div>
            <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-blue-600 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${((quizIndex + 1) / quizQuestions.length) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          {/* Question Card - Case Study Style */}
          <motion.div
            key={quizIndex}
            className="bg-white rounded-xl sm:rounded-3xl shadow-xl border border-gray-100 overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="p-4 sm:p-8 lg:p-12">
              {/* Question Header */}
              <div className="flex justify-between items-end mb-6 sm:mb-10 border-b border-gray-100 pb-4 sm:pb-6">
                <div>
                  <span className="text-xs sm:text-sm font-bold text-blue-600 uppercase tracking-wider block mb-2">
                    Question {quizIndex + 1} of {quizQuestions.length}
                  </span>
                  <h2 className="text-lg sm:text-2xl lg:text-3xl font-bold text-slate-900 leading-tight">
                    {quizQuestions[quizIndex].question}
                  </h2>
                </div>
                <div className="hidden lg:block text-slate-200">
                  <Trophy size={48} />
                </div>
              </div>

              {/* Options Grid - Case Study Style */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                {quizQuestions[quizIndex].options.map((option, index) => {
                  const isSelected = selectedAnswers[quizIndex] === option.id;
                  const showAsCorrect = (isReviewMode && option.correct) || (selectedAnswers[quizIndex] && option.correct);
                  const showAsIncorrect = selectedAnswers[quizIndex] && isSelected && !option.correct;
                  const showCorrectness = selectedAnswers[quizIndex] && (isSelected || option.correct);

                  return (
                    <button
                      key={option.id}
                      onClick={() => !isReviewMode && !selectedAnswers[quizIndex] && handleAnswerSelect(quizIndex, option.id)}
                      disabled={!!selectedAnswers[quizIndex] || isReviewMode}
                      className={`p-4 sm:p-6 rounded-xl sm:rounded-2xl text-left border-2 transition-all flex items-start gap-3 sm:gap-4 ${
                        showCorrectness
                          ? option.correct
                            ? 'bg-green-50 border-green-500 text-green-900'
                            : isSelected
                              ? 'bg-red-50 border-red-500 text-red-900'
                              : 'bg-white border-slate-100 opacity-50'
                          : isSelected
                            ? 'bg-blue-50 border-blue-600 shadow-lg scale-[1.02]'
                            : 'bg-white border-slate-200 hover:border-blue-400 hover:shadow-md'
                      } ${(!!selectedAnswers[quizIndex] || isReviewMode) ? 'cursor-default' : 'cursor-pointer'}`}
                    >
                      <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                        showCorrectness && option.correct ? 'bg-green-500 text-white' :
                        showCorrectness && isSelected ? 'bg-red-500 text-white' :
                        isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {showAsCorrect ? (
                          <CheckCircle size={20} />
                        ) : showAsIncorrect ? (
                          <XCircle size={20} />
                        ) : (
                          option.id
                        )}
                      </div>
                      <span className="text-sm sm:text-lg font-medium leading-snug flex-1">{option.text}</span>
                      {showCorrectness && option.correct && <CheckCircle className="ml-auto text-green-600 shrink-0 w-5 h-5 sm:w-6 sm:h-6" />}
                      {showCorrectness && isSelected && !option.correct && <XCircle className="ml-auto text-red-600 shrink-0 w-5 h-5 sm:w-6 sm:h-6" />}
                    </button>
                  );
                })}
              </div>

              {/* Teaching Point - Dark Box (Case Study Style) */}
              <AnimatePresence>
                {selectedAnswers[quizIndex] && !isReviewMode && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="mt-6 sm:mt-8 bg-slate-900 text-white p-4 sm:p-8 rounded-xl sm:rounded-2xl flex flex-col md:flex-row items-center gap-4 sm:gap-8 shadow-2xl"
                  >
                    <div className="flex-1">
                      <h4 className="font-bold text-blue-400 uppercase tracking-wider text-xs sm:text-sm mb-2">Explanation</h4>
                      <p className="text-sm sm:text-lg leading-relaxed text-slate-200">
                        {quizQuestions[quizIndex].explanation}
                      </p>
                    </div>
                    <button
                      onClick={handleNextQuestion}
                      className="w-full md:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-white text-slate-900 rounded-lg sm:rounded-xl font-bold hover:bg-blue-50 transition-colors whitespace-nowrap text-sm sm:text-base"
                    >
                      {quizIndex === quizQuestions.length - 1 ? 'Finish Quiz' : 'Next Question'}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Review Mode - Show explanation inline */}
              {isReviewMode && (
                <div className="mt-6 p-4 sm:p-6 bg-green-50 border border-green-200 rounded-xl">
                  <h4 className="font-bold text-green-800 text-sm mb-2">Explanation</h4>
                  <p className="text-green-700 text-sm sm:text-base">{quizQuestions[quizIndex].explanation}</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-6">
            <button
              onClick={handlePreviousQuestion}
              disabled={quizIndex === 0}
              className={`px-6 py-3 rounded-xl font-medium transition ${
                quizIndex === 0
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-300 hover:bg-gray-400 text-gray-700'
              }`}
            >
              Previous
            </button>

            {isReviewMode ? (
              quizIndex < quizQuestions.length - 1 ? (
                <button
                  onClick={() => setQuizIndex(quizIndex + 1)}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition"
                >
                  Next Question
                </button>
              ) : (
                <button
                  onClick={() => navigate('/game')}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition"
                >
                  Finish Review
                </button>
              )
            ) : !selectedAnswers[quizIndex] ? (
              <div className="px-6 py-3 bg-gray-200 text-gray-400 rounded-xl font-medium cursor-not-allowed">
                Select an answer
              </div>
            ) : null}
          </div>
        </motion.div>
      )}

      {/* Results Phase - CreditScoreModule Style */}
      {currentPhase === 'results' && (
        <motion.div
          className="max-w-2xl mx-auto text-center"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Results Card */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <Trophy className="w-20 h-20 mx-auto text-yellow-500 mb-6" />
            </motion.div>

            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">Insurance Protection Complete! 🎉</h2>
            <p className="text-xl text-gray-600 mb-6">
              {quizScore === quizQuestions.length ? "Perfect! You're an insurance expert! 🏆" :
               quizScore >= Math.ceil(quizQuestions.length * 0.8) ? "Excellent! You have strong insurance knowledge! ⭐" :
               quizScore >= Math.ceil(quizQuestions.length * 0.6) ? "Good job! Keep learning about insurance! 👍" :
               "Keep studying insurance basics - you'll get there! 📚"}
            </p>

            {/* Final Stats */}
            <div className="flex justify-center mb-8">
              <div className="bg-green-50 rounded-lg p-6 text-center">
                <div className="text-3xl sm:text-4xl font-bold text-green-600">{quizScore}/{quizQuestions.length}</div>
                <div className="text-sm text-gray-600">Correct Answers</div>
              </div>
            </div>

            {/* Answer Review */}
            <div className="text-left mb-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Review Your Answers:</h3>
              {quizQuestions.map((question, index) => {
                const selectedOption = selectedAnswers[index];
                const correctOption = question.options.find(opt => opt.correct);
                const isCorrect = selectedOption === correctOption.id;

                return (
                  <div key={index} className="mb-4 p-4 rounded-lg border border-gray-200">
                    <div className="flex items-start gap-2 mb-2">
                      {isCorrect ? (
                        <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500 mt-1 flex-shrink-0" />
                      )}
                      <div>
                        <p className="font-medium text-gray-800">{question.question}</p>
                        <p className={`text-sm ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                          Your answer: {question.options.find(opt => opt.id === selectedOption)?.text}
                        </p>
                        {!isCorrect && (
                          <p className="text-sm text-green-600">
                            Correct answer: {correctOption.text}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pass/Fail Status Banner */}
            {saveResult && (
              <motion.div
                className={`mb-6 p-4 rounded-xl border-2 ${
                  saveResult.passed
                    ? 'bg-green-50 border-green-300'
                    : 'bg-orange-50 border-orange-300'
                }`}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center justify-center gap-3">
                  {saveResult.passed ? (
                    <>
                      <CheckCircle className="text-green-600" size={28} />
                      <div className="text-center">
                        <p className="font-bold text-green-800 text-lg">Module Passed! 🎉</p>
                        <p className="text-green-600 text-sm">
                          You scored {quizScore}/{quizQuestions.length} ({Math.round((quizScore / quizQuestions.length) * 100)}%) - Attempt #{saveResult.attemptNumber}
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <XCircle className="text-orange-600" size={28} />
                      <div className="text-center">
                        <p className="font-bold text-orange-800 text-lg">Keep Practicing!</p>
                        <p className="text-orange-600 text-sm">
                          You scored {quizScore}/{quizQuestions.length} ({Math.round((quizScore / quizQuestions.length) * 100)}%) - 80% required to pass - Attempt #{saveResult.attemptNumber}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </motion.div>
            )}

            {isSaving && (
              <div className="mb-6 flex items-center justify-center gap-2 text-blue-600">
                <Loader2 className="animate-spin" size={20} />
                <span>Saving your progress...</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 justify-center flex-wrap">
              <button
                onClick={() => navigate('/game')}
                className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition"
              >
                Back to Roadmap
              </button>

              {/* Show Reset & Retry button if not passed */}
              {saveResult && !saveResult.passed && (
                <button
                  onClick={handleResetModule}
                  disabled={isResetting}
                  className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-medium transition flex items-center gap-2 disabled:opacity-50"
                >
                  {isResetting ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <RefreshCw size={18} />
                  )}
                  Reset & Try Again
                </button>
              )}

              {/* Play Again (for practice, doesn't reset progress) */}
              <button
                onClick={() => {
                  setCurrentPhase('learning');
                  setLessonStep(0);
                  resetGame();
                  setQuizIndex(0);
                  setQuizScore(0);
                  setSelectedAnswer(null);
                  setSelectedAnswers({});
                  setShowFeedback(false);
                  setShuffledQuiz([]);
                  setSaveResult(null);
                }}
                className="px-6 py-3 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-xl font-medium transition"
              >
                Play Again
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default InsuranceModule;
