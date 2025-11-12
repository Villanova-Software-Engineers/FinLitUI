// import React, { useRef, useEffect } from 'react';
// import * as ChartJS from 'chart.js';
// (removed lone useNavigate import; will import together with React below)

// // Register Chart.js components
// ChartJS.Chart.register(
//   ChartJS.ArcElement,
//   ChartJS.Tooltip,
//   ChartJS.Legend,
//   ChartJS.PieController
// );

// const categories = {
//   '50': {
//     title: 'Needs (50%)',
//     color: '#3b82f6',
//     route: 'needs',
//     items: [
//       { name: 'Housing', description: 'Rent or mortgage payments' },
//       { name: 'Utilities', description: 'Electricity, water, gas, internet' },
//       { name: 'Groceries', description: 'Essential food and household items' },
//       { name: 'Transportation', description: 'Car payment, gas, public transit' },
//       { name: 'Insurance', description: 'Health, auto, home insurance' },
//       { name: 'Minimum Debt Payments', description: 'Required loan/credit payments' },
//       { name: 'Healthcare', description: 'Medical expenses and prescriptions' }
//     ]
//   },
//   '30': {
//     title: 'Wants (30%)',
//     color: '#8b5cf6',
//     route: 'wants',
//     items: [
//       { name: 'Dining Out', description: 'Restaurants and takeout' },
//       { name: 'Entertainment', description: 'Movies, concerts, events' },
//       { name: 'Shopping', description: 'Non-essential clothing and items' },
//       { name: 'Subscriptions', description: 'Streaming services, gym memberships' },
//       { name: 'Hobbies', description: 'Sports, crafts, personal interests' },
//       { name: 'Travel', description: 'Vacations and leisure trips' },
//       { name: 'Luxury Items', description: 'Upgrades and treats' }
//     ]
//   },
//   '20': {
//     title: 'Savings & Debt (20%)',
//     color: '#10b981',
//     route: 'savings',
//     items: [
//       { name: 'Emergency Fund', description: '3-6 months of expenses' },
//       { name: 'Retirement', description: '401(k), IRA contributions' },
//       { name: 'Investments', description: 'Stocks, bonds, mutual funds' },
//       { name: 'Extra Debt Payments', description: 'Above minimum payments' },
//       { name: 'Savings Goals', description: 'Down payment, education fund' },
//       { name: 'HSA/FSA', description: 'Health savings accounts' }
//     ]
//   }
// };

// const categoryOrder = ['50', '30', '20'];

// const BudgetRuleChartStep = ({ activeCategoryKey }) => {
//   const chartRef = useRef(null);
//   const chartInstance = useRef(null);
//   const navigate = useNavigate();
//   const activeIndex = categoryOrder.indexOf(activeCategoryKey);
//   const activeCategory = categories[activeCategoryKey];

//   // Render chart highlighting active slice
//   useEffect(() => {
//     if (!chartRef.current) return;
//     const ctx = chartRef.current.getContext('2d');

//     if (chartInstance.current) {
//       chartInstance.current.destroy();
//       chartInstance.current = null;
//     }

//     chartInstance.current = new ChartJS.Chart(ctx, {
//       type: 'pie',
//       data: {
//         labels: ['Needs', 'Wants', 'Savings & Debt'],
//         datasets: [
//           {
//             data: [50, 30, 20],
//             backgroundColor: categoryOrder.map((key, idx) =>
//               idx === activeIndex ? categories[key].color : `${categories[key].color}55`
//             ),
//             borderWidth: 2,
//             borderColor: '#ffffff'
//           }
//         ]
//       },
//       options: {
//         responsive: true,
//         maintainAspectRatio: true,
//         plugins: {
//           legend: { position: 'bottom' },
//           tooltip: {
//             callbacks: { label: (ctx) => `${ctx.label}: ${ctx.parsed}%` }
//           }
//         }
//       }
//     });

//     return () => {
//       if (chartInstance.current) {
//         chartInstance.current.destroy();
//         chartInstance.current = null;
//       }
//     };
//   }, [activeIndex]);

//   const handlePrev = () => {
//     if (activeIndex > 0) {
//       const prevKey = categoryOrder[activeIndex - 1];
//       navigate(`/${categories[prevKey].route}`);
//     }
//   };

//   const handleNext = () => {
//     if (activeIndex < categoryOrder.length - 1) {
//       const nextKey = categoryOrder[activeIndex + 1];
//       navigate(`/${categories[nextKey].route}`);
//     } else {
//       // If it's the last category, go to calculator
//       navigate('/calculator');
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-green-50 p-8">
//       <div className="max-w-4xl mx-auto">
//         {/* Back to Home */}
//         <button
//           onClick={() => navigate('/')}
//           className="mb-6 text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-2"
//         >
//           ← Back to Overview
//         </button>

