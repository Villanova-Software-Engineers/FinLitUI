/**
 * Bonds Module
 * Educational module about bonds and fixed-income investments
 * Natural color scheme with warm tones and real images
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Award,
  Loader2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../auth/context/AuthContext';
import { useModuleScore, MODULES } from '../hooks/useModuleScore';

// Quiz questions with randomized answer positions
const QUIZ_QUESTIONS_BASE = [
  {
    question: 'What is a bond?',
    correctAnswer: 'A loan to a government or company',
    wrongAnswers: [
      'A type of stock',
      'A savings account',
      'A type of cryptocurrency',
    ],
    teachingPoint: 'Bonds are essentially loans. When you buy a bond, you\'re lending money to the issuer who promises to pay you back with interest.',
  },
  {
    question: 'What is the "coupon rate" on a bond?',
    correctAnswer: 'The annual interest rate paid to bondholders',
    wrongAnswers: [
      'The price you pay for the bond',
      'The maturity date of the bond',
      'The risk level of the bond',
    ],
    teachingPoint: 'The coupon rate is the fixed annual interest rate that the bond issuer pays to bondholders, usually expressed as a percentage of the face value.',
  },
  {
    question: 'Which type of bond is generally considered the safest?',
    correctAnswer: 'U.S. Treasury bonds',
    wrongAnswers: [
      'Corporate bonds',
      'High-yield (junk) bonds',
      'Municipal bonds',
    ],
    teachingPoint: 'U.S. Treasury bonds are backed by the full faith and credit of the U.S. government, making them among the safest investments available.',
  },
  {
    question: 'What happens to bond prices when interest rates rise?',
    correctAnswer: 'Bond prices fall',
    wrongAnswers: [
      'Bond prices rise',
      'Bond prices stay the same',
      'Bonds stop paying interest',
    ],
    teachingPoint: 'When interest rates rise, newly issued bonds offer higher yields, making existing bonds with lower rates less attractive. This causes their prices to fall.',
  },
  {
    question: 'At maturity, a bondholder receives:',
    correctAnswer: 'The principal plus final interest payment',
    wrongAnswers: [
      'Only the interest payments',
      'Only the principal amount',
      'Nothing, the bond expires',
    ],
    teachingPoint: 'At maturity, you receive your principal (face value) back plus the final interest payment, completing the bond contract.',
  },
  {
    question: 'What does "bond yield" represent?',
    correctAnswer: 'The actual return you earn on a bond',
    wrongAnswers: [
      'The time until maturity',
      'The bond\'s face value',
      'The issuer\'s credit rating',
    ],
    teachingPoint: 'Yield represents the actual return you earn, calculated based on the interest payments relative to the current market price of the bond.',
  },
  {
    question: 'Which statement about bonds is TRUE?',
    correctAnswer: 'Bonds provide regular income payments',
    wrongAnswers: [
      'Bonds always have higher returns than stocks',
      'Bonds never lose value',
      'All bonds have the same risk level',
    ],
    teachingPoint: 'Bonds typically provide regular, predictable income through coupon payments, making them attractive for income-focused investors.',
  },
  {
    question: 'What is "credit risk" in bonds?',
    correctAnswer: 'The risk that the issuer might default',
    wrongAnswers: [
      'The risk of interest rates changing',
      'The risk of inflation',
      'The risk of selling before maturity',
    ],
    teachingPoint: 'Credit risk is the possibility that the bond issuer might be unable to make interest payments or repay the principal, leading to default.',
  },
  {
    question: 'If a bond has a face value of $1,000 and a 4% coupon rate, how much annual interest does it pay?',
    correctAnswer: '$40',
    wrongAnswers: [
      '$4',
      '$400',
      '$1,000',
    ],
    teachingPoint: 'The annual interest is calculated as: Face Value × Coupon Rate = $1,000 × 4% = $40 per year.',
  },
  {
    question: 'Why are bonds important in a diversified portfolio?',
    correctAnswer: 'They help balance risk and provide steady income',
    wrongAnswers: [
      'They guarantee high returns',
      'They never lose value',
      'They always outperform stocks',
    ],
    teachingPoint: 'Bonds provide stability and regular income, helping to balance the higher volatility of stocks. This diversification reduces overall portfolio risk.',
  },
];

const PASS_THRESHOLD = 80; // 80% to pass

const BondsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { saveScore } = useModuleScore();

  const [currentPage, setCurrentPage] = useState(0);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [loading, setLoading] = useState(false);

  // Randomize quiz answers once at mount
  const QUIZ_QUESTIONS = useMemo(() => {
    return QUIZ_QUESTIONS_BASE.map(q => {
      const allOptions = [q.correctAnswer, ...q.wrongAnswers];
      // Shuffle options
      const shuffled = allOptions.sort(() => Math.random() - 0.5);
      const correctIndex = shuffled.indexOf(q.correctAnswer);

      return {
        question: q.question,
        options: shuffled,
        answer: correctIndex,
        teachingPoint: q.teachingPoint,
      };
    });
  }, []);

  const totalContentPages = 6;
  const totalPages = totalContentPages + 1;

  const handleAnswerSelect = (answerIndex: number) => {
    if (showResult) return;

    setSelectedAnswer(answerIndex);
    setShowResult(true);

    const isCorrect = answerIndex === QUIZ_QUESTIONS[currentQuizIndex].answer;
    if (isCorrect) {
      setCorrectAnswers((prev) => prev + 1);
    }
  };

  const handleNextQuestion = async () => {
    if (currentQuizIndex < QUIZ_QUESTIONS.length - 1) {
      setCurrentQuizIndex(currentQuizIndex + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      const finalScore = Math.round((correctAnswers / QUIZ_QUESTIONS.length) * 100);
      setLoading(true);

      try {
        if (user) {
          // Firebase requires score === maxScore to mark as passed
          // If student passed the threshold (80%), save it as 100 to mark as passed
          const scoreToSave = finalScore >= PASS_THRESHOLD ? 100 : finalScore;
          await saveScore(MODULES.BONDS.id, scoreToSave, 100);
        }
        setQuizCompleted(true);
      } catch (err) {
        console.error('Error saving score:', err);
        setQuizCompleted(true);
      } finally {
        setLoading(false);
      }
    }
  };

  const finalScore = Math.round((correctAnswers / QUIZ_QUESTIONS.length) * 100);
  const passed = finalScore >= PASS_THRESHOLD;

  return (
    <div className="h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-orange-100 py-3 px-6 z-30 shrink-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-gray-600 hover:text-orange-600 transition-colors font-medium group"
          >
            <div className="p-2 rounded-lg bg-orange-50 group-hover:bg-orange-100 transition-colors">
              <ArrowLeft size={18} />
            </div>
            <span className="hidden sm:inline">Dashboard</span>
          </button>

          <div className="flex-1 max-w-md mx-8">
            <div className="flex justify-between mb-1">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Progress</span>
              <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">
                {currentPage + 1} / {totalPages}
              </span>
            </div>
            <div className="w-full bg-orange-100 h-1.5 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full"
                initial={{ width: `${(currentPage / totalPages) * 100}%` }}
                animate={{ width: `${((currentPage + 1) / totalPages) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-right">
              <span className="block text-xs font-bold text-gray-900 leading-tight">Understanding Bonds</span>
              <span className="block text-[10px] font-semibold text-gray-500 uppercase">Module 5</span>
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-5xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="min-h-[600px]"
            >
              {/* Page 0: What Are Bonds? */}
              {currentPage === 0 && (
                <div className="space-y-6">
                  <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
                    <div className="relative h-64">
                      <img
                        src="bonds.jpg"
                        alt="Financial documents"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                      <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                        <h1 className="text-5xl font-black mb-3">What Are Bonds?</h1>
                        <p className="text-xl text-white/90 max-w-2xl">
                          Think of bonds as IOUs. You lend money, earn interest, and get your money back.
                        </p>
                      </div>
                    </div>

                    <div className="p-8">
                      <div className="grid md:grid-cols-3 gap-6">
                        <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-200">
                          <div className="text-4xl mb-3">💵</div>
                          <h3 className="font-bold text-gray-900 mb-2">You Lend Money</h3>
                          <p className="text-sm text-gray-600">Purchase a bond by lending to the issuer</p>
                        </div>
                        <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-sky-50 rounded-2xl border border-blue-200">
                          <div className="text-4xl mb-3">💰</div>
                          <h3 className="font-bold text-gray-900 mb-2">Earn Interest</h3>
                          <p className="text-sm text-gray-600">Receive regular payments over time</p>
                        </div>
                        <div className="text-center p-6 bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl border border-amber-200">
                          <div className="text-4xl mb-3">✅</div>
                          <h3 className="font-bold text-gray-900 mb-2">Get Repaid</h3>
                          <p className="text-sm text-gray-600">Receive your principal at maturity</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Page 1: Who Issues Bonds */}
              {currentPage === 1 && (
                <div className="space-y-6">
                  <div className="text-center mb-8">
                    <span className="inline-block px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-bold mb-4">
                      Bond Issuers
                    </span>
                    <h2 className="text-4xl font-black text-gray-900 mb-3">Who Issues Bonds?</h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                      Different organizations issue bonds to raise money
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                      <img
                        src="photo1.jpeg"
                        alt="Government building"
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <h3 className="text-2xl font-bold text-gray-900">Government Bonds</h3>
                          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-bold">
                            Safest
                          </span>
                        </div>
                        <ul className="space-y-3">
                          <li className="flex items-start gap-3">
                            <span className="text-green-600 mt-1">✓</span>
                            <div>
                              <p className="font-semibold text-gray-800">U.S. Treasury Bonds</p>
                              <p className="text-sm text-gray-600">Backed by the U.S. government</p>
                            </div>
                          </li>
                          <li className="flex items-start gap-3">
                            <span className="text-green-600 mt-1">✓</span>
                            <div>
                              <p className="font-semibold text-gray-800">Municipal Bonds</p>
                              <p className="text-sm text-gray-600">Issued by cities/states, often tax-free</p>
                            </div>
                          </li>
                        </ul>
                      </div>
                    </div>

                    <div className="bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                      <img
                        src="photo2.jpeg"
                        alt="Corporate building"
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <h3 className="text-2xl font-bold text-gray-900">Corporate Bonds</h3>
                          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-bold">
                            Higher Returns
                          </span>
                        </div>
                        <ul className="space-y-3">
                          <li className="flex items-start gap-3">
                            <span className="text-green-600 mt-1">✓</span>
                            <div>
                              <p className="font-semibold text-gray-800">Investment Grade</p>
                              <p className="text-sm text-gray-600">From stable companies</p>
                            </div>
                          </li>
                          <li className="flex items-start gap-3">
                            <span className="text-green-600 mt-1">✓</span>
                            <div>
                              <p className="font-semibold text-gray-800">High-Yield (Junk)</p>
                              <p className="text-sm text-gray-600">Higher risk, higher potential returns</p>
                            </div>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-amber-100 to-orange-100 rounded-2xl p-6 border border-amber-300">
                    <p className="text-gray-800 font-medium">
                      <strong className="text-orange-700">💡 Why Issue Bonds?</strong> Organizations use bonds to raise money for projects or operations without giving up ownership—it's an alternative to bank loans or selling stock.
                    </p>
                  </div>
                </div>
              )}

              {/* Page 2: Key Bond Terms */}
              {currentPage === 2 && (
                <div className="space-y-6">
                  <div className="text-center mb-8">
                    <span className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-bold mb-4">
                      Essential Terms
                    </span>
                    <h2 className="text-4xl font-black text-gray-900 mb-3">Bond Vocabulary</h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                      Understanding these terms will help you navigate bonds
                    </p>
                  </div>

                  <div className="grid gap-4">
                    <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-green-500">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 mb-2">💵 Face Value (Par Value)</h3>
                          <p className="text-gray-700 mb-3">
                            The amount you'll get back at maturity. Most bonds have a face value of $1,000.
                          </p>
                          <span className="inline-block px-3 py-1 bg-green-50 text-green-700 rounded-lg text-sm font-semibold">
                            Example: $1,000
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-blue-500">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 mb-2">📊 Coupon Rate</h3>
                          <p className="text-gray-700 mb-3">
                            The annual interest rate. A $1,000 bond with 5% coupon pays $50 per year.
                          </p>
                          <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm font-semibold">
                            Example: 5% = $50/year
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-purple-500">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 mb-2">📅 Maturity Date</h3>
                          <p className="text-gray-700 mb-3">
                            When the bond expires and you get your principal back. Can be months to decades.
                          </p>
                          <span className="inline-block px-3 py-1 bg-purple-50 text-purple-700 rounded-lg text-sm font-semibold">
                            Example: 10 years
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-amber-500">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 mb-2">📈 Yield</h3>
                          <p className="text-gray-700 mb-3">
                            Your actual return, which differs from coupon rate based on purchase price.
                          </p>
                          <span className="inline-block px-3 py-1 bg-amber-50 text-amber-700 rounded-lg text-sm font-semibold">
                            Changes with price
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Page 3: How Bonds Work */}
              {currentPage === 3 && (
                <div className="space-y-6">
                  <div className="text-center mb-8">
                    <span className="inline-block px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-bold mb-4">
                      The Process
                    </span>
                    <h2 className="text-4xl font-black text-gray-900 mb-3">How Bonds Work</h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                      A simple example to understand the bond lifecycle
                    </p>
                  </div>

                  <div className="bg-white rounded-3xl p-8 shadow-xl">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">📋 Example: A $1,000 Bond Journey</h3>

                    <div className="space-y-4 mb-8">
                      <div className="flex items-start gap-4 p-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl border border-blue-200">
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center shrink-0 text-white font-bold">
                          1
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-900 mb-1">🛒 You Buy the Bond</h4>
                          <p className="text-gray-700">
                            You purchase a $1,000 bond with 5% coupon and 10-year maturity.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200">
                        <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center shrink-0 text-white font-bold">
                          2
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-900 mb-1">💰 Regular Payments</h4>
                          <p className="text-gray-700">
                            Every year for 10 years, you receive $50. That's $500 total interest.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-200">
                        <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center shrink-0 text-white font-bold">
                          3
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-900 mb-1">🎉 Maturity</h4>
                          <p className="text-gray-700">
                            After 10 years, you get your $1,000 back plus final $50 payment.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl p-6 text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-orange-100 text-sm mb-1">Total Return Over 10 Years</p>
                          <p className="text-4xl font-black">$1,500</p>
                        </div>
                        <div className="text-right">
                          <p className="text-orange-100 text-sm">Principal: $1,000</p>
                          <p className="text-orange-100 text-sm">Interest: $500</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
                    <p className="text-blue-900 font-medium">
                      <strong>💡 Key Insight:</strong> Bonds provide predictable income. You know exactly how much you'll earn and when, making them safer than stocks.
                    </p>
                  </div>
                </div>
              )}

              {/* Page 4: Why Invest */}
              {currentPage === 4 && (
                <div className="space-y-6">
                  <div className="text-center mb-8">
                    <span className="inline-block px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-bold mb-4">
                      Benefits
                    </span>
                    <h2 className="text-4xl font-black text-gray-900 mb-3">Why Invest in Bonds?</h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                      Bonds offer unique advantages for your portfolio
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                      <div className="text-3xl mb-3">🛡️</div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Lower Risk</h3>
                      <p className="text-gray-600">
                        Safer than stocks with a contractual promise to repay.
                      </p>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                      <div className="text-3xl mb-3">💸</div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Steady Income</h3>
                      <p className="text-gray-600">
                        Regular payments provide predictable income stream.
                      </p>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                      <div className="text-3xl mb-3">⚖️</div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Portfolio Balance</h3>
                      <p className="text-gray-600">
                        When stocks fall, bonds often stay stable or rise.
                      </p>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                      <div className="text-3xl mb-3">🔒</div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Capital Preservation</h3>
                      <p className="text-gray-600">
                        Perfect for protecting savings you'll need soon.
                      </p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-3xl p-8 text-white shadow-xl">
                    <h3 className="text-2xl font-bold mb-4">📊 The 60/40 Portfolio</h3>
                    <p className="text-orange-50 mb-6">
                      Many advisors recommend 60% stocks and 40% bonds for balanced growth. As you near retirement, increase bonds for more safety.
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/20 rounded-xl p-4 backdrop-blur-sm">
                        <p className="text-orange-100 text-sm mb-1">Stocks (Growth)</p>
                        <p className="text-4xl font-black">60%</p>
                      </div>
                      <div className="bg-white/20 rounded-xl p-4 backdrop-blur-sm">
                        <p className="text-orange-100 text-sm mb-1">Bonds (Stability)</p>
                        <p className="text-4xl font-black">40%</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Page 5: Risks */}
              {currentPage === 5 && (
                <div className="space-y-6">
                  <div className="text-center mb-8">
                    <span className="inline-block px-4 py-2 bg-red-100 text-red-700 rounded-full text-sm font-bold mb-4">
                      Important
                    </span>
                    <h2 className="text-4xl font-black text-gray-900 mb-3">Understanding Bond Risks</h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                      While safer than stocks, bonds have risks you should know
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-red-500">
                      <h3 className="text-xl font-bold text-gray-900 mb-3">
                        <span className="inline-block w-8 h-8 bg-red-100 rounded-lg text-center leading-8 text-red-600 font-bold mr-2">1</span>
                        Interest Rate Risk
                      </h3>
                      <p className="text-gray-700 mb-3">
                        When rates rise, existing bonds become less valuable. If you need to sell early, you might get less than you paid.
                      </p>
                      <div className="bg-red-50 rounded-xl p-4">
                        <p className="text-sm text-red-900">
                          <strong>Example:</strong> Your 3% bond loses appeal when new bonds pay 5%.
                        </p>
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-orange-500">
                      <h3 className="text-xl font-bold text-gray-900 mb-3">
                        <span className="inline-block w-8 h-8 bg-orange-100 rounded-lg text-center leading-8 text-orange-600 font-bold mr-2">2</span>
                        Credit Risk
                      </h3>
                      <p className="text-gray-700 mb-3">
                        The issuer might not pay you back. More common with "junk bonds" from unstable companies.
                      </p>
                      <div className="bg-orange-50 rounded-xl p-4">
                        <p className="text-sm text-orange-900">
                          <strong>Protection:</strong> Check ratings. AAA is best, below BBB is "junk."
                        </p>
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-yellow-500">
                      <h3 className="text-xl font-bold text-gray-900 mb-3">
                        <span className="inline-block w-8 h-8 bg-yellow-100 rounded-lg text-center leading-8 text-yellow-600 font-bold mr-2">3</span>
                        Inflation Risk
                      </h3>
                      <p className="text-gray-700 mb-3">
                        If inflation rises, your fixed payments buy less. Your $50 won't purchase as much.
                      </p>
                      <div className="bg-yellow-50 rounded-xl p-4">
                        <p className="text-sm text-yellow-900">
                          <strong>Solution:</strong> Consider TIPS (inflation-protected securities).
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-200">
                    <p className="text-gray-800 font-medium">
                      <strong className="text-blue-700">🎯 Bottom Line:</strong> Bonds are safer than stocks but not risk-free. Diversify—don't put everything in one bond or issuer.
                    </p>
                  </div>
                </div>
              )}

              {/* Page 6: Quiz */}
              {currentPage === 6 && (
                <div className="min-h-[600px] flex items-center justify-center">
                  <div className="w-full max-w-4xl">
                    {quizCompleted ? (
                      <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-center bg-white rounded-3xl p-12 shadow-2xl"
                      >
                        <div
                          className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-6 ${
                            passed ? 'bg-gradient-to-br from-green-400 to-emerald-500' : 'bg-gradient-to-br from-amber-400 to-orange-500'
                          }`}
                        >
                          {passed ? (
                            <Award size={48} className="text-white" />
                          ) : (
                            <XCircle size={48} className="text-white" />
                          )}
                        </div>
                        <h2 className="text-4xl font-black text-gray-900 mb-4">
                          {passed ? '🎉 Great Job!' : '📚 Keep Learning!'}
                        </h2>
                        <p className="text-xl text-gray-600 mb-2">
                          You scored <span className="font-bold text-orange-600">{finalScore}%</span>
                        </p>
                        <p className="text-sm text-gray-500 mb-8">
                          {passed ? `You passed! (${PASS_THRESHOLD}% required)` : `You need ${PASS_THRESHOLD}% to pass. Review and try again!`}
                        </p>
                        <button
                          onClick={() => navigate('/dashboard')}
                          className="px-8 py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-bold text-lg hover:shadow-lg transition-all"
                        >
                          {passed ? '✨ Complete & Return Home' : '← Return to Dashboard'}
                        </button>
                      </motion.div>
                    ) : (
                      <div className="bg-white rounded-3xl p-8 shadow-2xl">
                        <div className="mb-8">
                          <div className="flex justify-between items-center mb-4">
                            <span className="text-sm font-bold text-teal-600 uppercase tracking-wider">
                              Question {currentQuizIndex + 1} of {QUIZ_QUESTIONS.length}
                            </span>
                            <span className="text-sm font-bold text-gray-400">
                              {Math.round(((currentQuizIndex + 1) / QUIZ_QUESTIONS.length) * 100)}%
                            </span>
                          </div>
                          <div className="h-3 bg-white rounded-full overflow-hidden mb-6 shadow-sm border border-gray-100">
                            <motion.div
                              className="h-full bg-gradient-to-r from-teal-400 to-cyan-600 rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${((currentQuizIndex + 1) / QUIZ_QUESTIONS.length) * 100}%` }}
                              transition={{ duration: 0.5 }}
                            />
                          </div>
                          <h2 className="text-2xl font-bold text-gray-900">
                            {QUIZ_QUESTIONS[currentQuizIndex].question}
                          </h2>
                        </div>

                        <div className="space-y-3 mb-6">
                          {QUIZ_QUESTIONS[currentQuizIndex].options.map((option, idx) => {
                            const isSelected = selectedAnswer === idx;
                            const isCorrect = idx === QUIZ_QUESTIONS[currentQuizIndex].answer;
                            const showCorrectness = showResult && (isSelected || isCorrect);

                            return (
                              <button
                                key={idx}
                                onClick={() => handleAnswerSelect(idx)}
                                disabled={showResult}
                                className={`w-full p-5 rounded-2xl border-2 text-left transition-all flex items-center gap-4 ${
                                  showCorrectness
                                    ? isCorrect
                                      ? 'bg-emerald-50 border-emerald-500'
                                      : isSelected
                                      ? 'bg-red-50 border-red-500'
                                      : 'bg-white border-gray-100 opacity-50'
                                    : isSelected
                                    ? 'bg-teal-50 border-teal-500 shadow-md'
                                    : 'bg-white border-gray-200 hover:border-teal-300 hover:shadow-sm'
                                }`}
                              >
                                <div
                                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0 ${
                                    showCorrectness && isCorrect
                                      ? 'bg-emerald-500 text-white'
                                      : showCorrectness && isSelected
                                      ? 'bg-red-500 text-white'
                                      : isSelected
                                      ? 'bg-teal-500 text-white'
                                      : 'bg-gray-100 text-gray-500'
                                  }`}
                                >
                                  {showCorrectness && isCorrect ? (
                                    <CheckCircle className="w-5 h-5" />
                                  ) : showCorrectness && isSelected ? (
                                    <XCircle className="w-5 h-5" />
                                  ) : (
                                    String.fromCharCode(65 + idx)
                                  )}
                                </div>
                                <span
                                  className={`flex-1 font-medium ${
                                    showCorrectness
                                      ? isCorrect
                                        ? 'text-emerald-900'
                                        : isSelected
                                        ? 'text-red-900'
                                        : 'text-gray-500'
                                      : 'text-gray-700'
                                  }`}
                                >
                                  {option}
                                </span>
                              </button>
                            );
                          })}
                        </div>

                        {showResult && (
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white p-6 rounded-2xl shadow-lg"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <h4 className="font-bold text-teal-100 uppercase tracking-wider text-sm mb-2">
                                  💡 Learning Point
                                </h4>
                                <p className="text-lg leading-relaxed">
                                  {QUIZ_QUESTIONS[currentQuizIndex].teachingPoint}
                                </p>
                              </div>
                              <button
                                onClick={handleNextQuestion}
                                disabled={loading}
                                className="px-6 py-3 bg-white text-teal-600 rounded-xl font-bold hover:bg-teal-50 transition-colors whitespace-nowrap disabled:opacity-50"
                              >
                                {loading ? (
                                  <Loader2 className="animate-spin" size={20} />
                                ) : currentQuizIndex === QUIZ_QUESTIONS.length - 1 ? (
                                  'Finish'
                                ) : (
                                  'Next →'
                                )}
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Navigation */}
      <div className="bg-white/80 backdrop-blur-sm border-t border-orange-100 py-4 px-6">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <button
            onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
            disabled={currentPage === 0}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all disabled:opacity-30 disabled:cursor-not-allowed text-gray-600 hover:bg-orange-50"
          >
            <ChevronLeft size={20} />
            Previous
          </button>

          <div className="flex gap-2">
            {Array.from({ length: totalPages }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentPage(idx)}
                className={`h-2 rounded-full transition-all ${
                  idx === currentPage
                    ? 'bg-orange-500 w-8'
                    : 'bg-gray-300 hover:bg-gray-400 w-2'
                }`}
              />
            ))}
          </div>

          <button
            onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
            disabled={currentPage === totalPages - 1}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:shadow-lg"
          >
            Next
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default BondsPage;
