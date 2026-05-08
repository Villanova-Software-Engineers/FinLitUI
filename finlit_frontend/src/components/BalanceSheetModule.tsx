import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useModuleScore, MODULES } from '../hooks/useModuleScore';
import ModuleCompletedScreen from './ModuleCompletedScreen';
import { shuffleQuizOptions } from '../utils/shuffleQuizOptions';

// 10 Quiz Questions with explanations
const quizQuestions = [
  {
    question: "What does a balance sheet show?",
    options: ["Revenue over a year", "Cash movements", "Financial position at a single point in time", "Employee headcount"],
    correctIndex: 2,
    explanation: "A balance sheet is a snapshot of a company's financial position at a specific moment in time - like taking a photo of what you own and owe on December 31st."
  },
  {
    question: "Which is a current asset?",
    options: ["Factory building", "10-year patent", "Accounts receivable", "Long-term investment"],
    correctIndex: 2,
    explanation: "Accounts receivable (money customers owe you) is a current asset because it will typically be collected within a year. Current assets are expected to be converted to cash within 12 months."
  },
  {
    question: "Current ratio formula?",
    options: ["Total assets / total liabilities", "Current assets / current liabilities", "Equity / total assets", "Revenue / expenses"],
    correctIndex: 1,
    explanation: "Current ratio = Current Assets ÷ Current Liabilities. It measures a company's ability to pay short-term obligations. A ratio above 1.0 means you have more current assets than current liabilities."
  },
  {
    question: "Retained earnings are part of?",
    options: ["Liabilities", "Current assets", "Equity", "Non-current liabilities"],
    correctIndex: 2,
    explanation: "Retained earnings are part of equity. They represent the accumulated profits that have been kept (retained) in the business rather than paid out as dividends."
  },
  {
    question: "A company has $200K assets, $150K liabilities. Equity = ?",
    options: ["$350K", "$50K", "$150K", "$200K"],
    correctIndex: 1,
    explanation: "Using the accounting equation: Assets = Liabilities + Equity, we can solve for Equity: $200K = $150K + Equity, so Equity = $50K. The owner truly owns $50K after paying all debts."
  },
  {
    question: "Which is a non-current liability?",
    options: ["Accounts payable", "Short-term loan", "10-year mortgage", "Accrued wages"],
    correctIndex: 2,
    explanation: "A 10-year mortgage is a non-current (long-term) liability because it won't be fully paid off within one year. Non-current liabilities are due beyond 12 months."
  },
  {
    question: "What does negative equity mean?",
    options: ["The company is very profitable", "The company owes more than it owns", "Cash flow is strong", "Assets are undervalued"],
    correctIndex: 1,
    explanation: "Negative equity means liabilities exceed assets - the company owes more than it owns. This is a serious financial warning sign that the business is underwater."
  },
  {
    question: "Accounts receivable means?",
    options: ["Money the company owes suppliers", "Money owed TO the company by customers", "Cash in the bank", "Inventory on hand"],
    correctIndex: 1,
    explanation: "Accounts receivable is money that customers owe TO your company for products/services already delivered but not yet paid for. It's an asset - you expect to receive this cash."
  },
  {
    question: "Debt-to-equity ratio measures?",
    options: ["Profitability", "How much debt is used relative to equity", "Cash generation", "Asset efficiency"],
    correctIndex: 1,
    explanation: "Debt-to-equity ratio = Total Debt ÷ Total Equity. It shows how much the company relies on borrowed money versus owner investment. Higher ratios mean more financial leverage (and risk)."
  },
  {
    question: "Which statement is true about a balance sheet?",
    options: ["It covers a full fiscal year", "Assets = Liabilities − Equity", "It always balances", "It shows future projections"],
    correctIndex: 2,
    explanation: "The balance sheet ALWAYS balances because Assets = Liabilities + Equity. This fundamental equation must hold true - that's why it's called a 'balance' sheet!"
  }
];

// Page 1: What is a Balance Sheet
const IntroPage = ({ handleNext }: { handleNext: () => void }) => (
  <div className="max-w-5xl mx-auto pt-16">
    <motion.div className="text-center mb-12" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
      <h1 className="text-5xl font-bold mb-4 text-gray-800">⚖️ The Balance Sheet</h1>
      <p className="text-xl text-gray-600">A snapshot of financial position at a single point in time</p>
    </motion.div>

    <div className="space-y-6 mb-12">
      <motion.div className="p-8 rounded-3xl shadow-xl bg-white" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
        <div className="flex items-start gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-blue-500 flex items-center justify-center shadow-lg flex-shrink-0">
            <span className="text-3xl">📸</span>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">A Snapshot in Time</h3>
            <p className="text-gray-700 text-lg leading-relaxed">
              Unlike the income statement (which covers a period), a balance sheet shows your financial position at a <span className="font-bold text-blue-600">specific moment</span> — like taking a photograph on December 31st at midnight.
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6">
          <div className="flex flex-wrap items-center justify-center gap-4 text-center">
            <div className="flex flex-col">
              <span className="text-sm text-gray-600 mb-2">What you own</span>
              <div className="bg-blue-100 text-blue-800 font-bold text-2xl px-6 py-4 rounded-xl">Assets</div>
            </div>
            <span className="text-3xl font-bold text-gray-400">=</span>
            <div className="flex flex-col">
              <span className="text-sm text-gray-600 mb-2">What you owe</span>
              <div className="bg-red-100 text-red-800 font-bold text-2xl px-6 py-4 rounded-xl">Liabilities</div>
            </div>
            <span className="text-3xl font-bold text-gray-400">+</span>
            <div className="flex flex-col">
              <span className="text-sm text-gray-600 mb-2">What's truly yours</span>
              <div className="bg-green-100 text-green-800 font-bold text-2xl px-6 py-4 rounded-xl">Equity</div>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div className="p-8 rounded-3xl shadow-xl bg-white" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
        <h3 className="text-2xl font-bold text-gray-800 mb-4">Why It's Called a "Balance" Sheet</h3>
        <p className="text-gray-700 text-lg leading-relaxed mb-4">
          The name comes from the fundamental equation: <span className="font-bold">Assets = Liabilities + Equity</span>. The two sides must always <span className="font-bold text-blue-600">balance</span> — if they don't, something's wrong!
        </p>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
            <p className="font-semibold text-blue-900 mb-2">Left Side (What you control)</p>
            <p className="text-sm text-blue-800">All your assets: cash, inventory, buildings, equipment, patents</p>
          </div>
          <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
            <p className="font-semibold text-green-900 mb-2">Right Side (Who has claims)</p>
            <p className="text-sm text-green-800">Claims by creditors (liabilities) and owners (equity)</p>
          </div>
        </div>
      </motion.div>

      <motion.div className="bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-blue-500 p-6 rounded-2xl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
        <p className="text-blue-900 text-lg">
          💡 <span className="font-bold">Think of it like this:</span> If you buy a $300K house with a $250K mortgage, your assets are $300K, liabilities are $250K, and your equity (what you truly own) is $50K. The balance sheet shows this snapshot!
        </p>
      </motion.div>
    </div>

    <div className="flex justify-center pb-12">
      <button onClick={handleNext} className="px-10 py-4 rounded-2xl bg-blue-500 text-white font-bold text-lg shadow-xl hover:bg-blue-600 transition">
        Continue to Assets →
      </button>
    </div>
  </div>
);

