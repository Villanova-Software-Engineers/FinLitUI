
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useModuleScore, MODULES } from '../hooks/useModuleScore';

// Budget breakdown configurations - defined outside to prevent recreation
const BREAKDOWN_503020 = [
  { label: "Needs", percent: 0.50, color: "bg-green-100", text: "text-green-800", icon: "🏠" },
  { label: "Wants", percent: 0.30, color: "bg-blue-100", text: "text-blue-800", icon: "🎯" },
  { label: "Savings", percent: 0.20, color: "bg-purple-100", text: "text-purple-800", icon: "💰" }
];

const BREAKDOWN_RAMSEY = [
  { label: "Giving", percent: 0.10, color: "bg-yellow-100", text: "text-yellow-800", icon: "🤲" },
  { label: "Saving", percent: 0.10, color: "bg-purple-100", text: "text-purple-800", icon: "🐷" },
  { label: "Housing", percent: 0.25, color: "bg-green-100", text: "text-green-800", icon: "🏡" },
  { label: "Food", percent: 0.10, color: "bg-orange-100", text: "text-orange-800", icon: "🛒" },
  { label: "Transportation", percent: 0.10, color: "bg-blue-100", text: "text-blue-800", icon: "🚗" },
  { label: "Utilities", percent: 0.05, color: "bg-cyan-100", text: "text-cyan-800", icon: "💡" },
  { label: "Insurance", percent: 0.10, color: "bg-red-100", text: "text-red-800", icon: "🛡️" },
  { label: "Health", percent: 0.05, color: "bg-pink-100", text: "text-pink-800", icon: "⚕️" },
  { label: "Recreation", percent: 0.05, color: "bg-indigo-100", text: "text-indigo-800", icon: "🎉" },
  { label: "Personal", percent: 0.05, color: "bg-teal-100", text: "text-teal-800", icon: "👤" },
  { label: "Misc", percent: 0.05, color: "bg-gray-100", text: "text-gray-800", icon: "📦" }
];

// Separate input component to prevent focus loss on re-renders
const CalculatorInput = React.memo(({ calculatorIncome, onIncomeChange }) => {
  const inputRef = React.useRef(null);

  const handleChange = (e) => {
    const value = e.target.value.replace(/[^0-9.]/g, '');
    onIncomeChange(value);
  };

  return (
    <div className="mb-10 text-center">
      <label className="block text-gray-600 font-semibold mb-2">Monthly After-Tax Income</label>
      <div className="relative inline-block w-full max-w-xs">
        <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-xl pointer-events-none">$</span>
        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={calculatorIncome}
          onChange={handleChange}
          placeholder="0"
          className="w-full pl-10 pr-4 py-4 text-3xl font-bold text-center border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:outline-none transition"
        />
      </div>
    </div>
  );
});

