import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

interface FinancialBallGameProps {
  onClose?: () => void;
}

const FinancialBallGame: React.FC<FinancialBallGameProps> = ({ onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [money, setMoney] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameMessage, setGameMessage] = useState('');
  const [itemsProcessed, setItemsProcessed] = useState(0);
  const [isJumping, setIsJumping] = useState(false);

  const gameStateRef = useRef({
    ballX: 80,
    ballY: 120,
    ballRadius: 14,
    ballVelY: 0,
    gravity: 0.5,
    jumpForce: -11,
    groundY: 120,
    gameSpeed: 3.5,
    items: [] as Array<{
      x: number;
      label: string;
      amount: number;
      type: 'income' | 'necessary' | 'avoid';
      color: string;
      passed: boolean;
      collected: boolean;
      message: string;
      dodgeMessage: string;
    }>,
    itemIndex: 0,
  });

  const financialSequence = [
    // Start with income
    { label: 'SALARY', amount: 1000, type: 'income' as const, color: '#10b981', message: 'Salary earned!', dodgeMessage: 'Why dodge your salary?' },
    { label: 'TAX', amount: -150, type: 'necessary' as const, color: '#3b82f6', message: 'Tax paid', dodgeMessage: 'Tax Evasion! You\'re jailed!' },
    { label: 'RENT', amount: -450, type: 'necessary' as const, color: '#2563eb', message: 'Rent paid', dodgeMessage: 'Evicted for not paying rent!' },
    { label: 'GAMBLE', amount: -600, type: 'avoid' as const, color: '#ef4444', message: 'Lost money gambling!', dodgeMessage: 'Good! Avoided gambling!' },
    { label: 'BONUS', amount: 400, type: 'income' as const, color: '#059669', message: 'Bonus received!', dodgeMessage: 'Why dodge a bonus?' },
    { label: 'FOOD', amount: -200, type: 'necessary' as const, color: '#1e40af', message: 'Groceries bought', dodgeMessage: 'You need to eat!' },
    { label: 'IMPULSE', amount: -350, type: 'avoid' as const, color: '#dc2626', message: 'Impulse purchase!', dodgeMessage: 'Smart! Avoided impulse buy!' },
    { label: 'SCAM', amount: -700, type: 'avoid' as const, color: '#991b1b', message: 'Fell for a scam!', dodgeMessage: 'Smart! Avoided the scam!' },
    { label: 'REFUND', amount: 250, type: 'income' as const, color: '#047857', message: 'Tax refund!', dodgeMessage: 'Why skip a refund?' },
    { label: 'LUXURY', amount: -500, type: 'avoid' as const, color: '#b91c1c', message: 'Unnecessary luxury!', dodgeMessage: 'Wise! Avoided luxury spending!' },
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const gameLoop = () => {
      const state = gameStateRef.current;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw beautiful gradient sky
      const skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      skyGradient.addColorStop(0, '#bfdbfe');
      skyGradient.addColorStop(0.5, '#dbeafe');
      skyGradient.addColorStop(1, '#eff6ff');
      ctx.fillStyle = skyGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw ground with gradient
      const groundY = 130;
      const groundGradient = ctx.createLinearGradient(0, groundY, 0, canvas.height);
      groundGradient.addColorStop(0, '#10b981');
      groundGradient.addColorStop(1, '#059669');
      ctx.fillStyle = groundGradient;
      ctx.fillRect(0, groundY, canvas.width, canvas.height - groundY);

      // Ground top line
      ctx.strokeStyle = '#047857';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, groundY);
      ctx.lineTo(canvas.width, groundY);
      ctx.stroke();

      // Only update game physics if game is running
      if (gameStarted && !gameOver) {
        // Update ball physics
        state.ballVelY += state.gravity;
        state.ballY += state.ballVelY;

        // Ground collision
        if (state.ballY >= state.groundY) {
          state.ballY = state.groundY;
          state.ballVelY = 0;
          setIsJumping(false);
        }

        // Spawn next item in sequence
        if (state.items.length === 0 && state.itemIndex < financialSequence.length) {
          const nextItem = financialSequence[state.itemIndex];
          state.items.push({
            x: canvas.width,
            ...nextItem,
            passed: false,
            collected: false,
          });
          state.itemIndex++;
        }
      }

      // Update and draw financial items
      state.items = state.items.filter(item => {
        if (gameStarted && !gameOver) {
          item.x -= state.gameSpeed;

          // Check if item was collected or dodged
          if (!item.passed && item.x + 50 < state.ballX - state.ballRadius) {
            item.passed = true;
            setItemsProcessed(prev => prev + 1);

            if (item.type === 'necessary' && !item.collected) {
              // MUST collect necessary items - game over if dodged
              setGameMessage(item.dodgeMessage);
              setGameOver(true);
            } else if (item.type === 'avoid' && !item.collected) {
              // SHOULD dodge bad items - good job!
              setGameMessage(item.dodgeMessage);
              setTimeout(() => setGameMessage(''), 1500);
            } else if (item.type === 'income' && !item.collected) {
              // Missing income is bad but not game over
              setGameMessage(item.dodgeMessage);
              setTimeout(() => setGameMessage(''), 1500);
            }

            // Check if all items processed
            if (state.itemIndex >= financialSequence.length && state.items.length === 1) {
              // Last item processed - game won!
              setTimeout(() => {
                setGameMessage('Level Complete!');
                setGameOver(true);
              }, 500);
            }
          }
        }

        // Draw item box
        const itemHeight = 35;
        const itemWidth = 50;
        const itemY = groundY - itemHeight;
        const borderRadius = 8;

        ctx.save();

        // Background color based on type
        ctx.fillStyle = item.color;
        ctx.beginPath();
        ctx.roundRect(item.x, itemY, itemWidth, itemHeight, borderRadius);
        ctx.fill();

        // Border
        ctx.strokeStyle = item.type === 'income' ? '#047857' :
                         item.type === 'necessary' ? '#1e40af' : '#7f1d1d';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.roundRect(item.x, itemY, itemWidth, itemHeight, borderRadius);
        ctx.stroke();

        // Draw item label with shadow for readability
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 2;
        ctx.shadowOffsetY = 1;
        ctx.font = 'bold 9px Inter, sans-serif';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(item.label, item.x + itemWidth / 2, itemY + itemHeight / 2 - 5);

        // Draw amount with shadow
        ctx.font = 'bold 11px Inter, sans-serif';
        ctx.fillText(
          item.amount > 0 ? `+$${item.amount}` : `-$${Math.abs(item.amount)}`,
          item.x + itemWidth / 2,
          itemY + itemHeight / 2 + 7
        );
        ctx.shadowBlur = 0;

        ctx.restore();

        // Collision detection
        if (gameStarted && !gameOver && !item.collected) {
          if (
            state.ballX + state.ballRadius > item.x &&
            state.ballX - state.ballRadius < item.x + itemWidth &&
            state.ballY + state.ballRadius > groundY - itemHeight
          ) {
            item.collected = true;

            if (item.type === 'avoid') {
              // Hit a bad expense - game over
              setGameMessage(item.message);
              setMoney(prev => prev + item.amount);
              setGameOver(true);
            } else {
              // Collected income or necessary expense
              setGameMessage(item.message);
              setTimeout(() => setGameMessage(''), 1500);
              setMoney(prev => prev + item.amount);
            }
          }
        }

        return item.x > -100;
      });

      // Draw clean coin representing money
      ctx.save();

      // Main coin - solid golden color
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(state.ballX, state.ballY, state.ballRadius, 0, Math.PI * 2);
      ctx.fill();

      // Clean border
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Inner circle for coin detail
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(state.ballX, state.ballY, state.ballRadius - 4, 0, Math.PI * 2);
      ctx.stroke();

      // Dollar sign
      ctx.font = 'bold 16px Arial';
      ctx.fillStyle = '#92400e';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('$', state.ballX, state.ballY);

      ctx.restore();
    };

    const interval = setInterval(gameLoop, 1000 / 60); // 60 FPS

    return () => clearInterval(interval);
  }, [gameOver, gameStarted]);

  const handleJump = () => {
    if (!gameStarted) {
      setGameStarted(true);
      return;
    }
    if (gameOver) return;
    const state = gameStateRef.current;

    if (state.ballY >= state.groundY) {
      state.ballVelY = state.jumpForce;
      setIsJumping(true);
    }
  };

  const handleReset = () => {
    setMoney(0);
    setGameOver(false);
    setGameStarted(true);
    setGameMessage('');
    setItemsProcessed(0);
    const state = gameStateRef.current;
    state.ballY = state.groundY;
    state.ballVelY = 0;
    state.items = [];
    state.itemIndex = 0;
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        handleJump();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameOver, gameStarted]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="max-w-2xl mx-auto relative"
    >
      {/* Close Button (optional) */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 z-20 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 border-2 border-gray-200 hover:border-brand-500"
          aria-label="Close game"
        >
          <X className="w-5 h-5 text-gray-700 hover:text-brand-600" />
        </button>
      )}

      {/* Money Display */}
      <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl shadow-lg">
        <p className="text-lg font-bold text-navy-800">${money}</p>
      </div>

      {/* Game Message */}
      {gameMessage && !gameOver && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="absolute top-4 right-4 z-10 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl shadow-lg"
        >
          <p className="text-sm font-semibold text-navy-800">{gameMessage}</p>
        </motion.div>
      )}

      <canvas
        ref={canvasRef}
        width={500}
        height={150}
        onClick={handleJump}
        className="w-full h-auto rounded-2xl border-4 border-brand-500/30 bg-sky-50 cursor-pointer shadow-2xl hover:shadow-brand-500/20 transition-shadow duration-300"
      />

      {/* Start Game Overlay */}
      {!gameStarted && !gameOver && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl cursor-pointer"
          onClick={handleJump}
        >
          <div className="text-center">
            <p className="text-4xl font-bold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
              Click to Start
            </p>
            <p className="text-sm text-white/80 mt-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              Collect income & necessary expenses, dodge bad spending!
            </p>
          </div>
        </motion.div>
      )}

      {/* Game Over Overlay */}
      {gameOver && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 rounded-2xl backdrop-blur-sm"
        >
          <div className="bg-white rounded-2xl p-6 shadow-2xl text-center">
            <h3 className="text-2xl font-bold text-navy-800 mb-2">
              {gameMessage === 'Level Complete!' ? 'Success!' : 'Game Over!'}
            </h3>
            <p className="text-lg text-slate-600 mb-2">{gameMessage}</p>
            <p className="text-xl text-brand-600 font-semibold mb-4">Final: ${money}</p>
            <button
              onClick={handleReset}
              className="px-6 py-2.5 bg-gradient-to-r from-brand-500 to-brand-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
            >
              Play Again
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default FinancialBallGame;
