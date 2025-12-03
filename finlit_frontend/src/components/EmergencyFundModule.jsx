import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Calculator, DollarSign, AlertTriangle, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const EmergencyFundModule = () => {
  const navigate = useNavigate();
  const [currentPhase, setCurrentPhase] = useState('story'); // 'story', 'game', 'calculator', 'results'
  const [storyStep, setStoryStep] = useState(0);
  const [gameStep, setGameStep] = useState(0);
  const [step, setStep] = useState(1);
  const [monthlyExpenses, setMonthlyExpenses] = useState({
    housing: '',
    utilities: '',
    groceries: '',
    transportation: '',
    insurance: '',
    other: ''
  });
  const [selectedScenario, setSelectedScenario] = useState('');
  const [currentSavings, setCurrentSavings] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [monthlySavings, setMonthlySavings] = useState('');
  const [totalXP, setTotalXP] = useState(0);
  const [achievements, setAchievements] = useState([]);
  const [milestone, setMilestone] = useState(0);

  // Interactive story content
  const storyContent = [
    {
      id: 1,
      character: "😨 Worried Emma",
      characterImage: "👩‍💼",
      scene: "🏠 Emma's Living Room",
      title: "The Day Everything Went Wrong",
      story: "Meet Emma. She's 25, has a good job, and lives paycheck to paycheck. One Tuesday morning, her car wouldn't start, and she discovered it needed a $800 repair.",
      dialogue: "Oh no! How am I going to pay for this? I only have $50 in my savings account!",
      lesson: "This is why we need emergency funds - unexpected expenses happen to everyone!",
      visual: "🚗💸",
      emotion: "😰",
      background: "bg-gradient-to-br from-red-100 to-orange-100"
    },
    {
      id: 2,
      character: "🧙‍♂️ Wise Professor Fund",
      characterImage: "🧙‍♂️",
      scene: "🎓 Financial Wisdom Academy",
      title: "What is an Emergency Fund?",
      story: "Professor Fund appears to help Emma understand emergency funds. He's been teaching financial wisdom for decades.",
      dialogue: "An emergency fund is like a financial superhero - it saves the day when unexpected expenses attack! It's money you set aside for true emergencies.",
      lesson: "Emergency funds are for unexpected, necessary expenses - not vacations or shopping sprees!",
      visual: "🦸‍♀️💰",
      emotion: "🤓",
      background: "bg-gradient-to-br from-blue-100 to-indigo-100"
    },
    {
      id: 3,
      character: "📊 Calculator Kate",
      characterImage: "🧮",
      scene: "💼 The Planning Room",
      title: "How Much Do You Need?",
      story: "Calculator Kate shows Emma the magic formula. She helps people figure out exactly how much to save.",
      dialogue: "The rule of thumb is 3-6 months of essential expenses. Think about what you NEED to survive, not what you WANT.",
      lesson: "Your emergency fund should cover: rent, food, utilities, insurance, minimum debt payments, and transportation.",
      visual: "📝✨",
      emotion: "🤔",
      background: "bg-gradient-to-br from-green-100 to-emerald-100"
    },
    {
      id: 4,
      character: "🎯 Strategic Sam",
      characterImage: "🎯",
      scene: "🏛️ The Strategy Hall",
      title: "Building Your Plan",
      story: "Strategic Sam teaches Emma different approaches to building an emergency fund based on her situation.",
      dialogue: "Some people need more security (6 months), others can manage with less (3 months). It depends on your job stability and family situation.",
      lesson: "Choose your target based on your risk level: High risk jobs = more savings, Stable jobs = less savings needed.",
      visual: "⚖️🎯",
      emotion: "💪",
      background: "bg-gradient-to-br from-purple-100 to-pink-100"
    },
    {
      id: 5,
      character: "🌱 Growth Guru",
      characterImage: "🌱",
      scene: "🌳 The Prosperity Garden",
      title: "Making It Happen",
      story: "Growth Guru shows Emma that building an emergency fund is like growing a tree - it takes time, but the protection is worth it.",
      dialogue: "Start small! Even $25 per month becomes $300 in a year. The key is consistency, not perfection. Every dollar counts!",
      lesson: "Tips: Automate your savings, start with small amounts, keep it in a separate account, and celebrate milestones!",
      visual: "🌱➡️🌳",
      emotion: "😊",
      background: "bg-gradient-to-br from-yellow-100 to-green-100"
    }
  ];

  // Interactive mini-games
  const miniGames = [
    {
      id: 1,
      type: "sorting",
      title: "Emergency vs Non-Emergency",
      character: "🧙‍♂️ Professor Fund",
      instruction: "Sort these expenses into Emergency or Non-Emergency categories!",
      expenses: [
        { id: 1, name: "Car repair", amount: 800, category: "emergency", emoji: "🚗", sorted: false },
        { id: 2, name: "Vacation to Hawaii", amount: 2000, category: "non-emergency", emoji: "🏖️", sorted: false },
        { id: 3, name: "Medical bill", amount: 500, category: "emergency", emoji: "🏥", sorted: false },
        { id: 4, name: "New gaming console", amount: 400, category: "non-emergency", emoji: "🎮", sorted: false },
        { id: 5, name: "Job loss (3 months expenses)", amount: 6000, category: "emergency", emoji: "💼", sorted: false },
        { id: 6, name: "Designer handbag", amount: 600, category: "non-emergency", emoji: "👜", sorted: false }
      ]
    },
    {
      id: 2,
      type: "calculator",
      title: "Emergency Fund Calculator Challenge", 
      character: "📊 Calculator Kate",
      instruction: "Help different people calculate their emergency fund needs!",
      people: [
        { 
          name: "Alex", emoji: "👨‍💻", 
          expenses: { rent: 1200, food: 400, utilities: 150, transport: 200 },
          jobType: "stable", months: 3
        },
        { 
          name: "Sarah", emoji: "👩‍🎨", 
          expenses: { rent: 800, food: 300, utilities: 100, transport: 150 },
          jobType: "freelancer", months: 6
        }
      ],
      currentPerson: 0,
      userAnswer: 0
    },
    {
      id: 3,
      type: "scenario",
      title: "Real-Life Emergency Scenarios",
      character: "🎭 Scenario Sam",
      instruction: "Choose the best response to each emergency situation!",
      scenarios: [
        {
          id: 1,
          situation: "Your laptop breaks and you need it for work",
          cost: 1200,
          emoji: "💻",
          options: [
            { text: "Use emergency fund", correct: true, explanation: "Perfect use of emergency fund!" },
            { text: "Put it on credit card", correct: false, explanation: "This adds debt when you have savings" },
            { text: "Borrow from friends", correct: false, explanation: "Use your own emergency fund first" }
          ]
        },
        {
          id: 2,
          situation: "You see a great deal on a dream vacation",
          cost: 3000,
          emoji: "✈️",
          options: [
            { text: "Use emergency fund", correct: false, explanation: "This isn't an emergency - it's a want!" },
            { text: "Save up separately", correct: true, explanation: "Great choice! Keep emergency fund intact" },
            { text: "Use credit card", correct: false, explanation: "Don't go into debt for vacations" }
          ]
        }
      ],
      currentScenario: 0,
      selectedAnswer: null
    }
  ];

  const scenarios = [
    {
      id: 'conservative',
      title: 'Conservative (6 months)',
      description: 'Recommended for single income, freelancers, or high-risk jobs',
      months: 6,
      color: 'bg-red-100 border-red-300 text-red-800'
    },
    {
      id: 'moderate',
      title: 'Moderate (4-5 months)',
      description: 'Good balance for stable employment with some job security',
      months: 4.5,
      color: 'bg-yellow-100 border-yellow-300 text-yellow-800'
    },
    {
      id: 'minimum',
      title: 'Minimum (3 months)',
      description: 'Basic protection for very stable jobs or dual income',
      months: 3,
      color: 'bg-green-100 border-green-300 text-green-800'
    }
  ];

  const calculateTotalExpenses = () => {
    return Object.values(monthlyExpenses).reduce((total, expense) => {
      return total + (parseFloat(expense) || 0);
    }, 0);
  };

  const getTargetAmount = () => {
    const total = calculateTotalExpenses();
    const scenario = scenarios.find(s => s.id === selectedScenario);
    return scenario ? total * scenario.months : 0;
  };

  const getMonthsToSave = () => {
    const target = getTargetAmount();
    const current = parseFloat(currentSavings) || 0;
    const monthly = parseFloat(monthlySavings) || 0;
    
    if (monthly <= 0) return 0;
    const remaining = Math.max(0, target - current);
    return Math.ceil(remaining / monthly);
  };

  const getProgressPercentage = () => {
    const target = getTargetAmount();
    const current = parseFloat(currentSavings) || 0;
    if (target === 0) return 0;
    return Math.min(100, (current / target) * 100);
  };

  const nextStoryStep = () => {
    if (storyStep < storyContent.length - 1) {
      setStoryStep(storyStep + 1);
    } else {
      setCurrentPhase('game');
    }
  };

  const nextGameStep = () => {
    if (gameStep < miniGames.length - 1) {
      setGameStep(gameStep + 1);
    } else {
      setCurrentPhase('calculator');
    }
  };

  const prevGameStep = () => {
    if (gameStep > 0) {
      setGameStep(gameStep - 1);
    }
  };

  const prevStoryStep = () => {
    if (storyStep > 0) {
      setStoryStep(storyStep - 1);
    }
  };

  const handleExpenseChange = (category, value) => {
    setMonthlyExpenses({
      ...monthlyExpenses,
      [category]: value
    });
  };

  const expenseCategories = [
    { key: 'housing', label: 'Housing (Rent/Mortgage)', icon: '🏠', placeholder: '1200' },
    { key: 'utilities', label: 'Utilities', icon: '💡', placeholder: '150' },
    { key: 'groceries', label: 'Groceries', icon: '🛒', placeholder: '400' },
    { key: 'transportation', label: 'Transportation', icon: '🚗', placeholder: '300' },
    { key: 'insurance', label: 'Insurance', icon: '🛡️', placeholder: '200' },
    { key: 'other', label: 'Other Essential Expenses', icon: '📝', placeholder: '250' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-emerald-50 to-blue-100 p-6">
      {/* Header */}
      <motion.div
        className="flex items-center justify-between mb-8 bg-white rounded-xl p-4 shadow-lg"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <button
          onClick={() => navigate('/game')}
          className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Roadmap
        </button>
        
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">Emergency Fund Calculator</h1>
          <p className="text-sm text-gray-600">Build Your Financial Safety Net</p>
        </div>

        <div className="flex items-center gap-2 text-emerald-600">
          <Calculator className="w-5 h-5" />
          <span className="font-semibold">75 XP</span>
        </div>
      </motion.div>

      <div className="max-w-4xl mx-auto">
        {currentPhase === 'story' ? (
          /* Story Learning Phase */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* Story Progress */}
            <div className="mb-8">
              <div className="flex justify-between text-sm text-emerald-600 mb-2">
                <span>Story Step {storyStep + 1} of {storyContent.length}</span>
                <span>{Math.round(((storyStep + 1) / storyContent.length) * 100)}% Complete</span>
              </div>
              <div className="w-full bg-emerald-100 rounded-full h-3">
                <motion.div
                  className="bg-gradient-to-r from-emerald-500 to-blue-500 h-3 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${((storyStep + 1) / storyContent.length) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>

            {/* Story Card */}
            <motion.div
              key={storyStep}
              className="bg-gradient-to-br from-emerald-50 to-blue-50 rounded-2xl p-8 shadow-lg mb-6 border border-emerald-200"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Scene Setting */}
              <div className="text-center mb-6">
                <motion.div 
                  className="text-6xl mb-4"
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                >
                  {storyContent[storyStep].visual}
                </motion.div>
                <div className="text-lg text-emerald-600 font-semibold mb-2">
                  {storyContent[storyStep].scene}
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  {storyContent[storyStep].title}
                </h2>
              </div>

              {/* Character Introduction */}
              <div className="bg-white rounded-xl p-6 mb-6 shadow-md border-l-4 border-emerald-500">
                <div className="flex items-center mb-3">
                  <span className="text-3xl mr-3">{storyContent[storyStep].emotion}</span>
                  <div className="font-bold text-lg text-gray-800">
                    {storyContent[storyStep].character}
                  </div>
                </div>
                <p className="text-gray-700 leading-relaxed mb-3">
                  {storyContent[storyStep].story}
                </p>
              </div>

              {/* Character Dialogue */}
              <div className="bg-white rounded-xl p-6 mb-6 shadow-md">
                <div className="bg-gradient-to-r from-blue-100 to-emerald-100 rounded-lg p-4 mb-4">
                  <p className="text-gray-700 italic text-lg leading-relaxed">
                    💬 "{storyContent[storyStep].dialogue}"
                  </p>
                </div>
              </div>

              {/* Key Lesson */}
              <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-xl p-6 border border-yellow-300">
                <h4 className="text-lg font-bold text-orange-800 mb-2">🎓 Key Lesson:</h4>
                <p className="text-orange-700 leading-relaxed">
                  {storyContent[storyStep].lesson}
                </p>
              </div>
            </motion.div>

            {/* Story Navigation */}
            <div className="flex justify-between items-center">
              <button
                onClick={prevStoryStep}
                disabled={storyStep === 0}
                className={`px-6 py-3 rounded-xl font-medium transition ${
                  storyStep === 0
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-300 hover:bg-gray-400 text-gray-700'
                }`}
              >
                ← Previous
              </button>

              <div className="flex gap-2">
                {storyContent.map((_, index) => (
                  <div
                    key={index}
                    className={`w-3 h-3 rounded-full ${
                      index === storyStep ? 'bg-emerald-500' : 
                      index < storyStep ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={nextStoryStep}
                className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition"
              >
                {storyStep === storyContent.length - 1 ? 'Play Games! 🎮' : 'Next →'}
              </button>
            </div>
          </motion.div>
        ) : currentPhase === 'game' ? (
          /* Interactive Mini-Games Phase */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* Game Progress */}
            <div className="mb-8">
              <div className="flex justify-between text-sm text-emerald-600 mb-2">
                <span>Game {gameStep + 1} of {miniGames.length}</span>
                <span>{Math.round(((gameStep + 1) / miniGames.length) * 100)}% Complete</span>
              </div>
              <div className="w-full bg-emerald-100 rounded-full h-3">
                <motion.div
                  className="bg-gradient-to-r from-emerald-500 to-blue-500 h-3 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${((gameStep + 1) / miniGames.length) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>

            {/* Mini-Game Card */}
            <motion.div
              key={gameStep}
              className="bg-gradient-to-br from-emerald-50 to-blue-50 rounded-2xl p-8 shadow-lg mb-6 border-2 border-emerald-200"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Game Header */}
              <div className="text-center mb-8">
                <motion.div 
                  className="text-6xl mb-4"
                  animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, 10, -10, 0]
                  }}
                  transition={{ duration: 3, repeat: Infinity, repeatDelay: 1 }}
                >
                  🎮
                </motion.div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">
                  {miniGames[gameStep].title}
                </h2>
                <div className="text-lg font-semibold text-emerald-600 mb-4">
                  {miniGames[gameStep].character}
                </div>
                <p className="text-gray-600 text-lg">
                  {miniGames[gameStep].instruction}
                </p>
              </div>

              {/* Sorting Game */}
              {miniGames[gameStep].type === 'sorting' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Emergency Category */}
                    <div className="bg-red-50 rounded-xl p-6 border-2 border-red-200">
                      <h3 className="text-lg font-bold text-red-800 mb-4 text-center">
                        🚨 Emergency Expenses
                      </h3>
                      <div className="space-y-3 min-h-[200px]">
                        {miniGames[gameStep].expenses
                          .filter(expense => expense.category === 'emergency')
                          .map((expense) => (
                            <motion.div
                              key={expense.id}
                              className="bg-white p-4 rounded-lg shadow-md border border-red-200 cursor-pointer"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <span className="text-2xl">{expense.emoji}</span>
                                  <div>
                                    <div className="font-medium">{expense.name}</div>
                                    <div className="text-sm text-gray-600">${expense.amount}</div>
                                  </div>
                                </div>
                                <div className="text-green-600 font-bold">✓</div>
                              </div>
                            </motion.div>
                          ))}
                      </div>
                    </div>

                    {/* Non-Emergency Category */}
                    <div className="bg-blue-50 rounded-xl p-6 border-2 border-blue-200">
                      <h3 className="text-lg font-bold text-blue-800 mb-4 text-center">
                        🛍️ Non-Emergency Expenses
                      </h3>
                      <div className="space-y-3 min-h-[200px]">
                        {miniGames[gameStep].expenses
                          .filter(expense => expense.category === 'non-emergency')
                          .map((expense) => (
                            <motion.div
                              key={expense.id}
                              className="bg-white p-4 rounded-lg shadow-md border border-blue-200"
                              whileHover={{ scale: 1.02 }}
                              initial={{ opacity: 0.7 }}
                              animate={{ opacity: 1 }}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <span className="text-2xl">{expense.emoji}</span>
                                  <div>
                                    <div className="font-medium">{expense.name}</div>
                                    <div className="text-sm text-gray-600">${expense.amount}</div>
                                  </div>
                                </div>
                                <div className="text-green-600 font-bold">✓</div>
                              </div>
                            </motion.div>
                          ))}
                      </div>
                    </div>
                  </div>

                  {/* Success Message */}
                  <motion.div
                    className="bg-green-100 border border-green-300 rounded-lg p-4 text-center"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="text-3xl mb-2">🎉</div>
                    <div className="font-bold text-green-800">Perfect Sorting!</div>
                    <div className="text-sm text-green-600">Now you know when to use your emergency fund! +25 XP</div>
                  </motion.div>
                </div>
              )}

              {/* Calculator Challenge Game */}
              {miniGames[gameStep].type === 'calculator' && (
                <div className="space-y-6">
                  <div className="bg-white rounded-xl p-6 shadow-md">
                    <div className="text-center mb-6">
                      <span className="text-4xl mb-2 block">
                        {miniGames[gameStep].people[0].emoji}
                      </span>
                      <h3 className="text-xl font-bold text-gray-800">
                        Help {miniGames[gameStep].people[0].name} Calculate Their Emergency Fund!
                      </h3>
                      <p className="text-gray-600 mt-2">
                        Job Type: {miniGames[gameStep].people[0].jobType === 'stable' ? 'Stable Employment' : 'Freelancer'}<br />
                        Recommended: {miniGames[gameStep].people[0].months} months of expenses
                      </p>
                    </div>

                    <div className="space-y-4 mb-6">
                      <div className="grid grid-cols-2 gap-4">
                        {Object.entries(miniGames[gameStep].people[0].expenses).map(([category, amount]) => (
                          <div key={category} className="bg-gray-50 rounded-lg p-3">
                            <div className="text-sm text-gray-600 capitalize">{category}</div>
                            <div className="text-lg font-bold">${amount}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="text-center bg-emerald-50 rounded-lg p-6">
                      <div className="text-sm text-gray-600 mb-2">Emergency Fund Needed:</div>
                      <div className="text-3xl font-bold text-emerald-600">
                        ${(Object.values(miniGames[gameStep].people[0].expenses).reduce((sum, val) => sum + val, 0) * miniGames[gameStep].people[0].months).toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500 mt-2">
                        (${Object.values(miniGames[gameStep].people[0].expenses).reduce((sum, val) => sum + val, 0)} × {miniGames[gameStep].people[0].months} months)
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Scenario Game */}
              {miniGames[gameStep].type === 'scenario' && (
                <div className="space-y-6">
                  <div className="bg-white rounded-xl p-6 shadow-md">
                    <div className="text-center mb-6">
                      <span className="text-4xl mb-4 block">
                        {miniGames[gameStep].scenarios[0].emoji}
                      </span>
                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <h3 className="text-lg font-bold text-gray-800 mb-2">Scenario:</h3>
                        <p className="text-gray-700">{miniGames[gameStep].scenarios[0].situation}</p>
                        <p className="text-emerald-600 font-bold mt-2">Cost: ${miniGames[gameStep].scenarios[0].cost}</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {miniGames[gameStep].scenarios[0].options.map((option, index) => (
                        <motion.button
                          key={index}
                          className="w-full p-4 rounded-lg border-2 text-left transition-all bg-white hover:bg-emerald-50 border-gray-200 hover:border-emerald-300"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full border-2 border-emerald-300 text-emerald-500 flex items-center justify-center font-bold">
                              {String.fromCharCode(65 + index)}
                            </div>
                            <span className="text-lg">{option.text}</span>
                          </div>
                        </motion.button>
                      ))}
                    </div>

                    {/* Explanation */}
                    <motion.div
                      className="mt-6 p-4 bg-emerald-50 border-l-4 border-emerald-400 rounded-r-lg"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      transition={{ duration: 0.3 }}
                    >
                      <p className="text-emerald-800">
                        ✓ Correct! {miniGames[gameStep].scenarios[0].options.find(o => o.correct)?.explanation}
                      </p>
                    </motion.div>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Game Navigation */}
            <div className="flex justify-between items-center">
              <button
                onClick={prevGameStep}
                disabled={gameStep === 0}
                className={`px-6 py-3 rounded-xl font-medium transition ${
                  gameStep === 0
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-300 hover:bg-gray-400 text-gray-700'
                }`}
              >
                ← Previous Game
              </button>

              <div className="flex gap-2">
                {miniGames.map((_, index) => (
                  <div
                    key={index}
                    className={`w-3 h-3 rounded-full ${
                      index === gameStep ? 'bg-emerald-500' : 
                      index < gameStep ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={nextGameStep}
                className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white rounded-xl font-medium transition shadow-lg"
              >
                {gameStep === miniGames.length - 1 ? 'Start Calculator! 🧮' : 'Next Game →'}
              </button>
            </div>
          </motion.div>
        ) : (
          /* Original Calculator Phase */
          <>
            {/* Progress Indicator */}
            <div className="flex items-center justify-center mb-8">
              {[1, 2, 3, 4].map((stepNum) => (
                <div key={stepNum} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                    step >= stepNum ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {stepNum}
                  </div>
                  {stepNum < 4 && <div className={`w-12 h-1 ${step > stepNum ? 'bg-blue-500' : 'bg-gray-200'}`} />}
                </div>
              ))}
            </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Calculate Monthly Expenses */}
          {step === 1 && (
            <motion.div
              key="step1"
              className="bg-white rounded-2xl p-8 shadow-lg"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5 }}
            >
              <div className="text-center mb-8">
                <Calculator className="w-12 h-12 mx-auto text-blue-500 mb-4" />
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Calculate Your Monthly Expenses</h2>
                <p className="text-gray-600">Enter your essential monthly expenses to determine your emergency fund target.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {expenseCategories.map((category) => (
                  <div key={category.key} className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <span className="text-lg">{category.icon}</span>
                      {category.label}
                    </label>
                    <div className="relative">
                      <DollarSign className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="number"
                        placeholder={category.placeholder}
                        value={monthlyExpenses[category.key]}
                        onChange={(e) => handleExpenseChange(category.key, e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-blue-800">Total Monthly Expenses:</span>
                  <span className="text-xl font-bold text-blue-600">
                    ${calculateTotalExpenses().toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setStep(2)}
                  disabled={calculateTotalExpenses() === 0}
                  className={`px-6 py-3 rounded-lg font-medium transition ${
                    calculateTotalExpenses() === 0
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
                >
                  Next: Choose Your Target
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Choose Emergency Fund Target */}
          {step === 2 && (
            <motion.div
              key="step2"
              className="bg-white rounded-2xl p-8 shadow-lg"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5 }}
            >
              <div className="text-center mb-8">
                <AlertTriangle className="w-12 h-12 mx-auto text-orange-500 mb-4" />
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Choose Your Emergency Fund Target</h2>
                <p className="text-gray-600">Select the scenario that best fits your situation and risk tolerance.</p>
              </div>

              <div className="space-y-4">
                {scenarios.map((scenario) => (
                  <motion.div
                    key={scenario.id}
                    className={`p-6 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedScenario === scenario.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    } ${scenario.color}`}
                    onClick={() => setSelectedScenario(scenario.id)}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-bold mb-2">{scenario.title}</h3>
                        <p className="text-sm">{scenario.description}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">
                          ${(calculateTotalExpenses() * scenario.months).toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600">{scenario.months} months coverage</div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="flex justify-between mt-8">
                <button
                  onClick={() => setStep(1)}
                  className="px-6 py-3 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg font-medium transition"
                >
                  Previous
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!selectedScenario}
                  className={`px-6 py-3 rounded-lg font-medium transition ${
                    !selectedScenario
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
                >
                  Next: Current Savings
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Current Savings */}
          {step === 3 && (
            <motion.div
              key="step3"
              className="bg-white rounded-2xl p-8 shadow-lg"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5 }}
            >
              <div className="text-center mb-8">
                <DollarSign className="w-12 h-12 mx-auto text-green-500 mb-4" />
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Current Emergency Savings</h2>
                <p className="text-gray-600">How much do you currently have saved for emergencies?</p>
              </div>

              <div className="max-w-md mx-auto">
                <div className="relative mb-6">
                  <DollarSign className="w-6 h-6 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="number"
                    placeholder="5000"
                    value={currentSavings}
                    onChange={(e) => setCurrentSavings(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 text-xl border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center"
                  />
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Current Progress</span>
                    <span>{getProgressPercentage().toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <motion.div
                      className="bg-green-500 h-3 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${getProgressPercentage()}%` }}
                      transition={{ duration: 1 }}
                    />
                  </div>
                  <div className="flex justify-between text-sm font-medium mt-2">
                    <span className="text-green-600">${parseFloat(currentSavings || 0).toLocaleString()}</span>
                    <span className="text-gray-600">${getTargetAmount().toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between mt-8">
                <button
                  onClick={() => setStep(2)}
                  className="px-6 py-3 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg font-medium transition"
                >
                  Previous
                </button>
                <button
                  onClick={() => setStep(4)}
                  className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition"
                >
                  Next: Savings Plan
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 4: Savings Plan */}
          {step === 4 && (
            <motion.div
              key="step4"
              className="bg-white rounded-2xl p-8 shadow-lg"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5 }}
            >
              <div className="text-center mb-8">
                <TrendingUp className="w-12 h-12 mx-auto text-purple-500 mb-4" />
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Create Your Savings Plan</h2>
                <p className="text-gray-600">How much can you save each month toward your emergency fund?</p>
              </div>

              <div className="max-w-md mx-auto mb-6">
                <div className="relative">
                  <DollarSign className="w-6 h-6 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="number"
                    placeholder="500"
                    value={monthlySavings}
                    onChange={(e) => setMonthlySavings(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 text-xl border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center"
                  />
                </div>
              </div>

              {monthlySavings && (
                <motion.div
                  className="space-y-4 mb-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-blue-600">{getMonthsToSave()}</div>
                      <div className="text-sm text-gray-600">Months to Goal</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-green-600">
                        ${(getTargetAmount() - (parseFloat(currentSavings) || 0)).toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">Remaining to Save</div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        ${((parseFloat(monthlySavings) || 0) * 12).toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">Annual Savings</div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-6 border border-blue-200">
                    <h3 className="text-lg font-bold text-gray-800 mb-3">Your Emergency Fund Plan</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Monthly Expenses:</span>
                        <span className="font-semibold">${calculateTotalExpenses().toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Target Amount ({scenarios.find(s => s.id === selectedScenario)?.months} months):</span>
                        <span className="font-semibold">${getTargetAmount().toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Current Savings:</span>
                        <span className="font-semibold">${parseFloat(currentSavings || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Monthly Contribution:</span>
                        <span className="font-semibold">${parseFloat(monthlySavings || 0).toLocaleString()}</span>
                      </div>
                      <hr className="my-2" />
                      <div className="flex justify-between text-lg">
                        <span className="font-bold">Time to Goal:</span>
                        <span className="font-bold text-blue-600">
                          {getMonthsToSave()} months ({Math.ceil(getMonthsToSave() / 12)} years)
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              <div className="flex justify-between mt-8">
                <button
                  onClick={() => setStep(3)}
                  className="px-6 py-3 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg font-medium transition"
                >
                  Previous
                </button>
                <button
                  onClick={() => navigate('/game')}
                  className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition"
                >
                  Complete Module
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
          </>
        )}
      </div>
    </div>
  );
};

export default EmergencyFundModule;