import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Calculator,
  PiggyBank,
  TrendingUp,
  Wallet,
  DollarSign,
  Target,
  CreditCard,
  BarChart3,
  Percent,
  Calendar,
  ChevronRight,
  Home,
  X,
  Sparkles,
  ArrowUpRight,
  Check
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Tool Types
type ToolId = 'budget' | 'savings' | 'loan' | 'networth' | 'compound' | 'debt-payoff';

interface Tool {
  id: ToolId;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  iconBg: string;
  hoverBorder: string;
}

const FINANCIAL_TOOLS: Tool[] = [
  {
    id: 'budget',
    title: 'Budget Planner',
    subtitle: '50/30/20 Rule',
    description: 'Smart allocation for needs, wants, and savings',
    icon: <Calculator className="w-6 h-6" />,
    gradient: 'from-blue-100 via-indigo-50 to-blue-50',
    iconBg: 'bg-gradient-to-br from-blue-500 to-indigo-600',
    hoverBorder: 'hover:border-blue-400'
  },
  {
    id: 'savings',
    title: 'Savings Goals',
    subtitle: 'Goal Tracker',
    description: 'Track progress toward your financial goals',
    icon: <PiggyBank className="w-6 h-6" />,
    gradient: 'from-emerald-100 via-teal-50 to-emerald-50',
    iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-600',
    hoverBorder: 'hover:border-emerald-400'
  },
  {
    id: 'loan',
    title: 'Loan Calculator',
    subtitle: 'Payment Estimator',
    description: 'Calculate payments and total interest',
    icon: <CreditCard className="w-6 h-6" />,
    gradient: 'from-violet-100 via-purple-50 to-violet-50',
    iconBg: 'bg-gradient-to-br from-violet-500 to-purple-600',
    hoverBorder: 'hover:border-violet-400'
  },
  {
    id: 'networth',
    title: 'Net Worth',
    subtitle: 'Financial Snapshot',
    description: 'Track assets minus liabilities',
    icon: <BarChart3 className="w-6 h-6" />,
    gradient: 'from-amber-100 via-orange-50 to-amber-50',
    iconBg: 'bg-gradient-to-br from-amber-500 to-orange-600',
    hoverBorder: 'hover:border-amber-400'
  },
  {
    id: 'compound',
    title: 'Compound Interest',
    subtitle: 'Growth Calculator',
    description: 'See how investments grow over time',
    icon: <TrendingUp className="w-6 h-6" />,
    gradient: 'from-cyan-100 via-teal-50 to-cyan-50',
    iconBg: 'bg-gradient-to-br from-teal-500 to-cyan-600',
    hoverBorder: 'hover:border-teal-400'
  },
  {
    id: 'debt-payoff',
    title: 'Debt Payoff',
    subtitle: 'Freedom Planner',
    description: 'Plan your journey to debt freedom',
    icon: <Target className="w-6 h-6" />,
    gradient: 'from-rose-100 via-pink-50 to-rose-50',
    iconBg: 'bg-gradient-to-br from-rose-500 to-pink-600',
    hoverBorder: 'hover:border-rose-400'
  }
];

