import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useModuleScore, MODULES } from '../hooks/useModuleScore';
import ModuleCompletedScreen from './ModuleCompletedScreen';
import { shuffleQuizOptions } from '../utils/shuffleQuizOptions';

// Quiz questions
const quizQuestions = [
  {
    question: "What is 'anchoring' in consumer psychology?",
    options: ["When stores anchor products to shelves", "Using a high initial price to make other prices seem lower", "A type of loyalty program", "When prices stay the same for years"],
    correctIndex: 1,
    explanation: "Anchoring uses a high 'original' price to make the sale price seem like an amazing deal, even if the item was never worth that much."
  },
  {
    question: "What should you do when you see 'Only 3 left in stock!'?",
    options: ["Buy immediately before it's gone", "Buy two just in case", "Recognize it as artificial urgency and take time to decide", "Trust that low stock means high quality"],
    correctIndex: 2,
    explanation: "Low stock warnings create artificial urgency. Take time to decide - the item is often restocked or available elsewhere."
  },
  {
    question: "Why do companies offer free trials with credit card requirements?",
    options: ["To verify your age", "Because they trust you to cancel", "They count on people forgetting to cancel", "It's required by law"],
    correctIndex: 2,
    explanation: "Companies know most people forget to cancel. Always set a calendar reminder before the trial ends!"
  },
  {
    question: "What is the 'decoy effect' in pricing?",
    options: ["Offering a fake product to distract you", "Adding a middle option to make another seem like better value", "Hiding the real price", "Using celebrity endorsements"],
    correctIndex: 1,
    explanation: "The decoy is an option priced to look bad, making another option look like better value. Example: Medium coffee priced close to Large."
  },
  {
    question: "How can you protect yourself from impulse purchases?",
    options: ["Always buy when there's a sale", "Use the 24-48 hour waiting rule", "Only shop when you're in a good mood", "Buy everything on credit"],
    correctIndex: 1,
    explanation: "The 24-48 hour rule helps reduce impulse decisions. If you still want it after waiting, it's more likely a thoughtful purchase."
  },
  {
    question: "What's the best response to 'FREE shipping over $50' when your cart is $35?",
    options: ["Add $15 of items to get free shipping", "Calculate if shipping costs less than extra items", "Always spend to get free shipping", "Abandon the cart entirely"],
    correctIndex: 1,
    explanation: "Do the math! If shipping is $7 and you'd add $15 to get 'free' shipping, you lose $8. Just pay shipping."
  },
  {
    question: "Why are add-ons offered at checkout often a bad deal?",
    options: ["They're always defective", "They don't actually exist", "They're typically overpriced compared to alternatives", "They void the warranty"],
    correctIndex: 2,
    explanation: "Checkout add-ons (cases, protection plans, etc.) are often 50-80% more expensive than alternatives you can find elsewhere."
  },
  {
    question: "What should you be suspicious of with 'Original Price $X' claims?",
    options: ["Nothing - original prices are always accurate", "The item might never have sold at that price", "The item is probably used", "The store is going out of business"],
    correctIndex: 1,
    explanation: "Many 'original' prices are inflated to make discounts seem bigger. Research actual market prices before assuming it's a deal."
  },
  {
    question: "How often should you audit your subscription services?",
    options: ["Never - set and forget", "Once a year", "Monthly or quarterly", "Only when you run out of money"],
    correctIndex: 2,
    explanation: "The average American wastes $348/year on unused subscriptions. Regular audits help catch services you've forgotten."
  },
  {
    question: "What's the best strategy when seeing countdown timers on sales?",
    options: ["Buy before time runs out", "Check if the timer resets or the sale returns", "Trust that the urgency is real", "Buy double to stock up"],
    correctIndex: 1,
    explanation: "Many countdown timers reset or the same 'sale' runs repeatedly. Test by opening in incognito or checking back later."
  }
];

