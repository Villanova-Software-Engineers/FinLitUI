import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useModuleScore, MODULES } from '../hooks/useModuleScore';
import ModuleCompletedScreen from './ModuleCompletedScreen';

// 10 Quiz Questions
const quizQuestions = [
  {
    question: "What is a mortgage?",
    options: ["A type of insurance", "A loan used to purchase real estate", "A down payment", "Property tax"],
    correctIndex: 1,
    explanation: "A mortgage is a loan specifically used to purchase real estate. The property itself serves as collateral - if you don't pay, the lender can take the property through foreclosure."
  },
  {
    question: "What is the recommended minimum down payment to avoid PMI (Private Mortgage Insurance)?",
    options: ["5%", "10%", "15%", "20%"],
    correctIndex: 3,
    explanation: "Putting down 20% or more typically allows you to avoid PMI, which is insurance that protects the lender (not you) if you default. This can save you hundreds per month."
  },
  {
    question: "What does 'location, location, location' mean in real estate?",
    options: ["Size doesn't matter", "Location is the most important factor in property value", "You should buy multiple properties", "Location changes over time"],
    correctIndex: 1,
    explanation: "Location is the single most important factor in real estate value. You can renovate a house, but you can't change its location. Proximity to schools, jobs, amenities, and safety significantly affect value."
  },
  {
    question: "What is equity in real estate?",
    options: ["The monthly payment", "The difference between property value and what you owe", "The interest rate", "Property taxes"],
    correctIndex: 1,
    explanation: "Equity is the portion of the property you actually own - calculated as the home's current market value minus what you still owe on the mortgage. As you pay down the loan and as the property appreciates, your equity grows."
  },
  {
    question: "What is the 28/36 rule in mortgages?",
    options: ["Age requirements", "Housing costs shouldn't exceed 28% of income, total debt shouldn't exceed 36%", "Interest rate limits", "Down payment percentages"],
    correctIndex: 1,
    explanation: "The 28/36 rule states that your housing costs (mortgage, taxes, insurance) shouldn't exceed 28% of gross monthly income, and total debt payments shouldn't exceed 36%. This helps ensure affordability."
  },
  {
    question: "What are closing costs?",
    options: ["Monthly mortgage payments", "Fees and expenses paid when finalizing a real estate purchase", "Property taxes", "Homeowners insurance"],
    correctIndex: 1,
    explanation: "Closing costs are one-time fees paid when finalizing a home purchase, typically 2-5% of the purchase price. They include appraisal fees, title insurance, attorney fees, and lender charges."
  },
  {
    question: "What is a fixed-rate mortgage?",
    options: ["Interest rate changes monthly", "Interest rate stays the same for the entire loan", "No interest charged", "Interest only for 5 years"],
    correctIndex: 1,
    explanation: "A fixed-rate mortgage has an interest rate that remains constant for the entire loan term (15, 20, or 30 years). Your monthly principal and interest payment never changes, providing predictability."
  },
  {
    question: "What is property appreciation?",
    options: ["Property maintenance", "Increase in property value over time", "Property taxes", "Homeowner satisfaction"],
    correctIndex: 1,
    explanation: "Appreciation is the increase in a property's value over time due to factors like demand, location improvements, inflation, and market conditions. Historical average is about 3-4% annually."
  },
  {
    question: "What is a real estate investment trust (REIT)?",
    options: ["A mortgage type", "A company that owns income-producing real estate", "A government program", "A type of property tax"],
    correctIndex: 1,
    explanation: "A REIT is a company that owns, operates, or finances income-producing real estate. You can buy shares like stocks, allowing you to invest in real estate without buying property directly."
  },
  {
    question: "Why is an emergency fund extra important for homeowners?",
    options: ["It's not important", "Unexpected repairs and maintenance can be expensive", "To pay property taxes", "For monthly mortgage payments"],
    correctIndex: 1,
    explanation: "Homeowners face unexpected costs like roof repairs, HVAC replacement, or plumbing emergencies. Unlike renters who call the landlord, homeowners must pay for these themselves - often $5,000-$20,000+."
  }
];

