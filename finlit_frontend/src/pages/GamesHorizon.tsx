import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  TrendingUp,
  Brain,
  Zap,
  Trophy,
  Star,
  Play,
  BarChart2,
  Target,
  Puzzle,
  Grid3x3,
  Gamepad2,
  Coins,
  BookOpen
} from 'lucide-react';

const GamesHorizon = () => {
  const navigate = useNavigate();

  const games = [
    {
      id: 'stock-simulation',
      title: 'Stock Trading Game',
      description: 'Master the markets with real-time trading simulation',
      route: '/stock-simulation',
      difficulty: 'Expert',
      estimatedTime: '15-20 min',
      xpReward: 100,
      category: 'Strategy',
      icon: TrendingUp,
      bgGradient: 'from-blue-500 to-cyan-600',
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600',
      categoryBg: 'bg-emerald-50',
      categoryText: 'text-emerald-700',
      participants: 3
    },
    {
      id: 'crossword',
      title: 'Financial Crossword',
      description: 'Challenge your financial vocabulary knowledge',
      route: '/dashboard',
      difficulty: 'Rookie',
      estimatedTime: '10-15 min',
      xpReward: '2 XP per word',
      category: 'Puzzle',
      icon: BookOpen,
      bgGradient: 'from-orange-500 to-rose-500',
      iconBg: 'bg-orange-50',
      iconColor: 'text-orange-600',
      categoryBg: 'bg-blue-50',
      categoryText: 'text-blue-700',
      participants: 5
    },
    {
      id: 'daily-challenge',
      title: 'Daily Challenge',
      description: 'Build your streak with daily financial quests',
      route: '/dashboard',
      difficulty: 'Dynamic',
      estimatedTime: '2-3 min',
      xpReward: 5,
      category: 'Quest',
      icon: Coins,
      bgGradient: 'from-teal-500 to-green-500',
      iconBg: 'bg-teal-50',
      iconColor: 'text-teal-600',
      categoryBg: 'bg-amber-50',
      categoryText: 'text-amber-700',
      participants: 8
    }
  ];

  const handleGameClick = (game: any) => {
    navigate(game.route);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 pt-24 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors mb-6"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Back to Dashboard</span>
          </button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-5xl font-bold bg-gradient-to-r from-slate-900 via-blue-700 to-cyan-700 bg-clip-text text-transparent mb-4" style={{ fontFamily: '"Playfair Display", "Georgia", serif' }}>
              Financial Arena
            </h1>
            <p className="text-gray-600 text-lg" style={{ fontFamily: '"Inter", sans-serif' }}>
              Level up your financial skills through engaging games
            </p>
          </motion.div>
        </div>

        {/* Games Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {games.map((game, index) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -8 }}
              onClick={() => handleGameClick(game)}
              className="bg-white rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer border border-gray-100"
            >
              {/* Icon and Menu */}
              <div className="flex items-start justify-between mb-4">
                <div className={`w-14 h-14 ${game.iconBg} rounded-2xl flex items-center justify-center shadow-sm`}>
                  <game.icon className={`w-7 h-7 ${game.iconColor}`} strokeWidth={2} />
                </div>
                <div className="flex gap-1">
                  <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                  <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                  <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                </div>
              </div>

              {/* Visual Area */}
              <div className={`w-full h-44 bg-gradient-to-br ${game.bgGradient} rounded-2xl mb-4 relative overflow-hidden`}>
                <div className="absolute inset-0 bg-white/10 backdrop-blur-sm">
                  {/* Decorative chart/visual */}
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-end gap-3">
                    <div className="w-10 h-14 bg-white/30 rounded-t-lg"></div>
                    <div className="w-10 h-20 bg-white/50 rounded-t-lg"></div>
                    <div className="w-10 h-24 bg-white/70 rounded-t-lg"></div>
                    <div className="w-10 h-16 bg-white/40 rounded-t-lg"></div>
                  </div>

                  {/* XP Badge */}
                  <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
                    <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                    <span className="text-xs font-bold text-gray-800">
                      {typeof game.xpReward === 'number' ? `${game.xpReward} XP` : game.xpReward}
                    </span>
                  </div>
                </div>
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-gray-900 mb-2" style={{ fontFamily: '"Playfair Display", "Georgia", serif' }}>{game.title}</h3>

              {/* Bottom Section */}
              <div className="flex items-center justify-between mb-4">
                <span className={`px-3 py-1 ${game.categoryBg} ${game.categoryText} text-xs font-semibold rounded-full`}>
                  {game.category}
                </span>

                {/* Participants */}
                <div className="flex items-center gap-1">
                  {[...Array(Math.min(game.participants, 3))].map((_, i) => (
                    <div
                      key={i}
                      className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 border-2 border-white shadow-sm -ml-2 first:ml-0"
                    />
                  ))}
                  {game.participants > 3 && (
                    <div className="w-7 h-7 rounded-full bg-gray-100 border-2 border-white shadow-sm -ml-2 flex items-center justify-center">
                      <span className="text-[10px] font-bold text-gray-600">+{game.participants - 3}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Play Button */}
              <button className={`w-full py-3.5 bg-gradient-to-r ${game.bgGradient} text-white font-bold rounded-xl hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2`}>
                <Play className="w-5 h-5 fill-white" />
                START GAME
              </button>
            </motion.div>
          ))}
        </div>

        {/* Learning Path CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-3xl p-8 text-center shadow-lg border border-gray-100"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
            <Trophy className="w-8 h-8 text-blue-600" strokeWidth={2} />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: '"Playfair Display", "Georgia", serif' }}>Ready for More?</h3>
          <p className="text-gray-600 mb-6" style={{ fontFamily: '"Inter", sans-serif' }}>
            Follow your personalized learning roadmap to master financial literacy
          </p>
          <button
            onClick={() => navigate('/game')}
            className="px-8 py-3.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold rounded-xl hover:shadow-xl transition-all duration-300"
          >
            View Learning Roadmap
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default GamesHorizon;
