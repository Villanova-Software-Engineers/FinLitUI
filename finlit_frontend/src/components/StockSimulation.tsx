import React, { useState, useEffect, useMemo, useCallback, memo } from "react";
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, DollarSign, TrendingUp, BarChart3, Target, Coins, RefreshCw, Home, Newspaper, ShoppingCart, Wallet, Zap, TrendingDown, Clock, AlertCircle, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Stock {
  id: string;
  symbol: string;
  name: string;
  basePrice: number;
  emoji: string;
  sector: string;
  price: number;
  changePercent: number;
  volume: number;
}

interface Holding {
  id: string;
  symbol: string;
  name: string;
  emoji: string;
  shares: number;
  purchasePrice: number;
}

interface Notification {
  id: number;
  type: 'success' | 'warning' | 'info';
  title: string;
  message: string;
  details: {
    shares?: number;
    price?: number;
    total?: number;
    profit?: number;
  } | null;
}

interface NewsItem {
  id: number;
  timestamp: Date;
  headline: string;
  impact: 'positive' | 'negative' | 'neutral';
  affectedStocks?: string[];
}

interface PlayerStats {
  coins: number;
  experience: number;
  level: number;
  reputation: number;
}

// News Section Component - Extracted outside to prevent re-renders
const NewsSectionComponent = memo(({ 
  newsItems, 
  luxuryFontStyle, 
  modernFontStyle 
}: { 
  newsItems: NewsItem[];
  luxuryFontStyle: React.CSSProperties;
  modernFontStyle: React.CSSProperties;
}) => (
  <div className="bg-white rounded-xl p-4 lg:p-6 shadow-xl border-2 border-blue-100">
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 lg:mb-6 gap-3">
      <h3 className="text-lg sm:text-xl lg:text-2xl font-light text-gray-800" style={luxuryFontStyle}>📰 Market News</h3>
      <div className="flex items-center gap-2 text-gray-500 text-xs sm:text-sm">
        <Newspaper className="w-4 h-4 sm:w-5 sm:h-5" />
        <span className="font-medium" style={modernFontStyle}>Updates every 20s</span>
      </div>
    </div>
    
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 lg:gap-4">
      {newsItems.length === 0 ? (
        Array.from({ length: 5 }, (_, index) => (
          <div key={index} className="flex items-center justify-center py-6 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
            <div className="text-center">
              <Clock className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-2 opacity-50" />
              <span className="text-xs" style={modernFontStyle}>Loading news...</span>
            </div>
          </div>
        ))
      ) : (
        newsItems.slice(0, 5).map((news, index) => (
          <motion.div
            key={news.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-3 lg:p-4 rounded-lg border-2 transition-all hover:shadow-lg cursor-pointer ${
              index === 0 
                ? 'border-blue-300 bg-gradient-to-br from-blue-50 to-blue-100 ring-2 ring-blue-200'
                : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
            } ${
              news.impact === 'positive'
                ? 'border-l-4 border-l-emerald-500'
                : news.impact === 'negative'
                ? 'border-l-4 border-l-rose-500'
                : 'border-l-4 border-l-blue-500'
            }`}
          >
            <div className="flex items-start gap-2 mb-2 lg:mb-3">
              <div className="mt-0.5 lg:mt-1">
                {news.impact === 'positive' ? (
                  <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500" />
                ) : news.impact === 'negative' ? (
                  <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5 text-rose-500" />
                ) : (
                  <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                )}
              </div>
            </div>
            
            <p className="text-xs sm:text-sm lg:text-sm text-gray-700 leading-relaxed mb-2 lg:mb-3 line-clamp-3" style={modernFontStyle}>
              {news.headline}
            </p>
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <span className="text-xs text-gray-500 font-medium truncate" style={modernFontStyle}>
                {new Date(news.timestamp).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit'
                })}
              </span>
              {news.affectedStocks && news.affectedStocks.length > 0 && (
                <div className="flex gap-1 flex-wrap">
                  {news.affectedStocks.slice(0, 2).map(stock => (
                    <span
                      key={stock}
                      className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600 font-medium whitespace-nowrap"
                      style={modernFontStyle}
                    >
                      {stock}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        ))
      )}
    </div>
  </div>
));

const StockSimulation = () => {
  // Add luxury font style
  const luxuryFontStyle = {
    fontFamily: '"Playfair Display", "Didot", "Bodoni MT", "Georgia", serif',
    letterSpacing: '0.02em'
  };

  const modernFontStyle = {
    fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
    letterSpacing: '0.01em'
  };
  const navigate = useNavigate();

  const [playerStats, setPlayerStats] = useState({ coins: 10000, experience: 0, level: 1, reputation: 0 });
  const [portfolio, setPortfolio] = useState<Holding[]>([]);
  const [marketData, setMarketData] = useState<Stock[]>([]);
  const [gameTime, setGameTime] = useState(0);
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [buyQuantity, setBuyQuantity] = useState(1);
  const [sellQuantity, setSellQuantity] = useState(1);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [showNewsPanel, setShowNewsPanel] = useState(true);
  const [quickTradeMode, setQuickTradeMode] = useState(false);

  // Stock data - memoized to prevent re-renders
  const stockSymbols = useMemo(() => [
    { id: 'apple', symbol: 'AAPL', name: 'Apple Inc.', basePrice: 175, emoji: '🍎', sector: 'Technology' },
    { id: 'tesla', symbol: 'TSLA', name: 'Tesla Inc.', basePrice: 220, emoji: '🚗', sector: 'Automotive' },
    { id: 'amazon', symbol: 'AMZN', name: 'Amazon', basePrice: 145, emoji: '📦', sector: 'E-commerce' },
    { id: 'google', symbol: 'GOOGL', name: 'Alphabet Inc.', basePrice: 140, emoji: '🔍', sector: 'Technology' },
    { id: 'microsoft', symbol: 'MSFT', name: 'Microsoft', basePrice: 380, emoji: '💻', sector: 'Technology' },
    { id: 'netflix', symbol: 'NFLX', name: 'Netflix', basePrice: 450, emoji: '📺', sector: 'Entertainment' },
  ], []);

  // News headlines pool - memoized to prevent re-renders
  const newsHeadlines = useMemo(() => [
    { headline: "Tech stocks surge on AI breakthrough announcement", impact: 'positive', sectors: ['Technology'] },
    { headline: "Electric vehicle sales exceed expectations this quarter", impact: 'positive', sectors: ['Automotive'] },
    { headline: "Streaming services report record subscriber growth", impact: 'positive', sectors: ['Entertainment'] },
    { headline: "E-commerce giant announces expansion into new markets", impact: 'positive', sectors: ['E-commerce'] },
    { headline: "Federal Reserve hints at interest rate changes", impact: 'neutral', sectors: [] },
    { headline: "Supply chain concerns affect multiple industries", impact: 'negative', sectors: ['Technology', 'Automotive'] },
    { headline: "Consumer spending data shows mixed signals", impact: 'neutral', sectors: [] },
    { headline: "Tech earnings beat analyst expectations", impact: 'positive', sectors: ['Technology'] },
    { headline: "Automotive sector faces semiconductor shortage", impact: 'negative', sectors: ['Automotive'] },
    { headline: "Streaming wars heat up with new platform launches", impact: 'neutral', sectors: ['Entertainment'] },
    { headline: "E-commerce sales growth slows amid economic uncertainty", impact: 'negative', sectors: ['E-commerce'] },
    { headline: "Market volatility increases due to geopolitical tensions", impact: 'negative', sectors: [] }
  ], []);

  // Initialize market data
  useEffect(() => {
    const initializeMarket = () => {
      const newMarketData = stockSymbols.map(stock => ({
        ...stock,
        price: stock.basePrice + (Math.random() - 0.5) * 20,
        changePercent: (Math.random() - 0.5) * 10,
        volume: Math.floor(Math.random() * 1000000) + 100000
      }));
      setMarketData(newMarketData);
    };
    initializeMarket();
  }, []);

  // Market simulation - prices change over time
  useEffect(() => {
    const interval = setInterval(() => {
      setGameTime(prev => prev + 1);
      setMarketData(prevData => 
        prevData.map(stock => {
          const change = (Math.random() - 0.5) * 0.05;
          const newPrice = Math.max(stock.price * (1 + change), 1);
          const changePercent = ((newPrice - stock.basePrice) / stock.basePrice) * 100;
          
          return {
            ...stock,
            price: newPrice,
            changePercent: changePercent
          };
        })
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // News generation - every 20 seconds
  useEffect(() => {
    const generateNews = () => {
      const randomHeadline = newsHeadlines[Math.floor(Math.random() * newsHeadlines.length)];
      const newNewsItem: NewsItem = {
        id: Date.now() + Math.random(), // Add random to ensure unique IDs
        timestamp: new Date(),
        headline: randomHeadline.headline,
        impact: randomHeadline.impact as 'positive' | 'negative' | 'neutral',
        affectedStocks: randomHeadline.sectors.length > 0 
          ? stockSymbols
              .filter(stock => randomHeadline.sectors.includes(stock.sector))
              .map(stock => stock.symbol)
          : []
      };
      
      setNewsItems(prev => {
        // Only add if we don't have 5 items yet or if this is a new headline
        if (prev.length === 0) {
          return [newNewsItem];
        }
        return [newNewsItem, ...prev].slice(0, 5);
      });
    };

    // Generate initial 5 news items
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        generateNews();
      }, i * 10); // Small delay between initial news
    }
    
    const newsInterval = setInterval(generateNews, 20000); // 20 seconds
    return () => clearInterval(newsInterval);
  }, [newsHeadlines]);

  // Helper functions
  const getPortfolioValue = () => {
    return portfolio.reduce((total, holding) => {
      const currentStock = marketData.find(stock => stock.id === holding.id);
      return total + (currentStock ? currentStock.price * holding.shares : 0);
    }, 0);
  };

  const getPortfolioReturn = () => {
    const totalCost = portfolio.reduce((total, holding) => total + (holding.purchasePrice * holding.shares), 0);
    return getPortfolioValue() - totalCost;
  };

  const addNotification = useCallback((type: 'success' | 'warning' | 'info', title: string, message: string, details: { shares?: number; price?: number; total?: number; profit?: number } | null = null) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, type, title, message, details }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  }, []);

  // Trading functions
  const buyStock = useCallback((stock: Stock, quantity: number) => {
    const totalCost = stock.price * quantity;
    if (playerStats.coins >= totalCost) {
      setPlayerStats(prev => ({ ...prev, coins: prev.coins - totalCost }));
      
      const existingHolding = portfolio.find(p => p.id === stock.id);
      if (existingHolding) {
        setPortfolio(prev => prev.map(p => 
          p.id === stock.id 
            ? { 
                ...p, 
                shares: p.shares + quantity,
                purchasePrice: ((p.purchasePrice * p.shares) + (stock.price * quantity)) / (p.shares + quantity)
              }
            : p
        ));
      } else {
        setPortfolio(prev => [...prev, {
          id: stock.id,
          symbol: stock.symbol,
          name: stock.name,
          emoji: stock.emoji,
          shares: quantity,
          purchasePrice: stock.price
        }]);
      }

      addNotification('success', 'Purchase Successful', `Bought ${quantity} shares of ${stock.symbol}`, {
        shares: quantity,
        price: stock.price,
        total: totalCost
      });
    } else {
      addNotification('warning', 'Insufficient Funds', 'You don\'t have enough money for this trade');
    }
  }, [playerStats.coins, portfolio, addNotification]);

  const sellStock = useCallback((stock: Stock, quantity: number) => {
    const holding = portfolio.find(p => p.id === stock.id);
    if (holding && holding.shares >= quantity) {
      const totalValue = stock.price * quantity;
      const profit = (stock.price - holding.purchasePrice) * quantity;
      
      setPlayerStats(prev => ({ ...prev, coins: prev.coins + totalValue }));
      
      if (holding.shares === quantity) {
        setPortfolio(prev => prev.filter(p => p.id !== stock.id));
      } else {
        setPortfolio(prev => prev.map(p => 
          p.id === stock.id 
            ? { ...p, shares: p.shares - quantity }
            : p
        ));
      }

      addNotification('success', 'Sale Successful', `Sold ${quantity} shares of ${stock.symbol}`, {
        shares: quantity,
        price: stock.price,
        total: totalValue,
        profit: profit
      });
    } else {
      addNotification('warning', 'Invalid Sale', 'You don\'t own enough shares to sell');
    }
  }, [portfolio, addNotification]);

  const resetSimulation = useCallback(() => {
    setPlayerStats({ coins: 10000, experience: 0, level: 1, reputation: 0 });
    setPortfolio([]);
    setGameTime(0);
    setSelectedStock(null);
    setNewsItems([]);
    addNotification('info', 'Simulation Reset', 'Starting fresh with $10,000');
  }, [addNotification]);

  // Buy All functionality - buys maximum shares affordable
  const buyAllStock = useCallback((stock: Stock) => {
    const maxShares = Math.floor(playerStats.coins / stock.price);
    if (maxShares > 0) {
      buyStock(stock, maxShares);
    } else {
      addNotification('warning', 'Insufficient Funds', 'Cannot afford any shares of this stock');
    }
  }, [buyStock, playerStats.coins, addNotification]);

  // Sell All functionality - sells all shares of a stock
  const sellAllStock = useCallback((stock: Stock) => {
    const holding = portfolio.find(p => p.id === stock.id);
    if (holding && holding.shares > 0) {
      sellStock(stock, holding.shares);
    } else {
      addNotification('warning', 'No Holdings', 'You don\'t own any shares of this stock');
    }
  }, [sellStock, portfolio, addNotification]);

  // Quick buy with preset amounts
  const quickBuy = useCallback((stock: Stock, percentage: number) => {
    const investAmount = playerStats.coins * (percentage / 100);
    const shares = Math.floor(investAmount / stock.price);
    if (shares > 0) {
      buyStock(stock, shares);
    } else {
      addNotification('warning', 'Insufficient Funds', `Cannot invest ${percentage}% of portfolio`);
    }
  }, [buyStock, playerStats.coins, addNotification]);

  // Stock Card Component
  const StockCard = ({ stock }: { stock: Stock }) => {
    const isOwned = portfolio.some(p => p.id === stock.id);
    const ownedStock = portfolio.find(p => p.id === stock.id);
    const isSelected = selectedStock?.id === stock.id;
    const maxAffordable = Math.floor(playerStats.coins / stock.price);

    return (
      <motion.div
        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
          stock.changePercent >= 0
            ? 'border-emerald-300 bg-gradient-to-br from-emerald-50 to-green-50'
            : 'border-rose-300 bg-gradient-to-br from-rose-50 to-red-50'
        } ${isSelected ? 'ring-2 ring-blue-400 shadow-lg' : 'shadow-sm hover:shadow-md'}`}
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.99 }}
        onClick={() => setSelectedStock(isSelected ? null : stock)}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{stock.emoji}</span>
            <div>
              <div className="font-bold text-lg text-gray-900">{stock.symbol}</div>
              <div className="text-sm text-gray-500 truncate">{stock.name}</div>
            </div>
          </div>
          {isOwned && (
            <div className="bg-blue-100 px-3 py-1 rounded-full">
              <span className="text-sm font-bold text-blue-700">{ownedStock?.shares} shares</span>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center mb-3">
          <div>
            <div className="text-2xl font-bold text-gray-900">${stock.price.toFixed(2)}</div>
            <div className={`text-sm font-bold flex items-center gap-1 ${
              stock.changePercent >= 0 ? 'text-emerald-600' : 'text-rose-600'
            }`}>
              {stock.changePercent >= 0 ? '▲' : '▼'} {Math.abs(stock.changePercent).toFixed(2)}%
            </div>
          </div>
          <div className="text-xs text-gray-500">
            Max: {maxAffordable} shares
          </div>
        </div>

      </motion.div>
    );
  };

  // Notification Component
  const NotificationPanel = () => (
    <AnimatePresence>
      {notifications.length > 0 && (
        <div className="fixed top-6 right-6 z-50 space-y-3">
          {notifications.map(notification => (
            <motion.div
              key={notification.id}
              className={`rounded-xl shadow-lg border-2 overflow-hidden max-w-sm ${
                notification.type === 'success'
                  ? 'bg-white border-emerald-400'
                  : notification.type === 'warning'
                  ? 'bg-white border-amber-400'
                  : 'bg-white border-blue-400'
              }`}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
            >
              <div className={`px-4 py-3 ${
                notification.type === 'success'
                  ? 'bg-emerald-500'
                  : notification.type === 'warning'
                  ? 'bg-amber-500'
                  : 'bg-blue-500'
              }`}>
                <div className="text-white font-bold">{notification.title}</div>
                <div className="text-white text-sm opacity-90">{notification.message}</div>
              </div>
              {notification.details && (
                <div className="p-3 text-sm">
                  <div className="flex justify-between">
                    <span>Shares:</span>
                    <span className="font-bold">{notification.details.shares}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Price:</span>
                    <span className="font-bold">${notification.details.price?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total:</span>
                    <span className="font-bold">${notification.details.total?.toFixed(2)}</span>
                  </div>
                  {notification.details.profit !== undefined && (
                    <div className="flex justify-between">
                      <span>Profit/Loss:</span>
                      <span className={`font-bold ${notification.details.profit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {notification.details.profit >= 0 ? '+' : ''}${notification.details.profit?.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      <NotificationPanel />
      
      {/* Main Content Area - Full Screen */}
      <div className="w-full min-h-screen p-4 lg:p-6">
      
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 lg:mb-8 gap-4">
          <button
            onClick={() => navigate('/games')}
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors"
            style={modernFontStyle}
          >
            <ArrowLeft size={20} className="sm:w-6 sm:h-6" />
            <span className="font-medium text-sm sm:text-base">Back to Games</span>
          </button>
          
          <div className="flex flex-wrap items-center gap-2 lg:gap-3">
            <button
              onClick={resetSimulation}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 rounded-lg transition-colors font-medium shadow-sm text-sm"
              style={modernFontStyle}
            >
              <RefreshCw size={16} />
              <span className="hidden sm:inline">Reset</span>
            </button>
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-900 hover:to-black text-white rounded-lg transition-all font-medium shadow-sm text-sm"
              style={modernFontStyle}
            >
              <Home size={16} />
              <span className="hidden sm:inline">Home</span>
            </button>
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-6 lg:mb-10">
          <h1 className="text-2xl sm:text-3xl lg:text-5xl font-light text-gray-900 mb-2 lg:mb-3 tracking-wide" style={luxuryFontStyle}>
            Stock Trading Simulation
          </h1>
          <p className="text-gray-600 text-sm sm:text-base lg:text-lg" style={modernFontStyle}>Practice trading with virtual capital</p>
        </div>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6 lg:mb-8">
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg lg:rounded-xl p-3 lg:p-5 text-white shadow-lg">
            <div className="flex items-center gap-2 mb-2 lg:mb-3">
              <DollarSign size={18} className="lg:w-6 lg:h-6" />
              <span className="font-medium text-xs lg:text-base" style={modernFontStyle}>Cash</span>
            </div>
            <div className="text-lg lg:text-3xl font-light" style={luxuryFontStyle}>${playerStats.coins.toLocaleString()}</div>
          </div>
          
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg lg:rounded-xl p-3 lg:p-5 text-white shadow-lg">
            <div className="flex items-center gap-2 mb-2 lg:mb-3">
              <BarChart3 size={18} className="lg:w-6 lg:h-6" />
              <span className="font-medium text-xs lg:text-base" style={modernFontStyle}>Portfolio</span>
            </div>
            <div className="text-lg lg:text-3xl font-light" style={luxuryFontStyle}>${getPortfolioValue().toLocaleString()}</div>
          </div>
          
          <div className={`rounded-lg lg:rounded-xl p-3 lg:p-5 text-white shadow-lg ${
            getPortfolioReturn() >= 0
              ? 'bg-gradient-to-br from-emerald-500 to-emerald-600'
              : 'bg-gradient-to-br from-rose-500 to-rose-600'
          }`}>
            <div className="flex items-center gap-2 mb-2 lg:mb-3">
              <TrendingUp size={18} className="lg:w-6 lg:h-6" />
              <span className="font-medium text-xs lg:text-base" style={modernFontStyle}>Return</span>
            </div>
            <div className="text-lg lg:text-3xl font-light" style={luxuryFontStyle}>
              {getPortfolioReturn() >= 0 ? '+' : ''}${getPortfolioReturn().toFixed(2)}
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg lg:rounded-xl p-3 lg:p-5 text-white shadow-lg">
            <div className="flex items-center gap-2 mb-2 lg:mb-3">
              <Target size={18} className="lg:w-6 lg:h-6" />
              <span className="font-medium text-xs lg:text-base" style={modernFontStyle}>Total</span>
            </div>
            <div className="text-lg lg:text-3xl font-light" style={luxuryFontStyle}>${(playerStats.coins + getPortfolioValue()).toLocaleString()}</div>
          </div>
        </div>

        {/* News Section - Visible at top */}
        <div className="mb-8">
          <NewsSectionComponent 
            newsItems={newsItems} 
            luxuryFontStyle={luxuryFontStyle} 
            modernFontStyle={modernFontStyle} 
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Stock Market */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl p-6 shadow-xl">
              <h2 className="text-2xl lg:text-3xl font-light text-gray-800 mb-6" style={luxuryFontStyle}>Stock Market</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {marketData.map(stock => (
                  <StockCard key={stock.id} stock={stock} />
                ))}
              </div>
            </div>
          </div>

          {/* Trading Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 shadow-xl">
              <h2 className="text-2xl font-light text-gray-800 mb-6" style={luxuryFontStyle}>Trading</h2>
          
          {selectedStock ? (
            <div className="space-y-4">
              <div className="text-center p-5 bg-gradient-to-b from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                <div className="text-3xl mb-3">{selectedStock.emoji}</div>
                <div className="text-xl" style={{...luxuryFontStyle, fontWeight: 500}}>{selectedStock.symbol}</div>
                <div className="text-gray-600 mt-1" style={modernFontStyle}>{selectedStock.name}</div>
                <div className="text-3xl mt-4" style={{...luxuryFontStyle, fontWeight: 300}}>${selectedStock.price.toFixed(2)}</div>
              </div>

              {/* Buy Section */}
              <div className="border rounded-lg p-4">
                <h3 className="text-emerald-600 mb-3" style={{...modernFontStyle, fontWeight: 600}}>Buy Shares</h3>
                <div className="flex gap-2 mb-3">
                  <input
                    type="number"
                    value={buyQuantity}
                    onChange={(e) => setBuyQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="flex-1 p-2 border rounded"
                    min="1"
                  />
                  <span className="p-2 text-gray-600">shares</span>
                </div>
                <div className="text-sm text-gray-600 mb-3">
                  Total Cost: ${(selectedStock.price * buyQuantity).toFixed(2)}
                </div>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <button
                    onClick={() => buyStock(selectedStock, buyQuantity)}
                    disabled={playerStats.coins < selectedStock.price * buyQuantity}
                    className="p-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-300 text-white rounded font-bold text-sm"
                  >
                    Buy {buyQuantity}
                  </button>
                  <button
                    onClick={() => buyAllStock(selectedStock)}
                    disabled={playerStats.coins < selectedStock.price}
                    className="p-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded font-bold text-sm"
                  >
                    Buy All
                  </button>
                </div>
                <div className="mb-3">
                  <p className="text-xs text-gray-500 mb-2" style={modernFontStyle}>Quick invest (% of your cash):</p>
                  <div className="grid grid-cols-3 gap-1">
                    <button
                      onClick={() => quickBuy(selectedStock, 10)}
                      disabled={playerStats.coins < selectedStock.price}
                      className="p-1 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 text-gray-700 rounded text-xs font-medium"
                      title="Invest 10% of your cash balance"
                    >
                      10%
                    </button>
                    <button
                      onClick={() => quickBuy(selectedStock, 25)}
                      disabled={playerStats.coins < selectedStock.price}
                      className="p-1 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 text-gray-700 rounded text-xs font-medium"
                      title="Invest 25% of your cash balance"
                    >
                      25%
                    </button>
                    <button
                      onClick={() => quickBuy(selectedStock, 50)}
                      disabled={playerStats.coins < selectedStock.price}
                      className="p-1 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 text-gray-700 rounded text-xs font-medium"
                      title="Invest 50% of your cash balance"
                    >
                      50%
                    </button>
                  </div>
                </div>
              </div>

              {/* Sell Section */}
              {portfolio.find(p => p.id === selectedStock.id) && (
                <div className="border rounded-lg p-4">
                  <h3 className="text-rose-600 mb-3" style={{...modernFontStyle, fontWeight: 600}}>Sell Shares</h3>
                  <div className="text-sm text-gray-600 mb-2">
                    You own: {portfolio.find(p => p.id === selectedStock?.id)?.shares || 0} shares
                  </div>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="number"
                      value={sellQuantity}
                      onChange={(e) => setSellQuantity(Math.max(1, Math.min(portfolio.find(p => p.id === selectedStock?.id)?.shares || 1, parseInt(e.target.value) || 1)))}
                      className="flex-1 p-2 border rounded"
                      min="1"
                      max={portfolio.find(p => p.id === selectedStock?.id)?.shares || 1}
                    />
                    <span className="p-2 text-gray-600">shares</span>
                  </div>
                  <div className="text-sm text-gray-600 mb-3">
                    Total Value: ${(selectedStock?.price * sellQuantity).toFixed(2)}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => sellStock(selectedStock, sellQuantity)}
                      className="p-2 bg-rose-500 hover:bg-rose-600 text-white rounded font-bold text-sm"
                    >
                      Sell {sellQuantity}
                    </button>
                    <button
                      onClick={() => sellAllStock(selectedStock)}
                      className="p-2 bg-red-600 hover:bg-red-700 text-white rounded font-bold text-sm"
                    >
                      Sell All
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              <Coins size={48} className="mx-auto mb-4 opacity-50" />
              <p>Select a stock to start trading</p>
            </div>
          )}

          {/* Portfolio */}
          {portfolio.length > 0 && (
            <div className="mt-6">
              <h3 className="text-gray-800 mb-4" style={{...luxuryFontStyle, fontWeight: 500, fontSize: '1.25rem'}}>Your Portfolio</h3>
              <div className="space-y-2">
                {portfolio.map((holding) => {
                  const currentStock = marketData.find(s => s.id === holding.id);
                  const currentValue = currentStock ? currentStock.price * holding.shares : 0;
                  const profit = currentValue - (holding.purchasePrice * holding.shares);
                  
                  return (
                    <div key={holding.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <div style={{...modernFontStyle, fontWeight: 600}}>{holding.symbol}</div>
                          <div className="text-sm text-gray-600" style={modernFontStyle}>{holding.shares} shares</div>
                        </div>
                        <div className="text-right">
                          <div style={{...luxuryFontStyle, fontWeight: 500}}>${currentValue.toFixed(2)}</div>
                          <div className={`text-sm ${profit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {profit >= 0 ? '+' : ''}${profit.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockSimulation;
