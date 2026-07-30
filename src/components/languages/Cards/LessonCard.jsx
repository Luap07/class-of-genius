import React from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  Clock3,
  PlayCircle,
  CheckCircle2,
  Lock,
  Star,
} from "lucide-react";

const LessonCard = ({
  lesson,
  onClick,
}) => {
  const completed = lesson?.completed ?? false;
  const locked = lesson?.locked ?? false;

  return (
    <motion.div
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
      onClick={!locked ? onClick : undefined}
      className={`group overflow-hidden rounded-3xl border border-white/10 bg-slate-900 ${
        locked ? "cursor-not-allowed opacity-70" : "cursor-pointer"
      }`}
    >
      {/* Thumbnail */}

      <div className="relative h-52 overflow-hidden">

        {lesson?.image ? (
          <img
            src={lesson.image}
            alt={lesson.title}
            className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-blue-600 to-cyan-700">
            <BookOpen
              size={80}
              className="text-white"
            />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

        <div className="absolute left-4 top-4 flex gap-2">

          <span className="rounded-full bg-cyan-600 px-4 py-2 text-xs font-bold">
            {lesson?.level || "Beginner"}
          </span>

          {completed && (
            <span className="rounded-full bg-green-600 px-4 py-2 text-xs font-bold">
              Completed
            </span>
          )}

        </div>

        {locked && (
          <div className="absolute right-4 top-4 rounded-full bg-red-500 p-3">
            <Lock
              size={18}
            />
          </div>
        )}

      </div>

      {/* Content */}

      <div className="p-6">

        <h2 className="text-2xl font-black text-white">
          {lesson?.title}
        </h2>

        <p className="mt-3 line-clamp-3 leading-7 text-slate-400">
          {lesson?.description}
        </p>

        <div className="mt-6 flex flex-wrap gap-3">

          <div className="flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2">

            <Clock3
              size={18}
              className="text-cyan-400"
            />

            <span className="text-sm">
              {lesson?.duration || "20 min"}
            </span>

          </div>

          <div className="flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2">

            <Star
              size={18}
              className="text-yellow-400"
            />

            <span className="text-sm">
              {lesson?.xp || 50} XP
            </span>

          </div>

        </div>

        <button
          disabled={locked}
          className={`mt-8 flex w-full items-center justify-center gap-3 rounded-2xl py-4 font-black transition ${
            locked
              ? "bg-slate-700 text-slate-400"
              : completed
              ? "bg-green-600 hover:bg-green-500"
              : "bg-cyan-600 hover:bg-cyan-500"
          }`}
        >
          {locked ? (
            <>
              <Lock size={18} />
              Locked
            </>
          ) : completed ? (
            <>
              <CheckCircle2 size={18} />
              Review Lesson
            </>
          ) : (
            <>
              <PlayCircle size={18} />
              Start Lesson
            </>
          )}
        </button>

      </div>
    </motion.div>
  );
};

export default LessonCard;