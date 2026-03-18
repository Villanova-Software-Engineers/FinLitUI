import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useModuleScore, MODULES } from '../hooks/useModuleScore';
import ModuleCompletedScreen from './ModuleCompletedScreen';

// Quiz questions
const quizQuestions = [
  {
    question: "What is an ETF?",
    options: [
      "A type of bank account",
      "A fund that trades on exchanges like a stock",
      "A government bond",
      "A type of cryptocurrency"
    ],
    correctIndex: 1,
    explanation: "ETF (Exchange-Traded Fund) is a basket of securities that trades on stock exchanges, combining features of mutual funds and individual stocks."
  },
  {
    question: "What is the main advantage of index funds over actively managed funds?",
    options: [
      "They always beat the market",
      "Lower fees and they often outperform active funds long-term",
      "They're guaranteed to never lose money",
      "They pay higher dividends"
    ],
    correctIndex: 1,
    explanation: "Index funds have much lower expense ratios and studies show most actively managed funds fail to beat their index benchmarks over long periods."
  },
  {
    question: "What is an expense ratio?",
    options: [
      "The profit a fund makes",
      "The annual fee charged by a fund as % of assets",
      "The minimum investment required",
      "How often the fund trades"
    ],
    correctIndex: 1,
    explanation: "Expense ratio is the annual fee that covers the fund's operating costs. A 0.5% expense ratio means you pay $5 yearly for every $1,000 invested."
  },
  {
    question: "Value investing focuses on:",
    options: [
      "Buying the most expensive stocks",
      "Only investing in tech companies",
      "Finding undervalued stocks trading below intrinsic value",
      "Investing only in startups"
    ],
    correctIndex: 2,
    explanation: "Value investors look for stocks they believe are trading below their true worth, essentially looking for 'bargains' in the market."
  },
  {
    question: "Growth investing prioritizes:",
    options: [
      "High dividend payments",
      "Companies with high revenue/earnings growth potential",
      "Only buying bonds",
      "Mature, stable companies"
    ],
    correctIndex: 1,
    explanation: "Growth investors focus on companies expected to grow faster than average, often reinvesting profits rather than paying dividends."
  },
  {
    question: "Why is diversification important?",
    options: [
      "It guarantees high returns",
      "It reduces risk by spreading investments",
      "It eliminates all investment risk",
      "It's required by law"
    ],
    correctIndex: 1,
    explanation: "Diversification reduces risk because different investments often move differently. When some go down, others may go up or stay stable."
  },
  {
    question: "What does an S&P 500 index fund track?",
    options: [
      "500 random stocks",
      "The 500 largest US public companies",
      "500 international companies",
      "500 bond issuers"
    ],
    correctIndex: 1,
    explanation: "The S&P 500 is an index of approximately 500 large US companies, representing about 80% of US stock market value."
  },
  {
    question: "What's a key difference between ETFs and mutual funds?",
    options: [
      "ETFs can only hold tech stocks",
      "ETFs trade throughout the day; mutual funds price once daily",
      "Mutual funds are always better",
      "ETFs don't diversify"
    ],
    correctIndex: 1,
    explanation: "ETFs trade on exchanges throughout market hours with real-time pricing, while mutual funds only calculate their price once after markets close."
  },
  {
    question: "What is a target-date fund?",
    options: [
      "A fund that only invests on certain dates",
      "A fund that automatically adjusts allocation based on retirement year",
      "A fund that expires on a specific date",
      "A fund for day traders"
    ],
    correctIndex: 1,
    explanation: "Target-date funds automatically shift from aggressive (stocks) to conservative (bonds) as you approach your target retirement year."
  },
  {
    question: "A 0.03% expense ratio vs 1% expense ratio over 30 years on $100,000 means:",
    options: [
      "No meaningful difference",
      "Saving potentially $50,000+ with the lower fee",
      "Exactly $291 difference",
      "The higher fee fund will earn more"
    ],
    correctIndex: 1,
    explanation: "Over 30 years, a 1% fee difference can cost you 30% or more of your final balance. With compounding, this can mean $50,000+ difference!"
  }
];

