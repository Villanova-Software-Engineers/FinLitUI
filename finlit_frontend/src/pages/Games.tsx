import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, TrendingUp, Brain, Target, Play, Zap, Trophy, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Games = () => {
  const navigate = useNavigate();
  const [selectedGame, setSelectedGame] = useState(null);

  const games = [
    {
      id: 'stock-simulation',
      title: 'Stock Trading Game',
      description: 'Master the markets with real-time trading simulation',
      icon: TrendingUp,
      route: '/stock-simulation',
      difficulty: 'Expert',
      estimatedTime: '15-20 min',
      xpReward: 100,
      primaryColor: '#E2E8F0', // Slate-200
      accentColor: '#3B82F6', // Blue-500
      glowColor: '#3B82F6',
      category: 'Strategy'
    },
    {
      id: 'crossword',
      title: 'Financial Crossword',
      description: 'Challenge your financial vocabulary knowledge',
      icon: Brain,
      route: '/',
      difficulty: 'Rookie',
      estimatedTime: '10-15 min',
      xpReward: '2 XP per word',
      primaryColor: '#F3F4F6', // Gray-100
      accentColor: '#10B981', // Emerald-500
      glowColor: '#10B981',
      category: 'Puzzle'
    },
    {
      id: 'daily-challenge',
      title: 'Daily Challenge',
      description: 'Build your streak with daily financial quests',
      icon: Zap,
      route: '/',
      difficulty: 'Dynamic',
      estimatedTime: '2-3 min',
      xpReward: 5,
      primaryColor: '#FEF3C7', // Amber-100
      accentColor: '#F59E0B', // Amber-500
      glowColor: '#F59E0B',
      category: 'Quest'
    }
  ];

  const handleGameClick = (game) => {
    navigate(game.route);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft size={24} />
              <span className="font-medium">Back to Home</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-12 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-600 to-cyan-600 bg-clip-text text-transparent mb-4"
            style={{ fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif' }}
          >
            FINANCIAL ARENA
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-gray-600 text-lg font-light tracking-wide"
          >
            Level up your financial skills through premium gaming experiences
          </motion.p>
        </div>

        {/* Games Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
          {games.map((game, index) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -10, transition: { duration: 0.3 } }}
              onClick={() => handleGameClick(game)}
              className="group cursor-pointer h-full flex flex-col"
            >
              <div 
                className="relative overflow-hidden rounded-2xl transition-all duration-500 group-hover:scale-[1.02] flex-1 flex flex-col"
                style={{ 
                  background: `linear-gradient(135deg, ${game.primaryColor} 0%, ${game.primaryColor}E6 100%)`,
                  border: `1px solid ${game.accentColor}20`,
                  boxShadow: `0 8px 32px ${game.glowColor}15, inset 0 1px 0 rgba(255,255,255,0.1)`
                }}
              >
                {/* Glow effect */}
                <div 
                  className="absolute -inset-1 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-lg"
                  style={{ background: `linear-gradient(135deg, ${game.glowColor}30, transparent)` }}
                />
                
                {/* Glass effect overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent" />
                
                {/* Geometric pattern */}
                <div 
                  className="absolute top-0 right-0 w-32 h-32 opacity-5"
                  style={{
                    background: `radial-gradient(circle at center, ${game.accentColor} 1px, transparent 1px)`,
                    backgroundSize: '20px 20px'
                  }}
                />
                
                <div className="relative p-8 flex-1 flex flex-col">
                  {/* Header */}
                  <div className="flex items-start gap-6 mb-8">
                    <div 
                      className="w-16 h-16 rounded-xl flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-transform duration-300"
                      style={{ 
                        background: `linear-gradient(135deg, ${game.accentColor}, ${game.accentColor}CC)`,
                        boxShadow: `0 8px 25px ${game.accentColor}40`
                      }}
                    >
                      <game.icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span 
                          className="px-3 py-1 text-xs font-bold rounded-full text-white"
                          style={{ background: game.accentColor, border: `1px solid ${game.accentColor}` }}
                        >
                          {game.category}
                        </span>
                        <span 
                          className={`text-xs font-bold ${
                            game.difficulty === 'Expert' ? 'text-red-600' :
                            game.difficulty === 'Rookie' ? 'text-emerald-600' :
                            'text-yellow-600'
                          }`}
                        >
                          {game.difficulty}
                        </span>
                      </div>
                      <h3 
                        className="text-2xl font-bold text-gray-800 mb-2 group-hover:text-gray-700 transition-colors"
                        style={{ fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif' }}
                      >
                        {game.title}
                      </h3>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {game.description}
                      </p>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-4 mb-8 flex-grow">
                    <div 
                      className="rounded-xl p-4 text-center backdrop-blur-sm"
                      style={{ background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.3)' }}
                    >
                      <div className="text-gray-600 text-xs font-medium mb-2 uppercase tracking-wide">Duration</div>
                      <div className="text-gray-800 font-bold text-lg">{game.estimatedTime}</div>
                    </div>
                    <div 
                      className="rounded-xl p-4 text-center backdrop-blur-sm"
                      style={{ 
                        background: `linear-gradient(135deg, ${game.accentColor}20, ${game.accentColor}10)`,
                        border: `1px solid ${game.accentColor}30`
                      }}
                    >
                      <div className="text-gray-600 text-xs font-medium mb-2 uppercase tracking-wide">Reward</div>
                      <div className="flex items-center justify-center gap-2">
                        <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                        <span className="text-gray-800 font-bold text-lg">
                          {typeof game.xpReward === 'number' ? `${game.xpReward} XP` : game.xpReward}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Play button */}
                  <button 
                    className="w-full py-4 rounded-xl text-white font-bold text-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3 relative overflow-hidden"
                    style={{ 
                      background: `linear-gradient(135deg, ${game.accentColor}, ${game.accentColor}DD)`,
                      boxShadow: `0 8px 25px ${game.accentColor}40`
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <Play className="w-6 h-6 relative z-10" />
                    <span className="relative z-10 tracking-wide">START GAME</span>
                  </button>
                </div>

                {/* Accent lines */}
                <div 
                  className="absolute top-0 left-0 right-0 h-px"
                  style={{ background: `linear-gradient(90deg, transparent, ${game.accentColor}, transparent)` }}
                />
                <div 
                  className="absolute bottom-0 left-0 right-0 h-px"
                  style={{ background: `linear-gradient(90deg, transparent, ${game.accentColor}60, transparent)` }}
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Learning Path Section */}
        <div className="mt-16 bg-white rounded-lg border border-gray-200 p-8">
          <div className="text-center">
            <button
              onClick={() => navigate('/game')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-md transition-colors"
            >
              <Target className="w-5 h-5" />
              View Learning Roadmap
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Games;