import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useModuleScore, MODULES } from '../hooks/useModuleScore';
import ModuleCompletedScreen from './ModuleCompletedScreen';

// Quiz questions
const quizQuestions = [
  {
    question: "What is an interest rate?",
    options: ["A type of bank fee", "The cost of borrowing money or the reward for saving it", "A government tax", "A type of investment"],
    correctIndex: 1,
    explanation: "An interest rate is the percentage charged by a lender for borrowing money OR the percentage a bank pays you for keeping your money with them. It's the 'price' of money!"
  },
  {
    question: "Who sets the federal funds rate in the United States?",
    options: ["The President", "Congress", "The Federal Reserve", "Individual banks"],
    correctIndex: 2,
    explanation: "The Federal Reserve (the Fed) sets the federal funds rate, which influences all other interest rates in the economy. When the Fed changes rates, it affects mortgages, car loans, savings accounts, and more."
  },
  {
    question: "If you borrow $1,000 at 10% annual interest for one year, how much interest do you pay?",
    options: ["$10", "$100", "$1,000", "$1,100"],
    correctIndex: 1,
    explanation: "$1,000 × 10% = $100. This is simple interest for one year. You'd pay back $1,100 total ($1,000 principal + $100 interest)."
  },
  {
    question: "What typically happens to borrowing when the Fed raises interest rates?",
    options: ["It becomes cheaper", "It stays the same", "It becomes more expensive", "Interest rates don't affect borrowing"],
    correctIndex: 2,
    explanation: "When the Fed raises rates, banks raise their rates too. Mortgages, car loans, and credit cards all become more expensive, which slows down borrowing and spending."
  },
  {
    question: "What is APR?",
    options: ["Annual Payment Required", "Annual Percentage Rate - the yearly cost of borrowing", "Automatic Payment Renewal", "Average Price Rate"],
    correctIndex: 1,
    explanation: "APR (Annual Percentage Rate) is the total yearly cost of borrowing, including interest and fees. It helps you compare loan offers - lower APR = cheaper loan."
  },
  {
    question: "Why might the Federal Reserve lower interest rates?",
    options: ["To slow down the economy", "To reduce inflation", "To stimulate the economy and encourage borrowing", "To increase bank profits"],
    correctIndex: 2,
    explanation: "Lower rates make borrowing cheaper, encouraging businesses to invest and consumers to spend. This stimulates economic growth but can increase inflation if overdone."
  },
  {
    question: "What's the relationship between interest rates and bond prices?",
    options: ["They move together", "They move in opposite directions", "No relationship", "Bonds aren't affected by rates"],
    correctIndex: 1,
    explanation: "Bond prices and interest rates have an inverse relationship. When rates rise, existing bond prices fall (because new bonds offer better returns). When rates fall, bond prices rise."
  },
  {
    question: "What is a fixed interest rate?",
    options: ["A rate that changes monthly", "A rate that stays the same for the loan term", "A rate set by the government", "A rate that adjusts to inflation"],
    correctIndex: 1,
    explanation: "A fixed rate stays the same throughout your loan. This provides predictable payments but may start higher than variable rates. Great for long-term planning!"
  },
  {
    question: "What does it mean when someone is 'underwater' on a loan?",
    options: ["They pay on time", "They owe more than the asset is worth", "They have excellent credit", "They paid off early"],
    correctIndex: 1,
    explanation: "Being 'underwater' means owing more than the asset's current value. Common with mortgages when home values drop. High interest rates can contribute to this situation."
  },
  {
    question: "Which typically has higher interest rates?",
    options: ["Secured loans (like mortgages)", "Unsecured loans (like credit cards)", "Both are the same", "Government bonds"],
    correctIndex: 1,
    explanation: "Unsecured loans like credit cards have higher rates (15-25%+) because there's no collateral. Secured loans (backed by property) have lower rates (3-8%) because the lender can take the asset if you default."
  }
];

