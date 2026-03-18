import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useModuleScore, MODULES } from '../hooks/useModuleScore';
import ModuleCompletedScreen from './ModuleCompletedScreen';
import { shuffleQuizOptions } from '../utils/shuffleQuizOptions';

// Quiz questions
const quizQuestions = [
  {
    question: "What is the main difference between a checking and savings account?",
    options: ["Interest rates only", "Checking is for daily transactions, savings is for growing money", "Savings has a debit card", "There is no difference"],
    correctIndex: 1,
    explanation: "Checking accounts are designed for frequent transactions with easy access via debit cards and checks. Savings accounts earn interest and are meant for storing money you don't need immediately."
  },
  {
    question: "What is an overdraft fee?",
    options: ["A fee for opening an account", "A fee charged when you spend more than your balance", "A monthly maintenance fee", "A fee for ATM withdrawals"],
    correctIndex: 1,
    explanation: "An overdraft fee is charged when you spend more money than you have in your account. Banks may cover the transaction but charge $25-$35 per occurrence. This can add up quickly!"
  },
  {
    question: "Which type of card directly deducts money from your bank account?",
    options: ["Credit card", "Gift card", "Debit card", "Rewards card"],
    correctIndex: 2,
    explanation: "A debit card is linked directly to your checking account and immediately deducts money when you make a purchase. Credit cards borrow money that you pay back later."
  },
  {
    question: "What does FDIC insurance protect?",
    options: ["Your credit score", "Your deposits up to $250,000 per bank", "Your interest rates", "Your credit card rewards"],
    correctIndex: 1,
    explanation: "The Federal Deposit Insurance Corporation (FDIC) insures your bank deposits up to $250,000 per depositor, per bank. This means your money is safe even if the bank fails."
  },
  {
    question: "What is a common way to avoid monthly maintenance fees?",
    options: ["Use cash only", "Maintain a minimum balance or set up direct deposit", "Close the account monthly", "Never use the debit card"],
    correctIndex: 1,
    explanation: "Most banks waive monthly fees if you maintain a minimum balance (like $500-$1,500) or have direct deposit set up. Always read the fee schedule when opening an account."
  },
  {
    question: "What is APY in banking?",
    options: ["Annual Payment Yearly", "Annual Percentage Yield - the real return on savings", "Account Protection Yearly", "Automatic Payment Year"],
    correctIndex: 1,
    explanation: "APY (Annual Percentage Yield) shows the real rate of return on your savings, including compound interest. A higher APY means your money grows faster."
  },
  {
    question: "Which is typically safer for online purchases?",
    options: ["Debit card", "Credit card", "Cash", "Check"],
    correctIndex: 1,
    explanation: "Credit cards offer better fraud protection. If someone steals your credit card info, you're disputing charges to someone else's money. With debit, the money is already gone from YOUR account."
  },
  {
    question: "What is a wire transfer?",
    options: ["A type of credit card", "An electronic transfer of funds between banks", "A paper check", "An ATM withdrawal"],
    correctIndex: 1,
    explanation: "A wire transfer is an electronic transfer of money between banks. It's fast but often has fees ($15-$50). Commonly used for large transactions like home purchases."
  },
  {
    question: "What should you check monthly to catch fraud early?",
    options: ["Your credit limit", "Your bank statements", "Your ATM card expiration", "Your bank's hours"],
    correctIndex: 1,
    explanation: "Review your bank statements monthly to spot unauthorized transactions. The sooner you report fraud, the easier it is to recover your money. Many banks have zero-liability policies if reported quickly."
  },
  {
    question: "What is the benefit of high-yield savings accounts?",
    options: ["No fees ever", "Higher interest rates than traditional savings", "Free checks", "Unlimited transactions"],
    correctIndex: 1,
    explanation: "High-yield savings accounts (often from online banks) offer interest rates 10-20x higher than traditional banks. Your money grows faster while still being FDIC insured."
  }
];

