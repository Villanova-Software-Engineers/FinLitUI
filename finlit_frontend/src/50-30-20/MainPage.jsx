import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const MainPage = () => {
  // hoveredSegment removed — pie chart is static; card hover state isn't used
  const navigate = useNavigate();

  const categories = [
    { 
      key: '50', 
      title: 'Needs', 
      color: '#10b981', 
      icon: '🏠',
      description: 'Essential expenses like housing, food, and utilities',
      examples: ['Housing', 'Utilities', 'Groceries', 'Transportation']
    },
    { 
      key: '30', 
      title: 'Wants', 
      color: '#3b82f6', 
      icon: '🎯',
      description: 'Non-essential spending for lifestyle and enjoyment',
      examples: ['Dining Out', 'Entertainment', 'Shopping', 'Travel']
    },
    { 
      key: '20', 
      title: 'Savings & Debt', 
      color: '#8b5cf6', 
      icon: '💰',
      description: 'Building your future and paying down debt',
      examples: ['Emergency Fund', 'Retirement', 'Investments', 'Extra Payments']
    }
  ];

  const categoryOrder = ['50', '30', '20'];
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

  // Simple pie chart matching the 50-page appearance (static)
  const PieChart = ({ activeKey = '50' }) => {
    const segments = categoryOrder.map((key) => {
      const percent = key === '50' ? 50 : key === '30' ? 30 : 20;
      return { percent, color: categories.find(c => c.key === key).color, label: categories.find(c => c.key === key).title };
    });

    return (
      <div className="relative w-64 h-64 mx-auto">
        {/* Pie slices */}
        <svg viewBox="0 0 100 100" className="transform -rotate-90">
          {segments.map((seg, idx) => {
            const prevPercents = segments.slice(0, idx).reduce((sum, s) => sum + s.percent, 0);
            const startAngle = (prevPercents / 100) * 360;
            const endAngle = ((prevPercents + seg.percent) / 100) * 360;

            const startRad = (startAngle * Math.PI) / 180;
            const endRad = (endAngle * Math.PI) / 180;

            const x1 = 50 + 50 * Math.cos(startRad);
            const y1 = 50 + 50 * Math.sin(startRad);
            const x2 = 50 + 50 * Math.cos(endRad);
            const y2 = 50 + 50 * Math.sin(endRad);

            const largeArc = seg.percent > 50 ? 1 : 0;

            return (
              <path
                key={idx}
                d={`M 50 50 L ${x1} ${y1} A 50 50 0 ${largeArc} 1 ${x2} ${y2} Z`}
                fill={seg.color}
                stroke="#ffffff"
                strokeWidth="2"
              />
            );
          })}
        </svg>

        {/* Center label (e.g. "Needs (50%)") */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-28 h-28 bg-white rounded-full shadow-lg flex flex-col items-center justify-center text-center p-2">
            <div className="text-3xl">{categories.find(c => c.key === activeKey).icon}</div>
            <div className="text-sm font-bold mt-1" style={{ color: categories.find(c => c.key === activeKey).color }}>
              {/* {categories.find(c => c.key === activeKey).title} */}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      className="min-h-screen p-6 relative overflow-hidden font-sans flex flex-col items-center justify-center"
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

      {/* Main Content */}
      <div className="relative z-10 max-w-5xl w-full">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.h1 
            className="text-5xl md:text-6xl font-bold mb-4 text-gray-800"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            50/30/20 Budget Rule
          </motion.h1>
          <motion.p 
            className="text-xl text-gray-600"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            A simple budgeting framework for financial wellness
          </motion.p>
        </motion.div>

        {/* Chart Section */}
        <motion.div
          className="rounded-2xl shadow-xl p-8 mb-8 mx-auto max-w-2xl"
          style={{ background: 'rgba(255, 255, 255, 0.9)' }}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <PieChart />

          {/* Legend (matches the 50-page style) */}
          <div className="flex justify-center gap-4 mt-6 flex-wrap">
            {categoryOrder.map((key, idx) => {
              const cat = categories.find(c => c.key === key);
              const percent = key === '50' ? 50 : key === '30' ? 30 : 20;
              return (
                  <motion.div
                    key={key}
                    className="flex items-center gap-2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.6 + idx * 0.1 }}
                  >
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: cat.color }} />
                    <span className="text-sm text-gray-700">
                      {cat.title}
                      <span className="font-semibold ml-1" style={{ color: cat.color }}>{percent}%</span>
                    </span>
                  </motion.div>
                );
            })}
          </div>
        </motion.div>

        {/* Category Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {categories.map((cat, idx) => (
            <motion.div
              key={cat.key}
              className="rounded-2xl shadow-lg p-6 cursor-pointer overflow-hidden"
              style={{ 
                background: 'rgba(255, 255, 255, 0.9)',
                borderTop: `4px solid ${cat.color}`
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 + idx * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div 
                  className="p-3 rounded-full"
                  style={{ backgroundColor: `${cat.color}22` }}
                >
                  <span className="text-3xl">{cat.icon}</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{cat.title}</h3>
                  <p className="text-2xl font-bold" style={{ color: cat.color }}>
                    {cat.key}%
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-3">{cat.description}</p>
              <div className="flex flex-wrap gap-2">
                {cat.examples.slice(0, 2).map((ex, i) => (
                  <span 
                    key={i}
                    className="px-2 py-1 rounded-full text-xs font-medium"
                    style={{ 
                      backgroundColor: `${cat.color}22`,
                      color: cat.color
                    }}
                  >
                    {ex}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row justify-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <motion.button
            className="px-8 py-4 rounded-2xl bg-blue-500 text-white hover:bg-blue-600 transition font-semibold text-lg shadow-lg"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/needs')}
          >
            Start Learning →
          </motion.button>
          <motion.button
            className="px-8 py-4 rounded-2xl border-2 border-blue-400 bg-white text-blue-600 hover:bg-blue-50 transition font-semibold text-lg shadow-lg"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/calculator')}
          >
            Calculate Budget
          </motion.button>
        </motion.div>

        {/* Info Section */}
        <motion.div
          className="mt-12 rounded-2xl shadow-lg p-6 max-w-2xl mx-auto"
          style={{ background: 'rgba(255, 255, 255, 0.9)' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1 }}
        >
          <div className="flex items-start gap-4">
            <span className="text-4xl">💡</span>
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">How It Works</h3>
              <p className="text-sm text-gray-600">
                The 50/30/20 rule divides your after-tax income into three categories: 
                50% for needs (essentials), 30% for wants (lifestyle), and 20% for savings 
                and debt repayment. This simple framework helps you maintain financial 
                balance while working toward your goals.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default MainPage;