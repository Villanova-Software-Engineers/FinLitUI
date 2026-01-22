import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CreditCard, Calculator, TrendingDown, CheckCircle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useModuleScore, MODULES } from '../hooks/useModuleScore';

const DebtManagementModule = () => {
  const navigate = useNavigate();
  const { isModulePassed, saveScore } = useModuleScore();

  // Check if module is already passed
  const modulePassed = isModulePassed(MODULES.DEBT_MANAGEMENT?.id);
  const [currentScenario, setCurrentScenario] = useState(0);
  const [selectedStrategies, setSelectedStrategies] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  // Module score saving state
  const [isSaving, setIsSaving] = useState(false);
  const [saveResult, setSaveResult] = useState(null);

  const scenarios = [
    {
      id: 1,
      title: "High Credit Card Debt",
      description: "Sarah has $15,000 in credit card debt across 3 cards with interest rates of 18%, 22%, and 25%.",
      situation: {
        totalDebt: 15000,
        cards: [
          { name: "Card A", balance: 5000, rate: 18, minPayment: 150 },
          { name: "Card B", balance: 4000, rate: 22, minPayment: 120 },
          { name: "Card C", balance: 6000, rate: 25, minPayment: 180 }
        ],
        monthlyIncome: 4000,
        expenses: 2800
      },
      strategies: [
        {
          id: 'avalanche',
          name: 'Debt Avalanche',
          description: 'Pay minimums on all cards, put extra money toward highest interest rate',
          correct: true,
          explanation: 'This saves the most money on interest over time by tackling the 25% card first.'
        },
        {
          id: 'snowball',
          name: 'Debt Snowball',
          description: 'Pay minimums on all cards, put extra money toward smallest balance',
          correct: false,
          explanation: 'While motivating, this costs more in interest since the highest rate card is largest.'
        },
        {
          id: 'balance',
          name: 'Balance Transfer',
          description: 'Transfer all balances to a 0% APR promotional card',
          correct: true,
          explanation: 'If she qualifies and pays it off during the promotional period, this could save significant interest.'
        },
        {
          id: 'minimum',
          name: 'Pay Minimums Only',
          description: 'Just pay minimum payments on all cards',
          correct: false,
          explanation: 'This will take decades to pay off and cost tens of thousands in interest.'
        }
      ]
    },
    {
      id: 2,
      title: "Student Loan Strategy",
      description: "Michael has $45,000 in student loans with varying interest rates and is considering his repayment options.",
      situation: {
        totalDebt: 45000,
        loans: [
          { name: "Federal Loan 1", balance: 20000, rate: 4.5, type: "federal" },
          { name: "Federal Loan 2", balance: 15000, rate: 3.8, type: "federal" },
          { name: "Private Loan", balance: 10000, rate: 7.2, type: "private" }
        ],
        monthlyIncome: 5500,
        expenses: 3200
      },
      strategies: [
        {
          id: 'income-driven',
          name: 'Income-Driven Repayment',
          description: 'Enroll in IBR for federal loans, pay minimums',
          correct: false,
          explanation: 'While reducing monthly payments, this extends repayment and increases total interest paid.'
        },
        {
          id: 'target-private',
          name: 'Target Private Loan First',
          description: 'Pay minimums on federal loans, aggressively pay down 7.2% private loan',
          correct: true,
          explanation: 'Private loans offer fewer protections and have the highest rate, making them priority.'
        },
        {
          id: 'refinance-all',
          name: 'Refinance Everything',
          description: 'Refinance all loans to potentially lower rates',
          correct: false,
          explanation: 'Refinancing federal loans loses protections like forbearance and forgiveness options.'
        },
        {
          id: 'pay-minimums',
          name: 'Pay All Minimums Equally',
          description: 'Pay minimum on all loans, invest extra money',
          correct: false,
          explanation: 'The 7.2% private loan rate is higher than typical investment returns, especially risk-adjusted.'
        }
      ]
    },
    {
      id: 3,
      title: "Emergency Debt Situation",
      description: "Lisa lost her job and is struggling with debt payments while looking for work.",
      situation: {
        totalDebt: 25000,
        debts: [
          { name: "Credit Cards", balance: 12000, minPayment: 360 },
          { name: "Car Loan", balance: 8000, minPayment: 280 },
          { name: "Personal Loan", balance: 5000, minPayment: 150 }
        ],
        emergencyFund: 3000,
        unemploymentBenefit: 1400
      },
      strategies: [
        {
          id: 'use-emergency',
          name: 'Use Emergency Fund to Pay Debts',
          description: 'Drain emergency fund to pay down debt balances',
          correct: false,
          explanation: 'Emergency fund should be preserved during unemployment to cover essential expenses.'
        },
        {
          id: 'contact-creditors',
          name: 'Contact Creditors for Hardship Programs',
          description: 'Call all creditors to explain situation and request payment modifications',
          correct: true,
          explanation: 'Most creditors offer hardship programs with reduced payments during unemployment.'
        },
        {
          id: 'debt-consolidation',
          name: 'Take Debt Consolidation Loan',
          description: 'Apply for a large loan to pay off all existing debts',
          correct: false,
          explanation: 'Unlikely to qualify during unemployment, and adds another payment obligation.'
        },
        {
          id: 'bankruptcy',
          name: 'File for Bankruptcy Immediately',
          description: 'File Chapter 7 bankruptcy to eliminate all debts',
          correct: false,
          explanation: 'Bankruptcy should be a last resort after exploring all other options and getting counseling.'
        }
      ]
    }
  ];

  const handleStrategySelect = (scenarioIndex, strategyId) => {
    setSelectedStrategies({
      ...selectedStrategies,
      [scenarioIndex]: strategyId
    });
  };

  const calculateScore = () => {
    let correctCount = 0;
    scenarios.forEach((scenario, index) => {
      const selectedStrategy = selectedStrategies[index];
      const strategy = scenario.strategies.find(s => s.id === selectedStrategy);
      if (strategy && strategy.correct) {
        correctCount++;
      }
    });
    return correctCount;
  };


  // Save the module score when quiz is completed
  const saveModuleScore = async (finalScore) => {
    setIsSaving(true);
    try {
      // Convert score to percentage (0-100)
      const percentageScore = Math.round((finalScore / scenarios.length) * 100);
      const result = await saveScore(MODULES.DEBT_MANAGEMENT.id, percentageScore, 100);
      setSaveResult(result);
    } catch (err) {
      console.error('Error saving score:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleFinish = async () => {
    const finalScore = calculateScore();
    setScore(finalScore);
    setShowResults(true);

    // Save the score to Firestore
    await saveModuleScore(finalScore);
  };

  const resetModule = () => {
    setCurrentScenario(0);
    setSelectedStrategies({});
    setShowResults(false);
    setScore(0);
  };

  // If module is already passed, show completion screen
  if (modulePassed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 p-6 flex items-center justify-center">
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
            💳
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Module Completed!</h2>
          <p className="text-gray-600 mb-6">
            You've already passed the Debt Management module. Great job learning how to manage and eliminate debt!
          </p>
          <div className="bg-green-50 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-center gap-2 text-green-600">
              <span className="text-2xl">✓</span>
              <span className="font-semibold">100% Complete</span>
            </div>
          </div>
          <motion.button
            onClick={() => navigate('/game')}
            className="w-full px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold transition"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Back to Learning Path
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 p-6">
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
          <h1 className="text-2xl font-bold text-gray-800">Debt Management</h1>
          <p className="text-sm text-gray-600">Strategic Scenario Analysis</p>
        </div>

        <div className="flex items-center gap-2 text-orange-600">
          <CreditCard className="w-5 h-5" />
          <span className="font-semibold">100 XP</span>
        </div>
      </motion.div>

      {!showResults ? (
        <div className="max-w-4xl mx-auto">
          {/* Progress Indicator */}
          <div className="flex items-center justify-center mb-8">
            {scenarios.map((_, index) => (
              <div key={index} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${currentScenario >= index ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                  {index + 1}
                </div>
                {index < scenarios.length - 1 && <div className={`w-16 h-1 ${currentScenario > index ? 'bg-orange-500' : 'bg-gray-200'}`} />}
              </div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentScenario}
              className="bg-white rounded-2xl p-8 shadow-lg"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5 }}
            >
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  {scenarios[currentScenario].title}
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  {scenarios[currentScenario].description}
                </p>
              </div>

              {/* Situation Details */}
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Calculator className="w-5 h-5" />
                  Financial Situation
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {scenarios[currentScenario].situation.totalDebt && (
                    <div>
                      <span className="text-sm text-gray-600">Total Debt</span>
                      <div className="text-xl font-bold text-red-600">
                        ${scenarios[currentScenario].situation.totalDebt.toLocaleString()}
                      </div>
                    </div>
                  )}

                  {scenarios[currentScenario].situation.monthlyIncome && (
                    <div>
                      <span className="text-sm text-gray-600">Monthly Income</span>
                      <div className="text-xl font-bold text-green-600">
                        ${scenarios[currentScenario].situation.monthlyIncome.toLocaleString()}
                      </div>
                    </div>
                  )}

                  {scenarios[currentScenario].situation.expenses && (
                    <div>
                      <span className="text-sm text-gray-600">Monthly Expenses</span>
                      <div className="text-xl font-bold text-orange-600">
                        ${scenarios[currentScenario].situation.expenses.toLocaleString()}
                      </div>
                    </div>
                  )}

                  {scenarios[currentScenario].situation.emergencyFund && (
                    <div>
                      <span className="text-sm text-gray-600">Emergency Fund</span>
                      <div className="text-xl font-bold text-blue-600">
                        ${scenarios[currentScenario].situation.emergencyFund.toLocaleString()}
                      </div>
                    </div>
                  )}
                </div>

                {/* Detailed Debt Breakdown */}
                {scenarios[currentScenario].situation.cards && (
                  <div className="mt-4">
                    <h4 className="font-bold text-gray-700 mb-2">Credit Cards:</h4>
                    <div className="space-y-2">
                      {scenarios[currentScenario].situation.cards.map((card, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span>{card.name}</span>
                          <span>${card.balance.toLocaleString()} at {card.rate}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {scenarios[currentScenario].situation.loans && (
                  <div className="mt-4">
                    <h4 className="font-bold text-gray-700 mb-2">Loans:</h4>
                    <div className="space-y-2">
                      {scenarios[currentScenario].situation.loans.map((loan, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span>{loan.name}</span>
                          <span>${loan.balance.toLocaleString()} at {loan.rate}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Strategy Options */}
              <div className="mb-8">
                <h3 className="text-lg font-bold text-gray-800 mb-4">What's the best debt management strategy?</h3>
                <div className="space-y-3">
                  {scenarios[currentScenario].strategies.map((strategy) => (
                    <motion.button
                      key={strategy.id}
                      className={`w-full p-4 rounded-lg border-2 text-left transition-all ${selectedStrategies[currentScenario] === strategy.id
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      onClick={() => handleStrategySelect(currentScenario, strategy.id)}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 mt-1 ${selectedStrategies[currentScenario] === strategy.id
                          ? 'border-orange-500 bg-orange-500'
                          : 'border-gray-300'
                          }`}>
                          {selectedStrategies[currentScenario] === strategy.id && (
                            <div className="w-full h-full rounded-full bg-white scale-50"></div>
                          )}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800">{strategy.name}</h4>
                          <p className="text-sm text-gray-600">{strategy.description}</p>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Navigation */}
              <div className="flex justify-between">
                <button
                  onClick={() => setCurrentScenario(Math.max(0, currentScenario - 1))}
                  disabled={currentScenario === 0}
                  className={`px-6 py-3 rounded-lg font-medium transition ${currentScenario === 0
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-300 hover:bg-gray-400 text-gray-700'
                    }`}
                >
                  Previous
                </button>

                {currentScenario < scenarios.length - 1 ? (
                  <button
                    onClick={() => setCurrentScenario(currentScenario + 1)}
                    disabled={!selectedStrategies[currentScenario]}
                    className={`px-6 py-3 rounded-lg font-medium transition ${!selectedStrategies[currentScenario]
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-orange-500 hover:bg-orange-600 text-white'
                      }`}
                  >
                    Next Scenario
                  </button>
                ) : (
                  <button
                    onClick={handleFinish}
                    disabled={!selectedStrategies[currentScenario]}
                    className={`px-6 py-3 rounded-lg font-medium transition ${!selectedStrategies[currentScenario]
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-green-500 hover:bg-green-600 text-white'
                      }`}
                  >
                    Get Results
                  </button>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      ) : (
        /* Results Screen */
        <motion.div
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="text-center mb-8">
              <TrendingDown className="w-16 h-16 mx-auto text-green-500 mb-4" />
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Debt Analysis Complete!</h2>
              <p className="text-xl text-gray-600">
                You scored {score} out of {scenarios.length} scenarios correctly
              </p>

              {/* Save Status Indicator */}
              {isSaving && (
                <div className="mt-4 text-blue-600 flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span>Saving your progress...</span>
                </div>
              )}

              {!isSaving && saveResult && (
                <div className={`mt-4 p-3 rounded-lg ${saveResult.passed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                  {saveResult.passed ? (
                    <>
                      <div className="font-semibold flex items-center justify-center gap-2">
                        <CheckCircle className="w-5 h-5" />
                        Module Completed! 🎉
                      </div>
                      <div className="text-sm mt-1">Your progress has been saved</div>
                    </>
                  ) : (
                    <>
                      <div className="font-semibold">Progress Saved</div>
                      <div className="text-sm mt-1">You need 100% to pass. Try again!</div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Detailed Results */}
            <div className="space-y-6 mb-8">
              {scenarios.map((scenario, index) => {
                const selectedStrategy = selectedStrategies[index];
                const strategy = scenario.strategies.find(s => s.id === selectedStrategy);
                const isCorrect = strategy && strategy.correct;

                return (
                  <div key={scenario.id} className={`p-6 rounded-lg border-2 ${isCorrect ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'
                    }`}>
                    <div className="flex items-start gap-3 mb-3">
                      {isCorrect ? (
                        <CheckCircle className="w-6 h-6 text-green-500 mt-1" />
                      ) : (
                        <AlertCircle className="w-6 h-6 text-red-500 mt-1" />
                      )}
                      <div>
                        <h3 className="text-lg font-bold text-gray-800">{scenario.title}</h3>
                        <p className="text-sm text-gray-600 mb-2">Your choice: {strategy?.name}</p>
                        <p className={`text-sm font-medium ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                          {strategy?.explanation}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-4 justify-center">
              <button
                onClick={() => navigate('/game')}
                className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition"
              >
                Back to Roadmap
              </button>
              <button
                onClick={resetModule}
                className="px-6 py-3 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-xl font-medium transition"
              >
                Try Again
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default DebtManagementModule;