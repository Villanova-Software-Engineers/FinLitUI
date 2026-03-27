import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useModuleScore, MODULES } from '../hooks/useModuleScore';
import ModuleCompletedScreen from './ModuleCompletedScreen';

// Shuffle function for quiz options
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const shuffleQuizOptions = (questions) => {
  return questions.map(q => {
    const correctAnswer = q.options[q.correctIndex];
    const shuffledOpts = shuffleArray([...q.options]);
    const newCorrectIndex = shuffledOpts.indexOf(correctAnswer);
    return { ...q, options: shuffledOpts, correctIndex: newCorrectIndex };
  });
};

// 10 Quiz Questions
const quizQuestions = [
  {
    question: "What happens to your money's buying power during inflation?",
    options: ["It increases", "It decreases", "Stays the same", "It doubles"],
    correctIndex: 1,
    explanation: "During inflation, prices rise, so your money buys less - its purchasing power decreases. A dollar today will buy fewer goods tomorrow."
  },
  {
    question: "Why is deflation considered dangerous for the economy?",
    options: ["Prices are too low", "People delay spending", "Money becomes worthless", "Banks close down"],
    correctIndex: 1,
    explanation: "When people expect prices to fall, they delay purchases waiting for better deals. This causes economic slowdown, job losses, and a deflationary spiral."
  },
  {
    question: "What does CPI stand for?",
    options: ["Credit Payment Index", "Consumer Price Index", "Cash Printing Income", "Cost Per Item"],
    correctIndex: 1,
    explanation: "The Consumer Price Index measures average price changes over time for a basket of goods and services. It's the primary measure of inflation."
  },
  {
    question: "Using the Rule of 72, if inflation is 3% per year, how long until prices double?",
    options: ["10 years", "24 years", "50 years", "72 years"],
    correctIndex: 1,
    explanation: "The Rule of 72: divide 72 by the interest/inflation rate to find doubling time. 72 ÷ 3 = 24 years for prices to double at 3% inflation."
  },
  {
    question: "Which of these is the BEST hedge against inflation?",
    options: ["Cash under mattress", "Savings account", "Real estate", "Gift cards"],
    correctIndex: 2,
    explanation: "Real assets like property tend to appreciate with inflation, protecting your wealth. Cash and savings accounts typically lose value to inflation over time."
  },
  {
    question: "What can cause 'demand-pull' inflation?",
    options: ["Lower wages", "More buyers than goods", "Cheaper imports", "Less money printed"],
    correctIndex: 1,
    explanation: "Demand-pull inflation occurs when demand exceeds supply. Too many buyers competing for too few goods drives prices upward."
  },
  {
    question: "Which investment has historically beaten inflation over the long term?",
    options: ["Savings account", "Cash at home", "Stock market index funds", "Regular checking"],
    correctIndex: 2,
    explanation: "The stock market has historically returned about 10% annually, significantly outpacing the average 2-3% inflation rate over the long term."
  },
  {
    question: "What are I-Bonds?",
    options: ["Internet bonds", "Inflation-protected bonds", "International bonds", "Investment bank bonds"],
    correctIndex: 1,
    explanation: "I-Bonds are US government savings bonds that automatically adjust their interest rate based on inflation, guaranteeing your money keeps pace with rising prices."
  },
  {
    question: "What typically happens to wages during high inflation?",
    options: ["They rise faster than prices", "They lag behind prices", "They stay exactly the same", "They are not affected"],
    correctIndex: 1,
    explanation: "Wages typically lag behind price increases because salary adjustments happen less frequently than price changes. This is why high inflation hurts workers' purchasing power."
  },
  {
    question: "The Federal Reserve fights inflation by:",
    options: ["Printing more money", "Lowering interest rates", "Raising interest rates", "Giving stimulus checks"],
    correctIndex: 2,
    explanation: "The Fed raises interest rates to make borrowing more expensive. This reduces spending and investment, cooling demand and slowing inflation."
  },
];

// Learning Data
const inflationData = {
  title: "Inflation",
  description: "When prices rise and your money buys less",
  items: [
    { name: 'Price Increases', description: 'Goods and services cost more over time', details: 'A pizza that cost $10 in 2010 might cost $15 today - that\'s 50% more expensive.' },
    { name: 'Money Loses Value', description: 'The same dollars buy fewer things', details: '$100 in 2000 had the purchasing power of about $175 today.' },
    { name: 'Measured by CPI', description: 'Consumer Price Index tracks price changes', details: 'The CPI measures price changes for a basket of common goods and services.' },
    { name: 'Target Rate', description: 'Central banks aim for ~2% annual inflation', details: 'Moderate inflation is considered healthy for economic growth.' }
  ]
};

