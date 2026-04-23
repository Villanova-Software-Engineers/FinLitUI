import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useModuleScore, MODULES } from '../hooks/useModuleScore';
import ModuleCompletedScreen from './ModuleCompletedScreen';
import { shuffleQuizOptions } from '../utils/shuffleQuizOptions';

// 10 Quiz Questions with explanations
const quizQuestions = [
  {
    question: "Why can a profitable company run out of cash?",
    options: [
      "It can't — profit always equals cash",
      "Profit includes non-cash items and timing differences",
      "The income statement must be wrong",
      "The balance sheet is unbalanced"
    ],
    correctIndex: 1,
    explanation: "Profit includes non-cash items (like depreciation) and timing differences (like accounts receivable). A company can show profit on the income statement but still run out of cash if customers haven't paid yet or if they've spent heavily on inventory or equipment."
  },
  {
    question: "Which section covers buying a new factory?",
    options: [
      "Operating activities",
      "Financing activities",
      "Investing activities",
      "Revenue activities"
    ],
    correctIndex: 2,
    explanation: "Buying a new factory is a capital expenditure (capex) and appears in the Investing Activities section. This section tracks cash spent on long-term assets like property, plant, and equipment."
  },
  {
    question: "Free cash flow formula?",
    options: [
      "Net income − taxes",
      "Operating cash flow − capital expenditures",
      "Revenue − COGS",
      "EBIT − depreciation"
    ],
    correctIndex: 1,
    explanation: "Free Cash Flow = Operating Cash Flow − Capital Expenditures. This shows how much cash the company generates after spending on maintaining/expanding its asset base - the most important cash flow metric."
  },
  {
    question: "Depreciation is added back in operating cash flow because?",
    options: [
      "It increases profit",
      "It is a non-cash expense",
      "It reduces liabilities",
      "It is a financing cost"
    ],
    correctIndex: 1,
    explanation: "Depreciation is added back because it's a non-cash expense. It was subtracted to calculate net income (on the income statement), but since no actual cash was paid out, we add it back when calculating operating cash flow."
  },
  {
    question: "A company issues new shares. This appears in?",
    options: [
      "Operating activities",
      "Investing activities",
      "Financing activities",
      "The income statement only"
    ],
    correctIndex: 2,
    explanation: "Issuing new shares (equity) appears in Financing Activities. This section tracks all cash flows related to how the company raises money from investors and creditors."
  },
  {
    question: "Increase in accounts receivable on cash flow is shown as?",
    options: [
      "Positive (cash inflow)",
      "Negative (cash outflow)",
      "Neutral",
      "Only on the balance sheet"
    ],
    correctIndex: 1,
    explanation: "An increase in accounts receivable is shown as negative (uses cash) because it means you made sales but haven't collected the cash yet. Your customers owe you more, which ties up cash in the business."
  },
  {
    question: "Which is a red flag in cash flow analysis?",
    options: [
      "High operating cash flow",
      "Positive free cash flow",
      "Profitable but consistently negative operating cash flow",
      "Low capital expenditure"
    ],
    correctIndex: 2,
    explanation: "Being profitable but consistently having negative operating cash flow is a major red flag. It suggests the company's profits aren't real or sustainable - they might be manipulating earnings, or their business model doesn't actually generate cash."
  },
  {
    question: "What does high capex typically signal?",
    options: [
      "The company is shrinking",
      "The company is investing heavily in growth",
      "Cash flow is improving",
      "Debt is being repaid"
    ],
    correctIndex: 1,
    explanation: "High capital expenditures (capex) typically signal that the company is investing heavily in growth - buying new equipment, building facilities, or expanding operations. This is common in growing businesses."
  },
  {
    question: "Paying dividends appears in which section?",
    options: [
      "Operating",
      "Investing",
      "Financing",
      "It doesn't appear on the cash flow statement"
    ],
    correctIndex: 2,
    explanation: "Dividend payments appear in the Financing Activities section because they're cash distributions to shareholders (equity holders). This is how the company returns cash to its owners."
  },
  {
    question: "Which cash flow statement section most closely reflects the core health of a business?",
    options: [
      "Investing",
      "Financing",
      "Operating",
      "All equally"
    ],
    correctIndex: 2,
    explanation: "Operating Activities is the most important section because it shows cash generated from the core business operations. A healthy company should consistently generate positive operating cash flow from its main business activities."
  }
];

