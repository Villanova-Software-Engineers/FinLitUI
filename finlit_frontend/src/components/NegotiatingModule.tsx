import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useModuleScore, MODULES } from '../hooks/useModuleScore';
import ModuleCompletedScreen from './ModuleCompletedScreen';
import { shuffleQuizOptions } from '../utils/shuffleQuizOptions';

// ═══════════════════════════════════════════════════════════════════════════════
// QUIZ QUESTIONS
// ═══════════════════════════════════════════════════════════════════════════════
const quizQuestions = [
  {
    question: "What does BATNA stand for in negotiation?",
    options: [
      "Best Alternative To a Negotiated Agreement",
      "Basic Annual Technique for Negotiating Anything",
      "Balanced Approach To Negotiating Agreements",
      "Below Average Total Negotiation Amount",
    ],
    correctIndex: 0,
    explanation:
      "BATNA — Best Alternative To a Negotiated Agreement — is your walk-away power. Knowing it gives you genuine confidence because you are not desperate; you have options if this deal falls through.",
  },
  {
    question: "When is the BEST time to negotiate a job offer?",
    options: [
      "During the very first phone screen",
      "After you receive a written offer",
      "On your first day of work",
      "During the final interview round",
    ],
    correctIndex: 1,
    explanation:
      "Once you hold a written offer, your leverage peaks. The employer has already chosen you and invested time — they want you to say yes. That is the moment to negotiate.",
  },
  {
    question: "An interviewer asks your salary expectation early in the process. You should:",
    options: [
      "Give a low number to seem humble",
      "Refuse to answer entirely",
      "Ask what budget is set for the role before sharing your number",
      "Accept whatever they decide",
    ],
    correctIndex: 2,
    explanation:
      "Deflect early. Whoever anchors first gives away information. Ask 'What range has been set for this role?' to gather data before naming a number.",
  },
  {
    question: "Your manager says 'we don't have budget right now.' The best follow-up is:",
    options: [
      "Apologize and say you will wait as long as needed",
      "Quit immediately to show you are serious",
      "Ask when budgets reset and request a specific review date",
      "Agree and drop the conversation entirely",
    ],
    correctIndex: 2,
    explanation:
      "'When' is more powerful than 'if.' Pinning down a concrete review date converts a vague refusal into a real commitment and keeps you in control.",
  },
  {
    question: "Which is the STRONGEST opener for asking for a raise?",
    options: [
      "'My rent went up and I really need more money.'",
      "'I know times are tough, but could I maybe get a small raise?'",
      "'Based on my research and the results I have delivered, I would like to discuss moving to $X.'",
      "'Everyone here makes more than me, so I should too.'",
    ],
    correctIndex: 2,
    explanation:
      "A strong ask is specific, market-backed, and matter-of-fact — not emotional or apologetic. Name the number; anchor the conversation on facts.",
  },
  {
    question: "You are offered $48K but market research shows $55–62K is typical. You should counter at:",
    options: [
      "$49K — stay close to seem reasonable",
      "$75K — aim high to find the middle",
      "$58–62K — the upper end of the researched market range",
      "$55K — the floor, just to be safe",
    ],
    correctIndex: 2,
    explanation:
      "Anchor at the top of the legitimate market range. Research backs it up, so it is defensible. If they negotiate you down, you still land in a solid spot.",
  },
  {
    question: "After you state your counter-offer, your employer goes silent. You should:",
    options: [
      "Immediately lower your number to break the tension",
      "Stay quiet — let the silence work for you",
      "Apologize and say you may have asked for too much",
      "Start talking about unrelated topics",
    ],
    correctIndex: 1,
    explanation:
      "Silence is a negotiation tool. After stating a position, the first person to speak tends to be the one who concedes. State your number, then wait.",
  },
  {
    question: "Which of these is NOT negotiable?",
    options: [
      "Remote work flexibility",
      "Start date",
      "The legal minimum wage",
      "Number of vacation days",
    ],
    correctIndex: 2,
    explanation:
      "Legal minimum wage is set by law — it is a floor, not a bargaining chip. Schedule, PTO, flexibility, signing bonuses, and start dates are all fair game.",
  },
  {
    question: "The most important prep step before any salary negotiation is:",
    options: [
      "Deciding your absolute minimum upfront",
      "Researching what the role pays at multiple companies",
      "Asking friends what they think you are worth",
      "Waiting until you have been underpaid for a long time",
    ],
    correctIndex: 1,
    explanation:
      "Market research is your foundation. Without data you are guessing. Platforms like Glassdoor, LinkedIn Salary, and industry surveys give you specific, defensible numbers.",
  },
  {
    question: "You receive a counter-offer $3K below your ask. The best move is:",
    options: [
      "Immediately accept — any progress is good",
      "Walk away to show you are serious",
      "Thank them and ask if benefits are flexible if salary is firm",
      "Reject it and restate your original number without explanation",
    ],
    correctIndex: 2,
    explanation:
      "Total compensation is more than salary. If the base is truly firm, pivot to signing bonus, extra PTO, remote days, or an early review — you keep the negotiation alive.",
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// GAME 1 — THE RIGHT MOVE
// ═══════════════════════════════════════════════════════════════════════════════
const rightMoveScenarios = [
  {
    situation:
      "You are offered a part-time retail job at $13/hr. Similar roles in your city pay $15–16/hr. The manager seems eager to hire you. What is your first move?",
    options: [
      "Accept immediately — you do not want to risk losing the offer.",
      "Say: 'Thank you! Based on market rates for this role, $15.50 seems more in line — is there flexibility?'",
      "Ask for $20/hr to leave room for negotiation.",
      "Wait until after your first week, then bring it up.",
    ],
    bestIndex: 1,
    explanation:
      "Name a specific, market-backed number before you accept. This is your highest-leverage moment. Asking $20 is too far from reality and risks seeming out of touch.",
  },
  {
    situation:
      "You have worked at a coffee shop for 8 months with consistently positive reviews. You want a raise but have never asked. What is your first step?",
    options: [
      "Walk in tomorrow and demand a raise.",
      "Gather your wins: note shifts covered, positive feedback, and look up market rates for your city.",
      "Ask coworkers what they make to build a case.",
      "Start applying elsewhere so you have an outside offer.",
    ],
    bestIndex: 1,
    explanation:
      "Preparation is everything. Document contributions and anchor to market data before the conversation. Showing up with facts turns a personal request into a business discussion.",
  },
  {
    situation:
      "In a job interview, the manager asks: 'What salary are you looking for?' You are early in the process. What do you say?",
    options: [
      "'I am flexible — whatever you think is fair.'",
      "Name the highest number you have ever seen for this type of role.",
      "'I would love to understand the full scope first — what range has been set for this role?'",
      "Give a precise number like '$47,832' to seem specific.",
    ],
    bestIndex: 2,
    explanation:
      "Deflect early salary questions to gather information. Once you know their range, anchor at the top. Naming a number first locks you in before you have enough data.",
  },
  {
    situation:
      "You countered at $19/hr. They replied: 'Best we can do is $16.' You know $18 is fair market. What do you do?",
    options: [
      "Accept $16 — the negotiation is over.",
      "Say: 'I understand. If $16 is firm on base, is there flexibility on hours or an early 90-day review?'",
      "Repeat '$19 is my number' without adding anything new.",
      "Walk out — any employer this inflexible is not worth it.",
    ],
    bestIndex: 1,
    explanation:
      "When the salary wall is real, pivot to total compensation. A 90-day review, schedule flexibility, or a signing bonus all have real value. Keep the conversation alive.",
  },
  {
    situation:
      "Your manager agreed to a raise verbally. Two weeks pass and nothing changed on your paycheck. What do you do?",
    options: [
      "Assume it is coming — do not bother them.",
      "Quit immediately — trust is broken.",
      "Send a short professional note: 'Hi [Name], confirming the timeline for the pay adjustment from our [date] conversation.'",
      "Tell coworkers about your promised raise to create social pressure.",
    ],
    bestIndex: 2,
    explanation:
      "Always follow up in writing. A short, factual message referencing the specific date of your agreement creates a record and holds everyone accountable — professionally.",
  },
  {
    situation:
      "You have two job offers. You prefer Company B's culture, but they offered $50K vs. Company A's $55K. Your move?",
    options: [
      "Lie — tell Company B that Company A offered $65K.",
      "Take Company A — money is money.",
      "Tell Company B honestly: 'I have a competing offer at $55K and would love to join your team — can you close the gap?'",
      "Accept Company B without mentioning the competing offer.",
    ],
    bestIndex: 2,
    explanation:
      "A real competing offer is one of your strongest tools — but only when used honestly. Lying about numbers destroys trust if discovered. Transparency plus a real offer equals legitimate leverage.",
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// GAME 2 — NEGOTIATION SIMULATOR
// ═══════════════════════════════════════════════════════════════════════════════
interface SimScenario {
  title: string;
  role: string;
  context: string[];
  theirOffer: number;
  marketLow: number;
  marketHigh: number;
  batna: number | null;
  unit: '/hr' | '/yr';
  targetMin: number;
}

const simScenarios: SimScenario[] = [
  {
    title: "Part-time barista",
    role: "Weekend Barista — Local Coffee Shop",
    context: [
      "You have 4 months of barista experience.",
      "Glassdoor shows $15–17/hr for similar roles in your city.",
      "A competing café offered you $14.50/hr (your BATNA).",
      "The manager told you they really need someone reliable.",
    ],
    theirOffer: 13,
    marketLow: 15,
    marketHigh: 17,
    batna: 14.5,
    unit: '/hr',
    targetMin: 15,
  },
  {
    title: "Summer internship",
    role: "Marketing Intern — Tech Startup",
    context: [
      "10-week summer internship; your first in marketing.",
      "LinkedIn Salary shows $18–22/hr for marketing interns in this city.",
      "You have no other offers right now.",
      "The team lead said you were their top candidate.",
    ],
    theirOffer: 16,
    marketLow: 18,
    marketHigh: 22,
    batna: null,
    unit: '/hr',
    targetMin: 18,
  },
  {
    title: "First full-time job offer",
    role: "Junior Analyst — Financial Services Firm",
    context: [
      "Your first full-time offer post-graduation.",
      "Market research shows $55,000–62,000 for junior analysts in this city.",
      "Your current part-time work pays roughly $50,000 annualized (your BATNA).",
      "This role has been open for 3 months.",
    ],
    theirOffer: 48000,
    marketLow: 55000,
    marketHigh: 62000,
    batna: 50000,
    unit: '/yr',
    targetMin: 55000,
  },
];

type BotQuality = 'left_money' | 'great' | 'good' | 'ok' | 'rejected';
type Zone = 'too_low' | 'below_market' | 'in_market' | 'above_market' | 'too_high';

interface BotResponse {
  quality: BotQuality;
  zone: Zone;
  counterOffer: number;
  message: string;
}

const fmtRate = (n: number, unit: string) =>
  unit === '/yr' ? `$${n.toLocaleString()}` : `$${n.toFixed(2)}`;

const roundToUnit = (n: number, unit: string): number =>
  unit === '/yr' ? Math.round(n / 500) * 500 : Math.round(n * 4) / 4;

const getZone = (ask: number, { theirOffer, marketLow, marketHigh }: SimScenario): Zone => {
  if (ask <= theirOffer) return 'too_low';
  if (ask < marketLow) return 'below_market';
  if (ask <= marketHigh) return 'in_market';
  if (ask <= marketHigh * 1.30) return 'above_market';
  return 'too_high';
};

// Bot responds based on where the ask lands relative to the market range.
// in_market and above_market always yield Grade A territory so users can actually win.
const getBotResponse = (userAsk: number, scenario: SimScenario): BotResponse => {
  const { theirOffer, marketLow, unit } = scenario;
  const fmt = (n: number) => fmtRate(n, unit);
  const zone = getZone(userAsk, scenario);

  switch (zone) {
    case 'too_low':
      return { zone, quality: 'left_money', counterOffer: userAsk, message: `Sure — ${fmt(userAsk)}${unit} works for us!` };

    case 'below_market': {
      const counter = roundToUnit((theirOffer + marketLow) / 2, unit);
      return { zone, quality: 'ok', counterOffer: counter, message: `We can stretch a little — how about ${fmt(counter)}${unit}?` };
    }

    case 'in_market': {
      const counter = roundToUnit(marketLow, unit);
      return { zone, quality: 'great', counterOffer: counter, message: `We appreciate your research. We can do ${fmt(counter)}${unit}.` };
    }

    case 'above_market': {
      const counter = roundToUnit(marketLow * 1.05, unit);
      return { zone, quality: 'good', counterOffer: counter, message: `That is higher than budgeted. The best we can do is ${fmt(counter)}${unit}.` };
    }

    case 'too_high':
      return { zone, quality: 'rejected', counterOffer: theirOffer, message: `That is well above our range. Our offer stands at ${fmt(theirOffer)}${unit}.` };
  }
};

const getAdvice = (zone: Zone, scenario: SimScenario): { what: string; how: string } => {
  const { marketLow, marketHigh, theirOffer, unit } = scenario;
  const fmt = (n: number) => `${fmtRate(n, unit)}${unit}`;

  switch (zone) {
    case 'too_low':
      return {
        what: 'You accepted at or below their initial offer without negotiating up.',
        how: `Always counter. Asking anywhere from ${fmt(marketLow)} to ${fmt(marketHigh)} earns Grade A — the bot meets you at market low.`,
      };
    case 'below_market':
      return {
        what: 'Your ask was below the market range, so the bot settled at a below-market midpoint.',
        how: `Ask ${fmt(marketLow)} or higher. The bot will meet you at market low (${fmt(marketLow)}), which is Grade A.`,
      };
    case 'in_market':
      return {
        what: 'Asking within market range was correct — the bot came to market low.',
        how: `You got Grade A. Pushing back after the bot responds splits the gap further toward ${fmt(marketHigh)}.`,
      };
    case 'above_market':
      return {
        what: 'Anchoring above market high signaled confidence and the bot moved significantly.',
        how: `Grade A territory. Pushing back splits the remaining gap — you can reach up to ${fmt(roundToUnit(marketLow * 1.05, unit))} or more.`,
      };
    case 'too_high':
      return {
        what: "Your ask exceeded the bot's hard limit and they held firm at their original offer.",
        how: `Keep your anchor within 30% of their offer (${fmt(roundToUnit(theirOffer * 1.30, unit))} max). Above that, they stop negotiating.`,
      };
  }
};

interface Settlement {
  amount: number;
  grade: string;
  label: string;
  color: string;
  bgClass: string;
}

const getSettlementGrade = (amount: number, scenario: SimScenario): Settlement => {
  const { theirOffer, targetMin } = scenario;
  if (amount <= theirOffer)
    return { amount, grade: 'D', label: 'Left money behind', color: 'text-red-600', bgClass: 'bg-red-50 border-red-200' };
  if (amount < targetMin)
    return { amount, grade: 'C', label: 'Below market', color: 'text-orange-500', bgClass: 'bg-orange-50 border-orange-200' };
  return { amount, grade: 'A', label: 'At or above market', color: 'text-green-600', bgClass: 'bg-green-50 border-green-200' };
};

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════

const IntroPage = ({ handleNext }: { handleNext: () => void }) => (
  <div className="max-w-5xl mx-auto pt-16">
    <motion.div className="text-center mb-12" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
      <h1 className="text-5xl font-bold mb-4 text-gray-800">The Art of Negotiating</h1>
      <p className="text-xl text-gray-600">Asking for more — at any job, at any stage</p>
    </motion.div>

    <div className="space-y-6 mb-12">
      <motion.div
        className="p-8 rounded-3xl shadow-xl bg-white"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
      >
        <div className="flex items-start gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-500 flex items-center justify-center shadow-lg flex-shrink-0">
            <span className="text-3xl text-white font-bold">$</span>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">The Cost of Not Asking</h3>
            <p className="text-gray-700 text-lg leading-relaxed">
              The average worker who never negotiates their starting salary loses over{' '}
              <span className="font-bold text-amber-600">$1 million</span> in lifetime earnings compared to
              someone who negotiates every offer. That gap compounds through every raise, every promotion,
              and every retirement contribution that follows.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {[
            { stat: '85%', label: 'of employers expect candidates to negotiate', sub: 'Refusing to negotiate surprises them.' },
            { stat: '$5K', label: 'average first-offer gap in entry-level jobs', sub: 'Left on the table by 7 in 10 graduates.' },
            { stat: '2 min', label: 'is all a negotiation conversation takes', sub: 'Most people spend weeks dreading it.' },
          ].map((item, i) => (
            <motion.div
              key={i}
              className="bg-amber-50 rounded-2xl p-5 border border-amber-200 text-center"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.1 }}
            >
              <div className="text-4xl font-bold text-amber-600 mb-2">{item.stat}</div>
              <div className="font-semibold text-gray-800 text-sm mb-1">{item.label}</div>
              <div className="text-xs text-gray-500">{item.sub}</div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div
        className="p-8 rounded-3xl shadow-xl bg-white"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
      >
        <h3 className="text-2xl font-bold text-gray-800 mb-4">Why Most People Stay Silent</h3>
        <div className="grid md:grid-cols-2 gap-4">
          {[
            { myth: 'It feels rude or greedy', truth: 'Employers budget for negotiation — it signals professionalism.' },
            { myth: 'They might rescind the offer', truth: 'Documented cases are extremely rare for reasonable counter-offers.' },
            { myth: '"I am not experienced enough"', truth: 'Market rate applies to the role, not just seniority.' },
            { myth: 'I do not know the right words', truth: 'Three sentences is all it takes — this module gives you exactly those.' },
          ].map((item, i) => (
            <div key={i} className="flex gap-3 p-4 bg-gray-50 rounded-xl">
              <div className="flex-shrink-0 mt-0.5">
                <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center">
                  <span className="text-red-500 text-xs font-bold">✕</span>
                </div>
              </div>
              <div>
                <div className="font-semibold text-gray-800 text-sm">{item.myth}</div>
                <div className="text-gray-600 text-xs mt-1">{item.truth}</div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div
        className="bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-500 p-6 rounded-2xl"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
      >
        <p className="text-amber-900 text-lg">
          <span className="font-bold">The shift that changes everything:</span> Negotiation is not about
          being aggressive. It is about knowing your market value and communicating it calmly. This module
          teaches you exactly how.
        </p>
      </motion.div>
    </div>

    <div className="flex justify-center pb-12">
      <button
        onClick={handleNext}
        className="px-10 py-4 rounded-2xl bg-amber-500 text-white font-bold text-lg shadow-xl hover:bg-amber-600 transition"
      >
        Know Your Value →
      </button>
    </div>
  </div>
);

const KnowYourValuePage = ({ handlePrev, handleNext }: { handlePrev: () => void; handleNext: () => void }) => (
  <div className="max-w-5xl mx-auto pt-16">
    <motion.h2 className="text-4xl font-bold mb-4 text-center text-gray-800" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      Know Your Value
    </motion.h2>
    <p className="text-center text-gray-600 mb-8 text-lg">Research is the difference between guessing and knowing</p>

    <div className="space-y-6 mb-8">
      <motion.div
        className="bg-white border-2 border-amber-200 rounded-3xl p-8"
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      >
        <h3 className="text-2xl font-bold text-amber-800 mb-4">Step 1 — Research Market Rate</h3>
        <p className="text-gray-700 mb-6">Before any negotiation conversation, know what the role actually pays.</p>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { src: 'Glassdoor', desc: 'Search the exact job title in your city. Look at the median and 75th percentile — not just the average.' },
            { src: 'LinkedIn Salary', desc: 'Filters by location, industry, and experience level. Often more current than other sources.' },
            { src: 'Ask people', desc: 'Peers, mentors, and professional communities are often the most accurate source. Talking money is not taboo.' },
          ].map((item, i) => (
            <motion.div
              key={i}
              className="bg-amber-50 rounded-2xl p-5 border border-amber-200"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.1 }}
            >
              <div className="font-bold text-amber-800 mb-2">{item.src}</div>
              <p className="text-sm text-gray-600 leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-6 bg-gray-50 rounded-2xl p-5 border border-gray-200">
          <div className="font-semibold text-gray-800 mb-3">Example research output</div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 text-gray-600">Role</th>
                  <th className="text-right py-2 text-gray-600">Low</th>
                  <th className="text-right py-2 text-gray-600">Median</th>
                  <th className="text-right py-2 text-gray-600">High</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { role: 'Barista (part-time)', low: '$13/hr', med: '$15/hr', high: '$17/hr' },
                  { role: 'Marketing intern', low: '$16/hr', med: '$19/hr', high: '$22/hr' },
                  { role: 'Junior analyst', low: '$48K', med: '$57K', high: '$65K' },
                ].map((row, i) => (
                  <tr key={i} className="border-b border-gray-100">
                    <td className="py-2 font-medium text-gray-800">{row.role}</td>
                    <td className="py-2 text-right text-red-600">{row.low}</td>
                    <td className="py-2 text-right text-amber-600 font-semibold">{row.med}</td>
                    <td className="py-2 text-right text-green-600">{row.high}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-500 mt-3">Your ask should be at or near the high end — you can always negotiate down, never up from your anchor.</p>
        </div>
      </motion.div>

      <motion.div
        className="bg-white border-2 border-orange-200 rounded-3xl p-8"
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
      >
        <h3 className="text-2xl font-bold text-orange-800 mb-4">Step 2 — Know Your BATNA</h3>
        <p className="text-gray-700 mb-5">
          BATNA stands for <span className="font-bold">Best Alternative To a Negotiated Agreement</span>.
          It is your walk-away point — what you will do if this offer falls through.
        </p>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
            <div className="font-bold text-orange-800 mb-2">Strong BATNA</div>
            <ul className="text-sm text-orange-900 space-y-1">
              <li>Another job offer on the table</li>
              <li>Current job you can stay at</li>
              <li>Freelance income as a backup</li>
              <li>Graduate school acceptance</li>
            </ul>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <div className="font-bold text-gray-700 mb-2">Weak BATNA</div>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>Nothing else lined up</li>
              <li>Desperately need this income</li>
              <li>Burned bridges at previous employer</li>
            </ul>
          </div>
        </div>
        <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-amber-900 text-sm">
            <span className="font-bold">Key insight:</span> You can strengthen your BATNA before negotiating.
            Apply to multiple places. Keep your current job until an offer is signed. Knowing you have options
            — even if you prefer this one — changes how you show up in the conversation.
          </p>
        </div>
      </motion.div>

      <motion.div
        className="bg-white border-2 border-yellow-200 rounded-3xl p-8"
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
      >
        <h3 className="text-2xl font-bold text-yellow-800 mb-4">Step 3 — Set Your Target Range</h3>
        <p className="text-gray-700 mb-5">
          Never go into a negotiation with a single number. Go with a range — and anchor at the top.
        </p>
        <div className="flex items-center gap-3 flex-wrap justify-center">
          {[
            { label: 'Walk-away (BATNA)', color: 'bg-red-100 text-red-800 border-red-200', example: '$14.50/hr' },
            { label: 'Target low', color: 'bg-orange-100 text-orange-800 border-orange-200', example: '$15.50/hr' },
            { label: 'Target high (your ask)', color: 'bg-green-100 text-green-800 border-green-200', example: '$17/hr' },
          ].map((item, i) => (
            <React.Fragment key={i}>
              <div className={`rounded-xl px-5 py-4 border-2 text-center ${item.color}`}>
                <div className="text-xs font-semibold mb-1">{item.label}</div>
                <div className="font-bold text-lg">{item.example}</div>
              </div>
              {i < 2 && <span className="text-gray-400 text-2xl">→</span>}
            </React.Fragment>
          ))}
        </div>
        <p className="text-sm text-gray-500 text-center mt-4">You open at your target high. Negotiations pull the number down, so start where you want to end up.</p>
      </motion.div>
    </div>

    <div className="flex justify-between pb-12">
      <button onClick={handlePrev} className="px-8 py-3 rounded-2xl bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition">← Back</button>
      <button onClick={handleNext} className="px-10 py-4 rounded-2xl bg-amber-500 text-white font-bold text-lg shadow-xl hover:bg-amber-600 transition">The Playbook →</button>
    </div>
  </div>
);

const PlaybookPage = ({ handlePrev, handleNext }: { handlePrev: () => void; handleNext: () => void }) => (
  <div className="max-w-5xl mx-auto pt-16">
    <motion.h2 className="text-4xl font-bold mb-4 text-center text-gray-800" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      The Negotiation Playbook
    </motion.h2>
    <p className="text-center text-gray-600 mb-8 text-lg">Scripts, tactics, and the hidden levers most people forget</p>

    <div className="space-y-6 mb-8">
      <motion.div
        className="bg-white border-2 border-amber-200 rounded-3xl p-8"
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      >
        <h3 className="text-2xl font-bold text-amber-800 mb-6">Scripts That Work</h3>
        <div className="space-y-4">
          {[
            {
              label: 'Asking for a raise',
              script: '"Based on my research and the results I have delivered — [specific achievement] — I would like to discuss moving my rate to $X. When would be a good time to talk?"',
            },
            {
              label: 'Countering a job offer',
              script: '"Thank you so much for the offer — I am genuinely excited about this role. Based on market data for this position in [city], I was expecting something closer to $X. Is there flexibility there?"',
            },
            {
              label: 'When they say the budget is fixed',
              script: '"I understand. If the base is firm right now, I would love to explore whether there is flexibility on [PTO / start date / remote days / signing bonus / a 90-day review]."',
            },
            {
              label: 'Closing after they counter',
              script: '"That works for me. Can we get that confirmed in writing today?"',
            },
          ].map((item, i) => (
            <div key={i} className="rounded-2xl overflow-hidden border border-gray-200">
              <div className="bg-amber-100 px-4 py-2">
                <span className="font-semibold text-amber-900 text-sm">{item.label}</span>
              </div>
              <div className="px-4 py-3 bg-gray-50">
                <p className="text-gray-800 text-sm leading-relaxed italic">"{item.script}"</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div
        className="bg-white border-2 border-orange-200 rounded-3xl p-8"
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
      >
        <h3 className="text-2xl font-bold text-orange-800 mb-5">Tactics Most People Miss</h3>
        <div className="grid md:grid-cols-2 gap-4">
          {[
            { tactic: 'Use silence', detail: 'After stating your ask, stop talking. The next person to speak tends to concede. Let your number land.' },
            { tactic: 'Anchor high, on purpose', detail: 'Your first number sets the reference point. If you start at market rate, you end up below it. Start at the top of the range.' },
            { tactic: 'Ask for time', detail: 'Never accept verbally on the spot. "Can I have until Friday to review?" is not just allowed — it is expected.' },
            { tactic: 'Negotiate total comp', detail: 'Salary is one line. Benefits, PTO, remote flexibility, signing bonus, and review timelines all have dollar value.' },
          ].map((item, i) => (
            <div key={i} className="bg-orange-50 rounded-xl p-4 border border-orange-200">
              <div className="font-bold text-orange-800 mb-2">{item.tactic}</div>
              <p className="text-sm text-gray-700">{item.detail}</p>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div
        className="bg-white border-2 border-yellow-200 rounded-3xl p-8"
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
      >
        <h3 className="text-2xl font-bold text-yellow-800 mb-5">Non-Salary Negotiables</h3>
        <p className="text-gray-700 mb-4">Even at a part-time job, more than the hourly rate is on the table.</p>
        <div className="grid md:grid-cols-3 gap-3">
          {[
            'Shift flexibility',
            'Remote or hybrid days',
            'Start date',
            'Additional PTO',
            'Signing bonus',
            'Early performance review',
            'Equipment or stipend',
            'Title upgrade',
            'Training budget',
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2 bg-yellow-50 rounded-xl px-3 py-2 border border-yellow-200">
              <div className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />
              <span className="text-sm font-medium text-gray-800">{item}</span>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div
        className="bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-500 p-6 rounded-2xl"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
      >
        <p className="text-amber-900 text-lg">
          <span className="font-bold">The golden rule:</span> Negotiation is a conversation, not a confrontation.
          Stay curious, stay calm, and treat it like any professional discussion. Most managers respect it.
        </p>
      </motion.div>
    </div>

    <div className="flex justify-between pb-12">
      <button onClick={handlePrev} className="px-8 py-3 rounded-2xl bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition">← Back</button>
      <button onClick={handleNext} className="px-10 py-4 rounded-2xl bg-amber-500 text-white font-bold text-lg shadow-xl hover:bg-amber-600 transition">Play: The Right Move →</button>
    </div>
  </div>
);

// ─── GAME 1 COMPONENT ─────────────────────────────────────────────────────────
const RightMoveGame = ({ onComplete }: { onComplete: () => void }) => {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [correct, setCorrect] = useState(0);
  const [done, setDone] = useState(false);

  const scenario = rightMoveScenarios[current];

  const handleSelect = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    if (idx === scenario.bestIndex) setCorrect(c => c + 1);
  };

  const handleNext = () => {
    if (current < rightMoveScenarios.length - 1) {
      setCurrent(c => c + 1);
      setSelected(null);
    } else {
      setDone(true);
    }
  };

  if (done) {
    const score = Math.round((correct / rightMoveScenarios.length) * 100);
    return (
      <div className="max-w-3xl mx-auto pt-16 pb-16 text-center">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-amber-100 border-4 border-amber-400 flex items-center justify-center">
            <span className="text-4xl font-bold text-amber-600">{score}%</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            {score >= 80 ? 'Sharp instincts!' : 'Good effort — review the explanations.'}
          </h2>
          <p className="text-gray-600 mb-8">
            You chose the best move in {correct} of {rightMoveScenarios.length} scenarios.
          </p>
          <button
            onClick={onComplete}
            className="px-10 py-4 rounded-2xl bg-amber-500 text-white font-bold text-lg shadow-xl hover:bg-amber-600 transition"
          >
            Negotiation Simulator →
          </button>
        </motion.div>
      </div>
    );
  }

  const labels = ['A', 'B', 'C', 'D'];

  return (
    <div className="max-w-4xl mx-auto pt-16 pb-12">
      <div className="mb-8 text-center">
        <p className="text-sm text-gray-500 mb-2">Scenario {current + 1} of {rightMoveScenarios.length}</p>
        <div className="flex gap-2 justify-center">
          {rightMoveScenarios.map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all ${i < current ? 'bg-amber-500 w-8' : i === current ? 'bg-amber-400 w-8' : 'bg-gray-200 w-8'}`}
            />
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.3 }}
        >
          <div className="bg-white rounded-3xl shadow-xl p-8 mb-6 border-2 border-amber-100">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold flex-shrink-0">
                {current + 1}
              </div>
              <p className="text-gray-800 text-lg leading-relaxed font-medium">{scenario.situation}</p>
            </div>

            <div className="space-y-3">
              {scenario.options.map((opt, i) => {
                const isSelected = selected === i;
                const isBest = selected !== null && i === scenario.bestIndex;
                const isWrong = isSelected && i !== scenario.bestIndex;

                return (
                  <button
                    key={i}
                    onClick={() => handleSelect(i)}
                    disabled={selected !== null}
                    className={`w-full text-left px-5 py-4 rounded-2xl border-2 transition flex items-start gap-3 ${
                      isBest
                        ? 'bg-green-50 border-green-400 text-green-900'
                        : isWrong
                        ? 'bg-red-50 border-red-400 text-red-900'
                        : isSelected
                        ? 'bg-amber-50 border-amber-400'
                        : 'bg-gray-50 border-gray-200 hover:border-amber-300 hover:bg-amber-50'
                    }`}
                  >
                    <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                      isBest ? 'bg-green-500 text-white' : isWrong ? 'bg-red-400 text-white' : 'bg-white border border-gray-300 text-gray-700'
                    }`}>
                      {labels[i]}
                    </span>
                    <span className="text-sm leading-relaxed">{opt}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <AnimatePresence>
            {selected !== null && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-900 text-slate-100 rounded-2xl p-6 mb-6"
              >
                <div className={`font-bold mb-2 ${selected === scenario.bestIndex ? 'text-green-400' : 'text-red-400'}`}>
                  {selected === scenario.bestIndex ? 'Best move!' : `Best move was: ${labels[scenario.bestIndex]}`}
                </div>
                <p className="text-sm leading-relaxed">{scenario.explanation}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {selected !== null && (
            <div className="flex justify-end">
              <button
                onClick={handleNext}
                className="px-8 py-3 rounded-2xl bg-amber-500 text-white font-bold shadow-lg hover:bg-amber-600 transition"
              >
                {current < rightMoveScenarios.length - 1 ? 'Next Scenario →' : 'See Results →'}
              </button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

// ─── GAME 2 COMPONENT ─────────────────────────────────────────────────────────
type SimPhase = 'setup' | 'user_input' | 'bot_response' | 'outcome' | 'complete';

const NegotiationSimulator = ({ onComplete }: { onComplete: () => void }) => {
  const [scenarioIdx, setScenarioIdx] = useState(0);
  const [phase, setPhase] = useState<SimPhase>('setup');
  const [userInput, setUserInput] = useState('');
  const [userAskAmount, setUserAskAmount] = useState<number | null>(null);
  const [botResp, setBotResp] = useState<BotResponse | null>(null);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [inputError, setInputError] = useState('');

  const scenario = simScenarios[scenarioIdx];

  const handleBegin = () => setPhase('user_input');

  const handleSubmitCounter = () => {
    const raw = userInput.replace(/[$,\s]/g, '');
    const val = parseFloat(raw);
    if (isNaN(val) || val <= 0) {
      setInputError('Enter a valid number (e.g. 17 or 58000)');
      return;
    }
    setInputError('');
    setUserAskAmount(val);
    const resp = getBotResponse(val, scenario);
    setBotResp(resp);
    setPhase('bot_response');
  };

  const handleAccept = () => {
    if (!botResp) return;
    const s = getSettlementGrade(botResp.counterOffer, scenario);
    setSettlements(prev => [...prev, s]);
    setPhase('outcome');
  };

  const handlePushBack = () => {
    if (!botResp || userAskAmount === null) return;
    const { unit, marketHigh } = scenario;

    let finalOffer: number;
    if (botResp.quality === 'rejected' || botResp.quality === 'left_money') {
      finalOffer = botResp.counterOffer;
    } else {
      // Split the remaining gap between bot's counter and the user's original ask, capped at market high
      const split = (botResp.counterOffer + userAskAmount) / 2;
      finalOffer = roundToUnit(Math.min(split, marketHigh), unit);
    }

    const s = getSettlementGrade(finalOffer, scenario);
    setSettlements(prev => [...prev, s]);
    setPhase('outcome');
  };

  const handleNextScenario = () => {
    if (scenarioIdx < simScenarios.length - 1) {
      setScenarioIdx(i => i + 1);
      setPhase('setup');
      setUserInput('');
      setUserAskAmount(null);
      setBotResp(null);
      setInputError('');
    } else {
      setPhase('complete');
    }
  };

  if (phase === 'complete') {
    const avg = settlements.filter(s => s.grade === 'A').length;
    return (
      <div className="max-w-3xl mx-auto pt-16 pb-16">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Simulator Complete</h2>
          <p className="text-gray-500">Here is how you performed across all three negotiations</p>
        </motion.div>

        <div className="space-y-4 mb-8">
          {settlements.map((s, i) => (
            <div key={i} className={`flex items-center justify-between p-5 rounded-2xl border-2 ${s.bgClass}`}>
              <div>
                <div className="font-bold text-gray-800">{simScenarios[i].title}</div>
                <div className="text-sm text-gray-600">Settled at {fmtRate(s.amount, simScenarios[i].unit)}{simScenarios[i].unit}</div>
              </div>
              <div className="text-right">
                <div className={`text-3xl font-bold ${s.color}`}>{s.grade}</div>
                <div className={`text-xs font-medium ${s.color}`}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-6 text-center mb-8">
          <p className="text-amber-900">
            <span className="font-bold">{avg} of 3</span> negotiations landed at or above market rate.
            {avg === 3 && ' Outstanding — you negotiated well in every scenario.'}
            {avg === 2 && ' Strong work. Review the scenario where you left money behind.'}
            {avg <= 1 && ' Practice makes this second nature. The quiz will reinforce the key tactics.'}
          </p>
        </div>

        <div className="flex justify-center">
          <button
            onClick={onComplete}
            className="px-10 py-4 rounded-2xl bg-amber-500 text-white font-bold text-lg shadow-xl hover:bg-amber-600 transition"
          >
            Final Quiz →
          </button>
        </div>
      </div>
    );
  }

  const currentSettlement = settlements[scenarioIdx];

  return (
    <div className="max-w-4xl mx-auto pt-16 pb-12">
      <div className="mb-6 text-center">
        <p className="text-sm text-gray-500 mb-2">Scenario {scenarioIdx + 1} of {simScenarios.length}</p>
        <div className="flex gap-2 justify-center">
          {simScenarios.map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all ${i < scenarioIdx ? 'bg-amber-500 w-8' : i === scenarioIdx ? 'bg-amber-400 w-8' : 'bg-gray-200 w-8'}`}
            />
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={`${scenarioIdx}-${phase}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>

          {/* Setup phase */}
          {phase === 'setup' && (
            <div>
              <div className="bg-white rounded-3xl shadow-xl p-8 mb-6 border-2 border-amber-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-white font-bold text-sm">
                    {scenarioIdx + 1}
                  </div>
                  <div>
                    <div className="font-bold text-gray-800 text-lg">{scenario.title}</div>
                    <div className="text-sm text-gray-500">{scenario.role}</div>
                  </div>
                </div>

                <div className="space-y-2 mb-6">
                  {scenario.context.map((line, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <div className="w-2 h-2 rounded-full bg-amber-400 mt-2 flex-shrink-0" />
                      <p className="text-gray-700 text-sm">{line}</p>
                    </div>
                  ))}
                </div>

                <div className="grid md:grid-cols-3 gap-3">
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-center">
                    <div className="text-xs text-gray-500 mb-1">Their offer</div>
                    <div className="font-bold text-red-700 text-xl">{fmtRate(scenario.theirOffer, scenario.unit)}{scenario.unit}</div>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-center">
                    <div className="text-xs text-gray-500 mb-1">Market range</div>
                    <div className="font-bold text-gray-700 text-lg">
                      {fmtRate(scenario.marketLow, scenario.unit)}–{fmtRate(scenario.marketHigh, scenario.unit)}{scenario.unit}
                    </div>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-center">
                    <div className="text-xs text-gray-500 mb-1">Your BATNA</div>
                    <div className="font-bold text-blue-700 text-lg">
                      {scenario.batna ? `${fmtRate(scenario.batna, scenario.unit)}${scenario.unit}` : 'None'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-center">
                <button
                  onClick={handleBegin}
                  className="px-10 py-4 rounded-2xl bg-amber-500 text-white font-bold text-lg shadow-xl hover:bg-amber-600 transition"
                >
                  Start Negotiating →
                </button>
              </div>
            </div>
          )}

          {/* User input phase */}
          {phase === 'user_input' && (
            <div>
              <div className="bg-white rounded-3xl shadow-xl p-8 mb-6 border-2 border-amber-100">
                <div className="mb-4 p-4 bg-gray-50 rounded-2xl border border-gray-200 text-sm text-gray-700">
                  <span className="font-semibold">Manager: </span>
                  "Thanks for coming in. We'd like to start you at{' '}
                  <span className="font-bold text-red-600">{fmtRate(scenario.theirOffer, scenario.unit)}{scenario.unit}</span>.
                  How does that sound?"
                </div>

                <div className="mb-6">
                  <label className="block font-semibold text-gray-700 mb-3">Your counter-offer ({scenario.unit === '/hr' ? 'per hour' : 'annual salary'})</label>
                  <div className="flex gap-3">
                    <div className="flex-1 relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">$</span>
                      <input
                        type="text"
                        value={userInput}
                        onChange={e => setUserInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSubmitCounter()}
                        placeholder={scenario.unit === '/hr' ? '16.50' : '58000'}
                        className="w-full pl-8 pr-4 py-4 rounded-2xl border-2 border-amber-300 focus:border-amber-500 focus:outline-none text-lg font-semibold"
                      />
                    </div>
                    <button
                      onClick={handleSubmitCounter}
                      className="px-6 py-4 rounded-2xl bg-amber-500 text-white font-bold hover:bg-amber-600 transition"
                    >
                      Submit
                    </button>
                  </div>
                  {inputError && <p className="text-red-500 text-sm mt-2">{inputError}</p>}
                </div>

                <div className="space-y-2">
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800 font-semibold">
                    Tip: Anchor at or near the market high ({fmtRate(scenario.marketHigh, scenario.unit)}{scenario.unit}) for the best outcome.
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="bg-red-50 rounded-lg p-2 border border-red-100">
                      <div className="font-bold text-red-600">Grade D</div>
                      <div className="text-gray-500">≤ {fmtRate(scenario.theirOffer, scenario.unit)}</div>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-2 border border-orange-100">
                      <div className="font-bold text-orange-500">Grade C</div>
                      <div className="text-gray-500">{fmtRate(scenario.theirOffer, scenario.unit)} – {fmtRate(scenario.marketLow, scenario.unit)}</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-2 border border-green-100">
                      <div className="font-bold text-green-600">Grade A</div>
                      <div className="text-gray-500">≥ {fmtRate(scenario.marketLow, scenario.unit)}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Bot response phase */}
          {phase === 'bot_response' && botResp && (
            <div>
              <div className="bg-white rounded-3xl shadow-xl p-8 mb-6 border-2 border-amber-100">
                <div className="mb-4 p-4 bg-gray-50 rounded-2xl border border-gray-200 text-sm text-gray-700">
                  <span className="font-semibold">Manager: </span>
                  "{botResp.message}"
                </div>

                {botResp.quality !== 'left_money' && botResp.quality !== 'rejected' && (
                  <div className="mb-4 p-4 bg-blue-50 rounded-2xl border border-blue-200">
                    <div className="text-sm font-semibold text-blue-800 mb-1">Counter-offer on the table</div>
                    <div className="text-2xl font-bold text-blue-700">{fmtRate(botResp.counterOffer, scenario.unit)}{scenario.unit}</div>
                  </div>
                )}

                {botResp.quality === 'left_money' && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-sm text-red-800">
                    You accepted below their initial offer. You left money on the table — the negotiation is over.
                  </div>
                )}

                {botResp.quality !== 'left_money' && (
                  <div className="space-y-3">
                    <p className="font-semibold text-gray-700 mb-2">What do you do?</p>
                    <button
                      onClick={handleAccept}
                      className="w-full text-left px-5 py-4 rounded-2xl border-2 border-green-200 bg-green-50 hover:bg-green-100 transition text-green-800 font-medium"
                    >
                      Accept {botResp.quality !== 'rejected' ? fmtRate(botResp.counterOffer, scenario.unit) : fmtRate(scenario.theirOffer, scenario.unit)}{scenario.unit}
                    </button>
                    {botResp.quality !== 'rejected' && (
                      <button
                        onClick={handlePushBack}
                        className="w-full text-left px-5 py-4 rounded-2xl border-2 border-amber-200 bg-amber-50 hover:bg-amber-100 transition text-amber-800 font-medium"
                      >
                        <span className="block">
                          Push back: "I appreciate that — is there room to move toward my ask of{' '}
                          {userAskAmount !== null ? fmtRate(userAskAmount, scenario.unit) : '...'}
                          {scenario.unit}?"
                        </span>
                        <span className="block text-xs text-amber-600 mt-1">
                          Splits the gap between the bot's counter ({fmtRate(botResp.counterOffer, scenario.unit)}) and your ask
                        </span>
                      </button>
                    )}
                  </div>
                )}

                {botResp.quality === 'left_money' && (
                  <div className="flex justify-end mt-4">
                    <button
                      onClick={handleAccept}
                      className="px-8 py-3 rounded-2xl bg-gray-500 text-white font-bold hover:bg-gray-600 transition"
                    >
                      See Result →
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Outcome phase */}
          {phase === 'outcome' && currentSettlement && botResp && (
            <div>
              <div className={`bg-white rounded-3xl shadow-xl p-8 mb-6 border-2 ${currentSettlement.bgClass}`}>
                <div className="text-center mb-6">
                  <div className={`text-6xl font-bold ${currentSettlement.color} mb-1`}>{currentSettlement.grade}</div>
                  <div className={`font-semibold text-lg ${currentSettlement.color}`}>{currentSettlement.label}</div>
                </div>

                {/* Breakdown: their offer → you asked → you settled */}
                <div className="grid grid-cols-3 gap-3 text-center text-sm mb-5">
                  <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
                    <div className="text-xs text-gray-500 mb-1">Their offer</div>
                    <div className="font-bold text-gray-700">{fmtRate(scenario.theirOffer, scenario.unit)}</div>
                  </div>
                  <div className="bg-amber-50 rounded-xl p-3 border border-amber-200">
                    <div className="text-xs text-gray-500 mb-1">You asked</div>
                    <div className="font-bold text-amber-700">
                      {userAskAmount !== null ? fmtRate(userAskAmount, scenario.unit) : '—'}
                    </div>
                  </div>
                  <div className={`rounded-xl p-3 border ${currentSettlement.bgClass}`}>
                    <div className="text-xs text-gray-500 mb-1">You settled</div>
                    <div className={`font-bold ${currentSettlement.color}`}>{fmtRate(currentSettlement.amount, scenario.unit)}</div>
                  </div>
                </div>

                {/* Grade A reference bar */}
                <div className="flex justify-between text-xs mb-3 px-1">
                  <span className="text-gray-400">Their offer: {fmtRate(scenario.theirOffer, scenario.unit)}</span>
                  <span className="text-green-600 font-semibold">
                    Grade A zone: {fmtRate(scenario.targetMin, scenario.unit)}–{fmtRate(scenario.marketHigh, scenario.unit)}{scenario.unit}
                  </span>
                </div>

                {/* What happened + how to get A */}
                {(() => {
                  const advice = getAdvice(botResp.zone, scenario);
                  return (
                    <div className="bg-slate-800 text-slate-100 rounded-2xl p-5 space-y-3">
                      <div>
                        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">What happened</div>
                        <p className="text-sm leading-relaxed">{advice.what}</p>
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-amber-400 uppercase tracking-wide mb-1">How to get Grade A</div>
                        <p className="text-sm leading-relaxed text-amber-200">{advice.how}</p>
                      </div>
                    </div>
                  );
                })()}
              </div>

              <div className="flex justify-center">
                <button
                  onClick={handleNextScenario}
                  className="px-10 py-4 rounded-2xl bg-amber-500 text-white font-bold text-lg shadow-xl hover:bg-amber-600 transition"
                >
                  {scenarioIdx < simScenarios.length - 1 ? 'Next Scenario →' : 'See Final Results →'}
                </button>
              </div>
            </div>
          )}

        </motion.div>
      </AnimatePresence>
    </div>
  );
};

// ─── QUIZ PAGE ────────────────────────────────────────────────────────────────
const QuizPage = ({
  handlePrev,
  onPass,
  onFail,
}: {
  handlePrev: () => void;
  onPass: (score: number) => void;
  onFail: (score: number) => void;
}) => {
  const shuffledQuestions = useMemo(() => shuffleQuizOptions(quizQuestions), []);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showAnswerResult, setShowAnswerResult] = useState(false);
  const [answers, setAnswers] = useState<number[]>([]);
  const [quizCompleted, setQuizCompleted] = useState(false);

  const score = answers.reduce((acc, ans, idx) => acc + (ans === shuffledQuestions[idx].correctIndex ? 1 : 0), 0);
  const pct = Math.round((score / shuffledQuestions.length) * 100);
  const passed = pct >= 80;

  const handleSelect = (idx: number) => {
    if (showAnswerResult) return;
    setSelectedAnswer(idx);
    setShowAnswerResult(true);
  };

  const handleNextQuestion = () => {
    const newAnswers = [...answers, selectedAnswer!];
    setAnswers(newAnswers);

    if (currentQuestion < shuffledQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowAnswerResult(false);
    } else {
      setQuizCompleted(true);
      if (passed) onPass(pct);
      else onFail(pct);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowAnswerResult(false);
    setAnswers([]);
    setQuizCompleted(false);
  };

  const labels = ['A', 'B', 'C', 'D'];

  return (
    <div className="max-w-4xl mx-auto pt-16 pb-16">
      {!quizCompleted ? (
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden flex flex-col min-h-[500px]">
          <div className="flex-1 p-8 lg:p-16 flex flex-col justify-center">
            <div className="flex justify-between items-end mb-8 border-b border-gray-100 pb-6">
              <div>
                <span className="text-sm font-bold text-amber-600 uppercase tracking-wider block mb-2">Question {currentQuestion + 1} of {shuffledQuestions.length}</span>
                <h2 className="text-2xl lg:text-4xl font-bold text-slate-900 leading-tight">
                  {shuffledQuestions[currentQuestion].question}
                </h2>
              </div>
              <div className="hidden lg:block text-slate-300">
                <span className="text-5xl">🤝</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {shuffledQuestions[currentQuestion].options.map((option: string, idx: number) => {
                const isSelected = selectedAnswer === idx;
                const isCorrect = idx === shuffledQuestions[currentQuestion].correctIndex;
                const showCorrectness = showAnswerResult && (isSelected || isCorrect);

                return (
                  <button
                    key={idx}
                    onClick={() => handleSelect(idx)}
                    disabled={showAnswerResult}
                    className={`p-6 lg:p-8 rounded-2xl text-left border-2 transition-all flex items-start gap-4 ${
                      showCorrectness
                        ? isCorrect
                          ? 'bg-green-50 border-green-500 text-green-900'
                          : isSelected
                            ? 'bg-red-50 border-red-500 text-red-900'
                            : 'bg-white border-slate-100 opacity-50'
                        : isSelected
                          ? 'bg-amber-50 border-amber-600 shadow-lg scale-[1.02]'
                          : 'bg-white border-slate-200 hover:border-amber-400 hover:shadow-md'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                      showCorrectness && isCorrect ? 'bg-green-500 text-white' :
                      showCorrectness && isSelected ? 'bg-red-500 text-white' :
                      isSelected ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {labels[idx]}
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
                  <h4 className="font-bold text-amber-400 uppercase tracking-wider text-sm mb-2">Explanation</h4>
                  <p className="text-lg leading-relaxed text-slate-200">
                    {shuffledQuestions[currentQuestion].explanation}
                  </p>
                </div>
                <button
                  onClick={handleNextQuestion}
                  className="w-full md:w-auto px-8 py-4 bg-white text-slate-900 rounded-xl font-bold hover:bg-amber-50 transition-colors whitespace-nowrap"
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
          <div className={`w-32 h-32 mx-auto rounded-full flex items-center justify-center mb-8 shadow-2xl ${
            passed ? 'bg-green-500' : 'bg-amber-500'
          }`}>
            <span className="text-6xl">{passed ? '🏆' : '📚'}</span>
          </div>

          <h2 className="text-5xl font-black text-slate-900 mb-4">{passed ? 'Outstanding!' : 'Keep Learning!'}</h2>
          <p className="text-2xl text-slate-500 mb-10">You scored <span className="font-bold text-slate-900">{score}/{shuffledQuestions.length}</span> ({pct}%)</p>

          {passed && (
            <div className="bg-green-50 border-2 border-green-500 rounded-2xl p-8 mb-10">
              <p className="text-green-800 font-bold text-xl mb-2">🎊 Congratulations! You passed!</p>
              <p className="text-green-700 text-lg">You've mastered the Art of Negotiating module</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!passed && (
              <button
                onClick={resetQuiz}
                className="px-8 py-4 rounded-xl bg-slate-900 text-white hover:bg-slate-800 font-bold text-lg transition-all shadow-lg"
              >
                Retake Quiz
              </button>
            )}
            <button
              onClick={handlePrev}
              className="px-8 py-4 rounded-xl border-2 border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-lg transition-all"
            >
              Back to Roadmap
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN MODULE COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
const NegotiatingModule = () => {
  const navigate = useNavigate();
  const { isModulePassed, saveScore } = useModuleScore();
  const [step, setStep] = useState(0);
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [quizResult, setQuizResult] = useState<{ score: number; passed: boolean } | null>(null);

  const moduleId = MODULES.NEGOTIATING.id;

  if (isModulePassed(moduleId) && !isReviewMode) {
    return (
      <ModuleCompletedScreen
        emoji="🤝"
        moduleName="The Art of Negotiating"
        description="You have already passed this module. Great work mastering negotiation fundamentals!"
        gradientClasses="from-amber-50 via-orange-50 to-yellow-100"
        onReviewClick={() => setIsReviewMode(true)}
      />
    );
  }

  const handlePass = async (score: number) => {
    setQuizResult({ score, passed: true });
    await saveScore(moduleId, score, 100);
  };

  const handleFail = (score: number) => {
    setQuizResult({ score, passed: false });
  };

  const steps = [
    <IntroPage key={0} handleNext={() => setStep(1)} />,
    <KnowYourValuePage key={1} handlePrev={() => setStep(0)} handleNext={() => setStep(2)} />,
    <PlaybookPage key={2} handlePrev={() => setStep(1)} handleNext={() => setStep(3)} />,
    <div key={3} className="max-w-5xl mx-auto">
      <div className="pt-10 text-center mb-8">
        <motion.h2 className="text-4xl font-bold text-gray-800" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          Game 1 — The Right Move
        </motion.h2>
        <p className="text-gray-600 mt-2">Six real negotiation scenarios. Pick the best action.</p>
      </div>
      <RightMoveGame onComplete={() => setStep(4)} />
    </div>,
    <div key={4} className="max-w-5xl mx-auto">
      <div className="pt-10 text-center mb-8">
        <motion.h2 className="text-4xl font-bold text-gray-800" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          Game 2 — Negotiation Simulator
        </motion.h2>
        <p className="text-gray-600 mt-2">Negotiate against a hiring manager across three real-world scenarios.</p>
      </div>
      <NegotiationSimulator onComplete={() => setStep(5)} />
    </div>,
    <QuizPage key={5} handlePrev={() => navigate('/game')} onPass={handlePass} onFail={handleFail} />,
  ];

  return (
    <div
      className="min-h-screen font-sans"
      style={{ background: 'linear-gradient(135deg, #fffbeb 0%, #fff7ed 40%, #fefce8 100%)' }}
    >
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-amber-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <button
            onClick={() => navigate('/game')}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition text-sm"
          >
            ← Roadmap
          </button>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500 flex items-center justify-center text-white font-bold text-sm">N</div>
            <div>
              <div className="font-bold text-gray-800 text-sm">The Art of Negotiating</div>
              <div className="text-xs text-gray-500">
                Step {step + 1} of {steps.length}
              </div>
            </div>
          </div>

          <div className="flex gap-1.5">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i < step ? 'bg-amber-500 w-6' : i === step ? 'bg-amber-400 w-6' : 'bg-gray-200 w-4'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Step content */}
      <div className="px-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25 }}
          >
            {steps[step]}
          </motion.div>
        </AnimatePresence>
      </div>

    </div>
  );
};

export default NegotiatingModule;
