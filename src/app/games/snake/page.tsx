"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

type Position = { x: number; y: number };
type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";

const GRID_SIZE = 20;
const GAME_SPEED = 120; // Constant speed

export default function SnakeGame() {
  const [snake, setSnake] = useState<Position[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Position>({ x: 15, y: 15 });
  const [direction, setDirection] = useState<Direction>("RIGHT");
  const [nextDirection, setNextDirection] = useState<Direction>("RIGHT");
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Generate random food position
  const generateFood = useCallback(() => {
    const newFood = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
    // Check if food spawns on snake
    const onSnake = snake.some((s) => s.x === newFood.x && s.y === newFood.y);
    if (onSnake) return generateFood();
    return newFood;
  }, [snake]);

  // Start game
  const startGame = () => {
    setSnake([{ x: 10, y: 10 }]);
    setFood(generateFood());
    setDirection("RIGHT");
    setNextDirection("RIGHT");
    setGameOver(false);
    setGameStarted(true);
    setScore(0);
    setIsPaused(false);
  };

  // Toggle pause
  const togglePause = () => {
    if (!gameStarted || gameOver) return;
    setIsPaused(!isPaused);
  };

  // Handle keyboard input
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!gameStarted) {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          startGame();
        }
        return;
      }

      if (e.key === " " || e.key === "p" || e.key === "P") {
        e.preventDefault();
        togglePause();
        return;
      }

      if (isPaused || gameOver) return;

      e.preventDefault();
      handleDirectionChange(e.key);
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [direction, gameStarted, gameOver, isPaused]);

  // Handle direction change (for keyboard and buttons)
  const handleDirectionChange = (key: string) => {
    switch (key) {
      case "ArrowUp":
      case "w":
      case "W":
      case "UP":
        if (direction !== "DOWN") setNextDirection("UP");
        break;
      case "ArrowDown":
      case "s":
      case "S":
      case "DOWN":
        if (direction !== "UP") setNextDirection("DOWN");
        break;
      case "ArrowLeft":
      case "a":
      case "A":
      case "LEFT":
        if (direction !== "RIGHT") setNextDirection("LEFT");
        break;
      case "ArrowRight":
      case "d":
      case "D":
      case "RIGHT":
        if (direction !== "LEFT") setNextDirection("RIGHT");
        break;
    }
  };

  // Game loop
  useEffect(() => {
    if (!gameStarted || gameOver || isPaused) return;

    const moveSnake = () => {
      setDirection(nextDirection);

      const newHead = { ...snake[0] };

      switch (nextDirection) {
        case "UP":
          newHead.y -= 1;
          break;
        case "DOWN":
          newHead.y += 1;
          break;
        case "LEFT":
          newHead.x -= 1;
          break;
        case "RIGHT":
          newHead.x += 1;
          break;
      }

      // Check wall collision
      if (
        newHead.x < 0 ||
        newHead.x >= GRID_SIZE ||
        newHead.y < 0 ||
        newHead.y >= GRID_SIZE
      ) {
        setGameOver(true);
        return;
      }

      // Check self collision
      if (snake.some((s) => s.x === newHead.x && s.y === newHead.y)) {
        setGameOver(true);
        return;
      }

      const newSnake = [newHead, ...snake];

      // Check food collision
      if (newHead.x === food.x && newHead.y === food.y) {
        setScore((prev) => prev + 10);
        setFood(generateFood());
      } else {
        newSnake.pop();
      }

      setSnake(newSnake);
    };

    const gameInterval = setInterval(moveSnake, GAME_SPEED);

    return () => clearInterval(gameInterval);
  }, [snake, food, nextDirection, gameStarted, gameOver, isPaused, generateFood]);

  return (
    <div className="p-4 md:p-8 relative z-10 min-h-screen flex flex-col items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-2xl"
      >
        {/* Header */}
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

          <div className="text-white text-2xl font-bold">
            Score: {score}
          </div>
        </div>

        {/* Game Container */}
        <div className="relative">
          {/* Neon Border */}
          <div className="absolute inset-0 rounded-xl p-[3px] bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 animate-border-glow">
            <div className="h-full w-full rounded-xl bg-black/90"></div>
          </div>

          {/* Game Board */}
          <div className="relative z-10 p-3 md:p-6">
            <div
              className="relative mx-auto bg-gray-900/50 rounded-lg overflow-hidden"
              style={{
                width: "min(100%, 400px)",
                height: "min(100%, 400px)",
                aspectRatio: "1/1",
              }}
            >
              {/* Grid */}
              <div
                className="absolute inset-0 grid opacity-10"
                style={{
                  gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
                  gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`,
                }}
              >
                {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => (
                  <div key={i} className="border border-gray-700"></div>
                ))}
              </div>

              {/* Snake */}
              {snake.map((segment, index) => (
                <div
                  key={index}
                  className="absolute transition-all duration-75"
                  style={{
                    left: `${(segment.x / GRID_SIZE) * 100}%`,
                    top: `${(segment.y / GRID_SIZE) * 100}%`,
                    width: `${(1 / GRID_SIZE) * 100}%`,
                    height: `${(1 / GRID_SIZE) * 100}%`,
                    backgroundColor: index === 0 ? "#22c55e" : "#4ade80",
                    borderRadius: index === 0 ? "4px" : "2px",
                    border: index === 0 ? "2px solid #16a34a" : "none",
                    transform: "scale(0.95)",
                  }}
                />
              ))}

              {/* Food */}
              <div
                className="absolute animate-pulse"
                style={{
                  left: `${(food.x / GRID_SIZE) * 100}%`,
                  top: `${(food.y / GRID_SIZE) * 100}%`,
                  width: `${(1 / GRID_SIZE) * 100}%`,
                  height: `${(1 / GRID_SIZE) * 100}%`,
                  backgroundColor: "#ef4444",
                  borderRadius: "50%",
                  boxShadow: "0 0 10px #ef4444",
                  transform: "scale(0.9)",
                }}
              />

              {/* Game Over Overlay */}
              {gameOver && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center rounded-lg"
                >
                  <h2 className="text-4xl font-bold text-white mb-4">
                    Game Over!
                  </h2>
                  <p className="text-2xl text-gray-300 mb-6">
                    Final Score: {score}
                  </p>
                  <button
                    onClick={startGame}
                    className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg text-white font-semibold transition"
                  >
                    Play Again
                  </button>
                </motion.div>
              )}

              {/* Start Screen */}
              {!gameStarted && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center rounded-lg"
                >
                  <h2 className="text-4xl font-bold text-white mb-4">
                    🐍 Snake Game
                  </h2>
                  <p className="text-gray-300 mb-2 text-center">
                    Use Arrow Keys or WASD to move
                  </p>
                  <p className="text-gray-400 mb-6 text-sm">
                    Press Space or P to pause
                  </p>
                  <button
                    onClick={startGame}
                    className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg text-white font-semibold transition"
                  >
                    Start Game
                  </button>
                </motion.div>
              )}

              {/* Pause Screen */}
              {isPaused && gameStarted && !gameOver && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center rounded-lg"
                >
                  <h2 className="text-4xl font-bold text-white mb-4">
                    ⏸️ Paused
                  </h2>
                  <p className="text-gray-300 mb-6">
                    Press Space or P to resume
                  </p>
                  <button
                    onClick={togglePause}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-semibold transition"
                  >
                    Resume
                  </button>
                </motion.div>
              )}
            </div>

            {/* Mobile Controls (Arrow Buttons) */}
            <div className="mt-6 md:hidden">
              <div className="flex flex-col items-center gap-2">
                {/* Up Button */}
                <button
                  onClick={() => handleDirectionChange("UP")}
                  disabled={!gameStarted || gameOver || isPaused}
                  className="w-16 h-16 bg-gray-700 hover:bg-gray-600 active:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg flex items-center justify-center text-white text-2xl font-bold transition"
                >
                  ▲
                </button>
                
                {/* Left, Down, Right Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDirectionChange("LEFT")}
                    disabled={!gameStarted || gameOver || isPaused}
                    className="w-16 h-16 bg-gray-700 hover:bg-gray-600 active:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg flex items-center justify-center text-white text-2xl font-bold transition"
                  >
                    ◀
                  </button>
                  <button
                    onClick={() => handleDirectionChange("DOWN")}
                    disabled={!gameStarted || gameOver || isPaused}
                    className="w-16 h-16 bg-gray-700 hover:bg-gray-600 active:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg flex items-center justify-center text-white text-2xl font-bold transition"
                  >
                    ▼
                  </button>
                  <button
                    onClick={() => handleDirectionChange("RIGHT")}
                    disabled={!gameStarted || gameOver || isPaused}
                    className="w-16 h-16 bg-gray-700 hover:bg-gray-600 active:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg flex items-center justify-center text-white text-2xl font-bold transition"
                  >
                    ▶
                  </button>
                </div>

                {/* Pause Button (Mobile) */}
                <button
                  onClick={togglePause}
                  disabled={!gameStarted || gameOver}
                  className="mt-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white font-semibold transition"
                >
                  {isPaused ? "▶ Resume" : "⏸ Pause"}
                </button>
              </div>
            </div>

            {/* Controls Info */}
            <div className="mt-6 text-center hidden md:block">
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-300">
                <div className="bg-black/40 p-3 rounded-lg">
                  <span className="font-semibold text-white">Move:</span> Arrow Keys / WASD
                </div>
                <div className="bg-black/40 p-3 rounded-lg">
                  <span className="font-semibold text-white">Pause:</span> Space / P
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}