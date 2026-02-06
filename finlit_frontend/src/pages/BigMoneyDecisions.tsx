import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Car, GraduationCap, ArrowRight, TrendingUp, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const BigMoneyDecisions: React.FC = () => {
    const navigate = useNavigate();

    const modules = [
        {
            id: 'home',
            title: 'Buying a Home',
            description: "Master the 20% rule, debt ratios, and avoid money pits. Navigate mortgages like a pro.",
            icon: Home,
            color: 'from-indigo-500 to-blue-500',
            textColor: 'text-indigo-600',
            bg: 'bg-indigo-50',
            path: '/big-money-decisions/home'
        },
        {
            id: 'car',
            title: 'Buying a Car',
            description: "Beat depreciation and dealership tricks. Learn the 20/4/10 rule for smart auto purchases.",
            icon: Car,
            color: 'from-purple-500 to-indigo-500',
            textColor: 'text-purple-600',
            bg: 'bg-purple-50',
            path: '/big-money-decisions/car'
        },
        {
            id: 'college',
            title: 'Going to College',
            description: "Maximize ROI, minimize debt. Navigate student loans without bankrupting your future.",
            icon: GraduationCap,
            color: 'from-blue-500 to-cyan-500',
            textColor: 'text-blue-600',
            bg: 'bg-blue-50',
            path: '/big-money-decisions/college'
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-slate-50 p-6 md:p-12">
            <div className="max-w-6xl mx-auto">
                {/* Back Button */}
                <button
                    onClick={() => navigate('/dashboard')}
                    className="mb-8 flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-indigo-600 font-semibold rounded-lg hover:bg-white transition-all group"
                >
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    Back to Dashboard
                </button>

                {/* Header */}
                <div className="mb-12 text-center">
                    <div className="inline-block mb-4">
                        <div className="px-4 py-2 bg-gradient-to-r from-indigo-100 to-blue-100 rounded-full">
                            <span className="text-sm font-bold text-indigo-700 uppercase tracking-wider">Interactive Experiences</span>
                        </div>
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight">
                        Big Money <span className="bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">Decisions</span>
                    </h1>
                    <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                        Major life purchases can make or break your financial future. These interactive modules teach you to navigate them confidently.
                    </p>
                </div>

                {/* Cards */}
                <div className="grid md:grid-cols-3 gap-8 mb-12">
                    {modules.map((module, index) => {
                        const Icon = module.icon;
                        return (
                            <motion.div
                                key={module.title}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1, duration: 0.5 }}
                                onClick={() => navigate(module.path)}
                                className="group bg-white rounded-2xl p-8 shadow-lg border-2 border-slate-100 hover:shadow-2xl hover:border-indigo-200 hover:-translate-y-2 transition-all cursor-pointer relative overflow-hidden"
                            >
                                {/* Gradient Background */}
                                <div className={`absolute inset-0 bg-gradient-to-br ${module.color} opacity-0 group-hover:opacity-5 transition-opacity`} />

                                {/* Icon */}
                                <div className={`relative w-16 h-16 bg-gradient-to-br ${module.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all`}>
                                    <Icon size={32} className="text-white" />
                                </div>

                                {/* Content */}
                                <h3 className="relative text-2xl font-black text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors">
                                    {module.title}
                                </h3>
                                <p className="relative text-slate-600 mb-6 leading-relaxed">
                                    {module.description}
                                </p>

                                {/* CTA */}
                                <div className="relative flex items-center gap-2 font-bold text-indigo-600 group-hover:gap-4 transition-all">
                                    <span>Start Learning</span>
                                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Bottom Info */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-6 bg-white rounded-2xl border-2 border-indigo-100 shadow-lg">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-xl flex items-center justify-center">
                            <TrendingUp className="text-indigo-600" size={24} />
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-900">More Coming Soon</h4>
                            <p className="text-sm text-slate-600">Starting a Business • Major Purchases</p>
                        </div>
                    </div>
                    <div className="text-sm text-slate-500">
                        <span className="inline-flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-lg font-semibold">
                            ⚡ Interactive calculators included
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BigMoneyDecisions;

