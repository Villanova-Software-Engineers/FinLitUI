import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const BudgetIntro = () => {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen p-6 relative overflow-hidden font-sans"
      style={{
        background: 'linear-gradient(120deg, #e0f7fa 0%, #e8f5e9 50%, #e3f2fd 100%)',
      }}
    >
      {/* Header */}
      <motion.div
        className="flex items-center justify-between mb-10 sticky top-0 z-50 bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-lg shadow-md"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center">
          <motion.button
            className="px-4 py-2 rounded-lg text-blue-600 hover:bg-blue-50 font-medium transition"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/game')}
          >
            ← Back to Learning Path
          </motion.button>
        </div>
      </motion.div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Hero Section */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <motion.div
            className="inline-block mb-6"
            animate={{
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <span className="text-6xl">📊</span>
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-800">
            What is the 50/30/20 Budget Rule?
          </h1>
          <p className="text-xl text-gray-600">
            A simple, time-tested framework for managing your money
          </p>
        </motion.div>

        {/* Content Cards */}
        <div className="space-y-6 mb-12">
          {/* What it is */}
          <motion.div
            className="p-8 rounded-2xl shadow-xl bg-white"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-14 h-14 rounded-2xl bg-blue-500 flex items-center justify-center shadow-lg">
                  <span className="text-3xl">💡</span>
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">What It Is</h3>
                <p className="text-gray-700 text-base leading-relaxed">
                  The 50/30/20 rule is a budgeting guideline popularized by Senator <span className="font-semibold">Elizabeth Warren</span>.
                  It divides your after-tax income into three categories: <span className="font-bold text-green-600">50% for needs</span>,
                  <span className="font-bold text-blue-600"> 30% for wants</span>, and <span className="font-bold text-purple-600"> 20% for savings</span>.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Where it's used */}
          <motion.div
            className="p-8 rounded-2xl shadow-xl bg-white"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-14 h-14 rounded-2xl bg-green-500 flex items-center justify-center shadow-lg">
                  <span className="text-3xl">🌍</span>
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">Where It's Used</h3>
                <p className="text-gray-700 text-base leading-relaxed">
                  Used <span className="font-semibold">worldwide by millions</span>, from graduates to families to financial advisors.
                  Taught in personal finance courses and featured in budgeting apps.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Why it's popular */}
          <motion.div
            className="p-8 rounded-2xl shadow-xl bg-white"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-14 h-14 rounded-2xl bg-purple-500 flex items-center justify-center shadow-lg">
                  <span className="text-3xl">⭐</span>
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Why It's Popular</h3>
                <div className="space-y-3">
                  {[
                    "Simple to remember: Just three categories",
                    "Flexible: Works for any income level",
                    "Balanced: Covers essentials while allowing enjoyment",
                    "Easy to start: No complex tracking",
                    "Proven results: Helps build wealth over time"
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <span className="text-green-600 font-bold text-xl">✓</span>
                      <p className="text-gray-700 text-base">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* CTA Button */}
        <motion.div
          className="flex justify-center pb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <motion.button
            onClick={() => navigate('/needs')}
            className="px-10 py-4 rounded-2xl bg-blue-500 text-white font-bold text-lg shadow-xl hover:bg-blue-600 transition"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            Continue to Needs →
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};

export default BudgetIntro;
