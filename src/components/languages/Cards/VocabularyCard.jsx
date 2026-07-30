import React from "react";
import { motion } from "framer-motion";
import {
  BookMarked,
  Brain,
  Target,
  Volume2,
  Star,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

const VocabularyCard = ({
  vocabulary,
  onPractice,
  onPronounce,
}) => {
  const mastered = vocabulary?.mastered ?? false;

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
      className="group overflow-hidden rounded-3xl border border-white/10 bg-slate-900"
    >
      {/* Header */}

      <div className="bg-gradient-to-r from-emerald-600 via-green-600 to-cyan-600 p-6">

        <div className="flex items-center justify-between">

          <div className="rounded-2xl bg-white/10 p-4">

            <BookMarked
              size={34}
              className="text-white"
            />

          </div>

          {mastered && (
            <div className="rounded-full bg-green-500 px-4 py-2 text-xs font-bold text-white">
              Mastered
            </div>
          )}

        </div>

      </div>

      {/* Body */}

      <div className="p-6">

        <h2 className="text-3xl font-black text-white">
          {vocabulary?.word || "Vocabulary"}
        </h2>

        <p className="mt-2 text-cyan-300">
          {vocabulary?.meaning || "Word meaning"}
        </p>

        <p className="mt-5 leading-7 text-slate-400">
          {vocabulary?.example ||
            "Example sentence demonstrating how the word is used in context."}
        </p>

        <div className="mt-6 grid grid-cols-2 gap-4">

          <div className="rounded-2xl bg-white/5 p-4">

            <div className="flex items-center gap-2">

              <Brain
                size={18}
                className="text-purple-400"
              />

              <span className="text-sm text-slate-300">
                Difficulty
              </span>

            </div>

            <p className="mt-2 font-bold text-white">
              {vocabulary?.difficulty || "Easy"}
            </p>

          </div>

          <div className="rounded-2xl bg-white/5 p-4">

            <div className="flex items-center gap-2">

              <Target
                size={18}
                className="text-cyan-400"
              />

              <span className="text-sm text-slate-300">
                XP
              </span>

            </div>

            <p className="mt-2 font-bold text-white">
              {vocabulary?.xp || 25}
            </p>

          </div>

        </div>

        <div className="mt-6 flex items-center gap-2">

          {[1, 2, 3, 4, 5].map((item) => (
            <Star
              key={item}
              size={16}
              className="fill-yellow-400 text-yellow-400"
            />
          ))}

          <span className="ml-2 text-sm text-slate-400">
            {vocabulary?.rating || "5.0"}
          </span>

        </div>

        <div className="mt-8 flex gap-3">

          <button
            onClick={onPronounce}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 py-3 font-bold transition hover:bg-white/10"
          >
            <Volume2 size={18} />
            Pronounce
          </button>

          <button
            onClick={onPractice}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-cyan-600 py-3 font-bold transition hover:bg-cyan-500"
          >
            {mastered ? (
              <>
                <CheckCircle2 size={18} />
                Review
              </>
            ) : (
              <>
                Practice
                <ArrowRight size={18} />
              </>
            )}
          </button>

        </div>

      </div>
    </motion.article>
  );
};

export default VocabularyCard;