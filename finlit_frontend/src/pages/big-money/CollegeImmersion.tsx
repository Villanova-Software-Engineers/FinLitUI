import React, { useState } from 'react';
import { ImmersionLayout } from './ImmersionLayout';
import { GraduationCap, TrendingUp, AlertTriangle, CheckCircle, Download, Save, Sparkles, BookOpen, DollarSign, Shield, Zap } from 'lucide-react';

const CollegeImmersion = () => {
    const [step, setStep] = useState(1);
    const totalSteps = 5;

    const next = () => setStep(s => Math.min(s + 1, totalSteps));
    const back = () => setStep(s => Math.max(s - 1, 1));

    // Calculator State
    const [calculatorMode, setCalculatorMode] = useState<'basic' | 'advanced'>('basic');
    const [loanAmount, setLoanAmount] = useState(30000);
    const [interestRate, setInterestRate] = useState(5.5);
    const [loanTerm, setLoanTerm] = useState(10);

    // Advanced mode
    const [expectedSalary, setExpectedSalary] = useState(55000);
    const [gracePeriodMonths, setGracePeriodMonths] = useState(6);

    // Calculations
    const monthlyRate = interestRate / 100 / 12;
    const numberOfPayments = loanTerm * 12;

    const monthlyPayment = loanAmount > 0
        ? (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
          (Math.pow(1 + monthlyRate, numberOfPayments) - 1)
        : 0;

    const totalRepayment = monthlyPayment * numberOfPayments;
    const totalInterest = totalRepayment - loanAmount;

    // Advanced calculations
    const salaryPercentage = (monthlyPayment * 12 / expectedSalary) * 100;
    const monthlyNetIncome = (expectedSalary / 12) * 0.75; // Estimate 25% taxes
    const percentageOfTakeHome = (monthlyPayment / monthlyNetIncome) * 100;

    // Save/Export Functions
    const handleSaveData = () => {
        const data = {
            loanAmount,
            interestRate,
            loanTerm,
            monthlyPayment: Math.round(monthlyPayment),
            totalInterest: Math.round(totalInterest),
            expectedSalary,
            date: new Date().toLocaleDateString()
        };
        localStorage.setItem('collegeLoanCalculation', JSON.stringify(data));
        alert('✅ Calculation saved!');
    };

    const handleExportData = () => {
        const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Student Loan Analysis</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 40px; color: #1e293b; }
        h1 { color: #4f46e5; margin-bottom: 10px; }
        .date { color: #64748b; margin-bottom: 30px; }
        .section { margin-bottom: 30px; padding: 20px; background: #f8fafc; border-radius: 12px; border-left: 4px solid #4f46e5; }
        .section h2 { color: #334155; margin-top: 0; font-size: 18px; }
        .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0; }
        .row:last-child { border-bottom: none; }
        .label { color: #64748b; font-weight: 500; }
        .value { color: #0f172a; font-weight: 600; }
        .highlight { background: #4f46e5; color: white; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0; }
        .highlight .big { font-size: 32px; font-weight: 800; }
        .warning { background: #fef3c7; border-left-color: #f59e0b; }
    </style>
</head>
<body>
    <h1>🎓 Student Loan Analysis</h1>
    <p class="date">Generated on ${new Date().toLocaleDateString()}</p>

    <div class="section">
        <h2>Loan Details</h2>
        <div class="row"><span class="label">Total Loan Amount</span><span class="value">$${loanAmount.toLocaleString()}</span></div>
        <div class="row"><span class="label">Interest Rate</span><span class="value">${interestRate}%</span></div>
        <div class="row"><span class="label">Loan Term</span><span class="value">${loanTerm} years</span></div>
    </div>

    <div class="highlight">
        <div style="font-size: 14px; margin-bottom: 8px;">Monthly Payment</div>
        <div class="big">$${Math.round(monthlyPayment).toLocaleString()}</div>
    </div>

    <div class="section">
        <h2>Repayment Analysis</h2>
        <div class="row"><span class="label">Total Amount Repaid</span><span class="value">$${Math.round(totalRepayment).toLocaleString()}</span></div>
        <div class="row"><span class="label">Total Interest Paid</span><span class="value" style="color: #dc2626;">$${Math.round(totalInterest).toLocaleString()}</span></div>
        <div class="row"><span class="label">Interest as % of Principal</span><span class="value">${((totalInterest / loanAmount) * 100).toFixed(1)}%</span></div>
    </div>

    ${calculatorMode === 'advanced' ? `
    <div class="section">
        <h2>Salary Impact Analysis</h2>
        <div class="row"><span class="label">Expected Starting Salary</span><span class="value">$${expectedSalary.toLocaleString()}</span></div>
        <div class="row"><span class="label">Annual Loan Payment</span><span class="value">$${Math.round(monthlyPayment * 12).toLocaleString()}</span></div>
        <div class="row"><span class="label">% of Gross Salary</span><span class="value">${salaryPercentage.toFixed(1)}%</span></div>
        <div class="row"><span class="label">% of Take-Home Pay</span><span class="value" style="${percentageOfTakeHome > 15 ? 'color: #dc2626;' : ''}">${percentageOfTakeHome.toFixed(1)}%</span></div>
    </div>
    ` : ''}

    ${loanAmount > expectedSalary && calculatorMode === 'advanced' ? `
    <div class="section warning">
        <h2>⚠️ Warning</h2>
        <p style="margin: 0;">Your total student loan debt ($${loanAmount.toLocaleString()}) exceeds your expected starting salary ($${expectedSalary.toLocaleString()}). This may make repayment challenging and limit your financial flexibility.</p>
    </div>
    ` : ''}

    <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #e2e8f0; text-align: center; color: #94a3b8; font-size: 12px;">
        Generated by FinLit - Financial Literacy Platform
    </div>
</body>
</html>`;

        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `college-loan-analysis-${Date.now()}.html`;
        link.click();

        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(htmlContent);
            printWindow.document.close();
            setTimeout(() => printWindow.print(), 250);
        }

        URL.revokeObjectURL(url);
    };

    return (
        <ImmersionLayout
            title="Going to College"
            subtitle="Invest in yourself wisely"
            currentStep={step}
            totalSteps={totalSteps}
            onNext={next}
            onBack={back}
            colorTheme="purple"
        >
            {/* STEP 1: ROI THINKING */}
            {step === 1 && (
                <div className="space-y-8 animate-in fade-in duration-500">
                    <div className="text-center max-w-2xl mx-auto mb-12">
                        <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">College is an Investment</h2>
                        <p className="text-lg text-slate-600">
                            Treat it like one - calculate returns, not just dreams
                        </p>
                    </div>

                    <div className="bg-white p-8 rounded-2xl shadow-xl border-2 border-indigo-100 mb-8">
                        <h3 className="text-2xl font-bold text-slate-900 mb-6">The "Starting Salary" Rule</h3>
                        <div className="grid md:grid-cols-2 gap-8 items-center">
                            <div className="space-y-4">
                                <p className="text-slate-700 text-lg leading-relaxed">
                                    A safe rule of thumb: <strong className="text-indigo-600 text-xl">Your total student loans should never exceed your expected first-year salary.</strong>
                                </p>
                                <p className="text-slate-600 leading-relaxed">
                                    Why? Because if your debt is higher than your income, you'll spend 15-20%+ of your paycheck on loan payments for the next decade. That means delaying: buying a home, starting a family, retirement savings, and living comfortably.
                                </p>
                            </div>
                            <div className="space-y-4">
                                <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-6 rounded-xl border-2 border-emerald-200">
                                    <div className="flex items-center gap-3 mb-3">
                                        <CheckCircle className="text-emerald-600" size={28} />
                                        <div>
                                            <p className="font-bold text-slate-900">Software Engineer</p>
                                            <p className="text-sm text-slate-600">Starting: ~$75k/year</p>
                                        </div>
                                    </div>
                                    <p className="text-emerald-700 font-semibold">Safe debt limit: $75,000</p>
                                </div>

                                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border-2 border-blue-200">
                                    <div className="flex items-center gap-3 mb-3">
                                        <CheckCircle className="text-blue-600" size={28} />
                                        <div>
                                            <p className="font-bold text-slate-900">Teacher</p>
                                            <p className="text-sm text-slate-600">Starting: ~$45k/year</p>
                                        </div>
                                    </div>
                                    <p className="text-blue-700 font-semibold">Safe debt limit: $45,000</p>
                                </div>

                                <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-xl border-2 border-amber-200">
                                    <div className="flex items-center gap-3 mb-3">
                                        <AlertTriangle className="text-amber-600" size={28} />
                                        <div>
                                            <p className="font-bold text-slate-900">Social Worker</p>
                                            <p className="text-sm text-slate-600">Starting: ~$40k/year</p>
                                        </div>
                                    </div>
                                    <p className="text-amber-700 font-semibold">Safe debt limit: $40,000</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 rounded-2xl text-white shadow-2xl">
                        <h4 className="text-2xl font-bold mb-6">Real World Impact</h4>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="bg-white/10 p-6 rounded-xl backdrop-blur-sm">
                                <p className="text-indigo-100 mb-2 text-sm">Manageable Scenario</p>
                                <p className="text-white font-semibold mb-3">$50k debt, $55k salary</p>
                                <p className="text-sm text-indigo-100 leading-relaxed">
                                    Monthly payment: ~$550 (12% of gross). Still have money for rent, car, savings, and life.
                                </p>
                            </div>
                            <div className="bg-rose-500/20 p-6 rounded-xl border-2 border-rose-400">
                                <p className="text-rose-100 mb-2 text-sm">Crushing Scenario</p>
                                <p className="text-white font-semibold mb-3">$80k debt, $45k salary</p>
                                <p className="text-sm text-rose-100 leading-relaxed">
                                    Monthly payment: ~$880 (23% of gross). Living with parents for years, can't save, constant stress.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* STEP 2: FEDERAL VS PRIVATE LOANS */}
            {step === 2 && (
                <div className="space-y-8 animate-in fade-in duration-500">
                    <div className="text-center max-w-2xl mx-auto mb-12">
                        <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Not All Loans Are Equal</h2>
                        <p className="text-lg text-slate-600">
                            Federal loans have protections. Private loans have profit margins.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-8 rounded-2xl border-2 border-emerald-200 shadow-xl">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                                    <Shield size={32} className="text-white" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-slate-900">Federal Loans</h3>
                                    <p className="text-emerald-700 font-semibold">The Safer Choice</p>
                                </div>
                            </div>

                            <div className="space-y-4 mb-6">
                                <div className="flex items-start gap-3">
                                    <CheckCircle className="text-emerald-600 mt-1 flex-shrink-0" size={20} />
                                    <div>
                                        <p className="font-semibold text-slate-900">Fixed Interest Rates</p>
                                        <p className="text-sm text-slate-600">Rate locked in - never changes during repayment</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <CheckCircle className="text-emerald-600 mt-1 flex-shrink-0" size={20} />
                                    <div>
                                        <p className="font-semibold text-slate-900">Income-Driven Repayment Plans</p>
                                        <p className="text-sm text-slate-600">Payments adjust if you lose your job or income drops</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <CheckCircle className="text-emerald-600 mt-1 flex-shrink-0" size={20} />
                                    <div>
                                        <p className="font-semibold text-slate-900">Loan Forgiveness Programs</p>
                                        <p className="text-sm text-slate-600">Public Service Loan Forgiveness (PSLF) after 10 years of qualifying payments</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <CheckCircle className="text-emerald-600 mt-1 flex-shrink-0" size={20} />
                                    <div>
                                        <p className="font-semibold text-slate-900">Deferment & Forbearance</p>
                                        <p className="text-sm text-slate-600">Pause payments during hardship without default</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-4 rounded-xl border-2 border-emerald-200">
                                <p className="text-sm font-bold text-emerald-900">Current Rate (2024): ~5.5% fixed</p>
                                <p className="text-xs text-emerald-700 mt-1">Max limits: $5,500-$12,500/year depending on year in school</p>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-rose-50 to-red-50 p-8 rounded-2xl border-2 border-rose-200 shadow-xl">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-16 h-16 bg-rose-600 rounded-2xl flex items-center justify-center shadow-lg">
                                    <AlertTriangle size={32} className="text-white" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-slate-900">Private Loans</h3>
                                    <p className="text-rose-700 font-semibold">Last Resort Only</p>
                                </div>
                            </div>

                            <div className="space-y-4 mb-6">
                                <div className="flex items-start gap-3">
                                    <AlertTriangle className="text-rose-600 mt-1 flex-shrink-0" size={20} />
                                    <div>
                                        <p className="font-semibold text-slate-900">Variable Interest Rates</p>
                                        <p className="text-sm text-slate-600">Can start at 6% and climb to 12%+ over time</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <AlertTriangle className="text-rose-600 mt-1 flex-shrink-0" size={20} />
                                    <div>
                                        <p className="font-semibold text-slate-900">Requires Co-Signer</p>
                                        <p className="text-sm text-slate-600">Drags parents' credit down if you can't pay</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <AlertTriangle className="text-rose-600 mt-1 flex-shrink-0" size={20} />
                                    <div>
                                        <p className="font-semibold text-slate-900">No Forgiveness Programs</p>
                                        <p className="text-sm text-slate-600">You're stuck with the debt no matter what</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <AlertTriangle className="text-rose-600 mt-1 flex-shrink-0" size={20} />
                                    <div>
                                        <p className="font-semibold text-slate-900">No Income-Based Repayment</p>
                                        <p className="text-sm text-slate-600">Fixed payment regardless of your financial situation</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-4 rounded-xl border-2 border-rose-300">
                                <p className="text-sm font-bold text-rose-900">AVOID at all costs</p>
                                <p className="text-xs text-rose-700 mt-1">Only consider after maxing out ALL federal loan options</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-amber-50 to-yellow-50 p-8 rounded-2xl border-2 border-amber-200">
                        <div className="flex items-start gap-4">
                            <Zap className="text-amber-600 flex-shrink-0 mt-1" size={32} />
                            <div>
                                <h4 className="text-xl font-bold text-slate-900 mb-3">⚠️ Capitalized Interest Warning</h4>
                                <p className="text-slate-700 leading-relaxed mb-4">
                                    While you're in school, interest accumulates on your loans. If you don't pay it, that interest gets added to your principal (capitalized). Then you pay <strong>interest on the interest</strong>, compounding your debt.
                                </p>
                                <div className="bg-white p-4 rounded-xl border border-amber-200">
                                    <p className="text-sm font-bold text-amber-900 mb-2">Smart Move:</p>
                                    <p className="text-sm text-slate-700">Pay at least the interest while in school, even if it's just $50/month. Prevents thousands in extra debt.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* STEP 3: COST-CUTTING STRATEGIES */}
            {step === 3 && (
                <div className="space-y-8 animate-in fade-in duration-500">
                    <div className="text-center max-w-2xl mx-auto mb-12">
                        <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Hack Your Degree</h2>
                        <p className="text-lg text-slate-600">
                            You don't need to follow the expensive 4-year path
                        </p>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-8 rounded-2xl border-2 border-indigo-200 shadow-xl">
                            <div className="flex items-start gap-6">
                                <div className="w-16 h-16 bg-indigo-600 text-white rounded-2xl flex items-center justify-center text-3xl font-black shadow-lg">1</div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-slate-900 text-2xl mb-3">The Community College Transfer</h4>
                                    <p className="text-slate-700 text-lg mb-4 leading-relaxed">
                                        Complete your first two years (general education requirements) at a community college for 1/5th the cost of a university. Then transfer to finish your last two years. Your diploma will still say "University of [State]" - employers won't know the difference.
                                    </p>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="bg-white p-6 rounded-xl">
                                            <p className="text-xs text-slate-600 mb-2">Traditional 4-Year Path</p>
                                            <p className="text-3xl font-black text-rose-600 mb-1">$80,000</p>
                                            <p className="text-xs text-slate-500">Total tuition cost</p>
                                        </div>
                                        <div className="bg-white p-6 rounded-xl border-2 border-emerald-200">
                                            <p className="text-xs text-slate-600 mb-2">2 Years CC + 2 Years University</p>
                                            <p className="text-3xl font-black text-emerald-600 mb-1">$45,000</p>
                                            <p className="text-xs text-emerald-700 font-semibold">Save $35,000!</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-8 rounded-2xl border-2 border-purple-200 shadow-xl">
                            <div className="flex items-start gap-6">
                                <div className="w-16 h-16 bg-purple-600 text-white rounded-2xl flex items-center justify-center text-3xl font-black shadow-lg">2</div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-slate-900 text-2xl mb-3">Fill Out FAFSA Every Single Year</h4>
                                    <p className="text-slate-700 text-lg mb-4 leading-relaxed">
                                        Even if you think you won't qualify for financial aid, fill out the FAFSA (Free Application for Federal Student Aid) every year. Many scholarships and grants require a FAFSA on file. Plus, your family's financial situation can change year to year.
                                    </p>
                                    <div className="bg-white p-6 rounded-xl">
                                        <p className="text-sm font-bold text-purple-900 mb-3">What FAFSA Can Get You:</p>
                                        <ul className="space-y-2 text-sm text-slate-700">
                                            <li className="flex items-start gap-2">
                                                <span className="text-purple-600 font-bold">→</span>
                                                <span><strong>Pell Grants:</strong> Up to $7,395/year (doesn't need to be repaid!)</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="text-purple-600 font-bold">→</span>
                                                <span><strong>Work-Study Programs:</strong> Part-time campus jobs to earn money</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="text-purple-600 font-bold">→</span>
                                                <span><strong>State Grants:</strong> Additional free money from your state</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="text-purple-600 font-bold">→</span>
                                                <span><strong>Federal Loans:</strong> Access to low-interest student loans</span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-8 rounded-2xl border-2 border-emerald-200 shadow-xl">
                            <div className="flex items-start gap-6">
                                <div className="w-16 h-16 bg-emerald-600 text-white rounded-2xl flex items-center justify-center text-3xl font-black shadow-lg">3</div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-slate-900 text-2xl mb-3">Work Part-Time While in School</h4>
                                    <p className="text-slate-700 text-lg mb-4 leading-relaxed">
                                        Working 15-20 hours per week covers your living expenses (food, rent, gas) so you don't have to borrow for day-to-day life. Borrow for tuition only, not pizza and Netflix.
                                    </p>
                                    <div className="bg-white p-6 rounded-xl">
                                        <p className="text-sm font-bold text-emerald-900 mb-3">Example Budget:</p>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-slate-700">20 hrs/week @ $15/hr</span>
                                                <span className="font-semibold text-slate-900">$1,200/month</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-700">- Rent & utilities</span>
                                                <span className="text-rose-600">-$600</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-700">- Food & groceries</span>
                                                <span className="text-rose-600">-$300</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-700">- Gas & misc</span>
                                                <span className="text-rose-600">-$200</span>
                                            </div>
                                            <div className="flex justify-between border-t-2 border-emerald-200 pt-2">
                                                <span className="font-bold text-emerald-900">Left over for savings</span>
                                                <span className="font-black text-emerald-600 text-lg">$100/mo</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-8 rounded-2xl border-2 border-blue-200 shadow-xl">
                            <div className="flex items-start gap-6">
                                <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center text-3xl font-black shadow-lg">4</div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-slate-900 text-2xl mb-3">Graduate in 4 Years (Not 5 or 6)</h4>
                                    <p className="text-slate-700 text-lg mb-4 leading-relaxed">
                                        Every extra semester costs $10,000-20,000 in tuition plus lost income from delaying your career start. Take summer classes if needed, meet with advisors regularly, and plan your courses carefully.
                                    </p>
                                    <div className="bg-white p-4 rounded-xl">
                                        <p className="text-sm font-bold text-blue-900">Cost of delaying 1 year:</p>
                                        <p className="text-sm text-slate-700 mt-2">+ $20k extra tuition + $50k lost salary = <strong className="text-rose-600">$70k total cost</strong></p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* STEP 4: REPAYMENT STRATEGIES */}
            {step === 4 && (
                <div className="space-y-8 animate-in fade-in duration-500">
                    <div className="text-center max-w-2xl mx-auto mb-12">
                        <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Repayment Strategies</h2>
                        <p className="text-lg text-slate-600">
                            Smart ways to tackle your student loans after graduation
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 mb-8">
                        <div className="bg-white p-8 rounded-2xl border-2 border-indigo-100 shadow-xl">
                            <h3 className="text-xl font-bold text-slate-900 mb-4">Standard Repayment (10 Years)</h3>
                            <p className="text-slate-600 mb-4 leading-relaxed">
                                Fixed monthly payment for 10 years. Highest monthly cost but lowest total interest paid.
                            </p>
                            <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-200">
                                <p className="text-sm font-semibold text-indigo-900">Best for: Stable income, want debt gone quickly</p>
                            </div>
                        </div>

                        <div className="bg-white p-8 rounded-2xl border-2 border-purple-100 shadow-xl">
                            <h3 className="text-xl font-bold text-slate-900 mb-4">Income-Driven Repayment</h3>
                            <p className="text-slate-600 mb-4 leading-relaxed">
                                Payments based on 10-15% of discretionary income. Forgiveness after 20-25 years of payments.
                            </p>
                            <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
                                <p className="text-sm font-semibold text-purple-900">Best for: Low income, high debt, seeking forgiveness</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 rounded-2xl text-white shadow-2xl">
                        <h4 className="text-2xl font-bold mb-6 flex items-center gap-3">
                            <Sparkles size={32} />
                            Pro Strategies
                        </h4>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="bg-white/10 p-6 rounded-xl backdrop-blur-sm">
                                <p className="font-bold mb-2 text-lg">Pay More Than Minimum</p>
                                <p className="text-sm text-indigo-100 leading-relaxed">
                                    Even $50 extra per month can save thousands in interest. Specify that extra payments go toward principal, not future payments.
                                </p>
                            </div>
                            <div className="bg-white/10 p-6 rounded-xl backdrop-blur-sm">
                                <p className="font-bold mb-2 text-lg">Avalanche Method</p>
                                <p className="text-sm text-indigo-100 leading-relaxed">
                                    Pay minimums on all loans, put extra toward highest interest rate loan first. Mathematically optimal.
                                </p>
                            </div>
                            <div className="bg-white/10 p-6 rounded-xl backdrop-blur-sm">
                                <p className="font-bold mb-2 text-lg">Employer Benefits</p>
                                <p className="text-sm text-indigo-100 leading-relaxed">
                                    Some companies offer student loan repayment assistance ($100-200/mo). Ask during job negotiations!
                                </p>
                            </div>
                            <div className="bg-white/10 p-6 rounded-xl backdrop-blur-sm">
                                <p className="font-bold mb-2 text-lg">Refinancing Warning</p>
                                <p className="text-sm text-indigo-100 leading-relaxed">
                                    Refinancing federal loans to private loses forgiveness eligibility and income-driven protections. Only refinance if you have high income and don't need safety nets.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* STEP 5: CALCULATOR */}
            {step === 5 && (
                <div className="space-y-6 animate-in fade-in duration-500">
                    <div className="text-center mb-6">
                        <h2 className="text-3xl font-bold text-slate-900 mb-2">Student Loan Calculator</h2>
                        <p className="text-slate-600">Calculate the burden before you borrow</p>

                        <div className="inline-flex gap-2 mt-4 p-1 bg-slate-100 rounded-xl">
                            <button
                                onClick={() => setCalculatorMode('basic')}
                                className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                                    calculatorMode === 'basic'
                                        ? 'bg-white text-indigo-600 shadow-md'
                                        : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                Basic Mode
                            </button>
                            <button
                                onClick={() => setCalculatorMode('advanced')}
                                className={`px-6 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                                    calculatorMode === 'advanced'
                                        ? 'bg-white text-indigo-600 shadow-md'
                                        : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                <Sparkles size={16} />
                                Advanced Mode
                            </button>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-xl border-2 border-slate-100">
                        <div className="grid md:grid-cols-2 gap-8">
                            {/* Inputs */}
                            <div className="space-y-5">
                                <h3 className="font-bold text-slate-900 text-lg mb-4">Loan Details</h3>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Total Loan Amount</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                                        <input
                                            type="number"
                                            value={loanAmount}
                                            onChange={(e) => setLoanAmount(Number(e.target.value))}
                                            className="w-full pl-8 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-lg font-semibold"
                                        />
                                    </div>
                                    <input
                                        type="range"
                                        min="5000"
                                        max="150000"
                                        step="1000"
                                        value={loanAmount}
                                        onChange={(e) => setLoanAmount(Number(e.target.value))}
                                        className="w-full mt-3 accent-indigo-600"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Interest Rate (%)</label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            value={interestRate}
                                            onChange={(e) => setInterestRate(Number(e.target.value))}
                                            className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-semibold"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Repayment Term</label>
                                        <select
                                            value={loanTerm}
                                            onChange={(e) => setLoanTerm(Number(e.target.value))}
                                            className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-semibold bg-white"
                                        >
                                            <option value="5">5 Years</option>
                                            <option value="10">10 Years ⭐</option>
                                            <option value="15">15 Years</option>
                                            <option value="20">20 Years</option>
                                            <option value="25">25 Years</option>
                                        </select>
                                    </div>
                                </div>

                                {calculatorMode === 'advanced' && (
                                    <div className="pt-4 border-t-2 border-slate-100 space-y-4">
                                        <h4 className="font-bold text-slate-900 flex items-center gap-2">
                                            <Sparkles size={18} className="text-indigo-600" />
                                            Career Planning
                                        </h4>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700 mb-1">Expected Starting Salary</label>
                                            <div className="relative">
                                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                                                <input
                                                    type="number"
                                                    value={expectedSalary}
                                                    onChange={(e) => setExpectedSalary(Number(e.target.value))}
                                                    className="w-full pl-6 pr-3 py-2 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                                    <h5 className="text-sm font-bold text-indigo-800 mb-1">💡 Did you know?</h5>
                                    <p className="text-xs text-indigo-700">
                                        Extending repayment from 10 to 20 years lowers your monthly payment but nearly doubles the total interest you'll pay.
                                    </p>
                                </div>
                            </div>

                            {/* Results */}
                            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-6 rounded-2xl border-2 border-indigo-100 flex flex-col justify-between">
                                <div>
                                    <div className="text-center mb-6">
                                        <span className="block text-xs text-indigo-600 font-bold uppercase tracking-wider mb-2">Monthly Payment</span>
                                        <div className="flex items-start justify-center gap-1">
                                            <span className="text-2xl text-indigo-400 font-bold mt-2">$</span>
                                            <span className="text-6xl font-black text-indigo-900 tracking-tight">{Math.round(monthlyPayment).toLocaleString()}</span>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center p-3 bg-white rounded-xl shadow-sm">
                                            <span className="text-sm font-medium text-slate-600">Total Borrowed</span>
                                            <span className="font-bold text-slate-900">${loanAmount.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-3 bg-white rounded-xl shadow-sm">
                                            <span className="text-sm font-medium text-slate-600">Total Interest</span>
                                            <span className="font-bold text-rose-600">${Math.round(totalInterest).toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-3 bg-slate-100 rounded-xl border border-slate-200 shadow-inner">
                                            <span className="text-sm font-bold text-slate-700">Total Repaid</span>
                                            <span className="font-black text-slate-900">${Math.round(totalRepayment).toLocaleString()}</span>
                                        </div>

                                        {calculatorMode === 'advanced' && (
                                            <>
                                                <div className="pt-3 border-t-2 border-indigo-200">
                                                    <p className="text-xs font-bold text-indigo-900 mb-2 uppercase">Salary Impact</p>
                                                    <div className="space-y-2">
                                                        <div className="flex justify-between text-xs text-indigo-800">
                                                            <span>Expected Salary</span>
                                                            <span className="font-semibold">${expectedSalary.toLocaleString()}</span>
                                                        </div>
                                                        <div className="flex justify-between text-xs text-indigo-800">
                                                            <span>% of Gross Income</span>
                                                            <span className="font-semibold">{salaryPercentage.toFixed(1)}%</span>
                                                        </div>
                                                        <div className="flex justify-between text-xs text-indigo-800">
                                                            <span>% of Take-Home</span>
                                                            <span className={`font-semibold ${percentageOfTakeHome > 15 ? 'text-rose-600' : ''}`}>
                                                                {percentageOfTakeHome.toFixed(1)}%
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {loanAmount > expectedSalary && (
                                                    <div className="p-3 bg-amber-100 rounded-xl flex gap-3 items-start border-2 border-amber-200">
                                                        <AlertTriangle className="text-amber-700 shrink-0 mt-0.5" size={18} />
                                                        <p className="text-xs text-amber-900 font-semibold">
                                                            Warning: Your debt exceeds your expected salary. This may be unmanageable.
                                                        </p>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Save/Export */}
                        <div className="mt-6 pt-6 border-t-2 border-slate-100 flex gap-3">
                            <button
                                onClick={handleSaveData}
                                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-indigo-100 text-indigo-700 rounded-xl font-bold hover:bg-indigo-200 transition-all"
                            >
                                <Save size={18} />
                                Save Calculation
                            </button>
                            <button
                                onClick={handleExportData}
                                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-emerald-100 text-emerald-700 rounded-xl font-bold hover:bg-emerald-200 transition-all"
                            >
                                <Download size={18} />
                                Export PDF
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </ImmersionLayout>
    );
};

export default CollegeImmersion;
