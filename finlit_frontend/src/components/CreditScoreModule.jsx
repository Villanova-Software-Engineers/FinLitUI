import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Star, Trophy, CheckCircle, XCircle, Heart, Zap, RefreshCw, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useModuleScore, MODULES } from '../hooks/useModuleScore';

const CreditScoreModule = () => {
  const navigate = useNavigate();
  const { saveScore, getModuleScore, isModulePassed, resetModule, isLoading: progressLoading } = useModuleScore();

  const [currentStep, setCurrentStep] = useState('learning'); // 'learning', 'game', 'quiz', 'results'
  const [learningStep, setLearningStep] = useState(0);
  const [gameStep, setGameStep] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
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
  const [draggedItem, setDraggedItem] = useState(null);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [selectedTerm, setSelectedTerm] = useState(null);
  const [selectedDefinition, setSelectedDefinition] = useState(null);
  const [sliderValue, setSliderValue] = useState(0);
  const [timelineOrder, setTimelineOrder] = useState([]);
  const [shuffledDefinitions, setShuffledDefinitions] = useState([]);

  // Check if module is already passed
  const modulePassed = isModulePassed(MODULES.CREDIT_SCORE?.id);

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
        { term: "Credit Mix", definition: "10% - Different types of accounts", emoji: "🔀", matched: false }
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
      
      // Check for achievements
      if (streak === 2) {
        setAchievements([...achievements, { id: 'streak3', name: 'Credit Streak!', desc: '3 correct in a row', emoji: '🔥' }]);
      }
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
      const result = await saveScore('credit-score', percentageScore, 100);
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
    setTimelineOrder(miniGames[gameStep + 1]?.steps?.map((_, index) => index) || []);
  };

  const handleTermClick = (termIndex) => {
    if (matchedPairs.includes(termIndex)) return;
    
    if (selectedTerm === termIndex) {
      setSelectedTerm(null);
    } else {
      setSelectedTerm(termIndex);
      setSelectedDefinition(null); // Clear definition selection
      
      // If both term and definition are selected, check for match
      if (selectedDefinition !== null) {
        if (termIndex === selectedDefinition) {
          setMatchedPairs([...matchedPairs, termIndex]);
          setSelectedTerm(null);
          setSelectedDefinition(null);
          
          // Check if game completed
          if (matchedPairs.length + 1 >= miniGames[gameStep].pairs.length) {
            setGameCompleted(true);
            setTotalXP(totalXP + 50);
          }
        }
      }
    }
  };

  const handleDefinitionClick = (defIndex) => {
    if (matchedPairs.includes(defIndex)) return;
    
    if (selectedDefinition === defIndex) {
      setSelectedDefinition(null);
    } else {
      setSelectedDefinition(defIndex);
      setSelectedTerm(null); // Clear term selection
      
      // If both term and definition are selected, check for match
      if (selectedTerm !== null) {
        if (selectedTerm === defIndex) {
          setMatchedPairs([...matchedPairs, defIndex]);
          setSelectedTerm(null);
          setSelectedDefinition(null);
          
          // Check if game completed
          if (matchedPairs.length + 1 >= miniGames[gameStep].pairs.length) {
            setGameCompleted(true);
            setTotalXP(totalXP + 50);
          }
        }
      }
    }
  };

  const handleSliderChange = (value) => {
    setSliderValue(value);
    const scenario = miniGames[gameStep].scenarios[0];
    const utilizationRate = (value / scenario.creditLimit) * 100;
    
    if (utilizationRate <= 30) {
      setGameCompleted(true);
      setTotalXP(totalXP + 50);
    }
  };

  const handleTimelineDragStart = (e, index) => {
    setDraggedItem(index);
  };

  const handleTimelineDrop = (e, dropIndex) => {
    e.preventDefault();
    if (draggedItem === null || draggedItem === dropIndex) return;

    // Swap the two items instead of inserting
    const newOrder = [...timelineOrder];
    const temp = newOrder[draggedItem];
    newOrder[draggedItem] = newOrder[dropIndex];
    newOrder[dropIndex] = temp;

    setTimelineOrder(newOrder);
    setDraggedItem(null);

    // Check if order is correct
    const isCorrect = newOrder.every((item, index) => item === index);
    if (isCorrect) {
      setGameCompleted(true);
      setTotalXP(totalXP + 50);
    }
  };

  const prevGameStep = () => {
    if (gameStep > 0) {
      setGameStep(gameStep - 1);
      setGameCompleted(false);
      setCurrentGameType('');
      resetGameState();
    }
  };

  // Initialize game state when component mounts or game changes
  React.useEffect(() => {
    if (currentStep === 'game') {
      setSliderValue(miniGames[gameStep]?.scenarios?.[0]?.currentBalance || 0);

      // For timeline game, shuffle the order so it's not already in correct order
      if (miniGames[gameStep]?.type === 'timeline') {
        const indices = miniGames[gameStep].steps.map((_, index) => index);
        let shuffled = shuffleArray(indices);
        // Make sure the shuffled array is not already in correct order
        while (shuffled.every((val, idx) => val === idx)) {
          shuffled = shuffleArray(indices);
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

  // If module is already passed, show completion screen
  if (modulePassed) {
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

        <div className="flex items-center gap-4">
          {/* Lives */}
          <div className="flex items-center gap-1">
            {[...Array(3)].map((_, i) => (
              <Heart 
                key={i} 
                className={`w-5 h-5 ${i < lives ? 'text-red-500 fill-red-500' : 'text-gray-300'}`} 
              />
            ))}
          </div>
          
          {/* XP */}
          <div className="flex items-center gap-2 text-purple-600">
            <Star className="w-5 h-5" />
            <span className="font-semibold">{totalXP} XP</span>
          </div>
          
          {/* Streak */}
          {streak > 0 && (
            <div className="flex items-center gap-2 text-orange-600">
              <Zap className="w-5 h-5" />
              <span className="font-semibold">{streak}🔥</span>
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
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 mb-6 shadow-lg border-l-4 border-blue-500">
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
            <div className="bg-white rounded-xl p-6 mb-6 shadow-md">
              <h3 className="text-lg font-bold text-gray-800 mb-3">Key Concepts:</h3>
              <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                {learningContent[learningStep].content}
              </div>
            </div>

            {/* Analogy Box */}
            <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-xl p-6 border border-yellow-300">
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
              {learningStep === learningContent.length - 1 ? 'Play Games! 🎮' : 'Next →'}
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
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
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
                    Click a term, then click its matching definition!
                  </p>
                </div>
              </div>
            )}

            {miniGames[gameStep].type === 'slider' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl p-6 shadow-md">
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
                    />
                    <div className="text-center">
                      <span className="text-2xl font-bold text-purple-600">
                        ${sliderValue.toLocaleString()}
                      </span>
                      <p className="text-sm text-gray-600 mt-2">
                        Utilization Rate: {((sliderValue / miniGames[gameStep].scenarios[0].creditLimit) * 100).toFixed(0)}%
                      </p>
                      {((sliderValue / miniGames[gameStep].scenarios[0].creditLimit) * 100) <= 30 && (
                        <p className="text-green-600 font-medium mt-2">
                          ✅ Excellent! This is a healthy utilization rate!
                        </p>
                      )}
                      {((sliderValue / miniGames[gameStep].scenarios[0].creditLimit) * 100) > 30 && (
                        <p className="text-orange-600 font-medium mt-2">
                          ⚠️ Try to get below 30% for optimal credit health
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {miniGames[gameStep].type === 'timeline' && (
              <div className="space-y-4">
                <div className="bg-white rounded-xl p-6 shadow-md">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">
                    Drag to Arrange the Steps in Order! 🎯
                  </h3>
                  <div className="space-y-3">
                    {timelineOrder.map((stepIndex, displayIndex) => {
                      const step = miniGames[gameStep].steps[stepIndex];
                      const isCorrectPosition = stepIndex === displayIndex;
                      return (
                        <motion.div
                          key={step.id}
                          className={`p-4 rounded-lg border-2 cursor-grab active:cursor-grabbing hover:shadow-md transition ${
                            isCorrectPosition 
                              ? 'bg-gradient-to-r from-green-100 to-emerald-100 border-green-300' 
                              : 'bg-gradient-to-r from-blue-100 to-purple-100 border-gray-200'
                          }`}
                          draggable
                          onDragStart={(e) => handleTimelineDragStart(e, displayIndex)}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={(e) => handleTimelineDrop(e, displayIndex)}
                          whileHover={{ scale: 1.02 }}
                          whileDrag={{ scale: 1.05 }}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{step.emoji}</span>
                            <span className="font-medium flex-1">{step.text}</span>
                            <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                              isCorrectPosition ? 'bg-green-500 text-white' : 'bg-white text-purple-600'
                            }`}>
                              Step {displayIndex + 1}
                            </span>
                            {isCorrectPosition && <span className="text-green-500">✓</span>}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                  
                  {/* Progress */}
                  <div className="text-center mt-4">
                    <div className="bg-gray-200 rounded-full h-3 mb-2">
                      <div 
                        className="bg-purple-500 h-3 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${(timelineOrder.filter((stepIndex, displayIndex) => stepIndex === displayIndex).length / miniGames[gameStep].steps.length) * 100}%` 
                        }}
                      />
                    </div>
                    <p className="text-sm text-gray-600">
                      {timelineOrder.filter((stepIndex, displayIndex) => stepIndex === displayIndex).length} / {miniGames[gameStep].steps.length} steps in correct order
                    </p>
                  </div>
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
              disabled={gameStep === 0}
              className={`px-6 py-3 rounded-xl font-medium transition ${
                gameStep === 0
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-300 hover:bg-gray-400 text-gray-700'
              }`}
            >
              ← Previous Game
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
              className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl font-bold transition shadow-lg relative overflow-hidden"
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 10px 25px rgba(168, 85, 247, 0.4)"
              }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-400 opacity-20"
                initial={{ x: "-100%" }}
                whileHover={{ x: "100%" }}
                transition={{ duration: 0.5 }}
              />
              <span className="relative z-10">
                {gameStep === miniGames.length - 1 ? 'Start Quiz! 🎯' : 'Next Game →'}
              </span>
            </motion.button>
          </div>
        </motion.div>
      ) : currentStep === 'quiz' && !showResults ? (
        <motion.div
          className="max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Question {currentQuestion + 1} of {questions.length}</span>
              <span>{Math.round(((currentQuestion + 1) / questions.length) * 100)}% Complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                className="bg-blue-500 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          {/* Question Card */}
          <motion.div
            key={currentQuestion}
            className="bg-white rounded-2xl p-8 shadow-lg mb-6"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center mb-8">
              <motion.div
                className="text-4xl mb-4"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
              >
                🤔
              </motion.div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {questions[currentQuestion].question}
              </h2>
              <p className="text-purple-600 font-medium">
                +{questions[currentQuestion].xp} XP {streak > 0 && `(+${streak * 5} bonus!)`}
              </p>
            </div>

            <div className="space-y-4">
              {questions[currentQuestion].options.map((option, index) => (
                <motion.button
                  key={option.id}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                    selectedAnswers[currentQuestion] === option.id
                      ? option.correct
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-red-500 bg-red-50 text-red-700'
                      : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                  }`}
                  onClick={() => handleAnswerSelect(currentQuestion, option.id)}
                  disabled={selectedAnswers[currentQuestion]}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-lg font-bold ${
                      selectedAnswers[currentQuestion] === option.id
                        ? option.correct
                          ? 'border-green-500 bg-green-500 text-white'
                          : 'border-red-500 bg-red-500 text-white'
                        : 'border-purple-300 text-purple-500'
                    }`}>
                      {selectedAnswers[currentQuestion] === option.id
                        ? (option.correct ? '✓' : '✗')
                        : option.id
                      }
                    </div>
                    <span className="text-lg">{option.text}</span>
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Show Explanation Button */}
            {selectedAnswers[currentQuestion] && (
              <motion.button
                className="mt-4 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition text-sm"
                onClick={() => setShowExplanation(!showExplanation)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {showExplanation ? 'Hide' : 'Show'} Explanation
              </motion.button>
            )}

            {/* Explanation */}
            <AnimatePresence>
              {showExplanation && (
                <motion.div
                  className="mt-4 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <p className="text-blue-800 text-sm">{questions[currentQuestion].explanation}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Navigation Buttons */}
          <div className="flex justify-between">
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

            <button
              onClick={handleNext}
              disabled={!selectedAnswers[currentQuestion]}
              className={`px-6 py-3 rounded-xl font-medium transition ${
                !selectedAnswers[currentQuestion]
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              {currentQuestion === questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
            </button>
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
            
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Credit Score Mastery Complete! 🎉</h2>
            <p className="text-xl text-gray-600 mb-6">
              {getScoreMessage()}
            </p>

            {/* Final Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-purple-50 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-purple-600">{totalXP}</div>
                <div className="text-sm text-gray-600">Total XP</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-green-600">{score}</div>
                <div className="text-sm text-gray-600">Correct</div>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-blue-600">{lives}</div>
                <div className="text-sm text-gray-600">Lives Left</div>
              </div>
              <div className="bg-orange-50 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-orange-600">{achievements.length}</div>
                <div className="text-sm text-gray-600">Achievements</div>
              </div>
            </div>

            {/* Achievements */}
            {achievements.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-800 mb-3">🏆 Achievements Unlocked:</h3>
                <div className="flex flex-wrap justify-center gap-2">
                  {achievements.map(achievement => (
                    <div key={achievement.id} className="bg-yellow-100 border border-yellow-300 rounded-lg px-3 py-2">
                      <span className="text-lg mr-2">{achievement.emoji}</span>
                      <span className="text-sm font-medium text-yellow-800">{achievement.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

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
                          You achieved 100% - Attempt #{saveResult.attemptNumber}
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <XCircle className="text-orange-600" size={28} />
                      <div className="text-center">
                        <p className="font-bold text-orange-800 text-lg">Keep Practicing!</p>
                        <p className="text-orange-600 text-sm">
                          100% required to pass - Attempt #{saveResult.attemptNumber}
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
                  setTimelineOrder([0, 1, 2, 3, 4]);
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