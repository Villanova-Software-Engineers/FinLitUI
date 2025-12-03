import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Star, Trophy, CheckCircle, XCircle, Heart, Zap, TrendingUp, Coins, Gamepad2, Rocket, Target, DollarSign, BarChart3, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const StockMarketModule = () => {
  const navigate = useNavigate();
  const [currentPhase, setCurrentPhase] = useState('adventure'); // 'adventure', 'trading-sim', 'portfolio-challenge', 'boss-battle'
  const [adventureLevel, setAdventureLevel] = useState(1);
  const [characterChoice, setCharacterChoice] = useState('');
  const [playerStats, setPlayerStats] = useState({ coins: 10000, experience: 0, level: 1, reputation: 0 });
  const [portfolio, setPortfolio] = useState([]);
  const [marketData, setMarketData] = useState([]);
  const [gameTime, setGameTime] = useState(0);
  const [activeChallenges, setActiveChallenges] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [choices, setChoices] = useState([]);
  const [tradingActive, setTradingActive] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);
  const [actionHistory, setActionHistory] = useState([]);


  // Adventure Storylines - Choose Your Path
  const adventureStories = [
    {
      id: 1,
      title: "The Trading Academy Entrance Exam",
      background: "bg-gradient-to-br from-slate-100 via-gray-100 to-stone-100",
      scene: "Elite Trading Academy",
      narrator: "Academy Director",
      story: "Welcome to the prestigious Trading Academy! You're one of 100 candidates competing for 10 spots. Your mission: Turn $10,000 into $15,000 in 30 days using real market strategies.",
      choices: [
        { id: 'A', text: "Choose the Aggressive Trader path (High risk, high reward)", effect: { coins: 0, trait: 'aggressive' }, next: 2 },
        { id: 'B', text: "Choose the Conservative Investor path (Steady and safe)", effect: { coins: 2000, trait: 'conservative' }, next: 3 },
        { id: 'C', text: "Choose the Tech Innovator path (Focus on growth stocks)", effect: { coins: 0, trait: 'tech-focused' }, next: 4 }
      ]
    },
    {
      id: 2,
      title: "🔥 The Wolf of Wall Street Challenge",
      background: "bg-gradient-to-br from-red-500 via-orange-500 to-yellow-500",
      scene: "📈 High-Frequency Trading Floor",
      narrator: "🐺 Trading Mentor",
      story: "You've chosen the aggressive path! Your mentor throws you into the deep end: 'Kid, I'm giving you access to day trading. You can make or lose thousands in minutes. What's your first move?'",
      choices: [
        { id: 'A', text: "🎯 Focus on momentum stocks - ride the waves!", effect: { experience: 50 }, next: 'momentum-game' },
        { id: 'B', text: "🔍 Analyze earnings reports for quick gains", effect: { experience: 30 }, next: 'analysis-game' },
        { id: 'C', text: "🎰 Go all-in on a hot tip (YOLO!)", effect: { coins: -2000, experience: 10 }, next: 'risk-management' }
      ]
    }
  ];

  // Dynamic Stock Market Data
  const initialStocks = [
    {
      id: 'AAPL',
      name: 'Apple Inc.',
      symbol: 'AAPL',
      price: 150.00,
      change: 0,
      changePercent: 0,
      volume: 1000000,
      volatility: 0.15,
      sector: 'Technology',
      emoji: '🍎',
      news: ['New iPhone launch expected', 'Strong quarterly earnings', 'AI chip development']
    },
    {
      id: 'TSLA',
      name: 'Tesla Inc.',
      symbol: 'TSLA',
      price: 250.00,
      change: 0,
      changePercent: 0,
      volume: 800000,
      volatility: 0.25,
      sector: 'Automotive',
      emoji: '🚗',
      news: ['New Gigafactory announced', 'FSD beta rollout', 'Energy storage breakthrough']
    },
    {
      id: 'GOOGL',
      name: 'Alphabet Inc.',
      symbol: 'GOOGL',
      price: 120.00,
      change: 0,
      changePercent: 0,
      volume: 600000,
      volatility: 0.12,
      sector: 'Technology',
      emoji: '🔍',
      news: ['AI breakthrough announced', 'Cloud revenue growth', 'Quantum computing progress']
    },
    {
      id: 'MSFT',
      name: 'Microsoft Corp.',
      symbol: 'MSFT',
      price: 280.00,
      change: 0,
      changePercent: 0,
      volume: 500000,
      volatility: 0.10,
      sector: 'Technology',
      emoji: '💻',
      news: ['Azure growth accelerating', 'Teams user milestone', 'Gaming division expansion']
    },
    {
      id: 'AMZN',
      name: 'Amazon.com Inc.',
      symbol: 'AMZN',
      price: 130.00,
      change: 0,
      changePercent: 0,
      volume: 700000,
      volatility: 0.18,
      sector: 'E-Commerce',
      emoji: '📦',
      news: ['Prime membership growth', 'AWS expansion', 'Drone delivery trials']
    }
  ];

  // Simplified market mechanics with slower price movements
  const updateMarketData = useCallback(() => {
    setMarketData(prevData => 
      prevData.map(stock => {
        // Much smaller volatility for easier understanding
        const volatilityFactor = (Math.random() - 0.5) * stock.volatility * 0.5; // Reduced by 75%
        const newPrice = Math.max(stock.price * (1 + volatilityFactor), 1);
        const change = newPrice - stock.price;
        const changePercent = ((change / stock.price) * 100).toFixed(2);
        
        return {
          ...stock,
          price: parseFloat(newPrice.toFixed(2)),
          change: parseFloat(change.toFixed(2)),
          changePercent: parseFloat(changePercent)
        };
      })
    );
  }, []);

  // Initialize market data
  useEffect(() => {
    setMarketData(initialStocks);
  }, []);

  // Market simulation timer - slower updates for better understanding
  useEffect(() => {
    if (tradingActive) {
      const interval = setInterval(() => {
        updateMarketData();
        setGameTime(prev => prev + 1);
      }, 5000); // Update every 5 seconds instead of 2
      
      return () => clearInterval(interval);
    }
  }, [tradingActive, updateMarketData]);

  // Trading functions
  const buyStock = (stock, shares) => {
    const totalCost = stock.price * shares;
    if (playerStats.coins >= totalCost) {
      setPlayerStats(prev => ({
        ...prev,
        coins: prev.coins - totalCost
      }));
      
      setPortfolio(prev => {
        const existing = prev.find(p => p.id === stock.id);
        if (existing) {
          return prev.map(p => 
            p.id === stock.id 
              ? { ...p, shares: p.shares + shares, avgPrice: ((p.avgPrice * p.shares) + totalCost) / (p.shares + shares) }
              : p
          );
        } else {
          return [...prev, { ...stock, shares, avgPrice: stock.price, purchaseTime: gameTime }];
        }
      });
      
      setActionHistory(prev => [...prev, {
        type: 'buy',
        stock: stock.symbol,
        shares,
        price: stock.price,
        time: gameTime
      }]);
    }
  };

  const sellStock = (portfolioStock, shares) => {
    const totalValue = portfolioStock.price * shares;
    const profit = (portfolioStock.price - portfolioStock.avgPrice) * shares;
    
    setPlayerStats(prev => ({
      ...prev,
      coins: prev.coins + totalValue,
      experience: prev.experience + Math.max(Math.floor(profit), 0)
    }));
    
    setPortfolio(prev => 
      prev.map(p => 
        p.id === portfolioStock.id
          ? { ...p, shares: p.shares - shares }
          : p
      ).filter(p => p.shares > 0)
    );
    
    setActionHistory(prev => [...prev, {
      type: 'sell',
      stock: portfolioStock.symbol,
      shares,
      price: portfolioStock.price,
      profit,
      time: gameTime
    }]);
  };

  // Challenge system
  const challenges = [
    {
      id: 'rookie-trader',
      title: '🥉 Rookie Trader Challenge',
      description: 'Make your first profitable trade',
      target: { type: 'profit', amount: 100 },
      reward: { coins: 500, experience: 100, badge: '🥉 First Profit!' },
      completed: false
    },
    {
      id: 'diversifier',
      title: '🌈 Portfolio Diversifier',
      description: 'Own stocks from 3 different sectors',
      target: { type: 'sectors', count: 3 },
      reward: { coins: 1000, experience: 200, badge: '🌈 Diversification Master!' },
      completed: false
    },
    {
      id: 'day-trader',
      title: '⚡ Lightning Trader',
      description: 'Complete 5 trades in one session',
      target: { type: 'trades', count: 5 },
      reward: { coins: 1500, experience: 300, badge: '⚡ Speed Demon!' },
      completed: false
    }
  ];

  // Market events that affect prices
  const marketEvents = [
    {
      id: 'tech-boom',
      title: '🚀 AI Revolution Announcement!',
      description: 'Major breakthrough in artificial intelligence sends tech stocks soaring!',
      effect: { sector: 'Technology', multiplier: 1.15 },
      duration: 10
    },
    {
      id: 'market-crash',
      title: '📉 Flash Crash Alert!',
      description: 'Unexpected economic news causes market-wide selloff!',
      effect: { sector: 'all', multiplier: 0.9 },
      duration: 8
    },
    {
      id: 'earnings-season',
      title: '📊 Earnings Surprise!',
      description: 'Companies beating expectations left and right!',
      effect: { sector: 'random', multiplier: 1.1 },
      duration: 12
    }
  ];

  // Character progression and achievements
  const checkAchievements = useCallback(() => {
    const newAchievements = [];
    
    // First profit achievement
    if (!achievements.some(a => a.id === 'first-profit')) {
      const totalProfit = actionHistory.filter(a => a.type === 'sell').reduce((sum, a) => sum + (a.profit || 0), 0);
      if (totalProfit > 0) {
        newAchievements.push({ id: 'first-profit', title: '💰 First Profit!', description: 'Made your first profitable trade!' });
      }
    }
    
    // Portfolio diversification
    if (!achievements.some(a => a.id === 'diversified')) {
      const sectors = new Set(portfolio.map(p => p.sector));
      if (sectors.size >= 3) {
        newAchievements.push({ id: 'diversified', title: '🌈 Diversified!', description: 'Portfolio spans 3+ sectors!' });
      }
    }
    
    if (newAchievements.length > 0) {
      setAchievements(prev => [...prev, ...newAchievements]);
      setPlayerStats(prev => ({ ...prev, experience: prev.experience + 100 }));
    }
  }, [actionHistory, portfolio, achievements]);

  // Check achievements after each action
  useEffect(() => {
    checkAchievements();
  }, [checkAchievements]);

  // Level up system
  useEffect(() => {
    const newLevel = Math.floor(playerStats.experience / 1000) + 1;
    if (newLevel > playerStats.level) {
      setPlayerStats(prev => ({ ...prev, level: newLevel }));
    }
  }, [playerStats.experience]);

  // Render stock card component
  const StockCard = ({ stock, canTrade = true }) => {
    const isOwned = portfolio.some(p => p.id === stock.id);
    const ownedStock = portfolio.find(p => p.id === stock.id);
    
    return (
      <motion.div
        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
          stock.changePercent >= 0 
            ? 'border-blue-400 bg-gradient-to-r from-blue-50 to-indigo-50'
            : 'border-slate-400 bg-gradient-to-r from-slate-50 to-gray-50'
        } ${selectedStock?.id === stock.id ? 'ring-4 ring-blue-300' : ''}`}
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setSelectedStock(selectedStock?.id === stock.id ? null : stock)}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{stock.emoji}</span>
            <div>
              <div className="font-bold text-gray-800">{stock.symbol}</div>
              <div className="text-sm text-gray-600">{stock.name}</div>
            </div>
          </div>
          {isOwned && (
            <div className="bg-blue-100 px-2 py-1 rounded-full">
              <span className="text-xs font-bold text-blue-800">You own {ownedStock.shares} shares</span>
            </div>
          )}
        </div>
        
        <div className="flex justify-between items-end">
          <div>
            <div className="text-2xl font-bold">${stock.price.toFixed(2)}</div>
            <div className={`text-sm font-semibold ${
              stock.changePercent >= 0 ? 'text-blue-600' : 'text-slate-600'
            }`}>
              {stock.changePercent >= 0 ? '▲' : '▼'} {Math.abs(stock.changePercent)}%
              <div className="text-xs text-gray-500">
                {stock.changePercent >= 0 ? 'Going up!' : 'Going down'}
              </div>
            </div>
          </div>
          
          {canTrade && selectedStock?.id === stock.id && (
            <div className="flex gap-2">
              <motion.button
                className="px-3 py-1 bg-blue-500 text-white rounded-lg font-semibold text-sm disabled:bg-gray-300"
                whileTap={{ scale: 0.95 }}
                onClick={(e) => { e.stopPropagation(); buyStock(stock, 1); }}
                disabled={playerStats.coins < stock.price}
              >
                {playerStats.coins < stock.price ? 'Not enough $' : 'Buy 1 Share'}
              </motion.button>
              {isOwned && (
                <motion.button
                  className="px-3 py-1 bg-slate-500 text-white rounded-lg font-semibold text-sm"
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => { e.stopPropagation(); sellStock(ownedStock, 1); }}
                >
                  Sell 1 Share
                </motion.button>
              )}
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  // Adventure choice handler
  const makeChoice = (choice) => {
    const currentStory = adventureStories[adventureLevel - 1];
    const selectedChoice = currentStory.choices.find(c => c.id === choice.id);
    
    // Apply choice effects
    setPlayerStats(prev => ({
      ...prev,
      coins: prev.coins + (selectedChoice.effect.coins || 0),
      experience: prev.experience + (selectedChoice.effect.experience || 0)
    }));
    
    // Add to action history
    setActionHistory(prev => [...prev, {
      type: 'choice',
      description: selectedChoice.text,
      time: gameTime
    }]);
    
    // Progress to next level or transition to trading
    if (selectedChoice.next === 'momentum-game' || selectedChoice.next === 'analysis-game') {
      setCurrentPhase('trading-sim');
      setTradingActive(true);
    } else if (typeof selectedChoice.next === 'number') {
      setAdventureLevel(selectedChoice.next);
    } else {
      setCurrentPhase('trading-sim');
      setTradingActive(true);
    }
  };

  // Calculate portfolio value
  const getPortfolioValue = () => {
    return portfolio.reduce((total, stock) => {
      const currentStock = marketData.find(m => m.id === stock.id);
      return total + (currentStock ? currentStock.price * stock.shares : 0);
    }, 0);
  };

  const getPortfolioReturn = () => {
    return portfolio.reduce((total, stock) => {
      const currentStock = marketData.find(m => m.id === stock.id);
      if (currentStock) {
        const currentValue = currentStock.price * stock.shares;
        const investedValue = stock.avgPrice * stock.shares;
        return total + (currentValue - investedValue);
      }
      return total;
    }, 0);
  };

  // Trigger random market events
  useEffect(() => {
    if (tradingActive && gameTime > 0 && gameTime % 15 === 0) {
      const randomEvent = marketEvents[Math.floor(Math.random() * marketEvents.length)];
      setCurrentEvent(randomEvent);
      
      // Apply event effects
      setMarketData(prevData => 
        prevData.map(stock => {
          if (randomEvent.effect.sector === 'all' || stock.sector === randomEvent.effect.sector || randomEvent.effect.sector === 'random') {
            return {
              ...stock,
              price: stock.price * randomEvent.effect.multiplier
            };
          }
          return stock;
        })
      );
      
      // Clear event after duration
      setTimeout(() => setCurrentEvent(null), randomEvent.duration * 1000);
    }
  }, [gameTime, tradingActive]);

  // Portfolio challenge handler
  const startPortfolioChallenge = () => {
    setCurrentPhase('portfolio-challenge');
    setPlayerStats(prev => ({ ...prev, coins: 25000 })); // Give more money for challenge
    setActiveChallenges([
      {
        id: 'beat-market',
        title: '📈 Beat the Market',
        description: 'Achieve 15% return in 60 seconds',
        target: 0.15,
        timeLimit: 60,
        reward: 2000
      }
    ]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-indigo-50 p-6">
      {/* Gamified Header */}
      <motion.div
        className="flex items-center justify-between mb-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-4 shadow-lg text-white"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <button
          onClick={() => navigate('/game')}
          className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition backdrop-blur-sm"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Roadmap
        </button>
        
        <div className="text-center">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            🚀 Trading Academy Adventure
          </h1>
          <p className="text-sm opacity-90">Interactive Stock Market Mastery</p>
        </div>

        <div className="flex items-center gap-6">
          {/* Player Stats */}
          <div className="flex items-center gap-2 bg-white/20 rounded-lg px-3 py-2 backdrop-blur-sm">
            <Coins className="w-5 h-5" />
            <span className="font-bold">${playerStats.coins.toLocaleString()}</span>
          </div>
          
          <div className="flex items-center gap-2 bg-white/20 rounded-lg px-3 py-2 backdrop-blur-sm">
            <Star className="w-5 h-5" />
            <span className="font-semibold">LVL {playerStats.level}</span>
          </div>
          
          <div className="flex items-center gap-2 bg-white/20 rounded-lg px-3 py-2 backdrop-blur-sm">
            <Trophy className="w-5 h-5" />
            <span className="font-semibold">{playerStats.experience} XP</span>
          </div>
        </div>
      </motion.div>

      {/* Achievement Notifications */}
      <AnimatePresence>
        {achievements.length > 0 && (
          <motion.div
            className="fixed top-4 right-4 z-50"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
          >
            {achievements.slice(-1).map(achievement => (
              <div key={achievement.id} className="bg-gradient-to-r from-blue-500 to-indigo-500 border border-blue-600 rounded-lg p-4 shadow-lg text-white">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🏆</span>
                  <div>
                    <div className="font-bold">{achievement.title}</div>
                    <div className="text-sm opacity-90">{achievement.description}</div>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Market Event Notification */}
      <AnimatePresence>
        {currentEvent && (
          <motion.div
            className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
          >
            <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg p-4 shadow-xl border-2 border-white">
              <div className="text-center">
                <div className="text-xl font-bold mb-1">{currentEvent.title}</div>
                <div className="text-sm opacity-90">{currentEvent.description}</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {currentPhase === 'adventure' ? (
        /* Choose Your Adventure */
        <motion.div
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {/* Adventure Progress */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-orange-600 mb-2">
              <span>Adventure Level {adventureLevel}</span>
              <span>Choose your path wisely!</span>
            </div>
            <div className="w-full bg-orange-100 rounded-full h-3">
              <motion.div
                className="bg-gradient-to-r from-orange-500 to-red-500 h-3 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(adventureLevel / adventureStories.length) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          {/* Adventure Story Card */}
          <motion.div
            key={adventureLevel}
            className={`${adventureStories[adventureLevel - 1]?.background || 'bg-gradient-to-br from-blue-400 to-emerald-500'} rounded-2xl p-8 shadow-lg mb-6 border-2 border-gray-200 ${adventureLevel === 1 ? 'text-gray-800' : 'text-white'}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Scene Header */}
            <div className="text-center mb-6">
              <motion.div 
                className="text-6xl mb-4"
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
              >
                {adventureLevel === 1 ? '📋' : '🎮'}
              </motion.div>
              <div className="text-lg opacity-90 font-semibold mb-2">
                {adventureStories[adventureLevel - 1]?.scene}
              </div>
              <h2 className="text-3xl font-bold mb-2">
                {adventureStories[adventureLevel - 1]?.title}
              </h2>
            </div>

            {/* Narrator Introduction */}
            <div className={`backdrop-blur-sm rounded-xl p-6 mb-6 shadow-lg border-l-4 ${
              adventureLevel === 1 
                ? 'bg-gray-50/80 border-blue-500' 
                : 'bg-white/20 border-blue-400'
            }`}>
              <div className="flex items-start gap-4">
                <motion.div 
                  className="text-5xl"
                  animate={{ bounce: [0, -10, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}
                >
                  {adventureLevel === 1 ? '👤' : '🎭'}
                </motion.div>
                <div className="flex-1">
                  <div className="flex items-center mb-3">
                    <div className="font-bold text-xl">
                      {adventureStories[adventureLevel - 1]?.narrator}
                    </div>
                  </div>
                  <div className={`rounded-lg p-4 mb-4 border-l-4 ${
                    adventureLevel === 1 
                      ? 'bg-gray-100/80 border-gray-300' 
                      : 'bg-white/30 border-white/50'
                  }`}>
                    <p className={`italic text-lg leading-relaxed ${
                      adventureLevel === 1 ? 'text-gray-800' : 'text-white'
                    }`}>
                      {adventureLevel === 1 ? adventureStories[adventureLevel - 1]?.story : `📢 ${adventureStories[adventureLevel - 1]?.story}`}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Adventure Choices */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-center mb-6">{adventureLevel === 1 ? 'What\'s your choice? Choose wisely!' : '⚡ What\'s your move? Choose wisely!'}</h3>
              {adventureStories[adventureLevel - 1]?.choices.map((choice, index) => (
                <motion.button
                  key={choice.id}
                  className={`w-full p-6 backdrop-blur-sm rounded-xl border-2 text-left transition-all group ${
                    adventureLevel === 1 
                      ? 'bg-gray-50/80 border-gray-300 hover:border-blue-400 text-gray-800' 
                      : 'bg-white/20 border-white/30 hover:border-blue-400 text-white'
                  }`}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.2 }}
                  onClick={() => makeChoice(choice)}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl group-hover:scale-110 transition-transform ${
                      adventureLevel === 1 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-blue-400 text-slate-800'
                    }`}>
                      {choice.id}
                    </div>
                    <div className="flex-1">
                      <p className={`text-lg font-semibold ${
                        adventureLevel === 1 ? 'text-gray-800' : 'text-white'
                      }`}>{choice.text}</p>
                      {choice.effect.coins && (
                        <p className={`text-sm mt-1 ${
                          adventureLevel === 1 ? 'text-blue-600' : 'text-blue-200'
                        }`}>💰 {choice.effect.coins > 0 ? '+' : ''}{choice.effect.coins} coins</p>
                      )}
                      {choice.effect.experience && (
                        <p className={`text-sm mt-1 ${
                          adventureLevel === 1 ? 'text-blue-600' : 'text-blue-200'
                        }`}>⭐ +{choice.effect.experience} XP</p>
                      )}
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Skip to Trading Button */}
          <div className="text-center">
            <button
              onClick={() => { setCurrentPhase('trading-sim'); setTradingActive(true); }}
              className="px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-xl font-bold text-lg transition shadow-lg transform hover:scale-105"
            >
              📊 Start Trading Practice! 📊
            </button>
          </div>
        </motion.div>
      ) : currentPhase === 'trading-sim' ? (
        /* Live Trading Simulation */
        <motion.div
          className="max-w-7xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Trading Dashboard Header */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-5 h-5" />
                <span className="font-semibold">Your Money</span>
              </div>
              <div className="text-2xl font-bold">${playerStats.coins.toLocaleString()}</div>
              <div className="text-xs opacity-80">Available to invest</div>
            </div>
            
            <div className="bg-gradient-to-r from-slate-500 to-slate-600 rounded-xl p-4 text-white">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="w-5 h-5" />
                <span className="font-semibold">Your Stocks</span>
              </div>
              <div className="text-2xl font-bold">${getPortfolioValue().toLocaleString()}</div>
              <div className="text-xs opacity-80">Value of owned stocks</div>
            </div>
            
            <div className={`rounded-xl p-4 text-white ${
              getPortfolioReturn() >= 0 
                ? 'bg-gradient-to-r from-blue-500 to-indigo-500'
                : 'bg-gradient-to-r from-slate-500 to-gray-500'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5" />
                <span className="font-semibold">{getPortfolioReturn() >= 0 ? 'Profit' : 'Learning'}</span>
              </div>
              <div className="text-2xl font-bold">
                {getPortfolioReturn() >= 0 ? '+' : ''}${getPortfolioReturn().toLocaleString()}
              </div>
              <div className="text-xs opacity-80">
                {getPortfolioReturn() >= 0 ? 'Great job!' : "Don't worry, keep learning!"}
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-purple-400 to-purple-600 rounded-xl p-4 text-white">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-5 h-5" />
                <span className="font-semibold">Time Trading</span>
              </div>
              <div className="text-2xl font-bold">{Math.floor(gameTime / 12)}:{((gameTime % 12) * 5).toString().padStart(2, '0')}</div>
              <div className="text-xs opacity-80">Minutes in market</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Stock Market */}
            <div className="lg:col-span-2 space-y-4">
              {/* Trading Guide */}
              <div className="mb-6 p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                <h4 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                  📚 Quick Guide: How to Trade Stocks
                </h4>
                <div className="text-sm text-gray-700 space-y-1">
                  <p>• <strong>Rising prices</strong> = Stock going up (good time to sell if you own it)</p>
                  <p>• <strong>Falling prices</strong> = Stock going down (might be good time to buy)</p>
                  <p>• <strong>Goal:</strong> Buy low, sell high to make profit!</p>
                  <p>• <strong>Challenge:</strong> Try to grow your money from $10,000 to $12,000 (20% profit)</p>
                </div>
              </div>
              
              {/* Progress Tracker */}
              {tradingActive && (
                <div className="mb-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-gray-700">Challenge Progress:</span>
                    <span className="text-lg font-bold text-slate-700">
                      ${(playerStats.coins + getPortfolioValue()).toLocaleString()} / $12,000
                    </span>
                  </div>
                  <div className="mt-2 bg-white rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(((playerStats.coins + getPortfolioValue()) / 12000) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    {((playerStats.coins + getPortfolioValue()) >= 12000) 
                      ? "🎉 Challenge Complete! You're a trading master!" 
                      : `$${(12000 - (playerStats.coins + getPortfolioValue())).toLocaleString()} more to go!`
                    }
                  </div>
                </div>
              )}
              
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  📋 Simple Trading Market
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => setTradingActive(!tradingActive)}
                    className={`px-4 py-2 rounded-lg font-semibold transition ${
                      tradingActive 
                        ? 'bg-slate-500 hover:bg-slate-600 text-white'
                        : 'bg-blue-500 hover:bg-blue-600 text-white'
                    }`}
                  >
                    {tradingActive ? '⏸️ Pause' : '▶️ Start'} Trading
                  </button>
                  <button
                    onClick={startPortfolioChallenge}
                    className="px-4 py-2 bg-gradient-to-r from-slate-600 to-gray-600 text-white rounded-lg font-semibold hover:from-slate-700 hover:to-gray-700 transition"
                  >
                    🏆 Challenge Mode
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {marketData.map((stock, index) => (
                  <motion.div
                    key={stock.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <StockCard stock={stock} canTrade={tradingActive} />
                  </motion.div>
                ))}
              </div>
              
              {/* Trading Interface */}
              {selectedStock && (
                <motion.div
                  className="bg-white rounded-xl p-6 shadow-lg border-2 border-blue-400"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <h4 className="text-xl font-bold mb-4 flex items-center gap-2">
                    {selectedStock.emoji} Trading {selectedStock.symbol}
                  </h4>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Shares to Buy/Sell</label>
                      <div className="flex gap-2">
                        <input 
                          type="number" 
                          min="1" 
                          defaultValue="1" 
                          className="flex-1 border rounded-lg px-3 py-2"
                          id="shareInput"
                        />
                        <button
                          onClick={() => {
                            const shares = parseInt(document.getElementById('shareInput').value) || 1;
                            buyStock(selectedStock, shares);
                          }}
                          disabled={!tradingActive || playerStats.coins < selectedStock.price}
                          className="px-4 py-2 bg-green-500 text-white rounded-lg font-semibold disabled:bg-gray-300"
                        >
                          💰 Buy
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Current Position</label>
                      <div className="text-lg font-bold text-gray-800">
                        {portfolio.find(p => p.id === selectedStock.id)?.shares || 0} shares
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    <p><strong>Sector:</strong> {selectedStock.sector}</p>
                    <p><strong>Recent News:</strong> {selectedStock.news[0]}</p>
                  </div>
                </motion.div>
              )}
            </div>
            
            {/* Portfolio & Stats */}
            <div className="space-y-6">
              {/* Portfolio */}
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <h4 className="text-xl font-bold mb-4 flex items-center gap-2">
                  💼 Your Portfolio
                </h4>
                {portfolio.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No positions yet. Start trading!</p>
                ) : (
                  <div className="space-y-3">
                    {portfolio.map(stock => {
                      const currentStock = marketData.find(m => m.id === stock.id);
                      const profit = currentStock ? (currentStock.price - stock.avgPrice) * stock.shares : 0;
                      return (
                        <motion.div
                          key={stock.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          layout
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{stock.emoji}</span>
                            <div>
                              <div className="font-semibold">{stock.symbol}</div>
                              <div className="text-sm text-gray-600">{stock.shares} shares</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold">${(currentStock?.price * stock.shares).toFixed(2) || 0}</div>
                            <div className={`text-sm ${
                              profit >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {profit >= 0 ? '+' : ''}${profit.toFixed(2)}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
              
              {/* Recent Actions */}
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <h4 className="text-xl font-bold mb-4 flex items-center gap-2">
                  📜 Trade History
                </h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {actionHistory.slice(-5).reverse().map((action, index) => (
                    <div key={index} className="text-sm p-2 bg-gray-50 rounded">
                      <span className={`font-semibold ${
                        action.type === 'buy' ? 'text-green-600' : 
                        action.type === 'sell' ? 'text-red-600' : 'text-blue-600'
                      }`}>
                        {action.type.toUpperCase()}
                      </span>
                      {action.stock && (
                        <span> {action.shares} {action.stock} @ ${action.price}</span>
                      )}
                      {action.profit && (
                        <span className={action.profit >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {' '}(${action.profit.toFixed(2)})
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Achievements */}
              {achievements.length > 0 && (
                <div className="bg-gradient-to-r from-slate-100 to-blue-100 rounded-xl p-6 border-2 border-slate-300">
                  <h4 className="text-xl font-bold mb-4 flex items-center gap-2 text-slate-800">
                    🏆 Achievements
                  </h4>
                  <div className="space-y-2">
                    {achievements.map(achievement => (
                      <div key={achievement.id} className="bg-white/80 p-3 rounded-lg">
                        <div className="font-semibold text-slate-800">{achievement.title}</div>
                        <div className="text-sm text-slate-600">{achievement.description}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

        </motion.div>
      ) : currentPhase === 'portfolio-challenge' ? (
        /* Portfolio Challenge Mode */
        <motion.div
          className="max-w-5xl mx-auto"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Challenge Header */}
          <div className="text-center mb-8">
            <motion.div 
              className="text-6xl mb-4"
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              🏆
            </motion.div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              Portfolio Challenge Arena
            </h2>
            <p className="text-lg text-gray-600">
              Beat the market with smart trading decisions!
            </p>
          </div>

          {/* Challenge Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl p-6 text-white text-center">
              <div className="text-3xl font-bold">${playerStats.coins.toLocaleString()}</div>
              <div className="text-sm opacity-90">Starting Capital</div>
            </div>
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl p-6 text-white text-center">
              <div className="text-3xl font-bold">15%</div>
              <div className="text-sm opacity-90">Target Return</div>
            </div>
            <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-xl p-6 text-white text-center">
              <div className="text-3xl font-bold">60s</div>
              <div className="text-sm opacity-90">Time Limit</div>
            </div>
          </div>

          {/* Challenge Arena */}
          <div className="bg-gradient-to-r from-slate-100 to-blue-100 rounded-2xl p-8 border-2 border-slate-300">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-blue-800 mb-2">
                ⚡ Simple Trading Challenge ⚡
              </h3>
              <p className="text-blue-700">
                Practice your trading skills! Try to grow your money from $25,000 to $28,750 (15% return)
              </p>
            </div>
            
            {/* Quick Trade Interface */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {marketData.map(stock => (
                <motion.div
                  key={stock.id}
                  className="bg-white rounded-xl p-4 shadow-lg cursor-pointer border-2 border-transparent hover:border-blue-500 transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="text-center">
                    <div className="text-3xl mb-2">{stock.emoji}</div>
                    <div className="font-bold text-sm">{stock.symbol}</div>
                    <div className="text-lg font-bold">${stock.price.toFixed(2)}</div>
                    <div className={`text-sm font-semibold ${
                      stock.changePercent >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stock.changePercent >= 0 ? '▲' : '▼'} {Math.abs(stock.changePercent)}%
                    </div>
                    <div className="mt-2 space-x-1">
                      <button
                        onClick={() => buyStock(stock, 10)}
                        className="px-2 py-1 bg-blue-500 text-white rounded text-xs font-bold"
                      >
                        BUY 10
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            
            {/* Challenge Controls */}
            <div className="text-center mt-6">
              <button
                onClick={() => setCurrentPhase('trading-sim')}
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-xl font-bold text-lg transition shadow-lg"
              >
                📊 Start Trading Challenge! 📊
              </button>
            </div>
          </div>
        </motion.div>
      ) : (
        /* Victory Screen */
        <motion.div
          className="max-w-2xl mx-auto text-center"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="bg-gradient-to-r from-blue-500 via-indigo-500 to-slate-600 rounded-2xl p-8 shadow-lg text-white">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <div className="text-8xl mb-6">🏆</div>
            </motion.div>
            
            <h2 className="text-4xl font-bold mb-4">Trading Master!</h2>
            <p className="text-xl opacity-90 mb-6">
              You've conquered the markets and learned the art of investing!
            </p>

            {/* Final Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
                <div className="text-3xl font-bold">${playerStats.coins.toLocaleString()}</div>
                <div className="text-sm opacity-90">Final Cash</div>
              </div>
              <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
                <div className="text-3xl font-bold">${getPortfolioValue().toLocaleString()}</div>
                <div className="text-sm opacity-90">Portfolio Value</div>
              </div>
              <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
                <div className="text-3xl font-bold">LVL {playerStats.level}</div>
                <div className="text-sm opacity-90">Level Reached</div>
              </div>
              <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
                <div className="text-3xl font-bold">{achievements.length}</div>
                <div className="text-sm opacity-90">Achievements</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => navigate('/game')}
                className="px-8 py-4 bg-white/20 hover:bg-white/30 text-white rounded-xl font-bold transition backdrop-blur-sm"
              >
                🚀 Back to Roadmap
              </button>
              <button
                onClick={() => {
                  setCurrentPhase('adventure');
                  setAdventureLevel(1);
                  setPlayerStats({ coins: 10000, experience: 0, level: 1, reputation: 0 });
                  setPortfolio([]);
                  setActionHistory([]);
                  setAchievements([]);
                  setGameTime(0);
                  setTradingActive(false);
                }}
                className="px-8 py-4 bg-white/20 hover:bg-white/30 text-white rounded-xl font-bold transition backdrop-blur-sm"
              >
                🔄 Play Again
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default StockMarketModule;