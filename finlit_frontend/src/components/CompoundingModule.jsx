import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useModuleScore, MODULES } from '../hooks/useModuleScore';
import ModuleCompletedScreen from './ModuleCompletedScreen';

// Quiz questions
const quizQuestions = [
  {
    question: "What is compound interest?",
    options: [
      "Interest paid only on the original amount",
      "Interest earned on both principal AND accumulated interest",
      "A type of bank fee",
      "Interest that decreases over time"
    ],
    correctIndex: 1,
    explanation: "Compound interest means you earn interest on your original investment PLUS all the interest you've already earned. This creates exponential growth over time."
  },
  {
    question: "Using the Rule of 72, how long to double your money at 8% interest?",
    options: ["6 years", "8 years", "9 years", "12 years"],
    correctIndex: 2,
    explanation: "Rule of 72: Divide 72 by the interest rate. 72 ÷ 8 = 9 years to double your money."
  },
  {
    question: "Why is starting to invest early so important for compounding?",
    options: [
      "You get special early-bird rates",
      "Time allows your money to multiply exponentially",
      "Banks prefer younger customers",
      "It doesn't really matter when you start"
    ],
    correctIndex: 1,
    explanation: "Time is the most crucial factor in compounding. Starting 10 years earlier can double your final amount because each year builds on the previous growth."
  },
  {
    question: "$1,000 at 10% simple interest for 20 years = $3,000. What about compound interest?",
    options: ["About $3,000", "About $4,500", "About $6,700", "About $10,000"],
    correctIndex: 2,
    explanation: "$1,000 × (1.10)^20 = $6,727. Compound interest more than doubles the simple interest result!"
  },
  {
    question: "Which factor has the BIGGEST impact on compound growth?",
    options: ["Initial investment amount", "Interest rate", "Time invested", "Bank reputation"],
    correctIndex: 2,
    explanation: "While all factors matter, TIME has the biggest impact because compound growth is exponential. More years = dramatically more growth."
  },
  {
    question: "If you double your money 4 times, starting with $1,000, what do you end with?",
    options: ["$4,000", "$8,000", "$16,000", "$32,000"],
    correctIndex: 2,
    explanation: "Each doubling: $1,000 → $2,000 → $4,000 → $8,000 → $16,000. Four doublings = 2^4 = 16 times original."
  },
  {
    question: "What's the best strategy to maximize compound growth?",
    options: [
      "Withdraw interest annually",
      "Reinvest all interest and dividends",
      "Move money between accounts often",
      "Only invest in bonds"
    ],
    correctIndex: 1,
    explanation: "Reinvesting all interest and dividends allows them to compound and generate their own returns."
  },
  {
    question: "High investment fees hurt compounding because:",
    options: [
      "They're illegal",
      "They reduce the amount that can compound",
      "They don't hurt compounding at all",
      "Banks don't allow compounding with fees"
    ],
    correctIndex: 1,
    explanation: "A 2% annual fee vs 0.2% can mean losing hundreds of thousands over a lifetime. Fees take money that could otherwise be compounding."
  },
  {
    question: "Why 'time in the market beats timing the market'?",
    options: [
      "Markets are always unpredictable",
      "Staying invested lets compounding work longer",
      "Day trading is illegal",
      "It's a common myth"
    ],
    correctIndex: 1,
    explanation: "Staying invested continuously allows compounding to work its magic over time, rather than trying to guess market movements."
  },
  {
    question: "At 7% returns, roughly how long to turn $10,000 into $80,000?",
    options: ["About 15 years", "About 20 years", "About 30 years", "About 50 years"],
    correctIndex: 2,
    explanation: "You need 3 doublings: $10K→$20K→$40K→$80K. At 7%, Rule of 72 says ~10 years per doubling. 3 × 10 = 30 years."
  }
];

