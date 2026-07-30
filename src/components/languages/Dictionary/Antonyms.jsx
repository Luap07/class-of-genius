import React from "react";
import { motion } from "framer-motion";
import {
  Split,
  Copy,
  ArrowRight,
  Sparkles,
} from "lucide-react";

const Antonyms = ({
  antonyms = [],
  onSelect,
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

          <div className="rounded-2xl bg-red-500/10 p-3">

            <Split
              size={26}
              className="text-red-400"
            />

          </div>

          <div>

            <h2 className="text-2xl font-black text-white">
              Antonyms
            </h2>

            <p className="text-slate-400">
              Words with opposite meanings.
            </p>

          </div>

        </div>

        <span className="rounded-full bg-red-500/10 px-4 py-2 text-sm font-bold text-red-300">
          {antonyms.length} Words
        </span>

      </div>

      {/* Empty State */}

      {antonyms.length === 0 ? (

        <div className="rounded-2xl border border-dashed border-white/10 p-10 text-center">

          <Sparkles
            size={46}
            className="mx-auto text-slate-600"
          />

          <p className="mt-4 text-slate-400">
            No antonyms available.
          </p>

        </div>

      ) : (

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">

          {antonyms.map((item, index) => (

            <motion.div
              key={index}
              whileHover={{
                y: -5,
              }}
              className="rounded-2xl border border-white/10 bg-black/20 p-5"
            >
              <h3 className="text-xl font-bold text-white">
                {item.word || item}
              </h3>

              {item.meaning && (
                <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-400">
                  {item.meaning}
                </p>
              )}

              <div className="mt-5 flex gap-2">

                <button
                  onClick={() => onSelect?.(item)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 py-2 font-semibold transition hover:bg-red-500"
                >
                  View
                  <ArrowRight size={16} />
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

export default Antonyms;