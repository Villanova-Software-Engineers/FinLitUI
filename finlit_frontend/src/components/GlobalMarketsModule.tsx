import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useModuleScore, MODULES } from '../hooks/useModuleScore';
import ModuleCompletedScreen from './ModuleCompletedScreen';
import { shuffleQuizOptions } from '../utils/shuffleQuizOptions';

// 10 Quiz Questions with explanations
const quizQuestions = [
  {
    question: "What happens when the US Federal Reserve raises interest rates?",
    options: ["The dollar weakens", "The dollar strengthens", "Exchange rates stay the same", "Commodity prices rise"],
    correctIndex: 1,
    explanation: "When the Fed raises interest rates, the dollar typically strengthens because higher rates attract foreign capital seeking better returns, increasing demand for dollars."
  },
  {
    question: "A country with a current account surplus means:",
    options: ["It consumes more than it earns from the world", "It owes more money to other countries", "It earns more from the world than it spends", "It has high inflation"],
    correctIndex: 2,
    explanation: "A current account surplus (like Germany or China) means a country exports more than it imports, earning more from the world than it spends. Deficits mean the opposite."
  },
  {
    question: "The Japanese yen weakened in 2022-23 primarily because:",
    options: ["Japan raised interest rates aggressively", "The Bank of Japan kept rates near zero while others hiked", "Japan's exports collapsed", "The yen was overvalued"],
    correctIndex: 1,
    explanation: "While other central banks raised rates to fight inflation, the Bank of Japan kept rates near zero. Capital fled yen for higher-yielding currencies, weakening the yen significantly."
  },
  {
    question: "What is 'comparative advantage' in global trade?",
    options: ["Countries trading only with neighbors", "Countries exporting what they produce cheaply and importing what others produce cheaply", "Protectionist trade policies", "Having the largest economy"],
    correctIndex: 1,
    explanation: "Comparative advantage is the economic principle that countries should specialize in producing goods they can make more efficiently, then trade with others for goods they produce less efficiently."
  },
  {
    question: "Financial contagion spreads through all EXCEPT:",
    options: ["Banking linkages", "Trade channels", "Investor sentiment", "Isolated local regulations"],
    correctIndex: 3,
    explanation: "Contagion spreads through banking linkages (banks holding each other's debt), trade channels (recessions cutting imports), and sentiment (investors fleeing all 'risky' assets at once). Local regulations don't spread contagion."
  },
  {
    question: "The US 10-year Treasury yield is important globally because:",
    options: ["It only affects US investors", "It's the 'risk-free' rate the whole world prices off", "It has no impact on emerging markets", "It controls commodity prices directly"],
    correctIndex: 1,
    explanation: "The US 10-year Treasury yield is considered the global 'risk-free' rate. When it rises sharply, assets globally reprice because it's the benchmark against which all investments are compared."
  },
  {
    question: "When copper prices fall sharply, it often signals:",
    options: ["Strong economic growth ahead", "A potential global slowdown before GDP data confirms it", "Higher inflation is coming", "Currency appreciation in copper-exporting countries"],
    correctIndex: 1,
    explanation: "Copper is called 'Dr. Copper' because its price is a leading indicator of economic health. Falling copper prices often signal reduced industrial demand and a global slowdown before official GDP data confirms it."
  },
  {
    question: "The 1997 Asian Financial Crisis started in:",
    options: ["Japan", "China", "Thailand", "South Korea"],
    correctIndex: 2,
    explanation: "The 1997 Asian Financial Crisis began in Thailand when the Thai baht collapsed. Within months, contagion had devastated South Korea, Indonesia, and Malaysia through interconnected banking and trade systems."
  },
  {
    question: "High inflation in a country typically causes its currency to:",
    options: ["Strengthen against other currencies", "Weaken as purchasing power erodes", "Remain stable due to central bank intervention", "Appreciate due to higher interest rates"],
    correctIndex: 1,
    explanation: "High inflation erodes a currency's purchasing power, making it less valuable relative to more stable currencies. This typically causes the currency to weaken in foreign exchange markets."
  },
  {
    question: "What does the US Dollar Index (DXY) measure?",
    options: ["The total amount of US dollars in circulation", "The value of the dollar against a basket of major currencies", "US inflation rate", "The Federal Reserve's interest rate policy"],
    correctIndex: 1,
    explanation: "The DXY measures the value of the US dollar against a basket of six major currencies (Euro, Yen, Pound, Canadian Dollar, Swedish Krona, Swiss Franc). It's a key indicator of global dollar strength."
  }
];

// Page 1: The World Is One Big Economy
const IntroPage = ({ handleNext }: { handleNext: () => void }) => (
  <div className="max-w-5xl mx-auto pt-16">
    <motion.div className="text-center mb-12" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
      <h1 className="text-5xl font-bold mb-4 text-gray-800">🌐 Global Markets</h1>
      <p className="text-xl text-gray-600">How World Economies Connect</p>
    </motion.div>

    <div className="space-y-6 mb-12">
      <motion.div className="p-8 rounded-3xl shadow-xl bg-white" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
        <div className="flex items-start gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-teal-500 flex items-center justify-center shadow-lg flex-shrink-0">
            <span className="text-3xl">🌍</span>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">The World Is One Big Economy</h3>
            <p className="text-gray-700 text-lg leading-relaxed">
              Every country's economy is linked to every other. When the US Federal Reserve raises interest rates, it strengthens the dollar — which makes it more expensive for emerging markets (like Brazil or Turkey) to repay their <span className="font-bold text-teal-600">dollar-denominated debts</span>.
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6 mb-6">
          <div className="flex flex-wrap items-center justify-center gap-4 text-center">
            <div className="flex flex-col">
              <span className="text-sm text-gray-600 mb-2">Fed Raises Rates</span>
              <div className="bg-teal-100 text-teal-800 font-bold text-lg px-6 py-4 rounded-xl">🇺🇸 USD ↑</div>
            </div>
            <span className="text-3xl font-bold text-gray-400">→</span>
            <div className="flex flex-col">
              <span className="text-sm text-gray-600 mb-2">Emerging Markets</span>
              <div className="bg-orange-100 text-orange-800 font-bold text-lg px-6 py-4 rounded-xl">🌍 Debt ↑</div>
            </div>
            <span className="text-3xl font-bold text-gray-400">→</span>
            <div className="flex flex-col">
              <span className="text-sm text-gray-600 mb-2">Local Currencies</span>
              <div className="bg-red-100 text-red-800 font-bold text-lg px-6 py-4 rounded-xl">📉 Weaken</div>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div className="p-8 rounded-3xl shadow-xl bg-white" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
        <h3 className="text-2xl font-bold text-gray-800 mb-4">Real-World Example: China & Australia</h3>
        <p className="text-gray-700 text-lg leading-relaxed mb-4">
          When China's factories slow down, Australian iron ore exports collapse. This isn't coincidence — it's the architecture of modern global trade and capital flows.
        </p>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
            <p className="font-semibold text-red-900 mb-2">🇨🇳 China Slowdown</p>
            <p className="text-sm text-red-800">Factories reduce production → Less demand for raw materials</p>
          </div>
          <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4">
            <p className="font-semibold text-amber-900 mb-2">🇦🇺 Australia Impact</p>
            <p className="text-sm text-amber-800">Iron ore exports fall → Mining sector suffers → AUD weakens</p>
          </div>
        </div>
      </motion.div>

      <motion.div className="bg-gradient-to-r from-teal-50 to-cyan-50 border-l-4 border-teal-500 p-6 rounded-2xl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
        <p className="text-teal-900 text-lg">
          💡 <span className="font-bold">The core insight:</span> No economy is an island anymore. What happens in one country ripples across the globe through trade, capital flows, and investor sentiment.
        </p>
      </motion.div>
    </div>

    <div className="flex justify-center pb-12">
      <button onClick={handleNext} className="px-10 py-4 rounded-2xl bg-teal-500 text-white font-bold text-lg shadow-xl hover:bg-teal-600 transition">
        Continue to Trade Flows →
      </button>
    </div>
  </div>
);