// Rate scenarios for game
const rateScenarios = [
  {
    scenario: "The economy is overheating with high inflation at 7%. Prices are rising too fast.",
    fedAction: "The Fed is considering raising interest rates.",
    question: "As a consumer, what should you do with your mortgage plans?",
    options: [
      { text: "Lock in a fixed-rate mortgage NOW before rates rise", points: 100, feedback: "Smart! Locking in current rates protects you from future increases." },
      { text: "Wait and see what happens", points: 30, feedback: "Risky! When the Fed signals rate hikes, they usually follow through." },
      { text: "Get a variable rate mortgage - rates might drop", points: 0, feedback: "Dangerous! In this scenario, rates are almost certain to rise." },
      { text: "Avoid buying until rates drop again", points: 60, feedback: "Cautious, but you might wait years. Locking in now could be better." }
    ]
  },
  {
    scenario: "We're entering a recession. Unemployment is rising and spending is down.",
    fedAction: "The Fed is expected to cut interest rates to stimulate the economy.",
    question: "What's a smart move for your savings?",
    options: [
      { text: "Lock into a high-yield CD now before rates drop", points: 100, feedback: "Excellent! CDs lock in current rates. When rates fall, you'll still earn the higher rate." },
      { text: "Keep everything in a regular savings account", points: 40, feedback: "OK, but your rate will drop along with the Fed's cuts." },
      { text: "Move savings to checking - rates don't matter", points: 10, feedback: "Checking earns almost nothing. You're losing money to inflation." },
      { text: "Wait to see how low rates go", points: 30, feedback: "By waiting, you miss locking in today's higher rates." }
    ]
  },
  {
    scenario: "Interest rates are at historic lows of 2%. You have $50,000 in savings.",
    fedAction: "Economists predict rates will rise over the next 2-3 years.",
    question: "What's the best strategy for maximizing returns?",
    options: [
      { text: "Ladder CDs with different maturity dates", points: 100, feedback: "Perfect! CD laddering lets you benefit from rising rates while keeping some money accessible." },
      { text: "Put everything in a 5-year CD", points: 50, feedback: "Decent return, but if rates rise significantly, you're stuck at the low rate." },
      { text: "Keep everything liquid in savings", points: 70, feedback: "Flexible, but you'll get lower rates than CDs offer." },
      { text: "Don't worry about interest - it's all low anyway", points: 20, feedback: "Over time, small differences compound significantly. Every percentage point matters!" }
    ]
  },
  {
    scenario: "You have $20,000 in credit card debt at 22% APR. The Fed just raised rates.",
    fedAction: "Your credit card rate will likely increase to 24-25% soon.",
    question: "What's the best financial move?",
    options: [
      { text: "Transfer to a 0% balance transfer card ASAP", points: 100, feedback: "Excellent! Lock in 0% for 12-18 months and pay down aggressively." },
      { text: "Pay minimum payments and wait", points: 0, feedback: "At 22%+ interest, you're drowning. Minimum payments mostly go to interest." },
      { text: "Take out a personal loan at 10% to pay it off", points: 80, feedback: "Good! A lower-rate loan saves money, though 0% transfer is even better." },
      { text: "Open another credit card for the rewards", points: 10, feedback: "More cards with high balances = more interest = worse situation." }
    ]
  },
  {
    scenario: "You're starting a business and need $100,000. Current prime rate is 8%.",
    fedAction: "The Fed has signaled potential rate cuts in 6 months.",
    question: "How should you structure your business loan?",
    options: [
      { text: "Get a variable rate loan - rates will likely drop", points: 100, feedback: "Smart! If cuts are coming, variable rates will decrease and save you money." },
      { text: "Lock in the current 8% fixed rate", points: 50, feedback: "Safe, but you'll miss out if rates drop significantly." },
      { text: "Wait 6 months to borrow", points: 30, feedback: "Waiting could delay your business. Variable rate gives you flexibility now." },
      { text: "Use credit cards instead", points: 0, feedback: "Credit card rates (20%+) are far higher than business loan rates!" }
    ]
  }
];