// Shared Input Component
const InputField: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  prefix?: React.ReactNode;
  suffix?: string;
  type?: string;
}> = ({ label, value, onChange, placeholder, prefix, suffix, type = 'number' }) => (
  <div className="space-y-2">
    <label className="block text-sm font-semibold text-gray-600">{label}</label>
    <div className="relative">
      {prefix && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
          {prefix}
        </div>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full ${prefix ? 'pl-11' : 'pl-4'} ${suffix ? 'pr-12' : 'pr-4'} py-3.5 bg-slate-50/80 border border-gray-200/80 rounded-xl text-gray-800 placeholder-gray-400 focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-100/50 transition-all duration-200 outline-none`}
      />
      {suffix && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">
          {suffix}
        </div>
      )}
    </div>
  </div>
);

// Result Card Component
const ResultCard: React.FC<{
  label: string;
  value: string;
  subValue?: string;
  icon?: React.ReactNode;
  color?: string;
  large?: boolean;
}> = ({ label, value, subValue, icon, color = 'text-gray-800', large }) => (
  <div className={`bg-white/80 backdrop-blur-sm rounded-2xl p-5 border border-gray-200/60 shadow-sm hover:shadow-md transition-shadow ${large ? 'col-span-full' : ''}`}>
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-gray-500 mb-1">{label}</p>
        <p className={`${large ? 'text-3xl' : 'text-2xl'} font-bold ${color}`}>{value}</p>
        {subValue && <p className="text-sm text-gray-400 mt-1">{subValue}</p>}
      </div>
      {icon && (
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
          {icon}
        </div>
      )}
    </div>
  </div>
);

// Progress Bar Component
const ProgressBar: React.FC<{
  progress: number;
  color: string;
  showLabel?: boolean;
  height?: string;
}> = ({ progress, color, showLabel = true, height = 'h-3' }) => (
  <div className="space-y-2">
    <div className={`w-full bg-gray-100 rounded-full ${height} overflow-hidden`}>
      <motion.div
        className={`${color} ${height} rounded-full`}
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(progress, 100)}%` }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      />
    </div>
    {showLabel && (
      <div className="flex justify-between text-sm text-gray-500">
        <span>{progress.toFixed(0)}% complete</span>
      </div>
    )}
  </div>
);

// Back Button Component
const BackButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <motion.button
    onClick={onClick}
    className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors mb-6"
    whileHover={{ x: -4 }}
  >
    <ArrowLeft className="w-5 h-5" />
    <span className="font-medium">Back to Tools</span>
  </motion.button>
);

