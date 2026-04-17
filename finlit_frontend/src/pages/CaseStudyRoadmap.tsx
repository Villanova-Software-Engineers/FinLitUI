/**
 * Case Study Roadmap
 * Beautiful week selection interface with stunning UI
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  CheckCircle,
  Lock,
  ArrowLeft,
  Calendar,
  TrendingUp,
  Sparkles,
  Award,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../auth/context/AuthContext';
import type { CaseStudy, CaseStudyProgress } from '../auth/types/auth.types';
import {
  getActiveCaseStudy,
  getCaseStudyProgress,
} from '../firebase/firestore.service';

const CaseStudyRoadmap: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();

  const [caseStudy, setCaseStudy] = useState<CaseStudy | null>(null);
  const [allProgress, setAllProgress] = useState<CaseStudyProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredWeek, setHoveredWeek] = useState<number | null>(null);

  useEffect(() => {
    loadCaseStudy();
  }, [user]);

  const loadCaseStudy = async () => {
    setLoading(true);
    try {
      const study = await getActiveCaseStudy();
      setCaseStudy(study);

      if (study && user) {
        // Determine the number of weeks available
        const totalWeeks = study.weeks
          ? Object.keys(study.weeks).map(Number).sort((a, b) => b - a)[0] // Get highest week number
          : 8; // Default to 8 if not specified

        // Get progress for all weeks dynamically
        const progressArray: CaseStudyProgress[] = [];
        for (let week = 1; week <= totalWeeks; week++) {
          const weekProgress = await getCaseStudyProgress(user.id, study.id, week);
          if (weekProgress) {
            progressArray.push(weekProgress);
          }
        }
        setAllProgress(progressArray);
      }
    } catch (err) {
      console.error('Error loading case study:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleWeekClick = (week: number) => {
    navigate(`/case-study/${week}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin mx-auto text-indigo-600" size={48} />
          <p className="text-gray-500 mt-4 font-medium tracking-wide">LOADING CASE STUDIES</p>
        </div>
      </div>
    );
  }

  if (!caseStudy) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
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

  // Get all available weeks
  const weeks = caseStudy.weeks
    ? Object.keys(caseStudy.weeks).map(Number).sort((a, b) => a - b)
    : [1, 2, 3, 4, 5, 6, 7, 8];

  // Check completion status for each week
  const getWeekStatus = (week: number) => {
    // Find progress for this specific week
    const weekProgress = allProgress.find(p => p.week === week);

    // Week 1 is always unlocked
    if (week === 1) {
      return weekProgress?.completedAt ? 'completed' : 'available';
    }

    // For other weeks, check if previous week is completed
    const prevWeekProgress = allProgress.find(p => p.week === week - 1);

    if (!prevWeekProgress?.completedAt) {
      // Previous week not completed, this week is locked
      return 'locked';
    }

    // Previous week is completed, check if this week is completed
    return weekProgress?.completedAt ? 'completed' : 'available';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-64 h-64 bg-blue-200/30 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.3, 0.5],
          }}
          transition={{ duration: 10, repeat: Infinity }}
        />
      </div>

      {/* Header */}
      <header className="relative z-10 bg-white/80 backdrop-blur-lg border-b border-gray-100 py-4 px-6 sticky top-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 transition-colors font-medium group"
          >
            <div className="p-2 rounded-lg bg-gray-100 group-hover:bg-indigo-50 transition-colors">
              <ArrowLeft size={18} />
            </div>
            <span>Dashboard</span>
          </button>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-full">
              <Award className="text-indigo-600" size={20} />
              <span className="text-sm font-bold text-indigo-900">
                {allProgress.filter(p => p.completedAt).length} / {weeks.length} Weeks Complete
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-12">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-gray-100 mb-6">
            <Sparkles className="text-yellow-500" size={16} />
            <span className="text-sm font-bold text-gray-700 uppercase tracking-wider">Weekly Case Studies</span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-gray-900 mb-6 leading-tight">
            Master Money Through
            <br />
            <span className="bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
              Real Stories
            </span>
          </h1>

          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Learn from the world's most successful entrepreneurs and their financial strategies.
            One inspiring story each week.
          </p>
        </motion.div>

        {/* Week Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {weeks.map((week, index) => {
            const status = getWeekStatus(week);
            const isLocked = status === 'locked';
            const isCompleted = status === 'completed';
            const isHovered = hoveredWeek === week;

            // Get week content
            const weeksData = caseStudy.weeks as Record<string | number, any> | undefined;
            const weekImagesData = caseStudy.weekImages as Record<string | number, any> | undefined;
            const weekContent = weeksData?.[week] || weeksData?.[String(week)];
            const weekImages = weekImagesData?.[week] || weekImagesData?.[String(week)];

            return (
              <motion.div
                key={week}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onMouseEnter={() => !isLocked && setHoveredWeek(week)}
                onMouseLeave={() => setHoveredWeek(null)}
              >
                <button
                  onClick={() => !isLocked && handleWeekClick(week)}
                  disabled={isLocked}
                  className={`w-full text-left group relative ${
                    isLocked ? 'cursor-not-allowed' : 'cursor-pointer'
                  }`}
                >
                  {/* Card */}
                  <div
                    className={`relative bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 ${
                      isLocked ? '' : 'hover:shadow-2xl hover:-translate-y-2'
                    }`}
                  >
                    {/* Image Section */}
                    <div className="relative h-48 bg-gradient-to-br from-indigo-500 to-blue-600 overflow-hidden">
                      {weekImages?.personImageUrl ? (
                        <img
                          src={weekImages.personImageUrl}
                          alt={weekContent?.subject || `Week ${week}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BookOpen className="text-white/30" size={64} />
                        </div>
                      )}

                      {/* Status Badge */}
                      <div className="absolute top-3 right-3">
                        {isCompleted ? (
                          <div className="flex items-center gap-1 px-3 py-1 bg-green-500 text-white rounded-full text-xs font-bold shadow-lg">
                            <CheckCircle size={14} />
                            Complete
                          </div>
                        ) : isLocked ? (
                          <div className="flex items-center gap-1 px-3 py-1 bg-gray-800 text-white rounded-full text-xs font-bold shadow-lg">
                            <Lock size={14} />
                            Locked
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 px-3 py-1 bg-blue-500 text-white rounded-full text-xs font-bold shadow-lg">
                            <TrendingUp size={14} />
                            Available
                          </div>
                        )}
                      </div>

                      {/* Week Number Overlay */}
                      <div className="absolute bottom-3 left-3">
                        <div className="flex items-center gap-2">
                          <div className="w-12 h-12 bg-white rounded-xl shadow-lg flex items-center justify-center">
                            <span className="text-2xl font-black text-indigo-600">{week}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                          Week {week}
                        </span>
                        {!isLocked && (
                          <ChevronRight
                            className={`text-indigo-600 transition-transform ${
                              isHovered ? 'translate-x-1' : ''
                            }`}
                            size={20}
                          />
                        )}
                      </div>

                      <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                        {weekContent?.subject || `Week ${week} Case Study`}
                      </h3>

                      <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                        {weekContent?.topic || 'An exciting case study awaits you.'}
                      </p>

                      {/* Quiz Info */}
                      {weekContent?.quiz && (
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar size={14} />
                            <span>5 min read</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Award size={14} />
                            <span>{weekContent.quiz.length} questions</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Hover Effect Overlay */}
                    {!isLocked && (
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-t from-indigo-600/10 to-transparent pointer-events-none"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: isHovered ? 1 : 0 }}
                        transition={{ duration: 0.2 }}
                      />
                    )}
                  </div>
                </button>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center bg-white rounded-3xl p-12 shadow-xl border border-gray-100"
        >
          <div className="max-w-2xl mx-auto">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Sparkles className="text-white" size={32} />
            </div>
            <h2 className="text-3xl font-black text-gray-900 mb-4">
              Complete All Weeks to Master Financial Literacy
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Each case study builds on the previous one, teaching you essential money concepts through real-world examples.
            </p>
            <div className="flex items-center justify-center gap-4">
              <div className="text-center">
                <div className="text-3xl font-black text-indigo-600">{weeks.length}</div>
                <div className="text-sm text-gray-600">Total Weeks</div>
              </div>
              <div className="w-px h-12 bg-gray-200" />
              <div className="text-center">
                <div className="text-3xl font-black text-green-600">
                  {allProgress.filter(p => p.completedAt).length}
                </div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
              <div className="w-px h-12 bg-gray-200" />
              <div className="text-center">
                <div className="text-3xl font-black text-blue-600">
                  {Math.round((allProgress.filter(p => p.completedAt).length / weeks.length) * 100)}%
                </div>
                <div className="text-sm text-gray-600">Progress</div>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default CaseStudyRoadmap;
