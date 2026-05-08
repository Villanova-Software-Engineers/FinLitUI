import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useModuleScore, MODULES } from '../hooks/useModuleScore';
import ModuleCompletedScreen from './ModuleCompletedScreen';
import { shuffleQuizOptions } from '../utils/shuffleQuizOptions';

// 10 Quiz Questions with explanations
const quizQuestions = [
  {
    question: "What is the primary purpose of accounting?",
    options: ["To predict the stock market", "To record, summarize, and communicate financial information", "To manage a company's employees", "To set product prices"],
    correctIndex: 1,
    explanation: "Accounting is the system of recording, summarizing, and communicating financial information. It helps businesses track their money and make informed decisions."
  },
  {
    question: "Who first formalized the double-entry bookkeeping system?",
    options: ["Leonardo da Vinci", "Adam Smith", "Luca Pacioli", "Benjamin Franklin"],
    correctIndex: 2,
    explanation: "Luca Pacioli, an Italian mathematician, formalized the double-entry bookkeeping system in 1494. This system is still used by every business today."
  },
  {
    question: "Financial accounting is primarily for:",
    options: ["Internal managers making daily decisions", "External parties like investors and banks", "Marketing and sales teams", "Human resources departments"],
    correctIndex: 1,
    explanation: "Financial accounting creates reports for external stakeholders - investors, banks, and regulators. It provides transparency about the company's financial health."
  },
  {
    question: "In double-entry bookkeeping, every transaction must:",
    options: ["Only affect one account", "Have equal debits and credits", "Always increase total assets", "Be approved by a manager"],
    correctIndex: 1,
    explanation: "The golden rule of double-entry bookkeeping: every transaction must have equal debits and credits. This ensures the books always balance."
  },
  {
    question: "Accounting has been practiced for approximately how long?",
    options: ["500 years", "2,000 years", "7,000 years", "100 years"],
    correctIndex: 2,
    explanation: "Accounting dates back over 7,000 years! Ancient Mesopotamians recorded transactions on clay tablets. The core logic has remained remarkably consistent."
  },
  {
    question: "What is managerial accounting used for?",
    options: ["Only for tax filing purposes", "Internal reports for managers to make decisions", "Reporting to the government", "Setting employee salaries exclusively"],
    correctIndex: 1,
    explanation: "Managerial accounting provides internal reports that help managers and executives make day-to-day business decisions and plan for the future."
  },
  {
    question: "Which of these companies uses accounting to track profitability across products?",
    options: ["Only small local businesses", "Apple tracks which products are most profitable", "Companies don't use accounting for this", "Only manufacturing companies"],
    correctIndex: 1,
    explanation: "Companies like Apple use accounting to track revenue across all their products and countries to understand which products are most profitable."
  },
  {
    question: "Debits are recorded on which side of an account?",
    options: ["Right side", "Left side", "Top side", "Bottom side"],
    correctIndex: 1,
    explanation: "Debits are always recorded on the left side of an account, while credits are recorded on the right side. This is a fundamental convention in double-entry bookkeeping."
  },
  {
    question: "What happens to an expense account when you record an expense?",
    options: ["It is credited", "It is debited", "It stays the same", "It is deleted"],
    correctIndex: 1,
    explanation: "Expense accounts increase with debits. When you record an expense (like paying rent or salaries), you debit the expense account."
  },
  {
    question: "Revenue accounts increase with:",
    options: ["Debits", "Credits", "Either debits or credits", "Neither"],
    correctIndex: 1,
    explanation: "Revenue accounts increase with credits. When a business earns revenue from sales or services, the revenue account is credited."
  }
];

