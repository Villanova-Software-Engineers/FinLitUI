import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Star, BookOpen, Home, Target, User, Check, Flame, GraduationCap, Loader2, Lock, Play, Zap, Lightbulb, TrendingUp, PiggyBank, Shield, CreditCard, Wallet, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../auth/context/AuthContext';
import { useModuleScore, MODULES } from '../hooks/useModuleScore';

// Crossword Data
interface CrosswordCell {
  letter: string;
  isBlack: boolean;
  number?: number;
}

interface ClueData {
  number: number;
  clue: string;
  answer: string;
  startRow: number;
  startCol: number;
  direction: 'across' | 'down';
}

const CROSSWORD_CLUES: ClueData[] = [
  { number: 1, clue: "Money set aside for future", answer: "SAVINGS", startRow: 0, startCol: 0, direction: 'across' },
  { number: 4, clue: "Earnings on deposits", answer: "INTEREST", startRow: 2, startCol: 0, direction: 'across' },
  { number: 6, clue: "Spending plan", answer: "BUDGET", startRow: 4, startCol: 1, direction: 'across' },
  { number: 7, clue: "Company ownership share", answer: "STOCK", startRow: 6, startCol: 0, direction: 'across' },
  { number: 2, clue: "Money owed", answer: "DEBT", startRow: 0, startCol: 2, direction: 'down' },
  { number: 3, clue: "Risk protection", answer: "INSURANCE", startRow: 0, startCol: 5, direction: 'down' },
  { number: 5, clue: "Yearly rate", answer: "APR", startRow: 2, startCol: 6, direction: 'down' },
];

const generateGrid = (): CrosswordCell[][] => {
  const rows = 9;
  const cols = 9;
  const grid: CrosswordCell[][] = Array(rows).fill(null).map(() =>
    Array(cols).fill(null).map(() => ({ letter: '', isBlack: true }))
  );

  CROSSWORD_CLUES.forEach(clue => {
    const { answer, startRow, startCol, direction, number } = clue;
    for (let i = 0; i < answer.length; i++) {
      const row = direction === 'across' ? startRow : startRow + i;
      const col = direction === 'across' ? startCol + i : startCol;
      if (row < rows && col < cols) {
        grid[row][col] = {
          ...grid[row][col],
          letter: answer[i],
          isBlack: false,
        };
        if (i === 0) {
          grid[row][col].number = number;
        }
      }
    }
  });
  return grid;
};

const GRID = generateGrid();

// Daily Financial Tips
const DAILY_TIPS = [
  { tip: "Pay yourself first! Set up automatic transfers to savings on payday before you spend on anything else.", category: "Saving", icon: PiggyBank, color: "from-emerald-400 to-teal-500" },
  { tip: "The 24-hour rule: Wait a day before making any non-essential purchase over $50. You'll be surprised how often the urge passes!", category: "Spending", icon: Wallet, color: "from-blue-400 to-indigo-500" },
  { tip: "Your credit utilization should stay below 30%. If your limit is $1,000, try to keep your balance under $300.", category: "Credit", icon: CreditCard, color: "from-purple-400 to-pink-500" },
  { tip: "Compound interest is the 8th wonder of the world. Starting to invest early, even small amounts, can grow significantly over time.", category: "Investing", icon: TrendingUp, color: "from-amber-400 to-orange-500" },
  { tip: "Review your subscriptions monthly. The average person wastes $200/month on forgotten or unused subscriptions.", category: "Budgeting", icon: RefreshCw, color: "from-rose-400 to-red-500" },
  { tip: "Build an emergency fund covering 3-6 months of expenses. Start with just $500 as your first milestone.", category: "Safety Net", icon: Shield, color: "from-cyan-400 to-blue-500" },
  { tip: "Use the 50/30/20 rule: 50% needs, 30% wants, 20% savings. It's simple but effective for any income level.", category: "Budgeting", icon: PiggyBank, color: "from-green-400 to-emerald-500" },
  { tip: "High-interest debt is an emergency. Pay off credit cards before investing, as interest rates often exceed investment returns.", category: "Debt", icon: CreditCard, color: "from-red-400 to-rose-500" },
  { tip: "Negotiate your bills! Cable, internet, insurance—many companies will lower rates if you simply ask.", category: "Saving", icon: Wallet, color: "from-violet-400 to-purple-500" },
  { tip: "Track every expense for one month. Awareness alone can reduce unnecessary spending by 10-15%.", category: "Awareness", icon: Lightbulb, color: "from-yellow-400 to-amber-500" },
];

