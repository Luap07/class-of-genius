import React from "react";
import { motion } from "framer-motion";
import {
  AlignLeft,
  Languages,
  BookOpen,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Lightbulb,
} from "lucide-react";

const SentenceBreakdown = ({
  sentence = "",
  translation = "",
  words = [],
  grammar = [],
  notes = [],
}) => {
  return (
    <motion.section
      initial={{
        opacity: 0,
        y: 20,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900"
    >
      {/* Header */}

      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-6">

        <div className="flex items-center gap-4">

          <div className="rounded-2xl bg-white/10 p-4">

            <AlignLeft
              size={30}
              className="text-white"
            />

          </div>

          <div>

            <h2 className="text-3xl font-black text-white">
              Sentence Breakdown
            </h2>

            <p className="mt-2 text-indigo-100">
              Understand every word and grammar rule.
            </p>

          </div>

        </div>

      </div>

      <div className="space-y-8 p-6">

        {/* Original Sentence */}

        <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-6">

          <div className="mb-3 flex items-center gap-2 text-cyan-300">

            <Languages size={20} />

            <h3 className="text-lg font-bold">
              Original Sentence
            </h3>

          </div>

          <p className="text-xl font-medium leading-9 text-white">
            {sentence}
          </p>

        </div>

        {/* Translation */}

        {translation && (
          <div className="rounded-2xl border border-green-500/20 bg-green-500/5 p-6">

            <div className="mb-3 flex items-center gap-2 text-green-400">

              <CheckCircle2 size={20} />

              <h3 className="text-lg font-bold text-white">
                Translation
              </h3>

            </div>

            <p className="text-lg leading-8 text-slate-200">
              {translation}
            </p>

          </div>
        )}

        {/* Word Breakdown */}

        {words.length > 0 && (
          <div>

            <div className="mb-5 flex items-center gap-2 text-yellow-300">

              <BookOpen size={20} />

              <h3 className="text-lg font-bold text-white">
                Word-by-Word Analysis
              </h3>

            </div>

            <div className="space-y-4">

              {words.map((word, index) => (
                <motion.div
                  key={index}
                  whileHover={{
                    x: 5,
                  }}
                  className="rounded-2xl border border-white/10 bg-black/20 p-5"
                >
                  <div className="flex flex-wrap items-center gap-3">

                    <span className="rounded-full bg-cyan-600 px-3 py-1 text-sm font-bold text-white">
                      {word.word}
                    </span>

                    {word.partOfSpeech && (
                      <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-cyan-300">
                        {word.partOfSpeech}
                      </span>
                    )}

                  </div>

                  <p className="mt-3 text-slate-300">
                    {word.meaning}
                  </p>

                  {word.notes && (
                    <div className="mt-3 flex items-start gap-2 text-sm text-yellow-300">

                      <Lightbulb size={16} />

                      <span>{word.notes}</span>

                    </div>
                  )}

                </motion.div>
              ))}

            </div>

          </div>
        )}

        {/* Grammar */}

        {grammar.length > 0 && (
          <div>

            <div className="mb-5 flex items-center gap-2 text-blue-300">

              <Sparkles size={20} />

              <h3 className="text-lg font-bold text-white">
                Grammar Notes
              </h3>

            </div>

            <div className="space-y-4">

              {grammar.map((item, index) => (
                <div
                  key={index}
                  className="flex gap-3 rounded-2xl border border-blue-500/20 bg-blue-500/5 p-5"
                >
                  <ArrowRight
                    size={18}
                    className="mt-1 text-blue-300"
                  />

                  <p className="leading-7 text-slate-300">
                    {item}
                  </p>

                </div>
              ))}

            </div>

          </div>
        )}

        {/* Tips */}

        {notes.length > 0 && (
          <div className="rounded-2xl border border-purple-500/20 bg-purple-500/5 p-6">

            <div className="mb-4 flex items-center gap-2 text-purple-300">

              <Lightbulb size={20} />

              <h3 className="text-lg font-bold text-white">
                AI Learning Tips
              </h3>

            </div>

            <ul className="space-y-3">

              {notes.map((tip, index) => (
                <li
                  key={index}
                  className="flex gap-3 text-slate-300"
                >
                  <CheckCircle2
                    size={18}
                    className="mt-1 text-green-400"
                  />

                  <span>{tip}</span>

                </li>
              ))}

            </ul>

          </div>
        )}

      </div>
    </motion.section>
  );
};

export default SentenceBreakdown;