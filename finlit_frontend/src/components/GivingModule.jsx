import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useModuleScore, MODULES } from '../hooks/useModuleScore';
import ModuleCompletedScreen from './ModuleCompletedScreen';
import { shuffleQuizOptions } from '../utils/shuffleQuizOptions';

// Quiz questions
const quizQuestions = [
  {
    question: "What percentage of income do financial experts typically recommend for charitable giving?",
    options: ["1-2%", "5-10%", "25-30%", "50% or more"],
    correctIndex: 1,
    explanation: "Financial experts suggest allocating 5-10% of your income to charitable giving once you've covered essentials and savings."
  },
  {
    question: "What is a 501(c)(3) organization?",
    options: ["A for-profit charity", "A tax-exempt nonprofit organization", "A government agency", "A private foundation only"],
    correctIndex: 1,
    explanation: "A 501(c)(3) is a tax-exempt nonprofit. Donations to these organizations are tax-deductible."
  },
  {
    question: "What is an employer matching gift program?",
    options: ["When employers give you gifts for donating", "When employers match your charitable donations", "When employers donate on your birthday", "When employers pay you to volunteer"],
    correctIndex: 1,
    explanation: "Employer matching doubles your charitable impact at no extra cost to you. Always check if your company offers this!"
  },
  {
    question: "Which website is commonly used to evaluate charity effectiveness?",
    options: ["Yelp", "Charity Navigator", "LinkedIn", "GoFundMe"],
    correctIndex: 1,
    explanation: "Charity Navigator rates nonprofits on financial health, accountability, and transparency."
  },
  {
    question: "What should you do before donating to an unknown charity?",
    options: ["Donate immediately if it sounds good", "Research and verify the organization", "Only donate if friends recommend it", "Avoid all new charities"],
    correctIndex: 1,
    explanation: "Always research charities before donating to avoid scams. Use sites like Charity Navigator or GiveWell."
  },
  {
    question: "Besides money, what else can you give to charity?",
    options: ["Only money counts", "Time and skills through volunteering", "Nothing else is valuable", "Physical items only"],
    correctIndex: 1,
    explanation: "Volunteering time and skills can be just as valuable as money. Mentoring, pro bono work, and serving on boards all count!"
  },
  {
    question: "What is the 'Giving Pledge'?",
    options: ["A required government donation", "A commitment by wealthy individuals to give majority of wealth", "A monthly subscription to charity", "A tax penalty for not giving"],
    correctIndex: 1,
    explanation: "The Giving Pledge is a commitment by billionaires like Warren Buffett to donate most of their wealth to charity."
  },
  {
    question: "Why is consistent, small giving often better than occasional large donations?",
    options: ["It's not - large donations are always better", "It builds habits and provides reliable support to charities", "Small donations are tax-free", "Charities prefer small amounts"],
    correctIndex: 1,
    explanation: "Consistent giving builds a lifelong habit and provides charities with predictable funding they can plan around."
  },
  {
    question: "What's a key benefit of giving to charity for the giver?",
    options: ["It has no personal benefits", "Increased happiness and life satisfaction", "Guaranteed wealth increase", "Government rewards"],
    correctIndex: 1,
    explanation: "Studies show generous people report higher levels of happiness, health, and connection to their communities."
  },
  {
    question: "When should you NOT donate to charity?",
    options: ["When you have extra money", "When you'd have to go into debt to donate", "When your employer offers matching", "When tax deductions apply"],
    correctIndex: 1,
    explanation: "Never go into debt for charity. Financial health comes first. Give what you can sustainably afford."
  }
];

// Giving scenarios
const givingScenarios = [
  {
    title: "Bonus Decision",
    scenario: "You receive a $500 bonus at work. You've already met your basic needs and emergency fund goals.",
    options: [
      { text: "Keep it all for extra spending", feedback: "It's okay to treat yourself, but consider setting aside even a small portion for giving!", type: "low" },
      { text: "Donate $50 (10%) to a local food bank", feedback: "Great choice! 10% is a generous and sustainable giving amount.", type: "good" },
      { text: "Donate $100 split between two causes", feedback: "Excellent! Diversifying your giving helps multiple causes.", type: "great" }
    ]
  },
  {
    title: "Friend's Marathon",
    scenario: "A friend asks you to donate to their charity marathon. You've already given to charity this month.",
    options: [
      { text: "Decline - you've already given", feedback: "It's fine to stick to your budget! You can support them in other ways.", type: "good" },
      { text: "Donate a small amount to support them", feedback: "Perfect! Supporting friends' causes strengthens relationships.", type: "great" },
      { text: "Offer to volunteer at the event instead", feedback: "Great alternative! Time and support can be just as valuable.", type: "great" }
    ]
  },
  {
    title: "Starting Small",
    scenario: "You want to start giving regularly but have a tight budget. How do you begin?",
    options: [
      { text: "Wait until you earn more money", feedback: "You can start small now! Building the habit is more important than the amount.", type: "low" },
      { text: "Set up a $10/month recurring donation", feedback: "Perfect! Small, consistent giving builds a lifelong habit.", type: "great" },
      { text: "Volunteer time instead of money", feedback: "Excellent alternative! Time is valuable and you're still contributing.", type: "great" }
    ]
  },
  {
    title: "Unknown Charity",
    scenario: "You receive a request from an unknown charity claiming urgent need for disaster relief.",
    options: [
      { text: "Donate immediately - it sounds urgent!", feedback: "Always verify first! Scammers exploit disasters.", type: "low" },
      { text: "Research the charity on Charity Navigator", feedback: "Smart! Always verify charities before donating to avoid scams.", type: "great" },
      { text: "Donate through established organizations", feedback: "Good strategy! Established organizations have verified track records.", type: "good" }
    ]
  }
];

