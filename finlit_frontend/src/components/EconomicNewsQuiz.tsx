import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, ArrowRight, ArrowLeft, Star, Loader2, Zap, Trophy, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useModuleScore } from '../hooks/useModuleScore';
import type { QuizQuestion, QuickQuizProgress } from '../auth/types/auth.types';

// Default questions (used when no Firestore questions exist)
const DEFAULT_QUESTIONS: Omit<QuizQuestion, 'id' | 'createdAt' | 'createdBy'>[] = [
  {
    question: "Which country recently delayed its expected interest rate cut after inflation data came in higher than expected?",
    options: ["United States", "United Kingdom", "Australia", "Turkey"],
    correct: 1,
    explanation: "United Kingdom — analysts pushed the Bank of England's rate-cut forecast to March 2026 after stronger inflation readings.",
    emoji: "📊"
  },
  {
    question: "Turkey's central bank recently cut interest rates, but by less than expected. What was the main reason given?",
    options: ["Deflation concerns", "Political pressure", "Persistent inflation worries", "Falling currency"],
    correct: 2,
    explanation: "Persistent inflation worries — inflation is still high so the cut was smaller than markets expected.",
    emoji: "🏦"
  },
  {
    question: "What major policy proposal at the World Economic Forum is stirring debate in U.S. financial markets?",
    options: ["Higher corporate taxes", "A cap on credit card interest rates", "New tariffs on Chinese goods", "A new digital dollar"],
    correct: 1,
    explanation: "A cap on credit card interest rates — a proposed 10% cap is controversial among bankers and economists.",
    emoji: "💳"
  },
  {
    question: "Recent jobs data in Australia surprised markets by showing:",
    options: ["A sharp rise in unemployment", "Inflation dropping sharply", "A lower unemployment rate than expected", "A freeze on job growth"],
    correct: 2,
    explanation: "A lower unemployment rate than expected — the rate unexpectedly fell, fueling speculation about rate hikes.",
    emoji: "💼"
  },
  {
    question: "In the U.S. economic news cycle, what remains strong and supports consumer spending?",
    options: ["Housing prices", "Consumer spending and wages", "Export demand", "Manufacturing output"],
    correct: 1,
    explanation: "Consumer spending and wages — household finances remain resilient.",
    emoji: "💰"
  },
  {
    question: "Markets have recently reacted positively when inflation data came in cooler, leading to gains in:",
    options: ["Real estate bonds", "Energy prices", "U.S. major stock indices", "Gold only"],
    correct: 2,
    explanation: "U.S. major stock indices — cooler inflation readings helped lift stocks.",
    emoji: "📈"
  },
  {
    question: "Why might the Federal Reserve not cut interest rates soon, despite recent rate cuts in 2025?",
    options: ["Inflation is already zero", "The economy is shrinking rapidly", "Jobs and price pressures still look relatively strong", "Banks refuse to lend money"],
    correct: 2,
    explanation: "Jobs and price pressures still look relatively strong — strong labor and inflation data make immediate cuts unlikely.",
    emoji: "🏛️"
  }
];