// Intro Page
const IntroPage = ({ onNext }) => {
  return (
    <div className="min-h-screen p-6 pt-20 bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50">
      <div className="max-w-4xl mx-auto">
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-2xl mb-6 text-white">
            <span className="text-4xl font-bold">x²</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-3">The Power of Compounding</h1>
          <p className="text-xl text-gray-600">Einstein called it the 8th wonder of the world</p>
        </motion.div>

        {/* The Core Concept */}
        <motion.div
          className="bg-white rounded-3xl p-8 shadow-xl mb-8 border border-gray-100"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Simple vs Compound Interest</h2>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Simple Interest */}
            <div className="p-6 rounded-2xl bg-gray-50 border border-gray-200">
              <h3 className="font-bold text-lg text-gray-700 mb-3">Simple Interest</h3>
              <p className="text-gray-600 mb-4">You only earn on your original amount</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span>Year 1:</span>
                  <span className="font-mono">$1,000 + $100 = $1,100</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span>Year 2:</span>
                  <span className="font-mono">$1,000 + $100 = $1,200</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span>Year 10:</span>
                  <span className="font-mono text-gray-500">$2,000</span>
                </div>
                <div className="flex justify-between py-2 font-bold">
                  <span>Year 30:</span>
                  <span className="font-mono">$4,000</span>
                </div>
              </div>
            </div>

            {/* Compound Interest */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-violet-100 border-2 border-purple-200">
              <h3 className="font-bold text-lg text-purple-800 mb-3">Compound Interest</h3>
              <p className="text-purple-700 mb-4">You earn on the growing total</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-2 border-b border-purple-200">
                  <span>Year 1:</span>
                  <span className="font-mono">$1,000 + $100 = $1,100</span>
                </div>
                <div className="flex justify-between py-2 border-b border-purple-200">
                  <span>Year 2:</span>
                  <span className="font-mono">$1,100 + $110 = $1,210</span>
                </div>
                <div className="flex justify-between py-2 border-b border-purple-200">
                  <span>Year 10:</span>
                  <span className="font-mono text-purple-600">$2,594</span>
                </div>
                <div className="flex justify-between py-2 font-bold">
                  <span>Year 30:</span>
                  <span className="font-mono text-purple-700">$17,449</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-purple-600 rounded-xl text-white text-center">
            <p className="font-bold text-lg">4x more with compounding over 30 years!</p>
          </div>
        </motion.div>

        {/* The Snowball Effect */}
        <motion.div
          className="bg-white rounded-2xl p-6 shadow-lg mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="font-bold text-lg text-gray-800 mb-3">Think of it like a snowball...</h3>
          <p className="text-gray-600">
            As a snowball rolls downhill, it picks up more snow. The bigger it gets, the more snow it picks up with each roll.
            Your money works the same way - the more you have, the more interest you earn, which adds to what you have, earning even more interest.
          </p>
        </motion.div>

        <div className="flex justify-center">
          <motion.button
            onClick={onNext}
            className="px-10 py-4 rounded-2xl bg-gradient-to-r from-violet-500 to-purple-600 text-white font-bold text-lg shadow-xl hover:shadow-2xl transition-all"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Explore the Math
          </motion.button>
        </div>
      </div>
    </div>
  );
};

