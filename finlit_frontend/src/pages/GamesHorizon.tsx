import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Trophy,
  Play
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
      image: '/stock.jpeg',
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
      image: '/crossword.jpg',
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
      image: '/dc.png',
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
              {/* Visual Area */}
              <div className="w-full h-56 rounded-2xl mb-4 relative overflow-hidden">
                <img
                  src={game.image}
                  alt={game.title}
                  className={`w-full h-full bg-gray-50 ${game.id === 'crossword' ? 'object-cover scale-90' : 'object-contain'}`}
                />
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-gray-900 mb-2" style={{ fontFamily: '"Playfair Display", "Georgia", serif' }}>{game.title}</h3>

              {/* Bottom Section */}
              <div className="flex items-center mb-4">
                <span className={`px-3 py-1 ${game.categoryBg} ${game.categoryText} text-xs font-semibold rounded-full`}>
                  {game.category}
                </span>
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
