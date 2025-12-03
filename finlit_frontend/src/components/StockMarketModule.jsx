import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Target, Trophy, RotateCcw, CheckCircle, XCircle, Shuffle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const StockMarketModule = () => {
  const navigate = useNavigate();
  const [currentPhase, setCurrentPhase] = useState('learning'); // 'learning', 'playing', 'completed'
  const [learningStep, setLearningStep] = useState(0);
  const [gameState, setGameState] = useState('playing');
  const [matches, setMatches] = useState({});
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [draggedItem, setDraggedItem] = useState(null);
  const [shuffledTerms, setShuffledTerms] = useState([]);

  // Learning content with fun characters
  const learningContent = [
    {
      id: 1,
      character: "🐂 Bullish Bob",
      title: "Welcome to Stock Market Adventure!",
      content: "Hey there, future investor! I'm Bullish Bob, and I LOVE when stock prices go up! Let me teach you about the exciting world of stocks.",
      concept: "What are Stocks?",
      explanation: "Stocks are like tiny pieces of a company. When you buy stock, you become a part-owner! It's like buying a slice of your favorite pizza place.",
      visual: "🍕➜🏢",
      funFact: "Did you know? If you owned 1 share of Apple stock in 1997, it would be worth over $500,000 today!"
    },
    {
      id: 2,
      character: "🐻 Bearish Betty",
      title: "Bulls vs Bears - Market Moods",
      content: "I'm Bearish Betty, Bob's cautious cousin. While Bob loves rising prices, I know that markets can go down too. That's not always bad - it can mean buying opportunities!",
      concept: "Market Conditions",
      explanation: "Bull Market = Prices rising, optimism high 📈\nBear Market = Prices falling, caution time 📉\nJust like weather, markets have different seasons!",
      visual: "🐂📈 vs 🐻📉",
      funFact: "The longest bull market in history lasted from 2009 to 2020 - that's 11 years of mostly rising prices!"
    },
    {
      id: 3,
      character: "💰 Dividend Danny",
      title: "Getting Paid to Own Stocks",
      content: "Hi! I'm Dividend Danny, and I love companies that pay me just for owning their stock. It's like getting allowance money for being a good company owner!",
      concept: "Dividends & Returns",
      explanation: "Some companies share their profits with stockholders through dividends. It's like getting a bonus check every few months just for owning the stock!",
      visual: "🏢💸👤",
      funFact: "Coca-Cola has paid dividends for over 50 years straight - that's reliability!"
    },
    {
      id: 4,
      character: "🎯 Portfolio Pete",
      title: "Don't Put All Eggs in One Basket",
      content: "I'm Portfolio Pete, and I teach the golden rule: diversification! Never put all your money in just one stock - spread it around like toppings on pizza!",
      concept: "Diversification & Risk",
      explanation: "A portfolio is your collection of investments. Mix different types: some safe, some risky, some domestic, some international. This reduces overall risk.",
      visual: "🥚🧺 ➜ 🥚🧺🥚🧺🥚🧺",
      funFact: "Even Warren Buffett, the world's most famous investor, owns hundreds of different stocks!"
    },
    {
      id: 5,
      character: "🚀 Growth Guru",
      title: "Patience + Time = Magic",
      content: "I'm Growth Guru, and I know the secret to stock market success: time! The longer you hold quality stocks, the more likely you are to win!",
      concept: "Long-term Investing",
      explanation: "Stock markets can be bumpy day-to-day, but historically go up over long periods. Think of it like a roller coaster that ultimately climbs higher!",
      visual: "🎢📈",
      funFact: "The S&P 500 has never lost money over any 20-year period in history!"
    }
  ];

  const matchingPairs = [
    {
      id: 1,
      term: "Bull Market",
      definition: "A market where prices are rising and investor confidence is high",
      category: "market-conditions"
    },
    {
      id: 2,
      term: "Bear Market",
      definition: "A market where prices are falling and pessimism prevails",
      category: "market-conditions"
    },
    {
      id: 3,
      term: "Dividend",
      definition: "A payment made by companies to shareholders from profits",
      category: "investments"
    },
    {
      id: 4,
      term: "P/E Ratio",
      definition: "Price-to-Earnings ratio, comparing stock price to earnings per share",
      category: "valuation"
    },
    {
      id: 5,
      term: "Market Cap",
      definition: "Total market value of a company's outstanding shares",
      category: "valuation"
    },
    {
      id: 6,
      term: "IPO",
      definition: "Initial Public Offering - when a company first sells shares to the public",
      category: "corporate"
    },
    {
      id: 7,
      term: "Volatility",
      definition: "The degree of variation in a trading price over time",
      category: "risk"
    },
    {
      id: 8,
      term: "Portfolio",
      definition: "A collection of investments owned by an individual or institution",
      category: "investments"
    },
    {
      id: 9,
      term: "Diversification",
      definition: "Spreading investments across various assets to reduce risk",
      category: "risk"
    },
    {
      id: 10,
      term: "Blue Chip",
      definition: "Stocks of large, well-established, and financially sound companies",
      category: "investments"
    }
  ];

  // Shuffle terms when component mounts
  useEffect(() => {
    setShuffledTerms([...matchingPairs].sort(() => Math.random() - 0.5));
  }, []);

  const shuffleTerms = () => {
    setShuffledTerms([...matchingPairs].sort(() => Math.random() - 0.5));
  };

  const resetGame = () => {
    setMatches({});
    setScore(0);
    setAttempts(0);
    setGameState('playing');
    setDraggedItem(null);
    shuffleTerms();
  };

  const handleDragStart = (e, item) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, definition) => {
    e.preventDefault();
    if (!draggedItem) return;

    setAttempts(attempts + 1);

    if (draggedItem.id === definition.id) {
      // Correct match
      setMatches({
        ...matches,
        [draggedItem.id]: true
      });
      setScore(score + 1);
    } else {
      // Incorrect match - show feedback
      setMatches({
        ...matches,
        [draggedItem.id]: false
      });
    }

    setDraggedItem(null);

    // Check if all matches are complete
    const totalMatched = Object.values({...matches, [draggedItem.id]: draggedItem.id === definition.id}).filter(Boolean).length;
    if (totalMatched === matchingPairs.length) {
      setTimeout(() => setGameState('completed'), 500);
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      'market-conditions': 'bg-blue-100 border-blue-300',
      'investments': 'bg-green-100 border-green-300',
      'valuation': 'bg-purple-100 border-purple-300',
      'corporate': 'bg-orange-100 border-orange-300',
      'risk': 'bg-red-100 border-red-300'
    };
    return colors[category] || 'bg-gray-100 border-gray-300';
  };

  const getMatchState = (item) => {
    if (matches[item.id] === true) return 'correct';
    if (matches[item.id] === false) return 'incorrect';
    return 'unmatched';
  };

  const getAccuracy = () => {
    return attempts > 0 ? Math.round((score / attempts) * 100) : 0;
  };

  const nextLearningStep = () => {
    if (learningStep < learningContent.length - 1) {
      setLearningStep(learningStep + 1);
    } else {
      setCurrentPhase('playing');
    }
  };

  const prevLearningStep = () => {
    if (learningStep > 0) {
      setLearningStep(learningStep - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-blue-100 p-6">
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
          <h1 className="text-2xl font-bold text-gray-800">Stock Market Basics</h1>
          <p className="text-sm text-gray-600">Match Terms with Definitions</p>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={shuffleTerms}
            className="flex items-center gap-2 px-3 py-2 text-purple-600 hover:bg-purple-50 rounded-lg transition"
            title="Shuffle Terms"
          >
            <Shuffle className="w-5 h-5" />
          </button>
          <button
            onClick={resetGame}
            className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition"
            title="Reset Game"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 text-purple-600">
            <Target className="w-5 h-5" />
            <span className="font-semibold">100 XP</span>
          </div>
        </div>
      </motion.div>

      {currentPhase === 'learning' ? (
        /* Learning Phase */
        <motion.div
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {/* Learning Progress */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-purple-600 mb-2">
              <span>Learning Step {learningStep + 1} of {learningContent.length}</span>
              <span>{Math.round(((learningStep + 1) / learningContent.length) * 100)}% Complete</span>
            </div>
            <div className="w-full bg-purple-100 rounded-full h-3">
              <motion.div
                className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${((learningStep + 1) / learningContent.length) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          {/* Character Learning Card */}
          <motion.div
            key={learningStep}
            className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-8 shadow-lg mb-6 border border-purple-200"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center mb-6">
              <motion.div 
                className="text-6xl mb-4"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
              >
                {learningContent[learningStep].visual}
              </motion.div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {learningContent[learningStep].title}
              </h2>
              <div className="text-lg font-semibold text-purple-600 mb-4">
                {learningContent[learningStep].character}
              </div>
            </div>

            {/* Character Speech */}
            <div className="bg-white rounded-2xl p-6 mb-6 shadow-md border-l-4 border-purple-500">
              <motion.p 
                className="text-gray-700 italic text-lg leading-relaxed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.3 }}
              >
                💬 "{learningContent[learningStep].content}"
              </motion.p>
            </div>

            {/* Concept Explanation */}
            <div className="bg-white rounded-xl p-6 mb-6 shadow-md">
              <h3 className="text-lg font-bold text-purple-800 mb-3">
                📚 {learningContent[learningStep].concept}
              </h3>
              <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                {learningContent[learningStep].explanation}
              </div>
            </div>

            {/* Fun Fact */}
            <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-xl p-6 border border-yellow-300">
              <h4 className="text-lg font-bold text-orange-800 mb-2">🤯 Fun Fact:</h4>
              <p className="text-orange-700 leading-relaxed">
                {learningContent[learningStep].funFact}
              </p>
            </div>
          </motion.div>

          {/* Learning Navigation */}
          <div className="flex justify-between items-center">
            <button
              onClick={prevLearningStep}
              disabled={learningStep === 0}
              className={`px-6 py-3 rounded-xl font-medium transition ${
                learningStep === 0
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-300 hover:bg-gray-400 text-gray-700'
              }`}
            >
              ← Previous
            </button>

            <div className="flex gap-2">
              {learningContent.map((_, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full ${
                    index === learningStep ? 'bg-purple-500' : 
                    index < learningStep ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={nextLearningStep}
              className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-medium transition"
            >
              {learningStep === learningContent.length - 1 ? 'Start Matching Game! 🎯' : 'Next →'}
            </button>
          </div>
        </motion.div>
      ) : currentPhase === 'playing' && gameState === 'playing' ? (
        <div className="max-w-6xl mx-auto">
          {/* Score Panel */}
          <motion.div
            className="bg-white rounded-xl p-4 shadow-lg mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">{score}</div>
                <div className="text-sm text-gray-600">Correct Matches</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">{attempts}</div>
                <div className="text-sm text-gray-600">Total Attempts</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">{getAccuracy()}%</div>
                <div className="text-sm text-gray-600">Accuracy</div>
              </div>
            </div>
          </motion.div>

          {/* Game Instructions */}
          <motion.div
            className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 mb-8 border border-blue-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="text-center">
              <h3 className="font-bold text-gray-800 mb-2">How to Play</h3>
              <p className="text-sm text-gray-600">
                Drag the terms from the left column and drop them onto their matching definitions on the right. 
                Match all 10 terms to complete the module!
              </p>
            </div>
          </motion.div>

          {/* Matching Game */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Terms Column */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Terms</h3>
              <div className="space-y-3">
                {shuffledTerms.map((item) => {
                  const matchState = getMatchState(item);
                  return (
                    <motion.div
                      key={item.id}
                      className={`p-4 rounded-lg border-2 cursor-move transition-all ${getCategoryColor(item.category)} ${
                        matchState === 'correct' 
                          ? 'opacity-50 cursor-not-allowed' 
                          : matchState === 'incorrect'
                          ? 'border-red-400 bg-red-50'
                          : 'hover:shadow-md hover:scale-[1.02]'
                      }`}
                      draggable={matchState !== 'correct'}
                      onDragStart={(e) => matchState !== 'correct' && handleDragStart(e, item)}
                      whileHover={matchState !== 'correct' ? { scale: 1.02 } : {}}
                      whileTap={matchState !== 'correct' ? { scale: 0.98 } : {}}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-gray-800">{item.term}</span>
                        {matchState === 'correct' && (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        )}
                        {matchState === 'incorrect' && (
                          <XCircle className="w-5 h-5 text-red-500" />
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

            {/* Definitions Column */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Definitions</h3>
              <div className="space-y-3">
                {matchingPairs.map((item) => (
                  <motion.div
                    key={`def-${item.id}`}
                    className={`p-4 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 min-h-[60px] flex items-center transition-all ${
                      matches[item.id] === true ? 'bg-green-50 border-green-400' : ''
                    }`}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, item)}
                    whileHover={{ scale: 1.01, backgroundColor: '#f8fafc' }}
                  >
                    <div className="w-full">
                      <p className="text-gray-700 text-sm leading-relaxed">{item.definition}</p>
                      {matches[item.id] === true && (
                        <motion.div
                          className="mt-2 flex items-center gap-2 text-green-600"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3 }}
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-sm font-semibold">{item.term}</span>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Progress Bar */}
          <motion.div
            className="mt-8 bg-white rounded-xl p-4 shadow-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Progress</span>
              <span>{score}/{matchingPairs.length} matches</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <motion.div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(score / matchingPairs.length) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </motion.div>
        </div>
      ) : (
        /* Completion Screen */
        <motion.div
          className="max-w-2xl mx-auto text-center"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <Trophy className="w-20 h-20 mx-auto text-yellow-500 mb-6" />
            </motion.div>
            
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Congratulations! 🎉</h2>
            <p className="text-xl text-gray-600 mb-6">
              You've successfully matched all stock market terms!
            </p>

            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-600">{score}</div>
                <div className="text-sm text-gray-600">Correct Matches</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-purple-600">{attempts}</div>
                <div className="text-sm text-gray-600">Total Attempts</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-600">{getAccuracy()}%</div>
                <div className="text-sm text-gray-600">Accuracy</div>
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <button
                onClick={() => navigate('/game')}
                className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition"
              >
                Back to Roadmap
              </button>
              <button
                onClick={resetGame}
                className="px-6 py-3 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-xl font-medium transition"
              >
                Play Again
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default StockMarketModule;