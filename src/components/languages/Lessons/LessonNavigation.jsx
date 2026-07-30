import React from "react";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Home,
  List,
  CheckCircle2,
  BookOpen,
  RotateCcw,
} from "lucide-react";

const LessonNavigation = ({
  currentLesson = 1,
  totalLessons = 1,
  previousLesson = null,
  nextLesson = null,
  lessonTitle = "",
  canGoPrevious = true,
  canGoNext = true,
  completed = false,
  showOverview = true,
  onPrevious,
  onNext,
  onOverview,
  onRestart,
  onComplete,
}) => {
  const progress =
    totalLessons > 0
      ? Math.round((currentLesson / totalLessons) * 100)
      : 0;

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

      <div className="bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-700 p-6">

        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

          <div>

            <div className="flex items-center gap-3">

              <BookOpen
                size={28}
                className="text-white"
              />

              <h2 className="text-3xl font-black text-white">
                Lesson Navigation
              </h2>

            </div>

            <p className="mt-2 text-cyan-100">
              {lessonTitle || "Current Lesson"}
            </p>

          </div>

          <div className="rounded-2xl bg-white/10 px-5 py-4">

            <p className="text-sm text-cyan-100">
              Lesson
            </p>

            <h3 className="text-2xl font-black text-white">
              {currentLesson} / {totalLessons}
            </h3>

          </div>

        </div>

      </div>

      {/* Progress */}

      <div className="border-b border-white/10 p-6">

        <div className="mb-3 flex items-center justify-between">

          <span className="text-sm text-slate-400">
            Course Progress
          </span>

          <span className="font-bold text-cyan-300">
            {progress}%
          </span>

        </div>

        <div className="h-3 overflow-hidden rounded-full bg-white/10">

          <motion.div
            initial={{
              width: 0,
            }}
            animate={{
              width: `${progress}%`,
            }}
            transition={{
              duration: 0.7,
            }}
            className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-green-500"
          />

        </div>

      </div>

      {/* Previous / Next */}

      <div className="grid gap-5 p-6 lg:grid-cols-2">

        <button
          disabled={!canGoPrevious}
          onClick={onPrevious}
          className="rounded-2xl border border-white/10 bg-black/20 p-5 text-left transition hover:border-cyan-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <div className="flex items-center gap-3">

            <ChevronLeft
              className="text-cyan-400"
            />

            <div>

              <p className="text-sm text-slate-500">
                Previous Lesson
              </p>

              <h3 className="font-bold text-white">
                {previousLesson ||
                  "Beginning of Course"}
              </h3>

            </div>

          </div>

        </button>

        <button
          disabled={!canGoNext}
          onClick={onNext}
          className="rounded-2xl border border-white/10 bg-black/20 p-5 text-right transition hover:border-cyan-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <div className="flex items-center justify-end gap-3">

            <div>

              <p className="text-sm text-slate-500">
                Next Lesson
              </p>

              <h3 className="font-bold text-white">
                {nextLesson ||
                  "End of Course"}
              </h3>

            </div>

            <ChevronRight
              className="text-cyan-400"
            />

          </div>

        </button>

      </div>

      {/* Quick Actions */}

      <div className="grid gap-4 border-t border-white/10 p-6 md:grid-cols-2 xl:grid-cols-4">

        {showOverview && (
          <button
            onClick={onOverview}
            className="flex items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 transition hover:bg-white/10"
          >
            <List size={20} />
            Lesson List
          </button>
        )}

        <button
          onClick={onRestart}
          className="flex items-center justify-center gap-3 rounded-2xl border border-yellow-500/20 bg-yellow-500/10 px-5 py-4 text-yellow-300 transition hover:bg-yellow-500/20"
        >
          <RotateCcw size={20} />
          Restart Lesson
        </button>

        <button
          onClick={onComplete}
          disabled={completed}
          className="flex items-center justify-center gap-3 rounded-2xl bg-green-600 px-5 py-4 font-bold transition hover:bg-green-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <CheckCircle2 size={20} />
          {completed
            ? "Completed"
            : "Mark Complete"}
        </button>

        <button
          onClick={onOverview}
          className="flex items-center justify-center gap-3 rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-5 py-4 text-cyan-300 transition hover:bg-cyan-500/20"
        >
          <Home size={20} />
          Dashboard
        </button>

      </div>

    </motion.section>
  );
};

export default LessonNavigation;