// Intro Page with visual storytelling
const IntroPage = ({ onNext }) => {
  const [animatedRate, setAnimatedRate] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimatedRate(prev => prev >= 5 ? 0 : prev + 0.5);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen p-6 pt-20 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-100">
      <div className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-2xl mb-6">
            <span className="text-5xl">%</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-3">Interest Rates</h1>
          <p className="text-xl text-gray-600">The invisible force shaping your financial future</p>
        </motion.div>

        {/* Visual Rate Display */}
        <motion.div
          className="bg-white rounded-3xl p-8 shadow-xl mb-8 border border-gray-100"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="text-center mb-6">
            <p className="text-gray-500 text-sm uppercase tracking-wider font-medium mb-2">Current Rate</p>
            <div className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">
              {animatedRate.toFixed(1)}%
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-4 rounded-xl bg-red-50">
              <div className="text-2xl mb-1">Borrow</div>
              <p className="text-red-600 font-semibold">You Pay</p>
            </div>
            <div className="p-4 rounded-xl bg-gray-50">
              <div className="text-2xl mb-1">0%</div>
              <p className="text-gray-500 font-semibold">Neutral</p>
            </div>
            <div className="p-4 rounded-xl bg-green-50">
              <div className="text-2xl mb-1">Save</div>
              <p className="text-green-600 font-semibold">You Earn</p>
            </div>
          </div>
        </motion.div>

        {/* Key Concept Cards */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <motion.div
            className="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-emerald-500"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="font-bold text-lg text-gray-800 mb-2">When You Borrow</h3>
            <p className="text-gray-600">Interest is the <span className="font-semibold text-red-600">cost</span> you pay to use someone else's money. Higher rates = more expensive loans.</p>
          </motion.div>

          <motion.div
            className="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-teal-500"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h3 className="font-bold text-lg text-gray-800 mb-2">When You Save</h3>
            <p className="text-gray-600">Interest is the <span className="font-semibold text-green-600">reward</span> you earn for lending your money to the bank. Higher rates = more earnings.</p>
          </motion.div>
        </div>

        {/* The Fed Box */}
        <motion.div
          className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-6 text-white mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center text-3xl flex-shrink-0">
              🏛️
            </div>
            <div>
              <h3 className="font-bold text-lg">The Federal Reserve</h3>
              <p className="text-slate-300 text-sm">The Fed sets the baseline interest rate for the entire U.S. economy. When they move rates up or down, everything from mortgages to credit cards follows.</p>
            </div>
          </div>
        </motion.div>

        <div className="flex justify-center">
          <motion.button
            onClick={onNext}
            className="px-10 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-lg shadow-xl hover:shadow-2xl transition-all"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Continue Learning
          </motion.button>
        </div>
      </div>
    </div>
  );
};