// 10 Quiz Questions with explanations
const quizQuestions = [
  {
    question: "What percentage of your income should go towards needs in the 50/30/20 rule?",
    options: ["30%", "50%", "20%", "40%"],
    correctIndex: 1,
    explanation: "The 50/30/20 rule allocates 50% of your after-tax income to needs (essential expenses like housing, utilities, and groceries), 30% to wants, and 20% to savings and debt repayment."
  },
  {
    question: "Which of the following is considered a 'need'?",
    options: ["Netflix subscription", "Dining out", "Rent/Mortgage", "Concert tickets"],
    correctIndex: 2,
    explanation: "Needs are essential expenses you can't avoid. Rent or mortgage is a fundamental need for shelter. Entertainment like Netflix, dining out, and concerts are considered 'wants' since they're non-essential."
  },
  {
    question: "What category does a gym membership fall into?",
    options: ["Needs (50%)", "Wants (30%)", "Savings (20%)", "None"],
    correctIndex: 1,
    explanation: "While exercise is important for health, a gym membership is considered a 'want' because there are free alternatives like outdoor running or home workouts. Wants are non-essential lifestyle choices."
  },
  {
    question: "How much should you allocate to savings and debt repayment in the 50/30/20 rule?",
    options: ["50%", "30%", "20%", "10%"],
    correctIndex: 2,
    explanation: "The 50/30/20 rule recommends 20% of your after-tax income for savings and debt repayment. This includes emergency funds, retirement savings, investments, and extra debt payments beyond minimums."
  },
  {
    question: "If your monthly after-tax income is $4,000, how much should go to wants?",
    options: ["$2,000", "$1,200", "$800", "$1,600"],
    correctIndex: 1,
    explanation: "With $4,000 monthly income, 30% should go to wants: $4,000 × 0.30 = $1,200. This covers non-essential spending like entertainment, dining out, hobbies, and subscriptions."
  },
  {
    question: "In Dave Ramsey's budget, what percentage should go to giving?",
    options: ["5%", "10%", "15%", "20%"],
    correctIndex: 1,
    explanation: "Dave Ramsey's approach recommends 10% for giving (charitable donations and tithing). This reflects his philosophy of generosity as a foundational principle of financial management."
  },
  {
    question: "What is Dave Ramsey's recommended percentage for housing?",
    options: ["50%", "25%", "30%", "15%"],
    correctIndex: 1,
    explanation: "Dave Ramsey recommends keeping housing costs at 25% of your take-home pay. This is more conservative than the 50/30/20 rule and helps ensure you don't become 'house poor' with too much income tied up in housing."
  },
  {
    question: "Which budget method provides more detailed category breakdowns?",
    options: ["50/30/20 rule", "Dave Ramsey's approach", "Both are equal", "Neither"],
    correctIndex: 1,
    explanation: "Dave Ramsey's approach provides 11 specific categories (giving, saving, food, utilities, housing, transportation, health, insurance, recreation, personal, misc), while 50/30/20 uses just 3 broad categories. More detail can help with precision but requires more tracking."
  },
  {
    question: "Emergency fund savings should be included in which 50/30/20 category?",
    options: ["Needs", "Wants", "Savings & Debt", "All categories"],
    correctIndex: 2,
    explanation: "Emergency fund savings belong in the 'Savings & Debt' (20%) category. Building an emergency fund of 3-6 months of expenses is crucial for financial security and should be a top priority."
  },
  {
    question: "What is the main advantage of the 50/30/20 rule?",
    options: ["Most detailed", "Simplicity and ease", "Includes giving", "Best for everyone"],
    correctIndex: 1,
    explanation: "The 50/30/20 rule's biggest advantage is its simplicity - just three categories make it easy to remember and implement. This simplicity helps beginners start budgeting without feeling overwhelmed by complex tracking."
  }
];

const needsData = {
  title: "Needs (50%)",
  color: "#10b981",
  icon: "🏠",
  description: "Essential expenses you can't avoid",
  items: [
    { name: 'Housing', description: 'Rent or mortgage payments', icon: '🏡', details: 'Aim to keep this under 25% of your take-home pay.' },
    { name: 'Utilities', description: 'Electricity, water, gas, internet', icon: '💡', details: 'Look for energy-efficient appliances to lower costs.' },
    { name: 'Groceries', description: 'Essential food and household items', icon: '🛒', details: 'Meal planning can significantly reduce food waste and costs.' },
    { name: 'Transportation', description: 'Car payment, gas, public transit', icon: '🚗', details: 'Consider carpooling or public transit to save on gas.' },
    { name: 'Insurance', description: 'Health, auto, home insurance', icon: '🛡️', details: 'Shop around annually to ensure you receive the best rate.' },
    { name: 'Healthcare', description: 'Medical expenses and prescriptions', icon: '⚕️', details: 'Preventive care often saves money in the long run.' }
  ]
};

const wantsData = {
  title: "Wants (30%)",
  color: "#3b82f6",
  icon: "🎯",
  description: "Non-essential spending for lifestyle and enjoyment",
  items: [
    { name: 'Dining Out', description: 'Restaurants and takeout', icon: '🍽️', details: 'Limit to special occasions or set a strict weekly cap.' },
    { name: 'Entertainment', description: 'Movies, concerts, events', icon: '🎬', details: 'Look for free community events or matinee prices.' },
    { name: 'Shopping', description: 'Non-essential clothing and items', icon: '🛍️', details: 'Wait 24 hours before buying non-essentials to avoid impulse buys.' },
    { name: 'Subscriptions', description: 'Streaming services, memberships', icon: '📺', details: 'Audit monthly; cancel what you do not use regularly.' },
    { name: 'Hobbies', description: 'Sports, crafts, interests', icon: '🎨', details: 'Focus on hobbies that are low-cost or high-fulfillment.' },
    { name: 'Travel', description: 'Vacations and leisure trips', icon: '✈️', details: 'Book in advance and travel during off-peak seasons for deals.' }
  ]
};

const savingsData = {
  title: "Savings & Debt (20%)",
  color: "#8b5cf6",
  icon: "💰",
  description: "Building your future and paying down debt",
  items: [
    { name: 'Emergency Fund', description: '3-6 months of expenses', icon: '🆘', details: 'Start with $1,000, then aim for 3-6 months of expenses.' },
    { name: 'Retirement', description: '401(k), IRA contributions', icon: '🏖️', details: 'Start early to take advantage of compound interest.' },
    { name: 'Investments', description: 'Stocks, bonds, mutual funds', icon: '📈', details: 'Diversify your portfolio to manage risk effectively.' },
    { name: 'Extra Debt Payments', description: 'Above minimum payments', icon: '💸', details: 'Use the snowball or avalanche method to pay off debt faster.' },
    { name: 'Savings Goals', description: 'Down payment, education', icon: '🎯', details: 'Set specific revenue targets and timelines for motivation.' }
  ]
};

