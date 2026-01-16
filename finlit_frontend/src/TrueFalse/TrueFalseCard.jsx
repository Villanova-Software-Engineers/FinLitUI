import React, { useState, useEffect } from 'react';

export default function TrueFalseCard({ onQuizComplete = null }) {
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

  // Determine result color
  const resultColor = result.includes('Correct')
    ? 'text-green-600'
    : result.includes('Incorrect')
      ? 'text-red-600'
      : 'text-black';

  return (
    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 min-h-screen flex flex-col p-6">
      {/* Header */}
      <div className="bg-white text-black rounded-xl shadow-lg px-6 py-3 mx-auto mb-6">
        <h1 className="text-3xl text-center font-bold">Learn About Investment Banking!</h1>
      </div>

      {/* Main Content Area with Score Sidebar */}
      <div className="flex flex-1 gap-6 items-start justify-center">
        {/* Main Quiz Area */}
        <div className="flex flex-col items-center flex-1 max-w-2xl">
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

        {/* Score Tab - Right Sidebar */}
        <div className="bg-blue-100 p-6 rounded-lg shadow-lg flex-shrink-0 w-48">
          <h3 className="text-2xl text-blue-700 text-center font-bold">Score</h3>
          <p className="text-xl text-black font-semibold mt-2 text-center">{score} / {totalQuestions}</p>
        </div>
      </div>
    </div>
  );
}