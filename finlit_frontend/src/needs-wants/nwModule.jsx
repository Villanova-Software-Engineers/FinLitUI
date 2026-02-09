import { useEffect, useState } from "react";
import { useSwipeable } from "react-swipeable";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ArrowLeft, ArrowRight, RotateCcw, Zap } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { useModuleScore, MODULES } from '../hooks/useModuleScore';

export default function NeedsWants() {
  const navigate = useNavigate();
  const { saveScore, isModulePassed, refreshProgress, isLoading: progressLoading } = useModuleScore();
  
  function getRandomItem(list, count) {
    // Ensure no duplicates by picking unique items
    const shuffled = [...list].sort(() => Math.random() - 0.5);
    const selected = [];
    const seenIds = new Set();
    
    for (const item of shuffled) {
      if (selected.length >= count) break;
      if (!seenIds.has(item.id)) {
        selected.push(item);
        seenIds.add(item.id);
      }
    }
    
    return selected.length === count ? selected : [...list].slice(0, count);
  }

  // Get balanced items with exactly 5 needs and 4 wants for island game
  function getBalancedItems(allItems) {
    const needs = allItems.filter(item => item.type === "need");
    const wants = allItems.filter(item => item.type === "want");

    const selectedNeeds = getRandomItem(needs, 5);
    const selectedWants = getRandomItem(wants, 4);

    return shuffleArray([...selectedNeeds, ...selectedWants]);
  }

  const [step, setStep] = useState(1);
  const [selected, setSelected] = useState([]);
  const [current, setCurrent] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [items, setItems] = useState([]);
  const [items2, setItems2] = useState([]);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizIndex, setQuizIndex] = useState(0);
  const [showGray, setShowGray] = useState(false);
  const [finished, setFinished] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [swipeCorrect, setSwipeCorrect] = useState(0);
  const [quizCorrect, setQuizCorrect] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [scoreSaved, setScoreSaved] = useState(false);
  const [shuffledQuiz, setShuffledQuiz] = useState([]);
  const [isProcessingSwipe, setIsProcessingSwipe] = useState(false);
  const [showCompletionScreen, setShowCompletionScreen] = useState(false);
  const [isReviewMode, setIsReviewMode] = useState(false); // Review mode - view content without editing answers

  // Check if module is already passed
  const modulePassed = isModulePassed(MODULES.NEEDS_WANTS.id);

  // Watch for module completion and show completion screen
  useEffect(() => {
    if (scoreSaved && modulePassed) {
      setShowCompletionScreen(true);
    }
  }, [scoreSaved, modulePassed]);

  // Shuffle array helper
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Hardcoded items for better control and fewer questions
  const hardcodedItems = [
    { id: 1, name: "Water", type: "need" },
    { id: 2, name: "Gaming Console", type: "want" },
    { id: 3, name: "Food", type: "need" },
    { id: 4, name: "Designer Clothes", type: "want" },
    { id: 5, name: "Shelter", type: "need" },
    { id: 6, name: "Streaming Service", type: "want" },
    { id: 7, name: "Medicine", type: "need" },
    { id: 8, name: "Luxury Watch", type: "want" },
    { id: 9, name: "Transportation", type: "need" },
    { id: 10, name: "Expensive Restaurant", type: "want" },
    { id: 11, name: "Phone", type: "need" },
    { id: 12, name: "Concert Tickets", type: "want" },
    { id: 13, name: "Basic Clothing", type: "need" },
    { id: 14, name: "Spa Treatment", type: "want" },
    { id: 15, name: "Internet", type: "need" }
  ];

  // Initialize with hardcoded items
  useEffect(() => {
    setItems(getBalancedItems(hardcodedItems)); // Always 5 needs + 3 wants
    setItems2(getRandomItem(hardcodedItems, 8)); // Reduced from 15 to 8 questions
  }, []);

  // Enhanced swipe handlers with smoother detection
  const handlers = useSwipeable({
    onSwipedLeft: () => handleSwipe("left"),
    onSwipedRight: () => handleSwipe("right"),
    onSwiping: (eventData) => {
      if (step === 2 && !finished) {
        setIsDragging(true);
        setDragOffset({ x: eventData.deltaX, y: eventData.deltaY });
      }
    },
    onSwiped: () => {
      setIsDragging(false);
      setDragOffset({ x: 0, y: 0 });
    },
    preventDefaultTouchmoveEvent: true,
    trackMouse: true,
    delta: 10, // Very low threshold for ultra-responsive swiping
    swipeDuration: 1000, // Longer duration for easier swipes
    touchEventOptions: { passive: false }
  });

  // toggle item
  function toggleItem(id) {
    if (selected.includes(id))
      setSelected(selected.filter((x) => x !== id));
    else if (selected.length < 5)
      setSelected([...selected, id]);
  }

  // Enhanced swipe logic with better animations
  function handleSwipe(direction) {
    if (finished || isProcessingSwipe) return;

    const item = items2[current];
    if (!item) return;

    setIsProcessingSwipe(true);
    setSwipeDirection(direction);
    const isCorrectAnswer = (direction === "right" && item.type === "want") ||
                     (direction === "left" && item.type === "need");

    if (isCorrectAnswer) {
      setSwipeCorrect(prev => prev + 1);
    }

    const msg = isCorrectAnswer
      ? `✅ Correct! ${item.name} is a ${item.type}`
      : `❌ Oops! ${item.name} is actually a ${item.type}`;

    setFeedback(msg);

    setTimeout(() => {
      setFeedback("");
      setSwipeDirection(null);
      const nextIndex = current + 1;
      setCurrent(nextIndex);

      // Check if finished
      if (nextIndex >= items2.length) {
        setFinished(true);
        setTimeout(() => {
          setShowQuiz(true);
        }, 1500);
      }
      setIsProcessingSwipe(false);
    }, 2500);
  }

  // Navigation functions
  const goToPrevious = () => {
    if (current > 0) {
      setCurrent(current - 1);
      setFeedback("");
      setSwipeDirection(null);
    }
  };

  const goToNext = () => {
    if (current < items2.length - 1) {
      handleSwipe("skip");
    }
  };

  // Quiz data with teaching points (matching CaseStudy format)
  const quiz = [
    {
      question: "Which expense is a NEED?",
      options: ["Concert tickets", "Rent", "Designer shoes", "Streaming service"],
      answer: "Rent",
      teaching_point: "Rent is a need because shelter is essential for survival. Without a place to live, you can't function in society, stay safe, or maintain your health."
    },
    {
      question: "Which expense can you most easily cut if money is tight?",
      options: ["Rent", "Car insurance", "Streaming subscription", "Electricity"],
      answer: "Streaming subscription",
      teaching_point: "Streaming services are wants - entertainment that enhances life but isn't essential. When budgeting, cutting wants first protects your ability to meet basic needs."
    },
    {
      question: "What makes something a 'need' versus a 'want'?",
      options: ["How much it costs", "How trendy it is", "If it's essential for survival or basic functioning", "If your friends have it"],
      answer: "If it's essential for survival or basic functioning",
      teaching_point: "Needs are things required for basic survival and functioning: food, shelter, clothing, healthcare, and transportation to work. Everything else is a want."
    },
    {
      question: "A basic phone for work calls is a _____, while the latest iPhone is a _____.",
      options: ["Want, Need", "Need, Want", "Need, Need", "Want, Want"],
      answer: "Need, Want",
      teaching_point: "Context matters! A basic phone for work communication is a need in today's world. However, upgrading to the newest, most expensive model is a want."
    },
    {
      question: "Which of these is typically a WANT?",
      options: ["Groceries for home cooking", "Basic work clothes", "Name-brand athletic shoes", "Monthly bus pass for commuting"],
      answer: "Name-brand athletic shoes",
      teaching_point: "While shoes are a need, expensive name-brand athletic shoes are a want. Generic or affordable shoes serve the same practical purpose."
    },
    {
      question: "Why is it important to distinguish between needs and wants?",
      options: ["To impress others with financial knowledge", "To make better budgeting decisions", "To avoid buying anything fun", "To spend more money"],
      answer: "To make better budgeting decisions",
      teaching_point: "Understanding needs vs wants helps you prioritize spending, build savings, and avoid financial stress. It's the foundation of smart money management."
    },
    {
      question: "Which statement about needs and wants is TRUE?",
      options: ["Wants are always bad purchases", "Needs are always cheap", "The same item can be a need or want depending on circumstances", "You should never spend money on wants"],
      answer: "The same item can be a need or want depending on circumstances",
      teaching_point: "A car might be a need for someone in a rural area with no public transit, but a want for someone living in a city with excellent public transportation."
    },
    {
      question: "What percentage of your budget should typically go to needs first?",
      options: ["100%", "About 50%", "About 20%", "About 10%"],
      answer: "About 50%",
      teaching_point: "The popular 50/30/20 budget rule suggests 50% for needs, 30% for wants, and 20% for savings. Covering needs first ensures financial stability."
    },
    {
      question: "Which of these is a NEED for most people?",
      options: ["Gym membership", "Health insurance", "Restaurant meals", "Video games"],
      answer: "Health insurance",
      teaching_point: "Health insurance protects you from catastrophic medical expenses. One emergency without insurance could lead to bankruptcy, making it a critical need."
    },
    {
      question: "Internet service at home is considered a _____ in modern society.",
      options: ["Luxury only", "Always a want", "Often a need for work and education", "Never necessary"],
      answer: "Often a need for work and education",
      teaching_point: "In today's digital world, internet access is often required for work, school, job searching, and essential services. Context determines if it's a need."
    }
  ];

  // State for tracking selected answer and showing result
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);

  // Initialize shuffled quiz when quiz is shown
  useEffect(() => {
    if (showQuiz && shuffledQuiz.length === 0) {
      const shuffled = quiz.map(q => ({
        ...q,
        options: shuffleArray([...q.options])
      }));
      setShuffledQuiz(shuffled);
    }
  }, [showQuiz]);

  // Get current quiz question (shuffled or original)
  const currentQuizQuestion = shuffledQuiz.length > 0 ? shuffledQuiz[quizIndex] : quiz[quizIndex];

  // Track if quiz is complete (all questions answered)
  const [quizComplete, setQuizComplete] = useState(false);

  function handleQuizAnswerSelect(answer) {
    if (showResult) return; // Prevent changing answer after selection

    setSelectedAnswer(answer);
    setShowResult(true);

    const isCorrect = answer === currentQuizQuestion.answer;
    if (isCorrect) {
      setQuizCorrect(prev => prev + 1);
    }
  }

  function handleNextQuestion() {
    if (quizIndex < quiz.length - 1) {
      setQuizIndex(quizIndex + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      // Last question - save score
      const finalQuizCorrect = quizCorrect;
      handleSaveScore(finalQuizCorrect);
      setQuizComplete(true);
    }
  }

  // Handle clicking "Next" after quiz is complete
  function handleQuizNext() {
    setShowGray(true);
    setShowQuiz(false);
  }

  // Save score to Firestore
  async function handleSaveScore(finalQuizCorrect) {
    if (scoreSaved) return; // Prevent duplicate saves

    setIsSaving(true);
    try {
      // Total questions = swipe items + quiz questions
      const totalQuestions = items2.length + quiz.length;
      // Use the passed finalQuizCorrect to ensure we have the latest value
      let totalCorrect = swipeCorrect + finalQuizCorrect;
      
      // Cap total correct at total questions (prevents over-counting due to bugs)
      totalCorrect = Math.min(totalCorrect, totalQuestions);
      
      // Calculate percentage (will be 100 if they got all correct)
      const percentageScore = Math.round((totalCorrect / totalQuestions) * 100);
      
      // Cap the score at 100 for storage
      const finalScore = Math.min(percentageScore, 100);

      await saveScore(MODULES.NEEDS_WANTS.id, finalScore, 100);
      await refreshProgress();
      setScoreSaved(true);
    } catch (error) {
      console.error('Failed to save score:', error);
    } finally {
      setIsSaving(false);
    }
  }

  // Show loading while checking progress
  if (progressLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-blue-100 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Start review mode
  const startReviewMode = () => {
    setIsReviewMode(true);
    // Skip step 1 (item selection) and go directly to the swipe game
    setStep(2);
    // Re-initialize items for review
    setItems(getRandomItem(hardcodedItems, 8));
    setItems2(getRandomItem(hardcodedItems, 8));
  };

  // If module is already passed and not in review mode, show completion screen
  if ((modulePassed || showCompletionScreen) && !isReviewMode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-blue-100 p-6 flex items-center justify-center">
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
            🎉
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{showCompletionScreen ? 'Module Passed!' : 'Module Already Completed!'}</h2>
          <p className="text-gray-600 mb-6">
            You've already passed the Needs vs Wants module. Great job understanding the difference between needs and wants!
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
              Continue to Learning Path
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-blue-100 p-6">
      {/* Header */}
      <motion.div
        className="mb-8 bg-white rounded-xl p-4 shadow-lg max-w-4xl mx-auto"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center">
          <button
            onClick={() => navigate('/game')}
            className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Roadmap
          </button>

          <div className="flex-1 text-center pr-[140px]">
            <h1 className="text-2xl font-bold text-gray-800">Needs vs Wants</h1>
            <p className="text-sm text-gray-600">Financial Decision Making</p>
          </div>
        </div>
      </motion.div>

      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          {/* STEP 1: Item Selection */}
          {step === 1 && (
            <div className="p-8 text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h1 className="text-3xl font-bold text-gray-800 mb-4">🏝️ Stranded on an Island</h1>
                <p className="text-lg text-gray-600 mb-8">
                  Pick <span className="font-bold text-purple-600">5 essential items</span> to take with you:
                </p>
              </motion.div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                {items.map((item, index) => (
                  <motion.button
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => toggleItem(item.id)}
                    className={`p-4 rounded-xl font-semibold transition-all border-2 ${
                      selected.includes(item.id)
                        ? item.type === "need"
                          ? "bg-green-500 text-white border-green-500 shadow-lg"
                          : "bg-purple-500 text-white border-purple-500 shadow-lg"
                        : "bg-gray-100 text-gray-700 border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="text-2xl mb-2">
                      {selected.includes(item.id) ? "✓" : ""}
                    </div>
                    {item.name}
                  </motion.button>
                ))}
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-500 mb-4">
                  Selected: {selected.length}/5
                </p>
                <AnimatePresence>
                  {selected.length === 5 && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setStep(2)}
                      className="px-8 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl shadow-lg transition-colors"
                    >
                      Continue to Swiping →
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}

          {/* STEP 2: Enhanced Swipe Interface */}
          {step === 2 && !showQuiz && !showGray && (
            <div className="p-8">
              {/* Review Mode Banner */}
              {isReviewMode && (
                <motion.div
                  className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-sm text-center"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <span className="font-semibold">Review Mode:</span> You can play the swipe game or skip to the quiz.
                </motion.div>
              )}

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Question {current + 1} of {items2.length}</span>
                  <span>{Math.min(100, Math.round(((current + 1) / items2.length) * 100))}% Complete</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <motion.div
                    className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, ((current + 1) / items2.length) * 100)}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>

              <div className="text-center mb-8">
                <motion.h1 
                  className="text-3xl font-bold text-gray-800 mb-4"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  🤔 The Big Question
                </motion.h1>
                <p className="text-lg text-gray-600 mb-2">
                  Can you survive <span className="font-bold">one month</span> without this item?
                </p>
                <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span>Swipe LEFT = NEED</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span>Swipe RIGHT = WANT</span>
                  </div>
                </div>
              </div>

              {/* Card Container */}
              <div className="relative h-96 flex items-center justify-center mb-8" {...handlers}>
                {/* External Swipe Indicators - Outside the card */}
                <motion.div
                  className="absolute left-0 top-1/2 transform -translate-y-1/2 text-green-500 font-bold"
                  animate={{
                    opacity: isDragging && dragOffset.x < -20 ? 1 : 0.3,
                    scale: isDragging && dragOffset.x < -20 ? 1.2 : 0.9,
                    x: isDragging && dragOffset.x < -20 ? 10 : 0
                  }}
                >
                  <div className="flex flex-col items-center">
                    <ChevronLeft className="w-12 h-12" />
                    <div className="text-xl font-bold">NEED</div>
                  </div>
                </motion.div>

                <motion.div
                  className="absolute right-0 top-1/2 transform -translate-y-1/2 text-red-500 font-bold"
                  animate={{
                    opacity: isDragging && dragOffset.x > 20 ? 1 : 0.3,
                    scale: isDragging && dragOffset.x > 20 ? 1.2 : 0.9,
                    x: isDragging && dragOffset.x > 20 ? -10 : 0
                  }}
                >
                  <div className="flex flex-col items-center">
                    <ChevronRight className="w-12 h-12" />
                    <div className="text-xl font-bold">WANT</div>
                  </div>
                </motion.div>

                <AnimatePresence mode="wait">
                  {items2[current] && !finished ? (
                    <motion.div
                      key={items2[current].id}
                      className="relative w-80 h-64 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl shadow-2xl flex items-center justify-center text-white cursor-grab active:cursor-grabbing overflow-hidden"
                      initial={{ scale: 0.8, opacity: 0, rotateY: -90 }}
                      animate={{
                        scale: 1,
                        opacity: 1,
                        rotateY: 0,
                        x: isDragging ? dragOffset.x : 0,
                        rotate: isDragging ? dragOffset.x * 0.1 : 0,
                        rotateY: isDragging ? dragOffset.x * 0.05 : 0
                      }}
                      exit={{
                        scale: 0.8,
                        opacity: 0,
                        x: swipeDirection === 'left' ? -500 : swipeDirection === 'right' ? 500 : 0,
                        rotate: swipeDirection === 'left' ? -45 : swipeDirection === 'right' ? 45 : 0
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 25,
                        mass: 0.3
                      }}
                      drag={!isProcessingSwipe ? "x" : false}
                      dragConstraints={{ left: 0, right: 0 }}
                      dragElastic={1}
                      onDrag={(_, info) => {
                        if (!isProcessingSwipe) {
                          setIsDragging(true);
                          setDragOffset({ x: info.offset.x, y: 0 });
                        }
                      }}
                      onDragEnd={(_, info) => {
                        if (!isProcessingSwipe && Math.abs(info.offset.x) > 100) {
                          handleSwipe(info.offset.x > 0 ? 'right' : 'left');
                        }
                        setIsDragging(false);
                        setDragOffset({ x: 0, y: 0 });
                      }}
                      whileHover={{ scale: 1.05 }}
                      style={{
                        transformStyle: 'preserve-3d',
                        perspective: 1000
                      }}
                    >
                      {/* Gradient overlay that changes based on swipe direction */}
                      <motion.div
                        className="absolute inset-0 rounded-2xl"
                        animate={{
                          background: isDragging
                            ? dragOffset.x > 50
                              ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.3) 0%, transparent 100%)'
                              : dragOffset.x < -50
                              ? 'linear-gradient(225deg, rgba(16, 185, 129, 0.3) 0%, transparent 100%)'
                              : 'linear-gradient(135deg, rgba(0, 0, 0, 0.2) 0%, transparent 100%)'
                            : 'linear-gradient(135deg, rgba(0, 0, 0, 0.2) 0%, transparent 100%)'
                        }}
                      />

                      <div className="relative z-10 text-center px-6">
                        <motion.h2
                          className="text-3xl font-bold mb-4"
                          animate={{
                            scale: isDragging ? 1.05 : 1
                          }}
                        >
                          {items2[current].name}
                        </motion.h2>
                        <div className="text-sm opacity-80">
                          Drag left or right
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      className="text-center"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <div className="text-6xl mb-4">🎉</div>
                      <h2 className="text-2xl font-bold text-gray-800 mb-2">
                        All done! Time for a quick quiz.
                      </h2>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Navigation Buttons */}
              {!finished && items2[current] && (
                <div className="flex justify-center gap-4 mb-6">
                  <motion.button
                    className="flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => handleSwipe('left')}
                    disabled={isProcessingSwipe}
                    whileHover={{ scale: isProcessingSwipe ? 1 : 1.05 }}
                    whileTap={{ scale: isProcessingSwipe ? 1 : 0.95 }}
                  >
                    <ArrowLeft className="w-5 h-5" />
                    NEED
                  </motion.button>

                  <motion.button
                    className="flex items-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => handleSwipe('right')}
                    disabled={isProcessingSwipe}
                    whileHover={{ scale: isProcessingSwipe ? 1 : 1.05 }}
                    whileTap={{ scale: isProcessingSwipe ? 1 : 0.95 }}
                  >
                    WANT
                    <ArrowRight className="w-5 h-5" />
                  </motion.button>
                </div>
              )}

              {/* Pagination Dots */}
              <div className="flex justify-center gap-2 mb-6">
                {items2.map((_, index) => (
                  <motion.div
                    key={index}
                    className={`w-3 h-3 rounded-full ${
                      index < current ? 'bg-green-500' :
                      index === current ? 'bg-blue-500' : 'bg-gray-300'
                    }`}
                    animate={{ scale: index === current ? 1.2 : 1 }}
                  />
                ))}
              </div>

              {/* Feedback - Positioned below card like Tinder */}
              <AnimatePresence>
                {feedback && (
                  <motion.div
                    className="flex justify-center mt-4"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ type: "spring", duration: 0.3 }}
                  >
                    <div className={`px-8 py-4 rounded-xl font-bold text-white text-lg shadow-2xl ${
                      feedback.includes('Correct') ? 'bg-green-500' : 'bg-red-500'
                    }`}>
                      {feedback}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Skip to Quiz button in Review Mode */}
              {isReviewMode && !finished && (
                <motion.div
                  className="flex justify-center mt-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <motion.button
                    className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-xl shadow-lg"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setFinished(true);
                      setShowQuiz(true);
                    }}
                  >
                    Skip to Quiz →
                  </motion.button>
                </motion.div>
              )}
            </div>
          )}

          {/* ENHANCED QUIZ - CaseStudy Style */}
          {showQuiz && !showGray && (
            <div className="p-4 sm:p-8">
              {/* Review Mode Banner in Quiz */}
              {isReviewMode && (
                <motion.div
                  className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-sm text-center"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <span className="font-semibold">Review Mode:</span> Correct answers are highlighted.
                </motion.div>
              )}

              {quizComplete && !isReviewMode ? (
                // Quiz Complete Screen
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="max-w-xl w-full text-center mx-auto py-8"
                >
                  <div className={`w-24 h-24 sm:w-32 sm:h-32 mx-auto rounded-full flex items-center justify-center mb-6 shadow-2xl ${
                    Math.round((quizCorrect / quiz.length) * 100) >= 80 ? 'bg-green-500' : 'bg-amber-500'
                  }`}>
                    <span className="text-4xl sm:text-5xl">
                      {Math.round((quizCorrect / quiz.length) * 100) >= 80 ? '🎉' : '📚'}
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-4xl font-black text-gray-900 mb-2">
                    {Math.round((quizCorrect / quiz.length) * 100) >= 80 ? 'Great Job!' : 'Keep Learning!'}
                  </h2>
                  <p className="text-lg sm:text-xl text-gray-500 mb-8">
                    You scored <span className="font-bold text-gray-900">{quizCorrect} out of {quiz.length}</span> on the quiz.
                  </p>
                  <motion.button
                    className="w-full max-w-sm py-4 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold text-lg transition-colors shadow-lg"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleQuizNext}
                  >
                    See Final Results →
                  </motion.button>
                </motion.div>
              ) : (
                // Quiz Questions
                <div className="max-w-4xl w-full mx-auto">
                  {/* Question Header */}
                  <div className="flex justify-between items-end mb-6 border-b border-gray-100 pb-4">
                    <div>
                      <span className="text-xs sm:text-sm font-bold text-purple-600 uppercase tracking-wider block mb-2">
                        Question {quizIndex + 1} of {quiz.length}
                      </span>
                      <h2 className="text-lg sm:text-2xl lg:text-3xl font-bold text-gray-900 leading-tight">
                        {currentQuizQuestion.question}
                      </h2>
                    </div>
                    <div className="hidden sm:block text-purple-200">
                      <Zap size={40} />
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-gray-100 h-2 rounded-full mb-8">
                    <motion.div
                      className="bg-purple-500 h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${((quizIndex + 1) / quiz.length) * 100}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>

                  {/* Answer Options - CaseStudy Style */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    {currentQuizQuestion.options.map((option, idx) => {
                      const isSelected = selectedAnswer === option;
                      const isCorrect = option === currentQuizQuestion.answer;
                      const showCorrectness = showResult && (isSelected || isCorrect);
                      const isReviewCorrect = isReviewMode && isCorrect;

                      return (
                        <motion.button
                          key={idx}
                          onClick={() => !isReviewMode && handleQuizAnswerSelect(option)}
                          disabled={showResult || isReviewMode}
                          className={`p-4 sm:p-6 rounded-xl text-left border-2 transition-all flex items-start gap-3 sm:gap-4 ${
                            isReviewCorrect
                              ? 'bg-green-50 border-green-500 text-green-900'
                              : isReviewMode
                              ? 'bg-gray-50 border-gray-200 text-gray-400 opacity-60'
                              : showCorrectness
                              ? isCorrect
                                ? 'bg-green-50 border-green-500 text-green-900'
                                : isSelected
                                ? 'bg-red-50 border-red-500 text-red-900'
                                : 'bg-white border-gray-100 opacity-50'
                              : isSelected
                              ? 'bg-purple-50 border-purple-600 shadow-lg scale-[1.02]'
                              : 'bg-white border-gray-200 hover:border-purple-400 hover:shadow-md'
                          }`}
                          whileHover={!showResult && !isReviewMode ? { scale: 1.02 } : {}}
                          whileTap={!showResult && !isReviewMode ? { scale: 0.98 } : {}}
                        >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                            isReviewCorrect ? 'bg-green-500 text-white' :
                            showCorrectness && isCorrect ? 'bg-green-500 text-white' :
                            showCorrectness && isSelected ? 'bg-red-500 text-white' :
                            isSelected ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-500'
                          }`}>
                            {String.fromCharCode(65 + idx)}
                          </div>
                          <span className="text-sm sm:text-lg font-medium leading-snug flex-1">{option}</span>
                          {(showCorrectness && isCorrect) || isReviewCorrect ? (
                            <span className="ml-auto text-green-600 shrink-0">✓</span>
                          ) : null}
                          {showCorrectness && isSelected && !isCorrect && (
                            <span className="ml-auto text-red-600 shrink-0">✗</span>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>

                  {/* Teaching Point - Shows after answer selection */}
                  {showResult && !isReviewMode && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-6 bg-gray-900 text-white p-4 sm:p-6 rounded-2xl flex flex-col md:flex-row items-center gap-4 sm:gap-6 shadow-xl"
                    >
                      <div className="flex-1">
                        <h4 className="font-bold text-purple-400 uppercase tracking-wider text-xs sm:text-sm mb-2">
                          {selectedAnswer === currentQuizQuestion.answer ? '✓ Correct!' : '✗ Not quite...'}
                        </h4>
                        <p className="text-sm sm:text-base leading-relaxed text-gray-200">
                          {currentQuizQuestion.teaching_point}
                        </p>
                      </div>
                      <motion.button
                        onClick={handleNextQuestion}
                        className="w-full md:w-auto px-6 py-3 bg-white text-gray-900 rounded-xl font-bold hover:bg-purple-50 transition-colors whitespace-nowrap"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {quizIndex < quiz.length - 1 ? 'Next Question' : 'See Results'}
                      </motion.button>
                    </motion.div>
                  )}

                  {/* Review Mode Navigation */}
                  {isReviewMode && (
                    <motion.div
                      className="mt-8 text-center"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <div className="bg-blue-50 p-4 rounded-xl mb-4 text-left">
                        <h4 className="font-bold text-blue-800 text-sm mb-1">Teaching Point:</h4>
                        <p className="text-blue-700 text-sm">{currentQuizQuestion.teaching_point}</p>
                      </div>
                      <motion.button
                        className="px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl shadow-lg transition-colors text-lg"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          if (quizIndex < quiz.length - 1) {
                            setQuizIndex(quizIndex + 1);
                          } else {
                            navigate('/game');
                          }
                        }}
                      >
                        {quizIndex < quiz.length - 1 ? 'Next Question →' : 'Finish Review'}
                      </motion.button>
                    </motion.div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ENHANCED COMPLETION SECTION */}
          {showGray && (
            <div className="p-8 text-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
              >
                {/* Score Display */}
                <div className="bg-gray-100 rounded-xl p-6 mb-6">
                  <div className="text-5xl mb-2">
                    {(() => {
                      const totalQuestions = items2.length + quiz.length;
                      const totalCorrect = swipeCorrect + quizCorrect;
                      const percentage = Math.round((totalCorrect / totalQuestions) * 100);
                      return percentage === 100 ? '🎉' : percentage >= 80 ? '👍' : '📚';
                    })()}
                  </div>
                  <div className="text-4xl font-bold text-blue-600 mb-1">
                    {Math.min(100, Math.round(((swipeCorrect + quizCorrect) / (items2.length + quiz.length)) * 100))}%
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    {swipeCorrect + quizCorrect} of {items2.length + quiz.length} correct
                  </div>
                  <div className={`text-sm font-semibold ${
                    Math.min(100, Math.round(((swipeCorrect + quizCorrect) / (items2.length + quiz.length)) * 100)) === 100
                      ? 'text-green-600'
                      : 'text-orange-600'
                  }`}>
                    {Math.min(100, Math.round(((swipeCorrect + quizCorrect) / (items2.length + quiz.length)) * 100)) === 100
                      ? '✅ Module Passed!'
                      : 'Need 100% to pass'}
                  </div>
                  {isSaving && <div className="text-gray-500 mt-2">Saving score...</div>}
                </div>

                <div className="text-6xl mb-6">⚖️</div>
                <h1 className="text-3xl font-bold text-gray-800 mb-4">Context Matters!</h1>
                <p className="text-lg text-gray-600 mb-8">
                  Remember: Some items can be both needs and wants depending on the situation.
                </p>

                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 mb-8 border border-blue-200">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Examples:</h3>
                  <div className="space-y-3 text-left max-w-md mx-auto">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">📱</span>
                      <span><strong>Phone:</strong> Need for work, Want for entertainment</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🚗</span>
                      <span><strong>Car:</strong> Need in rural areas, Want in cities with transit</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🌐</span>
                      <span><strong>Internet:</strong> Need for remote work, Want for streaming</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 justify-center flex-wrap">
                  {Math.min(100, Math.round(((swipeCorrect + quizCorrect) / (items2.length + quiz.length)) * 100)) < 100 ? (
                    <>
                      <motion.button
                        className="flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl shadow-lg transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          // Reinitialize items to get fresh set of questions
                          setItems(getRandomItem(hardcodedItems, 8));
                          setItems2(getRandomItem(hardcodedItems, 8));
                          setShuffledQuiz([]);
                          setStep(1);
                          setSelected([]);
                          setCurrent(0);
                          setShowQuiz(false);
                          setShowGray(false);
                          setFinished(false);
                          setQuizIndex(0);
                          setQuizComplete(false);
                          setFeedback("");
                          setSelectedAnswer(null);
                          setShowResult(false);
                          setSwipeDirection(null);
                          setDragOffset({ x: 0, y: 0 });
                          setSwipeCorrect(0);
                          setQuizCorrect(0);
                          setScoreSaved(false);
                          setIsProcessingSwipe(false);
                          setShowCompletionScreen(false);
                        }}
                      >
                        <RotateCcw className="w-5 h-5" />
                        Retake Module
                      </motion.button>
                      <motion.button
                        className="flex items-center gap-2 px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-xl shadow-lg transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate('/game')}
                      >
                        Back to Roadmap
                      </motion.button>
                    </>
                  ) : (
                    <motion.button
                      className="flex items-center gap-2 px-8 py-4 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl shadow-lg transition-colors text-lg"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigate('/game')}
                    >
                      Continue to Next Module
                    </motion.button>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