// Page 1: Why Cash Flow Matters
const IntroPage = ({ handleNext }: { handleNext: () => void }) => (
  <div className="max-w-5xl mx-auto pt-16">
    <motion.div className="text-center mb-12" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
      <h1 className="text-5xl font-bold mb-4 text-gray-800">💧 Cash Flow Statement</h1>
      <p className="text-xl text-gray-600">Where the money actually moves — tracking every dollar in and out</p>
    </motion.div>

    <div className="space-y-6 mb-12">
      <motion.div className="p-8 rounded-3xl shadow-xl bg-white border-2 border-cyan-100" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
        <div className="flex items-start gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center shadow-lg flex-shrink-0">
            <span className="text-3xl">💰</span>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">Profit vs Cash: The Most Important Distinction</h3>
            <p className="text-gray-700 text-lg leading-relaxed">
              The income statement shows <span className="font-bold text-emerald-600">profit</span>, but the cash flow statement shows <span className="font-bold text-cyan-600">cash</span>. They're NOT the same! A company can be profitable on paper but go bankrupt if it runs out of cash.
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-2xl p-6">
          <h4 className="font-bold text-cyan-900 mb-4 text-xl">Why Can a Profitable Company Go Bankrupt?</h4>
          <div className="space-y-3">
            {[
              { icon: "📅", title: "Timing Differences", desc: "You record a $100K sale today, but the customer pays in 90 days. You show $100K revenue (profit ✓) but have $0 cash (cash ✗)." },
              { icon: "📦", title: "Inventory Build-up", desc: "You spend $50K buying inventory to sell. Profit isn't affected yet, but cash drops by $50K immediately." },
              { icon: "🏭", title: "Capital Expenditures", desc: "You buy a $200K machine. It's depreciated over 10 years on the income statement, but cash is gone TODAY." },
              { icon: "📉", title: "Non-Cash Expenses", desc: "Depreciation reduces profit but doesn't use cash. It's already been paid when you bought the asset." }
            ].map((item, idx) => (
              <div key={idx} className="bg-white rounded-xl p-4 border border-cyan-200">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{item.icon}</span>
                  <div>
                    <h5 className="font-bold text-gray-800 mb-1">{item.title}</h5>
                    <p className="text-sm text-gray-600">{item.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      <motion.div className="p-8 rounded-3xl shadow-xl bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
        <h3 className="text-2xl font-bold text-red-900 mb-4">⚠️ Real-World Casualties</h3>
        <div className="space-y-4">
          <div className="bg-white rounded-xl p-5 border-2 border-red-300">
            <h4 className="font-bold text-lg text-red-800 mb-2">Enron (2001)</h4>
            <p className="text-gray-700 text-sm">
              Showed billions in "profit" through accounting tricks, but operating cash flow was negative. The company collapsed when it couldn't pay its debts — proving cash is king.
            </p>
          </div>
          <div className="bg-white rounded-xl p-5 border-2 border-orange-300">
            <h4 className="font-bold text-lg text-orange-800 mb-2">WeWork (2019 near-collapse)</h4>
            <p className="text-gray-700 text-sm">
              Burned through billions in cash despite growing revenue. Negative operating cash flow meant the business model didn't work — they spent more running the business than they brought in.
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div className="bg-gradient-to-r from-cyan-50 to-blue-50 border-l-4 border-cyan-500 p-6 rounded-2xl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
        <p className="text-cyan-900 text-lg">
          💡 <span className="font-bold">Key Takeaway:</span> "Cash is a fact, profit is an opinion." The cash flow statement shows the cold, hard truth about where money is actually flowing in your business.
        </p>
      </motion.div>
    </div>

    <div className="flex justify-center pb-12">
      <button onClick={handleNext} className="px-10 py-4 rounded-2xl bg-cyan-500 text-white font-bold text-lg shadow-xl hover:bg-cyan-600 transition">
        Continue to Operating Activities →
      </button>
    </div>
  </div>
);

// Page 2: Operating Activities
const OperatingPage = ({ handlePrev, handleNext }: { handlePrev: () => void; handleNext: () => void }) => (
  <div className="max-w-5xl mx-auto pt-16">
    <motion.h2 className="text-4xl font-bold mb-4 text-center text-gray-800" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      Operating Activities
    </motion.h2>
    <p className="text-center text-gray-600 mb-8 text-lg">Cash from your core business operations</p>

    <div className="space-y-6 mb-8">
      <motion.div className="bg-white border-2 border-cyan-200 rounded-3xl p-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h3 className="text-2xl font-bold text-cyan-800 mb-4">Starting Point: Net Income</h3>
        <p className="text-gray-700 mb-6 leading-relaxed">
          Operating cash flow starts with <span className="font-bold text-emerald-600">net income</span> from the income statement, then adjusts it to show actual cash movements.
        </p>

        <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-2xl p-6 mb-6">
          <h4 className="font-bold text-cyan-900 mb-4">Step 1: Add Back Non-Cash Expenses</h4>
          <div className="bg-white rounded-xl p-5 border-2 border-cyan-200 mb-4">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">📉</span>
              <h5 className="font-bold text-lg text-gray-800">Depreciation & Amortization</h5>
            </div>
            <p className="text-sm text-gray-700 mb-3">
              These were <span className="font-bold">subtracted</span> from revenue to calculate net income, but they didn't use any cash. So we <span className="font-bold text-cyan-600">add them back</span>.
            </p>
            <div className="bg-cyan-50 rounded-lg p-3">
              <p className="text-xs text-cyan-900">
                <span className="font-bold">Example:</span> You bought a $100K machine 5 years ago. This year, you depreciated $20K. That $20K reduced your profit, but you already paid the cash 5 years ago! So add it back to get operating cash flow.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6">
          <h4 className="font-bold text-blue-900 mb-4">Step 2: Adjust for Working Capital Changes</h4>
          <div className="space-y-3">
            {[
              {
                icon: "📝",
                title: "Accounts Receivable ↑",
                effect: "Uses Cash (−)",
                why: "You made sales but haven't collected the money yet",
                color: "red"
              },
              {
                icon: "📦",
                title: "Inventory ↑",
                effect: "Uses Cash (−)",
                why: "You bought more inventory, which costs cash upfront",
                color: "red"
              },
              {
                icon: "💳",
                title: "Accounts Payable ↑",
                effect: "Provides Cash (+)",
                why: "You owe suppliers more, meaning you're holding onto cash longer",
                color: "green"
              }
            ].map((item, idx) => (
              <div key={idx} className={`bg-white rounded-xl p-4 border-2 ${item.color === 'green' ? 'border-green-300' : 'border-red-300'}`}>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{item.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-bold text-gray-800">{item.title}</h5>
                      <span className={`text-sm font-bold px-3 py-1 rounded-full ${item.color === 'green' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {item.effect}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{item.why}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      <motion.div className="bg-gradient-to-r from-cyan-50 to-blue-50 border-l-4 border-cyan-500 p-6 rounded-2xl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
        <p className="text-cyan-900">
          <span className="font-bold">The Bottom Line:</span> Operating cash flow shows if your core business actually generates cash. A healthy company should have consistent, positive operating cash flow.
        </p>
      </motion.div>
    </div>

    <div className="flex justify-center gap-4 pb-12">
      <button onClick={handlePrev} className="px-8 py-4 rounded-2xl border-2 border-cyan-400 bg-white text-cyan-600 font-semibold text-lg shadow-lg hover:bg-cyan-50">
        ← Back
      </button>
      <button onClick={handleNext} className="px-8 py-4 rounded-2xl bg-cyan-500 text-white font-semibold text-lg shadow-lg hover:bg-cyan-600">
        Next →
      </button>
    </div>
  </div>
);

// Page 3: Investing Activities
const InvestingPage = ({ handlePrev, handleNext }: { handlePrev: () => void; handleNext: () => void }) => (
  <div className="max-w-5xl mx-auto pt-16">
    <motion.h2 className="text-4xl font-bold mb-4 text-center text-gray-800" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      Investing Activities
    </motion.h2>
    <p className="text-center text-gray-600 mb-8 text-lg">Cash spent on (or received from) long-term assets</p>

    <div className="space-y-6 mb-8">
      <motion.div className="bg-white border-2 border-indigo-200 rounded-3xl p-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h3 className="text-2xl font-bold text-indigo-800 mb-6">What Goes Here?</h3>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-6 border-2 border-red-300">
            <h4 className="font-bold text-red-900 mb-4 flex items-center gap-2">
              <span className="text-2xl">📤</span> Cash Outflows (Uses)
            </h4>
            <div className="space-y-3">
              {[
                { title: "Capital Expenditures (Capex)", desc: "Buying property, equipment, factories, vehicles" },
                { title: "Acquisitions", desc: "Purchasing other companies or businesses" },
                { title: "Investments", desc: "Buying stocks, bonds, or other securities" }
              ].map((item, idx) => (
                <div key={idx} className="bg-white rounded-lg p-3 border border-red-200">
                  <h5 className="font-bold text-sm text-gray-800 mb-1">{item.title}</h5>
                  <p className="text-xs text-gray-600">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-300">
            <h4 className="font-bold text-green-900 mb-4 flex items-center gap-2">
              <span className="text-2xl">📥</span> Cash Inflows (Sources)
            </h4>
            <div className="space-y-3">
              {[
                { title: "Selling Assets", desc: "Selling old equipment, property, or facilities" },
                { title: "Selling Investments", desc: "Selling stocks, bonds, or securities" },
                { title: "Proceeds from Sales", desc: "Cash from selling part of the business" }
              ].map((item, idx) => (
                <div key={idx} className="bg-white rounded-lg p-3 border border-green-200">
                  <h5 className="font-bold text-sm text-gray-800 mb-1">{item.title}</h5>
                  <p className="text-xs text-gray-600">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div className="bg-white border-2 border-indigo-200 rounded-3xl p-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <h3 className="text-2xl font-bold text-indigo-800 mb-4">What High Capex Signals</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-blue-50 rounded-xl p-5 border-2 border-blue-300">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">🚀</span>
              <h4 className="font-bold text-blue-900">Growth Mode</h4>
            </div>
            <p className="text-sm text-gray-700">
              High capex often means the company is <span className="font-bold">investing in growth</span> — building new facilities, buying equipment, expanding capacity. This is common in companies like Tesla, Amazon, or manufacturers.
            </p>
          </div>
          <div className="bg-amber-50 rounded-xl p-5 border-2 border-amber-300">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">⚠️</span>
              <h4 className="font-bold text-amber-900">Watch the Trend</h4>
            </div>
            <p className="text-sm text-gray-700">
              If capex consistently exceeds operating cash flow, the company is spending more than it generates — it might need to borrow or raise money. This isn't always bad, but watch if it's sustainable.
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div className="bg-gradient-to-r from-indigo-50 to-blue-50 border-l-4 border-indigo-500 p-6 rounded-2xl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
        <p className="text-indigo-900">
          <span className="font-bold">Normal Pattern:</span> Most growing companies show negative investing cash flow (they're spending on assets). That's expected! The key is whether operating cash flow can eventually cover it.
        </p>
      </motion.div>
    </div>

    <div className="flex justify-center gap-4 pb-12">
      <button onClick={handlePrev} className="px-8 py-4 rounded-2xl border-2 border-cyan-400 bg-white text-cyan-600 font-semibold text-lg shadow-lg hover:bg-cyan-50">
        ← Back
      </button>
      <button onClick={handleNext} className="px-8 py-4 rounded-2xl bg-cyan-500 text-white font-semibold text-lg shadow-lg hover:bg-cyan-600">
        Next →
      </button>
    </div>
  </div>
);

// Game 1 will be placed here in the flow

// Page 4: Financing Activities
const FinancingPage = ({ handlePrev, handleNext }: { handlePrev: () => void; handleNext: () => void }) => (
  <div className="max-w-5xl mx-auto pt-16">
    <motion.h2 className="text-4xl font-bold mb-4 text-center text-gray-800" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      Financing Activities
    </motion.h2>
    <p className="text-center text-gray-600 mb-8 text-lg">How the company raises and returns money</p>

    <div className="space-y-6 mb-8">
      <motion.div className="bg-white border-2 border-violet-200 rounded-3xl p-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h3 className="text-2xl font-bold text-violet-800 mb-6">The Capital Structure Story</h3>
        <p className="text-gray-700 mb-6 leading-relaxed">
          This section shows how the company manages its capital structure — the mix of debt and equity used to fund operations and growth.
        </p>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-300">
            <h4 className="font-bold text-green-900 mb-4 flex items-center gap-2">
              <span className="text-2xl">💰</span> Cash Inflows
            </h4>
            <div className="space-y-3">
              {[
                { title: "Issuing Debt", desc: "Borrowing money through loans or bonds" },
                { title: "Issuing Stock", desc: "Selling shares to raise equity capital" },
                { title: "Stock Buybacks (reverse)", desc: "Sometimes listed as negative when buying back" }
              ].map((item, idx) => (
                <div key={idx} className="bg-white rounded-lg p-3 border border-green-200">
                  <h5 className="font-bold text-sm text-gray-800 mb-1">{item.title}</h5>
                  <p className="text-xs text-gray-600">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-6 border-2 border-red-300">
            <h4 className="font-bold text-red-900 mb-4 flex items-center gap-2">
              <span className="text-2xl">💸</span> Cash Outflows
            </h4>
            <div className="space-y-3">
              {[
                { title: "Repaying Debt", desc: "Paying back loans or bonds that mature" },
                { title: "Paying Dividends", desc: "Distributing cash profits to shareholders" },
                { title: "Stock Buybacks", desc: "Company buying its own shares from investors" }
              ].map((item, idx) => (
                <div key={idx} className="bg-white rounded-lg p-3 border border-red-200">
                  <h5 className="font-bold text-sm text-gray-800 mb-1">{item.title}</h5>
                  <p className="text-xs text-gray-600">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div className="bg-white border-2 border-violet-200 rounded-3xl p-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <h3 className="text-2xl font-bold text-violet-800 mb-4">What This Reveals About Strategy</h3>
        <div className="space-y-4">
          <div className="bg-blue-50 rounded-xl p-5 border-2 border-blue-300">
            <div className="flex items-start gap-3">
              <span className="text-3xl">🌱</span>
              <div>
                <h4 className="font-bold text-blue-900 mb-2">Growth Company Pattern</h4>
                <p className="text-sm text-gray-700">
                  <span className="font-bold text-green-600">Positive financing cash flow:</span> Raising money (debt/equity) to fund expansion. Typically, no dividends. All about growth!
                </p>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 rounded-xl p-5 border-2 border-amber-300">
            <div className="flex items-start gap-3">
              <span className="text-3xl">🏛️</span>
              <div>
                <h4 className="font-bold text-amber-900 mb-2">Mature Company Pattern</h4>
                <p className="text-sm text-gray-700">
                  <span className="font-bold text-red-600">Negative financing cash flow:</span> Returning cash to shareholders through dividends and buybacks. Less need for external capital.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-red-50 rounded-xl p-5 border-2 border-red-300">
            <div className="flex items-start gap-3">
              <span className="text-3xl">⚠️</span>
              <div>
                <h4 className="font-bold text-red-900 mb-2">Distressed Company Pattern</h4>
                <p className="text-sm text-gray-700">
                  Constantly raising debt just to survive. If operating cash flow is negative and they keep borrowing, that's a red flag — they're living on borrowed time.
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div className="bg-gradient-to-r from-violet-50 to-purple-50 border-l-4 border-violet-500 p-6 rounded-2xl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
        <p className="text-violet-900">
          <span className="font-bold">Think Like an Investor:</span> Financing activities show management's decisions on capital allocation. Are they reinvesting in growth, rewarding shareholders, or desperately trying to stay afloat?
        </p>
      </motion.div>
    </div>

    <div className="flex justify-center gap-4 pb-12">
      <button onClick={handlePrev} className="px-8 py-4 rounded-2xl border-2 border-cyan-400 bg-white text-cyan-600 font-semibold text-lg shadow-lg hover:bg-cyan-50">
        ← Back
      </button>
      <button onClick={handleNext} className="px-8 py-4 rounded-2xl bg-cyan-500 text-white font-semibold text-lg shadow-lg hover:bg-cyan-600">
        Next →
      </button>
    </div>
  </div>
);

// Page 5: Reading the Full Statement & Free Cash Flow
const ReadingStatementPage = ({ handlePrev, handleNext }: { handlePrev: () => void; handleNext: () => void }) => (
  <div className="max-w-5xl mx-auto pt-16">
    <motion.h2 className="text-4xl font-bold mb-4 text-center text-gray-800" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      Reading the Full Statement
    </motion.h2>
    <p className="text-center text-gray-600 mb-8 text-lg">Free cash flow and what makes a healthy cash flow profile</p>

    <div className="space-y-6 mb-8">
      <motion.div className="bg-white border-2 border-cyan-200 rounded-3xl p-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h3 className="text-2xl font-bold text-cyan-800 mb-6">The King Metric: Free Cash Flow</h3>

        <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-2xl p-6 mb-6">
          <h4 className="font-bold text-cyan-900 mb-4 text-xl">Formula</h4>
          <div className="bg-white rounded-xl p-6 border-2 border-cyan-300">
            <div className="flex flex-wrap items-center justify-center gap-4 text-center">
              <div className="bg-green-100 text-green-800 font-bold text-xl px-6 py-4 rounded-xl">
                Free Cash Flow
              </div>
              <span className="text-2xl font-bold text-gray-400">=</span>
              <div className="bg-blue-100 text-blue-800 font-bold text-xl px-6 py-4 rounded-xl">
                Operating Cash Flow
              </div>
              <span className="text-2xl font-bold text-gray-400">−</span>
              <div className="bg-red-100 text-red-800 font-bold text-xl px-6 py-4 rounded-xl">
                Capital Expenditures
              </div>
            </div>
          </div>
          <p className="text-gray-700 mt-4 text-center">
            This is the cash left over after the company pays for everything needed to run and maintain the business. It's truly "free" to use for growth, dividends, or paying down debt.
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
          <h4 className="font-bold text-gray-800 mb-4">Example Calculation</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between p-3 bg-green-50 rounded-lg">
              <span className="font-semibold">Operating Cash Flow</span>
              <span className="font-mono font-bold text-green-700">$500,000</span>
            </div>
            <div className="flex justify-between p-3 bg-red-50 rounded-lg">
              <span className="font-semibold">− Capital Expenditures</span>
              <span className="font-mono font-bold text-red-700">($150,000)</span>
            </div>
            <div className="flex justify-between p-4 bg-cyan-100 rounded-lg border-2 border-cyan-400">
              <span className="font-bold text-lg">= Free Cash Flow</span>
              <span className="font-mono font-bold text-xl text-cyan-700">$350,000</span>
            </div>
          </div>
          <p className="text-xs text-gray-600 mt-3 italic">
            This company has $350K in free cash flow. Management can use this for dividends, buybacks, acquisitions, or saving for future growth.
          </p>
        </div>
      </motion.div>

      <motion.div className="bg-white border-2 border-emerald-200 rounded-3xl p-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <h3 className="text-2xl font-bold text-emerald-800 mb-6">What Makes a Healthy Cash Flow Profile?</h3>
        <div className="space-y-3">
          {[
            {
              icon: "✅",
              title: "Positive Operating Cash Flow",
              desc: "The business generates cash from core operations — this is essential!",
              color: "green"
            },
            {
              icon: "✅",
              title: "Operating CF > Net Income",
              desc: "Earnings are converting to actual cash, not just accounting profit",
              color: "green"
            },
            {
              icon: "✅",
              title: "Positive Free Cash Flow",
              desc: "After maintaining the business, there's still cash left over",
              color: "green"
            },
            {
              icon: "⚡",
              title: "Consistent Growth",
              desc: "Operating cash flow grows year over year as the business scales",
              color: "blue"
            }
          ].map((item, idx) => (
            <div key={idx} className={`bg-${item.color}-50 rounded-xl p-5 border-2 border-${item.color}-300`}>
              <div className="flex items-start gap-3">
                <span className="text-2xl">{item.icon}</span>
                <div>
                  <h4 className={`font-bold text-${item.color}-900 mb-1`}>{item.title}</h4>
                  <p className="text-sm text-gray-700">{item.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div className="bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-300 rounded-3xl p-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <h3 className="text-2xl font-bold text-red-900 mb-6">🚩 Red Flags to Watch For</h3>
        <div className="space-y-3">
          {[
            {
              title: "Profitable but Consistently Negative Operating CF",
              desc: "The company shows profit on the income statement but burns cash in operations. This suggests earnings manipulation or an unsustainable business model.",
              severity: "critical"
            },
            {
              title: "Free Cash Flow Negative for Multiple Years",
              desc: "The company is spending more than it generates. It must keep raising money to survive — not sustainable long-term.",
              severity: "critical"
            },
            {
              title: "Operating CF Declining While Revenue Grows",
              desc: "Revenue is up but cash is down. Possible causes: aggressive revenue recognition, rising receivables, or deteriorating margins.",
              severity: "warning"
            },
            {
              title: "Big Gap Between Net Income and Operating CF",
              desc: "Profit and cash should track closely. A large, unexplained gap suggests potential accounting issues.",
              severity: "warning"
            }
          ].map((item, idx) => (
            <div key={idx} className={`bg-white rounded-xl p-5 border-2 ${item.severity === 'critical' ? 'border-red-400' : 'border-orange-400'}`}>
              <div className="flex items-start gap-3">
                <span className="text-2xl">{item.severity === 'critical' ? '🔴' : '⚠️'}</span>
                <div>
                  <h4 className={`font-bold mb-2 ${item.severity === 'critical' ? 'text-red-900' : 'text-orange-900'}`}>
                    {item.title}
                  </h4>
                  <p className="text-sm text-gray-700">{item.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div className="bg-gradient-to-r from-cyan-50 to-blue-50 border-l-4 border-cyan-500 p-6 rounded-2xl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
        <p className="text-cyan-900 text-lg">
          💡 <span className="font-bold">Warren Buffett's Advice:</span> "Look at the cash flow statement. If a company consistently generates strong free cash flow, it's probably a good business. If it doesn't, be very careful."
        </p>
      </motion.div>
    </div>

    <div className="flex justify-center gap-4 pb-12">
      <button onClick={handlePrev} className="px-8 py-4 rounded-2xl border-2 border-cyan-400 bg-white text-cyan-600 font-semibold text-lg shadow-lg hover:bg-cyan-50">
        ← Back
      </button>
      <button onClick={handleNext} className="px-8 py-4 rounded-2xl bg-cyan-500 text-white font-semibold text-lg shadow-lg hover:bg-cyan-600">
        Play Game 1 →
      </button>
    </div>
  </div>
);

// Game 1: Cash Flow Crisis
interface CashFlowCrisisProps {
  handlePrev: () => void;
  handleNext: () => void;
}

const CashFlowCrisis = ({ handlePrev, handleNext }: CashFlowCrisisProps) => {
  const clues = [
    { id: 1, text: "Customers owe you $50K but haven't paid yet", category: 'operating', subcategory: 'receivables', effect: 'negative', explanation: "Increase in accounts receivable uses cash (operating activity). You recorded the sale but don't have the cash yet." },
    { id: 2, text: "Bought $30K of inventory for future sales", category: 'operating', subcategory: 'inventory', effect: 'negative', explanation: "Increase in inventory uses cash (operating activity). You spent cash buying products to sell later." },
    { id: 3, text: "Purchased a new $100K delivery truck", category: 'investing', subcategory: 'capex', effect: 'negative', explanation: "Buying equipment is a capital expenditure (investing activity). This is a major cash outflow." },
    { id: 4, text: "Took out a $40K loan from the bank", category: 'financing', subcategory: 'debt', effect: 'positive', explanation: "Borrowing money is a cash inflow from financing activities. You received cash but now owe it back." },
    { id: 5, text: "Paid $15K to suppliers you owed from last month", category: 'operating', subcategory: 'payables', effect: 'negative', explanation: "Decrease in accounts payable uses cash (operating activity). You're paying down what you owed." },
    { id: 6, text: "Sold old equipment for $20K cash", category: 'investing', subcategory: 'asset-sale', effect: 'positive', explanation: "Selling assets brings in cash (investing activity). This is a cash inflow from disposing of property." },
    { id: 7, text: "Paid $10K in dividends to shareholders", category: 'financing', subcategory: 'dividends', effect: 'negative', explanation: "Dividend payments are cash outflows in financing activities. You're returning cash to owners." },
    { id: 8, text: "Recorded $25K depreciation expense", category: 'operating', subcategory: 'depreciation', effect: 'positive', explanation: "Depreciation is added back in operating activities. It reduced profit but didn't use cash." },
    { id: 9, text: "Repaid $20K of an old loan", category: 'financing', subcategory: 'debt-repay', effect: 'negative', explanation: "Paying back debt is a cash outflow from financing activities. You're reducing liabilities with cash." },
    { id: 10, text: "Customers paid $35K for orders from last quarter", category: 'operating', subcategory: 'receivables-collect', effect: 'positive', explanation: "Collecting receivables brings in cash (operating activity). Cash previously tied up is now received." }
  ];

  const [items, setItems] = useState(clues.map(clue => ({ ...clue, zone: 'bank' })));
  const [draggedItem, setDraggedItem] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [bankruptcyCounter, setBankruptcyCounter] = useState(100);

  const zones = [
    { id: 'operating', label: 'Operating Activities', icon: '⚙️', color: 'from-cyan-500 to-blue-500' },
    { id: 'investing', label: 'Investing Activities', icon: '🏭', color: 'from-indigo-500 to-purple-500' },
    { id: 'financing', label: 'Financing Activities', icon: '💰', color: 'from-violet-500 to-fuchsia-500' }
  ];

  const handleDragStart = (e: React.DragEvent, itemId: number) => {
    setDraggedItem(itemId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, zoneId: string) => {
    e.preventDefault();
    if (draggedItem !== null) {
      setItems(items.map(item =>
        item.id === draggedItem ? { ...item, zone: zoneId } : item
      ));
      setDraggedItem(null);
    }
  };

  const checkAnswers = () => {
    setChecked(true);
    const correctCount = items.filter(item => item.zone === item.category).length;
    const newCounter = Math.max(0, 100 - (10 - correctCount) * 10);
    setBankruptcyCounter(newCounter);
  };

  const score = items.filter(item => item.zone === item.category).length;

  const getItemClass = (item: typeof items[0]) => {
    if (!checked) return 'bg-white border-gray-300 shadow-sm';
    return item.zone === item.category
      ? 'bg-green-100 border-green-500 text-green-900 shadow-md'
      : 'bg-red-100 border-red-500 text-red-900 shadow-md';
  };

  return (
    <div className="max-w-6xl mx-auto pt-16">
      <motion.h2 className="text-4xl font-bold mb-4 text-center text-gray-800" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        🎮 Cash Flow Crisis
      </motion.h2>
      <p className="text-center text-gray-600 mb-8 text-lg">
        A company is hemorrhaging cash despite showing profits. Categorize each clue correctly to stabilize the business!
      </p>

      {/* Bankruptcy Counter */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-700">Business Health</span>
          <span className={`text-lg font-bold ${bankruptcyCounter > 70 ? 'text-green-600' : bankruptcyCounter > 40 ? 'text-amber-600' : 'text-red-600'}`}>
            {bankruptcyCounter}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${bankruptcyCounter > 70 ? 'bg-green-500' : bankruptcyCounter > 40 ? 'bg-amber-500' : 'bg-red-500'}`}
            initial={{ width: '100%' }}
            animate={{ width: `${bankruptcyCounter}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Item Bank */}
      <div className="bg-gradient-to-r from-gray-100 to-gray-200 rounded-2xl p-5 mb-6 min-h-[100px] border-2 border-gray-300">
        <p className="text-sm font-semibold text-gray-700 mb-3 text-center">🔍 Clue Cards</p>
        <div className="flex flex-wrap gap-3 justify-center">
          {items.filter(i => i.zone === 'bank').map(item => (
            <div
              key={item.id}
              draggable
              onDragStart={(e) => handleDragStart(e, item.id)}
              className={`${getItemClass(item)} border-2 rounded-xl px-4 py-3 text-sm font-medium cursor-grab active:cursor-grabbing transition-all hover:shadow-lg max-w-xs`}
            >
              {item.text}
            </div>
          ))}
        </div>
      </div>

      {/* Drop Zones */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        {zones.map(zone => (
          <div
            key={zone.id}
            data-drop-zone={zone.id}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, zone.id)}
            className="bg-white border-3 border-gray-300 rounded-2xl overflow-hidden shadow-lg"
          >
            <div className={`bg-gradient-to-r ${zone.color} text-white p-4 text-center`}>
              <div className="text-3xl mb-2">{zone.icon}</div>
              <h3 className="font-bold text-lg">{zone.label}</h3>
            </div>
            <div className="p-4 min-h-[400px] space-y-2">
              {items.filter(i => i.zone === zone.id).map(item => (
                <div
                  key={item.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, item.id)}
                  className={`${getItemClass(item)} border-2 rounded-xl px-3 py-2 text-sm font-medium cursor-grab active:cursor-grabbing`}
                >
                  {item.text}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Check Button */}
      <div className="flex justify-between items-center mb-6">
        <span className="text-gray-600 font-semibold">Score: {checked ? `${score} / 10` : '? / 10'}</span>
        <button
          onClick={checkAnswers}
          disabled={items.some(i => i.zone === 'bank') || checked}
          className="px-6 py-3 bg-cyan-500 text-white rounded-xl font-semibold hover:bg-cyan-600 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
        >
          {checked ? 'Checked!' : 'Check Answers'}
        </button>
      </div>

      {/* Results */}
      {checked && (
        <>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${score >= 8 ? 'bg-green-50 border-green-500' : 'bg-yellow-50 border-yellow-500'} border-l-4 p-6 rounded-2xl mb-6`}
          >
            <p className={`${score >= 8 ? 'text-green-900' : 'text-yellow-900'} font-semibold text-lg`}>
              {score === 10
                ? '🎉 Perfect! Business saved! You correctly categorized all cash flows!'
                : score >= 8
                  ? '✅ Great work! The business is stabilized!'
                  : score >= 5
                    ? '⚠️ The business is struggling. Review the explanations below.'
                    : '🚨 Critical condition! The company is heading toward bankruptcy.'}
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
              {items.map((item) => {
                const isCorrect = item.zone === item.category;
                return (
                  <div key={item.id} className={`p-4 rounded-xl border-2 ${isCorrect ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'}`}>
                    <div className="flex items-start gap-3 mb-2">
                      <span className={`text-2xl ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                        {isCorrect ? '✓' : '✗'}
                      </span>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">{item.text}</p>
                        <p className={`text-sm ${isCorrect ? 'text-green-800' : 'text-red-800'} mt-1`}>
                          {!isCorrect && `You placed it in: ${item.zone}. `}
                          Correct category: <span className="font-bold capitalize">{item.category}</span>
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

      <div className="flex justify-center gap-4 pb-12">
        <button onClick={handlePrev} className="px-8 py-4 rounded-2xl border-2 border-cyan-400 bg-white text-cyan-600 font-semibold text-lg shadow-lg hover:bg-cyan-50">
          ← Back
        </button>
        {checked && (
          <button onClick={handleNext} className="px-8 py-4 rounded-2xl bg-cyan-500 text-white font-semibold text-lg shadow-lg hover:bg-cyan-600">
            Next Game →
          </button>
        )}
      </div>
    </div>
  );
};

// Game 2: Free Cash Flow Builder
interface FCFBuilderProps {
  handlePrev: () => void;
  handleNext: () => void;
}

const FreeCashFlowBuilder = ({ handlePrev, handleNext: handleNextPage }: FCFBuilderProps) => {
  const [currentScenario, setCurrentScenario] = useState(0);
  const [userFCF, setUserFCF] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [answers, setAnswers] = useState<{ correct: boolean; userValue: number; correctValue: number }[]>([]);
  const [gameCompleted, setGameCompleted] = useState(false);

  const scenarios = [
    {
      company: "TechFlow Inc.",
      data: {
        netIncome: 500000,
        depreciation: 80000,
        changeInReceivables: -30000,
        changeInInventory: -20000,
        changeInPayables: 15000,
        capex: 150000
      },
      operatingCF: 455000,
      fcf: 305000
    },
    {
      company: "GrowthCorp",
      data: {
        netIncome: 300000,
        depreciation: 50000,
        changeInReceivables: -40000,
        changeInInventory: -25000,
        changeInPayables: 20000,
        capex: 200000
      },
      operatingCF: 305000,
      fcf: 105000
    },
    {
      company: "MatureCo Ltd.",
      data: {
        netIncome: 800000,
        depreciation: 120000,
        changeInReceivables: -10000,
        changeInInventory: -5000,
        changeInPayables: 8000,
        capex: 100000
      },
      operatingCF: 913000,
      fcf: 813000
    }
  ];

  const scenario = scenarios[currentScenario];

  const handleSubmit = () => {
    const parsed = parseFloat(userFCF);
    const correct = Math.abs(parsed - scenario.fcf) < 1000;
    setShowResult(true);
    setAnswers([...answers, { correct, userValue: parsed, correctValue: scenario.fcf }]);
  };

  const handleNext = () => {
    if (currentScenario < scenarios.length - 1) {
      setCurrentScenario(currentScenario + 1);
      setUserFCF('');
      setShowResult(false);
    } else {
      setGameCompleted(true);
    }
  };

  const score = answers.filter(a => a.correct).length;

  return (
    <div className="max-w-4xl mx-auto pt-16">
      <motion.h2 className="text-4xl font-bold mb-4 text-center text-gray-800" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        🧮 Free Cash Flow Builder
      </motion.h2>

      {!gameCompleted ? (
        <>
          <div className="flex justify-center mb-6">
            <div className="bg-white/90 backdrop-blur-md px-6 py-2 rounded-full shadow-md border-2 border-cyan-200">
              <span className="text-cyan-600 font-bold text-sm">
                Company {currentScenario + 1} of {scenarios.length}
              </span>
            </div>
          </div>

          <motion.div
            key={currentScenario}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white border-2 border-gray-200 rounded-3xl p-8 mb-6 shadow-xl"
          >
            <div className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white p-6 rounded-2xl mb-6">
              <h3 className="text-2xl font-bold mb-2">{scenario.company}</h3>
              <p className="text-cyan-100">Calculate the Free Cash Flow</p>
            </div>

            {/* Financial Data */}
            <div className="mb-6">
              <h4 className="font-bold text-gray-800 mb-4">Financial Data:</h4>
              <div className="space-y-2">
                <div className="flex justify-between p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                  <span className="font-semibold">Net Income</span>
                  <span className="font-mono font-bold text-emerald-700">${scenario.data.netIncome.toLocaleString()}</span>
                </div>
                <div className="flex justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <span className="font-semibold">+ Depreciation</span>
                  <span className="font-mono font-bold text-blue-700">${scenario.data.depreciation.toLocaleString()}</span>
                </div>
                <div className="flex justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                  <span className="font-semibold">− Increase in Receivables</span>
                  <span className="font-mono font-bold text-red-700">${Math.abs(scenario.data.changeInReceivables).toLocaleString()}</span>
                </div>
                <div className="flex justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                  <span className="font-semibold">− Increase in Inventory</span>
                  <span className="font-mono font-bold text-red-700">${Math.abs(scenario.data.changeInInventory).toLocaleString()}</span>
                </div>
                <div className="flex justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                  <span className="font-semibold">+ Increase in Payables</span>
                  <span className="font-mono font-bold text-green-700">${scenario.data.changeInPayables.toLocaleString()}</span>
                </div>
                <div className="flex justify-between p-4 bg-cyan-100 rounded-lg border-2 border-cyan-400">
                  <span className="font-bold text-lg">= Operating Cash Flow</span>
                  <span className="font-mono font-bold text-xl text-cyan-700">${scenario.operatingCF.toLocaleString()}</span>
                </div>
                <div className="flex justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <span className="font-semibold">− Capital Expenditures</span>
                  <span className="font-mono font-bold text-orange-700">${scenario.data.capex.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* User Input */}
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-6 mb-4">
              <h4 className="font-bold text-gray-800 mb-3">Calculate Free Cash Flow:</h4>
              <p className="text-sm text-gray-600 mb-4">Operating Cash Flow − Capital Expenditures = ?</p>
              <div className="flex gap-3">
                <input
                  type="number"
                  value={userFCF}
                  onChange={(e) => setUserFCF(e.target.value)}
                  disabled={showResult}
                  placeholder="Enter FCF (e.g., 305000)"
                  className="flex-1 px-6 py-4 border-2 border-gray-300 rounded-xl text-lg font-semibold focus:border-cyan-500 focus:outline-none disabled:bg-gray-100"
                />
                {!showResult && (
                  <button
                    onClick={handleSubmit}
                    disabled={!userFCF}
                    className="px-8 py-4 bg-cyan-500 text-white rounded-xl font-bold hover:bg-cyan-600 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                  >
                    Submit
                  </button>
                )}
              </div>
            </div>

            {showResult && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`${Math.abs(parseFloat(userFCF) - scenario.fcf) < 1000 ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'} border-2 rounded-2xl p-6`}
              >
                <div className="flex items-start gap-4 mb-3">
                  <span className={`text-4xl ${Math.abs(parseFloat(userFCF) - scenario.fcf) < 1000 ? 'text-green-600' : 'text-red-600'}`}>
                    {Math.abs(parseFloat(userFCF) - scenario.fcf) < 1000 ? '✓' : '✗'}
                  </span>
                  <div className="flex-1">
                    <p className={`font-bold text-xl ${Math.abs(parseFloat(userFCF) - scenario.fcf) < 1000 ? 'text-green-900' : 'text-red-900'} mb-2`}>
                      {Math.abs(parseFloat(userFCF) - scenario.fcf) < 1000 ? 'Correct!' : `Not quite — The answer is $${scenario.fcf.toLocaleString()}`}
                    </p>
                    <p className="text-sm text-gray-700 mb-3">
                      <span className="font-bold">Calculation:</span> ${scenario.operatingCF.toLocaleString()} (Operating CF) − ${scenario.data.capex.toLocaleString()} (Capex) = <span className="font-bold">${scenario.fcf.toLocaleString()}</span>
                    </p>
                    <p className="text-sm text-gray-600">
                      This is the cash {scenario.company} has left over after maintaining and growing the business. It can use this for dividends, buybacks, or future investments.
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleNext}
                  className="w-full mt-4 px-6 py-3 bg-gray-800 text-white rounded-xl font-semibold hover:bg-gray-900 transition"
                >
                  {currentScenario < scenarios.length - 1 ? 'Next Company →' : 'See Results'}
                </button>
              </motion.div>
            )}
          </motion.div>
        </>
      ) : (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white border-2 border-gray-200 rounded-3xl p-12 text-center mb-6 shadow-xl"
        >
          <div className={`w-32 h-32 mx-auto rounded-full flex items-center justify-center mb-6 shadow-2xl ${score >= 2 ? 'bg-green-500' : 'bg-blue-500'}`}>
            <span className="text-6xl">{score >= 2 ? '🏆' : '📊'}</span>
          </div>
          <div className="text-6xl font-black text-blue-600 mb-3">{score}/{scenarios.length}</div>
          <p className="text-2xl text-gray-700 mb-6">
            {score === scenarios.length ? '🎉 Perfect! FCF Master!' : score >= 2 ? '🎉 Great work!' : '📚 Keep practicing!'}
          </p>
          <div className="inline-block bg-blue-100 text-blue-800 px-8 py-3 rounded-full font-bold text-lg mb-8 shadow-md">
            {score >= 2 ? '+400 XP' : '+200 XP'}
          </div>

          <div className="text-left bg-gradient-to-r from-gray-50 to-cyan-50 rounded-2xl p-6 mt-8">
            <h3 className="font-bold text-lg text-gray-800 mb-4 text-center">📊 Your Results</h3>
            <div className="space-y-3">
              {answers.map((ans, idx) => (
                <div key={idx} className={`p-4 rounded-lg ${ans.correct ? 'bg-green-100 border border-green-300' : 'bg-red-100 border border-red-300'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`text-xl ${ans.correct ? 'text-green-600' : 'text-red-600'}`}>
                        {ans.correct ? '✓' : '✗'}
                      </span>
                      <span className="font-semibold text-gray-700">{scenarios[idx].company}</span>
                    </div>
                    <div className="text-sm">
                      <span className={ans.correct ? 'text-green-800' : 'text-red-800'}>
                        Your: ${ans.userValue.toLocaleString()}
                        {!ans.correct && ` → Correct: $${ans.correctValue.toLocaleString()}`}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      <div className="flex justify-center gap-4 pb-12">
        <button onClick={handlePrev} className="px-8 py-4 rounded-2xl border-2 border-cyan-400 bg-white text-cyan-600 font-semibold text-lg shadow-lg hover:bg-cyan-50">
          ← Back
        </button>
        {gameCompleted && (
          <button onClick={handleNextPage} className="px-8 py-4 rounded-2xl bg-cyan-500 text-white font-semibold text-lg shadow-lg hover:bg-cyan-600">
            Take the Quiz →
          </button>
        )}
      </div>
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
      <div className="bg-white rounded-3xl shadow-xl border-2 border-cyan-100 overflow-hidden flex flex-col min-h-[500px]">
        <div className="flex-1 p-8 lg:p-16 flex flex-col justify-center">
          <div className="flex justify-between items-end mb-8 border-b border-gray-100 pb-6">
            <div>
              <span className="text-sm font-bold text-cyan-600 uppercase tracking-wider block mb-2">
                Question {currentQuestion + 1} of {shuffledQuestions.length}
              </span>
              <h2 className="text-2xl lg:text-4xl font-bold text-slate-900 leading-tight">
                {shuffledQuestions[currentQuestion].question}
              </h2>
            </div>
            <div className="hidden lg:block text-slate-300">
              <span className="text-5xl">💧</span>
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
                      ? 'bg-cyan-50 border-cyan-600 shadow-lg scale-[1.02]'
                      : 'bg-white border-slate-200 hover:border-cyan-400 hover:shadow-md'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                      showCorrectness && isCorrect
                        ? 'bg-green-500 text-white'
                        : showCorrectness && isSelected
                        ? 'bg-red-500 text-white'
                        : isSelected
                        ? 'bg-cyan-600 text-white'
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
                <h4 className="font-bold text-cyan-400 uppercase tracking-wider text-sm mb-2">Explanation</h4>
                <p className="text-lg leading-relaxed text-slate-200">
                  {shuffledQuestions[currentQuestion].explanation}
                </p>
              </div>
              <button
                onClick={handleNextQuestion}
                className="w-full md:w-auto px-8 py-4 bg-white text-slate-900 rounded-xl font-bold hover:bg-cyan-50 transition-colors whitespace-nowrap"
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
        className="bg-white rounded-3xl shadow-xl p-12 text-center border-2 border-cyan-100"
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
            <p className="text-green-700 text-lg">You've mastered the Cash Flow Statement module</p>
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

// Main Component
const CashFlowStatementModule = () => {
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

  const modulePassed = isModulePassed(MODULES.CASH_FLOW_STATEMENT.id);
  const totalSteps = 8; // 0:intro, 1:operating, 2:investing, 3:financing, 4:reading, 5:game1, 6:game2, 7:quiz

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
      saveScore(MODULES.CASH_FLOW_STATEMENT.id, percentage);
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
        emoji="💧"
        moduleName="Cash Flow Statement"
        description="You've already passed the Cash Flow Statement module. Great job mastering cash flow analysis!"
        gradientClasses="from-cyan-50 via-blue-100 to-indigo-200"
        onReviewClick={() => setIsReviewMode(true)}
      />
    );
  }

  return (
    <div className="min-h-screen relative overflow-x-hidden" style={{ background: 'linear-gradient(135deg, #e0f7fa 0%, #b2ebf2 50%, #80deea 100%)' }}>
      <button
        className="absolute top-4 left-4 px-4 py-2 rounded-lg text-cyan-600 hover:bg-white/50 backdrop-blur-sm font-medium transition z-50 shadow-sm border border-cyan-100"
        onClick={() => navigate('/roadmap')}
      >
        ← Back to Roadmap
      </button>

      <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-50">
        <div className="bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full shadow-sm border border-cyan-100 text-gray-600 font-semibold text-sm">
          Step {currentStep + 1} of {totalSteps}
        </div>
      </div>

      {(currentStep > 0 && (currentStep < totalSteps - 1 || (currentStep === totalSteps - 1 && currentQuestion === 0 && !showAnswerResult && !quizCompleted))) && (
        <button
          onClick={handlePrev}
          className="fixed left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-cyan-500 text-white rounded-full shadow-lg hover:bg-cyan-600 transition flex items-center justify-center z-40"
          aria-label="Previous"
        >
          ←
        </button>
      )}
      {currentStep < totalSteps - 1 && (
        <button
          onClick={handleNext}
          className="fixed right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-cyan-500 text-white rounded-full shadow-lg hover:bg-cyan-600 transition flex items-center justify-center z-40"
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
          {currentStep === 1 && <OperatingPage handlePrev={handlePrev} handleNext={handleNext} />}
          {currentStep === 2 && <InvestingPage handlePrev={handlePrev} handleNext={handleNext} />}
          {currentStep === 3 && <FinancingPage handlePrev={handlePrev} handleNext={handleNext} />}
          {currentStep === 4 && <ReadingStatementPage handlePrev={handlePrev} handleNext={handleNext} />}
          {currentStep === 5 && <CashFlowCrisis handlePrev={handlePrev} handleNext={handleNext} />}
          {currentStep === 6 && <FreeCashFlowBuilder handlePrev={handlePrev} handleNext={handleNext} />}
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

export default CashFlowStatementModule;
