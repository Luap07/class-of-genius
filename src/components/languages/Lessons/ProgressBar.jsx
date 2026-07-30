import React, { useMemo } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  CheckCircle2,
  Target,
  Award,
  Clock,
} from "lucide-react";

const ProgressBar = ({
  progress = 0,
  completedLessons = 0,
  totalLessons = 0,
  xp = 0,
  streak = 0,
  estimatedTime = "",
  showStats = true,
}) => {
  const safeProgress = useMemo(() => {
    return Math.min(Math.max(progress, 0), 100);
  }, [progress]);

  return (
    <motion.section
      initial={{
        opacity: 0,
        y: 15,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900"
    >
      {/* Header */}

      <div className="bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-700 p-6">

        <div className="flex items-center justify-between">

          <div className="flex items-center gap-4">

            <div className="rounded-2xl bg-white/10 p-4">
              <TrendingUp
                size={30}
                className="text-white"
              />
            </div>

            <div>

              <h2 className="text-3xl font-black text-white">
                Course Progress
              </h2>

              <p className="mt-1 text-cyan-100">
                Keep moving toward fluency.
              </p>

            </div>

          </div>

          <div className="text-right">

            <p className="text-4xl font-black text-white">
              {safeProgress}%
            </p>

            <p className="text-cyan-100">
              Completed
            </p>

          </div>

        </div>

      </div>

      {/* Progress */}

      <div className="p-6">

        <div className="h-5 overflow-hidden rounded-full bg-white/10">

          <motion.div
            initial={{
              width: 0,
            }}
            animate={{
              width: `${safeProgress}%`,
            }}
            transition={{
              duration: 0.8,
            }}
            className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-blue-500 to-green-500"
          />

        </div>

        <div className="mt-3 flex justify-between text-sm text-slate-400">

          <span>0%</span>

          <span>50%</span>

          <span>100%</span>

        </div>

      </div>

      {/* Stats */}

      {showStats && (
        <div className="grid gap-5 p-6 md:grid-cols-2 xl:grid-cols-4">

          <div className="rounded-2xl border border-white/10 bg-black/20 p-5">

            <CheckCircle2
              className="text-green-400"
              size={28}
            />

            <h3 className="mt-4 text-2xl font-black text-white">
              {completedLessons}
            </h3>

            <p className="mt-2 text-slate-400">
              Completed Lessons
            </p>

            <p className="mt-1 text-xs text-slate-500">
              of {totalLessons} total lessons
            </p>

          </div>

          <div className="rounded-2xl border border-white/10 bg-black/20 p-5">

            <Award
              className="text-yellow-400"
              size={28}
            />

            <h3 className="mt-4 text-2xl font-black text-white">
              {xp}
            </h3>

            <p className="mt-2 text-slate-400">
              Total XP
            </p>

          </div>

          <div className="rounded-2xl border border-white/10 bg-black/20 p-5">

            <Target
              className="text-cyan-400"
              size={28}
            />

            <h3 className="mt-4 text-2xl font-black text-white">
              {streak}
            </h3>

            <p className="mt-2 text-slate-400">
              Day Streak
            </p>

          </div>

          <div className="rounded-2xl border border-white/10 bg-black/20 p-5">

            <Clock
              className="text-purple-400"
              size={28}
            />

            <h3 className="mt-4 text-2xl font-black text-white">
              {estimatedTime || "--"}
            </h3>

            <p className="mt-2 text-slate-400">
              Time Remaining
            </p>

          </div>

        </div>
      )}

    </motion.section>
  );
};

export default ProgressBar;