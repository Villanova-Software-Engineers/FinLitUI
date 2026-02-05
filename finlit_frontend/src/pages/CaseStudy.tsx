/**
 * Case Study Page
 * Engaging multi-page presentation of weekly case studies for students
 * Matches FinLit dashboard blue color scheme
 * refined compact design with grid layouts
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin mx-auto text-blue-600" size={48} />
          <p className="text-blue-700 mt-4 font-medium">Loading case study...</p>
        </div>
      </div>
    );
  }

  if (!caseStudy || !content) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
        <div className="text-center max-w-md bg-white rounded-2xl p-8 shadow-lg">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="text-blue-600" size={40} />
          </div>
          <h1 className="text-2xl font-bold text-blue-800 mb-2">No Case Study This Week</h1>
          <p className="text-gray-600 mb-6">Check back soon for a new case study!</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-sky-50 pb-20">
      {/* Compact Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-blue-100 sticky top-0 z-30 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-2 flex items-center justify-between">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-1 text-slate-600 hover:text-blue-600 transition-colors text-sm font-medium"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Dashboard</span>
          </button>

          {/* Compact Progress indicators */}
          <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-full">
            {pages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentPage(index)}
                className={`transition-all rounded-full ${index === currentPage
                    ? 'bg-blue-600 w-2.5 h-2.5 shadow-sm scale-110'
                    : index < currentPage
                      ? 'bg-blue-400 w-1.5 h-1.5 hover:bg-blue-500'
                      : 'bg-slate-300 w-1.5 h-1.5 hover:bg-slate-400'
                  }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm">
              Week {content.week}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-6 max-w-4xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -10 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {/* Page 0: Introduction */}
            {currentPage === 0 && (
              <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
                <div className="grid md:grid-cols-2">
                  <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 flex flex-col justify-center items-center text-center relative overflow-hidden">
                    {/* Background decorations */}
                    <div className="absolute top-0 left-0 w-full h-full opacity-10">
                      <div className="absolute top-10 right-10 w-24 h-24 bg-white rounded-full blur-2xl"></div>
                      <div className="absolute bottom-10 left-10 w-32 h-32 bg-blue-300 rounded-full blur-2xl"></div>
                    </div>

                    <motion.div
                      className="relative z-10"
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    >
                      <img
                        src={caseStudy.personImageUrl}
                        alt={content.subject}
                        className="w-40 h-40 rounded-full object-cover border-4 border-white/30 shadow-2xl mb-4"
                      />
                      <div className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-white/20 backdrop-blur-sm text-white rounded-full text-xs font-bold border border-white/20">
                        <Sparkles size={12} className="text-yellow-300" />
                        FEATURED CASE STUDY
                      </div>
                    </motion.div>
                  </div>

                  <div className="p-8 flex flex-col justify-center">
                    <h1 className="text-4xl font-extrabold text-slate-800 mb-2 leading-tight">{content.subject}</h1>
                    <p className="text-indigo-600 font-semibold text-lg mb-6">{content.topic}</p>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                        <span className="block text-2xl mb-1">🧐</span>
                        <span className="text-xs font-bold text-slate-600 uppercase">Real Scenario</span>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                        <span className="block text-2xl mb-1">🧠</span>
                        <span className="text-xs font-bold text-slate-600 uppercase">Learn & Quiz</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-slate-500 border-t border-slate-100 pt-6">
                      <div className="flex gap-2">
                        <img src={caseStudy.companyImageUrl1} alt="" className="w-8 h-8 rounded-lg object-cover bg-slate-100" />
                        <img src={caseStudy.companyImageUrl2} alt="" className="w-8 h-8 rounded-lg object-cover bg-slate-100" />
                      </div>
                      <span className="flex items-center gap-1 font-medium">
                        <Award size={14} className="text-yellow-500" />
                        {content.quiz.length * 100} XP Possible
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Page 1: Who Is This? */}
            {currentPage === 1 && (
              <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
                <div className="bg-gradient-to-r from-indigo-50 to-white px-6 py-4 border-b border-indigo-50 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-indigo-900">
                    <div className="bg-indigo-100 p-2 rounded-lg"><User size={20} className="text-indigo-600" /></div>
                    <span className="font-bold text-lg">Who is {content.subject}?</span>
                  </div>
                  <span className="text-slate-300 font-black text-4xl opacity-20">01</span>
                </div>

                <div className="p-6 md:p-8 grid md:grid-cols-3 gap-8 items-center">
                  <div className="md:col-span-1 relative">
                    <div className="absolute inset-0 bg-indigo-200 rounded-2xl transform rotate-3"></div>
                    <img
                      src={caseStudy.personImageUrl}
                      alt={content.subject}
                      className="relative w-full aspect-square rounded-2xl object-cover shadow-lg transform -rotate-1 hover:rotate-0 transition-transform duration-300"
                    />
                    <div className="absolute -bottom-3 -right-3 bg-white p-2 rounded-lg shadow-md">
                      <div className="text-center">
                        <span className="block text-lg font-bold text-slate-800">{content.quiz.length}</span>
                        <span className="block text-[10px] text-slate-500 font-bold uppercase">Questions</span>
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <h3 className="text-xl font-bold text-slate-800 mb-3">{content.who_is_this.title}</h3>
                    <p className="text-slate-600 leading-relaxed text-lg mb-4">{content.who_is_this.content}</p>
                    <div className="flex gap-2">
                      <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-sm font-medium border border-indigo-100">Entrepreneur</span>
                      <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-sm font-medium border border-indigo-100">Innovator</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Page 2: What Happened? */}
            {currentPage === 2 && (
              <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
                <div className="bg-gradient-to-r from-purple-50 to-white px-6 py-4 border-b border-purple-50 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-purple-900">
                    <div className="bg-purple-100 p-2 rounded-lg"><TrendingUp size={20} className="text-purple-600" /></div>
                    <span className="font-bold text-lg">What Happened?</span>
                  </div>
                  <span className="text-slate-300 font-black text-4xl opacity-20">02</span>
                </div>

                <div className="p-6 md:p-8 grid md:grid-cols-2 gap-8 items-start">
                  <div className="order-2 md:order-1">
                    <h3 className="text-xl font-bold text-slate-800 mb-4">{content.what_happened.title}</h3>
                    <p className="text-slate-600 leading-relaxed text-lg mb-6">{content.what_happened.content}</p>
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 rounded-lg text-purple-700 font-medium text-sm">
                      <Zap size={16} />
                      Key Moment
                    </div>
                  </div>

                  <div className="order-1 md:order-2 flex justify-center items-center bg-slate-50 rounded-2xl p-4 border border-slate-100">
                    <img
                      src={caseStudy.companyImageUrl1}
                      alt="Company"
                      className="w-full h-48 md:h-64 rounded-xl object-cover shadow-md"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Page 3: The Concept */}
            {currentPage === 3 && (
              <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
                <div className="bg-gradient-to-r from-amber-50 to-white px-6 py-4 border-b border-amber-50 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-amber-900">
                    <div className="bg-amber-100 p-2 rounded-lg"><Lightbulb size={20} className="text-amber-600" /></div>
                    <span className="font-bold text-lg">{content.money_idea.title}</span>
                  </div>
                  <span className="text-slate-300 font-black text-4xl opacity-20">03</span>
                </div>

                <div className="p-6 md:p-8">
                  <div className="grid md:grid-cols-2 gap-8 mb-6">
                    <div>
                      <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                        <BookOpen size={18} className="text-amber-500" />
                        Concept Definition
                      </h4>
                      <p className="text-slate-600 leading-relaxed">{content.money_idea.what_it_means}</p>
                    </div>

                    {content.money_idea.formula && (
                      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white shadow-lg flex flex-col justify-center relative overflow-hidden">
                        <DollarSign className="absolute top-2 right-2 text-white/10 w-24 h-24 rotate-12" />
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">The Formula</p>
                        <p className="font-mono text-xl md:text-2xl font-bold tracking-tight">
                          {content.money_idea.formula.replace(/\$\$/g, '')}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="bg-amber-50 rounded-xl p-4 flex items-center gap-4 border border-amber-100">
                    <img src={caseStudy.companyImageUrl2} alt="" className="w-16 h-16 rounded-lg object-cover shadow-sm bg-white" />
                    <div>
                      <p className="text-xs font-bold text-amber-800 uppercase mb-1">Visual Aid</p>
                      <p className="text-sm text-amber-900">Visualizing how this concept works in the real market.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Page 4: Why It Matters */}
            {currentPage === 4 && (
              <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
                <div className="bg-gradient-to-r from-emerald-50 to-white px-6 py-4 border-b border-emerald-50 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-900">
                    <div className="bg-emerald-100 p-2 rounded-lg"><Target size={20} className="text-emerald-600" /></div>
                    <span className="font-bold text-lg">Why it matters?</span>
                  </div>
                  <span className="text-slate-300 font-black text-4xl opacity-20">04</span>
                </div>

                <div className="p-6 md:p-8">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1">
                      <div className="bg-emerald-50 border-l-4 border-emerald-500 p-5 rounded-r-xl">
                        <p className="text-emerald-900 font-medium leading-relaxed text-lg">
                          "{content.money_idea.why_it_matters}"
                        </p>
                      </div>
                    </div>

                    <div className="w-full md:w-64 bg-slate-50 rounded-2xl p-5 border border-slate-100 flex flex-col items-center justify-center text-center">
                      <img src={caseStudy.personImageUrl} alt="" className="w-16 h-16 rounded-full object-cover mb-3 shadow-md border-2 border-white" />
                      <p className="text-sm text-slate-500 font-bold uppercase mb-1">Expert Take</p>
                      <p className="text-slate-800 font-semibold text-sm">Mastering this can change your financial future.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Page 5: The Risk */}
            {currentPage === 5 && (
              <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
                <div className="bg-gradient-to-r from-red-50 to-white px-6 py-4 border-b border-red-50 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-red-900">
                    <div className="bg-red-100 p-2 rounded-lg"><AlertTriangle size={20} className="text-red-600" /></div>
                    <span className="font-bold text-lg">The Risk Factor</span>
                  </div>
                  <span className="text-slate-300 font-black text-4xl opacity-20">05</span>
                </div>

                <div className="p-6 md:p-8 grid md:grid-cols-2 gap-8 items-center">
                  <div className="bg-red-50 border border-red-100 rounded-2xl p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10"><Shield size={80} /></div>
                    <h4 className="font-bold text-red-800 mb-2 flex items-center gap-2 relative z-10">
                      <Shield size={18} /> WARNING
                    </h4>
                    <p className="text-red-900 relative z-10 leading-relaxed">{content.money_idea.risk}</p>
                  </div>

                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                    <img src={caseStudy.companyImageUrl1} alt="Risk context" className="w-full h-40 md:h-48 object-cover rounded-xl shadow-sm" />
                  </div>
                </div>
              </div>
            )}

            {/* Page 6: Real Life Example */}
            {currentPage === 6 && (
              <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
                <div className="bg-gradient-to-r from-orange-50 to-white px-6 py-4 border-b border-orange-50 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-orange-900">
                    <div className="bg-orange-100 p-2 rounded-lg"><HomeIcon size={20} className="text-orange-600" /></div>
                    <span className="font-bold text-lg">Real Life Example</span>
                  </div>
                  <span className="text-slate-300 font-black text-4xl opacity-20">06</span>
                </div>

                <div className="p-6 md:p-8">
                  <div className="relative mb-6 md:mb-8">
                    <Quote className="absolute -top-3 -left-3 text-orange-200 fill-orange-100 w-12 h-12 transform rotate-180" />
                    <p className="text-xl md:text-2xl text-slate-700 italic font-medium leading-relaxed pl-6 relative z-10">
                      {content.money_idea.real_life}
                    </p>
                  </div>

                  <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl p-4 border border-slate-200 flex items-center gap-5">
                    <img src={caseStudy.companyImageUrl2} alt="" className="w-20 h-20 rounded-xl object-cover shadow-md" />
                    <div>
                      <h4 className="font-bold text-slate-800 mb-1">Your Turn</h4>
                      <p className="text-sm text-slate-600">Think about how this applies to your savings today.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Page 7: Quiz */}
            {currentPage === 7 && (
              <div className="max-w-2xl mx-auto">
                {quizCompleted && finalScore ? (
                  <div className="bg-white rounded-3xl shadow-xl p-8 text-center border border-slate-100">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, damping: 15 }}
                      className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl ${finalScore.passed ? 'bg-gradient-to-br from-green-400 to-green-600' : 'bg-gradient-to-br from-amber-400 to-amber-600'
                        }`}
                    >
                      {finalScore.passed ? (
                        <Award className="text-white" size={48} />
                      ) : (
                        <AlertTriangle className="text-white" size={48} />
                      )}
                    </motion.div>

                    <h2 className="text-3xl font-extrabold text-slate-800 mb-2">
                      {finalScore.passed ? 'Quiz Mastered!' : 'Keep Learning!'}
                    </h2>
                    <p className="text-slate-500 mb-8 font-medium">You scored {finalScore.score}% on this case study.</p>

                    <button
                      onClick={() => navigate('/dashboard')}
                      className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-lg transition-colors shadow-lg shadow-blue-200"
                    >
                      Return to Dashboard
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white shadow-xl mb-6 flex justify-between items-center">
                      <div>
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                          <Award size={24} className="text-yellow-300" /> Rate Your Knowledge
                        </h2>
                        <p className="text-blue-100 text-sm mt-1">Select the best answer below</p>
                      </div>
                      <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl font-mono font-bold text-lg">
                        {currentQuizIndex + 1}/{content.quiz.length}
                      </div>
                    </div>

                    <div className="bg-white rounded-3xl shadow-lg border border-slate-100 overflow-hidden">
                      <div className="p-6 md:p-8">
                        <p className="text-xl font-bold text-slate-800 mb-6 leading-tight">
                          {content.quiz[currentQuizIndex].question}
                        </p>

                        <div className="space-y-3">
                          {content.quiz[currentQuizIndex].options.map((option, idx) => {
                            const isSelected = selectedAnswer === option;
                            const isCorrect = option === content.quiz[currentQuizIndex].answer;
                            const showCorrectness = showResult && (isSelected || isCorrect);

                            return (
                              <button
                                key={idx}
                                onClick={() => handleAnswerSelect(option)}
                                disabled={showResult}
                                className={`w-full p-4 rounded-xl text-left transition-all relative overflow-hidden group border-2 ${showCorrectness
                                    ? isCorrect
                                      ? 'bg-green-50 border-green-500 text-green-900'
                                      : isSelected
                                        ? 'bg-red-50 border-red-500 text-red-900'
                                        : 'bg-slate-50 border-slate-100 text-slate-400'
                                    : isSelected
                                      ? 'bg-blue-50 border-blue-500 text-blue-900'
                                      : 'bg-white border-slate-100 hover:border-blue-300 hover:bg-slate-50 text-slate-700'
                                  }`}
                              >
                                <div className="flex items-center gap-3 relative z-10">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border transition-colors ${showCorrectness && isCorrect ? 'bg-green-500 border-green-500 text-white' :
                                      showCorrectness && isSelected ? 'bg-red-500 border-red-500 text-white' :
                                        isSelected ? 'bg-blue-500 border-blue-500 text-white' : 'bg-white border-slate-200 text-slate-400 group-hover:border-blue-300 group-hover:text-blue-500'
                                    }`}>
                                    {String.fromCharCode(65 + idx)}
                                  </div>
                                  <span className="font-medium text-lg flex-1">{option}</span>

                                  {showCorrectness && isCorrect && <CheckCircle size={20} className="text-green-600" />}
                                  {showCorrectness && isSelected && !isCorrect && <XCircle size={20} className="text-red-600" />}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {showResult && (
                        <div className="bg-slate-50 p-6 border-t border-slate-100">
                          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-4">
                            <p className="text-blue-800 text-sm leading-relaxed">
                              <strong>💡 Insight:</strong> {content.quiz[currentQuizIndex].teaching_point}
                            </p>
                          </div>
                          <button
                            onClick={handleNextQuestion}
                            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2"
                          >
                            {currentQuizIndex < content.quiz.length - 1 ? (
                              <>Next Question <ChevronRight size={18} /></>
                            ) : (
                              <>See Results <Award size={18} /></>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Fixed Compact Footer similar to mobile apps */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-slate-200 py-3 px-4 z-40">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          {currentPage > 0 && currentPage < totalPages && (
            <button
              onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-slate-600 font-bold hover:bg-slate-100 transition-colors"
            >
              <ChevronLeft size={20} />
              Back
            </button>
          )}

          <div className="flex-1"></div>

          {currentPage < totalPages - 1 && (
            <button
              onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
              className="flex items-center gap-1.5 px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all hover:scale-105 active:scale-95"
            >
              Next
              <ChevronRight size={20} />
            </button>
          )}
        </div>
      </footer>
    </div>
  );
};

export default CaseStudyPage;
