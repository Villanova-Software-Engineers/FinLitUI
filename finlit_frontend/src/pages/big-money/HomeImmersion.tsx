import React, { useState } from 'react';
import { ImmersionLayout } from './ImmersionLayout';
import { Home, Info, AlertTriangle, CheckCircle, Shield, DollarSign, TrendingUp, Download, Sparkles, Zap, Wrench, FileText } from 'lucide-react';

const HomeImmersion = () => {
    const [step, setStep] = useState(1);
    const totalSteps = 5;

    const next = () => setStep(s => Math.min(s + 1, totalSteps));
    const back = () => setStep(s => Math.max(s - 1, 1));

    // Calculator State
    const [calculatorMode, setCalculatorMode] = useState<'basic' | 'advanced'>('basic');
    const [homePrice, setHomePrice] = useState(300000);
    const [downPaymentPercent, setDownPaymentPercent] = useState(20);
    const [interestRate, setInterestRate] = useState(6.5);
    const [loanTerm, setLoanTerm] = useState(30);

    // Advanced mode
    const [propertyTaxRate, setPropertyTaxRate] = useState(1.2);
    const [homeInsuranceAnnual, setHomeInsuranceAnnual] = useState(1500);
    const [hoaMonthly, setHoaMonthly] = useState(0);
    const [maintenanceBudget, setMaintenanceBudget] = useState(4000);

    // Calculations
    const downPaymentAmount = homePrice * (downPaymentPercent / 100);
    const loanAmount = homePrice - downPaymentAmount;
    const monthlyRate = interestRate / 100 / 12;
    const numberOfPayments = loanTerm * 12;

    const monthlyPrincipalAndInterest =
        (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
        (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

    const monthlyPropertyTax = (homePrice * (propertyTaxRate / 100)) / 12;
    const monthlyInsurance = homeInsuranceAnnual / 12;
    const monthlyMaintenance = maintenanceBudget / 12;
    const monthlyPMI = downPaymentPercent < 20 ? (loanAmount * 0.005) / 12 : 0;

    const totalMonthlyPayment = monthlyPrincipalAndInterest + monthlyPropertyTax + monthlyInsurance + hoaMonthly + monthlyPMI;
    const totalWithMaintenance = totalMonthlyPayment + monthlyMaintenance;

    // Export Function
    const handleExportData = () => {
        const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Home Purchase Analysis</title>
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
    <h1>🏠 Home Purchase Analysis</h1>
    <p class="date">Generated on ${new Date().toLocaleDateString()}</p>

    <div class="section">
        <h2>Purchase Details</h2>
        <div class="row"><span class="label">Home Price</span><span class="value">$${homePrice.toLocaleString()}</span></div>
        <div class="row"><span class="label">Down Payment (${downPaymentPercent}%)</span><span class="value">$${Math.round(downPaymentAmount).toLocaleString()}</span></div>
        <div class="row"><span class="label">Loan Amount</span><span class="value">$${Math.round(loanAmount).toLocaleString()}</span></div>
        <div class="row"><span class="label">Interest Rate</span><span class="value">${interestRate}%</span></div>
        <div class="row"><span class="label">Loan Term</span><span class="value">${loanTerm} years</span></div>
    </div>

    <div class="highlight">
        <div style="font-size: 14px; margin-bottom: 8px;">Total Monthly Payment (PITI)</div>
        <div class="big">$${Math.round(totalMonthlyPayment).toLocaleString()}</div>
    </div>

    <div class="section">
        <h2>Monthly Payment Breakdown</h2>
        <div class="row"><span class="label">Principal & Interest</span><span class="value">$${Math.round(monthlyPrincipalAndInterest).toLocaleString()}</span></div>
        <div class="row"><span class="label">Property Tax</span><span class="value">$${Math.round(monthlyPropertyTax).toLocaleString()}</span></div>
        <div class="row"><span class="label">Home Insurance</span><span class="value">$${Math.round(monthlyInsurance).toLocaleString()}</span></div>
        ${monthlyPMI > 0 ? `<div class="row"><span class="label">PMI</span><span class="value" style="color: #dc2626;">$${Math.round(monthlyPMI).toLocaleString()}</span></div>` : ''}
        ${hoaMonthly > 0 ? `<div class="row"><span class="label">HOA Fees</span><span class="value">$${hoaMonthly}</span></div>` : ''}
    </div>

    ${calculatorMode === 'advanced' ? `
    <div class="section">
        <h2>Full Ownership Cost (with Maintenance)</h2>
        <div class="row"><span class="label">Monthly Maintenance Budget</span><span class="value">$${Math.round(monthlyMaintenance)}</span></div>
        <div class="row" style="background: #4f46e5; color: white; padding: 12px; margin-top: 8px; border-radius: 8px;">
            <span style="font-weight: 700;">TOTAL MONTHLY COST</span>
            <span style="font-weight: 800; font-size: 18px;">$${Math.round(totalWithMaintenance).toLocaleString()}</span>
        </div>
    </div>
    ` : ''}

    ${downPaymentPercent < 20 ? `
    <div class="section warning">
        <h2>⚠️ PMI Alert</h2>
        <p style="margin: 0;">You'll pay an extra $${Math.round(monthlyPMI)}/month for Private Mortgage Insurance until you reach 20% equity. Consider saving a larger down payment.</p>
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
        link.download = `home-analysis-${Date.now()}.html`;
        link.click();

        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(htmlContent);
            printWindow.document.close();
            setTimeout(() => {
                printWindow.print();
            }, 250);
        }

        setTimeout(() => {
            URL.revokeObjectURL(url);
        }, 1000);
    };

    return (
        <ImmersionLayout
            title="Buying a Home"
            subtitle="The biggest purchase of your life"
            currentStep={step}
            totalSteps={totalSteps}
            onNext={next}
            onBack={back}
            colorTheme="blue"
        >
            {/* STEP 1: THE NUMBERS */}
            {step === 1 && (
                <div className="space-y-8 animate-in fade-in duration-500">
                    <div className="text-center max-w-2xl mx-auto mb-12">
                        <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Know Your Numbers</h2>
                        <p className="text-lg text-slate-600">
                            Before you start house hunting, understand what lenders look for
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white p-8 rounded-2xl shadow-xl border-2 border-indigo-100 hover:shadow-2xl transition-all">
                            <div className="text-6xl font-black text-indigo-600 mb-4">20%</div>
                            <h3 className="font-bold text-slate-900 text-xl mb-4">The Down Payment Goal</h3>
                            <p className="text-slate-700 leading-relaxed mb-4">
                                Putting down 20% of the home's price eliminates Private Mortgage Insurance (PMI), which is an extra $100-300 per month that only protects the lender if you default.
                            </p>
                            <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                                <p className="text-sm text-indigo-900 font-semibold">Example: $300k home = $60k down payment</p>
                                <p className="text-xs text-indigo-700 mt-1">Saves ~$200/mo in PMI = $24,000 over 10 years</p>
                            </div>
                        </div>

                        <div className="bg-white p-8 rounded-2xl shadow-xl border-2 border-blue-100 hover:shadow-2xl transition-all">
                            <div className="text-6xl font-black text-blue-600 mb-4">28/36</div>
                            <h3 className="font-bold text-slate-900 text-xl mb-4">Debt-to-Income Ratios</h3>
                            <p className="text-slate-700 leading-relaxed mb-4">
                                <strong>Front-end ratio (28%):</strong> Your housing payment (mortgage, taxes, insurance) shouldn't exceed 28% of your gross monthly income.
                            </p>
                            <p className="text-slate-700 leading-relaxed mb-4">
                                <strong>Back-end ratio (36%):</strong> All debt payments (housing + car + student loans + credit cards) shouldn't exceed 36% of gross income.
                            </p>
                            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                                <p className="text-sm text-blue-900 font-semibold">$5,000/mo income = max $1,400 housing</p>
                                <p className="text-xs text-blue-700 mt-1">Total debt limit: $1,800/month</p>
                            </div>
                        </div>

                        <div className="bg-white p-8 rounded-2xl shadow-xl border-2 border-purple-100 hover:shadow-2xl transition-all">
                            <div className="text-6xl font-black text-purple-600 mb-4">760+</div>
                            <h3 className="font-bold text-slate-900 text-xl mb-4">Credit Score Impact</h3>
                            <p className="text-slate-700 leading-relaxed mb-4">
                                Your credit score determines your interest rate. A 760+ score gets you the best rates, while anything below 700 means you'll pay thousands more in interest.
                            </p>
                            <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                                <p className="text-sm text-purple-900 font-semibold mb-2">Rate Difference Impact:</p>
                                <p className="text-xs text-purple-700">760+ score: 6.5% rate</p>
                                <p className="text-xs text-purple-700">680 score: 7.5% rate</p>
                                <p className="text-xs font-bold text-purple-800 mt-2">= $100/mo more = $36k over 30 years!</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-8 rounded-2xl text-white shadow-2xl">
                        <h4 className="text-2xl font-bold mb-6">Real World Example</h4>
                        <div className="space-y-4">
                            <div className="bg-white/10 p-6 rounded-xl backdrop-blur-sm">
                                <p className="text-indigo-100 mb-3">Sarah makes <strong className="text-white text-xl">$80,000/year</strong> ($6,667/month gross)</p>
                                <div className="grid md:grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-indigo-200 mb-1">Max Housing Payment (28%)</p>
                                        <p className="text-2xl font-black text-white">$1,867/mo</p>
                                    </div>
                                    <div>
                                        <p className="text-indigo-200 mb-1">Max Total Debt (36%)</p>
                                        <p className="text-2xl font-black text-white">$2,400/mo</p>
                                    </div>
                                </div>
                                <p className="text-xs text-indigo-200 mt-4">If Sarah has a $300 car payment, her housing budget drops to $2,100/mo max</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* STEP 2: ONGOING COSTS */}
            {step === 2 && (
                <div className="space-y-8 animate-in fade-in duration-500">
                    <div className="text-center max-w-2xl mx-auto mb-12">
                        <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">The Hidden Costs</h2>
                        <p className="text-lg text-slate-600">
                            Your mortgage is just the beginning
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-gradient-to-br from-rose-50 to-red-50 p-6 rounded-2xl border-2 border-rose-200 hover:shadow-xl transition-all">
                            <div className="text-5xl mb-3">📋</div>
                            <h3 className="font-bold text-slate-900 text-xl mb-2">Property Tax</h3>
                            <p className="text-2xl font-black text-rose-600 mb-3">0.5-2.5% per year</p>
                            <p className="text-slate-700 mb-4 leading-relaxed">
                                Property taxes are collected by your local government to fund schools, roads, police, and fire departments. For a $300,000 home, you will pay approximately $300 per month. The rate varies dramatically by state—New Jersey charges 2.5% while Hawaii charges only 0.3%. Property taxes never disappear and almost always increase over time, so factor this into your long-term budget.
                            </p>
                            <div className="bg-white/80 px-4 py-3 rounded-lg">
                                <p className="text-sm font-bold text-rose-700 mb-1">Pro Tip:</p>
                                <p className="text-xs text-rose-600">Research local property tax rates before buying. Some neighborhoods have additional special assessments that can add hundreds more per year.</p>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border-2 border-blue-200 hover:shadow-xl transition-all">
                            <div className="text-5xl mb-3">🛡️</div>
                            <h3 className="font-bold text-slate-900 text-xl mb-2">Home Insurance</h3>
                            <p className="text-2xl font-black text-blue-600 mb-3">$1,000-3,000 per year</p>
                            <p className="text-slate-700 mb-4 leading-relaxed">
                                Home insurance is required by your mortgage lender to protect their investment. It covers damage from fire, theft, vandalism, and liability if someone gets injured on your property. Flood and earthquake damage require separate policies, which can be expensive in high-risk areas. The cost depends on your home's value, location, age, and claims history.
                            </p>
                            <div className="bg-white/80 px-4 py-3 rounded-lg">
                                <p className="text-sm font-bold text-blue-700 mb-1">Pro Tip:</p>
                                <p className="text-xs text-blue-600">Shop around with multiple insurance companies—rates can vary by 40% or more for the exact same coverage. Get quotes from at least three providers before deciding.</p>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-2xl border-2 border-amber-200 hover:shadow-xl transition-all">
                            <div className="text-5xl mb-3">🔧</div>
                            <h3 className="font-bold text-slate-900 text-xl mb-2">Maintenance and Repairs</h3>
                            <p className="text-2xl font-black text-amber-600 mb-3">1% of home value per year</p>
                            <p className="text-slate-700 mb-4 leading-relaxed">
                                Homes require constant upkeep and unexpected repairs. Major expenses include HVAC system replacement ($8,000), roof replacement ($15,000), water heater ($1,500), and plumbing issues. Budget at least $300-400 per month for maintenance. Older homes typically need more work, but even new construction requires regular maintenance like gutter cleaning, HVAC servicing, and lawn care.
                            </p>
                            <div className="bg-white/80 px-4 py-3 rounded-lg">
                                <p className="text-sm font-bold text-amber-700 mb-1">Pro Tip:</p>
                                <p className="text-xs text-amber-600">A newer home does not mean maintenance-free. Always set aside money for repairs regardless of the home's age. When something breaks, it is always expensive and never convenient.</p>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-2xl border-2 border-purple-200 hover:shadow-xl transition-all">
                            <div className="text-5xl mb-3">💸</div>
                            <h3 className="font-bold text-slate-900 text-xl mb-2">Private Mortgage Insurance (PMI)</h3>
                            <p className="text-2xl font-black text-purple-600 mb-3">$100-300 per month</p>
                            <p className="text-slate-700 mb-4 leading-relaxed">
                                If you put down less than 20% on your home purchase, you will be required to pay PMI until you reach 20% equity. This insurance protects the lender, not you—if you default, they get their money back. You get nothing from this payment except the ability to buy a home with less money down. It is essentially wasted money that only benefits the bank.
                            </p>
                            <div className="bg-white/80 px-4 py-3 rounded-lg">
                                <p className="text-sm font-bold text-purple-700 mb-1">Pro Tip:</p>
                                <p className="text-xs text-purple-600">Save a 20% down payment to skip PMI entirely. Over 10 years, avoiding PMI can save you $24,000 or more—money that could go toward retirement or paying down your mortgage faster.</p>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-6 rounded-2xl border-2 border-emerald-200 hover:shadow-xl transition-all">
                            <div className="text-5xl mb-3">⚡</div>
                            <h3 className="font-bold text-slate-900 text-xl mb-2">Utilities</h3>
                            <p className="text-2xl font-black text-emerald-600 mb-3">$200-500 per month</p>
                            <p className="text-slate-700 mb-4 leading-relaxed">
                                Utilities include electricity, natural gas, water, sewer, trash collection, and internet. Bigger homes have higher utility bills due to more space to heat and cool. Air conditioning during summer months can easily add $200 or more per month to your electric bill. Climate, home insulation, and appliance efficiency all impact your total utility costs.
                            </p>
                            <div className="bg-white/80 px-4 py-3 rounded-lg">
                                <p className="text-sm font-bold text-emerald-700 mb-1">Pro Tip:</p>
                                <p className="text-xs text-emerald-600">Ask the seller to provide the past 12 months of utility bills before you buy. This gives you an accurate picture of seasonal costs and helps you budget appropriately.</p>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-cyan-50 to-blue-50 p-6 rounded-2xl border-2 border-cyan-200 hover:shadow-xl transition-all">
                            <div className="text-5xl mb-3">🏘️</div>
                            <h3 className="font-bold text-slate-900 text-xl mb-2">Homeowners Association (HOA) Fees</h3>
                            <p className="text-2xl font-black text-cyan-600 mb-3">$50-800 per month</p>
                            <p className="text-slate-700 mb-4 leading-relaxed">
                                Condominiums and townhomes typically charge monthly HOA fees to maintain shared spaces and amenities like pools, gyms, landscaping, and building exteriors. Some HOAs provide excellent services, while others are poorly managed and offer little value. HOA fees can increase unexpectedly, and special assessments for major repairs can cost thousands. You also must follow HOA rules, which can be strict.
                            </p>
                            <div className="bg-white/80 px-4 py-3 rounded-lg">
                                <p className="text-sm font-bold text-cyan-700 mb-1">Pro Tip:</p>
                                <p className="text-xs text-cyan-600">Read the HOA rules, financial statements, and meeting minutes before buying. Some associations have very restrictive rules about paint colors, parking, pets, and renovations that could seriously limit your freedom.</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-8 rounded-2xl text-white shadow-2xl">
                        <h4 className="text-2xl font-black mb-6 flex items-center gap-3">
                            <Zap className="text-yellow-400" size={32} />
                            Reality Check: $300k Home
                        </h4>
                        <div className="grid md:grid-cols-3 gap-6">
                            <div>
                                <p className="text-slate-400 text-sm mb-1">Mortgage (P&I)</p>
                                <p className="text-3xl font-black text-white">$1,500</p>
                            </div>
                            <div>
                                <p className="text-slate-400 text-sm mb-1">Property Tax + Insurance</p>
                                <p className="text-3xl font-black text-amber-400">+$450</p>
                            </div>
                            <div>
                                <p className="text-slate-400 text-sm mb-1">Maintenance + Utilities</p>
                                <p className="text-3xl font-black text-rose-400">+$550</p>
                            </div>
                        </div>
                        <div className="mt-6 pt-6 border-t-2 border-slate-700 text-center">
                            <p className="text-slate-300 mb-2">REAL Monthly Cost</p>
                            <p className="text-5xl font-black text-emerald-400">$2,500+</p>
                        </div>
                    </div>
                </div>
            )}

            {/* STEP 3: THE TRAPS */}
            {step === 3 && (
                <div className="space-y-8 animate-in fade-in duration-500">
                    <div className="text-center max-w-2xl mx-auto mb-12">
                        <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Avoid These Mistakes</h2>
                        <p className="text-lg text-slate-600">
                            Learn from others' expensive lessons before they become yours
                        </p>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-gradient-to-br from-rose-50 to-red-50 p-8 rounded-2xl border-2 border-rose-200 shadow-lg">
                            <div className="flex items-start gap-6">
                                <div className="text-6xl">🏚️</div>
                                <div className="flex-1">
                                    <h3 className="font-black text-slate-900 mb-3 text-2xl">Becoming "House Poor"</h3>
                                    <p className="text-slate-700 text-lg mb-4 leading-relaxed">
                                        Just because a bank pre-approves you for $500,000 doesn't mean you should spend that much. Banks calculate based on your income, but they don't account for your lifestyle, retirement goals, vacation plans, or unexpected expenses.
                                    </p>
                                    <div className="bg-white p-6 rounded-xl mb-4">
                                        <p className="text-sm font-bold text-rose-900 mb-3">Real Example:</p>
                                        <p className="text-sm text-slate-700 leading-relaxed">
                                            Mike got approved for a $450k home but bought at $380k instead. That extra $70k saved him $500/month, which he now uses for: retirement savings, weekend trips, and a comfortable emergency fund. He sleeps better at night.
                                        </p>
                                    </div>
                                    <div className="bg-rose-100 px-4 py-3 rounded-lg border-l-4 border-rose-600">
                                        <p className="text-sm font-bold text-rose-900">The Rule: Buy based on what YOU need, not what the bank allows</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-8 rounded-2xl border-2 border-amber-200 shadow-lg">
                            <div className="flex items-start gap-6">
                                <div className="text-6xl">🔍</div>
                                <div className="flex-1">
                                    <h3 className="font-black text-slate-900 mb-3 text-2xl">Waiving the Home Inspection</h3>
                                    <p className="text-slate-700 text-lg mb-4 leading-relaxed">
                                        In competitive markets, some buyers waive inspections to make their offer more attractive. This is financial suicide. That $500 inspection fee can reveal $20,000+ in hidden problems that become YOUR responsibility the moment you sign.
                                    </p>
                                    <div className="grid md:grid-cols-3 gap-4 mb-4">
                                        <div className="bg-white p-4 rounded-xl text-center">
                                            <p className="text-xs text-slate-600 mb-1">New Roof</p>
                                            <p className="text-2xl font-black text-amber-700">$15k</p>
                                        </div>
                                        <div className="bg-white p-4 rounded-xl text-center">
                                            <p className="text-xs text-slate-600 mb-1">Foundation Repair</p>
                                            <p className="text-2xl font-black text-amber-700">$20k</p>
                                        </div>
                                        <div className="bg-white p-4 rounded-xl text-center">
                                            <p className="text-xs text-slate-600 mb-1">HVAC Replacement</p>
                                            <p className="text-2xl font-black text-amber-700">$8k</p>
                                        </div>
                                    </div>
                                    <div className="bg-amber-100 px-4 py-3 rounded-lg border-l-4 border-amber-600">
                                        <p className="text-sm font-bold text-amber-900">The Rule: NEVER waive inspection. If sellers won't allow it, walk away</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-8 rounded-2xl border-2 border-purple-200 shadow-lg">
                            <div className="flex items-start gap-6">
                                <div className="text-6xl">💸</div>
                                <div className="flex-1">
                                    <h3 className="font-black text-slate-900 mb-3 text-2xl">Buying Without an Emergency Fund</h3>
                                    <p className="text-slate-700 text-lg mb-4 leading-relaxed">
                                        Homes require constant maintenance and unexpected repairs. If you drain your savings for the down payment, you'll be one broken furnace away from credit card debt. Always keep cash reserves AFTER buying.
                                    </p>
                                    <div className="bg-white p-6 rounded-xl mb-4">
                                        <p className="text-sm font-bold text-purple-900 mb-3">Minimum Safety Net:</p>
                                        <ul className="space-y-2 text-sm text-slate-700">
                                            <li className="flex items-start gap-2">
                                                <span className="text-purple-600 font-bold">→</span>
                                                <span><strong>3-6 months</strong> of total living expenses (mortgage, food, utilities, everything)</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="text-purple-600 font-bold">→</span>
                                                <span><strong>$5,000 repair fund</strong> for immediate home emergencies</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="text-purple-600 font-bold">→</span>
                                                <span>This is IN ADDITION to your down payment, not part of it</span>
                                            </li>
                                        </ul>
                                    </div>
                                    <div className="bg-purple-100 px-4 py-3 rounded-lg border-l-4 border-purple-600">
                                        <p className="text-sm font-bold text-purple-900">The Rule: If you can't afford the house AND the emergency fund, keep renting</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-8 rounded-2xl border-2 border-blue-200 shadow-lg">
                            <div className="flex items-start gap-6">
                                <div className="text-6xl">📍</div>
                                <div className="flex-1">
                                    <h3 className="font-black text-slate-900 mb-3 text-2xl">Prioritizing House Over Location</h3>
                                    <p className="text-slate-700 text-lg mb-4 leading-relaxed">
                                        You can renovate kitchens, update bathrooms, and paint walls. But you CANNOT change the neighborhood, school district, commute time, or property values. Location is permanent, everything else is changeable.
                                    </p>
                                    <div className="bg-white p-6 rounded-xl mb-4">
                                        <p className="text-sm font-bold text-blue-900 mb-3">What Makes a Good Location:</p>
                                        <div className="grid md:grid-cols-2 gap-3 text-sm text-slate-700">
                                            <div className="flex items-center gap-2">
                                                <span className="text-emerald-600 text-lg">✓</span>
                                                <span>Top-rated school districts (even if you don't have kids - resale value)</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-emerald-600 text-lg">✓</span>
                                                <span>Low crime rates and safe neighborhoods</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-emerald-600 text-lg">✓</span>
                                                <span>Reasonable commute to work (under 30 min)</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-emerald-600 text-lg">✓</span>
                                                <span>Rising property values over past 5-10 years</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-blue-100 px-4 py-3 rounded-lg border-l-4 border-blue-600">
                                        <p className="text-sm font-bold text-blue-900">The Rule: Buy the worst house on the best street, not the best house on the worst street</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* STEP 4: WIN STRATEGY */}
            {step === 4 && (
                <div className="space-y-8 animate-in fade-in duration-500">
                    <div className="text-center max-w-2xl mx-auto mb-12">
                        <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">How to Win</h2>
                        <p className="text-lg text-slate-600">
                            Build wealth through real estate the right way
                        </p>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-8 rounded-2xl border-2 border-indigo-200 shadow-xl hover:shadow-2xl transition-all">
                            <div className="flex items-start gap-6">
                                <div className="w-16 h-16 bg-indigo-600 text-white rounded-2xl flex items-center justify-center text-3xl font-black shadow-lg">1</div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-slate-900 text-2xl mb-3">Emergency Fund First</h4>
                                    <p className="text-slate-700 text-lg mb-4">
                                        3-6 months expenses + $5k repair buffer saved BEFORE you buy.
                                    </p>
                                    <div className="flex gap-3 flex-wrap">
                                        <span className="px-3 py-1 bg-white rounded-lg text-sm font-semibold text-indigo-700">Water heater: $1,500</span>
                                        <span className="px-3 py-1 bg-white rounded-lg text-sm font-semibold text-indigo-700">AC repair: $3,000</span>
                                        <span className="px-3 py-1 bg-white rounded-lg text-sm font-semibold text-indigo-700">Plumbing: $2,000</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-8 rounded-2xl border-2 border-blue-200 shadow-xl hover:shadow-2xl transition-all">
                            <div className="flex items-start gap-6">
                                <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center text-3xl font-black shadow-lg">2</div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-slate-900 text-2xl mb-3">20% Down Payment</h4>
                                    <p className="text-slate-700 text-lg mb-4">
                                        Avoid PMI ($100-300/mo waste), get better rates, start with instant equity.
                                    </p>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="bg-white p-4 rounded-xl">
                                            <p className="text-xs text-slate-600 mb-1">PMI Cost Over 10 Years</p>
                                            <p className="text-2xl font-black text-rose-600">$24,000</p>
                                        </div>
                                        <div className="bg-white p-4 rounded-xl">
                                            <p className="text-xs text-slate-600 mb-1">With 20% Down</p>
                                            <p className="text-2xl font-black text-emerald-600">$0</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-8 rounded-2xl border-2 border-purple-200 shadow-xl hover:shadow-2xl transition-all">
                            <div className="flex items-start gap-6">
                                <div className="w-16 h-16 bg-purple-600 text-white rounded-2xl flex items-center justify-center text-3xl font-black shadow-lg">3</div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-slate-900 text-2xl mb-3">Location Over Size</h4>
                                    <p className="text-slate-700 text-lg mb-4">
                                        You can renovate a house, but you can't change the neighborhood or commute.
                                    </p>
                                    <div className="bg-white p-4 rounded-xl">
                                        <p className="text-sm font-bold text-purple-800 mb-2">Worst house on best street &gt; Best house on worst street</p>
                                        <p className="text-xs text-slate-600">Good schools, low crime, rising values = better investment</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-8 rounded-2xl border-2 border-emerald-200 shadow-xl hover:shadow-2xl transition-all">
                            <div className="flex items-start gap-6">
                                <div className="w-16 h-16 bg-emerald-600 text-white rounded-2xl flex items-center justify-center text-3xl font-black shadow-lg">4</div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-slate-900 text-2xl mb-3">15-Year vs 30-Year Loan</h4>
                                    <p className="text-slate-700 text-lg mb-4">
                                        If you can afford it, 15-year saves $100k+ in interest and builds equity 2x faster.
                                    </p>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="bg-white p-4 rounded-xl border-2 border-rose-200">
                                            <p className="text-xs text-slate-600 mb-1">30-Year Total Interest</p>
                                            <p className="text-2xl font-black text-rose-600">$279,000</p>
                                        </div>
                                        <div className="bg-white p-4 rounded-xl border-2 border-emerald-200">
                                            <p className="text-xs text-slate-600 mb-1">15-Year Total Interest</p>
                                            <p className="text-2xl font-black text-emerald-600">$93,000</p>
                                        </div>
                                    </div>
                                    <p className="text-xs text-slate-600 mt-3 text-center font-semibold">💰 Save $186,000 over life of loan</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-8 rounded-2xl border-2 border-amber-200 shadow-xl hover:shadow-2xl transition-all">
                            <div className="flex items-start gap-6">
                                <div className="w-16 h-16 bg-amber-600 text-white rounded-2xl flex items-center justify-center text-3xl font-black shadow-lg">5</div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-slate-900 text-2xl mb-3">Get Pre-Approved First</h4>
                                    <p className="text-slate-700 text-lg mb-4">
                                        Pre-approval shows sellers you're serious and helps you negotiate better.
                                    </p>
                                    <div className="flex gap-3 flex-wrap">
                                        <span className="px-3 py-1 bg-white rounded-lg text-sm font-semibold text-amber-700">✓ Know your budget</span>
                                        <span className="px-3 py-1 bg-white rounded-lg text-sm font-semibold text-amber-700">✓ Stronger offer</span>
                                        <span className="px-3 py-1 bg-white rounded-lg text-sm font-semibold text-amber-700">✓ Close faster</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 rounded-2xl text-white shadow-2xl">
                        <h4 className="text-2xl font-black mb-4">💡 Bonus Wisdom</h4>
                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                            <div className="flex items-start gap-3">
                                <span className="text-2xl">📊</span>
                                <div>
                                    <p className="font-bold mb-1">Track Comps</p>
                                    <p className="text-indigo-100">Use Zillow/Redfin to see what similar homes sold for in last 6 months</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="text-2xl">🔍</span>
                                <div>
                                    <p className="font-bold mb-1">Inspection is Everything</p>
                                    <p className="text-indigo-100">$500 inspection can save you $50k in hidden repairs. Never waive it.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="text-2xl">⏰</span>
                                <div>
                                    <p className="font-bold mb-1">Buy in Winter</p>
                                    <p className="text-indigo-100">Less competition = better deals. Spring is peak seller's market.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="text-2xl">📝</span>
                                <div>
                                    <p className="font-bold mb-1">Read EVERYTHING</p>
                                    <p className="text-indigo-100">HOA rules, deed restrictions, property disclosures. No surprises.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* STEP 5: CALCULATOR */}
            {step === 5 && (
                <div className="space-y-6 animate-in fade-in duration-500">
                    <div className="text-center mb-6">
                        <h2 className="text-3xl font-bold text-slate-900 mb-2">Mortgage Calculator</h2>
                        <p className="text-slate-600">Know exactly what you can afford</p>

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
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Home Price</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                                        <input
                                            type="number"
                                            value={homePrice}
                                            onChange={(e) => setHomePrice(Number(e.target.value))}
                                            className="w-full pl-8 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-lg font-semibold"
                                        />
                                    </div>
                                    <input
                                        type="range"
                                        min="50000"
                                        max="1000000"
                                        step="5000"
                                        value={homePrice}
                                        onChange={(e) => setHomePrice(Number(e.target.value))}
                                        className="w-full mt-3 accent-indigo-600"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Down Payment ({downPaymentPercent}%) = ${Math.round(downPaymentAmount).toLocaleString()}
                                    </label>
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        step="1"
                                        value={downPaymentPercent}
                                        onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
                                        className="w-full accent-indigo-600"
                                    />
                                    {downPaymentPercent < 20 && (
                                        <p className="text-xs text-amber-700 mt-2 font-semibold">⚠️ Under 20% requires PMI (~${Math.round(monthlyPMI)}/mo)</p>
                                    )}
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
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Term</label>
                                        <select
                                            value={loanTerm}
                                            onChange={(e) => setLoanTerm(Number(e.target.value))}
                                            className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-semibold bg-white"
                                        >
                                            <option value="15">15 Years ⭐</option>
                                            <option value="30">30 Years</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Advanced Inputs */}
                                {calculatorMode === 'advanced' && (
                                    <div className="pt-4 border-t-2 border-slate-100 space-y-4">
                                        <h4 className="font-bold text-slate-900 flex items-center gap-2">
                                            <Sparkles size={18} className="text-indigo-600" />
                                            Additional Costs
                                        </h4>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-semibold text-slate-700 mb-1">Property Tax Rate (%)</label>
                                                <input
                                                    type="number"
                                                    step="0.1"
                                                    value={propertyTaxRate}
                                                    onChange={(e) => setPropertyTaxRate(Number(e.target.value))}
                                                    className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-slate-700 mb-1">Annual Insurance</label>
                                                <div className="relative">
                                                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                                                    <input
                                                        type="number"
                                                        value={homeInsuranceAnnual}
                                                        onChange={(e) => setHomeInsuranceAnnual(Number(e.target.value))}
                                                        className="w-full pl-6 pr-3 py-2 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-semibold text-slate-700 mb-1">HOA Monthly</label>
                                                <div className="relative">
                                                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                                                    <input
                                                        type="number"
                                                        value={hoaMonthly}
                                                        onChange={(e) => setHoaMonthly(Number(e.target.value))}
                                                        className="w-full pl-6 pr-3 py-2 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-slate-700 mb-1">Annual Maintenance</label>
                                                <div className="relative">
                                                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                                                    <input
                                                        type="number"
                                                        value={maintenanceBudget}
                                                        onChange={(e) => setMaintenanceBudget(Number(e.target.value))}
                                                        className="w-full pl-6 pr-3 py-2 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Results */}
                            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-6 rounded-2xl border-2 border-indigo-100 flex flex-col justify-between">
                                <div>
                                    <div className="text-center mb-6">
                                        <span className="block text-xs text-indigo-600 font-bold uppercase tracking-wider mb-2">
                                            Monthly Payment (PITI)
                                        </span>
                                        <div className="flex items-start justify-center gap-1">
                                            <span className="text-2xl text-indigo-400 font-bold mt-2">$</span>
                                            <span className="text-6xl font-black text-indigo-900 tracking-tight">
                                                {Math.round(totalMonthlyPayment).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center p-3 bg-white rounded-xl shadow-sm">
                                            <span className="text-sm font-medium text-slate-600">Principal & Interest</span>
                                            <span className="font-bold text-slate-900">${Math.round(monthlyPrincipalAndInterest).toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-3 bg-white rounded-xl shadow-sm">
                                            <span className="text-sm font-medium text-slate-600">Property Tax</span>
                                            <span className="font-bold text-slate-900">${Math.round(monthlyPropertyTax).toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-3 bg-white rounded-xl shadow-sm">
                                            <span className="text-sm font-medium text-slate-600">Insurance</span>
                                            <span className="font-bold text-slate-900">${Math.round(monthlyInsurance).toLocaleString()}</span>
                                        </div>
                                        {monthlyPMI > 0 && (
                                            <div className="flex justify-between items-center p-3 bg-white rounded-xl shadow-sm">
                                                <span className="text-sm font-medium text-slate-600">PMI</span>
                                                <span className="font-bold text-rose-600">${Math.round(monthlyPMI).toLocaleString()}</span>
                                            </div>
                                        )}

                                        {calculatorMode === 'advanced' && (
                                            <>
                                                {hoaMonthly > 0 && (
                                                    <div className="flex justify-between items-center p-3 bg-white rounded-xl shadow-sm">
                                                        <span className="text-sm font-medium text-slate-600">HOA</span>
                                                        <span className="font-bold text-slate-900">${hoaMonthly}</span>
                                                    </div>
                                                )}
                                                <div className="pt-3 border-t-2 border-indigo-200">
                                                    <div className="flex justify-between text-xs text-indigo-800 mb-2">
                                                        <span>+ Maintenance</span>
                                                        <span className="font-semibold">${Math.round(monthlyMaintenance)}</span>
                                                    </div>
                                                </div>
                                                <div className="flex justify-between items-center p-3 bg-indigo-900 rounded-xl shadow-lg">
                                                    <span className="text-sm font-bold text-white">Full Ownership Cost</span>
                                                    <span className="font-black text-xl text-white">${Math.round(totalWithMaintenance).toLocaleString()}</span>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Export */}
                        <div className="mt-6 pt-6 border-t-2 border-slate-100">
                            <button
                                onClick={handleExportData}
                                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl font-bold hover:from-indigo-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl"
                            >
                                <Download size={20} />
                                Export as PDF
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </ImmersionLayout>
    );
};

export default HomeImmersion;
