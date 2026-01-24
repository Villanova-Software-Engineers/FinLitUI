import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, DollarSign, TrendingUp, BarChart3, Target, Coins, RefreshCw, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const StockSimulation = () => {
  const navigate = useNavigate();

  const [playerStats, setPlayerStats] = useState({ coins: 10000, experience: 0, level: 1, reputation: 0 });
  const [portfolio, setPortfolio] = useState([]);
  const [marketData, setMarketData] = useState([]);
  const [gameTime, setGameTime] = useState(0);
  const [selectedStock, setSelectedStock] = useState(null);
  const [buyQuantity, setBuyQuantity] = useState(1);
  const [sellQuantity, setSellQuantity] = useState(1);
  const [notifications, setNotifications] = useState([]);

  // Stock data
  const stockSymbols = [
    { id: 'apple', symbol: 'AAPL', name: 'Apple Inc.', basePrice: 175, emoji: '🍎', sector: 'Technology' },
    { id: 'tesla', symbol: 'TSLA', name: 'Tesla Inc.', basePrice: 220, emoji: '🚗', sector: 'Automotive' },
    { id: 'amazon', symbol: 'AMZN', name: 'Amazon', basePrice: 145, emoji: '📦', sector: 'E-commerce' },
    { id: 'google', symbol: 'GOOGL', name: 'Alphabet Inc.', basePrice: 140, emoji: '🔍', sector: 'Technology' },
    { id: 'microsoft', symbol: 'MSFT', name: 'Microsoft', basePrice: 380, emoji: '💻', sector: 'Technology' },
    { id: 'netflix', symbol: 'NFLX', name: 'Netflix', basePrice: 450, emoji: '📺', sector: 'Entertainment' },
  ];

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

  const addNotification = (type, title, message, details = null) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, type, title, message, details }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  // Trading functions
  const buyStock = (stock, quantity) => {
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
  };

  const sellStock = (stock, quantity) => {
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
  };

  const resetSimulation = () => {
    setPlayerStats({ coins: 10000, experience: 0, level: 1, reputation: 0 });
    setPortfolio([]);
    setGameTime(0);
    setSelectedStock(null);
    addNotification('info', 'Simulation Reset', 'Starting fresh with $10,000');
  };

  // Stock Card Component
  const StockCard = ({ stock }) => {
    const isOwned = portfolio.some(p => p.id === stock.id);
    const ownedStock = portfolio.find(p => p.id === stock.id);
    const isSelected = selectedStock?.id === stock.id;

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
              <span className="text-sm font-bold text-blue-700">{ownedStock.shares} shares</span>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center">
          <div>
            <div className="text-2xl font-bold text-gray-900">${stock.price.toFixed(2)}</div>
            <div className={`text-sm font-bold flex items-center gap-1 ${
              stock.changePercent >= 0 ? 'text-emerald-600' : 'text-rose-600'
            }`}>
              {stock.changePercent >= 0 ? '▲' : '▼'} {Math.abs(stock.changePercent.toFixed(2))}%
            </div>
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-100 p-4">
      <NotificationPanel />
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate('/games')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft size={24} />
          <span className="font-medium">Back to Games</span>
        </button>
        
        <div className="flex items-center gap-4">
          <button
            onClick={resetSimulation}
            className="flex items-center gap-2 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            <RefreshCw size={18} />
            Reset
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            <Home size={18} />
            Home
          </button>
        </div>
      </div>

      {/* Title */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">📈 Stock Trading Simulation</h1>
        <p className="text-gray-600">Practice trading stocks with virtual money</p>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl p-4 text-white">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign size={24} />
            <span className="font-bold">Cash Balance</span>
          </div>
          <div className="text-2xl font-bold">${playerStats.coins.toLocaleString()}</div>
        </div>
        
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-4 text-white">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 size={24} />
            <span className="font-bold">Portfolio Value</span>
          </div>
          <div className="text-2xl font-bold">${getPortfolioValue().toLocaleString()}</div>
        </div>
        
        <div className={`rounded-xl p-4 text-white ${
          getPortfolioReturn() >= 0
            ? 'bg-gradient-to-br from-emerald-500 to-teal-600'
            : 'bg-gradient-to-br from-rose-500 to-red-600'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={24} />
            <span className="font-bold">Total Return</span>
          </div>
          <div className="text-2xl font-bold">
            {getPortfolioReturn() >= 0 ? '+' : ''}${getPortfolioReturn().toFixed(2)}
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl p-4 text-white">
          <div className="flex items-center gap-2 mb-2">
            <Target size={24} />
            <span className="font-bold">Total Assets</span>
          </div>
          <div className="text-2xl font-bold">${(playerStats.coins + getPortfolioValue()).toLocaleString()}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stock Market */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">📊 Stock Market</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {marketData.map(stock => (
              <StockCard key={stock.id} stock={stock} />
            ))}
          </div>
        </div>

        {/* Trading Panel */}
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">💼 Trading Panel</h2>
          
          {selectedStock ? (
            <div className="space-y-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-3xl mb-2">{selectedStock.emoji}</div>
                <div className="font-bold text-xl">{selectedStock.symbol}</div>
                <div className="text-gray-600">{selectedStock.name}</div>
                <div className="text-2xl font-bold mt-2">${selectedStock.price.toFixed(2)}</div>
              </div>

              {/* Buy Section */}
              <div className="border rounded-lg p-4">
                <h3 className="font-bold text-emerald-600 mb-3">Buy Shares</h3>
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
                <button
                  onClick={() => buyStock(selectedStock, buyQuantity)}
                  disabled={playerStats.coins < selectedStock.price * buyQuantity}
                  className="w-full p-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-300 text-white rounded font-bold"
                >
                  Buy {buyQuantity} Shares
                </button>
              </div>

              {/* Sell Section */}
              {portfolio.find(p => p.id === selectedStock.id) && (
                <div className="border rounded-lg p-4">
                  <h3 className="font-bold text-rose-600 mb-3">Sell Shares</h3>
                  <div className="text-sm text-gray-600 mb-2">
                    You own: {portfolio.find(p => p.id === selectedStock.id)?.shares} shares
                  </div>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="number"
                      value={sellQuantity}
                      onChange={(e) => setSellQuantity(Math.max(1, Math.min(portfolio.find(p => p.id === selectedStock.id)?.shares || 1, parseInt(e.target.value) || 1)))}
                      className="flex-1 p-2 border rounded"
                      min="1"
                      max={portfolio.find(p => p.id === selectedStock.id)?.shares || 1}
                    />
                    <span className="p-2 text-gray-600">shares</span>
                  </div>
                  <div className="text-sm text-gray-600 mb-3">
                    Total Value: ${(selectedStock.price * sellQuantity).toFixed(2)}
                  </div>
                  <button
                    onClick={() => sellStock(selectedStock, sellQuantity)}
                    className="w-full p-2 bg-rose-500 hover:bg-rose-600 text-white rounded font-bold"
                  >
                    Sell {sellQuantity} Shares
                  </button>
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
              <h3 className="font-bold text-gray-800 mb-3">Your Portfolio</h3>
              <div className="space-y-2">
                {portfolio.map(holding => {
                  const currentStock = marketData.find(s => s.id === holding.id);
                  const currentValue = currentStock ? currentStock.price * holding.shares : 0;
                  const profit = currentValue - (holding.purchasePrice * holding.shares);
                  
                  return (
                    <div key={holding.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-bold">{holding.symbol}</div>
                          <div className="text-sm text-gray-600">{holding.shares} shares</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">${currentValue.toFixed(2)}</div>
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
  );
};

export default StockSimulation;