// Interactive Calculator Page
const CalculatorPage = ({ onNext, onPrev }) => {
  const [principal, setPrincipal] = useState(1000);
  const [rate, setRate] = useState(7);
  const [years, setYears] = useState(10);

  const calculations = useMemo(() => {
    const finalAmount = principal * Math.pow(1 + rate / 100, years);
    const totalInterest = finalAmount - principal;
    const simpleInterest = principal * (rate / 100) * years;
    const compoundAdvantage = totalInterest - simpleInterest;
    return {
      finalAmount: Math.round(finalAmount),
      totalInterest: Math.round(totalInterest),
      simpleInterest: Math.round(simpleInterest),
      compoundAdvantage: Math.round(compoundAdvantage)
    };
  }, [principal, rate, years]);

  // Generate growth data points
  const growthData = useMemo(() => {
    const points = [];
    for (let y = 0; y <= years; y += Math.max(1, Math.floor(years / 10))) {
      points.push({
        year: y,
        compound: Math.round(principal * Math.pow(1 + rate / 100, y)),
        simple: Math.round(principal * (1 + (rate / 100) * y))
      });
    }
    if (points[points.length - 1].year !== years) {
      points.push({
        year: years,
        compound: calculations.finalAmount,
        simple: principal + calculations.simpleInterest
      });
    }
    return points;
  }, [principal, rate, years, calculations]);

  return (
    <div className="min-h-screen p-6 pt-20 bg-gradient-to-br from-blue-50 via-indigo-50 to-violet-50">
      <div className="max-w-4xl mx-auto">
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">Compound Growth Calculator</h1>
          <p className="text-gray-600">Adjust the sliders to see how your money grows</p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Controls */}
          <motion.div
            className="bg-white rounded-2xl p-6 shadow-xl"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h3 className="font-bold text-lg text-gray-800 mb-6">Adjust Values</h3>

            <div className="space-y-8">
              <div>
                <div className="flex justify-between mb-2">
                  <label className="font-medium text-gray-700">Starting Amount</label>
                  <span className="font-bold text-indigo-600">${principal.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="50000"
                  step="100"
                  value={principal}
                  onChange={(e) => setPrincipal(Number(e.target.value))}
                  className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <label className="font-medium text-gray-700">Annual Return</label>
                  <span className="font-bold text-purple-600">{rate}%</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="15"
                  step="0.5"
                  value={rate}
                  onChange={(e) => setRate(Number(e.target.value))}
                  className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <label className="font-medium text-gray-700">Time Period</label>
                  <span className="font-bold text-violet-600">{years} years</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="40"
                  value={years}
                  onChange={(e) => setYears(Number(e.target.value))}
                  className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-violet-600"
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
                <span className="text-slate-300">Starting Amount</span>
                <span className="text-xl font-bold">${principal.toLocaleString()}</span>
              </div>

              <div className="flex justify-between items-center p-4 bg-green-500/20 rounded-xl border border-green-400/30">
                <span className="text-green-200">Interest Earned</span>
                <span className="text-xl font-bold text-green-400">+${calculations.totalInterest.toLocaleString()}</span>
              </div>

              <div className="border-t border-white/20 pt-4">
                <div className="flex justify-between items-center p-4 bg-violet-500/20 rounded-xl border border-violet-400/30">
                  <span className="text-violet-200">Final Amount</span>
                  <span className="text-3xl font-bold">${calculations.finalAmount.toLocaleString()}</span>
                </div>
              </div>

              <div className="p-4 bg-amber-500/20 rounded-xl border border-amber-400/30">
                <p className="text-amber-200 text-sm">
                  <span className="font-bold">Compound advantage:</span> ${calculations.compoundAdvantage.toLocaleString()} more than simple interest
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Simple Growth Visualization */}
        <motion.div
          className="bg-white rounded-2xl p-6 shadow-lg mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="font-bold text-lg text-gray-800 mb-4">Growth Over Time</h3>
          <div className="overflow-x-auto">
            <div className="flex gap-4 min-w-max">
              {growthData.map((point, idx) => (
                <div key={idx} className="text-center">
                  <div className="h-32 flex flex-col justify-end gap-1 mb-2">
                    <div
                      className="w-12 bg-gradient-to-t from-violet-500 to-purple-400 rounded-t-lg transition-all"
                      style={{ height: `${(point.compound / calculations.finalAmount) * 100}%`, minHeight: '4px' }}
                    />
                  </div>
                  <p className="text-xs text-gray-500">Year {point.year}</p>
                  <p className="text-sm font-bold text-purple-600">${point.compound.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <div className="flex justify-center gap-4">
          <button onClick={onPrev} className="px-8 py-4 rounded-xl bg-white text-gray-700 font-semibold shadow-lg border border-gray-200 hover:bg-gray-50">
            Back
          </button>
          <button onClick={onNext} className="px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold shadow-lg hover:shadow-xl">
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

// Rule of 72 Page
const RuleOf72Page = ({ onNext, onPrev }) => {
  const [selectedRate, setSelectedRate] = useState(6);

  const yearsToDouble = 72 / selectedRate;

  const rates = [4, 6, 8, 10, 12];

  return (
    <div className="min-h-screen p-6 pt-20 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      <div className="max-w-4xl mx-auto">
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">The Rule of 72</h1>
          <p className="text-gray-600">A quick way to estimate how long it takes to double your money</p>
        </motion.div>

        {/* The Formula */}
        <motion.div
          className="bg-white rounded-3xl p-8 shadow-xl mb-8 text-center"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl text-white mb-6">
            <span className="text-2xl font-bold">72 ÷ Interest Rate = Years to Double</span>
          </div>

          <p className="text-gray-600 max-w-lg mx-auto">
            Want to know how long until your $10,000 becomes $20,000? Just divide 72 by your interest rate.
          </p>
        </motion.div>

        {/* Interactive Example */}
        <motion.div
          className="bg-white rounded-2xl p-6 shadow-lg mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="font-bold text-lg text-gray-800 mb-6 text-center">Try Different Rates</h3>

          <div className="flex justify-center gap-2 mb-8">
            {rates.map((rate) => (
              <button
                key={rate}
                onClick={() => setSelectedRate(rate)}
                className={`px-5 py-3 rounded-xl font-bold transition-all ${
                  selectedRate === rate
                    ? 'bg-amber-500 text-white shadow-lg scale-105'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {rate}%
              </button>
            ))}
          </div>

          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-8 text-center border-2 border-amber-200">
            <p className="text-gray-600 mb-2">At {selectedRate}% annual returns</p>
            <div className="text-5xl font-bold text-amber-600 mb-2">
              {yearsToDouble.toFixed(1)} years
            </div>
            <p className="text-gray-600">to double your money</p>
          </div>
        </motion.div>

        {/* Doubling Chain Example */}
        <motion.div
          className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-6 text-white mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="font-bold text-lg mb-4">See the Power of Doublings</h3>
          <p className="text-slate-400 mb-4">Starting with $10,000 at {selectedRate}% returns:</p>

          <div className="flex flex-wrap items-center gap-3">
            {[0, 1, 2, 3, 4].map((doubling) => {
              const years = Math.round(doubling * yearsToDouble);
              const amount = 10000 * Math.pow(2, doubling);
              return (
                <React.Fragment key={doubling}>
                  <div className="bg-white/10 rounded-xl p-4 text-center">
                    <p className="text-xs text-slate-400 mb-1">Year {years}</p>
                    <p className="text-lg font-bold">${amount.toLocaleString()}</p>
                  </div>
                  {doubling < 4 && (
                    <span className="text-slate-500 text-xl">→</span>
                  )}
                </React.Fragment>
              );
            })}
          </div>
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

// Time Matters Page
const TimeMattersPage = ({ onNext, onPrev }) => {
  return (
    <div className="min-h-screen p-6 pt-20 bg-gradient-to-br from-rose-50 via-pink-50 to-fuchsia-50">
      <div className="max-w-4xl mx-auto">
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">Time is Your Superpower</h1>
          <p className="text-gray-600">Starting early matters more than how much you invest</p>
        </motion.div>

        {/* The Tale of Two Investors */}
        <motion.div
          className="bg-white rounded-3xl p-8 shadow-xl mb-8"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">Two Investors, One Lesson</h2>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Early Investor */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-100 border-2 border-green-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center text-white font-bold">A</div>
                <div>
                  <h3 className="font-bold text-green-800">Alex (Early Start)</h3>
                  <p className="text-sm text-green-600">Starts at age 25</p>
                </div>
              </div>

              <div className="space-y-3 text-sm mb-4">
                <div className="flex justify-between py-2 border-b border-green-200">
                  <span className="text-gray-600">Invests</span>
                  <span className="font-bold">$200/month</span>
                </div>
                <div className="flex justify-between py-2 border-b border-green-200">
                  <span className="text-gray-600">For</span>
                  <span className="font-bold">10 years (stops at 35)</span>
                </div>
                <div className="flex justify-between py-2 border-b border-green-200">
                  <span className="text-gray-600">Total invested</span>
                  <span className="font-bold">$24,000</span>
                </div>
              </div>

              <div className="bg-green-500 rounded-xl p-4 text-white text-center">
                <p className="text-sm opacity-80">At age 65</p>
                <p className="text-3xl font-bold">$509,605</p>
              </div>
            </div>

            {/* Late Investor */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-red-50 to-rose-100 border-2 border-red-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center text-white font-bold">J</div>
                <div>
                  <h3 className="font-bold text-red-800">Jordan (Late Start)</h3>
                  <p className="text-sm text-red-600">Starts at age 35</p>
                </div>
              </div>

              <div className="space-y-3 text-sm mb-4">
                <div className="flex justify-between py-2 border-b border-red-200">
                  <span className="text-gray-600">Invests</span>
                  <span className="font-bold">$200/month</span>
                </div>
                <div className="flex justify-between py-2 border-b border-red-200">
                  <span className="text-gray-600">For</span>
                  <span className="font-bold">30 years (until 65)</span>
                </div>
                <div className="flex justify-between py-2 border-b border-red-200">
                  <span className="text-gray-600">Total invested</span>
                  <span className="font-bold">$72,000</span>
                </div>
              </div>

              <div className="bg-red-500 rounded-xl p-4 text-white text-center">
                <p className="text-sm opacity-80">At age 65</p>
                <p className="text-3xl font-bold">$298,072</p>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-purple-100 rounded-xl text-center border border-purple-200">
            <p className="text-purple-800 font-bold">
              Alex invested 3x LESS but ended up with 70% MORE!
            </p>
          </div>
        </motion.div>

        {/* Key Takeaway */}
        <motion.div
          className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 text-white mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="font-bold text-lg mb-2">The Key Takeaway</h3>
          <p className="text-purple-100">
            Every year you wait costs you significantly. The best time to start investing was yesterday.
            The second best time is today. Even small amounts grow into large sums with enough time.
          </p>
        </motion.div>

        <div className="flex justify-center gap-4">
          <button onClick={onPrev} className="px-8 py-4 rounded-xl bg-white text-gray-700 font-semibold shadow-lg border border-gray-200 hover:bg-gray-50">
            Back
          </button>
          <button onClick={onNext} className="px-8 py-4 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 text-white font-semibold shadow-lg hover:shadow-xl">
            Take the Quiz
          </button>
        </div>
      </div>
    </div>
  );
};

// Quiz Page
const QuizPage = ({ currentQuestion, selectedAnswer, showAnswer, score, onAnswer, onNext, quizComplete, onRetake, navigate }) => {
  if (quizComplete) {
    const passed = score >= 8;
    return (
      <div className="min-h-screen p-6 pt-20 flex items-center justify-center bg-gradient-to-br from-violet-50 to-purple-100">
        <motion.div
          className="bg-white rounded-3xl shadow-2xl p-10 text-center max-w-md w-full"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <div className={`w-28 h-28 mx-auto rounded-full flex items-center justify-center mb-6 shadow-xl text-5xl ${passed ? 'bg-gradient-to-br from-green-400 to-emerald-500' : 'bg-gradient-to-br from-amber-400 to-orange-500'}`}>
            {passed ? '🏆' : '📚'}
          </div>

          <h2 className="text-3xl font-bold text-gray-800 mb-3">{passed ? 'Outstanding!' : 'Keep Learning!'}</h2>
          <p className="text-xl text-gray-600 mb-6">
            You scored <span className="font-bold text-purple-600">{score}/{quizQuestions.length}</span> ({(score/quizQuestions.length*100).toFixed(0)}%)
          </p>

          {passed ? (
            <div className="bg-green-50 border-2 border-green-400 rounded-xl p-5 mb-6">
              <p className="text-green-800 font-bold">Congratulations! You passed!</p>
              <p className="text-green-700 text-sm">You've mastered the Power of Compounding!</p>
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
    <div className="min-h-screen p-6 pt-20 bg-gradient-to-br from-violet-50 to-purple-100">
      <div className="max-w-3xl mx-auto">
        {/* Progress */}
        <div className="flex justify-center gap-1.5 mb-6">
          {quizQuestions.map((_, idx) => (
            <div
              key={idx}
              className={`h-2 rounded-full transition-all ${
                idx < currentQuestion ? 'w-8 bg-purple-500' :
                idx === currentQuestion ? 'w-8 bg-purple-400' : 'w-2 bg-gray-300'
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
            <div className="mb-6">
              <span className="text-sm font-bold text-purple-600 uppercase tracking-wider">
                Question {currentQuestion + 1} of {quizQuestions.length}
              </span>
              <h2 className="text-xl md:text-2xl font-bold text-gray-800 mt-2">{q.question}</h2>
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
                          ? 'bg-purple-50 border-purple-500 scale-[1.01]'
                          : 'border-gray-200 hover:border-purple-400 hover:bg-purple-50'
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold flex-shrink-0 ${
                      showCorrectness && isCorrect ? 'bg-green-500 text-white' :
                      showCorrectness && isSelected ? 'bg-red-500 text-white' :
                      isSelected ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-500'
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
                <h4 className="font-bold text-purple-400 uppercase tracking-wider text-sm mb-2">Explanation</h4>
                <p className="text-slate-200 mb-4">{q.explanation}</p>
                <button onClick={onNext} className="w-full py-3 bg-white text-slate-800 rounded-lg font-bold hover:bg-purple-50">
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
const CompoundingModule = () => {
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

  const modulePassed = isModulePassed(MODULES.COMPOUNDING?.id);
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
        saveScore(MODULES.COMPOUNDING.id, (finalScore / quizQuestions.length) * 100);
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
        moduleName="Power of Compounding"
        description="You've mastered how compound interest multiplies your wealth!"
        gradientClasses="from-violet-50 via-purple-100 to-fuchsia-200"
        onReviewClick={() => setIsReviewMode(true)}
      />
    );
  }

  return (
    <div className="min-h-screen relative">
      <button
        className="fixed top-4 left-4 px-4 py-2 rounded-lg text-purple-700 hover:bg-white/80 backdrop-blur-sm font-medium transition z-50 shadow-sm border border-purple-200 bg-white/70"
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
          {currentStep === 2 && <RuleOf72Page onNext={handleNext} onPrev={handlePrev} />}
          {currentStep === 3 && <TimeMattersPage onNext={handleNext} onPrev={handlePrev} />}
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

export default CompoundingModule;
