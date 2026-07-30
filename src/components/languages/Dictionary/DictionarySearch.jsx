import React from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  Volume2,
  Copy,
  Bookmark,
  Star,
  Tag,
  ArrowRight,
  Languages,
} from "lucide-react";

const WordCard = ({
  word,
  onPronounce,
  onCopy,
  onBookmark,
  onView,
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
      className="group overflow-hidden rounded-3xl border border-white/10 bg-slate-900"
    >
      {/* Header */}

      <div className="bg-gradient-to-r from-sky-600 via-cyan-600 to-blue-700 p-6">

        <div className="flex items-center justify-between">

          <div className="rounded-2xl bg-white/10 p-4">
            <BookOpen
              size={34}
              className="text-white"
            />
          </div>

          <span className="rounded-full bg-black/30 px-4 py-2 text-xs font-bold text-white">
            {word?.language || "English"}
          </span>

        </div>

      </div>

      {/* Content */}

      <div className="p-6">

        <h2 className="text-4xl font-black text-white">
          {word?.text || "Hello"}
        </h2>

        <p className="mt-2 text-cyan-300">
          {word?.phonetic || "/həˈləʊ/"}
        </p>

        <div className="mt-6 rounded-2xl bg-black/20 p-5">

          <div className="flex items-center gap-2">

            <Languages
              size={18}
              className="text-cyan-400"
            />

            <span className="text-sm text-slate-400">
              Meaning
            </span>

          </div>

          <p className="mt-3 leading-7 text-slate-300">
            {word?.meaning ||
              "A greeting used when meeting or addressing someone."}
          </p>

        </div>

        {word?.example && (
          <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-5">

            <p className="text-sm font-semibold text-cyan-300">
              Example
            </p>

            <p className="mt-3 italic leading-7 text-slate-300">
              "{word.example}"
            </p>

          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-3">

          <div className="flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2">

            <Tag
              size={18}
              className="text-purple-400"
            />

            <span className="text-sm">
              {word?.partOfSpeech || "Interjection"}
            </span>

          </div>

          <div className="flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2">

            <Star
              size={18}
              className="text-yellow-400"
            />

            <span className="text-sm">
              {word?.level || "Beginner"}
            </span>

          </div>

        </div>

        <div className="mt-8 grid grid-cols-2 gap-3">

          <button
            onClick={onPronounce}
            className="flex items-center justify-center gap-2 rounded-2xl bg-cyan-600 py-3 font-bold transition hover:bg-cyan-500"
          >
            <Volume2 size={18} />
            Listen
          </button>

          <button
            onClick={onCopy}
            className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 py-3 font-bold transition hover:bg-white/10"
          >
            <Copy size={18} />
            Copy
          </button>

          <button
            onClick={onBookmark}
            className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 py-3 font-bold transition hover:bg-white/10"
          >
            <Bookmark size={18} />
            Save
          </button>

          <button
            onClick={onView}
            className="flex items-center justify-center gap-2 rounded-2xl bg-blue-600 py-3 font-bold transition hover:bg-blue-500"
          >
            Details
            <ArrowRight size={18} />
          </button>

        </div>

      </div>
    </motion.article>
  );
};

export default WordCard;