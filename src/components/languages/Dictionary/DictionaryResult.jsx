import React from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  Volume2,
  Copy,
  Bookmark,
  Languages,
  Tag,
  Quote,
  CheckCircle2,
} from "lucide-react";

const DictionaryResult = ({
  result,
  loading = false,
  onPronounce,
  onCopy,
  onBookmark,
}) => {
  if (loading) {
    return (
      <div className="rounded-3xl border border-white/10 bg-slate-900 p-10 text-center">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent" />
        <p className="mt-6 text-slate-400">
          Searching dictionary...
        </p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="rounded-3xl border border-dashed border-white/10 bg-slate-900 p-12 text-center">

        <BookOpen
          size={60}
          className="mx-auto text-slate-600"
        />

        <h2 className="mt-6 text-2xl font-black text-white">
          No Word Selected
        </h2>

        <p className="mt-3 text-slate-400">
          Search for a word to view its definition,
          pronunciation, examples, synonyms and more.
        </p>

      </div>
    );
  }

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
      className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900"
    >
      {/* Header */}

      <div className="bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-700 p-8">

        <div className="flex flex-wrap items-start justify-between gap-6">

          <div>

            <h1 className="text-5xl font-black text-white">
              {result.word}
            </h1>

            <p className="mt-3 text-xl text-cyan-100">
              {result.phonetic || "/.../"}
            </p>

          </div>

          <div className="flex gap-3">

            <button
              onClick={onPronounce}
              className="rounded-2xl bg-white/10 p-4 transition hover:bg-white/20"
            >
              <Volume2 size={22} />
            </button>

            <button
              onClick={onCopy}
              className="rounded-2xl bg-white/10 p-4 transition hover:bg-white/20"
            >
              <Copy size={22} />
            </button>

            <button
              onClick={onBookmark}
              className="rounded-2xl bg-white/10 p-4 transition hover:bg-white/20"
            >
              <Bookmark size={22} />
            </button>

          </div>

        </div>

      </div>

      {/* Body */}

      <div className="p-8">

        <div className="flex flex-wrap gap-3">

          <div className="flex items-center gap-2 rounded-xl bg-cyan-500/10 px-4 py-2 text-cyan-300">

            <Tag size={18} />

            {result.partOfSpeech || "Noun"}

          </div>

          <div className="flex items-center gap-2 rounded-xl bg-green-500/10 px-4 py-2 text-green-300">

            <Languages size={18} />

            {result.language || "English"}

          </div>

          <div className="flex items-center gap-2 rounded-xl bg-yellow-500/10 px-4 py-2 text-yellow-300">

            <CheckCircle2 size={18} />

            Verified

          </div>

        </div>

        <div className="mt-8">

          <h2 className="text-2xl font-black text-white">
            Definition
          </h2>

          <p className="mt-4 leading-8 text-slate-300">
            {result.definition}
          </p>

        </div>

        {result.example && (

          <div className="mt-8 rounded-3xl border border-white/10 bg-black/20 p-6">

            <div className="flex items-center gap-2 text-cyan-300">

              <Quote size={18} />

              <span className="font-bold">
                Example
              </span>

            </div>

            <p className="mt-4 italic leading-8 text-slate-300">
              "{result.example}"
            </p>

          </div>

        )}

        {result.notes && (

          <div className="mt-8 rounded-3xl border border-blue-500/20 bg-blue-500/5 p-6">

            <h3 className="text-lg font-bold text-cyan-300">
              Notes
            </h3>

            <p className="mt-3 leading-7 text-slate-300">
              {result.notes}
            </p>

          </div>

        )}

      </div>

    </motion.section>
  );
};

export default DictionaryResult;