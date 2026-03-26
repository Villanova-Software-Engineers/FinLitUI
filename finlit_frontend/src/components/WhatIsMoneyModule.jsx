import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useModuleScore, MODULES } from '../hooks/useModuleScore';
import ModuleCompletedScreen from './ModuleCompletedScreen';
import { shuffleQuizOptions } from '../utils/shuffleQuizOptions';

// 10 Quiz Questions with explanations
const quizQuestions = [
  {
    question: "What is the primary function of money?",
    options: ["To show wealth", "A medium of exchange, store of value, and unit of account", "Only for saving", "Government control"],
    correctIndex: 1,
    explanation: "Money serves three main functions: it's a medium of exchange (you can trade it for goods/services), a store of value (saves your wealth), and a unit of account (measures value)."
  },
  {
    question: "What gives money its value?",
    options: ["The paper it's printed on", "Trust and acceptance by others", "The government building", "Gold reserves only"],
    correctIndex: 1,
    explanation: "Modern currency is based on trust. Money has value because people accept it in exchange for goods and services. This collective agreement gives it purchasing power."
  },
  {
    question: "What is inflation?",
    options: ["Money growing in banks", "Prices going up over time, reducing purchasing power", "Interest rates", "Stock market growth"],
    correctIndex: 1,
    explanation: "Inflation is when the general price level of goods and services rises over time, meaning your money buys less. A $100 item today might cost $103 next year with 3% inflation."
  },
  {
    question: "Why is setting financial goals important?",
    options: ["It's not important", "Gives direction and motivation for saving and spending", "Only rich people need goals", "Banks require it"],
    correctIndex: 1,
    explanation: "Financial goals help you prioritize spending, stay motivated to save, and make informed decisions. Whether short-term (vacation) or long-term (retirement), goals guide your financial journey."
  },
  {
    question: "What is the time value of money?",
    options: ["How long money lasts", "Money today is worth more than the same amount in the future", "Time spent earning money", "Working hours per dollar"],
    correctIndex: 1,
    explanation: "The time value of money means $100 today is worth more than $100 in the future because you can invest it now and earn returns. This is why starting to save early is powerful."
  },
  {
    question: "What should be your first financial goal?",
    options: ["Buying a house", "Building an emergency fund", "Investing in stocks", "Getting a credit card"],
    correctIndex: 1,
    explanation: "An emergency fund (3-6 months of expenses) should be your first priority. It protects you from unexpected costs and prevents you from going into debt when emergencies happen."
  },
  {
    question: "What is purchasing power?",
    options: ["How much you can buy", "What your money can actually buy in goods and services", "Your credit limit", "Your salary"],
    correctIndex: 1,
    explanation: "Purchasing power is the amount of goods or services your money can buy. Inflation reduces purchasing power over time - what $100 bought 10 years ago is more than what it buys today."
  },
  {
    question: "What's the difference between saving and investing?",
    options: ["No difference", "Saving is for short-term safety, investing is for long-term growth", "Saving is better", "Investing is gambling"],
    correctIndex: 1,
    explanation: "Saving (like in a savings account) keeps money safe for short-term needs with low returns. Investing (stocks, bonds) aims for higher long-term growth but involves more risk."
  },
  {
    question: "What is a SMART financial goal?",
    options: ["Any goal that sounds good", "Specific, Measurable, Achievable, Relevant, Time-bound", "Goals only smart people set", "Goals about stocks"],
    correctIndex: 1,
    explanation: "SMART goals are: Specific (clear), Measurable (track progress), Achievable (realistic), Relevant (aligns with values), Time-bound (has a deadline). Example: 'Save $5,000 for emergency fund by December 2026.'"
  },
  {
    question: "Why do people say 'pay yourself first'?",
    options: ["Give yourself a salary", "Save/invest before spending on other things", "Always buy what you want first", "Pay your bills first"],
    correctIndex: 1,
    explanation: "'Pay yourself first' means setting aside savings or investments as soon as you get paid, before spending on anything else. This ensures you prioritize your financial future."
  }
];