// Rate Calculator Interactive Page
const CalculatorPage = ({ onNext, onPrev }) => {
  const [loanAmount, setLoanAmount] = useState(10000);
  const [interestRate, setInterestRate] = useState(5);
  const [years, setYears] = useState(1);

  const simpleInterest = loanAmount * (interestRate / 100) * years;
  const totalPayback = loanAmount + simpleInterest;

  return (
    <div className="min-h-screen p-6 pt-20 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-4xl mx-auto">
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">Interest Rate Calculator</h1>
          <p className="text-gray-600">See how interest affects your money</p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Controls */}
          <motion.div
            className="bg-white rounded-2xl p-6 shadow-xl"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h3 className="font-bold text-lg text-gray-800 mb-6">Adjust the Values</h3>

            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <label className="font-medium text-gray-700">Loan Amount</label>
                  <span className="font-bold text-blue-600">${loanAmount.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min="1000"
                  max="50000"
                  step="1000"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(Number(e.target.value))}
                  className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <label className="font-medium text-gray-700">Interest Rate</label>
                  <span className="font-bold text-purple-600">{interestRate}%</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="25"
                  step="0.5"
                  value={interestRate}
                  onChange={(e) => setInterestRate(Number(e.target.value))}
                  className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <label className="font-medium text-gray-700">Time Period</label>
                  <span className="font-bold text-teal-600">{years} year{years > 1 ? 's' : ''}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={years}
                  onChange={(e) => setYears(Number(e.target.value))}
                  className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
                />
              </div>
            </div>
          </motion.div>

          {/* Results */}
          <motion.div
            className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 text-white shadow-xl"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h3 className="font-bold text-lg mb-6">Your Results</h3>

            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-white/10 rounded-xl">
                <span className="text-slate-300">Principal</span>
                <span className="text-2xl font-bold">${loanAmount.toLocaleString()}</span>
              </div>

              <div className="flex justify-between items-center p-4 bg-red-500/20 rounded-xl border border-red-400/30">
                <span className="text-red-200">Interest Paid</span>
                <span className="text-2xl font-bold text-red-400">+${simpleInterest.toLocaleString()}</span>
              </div>

              <div className="border-t border-white/20 pt-4">
                <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl">
                  <span className="text-slate-300">Total Payback</span>
                  <span className="text-3xl font-bold">${totalPayback.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-amber-500/20 rounded-xl border border-amber-400/30">
              <p className="text-amber-200 text-sm">
                <span className="font-bold">Formula:</span> Interest = Principal × Rate × Time
              </p>
              <p className="text-amber-100 text-xs mt-1">
                ${loanAmount.toLocaleString()} × {interestRate}% × {years} = ${simpleInterest.toLocaleString()}
              </p>
            </div>
          </motion.div>
        </div>

        {/* Comparison Cards */}
        <motion.div
          className="grid md:grid-cols-3 gap-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {[
            { rate: 5, label: "Good Rate", emoji: "✅", color: "green" },
            { rate: 15, label: "Average Rate", emoji: "⚠️", color: "amber" },
            { rate: 24, label: "Credit Card", emoji: "🔥", color: "red" }
          ].map((item, idx) => {
            const interest = loanAmount * (item.rate / 100) * years;
            return (
              <div key={idx} className={`bg-white p-4 rounded-xl shadow-lg border-t-4 border-${item.color}-500`}>
                <div className="text-center">
                  <span className="text-2xl">{item.emoji}</span>
                  <p className="font-bold text-gray-800 mt-1">{item.label}</p>
                  <p className="text-sm text-gray-500">{item.rate}% APR</p>
                  <p className={`text-lg font-bold text-${item.color}-600 mt-2`}>
                    +${interest.toLocaleString()}
                  </p>
                </div>
              </div>
            );
          })}
        </motion.div>

        <div className="flex justify-center gap-4">
          <button onClick={onPrev} className="px-8 py-4 rounded-xl bg-white text-gray-700 font-semibold shadow-lg border border-gray-200 hover:bg-gray-50">
            Back
          </button>
          <button onClick={onNext} className="px-8 py-4 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold shadow-lg hover:shadow-xl">
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