// Daily Questions
const DAILY_QUESTIONS = [
  { question: "What is compound interest?", options: ["Interest earned on interest", "Tax on investment gains", "Diversification of assets", "Money added to an account"], correct: 0 },
  { question: "What's the 50-30-20 rule?", options: ["50% save, 30% needs, 20% wants", "50% needs, 30% wants, 20% savings", "50% invest, 30% spend, 20% save", "50% wants, 30% save, 20% needs"], correct: 1 },
  { question: "What does APR stand for?", options: ["Annual Profit Rate", "Annual Percentage Rate", "Average Payment Ratio", "Asset Price Return"], correct: 1 },
  { question: "What is an emergency fund?", options: ["Money for vacation", "Savings for unexpected expenses", "Stock investment account", "Credit card limit"], correct: 1 },
  { question: "What most affects your credit score?", options: ["Your income level", "Payment history", "Number of bank accounts", "Your age"], correct: 1 },
];

// Modules
const LEARNING_MODULES = [
  { id: MODULES.BUDGETING_50_30_20.id, title: "Budgeting Basics", subtitle: "50-30-20 Rule", icon: "💰", route: "/50-30-20", points: 100 },
  { id: MODULES.NEEDS_WANTS.id, title: "Needs vs Wants", subtitle: "Financial Priorities", icon: "⚖️", route: "/needs-wants", points: 100 },
  { id: MODULES.INVESTMENT_BANKING.id, title: "Investment Banking", subtitle: "IPO Knowledge", icon: "🏦", route: "/investment-quiz", points: 150 },
  { id: MODULES.CREDIT_SCORE.id, title: "Credit Score", subtitle: "Credit Management", icon: "📊", route: "/credit-score", points: 150 },
  { id: MODULES.EMERGENCY_FUND.id, title: "Emergency Fund", subtitle: "Financial Safety", icon: "🆘", route: "/emergency-fund", points: 150 },
  { id: MODULES.STOCK_MARKET.id, title: "Stock Market", subtitle: "Investment Basics", icon: "📈", route: "/stock-market", points: 200 },
  { id: MODULES.INSURANCE.id, title: "Insurance", subtitle: "Risk Management", icon: "🛡️", route: "/insurance", points: 150 },
  { id: MODULES.DEBT_MANAGEMENT.id, title: "Debt Management", subtitle: "Debt Freedom", icon: "🔓", route: "/debt-management", points: 200 },
];

