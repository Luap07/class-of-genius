import React from "react";
import { BookOpen, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function GrammarHero({
  language,
  totalTopics,
}) {
  return (
    <motion.section
      initial={{
        opacity: 0,
        y: 25,
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
        from-slate-900
        via-slate-950
        to-black
        p-10
        shadow-2xl
        shadow-cyan-500/10
      "
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#06b6d420,transparent_45%)]" />

      <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-3 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-5 py-2">
            <Sparkles
              size={18}
              className="text-cyan-400"
            />

            <span className="text-sm font-semibold tracking-wide text-cyan-300">
              PREMIUM GRAMMAR
            </span>
          </div>

          <h1 className="mt-6 text-5xl font-black leading-tight text-white">
            {language?.name} Grammar
          </h1>

          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
            Master grammar step by step with detailed explanations,
            practical rules, examples, notes, and interactive learning
            content uploaded directly from the Language CMS.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
            <BookOpen
              className="text-cyan-400"
              size={34}
            />

            <h2 className="mt-5 text-4xl font-black text-white">
              {totalTopics}
            </h2>

            <p className="mt-2 text-slate-400">
              Grammar Topics
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
            <Sparkles
              className="text-yellow-400"
              size={34}
            />

            <h2 className="mt-5 text-4xl font-black text-white">
              AI
            </h2>

            <p className="mt-2 text-slate-400">
              Smart Learning
            </p>
          </div>
        </div>
      </div>
    </motion.section>
  );
}