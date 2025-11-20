import React, { useState, useEffect, useCallback } from 'react';
import { Clock } from 'lucide-react';

// Countdown Timer Component
function CountdownTimer({ 
  duration = 30, 
  onComplete, 
  resetKey 
}) {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    setTimeLeft(duration);
  }, [resetKey, duration]);

  useEffect(() => {
    if (timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          if (onComplete) onComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft, onComplete]);

  const lowTime = timeLeft <= 3;

  return (
    <div className={`flex items-center justify-center space-x-2 ${lowTime ? "text-red-500" : "text-blue-700"}`}>
      <Clock className="w-5 h-5" />
      <span className="text-xl font-semibold">{timeLeft}s</span>
    </div>
  );
}

export default function TrueFalseCard() {
  // List of hardcoded questions
  const questions = [
    { 
      question: 'An Initial Public Offering (IPO) is when a private company offers its shares to the public for the first time.', 
      correctAnswer: true, 
      explanation: 'An IPO marks the transition from a private company to a publicly traded one, allowing investors to buy shares on the stock market.' 
    },
    { 
      question: 'Investment banks underwrite IPOs by purchasing shares from the company and reselling them to investors.', 
      correctAnswer: true, 
      explanation: 'Underwriting is a key investment banking function where banks assume risk by buying and distributing the company shares.' 
    },
    { 
      question: 'The main goal of an IPO is to privatize a company ownership.', 
      correctAnswer: false, 
      explanation: 'An IPO actually makes a company public, allowing anyone to buy shares and become part-owner.' 
    },
    { 
      question: 'The "roadshow" is a period when company executives and bankers present the IPO to potential investors.', 
      correctAnswer: true, 
      explanation: 'The roadshow is a marketing phase before the IPO where management pitches the company value to institutional investors.' 
    },
    { 
      question: 'During an IPO, the company determines the final share price entirely on its own.', 
      correctAnswer: false, 
      explanation: 'The final IPO price is determined collaboratively between the company and its underwriters, based on investor demand and market conditions.' 
    },
    { 
      question: 'Retail investors typically get early access to IPO shares before institutional investors.', 
      correctAnswer: false, 
      explanation: 'Institutional investors usually get priority access to IPO allocations before shares become available to retail investors.' 
    },
    { 
      question: 'Companies often use IPO proceeds to raise capital for expansion, pay off debt, or fund new projects.', 
      correctAnswer: true, 
      explanation: 'Going public provides companies with large-scale funding to support growth and strategic goals.' 
    },
    { 
      question: 'After an IPO, the company stock begins trading on a public exchange such as the NYSE or NASDAQ.', 
      correctAnswer: true, 
      explanation: 'Once the IPO is complete, shares are listed and traded publicly on exchanges like the NYSE or NASDAQ.' 
    },
    { 
      question: 'The IPO process typically reduces public transparency requirements for the company.', 
      correctAnswer: false, 
      explanation: 'After going public, companies must follow stricter reporting and transparency rules set by regulators like the SEC.' 
    },
    { 
      question: 'Underpricing an IPO can lead to a "first-day pop," where the stock price jumps sharply after listing.', 
      correctAnswer: true, 
      explanation: 'Underpricing often causes the stock to surge on the first day of trading, benefiting early investors but leaving money on the table for the company.' 
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [result, setResult] = useState('');
  const [answered, setAnswered] = useState(false);
  const [timerDisabled, setTimerDisabled] = useState(false);
  const [buttonsDisabled, setButtonsDisabled] = useState(false);
  const [duration, setDuration] = useState(30);
  
  const totalQuestions = questions.length;
  const currentQuestion = questions[currentIndex];

  // Handle answer selection (True/False)
  const handleAnswer = (userAnswer) => {
    if (answered) return;

    const isCorrect = userAnswer === currentQuestion.correctAnswer;

    if (isCorrect) {
      setScore(prevScore => prevScore + 1);
    }

    setResult(isCorrect ? '✅ Correct!' : '❌ Incorrect!');
    setAnswered(true);
    setTimerDisabled(true);
    setButtonsDisabled(true);

    if (currentIndex === questions.length - 1) {
      setTimeout(() => {
        setResult('🏁 Quiz Completed! Restarting...');
        setTimeout(() => {
          setScore(0);
          setCurrentIndex(0);
          setResult('');
          setAnswered(false);
          setTimerDisabled(false);
          setButtonsDisabled(false);
        }, 2000);
      }, 1500);
    }
  };

  // Keyboard support (T/Y = true, F/N = false)
  useEffect(() => {
    const handleKey = (e) => {
      if (answered || buttonsDisabled) return;
      const key = e.key.toLowerCase();
      if (key === 't' || key === 'y') handleAnswer(true);
      if (key === 'f' || key === 'n') handleAnswer(false);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [answered, buttonsDisabled, currentQuestion]);

  // Go to next question
  const nextQuestion = () => {
    if (!answered || currentIndex === questions.length - 1) return;
    setResult('');
    setAnswered(false);
    setTimerDisabled(false);
    setButtonsDisabled(false);
    setCurrentIndex(prevIndex => prevIndex + 1);
  };

  // Handle timer completion
  const handleTimerComplete = () => {
    const isLastQuestion = currentIndex === questions.length - 1;

    setResult('⏰ Out of Time!');
    setAnswered(true);
    setTimerDisabled(true);
    setButtonsDisabled(true);

    if (isLastQuestion) {
      setTimeout(() => {
        setResult('⏰ Time is up! Restarting quiz...');
        setTimeout(() => {
          setScore(0);
          setCurrentIndex(0);
          setResult('');
          setAnswered(false);
          setTimerDisabled(false);
          setButtonsDisabled(false);
        }, 2000);
      }, 1500);
    }
  };

  // Determine result color
  const resultColor = result.includes('Correct') 
    ? 'text-green-600' 
    : result.includes('Incorrect') || result.includes('Time')
      ? 'text-red-600' 
      : 'text-black';

  return (
    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 min-h-screen flex flex-col items-center justify-center p-6 relative">
      {/* Header */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white text-black rounded-xl shadow-lg px-6 py-3">
        <h1 className="text-3xl text-center font-bold">Learn About Investment Banking!</h1>
      </div>

      {/* Score Tab */}
      <div className="absolute right-5 top-1/2 transform -translate-y-1/2 bg-blue-100 p-6 rounded-lg shadow-lg">
        <h3 className="text-2xl text-blue-700 text-center font-bold">Score</h3>
        <p className="text-xl text-black font-semibold mt-2 text-center">{score} / {totalQuestions}</p>
      </div>

      {/* Quiz Topic Tab with Difficulty */}
      <div className="absolute left-5 top-1/2 transform -translate-y-1/2 bg-yellow-50 p-6 rounded-lg shadow-lg">
        <h3 className="text-2xl text-black text-center font-bold">Topic</h3>
        <p className="text-lg text-black font-semibold mt-2 text-center">IPOs</p>

        <div className="mt-4 flex flex-col gap-2">
          <button 
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            onClick={() => setDuration(30)}
          >
            Easy (30s)
          </button>
          <button 
            className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            onClick={() => setDuration(20)}
          >
            Medium (20s)
          </button>
          <button 
            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            onClick={() => setDuration(10)}
          >
            Hard (10s)
          </button>
        </div>
      </div>

      {/* Main Quiz Area */}
      <div className="flex flex-col items-center mt-16">
        {/* Countdown Timer */}
        {!timerDisabled && (
          <div className="mb-6">
            <CountdownTimer 
              duration={duration} 
              onComplete={handleTimerComplete}
              resetKey={currentIndex}
            />
          </div>
        )}

        {/* Result Message */}
        {result && <p className={`text-2xl font-bold mb-4 ${resultColor}`}>{result}</p>}

        {/* Question */}
        <div className="text-black text-2xl font-bold mb-6 max-w-2xl text-center bg-white p-6 rounded-lg shadow-md">
          {currentQuestion.question}
        </div>

        {/* True/False Buttons */}
        <div className="flex gap-6 mb-6">
          <button
            onClick={() => handleAnswer(true)}
            disabled={buttonsDisabled}
            className="px-8 py-4 rounded-lg font-bold text-lg text-white bg-gray-700 hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            TRUE
          </button>

          <button
            onClick={() => handleAnswer(false)}
            disabled={buttonsDisabled}
            className="px-8 py-4 rounded-lg font-bold text-lg text-white bg-gray-700 hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            FALSE
          </button>
        </div>

        {/* Explanation */}
        {answered && (
          <div className="bg-white text-center rounded-lg shadow-md px-6 py-4 max-w-2xl mb-4">
            <p className="text-black font-semibold">
              The correct answer is <span className="font-bold">{currentQuestion.correctAnswer ? 'TRUE' : 'FALSE'}</span>. {currentQuestion.explanation}
            </p>
          </div>
        )}

        {/* Next Question Button */}
        <button
          onClick={nextQuestion}
          disabled={!answered || currentIndex === questions.length - 1}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next Question
        </button>

        <div className="text-gray-600 text-sm font-semibold mt-4">Keyboard: T / F or Y / N</div>
      </div>
    </div>
  );
}