// Page 2: Trade Flows & Current Accounts
const TradeFlowsPage = ({ handlePrev, handleNext }: { handlePrev: () => void; handleNext: () => void }) => (
  <div className="max-w-5xl mx-auto pt-16">
    <motion.h2 className="text-4xl font-bold mb-4 text-center text-gray-800" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      Trade Flows & Current Accounts
    </motion.h2>
    <p className="text-center text-gray-600 mb-8 text-lg">Understanding how countries trade with each other</p>

    <div className="space-y-6 mb-8">
      <motion.div className="bg-white border-2 border-teal-200 rounded-3xl p-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h3 className="text-2xl font-bold text-teal-800 mb-4">Comparative Advantage</h3>
        <p className="text-gray-700 mb-6">Countries export what they produce cheaply and import what others produce cheaply. This principle drives global trade.</p>

        <div className="grid md:grid-cols-3 gap-4">
          {[
            { icon: "🇨🇳", title: "China", desc: "Manufacturing powerhouse", example: "Electronics, textiles, machinery" },
            { icon: "🇸🇦", title: "Saudi Arabia", desc: "Oil & energy resources", example: "Crude oil, petrochemicals" },
            { icon: "🇺🇸", title: "United States", desc: "Technology & services", example: "Software, finance, agriculture" }
          ].map((item, idx) => (
            <motion.div
              key={idx}
              className="bg-teal-50 rounded-2xl p-5 border border-teal-200"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + idx * 0.1 }}
            >
              <div className="text-4xl mb-3">{item.icon}</div>
              <h4 className="font-bold text-gray-800 mb-2">{item.title}</h4>
              <p className="text-sm text-gray-600 mb-3 leading-relaxed">{item.desc}</p>
              <div className="bg-white rounded-lg p-2 text-xs text-gray-700 italic">
                Exports: {item.example}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div className="bg-white border-2 border-cyan-200 rounded-3xl p-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <h3 className="text-2xl font-bold text-cyan-800 mb-4">The Current Account</h3>
        <p className="text-gray-700 mb-6">The current account tracks a country's net trade in goods and services plus income transfers.</p>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-green-50 rounded-2xl p-6 border-2 border-green-300">
            <h4 className="font-bold text-lg text-green-900 mb-3">📈 Surplus Countries</h4>
            <p className="text-gray-700 mb-4">Earn more from the world than they spend</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 bg-white rounded-lg p-2">
                <span>🇩🇪</span><span className="text-sm font-medium">Germany</span>
              </div>
              <div className="flex items-center gap-2 bg-white rounded-lg p-2">
                <span>🇨🇳</span><span className="text-sm font-medium">China</span>
              </div>
              <div className="flex items-center gap-2 bg-white rounded-lg p-2">
                <span>🇯🇵</span><span className="text-sm font-medium">Japan</span>
              </div>
            </div>
          </div>

          <div className="bg-red-50 rounded-2xl p-6 border-2 border-red-300">
            <h4 className="font-bold text-lg text-red-900 mb-3">📉 Deficit Countries</h4>
            <p className="text-gray-700 mb-4">Consume more than they earn</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 bg-white rounded-lg p-2">
                <span>🇺🇸</span><span className="text-sm font-medium">United States</span>
              </div>
              <div className="flex items-center gap-2 bg-white rounded-lg p-2">
                <span>🇬🇧</span><span className="text-sm font-medium">United Kingdom</span>
              </div>
              <div className="flex items-center gap-2 bg-white rounded-lg p-2">
                <span>🇦🇺</span><span className="text-sm font-medium">Australia</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div className="bg-gradient-to-r from-teal-50 to-cyan-50 border-l-4 border-teal-500 p-6 rounded-2xl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
        <p className="text-teal-900">
          <span className="font-bold">Why It Matters:</span> Persistent deficits can weaken a currency. Surpluses can cause diplomatic tension — the US-China trade war was partly a current account dispute about China's massive trade surplus with America.
        </p>
      </motion.div>
    </div>

    <div className="flex justify-center gap-4 pb-12">
      <button onClick={handlePrev} className="px-8 py-4 rounded-2xl border-2 border-teal-400 bg-white text-teal-600 font-semibold text-lg shadow-lg hover:bg-teal-50">
        ← Back
      </button>
      <button onClick={handleNext} className="px-8 py-4 rounded-2xl bg-teal-500 text-white font-semibold text-lg shadow-lg hover:bg-teal-600">
        Next →
      </button>
    </div>
  </div>
);

// Page 3: Exchange Rates & Why They Move
const ExchangeRatesPage = ({ handlePrev, handleNext }: { handlePrev: () => void; handleNext: () => void }) => (
  <div className="max-w-5xl mx-auto pt-16">
    <motion.h2 className="text-4xl font-bold mb-4 text-center text-gray-800" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      Exchange Rates & Why They Move
    </motion.h2>
    <p className="text-center text-gray-600 mb-8 text-lg">The forces that drive currency values</p>

    <div className="space-y-6 mb-8">
      <motion.div className="bg-white border-2 border-teal-200 rounded-3xl p-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h3 className="text-2xl font-bold text-teal-800 mb-6">What Moves Exchange Rates?</h3>
        <p className="text-gray-700 mb-6">An exchange rate is simply the price of one currency in terms of another. Four key factors drive movements:</p>

        <div className="grid md:grid-cols-2 gap-4">
          {[
            { icon: "📊", title: "Interest Rate Differentials", desc: "Higher rates attract foreign capital, strengthening the currency. If the Fed raises rates while ECB doesn't, money flows to USD.", color: "blue" },
            { icon: "📈", title: "Inflation", desc: "High inflation erodes purchasing power, weakening the currency. Countries with stable, low inflation tend to have stronger currencies.", color: "red" },
            { icon: "⚖️", title: "Trade Balances", desc: "Countries that export more than they import have higher demand for their currency from foreign buyers.", color: "green" },
            { icon: "🧠", title: "Market Sentiment", desc: "Risk-on vs risk-off moods. During crises, investors flee to 'safe havens' like USD, JPY, and CHF.", color: "purple" }
          ].map((item, idx) => (
            <motion.div
              key={idx}
              className={`bg-${item.color}-50 rounded-2xl p-5 border-2 border-${item.color}-200`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + idx * 0.1 }}
              style={{ backgroundColor: item.color === 'blue' ? '#eff6ff' : item.color === 'red' ? '#fef2f2' : item.color === 'green' ? '#f0fdf4' : '#faf5ff' }}
            >
              <div className="text-4xl mb-3">{item.icon}</div>
              <h4 className="font-bold text-gray-800 mb-2">{item.title}</h4>
              <p className="text-sm text-gray-700 leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div className="bg-white border-2 border-amber-200 rounded-3xl p-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <h3 className="text-2xl font-bold text-amber-800 mb-4">🇯🇵 Case Study: The Weakening Yen (2022-23)</h3>
        <p className="text-gray-700 mb-6">A textbook example of interest rate differentials in action:</p>

        <div className="bg-amber-50 rounded-2xl p-6 border border-amber-200">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Bank of Japan</p>
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <p className="text-3xl font-bold text-amber-600">~0%</p>
                <p className="text-xs text-gray-500 mt-1">Kept rates near zero</p>
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">vs. US Federal Reserve</p>
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <p className="text-3xl font-bold text-blue-600">5%+</p>
                <p className="text-xs text-gray-500 mt-1">Raised rates aggressively</p>
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Result</p>
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <p className="text-3xl font-bold text-red-600">¥150/$</p>
                <p className="text-xs text-gray-500 mt-1">Yen fell to 30-year low</p>
              </div>
            </div>
          </div>
          <p className="text-sm text-amber-800 mt-4 text-center">
            Capital fled yen for higher-yielding currencies like USD, causing massive yen depreciation.
          </p>
        </div>
      </motion.div>

      <motion.div className="bg-gradient-to-r from-teal-50 to-cyan-50 border-l-4 border-teal-500 p-6 rounded-2xl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
        <p className="text-teal-900">
          <span className="font-bold">Key Insight:</span> Currency movements aren't random — they follow predictable patterns based on interest rates, inflation, trade, and sentiment. Understanding these forces helps you anticipate market moves.
        </p>
      </motion.div>
    </div>

    <div className="flex justify-center gap-4 pb-12">
      <button onClick={handlePrev} className="px-8 py-4 rounded-2xl border-2 border-teal-400 bg-white text-teal-600 font-semibold text-lg shadow-lg hover:bg-teal-50">
        ← Back
      </button>
      <button onClick={handleNext} className="px-8 py-4 rounded-2xl bg-teal-500 text-white font-semibold text-lg shadow-lg hover:bg-teal-600">
        Next →
      </button>
    </div>
  </div>
);

// Page 4: Contagion — How Crises Spread
const ContagionPage = ({ handlePrev, handleNext }: { handlePrev: () => void; handleNext: () => void }) => (
  <div className="max-w-5xl mx-auto pt-16">
    <motion.h2 className="text-4xl font-bold mb-4 text-center text-gray-800" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      Contagion: How Crises Spread
    </motion.h2>
    <p className="text-center text-gray-600 mb-8 text-lg">Why your stocks fall when something happens on the other side of the world</p>

    <div className="space-y-6 mb-8">
      <motion.div className="bg-white border-2 border-red-200 rounded-3xl p-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h3 className="text-2xl font-bold text-red-800 mb-4">Three Channels of Contagion</h3>
        <p className="text-gray-700 mb-6">Financial crises spread through interconnected systems:</p>

        <div className="grid md:grid-cols-3 gap-4">
          {[
            { icon: "🏦", title: "Banking Linkages", desc: "Banks in different countries hold each other's debt. When one fails, it creates losses across borders.", example: "2008: US bank failures hit European banks holding subprime debt" },
            { icon: "📦", title: "Trade Channels", desc: "Recessions cut imports, spreading economic pain to trading partners.", example: "US recession → less imports from China → Chinese factory layoffs" },
            { icon: "😰", title: "Sentiment", desc: "Investors flee all 'risky' assets at once during panic, regardless of fundamentals.", example: "Thai crisis 1997 → investors pulled from ALL emerging markets" }
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
              <div className="bg-white rounded-lg p-2 text-xs text-red-800 italic">
                {item.example}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div className="bg-white border-2 border-gray-300 rounded-3xl overflow-hidden" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <div className="bg-gray-800 text-white p-4 text-center">
          <h3 className="text-2xl font-bold">Historical Contagion Events</h3>
        </div>

        <div className="grid md:grid-cols-2 gap-0">
          <div className="bg-amber-50 p-6 border-r-2 border-gray-300">
            <h4 className="font-bold text-xl text-amber-900 mb-4">🌏 1997 Asian Financial Crisis</h4>
            <div className="space-y-3">
              <div className="bg-white rounded-xl p-4 border border-amber-200">
                <p className="font-semibold text-amber-800 mb-1">Origin: Thailand</p>
                <p className="text-sm text-gray-700">Thai baht collapsed after speculative attacks</p>
              </div>
              <div className="bg-white rounded-xl p-4 border border-amber-200">
                <p className="font-semibold text-amber-800 mb-1">Spread</p>
                <p className="text-sm text-gray-700">Within months: South Korea, Indonesia, Malaysia all devastated</p>
              </div>
              <div className="bg-white rounded-xl p-4 border border-amber-200">
                <p className="font-semibold text-amber-800 mb-1">Mechanism</p>
                <p className="text-sm text-gray-700">Investors pulled capital from ALL Asian markets indiscriminately</p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 p-6">
            <h4 className="font-bold text-xl text-blue-900 mb-4">🏠 2008 Global Financial Crisis</h4>
            <div className="space-y-3">
              <div className="bg-white rounded-xl p-4 border border-blue-200">
                <p className="font-semibold text-blue-800 mb-1">Origin: United States</p>
                <p className="text-sm text-gray-700">Subprime mortgage collapse, Lehman Brothers failure</p>
              </div>
              <div className="bg-white rounded-xl p-4 border border-blue-200">
                <p className="font-semibold text-blue-800 mb-1">Spread</p>
                <p className="text-sm text-gray-700">Global recession within a year — no major economy spared</p>
              </div>
              <div className="bg-white rounded-xl p-4 border border-blue-200">
                <p className="font-semibold text-blue-800 mb-1">Mechanism</p>
                <p className="text-sm text-gray-700">Banks worldwide held toxic US mortgage securities</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div className="bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-500 p-6 rounded-2xl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
        <p className="text-red-900">
          <span className="font-bold">Key Takeaway:</span> Understanding contagion explains why your country's stocks fall when something happens on the other side of the world. In a connected global economy, no market is truly isolated.
        </p>
      </motion.div>
    </div>

    <div className="flex justify-center gap-4 pb-12">
      <button onClick={handlePrev} className="px-8 py-4 rounded-2xl border-2 border-teal-400 bg-white text-teal-600 font-semibold text-lg shadow-lg hover:bg-teal-50">
        ← Back
      </button>
      <button onClick={handleNext} className="px-8 py-4 rounded-2xl bg-teal-500 text-white font-semibold text-lg shadow-lg hover:bg-teal-600">
        Next →
      </button>
    </div>
  </div>
);

// Page 5: Reading the Global Dashboard
const GlobalDashboardPage = ({ handlePrev, handleNext }: { handlePrev: () => void; handleNext: () => void }) => (
  <div className="max-w-5xl mx-auto pt-16">
    <motion.h2 className="text-4xl font-bold mb-4 text-center text-gray-800" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      Reading the Global Dashboard
    </motion.h2>
    <p className="text-center text-gray-600 mb-8 text-lg">Key indicators that professional investors and policymakers monitor</p>

    <div className="space-y-6 mb-8">
      <motion.div className="bg-white border-2 border-teal-200 rounded-3xl p-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h3 className="text-2xl font-bold text-teal-800 mb-6">The Global Dashboard</h3>
        <p className="text-gray-700 mb-6">Investors and policymakers monitor a short list of indicators to read global economic health:</p>

        <div className="grid md:grid-cols-2 gap-4">
          {[
            {
              icon: "📊",
              title: "US 10-Year Treasury Yield",
              desc: "The 'risk-free' rate the whole world prices off",
              impact: "When it rises sharply, assets globally reprice",
              color: "blue"
            },
            {
              icon: "💵",
              title: "US Dollar Index (DXY)",
              desc: "Measures dollar strength against major currencies",
              impact: "Strong dollar = pressure on emerging markets",
              color: "green"
            },
            {
              icon: "🛢️",
              title: "Commodity Prices",
              desc: "Oil, copper, wheat — proxies for global demand",
              impact: "Falling copper often signals slowdown before GDP confirms it",
              color: "amber"
            },
            {
              icon: "🏭",
              title: "PMI Surveys",
              desc: "Purchasing Managers' Indices across major economies",
              impact: "Leading indicators of factory and services activity",
              color: "purple"
            }
          ].map((item, idx) => (
            <motion.div
              key={idx}
              className="rounded-2xl p-5 border-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + idx * 0.1 }}
              style={{
                backgroundColor: item.color === 'blue' ? '#eff6ff' : item.color === 'green' ? '#f0fdf4' : item.color === 'amber' ? '#fffbeb' : '#faf5ff',
                borderColor: item.color === 'blue' ? '#bfdbfe' : item.color === 'green' ? '#bbf7d0' : item.color === 'amber' ? '#fde68a' : '#e9d5ff'
              }}
            >
              <div className="flex items-start gap-4">
                <div className="text-4xl">{item.icon}</div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-800 mb-2">{item.title}</h4>
                  <p className="text-sm text-gray-600 mb-2">{item.desc}</p>
                  <div className="bg-white/70 rounded-lg p-2 text-xs font-medium" style={{ color: item.color === 'blue' ? '#1e40af' : item.color === 'green' ? '#166534' : item.color === 'amber' ? '#92400e' : '#7c3aed' }}>
                    💡 {item.impact}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div className="bg-white border-2 border-cyan-200 rounded-3xl p-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <h3 className="text-2xl font-bold text-cyan-800 mb-4">🔬 "Dr. Copper" — The Metal with a PhD in Economics</h3>
        <p className="text-gray-700 mb-6">
          Copper is called "Dr. Copper" because it's used in everything from wiring to electronics to construction. Its price is a leading indicator of economic health.
        </p>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-green-50 rounded-2xl p-6 border-2 border-green-300">
            <h4 className="font-bold text-lg text-green-900 mb-3">📈 Rising Copper Prices</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                Strong industrial demand
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                Economic expansion ahead
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                Construction & manufacturing growing
              </li>
            </ul>
          </div>

          <div className="bg-red-50 rounded-2xl p-6 border-2 border-red-300">
            <h4 className="font-bold text-lg text-red-900 mb-3">📉 Falling Copper Prices</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-center gap-2">
                <span className="text-red-600">✗</span>
                Reduced industrial demand
              </li>
              <li className="flex items-center gap-2">
                <span className="text-red-600">✗</span>
                Global slowdown signal
              </li>
              <li className="flex items-center gap-2">
                <span className="text-red-600">✗</span>
                Often leads GDP data by months
              </li>
            </ul>
          </div>
        </div>
      </motion.div>

      <motion.div className="bg-gradient-to-r from-teal-50 to-cyan-50 border-l-4 border-teal-500 p-6 rounded-2xl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
        <p className="text-teal-900">
          <span className="font-bold">Pro Tip:</span> You don't need to be a professional to use these indicators. Watching the 10-year yield, dollar strength, and commodity prices gives you a real-time view of global economic health — often before the news reports it.
        </p>
      </motion.div>
    </div>

    <div className="flex justify-center gap-4 pb-12">
      <button onClick={handlePrev} className="px-8 py-4 rounded-2xl border-2 border-teal-400 bg-white text-teal-600 font-semibold text-lg shadow-lg hover:bg-teal-50">
        ← Back
      </button>
      <button onClick={handleNext} className="px-8 py-4 rounded-2xl bg-teal-500 text-white font-semibold text-lg shadow-lg hover:bg-teal-600">
        Play Game 1 →
      </button>
    </div>
  </div>
);

// Game 1: Chain Builder - Sequence the economic domino effects
interface ChainBuilderProps {
  handlePrev: () => void;
  handleNext: () => void;
}

const ChainBuilderGame = ({ handlePrev, handleNext }: ChainBuilderProps) => {
  const scenarios = [
    {
      id: 1,
      event: "🇺🇸 The US Federal Reserve raises interest rates",
      steps: [
        { id: 'a', text: "US Dollar strengthens", icon: '💵' },
        { id: 'b', text: "Fed raises interest rates", icon: '🏦' },
        { id: 'c', text: "Emerging market currencies weaken", icon: '📉' },
      ],
      correctOrder: ['b', 'a', 'c'],
      explanation: "Higher US rates attract global money into the dollar. As USD strengthens, countries that borrowed in dollars suddenly owe more — their currencies weaken.",
    },
    {
      id: 2,
      event: "🇨🇳 China announces a big infrastructure spending plan",
      steps: [
        { id: 'a', text: "Commodity prices rise (iron, copper, oil)", icon: '⛏️' },
        { id: 'b', text: "China builds more roads, rails, and buildings", icon: '🏗️' },
        { id: 'c', text: "Australia and Brazil (exporters) benefit", icon: '🇦🇺' },
      ],
      correctOrder: ['b', 'a', 'c'],
      explanation: "Construction needs raw materials. China buying more iron ore and copper pushes prices up — and countries that sell those materials (like Australia) earn more.",
    },
    {
      id: 3,
      event: "🛢️ Oil supply is suddenly cut — prices spike 40%",
      steps: [
        { id: 'a', text: "Oil supply disrupted", icon: '🚢' },
        { id: 'b', text: "Prices of everything rise (inflation)", icon: '📈' },
        { id: 'c', text: "Central banks raise rates to cool inflation", icon: '🏦' },
      ],
      correctOrder: ['a', 'b', 'c'],
      explanation: "Oil is in almost everything we make and ship. When it gets more expensive, prices rise across the board — forcing central banks to raise rates to keep inflation in check.",
    },
    {
      id: 4,
      event: "🏦 A major bank suddenly collapses",
      steps: [
        { id: 'a', text: "Investors panic and sell risky assets", icon: '😱' },
        { id: 'b', text: "Bank collapse announced", icon: '🏦' },
        { id: 'c', text: "Money flows into safe havens: gold & USD", icon: '🥇' },
      ],
      correctOrder: ['b', 'a', 'c'],
      explanation: "When a big bank falls, fear spreads fast. Nobody knows who's next, so investors sell anything risky and rush into the safest assets — gold and the US dollar.",
    },
  ];

  const [currentScenario, setCurrentScenario] = useState(0);
  const [slots, setSlots] = useState<(string | null)[]>([null, null, null]);
  const [submitted, setSubmitted] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [gameCompleted, setGameCompleted] = useState(false);

  const scenario = scenarios[currentScenario];
  const pool = scenario.steps.filter(s => !slots.includes(s.id));
  const allFilled = slots.every(s => s !== null);

  const handleCardClick = (id: string) => {
    if (submitted) return;
    const firstEmpty = slots.findIndex(s => s === null);
    if (firstEmpty === -1) return;
    setSlots(prev => {
      const next = [...prev];
      next[firstEmpty] = id;
      return next;
    });
  };

  const handleSlotClick = (index: number) => {
    if (submitted || slots[index] === null) return;
    setSlots(prev => {
      const next = [...prev];
      next[index] = null;
      const filled = next.filter(s => s !== null);
      return [...filled, ...Array(3 - filled.length).fill(null)];
    });
  };

  const handleSubmit = () => {
    let correct = 0;
    slots.forEach((id, idx) => {
      if (id === scenario.correctOrder[idx]) correct++;
    });
    setTotalCorrect(prev => prev + correct);
    setCorrectCount(correct);
    setSubmitted(true);
  };

  const nextScenario = () => {
    if (currentScenario < scenarios.length - 1) {
      setCurrentScenario(c => c + 1);
      setSlots([null, null, null]);
      setSubmitted(false);
      setCorrectCount(0);
    } else {
      setGameCompleted(true);
    }
  };

  if (gameCompleted) {
    const maxScore = scenarios.length * 3;
    return (
      <div className="max-w-4xl mx-auto pt-16 pb-12">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white border-2 border-gray-200 rounded-3xl p-12 text-center shadow-xl"
        >
          <div className={`w-32 h-32 mx-auto rounded-full flex items-center justify-center mb-6 shadow-2xl ${totalCorrect >= 10 ? 'bg-green-500' : totalCorrect >= 7 ? 'bg-teal-500' : 'bg-amber-500'}`}>
            <span className="text-6xl">{totalCorrect >= 10 ? '🏆' : '🌍'}</span>
          </div>
          <h2 className="text-4xl font-black text-gray-800 mb-4">Chain Builder Complete!</h2>
          <div className="text-6xl font-black text-teal-600 mb-3">{totalCorrect}/{maxScore}</div>
          <p className="text-2xl text-gray-600 mb-8">
            {totalCorrect >= 10 ? '🎉 Excellent! You understand how economic shocks ripple!' : totalCorrect >= 7 ? '👍 Good work! You grasp the basics of contagion.' : '💪 Keep at it! Economic chains take practice.'}
          </p>
          <div className="inline-block bg-teal-100 text-teal-800 px-8 py-3 rounded-full font-bold text-lg mb-8 shadow-md">
            {totalCorrect >= 10 ? '+400 XP' : totalCorrect >= 7 ? '+250 XP' : '+150 XP'}
          </div>
          <div className="bg-teal-50 border-2 border-teal-200 rounded-2xl p-6">
            <h3 className="font-bold text-teal-900 mb-2">🎯 Key Insight</h3>
            <p className="text-teal-800">Economic events don't hit markets randomly — they follow logical chains. Mastering these sequences helps you anticipate market moves before they happen.</p>
          </div>
        </motion.div>
        <div className="flex justify-center gap-4 mt-8">
          <button onClick={handlePrev} className="px-8 py-4 rounded-2xl border-2 border-teal-400 bg-white text-teal-600 font-semibold text-lg shadow-lg hover:bg-teal-50">
            ← Back
          </button>
          <button onClick={handleNext} className="px-8 py-4 rounded-2xl bg-teal-500 text-white font-semibold text-lg shadow-lg hover:bg-teal-600">
            Next: Market Oracle →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pt-16 pb-12">
      <motion.h2 className="text-4xl font-bold mb-4 text-center text-gray-800" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        🔗 Chain Builder
      </motion.h2>
      <p className="text-center text-gray-600 mb-2 text-lg">Arrange the effects in the order they'd actually happen</p>

      <div className="flex justify-center mb-6">
        <div className="bg-white/90 backdrop-blur-md px-6 py-2 rounded-full shadow-md border-2 border-teal-200">
          <span className="text-teal-600 font-bold text-sm">Scenario {currentScenario + 1} of {scenarios.length}</span>
        </div>
      </div>

      {/* Event */}
      <motion.div
        key={currentScenario}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-2xl p-6 mb-6 shadow-xl"
      >
        <p className="text-red-100 text-sm uppercase tracking-wider font-bold mb-2">🚨 Economic Event</p>
        <h3 className="text-2xl font-bold">{scenario.event}</h3>
      </motion.div>

      {/* Slots */}
      <div className="mb-6">
        <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Your sequence (click a placed card to remove it):</p>
        <div className="space-y-2">
          {slots.map((slotId, idx) => {
            const step = slotId ? scenario.steps.find(s => s.id === slotId) : null;
            const isCorrect = submitted && slotId === scenario.correctOrder[idx];
            const isWrong = submitted && slotId && slotId !== scenario.correctOrder[idx];
            return (
              <motion.button
                key={idx}
                onClick={() => handleSlotClick(idx)}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all ${
                  step
                    ? submitted
                      ? isCorrect
                        ? 'bg-green-50 border-green-400'
                        : 'bg-red-50 border-red-400'
                      : 'bg-white border-teal-300 hover:border-teal-500 cursor-pointer'
                    : 'bg-gray-50 border-dashed border-gray-300 cursor-default'
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shrink-0 ${
                  step
                    ? submitted
                      ? isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                      : 'bg-teal-500 text-white'
                    : 'bg-gray-200 text-gray-400'
                }`}>
                  {idx + 1}
                </div>
                {step ? (
                  <>
                    <span className="text-2xl">{step.icon}</span>
                    <span className="text-gray-800 font-medium flex-1">{step.text}</span>
                    {submitted && isCorrect && <span className="text-green-600 text-xl">✓</span>}
                    {submitted && isWrong && <span className="text-red-600 text-xl">✗</span>}
                  </>
                ) : (
                  <span className="text-gray-400 italic">Click a card below to place here...</span>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Card Pool */}
      {!submitted && pool.length > 0 && (
        <div className="mb-6">
          <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Available cards (click to place next):</p>
          <div className="space-y-2">
            {pool.map(step => (
              <motion.button
                key={step.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => handleCardClick(step.id)}
                className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-gray-200 bg-white hover:border-teal-400 hover:bg-teal-50 text-left transition-all shadow-sm"
              >
                <span className="text-2xl">{step.icon}</span>
                <span className="text-gray-800 font-medium">{step.text}</span>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Explanation after submit */}
      {submitted && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900 text-white p-6 rounded-2xl mb-6"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl ${correctCount === 3 ? 'bg-green-500' : correctCount === 2 ? 'bg-teal-500' : 'bg-amber-500'}`}>
              {correctCount}/3
            </div>
            <div>
              <h4 className="font-bold text-teal-400 uppercase tracking-wider text-sm">Result</h4>
              <p className="text-white font-bold">{correctCount === 3 ? 'Perfect!' : correctCount === 2 ? 'Almost!' : 'Keep learning!'}</p>
            </div>
          </div>
          <p className="text-slate-300 leading-relaxed mb-4">{scenario.explanation}</p>

          <div className="bg-white/10 rounded-xl p-4">
            <p className="text-teal-400 font-bold text-sm uppercase tracking-wider mb-3">Correct Sequence:</p>
            <div className="space-y-2">
              {scenario.correctOrder.map((id, idx) => {
                const step = scenario.steps.find(s => s.id === id)!;
                return (
                  <div key={idx} className="flex items-center gap-3">
                    <span className="w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0">{idx + 1}</span>
                    <span className="text-xl">{step.icon}</span>
                    <span className="text-slate-200 text-sm">{step.text}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            onClick={nextScenario}
            className="w-full mt-4 px-6 py-4 bg-teal-500 text-white rounded-xl font-bold hover:bg-teal-600 transition text-lg"
          >
            {currentScenario < scenarios.length - 1 ? 'Next Scenario →' : 'See Final Results'}
          </button>
        </motion.div>
      )}

      <div className="flex justify-center gap-4">
        <button onClick={handlePrev} className="px-8 py-4 rounded-2xl border-2 border-teal-400 bg-white text-teal-600 font-semibold text-lg shadow-lg hover:bg-teal-50">
          ← Back
        </button>
        {!submitted && allFilled && (
          <button
            onClick={handleSubmit}
            className="px-8 py-4 rounded-2xl bg-teal-500 text-white font-semibold text-lg shadow-lg hover:bg-teal-600 transition"
          >
            Submit Sequence →
          </button>
        )}
      </div>
    </div>
  );
};

// Game 2: Market Oracle - Situation-based market prediction game
interface MarketOracleProps {
  handlePrev: () => void;
  handleNext: () => void;
}

type Prediction = 'up' | 'down' | 'stable';

interface OracleIndicator {
  name: string;
  icon: string;
  correct: Prediction;
  explanation: string;
}

interface OracleSituation {
  id: number;
  headline: string;
  context: string;
  stats: { label: string; value: string }[];
  indicators: OracleIndicator[];
}

const MarketOracleGame = ({ handlePrev, handleNext }: MarketOracleProps) => {
  const situations: OracleSituation[] = [
    {
      id: 1,
      headline: "🇺🇸 US Federal Reserve hikes rates by 0.75% — largest move in 30 years",
      context: "US inflation hits 8.5%, the highest since 1981. The Fed responds with a historically large rate hike to cool the overheating economy. Markets had expected only 0.5%.",
      stats: [
        { label: "US Inflation", value: "8.5%" },
        { label: "Fed Rate (before)", value: "1.75%" },
        { label: "Fed Rate (after)", value: "2.5%" },
        { label: "Market surprise", value: "High" },
      ],
      indicators: [
        { name: "US Dollar (DXY)", icon: "💵", correct: 'up', explanation: "Higher US rates make USD more attractive to global investors seeking yield — demand for dollars surges" },
        { name: "Gold price", icon: "🥇", correct: 'down', explanation: "Gold pays no yield — higher rates increase the opportunity cost of holding non-yielding gold" },
        { name: "US Stock market (S&P 500)", icon: "📈", correct: 'down', explanation: "Higher rates reduce the present value of future corporate earnings and make bonds more competitive than stocks" },
        { name: "Emerging market bonds", icon: "🌍", correct: 'down', explanation: "Capital flees EM assets toward safer, higher-yielding US Treasuries — EM bond prices crash" },
      ],
    },
    {
      id: 2,
      headline: "🇨🇳 China announces surprise $1 trillion infrastructure stimulus package",
      context: "China's economy has been slowing for three quarters. The government responds with the largest stimulus package in a decade, focused on rail, roads, and energy infrastructure.",
      stats: [
        { label: "China GDP growth", value: "3.2% (below target)" },
        { label: "Stimulus size", value: "$1 trillion" },
        { label: "Focus sector", value: "Infrastructure" },
        { label: "Construction expected", value: "+40%" },
      ],
      indicators: [
        { name: "Copper price", icon: "⚙️", correct: 'up', explanation: "Infrastructure is copper-intensive — wiring, pipes, and machinery all require copper, driving demand sharply higher" },
        { name: "Australian Dollar (AUD)", icon: "🇦🇺", correct: 'up', explanation: "Australia's biggest export is iron ore to China — a Chinese construction boom directly boosts AUD" },
        { name: "US Dollar (DXY)", icon: "💵", correct: 'down', explanation: "Improving global growth outlook reduces demand for safe-haven USD — risk appetite returns globally" },
        { name: "Oil price", icon: "🛢️", correct: 'up', explanation: "More construction and manufacturing means more energy demand — oil prices rise with the activity surge" },
      ],
    },
    {
      id: 3,
      headline: "🇯🇵 Bank of Japan shocks markets — raises rates for first time in 25 years",
      context: "Japan has kept rates near zero for decades. The BoJ suddenly raises rates by 0.25%, catching global traders off-guard. Trillions in 'carry trades' — borrowing cheap yen to buy higher-yielding assets — begin to unwind.",
      stats: [
        { label: "BoJ Rate (before)", value: "0.1%" },
        { label: "BoJ Rate (after)", value: "0.35%" },
        { label: "JPY carry trades", value: "~$4 trillion" },
        { label: "Market surprise level", value: "Extreme" },
      ],
      indicators: [
        { name: "Japanese Yen (JPY)", icon: "🇯🇵", correct: 'up', explanation: "Higher Japanese rates make yen more attractive — and carry trade unwinding forces massive buying of JPY to repay loans" },
        { name: "Global stock markets", icon: "📊", correct: 'down', explanation: "Carry trade unwind forces liquidation of global assets — stocks, EM currencies, and crypto all fall as traders rush to cover positions" },
        { name: "US Treasury bonds", icon: "📋", correct: 'up', explanation: "Safe-haven demand surges during market turmoil — investors flee to quality US government bonds, pushing prices up" },
        { name: "Emerging market currencies", icon: "🌍", correct: 'down', explanation: "EM assets were popular carry trade targets — unwinding means massive selling of EM currencies and bonds" },
      ],
    },
    {
      id: 4,
      headline: "🛢️ OPEC announces surprise 2 million barrel/day oil production cut",
      context: "Oil-producing nations decide to slash output to support prices. Global oil supply tightens overnight. Most economists had expected OPEC to hold production steady.",
      stats: [
        { label: "Production cut", value: "2M barrels/day" },
        { label: "Current oil price", value: "$75/barrel" },
        { label: "Global supply share", value: "~2% removed" },
        { label: "Major importers", value: "US, China, India, EU" },
      ],
      indicators: [
        { name: "Oil price (Brent crude)", icon: "🛢️", correct: 'up', explanation: "Less supply with same demand = higher prices. A 2M barrel cut is roughly 2% of global supply — a significant tightening" },
        { name: "Global inflation outlook", icon: "📈", correct: 'up', explanation: "Energy is embedded in almost every product's cost — higher oil creates broader inflation pressure across all sectors" },
        { name: "Indian Rupee (INR)", icon: "🇮🇳", correct: 'down', explanation: "India imports 85% of its oil — a supply cut dramatically increases India's import bill, pressuring the rupee lower" },
        { name: "Saudi Arabia stocks", icon: "🏦", correct: 'up', explanation: "Higher oil prices directly boost Saudi Aramco's revenue and the kingdom's fiscal position — Saudi markets rally" },
      ],
    },
    {
      id: 5,
      headline: "🏦 US banking crisis: 3 major regional banks collapse in one week",
      context: "Three US regional banks fail after bond portfolio losses are revealed. Depositors rush to withdraw funds. The government steps in with emergency backstops but market trust is deeply shaken.",
      stats: [
        { label: "Banks failed", value: "3 in 7 days" },
        { label: "Deposits at risk", value: "$400B+" },
        { label: "Root cause", value: "Bond losses + bank run" },
        { label: "Government response", value: "Emergency backstop" },
      ],
      indicators: [
        { name: "US bank stocks", icon: "🏦", correct: 'down', explanation: "Contagion fear hits all banks — investors worry about which bank is next, causing widespread sector selling" },
        { name: "Gold price", icon: "🥇", correct: 'up', explanation: "Financial crisis drives flight to the ultimate safe haven — gold surges as trust in financial systems erodes" },
        { name: "US Dollar (DXY)", icon: "💵", correct: 'down', explanation: "A US banking crisis undermines confidence in the US financial system — USD weakens as safe-haven appeal fades temporarily" },
        { name: "Bitcoin (BTC)", icon: "₿", correct: 'up', explanation: "Counterintuitively, bank crises often boost crypto — people seek assets outside the traditional financial system" },
      ],
    },
  ];

  const [currentSituation, setCurrentSituation] = useState(0);
  const [predictions, setPredictions] = useState<{ [key: string]: Prediction | null }>({});
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  const situation = situations[currentSituation];
  const allPredicted = situation.indicators.every(ind => predictions[`${currentSituation}-${ind.name}`] != null);

  const handlePredict = (indicatorName: string, prediction: Prediction) => {
    if (revealed) return;
    setPredictions(prev => ({ ...prev, [`${currentSituation}-${indicatorName}`]: prediction }));
  };

  const handleReveal = () => {
    let roundScore = 0;
    situation.indicators.forEach(ind => {
      if (predictions[`${currentSituation}-${ind.name}`] === ind.correct) roundScore++;
    });
    setScore(prev => prev + roundScore);
    setRevealed(true);
  };

  const nextSituation = () => {
    if (currentSituation < situations.length - 1) {
      setCurrentSituation(c => c + 1);
      setRevealed(false);
    } else {
      setGameCompleted(true);
    }
  };

  const predIcons: Record<Prediction, string> = { up: '↑', down: '↓', stable: '↔' };
  const predLabels: Record<Prediction, string> = { up: 'Rise', down: 'Fall', stable: 'Stable' };
  const predColors: Record<Prediction, string> = { up: 'bg-green-500', down: 'bg-red-500', stable: 'bg-gray-500' };

  if (!gameStarted) {
    return (
      <div className="max-w-4xl mx-auto pt-16 pb-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white border-2 border-gray-200 rounded-3xl p-12 shadow-xl">
          <div className="text-center mb-8">
            <div className="w-32 h-32 mx-auto bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center mb-6 shadow-2xl">
              <span className="text-6xl">🔮</span>
            </div>
            <h2 className="text-4xl font-black text-gray-800 mb-4">Market Oracle</h2>
            <p className="text-xl text-gray-600 mb-2">Situation-based market prediction game</p>
            <p className="text-gray-500">Read the situation, predict what markets do next</p>
          </div>
          <div className="bg-slate-50 rounded-2xl p-8 mb-8 border-2 border-slate-200">
            <h3 className="font-bold text-slate-900 text-xl mb-4">How It Works</h3>
            <div className="space-y-3 text-left">
              {[
                { icon: '📰', title: 'Real economic situations', desc: '5 scenarios drawn from actual global events' },
                { icon: '🎯', title: 'Predict 4 market indicators', desc: 'Will each market Rise ↑, Fall ↓, or stay Stable ↔?' },
                { icon: '💡', title: 'Learn why you\'re right or wrong', desc: 'Every answer has a clear economic explanation' },
                { icon: '📊', title: 'Score out of 20', desc: '4 indicators × 5 situations' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="text-2xl">{item.icon}</span>
                  <div>
                    <p className="font-bold text-slate-800">{item.title}</p>
                    <p className="text-slate-600 text-sm">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <button onClick={() => setGameStarted(true)} className="w-full px-8 py-5 rounded-2xl bg-gradient-to-r from-violet-500 to-purple-600 text-white font-bold text-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02]">
            Start Predicting →
          </button>
        </motion.div>
        <div className="flex justify-center gap-4 mt-8">
          <button onClick={handlePrev} className="px-8 py-4 rounded-2xl border-2 border-teal-400 bg-white text-teal-600 font-semibold text-lg shadow-lg hover:bg-teal-50">
            ← Back
          </button>
        </div>
      </div>
    );
  }

  if (gameCompleted) {
    const maxScore = situations.length * 4;
    return (
      <div className="max-w-4xl mx-auto pt-16 pb-12">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white border-2 border-gray-200 rounded-3xl p-12 text-center shadow-xl">
          <div className={`w-32 h-32 mx-auto rounded-full flex items-center justify-center mb-6 shadow-2xl ${score >= 16 ? 'bg-green-500' : score >= 12 ? 'bg-teal-500' : 'bg-amber-500'}`}>
            <span className="text-6xl">{score >= 16 ? '🔮' : score >= 12 ? '🌍' : '📚'}</span>
          </div>
          <h2 className="text-4xl font-black text-gray-800 mb-4">Oracle Complete!</h2>
          <div className="text-6xl font-black text-purple-600 mb-3">{score}/{maxScore}</div>
          <p className="text-2xl text-gray-600 mb-8">
            {score >= 16 ? '🎉 Brilliant! You read markets like a professional!' : score >= 12 ? '👍 Solid instincts! You understand the key dynamics.' : '📚 Markets are complex — each prediction teaches you something new.'}
          </p>
          <div className="inline-block bg-purple-100 text-purple-800 px-8 py-3 rounded-full font-bold text-lg mb-8 shadow-md">
            {score >= 16 ? '+500 XP' : score >= 12 ? '+350 XP' : '+200 XP'}
          </div>
          <div className="bg-purple-50 border-2 border-purple-200 rounded-2xl p-6">
            <h3 className="font-bold text-purple-900 mb-2">🎯 Key Insight</h3>
            <p className="text-purple-800">Every market move has a logical cause. The better you understand economic relationships, the better you can predict — and prepare for — global market shifts.</p>
          </div>
        </motion.div>
        <div className="flex justify-center gap-4 mt-8">
          <button onClick={handlePrev} className="px-8 py-4 rounded-2xl border-2 border-teal-400 bg-white text-teal-600 font-semibold text-lg shadow-lg hover:bg-teal-50">← Back</button>
          <button onClick={() => { setGameStarted(false); setCurrentSituation(0); setPredictions({}); setRevealed(false); setScore(0); setGameCompleted(false); }} className="px-8 py-4 rounded-2xl border-2 border-slate-400 bg-white text-slate-700 font-semibold text-lg shadow-lg hover:bg-slate-50">Play Again</button>
          <button onClick={handleNext} className="px-8 py-4 rounded-2xl bg-teal-500 text-white font-semibold text-lg shadow-lg hover:bg-teal-600">Take the Quiz →</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pt-16 pb-12">
      <div className="flex justify-between items-center mb-6">
        <motion.h2 className="text-3xl font-bold text-gray-800" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>🔮 Market Oracle</motion.h2>
        <div className="flex items-center gap-3">
          <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-full shadow-md border-2 border-purple-200">
            <span className="text-purple-600 font-bold text-sm">Situation {currentSituation + 1}/{situations.length}</span>
          </div>
          <div className="bg-purple-100 px-4 py-2 rounded-full">
            <span className="text-purple-800 font-bold text-sm">Score: {score}</span>
          </div>
        </div>
      </div>

      <motion.div key={currentSituation} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4 mb-6">
        {/* Headline */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white rounded-2xl p-6 shadow-xl">
          <p className="text-slate-400 text-xs uppercase tracking-wider font-bold mb-2">🚨 Breaking Economic News</p>
          <h3 className="text-xl font-bold">{situation.headline}</h3>
        </div>

        {/* Context + Stats */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="md:col-span-2 bg-white border-2 border-gray-200 rounded-2xl p-5">
            <h4 className="font-bold text-gray-700 text-sm uppercase tracking-wider mb-2">Context</h4>
            <p className="text-gray-700 leading-relaxed">{situation.context}</p>
          </div>
          <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-5">
            <h4 className="font-bold text-slate-600 text-sm uppercase tracking-wider mb-3">Key Data</h4>
            <div className="space-y-2">
              {situation.stats.map((stat, i) => (
                <div key={i} className="flex justify-between items-center">
                  <span className="text-xs text-slate-500">{stat.label}</span>
                  <span className="text-sm font-bold text-slate-800">{stat.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Prediction cards */}
        <div>
          <p className="font-bold text-gray-700 mb-3">Your predictions — what happens to each market?</p>
          <div className="grid md:grid-cols-2 gap-4">
            {situation.indicators.map((ind) => {
              const predKey = `${currentSituation}-${ind.name}`;
              const pred = predictions[predKey] as Prediction | null;
              const isCorrect = pred === ind.correct;
              const bgClass = revealed
                ? isCorrect ? 'bg-green-50 border-green-400' : 'bg-red-50 border-red-400'
                : 'bg-white border-gray-200';

              return (
                <div key={ind.name} className={`rounded-2xl border-2 p-5 transition-all ${bgClass}`}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">{ind.icon}</span>
                    <h4 className="font-bold text-gray-800">{ind.name}</h4>
                    {revealed && <span className={`ml-auto text-xl ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>{isCorrect ? '✓' : '✗'}</span>}
                  </div>
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {(['up', 'down', 'stable'] as Prediction[]).map(p => {
                      const isSelected = pred === p;
                      const isRevealedCorrect = revealed && p === ind.correct;
                      const isRevealedWrong = revealed && isSelected && !isCorrect && p === pred;
                      return (
                        <button
                          key={p}
                          onClick={() => handlePredict(ind.name, p)}
                          disabled={revealed}
                          className={`py-2 rounded-xl font-bold text-sm transition-all ${
                            isRevealedCorrect ? 'bg-green-500 text-white'
                            : isRevealedWrong ? 'bg-red-400 text-white'
                            : isSelected ? `${predColors[p]} text-white`
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {predIcons[p]} {predLabels[p]}
                        </button>
                      );
                    })}
                  </div>
                  {revealed && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className={`text-sm p-3 rounded-xl ${isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      <span className="font-bold">Correct: {predIcons[ind.correct]} {predLabels[ind.correct]}. </span>
                      {ind.explanation}
                    </motion.div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>

      <div className="flex justify-center gap-4">
        <button onClick={handlePrev} className="px-8 py-4 rounded-2xl border-2 border-teal-400 bg-white text-teal-600 font-semibold text-lg shadow-lg hover:bg-teal-50">← Back</button>
        {!revealed && allPredicted && (
          <button onClick={handleReveal} className="px-8 py-4 rounded-2xl bg-purple-600 text-white font-semibold text-lg shadow-lg hover:bg-purple-700 transition">
            Reveal Answers →
          </button>
        )}
        {revealed && (
          <button onClick={nextSituation} className="px-8 py-4 rounded-2xl bg-teal-500 text-white font-semibold text-lg shadow-lg hover:bg-teal-600 transition">
            {currentSituation < situations.length - 1 ? 'Next Situation →' : 'See Final Score'}
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
      <div className="bg-white rounded-3xl shadow-xl border-2 border-teal-100 overflow-hidden flex flex-col min-h-[500px]">
        <div className="flex-1 p-8 lg:p-16 flex flex-col justify-center">
          <div className="flex justify-between items-end mb-8 border-b border-gray-100 pb-6">
            <div>
              <span className="text-sm font-bold text-teal-600 uppercase tracking-wider block mb-2">
                Question {currentQuestion + 1} of {shuffledQuestions.length}
              </span>
              <h2 className="text-2xl lg:text-4xl font-bold text-slate-900 leading-tight">
                {shuffledQuestions[currentQuestion].question}
              </h2>
            </div>
            <div className="hidden lg:block text-slate-300">
              <span className="text-5xl">🌐</span>
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
                      ? 'bg-teal-50 border-teal-600 shadow-lg scale-[1.02]'
                      : 'bg-white border-slate-200 hover:border-teal-400 hover:shadow-md'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                      showCorrectness && isCorrect
                        ? 'bg-green-500 text-white'
                        : showCorrectness && isSelected
                        ? 'bg-red-500 text-white'
                        : isSelected
                        ? 'bg-teal-600 text-white'
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
                <h4 className="font-bold text-teal-400 uppercase tracking-wider text-sm mb-2">Explanation</h4>
                <p className="text-lg leading-relaxed text-slate-200">
                  {shuffledQuestions[currentQuestion].explanation}
                </p>
              </div>
              <button
                onClick={handleNextQuestion}
                className="w-full md:w-auto px-8 py-4 bg-white text-slate-900 rounded-xl font-bold hover:bg-teal-50 transition-colors whitespace-nowrap"
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
        className="bg-white rounded-3xl shadow-xl p-12 text-center border-2 border-teal-100"
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
            <p className="text-green-700 text-lg">You've mastered the Global Markets module</p>
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
const GlobalMarketsModule = () => {
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

  const modulePassed = isModulePassed(MODULES.GLOBAL_MARKETS.id);
  const totalSteps = 8; // 0:intro, 1:trade, 2:exchange, 3:contagion, 4:dashboard, 5:game1, 6:game2, 7:quiz

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
      saveScore(MODULES.GLOBAL_MARKETS.id, percentage);
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
        emoji="🌐"
        moduleName="Global Markets"
        description="You've already passed the Global Markets module. Great job understanding how world economies connect!"
        gradientClasses="from-teal-50 via-cyan-100 to-emerald-200"
        onReviewClick={() => setIsReviewMode(true)}
      />
    );
  }

  return (
    <div className="min-h-screen relative overflow-x-hidden" style={{ background: 'linear-gradient(135deg, #ccfbf1 0%, #cffafe 50%, #a5f3fc 100%)' }}>
      <button
        className="absolute top-4 left-4 px-4 py-2 rounded-lg text-teal-600 hover:bg-white/50 backdrop-blur-sm font-medium transition z-50 shadow-sm border border-teal-100"
        onClick={() => navigate('/game')}
      >
        ← Back to Roadmap
      </button>

      <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-50">
        <div className="bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full shadow-sm border border-teal-100 text-gray-600 font-semibold text-sm">
          Step {currentStep + 1} of {totalSteps}
        </div>
      </div>

      {(currentStep > 0 && (currentStep < totalSteps - 1 || (currentStep === totalSteps - 1 && currentQuestion === 0 && !showAnswerResult && !quizCompleted))) && (
        <button
          onClick={handlePrev}
          className="fixed left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-teal-500 text-white rounded-full shadow-lg hover:bg-teal-600 transition flex items-center justify-center z-40"
          aria-label="Previous"
        >
          ←
        </button>
      )}
      {currentStep < totalSteps - 1 && (
        <button
          onClick={handleNext}
          className="fixed right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-teal-500 text-white rounded-full shadow-lg hover:bg-teal-600 transition flex items-center justify-center z-40"
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
          {currentStep === 1 && <TradeFlowsPage handlePrev={handlePrev} handleNext={handleNext} />}
          {currentStep === 2 && <ExchangeRatesPage handlePrev={handlePrev} handleNext={handleNext} />}
          {currentStep === 3 && <ContagionPage handlePrev={handlePrev} handleNext={handleNext} />}
          {currentStep === 4 && <GlobalDashboardPage handlePrev={handlePrev} handleNext={handleNext} />}
          {currentStep === 5 && <ChainBuilderGame handlePrev={handlePrev} handleNext={handleNext} />}
          {currentStep === 6 && <MarketOracleGame handlePrev={handlePrev} handleNext={handleNext} />}
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

export default GlobalMarketsModule;