const EconomicNewsQuiz: React.FC = () => {
  const navigate = useNavigate();
  const { loadQuizQuestions, saveQuizAnswer, loadQuizProgress, getQuizVersion } = useModuleScore();

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [quizVersion, setQuizVersion] = useState<string>('');
  const [savedProgress, setSavedProgress] = useState<QuickQuizProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [answeredQuestions, setAnsweredQuestions] = useState<{ [id: string]: number }>({});
  const [xpEarned, setXpEarned] = useState(0);
  const [showXpAnimation, setShowXpAnimation] = useState(false);
  const [isReviewMode, setIsReviewMode] = useState(false);

  // Load questions and progress on mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Load questions from Firestore
        const firestoreQuestions = await loadQuizQuestions();

        let finalQuestions: QuizQuestion[];
        let version: string;

        if (firestoreQuestions.length > 0) {
          finalQuestions = firestoreQuestions;
          version = await getQuizVersion();
        } else {
          // Use default questions with generated IDs
          finalQuestions = DEFAULT_QUESTIONS.map((q, idx) => ({
            ...q,
            id: `default-${idx}`,
            createdAt: new Date(),
            createdBy: 'system',
          }));
          version = `default-v${DEFAULT_QUESTIONS.length}`;
        }

        setQuestions(finalQuestions);
        setQuizVersion(version);

        // Load saved progress
        const progress = await loadQuizProgress(version);
        if (progress) {
          setSavedProgress(progress);

          // Filter answered questions to only include questions that still exist
          const currentQuestionIds = new Set(finalQuestions.map(q => q.id));
          const filteredAnswered: { [id: string]: number } = {};
          const validCorrectAnswers: string[] = [];

          for (const [questionId, answer] of Object.entries(progress.answeredQuestions)) {
            if (currentQuestionIds.has(questionId)) {
              filteredAnswered[questionId] = answer;
            }
          }

          for (const questionId of progress.correctAnswers) {
            if (currentQuestionIds.has(questionId)) {
              validCorrectAnswers.push(questionId);
            }
          }

          setAnsweredQuestions(filteredAnswered);

          // Find first unanswered question
          const firstUnanswered = finalQuestions.findIndex(q => filteredAnswered[q.id] === undefined);
          if (firstUnanswered !== -1) {
            setCurrentQuestion(firstUnanswered);
          } else {
            // All questions answered - stay at last question or show completion
            setCurrentQuestion(finalQuestions.length); // This triggers completion view
          }
        }
      } catch (err) {
        console.error('Error loading quiz data:', err);
        // Fallback to default questions
        const fallbackQuestions = DEFAULT_QUESTIONS.map((q, idx) => ({
          ...q,
          id: `default-${idx}`,
          createdAt: new Date(),
          createdBy: 'system',
        }));
        setQuestions(fallbackQuestions);
        setQuizVersion(`default-v${DEFAULT_QUESTIONS.length}`);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [loadQuizQuestions, loadQuizProgress, getQuizVersion]);

  const handleAnswerSelect = (index: number) => {
    if (showResult) return;
    setSelectedAnswer(index);
  };

  const handleSubmit = async () => {
    if (selectedAnswer === null || questions.length === 0) return;

    const currentQ = questions[currentQuestion];
    const isCorrect = selectedAnswer === currentQ.correct;
    const alreadyAnsweredThis = answeredQuestions[currentQ.id] !== undefined;

    setShowResult(true);

    if (!alreadyAnsweredThis) {
      // Update local state
      const newAnswered = { ...answeredQuestions, [currentQ.id]: selectedAnswer };
      setAnsweredQuestions(newAnswered);

      // Save to Firestore and award XP
      const result = await saveQuizAnswer(currentQ.id, selectedAnswer, isCorrect, quizVersion);
      if (result.xpAwarded > 0) {
        setXpEarned(prev => prev + result.xpAwarded);
        setShowXpAnimation(true);
        setTimeout(() => setShowXpAnimation(false), 2000);
      }
    }
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      // End of quiz - exit review mode to show completion screen
      setIsReviewMode(false);
      setCurrentQuestion(questions.length); // Trigger completion view
    }
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-lg text-gray-600">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center p-4">
        <div className="text-center bg-white rounded-lg p-8 shadow-sm max-w-md">
          <p className="text-lg text-gray-600 mb-4">No quiz questions available.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Calculate how many questions are answered (only count questions that exist)
  const currentQuestionIds = new Set(questions.map(q => q.id));
  const answeredCount = Object.keys(answeredQuestions).filter(id => currentQuestionIds.has(id)).length;
  const allAnswered = answeredCount >= questions.length;

  // Recalculate actual correct count based on current questions only
  const actualCorrectCount = questions.filter(q => {
    const userAnswer = answeredQuestions[q.id];
    return userAnswer !== undefined && userAnswer === q.correct;
  }).length;

  const percentage = questions.length > 0 ? Math.round((actualCorrectCount / questions.length) * 100) : 0;

  // Quiz completion screen - shown when all questions are answered (and not in review mode)
  if ((allAnswered || currentQuestion >= questions.length) && !isReviewMode) {
    return (
      <div className="min-h-screen bg-blue-50 flex flex-col">
        {/* Header */}
        <header className="bg-blue-100 p-3 sm:p-4 flex justify-between items-center border-b border-blue-200">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-blue-700 hover:text-blue-900 font-semibold text-sm sm:text-lg transition"
          >
            <ArrowLeft size={18} />
            <span className="hidden sm:inline">Back to Dashboard</span>
            <span className="sm:hidden">Back</span>
          </button>
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-blue-700">Global Economic News Quiz</h1>
          <div className="flex items-center gap-2 bg-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg shadow-sm">
            <Star className="text-yellow-500 fill-yellow-500" size={16} />
            <span className="text-sm sm:text-lg font-bold text-gray-700">{actualCorrectCount}/{questions.length}</span>
          </div>
        </header>

        {/* Completion Content */}
        <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
          <div className="max-w-lg w-full">
            <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 text-center">
              {/* Trophy Icon */}
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Trophy className="text-white" size={40} />
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Quiz Complete!</h2>
              <p className="text-gray-600 mb-6">You've answered all questions for today.</p>

              {/* Score Display */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 rounded-xl p-4">
                  <p className="text-2xl sm:text-3xl font-bold text-blue-600">{actualCorrectCount}</p>
                  <p className="text-xs sm:text-sm text-blue-700">Correct</p>
                </div>
                <div className="bg-emerald-50 rounded-xl p-4">
                  <p className="text-2xl sm:text-3xl font-bold text-emerald-600">{percentage}%</p>
                  <p className="text-xs sm:text-sm text-emerald-700">Accuracy</p>
                </div>
                <div className="bg-amber-50 rounded-xl p-4">
                  <p className="text-2xl sm:text-3xl font-bold text-amber-600">{actualCorrectCount * 3}</p>
                  <p className="text-xs sm:text-sm text-amber-700">XP Earned</p>
                </div>
              </div>

              {/* Message based on score */}
              {percentage >= 70 ? (
                <div className="bg-emerald-100 border border-emerald-300 rounded-xl p-4 mb-6">
                  <p className="text-emerald-800 font-semibold">
                    Excellent! You have a strong grasp of current economic events!
                  </p>
                </div>
              ) : (
                <div className="bg-amber-100 border border-amber-300 rounded-xl p-4 mb-6">
                  <p className="text-amber-800 font-semibold">
                    Keep learning! Understanding economic news helps make informed financial decisions.
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    setCurrentQuestion(0);
                    setShowResult(false);
                    setSelectedAnswer(null);
                    setIsReviewMode(true);
                  }}
                  className="flex-1 py-3 px-6 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
                >
                  <RotateCcw size={18} />
                  Review Answers
                </button>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="flex-1 py-3 px-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all flex items-center justify-center gap-2"
                >
                  Back to Dashboard
                  <ArrowRight size={18} />
                </button>
              </div>

              <p className="text-xs text-gray-500 mt-4">
                New questions will be available when they are updated by the admin.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Progress calculation based on answered questions
  const progress = (answeredCount / questions.length) * 100;
  const currentQ = questions[currentQuestion];
  const wasAlreadyAnswered = answeredQuestions[currentQ.id] !== undefined;
  const previousAnswer = answeredQuestions[currentQ.id];

  return (
    <div className="min-h-screen bg-blue-50 flex flex-col">
      {/* Header */}
      <header className="bg-blue-100 p-3 sm:p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-blue-200">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-blue-700 hover:text-blue-900 font-semibold text-sm sm:text-lg transition"
        >
          <ArrowLeft size={18} className="sm:w-5 sm:h-5" />
          <span className="hidden sm:inline">Back to Dashboard</span>
          <span className="sm:hidden">Back</span>
        </button>
        <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-blue-700">Global Economic News Quiz</h1>
        <div className="flex items-center gap-3">
          {xpEarned > 0 && (
            <div className={`flex items-center gap-1 bg-emerald-100 px-3 py-1.5 rounded-lg ${showXpAnimation ? 'animate-pulse' : ''}`}>
              <Zap className="text-emerald-600" size={16} />
              <span className="text-sm font-bold text-emerald-700">+{xpEarned} XP</span>
            </div>
          )}
          <div className="flex items-center gap-2 bg-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg shadow-sm">
            <Star className="text-yellow-500 fill-yellow-500" size={16} />
            <span className="text-sm sm:text-lg font-bold text-gray-700">{actualCorrectCount}/{questions.length}</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          {/* Progress Bar */}
          <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-gray-100 mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 gap-2">
              <div className="flex items-center gap-3">
                <span className="text-sm sm:text-lg font-semibold text-gray-700">Question {currentQuestion + 1} of {questions.length}</span>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                  {answeredCount}/{questions.length} answered
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm sm:text-lg font-semibold text-emerald-600">{Math.round(progress)}% Complete</span>
                <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-medium">
                  3 XP per correct answer
                </span>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 sm:h-4">
              <div
                className="bg-emerald-500 h-3 sm:h-4 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Already Answered Notice */}
          {wasAlreadyAnswered && !showResult && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <p className="text-sm font-medium text-amber-800">You've already answered this question. Your previous answer is saved.</p>
              <button
                onClick={handleNext}
                className="px-4 py-2 bg-amber-600 text-white text-sm font-semibold rounded-lg hover:bg-amber-700 transition-all flex items-center gap-2 whitespace-nowrap"
              >
                {currentQuestion < questions.length - 1 ? (
                  <>
                    Skip to Next
                    <ArrowRight size={16} />
                  </>
                ) : (
                  'Finish Quiz'
                )}
              </button>
            </div>
          )}

          {/* Question Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
            {/* Question Header */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 sm:p-6">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="text-3xl sm:text-4xl md:text-5xl flex-shrink-0">{currentQ.emoji}</div>
                <div className="flex-1 min-w-0">
                  <div className="inline-block px-2 sm:px-3 py-1 bg-white/20 rounded-full text-xs sm:text-sm font-semibold text-white mb-2 sm:mb-3">
                    Question {currentQuestion + 1}
                  </div>
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white leading-relaxed">
                    {currentQ.question}
                  </h2>
                </div>
              </div>
            </div>

            {/* Options */}
            <div className="p-4 sm:p-6">
              <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                {currentQ.options.map((option, index) => {
                  const isSelected = selectedAnswer === index;
                  const isCorrect = index === currentQ.correct;
                  const showCorrect = showResult && isCorrect;
                  const showIncorrect = showResult && isSelected && !isCorrect;
                  const wasPreviouslySelected = wasAlreadyAnswered && previousAnswer === index;

                  return (
                    <button
                      key={index}
                      onClick={() => handleAnswerSelect(index)}
                      disabled={showResult}
                      className={`
                        w-full p-3 sm:p-4 rounded-lg text-left text-sm sm:text-base md:text-lg transition-all duration-200 border-2
                        ${showCorrect
                          ? 'bg-emerald-100 border-emerald-500 text-emerald-900'
                          : showIncorrect
                            ? 'bg-red-100 border-red-500 text-red-900'
                            : isSelected
                              ? 'bg-blue-100 border-blue-500 text-blue-900'
                              : wasPreviouslySelected && !showResult
                                ? 'bg-gray-100 border-gray-400 text-gray-700'
                                : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-blue-50 hover:border-blue-300'
                        }
                        ${showResult ? 'cursor-not-allowed' : 'cursor-pointer'}
                      `}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                          <div className={`
                            flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm
                            ${showCorrect
                              ? 'bg-emerald-500 text-white'
                              : showIncorrect
                                ? 'bg-red-500 text-white'
                                : isSelected
                                  ? 'bg-blue-500 text-white'
                                  : 'bg-white border-2 border-gray-300 text-gray-600'
                            }
                          `}>
                            {String.fromCharCode(65 + index)}
                          </div>
                          <span className="break-words">{option}</span>
                        </div>
                        {showCorrect && <CheckCircle className="text-emerald-600 flex-shrink-0" size={20} />}
                        {showIncorrect && <XCircle className="text-red-600 flex-shrink-0" size={20} />}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Explanation */}
              {showResult && (
                <div className={`
                  p-4 sm:p-5 rounded-lg mb-4 sm:mb-6 border-2
                  ${selectedAnswer === currentQ.correct
                    ? 'bg-emerald-50 border-emerald-300'
                    : 'bg-blue-50 border-blue-300'
                  }
                `}>
                  <h3 className={`font-bold text-base sm:text-lg mb-2 ${selectedAnswer === currentQ.correct ? 'text-emerald-900' : 'text-blue-900'}`}>
                    {selectedAnswer === currentQ.correct ? '✅ Correct! +3 XP' : '💡 Learn More'}
                  </h3>
                  <p className={`text-sm sm:text-base md:text-lg ${selectedAnswer === currentQ.correct ? 'text-emerald-800' : 'text-blue-800'}`}>
                    {currentQ.explanation}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 sm:gap-4">
                {!showResult ? (
                  <button
                    onClick={handleSubmit}
                    disabled={selectedAnswer === null}
                    className="flex-1 py-2.5 sm:py-3 bg-emerald-500 text-white text-base sm:text-lg font-semibold rounded-lg hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    Submit Answer
                  </button>
                ) : (
                  <button
                    onClick={handleNext}
                    className="flex-1 py-2.5 sm:py-3 bg-blue-500 text-white text-base sm:text-lg font-semibold rounded-lg hover:bg-blue-600 transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    {currentQuestion < questions.length - 1 ? (
                      <>
                        <span className="hidden sm:inline">Next Question</span>
                        <span className="sm:hidden">Next</span>
                        <ArrowRight size={18} />
                      </>
                    ) : (
                      <>
                        <span className="hidden sm:inline">Finish & Return to Dashboard</span>
                        <span className="sm:hidden">Finish</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Score Summary at Bottom */}
          {currentQuestion === questions.length - 1 && showResult && (
            <div className="mt-4 sm:mt-6 bg-white rounded-lg shadow-sm border border-gray-100 p-4 sm:p-6">
              <div className="text-center">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">Quiz Summary</h3>
                <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-8 mb-4">
                  <div>
                    <p className="text-3xl sm:text-4xl font-bold text-blue-600">{actualCorrectCount}/{questions.length}</p>
                    <p className="text-sm sm:text-base text-gray-600">Final Score</p>
                  </div>
                  <div>
                    <p className="text-3xl sm:text-4xl font-bold text-emerald-600">{percentage}%</p>
                    <p className="text-sm sm:text-base text-gray-600">Accuracy</p>
                  </div>
                  <div>
                    <p className="text-3xl sm:text-4xl font-bold text-amber-600">{xpEarned}</p>
                    <p className="text-sm sm:text-base text-gray-600">XP Earned</p>
                  </div>
                </div>
                {percentage >= 70 ? (
                  <div className="bg-emerald-100 border border-emerald-300 rounded-lg p-3 sm:p-4">
                    <p className="text-sm sm:text-base md:text-lg text-emerald-800 font-semibold">
                      🎉 Excellent! You have a strong grasp of current economic events!
                    </p>
                  </div>
                ) : (
                  <div className="bg-amber-100 border border-amber-300 rounded-lg p-3 sm:p-4">
                    <p className="text-sm sm:text-base md:text-lg text-amber-800 font-semibold">
                      Keep learning! Understanding economic news is key to making informed financial decisions.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EconomicNewsQuiz;
