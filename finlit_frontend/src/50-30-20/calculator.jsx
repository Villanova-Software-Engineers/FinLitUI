import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const CalculatorPage = () => {
  const [amount, setAmount] = useState('');
  const inputRef = useRef(null);
  const renderCount = useRef(0);

  const num = parseFloat(amount) || 0;
  const needs = num * 0.5;
  const wants = num * 0.3;
  const savings = num * 0.2;
  const navigate = useNavigate();

  // Track mount/unmount
  useEffect(() => {
    console.log('🚀 CalculatorPage MOUNTED');
    return () => {
      console.log('💀 CalculatorPage UNMOUNTED');
    };
  }, []);

  // Debug logging on every render
  useEffect(() => {
    renderCount.current += 1;
    console.log('═══════════════════════════════════════');
    console.log(`🔄 RENDER #${renderCount.current}`);
    console.log('📝 Amount state:', amount);
    console.log('📊 Calculated - needs:', needs, 'wants:', wants, 'savings:', savings);
    console.log('🎯 Active element:', document.activeElement?.tagName, document.activeElement?.type);
    console.log('💡 Input ref:', inputRef.current ? 'EXISTS' : 'NULL');
    console.log('🔍 Input has focus:', document.activeElement === inputRef.current);
    console.log('═══════════════════════════════════════');
  });

  // Animated background elements
  const bgElements = [
    { emoji: "💰", size: "text-lg", delay: 0 },
    { emoji: "💳", size: "text-xl", delay: 2 },
    { emoji: "📊", size: "text-2xl", delay: 4 },
    { emoji: "📈", size: "text-lg", delay: 6 },
    { emoji: "🏦", size: "text-xl", delay: 8 },
    { emoji: "🛡️", size: "text-lg", delay: 10 },
    { emoji: "🏠", size: "text-2xl", delay: 12 },
    { emoji: "📝", size: "text-lg", delay: 14 },
  ];

  // Display calculated budget numbers
  const NumberMotion = ({ value, label, color, icon }) => {
    console.log('📦 NumberMotion rendered for:', label, 'with value:', value);
    return (
      <div className="relative">
        <div
          className="p-6 rounded-2xl shadow-lg border border-gray-200 overflow-hidden transition-transform hover:scale-105"
          style={{
            background: 'rgba(255, 255, 255, 0.9)',
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className={`p-3 rounded-full ${color}`}>
              <span className="text-2xl">{icon}</span>
            </div>
            <div className="text-2xl font-bold text-gray-800 transition-all">
              ${value.toFixed(2)}
            </div>
          </div>
          <p className="text-sm font-medium text-gray-600">{label}</p>
        </div>
      </div>
    );
  };

  return (
    <div
      className="min-h-screen p-6 relative overflow-hidden font-sans"
      style={{
        background: 'linear-gradient(120deg, #e0f7fa 0%, #e8f5e9 50%, #e3f2fd 100%)',
      }}
    >
      {/* Animated background elements */}
      {bgElements.map((el, index) => (
        <motion.div
          key={index}
          className={`absolute opacity-10 ${el.size} z-0`}
          initial={{ 
            x: Math.random() * 100 - 50, 
            y: -20,
          }}
          animate={{ 
            y: [null, typeof window !== 'undefined' ? window.innerHeight + 50 : 1000],
            x: [null, Math.random() * 100 - 50 + (index % 2 === 0 ? 100 : -100)],
          }}
          transition={{ 
            repeat: Infinity, 
            duration: 15 + Math.random() * 10,
            delay: el.delay,
            ease: "linear"
          }}
          style={{
            left: `${(index * 12) % 100}%`,
          }}
        >
          {el.emoji}
        </motion.div>
      ))}

      {/* Header */}
      <motion.div
        className="flex items-center justify-between mb-10 sticky top-0 z-50 bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-lg shadow-md"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-3">
          <motion.button
            className="px-3 py-2 rounded-lg text-blue-600 hover:bg-blue-50 font-medium transition"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/')}
          >
            ← Overview
          </motion.button>

          <div className="p-3 rounded-full bg-white shadow-md mr-3">
            <span className="text-2xl">🧮</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">50/30/20 Calculator</h1>
        </div>
        
        {/* Info badge */}
        <motion.div 
          className="bg-white px-4 py-2 rounded-xl shadow-lg"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex items-center">
            <span className="text-blue-500 text-xl mr-2">💡</span>
            <div className="text-xs font-semibold text-gray-600">Smart Budgeting</div>
          </div>
        </motion.div>
      </motion.div>

      {/* Main content */}
      <div className="max-w-2xl mx-auto relative z-10">
        {/* Title */}
        <motion.h2 
          className="text-3xl font-bold mb-8 text-center text-gray-800"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          Budget Your Income
        </motion.h2>

        {/* Input */}
        <div className="mb-12">
          <label className="block text-lg font-medium text-gray-700 mb-2 ml-1">
            Enter your monthly income
          </label>
          <div>
            <input
              ref={inputRef}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={amount}
              onFocus={() => {
                console.log('✅ Input focused');
              }}
              onBlur={() => {
                console.log('❌ Input blurred! Active element is now:', document.activeElement?.tagName);
              }}
              onChange={(e) => {
                console.log('⌨️  onChange triggered. Value:', e.target.value);
                const value = e.target.value.replace(/[^0-9.]/g, '');
                console.log('✏️  Setting amount to:', value);
                setAmount(value);
                console.log('🔍 Focus after setState:', document.activeElement === e.target ? 'MAINTAINED' : 'LOST');
              }}
              placeholder="$0.00"
              className="w-full px-6 py-4 rounded-2xl border-2 border-gray-300 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-colors text-2xl font-semibold text-center shadow-lg hover:border-blue-300"
            />
          </div>
        </div>

        {/* Amount Breakdown Cards */}
        {num > 0 && (
          <div className="space-y-4 mb-12">
            <NumberMotion
              value={needs}
              label="Needs (50%) - Essentials like rent, food, utilities"
              color="bg-green-100"
              icon="🏠"
            />
            <NumberMotion
              value={wants}
              label="Wants (30%) - Entertainment, dining out, hobbies"
              color="bg-blue-100"
              icon="🎯"
            />
            <NumberMotion
              value={savings}
              label="Savings & Debt (20%) - Emergency fund, investments, debt repayment"
              color="bg-purple-100"
              icon="💰"
            />
          </div>
        )}

        {/* Info card */}
        {num === 0 && (
          <div
            className="p-6 rounded-2xl shadow-lg border border-gray-200 mb-12"
            style={{ background: 'rgba(255, 255, 255, 0.9)' }}
          >
            <div className="flex items-start">
              <span className="text-3xl mr-4">📋</span>
              <div>
                <h3 className="font-bold text-gray-800 mb-2 text-lg">How it works</h3>
                <p className="text-lg text-gray-600 mb-3">
                  The 50/30/20 rule is a simple budgeting method that divides your income into three categories:
                </p>
                <ul className="text-lg text-gray-600 space-y-1">
                  <li>• <strong>50%</strong> for needs (housing, food, utilities)</li>
                  <li>• <strong>30%</strong> for wants (entertainment, dining, hobbies)</li>
                  <li>• <strong>20%</strong> for savings and debt repayment</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <motion.div 
          className="flex flex-col sm:flex-row justify-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <motion.button
            className="px-6 py-3 rounded-2xl border-2 border-blue-400 bg-white text-blue-600 hover:bg-blue-50 transition font-medium shadow-lg"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            Save Budget
          </motion.button>
          <motion.button
            className="px-6 py-3 rounded-2xl bg-blue-500 text-white hover:bg-blue-600 transition font-medium shadow-lg"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setAmount('')}
          >
            Reset
          </motion.button>
        </motion.div>
      </div>

      <div className="h-32"></div>
    </div>
  );
};

export default CalculatorPage;