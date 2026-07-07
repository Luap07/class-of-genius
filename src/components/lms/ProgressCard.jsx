import React from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  BookOpen,
  CheckCircle2,
  Clock3,
  Target,
} from "lucide-react";

const ProgressCard = ({
  progress = {},
}) => {
  const {
    course = "Untitled Course",
    subject = "General",
    completion = 0,
    completedLessons = 0,
    totalLessons = 0,
    studyHours = 0,
    target = "Complete Course",
  } = progress;

  const percentage = Math.min(
    Math.max(Number(completion) || 0, 0),
    100
  );

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.25 }}
      className="
        rounded-3xl
        border
        border-slate-800
        bg-slate-900
        p-6
      "
    >
      {/* Header */}

      <div className="flex justify-between items-start">

        <div>

          <p className="text-blue-400 text-sm font-semibold">
            {subject}
          </p>

          <h2 className="text-2xl font-bold mt-2">
            {course}
          </h2>

        </div>

        <TrendingUp
          size={30}
          className="text-blue-400"
        />

      </div>

      {/* Progress */}

      <div className="mt-8">

        <div className="flex justify-between mb-3">

          <span className="text-slate-400">
            Progress
          </span>

          <span className="font-bold text-blue-400">
            {percentage}%
          </span>

        </div>

        <div className="h-3 rounded-full bg-slate-800 overflow-hidden">

          <motion.div
            initial={{ width: 0 }}
            animate={{
              width: `${percentage}%`,
            }}
            transition={{
              duration: 0.8,
            }}
            className="
              h-full
              bg-gradient-to-r
              from-blue-500
              via-cyan-400
              to-emerald-400
            "
          />

        </div>

      </div>

      {/* Stats */}

      <div className="grid grid-cols-2 gap-4 mt-8">

        <div className="rounded-2xl bg-slate-950 border border-slate-800 p-4">

          <BookOpen
            className="text-blue-400 mb-3"
            size={22}
          />

          <p className="text-sm text-slate-400">
            Lessons
          </p>

          <h3 className="text-xl font-bold mt-1">
            {completedLessons}/{totalLessons}
          </h3>

        </div>

        <div className="rounded-2xl bg-slate-950 border border-slate-800 p-4">

          <Clock3
            className="text-cyan-400 mb-3"
            size={22}
          />

          <p className="text-sm text-slate-400">
            Study Hours
          </p>

          <h3 className="text-xl font-bold mt-1">
            {studyHours} hrs
          </h3>

        </div>

      </div>

      {/* Goal */}

      <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950 p-4 flex items-center gap-3">

        <Target
          className="text-emerald-400"
          size={22}
        />

        <div>

          <p className="text-sm text-slate-400">
            Current Goal
          </p>

          <p className="font-semibold">
            {target}
          </p>

        </div>

      </div>

      {/* Footer */}

      <div className="mt-6 flex items-center justify-between">

        <div className="flex items-center gap-2 text-emerald-400">

          <CheckCircle2 size={18} />

          <span className="text-sm">
            Keep Going!
          </span>

        </div>

        <button
          className="
            rounded-xl
            bg-blue-600
            hover:bg-blue-700
            transition
            px-5
            py-2.5
            font-semibold
          "
        >
          Continue
        </button>

      </div>

    </motion.div>
  );
};

export default ProgressCard;