// Page 2: Assets Deep Dive
const AssetsPage = ({ handlePrev, handleNext }: { handlePrev: () => void; handleNext: () => void }) => (
  <div className="max-w-5xl mx-auto pt-16">
    <motion.h2 className="text-4xl font-bold mb-4 text-center text-gray-800" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      Assets: What You Own
    </motion.h2>
    <p className="text-center text-gray-600 mb-8 text-lg">Resources controlled by the company that provide future economic benefit</p>

    <div className="space-y-6 mb-8">
      <motion.div className="bg-white border-2 border-blue-200 rounded-3xl p-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h3 className="text-2xl font-bold text-blue-800 mb-4">Current Assets (Short-term)</h3>
        <p className="text-gray-700 mb-6">Assets that will be converted to cash or used up within one year</p>

        <div className="grid md:grid-cols-3 gap-4">
          {[
            { icon: "💵", title: "Cash & Cash Equivalents", desc: "Money in bank accounts, money market funds — the most liquid asset", example: "$50,000 in checking account" },
            { icon: "📝", title: "Accounts Receivable", desc: "Money customers owe you for sales already made", example: "Customer owes $10,000, due in 30 days" },
            { icon: "📦", title: "Inventory", desc: "Products ready to sell or materials to make products", example: "$25,000 worth of shoes in warehouse" }
          ].map((item, idx) => (
            <motion.div
              key={idx}
              className="bg-blue-50 rounded-2xl p-5 border border-blue-200"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + idx * 0.1 }}
            >
              <div className="text-4xl mb-3">{item.icon}</div>
              <h4 className="font-bold text-gray-800 mb-2">{item.title}</h4>
              <p className="text-sm text-gray-600 mb-3 leading-relaxed">{item.desc}</p>
              <div className="bg-white rounded-lg p-2 text-xs text-gray-700 italic">
                Ex: {item.example}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div className="bg-white border-2 border-purple-200 rounded-3xl p-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <h3 className="text-2xl font-bold text-purple-800 mb-4">Non-Current Assets (Long-term)</h3>
        <p className="text-gray-700 mb-6">Assets that provide value for more than one year</p>

        <div className="grid md:grid-cols-3 gap-4">
          {[
            { icon: "🏢", title: "Property & Equipment", desc: "Land, buildings, machinery, vehicles", example: "Factory building worth $500,000" },
            { icon: "⚙️", title: "Equipment", desc: "Tools, computers, production machines", example: "$100,000 in manufacturing equipment" },
            { icon: "💡", title: "Intangible Assets", desc: "Patents, trademarks, goodwill, brand value", example: "Patent worth $200,000" }
          ].map((item, idx) => (
            <motion.div
              key={idx}
              className="bg-purple-50 rounded-2xl p-5 border border-purple-200"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + idx * 0.1 }}
            >
              <div className="text-4xl mb-3">{item.icon}</div>
              <h4 className="font-bold text-gray-800 mb-2">{item.title}</h4>
              <p className="text-sm text-gray-600 mb-3 leading-relaxed">{item.desc}</p>
              <div className="bg-white rounded-lg p-2 text-xs text-gray-700 italic">
                Ex: {item.example}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div className="bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-blue-500 p-6 rounded-2xl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>
        <p className="text-blue-900">
          <span className="font-bold">Real Example - Apple:</span> Apple's largest current asset is cash ($48B+). Their largest non-current asset is property and equipment (stores, data centers, manufacturing). Together, these assets power the business!
        </p>
      </motion.div>
    </div>

    <div className="flex justify-center gap-4 pb-12">
      <button onClick={handlePrev} className="px-8 py-4 rounded-2xl border-2 border-blue-400 bg-white text-blue-600 font-semibold text-lg shadow-lg hover:bg-blue-50">
        ← Back
      </button>
      <button onClick={handleNext} className="px-8 py-4 rounded-2xl bg-blue-500 text-white font-semibold text-lg shadow-lg hover:bg-blue-600">
        Next →
      </button>
    </div>
  </div>
);

// Page 3: Liabilities Deep Dive
const LiabilitiesPage = ({ handlePrev, handleNext }: { handlePrev: () => void; handleNext: () => void }) => (
  <div className="max-w-5xl mx-auto pt-16">
    <motion.h2 className="text-4xl font-bold mb-4 text-center text-gray-800" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      Liabilities: What You Owe
    </motion.h2>
    <p className="text-center text-gray-600 mb-8 text-lg">Obligations the company must pay in the future</p>

    <div className="space-y-6 mb-8">
      <motion.div className="bg-white border-2 border-red-200 rounded-3xl p-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h3 className="text-2xl font-bold text-red-800 mb-4">Current Liabilities (Short-term)</h3>
        <p className="text-gray-700 mb-6">Debts that must be paid within one year</p>

        <div className="grid md:grid-cols-3 gap-4">
          {[
            { icon: "📋", title: "Accounts Payable", desc: "Money you owe suppliers for purchases made on credit", example: "Owe supplier $8,000, due in 45 days" },
            { icon: "💳", title: "Short-term Debt", desc: "Loans or credit lines due within 12 months", example: "$15,000 business loan due this year" },
            { icon: "💰", title: "Accrued Expenses", desc: "Costs incurred but not yet paid (wages, utilities)", example: "Owe employees $5,000 in wages" }
          ].map((item, idx) => (
            <motion.div
              key={idx}
              className="bg-red-50 rounded-2xl p-5 border border-red-200"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + idx * 0.1 }}
            >
              <div className="text-4xl mb-3">{item.icon}</div>
              <h4 className="font-bold text-gray-800 mb-2">{item.title}</h4>
              <p className="text-sm text-gray-600 mb-3 leading-relaxed">{item.desc}</p>
              <div className="bg-white rounded-lg p-2 text-xs text-gray-700 italic">
                Ex: {item.example}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div className="bg-white border-2 border-orange-200 rounded-3xl p-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <h3 className="text-2xl font-bold text-orange-800 mb-4">Non-Current Liabilities (Long-term)</h3>
        <p className="text-gray-700 mb-6">Debts that don't have to be paid for more than one year</p>

        <div className="grid md:grid-cols-3 gap-4">
          {[
            { icon: "🏠", title: "Mortgages", desc: "Long-term loans secured by property", example: "20-year mortgage: $400,000" },
            { icon: "📜", title: "Bonds Payable", desc: "Corporate bonds issued to raise capital", example: "$1M in bonds, mature in 10 years" },
            { icon: "⏳", title: "Long-term Loans", desc: "Business loans with multi-year repayment", example: "$250,000 loan, 5-year term" }
          ].map((item, idx) => (
            <motion.div
              key={idx}
              className="bg-orange-50 rounded-2xl p-5 border border-orange-200"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + idx * 0.1 }}
            >
              <div className="text-4xl mb-3">{item.icon}</div>
              <h4 className="font-bold text-gray-800 mb-2">{item.title}</h4>
              <p className="text-sm text-gray-600 mb-3 leading-relaxed">{item.desc}</p>
              <div className="bg-white rounded-lg p-2 text-xs text-gray-700 italic">
                Ex: {item.example}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div className="bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-500 p-6 rounded-2xl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>
        <p className="text-red-900">
          <span className="font-bold">Key Difference:</span> Current liabilities create immediate pressure on cash flow (you need money soon!). Long-term liabilities give you breathing room but often have interest costs. Managing both is crucial for financial health.
        </p>
      </motion.div>
    </div>

    <div className="flex justify-center gap-4 pb-12">
      <button onClick={handlePrev} className="px-8 py-4 rounded-2xl border-2 border-blue-400 bg-white text-blue-600 font-semibold text-lg shadow-lg hover:bg-blue-50">
        ← Back
      </button>
      <button onClick={handleNext} className="px-8 py-4 rounded-2xl bg-blue-500 text-white font-semibold text-lg shadow-lg hover:bg-blue-600">
        Next →
      </button>
    </div>
  </div>
);

// Page 4: Equity Section
const EquityPage = ({ handlePrev, handleNext }: { handlePrev: () => void; handleNext: () => void }) => (
  <div className="max-w-4xl mx-auto pt-16">
    <motion.h2 className="text-4xl font-bold mb-4 text-center text-gray-800" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      Equity: What's Truly Yours
    </motion.h2>
    <p className="text-center text-gray-600 mb-8 text-lg">The owner's residual claim after all liabilities are paid</p>

    <div className="space-y-6 mb-8">
      <motion.div className="bg-white border-2 border-green-200 rounded-3xl p-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h3 className="text-2xl font-bold text-green-800 mb-6">Components of Equity</h3>

        <div className="space-y-4">
          <div className="bg-green-50 border-l-4 border-green-500 rounded-xl p-6">
            <h4 className="font-bold text-lg text-green-900 mb-2">💵 Share Capital (Contributed Capital)</h4>
            <p className="text-gray-700 leading-relaxed">
              Money invested by owners/shareholders when they bought stock. If you start a business with $50,000 of your own money, that's share capital.
            </p>
            <p className="text-sm text-green-800 mt-2 italic">Example: Founder invests $100,000 → Share capital = $100,000</p>
          </div>

          <div className="bg-green-50 border-l-4 border-green-500 rounded-xl p-6">
            <h4 className="font-bold text-lg text-green-900 mb-2">📈 Retained Earnings</h4>
            <p className="text-gray-700 leading-relaxed">
              Accumulated profits kept in the business (not paid out as dividends). If you make $20K profit and keep it all, retained earnings increases by $20K.
            </p>
            <p className="text-sm text-green-800 mt-2 italic">Example: Earn $50,000 profit, pay $10,000 dividend → Retained earnings up $40,000</p>
          </div>
        </div>
      </motion.div>

      <motion.div className="bg-white border-2 border-gray-200 rounded-3xl p-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <h3 className="text-2xl font-bold text-gray-800 mb-4">The Equity Equation</h3>
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6 mb-6">
          <div className="flex flex-wrap items-center justify-center gap-4 text-center">
            <div className="bg-green-100 text-green-800 font-bold text-xl px-6 py-4 rounded-xl">Equity</div>
            <span className="text-2xl font-bold text-gray-400">=</span>
            <div className="bg-blue-100 text-blue-800 font-bold text-xl px-6 py-4 rounded-xl">Assets</div>
            <span className="text-2xl font-bold text-gray-400">−</span>
            <div className="bg-red-100 text-red-800 font-bold text-xl px-6 py-4 rounded-xl">Liabilities</div>
          </div>
        </div>
        <p className="text-gray-700 text-center">
          Equity is what's left over for owners after paying all debts. It's the true "net worth" of the business.
        </p>
      </motion.div>

      <motion.div className="bg-red-50 border-2 border-red-300 rounded-3xl p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <h3 className="text-xl font-bold text-red-900 mb-3">⚠️ What Does Negative Equity Mean?</h3>
        <p className="text-red-800 leading-relaxed mb-3">
          If liabilities exceed assets, equity becomes <span className="font-bold">negative</span>. This means the company owes more than it owns — it's financially underwater.
        </p>
        <div className="bg-white rounded-xl p-4 border-2 border-red-200">
          <p className="text-sm text-gray-800">
            <span className="font-bold">Example:</span> Assets = $100K, Liabilities = $150K → Equity = -$50K
          </p>
          <p className="text-sm text-red-700 mt-2">This is a major warning sign. The business might be heading toward bankruptcy.</p>
        </div>
      </motion.div>

      <motion.div className="bg-gradient-to-r from-green-50 to-blue-50 border-l-4 border-green-500 p-6 rounded-2xl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
        <p className="text-green-900">
          <span className="font-bold">Owner's Perspective:</span> Equity represents YOUR ownership stake. As profits grow and debts shrink, equity increases. Building equity is building wealth!
        </p>
      </motion.div>
    </div>

    <div className="flex justify-center gap-4 pb-12">
      <button onClick={handlePrev} className="px-8 py-4 rounded-2xl border-2 border-blue-400 bg-white text-blue-600 font-semibold text-lg shadow-lg hover:bg-blue-50">
        ← Back
      </button>
      <button onClick={handleNext} className="px-8 py-4 rounded-2xl bg-blue-500 text-white font-semibold text-lg shadow-lg hover:bg-blue-600">
        Next →
      </button>
    </div>
  </div>
);

// Page 5: Reading a Real Balance Sheet
const ReadingBalanceSheetPage = ({ handlePrev, handleNext }: { handlePrev: () => void; handleNext: () => void }) => (
  <div className="max-w-5xl mx-auto pt-16">
    <motion.h2 className="text-4xl font-bold mb-4 text-center text-gray-800" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      Reading a Real Balance Sheet
    </motion.h2>
    <p className="text-center text-gray-600 mb-8 text-lg">Let's analyze a simplified balance sheet and key financial ratios</p>

    <div className="space-y-6 mb-8">
      <motion.div className="bg-white border-2 border-gray-300 rounded-3xl overflow-hidden" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="bg-gray-800 text-white p-4 text-center">
          <h3 className="text-2xl font-bold">Tesla Inc. (Simplified)</h3>
          <p className="text-sm text-gray-300">As of December 31, 2023 (in millions)</p>
        </div>

        <div className="grid md:grid-cols-2 gap-0">
          {/* Assets */}
          <div className="bg-blue-50 p-6 border-r-2 border-gray-300">
            <h4 className="font-bold text-xl text-blue-900 mb-4">ASSETS</h4>
            <div className="space-y-3">
              <div>
                <p className="font-semibold text-blue-800 mb-2">Current Assets</p>
                <div className="space-y-1 text-sm ml-4">
                  <div className="flex justify-between"><span>Cash</span><span className="font-mono">$16,000</span></div>
                  <div className="flex justify-between"><span>Accounts Receivable</span><span className="font-mono">$3,000</span></div>
                  <div className="flex justify-between"><span>Inventory</span><span className="font-mono">$13,000</span></div>
                  <div className="flex justify-between border-t border-blue-300 pt-1 font-bold"><span>Total Current Assets</span><span className="font-mono">$32,000</span></div>
                </div>
              </div>
              <div>
                <p className="font-semibold text-blue-800 mb-2 mt-4">Non-Current Assets</p>
                <div className="space-y-1 text-sm ml-4">
                  <div className="flex justify-between"><span>Property & Equipment</span><span className="font-mono">$30,000</span></div>
                  <div className="flex justify-between"><span>Intangible Assets</span><span className="font-mono">$1,000</span></div>
                  <div className="flex justify-between border-t border-blue-300 pt-1 font-bold"><span>Total Non-Current</span><span className="font-mono">$31,000</span></div>
                </div>
              </div>
              <div className="border-t-2 border-blue-500 pt-2 font-bold text-lg flex justify-between">
                <span>TOTAL ASSETS</span><span className="font-mono">$63,000</span>
              </div>
            </div>
          </div>

          {/* Liabilities & Equity */}
          <div className="bg-green-50 p-6">
            <h4 className="font-bold text-xl text-green-900 mb-4">LIABILITIES & EQUITY</h4>
            <div className="space-y-3">
              <div>
                <p className="font-semibold text-red-800 mb-2">Current Liabilities</p>
                <div className="space-y-1 text-sm ml-4">
                  <div className="flex justify-between"><span>Accounts Payable</span><span className="font-mono">$10,000</span></div>
                  <div className="flex justify-between"><span>Short-term Debt</span><span className="font-mono">$2,000</span></div>
                  <div className="flex justify-between border-t border-red-300 pt-1 font-bold"><span>Total Current Liab.</span><span className="font-mono">$12,000</span></div>
                </div>
              </div>
              <div>
                <p className="font-semibold text-red-800 mb-2 mt-4">Long-term Liabilities</p>
                <div className="space-y-1 text-sm ml-4">
                  <div className="flex justify-between"><span>Long-term Debt</span><span className="font-mono">$15,000</span></div>
                  <div className="flex justify-between border-t border-red-300 pt-1 font-bold"><span>Total Liabilities</span><span className="font-mono">$27,000</span></div>
                </div>
              </div>
              <div>
                <p className="font-semibold text-green-800 mb-2 mt-4">Equity</p>
                <div className="space-y-1 text-sm ml-4">
                  <div className="flex justify-between"><span>Share Capital</span><span className="font-mono">$20,000</span></div>
                  <div className="flex justify-between"><span>Retained Earnings</span><span className="font-mono">$16,000</span></div>
                  <div className="flex justify-between border-t border-green-300 pt-1 font-bold"><span>Total Equity</span><span className="font-mono">$36,000</span></div>
                </div>
              </div>
              <div className="border-t-2 border-green-500 pt-2 font-bold text-lg flex justify-between">
                <span>TOTAL LIAB. + EQUITY</span><span className="font-mono">$63,000</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-100 p-4 text-center text-sm text-gray-700">
          ✓ Notice: Total Assets ($63,000) = Total Liabilities + Equity ($63,000) — It balances!
        </div>
      </motion.div>

      <motion.div className="bg-white border-2 border-purple-200 rounded-3xl p-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <h3 className="text-2xl font-bold text-purple-800 mb-6">Key Financial Ratios</h3>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-purple-50 rounded-2xl p-6 border-2 border-purple-300">
            <h4 className="font-bold text-lg text-purple-900 mb-3">📊 Current Ratio</h4>
            <div className="bg-white rounded-xl p-4 mb-3">
              <p className="text-sm text-gray-600 mb-2">Formula:</p>
              <p className="font-mono font-bold text-purple-700">Current Assets ÷ Current Liabilities</p>
            </div>
            <div className="bg-purple-100 rounded-xl p-4">
              <p className="text-sm text-gray-700 mb-1">Tesla's Current Ratio:</p>
              <p className="font-mono font-bold text-lg">$32,000 ÷ $12,000 = 2.67</p>
            </div>
            <p className="text-sm text-gray-700 mt-3">
              ✓ Ratio above 1.0 is good! Tesla has $2.67 in current assets for every $1 of current liabilities. Strong short-term financial health.
            </p>
          </div>

          <div className="bg-blue-50 rounded-2xl p-6 border-2 border-blue-300">
            <h4 className="font-bold text-lg text-blue-900 mb-3">⚖️ Debt-to-Equity Ratio</h4>
            <div className="bg-white rounded-xl p-4 mb-3">
              <p className="text-sm text-gray-600 mb-2">Formula:</p>
              <p className="font-mono font-bold text-blue-700">Total Liabilities ÷ Total Equity</p>
            </div>
            <div className="bg-blue-100 rounded-xl p-4">
              <p className="text-sm text-gray-700 mb-1">Tesla's Debt-to-Equity:</p>
              <p className="font-mono font-bold text-lg">$27,000 ÷ $36,000 = 0.75</p>
            </div>
            <p className="text-sm text-gray-700 mt-3">
              ✓ For every $1 of owner equity, there's $0.75 of debt. Lower ratios mean less financial risk. Tesla uses moderate leverage.
            </p>
          </div>
        </div>
      </motion.div>
    </div>

    <div className="flex justify-center gap-4 pb-12">
      <button onClick={handlePrev} className="px-8 py-4 rounded-2xl border-2 border-blue-400 bg-white text-blue-600 font-semibold text-lg shadow-lg hover:bg-blue-50">
        ← Back
      </button>
      <button onClick={handleNext} className="px-8 py-4 rounded-2xl bg-blue-500 text-white font-semibold text-lg shadow-lg hover:bg-blue-600">
        Play Game 1 →
      </button>
    </div>
  </div>
);

// Game 1: Balance Sheet Builder
interface BalanceSheetBuilderProps {
  handlePrev: () => void;
  handleNext: () => void;
}

const BalanceSheetBuilder = ({ handlePrev, handleNext }: BalanceSheetBuilderProps) => {
  const lineItems = [
    { id: '1', name: 'Cash', amount: 50000, category: 'assets', subcategory: 'assets-current', explanation: 'Cash is the most liquid current asset. It belongs in the Assets section under Current Assets.' },
    { id: '2', name: 'Inventory', amount: 30000, category: 'assets', subcategory: 'assets-current', explanation: 'Inventory is a current asset that will be sold within the year.' },
    { id: '3', name: 'Accounts Receivable', amount: 25000, category: 'assets', subcategory: 'assets-current', explanation: 'Accounts Receivable is money customers owe you - a current asset.' },
    { id: '4', name: 'Building', amount: 200000, category: 'assets', subcategory: 'assets-noncurrent', explanation: 'A building is a long-term (non-current) asset that provides value for many years.' },
    { id: '5', name: 'Equipment', amount: 60000, category: 'assets', subcategory: 'assets-noncurrent', explanation: 'Equipment is a non-current asset used over multiple years.' },
    { id: '6', name: 'Accounts Payable', amount: 20000, category: 'liabilities', subcategory: 'liabilities-current', explanation: 'Accounts Payable is money owed to suppliers - a current liability.' },
    { id: '7', name: 'Short-term Loan', amount: 15000, category: 'liabilities', subcategory: 'liabilities-current', explanation: 'Short-term loans are current liabilities due within one year.' },
    { id: '8', name: 'Long-term Loan', amount: 100000, category: 'liabilities', subcategory: 'liabilities-noncurrent', explanation: 'Long-term loans are non-current liabilities paid over multiple years.' },
    { id: '9', name: 'Share Capital', amount: 120000, category: 'equity', subcategory: 'equity', explanation: 'Share capital is money invested by owners - part of equity.' },
    { id: '10', name: 'Retained Earnings', amount: 110000, category: 'equity', subcategory: 'equity', explanation: 'Retained earnings are accumulated profits kept in the business - part of equity.' },
  ];

  const [items, setItems] = useState(lineItems.map(item => ({ ...item, zone: 'bank' })));
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [checked, setChecked] = useState(false);

  const handleDragStart = (e: React.DragEvent, itemId: string) => {
    setDraggedItem(itemId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, zoneId: string) => {
    e.preventDefault();
    if (draggedItem) {
      setItems(items.map(item =>
        item.id === draggedItem ? { ...item, zone: zoneId } : item
      ));
      setDraggedItem(null);
    }
  };

  const handleTouchStart = (e: React.TouchEvent, itemId: string) => {
    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });
    setDraggedItem(itemId);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!draggedItem || !touchStart) return;

    const touch = e.changedTouches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    const dropZone = element?.closest('[data-drop-zone]');

    if (dropZone) {
      const zoneId = dropZone.getAttribute('data-drop-zone');
      if (zoneId) {
        setItems(items.map(item =>
          item.id === draggedItem ? { ...item, zone: zoneId } : item
        ));
      }
    }

    setDraggedItem(null);
    setTouchStart(null);
  };

  const checkAnswers = () => {
    setChecked(true);
  };

  const score = items.filter(item => item.zone === item.subcategory && item.zone !== 'bank').length;

  // Calculate totals in real-time
  const currentAssets = items.filter(i => i.zone === 'assets-current').reduce((sum, i) => sum + i.amount, 0);
  const noncurrentAssets = items.filter(i => i.zone === 'assets-noncurrent').reduce((sum, i) => sum + i.amount, 0);
  const totalAssets = currentAssets + noncurrentAssets;

  const currentLiabilities = items.filter(i => i.zone === 'liabilities-current').reduce((sum, i) => sum + i.amount, 0);
  const noncurrentLiabilities = items.filter(i => i.zone === 'liabilities-noncurrent').reduce((sum, i) => sum + i.amount, 0);
  const totalLiabilities = currentLiabilities + noncurrentLiabilities;

  const totalEquity = items.filter(i => i.zone === 'equity').reduce((sum, i) => sum + i.amount, 0);

  const totalLiabEquity = totalLiabilities + totalEquity;
  const balances = totalAssets === totalLiabEquity;

  const getItemClass = (item: typeof items[0], inBank: boolean = false) => {
    if (inBank) return 'bg-white border-gray-300 shadow-sm hover:shadow-lg hover:border-blue-400';
    if (!checked) return 'bg-blue-50 border-blue-200 shadow-sm';
    const isCorrect = item.zone === item.subcategory;
    return isCorrect
      ? 'bg-green-100 border-green-500 text-green-900 shadow-md'
      : 'bg-red-100 border-red-500 text-red-900 shadow-md';
  };

  return (
    <div className="max-w-6xl mx-auto pt-16">
      <motion.h2 className="text-4xl font-bold mb-4 text-center text-gray-800" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        🎮 Balance Sheet Builder
      </motion.h2>
      <p className="text-center text-gray-600 mb-8 text-lg">Drag line items to build a balance sheet. Watch it balance in real-time!</p>

      {/* Item Bank */}
      <div className="bg-gradient-to-r from-gray-100 to-gray-200 rounded-2xl p-5 mb-6 min-h-[100px] border-2 border-gray-300">
        <p className="text-sm font-semibold text-gray-700 mb-3 text-center">📦 Available Line Items</p>
        <div className="flex flex-wrap gap-3 justify-center">
          {items.filter(i => i.zone === 'bank').map(item => (
            <div
              key={item.id}
              draggable
              onDragStart={(e) => handleDragStart(e, item.id)}
              onTouchStart={(e) => handleTouchStart(e, item.id)}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              className={`${getItemClass(item, true)} border-2 rounded-xl px-4 py-2 text-sm font-medium cursor-grab active:cursor-grabbing transition-all`}
            >
              <div className="font-bold">{item.name}</div>
              <div className="text-xs text-gray-600">${item.amount.toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Balance Sheet - Similar to Step 5 Design */}
      <motion.div className="bg-white border-2 border-gray-300 rounded-3xl overflow-hidden mb-6 shadow-xl" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="bg-gray-800 text-white p-4 text-center">
          <h3 className="text-2xl font-bold">Your Balance Sheet</h3>
          <p className="text-sm text-gray-300">Drag items to the correct sections</p>
        </div>

        <div className="grid md:grid-cols-2 gap-0">
          {/* ASSETS SIDE */}
          <div className="bg-blue-50 p-6 border-r-2 border-gray-300">
            <h4 className="font-bold text-xl text-blue-900 mb-4">ASSETS</h4>

            {/* Current Assets Drop Zone */}
            <div className="mb-4">
              <p className="font-semibold text-blue-800 mb-2">Current Assets</p>
              <div
                data-drop-zone="assets-current"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, 'assets-current')}
                className="min-h-[120px] bg-white/50 border-2 border-dashed border-blue-300 rounded-xl p-3"
              >
                <div className="space-y-2">
                  {items.filter(i => i.zone === 'assets-current').map(item => (
                    <div
                      key={item.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, item.id)}
                      onTouchStart={(e) => handleTouchStart(e, item.id)}
                      onTouchMove={handleTouchMove}
                      onTouchEnd={handleTouchEnd}
                      className={`${getItemClass(item)} border-2 rounded-lg px-3 py-2 cursor-grab active:cursor-grabbing`}
                    >
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{item.name}</span>
                        <span className="font-mono">${item.amount.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                  {items.filter(i => i.zone === 'assets-current').length === 0 && (
                    <p className="text-xs text-gray-400 text-center py-4">Drop current assets here</p>
                  )}
                </div>
                <div className="flex justify-between border-t border-blue-300 pt-2 mt-2 font-bold text-sm">
                  <span>Total Current Assets</span>
                  <span className="font-mono">${currentAssets.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Non-Current Assets Drop Zone */}
            <div className="mb-4">
              <p className="font-semibold text-blue-800 mb-2">Non-Current Assets</p>
              <div
                data-drop-zone="assets-noncurrent"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, 'assets-noncurrent')}
                className="min-h-[120px] bg-white/50 border-2 border-dashed border-blue-300 rounded-xl p-3"
              >
                <div className="space-y-2">
                  {items.filter(i => i.zone === 'assets-noncurrent').map(item => (
                    <div
                      key={item.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, item.id)}
                      onTouchStart={(e) => handleTouchStart(e, item.id)}
                      onTouchMove={handleTouchMove}
                      onTouchEnd={handleTouchEnd}
                      className={`${getItemClass(item)} border-2 rounded-lg px-3 py-2 cursor-grab active:cursor-grabbing`}
                    >
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{item.name}</span>
                        <span className="font-mono">${item.amount.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                  {items.filter(i => i.zone === 'assets-noncurrent').length === 0 && (
                    <p className="text-xs text-gray-400 text-center py-4">Drop non-current assets here</p>
                  )}
                </div>
                <div className="flex justify-between border-t border-blue-300 pt-2 mt-2 font-bold text-sm">
                  <span>Total Non-Current</span>
                  <span className="font-mono">${noncurrentAssets.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="border-t-2 border-blue-500 pt-3 font-bold text-lg flex justify-between">
              <span>TOTAL ASSETS</span>
              <span className="font-mono">${totalAssets.toLocaleString()}</span>
            </div>
          </div>

          {/* LIABILITIES & EQUITY SIDE */}
          <div className="bg-green-50 p-6">
            <h4 className="font-bold text-xl text-green-900 mb-4">LIABILITIES & EQUITY</h4>

            {/* Current Liabilities Drop Zone */}
            <div className="mb-4">
              <p className="font-semibold text-red-800 mb-2">Current Liabilities</p>
              <div
                data-drop-zone="liabilities-current"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, 'liabilities-current')}
                className="min-h-[100px] bg-white/50 border-2 border-dashed border-red-300 rounded-xl p-3"
              >
                <div className="space-y-2">
                  {items.filter(i => i.zone === 'liabilities-current').map(item => (
                    <div
                      key={item.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, item.id)}
                      onTouchStart={(e) => handleTouchStart(e, item.id)}
                      onTouchMove={handleTouchMove}
                      onTouchEnd={handleTouchEnd}
                      className={`${getItemClass(item)} border-2 rounded-lg px-3 py-2 cursor-grab active:cursor-grabbing`}
                    >
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{item.name}</span>
                        <span className="font-mono">${item.amount.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                  {items.filter(i => i.zone === 'liabilities-current').length === 0 && (
                    <p className="text-xs text-gray-400 text-center py-4">Drop current liabilities here</p>
                  )}
                </div>
                <div className="flex justify-between border-t border-red-300 pt-2 mt-2 font-bold text-sm">
                  <span>Total Current Liab.</span>
                  <span className="font-mono">${currentLiabilities.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Non-Current Liabilities Drop Zone */}
            <div className="mb-4">
              <p className="font-semibold text-red-800 mb-2">Long-term Liabilities</p>
              <div
                data-drop-zone="liabilities-noncurrent"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, 'liabilities-noncurrent')}
                className="min-h-[80px] bg-white/50 border-2 border-dashed border-red-300 rounded-xl p-3"
              >
                <div className="space-y-2">
                  {items.filter(i => i.zone === 'liabilities-noncurrent').map(item => (
                    <div
                      key={item.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, item.id)}
                      onTouchStart={(e) => handleTouchStart(e, item.id)}
                      onTouchMove={handleTouchMove}
                      onTouchEnd={handleTouchEnd}
                      className={`${getItemClass(item)} border-2 rounded-lg px-3 py-2 cursor-grab active:cursor-grabbing`}
                    >
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{item.name}</span>
                        <span className="font-mono">${item.amount.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                  {items.filter(i => i.zone === 'liabilities-noncurrent').length === 0 && (
                    <p className="text-xs text-gray-400 text-center py-4">Drop long-term liabilities here</p>
                  )}
                </div>
                <div className="flex justify-between border-t border-red-300 pt-2 mt-2 font-bold text-sm">
                  <span>Total Liabilities</span>
                  <span className="font-mono">${totalLiabilities.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Equity Drop Zone */}
            <div className="mb-4">
              <p className="font-semibold text-green-800 mb-2">Equity</p>
              <div
                data-drop-zone="equity"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, 'equity')}
                className="min-h-[100px] bg-white/50 border-2 border-dashed border-green-300 rounded-xl p-3"
              >
                <div className="space-y-2">
                  {items.filter(i => i.zone === 'equity').map(item => (
                    <div
                      key={item.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, item.id)}
                      onTouchStart={(e) => handleTouchStart(e, item.id)}
                      onTouchMove={handleTouchMove}
                      onTouchEnd={handleTouchEnd}
                      className={`${getItemClass(item)} border-2 rounded-lg px-3 py-2 cursor-grab active:cursor-grabbing`}
                    >
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{item.name}</span>
                        <span className="font-mono">${item.amount.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                  {items.filter(i => i.zone === 'equity').length === 0 && (
                    <p className="text-xs text-gray-400 text-center py-4">Drop equity items here</p>
                  )}
                </div>
                <div className="flex justify-between border-t border-green-300 pt-2 mt-2 font-bold text-sm">
                  <span>Total Equity</span>
                  <span className="font-mono">${totalEquity.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="border-t-2 border-green-500 pt-3 font-bold text-lg flex justify-between">
              <span>TOTAL LIAB. + EQUITY</span>
              <span className="font-mono">${totalLiabEquity.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className={`p-4 text-center text-sm font-semibold ${balances && totalAssets > 0 ? 'bg-green-100 text-green-900' : totalAssets > 0 ? 'bg-red-100 text-red-900' : 'bg-gray-100 text-gray-700'}`}>
          {balances && totalAssets > 0
            ? '✓ Balance Sheet Balances! Assets = Liabilities + Equity'
            : totalAssets > 0
              ? `✗ Does not balance: Assets ($${totalAssets.toLocaleString()}) ≠ Liabilities + Equity ($${totalLiabEquity.toLocaleString()})`
              : 'Start dragging items to build your balance sheet'}
        </div>
      </motion.div>

      {/* Check Button */}
      <div className="flex justify-center mb-6">
        <button
          onClick={checkAnswers}
          disabled={items.some(i => i.zone === 'bank')}
          className="px-8 py-4 bg-blue-500 text-white rounded-xl font-bold text-lg hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
        >
          {checked ? `Score: ${score} / ${items.length}` : 'Check My Answers'}
        </button>
      </div>

      {/* Feedback and Explanations */}
      {checked && (
        <>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${score === items.length && balances ? 'bg-green-50 border-green-500' : 'bg-yellow-50 border-yellow-500'} border-l-4 p-6 rounded-2xl mb-6`}
          >
            <p className={`${score === items.length && balances ? 'text-green-900' : 'text-yellow-900'} font-semibold text-lg`}>
              {score === items.length && balances
                ? '🎉 Perfect! All items correctly placed and the balance sheet balances!'
                : score === items.length
                  ? '👍 All items placed correctly! And the sheet balances.'
                  : `📚 ${score}/${items.length} correct. Review the explanations below.`
              }
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white border-2 border-gray-200 rounded-2xl p-6 mb-6 shadow-lg"
          >
            <h3 className="text-xl font-bold text-gray-800 mb-4">📖 Explanations</h3>
            <div className="space-y-3">
              {items.filter(i => i.zone !== 'bank').map((item) => {
                const isCorrect = item.zone === item.subcategory;
                return (
                  <div key={item.id} className={`p-4 rounded-xl border-2 ${isCorrect ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'}`}>
                    <div className="flex items-start gap-3 mb-2">
                      <span className={`text-2xl ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                        {isCorrect ? '✓' : '✗'}
                      </span>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">{item.name} (${item.amount.toLocaleString()})</p>
                        <p className={`text-sm ${isCorrect ? 'text-green-800' : 'text-red-800'} mt-1`}>
                          {!isCorrect && `You placed it in: ${
                            item.zone === 'assets-current' ? 'Current Assets' :
                            item.zone === 'assets-noncurrent' ? 'Non-Current Assets' :
                            item.zone === 'liabilities-current' ? 'Current Liabilities' :
                            item.zone === 'liabilities-noncurrent' ? 'Long-term Liabilities' :
                            item.zone === 'equity' ? 'Equity' : item.zone
                          }. `}
                          Correct section: <span className="font-bold">{
                            item.subcategory === 'assets-current' ? 'Current Assets' :
                            item.subcategory === 'assets-noncurrent' ? 'Non-Current Assets' :
                            item.subcategory === 'liabilities-current' ? 'Current Liabilities' :
                            item.subcategory === 'liabilities-noncurrent' ? 'Long-term Liabilities' :
                            'Equity'
                          }</span>
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 pl-11">{item.explanation}</p>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </>
      )}

      <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6 mb-8">
        <h3 className="font-bold text-blue-900 mb-2">Next Up: Ratio Calculator</h3>
        <p className="text-blue-800">You'll calculate key financial ratios from a balance sheet!</p>
      </div>

      <div className="flex justify-center gap-4 pb-12">
        <button onClick={handlePrev} className="px-8 py-4 rounded-2xl border-2 border-blue-400 bg-white text-blue-600 font-semibold text-lg shadow-lg hover:bg-blue-50">
          ← Back
        </button>
        <button onClick={handleNext} className="px-8 py-4 rounded-2xl bg-blue-500 text-white font-semibold text-lg shadow-lg hover:bg-blue-600">
          Next: Game 2 →
        </button>
      </div>
    </div>
  );
};

// Game 2: Ratio Calculator Challenge
interface RatioCalculatorProps {
  handlePrev: () => void;
  handleNext: () => void;
}

const RatioCalculator = ({ handlePrev, handleNext: handleNextPage }: RatioCalculatorProps) => {
  const scenarios = [
    {
      title: 'Tech Startup Inc.',
      data: { currentAssets: 150000, currentLiabilities: 100000, totalLiabilities: 200000, totalEquity: 250000 },
      questions: [
        { type: 'current-ratio', question: 'Calculate the Current Ratio', answer: 1.5, explanation: 'Current Ratio = Current Assets ÷ Current Liabilities = $150,000 ÷ $100,000 = 1.5. This means the company has $1.50 in current assets for every $1 of current liabilities - good short-term health!' },
        { type: 'debt-to-equity', question: 'Calculate the Debt-to-Equity Ratio', answer: 0.8, explanation: 'Debt-to-Equity = Total Liabilities ÷ Total Equity = $200,000 ÷ $250,000 = 0.8. For every $1 of equity, there\'s $0.80 in debt - moderate leverage.' }
      ]
    },
    {
      title: 'Manufacturing Co.',
      data: { currentAssets: 80000, currentLiabilities: 120000, totalLiabilities: 300000, totalEquity: 200000 },
      questions: [
        { type: 'current-ratio', question: 'Calculate the Current Ratio', answer: 0.67, explanation: 'Current Ratio = $80,000 ÷ $120,000 = 0.67. Below 1.0! The company has only $0.67 in current assets per $1 of current liabilities - potential liquidity issues.' },
        { type: 'debt-to-equity', question: 'Calculate the Debt-to-Equity Ratio', answer: 1.5, explanation: 'Debt-to-Equity = $300,000 ÷ $200,000 = 1.5. The company has $1.50 in debt for every $1 of equity - higher leverage and risk.' }
      ]
    },
    {
      title: 'Retail Chain LLC',
      data: { currentAssets: 200000, currentLiabilities: 80000, totalLiabilities: 150000, totalEquity: 350000 },
      questions: [
        { type: 'current-ratio', question: 'Calculate the Current Ratio', answer: 2.5, explanation: 'Current Ratio = $200,000 ÷ $80,000 = 2.5. Excellent! $2.50 in current assets per $1 of current liabilities - very strong liquidity position.' },
        { type: 'debt-to-equity', question: 'Calculate the Debt-to-Equity Ratio', answer: 0.43, explanation: 'Debt-to-Equity = $150,000 ÷ $350,000 = 0.43. Low debt relative to equity - conservative financing, lower financial risk.' }
      ]
    }
  ];

  const [currentScenarioIdx, setCurrentScenarioIdx] = useState(0);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [answers, setAnswers] = useState<{ correct: boolean; userValue: number; correctValue: number }[]>([]);
  const [gameCompleted, setGameCompleted] = useState(false);

  const currentScenario = scenarios[currentScenarioIdx];
  const currentQuestion = currentScenario.questions[currentQuestionIdx];
  const totalQuestions = scenarios.reduce((sum, s) => sum + s.questions.length, 0);
  const questionNumber = scenarios.slice(0, currentScenarioIdx).reduce((sum, s) => sum + s.questions.length, 0) + currentQuestionIdx + 1;

  const handleSubmitAnswer = () => {
    const parsed = parseFloat(userAnswer);
    const correct = Math.abs(parsed - currentQuestion.answer) < 0.01;
    setShowResult(true);
    setAnswers([...answers, { correct, userValue: parsed, correctValue: currentQuestion.answer }]);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIdx < currentScenario.questions.length - 1) {
      setCurrentQuestionIdx(currentQuestionIdx + 1);
      setUserAnswer('');
      setShowResult(false);
    } else if (currentScenarioIdx < scenarios.length - 1) {
      setCurrentScenarioIdx(currentScenarioIdx + 1);
      setCurrentQuestionIdx(0);
      setUserAnswer('');
      setShowResult(false);
    } else {
      setGameCompleted(true);
    }
  };

  const score = answers.filter(a => a.correct).length;
  const isCorrect = showResult && Math.abs(parseFloat(userAnswer) - currentQuestion.answer) < 0.01;

  return (
    <div className="max-w-4xl mx-auto pt-16">
      <motion.h2 className="text-4xl font-bold mb-4 text-center text-gray-800" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        🧮 Ratio Calculator Challenge
      </motion.h2>

      {!gameCompleted ? (
        <>
          <div className="flex justify-center mb-6">
            <div className="bg-white/90 backdrop-blur-md px-6 py-2 rounded-full shadow-md border-2 border-blue-200">
              <span className="text-blue-600 font-bold text-sm">
                Question {questionNumber} of {totalQuestions}
              </span>
            </div>
          </div>

          <motion.div
            key={`${currentScenarioIdx}-${currentQuestionIdx}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white border-2 border-gray-200 rounded-3xl p-8 mb-6 shadow-xl"
          >
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-6 rounded-2xl mb-6">
              <h3 className="text-2xl font-bold mb-2">{currentScenario.title}</h3>
              <p className="text-blue-100">Balance Sheet Snapshot</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200">
                <p className="text-sm text-gray-600 mb-1">Current Assets</p>
                <p className="text-2xl font-bold text-blue-700">${currentScenario.data.currentAssets.toLocaleString()}</p>
              </div>
              <div className="bg-red-50 rounded-xl p-4 border-2 border-red-200">
                <p className="text-sm text-gray-600 mb-1">Current Liabilities</p>
                <p className="text-2xl font-bold text-red-700">${currentScenario.data.currentLiabilities.toLocaleString()}</p>
              </div>
              <div className="bg-orange-50 rounded-xl p-4 border-2 border-orange-200">
                <p className="text-sm text-gray-600 mb-1">Total Liabilities</p>
                <p className="text-2xl font-bold text-orange-700">${currentScenario.data.totalLiabilities.toLocaleString()}</p>
              </div>
              <div className="bg-green-50 rounded-xl p-4 border-2 border-green-200">
                <p className="text-sm text-gray-600 mb-1">Total Equity</p>
                <p className="text-2xl font-bold text-green-700">${currentScenario.data.totalEquity.toLocaleString()}</p>
              </div>
            </div>

            <div className="border-t-2 border-gray-200 pt-6">
              <h4 className="text-xl font-bold text-gray-800 mb-4">{currentQuestion.question}</h4>

              <div className="bg-gray-50 rounded-xl p-4 mb-4 border-2 border-gray-200">
                <p className="text-sm text-gray-600 mb-2">Formula:</p>
                <p className="font-mono font-bold text-gray-800">
                  {currentQuestion.type === 'current-ratio'
                    ? 'Current Assets ÷ Current Liabilities'
                    : 'Total Liabilities ÷ Total Equity'
                  }
                </p>
              </div>

              <div className="flex gap-3 mb-4">
                <input
                  type="number"
                  step="0.01"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  disabled={showResult}
                  placeholder="Enter your answer (e.g., 1.5)"
                  className="flex-1 px-6 py-4 border-2 border-gray-300 rounded-xl text-lg font-semibold focus:border-blue-500 focus:outline-none disabled:bg-gray-100"
                />
                {!showResult && (
                  <button
                    onClick={handleSubmitAnswer}
                    disabled={!userAnswer}
                    className="px-8 py-4 bg-blue-500 text-white rounded-xl font-bold hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                  >
                    Submit
                  </button>
                )}
              </div>

              {showResult && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`${isCorrect ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'} border-2 rounded-2xl p-6`}
                >
                  <div className="flex items-start gap-4 mb-3">
                    <span className={`text-4xl ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                      {isCorrect ? '✓' : '✗'}
                    </span>
                    <div className="flex-1">
                      <p className={`font-bold text-xl ${isCorrect ? 'text-green-900' : 'text-red-900'} mb-2`}>
                        {isCorrect ? 'Correct!' : `Incorrect — The answer is ${currentQuestion.answer}`}
                      </p>
                      <p className={`text-sm ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                        {currentQuestion.explanation}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleNextQuestion}
                    className="w-full mt-4 px-6 py-3 bg-gray-800 text-white rounded-xl font-semibold hover:bg-gray-900 transition"
                  >
                    {questionNumber < totalQuestions ? 'Next Question →' : 'See Results'}
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Progress */}
          <div className="flex justify-center gap-2 mb-8">
            {Array.from({ length: totalQuestions }).map((_, idx) => (
              <div
                key={idx}
                className={`h-3 rounded-full transition-all ${
                  idx < answers.length
                    ? answers[idx].correct
                      ? 'bg-green-500 w-3'
                      : 'bg-red-500 w-3'
                    : idx === questionNumber - 1
                      ? 'bg-blue-500 w-8'
                      : 'bg-gray-300 w-3'
                }`}
              />
            ))}
          </div>
        </>
      ) : (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white border-2 border-gray-200 rounded-3xl p-12 text-center mb-6 shadow-xl"
        >
          <div className={`w-32 h-32 mx-auto rounded-full flex items-center justify-center mb-6 shadow-2xl ${score >= 5 ? 'bg-green-500' : 'bg-blue-500'}`}>
            <span className="text-6xl">{score >= 5 ? '🏆' : '📊'}</span>
          </div>
          <div className="text-6xl font-black text-blue-600 mb-3">{score}/{totalQuestions}</div>
          <p className="text-2xl text-gray-700 mb-6">
            {score === totalQuestions ? '🎉 Perfect! Financial Ratio Master!' : score >= 5 ? '🎉 Great work!' : score >= 3 ? '👍 Good effort!' : '📚 Keep practicing!'}
          </p>
          <div className="inline-block bg-blue-100 text-blue-800 px-8 py-3 rounded-full font-bold text-lg mb-8 shadow-md">
            {score >= 5 ? '+400 XP' : score >= 3 ? '+250 XP' : '+150 XP'}
          </div>

          {/* Summary */}
          <div className="text-left bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-6 mt-8">
            <h3 className="font-bold text-lg text-gray-800 mb-4 text-center">📊 Your Performance</h3>
            <div className="grid grid-cols-2 gap-3">
              {answers.map((ans, idx) => (
                <div key={idx} className={`p-3 rounded-lg ${ans.correct ? 'bg-green-100' : 'bg-red-100'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-lg ${ans.correct ? 'text-green-600' : 'text-red-600'}`}>
                      {ans.correct ? '✓' : '✗'}
                    </span>
                    <span className="text-sm font-semibold text-gray-700">Q{idx + 1}</span>
                  </div>
                  <p className={`text-xs ${ans.correct ? 'text-green-800' : 'text-red-800'}`}>
                    Your answer: {ans.userValue.toFixed(2)}
                    {!ans.correct && ` → ${ans.correctValue.toFixed(2)}`}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      <div className="flex justify-center gap-4 pb-12">
        <button onClick={handlePrev} className="px-8 py-4 rounded-2xl border-2 border-blue-400 bg-white text-blue-600 font-semibold text-lg shadow-lg hover:bg-blue-50">
          ← Back
        </button>
        {gameCompleted && (
          <button onClick={handleNextPage} className="px-8 py-4 rounded-2xl bg-blue-500 text-white font-semibold text-lg shadow-lg hover:bg-blue-600">
            Take the Quiz →
          </button>
        )}
      </div>
    </div>
  );
};

// Quiz Page Component (reusing from Accounting module pattern)
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
  quizCompleted,
  resetQuiz,
  navigate,
  shuffledQuestions
}: QuizPageProps) => (
  <div className="max-w-4xl mx-auto pt-16">
    {!quizCompleted ? (
      <div className="bg-white rounded-3xl shadow-xl border-2 border-blue-100 overflow-hidden flex flex-col min-h-[500px]">
        <div className="flex-1 p-8 lg:p-16 flex flex-col justify-center">
          <div className="flex justify-between items-end mb-8 border-b border-gray-100 pb-6">
            <div>
              <span className="text-sm font-bold text-blue-600 uppercase tracking-wider block mb-2">
                Question {currentQuestion + 1} of {shuffledQuestions.length}
              </span>
              <h2 className="text-2xl lg:text-4xl font-bold text-slate-900 leading-tight">
                {shuffledQuestions[currentQuestion].question}
              </h2>
            </div>
            <div className="hidden lg:block text-slate-300">
              <span className="text-5xl">⚖️</span>
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
                      ? 'bg-blue-50 border-blue-600 shadow-lg scale-[1.02]'
                      : 'bg-white border-slate-200 hover:border-blue-400 hover:shadow-md'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                      showCorrectness && isCorrect
                        ? 'bg-green-500 text-white'
                        : showCorrectness && isSelected
                        ? 'bg-red-500 text-white'
                        : isSelected
                        ? 'bg-blue-600 text-white'
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
                <h4 className="font-bold text-blue-400 uppercase tracking-wider text-sm mb-2">Explanation</h4>
                <p className="text-lg leading-relaxed text-slate-200">
                  {shuffledQuestions[currentQuestion].explanation}
                </p>
              </div>
              <button
                onClick={handleNextQuestion}
                className="w-full md:w-auto px-8 py-4 bg-white text-slate-900 rounded-xl font-bold hover:bg-blue-50 transition-colors whitespace-nowrap"
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
        className="bg-white rounded-3xl shadow-xl p-12 text-center border-2 border-blue-100"
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
            <p className="text-green-700 text-lg">You've mastered the Balance Sheet module</p>
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
const BalanceSheetModule = () => {
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

  const modulePassed = isModulePassed(MODULES.BALANCE_SHEET.id);
  const totalSteps = 8; // 0:intro, 1:assets, 2:liabilities, 3:equity, 4:reading, 5:game1, 6:game2, 7:quiz

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
      saveScore(MODULES.BALANCE_SHEET.id, percentage);
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
        emoji="⚖️"
        moduleName="Balance Sheet"
        description="You've already passed the Balance Sheet module. Great job mastering financial statements!"
        gradientClasses="from-blue-50 via-cyan-100 to-teal-200"
        onReviewClick={() => setIsReviewMode(true)}
      />
    );
  }

  return (
    <div className="min-h-screen relative overflow-x-hidden" style={{ background: 'linear-gradient(135deg, #e0f2fe 0%, #dbeafe 50%, #e0e7ff 100%)' }}>
      <button
        className="absolute top-4 left-4 px-4 py-2 rounded-lg text-blue-600 hover:bg-white/50 backdrop-blur-sm font-medium transition z-50 shadow-sm border border-blue-100"
        onClick={() => navigate('/game')}
      >
        ← Back to Roadmap
      </button>

      <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-50">
        <div className="bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full shadow-sm border border-blue-100 text-gray-600 font-semibold text-sm">
          Step {currentStep + 1} of {totalSteps}
        </div>
      </div>

      {(currentStep > 0 && (currentStep < totalSteps - 1 || (currentStep === totalSteps - 1 && currentQuestion === 0 && !showAnswerResult && !quizCompleted))) && (
        <button
          onClick={handlePrev}
          className="fixed left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition flex items-center justify-center z-40"
          aria-label="Previous"
        >
          ←
        </button>
      )}
      {currentStep < totalSteps - 1 && (
        <button
          onClick={handleNext}
          className="fixed right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition flex items-center justify-center z-40"
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
          {currentStep === 1 && <AssetsPage handlePrev={handlePrev} handleNext={handleNext} />}
          {currentStep === 2 && <LiabilitiesPage handlePrev={handlePrev} handleNext={handleNext} />}
          {currentStep === 3 && <EquityPage handlePrev={handlePrev} handleNext={handleNext} />}
          {currentStep === 4 && <ReadingBalanceSheetPage handlePrev={handlePrev} handleNext={handleNext} />}
          {currentStep === 5 && <BalanceSheetBuilder handlePrev={handlePrev} handleNext={handleNext} />}
          {currentStep === 6 && <RatioCalculator handlePrev={handlePrev} handleNext={handleNext} />}
          {currentStep === 7 && (
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

export default BalanceSheetModule;
