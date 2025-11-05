import React, { useEffect, useState, useCallback } from 'react';
import './App.css';

export default function TrueFalseCard({ question, explanation, onAnswer, correctAnswer, answered, buttonsDisabled }) {
  const [selected, setSelected] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);

  useEffect(() => {
    setSelected(null); // default answer isn't selected
    setIsCorrect(null); // default question isn't correct or incorrect
  }, [question]);

  const handleAnswer = useCallback(
    (value) => {
      if (selected !== null) return;
      setSelected(value);

      // Check if the selected value matches the correct answer
      const currentIsCorrect = (value === 'true' && correctAnswer) || (value === 'false' && !correctAnswer);
      setIsCorrect(currentIsCorrect);

      onAnswer(value === 'true');
    },
    [onAnswer, selected, correctAnswer]
  );

  // keyboard functionality for answering questions
  useEffect(() => {
    const onKey = (e) => {
      if (selected !== null) return;
      const key = e.key.toLowerCase();
      if (key === 't' || key === 'y') handleAnswer('true');
      if (key === 'f' || key === 'n') handleAnswer('false');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleAnswer, selected]);

  // true and false buttons
  return (
    <div>
      <h2 className="text-black text-2xl font-bold mb-4 max-w-md">{question}</h2>

      <div className='mb-2'>
        <button
          onClick={() => handleAnswer('true')}
          disabled={buttonsDisabled || answered}
          className={`px-6 py-3 rounded-lg font-bold text-white bg-gray-700 hover:bg-gray-600 ${selected === 'true' ? (isCorrect ? 'correct' : 'incorrect') : ''} card-hover`}
        >
          TRUE
        </button>

        <button
          onClick={() => handleAnswer('false')}
          disabled={buttonsDisabled || answered}
          className={`px-6 py-3 rounded-lg font-bold text-white bg-gray-700 hover:bg-gray-600 ${selected === 'false' ? (isCorrect ? 'correct' : 'incorrect') : ''} card-hover`}
        >
          FALSE
        </button>   
      </div>

      {/* Show explanation if answered by click or timer */}
      {(selected !== null || answered) && (
        <div className="text-black text-md font-bold flex flex-col items-center mt-4 space-y-3 hover:scale-105 transition-transform duration-300">
          {selected !== null && (
            <div>
              You selected: {selected === 'true' ? 'TRUE' : 'FALSE'}{' '}
              {selected === 'true' ? '✓' : '✕'}
            </div>
          )}

          <div className="bg-white text-center rounded-lg shadow-sm px-4 py-3 max-w-md">
            {explanation}
          </div>
        </div>
      )}

      <div className="text-black text-xs font-bold mt-4">Keyboard: T / F or Y / N</div>
    </div>
  );
}