// Matching game pairs
const matchingPairs = [
  { term: "ETF", definition: "Trades like a stock, holds multiple securities, low fees" },
  { term: "Mutual Fund", definition: "Professionally managed pool of money, priced daily" },
  { term: "Index Fund", definition: "Tracks a market index like S&P 500, passive management" },
  { term: "Value Investing", definition: "Buying undervalued stocks at bargain prices" },
  { term: "Growth Investing", definition: "Buying stocks of rapidly expanding companies" },
  { term: "Expense Ratio", definition: "Annual fee charged by fund as percentage of assets" }
];

// Intro Page
const IntroPage = ({ onNext }) => {
  return (
    <div className="min-h-screen p-6 pt-20 bg-gradient-to-br from-indigo-50 via-purple-50 to-violet-50">
      <div className="max-w-4xl mx-auto">
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-2xl mb-6 text-white">
            <span className="text-5xl">🚗</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-3">Investment Vehicles</h1>
          <p className="text-xl text-gray-600">Different ways to grow your money</p>
        </motion.div>

        {/* The Concept */}
        <motion.div
          className="bg-white rounded-3xl p-8 shadow-xl mb-8 border border-gray-100"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">What Are Investment Vehicles?</h2>
          <p className="text-gray-600 text-center mb-6">
            Just like different cars take you places differently, investment vehicles are different financial products to grow your money.
          </p>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-5 bg-indigo-50 rounded-2xl text-center">
              <div className="text-3xl mb-2">📈</div>
              <div className="font-bold text-gray-800">ETFs</div>
              <p className="text-sm text-gray-600">Trade like stocks, low fees</p>
            </div>
            <div className="p-5 bg-purple-50 rounded-2xl text-center">
              <div className="text-3xl mb-2">🏦</div>
              <div className="font-bold text-gray-800">Mutual Funds</div>
              <p className="text-sm text-gray-600">Professionally managed</p>
            </div>
            <div className="p-5 bg-violet-50 rounded-2xl text-center">
              <div className="text-3xl mb-2">📊</div>
              <div className="font-bold text-gray-800">Index Funds</div>
              <p className="text-sm text-gray-600">Track the market</p>
            </div>
          </div>
        </motion.div>

        {/* Transportation Analogy */}
        <motion.div
          className="bg-gradient-to-r from-indigo-100 to-purple-100 rounded-2xl p-6 border-2 border-indigo-200 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="font-bold text-lg mb-4 text-indigo-800">Think of it Like Transportation</h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="bg-white/80 p-4 rounded-xl">
              <div className="font-bold text-indigo-700 mb-1">Individual Stock = Driving Yourself</div>
              <p className="text-gray-600">Full control, higher risk</p>
            </div>
            <div className="bg-white/80 p-4 rounded-xl">
              <div className="font-bold text-indigo-700 mb-1">ETF = Carpool</div>
              <p className="text-gray-600">Shared ride, split costs</p>
            </div>
            <div className="bg-white/80 p-4 rounded-xl">
              <div className="font-bold text-indigo-700 mb-1">Mutual Fund = Tour Bus</div>
              <p className="text-gray-600">Professional driver, sit back</p>
            </div>
          </div>
        </motion.div>

        <div className="flex justify-center">
          <motion.button
            onClick={onNext}
            className="px-10 py-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-lg shadow-xl hover:shadow-2xl transition-all"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Explore Vehicle Types
          </motion.button>
        </div>
      </div>
    </div>
  );
};

