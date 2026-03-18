import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useModuleScore, MODULES } from '../hooks/useModuleScore';
import ModuleCompletedScreen from './ModuleCompletedScreen';
import { shuffleQuizOptions } from '../utils/shuffleQuizOptions';

// Quiz questions
const quizQuestions = [
  {
    question: "What is the relationship between risk and potential return?",
    options: [
      "High risk investments always make money",
      "Higher potential returns typically require accepting higher risk",
      "Low risk investments have the highest returns",
      "Risk and return are unrelated"
    ],
    correctIndex: 1,
    explanation: "The risk-reward tradeoff means higher potential returns usually come with higher potential for loss. There's no free lunch in investing."
  },
  {
    question: "Why should younger investors typically take more risk?",
    options: [
      "They're naturally better at picking stocks",
      "They have more time to recover from market downturns",
      "They're legally required to",
      "Young people don't need as much money"
    ],
    correctIndex: 1,
    explanation: "With decades until retirement, young investors can ride out market cycles. A 20-year-old has time to recover from crashes; a 60-year-old doesn't."
  },
  {
    question: "What is diversification?",
    options: [
      "Putting all your money in one great investment",
      "Spreading investments across different assets to reduce risk",
      "Investing only in foreign companies",
      "Changing investments every day"
    ],
    correctIndex: 1,
    explanation: "Diversification spreads risk by owning different types of investments. If one fails, others may succeed, reducing overall portfolio risk."
  },
  {
    question: "What should you NEVER invest?",
    options: [
      "Money you've inherited",
      "Money you can't afford to lose",
      "Money from your paycheck",
      "Money in small amounts"
    ],
    correctIndex: 1,
    explanation: "Never invest money needed for necessities, emergencies, or that you can't afford to lose. This includes rent money, emergency funds, or borrowed money."
  },
  {
    question: "When markets drop significantly, the best response for most long-term investors is:",
    options: [
      "Sell everything immediately",
      "Stop checking your accounts and panic",
      "Stay calm and stick to your investment plan",
      "Move everything to cryptocurrency"
    ],
    correctIndex: 2,
    explanation: "Market drops are normal. Selling during a dip locks in losses. Historically, markets recover. Stay calm and continue your long-term plan."
  },
  {
    question: "How should your investment risk change as you approach retirement?",
    options: [
      "Increase risk for maximum growth",
      "Risk should stay the same throughout life",
      "Gradually reduce risk and shift to more stable investments",
      "Move everything to cash"
    ],
    correctIndex: 2,
    explanation: "As retirement approaches, shift from stocks to bonds/stable investments. You have less time to recover from losses and need to protect your nest egg."
  },
  {
    question: "A 'hot tip' about a guaranteed investment opportunity is most likely:",
    options: [
      "A once-in-a-lifetime opportunity",
      "A scam or at minimum, very risky",
      "Illegal but worth the risk",
      "Only available to smart investors"
    ],
    correctIndex: 1,
    explanation: "No investment is 'guaranteed.' Hot tips are usually scams, and insider trading is illegal. Real opportunities don't come through tips."
  },
  {
    question: "What role does an emergency fund play in risk management?",
    options: [
      "It's just for emergencies, unrelated to investing",
      "It allows you to take more investment risk by providing a safety net",
      "It should be invested aggressively",
      "Emergency funds are unnecessary"
    ],
    correctIndex: 1,
    explanation: "Having an emergency fund means you won't need to sell investments during personal crises, allowing you to take more risk with long-term money."
  },
  {
    question: "What is 'systematic risk'?",
    options: [
      "Risk from a systematic investment plan",
      "Market-wide risk that affects all investments",
      "Risk from not having a system",
      "Computer system failures"
    ],
    correctIndex: 1,
    explanation: "Systematic risk affects the entire market (recessions, wars, pandemics). It can't be diversified away but is balanced by long-term market growth."
  },
  {
    question: "Which factor does NOT affect your risk tolerance?",
    options: [
      "Your age and time horizon",
      "Your income stability",
      "Your favorite sports team",
      "Your emergency fund size"
    ],
    correctIndex: 2,
    explanation: "Risk tolerance is affected by financial factors (age, income, savings) and personality. Personal preferences unrelated to money don't affect it."
  }
];

