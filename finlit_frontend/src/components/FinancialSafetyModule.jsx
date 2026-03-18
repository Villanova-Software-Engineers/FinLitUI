import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useModuleScore, MODULES } from '../hooks/useModuleScore';
import ModuleCompletedScreen from './ModuleCompletedScreen';

// Quiz questions
const quizQuestions = [
  {
    question: "Which is a major red flag in a phishing email?",
    options: [
      "The company logo looks correct",
      "Urgent language demanding immediate action",
      "The email is from a company you use",
      "It was sent during business hours"
    ],
    correctIndex: 1,
    explanation: "Urgent language creating panic is a key phishing tactic. Scammers want you to act before you think."
  },
  {
    question: "The IRS contacts people about tax issues primarily through:",
    options: ["Phone calls demanding immediate payment", "Text messages with payment links", "US postal mail", "Social media messages"],
    correctIndex: 2,
    explanation: "The IRS primarily contacts people through US postal mail. They never call demanding immediate payment or threaten arrest."
  },
  {
    question: "What should you do if you receive a suspicious call claiming to be your bank?",
    options: [
      "Provide info to verify it's you",
      "Hang up and call the number on your card/statement",
      "Ask them to prove they're from the bank",
      "Give limited information only"
    ],
    correctIndex: 1,
    explanation: "Always hang up and call the official number on your card or statement. Scammers can spoof caller IDs."
  },
  {
    question: "Why should you use credit cards instead of debit cards for online shopping?",
    options: ["Credit cards earn more rewards", "Better fraud protection - not your direct money", "Debit cards don't work online", "Credit cards are free to use"],
    correctIndex: 1,
    explanation: "Credit cards offer better fraud protection. If compromised, it's the bank's money at risk while they investigate."
  },
  {
    question: "What is two-factor authentication (2FA)?",
    options: ["Using two different passwords", "A second verification step beyond password", "Having two email accounts", "Logging in from two devices"],
    correctIndex: 1,
    explanation: "2FA requires a second verification beyond your password. Even if hackers get your password, they can't get in without it."
  },
  {
    question: "How often can you get a free credit report from each major bureau?",
    options: ["Once per month", "Once per year from AnnualCreditReport.com", "Only when you apply for credit", "You have to pay for credit reports"],
    correctIndex: 1,
    explanation: "You can get one free report annually from each bureau at AnnualCreditReport.com - that's 3 free reports per year!"
  },
  {
    question: "Which is a sign of a secure website for entering payment info?",
    options: ["The site loads quickly", "https:// and a lock icon in the address bar", "The site has a professional design", "The site offers great deals"],
    correctIndex: 1,
    explanation: "HTTPS and the lock icon indicate an encrypted, secure connection. Never enter payment info without these."
  },
  {
    question: "What's the safest action if you think you've been scammed?",
    options: ["Wait to see if it was really a scam", "Feel embarrassed and don't tell anyone", "Contact your bank and report to FTC immediately", "Try to get the money back yourself"],
    correctIndex: 2,
    explanation: "Act immediately! Contact your bank to freeze accounts/cards, report to FTC at ReportFraud.ftc.gov."
  },
  {
    question: "Why shouldn't you use public WiFi for banking?",
    options: ["It's too slow", "Hackers can intercept your data on unsecured networks", "Banks block public WiFi", "Public WiFi uses more battery"],
    correctIndex: 1,
    explanation: "Public WiFi is often unsecured, allowing hackers to potentially intercept your data."
  },
  {
    question: "A 'credit freeze' helps protect you by:",
    options: ["Stopping all your credit cards from working", "Preventing new accounts from being opened in your name", "Lowering your interest rates", "Hiding your credit score"],
    correctIndex: 1,
    explanation: "A credit freeze prevents lenders from accessing your credit report, stopping identity thieves from opening new accounts."
  }
];

