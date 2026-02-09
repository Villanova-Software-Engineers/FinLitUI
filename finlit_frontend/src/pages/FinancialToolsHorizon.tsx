import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Calculator,
  DollarSign,
  ChevronRight,
  Sparkles
} from 'lucide-react';

const FinancialToolsHorizon = () => {
  const navigate = useNavigate();

  const calculators = [
    {
      id: 'budget',
      title: 'Budget Planner',
      subtitle: 'Track & Plan Your Money',
      iconImage: 'https://cdn-icons-png.flaticon.com/512/2830/2830284.png',
      cardBg: 'bg-gradient-to-br from-blue-50 to-indigo-100',
      visualBg: 'bg-gradient-to-br from-blue-100/60 to-indigo-200/60',
      categoryBg: 'bg-blue-100',
      categoryText: 'text-blue-700',
      category: 'Planning'
    },
    {
      id: 'savings',
      title: 'Savings Goals',
      subtitle: 'Build Your Wealth',
      iconImage: 'https://cdn-icons-png.flaticon.com/512/2529/2529395.png',
      cardBg: 'bg-gradient-to-br from-emerald-50 to-teal-100',
      visualBg: 'bg-gradient-to-br from-emerald-100/60 to-teal-200/60',
      categoryBg: 'bg-emerald-100',
      categoryText: 'text-emerald-700',
      category: 'Savings'
    },
    {
      id: 'compound',
      title: 'Compound Interest',
      subtitle: 'Investment Growth Calculator',
      iconImage: 'https://cdn-icons-png.flaticon.com/512/2936/2936690.png',
      cardBg: 'bg-gradient-to-br from-violet-50 to-purple-100',
      visualBg: 'bg-gradient-to-br from-violet-100/60 to-purple-200/60',
      categoryBg: 'bg-violet-100',
      categoryText: 'text-violet-700',
      category: 'Investment'
    },
    {
      id: 'loan',
      title: 'Loan Calculator',
      subtitle: 'Manage Your Borrowing',
      iconImage: 'https://cdn-icons-png.flaticon.com/512/2830/2830305.png',
      cardBg: 'bg-gradient-to-br from-amber-50 to-orange-100',
      visualBg: 'bg-gradient-to-br from-amber-100/60 to-orange-200/60',
      categoryBg: 'bg-orange-100',
      categoryText: 'text-orange-700',
      category: 'Borrowing'
    },
    {
      id: 'networth',
      title: 'Net Worth Tracker',
      subtitle: 'Track Your Total Wealth',
      iconImage: 'https://cdn-icons-png.flaticon.com/512/3135/3135706.png',
      cardBg: 'bg-gradient-to-br from-cyan-50 to-sky-100',
      visualBg: 'bg-gradient-to-br from-cyan-100/60 to-sky-200/60',
      categoryBg: 'bg-cyan-100',
      categoryText: 'text-cyan-700',
      category: 'Tracking'
    },
    {
      id: 'debt-payoff',
      title: 'Debt Payoff Planner',
      subtitle: 'Become Debt-Free',
      iconImage: 'https://cdn-icons-png.flaticon.com/512/2920/2920276.png',
      cardBg: 'bg-gradient-to-br from-rose-50 to-pink-100',
      visualBg: 'bg-gradient-to-br from-rose-100/60 to-pink-200/60',
      categoryBg: 'bg-rose-100',
      categoryText: 'text-rose-700',
      category: 'Debt'
    },
    {
      id: 'emergency-fund',
      title: 'Emergency Fund',
      subtitle: 'Build Your Safety Net',
      iconImage: 'https://cdn-icons-png.flaticon.com/512/2830/2830312.png',
      cardBg: 'bg-gradient-to-br from-lime-50 to-green-100',
      visualBg: 'bg-gradient-to-br from-lime-100/60 to-green-200/60',
      categoryBg: 'bg-green-100',
      categoryText: 'text-green-700',
      category: 'Protection'
    }
  ];

  const handleToolClick = (tool: any) => {
    navigate(`/financial-tools-original?tool=${tool.id}`);
  };

  const renderCard = (tool: any, index: number) => (
    <motion.div
      key={tool.id}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -8 }}
      onClick={() => handleToolClick(tool)}
      className={`${tool.cardBg} rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer border border-white/50`}
    >
      {/* Visual Area with Main Image */}
      <div className={`w-full h-44 ${tool.visualBg} rounded-2xl mb-4 relative overflow-hidden flex items-center justify-center backdrop-blur-sm`}>
        <img src={tool.iconImage} alt={tool.title} className="w-28 h-28 object-contain drop-shadow-lg hover:scale-110 transition-transform duration-300" />
      </div>

      {/* Title */}
      <h3 className="text-lg font-bold text-gray-900 mb-1" style={{ fontFamily: '"Playfair Display", "Georgia", serif' }}>{tool.title}</h3>
      <p className="text-sm text-gray-500 font-medium mb-4" style={{ fontFamily: '"Inter", sans-serif' }}>{tool.subtitle}</p>

      {/* Bottom Section */}
      <div className="flex items-center justify-between">
        <span className={`px-3 py-1 ${tool.categoryBg} ${tool.categoryText} text-xs font-semibold rounded-full`}>
          {tool.category}
        </span>
        <ChevronRight className="w-5 h-5 text-gray-400" />
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 pt-24 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors mb-6"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Back to Dashboard</span>
          </button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-5xl font-bold bg-gradient-to-r from-slate-900 via-blue-700 to-indigo-700 bg-clip-text text-transparent mb-4" style={{ fontFamily: '"Playfair Display", "Georgia", serif' }}>
              Financial Toolkit
            </h1>
            <p className="text-gray-600 text-lg" style={{ fontFamily: '"Inter", sans-serif' }}>
              Powerful calculators to master your finances
            </p>
          </motion.div>
        </div>

        {/* Calculators Section */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Calculator className="w-6 h-6 text-blue-600" strokeWidth={2} />
            <h2 className="text-2xl font-bold text-gray-900" style={{ fontFamily: '"Playfair Display", "Georgia", serif' }}>Financial Calculators</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {calculators.map((tool, index) => renderCard(tool, index))}
          </div>
        </div>

        {/* Pro Tip Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 text-white shadow-xl"
        >
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
              <Sparkles className="w-7 h-7" strokeWidth={2} />
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-2" style={{ fontFamily: '"Playfair Display", "Georgia", serif' }}>Pro Tip</h3>
              <p className="text-white/90 text-lg" style={{ fontFamily: '"Inter", sans-serif' }}>
                Use these tools regularly to track your financial progress. Small, consistent actions lead to big results over time. Start with the Budget Planner to get a clear picture of your finances!
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default FinancialToolsHorizon;
