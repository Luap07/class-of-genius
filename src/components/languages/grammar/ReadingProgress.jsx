import React, { useMemo } from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  CheckCircle2,
  Clock3,
  Target,
  TrendingUp,
} from "lucide-react";

export default function ReadingProgress({
  currentPage = 1,
  totalPages = 1,
  completedLessons = 0,
  totalLessons = 0,
  readingTime = 0,
}) {
  const pageProgress = useMemo(() => {
    if (totalPages <= 0) return 0;

    return Math.min(
      100,
      Math.round((currentPage / totalPages) * 100)
    );
  }, [currentPage, totalPages]);

  const lessonProgress = useMemo(() => {
    if (totalLessons <= 0) return 0;

    return Math.min(
      100,
      Math.round(
        (completedLessons / totalLessons) * 100
      )
    );
  }, [completedLessons, totalLessons]);

  return (
    <motion.aside
      initial={{
        opacity: 0,
        x: 30,
      }}
      animate={{
        opacity: 1,
        x: 0,
      }}
      transition={{
        duration: 0.45,
      }}
      className="
        sticky
        top-24
        overflow-hidden
        rounded-[30px]
        border
        border-white/10
        bg-gradient-to-br
        from-slate-900
        via-slate-950
        to-black
        p-7
      "
    >
      {/* Glow */}

      <div
        className="
          absolute
          -top-24
          -right-24
          h-64
          w-64
          rounded-full
          bg-cyan-500/10
          blur-3xl
        "
      />

      <div className="relative">

        <div className="flex items-center gap-3">

          <div
            className="
              flex
              h-12
              w-12
              items-center
              justify-center
              rounded-xl
              bg-cyan-500/15
            "
          >
            <TrendingUp
              className="text-cyan-400"
              size={24}
            />
          </div>

          <div>

            <h2 className="text-2xl font-black text-white">
              Reading Progress
            </h2>

            <p className="text-slate-400 text-sm">
              Track your learning
            </p>

          </div>

        </div>

        {/* Stats */}

        <div className="mt-8 space-y-5">

          <div className="rounded-2xl bg-slate-800/60 p-5">

            <div className="flex items-center justify-between">

              <div className="flex items-center gap-2">

                <BookOpen
                  size={18}
                  className="text-cyan-400"
                />

                <span className="text-slate-300">
                  Pages
                </span>

              </div>

              <span className="font-bold text-white">
                {currentPage}/{totalPages}
              </span>

            </div>

            <div className="mt-4 h-3 rounded-full bg-slate-700">

              <motion.div
                initial={{
                  width: 0,
                }}
                animate={{
                  width: `${pageProgress}%`,
                }}
                transition={{
                  duration: 0.7,
                }}
                className="
                  h-full
                  rounded-full
                  bg-gradient-to-r
                  from-cyan-500
                  to-blue-500
                "
              />

            </div>

          </div>

          <div className="rounded-2xl bg-slate-800/60 p-5">

            <div className="flex items-center justify-between">

              <div className="flex items-center gap-2">

                <CheckCircle2
                  size={18}
                  className="text-green-400"
                />

                <span className="text-slate-300">
                  Lessons
                </span>

              </div>

              <span className="font-bold text-white">
                {completedLessons}/{totalLessons}
              </span>

            </div>

            <div className="mt-4 h-3 rounded-full bg-slate-700">

              <motion.div
                initial={{
                  width: 0,
                }}
                animate={{
                  width: `${lessonProgress}%`,
                }}
                transition={{
                  duration: 0.8,
                }}
                className="
                  h-full
                  rounded-full
                  bg-gradient-to-r
                  from-green-500
                  to-emerald-500
                "
              />

            </div>

          </div>

          <div className="rounded-2xl bg-slate-800/60 p-5">

            <div className="flex items-center gap-3">

              <Clock3
                className="text-yellow-400"
                size={20}
              />

              <div>

                <p className="text-slate-400 text-sm">
                  Reading Time
                </p>

                <h3 className="mt-1 text-2xl font-black text-white">
                  {readingTime} min
                </h3>

              </div>

            </div>

          </div>

          <div className="rounded-2xl bg-cyan-500/10 border border-cyan-500/20 p-5">

            <div className="flex items-center gap-3">

              <Target
                className="text-cyan-400"
                size={22}
              />

              <div>

                <p className="text-sm text-slate-400">
                  Goal
                </p>

                <h3 className="font-black text-white">
                  Finish this lesson today
                </h3>

              </div>

            </div>

          </div>

        </div>

      </div>
    </motion.aside>
  );
}