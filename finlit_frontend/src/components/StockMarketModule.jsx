import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Star, Trophy, CheckCircle, XCircle, Heart, Zap, TrendingUp, Coins, Gamepad2, Rocket, Target, DollarSign, BarChart3, Activity, RefreshCw, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useModuleScore, MODULES } from '../hooks/useModuleScore';
import { shuffleQuizOptions } from '../utils/shuffleQuizOptions';

const StockMarketModule = () => {
  const navigate = useNavigate();
  const { saveScore, resetModule, isModulePassed, isLoading: progressLoading } = useModuleScore();

  // Check if module is already passed
  const modulePassed = isModulePassed(MODULES.STOCK_MARKET?.id);

  // Review mode - allows viewing content without taking tests
  const [isReviewMode, setIsReviewMode] = useState(false);

  const [currentPhase, setCurrentPhase] = useState('teaching'); // 'teaching', 'swipe-game', 'test', 'trading-sim', 'final-results', 'quiz-review'
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
  
  // Financial news state
  const [financialNews, setFinancialNews] = useState([]);
  const [activeTab, setActiveTab] = useState('portfolio');

  // Module score saving state
  const [isSaving, setIsSaving] = useState(false);
  const [saveResult, setSaveResult] = useState(null);
  const [isResetting, setIsResetting] = useState(false);

  // Swipe game state
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [swipeScore, setSwipeScore] = useState(0);
  const [swipeAnswers, setSwipeAnswers] = useState([]);
  const [swipeDirection, setSwipeDirection] = useState(null);
  const [showSwipeResult, setShowSwipeResult] = useState(false);
  const [dragX, setDragX] = useState(0);

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

  // Test Questions - 10 questions with case study format
  const testQuestionsBase = [
    {
      question: "What happens to a stock's price when more people want to BUY than SELL?",
      options: ["Price goes DOWN", "Price goes UP", "Price stays the same", "The stock disappears"],
      correctIndex: 1,
      explanation: "When demand (buyers) exceeds supply (sellers), prices increase!"
    },
    {
      question: "What is the golden rule of investing?",
      options: ["Buy high, sell low", "Buy low, sell high", "Never sell anything", "Only buy expensive stocks"],
      correctIndex: 1,
      explanation: "Buy low, sell high - this is how you make profit!"
    },
    {
      question: "Why is diversification important?",
      options: ["It makes trading more fun", "It reduces risk by spreading investments", "It guarantees profits", "It's not important"],
      correctIndex: 1,
      explanation: "Diversification protects you - if one stock drops, others might rise!"
    },
    {
      question: "If you buy 5 shares at $20 each and sell them at $30 each, what's your profit?",
      options: ["$20", "$50", "$100", "$150"],
      correctIndex: 1,
      explanation: "5 shares x ($30 - $20) = 5 x $10 = $50 profit!"
    },
    {
      question: "What typically happens to stock prices when a company announces bad news?",
      options: ["Prices go up", "Prices go down", "Nothing happens", "Trading stops"],
      correctIndex: 1,
      explanation: "Bad news causes more people to sell, which drives prices down."
    },
    {
      question: "What is a stock?",
      options: ["A type of bond issued by the government", "A share of ownership in a company", "A savings account at a bank", "A loan to a corporation"],
      correctIndex: 1,
      explanation: "A stock represents a share of ownership in a company. When you buy stock, you become a part-owner."
    },
    {
      question: "What does it mean when a stock is 'volatile'?",
      options: ["The stock is about to be removed from the market", "The stock price changes frequently and significantly", "The stock always goes up in price", "The stock is from a technology company"],
      correctIndex: 1,
      explanation: "A volatile stock has large price swings - it can change significantly in short periods of time."
    },
    {
      question: "If you invest $1,000 and it grows to $1,200, what is your return percentage?",
      options: ["12%", "20%", "25%", "200%"],
      correctIndex: 1,
      explanation: "Return = (New Value - Original Value) / Original Value = ($1,200 - $1,000) / $1,000 = $200 / $1,000 = 20%"
    },
    {
      question: "What is a 'blue-chip' stock?",
      options: ["A stock that has recently gone down in price", "A stock from a large, well-established, financially stable company", "A stock that is brand new to the market", "A stock that only experts can buy"],
      correctIndex: 1,
      explanation: "Blue-chip stocks are from large, reputable companies with a history of reliable performance, like Apple or Microsoft."
    },
    {
      question: "What is the PRIMARY risk of putting all your money in one stock?",
      options: ["You might make too much profit", "If that stock fails, you could lose everything", "It takes too long to sell", "You will pay more taxes"],
      correctIndex: 1,
      explanation: "Lack of diversification means if that one stock performs poorly or the company fails, you could lose your entire investment."
    }
  ];

  // Shuffle quiz options on component mount
  const testQuestions = useMemo(() => shuffleQuizOptions(testQuestionsBase), []);

  // Swipe Game - Value vs Growth Stock Cards
  const swipeCards = [
    {
      company: "Waste Management",
      ticker: "WM",
      description: "Leading trash collection and recycling company. Steady cash flow, pays reliable dividends.",
      type: "value",
      emoji: "♻️",
      hint: "Stable business, people always need trash removed"
    },
    {
      company: "NVIDIA",
      ticker: "NVDA",
      description: "AI chip maker experiencing explosive revenue growth. High P/E ratio but massive potential.",
      type: "growth",
      emoji: "🚀",
      hint: "Fast-growing tech, cutting-edge AI"
    },
    {
      company: "Coca-Cola",
      ticker: "KO",
      description: "100+ year old beverage company. Consistent profits, strong dividend history.",
      type: "value",
      emoji: "🥤",
      hint: "Established brand, predictable sales"
    },
    {
      company: "Tesla",
      ticker: "TSLA",
      description: "Electric vehicle and energy innovation leader. High volatility, reinvests profits for expansion.",
      type: "growth",
      emoji: "⚡",
      hint: "Innovative, high-risk, high-reward"
    },
    {
      company: "Procter & Gamble",
      ticker: "PG",
      description: "Consumer goods giant (Tide, Pampers, Gillette). Steady earnings, dividend aristocrat.",
      type: "value",
      emoji: "🧴",
      hint: "Daily essentials, reliable income"
    },
    {
      company: "Shopify",
      ticker: "SHOP",
      description: "E-commerce platform growing rapidly. High growth rate, minimal dividends.",
      type: "growth",
      emoji: "🛒",
      hint: "Fast expansion, tech-focused"
    },
    {
      company: "Johnson & Johnson",
      ticker: "JNJ",
      description: "Healthcare products and pharmaceuticals. Stable revenue, over 60 years of dividend increases.",
      type: "value",
      emoji: "🏥",
      hint: "Healthcare staple, low volatility"
    },
    {
      company: "Airbnb",
      ticker: "ABNB",
      description: "Disrupting travel industry with home-sharing. Rapid user growth, reinvesting for expansion.",
      type: "growth",
      emoji: "🏠",
      hint: "New business model, scaling fast"
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

  // Financial News Database
  const newsDatabase = [
    // Inflation & Economic News
    {
      id: 'inflation-up',
      category: 'Economic',
      title: '📈 Inflation Rises to 3.2%',
      description: 'Consumer price index increases, affecting purchasing power and interest rates.',
      impact: { type: 'sector', target: 'all', multiplier: 0.97, duration: 15 },
      priority: 'high',
      timestamp: new Date()
    },
    {
      id: 'fed-rate-cut',
      category: 'Monetary Policy',
      title: '💰 Federal Reserve Cuts Interest Rates',
      description: 'Fed announces 0.25% rate cut to stimulate economic growth.',
      impact: { type: 'sector', target: 'all', multiplier: 1.04, duration: 20 },
      priority: 'high',
      timestamp: new Date()
    },
    {
      id: 'gdp-growth',
      category: 'Economic',
      title: '🚀 GDP Growth Exceeds Expectations',
      description: 'US economy grows 2.8% in latest quarter, beating forecasts.',
      impact: { type: 'sector', target: 'all', multiplier: 1.03, duration: 18 },
      priority: 'medium',
      timestamp: new Date()
    },
    {
      id: 'unemployment-low',
      category: 'Employment',
      title: '👥 Unemployment Hits 20-Year Low',
      description: 'Job market remains strong with unemployment at 3.1%.',
      impact: { type: 'sector', target: 'all', multiplier: 1.02, duration: 12 },
      priority: 'medium',
      timestamp: new Date()
    },
    
    // Technology Sector News
    {
      id: 'ai-breakthrough',
      category: 'Technology',
      title: '🤖 Major AI Breakthrough Announced',
      description: 'Revolutionary AI technology promises to transform multiple industries.',
      impact: { type: 'sector', target: 'Technology', multiplier: 1.08, duration: 25 },
      priority: 'high',
      timestamp: new Date()
    },
    {
      id: 'cyber-attack',
      category: 'Security',
      title: '🔒 Major Cybersecurity Breach Reported',
      description: 'Large-scale security incident affects multiple tech companies.',
      impact: { type: 'sector', target: 'Technology', multiplier: 0.94, duration: 15 },
      priority: 'high',
      timestamp: new Date()
    },
    {
      id: 'chip-shortage',
      category: 'Supply Chain',
      title: '⚡ Global Chip Shortage Worsens',
      description: 'Semiconductor supply issues impact tech and automotive sectors.',
      impact: { type: 'sector', target: 'Technology', multiplier: 0.96, duration: 20 },
      priority: 'medium',
      timestamp: new Date()
    },
    
    // Company-Specific News
    {
      id: 'apple-record',
      category: 'Earnings',
      title: '🍎 Apple Reports Record Revenue',
      description: 'iPhone sales drive Apple to unprecedented quarterly results.',
      impact: { type: 'stock', target: 'AAPL', multiplier: 1.12, duration: 15 },
      priority: 'high',
      timestamp: new Date()
    },
    {
      id: 'tesla-recall',
      category: 'Safety',
      title: '🚗 Tesla Announces Vehicle Recall',
      description: 'Autopilot software issue prompts recall of 100K vehicles.',
      impact: { type: 'stock', target: 'TSLA', multiplier: 0.92, duration: 18 },
      priority: 'medium',
      timestamp: new Date()
    },
    {
      id: 'google-antitrust',
      category: 'Regulatory',
      title: '⚖️ Google Faces New Antitrust Probe',
      description: 'DOJ launches investigation into search monopoly practices.',
      impact: { type: 'stock', target: 'GOOGL', multiplier: 0.95, duration: 20 },
      priority: 'medium',
      timestamp: new Date()
    },
    {
      id: 'microsoft-acquisition',
      category: 'M&A',
      title: '💻 Microsoft Announces Major Acquisition',
      description: '$15B deal to acquire cloud infrastructure company.',
      impact: { type: 'stock', target: 'MSFT', multiplier: 1.07, duration: 12 },
      priority: 'medium',
      timestamp: new Date()
    },
    {
      id: 'amazon-growth',
      category: 'Business',
      title: '📦 Amazon Expands Into New Markets',
      description: 'E-commerce giant announces expansion into healthcare and logistics.',
      impact: { type: 'stock', target: 'AMZN', multiplier: 1.06, duration: 16 },
      priority: 'medium',
      timestamp: new Date()
    },
    
    // Sector-Wide Impact News
    {
      id: 'energy-crisis',
      category: 'Energy',
      title: '⛽ Energy Prices Spike Globally',
      description: 'Geopolitical tensions drive oil and gas prices higher.',
      impact: { type: 'sector', target: 'all', multiplier: 0.98, duration: 25 },
      priority: 'high',
      timestamp: new Date()
    },
    {
      id: 'trade-war',
      category: 'International',
      title: '🌍 Trade Tensions Escalate',
      description: 'New tariffs announced affecting international trade.',
      impact: { type: 'sector', target: 'all', multiplier: 0.96, duration: 30 },
      priority: 'high',
      timestamp: new Date()
    },
    {
      id: 'green-energy',
      category: 'Environment',
      title: '🌱 Green Energy Investment Surge',
      description: 'Government announces $100B clean energy initiative.',
      impact: { type: 'sector', target: 'Technology', multiplier: 1.05, duration: 22 },
      priority: 'medium',
      timestamp: new Date()
    },
    {
      id: 'supply-chain',
      category: 'Logistics',
      title: '🚢 Global Supply Chain Disruption',
      description: 'Port strikes and shipping delays impact global trade.',
      impact: { type: 'sector', target: 'all', multiplier: 0.97, duration: 20 },
      priority: 'medium',
      timestamp: new Date()
    },
    
    // Market Sentiment News
    {
      id: 'investor-confidence',
      category: 'Market',
      title: '📊 Investor Confidence Reaches New High',
      description: 'Market sentiment surveys show bullish outlook for tech stocks.',
      impact: { type: 'sector', target: 'Technology', multiplier: 1.04, duration: 15 },
      priority: 'low',
      timestamp: new Date()
    },
    {
      id: 'market-volatility',
      category: 'Market',
      title: '⚠️ Market Volatility Increases',
      description: 'Uncertainty around global events drives market instability.',
      impact: { type: 'sector', target: 'all', multiplier: 0.99, duration: 10 },
      priority: 'medium',
      timestamp: new Date()
    }
  ];

  // Generate financial news periodically
  const generateFinancialNews = useCallback(() => {
    if (financialNews.length >= 20) return; // Limit news items
    
    const availableNews = newsDatabase.filter(
      news => !financialNews.some(existing => existing.id === news.id)
    );
    
    if (availableNews.length > 0) {
      const selectedNews = availableNews[Math.floor(Math.random() * availableNews.length)];
      const newsItem = {
        ...selectedNews,
        timestamp: new Date(),
        id: `${selectedNews.id}-${Date.now()}` // Make unique
      };
      
      setFinancialNews(prev => [newsItem, ...prev]);
      
      // Apply market impact
      applyNewsImpact(newsItem.impact);
      
      // Show notification
      addNotification('info', 'Breaking News!', selectedNews.title);
    }
  }, [financialNews]);

  // Apply news impact to market
  const applyNewsImpact = (impact) => {
    if (!impact) return;
    
    setMarketData(prevData =>
      prevData.map(stock => {
        let shouldApplyImpact = false;
        
        if (impact.type === 'stock' && stock.id === impact.target) {
          shouldApplyImpact = true;
        } else if (impact.type === 'sector') {
          if (impact.target === 'all' || stock.sector === impact.target) {
            shouldApplyImpact = true;
          }
        }
        
        if (shouldApplyImpact) {
          const newPrice = parseFloat((stock.price * impact.multiplier).toFixed(2));
          const change = newPrice - stock.price;
          const changePercent = ((change / stock.price) * 100).toFixed(2);
          
          return {
            ...stock,
            price: newPrice,
            change: parseFloat(change.toFixed(2)),
            changePercent: parseFloat(changePercent)
          };
        }
        
        return stock;
      })
    );
  };

  // Generate news every 5 seconds during trading
  useEffect(() => {
    if (tradingActive) {
      const newsInterval = setInterval(generateFinancialNews, 5000);
      return () => clearInterval(newsInterval);
    }
  }, [tradingActive, generateFinancialNews]);

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

  // Handle test answer - using case study format
  const handleTestAnswer = (optionIndex) => {
    const currentQ = testQuestions[testQuestion];
    const isCorrect = optionIndex === currentQ.correctIndex;

    setTestAnswers(prev => [...prev, { question: testQuestion, answer: optionIndex, correct: isCorrect }]);

    if (isCorrect) {
      setTestScore(prev => prev + 1);
    }
  };

  // Handle moving to next question
  const handleNextQuestion = async () => {
    if (testQuestion < testQuestions.length - 1) {
      setTestQuestion(prev => prev + 1);
    } else {
      // Save the module score
      const percentageScore = Math.round((testScore / testQuestions.length) * 100);
      await saveScore(MODULES.STOCK_MARKET.id, percentageScore, 100);

      // Check if passed (80% = 8 out of 10)
      if (testScore >= 8) {
        addNotification('success', 'Module Completed!', `You scored ${percentageScore}% - Great job!`);
      }
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

  // Start review mode
  const startReviewMode = () => {
    setIsReviewMode(true);
    setCurrentPhase('teaching');
    setTeachingStep(0);
  };

  // Switch to quiz review in review mode
  const viewQuizReview = () => {
    setCurrentPhase('quiz-review');
  };

  // Handle swipe game
  const handleSwipe = (direction) => {
    const card = swipeCards[currentCardIndex];
    const userAnswer = direction === 'left' ? 'value' : 'growth';
    const isCorrect = userAnswer === card.type;

    // Update score and answers - store the full card info for feedback
    if (isCorrect) {
      setSwipeScore(prev => prev + 1);
    }

    setSwipeAnswers(prev => [...prev, {
      card: card.company,
      cardInfo: card, // Store full card info for accurate feedback
      userAnswer,
      correct: isCorrect
    }]);

    setSwipeDirection(direction);
    setShowSwipeResult(true);

    // Move to next card after a shorter delay to show feedback
    setTimeout(() => {
      setCurrentCardIndex(prev => prev + 1);
      setSwipeDirection(null);
      setShowSwipeResult(false);
    }, 2000);
  };

  // If module is already passed and not in review mode, show completion screen
  if (modulePassed && !isReviewMode) {
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
          <div className="space-y-3">
            <motion.button
              onClick={startReviewMode}
              className="w-full px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-semibold transition"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Review Module
            </motion.button>
            <motion.button
              onClick={() => navigate('/game')}
              className="w-full px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold transition"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Back to Learning Path
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6" style={{ fontFamily: "'Inter', 'SF Pro Display', -apple-system, sans-serif" }}>
      {/* Header */}
      <motion.div
        className="relative mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <button
          onClick={() => navigate('/game')}
          className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 rounded-lg transition shadow-sm border border-gray-200 text-gray-700 font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>

        <div className="text-center">
          <h1 className="text-3xl font-black tracking-tight text-gray-900">
            Stock Market Mastery
          </h1>
          <p className="text-sm text-gray-600 font-medium mt-1">Learn. Test. Trade.</p>
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
              ) : isReviewMode ? (
                <div className="flex gap-3">
                  <button
                    onClick={viewQuizReview}
                    className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl font-bold shadow-lg transition transform hover:scale-105"
                  >
                    Review Quiz Answers
                  </button>
                  <button
                    onClick={() => navigate('/game')}
                    className="px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-xl font-bold shadow-lg transition transform hover:scale-105"
                  >
                    Finish Review
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setCurrentPhase('swipe-game')}
                  className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white rounded-xl font-bold shadow-lg transition transform hover:scale-105"
                >
                  Next: Stock Game
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* SWIPE GAME PHASE - Value vs Growth Stocks */}
      {currentPhase === 'swipe-game' && (
        <motion.div
          className="max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {currentCardIndex < swipeCards.length ? (
            <div>
              {/* Instructions - Compact */}
              <motion.div
                className="bg-white rounded-xl p-4 shadow-lg mb-4"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-lg font-bold text-gray-900">Value or Growth?</h2>
                  <div className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    {currentCardIndex + 1} / {swipeCards.length}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="bg-blue-50 rounded-lg p-2 border border-blue-300">
                    <div className="text-lg">👈</div>
                    <div className="font-semibold text-blue-800 text-sm">Value</div>
                    <div className="text-xs text-blue-600">Stable, dividends</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-2 border border-green-300">
                    <div className="text-lg">👉</div>
                    <div className="font-semibold text-green-800 text-sm">Growth</div>
                    <div className="text-xs text-green-600">Fast-growing</div>
                  </div>
                </div>
              </motion.div>

              {/* Swipeable Card - Tinder Style */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentCardIndex}
                  className="relative"
                  initial={{ scale: 0.95, opacity: 0, y: 50 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{
                    x: swipeDirection === 'left' ? -500 : swipeDirection === 'right' ? 500 : 0,
                    opacity: 0,
                    rotate: swipeDirection === 'left' ? -30 : swipeDirection === 'right' ? 30 : 0,
                    transition: { duration: 0.4, ease: 'easeOut' }
                  }}
                  transition={{ duration: 0.3 }}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.7}
                  onDrag={(e, info) => {
                    setDragX(info.offset.x);
                  }}
                  onDragEnd={(e, info) => {
                    setDragX(0);
                    if (Math.abs(info.offset.x) > 150) {
                      const direction = info.offset.x > 0 ? 'right' : 'left';
                      handleSwipe(direction);
                    }
                  }}
                  style={{
                    rotate: dragX / 20,
                    x: dragX,
                  }}
                >
                  <div className="relative bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl border-2 border-gray-200 overflow-hidden cursor-grab active:cursor-grabbing">
                    {/* VALUE Stamp - appears when dragging left */}
                    <motion.div
                      className="absolute top-8 left-8 z-10 pointer-events-none"
                      animate={{
                        opacity: dragX < -50 ? 1 : 0,
                        scale: dragX < -50 ? 1 : 0.5,
                        rotate: -20
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="border-4 border-blue-500 rounded-xl px-6 py-3 bg-blue-50/90 backdrop-blur-sm">
                        <span className="text-3xl font-black text-blue-600 tracking-wider">VALUE</span>
                      </div>
                    </motion.div>

                    {/* GROWTH Stamp - appears when dragging right */}
                    <motion.div
                      className="absolute top-8 right-8 z-10 pointer-events-none"
                      animate={{
                        opacity: dragX > 50 ? 1 : 0,
                        scale: dragX > 50 ? 1 : 0.5,
                        rotate: 20
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="border-4 border-green-500 rounded-xl px-6 py-3 bg-green-50/90 backdrop-blur-sm">
                        <span className="text-3xl font-black text-green-600 tracking-wider">GROWTH</span>
                      </div>
                    </motion.div>

                    {/* Card Header */}
                    <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-4 text-white">
                      <div className="text-4xl mb-2 text-center">{swipeCards[currentCardIndex].emoji}</div>
                      <h3 className="text-2xl font-black text-center mb-1">
                        {swipeCards[currentCardIndex].company}
                      </h3>
                      <p className="text-center text-blue-300 font-semibold text-base">
                        ${swipeCards[currentCardIndex].ticker}
                      </p>
                    </div>

                    {/* Card Body */}
                    <div className="p-4">
                      <p className="text-gray-700 text-base leading-relaxed mb-4 text-center">
                        {swipeCards[currentCardIndex].description}
                      </p>

                      <div className="bg-blue-50 rounded-lg p-3 border-l-4 border-blue-500 mb-4">
                        <div className="flex items-start gap-2">
                          <span className="text-lg">💡</span>
                          <div>
                            <div className="font-bold text-blue-800 text-xs mb-1">Hint:</div>
                            <p className="text-blue-700 text-sm">{swipeCards[currentCardIndex].hint}</p>
                          </div>
                        </div>
                      </div>

                      {/* Swipe indicators */}
                      <div className="flex justify-between items-center mb-3">
                        <div className="text-blue-400 font-semibold text-xs">← VALUE</div>
                        <div className="text-gray-400 text-xs">Swipe or Tap</div>
                        <div className="text-green-400 font-semibold text-xs">GROWTH →</div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-3 p-4 pt-0">
                      <button
                        onClick={() => handleSwipe('left')}
                        className="py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg font-bold text-base shadow-lg transition-colors active:scale-95"
                      >
                        👈 Value
                      </button>
                      <button
                        onClick={() => handleSwipe('right')}
                        className="py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg font-bold text-base shadow-lg transition-colors active:scale-95"
                      >
                        Growth 👉
                      </button>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Feedback with Reason */}
              <AnimatePresence>
                {showSwipeResult && (
                  <motion.div
                    className={`mt-4 rounded-xl p-4 shadow-lg ${
                      swipeAnswers[swipeAnswers.length - 1]?.correct
                        ? 'bg-green-50 border-2 border-green-400'
                        : 'bg-red-50 border-2 border-red-400'
                    }`}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-3xl">
                        {swipeAnswers[swipeAnswers.length - 1]?.correct ? '✅' : '❌'}
                      </div>
                      <div className="flex-1">
                        <div className={`font-bold text-lg mb-1 ${
                          swipeAnswers[swipeAnswers.length - 1]?.correct ? 'text-green-800' : 'text-red-800'
                        }`}>
                          {swipeAnswers[swipeAnswers.length - 1]?.correct ? 'Correct!' : 'Not quite!'}
                        </div>
                        <p className={`text-sm mb-2 ${
                          swipeAnswers[swipeAnswers.length - 1]?.correct ? 'text-green-700' : 'text-red-700'
                        }`}>
                          <span className="font-semibold">{swipeAnswers[swipeAnswers.length - 1]?.cardInfo?.company}</span> is a{' '}
                          <span className="font-bold uppercase">{swipeAnswers[swipeAnswers.length - 1]?.cardInfo?.type}</span> stock.
                        </p>
                        <p className={`text-sm ${
                          swipeAnswers[swipeAnswers.length - 1]?.correct ? 'text-green-600' : 'text-red-600'
                        }`}>
                          💡 {swipeAnswers[swipeAnswers.length - 1]?.cardInfo?.hint}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            /* Results Screen */
            <motion.div
              className="bg-white rounded-3xl p-8 shadow-xl text-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="text-6xl mb-4">
                {swipeScore >= swipeCards.length * 0.7 ? '🎉' : '📚'}
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-3">
                {swipeScore >= swipeCards.length * 0.7 ? 'Great Job!' : 'Keep Learning!'}
              </h2>
              <p className="text-xl text-gray-600 mb-6">
                You got <span className="font-bold text-blue-600">{swipeScore}/{swipeCards.length}</span> correct
              </p>

              {/* Answer Review */}
              <div className="text-left mb-6 max-h-64 overflow-y-auto">
                {swipeCards.map((card, index) => {
                  const answer = swipeAnswers[index];
                  return (
                    <div key={index} className={`mb-3 p-4 rounded-xl border-2 ${
                      answer?.correct ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'
                    }`}>
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{card.emoji}</span>
                        <div className="flex-1">
                          <div className="font-bold text-gray-900">{card.company}</div>
                          <div className={`text-sm ${answer?.correct ? 'text-green-700' : 'text-red-700'}`}>
                            {card.type === 'value' ? 'Value Stock' : 'Growth Stock'}
                            {!answer?.correct && ` (You said ${answer?.userAnswer === 'value' ? 'Value' : 'Growth'})`}
                          </div>
                        </div>
                        {answer?.correct ? (
                          <CheckCircle className="text-green-500" size={24} />
                        ) : (
                          <XCircle className="text-red-500" size={24} />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() => setCurrentPhase('test')}
                className="w-full px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-xl font-bold text-lg shadow-lg transition transform hover:scale-105"
              >
                Continue to Quiz
              </button>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* QUIZ REVIEW PHASE - Shows user's previous answers */}
      {currentPhase === 'quiz-review' && (
        <motion.div
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 mb-6">
            <h2 className="text-3xl font-black text-gray-900 mb-2 text-center">Quiz Review</h2>
            <p className="text-gray-600 text-center mb-6">Review your answers from when you completed this module</p>

            {/* All Questions Review */}
            <div className="space-y-6">
              {testQuestions.map((question, index) => {
                const answered = testAnswers.find(a => a.question === index);
                const selectedOption = question.options.find(opt => opt.id === answered?.answer);
                const correctOption = question.options.find(opt => opt.correct);
                const isCorrect = answered?.correct;

                return (
                  <div key={index} className="border-2 border-gray-200 rounded-2xl p-6 bg-gray-50">
                    {/* Question Header */}
                    <div className="flex items-start justify-between mb-4 pb-4 border-b border-gray-200">
                      <div className="flex-1">
                        <span className="text-sm font-bold text-blue-600 uppercase tracking-wider block mb-2">
                          Question {index + 1} of {testQuestions.length}
                        </span>
                        <h3 className="text-xl font-bold text-gray-900">
                          {question.question}
                        </h3>
                      </div>
                      {isCorrect ? (
                        <CheckCircle className="w-8 h-8 text-green-500 flex-shrink-0 ml-4" />
                      ) : (
                        <XCircle className="w-8 h-8 text-red-500 flex-shrink-0 ml-4" />
                      )}
                    </div>

                    {/* Options */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                      {question.options.map((option) => {
                        const isSelected = selectedOption?.id === option.id;
                        const isCorrectOption = option.correct;

                        return (
                          <div
                            key={option.id}
                            className={`p-4 rounded-xl text-left border-2 flex items-start gap-3 ${
                              isCorrectOption
                                ? 'bg-green-50 border-green-500'
                                : isSelected && !isCorrectOption
                                  ? 'bg-red-50 border-red-500'
                                  : 'bg-white border-gray-200 opacity-60'
                            }`}
                          >
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                              isCorrectOption ? 'bg-green-500 text-white' :
                              isSelected ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-500'
                            }`}>
                              {isCorrectOption ? (
                                <CheckCircle size={20} />
                              ) : isSelected && !isCorrectOption ? (
                                <XCircle size={20} />
                              ) : (
                                option.id
                              )}
                            </div>
                            <div className="flex-1">
                              <span className={`text-base font-medium ${
                                isCorrectOption ? 'text-green-900' :
                                isSelected ? 'text-red-900' : 'text-gray-600'
                              }`}>
                                {option.text}
                              </span>
                              {isSelected && (
                                <div className="text-xs font-bold mt-1 text-gray-500">
                                  Your answer
                                </div>
                              )}
                            </div>
                            {isCorrectOption && <CheckCircle className="text-green-600 flex-shrink-0" />}
                          </div>
                        );
                      })}
                    </div>

                    {/* Explanation */}
                    <div className="bg-slate-900 text-white p-4 rounded-xl">
                      <h4 className="font-bold text-blue-400 uppercase tracking-wider text-xs mb-2">Explanation</h4>
                      <p className="text-sm leading-relaxed text-slate-200">
                        {question.explanation}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Back to Teaching or Exit */}
            <div className="flex gap-4 justify-center mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setCurrentPhase('teaching');
                  setTeachingStep(0);
                }}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl font-bold shadow-lg transition transform hover:scale-105"
              >
                Review Lessons Again
              </button>
              <button
                onClick={() => navigate('/game')}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-xl font-bold shadow-lg transition transform hover:scale-105"
              >
                Back to Learning Path
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* TEST PHASE */}
      {currentPhase === 'test' && (
        <motion.div
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {testQuestion < testQuestions.length ? (
            <motion.div
              key={testQuestion}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between mb-2">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Progress</span>
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">{testQuestion + 1} / {testQuestions.length}</span>
                </div>
                <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-blue-600 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${((testQuestion + 1) / testQuestions.length) * 100}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>

              {/* Question Card - Case Study Style */}
              <motion.div
                className="bg-white rounded-xl sm:rounded-3xl shadow-xl border border-gray-100 overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <div className="p-4 sm:p-8 lg:p-12">
                  {/* Question Header */}
                  <div className="flex justify-between items-end mb-6 sm:mb-10 border-b border-gray-100 pb-4 sm:pb-6">
                    <div>
                      <span className="text-xs sm:text-sm font-bold text-blue-600 uppercase tracking-wider block mb-2">
                        Question {testQuestion + 1} of {testQuestions.length}
                      </span>
                      <h2 className="text-lg sm:text-2xl lg:text-3xl font-bold text-slate-900 leading-tight">
                        {testQuestions[testQuestion].question}
                      </h2>
                    </div>
                    <div className="hidden lg:block text-slate-200">
                      <Trophy size={48} />
                    </div>
                  </div>

                  {/* Options Grid - Case Study Style */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    {testQuestions[testQuestion].options.map((option, optionIndex) => {
                      const answered = testAnswers.find(a => a.question === testQuestion);
                      const isSelected = answered?.answer === optionIndex;
                      const isCorrect = optionIndex === testQuestions[testQuestion].correctIndex;
                      const showCorrectness = answered && (isSelected || isCorrect);
                      const optionLetter = String.fromCharCode(65 + optionIndex); // A, B, C, D

                      return (
                        <button
                          key={optionIndex}
                          onClick={() => !answered && handleTestAnswer(optionIndex)}
                          disabled={!!answered}
                          className={`p-4 sm:p-6 rounded-xl sm:rounded-2xl text-left border-2 transition-all flex items-start gap-3 sm:gap-4 ${
                            showCorrectness
                              ? isCorrect
                                ? 'bg-green-50 border-green-500 text-green-900'
                                : isSelected
                                  ? 'bg-red-50 border-red-500 text-red-900'
                                  : 'bg-white border-slate-100 opacity-50'
                              : isSelected
                                ? 'bg-blue-50 border-blue-600 shadow-lg scale-[1.02]'
                                : 'bg-white border-slate-200 hover:border-blue-400 hover:shadow-md'
                          } ${!!answered ? 'cursor-default' : 'cursor-pointer'}`}
                        >
                          <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                            showCorrectness && isCorrect ? 'bg-green-500 text-white' :
                            showCorrectness && isSelected ? 'bg-red-500 text-white' :
                            isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'
                          }`}>
                            {showCorrectness && isCorrect ? (
                              <CheckCircle size={20} />
                            ) : showCorrectness && isSelected && !isCorrect ? (
                              <XCircle size={20} />
                            ) : (
                              optionLetter
                            )}
                          </div>
                          <span className="text-sm sm:text-lg font-medium leading-snug flex-1">{option}</span>
                          {showCorrectness && isCorrect && <CheckCircle className="ml-auto text-green-600 shrink-0 w-5 h-5 sm:w-6 sm:h-6" />}
                          {showCorrectness && isSelected && !isCorrect && <XCircle className="ml-auto text-red-600 shrink-0 w-5 h-5 sm:w-6 sm:h-6" />}
                        </button>
                      );
                    })}
                  </div>

                  {/* Teaching Point - Dark Box (Case Study Style) */}
                  <AnimatePresence>
                    {testAnswers.find(a => a.question === testQuestion) && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="mt-6 sm:mt-8 bg-slate-900 text-white p-4 sm:p-8 rounded-xl sm:rounded-2xl flex flex-col md:flex-row items-center gap-4 sm:gap-8 shadow-2xl"
                      >
                        <div className="flex-1">
                          <h4 className="font-bold text-blue-400 uppercase tracking-wider text-xs sm:text-sm mb-2">Explanation</h4>
                          <p className="text-sm sm:text-lg leading-relaxed text-slate-200">
                            {testQuestions[testQuestion].explanation}
                          </p>
                        </div>
                        <button
                          onClick={handleNextQuestion}
                          className="w-full md:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-white text-slate-900 rounded-lg sm:rounded-xl font-bold hover:bg-blue-50 transition-colors whitespace-nowrap text-sm sm:text-base"
                        >
                          {testQuestion === testQuestions.length - 1 ? 'Finish Quiz' : 'Next Question'}
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-6">
                <button
                  onClick={() => testQuestion > 0 && setTestQuestion(testQuestion - 1)}
                  disabled={testQuestion === 0}
                  className={`px-6 py-3 rounded-xl font-medium transition ${
                    testQuestion === 0
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-300 hover:bg-gray-400 text-gray-700'
                  }`}
                >
                  Previous
                </button>

                {!testAnswers.find(a => a.question === testQuestion) && (
                  <div className="px-6 py-3 bg-gray-200 text-gray-400 rounded-xl font-medium cursor-not-allowed">
                    Select an answer
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            /* Test Results */
            <motion.div
              className="max-w-2xl mx-auto text-center"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              {/* Results Card */}
              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                >
                  <Trophy className="w-20 h-20 mx-auto text-yellow-500 mb-6" />
                </motion.div>

                <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">Stock Market Quiz Complete! 🎉</h2>
                <p className="text-xl text-gray-600 mb-6">
                  {testScore >= 8 ? "Excellent! You passed the quiz! 🎉" : "Keep studying - you need 80% to pass! 📚"}
                </p>

                {/* Final Stats */}
                <div className="flex justify-center mb-8">
                  <div className={`${testScore >= 8 ? 'bg-green-50' : 'bg-orange-50'} rounded-lg p-6 text-center`}>
                    <div className={`text-3xl sm:text-4xl font-bold ${testScore >= 8 ? 'text-green-600' : 'text-orange-600'}`}>
                      {testScore}/{testQuestions.length}
                    </div>
                    <div className="text-sm text-gray-600">Correct Answers ({Math.round((testScore / testQuestions.length) * 100)}%)</div>
                    <div className="text-xs text-gray-500 mt-1">80% required to pass</div>
                  </div>
                </div>

                {/* Answer Review */}
                <div className="text-left mb-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Review Your Answers:</h3>
                  {testQuestions.map((question, index) => {
                    const answered = testAnswers.find(a => a.question === index);
                    const correctOption = question.options.find(opt => opt.correct);
                    const isCorrect = answered?.correct;

                    return (
                      <div key={index} className="mb-4 p-4 rounded-lg border border-gray-200">
                        <div className="flex items-start gap-2 mb-2">
                          {isCorrect ? (
                            <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-500 mt-1 flex-shrink-0" />
                          )}
                          <div>
                            <p className="font-medium text-gray-800">{question.question}</p>
                            <p className={`text-sm ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                              Your answer: {question.options.find(opt => opt.id === answered?.answer)?.text}
                            </p>
                            {!isCorrect && (
                              <p className="text-sm text-green-600">
                                Correct answer: {correctOption?.text}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 justify-center flex-wrap">
                  <button
                    onClick={() => navigate('/game')}
                    className="px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-xl font-bold text-lg shadow-lg transition transform hover:scale-105"
                  >
                    Back to Roadmap
                  </button>
                  {testScore < 8 && (
                    <>
                      <button
                        onClick={() => {
                          setCurrentPhase('teaching');
                          setTeachingStep(0);
                          setTestQuestion(0);
                          setTestScore(0);
                          setTestAnswers([]);
                        }}
                        className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition"
                      >
                        Review Lessons
                      </button>
                      <button
                        onClick={() => {
                          setTestQuestion(0);
                          setTestScore(0);
                          setTestAnswers([]);
                        }}
                        className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-medium transition flex items-center gap-2"
                      >
                        <RefreshCw size={18} />
                        Retake Quiz
                      </button>
                    </>
                  )}
                </div>
              </div>
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
              <div className="text-sm opacity-80 font-medium">Target: $10,500</div>
            </div>
          </div>

          {/* Goal Progress Bar */}
          <div className="mb-8 p-5 bg-white rounded-2xl shadow-lg border border-gray-100">
            <div className="flex justify-between items-center mb-3">
              <span className="font-bold text-gray-800 text-lg">Challenge: Turn $10,000 into $10,500</span>
              <span className="font-black text-2xl text-gray-900">
                {Math.round(((playerStats.coins + getPortfolioValue()) / 10500) * 100)}%
              </span>
            </div>
            <div className="bg-gray-200 rounded-full h-5">
              <motion.div
                className={`h-5 rounded-full transition-all duration-500 ${
                  (playerStats.coins + getPortfolioValue()) >= 10500
                    ? 'bg-gradient-to-r from-emerald-500 to-green-500'
                    : 'bg-gradient-to-r from-blue-500 to-indigo-500'
                }`}
                style={{ width: `${Math.min(((playerStats.coins + getPortfolioValue()) / 10500) * 100, 100)}%` }}
              />
            </div>
            {(playerStats.coins + getPortfolioValue()) >= 10500 && (
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
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
                              <span className="font-bold">${(selectedStock.price * (portfolio.find(p => p.id === selectedStock.id)?.shares || 0)).toFixed(2)}</span>
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
              {/* Tabbed Interface */}
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                {/* Tab Headers */}
                <div className="flex border-b border-gray-200">
                  <button
                    onClick={() => setActiveTab('portfolio')}
                    className={`flex-1 px-4 py-4 text-sm font-bold transition ${
                      activeTab === 'portfolio'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    💼 Portfolio
                  </button>
                  <button
                    onClick={() => setActiveTab('news')}
                    className={`flex-1 px-4 py-4 text-sm font-bold transition relative ${
                      activeTab === 'news'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    📰 Financial News
                    {financialNews.length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                        {Math.min(financialNews.length, 9)}
                      </span>
                    )}
                  </button>
                </div>

                {/* Tab Content */}
                <div className="p-4 sm:p-6">
                  {activeTab === 'portfolio' && (
                    <>
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
                    </>
                  )}

                  {activeTab === 'news' && (
                    <>
                      <h4 className="text-xl font-black mb-4 flex items-center gap-2 text-gray-900 tracking-tight">
                        📰 Financial News
                      </h4>
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {financialNews.length === 0 ? (
                          <p className="text-gray-500 text-center py-8 font-medium">
                            {tradingActive ? 'Waiting for news...' : 'Start trading to see financial news!'}
                          </p>
                        ) : (
                          financialNews.map((news, index) => (
                            <motion.div
                              key={news.id}
                              className={`p-4 rounded-xl border-l-4 ${
                                news.priority === 'high'
                                  ? 'bg-red-50 border-red-500'
                                  : news.priority === 'medium'
                                  ? 'bg-amber-50 border-amber-500'
                                  : 'bg-blue-50 border-blue-500'
                              }`}
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                            >
                              <div className="flex items-start justify-between mb-2">
                                <span className={`text-xs font-bold px-2 py-1 rounded ${
                                  news.priority === 'high'
                                    ? 'bg-red-200 text-red-800'
                                    : news.priority === 'medium'
                                    ? 'bg-amber-200 text-amber-800'
                                    : 'bg-blue-200 text-blue-800'
                                }`}>
                                  {news.category}
                                </span>
                                <span className="text-xs text-gray-400">
                                  {new Date(news.timestamp).toLocaleTimeString()}
                                </span>
                              </div>
                              <h5 className="font-bold text-gray-900 mb-1 text-sm">
                                {news.title}
                              </h5>
                              <p className="text-xs text-gray-600 leading-relaxed">
                                {news.description}
                              </p>
                              {news.impact && (
                                <div className="mt-2 text-xs">
                                  <span className={`inline-block px-2 py-1 rounded text-white ${
                                    news.impact.multiplier > 1 ? 'bg-emerald-500' : 'bg-rose-500'
                                  }`}>
                                    Market Impact: {news.impact.multiplier > 1 ? '📈' : '📉'} 
                                    {((news.impact.multiplier - 1) * 100).toFixed(1)}%
                                  </span>
                                </div>
                              )}
                            </motion.div>
                          ))
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Trade History - Moved below tabs */}
              <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100">
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
                <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border-2 border-amber-200">
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
