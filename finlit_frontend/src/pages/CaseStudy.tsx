/**
 * Case Study Page
 * Engaging multi-page presentation of weekly case studies for students
 * Matches FinLit dashboard blue color scheme
 * IMMERSIVE FULL-WIDTH DESIGN
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  User,
  Lightbulb,
  TrendingUp,
  AlertTriangle,
  Home as HomeIcon,
  CheckCircle,
  XCircle,
  Award,
  Loader2,
  Calendar,
  ArrowLeft,
  DollarSign,
  Target,
  Shield,
  Sparkles,
  Quote,
  Zap,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../auth/context/AuthContext';
import type { CaseStudy, CaseStudyProgress } from '../auth/types/auth.types';
import {
  getActiveCaseStudy,
  getCaseStudyProgress,
  saveCaseStudyProgress,
  completeCaseStudy,
} from '../firebase/firestore.service';

const CaseStudyPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();

  const [caseStudy, setCaseStudy] = useState<CaseStudy | null>(null);
  const [progress, setProgress] = useState<CaseStudyProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [finalScore, setFinalScore] = useState<{ score: number; passed: boolean } | null>(null);

  useEffect(() => {
    loadCaseStudy();
  }, [user]);

  const loadCaseStudy = async () => {
    setLoading(true);
    try {
      const study = await getActiveCaseStudy();
      setCaseStudy(study);

      if (study && user) {
        const userProgress = await getCaseStudyProgress(user.id, study.id);
        setProgress(userProgress);
        if (userProgress?.completedAt) {
          setQuizCompleted(true);
          setFinalScore({ score: userProgress.score || 0, passed: (userProgress.score || 0) >= 70 });
        }
      }
    } catch (err) {
      console.error('Error loading case study:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = async (answer: string) => {
    if (!caseStudy || !user || showResult) return;

    setSelectedAnswer(answer);
    setShowResult(true);

    const currentQuestion = caseStudy.case_study.quiz[currentQuizIndex];
    const isCorrect = answer === currentQuestion.answer;

    await saveCaseStudyProgress(
      user.id,
      caseStudy.id,
      caseStudy.case_study.week,
      currentQuizIndex,
      answer,
      isCorrect
    );

    const updatedProgress = await getCaseStudyProgress(user.id, caseStudy.id);
    setProgress(updatedProgress);
  };

  const handleNextQuestion = async () => {
    if (!caseStudy || !user) return;

    if (currentQuizIndex < caseStudy.case_study.quiz.length - 1) {
      setCurrentQuizIndex(currentQuizIndex + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      const result = await completeCaseStudy(
        user.id,
        caseStudy.id,
        caseStudy.case_study.quiz.length
      );
      setFinalScore(result);
      setQuizCompleted(true);
    }
  };

  const content = caseStudy?.case_study;

  const pages = content ? [
    { title: 'Intro', icon: BookOpen, key: 'intro' },
    { title: 'Who?', icon: User, key: 'who' },
    { title: 'What?', icon: TrendingUp, key: 'what' },
    { title: 'Concept', icon: Lightbulb, key: 'concept' },
    { title: 'Why?', icon: Target, key: 'matters' },
    { title: 'Risk', icon: Shield, key: 'risk' },
    { title: 'Real Life', icon: HomeIcon, key: 'reallife' },
    { title: 'Quiz', icon: Award, key: 'quiz' },
  ] : [];

  const totalPages = pages.length;

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin mx-auto text-indigo-600" size={48} />
          <p className="text-gray-500 mt-4 font-medium tracking-wide">LOADING CASE STUDY</p>
        </div>
      </div>
    );
  }

  if (!caseStudy || !content) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md bg-white rounded-3xl p-10 shadow-2xl border border-gray-100">
          <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Calendar className="text-indigo-600" size={48} />
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-3">No Active Study</h1>
          <p className="text-gray-500 mb-8 text-lg">Check back next week for a new financial mystery.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-slate-50 flex flex-col overflow-hidden relative">
      {/* Immersive Header */}
      <header className="bg-white border-b border-gray-100 py-3 px-6 z-30 shrink-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 transition-colors font-medium group"
          >
            <div className="p-2 rounded-lg bg-gray-100 group-hover:bg-indigo-50 transition-colors">
              <ArrowLeft size={18} />
            </div>
            <span className="hidden sm:inline">Dashboard</span>
          </button>

          {/* Expanded Progress Bar */}
          <div className="flex-1 max-w-md mx-8">
            <div className="flex justify-between mb-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Progress</span>
              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">{currentPage + 1} / {totalPages}</span>
            </div>
            <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-indigo-600 rounded-full"
                initial={{ width: `${(currentPage / totalPages) * 100}%` }}
                animate={{ width: `${((currentPage + 1) / totalPages) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-right">
              <span className="block text-xs font-bold text-gray-900 leading-tight">{content.subject}</span>
              <span className="block text-[10px] font-semibold text-gray-400 uppercase">Week {content.week}</span>
            </span>
          </div>
        </div>
      </header>

      {/* Main Content - Full Height & Width */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 bg-slate-50">
        <div className="max-w-7xl mx-auto h-full grid place-items-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="w-full h-full min-h-[600px] flex flex-col select-none"
            >
              {/* Page 0: Introduction */}
              {currentPage === 0 && (
                <div className="flex-1 bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden grid lg:grid-cols-2">
                  <div className="order-2 lg:order-1 p-8 lg:p-16 flex flex-col justify-center">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <span className="inline-block px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-600 font-bold text-xs uppercase tracking-wider mb-6 border border-indigo-100">
                        Case Study • Week {content.week}
                      </span>
                      <h1 className="text-4xl lg:text-6xl font-black text-slate-900 mb-6 leading-tight tracking-tight">
                        {content.subject}
                      </h1>
                      <p className="text-xl lg:text-2xl text-slate-500 font-medium mb-10 leading-relaxed max-w-lg">
                        {content.topic}
                      </p>

                      <div className="grid grid-cols-2 gap-4 max-w-md">
                        <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                          <div className="font-bold text-slate-900 text-lg mb-1">5 Mins</div>
                          <div className="text-xs text-slate-500 font-semibold uppercase">Read Time</div>
                        </div>
                        <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                          <div className="font-bold text-slate-900 text-lg mb-1">{content.quiz.length} Questions</div>
                          <div className="text-xs text-slate-500 font-semibold uppercase">Knowledge Check</div>
                        </div>
                      </div>
                    </motion.div>
                  </div>

                  <div className="order-1 lg:order-2 bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 relative overflow-hidden flex items-center justify-center p-12">
                    {/* Abstract shapes */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-400/20 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>

                    <motion.div
                      className="relative z-10 text-center"
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.6 }}
                    >
                      <img
                        src={caseStudy.personImageUrl}
                        alt={content.subject}
                        className="w-64 h-64 lg:w-80 lg:h-80 rounded-full object-cover border-[8px] border-white/20 shadow-2xl mb-8 mx-auto"
                      />
                      <div className="flex justify-center gap-4">
                        <img src={caseStudy.companyImageUrl1} alt="" className="w-16 h-16 rounded-2xl object-cover bg-white/90 shadow-lg p-1" />
                        <img src={caseStudy.companyImageUrl2} alt="" className="w-16 h-16 rounded-2xl object-cover bg-white/90 shadow-lg p-1" />
                      </div>
                    </motion.div>
                  </div>
                </div>
              )}

              {/* Page 1: Who Is This? */}
              {currentPage === 1 && (
                <div className="flex-1 bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden grid lg:grid-cols-12 gap-0 relative">
                  <div className="lg:col-span-5 relative h-64 lg:h-auto bg-slate-50 flex items-center justify-center p-6 lg:p-10">
                    <div className="relative w-full max-w-sm">
                      <div className="absolute inset-0 bg-indigo-900/5 rounded-2xl transform rotate-3"></div>
                      <img
                        src={caseStudy.personImageUrl}
                        alt={content.subject}
                        className="relative w-full h-auto aspect-[3/4] object-cover object-top rounded-2xl shadow-xl"
                      />
                    </div>
                  </div>

                  <div className="lg:col-span-7 p-8 lg:p-16 flex flex-col justify-center bg-white">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-3 bg-indigo-100 rounded-xl text-indigo-600">
                        <User size={28} />
                      </div>
                      <span className="text-sm font-bold text-indigo-600 uppercase tracking-wider">Profile</span>
                    </div>

                    <h2 className="text-3xl lg:text-5xl font-black text-slate-900 mb-8 leading-tight">
                      Who is {content.subject}?
                    </h2>

                    <p className="text-lg lg:text-2xl text-slate-600 leading-relaxed font-medium mb-10 text-pretty">
                      {content.who_is_this.content}
                    </p>

                    <div className="flex flex-wrap gap-3">
                      {['Visionary', 'Leader', 'Strategist'].map((tag) => (
                        <span key={tag} className="px-4 py-2 border border-slate-200 rounded-full text-sm font-bold text-slate-600">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Page 2: What Happened? */}
              {currentPage === 2 && (
                <div className="flex-1 bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden flex flex-col">
                  <div className="h-2 bg-gradient-to-r from-purple-500 to-indigo-500"></div>
                  <div className="flex-1 p-8 lg:p-16 grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                    <div>
                      <div className="flex items-center gap-3 mb-8">
                        <div className="p-3 bg-purple-100 rounded-xl text-purple-600">
                          <TrendingUp size={28} />
                        </div>
                        <span className="text-sm font-bold text-purple-600 uppercase tracking-wider">The Story</span>
                      </div>

                      <h2 className="text-3xl lg:text-5xl font-black text-slate-900 mb-6 leading-tight">
                        {content.what_happened.title}
                      </h2>
                      <p className="text-lg lg:text-xl text-slate-600 leading-relaxed font-medium text-pretty">
                        {content.what_happened.content}
                      </p>
                    </div>

                    <div className="relative group">
                      <div className="absolute inset-0 bg-purple-200 rounded-3xl transform rotate-3 group-hover:rotate-1 transition-transform"></div>
                      <img
                        src={caseStudy.companyImageUrl1}
                        alt="Company context"
                        className="relative w-full aspect-video rounded-3xl object-cover shadow-2xl transform -rotate-1 group-hover:rotate-0 transition-transform"
                      />
                      <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-xl max-w-xs hidden lg:block">
                        <p className="text-sm font-bold text-slate-800 flex items-center gap-2">
                          <Zap size={16} className="text-yellow-500 fill-yellow-500" />
                          Defining Moment
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Page 3: The Concept */}
              {currentPage === 3 && (
                <div className="flex-1 bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden flex flex-col justify-center p-8 lg:p-16">
                  <div className="max-w-4xl mx-auto w-full">
                    <div className="flex items-center gap-3 mb-8 justify-center lg:justify-start">
                      <div className="p-3 bg-amber-100 rounded-xl text-amber-600">
                        <Lightbulb size={28} />
                      </div>
                      <span className="text-sm font-bold text-amber-600 uppercase tracking-wider">The Concept</span>
                    </div>

                    <h2 className="text-3xl lg:text-5xl font-black text-slate-900 mb-8 text-center lg:text-left">
                      {content.money_idea.title}
                    </h2>

                    <div className="bg-amber-50 p-8 rounded-3xl border border-amber-100 mb-8">
                      <p className="text-lg lg:text-2xl text-amber-900 font-medium leading-relaxed">
                        {content.money_idea.what_it_means}
                      </p>
                    </div>

                    {content.money_idea.formula && (
                      <div className="font-mono text-xl lg:text-3xl text-slate-700 font-bold bg-slate-100 p-6 rounded-2xl inline-block max-w-fit">
                        {content.money_idea.formula.replace(/\$\$/g, '')}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Page 4: Why It Matters */}
              {currentPage === 4 && (
                <div className="flex-1 bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden p-8 lg:p-16 flex flex-col justify-center">
                  <div className="max-w-4xl mx-auto w-full">
                    <div className="flex items-center gap-3 mb-8 justify-center">
                      <div className="p-3 bg-emerald-100 rounded-xl text-emerald-600">
                        <Target size={28} />
                      </div>
                      <span className="text-sm font-bold text-emerald-600 uppercase tracking-wider">Impact</span>
                    </div>

                    <h2 className="text-3xl lg:text-6xl font-black text-center text-slate-900 mb-12">
                      Why does this matter to you?
                    </h2>

                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                      <div className="relative">
                        <div className="absolute -top-10 -left-10 text-emerald-100">
                          <Quote size={120} />
                        </div>
                        <p className="relative text-2xl lg:text-3xl font-medium text-slate-700 leading-relaxed text-pretty">
                          "{content.money_idea.why_it_matters}"
                        </p>
                      </div>

                      <div className="bg-emerald-50 rounded-3xl p-8 lg:p-10 flex items-center gap-6 border border-emerald-100">
                        <img
                          src={caseStudy.personImageUrl}
                          alt="Expert"
                          className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg shrink-0"
                        />
                        <div>
                          <h4 className="font-bold text-emerald-900 text-lg mb-1">{content.subject}'s Strategy</h4>
                          <p className="text-emerald-700 leading-snug">Understanding this principle is key to long-term wealth building.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Page 5: The Risk */}
              {currentPage === 5 && (
                <div className="flex-1 bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden grid lg:grid-cols-2">
                  <div className="bg-red-600 p-12 lg:p-20 flex flex-col justify-center text-white relative overflow-hidden">
                    <AlertTriangle className="absolute -right-12 -bottom-12 text-red-500 w-96 h-96 opacity-50" />
                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-8">
                        <div className="p-2 bg-red-500 rounded-lg text-white border border-red-400">
                          <Shield size={24} />
                        </div>
                        <span className="text-sm font-bold text-red-100 uppercase tracking-wider">Warning</span>
                      </div>
                      <h2 className="text-4xl lg:text-6xl font-black mb-8">The Risk Factor</h2>
                      <p className="text-xl lg:text-2xl font-medium text-red-100 leading-relaxed">
                        Every opportunity comes with potential downsides. Here's what you need to watch out for.
                      </p>
                    </div>
                  </div>

                  <div className="p-12 lg:p-20 flex flex-col justify-center bg-white">
                    <div className="prose prose-lg prose-red">
                      <h3 className="text-2xl font-bold text-red-600 mb-6">Critical Considerations</h3>
                      <p className="text-xl text-slate-600 leading-relaxed">
                        {content.money_idea.risk}
                      </p>

                      <div className="mt-10 bg-red-50 rounded-2xl p-6 flex items-start gap-4">
                        <img src={caseStudy.companyImageUrl1} alt="Risk" className="w-12 h-12 rounded-lg object-cover bg-red-200" />
                        <div>
                          <h4 className="font-bold text-red-900 text-sm uppercase mb-1">Lesson</h4>
                          <p className="text-red-700 text-sm font-medium">Always calculate the downside before jumping in.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Page 6: Real Life Example */}
              {currentPage === 6 && (
                <div className="flex-1 bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden p-8 lg:p-16 flex flex-col items-center justify-center text-center relative">
                  <div className="absolute top-0 left-0 w-full h-4 bg-gradient-to-r from-orange-400 to-amber-400"></div>

                  <div className="max-w-4xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 rounded-full text-orange-600 text-sm font-bold uppercase tracking-wider mb-8">
                      <HomeIcon size={16} /> Real Life Application
                    </div>

                    <h2 className="text-2xl lg:text-4xl font-black text-slate-900 mb-12 leading-tight">
                      "{content.money_idea.real_life}"
                    </h2>

                    <div className="bg-slate-50 rounded-3xl p-8 lg:p-10 border border-slate-100 inline-flex flex-col md:flex-row items-center gap-8 text-left max-w-3xl">
                      <img src={caseStudy.companyImageUrl2} alt="Example" className="w-32 h-32 rounded-2xl object-cover shadow-lg" />
                      <div>
                        <h3 className="text-2xl font-bold text-slate-800 mb-2">Apply this today</h3>
                        <p className="text-slate-600 text-lg">
                          Take a moment to reflect on your own finances. Where can you apply this principle right now?
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Page 7: Quiz */}
              {currentPage === 7 && (
                <div className="flex-1 bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden flex flex-col">
                  <div className="flex-1 p-8 lg:p-20 flex flex-col justify-center items-center">
                    {quizCompleted && finalScore ? (
                      <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="max-w-xl w-full text-center"
                      >
                        <div className={`w-32 h-32 mx-auto rounded-full flex items-center justify-center mb-8 shadow-2xl ${finalScore.passed ? 'bg-green-500' : 'bg-amber-500'
                          }`}>
                          {finalScore.passed ? <Award size={64} className="text-white" /> : <AlertTriangle size={64} className="text-white" />}
                        </div>
                        <h2 className="text-5xl font-black text-slate-900 mb-4">{finalScore.passed ? 'Nailed It!' : 'Nice Try!'}</h2>
                        <p className="text-2xl text-slate-500 mb-10">You scored <span className="font-bold text-slate-900">{finalScore.score}%</span> on this case study.</p>
                        <button
                          onClick={() => navigate('/dashboard')}
                          className="w-full py-5 bg-slate-900 text-white rounded-2xl font-bold text-xl hover:bg-slate-800 transition-all shadow-xl hover:shadow-2xl"
                        >
                          Complete & Return Home
                        </button>
                      </motion.div>
                    ) : (
                      <div className="max-w-4xl w-full">
                        <div className="flex justify-between items-end mb-10 border-b border-gray-100 pb-6">
                          <div>
                            <span className="text-sm font-bold text-indigo-600 uppercase tracking-wider block mb-2">Question {currentQuizIndex + 1} of {content.quiz.length}</span>
                            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 leading-tight">
                              {content.quiz[currentQuizIndex].question}
                            </h2>
                          </div>
                          <div className="hidden lg:block text-slate-300">
                            <Award size={48} />
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                          {content.quiz[currentQuizIndex].options.map((option, idx) => {
                            const isSelected = selectedAnswer === option;
                            const isCorrect = option === content.quiz[currentQuizIndex].answer;
                            const showCorrectness = showResult && (isSelected || isCorrect);

                            return (
                              <button
                                key={idx}
                                onClick={() => handleAnswerSelect(option)}
                                disabled={showResult}
                                className={`p-6 lg:p-8 rounded-2xl text-left border-2 transition-all flex items-start gap-4 ${showCorrectness
                                    ? isCorrect
                                      ? 'bg-green-50 border-green-500 text-green-900'
                                      : isSelected
                                        ? 'bg-red-50 border-red-500 text-red-900'
                                        : 'bg-white border-slate-100 opacity-50'
                                    : isSelected
                                      ? 'bg-indigo-50 border-indigo-600 shadow-lg scale-[1.02]'
                                      : 'bg-white border-slate-200 hover:border-indigo-400 hover:shadow-md'
                                  }`}
                              >
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${showCorrectness && isCorrect ? 'bg-green-500 text-white' :
                                    showCorrectness && isSelected ? 'bg-red-500 text-white' :
                                      isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'
                                  }`}>
                                  {String.fromCharCode(65 + idx)}
                                </div>
                                <span className="text-lg lg:text-xl font-medium leading-snug">{option}</span>
                                {showCorrectness && isCorrect && <CheckCircle className="ml-auto text-green-600 shrink-0" />}
                                {showCorrectness && isSelected && !isCorrect && <XCircle className="ml-auto text-red-600 shrink-0" />}
                              </button>
                            );
                          })}
                        </div>

                        {showResult && (
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-8 bg-slate-900 text-white p-8 rounded-3xl flex flex-col md:flex-row items-center gap-8 shadow-2xl"
                          >
                            <div className="flex-1">
                              <h4 className="font-bold text-indigo-400 uppercase tracking-wider text-sm mb-2">Teaching Point</h4>
                              <p className="text-lg leading-relaxed text-slate-200">
                                {content.quiz[currentQuizIndex].teaching_point}
                              </p>
                            </div>
                            <button
                              onClick={handleNextQuestion}
                              className="px-8 py-4 bg-white text-slate-900 rounded-xl font-bold hover:bg-indigo-50 transition-colors whitespace-nowrap"
                            >
                              Next Question
                            </button>
                          </motion.div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Side Navigation Buttons */}
      <div className="fixed inset-y-0 left-0 flex items-center px-4 z-50 pointer-events-none">
        <button
          onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
          disabled={currentPage === 0}
          className="w-14 h-14 flex items-center justify-center rounded-full bg-white/90 backdrop-blur-sm text-slate-800 shadow-xl hover:scale-110 active:scale-95 disabled:opacity-0 disabled:scale-100 transition-all pointer-events-auto border border-white/50"
        >
          <ChevronLeft size={32} />
        </button>
      </div>

      <div className="fixed inset-y-0 right-0 flex items-center px-4 z-50 pointer-events-none">
        <button
          onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
          disabled={currentPage === totalPages - 1}
          className="w-14 h-14 flex items-center justify-center rounded-full bg-indigo-600/90 backdrop-blur-sm text-white shadow-xl hover:scale-110 active:scale-95 disabled:opacity-0 disabled:scale-100 transition-all pointer-events-auto border border-white/20"
        >
          <ChevronRight size={32} />
        </button>
      </div>
    </div>
  );
};

export default CaseStudyPage;
