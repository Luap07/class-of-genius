import React from "react";
import {
  BookOpen,
  Clock3,
  CheckCircle2,
  TrendingUp,
  Award,
} from "lucide-react";
import { motion } from "framer-motion";

const ProgressCard = ({
  title,
  instructor,
  progress = 0,
  lessonsCompleted = 0,
  totalLessons = 0,
  hoursSpent = 0,
  certificate = false,
  color = "from-blue-600 to-cyan-500",
}) => {
  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ duration: 0.25 }}
      className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden hover:border-blue-500"
    >
      {/* Header */}
      <div
        className={`bg-gradient-to-r ${color} p-6`}
      >
        <BookOpen size={42} />

        <h2 className="text-2xl font-bold mt-4">
          {title}
        </h2>

        <p className="text-white/80 mt-2">
          {instructor}
        </p>
      </div>

      {/* Body */}
      <div className="p-6">

        <div className="flex justify-between mb-3">

          <span className="text-slate-400">
            Overall Progress
          </span>

          <span className="font-bold text-lg">
            {progress}%
          </span>

        </div>

        <div className="h-3 rounded-full bg-slate-800 overflow-hidden">

          <div
            className="h-full bg-gradient-to-r from-blue-500 to-cyan-400"
            style={{
              width: `${progress}%`,
            }}
          />

        </div>

        {/* Stats */}

        <div className="grid grid-cols-2 gap-5 mt-8">

          <div className="flex items-center gap-3">

            <CheckCircle2 className="text-emerald-400" />

            <div>

              <p className="text-slate-500 text-sm">
                Lessons
              </p>

              <p>
                {lessonsCompleted}/{totalLessons}
              </p>

            </div>

          </div>

          <div className="flex items-center gap-3">

            <Clock3 className="text-cyan-400" />

            <div>

              <p className="text-slate-500 text-sm">
                Hours
              </p>

              <p>
                {hoursSpent}
              </p>

            </div>

          </div>

        </div>

        {/* Completion */}

        <div className="mt-8 flex justify-between items-center">

          <div className="flex items-center gap-2">

            <TrendingUp className="text-blue-400" />

            <span>
              Learning Progress
            </span>

          </div>

          {certificate ? (
            <div className="flex items-center gap-2 text-emerald-400">

              <Award size={18} />

              Certificate Earned

            </div>
          ) : (
            <div className="text-slate-500">

              Certificate Locked

            </div>
          )}

        </div>

      </div>

    </motion.div>
  );
};

export default ProgressCard;