const FinLitApp: React.FC = () => {
  const navigate = useNavigate();
  const { user, signOut, isLoading: authLoading } = useAuthContext();
  const { progress, isModulePassed, getModuleScore } = useModuleScore();

  const [activeSection, setActiveSection] = useState<'home' | 'profile'>('home');
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [dailyQuestion] = useState(() => DAILY_QUESTIONS[new Date().getDate() % DAILY_QUESTIONS.length]);
  const [dailyTip, setDailyTip] = useState(() => DAILY_TIPS[new Date().getDate() % DAILY_TIPS.length]);
  const [answered, setAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showStreakAnimation, setShowStreakAnimation] = useState(false);
  const [showCertTooltip, setShowCertTooltip] = useState(false);

  // Crossword state
  const [userInputs, setUserInputs] = useState<{ [key: string]: string }>({});
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [selectedDirection, setSelectedDirection] = useState<'across' | 'down'>('across');
  const [crosswordChecked, setCrosswordChecked] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const inputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  // Calculations
  const moduleOrder = LEARNING_MODULES.map(m => m.id);
  const completedModules = LEARNING_MODULES.filter(m => isModulePassed(m.id)).length;
  const totalModules = LEARNING_MODULES.length;
  const streak = progress?.streak ?? 0;
  const totalXP = progress?.totalXP ?? 0;
  const xpLevel = Math.min((totalXP / 100) * 100, 100);

  const isModuleAccessible = (idx: number) => idx === 0 || isModulePassed(moduleOrder[idx - 1]);
  const getModuleStatus = (moduleId: string, idx: number) => {
    if (isModulePassed(moduleId as Parameters<typeof isModulePassed>[0])) return 'completed';
    if (!isModuleAccessible(idx)) return 'locked';
    const moduleScore = progress?.moduleScores?.find(s => s.moduleId === moduleId);
    if (moduleScore && moduleScore.attempts > 0) return 'in_progress';
    return 'next';
  };

  // Crossword handlers
  const handleCellClick = (row: number, col: number) => {
    if (GRID[row][col].isBlack) return;
    if (selectedCell?.row === row && selectedCell?.col === col) {
      setSelectedDirection(prev => prev === 'across' ? 'down' : 'across');
    } else {
      setSelectedCell({ row, col });
    }
    inputRefs.current[`${row}-${col}`]?.focus();
  };

  const getNextCell = useCallback((row: number, col: number, dir: 'across' | 'down', forward = true) => {
    const delta = forward ? 1 : -1;
    const nextRow = dir === 'down' ? row + delta : row;
    const nextCol = dir === 'across' ? col + delta : col;
    if (nextRow >= 0 && nextRow < GRID.length && nextCol >= 0 && nextCol < GRID[0].length && !GRID[nextRow][nextCol].isBlack) {
      return { row: nextRow, col: nextCol };
    }
    return null;
  }, []);

  const handleCellInput = (row: number, col: number, value: string) => {
    const key = `${row}-${col}`;
    const letter = value.toUpperCase().slice(-1);
    if (letter === '' || /^[A-Z]$/.test(letter)) {
      setUserInputs(prev => ({ ...prev, [key]: letter }));
      setCrosswordChecked(false);
      if (letter !== '') {
        const next = getNextCell(row, col, selectedDirection);
        if (next) {
          setSelectedCell(next);
          setTimeout(() => inputRefs.current[`${next.row}-${next.col}`]?.focus(), 0);
        }
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, row: number, col: number) => {
    const key = `${row}-${col}`;
    if (e.key === 'Backspace' && !userInputs[key]) {
      const prev = getNextCell(row, col, selectedDirection, false);
      if (prev) {
        setSelectedCell(prev);
        setUserInputs(p => ({ ...p, [`${prev.row}-${prev.col}`]: '' }));
        setTimeout(() => inputRefs.current[`${prev.row}-${prev.col}`]?.focus(), 0);
      }
      e.preventDefault();
    } else if (['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp'].includes(e.key)) {
      const dir = e.key.includes('Right') || e.key.includes('Left') ? 'across' : 'down';
      const forward = e.key.includes('Right') || e.key.includes('Down');
      const next = getNextCell(row, col, dir, forward);
      if (next) {
        setSelectedCell(next);
        setSelectedDirection(dir);
        setTimeout(() => inputRefs.current[`${next.row}-${next.col}`]?.focus(), 0);
      }
      e.preventDefault();
    }
  };

  const checkCrossword = () => {
    let correct = 0;
    GRID.forEach((row, ri) => row.forEach((cell, ci) => {
      if (!cell.isBlack && userInputs[`${ri}-${ci}`]?.toUpperCase() === cell.letter) correct++;
    }));
    setCorrectCount(correct);
    setCrosswordChecked(true);
  };

  const resetCrossword = () => {
    setUserInputs({});
    setCrosswordChecked(false);
    setSelectedCell(null);
  };

  const getCellHighlight = (row: number, col: number) => {
    if (!selectedCell || GRID[row][col].isBlack) return '';
    if (selectedCell.row === row && selectedCell.col === col) return 'bg-blue-300';
    if (selectedDirection === 'across' && selectedCell.row === row) return 'bg-blue-100';
    if (selectedDirection === 'down' && selectedCell.col === col) return 'bg-blue-100';
    return '';
  };

  const triggerStreakAnimation = () => {
    setShowStreakAnimation(true);
    setTimeout(() => setShowStreakAnimation(false), 2000);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null || answered) return;
    const correct = selectedAnswer === dailyQuestion.correct;
    setIsCorrect(correct);
    setAnswered(true);
    if (correct) triggerStreakAnimation();
  };

  useEffect(() => {
    if (!authLoading && !user) navigate('/auth');
  }, [authLoading, user, navigate]);

  if (authLoading || !user) {
    return (
      <div className="flex items-center justify-center h-screen bg-blue-50">
        <Loader2 className="animate-spin text-blue-500" size={48} />
      </div>
    );
  }

  const acrossClues = CROSSWORD_CLUES.filter(c => c.direction === 'across').sort((a, b) => a.number - b.number);
  const downClues = CROSSWORD_CLUES.filter(c => c.direction === 'down').sort((a, b) => a.number - b.number);

  return (
    <div className="flex flex-col h-screen bg-blue-50">
      {/* Header */}
      <header className="bg-blue-100 p-4 flex justify-between items-center border-b border-blue-200">
        <div className="flex items-center gap-2">
          <div className="bg-emerald-500 text-white p-2 rounded-lg">
            <BookOpen size={22} />
          </div>
          <h1 className="text-2xl font-bold text-blue-700">FinLit</h1>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white text-lg font-bold">
              {user.displayName?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <span className="text-blue-800 font-semibold text-lg">{user.displayName || user.email}</span>
          </div>


          <div
            className="relative cursor-pointer"
            onMouseEnter={() => setShowCertTooltip(true)}
            onMouseLeave={() => setShowCertTooltip(false)}
          >
            <GraduationCap className="text-yellow-500" size={28} />
            {showCertTooltip && (
              <div className="absolute top-10 -left-20 bg-white p-3 rounded-lg shadow-lg text-sm w-52 z-10 border">
                <p className="font-bold mb-1">Financial Literacy Certificate</p>
                <p className="text-gray-600">1000 points needed ({Math.max(0, 1000 - totalXP)} to go)</p>
              </div>
            )}
          </div>
          <div className="text-lg">
            <span className="font-bold">{totalXP}</span>
            <span className="text-gray-500">/1000</span>
          </div>

          <button
            onClick={() => signOut().then(() => navigate('/auth'))}
            className="px-4 py-2 text-gray-600 rounded-md hover:bg-gray-200 transition text-lg"
          >
            Log out
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="bg-blue-400 w-64 text-white p-4 flex flex-col gap-4">
          <button
            onClick={() => setActiveSection('home')}
            className={`flex items-center gap-3 p-3 rounded-lg text-lg ${activeSection === 'home' ? 'bg-blue-500' : 'hover:bg-blue-500'}`}
          >
            <Home size={24} />
            <span className="font-medium">Home</span>
          </button>

          <button
            onClick={() => navigate('/game')}
            className="flex items-center gap-3 p-3 hover:bg-blue-500 rounded-lg text-lg"
          >
            <Target size={24} />
            <span className="font-medium">Learning Path</span>
          </button>

          <button
            onClick={() => navigate('/truefalse')}
            className="flex items-center gap-3 p-3 hover:bg-blue-500 rounded-lg text-lg"
          >
            <Zap size={24} />
            <span className="font-medium">Quick Quiz</span>
          </button>

          <button
            onClick={() => setActiveSection('profile')}
            className={`flex items-center gap-3 p-3 rounded-lg text-lg ${activeSection === 'profile' ? 'bg-blue-500' : 'hover:bg-blue-500'}`}
          >
            <User size={24} />
            <span className="font-medium">Profile</span>
          </button>
        </div>

        {/* Main content */}
        <div className="flex-1 p-4 overflow-y-auto">
          {activeSection === 'home' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Daily Financial Tip */}
              <div className="md:col-span-2">
                <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${dailyTip.color} p-6 shadow-lg`}>
                  <div className="absolute top-0 right-0 w-64 h-64 opacity-10">
                    <dailyTip.icon className="w-full h-full" />
                  </div>
                  <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                  <div className="absolute top-4 right-4 w-20 h-20 bg-white/10 rounded-full blur-xl" />

                  <div className="relative z-10 flex items-start gap-5">
                    <div className="flex-shrink-0 bg-white/20 backdrop-blur-sm rounded-2xl p-4">
                      <Lightbulb className="w-10 h-10 text-white" />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h2 className="text-2xl font-bold text-white">Daily Financial Tip</h2>
                        <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold text-white">
                          {dailyTip.category}
                        </span>
                      </div>

                      <p className="text-xl text-white/95 leading-relaxed font-medium mb-4">
                        "{dailyTip.tip}"
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-white/80">
                          <dailyTip.icon className="w-5 h-5" />
                          <span className="text-sm font-medium">New tip every day</span>
                        </div>

                        <button
                          onClick={() => {
                            const currentIndex = DAILY_TIPS.findIndex(t => t.tip === dailyTip.tip);
                            const nextIndex = (currentIndex + 1) % DAILY_TIPS.length;
                            setDailyTip(DAILY_TIPS[nextIndex]);
                          }}
                          className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg text-white font-semibold transition-all duration-200 hover:scale-105"
                        >
                          <RefreshCw className="w-4 h-4" />
                          Next Tip
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Daily Challenge */}
              <div className="bg-amber-50 rounded-lg p-6 shadow-sm border border-amber-100">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold">Daily Challenge</h2>
                  <div className="relative flex items-center">
                    {showStreakAnimation && (
                      <div className="absolute -top-8 right-0 animate-bounce text-amber-500 font-bold flex items-center">
                        <Flame size={20} className="mr-1" />+1
                      </div>
                    )}
                    <Flame className="text-amber-500 mr-1" size={22} />
                    <div className="bg-amber-500 rounded-full h-8 w-8 flex items-center justify-center text-white font-bold text-lg">
                      {streak}
                    </div>
                  </div>
                </div>

                <h3 className="text-xl font-bold mb-4">{dailyQuestion.question}</h3>
                <div className="flex flex-col gap-3 mb-6">
                  {dailyQuestion.options.map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => !answered && setSelectedAnswer(i)}
                      disabled={answered}
                      className={`p-4 rounded-lg text-left text-lg transition ${
                        answered
                          ? i === dailyQuestion.correct
                            ? 'bg-emerald-500 text-white'
                            : selectedAnswer === i
                              ? 'bg-red-400 text-white'
                              : 'bg-emerald-100'
                          : selectedAnswer === i
                            ? 'bg-emerald-500 text-white'
                            : 'bg-emerald-100 hover:bg-emerald-200'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>

                {answered && (
                  <p className={`text-lg font-semibold mb-4 ${isCorrect ? 'text-emerald-600' : 'text-red-500'}`}>
                    {isCorrect ? '🎉 Correct! +50 XP' : '❌ Not quite. Try again tomorrow!'}
                  </p>
                )}

                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Star className="fill-yellow-500 text-yellow-500 mr-2" size={28} />
                    <div>
                      <span className="text-sm text-gray-500">Earn</span>
                      <p className="font-bold text-lg">50 XP</p>
                    </div>
                  </div>
                  {!answered && (
                    <button
                      onClick={handleSubmitAnswer}
                      disabled={selectedAnswer === null}
                      className="bg-emerald-500 text-white px-8 py-3 rounded-lg hover:bg-emerald-600 disabled:opacity-50 text-lg font-semibold"
                    >
                      Submit
                    </button>
                  )}
                </div>
              </div>

              {/* XP and Learning Path */}
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                <div className="mb-6">
                  <h3 className="text-xl font-bold mb-2">XP Level</h3>
                  <div className="w-full bg-gray-200 rounded-full h-5">
                    <div
                      className="bg-emerald-500 h-5 rounded-full transition-all duration-500"
                      style={{ width: `${xpLevel}%` }}
                    ></div>
                  </div>
                  <div className="text-right text-lg text-gray-500 mt-1">{Math.round(xpLevel)}/100</div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold">Learning Path</h3>
                    <button onClick={() => navigate('/game')} className="text-blue-500 hover:underline text-lg">
                      View all →
                    </button>
                  </div>

                  <div className="space-y-2">
                    {LEARNING_MODULES.slice(0, 4).map((mod, idx) => {
                      const status = getModuleStatus(mod.id, idx);
                      return (
                        <button
                          key={mod.id}
                          onClick={() => status !== 'locked' && navigate(mod.route)}
                          disabled={status === 'locked'}
                          className={`w-full flex items-center gap-3 p-3 rounded-lg text-left ${
                            status === 'completed' ? 'bg-emerald-50 border-2 border-emerald-300' :
                            status === 'locked' ? 'bg-gray-100 opacity-60 cursor-not-allowed' :
                            'bg-gray-50 hover:bg-blue-50 border-2 border-transparent hover:border-blue-200'
                          }`}
                        >
                          <span className="text-2xl">{mod.icon}</span>
                          <span className="flex-1 text-lg font-medium">{mod.title}</span>
                          {status === 'completed' ? (
                            <Check size={20} className="text-emerald-600" />
                          ) : status === 'locked' ? (
                            <Lock size={18} className="text-gray-400" />
                          ) : (
                            <Play size={18} className="text-blue-500" fill="currentColor" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Financial Crossword */}
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 md:col-span-2">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold">Financial Crossword</h2>
                  {crosswordChecked && (
                    <span className={`px-4 py-2 rounded-lg text-lg font-semibold ${correctCount === 37 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                      {correctCount}/37 correct
                    </span>
                  )}
                </div>

                <div className="flex gap-8">
                  {/* Grid */}
                  <div className="flex-shrink-0">
                    <div className="inline-grid gap-0 border-2 border-gray-800" style={{ gridTemplateColumns: `repeat(${GRID[0].length}, 44px)` }}>
                      {GRID.map((row, ri) => row.map((cell, ci) => {
                        const key = `${ri}-${ci}`;
                        if (cell.isBlack) return <div key={key} className="w-11 h-11 bg-gray-900" />;

                        const highlight = getCellHighlight(ri, ci);
                        const isCorrectCell = crosswordChecked && userInputs[key]?.toUpperCase() === cell.letter;
                        const isWrongCell = crosswordChecked && userInputs[key] && userInputs[key]?.toUpperCase() !== cell.letter;

                        return (
                          <div
                            key={key}
                            onClick={() => handleCellClick(ri, ci)}
                            className={`w-11 h-11 border border-gray-400 relative cursor-pointer ${highlight}`}
                          >
                            {cell.number && (
                              <span className="absolute top-0 left-1 text-xs font-bold text-gray-600">{cell.number}</span>
                            )}
                            <input
                              ref={el => { inputRefs.current[key] = el; }}
                              type="text"
                              value={userInputs[key] || ''}
                              onChange={e => handleCellInput(ri, ci, e.target.value)}
                              onKeyDown={e => handleKeyDown(e, ri, ci)}
                              onFocus={() => setSelectedCell({ row: ri, col: ci })}
                              maxLength={1}
                              className={`w-full h-full text-center text-lg font-bold uppercase bg-transparent outline-none cursor-pointer ${
                                isCorrectCell ? 'text-green-600' : isWrongCell ? 'text-red-500' : 'text-gray-900'
                              }`}
                            />
                          </div>
                        );
                      }))}
                    </div>

                    <div className="flex gap-3 mt-4">
                      <button onClick={checkCrossword} className="px-6 py-3 bg-blue-500 text-white text-lg font-semibold rounded-lg hover:bg-blue-600">
                        Check Answers
                      </button>
                      <button onClick={resetCrossword} className="px-6 py-3 bg-gray-200 text-gray-700 text-lg font-semibold rounded-lg hover:bg-gray-300">
                        Reset
                      </button>
                    </div>
                  </div>

                  {/* Clues */}
                  <div className="flex-1 grid grid-cols-2 gap-8">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="font-bold text-blue-800 mb-3 text-xl">Across</h3>
                      <div className="space-y-2">
                        {acrossClues.map(c => (
                          <p key={c.number} className="text-lg">
                            <span className="font-bold text-blue-700">{c.number}.</span> {c.clue}
                          </p>
                        ))}
                      </div>
                    </div>
                    <div className="bg-emerald-50 p-4 rounded-lg">
                      <h3 className="font-bold text-emerald-800 mb-3 text-xl">Down</h3>
                      <div className="space-y-2">
                        {downClues.map(c => (
                          <p key={c.number} className="text-lg">
                            <span className="font-bold text-emerald-700">{c.number}.</span> {c.clue}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Profile Section */
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 mb-6">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                    {user.displayName?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase()}
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold">{user.displayName || user.email?.split('@')[0]}</h1>
                    <p className="text-gray-500 text-lg">{user.email}</p>
                    <span className="inline-block mt-2 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-lg font-medium">
                      {completedModules === totalModules ? '🏆 Certified' : '📚 Student'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-lg p-6 shadow-sm border text-center">
                  <p className="text-3xl font-bold text-amber-600">{totalXP}</p>
                  <p className="text-gray-500 text-lg">Total XP</p>
                </div>
                <div className="bg-white rounded-lg p-6 shadow-sm border text-center">
                  <p className="text-3xl font-bold text-emerald-600">{completedModules}</p>
                  <p className="text-gray-500 text-lg">Modules Done</p>
                </div>
                <div className="bg-white rounded-lg p-6 shadow-sm border text-center">
                  <p className="text-3xl font-bold text-orange-500">{streak}</p>
                  <p className="text-gray-500 text-lg">Day Streak</p>
                </div>
                <div className="bg-white rounded-lg p-6 shadow-sm border text-center">
                  <p className="text-3xl font-bold text-blue-600">{Math.round((completedModules / totalModules) * 100)}%</p>
                  <p className="text-gray-500 text-lg">Progress</p>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <h2 className="text-2xl font-bold mb-4">Module Progress</h2>
                <div className="space-y-3">
                  {LEARNING_MODULES.map((mod, idx) => {
                    const score = getModuleScore(mod.id as Parameters<typeof getModuleScore>[0]);
                    const status = getModuleStatus(mod.id, idx);
                    return (
                      <div key={mod.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                        <span className="text-2xl">{mod.icon}</span>
                        <div className="flex-1">
                          <p className="font-semibold text-lg">{mod.title}</p>
                          <p className="text-gray-500">{mod.subtitle}</p>
                        </div>
                        {score ? (
                          <span className="text-lg font-bold">{score.score}/{score.maxScore}</span>
                        ) : (
                          <span className="text-gray-400 text-lg">{status === 'locked' ? 'Locked' : 'Not started'}</span>
                        )}
                        {status === 'completed' && <Check size={24} className="text-emerald-600" />}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FinLitApp;