// Account types data
const accountTypes = [
  {
    name: "Checking Account",
    icon: "💳",
    color: "from-blue-500 to-blue-600",
    purpose: "Daily transactions & bill payments",
    features: ["Debit card access", "Check writing", "Direct deposit", "Online bill pay"],
    bestFor: "Everyday spending and paying bills",
    interest: "Little to none (0.01%)"
  },
  {
    name: "Savings Account",
    icon: "🐷",
    color: "from-green-500 to-green-600",
    purpose: "Growing your money over time",
    features: ["Earns interest", "Limited withdrawals", "Emergency fund storage", "Goal savings"],
    bestFor: "Building an emergency fund or saving for goals",
    interest: "0.5% - 5% APY"
  },
  {
    name: "High-Yield Savings",
    icon: "📈",
    color: "from-purple-500 to-purple-600",
    purpose: "Maximize savings growth",
    features: ["10-20x higher interest", "FDIC insured", "Online banks", "No minimum often"],
    bestFor: "Serious savers who want their money to work harder",
    interest: "4% - 5%+ APY"
  },
  {
    name: "Money Market",
    icon: "💰",
    color: "from-amber-500 to-amber-600",
    purpose: "Higher rates with some check-writing",
    features: ["Higher rates than savings", "Limited check writing", "Higher minimums", "Tiered rates"],
    bestFor: "Larger balances you want accessible but earning more",
    interest: "3% - 5% APY"
  }
];

// Bank fees data
const bankFees = [
  { name: "Overdraft Fee", amount: "$25-$35", icon: "⚠️", description: "Charged when you spend more than your balance", avoidance: "Enable overdraft protection or link to savings" },
  { name: "Monthly Maintenance", amount: "$5-$15", icon: "📅", description: "Monthly charge just for having the account", avoidance: "Maintain minimum balance or set up direct deposit" },
  { name: "ATM Fee (Out of Network)", amount: "$2-$5", icon: "🏧", description: "Using another bank's ATM", avoidance: "Use in-network ATMs or get an account with ATM rebates" },
  { name: "Wire Transfer", amount: "$15-$50", icon: "📤", description: "Sending money electronically to another bank", avoidance: "Use free alternatives like Zelle or ACH transfers" },
  { name: "Paper Statement", amount: "$2-$5", icon: "📄", description: "Receiving statements by mail", avoidance: "Switch to electronic statements (usually free)" },
  { name: "Foreign Transaction", amount: "1-3%", icon: "✈️", description: "Purchases in foreign currency", avoidance: "Use cards with no foreign transaction fees" }
];

// Debit vs Credit comparison
const cardComparison = [
  { feature: "Source of Funds", debit: "Your bank account", credit: "Borrowed from bank" },
  { feature: "Payment Timing", debit: "Immediate deduction", credit: "Pay later (by due date)" },
  { feature: "Fraud Protection", debit: "Limited - your money at risk", credit: "Strong - not your money" },
  { feature: "Credit Building", debit: "No impact", credit: "Builds credit history" },
  { feature: "Interest Charges", debit: "None", credit: "High if balance carried" },
  { feature: "Overspending Risk", debit: "Limited to balance", credit: "Can accumulate debt" }
];

// Interactive game - Categorize transactions
const transactionGame = [
  { item: "Emergency fund savings", correct: "savings", icon: "🆘" },
  { item: "Rent payment", correct: "checking", icon: "🏠" },
  { item: "Vacation fund", correct: "savings", icon: "✈️" },
  { item: "Grocery shopping", correct: "checking", icon: "🛒" },
  { item: "Car insurance payment", correct: "checking", icon: "🚗" },
  { item: "Down payment savings", correct: "savings", icon: "🏡" },
  { item: "Utility bills", correct: "checking", icon: "💡" },
  { item: "Investment buffer", correct: "savings", icon: "📊" }
];

