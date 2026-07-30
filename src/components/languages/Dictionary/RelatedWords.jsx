import React from "react";
import { motion } from "framer-motion";
import {
  Network,
  ArrowRight,
  Volume2,
  BookOpen,
  Sparkles,
  Copy,
} from "lucide-react";

const RelatedWords = ({
  words = [],
  onSelect,
  onPronounce,
  onCopy,
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
      className="rounded-3xl border border-white/10 bg-slate-900 p-6"
    >
      {/* Header */}

      <div className="mb-6 flex items-center justify-between">

        <div className="flex items-center gap-3">

          <div className="rounded-2xl bg-blue-500/10 p-3">

            <Network
              size={26}
              className="text-blue-400"
            />

          </div>

          <div>

            <h2 className="text-2xl font-black text-white">
              Related Words
            </h2>

            <p className="text-slate-400">
              Discover words with similar topics and meanings.
            </p>

          </div>

        </div>

        <span className="rounded-full bg-blue-500/10 px-4 py-2 text-sm font-bold text-blue-300">
          {words.length} Words
        </span>

      </div>

      {/* Empty State */}

      {words.length === 0 ? (

        <div className="rounded-2xl border border-dashed border-white/10 p-10 text-center">

          <Sparkles
            size={46}
            className="mx-auto text-slate-600"
          />

          <p className="mt-4 text-slate-400">
            No related words available.
          </p>

        </div>

      ) : (

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">

          {words.map((item, index) => (

            <motion.div
              key={index}
              whileHover={{
                y: -5,
              }}
              className="rounded-2xl border border-white/10 bg-black/20 p-5"
            >
              <div className="flex items-start justify-between">

                <div>

                  <h3 className="text-xl font-bold text-white">
                    {item.word || item}
                  </h3>

                  {item.partOfSpeech && (
                    <span className="mt-2 inline-flex rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-300">
                      {item.partOfSpeech}
                    </span>
                  )}

                </div>

                <BookOpen
                  size={20}
                  className="text-blue-400"
                />

              </div>

              {item.meaning && (
                <p className="mt-4 line-clamp-3 leading-7 text-slate-400">
                  {item.meaning}
                </p>
              )}

              <div className="mt-6 flex gap-2">

                <button
                  onClick={() => onSelect?.(item)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 py-2 font-semibold transition hover:bg-blue-500"
                >
                  View
                  <ArrowRight size={16} />
                </button>

                <button
                  onClick={() => onPronounce?.(item)}
                  className="rounded-xl border border-white/10 bg-white/5 p-3 transition hover:bg-white/10"
                >
                  <Volume2 size={16} />
                </button>

                <button
                  onClick={() => onCopy?.(item)}
                  className="rounded-xl border border-white/10 bg-white/5 p-3 transition hover:bg-white/10"
                >
                  <Copy size={16} />
                </button>

              </div>

            </motion.div>

          ))}

        </div>

      )}

    </motion.section>
  );
};

export default RelatedWords;