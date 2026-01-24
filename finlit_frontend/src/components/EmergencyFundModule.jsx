import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Calculator, DollarSign, AlertTriangle, TrendingUp, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useModuleScore, MODULES } from '../hooks/useModuleScore';

const EmergencyFundModule = () => {
  const navigate = useNavigate();
  const { isModulePassed, saveScore } = useModuleScore();

  // Check if module is already passed
  const modulePassed = isModulePassed(MODULES.EMERGENCY_FUND?.id);

  // Review mode - allows viewing content without answering
  const [isReviewMode, setIsReviewMode] = useState(false);

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

  // Game state for interactive games
  const [sortedItems, setSortedItems] = useState({}); // { itemId: 'emergency' | 'non-emergency' }
  const [sortingComplete, setSortingComplete] = useState(false);
  const [calculatorAnswer, setCalculatorAnswer] = useState('');
  const [calculatorComplete, setCalculatorComplete] = useState(false);
  const [calculatorWrongAnswer, setCalculatorWrongAnswer] = useState(null);
  const [scenarioAnswer, setScenarioAnswer] = useState(null);
  const [scenarioFeedback, setScenarioFeedback] = useState('');
  const [scenarioComplete, setScenarioComplete] = useState(false);

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
          expenses: { rent: 1250, food: 400, utilities: 150, transport: 200 },
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

  // PDF Export functionality
  const formatKey = (key) => {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  };

  const formatValue = (key, value) => {
    if (typeof value === 'number') {
      if (key.toLowerCase().includes('percentage') || key.toLowerCase().includes('percent')) {
        return `${value.toFixed(1)}%`;
      }
      if (key.toLowerCase().includes('month')) {
        return value.toString();
      }
      return `$${value.toLocaleString()}`;
    }
    return value;
  };

  const exportEmergencyFundAsPDF = () => {
    const scenario = scenarios.find(s => s.id === selectedScenario);
    const target = getTargetAmount();
    const current = parseFloat(currentSavings) || 0;
    const monthly = parseFloat(monthlySavings) || 0;
    const remaining = Math.max(0, target - current);
    const monthsToGoal = getMonthsToSave();
    const totalMonthlyExpenses = calculateTotalExpenses();
    const progress = getProgressPercentage();

    const data = {
      'Monthly Housing': monthlyExpenses.housing ? `$${parseFloat(monthlyExpenses.housing).toLocaleString()}` : '$0',
      'Monthly Utilities': monthlyExpenses.utilities ? `$${parseFloat(monthlyExpenses.utilities).toLocaleString()}` : '$0',
      'Monthly Groceries': monthlyExpenses.groceries ? `$${parseFloat(monthlyExpenses.groceries).toLocaleString()}` : '$0',
      'Monthly Transportation': monthlyExpenses.transportation ? `$${parseFloat(monthlyExpenses.transportation).toLocaleString()}` : '$0',
      'Monthly Insurance': monthlyExpenses.insurance ? `$${parseFloat(monthlyExpenses.insurance).toLocaleString()}` : '$0',
      'Other Monthly Expenses': monthlyExpenses.other ? `$${parseFloat(monthlyExpenses.other).toLocaleString()}` : '$0',
      'Target Coverage': scenario ? `${scenario.months} months` : 'Not selected',
      'Current Savings': `$${current.toLocaleString()}`,
      'Monthly Savings Plan': `$${monthly.toLocaleString()}`
    };

    const results = {
      'Total Monthly Expenses': `$${totalMonthlyExpenses.toLocaleString()}`,
      'Emergency Fund Target': `$${target.toLocaleString()}`,
      'Remaining to Save': `$${remaining.toLocaleString()}`,
      'Current Progress': `${progress.toFixed(1)}%`,
      'Months to Goal': monthsToGoal.toString(),
      'Years to Goal': `${Math.ceil(monthsToGoal / 12)} years`,
      'Annual Savings': `$${(monthly * 12).toLocaleString()}`
    };

    const formatTableRows = (obj) => {
      return Object.entries(obj)
        .map(([key, value]) => {
          return `<tr><td style="padding: 10px 15px; border-bottom: 1px solid #e5e7eb;">${key}</td><td style="padding: 10px 15px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 600;">${value}</td></tr>`;
        })
        .join('');
    };

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Emergency Fund Calculator - ${scenario?.title || 'Plan'}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; color: #333; max-width: 800px; margin: 0 auto; }
          h1 { color: #1e40af; margin-bottom: 5px; }
          .subtitle { color: #6b7280; margin-bottom: 30px; }
          .section { margin: 25px 0; }
          .section-title { font-size: 14px; font-weight: 600; color: #374151; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 10px; padding-bottom: 5px; border-bottom: 2px solid #e5e7eb; }
          table { width: 100%; border-collapse: collapse; background: #f9fafb; border-radius: 8px; overflow: hidden; }
          .results-table { background: #eff6ff; }
          .results-table td { color: #1e40af; }
          .footer { margin-top: 40px; text-align: center; color: #9ca3af; font-size: 12px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
          .highlight { background: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 20px 0; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <h1>Emergency Fund Calculator</h1>
        <p class="subtitle">${scenario?.title || 'Emergency Fund Plan'}<br/>Generated on ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>

        <div class="highlight">
          <strong>Why Emergency Funds Matter:</strong> An emergency fund is your financial safety net that protects you from unexpected expenses like medical bills, car repairs, or job loss. Having 3-6 months of expenses saved can prevent you from going into debt during tough times.
        </div>

        <div class="section">
          <div class="section-title">Your Financial Details</div>
          <table>${formatTableRows(data)}</table>
        </div>

        <div class="section">
          <div class="section-title">Emergency Fund Analysis</div>
          <table class="results-table">${formatTableRows(results)}</table>
        </div>

        <div class="section">
          <div class="section-title">Next Steps</div>
          <ul style="line-height: 1.8; color: #374151;">
            <li><strong>Automate Your Savings:</strong> Set up automatic transfers to your emergency fund</li>
            <li><strong>Separate Account:</strong> Keep emergency funds in a high-yield savings account</li>
            <li><strong>Start Small:</strong> Even $25/month becomes $300 in a year</li>
            <li><strong>Review Regularly:</strong> Adjust your target as your expenses change</li>
            <li><strong>Don't Touch It:</strong> Only use for true emergencies, not wants</li>
          </ul>
        </div>

        <div class="footer">Generated by FinLit Emergency Fund Calculator</div>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      setTimeout(() => printWindow.print(), 250);
    }
  };

  const nextStoryStep = () => {
    if (storyStep < storyContent.length - 1) {
      setStoryStep(storyStep + 1);
    } else {
      // Continue to game phase (even in review mode, show all phases)
      setCurrentPhase('game');
    }
  };

  // Check if current game is complete
  const isCurrentGameComplete = () => {
    // In review mode, all games are considered complete (can skip)
    if (isReviewMode) return true;

    const currentGame = miniGames[gameStep];
    if (currentGame.type === 'sorting') return sortingComplete;
    if (currentGame.type === 'calculator') return calculatorComplete;
    if (currentGame.type === 'scenario') return scenarioComplete;
    return false;
  };

  // State for wrong answer feedback in sorting game
  const [sortingWrongAnswer, setSortingWrongAnswer] = useState(null); // { itemId, selectedCategory }

  // Handle sorting item click
  const handleSortItem = (itemId, category) => {
    const expense = miniGames[0].expenses.find(e => e.id === itemId);

    // Check if the answer is correct
    if (expense.category === category) {
      // Correct answer - add to sorted items
      const newSorted = { ...sortedItems, [itemId]: category };
      setSortedItems(newSorted);
      setSortingWrongAnswer(null);

      // Check if all items are sorted correctly
      const allExpenses = miniGames[0].expenses;
      const allSorted = allExpenses.every(exp => newSorted[exp.id]);

      if (allSorted) {
        setSortingComplete(true);
        setTotalXP(prev => prev + 25);
      }
    } else {
      // Wrong answer - show feedback but don't lock it
      setSortingWrongAnswer({ itemId, selectedCategory: category, correctCategory: expense.category });
      setTimeout(() => setSortingWrongAnswer(null), 3000);
    }
  };

  // Handle calculator game answer
  const handleCalculatorCheck = () => {
    const person = miniGames[1].people[0];
    const correct = Object.values(person.expenses).reduce((sum, val) => sum + val, 0) * person.months;
    const userAnswer = parseFloat(calculatorAnswer);

    if (Math.abs(userAnswer - correct) < 100) { // Allow some margin
      setCalculatorComplete(true);
      setTotalXP(prev => prev + 25);
      setCalculatorWrongAnswer(null);
    } else {
      // Wrong answer - show feedback
      setCalculatorWrongAnswer({ 
        userAnswer, 
        correctAnswer: correct,
        difference: Math.abs(userAnswer - correct)
      });
      setTimeout(() => setCalculatorWrongAnswer(null), 4000);
    }
  };

  // Handle scenario answer
  const handleScenarioAnswer = (optionIndex) => {
    const option = miniGames[2].scenarios[0].options[optionIndex];
    setScenarioAnswer(optionIndex);
    setScenarioFeedback(option.explanation);

    if (option.correct) {
      setScenarioComplete(true);
      setTotalXP(prev => prev + 25);
    }
  };

  const nextGameStep = () => {
    if (gameStep < miniGames.length - 1) {
      // Reset game state for next game
      setGameStep(gameStep + 1);
      setSortedItems({});
      setSortingComplete(false);
      setSortingWrongAnswer(null);
      setCalculatorAnswer('');
      setCalculatorComplete(false);
      setCalculatorWrongAnswer(null);
      setScenarioAnswer(null);
      setScenarioFeedback('');
      setScenarioComplete(false);
    } else if (isReviewMode) {
      // In review mode, finish after games
      navigate('/game');
    } else {
      setCurrentPhase('calculator');
    }
  };

  const prevGameStep = () => {
    if (gameStep > 0) {
      setGameStep(gameStep - 1);
      // Reset game state for previous game
      setSortedItems({});
      setSortingComplete(false);
      setSortingWrongAnswer(null);
      setCalculatorAnswer('');
      setCalculatorComplete(false);
      setCalculatorWrongAnswer(null);
      setScenarioAnswer(null);
      setScenarioFeedback('');
      setScenarioComplete(false);
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

  // Handle module completion
  const handleComplete = async () => {
    await saveScore(MODULES.EMERGENCY_FUND?.id || 'emergency-fund', 100, 100);
    navigate('/game');
  };

  const expenseCategories = [
    { key: 'housing', label: 'Housing (Rent/Mortgage)', icon: '🏠', placeholder: '1200' },
    { key: 'utilities', label: 'Utilities', icon: '💡', placeholder: '150' },
    { key: 'groceries', label: 'Groceries', icon: '🛒', placeholder: '400' },
    { key: 'transportation', label: 'Transportation', icon: '🚗', placeholder: '300' },
    { key: 'insurance', label: 'Insurance', icon: '🛡️', placeholder: '200' },
    { key: 'other', label: 'Other Essential Expenses', icon: '📝', placeholder: '250' }
  ];

  // Start review mode
  const startReviewMode = () => {
    setIsReviewMode(true);
    setCurrentPhase('story');
    setStoryStep(0);
  };

  // If module is already passed and not in review mode, show completion screen
  if (modulePassed && !isReviewMode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-emerald-50 to-blue-100 p-6 flex items-center justify-center">
        <motion.div
          className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="text-6xl mb-4"
            animate={{ rotate: [0, -10, 10, -10, 0] }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            🏦
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Module Completed!</h2>
          <p className="text-gray-600 mb-6">
            You've already passed the Emergency Fund module. Great job learning how to build your financial safety net!
          </p>
          <div className="bg-green-50 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-center gap-2 text-green-600">
              <span className="text-2xl">✓</span>
              <span className="font-semibold">100% Complete</span>
            </div>
          </div>
          <div className="space-y-3">
            <motion.button
              onClick={startReviewMode}
              className="w-full px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-semibold transition"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Review Module
            </motion.button>
            <motion.button
              onClick={() => navigate('/game')}
              className="w-full px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold transition"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Back to Learning Path
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

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
              <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 mb-6 shadow-md border-l-4 border-emerald-500">
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
              <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 mb-6 shadow-md">
                <div className="bg-gradient-to-r from-blue-100 to-emerald-100 rounded-lg p-4 mb-4">
                  <p className="text-gray-700 italic text-lg leading-relaxed">
                    💬 "{storyContent[storyStep].dialogue}"
                  </p>
                </div>
              </div>

              {/* Key Lesson */}
              <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-yellow-300">
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
                {storyStep === storyContent.length - 1 ? (isReviewMode ? 'Finish Review' : 'Play Games! 🎮') : 'Next →'}
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
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
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
                  {/* Wrong Answer Feedback */}
                  <AnimatePresence>
                    {sortingWrongAnswer && (
                      <motion.div
                        className="p-4 bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-xl"
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="flex items-center gap-3">
                          <motion.span
                            className="text-3xl"
                            animate={{ rotate: [0, -10, 10, -10, 0] }}
                            transition={{ duration: 0.5 }}
                          >
                            🤔
                          </motion.span>
                          <div>
                            <p className="font-bold text-red-700">Not quite right!</p>
                            <p className="text-sm text-red-600">
                              That's a {sortingWrongAnswer.correctCategory === 'emergency' ? 'true emergency' : 'non-emergency'} expense. Try again!
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Unsorted Items - Click to sort */}
                  {!sortingComplete && (
                    <div className="bg-gray-50 rounded-lg sm:rounded-xl p-4 sm:p-6 border-2 border-gray-200 mb-6">
                      <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">
                        Click items to sort them into categories
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {miniGames[gameStep].expenses
                          .filter(expense => !sortedItems[expense.id])
                          .map((expense) => (
                            <motion.div
                              key={expense.id}
                              className={`bg-white p-4 rounded-lg shadow-md border ${
                                sortingWrongAnswer?.itemId === expense.id
                                  ? 'border-red-400 bg-red-50'
                                  : 'border-gray-200'
                              }`}
                              whileHover={{ scale: 1.02 }}
                              animate={sortingWrongAnswer?.itemId === expense.id ? { x: [0, -5, 5, -5, 0] } : {}}
                              transition={{ duration: 0.4 }}
                            >
                              <div className="flex items-center gap-3 mb-3">
                                <span className="text-2xl">{expense.emoji}</span>
                                <div>
                                  <div className="font-medium">{expense.name}</div>
                                  <div className="text-sm text-gray-600">${expense.amount}</div>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleSortItem(expense.id, 'emergency')}
                                  className="flex-1 px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm font-medium transition"
                                >
                                  Emergency
                                </button>
                                <button
                                  onClick={() => handleSortItem(expense.id, 'non-emergency')}
                                  className="flex-1 px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-sm font-medium transition"
                                >
                                  Non-Emergency
                                </button>
                              </div>
                            </motion.div>
                          ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    {/* Emergency Category */}
                    <div className="bg-red-50 rounded-lg sm:rounded-xl p-4 sm:p-6 border-2 border-red-200">
                      <h3 className="text-lg font-bold text-red-800 mb-4 text-center">
                        🚨 Emergency Expenses
                      </h3>
                      <div className="space-y-3 min-h-[150px]">
                        {miniGames[gameStep].expenses
                          .filter(expense => sortedItems[expense.id] === 'emergency')
                          .map((expense) => (
                            <motion.div
                              key={expense.id}
                              className="bg-white p-4 rounded-lg shadow-md border border-green-400"
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
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
                        {Object.values(sortedItems).filter(v => v === 'emergency').length === 0 && (
                          <div className="text-center text-gray-400 py-8">
                            Correct emergency items will appear here
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Non-Emergency Category */}
                    <div className="bg-blue-50 rounded-lg sm:rounded-xl p-4 sm:p-6 border-2 border-blue-200">
                      <h3 className="text-lg font-bold text-blue-800 mb-4 text-center">
                        🛍️ Non-Emergency Expenses
                      </h3>
                      <div className="space-y-3 min-h-[150px]">
                        {miniGames[gameStep].expenses
                          .filter(expense => sortedItems[expense.id] === 'non-emergency')
                          .map((expense) => (
                            <motion.div
                              key={expense.id}
                              className="bg-white p-4 rounded-lg shadow-md border border-green-400"
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
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
                        {Object.values(sortedItems).filter(v => v === 'non-emergency').length === 0 && (
                          <div className="text-center text-gray-400 py-8">
                            Correct non-emergency items will appear here
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Progress indicator */}
                  <div className="text-center text-sm text-gray-600">
                    Sorted: {Object.keys(sortedItems).length} / {miniGames[gameStep].expenses.length}
                  </div>

                  {/* Success Message */}
                  {sortingComplete && (
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
                  )}
                </div>
              )}

              {/* Calculator Challenge Game */}
              {miniGames[gameStep].type === 'calculator' && (
                <div className="space-y-6">
                  {/* Wrong Answer Feedback */}
                  <AnimatePresence>
                    {calculatorWrongAnswer && (
                      <motion.div
                        className="p-4 bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-xl"
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="flex items-center gap-3">
                          <motion.span
                            className="text-3xl"
                            animate={{ rotate: [0, -10, 10, -10, 0] }}
                            transition={{ duration: 0.5 }}
                          >
                            🤔
                          </motion.span>
                          <div>
                            <p className="font-bold text-red-700">Not quite right!</p>
                            <p className="text-sm text-red-600">
                              Your answer: ${calculatorWrongAnswer.userAnswer?.toLocaleString() || 'N/A'}
                            </p>
                            <p className="text-sm text-red-600">
                              {calculatorWrongAnswer.difference > 1000 
                                ? "Try recalculating: monthly expenses × number of months" 
                                : "You're close! Check your calculation again."}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-md">
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
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        {Object.entries(miniGames[gameStep].people[0].expenses).map(([category, amount]) => (
                          <div key={category} className="bg-gray-50 rounded-lg p-3">
                            <div className="text-sm text-gray-600 capitalize">{category}</div>
                            <div className="text-lg font-bold">${amount}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {!calculatorComplete ? (
                      <div className="text-center">
                        <div className="text-sm text-gray-600 mb-2">
                          Calculate the total emergency fund needed ({miniGames[gameStep].people[0].months} months):
                        </div>
                        <div className="flex items-center justify-center gap-4 mb-4">
                          <span className="text-2xl">$</span>
                          <input
                            type="number"
                            value={calculatorAnswer}
                            onChange={(e) => setCalculatorAnswer(e.target.value)}
                            placeholder="Enter amount"
                            className="w-48 px-4 py-3 text-xl border-2 border-gray-300 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 text-center"
                          />
                        </div>
                        <button
                          onClick={handleCalculatorCheck}
                          disabled={!calculatorAnswer}
                          className={`px-6 py-3 rounded-lg font-medium transition ${
                            !calculatorAnswer
                              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                              : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                          }`}
                        >
                          Check Answer
                        </button>
                      </div>
                    ) : (
                      <div className="text-center bg-emerald-50 rounded-lg p-6">
                        <div className="text-3xl mb-2">🎉</div>
                        <div className="text-sm text-gray-600 mb-2">Correct! Emergency Fund Needed:</div>
                        <div className="text-2xl sm:text-3xl font-bold text-emerald-600">
                          ${(Object.values(miniGames[gameStep].people[0].expenses).reduce((sum, val) => sum + val, 0) * miniGames[gameStep].people[0].months).toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500 mt-2">
                          (${Object.values(miniGames[gameStep].people[0].expenses).reduce((sum, val) => sum + val, 0)} × {miniGames[gameStep].people[0].months} months)
                        </div>
                        <div className="text-sm text-green-600 mt-2">+25 XP</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Scenario Game */}
              {miniGames[gameStep].type === 'scenario' && (
                <div className="space-y-6">
                  <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-md">
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
                          onClick={() => handleScenarioAnswer(index)}
                          disabled={scenarioAnswer !== null}
                          className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                            scenarioAnswer === index
                              ? option.correct
                                ? 'bg-green-100 border-green-500'
                                : 'bg-red-100 border-red-500'
                              : scenarioAnswer !== null
                                ? 'bg-gray-100 border-gray-200'
                                : 'bg-white hover:bg-emerald-50 border-gray-200 hover:border-emerald-300'
                          }`}
                          whileHover={scenarioAnswer === null ? { scale: 1.02 } : {}}
                          whileTap={scenarioAnswer === null ? { scale: 0.98 } : {}}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold ${
                              scenarioAnswer === index
                                ? option.correct ? 'border-green-500 bg-green-500 text-white' : 'border-red-500 bg-red-500 text-white'
                                : 'border-emerald-300 text-emerald-500'
                            }`}>
                              {scenarioAnswer === index ? (option.correct ? '✓' : '✗') : String.fromCharCode(65 + index)}
                            </div>
                            <span className="text-lg">{option.text}</span>
                          </div>
                        </motion.button>
                      ))}
                    </div>

                    {/* Explanation */}
                    {scenarioFeedback && (
                      <motion.div
                        className={`mt-6 p-4 border-l-4 rounded-r-lg ${
                          scenarioComplete ? 'bg-emerald-50 border-emerald-400' : 'bg-orange-50 border-orange-400'
                        }`}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        transition={{ duration: 0.3 }}
                      >
                        <p className={scenarioComplete ? 'text-emerald-800' : 'text-orange-800'}>
                          {scenarioComplete ? '✓ Correct!' : '✗ Not quite.'} {scenarioFeedback}
                        </p>
                        {scenarioComplete && <div className="text-sm text-green-600 mt-1">+25 XP</div>}
                      </motion.div>
                    )}
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
                disabled={!isCurrentGameComplete()}
                className={`px-6 py-3 rounded-xl font-medium transition shadow-lg ${
                  isCurrentGameComplete()
                    ? 'bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
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

              {/* Export Button */}
              {monthlySavings && (
                <div className="flex justify-center mb-6">
                  <motion.button
                    onClick={exportEmergencyFundAsPDF}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition shadow-lg"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Download className="w-5 h-5" />
                    Export Plan as PDF
                  </motion.button>
                </div>
              )}

              <div className="flex justify-between mt-8">
                <button
                  onClick={() => setStep(3)}
                  className="px-6 py-3 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg font-medium transition"
                >
                  Previous
                </button>
                <button
                  onClick={handleComplete}
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