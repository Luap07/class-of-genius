import React from "react";
import { motion } from "framer-motion";
import {
  Trophy,
  Flame,
  Clock3,
  Target,
  Star,
  Users,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

const ChallengeCard = ({
  challenge,
  onStart,
}) => {
  const completed = challenge?.completed ?? false;

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
      {/* Header */}

      <div className="relative h-52 overflow-hidden">

        {challenge?.image ? (
          <img
            src={challenge.image}
            alt={challenge.title}
            className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-orange-600 via-red-600 to-pink-600">
            <Trophy
              size={90}
              className="text-white"
            />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

        <div className="absolute left-4 top-4 rounded-full bg-black/40 px-4 py-2 text-xs font-bold backdrop-blur">
          {challenge?.difficulty || "Intermediate"}
        </div>

        {completed && (
          <div className="absolute right-4 top-4 rounded-full bg-green-600 px-4 py-2 text-xs font-bold">
            Completed
          </div>
        )}

      </div>

      {/* Content */}

      <div className="p-6">

        <h2 className="text-2xl font-black text-white">
          {challenge?.title || "Language Challenge"}
        </h2>

        <p className="mt-4 line-clamp-3 leading-7 text-slate-400">
          {challenge?.description ||
            "Complete exciting language challenges to improve your speaking, listening, vocabulary and grammar skills."}
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
              {challenge?.duration || "30 mins"}
            </p>

          </div>

          <div className="rounded-2xl bg-white/5 p-4">

            <div className="flex items-center gap-2">

              <Flame
                size={18}
                className="text-orange-400"
              />

              <span className="text-sm text-slate-300">
                XP Reward
              </span>

            </div>

            <p className="mt-2 font-bold text-white">
              {challenge?.xp || 250} XP
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
              {challenge?.participants || "1.2K"} Learners
            </span>

          </div>

          <div className="flex items-center gap-1">

            <Star
              size={16}
              className="fill-yellow-400 text-yellow-400"
            />

            <span className="text-sm text-slate-300">
              {challenge?.rating || "4.9"}
            </span>

          </div>

        </div>

        <div className="mt-6 rounded-2xl bg-black/20 p-4">

          <div className="mb-3 flex items-center justify-between">

            <span className="text-sm text-slate-400">
              Progress
            </span>

            <span className="text-sm font-bold text-cyan-400">
              {challenge?.progress ?? 0}%
            </span>

          </div>

          <div className="h-2 overflow-hidden rounded-full bg-white/10">

            <motion.div
              initial={{
                width: 0,
              }}
              animate={{
                width: `${challenge?.progress ?? 0}%`,
              }}
              transition={{
                duration: 0.8,
              }}
              className="h-full rounded-full bg-gradient-to-r from-orange-400 to-red-500"
            />

          </div>

        </div>

        <button
          onClick={onStart}
          className={`mt-8 flex w-full items-center justify-center gap-3 rounded-2xl py-4 font-bold transition ${
            completed
              ? "bg-green-600 hover:bg-green-500"
              : "bg-orange-600 hover:bg-orange-500"
          }`}
        >
          {completed ? (
            <>
              <CheckCircle2 size={18} />
              View Results
            </>
          ) : (
            <>
              <Target size={18} />
              Start Challenge
              <ArrowRight size={18} />
            </>
          )}
        </button>

      </div>
    </motion.article>
  );
};

export default ChallengeCard;