// Vehicle Types Page
const VehicleTypesPage = ({ onNext, onPrev }) => {
  const [activeTab, setActiveTab] = useState('etf');

  const vehicles = {
    etf: {
      title: "ETFs (Exchange-Traded Funds)",
      description: "Baskets of stocks you can buy with one purchase. Trade on exchanges like regular stocks.",
      features: [
        "Trade throughout the day like stocks",
        "Lower fees than most mutual funds (0.03-0.5%)",
        "Instant diversification",
        "No minimum investment (buy 1 share)"
      ],
      examples: "SPY (S&P 500), VTI (Total Market), QQQ (Tech)",
      color: "indigo"
    },
    mutual: {
      title: "Mutual Funds",
      description: "Pool money from many investors, managed by professionals who pick investments.",
      features: [
        "Professionally managed by experts",
        "Priced once daily (after market close)",
        "Often have minimum investments ($1,000-$3,000)",
        "Active funds try to beat the market"
      ],
      examples: "Fidelity, Vanguard, T. Rowe Price funds",
      color: "purple"
    },
    index: {
      title: "Index Funds",
      description: "Simply track a market index like the S&P 500. No manager trying to pick winners.",
      features: [
        "Track an index automatically",
        "Very low fees (often 0.03-0.2%)",
        "No active management",
        "Most outperform active funds long-term"
      ],
      examples: "VTSAX (Vanguard Total Market), FXAIX (Fidelity 500)",
      color: "violet"
    }
  };

  const active = vehicles[activeTab];

  return (
    <div className="min-h-screen p-6 pt-20 bg-gradient-to-br from-indigo-50 via-purple-50 to-violet-50">
      <div className="max-w-4xl mx-auto">
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">Types of Investment Vehicles</h1>
          <p className="text-gray-600">Tap each type to learn more</p>
        </motion.div>

        {/* Tabs */}
        <div className="flex justify-center gap-2 mb-8 flex-wrap">
          {Object.entries(vehicles).map(([key, v]) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`px-5 py-3 rounded-xl font-semibold transition-all ${
                activeTab === key
                  ? `bg-${v.color}-500 text-white shadow-lg`
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {key === 'etf' ? 'ETFs' : key === 'mutual' ? 'Mutual Funds' : 'Index Funds'}
            </button>
          ))}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            className="bg-white rounded-2xl p-8 shadow-xl mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <h3 className="font-bold text-2xl text-gray-800 mb-3">{active.title}</h3>
            <p className="text-gray-600 mb-6">{active.description}</p>

            <div className="space-y-3 mb-6">
              {active.features.map((feature, idx) => (
                <div key={idx} className={`flex items-center gap-3 p-3 bg-${active.color}-50 rounded-xl`}>
                  <div className={`w-6 h-6 rounded-full bg-${active.color}-500 text-white flex items-center justify-center text-sm font-bold`}>
                    ✓
                  </div>
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>

            <div className={`p-4 bg-${active.color}-100 rounded-xl border border-${active.color}-200`}>
              <span className="font-semibold text-gray-800">Examples: </span>
              <span className="text-gray-700">{active.examples}</span>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Key Insight */}
        <motion.div
          className="bg-gradient-to-r from-amber-100 to-orange-100 rounded-2xl p-6 border-2 border-amber-200 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h4 className="font-bold text-lg text-amber-800 mb-2">Key Insight</h4>
          <p className="text-amber-700">
            Index funds often outperform actively managed mutual funds over the long term, and they cost much less. Warren Buffett recommends low-cost index funds for most investors.
          </p>
        </motion.div>

        <div className="flex justify-center gap-4">
          <button onClick={onPrev} className="px-8 py-4 rounded-xl bg-white text-gray-700 font-semibold shadow-lg border border-gray-200 hover:bg-gray-50">
            Back
          </button>
          <button onClick={onNext} className="px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold shadow-lg hover:shadow-xl">
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

// Value vs Growth Page
const InvestingStylesPage = ({ onNext, onPrev }) => {
  const [selectedStyle, setSelectedStyle] = useState(null);

  return (
    <div className="min-h-screen p-6 pt-20 bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50">
      <div className="max-w-4xl mx-auto">
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">Investing Styles</h1>
          <p className="text-gray-600">Two major philosophies for picking investments</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Value Investing */}
          <motion.div
            className={`bg-white p-6 rounded-2xl shadow-lg cursor-pointer transition-all border-2 ${
              selectedStyle === 'value' ? 'border-blue-500 ring-2 ring-blue-200' : 'border-transparent hover:border-blue-300'
            }`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => setSelectedStyle(selectedStyle === 'value' ? null : 'value')}
          >
            <div className="text-center mb-4">
              <div className="text-4xl mb-2">💰</div>
              <h3 className="text-xl font-bold text-gray-800">Value Investing</h3>
              <p className="text-blue-600 font-medium">Finding Bargains</p>
            </div>

            <AnimatePresence>
              {selectedStyle === 'value' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="space-y-3"
                >
                  <div className="p-3 bg-blue-50 rounded-xl text-sm text-gray-700">
                    Buy stocks trading below their "true" value
                  </div>
                  <div className="p-3 bg-blue-50 rounded-xl text-sm text-gray-700">
                    Lower price-to-earnings ratios
                  </div>
                  <div className="p-3 bg-blue-50 rounded-xl text-sm text-gray-700">
                    Often pay dividends
                  </div>
                  <div className="p-3 bg-blue-100 rounded-xl text-sm text-blue-800 font-medium">
                    Examples: Banks, utilities, mature companies
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            {selectedStyle !== 'value' && (
              <p className="text-center text-gray-400 text-sm">Tap to learn more</p>
            )}
          </motion.div>

          {/* Growth Investing */}
          <motion.div
            className={`bg-white p-6 rounded-2xl shadow-lg cursor-pointer transition-all border-2 ${
              selectedStyle === 'growth' ? 'border-green-500 ring-2 ring-green-200' : 'border-transparent hover:border-green-300'
            }`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => setSelectedStyle(selectedStyle === 'growth' ? null : 'growth')}
          >
            <div className="text-center mb-4">
              <div className="text-4xl mb-2">🚀</div>
              <h3 className="text-xl font-bold text-gray-800">Growth Investing</h3>
              <p className="text-green-600 font-medium">Betting on Expansion</p>
            </div>

            <AnimatePresence>
              {selectedStyle === 'growth' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="space-y-3"
                >
                  <div className="p-3 bg-green-50 rounded-xl text-sm text-gray-700">
                    Buy companies with high growth potential
                  </div>
                  <div className="p-3 bg-green-50 rounded-xl text-sm text-gray-700">
                    Higher valuations, lower/no dividends
                  </div>
                  <div className="p-3 bg-green-50 rounded-xl text-sm text-gray-700">
                    Reinvest profits into expansion
                  </div>
                  <div className="p-3 bg-green-100 rounded-xl text-sm text-green-800 font-medium">
                    Examples: Tech, biotech, emerging companies
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            {selectedStyle !== 'growth' && (
              <p className="text-center text-gray-400 text-sm">Tap to learn more</p>
            )}
          </motion.div>
        </div>

        {/* Analogy */}
        <motion.div
          className="bg-white rounded-2xl p-6 shadow-lg mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h4 className="font-bold text-lg text-gray-800 mb-4">Think of it This Way</h4>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
              <span className="font-bold text-blue-700">Value investing</span>
              <span className="text-gray-600"> is like buying a reliable used car at a great price.</span>
            </div>
            <div className="p-4 bg-green-50 rounded-xl border border-green-200">
              <span className="font-bold text-green-700">Growth investing</span>
              <span className="text-gray-600"> is like betting on a startup that could become the next Tesla.</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="bg-gradient-to-r from-purple-100 to-indigo-100 rounded-2xl p-6 border-2 border-purple-200 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <p className="text-purple-800 text-center font-medium">
            Many successful investors blend both strategies for a balanced approach.
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

// Matching Game Page
const MatchingGamePage = ({ onNext }) => {
  const [selectedTerm, setSelectedTerm] = useState(null);
  const [selectedDef, setSelectedDef] = useState(null);
  const [matched, setMatched] = useState([]);
  const [wrongAttempt, setWrongAttempt] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);

  const shuffledDefs = useMemo(() => {
    return [...matchingPairs].sort(() => Math.random() - 0.5);
  }, []);

  const handleTermClick = (idx) => {
    if (matched.includes(idx)) return;
    setSelectedTerm(selectedTerm === idx ? null : idx);
    setWrongAttempt(false);
  };

  const handleDefClick = (term) => {
    if (matched.includes(matchingPairs.findIndex(p => p.term === term))) return;
    const defIdx = matchingPairs.findIndex(p => p.term === term);
    setSelectedDef(selectedDef === defIdx ? null : defIdx);
    setWrongAttempt(false);
  };

  useEffect(() => {
    if (selectedTerm !== null && selectedDef !== null) {
      if (selectedTerm === selectedDef) {
        setMatched([...matched, selectedTerm]);
        setSelectedTerm(null);
        setSelectedDef(null);
        if (matched.length + 1 >= matchingPairs.length) {
          setGameComplete(true);
        }
      } else {
        setWrongAttempt(true);
        setTimeout(() => {
          setSelectedTerm(null);
          setSelectedDef(null);
          setWrongAttempt(false);
        }, 1000);
      }
    }
  }, [selectedTerm, selectedDef, matched]);

  if (gameComplete) {
    return (
      <div className="min-h-screen p-6 pt-20 bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <motion.div
          className="bg-white rounded-3xl shadow-2xl p-10 text-center max-w-md w-full"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <div className="w-24 h-24 mx-auto rounded-full bg-green-500 flex items-center justify-center mb-6 text-5xl">
            🎯
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-3">All Matched!</h2>
          <p className="text-gray-600 mb-6">Great job learning investment terms!</p>

          <button
            onClick={onNext}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-lg shadow-lg"
          >
            Continue to Quiz
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 pt-20 bg-gradient-to-br from-indigo-50 via-purple-50 to-violet-50">
      <div className="max-w-4xl mx-auto">
        <motion.div
          className="text-center mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Match the Terms!</h1>
          <p className="text-gray-600">Match each investment term with its definition</p>
          <div className="mt-4 bg-white rounded-full px-4 py-2 inline-block shadow-sm">
            <span className="text-indigo-600 font-medium">{matched.length} / {matchingPairs.length} matched</span>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Terms */}
          <div className="space-y-3">
            <h3 className="font-bold text-gray-700 mb-2 text-center">Terms</h3>
            {matchingPairs.map((pair, idx) => (
              <motion.button
                key={idx}
                onClick={() => handleTermClick(idx)}
                disabled={matched.includes(idx)}
                className={`w-full p-4 rounded-xl text-left font-medium transition-all ${
                  matched.includes(idx)
                    ? 'bg-green-100 border-2 border-green-400 text-green-700'
                    : selectedTerm === idx
                      ? 'bg-indigo-100 border-2 border-indigo-500 text-indigo-700'
                      : wrongAttempt && selectedTerm === idx
                        ? 'bg-red-100 border-2 border-red-400'
                        : 'bg-white border-2 border-gray-200 hover:border-indigo-300'
                }`}
                whileHover={!matched.includes(idx) ? { scale: 1.02 } : {}}
                whileTap={!matched.includes(idx) ? { scale: 0.98 } : {}}
              >
                {pair.term}
                {matched.includes(idx) && <span className="float-right text-green-500">✓</span>}
              </motion.button>
            ))}
          </div>

          {/* Definitions */}
          <div className="space-y-3">
            <h3 className="font-bold text-gray-700 mb-2 text-center">Definitions</h3>
            {shuffledDefs.map((pair, idx) => {
              const originalIdx = matchingPairs.findIndex(p => p.term === pair.term);
              return (
                <motion.button
                  key={idx}
                  onClick={() => handleDefClick(pair.term)}
                  disabled={matched.includes(originalIdx)}
                  className={`w-full p-4 rounded-xl text-left text-sm transition-all ${
                    matched.includes(originalIdx)
                      ? 'bg-green-100 border-2 border-green-400 text-green-700'
                      : selectedDef === originalIdx
                        ? 'bg-purple-100 border-2 border-purple-500 text-purple-700'
                        : wrongAttempt && selectedDef === originalIdx
                          ? 'bg-red-100 border-2 border-red-400'
                          : 'bg-white border-2 border-gray-200 hover:border-purple-300'
                  }`}
                  whileHover={!matched.includes(originalIdx) ? { scale: 1.02 } : {}}
                  whileTap={!matched.includes(originalIdx) ? { scale: 0.98 } : {}}
                >
                  {pair.definition}
                  {matched.includes(originalIdx) && <span className="float-right text-green-500">✓</span>}
                </motion.button>
              );
            })}
          </div>
        </div>

        {wrongAttempt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center p-4 bg-red-50 border-2 border-red-200 rounded-xl mb-6"
          >
            <p className="text-red-700 font-medium">Not a match! Try again.</p>
          </motion.div>
        )}

        {/* Progress bar */}
        <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
          <motion.div
            className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full"
            initial={{ width: 0 }}
            animate={{ width: `${(matched.length / matchingPairs.length) * 100}%` }}
          />
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
      <div className="min-h-screen p-6 pt-20 flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-100">
        <motion.div
          className="bg-white rounded-3xl shadow-2xl p-10 text-center max-w-md w-full"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <div className={`w-28 h-28 mx-auto rounded-full flex items-center justify-center mb-6 shadow-xl text-5xl ${passed ? 'bg-gradient-to-br from-green-400 to-emerald-500' : 'bg-gradient-to-br from-amber-400 to-orange-500'}`}>
            {passed ? '🚗' : '📚'}
          </div>

          <h2 className="text-3xl font-bold text-gray-800 mb-3">{passed ? 'Investment Expert!' : 'Keep Learning!'}</h2>
          <p className="text-xl text-gray-600 mb-6">
            You scored <span className="font-bold text-indigo-600">{score}/{quizQuestions.length}</span> ({(score/quizQuestions.length*100).toFixed(0)}%)
          </p>

          {passed ? (
            <div className="bg-green-50 border-2 border-green-400 rounded-xl p-5 mb-6">
              <p className="text-green-800 font-bold">Congratulations! You passed!</p>
              <p className="text-green-700 text-sm">You understand investment vehicles!</p>
            </div>
          ) : (
            <div className="bg-amber-50 border-2 border-amber-400 rounded-xl p-5 mb-6">
              <p className="text-amber-800 font-bold">You need 80% to pass</p>
              <p className="text-amber-700 text-sm">Review the material and try again!</p>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <button onClick={onRetake} className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold hover:shadow-lg transition-shadow">
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
    <div className="min-h-screen p-6 pt-20 bg-gradient-to-br from-indigo-50 to-purple-100">
      <div className="max-w-3xl mx-auto">
        {/* Progress */}
        <div className="flex justify-center gap-1.5 mb-6">
          {quizQuestions.map((_, idx) => (
            <div
              key={idx}
              className={`h-2 rounded-full transition-all ${
                idx < currentQuestion ? 'w-8 bg-indigo-500' :
                idx === currentQuestion ? 'w-8 bg-indigo-400' : 'w-2 bg-gray-300'
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
              <span className="text-sm font-bold text-indigo-600 uppercase tracking-wider">
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
                          ? 'bg-indigo-50 border-indigo-500 scale-[1.01]'
                          : 'border-gray-200 hover:border-indigo-400 hover:bg-indigo-50'
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold flex-shrink-0 ${
                      showCorrectness && isCorrect ? 'bg-green-500 text-white' :
                      showCorrectness && isSelected ? 'bg-red-500 text-white' :
                      isSelected ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-500'
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
                className="mt-6 bg-indigo-50 border-2 border-indigo-200 p-6 rounded-xl"
              >
                <h4 className="font-bold text-indigo-600 uppercase tracking-wider text-sm mb-2">Explanation</h4>
                <p className="text-gray-700 mb-4">{q.explanation}</p>
                <button onClick={onNext} className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg font-bold hover:shadow-lg transition-shadow">
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
const InvestmentVehiclesModule = () => {
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

  const modulePassed = isModulePassed(MODULES.INVESTMENT_VEHICLES?.id);
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
        saveScore(MODULES.INVESTMENT_VEHICLES.id, (finalScore / quizQuestions.length) * 100);
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
        emoji="🚗"
        moduleName="Investment Vehicles"
        description="You understand ETFs, mutual funds, and investing styles!"
        gradientClasses="from-indigo-50 via-purple-100 to-violet-200"
        onReviewClick={() => setIsReviewMode(true)}
      />
    );
  }

  return (
    <div className="min-h-screen relative">
      <button
        className="fixed top-4 left-4 px-4 py-2 rounded-lg text-indigo-700 hover:bg-white/80 backdrop-blur-sm font-medium transition z-50 shadow-sm border border-indigo-200 bg-white/70"
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
          {currentStep === 1 && <VehicleTypesPage onNext={handleNext} onPrev={handlePrev} />}
          {currentStep === 2 && <InvestingStylesPage onNext={handleNext} onPrev={handlePrev} />}
          {currentStep === 3 && <MatchingGamePage onNext={handleNext} />}
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

export default InvestmentVehiclesModule;
