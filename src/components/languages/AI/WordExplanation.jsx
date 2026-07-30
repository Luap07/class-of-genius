import React from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  Volume2,
  Copy,
  Languages,
  Lightbulb,
  Hash,
  CheckCircle2,
  Sparkles,
  Tag,
} from "lucide-react";

const WordExplanation = ({
  word = "",
  phonetic = "",
  partOfSpeech = "",
  meaning = "",
  translation = "",
  examples = [],
  synonyms = [],
  antonyms = [],
  copied = false,
  onSpeak,
  onCopy,
}) => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900"
    >
      {/* Header */}

      <div className="bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-700 p-6">

        <div className="flex items-center justify-between">

          <div className="flex items-center gap-4">

            <div className="rounded-2xl bg-white/10 p-4">
              <BookOpen
                size={30}
                className="text-white"
              />
            </div>

            <div>

              <h2 className="text-3xl font-black text-white">
                {word || "Word"}
              </h2>

              <div className="mt-2 flex flex-wrap items-center gap-3">

                {phonetic && (
                  <span className="rounded-full bg-white/10 px-3 py-1 text-sm text-cyan-200">
                    {phonetic}
                  </span>
                )}

                {partOfSpeech && (
                  <span className="rounded-full bg-cyan-500/20 px-3 py-1 text-sm text-cyan-300">
                    {partOfSpeech}
                  </span>
                )}

              </div>

            </div>

          </div>

          <div className="flex gap-3">

            <button
              onClick={onSpeak}
              className="rounded-xl bg-white/10 p-3 transition hover:bg-white/20"
            >
              <Volume2
                size={20}
                className="text-white"
              />
            </button>

            <button
              onClick={onCopy}
              className="rounded-xl bg-white/10 p-3 transition hover:bg-white/20"
            >
              <Copy
                size={20}
                className="text-white"
              />
            </button>

          </div>

        </div>

      </div>

      <div className="space-y-8 p-6">

        {/* Meaning */}

        <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-6">

          <div className="mb-4 flex items-center gap-2 text-cyan-300">

            <Lightbulb size={20} />

            <h3 className="text-lg font-bold">
              Meaning
            </h3>

          </div>

          <p className="leading-8 text-slate-300">
            {meaning || "No meaning available."}
          </p>

        </div>

        {/* Translation */}

        {translation && (

          <div className="rounded-2xl border border-green-500/20 bg-green-500/5 p-6">

            <div className="mb-4 flex items-center gap-2 text-green-400">

              <Languages size={20} />

              <h3 className="text-lg font-bold text-white">
                Translation
              </h3>

            </div>

            <p className="text-lg font-semibold text-slate-200">
              {translation}
            </p>

          </div>

        )}

        {/* Examples */}

        {examples.length > 0 && (

          <div>

            <div className="mb-4 flex items-center gap-2 text-yellow-300">

              <CheckCircle2 size={20} />

              <h3 className="text-lg font-bold text-white">
                Examples
              </h3>

            </div>

            <div className="space-y-3">

              {examples.map((example, index) => (

                <div
                  key={index}
                  className="rounded-2xl border border-white/10 bg-black/20 p-4"
                >
                  <p className="leading-8 text-slate-300">
                    {example}
                  </p>
                </div>

              ))}

            </div>

          </div>

        )}

        {/* Synonyms + Antonyms */}

        <div className="grid gap-6 lg:grid-cols-2">

          <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-5">

            <div className="mb-4 flex items-center gap-2 text-blue-300">

              <Hash size={18} />

              <h3 className="font-bold text-white">
                Synonyms
              </h3>

            </div>

            <div className="flex flex-wrap gap-2">

              {synonyms.length ? (
                synonyms.map((item, index) => (
                  <span
                    key={index}
                    className="rounded-full bg-blue-600/20 px-3 py-2 text-sm text-blue-200"
                  >
                    {item}
                  </span>
                ))
              ) : (
                <p className="text-slate-500">
                  None available.
                </p>
              )}

            </div>

          </div>

          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-5">

            <div className="mb-4 flex items-center gap-2 text-red-300">

              <Tag size={18} />

              <h3 className="font-bold text-white">
                Antonyms
              </h3>

            </div>

            <div className="flex flex-wrap gap-2">

              {antonyms.length ? (
                antonyms.map((item, index) => (
                  <span
                    key={index}
                    className="rounded-full bg-red-600/20 px-3 py-2 text-sm text-red-200"
                  >
                    {item}
                  </span>
                ))
              ) : (
                <p className="text-slate-500">
                  None available.
                </p>
              )}

            </div>

          </div>

        </div>

        {/* Footer */}

        <div className="flex items-center gap-3 rounded-2xl bg-indigo-500/10 p-4 text-indigo-300">

          <Sparkles size={18} />

          <p className="text-sm">
            Learning words in context improves vocabulary retention and
            pronunciation.
          </p>

        </div>

      </div>

    </motion.section>
  );
};

export default WordExplanation;