// Risk scenarios for assessment game
const riskScenarios = [
  {
    title: "Market Crash",
    scenario: "The stock market drops 20% in one week. Your $50,000 portfolio is now worth $40,000. What do you do?",
    options: [
      { text: "Panic sell everything", type: "conservative", feedback: "Panic selling locks in losses. Markets historically recover." },
      { text: "Hold steady and continue plan", type: "moderate", feedback: "Smart! Staying the course is usually wise for long-term investors." },
      { text: "Buy more while it's 'on sale'", type: "aggressive", feedback: "Bold move! Buying during dips can boost long-term returns." }
    ]
  },
  {
    title: "Hot Stock Tip",
    scenario: "A friend says they have insider info on a stock that will 'definitely' triple. They want you to invest $5,000.",
    options: [
      { text: "Invest the full $5,000", type: "aggressive", feedback: "Dangerous! 'Insider info' tips are usually scams or illegal." },
      { text: "Invest a small amount", type: "moderate", feedback: "Still risky. Hot tips rarely pan out, and acting on insider info is illegal." },
      { text: "Politely decline", type: "conservative", feedback: "Smart choice! Never invest based on tips. Do your own research." }
    ]
  },
  {
    title: "Retirement at 25",
    scenario: "You're 25 and saving for retirement at 65. How should you allocate your 401(k)?",
    options: [
      { text: "100% bonds for safety", type: "conservative", feedback: "Too conservative at 25! You're missing 40 years of growth potential." },
      { text: "70% stocks, 30% bonds", type: "moderate", feedback: "Reasonable but slightly conservative for a 40-year horizon." },
      { text: "90-100% stocks", type: "aggressive", feedback: "With 40 years, high stock allocation maximizes growth. Time is on your side." }
    ]
  },
  {
    title: "Crypto Craze",
    scenario: "A new cryptocurrency has gained 500% this month. You're considering investing your entire $15,000 savings.",
    options: [
      { text: "Go all in!", type: "aggressive", feedback: "Extremely dangerous! Never invest emergency savings. Crypto is highly volatile." },
      { text: "Invest 5-10% max", type: "moderate", feedback: "A small allocation limits downside while giving some exposure." },
      { text: "Skip it", type: "conservative", feedback: "Valid! You don't need to follow every trend." }
    ]
  }
];

// Intro Page
const IntroPage = ({ onNext }) => {
  return (
    <div className="min-h-screen p-6 pt-20 bg-gradient-to-br from-blue-50 via-indigo-50 to-violet-50">
      <div className="max-w-4xl mx-auto">
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-2xl mb-6 text-white">
            <span className="text-5xl">⚖️</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-3">Risk Management</h1>
          <p className="text-xl text-gray-600">Taking smart risks with your money</p>
        </motion.div>

        {/* The Concept */}
        <motion.div
          className="bg-white rounded-3xl p-8 shadow-xl mb-8 border border-gray-100"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">What is Financial Risk?</h2>
          <p className="text-gray-600 text-center mb-6">
            Risk is the possibility of losing money on an investment. Different investments have different risk levels.
          </p>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-5 bg-green-50 rounded-2xl text-center border-2 border-green-200">
              <div className="text-2xl font-bold text-green-600 mb-1">Low Risk</div>
              <p className="text-sm text-gray-600">Savings accounts, CDs, Treasury bonds</p>
              <p className="text-xs text-green-600 mt-2">~0.5-3% return</p>
            </div>
            <div className="p-5 bg-amber-50 rounded-2xl text-center border-2 border-amber-200">
              <div className="text-2xl font-bold text-amber-600 mb-1">Medium Risk</div>
              <p className="text-sm text-gray-600">Balanced funds, corporate bonds</p>
              <p className="text-xs text-amber-600 mt-2">~5-8% return</p>
            </div>
            <div className="p-5 bg-red-50 rounded-2xl text-center border-2 border-red-200">
              <div className="text-2xl font-bold text-red-600 mb-1">High Risk</div>
              <p className="text-sm text-gray-600">Individual stocks, crypto, startups</p>
              <p className="text-xs text-red-600 mt-2">-90% to 1000%+</p>
            </div>
          </div>
        </motion.div>

        {/* Cooking Analogy */}
        <motion.div
          className="bg-gradient-to-r from-amber-100 to-orange-100 rounded-2xl p-6 border-2 border-amber-200 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="font-bold text-lg mb-2 text-amber-800">Think of Risk Like Spice in Cooking</h3>
          <p className="text-amber-700">
            Too little is boring, too much can ruin the dish. Finding the right balance is key to a satisfying result!
          </p>
        </motion.div>

        <div className="flex justify-center">
          <motion.button
            onClick={onNext}
            className="px-10 py-4 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold text-lg shadow-xl hover:shadow-2xl transition-all"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Understand Risk-Reward
          </motion.button>
        </div>
      </div>
    </div>
  );
};

