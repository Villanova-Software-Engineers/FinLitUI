import React, { useState } from 'react';
import { ImmersionLayout } from './ImmersionLayout';
import { Car, Info, AlertTriangle, CheckCircle, Calculator, TrendingDown, DollarSign, Shield, Download, Sparkles, Zap, FileText, Fuel, Wrench } from 'lucide-react';

const CarImmersion = () => {
    const [step, setStep] = useState(1);
    const totalSteps = 5;

    const next = () => setStep(s => Math.min(s + 1, totalSteps));
    const back = () => setStep(s => Math.max(s - 1, 1));

    // Calculator State with Insurance
    const [calculatorMode, setCalculatorMode] = useState<'basic' | 'advanced'>('basic');
    const [carPrice, setCarPrice] = useState(35000);
    const [tradeIn, setTradeIn] = useState(5000);
    const [downPayment, setDownPayment] = useState(7000);
    const [interestRate, setInterestRate] = useState(7.5);
    const [loanTerm, setLoanTerm] = useState(60);

    // Advanced mode - Insurance & Ongoing Costs
    const [monthlyInsurance, setMonthlyInsurance] = useState(150);
    const [monthlyGas, setMonthlyGas] = useState(200);
    const [annualMaintenance, setAnnualMaintenance] = useState(1200);
    const [annualRegistration, setAnnualRegistration] = useState(150);

    // Calculations
    const taxableAmount = Math.max(0, carPrice - tradeIn);
    const salesTax = taxableAmount * 0.07;
    const loanAmount = Math.max(0, taxableAmount + salesTax - downPayment);
    const monthlyRate = interestRate / 100 / 12;

    const monthlyPayment = loanAmount > 0
        ? (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, loanTerm)) /
        (Math.pow(1 + monthlyRate, loanTerm) - 1)
        : 0;

    const totalInterest = (monthlyPayment * loanTerm) - loanAmount;
    const monthlyMaintenanceCost = annualMaintenance / 12;
    const monthlyRegistrationCost = annualRegistration / 12;
    const totalMonthlyCost = monthlyPayment + monthlyInsurance + monthlyGas + monthlyMaintenanceCost + monthlyRegistrationCost;

    // Export Function
    const handleExportData = () => {
        // Create printable HTML for PDF export
        const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Car Purchase Analysis</title>
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
    <h1>🚗 Car Purchase Analysis</h1>
    <p class="date">Generated on ${new Date().toLocaleDateString()}</p>

    <div class="section">
        <h2>Purchase Details</h2>
        <div class="row"><span class="label">Car Price</span><span class="value">$${carPrice.toLocaleString()}</span></div>
        <div class="row"><span class="label">Trade-in Value</span><span class="value">$${tradeIn.toLocaleString()}</span></div>
        <div class="row"><span class="label">Down Payment</span><span class="value">$${downPayment.toLocaleString()}</span></div>
        <div class="row"><span class="label">Interest Rate</span><span class="value">${interestRate}%</span></div>
        <div class="row"><span class="label">Loan Term</span><span class="value">${loanTerm} months</span></div>
    </div>

    <div class="highlight">
        <div style="font-size: 14px; margin-bottom: 8px;">Monthly Loan Payment</div>
        <div class="big">$${Math.round(monthlyPayment).toLocaleString()}</div>
    </div>

    <div class="section">
        <h2>Loan Analysis</h2>
        <div class="row"><span class="label">Loan Amount</span><span class="value">$${Math.round(loanAmount).toLocaleString()}</span></div>
        <div class="row"><span class="label">Total Interest Paid</span><span class="value" style="color: #dc2626;">$${Math.round(totalInterest).toLocaleString()}</span></div>
        <div class="row"><span class="label">Total Amount Paid</span><span class="value">$${Math.round(monthlyPayment * loanTerm + downPayment).toLocaleString()}</span></div>
    </div>

    ${calculatorMode === 'advanced' ? `
    <div class="section">
        <h2>Full Monthly Cost Breakdown</h2>
        <div class="row"><span class="label">Loan Payment</span><span class="value">$${Math.round(monthlyPayment).toLocaleString()}</span></div>
        <div class="row"><span class="label">Insurance</span><span class="value">$${monthlyInsurance}</span></div>
        <div class="row"><span class="label">Gas</span><span class="value">$${monthlyGas}</span></div>
        <div class="row"><span class="label">Maintenance</span><span class="value">$${Math.round(monthlyMaintenanceCost)}</span></div>
        <div class="row"><span class="label">Registration</span><span class="value">$${Math.round(monthlyRegistrationCost)}</span></div>
        <div class="row" style="background: #4f46e5; color: white; padding: 12px; margin-top: 8px; border-radius: 8px;">
            <span style="font-weight: 700;">TOTAL MONTHLY COST</span>
            <span style="font-weight: 800; font-size: 18px;">$${Math.round(totalMonthlyCost).toLocaleString()}</span>
        </div>
    </div>
    ` : ''}

    ${loanTerm > 48 ? `
    <div class="section warning">
        <h2>⚠️ Warning</h2>
        <p style="margin: 0;">A ${loanTerm}-month term increases your risk of being underwater (owing more than the car is worth).</p>
    </div>
    ` : ''}

    <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #e2e8f0; text-align: center; color: #94a3b8; font-size: 12px;">
        Generated by FinLit - Financial Literacy Platform
    </div>
</body>
</html>`;

        // Create blob and trigger download
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `car-analysis-${Date.now()}.html`;
        link.click();

        // Open in new window for printing
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
            title="Buying a Car"
            subtitle="Freedom without the financial flat tire"
            currentStep={step}
            totalSteps={totalSteps}
            onNext={next}
            onBack={back}
            colorTheme="amber"
        >
            {/* STEP 1: DEPRECIATION */}
            {step === 1 && (
                <div className="space-y-8 animate-in fade-in duration-500">
                    <div className="text-center max-w-2xl mx-auto">
                        <div className="w-16 h-16 bg-gradient-to-br from-rose-100 to-orange-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                            <TrendingDown size={32} strokeWidth={2.5} />
                        </div>
                        <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">The Silent Wealth Killer</h2>
                        <p className="text-xl text-slate-600 leading-relaxed">
                            Cars are not investments. They are <span className="font-bold text-rose-600">depreciating assets</span> that lose value faster than almost anything else you own.
                        </p>
                    </div>

                    <div className="bg-white p-8 rounded-3xl shadow-xl border-2 border-slate-100">
                        <div className="grid md:grid-cols-2 gap-8 items-center">
                            <div className="space-y-6">
                                <h3 className="text-3xl font-bold text-slate-900">The 60-Second Drop</h3>
                                <p className="text-lg text-slate-700 leading-relaxed">
                                    A new car loses <strong className="text-rose-600 text-2xl">10%</strong> of its value the moment you drive it off the lot. By the end of year one, it's down <strong className="text-rose-600">20%</strong>. By year five? It's worth only <strong className="text-rose-600">40%</strong> of what you paid.
                                </p>
                                <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-6 rounded-2xl border-2 border-indigo-100">
                                    <div className="flex items-start gap-3">
                                        <Sparkles className="text-indigo-600 mt-1" size={24} />
                                        <div>
                                            <h4 className="font-bold text-indigo-900 text-lg mb-2">The Smart Move</h4>
                                            <p className="text-indigo-800 text-sm leading-relaxed">
                                                Let someone else take the hit. Buy a <strong>2-3 year old certified pre-owned</strong> car and save 30-40% off the sticker price while still getting warranty coverage.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-center">
                                <div className="w-full max-w-sm bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-8 border-2 border-slate-200 shadow-xl">
                                    <div className="text-center space-y-4">
                                        <div className="text-sm font-bold text-slate-500 uppercase tracking-wider">New Car Price</div>
                                        <div className="text-4xl font-black text-slate-800 line-through decoration-rose-500 decoration-4">$40,000</div>
                                        <div className="py-4">
                                            <div className="text-sm text-slate-500 mb-2">After 3 Years</div>
                                            <div className="text-5xl font-black bg-gradient-to-r from-rose-600 to-orange-600 bg-clip-text text-transparent">$24,000</div>
                                        </div>
                                        <div className="pt-4 border-t-2 border-rose-200">
                                            <div className="inline-flex items-center gap-2 bg-rose-100 px-4 py-2 rounded-full">
                                                <AlertTriangle size={16} className="text-rose-600" />
                                                <span className="text-rose-700 font-bold text-sm">-$16,000 Lost</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* STEP 2: INSURANCE & HIDDEN COSTS */}
            {step === 2 && (
                <div className="space-y-8 animate-in fade-in duration-500">
                    <div className="text-center max-w-2xl mx-auto">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                            <Shield size={32} strokeWidth={2.5} />
                        </div>
                        <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">The Hidden Monthly Drain</h2>
                        <p className="text-xl text-slate-600 leading-relaxed">
                            The sticker price is just the beginning. Insurance, gas, maintenance, and registration add <span className="font-bold text-indigo-600">hundreds per month</span> to your real cost.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-blue-100 hover:shadow-xl transition-all">
                            <div className="flex items-start gap-4 mb-4">
                                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                    <Shield size={24} className="text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 text-lg">Car Insurance</h3>
                                    <p className="text-sm text-slate-600">$100-$300+/month</p>
                                </div>
                            </div>
                            <p className="text-slate-700 text-sm mb-4 leading-relaxed">
                                Required by law if you have a loan. Factors: age, location, driving record, and car value. Young drivers (16-25) pay the most. Comprehensive + collision is mandatory for financed cars.
                            </p>
                            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                                <p className="text-xs text-blue-900 font-semibold">💡 Pro Tip: Increase your deductible to $1,000 to lower monthly premiums by 30-40%.</p>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-emerald-100 hover:shadow-xl transition-all">
                            <div className="flex items-start gap-4 mb-4">
                                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                                    <Fuel size={24} className="text-emerald-600" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 text-lg">Gas & Fuel</h3>
                                    <p className="text-sm text-slate-600">$150-$400/month</p>
                                </div>
                            </div>
                            <p className="text-slate-700 text-sm mb-4 leading-relaxed">
                                Varies by commute distance and fuel efficiency. A 30-mile daily commute in a 25 MPG car costs ~$200/month at current gas prices. Hybrids and EVs can cut this in half.
                            </p>
                            <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                                <p className="text-xs text-emerald-900 font-semibold">💡 Pro Tip: Calculate $0.15/mile for gas to estimate your monthly cost.</p>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-amber-100 hover:shadow-xl transition-all">
                            <div className="flex items-start gap-4 mb-4">
                                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                                    <Wrench size={24} className="text-amber-600" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 text-lg">Maintenance & Repairs</h3>
                                    <p className="text-sm text-slate-600">$800-$1,500/year</p>
                                </div>
                            </div>
                            <p className="text-slate-700 text-sm mb-4 leading-relaxed">
                                Oil changes every 5,000 miles ($50), tire rotations ($40), brake pads ($300), new tires every 3-5 years ($600-$1,000). Luxury cars cost 2-3x more to maintain.
                            </p>
                            <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
                                <p className="text-xs text-amber-900 font-semibold">💡 Pro Tip: Budget $100/month for maintenance to avoid surprise bills.</p>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-purple-100 hover:shadow-xl transition-all">
                            <div className="flex items-start gap-4 mb-4">
                                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                                    <FileText size={24} className="text-purple-600" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 text-lg">Registration & Fees</h3>
                                    <p className="text-sm text-slate-600">$50-$500/year</p>
                                </div>
                            </div>
                            <p className="text-slate-700 text-sm mb-4 leading-relaxed">
                                Annual registration fees vary by state and car value. Some states (like California) charge based on purchase price. Don't forget inspection fees, emission tests, and title transfers.
                            </p>
                            <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                                <p className="text-xs text-purple-900 font-semibold">💡 Pro Tip: First-year registration is usually the highest (includes title fee).</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-rose-50 to-orange-50 p-8 rounded-2xl border-2 border-rose-200 text-center">
                        <h4 className="text-2xl font-black text-rose-900 mb-3">The Real Monthly Cost</h4>
                        <p className="text-rose-700 text-lg">
                            A $35,000 car doesn't cost $500/month. With insurance, gas, and maintenance, you're looking at <strong className="text-2xl">$800-$1,000+/month</strong>. Plan accordingly.
                        </p>
                    </div>
                </div>
            )}

            {/* STEP 3: DEALERSHIP TRAPS */}
            {step === 3 && (
                <div className="space-y-8 animate-in fade-in duration-500">
                    <div className="text-center max-w-2xl mx-auto mb-12">
                        <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Don't Get Played</h2>
                        <p className="text-lg text-slate-600">
                            Know the tricks before you walk into the dealership
                        </p>
                    </div>

                    {/* Visual Grid of Traps */}
                    <div className="grid md:grid-cols-2 gap-6 mb-10">
                        <div className="bg-gradient-to-br from-rose-50 to-red-50 p-6 rounded-2xl border-2 border-rose-200 hover:shadow-xl transition-all">
                            <div className="text-5xl font-black text-rose-300 mb-3">84 Months</div>
                            <h3 className="font-bold text-slate-900 mb-3 text-xl">The Long Loan Trap</h3>
                            <p className="text-slate-700 mb-4 leading-relaxed">
                                Dealerships love to sell you on a low monthly payment by stretching your loan to 72 or 84 months (6-7 years). This puts you underwater for years, meaning you owe more than the car is worth. If you need to sell or trade it in, you will still owe thousands even after the sale. Cars depreciate faster than you pay down the loan on these extended terms.
                            </p>
                            <div className="bg-white/80 px-4 py-3 rounded-lg border-l-4 border-rose-500">
                                <p className="text-sm font-bold text-rose-700 mb-1">The Rule:</p>
                                <p className="text-xs text-rose-600">Never finance a car for more than 48 months (4 years). If you cannot afford the payment at 48 months, you are buying too much car.</p>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-6 rounded-2xl border-2 border-orange-200 hover:shadow-xl transition-all">
                            <div className="text-5xl font-black text-orange-300 mb-3">2 → 1</div>
                            <h3 className="font-bold text-slate-900 mb-3 text-xl">Negative Equity Rollover</h3>
                            <p className="text-slate-700 mb-4 leading-relaxed">
                                If you still owe money on your current car (you are upside down), the dealer will offer to roll that debt into your new loan. This seems convenient but is financial poison. You will be paying for two cars while only driving one, starting your new loan thousands of dollars underwater before you even drive off the lot.
                            </p>
                            <div className="bg-white/80 px-4 py-3 rounded-lg border-l-4 border-orange-500">
                                <p className="text-sm font-bold text-orange-700 mb-1">The Rule:</p>
                                <p className="text-xs text-orange-600">Pay off your current car first, or wait until you have positive equity before trading it in. Never roll negative equity into a new loan—it is a debt trap.</p>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-amber-50 to-yellow-50 p-6 rounded-2xl border-2 border-amber-200 hover:shadow-xl transition-all">
                            <div className="text-5xl font-black text-amber-300 mb-3">$$$</div>
                            <h3 className="font-bold text-slate-900 mb-3 text-xl">Finance and Insurance (F&I) Add-Ons</h3>
                            <p className="text-slate-700 mb-4 leading-relaxed">
                                After negotiating the car price, you will meet with the finance manager who will try to sell you extended warranties, gap insurance, paint protection, fabric protection, VIN etching, and more. These add-ons can cost $3,000-5,000 and provide minimal value. Extended warranties rarely pay for themselves, and paint/fabric protection you can do yourself for $50.
                            </p>
                            <div className="bg-white/80 px-4 py-3 rounded-lg border-l-4 border-amber-500">
                                <p className="text-sm font-bold text-amber-700 mb-1">The Rule:</p>
                                <p className="text-xs text-amber-600">Politely decline all F&I add-ons. If the finance manager pressures you, remember that you can walk away. The only exception is gap insurance if you are putting less than 20% down on a new car.</p>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-6 rounded-2xl border-2 border-purple-200 hover:shadow-xl transition-all">
                            <div className="text-5xl font-black text-purple-300 mb-3">4□</div>
                            <h3 className="font-bold text-slate-900 mb-3 text-xl">The Four-Square Trick</h3>
                            <p className="text-slate-700 mb-4 leading-relaxed">
                                Some dealers use a worksheet divided into four squares: car price, trade-in value, down payment, and monthly payment. They shuffle numbers between the squares to confuse you and hide where they are making their profit. They might give you a great trade-in value but inflate the car price, or lower your monthly payment by extending the loan term. This tactic makes it impossible to know if you are getting a fair deal.
                            </p>
                            <div className="bg-white/80 px-4 py-3 rounded-lg border-l-4 border-purple-500">
                                <p className="text-sm font-bold text-purple-700 mb-1">The Rule:</p>
                                <p className="text-xs text-purple-600">Negotiate only the "out the door" total price of the vehicle—the final amount you will pay including all taxes and fees. Handle trade-in and financing separately.</p>
                            </div>
                        </div>
                    </div>

                    {/* Win Strategy - Cleaner */}
                    <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-8 rounded-2xl text-white shadow-2xl">
                        <h3 className="text-2xl font-black mb-6">How to Win 🎯</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="flex gap-3">
                                <div className="text-2xl">1️⃣</div>
                                <div>
                                    <p className="font-bold mb-1">Get Pre-Approved</p>
                                    <p className="text-sm text-indigo-100">Credit union rates beat dealer rates</p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <div className="text-2xl">2️⃣</div>
                                <div>
                                    <p className="font-bold mb-1">Negotiate Total Price</p>
                                    <p className="text-sm text-indigo-100">Not monthly payment</p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <div className="text-2xl">3️⃣</div>
                                <div>
                                    <p className="font-bold mb-1">Refuse Add-Ons</p>
                                    <p className="text-sm text-indigo-100">Extended warranties rarely pay off</p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <div className="text-2xl">4️⃣</div>
                                <div>
                                    <p className="font-bold mb-1">Walk Away Ready</p>
                                    <p className="text-sm text-indigo-100">Best negotiation tool you have</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* STEP 4: THE 20/4/10 RULE */}
            {step === 4 && (
                <div className="space-y-8 animate-in fade-in duration-500">
                    <div className="text-center max-w-2xl mx-auto">
                        <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-blue-100 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                            <Info size={32} strokeWidth={2.5} />
                        </div>
                        <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">The 20/4/10 Rule</h2>
                        <p className="text-xl text-slate-600 leading-relaxed">
                            The gold standard for buying a car responsibly. If you can't meet these numbers, <span className="font-bold text-indigo-600">you're buying too much car</span>.
                        </p>
                    </div>

                    <div className="grid gap-6">
                        <div className="bg-white p-8 rounded-2xl border-2 border-indigo-100 shadow-xl hover:shadow-2xl transition-all">
                            <div className="flex items-center gap-6">
                                <div className="text-7xl font-black text-indigo-200">20</div>
                                <div className="flex-1">
                                    <h4 className="text-2xl font-bold text-slate-900 mb-2">20% Down Payment</h4>
                                    <p className="text-slate-600 text-lg leading-relaxed">
                                        This covers that brutal first-year depreciation, so you're never "underwater" (owing more than the car is worth). It also lowers your monthly payment and total interest paid.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-8 rounded-2xl border-2 border-blue-100 shadow-xl hover:shadow-2xl transition-all">
                            <div className="flex items-center gap-6">
                                <div className="text-7xl font-black text-blue-200">4</div>
                                <div className="flex-1">
                                    <h4 className="text-2xl font-bold text-slate-900 mb-2">4 Years Maximum</h4>
                                    <p className="text-slate-600 text-lg leading-relaxed">
                                        Never finance for more than 48 months. Car loans shouldn't feel like mortgages. Longer terms = more interest + being underwater longer. If you can't afford a 4-year payment, buy a cheaper car.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-8 rounded-2xl border-2 border-purple-100 shadow-xl hover:shadow-2xl transition-all">
                            <div className="flex items-center gap-6">
                                <div className="text-7xl font-black text-purple-200">10</div>
                                <div className="flex-1">
                                    <h4 className="text-2xl font-bold text-slate-900 mb-2">10% of Gross Income</h4>
                                    <p className="text-slate-600 text-lg leading-relaxed">
                                        <strong>Total monthly car costs</strong> (payment + insurance + gas + maintenance) should stay under 10% of your gross monthly income. Make $60k/year? That's $5k/month gross = max $500/month total car cost.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-2xl text-white shadow-2xl">
                        <h4 className="text-2xl font-bold mb-4 flex items-center gap-3">
                            <Zap className="text-yellow-400" size={28} />
                            Real-World Example
                        </h4>
                        <div className="grid md:grid-cols-2 gap-6 text-sm">
                            <div>
                                <p className="text-slate-300 mb-2">Annual Income: <strong className="text-white">$60,000</strong></p>
                                <p className="text-slate-300 mb-2">Gross Monthly: <strong className="text-white">$5,000</strong></p>
                                <p className="text-slate-300 mb-2">10% Budget: <strong className="text-emerald-400 text-lg">$500/month</strong></p>
                            </div>
                            <div>
                                <p className="text-slate-300 mb-1">Breakdown:</p>
                                <p className="text-sm text-slate-400">• Loan Payment: $280</p>
                                <p className="text-sm text-slate-400">• Insurance: $120</p>
                                <p className="text-sm text-slate-400">• Gas: $80</p>
                                <p className="text-sm text-slate-400">• Maintenance: $20</p>
                                <p className="text-emerald-400 font-bold mt-2">= $500 Total ✓</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* STEP 5: ADVANCED CALCULATOR */}
            {step === 5 && (
                <div className="space-y-6 animate-in fade-in duration-500">
                    <div className="text-center mb-6">
                        <h2 className="text-3xl font-bold text-slate-900 mb-2">Auto Loan Calculator</h2>
                        <p className="text-slate-600">See the true cost of car ownership</p>

                        {/* Mode Toggle */}
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
                                <h3 className="font-bold text-slate-900 text-lg mb-4">Purchase Details</h3>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Car Price</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                                        <input
                                            type="number"
                                            value={carPrice}
                                            onChange={(e) => setCarPrice(Number(e.target.value))}
                                            className="w-full pl-8 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-lg font-semibold"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Trade-in Value</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                                            <input
                                                type="number"
                                                value={tradeIn}
                                                onChange={(e) => setTradeIn(Number(e.target.value))}
                                                className="w-full pl-8 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Down Payment</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                                            <input
                                                type="number"
                                                value={downPayment}
                                                onChange={(e) => setDownPayment(Number(e.target.value))}
                                                className="w-full pl-8 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                            />
                                        </div>
                                    </div>
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
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Term (Months)</label>
                                        <select
                                            value={loanTerm}
                                            onChange={(e) => setLoanTerm(Number(e.target.value))}
                                            className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-semibold bg-white"
                                        >
                                            <option value="36">36 Months</option>
                                            <option value="48">48 Months ⭐</option>
                                            <option value="60">60 Months</option>
                                            <option value="72">72 Months</option>
                                            <option value="84">84 Months ⚠️</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Advanced Mode Inputs */}
                                {calculatorMode === 'advanced' && (
                                    <div className="pt-4 border-t-2 border-slate-100 space-y-4">
                                        <h4 className="font-bold text-slate-900 flex items-center gap-2">
                                            <Sparkles size={18} className="text-indigo-600" />
                                            Ongoing Costs
                                        </h4>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-semibold text-slate-700 mb-1">Monthly Insurance</label>
                                                <div className="relative">
                                                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                                                    <input
                                                        type="number"
                                                        value={monthlyInsurance}
                                                        onChange={(e) => setMonthlyInsurance(Number(e.target.value))}
                                                        className="w-full pl-6 pr-3 py-2 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-slate-700 mb-1">Monthly Gas</label>
                                                <div className="relative">
                                                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                                                    <input
                                                        type="number"
                                                        value={monthlyGas}
                                                        onChange={(e) => setMonthlyGas(Number(e.target.value))}
                                                        className="w-full pl-6 pr-3 py-2 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-semibold text-slate-700 mb-1">Annual Maintenance</label>
                                                <div className="relative">
                                                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                                                    <input
                                                        type="number"
                                                        value={annualMaintenance}
                                                        onChange={(e) => setAnnualMaintenance(Number(e.target.value))}
                                                        className="w-full pl-6 pr-3 py-2 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-slate-700 mb-1">Annual Registration</label>
                                                <div className="relative">
                                                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                                                    <input
                                                        type="number"
                                                        value={annualRegistration}
                                                        onChange={(e) => setAnnualRegistration(Number(e.target.value))}
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
                                        <span className="block text-xs text-indigo-600 font-bold uppercase tracking-wider mb-2">Monthly Loan Payment</span>
                                        <div className="flex items-start justify-center gap-1">
                                            <span className="text-2xl text-indigo-400 font-bold mt-2">$</span>
                                            <span className="text-6xl font-black text-indigo-900 tracking-tight">{Math.round(monthlyPayment).toLocaleString()}</span>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center p-3 bg-white rounded-xl shadow-sm">
                                            <span className="text-sm font-medium text-slate-600">Loan Amount</span>
                                            <span className="font-bold text-slate-900">${Math.round(loanAmount).toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-3 bg-white rounded-xl shadow-sm">
                                            <span className="text-sm font-medium text-slate-600">Total Interest</span>
                                            <span className="font-bold text-rose-600">${Math.round(totalInterest).toLocaleString()}</span>
                                        </div>

                                        {calculatorMode === 'advanced' && (
                                            <>
                                                <div className="pt-3 border-t-2 border-indigo-200">
                                                    <p className="text-xs font-bold text-indigo-900 mb-2 uppercase">Full Monthly Cost</p>
                                                    <div className="space-y-2">
                                                        <div className="flex justify-between text-xs text-indigo-800">
                                                            <span>Loan Payment</span>
                                                            <span className="font-semibold">${Math.round(monthlyPayment)}</span>
                                                        </div>
                                                        <div className="flex justify-between text-xs text-indigo-800">
                                                            <span>Insurance</span>
                                                            <span className="font-semibold">${monthlyInsurance}</span>
                                                        </div>
                                                        <div className="flex justify-between text-xs text-indigo-800">
                                                            <span>Gas</span>
                                                            <span className="font-semibold">${monthlyGas}</span>
                                                        </div>
                                                        <div className="flex justify-between text-xs text-indigo-800">
                                                            <span>Maintenance</span>
                                                            <span className="font-semibold">${Math.round(monthlyMaintenanceCost)}</span>
                                                        </div>
                                                        <div className="flex justify-between text-xs text-indigo-800">
                                                            <span>Registration</span>
                                                            <span className="font-semibold">${Math.round(monthlyRegistrationCost)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex justify-between items-center p-3 bg-indigo-900 rounded-xl shadow-lg">
                                                    <span className="text-sm font-bold text-white">Total Monthly Cost</span>
                                                    <span className="font-black text-xl text-white">${Math.round(totalMonthlyCost).toLocaleString()}</span>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {loanTerm > 48 && (
                                    <div className="mt-4 p-3 bg-amber-100 rounded-xl flex gap-3 items-start border-2 border-amber-200">
                                        <AlertTriangle className="text-amber-700 shrink-0 mt-0.5" size={18} />
                                        <p className="text-xs text-amber-900 font-semibold">
                                            Warning: A {loanTerm}-month term increases your risk of being underwater!
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Export Button */}
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

export default CarImmersion;