//         {/* Pie Chart */}
//         <div className="bg-white rounded-2xl shadow-xl p-8 mb-6 max-w-md mx-auto">
//           <canvas ref={chartRef}></canvas>
//         </div>

//         {/* Category Table */}
//         <div className="bg-white rounded-2xl shadow-xl p-8">
//           <h2 className="text-2xl font-bold mb-4 text-gray-800">{activeCategory.title}</h2>
//           <div className="overflow-x-auto">
//             <table className="w-full">
//               <thead>
//                 <tr className="border-b-2 border-gray-200">
//                   <th className="text-left py-3 px-4 text-gray-700 font-semibold">Category</th>
//                   <th className="text-left py-3 px-4 text-gray-700 font-semibold">Description</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {activeCategory.items.map((item, idx) => (
//                   <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
//                     <td className="py-4 px-4 font-medium text-gray-800">{item.name}</td>
//                     <td className="py-4 px-4 text-gray-600">{item.description}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>

//           {/* Navigation Buttons */}
//           <div className="flex justify-center gap-4 mt-6">
//             <button
//               onClick={handlePrev}
//               disabled={activeIndex === 0}
//               className={`px-6 py-3 rounded-lg font-semibold transition-all ${
//                 activeIndex === 0
//                   ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
//                   : 'bg-blue-300 hover:bg-blue-400 text-white'
//               }`}
//             >
//               ← Previous
//             </button>
//             <button
//               onClick={handleNext}
//               className="px-6 py-3 rounded-lg font-semibold transition-all bg-blue-500 text-white hover:bg-blue-600"
//             >
//               {activeIndex === categoryOrder.length - 1 ? 'Go to Calculator →' : 'Next →'}
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default BudgetRuleChartStep;
import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const categories = {
  '50': {
    title: 'Needs (50%)',
    color: '#10b981',
    route: 'needs',
    icon: '🏠',
    items: [
      { name: 'Housing', description: 'Rent or mortgage payments', icon: '🏡' },
      { name: 'Utilities', description: 'Electricity, water, gas, internet', icon: '💡' },
      { name: 'Groceries', description: 'Essential food and household items', icon: '🛒' },
      { name: 'Transportation', description: 'Car payment, gas, public transit', icon: '🚗' },
      { name: 'Insurance', description: 'Health, auto, home insurance', icon: '🛡️' },
      { name: 'Minimum Debt Payments', description: 'Required loan/credit payments', icon: '💳' },
      { name: 'Healthcare', description: 'Medical expenses and prescriptions', icon: '⚕️' }
    ]
  },
  '30': {
    title: 'Wants (30%)',
    color: '#3b82f6',
    route: 'wants',
    icon: '🎯',
    items: [
      { name: 'Dining Out', description: 'Restaurants and takeout', icon: '🍽️' },
      { name: 'Entertainment', description: 'Movies, concerts, events', icon: '🎬' },
      { name: 'Shopping', description: 'Non-essential clothing and items', icon: '🛍️' },
      { name: 'Subscriptions', description: 'Streaming services, gym memberships', icon: '📺' },
      { name: 'Hobbies', description: 'Sports, crafts, personal interests', icon: '🎨' },
      { name: 'Travel', description: 'Vacations and leisure trips', icon: '✈️' },
      { name: 'Luxury Items', description: 'Upgrades and treats', icon: '💎' }
    ]
  },
  '20': {
    title: 'Savings & Debt (20%)',
    color: '#8b5cf6',
    route: 'savings',
    icon: '💰',
    items: [
      { name: 'Emergency Fund', description: '3-6 months of expenses', icon: '🆘' },
      { name: 'Retirement', description: '401(k), IRA contributions', icon: '🏖️' },
      { name: 'Investments', description: 'Stocks, bonds, mutual funds', icon: '📈' },
      { name: 'Extra Debt Payments', description: 'Above minimum payments', icon: '💸' },
      { name: 'Savings Goals', description: 'Down payment, education fund', icon: '🎯' },
      { name: 'HSA/FSA', description: 'Health savings accounts', icon: '🏥' }
    ]
  }
};

const categoryOrder = ['50', '30', '20'];

