import React from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  Sparkles,
  GraduationCap,
  ArrowRight,
} from "lucide-react";

export default function GrammarEmpty() {
  return (
    <motion.section
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
        border-white/10
        bg-gradient-to-br
        from-slate-900
        via-slate-950
        to-black
        p-12
        text-center
      "
    >
      {/* Background Glow */}

      <div
        className="
          absolute
          -top-32
          -right-32
          h-72
          w-72
          rounded-full
          bg-cyan-500/10
          blur-3xl
        "
      />

      <div
        className="
          absolute
          -bottom-24
          -left-24
          h-64
          w-64
          rounded-full
          bg-blue-500/10
          blur-3xl
        "
      />

      <div className="relative z-10 mx-auto max-w-3xl">
        <div
          className="
            mx-auto
            flex
            h-24
            w-24
            items-center
            justify-center
            rounded-full
            bg-cyan-500/15
            ring-8
            ring-cyan-500/5
          "
        >
          <BookOpen
            size={46}
            className="text-cyan-400"
          />
        </div>

        <h2
          className="
            mt-8
            text-4xl
            font-black
            text-white
          "
        >
          No Grammar Lessons Yet
        </h2>

        <p
          className="
            mx-auto
            mt-5
            max-w-2xl
            text-lg
            leading-8
            text-slate-400
          "
        >
          This language doesn't have any grammar lessons yet.
          Once lessons are published from the Language CMS,
          they'll automatically appear here with explanations,
          grammar rules, examples and learning notes.
        </p>

        <div
          className="
            mt-10
            grid
            gap-5
            md:grid-cols-3
          "
        >
          <div
            className="
              rounded-2xl
              border
              border-white/10
              bg-white/5
              p-6
            "
          >
            <GraduationCap
              className="mx-auto text-cyan-400"
              size={34}
            />

            <h3 className="mt-4 text-lg font-bold text-white">
              Grammar Lessons
            </h3>

            <p className="mt-2 text-sm leading-7 text-slate-400">
              Structured lessons for every level.
            </p>
          </div>

          <div
            className="
              rounded-2xl
              border
              border-white/10
              bg-white/5
              p-6
            "
          >
            <BookOpen
              className="mx-auto text-blue-400"
              size={34}
            />

            <h3 className="mt-4 text-lg font-bold text-white">
              Examples
            </h3>

            <p className="mt-2 text-sm leading-7 text-slate-400">
              Real-life examples to make learning easier.
            </p>
          </div>

          <div
            className="
              rounded-2xl
              border
              border-white/10
              bg-white/5
              p-6
            "
          >
            <Sparkles
              className="mx-auto text-yellow-400"
              size={34}
            />

            <h3 className="mt-4 text-lg font-bold text-white">
              AI Learning
            </h3>

            <p className="mt-2 text-sm leading-7 text-slate-400">
              Interactive explanations and practice coming soon.
            </p>
          </div>
        </div>

        <button
          className="
            mt-12
            inline-flex
            items-center
            gap-3
            rounded-2xl
            bg-cyan-600
            px-8
            py-4
            font-bold
            text-white
            transition
            hover:bg-cyan-500
          "
        >
          Explore Other Languages

          <ArrowRight size={20} />
        </button>
      </div>
    </motion.section>
  );
}