// Consumer trap scenarios
const trapScenarios = [
  {
    title: "The 'Sale' Price",
    scenario: "You see a jacket marked 'Originally $200, NOW $79!' with a big red 'SALE' sign.",
    traps: ["Anchoring with inflated 'original' price", "Urgency through 'SALE' signage"],
    options: [
      { text: "Buy it immediately - 60% off!", feedback: "Wait! The 'original' price might be inflated. Research the market value first.", type: "trap" },
      { text: "Research similar jackets online first", feedback: "Smart! You might find similar jackets regularly priced at $70-80.", type: "great" },
      { text: "Take a photo and wait 24 hours", feedback: "Good strategy! Waiting reduces impulse decisions.", type: "good" }
    ]
  },
  {
    title: "The Free Trial",
    scenario: "A streaming service offers '30 days FREE, then $14.99/month.' They require your credit card upfront.",
    traps: ["Free trial auto-converts to paid", "Credit card makes forgetting easy"],
    options: [
      { text: "Sign up - I'll remember to cancel", feedback: "Most people forget! Set a reminder immediately if you do sign up.", type: "trap" },
      { text: "Sign up and immediately set a cancellation reminder", feedback: "Perfect! Setting the reminder immediately is the smart approach.", type: "great" },
      { text: "Use a virtual card that expires before billing", feedback: "Clever! Virtual cards protect against unwanted charges.", type: "great" }
    ]
  },
  {
    title: "Limited Time Pressure",
    scenario: "An online store shows 'Flash Sale! 70% OFF - Ends in 2:47:33!' with a countdown timer.",
    traps: ["Artificial urgency with countdown", "FOMO (Fear of Missing Out)"],
    options: [
      { text: "Buy now before time runs out!", feedback: "These timers often reset! Don't let artificial urgency drive decisions.", type: "trap" },
      { text: "Open incognito window to check if timer resets", feedback: "Excellent! Many 'limited time' sales reset or always run.", type: "great" },
      { text: "Search for the same item on other sites", feedback: "Smart! Price comparison often reveals these 'deals' aren't special.", type: "good" }
    ]
  },
  {
    title: "The Upsell at Checkout",
    scenario: "You're buying a $599 phone. At checkout: 'Add protection plan ($149), premium case ($79), and screen protector ($39)?'",
    traps: ["Upselling when you're committed", "Prices seem small vs. main purchase"],
    options: [
      { text: "Add everything - protect my investment", feedback: "These add-ons are overpriced. Third-party accessories are 50-80% cheaper!", type: "trap" },
      { text: "Skip and research accessories separately", feedback: "Perfect! Third-party accessories offer same quality for much less.", type: "great" },
      { text: "Just add the protection plan", feedback: "Protection plans rarely pay off. Credit cards often include free coverage.", type: "trap" }
    ]
  },
  {
    title: "The 'Free' Shipping Trap",
    scenario: "Your cart is $35. A banner says 'FREE SHIPPING on orders over $50!' Shipping otherwise costs $7.",
    traps: ["Spending more to 'save' on shipping", "Adding unnecessary items"],
    options: [
      { text: "Add items to qualify for free shipping", feedback: "You're spending $15+ to 'save' $7! That's a net loss.", type: "trap" },
      { text: "Calculate: shipping ($7) vs extra items ($15+)", feedback: "Smart math! Pay the $7 shipping and save $8+.", type: "great" },
      { text: "Look for a free shipping promo code", feedback: "Good thinking! Browser extensions can find codes automatically.", type: "good" }
    ]
  }
];

