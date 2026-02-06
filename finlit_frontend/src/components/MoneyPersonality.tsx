import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  RefreshCw,
  CheckCircle2,
  Sparkles,
  Users,
  Trophy,
  Lightbulb,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Home,
  Loader2,
} from 'lucide-react';
import { useAuthContext } from '../auth/context/AuthContext';
import {
  MONEY_PERSONALITIES,
  PERSONALITY_QUESTIONS,
  calculatePersonality,
  getPersonalityById,
  type MoneyPersonalityType,
} from '../data/moneyPersonalityData';
import {
  saveMoneyPersonalityResult,
  getMoneyPersonalityResult,
} from '../firebase/firestore.service';

// Personality card component for displaying all types
const PersonalityCard: React.FC<{
  personality: MoneyPersonalityType;
  isSelected?: boolean;
  showDetails?: boolean;
  onClick?: () => void;
}> = ({ personality, isSelected, showDetails = false, onClick }) => {
  const [expanded, setExpanded] = useState(showDetails);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border-2 transition-all duration-300 overflow-hidden ${
        isSelected
          ? 'border-blue-500 shadow-lg shadow-blue-100'
          : 'border-gray-200 hover:border-gray-300'
      } ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <div className={`p-4 ${personality.bgColor}`}>
        <div className="flex items-center gap-3">
          <span className="text-4xl">{personality.emoji}</span>
          <div>
            <h3 className="font-bold text-gray-800 text-lg">{personality.name}</h3>
            <p className="text-sm text-gray-600">{personality.tagline}</p>
          </div>
          {isSelected && (
            <CheckCircle2 className="w-6 h-6 text-blue-500 ml-auto" />
          )}
        </div>
      </div>

      <div className="p-4 bg-white">
        <p className="text-gray-600 text-sm">{personality.description}</p>

        {(showDetails || expanded) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="mt-4 space-y-4"
          >
            <div>
              <div className="flex items-center gap-2 text-emerald-600 font-medium mb-2">
                <Trophy className="w-4 h-4" />
                <span>Strengths</span>
              </div>
              <ul className="space-y-1">
                {personality.strengths.map((strength, i) => (
                  <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                    <span className="text-emerald-500 mt-1">+</span>
                    {strength}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <div className="flex items-center gap-2 text-amber-600 font-medium mb-2">
                <AlertTriangle className="w-4 h-4" />
                <span>Challenges</span>
              </div>
              <ul className="space-y-1">
                {personality.challenges.map((challenge, i) => (
                  <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                    <span className="text-amber-500 mt-1">!</span>
                    {challenge}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <div className="flex items-center gap-2 text-blue-600 font-medium mb-2">
                <Lightbulb className="w-4 h-4" />
                <span>Tips for You</span>
              </div>
              <ul className="space-y-1">
                {personality.tips.map((tip, i) => (
                  <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                    <span className="text-blue-500 mt-1">*</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}

        {!showDetails && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
            className="mt-3 text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            {expanded ? (
              <>
                <ChevronUp className="w-4 h-4" />
                Show less
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                Show details
              </>
            )}
          </button>
        )}
      </div>
    </motion.div>
  );
};

// Quiz view component
const QuizView: React.FC<{
  onComplete: (answers: number[]) => void;
}> = ({ onComplete }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  const question = PERSONALITY_QUESTIONS[currentQuestion];
  const progress = ((currentQuestion + 1) / PERSONALITY_QUESTIONS.length) * 100;

  const handleNext = () => {
    if (selectedOption === null) return;

    const newAnswers = [...answers, selectedOption];
    setAnswers(newAnswers);

    if (currentQuestion < PERSONALITY_QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedOption(null);
    } else {
      onComplete(newAnswers);
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setSelectedOption(answers[currentQuestion - 1] ?? null);
      setAnswers(answers.slice(0, -1));
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-gray-500 mb-2">
          <span>Question {currentQuestion + 1} of {PERSONALITY_QUESTIONS.length}</span>
          <span>{Math.round(progress)}% complete</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
          />
        </div>
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
        >
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6">
            {question.question}
          </h2>

          <div className="space-y-3">
            {question.options.map((option, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => setSelectedOption(index)}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                  selectedOption === index
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <span className="text-gray-700">{option.text}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        <button
          onClick={handleBack}
          disabled={currentQuestion === 0}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all ${
            currentQuestion === 0
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>

        <button
          onClick={handleNext}
          disabled={selectedOption === null}
          className={`flex items-center gap-2 px-8 py-3 rounded-xl font-medium transition-all ${
            selectedOption === null
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 shadow-md hover:shadow-lg'
          }`}
        >
          {currentQuestion === PERSONALITY_QUESTIONS.length - 1 ? (
            <>
              See Results
              <Sparkles className="w-5 h-5" />
            </>
          ) : (
            <>
              Next
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

// Results view component
const ResultsView: React.FC<{
  primary: MoneyPersonalityType;
  secondary: MoneyPersonalityType | null;
  scores: { [personalityId: string]: number };
  onRetake: () => void;
}> = ({ primary, secondary, scores, onRetake }) => {
  const navigate = useNavigate();
  const [showAllPersonalities, setShowAllPersonalities] = useState(false);

  // Calculate max score for percentage display
  const maxScore = Math.max(...Object.values(scores));

  return (
    <div className="max-w-4xl mx-auto">
      {/* Your Result */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-4">
          <Sparkles className="w-4 h-4" />
          Your Money Personality
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
          You are: {primary.emoji} {primary.name}
        </h1>
        <p className="text-lg text-gray-600">{primary.tagline}</p>
      </motion.div>

      {/* Primary personality card with full details */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <PersonalityCard personality={primary} isSelected showDetails />
      </motion.div>

      {/* Secondary personality if applicable */}
      {secondary && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <p className="text-sm text-gray-500 mb-3 flex items-center gap-2">
            <Users className="w-4 h-4" />
            You also have strong traits of:
          </p>
          <PersonalityCard personality={secondary} />
        </motion.div>
      )}

      {/* Score breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl border border-gray-200 p-6 mb-6"
      >
        <h3 className="font-bold text-gray-800 mb-4">Your Score Breakdown</h3>
        <div className="space-y-3">
          {MONEY_PERSONALITIES.map((personality) => {
            const score = scores[personality.id] || 0;
            const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;

            return (
              <div key={personality.id} className="flex items-center gap-3">
                <span className="text-2xl w-10">{personality.emoji}</span>
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700">{personality.name}</span>
                    <span className="text-gray-500">{score} pts</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ delay: 0.5, duration: 0.5 }}
                      className={`h-full rounded-full bg-gradient-to-r ${personality.color}`}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* See all personalities */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mb-8"
      >
        <button
          onClick={() => setShowAllPersonalities(!showAllPersonalities)}
          className="w-full p-4 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 text-gray-700 font-medium flex items-center justify-center gap-2 transition-all"
        >
          <Users className="w-5 h-5" />
          {showAllPersonalities ? 'Hide' : 'Explore'} All Personality Types
          {showAllPersonalities ? (
            <ChevronUp className="w-5 h-5" />
          ) : (
            <ChevronDown className="w-5 h-5" />
          )}
        </button>

        <AnimatePresence>
          {showAllPersonalities && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-4 grid gap-4 md:grid-cols-2"
            >
              {MONEY_PERSONALITIES.filter((p) => p.id !== primary.id).map(
                (personality) => (
                  <PersonalityCard key={personality.id} personality={personality} />
                )
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Action buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex flex-col sm:flex-row gap-4 justify-center"
      >
        <button
          onClick={onRetake}
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl border-2 border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-all"
        >
          <RefreshCw className="w-5 h-5" />
          Retake Quiz
        </button>
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium hover:from-blue-600 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all"
        >
          <Home className="w-5 h-5" />
          Back to Dashboard
        </button>
      </motion.div>
    </div>
  );
};

// Main component
const MoneyPersonality: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [existingResult, setExistingResult] = useState<{
    primary: MoneyPersonalityType;
    secondary: MoneyPersonalityType | null;
    scores: { [personalityId: string]: number };
  } | null>(null);
  const [quizResult, setQuizResult] = useState<{
    primary: MoneyPersonalityType;
    secondary: MoneyPersonalityType | null;
    scores: { [personalityId: string]: number };
  } | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [xpAwarded, setXpAwarded] = useState(0);

  // Load existing personality result
  useEffect(() => {
    const loadExistingResult = async () => {
      if (!user) return;

      try {
        const result = await getMoneyPersonalityResult(user.id);
        if (result) {
          const primary = getPersonalityById(result.primaryPersonalityId);
          const secondary = result.secondaryPersonalityId
            ? getPersonalityById(result.secondaryPersonalityId)
            : null;

          if (primary) {
            setExistingResult({
              primary,
              secondary: secondary || null,
              scores: result.scores,
            });
          }
        }
      } catch (error) {
        console.error('Error loading personality result:', error);
      } finally {
        setLoading(false);
      }
    };

    loadExistingResult();
  }, [user]);

  // Handle quiz completion
  const handleQuizComplete = async (answers: number[]) => {
    if (!user) return;

    const result = calculatePersonality(answers);
    setQuizResult(result);
    setSaving(true);

    try {
      const { xpAwarded: xp } = await saveMoneyPersonalityResult(
        user.id,
        result.primary.id,
        result.secondary?.id || null,
        result.scores,
        answers
      );
      setXpAwarded(xp);
      setExistingResult(result);
    } catch (error) {
      console.error('Error saving personality result:', error);
    } finally {
      setSaving(false);
    }
  };

  // Handle retake
  const handleRetake = () => {
    setQuizResult(null);
    setShowQuiz(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your personality profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Back to Dashboard</span>
          </button>
          <h1 className="font-bold text-gray-800 flex items-center gap-2">
            <span className="text-2xl">🧠</span>
            Money Personality
          </h1>
          <div className="w-20" /> {/* Spacer for centering */}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Show XP award notification */}
        <AnimatePresence>
          {xpAwarded > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 p-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl flex items-center justify-center gap-2 font-medium"
            >
              <Sparkles className="w-5 h-5" />
              You earned {xpAwarded} XP for discovering your money personality!
            </motion.div>
          )}
        </AnimatePresence>

        {saving && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 text-center">
              <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Saving your results...</p>
            </div>
          </div>
        )}

        {/* Quiz or Results */}
        {quizResult ? (
          <ResultsView
            primary={quizResult.primary}
            secondary={quizResult.secondary}
            scores={quizResult.scores}
            onRetake={handleRetake}
          />
        ) : showQuiz ? (
          <QuizView onComplete={handleQuizComplete} />
        ) : existingResult ? (
          <ResultsView
            primary={existingResult.primary}
            secondary={existingResult.secondary}
            scores={existingResult.scores}
            onRetake={handleRetake}
          />
        ) : (
          /* Intro screen */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto text-center"
          >
            <div className="text-6xl mb-6">🧠💰</div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              What's Your Money Personality?
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Discover your unique relationship with money. This quick quiz will help
              you understand your financial tendencies, strengths, and areas for growth.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
              {MONEY_PERSONALITIES.map((personality) => (
                <div
                  key={personality.id}
                  className={`p-4 rounded-xl ${personality.bgColor} text-center`}
                >
                  <span className="text-3xl">{personality.emoji}</span>
                  <p className="text-sm font-medium text-gray-700 mt-2">
                    {personality.name}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex flex-col items-center gap-4">
              <button
                onClick={() => setShowQuiz(true)}
                className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold text-lg rounded-xl hover:from-blue-600 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
              >
                <Sparkles className="w-6 h-6" />
                Start the Quiz
              </button>
              <p className="text-sm text-gray-500">
                Takes about 2-3 minutes * {PERSONALITY_QUESTIONS.length} questions
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default MoneyPersonality;