// Scam scenarios for the game
const scamScenarios = [
  {
    title: "The Urgent Email",
    scenario: "You receive an email: 'URGENT: Your Amazon account will be suspended in 24 hours! Click here to verify your payment information immediately.'",
    isScam: true,
    explanation: "This is a classic phishing scam! Red flags: Creates urgency, asks you to click a link, requests payment info.",
    redFlags: ["Urgency tactics", "Link to verify info", "Generic threat"]
  },
  {
    title: "The IRS Call",
    scenario: "You get a phone call: 'This is Officer Johnson from the IRS. You owe $5,000 in back taxes. Pay immediately with gift cards or a warrant will be issued.'",
    isScam: true,
    explanation: "100% scam! The IRS NEVER calls demanding immediate payment, never threatens arrest over phone, and NEVER accepts gift cards.",
    redFlags: ["Government threatening arrest", "Demands gift cards", "Immediate payment"]
  },
  {
    title: "Bank Alert",
    scenario: "Your bank app sends a notification about a $500 charge at a store you didn't visit, asking you to verify or report fraud.",
    isScam: false,
    explanation: "This is likely legitimate fraud protection. Banks do send real-time alerts for unusual activity. Verify by opening the app directly.",
    tips: ["Open app directly, don't click links", "Call bank using card number", "Check transaction history"]
  },
  {
    title: "The Prize Winner",
    scenario: "You receive a text: 'Congratulations! You've won $500,000 in the International Lottery! To claim your prize, pay the $500 processing fee.'",
    isScam: true,
    explanation: "Classic lottery scam! You can't win a lottery you didn't enter. Legitimate lotteries never require fees to claim.",
    redFlags: ["Won something you didn't enter", "Fee required to claim", "Unknown lottery"]
  },
  {
    title: "Password Reset",
    scenario: "You just tried to reset your password on a website. Minutes later, you receive an email with a reset link from that exact site.",
    isScam: false,
    explanation: "This is likely legitimate since you initiated it. Always check the sender email carefully and that the link goes to the real site.",
    tips: ["You initiated it", "Check sender address", "Verify link destination"]
  },
  {
    title: "The Tech Support",
    scenario: "Your computer shows a popup: 'VIRUS DETECTED! Your computer is infected! Call Microsoft Support immediately at 1-800-XXX-XXXX.'",
    isScam: true,
    explanation: "Tech support scam! Microsoft never shows popups with phone numbers. These scammers want remote access to your computer.",
    redFlags: ["Popup with phone number", "Urgent virus warning", "Request to call"]
  }
];

