import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Trophy, Star, Book, BookOpen, Home, Calendar, User, Brain, Check, Flame, GraduationCap, Loader2, Lock, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../auth/context/AuthContext';
import { useModuleScore, MODULES } from '../hooks/useModuleScore';

// Crossword puzzle data structure
interface CrosswordCell {
  letter: string;
  isBlack: boolean;
  number?: number;
  acrossClue?: number;
  downClue?: number;
}

interface ClueData {
  number: number;
  clue: string;
  answer: string;
  startRow: number;
  startCol: number;
  direction: 'across' | 'down';
}

// Financial crossword puzzle definition
const CROSSWORD_CLUES: ClueData[] = [
  // Across clues
  { number: 1, clue: "Money set aside for future use", answer: "SAVINGS", startRow: 0, startCol: 0, direction: 'across' },
  { number: 4, clue: "Money earned on deposits or investments", answer: "INTEREST", startRow: 2, startCol: 0, direction: 'across' },
  { number: 6, clue: "Financial spending plan", answer: "BUDGET", startRow: 4, startCol: 1, direction: 'across' },
  { number: 7, clue: "Ownership share in a company", answer: "STOCK", startRow: 6, startCol: 0, direction: 'across' },
  // Down clues
  { number: 2, clue: "Money you owe to others", answer: "DEBT", startRow: 0, startCol: 2, direction: 'down' },
  { number: 3, clue: "Protection against financial loss", answer: "INSURANCE", startRow: 0, startCol: 5, direction: 'down' },
  { number: 5, clue: "Yearly percentage rate on loans", answer: "APR", startRow: 2, startCol: 6, direction: 'down' },
];

// Generate the crossword grid
const generateGrid = (): CrosswordCell[][] => {
  const rows = 9;
  const cols = 9;
  const grid: CrosswordCell[][] = Array(rows).fill(null).map(() =>
    Array(cols).fill(null).map(() => ({ letter: '', isBlack: true }))
  );

  // Place all words on the grid
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

        // Add clue number to the first cell
        if (i === 0) {
          if (direction === 'across') {
            grid[row][col].acrossClue = number;
          } else {
            grid[row][col].downClue = number;
          }
          grid[row][col].number = number;
        }
      }
    }
  });

  return grid;
};

const GRID = generateGrid();

// Module definitions matching the Roadmap
const LEARNING_MODULES = [
  {
    id: MODULES.BUDGETING_50_30_20.id,
    title: "Budgeting Basics",
    subtitle: "50-30-20 Rule",
    description: "Master the 50-30-20 budgeting rule for effective money management.",
    icon: "💰",
    route: "/50-30-20",
    points: 100,
  },
  {
    id: MODULES.NEEDS_WANTS.id,
    title: "Needs vs Wants",
    subtitle: "Financial Priorities",
    description: "Learn to distinguish between essential needs and desired wants.",
    icon: "⚖️",
    route: "/needs-wants",
    points: 100,
  },
  {
    id: MODULES.INVESTMENT_BANKING.id,
    title: "Investment Banking",
    subtitle: "IPO Knowledge",
    description: "Test your knowledge about Initial Public Offerings.",
    icon: "🏦",
    route: "/investment-quiz",
    points: 150,
  },
  {
    id: MODULES.CREDIT_SCORE.id,
    title: "Credit Score Mastery",
    subtitle: "Credit Management",
    description: "Understand credit scores and improvement strategies.",
    icon: "📊",
    route: "/credit-score",
    points: 150,
  },
  {
    id: MODULES.EMERGENCY_FUND.id,
    title: "Emergency Fund",
    subtitle: "Financial Safety",
    description: "Build a robust emergency fund for unexpected expenses.",
    icon: "🆘",
    route: "/emergency-fund",
    points: 150,
  },
  {
    id: MODULES.STOCK_MARKET.id,
    title: "Stock Market Basics",
    subtitle: "Investment Fundamentals",
    description: "Learn the fundamentals of stock market investing.",
    icon: "📈",
    route: "/stock-market",
    points: 200,
  },
  {
    id: MODULES.INSURANCE.id,
    title: "Insurance Protection",
    subtitle: "Risk Management",
    description: "Understand different types of insurance and protection.",
    icon: "🛡️",
    route: "/insurance",
    points: 150,
  },
  {
    id: MODULES.DEBT_MANAGEMENT.id,
    title: "Debt Management",
    subtitle: "Debt Freedom",
    description: "Strategies for managing and eliminating debt effectively.",
    icon: "🔓",
    route: "/debt-management",
    points: 200,
  },
];

