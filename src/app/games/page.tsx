"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const games = [
  {
    id: "snake",
    name: "Snake",
    emoji: "🐍",
    description: "Classic snake game - Eat, grow, don't hit yourself!",
    color: "from-green-400 to-green-600",
    available: true,
  },
  {
    id: "tetris",
    name: "Tetris",
    emoji: "🧱",
    description: "Stack blocks and clear lines!",
    color: "from-blue-400 to-blue-600",
    available: true,
  },
  {
    id: "chess",
    name: "Chess",
    emoji: "♟️",
    description: "Strategic board game - Coming soon!",
    color: "from-purple-400 to-purple-600",
    available: true,
  },
];

export default function GamesPage() {
  return (
    <div className="p-8 relative z-10 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Back Button */}
        <Link href="/">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mb-6 px-4 py-2 bg-pink-600 hover:bg-pink-700 rounded-lg text-white font-semibold transition flex items-center gap-2"
          >
            ⬅️ Back to Projects
          </motion.button>
        </Link>

        {/* Title */}
        <h1
          className="text-4xl font-bold text-white drop-shadow-[0_0_6px_rgba(0,0,0,0.6)] mb-2"
          style={{
            WebkitTextStroke: "0.6px rgba(0,0,0,0.25)",
          }}
        >
          🎮 Classic Games
        </h1>
        <p className="text-white drop-shadow-[0_0_4px_rgba(0,0,0,0.8)] mb-8 font-semibold">
          Play classic arcade games - More coming soon!
        </p>

        {/* Games Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map((game) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              whileHover={game.available ? { scale: 1.03 } : {}}
              className="relative"
            >
              {/* Neon Border */}
              <div className="absolute inset-0 rounded-xl p-[2px] bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 animate-border-glow">
                <div className="h-full w-full rounded-xl bg-black/90"></div>
              </div>

              {/* Card Content */}
              <div className="relative z-10 p-6">
                {game.available ? (
                  <Link href={`/games/${game.id}`}>
                    <div className="cursor-pointer">
                      <div
                        className={`text-6xl mb-4 text-center bg-gradient-to-br ${game.color} w-20 h-20 rounded-2xl flex items-center justify-center mx-auto`}
                      >
                        {game.emoji}
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-2 text-center">
                        {game.name}
                      </h3>
                      <p className="text-gray-400 text-sm text-center mb-4">
                        {game.description}
                      </p>
                      <div className="flex justify-center">
                        <span className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white font-semibold transition">
                          Play Now
                        </span>
                      </div>
                    </div>
                  </Link>
                ) : (
                  <div className="opacity-50 cursor-not-allowed">
                    <div
                      className={`text-6xl mb-4 text-center bg-gradient-to-br ${game.color} w-20 h-20 rounded-2xl flex items-center justify-center mx-auto`}
                    >
                      {game.emoji}
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2 text-center">
                      {game.name}
                    </h3>
                    <p className="text-gray-400 text-sm text-center mb-4">
                      {game.description}
                    </p>
                    <div className="flex justify-center">
                      <span className="px-4 py-2 bg-gray-700 rounded-lg text-gray-400 font-semibold">
                        Coming Soon
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}