// Tool Header Component
const ToolHeader: React.FC<{
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
}> = ({ title, subtitle, icon, color }) => (
  <div className="flex items-center gap-4 mb-8 p-4 bg-white/50 backdrop-blur-sm rounded-2xl border border-gray-200/40">
    <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center text-white shadow-lg`}>
      {icon}
    </div>
    <div>
      <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
      <p className="text-gray-500">{subtitle}</p>
    </div>
  </div>
);

// Budget Calculator Component
const BudgetCalculator: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [income, setIncome] = useState('');

  const monthlyIncome = parseFloat(income) || 0;
  const needs = monthlyIncome * 0.5;
  const wants = monthlyIncome * 0.3;
  const savings = monthlyIncome * 0.2;

  const categories = [
    { name: 'Needs', amount: needs, percent: 50, color: 'bg-blue-500', textColor: 'text-blue-600', bgColor: 'bg-blue-50', description: 'Housing, utilities, groceries, insurance' },
    { name: 'Wants', amount: wants, percent: 30, color: 'bg-violet-500', textColor: 'text-violet-600', bgColor: 'bg-violet-50', description: 'Entertainment, dining out, hobbies' },
    { name: 'Savings', amount: savings, percent: 20, color: 'bg-emerald-500', textColor: 'text-emerald-600', bgColor: 'bg-emerald-50', description: 'Emergency fund, retirement, investments' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <BackButton onClick={onBack} />
      <ToolHeader
        title="Budget Planner"
        subtitle="50/30/20 Rule Calculator"
        icon={<Calculator className="w-7 h-7" />}
        color="bg-blue-500"
      />

      <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/60 shadow-sm mb-6">
        <InputField
          label="Monthly After-Tax Income"
          value={income}
          onChange={setIncome}
          placeholder="5,000"
          prefix={<DollarSign className="w-5 h-5" />}
        />
      </div>

      <AnimatePresence>
        {monthlyIncome > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {categories.map((cat, idx) => (
              <motion.div
                key={cat.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`${cat.bgColor} rounded-2xl p-5 border border-gray-100`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 ${cat.color} rounded-xl flex items-center justify-center text-white font-bold`}>
                      {cat.percent}%
                    </div>
                    <div>
                      <h3 className={`font-semibold ${cat.textColor}`}>{cat.name}</h3>
                      <p className="text-sm text-gray-500">{cat.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-2xl font-bold ${cat.textColor}`}>
                      ${cat.amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </p>
                    <p className="text-sm text-gray-400">/month</p>
                  </div>
                </div>
                <div className="w-full bg-white/60 rounded-full h-2">
                  <motion.div
                    className={`${cat.color} h-2 rounded-full`}
                    initial={{ width: 0 }}
                    animate={{ width: `${cat.percent}%` }}
                    transition={{ duration: 0.6, delay: idx * 0.1 }}
                  />
                </div>
              </motion.div>
            ))}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-2 gap-4 mt-6"
            >
              <ResultCard
                label="Annual Savings"
                value={`$${(savings * 12).toLocaleString()}`}
                icon={<PiggyBank className="w-5 h-5 text-emerald-500" />}
                color="text-emerald-600"
              />
              <ResultCard
                label="Weekly Spending"
                value={`$${Math.round(wants / 4).toLocaleString()}`}
                icon={<Wallet className="w-5 h-5 text-violet-500" />}
                color="text-violet-600"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Savings Planner Component
const SavingsPlanner: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [goalName, setGoalName] = useState('');
  const [goalAmount, setGoalAmount] = useState('');
  const [currentSavings, setCurrentSavings] = useState('');
  const [monthlyContribution, setMonthlyContribution] = useState('');

  const goal = parseFloat(goalAmount) || 0;
  const current = parseFloat(currentSavings) || 0;
  const monthly = parseFloat(monthlyContribution) || 0;
  const remaining = Math.max(0, goal - current);
  const monthsToGoal = monthly > 0 ? Math.ceil(remaining / monthly) : 0;
  const progress = goal > 0 ? Math.min(100, (current / goal) * 100) : 0;

  const targetDate = monthsToGoal > 0
    ? new Date(Date.now() + monthsToGoal * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'Set your goal';

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <BackButton onClick={onBack} />
      <ToolHeader
        title="Savings Goals"
        subtitle="Track your progress"
        icon={<PiggyBank className="w-7 h-7" />}
        color="bg-emerald-500"
      />

      <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/60 shadow-sm mb-6 space-y-5">
        <InputField
          label="What are you saving for?"
          value={goalName}
          onChange={setGoalName}
          placeholder="Emergency Fund, Vacation, New Car..."
          type="text"
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <InputField
            label="Goal Amount"
            value={goalAmount}
            onChange={setGoalAmount}
            placeholder="10,000"
            prefix={<DollarSign className="w-5 h-5" />}
          />
          <InputField
            label="Current Savings"
            value={currentSavings}
            onChange={setCurrentSavings}
            placeholder="2,000"
            prefix={<DollarSign className="w-5 h-5" />}
          />
          <InputField
            label="Monthly Savings"
            value={monthlyContribution}
            onChange={setMonthlyContribution}
            placeholder="500"
            prefix={<DollarSign className="w-5 h-5" />}
          />
        </div>
      </div>

      <AnimatePresence>
        {goal > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-emerald-100 text-sm mb-1">Your Goal</p>
                  <h3 className="text-xl font-bold">{goalName || 'Savings Goal'}</h3>
                </div>
                <div className="text-right">
                  <p className="text-emerald-100 text-sm mb-1">Progress</p>
                  <p className="text-2xl font-bold">{progress.toFixed(0)}%</p>
                </div>
              </div>
              <div className="w-full bg-white/20 rounded-full h-3 mb-4">
                <motion.div
                  className="bg-white h-3 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.8 }}
                />
              </div>
              <div className="flex justify-between text-sm">
                <span>${current.toLocaleString()} saved</span>
                <span>${goal.toLocaleString()} goal</span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <ResultCard
                label="Months to Goal"
                value={monthsToGoal.toString()}
                icon={<Calendar className="w-5 h-5 text-blue-500" />}
              />
              <ResultCard
                label="Remaining"
                value={`$${remaining.toLocaleString()}`}
                icon={<Target className="w-5 h-5 text-amber-500" />}
              />
              <ResultCard
                label="Yearly Savings"
                value={`$${(monthly * 12).toLocaleString()}`}
                icon={<TrendingUp className="w-5 h-5 text-emerald-500" />}
              />
              <ResultCard
                label="Target Date"
                value={targetDate}
                icon={<Sparkles className="w-5 h-5 text-violet-500" />}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Loan Calculator Component
const LoanCalculator: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [loanAmount, setLoanAmount] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [loanTerm, setLoanTerm] = useState('');

  const principal = parseFloat(loanAmount) || 0;
  const rate = (parseFloat(interestRate) || 0) / 100 / 12;
  const months = (parseFloat(loanTerm) || 0) * 12;

  const monthlyPayment = rate > 0 && months > 0
    ? (principal * rate * Math.pow(1 + rate, months)) / (Math.pow(1 + rate, months) - 1)
    : principal / Math.max(months, 1);

  const totalPayment = monthlyPayment * months;
  const totalInterest = totalPayment - principal;
  const principalPercent = totalPayment > 0 ? (principal / totalPayment) * 100 : 0;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <BackButton onClick={onBack} />
      <ToolHeader
        title="Loan Calculator"
        subtitle="Payment estimator"
        icon={<CreditCard className="w-7 h-7" />}
        color="bg-violet-500"
      />

      <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/60 shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <InputField
            label="Loan Amount"
            value={loanAmount}
            onChange={setLoanAmount}
            placeholder="25,000"
            prefix={<DollarSign className="w-5 h-5" />}
          />
          <InputField
            label="Interest Rate"
            value={interestRate}
            onChange={setInterestRate}
            placeholder="5.5"
            suffix="%"
          />
          <InputField
            label="Loan Term"
            value={loanTerm}
            onChange={setLoanTerm}
            placeholder="5"
            suffix="years"
          />
        </div>
      </div>

      <AnimatePresence>
        {principal > 0 && months > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl p-6 text-white text-center">
              <p className="text-violet-100 mb-2">Monthly Payment</p>
              <motion.p
                className="text-4xl font-bold"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
              >
                ${monthlyPayment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </motion.p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <ResultCard
                label="Principal"
                value={`$${principal.toLocaleString()}`}
                color="text-blue-600"
              />
              <ResultCard
                label="Total Interest"
                value={`$${totalInterest.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                color="text-rose-600"
              />
              <ResultCard
                label="Total Payment"
                value={`$${totalPayment.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                color="text-gray-800"
              />
            </div>

            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-gray-200/60 shadow-sm">
              <p className="text-sm font-medium text-gray-600 mb-4">Payment Breakdown</p>
              <div className="flex h-4 rounded-full overflow-hidden mb-3">
                <motion.div
                  className="bg-blue-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${principalPercent}%` }}
                  transition={{ duration: 0.8 }}
                />
                <motion.div
                  className="bg-rose-400"
                  initial={{ width: 0 }}
                  animate={{ width: `${100 - principalPercent}%` }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                />
              </div>
              <div className="flex justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full" />
                  <span className="text-gray-600">Principal ({principalPercent.toFixed(0)}%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-rose-400 rounded-full" />
                  <span className="text-gray-600">Interest ({(100 - principalPercent).toFixed(0)}%)</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Net Worth Calculator Component
const NetWorthCalculator: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [assets, setAssets] = useState({
    cash: '', investments: '', retirement: '', realEstate: '', vehicles: '', other: ''
  });
  const [liabilities, setLiabilities] = useState({
    mortgage: '', carLoans: '', studentLoans: '', creditCards: '', other: ''
  });

  const totalAssets = Object.values(assets).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
  const totalLiabilities = Object.values(liabilities).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
  const netWorth = totalAssets - totalLiabilities;

  const assetFields = [
    { key: 'cash', label: 'Cash & Savings' },
    { key: 'investments', label: 'Investments' },
    { key: 'retirement', label: 'Retirement' },
    { key: 'realEstate', label: 'Real Estate' },
    { key: 'vehicles', label: 'Vehicles' },
    { key: 'other', label: 'Other' }
  ];

  const liabilityFields = [
    { key: 'mortgage', label: 'Mortgage' },
    { key: 'carLoans', label: 'Car Loans' },
    { key: 'studentLoans', label: 'Student Loans' },
    { key: 'creditCards', label: 'Credit Cards' },
    { key: 'other', label: 'Other' }
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <BackButton onClick={onBack} />
      <ToolHeader
        title="Net Worth"
        subtitle="Your financial snapshot"
        icon={<BarChart3 className="w-7 h-7" />}
        color="bg-amber-500"
      />

      <motion.div
        className={`rounded-2xl p-6 text-white text-center mb-6 ${netWorth >= 0 ? 'bg-gradient-to-br from-emerald-500 to-teal-600' : 'bg-gradient-to-br from-rose-500 to-red-600'}`}
        key={netWorth >= 0 ? 'positive' : 'negative'}
      >
        <p className="text-white/80 mb-1">Net Worth</p>
        <motion.p
          className="text-4xl font-bold"
          key={netWorth}
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
        >
          {netWorth >= 0 ? '' : '-'}${Math.abs(netWorth).toLocaleString()}
        </motion.p>
        <p className="text-sm text-white/70 mt-2">
          {netWorth >= 0 ? 'Great job building wealth!' : 'Focus on reducing liabilities'}
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-100">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            <h3 className="font-semibold text-emerald-800">Assets</h3>
          </div>
          <div className="space-y-3">
            {assetFields.map(field => (
              <div key={field.key} className="flex items-center gap-3">
                <span className="text-sm text-gray-600 w-24">{field.label}</span>
                <div className="relative flex-1">
                  <DollarSign className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="number"
                    value={assets[field.key as keyof typeof assets]}
                    onChange={(e) => setAssets({ ...assets, [field.key]: e.target.value })}
                    placeholder="0"
                    className="w-full pl-8 pr-3 py-2.5 bg-white border border-emerald-200 rounded-xl text-sm focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-emerald-200 flex justify-between">
            <span className="font-medium text-emerald-700">Total Assets</span>
            <span className="font-bold text-emerald-600">${totalAssets.toLocaleString()}</span>
          </div>
        </div>

        <div className="bg-rose-50 rounded-2xl p-5 border border-rose-100">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="w-5 h-5 text-rose-600" />
            <h3 className="font-semibold text-rose-800">Liabilities</h3>
          </div>
          <div className="space-y-3">
            {liabilityFields.map(field => (
              <div key={field.key} className="flex items-center gap-3">
                <span className="text-sm text-gray-600 w-24">{field.label}</span>
                <div className="relative flex-1">
                  <DollarSign className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="number"
                    value={liabilities[field.key as keyof typeof liabilities]}
                    onChange={(e) => setLiabilities({ ...liabilities, [field.key]: e.target.value })}
                    placeholder="0"
                    className="w-full pl-8 pr-3 py-2.5 bg-white border border-rose-200 rounded-xl text-sm focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-none transition-all"
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-rose-200 flex justify-between">
            <span className="font-medium text-rose-700">Total Liabilities</span>
            <span className="font-bold text-rose-600">${totalLiabilities.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Compound Interest Calculator Component
const CompoundInterestCalculator: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [principal, setPrincipal] = useState('');
  const [monthlyContribution, setMonthlyContribution] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [years, setYears] = useState('');

  const p = parseFloat(principal) || 0;
  const pmt = parseFloat(monthlyContribution) || 0;
  const r = (parseFloat(interestRate) || 0) / 100 / 12;
  const n = (parseFloat(years) || 0) * 12;

  let futureValue = 0;
  if (r > 0 && n > 0) {
    const fvPrincipal = p * Math.pow(1 + r, n);
    const fvContributions = pmt * ((Math.pow(1 + r, n) - 1) / r);
    futureValue = fvPrincipal + fvContributions;
  } else if (n > 0) {
    futureValue = p + (pmt * n);
  }

  const totalContributed = p + (pmt * n);
  const totalInterest = futureValue - totalContributed;
  const growthPercent = totalContributed > 0 ? ((futureValue / totalContributed) - 1) * 100 : 0;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <BackButton onClick={onBack} />
      <ToolHeader
        title="Compound Interest"
        subtitle="Watch your money grow"
        icon={<TrendingUp className="w-7 h-7" />}
        color="bg-teal-500"
      />

      <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/60 shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="Initial Investment"
            value={principal}
            onChange={setPrincipal}
            placeholder="10,000"
            prefix={<DollarSign className="w-5 h-5" />}
          />
          <InputField
            label="Monthly Contribution"
            value={monthlyContribution}
            onChange={setMonthlyContribution}
            placeholder="500"
            prefix={<DollarSign className="w-5 h-5" />}
          />
          <InputField
            label="Annual Interest Rate"
            value={interestRate}
            onChange={setInterestRate}
            placeholder="7"
            suffix="%"
          />
          <InputField
            label="Time Period"
            value={years}
            onChange={setYears}
            placeholder="30"
            suffix="years"
          />
        </div>
      </div>

      <AnimatePresence>
        {n > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <div className="bg-gradient-to-br from-teal-500 to-emerald-600 rounded-2xl p-6 text-white text-center">
              <p className="text-teal-100 mb-2">Future Value</p>
              <motion.p
                className="text-4xl font-bold"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
              >
                ${futureValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </motion.p>
              <p className="text-sm text-teal-100 mt-2">
                After {years} years of investing
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <ResultCard
                label="You Contributed"
                value={`$${totalContributed.toLocaleString()}`}
                icon={<Wallet className="w-5 h-5 text-blue-500" />}
              />
              <ResultCard
                label="Interest Earned"
                value={`$${totalInterest.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                color="text-emerald-600"
                icon={<Sparkles className="w-5 h-5 text-emerald-500" />}
              />
              <ResultCard
                label="Total Growth"
                value={`${growthPercent.toFixed(0)}%`}
                color="text-teal-600"
                icon={<ArrowUpRight className="w-5 h-5 text-teal-500" />}
              />
            </div>

            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-gray-200/60 shadow-sm">
              <p className="text-sm font-medium text-gray-600 mb-4">Your Money vs Interest</p>
              <div className="flex h-4 rounded-full overflow-hidden mb-3">
                <motion.div
                  className="bg-blue-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${(totalContributed / futureValue) * 100}%` }}
                  transition={{ duration: 0.8 }}
                />
                <motion.div
                  className="bg-emerald-400"
                  initial={{ width: 0 }}
                  animate={{ width: `${(totalInterest / futureValue) * 100}%` }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                />
              </div>
              <div className="flex justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full" />
                  <span className="text-gray-600">Your Money ({((totalContributed / futureValue) * 100).toFixed(0)}%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-emerald-400 rounded-full" />
                  <span className="text-gray-600">Interest ({((totalInterest / futureValue) * 100).toFixed(0)}%)</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Debt Payoff Planner Component
const DebtPayoffPlanner: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [debts, setDebts] = useState([
    { id: 1, name: '', balance: '', rate: '', minPayment: '' }
  ]);
  const [extraPayment, setExtraPayment] = useState('');
  const [method, setMethod] = useState<'avalanche' | 'snowball'>('avalanche');

  const addDebt = () => {
    setDebts([...debts, { id: Date.now(), name: '', balance: '', rate: '', minPayment: '' }]);
  };

  const removeDebt = (id: number) => {
    if (debts.length > 1) setDebts(debts.filter(d => d.id !== id));
  };

  const updateDebt = (id: number, field: string, value: string) => {
    setDebts(debts.map(d => d.id === id ? { ...d, [field]: value } : d));
  };

  const totalDebt = debts.reduce((sum, d) => sum + (parseFloat(d.balance) || 0), 0);
  const totalMinPayment = debts.reduce((sum, d) => sum + (parseFloat(d.minPayment) || 0), 0);
  const extra = parseFloat(extraPayment) || 0;
  const totalMonthlyPayment = totalMinPayment + extra;
  const monthsToPayoff = totalDebt > 0 && totalMonthlyPayment > 0 ? Math.ceil(totalDebt / totalMonthlyPayment) : 0;

  const targetDate = monthsToPayoff > 0
    ? new Date(Date.now() + monthsToPayoff * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'Add your debts';

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <BackButton onClick={onBack} />
      <ToolHeader
        title="Debt Payoff"
        subtitle="Plan your path to freedom"
        icon={<Target className="w-7 h-7" />}
        color="bg-rose-500"
      />

      <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/60 shadow-sm mb-6">
        <div className="flex items-center justify-between mb-5">
          <p className="font-medium text-gray-700">Payoff Strategy</p>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-6">
          {[
            { id: 'avalanche', name: 'Avalanche', desc: 'Highest interest first', icon: '⛰️' },
            { id: 'snowball', name: 'Snowball', desc: 'Smallest balance first', icon: '⛄' }
          ].map((m) => (
            <motion.button
              key={m.id}
              onClick={() => setMethod(m.id as 'avalanche' | 'snowball')}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                method === m.id
                  ? 'border-rose-500 bg-rose-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{m.icon}</span>
                <div>
                  <p className="font-semibold text-gray-800">{m.name}</p>
                  <p className="text-xs text-gray-500">{m.desc}</p>
                </div>
                {method === m.id && <Check className="w-5 h-5 text-rose-500 ml-auto" />}
              </div>
            </motion.button>
          ))}
        </div>

        <div className="space-y-4">
          {debts.map((debt, idx) => (
            <motion.div
              key={debt.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-50 rounded-xl p-4"
            >
              <div className="flex items-center gap-3 mb-3">
                <input
                  type="text"
                  value={debt.name}
                  onChange={(e) => updateDebt(debt.id, 'name', e.target.value)}
                  placeholder={`Debt ${idx + 1} (e.g., Credit Card)`}
                  className="flex-1 px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:border-rose-400 outline-none"
                />
                {debts.length > 1 && (
                  <button
                    onClick={() => removeDebt(debt.id)}
                    className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Balance</label>
                  <div className="relative">
                    <DollarSign className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="number"
                      value={debt.balance}
                      onChange={(e) => updateDebt(debt.id, 'balance', e.target.value)}
                      placeholder="5,000"
                      className="w-full pl-8 pr-2 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:border-rose-400 outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">APR %</label>
                  <input
                    type="number"
                    value={debt.rate}
                    onChange={(e) => updateDebt(debt.id, 'rate', e.target.value)}
                    placeholder="18.9"
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:border-rose-400 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Min Payment</label>
                  <div className="relative">
                    <DollarSign className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="number"
                      value={debt.minPayment}
                      onChange={(e) => updateDebt(debt.id, 'minPayment', e.target.value)}
                      placeholder="100"
                      className="w-full pl-8 pr-2 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:border-rose-400 outline-none"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <button
          onClick={addDebt}
          className="mt-4 w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-rose-400 hover:text-rose-500 transition font-medium"
        >
          + Add Another Debt
        </button>

        <div className="mt-6">
          <InputField
            label="Extra Monthly Payment"
            value={extraPayment}
            onChange={setExtraPayment}
            placeholder="200"
            prefix={<DollarSign className="w-5 h-5" />}
          />
        </div>
      </div>

      {totalDebt > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="bg-gradient-to-br from-rose-500 to-red-600 rounded-2xl p-6 text-white text-center">
            <p className="text-rose-100 mb-1">Total Debt</p>
            <p className="text-4xl font-bold">${totalDebt.toLocaleString()}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <ResultCard
              label="Months to Freedom"
              value={monthsToPayoff.toString()}
              icon={<Calendar className="w-5 h-5 text-blue-500" />}
            />
            <ResultCard
              label="Monthly Payment"
              value={`$${totalMonthlyPayment.toLocaleString()}`}
              icon={<Wallet className="w-5 h-5 text-emerald-500" />}
            />
          </div>

          <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-semibold text-emerald-800">Debt-Free Date</p>
                <p className="text-emerald-600">{targetDate}</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

// Main Financial Tools Component
const FinancialTools: React.FC = () => {
  const navigate = useNavigate();
  const [selectedTool, setSelectedTool] = useState<ToolId | null>(null);

  const renderTool = () => {
    switch (selectedTool) {
      case 'budget': return <BudgetCalculator onBack={() => setSelectedTool(null)} />;
      case 'savings': return <SavingsPlanner onBack={() => setSelectedTool(null)} />;
      case 'loan': return <LoanCalculator onBack={() => setSelectedTool(null)} />;
      case 'networth': return <NetWorthCalculator onBack={() => setSelectedTool(null)} />;
      case 'compound': return <CompoundInterestCalculator onBack={() => setSelectedTool(null)} />;
      case 'debt-payoff': return <DebtPayoffPlanner onBack={() => setSelectedTool(null)} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-100/60 to-indigo-100/80">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-md border-b border-gray-200/60 sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline font-medium">Dashboard</span>
            </button>
            <div className="text-center">
              <h1 className="text-xl font-bold text-gray-800">Financial Tools</h1>
              <p className="text-sm text-gray-500 hidden sm:block">Your personal finance toolkit</p>
            </div>
            <div className="w-20" />
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <AnimatePresence mode="wait">
          {selectedTool ? (
            <motion.div
              key="tool"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {renderTool()}
            </motion.div>
          ) : (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Welcome Section */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Choose a Tool</h2>
                <p className="text-gray-500">Select a calculator to help with your financial planning</p>
              </div>

              {/* Tools Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {FINANCIAL_TOOLS.map((tool, index) => (
                  <motion.button
                    key={tool.id}
                    onClick={() => setSelectedTool(tool.id)}
                    className={`group relative overflow-hidden rounded-2xl p-6 border-2 border-transparent ${tool.hoverBorder} hover:shadow-2xl text-left transition-all duration-300 bg-gradient-to-br ${tool.gradient}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ y: -6, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {/* Decorative Elements */}
                    <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full bg-white/30" />
                    <div className="absolute -right-3 -bottom-3 w-16 h-16 rounded-full bg-white/20" />

                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`w-14 h-14 ${tool.iconBg} rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300`}>
                          {tool.icon}
                        </div>
                        <div className="w-9 h-9 rounded-full bg-white/60 group-hover:bg-white flex items-center justify-center transition-all duration-300 shadow-sm">
                          <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-gray-700 group-hover:translate-x-0.5 transition-all" />
                        </div>
                      </div>
                      <h3 className="font-bold text-gray-800 text-lg mb-1">{tool.title}</h3>
                      <p className="text-sm font-semibold text-gray-600 mb-2">{tool.subtitle}</p>
                      <p className="text-sm text-gray-600">{tool.description}</p>
                    </div>
                  </motion.button>
                ))}
              </div>

              {/* Tip Card */}
              <motion.div
                className="mt-8 relative overflow-hidden bg-gradient-to-r from-indigo-600 via-blue-600 to-violet-600 rounded-2xl p-6 text-white shadow-xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

                <div className="relative z-10 flex items-start gap-4">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">Pro Tip</h3>
                    <p className="text-blue-100">
                      Use these tools regularly to track your financial progress. Small, consistent actions lead to big results over time.
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default FinancialTools;