// Intro Page
const IntroPage = ({ onNext }) => {
  return (
    <div className="min-h-screen p-6 pt-20 bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
      <div className="max-w-4xl mx-auto">
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-2xl mb-6 text-white">
            <span className="text-5xl">🪤</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-3">Consumer Traps</h1>
          <p className="text-xl text-gray-600">Spot and avoid marketing tricks</p>
        </motion.div>

        {/* What Are Consumer Traps */}
        <motion.div
          className="bg-white rounded-3xl p-8 shadow-xl mb-8 border border-gray-100"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">What Are Consumer Traps?</h2>
          <p className="text-gray-600 text-center mb-6">
            Marketing tactics and psychological tricks designed to make you spend more than intended.
            The average person sees 4,000-10,000 ads per day!
          </p>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-5 bg-amber-50 rounded-2xl text-center">
              <div className="text-3xl mb-2">⚓</div>
              <div className="font-bold text-gray-800">Anchoring</div>
              <p className="text-sm text-gray-600">Fake "original" prices</p>
            </div>
            <div className="p-5 bg-orange-50 rounded-2xl text-center">
              <div className="text-3xl mb-2">⏰</div>
              <div className="font-bold text-gray-800">False Urgency</div>
              <p className="text-sm text-gray-600">Countdown timers, "low stock"</p>
            </div>
            <div className="p-5 bg-red-50 rounded-2xl text-center">
              <div className="text-3xl mb-2">🔄</div>
              <div className="font-bold text-gray-800">Subscription Traps</div>
              <p className="text-sm text-gray-600">Hard-to-cancel services</p>
            </div>
          </div>
        </motion.div>

        {/* Stat */}
        <motion.div
          className="bg-gradient-to-r from-amber-100 to-orange-100 rounded-2xl p-6 border-2 border-amber-200 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="font-bold text-lg mb-2 text-amber-800">Did You Know?</h3>
          <p className="text-amber-700">
            The average American wastes $348 per year on unused subscriptions. Learning to spot traps can save you thousands!
          </p>
        </motion.div>

        <div className="flex justify-center">
          <motion.button
            onClick={onNext}
            className="px-10 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold text-lg shadow-xl hover:shadow-2xl transition-all"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Learn the Tactics
          </motion.button>
        </div>
      </div>
    </div>
  );
};

