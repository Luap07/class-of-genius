import React from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  CheckCircle2,
  Clock3,
  Brain,
  ArrowRight,
  Star,
} from "lucide-react";

const GrammarCard = ({
  topic,
  onClick,
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
      onClick={onClick}
      className="group cursor-pointer overflow-hidden rounded-3xl border border-white/10 bg-slate-900"
    >
      {/* Header */}

      <div className="relative bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 p-6">

        <div className="flex items-center justify-between">

          <div className="rounded-2xl bg-white/10 p-4">

            <BookOpen
              size={34}
              className="text-white"
            />

          </div>

          <span className="rounded-full bg-black/30 px-4 py-2 text-xs font-bold text-white backdrop-blur">
            {topic?.level || "Beginner"}
          </span>

        </div>

      </div>

      {/* Body */}

      <div className="p-6">

        <h2 className="text-2xl font-black text-white">
          {topic?.title || "Grammar Topic"}
        </h2>

        <p className="mt-4 line-clamp-3 leading-7 text-slate-400">
          {topic?.description ||
            "Learn grammar rules with practical explanations and real-world examples."}
        </p>

        <div className="mt-6 flex flex-wrap gap-3">

          <div className="flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2">

            <Clock3
              size={18}
              className="text-cyan-400"
            />

            <span className="text-sm">
              {topic?.duration || "15 min"}
            </span>

          </div>

          <div className="flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2">

            <Brain
              size={18}
              className="text-purple-400"
            />

            <span className="text-sm">
              {topic?.exercises || 12} Exercises
            </span>

          </div>

        </div>

        <div className="mt-6 rounded-2xl bg-black/20 p-4">

          <div className="mb-3 flex items-center justify-between">

            <span className="text-sm text-slate-400">
              Progress
            </span>

            <span className="text-sm font-bold text-cyan-400">
              {topic?.progress ?? 0}%
            </span>

          </div>

          <div className="h-2 overflow-hidden rounded-full bg-white/10">

            <motion.div
              initial={{
                width: 0,
              }}
              animate={{
                width: `${topic?.progress ?? 0}%`,
              }}
              transition={{
                duration: 0.8,
              }}
              className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500"
            />

          </div>

        </div>

        <div className="mt-8 flex items-center justify-between">

          <div className="flex items-center gap-2">

            <CheckCircle2
              size={18}
              className="text-green-400"
            />

            <span className="text-sm text-slate-400">
              {topic?.completedLessons ?? 0} Completed
            </span>

          </div>

          <div className="flex items-center gap-1">

            <Star
              size={16}
              className="fill-yellow-400 text-yellow-400"
            />

            <span className="text-sm text-slate-300">
              {topic?.rating || "4.9"}
            </span>

          </div>

        </div>

        <button className="mt-8 flex w-full items-center justify-center gap-3 rounded-2xl bg-cyan-600 py-4 font-bold transition hover:bg-cyan-500">

          Study Topic

          <ArrowRight size={18} />

        </button>

      </div>
    </motion.article>
  );
};

export default GrammarCard;