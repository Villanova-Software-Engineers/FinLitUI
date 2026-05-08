import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useModuleScore, MODULES } from '../hooks/useModuleScore';
import ModuleCompletedScreen from './ModuleCompletedScreen';
import { shuffleQuizOptions } from '../utils/shuffleQuizOptions';

const quizQuestions = [
  {
    question: "What does ESG stand for?",
    options: ["Environmental, Social, Governance", "Economic, Social, Government", "Environmental, Sustainability, Growth", "Ethics, Society, Governance"],
    correctIndex: 0,
    explanation: "ESG stands for Environmental, Social, and Governance — three pillars used to evaluate a company's sustainability practices and ethical impact beyond just financial performance."
  },
  {
    question: "Which is an example of an Environmental ESG factor?",
    options: ["Board diversity", "Carbon emissions reduction", "Employee wages", "Executive compensation"],
    correctIndex: 1,
    explanation: "Carbon emissions reduction is an Environmental factor. It measures a company's impact on the natural world — including climate, pollution, water use, and resource consumption."
  },
  {
    question: "A company's policies on employee health and safety fall under which ESG pillar?",
    options: ["Environmental", "Social", "Governance", "Financial"],
    correctIndex: 1,
    explanation: "Employee health and safety is a Social (S) factor. The Social pillar covers how a company manages relationships with employees, suppliers, customers, and the broader community."
  },
  {
    question: "What is 'negative screening' in ESG investing?",
    options: ["Investing only in low-ESG companies", "Excluding certain industries like tobacco or weapons", "Analyzing only negative news about companies", "Short-selling non-ESG companies"],
    correctIndex: 1,
    explanation: "Negative screening means deliberately excluding certain industries or companies (like tobacco, weapons, or fossil fuels) that conflict with the investor's ethical values — a key ESG strategy."
  },
  {
    question: "Board independence and anti-corruption policies fall under which ESG pillar?",
    options: ["Environmental", "Social", "Governance", "None of the above"],
    correctIndex: 2,
    explanation: "Board independence and anti-corruption policies are Governance (G) factors. Governance covers how a company is led and controlled — including board structure, executive pay, and transparency."
  },
  {
    question: "What term describes a company falsely claiming to be environmentally friendly?",
    options: ["Blue-washing", "Greenwashing", "Impact investing", "ESG screening"],
    correctIndex: 1,
    explanation: "Greenwashing is when a company exaggerates or fabricates its environmental credentials to attract ESG-minded investors, without making real substantive changes to its practices."
  },
  {
    question: "Impact investing differs from ESG investing primarily because it...",
    options: ["Focuses only on environmental issues", "Measures specific, intentional positive outcomes", "Avoids all equities", "Only invests in government bonds"],
    correctIndex: 1,
    explanation: "Impact investing goes further than ESG by targeting measurable, intentional positive social or environmental outcomes — for example, funding a solar farm that will power 10,000 homes."
  },
  {
    question: "Which trend has driven massive growth in ESG investing globally?",
    options: ["ESG always outperforms traditional investing", "Investors want portfolios aligned with their values", "Governments require ESG for all funds", "ESG eliminates investment risk"],
    correctIndex: 1,
    explanation: "The surge in ESG investing is primarily driven by a generational shift — especially among millennials and Gen Z — who want their investments to reflect their personal values alongside returns."
  },
  {
    question: "Shareholder rights and executive pay transparency are examples of which ESG factor?",
    options: ["Environmental", "Social", "Governance", "Regulatory"],
    correctIndex: 2,
    explanation: "Shareholder rights and executive pay transparency are Governance (G) factors. Strong governance ensures companies are accountable, transparent, and managed in shareholders' long-term interests."
  },
  {
    question: "According to ESG research, strong ESG practices in a company typically...",
    options: ["Guarantee higher returns in all market conditions", "May reduce long-term risk and attract patient capital", "Have no impact on financial performance", "Only matter to nonprofit organizations"],
    correctIndex: 1,
    explanation: "Research suggests companies with strong ESG practices tend to manage risk better, attract long-term investors, and build more resilient businesses — though ESG alone doesn't guarantee returns."
  }
];

