import React from "react";
import { motion } from "framer-motion";
import {
  Gamepad2,
  Trophy,
  Star,
  Users,
  Clock3,
  Zap,
  Play,
  ArrowRight,
} from "lucide-react";

const GameCard = ({
  game,
  onPlay,
}) => {
  return (
    <motion.article
      whileHover={{
        y: -8,
        scale: 1.02,
      }}
      whileTap={{
        scale: 0.98,
      }}
      transition={{
        duration: 0.25,
      }}
      className="group overflow-hidden rounded-3xl border border-white/10 bg-slate-900"
    >
      {/* Cover */}

      <div className="relative h-56 overflow-hidden">

        {game?.image ? (
          <img
            src={game.image}
            alt={game.title}
            className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-violet-700 via-fuchsia-700 to-pink-700">
            <Gamepad2
              size={90}
              className="text-white"
            />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

        <div className="absolute left-4 top-4 rounded-full bg-black/40 px-4 py-2 text-xs font-bold backdrop-blur">
          {game?.category || "Vocabulary"}
        </div>

        <div className="absolute right-4 top-4 rounded-full bg-yellow-500 px-4 py-2 text-xs font-bold text-black">
          {game?.difficulty || "Easy"}
        </div>

      </div>

      {/* Content */}

      <div className="p-6">

        <h2 className="text-2xl font-black text-white">
          {game?.title || "Language Game"}
        </h2>

        <p className="mt-4 line-clamp-3 leading-7 text-slate-400">
          {game?.description ||
            "Practice your language skills through fun, interactive games designed to improve vocabulary, grammar, and speed."}
        </p>

        <div className="mt-6 grid grid-cols-2 gap-4">

          <div className="rounded-2xl bg-white/5 p-4">

            <div className="flex items-center gap-2">

              <Clock3
                size={18}
                className="text-cyan-400"
              />

              <span className="text-sm text-slate-300">
                Duration
              </span>

            </div>

            <p className="mt-2 font-bold text-white">
              {game?.duration || "10 mins"}
            </p>

          </div>

          <div className="rounded-2xl bg-white/5 p-4">

            <div className="flex items-center gap-2">

              <Zap
                size={18}
                className="text-yellow-400"
              />

              <span className="text-sm text-slate-300">
                XP Reward
              </span>

            </div>

            <p className="mt-2 font-bold text-white">
              {game?.xp || 100} XP
            </p>

          </div>

        </div>

        <div className="mt-6 flex items-center justify-between">

          <div className="flex items-center gap-2">

            <Users
              size={18}
              className="text-blue-400"
            />

            <span className="text-sm text-slate-400">
              {game?.players || "2.5K"} Players
            </span>

          </div>

          <div className="flex items-center gap-1">

            <Star
              size={16}
              className="fill-yellow-400 text-yellow-400"
            />

            <span className="text-sm text-slate-300">
              {game?.rating || "4.8"}
            </span>

          </div>

        </div>

        <div className="mt-6 rounded-2xl bg-black/20 p-4">

          <div className="mb-3 flex items-center justify-between">

            <span className="text-sm text-slate-400">
              Best Score
            </span>

            <div className="flex items-center gap-2">

              <Trophy
                size={18}
                className="text-yellow-400"
              />

              <span className="font-bold text-white">
                {game?.bestScore || "980"}
              </span>

            </div>

          </div>

        </div>

        <button
          onClick={onPlay}
          className="mt-8 flex w-full items-center justify-center gap-3 rounded-2xl bg-violet-600 py-4 font-bold transition hover:bg-violet-500"
        >
          <Play size={18} />

          Play Game

          <ArrowRight size={18} />
        </button>

      </div>
    </motion.article>
  );
};

export default GameCard;