const BudgetRuleChartStep = ({ activeCategoryKey = '50' }) => {
  const [selectedItem, setSelectedItem] = useState(null);
  const navigate = useNavigate();
  const activeIndex = categoryOrder.indexOf(activeCategoryKey);
  const activeCategory = categories[activeCategoryKey];

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

  const handlePrev = () => {
    if (activeIndex > 0) {
      const prevKey = categoryOrder[activeIndex - 1];
      navigate(`/${categories[prevKey].route}`);
    }
  };

  const handleNext = () => {
    if (activeIndex < categoryOrder.length - 1) {
      const nextKey = categoryOrder[activeIndex + 1];
      navigate(`/${categories[nextKey].route}`);
    } else {
      navigate('/calculator');
    }
  };

  // Simple pie chart using CSS
  const PieChart = () => {
    const segments = [
      { percent: 50, color: categories['50'].color, label: 'Needs' },
      { percent: 30, color: categories['30'].color, label: 'Wants' },
      { percent: 20, color: categories['20'].color, label: 'Savings' }
    ];

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
              <motion.path
                key={idx}
                d={`M 50 50 L ${x1} ${y1} A 50 50 0 ${largeArc} 1 ${x2} ${y2} Z`}
                fill={categoryOrder[idx] === activeCategoryKey ? seg.color : `${seg.color}88`}
                stroke="#ffffff"
                strokeWidth="2"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
              />
            );
          })}
        </svg>
        
        {/* Center circle */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div 
            className="w-24 h-24 bg-white rounded-full shadow-lg flex items-center justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <span className="text-4xl">{activeCategory.icon}</span>
          </motion.div>
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
        <div className="flex items-center">
          <motion.button
            className="px-4 py-2 rounded-lg text-blue-600 hover:bg-blue-50 font-medium transition"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/')}
          >
            ← Back to Overview
          </motion.button>
        </div>
        
        {/* Progress indicator */}
        <motion.div 
          className="bg-white px-4 py-2 rounded-xl shadow-lg"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex items-center gap-2">
            <span className="text-blue-500 text-xl">{activeCategory.icon}</span>
            <div className="text-xs font-semibold text-gray-600">
              Step {activeIndex + 1} of {categoryOrder.length}
            </div>
          </div>
        </motion.div>
      </motion.div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Title */}
        <motion.h2 
          className="text-3xl font-bold mb-8 text-center text-gray-800"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {activeCategory.title}
        </motion.h2>

        {/* Pie Chart */}
        <motion.div
          className="rounded-2xl shadow-lg p-8 mb-8 max-w-md mx-auto"
          style={{ background: 'rgba(255, 255, 255, 0.9)' }}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <PieChart />
          
          {/* Legend */}
          <div className="flex justify-center gap-4 mt-6 flex-wrap">
            {categoryOrder.map((key, idx) => (
              <motion.div
                key={key}
                className="flex items-center gap-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.6 + idx * 0.1 }}
              >
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: categories[key].color }}
                />
                <span className="text-sm text-gray-700">{categories[key].title}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Category Items Grid */}
        <motion.div
          className="grid gap-4 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          {activeCategory.items.map((item, idx) => (
            <motion.div
              key={idx}
              className="rounded-2xl shadow-lg p-5 cursor-pointer overflow-hidden"
              style={{ 
                background: 'rgba(255, 255, 255, 0.9)',
                borderLeft: `4px solid ${activeCategory.color}`
              }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.8 + idx * 0.05 }}
              whileHover={{ scale: 1.02, x: 5 }}
              onClick={() => setSelectedItem(selectedItem === idx ? null : idx)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div 
                    className="p-3 rounded-full"
                    style={{ backgroundColor: `${activeCategory.color}22` }}
                  >
                    <span className="text-2xl">{item.icon}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-800">{item.name}</h3>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </div>
                </div>
                <motion.div
                  animate={{ rotate: selectedItem === idx ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-gray-400"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </motion.div>
              </div>
              
              <AnimatePresence>
                {selectedItem === idx && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-4 mt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-600 mb-3">
                        This is a {activeCategory.title.toLowerCase()} item that should be included in your budget planning.
                      </p>
                      <div className="flex gap-2">
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                          Priority
                        </span>
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                          {activeCategory.title.split(' ')[0]}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>

        {/* Navigation Buttons */}
        <motion.div 
          className="flex flex-col sm:flex-row justify-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1 }}
        >
          <motion.button
            onClick={handlePrev}
            disabled={activeIndex === 0}
            className={`px-6 py-3 rounded-2xl font-medium shadow-lg transition ${
              activeIndex === 0
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'border-2 border-blue-400 bg-white text-blue-600 hover:bg-blue-50'
            }`}
            whileHover={activeIndex !== 0 ? { scale: 1.05, y: -2 } : {}}
            whileTap={activeIndex !== 0 ? { scale: 0.95 } : {}}
          >
            ← Previous
          </motion.button>
          <motion.button
            onClick={handleNext}
            className="px-6 py-3 rounded-2xl bg-blue-500 text-white hover:bg-blue-600 transition font-medium shadow-lg"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            {activeIndex === categoryOrder.length - 1 ? 'Go to Calculator →' : 'Next →'}
          </motion.button>
        </motion.div>
      </div>

      <div className="h-32"></div>
    </div>
  );
};

export default BudgetRuleChartStep;