// Page Components
const IntroPage = ({ onNext }) => (
  <div className="min-h-screen p-6 pt-20" style={{ background: 'linear-gradient(135deg, #e0f2fe 0%, #dbeafe 50%, #e0e7ff 100%)' }}>
    <div className="max-w-5xl mx-auto">
      <motion.div className="text-center mb-12" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-8xl mb-6">🏦</div>
        <h1 className="text-5xl font-bold mb-4 text-gray-800">Banking Basics</h1>
        <p className="text-xl text-gray-600">Master the foundation of personal finance</p>
      </motion.div>

      <div className="space-y-6 mb-12">
        <motion.div className="p-8 rounded-3xl shadow-xl bg-white" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg flex-shrink-0">
              <span className="text-3xl">🎯</span>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">Why Banking Matters</h3>
              <p className="text-gray-700 text-lg leading-relaxed">
                Your bank accounts are the <span className="font-semibold text-blue-600">central hub of your financial life</span>.
                Understanding how they work helps you avoid fees, earn more interest, and protect your money.
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div className="p-8 rounded-3xl shadow-xl bg-white" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg flex-shrink-0">
              <span className="text-3xl">📚</span>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">What You'll Learn</h3>
              <div className="grid md:grid-cols-2 gap-3">
                {["Checking vs Savings accounts", "How to avoid bank fees", "Debit vs Credit cards", "FDIC protection", "High-yield savings", "Smart banking habits"].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-gray-700">
                    <span className="text-green-500 font-bold">✓</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div className="p-8 rounded-3xl shadow-xl bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg flex-shrink-0">
              <span className="text-3xl">💡</span>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">Did You Know?</h3>
              <p className="text-gray-700 text-lg leading-relaxed">
                Americans pay over <span className="font-bold text-red-600">$8 billion in overdraft fees</span> every year.
                Learning to manage your accounts can save you hundreds annually!
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="flex justify-center">
        <button onClick={onNext} className="px-10 py-4 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all">
          Let's Get Started →
        </button>
      </div>
    </div>
  </div>
);

const AccountTypesPage = ({ onNext, onPrev }) => {
  const [selectedAccount, setSelectedAccount] = useState(null);

  return (
    <div className="min-h-screen p-6 pt-20" style={{ background: 'linear-gradient(135deg, #e0f2fe 0%, #dbeafe 50%, #e0e7ff 100%)' }}>
      <div className="max-w-6xl mx-auto">
        <motion.div className="text-center mb-10" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h1 className="text-4xl font-bold mb-4 text-gray-800">Types of Bank Accounts</h1>
          <p className="text-xl text-gray-600">Click on each account type to learn more</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 mb-10">
          {accountTypes.map((account, idx) => (
            <motion.div
              key={idx}
              className={`p-6 rounded-2xl shadow-lg bg-white cursor-pointer transition-all ${selectedAccount === idx ? 'ring-4 ring-blue-400 scale-[1.02]' : 'hover:shadow-xl'}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => setSelectedAccount(selectedAccount === idx ? null : idx)}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${account.color} flex items-center justify-center shadow-lg`}>
                  <span className="text-2xl">{account.icon}</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{account.name}</h3>
                  <p className="text-gray-600 text-sm">{account.purpose}</p>
                </div>
              </div>

              <AnimatePresence>
                {selectedAccount === idx && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-4 border-t border-gray-100 space-y-4">
                      <div className="bg-gray-50 p-4 rounded-xl">
                        <p className="text-sm font-semibold text-gray-600 mb-2">Key Features</p>
                        <div className="flex flex-wrap gap-2">
                          {account.features.map((f, i) => (
                            <span key={i} className="px-3 py-1 bg-white rounded-full text-sm text-gray-700 shadow-sm">{f}</span>
                          ))}
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm text-gray-500">Best For</p>
                          <p className="font-semibold text-gray-800">{account.bestFor}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Interest Rate</p>
                          <p className="font-bold text-green-600">{account.interest}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        <div className="flex justify-center gap-4">
          <button onClick={onPrev} className="px-8 py-4 rounded-2xl border-2 border-blue-400 bg-white text-blue-600 font-semibold text-lg shadow-lg hover:bg-blue-50">
            ← Back
          </button>
          <button onClick={onNext} className="px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold text-lg shadow-lg hover:shadow-xl">
            Continue →
          </button>
        </div>
      </div>
    </div>
  );
};

const FeesPage = ({ onNext, onPrev }) => (
  <div className="min-h-screen p-6 pt-20" style={{ background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 50%, #fcd34d 100%)' }}>
    <div className="max-w-5xl mx-auto">
      <motion.div className="text-center mb-10" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="text-6xl mb-4">💸</div>
        <h1 className="text-4xl font-bold mb-4 text-gray-800">Bank Fees to Avoid</h1>
        <p className="text-xl text-gray-600">Don't let fees eat into your hard-earned money</p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-4 mb-10">
        {bankFees.map((fee, idx) => (
          <motion.div
            key={idx}
            className="p-5 rounded-2xl bg-white shadow-lg border-l-4 border-red-400"
            initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <div className="flex items-start gap-4">
              <span className="text-3xl">{fee.icon}</span>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-gray-800">{fee.name}</h3>
                  <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-bold">{fee.amount}</span>
                </div>
                <p className="text-gray-600 text-sm mb-3">{fee.description}</p>
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-green-700 text-sm"><span className="font-bold">💡 Avoid it:</span> {fee.avoidance}</p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        className="bg-gradient-to-r from-green-500 to-emerald-500 p-8 rounded-3xl text-white shadow-xl mb-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <h3 className="text-2xl font-bold mb-3">🎯 Pro Tip: Fee-Free Banking</h3>
        <p className="text-lg opacity-90">
          Many online banks like <span className="font-bold">Ally, Marcus, and Discover</span> offer accounts with
          no monthly fees, no minimum balance, and ATM fee rebates. Shop around!
        </p>
      </motion.div>

      <div className="flex justify-center gap-4">
        <button onClick={onPrev} className="px-8 py-4 rounded-2xl border-2 border-amber-500 bg-white text-amber-600 font-semibold text-lg shadow-lg hover:bg-amber-50">
          ← Back
        </button>
        <button onClick={onNext} className="px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold text-lg shadow-lg hover:shadow-xl">
          Continue →
        </button>
      </div>
    </div>
  </div>
);

const DebitVsCreditPage = ({ onNext, onPrev }) => (
  <div className="min-h-screen p-6 pt-20" style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 50%, #bbf7d0 100%)' }}>
    <div className="max-w-5xl mx-auto">
      <motion.div className="text-center mb-10" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-4xl font-bold mb-4 text-gray-800">Debit vs Credit Cards</h1>
        <p className="text-xl text-gray-600">Understanding when to use each type</p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-8 mb-10">
        {/* Debit Card */}
        <motion.div
          className="bg-white rounded-3xl shadow-xl p-8 border-t-4 border-blue-500"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <span className="text-3xl">💳</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Debit Card</h2>
              <p className="text-blue-600 font-semibold">Your Money</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="p-4 bg-blue-50 rounded-xl">
              <p className="font-semibold text-gray-800">✓ Best for: Daily purchases & ATM access</p>
            </div>
            <div className="p-4 bg-green-50 rounded-xl">
              <p className="text-green-700">✓ Can't go into debt</p>
            </div>
            <div className="p-4 bg-red-50 rounded-xl">
              <p className="text-red-700">✗ Less fraud protection</p>
            </div>
          </div>
        </motion.div>

        {/* Credit Card */}
        <motion.div
          className="bg-white rounded-3xl shadow-xl p-8 border-t-4 border-purple-500"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
              <span className="text-3xl">💎</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Credit Card</h2>
              <p className="text-purple-600 font-semibold">Bank's Money</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="p-4 bg-purple-50 rounded-xl">
              <p className="font-semibold text-gray-800">✓ Best for: Online shopping & building credit</p>
            </div>
            <div className="p-4 bg-green-50 rounded-xl">
              <p className="text-green-700">✓ Strong fraud protection & rewards</p>
            </div>
            <div className="p-4 bg-red-50 rounded-xl">
              <p className="text-red-700">✗ Risk of debt if not paid in full</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Comparison Table */}
      <motion.div
        className="bg-white rounded-3xl shadow-xl overflow-hidden mb-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="bg-gray-800 text-white p-4">
          <h3 className="text-xl font-bold text-center">Side-by-Side Comparison</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {cardComparison.map((row, idx) => (
            <div key={idx} className="grid grid-cols-3 gap-4 p-4 hover:bg-gray-50">
              <div className="font-semibold text-gray-800">{row.feature}</div>
              <div className="text-blue-600">{row.debit}</div>
              <div className="text-purple-600">{row.credit}</div>
            </div>
          ))}
        </div>
      </motion.div>

      <div className="flex justify-center gap-4">
        <button onClick={onPrev} className="px-8 py-4 rounded-2xl border-2 border-green-500 bg-white text-green-600 font-semibold text-lg shadow-lg hover:bg-green-50">
          ← Back
        </button>
        <button onClick={onNext} className="px-8 py-4 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold text-lg shadow-lg hover:shadow-xl">
          Continue →
        </button>
      </div>
    </div>
  </div>
);

const GamePage = ({ onNext, onPrev }) => {
  const [currentItem, setCurrentItem] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [gameComplete, setGameComplete] = useState(false);

  const handleChoice = (choice) => {
    const correct = transactionGame[currentItem].correct === choice;
    if (correct) setScore(score + 1);
    setFeedback(correct ? 'correct' : 'incorrect');

    setTimeout(() => {
      setFeedback(null);
      if (currentItem < transactionGame.length - 1) {
        setCurrentItem(currentItem + 1);
      } else {
        setGameComplete(true);
      }
    }, 1000);
  };

  if (gameComplete) {
    return (
      <div className="min-h-screen p-6 pt-20 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #dbeafe 0%, #e0e7ff 50%, #ede9fe 100%)' }}>
        <motion.div
          className="bg-white rounded-3xl shadow-2xl p-12 text-center max-w-lg"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <div className="text-6xl mb-6">{score >= 6 ? '🏆' : '📚'}</div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Game Complete!</h2>
          <p className="text-xl text-gray-600 mb-6">You got <span className="font-bold text-blue-600">{score}/{transactionGame.length}</span> correct</p>

          <div className={`p-4 rounded-xl mb-8 ${score >= 6 ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
            {score >= 6 ? "Great job! You know where your money should go!" : "Keep practicing to master account management!"}
          </div>

          <button onClick={onNext} className="px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold text-lg shadow-lg hover:shadow-xl">
            Continue to Quiz →
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 pt-20" style={{ background: 'linear-gradient(135deg, #dbeafe 0%, #e0e7ff 50%, #ede9fe 100%)' }}>
      <div className="max-w-3xl mx-auto">
        <motion.div className="text-center mb-10" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h1 className="text-4xl font-bold mb-4 text-gray-800">Account Sorting Game</h1>
          <p className="text-xl text-gray-600">Where should this money go?</p>
          <div className="mt-4 text-lg">
            <span className="px-4 py-2 bg-white rounded-full shadow">Score: {score}/{currentItem}</span>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentItem}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-3xl shadow-2xl p-10 text-center mb-8"
          >
            <div className="text-6xl mb-4">{transactionGame[currentItem].icon}</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-8">{transactionGame[currentItem].item}</h2>

            {feedback ? (
              <div className={`text-4xl ${feedback === 'correct' ? 'text-green-500' : 'text-red-500'}`}>
                {feedback === 'correct' ? '✓ Correct!' : '✗ Not quite!'}
              </div>
            ) : (
              <div className="flex justify-center gap-6">
                <button
                  onClick={() => handleChoice('checking')}
                  className="px-8 py-6 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white font-bold text-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                >
                  💳 Checking
                </button>
                <button
                  onClick={() => handleChoice('savings')}
                  className="px-8 py-6 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 text-white font-bold text-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                >
                  🐷 Savings
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-center gap-2">
          {transactionGame.map((_, idx) => (
            <div key={idx} className={`w-3 h-3 rounded-full ${idx < currentItem ? 'bg-blue-500' : idx === currentItem ? 'bg-blue-300' : 'bg-gray-300'}`} />
          ))}
        </div>
      </div>
    </div>
  );
};

const QuizPage = ({ currentQuestion, selectedAnswer, showAnswer, score, onAnswer, onNext, quizComplete, onRetake, navigate, questions }) => {
  if (quizComplete) {
    const passed = score >= 8;
    return (
      <div className="min-h-screen p-6 pt-20 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #e0f2fe 0%, #dbeafe 50%, #e0e7ff 100%)' }}>
        <motion.div
          className="bg-white rounded-3xl shadow-2xl p-12 text-center max-w-lg"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <div className={`w-32 h-32 mx-auto rounded-full flex items-center justify-center mb-8 shadow-2xl ${passed ? 'bg-green-500' : 'bg-amber-500'}`}>
            <span className="text-6xl">{passed ? '🏆' : '📚'}</span>
          </div>

          <h2 className="text-4xl font-bold text-gray-800 mb-4">{passed ? 'Outstanding!' : 'Keep Learning!'}</h2>
          <p className="text-2xl text-gray-600 mb-8">
            You scored <span className="font-bold text-blue-600">{score}/{questions.length}</span> ({(score/questions.length*100).toFixed(0)}%)
          </p>

          {passed ? (
            <div className="bg-green-50 border-2 border-green-500 rounded-2xl p-6 mb-8">
              <p className="text-green-800 font-bold text-lg">🎊 Congratulations! You passed!</p>
              <p className="text-green-700">You've mastered Banking Basics!</p>
            </div>
          ) : (
            <div className="bg-amber-50 border-2 border-amber-500 rounded-2xl p-6 mb-8">
              <p className="text-amber-800 font-bold text-lg">You need 80% to pass</p>
              <p className="text-amber-700">Review the material and try again!</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={onRetake} className="px-8 py-4 rounded-xl bg-gray-800 text-white font-bold text-lg hover:bg-gray-700">
              Retake Quiz
            </button>
            <button onClick={() => navigate('/game')} className="px-8 py-4 rounded-xl border-2 border-gray-300 text-gray-700 font-bold text-lg hover:bg-gray-50">
              Back to Learning Path
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const q = questions[currentQuestion];

  return (
    <div className="min-h-screen p-6 pt-20" style={{ background: 'linear-gradient(135deg, #e0f2fe 0%, #dbeafe 50%, #e0e7ff 100%)' }}>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="p-8 lg:p-12">
            <div className="flex justify-between items-center mb-8 pb-6 border-b border-gray-100">
              <div>
                <span className="text-sm font-bold text-blue-600 uppercase tracking-wider">Question {currentQuestion + 1} of {questions.length}</span>
                <h2 className="text-2xl lg:text-3xl font-bold text-gray-800 mt-2">{q.question}</h2>
              </div>
              <span className="text-5xl hidden lg:block">🏦</span>
            </div>

            <div className="grid gap-4">
              {q.options.map((option, idx) => {
                const isSelected = selectedAnswer === idx;
                const isCorrect = idx === q.correctIndex;
                const showCorrectness = showAnswer && (isSelected || isCorrect);

                return (
                  <button
                    key={idx}
                    onClick={() => !showAnswer && onAnswer(idx)}
                    disabled={showAnswer}
                    className={`p-5 rounded-xl text-left border-2 transition-all flex items-center gap-4 ${
                      showCorrectness
                        ? isCorrect
                          ? 'bg-green-50 border-green-500 text-green-900'
                          : isSelected
                            ? 'bg-red-50 border-red-500 text-red-900'
                            : 'border-gray-100 opacity-50'
                        : isSelected
                          ? 'bg-blue-50 border-blue-500 scale-[1.02]'
                          : 'border-gray-200 hover:border-blue-400 hover:bg-blue-50'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                      showCorrectness && isCorrect ? 'bg-green-500 text-white' :
                      showCorrectness && isSelected ? 'bg-red-500 text-white' :
                      isSelected ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {String.fromCharCode(65 + idx)}
                    </div>
                    <span className="text-lg font-medium flex-1">{option}</span>
                    {showCorrectness && isCorrect && <span className="text-green-600 text-2xl">✓</span>}
                    {showCorrectness && isSelected && !isCorrect && <span className="text-red-600 text-2xl">✗</span>}
                  </button>
                );
              })}
            </div>

            {showAnswer && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 bg-gray-800 text-white p-8 rounded-2xl"
              >
                <h4 className="font-bold text-blue-400 uppercase tracking-wider text-sm mb-2">Explanation</h4>
                <p className="text-lg text-gray-200 mb-6">{q.explanation}</p>
                <button onClick={onNext} className="px-8 py-3 bg-white text-gray-800 rounded-xl font-bold hover:bg-blue-50">
                  {currentQuestion < questions.length - 1 ? 'Next Question' : 'Complete Quiz'}
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Component
const BankingModule = () => {
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
  const [shuffleKey, setShuffleKey] = useState(0);

  const shuffledQuestions = useMemo(() => shuffleQuizOptions(quizQuestions), [shuffleKey]);

  const modulePassed = isModulePassed(MODULES.BANKING.id);
  const totalSteps = 5;

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

    if (currentQuestion < shuffledQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowAnswer(false);
    } else {
      let finalScore = 0;
      newAnswers.forEach((answer, idx) => {
        if (answer === shuffledQuestions[idx].correctIndex) finalScore++;
      });
      setScore(finalScore);
      setQuizComplete(true);

      if ((finalScore / shuffledQuestions.length) * 100 >= 80) {
        saveScore(MODULES.BANKING.id, (finalScore / shuffledQuestions.length) * 100);
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
    setShuffleKey(k => k + 1);
  };

  if (modulePassed && !isReviewMode) {
    return (
      <ModuleCompletedScreen
        emoji="🏦"
        moduleName="Banking Basics"
        description="You've mastered bank accounts, fees, and card types!"
        gradientClasses="from-blue-50 via-indigo-100 to-purple-200"
        onReviewClick={() => setIsReviewMode(true)}
      />
    );
  }

  return (
    <div className="min-h-screen relative">
      {/* Navigation */}
      <button
        className="fixed top-4 left-4 px-4 py-2 rounded-lg text-blue-600 hover:bg-white/80 backdrop-blur-sm font-medium transition z-50 shadow-sm border border-blue-100 bg-white/50"
        onClick={() => navigate('/game')}
      >
        ← Back to Learning Path
      </button>

      <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50">
        <div className="bg-white/80 backdrop-blur-md px-4 py-1.5 rounded-full shadow-sm border border-gray-100 text-gray-600 font-semibold text-sm">
          Step {currentStep + 1} of {totalSteps + 1}
        </div>
      </div>

      {currentStep > 0 && currentStep < totalSteps && (
        <button onClick={handlePrev} className="fixed left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 z-40 flex items-center justify-center">←</button>
      )}
      {currentStep < totalSteps - 1 && (
        <button onClick={handleNext} className="fixed right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 z-40 flex items-center justify-center">→</button>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {currentStep === 0 && <IntroPage onNext={handleNext} />}
          {currentStep === 1 && <AccountTypesPage onNext={handleNext} onPrev={handlePrev} />}
          {currentStep === 2 && <FeesPage onNext={handleNext} onPrev={handlePrev} />}
          {currentStep === 3 && <DebitVsCreditPage onNext={handleNext} onPrev={handlePrev} />}
          {currentStep === 4 && <GamePage onNext={handleNext} onPrev={handlePrev} />}
          {currentStep === 5 && (
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
              questions={shuffledQuestions}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default BankingModule;
