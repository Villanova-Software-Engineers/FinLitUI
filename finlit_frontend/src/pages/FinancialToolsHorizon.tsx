import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Calculator,
  PiggyBank,
  TrendingUp,
  CreditCard,
  Wallet,
  Shield,
  TrendingDown,
  DollarSign,
  Sparkles,
  ChevronRight
} from 'lucide-react';

const FinancialToolsHorizon = () => {
  const navigate = useNavigate();

  const calculators = [
    {
      id: 'budget',
      title: 'Budget Planner',
      subtitle: 'Track & Plan Your Money',
      icon: Calculator,
      bgGradient: 'from-blue-500 to-indigo-500',
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600',
      categoryBg: 'bg-blue-50',
      categoryText: 'text-blue-700',
      category: 'Planning'
    },
    {
      id: 'savings',
      title: 'Savings Goals',
      subtitle: 'Build Your Wealth',
      icon: PiggyBank,
      bgGradient: 'from-emerald-500 to-teal-500',
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      categoryBg: 'bg-emerald-50',
      categoryText: 'text-emerald-700',
      category: 'Savings'
    },
    {
      id: 'compound',
      title: 'Compound Interest',
      subtitle: 'Investment Growth Calculator',
      icon: TrendingUp,
      bgGradient: 'from-violet-500 to-purple-500',
      iconBg: 'bg-violet-50',
      iconColor: 'text-violet-600',
      categoryBg: 'bg-violet-50',
      categoryText: 'text-violet-700',
      category: 'Investment'
    },
    {
      id: 'loan',
      title: 'Loan Calculator',
      subtitle: 'Manage Your Borrowing',
      icon: CreditCard,
      bgGradient: 'from-orange-500 to-amber-500',
      iconBg: 'bg-orange-50',
      iconColor: 'text-orange-600',
      categoryBg: 'bg-orange-50',
      categoryText: 'text-orange-700',
      category: 'Borrowing'
    },
    {
      id: 'networth',
      title: 'Net Worth Tracker',
      subtitle: 'Track Your Total Wealth',
      icon: Wallet,
      bgGradient: 'from-cyan-500 to-blue-500',
      iconBg: 'bg-cyan-50',
      iconColor: 'text-cyan-600',
      categoryBg: 'bg-cyan-50',
      categoryText: 'text-cyan-700',
      category: 'Tracking'
    },
    {
      id: 'debt-payoff',
      title: 'Debt Payoff Planner',
      subtitle: 'Become Debt-Free',
      icon: TrendingDown,
      bgGradient: 'from-rose-500 to-pink-500',
      iconBg: 'bg-rose-50',
      iconColor: 'text-rose-600',
      categoryBg: 'bg-rose-50',
      categoryText: 'text-rose-700',
      category: 'Debt'
    },
    {
      id: 'emergency-fund',
      title: 'Emergency Fund',
      subtitle: 'Build Your Safety Net',
      icon: Shield,
      bgGradient: 'from-green-500 to-emerald-500',
      iconBg: 'bg-green-50',
      iconColor: 'text-green-600',
      categoryBg: 'bg-green-50',
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
      className="bg-white rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer border border-gray-100"
    >
      {/* Icon and Menu */}
      <div className="flex items-start justify-between mb-4">
        <div className={`w-14 h-14 ${tool.iconBg} rounded-2xl flex items-center justify-center shadow-sm`}>
          <tool.icon className={`w-7 h-7 ${tool.iconColor}`} strokeWidth={2} />
        </div>
        <div className="flex gap-1">
          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
        </div>
      </div>

      {/* Visual Area */}
      <div className={`w-full h-40 bg-gradient-to-br ${tool.bgGradient} rounded-2xl mb-4 relative overflow-hidden`}>
        <div className="absolute inset-0 bg-white/10 backdrop-blur-sm flex items-center justify-center">
          {/* Decorative elements - Money visualization */}
          <div className="absolute inset-0 flex items-center justify-center">
            <tool.icon className="w-20 h-20 text-white/20" strokeWidth={1.5} />
          </div>
          {/* Floating dollar signs or coins */}
          <div className="absolute top-4 left-4">
            <DollarSign className="w-8 h-8 text-white/30" />
          </div>
          <div className="absolute bottom-4 right-4">
            <DollarSign className="w-6 h-6 text-white/20" />
          </div>
          <div className="absolute top-1/2 right-8">
            <DollarSign className="w-5 h-5 text-white/25" />
          </div>
        </div>
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
