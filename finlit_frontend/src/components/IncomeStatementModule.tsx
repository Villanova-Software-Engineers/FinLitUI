import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useModuleScore, MODULES } from '../hooks/useModuleScore';
import ModuleCompletedScreen from './ModuleCompletedScreen';
import { shuffleQuizOptions } from '../utils/shuffleQuizOptions';

// 10 Quiz Questions with explanations
const quizQuestions = [
  {
    question: "What period does an income statement cover?",
    options: ["A single day", "A specific point in time", "A period of time (month, quarter, year)", "The company's entire history"],
    correctIndex: 2,
    explanation: "An income statement covers a period of time - like a month, quarter, or year. It shows how the company performed during that period, unlike a balance sheet which is a snapshot at one moment."
  },
  {
    question: "Gross profit formula?",
    options: ["Revenue − Operating expenses", "Revenue − COGS", "Net income + taxes", "Operating income − interest"],
    correctIndex: 1,
    explanation: "Gross Profit = Revenue − COGS (Cost of Goods Sold). This shows profit before operating expenses like marketing, salaries, and rent."
  },
  {
    question: "A company has $1M revenue and $600K COGS. Gross profit = ?",
    options: ["$1.6M", "$600K", "$400K", "$200K"],
    correctIndex: 2,
    explanation: "Gross Profit = Revenue − COGS = $1,000,000 − $600,000 = $400,000. This is the profit after paying for the direct costs of making products."
  },
  {
    question: "What does EBIT stand for?",
    options: ["Earnings Before Interest and Tax", "Earnings Before Inventory Transfer", "Equity Before Income Tax", "Expenses Before Interest Total"],
    correctIndex: 0,
    explanation: "EBIT stands for Earnings Before Interest and Tax. It's also called operating income - profit from core business operations before financing costs and taxes."
  },
  {
    question: "Net profit margin formula?",
    options: ["Gross profit / COGS", "Operating income / revenue", "Net income / revenue", "Revenue / total assets"],
    correctIndex: 2,
    explanation: "Net Profit Margin = (Net Income ÷ Revenue) × 100%. This shows what percentage of revenue becomes actual profit after all expenses."
  },
  {
    question: "Which is an operating expense?",
    options: ["Interest on a loan", "Income tax", "Marketing and advertising spend", "Dividends paid"],
    correctIndex: 2,
    explanation: "Marketing and advertising are operating expenses - costs of running the business. Interest and taxes come after operating income, and dividends aren't expenses at all."
  },
  {
    question: "A company has $10M revenue but reports a net loss. This means?",
    options: ["Revenue is fake", "COGS and expenses exceeded revenue", "The balance sheet is wrong", "Cash flow must also be negative"],
    correctIndex: 1,
    explanation: "A net loss means total expenses (COGS + operating expenses + interest + taxes) exceeded revenue. You can have high revenue but still lose money if costs are too high."
  },
  {
    question: "Depreciation appears on the income statement as?",
    options: ["A revenue item", "An asset", "An operating expense", "A liability"],
    correctIndex: 2,
    explanation: "Depreciation is an operating expense that spreads the cost of long-term assets over their useful life. It reduces profit even though no cash is paid out."
  },
  {
    question: "EPS (earnings per share) is calculated as?",
    options: ["Net income / total assets", "Net income / shares outstanding", "Revenue / shares outstanding", "Gross profit / shares outstanding"],
    correctIndex: 1,
    explanation: "EPS = Net Income ÷ Shares Outstanding. It shows how much profit the company earned for each share of stock - a key metric for investors."
  },
  {
    question: "Which margin is calculated first when reading an income statement top to bottom?",
    options: ["Net margin", "Operating margin", "Gross margin", "EBITDA margin"],
    correctIndex: 2,
    explanation: "Gross margin comes first - it's calculated right after revenue and COGS at the top of the income statement. Operating and net margins come later as you work down."
  }
];

// Page 1: What is an Income Statement
const IntroPage = ({ handleNext }: { handleNext: () => void }) => (
  <div className="max-w-5xl mx-auto pt-16">
    <motion.div className="text-center mb-12" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
      <h1 className="text-5xl font-bold mb-4 text-gray-800">📊 The Income Statement</h1>
      <p className="text-xl text-gray-600">Measuring business performance over time — from revenue to profit</p>
    </motion.div>

    <div className="space-y-6 mb-12">
      <motion.div className="p-8 rounded-3xl shadow-xl bg-white border-2 border-emerald-100" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
        <div className="flex items-start gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg flex-shrink-0">
            <span className="text-3xl">🎬</span>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">A Movie, Not a Photo</h3>
            <p className="text-gray-700 text-lg leading-relaxed">
              While the balance sheet is a <span className="font-bold text-blue-600">snapshot</span> at one moment, the income statement is a <span className="font-bold text-emerald-600">movie</span> — it shows performance over a period: a month, quarter, or year.
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-6 mb-6">
          <h4 className="font-bold text-emerald-900 mb-4 text-xl">The Flow:</h4>
          <div className="space-y-3">
            {[
              { label: "Revenue", desc: "All money earned from selling products/services", icon: "💰" },
              { label: "− COGS", desc: "Cost to make/buy the products you sold", icon: "📦" },
              { label: "= Gross Profit", desc: "Profit before operating expenses", icon: "✨" },
              { label: "− Operating Expenses", desc: "Rent, salaries, marketing, R&D", icon: "💼" },
              { label: "= Operating Income", desc: "Profit from core business operations", icon: "🎯" },
              { label: "− Interest & Taxes", desc: "Loan interest and income taxes", icon: "🏛️" },
              { label: "= Net Income", desc: "The bottom line — final profit", icon: "🏆" }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                className="flex items-center gap-4 bg-white rounded-xl p-4 border border-emerald-200"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + idx * 0.1 }}
              >
                <span className="text-3xl">{item.icon}</span>
                <div className="flex-1">
                  <p className="font-bold text-gray-800">{item.label}</p>
                  <p className="text-sm text-gray-600">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      <motion.div className="grid md:grid-cols-2 gap-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-2xl p-6">
          <h4 className="font-bold text-xl text-blue-900 mb-3">💡 Revenue ≠ Profit</h4>
          <p className="text-gray-700 leading-relaxed">
            A company can have <span className="font-bold">$100M in revenue</span> but still <span className="font-bold text-red-600">lose money</span> if expenses are $110M. Revenue is the top line. Profit (net income) is the bottom line.
          </p>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-6">
          <h4 className="font-bold text-xl text-amber-900 mb-3">⏰ Period of Time</h4>
          <p className="text-gray-700 leading-relaxed">
            The header says "For the year ended Dec 31, 2023" — this covers <span className="font-bold">January 1 to December 31</span>. It's cumulative performance, not a single moment.
          </p>
        </div>
      </motion.div>

      <motion.div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-l-4 border-emerald-500 p-6 rounded-2xl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
        <p className="text-emerald-900 text-lg">
          <span className="font-bold">Real Example:</span> Netflix had $31.6B in revenue in 2022, but after paying for content ($17B), technology ($3B), marketing ($2.5B), and other costs, they had $4.5B in net income. That's a 14% profit margin.
        </p>
      </motion.div>
    </div>

    <div className="flex justify-center pb-12">
      <button onClick={handleNext} className="px-10 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-lg shadow-xl hover:from-emerald-600 hover:to-teal-600 transition">
        Continue to Revenue & COGS →
      </button>
    </div>
  </div>
);

