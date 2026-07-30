import React from "react";
import { motion } from "framer-motion";
import {
  History,
  Calendar,
  Globe,
  ArrowRight,
  Sparkles,
  BookOpen,
} from "lucide-react";

const WordOrigin = ({
  origin,
  onLearnMore,
}) => {
  if (!origin) {
    return (
      <section className="rounded-3xl border border-white/10 bg-slate-900 p-10 text-center">

        <Sparkles
          size={54}
          className="mx-auto text-slate-600"
        />

        <h2 className="mt-6 text-2xl font-black text-white">
          Word Origin Unavailable
        </h2>

        <p className="mt-3 text-slate-400">
          The etymology for this word has not been added yet.
        </p>

      </section>
    );
  }

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

      <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 p-6">

        <div className="flex items-center gap-4">

          <div className="rounded-2xl bg-white/10 p-4">

            <History
              size={34}
              className="text-white"
            />

          </div>

          <div>

            <h2 className="text-3xl font-black text-white">
              Word Origin
            </h2>

            <p className="text-orange-100">
              Explore the history and evolution of this word.
            </p>

          </div>

        </div>

      </div>

      {/* Content */}

      <div className="space-y-6 p-6">

        <div className="grid gap-4 md:grid-cols-2">

          <div className="rounded-2xl bg-black/20 p-5">

            <div className="flex items-center gap-2 text-cyan-300">

              <Globe size={18} />

              <span className="font-semibold">
                Original Language
              </span>

            </div>

            <p className="mt-3 text-lg font-bold text-white">
              {origin.language || "Unknown"}
            </p>

          </div>

          <div className="rounded-2xl bg-black/20 p-5">

            <div className="flex items-center gap-2 text-green-300">

              <Calendar size={18} />

              <span className="font-semibold">
                First Recorded
              </span>

            </div>

            <p className="mt-3 text-lg font-bold text-white">
              {origin.period || "Unknown"}
            </p>

          </div>

        </div>

        <div className="rounded-3xl border border-white/10 bg-black/20 p-6">

          <div className="mb-4 flex items-center gap-2 text-amber-300">

            <BookOpen size={20} />

            <span className="font-bold">
              Etymology
            </span>

          </div>

          <p className="leading-8 text-slate-300">
            {origin.description ||
              "No etymology information available."}
          </p>

        </div>

        {origin.evolution?.length > 0 && (

          <div>

            <h3 className="mb-5 text-xl font-bold text-white">
              Evolution Timeline
            </h3>

            <div className="space-y-4">

              {origin.evolution.map((item, index) => (

                <motion.div
                  key={index}
                  whileHover={{
                    x: 6,
                  }}
                  className="flex gap-4 rounded-2xl border border-white/10 bg-black/20 p-5"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-600 font-black text-white">
                    {index + 1}
                  </div>

                  <div>

                    <h4 className="font-bold text-white">
                      {item.year || item.period}
                    </h4>

                    <p className="mt-2 leading-7 text-slate-400">
                      {item.description}
                    </p>

                  </div>

                </motion.div>

              ))}

            </div>

          </div>

        )}

        <button
          onClick={onLearnMore}
          className="flex w-full items-center justify-center gap-3 rounded-2xl bg-orange-600 py-4 font-bold transition hover:bg-orange-500"
        >
          Learn More

          <ArrowRight size={18} />
        </button>

      </div>

    </motion.section>
  );
};

export default WordOrigin;