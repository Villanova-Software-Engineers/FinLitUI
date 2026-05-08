import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Trophy,
  Play
} from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';

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
      image: '/dc.jpg',
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
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-12 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-bold bg-gradient-to-r from-slate-900 via-blue-700 to-cyan-700 bg-clip-text text-transparent mb-4"
            style={{ fontFamily: '"Playfair Display", "Georgia", serif' }}
          >
            Financial Arena
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-gray-600 text-lg"
            style={{ fontFamily: '"Inter", sans-serif' }}
          >
            Level up your financial skills through engaging games
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
              <div className="relative overflow-hidden rounded-2xl transition-all duration-500 group-hover:scale-[1.02] flex-1 flex flex-col bg-white shadow-lg border border-gray-100">
                {/* Banner Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={game.image}
                    alt={game.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <div className="absolute top-3 left-3">
                    <span className={`px-3 py-1 ${game.categoryBg} ${game.categoryText} text-xs font-bold rounded-full`}>
                      {game.category}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col">
                  <h3
                    className="text-xl font-bold text-gray-800 mb-2"
                    style={{ fontFamily: '"Playfair Display", "Georgia", serif' }}
                  >
                    {game.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 flex-grow">
                    {game.description}
                  </p>

                  {/* Play button */}
                  <button
                    className={`w-full py-3 rounded-xl bg-gradient-to-r ${game.bgGradient} text-white font-bold text-base hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2`}
                  >
                    <Play className="w-5 h-5" />
                    <span>Play Now</span>
                  </button>
                </div>
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
              <Trophy className="w-5 h-5" />
              View Learning Roadmap
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default GamesHorizon;
