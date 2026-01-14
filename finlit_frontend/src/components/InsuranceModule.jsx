import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Shield, Trophy, RotateCcw, CheckCircle, XCircle, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useModuleScore, MODULES } from '../hooks/useModuleScore';

const InsuranceModule = () => {
  const navigate = useNavigate();
  const { saveScore, isModulePassed, refreshProgress } = useModuleScore();

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
  const [showFeedback, setShowFeedback] = useState(false);
  const [shuffledQuiz, setShuffledQuiz] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

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

  // Final Quiz Questions
  const quizQuestions = [
    {
      question: "What is the purpose of a deductible in insurance?",
      options: [
        { text: "The amount the insurance company pays you", correct: false },
        { text: "The amount you pay before insurance coverage kicks in", correct: true },
        { text: "The monthly payment for insurance", correct: false },
        { text: "A bonus for not filing claims", correct: false }
      ],
      explanation: "A deductible is the amount you must pay out-of-pocket before your insurance starts covering costs."
    },
    {
      question: "Which type of insurance is typically required by law for drivers?",
      options: [
        { text: "Life Insurance", correct: false },
        { text: "Health Insurance", correct: false },
        { text: "Auto Insurance", correct: true },
        { text: "Travel Insurance", correct: false }
      ],
      explanation: "Auto insurance is required by law in most states to protect other drivers and pedestrians."
    },
    {
      question: "What does 'liability coverage' in auto insurance protect against?",
      options: [
        { text: "Damage to your own car", correct: false },
        { text: "Damage or injuries you cause to others", correct: true },
        { text: "Theft of your vehicle", correct: false },
        { text: "Weather damage to your car", correct: false }
      ],
      explanation: "Liability coverage pays for damage or injuries you cause to other people or their property."
    },
    {
      question: "Which insurance would help your family financially if you passed away?",
      options: [
        { text: "Health Insurance", correct: false },
        { text: "Home Insurance", correct: false },
        { text: "Life Insurance", correct: true },
        { text: "Auto Insurance", correct: false }
      ],
      explanation: "Life insurance provides a death benefit to your beneficiaries to replace lost income."
    },
    {
      question: "What is NOT typically covered by home insurance?",
      options: [
        { text: "Fire damage to your house", correct: false },
        { text: "Theft of belongings", correct: false },
        { text: "Flood damage", correct: true },
        { text: "Wind damage from storms", correct: false }
      ],
      explanation: "Flood damage typically requires separate flood insurance and is not covered by standard home insurance."
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

  const currentQuizQuestion = shuffledQuiz.length > 0 ? shuffledQuiz[quizIndex] : quizQuestions[quizIndex];

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

  const handleQuizAnswer = (optionIndex) => {
    if (showFeedback) return;

    const option = currentQuizQuestion.options[optionIndex];
    setSelectedAnswer(optionIndex);
    setShowFeedback(true);

    if (option.correct) {
      setQuizScore(prev => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (quizIndex < quizQuestions.length - 1) {
      setQuizIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
    } else {
      // Quiz finished - save score
      handleSaveScore();
    }
  };

  const handleSaveScore = async () => {
    setIsSaving(true);
    try {
      // Calculate combined score: matching game + quiz
      const gameScore = Math.round((score / scenarios.length) * 50); // 50% from game
      const quizScorePercent = Math.round((quizScore / quizQuestions.length) * 50); // 50% from quiz
      const totalScore = gameScore + quizScorePercent;

      await saveScore(MODULES.INSURANCE?.id || 'insurance', totalScore, 100);
      await refreshProgress();
    } catch (error) {
      console.error('Failed to save score:', error);
    } finally {
      setIsSaving(false);
      setCurrentPhase('results');
    }
  };

  const isGameComplete = Object.keys(assignments).length === scenarios.length;
  const totalQuestions = scenarios.length + quizQuestions.length;
  const totalCorrect = score + quizScore;
  const finalPercentage = Math.round((totalCorrect / totalQuestions) * 100);

  // If module is already passed, show completion screen
  if (modulePassed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-purple-50 p-6 flex items-center justify-center">
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
          <motion.button
            onClick={() => navigate('/game')}
            className="w-full px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold transition"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Back to Learning Path
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-purple-50 p-6">
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
            className={`${lessons[lessonStep].background} rounded-2xl p-8 shadow-lg mb-6`}
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

            <div className="bg-white rounded-xl p-6 mb-6 shadow-md">
              <p className="text-gray-700 text-lg leading-relaxed">
                {lessons[lessonStep].content}
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
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
                } else {
                  setCurrentPhase('game');
                }
              }}
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition"
            >
              {lessonStep === lessons.length - 1 ? 'Start Matching Game!' : 'Next'}
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
            <div className="grid grid-cols-3 gap-4 text-center">
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
          <div className="bg-white rounded-2xl p-8 shadow-lg">
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

      {/* Quiz Phase */}
      {currentPhase === 'quiz' && (
        <motion.div
          className="max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {/* Quiz Progress */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Question {quizIndex + 1} of {quizQuestions.length}</span>
              <span>Score: {quizScore}/{quizIndex + (showFeedback ? 1 : 0)}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <motion.div
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full"
                animate={{ width: `${((quizIndex + 1) / quizQuestions.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Quiz Card */}
          <motion.div
            key={quizIndex}
            className="bg-white rounded-2xl p-8 shadow-lg"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h3 className="text-xl font-bold text-gray-800 mb-6">
              {currentQuizQuestion?.question}
            </h3>

            <div className="space-y-3 mb-6">
              {currentQuizQuestion?.options.map((option, idx) => (
                <motion.button
                  key={idx}
                  onClick={() => handleQuizAnswer(idx)}
                  disabled={showFeedback}
                  className={`w-full p-4 rounded-xl text-left transition-all border-2 ${
                    showFeedback
                      ? option.correct
                        ? 'bg-green-100 border-green-500 text-green-800'
                        : selectedAnswer === idx
                          ? 'bg-red-100 border-red-500 text-red-800'
                          : 'bg-gray-100 border-gray-200 text-gray-600'
                      : selectedAnswer === idx
                        ? 'bg-blue-100 border-blue-500 text-blue-800'
                        : 'bg-gray-100 border-gray-200 hover:bg-gray-200 text-gray-800'
                  }`}
                  whileHover={!showFeedback ? { scale: 1.02 } : {}}
                  whileTap={!showFeedback ? { scale: 0.98 } : {}}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      showFeedback
                        ? option.correct
                          ? 'bg-green-500 text-white'
                          : selectedAnswer === idx
                            ? 'bg-red-500 text-white'
                            : 'bg-gray-300 text-gray-600'
                        : selectedAnswer === idx
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-300 text-gray-600'
                    }`}>
                      {showFeedback && option.correct ? '✓' :
                       showFeedback && selectedAnswer === idx && !option.correct ? '✗' :
                       String.fromCharCode(65 + idx)}
                    </div>
                    <span className="font-medium">{option.text}</span>
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Feedback */}
            {showFeedback && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-xl mb-6 ${
                  currentQuizQuestion?.options[selectedAnswer]?.correct
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-orange-50 border border-orange-200'
                }`}
              >
                <p className={`font-semibold mb-1 ${
                  currentQuizQuestion?.options[selectedAnswer]?.correct
                    ? 'text-green-700'
                    : 'text-orange-700'
                }`}>
                  {currentQuizQuestion?.options[selectedAnswer]?.correct ? '✅ Correct!' : '❌ Not quite right'}
                </p>
                <p className="text-gray-700 text-sm">
                  {currentQuizQuestion?.explanation}
                </p>
              </motion.div>
            )}

            {/* Next Button */}
            {showFeedback && (
              <button
                onClick={handleNextQuestion}
                className="w-full px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition"
              >
                {quizIndex < quizQuestions.length - 1 ? 'Next Question' : 'See Results'}
              </button>
            )}
          </motion.div>
        </motion.div>
      )}

      {/* Results Phase */}
      {currentPhase === 'results' && (
        <motion.div
          className="max-w-2xl mx-auto text-center"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
            >
              <Trophy className="w-20 h-20 mx-auto text-yellow-500 mb-6" />
            </motion.div>

            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              {finalPercentage === 100 ? 'Perfect Score! 🎉' :
               finalPercentage >= 80 ? 'Great Job! 🌟' :
               finalPercentage >= 60 ? 'Good Effort! 👍' : 'Keep Learning! 📚'}
            </h2>

            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-600">{score}/{scenarios.length}</div>
                <div className="text-sm text-gray-600">Matching Game</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-purple-600">{quizScore}/{quizQuestions.length}</div>
                <div className="text-sm text-gray-600">Quiz Score</div>
              </div>
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-600">{finalPercentage}%</div>
                <div className="text-sm text-gray-600">Overall</div>
              </div>
            </div>

            <p className="text-gray-600 mb-6">
              {finalPercentage === 100
                ? 'You\'ve mastered insurance protection! Module complete!'
                : 'You need 100% to pass this module. Keep practicing!'}
            </p>

            {isSaving && (
              <p className="text-gray-500 mb-4">Saving your score...</p>
            )}

            <div className="flex gap-4 justify-center">
              <button
                onClick={() => navigate('/game')}
                className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition"
              >
                Back to Roadmap
              </button>
              {finalPercentage < 100 && (
                <button
                  onClick={() => {
                    setCurrentPhase('learning');
                    setLessonStep(0);
                    resetGame();
                    setQuizIndex(0);
                    setQuizScore(0);
                    setSelectedAnswer(null);
                    setShowFeedback(false);
                    setShuffledQuiz([]);
                  }}
                  className="px-6 py-3 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-xl font-medium transition"
                >
                  Try Again
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default InsuranceModule;
