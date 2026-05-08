import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AboutUs: React.FC = () => {
  const navigate = useNavigate();

  const values = [
    {
      title: "Education First",
      description: "We believe financial literacy should be accessible to everyone, regardless of background or experience."
    },
    {
      title: "Learn by Doing",
      description: "Interactive modules and gamified challenges make learning engaging and memorable."
    },
    {
      title: "Safe Learning",
      description: "Practice financial decisions in a risk-free environment before applying them in real life."
    },
    {
      title: "Community Driven",
      description: "Built with feedback from students, educators, and financial professionals."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-brand-50/30">
      {/* Back Button */}
      <div className="pt-8 px-6 max-w-7xl mx-auto">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-navy-700 hover:text-brand-500 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back to Home</span>
        </motion.button>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="text-center mb-16">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-6xl font-bold text-navy-800 mb-6"
            >
              About{' '}
              <span className="bg-gradient-to-r from-brand-500 to-brand-600 bg-clip-text text-transparent">
                FinLit
              </span>
            </motion.h1>
            <p className="text-xl text-slate-600">
              Empowering the next generation with essential financial knowledge
            </p>
          </div>

          {/* Mission Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl shadow-xl border-2 border-gray-200 p-8 mb-8"
          >
            <h2 className="text-2xl font-bold text-navy-800 mb-4">Our Mission</h2>
            <p className="text-slate-700 text-lg leading-relaxed">
              FinLit is on a mission to empower the next generation with essential financial knowledge.
              We believe that understanding money management, investing, and financial planning shouldn't
              be complicated or boring. Through interactive learning, gamified challenges, and real-world
              simulations, we make financial literacy accessible, engaging, and fun for everyone.
            </p>
          </motion.div>

          {/* Why FinLit Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-brand-50 to-navy-50 rounded-3xl p-8 mb-8 border-2 border-brand-200"
          >
            <h2 className="text-2xl font-bold text-navy-800 mb-6 text-center">Why FinLit?</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl p-6 text-center shadow-lg">
                  <div className="text-4xl font-bold bg-gradient-to-r from-brand-500 to-brand-600 bg-clip-text text-transparent mb-2">78%</div>
                  <p className="text-sm text-slate-600">of people worldwide live paycheck to paycheck</p>
                </div>
                <div className="bg-white rounded-2xl p-6 text-center shadow-lg">
                  <div className="text-4xl font-bold bg-gradient-to-r from-brand-500 to-brand-600 bg-clip-text text-transparent mb-2">57%</div>
                  <p className="text-sm text-slate-600">of adults globally lack basic financial literacy</p>
                </div>
                <div className="bg-white rounded-2xl p-6 text-center shadow-lg">
                  <div className="text-4xl font-bold bg-gradient-to-r from-brand-500 to-brand-600 bg-clip-text text-transparent mb-2">21%</div>
                  <p className="text-sm text-slate-600">of countries mandate financial education in schools</p>
                </div>
              </div>
            <p className="text-slate-700 mt-6 text-center font-medium">
              We're working to change these statistics by making financial education accessible to all.
            </p>
          </motion.div>

          {/* Values Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-bold text-navy-800 mb-6 text-center">Our Values</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {values.map((value, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + idx * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="bg-gradient-to-br from-white to-gray-50 rounded-3xl p-8 shadow-lg border-2 border-gray-200 hover:border-brand-300 hover:shadow-2xl transition-all duration-300 cursor-pointer"
                >
                  <h3 className="text-xl font-bold text-navy-800 mb-3">{value.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{value.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* What We Offer Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-3xl shadow-xl border-2 border-gray-200 p-8 mb-8"
          >
            <h2 className="text-2xl font-bold text-navy-800 mb-6">What We Offer</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <Check className="w-6 h-6 text-brand-600" />
                </div>
                <div>
                  <h3 className="font-bold text-navy-800 mb-1">Interactive Learning Modules</h3>
                  <p className="text-slate-600">23 comprehensive modules covering everything from budgeting basics to advanced investing strategies.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <Check className="w-6 h-6 text-brand-600" />
                </div>
                <div>
                  <h3 className="font-bold text-navy-800 mb-1">Real-World Simulations</h3>
                  <p className="text-slate-600">Practice making financial decisions with stock market simulations, budgeting tools, and scenario-based challenges.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <Check className="w-6 h-6 text-brand-600" />
                </div>
                <div>
                  <h3 className="font-bold text-navy-800 mb-1">Gamified Learning</h3>
                  <p className="text-slate-600">Earn points, unlock achievements, and compete on leaderboards as you master financial concepts.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <Check className="w-6 h-6 text-brand-600" />
                </div>
                <div>
                  <h3 className="font-bold text-navy-800 mb-1">Certificates of Completion</h3>
                  <p className="text-slate-600">Demonstrate your financial literacy with shareable certificates for completed learning paths.</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-gradient-to-br from-brand-500 to-brand-600 rounded-3xl p-10 text-center text-white shadow-2xl"
          >
            <h2 className="text-3xl font-bold mb-4">Ready to Start Your Financial Journey?</h2>
            <p className="text-brand-100 mb-8 text-lg">
              Join thousands of learners who are building their financial future with FinLit.
            </p>
            <button
              onClick={() => navigate('/auth')}
              className="px-8 py-4 bg-white text-brand-600 font-bold rounded-xl hover:shadow-2xl transition-all duration-200 cursor-pointer"
            >
              Start Learning Now
            </button>
          </motion.div>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="bg-navy-900 text-white py-12 px-6 mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
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
                <li><a href="/#features" className="hover:text-white transition-colors cursor-pointer">Features</a></li>
                <li><a href="/#how-it-works" className="hover:text-white transition-colors cursor-pointer">How It Works</a></li>
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

            <div>
              <h4 className="font-bold mb-3">Connect</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors cursor-pointer">Twitter</a></li>
                <li><a href="#" className="hover:text-white transition-colors cursor-pointer">LinkedIn</a></li>
                <li><a href="#" className="hover:text-white transition-colors cursor-pointer">Instagram</a></li>
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
    </div>
  );
};

export default AboutUs;
