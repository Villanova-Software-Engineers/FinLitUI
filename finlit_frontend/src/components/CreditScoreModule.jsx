import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { ArrowLeft, Star, Trophy, CheckCircle, XCircle, Heart, Zap, RefreshCw, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useModuleScore, MODULES } from '../hooks/useModuleScore';

const CreditScoreModule = () => {
  const navigate = useNavigate();
  const { saveScore, getModuleScore, isModulePassed, resetModule, isLoading: progressLoading } = useModuleScore();

  // Check if module is already passed
  const modulePassed = isModulePassed(MODULES.CREDIT_SCORE?.id);

  // Review mode - allows viewing content without answering
  const [isReviewMode, setIsReviewMode] = useState(false);

  const [currentStep, setCurrentStep] = useState('learning'); // 'learning', 'game', 'quiz', 'results'
  const [learningStep, setLearningStep] = useState(0);
  const [gameStep, setGameStep] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [characterDialogue, setCharacterDialogue] = useState("");
  const [lives, setLives] = useState(3);
  const [streak, setStreak] = useState(0);
  const [totalXP, setTotalXP] = useState(0);
  const [achievements, setAchievements] = useState([]);

  // Module score saving state
  const [isSaving, setIsSaving] = useState(false);
  const [saveResult, setSaveResult] = useState(null); // { passed, attemptNumber, needsRetake }
  const [isResetting, setIsResetting] = useState(false);

  // Game states
  const [gameScore, setGameScore] = useState(0);
  const [currentGameType, setCurrentGameType] = useState('');
  const [gameCompleted, setGameCompleted] = useState(false);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [selectedTerm, setSelectedTerm] = useState(null);
  const [selectedDefinition, setSelectedDefinition] = useState(null);
  const [sliderValue, setSliderValue] = useState(0);
  const [timelineOrder, setTimelineOrder] = useState([]);
  const [shuffledDefinitions, setShuffledDefinitions] = useState([]);
  const [showWrongAnswer, setShowWrongAnswer] = useState(false);

  // Fisher-Yates shuffle function
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Learning content with character-driven story
  const learningContent = [
    {
      id: 1,
      character: "💳 Credit Charlie",
      characterImage: "🤓",
      title: "Welcome to Credit Score Land!",
      dialogue: "Hi there! I'm Credit Charlie, and I'm here to help you understand credit scores. Think of me as your friendly guide through the world of credit!",
      content: "A credit score is like a report card for how well you handle borrowed money. Just like in school, higher scores are better!",
      visual: "🎯",
      analogy: "Imagine credit score like a trust meter. The higher the score, the more banks trust you with their money!",
      background: "bg-gradient-to-br from-blue-100 to-indigo-100",
      emotion: "😊"
    },
    {
      id: 2,
      character: "📊 Score Sally",
      characterImage: "👩‍🍳",
      title: "What Makes Up Your Credit Score?",
      dialogue: "Let me show you the secret recipe for credit scores! There are 5 main ingredients, and some are more important than others.",
      content: "Payment History (35%) - Do you pay bills on time?\nCredit Utilization (30%) - How much credit do you use?\nCredit History Length (15%) - How long have you had credit?\nCredit Mix (10%) - Different types of credit accounts\nNew Credit (10%) - Recent credit applications",
      visual: "🥧",
      analogy: "Think of it like baking a cake - payment history and utilization are your main ingredients (flour and sugar), while the rest are like spices that add flavor!",
      background: "bg-gradient-to-br from-green-100 to-emerald-100",
      emotion: "🤩"
    },
    {
      id: 3,
      character: "⏰ Time Tom",
      characterImage: "⏰",
      title: "The Power of Payment History",
      dialogue: "I'm Time Tom, and timing is everything! Paying your bills on time is the most important thing you can do for your credit score.",
      content: "Payment history makes up 35% of your credit score. Even one late payment can hurt your score for months or years!",
      visual: "📅",
      analogy: "It's like being punctual to work - your boss notices when you're always on time, and when you're late!",
      background: "bg-gradient-to-br from-purple-100 to-pink-100",
      emotion: "⚡"
    },
    {
      id: 4,
      character: "💰 Utilization Una",
      characterImage: "🧙‍♀️",
      title: "Credit Utilization Magic",
      dialogue: "Hi! I'm Utilization Una. I help people understand how much of their credit limit they should use. The magic number is 30%!",
      content: "If you have a $1,000 credit limit, try to keep your balance under $300. Lower is even better - under 10% is ideal!",
      visual: "📏",
      analogy: "Think of your credit limit like a gas tank. You don't want to always drive with a full tank - keep some room to breathe!",
      background: "bg-gradient-to-br from-yellow-100 to-orange-100",
      emotion: "✨"
    },
    {
      id: 5,
      character: "🚀 Boost Betty",
      characterImage: "🚀",
      title: "How to Improve Your Score",
      dialogue: "I'm Boost Betty, and I know all the tricks to boost your credit score! Want to know the secrets?",
      content: "1. Always pay on time ⏰\n2. Keep balances low 💳\n3. Don't close old cards 📅\n4. Check your credit report 🔍\n5. Be patient - good credit takes time! 🌱",
      visual: "📈",
      analogy: "Building credit is like growing a garden - you need to water it regularly (make payments), give it good conditions (low balances), and be patient for it to flourish!",
      background: "bg-gradient-to-br from-red-100 to-pink-100",
      emotion: "💪"
    }
  ];

  // Interactive mini-games
  const miniGames = [
    {
      id: 1,
      type: "matching",
      title: "Credit Score Factor Match",
      character: "💳 Credit Charlie",
      instruction: "Match each credit factor with its percentage impact!",
      pairs: [
        { term: "Payment History", definition: "35% - Most important factor", emoji: "⏰", matched: false },
        { term: "Credit Utilization", definition: "30% - Amount of credit used", emoji: "📊", matched: false },
        { term: "Credit History Length", definition: "15% - How long you've had credit", emoji: "📅", matched: false },
        { term: "Credit Mix", definition: "10% - Different types of accounts", emoji: "🔀", matched: false },
        { term: "New Credit", definition: "10% - Recent credit inquiries", emoji: "🆕", matched: false }
      ]
    },
    {
      id: 2,
      type: "slider",
      title: "Credit Utilization Challenge",
      character: "💰 Utilization Una", 
      instruction: "Help customers find the best credit utilization rate!",
      scenarios: [
        { name: "Sarah", creditLimit: 1000, currentBalance: 950, optimal: 300, emoji: "👩" },
        { name: "Mike", creditLimit: 5000, currentBalance: 2500, optimal: 1500, emoji: "👨" },
        { name: "Lisa", creditLimit: 2000, currentBalance: 1800, optimal: 600, emoji: "👩‍🦱" }
      ],
      selectedScenario: 0,
      userAnswer: 0
    },
    {
      id: 3,
      type: "timeline",
      title: "Credit Building Journey",
      character: "🌱 Growth Guru",
      instruction: "Put these credit-building steps in the right order!",
      steps: [
        { id: 1, text: "Get your first secured credit card", position: 1, emoji: "💳" },
        { id: 2, text: "Make small purchases monthly", position: 2, emoji: "🛒" },
        { id: 3, text: "Pay off balance in full each month", position: 3, emoji: "💸" },
        { id: 4, text: "Keep utilization under 30%", position: 4, emoji: "📊" },
        { id: 5, text: "Check credit report regularly", position: 5, emoji: "📋" }
      ],
      currentOrder: []
    }
  ];

  const questions = [
    {
      id: 1,
      question: "What is the most important factor affecting your credit score?",
      options: [
        { id: 'A', text: "Length of credit history", correct: false },
        { id: 'B', text: "Payment history", correct: true },
        { id: 'C', text: "Types of credit", correct: false },
        { id: 'D', text: "New credit inquiries", correct: false }
      ],
      explanation: "Payment history makes up 35% of your credit score and is the most important factor. Making payments on time consistently is crucial for maintaining good credit.",
      xp: 25
    },
    {
      id: 2,
      question: "What percentage of your available credit should you ideally use?",
      options: [
        { id: 'A', text: "Less than 30%", correct: true },
        { id: 'B', text: "50-60%", correct: false },
        { id: 'C', text: "70-80%", correct: false },
        { id: 'D', text: "90-100%", correct: false }
      ],
      explanation: "Credit utilization should ideally be below 30% of your available credit limit. Lower utilization ratios (under 10%) are even better for your credit score.",
      xp: 25
    },
    {
      id: 3,
      question: "How long do most negative items stay on your credit report?",
      options: [
        { id: 'A', text: "2 years", correct: false },
        { id: 'B', text: "5 years", correct: false },
        { id: 'C', text: "7 years", correct: true },
        { id: 'D', text: "10 years", correct: false }
      ],
      explanation: "Most negative items like late payments, collections, and charge-offs stay on your credit report for 7 years. Bankruptcies can stay for up to 10 years.",
      xp: 25
    },
    {
      id: 4,
      question: "Which action would HELP your credit score the most?",
      options: [
        { id: 'A', text: "Closing old credit cards", correct: false },
        { id: 'B', text: "Opening many new accounts quickly", correct: false },
        { id: 'C', text: "Paying off credit card balances", correct: true },
        { id: 'D', text: "Applying for multiple loans", correct: false }
      ],
      explanation: "Paying off credit card balances reduces your credit utilization ratio, which is the second most important factor affecting your credit score (30% of the calculation).",
      xp: 25
    },
    {
      id: 5,
      question: "What is considered an excellent credit score range?",
      options: [
        { id: 'A', text: "580-669", correct: false },
        { id: 'B', text: "670-739", correct: false },
        { id: 'C', text: "740-799", correct: false },
        { id: 'D', text: "800-850", correct: true }
      ],
      explanation: "A credit score of 800-850 is considered excellent. This range typically qualifies you for the best interest rates and credit terms available.",
      xp: 25
    },
    {
      id: 6,
      question: "What happens to your credit score when you check it yourself?",
      options: [
        { id: 'A', text: "It decreases by 5-10 points", correct: false },
        { id: 'B', text: "It stays the same (soft inquiry)", correct: true },
        { id: 'C', text: "It increases slightly", correct: false },
        { id: 'D', text: "It gets frozen for 30 days", correct: false }
      ],
      explanation: "Checking your own credit score is a 'soft inquiry' and does NOT affect your credit score. You should regularly check your credit report to monitor for errors or fraud.",
      xp: 25
    },
    {
      id: 7,
      question: "Which type of credit inquiry can temporarily lower your score?",
      options: [
        { id: 'A', text: "Checking your own credit score", correct: false },
        { id: 'B', text: "A lender checking your credit for a loan application", correct: true },
        { id: 'C', text: "Your employer checking your credit", correct: false },
        { id: 'D', text: "A pre-approved credit card offer", correct: false }
      ],
      explanation: "A 'hard inquiry' occurs when a lender checks your credit for a loan or credit application. This can temporarily lower your score by a few points.",
      xp: 25
    },
    {
      id: 8,
      question: "What is the BEST strategy for building credit history?",
      options: [
        { id: 'A', text: "Open many credit cards at once", correct: false },
        { id: 'B', text: "Max out your credit cards and pay minimum", correct: false },
        { id: 'C', text: "Use credit responsibly and pay on time consistently", correct: true },
        { id: 'D', text: "Never use credit cards at all", correct: false }
      ],
      explanation: "The best way to build credit is to use credit responsibly - make small purchases, pay your balance in full each month, and always pay on time.",
      xp: 25
    },
    {
      id: 9,
      question: "Why is it generally bad to close old credit card accounts?",
      options: [
        { id: 'A', text: "It reduces your available credit and shortens credit history", correct: true },
        { id: 'B', text: "It costs money to close accounts", correct: false },
        { id: 'C', text: "Banks charge a closing fee", correct: false },
        { id: 'D', text: "It's illegal to close credit accounts", correct: false }
      ],
      explanation: "Closing old credit accounts reduces your total available credit (hurting utilization ratio) and can shorten your credit history length - both factors that affect your score.",
      xp: 25
    },
    {
      id: 10,
      question: "If you have a $5,000 credit limit, what's the maximum balance you should carry to maintain good credit health?",
      options: [
        { id: 'A', text: "$5,000", correct: false },
        { id: 'B', text: "$3,500", correct: false },
        { id: 'C', text: "$1,500", correct: true },
        { id: 'D', text: "$4,000", correct: false }
      ],
      explanation: "To maintain good credit health, keep your balance below 30% of your credit limit. 30% of $5,000 = $1,500. Even lower (under 10%) is better!",
      xp: 25
    }
  ];

  const handleAnswerSelect = (questionIndex, optionId) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionIndex]: optionId
    });
    
    const question = questions[questionIndex];
    const selectedOption = question.options.find(opt => opt.id === optionId);
    
    if (selectedOption.correct) {
      setStreak(streak + 1);
      setTotalXP(totalXP + question.xp + (streak * 5)); // Bonus XP for streaks
    } else {
      setLives(lives - 1);
      setStreak(0);
    }
  };

  const handleNext = async () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setShowExplanation(false);
    } else {
      const finalScore = calculateScore();
      setShowResults(true);

      // Final achievements
      if (finalScore === questions.length) {
        setAchievements([...achievements, { id: 'perfect', name: 'Credit Master!', desc: 'Perfect credit knowledge', emoji: '🏆' }]);
      }

      // Save the score to Firestore
      await saveModuleScore(finalScore);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setShowExplanation(false);
    }
  };

  const calculateScore = () => {
    let correctAnswers = 0;
    questions.forEach((question, index) => {
      const selectedOption = selectedAnswers[index];
      const correctOption = question.options.find(opt => opt.correct);
      if (selectedOption === correctOption.id) {
        correctAnswers++;
      }
    });
    setScore(correctAnswers);
    return correctAnswers;
  };

  // Save the module score when quiz is completed
  const saveModuleScore = async (finalScore) => {
    setIsSaving(true);
    try {
      // Convert score to percentage (0-100)
      const percentageScore = Math.round((finalScore / questions.length) * 100);

      // Firebase requires score === maxScore to mark as passed
      // If student passed the threshold (80%), save it as 100 to mark as passed
      const scoreToSave = percentageScore >= 80 ? 100 : percentageScore;
      const result = await saveScore('credit-score', scoreToSave, 100);
      setSaveResult(result);
    } catch (err) {
      console.error('Error saving score:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle reset module
  const handleResetModule = async () => {
    setIsResetting(true);
    try {
      await resetModule('credit-score');
      // Reset local state to start over
      setCurrentStep('learning');
      setLearningStep(0);
      setGameStep(0);
      setCurrentQuestion(0);
      setSelectedAnswers({});
      setShowResults(false);
      setShowExplanation(false);
      setScore(0);
      setLives(3);
      setStreak(0);
      setTotalXP(0);
      setAchievements([]);
      setGameScore(0);
      setCurrentGameType('');
      setGameCompleted(false);
      setMatchedPairs([]);
      setSelectedTerm(null);
      setSelectedDefinition(null);
      setSaveResult(null);
    } catch (err) {
      console.error('Error resetting module:', err);
    } finally {
      setIsResetting(false);
    }
  };

  const nextLearningStep = () => {
    if (learningStep < learningContent.length - 1) {
      setLearningStep(learningStep + 1);
    } else {
      setCurrentStep('game');
    }
  };

  const nextGameStep = () => {
    if (gameStep < miniGames.length - 1) {
      setGameStep(gameStep + 1);
      setGameCompleted(false);
      setCurrentGameType('');
      resetGameState();
    } else {
      setCurrentStep('quiz');
    }
  };

  const resetGameState = () => {
    setMatchedPairs([]);
    setSelectedTerm(null);
    setSelectedDefinition(null);
    setSliderValue(miniGames[gameStep + 1]?.scenarios?.[0]?.currentBalance || 0);
    setTimelineOrder(miniGames[gameStep + 1]?.steps ? [...miniGames[gameStep + 1].steps] : []);
    setShowWrongAnswer(false);
  };

  const handleTermClick = (termIndex) => {
    if (gameCompleted) return;

    if (selectedTerm === termIndex) {
      setSelectedTerm(null);
    } else {
      setSelectedTerm(termIndex);
    }
  };

  const handleDefinitionClick = (defIndex) => {
    if (gameCompleted) return;

    if (selectedDefinition === defIndex) {
      setSelectedDefinition(null);
    } else {
      setSelectedDefinition(defIndex);
    }
  };

  // Submit handler for matching game
  const handleMatchingSubmit = () => {
    // Check if term and definition are both selected and match
    if (selectedTerm !== null && selectedDefinition !== null) {
      if (selectedTerm === selectedDefinition) {
        // Correct match!
        setMatchedPairs([...matchedPairs, selectedTerm]);
        setSelectedTerm(null);
        setSelectedDefinition(null);
        setShowWrongAnswer(false);

        // Check if all pairs matched
        if (matchedPairs.length + 1 >= miniGames[gameStep].pairs.length) {
          setGameCompleted(true);
          setTotalXP(totalXP + 50);
        }
      } else {
        // Wrong match
        setShowWrongAnswer(true);
        setTimeout(() => setShowWrongAnswer(false), 3000);
      }
    } else {
      // Need to select both
      setShowWrongAnswer(true);
      setTimeout(() => setShowWrongAnswer(false), 3000);
    }
  };

  const handleSliderChange = (value) => {
    setSliderValue(value);
  };

  // Submit handler for slider/utilization game
  const handleSliderSubmit = () => {
    const scenario = miniGames[gameStep].scenarios[0];
    const utilizationRate = (sliderValue / scenario.creditLimit) * 100;

    if (utilizationRate <= 30) {
      setShowWrongAnswer(false);
      setGameCompleted(true);
      setTotalXP(totalXP + 50);
    } else {
      setShowWrongAnswer(true);
      setTimeout(() => setShowWrongAnswer(false), 3000);
    }
  };

  // Submit handler for timeline game
  const handleTimelineSubmit = () => {
    // Check if steps are in correct order by comparing positions
    const isCorrect = timelineOrder.every((step, index) => step.position === index + 1);
    if (isCorrect) {
      setShowWrongAnswer(false);
      setGameCompleted(true);
      setTotalXP(totalXP + 50);
    } else {
      setShowWrongAnswer(true);
      setTimeout(() => setShowWrongAnswer(false), 3000);
    }
  };

  const prevGameStep = () => {
    if (gameStep > 0) {
      setGameStep(gameStep - 1);
      setGameCompleted(false);
      setCurrentGameType('');
      resetGameState();
    } else {
      // Go back to learning phase from first game
      setCurrentStep('learning');
      setLearningStep(learningContent.length - 1);
    }
  };

  // Initialize game state when component mounts or game changes
  React.useEffect(() => {
    if (currentStep === 'game') {
      setSliderValue(miniGames[gameStep]?.scenarios?.[0]?.currentBalance || 0);

      // For timeline game, shuffle the steps so it's not already in correct order
      if (miniGames[gameStep]?.type === 'timeline') {
        const steps = [...miniGames[gameStep].steps];
        let shuffled = shuffleArray(steps);
        // Make sure the shuffled array is not already in correct order
        while (shuffled.every((step, idx) => step.position === idx + 1)) {
          shuffled = shuffleArray(steps);
        }
        setTimelineOrder(shuffled);
      }

      // For matching game, shuffle the definitions order
      if (miniGames[gameStep]?.type === 'matching') {
        const indices = miniGames[gameStep].pairs.map((_, index) => index);
        let shuffled = shuffleArray(indices);
        // Make sure the shuffled array is not already in correct order
        while (shuffled.every((val, idx) => val === idx)) {
          shuffled = shuffleArray(indices);
        }
        setShuffledDefinitions(shuffled);
      }
    }
  }, [gameStep, currentStep]);

  const prevLearningStep = () => {
    if (learningStep > 0) {
      setLearningStep(learningStep - 1);
    }
  };

  const getScoreMessage = () => {
    const percentage = (score / questions.length) * 100;
    if (percentage === 100) return "Perfect! You're a credit score expert! 🏆";
    if (percentage >= 80) return "Excellent! You have strong credit knowledge! ⭐";
    if (percentage >= 60) return "Good job! Keep learning about credit! 👍";
    return "Keep studying credit basics - you'll get there! 📚";
  };

  const getScoreColor = () => {
    const percentage = (score / questions.length) * 100;
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 60) return "text-blue-600";
    return "text-orange-600";
  };

  // Start review mode - pre-populate correct answers for display
  const startReviewMode = () => {
    // Pre-select correct answers for each question
    const correctAnswers = {};
    questions.forEach((question, index) => {
      const correctOption = question.options.find(opt => opt.correct);
      if (correctOption) {
        correctAnswers[index] = correctOption.id;
      }
    });
    setSelectedAnswers(correctAnswers);
    setIsReviewMode(true);
    setCurrentStep('learning');
  };

  // If module is already passed and not in review mode, show completion screen
  if (modulePassed && !isReviewMode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 p-6 flex items-center justify-center">
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
            You've already passed the Credit Score module. Great job understanding how credit scores work!
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 p-6">
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
          <h1 className="text-2xl font-bold text-gray-800">Credit Score Mastery</h1>
          <p className="text-sm text-gray-600">Multiple Choice Quiz</p>
        </div>

        <div className="w-32">
          {/* Placeholder for layout balance */}
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
              <div key={achievement.id} className="bg-yellow-100 border border-yellow-300 rounded-lg p-4 shadow-lg">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{achievement.emoji}</span>
                  <div>
                    <div className="font-bold text-yellow-800">{achievement.name}</div>
                    <div className="text-sm text-yellow-600">{achievement.desc}</div>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {currentStep === 'learning' ? (
        /* Learning Phase */
        <motion.div
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {/* Learning Progress */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-blue-600 mb-2">
              <span>Learning Step {learningStep + 1} of {learningContent.length}</span>
              <span>{Math.round(((learningStep + 1) / learningContent.length) * 100)}% Complete</span>
            </div>
            <div className="w-full bg-blue-100 rounded-full h-3">
              <motion.div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${((learningStep + 1) / learningContent.length) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          {/* Character Learning Card */}
          <motion.div
            key={learningStep}
            className={`${learningContent[learningStep].background} rounded-2xl p-8 shadow-lg mb-6 border-2 border-white`}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center mb-6">
              <motion.div 
                className="text-6xl mb-4"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {learningContent[learningStep].visual}
              </motion.div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {learningContent[learningStep].title}
              </h2>
              <div className="text-lg font-semibold text-blue-600 mb-4">
                {learningContent[learningStep].character}
              </div>
            </div>

            {/* Character Introduction */}
            <div className="bg-white/90 backdrop-blur-sm rounded-lg sm:rounded-xl p-4 sm:p-6 mb-6 shadow-lg border-l-4 border-blue-500">
              <div className="flex items-start gap-4">
                <motion.div 
                  className="text-5xl cursor-pointer"
                  animate={{ 
                    y: [0, -10, 0],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                  whileHover={{ 
                    scale: 1.2,
                    rotate: 15,
                    transition: { duration: 0.2 }
                  }}
                  whileTap={{ scale: 0.9 }}
                >
                  {learningContent[learningStep].characterImage}
                </motion.div>
                <div className="flex-1">
                  <div className="flex items-center mb-3">
                    <span className="text-2xl mr-2">{learningContent[learningStep].emotion}</span>
                    <div className="font-bold text-xl text-gray-800">
                      {learningContent[learningStep].character}
                    </div>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4 mb-4 border-l-4 border-blue-400 relative">
                    <motion.div
                      className="absolute -left-2 top-4 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-blue-50"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.5 }}
                    />
                    <motion.p 
                      className="text-gray-700 italic text-lg leading-relaxed"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.7, delay: 0.3 }}
                    >
                      💬 "{learningContent[learningStep].dialogue}"
                    </motion.p>
                    <motion.span
                      className="inline-block ml-2"
                      animate={{ 
                        opacity: [1, 0.3, 1]
                      }}
                      transition={{ 
                        duration: 1.5, 
                        repeat: Infinity,
                        delay: 1
                      }}
                    >
                      💬
                    </motion.span>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 mb-6 shadow-md">
              <h3 className="text-lg font-bold text-gray-800 mb-3">Key Concepts:</h3>
              <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                {learningContent[learningStep].content}
              </div>
            </div>

            {/* Analogy Box */}
            <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-yellow-300">
              <h4 className="text-lg font-bold text-orange-800 mb-2">💡 Think of it this way:</h4>
              <p className="text-orange-700 leading-relaxed">
                {learningContent[learningStep].analogy}
              </p>
            </div>
          </motion.div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <button
              onClick={prevLearningStep}
              disabled={learningStep === 0}
              className={`px-6 py-3 rounded-xl font-medium transition ${
                learningStep === 0
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-300 hover:bg-gray-400 text-gray-700'
              }`}
            >
              ← Previous
            </button>

            <div className="flex gap-2">
              {learningContent.map((_, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full ${
                    index === learningStep ? 'bg-blue-500' : 
                    index < learningStep ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={nextLearningStep}
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition"
            >
              {learningStep === learningContent.length - 1 ? (isReviewMode ? 'Review Games! 🎮' : 'Play Games! 🎮') : 'Next →'}
            </button>
          </div>
        </motion.div>
      ) : currentStep === 'game' ? (
        /* Interactive Mini-Games Phase */
        <motion.div
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {/* Game Progress */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-purple-600 mb-2">
              <span>Game {gameStep + 1} of {miniGames.length}</span>
              <span>{Math.round(((gameStep + 1) / miniGames.length) * 100)}% Complete</span>
            </div>
            <div className="w-full bg-purple-100 rounded-full h-3">
              <motion.div
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${((gameStep + 1) / miniGames.length) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          {/* Mini-Game Card */}
          <motion.div
            key={gameStep}
            className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 shadow-lg mb-6 border-2 border-purple-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Game Header */}
            <div className="text-center mb-8">
              <motion.div 
                className="text-6xl mb-4"
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
              >
                🎮
              </motion.div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
                {miniGames[gameStep].title}
              </h2>
              <div className="text-lg font-semibold text-purple-600 mb-4">
                {miniGames[gameStep].character}
              </div>
              <p className="text-gray-600 text-lg">
                {miniGames[gameStep].instruction}
              </p>
            </div>

            {/* Game Content Based on Type */}
            {miniGames[gameStep].type === 'matching' && (
              <div className="space-y-6">
                <p className="text-center text-gray-600 mb-4">Click on a term, then click on its matching definition!</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Terms */}
                  <div className="space-y-3">
                    <h3 className="font-bold text-gray-800 mb-4">Credit Factors</h3>
                    {miniGames[gameStep].pairs.map((pair, index) => (
                      <motion.div
                        key={`term-${index}`}
                        className={`p-4 rounded-lg shadow-md border-2 cursor-pointer transition ${
                          matchedPairs.includes(index) 
                            ? 'bg-green-100 border-green-500 cursor-not-allowed' 
                            : selectedTerm === index
                            ? 'bg-blue-100 border-blue-500'
                            : 'bg-white border-gray-200 hover:bg-blue-50 hover:border-blue-300'
                        }`}
                        whileHover={!matchedPairs.includes(index) ? { scale: 1.02 } : {}}
                        whileTap={!matchedPairs.includes(index) ? { scale: 0.98 } : {}}
                        onClick={() => handleTermClick(index)}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{pair.emoji}</span>
                          <span className="font-medium">{pair.term}</span>
                          {matchedPairs.includes(index) && <span className="text-green-500 ml-auto">✓</span>}
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Definitions - shuffled order */}
                  <div className="space-y-3">
                    <h3 className="font-bold text-gray-800 mb-4">Impact & Description</h3>
                    {(shuffledDefinitions.length > 0 ? shuffledDefinitions : miniGames[gameStep].pairs.map((_, i) => i)).map((originalIndex, displayIndex) => {
                      const pair = miniGames[gameStep].pairs[originalIndex];
                      return (
                        <motion.div
                          key={`def-${originalIndex}`}
                          className={`p-4 rounded-lg shadow-md border-2 cursor-pointer transition ${
                            matchedPairs.includes(originalIndex)
                              ? 'bg-green-100 border-green-500 cursor-not-allowed'
                              : selectedDefinition === originalIndex
                              ? 'bg-purple-100 border-purple-500'
                              : 'bg-white border-gray-200 hover:bg-purple-50 hover:border-purple-300'
                          }`}
                          initial={{ opacity: 0.7 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: displayIndex * 0.1 }}
                          onClick={() => handleDefinitionClick(originalIndex)}
                          whileHover={!matchedPairs.includes(originalIndex) ? { scale: 1.02 } : {}}
                          whileTap={!matchedPairs.includes(originalIndex) ? { scale: 0.98 } : {}}
                        >
                          <span className="text-gray-700">{pair.definition}</span>
                          {matchedPairs.includes(originalIndex) && <span className="text-green-500 float-right">✓</span>}
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
                
                {/* Progress */}
                <div className="text-center">
                  <div className="bg-gray-200 rounded-full h-3 mb-2">
                    <div
                      className="bg-purple-500 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${(matchedPairs.length / miniGames[gameStep].pairs.length) * 100}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-600">
                    {matchedPairs.length} / {miniGames[gameStep].pairs.length} pairs matched
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Select a term and its matching definition, then click Check Match!
                  </p>
                </div>

                {/* Wrong Answer Feedback */}
                <AnimatePresence>
                  {showWrongAnswer && miniGames[gameStep].type === 'matching' && (
                    <motion.div
                      className="mt-4 p-4 bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-xl"
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="flex items-center gap-3">
                        <motion.span
                          className="text-3xl"
                          animate={{ rotate: [0, -10, 10, -10, 0] }}
                          transition={{ duration: 0.5 }}
                        >
                          🤔
                        </motion.span>
                        <div>
                          <p className="font-bold text-red-700">
                            {selectedTerm === null || selectedDefinition === null
                              ? "Please select both a term and a definition!"
                              : "That's not a match!"}
                          </p>
                          <p className="text-sm text-red-600">
                            {selectedTerm === null || selectedDefinition === null
                              ? "Click on a term from the left, then click on its matching definition from the right."
                              : "Try a different combination."}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit Button */}
                {!gameCompleted && (
                  <div className="text-center mt-4">
                    <motion.button
                      onClick={handleMatchingSubmit}
                      disabled={selectedTerm === null && selectedDefinition === null}
                      className={`px-8 py-3 rounded-xl font-bold transition shadow-lg ${
                        selectedTerm !== null || selectedDefinition !== null
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                      whileHover={selectedTerm !== null || selectedDefinition !== null ? { scale: 1.05 } : {}}
                      whileTap={selectedTerm !== null || selectedDefinition !== null ? { scale: 0.95 } : {}}
                    >
                      Check Match ✓
                    </motion.button>
                  </div>
                )}
              </div>
            )}

            {miniGames[gameStep].type === 'slider' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-md">
                  <div className="text-center mb-6">
                    <span className="text-4xl mb-2 block">
                      {miniGames[gameStep].scenarios[0].emoji}
                    </span>
                    <h3 className="text-xl font-bold text-gray-800">
                      Help {miniGames[gameStep].scenarios[0].name}!
                    </h3>
                    <p className="text-gray-600 mt-2">
                      Credit Limit: ${miniGames[gameStep].scenarios[0].creditLimit.toLocaleString()}<br />
                      Current Balance: ${miniGames[gameStep].scenarios[0].currentBalance.toLocaleString()}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <label className="block text-sm font-medium text-gray-700">
                      What should {miniGames[gameStep].scenarios[0].name}'s target balance be? (Drag the slider!)
                    </label>
                    <input
                      type="range"
                      min="0"
                      max={miniGames[gameStep].scenarios[0].creditLimit}
                      step="50"
                      value={sliderValue}
                      onChange={(e) => handleSliderChange(parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                      disabled={gameCompleted}
                    />
                    <div className="text-center">
                      <span className="text-2xl font-bold text-purple-600">
                        ${sliderValue.toLocaleString()}
                      </span>
                      <p className="text-sm text-gray-600 mt-2">
                        Utilization Rate: {((sliderValue / miniGames[gameStep].scenarios[0].creditLimit) * 100).toFixed(0)}%
                      </p>
                    </div>

                    {/* Wrong Answer Feedback */}
                    <AnimatePresence>
                      {showWrongAnswer && miniGames[gameStep].type === 'slider' && (
                        <motion.div
                          className="mt-4 p-4 bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-xl"
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          transition={{ duration: 0.3 }}
                        >
                          <div className="flex items-center gap-3">
                            <motion.span
                              className="text-3xl"
                              animate={{ rotate: [0, -10, 10, -10, 0] }}
                              transition={{ duration: 0.5 }}
                            >
                              🤔
                            </motion.span>
                            <div>
                              <p className="font-bold text-red-700">Not quite right!</p>
                              <p className="text-sm text-red-600">Try setting a lower balance to get the utilization rate below 30%.</p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Submit Button */}
                    {!gameCompleted && (
                      <div className="text-center mt-4">
                        <motion.button
                          onClick={handleSliderSubmit}
                          className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl font-bold transition shadow-lg"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Check Answer ✓
                        </motion.button>
                        <p className="text-sm text-gray-500 mt-2">
                          Set the target balance, then click to check!
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {miniGames[gameStep].type === 'timeline' && (
              <div className="space-y-4">
                <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-md">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">
                    Drag to Arrange the Steps in Order! 🎯
                  </h3>
                  <p className="text-center text-gray-500 text-sm mb-4">Drag items to reorder them</p>
                  <Reorder.Group
                    axis="y"
                    values={timelineOrder}
                    onReorder={gameCompleted ? () => {} : setTimelineOrder}
                    className="space-y-3"
                    layoutScroll
                  >
                    {timelineOrder.map((step, displayIndex) => (
                      <Reorder.Item
                        key={step.id}
                        value={step}
                        className={`p-4 rounded-lg border-2 bg-gradient-to-r from-blue-100 to-purple-100 border-gray-200 ${
                          gameCompleted ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'
                        }`}
                        style={{ touchAction: 'none' }}
                        whileDrag={{
                          scale: 1.02,
                          boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                          zIndex: 50
                        }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      >
                        <div className="flex items-center gap-3 pointer-events-none">
                          <span className="text-2xl">{step.emoji}</span>
                          <span className="font-medium flex-1">{step.text}</span>
                          <span className="px-3 py-1 rounded-full text-sm font-bold bg-white text-purple-600">
                            Step {displayIndex + 1}
                          </span>
                        </div>
                      </Reorder.Item>
                    ))}
                  </Reorder.Group>

                  {/* Wrong Answer Feedback */}
                  <AnimatePresence>
                    {showWrongAnswer && miniGames[gameStep].type === 'timeline' && (
                      <motion.div
                        className="mt-4 p-4 bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-xl"
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="flex items-center gap-3">
                          <motion.span
                            className="text-3xl"
                            animate={{ rotate: [0, -10, 10, -10, 0] }}
                            transition={{ duration: 0.5 }}
                          >
                            🤔
                          </motion.span>
                          <div>
                            <p className="font-bold text-red-700">Not quite right!</p>
                            <p className="text-sm text-red-600">Try reordering the steps and check again.</p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Submit Button */}
                  {!gameCompleted && (
                    <div className="text-center mt-6">
                      <motion.button
                        onClick={handleTimelineSubmit}
                        className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl font-bold transition shadow-lg"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Check Answer ✓
                      </motion.button>
                      <p className="text-sm text-gray-500 mt-2">
                        Arrange the steps in the correct order, then click to check!
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Success/Completion State */}
            {gameCompleted && (
              <motion.div
                className="mt-6 bg-gradient-to-r from-green-100 to-emerald-100 border border-green-300 rounded-lg p-6 relative overflow-hidden"
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, type: "spring", stiffness: 300 }}
              >
                {/* Floating particles */}
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute text-2xl"
                    initial={{ 
                      x: Math.random() * 400,
                      y: 50,
                      opacity: 0
                    }}
                    animate={{ 
                      y: -50,
                      opacity: [0, 1, 0],
                      rotate: [0, 180, 360]
                    }}
                    transition={{ 
                      duration: 3,
                      delay: i * 0.2,
                      repeat: 2
                    }}
                  >
                    {['⭐', '✨', '🎉', '💫', '🌟'][i]}
                  </motion.div>
                ))}
                
                <div className="text-center relative z-10">
                  <motion.div 
                    className="text-4xl mb-3"
                    animate={{ 
                      scale: [1, 1.3, 1],
                      rotate: [0, 15, -15, 0]
                    }}
                    transition={{ 
                      duration: 0.8,
                      repeat: 3
                    }}
                  >
                    🎉
                  </motion.div>
                  <motion.div 
                    className="font-bold text-green-800 text-xl mb-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    Amazing Job!
                  </motion.div>
                  <motion.div 
                    className="text-green-600 font-medium"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    You've mastered this concept! +25 XP 🌟
                  </motion.div>
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Game Navigation */}
          <div className="flex justify-between items-center">
            <button
              onClick={prevGameStep}
              className="px-6 py-3 rounded-xl font-medium transition bg-gray-300 hover:bg-gray-400 text-gray-700"
            >
              ← {gameStep === 0 ? 'Back to Learning' : 'Previous Game'}
            </button>

            <div className="flex gap-2">
              {miniGames.map((_, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full ${
                    index === gameStep ? 'bg-purple-500' : 
                    index < gameStep ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>

            <motion.button
              onClick={nextGameStep}
              disabled={!gameCompleted}
              className={`px-8 py-4 rounded-xl font-bold transition shadow-lg relative overflow-hidden ${
                gameCompleted
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              whileHover={gameCompleted ? {
                scale: 1.05,
                boxShadow: "0 10px 25px rgba(168, 85, 247, 0.4)"
              } : {}}
              whileTap={gameCompleted ? { scale: 0.95 } : {}}
            >
              {gameCompleted && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-400 opacity-20"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: "100%" }}
                  transition={{ duration: 0.5 }}
                />
              )}
              <span className="relative z-10">
                {gameStep === miniGames.length - 1 ? (isReviewMode ? 'Review Quiz! 🎯' : 'Start Quiz! 🎯') : 'Next Game →'}
              </span>
            </motion.button>
          </div>
        </motion.div>
      ) : currentStep === 'quiz' && !showResults ? (
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
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">{currentQuestion + 1} / {questions.length}</span>
            </div>
            <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-blue-600 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          {/* Question Card - Case Study Style */}
          <motion.div
            key={currentQuestion}
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
                    Question {currentQuestion + 1} of {questions.length}
                  </span>
                  <h2 className="text-lg sm:text-2xl lg:text-3xl font-bold text-slate-900 leading-tight">
                    {questions[currentQuestion].question}
                  </h2>
                </div>
                <div className="hidden lg:block text-slate-200">
                  <Trophy size={48} />
                </div>
              </div>

              {/* Options Grid - Case Study Style */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                {questions[currentQuestion].options.map((option, index) => {
                  const isSelected = selectedAnswers[currentQuestion] === option.id;
                  const showAsCorrect = (isReviewMode && option.correct) || (selectedAnswers[currentQuestion] && option.correct);
                  const showAsIncorrect = selectedAnswers[currentQuestion] && isSelected && !option.correct;
                  const showCorrectness = selectedAnswers[currentQuestion] && (isSelected || option.correct);

                  return (
                    <button
                      key={option.id}
                      onClick={() => !isReviewMode && !selectedAnswers[currentQuestion] && handleAnswerSelect(currentQuestion, option.id)}
                      disabled={!!selectedAnswers[currentQuestion] || isReviewMode}
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
                      } ${(!!selectedAnswers[currentQuestion] || isReviewMode) ? 'cursor-default' : 'cursor-pointer'}`}
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
                {selectedAnswers[currentQuestion] && !isReviewMode && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="mt-6 sm:mt-8 bg-slate-900 text-white p-4 sm:p-8 rounded-xl sm:rounded-2xl flex flex-col md:flex-row items-center gap-4 sm:gap-8 shadow-2xl"
                  >
                    <div className="flex-1">
                      <h4 className="font-bold text-blue-400 uppercase tracking-wider text-xs sm:text-sm mb-2">Explanation</h4>
                      <p className="text-sm sm:text-lg leading-relaxed text-slate-200">
                        {questions[currentQuestion].explanation}
                      </p>
                    </div>
                    <button
                      onClick={handleNext}
                      className="w-full md:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-white text-slate-900 rounded-lg sm:rounded-xl font-bold hover:bg-blue-50 transition-colors whitespace-nowrap text-sm sm:text-base"
                    >
                      {currentQuestion === questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Review Mode - Show explanation inline */}
              {isReviewMode && (
                <div className="mt-6 p-4 sm:p-6 bg-green-50 border border-green-200 rounded-xl">
                  <h4 className="font-bold text-green-800 text-sm mb-2">Explanation</h4>
                  <p className="text-green-700 text-sm sm:text-base">{questions[currentQuestion].explanation}</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-6">
            <button
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className={`px-6 py-3 rounded-xl font-medium transition ${
                currentQuestion === 0
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-300 hover:bg-gray-400 text-gray-700'
              }`}
            >
              Previous
            </button>

            {isReviewMode ? (
              currentQuestion < questions.length - 1 ? (
                <button
                  onClick={() => setCurrentQuestion(currentQuestion + 1)}
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
            ) : !selectedAnswers[currentQuestion] ? (
              <div className="px-6 py-3 bg-gray-200 text-gray-400 rounded-xl font-medium cursor-not-allowed">
                Select an answer
              </div>
            ) : null}
          </div>
        </motion.div>
      ) : (
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
            
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">Credit Score Mastery Complete! 🎉</h2>
            <p className="text-xl text-gray-600 mb-6">
              {getScoreMessage()}
            </p>

            {/* Final Stats */}
            <div className="flex justify-center mb-8">
              <div className="bg-green-50 rounded-lg p-6 text-center">
                <div className="text-3xl sm:text-4xl font-bold text-green-600">{score}/{questions.length}</div>
                <div className="text-sm text-gray-600">Correct Answers</div>
              </div>
            </div>

            {/* Answer Review */}
            <div className="text-left mb-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Review Your Answers:</h3>
              {questions.map((question, index) => {
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
                          You scored {score}/{questions.length} ({Math.round((score / questions.length) * 100)}%) - Attempt #{saveResult.attemptNumber}
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <XCircle className="text-orange-600" size={28} />
                      <div className="text-center">
                        <p className="font-bold text-orange-800 text-lg">Keep Practicing!</p>
                        <p className="text-orange-600 text-sm">
                          You scored {score}/{questions.length} ({Math.round((score / questions.length) * 100)}%) - 80% required to pass - Attempt #{saveResult.attemptNumber}
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
                  setCurrentStep('learning');
                  setLearningStep(0);
                  setGameStep(0);
                  setCurrentQuestion(0);
                  setSelectedAnswers({});
                  setShowResults(false);
                  setShowExplanation(false);
                  setScore(0);
                  setLives(3);
                  setStreak(0);
                  setTotalXP(0);
                  setAchievements([]);
                  setGameScore(0);
                  setCurrentGameType('');
                  setGameCompleted(false);
                  setMatchedPairs([]);
                  setSelectedTerm(null);
                  setSelectedDefinition(null);
                  setSliderValue(miniGames[0]?.scenarios?.[0]?.currentBalance || 0);
                  setTimelineOrder([...miniGames[2].steps]);
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

export default CreditScoreModule;