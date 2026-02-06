import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Star, BookOpen, Home, Target, User, Check, Flame, GraduationCap, Loader2, Lock, Play, Zap, Lightbulb, TrendingUp, PiggyBank, Shield, CreditCard, Wallet, RefreshCw, Settings, Menu, X, Calculator, ChevronRight, Trophy, Gamepad2, Brain, Award, HelpCircle, LogOut, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthContext } from '../auth/context/AuthContext';
import { useModuleScore, MODULES } from '../hooks/useModuleScore';
import HowToPlayModal from '../components/HowToPlayModal';
import { getActiveDailyChallengeQuestion } from '../firebase/firestore.service';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';

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
  // Across - from CSV data
  { number: 1, clue: "Money paid for borrowing money", answer: "INTEREST", startRow: 0, startCol: 0, direction: 'across' },
  { number: 4, clue: "Strategy for financial success", answer: "PLAN", startRow: 2, startCol: 3, direction: 'across' },
  { number: 6, clue: "Fixed period for a loan or investment", answer: "TERM", startRow: 3, startCol: 7, direction: 'across' },
  { number: 7, clue: "Money available for a purpose", answer: "FUNDS", startRow: 4, startCol: 1, direction: 'across' },
  { number: 9, clue: "Value of ownership in an asset", answer: "EQUITY", startRow: 5, startCol: 5, direction: 'across' },
  { number: 10, clue: "To put money into a venture", answer: "INVEST", startRow: 6, startCol: 0, direction: 'across' },
  { number: 15, clue: "To be in debt", answer: "OWE", startRow: 8, startCol: 4, direction: 'across' },
  { number: 16, clue: "To give money for goods or services", answer: "PAY", startRow: 8, startCol: 8, direction: 'across' },
  { number: 17, clue: "A payment for a service", answer: "FEE", startRow: 10, startCol: 0, direction: 'across' },
  { number: 18, clue: "Mandatory contributions to state revenue", answer: "TAXES", startRow: 10, startCol: 6, direction: 'across' },
  // Down - from CSV data
  { number: 2, clue: "Money spent on goods or services", answer: "EXPENSE", startRow: 0, startCol: 3, direction: 'down' },
  { number: 3, clue: "Ability to borrow money with a promise to repay", answer: "CREDIT", startRow: 1, startCol: 8, direction: 'down' },
  { number: 5, clue: "Something of value owned", answer: "ASSET", startRow: 2, startCol: 5, direction: 'down' },
  { number: 8, clue: "Potential for loss in an investment", answer: "RISK", startRow: 5, startCol: 0, direction: 'down' },
  { number: 11, clue: "Worth of an asset", answer: "VALUE", startRow: 6, startCol: 2, direction: 'down' },
  { number: 12, clue: "Type of security representing ownership", answer: "STOCK", startRow: 6, startCol: 4, direction: 'down' },
  { number: 13, clue: "Money owed to another party", answer: "DEBT", startRow: 7, startCol: 6, direction: 'down' },
  { number: 14, clue: "Percentage of interest", answer: "RATE", startRow: 7, startCol: 9, direction: 'down' }
];