const IntroPage = ({ handleNext }) => (
  <div className="min-h-screen p-6 relative overflow-hidden" style={{ background: 'linear-gradient(120deg, #e0f7fa 0%, #e8f5e9 50%, #e3f2fd 100%)' }}>
    <div className="max-w-5xl mx-auto pt-16">

      <div className="max-w-5xl mx-auto">
        <motion.div className="text-center mb-12" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-5xl font-bold mb-4 text-gray-800">What is the 50/30/20 Budget Rule?</h1>
          <p className="text-xl text-gray-600">A simple, time-tested framework for managing your money</p>
        </motion.div>

        <div className="space-y-6 mb-12">
          {/* What it is */}
          <motion.div className="p-8 rounded-3xl shadow-xl bg-white" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-blue-500 flex items-center justify-center shadow-lg flex-shrink-0">
                <span className="text-3xl">💡</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">What It Is</h3>
                <p className="text-gray-700 text-lg leading-relaxed">
                  The 50/30/20 rule is a budgeting guideline popularized by Senator <span className="font-semibold">Elizabeth Warren</span>.
                  It divides your after-tax income into three categories: <span className="font-bold text-green-600">50% for needs</span>,
                  <span className="font-bold text-blue-600"> 30% for wants</span>, and <span className="font-bold text-purple-600"> 20% for savings</span>.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Where it's used */}
          <motion.div className="p-8 rounded-3xl shadow-xl bg-white" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-green-500 flex items-center justify-center shadow-lg flex-shrink-0">
                <span className="text-3xl">🌍</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">Where It's Used</h3>
                <p className="text-gray-700 text-lg leading-relaxed">
                  Used <span className="font-semibold">worldwide by millions</span>, from graduates to families to financial advisors.
                  Taught in personal finance courses and featured in budgeting apps.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Why it's popular */}
          <motion.div className="p-8 rounded-3xl shadow-xl bg-white" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-purple-500 flex items-center justify-center shadow-lg flex-shrink-0">
                <span className="text-3xl">⭐</span>
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
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className="text-green-600 font-bold text-2xl">✓</span>
                      <p className="text-gray-700 text-lg">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Navigation */}
        <div className="flex justify-center pb-12">
          <button onClick={handleNext} className="px-10 py-4 rounded-2xl bg-blue-500 text-white font-bold text-lg shadow-xl hover:bg-blue-600 transition">
            Continue to Needs →
          </button>
        </div>
      </div>
    </div>
  </div>
);