// Page 1: Intro
const IntroPage = ({ handleNext }: { handleNext: () => void }) => (
  <div className="max-w-5xl mx-auto pt-16">
    <motion.div className="text-center mb-12" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
      <h1 className="text-5xl font-bold mb-4 text-gray-800">🌱 ESG & Ethical Investing</h1>
      <p className="text-xl text-gray-600">Investing aligned with your values — and growing globally</p>
    </motion.div>

    <div className="space-y-6 mb-12">
      <motion.div className="p-8 rounded-3xl shadow-xl bg-white" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
        <div className="flex items-start gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-green-500 flex items-center justify-center shadow-lg flex-shrink-0">
            <span className="text-3xl">🌍</span>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">What is ESG Investing?</h3>
            <p className="text-gray-700 text-lg leading-relaxed">
              ESG investing means evaluating companies not only on <span className="font-bold text-green-600">financial performance</span>, but also on how they treat the planet, people, and how they're run. ESG stands for <span className="font-bold">Environmental, Social, and Governance</span>.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {[
            { letter: "E", label: "Environmental", color: "bg-green-100 border-green-300 text-green-800", icon: "🌿", desc: "Planet impact: climate, pollution, energy" },
            { letter: "S", label: "Social", color: "bg-blue-100 border-blue-300 text-blue-800", icon: "🤝", desc: "People: workers, communities, supply chains" },
            { letter: "G", label: "Governance", color: "bg-purple-100 border-purple-300 text-purple-800", icon: "🏛️", desc: "Leadership: board, ethics, transparency" },
          ].map((item, idx) => (
            <motion.div
              key={idx}
              className={`${item.color} border-2 rounded-2xl p-5 text-center`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + idx * 0.15 }}
            >
              <div className="text-4xl mb-2">{item.icon}</div>
              <div className="text-5xl font-black mb-1">{item.letter}</div>
              <div className="font-bold text-lg mb-2">{item.label}</div>
              <div className="text-sm">{item.desc}</div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div className="p-8 rounded-3xl shadow-xl bg-white" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
        <h3 className="text-2xl font-bold text-gray-800 mb-4">Why ESG Is Exploding Globally</h3>
        <div className="grid md:grid-cols-2 gap-5">
          {[
            { icon: "📈", stat: "$35+ Trillion", label: "Global ESG Assets Under Management (2024)" },
            { icon: "👥", stat: "~76%", label: "of millennials prefer ESG-aligned investments" },
            { icon: "🌐", stat: "3,000+", label: "companies now report ESG data annually" },
            { icon: "⚖️", stat: "80%+", label: "of S&P 500 companies publish sustainability reports" },
          ].map((item, idx) => (
            <motion.div
              key={idx}
              className="bg-green-50 border-2 border-green-200 rounded-xl p-4 flex items-center gap-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + idx * 0.1 }}
            >
              <span className="text-3xl">{item.icon}</span>
              <div>
                <div className="font-black text-green-700 text-xl">{item.stat}</div>
                <div className="text-sm text-gray-600">{item.label}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div className="bg-gradient-to-r from-green-50 to-teal-50 border-l-4 border-green-500 p-6 rounded-2xl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
        <p className="text-green-900 text-lg">
          💡 <span className="font-bold">Think of it this way:</span> Traditional investing asks "Will I make money?" ESG investing adds "Will the world be better because of where my money goes?" You can aim for both.
        </p>
      </motion.div>
    </div>

    <div className="flex justify-center pb-12">
      <button onClick={handleNext} className="px-10 py-4 rounded-2xl bg-green-500 text-white font-bold text-lg shadow-xl hover:bg-green-600 transition">
        Explore Environmental →
      </button>
    </div>
  </div>
);

// Page 2: Environmental
const EnvironmentalPage = ({ handlePrev, handleNext }: { handlePrev: () => void; handleNext: () => void }) => (
  <div className="max-w-5xl mx-auto pt-16">
    <motion.h2 className="text-4xl font-bold mb-4 text-center text-gray-800" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      🌿 E — Environmental
    </motion.h2>
    <p className="text-center text-gray-600 mb-8 text-lg">How a company impacts our planet and natural resources</p>

    <div className="space-y-6 mb-8">
      <motion.div className="bg-white border-2 border-green-200 rounded-3xl p-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h3 className="text-2xl font-bold text-green-800 mb-6">Key Environmental Factors</h3>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { icon: "💨", title: "Carbon Emissions", desc: "Greenhouse gas output from operations and supply chain", example: "Tesla's zero tailpipe emissions vs. traditional automakers" },
            { icon: "⚡", title: "Clean Energy Use", desc: "Percentage of energy from renewable sources", example: "Apple runs 100% on renewable energy in its facilities" },
            { icon: "💧", title: "Water Management", desc: "Water usage efficiency and pollution prevention", example: "Beverage companies reducing water per unit produced" },
            { icon: "♻️", title: "Waste & Recycling", desc: "Reducing landfill waste, circular economy practices", example: "H&M's clothing recycling take-back programs" },
            { icon: "🌲", title: "Biodiversity", desc: "Impact on ecosystems, deforestation, land use", example: "Palm oil companies committing to zero deforestation" },
            { icon: "🌡️", title: "Climate Strategy", desc: "Plans to align with Paris Agreement targets", example: "Net-zero commitments by 2050 from major corporations" },
          ].map((item, idx) => (
            <motion.div
              key={idx}
              className="bg-green-50 rounded-2xl p-5 border border-green-200"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + idx * 0.1 }}
            >
              <div className="text-4xl mb-3">{item.icon}</div>
              <h4 className="font-bold text-gray-800 mb-2">{item.title}</h4>
              <p className="text-sm text-gray-600 mb-3 leading-relaxed">{item.desc}</p>
              <div className="bg-white rounded-lg p-2 text-xs text-gray-700 italic">Ex: {item.example}</div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div className="bg-white border-2 border-emerald-200 rounded-3xl p-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <h3 className="text-2xl font-bold text-emerald-800 mb-4">How E is Scored</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-emerald-50 rounded-2xl p-6 border-2 border-emerald-200">
            <h4 className="font-bold text-emerald-900 mb-3">📊 Data Sources</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex gap-2"><span>✓</span> Annual sustainability/ESG reports</li>
              <li className="flex gap-2"><span>✓</span> CDP (Carbon Disclosure Project) ratings</li>
              <li className="flex gap-2"><span>✓</span> Third-party audits and certifications</li>
              <li className="flex gap-2"><span>✓</span> Government regulatory filings</li>
            </ul>
          </div>
          <div className="bg-red-50 rounded-2xl p-6 border-2 border-red-200">
            <h4 className="font-bold text-red-900 mb-3">⚠️ Watch Out For</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex gap-2"><span>✗</span> Greenwashing — empty eco-claims</li>
              <li className="flex gap-2"><span>✗</span> Scope 3 emissions often excluded</li>
              <li className="flex gap-2"><span>✗</span> Inconsistent reporting standards</li>
              <li className="flex gap-2"><span>✗</span> Unverified "net-zero" pledges</li>
            </ul>
          </div>
        </div>
      </motion.div>

      <motion.div className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 p-6 rounded-2xl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
        <p className="text-green-900">
          <span className="font-bold">Real Example:</span> After Volkswagen's 2015 emissions scandal, their stock dropped 30%+ in days. Poor Environmental governance destroyed billions in shareholder value — showing why E matters financially, not just ethically.
        </p>
      </motion.div>
    </div>

    <div className="flex justify-center gap-4 pb-12">
      <button onClick={handlePrev} className="px-8 py-4 rounded-2xl border-2 border-green-400 bg-white text-green-600 font-semibold text-lg shadow-lg hover:bg-green-50">← Back</button>
      <button onClick={handleNext} className="px-8 py-4 rounded-2xl bg-green-500 text-white font-semibold text-lg shadow-lg hover:bg-green-600">Next: Social →</button>
    </div>
  </div>
);

// Page 3: Social
const SocialPage = ({ handlePrev, handleNext }: { handlePrev: () => void; handleNext: () => void }) => (
  <div className="max-w-5xl mx-auto pt-16">
    <motion.h2 className="text-4xl font-bold mb-4 text-center text-gray-800" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      🤝 S — Social
    </motion.h2>
    <p className="text-center text-gray-600 mb-8 text-lg">How a company treats people — employees, customers, and communities</p>

    <div className="space-y-6 mb-8">
      <motion.div className="bg-white border-2 border-blue-200 rounded-3xl p-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h3 className="text-2xl font-bold text-blue-800 mb-6">Key Social Factors</h3>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { icon: "💼", title: "Labor Practices", desc: "Fair wages, safe conditions, no forced labor", example: "Patagonia: living wages + profit-sharing for employees" },
            { icon: "🌈", title: "Diversity & Inclusion", desc: "Gender, race, and disability representation at all levels", example: "Companies setting targets for board diversity by 2025" },
            { icon: "🏥", title: "Employee Wellbeing", desc: "Health benefits, mental health support, work-life balance", example: "Microsoft's $1.5B mental health benefits investment" },
            { icon: "🏘️", title: "Community Impact", desc: "Local investment, charitable giving, economic development", example: "Starbucks opening stores in low-income neighborhoods" },
            { icon: "📦", title: "Supply Chain", desc: "Ensuring suppliers meet ethical labor standards", example: "Apple auditing 1,000+ suppliers for labor conditions" },
            { icon: "🛡️", title: "Data Privacy", desc: "Protecting customer data and user rights", example: "Apple's App Tracking Transparency as a privacy stance" },
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
              <div className="bg-white rounded-lg p-2 text-xs text-gray-700 italic">Ex: {item.example}</div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div className="bg-white border-2 border-indigo-200 rounded-3xl p-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <h3 className="text-2xl font-bold text-indigo-800 mb-4">The Business Case for Social Factors</h3>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { icon: "🎯", title: "Talent Attraction", desc: "Companies with strong social scores attract and retain top talent, reducing turnover costs" },
            { icon: "📣", title: "Brand Reputation", desc: "Social controversies (child labor, data breaches) create consumer boycotts and lasting brand damage" },
            { icon: "⚖️", title: "Regulatory Risk", desc: "Poor labor practices invite government investigations, lawsuits, and costly fines" },
          ].map((item, idx) => (
            <motion.div
              key={idx}
              className="bg-indigo-50 rounded-xl p-5 border border-indigo-200 text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + idx * 0.1 }}
            >
              <div className="text-3xl mb-2">{item.icon}</div>
              <h4 className="font-bold text-gray-800 mb-2">{item.title}</h4>
              <p className="text-sm text-gray-600">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 p-6 rounded-2xl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
        <p className="text-blue-900">
          <span className="font-bold">Real Example:</span> Nike faced massive backlash in the 1990s over sweatshop labor in its supply chain. The company spent decades and billions rebuilding its social score. Today, social due diligence in supply chains is an industry standard — because the cost of getting it wrong is massive.
        </p>
      </motion.div>
    </div>

    <div className="flex justify-center gap-4 pb-12">
      <button onClick={handlePrev} className="px-8 py-4 rounded-2xl border-2 border-green-400 bg-white text-green-600 font-semibold text-lg shadow-lg hover:bg-green-50">← Back</button>
      <button onClick={handleNext} className="px-8 py-4 rounded-2xl bg-green-500 text-white font-semibold text-lg shadow-lg hover:bg-green-600">Next: Governance →</button>
    </div>
  </div>
);

// Page 4: Governance
const GovernancePage = ({ handlePrev, handleNext }: { handlePrev: () => void; handleNext: () => void }) => (
  <div className="max-w-5xl mx-auto pt-16">
    <motion.h2 className="text-4xl font-bold mb-4 text-center text-gray-800" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      🏛️ G — Governance
    </motion.h2>
    <p className="text-center text-gray-600 mb-8 text-lg">How a company is led, controlled, and held accountable</p>

    <div className="space-y-6 mb-8">
      <motion.div className="bg-white border-2 border-purple-200 rounded-3xl p-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h3 className="text-2xl font-bold text-purple-800 mb-6">Key Governance Factors</h3>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { icon: "🧑‍💼", title: "Board Independence", desc: "Majority of board members should be independent (not company employees)", example: "Independent audit committee prevents earnings manipulation" },
            { icon: "💰", title: "Executive Pay", desc: "CEO compensation tied to performance, not excessive vs. employee wages", example: "CEO pay ratio of 300:1 vs. average employee raises concerns" },
            { icon: "🗳️", title: "Shareholder Rights", desc: "Fair voting rights, ability to influence major decisions", example: "Dual-class share structures limit investor influence" },
            { icon: "🔍", title: "Transparency", desc: "Timely, accurate financial and operational disclosures", example: "Enron's opacity and fraud → bankruptcy and investor losses" },
            { icon: "🚫", title: "Anti-Corruption", desc: "Zero-tolerance for bribery, conflicts of interest, insider trading", example: "Robust whistleblower protection programs" },
            { icon: "🔐", title: "Cybersecurity", desc: "Board-level oversight of data security and cyber risks", example: "CISO reporting directly to the board of directors" },
          ].map((item, idx) => (
            <motion.div
              key={idx}
              className="bg-purple-50 rounded-2xl p-5 border border-purple-200"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + idx * 0.1 }}
            >
              <div className="text-4xl mb-3">{item.icon}</div>
              <h4 className="font-bold text-gray-800 mb-2">{item.title}</h4>
              <p className="text-sm text-gray-600 mb-3 leading-relaxed">{item.desc}</p>
              <div className="bg-white rounded-lg p-2 text-xs text-gray-700 italic">Ex: {item.example}</div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div className="bg-white border-2 border-gray-200 rounded-3xl p-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <h3 className="text-2xl font-bold text-gray-800 mb-4">Why G Matters Most to Investors</h3>
        <div className="space-y-4">
          <div className="bg-amber-50 border-l-4 border-amber-500 rounded-xl p-5">
            <h4 className="font-bold text-amber-900 mb-2">🏦 The Enron Effect</h4>
            <p className="text-gray-700 text-sm leading-relaxed">Enron's collapse in 2001 wiped out $74 billion in shareholder value. The root cause? Catastrophic governance failures — fraudulent accounting, conflicted board members, and zero transparency. Governance failures are often the trigger for catastrophic losses.</p>
          </div>
          <div className="bg-green-50 border-l-4 border-green-500 rounded-xl p-5">
            <h4 className="font-bold text-green-900 mb-2">✓ Good Governance = Lower Risk</h4>
            <p className="text-gray-700 text-sm leading-relaxed">Companies with strong governance tend to have fewer regulatory penalties, less fraud, and better long-term decision making — which translates to more stable returns for investors over time.</p>
          </div>
        </div>
      </motion.div>

      <motion.div className="bg-gradient-to-r from-purple-50 to-pink-50 border-l-4 border-purple-500 p-6 rounded-2xl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
        <p className="text-purple-900">
          <span className="font-bold">Key Insight:</span> Among E, S, and G — Governance is often considered the <span className="font-bold">foundation</span>. If a company's leadership is corrupt or unaccountable, no amount of solar panels or diversity initiatives can make up for it.
        </p>
      </motion.div>
    </div>

    <div className="flex justify-center gap-4 pb-12">
      <button onClick={handlePrev} className="px-8 py-4 rounded-2xl border-2 border-green-400 bg-white text-green-600 font-semibold text-lg shadow-lg hover:bg-green-50">← Back</button>
      <button onClick={handleNext} className="px-8 py-4 rounded-2xl bg-green-500 text-white font-semibold text-lg shadow-lg hover:bg-green-600">ESG in Practice →</button>
    </div>
  </div>
);

// Page 5: ESG in Practice
const ESGPracticePage = ({ handlePrev, handleNext }: { handlePrev: () => void; handleNext: () => void }) => (
  <div className="max-w-5xl mx-auto pt-16">
    <motion.h2 className="text-4xl font-bold mb-4 text-center text-gray-800" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      📊 ESG in Practice
    </motion.h2>
    <p className="text-center text-gray-600 mb-8 text-lg">How ESG is measured, invested in, and why it matters financially</p>

    <div className="space-y-6 mb-8">
      {/* ESG Strategies */}
      <motion.div className="bg-white border-2 border-teal-200 rounded-3xl p-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h3 className="text-2xl font-bold text-teal-800 mb-6">ESG Investment Strategies</h3>
        <div className="grid md:grid-cols-2 gap-5">
          {[
            { icon: "🚫", title: "Negative Screening", color: "bg-red-50 border-red-200", textColor: "text-red-900", desc: "Exclude industries that conflict with values", examples: ["Tobacco companies", "Weapons manufacturers", "Coal mining"] },
            { icon: "✅", title: "Positive Screening", color: "bg-green-50 border-green-200", textColor: "text-green-900", desc: "Actively select ESG leaders in each sector", examples: ["Top-rated clean energy firms", "Best-in-class governance", "Diversity champions"] },
            { icon: "🗣️", title: "Shareholder Engagement", color: "bg-blue-50 border-blue-200", textColor: "text-blue-900", desc: "Vote shares to push for ESG improvements", examples: ["Proxy voting on climate resolutions", "Demanding board diversity reports", "Executive pay reform proposals"] },
            { icon: "🎯", title: "Impact Investing", color: "bg-purple-50 border-purple-200", textColor: "text-purple-900", desc: "Invest directly in solutions to social/environmental problems", examples: ["Affordable housing bonds", "Microfinance in emerging markets", "Clean water infrastructure funds"] },
          ].map((item, idx) => (
            <motion.div key={idx} className={`${item.color} border-2 rounded-2xl p-5`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + idx * 0.1 }}>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">{item.icon}</span>
                <h4 className={`font-bold text-lg ${item.textColor}`}>{item.title}</h4>
              </div>
              <p className="text-gray-700 text-sm mb-3">{item.desc}</p>
              <div className="space-y-1">
                {item.examples.map((ex, i) => (
                  <div key={i} className="text-xs text-gray-600 flex gap-2"><span>•</span>{ex}</div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ESG Ratings */}
      <motion.div className="bg-white border-2 border-gray-200 rounded-3xl p-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <h3 className="text-2xl font-bold text-gray-800 mb-4">Who Rates ESG?</h3>
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          {[
            { name: "MSCI ESG Ratings", desc: "Industry standard; rates companies AAA to CCC", color: "bg-blue-50 border-blue-200" },
            { name: "Sustainalytics", desc: "Measures unmanaged ESG risk; used by Morningstar", color: "bg-green-50 border-green-200" },
            { name: "S&P Global ESG", desc: "Annual Corporate Sustainability Assessment scores", color: "bg-purple-50 border-purple-200" },
          ].map((item, idx) => (
            <div key={idx} className={`${item.color} border-2 rounded-xl p-4`}>
              <div className="font-bold text-gray-800 mb-2">{item.name}</div>
              <div className="text-sm text-gray-600">{item.desc}</div>
            </div>
          ))}
        </div>
        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-5">
          <p className="font-semibold text-amber-900 mb-2">⚠️ Important Limitation</p>
          <p className="text-amber-800 text-sm">ESG ratings from different agencies can <span className="font-bold">disagree significantly</span> for the same company. There's no universal standard yet. A company rated "A" by MSCI may be rated "Medium Risk" by Sustainalytics. Always cross-reference before investing!</p>
        </div>
      </motion.div>

      <motion.div className="bg-gradient-to-r from-teal-50 to-green-50 border-l-4 border-teal-500 p-6 rounded-2xl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
        <p className="text-teal-900">
          <span className="font-bold">Performance Debate:</span> Studies show mixed results — some ESG funds match or beat the market over the long run, while others lag. The real value of ESG may be in <span className="font-bold">risk reduction</span> rather than alpha generation. Companies that manage ESG risks well tend to face fewer catastrophic events.
        </p>
      </motion.div>
    </div>

    <div className="flex justify-center gap-4 pb-12">
      <button onClick={handlePrev} className="px-8 py-4 rounded-2xl border-2 border-green-400 bg-white text-green-600 font-semibold text-lg shadow-lg hover:bg-green-50">← Back</button>
      <button onClick={handleNext} className="px-8 py-4 rounded-2xl bg-green-500 text-white font-semibold text-lg shadow-lg hover:bg-green-600">Play Game 1 →</button>
    </div>
  </div>
);

// Game 1: ESG Category Sorter
interface ESGSorterProps {
  handlePrev: () => void;
  handleNext: () => void;
}

const ESGCategorySorter = ({ handlePrev, handleNext }: ESGSorterProps) => {
  const items = [
    { id: '1', label: 'Carbon emissions reduction target', category: 'E', icon: '💨', explanation: 'Reducing carbon emissions directly impacts the environment — this is a core Environmental (E) factor.' },
    { id: '2', label: 'Solar energy investment', category: 'E', icon: '☀️', explanation: 'Investing in renewable solar energy reduces fossil fuel dependence — a key Environmental (E) practice.' },
    { id: '3', label: 'Fair wages for all workers', category: 'S', icon: '💵', explanation: 'Fair wages protect workers and their families — this is a Social (S) factor tied to labor practices.' },
    { id: '4', label: 'Diverse hiring & inclusion programs', category: 'S', icon: '🌈', explanation: 'Diversity and inclusion initiatives improve company culture and equal opportunity — a Social (S) factor.' },
    { id: '5', label: 'Community development grants', category: 'S', icon: '🏘️', explanation: 'Investing in local communities reflects a company\'s social responsibility — a Social (S) factor.' },
    { id: '6', label: 'Independent board of directors', category: 'G', icon: '🧑‍💼', explanation: 'An independent board ensures unbiased oversight of management — a core Governance (G) factor.' },
    { id: '7', label: 'Transparent executive pay disclosures', category: 'G', icon: '💰', explanation: 'Transparent executive compensation builds investor trust — a Governance (G) factor.' },
    { id: '8', label: 'Anti-corruption & ethics policies', category: 'G', icon: '🚫', explanation: 'Strong anti-corruption policies reduce fraud risk and protect shareholders — a Governance (G) factor.' },
    { id: '9', label: 'Water conservation programs', category: 'E', icon: '💧', explanation: 'Water conservation protects natural resources and reduces environmental impact — an Environmental (E) factor.' },
  ];

  const [placements, setPlacements] = useState<Record<string, string>>({});
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  const unplaced = items.filter(i => !placements[i.id]);
  const score = Object.entries(placements).filter(([id, cat]) => items.find(i => i.id === id)?.category === cat).length;

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedItem(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();

  const handleDrop = (e: React.DragEvent, zone: string) => {
    e.preventDefault();
    if (draggedItem) {
      setPlacements(prev => ({ ...prev, [draggedItem]: zone }));
      setDraggedItem(null);
    }
  };

  const handleTouchStart = (e: React.TouchEvent, id: string) => {
    setDraggedItem(id);
  };

  const handleTouchEnd = (e: React.TouchEvent, zone?: string) => {
    if (!draggedItem) return;
    if (zone) {
      setPlacements(prev => ({ ...prev, [draggedItem]: zone }));
    }
    setDraggedItem(null);
  };

  const getItemClass = (id: string) => {
    if (!checked || !placements[id]) return 'bg-white border-gray-300';
    const isCorrect = items.find(i => i.id === id)?.category === placements[id];
    return isCorrect ? 'bg-green-100 border-green-500' : 'bg-red-100 border-red-500';
  };

  const zones = [
    { id: 'E', label: 'Environmental', icon: '🌿', color: 'border-green-400 bg-green-50', headerColor: 'bg-green-500' },
    { id: 'S', label: 'Social', icon: '🤝', color: 'border-blue-400 bg-blue-50', headerColor: 'bg-blue-500' },
    { id: 'G', label: 'Governance', icon: '🏛️', color: 'border-purple-400 bg-purple-50', headerColor: 'bg-purple-500' },
  ];

  return (
    <div className="max-w-5xl mx-auto pt-16">
      <motion.h2 className="text-4xl font-bold mb-4 text-center text-gray-800" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        🎮 ESG Category Sorter
      </motion.h2>
      <p className="text-center text-gray-600 mb-8 text-lg">Drag each practice to the correct ESG pillar: Environmental, Social, or Governance</p>

      {/* Item Bank */}
      <div className="bg-gradient-to-r from-gray-100 to-gray-200 rounded-2xl p-5 mb-6 min-h-[100px] border-2 border-gray-300">
        <p className="text-sm font-semibold text-gray-700 mb-3 text-center">📦 Unsorted Practices</p>
        <div className="flex flex-wrap gap-3 justify-center">
          {unplaced.map(item => (
            <div
              key={item.id}
              draggable
              onDragStart={(e) => handleDragStart(e, item.id)}
              onTouchStart={(e) => handleTouchStart(e, item.id)}
              className="bg-white border-2 border-gray-300 rounded-xl px-4 py-3 text-sm font-medium cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md hover:border-green-400 transition-all select-none"
            >
              <span className="mr-2">{item.icon}</span>
              {item.label}
            </div>
          ))}
          {unplaced.length === 0 && (
            <p className="text-gray-400 text-sm py-2">All items placed! Click "Check Answers" below.</p>
          )}
        </div>
      </div>

      {/* Drop Zones */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        {zones.map(zone => (
          <div key={zone.id} className={`${zone.color} border-2 rounded-2xl overflow-hidden`}>
            <div className={`${zone.headerColor} text-white p-3 text-center font-bold flex items-center justify-center gap-2`}>
              <span>{zone.icon}</span> {zone.label}
            </div>
            <div
              data-drop-zone={zone.id}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, zone.id)}
              onTouchEnd={(e) => {
                const touch = e.changedTouches[0];
                const el = document.elementFromPoint(touch.clientX, touch.clientY);
                const dropEl = el?.closest('[data-drop-zone]');
                const zoneId = dropEl?.getAttribute('data-drop-zone');
                handleTouchEnd(e, zoneId || undefined);
              }}
              className="min-h-[160px] p-3 space-y-2"
            >
              {items.filter(i => placements[i.id] === zone.id).map(item => (
                <div
                  key={item.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, item.id)}
                  onTouchStart={(e) => handleTouchStart(e, item.id)}
                  className={`${getItemClass(item.id)} border-2 rounded-xl px-3 py-2 text-sm cursor-grab active:cursor-grabbing transition-all select-none`}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.label}
                  {checked && (
                    <span className="ml-2 font-bold">
                      {items.find(i => i.id === item.id)?.category === placements[item.id] ? '✓' : '✗'}
                    </span>
                  )}
                </div>
              ))}
              {items.filter(i => placements[i.id] === zone.id).length === 0 && (
                <p className="text-xs text-gray-400 text-center pt-4">Drop {zone.label} items here</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Check Button */}
      <div className="flex justify-center mb-6">
        <button
          onClick={() => setChecked(true)}
          disabled={unplaced.length > 0 || checked}
          className="px-8 py-4 bg-green-500 text-white rounded-xl font-bold text-lg hover:bg-green-600 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
        >
          {checked ? `Score: ${score} / ${items.length}` : unplaced.length > 0 ? `Sort ${unplaced.length} more item(s)` : 'Check My Answers'}
        </button>
      </div>

      {/* Feedback */}
      {checked && (
        <>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${score === items.length ? 'bg-green-50 border-green-500' : 'bg-yellow-50 border-yellow-500'} border-l-4 p-5 rounded-2xl mb-6`}
          >
            <p className={`${score === items.length ? 'text-green-900' : 'text-yellow-900'} font-semibold text-lg`}>
              {score === items.length ? '🎉 Perfect! You nailed every ESG category!' : `📚 ${score}/${items.length} correct. Review the explanations below to reinforce your learning.`}
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
              {items.map(item => {
                const isCorrect = placements[item.id] === item.category;
                return (
                  <div key={item.id} className={`p-4 rounded-xl border-2 ${isCorrect ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'}`}>
                    <div className="flex items-start gap-3">
                      <span className={`text-2xl ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>{isCorrect ? '✓' : '✗'}</span>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">{item.icon} {item.label}</p>
                        {!isCorrect && (
                          <p className="text-sm text-red-700 mt-1">
                            You placed in: <b>{zones.find(z => z.id === placements[item.id])?.label || '?'}</b> → Correct: <b>{zones.find(z => z.id === item.category)?.label}</b>
                          </p>
                        )}
                        <p className="text-sm text-gray-700 mt-1">{item.explanation}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </>
      )}

      <div className="flex justify-center gap-4 pb-12">
        <button onClick={handlePrev} className="px-8 py-4 rounded-2xl border-2 border-green-400 bg-white text-green-600 font-semibold text-lg shadow-lg hover:bg-green-50">← Back</button>
        <button onClick={handleNext} className="px-8 py-4 rounded-2xl bg-green-500 text-white font-semibold text-lg shadow-lg hover:bg-green-600">Next: Game 2 →</button>
      </div>
    </div>
  );
};

// Scenarios defined outside component so useMemo can shuffle without deps changing
const comparisonScenarios = [
  {
    context: "Energy Sector",
    icon: "⚡",
    question: "Which company would you include in an ESG portfolio?",
    companies: [
      {
        name: "SunPower Corp",
        description: "100% renewable solar energy producer. Net-zero operations since 2021. Strong labor protections and community solar programs in underserved areas.",
        badge: "Stronger ESG",
        isESG: true,
      },
      {
        name: "CoalFirst Inc.",
        description: "Primary coal mining and energy company. No climate strategy. Multiple environmental violations in past 5 years. Minimal worker safety disclosures.",
        badge: "Weaker ESG",
        isESG: false,
      },
    ],
    explanation: "SunPower scores well across all three ESG pillars — clean energy (E), community programs (S), and transparent operations (G). CoalFirst has major E and G deficiencies, making it a red flag for ESG investors."
  },
  {
    context: "Technology Sector",
    icon: "💻",
    question: "Which company has stronger Governance?",
    companies: [
      {
        name: "OpenBoard Tech",
        description: "8 of 10 board members are independent. CEO pay is 35x the median employee wage. Annual sustainability report published. Whistleblower hotline active.",
        badge: "Stronger Governance",
        isESG: true,
      },
      {
        name: "FounderRule Inc.",
        description: "Founder holds 70% voting control via dual-class shares. CEO pay is 500x median wage. No board independence policy. No ESG disclosures.",
        badge: "Weaker Governance",
        isESG: false,
      },
    ],
    explanation: "OpenBoard Tech exemplifies strong Governance (G): independent board, fair pay ratios, and transparent disclosures. FounderRule's concentrated control and opacity are classic governance red flags that put outside shareholders at risk."
  },
  {
    context: "Consumer Goods",
    icon: "🛍️",
    question: "Which company better reflects Social (S) values?",
    companies: [
      {
        name: "EthiCraft Apparel",
        description: "All factories certified by Fair Labor Association. Living wages paid across supply chain. 50% women in leadership. Runs free vocational training for garment workers.",
        badge: "Stronger Social",
        isESG: true,
      },
      {
        name: "FastFashion Global",
        description: "Repeatedly cited for using factories with poor conditions in Bangladesh. 12% gender pay gap. No supply chain transparency report. No worker wellbeing programs.",
        badge: "Weaker Social",
        isESG: false,
      },
    ],
    explanation: "EthiCraft demonstrates Social (S) leadership through fair labor, diversity, and community investment. FastFashion Global's track record of labor abuses and opacity makes it a social risk — and a reputational liability."
  },
  // --- TRICKY SCENARIOS ---
  {
    context: "Retail Banking — Greenwashing Trap 🪤",
    icon: "🏦",
    question: "Both banks claim to be 'sustainable.' Which has genuine ESG credentials?",
    companies: [
      {
        name: "GreenBank Capital",
        description: "Runs full-page ads calling itself 'the planet's most sustainable bank.' Donated $10M to a reforestation charity. Uses recycled paper in offices. However: no CDP climate disclosure, and 40% of its loan book still finances fossil fuel extraction with zero transition plan.",
        badge: "Greenwashing",
        isESG: false,
      },
      {
        name: "NorthStar Credit Union",
        description: "Less flashy marketing, but CDP A-rated. 60% of new loans finance renewable energy projects. Full Scope 1-2-3 emissions audit published annually. Zero fossil fuel project financing since 2022.",
        badge: "Genuinely ESG",
        isESG: true,
      },
    ],
    explanation: "Greenwashing trap! GreenBank's eco-claims are mostly PR spin — the real test is what they actually finance. NorthStar quietly does the real work: verified emissions data, renewable lending, and zero fossil fuel exposure. ESG is about actions, not advertising."
  },
  {
    context: "Pharmaceuticals — Don't Judge by the Product 💊",
    icon: "🧬",
    question: "Which pharma company has stronger overall ESG practices?",
    companies: [
      {
        name: "LifeFirst Pharma",
        description: "Develops critical cancer treatments — sounds great. But charges 80x more in developing countries, blocks generic licensing, and its CEO was recently caught in an insider trading scandal but kept his job. No Paris-aligned climate plan.",
        badge: "Weaker ESG",
        isESG: false,
      },
      {
        name: "MedAccess Corp",
        description: "Makes niche tobacco-cessation drugs. Less glamorous, but: offers tiered global pricing so developing nations can afford its drugs, shares patents openly with WHO, runs 100% renewable energy manufacturing, and has a clean governance record.",
        badge: "Stronger ESG",
        isESG: true,
      },
    ],
    explanation: "Don't be fooled by a company's product sounding 'noble.' ESG evaluates HOW a company operates. LifeFirst has a governance failure (insider trading tolerated) and social failure (blocking access to life-saving drugs). MedAccess hits all three pillars despite its less glamorous product line."
  },
  {
    context: "Asset Management — Spot the ESG Washing 🔍",
    icon: "📊",
    question: "Both funds claim ESG credentials. Which one is credible?",
    companies: [
      {
        name: "VerdantFund Partners",
        description: "Launched an 'ESG fund' last year after rebranding an existing portfolio. Uses internal 'proprietary' ESG scoring with no third-party audit. Still holds companies with active human rights controversies. No public record of shareholder engagement or proxy votes.",
        badge: "ESG Washing",
        isESG: false,
      },
      {
        name: "PrismESG Capital",
        description: "UN PRI signatory since 2015. ESG ratings verified by both MSCI and Sustainalytics annually. Published voting record shows they voted against 28 boards on climate resolutions last year. No holdings in companies with active human rights controversies.",
        badge: "Credible ESG",
        isESG: true,
      },
    ],
    explanation: "This tests whether you can spot 'ESG washing' in financial products. VerdantFund simply rebranded existing holdings — a common tactic. PrismESG demonstrates credibility through third-party verification, a public voting record, and genuine screening. Real ESG funds leave a paper trail."
  },
];

// Game 2: Company Comparison Challenge
interface CompanyComparisonProps {
  handlePrev: () => void;
  handleNext: () => void;
}

const CompanyComparison = ({ handlePrev, handleNext: handleNextPage }: CompanyComparisonProps) => {
  // Shuffle left/right position of companies once on mount so the correct answer
  // isn't always on the same side
  const scenarios = useMemo(() =>
    comparisonScenarios.map(s => ({
      ...s,
      companies: Math.random() > 0.5 ? [...s.companies].reverse() : s.companies,
    }))
  , []);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState<boolean | null>(null);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [completed, setCompleted] = useState(false);

  const scenario = scenarios[currentIdx];
  const score = answers.filter(Boolean).length;

  const handleSelect = (isESG: boolean) => {
    if (selected !== null) return;
    setSelected(isESG);
  };

  const handleNext = () => {
    if (selected === null) return;
    const newAnswers = [...answers, selected === true];
    setAnswers(newAnswers);
    if (currentIdx < scenarios.length - 1) {
      setCurrentIdx(currentIdx + 1);
      setSelected(null);
    } else {
      setCompleted(true);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pt-16">
      <motion.h2 className="text-4xl font-bold mb-4 text-center text-gray-800" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        🏆 Company Comparison Challenge
      </motion.h2>
      <p className="text-center text-gray-600 mb-8 text-lg">Pick the stronger ESG company each round — some are trickier than they look!</p>

      {!completed ? (
        <>
          <div className="flex justify-center mb-6">
            <div className="bg-white/90 backdrop-blur-md px-6 py-2 rounded-full shadow-md border-2 border-green-200">
              <span className="text-green-600 font-bold text-sm">Round {currentIdx + 1} of {scenarios.length} — {scenario.context}</span>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentIdx}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              className="mb-6"
            >
              <div className="bg-white border-2 border-gray-200 rounded-3xl p-6 shadow-xl mb-4">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-4xl">{scenario.icon}</span>
                  <h3 className="text-xl font-bold text-gray-800">{scenario.question}</h3>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {scenario.companies.map((company, idx) => {
                    const isSelected = selected === company.isESG;
                    const showResult = selected !== null;
                    const isCorrect = company.isESG;

                    return (
                      <button
                        key={idx}
                        onClick={() => handleSelect(company.isESG)}
                        disabled={selected !== null}
                        className={`p-6 rounded-2xl text-left border-2 transition-all ${
                          showResult
                            ? isCorrect
                              ? 'bg-green-50 border-green-500'
                              : 'bg-red-50 border-red-400 opacity-70'
                            : isSelected
                              ? 'bg-green-50 border-green-600 shadow-lg scale-[1.02]'
                              : 'bg-white border-gray-200 hover:border-green-400 hover:shadow-md'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-bold text-lg text-gray-800">{company.name}</h4>
                          {selected !== null && (
                            <span className={`text-xs px-3 py-1 rounded-full font-bold ${company.isESG ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              {company.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed">{company.description}</p>
                        {showResult && isCorrect && (
                          <div className="mt-3 flex items-center gap-2 text-green-700 font-semibold text-sm">
                            <span>✓</span> Correct ESG Choice
                          </div>
                        )}
                        {showResult && !isCorrect && isSelected && (
                          <div className="mt-3 flex items-center gap-2 text-red-700 font-semibold text-sm">
                            <span>✗</span> Not the ESG leader
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {selected !== null && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl flex flex-col md:flex-row items-center gap-6"
                >
                  <div className="flex-1">
                    <h4 className="font-bold text-green-400 uppercase tracking-wider text-sm mb-2">Why</h4>
                    <p className="text-slate-200 leading-relaxed">{scenario.explanation}</p>
                  </div>
                  <button
                    onClick={handleNext}
                    className="w-full md:w-auto px-8 py-4 bg-white text-slate-900 rounded-xl font-bold hover:bg-green-50 transition-colors whitespace-nowrap"
                  >
                    {currentIdx < scenarios.length - 1 ? 'Next Round →' : 'See Results →'}
                  </button>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Progress dots */}
          <div className="flex justify-center gap-2 pb-4">
            {scenarios.map((_, idx) => (
              <div
                key={idx}
                className={`h-3 rounded-full transition-all ${
                  idx < answers.length
                    ? answers[idx] ? 'bg-green-500 w-3' : 'bg-red-500 w-3'
                    : idx === currentIdx ? 'bg-green-500 w-8' : 'bg-gray-300 w-3'
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
          <div className={`w-32 h-32 mx-auto rounded-full flex items-center justify-center mb-6 shadow-2xl ${score >= 4 ? 'bg-green-500' : 'bg-blue-500'}`}>
            <span className="text-6xl">{score >= 4 ? '🏆' : '🌱'}</span>
          </div>
          <div className="text-6xl font-black text-green-600 mb-3">{score}/{scenarios.length}</div>
          <p className="text-2xl text-gray-700 mb-6">
            {score === scenarios.length ? '🎉 Perfect ESG Investor!' : score >= 4 ? '🌿 Strong ESG Instincts!' : '📚 Keep Practicing!'}
          </p>
          <div className="inline-block bg-green-100 text-green-800 px-8 py-3 rounded-full font-bold text-lg mb-8">
            {score === scenarios.length ? '+400 XP' : score >= 4 ? '+250 XP' : '+150 XP'}
          </div>
          <div className="grid grid-cols-2 gap-3 text-left mt-4">
            {answers.map((correct, idx) => (
              <div key={idx} className={`p-3 rounded-lg ${correct ? 'bg-green-100' : 'bg-red-100'}`}>
                <div className="flex items-center gap-2">
                  <span className={`text-xl ${correct ? 'text-green-600' : 'text-red-600'}`}>{correct ? '✓' : '✗'}</span>
                  <span className="text-sm font-semibold text-gray-700">{scenarios[idx].context}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      <div className="flex justify-center gap-4 pb-12">
        <button onClick={handlePrev} className="px-8 py-4 rounded-2xl border-2 border-green-400 bg-white text-green-600 font-semibold text-lg shadow-lg hover:bg-green-50">← Back</button>
        {completed && (
          <button onClick={handleNextPage} className="px-8 py-4 rounded-2xl bg-green-500 text-white font-semibold text-lg shadow-lg hover:bg-green-600">Take the Quiz →</button>
        )}
      </div>
    </div>
  );
};

// Quiz Page
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
  navigate: ReturnType<typeof useNavigate>;
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
  shuffledQuestions,
}: QuizPageProps) => (
  <div className="max-w-4xl mx-auto pt-16">
    {!quizCompleted ? (
      <div className="bg-white rounded-3xl shadow-xl border-2 border-green-100 overflow-hidden flex flex-col min-h-[500px]">
        <div className="flex-1 p-8 lg:p-16 flex flex-col justify-center">
          <div className="flex justify-between items-end mb-8 border-b border-gray-100 pb-6">
            <div>
              <span className="text-sm font-bold text-green-600 uppercase tracking-wider block mb-2">
                Question {currentQuestion + 1} of {shuffledQuestions.length}
              </span>
              <h2 className="text-2xl lg:text-4xl font-bold text-slate-900 leading-tight">
                {shuffledQuestions[currentQuestion].question}
              </h2>
            </div>
            <div className="hidden lg:block text-slate-300">
              <span className="text-5xl">🌱</span>
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
                      ? 'bg-green-50 border-green-600 shadow-lg scale-[1.02]'
                      : 'bg-white border-slate-200 hover:border-green-400 hover:shadow-md'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                      showCorrectness && isCorrect
                        ? 'bg-green-500 text-white'
                        : showCorrectness && isSelected
                        ? 'bg-red-500 text-white'
                        : isSelected
                        ? 'bg-green-600 text-white'
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
                <h4 className="font-bold text-green-400 uppercase tracking-wider text-sm mb-2">Explanation</h4>
                <p className="text-lg leading-relaxed text-slate-200">
                  {shuffledQuestions[currentQuestion].explanation}
                </p>
              </div>
              <button
                onClick={handleNextQuestion}
                className="w-full md:w-auto px-8 py-4 bg-white text-slate-900 rounded-xl font-bold hover:bg-green-50 transition-colors whitespace-nowrap"
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
        className="bg-white rounded-3xl shadow-xl p-12 text-center border-2 border-green-100"
      >
        <div className={`w-32 h-32 mx-auto rounded-full flex items-center justify-center mb-8 shadow-2xl ${score >= 8 ? 'bg-green-500' : 'bg-amber-500'}`}>
          <span className="text-6xl">{score >= 8 ? '🏆' : '🌱'}</span>
        </div>
        <h2 className="text-5xl font-black text-slate-900 mb-4">
          {score >= 8 ? 'ESG Expert!' : 'Keep Learning!'}
        </h2>
        <p className="text-2xl text-slate-500 mb-10">
          You scored <span className="font-bold text-slate-900">{score}/{shuffledQuestions.length}</span> ({((score / shuffledQuestions.length) * 100).toFixed(0)}%)
        </p>

        {score >= 8 ? (
          <div className="bg-green-50 border-2 border-green-500 rounded-2xl p-8 mb-10">
            <p className="text-green-800 font-bold text-xl mb-2">🎊 Congratulations! You passed!</p>
            <p className="text-green-700 text-lg">You've mastered ESG & Ethical Investing!</p>
          </div>
        ) : (
          <div className="bg-amber-50 border-2 border-amber-500 rounded-2xl p-8 mb-10">
            <p className="text-amber-800 font-bold text-xl mb-2">You need 80% to pass (8/10 correct)</p>
            <p className="text-amber-700 text-lg">Review the material and try again — you're almost there!</p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button onClick={resetQuiz} className="px-8 py-4 rounded-xl bg-slate-900 text-white hover:bg-slate-800 font-bold text-lg transition-all shadow-lg">
            Retake Quiz
          </button>
          <button onClick={() => navigate('/game')} className="px-8 py-4 rounded-xl border-2 border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-lg transition-all">
            Back to Roadmap
          </button>
        </div>
      </motion.div>
    )}
  </div>
);

// Main Component
const ESGInvestingModule = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isReviewMode, setIsReviewMode] = useState(false);
  const { saveScore, isModulePassed } = useModuleScore();

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showAnswerResult, setShowAnswerResult] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [shuffleKey, setShuffleKey] = useState(0);

  const shuffledQuestions = useMemo(() => shuffleQuizOptions(quizQuestions), [shuffleKey]);

  const modulePassed = isModulePassed(MODULES.ESG_INVESTING.id);
  const totalSteps = 8; // 0:intro, 1:E, 2:S, 3:G, 4:practice, 5:game1, 6:game2, 7:quiz

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(s => s + 1);
      window.scrollTo(0, 0);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(s => s - 1);
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
      setCurrentQuestion(q => q + 1);
      setSelectedAnswer(null);
      setShowAnswerResult(false);
    } else {
      let finalScore = 0;
      newAnswers.forEach((answer, idx) => {
        if (answer === shuffledQuestions[idx].correctIndex) finalScore++;
      });
      setScore(finalScore);
      setQuizCompleted(true);
      const percentage = (finalScore / shuffledQuestions.length) * 100;
      saveScore(MODULES.ESG_INVESTING.id, percentage);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setScore(0);
    setShowAnswerResult(false);
    setQuizCompleted(false);
    setAnswers([]);
    setShuffleKey(k => k + 1);
  };

  if (modulePassed && !isReviewMode) {
    return (
      <ModuleCompletedScreen
        emoji="🌱"
        moduleName="ESG & Ethical Investing"
        description="You've already passed the ESG & Ethical Investing module. Great job learning to invest with values!"
        gradientClasses="from-green-50 via-emerald-100 to-teal-200"
        onReviewClick={() => setIsReviewMode(true)}
      />
    );
  }

  return (
    <div className="min-h-screen relative overflow-x-hidden" style={{ background: 'linear-gradient(135deg, #d1fae5 0%, #ecfdf5 50%, #d1fae5 100%)' }}>
      <button
        className="absolute top-4 left-4 px-4 py-2 rounded-lg text-green-600 hover:bg-white/50 backdrop-blur-sm font-medium transition z-50 shadow-sm border border-green-100"
        onClick={() => navigate('/game')}
      >
        ← Back to Roadmap
      </button>

      <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-50">
        <div className="bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full shadow-sm border border-green-100 text-gray-600 font-semibold text-sm">
          Step {currentStep + 1} of {totalSteps}
        </div>
      </div>

      {(currentStep > 0 && (currentStep < totalSteps - 1 || (currentStep === totalSteps - 1 && currentQuestion === 0 && !showAnswerResult && !quizCompleted))) && (
        <button
          onClick={handlePrev}
          className="fixed left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-green-500 text-white rounded-full shadow-lg hover:bg-green-600 transition flex items-center justify-center z-40"
          aria-label="Previous"
        >←</button>
      )}
      {currentStep < totalSteps - 1 && (
        <button
          onClick={handleNext}
          className="fixed right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-green-500 text-white rounded-full shadow-lg hover:bg-green-600 transition flex items-center justify-center z-40"
          aria-label="Next"
        >→</button>
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
          {currentStep === 1 && <EnvironmentalPage handlePrev={handlePrev} handleNext={handleNext} />}
          {currentStep === 2 && <SocialPage handlePrev={handlePrev} handleNext={handleNext} />}
          {currentStep === 3 && <GovernancePage handlePrev={handlePrev} handleNext={handleNext} />}
          {currentStep === 4 && <ESGPracticePage handlePrev={handlePrev} handleNext={handleNext} />}
          {currentStep === 5 && <ESGCategorySorter handlePrev={handlePrev} handleNext={handleNext} />}
          {currentStep === 6 && <CompanyComparison handlePrev={handlePrev} handleNext={handleNext} />}
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

export default ESGInvestingModule;