// Page 1: What is Accounting
const IntroPage = ({ handleNext }: { handleNext: () => void }) => (
  <div className="max-w-5xl mx-auto pt-16">
    <motion.div className="text-center mb-12" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
      <h1 className="text-5xl font-bold mb-4 text-gray-800">📋 What is Accounting?</h1>
      <p className="text-xl text-gray-600">The language of business — tracking, understanding, and communicating financial information</p>
    </motion.div>

    <div className="space-y-6 mb-12">
      <motion.div className="p-8 rounded-3xl shadow-xl bg-white" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
        <p className="text-gray-700 text-lg leading-relaxed mb-6">
          Every business — from a lemonade stand to Apple — needs to track its money. Accounting is the system that makes that possible.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: "📋", title: "Recording", desc: "Writing down every financial transaction that happens", color: "bg-purple-50" },
            { icon: "📊", title: "Summarizing", desc: "Organizing those records into meaningful reports", color: "bg-green-50" },
            { icon: "🔍", title: "Analyzing", desc: "Using those reports to make smart decisions", color: "bg-blue-50" },
            { icon: "📣", title: "Communicating", desc: "Sharing financial info with owners, banks, investors", color: "bg-yellow-50" }
          ].map((item, idx) => (
            <motion.div
              key={idx}
              className={`${item.color} border border-gray-200 rounded-2xl p-5`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + idx * 0.1 }}
            >
              <div className="text-4xl mb-3">{item.icon}</div>
              <h3 className="font-bold text-gray-800 mb-2">{item.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div className="bg-gradient-to-r from-purple-50 to-blue-50 border-l-4 border-purple-500 p-6 rounded-2xl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
        <p className="text-purple-900 text-lg">
          💡 <span className="font-bold">Think of accounting as the "scoreboard" of business.</span> It tells you exactly how the game is going — are you winning (profitable) or losing (in debt)?
        </p>
      </motion.div>

      <motion.div className="p-8 rounded-3xl shadow-xl bg-white" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
        <h3 className="text-2xl font-bold text-gray-800 mb-4">A Brief History</h3>
        <p className="text-gray-700 text-lg leading-relaxed">
          Accounting dates back over <span className="font-bold text-purple-600">7,000 years</span> — ancient Mesopotamians recorded grain and livestock transactions on clay tablets. The double-entry system we use today was formalized in 1494 by Italian mathematician Luca Pacioli — and the core logic hasn't changed since.
        </p>
      </motion.div>
    </div>

    <div className="flex justify-center pb-12">
      <button onClick={handleNext} className="px-10 py-4 rounded-2xl bg-purple-500 text-white font-bold text-lg shadow-xl hover:bg-purple-600 transition">
        Continue to Why It Matters →
      </button>
    </div>
  </div>
);

// Page 2: Why It Matters
const WhyItMattersPage = ({ handlePrev, handleNext }: { handlePrev: () => void; handleNext: () => void }) => (
  <div className="max-w-4xl mx-auto pt-16">
    <motion.h2 className="text-4xl font-bold mb-4 text-center text-gray-800" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      Why Does Accounting Matter?
    </motion.h2>
    <p className="text-center text-gray-600 mb-8 text-lg">Without accounting, running a business is like driving blindfolded</p>

    <div className="grid md:grid-cols-2 gap-4 mb-8">
      {[
        { title: "Business owners", desc: "Know if they're making or losing money. Decide whether to hire, expand, or cut costs.", color: "text-purple-600" },
        { title: "Investors", desc: "Decide whether a company is worth putting money into based on financial health.", color: "text-green-600" },
        { title: "Banks", desc: "Decide whether to approve a business loan based on its accounting records.", color: "text-blue-600" },
        { title: "Government", desc: "Collect the right amount of taxes. Ensure companies follow financial laws.", color: "text-yellow-700" }
      ].map((item, idx) => (
        <motion.div
          key={idx}
          className="bg-white border border-gray-200 rounded-2xl p-6 shadow-md hover:shadow-lg transition"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
        >
          <h4 className={`font-bold text-xl mb-2 ${item.color}`}>{item.title}</h4>
          <p className="text-gray-600 leading-relaxed">{item.desc}</p>
        </motion.div>
      ))}
    </div>

    <div className="border-t border-gray-200 my-8"></div>

    <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">The Two Branches of Accounting</h3>
    <div className="grid md:grid-cols-2 gap-6 mb-8">
      <motion.div
        className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 rounded-2xl p-6"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <h4 className="font-bold text-xl text-purple-800 mb-3">Financial Accounting</h4>
        <p className="text-gray-700 leading-relaxed">Reports for external parties — investors, banks, regulators. Think annual reports and tax filings.</p>
      </motion.div>

      <motion.div
        className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-2xl p-6"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <h4 className="font-bold text-xl text-green-800 mb-3">Managerial Accounting</h4>
        <p className="text-gray-700 leading-relaxed">Reports for internal use — managers and executives to guide day-to-day decisions.</p>
      </motion.div>
    </div>

    <div className="flex justify-center gap-4 pb-12">
      <button onClick={handlePrev} className="px-8 py-4 rounded-2xl border-2 border-purple-400 bg-white text-purple-600 font-semibold text-lg shadow-lg hover:bg-purple-50">
        ← Back
      </button>
      <button onClick={handleNext} className="px-8 py-4 rounded-2xl bg-purple-500 text-white font-semibold text-lg shadow-lg hover:bg-purple-600">
        Next →
      </button>
    </div>
  </div>
);

// Page 3: Real World Applications
const RealWorldPage = ({ handlePrev, handleNext }: { handlePrev: () => void; handleNext: () => void }) => (
  <div className="max-w-5xl mx-auto pt-16">
    <motion.h2 className="text-4xl font-bold mb-4 text-center text-gray-800" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      Accounting in the Real World
    </motion.h2>
    <p className="text-center text-gray-600 mb-8 text-lg">Every company you know uses accounting daily</p>

    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
      {[
        { company: "Apple", use: "Tracks $60B+ in quarterly revenue across 175 countries. Accounting tells them which products are most profitable.", tag: "Revenue tracking", tagColor: "bg-purple-100 text-purple-700" },
        { company: "Nike", use: "Manages factories across 40 countries. Accounting tracks the cost to make each shoe vs. what it sells for.", tag: "Cost management", tagColor: "bg-green-100 text-green-700" },
        { company: "Your local cafe", use: "Records daily sales, ingredient costs, rent, and wages to know if the business is actually making money.", tag: "Daily operations", tagColor: "bg-yellow-100 text-yellow-700" },
        { company: "Tesla", use: "Uses accounting to show investors exactly how much cash it burns building new factories — justifying billions in funding.", tag: "Investor relations", tagColor: "bg-blue-100 text-blue-700" },
        { company: "A startup", use: "Shows a VC firm clean financial records to prove the business is real and raise a $2M seed round.", tag: "Fundraising", tagColor: "bg-red-100 text-red-700" },
        { company: "You (eventually)", use: "Whether you run a side hustle or manage a Fortune 500, accounting is how you know you're building real wealth.", tag: "Personal finance", tagColor: "bg-purple-100 text-purple-700" }
      ].map((item, idx) => (
        <motion.div
          key={idx}
          className="bg-white border border-gray-200 rounded-2xl p-5 shadow-md hover:shadow-lg transition"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
        >
          <h4 className="font-bold text-lg text-gray-800 mb-2">{item.company}</h4>
          <p className="text-gray-600 text-sm leading-relaxed mb-3">{item.use}</p>
          <span className={`inline-block text-xs font-medium px-3 py-1 rounded-full ${item.tagColor}`}>{item.tag}</span>
        </motion.div>
      ))}
    </div>

    <div className="flex justify-center gap-4 pb-12">
      <button onClick={handlePrev} className="px-8 py-4 rounded-2xl border-2 border-purple-400 bg-white text-purple-600 font-semibold text-lg shadow-lg hover:bg-purple-50">
        ← Back
      </button>
      <button onClick={handleNext} className="px-8 py-4 rounded-2xl bg-purple-500 text-white font-semibold text-lg shadow-lg hover:bg-purple-600">
        Next →
      </button>
    </div>
  </div>
);


// Page 3: Debits & Credits
const DebitsCreditsPage = ({ handlePrev, handleNext }: { handlePrev: () => void; handleNext: () => void }) => (
  <div className="max-w-4xl mx-auto pt-16">
    <motion.h2 className="text-4xl font-bold mb-4 text-center text-gray-800" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      Debits vs Credits
    </motion.h2>
    <p className="text-center text-gray-600 mb-8 text-lg">The foundation of double-entry bookkeeping — invented in 1494 and still used today</p>

    <div className="grid md:grid-cols-2 gap-6 mb-8">
      <motion.div
        className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <h3 className="text-xl font-bold text-purple-900 mb-3">Debit (Dr)</h3>
        <p className="text-gray-700 leading-relaxed">Left side of an account. Increases assets and expenses. Decreases liabilities and equity.</p>
      </motion.div>

      <motion.div
        className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <h3 className="text-xl font-bold text-green-900 mb-3">Credit (Cr)</h3>
        <p className="text-gray-700 leading-relaxed">Right side of an account. Increases liabilities and equity. Decreases assets and expenses.</p>
      </motion.div>
    </div>

    <h3 className="text-xl font-bold text-gray-800 mb-4">Worked Example: Buying $500 of office supplies with cash</h3>
    <div className="bg-white border-2 border-gray-200 rounded-2xl overflow-hidden mb-8">
      <div className="grid grid-cols-3 gap-4 bg-gray-100 p-4 font-semibold text-gray-700">
        <div>Account</div>
        <div className="text-purple-700">Debit</div>
        <div className="text-green-700">Credit</div>
      </div>
      <div className="grid grid-cols-3 gap-4 p-4 border-t border-gray-200">
        <div className="text-gray-800">Office supplies (asset ↑)</div>
        <div className="text-purple-700 font-bold">$500</div>
        <div className="text-gray-400">—</div>
      </div>
      <div className="grid grid-cols-3 gap-4 p-4 border-t border-gray-200">
        <div className="text-gray-800">Cash (asset ↓)</div>
        <div className="text-gray-400">—</div>
        <div className="text-green-700 font-bold">$500</div>
      </div>
    </div>

    <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-l-4 border-purple-500 p-6 rounded-2xl mb-8">
      <p className="text-purple-900">
        <span className="font-bold">The golden rule:</span> every transaction must have equal debits and credits. If they don't balance, something's wrong.
      </p>
    </div>

    <div className="flex justify-center gap-4 pb-12">
      <button onClick={handlePrev} className="px-8 py-4 rounded-2xl border-2 border-purple-400 bg-white text-purple-600 font-semibold text-lg shadow-lg hover:bg-purple-50">
        ← Back
      </button>
      <button onClick={handleNext} className="px-8 py-4 rounded-2xl bg-purple-500 text-white font-semibold text-lg shadow-lg hover:bg-purple-600">
        Next: Debit/Credit Game →
      </button>
    </div>
  </div>
);

// Debit or Credit Game (one-by-one)
interface DebitCreditGameProps {
  handlePrev: () => void;
  handleNext: () => void;
}

const DebitCreditGame = ({ handlePrev, handleNext: handleNextPage }: DebitCreditGameProps) => {
  const transactions = [
    { text: 'Buy office supplies with cash — Office Supplies account', answer: 'debit', explanation: 'Office supplies is an asset account that increased, so we DEBIT it. (Assets increase with debits)' },
    { text: 'Receive cash from a customer', answer: 'debit', explanation: 'Cash is an asset that increased when received, so we DEBIT cash. (Assets increase with debits)' },
    { text: 'Pay back part of a bank loan', answer: 'debit', explanation: 'We DEBIT the loan (liability) to decrease it. (Liabilities decrease with debits)' },
    { text: 'Earn revenue from a sale', answer: 'credit', explanation: 'Revenue accounts increase with CREDITS. Earning revenue increases income, so we credit it.' },
    { text: 'Buy equipment on credit (increase liability)', answer: 'credit', explanation: 'The liability (accounts payable) increases, so we CREDIT it. (Liabilities increase with credits)' },
    { text: 'Record an expense (wages paid)', answer: 'debit', explanation: 'Expense accounts increase with DEBITS. When recording wages expense, we debit the expense account.' },
    { text: 'Owner invests cash into the business (equity up)', answer: 'credit', explanation: 'Equity increases with CREDITS. Owner investment increases equity, so we credit it.' },
    { text: 'Cash decreases when paying rent', answer: 'credit', explanation: 'Cash (an asset) decreases, so we CREDIT cash. (Assets decrease with credits)' },
    { text: 'Inventory increases when you buy stock', answer: 'debit', explanation: 'Inventory is an asset that increased, so we DEBIT it. (Assets increase with debits)' },
    { text: 'Accounts payable increases (owe supplier)', answer: 'credit', explanation: 'Accounts payable is a liability that increased, so we CREDIT it. (Liabilities increase with credits)' }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<'debit' | 'credit' | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [answers, setAnswers] = useState<('debit' | 'credit')[]>([]);
  const [gameCompleted, setGameCompleted] = useState(false);

  const handleAnswer = (answer: 'debit' | 'credit') => {
    setSelectedAnswer(answer);
    setShowResult(true);
  };

  const handleNextQuestion = () => {
    if (selectedAnswer) {
      setAnswers([...answers, selectedAnswer]);
    }

    if (currentIndex < transactions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setGameCompleted(true);
    }
  };

  const score = gameCompleted
    ? answers.filter((ans, idx) => ans === transactions[idx].answer).length
    : 0;

  const currentTransaction = transactions[currentIndex];
  const isCorrect = selectedAnswer === currentTransaction.answer;

  return (
    <div className="max-w-4xl mx-auto pt-16">
      <motion.h2 className="text-4xl font-bold mb-4 text-center text-gray-800" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        🎯 Debit or Credit Challenge
      </motion.h2>

      {!gameCompleted ? (
        <>
          <div className="flex justify-center mb-6">
            <div className="bg-white/80 backdrop-blur-md px-6 py-2 rounded-full shadow-sm border border-gray-200">
              <span className="text-gray-600 font-semibold text-sm">
                Question {currentIndex + 1} of {transactions.length}
              </span>
            </div>
          </div>

          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white border-2 border-gray-200 rounded-3xl p-8 mb-6"
          >
            <p className="text-2xl text-gray-800 font-semibold mb-8 text-center leading-relaxed">
              {currentTransaction.text}
            </p>

            <div className="flex gap-4 mb-6">
              <button
                onClick={() => handleAnswer('debit')}
                disabled={showResult}
                className={`flex-1 px-8 py-6 border-2 rounded-2xl font-bold text-xl transition-all ${
                  showResult && selectedAnswer === 'debit'
                    ? isCorrect
                      ? 'bg-green-500 text-white border-green-600 shadow-lg'
                      : 'bg-red-500 text-white border-red-600'
                    : showResult && currentTransaction.answer === 'debit'
                      ? 'bg-green-100 text-green-800 border-green-400'
                      : selectedAnswer === 'debit'
                        ? 'bg-purple-500 text-white border-purple-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-purple-400 hover:shadow-md'
                }`}
              >
                Debit
              </button>
              <button
                onClick={() => handleAnswer('credit')}
                disabled={showResult}
                className={`flex-1 px-8 py-6 border-2 rounded-2xl font-bold text-xl transition-all ${
                  showResult && selectedAnswer === 'credit'
                    ? isCorrect
                      ? 'bg-green-500 text-white border-green-600 shadow-lg'
                      : 'bg-red-500 text-white border-red-600'
                    : showResult && currentTransaction.answer === 'credit'
                      ? 'bg-green-100 text-green-800 border-green-400'
                      : selectedAnswer === 'credit'
                        ? 'bg-purple-500 text-white border-purple-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-purple-400 hover:shadow-md'
                }`}
              >
                Credit
              </button>
            </div>

            {showResult && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`${isCorrect ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'} border-2 rounded-2xl p-6`}
              >
                <div className="flex items-start gap-4 mb-3">
                  <span className={`text-3xl ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                    {isCorrect ? '✓' : '✗'}
                  </span>
                  <div>
                    <p className={`font-bold text-lg ${isCorrect ? 'text-green-900' : 'text-red-900'}`}>
                      {isCorrect ? 'Correct!' : `Incorrect — The answer is ${currentTransaction.answer}`}
                    </p>
                    <p className={`text-sm mt-2 ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                      {currentTransaction.explanation}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleNextQuestion}
                  className="w-full mt-4 px-6 py-3 bg-gray-800 text-white rounded-xl font-semibold hover:bg-gray-900 transition"
                >
                  {currentIndex < transactions.length - 1 ? 'Next Question →' : 'See Results'}
                </button>
              </motion.div>
            )}
          </motion.div>

          {/* Progress dots */}
          <div className="flex justify-center gap-2 mb-8">
            {transactions.map((_, idx) => (
              <div
                key={idx}
                className={`w-3 h-3 rounded-full transition-all ${
                  idx < currentIndex
                    ? answers[idx] === transactions[idx].answer
                      ? 'bg-green-500'
                      : 'bg-red-500'
                    : idx === currentIndex
                      ? 'bg-purple-500 w-8'
                      : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </>
      ) : (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white border-2 border-gray-200 rounded-3xl p-12 text-center mb-6"
        >
          <div className={`w-32 h-32 mx-auto rounded-full flex items-center justify-center mb-6 ${score >= 8 ? 'bg-green-500' : 'bg-purple-500'}`}>
            <span className="text-6xl">{score >= 8 ? '🏆' : '📚'}</span>
          </div>
          <div className="text-6xl font-black text-purple-600 mb-3">{score}/10</div>
          <p className="text-2xl text-gray-700 mb-6">
            {score === 10 ? '🎉 Perfect! Debit/Credit Master!' : score >= 8 ? '🎉 Excellent work!' : score >= 6 ? '👍 Good job!' : '📚 Keep practicing!'}
          </p>
          <div className="inline-block bg-purple-100 text-purple-800 px-8 py-3 rounded-full font-bold text-lg mb-8">
            {score >= 8 ? '+300 XP' : score >= 5 ? '+200 XP' : '+100 XP'}
          </div>

          {/* Summary */}
          <div className="text-left bg-gray-50 rounded-2xl p-6 mt-8">
            <h3 className="font-bold text-lg text-gray-800 mb-4">📊 Your Results</h3>
            <div className="space-y-2">
              {transactions.map((t, idx) => {
                const userAnswer = answers[idx];
                const correct = userAnswer === t.answer;
                return (
                  <div key={idx} className={`flex items-center gap-3 p-3 rounded-lg ${correct ? 'bg-green-100' : 'bg-red-100'}`}>
                    <span className={`text-xl ${correct ? 'text-green-600' : 'text-red-600'}`}>
                      {correct ? '✓' : '✗'}
                    </span>
                    <span className="text-sm text-gray-700 flex-1">Q{idx + 1}</span>
                    <span className={`text-sm font-semibold ${correct ? 'text-green-800' : 'text-red-800'}`}>
                      {userAnswer}
                      {!correct && ` → ${t.answer}`}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}

      <div className="flex justify-center gap-4 pb-12">
        <button onClick={handlePrev} className="px-8 py-4 rounded-2xl border-2 border-purple-400 bg-white text-purple-600 font-semibold text-lg shadow-lg hover:bg-purple-50">
          ← Back
        </button>
        {gameCompleted && (
          <button onClick={handleNextPage} className="px-8 py-4 rounded-2xl bg-purple-500 text-white font-semibold text-lg shadow-lg hover:bg-purple-600">
            Take the Quiz →
          </button>
        )}
      </div>
    </div>
  );
};

// Quiz Page (similar to WhatIsMoneyModule)
interface QuizPageProps {
  currentQuestion: number;
  selectedAnswer: number | null;
  showAnswerResult: boolean;
  score: number;
  handleAnswerSelect: (index: number) => void;
  handleNextQuestion: () => void;
  handlePrev: () => void;
  quizCompleted: boolean;
  resetQuiz: () => void;
  navigate: any;
  shuffledQuestions: typeof quizQuestions;
}

const QuizPage = ({
  currentQuestion,
  selectedAnswer,
  showAnswerResult,
  score,
  handleAnswerSelect,
  handleNextQuestion,
  handlePrev,
  quizCompleted,
  resetQuiz,
  navigate,
  shuffledQuestions
}: QuizPageProps) => (
  <div className="max-w-4xl mx-auto pt-16">
    {!quizCompleted ? (
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden flex flex-col min-h-[500px]">
        <div className="flex-1 p-8 lg:p-16 flex flex-col justify-center">
          <div className="flex justify-between items-end mb-8 border-b border-gray-100 pb-6">
            <div>
              <span className="text-sm font-bold text-purple-600 uppercase tracking-wider block mb-2">
                Question {currentQuestion + 1} of {shuffledQuestions.length}
              </span>
              <h2 className="text-2xl lg:text-4xl font-bold text-slate-900 leading-tight">
                {shuffledQuestions[currentQuestion].question}
              </h2>
            </div>
            <div className="hidden lg:block text-slate-300">
              <span className="text-5xl">📋</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {shuffledQuestions[currentQuestion].options.map((option, idx) => {
              const isSelected = selectedAnswer === idx;
              const isCorrect = idx === shuffledQuestions[currentQuestion].correctIndex;
              const showCorrectness = showAnswerResult && (isSelected || isCorrect);

              return (
                <button
                  key={idx}
                  onClick={() => handleAnswerSelect(idx)}
                  disabled={showAnswerResult}
                  className={`p-6 lg:p-8 rounded-2xl text-left border-2 transition-all flex items-start gap-4 ${
                    showCorrectness
                      ? isCorrect
                        ? 'bg-green-50 border-green-500 text-green-900'
                        : isSelected
                        ? 'bg-red-50 border-red-500 text-red-900'
                        : 'bg-white border-slate-100 opacity-50'
                      : isSelected
                      ? 'bg-purple-50 border-purple-600 shadow-lg scale-[1.02]'
                      : 'bg-white border-slate-200 hover:border-purple-400 hover:shadow-md'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                      showCorrectness && isCorrect
                        ? 'bg-green-500 text-white'
                        : showCorrectness && isSelected
                        ? 'bg-red-500 text-white'
                        : isSelected
                        ? 'bg-purple-600 text-white'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {String.fromCharCode(65 + idx)}
                  </div>
                  <span className="text-lg font-medium leading-snug flex-1">{option}</span>
                  {showCorrectness && isCorrect && <span className="ml-auto text-green-600 shrink-0 text-2xl">✓</span>}
                  {showCorrectness && isSelected && !isCorrect && <span className="ml-auto text-red-600 shrink-0 text-2xl">✗</span>}
                </button>
              );
            })}
          </div>

          {showAnswerResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 bg-slate-900 text-white p-8 rounded-3xl flex flex-col md:flex-row items-center gap-8 shadow-2xl"
            >
              <div className="flex-1">
                <h4 className="font-bold text-purple-400 uppercase tracking-wider text-sm mb-2">Explanation</h4>
                <p className="text-lg leading-relaxed text-slate-200">
                  {shuffledQuestions[currentQuestion].explanation}
                </p>
              </div>
              <button
                onClick={handleNextQuestion}
                className="w-full md:w-auto px-8 py-4 bg-white text-slate-900 rounded-xl font-bold hover:bg-purple-50 transition-colors whitespace-nowrap"
              >
                {currentQuestion < shuffledQuestions.length - 1 ? 'Next Question' : 'Complete Quiz'}
              </button>
            </motion.div>
          )}
        </div>
      </div>
    ) : (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-3xl shadow-xl p-12 text-center border border-gray-100"
      >
        <div
          className={`w-32 h-32 mx-auto rounded-full flex items-center justify-center mb-8 shadow-2xl ${
            score >= 8 ? 'bg-green-500' : 'bg-amber-500'
          }`}
        >
          <span className="text-6xl">{score >= 8 ? '🏆' : '📚'}</span>
        </div>

        <h2 className="text-5xl font-black text-slate-900 mb-4">
          {score >= 8 ? 'Outstanding!' : 'Keep Learning!'}
        </h2>
        <p className="text-2xl text-slate-500 mb-10">
          You scored <span className="font-bold text-slate-900">{score}/{shuffledQuestions.length}</span> (
          {((score / shuffledQuestions.length) * 100).toFixed(0)}%)
        </p>

        {score >= 8 ? (
          <div className="bg-green-50 border-2 border-green-500 rounded-2xl p-8 mb-10">
            <p className="text-green-800 font-bold text-xl mb-2">🎊 Congratulations! You passed!</p>
            <p className="text-green-700 text-lg">You've mastered the What is Accounting module</p>
          </div>
        ) : (
          <div className="bg-amber-50 border-2 border-amber-500 rounded-2xl p-8 mb-10">
            <p className="text-amber-800 font-bold text-xl mb-2">You need 80% to pass (8/10 correct)</p>
            <p className="text-amber-700 text-lg">Review the material and try again - you're getting there!</p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={resetQuiz}
            className="px-8 py-4 rounded-xl bg-slate-900 text-white hover:bg-slate-800 font-bold text-lg transition-all shadow-lg"
          >
            Retake Quiz
          </button>
          <button
            onClick={() => navigate('/game')}
            className="px-8 py-4 rounded-xl border-2 border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-lg transition-all"
          >
            Back to Roadmap
          </button>
        </div>
      </motion.div>
    )}
  </div>
);

// Main Component
const AccountingModule = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isReviewMode, setIsReviewMode] = useState(false);
  const { saveScore, isModulePassed } = useModuleScore();

  // Quiz state
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showAnswerResult, setShowAnswerResult] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [shuffleKey, setShuffleKey] = useState(0);

  // Shuffle quiz options for randomization
  const shuffledQuestions = useMemo(() => shuffleQuizOptions(quizQuestions), [shuffleKey]);

  const modulePassed = isModulePassed(MODULES.ACCOUNTING.id);
  const totalSteps = 6; // 0:intro, 1:why-it-matters, 2:real-world, 3:debits-credits, 4:game, 5:quiz

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
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

  const handleAnswerSelect = (index: number) => {
    if (showAnswerResult) return;
    setSelectedAnswer(index);
    setShowAnswerResult(true);
  };

  const handleNextQuestion = () => {
    const newAnswers = [...answers, selectedAnswer];
    setAnswers(newAnswers);

    if (currentQuestion < shuffledQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowAnswerResult(false);
    } else {
      let finalScore = 0;
      newAnswers.forEach((answer, idx) => {
        if (answer === shuffledQuestions[idx].correctIndex) {
          finalScore++;
        }
      });
      setScore(finalScore);
      setQuizCompleted(true);

      const percentage = (finalScore / shuffledQuestions.length) * 100;
      // Save score for all attempts (both pass and fail)
      saveScore(MODULES.ACCOUNTING.id, percentage);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setScore(0);
    setShowAnswerResult(false);
    setQuizCompleted(false);
    setAnswers([]);
    setShuffleKey(prev => prev + 1);
  };

  if (modulePassed && !isReviewMode) {
    return (
      <ModuleCompletedScreen
        emoji="📋"
        moduleName="What is Accounting"
        description="You've already passed the What is Accounting module. Great job understanding the fundamentals!"
        gradientClasses="from-purple-50 via-blue-100 to-green-200"
        onReviewClick={() => setIsReviewMode(true)}
      />
    );
  }

  return (
    <div className="min-h-screen relative overflow-x-hidden" style={{ background: 'linear-gradient(120deg, #f3e7f9 0%, #e9f5f2 50%, #e8f0fd 100%)' }}>
      <button
        className="absolute top-4 left-4 px-4 py-2 rounded-lg text-purple-600 hover:bg-white/50 backdrop-blur-sm font-medium transition z-50 shadow-sm border border-purple-100"
        onClick={() => navigate('/game')}
      >
        ← Back to Roadmap
      </button>

      <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-50">
        <div className="bg-white/80 backdrop-blur-md px-4 py-1.5 rounded-full shadow-sm border border-gray-100 text-gray-600 font-semibold text-sm">
          Step {currentStep + 1} of {totalSteps}
        </div>
      </div>

      {(currentStep > 0 && (currentStep < totalSteps - 1 || (currentStep === totalSteps - 1 && currentQuestion === 0 && !showAnswerResult && !quizCompleted))) && (
        <button
          onClick={handlePrev}
          className="fixed left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-purple-500 text-white rounded-full shadow-lg hover:bg-purple-600 transition flex items-center justify-center z-40"
          aria-label="Previous"
        >
          ←
        </button>
      )}
      {currentStep < totalSteps - 1 && (
        <button
          onClick={handleNext}
          className="fixed right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-purple-500 text-white rounded-full shadow-lg hover:bg-purple-600 transition flex items-center justify-center z-40"
          aria-label="Next"
        >
          →
        </button>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="w-full"
        >
          {currentStep === 0 && <IntroPage handleNext={handleNext} />}
          {currentStep === 1 && <WhyItMattersPage handlePrev={handlePrev} handleNext={handleNext} />}
          {currentStep === 2 && <RealWorldPage handlePrev={handlePrev} handleNext={handleNext} />}
          {currentStep === 3 && <DebitsCreditsPage handlePrev={handlePrev} handleNext={handleNext} />}
          {currentStep === 4 && <DebitCreditGame handlePrev={handlePrev} handleNext={handleNext} />}
          {currentStep === 5 && (
            <QuizPage
              currentQuestion={currentQuestion}
              selectedAnswer={selectedAnswer}
              showAnswerResult={showAnswerResult}
              score={score}
              handleAnswerSelect={handleAnswerSelect}
              handleNextQuestion={handleNextQuestion}
              handlePrev={handlePrev}
              quizCompleted={quizCompleted}
              resetQuiz={resetQuiz}
              navigate={navigate}
              shuffledQuestions={shuffledQuestions}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default AccountingModule;
