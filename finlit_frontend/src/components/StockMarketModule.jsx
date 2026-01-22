import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Star, Trophy, CheckCircle, XCircle, Heart, Zap, TrendingUp, Coins, Gamepad2, Rocket, Target, DollarSign, BarChart3, Activity, BookOpen, GraduationCap, Play, RefreshCw, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useModuleScore, MODULES } from '../hooks/useModuleScore';

const StockMarketModule = () => {
  const navigate = useNavigate();
  const { saveScore, resetModule, isModulePassed, isLoading: progressLoading } = useModuleScore();

  // Check if module is already passed
  const modulePassed = isModulePassed(MODULES.STOCK_MARKET?.id);

  const [currentPhase, setCurrentPhase] = useState('teaching'); // 'teaching', 'test', 'trading-sim', 'final-results'
  const [teachingStep, setTeachingStep] = useState(0);
  const [testQuestion, setTestQuestion] = useState(0);
  const [testScore, setTestScore] = useState(0);
  const [testAnswers, setTestAnswers] = useState([]);
  const [playerStats, setPlayerStats] = useState({ coins: 10000, experience: 0, level: 1, reputation: 0 });
  const [portfolio, setPortfolio] = useState([]);
  const [marketData, setMarketData] = useState([]);
  const [gameTime, setGameTime] = useState(0);
  const [achievements, setAchievements] = useState([]);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [tradingActive, setTradingActive] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);
  const [actionHistory, setActionHistory] = useState([]);
  const [buyQuantity, setBuyQuantity] = useState(1);
  const [sellQuantity, setSellQuantity] = useState(1);
  const [notifications, setNotifications] = useState([]);

  // Module score saving state
  const [isSaving, setIsSaving] = useState(false);
  const [saveResult, setSaveResult] = useState(null);
  const [isResetting, setIsResetting] = useState(false);

  // Teaching Content - Stock Market Basics
  const teachingContent = [
    {
      title: "What is the Stock Market?",
      icon: "📈",
      content: "The stock market is like a giant marketplace where people buy and sell tiny pieces of companies called 'shares' or 'stocks'. When you buy a share, you become a part-owner of that company!",
      example: "If Apple has 1 million shares and you buy 1 share, you own 1/1,000,000th of Apple!",
      keyPoints: [
        "Stocks represent ownership in a company",
        "Stock prices change based on supply and demand",
        "You make money when stock prices go up after you buy"
      ]
    },
    {
      title: "How Do Stock Prices Move?",
      icon: "📊",
      content: "Stock prices go up when more people want to buy than sell (demand > supply), and go down when more people want to sell than buy (supply > demand).",
      example: "If a company announces a new amazing product, more people want to buy their stock, so the price goes up!",
      keyPoints: [
        "Good news = more buyers = price goes UP",
        "Bad news = more sellers = price goes DOWN",
        "Prices change every second during trading hours"
      ]
    },
    {
      title: "Buy Low, Sell High",
      icon: "💰",
      content: "The golden rule of investing is simple: Buy stocks when prices are low, and sell them when prices are high. The difference is your profit!",
      example: "Buy 10 shares at $100 each = $1,000 invested. Sell when price is $150 = $1,500. Your profit = $500!",
      keyPoints: [
        "Profit = Selling Price - Buying Price",
        "Never invest money you can't afford to lose",
        "Patience is key - don't panic sell!"
      ]
    },
    {
      title: "Diversification",
      icon: "🌈",
      content: "Don't put all your eggs in one basket! Spreading your money across different stocks and sectors reduces risk. If one stock drops, others might go up.",
      example: "Instead of putting $1,000 in just Apple, put $200 each in Apple, Google, Amazon, Tesla, and Microsoft.",
      keyPoints: [
        "Spread investments across multiple stocks",
        "Invest in different sectors (tech, health, energy)",
        "This protects you from big losses"
      ]
    },
    {
      title: "Understanding Risk",
      icon: "⚠️",
      content: "Higher potential rewards usually come with higher risks. Blue-chip stocks (big, stable companies) are safer but grow slower. Growth stocks are riskier but can grow faster.",
      example: "A small startup might double your money or lose it all. Apple is unlikely to double quickly, but also unlikely to crash.",
      keyPoints: [
        "Risk and reward go hand in hand",
        "Young investors can take more risks",
        "Always research before investing"
      ]
    }
  ];

  // Test Questions
  const testQuestions = [
    {
      question: "What happens to a stock's price when more people want to BUY than SELL?",
      options: ["Price goes DOWN", "Price goes UP", "Price stays the same", "The stock disappears"],
      correct: 1,
      explanation: "When demand (buyers) exceeds supply (sellers), prices increase!"
    },
    {
      question: "What is the golden rule of investing?",
      options: ["Buy high, sell low", "Buy low, sell high", "Never sell anything", "Only buy expensive stocks"],
      correct: 1,
      explanation: "Buy low, sell high - this is how you make profit!"
    },
    {
      question: "Why is diversification important?",
      options: ["It makes trading more fun", "It reduces risk by spreading investments", "It guarantees profits", "It's not important"],
      correct: 1,
      explanation: "Diversification protects you - if one stock drops, others might rise!"
    },
    {
      question: "If you buy 5 shares at $20 each and sell them at $30 each, what's your profit?",
      options: ["$20", "$50", "$100", "$150"],
      correct: 1,
      explanation: "5 shares x ($30 - $20) = 5 x $10 = $50 profit!"
    },
    {
      question: "What typically happens to stock prices when a company announces bad news?",
      options: ["Prices go up", "Prices go down", "Nothing happens", "Trading stops"],
      correct: 1,
      explanation: "Bad news causes more people to sell, which drives prices down."
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

  // Market update mechanics
  const updateMarketData = useCallback(() => {
    setMarketData(prevData =>
      prevData.map(stock => {
        const volatilityFactor = (Math.random() - 0.5) * stock.volatility * 0.5;
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

  // Market simulation timer (slower updates for better experience)
  useEffect(() => {
    if (tradingActive) {
      const interval = setInterval(() => {
        updateMarketData();
        setGameTime(prev => prev + 1);
      }, 8000);

      return () => clearInterval(interval);
    }
  }, [tradingActive, updateMarketData]);

  // Add notification helper
  const addNotification = (type, title, message, details = null) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, type, title, message, details, timestamp: new Date() }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  // Trading functions with bulk support
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
        total: totalCost,
        time: gameTime
      }]);

      addNotification('success', 'Purchase Complete!', `Bought ${shares} ${stock.symbol} shares`, {
        shares,
        price: stock.price,
        total: totalCost
      });
    }
  };

  const sellStock = (portfolioStock, shares) => {
    const currentStock = marketData.find(m => m.id === portfolioStock.id);
    const currentPrice = currentStock?.price || portfolioStock.price;
    const totalValue = currentPrice * shares;
    const profit = (currentPrice - portfolioStock.avgPrice) * shares;

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
      price: currentPrice,
      total: totalValue,
      profit,
      time: gameTime
    }]);

    addNotification(profit >= 0 ? 'success' : 'warning', 'Sale Complete!', `Sold ${shares} ${portfolioStock.symbol} shares`, {
      shares,
      price: currentPrice,
      total: totalValue,
      profit
    });
  };

  // Market events - news-style announcements
  const marketEvents = [
    {
      id: 'tesla-earnings',
      title: '📰 TSLA Earnings Beat!',
      description: 'Tesla reports record quarterly earnings, beating analyst expectations by 15%!',
      effect: { stock: 'TSLA', multiplier: 1.12 },
      duration: 10
    },
    {
      id: 'apple-product',
      title: '📰 Apple Unveils New Product!',
      description: 'Apple announces revolutionary new device, stock surges on investor optimism!',
      effect: { stock: 'AAPL', multiplier: 1.10 },
      duration: 10
    },
    {
      id: 'google-ai',
      title: '📰 Google AI Breakthrough!',
      description: 'Alphabet announces major AI advancement, shares climb on the news!',
      effect: { stock: 'GOOGL', multiplier: 1.08 },
      duration: 10
    },
    {
      id: 'amazon-growth',
      title: '📰 Amazon Cloud Revenue Soars!',
      description: 'AWS reports 30% growth, Amazon stock rises on strong cloud performance!',
      effect: { stock: 'AMZN', multiplier: 1.11 },
      duration: 10
    },
    {
      id: 'microsoft-deal',
      title: '📰 Microsoft Lands Major Contract!',
      description: 'Microsoft wins $10B government contract, investors react positively!',
      effect: { stock: 'MSFT', multiplier: 1.09 },
      duration: 10
    },
    {
      id: 'tech-sector-dip',
      title: '📰 Tech Sector Pullback',
      description: 'Interest rate concerns cause temporary tech sector weakness.',
      effect: { sector: 'Technology', multiplier: 0.95 },
      duration: 8
    },
    {
      id: 'market-rally',
      title: '📰 Market Rally!',
      description: 'Positive economic data sparks broad market rally across all sectors!',
      effect: { sector: 'all', multiplier: 1.06 },
      duration: 12
    },
    {
      id: 'tesla-delivery',
      title: '📰 Tesla Delivery Record!',
      description: 'Tesla smashes quarterly delivery expectations, shares jump!',
      effect: { stock: 'TSLA', multiplier: 1.08 },
      duration: 10
    }
  ];

  // Check achievements
  const checkAchievements = useCallback(() => {
    const newAchievements = [];

    if (!achievements.some(a => a.id === 'first-profit')) {
      const totalProfit = actionHistory.filter(a => a.type === 'sell').reduce((sum, a) => sum + (a.profit || 0), 0);
      if (totalProfit > 0) {
        newAchievements.push({ id: 'first-profit', title: 'First Profit!', description: 'Made your first profitable trade!' });
      }
    }

    if (!achievements.some(a => a.id === 'diversified')) {
      const sectors = new Set(portfolio.map(p => p.sector));
      if (sectors.size >= 3) {
        newAchievements.push({ id: 'diversified', title: 'Diversified!', description: 'Portfolio spans 3+ sectors!' });
      }
    }

    if (!achievements.some(a => a.id === 'big-trader')) {
      const totalTrades = actionHistory.filter(a => a.type === 'buy' || a.type === 'sell').length;
      if (totalTrades >= 10) {
        newAchievements.push({ id: 'big-trader', title: 'Active Trader!', description: 'Completed 10 trades!' });
      }
    }

    if (newAchievements.length > 0) {
      setAchievements(prev => [...prev, ...newAchievements]);
      setPlayerStats(prev => ({ ...prev, experience: prev.experience + 100 }));
    }
  }, [actionHistory, portfolio, achievements]);

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

  // Trigger random market events (news-style)
  useEffect(() => {
    if (tradingActive && gameTime > 0 && gameTime % 12 === 0) {
      const randomEvent = marketEvents[Math.floor(Math.random() * marketEvents.length)];
      setCurrentEvent(randomEvent);

      setMarketData(prevData =>
        prevData.map(stock => {
          // Handle stock-specific events
          if (randomEvent.effect.stock && stock.id === randomEvent.effect.stock) {
            return {
              ...stock,
              price: parseFloat((stock.price * randomEvent.effect.multiplier).toFixed(2))
            };
          }
          // Handle sector-wide events
          if (randomEvent.effect.sector === 'all' || stock.sector === randomEvent.effect.sector) {
            return {
              ...stock,
              price: parseFloat((stock.price * randomEvent.effect.multiplier).toFixed(2))
            };
          }
          return stock;
        })
      );

      setTimeout(() => setCurrentEvent(null), randomEvent.duration * 1000);
    }
  }, [gameTime, tradingActive]);

  // Handle test answer
  const handleTestAnswer = (answerIndex) => {
    const currentQ = testQuestions[testQuestion];
    const isCorrect = answerIndex === currentQ.correct;

    setTestAnswers(prev => [...prev, { question: testQuestion, answer: answerIndex, correct: isCorrect }]);

    if (isCorrect) {
      setTestScore(prev => prev + 1);
    }

    if (testQuestion < testQuestions.length - 1) {
      setTimeout(() => setTestQuestion(prev => prev + 1), 1500);
    } else {
      setTimeout(() => {
        if (testScore + (isCorrect ? 1 : 0) >= 3) {
          setCurrentPhase('trading-sim');
          setTradingActive(true);
          addNotification('success', 'Test Passed!', 'You\'re ready to start trading!');
        }
      }, 2000);
    }
  };

  // Start trading simulation
  const startTradingSimulation = () => {
    setCurrentPhase('trading-sim');
    setTradingActive(true);
    setPlayerStats({ coins: 10000, experience: 0, level: 1, reputation: 0 });
    setPortfolio([]);
    setActionHistory([]);
    setGameTime(0);
  };

  // Stock Card Component - Compact version
  const StockCard = ({ stock, canTrade = true }) => {
    const isOwned = portfolio.some(p => p.id === stock.id);
    const ownedStock = portfolio.find(p => p.id === stock.id);
    const isSelected = selectedStock?.id === stock.id;

    return (
      <motion.div
        className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
          stock.changePercent >= 0
            ? 'border-emerald-300 bg-gradient-to-br from-emerald-50 to-green-50'
            : 'border-rose-300 bg-gradient-to-br from-rose-50 to-red-50'
        } ${isSelected ? 'ring-2 ring-blue-400 shadow-lg' : 'shadow-sm hover:shadow-md'}`}
        whileHover={{ scale: 1.01, y: -2 }}
        whileTap={{ scale: 0.99 }}
        onClick={() => setSelectedStock(isSelected ? null : stock)}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-sm bg-gray-100 p-1.5 rounded">{stock.emoji}</span>
            <div>
              <div className="font-bold text-sm tracking-tight text-gray-900">{stock.symbol}</div>
              <div className="text-[10px] text-gray-500 font-medium truncate max-w-[80px]">{stock.name}</div>
            </div>
          </div>
          {isOwned && (
            <div className="bg-blue-100 px-2 py-0.5 rounded-full">
              <span className="text-xs font-bold text-blue-700">{ownedStock.shares}</span>
            </div>
          )}
        </div>

        <div className="flex justify-between items-end">
          <div>
            <div className="text-lg font-bold text-gray-900">${stock.price.toFixed(2)}</div>
            <div className={`text-xs font-bold flex items-center gap-0.5 ${
              stock.changePercent >= 0 ? 'text-emerald-600' : 'text-rose-600'
            }`}>
              {stock.changePercent >= 0 ? '▲' : '▼'} {Math.abs(stock.changePercent)}%
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  // Notification Component with Table
  const NotificationPanel = () => (
    <AnimatePresence>
      {notifications.length > 0 && (
        <motion.div
          className="fixed top-24 right-6 z-50 w-96"
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 100 }}
        >
          {notifications.map(notification => (
            <motion.div
              key={notification.id}
              className={`mb-3 rounded-2xl shadow-2xl border-2 overflow-hidden ${
                notification.type === 'success'
                  ? 'bg-white border-emerald-400'
                  : notification.type === 'warning'
                  ? 'bg-white border-amber-400'
                  : 'bg-white border-blue-400'
              }`}
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              style={{ fontFamily: "'Inter', 'SF Pro Display', -apple-system, sans-serif" }}
            >
              <div className={`px-5 py-3 ${
                notification.type === 'success'
                  ? 'bg-gradient-to-r from-emerald-500 to-green-500'
                  : notification.type === 'warning'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                  : 'bg-gradient-to-r from-blue-500 to-indigo-500'
              }`}>
                <div className="flex items-center gap-3 text-white">
                  <span className="text-2xl">
                    {notification.type === 'success' ? '✓' : notification.type === 'warning' ? '!' : 'ℹ'}
                  </span>
                  <div>
                    <div className="font-bold text-lg tracking-tight">{notification.title}</div>
                    <div className="text-sm opacity-90">{notification.message}</div>
                  </div>
                </div>
              </div>

              {notification.details && (
                <div className="p-4">
                  <table className="w-full text-sm" style={{ fontFamily: "'Inter', 'SF Pro Display', -apple-system, sans-serif" }}>
                    <tbody>
                      <tr className="border-b border-gray-100">
                        <td className="py-2 text-gray-500 font-medium">Shares</td>
                        <td className="py-2 text-right font-bold text-gray-900">{notification.details.shares}</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-2 text-gray-500 font-medium">Price/Share</td>
                        <td className="py-2 text-right font-bold text-gray-900">${notification.details.price?.toFixed(2)}</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-2 text-gray-500 font-medium">Total</td>
                        <td className="py-2 text-right font-bold text-gray-900">${notification.details.total?.toFixed(2)}</td>
                      </tr>
                      {notification.details.profit !== undefined && (
                        <tr>
                          <td className="py-2 text-gray-500 font-medium">Profit/Loss</td>
                          <td className={`py-2 text-right font-bold ${notification.details.profit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {notification.details.profit >= 0 ? '+' : ''}${notification.details.profit?.toFixed(2)}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );

  // If module is already passed, show completion screen
  if (modulePassed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6 flex items-center justify-center">
        <motion.div
          className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="text-6xl mb-4"
            animate={{ rotate: [0, -10, 10, -10, 0] }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            📈
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Module Completed!</h2>
          <p className="text-gray-600 mb-6">
            You've already passed the Stock Market module. Great job learning how to invest wisely!
          </p>
          <div className="bg-green-50 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-center gap-2 text-green-600">
              <span className="text-2xl">✓</span>
              <span className="font-semibold">100% Complete</span>
            </div>
          </div>
          <motion.button
            onClick={() => navigate('/game')}
            className="w-full px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold transition"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Back to Learning Path
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6" style={{ fontFamily: "'Inter', 'SF Pro Display', -apple-system, sans-serif" }}>
      {/* Premium Header */}
      <motion.div
        className="flex items-center justify-between mb-8 bg-gradient-to-r from-slate-800 via-slate-900 to-black rounded-2xl p-5 shadow-2xl"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <button
          onClick={() => navigate('/game')}
          className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition backdrop-blur-sm text-white font-semibold"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>

        <div className="text-center text-white">
          <h1 className="text-2xl font-black tracking-tight">
            Stock Market Mastery
          </h1>
          <p className="text-sm opacity-70 font-medium">Learn. Test. Trade.</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-white/10 rounded-xl px-4 py-2.5 backdrop-blur-sm text-white">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            <span className="font-bold text-lg">${playerStats.coins.toLocaleString()}</span>
          </div>

          <div className="flex items-center gap-2 bg-white/10 rounded-xl px-4 py-2.5 backdrop-blur-sm text-white">
            <Star className="w-5 h-5 text-amber-400" />
            <span className="font-bold">LVL {playerStats.level}</span>
          </div>
        </div>
      </motion.div>

      {/* Notification Panel */}
      <NotificationPanel />

      {/* Market Event Notification */}
      <AnimatePresence>
        {currentEvent && (
          <motion.div
            className="fixed top-24 left-1/2 transform -translate-x-1/2 z-40"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
          >
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-2xl p-5 shadow-2xl border-2 border-white/30" style={{ fontFamily: "'Inter', 'SF Pro Display', -apple-system, sans-serif" }}>
              <div className="text-center">
                <div className="text-2xl font-black tracking-tight mb-1">{currentEvent.title}</div>
                <div className="text-sm opacity-90 font-medium">{currentEvent.description}</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Phase Progress Indicator */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="flex items-center justify-center gap-4">
          {[
            { phase: 'teaching', label: 'Learn', icon: BookOpen },
            { phase: 'test', label: 'Test', icon: GraduationCap },
            { phase: 'trading-sim', label: 'Trade', icon: TrendingUp }
          ].map((step, index) => (
            <React.Fragment key={step.phase}>
              <div className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold transition-all ${
                currentPhase === step.phase
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg scale-110'
                  : currentPhase === 'trading-sim' || (currentPhase === 'test' && step.phase === 'teaching')
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-gray-100 text-gray-400'
              }`} style={{ fontFamily: "'Inter', 'SF Pro Display', -apple-system, sans-serif" }}>
                <step.icon className="w-5 h-5" />
                {step.label}
              </div>
              {index < 2 && (
                <div className={`w-12 h-1 rounded-full ${
                  (currentPhase === 'test' && index === 0) || currentPhase === 'trading-sim'
                    ? 'bg-emerald-400'
                    : 'bg-gray-200'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* TEACHING PHASE */}
      {currentPhase === 'teaching' && (
        <motion.div
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {/* Progress */}
          <div className="mb-6">
            <div className="flex justify-between text-sm font-semibold text-gray-600 mb-2" style={{ fontFamily: "'Inter', 'SF Pro Display', -apple-system, sans-serif" }}>
              <span>Lesson {teachingStep + 1} of {teachingContent.length}</span>
              <span>{Math.round(((teachingStep + 1) / teachingContent.length) * 100)}% Complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <motion.div
                className="bg-gradient-to-r from-blue-500 to-indigo-500 h-3 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${((teachingStep + 1) / teachingContent.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Lesson Card */}
          <motion.div
            key={teachingStep}
            className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            style={{ fontFamily: "'Inter', 'SF Pro Display', -apple-system, sans-serif" }}
          >
            <div className="text-center mb-8">
              <motion.div
                className="text-7xl mb-4"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {teachingContent[teachingStep].icon}
              </motion.div>
              <h2 className="text-3xl font-black text-gray-900 tracking-tight">
                {teachingContent[teachingStep].title}
              </h2>
            </div>

            <div className="space-y-6">
              <p className="text-lg text-gray-700 leading-relaxed font-medium">
                {teachingContent[teachingStep].content}
              </p>

              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-5 border-l-4 border-blue-500">
                <div className="font-bold text-blue-800 mb-2 text-lg">Example:</div>
                <p className="text-blue-700 font-medium">{teachingContent[teachingStep].example}</p>
              </div>

              <div className="bg-gray-50 rounded-2xl p-5">
                <div className="font-bold text-gray-800 mb-3 text-lg">Key Points:</div>
                <ul className="space-y-2">
                  {teachingContent[teachingStep].keyPoints.map((point, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 font-medium">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
              <button
                onClick={() => setTeachingStep(prev => Math.max(0, prev - 1))}
                disabled={teachingStep === 0}
                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                Previous
              </button>

              {teachingStep < teachingContent.length - 1 ? (
                <button
                  onClick={() => setTeachingStep(prev => prev + 1)}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold shadow-lg transition transform hover:scale-105"
                >
                  Next Lesson
                </button>
              ) : (
                <button
                  onClick={() => setCurrentPhase('test')}
                  className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white rounded-xl font-bold shadow-lg transition transform hover:scale-105"
                >
                  Take the Test
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* TEST PHASE */}
      {currentPhase === 'test' && (
        <motion.div
          className="max-w-3xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {testQuestion < testQuestions.length ? (
            <motion.div
              key={testQuestion}
              className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{ fontFamily: "'Inter', 'SF Pro Display', -apple-system, sans-serif" }}
            >
              {/* Progress */}
              <div className="flex justify-between items-center mb-6">
                <span className="text-sm font-bold text-gray-500">Question {testQuestion + 1}/{testQuestions.length}</span>
                <span className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full font-bold">
                  Score: {testScore}/{testQuestion}
                </span>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2 mb-8">
                <div
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all"
                  style={{ width: `${((testQuestion) / testQuestions.length) * 100}%` }}
                />
              </div>

              {/* Question */}
              <h3 className="text-2xl font-black text-gray-900 mb-8 leading-tight tracking-tight">
                {testQuestions[testQuestion].question}
              </h3>

              {/* Options */}
              <div className="space-y-4">
                {testQuestions[testQuestion].options.map((option, index) => {
                  const answered = testAnswers.find(a => a.question === testQuestion);
                  const isSelected = answered?.answer === index;
                  const isCorrect = index === testQuestions[testQuestion].correct;

                  return (
                    <motion.button
                      key={index}
                      onClick={() => !answered && handleTestAnswer(index)}
                      disabled={!!answered}
                      className={`w-full p-5 rounded-2xl text-left font-semibold text-lg transition-all border-2 ${
                        answered
                          ? isCorrect
                            ? 'bg-emerald-100 border-emerald-500 text-emerald-800'
                            : isSelected
                            ? 'bg-rose-100 border-rose-500 text-rose-800'
                            : 'bg-gray-50 border-gray-200 text-gray-500'
                          : 'bg-gray-50 border-gray-200 hover:border-blue-400 hover:bg-blue-50 text-gray-800'
                      }`}
                      whileHover={!answered ? { scale: 1.02 } : {}}
                      whileTap={!answered ? { scale: 0.98 } : {}}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                          answered
                            ? isCorrect
                              ? 'bg-emerald-500 text-white'
                              : isSelected
                              ? 'bg-rose-500 text-white'
                              : 'bg-gray-300 text-gray-600'
                            : 'bg-gray-200 text-gray-600'
                        }`}>
                          {answered && isCorrect ? '✓' : answered && isSelected && !isCorrect ? '✗' : String.fromCharCode(65 + index)}
                        </div>
                        <span>{option}</span>
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {/* Explanation */}
              {testAnswers.find(a => a.question === testQuestion) && (
                <motion.div
                  className="mt-6 p-5 bg-blue-50 rounded-2xl border-l-4 border-blue-500"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="font-bold text-blue-800 mb-1">Explanation:</div>
                  <p className="text-blue-700 font-medium">{testQuestions[testQuestion].explanation}</p>
                </motion.div>
              )}
            </motion.div>
          ) : (
            /* Test Results */
            <motion.div
              className="bg-white rounded-3xl p-8 shadow-xl text-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{ fontFamily: "'Inter', 'SF Pro Display', -apple-system, sans-serif" }}
            >
              <motion.div
                className="text-8xl mb-6"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.5 }}
              >
                {testScore >= 3 ? '🎉' : '📚'}
              </motion.div>

              <h2 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">
                {testScore >= 3 ? 'Congratulations!' : 'Keep Learning!'}
              </h2>

              <p className="text-xl text-gray-600 mb-6 font-medium">
                You scored {testScore} out of {testQuestions.length}
              </p>

              <div className="w-full max-w-md mx-auto bg-gray-100 rounded-full h-4 mb-8">
                <div
                  className={`h-4 rounded-full transition-all ${testScore >= 3 ? 'bg-gradient-to-r from-emerald-500 to-green-500' : 'bg-gradient-to-r from-amber-500 to-orange-500'}`}
                  style={{ width: `${(testScore / testQuestions.length) * 100}%` }}
                />
              </div>

              {testScore >= 3 ? (
                <button
                  onClick={startTradingSimulation}
                  className="px-10 py-4 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white rounded-2xl font-bold text-xl shadow-xl transition transform hover:scale-105"
                >
                  Start Trading Simulation
                </button>
              ) : (
                <button
                  onClick={() => {
                    setCurrentPhase('teaching');
                    setTeachingStep(0);
                    setTestQuestion(0);
                    setTestScore(0);
                    setTestAnswers([]);
                  }}
                  className="px-10 py-4 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-2xl font-bold text-xl shadow-xl transition transform hover:scale-105"
                >
                  Review Lessons
                </button>
              )}
            </motion.div>
          )}
        </motion.div>
      )}

      {/* TRADING SIMULATION PHASE */}
      {currentPhase === 'trading-sim' && (
        <motion.div
          className="w-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ fontFamily: "'Inter', 'SF Pro Display', -apple-system, sans-serif" }}
        >
          {/* Stats Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl p-5 text-white shadow-lg">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-6 h-6" />
                <span className="font-bold text-lg">Cash Balance</span>
              </div>
              <div className="text-3xl font-black">${playerStats.coins.toLocaleString()}</div>
              <div className="text-sm opacity-80 font-medium">Available to invest</div>
            </div>

            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-5 text-white shadow-lg">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="w-6 h-6" />
                <span className="font-bold text-lg">Portfolio Value</span>
              </div>
              <div className="text-3xl font-black">${getPortfolioValue().toLocaleString()}</div>
              <div className="text-sm opacity-80 font-medium">Your stock holdings</div>
            </div>

            <div className={`rounded-2xl p-5 text-white shadow-lg ${
              getPortfolioReturn() >= 0
                ? 'bg-gradient-to-br from-emerald-500 to-teal-600'
                : 'bg-gradient-to-br from-rose-500 to-red-600'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-6 h-6" />
                <span className="font-bold text-lg">Total Return</span>
              </div>
              <div className="text-3xl font-black">
                {getPortfolioReturn() >= 0 ? '+' : ''}${getPortfolioReturn().toFixed(2)}
              </div>
              <div className="text-sm opacity-80 font-medium">
                {getPortfolioReturn() >= 0 ? 'Great job!' : 'Keep learning!'}
              </div>
            </div>

            <div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl p-5 text-white shadow-lg">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-6 h-6" />
                <span className="font-bold text-lg">Goal Progress</span>
              </div>
              <div className="text-3xl font-black">
                ${((playerStats.coins + getPortfolioValue())).toLocaleString()}
              </div>
              <div className="text-sm opacity-80 font-medium">Target: $11,000</div>
            </div>
          </div>

          {/* Goal Progress Bar */}
          <div className="mb-8 p-5 bg-white rounded-2xl shadow-lg border border-gray-100">
            <div className="flex justify-between items-center mb-3">
              <span className="font-bold text-gray-800 text-lg">Challenge: Turn $10,000 into $11,000</span>
              <span className="font-black text-2xl text-gray-900">
                {Math.round(((playerStats.coins + getPortfolioValue()) / 11000) * 100)}%
              </span>
            </div>
            <div className="bg-gray-200 rounded-full h-5">
              <motion.div
                className={`h-5 rounded-full transition-all duration-500 ${
                  (playerStats.coins + getPortfolioValue()) >= 11000
                    ? 'bg-gradient-to-r from-emerald-500 to-green-500'
                    : 'bg-gradient-to-r from-blue-500 to-indigo-500'
                }`}
                style={{ width: `${Math.min(((playerStats.coins + getPortfolioValue()) / 11000) * 100, 100)}%` }}
              />
            </div>
            {(playerStats.coins + getPortfolioValue()) >= 11000 && (
              <motion.div
                className="mt-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <p className="text-center text-emerald-600 font-bold text-lg mb-4">
                  🎉 Challenge Complete! You're a Trading Master! 🎉
                </p>
                <div className="flex justify-center gap-4">
                  <button
                    onClick={async () => {
                      setIsSaving(true);
                      try {
                        // Score 100% for completing the challenge
                        const result = await saveScore('stock-market', 100, 100);
                        setSaveResult(result);
                      } catch (err) {
                        console.error('Error saving score:', err);
                      } finally {
                        setIsSaving(false);
                      }
                    }}
                    disabled={isSaving || saveResult?.passed}
                    className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white rounded-xl font-bold transition disabled:opacity-50 flex items-center gap-2"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="animate-spin" size={18} />
                        Saving...
                      </>
                    ) : saveResult?.passed ? (
                      <>
                        <CheckCircle size={18} />
                        Module Passed!
                      </>
                    ) : (
                      <>
                        <Trophy size={18} />
                        Complete Module
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => navigate('/game')}
                    className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold transition"
                  >
                    Back to Roadmap
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Stock Market */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-black text-gray-900 tracking-tight">
                  Live Market
                </h3>
                <button
                  onClick={() => setTradingActive(!tradingActive)}
                  className={`px-6 py-3 rounded-xl font-bold text-lg transition shadow-lg ${
                    tradingActive
                      ? 'bg-gradient-to-r from-rose-500 to-red-500 hover:from-rose-600 hover:to-red-600 text-white'
                      : 'bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white'
                  }`}
                >
                  {tradingActive ? '⏸ Pause' : '▶ Start'} Trading
                </button>
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
                  className="bg-white rounded-3xl p-6 shadow-xl border-2 border-blue-400"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <h4 className="text-2xl font-black mb-6 flex items-center gap-3 text-gray-900 tracking-tight">
                    {selectedStock.emoji} Trade {selectedStock.symbol}
                    <span className="text-lg font-bold text-gray-500">@ ${selectedStock.price.toFixed(2)}</span>
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* BUY Section */}
                    <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-5 border-2 border-emerald-200">
                      <h5 className="font-bold text-emerald-800 text-lg mb-4">Buy Shares</h5>

                      {/* Quantity Selector */}
                      <div className="mb-4">
                        <label className="block text-sm font-semibold text-gray-600 mb-2">Quantity</label>
                        <div className="flex gap-2 flex-wrap mb-3">
                          {[1, 5, 10, 25, 50].map(qty => (
                            <button
                              key={qty}
                              onClick={() => setBuyQuantity(qty)}
                              className={`px-4 py-2 rounded-xl font-bold transition ${
                                buyQuantity === qty
                                  ? 'bg-emerald-500 text-white'
                                  : 'bg-white text-gray-700 hover:bg-emerald-100'
                              }`}
                            >
                              {qty}
                            </button>
                          ))}
                        </div>
                        <input
                          type="number"
                          min="1"
                          value={buyQuantity}
                          onChange={(e) => setBuyQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-lg font-bold focus:border-emerald-400 focus:outline-none"
                        />
                      </div>

                      <div className="text-sm text-gray-600 mb-4">
                        <div className="flex justify-between py-1">
                          <span>Cost:</span>
                          <span className="font-bold">${(selectedStock.price * buyQuantity).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span>Your Balance:</span>
                          <span className="font-bold">${playerStats.coins.toLocaleString()}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => buyStock(selectedStock, buyQuantity)}
                        disabled={!tradingActive || playerStats.coins < selectedStock.price * buyQuantity}
                        className="w-full py-4 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white rounded-2xl font-black text-xl disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg"
                      >
                        BUY {buyQuantity} SHARE{buyQuantity > 1 ? 'S' : ''}
                      </button>
                    </div>

                    {/* SELL Section */}
                    <div className="bg-gradient-to-br from-rose-50 to-red-50 rounded-2xl p-5 border-2 border-rose-200">
                      <h5 className="font-bold text-rose-800 text-lg mb-4">Sell Shares</h5>

                      {portfolio.find(p => p.id === selectedStock.id) ? (
                        <>
                          {/* Quantity Selector */}
                          <div className="mb-4">
                            <label className="block text-sm font-semibold text-gray-600 mb-2">Quantity</label>
                            <div className="flex gap-2 flex-wrap mb-3">
                              {[1, 5, 10, 25].map(qty => {
                                const owned = portfolio.find(p => p.id === selectedStock.id)?.shares || 0;
                                if (qty > owned) return null;
                                return (
                                  <button
                                    key={qty}
                                    onClick={() => setSellQuantity(qty)}
                                    className={`px-4 py-2 rounded-xl font-bold transition ${
                                      sellQuantity === qty
                                        ? 'bg-rose-500 text-white'
                                        : 'bg-white text-gray-700 hover:bg-rose-100'
                                    }`}
                                  >
                                    {qty}
                                  </button>
                                );
                              })}
                              <button
                                onClick={() => setSellQuantity(portfolio.find(p => p.id === selectedStock.id)?.shares || 1)}
                                className={`px-4 py-2 rounded-xl font-bold transition ${
                                  sellQuantity === (portfolio.find(p => p.id === selectedStock.id)?.shares || 0)
                                    ? 'bg-rose-500 text-white'
                                    : 'bg-white text-gray-700 hover:bg-rose-100'
                                }`}
                              >
                                ALL
                              </button>
                            </div>
                            <input
                              type="number"
                              min="1"
                              max={portfolio.find(p => p.id === selectedStock.id)?.shares || 1}
                              value={sellQuantity}
                              onChange={(e) => setSellQuantity(Math.max(1, Math.min(parseInt(e.target.value) || 1, portfolio.find(p => p.id === selectedStock.id)?.shares || 1)))}
                              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-lg font-bold focus:border-rose-400 focus:outline-none"
                            />
                          </div>

                          <div className="text-sm text-gray-600 mb-4">
                            <div className="flex justify-between py-1">
                              <span>You Own:</span>
                              <span className="font-bold">{portfolio.find(p => p.id === selectedStock.id)?.shares} shares</span>
                            </div>
                            <div className="flex justify-between py-1">
                              <span>Value:</span>
                              <span className="font-bold">${(selectedStock.price * sellQuantity).toFixed(2)}</span>
                            </div>
                          </div>

                          <button
                            onClick={() => {
                              const ownedStock = portfolio.find(p => p.id === selectedStock.id);
                              if (ownedStock) sellStock(ownedStock, sellQuantity);
                            }}
                            disabled={!tradingActive}
                            className="w-full py-4 bg-gradient-to-r from-rose-500 to-red-500 hover:from-rose-600 hover:to-red-600 text-white rounded-2xl font-black text-xl disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg"
                          >
                            SELL {sellQuantity} SHARE{sellQuantity > 1 ? 'S' : ''}
                          </button>
                        </>
                      ) : (
                        <div className="text-center py-8 text-gray-500 font-medium">
                          <p>You don't own any {selectedStock.symbol} shares yet.</p>
                          <p className="text-sm mt-2">Buy some first!</p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Portfolio */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <h4 className="text-xl font-black mb-4 flex items-center gap-2 text-gray-900 tracking-tight">
                  💼 Your Portfolio
                </h4>
                {portfolio.length === 0 ? (
                  <p className="text-gray-500 text-center py-8 font-medium">No stocks yet. Start trading!</p>
                ) : (
                  <div className="space-y-3">
                    {portfolio.map(stock => {
                      const currentStock = marketData.find(m => m.id === stock.id);
                      const currentPrice = currentStock?.price || stock.price;
                      const profit = (currentPrice - stock.avgPrice) * stock.shares;
                      return (
                        <motion.div
                          key={stock.id}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition"
                          onClick={() => setSelectedStock(currentStock)}
                          layout
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{stock.emoji}</span>
                            <div>
                              <div className="font-bold text-gray-900">{stock.symbol}</div>
                              <div className="text-sm text-gray-500">{stock.shares} shares</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-gray-900">${(currentPrice * stock.shares).toFixed(2)}</div>
                            <div className={`text-sm font-bold ${
                              profit >= 0 ? 'text-emerald-600' : 'text-rose-600'
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

              {/* Trade History */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <h4 className="text-xl font-black mb-4 flex items-center gap-2 text-gray-900 tracking-tight">
                  📜 Trade History
                </h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {actionHistory.length === 0 ? (
                    <p className="text-gray-500 text-center py-4 font-medium">No trades yet</p>
                  ) : (
                    actionHistory.slice(-8).reverse().map((action, index) => (
                      <div key={index} className="text-sm p-3 bg-gray-50 rounded-xl">
                        <div className="flex items-center justify-between">
                          <span className={`font-bold ${
                            action.type === 'buy' ? 'text-emerald-600' : 'text-rose-600'
                          }`}>
                            {action.type.toUpperCase()}
                          </span>
                          <span className="text-gray-500 text-xs">
                            {action.shares} {action.stock}
                          </span>
                        </div>
                        <div className="flex justify-between mt-1">
                          <span className="text-gray-500">@ ${action.price?.toFixed(2)}</span>
                          <span className="font-bold text-gray-700">${action.total?.toFixed(2)}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Achievements */}
              {achievements.length > 0 && (
                <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl p-6 shadow-lg border-2 border-amber-200">
                  <h4 className="text-xl font-black mb-4 flex items-center gap-2 text-amber-800 tracking-tight">
                    🏆 Achievements
                  </h4>
                  <div className="space-y-2">
                    {achievements.map(achievement => (
                      <div key={achievement.id} className="bg-white p-3 rounded-xl border border-amber-100">
                        <div className="font-bold text-amber-800">{achievement.title}</div>
                        <div className="text-sm text-amber-600">{achievement.description}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default StockMarketModule;