// Intro Page
const IntroPage = ({ onNext }) => {
  return (
    <div className="min-h-screen p-6 pt-20 bg-gradient-to-br from-red-50 via-orange-50 to-amber-50">
      <div className="max-w-4xl mx-auto">
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-red-500 to-orange-600 shadow-2xl mb-6 text-white">
            <span className="text-5xl">🛡️</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-3">Financial Safety</h1>
          <p className="text-xl text-gray-600">Protect yourself from scams and fraud</p>
        </motion.div>

        {/* The Problem */}
        <motion.div
          className="bg-white rounded-3xl p-8 shadow-xl mb-8 border border-gray-100"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Why This Matters</h2>

          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div className="p-4">
              <div className="text-4xl font-bold text-red-600 mb-2">$10B+</div>
              <p className="text-gray-600">Lost to fraud annually in the US</p>
            </div>
            <div className="p-4">
              <div className="text-4xl font-bold text-orange-600 mb-2">1 in 3</div>
              <p className="text-gray-600">Americans targeted by scams yearly</p>
            </div>
            <div className="p-4">
              <div className="text-4xl font-bold text-amber-600 mb-2">90%</div>
              <p className="text-gray-600">Of scams rely on emotional manipulation</p>
            </div>
          </div>
        </motion.div>

        {/* Key Concepts */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <motion.div
            className="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-red-500"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="font-bold text-lg text-gray-800 mb-2">Scammers Use Urgency</h3>
            <p className="text-gray-600">They create panic so you act before thinking. "Act NOW or lose your account!" is almost always a scam.</p>
          </motion.div>

          <motion.div
            className="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-orange-500"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h3 className="font-bold text-lg text-gray-800 mb-2">Anyone Can Be Targeted</h3>
            <p className="text-gray-600">Scammers don't discriminate. They target everyone - young, old, tech-savvy or not.</p>
          </motion.div>
        </div>

        {/* What You'll Learn */}
        <motion.div
          className="bg-white rounded-2xl p-6 border-2 border-orange-200 mb-8 shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className="font-bold text-lg mb-4 text-gray-800">What You'll Learn</h3>
          <div className="grid md:grid-cols-2 gap-3 text-sm">
            {["Spotting phishing emails & texts", "Recognizing phone scams", "Protecting your identity", "Safe online banking practices", "When to trust & when to verify", "What to do if scammed"].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-gray-700">
                <span className="text-orange-500">✓</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <div className="flex justify-center">
          <motion.button
            onClick={onNext}
            className="px-10 py-4 rounded-2xl bg-gradient-to-r from-red-500 to-orange-600 text-white font-bold text-lg shadow-xl hover:shadow-2xl transition-all"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Learn to Spot Scams
          </motion.button>
        </div>
      </div>
    </div>
  );
};

// Red Flags Page
const RedFlagsPage = ({ onNext, onPrev }) => {
  const [selectedFlag, setSelectedFlag] = useState(null);

  const redFlags = [
    { title: "Urgency & Pressure", description: "\"Act NOW!\" \"Limited time!\" \"Your account will be closed!\" - Legitimate companies give you time to decide.", color: "red" },
    { title: "Requests for Payment Info", description: "No real company asks you to verify payment details via email or text. They already have your info.", color: "orange" },
    { title: "Gift Cards as Payment", description: "No legitimate business, government agency, or bank will EVER ask for payment via gift cards. Ever.", color: "amber" },
    { title: "Too Good to Be True", description: "\"You won $1 million!\" \"Free iPhone!\" If it sounds too good to be true, it is.", color: "yellow" },
    { title: "Threats & Fear", description: "\"You'll be arrested!\" \"Your computer is infected!\" Scare tactics are a scammer's favorite tool.", color: "rose" },
    { title: "Unusual Sender/Number", description: "Check email addresses and phone numbers carefully. Scammers use lookalikes (amaz0n.com, micr0soft).", color: "pink" }
  ];

  return (
    <div className="min-h-screen p-6 pt-20 bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      <div className="max-w-4xl mx-auto">
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">Red Flags to Watch For</h1>
          <p className="text-gray-600">Tap each card to learn more</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-4 mb-8">
          {redFlags.map((flag, idx) => (
            <motion.div
              key={idx}
              className={`bg-white p-5 rounded-xl shadow-lg cursor-pointer transition-all border-l-4 border-${flag.color}-500 ${selectedFlag === idx ? 'ring-2 ring-orange-400' : ''}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => setSelectedFlag(selectedFlag === idx ? null : idx)}
            >
              <h3 className="font-bold text-gray-800 mb-2">{flag.title}</h3>
              <AnimatePresence>
                {selectedFlag === idx && (
                  <motion.p
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="text-gray-600 text-sm"
                  >
                    {flag.description}
                  </motion.p>
                )}
              </AnimatePresence>
              {selectedFlag !== idx && (
                <p className="text-gray-400 text-sm">Tap to learn more</p>
              )}
            </motion.div>
          ))}
        </div>

        {/* The Golden Rule */}
        <motion.div
          className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-6 text-white mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h3 className="font-bold text-lg mb-2">The Golden Rule</h3>
          <p className="text-amber-50">
            When in doubt, don't click, don't call, don't pay. Instead: hang up and call the company directly using a number from their official website or your statement.
          </p>
        </motion.div>

        <div className="flex justify-center gap-4">
          <button onClick={onPrev} className="px-8 py-4 rounded-xl bg-white text-gray-700 font-semibold shadow-lg border border-gray-200 hover:bg-gray-50">
            Back
          </button>
          <button onClick={onNext} className="px-8 py-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold shadow-lg hover:shadow-xl">
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

// Protection Tips Page
const ProtectionPage = ({ onNext, onPrev }) => {
  const [activeCategory, setActiveCategory] = useState('passwords');

  const categories = {
    passwords: {
      title: "Password Security",
      tips: [
        "Use unique passwords for every account",
        "Use a password manager (LastPass, 1Password, Bitwarden)",
        "Enable two-factor authentication (2FA) everywhere",
        "Never share passwords - even with family"
      ]
    },
    online: {
      title: "Online Safety",
      tips: [
        "Look for HTTPS and lock icon before entering payment info",
        "Don't bank or shop on public WiFi",
        "Use credit cards (not debit) for online purchases",
        "Be careful what you share on social media"
      ]
    },
    monitoring: {
      title: "Monitor Your Accounts",
      tips: [
        "Check your credit report free at AnnualCreditReport.com",
        "Set up transaction alerts on your bank accounts",
        "Review statements monthly for unauthorized charges",
        "Consider a credit freeze if not applying for credit"
      ]
    }
  };

  return (
    <div className="min-h-screen p-6 pt-20 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <div className="max-w-4xl mx-auto">
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">Protect Yourself</h1>
          <p className="text-gray-600">Simple habits that make a big difference</p>
        </motion.div>

        {/* Category Tabs */}
        <div className="flex justify-center gap-2 mb-8">
          {Object.entries(categories).map(([key, cat]) => (
            <button
              key={key}
              onClick={() => setActiveCategory(key)}
              className={`px-5 py-3 rounded-xl font-semibold transition-all ${
                activeCategory === key
                  ? 'bg-emerald-500 text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {cat.title}
            </button>
          ))}
        </div>

        {/* Tips Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            className="bg-white rounded-2xl p-8 shadow-xl mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <h3 className="font-bold text-xl text-gray-800 mb-6">{categories[activeCategory].title}</h3>
            <div className="space-y-4">
              {categories[activeCategory].tips.map((tip, idx) => (
                <motion.div
                  key={idx}
                  className="flex items-start gap-4 p-4 bg-emerald-50 rounded-xl"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold flex-shrink-0">
                    {idx + 1}
                  </div>
                  <p className="text-gray-700">{tip}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Quick Action */}
        <motion.div
          className="bg-gradient-to-r from-red-100 to-orange-100 rounded-2xl p-6 border-2 border-red-300 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h3 className="font-bold text-lg mb-2 text-red-800">If You Think You've Been Scammed</h3>
          <p className="text-red-700 text-sm mb-3">Act immediately:</p>
          <ol className="text-red-700 text-sm space-y-1 list-decimal list-inside">
            <li>Contact your bank to freeze accounts/cards</li>
            <li>Change passwords on affected accounts</li>
            <li>Report to FTC at ReportFraud.ftc.gov</li>
            <li>File a police report</li>
          </ol>
        </motion.div>

        <div className="flex justify-center gap-4">
          <button onClick={onPrev} className="px-8 py-4 rounded-xl bg-white text-gray-700 font-semibold shadow-lg border border-gray-200 hover:bg-gray-50">
            Back
          </button>
          <button onClick={onNext} className="px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold shadow-lg hover:shadow-xl">
            Test Your Skills
          </button>
        </div>
      </div>
    </div>
  );
};

// Scam Detection Game
const ScamGame = ({ onNext }) => {
  const [currentScenario, setCurrentScenario] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);

  const handleAnswer = (isScamAnswer) => {
    const correct = isScamAnswer === scamScenarios[currentScenario].isScam;
    if (correct) setScore(score + 1);
    setSelectedAnswer(isScamAnswer);
    setShowFeedback(true);
  };

  const nextScenario = () => {
    setShowFeedback(false);
    setSelectedAnswer(null);
    if (currentScenario < scamScenarios.length - 1) {
      setCurrentScenario(currentScenario + 1);
    } else {
      setGameComplete(true);
    }
  };

  if (gameComplete) {
    const percentage = Math.round((score / scamScenarios.length) * 100);
    return (
      <div className="min-h-screen p-6 pt-20 flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50">
        <motion.div
          className="bg-white rounded-3xl shadow-2xl p-10 text-center max-w-md w-full"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-6 text-5xl ${percentage >= 80 ? 'bg-green-500' : 'bg-amber-500'}`}>
            {percentage >= 80 ? '🛡️' : '📚'}
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-3">Challenge Complete!</h2>
          <p className="text-xl text-gray-600 mb-6">
            You identified <span className="font-bold text-orange-600">{score}/{scamScenarios.length}</span> correctly ({percentage}%)
          </p>

          <div className={`p-4 rounded-xl mb-6 ${percentage >= 80 ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
            {percentage >= 80
              ? "Excellent! You can spot scams like a pro!"
              : "Keep learning! Scam detection improves with practice."}
          </div>

          <button onClick={onNext} className="w-full py-4 rounded-xl bg-gradient-to-r from-red-500 to-orange-600 text-white font-bold text-lg shadow-lg">
            Continue to Quiz
          </button>
        </motion.div>
      </div>
    );
  }

  const scenario = scamScenarios[currentScenario];

  return (
    <div className="min-h-screen p-6 pt-20 bg-gradient-to-br from-orange-50 via-amber-50 to-red-50">
      <div className="max-w-3xl mx-auto">
        <motion.div
          className="text-center mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Spot the Scam</h1>
          <p className="text-gray-600">Can you tell what's real and what's fake?</p>
          <div className="flex justify-center gap-2 mt-4">
            {scamScenarios.map((_, idx) => (
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

        <AnimatePresence mode="wait">
          <motion.div
            key={currentScenario}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
          >
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-6 shadow-xl">
              <div className="bg-gradient-to-r from-orange-100 to-red-100 p-6 border-b border-orange-200">
                <h3 className="text-xl font-bold text-gray-800 mb-4">{scenario.title}</h3>
                <div className="bg-white p-4 rounded-lg border border-orange-200 shadow-sm">
                  <p className="text-gray-700 italic">"{scenario.scenario}"</p>
                </div>
              </div>

              <div className="p-6">
                {!showFeedback ? (
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => handleAnswer(true)}
                      className="p-6 rounded-xl bg-red-50 border-2 border-red-300 hover:border-red-500 hover:bg-red-100 transition-all text-red-700 font-semibold"
                    >
                      <div className="text-3xl mb-2">🚫</div>
                      This is a SCAM
                    </button>
                    <button
                      onClick={() => handleAnswer(false)}
                      className="p-6 rounded-xl bg-green-50 border-2 border-green-300 hover:border-green-500 hover:bg-green-100 transition-all text-green-700 font-semibold"
                    >
                      <div className="text-3xl mb-2">✅</div>
                      This is LEGITIMATE
                    </button>
                  </div>
                ) : (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <div className={`p-5 rounded-xl mb-4 ${
                      selectedAnswer === scenario.isScam ? 'bg-green-50 border-2 border-green-400' : 'bg-red-50 border-2 border-red-400'
                    }`}>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">{selectedAnswer === scenario.isScam ? '✅' : '❌'}</span>
                        <span className={`font-bold ${selectedAnswer === scenario.isScam ? 'text-green-800' : 'text-red-800'}`}>
                          {selectedAnswer === scenario.isScam ? 'Correct!' : 'Not quite!'}
                        </span>
                      </div>
                      <p className="text-gray-700 mb-4">{scenario.explanation}</p>

                      {scenario.redFlags && (
                        <div className="bg-red-100 p-3 rounded-lg border border-red-200">
                          <p className="font-semibold text-red-700 mb-2">Red Flags:</p>
                          <ul className="space-y-1">
                            {scenario.redFlags.map((flag, idx) => (
                              <li key={idx} className="flex items-center gap-2 text-red-600 text-sm">
                                <span>🚩</span> {flag}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {scenario.tips && (
                        <div className="bg-green-100 p-3 rounded-lg border border-green-200">
                          <p className="font-semibold text-green-700 mb-2">Why it's likely real:</p>
                          <ul className="space-y-1">
                            {scenario.tips.map((tip, idx) => (
                              <li key={idx} className="flex items-center gap-2 text-green-600 text-sm">
                                <span>✓</span> {tip}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={nextScenario}
                      className="w-full py-4 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold shadow-lg"
                    >
                      {currentScenario < scamScenarios.length - 1 ? 'Next Scenario' : 'See Results'}
                    </button>
                  </motion.div>
                )}
              </div>
            </div>

            <div className="text-center">
              <span className="px-4 py-2 bg-white border border-orange-300 text-orange-700 rounded-full text-sm font-medium shadow-sm">
                Score: {score} / {currentScenario + (showFeedback ? 1 : 0)}
              </span>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

// Quiz Page
const QuizPage = ({ currentQuestion, selectedAnswer, showAnswer, score, onAnswer, onNext, quizComplete, onRetake, navigate }) => {
  if (quizComplete) {
    const passed = score >= 8;
    return (
      <div className="min-h-screen p-6 pt-20 flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-100">
        <motion.div
          className="bg-white rounded-3xl shadow-2xl p-10 text-center max-w-md w-full"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <div className={`w-28 h-28 mx-auto rounded-full flex items-center justify-center mb-6 shadow-xl text-5xl ${passed ? 'bg-gradient-to-br from-green-400 to-emerald-500' : 'bg-gradient-to-br from-amber-400 to-orange-500'}`}>
            {passed ? '🛡️' : '📚'}
          </div>

          <h2 className="text-3xl font-bold text-gray-800 mb-3">{passed ? 'Well Protected!' : 'Keep Learning!'}</h2>
          <p className="text-xl text-gray-600 mb-6">
            You scored <span className="font-bold text-orange-600">{score}/{quizQuestions.length}</span> ({(score/quizQuestions.length*100).toFixed(0)}%)
          </p>

          {passed ? (
            <div className="bg-green-50 border-2 border-green-400 rounded-xl p-5 mb-6">
              <p className="text-green-800 font-bold">Congratulations! You passed!</p>
              <p className="text-green-700 text-sm">You know how to stay safe from scams!</p>
            </div>
          ) : (
            <div className="bg-amber-50 border-2 border-amber-400 rounded-xl p-5 mb-6">
              <p className="text-amber-800 font-bold">You need 80% to pass</p>
              <p className="text-amber-700 text-sm">Review the material and try again!</p>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <button onClick={onRetake} className="w-full py-4 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold hover:shadow-lg transition-shadow">
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
    <div className="min-h-screen p-6 pt-20 bg-gradient-to-br from-red-50 to-orange-100">
      <div className="max-w-3xl mx-auto">
        {/* Progress */}
        <div className="flex justify-center gap-1.5 mb-6">
          {quizQuestions.map((_, idx) => (
            <div
              key={idx}
              className={`h-2 rounded-full transition-all ${
                idx < currentQuestion ? 'w-8 bg-orange-500' :
                idx === currentQuestion ? 'w-8 bg-orange-400' : 'w-2 bg-gray-300'
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
              <span className="text-sm font-bold text-orange-600 uppercase tracking-wider">
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
                          ? 'bg-orange-50 border-orange-500 scale-[1.01]'
                          : 'border-gray-200 hover:border-orange-400 hover:bg-orange-50'
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold flex-shrink-0 ${
                      showCorrectness && isCorrect ? 'bg-green-500 text-white' :
                      showCorrectness && isSelected ? 'bg-red-500 text-white' :
                      isSelected ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-500'
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
                className="mt-6 bg-orange-50 border-2 border-orange-200 p-6 rounded-xl"
              >
                <h4 className="font-bold text-orange-600 uppercase tracking-wider text-sm mb-2">Explanation</h4>
                <p className="text-gray-700 mb-4">{q.explanation}</p>
                <button onClick={onNext} className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-bold hover:shadow-lg transition-shadow">
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
const FinancialSafetyModule = () => {
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

  const modulePassed = isModulePassed(MODULES.FINANCIAL_SAFETY?.id);
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
        saveScore(MODULES.FINANCIAL_SAFETY.id, (finalScore / quizQuestions.length) * 100);
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
        emoji="🛡️"
        moduleName="Financial Safety"
        description="You know how to protect yourself from scams and fraud!"
        gradientClasses="from-red-50 via-orange-100 to-amber-200"
        onReviewClick={() => setIsReviewMode(true)}
      />
    );
  }

  return (
    <div className="min-h-screen relative">
      <button
        className="fixed top-4 left-4 px-4 py-2 rounded-lg text-orange-700 hover:bg-white/80 backdrop-blur-sm font-medium transition z-50 shadow-sm border border-orange-200 bg-white/70"
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
          {currentStep === 1 && <RedFlagsPage onNext={handleNext} onPrev={handlePrev} />}
          {currentStep === 2 && <ProtectionPage onNext={handleNext} onPrev={handlePrev} />}
          {currentStep === 3 && <ScamGame onNext={handleNext} />}
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

export default FinancialSafetyModule;