const deflationData = {
  title: "Deflation",
  description: "When prices fall - sounds good but can be dangerous",
  items: [
    { name: 'Falling Prices', description: 'Goods and services become cheaper', details: 'While this sounds positive, it creates serious economic problems.' },
    { name: 'Delayed Spending', description: 'People wait for prices to drop further', details: 'Why buy today if it will be cheaper tomorrow? This mindset hurts the economy.' },
    { name: 'Wage Spiral', description: 'Businesses earn less, cut wages and jobs', details: 'Japan experienced a "Lost Decade" of deflation in the 1990s.' },
    { name: 'Debt Burden', description: 'Fixed debts become harder to repay', details: 'The real value of debt increases as money becomes more valuable.' }
  ]
};

const causesData = {
  title: "Causes of Inflation",
  description: "Understanding why prices rise helps you prepare",
  items: [
    { name: 'Money Supply', description: 'Too much money chasing same goods', details: 'When central banks print money faster than economic growth, each dollar becomes worth less.' },
    { name: 'Supply Shocks', description: 'Disruptions that reduce supply', details: 'Oil crises, natural disasters, or supply chain issues can spike prices quickly.' },
    { name: 'Demand Pull', description: 'High demand pushes prices up', details: 'When everyone wants to buy, sellers can charge more. Think hot housing markets.' },
    { name: 'Cost Push', description: 'Rising production costs', details: 'Higher wages, materials, or energy costs get passed on to consumers.' }
  ]
};

const protectionData = {
  title: "Protecting Your Wealth",
  description: "Strategies to preserve purchasing power",
  items: [
    { name: 'Invest in Stocks', description: 'Historically beat inflation long-term', details: 'The S&P 500 has averaged about 10% annual returns, well above inflation.' },
    { name: 'Real Assets', description: 'Property and commodities rise with inflation', details: 'Real estate, gold, and other tangible assets tend to maintain value.' },
    { name: 'I-Bonds', description: 'Government bonds that adjust for inflation', details: 'These Treasury bonds guarantee your investment keeps pace with CPI.' },
    { name: 'Diversify', description: 'Spread investments across asset classes', details: 'Don\'t keep all your savings in cash which loses value to inflation.' }
  ]
};