const generateGrid = (): CrosswordCell[][] => {
  const rows = 11;
  const cols = 11;
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

// Animated Guide Steps
const GUIDE_STEPS = [
  {
    icon: Target,
    title: "Complete Learning Path",
    description: "Master all 10 financial modules to build your knowledge",
    color: "from-blue-500 to-indigo-600",
    bgColor: "bg-blue-50",
    route: "/game"
  },
  {
    icon: Zap,
    title: "Play Daily Quiz",
    description: "Answer daily challenges to earn XP and maintain your streak",
    color: "from-amber-500 to-orange-600",
    bgColor: "bg-amber-50",
    route: null // scroll to daily challenge
  },
  {
    icon: Brain,
    title: "Solve Crossword",
    description: "Test your financial vocabulary with interactive puzzles",
    color: "from-emerald-500 to-teal-600",
    bgColor: "bg-emerald-50",
    route: null // scroll to crossword
  },
  {
    icon: Trophy,
    title: "Earn Certificate",
    description: "Complete all modules to unlock your achievement certificate",
    color: "from-purple-500 to-pink-600",
    bgColor: "bg-purple-50",
    route: "/certificate"
  }
];

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

// Default Daily Questions (fallback if no active challenge in database)
const DEFAULT_DAILY_QUESTIONS = [
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
  { id: MODULES.CREDIT_SCORE.id, title: "Credit Score", subtitle: "Credit Management", icon: "📊", route: "/credit-score", points: 150 },
  { id: MODULES.EMERGENCY_FUND.id, title: "Emergency Fund", subtitle: "Financial Safety", icon: "🆘", route: "/emergency-fund", points: 150 },
  { id: MODULES.STOCK_MARKET.id, title: "Stock Market", subtitle: "Investment Basics", icon: "📈", route: "/stock-market", points: 200 },
  { id: MODULES.INSURANCE.id, title: "Insurance", subtitle: "Risk Management", icon: "🛡️", route: "/insurance", points: 150 },
  { id: MODULES.DEBT_MANAGEMENT.id, title: "Debt Management", subtitle: "Debt Freedom", icon: "🔓", route: "/debt-management", points: 200 },
  { id: MODULES.RETIREMENT_ACCOUNTS.id, title: "Retirement Accounts", subtitle: "401(k) & Roth IRA", icon: "🏦", route: "/retirement-accounts", points: 200 },
  { id: MODULES.CRYPTO.id, title: "Cryptocurrency", subtitle: "Digital Assets", icon: "🪙", route: "/crypto", points: 200 },
  { id: MODULES.INVESTMENT_BANKING.id, title: "Investment Banking", subtitle: "IPO Knowledge", icon: "🏦", route: "/investment-quiz", points: 150 },
];

const FinLitApp: React.FC = () => {
  const navigate = useNavigate();
  const { user, signOut, isLoading: authLoading } = useAuthContext();
  const { progress, isModulePassed, getModuleScore, checkAndUpdateDailyStreak, refreshProgress, submitDailyChallenge, saveCrossword, loadCrosswordProgress } = useModuleScore();

  const [activeSection, setActiveSection] = useState<'home' | 'profile'>('home');
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [dailyQuestion, setDailyQuestion] = useState<{ question: string; options: string[]; correct: number; explanation?: string } | null>(null);
  const [loadingDailyChallenge, setLoadingDailyChallenge] = useState(true);
  const [dailyTip, setDailyTip] = useState(() => DAILY_TIPS[new Date().getDate() % DAILY_TIPS.length]);
  const [answered, setAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showStreakAnimation, setShowStreakAnimation] = useState(false);
  const [showCertTooltip, setShowCertTooltip] = useState(false);
  const [streakChecked, setStreakChecked] = useState(false);
  const [dailyChallengeCompleted, setDailyChallengeCompleted] = useState(false);
  const [xpAwarded, setXpAwarded] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [previousChallengeId, setPreviousChallengeId] = useState<string | null>(null);
  const [showChallengeUpdateNotification, setShowChallengeUpdateNotification] = useState(false);

  // Listen for real-time changes to active daily challenge
  useEffect(() => {
    if (!user) return;

    setLoadingDailyChallenge(true);

    // Listen to changes in the daily challenge configuration
    const configRef = doc(db, 'dailyChallengeConfig', 'active');
    const unsubscribe = onSnapshot(configRef, async (configSnapshot) => {
      try {
        let activeChallengeId: string | null = null;

        if (configSnapshot.exists()) {
          activeChallengeId = configSnapshot.data().activeChallengeId || null;
        }

        // Load the active challenge question
        const activeChallenge = await getActiveDailyChallengeQuestion();

        if (activeChallenge) {
          setDailyQuestion({
            question: activeChallenge.question,
            options: activeChallenge.options,
            correct: activeChallenge.correct,
            explanation: activeChallenge.explanation
          });

          // Check if challenge changed (reset progress)
          if (previousChallengeId && previousChallengeId !== activeChallenge.id) {
            console.log('Daily challenge changed, resetting progress');
            // Challenge changed, reset user's answer state
            setAnswered(false);
            setIsCorrect(false);
            setDailyChallengeCompleted(false);
            setSelectedAnswer(null);
            setXpAwarded(false);

            // Show update notification
            setShowChallengeUpdateNotification(true);
            setTimeout(() => setShowChallengeUpdateNotification(false), 4000);
          } else {
            // Check if user already completed today's challenge
            if (progress?.lastDailyChallengeDate) {
              const today = new Date().toISOString().split('T')[0];
              if (progress.lastDailyChallengeDate === today) {
                setAnswered(true);
                setIsCorrect(true);
                setDailyChallengeCompleted(true);
              }
            }
          }
          setPreviousChallengeId(activeChallenge.id);
        } else {
          // No active challenge, use default
          const defaultQ = DEFAULT_DAILY_QUESTIONS[new Date().getDate() % DEFAULT_DAILY_QUESTIONS.length];
          setDailyQuestion(defaultQ);

          // Check if user already completed today's challenge
          if (progress?.lastDailyChallengeDate) {
            const today = new Date().toISOString().split('T')[0];
            if (progress.lastDailyChallengeDate === today) {
              setAnswered(true);
              setIsCorrect(true);
              setDailyChallengeCompleted(true);
            }
          }
        }
      } catch (err) {
        console.error('Error loading daily challenge:', err);
        // Fallback to default questions
        const defaultQ = DEFAULT_DAILY_QUESTIONS[new Date().getDate() % DEFAULT_DAILY_QUESTIONS.length];
        setDailyQuestion(defaultQ);
      } finally {
        setLoadingDailyChallenge(false);
      }
    });

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, [user, progress?.lastDailyChallengeDate, previousChallengeId]);

  // Crossword state
  const [userInputs, setUserInputs] = useState<{ [key: string]: string }>({});
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [selectedDirection, setSelectedDirection] = useState<'across' | 'down'>('across');
  const [selectedClue, setSelectedClue] = useState<ClueData | null>(null);
  const [crosswordChecked, setCrosswordChecked] = useState(false);
  const [correctWordsCount, setCorrectWordsCount] = useState(0);
  const [previouslyCorrectWords, setPreviouslyCorrectWords] = useState<string[]>([]);
  const [crosswordXpAwarded, setCrosswordXpAwarded] = useState(0);
  const [crosswordLoaded, setCrosswordLoaded] = useState(false);
  const inputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  const clueRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  // Calculations
  const moduleOrder = LEARNING_MODULES.map(m => m.id);
  const completedModules = LEARNING_MODULES.filter(m => isModulePassed(m.id)).length;
  const totalModules = LEARNING_MODULES.length;
  const streak = progress?.streak ?? 0;
  const totalXP = progress?.totalXP ?? 0;
  const xpLevel = Math.floor(totalXP / 100) + 1; // Level based on 100 XP per level
  const xpProgress = (totalXP % 100); // Progress within current level

  const isModuleAccessible = (idx: number) => idx === 0 || isModulePassed(moduleOrder[idx - 1]);
  const getModuleStatus = (moduleId: string, idx: number) => {
    if (isModulePassed(moduleId as Parameters<typeof isModulePassed>[0])) return 'completed';
    if (!isModuleAccessible(idx)) return 'locked';
    const moduleScore = progress?.moduleScores?.find(s => s.moduleId === moduleId);
    if (moduleScore && moduleScore.attempts > 0) return 'in_progress';
    return 'next';
  };

  // Crossword handlers
  // Helper function to find which words a cell belongs to
  const getWordsForCell = useCallback((row: number, col: number) => {
    const words: { across: ClueData | null, down: ClueData | null } = { across: null, down: null };

    CROSSWORD_CLUES.forEach(clue => {
      const { startRow, startCol, direction, answer } = clue;

      if (direction === 'across') {
        if (row === startRow && col >= startCol && col < startCol + answer.length) {
          words.across = clue;
        }
      } else {
        if (col === startCol && row >= startRow && row < startRow + answer.length) {
          words.down = clue;
        }
      }
    });

    return words;
  }, []);

  const handleCellClick = (row: number, col: number) => {
    if (GRID[row][col].isBlack) return;

    const words = getWordsForCell(row, col);

    if (selectedCell?.row === row && selectedCell?.col === col) {
      // Toggle direction if clicking the same cell, but only if both directions are valid
      if (words.across && words.down) {
        setSelectedDirection(prev => prev === 'across' ? 'down' : 'across');
      }
    } else {
      setSelectedCell({ row, col });

      // Smart direction selection based on available words
      if (words.across && words.down) {
        // If both directions are available, prefer the one that starts at this cell
        const cellNumber = GRID[row][col].number;
        if (cellNumber) {
          const startsAcross = words.across.number === cellNumber;
          const startsDown = words.down.number === cellNumber;

          if (startsAcross && !startsDown) {
            setSelectedDirection('across');
            setSelectedClue(words.across);
          } else if (startsDown && !startsAcross) {
            setSelectedDirection('down');
            setSelectedClue(words.down);
          } else {
            // Both start here or neither, keep current direction or default to across
            const newDirection = selectedDirection || 'across';
            setSelectedDirection(newDirection);
            setSelectedClue(newDirection === 'across' ? words.across : words.down);
          }
        } else {
          // Not a starting cell, keep current direction or default to across
          const newDirection = selectedDirection || 'across';
          setSelectedDirection(newDirection);
          setSelectedClue(newDirection === 'across' ? words.across : words.down);
        }
      } else if (words.across) {
        setSelectedDirection('across');
        setSelectedClue(words.across);
      } else if (words.down) {
        setSelectedDirection('down');
        setSelectedClue(words.down);
      }
    }
    inputRefs.current[`${row}-${col}`]?.focus();
  };

  const handleClueClick = (clue: ClueData) => {
    setSelectedClue(clue);
    setSelectedDirection(clue.direction);
    setSelectedCell({ row: clue.startRow, col: clue.startCol });
    setTimeout(() => inputRefs.current[`${clue.startRow}-${clue.startCol}`]?.focus(), 0);
  };

  const getNextCell = useCallback((row: number, col: number, dir: 'across' | 'down', forward = true, skipFilled = false) => {
    const delta = forward ? 1 : -1;
    let nextRow = dir === 'down' ? row + delta : row;
    let nextCol = dir === 'across' ? col + delta : col;

    // Keep looking for next valid cell
    while (nextRow >= 0 && nextRow < GRID.length && nextCol >= 0 && nextCol < GRID[0].length) {
      // If it's a black cell, stop
      if (GRID[nextRow][nextCol].isBlack) {
        break;
      }

      // If we found a valid cell
      const nextKey = `${nextRow}-${nextCol}`;

      // If we're not skipping filled cells, or this cell is empty, return it
      if (!skipFilled || !userInputs[nextKey]) {
        return { row: nextRow, col: nextCol };
      }

      // Move to next cell
      nextRow = dir === 'down' ? nextRow + delta : nextRow;
      nextCol = dir === 'across' ? nextCol + delta : nextCol;
    }
    return null;
  }, [userInputs]);

  const handleCellInput = (row: number, col: number, value: string) => {
    const key = `${row}-${col}`;
    const letter = value.toUpperCase().slice(-1);
    if (letter === '' || /^[A-Z]$/.test(letter)) {
      setUserInputs(prev => ({ ...prev, [key]: letter }));
      setCrosswordChecked(false);
      if (letter !== '') {
        // First try to find the next empty cell
        let next = getNextCell(row, col, selectedDirection, true, true);

        // If no empty cell found, go to the next available cell (even if filled)
        if (!next) {
          next = getNextCell(row, col, selectedDirection, true, false);
        }

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
      const prev = getNextCell(row, col, selectedDirection, false, false);
      if (prev) {
        setSelectedCell(prev);
        setUserInputs(p => ({ ...p, [`${prev.row}-${prev.col}`]: '' }));
        setTimeout(() => inputRefs.current[`${prev.row}-${prev.col}`]?.focus(), 0);
      }
      e.preventDefault();
    } else if (['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp'].includes(e.key)) {
      const dir = e.key.includes('Right') || e.key.includes('Left') ? 'across' : 'down';
      const forward = e.key.includes('Right') || e.key.includes('Down');
      const next = getNextCell(row, col, dir, forward, false);
      if (next) {
        setSelectedCell(next);
        setSelectedDirection(dir);
        setTimeout(() => inputRefs.current[`${next.row}-${next.col}`]?.focus(), 0);
      }
      e.preventDefault();
    }
  };

  // Check which words are correctly completed
  const getCorrectWords = useCallback(() => {
    const correctWords: string[] = [];

    CROSSWORD_CLUES.forEach(clue => {
      const { answer, startRow, startCol, direction, number } = clue;
      let isWordCorrect = true;

      for (let i = 0; i < answer.length; i++) {
        const row = direction === 'across' ? startRow : startRow + i;
        const col = direction === 'across' ? startCol + i : startCol;
        const key = `${row}-${col}`;

        if (userInputs[key]?.toUpperCase() !== answer[i]) {
          isWordCorrect = false;
          break;
        }
      }

      if (isWordCorrect) {
        correctWords.push(`${number}-${direction}`);
      }
    });

    return correctWords;
  }, [userInputs]);

  const checkCrossword = async () => {
    const correctWords = getCorrectWords();

    // Find newly correct words (not previously saved)
    const newlyCorrectWords = correctWords.filter(w => !previouslyCorrectWords.includes(w));

    setCorrectWordsCount(correctWords.length);
    setCrosswordChecked(true);

    // Save progress and award XP for new correct words
    if (user) {
      const result = await saveCrossword(userInputs, newlyCorrectWords, correctWords);
      if (result.xpAwarded > 0) {
        setCrosswordXpAwarded(result.xpAwarded);
        setPreviouslyCorrectWords(correctWords);
      }
    }
  };

  const resetCrossword = () => {
    setUserInputs({});
    setCrosswordChecked(false);
    setSelectedCell(null);
    setCorrectWordsCount(0);
    setCrosswordXpAwarded(0);
  };

  const getCellHighlight = (row: number, col: number) => {
    if (GRID[row][col].isBlack) return '';

    // Highlight the active cell
    if (selectedCell?.row === row && selectedCell?.col === col) return 'bg-blue-400';

    // Highlight the word being worked on
    if (selectedClue) {
      const { startRow, startCol, direction, answer } = selectedClue;

      if (direction === 'across') {
        if (row === startRow && col >= startCol && col < startCol + answer.length) {
          return 'bg-blue-100';
        }
      } else {
        if (col === startCol && row >= startRow && row < startRow + answer.length) {
          return 'bg-emerald-100';
        }
      }
    }

    return '';
  };

  const triggerStreakAnimation = () => {
    setShowStreakAnimation(true);
    setTimeout(() => setShowStreakAnimation(false), 3000);
  };

  // Check and update daily streak on mount
  useEffect(() => {
    const checkStreak = async () => {
      if (user && !streakChecked) {
        setStreakChecked(true);
        const result = await checkAndUpdateDailyStreak();
        if (result.incrementedToday) {
          triggerStreakAnimation();
          // Refresh progress to get updated data
          await refreshProgress();
        }
      }
    };
    checkStreak();
  }, [user, streakChecked, checkAndUpdateDailyStreak, refreshProgress]);

  // Load saved crossword progress on mount
  useEffect(() => {
    const loadSavedCrossword = async () => {
      if (user && !crosswordLoaded) {
        setCrosswordLoaded(true);
        const savedProgress = await loadCrosswordProgress();
        if (savedProgress) {
          setUserInputs(savedProgress.answers);
          setPreviouslyCorrectWords(savedProgress.correctWords);
          setCorrectWordsCount(savedProgress.correctWords.length);
        }
      }
    };
    loadSavedCrossword();
  }, [user, crosswordLoaded, loadCrosswordProgress]);

  // Scroll selected clue into view when it changes
  useEffect(() => {
    if (selectedClue) {
      const clueKey = `${selectedClue.number}-${selectedClue.direction}`;
      const clueElement = clueRefs.current[clueKey];
      if (clueElement) {
        clueElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [selectedClue]);

  const handleSubmitAnswer = async () => {
    if (selectedAnswer === null || answered || !dailyQuestion) return;
    const correct = selectedAnswer === dailyQuestion.correct;
    setIsCorrect(correct);
    setAnswered(true);

    if (correct) {
      // Award XP for correct answer (only once per day)
      const result = await submitDailyChallenge();
      if (result.awarded) {
        setXpAwarded(true);
      } else if (result.alreadyCompleted) {
        setDailyChallengeCompleted(true);
      }
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-blue-50">
        <Loader2 className="animate-spin text-blue-500" size={48} />
      </div>
    );
  }

  if (!user) {
    return null; // ProtectedRoute will handle the redirect
  }

  const acrossClues = CROSSWORD_CLUES.filter(c => c.direction === 'across').sort((a, b) => a.number - b.number);
  const downClues = CROSSWORD_CLUES.filter(c => c.direction === 'down').sort((a, b) => a.number - b.number);

  return (
    <div className="flex flex-col h-screen bg-blue-50">
      {/* Header */}
      <header className="bg-blue-100 p-3 sm:p-4 flex justify-between items-center border-b border-blue-200">
        <div className="flex items-center gap-2">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 hover:bg-blue-200 rounded-lg transition-colors"
          >
            {mobileMenuOpen ? <X size={24} className="text-blue-700" /> : <Menu size={24} className="text-blue-700" />}
          </button>

          <img
            src="/veo2.png"
            alt="FinLit Logo"
            className="h-8 sm:h-10 w-auto object-contain"
            style={{
              mixBlendMode: 'darken',
              filter: 'brightness(1.1) contrast(1.2)'
            }}
          />
        </div>

        <div className="flex items-center gap-2 sm:gap-4 md:gap-6">
          {/* User Info - Hidden on small mobile, shown on larger screens */}
          <div className="hidden sm:flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm sm:text-lg font-bold">
                {user.displayName?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <span className="hidden md:inline text-blue-800 font-semibold text-base sm:text-lg truncate max-w-[120px] lg:max-w-none">
                {user.displayName || user.email}
              </span>
            </div>

            {/* How to Play Button - Desktop */}
            <button
              onClick={() => setShowHowToPlay(true)}
              className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-blue-200 transition-colors text-blue-800 hover:text-blue-900 font-medium"
              title="How to Play"
            >
              <HelpCircle size={18} />
              <span className="hidden md:inline text-sm">How to Play</span>
            </button>
          </div>

          {/* How to Play Button - Mobile only */}
          <button
            onClick={() => setShowHowToPlay(true)}
            className="sm:hidden p-2 rounded-lg hover:bg-blue-200 transition-colors text-blue-700"
            title="How to Play"
          >
            <HelpCircle size={20} />
          </button>

          {/* Certificate Icon - Hidden on mobile in header, shown in sidebar */}
          <div
            className="hidden sm:block relative cursor-pointer"
            onMouseEnter={() => setShowCertTooltip(true)}
            onMouseLeave={() => setShowCertTooltip(false)}
            onClick={() => {
              if (completedModules === totalModules) {
                navigate('/certificate');
              }
            }}
          >
            <GraduationCap
              className={`${completedModules === totalModules ? 'text-emerald-500' : 'text-yellow-500'}`}
              size={24}
            />
            {showCertTooltip && (
              <div className="absolute top-10 -left-20 bg-white p-3 rounded-lg shadow-lg text-sm w-52 z-10 border">
                <p className="font-bold mb-1">Financial Literacy Certificate</p>
                <p className="text-gray-600">
                  {completedModules === totalModules
                    ? 'Congratulations! Click to view your certificate!'
                    : `Complete ${totalModules - completedModules} more modules to unlock your certificate!`
                  }
                </p>
              </div>
            )}
          </div>

          {/* XP Display */}
          <div className="text-base sm:text-lg">
            <span className="font-bold">{totalXP}</span>
            <span className="text-gray-600 ml-1">XP</span>
          </div>

          {/* Logout Button - Icon only on mobile */}
          <button
            onClick={() => signOut().then(() => navigate('/auth'))}
            className="px-2 py-1.5 sm:px-4 sm:py-2 text-gray-600 rounded-md hover:bg-gray-200 transition text-sm sm:text-lg"
          >
            <span className="hidden sm:inline">Log out</span>
            <span className="sm:hidden">⏏</span>
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Responsive */}
        <div className={`
          fixed lg:static inset-y-0 left-0 z-40
          bg-blue-400 w-64 text-white p-4 flex flex-col gap-3 sm:gap-4
          transform transition-transform duration-300 ease-in-out
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          mt-[57px] sm:mt-[65px] lg:mt-0
          overflow-y-auto overflow-x-hidden
          max-h-[calc(100vh-57px)] sm:max-h-[calc(100vh-65px)] lg:max-h-none
        `}>
          <button
            onClick={() => {
              setActiveSection('home');
              setMobileMenuOpen(false);
            }}
            className={`flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg text-sm sm:text-base lg:text-lg ${activeSection === 'home' ? 'bg-blue-500' : 'hover:bg-blue-500'}`}
          >
            <Home size={20} className="sm:w-6 sm:h-6" />
            <span className="font-medium">Home</span>
          </button>

          <button
            onClick={() => {
              navigate('/game');
              setMobileMenuOpen(false);
            }}
            className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 hover:bg-blue-500 rounded-lg text-sm sm:text-base lg:text-lg"
          >
            <Target size={20} className="sm:w-6 sm:h-6" />
            <span className="font-medium">Learning Path</span>
          </button>

          <button
            onClick={() => {
              navigate('/economic-quiz');
              setMobileMenuOpen(false);
            }}
            className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 hover:bg-blue-500 rounded-lg text-sm sm:text-base lg:text-lg"
          >
            <Zap size={20} className="sm:w-6 sm:h-6" />
            <span className="font-medium">Quick Quiz</span>
          </button>

          <button
            onClick={() => {
              navigate('/games');
              setMobileMenuOpen(false);
            }}
            className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 hover:bg-blue-500 rounded-lg text-sm sm:text-base lg:text-lg"
          >
            <Gamepad2 size={20} className="sm:w-6 sm:h-6" />
            <span className="font-medium">Games</span>
          </button>

          <button
            onClick={() => {
              navigate('/case-study');
              setMobileMenuOpen(false);
            }}
            className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 hover:bg-blue-500 rounded-lg text-sm sm:text-base lg:text-lg"
          >
            <BookOpen size={20} className="sm:w-6 sm:h-6" />
            <span className="font-medium">Case Study</span>
          </button>

          <button
            onClick={() => {
              navigate('/financial-tools');
              setMobileMenuOpen(false);
            }}
            className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 hover:bg-blue-500 rounded-lg text-sm sm:text-base lg:text-lg"
          >
            <Calculator size={20} className="sm:w-6 sm:h-6" />
            <span className="font-medium">Financial Tools</span>
          </button>

          <button
            onClick={() => {
              navigate('/big-money-decisions');
              setMobileMenuOpen(false);
            }}
            className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 hover:bg-blue-500 rounded-lg text-sm sm:text-base lg:text-lg"
          >
            <DollarSign size={20} className="sm:w-6 sm:h-6" />
            <span className="font-medium">Big Money Decisions</span>
          </button>

          <button
            onClick={() => {
              navigate('/money-personality');
              setMobileMenuOpen(false);
            }}
            className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 hover:bg-blue-500 rounded-lg text-sm sm:text-base lg:text-lg"
          >
            <Brain size={20} className="sm:w-6 sm:h-6" />
            <span className="font-medium">Money Personality</span>
          </button>

          <button
            onClick={() => {
              setActiveSection('profile');
              setMobileMenuOpen(false);
            }}
            className={`flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg text-sm sm:text-base lg:text-lg ${activeSection === 'profile' ? 'bg-blue-500' : 'hover:bg-blue-500'}`}
          >
            <User size={20} className="sm:w-6 sm:h-6" />
            <span className="font-medium">Profile</span>
          </button>

          {/* Certificate Button - Always visible */}
          <button
            onClick={() => {
              navigate('/certificate');
              setMobileMenuOpen(false);
            }}
            className={`flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg text-sm sm:text-base lg:text-lg ${completedModules === totalModules ? 'bg-emerald-500' : 'hover:bg-blue-500'}`}

          >
            <GraduationCap
              size={20}
              className={`sm:w-6 sm:h-6 ${completedModules === totalModules ? 'text-white' : 'text-yellow-200'}`}
            />
            <span className="font-medium">Certificate</span>
          </button>

          {/* Admin Panel Link - Only for admin and owner roles */}
          {(user?.role === 'admin' || user?.role === 'owner') && (
            <button
              onClick={() => {
                navigate(user?.role === 'owner' ? '/admin-setup' : '/admin');
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 hover:bg-blue-500 rounded-lg text-sm sm:text-base lg:text-lg bg-blue-600/50 border border-white/20"
            >
              <Settings size={20} className="sm:w-6 sm:h-6" />
              <span className="font-medium">Admin Panel</span>
            </button>
          )}

          {/* Logout Button - Mobile sidebar */}
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              signOut().then(() => navigate('/auth'));
            }}
            className="lg:hidden flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 hover:bg-red-500/80 rounded-lg text-sm sm:text-base mt-auto bg-red-500/60 border border-red-300/50"
          >
            <LogOut size={20} className="sm:w-6 sm:h-6" />
            <span className="font-medium">Log out</span>
          </button>
        </div>

        {/* Mobile Overlay */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            style={{ top: '57px' }}
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Main content */}
        <div className="flex-1 p-2 sm:p-3 md:p-4 overflow-y-auto">
          {activeSection === 'home' ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
              {/* Daily Financial Tip - Compact on mobile */}
              <div className="lg:col-span-2">
                <div className="relative overflow-hidden rounded-lg sm:rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 p-3 sm:p-6 shadow-lg">
                  <div className="absolute top-0 right-0 w-20 h-20 sm:w-64 sm:h-64 opacity-10">
                    <dailyTip.icon className="w-full h-full" />
                  </div>
                  <div className="hidden sm:block absolute -bottom-8 -left-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                  <div className="hidden sm:block absolute top-4 right-4 w-20 h-20 bg-white/10 rounded-full blur-xl" />

                  <div className="relative z-10 flex flex-row items-start gap-2 sm:gap-5">
                    <div className="flex-shrink-0 bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-2xl p-2 sm:p-4">
                      <Lightbulb className="w-5 h-5 sm:w-10 sm:h-10 text-white" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-3 mb-1 sm:mb-3">
                        <h2 className="text-sm sm:text-2xl font-bold text-white">Daily Tip</h2>
                        <span className="px-1.5 sm:px-3 py-0.5 sm:py-1 bg-white/20 backdrop-blur-sm rounded-full text-[10px] sm:text-sm font-semibold text-white">
                          {dailyTip.category}
                        </span>
                      </div>

                      <p className="text-xs sm:text-xl text-white/95 leading-snug sm:leading-relaxed font-medium mb-2 sm:mb-4">
                        "{dailyTip.tip}"
                      </p>

                      <div className="flex flex-row items-center justify-between gap-2">
                        <div className="hidden sm:flex items-center gap-2 text-white/80">
                          <dailyTip.icon className="w-5 h-5" />
                          <span className="text-sm font-medium">New tip every day</span>
                        </div>

                        <button
                          onClick={() => {
                            const currentIndex = DAILY_TIPS.findIndex(t => t.tip === dailyTip.tip);
                            const nextIndex = (currentIndex + 1) % DAILY_TIPS.length;
                            setDailyTip(DAILY_TIPS[nextIndex]);
                          }}
                          className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1 sm:py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-md sm:rounded-lg text-white text-xs sm:text-base font-semibold transition-all duration-200 hover:scale-105"
                        >
                          <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4" />
                          Next
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Challenge Update Notification */}
              {showChallengeUpdateNotification && (
                <div className="lg:col-span-2 mb-4">
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <Flame className="text-white" size={16} />
                      </div>
                      <div>
                        <p className="font-semibold text-blue-800">Daily Challenge Updated!</p>
                        <p className="text-sm text-blue-600">A new question is now available. Give it a try!</p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              )}

              {/* Daily Challenge */}
              <div className="bg-amber-50 rounded-lg p-4 sm:p-6 shadow-sm border border-amber-100">
                <div className="flex justify-between items-center mb-3 sm:mb-4">
                  <h2 className="text-xl sm:text-2xl font-bold">Daily Challenge</h2>
                  <div className="relative flex items-center">
                    {showStreakAnimation && (
                      <div className="absolute -top-8 right-0 animate-bounce text-amber-500 font-bold flex items-center text-sm sm:text-base">
                        <Flame size={16} className="sm:w-5 sm:h-5 mr-1" />+1
                      </div>
                    )}
                    <Flame className="text-amber-500 mr-1" size={18} />
                    <div className="bg-amber-500 rounded-full h-7 w-7 sm:h-8 sm:w-8 flex items-center justify-center text-white font-bold text-base sm:text-lg">
                      {streak}
                    </div>
                  </div>
                </div>

                {loadingDailyChallenge ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="animate-spin text-amber-500" size={32} />
                  </div>
                ) : dailyQuestion ? (
                  <>
                    <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">{dailyQuestion.question}</h3>
                    <div className="flex flex-col gap-2 sm:gap-3 mb-4 sm:mb-6">
                      {dailyQuestion.options.map((opt, i) => (
                        <button
                          key={i}
                          onClick={() => !answered && setSelectedAnswer(i)}
                          disabled={answered}
                          className={`p-3 sm:p-4 rounded-lg text-left text-sm sm:text-lg transition ${answered
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
                  </>
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    <p>No daily challenge available at the moment.</p>
                  </div>
                )}

                {answered && (
                  <div className="mb-3 sm:mb-4">
                    <p className={`text-sm sm:text-lg font-semibold mb-2 ${isCorrect ? 'text-emerald-600' : 'text-red-500'}`}>
                      {isCorrect
                        ? (xpAwarded ? '🎉 Correct! +5 XP' : (dailyChallengeCompleted ? '🎉 Correct! (Already earned XP today)' : '🎉 Correct!'))
                        : '❌ Not quite. Try again tomorrow!'}
                    </p>
                    {dailyQuestion?.explanation && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                        <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                          <Lightbulb size={16} className="text-blue-600" />
                          Explanation
                        </h4>
                        <p className="text-sm sm:text-base text-blue-700 leading-relaxed">
                          {dailyQuestion.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="flex items-center">
                    <Star className="fill-yellow-500 text-yellow-500 mr-2" size={24} />
                    <div>
                      <span className="text-xs sm:text-sm text-gray-500">Earn</span>
                      <p className="font-bold text-base sm:text-lg">5 XP</p>
                    </div>
                  </div>
                  {!answered && (
                    <button
                      onClick={handleSubmitAnswer}
                      disabled={selectedAnswer === null}
                      className="w-full sm:w-auto bg-emerald-500 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg hover:bg-emerald-600 disabled:opacity-50 text-base sm:text-lg font-semibold"
                    >
                      Submit
                    </button>
                  )}
                </div>
              </div>



              {/* XP and Learning Path */}
              <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-gray-100">
                <div className="mb-4 sm:mb-6">
                  <h3 className="text-lg sm:text-xl font-bold mb-2">Level {xpLevel}</h3>
                  <div className="w-full bg-gray-200 rounded-full h-4 sm:h-5">
                    <div
                      className="bg-emerald-500 h-4 sm:h-5 rounded-full transition-all duration-500"
                      style={{ width: `${xpProgress}%` }}
                    ></div>
                  </div>
                  <div className="text-right text-base sm:text-lg text-gray-500 mt-1">{xpProgress}/100 XP</div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-3 sm:mb-4">
                    <h3 className="text-lg sm:text-xl font-bold">Learning Path</h3>
                    <button onClick={() => navigate('/game')} className="text-blue-500 hover:underline text-sm sm:text-lg">
                      View all →
                    </button>
                  </div>

                  <div className="space-y-2">
                    {(() => {
                      // Get next available modules (not completed) up to 4
                      const availableModules = LEARNING_MODULES
                        .map((mod, idx) => ({ ...mod, originalIndex: idx }))
                        .filter((mod) => {
                          const status = getModuleStatus(mod.id, mod.originalIndex);
                          return status !== 'completed';
                        })
                        .slice(0, 4);

                      return availableModules.map((mod) => {
                        const status = getModuleStatus(mod.id, mod.originalIndex);
                        return (
                          <button
                            key={mod.id}
                            onClick={() => status !== 'locked' && navigate(mod.route)}
                            disabled={status === 'locked'}
                            className={`w-full flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg text-left ${status === 'completed' ? 'bg-emerald-50 border-2 border-emerald-300' :
                              status === 'locked' ? 'bg-gray-100 opacity-60 cursor-not-allowed' :
                                'bg-gray-50 hover:bg-blue-50 border-2 border-transparent hover:border-blue-200'
                              }`}
                          >
                            <span className="text-xl sm:text-2xl">{mod.icon}</span>
                            <span className="flex-1 text-sm sm:text-lg font-medium">{mod.title}</span>
                            {status === 'completed' ? (
                              <Check size={18} className="sm:w-5 sm:h-5 text-emerald-600" />
                            ) : status === 'locked' ? (
                              <Lock size={16} className="sm:w-[18px] sm:h-[18px] text-gray-400" />
                            ) : (
                              <Play size={16} className="sm:w-[18px] sm:h-[18px] text-blue-500" fill="currentColor" />
                            )}
                          </button>
                        );
                      });
                    })()}
                  </div>
                </div>
              </div>

              {/* Financial Crossword */}
              <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-gray-100 lg:col-span-2">
                <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
                  <h2 className="text-xl sm:text-2xl font-bold">Financial Crossword</h2>
                  <div className="flex items-center gap-2">
                    {crosswordXpAwarded > 0 && (
                      <span className="px-3 py-1.5 rounded-lg text-sm font-semibold bg-emerald-100 text-emerald-700 animate-pulse">
                        +{crosswordXpAwarded} XP
                      </span>
                    )}
                    {(crosswordChecked || correctWordsCount > 0) && (
                      <span className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-sm sm:text-lg font-semibold ${correctWordsCount === CROSSWORD_CLUES.length ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                        {correctWordsCount}/{CROSSWORD_CLUES.length} correct
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
                  {/* Grid */}
                  <div className="flex-shrink-0">
                    <div className="overflow-x-auto pb-2 lg:overflow-visible">
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
                                onFocus={() => {
                                  // Only update if this is a different cell (avoid overriding handleCellClick)
                                  if (selectedCell?.row !== ri || selectedCell?.col !== ci) {
                                    setSelectedCell({ row: ri, col: ci });
                                    // Smart direction selection - prioritize word starting at this cell
                                    const words = getWordsForCell(ri, ci);
                                    const cellNumber = GRID[ri][ci].number;

                                    if (words.across && words.down) {
                                      if (cellNumber) {
                                        // If this cell has a number, prefer the word that starts here
                                        const startsAcross = words.across.number === cellNumber;
                                        const startsDown = words.down.number === cellNumber;

                                        if (startsAcross && !startsDown) {
                                          setSelectedDirection('across');
                                          setSelectedClue(words.across);
                                        } else if (startsDown && !startsAcross) {
                                          setSelectedDirection('down');
                                          setSelectedClue(words.down);
                                        } else {
                                          // Use current direction preference
                                          const dir = selectedDirection || 'across';
                                          setSelectedDirection(dir);
                                          setSelectedClue(dir === 'across' ? words.across : words.down);
                                        }
                                      } else {
                                        // Not a starting cell - use current direction
                                        const dir = selectedDirection || 'across';
                                        setSelectedDirection(dir);
                                        setSelectedClue(dir === 'across' ? words.across : words.down);
                                      }
                                    } else if (words.across) {
                                      setSelectedDirection('across');
                                      setSelectedClue(words.across);
                                    } else if (words.down) {
                                      setSelectedDirection('down');
                                      setSelectedClue(words.down);
                                    }
                                  }
                                }}
                                maxLength={1}
                                className={`w-full h-full text-center text-lg font-bold uppercase bg-transparent outline-none cursor-pointer ${isCorrectCell ? 'text-green-600' : isWrongCell ? 'text-red-500' : 'text-gray-900'
                                  }`}
                              />
                            </div>
                          );
                        }))}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 mt-4">
                      <div className="flex gap-3">
                        <button onClick={checkCrossword} className="px-4 sm:px-6 py-2 sm:py-3 bg-blue-500 text-white text-sm sm:text-lg font-semibold rounded-lg hover:bg-blue-600">
                          Check Answers
                        </button>
                        <button onClick={resetCrossword} className="px-4 sm:px-6 py-2 sm:py-3 bg-gray-200 text-gray-700 text-sm sm:text-lg font-semibold rounded-lg hover:bg-gray-300">
                          Reset
                        </button>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-500">
                        <Star className="inline w-3 h-3 sm:w-4 sm:h-4 text-yellow-500 mr-1" />
                        Earn 2 XP for each correct word! Progress saves automatically.
                      </p>
                    </div>
                  </div>

                  {/* Clues */}
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-8">
                    <div className="bg-blue-50 p-3 sm:p-4 rounded-lg">
                      <h3 className="font-bold text-blue-800 mb-2 sm:mb-3 text-lg sm:text-xl">Across</h3>
                      <div className="space-y-1.5 sm:space-y-2">
                        {acrossClues.map(c => (
                          <button
                            key={c.number}
                            ref={el => { clueRefs.current[`${c.number}-across`] = el; }}
                            onClick={() => handleClueClick(c)}
                            className={`w-full text-left p-2 sm:p-3 rounded-lg transition-all text-sm sm:text-base ${selectedClue?.number === c.number && selectedClue?.direction === 'across'
                              ? 'bg-blue-300 border-2 border-blue-600 shadow-md scale-[1.02]'
                              : 'hover:bg-blue-100 border-2 border-transparent'
                              }`}
                          >
                            <span className="font-bold text-blue-700">{c.number}.</span> {c.clue}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="bg-emerald-50 p-3 sm:p-4 rounded-lg">
                      <h3 className="font-bold text-emerald-800 mb-2 sm:mb-3 text-lg sm:text-xl">Down</h3>
                      <div className="space-y-1.5 sm:space-y-2">
                        {downClues.map(c => (
                          <button
                            key={c.number}
                            ref={el => { clueRefs.current[`${c.number}-down`] = el; }}
                            onClick={() => handleClueClick(c)}
                            className={`w-full text-left p-2 sm:p-3 rounded-lg transition-all text-sm sm:text-base ${selectedClue?.number === c.number && selectedClue?.direction === 'down'
                              ? 'bg-emerald-300 border-2 border-emerald-600 shadow-md scale-[1.02]'
                              : 'hover:bg-emerald-100 border-2 border-transparent'
                              }`}
                          >
                            <span className="font-bold text-emerald-700">{c.number}.</span> {c.clue}
                          </button>
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
              <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-gray-100 mb-4 sm:mb-6">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl sm:text-3xl font-bold">
                    {user.displayName?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase()}
                  </div>
                  <div className="text-center sm:text-left">
                    <h1 className="text-xl sm:text-2xl font-bold">{user.displayName || user.email?.split('@')[0]}</h1>
                    <p className="text-gray-500 text-sm sm:text-lg break-all">{user.email}</p>
                    <span className="inline-block mt-2 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm sm:text-lg font-medium">
                      {completedModules === totalModules ? '🏆 Certified' : '📚 Student'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Certificate Congratulations Banner */}
              {completedModules === totalModules && (
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6 text-center">
                  <div className="flex justify-center mb-3">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center shadow-lg">
                      <GraduationCap className="text-white" size={24} />
                    </div>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-emerald-800 mb-2">🎉 Congratulations! 🎉</h3>
                  <p className="text-sm sm:text-base text-emerald-700 mb-4">
                    You've completed all modules and earned your Financial Literacy Certificate!
                  </p>
                  <button
                    onClick={() => navigate('/certificate')}
                    className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 text-base sm:text-lg font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                  >
                    <GraduationCap size={18} />
                    View Certificate
                  </button>
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border text-center">
                  <p className="text-2xl sm:text-3xl font-bold text-amber-600">{totalXP}</p>
                  <p className="text-gray-500 text-sm sm:text-lg">Total XP</p>
                </div>
                <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border text-center">
                  <p className="text-2xl sm:text-3xl font-bold text-emerald-600">{completedModules}</p>
                  <p className="text-gray-500 text-sm sm:text-lg">Modules Done</p>
                </div>
                <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border text-center">
                  <p className="text-2xl sm:text-3xl font-bold text-orange-500">{streak}</p>
                  <p className="text-gray-500 text-sm sm:text-lg">Day Streak</p>
                </div>
                <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border text-center">
                  <p className="text-2xl sm:text-3xl font-bold text-blue-600">{Math.round((completedModules / totalModules) * 100)}%</p>
                  <p className="text-gray-500 text-sm sm:text-lg">Progress</p>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border">
                <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Module Progress</h2>
                <div className="space-y-2 sm:space-y-3">
                  {LEARNING_MODULES.map((mod, idx) => {
                    const score = getModuleScore(mod.id as Parameters<typeof getModuleScore>[0]);
                    const status = getModuleStatus(mod.id, idx);
                    return (
                      <div key={mod.id} className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
                        <span className="text-xl sm:text-2xl">{mod.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm sm:text-lg truncate">{mod.title}</p>
                          <p className="text-gray-500 text-xs sm:text-base truncate">{mod.subtitle}</p>
                        </div>
                        {score ? (
                          <span className="text-sm sm:text-lg font-bold whitespace-nowrap">{score.score}/{score.maxScore}</span>
                        ) : (
                          <span className="text-gray-400 text-xs sm:text-lg whitespace-nowrap">{status === 'locked' ? 'Locked' : 'Not started'}</span>
                        )}
                        {status === 'completed' && <Check size={20} className="sm:w-6 sm:h-6 text-emerald-600 flex-shrink-0" />}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* How to Play Modal */}
      <HowToPlayModal isOpen={showHowToPlay} onClose={() => setShowHowToPlay(false)} steps={GUIDE_STEPS} />
    </div>
  );
};

export default FinLitApp;