// Intro Page
const IntroPage = ({ onNext }) => {
  return (
    <div className="min-h-screen p-6 pt-20 bg-gradient-to-br from-pink-50 via-rose-50 to-red-50">
      <div className="max-w-4xl mx-auto">
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-pink-500 to-rose-600 shadow-2xl mb-6 text-white">
            <span className="text-5xl">💝</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-3">Giving Back</h1>
          <p className="text-xl text-gray-600">The power of charitable giving</p>
        </motion.div>

        {/* Why Giving Matters */}
        <motion.div
          className="bg-white rounded-3xl p-8 shadow-xl mb-8 border border-gray-100"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Why Giving Matters</h2>
          <p className="text-gray-600 text-center mb-6">
            Studies show that generous people report higher levels of happiness and life satisfaction.
            Giving isn't just good for others; it's good for you too!
          </p>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-5 bg-pink-50 rounded-2xl text-center">
              <div className="text-3xl mb-2">😊</div>
              <div className="font-bold text-gray-800">Increased Happiness</div>
              <p className="text-sm text-gray-600">Givers report more joy</p>
            </div>
            <div className="p-5 bg-rose-50 rounded-2xl text-center">
              <div className="text-3xl mb-2">🤝</div>
              <div className="font-bold text-gray-800">Community Connection</div>
              <p className="text-sm text-gray-600">Build stronger bonds</p>
            </div>
            <div className="p-5 bg-red-50 rounded-2xl text-center">
              <div className="text-3xl mb-2">🌊</div>
              <div className="font-bold text-gray-800">Ripple Effect</div>
              <p className="text-sm text-gray-600">Your impact multiplies</p>
            </div>
          </div>
        </motion.div>

        {/* The Giving Pledge */}
        <motion.div
          className="bg-gradient-to-r from-pink-100 to-rose-100 rounded-2xl p-6 border-2 border-pink-200 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="font-bold text-lg mb-2 text-pink-800">The Giving Pledge</h3>
          <p className="text-pink-700">
            Warren Buffett has pledged 99% of his fortune to charity. You don't have to be a billionaire -
            even small, consistent donations create significant impact over time.
          </p>
        </motion.div>

        <div className="flex justify-center">
          <motion.button
            onClick={onNext}
            className="px-10 py-4 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-600 text-white font-bold text-lg shadow-xl hover:shadow-2xl transition-all"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Learn Smart Giving
          </motion.button>
        </div>
      </div>
    </div>
  );
};

