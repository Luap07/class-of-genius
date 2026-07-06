import React from "react";
import {
  PlayCircle,
  CheckCircle2,
  Clock3,
  Lock,
  FileText,
} from "lucide-react";
import { motion } from "framer-motion";

const LessonCard = ({
  title,
  description,
  duration,
  completed = false,
  locked = false,
  pdf = false,
  onClick,
}) => {
  return (
    <motion.div
      whileHover={!locked ? { y: -4 } : {}}
      whileTap={!locked ? { scale: 0.98 } : {}}
      onClick={!locked ? onClick : undefined}
      className={`rounded-3xl border p-6 transition-all

      ${
        locked
          ? "bg-slate-900/50 border-slate-800 opacity-70 cursor-not-allowed"
          : "bg-slate-900 border-slate-800 hover:border-blue-500 cursor-pointer"
      }`}
    >
      <div className="flex justify-between items-start">

        <div className="flex gap-4">

          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center

            ${
              completed
                ? "bg-emerald-600"
                : locked
                ? "bg-slate-800"
                : "bg-blue-600"
            }`}
          >
            {locked ? (
              <Lock size={24} />
            ) : completed ? (
              <CheckCircle2 size={24} />
            ) : (
              <PlayCircle size={24} />
            )}
          </div>

          <div>

            <h2 className="text-xl font-bold">
              {title}
            </h2>

            <p className="mt-2 text-slate-400">
              {description}
            </p>

          </div>

        </div>

      </div>

      <div className="flex flex-wrap gap-5 mt-6 text-sm text-slate-400">

        <div className="flex items-center gap-2">
          <Clock3 size={16} />
          {duration}
        </div>

        {pdf && (
          <div className="flex items-center gap-2">
            <FileText size={16} />
            PDF Notes
          </div>
        )}

        {completed && (
          <span className="text-emerald-400 font-medium">
            Completed
          </span>
        )}

        {locked && (
          <span className="text-orange-400 font-medium">
            Locked
          </span>
        )}

      </div>

      {!locked && (
        <button
          className="mt-6 w-full rounded-2xl bg-blue-600 hover:bg-blue-700 transition py-3 font-semibold"
        >
          Open Lesson
        </button>
      )}
    </motion.div>
  );
};

export default LessonCard;