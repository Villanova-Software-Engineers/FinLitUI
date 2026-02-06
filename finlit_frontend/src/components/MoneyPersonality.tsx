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
  Info
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

// --- Components ---

const ProgressBar: React.FC<{ current: number; total: number }> = ({ current, total }) => {
  const progress = ((current + 1) / total) * 100;

  return (
    <div className="w-full mb-8">
      <div className="flex justify-between text-sm font-medium text-gray-500 mb-2 font-dm">
        <span>Question {current + 1} <span className="text-gray-400">/ {total}</span></span>
        <span className="text-brand-500">{Math.round(progress)}%</span>
      </div>
      <div className="h-3 bg-white rounded-full overflow-hidden shadow-sm border border-gray-100">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="h-full bg-gradient-to-r from-brand-400 to-brand-600 rounded-full"
        />
      </div>
    </div>
  );
};

const OptionCard: React.FC<{
  text: string;
  selected: boolean;
  onClick: () => void;
  index: number;
}> = ({ text, selected, onClick, index }) => {
  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      onClick={onClick}
      className={`w-full p-5 rounded-2xl border-2 text-left transition-all duration-200 group relative overflow-hidden ${selected
          ? 'border-brand-500 bg-brand-50 shadow-md transform scale-[1.01]'
          : 'border-white bg-white hover:border-brand-300 hover:shadow-lg hover:-translate-y-0.5'
        }`}
    >
      <div className="flex items-center justify-between relative z-10">
        <span className={`text-base md:text-lg font-medium font-dm ${selected ? 'text-brand-700' : 'text-gray-700'}`}>
          {text}
        </span>
        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${selected ? 'border-brand-500 bg-brand-500' : 'border-gray-200 group-hover:border-brand-300'
          }`}>
          {selected && <CheckCircle2 className="w-4 h-4 text-white" />}
        </div>
      </div>
    </motion.button>
  );
};

// Personality details modal/expanded view
const PersonalityDetails: React.FC<{
  personality: MoneyPersonalityType;
  onClose?: () => void;
  isModal?: boolean;
}> = ({ personality, onClose, isModal = false }) => {
  const content = (
    <div className={`bg-white rounded-3xl overflow-hidden ${isModal ? 'shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto' : 'border border-gray-100 shadow-sm'}`}>
      {/* Header */}
      <div className={`${personality.bgColor} p-6 relative`}>
        {isModal && onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white/50 hover:bg-white rounded-full transition-colors backdrop-blur-sm"
          >
            <ChevronDown className="w-5 h-5 text-gray-700" />
          </button>
        )}
        <div className="flex flex-col items-center text-center">
          <span className="text-6xl mb-4 filter drop-shadow-md">{personality.emoji}</span>
          <h2 className="text-2xl md:text-3xl font-bold text-navy-700 font-dm mb-1">{personality.name}</h2>
          <p className="text-navy-500 font-medium">{personality.tagline}</p>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <p className="text-gray-600 leading-relaxed font-dm">{personality.description}</p>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Strengths */}
          <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
            <div className="flex items-center gap-2 text-emerald-700 font-bold mb-3 font-dm">
              <Trophy className="w-5 h-5" />
              <span>Strengths</span>
            </div>
            <ul className="space-y-2">
              {personality.strengths.map((strength, i) => (
                <li key={i} className="text-sm text-emerald-900 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                  <span>{strength}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Challenges */}
          <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100">
            <div className="flex items-center gap-2 text-amber-700 font-bold mb-3 font-dm">
              <AlertTriangle className="w-5 h-5" />
              <span>Challenges</span>
            </div>
            <ul className="space-y-2">
              {personality.challenges.map((challenge, i) => (
                <li key={i} className="text-sm text-amber-900 flex items-start gap-2">
                  <span className="text-amber-500 font-bold mt-0.5 shrink-0">!</span>
                  <span>{challenge}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Tips */}
        <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
          <div className="flex items-center gap-2 text-brand-600 font-bold mb-3 font-dm">
            <Lightbulb className="w-5 h-5" />
            <span>Growth Tips</span>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {personality.tips.map((tip, i) => (
              <div key={i} className="flex items-start gap-3 bg-white p-3 rounded-lg border border-blue-100/50">
                <div className="w-6 h-6 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center shrink-0 text-xs font-bold">
                  {i + 1}
                </div>
                <span className="text-sm text-gray-600">{tip}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-900/40 backdrop-blur-sm" onClick={onClose}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-2xl"
        >
          {content}
        </motion.div>
      </div>
    );
  }

  return content;
};

const InfoCard: React.FC<{
  personality: MoneyPersonalityType;
  onClick: () => void;
}> = ({ personality, onClick }) => (
  <motion.button
    whileHover={{ y: -5, boxShadow: "0 10px 30px -10px rgba(0,0,0,0.1)" }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-left w-full h-full flex flex-col"
  >
    <div className={`w-12 h-12 rounded-xl ${personality.bgColor} flex items-center justify-center text-2xl mb-4`}>
      {personality.emoji}
    </div>
    <h3 className="font-bold text-navy-700 font-dm mb-1">{personality.name}</h3>
    <p className="text-xs text-gray-500 line-clamp-2 mb-4 flex-1">{personality.tagline}</p>
    <div className="flex items-center text-brand-500 text-sm font-medium mt-auto group">
      Learn more
      <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
    </div>
  </motion.button>
);

// --- Main Views ---

const QuizView: React.FC<{ onComplete: (answers: number[]) => void }> = ({ onComplete }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  const question = PERSONALITY_QUESTIONS[currentQuestion];

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
    <div className="max-w-3xl mx-auto py-8">
      <ProgressBar current={currentQuestion} total={PERSONALITY_QUESTIONS.length} />

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="mb-10"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-50 text-brand-600 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
            Question {currentQuestion + 1}
          </div>
          <h2 className="text-2xl md:text-4xl font-bold text-navy-700 font-dm leading-tight mb-8">
            {question.question}
          </h2>

          <div className="grid gap-4">
            {question.options.map((option, index) => (
              <OptionCard
                key={index}
                index={index}
                text={option.text}
                selected={selectedOption === index}
                onClick={() => setSelectedOption(index)}
              />
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="flex justify-between pt-6 border-t border-gray-100">
        <button
          onClick={handleBack}
          disabled={currentQuestion === 0}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all font-medium ${currentQuestion === 0
              ? 'text-gray-300 cursor-not-allowed'
              : 'text-gray-500 hover:text-navy-700 hover:bg-gray-100'
            }`}
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>

        <button
          onClick={handleNext}
          disabled={selectedOption === null}
          className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-brand-500/20 ${selectedOption === null
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
              : 'bg-brand-500 text-white hover:bg-brand-600 hover:shadow-brand-500/40 transform hover:-translate-y-0.5'
            }`}
        >
          {currentQuestion === PERSONALITY_QUESTIONS.length - 1 ? 'Reveal Results' : 'Next Question'}
          {currentQuestion === PERSONALITY_QUESTIONS.length - 1 ? <Sparkles className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
};

const ResultsView: React.FC<{
  primary: MoneyPersonalityType;
  secondary: MoneyPersonalityType | null;
  scores: { [key: string]: number };
  onRetake: () => void;
}> = ({ primary, secondary, scores, onRetake }) => {
  const navigate = useNavigate();
  const [selectedReviewPersonality, setSelectedReviewPersonality] = useState<MoneyPersonalityType | null>(null);

  // Calculate max possible score to normalize/visualize bars better (assuming max theoretical score per type ~40 based on qs)
  const maxObservedScore = Math.max(...Object.values(scores), 1);

  return (
    <div className="max-w-5xl mx-auto pb-12">
      {/* Confetti/Celebration Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-50 text-brand-700 rounded-full text-sm font-bold mb-4 shadow-sm border border-brand-100">
          <Sparkles className="w-4 h-4" />
          Personality Analysis Complete
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-navy-700 mb-4 font-dm">
          You are a <span className="text-brand-500">{primary.name}</span>
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto">{primary.tagline}</p>
      </motion.div>

      <div className="grid lg:grid-cols-12 gap-8 mb-12">
        {/* Main Result Card */}
        <div className="lg:col-span-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <PersonalityDetails personality={primary} />
          </motion.div>
        </div>

        {/* Sidebar: Breakdown & Stats */}
        <div className="lg:col-span-4 space-y-6">
          {/* Secondary Match */}
          {secondary && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm"
            >
              <h3 className="flex items-center gap-2 font-bold text-navy-700 mb-4 font-dm">
                <Users className="w-5 h-5 text-gray-400" />
                Secondary Match
              </h3>
              <div
                className="flex items-center gap-4 p-3 rounded-2xl bg-gray-50 hover:bg-white border border-transparent hover:border-gray-200 transition-all cursor-pointer"
                onClick={() => setSelectedReviewPersonality(secondary)}
              >
                <div className={`w-12 h-12 rounded-xl ${secondary.bgColor} flex items-center justify-center text-2xl shrink-0`}>
                  {secondary.emoji}
                </div>
                <div>
                  <div className="font-bold text-navy-700">{secondary.name}</div>
                  <div className="text-xs text-gray-500">View details</div>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400 ml-auto" />
              </div>
            </motion.div>
          )}

          {/* Breakdown Chart */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm"
          >
            <h3 className="font-bold text-navy-700 mb-6 font-dm">Personality Mix</h3>
            <div className="space-y-4">
              {MONEY_PERSONALITIES.map((p) => {
                const score = scores[p.id] || 0;
                const percentage = (score / maxObservedScore) * 100;
                const isPrimary = p.id === primary.id;

                return (
                  <div key={p.id}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className={`font-medium ${isPrimary ? 'text-brand-600' : 'text-gray-600'}`}>
                        {p.name}
                      </span>
                      <span className="text-gray-400 text-xs">{score} pts</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 1, delay: 0.6 }}
                        className={`h-full rounded-full ${isPrimary ? 'bg-brand-500' : 'bg-gray-300'}`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Explore Section */}
      <div className="border-t border-gray-200 pt-12">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-navy-700 font-dm mb-2">Explore All Types</h2>
          <p className="text-gray-500">Learn about other money personalities to understand friends & family</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {MONEY_PERSONALITIES.map((p) => (
            <InfoCard
              key={p.id}
              personality={p}
              onClick={() => setSelectedReviewPersonality(p)}
            />
          ))}
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
        <button
          onClick={onRetake}
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-gray-300 text-gray-600 font-medium hover:bg-gray-50 hover:text-navy-700 transition-all font-dm"
        >
          <RefreshCw className="w-5 h-5" />
          Retake Quiz
        </button>
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-brand-500 text-white font-bold hover:bg-brand-600 shadow-lg shadow-brand-500/30 hover:shadow-brand-500/50 transition-all transform hover:-translate-y-0.5 font-dm"
        >
          <Home className="w-5 h-5" />
          Back to Dashboard
        </button>
      </div>

      {/* Details Modal */}
      <AnimatePresence>
        {selectedReviewPersonality && (
          <PersonalityDetails
            personality={selectedReviewPersonality}
            isModal
            onClose={() => setSelectedReviewPersonality(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Main Page ---

const MoneyPersonality: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [existingResult, setExistingResult] = useState<{
    primary: MoneyPersonalityType;
    secondary: MoneyPersonalityType | null;
    scores: { [key: string]: number };
  } | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [xpAwarded, setXpAwarded] = useState(0);

  useEffect(() => {
    // Scroll to top on mount
    window.scrollTo(0, 0);

    const loadData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
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
              scores: result.scores
            });
          }
        }
      } catch (error) {
        console.error('Failed to load results:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user]);

  const handleQuizComplete = async (answers: number[]) => {
    if (!user) return;
    setSaving(true);

    // Simulate slight delay for "calculating" feel
    await new Promise(r => setTimeout(r, 1500));

    const result = calculatePersonality(answers);

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
      setShowQuiz(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error('Error saving:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-lightPrimary flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 border-4 border-brand-100 rounded-full animate-pulse"></div>
            <div className="absolute inset-0 border-t-4 border-brand-500 rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-500 font-medium font-dm">Loading your profile...</p>
        </div>
      </div>
    );
  }

  // --- Intro View ---
  if (!showQuiz && !existingResult) {
    return (
      <div className="min-h-screen bg-lightPrimary font-dm">
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-30">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <button
              onClick={() => navigate('/dashboard')}
              className="group flex items-center gap-2 text-gray-500 hover:text-navy-700 transition-colors"
            >
              <div className="p-2 rounded-full group-hover:bg-gray-100 transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </div>
              <span className="hidden sm:inline font-medium">Back to Dashboard</span>
            </button>
            <div className="font-bold text-navy-700 text-lg">Money Personality Style</div>
            <div className="w-10"></div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-6 py-12 md:py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-block p-4 rounded-full bg-white shadow-lg mb-6 text-6xl shadow-brand-500/10">
              🧠
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-navy-700 mb-6 tracking-tight">
              What's Your <span className="text-brand-500">Money Personality?</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
              Discover your unique relationship with money. Are you a Saver? Spender? Investor?
              Take this 2-minute quiz to reveal your strengths and get personalized financial tips.
            </p>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowQuiz(true)}
              className="group relative inline-flex items-center gap-3 px-10 py-5 bg-brand-500 text-white text-lg font-bold rounded-2xl shadow-xl shadow-brand-500/40 hover:bg-brand-600 transition-all overflow-hidden"
            >
              <span className="relative z-10">Start Assessment</span>
              <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:animate-shimmer" />
            </motion.button>

            <div className="mt-6 flex items-center justify-center gap-6 text-sm text-gray-400">
              <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> Free</span>
              <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> 2 Minutes</span>
              <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> Personalized Report</span>
            </div>
          </motion.div>

          {/* Personality Teasers */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="mt-20 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 opacity-60 hover:opacity-100 transition-opacity duration-500"
          >
            {MONEY_PERSONALITIES.slice(0, 5).map((p) => (
              <div key={p.id} className="p-4 rounded-2xl bg-white border border-gray-100 shadow-sm flex flex-col items-center">
                <span className="text-3xl mb-2 grayscale hover:grayscale-0 transition-all">{p.emoji}</span>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{p.name}</span>
              </div>
            ))}
          </motion.div>
        </main>
      </div>
    );
  }

  // --- Quiz or Result Container ---
  return (
    <div className="min-h-screen bg-lightPrimary font-dm">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => {
              if (showQuiz) {
                if (window.confirm('Quit quiz? Progress will be lost.')) setShowQuiz(false);
              } else {
                navigate('/dashboard');
              }
            }}
            className="group flex items-center gap-2 text-gray-500 hover:text-navy-700 transition-colors"
          >
            <div className="p-2 rounded-full group-hover:bg-gray-100 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </div>
            <span className="hidden sm:inline font-medium">
              {showQuiz ? 'Exit Quiz' : 'Back to Dashboard'}
            </span>
          </button>

          <div className="font-bold text-navy-700 text-lg flex items-center gap-2">
            {!showQuiz && <span className="text-xl">🧠</span>}
            Money Personality
          </div>

          <div className="w-10"></div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {saving ? (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center">
            <div className="w-20 h-20 bg-white rounded-3xl shadow-xl flex items-center justify-center mb-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-brand-50"></div>
              <Sparkles className="w-8 h-8 text-brand-500 animate-pulse relative z-10" />
            </div>
            <h2 className="text-2xl font-bold text-navy-700 mb-2">Analyzing your profile...</h2>
            <p className="text-gray-500">Calculating your unique money traits</p>
          </div>
        ) : showQuiz ? (
          <QuizView onComplete={handleQuizComplete} />
        ) : existingResult ? (
          <>
            {/* XP Award Banner */}
            <AnimatePresence>
              {xpAwarded > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -20, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-8 overflow-hidden"
                >
                  <div className="bg-gradient-to-r from-brand-500 to-indigo-600 rounded-2xl p-4 text-white flex items-center justify-center gap-4 shadow-lg shadow-brand-500/20">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-yellow-300" />
                    </div>
                    <div>
                      <div className="font-bold text-lg">Quiz Completed!</div>
                      <div className="text-white/90 text-sm">You earned +{xpAwarded} XP</div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <ResultsView
              primary={existingResult.primary}
              secondary={existingResult.secondary}
              scores={existingResult.scores}
              onRetake={() => {
                if (window.confirm('Retake the quiz? Your current personality results will be replaced.')) {
                  setExistingResult(null);
                  setShowQuiz(true);
                }
              }}
            />
          </>
        ) : null}
      </main>
    </div>
  );
};

export default MoneyPersonality;
