import React, { useState } from 'react';
import { Trophy, Star, Award, Book, BookOpen, Home, Calendar, User, Brain, Check, Lock, Flame, GraduationCap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CrosswordAnswers {
  across1: string[];
  across2: string[];
  across3: string[];
  down1: string[];
  down2: string[];
}

interface CrosswordClue {
  number: number;
  clue: string;
  answer: string;
  row: number;
  col: number;
  length: number;
}

interface CrosswordClues {
  across: CrosswordClue[];
  down: CrosswordClue[];
}

const FinLitApp: React.FC = () => {

  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [xpLevel, setXpLevel] = useState<number>(45);
  const [streak, setStreak] = useState<number>(7);
  const [showStreakAnimation, setShowStreakAnimation] = useState<boolean>(false);
  const [crosswordAnswers, setCrosswordAnswers] = useState<CrosswordAnswers>({
    across1: Array(6).fill(''),
    across2: Array(7).fill(''),
    across3: Array(6).fill(''),
    down1: Array(4).fill(''),
    down2: Array(6).fill('')
  });
  const [certificationPoints, setCertificationPoints] = useState<number>(750);
  const [showCertTooltip, setShowCertTooltip] = useState<boolean>(false);
  const navigate = useNavigate();
  
  const handleAnswerSelect = (index: number): void => {
    setSelectedAnswer(index);
  };

  // Crossword puzzle definitions (kept for future use)
  // const crosswordClues: CrosswordClues = {
  //   across: [
  //     { number: 1, clue: "Ownership in a company", answer: "EQUITY", row: 1, col: 0, length: 6 },
  //     { number: 4, clue: "Money set aside for future use", answer: "CAPITAL", row: 3, col: 0, length: 7 },
  //     { number: 5, clue: "Financial spending plan", answer: "BUDGET", row: 5, col: 0, length: 6 }
  //   ],
  //   down: [
  //     { number: 2, clue: "Money owed", answer: "DEBT", row: 1, col: 2, length: 4 },
  //     { number: 3, clue: "Regular payment for work", answer: "SALARY", row: 0, col: 5, length: 6 }
  //   ]
  // };

  // const handleCrosswordInput = (direction: string, number: number, index: number, event: React.ChangeEvent<HTMLInputElement>): void => {
  //   const value = event.target.value.toUpperCase();
  //   if (value === '' || /^[A-Z]$/.test(value)) {
  //     const newAnswers = { ...crosswordAnswers };
  //     const key = `${direction}${number}` as keyof CrosswordAnswers;
  //     newAnswers[key][index] = value;
  //     setCrosswordAnswers(newAnswers);
      
  //     if (value !== '' && index < crosswordAnswers[key].length - 1) {
  //       const nextInput = document.getElementById(`${key}-${index + 1}`);
  //       if (nextInput) nextInput.focus();
  //     }
  //   }
  // };

  // const checkCrosswordAnswers = (): void => {
  //   const across1Answer = crosswordAnswers.across1.join('');
  //   const across2Answer = crosswordAnswers.across2.join('');
  //   const across3Answer = crosswordAnswers.across3.join('');
    
  //   let correct = 0;
  //   if (across1Answer === 'EQUITY') correct++;
  //   if (across2Answer === 'CAPITAL') correct++;
  //   if (across3Answer === 'BUDGET') correct++;
    
  //   if (correct > 0) {
  //     setXpLevel(Math.min(xpLevel + (correct * 5), 100));
  //     setCertificationPoints(Math.min(certificationPoints + (correct * 25), 1000));
  //     triggerStreakAnimation();
  //   }
  // };

  const triggerStreakAnimation = (): void => {
    setShowStreakAnimation(true);
    setTimeout(() => {
      setShowStreakAnimation(false);
      setStreak(streak + 1);
    }, 2000);
  };

  const handleSubmitAnswer = (): void => {
    if (selectedAnswer === 0) {
      setXpLevel(Math.min(xpLevel + 10, 100));
      setCertificationPoints(Math.min(certificationPoints + 50, 1000));
      triggerStreakAnimation();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-blue-50">
      {/* Header */}
      <header className="bg-blue-100 p-4 flex justify-between items-center border-b border-blue-200">
  {/* Left Side: App Logo and Title */}
  <div className="flex items-center gap-2">
    <div className="bg-emerald-500 text-white p-2 rounded-lg">
      <BookOpen size={20} />
    </div>
    <h1 className="text-2xl font-bold text-blue-700">FinLit</h1>
  </div>

  {/* Right Side: User Info, PwC logo, Cert, and Logout */}
  <div className="flex items-center gap-6">
    {/* User Name */}
    <span className="text-blue-800 font-semibold">Cornell Staeger</span>

    {/* PwC Logo */}
    <img
      src="pwc.svg"
      alt="PwC Logo"
      className="w-10 h-10 object-contain"
    />

    {/* Certificate Info */}
    <div
      className="relative"
      onMouseEnter={() => setShowCertTooltip(true)}
      onMouseLeave={() => setShowCertTooltip(false)}
    >
      <GraduationCap className="text-yellow-500 mr-2" size={24} />
      {showCertTooltip && (
        <div className="absolute -bottom-16 -left-16 bg-white p-3 rounded-md shadow-lg text-xs w-48 z-10">
          <p className="font-bold mb-1">Financial Literacy Certificate</p>
          <p className="text-gray-600">1000 points needed (250 to go)</p>
        </div>
      )}
    </div>
    <div className="text-sm">
      <span className="font-bold">{certificationPoints}</span>
      <span className="text-gray-500">/1000</span>
    </div>

    {/* Logout */}
    <button className="px-4 py-2 text-gray-600 rounded-md hover:bg-gray-200 transition">
      Log out
    </button>
  </div>
</header>

      
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="bg-blue-400 w-64 text-white p-4 flex flex-col gap-6">
          <div className="flex items-center gap-3 p-2 bg-blue-500 rounded-md">
            <Home size={24} />
            <span className="font-medium">Home</span>
          </div>
          
          <div className="flex items-center gap-3 p-2 hover:bg-blue-500 rounded-md cursor-pointer">
            <Calendar size={24} />
            <span className="font-medium">Daily Challenge</span>
          </div>
          
          <div className="flex items-center gap-3 p-2 hover:bg-blue-500 rounded-md cursor-pointer">
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

          <div className="flex items-center gap-3 p-2 hover:bg-blue-500 rounded-md cursor-pointer">
            <Award size={24} />
            <span className="font-medium">Badges</span>
          </div>
          
          <div className="flex items-center gap-3 p-2 hover:bg-blue-500 rounded-md cursor-pointer">
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
              <div className="text-right text-sm text-gray-500 mt-1">{xpLevel}/100</div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Leaderboard</h3>
                <span className="text-sm text-blue-500 cursor-pointer">See all</span>
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
          
          {/* Financial Crossword */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold mb-4">Financial Crossword</h2>
            
            <div className="mb-4">
              <p className="text-gray-700 mb-3">Fill in the crossword with financial terms based on the clues below:</p>
              
              <div className="grid grid-cols-7 gap-0 mb-6" style={{ width: 'fit-content' }}>
              {/* Row 1 */}
                <div className="relative w-12 h-12 border border-gray-300 flex items-center justify-center font-bold bg-amber-950 text-white">
                  <span className="absolute top-1 left-1 text-xs">1</span>
                  S
                </div>
                <div className="w-12 h-12 border border-gray-300 flex items-center justify-center font-bold bg-amber-50">
                  <input
                    type="text"
                    maxLength={1}
                    className="w-full h-full text-center font-bold uppercase bg-transparent outline-none"
                    defaultValue="A"
                    readOnly
                  />
                </div>
                <div className="w-12 h-12 border border-gray-300 flex items-center justify-center font-bold bg-amber-50">
                  <input
                    type="text"
                    maxLength={1}
                    className="w-full h-full text-center font-bold uppercase bg-transparent outline-none"
                    defaultValue="V"
                    readOnly
                  />
                </div>
                <div className="w-12 h-12 border border-gray-300 flex items-center justify-center font-bold bg-amber-50">
                  <input
                    type="text"
                    maxLength={1}
                    className="w-full h-full text-center font-bold uppercase bg-transparent outline-none"
                    defaultValue="I"
                    readOnly
                  />
                </div>
                <div className="w-12 h-12 border border-gray-300 flex items-center justify-center font-bold bg-amber-50">
                  <input
                    type="text"
                    maxLength={1}
                    className="w-full h-full text-center font-bold uppercase bg-transparent outline-none"
                    defaultValue="N"
                    readOnly
                  />
                </div>
                <div className="w-12 h-12 border border-gray-300 flex items-center justify-center font-bold bg-amber-50">
                  <input
                    type="text"
                    maxLength={1}
                    className="w-full h-full text-center font-bold uppercase bg-transparent outline-none"
                    defaultValue="G"
                    readOnly
                  />
                </div>
                <div className="w-12 h-12 border border-gray-300 flex items-center justify-center font-bold bg-amber-50">
                  <input
                    type="text"
                    maxLength={1}
                    className="w-full h-full text-center font-bold uppercase bg-transparent outline-none"
                    defaultValue="S"
                    readOnly
                  />
                </div>
                
                {/* Row 2 */}
                <div className="w-12 h-12 border border-gray-300 flex items-center justify-center font-bold bg-amber-50">
                  <input
                    type="text"
                    maxLength={1}
                    className="w-full h-full text-center font-bold uppercase bg-transparent outline-none"
                    defaultValue=""
                  />
                </div>
                <div className="relative w-12 h-12 border border-gray-300 flex items-center justify-center font-bold bg-amber-950 text-white">
                  <span className="absolute top-1 left-1 text-xs">2</span>
                  I
                </div>
                <div className="w-12 h-12 border border-gray-300 flex items-center justify-center font-bold bg-amber-50">
                  <input
                    type="text"
                    maxLength={1}
                    className="w-full h-full text-center font-bold uppercase bg-transparent outline-none"
                    defaultValue="N"
                    readOnly
                  />
                </div>
                <div className="w-12 h-12 border border-gray-300 flex items-center justify-center font-bold bg-amber-50">
                  <input
                    type="text"
                    maxLength={1}
                    className="w-full h-full text-center font-bold uppercase bg-transparent outline-none"
                    defaultValue="T"
                    readOnly
                  />
                </div>
                <div className="w-12 h-12 border border-gray-300 flex items-center justify-center font-bold bg-amber-50">
                  <input
                    type="text"
                    maxLength={1}
                    className="w-full h-full text-center font-bold uppercase bg-transparent outline-none"
                    defaultValue="E"
                    readOnly
                  />
                </div>
                <div className="w-12 h-12 border border-gray-300 flex items-center justify-center font-bold bg-amber-50">
                  <input
                    type="text"
                    maxLength={1}
                    className="w-full h-full text-center font-bold uppercase bg-transparent outline-none"
                    defaultValue="R"
                    readOnly
                  />
                </div>
                <div className="w-12 h-12 border border-gray-300 flex items-center justify-center font-bold bg-amber-50">
                  <input
                    type="text"
                    maxLength={1}
                    className="w-full h-full text-center font-bold uppercase bg-transparent outline-none"
                    defaultValue="E"
                    readOnly
                  />
                </div>
                
                {/* Row 3 */}
                <div className="w-12 h-12 border border-gray-300 flex items-center justify-center font-bold bg-amber-50">
                  <input
                    type="text"
                    maxLength={1}
                    className="w-full h-full text-center font-bold uppercase bg-transparent outline-none"
                    defaultValue="B"
                    readOnly
                  />
                </div>
                <div className="w-12 h-12 border border-gray-300 flex items-center justify-center font-bold bg-amber-50">
                  <input
                    type="text"
                    maxLength={1}
                    className="w-full h-full text-center font-bold uppercase bg-transparent outline-none"
                    defaultValue="U"
                    readOnly
                  />
                </div>
                <div className="relative w-12 h-12 border border-gray-300 flex items-center justify-center font-bold bg-amber-950 text-white">
                  <span className="absolute top-1 left-1 text-xs">3</span>
                  D
                </div>
                <div className="w-12 h-12 border border-gray-300 flex items-center justify-center font-bold bg-amber-50">
                  <input
                    type="text"
                    maxLength={1}
                    className="w-full h-full text-center font-bold uppercase bg-transparent outline-none"
                    defaultValue="G"
                    readOnly
                  />
                </div>
                <div className="w-12 h-12 border border-gray-300 flex items-center justify-center font-bold bg-amber-50">
                  <input
                    type="text"
                    maxLength={1}
                    className="w-full h-full text-center font-bold uppercase bg-transparent outline-none"
                    defaultValue="E"
                    readOnly
                  />
                </div>
                <div className="w-12 h-12 border border-gray-300 flex items-center justify-center font-bold bg-amber-50">
                  <input
                    type="text"
                    maxLength={1}
                    className="w-full h-full text-center font-bold uppercase bg-transparent outline-none"
                    defaultValue="T"
                    readOnly
                  />
                </div>
                <div className="w-12 h-12 border border-gray-300 flex items-center justify-center font-bold bg-amber-50">
                  <input
                    type="text"
                    maxLength={1}
                    className="w-full h-full text-center font-bold uppercase bg-transparent outline-none"
                    defaultValue=""
                  />
                </div>
                
                {/* Row 4 */}
                <div className="w-12 h-12 border border-gray-300 flex items-center justify-center font-bold bg-amber-50">
                  <input
                    type="text"
                    maxLength={1}
                    className="w-full h-full text-center font-bold uppercase bg-transparent outline-none"
                    defaultValue="O"
                    readOnly
                  />
                </div>
                <div className="w-12 h-12 border border-gray-300 flex items-center justify-center font-bold bg-amber-50">
                  <input
                    type="text"
                    maxLength={1}
                    className="w-full h-full text-center font-bold uppercase bg-transparent outline-none"
                    defaultValue="N"
                    readOnly
                  />
                </div>
                <div className="w-12 h-12 border border-gray-300 flex items-center justify-center font-bold bg-amber-50">
                  <input
                    type="text"
                    maxLength={1}
                    className="w-full h-full text-center font-bold uppercase bg-transparent outline-none"
                    defaultValue="D"
                    readOnly
                  />
                </div>
                <div className="relative w-12 h-12 border border-gray-300 flex items-center justify-center font-bold bg-amber-950 text-white">
                  <span className="absolute top-1 left-1 text-xs">4</span>
                  E
                </div>
                <div className="w-12 h-12 border border-gray-300 flex items-center justify-center font-bold bg-amber-50">
                  <input
                    type="text"
                    maxLength={1}
                    className="w-full h-full text-center font-bold uppercase bg-transparent outline-none"
                    defaultValue="Q"
                    readOnly
                  />
                </div>
                <div className="w-12 h-12 border border-gray-300 flex items-center justify-center font-bold bg-amber-50">
                  <input
                    type="text"
                    maxLength={1}
                    className="w-full h-full text-center font-bold uppercase bg-transparent outline-none"
                    defaultValue="U"
                    readOnly
                  />
                </div>
                <div className="w-12 h-12 border border-gray-300 flex items-center justify-center font-bold bg-amber-50">
                  <input
                    type="text"
                    maxLength={1}
                    className="w-full h-full text-center font-bold uppercase bg-transparent outline-none"
                    defaultValue="I"
                    readOnly
                  />
                </div>
                
                {/* Row 5 */}
                <div className="w-12 h-12 border border-gray-300 flex items-center justify-center font-bold bg-amber-50">
                  <input
                    type="text"
                    maxLength={1}
                    className="w-full h-full text-center font-bold uppercase bg-transparent outline-none"
                    defaultValue="N"
                    readOnly
                  />
                </div>
                <div className="w-12 h-12 border border-gray-300 flex items-center justify-center font-bold bg-amber-50">
                  <input
                    type="text"
                    maxLength={1}
                    className="w-full h-full text-center font-bold uppercase bg-transparent outline-none"
                    defaultValue="D"
                    readOnly
                  />
                </div>
                <div className="w-12 h-12 border border-gray-300 flex items-center justify-center font-bold bg-amber-50">
                  <input
                    type="text"
                    maxLength={1}
                    className="w-full h-full text-center font-bold uppercase bg-transparent outline-none"
                    defaultValue=""
                  />
                </div>
                <div className="w-12 h-12 border border-gray-300 flex items-center justify-center font-bold bg-amber-50">
                  <input
                    type="text"
                    maxLength={1}
                    className="w-full h-full text-center font-bold uppercase bg-transparent outline-none"
                    defaultValue="B"
                    readOnly
                  />
                </div>
                <div className="relative w-12 h-12 border border-gray-300 flex items-center justify-center font-bold bg-amber-950 text-white">
                  <span className="absolute top-1 left-1 text-xs">5</span>
                  U
                </div>
                <div className="w-12 h-12 border border-gray-300 flex items-center justify-center font-bold bg-amber-50">
                  <input
                    type="text"
                    maxLength={1}
                    className="w-full h-full text-center font-bold uppercase bg-transparent outline-none"
                    defaultValue="I"
                    readOnly
                  />
                </div>
                <div className="w-12 h-12 border border-gray-300 flex items-center justify-center font-bold bg-amber-50">
                  <input
                    type="text"
                    maxLength={1}
                    className="w-full h-full text-center font-bold uppercase bg-transparent outline-none"
                    defaultValue="T"
                    readOnly
                  />
                </div>
                
                {/* Row 6 */}
                <div className="w-12 h-12 border border-gray-300 flex items-center justify-center font-bold bg-amber-50">
                  <input
                    type="text"
                    maxLength={1}
                    className="w-full h-full text-center font-bold uppercase bg-transparent outline-none"
                    defaultValue="D"
                    readOnly
                  />
                </div>
                <div className="w-12 h-12 border border-gray-300 flex items-center justify-center font-bold bg-amber-50">
                  <input
                    type="text"
                    maxLength={1}
                    className="w-full h-full text-center font-bold uppercase bg-transparent outline-none"
                    defaultValue=""
                  />
                </div>
                <div className="w-12 h-12 border border-gray-300 flex items-center justify-center font-bold bg-amber-50">
                  <input
                    type="text"
                    maxLength={1}
                    className="w-full h-full text-center font-bold uppercase bg-transparent outline-none"
                    defaultValue="C"
                    readOnly
                  />
                </div>
                <div className="w-12 h-12 border border-gray-300 flex items-center justify-center font-bold bg-amber-50">
                  <input
                    type="text"
                    maxLength={1}
                    className="w-full h-full text-center font-bold uppercase bg-transparent outline-none"
                    defaultValue="T"
                    readOnly
                  />
                </div>
                <div className="w-12 h-12 border border-gray-300 flex items-center justify-center font-bold bg-amber-50">
                    
                  <input
                    type="text"
                    maxLength={1}
                    className="w-full h-full text-center font-bold uppercase bg-transparent outline-none"
                    defaultValue=""
                  />
                </div>
                <div className="relative w-12 h-12 border border-gray-300 flex items-center justify-center font-bold bg-amber-950 text-white">
                  <span className="absolute top-1 left-1 text-xs">5</span>
                  Y
                </div>
                
                <div className="w-12 h-12 border border-gray-300 flex items-center justify-center font-bold bg-amber-50">
                  <input
                    type="text"
                    maxLength={1}
                    className="w-full h-full text-center font-bold uppercase bg-transparent outline-none"
                    defaultValue=""
                  />
                </div>
                
                {/* Row 7 */}
                <div className="w-12 h-12 border border-gray-300 flex items-center justify-center font-bold bg-amber-50">
                  <input
                    type="text"
                    maxLength={1}
                    className="w-full h-full text-center font-bold uppercase bg-transparent outline-none"
                    defaultValue=""
                  />
                </div>
                <div className="w-12 h-12 border border-gray-300 flex items-center justify-center font-bold bg-amber-50">
                  <input
                    type="text"
                    maxLength={1}
                    className="w-full h-full text-center font-bold uppercase bg-transparent outline-none"
                    defaultValue=""
                  />
                </div>
                <div className="w-12 h-12 border border-gray-300 flex items-center justify-center font-bold bg-amber-50">
                  <input
                    type="text"
                    maxLength={1}
                    className="w-full h-full text-center font-bold uppercase bg-transparent outline-none"
                    defaultValue="A"
                    readOnly
                  />
                </div>
                <div className="w-12 h-12 border border-gray-300 flex items-center justify-center font-bold bg-amber-50">
                  <input
                    type="text"
                    maxLength={1}
                    className="w-full h-full text-center font-bold uppercase bg-transparent outline-none"
                    defaultValue="A"
                    readOnly
                  />
                </div>
                <div className="w-12 h-12 border border-gray-300 flex items-center justify-center font-bold bg-amber-50">
                  <input
                    type="text"
                    maxLength={1}
                    className="w-full h-full text-center font-bold uppercase bg-transparent outline-none"
                    defaultValue="X"
                    readOnly
                  />
                </div>
               
                <div className="w-12 h-12 border border-gray-300 flex items-center justify-center font-bold bg-amber-50">
                  <input
                    type="text"
                    maxLength={1}
                    className="w-full h-full text-center font-bold uppercase bg-transparent outline-none"
                    defaultValue="R"
                    readOnly
                  />
                </div>
                <div className="relative w-12 h-12 border border-gray-300 flex items-center justify-center font-bold bg-amber-950 text-white">
                  <span className="absolute top-1 left-1 text-xs">6</span>
                  C
                </div>
              </div>
              
              <div className="bg-amber-50 p-4 rounded-md">
                <h3 className="font-bold mb-3">Clues</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-bold mb-2">Across</h4>
                    <ol className="list-decimal list-inside text-sm space-y-2">
                      <li><span className="ml-1">Money set aside for future use (7)</span></li>
                      <li><span className="ml-1">Money earned on your deposits (8)</span></li>
                      <li><span className="ml-1">Financial spending plan (6)</span></li>
                      <li><span className="ml-1">Ownership in a company (6)</span></li>
                      <li><span className="ml-1">Annual deduction on investments (8)</span></li>
                      <li><span className="ml-1">Government fee on transactions (5)</span></li>
                    </ol>
                  </div>
                  
                  <div>
                    <h4 className="font-bold mb-2">Down</h4>
                    <ol className="list-decimal list-inside text-sm space-y-2">
                      <li><span className="ml-1">Money you owe to others (4)</span></li>
                      <li><span className="ml-1">Financial institutions (5)</span></li>
                      <li><span className="ml-1">Periodic payment for work (6)</span></li>
                      <li><span className="ml-1">Strategy to reduce risk (13)</span></li>
                      <li><span className="ml-1">Amount above face value (7)</span></li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between">
              <div className="flex">
                <div className="text-yellow-500 mr-2">
                  <Star className="fill-yellow-500" size={24} />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500">Earn</span>
                  <span className="font-bold">100 XP</span>
                </div>
              </div>
              <button 
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
              >
                Check Answers
              </button>
            </div>
          </div>
          
          {/* Your Badges Card */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold mb-4">Your Financial Badges</h2>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-full flex items-center justify-center shadow-md">
                  <Star className="text-white" size={32} />
                </div>
                <span className="mt-2 font-medium">Beginner</span>
                <span className="text-xs text-gray-500">Day 1 streak</span>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-300 to-emerald-600 rounded-full flex items-center justify-center shadow-md">
                  <Award className="text-white" size={32} />
                </div>
                <span className="mt-2 font-medium">Saver Pro</span>
                <span className="text-xs text-gray-500">Completed module</span>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-300 to-blue-600 rounded-full flex items-center justify-center shadow-md relative">
                  <Flame className="text-white" size={32} />
                  <div className="absolute -top-2 -right-2 bg-amber-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center border-2 border-white">
                    7
                  </div>
                </div>
                <span className="mt-2 font-medium">Streak Master</span>
                <span className="text-xs text-gray-500">7 day streak</span>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-300 to-purple-600 rounded-full flex items-center justify-center shadow-md">
                  <Book className="text-white" size={32} />
                </div>
                <span className="mt-2 font-medium">Learner</span>
                <span className="text-xs text-gray-500">5 modules complete</span>
              </div>
              
              <div className="flex flex-col items-center opacity-60">
                <div className="w-16 h-16 bg-gradient-to-br from-gray-300 to-gray-500 rounded-full flex items-center justify-center shadow-md">
                  <Lock className="text-white" size={32} />
                </div>
                <span className="mt-2 font-medium">Investor</span>
                <span className="text-xs text-gray-500">Complete investing</span>
              </div>
              
              <div className="flex flex-col items-center opacity-60">
                <div className="w-16 h-16 bg-gradient-to-br from-gray-300 to-gray-500 rounded-full flex items-center justify-center shadow-md">
                  <Lock className="text-white" size={32} />
                </div>
                <span className="mt-2 font-medium">Planner</span>
                <span className="text-xs text-gray-500">Create budget plan</span>
              </div>
            </div>
            
            <div className="mt-8">
              <h3 className="font-medium mb-4">Points to Certification</h3>
              <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-amber-400 to-yellow-500 h-full transition-all duration-500" 
                  style={{ width: `${(certificationPoints / 1000) * 100}%` }}
                ></div>
              </div>
              <div className="flex justify-between mt-2 text-sm">
                <span className="text-gray-500">0</span>
                <span className="font-bold text-amber-500">{certificationPoints}</span>
                <span className="text-gray-500">1000</span>
              </div>
              <div className="mt-4 text-center">
                <span className="font-bold text-amber-600">{1000 - certificationPoints} points left</span> to earn your Financial Literacy Certificate
              </div>
            </div>
          </div>
          
          {/* Upcoming Modules Card */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 col-span-1 md:col-span-2">
            <h2 className="text-xl font-bold mb-4">Learning Path: Financial Literacy</h2>
            
            <div className="relative">
              <div className="absolute top-0 left-8 bottom-0 w-1 bg-blue-200"></div>
              
              <div className="mb-6 relative">
                <div className="absolute left-6 -translate-x-1/2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center z-10">
                  <Check className="text-white" size={16} />
                </div>
                <div className="ml-12">
                  <h3 className="font-bold">Introduction to Finance</h3>
                  <p className="text-gray-600">Basic concepts and terminology</p>
                  <div className="mt-2 flex">
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Completed</span>
                    <span className="text-xs ml-2 bg-blue-100 text-blue-800 px-2 py-1 rounded-full">+100 points</span>
                  </div>
                </div>
              </div>
              
              <div className="mb-6 relative">
                <div className="absolute left-6 -translate-x-1/2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center z-10">
                  <Check className="text-white" size={16} />
                </div>
                <div className="ml-12">
                  <h3 className="font-bold">Saving Basics</h3>
                  <p className="text-gray-600">Strategies for effective saving and compound interest</p>
                  <div className="mt-2 flex">
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Completed</span>
                    <span className="text-xs ml-2 bg-blue-100 text-blue-800 px-2 py-1 rounded-full">+150 points</span>
                  </div>
                </div>
              </div>
              
              <div className="mb-6 relative">
                <div className="absolute left-6 -translate-x-1/2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center z-10">
                  <div className="animate-pulse w-3 h-3 bg-white rounded-full"></div>
                </div>
                <div className="ml-12">
                  <h3 className="font-bold">Building Credit 101</h3>
                  <p className="text-gray-600">Understanding credit scores and building good credit</p>
                  <div className="mt-2 flex">
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">In Progress</span>
                    <span className="text-xs ml-2 bg-blue-100 text-blue-800 px-2 py-1 rounded-full">45% completed</span>
                  </div>
                </div>
              </div>
              
              <div className="mb-6 relative">
                <div className="absolute left-6 -translate-x-1/2 w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center z-10">
                  <span className="text-gray-600 text-xs font-bold">4</span>
                </div>
                <div className="ml-12">
                  <h3 className="font-bold">Retirement Savings Plan</h3>
                  <p className="text-gray-600">Planning for retirement and long-term financial goals</p>
                  <div className="mt-2 flex">
                    <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">Up Next</span>
                    <span className="text-xs ml-2 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">+200 points</span>
                  </div>
                </div>
              </div>
              
              <div className="mb-6 relative">
                <div className="absolute left-6 -translate-x-1/2 w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center z-10">
                  <span className="text-gray-600 text-xs font-bold">5</span>
                </div>
                <div className="ml-12">
                  <h3 className="font-bold">Insurance Types</h3>
                  <p className="text-gray-600">Understanding different insurance products and their purposes</p>
                  <div className="mt-2 flex">
                    <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">Locked</span>
                    <span className="text-xs ml-2 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">+150 points</span>
                  </div>
                </div>
              </div>
              
              <div className="relative">
                <div className="absolute left-6 -translate-x-1/2 w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center z-10">
                  <span className="text-gray-600 text-xs font-bold">6</span>
                </div>
                <div className="ml-12">
                  <h3 className="font-bold">Investment Basics</h3>
                  <p className="text-gray-600">Introduction to stocks, bonds, and investment strategies</p>
                  <div className="mt-2 flex">
                    <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">Locked</span>
                    <span className="text-xs ml-2 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">+250 points</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Quick Financial Tools Card */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 col-span-1 md:col-span-2">
            <h2 className="text-xl font-bold mb-4">Quick Financial Tools</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <h3 className="font-bold text-blue-700 mb-2">Compound Interest Calculator</h3>
                <p className="text-sm text-gray-600 mb-3">See how your savings can grow over time with the power of compound interest.</p>
                <button className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition">
                  Calculate
                </button>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                <h3 className="font-bold text-purple-700 mb-2">Budget Planner</h3>
                <p className="text-sm text-gray-600 mb-3">Create a personalized budget plan based on your income and expenses.</p>
                <button className="w-full bg-purple-500 text-white py-2 rounded-md hover:bg-purple-600 transition">
                  Plan Budget
                </button>
              </div>
              
              <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
                <h3 className="font-bold text-amber-700 mb-2">Debt Repayment Strategy</h3>
                <p className="text-sm text-gray-600 mb-3">Find the most efficient way to pay off your debts and become debt-free.</p>
                <button className="w-full bg-amber-500 text-white py-2 rounded-md hover:bg-amber-600 transition">
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
              <button className="bg-white text-blue-600 px-4 py-2 rounded-md hover:bg-blue-50 transition">Learn More</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinLitApp;