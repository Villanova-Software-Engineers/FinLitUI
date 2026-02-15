import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useModuleScore, MODULES } from '../hooks/useModuleScore';
import ModuleCompletedScreen from './ModuleCompletedScreen';
import { DollarSign, Receipt, Shield, TrendingDown, Calculator, BookOpen, AlertCircle, CheckCircle, Building2, Scale, Wallet } from 'lucide-react';

// 10 Quiz Questions with explanations
const quizQuestions = [
  {
    question: "What is the primary purpose of paying taxes?",
    options: [
      "To fund government services and infrastructure",
      "To punish working citizens",
      "To make wealthy people pay more",
      "To support private businesses"
    ],
    correctIndex: 0,
    explanation: "Taxes fund essential government services like roads, schools, military, healthcare programs, emergency services, and infrastructure. Without taxes, the government couldn't provide these public services that benefit society."
  },
  {
    question: "Which type of tax is based on your income?",
    options: [
      "Sales tax",
      "Property tax",
      "Federal income tax",
      "Excise tax"
    ],
    correctIndex: 2,
    explanation: "Federal income tax is calculated based on your earnings from wages, salaries, investments, and business income. It's progressive, meaning higher earners pay a higher percentage rate on their income."
  },
  {
    question: "The United States uses a 'progressive' tax system. What does this mean?",
    options: [
      "Everyone pays the same percentage",
      "Higher income earners pay higher tax rates",
      "Tax rates decrease as you earn more",
      "Only wealthy people pay taxes"
    ],
    correctIndex: 1,
    explanation: "A progressive tax system means tax rates increase as income increases. Lower-income individuals pay a smaller percentage of their income in taxes, while higher earners pay progressively higher rates on portions of their income."
  },
  {
    question: "If you're in the 22% tax bracket, does that mean all your income is taxed at 22%?",
    options: [
      "Yes, all income is taxed at 22%",
      "Only the first $10,000 is taxed at 22%",
      "It depends on your state",
      "No, only income above a certain threshold is taxed at 22%"
    ],
    correctIndex: 3,
    explanation: "Tax brackets are marginal, not flat. If you're in the 22% bracket, only the income that falls within that bracket range is taxed at 22%. Lower portions of your income are taxed at lower rates (10%, 12%, etc.)."
  },
  {
    question: "What is a tax deduction?",
    options: [
      "An amount that reduces your taxable income",
      "Money the government pays you",
      "A penalty for late payment",
      "The same as a tax credit"
    ],
    correctIndex: 0,
    explanation: "A tax deduction reduces your taxable income. For example, if you earn $50,000 and have $10,000 in deductions, you're only taxed on $40,000. Deductions include things like student loan interest, mortgage interest, and charitable donations."
  },
  {
    question: "What is the difference between a tax deduction and a tax credit?",
    options: [
      "There is no difference",
      "Deductions reduce taxable income; credits reduce tax owed dollar-for-dollar",
      "Credits are only for businesses",
      "Deductions are better than credits"
    ],
    correctIndex: 1,
    explanation: "Tax deductions reduce the amount of income that's subject to tax, while tax credits directly reduce the amount of tax you owe. A $1,000 credit saves you $1,000 in taxes, but a $1,000 deduction saves you only your tax rate × $1,000 (e.g., 22% × $1,000 = $220)."
  },
  {
    question: "Which of the following is an example of a tax exemption?",
    options: [
      "Paying less sales tax",
      "Getting a refund",
      "Not having to pay tax on income below the standard deduction",
      "Paying taxes quarterly"
    ],
    correctIndex: 2,
    explanation: "A tax exemption excludes certain income from taxation. The standard deduction is a common exemption that allows you to earn a certain amount ($13,850 for single filers in 2023) before any income tax is owed on that amount."
  },
  {
    question: "What is FICA tax used for?",
    options: [
      "Building roads and bridges",
      "Funding Social Security and Medicare",
      "Military spending",
      "Public education"
    ],
    correctIndex: 1,
    explanation: "FICA (Federal Insurance Contributions Act) tax is 7.65% of your paycheck: 6.2% for Social Security and 1.45% for Medicare. Your employer matches this amount. These funds support retirement benefits and healthcare for seniors."
  },
  {
    question: "If you earn $60,000 and your effective tax rate is 12%, how much federal income tax do you owe?",
    options: [
      "$6,000",
      "$13,200",
      "$22,000",
      "$7,200"
    ],
    correctIndex: 3,
    explanation: "Effective tax rate is the average rate you pay on your total income. With a 12% effective rate on $60,000: $60,000 × 0.12 = $7,200. This is different from your marginal rate (your tax bracket), which only applies to your last dollar earned."
  },
  {
    question: "Which strategy can legally reduce your tax burden?",
    options: [
      "Contributing to a 401(k) retirement account",
      "Not reporting cash income",
      "Claiming fake dependents",
      "Hiding income in foreign accounts"
    ],
    correctIndex: 0,
    explanation: "Contributing to traditional 401(k) or IRA accounts is a legal way to reduce taxable income. These contributions are made with pre-tax dollars, lowering your current year's taxable income. Other legal strategies include HSA contributions, education credits, and charitable donations."
  }
];