// Common Traps Page
const CommonTrapsPage = ({ onNext, onPrev }) => {
  const [expandedTrap, setExpandedTrap] = useState(null);

  const traps = [
    {
      name: "Anchoring Effect",
      icon: "⚓",
      short: "Inflated 'original' prices make discounts seem bigger",
      detail: "When you see '$500 crossed out, NOW $199!', the $500 anchors your perception. Research shows the item may have never sold for $500.",
      defense: "Always research actual market prices before assuming it's a deal."
    },
    {
      name: "Artificial Urgency",
      icon: "⏰",
      short: "Countdown timers and 'limited stock' warnings",
      detail: "Flash sales, 'Only 3 left!', and countdown timers create FOMO. Many reset or the sale returns immediately after.",
      defense: "Check if timers reset in incognito mode. Wait 24 hours for non-essentials."
    },
    {
      name: "Subscription Traps",
      icon: "🔄",
      short: "Free trials that auto-convert to paid",
      detail: "Companies require credit cards knowing most forget to cancel. Cancellation is often intentionally difficult.",
      defense: "Set a calendar reminder 3 days before any trial ends. Use virtual cards when possible."
    },
    {
      name: "Decoy Pricing",
      icon: "🎯",
      short: "Middle option priced to push you to the expensive one",
      detail: "Small $3, Medium $4.50, Large $5. The medium is the decoy - bad value to make large seem smart.",
      defense: "Buy what you NEED, not what seems like the 'best value'."
    },
    {
      name: "Free Shipping Threshold",
      icon: "📦",
      short: "Spending more to 'save' on shipping",
      detail: "Cart is $35, free shipping at $50. You add $15+ to save $7 shipping - net loss of $8!",
      defense: "Calculate: Is shipping cheaper than the extra items? Usually yes."
    }
  ];

  return (
    <div className="min-h-screen p-6 pt-20 bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      <div className="max-w-4xl mx-auto">
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">Common Consumer Traps</h1>
          <p className="text-gray-600">Tap each trap to learn how to defend against it</p>
        </motion.div>

        <div className="space-y-4 mb-8">
          {traps.map((trap, idx) => (
            <motion.div
              key={idx}
              className={`bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer transition-all border-2 ${
                expandedTrap === idx ? 'border-amber-400' : 'border-transparent'
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => setExpandedTrap(expandedTrap === idx ? null : idx)}
            >
              <div className="p-5 flex items-center gap-4">
                <div className="text-3xl">{trap.icon}</div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800">{trap.name}</h3>
                  <p className="text-sm text-gray-600">{trap.short}</p>
                </div>
                <div className={`transition-transform ${expandedTrap === idx ? 'rotate-180' : ''}`}>
                  ▼
                </div>
              </div>

              <AnimatePresence>
                {expandedTrap === idx && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-gray-100"
                  >
                    <div className="p-5">
                      <p className="text-gray-700 mb-4">{trap.detail}</p>
                      <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                        <span className="font-bold text-green-700">Defense: </span>
                        <span className="text-green-700">{trap.defense}</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        <div className="flex justify-center gap-4">
          <button onClick={onPrev} className="px-8 py-4 rounded-xl bg-white text-gray-700 font-semibold shadow-lg border border-gray-200 hover:bg-gray-50">
            Back
          </button>
          <button onClick={onNext} className="px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold shadow-lg hover:shadow-xl">
            Practice Spotting Traps
          </button>
        </div>
      </div>
    </div>
  );
};

// Trap Spotting Game
const TrapSpottingGame = ({ onNext }) => {
  const [currentScenario, setCurrentScenario] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [trapsAvoided, setTrapsAvoided] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);

  const handleAnswer = (option) => {
    setSelectedAnswer(option);
    if (option.type === 'great' || option.type === 'good') {
      setTrapsAvoided(trapsAvoided + 1);
    }
  };

  const nextScenario = () => {
    setSelectedAnswer(null);
    if (currentScenario < trapScenarios.length - 1) {
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
            🛡️
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-3">Trap Spotter!</h2>
          <p className="text-gray-600 mb-4">
            You avoided {trapsAvoided}/{trapScenarios.length} consumer traps
          </p>
          <p className="text-amber-600 mb-6">
            You're getting better at spotting marketing tricks!
          </p>

          <button
            onClick={onNext}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold text-lg shadow-lg"
          >
            Continue to Quiz
          </button>
        </motion.div>
      </div>
    );
  }

  const scenario = trapScenarios[currentScenario];

  return (
    <div className="min-h-screen p-6 pt-20 bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
      <div className="max-w-3xl mx-auto">
        <motion.div
          className="text-center mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Spot the Trap!</h1>
          <p className="text-gray-600">Can you avoid these consumer traps?</p>
          <div className="flex justify-center gap-2 mt-4">
            {trapScenarios.map((_, idx) => (
              <div
                key={idx}
                className={`w-3 h-3 rounded-full transition-all ${
                  idx < currentScenario ? 'bg-amber-500' :
                  idx === currentScenario ? 'bg-amber-600' : 'bg-gray-300'
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
          <div className="p-6 bg-gradient-to-r from-amber-100 to-orange-100 border-b border-amber-200">
            <h3 className="text-xl font-bold text-gray-800">{scenario.title}</h3>
          </div>

          <div className="p-6">
            <p className="text-gray-700 mb-4 p-4 bg-gray-50 rounded-xl">{scenario.scenario}</p>

            {/* Hidden Traps Reveal */}
            <div className="mb-6 p-4 bg-red-50 rounded-xl border border-red-200">
              <p className="font-semibold text-red-700 mb-2">Hidden Traps Here:</p>
              <ul className="text-sm text-red-600 space-y-1">
                {scenario.traps.map((trap, idx) => (
                  <li key={idx}>• {trap}</li>
                ))}
              </ul>
            </div>

            {!selectedAnswer ? (
              <div className="space-y-3">
                {scenario.options.map((option, idx) => (
                  <motion.button
                    key={idx}
                    onClick={() => handleAnswer(option)}
                    className="w-full p-4 rounded-xl text-left border-2 border-gray-200 hover:border-amber-400 hover:bg-amber-50 transition-all"
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
                  'bg-red-50 border-2 border-red-300'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">
                      {selectedAnswer.type === 'great' ? '🛡️' : selectedAnswer.type === 'good' ? '👍' : '🪤'}
                    </span>
                    <span className={`font-bold ${
                      selectedAnswer.type === 'great' ? 'text-green-700' :
                      selectedAnswer.type === 'good' ? 'text-blue-700' :
                      'text-red-700'
                    }`}>
                      {selectedAnswer.type === 'great' ? 'Trap Avoided!' :
                       selectedAnswer.type === 'good' ? 'Partial Defense' :
                       'You Fell for It!'}
                    </span>
                  </div>
                  <p className="text-gray-700">{selectedAnswer.feedback}</p>
                </div>

                <button
                  onClick={nextScenario}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold shadow-lg"
                >
                  {currentScenario < trapScenarios.length - 1 ? 'Next Scenario' : 'See Results'}
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
      <div className="min-h-screen p-6 pt-20 flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100">
        <motion.div
          className="bg-white rounded-3xl shadow-2xl p-10 text-center max-w-md w-full"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <div className={`w-28 h-28 mx-auto rounded-full flex items-center justify-center mb-6 shadow-xl text-5xl ${passed ? 'bg-gradient-to-br from-green-400 to-emerald-500' : 'bg-gradient-to-br from-amber-400 to-orange-500'}`}>
            {passed ? '🛡️' : '📚'}
          </div>

          <h2 className="text-3xl font-bold text-gray-800 mb-3">{passed ? 'Trap Expert!' : 'Keep Learning!'}</h2>
          <p className="text-xl text-gray-600 mb-6">
            You scored <span className="font-bold text-amber-600">{score}/{questions.length}</span> ({(score/questions.length*100).toFixed(0)}%)
          </p>

          {passed ? (
            <div className="bg-green-50 border-2 border-green-400 rounded-xl p-5 mb-6">
              <p className="text-green-800 font-bold">Congratulations! You passed!</p>
              <p className="text-green-700 text-sm">You can spot and avoid consumer traps!</p>
            </div>
          ) : (
            <div className="bg-amber-50 border-2 border-amber-400 rounded-xl p-5 mb-6">
              <p className="text-amber-800 font-bold">You need 80% to pass</p>
              <p className="text-amber-700 text-sm">Review the material and try again!</p>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <button onClick={onRetake} className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold hover:shadow-lg transition-shadow">
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
    <div className="min-h-screen p-6 pt-20 bg-gradient-to-br from-amber-50 to-orange-100">
      <div className="max-w-3xl mx-auto">
        {/* Progress */}
        <div className="flex justify-center gap-1.5 mb-6">
          {questions.map((_, idx) => (
            <div
              key={idx}
              className={`h-2 rounded-full transition-all ${
                idx < currentQuestion ? 'w-8 bg-amber-500' :
                idx === currentQuestion ? 'w-8 bg-amber-400' : 'w-2 bg-gray-300'
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
              <span className="text-sm font-bold text-amber-600 uppercase tracking-wider">
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
                          ? 'bg-amber-50 border-amber-500 scale-[1.01]'
                          : 'border-gray-200 hover:border-amber-400 hover:bg-amber-50'
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold flex-shrink-0 ${
                      showCorrectness && isCorrect ? 'bg-green-500 text-white' :
                      showCorrectness && isSelected ? 'bg-red-500 text-white' :
                      isSelected ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-500'
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
                className="mt-6 bg-amber-50 border-2 border-amber-200 p-6 rounded-xl"
              >
                <h4 className="font-bold text-amber-600 uppercase tracking-wider text-sm mb-2">Explanation</h4>
                <p className="text-gray-700 mb-4">{q.explanation}</p>
                <button onClick={onNext} className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg font-bold hover:shadow-lg transition-shadow">
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
const ConsumerTrapsModule = () => {
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

  const modulePassed = isModulePassed(MODULES.CONSUMER_TRAPS?.id);
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
        saveScore(MODULES.CONSUMER_TRAPS.id, (finalScore / shuffledQuestions.length) * 100);
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
        emoji="🛡️"
        moduleName="Consumer Traps"
        description="You can spot and avoid marketing tricks and consumer traps!"
        gradientClasses="from-amber-50 via-orange-100 to-red-200"
        onReviewClick={() => setIsReviewMode(true)}
      />
    );
  }

  return (
    <div className="min-h-screen relative">
      <button
        className="fixed top-4 left-4 px-4 py-2 rounded-lg text-amber-700 hover:bg-white/80 backdrop-blur-sm font-medium transition z-50 shadow-sm border border-amber-200 bg-white/70"
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
          {currentStep === 1 && <CommonTrapsPage onNext={handleNext} onPrev={handlePrev} />}
          {currentStep === 2 && <TrapSpottingGame onNext={handleNext} />}
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

export default ConsumerTrapsModule;
