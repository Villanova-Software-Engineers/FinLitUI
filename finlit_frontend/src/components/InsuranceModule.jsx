import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Shield, Trophy, RotateCcw, CheckCircle, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const InsuranceModule = () => {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState('playing');
  const [draggedItem, setDraggedItem] = useState(null);
  const [assignments, setAssignments] = useState({});
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);

  const insuranceTypes = [
    { id: 1, name: "Health Insurance", color: "bg-red-100 border-red-300" },
    { id: 2, name: "Auto Insurance", color: "bg-blue-100 border-blue-300" },
    { id: 3, name: "Life Insurance", color: "bg-purple-100 border-purple-300" },
    { id: 4, name: "Home Insurance", color: "bg-green-100 border-green-300" },
    { id: 5, name: "Travel Insurance", color: "bg-yellow-100 border-yellow-300" }
  ];

  const scenarios = [
    {
      id: 'scenario1',
      text: "Your car was damaged in a hailstorm while parked",
      correctInsurance: 2, // Auto Insurance
      explanation: "Auto insurance covers damage to your vehicle from weather events like hailstorms."
    },
    {
      id: 'scenario2',
      text: "You need surgery and hospital care",
      correctInsurance: 1, // Health Insurance
      explanation: "Health insurance covers medical expenses including surgeries and hospital stays."
    },
    {
      id: 'scenario3',
      text: "A tree falls on your house during a storm",
      correctInsurance: 4, // Home Insurance
      explanation: "Home insurance covers structural damage to your house from natural disasters."
    },
    {
      id: 'scenario4',
      text: "You want to provide financial security for your family after your death",
      correctInsurance: 3, // Life Insurance
      explanation: "Life insurance provides financial support to your beneficiaries after your death."
    },
    {
      id: 'scenario5',
      text: "Your flight is cancelled and you need to pay extra hotel costs",
      correctInsurance: 5, // Travel Insurance
      explanation: "Travel insurance covers unexpected expenses like accommodation due to flight delays or cancellations."
    },
    {
      id: 'scenario6',
      text: "You're in a car accident and hurt a pedestrian",
      correctInsurance: 2, // Auto Insurance
      explanation: "Auto insurance includes liability coverage for injuries you cause to others."
    },
    {
      id: 'scenario7',
      text: "Your prescription medications are very expensive",
      correctInsurance: 1, // Health Insurance
      explanation: "Health insurance often includes prescription drug coverage to reduce medication costs."
    },
    {
      id: 'scenario8',
      text: "A burglar steals valuables from your home",
      correctInsurance: 4, // Home Insurance
      explanation: "Home insurance covers theft of personal property from your home."
    },
    {
      id: 'scenario9',
      text: "You get sick while traveling abroad",
      correctInsurance: 5, // Travel Insurance
      explanation: "Travel insurance covers medical emergencies and evacuation while traveling internationally."
    },
    {
      id: 'scenario10',
      text: "Your income needs to replace your spouse's salary after they pass away",
      correctInsurance: 3, // Life Insurance
      explanation: "Life insurance replaces lost income and helps families maintain their standard of living."
    }
  ];

  const handleDragStart = (e, insurance) => {
    setDraggedItem(insurance);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, scenario) => {
    e.preventDefault();
    if (!draggedItem) return;

    setAttempts(attempts + 1);

    const isCorrect = draggedItem.id === scenario.correctInsurance;
    
    setAssignments({
      ...assignments,
      [scenario.id]: {
        insuranceId: draggedItem.id,
        insuranceName: draggedItem.name,
        correct: isCorrect
      }
    });

    if (isCorrect) {
      setScore(score + 1);
    }

    setDraggedItem(null);

    // Check if all scenarios are completed
    const newAssignments = {...assignments, [scenario.id]: { insuranceId: draggedItem.id, correct: isCorrect }};
    if (Object.keys(newAssignments).length === scenarios.length) {
      setTimeout(() => setGameState('completed'), 1000);
    }
  };

  const resetGame = () => {
    setAssignments({});
    setScore(0);
    setAttempts(0);
    setGameState('playing');
    setDraggedItem(null);
  };

  const getAccuracy = () => {
    return attempts > 0 ? Math.round((score / attempts) * 100) : 0;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-purple-50 p-6">
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
          <h1 className="text-2xl font-bold text-gray-800">Insurance Protection</h1>
          <p className="text-sm text-gray-600">Match Insurance Types to Scenarios</p>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={resetGame}
            className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition"
            title="Reset Game"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 text-green-600">
            <Shield className="w-5 h-5" />
            <span className="font-semibold">90 XP</span>
          </div>
        </div>
      </motion.div>

      {gameState === 'playing' ? (
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
                <div className="text-2xl font-bold text-blue-600">{Object.keys(assignments).length}</div>
                <div className="text-sm text-gray-600">Scenarios Completed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">{getAccuracy()}%</div>
                <div className="text-sm text-gray-600">Accuracy</div>
              </div>
            </div>
          </motion.div>

          {/* Instructions */}
          <motion.div
            className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-4 mb-8 border border-blue-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="text-center">
              <h3 className="font-bold text-gray-800 mb-2">How to Play</h3>
              <p className="text-sm text-gray-600">
                Drag the insurance types to the scenarios where they would apply. 
                Match all 10 scenarios to complete the module!
              </p>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Insurance Types */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Insurance Types</h3>
              <div className="space-y-4">
                {insuranceTypes.map((insurance) => (
                  <motion.div
                    key={insurance.id}
                    className={`p-4 rounded-lg border-2 cursor-move transition-all ${insurance.color} hover:shadow-md hover:scale-[1.02]`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, insurance)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center gap-3">
                      <Shield className="w-6 h-6 text-gray-600" />
                      <span className="font-semibold text-gray-800">{insurance.name}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Scenarios */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Scenarios</h3>
              <div className="space-y-3">
                {scenarios.map((scenario) => {
                  const assignment = assignments[scenario.id];
                  return (
                    <motion.div
                      key={scenario.id}
                      className={`p-4 rounded-lg border-2 border-dashed min-h-[80px] transition-all ${
                        assignment
                          ? assignment.correct 
                            ? 'bg-green-50 border-green-400'
                            : 'bg-red-50 border-red-400'
                          : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
                      }`}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, scenario)}
                    >
                      <div>
                        <p className="text-gray-700 text-sm leading-relaxed mb-2">
                          {scenario.text}
                        </p>
                        
                        {assignment && (
                          <motion.div
                            className="flex items-center justify-between"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3 }}
                          >
                            <div className="flex items-center gap-2">
                              {assignment.correct ? (
                                <CheckCircle className="w-5 h-5 text-green-500" />
                              ) : (
                                <XCircle className="w-5 h-5 text-red-500" />
                              )}
                              <span className={`text-sm font-medium ${
                                assignment.correct ? 'text-green-700' : 'text-red-700'
                              }`}>
                                {assignment.insuranceName}
                              </span>
                            </div>
                            
                            {assignment.correct && (
                              <button
                                onClick={() => {
                                  const modal = document.createElement('div');
                                  modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
                                  modal.innerHTML = `
                                    <div class="bg-white rounded-xl p-6 max-w-md w-full">
                                      <h3 class="text-lg font-bold text-gray-800 mb-2">Why This is Correct</h3>
                                      <p class="text-gray-600 mb-4">${scenario.explanation}</p>
                                      <button onclick="this.closest('.fixed').remove()" class="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition">
                                        Got it!
                                      </button>
                                    </div>
                                  `;
                                  document.body.appendChild(modal);
                                }}
                                className="text-xs text-blue-600 hover:text-blue-800 underline"
                              >
                                Why?
                              </button>
                            )}
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
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
              <span>{Object.keys(assignments).length}/{scenarios.length} scenarios</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <motion.div
                className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(Object.keys(assignments).length / scenarios.length) * 100}%` }}
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
            
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Great Job! 🎉</h2>
            <p className="text-xl text-gray-600 mb-6">
              You've mastered insurance risk management!
            </p>

            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-600">{score}</div>
                <div className="text-sm text-gray-600">Correct Matches</div>
              </div>
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-600">{scenarios.length}</div>
                <div className="text-sm text-gray-600">Scenarios Completed</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-purple-600">{getAccuracy()}%</div>
                <div className="text-sm text-gray-600">Accuracy Rate</div>
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

export default InsuranceModule;