// Borrowing vs Saving Comparison Page
const ComparisonPage = ({ onNext, onPrev }) => {
  const [activeTab, setActiveTab] = useState('borrowing');

  const borrowingExamples = [
    { type: "Credit Card", rate: "18-25%", amount: "$5,000", yearly: "$900-$1,250", icon: "💳" },
    { type: "Car Loan", rate: "5-10%", amount: "$25,000", yearly: "$1,250-$2,500", icon: "🚗" },
    { type: "Mortgage", rate: "6-8%", amount: "$300,000", yearly: "$18,000-$24,000", icon: "🏠" },
    { type: "Student Loan", rate: "4-7%", amount: "$40,000", yearly: "$1,600-$2,800", icon: "🎓" }
  ];

  const savingExamples = [
    { type: "Regular Savings", rate: "0.5%", amount: "$5,000", yearly: "$25", icon: "🏦" },
    { type: "High-Yield Savings", rate: "4-5%", amount: "$5,000", yearly: "$200-$250", icon: "📈" },
    { type: "CD (1 Year)", rate: "4.5-5%", amount: "$10,000", yearly: "$450-$500", icon: "📜" },
    { type: "Treasury Bonds", rate: "4-5%", amount: "$10,000", yearly: "$400-$500", icon: "🏛️" }
  ];

  return (
    <div className="min-h-screen p-6 pt-20 bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
      <div className="max-w-4xl mx-auto">
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">Two Sides of Interest</h1>
          <p className="text-gray-600">The same rates work differently when you borrow vs save</p>
        </motion.div>

        {/* Tab Buttons */}
        <div className="flex justify-center gap-2 mb-8">
          <button
            onClick={() => setActiveTab('borrowing')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              activeTab === 'borrowing'
                ? 'bg-red-500 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            💸 When You Borrow
          </button>
          <button
            onClick={() => setActiveTab('saving')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              activeTab === 'saving'
                ? 'bg-green-500 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            🌱 When You Save
          </button>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {activeTab === 'borrowing' ? (
              <div className="space-y-4">
                <div className="bg-red-100 border border-red-200 rounded-2xl p-4 mb-6">
                  <p className="text-red-800 font-medium text-center">
                    Interest works AGAINST you when borrowing - you pay extra for using someone else's money
                  </p>
                </div>

                {borrowingExamples.map((item, idx) => (
                  <motion.div
                    key={idx}
                    className="bg-white p-5 rounded-xl shadow-lg flex items-center gap-4"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <div className="text-3xl">{item.icon}</div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-800">{item.type}</h3>
                      <p className="text-sm text-gray-500">Typical rate: {item.rate}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">On {item.amount}</p>
                      <p className="font-bold text-red-600">{item.yearly}/year</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-green-100 border border-green-200 rounded-2xl p-4 mb-6">
                  <p className="text-green-800 font-medium text-center">
                    Interest works FOR you when saving - your money grows while you sleep
                  </p>
                </div>

                {savingExamples.map((item, idx) => (
                  <motion.div
                    key={idx}
                    className="bg-white p-5 rounded-xl shadow-lg flex items-center gap-4"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <div className="text-3xl">{item.icon}</div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-800">{item.type}</h3>
                      <p className="text-sm text-gray-500">Typical rate: {item.rate}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">On {item.amount}</p>
                      <p className="font-bold text-green-600">+{item.yearly}/year</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Pro Tip */}
        <motion.div
          className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 text-white mt-8 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className="font-bold text-lg mb-2">The Golden Rule</h3>
          <p className="text-purple-100">
            Pay off high-interest debt (like credit cards at 22%) before focusing on low-yield savings (at 5%).
            You're effectively losing 17% by not paying off debt first!
          </p>
        </motion.div>

        <div className="flex justify-center gap-4">
          <button onClick={onPrev} className="px-8 py-4 rounded-xl bg-white text-gray-700 font-semibold shadow-lg border border-gray-200 hover:bg-gray-50">
            Back
          </button>
          <button onClick={onNext} className="px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold shadow-lg hover:shadow-xl">
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

// Interactive Scenario Game
const ScenarioGame = ({ onNext }) => {
  const [currentScenario, setCurrentScenario] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);

  const handleChoice = (idx, points) => {
    setSelectedOption(idx);
    setScore(score + points);
    setShowFeedback(true);
  };

  const nextScenario = () => {
    setSelectedOption(null);
    setShowFeedback(false);
    if (currentScenario < rateScenarios.length - 1) {
      setCurrentScenario(currentScenario + 1);
    } else {
      setGameComplete(true);
    }
  };

  if (gameComplete) {
    const maxScore = rateScenarios.length * 100;
    const percentage = Math.round((score / maxScore) * 100);

    return (
      <div className="min-h-screen p-6 pt-20 flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-100">
        <motion.div
          className="bg-white rounded-3xl shadow-2xl p-10 text-center max-w-md w-full"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-6 ${percentage >= 70 ? 'bg-green-500' : 'bg-amber-500'}`}>
            <span className="text-5xl">{percentage >= 70 ? '🏆' : '📚'}</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-3">Simulation Complete!</h2>
          <p className="text-xl text-gray-600 mb-6">
            You scored <span className="font-bold text-emerald-600">{score}/{maxScore}</span> ({percentage}%)
          </p>

          <div className={`p-4 rounded-xl mb-6 ${percentage >= 70 ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
            {percentage >= 70
              ? "Excellent! You understand how to navigate interest rate changes!"
              : "Keep learning! Interest rate strategy takes practice."}
          </div>

          <button onClick={onNext} className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-lg shadow-lg">
            Continue to Quiz
          </button>
        </motion.div>
      </div>
    );
  }

  const scenario = rateScenarios[currentScenario];

  return (
    <div className="min-h-screen p-6 pt-20 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      <div className="max-w-3xl mx-auto">
        <motion.div
          className="text-center mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Interest Rate Challenge</h1>
          <p className="text-gray-600">Make smart financial decisions</p>
          <div className="flex justify-center gap-2 mt-4">
            {rateScenarios.map((_, idx) => (
              <div
                key={idx}
                className={`w-3 h-3 rounded-full transition-all ${
                  idx < currentScenario ? 'bg-emerald-500' :
                  idx === currentScenario ? 'bg-emerald-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentScenario}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
          >
            {/* Scenario Card */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-6 shadow-xl">
              <div className="bg-gradient-to-r from-emerald-100 to-teal-100 p-6 border-b border-emerald-200">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">📰</span>
                  <span className="text-gray-700 font-medium">Economic Scenario</span>
                </div>
                <p className="text-gray-800 text-lg">{scenario.scenario}</p>
                <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <p className="text-amber-700 text-sm">🏛️ {scenario.fedAction}</p>
                </div>
              </div>

              <div className="p-6">
                <h4 className="text-gray-800 font-bold text-lg mb-4">{scenario.question}</h4>

                {!showFeedback ? (
                  <div className="space-y-3">
                    {scenario.options.map((option, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleChoice(idx, option.points)}
                        className="w-full p-4 text-left rounded-xl bg-gray-50 hover:bg-emerald-50 border-2 border-gray-200 hover:border-emerald-400 transition-all text-gray-700"
                      >
                        {option.text}
                      </button>
                    ))}
                  </div>
                ) : (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <div className={`p-5 rounded-xl mb-4 ${
                      scenario.options[selectedOption].points >= 80 ? 'bg-green-50 border-2 border-green-400' :
                      scenario.options[selectedOption].points >= 40 ? 'bg-amber-50 border-2 border-amber-400' :
                      'bg-red-50 border-2 border-red-400'
                    }`}>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">
                          {scenario.options[selectedOption].points >= 80 ? '✅' :
                           scenario.options[selectedOption].points >= 40 ? '⚠️' : '❌'}
                        </span>
                        <span className={`font-bold ${
                          scenario.options[selectedOption].points >= 80 ? 'text-green-700' :
                          scenario.options[selectedOption].points >= 40 ? 'text-amber-700' : 'text-red-700'
                        }`}>+{scenario.options[selectedOption].points} points</span>
                      </div>
                      <p className="text-gray-700">{scenario.options[selectedOption].feedback}</p>
                    </div>

                    <button
                      onClick={nextScenario}
                      className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold shadow-lg"
                    >
                      {currentScenario < rateScenarios.length - 1 ? 'Next Scenario' : 'See Results'}
                    </button>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Score Display */}
            <div className="text-center">
              <span className="px-4 py-2 bg-white border border-emerald-300 text-emerald-700 rounded-full text-sm font-medium shadow-sm">
                Score: {score} points
              </span>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

// Quiz Page
const QuizPage = ({ currentQuestion, selectedAnswer, showAnswer, score, onAnswer, onNext, quizComplete, onRetake, navigate }) => {
  if (quizComplete) {
    const passed = score >= 8;
    return (
      <div className="min-h-screen p-6 pt-20 flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-100">
        <motion.div
          className="bg-white rounded-3xl shadow-2xl p-10 text-center max-w-md w-full"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <div className={`w-28 h-28 mx-auto rounded-full flex items-center justify-center mb-6 shadow-xl ${passed ? 'bg-gradient-to-br from-green-400 to-emerald-500' : 'bg-gradient-to-br from-amber-400 to-orange-500'}`}>
            <span className="text-6xl">{passed ? '🏆' : '📚'}</span>
          </div>

          <h2 className="text-3xl font-bold text-gray-800 mb-3">{passed ? 'Outstanding!' : 'Keep Learning!'}</h2>
          <p className="text-xl text-gray-600 mb-6">
            You scored <span className="font-bold text-emerald-600">{score}/{quizQuestions.length}</span> ({(score/quizQuestions.length*100).toFixed(0)}%)
          </p>

          {passed ? (
            <div className="bg-green-50 border-2 border-green-400 rounded-xl p-5 mb-6">
              <p className="text-green-800 font-bold">Congratulations! You passed!</p>
              <p className="text-green-700 text-sm">You've mastered Interest Rates!</p>
            </div>
          ) : (
            <div className="bg-amber-50 border-2 border-amber-400 rounded-xl p-5 mb-6">
              <p className="text-amber-800 font-bold">You need 80% to pass</p>
              <p className="text-amber-700 text-sm">Review the material and try again!</p>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <button onClick={onRetake} className="w-full py-4 rounded-xl bg-slate-800 text-white font-bold hover:bg-slate-700">
              Retake Quiz
            </button>
            <button onClick={() => navigate('/game')} className="w-full py-4 rounded-xl border-2 border-gray-300 text-gray-700 font-bold hover:bg-gray-50">
              Back to Learning Path
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const q = quizQuestions[currentQuestion];

  return (
    <div className="min-h-screen p-6 pt-20 bg-gradient-to-br from-emerald-50 to-teal-100">
      <div className="max-w-3xl mx-auto">
        {/* Progress */}
        <div className="flex justify-center gap-1.5 mb-6">
          {quizQuestions.map((_, idx) => (
            <div
              key={idx}
              className={`h-2 rounded-full transition-all ${
                idx < currentQuestion ? 'w-8 bg-emerald-500' :
                idx === currentQuestion ? 'w-8 bg-emerald-400' : 'w-2 bg-gray-300'
              }`}
            />
          ))}
        </div>

        <motion.div
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="p-6 md:p-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <span className="text-sm font-bold text-emerald-600 uppercase tracking-wider">
                  Question {currentQuestion + 1} of {quizQuestions.length}
                </span>
                <h2 className="text-xl md:text-2xl font-bold text-gray-800 mt-2">{q.question}</h2>
              </div>
              <span className="text-4xl hidden md:block">📈</span>
            </div>

            <div className="space-y-3">
              {q.options.map((option, idx) => {
                const isSelected = selectedAnswer === idx;
                const isCorrect = idx === q.correctIndex;
                const showCorrectness = showAnswer && (isSelected || isCorrect);

                return (
                  <button
                    key={idx}
                    onClick={() => !showAnswer && onAnswer(idx)}
                    disabled={showAnswer}
                    className={`w-full p-4 rounded-xl text-left border-2 transition-all flex items-center gap-3 ${
                      showCorrectness
                        ? isCorrect
                          ? 'bg-green-50 border-green-500 text-green-900'
                          : isSelected
                            ? 'bg-red-50 border-red-500 text-red-900'
                            : 'border-gray-100 opacity-50'
                        : isSelected
                          ? 'bg-emerald-50 border-emerald-500 scale-[1.01]'
                          : 'border-gray-200 hover:border-emerald-400 hover:bg-emerald-50'
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold flex-shrink-0 ${
                      showCorrectness && isCorrect ? 'bg-green-500 text-white' :
                      showCorrectness && isSelected ? 'bg-red-500 text-white' :
                      isSelected ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {String.fromCharCode(65 + idx)}
                    </div>
                    <span className="font-medium flex-1">{option}</span>
                    {showCorrectness && isCorrect && <span className="text-green-600 text-xl">✓</span>}
                    {showCorrectness && isSelected && !isCorrect && <span className="text-red-600 text-xl">✗</span>}
                  </button>
                );
              })}
            </div>

            {showAnswer && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 bg-slate-800 text-white p-6 rounded-xl"
              >
                <h4 className="font-bold text-emerald-400 uppercase tracking-wider text-sm mb-2">Explanation</h4>
                <p className="text-slate-200 mb-4">{q.explanation}</p>
                <button onClick={onNext} className="w-full py-3 bg-white text-slate-800 rounded-lg font-bold hover:bg-emerald-50">
                  {currentQuestion < quizQuestions.length - 1 ? 'Next Question' : 'Complete Quiz'}
                </button>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// Main Component
const InterestRatesModule = () => {
  const navigate = useNavigate();
  const { saveScore, isModulePassed } = useModuleScore();
  const [currentStep, setCurrentStep] = useState(0);
  const [isReviewMode, setIsReviewMode] = useState(false);

  // Quiz state
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState(0);
  const [quizComplete, setQuizComplete] = useState(false);
  const [answers, setAnswers] = useState([]);

  const modulePassed = isModulePassed(MODULES.INTEREST_RATES.id);
  const totalSteps = 4;

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

  const handleAnswer = (idx) => {
    setSelectedAnswer(idx);
    setShowAnswer(true);
  };

  const handleNextQuestion = () => {
    const newAnswers = [...answers, selectedAnswer];
    setAnswers(newAnswers);

    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowAnswer(false);
    } else {
      let finalScore = 0;
      newAnswers.forEach((answer, idx) => {
        if (answer === quizQuestions[idx].correctIndex) finalScore++;
      });
      setScore(finalScore);
      setQuizComplete(true);

      if ((finalScore / quizQuestions.length) * 100 >= 80) {
        saveScore(MODULES.INTEREST_RATES.id, (finalScore / quizQuestions.length) * 100);
      }
    }
  };

  const handleRetake = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowAnswer(false);
    setScore(0);
    setQuizComplete(false);
    setAnswers([]);
  };

  if (modulePassed && !isReviewMode) {
    return (
      <ModuleCompletedScreen
        emoji="📈"
        moduleName="Interest Rates"
        description="You've mastered how interest rates work and affect your finances!"
        gradientClasses="from-emerald-50 via-teal-100 to-cyan-200"
        onReviewClick={() => setIsReviewMode(true)}
      />
    );
  }

  return (
    <div className="min-h-screen relative">
      <button
        className="fixed top-4 left-4 px-4 py-2 rounded-lg text-emerald-700 hover:bg-white/80 backdrop-blur-sm font-medium transition z-50 shadow-sm border border-emerald-200 bg-white/70"
        onClick={() => navigate('/game')}
      >
        ← Back
      </button>

      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
        <div className="bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full shadow-sm border border-gray-200 text-gray-600 font-semibold text-sm">
          {currentStep + 1} / {totalSteps + 1}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {currentStep === 0 && <IntroPage onNext={handleNext} />}
          {currentStep === 1 && <CalculatorPage onNext={handleNext} onPrev={handlePrev} />}
          {currentStep === 2 && <ComparisonPage onNext={handleNext} onPrev={handlePrev} />}
          {currentStep === 3 && <ScenarioGame onNext={handleNext} />}
          {currentStep === 4 && (
            <QuizPage
              currentQuestion={currentQuestion}
              selectedAnswer={selectedAnswer}
              showAnswer={showAnswer}
              score={score}
              onAnswer={handleAnswer}
              onNext={handleNextQuestion}
              quizComplete={quizComplete}
              onRetake={handleRetake}
              navigate={navigate}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default InterestRatesModule;
