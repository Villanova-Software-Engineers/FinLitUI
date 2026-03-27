import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Check,
  Menu,
  X,
  Play
} from 'lucide-react';
import FinancialBallGame from '../components/FinancialBallGame';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [showGame, setShowGame] = useState(true);

  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-brand-50/30">
      {/* Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-4 left-4 right-4 z-50 bg-white/90 backdrop-blur-xl rounded-3xl shadow-lg border border-gray-200"
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <motion.div
              className="cursor-pointer flex-shrink-0"
              whileHover={{ scale: 1.05 }}
              onClick={() => navigate('/dashboard')}
            >
              <span className="text-2xl font-bold bg-gradient-to-r from-navy-700 to-brand-600 bg-clip-text text-transparent">
                FinLit
              </span>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6 flex-1 justify-center">
              <a href="#home" className="text-navy-700 hover:text-brand-500 transition-colors duration-200 font-medium cursor-pointer">
                Home
              </a>
              <a href="#features" className="text-navy-700 hover:text-brand-500 transition-colors duration-200 font-medium cursor-pointer">
                Features
              </a>
              <a href="#how-it-works" className="text-navy-700 hover:text-brand-500 transition-colors duration-200 font-medium cursor-pointer">
                How It Works
              </a>
              <a onClick={() => navigate('/about')} className="text-navy-700 hover:text-brand-500 transition-colors duration-200 font-medium cursor-pointer">
                About Us
              </a>
              <a onClick={() => navigate('/schools')} className="text-navy-700 hover:text-brand-500 transition-colors duration-200 font-medium cursor-pointer">
                For Schools
              </a>
            </div>

            {/* Auth Button - Combined */}
            <div className="hidden md:flex items-center flex-shrink-0">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 10px 30px -10px rgba(66, 42, 251, 0.5)" }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/auth')}
                className="px-6 py-2.5 bg-gradient-to-r from-brand-500 to-brand-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer"
              >
                Get Started
              </motion.button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-brand-600 cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden pt-4 pb-2 border-t border-gray-200 mt-4"
            >
              <div className="flex flex-col gap-3">
                <a href="#home" className="text-navy-700 hover:text-brand-500 py-2 cursor-pointer">Home</a>
                <a href="#features" className="text-navy-700 hover:text-brand-500 py-2 cursor-pointer">Features</a>
                <a href="#how-it-works" className="text-navy-700 hover:text-brand-500 py-2 cursor-pointer">How It Works</a>
                <a onClick={() => navigate('/about')} className="text-navy-700 hover:text-brand-500 py-2 cursor-pointer">About Us</a>
                <a onClick={() => navigate('/schools')} className="text-navy-700 hover:text-brand-500 py-2 cursor-pointer">For Schools</a>
                <div className="pt-2 border-t border-gray-200">
                  <button onClick={() => navigate('/auth')} className="w-full px-6 py-2.5 bg-gradient-to-r from-brand-500 to-brand-600 text-white font-semibold rounded-xl cursor-pointer">
                    Get Started
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section id="home" className="relative min-h-screen flex items-center justify-center pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="initial"
            animate="animate"
            variants={staggerContainer}
            className="text-center max-w-4xl mx-auto space-y-8"
          >
            <motion.h1
              variants={fadeInUp}
              className="text-5xl md:text-6xl lg:text-7xl font-bold text-navy-800 leading-tight"
            >
              Learn Financial Skills{' '}
              <span className="bg-gradient-to-r from-brand-500 to-brand-600 bg-clip-text text-transparent">
                Through Games
              </span>
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="text-xl md:text-2xl text-slate-600 leading-relaxed"
            >
              Master budgeting, investing, and financial planning through interactive lessons, quizzes, and real-world scenarios.
            </motion.p>

            <motion.div variants={fadeInUp} className="flex flex-wrap gap-4 justify-center pt-4">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 20px 40px -10px rgba(66, 42, 251, 0.5)" }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/auth')}
                className="px-8 py-4 bg-gradient-to-r from-brand-500 to-brand-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-200 flex items-center gap-2 cursor-pointer"
              >
                Start Learning Now
                <ArrowRight className="w-5 h-5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setVideoModalOpen(true)}
                className="px-8 py-4 bg-white border-2 border-brand-200 text-brand-700 font-bold rounded-2xl hover:bg-brand-50 transition-all duration-200 flex items-center gap-2 cursor-pointer"
              >
                <Play className="w-5 h-5" />
                Watch Demo
              </motion.button>
            </motion.div>

            {/* Stats */}
            <motion.div variants={fadeInUp} className="grid grid-cols-3 gap-8 pt-12 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-4xl font-bold bg-gradient-to-r from-brand-500 to-brand-600 bg-clip-text text-transparent">23</div>
                <div className="text-slate-600 mt-2">Modules</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold bg-gradient-to-r from-brand-500 to-brand-600 bg-clip-text text-transparent">150+</div>
                <div className="text-slate-600 mt-2">Lessons</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold bg-gradient-to-r from-brand-500 to-brand-600 bg-clip-text text-transparent">5+</div>
                <div className="text-slate-600 mt-2">Games</div>
              </div>
            </motion.div>

            {/* Mini Game */}
            {showGame && (
              <motion.div
                variants={fadeInUp}
                className="mt-12 max-w-3xl mx-auto"
              >
                <FinancialBallGame onClose={() => setShowGame(false)} />
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      {/* What We Offer - 3 Cards Only */}
      <section className="py-20 px-6 bg-gradient-to-br from-brand-50/40 via-purple-50/30 to-indigo-50/40 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-navy-800 mb-6">
              Everything You Need to{' '}
              <span className="bg-gradient-to-r from-brand-500 to-brand-600 bg-clip-text text-transparent">
                Master Money
              </span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              From basic budgeting to advanced investing strategies, learn it all through our gamified platform.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                title: "Gamified Learning",
                description: "Earn points, unlock badges, and track your progress as you master each topic.",
                gradient: "from-emerald-600 via-emerald-700 to-teal-800"
              },
              {
                title: "Real-World Case Studies",
                description: "Learn from Warren Buffett and other successful investors' proven strategies.",
                gradient: "from-green-600 via-green-700 to-emerald-800"
              },
              {
                title: "Financial Tools",
                description: "Access calculators, budgeting tools, and investment trackers.",
                gradient: "from-teal-600 via-cyan-700 to-teal-800"
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                className="group cursor-pointer"
              >
                <div className={`relative bg-gradient-to-br ${item.gradient} rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300`}>
                  {/* Decorative blob */}
                  <div className="absolute -top-4 -right-4 w-20 h-20 bg-white/20 rounded-full blur-2xl"></div>

                  {/* Content */}
                  <h3 className="text-2xl font-bold text-white mb-4 relative z-10">{item.title}</h3>
                  <p className="text-white/90 leading-relaxed relative z-10">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-6 bg-gradient-to-br from-brand-50 to-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-navy-800 mb-6">
              Start Learning in 3 Simple Steps
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                step: "01",
                title: "Create Account",
                description: "Sign up in seconds and get instant access to all learning modules."
              },
              {
                step: "02",
                title: "Choose Your Path",
                description: "Start with budgeting basics or jump into investing. Learn at your own pace."
              },
              {
                step: "03",
                title: "Earn & Progress",
                description: "Complete quizzes, earn badges, and unlock new topics as you learn."
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                className="relative"
              >
                {index < 2 && (
                  <div className="hidden md:block absolute top-12 -right-4 w-8 h-0.5 bg-gradient-to-r from-brand-400 to-transparent"></div>
                )}
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-brand-500 to-brand-600 rounded-2xl text-white text-2xl font-bold mb-6 shadow-lg">
                    {item.step}
                  </div>
                  <h3 className="text-2xl font-bold text-navy-800 mb-4">{item.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose FinLit - No Icons */}
      <section id="features" className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-navy-800 mb-6">
              Why Choose FinLit?
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {[
              {
                title: "Learn by Doing",
                description: "Interactive simulations and real-world scenarios help you practice financial decisions in a safe environment.",
                features: ["Stock market simulator", "Budget planning tool", "Investment calculator"]
              },
              {
                title: "Gamified Experience",
                description: "Stay motivated with points, badges, and achievements as you progress through your financial education journey.",
                features: ["XP system", "Unlockable badges", "Progress tracking"]
              },
              {
                title: "Expert Content",
                description: "Learn from real case studies and proven strategies used by successful investors and financial experts.",
                features: ["Warren Buffett case studies", "Real-world examples", "Tested strategies"]
              },
              {
                title: "Personalized Path",
                description: "Start at your level and progress at your own pace. Focus on topics that matter most to you.",
                features: ["Custom learning paths", "Self-paced modules", "Flexible schedule"]
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-gradient-to-br from-white to-gray-50 rounded-3xl p-8 shadow-lg border-2 border-gray-200 hover:border-brand-300 hover:shadow-2xl transition-all duration-300 cursor-pointer"
              >
                <h3 className="text-2xl font-bold text-navy-800 mb-3">{item.title}</h3>
                <p className="text-slate-600 mb-6">{item.description}</p>
                <ul className="space-y-3">
                  {item.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-slate-600">
                      <Check className="w-4 h-4 text-brand-600 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA for Schools */}
      <section className="py-20 px-6 bg-gradient-to-br from-navy-700 to-navy-900">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Interested in Bringing FinLit to{' '}
              <span className="bg-gradient-to-r from-brand-300 to-brand-400 bg-clip-text text-transparent">
                Your School?
              </span>
            </h2>
            <p className="text-xl text-navy-200 mb-10">
              Transform your students' financial literacy with our comprehensive curriculum.
            </p>

            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 20px 40px -10px rgba(255, 255, 255, 0.3)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/schools')}
              className="px-10 py-5 bg-white text-navy-800 text-lg font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-200 inline-flex items-center gap-3 cursor-pointer"
            >
              Contact Us for Schools
              <ArrowRight className="w-6 h-6" />
            </motion.button>

            <p className="text-navy-300 mt-6">Get custom pricing and dedicated support for educational institutions</p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-navy-900 text-white py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="mb-4">
                <span className="text-xl font-bold">FinLit</span>
              </div>
              <p className="text-slate-400 text-sm">
                Gamified financial education for everyone.
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-3">Product</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#features" className="hover:text-white transition-colors cursor-pointer">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors cursor-pointer">How It Works</a></li>
                <li><a href="/dashboard" className="hover:text-white transition-colors cursor-pointer">Dashboard</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-3">Company</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="/about" className="hover:text-white transition-colors cursor-pointer">About</a></li>
                <li><a href="/contact" className="hover:text-white transition-colors cursor-pointer">Contact</a></li>
                <li><a href="/privacy" className="hover:text-white transition-colors cursor-pointer">Privacy</a></li>
                <li><a href="/terms" className="hover:text-white transition-colors cursor-pointer">Terms</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-6 text-center">
            <p className="text-slate-400 text-sm">
              © 2026 FinLit. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Video Modal */}
      {videoModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm px-4"
          onClick={() => setVideoModalOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="relative w-full max-w-5xl bg-navy-900 rounded-3xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setVideoModalOpen(false)}
              className="absolute top-4 right-4 z-10 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-6 h-6 text-white" />
            </button>

            {/* Video Container */}
            <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
              <iframe
                src="https://streamable.com/e/ymtc7z?autoplay=1"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute top-0 left-0 w-full h-full"
                title="FinLit Demo Video"
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default LandingPage;
