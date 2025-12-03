'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;

const PIECES = {
  I: [[0, 0], [1, 0], [2, 0], [3, 0]],
  O: [[0, 0], [1, 0], [0, 1], [1, 1]],
  T: [[1, 0], [0, 1], [1, 1], [2, 1]],
  S: [[1, 0], [2, 0], [0, 1], [1, 1]],
  Z: [[0, 0], [1, 0], [1, 1], [2, 1]],
  J: [[0, 0], [0, 1], [1, 1], [2, 1]],
  L: [[2, 0], [0, 1], [1, 1], [2, 1]]
};

const PIECE_COLORS = {
  I: 'bg-cyan-500',
  O: 'bg-yellow-500',
  T: 'bg-purple-500',
  S: 'bg-green-500',
  Z: 'bg-red-500',
  J: 'bg-blue-500',
  L: 'bg-orange-500'
};

type PieceType = keyof typeof PIECES;
type GameState = 'idle' | 'playing' | 'paused' | 'gameOver';

interface Position {
  x: number;
  y: number;
}

interface Piece {
  shape: number[][];
  position: Position;
  type: PieceType;
}

export default function TetrisGame() {
  const [board, setBoard] = useState<(PieceType | null)[][]>([]);
  const [currentPiece, setCurrentPiece] = useState<Piece | null>(null);
  const [nextPiece, setNextPiece] = useState<number[][] | null>(null);
  const [nextPieceType, setNextPieceType] = useState<PieceType | null>(null);
  const [gameState, setGameState] = useState<GameState>('idle');
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [isMobile, setIsMobile] = useState(false);
  
  const boardRef = useRef<(PieceType | null)[][]>([]);
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const touchIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    initBoard();
  }, []);

  const initBoard = () => {
    const newBoard = Array(BOARD_HEIGHT).fill(null).map(() => 
      Array(BOARD_WIDTH).fill(null)
    );
    setBoard(newBoard);
    boardRef.current = newBoard;
  };

  const getRandomPiece = (): { shape: number[][], type: PieceType } => {
    const types = Object.keys(PIECES) as PieceType[];
    const type = types[Math.floor(Math.random() * types.length)];
    return { shape: PIECES[type], type };
  };

  const spawnNewPiece = useCallback(() => {
    const piece = nextPiece && nextPieceType 
      ? { shape: nextPiece, type: nextPieceType }
      : getRandomPiece();
    
    const newNext = getRandomPiece();
    setNextPiece(newNext.shape);
    setNextPieceType(newNext.type);

    const newPiece: Piece = {
      shape: piece.shape,
      position: { x: Math.floor(BOARD_WIDTH / 2) - 1, y: 0 },
      type: piece.type
    };

    if (checkCollision(newPiece.shape, newPiece.position, boardRef.current)) {
      setGameState('gameOver');
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
      return;
    }

    setCurrentPiece(newPiece);
  }, [nextPiece, nextPieceType]);

  const checkCollision = (shape: number[][], pos: Position, currentBoard: (PieceType | null)[][]): boolean => {
    for (const [x, y] of shape) {
      const newX = pos.x + x;
      const newY = pos.y + y;

      if (newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT) {
        return true;
      }

      if (newY >= 0 && currentBoard[newY][newX] !== null) {
        return true;
      }
    }
    return false;
  };

  const clearLines = useCallback((currentBoard: (PieceType | null)[][]) => {
    const newBoard = currentBoard.filter(row => row.some(cell => cell === null));
    const linesCleared = BOARD_HEIGHT - newBoard.length;

    if (linesCleared > 0) {
      const emptyRows = Array(linesCleared).fill(null).map(() => 
        Array(BOARD_WIDTH).fill(null)
      );
      const finalBoard = [...emptyRows, ...newBoard];
      
      setBoard(finalBoard);
      boardRef.current = finalBoard;
      
      const points = [0, 100, 300, 500, 800][linesCleared];
      setScore(prevScore => prevScore + points * level);
      
      setLevel(() => Math.floor(score / 1000) + 1);
    }
  }, [level, score]);

  const placePiece = useCallback(() => {
    if (!currentPiece) return;

    const newBoard = boardRef.current.map(row => [...row]);
    
    for (const [x, y] of currentPiece.shape) {
      const boardX = currentPiece.position.x + x;
      const boardY = currentPiece.position.y + y;
      if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
        newBoard[boardY][boardX] = currentPiece.type;
      }
    }

    setBoard(newBoard);
    boardRef.current = newBoard;
    clearLines(newBoard);
    spawnNewPiece();
  }, [currentPiece, clearLines, spawnNewPiece]);

  const moveDown = useCallback(() => {
    if (gameState !== 'playing' || !currentPiece) return;
    if (!boardRef.current) return;

    const newPos = { 
      x: currentPiece.position.x,
      y: currentPiece.position.y + 1 
    };

    if (checkCollision(currentPiece.shape, newPos, boardRef.current)) {
      placePiece();
    } else {
      setCurrentPiece({ ...currentPiece, position: newPos });
    }
  }, [gameState, currentPiece, placePiece]);

  const moveHorizontal = useCallback((direction: number) => {
    if (gameState !== 'playing' || !currentPiece) return;

    const newPos = { 
      x: currentPiece.position.x + direction, 
      y: currentPiece.position.y 
    };

    if (!checkCollision(currentPiece.shape, newPos, board)) {
      setCurrentPiece({ ...currentPiece, position: newPos });
    }
  }, [gameState, currentPiece, board]);

  const rotate = useCallback(() => {
    if (gameState !== 'playing' || !currentPiece) return;

    const rotated = currentPiece.shape.map(([x, y]) => [-y, x]);

    if (!checkCollision(rotated, currentPiece.position, board)) {
      setCurrentPiece({ ...currentPiece, shape: rotated });
    }
  }, [gameState, currentPiece, board]);

  const togglePause = useCallback(() => {
    if (gameState === 'playing') {
      setGameState('paused');
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    } else if (gameState === 'paused') {
      setGameState('playing');
    }
  }, [gameState]);

  const startGame = () => {
    initBoard();
    setScore(0);
    setLevel(1);
    setCurrentPiece(null);
    setNextPiece(null);
    setNextPieceType(null);
    setGameState('playing');
  };

  useEffect(() => {
    if (gameState === 'playing' && !currentPiece) {
      spawnNewPiece();
    }
  }, [gameState, currentPiece, spawnNewPiece]);

  useEffect(() => {
    if (gameState === 'playing') {
      const speed = Math.max(100, 1000 - (level - 1) * 100);
      gameLoopRef.current = setInterval(moveDown, speed);
      
      return () => {
        if (gameLoopRef.current) {
          clearInterval(gameLoopRef.current);
        }
      };
    }
  }, [gameState, level, moveDown]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (gameState !== 'playing') {
        if (e.code === 'Escape' && gameState === 'paused') {
          togglePause();
        }
        return;
      }

      // Arrow keys
      if (e.code === 'ArrowLeft') {
        e.preventDefault();
        moveHorizontal(-1);
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        moveHorizontal(1);
      } else if (e.code === 'ArrowDown') {
        e.preventDefault();
        moveDown();
      } else if (e.code === 'ArrowUp') {
        e.preventDefault();
        rotate();
      }
      // WASD keys
      else if (e.code === 'KeyA') {
        e.preventDefault();
        moveHorizontal(-1);
      } else if (e.code === 'KeyD') {
        e.preventDefault();
        moveHorizontal(1);
      } else if (e.code === 'KeyS') {
        e.preventDefault();
        moveDown();
      } else if (e.code === 'KeyW') {
        e.preventDefault();
        rotate();
      }
      // Pause
      else if (e.code === 'Escape') {
        togglePause();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameState, moveHorizontal, moveDown, rotate, togglePause]);

  const handleTouchStart = (e: React.TouchEvent<HTMLButtonElement>) => {
    const action = e.currentTarget.dataset.action;
    
    if (action === 'left') {
      moveHorizontal(-1);
      touchIntervalRef.current = setInterval(() => moveHorizontal(-1), 100);
    } else if (action === 'right') {
      moveHorizontal(1);
      touchIntervalRef.current = setInterval(() => moveHorizontal(1), 100);
    } else if (action === 'down') {
      moveDown();
      touchIntervalRef.current = setInterval(moveDown, 50);
    } else if (action === 'rotate') {
      rotate();
    }
  };

  const handleTouchEnd = () => {
    if (touchIntervalRef.current) {
      clearInterval(touchIntervalRef.current);
      touchIntervalRef.current = null;
    }
  };

  const renderBoard = () => {
    const displayBoard = board.map(row => [...row]);

    if (currentPiece) {
      for (const [x, y] of currentPiece.shape) {
        const boardX = currentPiece.position.x + x;
        const boardY = currentPiece.position.y + y;
        if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
          displayBoard[boardY][boardX] = currentPiece.type;
        }
      }
    }

    return displayBoard.flat().map((cell, i) => (
      <div
        key={i}
        className={`${isMobile ? 'w-5 h-5' : 'w-7 h-7'} rounded-sm transition-colors ${
          cell ? `${PIECE_COLORS[cell]} shadow-lg` : 'bg-gray-800/50'
        }`}
      />
    ));
  };

  return (
    <div className="p-4 md:p-8 relative z-10 min-h-screen flex flex-col items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-4xl"
      >
        {/* Header with Back Button */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-3">
          <Link href="/games">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 bg-pink-600 hover:bg-pink-700 rounded-lg text-white font-semibold transition flex items-center gap-2"
            >
              ⬅️ Back to Games
            </motion.button>
          </Link>

          <div className="text-white text-2xl font-bold drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)]">
            Score: {score} | Level: {level}
          </div>
        </div>

        {/* Main game container */}
        <div className="flex flex-col lg:flex-row gap-2 sm:gap-6 items-start justify-center">
          {/* Left sidebar */}
          <div className="w-full lg:w-48 flex lg:flex-col gap-2 sm:gap-4 justify-between lg:justify-start">
            <div className="flex-1 lg:flex-none bg-gray-900/90 backdrop-blur-md rounded-lg p-2 sm:p-4 border-2 border-purple-400/50 shadow-xl">
              <div className="text-purple-300 text-xs sm:text-sm mb-1 font-semibold drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">Score</div>
              <div className="text-2xl sm:text-3xl font-bold text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)]">{score}</div>
            </div>
            
            <div className="flex-1 lg:flex-none bg-gray-900/90 backdrop-blur-md rounded-lg p-2 sm:p-4 border-2 border-purple-400/50 shadow-xl">
              <div className="text-purple-300 text-xs sm:text-sm mb-1 font-semibold drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">Level</div>
              <div className="text-2xl sm:text-3xl font-bold text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)]">{level}</div>
            </div>
            
            <div className="hidden sm:block lg:flex-none bg-gray-900/90 backdrop-blur-md rounded-lg p-2 sm:p-4 border-2 border-purple-400/50 shadow-xl">
              <div className="text-purple-300 text-xs sm:text-sm mb-2 font-semibold drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">Selanjutnya</div>
              <div className="flex justify-center">
                <div className="grid gap-0.5" style={{ 
                  gridTemplateColumns: `repeat(4, ${isMobile ? '12px' : '16px'})`,
                  gridTemplateRows: `repeat(4, ${isMobile ? '12px' : '16px'})`
                }}>
                  {Array.from({ length: 16 }).map((_, i) => {
                    const x = i % 4;
                    const y = Math.floor(i / 4);
                    const hasBlock = nextPiece?.some(([bx, by]) => bx === x && by === y);
                    return (
                      <div
                        key={i}
                        className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} rounded-sm ${
                          hasBlock 
                            ? `${PIECE_COLORS[nextPieceType || 'I']} shadow-lg` 
                            : 'bg-white/5'
                        }`}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Game board with neon border (sama seperti Snake) */}
          <div className="relative mx-auto">
            {/* Neon Border - sama seperti Snake */}
            <div className="absolute inset-0 rounded-xl p-[3px] bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 animate-border-glow">
              <div className="h-full w-full rounded-xl bg-black/90"></div>
            </div>

            {/* Game Board */}
            <div className="relative z-10 p-3">
              <div 
                className="grid gap-0.5 bg-gray-900/50 p-1.5 sm:p-2 rounded-lg relative"
                style={{ 
                  gridTemplateColumns: `repeat(10, ${isMobile ? '20px' : '28px'})`,
                  gridTemplateRows: `repeat(20, ${isMobile ? '20px' : '28px'})`
                }}
              >
                {renderBoard()}
              </div>

              {/* Game over overlay */}
              {gameState === 'gameOver' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center rounded-lg"
                >
                  <h2 className="text-4xl font-bold text-white mb-4">Game Over!</h2>
                  <p className="text-2xl text-gray-300 mb-2">Score Akhir: {score}</p>
                  <p className="text-xl text-gray-400 mb-6">Level: {level}</p>
                  <button
                    onClick={startGame}
                    className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg text-white font-semibold transition"
                  >
                    Main Lagi
                  </button>
                </motion.div>
              )}

              {/* Paused overlay */}
              {gameState === 'paused' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center rounded-lg"
                >
                  <h2 className="text-4xl font-bold text-white mb-4">⏸️ Paused</h2>
                  <p className="text-gray-300 mb-6">Tekan ESC untuk lanjut</p>
                  <button
                    onClick={togglePause}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-semibold transition"
                  >
                    Resume
                  </button>
                </motion.div>
              )}

              {/* Start Screen */}
              {gameState === 'idle' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center rounded-lg"
                >
                  <h2 className="text-4xl font-bold text-white mb-4">🎮 TETRIS</h2>
                  <p className="text-gray-300 mb-2 text-center">Arrow Keys / WASD untuk kontrol</p>
                  <p className="text-gray-400 mb-6 text-sm">Tekan ESC untuk pause</p>
                  <button
                    onClick={startGame}
                    className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg text-white font-semibold transition"
                  >
                    Mulai Game
                  </button>
                </motion.div>
              )}
            </div>
          </div>

          {/* Right sidebar - only show on desktop */}
          {!isMobile && (
            <div className="w-full lg:w-48 space-y-2 sm:space-y-4">
              {/* Controls */}
              <div className="bg-gray-900/90 backdrop-blur-md rounded-lg p-2 sm:p-4 border-2 border-purple-400/50 shadow-xl">
                <div className="text-purple-300 text-xs sm:text-sm mb-2 font-semibold drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">Kontrol</div>
                <div className="space-y-1 text-[10px] sm:text-xs text-white/80">
                  <div className="flex justify-between">
                    <span>←/→ atau A/D</span>
                    <span>Gerak</span>
                  </div>
                  <div className="flex justify-between">
                    <span>↓ atau S</span>
                    <span>Turun Cepat</span>
                  </div>
                  <div className="flex justify-between">
                    <span>↑ atau W</span>
                    <span>Putar</span>
                  </div>
                  <div className="flex justify-between">
                    <span>ESC</span>
                    <span>Pause</span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex lg:flex-col gap-2">
                {gameState === 'idle' ? (
                  <button
                    onClick={startGame}
                    className="flex-1 lg:flex-none px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-bold hover:from-green-600 hover:to-emerald-700 transition-all transform hover:scale-105 shadow-lg text-sm sm:text-base"
                  >
                    Mulai Game
                  </button>
                ) : (
                  <>
                    <button
                      onClick={togglePause}
                      className="flex-1 lg:flex-none px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg font-bold hover:from-yellow-600 hover:to-orange-600 transition-all transform hover:scale-105 shadow-lg text-sm sm:text-base"
                    >
                      {gameState === 'paused' ? 'Lanjut' : 'Pause'}
                    </button>
                    <button
                      onClick={startGame}
                      className="flex-1 lg:flex-none px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-bold hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg text-sm sm:text-base"
                    >
                      Restart
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Mobile controls - Arrow keyboard layout (sama seperti Snake) */}
        {isMobile && (
          <div className="mt-6">
            <div className="flex flex-col items-center gap-2">
              {/* Up Button */}
              <button
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                data-action="rotate"
                disabled={gameState !== 'playing'}
                className="w-16 h-16 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-bold shadow-lg flex items-center justify-center transition-colors text-2xl"
              >
                ▲
              </button>
              
              {/* Left, Down, Right Buttons */}
              <div className="flex gap-2">
                <button
                  onTouchStart={handleTouchStart}
                  onTouchEnd={handleTouchEnd}
                  data-action="left"
                  disabled={gameState !== 'playing'}
                  className="w-16 h-16 bg-purple-600 hover:bg-purple-700 active:bg-purple-800 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-bold shadow-lg flex items-center justify-center transition-colors text-2xl"
                >
                  ◀
                </button>
                <button
                  onTouchStart={handleTouchStart}
                  onTouchEnd={handleTouchEnd}
                  data-action="down"
                  disabled={gameState !== 'playing'}
                  className="w-16 h-16 bg-yellow-600 hover:bg-yellow-700 active:bg-yellow-800 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-bold shadow-lg flex items-center justify-center transition-colors text-2xl"
                >
                  ▼
                </button>
                <button
                  onTouchStart={handleTouchStart}
                  onTouchEnd={handleTouchEnd}
                  data-action="right"
                  disabled={gameState !== 'playing'}
                  className="w-16 h-16 bg-purple-600 hover:bg-purple-700 active:bg-purple-800 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-bold shadow-lg flex items-center justify-center transition-colors text-2xl"
                >
                  ▶
                </button>
              </div>

              {/* Pause Button (Mobile) */}
              <button
                onClick={togglePause}
                disabled={gameState === 'idle' || gameState === 'gameOver'}
                className="mt-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white font-semibold transition"
              >
                {gameState === 'paused' ? '▶ Resume' : '⏸ Pause'}
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}