// Intro Page
const IntroPage = ({ handleNext }) => (
  <div className="max-w-5xl mx-auto pt-16">
    <motion.div className="text-center mb-12" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
      <h1 className="text-5xl font-bold mb-4 text-gray-800">🏠 Real Estate Investing</h1>
      <p className="text-xl text-gray-600">Build wealth through property ownership</p>
    </motion.div>

    <div className="space-y-6 mb-12">
      <motion.div className="p-8 rounded-3xl shadow-xl bg-white" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-500 flex items-center justify-center shadow-lg flex-shrink-0">
            <span className="text-3xl">🏡</span>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">Why Real Estate?</h3>
            <p className="text-gray-700 text-lg leading-relaxed">
              Real estate has been one of the most reliable wealth-building tools for centuries. It provides <span className="font-bold text-blue-600">stable housing</span>,
              <span className="font-bold text-green-600"> potential appreciation</span>,
              <span className="font-bold text-purple-600"> rental income</span>, and <span className="font-bold text-orange-600">tax benefits</span>.
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div className="p-8 rounded-3xl shadow-xl bg-white" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-green-500 flex items-center justify-center shadow-lg flex-shrink-0">
            <span className="text-3xl">📊</span>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">Historical Performance</h3>
            <p className="text-gray-700 text-lg leading-relaxed">
              Historically, real estate appreciates about <span className="font-semibold">3-4% annually</span> on average.
              With leverage (using a mortgage), your returns can be amplified significantly. Plus, you can live in your investment!
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div className="p-8 rounded-3xl shadow-xl bg-white" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-purple-500 flex items-center justify-center shadow-lg flex-shrink-0">
            <span className="text-3xl">💰</span>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Benefits of Real Estate</h3>
            <div className="space-y-3">
              {[
                "Forced savings (building equity with each payment)",
                "Leverage (control $400K property with $80K down payment)",
                "Tax deductions (mortgage interest, property taxes)",
                "Inflation hedge (property values rise with inflation)",
                "Rental income potential"
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

    <div className="flex justify-center pb-12">
      <button onClick={handleNext} className="px-10 py-4 rounded-2xl bg-blue-500 text-white font-bold text-lg shadow-xl hover:bg-blue-600 transition">
        Continue to Homeownership Basics →
      </button>
    </div>
  </div>
);

// Homeownership Basics Page
const HomeownershipPage = ({ handlePrev, handleNext }) => {
  const [expandedIndex, setExpandedIndex] = useState(null);

  const steps = [
    {
      icon: "💵",
      title: "Save for Down Payment",
      subtitle: "20% recommended",
      description: "Save at least 20% to avoid PMI and get better rates",
      details: "For a $300,000 home, that's $60,000. It seems like a lot, but it saves you money long-term by avoiding PMI ($100-300/month) and securing lower interest rates.",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: "📋",
      title: "Get Pre-Approved",
      subtitle: "Know your budget",
      description: "Get pre-approved for a mortgage to know what you can afford",
      details: "Pre-approval involves a lender checking your credit, income, and assets. It shows sellers you're serious and helps you avoid falling in love with homes you can't afford.",
      color: "from-green-500 to-green-600"
    },
    {
      icon: "🔍",
      title: "Find the Right Property",
      subtitle: "Location matters most",
      description: "Research neighborhoods, schools, commute, and growth potential",
      details: "Consider resale value even if you plan to stay forever. Good schools, low crime, proximity to jobs and amenities all boost value. A smaller house in a great location beats a mansion in a bad one.",
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: "🏠",
      title: "Make an Offer",
      subtitle: "Negotiate wisely",
      description: "Work with a real estate agent to make a competitive offer",
      details: "In hot markets, you may need to offer above asking price. In slow markets, you have more negotiating power. Always include contingencies for inspection and financing.",
      color: "from-orange-500 to-orange-600"
    },
    {
      icon: "🔎",
      title: "Home Inspection",
      subtitle: "Protect your investment",
      description: "Hire a professional inspector to check for problems",
      details: "Costs $300-500 but can save you thousands by uncovering issues like foundation problems, roof damage, or electrical issues. Use findings to negotiate repairs or price reductions.",
      color: "from-pink-500 to-pink-600"
    },
    {
      icon: "📝",
      title: "Close the Deal",
      subtitle: "Finalize the purchase",
      description: "Sign documents and pay closing costs (2-5% of price)",
      details: "Closing costs include appraisal ($400-600), title insurance ($1,000-2,000), attorney fees ($500-1,500), and lender fees. Budget $6,000-$15,000 for a $300K home.",
      color: "from-teal-500 to-teal-600"
    }
  ];

  return (
    <div className="max-w-4xl mx-auto pt-16">
      <motion.h2 className="text-4xl font-bold mb-4 text-center text-gray-800" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        Steps to Homeownership
      </motion.h2>
      <p className="text-center text-gray-600 mb-8 text-lg">The journey from renter to owner</p>

      <div className="grid gap-6 mb-8">
        {steps.map((step, idx) => (
          <motion.div
            key={idx}
            className={`p-6 bg-gradient-to-r ${step.color} rounded-2xl shadow-xl cursor-pointer hover:shadow-2xl transition`}
            onClick={() => setExpandedIndex(expandedIndex === idx ? null : idx)}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-4">
                <div className="text-5xl">{step.icon}</div>
                <div>
                  <div className="flex items-center gap-2">
                    <div className="bg-white/30 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                      {idx + 1}
                    </div>
                    <h4 className="font-bold text-2xl">{step.title}</h4>
                  </div>
                  <p className="text-lg opacity-90">{step.subtitle}</p>
                  <p className="text-sm mt-1">{step.description}</p>
                </div>
              </div>
              <motion.div
                animate={{ rotate: expandedIndex === idx ? 180 : 0 }}
                className="text-white"
              >
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
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
                  <div className="pt-4 border-t border-white/30">
                    <p className="text-white text-lg bg-black/20 p-4 rounded-lg leading-relaxed">
                      💡 {step.details}
                    </p>
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

// Mortgage Calculator Page
const MortgageCalculatorPage = ({ handlePrev, handleNext }) => {
  const [homePrice, setHomePrice] = useState('300000');
  const [downPayment, setDownPayment] = useState('60000');
  const [interestRate, setInterestRate] = useState('6.5');
  const [loanTerm, setLoanTerm] = useState('30');

  const price = parseFloat(homePrice) || 0;
  const down = parseFloat(downPayment) || 0;
  const rate = parseFloat(interestRate) / 100 / 12 || 0;
  const term = parseInt(loanTerm) || 0;
  const loanAmount = price - down;
  const months = term * 12;

  // Monthly payment calculation (P&I only)
  const monthlyPayment = loanAmount > 0 && rate > 0 && months > 0
    ? (loanAmount * rate * Math.pow(1 + rate, months)) / (Math.pow(1 + rate, months) - 1)
    : 0;

  const downPercent = price > 0 ? (down / price) * 100 : 0;
  const needsPMI = downPercent < 20;
  const pmiAmount = needsPMI ? loanAmount * 0.005 / 12 : 0; // ~0.5% annually
  const propertyTax = price * 0.012 / 12; // ~1.2% annually
  const insurance = price * 0.005 / 12; // ~0.5% annually
  const totalMonthly = monthlyPayment + pmiAmount + propertyTax + insurance;

  return (
    <div className="max-w-4xl mx-auto pt-16">
      <motion.h2 className="text-4xl font-bold mb-4 text-center text-gray-800" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        Mortgage Calculator
      </motion.h2>
      <p className="text-center text-gray-600 mb-8 text-lg">See what you can afford</p>

      <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-gray-600 font-semibold mb-2">Home Price</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg">$</span>
              <input
                type="number"
                value={homePrice}
                onChange={(e) => setHomePrice(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-lg font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-600 font-semibold mb-2">Down Payment ({downPercent.toFixed(1)}%)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg">$</span>
              <input
                type="number"
                value={downPayment}
                onChange={(e) => setDownPayment(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-lg font-bold"
              />
            </div>
            {downPercent < 20 && <p className="text-red-600 text-sm mt-1">⚠️ PMI required (below 20%)</p>}
          </div>

          <div>
            <label className="block text-gray-600 font-semibold mb-2">Interest Rate (%)</label>
            <input
              type="number"
              step="0.1"
              value={interestRate}
              onChange={(e) => setInterestRate(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-lg font-bold"
            />
          </div>

          <div>
            <label className="block text-gray-600 font-semibold mb-2">Loan Term (years)</label>
            <select
              value={loanTerm}
              onChange={(e) => setLoanTerm(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-lg font-bold"
            >
              <option value="15">15 years</option>
              <option value="20">20 years</option>
              <option value="30">30 years</option>
            </select>
          </div>
        </div>

        {price > 0 && down > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-8 rounded-2xl"
          >
            <div className="text-center mb-6">
              <p className="text-lg opacity-90">Total Monthly Payment</p>
              <p className="text-6xl font-black">${totalMonthly.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
            </div>

            <div className="border-t border-white/30 pt-6 grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm opacity-75">Principal & Interest</p>
                <p className="text-2xl font-bold">${monthlyPayment.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
              </div>
              <div>
                <p className="text-sm opacity-75">Property Tax (est.)</p>
                <p className="text-2xl font-bold">${propertyTax.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
              </div>
              <div>
                <p className="text-sm opacity-75">Insurance (est.)</p>
                <p className="text-2xl font-bold">${insurance.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
              </div>
              {needsPMI && (
                <div>
                  <p className="text-sm opacity-75">PMI (mortgage insurance)</p>
                  <p className="text-2xl font-bold">${pmiAmount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
                </div>
              )}
            </div>

            <div className="mt-6 pt-6 border-t border-white/30">
              <p className="text-sm opacity-75">Loan Amount: ${loanAmount.toLocaleString()}</p>
              <p className="text-sm opacity-75">Total Interest Over Life: ${((monthlyPayment * months) - loanAmount).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
            </div>
          </motion.div>
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

// Investment Strategies Page
const InvestmentStrategiesPage = ({ handlePrev, handleNext }) => {
  const strategies = [
    {
      icon: "🏠",
      title: "Primary Residence",
      pros: ["Tax benefits", "Build equity", "Stable housing", "Leverage appreciation"],
      cons: ["Large upfront cost", "Maintenance responsibility", "Less liquid", "Market risk"],
      color: "bg-blue-50"
    },
    {
      icon: "🏘️",
      title: "Rental Property",
      pros: ["Monthly income", "Tax deductions", "Appreciation", "Inflation hedge"],
      cons: ["Tenant management", "Vacancies", "Maintenance costs", "Time intensive"],
      color: "bg-green-50"
    },
    {
      icon: "🏢",
      title: "REITs (Real Estate Investment Trusts)",
      pros: ["Highly liquid", "Low minimum investment", "Diversification", "Professional management"],
      cons: ["No control", "Market volatility", "Taxed as income", "No leverage"],
      color: "bg-purple-50"
    },
    {
      icon: "🔨",
      title: "Fix and Flip",
      pros: ["Quick profits", "Learn renovation", "Active involvement", "High ROI potential"],
      cons: ["High risk", "Requires expertise", "Time consuming", "Market dependent"],
      color: "bg-orange-50"
    }
  ];

  return (
    <div className="max-w-6xl mx-auto pt-16">
      <motion.h2 className="text-4xl font-bold mb-4 text-center text-gray-800" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        Real Estate Investment Strategies
      </motion.h2>
      <p className="text-center text-gray-600 mb-8 text-lg">Different ways to invest in real estate</p>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {strategies.map((strategy, idx) => (
          <motion.div
            key={idx}
            className={`${strategy.color} border-2 border-gray-200 p-6 rounded-2xl shadow-md hover:shadow-lg transition`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
          >
            <div className="text-center mb-4">
              <div className="text-6xl mb-2">{strategy.icon}</div>
              <h3 className="text-2xl font-bold text-gray-800">{strategy.title}</h3>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-bold text-green-700 mb-2 flex items-center gap-2">
                  <span>✅</span> Pros
                </h4>
                <ul className="space-y-1">
                  {strategy.pros.map((pro, i) => (
                    <li key={i} className="text-sm text-gray-700">• {pro}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-red-700 mb-2 flex items-center gap-2">
                  <span>⚠️</span> Cons
                </h4>
                <ul className="space-y-1">
                  {strategy.cons.map((con, i) => (
                    <li key={i} className="text-sm text-gray-700">• {con}</li>
                  ))}
                </ul>
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
};

// Quiz Page (same style as WhatIsMoney)
const QuizPage = ({ currentQuestion, selectedAnswer, showAnswerResult, score, handleAnswerSelect, handleNextQuestion, handlePrev, quizCompleted, resetQuiz, navigate }) => (
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
              <span className="text-5xl">🏠</span>
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
            <p className="text-green-700 text-lg">You've mastered the Real Estate module</p>
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
            onClick={() => navigate('/roadmap')}
            className="px-8 py-4 rounded-xl border-2 border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-lg transition-all"
          >
            Back to Roadmap
          </button>
        </div>
      </motion.div>
    )}
  </div>
);

// Main Component
const RealEstateModule = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isReviewMode, setIsReviewMode] = useState(false);
  const { saveScore, isModulePassed } = useModuleScore();

  // Quiz state
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [showAnswerResult, setShowAnswerResult] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [answers, setAnswers] = useState([]);

  const modulePassed = isModulePassed(MODULES.REAL_ESTATE.id);
  const totalSteps = 5; // 0:intro, 1:homeownership, 2:calculator, 3:strategies, 4:quiz

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
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
    if (showAnswerResult) return;
    setSelectedAnswer(index);
    setShowAnswerResult(true);
  };

  const handleNextQuestion = () => {
    const newAnswers = [...answers, selectedAnswer];
    setAnswers(newAnswers);

    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowAnswerResult(false);
    } else {
      let finalScore = 0;
      newAnswers.forEach((answer, idx) => {
        if (answer === quizQuestions[idx].correctIndex) {
          finalScore++;
        }
      });
      setScore(finalScore);
      setQuizCompleted(true);

      const percentage = (finalScore / quizQuestions.length) * 100;
      if (percentage >= 80) {
        saveScore(MODULES.REAL_ESTATE.id, percentage);
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

  if (modulePassed && !isReviewMode) {
    return (
      <ModuleCompletedScreen
        emoji="🏠"
        moduleName="Real Estate"
        description="You've already passed the Real Estate module. Great job mastering property investment!"
        gradientClasses="from-green-50 via-emerald-100 to-teal-200"
        onReviewClick={() => setIsReviewMode(true)}
      />
    );
  }

  return (
    <div className="min-h-screen relative overflow-x-hidden" style={{ background: 'linear-gradient(120deg, #e0f7fa 0%, #e8f5e9 50%, #e3f2fd 100%)' }}>
      <button
        className="absolute top-4 left-4 px-4 py-2 rounded-lg text-blue-600 hover:bg-white/50 backdrop-blur-sm font-medium transition z-50 shadow-sm border border-blue-100"
        onClick={() => navigate('/roadmap')}
      >
        ← Back to Roadmap
      </button>

      <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-50">
        <div className="bg-white/80 backdrop-blur-md px-4 py-1.5 rounded-full shadow-sm border border-gray-100 text-gray-600 font-semibold text-sm">
          Step {currentStep + 1} of {totalSteps}
        </div>
      </div>

      {(currentStep > 0 && (currentStep < totalSteps - 1 || (currentStep === totalSteps - 1 && currentQuestion === 0 && !showAnswerResult && !quizCompleted))) && (
        <button
          onClick={handlePrev}
          className="fixed left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition flex items-center justify-center z-40"
          aria-label="Previous"
        >
          ←
        </button>
      )}
      {currentStep < totalSteps - 1 && (
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
          {currentStep === 1 && <HomeownershipPage handlePrev={handlePrev} handleNext={handleNext} />}
          {currentStep === 2 && <MortgageCalculatorPage handlePrev={handlePrev} handleNext={handleNext} />}
          {currentStep === 3 && <InvestmentStrategiesPage handlePrev={handlePrev} handleNext={handleNext} />}
          {currentStep === 4 && (
            <QuizPage
              currentQuestion={currentQuestion}
              selectedAnswer={selectedAnswer}
              showAnswerResult={showAnswerResult}
              score={score}
              handleAnswerSelect={handleAnswerSelect}
              handleNextQuestion={handleNextQuestion}
              handlePrev={handlePrev}
              quizCompleted={quizCompleted}
              resetQuiz={resetQuiz}
              navigate={navigate}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default RealEstateModule;