// Educational Content Data
const taxPurposeData = [
  {
    name: 'Infrastructure',
    description: 'Roads, bridges, public transit',
    icon: '🛣️',
    details: 'Federal and state taxes fund the construction and maintenance of highways, bridges, tunnels, and public transportation systems that keep our economy moving.',
    percentage: '~10%'
  },
  {
    name: 'National Defense',
    description: 'Military and security',
    icon: '🛡️',
    details: 'About 15% of federal spending goes to defense: military personnel salaries, equipment, veterans benefits, and national security operations.',
    percentage: '~15%'
  },
  {
    name: 'Social Security',
    description: 'Retirement benefits',
    icon: '👴',
    details: 'The largest federal program (~23% of budget). Your FICA taxes fund retirement benefits, disability insurance, and survivor benefits for millions of Americans.',
    percentage: '~23%'
  },
  {
    name: 'Healthcare',
    description: 'Medicare, Medicaid, subsidies',
    icon: '⚕️',
    details: 'Medicare for seniors (65+), Medicaid for low-income families, CHIP for children, and ACA subsidies. Accounts for ~25% of federal spending.',
    percentage: '~25%'
  },
  {
    name: 'Education',
    description: 'Public schools, grants, loans',
    icon: '🎓',
    details: 'K-12 education (mostly state/local taxes), federal student aid (Pell Grants), research funding for universities, and special education programs.',
    percentage: '~3%'
  },
  {
    name: 'Safety Net Programs',
    description: 'SNAP, unemployment, housing',
    icon: '🏠',
    details: 'Food assistance (SNAP), unemployment insurance, housing vouchers, and temporary assistance for families in need (TANF). About 9% of federal budget.',
    percentage: '~9%'
  }
];

const taxTypesData = [
  {
    title: 'Federal Income Tax',
    icon: '📊',
    color: 'from-blue-50 to-blue-100',
    borderColor: 'border-blue-400',
    description: 'Progressive tax on your earnings (wages, investments, business income)',
    details: 'Brackets range from 10% to 37%. You pay different rates on different portions of your income. Most workers have this automatically withheld from paychecks.',
    example: 'Someone earning $50,000 pays 10% on first $11,000, then 12% on next $33,725, then 22% on the remainder.'
  },
  {
    title: 'State Income Tax',
    icon: '🏛️',
    color: 'from-purple-50 to-purple-100',
    borderColor: 'border-purple-400',
    description: 'State-level tax on income (varies by state)',
    details: '9 states have no income tax (FL, TX, WA, NV, etc.). Others range from ~3% to ~13% (California highest). Some cities also charge local income tax.',
    example: 'California: 1%-13.3% progressive. Texas: 0%. New York: 4%-10.9% progressive.'
  },
  {
    title: 'FICA Tax',
    icon: '💼',
    color: 'from-green-50 to-green-100',
    borderColor: 'border-green-400',
    description: 'Social Security (6.2%) + Medicare (1.45%) = 7.65%',
    details: 'Automatically withheld from paychecks. Your employer matches your contribution. Self-employed pay both portions (15.3%). Social Security tax capped at $160,200 income (2023).',
    example: 'On a $60,000 salary, you pay $4,590 in FICA tax ($3,720 Social Security + $870 Medicare).'
  },
  {
    title: 'Sales Tax',
    icon: '🛒',
    color: 'from-amber-50 to-amber-100',
    borderColor: 'border-amber-400',
    description: 'Tax on purchases of goods/services',
    details: 'State and local tax, typically 4%-10% combined. Five states have no sales tax (OR, NH, MT, DE, AK). Essentials like groceries often exempt.',
    example: 'In California (7.25% base + local), a $1,000 laptop costs $1,090+ total.'
  },
  {
    title: 'Property Tax',
    icon: '🏡',
    color: 'from-rose-50 to-rose-100',
    borderColor: 'border-rose-400',
    description: 'Annual tax on real estate you own',
    details: 'Set by local governments (county, city). Usually 0.5%-2.5% of property value annually. Funds local schools, police, fire departments, libraries.',
    example: 'A $300,000 home with 1.2% rate = $3,600/year in property tax ($300/month).'
  },
  {
    title: 'Capital Gains Tax',
    icon: '📈',
    color: 'from-indigo-50 to-indigo-100',
    borderColor: 'border-indigo-400',
    description: 'Tax on profits from selling investments',
    details: 'Short-term gains (<1 year held) = ordinary income rates. Long-term gains (>1 year) = 0%, 15%, or 20% depending on income. Encourages long-term investing.',
    example: 'Buy stock at $1,000, sell at $2,000 after 2 years = $1,000 gain taxed at 15% = $150 tax.'
  }
];

