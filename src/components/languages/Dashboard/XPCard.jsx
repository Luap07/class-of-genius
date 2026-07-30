import React, { useMemo } from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  Zap,
  Trophy,
  TrendingUp,
} from "lucide-react";

const XPCard = ({
  xp = 0,
  level = 1,
  nextLevelXP = 1000,
  title = "Experience Points",
  description = "Earn XP by completing lessons and challenges.",
}) => {
  const progress = useMemo(() => {
    if (!nextLevelXP) return 0;

    return Math.min(
      100,
      Math.round((xp / nextLevelXP) * 100)
    );
  }, [xp, nextLevelXP]);

  const remaining = Math.max(
    nextLevelXP - xp,
    0
  );

  return (
    <motion.section
      initial={{
        opacity: 0,
        y: 20,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900"
    >
      {/* Header */}

      <div className="bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 p-6">

        <div className="flex items-center gap-4">

          <div className="rounded-2xl bg-white/20 p-4">

            <Sparkles
              size={30}
              className="text-white"
            />

          </div>

          <div>

            <h2 className="text-2xl font-black text-white">
              {title}
            </h2>

            <p className="text-orange-100">
              {description}
            </p>

          </div>

        </div>

      </div>

      {/* Main */}

      <div className="space-y-8 p-8">

        <div className="text-center">

          <p className="text-sm uppercase tracking-widest text-yellow-400">
            Total XP
          </p>

          <h1 className="mt-3 text-6xl font-black text-white">
            {xp}
          </h1>

        </div>


        {/* Level */}

        <div className="flex items-center justify-between rounded-2xl bg-black/20 p-5">

          <div className="flex items-center gap-3">

            <Trophy
              size={28}
              className="text-yellow-400"
            />

            <div>

              <p className="text-sm text-slate-400">
                Current Level
              </p>

              <h3 className="text-2xl font-black text-white">
                {level}
              </h3>

            </div>

          </div>

          <Zap
            size={28}
            className="text-orange-400"
          />

        </div>


        {/* Progress */}

        <div>

          <div className="mb-3 flex justify-between">

            <span className="font-semibold text-white">
              Level Progress
            </span>

            <span className="text-yellow-300">
              {progress}%
            </span>

          </div>


          <div className="h-4 overflow-hidden rounded-full bg-white/10">

            <motion.div
              initial={{
                width: 0,
              }}
              animate={{
                width: `${progress}%`,
              }}
              transition={{
                duration: 1,
              }}
              className="h-full rounded-full bg-gradient-to-r from-yellow-400 to-orange-500"
            />

          </div>


          <p className="mt-3 text-sm text-slate-400">
            {remaining > 0
              ? `${remaining} XP remaining to next level`
              : "You reached the next level!"}
          </p>

        </div>


        {/* Bonus */}

        <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-5">

          <div className="flex items-center gap-3">

            <TrendingUp
              size={24}
              className="text-yellow-400"
            />

            <p className="text-slate-300">
              Complete lessons, practice vocabulary,
              and win games to earn more XP.
            </p>

          </div>

        </div>

      </div>

    </motion.section>
  );
};

export default XPCard;