// Intro Page
const IntroPage = ({ onNext }) => (
  <div className="min-h-screen p-6 relative overflow-hidden" style={{ background: 'linear-gradient(120deg, #fef3c7 0%, #ffedd5 50%, #fed7aa 100%)' }}>
    <div className="max-w-5xl mx-auto pt-16">
      <motion.div className="text-center mb-12" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-5xl font-bold mb-4 text-gray-800">Inflation & Deflation</h1>
        <p className="text-xl text-gray-600">Understanding how prices change and what it means for your money</p>
      </motion.div>

      <div className="space-y-6 mb-12">
        <motion.div className="p-8 rounded-3xl shadow-xl bg-white" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-orange-500 flex items-center justify-center shadow-lg flex-shrink-0">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">What You'll Learn</h3>
              <p className="text-gray-700 text-lg leading-relaxed">
                Inflation and deflation are the two forces that change what your money can buy over time.
                Understanding them is essential for <span className="font-semibold">protecting your savings</span> and
                <span className="font-semibold"> making smart financial decisions</span>.
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div className="p-8 rounded-3xl shadow-xl bg-white" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-500 flex items-center justify-center shadow-lg flex-shrink-0">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Topics Covered</h3>
              <div className="space-y-3">
                {[
                  "What inflation is and why prices rise over time",
                  "What deflation is and why falling prices can be dangerous",
                  "The causes of inflation and how to recognize them",
                  "Strategies to protect your wealth from inflation"
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="text-green-600 font-bold text-xl">✓</span>
                    <p className="text-gray-700 text-lg">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div className="p-8 rounded-3xl shadow-xl bg-white" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-500 flex items-center justify-center shadow-lg flex-shrink-0">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">Interactive Learning</h3>
              <p className="text-gray-700 text-lg leading-relaxed">
                This module includes a <span className="font-semibold">Price Time Machine simulator</span> where you can see how
                inflation affects prices over decades, plus a <span className="font-semibold">Purchasing Power Challenge</span> to
                test your understanding of historical prices.
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="flex justify-center pb-12">
        <button onClick={onNext} className="px-10 py-4 rounded-2xl bg-orange-500 text-white font-bold text-lg shadow-xl hover:bg-orange-600 transition">
          Start Learning →
        </button>
      </div>
    </div>
  </div>
);

// Category Page Component
const CategoryPage = ({ data, borderColor, currentStep, totalSteps, onPrev, onNext }) => {
  const [expandedIndex, setExpandedIndex] = useState(null);

  return (
    <div className="max-w-4xl mx-auto pt-16 px-6 pb-16">
      <motion.h2 className="text-4xl font-bold mb-4 text-center text-gray-800" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        {data.title}
      </motion.h2>
      <p className="text-center text-gray-600 mb-8 text-lg">{data.description}</p>

      <div className="grid gap-4 mb-8">
        {data.items.map((item, idx) => (
          <motion.div
            key={idx}
            className="p-5 bg-white rounded-xl shadow-md hover:shadow-lg transition cursor-pointer border-l-4"
            style={{ borderLeftColor: borderColor }}
            onClick={() => setExpandedIndex(expandedIndex === idx ? null : idx)}
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: idx * 0.1 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-gray-800 text-lg">{item.name}</h4>
                <p className="text-sm text-gray-600">{item.description}</p>
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
                    <p className="text-gray-700 bg-gray-50 p-4 rounded-lg text-sm leading-relaxed">
                      {item.details}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      <div className="flex justify-center gap-4">
        <button onClick={onPrev} className="px-8 py-4 rounded-2xl border-2 border-orange-400 bg-white text-orange-600 font-semibold text-lg shadow-lg hover:bg-orange-50">
          ← Back
        </button>
        <button onClick={onNext} className="px-8 py-4 rounded-2xl bg-orange-500 text-white font-semibold text-lg shadow-lg hover:bg-orange-600">
          Next →
        </button>
      </div>
    </div>
  );
};

// Price Simulator Game
const PriceSimulatorGame = ({ onPrev, onNext }) => {
  const [simulatorYear, setSimulatorYear] = useState(2024);
  const [inflationRate, setInflationRate] = useState(3);

  const priceItems = [
    { name: "Coffee", basePrice: 3.50 },
    { name: "Gas (gallon)", basePrice: 3.00 },
    { name: "Burger", basePrice: 8.00 },
    { name: "T-Shirt", basePrice: 20.00 },
    { name: "Rent (month)", basePrice: 1500 },
    { name: "Used Car", basePrice: 15000 },
  ];

  const yearsFromNow = simulatorYear - 2024;
  const calculateFuturePrice = (basePrice, years, rate) => basePrice * Math.pow(1 + rate / 100, years);

  return (
    <div className="min-h-screen p-6 pt-20" style={{ background: 'linear-gradient(120deg, #fef3c7 0%, #ffedd5 50%, #fed7aa 100%)' }}>
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-8 text-white text-center">
            <h1 className="text-3xl font-bold">Price Time Machine</h1>
            <p className="text-orange-100 mt-2">See how inflation changes prices over time</p>
          </div>

          <div className="p-8">
            <div className="bg-gray-50 rounded-2xl p-6 mb-6">
              <div className="mb-6">
                <label className="block text-lg font-bold text-gray-700 mb-3">
                  Travel to Year: <span className="text-orange-600">{simulatorYear}</span>
                </label>
                <input
                  type="range"
                  min="2024"
                  max="2074"
                  value={simulatorYear}
                  onChange={(e) => setSimulatorYear(parseInt(e.target.value))}
                  className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                />
                <div className="flex justify-between text-sm text-gray-500 mt-2">
                  <span>2024 (Now)</span>
                  <span>2049</span>
                  <span>2074</span>
                </div>
              </div>

              <div>
                <label className="block text-lg font-bold text-gray-700 mb-3">
                  Annual Inflation Rate: <span className="text-orange-600">{inflationRate}%</span>
                </label>
                <div className="flex gap-2">
                  {[2, 3, 5, 7, 10].map((rate) => (
                    <button
                      key={rate}
                      onClick={() => setInflationRate(rate)}
                      className={`flex-1 py-3 rounded-xl font-bold transition-all ${
                        inflationRate === rate
                          ? 'bg-orange-500 text-white shadow-lg'
                          : 'bg-white text-gray-600 hover:bg-orange-100 border border-gray-200'
                      }`}
                    >
                      {rate}%
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <span className="font-bold text-gray-700 text-lg">Prices in {simulatorYear}</span>
                {yearsFromNow > 0 && (
                  <span className="text-sm bg-red-100 text-red-700 px-4 py-1.5 rounded-full font-bold">
                    +{yearsFromNow} years
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {priceItems.map((item, idx) => {
                  const futurePrice = calculateFuturePrice(item.basePrice, yearsFromNow, inflationRate);
                  const priceIncrease = ((futurePrice - item.basePrice) / item.basePrice * 100).toFixed(0);

                  return (
                    <div
                      key={idx}
                      className="bg-gray-50 rounded-xl p-4 border border-gray-100"
                    >
                      <span className="font-bold text-gray-700 block mb-3">{item.name}</span>
                      <div className="flex items-end justify-between">
                        <div>
                          <div className="text-sm text-gray-500 line-through">${item.basePrice.toLocaleString()}</div>
                          <div className="text-xl font-bold text-gray-900">
                            ${futurePrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                        </div>
                        {yearsFromNow > 0 && (
                          <div className="text-red-600 text-sm font-bold">
                            +{priceIncrease}%
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-orange-50 rounded-2xl p-5 border border-orange-200 mb-6">
              <p className="text-orange-800">
                <span className="font-bold">Key Insight: </span>
                {yearsFromNow === 0
                  ? "Move the slider to see how prices change over time."
                  : `At ${inflationRate}% inflation, prices roughly double every ${Math.round(72 / inflationRate)} years. Your savings need to grow faster than inflation to maintain purchasing power.`}
              </p>
            </div>

            <div className="flex justify-center gap-4">
              <button onClick={onPrev} className="px-8 py-4 rounded-2xl border-2 border-orange-400 bg-white text-orange-600 font-semibold text-lg shadow-lg hover:bg-orange-50">
                ← Back
              </button>
              <button onClick={onNext} className="px-8 py-4 rounded-2xl bg-orange-500 text-white font-semibold text-lg shadow-lg hover:bg-orange-600">
                Next: Purchasing Power Challenge →
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// Purchasing Power Game
const PurchasingPowerGame = ({ onPrev, onNext }) => {
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [complete, setComplete] = useState(false);

  const rounds = [
    {
      year: 1990,
      budget: 100,
      question: "In 1990, $100 could buy:",
      options: [
        { text: "50 gallons of gas", correct: true },
        { text: "15 gallons of gas", correct: false },
        { text: "100 gallons of gas", correct: false },
      ],
      explanation: "Gas was about $1.16/gallon in 1990!"
    },
    {
      year: 2000,
      budget: 100,
      question: "In 2000, $100 could buy:",
      options: [
        { text: "3 movie tickets", correct: false },
        { text: "20 movie tickets", correct: true },
        { text: "8 movie tickets", correct: false },
      ],
      explanation: "Movie tickets averaged $5.39 in 2000!"
    },
    {
      year: 1970,
      budget: 50,
      question: "In 1970, $50 could buy:",
      options: [
        { text: "1 week of groceries", correct: false },
        { text: "1 month of groceries", correct: true },
        { text: "2 days of groceries", correct: false },
      ],
      explanation: "Average grocery bill was about $40-50/month!"
    },
    {
      year: 2010,
      budget: 1000,
      question: "In 2010, average monthly rent was:",
      options: [
        { text: "$800", correct: true },
        { text: "$1,500", correct: false },
        { text: "$2,000", correct: false },
      ],
      explanation: "Average US rent was around $800 in 2010!"
    },
  ];

  const handleAnswer = (option) => {
    if (showResult) return;
    setSelectedAnswer(option);
    setShowResult(true);
    if (option.correct) setScore(prev => prev + 1);
  };

  const handleNext = () => {
    setShowResult(false);
    setSelectedAnswer(null);
    if (round < rounds.length - 1) {
      setRound(prev => prev + 1);
    } else {
      setComplete(true);
    }
  };

  if (complete) {
    return (
      <div className="min-h-screen p-6 pt-20 flex items-center justify-center" style={{ background: 'linear-gradient(120deg, #fef3c7 0%, #ffedd5 50%, #fed7aa 100%)' }}>
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-3xl shadow-2xl p-12 text-center max-w-2xl w-full">
          <div className={`w-32 h-32 mx-auto rounded-full flex items-center justify-center mb-8 shadow-xl ${score >= 3 ? 'bg-green-500' : 'bg-amber-500'}`}>
            <span className="text-6xl">{score >= 3 ? '✓' : '→'}</span>
          </div>
          <h2 className="text-4xl font-bold text-gray-800 mb-6">{score >= 3 ? 'Well Done!' : 'Keep Learning!'}</h2>
          <p className="text-2xl text-gray-600 mb-10">You got {score}/{rounds.length} correct!</p>
          <button onClick={onNext} className="w-full max-w-md mx-auto block py-5 bg-orange-500 text-white rounded-xl font-bold text-xl hover:bg-orange-600 transition-all shadow-lg">
            Continue to Savings Impact Calculator →
          </button>
        </motion.div>
      </div>
    );
  }

  const currentRound = rounds[round];

  return (
    <div className="min-h-screen p-6 pt-20" style={{ background: 'linear-gradient(120deg, #fef3c7 0%, #ffedd5 50%, #fed7aa 100%)' }}>
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-8 text-white text-center">
            <h1 className="text-3xl font-bold">Purchasing Power Challenge</h1>
            <div className="flex justify-center gap-2 mt-4">
              {rounds.map((_, idx) => (
                <div key={idx} className={`w-3 h-3 rounded-full ${idx < round ? 'bg-white' : idx === round ? 'bg-white ring-2 ring-white/50' : 'bg-white/30'}`} />
              ))}
            </div>
          </div>

          <div className="p-8">
            <motion.div key={round} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <div className="bg-amber-50 rounded-2xl p-6 text-center mb-6 border border-amber-200">
                <div className="text-4xl font-bold text-amber-800 mb-2">{currentRound.year}</div>
                <div className="text-xl font-semibold text-amber-700">${currentRound.budget} Budget</div>
              </div>

              <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">{currentRound.question}</h3>

              <div className="space-y-3 mb-6">
                {currentRound.options.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(option)}
                    disabled={showResult}
                    className={`w-full p-5 rounded-xl text-left border-2 transition-all flex items-center gap-4 ${
                      showResult
                        ? option.correct
                          ? 'bg-green-50 border-green-500'
                          : selectedAnswer === option
                            ? 'bg-red-50 border-red-500'
                            : 'border-gray-100 opacity-50'
                        : 'border-gray-200 hover:border-orange-400 hover:bg-orange-50'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                      showResult && option.correct ? 'bg-green-500 text-white' :
                      showResult && selectedAnswer === option ? 'bg-red-500 text-white' :
                      'bg-gray-100 text-gray-500'
                    }`}>
                      {String.fromCharCode(65 + idx)}
                    </div>
                    <span className="text-lg font-medium flex-1">{option.text}</span>
                    {showResult && option.correct && <span className="text-green-600 text-xl">✓</span>}
                    {showResult && selectedAnswer === option && !option.correct && <span className="text-red-600 text-xl">✗</span>}
                  </button>
                ))}
              </div>

              {showResult && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                  <div className="bg-slate-800 text-white p-6 rounded-2xl mb-6">
                    <h4 className="font-bold text-orange-400 uppercase tracking-wider text-sm mb-2">Explanation</h4>
                    <p className="text-lg text-gray-200">{currentRound.explanation}</p>
                  </div>
                  <button onClick={handleNext} className="w-full py-4 bg-orange-500 text-white rounded-xl font-bold text-lg hover:bg-orange-600">
                    {round < rounds.length - 1 ? 'Next Round' : 'See Results'}
                  </button>
                </motion.div>
              )}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// Savings Impact Game - Shows how inflation affects savings over time
const SavingsImpactGame = ({ onPrev, onNext }) => {
  const [savingsAmount, setSavingsAmount] = useState(10000);
  const [yearsToProject, setYearsToProject] = useState(10);
  const [inflationRate, setInflationRate] = useState(3);
  const [showComparison, setShowComparison] = useState(false);

  const calculatePurchasingPower = (amount, years, rate) => {
    return amount / Math.pow(1 + rate / 100, years);
  };

  const purchasingPowerLoss = savingsAmount - calculatePurchasingPower(savingsAmount, yearsToProject, inflationRate);
  const percentageLoss = ((purchasingPowerLoss / savingsAmount) * 100).toFixed(1);
  const futurePurchasingPower = calculatePurchasingPower(savingsAmount, yearsToProject, inflationRate);

  // Calculate what you'd need to invest at different returns to beat inflation
  const investmentReturns = [5, 7, 10];
  const futureValues = investmentReturns.map(rate =>
    savingsAmount * Math.pow(1 + rate / 100, yearsToProject)
  );

  return (
    <div className="min-h-screen p-6 pt-20" style={{ background: 'linear-gradient(120deg, #fef3c7 0%, #ffedd5 50%, #fed7aa 100%)' }}>
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-red-500 to-orange-500 p-8 text-white text-center">
            <h1 className="text-3xl font-bold">Savings Impact Calculator</h1>
            <p className="text-orange-100 mt-2">See how inflation erodes your savings over time</p>
          </div>

          <div className="p-8">
            {/* Input Controls */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {/* Savings Amount */}
              <div className="bg-gray-50 rounded-2xl p-6">
                <label className="block text-sm font-bold text-gray-700 mb-3">
                  Your Savings
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-xl font-bold">$</span>
                  <input
                    type="number"
                    min="1000"
                    max="1000000"
                    step="1000"
                    value={savingsAmount}
                    onChange={(e) => setSavingsAmount(Math.max(1000, parseInt(e.target.value) || 1000))}
                    className="w-full pl-8 pr-4 py-3 text-xl font-bold text-gray-800 bg-white border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Years */}
              <div className="bg-gray-50 rounded-2xl p-6">
                <label className="block text-sm font-bold text-gray-700 mb-3">
                  Time Period: <span className="text-orange-600">{yearsToProject} years</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="30"
                  value={yearsToProject}
                  onChange={(e) => setYearsToProject(parseInt(e.target.value))}
                  className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>1 yr</span>
                  <span>30 yrs</span>
                </div>
              </div>

              {/* Inflation Rate */}
              <div className="bg-gray-50 rounded-2xl p-6">
                <label className="block text-sm font-bold text-gray-700 mb-3">
                  Inflation Rate: <span className="text-orange-600">{inflationRate}%</span>
                </label>
                <div className="flex gap-2">
                  {[2, 3, 4, 6, 8].map((rate) => (
                    <button
                      key={rate}
                      onClick={() => setInflationRate(rate)}
                      className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all ${
                        inflationRate === rate
                          ? 'bg-orange-500 text-white shadow-lg'
                          : 'bg-white text-gray-600 hover:bg-orange-100 border border-gray-200'
                      }`}
                    >
                      {rate}%
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-8 mb-6 border-2 border-red-200">
              <div className="grid md:grid-cols-3 gap-6 mb-6">
                <div className="text-center">
                  <div className="text-sm text-gray-600 mb-2">Today's Value</div>
                  <div className="text-3xl font-bold text-gray-800">
                    ${savingsAmount.toLocaleString()}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-600 mb-2">Future Purchasing Power</div>
                  <div className="text-3xl font-bold text-red-600">
                    ${futurePurchasingPower.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-600 mb-2">Purchasing Power Loss</div>
                  <div className="text-3xl font-bold text-red-600">
                    -{percentageLoss}%
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-5 border border-red-200">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">⚠️</span>
                  <div>
                    <h4 className="font-bold text-gray-800 mb-2">What This Means</h4>
                    <p className="text-gray-700">
                      In {yearsToProject} years, your ${savingsAmount.toLocaleString()} will only buy what{' '}
                      <span className="font-bold text-red-600">${futurePurchasingPower.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>{' '}
                      buys today. You'll effectively lose{' '}
                      <span className="font-bold text-red-600">${purchasingPowerLoss.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>{' '}
                      in purchasing power if you keep cash under your mattress!
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Investment Comparison */}
            <div className="mb-6">
              <button
                onClick={() => setShowComparison(!showComparison)}
                className="w-full bg-blue-500 text-white py-3 rounded-xl font-bold hover:bg-blue-600 transition-all flex items-center justify-center gap-2"
              >
                {showComparison ? '▼' : '▶'} How to Beat Inflation with Investing
              </button>

              {showComparison && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-4 bg-green-50 rounded-2xl p-6 border-2 border-green-200"
                >
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Investment Growth Comparison</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    {investmentReturns.map((rate, idx) => {
                      const futureValue = futureValues[idx];
                      const realGain = futureValue - savingsAmount;
                      const netAfterInflation = calculatePurchasingPower(futureValue, yearsToProject, inflationRate);

                      return (
                        <div key={rate} className="bg-white rounded-xl p-5 border border-green-300">
                          <div className="text-center mb-3">
                            <div className="text-sm text-gray-600">Investing at {rate}% annually</div>
                            <div className="text-2xl font-bold text-green-600 mt-2">
                              ${futureValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              Real Value: ${netAfterInflation.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                            </div>
                          </div>
                          <div className="text-center pt-3 border-t border-gray-200">
                            <span className="text-sm font-bold text-green-700">
                              +${realGain.toLocaleString(undefined, { maximumFractionDigits: 0 })} gain
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-4 bg-blue-50 rounded-xl p-4 border border-blue-200">
                    <p className="text-blue-900 text-sm">
                      <span className="font-bold">💡 Pro Tip:</span> To preserve and grow wealth, your investment returns should exceed inflation.
                      Stocks historically return ~10% annually, easily beating the average 2-3% inflation rate.
                    </p>
                  </div>
                </motion.div>
              )}
            </div>

            <div className="flex justify-center gap-4">
              <button onClick={onPrev} className="px-8 py-4 rounded-2xl border-2 border-orange-400 bg-white text-orange-600 font-semibold text-lg shadow-lg hover:bg-orange-50">
                ← Back
              </button>
              <button onClick={onNext} className="px-8 py-4 rounded-2xl bg-orange-500 text-white font-semibold text-lg shadow-lg hover:bg-orange-600">
                Next: Final Quiz →
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// Quiz Page
const QuizPage = ({ currentQuestion, selectedAnswer, showAnswer, score, onAnswer, onNext, quizComplete, onRetake, navigate, questions }) => {
  if (quizComplete) {
    const passed = score >= 8;
    return (
      <div className="min-h-screen p-6 pt-20 flex items-center justify-center" style={{ background: 'linear-gradient(120deg, #fef3c7 0%, #ffedd5 50%, #fed7aa 100%)' }}>
        <motion.div
          className="bg-white rounded-3xl shadow-2xl p-12 text-center max-w-lg border border-gray-100"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <div className={`w-32 h-32 mx-auto rounded-full flex items-center justify-center mb-8 shadow-2xl ${passed ? 'bg-green-500' : 'bg-amber-500'}`}>
            <span className="text-6xl text-white">{passed ? '✓' : '→'}</span>
          </div>

          <h2 className="text-4xl font-bold text-gray-800 mb-4">{passed ? 'Outstanding!' : 'Keep Learning!'}</h2>
          <p className="text-2xl text-gray-600 mb-8">
            You scored <span className="font-bold text-gray-800">{score}/{questions.length}</span> ({(score / questions.length * 100).toFixed(0)}%)
          </p>

          {passed ? (
            <div className="bg-green-50 border-2 border-green-500 rounded-2xl p-6 mb-8">
              <p className="text-green-800 font-bold text-lg">Congratulations! You passed!</p>
              <p className="text-green-700">You've mastered Inflation & Deflation</p>
            </div>
          ) : (
            <div className="bg-amber-50 border-2 border-amber-500 rounded-2xl p-6 mb-8">
              <p className="text-amber-800 font-bold text-lg">You need 80% to pass (8/10 correct)</p>
              <p className="text-amber-700">Review the material and try again</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={onRetake} className="px-8 py-4 rounded-xl bg-slate-800 text-white font-bold text-lg hover:bg-slate-700">
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
    <div className="min-h-screen p-6 pt-20" style={{ background: 'linear-gradient(120deg, #fef3c7 0%, #ffedd5 50%, #fed7aa 100%)' }}>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden flex flex-col min-h-[500px]">
          <div className="flex-1 p-8 lg:p-12 flex flex-col justify-center">
            <div className="flex justify-between items-end mb-8 border-b border-gray-100 pb-6">
              <div>
                <span className="text-sm font-bold text-orange-600 uppercase tracking-wider block mb-2">Question {currentQuestion + 1} of {questions.length}</span>
                <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 leading-tight">
                  {q.question}
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {q.options.map((option, idx) => {
                const isSelected = selectedAnswer === idx;
                const isCorrect = idx === q.correctIndex;
                const showCorrectness = showAnswer && (isSelected || isCorrect);

                return (
                  <button
                    key={idx}
                    onClick={() => !showAnswer && onAnswer(idx)}
                    disabled={showAnswer}
                    className={`p-6 rounded-2xl text-left border-2 transition-all flex items-start gap-4 ${showCorrectness
                      ? isCorrect
                        ? 'bg-green-50 border-green-500 text-green-900'
                        : isSelected
                          ? 'bg-red-50 border-red-500 text-red-900'
                          : 'bg-white border-slate-100 opacity-50'
                      : isSelected
                        ? 'bg-orange-50 border-orange-500 shadow-lg'
                        : 'bg-white border-slate-200 hover:border-orange-400 hover:shadow-md'
                      }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${showCorrectness && isCorrect ? 'bg-green-500 text-white' :
                      showCorrectness && isSelected ? 'bg-red-500 text-white' :
                        isSelected ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-500'
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

            {showAnswer && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 bg-slate-900 text-white p-8 rounded-3xl flex flex-col md:flex-row items-center gap-8 shadow-2xl"
              >
                <div className="flex-1">
                  <h4 className="font-bold text-orange-400 uppercase tracking-wider text-sm mb-2">Explanation</h4>
                  <p className="text-lg leading-relaxed text-slate-200">
                    {q.explanation}
                  </p>
                </div>
                <button
                  onClick={onNext}
                  className="w-full md:w-auto px-8 py-4 bg-white text-slate-900 rounded-xl font-bold hover:bg-orange-50 transition-colors whitespace-nowrap"
                >
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
const InflationDeflationModule = () => {
  const navigate = useNavigate();
  const { saveScore, resetModule, isModulePassed, isLoading: progressLoading } = useModuleScore();

  const [currentStep, setCurrentStep] = useState(0);
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [quizQuestion, setQuizQuestion] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [quizComplete, setQuizComplete] = useState(false);
  const [shuffleKey, setShuffleKey] = useState(0);
  const [isResetting, setIsResetting] = useState(false);

  const shuffledQuestions = useMemo(() => shuffleQuizOptions(quizQuestions), [shuffleKey]);

  const totalSteps = 8; // intro, inflation, deflation, causes, protection, simulator, purchasing-power, savings-impact, quiz

  const modulePassed = isModulePassed(MODULES.INFLATION_DEFLATION?.id || 'inflation-deflation');

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

  const handleQuizAnswer = (idx) => {
    if (showAnswer) return;
    setSelectedAnswer(idx);
    if (idx === shuffledQuestions[quizQuestion].correctIndex) {
      setQuizScore(prev => prev + 1);
    }
    setShowAnswer(true);
  };

  const handleNextQuestion = () => {
    setShowAnswer(false);
    setSelectedAnswer(null);
    if (quizQuestion < shuffledQuestions.length - 1) {
      setQuizQuestion(prev => prev + 1);
    } else {
      setQuizComplete(true);
      const finalScore = quizScore + (selectedAnswer === shuffledQuestions[quizQuestion].correctIndex ? 1 : 0);
      const scorePercent = Math.round((finalScore / shuffledQuestions.length) * 100);
      saveScore(MODULES.INFLATION_DEFLATION?.id || 'inflation-deflation', scorePercent, 100);
    }
  };

  const handleRetake = async () => {
    if (isResetting) return;
    setIsResetting(true);
    try {
      await resetModule(MODULES.INFLATION_DEFLATION?.id || 'inflation-deflation');
      setShuffleKey(prev => prev + 1);
      setCurrentStep(0);
      setQuizQuestion(0);
      setQuizScore(0);
      setSelectedAnswer(null);
      setShowAnswer(false);
      setQuizComplete(false);
      setIsReviewMode(false);
    } catch (error) {
      console.error('Error resetting:', error);
    } finally {
      setIsResetting(false);
    }
  };

  if (progressLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(120deg, #fef3c7 0%, #ffedd5 50%, #fed7aa 100%)' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
      </div>
    );
  }

  if (modulePassed && !isReviewMode) {
    return (
      <ModuleCompletedScreen
        emoji="📈"
        moduleName="Inflation & Deflation"
        description="You've already passed the Inflation & Deflation module. You understand how prices change over time!"
        gradientClasses="from-orange-50 via-amber-100 to-yellow-100"
        onReviewClick={() => setIsReviewMode(true)}
      />
    );
  }

  return (
    <div className="min-h-screen relative overflow-x-hidden" style={{ background: 'linear-gradient(120deg, #fef3c7 0%, #ffedd5 50%, #fed7aa 100%)' }}>
      {/* Fixed Navigation */}
      <button
        className="absolute top-4 left-4 px-4 py-2 rounded-lg text-orange-600 hover:bg-white/50 backdrop-blur-sm font-medium transition z-50 shadow-sm border border-orange-100"
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
      {currentStep > 0 && currentStep < 8 && (
        <button
          onClick={handlePrev}
          className="fixed left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-orange-500 text-white rounded-full shadow-lg hover:bg-orange-600 transition flex items-center justify-center z-40"
          aria-label="Previous"
        >
          ←
        </button>
      )}
      {currentStep < 7 && (
        <button
          onClick={handleNext}
          className="fixed right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-orange-500 text-white rounded-full shadow-lg hover:bg-orange-600 transition flex items-center justify-center z-40"
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
          {currentStep === 0 && <IntroPage onNext={handleNext} />}
          {currentStep === 1 && <CategoryPage data={inflationData} borderColor="#ef4444" currentStep={currentStep} totalSteps={totalSteps} onPrev={handlePrev} onNext={handleNext} />}
          {currentStep === 2 && <CategoryPage data={deflationData} borderColor="#3b82f6" currentStep={currentStep} totalSteps={totalSteps} onPrev={handlePrev} onNext={handleNext} />}
          {currentStep === 3 && <CategoryPage data={causesData} borderColor="#f59e0b" currentStep={currentStep} totalSteps={totalSteps} onPrev={handlePrev} onNext={handleNext} />}
          {currentStep === 4 && <CategoryPage data={protectionData} borderColor="#10b981" currentStep={currentStep} totalSteps={totalSteps} onPrev={handlePrev} onNext={handleNext} />}
          {currentStep === 5 && <PriceSimulatorGame onPrev={handlePrev} onNext={handleNext} />}
          {currentStep === 6 && <PurchasingPowerGame onPrev={handlePrev} onNext={handleNext} />}
          {currentStep === 7 && <SavingsImpactGame onPrev={handlePrev} onNext={handleNext} />}
          {currentStep === 8 && (
            <QuizPage
              currentQuestion={quizQuestion}
              selectedAnswer={selectedAnswer}
              showAnswer={showAnswer}
              score={quizScore}
              onAnswer={handleQuizAnswer}
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

export default InflationDeflationModule;