// Smart Giving Page
const SmartGivingPage = ({ onNext, onPrev }) => {
  const [activeTab, setActiveTab] = useState('how-much');

  const tabs = {
    'how-much': {
      title: "How Much to Give",
      content: "Financial experts suggest 5-10% of income for charity once you've covered essentials and savings. Start with what you can afford - even $5/month adds up!",
      tip: "As your income grows, increase your giving percentage."
    },
    'research': {
      title: "Research Before Giving",
      content: "Use sites like Charity Navigator or GiveWell to evaluate nonprofits. Look for organizations with low overhead costs and high impact.",
      tip: "Charity Navigator rates on financial health, accountability, and transparency."
    },
    'tax': {
      title: "Tax Benefits",
      content: "Donations to 501(c)(3) organizations are tax-deductible. Keep receipts and track your donations for tax time!",
      tip: "Itemizing deductions can lower your tax bill significantly."
    }
  };

  const active = tabs[activeTab];

  return (
    <div className="min-h-screen p-6 pt-20 bg-gradient-to-br from-rose-50 via-pink-50 to-fuchsia-50">
      <div className="max-w-4xl mx-auto">
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">Smart Giving Strategies</h1>
          <p className="text-gray-600">Make your contributions count</p>
        </motion.div>

        {/* Tabs */}
        <div className="flex justify-center gap-2 mb-8 flex-wrap">
          {Object.entries(tabs).map(([key, tab]) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`px-5 py-3 rounded-xl font-semibold transition-all ${
                activeTab === key
                  ? 'bg-pink-500 text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {tab.title}
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
            <h3 className="font-bold text-2xl text-gray-800 mb-4">{active.title}</h3>
            <p className="text-gray-600 text-lg mb-6">{active.content}</p>

            <div className="p-4 bg-pink-50 rounded-xl border border-pink-200">
              <span className="font-semibold text-pink-700">Pro Tip: </span>
              <span className="text-pink-700">{active.tip}</span>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Beyond Money */}
        <motion.div
          className="bg-white rounded-2xl p-6 shadow-lg mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h4 className="font-bold text-lg text-gray-800 mb-4">Beyond Money: Other Ways to Give</h4>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-purple-50 rounded-xl text-center">
              <div className="text-2xl mb-2">⏰</div>
              <div className="font-semibold text-gray-800">Volunteer Time</div>
              <p className="text-sm text-gray-600">Mentor, teach, help</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-xl text-center">
              <div className="text-2xl mb-2">🧠</div>
              <div className="font-semibold text-gray-800">Share Skills</div>
              <p className="text-sm text-gray-600">Pro bono work</p>
            </div>
            <div className="p-4 bg-green-50 rounded-xl text-center">
              <div className="text-2xl mb-2">🏢</div>
              <div className="font-semibold text-gray-800">Employer Match</div>
              <p className="text-sm text-gray-600">Double your impact</p>
            </div>
          </div>
        </motion.div>

        <div className="flex justify-center gap-4">
          <button onClick={onPrev} className="px-8 py-4 rounded-xl bg-white text-gray-700 font-semibold shadow-lg border border-gray-200 hover:bg-gray-50">
            Back
          </button>
          <button onClick={onNext} className="px-8 py-4 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold shadow-lg hover:shadow-xl">
            Try Giving Scenarios
          </button>
        </div>
      </div>
    </div>
  );
};

// Giving Scenarios Game
const GivingScenariosGame = ({ onNext }) => {
  const [currentScenario, setCurrentScenario] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [goodChoices, setGoodChoices] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);

  const handleAnswer = (option) => {
    setSelectedAnswer(option);
    if (option.type === 'great' || option.type === 'good') {
      setGoodChoices(goodChoices + 1);
    }
  };

  const nextScenario = () => {
    setSelectedAnswer(null);
    if (currentScenario < givingScenarios.length - 1) {
      setCurrentScenario(currentScenario + 1);
    } else {
      setGameComplete(true);
    }
  };

  if (gameComplete) {
    return (
      <div className="min-h-screen p-6 pt-20 bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <motion.div
          className="bg-white rounded-3xl shadow-2xl p-10 text-center max-w-md w-full"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <div className="w-24 h-24 mx-auto rounded-full bg-green-500 flex items-center justify-center mb-6 text-5xl">
            💝
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-3">Great Choices!</h2>
          <p className="text-gray-600 mb-4">
            You made {goodChoices}/{givingScenarios.length} smart giving decisions
          </p>
          <p className="text-pink-600 mb-6">
            You understand how to give thoughtfully and sustainably!
          </p>

          <button
            onClick={onNext}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 text-white font-bold text-lg shadow-lg"
          >
            Continue to Quiz
          </button>
        </motion.div>
      </div>
    );
  }

  const scenario = givingScenarios[currentScenario];

  return (
    <div className="min-h-screen p-6 pt-20 bg-gradient-to-br from-pink-50 via-rose-50 to-fuchsia-50">
      <div className="max-w-3xl mx-auto">
        <motion.div
          className="text-center mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Giving Decisions</h1>
          <p className="text-gray-600">What would you do in these situations?</p>
          <div className="flex justify-center gap-2 mt-4">
            {givingScenarios.map((_, idx) => (
              <div
                key={idx}
                className={`w-3 h-3 rounded-full transition-all ${
                  idx < currentScenario ? 'bg-pink-500' :
                  idx === currentScenario ? 'bg-pink-600' : 'bg-gray-300'
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
          <div className="p-6 bg-gradient-to-r from-pink-100 to-rose-100 border-b border-pink-200">
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
                    className="w-full p-4 rounded-xl text-left border-2 border-gray-200 hover:border-pink-400 hover:bg-pink-50 transition-all"
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
                  selectedAnswer.type === 'great' ? 'bg-green-50 border-2 border-green-300' :
                  selectedAnswer.type === 'good' ? 'bg-blue-50 border-2 border-blue-300' :
                  'bg-amber-50 border-2 border-amber-300'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">
                      {selectedAnswer.type === 'great' ? '🌟' : selectedAnswer.type === 'good' ? '👍' : '💭'}
                    </span>
                    <span className={`font-bold ${
                      selectedAnswer.type === 'great' ? 'text-green-700' :
                      selectedAnswer.type === 'good' ? 'text-blue-700' :
                      'text-amber-700'
                    }`}>
                      {selectedAnswer.type === 'great' ? 'Excellent Choice!' :
                       selectedAnswer.type === 'good' ? 'Good Thinking!' :
                       'Consider Other Options'}
                    </span>
                  </div>
                  <p className="text-gray-700">{selectedAnswer.feedback}</p>
                </div>

                <button
                  onClick={nextScenario}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold shadow-lg"
                >
                  {currentScenario < givingScenarios.length - 1 ? 'Next Scenario' : 'See Results'}
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
      <div className="min-h-screen p-6 pt-20 flex items-center justify-center bg-gradient-to-br from-pink-50 to-rose-100">
        <motion.div
          className="bg-white rounded-3xl shadow-2xl p-10 text-center max-w-md w-full"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <div className={`w-28 h-28 mx-auto rounded-full flex items-center justify-center mb-6 shadow-xl text-5xl ${passed ? 'bg-gradient-to-br from-green-400 to-emerald-500' : 'bg-gradient-to-br from-amber-400 to-orange-500'}`}>
            {passed ? '💝' : '📚'}
          </div>

          <h2 className="text-3xl font-bold text-gray-800 mb-3">{passed ? 'Generous Heart!' : 'Keep Learning!'}</h2>
          <p className="text-xl text-gray-600 mb-6">
            You scored <span className="font-bold text-pink-600">{score}/{questions.length}</span> ({(score/questions.length*100).toFixed(0)}%)
          </p>

          {passed ? (
            <div className="bg-green-50 border-2 border-green-400 rounded-xl p-5 mb-6">
              <p className="text-green-800 font-bold">Congratulations! You passed!</p>
              <p className="text-green-700 text-sm">You understand smart giving strategies!</p>
            </div>
          ) : (
            <div className="bg-amber-50 border-2 border-amber-400 rounded-xl p-5 mb-6">
              <p className="text-amber-800 font-bold">You need 80% to pass</p>
              <p className="text-amber-700 text-sm">Review the material and try again!</p>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <button onClick={onRetake} className="w-full py-4 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold hover:shadow-lg transition-shadow">
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
    <div className="min-h-screen p-6 pt-20 bg-gradient-to-br from-pink-50 to-rose-100">
      <div className="max-w-3xl mx-auto">
        {/* Progress */}
        <div className="flex justify-center gap-1.5 mb-6">
          {questions.map((_, idx) => (
            <div
              key={idx}
              className={`h-2 rounded-full transition-all ${
                idx < currentQuestion ? 'w-8 bg-pink-500' :
                idx === currentQuestion ? 'w-8 bg-pink-400' : 'w-2 bg-gray-300'
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
              <span className="text-sm font-bold text-pink-600 uppercase tracking-wider">
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
                          ? 'bg-pink-50 border-pink-500 scale-[1.01]'
                          : 'border-gray-200 hover:border-pink-400 hover:bg-pink-50'
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold flex-shrink-0 ${
                      showCorrectness && isCorrect ? 'bg-green-500 text-white' :
                      showCorrectness && isSelected ? 'bg-red-500 text-white' :
                      isSelected ? 'bg-pink-500 text-white' : 'bg-gray-100 text-gray-500'
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
                className="mt-6 bg-pink-50 border-2 border-pink-200 p-6 rounded-xl"
              >
                <h4 className="font-bold text-pink-600 uppercase tracking-wider text-sm mb-2">Explanation</h4>
                <p className="text-gray-700 mb-4">{q.explanation}</p>
                <button onClick={onNext} className="w-full py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg font-bold hover:shadow-lg transition-shadow">
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
const GivingModule = () => {
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

  const modulePassed = isModulePassed(MODULES.GIVING?.id);
  const totalSteps = 3;

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
        saveScore(MODULES.GIVING.id, (finalScore / shuffledQuestions.length) * 100);
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
        emoji="💝"
        moduleName="Giving Back"
        description="You understand the power and strategies of charitable giving!"
        gradientClasses="from-pink-50 via-rose-100 to-red-200"
        onReviewClick={() => setIsReviewMode(true)}
      />
    );
  }

  return (
    <div className="min-h-screen relative">
      <button
        className="fixed top-4 left-4 px-4 py-2 rounded-lg text-pink-700 hover:bg-white/80 backdrop-blur-sm font-medium transition z-50 shadow-sm border border-pink-200 bg-white/70"
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
          {currentStep === 1 && <SmartGivingPage onNext={handleNext} onPrev={handlePrev} />}
          {currentStep === 2 && <GivingScenariosGame onNext={handleNext} />}
          {currentStep === 3 && (
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

export default GivingModule;
