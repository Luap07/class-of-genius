import React from "react";
import {
  BookOpen,
  Clock3,
  Layers3,
  GraduationCap,
} from "lucide-react";
import { motion } from "framer-motion";

export default function LessonHeader({
  lesson,
}) {
  return (
    <motion.header
      initial={{
        opacity: 0,
        y: 30,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.5,
      }}
      className="
        relative
        overflow-hidden
        rounded-[32px]
        border
        border-cyan-500/20
        bg-gradient-to-br
        from-cyan-500/15
        via-slate-900
        to-slate-950
        p-10
      "
    >
      {/* Background Glow */}

      <div
        className="
          absolute
          -right-32
          -top-32
          h-80
          w-80
          rounded-full
          bg-cyan-500/10
          blur-3xl
        "
      />

      <div className="relative">

        <div
          className="
            inline-flex
            items-center
            gap-3
            rounded-full
            bg-cyan-500/15
            px-5
            py-2
            text-cyan-300
            font-semibold
          "
        >
          <BookOpen size={18} />

          Grammar Lesson
        </div>

        <h1
          className="
            mt-6
            text-5xl
            font-black
            leading-tight
          "
        >
          {lesson.title}
        </h1>

        {lesson.description && (
          <p
            className="
              mt-6
              max-w-3xl
              text-lg
              leading-8
              text-slate-300
            "
          >
            {lesson.description}
          </p>
        )}

        <div
          className="
            mt-10
            flex
            flex-wrap
            gap-4
          "
        >

          {lesson.level && (
            <div
              className="
                flex
                items-center
                gap-2
                rounded-2xl
                border
                border-blue-500/20
                bg-blue-500/10
                px-5
                py-3
              "
            >
              <GraduationCap
                size={20}
                className="text-blue-400"
              />

              <div>

                <p className="text-xs text-slate-400">
                  Level
                </p>

                <p className="font-bold">
                  {lesson.level}
                </p>

              </div>
            </div>
          )}

          {lesson.chapter && (
            <div
              className="
                flex
                items-center
                gap-2
                rounded-2xl
                border
                border-purple-500/20
                bg-purple-500/10
                px-5
                py-3
              "
            >
              <Layers3
                size={20}
                className="text-purple-400"
              />

              <div>

                <p className="text-xs text-slate-400">
                  Chapter
                </p>

                <p className="font-bold">
                  {lesson.chapter}
                </p>

              </div>
            </div>
          )}

          {lesson.estimated_time && (
            <div
              className="
                flex
                items-center
                gap-2
                rounded-2xl
                border
                border-green-500/20
                bg-green-500/10
                px-5
                py-3
              "
            >
              <Clock3
                size={20}
                className="text-green-400"
              />

              <div>

                <p className="text-xs text-slate-400">
                  Reading Time
                </p>

                <p className="font-bold">
                  {lesson.estimated_time}
                </p>

              </div>
            </div>
          )}

        </div>

      </div>
    </motion.header>
  );
}