const FinLitApp: React.FC = () => {
  const navigate = useNavigate();
  const { user, signOut, isLoading: authLoading } = useAuthContext();
  const { progress, isModulePassed } = useModuleScore();

  // Module order for sequential access
  const moduleOrder = LEARNING_MODULES.map(m => m.id);

  // Check if a module is accessible (previous module passed or first module)
  const isModuleAccessible = (moduleIndex: number): boolean => {
    if (moduleIndex === 0) return true;
    const previousModuleId = moduleOrder[moduleIndex - 1];
    return isModulePassed(previousModuleId);
  };

  // Get module status
  const getModuleStatus = (moduleId: string, moduleIndex: number): 'completed' | 'in_progress' | 'next' | 'locked' => {
    if (isModulePassed(moduleId as Parameters<typeof isModulePassed>[0])) return 'completed';
    if (!isModuleAccessible(moduleIndex)) return 'locked';
    const moduleScore = progress?.moduleScores?.find(s => s.moduleId === moduleId);
    if (moduleScore && moduleScore.attempts > 0) return 'in_progress';
    return 'next';
  };

  // Handle module click
  const handleModuleClick = (module: typeof LEARNING_MODULES[0], index: number) => {
    const status = getModuleStatus(module.id, index);
    if (status !== 'locked') {
      navigate(module.route);
    }
  };

  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showStreakAnimation, setShowStreakAnimation] = useState<boolean>(false);
  const [showCertTooltip, setShowCertTooltip] = useState<boolean>(false);

  // Crossword state
  const [userInputs, setUserInputs] = useState<{ [key: string]: string }>({});
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [selectedDirection, setSelectedDirection] = useState<'across' | 'down'>('across');
  const [crosswordComplete, setCrosswordComplete] = useState(false);
  const [showCrosswordResult, setShowCrosswordResult] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const inputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  // Derive values from progress
  const xpLevel = progress ? Math.min((progress.totalXP / 100) * 100, 100) : 0;
  const streak = progress?.streak ?? 0;
  const certificationPoints = progress?.totalXP ?? 0;

  // Handle logout
  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  // Redirect to auth if not authenticated (after loading is complete)
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [authLoading, user, navigate]);

  // If still loading auth, show loading
  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-blue-50">
        <Loader2 className="animate-spin text-blue-500" size={48} />
      </div>
    );
  }

  // If no user (will redirect via useEffect), show loading
  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen bg-blue-50">
        <Loader2 className="animate-spin text-blue-500" size={48} />
      </div>
    );
  }

  const handleAnswerSelect = (index: number): void => {
    setSelectedAnswer(index);
  };

  const triggerStreakAnimation = (): void => {
    setShowStreakAnimation(true);
    setTimeout(() => {
      setShowStreakAnimation(false);
    }, 2000);
  };

  const handleSubmitAnswer = (): void => {
    if (selectedAnswer === 0) {
      triggerStreakAnimation();
    }
  };

  // Crossword handlers
  const handleCellClick = (row: number, col: number) => {
    const cell = GRID[row][col];
    if (cell.isBlack) return;

    if (selectedCell?.row === row && selectedCell?.col === col) {
      // Toggle direction if clicking same cell
      setSelectedDirection(prev => prev === 'across' ? 'down' : 'across');
    } else {
      setSelectedCell({ row, col });
    }

    const key = `${row}-${col}`;
    inputRefs.current[key]?.focus();
  };

  const getNextCell = useCallback((row: number, col: number, direction: 'across' | 'down', forward: boolean = true): { row: number; col: number } | null => {
    const delta = forward ? 1 : -1;
    let nextRow = direction === 'down' ? row + delta : row;
    let nextCol = direction === 'across' ? col + delta : col;

    if (nextRow >= 0 && nextRow < GRID.length && nextCol >= 0 && nextCol < GRID[0].length) {
      if (!GRID[nextRow][nextCol].isBlack) {
        return { row: nextRow, col: nextCol };
      }
    }
    return null;
  }, []);

  const handleCellInput = (row: number, col: number, value: string) => {
    const key = `${row}-${col}`;
    const letter = value.toUpperCase().slice(-1);

    if (letter === '' || /^[A-Z]$/.test(letter)) {
      setUserInputs(prev => ({ ...prev, [key]: letter }));

      // Move to next cell if a letter was entered
      if (letter !== '') {
        const nextCell = getNextCell(row, col, selectedDirection);
        if (nextCell) {
          setSelectedCell(nextCell);
          const nextKey = `${nextCell.row}-${nextCell.col}`;
          setTimeout(() => inputRefs.current[nextKey]?.focus(), 0);
        }
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, row: number, col: number) => {
    const key = `${row}-${col}`;

    if (e.key === 'Backspace' && !userInputs[key]) {
      // Move to previous cell if current is empty
      const prevCell = getNextCell(row, col, selectedDirection, false);
      if (prevCell) {
        setSelectedCell(prevCell);
        const prevKey = `${prevCell.row}-${prevCell.col}`;
        setUserInputs(prev => ({ ...prev, [prevKey]: '' }));
        setTimeout(() => inputRefs.current[prevKey]?.focus(), 0);
      }
      e.preventDefault();
    } else if (e.key === 'ArrowRight') {
      const next = getNextCell(row, col, 'across');
      if (next) {
        setSelectedCell(next);
        setSelectedDirection('across');
        setTimeout(() => inputRefs.current[`${next.row}-${next.col}`]?.focus(), 0);
      }
      e.preventDefault();
    } else if (e.key === 'ArrowLeft') {
      const prev = getNextCell(row, col, 'across', false);
      if (prev) {
        setSelectedCell(prev);
        setSelectedDirection('across');
        setTimeout(() => inputRefs.current[`${prev.row}-${prev.col}`]?.focus(), 0);
      }
      e.preventDefault();
    } else if (e.key === 'ArrowDown') {
      const next = getNextCell(row, col, 'down');
      if (next) {
        setSelectedCell(next);
        setSelectedDirection('down');
        setTimeout(() => inputRefs.current[`${next.row}-${next.col}`]?.focus(), 0);
      }
      e.preventDefault();
    } else if (e.key === 'ArrowUp') {
      const prev = getNextCell(row, col, 'down', false);
      if (prev) {
        setSelectedCell(prev);
        setSelectedDirection('down');
        setTimeout(() => inputRefs.current[`${prev.row}-${prev.col}`]?.focus(), 0);
      }
      e.preventDefault();
    } else if (e.key === 'Tab') {
      setSelectedDirection(prev => prev === 'across' ? 'down' : 'across');
      e.preventDefault();
    }
  };

  const checkCrossword = () => {
    let correct = 0;
    let total = 0;

    GRID.forEach((row, rowIdx) => {
      row.forEach((cell, colIdx) => {
        if (!cell.isBlack) {
          total++;
          const key = `${rowIdx}-${colIdx}`;
          if (userInputs[key]?.toUpperCase() === cell.letter) {
            correct++;
          }
        }
      });
    });

    setCorrectCount(correct);
    setCrosswordComplete(correct === total);
    setShowCrosswordResult(true);

    if (correct === total) {
      triggerStreakAnimation();
    }
  };

  const resetCrossword = () => {
    setUserInputs({});
    setShowCrosswordResult(false);
    setCrosswordComplete(false);
    setSelectedCell(null);
  };

  const getCellHighlight = (row: number, col: number): string => {
    if (!selectedCell) return '';

    const cell = GRID[row][col];
    if (cell.isBlack) return '';

    // Current selected cell
    if (selectedCell.row === row && selectedCell.col === col) {
      return 'bg-blue-300';
    }

    // Highlight cells in the same word
    if (selectedDirection === 'across' && selectedCell.row === row) {
      // Check if this cell is part of the same word
      let startCol = selectedCell.col;
      while (startCol > 0 && !GRID[row][startCol - 1].isBlack) startCol--;
      let endCol = selectedCell.col;
      while (endCol < GRID[0].length - 1 && !GRID[row][endCol + 1].isBlack) endCol++;
      if (col >= startCol && col <= endCol) return 'bg-blue-100';
    }

    if (selectedDirection === 'down' && selectedCell.col === col) {
      let startRow = selectedCell.row;
      while (startRow > 0 && !GRID[startRow - 1][col].isBlack) startRow--;
      let endRow = selectedCell.row;
      while (endRow < GRID.length - 1 && !GRID[endRow + 1][col].isBlack) endRow++;
      if (row >= startRow && row <= endRow) return 'bg-blue-100';
    }

    return '';
  };

  const acrossClues = CROSSWORD_CLUES.filter(c => c.direction === 'across').sort((a, b) => a.number - b.number);
  const downClues = CROSSWORD_CLUES.filter(c => c.direction === 'down').sort((a, b) => a.number - b.number);

  return (
    <div className="flex flex-col h-screen bg-blue-50">
      {/* Header */}
      <header className="bg-blue-100 p-4 flex justify-between items-center border-b border-blue-200">
        <div className="flex items-center gap-2">
          <div className="bg-emerald-500 text-white p-2 rounded-lg">
            <BookOpen size={20} />
          </div>
          <h1 className="text-2xl font-bold text-blue-700">FinLit</h1>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
              {user.displayName?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <span className="text-blue-800 font-semibold">{user.displayName || user.email}</span>
          </div>

          <img
            src="pwc.svg"
            alt="PwC Logo"
            className="w-10 h-10 object-contain"
          />

          <div
            className="relative"
            onMouseEnter={() => setShowCertTooltip(true)}
            onMouseLeave={() => setShowCertTooltip(false)}
          >
            <GraduationCap className="text-yellow-500 mr-2" size={24} />
            {showCertTooltip && (
              <div className="absolute -bottom-16 -left-16 bg-white p-3 rounded-md shadow-lg text-xs w-48 z-10">
                <p className="font-bold mb-1">Financial Literacy Certificate</p>
                <p className="text-gray-600">1000 points needed ({Math.max(0, 1000 - certificationPoints)} to go)</p>
              </div>
            )}
          </div>
          <div className="text-sm">
            <span className="font-bold">{certificationPoints}</span>
            <span className="text-gray-500">/1000</span>
          </div>

          <button
            onClick={handleLogout}
            className="px-4 py-2 text-gray-600 rounded-md hover:bg-gray-200 transition"
          >
            Log out
          </button>
        </div>
      </header>


      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="bg-blue-400 w-64 text-white p-4 flex flex-col gap-6">
          <div
            className="flex items-center gap-3 p-2 bg-blue-500 rounded-md cursor-pointer"
            onClick={() => navigate('/dashboard')}
          >
            <Home size={24} />
            <span className="font-medium">Home</span>
          </div>

          <div
            className="flex items-center gap-3 p-2 hover:bg-blue-500 rounded-md cursor-pointer"
            onClick={() => navigate('/game')}
          >
            <Calendar size={24} />
            <span className="font-medium">Daily Challenge</span>
          </div>

          <div
            className="flex items-center gap-3 p-2 hover:bg-blue-500 rounded-md cursor-pointer"
            onClick={() => navigate('/game')}
          >
            <Trophy size={24} />
            <span className="font-medium">Leaderboard</span>
          </div>

          <div
            className="flex items-center gap-3 p-2 hover:bg-blue-500 rounded-md cursor-pointer"
            onClick={() => navigate('/game')}
          >
            <Brain size={24} />
            <span className="font-medium">Learning Center</span>
          </div>

          <div
            className="flex items-center gap-3 p-2 hover:bg-blue-500 rounded-md cursor-pointer"
            onClick={() => navigate('/game')}
          >
            <Book size={24} />
            <span className="font-medium">Modules</span>
          </div>

          <div
            className="flex items-center gap-3 p-2 hover:bg-blue-500 rounded-md cursor-pointer"
            onClick={() => navigate('/dashboard')}
          >
            <User size={24} />
            <span className="font-medium">Profile</span>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 p-4 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Daily Challenge Card */}
          <div className="bg-amber-50 rounded-lg p-6 shadow-sm border border-amber-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Daily Challenge</h2>
              <div className="flex items-center">
                <div className="relative">
                  {showStreakAnimation && (
                    <div className="absolute -top-8 -right-2 animate-bounce">
                      <div className="flex items-center text-amber-500 font-bold">
                        <Flame className="mr-1 text-amber-500" size={20} />
                        <span>+1</span>
                      </div>
                    </div>
                  )}
                  <div className="flex">
                    <Flame className="text-amber-500 mr-1" size={20} />
                    <div className="bg-amber-500 rounded-full h-6 w-6 flex items-center justify-center text-white font-bold">
                      {streak}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-bold mb-2">What is compound interest?</h3>
              <div className="flex flex-col gap-3">
                <button
                  className={`p-3 rounded-md text-left transition ${selectedAnswer === 0 ? 'bg-emerald-500 text-white' : 'bg-emerald-100 hover:bg-emerald-200'}`}
                  onClick={() => handleAnswerSelect(0)}
                >
                  Interest earned on interest
                </button>
                <button
                  className={`p-3 rounded-md text-left transition ${selectedAnswer === 1 ? 'bg-emerald-500 text-white' : 'bg-emerald-100 hover:bg-emerald-200'}`}
                  onClick={() => handleAnswerSelect(1)}
                >
                  Tax on investment gains
                </button>
                <button
                  className={`p-3 rounded-md text-left transition ${selectedAnswer === 2 ? 'bg-emerald-500 text-white' : 'bg-emerald-100 hover:bg-emerald-200'}`}
                  onClick={() => handleAnswerSelect(2)}
                >
                  Diversification of assets
                </button>
                <button
                  className={`p-3 rounded-md text-left transition ${selectedAnswer === 3 ? 'bg-emerald-500 text-white' : 'bg-emerald-100 hover:bg-emerald-200'}`}
                  onClick={() => handleAnswerSelect(3)}
                >
                  Money added to an account
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex">
                <div className="text-yellow-500 mr-2">
                  <Star className="fill-yellow-500" size={24} />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500">Earn</span>
                  <span className="font-bold">50 XP</span>
                </div>
              </div>
              <button
                className="bg-emerald-500 text-white px-6 py-2 rounded-md hover:bg-emerald-600"
                onClick={handleSubmitAnswer}
              >
                Submit
              </button>
            </div>
          </div>

          {/* XP and Leaderboard Card */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">XP Level</h3>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className="bg-emerald-500 h-4 rounded-full transition-all duration-500"
                  style={{ width: `${xpLevel}%` }}
                ></div>
              </div>
              <div className="text-right text-sm text-gray-500 mt-1">{Math.round(xpLevel)}/100</div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Leaderboard</h3>
                <span
                  className="text-sm text-blue-500 cursor-pointer hover:underline"
                  onClick={() => navigate('/game')}
                >
                  See all
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="bg-yellow-400 rounded-full w-8 h-8 flex items-center justify-center text-white font-bold mr-3">
                      1
                    </div>
                    <div className="bg-green-100 rounded-full w-8 h-8 flex items-center justify-center mr-2">
                      <User size={16} className="text-green-700" />
                    </div>
                    <span>Team Alpha</span>
                  </div>
                  <span className="font-bold">1280</span>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="bg-gray-200 rounded-full w-8 h-8 flex items-center justify-center text-gray-700 font-bold mr-3">
                      2
                    </div>
                    <div className="bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center mr-2">
                      <User size={16} className="text-blue-700" />
                    </div>
                    <span>Team Beta</span>
                  </div>
                  <span className="font-bold">1150</span>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="bg-gray-200 rounded-full w-8 h-8 flex items-center justify-center text-gray-700 font-bold mr-3">
                      3
                    </div>
                    <div className="bg-red-100 rounded-full w-8 h-8 flex items-center justify-center mr-2">
                      <User size={16} className="text-red-700" />
                    </div>
                    <span>Team Up</span>
                  </div>
                  <span className="font-bold">950</span>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="bg-gray-200 rounded-full w-8 h-8 flex items-center justify-center text-gray-700 font-bold mr-3">
                      4
                    </div>
                    <div className="bg-pink-100 rounded-full w-8 h-8 flex items-center justify-center mr-2">
                      <User size={16} className="text-pink-700" />
                    </div>
                    <span>Team Plus</span>
                  </div>
                  <span className="font-bold">820</span>
                </div>
              </div>
            </div>
          </div>

          {/* Financial Crossword - Interactive */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 col-span-1 md:col-span-2">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Financial Crossword</h2>
              {showCrosswordResult && (
                <div className={`px-4 py-2 rounded-lg font-semibold ${crosswordComplete ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                  {crosswordComplete ? 'Perfect! All correct!' : `${correctCount} letters correct`}
                </div>
              )}
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
              {/* Crossword Grid */}
              <div className="flex-shrink-0">
                <p className="text-gray-600 mb-3 text-sm">Click a cell and type. Use arrow keys or Tab to navigate.</p>
                <div
                  className="inline-grid gap-0 border-2 border-gray-800"
                  style={{ gridTemplateColumns: `repeat(${GRID[0].length}, 40px)` }}
                >
                  {GRID.map((row, rowIdx) => (
                    row.map((cell, colIdx) => {
                      const key = `${rowIdx}-${colIdx}`;
                      const highlight = getCellHighlight(rowIdx, colIdx);

                      if (cell.isBlack) {
                        return (
                          <div
                            key={key}
                            className="w-10 h-10 bg-gray-900"
                          />
                        );
                      }

                      return (
                        <div
                          key={key}
                          className={`w-10 h-10 border border-gray-400 relative cursor-pointer ${highlight}`}
                          onClick={() => handleCellClick(rowIdx, colIdx)}
                        >
                          {cell.number && (
                            <span className="absolute top-0 left-0.5 text-[10px] font-bold text-gray-600">
                              {cell.number}
                            </span>
                          )}
                          <input
                            ref={el => { inputRefs.current[key] = el; }}
                            type="text"
                            value={userInputs[key] || ''}
                            onChange={(e) => handleCellInput(rowIdx, colIdx, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, rowIdx, colIdx)}
                            onFocus={() => {
                              setSelectedCell({ row: rowIdx, col: colIdx });
                            }}
                            className={`w-full h-full text-center font-bold text-lg uppercase bg-transparent outline-none cursor-pointer ${
                              showCrosswordResult
                                ? userInputs[key]?.toUpperCase() === cell.letter
                                  ? 'text-green-600'
                                  : userInputs[key]
                                    ? 'text-red-600'
                                    : 'text-gray-900'
                                : 'text-gray-900'
                            }`}
                            maxLength={1}
                          />
                        </div>
                      );
                    })
                  ))}
                </div>
              </div>

              {/* Clues */}
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-bold text-blue-800 mb-3 text-lg">Across</h3>
                  <ul className="space-y-2">
                    {acrossClues.map(clue => (
                      <li key={clue.number} className="text-sm">
                        <span className="font-bold text-blue-700">{clue.number}.</span>{' '}
                        <span className="text-gray-700">{clue.clue}</span>
                        <span className="text-gray-400 ml-1">({clue.answer.length})</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-emerald-50 p-4 rounded-lg">
                  <h3 className="font-bold text-emerald-800 mb-3 text-lg">Down</h3>
                  <ul className="space-y-2">
                    {downClues.map(clue => (
                      <li key={clue.number} className="text-sm">
                        <span className="font-bold text-emerald-700">{clue.number}.</span>{' '}
                        <span className="text-gray-700">{clue.clue}</span>
                        <span className="text-gray-400 ml-1">({clue.answer.length})</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
              <div className="flex">
                <div className="text-yellow-500 mr-2">
                  <Star className="fill-yellow-500" size={24} />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500">Earn up to</span>
                  <span className="font-bold">100 XP</span>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={resetCrossword}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition"
                >
                  Reset
                </button>
                <button
                  onClick={checkCrossword}
                  className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition"
                >
                  Check Answers
                </button>
              </div>
            </div>
          </div>

          {/* Learning Path with Real Modules */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 col-span-1 md:col-span-2">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Learning Path: Financial Literacy</h2>
              <button
                onClick={() => navigate('/game')}
                className="text-sm text-blue-500 hover:underline"
              >
                View Full Roadmap
              </button>
            </div>

            <div className="relative">
              <div className="absolute top-0 left-8 bottom-0 w-1 bg-blue-200"></div>

              {LEARNING_MODULES.map((module, index) => {
                const status = getModuleStatus(module.id, index);

                return (
                  <div
                    key={module.id}
                    className={`mb-6 relative last:mb-0 ${status !== 'locked' ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                    onClick={() => handleModuleClick(module, index)}
                  >
                    {/* Status indicator */}
                    <div className={`absolute left-6 -translate-x-1/2 w-6 h-6 rounded-full flex items-center justify-center z-10 ${
                      status === 'completed' ? 'bg-green-500' :
                      status === 'in_progress' ? 'bg-blue-500' :
                      status === 'next' ? 'bg-purple-500' :
                      'bg-gray-300'
                    }`}>
                      {status === 'completed' ? (
                        <Check className="text-white" size={14} />
                      ) : status === 'in_progress' ? (
                        <div className="animate-pulse w-2.5 h-2.5 bg-white rounded-full"></div>
                      ) : status === 'next' ? (
                        <Play className="text-white" size={12} fill="white" />
                      ) : (
                        <Lock className="text-gray-500" size={12} />
                      )}
                    </div>

                    {/* Module content */}
                    <div className={`ml-12 p-3 rounded-lg transition-colors ${
                      status !== 'locked' ? 'hover:bg-gray-50' : 'opacity-60'
                    }`}>
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{module.icon}</span>
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-800">{module.title}</h3>
                          <p className="text-gray-500 text-sm">{module.subtitle}</p>
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm mt-1">{module.description}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          status === 'completed' ? 'bg-green-100 text-green-800' :
                          status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                          status === 'next' ? 'bg-purple-100 text-purple-800' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {status === 'completed' ? 'Completed' :
                           status === 'in_progress' ? 'In Progress' :
                           status === 'next' ? 'Start Now' :
                           'Locked'}
                        </span>
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                          +{module.points} points
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Financial Tools Card */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 col-span-1 md:col-span-2">
            <h2 className="text-xl font-bold mb-4">Quick Financial Tools</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <h3 className="font-bold text-blue-700 mb-2">Compound Interest Calculator</h3>
                <p className="text-sm text-gray-600 mb-3">See how your savings can grow over time with the power of compound interest.</p>
                <button
                  onClick={() => navigate('/calculator')}
                  className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition"
                >
                  Calculate
                </button>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                <h3 className="font-bold text-purple-700 mb-2">Budget Planner</h3>
                <p className="text-sm text-gray-600 mb-3">Create a personalized budget plan based on your income and expenses.</p>
                <button
                  onClick={() => navigate('/50-30-20')}
                  className="w-full bg-purple-500 text-white py-2 rounded-md hover:bg-purple-600 transition"
                >
                  Plan Budget
                </button>
              </div>

              <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
                <h3 className="font-bold text-amber-700 mb-2">Debt Repayment Strategy</h3>
                <p className="text-sm text-gray-600 mb-3">Find the most efficient way to pay off your debts and become debt-free.</p>
                <button
                  onClick={() => navigate('/debt-management')}
                  className="w-full bg-amber-500 text-white py-2 rounded-md hover:bg-amber-600 transition"
                >
                  Create Strategy
                </button>
              </div>
            </div>
          </div>

          {/* Today's Financial Tip */}
          <div className="bg-gradient-to-r from-blue-500 to-emerald-500 rounded-lg p-6 shadow-sm text-white col-span-1 md:col-span-2">
            <div className="flex items-center mb-4">
              <div className="mr-4 bg-white bg-opacity-20 p-3 rounded-full">
                <Flame size={28} className="text-white" />
              </div>
              <h2 className="text-xl font-bold">Today's Financial Tip</h2>
            </div>

            <p className="text-lg mb-4">Understanding compound interest can help you grow your savings!</p>
            <p className="text-white text-opacity-90 mb-6">Compound interest is when you earn interest not just on your initial investment, but also on the interest you've already earned. This creates a snowball effect that can significantly grow your money over time.</p>

            <div className="bg-white bg-opacity-10 p-4 rounded-md">
              <h3 className="font-bold mb-2">Example:</h3>
              <p>If you invest $1,000 with 5% annual interest compounded yearly:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>After 1 year: $1,050</li>
                <li>After 10 years: $1,629</li>
                <li>After 30 years: $4,322</li>
              </ul>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => navigate('/game')}
                className="bg-white text-blue-600 px-4 py-2 rounded-md hover:bg-blue-50 transition"
              >
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinLitApp;
