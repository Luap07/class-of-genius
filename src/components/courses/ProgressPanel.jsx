import React from "react";
import { motion } from "framer-motion";
import {
  Trophy,
  CheckCircle2,
  BookOpen,
} from "lucide-react";

const ProgressPanel = ({
  progress = 0,
  completedModules = 0,
  totalModules = 0,
  onComplete,
}) => {
  const finished =
    totalModules > 0 &&
    completedModules >= totalModules;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="
        rounded-3xl
        border
        border-slate-800
        bg-slate-900
        p-6
      "
    >
      <div className="flex items-center gap-3">

        <Trophy
          size={28}
          className="text-amber-400"
        />

        <div>

          <h2 className="text-2xl font-bold">
            Course Progress
          </h2>

          <p className="text-slate-400">
            Keep learning until you reach 100%.
          </p>

        </div>

      </div>

      {/* Progress Bar */}

      <div className="mt-8">

        <div className="flex justify-between mb-2">

          <span className="text-slate-400">
            Overall Progress
          </span>

          <span className="font-bold text-blue-400">
            {progress}%
          </span>

        </div>

        <div className="h-3 rounded-full bg-slate-800 overflow-hidden">

          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8 }}
            className="
              h-full
              rounded-full
              bg-gradient-to-r
              from-blue-500
              to-cyan-400
            "
          />

        </div>

      </div>

      {/* Statistics */}

      <div className="grid grid-cols-2 gap-4 mt-8">

        <div className="rounded-2xl bg-slate-800 p-4">

          <BookOpen
            size={22}
            className="text-blue-400"
          />

          <p className="text-slate-400 mt-3">
            Modules
          </p>

          <h3 className="text-2xl font-bold mt-1">
            {completedModules}/{totalModules}
          </h3>

        </div>

        <div className="rounded-2xl bg-slate-800 p-4">

          <CheckCircle2
            size={22}
            className="text-emerald-400"
          />

          <p className="text-slate-400 mt-3">
            Completed
          </p>

          <h3 className="text-2xl font-bold mt-1">
            {progress}%
          </h3>

        </div>

      </div>

      {/* Action */}

      <button
        onClick={onComplete}
        className="
          w-full
          mt-8
          rounded-2xl
          bg-blue-600
          hover:bg-blue-700
          transition
          py-4
          font-semibold
        "
      >
        Mark Current Module Complete
      </button>

      {finished && (

        <div
          className="
            mt-6
            rounded-2xl
            border
            border-emerald-500/30
            bg-emerald-500/10
            p-5
          "
        >

          <h3 className="font-bold text-emerald-400">
            🎉 Congratulations!
          </h3>

          <p className="mt-2 text-slate-300">
            You've completed every module in this course.
            Your certificate is now available.
          </p>

        </div>

      )}

    </motion.div>
  );
};

export default ProgressPanel;