// Steps 1-3: Needs, Wants, Savings pages
const CategoryPage = ({ categoryKey, title, icon, items, description, currentStep, totalSteps, handlePrev, handleNext, navigate }) => {
  const [expandedIndex, setExpandedIndex] = useState(null);

  const categoryColors = {
    '50': '#10b981', // green for Needs
    '30': '#3b82f6', // blue for Wants
    '20': '#8b5cf6'  // purple for Savings
  };
  const borderColor = categoryColors[categoryKey];

  // Pie Chart Component - Memoized to prevent re-renders on item expansion
  const PieChart = React.useMemo(() => {
    const segments = [
      { percent: 50, color: "#10b981", label: 'Needs', key: '50' },
      { percent: 30, color: "#3b82f6", label: 'Wants', key: '30' },
      { percent: 20, color: "#8b5cf6", label: 'Savings', key: '20' }
    ];

    return (
      <div className="relative w-64 h-64 mx-auto my-8">
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
                fill={seg.key === categoryKey ? seg.color : `${seg.color}44`}
                stroke="#ffffff"
                strokeWidth="2"
              />
            );
          })}
        </svg>

        {/* Center circle */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-24 h-24 bg-white rounded-full shadow-lg flex items-center justify-center">
            <span className="text-4xl">{icon}</span>
          </div>
        </div>
      </div>
    );
  }, [categoryKey, icon]);

  return (
    <div className="max-w-4xl mx-auto pt-16">

      <motion.h2 className="text-4xl font-bold mb-4 text-center text-gray-800" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <span className="text-5xl mr-3">{icon}</span>
        {title}
      </motion.h2>
      <p className="text-center text-gray-600 mb-8 text-lg">{description}</p>

      {/* Pie Chart Section */}
      <motion.div
        className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-8 max-w-md mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {PieChart}
        <div className="flex justify-center gap-4 flex-wrap">
          {[
            { label: 'Needs', color: '#10b981', key: '50' },
            { label: 'Wants', color: '#3b82f6', key: '30' },
            { label: 'Savings', color: '#8b5cf6', key: '20' }
          ].map((item) => (
            <div key={item.key} className={`flex items-center gap-2 ${item.key === categoryKey ? 'opacity-100 font-bold' : 'opacity-50'}`}>
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
              <span className="text-sm text-gray-700">{item.label}</span>
            </div>
          ))}
        </div>
      </motion.div>

      <div className="grid gap-4 mb-8">
        {items.map((item, idx) => (
          <motion.div
            key={idx}
            className="p-5 bg-white rounded-xl shadow-md hover:shadow-lg transition cursor-pointer border-l-4"
            style={{ borderLeftColor: borderColor }}
            onClick={() => setExpandedIndex(expandedIndex === idx ? null : idx)}
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{item.icon}</span>
                <div>
                  <h4 className="font-bold text-gray-800">{item.name}</h4>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </div>
              </div>
              <motion.div
                animate={{ rotate: expandedIndex === idx ? 180 : 0 }}
                className="text-gray-400"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </motion.div>
            </div>

            <AnimatePresence>
              {expandedIndex === idx && (
                <motion.div
                  initial={{ height: 0, opacity: 0, marginTop: 0 }}
                  animate={{ height: 'auto', opacity: 1, marginTop: 16 }}
                  exit={{ height: 0, opacity: 0, marginTop: 0 }}
                  className="overflow-hidden"
                >
                  <div className="pt-4 border-t border-gray-200/50">
                    <p className="text-gray-700 mb-3 bg-white/50 p-3 rounded-lg text-sm leading-relaxed">
                      💡 <span className="font-semibold">Tip:</span> {item.details}
                    </p>
                    <div className="flex gap-2">
                      <span className="px-3 py-1 bg-white text-gray-600 border border-gray-200 rounded-full text-xs font-medium shadow-sm">
                        {categoryKey}% Category
                      </span>
                      <span className="px-3 py-1 bg-white text-gray-600 border border-gray-200 rounded-full text-xs font-medium shadow-sm">
                        Priority
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      <div className="flex justify-center gap-4">
        <button onClick={handlePrev} className="px-8 py-4 rounded-2xl border-2 border-blue-400 bg-white text-blue-600 font-semibold text-lg shadow-lg hover:bg-blue-50">
          ← Back
        </button>
        <button onClick={handleNext} className="px-8 py-4 rounded-2xl bg-blue-500 text-white font-semibold text-lg shadow-lg hover:bg-blue-600">
          Next →
        </button>
      </div>
    </div>
  );
};

// Step 4: Comparison Page
const ComparisonPage = ({ currentStep, totalSteps, handlePrev, handleNext, navigate }) => (
  <div className="min-h-screen pt-20 p-6" style={{ background: 'linear-gradient(120deg, #e0f7fa 0%, #e8f5e9 50%, #e3f2fd 100%)' }}>

    <div className="max-w-6xl mx-auto">

      <h1 className="text-4xl font-bold mb-8 text-center text-gray-800">Budget Method Comparison</h1>

      <div className="mb-6 p-5 bg-gradient-to-r from-blue-100 to-green-100 rounded-xl border-2 border-green-400 shadow-lg">
        <p className="text-center text-gray-800 text-lg mb-2">
          <span className="font-bold">📊 Compare Methods:</span> The 50/30/20 is a great start, but
          <span className="font-bold text-green-700"> Dave Ramsey's modern approach</span> offers more detailed guidance.
        </p>
        <p className="text-center text-gray-700 text-lg">
          The <span className="font-bold text-green-800">Ramsey Chart</span> helps you assign every single dollar a name (Zero-Based Budgeting) using recommended percentages.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-8">
        {/* 50/30/20 */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h4 className="text-2xl font-bold text-blue-600 mb-6 text-center">Traditional 50/30/20</h4>
          {[
            { label: "Needs", percent: "50%", color: "#10b981" },
            { label: "Wants", percent: "30%", color: "#3b82f6" },
            { label: "Savings & Debt", percent: "20%", color: "#8b5cf6" }
          ].map((item, i) => (
            <div key={i} className="flex justify-between p-4 rounded-lg mb-3" style={{ background: `${item.color}22` }}>
              <span className="font-semibold">{item.label}</span>
              <span className="font-bold" style={{ color: item.color }}>{item.percent}</span>
            </div>
          ))}
          <p className="text-sm text-gray-600 mt-4">Simple three-category approach</p>
        </div>

        {/* Dave Ramsey */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 ring-4 ring-green-400 relative">
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-2 rounded-full text-sm font-bold">⭐ RECOMMENDED</div>
          <h4 className="text-2xl font-bold text-green-600 mb-6 text-center mt-2">Dave Ramsey's Approach</h4>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {[
              ["Giving", "10%"], ["Saving", "10%"], ["Food", "10-15%"], ["Utilities", "5-10%"],
              ["Housing", "25%"], ["Transportation", "10%"], ["Health", "5-10%"],
              ["Insurance", "10-25%"], ["Recreation", "5-10%"], ["Personal", "5-10%"], ["Miscellaneous", "5-10%"]
            ].map(([label, percent], i) => (
              <div key={i} className="flex justify-between p-3 rounded-lg bg-gradient-to-r from-green-50 to-gray-50">
                <span className="font-semibold">{label}</span>
                <span className="font-bold text-green-700">{percent}</span>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-700 mt-4 p-4 bg-green-50 rounded-lg">
            <span className="font-bold">✨ Modern & intentional:</span> 11 specific categories with proven percentages
          </p>
        </div>
      </div>

      <div className="flex justify-center gap-4">
        <button onClick={handlePrev} className="px-8 py-4 rounded-2xl border-2 border-blue-400 bg-white text-blue-600 font-semibold text-lg shadow-lg hover:bg-blue-50">
          ← Back
        </button>
        <button onClick={handleNext} className="px-8 py-4 rounded-2xl bg-blue-500 text-white font-semibold text-lg shadow-lg hover:bg-blue-600">
          Next →
        </button>
      </div>
    </div>
  </div>
);

// Step 5: Ways to Save
const WaysToSavePage = ({ currentStep, totalSteps, handlePrev, handleNext, navigate }) => (
  <div className="max-w-6xl mx-auto pt-24 px-6 pb-16">

    <h1 className="text-4xl font-bold mb-6 text-center text-gray-800">💰 Ways to Save More per Paycheck</h1>
    <p className="text-gray-600 mb-10 text-center text-lg max-w-2xl mx-auto">How to hit your savings goal even on a tight budget. Small changes today lead to big results tomorrow.</p>

    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
      {[
        { icon: "📝", title: "Get on a Budget", desc: "A budget is the key to breaking the paycheck-to-paycheck cycle. It gives every dollar a job.", color: "from-blue-50 to-blue-100" },
        { icon: "✂️", title: "Cut Expenses", desc: "Go through your budget line by line. Cancel unused subscriptions and cook at home more often.", color: "from-green-50 to-green-100" },
        { icon: "🚫", title: "Ditch Your Debt", desc: "Use the debt snowball method: attack smallest debts first for quick psychological wins.", color: "from-purple-50 to-purple-100" },
        { icon: "🤖", title: "Automate Savings", desc: "Set up an automatic transfer to your savings account on payday so you don't even see the money.", color: "from-indigo-50 to-indigo-100" },
        { icon: "🛍️", title: "24-Hour Rule", desc: "Wait 24 hours before making any non-essential purchase over $50 to avoid impulse buying.", color: "from-rose-50 to-rose-100" },
        { icon: "📉", title: "Shop Generic", desc: "Buy store brands for groceries and household items. They usually have the same ingredients for less.", color: "from-teal-50 to-teal-100" },
        { icon: "📈", title: "Increase Income", desc: "Side hustles, part-time jobs, or selling items you no longer need can accelerate your goals.", color: "from-yellow-50 to-yellow-100" },
        { icon: "🏠", title: "Lower Housing Costs", desc: "Consider a roommate or downsizing if your rent/mortgage is consistently over 25-30% of your pay.", color: "from-orange-50 to-orange-100" },
        { icon: "⚡", title: "Audit Energy Use", desc: "A programmable thermostat and LED bulbs can save you hundreds on utilities every year.", color: "from-cyan-50 to-cyan-100" },
      ].map((item, i) => (
        <motion.div
          key={i}
          className={`p-6 rounded-2xl bg-gradient-to-br ${item.color} shadow-sm border border-white/50 hover:shadow-md transition-shadow`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
        >
          <div className="flex items-start gap-4">
            <div className="bg-white p-3 rounded-xl shadow-sm text-3xl">{item.icon}</div>
            <div>
              <h4 className="text-xl font-bold text-gray-800 mb-2">{item.title}</h4>
              <p className="text-sm text-gray-700 leading-relaxed">{item.desc}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>

    <div className="flex justify-center gap-4">
      <button onClick={handlePrev} className="px-8 py-4 rounded-2xl border-2 border-blue-400 bg-white text-blue-600 font-semibold text-lg shadow-lg hover:bg-blue-50">
        ← Back
      </button>
      <button onClick={handleNext} className="px-8 py-4 rounded-2xl bg-blue-500 text-white font-semibold text-lg shadow-lg hover:bg-blue-600">
        Next →
      </button>
    </div>
  </div>
);

// Step 6: Calculator - Defined outside to prevent recreation
const CalculatorPageComponent = ({
  calculatorIncome,
  handleIncomeChange,
  calculatorMethod,
  setCalculatorMethod,
  currentStep,
  totalSteps,
  handlePrev,
  handleNext,
  navigate
}) => {
  const income = parseFloat(calculatorIncome) || 0;
  const currentBreakdown = calculatorMethod === '503020' ? BREAKDOWN_503020 : BREAKDOWN_RAMSEY;

  return (
    <div className="max-w-4xl mx-auto pt-16">

      <h1 className="text-4xl font-bold mb-6 text-center text-gray-800">Budget Calculator</h1>
      <p className="text-center text-gray-600 mb-8 text-lg">See exactly where your money should go</p>

      <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
        {/* Toggle */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-100 p-1 rounded-xl flex">
            <button
              onClick={() => setCalculatorMethod('503020')}
              className={`px-6 py-2 rounded-lg font-bold transition ${calculatorMethod === '503020' ? 'bg-white shadow-md text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              50/30/20 Rule
            </button>
            <button
              onClick={() => setCalculatorMethod('ramsey')}
              className={`px-6 py-2 rounded-lg font-bold transition ${calculatorMethod === 'ramsey' ? 'bg-white shadow-md text-green-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Dave Ramsey
            </button>
          </div>
        </div>

        {/* Input */}
        <CalculatorInput
          calculatorIncome={calculatorIncome}
          onIncomeChange={handleIncomeChange}
        />

        {/* Breakdown */}
        {income > 0 ? (
          <div className={`grid gap-4 ${calculatorMethod === 'ramsey' ? 'md:grid-cols-2 lg:grid-cols-3' : 'md:grid-cols-3'}`}>
            {currentBreakdown.map((item, idx) => (
              <div
                key={`${item.label}-${idx}`}
                className={`${item.color} p-5 rounded-2xl flex flex-col items-center text-center`}
              >
                <span className="text-3xl mb-2">{item.icon}</span>
                <span className={`font-bold ${item.text}`}>{item.label}</span>
                <span className="text-xs text-gray-600 font-semibold mb-1">{(item.percent * 100).toFixed(0)}%</span>
                <span className={`text-2xl font-bold ${item.text}`}>${(income * item.percent).toFixed(0)}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-gray-400">
            <span className="text-5xl block mb-4">⌨️</span>
            Enter your income above to see the breakdown
          </div>
        )}
      </div>

      <div className="flex justify-center gap-4">
        <button onClick={handlePrev} className="px-8 py-4 rounded-2xl border-2 border-blue-400 bg-white text-blue-600 font-semibold text-lg shadow-lg hover:bg-blue-50">
          ← Back
        </button>
        <button onClick={handleNext} className="px-8 py-4 rounded-2xl bg-blue-500 text-white font-semibold text-lg shadow-lg hover:bg-blue-600">
          Next →
        </button>
      </div>
    </div>
  );
};

// Step 7: Quiz - Redesigned to match Case Study style
const QuizPage = ({ currentStep, showAnswerResult, currentQuestion, selectedAnswer, score, handleAnswerSelect, handleNextQuestion, resetQuiz, navigate, handlePrev, quizCompleted }) => (
  <div className="max-w-4xl mx-auto pt-16">
    {!quizCompleted ? (
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden flex flex-col min-h-[500px]">
        <div className="flex-1 p-8 lg:p-16 flex flex-col justify-center">
          <div className="flex justify-between items-end mb-8 border-b border-gray-100 pb-6">
            <div>
              <span className="text-sm font-bold text-blue-600 uppercase tracking-wider block mb-2">Question {currentQuestion + 1} of {quizQuestions.length}</span>
              <h2 className="text-2xl lg:text-4xl font-bold text-slate-900 leading-tight">
                {quizQuestions[currentQuestion].question}
              </h2>
            </div>
            <div className="hidden lg:block text-slate-300">
              <span className="text-5xl">🎯</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quizQuestions[currentQuestion].options.map((option, idx) => {
              const isSelected = selectedAnswer === idx;
              const isCorrect = idx === quizQuestions[currentQuestion].correctIndex;
              const showCorrectness = showAnswerResult && (isSelected || isCorrect);

              return (
                <button
                  key={idx}
                  onClick={() => handleAnswerSelect(idx)}
                  disabled={showAnswerResult}
                  className={`p-6 lg:p-8 rounded-2xl text-left border-2 transition-all flex items-start gap-4 ${showCorrectness
                    ? isCorrect
                      ? 'bg-green-50 border-green-500 text-green-900'
                      : isSelected
                        ? 'bg-red-50 border-red-500 text-red-900'
                        : 'bg-white border-slate-100 opacity-50'
                    : isSelected
                      ? 'bg-blue-50 border-blue-600 shadow-lg scale-[1.02]'
                      : 'bg-white border-slate-200 hover:border-blue-400 hover:shadow-md'
                    }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${showCorrectness && isCorrect ? 'bg-green-500 text-white' :
                    showCorrectness && isSelected ? 'bg-red-500 text-white' :
                      isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'
                    }`}>
                    {String.fromCharCode(65 + idx)}
                  </div>
                  <span className="text-lg font-medium leading-snug flex-1">{option}</span>
                  {showCorrectness && isCorrect && <span className="ml-auto text-green-600 shrink-0 text-2xl">✓</span>}
                  {showCorrectness && isSelected && !isCorrect && <span className="ml-auto text-red-600 shrink-0 text-2xl">✗</span>}
                </button>
              );
            })}
          </div>

          {showAnswerResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 bg-slate-900 text-white p-8 rounded-3xl flex flex-col md:flex-row items-center gap-8 shadow-2xl"
            >
              <div className="flex-1">
                <h4 className="font-bold text-blue-400 uppercase tracking-wider text-sm mb-2">Explanation</h4>
                <p className="text-lg leading-relaxed text-slate-200">
                  {quizQuestions[currentQuestion].explanation}
                </p>
              </div>
              <button
                onClick={handleNextQuestion}
                className="w-full md:w-auto px-8 py-4 bg-white text-slate-900 rounded-xl font-bold hover:bg-blue-50 transition-colors whitespace-nowrap"
              >
                {currentQuestion < quizQuestions.length - 1 ? 'Next Question' : 'Complete Quiz'}
              </button>
            </motion.div>
          )}
        </div>
      </div>
    ) : (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-3xl shadow-xl p-12 text-center border border-gray-100"
      >
        <div className={`w-32 h-32 mx-auto rounded-full flex items-center justify-center mb-8 shadow-2xl ${score >= 8 ? 'bg-green-500' : 'bg-amber-500'
          }`}>
          <span className="text-6xl">{score >= 8 ? '🏆' : '📚'}</span>
        </div>

        <h2 className="text-5xl font-black text-slate-900 mb-4">{score >= 8 ? 'Outstanding!' : 'Keep Learning!'}</h2>
        <p className="text-2xl text-slate-500 mb-10">You scored <span className="font-bold text-slate-900">{score}/{quizQuestions.length}</span> ({((score / quizQuestions.length) * 100).toFixed(0)}%)</p>

        {score >= 8 ? (
          <div className="bg-green-50 border-2 border-green-500 rounded-2xl p-8 mb-10">
            <p className="text-green-800 font-bold text-xl mb-2">🎊 Congratulations! You passed!</p>
            <p className="text-green-700 text-lg">You've mastered the Budgeting Basics module</p>
          </div>
        ) : (
          <div className="bg-amber-50 border-2 border-amber-500 rounded-2xl p-8 mb-10">
            <p className="text-amber-800 font-bold text-xl mb-2">You need 80% to pass (8/10 correct)</p>
            <p className="text-amber-700 text-lg">Review the material and try again - you're getting there!</p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={resetQuiz}
            className="px-8 py-4 rounded-xl bg-slate-900 text-white hover:bg-slate-800 font-bold text-lg transition-all shadow-lg"
          >
            Retake Quiz
          </button>
          <button
            onClick={() => navigate('/game')}
            className="px-8 py-4 rounded-xl border-2 border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-lg transition-all"
          >
            Back to Learning Path
          </button>
        </div>
      </motion.div>
    )}
  </div>
);

const BudgetingBasics = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const { saveScore, isModulePassed, refreshProgress } = useModuleScore();

  // Quiz state
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [showAnswerResult, setShowAnswerResult] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [answers, setAnswers] = useState([]);

  // Calculator state
  const [calculatorIncome, setCalculatorIncome] = useState('');
  const [calculatorMethod, setCalculatorMethod] = useState('503020'); // '503020' or 'ramsey'

  // Stable callback for income changes - prevents CalculatorInput from re-rendering
  const handleIncomeChange = useCallback((value) => {
    setCalculatorIncome(value);
  }, []);

  const modulePassed = isModulePassed(MODULES.BUDGETING_50_30_20.id);

  const totalSteps = 7; // 0:intro, 1:needs, 2:wants, 3:savings, 4:comparison, 5:ways-to-save, 6:calculator, 7:quiz

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleAnswerSelect = (index) => {
    if (showAnswerResult) return; // Prevent changing answer after selection
    setSelectedAnswer(index);
    setShowAnswerResult(true); // Show explanation immediately
  };

  const handleNextQuestion = () => {
    // Record the answer
    const newAnswers = [...answers, selectedAnswer];
    setAnswers(newAnswers);

    if (currentQuestion < quizQuestions.length - 1) {
      // Move to next question
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowAnswerResult(false);
    } else {
      // Calculate final score
      let finalScore = 0;
      newAnswers.forEach((answer, idx) => {
        if (answer === quizQuestions[idx].correctIndex) {
          finalScore++;
        }
      });
      setScore(finalScore);
      setQuizCompleted(true);

      // Save to Firebase - need 80% (8 out of 10)
      const percentage = (finalScore / quizQuestions.length) * 100;
      if (percentage >= 80) {
        saveScore(MODULES.BUDGETING_50_30_20.id, percentage);
      }
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setScore(0);
    setShowAnswerResult(false);
    setQuizCompleted(false);
    setAnswers([]);
  };

  // Render current step
  return (
    <div className="min-h-screen relative overflow-x-hidden" style={{ background: 'linear-gradient(120deg, #e0f7fa 0%, #e8f5e9 50%, #e3f2fd 100%)' }}>
      {/* Fixed Navigation Elements - Stable across transitions */}
      <button
        className="absolute top-4 left-4 px-4 py-2 rounded-lg text-blue-600 hover:bg-white/50 backdrop-blur-sm font-medium transition z-50 shadow-sm border border-blue-100"
        onClick={() => navigate('/game')}
      >
        ← Back to Learning Path
      </button>

      {/* Global Step Counter */}
      <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-50">
        <div className="bg-white/80 backdrop-blur-md px-4 py-1.5 rounded-full shadow-sm border border-gray-100 text-gray-600 font-semibold text-sm">
          Step {currentStep + 1} of {totalSteps + 1}
        </div>
      </div>

      {/* Side Navigation Arrows */}
      {(currentStep > 0 || (currentStep === totalSteps && currentQuestion === 0 && !showAnswerResult && !quizCompleted)) && (
        <button
          onClick={handlePrev}
          className="fixed left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition flex items-center justify-center z-40"
          aria-label="Previous"
        >
          ←
        </button>
      )}
      {currentStep < totalSteps && (
        <button
          onClick={handleNext}
          className="fixed right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition flex items-center justify-center z-40"
          aria-label="Next"
        >
          →
        </button>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="w-full"
        >
          {currentStep === 0 && <IntroPage handleNext={handleNext} />}
          {currentStep === 1 && <CategoryPage {...needsData} categoryKey="50" currentStep={currentStep} totalSteps={totalSteps} handlePrev={handlePrev} handleNext={handleNext} navigate={navigate} />}
          {currentStep === 2 && <CategoryPage {...wantsData} categoryKey="30" currentStep={currentStep} totalSteps={totalSteps} handlePrev={handlePrev} handleNext={handleNext} navigate={navigate} />}
          {currentStep === 3 && <CategoryPage {...savingsData} categoryKey="20" currentStep={currentStep} totalSteps={totalSteps} handlePrev={handlePrev} handleNext={handleNext} navigate={navigate} />}
          {currentStep === 4 && <ComparisonPage currentStep={currentStep} totalSteps={totalSteps} handlePrev={handlePrev} handleNext={handleNext} navigate={navigate} />}
          {currentStep === 5 && <WaysToSavePage currentStep={currentStep} totalSteps={totalSteps} handlePrev={handlePrev} handleNext={handleNext} navigate={navigate} />}
          {currentStep === 6 && (
            <CalculatorPageComponent
              calculatorIncome={calculatorIncome}
              handleIncomeChange={handleIncomeChange}
              calculatorMethod={calculatorMethod}
              setCalculatorMethod={setCalculatorMethod}
              currentStep={currentStep}
              totalSteps={totalSteps}
              handlePrev={handlePrev}
              handleNext={handleNext}
              navigate={navigate}
            />
          )}
          {currentStep === 7 && (
            <QuizPage
              currentStep={currentStep}
              showAnswerResult={showAnswerResult}
              currentQuestion={currentQuestion}
              selectedAnswer={selectedAnswer}
              score={score}
              handleAnswerSelect={handleAnswerSelect}
              handleNextQuestion={handleNextQuestion}
              resetQuiz={resetQuiz}
              navigate={navigate}
              handlePrev={handlePrev}
              quizCompleted={quizCompleted}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default BudgetingBasics;