// Page 2: Revenue and COGS
const RevenueCogsPage = ({ handlePrev, handleNext }: { handlePrev: () => void; handleNext: () => void }) => (
  <div className="max-w-5xl mx-auto pt-16">
    <motion.h2 className="text-4xl font-bold mb-4 text-center text-gray-800" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      Revenue & Cost of Goods Sold
    </motion.h2>
    <p className="text-center text-gray-600 mb-8 text-lg">The starting point of every income statement</p>

    <div className="space-y-6 mb-8">
      <motion.div className="bg-white border-2 border-emerald-200 rounded-3xl p-8 shadow-lg" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h3 className="text-2xl font-bold text-emerald-800 mb-4">💰 Revenue (Top Line)</h3>
        <p className="text-gray-700 mb-6 text-lg leading-relaxed">
          Total money earned from selling products or services. This is the <span className="font-bold">"top line"</span> of the income statement.
        </p>

        <div className="grid md:grid-cols-3 gap-4">
          {[
            { title: "Gross Revenue", desc: "Total sales before any deductions", example: "Sold 1,000 shoes at $100 = $100,000", color: "emerald" },
            { title: "Returns & Discounts", desc: "Money refunded or discounted", example: "50 shoes returned = -$5,000", color: "amber" },
            { title: "Net Revenue", desc: "Actual revenue after deductions", example: "$100,000 - $5,000 = $95,000", color: "teal" }
          ].map((item, idx) => (
            <motion.div
              key={idx}
              className={`bg-${item.color}-50 rounded-2xl p-5 border-2 border-${item.color}-200`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + idx * 0.1 }}
            >
              <h4 className="font-bold text-gray-800 mb-2">{item.title}</h4>
              <p className="text-sm text-gray-600 mb-3 leading-relaxed">{item.desc}</p>
              <div className="bg-white rounded-lg p-3 text-xs text-gray-700 border border-gray-200">
                <span className="font-semibold">Example:</span> {item.example}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div className="bg-white border-2 border-red-200 rounded-3xl p-8 shadow-lg" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <h3 className="text-2xl font-bold text-red-800 mb-4">📦 Cost of Goods Sold (COGS)</h3>
        <p className="text-gray-700 mb-6 text-lg leading-relaxed">
          The <span className="font-bold">direct costs</span> to produce the goods or services you sold. Only includes costs directly tied to production.
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-red-50 rounded-2xl p-6 border-2 border-red-200">
            <h4 className="font-bold text-lg text-red-900 mb-3">✅ Included in COGS</h4>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>Raw materials (fabric for t-shirts)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>Factory labor directly making products</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>Manufacturing overhead (factory rent)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>Shipping costs to get inventory</span>
              </li>
            </ul>
          </div>

          <div className="bg-gray-50 rounded-2xl p-6 border-2 border-gray-300">
            <h4 className="font-bold text-lg text-gray-900 mb-3">❌ NOT in COGS</h4>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-red-600 font-bold">✗</span>
                <span>Office rent (operating expense)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 font-bold">✗</span>
                <span>Marketing/advertising (operating)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 font-bold">✗</span>
                <span>Executive salaries (operating)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 font-bold">✗</span>
                <span>Interest on loans (financing cost)</span>
              </li>
            </ul>
          </div>
        </div>
      </motion.div>

      <motion.div className="bg-gradient-to-r from-white to-emerald-50 border-2 border-emerald-300 rounded-3xl p-8 shadow-lg" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <h3 className="text-2xl font-bold text-emerald-900 mb-6">🎯 Gross Profit = Revenue − COGS</h3>

        <div className="bg-white rounded-2xl p-6 border-2 border-emerald-200 mb-6">
          <h4 className="font-bold text-lg text-gray-800 mb-4">Example Calculation:</h4>
          <div className="space-y-3 text-lg">
            <div className="flex justify-between items-center pb-3">
              <span className="text-gray-700">Revenue (sold 1,000 units at $100)</span>
              <span className="font-bold text-emerald-700">$100,000</span>
            </div>
            <div className="flex justify-between items-center border-t border-gray-200 pt-3 pb-3">
              <span className="text-gray-700">COGS (cost $40 per unit)</span>
              <span className="font-bold text-red-700">−$40,000</span>
            </div>
            <div className="flex justify-between items-center border-t-2 border-emerald-500 pt-3">
              <span className="font-bold text-gray-800">Gross Profit</span>
              <span className="font-bold text-2xl text-emerald-600">$60,000</span>
            </div>
          </div>
        </div>

        <div className="bg-emerald-100 border-l-4 border-emerald-600 rounded-lg p-4">
          <p className="text-emerald-900 font-semibold mb-2">💡 What Gross Profit Tells You:</p>
          <p className="text-emerald-800">
            For every $100 in revenue, $40 went to making the product and $60 is left to cover operating expenses (rent, salaries, marketing) and hopefully profit. This is a <span className="font-bold">60% gross margin</span> — very healthy!
          </p>
        </div>
      </motion.div>
    </div>

    <div className="flex justify-center gap-4 pb-12">
      <button onClick={handlePrev} className="px-8 py-4 rounded-2xl border-2 border-emerald-400 bg-white text-emerald-600 font-semibold text-lg shadow-lg hover:bg-emerald-50">
        ← Back
      </button>
      <button onClick={handleNext} className="px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold text-lg shadow-lg hover:from-emerald-600 hover:to-teal-600">
        Next →
      </button>
    </div>
  </div>
);

// Page 3: Operating Expenses
const OperatingExpensesPage = ({ handlePrev, handleNext }: { handlePrev: () => void; handleNext: () => void }) => (
  <div className="max-w-5xl mx-auto pt-16">
    <motion.h2 className="text-4xl font-bold mb-4 text-center text-gray-800" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      Operating Expenses
    </motion.h2>
    <p className="text-center text-gray-600 mb-8 text-lg">The costs of running the business day-to-day</p>

    <div className="space-y-6 mb-8">
      <motion.div className="bg-white border-2 border-purple-200 rounded-3xl p-8 shadow-lg" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h3 className="text-2xl font-bold text-purple-800 mb-6">📋 Types of Operating Expenses</h3>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-purple-50 rounded-2xl p-6 border-2 border-purple-200">
            <h4 className="font-bold text-xl text-purple-900 mb-4">💼 SG&A (Selling, General & Administrative)</h4>
            <p className="text-gray-700 mb-4 leading-relaxed">
              The "overhead" costs of running the business that aren't directly tied to production.
            </p>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-purple-600 mt-1">▪</span>
                <span><span className="font-semibold">Selling:</span> Sales salaries, commissions, advertising, marketing campaigns</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 mt-1">▪</span>
                <span><span className="font-semibold">General:</span> Office rent, utilities, insurance, legal fees</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 mt-1">▪</span>
                <span><span className="font-semibold">Administrative:</span> Executive salaries, accounting, HR, IT support</span>
              </li>
            </ul>
          </div>

          <div className="bg-blue-50 rounded-2xl p-6 border-2 border-blue-200">
            <h4 className="font-bold text-xl text-blue-900 mb-4">🔬 R&D (Research & Development)</h4>
            <p className="text-gray-700 mb-4 leading-relaxed">
              Money spent developing new products, improving technology, and innovation.
            </p>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">▪</span>
                <span>Engineer and scientist salaries</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">▪</span>
                <span>Lab equipment and testing materials</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">▪</span>
                <span>Prototype development costs</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">▪</span>
                <span>Software development expenses</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-6 bg-orange-50 rounded-2xl p-6 border-2 border-orange-200">
          <h4 className="font-bold text-xl text-orange-900 mb-4">📉 Depreciation & Amortization</h4>
          <p className="text-gray-700 leading-relaxed">
            Spreading the cost of long-term assets over their useful life. <span className="font-bold">Important:</span> This is a non-cash expense — you're not actually paying money out, but it reduces profit on paper.
          </p>
          <div className="mt-4 bg-white rounded-lg p-4 border border-orange-200">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">Example:</span> Buy a $100,000 machine that lasts 10 years → Depreciate $10,000 per year as an expense, even though you paid $100,000 upfront.
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div className="bg-gradient-to-br from-teal-50 to-cyan-50 border-2 border-teal-300 rounded-3xl p-8 shadow-lg" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <h3 className="text-2xl font-bold text-teal-900 mb-6">🎯 Operating Income (EBIT)</h3>

        <div className="bg-white rounded-2xl p-6 border-2 border-teal-200 mb-6">
          <h4 className="font-bold text-lg text-gray-800 mb-4">Formula:</h4>
          <div className="text-center py-4">
            <p className="text-2xl font-bold text-gray-800">Operating Income = Gross Profit − Operating Expenses</p>
            <p className="text-gray-600 mt-2">(Also called EBIT: Earnings Before Interest and Taxes)</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border-2 border-teal-200">
          <h4 className="font-bold text-lg text-gray-800 mb-4">Real Example: Apple (Simplified)</h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center pb-2">
              <span className="text-gray-700">Revenue</span>
              <span className="font-bold text-emerald-700">$400,000M</span>
            </div>
            <div className="flex justify-between items-center border-t border-gray-200 pt-2 pb-2">
              <span className="text-gray-700">− COGS</span>
              <span className="font-bold text-red-700">−$220,000M</span>
            </div>
            <div className="flex justify-between items-center border-t border-emerald-500 pt-2 pb-2 bg-emerald-50 -mx-6 px-6">
              <span className="font-semibold text-gray-800">= Gross Profit</span>
              <span className="font-bold text-emerald-700">$180,000M</span>
            </div>
            <div className="flex justify-between items-center border-t border-gray-200 pt-2 pb-2">
              <span className="text-gray-700">− R&D</span>
              <span className="font-bold text-purple-700">−$30,000M</span>
            </div>
            <div className="flex justify-between items-center pb-2">
              <span className="text-gray-700">− SG&A</span>
              <span className="font-bold text-purple-700">−$30,000M</span>
            </div>
            <div className="flex justify-between items-center border-t-2 border-teal-500 pt-3 bg-teal-50 -mx-6 px-6">
              <span className="font-bold text-gray-900 text-lg">= Operating Income (EBIT)</span>
              <span className="font-bold text-2xl text-teal-700">$120,000M</span>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-teal-100 border-l-4 border-teal-600 rounded-lg p-4">
          <p className="text-teal-900 font-semibold mb-2">💡 Why EBIT Matters:</p>
          <p className="text-teal-800">
            EBIT shows profit from <span className="font-bold">core business operations</span>, before financing decisions (interest) and taxes. It's a pure measure of operational efficiency.
          </p>
        </div>
      </motion.div>
    </div>

    <div className="flex justify-center gap-4 pb-12">
      <button onClick={handlePrev} className="px-8 py-4 rounded-2xl border-2 border-emerald-400 bg-white text-emerald-600 font-semibold text-lg shadow-lg hover:bg-emerald-50">
        ← Back
      </button>
      <button onClick={handleNext} className="px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold text-lg shadow-lg hover:from-emerald-600 hover:to-teal-600">
        Next →
      </button>
    </div>
  </div>
);

// Page 4: Net Income
const NetIncomePage = ({ handlePrev, handleNext }: { handlePrev: () => void; handleNext: () => void }) => (
  <div className="max-w-5xl mx-auto pt-16">
    <motion.h2 className="text-4xl font-bold mb-4 text-center text-gray-800" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      Net Income: The Bottom Line
    </motion.h2>
    <p className="text-center text-gray-600 mb-8 text-lg">Final profit after all expenses, interest, and taxes</p>

    <div className="space-y-6 mb-8">
      <motion.div className="bg-white border-2 border-indigo-200 rounded-3xl p-8 shadow-lg" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h3 className="text-2xl font-bold text-indigo-800 mb-6">🏆 The Complete Income Statement</h3>

        <div className="bg-gradient-to-br from-gray-50 to-indigo-50 rounded-2xl p-6 border-2 border-indigo-200">
          <div className="space-y-3 text-lg">
            <div className="flex justify-between items-center pb-3">
              <span className="text-gray-700 font-semibold">Revenue</span>
              <span className="font-bold text-emerald-700">$1,000,000</span>
            </div>
            <div className="flex justify-between items-center border-t border-gray-300 pt-3 pb-3">
              <span className="text-gray-700">− COGS</span>
              <span className="font-bold text-red-700">−$400,000</span>
            </div>
            <div className="flex justify-between items-center border-t border-emerald-400 pt-3 pb-3 bg-emerald-50 -mx-6 px-6">
              <span className="font-bold text-gray-800">= Gross Profit</span>
              <span className="font-bold text-emerald-700">$600,000</span>
            </div>
            <div className="flex justify-between items-center border-t border-gray-300 pt-3 pb-2">
              <span className="text-gray-700">− Operating Expenses</span>
              <span className="font-bold text-purple-700">−$350,000</span>
            </div>
            <div className="flex justify-between items-center border-t border-teal-400 pt-3 pb-3 bg-teal-50 -mx-6 px-6">
              <span className="font-bold text-gray-800">= Operating Income (EBIT)</span>
              <span className="font-bold text-teal-700">$250,000</span>
            </div>
            <div className="flex justify-between items-center border-t border-gray-300 pt-3 pb-2">
              <span className="text-gray-700">− Interest Expense</span>
              <span className="font-bold text-orange-700">−$30,000</span>
            </div>
            <div className="flex justify-between items-center pb-2">
              <span className="text-gray-700">− Income Tax (25%)</span>
              <span className="font-bold text-orange-700">−$55,000</span>
            </div>
            <div className="flex justify-between items-center border-t-2 border-indigo-500 pt-4 bg-indigo-100 -mx-6 px-6">
              <span className="font-bold text-gray-900 text-xl">= Net Income</span>
              <span className="font-bold text-3xl text-indigo-700">$165,000</span>
            </div>
          </div>
        </div>

        <div className="mt-6 grid md:grid-cols-2 gap-4">
          <div className="bg-orange-50 rounded-xl p-4 border-2 border-orange-200">
            <h4 className="font-semibold text-orange-900 mb-2">💰 Interest Expense</h4>
            <p className="text-sm text-gray-700">Cost of borrowing money. The more debt, the higher the interest expense.</p>
          </div>
          <div className="bg-red-50 rounded-xl p-4 border-2 border-red-200">
            <h4 className="font-semibold text-red-900 mb-2">🏛️ Income Tax</h4>
            <p className="text-sm text-gray-700">Tax on profits. Varies by country and tax structure (often 20-30%).</p>
          </div>
        </div>
      </motion.div>

      <motion.div className="bg-white border-2 border-blue-200 rounded-3xl p-8 shadow-lg" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <h3 className="text-2xl font-bold text-blue-800 mb-6">📊 Profit Margins</h3>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              title: "Gross Margin",
              formula: "Gross Profit ÷ Revenue",
              example: "$600K ÷ $1M = 60%",
              meaning: "For every $1 of revenue, $0.60 is left after COGS",
              color: "emerald"
            },
            {
              title: "Operating Margin",
              formula: "Operating Income ÷ Revenue",
              example: "$250K ÷ $1M = 25%",
              meaning: "For every $1 of revenue, $0.25 is profit from operations",
              color: "teal"
            },
            {
              title: "Net Margin",
              formula: "Net Income ÷ Revenue",
              example: "$165K ÷ $1M = 16.5%",
              meaning: "For every $1 of revenue, $0.165 is final profit",
              color: "indigo"
            }
          ].map((margin, idx) => (
            <motion.div
              key={idx}
              className={`bg-${margin.color}-50 rounded-2xl p-5 border-2 border-${margin.color}-200`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + idx * 0.1 }}
            >
              <h4 className="font-bold text-lg text-gray-800 mb-3">{margin.title}</h4>
              <div className="bg-white rounded-lg p-3 mb-3 border border-gray-200">
                <p className="text-sm text-gray-600 mb-1">Formula:</p>
                <p className="font-mono font-bold text-gray-800">{margin.formula}</p>
              </div>
              <div className="bg-white rounded-lg p-3 mb-3 border border-gray-200">
                <p className="text-sm text-gray-600 mb-1">Example:</p>
                <p className={`font-bold text-${margin.color}-700`}>{margin.example}</p>
              </div>
              <p className="text-xs text-gray-600 italic">{margin.meaning}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div className="bg-white border-2 border-violet-200 rounded-3xl p-8 shadow-lg" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <h3 className="text-2xl font-bold text-violet-800 mb-6">📈 EPS (Earnings Per Share)</h3>

        <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-2xl p-6 border-2 border-violet-200">
          <div className="text-center mb-6">
            <p className="text-gray-600 mb-2">Formula:</p>
            <p className="text-3xl font-bold text-violet-700">EPS = Net Income ÷ Shares Outstanding</p>
          </div>

          <div className="bg-white rounded-xl p-6 border-2 border-violet-200">
            <h4 className="font-bold text-lg text-gray-800 mb-4">Example:</h4>
            <div className="space-y-2 mb-4">
              <p className="text-gray-700">Net Income: <span className="font-bold text-indigo-700">$165,000</span></p>
              <p className="text-gray-700">Shares Outstanding: <span className="font-bold text-indigo-700">100,000</span></p>
            </div>
            <div className="border-t-2 border-violet-500 pt-4">
              <p className="text-gray-700">EPS = $165,000 ÷ 100,000 = <span className="font-bold text-2xl text-violet-700">$1.65 per share</span></p>
            </div>
          </div>

          <div className="mt-6 bg-violet-100 border-l-4 border-violet-600 rounded-lg p-4">
            <p className="text-violet-900 font-semibold mb-2">💡 Why Investors Care:</p>
            <p className="text-violet-800">
              EPS shows how much profit each share earns. Higher EPS = more valuable stock. Investors compare EPS growth over time and across companies.
            </p>
          </div>
        </div>
      </motion.div>
    </div>

    <div className="flex justify-center gap-4 pb-12">
      <button onClick={handlePrev} className="px-8 py-4 rounded-2xl border-2 border-emerald-400 bg-white text-emerald-600 font-semibold text-lg shadow-lg hover:bg-emerald-50">
        ← Back
      </button>
      <button onClick={handleNext} className="px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold text-lg shadow-lg hover:from-emerald-600 hover:to-teal-600">
        Next →
      </button>
    </div>
  </div>
);

// Page 5: Case Study
const CaseStudyPage = ({ handlePrev, handleNext }: { handlePrev: () => void; handleNext: () => void }) => (
  <div className="max-w-5xl mx-auto pt-16">
    <motion.h2 className="text-4xl font-bold mb-4 text-center text-gray-800" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      Case Study: Profitable but Broke
    </motion.h2>
    <p className="text-center text-gray-600 mb-8 text-lg">How a company can have strong net income but still run out of cash</p>

    <div className="space-y-6 mb-8">
      <motion.div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-300 rounded-3xl p-8 shadow-lg" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h3 className="text-2xl font-bold text-amber-900 mb-6">⚠️ The Scenario</h3>

        <div className="bg-white rounded-2xl p-6 border-2 border-amber-200 mb-6">
          <h4 className="font-bold text-xl text-gray-800 mb-4">TechGrow Inc. - Year 1 Income Statement</h4>
          <div className="space-y-2 text-lg">
            <div className="flex justify-between items-center pb-2">
              <span className="text-gray-700">Revenue</span>
              <span className="font-bold text-emerald-700">$5,000,000</span>
            </div>
            <div className="flex justify-between items-center border-t border-gray-200 pt-2 pb-2">
              <span className="text-gray-700">− COGS</span>
              <span className="font-bold text-red-700">−$2,000,000</span>
            </div>
            <div className="flex justify-between items-center border-t border-gray-200 pt-2 pb-2">
              <span className="text-gray-700">− Operating Expenses</span>
              <span className="font-bold text-purple-700">−$2,000,000</span>
            </div>
            <div className="flex justify-between items-center border-t border-gray-200 pt-2 pb-2">
              <span className="text-gray-700">− Interest & Taxes</span>
              <span className="font-bold text-orange-700">−$500,000</span>
            </div>
            <div className="flex justify-between items-center border-t-2 border-emerald-500 pt-3 bg-emerald-50 -mx-6 px-6">
              <span className="font-bold text-gray-900 text-xl">= Net Income</span>
              <span className="font-bold text-2xl text-emerald-700">$500,000</span>
            </div>
          </div>
          <div className="mt-4 text-center">
            <span className="inline-block bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full font-bold">
              ✓ Profitable! 10% net margin
            </span>
          </div>
        </div>

        <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-6">
          <h4 className="font-bold text-xl text-red-900 mb-4">❌ But here's the problem...</h4>
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-4 border-l-4 border-red-500">
              <p className="font-semibold text-gray-800 mb-2">1. Customers pay slowly (90-day terms)</p>
              <p className="text-sm text-gray-600">$3M in revenue is still "Accounts Receivable" — not cash yet!</p>
            </div>
            <div className="bg-white rounded-lg p-4 border-l-4 border-red-500">
              <p className="font-semibold text-gray-800 mb-2">2. Built inventory for growth</p>
              <p className="text-sm text-gray-600">Spent $1.5M cash on inventory that hasn't sold yet</p>
            </div>
            <div className="bg-white rounded-lg p-4 border-l-4 border-red-500">
              <p className="font-semibold text-gray-800 mb-2">3. Bought equipment ($2M)</p>
              <p className="text-sm text-gray-600">Cash outflow, but only $200K/year shows as depreciation expense</p>
            </div>
            <div className="bg-white rounded-lg p-4 border-l-4 border-red-500">
              <p className="font-semibold text-gray-800 mb-2">4. Loan payment due ($500K)</p>
              <p className="text-sm text-gray-600">Principal repayment doesn't appear on income statement!</p>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div className="bg-gradient-to-br from-red-50 to-pink-50 border-2 border-red-300 rounded-3xl p-8 shadow-lg" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <h3 className="text-2xl font-bold text-red-900 mb-6">💔 The Outcome</h3>

        <div className="bg-white rounded-2xl p-6 border-2 border-red-200">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-emerald-50 rounded-xl p-5 border-2 border-emerald-300">
              <h4 className="font-bold text-emerald-900 mb-3 text-lg">Income Statement</h4>
              <p className="text-3xl font-bold text-emerald-700 mb-2">$500K</p>
              <p className="text-sm text-emerald-800">Net Income ✓</p>
            </div>
            <div className="bg-red-50 rounded-xl p-5 border-2 border-red-300">
              <h4 className="font-bold text-red-900 mb-3 text-lg">Bank Account</h4>
              <p className="text-3xl font-bold text-red-700 mb-2">$0</p>
              <p className="text-sm text-red-800">No Cash ✗</p>
            </div>
          </div>

          <div className="mt-6 bg-red-100 border-l-4 border-red-600 rounded-lg p-5">
            <p className="text-red-900 font-bold text-lg mb-2">The company is profitable on paper but can't pay bills!</p>
            <p className="text-red-800">
              This is why the <span className="font-bold">Cash Flow Statement</span> (Module 4) is crucial. Profit ≠ Cash.
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div className="bg-white border-2 border-indigo-200 rounded-3xl p-8 shadow-lg" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <h3 className="text-2xl font-bold text-indigo-800 mb-6">🚩 Common Income Statement Red Flags</h3>

        <div className="grid md:grid-cols-2 gap-4">
          {[
            { flag: "Declining Gross Margin", danger: "COGS rising faster than revenue — pricing power or efficiency problems", icon: "📉" },
            { flag: "Revenue Growth but Profit Shrinking", danger: "Spending too much to grow — unsustainable business model", icon: "⚠️" },
            { flag: "Huge One-Time Gains", danger: "Net income boosted by selling assets, not operations — not repeatable", icon: "🎭" },
            { flag: "Rising SG&A as % of Revenue", danger: "Overhead growing faster than sales — bloated operations", icon: "💸" },
            { flag: "High Depreciation", danger: "Lots of aging equipment — might need major capital expenditures soon", icon: "🏚️" },
            { flag: "Negative Net Income for Years", danger: "Burning cash with no path to profitability — risky investment", icon: "🔥" }
          ].map((item, idx) => (
            <motion.div
              key={idx}
              className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-5 border-2 border-red-200"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + idx * 0.1 }}
            >
              <div className="flex items-start gap-3">
                <span className="text-3xl">{item.icon}</span>
                <div>
                  <h4 className="font-bold text-red-900 mb-2">{item.flag}</h4>
                  <p className="text-sm text-gray-700">{item.danger}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-l-4 border-emerald-500 p-6 rounded-2xl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
        <p className="text-emerald-900 text-lg">
          <span className="font-bold">Key Takeaway:</span> The income statement tells you if the business is profitable, but you also need the balance sheet (assets/liabilities) and cash flow statement (actual cash movements) to see the full financial picture!
        </p>
      </motion.div>
    </div>

    <div className="flex justify-center gap-4 pb-12">
      <button onClick={handlePrev} className="px-8 py-4 rounded-2xl border-2 border-emerald-400 bg-white text-emerald-600 font-semibold text-lg shadow-lg hover:bg-emerald-50">
        ← Back
      </button>
      <button onClick={handleNext} className="px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold text-lg shadow-lg hover:from-emerald-600 hover:to-teal-600">
        Play Game →
      </button>
    </div>
  </div>
);

// Game 1: CEO Simulator
interface CEOSimulatorProps {
  handlePrev: () => void;
  handleNext: () => void;
}

const CEOSimulator = ({ handlePrev, handleNext }: CEOSimulatorProps) => {
  const [currentQuarter, setCurrentQuarter] = useState(0);
  const [decisions, setDecisions] = useState<string[]>([]);
  const [gameCompleted, setGameCompleted] = useState(false);

  // Starting income statement
  const [incomeStatement, setIncomeStatement] = useState({
    revenue: 1000000,
    cogs: 400000,
    sgaExpenses: 200000,
    rdExpenses: 100000,
    interestExpense: 20000,
    taxRate: 0.25
  });

  const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];

  const decisionOptions = [
    {
      id: 'hire-sales',
      label: '👥 Hire 5 Salespeople',
      description: 'Increase revenue by 15%, but SG&A costs go up by $50K',
      impact: { revenue: 1.15, sgaExpenses: 50000 }
    },
    {
      id: 'marketing',
      label: '📢 Launch Marketing Campaign',
      description: 'Boost revenue by 20%, marketing costs $80K',
      impact: { revenue: 1.20, sgaExpenses: 80000 }
    },
    {
      id: 'cut-costs',
      label: '✂️ Cut Operating Costs',
      description: 'Reduce SG&A by $60K, but revenue drops 5%',
      impact: { revenue: 0.95, sgaExpenses: -60000 }
    },
    {
      id: 'expand-rd',
      label: '🔬 Invest in R&D',
      description: 'Future growth potential, R&D costs up $40K',
      impact: { rdExpenses: 40000 }
    },
    {
      id: 'optimize',
      label: '⚙️ Optimize Production',
      description: 'Reduce COGS by 10%, one-time cost of $30K',
      impact: { cogs: 0.90, sgaExpenses: 30000 }
    }
  ];

  const calculateMetrics = (statement: typeof incomeStatement) => {
    const grossProfit = statement.revenue - statement.cogs;
    const operatingIncome = grossProfit - statement.sgaExpenses - statement.rdExpenses;
    const incomeBeforeTax = operatingIncome - statement.interestExpense;
    const taxExpense = Math.max(0, incomeBeforeTax * statement.taxRate);
    const netIncome = incomeBeforeTax - taxExpense;

    const grossMargin = (grossProfit / statement.revenue) * 100;
    const operatingMargin = (operatingIncome / statement.revenue) * 100;
    const netMargin = (netIncome / statement.revenue) * 100;

    return {
      grossProfit,
      operatingIncome,
      incomeBeforeTax,
      taxExpense,
      netIncome,
      grossMargin,
      operatingMargin,
      netMargin
    };
  };

  const currentMetrics = calculateMetrics(incomeStatement);

  const handleDecision = (decision: typeof decisionOptions[0]) => {
    const newStatement = { ...incomeStatement };

    if (decision.impact.revenue) {
      newStatement.revenue = Math.round(newStatement.revenue * decision.impact.revenue);
    }
    if (decision.impact.cogs !== undefined) {
      if (decision.impact.cogs < 1) {
        newStatement.cogs = Math.round(newStatement.cogs * decision.impact.cogs);
      } else {
        newStatement.cogs += decision.impact.cogs;
      }
    }
    if (decision.impact.sgaExpenses !== undefined) {
      newStatement.sgaExpenses += decision.impact.sgaExpenses;
    }
    if (decision.impact.rdExpenses !== undefined) {
      newStatement.rdExpenses += decision.impact.rdExpenses;
    }

    setIncomeStatement(newStatement);
    setDecisions([...decisions, decision.id]);

    if (currentQuarter < 3) {
      setCurrentQuarter(currentQuarter + 1);
    } else {
      setGameCompleted(true);
    }
  };

  const finalScore = gameCompleted ? Math.round(currentMetrics.netMargin * 10) : 0;

  return (
    <div className="max-w-6xl mx-auto pt-16">
      <motion.h2 className="text-4xl font-bold mb-4 text-center text-gray-800" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        🎮 CEO Simulator
      </motion.h2>
      <p className="text-center text-gray-600 mb-8 text-lg">Run your business for 4 quarters. Watch how each decision impacts the income statement!</p>

      {!gameCompleted ? (
        <>
          <div className="flex justify-center mb-6">
            <div className="bg-white/90 backdrop-blur-md px-6 py-2 rounded-full shadow-md border-2 border-emerald-200">
              <span className="text-emerald-600 font-bold text-lg">
                {quarters[currentQuarter]} - Year 1
              </span>
            </div>
          </div>

          {/* Current Income Statement */}
          <motion.div
            key={currentQuarter}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border-2 border-emerald-200 rounded-3xl p-8 mb-8 shadow-lg"
          >
            <h3 className="text-2xl font-bold text-emerald-900 mb-6 text-center">Current Income Statement</h3>

            <div className="space-y-3 text-lg max-w-2xl mx-auto">
              <div className="flex justify-between items-center pb-2">
                <span className="text-gray-700">Revenue</span>
                <span className="font-bold text-emerald-700">${(incomeStatement.revenue / 1000).toFixed(0)}K</span>
              </div>
              <div className="flex justify-between items-center border-t border-gray-200 pt-2 pb-2">
                <span className="text-gray-700">− COGS</span>
                <span className="font-bold text-red-700">−${(incomeStatement.cogs / 1000).toFixed(0)}K</span>
              </div>
              <div className="flex justify-between items-center border-t border-emerald-400 pt-2 pb-2 bg-emerald-50 -mx-8 px-8">
                <span className="font-semibold text-gray-800">= Gross Profit</span>
                <span className="font-bold text-emerald-700">${(currentMetrics.grossProfit / 1000).toFixed(0)}K ({currentMetrics.grossMargin.toFixed(1)}%)</span>
              </div>
              <div className="flex justify-between items-center border-t border-gray-200 pt-2 pb-2">
                <span className="text-gray-700">− SG&A</span>
                <span className="font-bold text-purple-700">−${(incomeStatement.sgaExpenses / 1000).toFixed(0)}K</span>
              </div>
              <div className="flex justify-between items-center pb-2">
                <span className="text-gray-700">− R&D</span>
                <span className="font-bold text-purple-700">−${(incomeStatement.rdExpenses / 1000).toFixed(0)}K</span>
              </div>
              <div className="flex justify-between items-center border-t border-teal-400 pt-2 pb-2 bg-teal-50 -mx-8 px-8">
                <span className="font-semibold text-gray-800">= Operating Income</span>
                <span className="font-bold text-teal-700">${(currentMetrics.operatingIncome / 1000).toFixed(0)}K ({currentMetrics.operatingMargin.toFixed(1)}%)</span>
              </div>
              <div className="flex justify-between items-center border-t border-gray-200 pt-2 pb-2">
                <span className="text-gray-700">− Interest</span>
                <span className="font-bold text-orange-700">−${(incomeStatement.interestExpense / 1000).toFixed(0)}K</span>
              </div>
              <div className="flex justify-between items-center pb-2">
                <span className="text-gray-700">− Tax ({(incomeStatement.taxRate * 100).toFixed(0)}%)</span>
                <span className="font-bold text-orange-700">−${(currentMetrics.taxExpense / 1000).toFixed(0)}K</span>
              </div>
              <div className="flex justify-between items-center border-t-2 border-indigo-500 pt-3 bg-indigo-50 -mx-8 px-8">
                <span className="font-bold text-gray-900 text-xl">= Net Income</span>
                <span className="font-bold text-2xl text-indigo-700">${(currentMetrics.netIncome / 1000).toFixed(0)}K ({currentMetrics.netMargin.toFixed(1)}%)</span>
              </div>
            </div>
          </motion.div>

          {/* Decision Options */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-3xl p-8 mb-8"
          >
            <h3 className="text-2xl font-bold text-emerald-900 mb-6 text-center">Make Your Decision for {quarters[currentQuarter]}</h3>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {decisionOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleDecision(option)}
                  className="bg-white border-2 border-emerald-200 rounded-2xl p-6 text-left hover:border-emerald-500 hover:shadow-lg transition-all"
                >
                  <div className="text-3xl mb-3">{option.label.split(' ')[0]}</div>
                  <h4 className="font-bold text-lg text-gray-800 mb-2">{option.label.substring(option.label.indexOf(' ') + 1)}</h4>
                  <p className="text-sm text-gray-600">{option.description}</p>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Progress */}
          <div className="flex justify-center gap-2 mb-8">
            {quarters.map((q, idx) => (
              <div
                key={idx}
                className={`px-4 py-2 rounded-lg font-semibold ${
                  idx < currentQuarter
                    ? 'bg-emerald-500 text-white'
                    : idx === currentQuarter
                      ? 'bg-emerald-600 text-white shadow-lg'
                      : 'bg-gray-200 text-gray-500'
                }`}
              >
                {q}
              </div>
            ))}
          </div>
        </>
      ) : (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white border-2 border-emerald-200 rounded-3xl p-12 text-center mb-6 shadow-xl"
        >
          <div className={`w-32 h-32 mx-auto rounded-full flex items-center justify-center mb-6 shadow-2xl ${currentMetrics.netMargin >= 20 ? 'bg-emerald-500' : 'bg-teal-500'}`}>
            <span className="text-6xl">{currentMetrics.netMargin >= 20 ? '🏆' : '📊'}</span>
          </div>

          <h3 className="text-4xl font-black text-gray-900 mb-4">Year Complete!</h3>
          <div className="text-6xl font-black text-emerald-600 mb-6">{currentMetrics.netMargin.toFixed(1)}% Net Margin</div>

          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-2xl p-6 mb-8">
            <h4 className="font-bold text-lg text-gray-800 mb-4">Final Year Results</h4>
            <div className="grid md:grid-cols-3 gap-4 text-left">
              <div className="bg-white rounded-xl p-4">
                <p className="text-sm text-gray-600 mb-1">Revenue</p>
                <p className="text-2xl font-bold text-emerald-700">${(incomeStatement.revenue / 1000).toFixed(0)}K</p>
              </div>
              <div className="bg-white rounded-xl p-4">
                <p className="text-sm text-gray-600 mb-1">Net Income</p>
                <p className="text-2xl font-bold text-indigo-700">${(currentMetrics.netIncome / 1000).toFixed(0)}K</p>
              </div>
              <div className="bg-white rounded-xl p-4">
                <p className="text-sm text-gray-600 mb-1">Gross Margin</p>
                <p className="text-2xl font-bold text-teal-700">{currentMetrics.grossMargin.toFixed(1)}%</p>
              </div>
            </div>
          </div>

          <div className={`inline-block px-8 py-3 rounded-full font-bold text-lg mb-8 ${currentMetrics.netMargin >= 20 ? 'bg-emerald-100 text-emerald-800' : 'bg-teal-100 text-teal-800'}`}>
            {currentMetrics.netMargin >= 25 ? '🌟 Excellent CEO!' : currentMetrics.netMargin >= 20 ? '💼 Strong Performance!' : currentMetrics.netMargin >= 15 ? '📈 Good Work!' : '📚 Keep Learning!'}
          </div>

          <p className="text-gray-600 mb-6">
            You made strategic decisions that {currentMetrics.netMargin >= 20 ? 'significantly improved' : 'impacted'} the company's profitability!
          </p>
        </motion.div>
      )}

      <div className="flex justify-center gap-4 pb-12">
        <button onClick={handlePrev} className="px-8 py-4 rounded-2xl border-2 border-emerald-400 bg-white text-emerald-600 font-semibold text-lg shadow-lg hover:bg-emerald-50">
          ← Back
        </button>
        {gameCompleted && (
          <button onClick={handleNext} className="px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold text-lg shadow-lg hover:from-emerald-600 hover:to-teal-600">
            Next Game →
          </button>
        )}
      </div>
    </div>
  );
};

// Game 2: Profit Margin Calculator
interface ProfitMarginCalculatorProps {
  handlePrev: () => void;
  handleNext: () => void;
}

const ProfitMarginCalculator = ({ handlePrev, handleNext }: ProfitMarginCalculatorProps) => {
  const companies = [
    {
      name: 'TechCorp',
      revenue: 5000000,
      cogs: 2000000,
      opex: 1500000,
      correctCategory: 'healthy'
    },
    {
      name: 'RetailMart',
      revenue: 10000000,
      cogs: 8000000,
      opex: 1800000,
      correctCategory: 'struggling'
    },
    {
      name: 'SoftwarePro',
      revenue: 3000000,
      cogs: 600000,
      opex: 1200000,
      correctCategory: 'healthy'
    },
    {
      name: 'ManufacturingCo',
      revenue: 8000000,
      cogs: 6500000,
      opex: 1200000,
      correctCategory: 'struggling'
    },
    {
      name: 'ConsultingFirm',
      revenue: 2000000,
      cogs: 400000,
      opex: 800000,
      correctCategory: 'healthy'
    }
  ];

  const [currentCompanyIndex, setCurrentCompanyIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<{ grossMargin: string; netMargin: string; category: string }[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);

  const currentCompany = companies[currentCompanyIndex];

  const calculateCorrectMargins = (company: typeof companies[0]) => {
    const grossProfit = company.revenue - company.cogs;
    const netIncome = grossProfit - company.opex;
    const grossMargin = (grossProfit / company.revenue) * 100;
    const netMargin = (netIncome / company.revenue) * 100;
    return { grossMargin, netMargin, grossProfit, netIncome };
  };

  const correctMetrics = calculateCorrectMargins(currentCompany);

  const handleSubmit = (grossMargin: string, netMargin: string, category: string) => {
    const isGrossCorrect = Math.abs(parseFloat(grossMargin) - correctMetrics.grossMargin) < 1;
    const isNetCorrect = Math.abs(parseFloat(netMargin) - correctMetrics.netMargin) < 1;
    const isCategoryCorrect = category === currentCompany.correctCategory;

    setUserAnswers([...userAnswers, { grossMargin, netMargin, category }]);
    setShowResult(true);
  };

  const handleNextCompany = () => {
    if (currentCompanyIndex < companies.length - 1) {
      setCurrentCompanyIndex(currentCompanyIndex + 1);
      setShowResult(false);
    } else {
      setGameCompleted(true);
    }
  };

  const score = userAnswers.filter((answer, idx) => {
    const company = companies[idx];
    const metrics = calculateCorrectMargins(company);
    const isGrossCorrect = Math.abs(parseFloat(answer.grossMargin) - metrics.grossMargin) < 1;
    const isNetCorrect = Math.abs(parseFloat(answer.netMargin) - metrics.netMargin) < 1;
    const isCategoryCorrect = answer.category === company.correctCategory;
    return isGrossCorrect && isNetCorrect && isCategoryCorrect;
  }).length;

  const [grossInput, setGrossInput] = useState('');
  const [netInput, setNetInput] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  return (
    <div className="max-w-5xl mx-auto pt-16">
      <motion.h2 className="text-4xl font-bold mb-4 text-center text-gray-800" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        🧮 Profit Margin Calculator
      </motion.h2>
      <p className="text-center text-gray-600 mb-8 text-lg">Calculate margins and categorize companies as healthy or struggling!</p>

      {!gameCompleted ? (
        <>
          <div className="flex justify-center mb-6">
            <div className="bg-white/90 backdrop-blur-md px-6 py-2 rounded-full shadow-md border-2 border-emerald-200">
              <span className="text-emerald-600 font-bold">
                Company {currentCompanyIndex + 1} of {companies.length}
              </span>
            </div>
          </div>

          <motion.div
            key={currentCompanyIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white border-2 border-emerald-200 rounded-3xl p-8 mb-6 shadow-lg"
          >
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white p-6 rounded-2xl mb-6">
              <h3 className="text-3xl font-bold mb-2">{currentCompany.name}</h3>
              <p className="text-emerald-100">Financial Data</p>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <div className="bg-emerald-50 rounded-xl p-5 border-2 border-emerald-200">
                <p className="text-sm text-gray-600 mb-1">Revenue</p>
                <p className="text-3xl font-bold text-emerald-700">${(currentCompany.revenue / 1000000).toFixed(1)}M</p>
              </div>
              <div className="bg-red-50 rounded-xl p-5 border-2 border-red-200">
                <p className="text-sm text-gray-600 mb-1">COGS</p>
                <p className="text-3xl font-bold text-red-700">${(currentCompany.cogs / 1000000).toFixed(1)}M</p>
              </div>
              <div className="bg-purple-50 rounded-xl p-5 border-2 border-purple-200">
                <p className="text-sm text-gray-600 mb-1">Operating Expenses</p>
                <p className="text-3xl font-bold text-purple-700">${(currentCompany.opex / 1000000).toFixed(1)}M</p>
              </div>
            </div>

            {!showResult ? (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-3">Gross Margin %</label>
                    <div className="bg-emerald-50 rounded-xl p-4 mb-3 border border-emerald-200">
                      <p className="text-sm text-gray-600 mb-1">Formula:</p>
                      <p className="font-mono text-sm font-bold text-gray-800">(Revenue − COGS) ÷ Revenue × 100</p>
                    </div>
                    <input
                      type="number"
                      step="0.1"
                      value={grossInput}
                      onChange={(e) => setGrossInput(e.target.value)}
                      placeholder="Enter %"
                      className="w-full px-6 py-4 border-2 border-emerald-300 rounded-xl text-lg font-semibold focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-3">Net Margin %</label>
                    <div className="bg-indigo-50 rounded-xl p-4 mb-3 border border-indigo-200">
                      <p className="text-sm text-gray-600 mb-1">Formula:</p>
                      <p className="font-mono text-sm font-bold text-gray-800">(Rev − COGS − OpEx) ÷ Rev × 100</p>
                    </div>
                    <input
                      type="number"
                      step="0.1"
                      value={netInput}
                      onChange={(e) => setNetInput(e.target.value)}
                      placeholder="Enter %"
                      className="w-full px-6 py-4 border-2 border-indigo-300 rounded-xl text-lg font-semibold focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-3">Categorize this company:</label>
                  <div className="grid md:grid-cols-2 gap-4">
                    <button
                      onClick={() => setSelectedCategory('healthy')}
                      className={`p-6 rounded-2xl border-2 font-bold text-lg transition-all ${
                        selectedCategory === 'healthy'
                          ? 'bg-emerald-500 text-white border-emerald-600 shadow-lg'
                          : 'bg-white text-gray-700 border-emerald-200 hover:border-emerald-400'
                      }`}
                    >
                      ✅ Healthy (Good margins)
                    </button>
                    <button
                      onClick={() => setSelectedCategory('struggling')}
                      className={`p-6 rounded-2xl border-2 font-bold text-lg transition-all ${
                        selectedCategory === 'struggling'
                          ? 'bg-red-500 text-white border-red-600 shadow-lg'
                          : 'bg-white text-gray-700 border-red-200 hover:border-red-400'
                      }`}
                    >
                      ⚠️ Struggling (Low margins)
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => handleSubmit(grossInput, netInput, selectedCategory)}
                  disabled={!grossInput || !netInput || !selectedCategory}
                  className="w-full px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-bold text-lg hover:from-emerald-600 hover:to-teal-600 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  Submit Answer
                </button>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {(() => {
                  const userGrossMargin = parseFloat(grossInput);
                  const userNetMargin = parseFloat(netInput);
                  const isGrossCorrect = Math.abs(userGrossMargin - correctMetrics.grossMargin) < 1;
                  const isNetCorrect = Math.abs(userNetMargin - correctMetrics.netMargin) < 1;
                  const isCategoryCorrect = selectedCategory === currentCompany.correctCategory;
                  const allCorrect = isGrossCorrect && isNetCorrect && isCategoryCorrect;

                  return (
                    <>
                      {/* User's Answer Result */}
                      <div className={`${allCorrect ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'} border-2 rounded-2xl p-6 mb-4`}>
                        <div className="flex items-start gap-4 mb-4">
                          <span className={`text-4xl ${allCorrect ? 'text-green-600' : 'text-red-600'}`}>
                            {allCorrect ? '✓' : '✗'}
                          </span>
                          <div className="flex-1">
                            <h4 className={`font-bold text-xl mb-2 ${allCorrect ? 'text-green-900' : 'text-red-900'}`}>
                              {allCorrect ? 'Perfect! All Correct!' : 'Not Quite Right'}
                            </h4>
                            <p className={`text-sm ${allCorrect ? 'text-green-800' : 'text-red-800'}`}>
                              {allCorrect
                                ? 'You correctly calculated both margins and categorized the company!'
                                : 'Let\'s review your answers compared to the correct values below.'}
                            </p>
                          </div>
                        </div>

                        {/* Show what user answered */}
                        <div className="bg-white rounded-xl p-4 border-2 border-gray-200">
                          <h5 className="font-semibold text-gray-800 mb-3">Your Answers:</h5>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-700">Gross Margin</span>
                              <span className={`font-bold ${isGrossCorrect ? 'text-green-700' : 'text-red-700'}`}>
                                {userGrossMargin.toFixed(1)}% {isGrossCorrect ? '✓' : '✗'}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-700">Net Margin</span>
                              <span className={`font-bold ${isNetCorrect ? 'text-green-700' : 'text-red-700'}`}>
                                {userNetMargin.toFixed(1)}% {isNetCorrect ? '✓' : '✗'}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-700">Category</span>
                              <span className={`font-bold ${isCategoryCorrect ? 'text-green-700' : 'text-red-700'}`}>
                                {selectedCategory === 'healthy' ? '✅ Healthy' : '⚠️ Struggling'} {isCategoryCorrect ? '✓' : '✗'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Correct Answers */}
                      <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-6">
                        <h4 className="font-bold text-xl text-emerald-900 mb-4">✓ Correct Answers & Calculations:</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-700">Gross Profit</span>
                            <span className="font-bold text-emerald-700">${(correctMetrics.grossProfit / 1000000).toFixed(2)}M</span>
                          </div>
                          <div className="bg-white rounded-lg p-3 border border-emerald-200">
                            <p className="text-sm text-gray-600 mb-1">Calculation:</p>
                            <p className="text-sm font-mono text-gray-800">
                              ${(currentCompany.revenue / 1000000).toFixed(1)}M - ${(currentCompany.cogs / 1000000).toFixed(1)}M = ${(correctMetrics.grossProfit / 1000000).toFixed(2)}M
                            </p>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-700 font-semibold">Gross Margin</span>
                            <span className="font-bold text-xl text-emerald-700">{correctMetrics.grossMargin.toFixed(1)}%</span>
                          </div>

                          <div className="border-t border-emerald-300 pt-3 mt-3"></div>

                          <div className="flex justify-between items-center">
                            <span className="text-gray-700">Net Income</span>
                            <span className="font-bold text-indigo-700">${(correctMetrics.netIncome / 1000000).toFixed(2)}M</span>
                          </div>
                          <div className="bg-white rounded-lg p-3 border border-indigo-200">
                            <p className="text-sm text-gray-600 mb-1">Calculation:</p>
                            <p className="text-sm font-mono text-gray-800">
                              ${(correctMetrics.grossProfit / 1000000).toFixed(2)}M - ${(currentCompany.opex / 1000000).toFixed(1)}M = ${(correctMetrics.netIncome / 1000000).toFixed(2)}M
                            </p>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-700 font-semibold">Net Margin</span>
                            <span className="font-bold text-xl text-indigo-700">{correctMetrics.netMargin.toFixed(1)}%</span>
                          </div>

                          <div className="border-t border-emerald-300 pt-3 mt-3"></div>

                          <div className="flex justify-between items-center">
                            <span className="text-gray-700 font-semibold">Category</span>
                            <span className={`font-bold text-lg ${currentCompany.correctCategory === 'healthy' ? 'text-emerald-700' : 'text-red-700'}`}>
                              {currentCompany.correctCategory === 'healthy' ? '✅ Healthy' : '⚠️ Struggling'}
                            </span>
                          </div>
                          <div className="bg-white rounded-lg p-3 border border-gray-200">
                            <p className="text-sm text-gray-700">
                              {currentCompany.correctCategory === 'healthy'
                                ? `With a ${correctMetrics.grossMargin.toFixed(1)}% gross margin and ${correctMetrics.netMargin.toFixed(1)}% net margin, this company has healthy profitability.`
                                : `With a ${correctMetrics.grossMargin.toFixed(1)}% gross margin and ${correctMetrics.netMargin.toFixed(1)}% net margin, this company is struggling with low profitability.`
                              }
                            </p>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          handleNextCompany();
                          setGrossInput('');
                          setNetInput('');
                          setSelectedCategory('');
                        }}
                        className="w-full px-8 py-4 bg-gray-800 text-white rounded-xl font-bold text-lg hover:bg-gray-900 transition"
                      >
                        {currentCompanyIndex < companies.length - 1 ? 'Next Company →' : 'See Results'}
                      </button>
                    </>
                  );
                })()}
              </motion.div>
            )}
          </motion.div>

          {/* Progress */}
          <div className="flex justify-center gap-2 mb-8">
            {companies.map((_, idx) => (
              <div
                key={idx}
                className={`w-3 h-3 rounded-full transition-all ${
                  idx < currentCompanyIndex
                    ? 'bg-emerald-500'
                    : idx === currentCompanyIndex
                      ? 'bg-emerald-600 w-8'
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
          className="bg-white border-2 border-emerald-200 rounded-3xl p-12 text-center mb-6 shadow-xl"
        >
          <div className={`w-32 h-32 mx-auto rounded-full flex items-center justify-center mb-6 shadow-2xl ${score >= 4 ? 'bg-emerald-500' : 'bg-teal-500'}`}>
            <span className="text-6xl">{score >= 4 ? '🏆' : '📊'}</span>
          </div>

          <div className="text-6xl font-black text-emerald-600 mb-3">{score}/{companies.length}</div>
          <p className="text-2xl text-gray-700 mb-8">
            {score === 5 ? '🎉 Perfect! Financial Analyst Pro!' : score >= 4 ? '🎉 Excellent work!' : score >= 3 ? '👍 Good job!' : '📚 Keep practicing!'}
          </p>

          <div className="inline-block bg-emerald-100 text-emerald-800 px-8 py-3 rounded-full font-bold text-lg mb-8">
            {score >= 4 ? '+350 XP' : score >= 3 ? '+250 XP' : '+150 XP'}
          </div>
        </motion.div>
      )}

      <div className="flex justify-center gap-4 pb-12">
        <button onClick={handlePrev} className="px-8 py-4 rounded-2xl border-2 border-emerald-400 bg-white text-emerald-600 font-semibold text-lg shadow-lg hover:bg-emerald-50">
          ← Back
        </button>
        {gameCompleted && (
          <button onClick={handleNext} className="px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold text-lg shadow-lg hover:from-emerald-600 hover:to-teal-600">
            Take the Quiz →
          </button>
        )}
      </div>
    </div>
  );
};

// Main Component
const IncomeStatementModule = () => {
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

  const modulePassed = isModulePassed(MODULES.INCOME_STATEMENT?.id || 'income-statement');
  const totalSteps = 8; // 0:intro, 1:revenue-cogs, 2:opex, 3:net-income, 4:case-study, 5:game1, 6:game2, 7:quiz

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
      saveScore(MODULES.INCOME_STATEMENT?.id || 'income-statement', percentage);
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
        emoji="📊"
        moduleName="Income Statement"
        description="You've already passed the Income Statement module. Great job understanding profitability!"
        gradientClasses="from-emerald-50 via-teal-100 to-cyan-200"
        onReviewClick={() => setIsReviewMode(true)}
      />
    );
  }

  return (
    <div className="min-h-screen relative overflow-x-hidden" style={{ background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 25%, #6ee7b7 50%, #5eead4 75%, #99f6e4 100%)' }}>
      <button
        className="absolute top-4 left-4 px-4 py-2 rounded-lg text-emerald-600 hover:bg-white/50 backdrop-blur-sm font-medium transition z-50 shadow-sm border border-emerald-100"
        onClick={() => navigate('/roadmap')}
      >
        ← Back to Roadmap
      </button>

      <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-50">
        <div className="bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full shadow-sm border border-emerald-100 text-gray-600 font-semibold text-sm">
          Step {currentStep + 1} of {totalSteps}
        </div>
      </div>

      {(currentStep > 0 && (currentStep < totalSteps - 1 || (currentStep === totalSteps - 1 && currentQuestion === 0 && !showAnswerResult && !quizCompleted))) && (
        <button
          onClick={handlePrev}
          className="fixed left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full shadow-lg hover:from-emerald-600 hover:to-teal-600 transition flex items-center justify-center z-40"
          aria-label="Previous"
        >
          ←
        </button>
      )}
      {currentStep < totalSteps - 1 && (
        <button
          onClick={handleNext}
          className="fixed right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full shadow-lg hover:from-emerald-600 hover:to-teal-600 transition flex items-center justify-center z-40"
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
          {currentStep === 1 && <RevenueCogsPage handlePrev={handlePrev} handleNext={handleNext} />}
          {currentStep === 2 && <OperatingExpensesPage handlePrev={handlePrev} handleNext={handleNext} />}
          {currentStep === 3 && <NetIncomePage handlePrev={handlePrev} handleNext={handleNext} />}
          {currentStep === 4 && <CaseStudyPage handlePrev={handlePrev} handleNext={handleNext} />}
          {currentStep === 5 && <CEOSimulator handlePrev={handlePrev} handleNext={handleNext} />}
          {currentStep === 6 && <ProfitMarginCalculator handlePrev={handlePrev} handleNext={handleNext} />}
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

// Quiz Page Component
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
      <div className="bg-white rounded-3xl shadow-xl border-2 border-emerald-100 overflow-hidden flex flex-col min-h-[500px]">
        <div className="flex-1 p-8 lg:p-16 flex flex-col justify-center">
          <div className="flex justify-between items-end mb-8 border-b border-gray-100 pb-6">
            <div>
              <span className="text-sm font-bold text-emerald-600 uppercase tracking-wider block mb-2">
                Question {currentQuestion + 1} of {shuffledQuestions.length}
              </span>
              <h2 className="text-2xl lg:text-4xl font-bold text-slate-900 leading-tight">
                {shuffledQuestions[currentQuestion].question}
              </h2>
            </div>
            <div className="hidden lg:block text-slate-300">
              <span className="text-5xl">📊</span>
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
                      ? 'bg-emerald-50 border-emerald-600 shadow-lg scale-[1.02]'
                      : 'bg-white border-slate-200 hover:border-emerald-400 hover:shadow-md'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                      showCorrectness && isCorrect
                        ? 'bg-green-500 text-white'
                        : showCorrectness && isSelected
                        ? 'bg-red-500 text-white'
                        : isSelected
                        ? 'bg-emerald-600 text-white'
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
                <h4 className="font-bold text-emerald-400 uppercase tracking-wider text-sm mb-2">Explanation</h4>
                <p className="text-lg leading-relaxed text-slate-200">
                  {shuffledQuestions[currentQuestion].explanation}
                </p>
              </div>
              <button
                onClick={handleNextQuestion}
                className="w-full md:w-auto px-8 py-4 bg-white text-slate-900 rounded-xl font-bold hover:bg-emerald-50 transition-colors whitespace-nowrap"
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
        className="bg-white rounded-3xl shadow-xl p-12 text-center border-2 border-emerald-100"
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
            <p className="text-green-700 text-lg">You've mastered the Income Statement module</p>
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
            onClick={() => navigate('/roadmap')}
            className="px-8 py-4 rounded-xl border-2 border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-lg transition-all"
          >
            Back to Roadmap
          </button>
        </div>
      </motion.div>
    )}
  </div>
);

export default IncomeStatementModule;
