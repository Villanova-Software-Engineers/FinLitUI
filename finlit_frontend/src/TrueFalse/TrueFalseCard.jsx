import React, { useState, useEffect } from 'react';

export default function TrueFalseCard({ onQuizComplete = null, onQuizFinished = null }) {
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
  const [buttonsDisabled, setButtonsDisabled] = useState(false);
  
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
    setButtonsDisabled(true);

    if (currentIndex === questions.length - 1) {
      const finalScore = isCorrect ? score + 1 : score;
      const passingScore = Math.ceil(totalQuestions * 0.7); // 70% to pass
      const passed = finalScore >= passingScore;

      // Notify that quiz is finished (all questions answered)
      if (onQuizFinished) {
        onQuizFinished(true);
      }

      setTimeout(() => {
        if (passed) {
          setResult(`🏁 Quiz Completed! You passed with ${finalScore}/${totalQuestions}!`);
          if (onQuizComplete) {
            onQuizComplete({ score: finalScore, total: totalQuestions, passed: true });
          }
        } else {
          setResult(`🏁 Quiz Completed! Score: ${finalScore}/${totalQuestions}. Need ${passingScore} to pass. Try again!`);
          if (onQuizComplete) {
            onQuizComplete({ score: finalScore, total: totalQuestions, passed: false });
          }
          setTimeout(() => {
            setScore(0);
            setCurrentIndex(0);
            setResult('');
            setAnswered(false);
            setButtonsDisabled(false);
            // Reset quiz finished state when retrying
            if (onQuizFinished) {
              onQuizFinished(false);
            }
          }, 3000);
        }
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
    setButtonsDisabled(false);
    setCurrentIndex(prevIndex => prevIndex + 1);
  };

  return (
    <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-200/60 p-6 sm:p-8">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-semibold text-slate-800 tracking-tight">Investment Banking Quiz</h2>
        <p className="text-slate-500 font-medium mt-1">True or False</p>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-slate-500 mb-2 font-medium">
          <span>Question {currentIndex + 1} of {totalQuestions}</span>
          <span>Score: {score}/{totalQuestions}</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
          />
        </div>
      </div>

      {/* Result Message */}
      {result && (
        <div className={`mb-4 p-4 rounded-xl text-center font-semibold ${
          result.includes('Correct')
            ? 'bg-emerald-50 border border-emerald-300 text-emerald-700'
            : result.includes('Incorrect')
              ? 'bg-red-50 border border-red-300 text-red-700'
              : 'bg-blue-50 border border-blue-300 text-blue-700'
        }`}>
          {result}
        </div>
      )}

      {/* Question */}
      <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 mb-6">
        <p className="text-lg text-slate-800 font-medium text-center leading-relaxed">
          {currentQuestion.question}
        </p>
      </div>

      {/* True/False Buttons */}
      <div className="flex gap-4 justify-center mb-6">
        <button
          onClick={() => handleAnswer(true)}
          disabled={buttonsDisabled}
          className={`px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 ${
            buttonsDisabled
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
              : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/25 hover:scale-105'
          }`}
        >
          TRUE
        </button>

        <button
          onClick={() => handleAnswer(false)}
          disabled={buttonsDisabled}
          className={`px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 ${
            buttonsDisabled
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
              : 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/25 hover:scale-105'
          }`}
        >
          FALSE
        </button>
      </div>

      {/* Explanation */}
      {answered && (
        <div className="bg-teal-50 border border-teal-300 rounded-xl p-4 mb-6">
          <p className="text-teal-700 font-semibold mb-1">Explanation:</p>
          <p className="text-teal-600">
            The correct answer is <span className="font-bold">{currentQuestion.correctAnswer ? 'TRUE' : 'FALSE'}</span>. {currentQuestion.explanation}
          </p>
        </div>
      )}

      {/* Next Question Button */}
      <div className="flex justify-center">
        <button
          onClick={nextQuestion}
          disabled={!answered || currentIndex === questions.length - 1}
          className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
            !answered || currentIndex === questions.length - 1
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg shadow-emerald-500/25'
          }`}
        >
          Next Question
        </button>
      </div>

      <div className="text-slate-400 text-sm font-medium mt-4 text-center">Keyboard: T / F or Y / N</div>
    </div>
  );
}