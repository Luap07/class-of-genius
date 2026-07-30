import React from "react";
import { motion } from "framer-motion";
import {
  Quote,
  Copy,
  Volume2,
  BookOpen,
} from "lucide-react";

const Examples = ({
  examples = [],
  onCopy,
  onPronounce,
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

      <div className="mb-6 flex items-center gap-3">

        <div className="rounded-2xl bg-purple-500/10 p-3">

          <BookOpen
            size={26}
            className="text-purple-400"
          />

        </div>

        <div>

          <h2 className="text-2xl font-black text-white">
            Example Sentences
          </h2>

          <p className="text-slate-400">
            Learn how the word is used in real contexts.
          </p>

        </div>

      </div>

      {examples.length === 0 ? (

        <div className="rounded-2xl border border-dashed border-white/10 p-10 text-center">

          <Quote
            size={46}
            className="mx-auto text-slate-600"
          />

          <p className="mt-4 text-slate-400">
            No examples available.
          </p>

        </div>

      ) : (

        <div className="space-y-4">

          {examples.map((example, index) => (

            <motion.div
              key={index}
              whileHover={{
                y: -4,
              }}
              className="rounded-2xl border border-white/10 bg-black/20 p-5"
            >
              <div className="flex items-start justify-between gap-4">

                <div className="flex-1">

                  <div className="mb-4 flex items-center gap-2 text-cyan-300">

                    <Quote size={18} />

                    <span className="text-sm font-semibold">
                      Example {index + 1}
                    </span>

                  </div>

                  <p className="leading-8 text-slate-200">
                    {typeof example === "string"
                      ? example
                      : example.text}
                  </p>

                  {typeof example !== "string" &&
                    example.translation && (
                      <p className="mt-3 text-sm italic text-slate-400">
                        {example.translation}
                      </p>
                    )}

                </div>

                <div className="flex gap-2">

                  <button
                    onClick={() => onPronounce?.(example)}
                    className="rounded-xl border border-white/10 bg-white/5 p-3 transition hover:bg-white/10"
                  >
                    <Volume2 size={18} />
                  </button>

                  <button
                    onClick={() => onCopy?.(example)}
                    className="rounded-xl border border-white/10 bg-white/5 p-3 transition hover:bg-white/10"
                  >
                    <Copy size={18} />
                  </button>

                </div>

              </div>
            </motion.div>

          ))}

        </div>

      )}
    </motion.section>
  );
};

export default Examples;