import React from 'react';
import { motion } from 'framer-motion';
import { Target, Heart, Lightbulb, Users, GraduationCap, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';

const WhoWeAre: React.FC = () => {
  const navigate = useNavigate();

  const values = [
    {
      icon: GraduationCap,
      title: "Education First",
      description: "We believe financial literacy should be accessible to everyone, regardless of background or experience.",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: Lightbulb,
      title: "Learn by Doing",
      description: "Interactive modules and gamified challenges make learning engaging and memorable.",
      color: "from-amber-500 to-orange-600"
    },
    {
      icon: Shield,
      title: "Safe Learning",
      description: "Practice financial decisions in a risk-free environment before applying them in real life.",
      color: "from-green-500 to-emerald-600"
    },
    {
      icon: Heart,
      title: "Community Driven",
      description: "Built with feedback from students, educators, and financial professionals.",
      color: "from-pink-500 to-rose-600"
    }
  ];

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <Users className="text-white" size={24} />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Who We Are</h1>
          </div>

          {/* Mission Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 mb-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <Target className="text-purple-600" size={28} />
              <h2 className="text-2xl font-bold text-gray-900">Our Mission</h2>
            </div>
            <p className="text-gray-700 text-lg leading-relaxed">
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
            className="bg-gradient-to-r from-purple-100 to-indigo-100 rounded-3xl p-8 mb-8 border border-purple-200"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Why FinLit?</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-white/80 rounded-2xl p-5 text-center">
                <div className="text-4xl mb-2">78%</div>
                <p className="text-sm text-gray-600">of Americans live paycheck to paycheck</p>
              </div>
              <div className="bg-white/80 rounded-2xl p-5 text-center">
                <div className="text-4xl mb-2">57%</div>
                <p className="text-sm text-gray-600">of U.S. adults are financially illiterate</p>
              </div>
              <div className="bg-white/80 rounded-2xl p-5 text-center">
                <div className="text-4xl mb-2">21</div>
                <p className="text-sm text-gray-600">states require financial education in high school</p>
              </div>
            </div>
            <p className="text-gray-700 mt-4 text-center">
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
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Our Values</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {values.map((value, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + idx * 0.1 }}
                  className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition"
                >
                  <div className={`w-12 h-12 bg-gradient-to-br ${value.color} rounded-xl flex items-center justify-center shadow-md mb-4`}>
                    <value.icon className="text-white" size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{value.title}</h3>
                  <p className="text-gray-600">{value.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* What We Offer Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 mb-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">What We Offer</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-green-600 font-bold">1</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Interactive Learning Modules</h3>
                  <p className="text-gray-600">22+ comprehensive modules covering everything from budgeting basics to advanced investing strategies.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-bold">2</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Real-World Simulations</h3>
                  <p className="text-gray-600">Practice making financial decisions with stock market simulations, budgeting tools, and scenario-based challenges.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-purple-600 font-bold">3</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Gamified Learning</h3>
                  <p className="text-gray-600">Earn points, unlock achievements, and compete on leaderboards as you master financial concepts.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-amber-600 font-bold">4</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Certificates of Completion</h3>
                  <p className="text-gray-600">Demonstrate your financial literacy with shareable certificates for completed learning paths.</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-3xl p-8 text-center text-white"
          >
            <h2 className="text-2xl font-bold mb-3">Ready to Start Your Financial Journey?</h2>
            <p className="text-purple-100 mb-6">
              Join thousands of learners who are building their financial future with FinLit.
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-8 py-3 bg-white text-purple-600 font-semibold rounded-xl hover:shadow-lg transition"
            >
              Start Learning Now
            </button>
          </motion.div>

          <div className="mt-8 text-center text-sm text-gray-500">
            <p>© 2026 FinLit. All rights reserved.</p>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default WhoWeAre;
