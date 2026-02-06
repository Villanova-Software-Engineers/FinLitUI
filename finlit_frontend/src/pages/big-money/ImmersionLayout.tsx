import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, CheckCircle, ArrowLeft, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface WizardLayoutProps {
    title: string;
    subtitle: string;
    currentStep: number;
    totalSteps: number;
    onNext: () => void;
    onBack: () => void;
    onFinish?: () => void;
    children: React.ReactNode;
    colorTheme: 'blue' | 'amber' | 'purple';
}

export const ImmersionLayout: React.FC<WizardLayoutProps> = ({
    title,
    subtitle,
    currentStep,
    totalSteps,
    onNext,
    onBack,
    onFinish,
    children,
    colorTheme
}) => {
    const navigate = useNavigate();

    // Scroll to top when step changes
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [currentStep]);

    const getThemeColors = () => {
        // Using indigo color scheme to match dashboard
        return {
            bg: 'bg-indigo-50',
            text: 'text-indigo-600',
            button: 'bg-indigo-600 hover:bg-indigo-700',
            border: 'border-indigo-200',
            progress: 'bg-indigo-600',
            lightBg: 'bg-indigo-100',
            darkText: 'text-indigo-900'
        };
    };

    const theme = getThemeColors();
    const progress = ((currentStep) / totalSteps) * 100;

    const handleFinish = () => {
        if (onFinish) {
            onFinish();
        } else {
            navigate('/dashboard');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Top Bar / Progress */}
            <div className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 transition-all group"
                        >
                            <Home size={18} className="group-hover:scale-110 transition-transform" />
                            <span className="text-sm font-semibold hidden sm:inline">Dashboard</span>
                        </button>
                        <div className="h-6 w-px bg-slate-200 hidden sm:block" />
                        <div>
                            <h1 className="text-base md:text-lg font-bold text-slate-900">{title}</h1>
                            <p className="text-xs text-slate-500 font-medium">Step {currentStep} of {totalSteps}</p>
                        </div>
                    </div>

                    <div className="flex-1 max-w-sm mx-4 md:mx-8">
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                            <motion.div
                                className={`h-full ${theme.progress} shadow-sm`}
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.5, ease: "easeOut" }}
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="hidden md:block text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full">
                            {Math.round(progress)}%
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 pt-6 pb-28 px-4 md:px-8 max-w-6xl mx-auto w-full mt-20">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        className="h-full"
                    >
                        {children}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Bottom Navigation */}
            <div className="fixed bottom-0 left-0 right-0 bg-white/95 border-t border-slate-200 shadow-lg backdrop-blur-md">
                <div className="max-w-6xl mx-auto px-4 py-4">
                    <div className="flex gap-3 w-full max-w-2xl mx-auto">
                        {currentStep > 1 && (
                            <button
                                onClick={onBack}
                                className="flex items-center justify-center gap-2 py-3 px-6 rounded-xl border-2 border-slate-200 text-slate-700 font-bold hover:bg-slate-50 hover:border-slate-300 active:scale-95 transition-all"
                            >
                                <ChevronLeft size={20} />
                                <span className="hidden sm:inline">Back</span>
                            </button>
                        )}
                        <button
                            onClick={currentStep === totalSteps ? handleFinish : onNext}
                            className={`flex-1 py-3 px-6 rounded-xl text-white font-bold shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 active:scale-95 transition-all flex items-center justify-center gap-2 ${theme.button}`}
                        >
                            {currentStep === totalSteps ? (
                                <>
                                    <CheckCircle size={20} />
                                    <span>Complete & Return Home</span>
                                </>
                            ) : (
                                <>
                                    <span>Continue</span>
                                    <ChevronRight size={20} />
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
