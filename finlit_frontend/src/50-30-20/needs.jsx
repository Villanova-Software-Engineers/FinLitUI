import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const NeedsPage = () => {
    const navigate = useNavigate();
    const [expandedIndex, setExpandedIndex] = useState(null);

    const categoryKey = '50';
    const title = "Needs (50%)";
    const color = "#10b981";
    const icon = "🏠";
    const description = "Essential expenses you can't avoid";

    const items = [
        { name: 'Housing', description: 'Rent or mortgage payments', icon: '🏡', details: 'Aim to keep this under 25% of your take-home pay.' },
        { name: 'Utilities', description: 'Electricity, water, gas, internet', icon: '💡', details: 'Look for energy-efficient appliances to lower costs.' },
        { name: 'Groceries', description: 'Essential food and household items', icon: '🛒', details: 'Meal planning can significantly reduce food waste and costs.' },
        { name: 'Transportation', description: 'Car payment, gas, public transit', icon: '🚗', details: 'Consider carpooling or public transit to save on gas.' },
        { name: 'Insurance', description: 'Health, auto, home insurance', icon: '🛡️', details: 'Shop around annually to ensure you receive the best rate.' },
        { name: 'Healthcare', description: 'Medical expenses and prescriptions', icon: '⚕️', details: 'Preventive care often saves money in the long run.' }
    ];

    // Pie Chart Component - Memoized to prevent re-renders on item expansion
    const PieChart = useMemo(() => {
        const segments = [
            { percent: 50, color: "#10b981", label: 'Needs', key: '50' },
            { percent: 30, color: "#3b82f6", label: 'Wants', key: '30' },
            { percent: 20, color: "#8b5cf6", label: 'Savings', key: '20' }
        ];

        return (
            <div className="relative w-64 h-64 mx-auto my-8">
                {/* Pie slices */}
                <svg viewBox="0 0 100 100" className="transform -rotate-90">
                    {segments.map((seg, idx) => {
                        const prevPercents = segments.slice(0, idx).reduce((sum, s) => sum + s.percent, 0);
                        const startAngle = (prevPercents / 100) * 360;
                        const endAngle = ((prevPercents + seg.percent) / 100) * 360;

                        const startRad = (startAngle * Math.PI) / 180;
                        const endRad = (endAngle * Math.PI) / 180;

                        const x1 = 50 + 50 * Math.cos(startRad);
                        const y1 = 50 + 50 * Math.sin(startRad);
                        const x2 = 50 + 50 * Math.cos(endRad);
                        const y2 = 50 + 50 * Math.sin(endRad);

                        const largeArc = seg.percent > 50 ? 1 : 0;

                        return (
                            <path
                                key={idx}
                                d={`M 50 50 L ${x1} ${y1} A 50 50 0 ${largeArc} 1 ${x2} ${y2} Z`}
                                fill={seg.key === categoryKey ? seg.color : `${seg.color}44`}
                                stroke="#ffffff"
                                strokeWidth="2"
                            />
                        );
                    })}
                </svg>

                {/* Center circle */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-24 h-24 bg-white rounded-full shadow-lg flex items-center justify-center">
                        <span className="text-4xl">{icon}</span>
                    </div>
                </div>
            </div>
        );
    }, [categoryKey, icon]);

    return (
        <div className="min-h-screen p-6" style={{ background: 'linear-gradient(120deg, #e0f7fa 0%, #e8f5e9 50%, #e3f2fd 100%)' }}>
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <button onClick={() => navigate('/budgeting-basics')} className="px-4 py-2 rounded-lg border-2 border-blue-400 bg-white text-blue-600 hover:bg-blue-50">← Back</button>
                </div>

                <motion.h2 className="text-4xl font-bold mb-4 text-center text-gray-800" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <span className="text-5xl mr-3">{icon}</span>
                    {title}
                </motion.h2>
                <p className="text-center text-gray-600 mb-8 text-lg">{description}</p>

                {/* Pie Chart Section */}
                <motion.div
                    className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-8 max-w-md mx-auto"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    {PieChart}
                    <div className="flex justify-center gap-4 flex-wrap">
                        {[
                            { label: 'Needs', color: '#10b981', key: '50' },
                            { label: 'Wants', color: '#3b82f6', key: '30' },
                            { label: 'Savings', color: '#8b5cf6', key: '20' }
                        ].map((item) => (
                            <div key={item.key} className={`flex items-center gap-2 ${item.key === categoryKey ? 'opacity-100 font-bold' : 'opacity-50'}`}>
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                                <span className="text-sm text-gray-700">{item.label}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>

                <div className="grid gap-4 mb-8">
                    {items.map((item, idx) => (
                        <motion.div
                            key={idx}
                            className="p-5 bg-white rounded-xl shadow-md hover:shadow-lg transition cursor-pointer border-l-4"
                            style={{ borderLeftColor: color }}
                            onClick={() => setExpandedIndex(expandedIndex === idx ? null : idx)}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">{item.icon}</span>
                                        <div>
                                            <h4 className="font-bold text-gray-800">{item.name}</h4>
                                            <p className="text-sm text-gray-600">{item.description}</p>
                                        </div>
                                    </div>
                                    <motion.div
                                        animate={{ rotate: expandedIndex === idx ? 180 : 0 }}
                                        className="text-gray-400"
                                    >
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </motion.div>
                                </div>

                                <AnimatePresence>
                                    {expandedIndex === idx && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0, marginTop: 0 }}
                                            animate={{ height: 'auto', opacity: 1, marginTop: 16 }}
                                            exit={{ height: 0, opacity: 0, marginTop: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="pt-4 border-t border-gray-200/50">
                                                <p className="text-gray-700 mb-3 bg-white/50 p-3 rounded-lg text-sm leading-relaxed">
                                                    💡 <span className="font-semibold">Tip:</span> {item.details}
                                                </p>
                                                <div className="flex gap-2">
                                                    <span className="px-3 py-1 bg-white text-gray-600 border border-gray-200 rounded-full text-xs font-medium shadow-sm">
                                                        {categoryKey}% Category
                                                    </span>
                                                    <span className="px-3 py-1 bg-white text-gray-600 border border-gray-200 rounded-full text-xs font-medium shadow-sm">
                                                        Priority
                                                    </span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        );
};

export default NeedsPage;