// Case Study Component
const CaseStudyPage = ({ handlePrev, handleNext }: { handlePrev: () => void; handleNext: () => void }) => {
  const [showAnswer, setShowAnswer] = useState(false);

  return (
    <div className="max-w-5xl mx-auto pt-16 px-6">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold text-gray-800 mb-3">📊 Tax Case Study</h2>
        <p className="text-gray-600 text-lg">Understanding tax calculations in a real-world scenario</p>
      </div>

      <div className="bg-white rounded-3xl shadow-xl border-2 border-blue-100 overflow-hidden mb-8">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white">
          <h3 className="text-2xl font-bold mb-4">Meet Sarah: Software Developer</h3>
          <div className="grid md:grid-cols-2 gap-6 text-blue-50">
            <div>
              <p className="mb-2"><strong className="text-white">Annual Salary:</strong> $75,000</p>
              <p className="mb-2"><strong className="text-white">Filing Status:</strong> Single</p>
              <p className="mb-2"><strong className="text-white">State:</strong> Texas (no state income tax)</p>
            </div>
            <div>
              <p className="mb-2"><strong className="text-white">401(k) Contribution:</strong> $6,000/year</p>
              <p className="mb-2"><strong className="text-white">Student Loan Interest:</strong> $1,200/year</p>
              <p className="mb-2"><strong className="text-white">Standard Deduction:</strong> $13,850</p>
            </div>
          </div>
        </div>

        <div className="p-8">
          <h4 className="text-xl font-bold text-gray-800 mb-6">Challenge: Calculate Sarah's Federal Income Tax</h4>

          <div className="bg-blue-50 rounded-2xl p-6 mb-6 border-2 border-blue-200">
            <p className="font-semibold text-gray-800 mb-4">Think through these steps:</p>
            <ol className="space-y-2 text-gray-700">
              <li className="flex gap-3"><span className="font-bold text-blue-600">1.</span> Calculate her taxable income after deductions</li>
              <li className="flex gap-3"><span className="font-bold text-blue-600">2.</span> Apply the 2023 federal tax brackets</li>
              <li className="flex gap-3"><span className="font-bold text-blue-600">3.</span> Don't forget about FICA taxes!</li>
              <li className="flex gap-3"><span className="font-bold text-blue-600">4.</span> Calculate her total tax burden and take-home pay</li>
            </ol>
          </div>

          <button
            onClick={() => setShowAnswer(!showAnswer)}
            className="w-full py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl font-bold text-lg hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg mb-6"
          >
            {showAnswer ? 'Hide Solution' : 'Show Solution'}
          </button>

          <AnimatePresence>
            {showAnswer && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-slate-900 text-white p-8 rounded-3xl space-y-6">
                  <div>
                    <h5 className="text-blue-400 font-bold uppercase text-sm mb-3">Step 1: Calculate Taxable Income</h5>
                    <div className="space-y-2 text-gray-300">
                      <p>Gross Income: <span className="text-white font-bold">$75,000</span></p>
                      <p>- 401(k) Contribution: <span className="text-red-400">-$6,000</span></p>
                      <p>- Student Loan Interest: <span className="text-red-400">-$1,200</span></p>
                      <p>= Adjusted Gross Income (AGI): <span className="text-white font-bold">$67,800</span></p>
                      <p>- Standard Deduction: <span className="text-red-400">-$13,850</span></p>
                      <p className="text-lg border-t border-gray-700 pt-2 mt-2">= Taxable Income: <span className="text-green-400 font-bold text-xl">$53,950</span></p>
                    </div>
                  </div>

                  <div>
                    <h5 className="text-blue-400 font-bold uppercase text-sm mb-3">Step 2: Apply Tax Brackets (2023, Single)</h5>
                    <div className="space-y-2 text-gray-300 text-sm">
                      <p>10% on first $11,000: <span className="text-white">$11,000 × 10% = $1,100</span></p>
                      <p>12% on $11,001-$44,725: <span className="text-white">$33,725 × 12% = $4,047</span></p>
                      <p>22% on $44,726-$53,950: <span className="text-white">$9,225 × 22% = $2,030</span></p>
                      <p className="text-lg border-t border-gray-700 pt-2 mt-2">Federal Income Tax: <span className="text-green-400 font-bold text-xl">$7,177</span></p>
                    </div>
                  </div>

                  <div>
                    <h5 className="text-blue-400 font-bold uppercase text-sm mb-3">Step 3: Add FICA Taxes</h5>
                    <div className="space-y-2 text-gray-300">
                      <p>Social Security (6.2%): <span className="text-white">$75,000 × 6.2% = $4,650</span></p>
                      <p>Medicare (1.45%): <span className="text-white">$75,000 × 1.45% = $1,088</span></p>
                      <p className="text-lg border-t border-gray-700 pt-2 mt-2">Total FICA: <span className="text-orange-400 font-bold">$5,738</span></p>
                    </div>
                  </div>

                  <div className="bg-white/10 rounded-xl p-6 backdrop-blur">
                    <h5 className="text-green-400 font-bold text-xl mb-4">Final Results</h5>
                    <div className="space-y-3 text-lg">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Gross Salary:</span>
                        <span className="text-white font-bold">$75,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Federal Income Tax:</span>
                        <span className="text-red-400">-$7,177</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">FICA Taxes:</span>
                        <span className="text-red-400">-$5,738</span>
                      </div>
                      <div className="flex justify-between border-t-2 border-white/20 pt-3">
                        <span className="text-green-400 font-bold">Take-Home Pay:</span>
                        <span className="text-green-400 font-bold text-2xl">$62,085</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Effective Tax Rate:</span>
                        <span className="text-yellow-400 font-semibold">17.2%</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-500/20 border-2 border-blue-400 rounded-xl p-4">
                    <p className="text-blue-300 text-sm">
                      <strong className="text-blue-200">💡 Key Insight:</strong> Even though Sarah is in the 22% tax bracket, her effective rate is only 17.2% because of progressive taxation and deductions. Her first dollars are taxed much less than her last dollars!
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
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
};

// Federal Tax Calculator Component
const TaxCalculator = ({ handlePrev, handleNext }: { handlePrev: () => void; handleNext: () => void }) => {
  const [income, setIncome] = useState<string>('75000');
  const [filingStatus, setFilingStatus] = useState<'single' | 'married'>('single');
  const [deductions, setDeductions] = useState<string>('');
  const [fourOhOneK, setFourOhOneK] = useState<string>('');

  // 2023 Federal Tax Brackets
  const taxBrackets = {
    single: [
      { limit: 11000, rate: 0.10 },
      { limit: 44725, rate: 0.12 },
      { limit: 95375, rate: 0.22 },
      { limit: 182100, rate: 0.24 },
      { limit: 231250, rate: 0.32 },
      { limit: 578125, rate: 0.35 },
      { limit: Infinity, rate: 0.37 }
    ],
    married: [
      { limit: 22000, rate: 0.10 },
      { limit: 89050, rate: 0.12 },
      { limit: 190750, rate: 0.22 },
      { limit: 364200, rate: 0.24 },
      { limit: 462500, rate: 0.32 },
      { limit: 693750, rate: 0.35 },
      { limit: Infinity, rate: 0.37 }
    ]
  };

  const standardDeduction = filingStatus === 'single' ? 13850 : 27700;

  const grossIncome = parseFloat(income) || 0;
  const k401Contribution = parseFloat(fourOhOneK) || 0;
  const additionalDeductions = parseFloat(deductions) || 0;

  const agi = Math.max(0, grossIncome - k401Contribution);
  const taxableIncome = Math.max(0, agi - standardDeduction - additionalDeductions);

  // Calculate federal income tax
  const calculateTax = () => {
    const brackets = taxBrackets[filingStatus];
    let tax = 0;
    let previousLimit = 0;

    for (const bracket of brackets) {
      if (taxableIncome <= previousLimit) break;

      const taxableInBracket = Math.min(taxableIncome, bracket.limit) - previousLimit;
      tax += taxableInBracket * bracket.rate;
      previousLimit = bracket.limit;

      if (taxableIncome <= bracket.limit) break;
    }

    return tax;
  };

  const federalTax = calculateTax();
  const socialSecurityTax = Math.min(grossIncome, 160200) * 0.062;
  const medicareTax = grossIncome * 0.0145;
  const ficaTax = socialSecurityTax + medicareTax;
  const totalTax = federalTax + ficaTax;
  const takeHomePay = grossIncome - totalTax;
  const effectiveRate = grossIncome > 0 ? (totalTax / grossIncome) * 100 : 0;

  // Find marginal bracket
  let marginalRate = 0;
  let previousLimit = 0;
  for (const bracket of taxBrackets[filingStatus]) {
    if (taxableIncome > previousLimit && taxableIncome <= bracket.limit) {
      marginalRate = bracket.rate * 100;
      break;
    }
    previousLimit = bracket.limit;
  }

  return (
    <div className="max-w-6xl mx-auto pt-16 px-6 pb-16">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold text-gray-800 mb-3 flex items-center justify-center gap-3">
          <Calculator className="text-blue-600" size={40} />
          Federal Tax Calculator
        </h2>
        <p className="text-gray-600 text-lg">Estimate your 2023 federal tax burden</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        {/* Input Section */}
        <div className="bg-white rounded-3xl shadow-xl border-2 border-blue-100 p-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">Your Information</h3>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Filing Status</label>
              <div className="flex gap-3">
                <button
                  onClick={() => setFilingStatus('single')}
                  className={`flex-1 py-3 rounded-xl font-semibold transition ${
                    filingStatus === 'single'
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Single
                </button>
                <button
                  onClick={() => setFilingStatus('married')}
                  className={`flex-1 py-3 rounded-xl font-semibold transition ${
                    filingStatus === 'married'
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Married Filing Jointly
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Annual Gross Income</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-xl">$</span>
                <input
                  type="number"
                  value={income}
                  onChange={(e) => setIncome(e.target.value)}
                  className="w-full pl-10 pr-4 py-4 text-2xl font-bold border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                  placeholder="75000"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">401(k) Contributions (Pre-tax)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  value={fourOhOneK}
                  onChange={(e) => setFourOhOneK(e.target.value)}
                  className="w-full pl-8 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                  placeholder="0"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Reduces your taxable income</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Additional Deductions</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  value={deductions}
                  onChange={(e) => setDeductions(e.target.value)}
                  className="w-full pl-8 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                  placeholder="0"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Student loan interest, HSA, etc.</p>
            </div>

            <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200">
              <p className="text-sm text-gray-700">
                <strong className="text-blue-900">Standard Deduction:</strong> ${standardDeduction.toLocaleString()}
                <span className="text-gray-600 ml-2">(automatically applied)</span>
              </p>
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl shadow-2xl p-8 text-white">
          <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Receipt size={28} />
            Tax Breakdown
          </h3>

          <div className="space-y-4 mb-8">
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Gross Income</span>
              <span className="text-2xl font-bold">${grossIncome.toLocaleString()}</span>
            </div>

            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400">- 401(k) Contribution</span>
              <span className="text-red-400">-${k401Contribution.toLocaleString()}</span>
            </div>

            <div className="flex justify-between items-center pb-3 border-b border-gray-700">
              <span className="text-gray-300">Adjusted Gross Income</span>
              <span className="text-xl font-semibold">${agi.toLocaleString()}</span>
            </div>

            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400">- Standard Deduction</span>
              <span className="text-red-400">-${standardDeduction.toLocaleString()}</span>
            </div>

            {additionalDeductions > 0 && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">- Additional Deductions</span>
                <span className="text-red-400">-${additionalDeductions.toLocaleString()}</span>
              </div>
            )}

            <div className="flex justify-between items-center pb-4 border-b-2 border-gray-600">
              <span className="text-green-400 font-semibold">Taxable Income</span>
              <span className="text-2xl font-bold text-green-400">${taxableIncome.toLocaleString()}</span>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Federal Income Tax</span>
                <span className="text-lg font-semibold text-orange-400">${federalTax.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-300">Social Security (6.2%)</span>
                <span className="text-lg font-semibold text-orange-400">${socialSecurityTax.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-300">Medicare (1.45%)</span>
                <span className="text-lg font-semibold text-orange-400">${medicareTax.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
              </div>

              <div className="flex justify-between items-center pt-3 border-t-2 border-gray-600">
                <span className="text-red-300 font-bold">Total Tax</span>
                <span className="text-2xl font-bold text-red-400">${totalTax.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 mb-6">
            <div className="text-center">
              <p className="text-green-100 text-sm mb-2">Annual Take-Home Pay</p>
              <p className="text-5xl font-black">${takeHomePay.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
              <p className="text-green-100 text-lg mt-2">${(takeHomePay / 12).toLocaleString(undefined, { maximumFractionDigits: 0 })}/month</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur">
              <p className="text-gray-300 text-xs mb-1">Effective Tax Rate</p>
              <p className="text-2xl font-bold text-yellow-400">{effectiveRate.toFixed(1)}%</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur">
              <p className="text-gray-300 text-xs mb-1">Marginal Tax Rate</p>
              <p className="text-2xl font-bold text-purple-400">{marginalRate}%</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-6 mb-8">
        <div className="flex items-start gap-4">
          <AlertCircle className="text-amber-600 flex-shrink-0 mt-1" size={24} />
          <div>
            <h4 className="font-bold text-amber-900 mb-2">Understanding Your Results</h4>
            <ul className="space-y-2 text-sm text-amber-800">
              <li><strong>Effective Rate:</strong> Average tax rate on your total income</li>
              <li><strong>Marginal Rate:</strong> Tax rate on your last dollar earned (your tax bracket)</li>
              <li><strong>Take-Home:</strong> This calculator shows federal taxes only. State/local taxes will further reduce take-home pay in most states.</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="flex justify-center gap-4">
        <button onClick={handlePrev} className="px-8 py-4 rounded-2xl border-2 border-blue-400 bg-white text-blue-600 font-semibold text-lg shadow-lg hover:bg-blue-50">
          ← Back
        </button>
        <button onClick={handleNext} className="px-8 py-4 rounded-2xl bg-blue-500 text-white font-semibold text-lg shadow-lg hover:bg-blue-600">
          Next →
        </button>
      </div>
    </div>
  );
};

// Quiz Component
const QuizPage = ({
  currentStep,
  showAnswerResult,
  currentQuestion,
  selectedAnswer,
  score,
  handleAnswerSelect,
  handleNextQuestion,
  resetQuiz,
  navigate,
  handlePrev,
  quizCompleted
}: any) => (
  <div className="max-w-4xl mx-auto pt-16 px-6">
    {!quizCompleted ? (
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden flex flex-col min-h-[500px]">
        <div className="flex-1 p-8 lg:p-16 flex flex-col justify-center">
          <div className="flex justify-between items-end mb-8 border-b border-gray-100 pb-6">
            <div>
              <span className="text-sm font-bold text-blue-600 uppercase tracking-wider block mb-2">
                Question {currentQuestion + 1} of {quizQuestions.length}
              </span>
              <h2 className="text-2xl lg:text-4xl font-bold text-slate-900 leading-tight">
                {quizQuestions[currentQuestion].question}
              </h2>
            </div>
            <div className="hidden lg:block text-slate-300">
              <span className="text-5xl">💰</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quizQuestions[currentQuestion].options.map((option, idx) => {
              const isSelected = selectedAnswer === idx;
              const isCorrect = idx === quizQuestions[currentQuestion].correctIndex;
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
                  {quizQuestions[currentQuestion].explanation}
                </p>
              </div>
              <button
                onClick={handleNextQuestion}
                className="w-full md:w-auto px-8 py-4 bg-white text-slate-900 rounded-xl font-bold hover:bg-blue-50 transition-colors whitespace-nowrap"
              >
                {currentQuestion < quizQuestions.length - 1 ? 'Next Question' : 'Complete Quiz'}
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
          You scored <span className="font-bold text-slate-900">{score}/{quizQuestions.length}</span> (
          {((score / quizQuestions.length) * 100).toFixed(0)}%)
        </p>

        {score >= 8 ? (
          <div className="bg-green-50 border-2 border-green-500 rounded-2xl p-8 mb-10">
            <p className="text-green-800 font-bold text-xl mb-2">🎊 Congratulations! You passed!</p>
            <p className="text-green-700 text-lg">You've mastered the Tax Basics module</p>
          </div>
        ) : (
          <div className="bg-amber-50 border-2 border-amber-500 rounded-2xl p-8 mb-10">
            <p className="text-amber-800 font-bold text-xl mb-2">You need 80% to pass (8/10 correct)</p>
            <p className="text-amber-700 text-lg">Review the material and try again - you&apos;re getting there!</p>
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
            Back to Learning Path
          </button>
        </div>
      </motion.div>
    )}
  </div>
);

// Main Component
const TaxBasics = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isReviewMode, setIsReviewMode] = useState(false);
  const { saveScore, isModulePassed, refreshProgress } = useModuleScore();

  // Quiz state
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showAnswerResult, setShowAnswerResult] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [answers, setAnswers] = useState<number[]>([]);

  const modulePassed = isModulePassed(MODULES.TAX_BASICS.id);
  const totalSteps = 8; // 0: intro, 1: why taxes, 2: tax types, 3: brackets, 4: case study, 5: calculator, 6: savings tips, 7: quiz

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

  const handleAnswerSelect = (index: number) => {
    if (showAnswerResult) return;
    setSelectedAnswer(index);
    setShowAnswerResult(true);
  };

  const handleNextQuestion = async () => {
    const newAnswers = [...answers, selectedAnswer as number];
    setAnswers(newAnswers);

    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowAnswerResult(false);
    } else {
      let finalScore = 0;
      newAnswers.forEach((answer, idx) => {
        if (answer === quizQuestions[idx].correctIndex) {
          finalScore++;
        }
      });
      setScore(finalScore);
      setQuizCompleted(true);

      const percentage = (finalScore / quizQuestions.length) * 100;
      console.log('Tax Basics Quiz - Score:', finalScore, '/', quizQuestions.length, '=', percentage.toFixed(1) + '%');

      if (percentage >= 80) {
        try {
          console.log('Saving score to Firebase:', MODULES.TAX_BASICS.id, percentage);
          const result = await saveScore(MODULES.TAX_BASICS.id, percentage);
          console.log('Score saved successfully:', result);
          // Refresh progress to ensure the UI updates
          await refreshProgress();
          console.log('Progress refreshed');
        } catch (error) {
          console.error('Error saving score:', error);
        }
      }
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setScore(0);
    setShowAnswerResult(false);
    setQuizCompleted(false);
    setAnswers([]);
  };

  if (modulePassed && !isReviewMode) {
    return (
      <ModuleCompletedScreen
        emoji="💰"
        moduleName="Tax Basics"
        description="You've already passed the Tax Basics module. Great job understanding how taxes work!"
        gradientClasses="from-blue-50 via-indigo-100 to-purple-200"
        onReviewClick={() => setIsReviewMode(true)}
      />
    );
  }

  return (
    <div className="min-h-screen relative overflow-x-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Fixed Navigation */}
      <button
        className="absolute top-4 left-4 px-4 py-2 rounded-lg text-blue-600 hover:bg-white/50 backdrop-blur-sm font-medium transition z-50 shadow-sm border border-blue-100"
        onClick={() => navigate('/game')}
      >
        ← Back to Learning Path
      </button>

      {/* Step Counter */}
      <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-50">
        <div className="bg-white/80 backdrop-blur-md px-4 py-1.5 rounded-full shadow-sm border border-gray-100 text-gray-600 font-semibold text-sm">
          Step {currentStep + 1} of {totalSteps + 1}
        </div>
      </div>

      {/* Side Navigation */}
      {currentStep > 0 && (
        <button
          onClick={handlePrev}
          className="fixed left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition flex items-center justify-center z-40"
        >
          ←
        </button>
      )}
      {currentStep < totalSteps && (
        <button
          onClick={handleNext}
          className="fixed right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition flex items-center justify-center z-40"
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
          className="w-full pb-12"
        >
          {/* Step 0: Introduction */}
          {currentStep === 0 && (
            <div className="max-w-5xl mx-auto pt-20 px-6">
              <motion.div className="text-center mb-12" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-5xl font-bold mb-4 text-gray-800">Understanding Taxes</h1>
                <p className="text-xl text-gray-600">Why we pay them, how they work, and how to save money legally</p>
              </motion.div>

              <div className="space-y-6">
                <motion.div className="p-8 rounded-3xl shadow-xl bg-white" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-blue-500 flex items-center justify-center shadow-lg flex-shrink-0">
                      <BookOpen className="text-white" size={32} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800 mb-3">What You'll Learn</h3>
                      <ul className="space-y-2 text-gray-700 text-lg">
                        <li className="flex items-start gap-3">
                          <span className="text-green-600 font-bold text-2xl">✓</span>
                          <span>Why taxes exist and what they fund</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="text-green-600 font-bold text-2xl">✓</span>
                          <span>Different types of taxes (income, sales, property, FICA)</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="text-green-600 font-bold text-2xl">✓</span>
                          <span>How tax brackets work (progressive taxation)</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="text-green-600 font-bold text-2xl">✓</span>
                          <span>Tax deductions, credits, and exemptions</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="text-green-600 font-bold text-2xl">✓</span>
                          <span>Legal ways to reduce your tax burden</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </motion.div>

                <motion.div className="p-8 rounded-3xl shadow-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
                  <h3 className="text-2xl font-bold mb-4">Why This Matters</h3>
                  <p className="text-blue-100 text-lg leading-relaxed">
                    Taxes are one of your biggest lifetime expenses. The average American pays over <strong className="text-white">$500,000</strong> in taxes throughout their life. Understanding how taxes work helps you make smarter financial decisions, maximize deductions, and keep more of your hard-earned money.
                  </p>
                </motion.div>
              </div>

              <div className="flex justify-center mt-12">
                <button onClick={handleNext} className="px-10 py-4 rounded-2xl bg-blue-500 text-white font-bold text-lg shadow-xl hover:bg-blue-600 transition">
                  Let's Get Started →
                </button>
              </div>
            </div>
          )}

          {/* Step 1: Why We Pay Taxes */}
          {currentStep === 1 && (
            <div className="max-w-6xl mx-auto pt-20 px-6">
              <h2 className="text-4xl font-bold text-center text-gray-800 mb-8">Why Do We Pay Taxes?</h2>
              <p className="text-center text-gray-600 mb-12 text-lg max-w-2xl mx-auto">
                Taxes fund the government services and infrastructure that keep our society running
              </p>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {taxPurposeData.map((item, idx) => (
                  <motion.div
                    key={idx}
                    className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition border-2 border-blue-100"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <div className="text-5xl mb-4">{item.icon}</div>
                    <h4 className="text-xl font-bold text-gray-800 mb-2">{item.name}</h4>
                    <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                    <p className="text-xs text-gray-700 leading-relaxed mb-3">{item.details}</p>
                    <div className="bg-blue-50 rounded-lg px-3 py-1 inline-block">
                      <span className="text-blue-800 font-semibold text-sm">{item.percentage} of budget</span>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-8 text-white mb-8">
                <h3 className="text-2xl font-bold mb-4 flex items-center gap-3">
                  <DollarSign size={32} />
                  Where Does the Money Go?
                </h3>
                <p className="text-green-50 text-lg leading-relaxed mb-4">
                  In 2023, the federal government collected approximately <strong>$4.9 trillion</strong> in taxes. Social Security, Medicare, and defense make up over 60% of federal spending. The rest funds everything from education to environmental protection to scientific research.
                </p>
                <p className="text-green-100">
                  Without taxes, there would be no public schools, no police or fire departments, no national parks, no federal highways, and no safety net for the elderly or disabled.
                </p>
              </div>

              <div className="flex justify-center gap-4">
                <button onClick={handlePrev} className="px-8 py-4 rounded-2xl border-2 border-blue-400 bg-white text-blue-600 font-semibold text-lg shadow-lg hover:bg-blue-50">
                  ← Back
                </button>
                <button onClick={handleNext} className="px-8 py-4 rounded-2xl bg-blue-500 text-white font-semibold text-lg shadow-lg hover:bg-blue-600">
                  Next →
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Types of Taxes */}
          {currentStep === 2 && (
            <div className="max-w-6xl mx-auto pt-20 px-6">
              <h2 className="text-4xl font-bold text-center text-gray-800 mb-8">Types of Taxes</h2>
              <p className="text-center text-gray-600 mb-12 text-lg max-w-2xl mx-auto">
                Americans pay multiple types of taxes at federal, state, and local levels
              </p>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                {taxTypesData.map((item, idx) => (
                  <motion.div
                    key={idx}
                    className={`bg-gradient-to-br ${item.color} p-6 rounded-2xl border-2 ${item.borderColor} shadow-lg`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div className="text-4xl">{item.icon}</div>
                      <div>
                        <h4 className="text-xl font-bold text-gray-800 mb-1">{item.title}</h4>
                        <p className="text-sm text-gray-700 font-medium">{item.description}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed mb-3">{item.details}</p>
                    <div className="bg-white/60 rounded-xl p-3 border border-gray-200">
                      <p className="text-xs font-semibold text-gray-800 mb-1">Example:</p>
                      <p className="text-xs text-gray-700">{item.example}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="flex justify-center gap-4">
                <button onClick={handlePrev} className="px-8 py-4 rounded-2xl border-2 border-blue-400 bg-white text-blue-600 font-semibold text-lg shadow-lg hover:bg-blue-50">
                  ← Back
                </button>
                <button onClick={handleNext} className="px-8 py-4 rounded-2xl bg-blue-500 text-white font-semibold text-lg shadow-lg hover:bg-blue-600">
                  Next →
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Tax Brackets Explanation */}
          {currentStep === 3 && (
            <div className="max-w-5xl mx-auto pt-20 px-6">
              <h2 className="text-4xl font-bold text-center text-gray-800 mb-8">Understanding Tax Brackets</h2>
              <p className="text-center text-gray-600 mb-12 text-lg max-w-2xl mx-auto">
                The U.S. uses a progressive tax system - your income is taxed in layers, not all at once
              </p>

              <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8 border-2 border-blue-100">
                <h3 className="text-2xl font-bold text-gray-800 mb-6">2023 Federal Tax Brackets (Single Filers)</h3>
                <div className="space-y-3">
                  {[
                    { bracket: '10%', range: '$0 - $11,000', amount: 'First $11,000' },
                    { bracket: '12%', range: '$11,001 - $44,725', amount: 'Next $33,725' },
                    { bracket: '22%', range: '$44,726 - $95,375', amount: 'Next $50,650' },
                    { bracket: '24%', range: '$95,376 - $182,100', amount: 'Next $86,725' },
                    { bracket: '32%', range: '$182,101 - $231,250', amount: 'Next $49,150' },
                    { bracket: '35%', range: '$231,251 - $578,125', amount: 'Next $346,875' },
                    { bracket: '37%', range: '$578,126+', amount: 'Everything above' }
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold text-xl shadow-lg">
                          {item.bracket}
                        </div>
                        <div>
                          <p className="font-bold text-gray-800">{item.range}</p>
                          <p className="text-sm text-gray-600">{item.amount}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl p-8 text-white mb-8">
                <h3 className="text-2xl font-bold mb-4 flex items-center gap-3">
                  <Scale size={32} />
                  How It Actually Works
                </h3>
                <p className="text-purple-100 text-lg mb-6 leading-relaxed">
                  Let&apos;s say you earn $60,000. You do not pay 22% on all $60,000. Instead:
                </p>
                <div className="space-y-3 bg-white/10 rounded-xl p-6 backdrop-blur">
                  <div className="flex justify-between text-lg">
                    <span>First $11,000 × 10%</span>
                    <span className="font-bold">= $1,100</span>
                  </div>
                  <div className="flex justify-between text-lg">
                    <span>Next $33,725 × 12%</span>
                    <span className="font-bold">= $4,047</span>
                  </div>
                  <div className="flex justify-between text-lg">
                    <span>Remaining $15,275 × 22%</span>
                    <span className="font-bold">= $3,361</span>
                  </div>
                  <div className="flex justify-between text-xl border-t-2 border-white/30 pt-3 mt-3">
                    <span className="font-bold">Total Federal Tax:</span>
                    <span className="font-bold text-2xl">$8,508</span>
                  </div>
                  <div className="text-center text-purple-200 text-sm mt-4">
                    Effective Rate: 14.2% (not 22%!)
                  </div>
                </div>
              </div>

              <div className="flex justify-center gap-4">
                <button onClick={handlePrev} className="px-8 py-4 rounded-2xl border-2 border-blue-400 bg-white text-blue-600 font-semibold text-lg shadow-lg hover:bg-blue-50">
                  ← Back
                </button>
                <button onClick={handleNext} className="px-8 py-4 rounded-2xl bg-blue-500 text-white font-semibold text-lg shadow-lg hover:bg-blue-600">
                  Next →
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Case Study */}
          {currentStep === 4 && <CaseStudyPage handlePrev={handlePrev} handleNext={handleNext} />}

          {/* Step 5: Tax Calculator */}
          {currentStep === 5 && <TaxCalculator handlePrev={handlePrev} handleNext={handleNext} />}

          {/* Step 6: Ways to Save on Taxes */}
          {currentStep === 6 && (
            <div className="max-w-6xl mx-auto pt-20 px-6">
              <h2 className="text-4xl font-bold text-center text-gray-800 mb-8">💡 Legal Ways to Reduce Your Tax Burden</h2>
              <p className="text-center text-gray-600 mb-12 text-lg max-w-2xl mx-auto">
                Smart strategies to keep more of your hard-earned money
              </p>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                {[
                  {
                    icon: '🏦',
                    title: 'Max Out Retirement Accounts',
                    desc: 'Traditional 401(k) and IRA contributions are pre-tax, reducing your taxable income.',
                    example: 'Contributing $6,500 to an IRA at 22% bracket = $1,430 tax savings',
                    color: 'from-blue-50 to-blue-100'
                  },
                  {
                    icon: '🏥',
                    title: 'Health Savings Account (HSA)',
                    desc: 'Triple tax advantage: deductible contributions, tax-free growth, tax-free withdrawals for medical expenses.',
                    example: '$3,850 family contribution = $847 tax savings at 22% bracket',
                    color: 'from-green-50 to-green-100'
                  },
                  {
                    icon: '🎓',
                    title: 'Education Tax Credits',
                    desc: 'American Opportunity Credit ($2,500) and Lifetime Learning Credit ($2,000) for tuition expenses.',
                    example: 'AOTC can reduce tax bill by up to $2,500 for college students',
                    color: 'from-purple-50 to-purple-100'
                  },
                  {
                    icon: '🏠',
                    title: 'Mortgage Interest Deduction',
                    desc: 'Deduct interest paid on mortgages up to $750,000 (if you itemize).',
                    example: '$15,000 in interest at 24% bracket = $3,600 tax savings',
                    color: 'from-amber-50 to-amber-100'
                  },
                  {
                    icon: '❤️',
                    title: 'Charitable Donations',
                    desc: 'Donations to qualified charities are tax-deductible (if you itemize).',
                    example: '$5,000 donated at 24% bracket = $1,200 tax savings',
                    color: 'from-rose-50 to-rose-100'
                  },
                  {
                    icon: '💼',
                    title: 'Business Expenses (Self-Employed)',
                    desc: 'Home office, equipment, travel, and other business costs are deductible.',
                    example: '$10,000 in business expenses = $2,200 saved at 22% bracket',
                    color: 'from-indigo-50 to-indigo-100'
                  },
                  {
                    icon: '👶',
                    title: 'Child Tax Credit',
                    desc: '$2,000 credit per child under 17. Directly reduces tax owed, not just taxable income.',
                    example: '2 children = $4,000 off your tax bill',
                    color: 'from-pink-50 to-pink-100'
                  },
                  {
                    icon: '📚',
                    title: 'Student Loan Interest Deduction',
                    desc: 'Deduct up to $2,500 of student loan interest paid, even if you do not itemize.',
                    example: '$2,500 deduction at 22% bracket = $550 tax savings',
                    color: 'from-teal-50 to-teal-100'
                  },
                  {
                    icon: '⚡',
                    title: 'Energy-Efficient Home Improvements',
                    desc: 'Credits for solar panels, heat pumps, insulation, and electric vehicles.',
                    example: 'Solar installation can get you 30% federal tax credit',
                    color: 'from-cyan-50 to-cyan-100'
                  }
                ].map((item, idx) => (
                  <motion.div
                    key={idx}
                    className={`bg-gradient-to-br ${item.color} p-6 rounded-2xl shadow-lg border-2 border-white/50 hover:shadow-xl transition`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <div className="flex items-start gap-4 mb-3">
                      <div className="text-4xl">{item.icon}</div>
                      <div className="flex-1">
                        <h4 className="text-xl font-bold text-gray-800 mb-2">{item.title}</h4>
                        <p className="text-sm text-gray-700 leading-relaxed mb-3">{item.desc}</p>
                        <div className="bg-white/60 rounded-lg p-3 border border-gray-200">
                          <p className="text-xs font-semibold text-gray-800 mb-1">Example:</p>
                          <p className="text-xs text-gray-700">{item.example}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-6 mb-8">
                <div className="flex items-start gap-4">
                  <AlertCircle className="text-red-600 flex-shrink-0 mt-1" size={28} />
                  <div>
                    <h4 className="font-bold text-red-900 mb-2 text-lg">⚠️ Important Reminder</h4>
                    <p className="text-red-800 leading-relaxed">
                      These are <strong>legal</strong> tax reduction strategies. Tax evasion (hiding income, false deductions) is illegal and can result in fines, penalties, and even jail time. Always consult a tax professional for personalized advice.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-center gap-4">
                <button onClick={handlePrev} className="px-8 py-4 rounded-2xl border-2 border-blue-400 bg-white text-blue-600 font-semibold text-lg shadow-lg hover:bg-blue-50">
                  ← Back
                </button>
                <button onClick={handleNext} className="px-8 py-4 rounded-2xl bg-blue-500 text-white font-semibold text-lg shadow-lg hover:bg-blue-600">
                  Next →
                </button>
              </div>
            </div>
          )}

          {/* Step 7: Quiz */}
          {currentStep === 7 && (
            <QuizPage
              currentStep={currentStep}
              showAnswerResult={showAnswerResult}
              currentQuestion={currentQuestion}
              selectedAnswer={selectedAnswer}
              score={score}
              handleAnswerSelect={handleAnswerSelect}
              handleNextQuestion={handleNextQuestion}
              resetQuiz={resetQuiz}
              navigate={navigate}
              handlePrev={handlePrev}
              quizCompleted={quizCompleted}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default TaxBasics;