// Intro Page
const IntroPage = ({ handleNext }) => (
  <div className="max-w-5xl mx-auto pt-16">
    <motion.div className="text-center mb-12" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
      <h1 className="text-5xl font-bold mb-4 text-gray-800">💵 What is Money?</h1>
      <p className="text-xl text-gray-600">Understanding the fundamentals of money and financial planning</p>
    </motion.div>

    <div className="space-y-6 mb-12">
      <motion.div className="p-8 rounded-3xl shadow-xl bg-white" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-500 flex items-center justify-center shadow-lg flex-shrink-0">
            <span className="text-3xl">🤔</span>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">What Is Money?</h3>
            <p className="text-gray-700 text-lg leading-relaxed">
              Money is more than just paper and coins. It's a <span className="font-bold text-blue-600">medium of exchange</span> that allows us to trade goods and services.
              It's also a <span className="font-bold text-green-600">store of value</span> that preserves your purchasing power over time.
              And it's a <span className="font-bold text-purple-600">unit of account</span> that helps us measure and compare value.
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div className="p-8 rounded-3xl shadow-xl bg-white" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-green-500 flex items-center justify-center shadow-lg flex-shrink-0">
            <span className="text-3xl">📜</span>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">A Brief History</h3>
            <p className="text-gray-700 text-lg leading-relaxed">
              Humans started with <span className="font-semibold">bartering</span> (trading goods directly), then moved to commodity money like shells and gold, and eventually to <span className="font-semibold">paper currency</span> backed by governments.
              Today, we even use <span className="font-semibold">digital money</span> and cryptocurrencies!
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div className="p-8 rounded-3xl shadow-xl bg-white" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-purple-500 flex items-center justify-center shadow-lg flex-shrink-0">
            <span className="text-3xl">🎯</span>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Why Understanding Money Matters</h3>
            <div className="space-y-3">
              {[
                "Make smarter financial decisions",
                "Build wealth over time",
                "Achieve your life goals",
                "Protect yourself from inflation",
                "Plan for a secure future"
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
        Continue to Functions of Money →
      </button>
    </div>
  </div>
);

// Functions of Money Page
const FunctionsPage = ({ handlePrev, handleNext }) => {
  const [expandedIndex, setExpandedIndex] = useState(null);

  const functions = [
    {
      icon: "💱",
      title: "Medium of Exchange",
      subtitle: "Trade made easy",
      description: "Money allows you to buy what you need without bartering",
      details: "Instead of trading 5 chickens for a pair of shoes, you can sell chickens for money and use that money to buy shoes. This makes trade much more efficient!",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: "🏦",
      title: "Store of Value",
      subtitle: "Save for the future",
      description: "Money holds its value over time (mostly)",
      details: "You can save money today and use it later. However, inflation can reduce purchasing power, which is why investing is important for long-term savings.",
      color: "from-green-500 to-green-600"
    },
    {
      icon: "📊",
      title: "Unit of Account",
      subtitle: "Measure of value",
      description: "Money provides a common way to measure the value of goods and services",
      details: "Everything has a price in dollars. This makes it easy to compare: 'Is a $50 meal worth more than a $50 concert ticket?' Both cost the same, but you decide based on value to you.",
      color: "from-purple-500 to-purple-600"
    }
  ];

  return (
    <div className="max-w-4xl mx-auto pt-16">
      <motion.h2 className="text-4xl font-bold mb-4 text-center text-gray-800" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        The 3 Functions of Money
      </motion.h2>
      <p className="text-center text-gray-600 mb-8 text-lg">Money serves three essential purposes in our economy</p>

      <div className="grid gap-6 mb-8">
        {functions.map((func, idx) => (
          <motion.div
            key={idx}
            className={`p-6 bg-gradient-to-r ${func.color} rounded-2xl shadow-xl cursor-pointer hover:shadow-2xl transition`}
            onClick={() => setExpandedIndex(expandedIndex === idx ? null : idx)}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-4">
                <div className="text-5xl">{func.icon}</div>
                <div>
                  <h4 className="font-bold text-2xl">{func.title}</h4>
                  <p className="text-lg opacity-90">{func.subtitle}</p>
                  <p className="text-sm mt-1">{func.description}</p>
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
                      💡 {func.details}
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

// Financial Goals Page
const FinancialGoalsPage = ({ handlePrev, handleNext }) => {
  const goals = [
    { icon: "🆘", title: "Emergency Fund", timeframe: "Short-term (1 year)", amount: "$1,000 - $5,000", color: "bg-red-50" },
    { icon: "✈️", title: "Vacation", timeframe: "Medium-term (1-3 years)", amount: "$2,000 - $10,000", color: "bg-blue-50" },
    { icon: "🏠", title: "House Down Payment", timeframe: "Long-term (3-10 years)", amount: "$20,000 - $100,000+", color: "bg-green-50" },
    { icon: "🏖️", title: "Retirement", timeframe: "Very Long-term (20-40 years)", amount: "$500,000 - $2,000,000+", color: "bg-purple-50" }
  ];

  return (
    <div className="max-w-4xl mx-auto pt-16">
      <motion.h2 className="text-4xl font-bold mb-4 text-center text-gray-800" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        Setting Financial Goals
      </motion.h2>
      <p className="text-center text-gray-600 mb-8 text-lg">Your money should have a purpose</p>

      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-8 rounded-3xl shadow-lg mb-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">SMART Goals Framework</h3>
        <div className="grid md:grid-cols-5 gap-4">
          {[
            { letter: "S", word: "Specific", desc: "Clear and well-defined" },
            { letter: "M", word: "Measurable", desc: "Track your progress" },
            { letter: "A", word: "Achievable", desc: "Realistic and attainable" },
            { letter: "R", word: "Relevant", desc: "Aligned with your values" },
            { letter: "T", word: "Time-bound", desc: "Has a deadline" }
          ].map((item, idx) => (
            <motion.div
              key={idx}
              className="bg-white p-4 rounded-xl text-center shadow-md"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
            >
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 text-white rounded-full flex items-center justify-center mx-auto mb-2 text-xl font-bold">
                {item.letter}
              </div>
              <h4 className="font-bold text-gray-800">{item.word}</h4>
              <p className="text-xs text-gray-600">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      <h3 className="text-2xl font-bold text-gray-800 mb-4">Example Financial Goals by Timeline</h3>
      <div className="grid gap-4 mb-8">
        {goals.map((goal, idx) => (
          <motion.div
            key={idx}
            className={`${goal.color} border-2 border-gray-200 p-6 rounded-2xl shadow-md hover:shadow-lg transition`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <div className="flex items-center gap-4">
              <div className="text-5xl">{goal.icon}</div>
              <div className="flex-1">
                <h4 className="font-bold text-xl text-gray-800">{goal.title}</h4>
                <p className="text-gray-600">{goal.timeframe}</p>
                <p className="text-lg font-semibold text-green-700 mt-1">{goal.amount}</p>
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

// Time Value of Money Interactive Page
const TimeValuePage = ({ handlePrev, handleNext }) => {
  const [amount, setAmount] = useState('1000');
  const [years, setYears] = useState('10');
  const [rate, setRate] = useState('7');

  const principal = parseFloat(amount) || 0;
  const time = parseInt(years) || 0;
  const interestRate = parseFloat(rate) / 100 || 0;
  const futureValue = principal * Math.pow((1 + interestRate), time);
  const earnings = futureValue - principal;

  return (
    <div className="max-w-4xl mx-auto pt-16">
      <motion.h2 className="text-4xl font-bold mb-4 text-center text-gray-800" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        Time Value of Money
      </motion.h2>
      <p className="text-center text-gray-600 mb-8 text-lg">Money today is worth more than money tomorrow</p>

      <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
        <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-2xl mb-6">
          <p className="text-center text-lg text-gray-800">
            <span className="font-bold">Key Concept:</span> $100 today can be invested and grow to $200 in the future.
            That's why receiving money NOW is better than receiving it later - you can put it to work earning returns!
          </p>
        </div>

        <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Future Value Calculator</h3>

        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <div>
            <label className="block text-gray-600 font-semibold mb-2">Initial Amount</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg">$</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-lg font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-600 font-semibold mb-2">Years</label>
            <input
              type="number"
              value={years}
              onChange={(e) => setYears(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-lg font-bold"
            />
          </div>

          <div>
            <label className="block text-gray-600 font-semibold mb-2">Return Rate (%)</label>
            <input
              type="number"
              step="0.1"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-lg font-bold"
            />
          </div>
        </div>

        {principal > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-green-500 to-emerald-600 text-white p-8 rounded-2xl text-center"
          >
            <div className="mb-4">
              <p className="text-lg opacity-90">Future Value</p>
              <p className="text-5xl font-black">${futureValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
            <div className="border-t border-white/30 pt-4">
              <p className="text-lg">You invested: ${principal.toLocaleString()}</p>
              <p className="text-lg">You earned: <span className="font-bold">${earnings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></p>
              <p className="text-sm opacity-75 mt-2">That's {((earnings / principal) * 100).toFixed(1)}% growth!</p>
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

// Quiz Page
const QuizPage = ({ currentQuestion, selectedAnswer, showAnswerResult, score, handleAnswerSelect, handleNextQuestion, handlePrev, quizCompleted, resetQuiz, navigate, shuffledQuestions }) => (
  <div className="max-w-4xl mx-auto pt-16">
    {!quizCompleted ? (
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden flex flex-col min-h-[500px]">
        <div className="flex-1 p-8 lg:p-16 flex flex-col justify-center">
          <div className="flex justify-between items-end mb-8 border-b border-gray-100 pb-6">
            <div>
              <span className="text-sm font-bold text-blue-600 uppercase tracking-wider block mb-2">Question {currentQuestion + 1} of {shuffledQuestions.length}</span>
              <h2 className="text-2xl lg:text-4xl font-bold text-slate-900 leading-tight">
                {shuffledQuestions[currentQuestion].question}
              </h2>
            </div>
            <div className="hidden lg:block text-slate-300">
              <span className="text-5xl">💵</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {shuffledQuestions[currentQuestion].options.map((option, idx) => {
              const isSelected = selectedAnswer === idx;
              const isCorrect = idx === shuffledQuestions[currentQuestion].correctIndex;
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
                  {shuffledQuestions[currentQuestion].explanation}
                </p>
              </div>
              <button
                onClick={handleNextQuestion}
                className="w-full md:w-auto px-8 py-4 bg-white text-slate-900 rounded-xl font-bold hover:bg-blue-50 transition-colors whitespace-nowrap"
              >
                {currentQuestion < shuffledQuestions.length - 1 ? 'Next Question' : 'Complete Quiz'}
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
        <p className="text-2xl text-slate-500 mb-10">You scored <span className="font-bold text-slate-900">{score}/{shuffledQuestions.length}</span> ({((score / shuffledQuestions.length) * 100).toFixed(0)}%)</p>

        {score >= 8 ? (
          <div className="bg-green-50 border-2 border-green-500 rounded-2xl p-8 mb-10">
            <p className="text-green-800 font-bold text-xl mb-2">🎊 Congratulations! You passed!</p>
            <p className="text-green-700 text-lg">You've mastered the What is Money module</p>
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
const WhatIsMoneyModule = () => {
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
  const [shuffleKey, setShuffleKey] = useState(0);

  // Shuffle quiz options for randomization
  const shuffledQuestions = useMemo(() => shuffleQuizOptions(quizQuestions), [shuffleKey]);

  const modulePassed = isModulePassed(MODULES.WHAT_IS_MONEY.id);
  const totalSteps = 5; // 0:intro, 1:functions, 2:goals, 3:time-value, 4:quiz

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

    if (currentQuestion < shuffledQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowAnswerResult(false);
    } else {
      let finalScore = 0;
      newAnswers.forEach((answer, idx) => {
        if (answer === shuffledQuestions[idx].correctIndex) {
          finalScore++;
        }
      });
      setScore(finalScore);
      setQuizCompleted(true);

      const percentage = (finalScore / shuffledQuestions.length) * 100;
      if (percentage >= 80) {
        saveScore(MODULES.WHAT_IS_MONEY.id, percentage);
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
    setShuffleKey(prev => prev + 1); // Trigger re-shuffle
  };

  if (modulePassed && !isReviewMode) {
    return (
      <ModuleCompletedScreen
        emoji="💵"
        moduleName="What is Money"
        description="You've already passed the What is Money module. Great job understanding the fundamentals!"
        gradientClasses="from-blue-50 via-purple-100 to-pink-200"
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
          {currentStep === 1 && <FunctionsPage handlePrev={handlePrev} handleNext={handleNext} />}
          {currentStep === 2 && <FinancialGoalsPage handlePrev={handlePrev} handleNext={handleNext} />}
          {currentStep === 3 && <TimeValuePage handlePrev={handlePrev} handleNext={handleNext} />}
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
              shuffledQuestions={shuffledQuestions}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default WhatIsMoneyModule;
