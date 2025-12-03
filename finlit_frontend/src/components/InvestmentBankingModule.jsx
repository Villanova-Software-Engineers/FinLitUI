import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Star, Trophy, CheckCircle, XCircle, Heart, Zap, Award, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const InvestmentBankingModule = () => {
  const navigate = useNavigate();
  const [currentPhase, setCurrentPhase] = useState('story'); // 'story', 'game', 'quiz', 'results'
  const [storyStep, setStoryStep] = useState(0);
  const [gameStep, setGameStep] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [lives, setLives] = useState(3);
  const [streak, setStreak] = useState(0);
  const [totalXP, setTotalXP] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [achievements, setAchievements] = useState([]);

  // Interactive story with characters
  const storyContent = [
    {
      id: 1,
      character: "🏦 Banker Bill",
      characterImage: "💼",
      scene: "🏢 Wall Street Office",
      title: "Welcome to the World of Investment Banking!",
      dialogue: "Hey there, future financial wizard! I'm Banker Bill, your guide through the exciting world of investment banking. Ready to learn how big money moves around?",
      story: "Investment banks are like the matchmakers of the financial world - they connect companies that need money with investors who have it!",
      lesson: "Investment banks help companies raise money, advise on mergers, and trade securities.",
      visual: "🤝💰🏢",
      emotion: "😊",
      background: "bg-gradient-to-br from-blue-100 to-indigo-100"
    },
    {
      id: 2,
      character: "💰 IPO Ivy",
      characterImage: "🚀",
      scene: "📈 Stock Exchange",
      title: "Going Public - The IPO Adventure",
      dialogue: "I'm IPO Ivy! I help private companies become public ones through Initial Public Offerings. It's like throwing a huge party where everyone can buy pieces of your company!",
      story: "When a company 'goes public,' it sells shares to everyone for the first time. Investment banks help set the price and find buyers.",
      lesson: "IPOs allow private companies to raise capital from public investors. Investment banks underwrite these offerings.",
      visual: "🏢➡️📊➡️💰",
      emotion: "🎉",
      background: "bg-gradient-to-br from-green-100 to-emerald-100"
    },
    {
      id: 3,
      character: "🤝 M&A Max",
      characterImage: "⚡",
      scene: "🏛️ Conference Room",
      title: "Mergers & Acquisitions - Corporate Dating",
      dialogue: "Hey! I'm M&A Max, and I help companies find their perfect match! Sometimes companies merge to become stronger together, like a financial power couple!",
      story: "When two companies combine (merger) or one buys another (acquisition), investment banks advise on the deal and help determine fair prices.",
      lesson: "M&A advisory services help companies grow through strategic combinations and acquisitions.",
      visual: "🏢+🏢=🏢💪",
      emotion: "🤩",
      background: "bg-gradient-to-br from-purple-100 to-pink-100"
    },
    {
      id: 4,
      character: "📊 Trading Tina",
      characterImage: "⚡",
      scene: "💹 Trading Floor",
      title: "Trading & Markets - The Action Zone",
      dialogue: "I'm Trading Tina, and I live for the thrill! Investment banks also trade stocks, bonds, and other securities. It's like a super-fast marketplace!",
      story: "Investment banks have trading desks where they buy and sell securities for clients and for their own profit. They also help companies issue bonds.",
      lesson: "Trading operations provide liquidity to markets and help clients execute large transactions.",
      visual: "📈📉⚡💨",
      emotion: "🤑",
      background: "bg-gradient-to-br from-orange-100 to-red-100"
    },
    {
      id: 5,
      character: "🎯 Research Ruby",
      characterImage: "🔍",
      scene: "📚 Research Department",
      title: "Research & Analysis - Detective Work",
      dialogue: "Hi! I'm Research Ruby, the financial detective! I analyze companies and industries to help investors make smart decisions. Knowledge is power!",
      story: "Investment banks employ analysts who research companies, industries, and economic trends to provide investment recommendations.",
      lesson: "Research departments provide valuable insights and recommendations to institutional and retail investors.",
      visual: "🔍📊💡✨",
      emotion: "🤓",
      background: "bg-gradient-to-br from-yellow-100 to-amber-100"
    }
  ];

  // Interactive mini-games between story segments
  const miniGames = [
    {
      id: 1,
      type: "matching",
      title: "Investment Banking Services Match",
      instruction: "Match each service with its description!",
      pairs: [
        { term: "IPO", definition: "Initial Public Offering - first time selling shares to public", emoji: "🚀" },
        { term: "M&A", definition: "Mergers & Acquisitions - combining companies", emoji: "🤝" },
        { term: "Trading", definition: "Buying and selling securities", emoji: "📈" },
        { term: "Research", definition: "Analyzing companies and markets", emoji: "🔍" }
      ]
    },
    {
      id: 2,
      type: "dragdrop",
      title: "IPO Process Order",
      instruction: "Put the IPO steps in the correct order!",
      items: [
        { id: 1, text: "Company decides to go public", correct_position: 1 },
        { id: 2, text: "Investment bank is hired", correct_position: 2 },
        { id: 3, text: "SEC filings are prepared", correct_position: 3 },
        { id: 4, text: "Roadshow to investors", correct_position: 4 },
        { id: 5, text: "Shares are priced and sold", correct_position: 5 }
      ]
    }
  ];

  // Final quiz questions
  const quizQuestions = [
    {
      id: 1,
      question: "What does IPO stand for?",
      options: [
        { id: 'A', text: "Initial Public Offering", correct: true },
        { id: 'B', text: "International Private Organization", correct: false },
        { id: 'C', text: "Investment Portfolio Option", correct: false },
        { id: 'D', text: "Independent Public Operation", correct: false }
      ],
      explanation: "IPO stands for Initial Public Offering - when a private company first sells shares to the public.",
      xp: 25
    },
    {
      id: 2,
      question: "What does M&A stand for in investment banking?",
      options: [
        { id: 'A', text: "Money & Assets", correct: false },
        { id: 'B', text: "Markets & Analysis", correct: false },
        { id: 'C', text: "Mergers & Acquisitions", correct: true },
        { id: 'D', text: "Management & Advisory", correct: false }
      ],
      explanation: "M&A stands for Mergers & Acquisitions - when companies combine or one company buys another.",
      xp: 25
    },
    {
      id: 3,
      question: "What is the main role of investment bank research departments?",
      options: [
        { id: 'A', text: "To trade securities", correct: false },
        { id: 'B', text: "To analyze companies and provide investment recommendations", correct: true },
        { id: 'C', text: "To manage client portfolios", correct: false },
        { id: 'D', text: "To process loan applications", correct: false }
      ],
      explanation: "Research departments analyze companies, industries, and markets to provide investment recommendations to clients.",
      xp: 25
    },
    {
      id: 4,
      question: "During an IPO roadshow, what happens?",
      options: [
        { id: 'A', text: "The company presents to potential investors", correct: true },
        { id: 'B', text: "Shares are traded on the stock exchange", correct: false },
        { id: 'C', text: "Financial statements are audited", correct: false },
        { id: 'D', text: "Dividends are distributed", correct: false }
      ],
      explanation: "During a roadshow, company executives travel to present their business to potential institutional investors before the IPO.",
      xp: 25
    }
  ];

  const handleAnswerSelect = (questionIndex, optionId) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionIndex]: optionId
    });
    
    const question = quizQuestions[questionIndex];
    const selectedOption = question.options.find(opt => opt.id === optionId);
    
    if (selectedOption.correct) {
      setStreak(streak + 1);
      setTotalXP(totalXP + question.xp + (streak * 5)); // Bonus XP for streaks
      
      // Check for achievements
      if (streak === 2) {
        setAchievements([...achievements, { id: 'streak3', name: 'Hot Streak!', desc: '3 correct in a row', emoji: '🔥' }]);
      }
    } else {
      setLives(lives - 1);
      setStreak(0);
    }
  };

  const nextQuestion = () => {
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowResults(true);
      
      // Final achievements
      const finalScore = Object.keys(selectedAnswers).length;
      if (finalScore === quizQuestions.length) {
        setAchievements([...achievements, { id: 'perfect', name: 'Perfect Score!', desc: 'Got all questions right', emoji: '🏆' }]);
      }
    }
  };

  const nextStoryStep = () => {
    if (storyStep < storyContent.length - 1) {
      setStoryStep(storyStep + 1);
    } else {
      setCurrentPhase('quiz');
    }
  };

  const prevStoryStep = () => {
    if (storyStep > 0) {
      setStoryStep(storyStep - 1);
    }
  };

  const getScoreMessage = () => {
    const correctAnswers = Object.keys(selectedAnswers).filter(qIndex => {
      const question = quizQuestions[qIndex];
      const selectedOption = selectedAnswers[qIndex];
      return question.options.find(opt => opt.id === selectedOption)?.correct;
    }).length;
    
    const percentage = (correctAnswers / quizQuestions.length) * 100;
    
    if (percentage === 100) return "🏆 Investment Banking Master! You're ready for Wall Street!";
    if (percentage >= 75) return "⭐ Excellent! You understand investment banking very well!";
    if (percentage >= 50) return "👍 Good job! You're getting the hang of investment banking!";
    return "📚 Keep learning! Investment banking takes time to master!";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 p-6">
      {/* Header with Lives and XP */}
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
          <h1 className="text-2xl font-bold text-gray-800">Investment Banking</h1>
          <p className="text-sm text-gray-600">Learn with Characters & Games</p>
        </div>

        <div className="flex items-center gap-4">
          {/* Lives */}
          <div className="flex items-center gap-1">
            {[...Array(3)].map((_, i) => (
              <Heart 
                key={i} 
                className={`w-5 h-5 ${i < lives ? 'text-red-500 fill-red-500' : 'text-gray-300'}`} 
              />
            ))}
          </div>
          
          {/* XP */}
          <div className="flex items-center gap-2 text-purple-600">
            <Star className="w-5 h-5" />
            <span className="font-semibold">{totalXP} XP</span>
          </div>
          
          {/* Streak */}
          {streak > 0 && (
            <div className="flex items-center gap-2 text-orange-600">
              <Zap className="w-5 h-5" />
              <span className="font-semibold">{streak}🔥</span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Achievement Notifications */}
      <AnimatePresence>
        {achievements.length > 0 && (
          <motion.div
            className="fixed top-4 right-4 z-50"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
          >
            {achievements.slice(-1).map(achievement => (
              <div key={achievement.id} className="bg-yellow-100 border border-yellow-300 rounded-lg p-4 shadow-lg">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{achievement.emoji}</span>
                  <div>
                    <div className="font-bold text-yellow-800">{achievement.name}</div>
                    <div className="text-sm text-yellow-600">{achievement.desc}</div>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {currentPhase === 'story' ? (
        /* Interactive Story Learning */
        <motion.div
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-blue-600 mb-2">
              <span>Story {storyStep + 1} of {storyContent.length}</span>
              <span>{Math.round(((storyStep + 1) / storyContent.length) * 100)}% Complete</span>
            </div>
            <div className="w-full bg-blue-100 rounded-full h-3">
              <motion.div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${((storyStep + 1) / storyContent.length) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          {/* Character Story Card */}
          <motion.div
            key={storyStep}
            className={`${storyContent[storyStep].background} rounded-2xl p-8 shadow-lg mb-6 border-2 border-white`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Scene Header */}
            <div className="text-center mb-6">
              <motion.div 
                className="text-6xl mb-4"
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
              >
                {storyContent[storyStep].visual}
              </motion.div>
              <div className="text-lg text-gray-600 font-semibold mb-2">
                {storyContent[storyStep].scene}
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                {storyContent[storyStep].title}
              </h2>
            </div>

            {/* Character Introduction */}
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 mb-6 shadow-lg border-l-4 border-blue-500">
              <div className="flex items-start gap-4">
                <motion.div 
                  className="text-5xl"
                  animate={{ bounce: [0, -10, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}
                >
                  {storyContent[storyStep].characterImage}
                </motion.div>
                <div className="flex-1">
                  <div className="flex items-center mb-3">
                    <span className="text-2xl mr-2">{storyContent[storyStep].emotion}</span>
                    <div className="font-bold text-xl text-gray-800">
                      {storyContent[storyStep].character}
                    </div>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4 mb-4 border-l-4 border-blue-400">
                    <p className="text-gray-700 italic text-lg leading-relaxed">
                      💬 "{storyContent[storyStep].dialogue}"
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Story Content */}
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 mb-6 shadow-lg">
              <h3 className="text-lg font-bold text-gray-800 mb-3">📖 Story:</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                {storyContent[storyStep].story}
              </p>
            </div>

            {/* Key Lesson */}
            <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-xl p-6 border-2 border-yellow-300">
              <h4 className="text-lg font-bold text-orange-800 mb-2">🎓 Key Lesson:</h4>
              <p className="text-orange-700 leading-relaxed font-medium">
                {storyContent[storyStep].lesson}
              </p>
            </div>
          </motion.div>

          {/* Navigation */}
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
                    index === storyStep ? 'bg-blue-500' : 
                    index < storyStep ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={nextStoryStep}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl font-medium transition shadow-lg"
            >
              {storyStep === storyContent.length - 1 ? 'Start Quiz! 🎯' : 'Next →'}
            </button>
          </div>
        </motion.div>
      ) : currentPhase === 'quiz' && !showResults ? (
        /* Interactive Quiz */
        <motion.div
          className="max-w-3xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {/* Quiz Progress */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-purple-600 mb-2">
              <span>Question {currentQuestion + 1} of {quizQuestions.length}</span>
              <span>{Math.round(((currentQuestion + 1) / quizQuestions.length) * 100)}% Complete</span>
            </div>
            <div className="w-full bg-purple-100 rounded-full h-3">
              <motion.div
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${((currentQuestion + 1) / quizQuestions.length) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          {/* Question Card */}
          <motion.div
            key={currentQuestion}
            className="bg-white rounded-2xl p-8 shadow-lg mb-6"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center mb-8">
              <motion.div
                className="text-4xl mb-4"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
              >
                🤔
              </motion.div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {quizQuestions[currentQuestion].question}
              </h2>
              <p className="text-purple-600 font-medium">
                +{quizQuestions[currentQuestion].xp} XP {streak > 0 && `(+${streak * 5} bonus!)`}
              </p>
            </div>

            <div className="space-y-4">
              {quizQuestions[currentQuestion].options.map((option, index) => (
                <motion.button
                  key={option.id}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                    selectedAnswers[currentQuestion] === option.id
                      ? option.correct
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-red-500 bg-red-50 text-red-700'
                      : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                  }`}
                  onClick={() => handleAnswerSelect(currentQuestion, option.id)}
                  disabled={selectedAnswers[currentQuestion]}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-lg font-bold ${
                      selectedAnswers[currentQuestion] === option.id
                        ? option.correct
                          ? 'border-green-500 bg-green-500 text-white'
                          : 'border-red-500 bg-red-500 text-white'
                        : 'border-purple-300 text-purple-500'
                    }`}>
                      {selectedAnswers[currentQuestion] === option.id
                        ? (option.correct ? '✓' : '✗')
                        : option.id
                      }
                    </div>
                    <span className="text-lg">{option.text}</span>
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Explanation */}
            {selectedAnswers[currentQuestion] && (
              <motion.div
                className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3 }}
              >
                <p className="text-blue-800">{quizQuestions[currentQuestion].explanation}</p>
              </motion.div>
            )}
          </motion.div>

          {/* Navigation */}
          <div className="flex justify-center">
            <motion.button
              onClick={nextQuestion}
              disabled={!selectedAnswers[currentQuestion]}
              className={`px-8 py-4 rounded-xl font-medium transition ${
                !selectedAnswers[currentQuestion]
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg'
              }`}
              whileHover={selectedAnswers[currentQuestion] ? { scale: 1.05 } : {}}
              whileTap={selectedAnswers[currentQuestion] ? { scale: 0.95 } : {}}
            >
              {currentQuestion === quizQuestions.length - 1 ? 'Finish Quiz! 🏆' : 'Next Question →'}
            </motion.button>
          </div>
        </motion.div>
      ) : (
        /* Results Screen */
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
            
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Investment Banking Complete! 🎉</h2>
            <p className="text-xl text-gray-600 mb-6">
              {getScoreMessage()}
            </p>

            {/* Final Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="text-3xl font-bold text-purple-600">{totalXP}</div>
                <div className="text-sm text-gray-600">Total XP</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-3xl font-bold text-green-600">
                  {Object.keys(selectedAnswers).filter(qIndex => {
                    const question = quizQuestions[qIndex];
                    const selectedOption = selectedAnswers[qIndex];
                    return question.options.find(opt => opt.id === selectedOption)?.correct;
                  }).length}
                </div>
                <div className="text-sm text-gray-600">Correct</div>
              </div>
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-3xl font-bold text-blue-600">{lives}</div>
                <div className="text-sm text-gray-600">Lives Left</div>
              </div>
              <div className="bg-orange-50 rounded-lg p-4">
                <div className="text-3xl font-bold text-orange-600">{achievements.length}</div>
                <div className="text-sm text-gray-600">Achievements</div>
              </div>
            </div>

            {/* Achievements */}
            {achievements.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-800 mb-3">🏆 Achievements Unlocked:</h3>
                <div className="flex flex-wrap justify-center gap-2">
                  {achievements.map(achievement => (
                    <div key={achievement.id} className="bg-yellow-100 border border-yellow-300 rounded-lg px-3 py-2">
                      <span className="text-lg mr-2">{achievement.emoji}</span>
                      <span className="text-sm font-medium text-yellow-800">{achievement.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => navigate('/game')}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl font-medium transition shadow-lg"
              >
                Back to Roadmap
              </button>
              <button
                onClick={() => {
                  setCurrentPhase('story');
                  setStoryStep(0);
                  setCurrentQuestion(0);
                  setSelectedAnswers({});
                  setLives(3);
                  setStreak(0);
                  setTotalXP(0);
                  setShowResults(false);
                  setAchievements([]);
                }}
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

export default InvestmentBankingModule;