// Risk-Reward Page
const RiskRewardPage = ({ onNext, onPrev }) => {
  const [selectedLevel, setSelectedLevel] = useState(null);

  const riskLevels = [
    { name: "Savings Account", risk: 1, reward: "0.5%", color: "green" },
    { name: "Bonds", risk: 3, reward: "3-5%", color: "teal" },
    { name: "Index Funds", risk: 5, reward: "7-10%", color: "blue" },
    { name: "Individual Stocks", risk: 7, reward: "0-100%+", color: "amber" },
    { name: "Crypto", risk: 10, reward: "-90% to 1000%+", color: "red" }
  ];

  return (
    <div className="min-h-screen p-6 pt-20 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      <div className="max-w-4xl mx-auto">
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">The Risk-Reward Tradeoff</h1>
          <p className="text-gray-600">Higher potential rewards usually come with higher risks</p>
        </motion.div>

        {/* Risk Scale Visualization */}
        <div className="bg-white rounded-2xl p-8 shadow-xl mb-8">
          <div className="space-y-4">
            {riskLevels.map((level, idx) => (
              <motion.div
                key={idx}
                className={`p-4 rounded-xl cursor-pointer transition-all border-2 ${
                  selectedLevel === idx ? `border-${level.color}-500 bg-${level.color}-50` : 'border-gray-200 hover:border-gray-300'
                }`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => setSelectedLevel(selectedLevel === idx ? null : idx)}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-800">{level.name}</span>
                  <span className={`font-bold text-${level.color}-600`}>{level.reward} avg return</span>
                </div>
                <div className="mt-2 bg-gray-200 rounded-full h-3 overflow-hidden">
                  <motion.div
                    className={`h-full bg-gradient-to-r from-${level.color}-400 to-${level.color}-600`}
                    initial={{ width: 0 }}
                    animate={{ width: `${level.risk * 10}%` }}
                    transition={{ delay: 0.5 + idx * 0.1 }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Low Risk</span>
                  <span>High Risk</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Key Point */}
        <motion.div
          className="bg-gradient-to-r from-blue-100 to-indigo-100 rounded-2xl p-6 border-2 border-blue-200 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h4 className="font-bold text-lg text-blue-800 mb-2">The Golden Rule</h4>
          <p className="text-blue-700">
            There's no free lunch in investing. If someone promises high returns with no risk, it's almost certainly a scam.
          </p>
        </motion.div>

        <div className="flex justify-center gap-4">
          <button onClick={onPrev} className="px-8 py-4 rounded-xl bg-white text-gray-700 font-semibold shadow-lg border border-gray-200 hover:bg-gray-50">
            Back
          </button>
          <button onClick={onNext} className="px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold shadow-lg hover:shadow-xl">
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

// Risk Tolerance Page
const RiskTolerancePage = ({ onNext, onPrev }) => {
  const factors = [
    { factor: "Age", low: "Older (near retirement)", high: "Younger (decades to invest)", icon: "🎂" },
    { factor: "Income Stability", low: "Unstable / freelance", high: "Stable job / multiple streams", icon: "💼" },
    { factor: "Time Horizon", low: "Need money soon", high: "Won't need for 20+ years", icon: "⏰" },
    { factor: "Emergency Fund", low: "No savings buffer", high: "6+ months expenses saved", icon: "🏦" },
    { factor: "Sleep Test", low: "Panic at any loss", high: "Can handle 20%+ drops", icon: "😴" }
  ];

  return (
    <div className="min-h-screen p-6 pt-20 bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50">
      <div className="max-w-4xl mx-auto">
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">Know Your Risk Tolerance</h1>
          <p className="text-gray-600">Risk tolerance is how much risk YOU can handle</p>
        </motion.div>

        <div className="bg-white rounded-2xl p-8 shadow-xl mb-8">
          <h3 className="font-bold text-lg text-gray-800 mb-6 text-center">Factors That Affect Your Risk Tolerance</h3>

          <div className="space-y-4">
            {factors.map((item, idx) => (
              <motion.div
                key={idx}
                className="bg-gray-50 rounded-xl p-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{item.icon}</span>
                  <span className="font-bold text-gray-800">{item.factor}</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                    <div className="text-xs font-semibold text-red-600 mb-1">← Less Risk Capacity</div>
                    <p className="text-sm text-gray-600">{item.low}</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="text-xs font-semibold text-green-600 mb-1">More Risk Capacity →</div>
                    <p className="text-sm text-gray-600">{item.high}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Roller Coaster Analogy */}
        <motion.div
          className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-6 border-2 border-purple-200 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <h4 className="font-bold text-lg text-purple-800 mb-2">Like a Roller Coaster</h4>
          <p className="text-purple-700">
            Some people love the thrills, others prefer the carousel. Neither is wrong - know which rider you are!
          </p>
        </motion.div>

        <div className="flex justify-center gap-4">
          <button onClick={onPrev} className="px-8 py-4 rounded-xl bg-white text-gray-700 font-semibold shadow-lg border border-gray-200 hover:bg-gray-50">
            Back
          </button>
          <button onClick={onNext} className="px-8 py-4 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold shadow-lg hover:shadow-xl">
            Try Risk Scenarios
          </button>
        </div>
      </div>
    </div>
  );
};

// Risk Assessment Game
const RiskAssessmentGame = ({ onNext }) => {
  const [currentScenario, setCurrentScenario] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [profile, setProfile] = useState({ conservative: 0, moderate: 0, aggressive: 0 });
  const [gameComplete, setGameComplete] = useState(false);

  const handleAnswer = (option) => {
    setSelectedAnswer(option);
    setProfile({ ...profile, [option.type]: profile[option.type] + 1 });
  };

  const nextScenario = () => {
    setSelectedAnswer(null);
    if (currentScenario < riskScenarios.length - 1) {
      setCurrentScenario(currentScenario + 1);
    } else {
      setGameComplete(true);
    }
  };

  const getProfile = () => {
    const { conservative, moderate, aggressive } = profile;
    if (aggressive > moderate && aggressive > conservative) {
      return { type: "Aggressive", color: "red", desc: "You're comfortable with high risk for high potential returns." };
    }
    if (conservative > moderate && conservative > aggressive) {
      return { type: "Conservative", color: "blue", desc: "You prefer stability and capital preservation." };
    }
    return { type: "Moderate", color: "green", desc: "You balance growth potential with risk management." };
  };

  if (gameComplete) {
    const result = getProfile();
    return (
      <div className="min-h-screen p-6 pt-20 bg-gradient-to-br from-indigo-50 to-purple-100 flex items-center justify-center">
        <motion.div
          className="bg-white rounded-3xl shadow-2xl p-10 text-center max-w-md w-full"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <div className={`w-24 h-24 mx-auto rounded-full bg-${result.color}-100 flex items-center justify-center mb-6 text-5xl border-4 border-${result.color}-300`}>
            {result.type === 'Aggressive' ? '🚀' : result.type === 'Conservative' ? '🛡️' : '⚖️'}
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Your Risk Profile</h2>
          <div className={`text-3xl font-bold text-${result.color}-600 mb-3`}>{result.type} Investor</div>
          <p className="text-gray-600 mb-6">{result.desc}</p>

          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-blue-50 p-3 rounded-xl">
              <div className="text-lg font-bold text-blue-600">{profile.conservative}</div>
              <div className="text-xs text-gray-500">Conservative</div>
            </div>
            <div className="bg-green-50 p-3 rounded-xl">
              <div className="text-lg font-bold text-green-600">{profile.moderate}</div>
              <div className="text-xs text-gray-500">Moderate</div>
            </div>
            <div className="bg-red-50 p-3 rounded-xl">
              <div className="text-lg font-bold text-red-600">{profile.aggressive}</div>
              <div className="text-xs text-gray-500">Aggressive</div>
            </div>
          </div>

          <button
            onClick={onNext}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold text-lg shadow-lg"
          >
            Continue to Quiz
          </button>
        </motion.div>
      </div>
    );
  }

  const scenario = riskScenarios[currentScenario];

  return (
    <div className="min-h-screen p-6 pt-20 bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
      <div className="max-w-3xl mx-auto">
        <motion.div
          className="text-center mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Risk Scenarios</h1>
          <p className="text-gray-600">How would you handle these situations?</p>
          <div className="flex justify-center gap-2 mt-4">
            {riskScenarios.map((_, idx) => (
              <div
                key={idx}
                className={`w-3 h-3 rounded-full transition-all ${
                  idx < currentScenario ? 'bg-orange-500' :
                  idx === currentScenario ? 'bg-orange-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </motion.div>

        <motion.div
          key={currentScenario}
          className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="p-6 bg-gradient-to-r from-orange-100 to-amber-100 border-b border-orange-200">
            <h3 className="text-xl font-bold text-gray-800">{scenario.title}</h3>
          </div>

          <div className="p-6">
            <p className="text-gray-700 mb-6 p-4 bg-gray-50 rounded-xl">{scenario.scenario}</p>

            {!selectedAnswer ? (
              <div className="space-y-3">
                {scenario.options.map((option, idx) => (
                  <motion.button
                    key={idx}
                    onClick={() => handleAnswer(option)}
                    className="w-full p-4 rounded-xl text-left border-2 border-gray-200 hover:border-orange-400 hover:bg-orange-50 transition-all"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    {option.text}
                  </motion.button>
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className={`p-5 rounded-xl mb-4 ${
                  selectedAnswer.type === 'moderate' ? 'bg-green-50 border-2 border-green-300' :
                  selectedAnswer.type === 'aggressive' ? 'bg-amber-50 border-2 border-amber-300' :
                  'bg-blue-50 border-2 border-blue-300'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`font-bold ${
                      selectedAnswer.type === 'moderate' ? 'text-green-700' :
                      selectedAnswer.type === 'aggressive' ? 'text-amber-700' :
                      'text-blue-700'
                    }`}>
                      {selectedAnswer.type === 'moderate' ? 'Balanced Approach!' :
                       selectedAnswer.type === 'aggressive' ? 'Bold Move!' :
                       'Playing it Safe!'}
                    </span>
                  </div>
                  <p className="text-gray-700">{selectedAnswer.feedback}</p>
                </div>

                <button
                  onClick={nextScenario}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold shadow-lg"
                >
                  {currentScenario < riskScenarios.length - 1 ? 'Next Scenario' : 'See Your Profile'}
                </button>
              </motion.div>
            )}
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
      <div className="min-h-screen p-6 pt-20 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <motion.div
          className="bg-white rounded-3xl shadow-2xl p-10 text-center max-w-md w-full"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <div className={`w-28 h-28 mx-auto rounded-full flex items-center justify-center mb-6 shadow-xl text-5xl ${passed ? 'bg-gradient-to-br from-green-400 to-emerald-500' : 'bg-gradient-to-br from-amber-400 to-orange-500'}`}>
            {passed ? '⚖️' : '📚'}
          </div>

          <h2 className="text-3xl font-bold text-gray-800 mb-3">{passed ? 'Risk Master!' : 'Keep Learning!'}</h2>
          <p className="text-xl text-gray-600 mb-6">
            You scored <span className="font-bold text-blue-600">{score}/{questions.length}</span> ({(score/questions.length*100).toFixed(0)}%)
          </p>

          {passed ? (
            <div className="bg-green-50 border-2 border-green-400 rounded-xl p-5 mb-6">
              <p className="text-green-800 font-bold">Congratulations! You passed!</p>
              <p className="text-green-700 text-sm">You understand risk management!</p>
            </div>
          ) : (
            <div className="bg-amber-50 border-2 border-amber-400 rounded-xl p-5 mb-6">
              <p className="text-amber-800 font-bold">You need 80% to pass</p>
              <p className="text-amber-700 text-sm">Review the material and try again!</p>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <button onClick={onRetake} className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold hover:shadow-lg transition-shadow">
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

  const q = questions[currentQuestion];

  return (
    <div className="min-h-screen p-6 pt-20 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-3xl mx-auto">
        {/* Progress */}
        <div className="flex justify-center gap-1.5 mb-6">
          {questions.map((_, idx) => (
            <div
              key={idx}
              className={`h-2 rounded-full transition-all ${
                idx < currentQuestion ? 'w-8 bg-blue-500' :
                idx === currentQuestion ? 'w-8 bg-blue-400' : 'w-2 bg-gray-300'
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
              <span className="text-sm font-bold text-blue-600 uppercase tracking-wider">
                Question {currentQuestion + 1} of {questions.length}
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
                          ? 'bg-blue-50 border-blue-500 scale-[1.01]'
                          : 'border-gray-200 hover:border-blue-400 hover:bg-blue-50'
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold flex-shrink-0 ${
                      showCorrectness && isCorrect ? 'bg-green-500 text-white' :
                      showCorrectness && isSelected ? 'bg-red-500 text-white' :
                      isSelected ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-500'
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
                className="mt-6 bg-blue-50 border-2 border-blue-200 p-6 rounded-xl"
              >
                <h4 className="font-bold text-blue-600 uppercase tracking-wider text-sm mb-2">Explanation</h4>
                <p className="text-gray-700 mb-4">{q.explanation}</p>
                <button onClick={onNext} className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg font-bold hover:shadow-lg transition-shadow">
                  {currentQuestion < questions.length - 1 ? 'Next Question' : 'Complete Quiz'}
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
const RiskTakingModule = () => {
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

  const modulePassed = isModulePassed(MODULES.RISK_TAKING?.id);
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
        saveScore(MODULES.RISK_TAKING.id, (finalScore / shuffledQuestions.length) * 100);
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
        emoji="⚖️"
        moduleName="Risk Management"
        description="You understand how to take smart risks with your money!"
        gradientClasses="from-blue-50 via-indigo-100 to-purple-200"
        onReviewClick={() => setIsReviewMode(true)}
      />
    );
  }

  return (
    <div className="min-h-screen relative">
      <button
        className="fixed top-4 left-4 px-4 py-2 rounded-lg text-blue-700 hover:bg-white/80 backdrop-blur-sm font-medium transition z-50 shadow-sm border border-blue-200 bg-white/70"
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
          {currentStep === 1 && <RiskRewardPage onNext={handleNext} onPrev={handlePrev} />}
          {currentStep === 2 && <RiskTolerancePage onNext={handleNext} onPrev={handlePrev} />}
          {currentStep === 3 && <RiskAssessmentGame onNext={handleNext} />}
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
              questions={shuffledQuestions}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default RiskTakingModule;
