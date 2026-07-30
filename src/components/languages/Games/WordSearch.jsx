import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Trophy,
  RotateCcw,
  CheckCircle2,
  Target,
  Star,
} from "lucide-react";

const WordSearch = ({
  title = "Word Search",
  description = "Find all the hidden vocabulary words.",
  words = [],
  grid = [],
  onComplete,
}) => {
  const [foundWords, setFoundWords] = useState([]);

  const progress = useMemo(() => {
    if (!words.length) return 0;

    return Math.round(
      (foundWords.length / words.length) * 100
    );
  }, [foundWords, words]);

  const markFound = (word) => {
    if (foundWords.includes(word)) return;

    const updated = [...foundWords, word];

    setFoundWords(updated);

    if (updated.length === words.length) {
      onComplete?.({
        score: updated.length,
        total: words.length,
      });
    }
  };

  const restart = () => {
    setFoundWords([]);
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900"
    >
      {/* Header */}

      <div className="bg-gradient-to-r from-emerald-600 via-cyan-600 to-blue-700 p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

          <div className="flex items-center gap-4">

            <div className="rounded-2xl bg-white/10 p-4">
              <Search
                size={30}
                className="text-white"
              />
            </div>

            <div>
              <h2 className="text-3xl font-black text-white">
                {title}
              </h2>

              <p className="text-cyan-100">
                {description}
              </p>
            </div>

          </div>

          <button
            onClick={restart}
            className="flex items-center gap-2 rounded-2xl bg-white/10 px-5 py-3 transition hover:bg-white/20"
          >
            <RotateCcw size={18} />
            Restart
          </button>

        </div>
      </div>

      {/* Stats */}

      <div className="grid gap-5 border-b border-white/10 p-6 md:grid-cols-3">

        <div className="rounded-2xl bg-black/20 p-5">
          <CheckCircle2
            size={26}
            className="text-green-400"
          />

          <h3 className="mt-3 text-2xl font-black text-white">
            {foundWords.length}
          </h3>

          <p className="text-slate-400">
            Words Found
          </p>
        </div>

        <div className="rounded-2xl bg-black/20 p-5">
          <Target
            size={26}
            className="text-cyan-400"
          />

          <h3 className="mt-3 text-2xl font-black text-white">
            {progress}%
          </h3>

          <p className="text-slate-400">
            Progress
          </p>
        </div>

        <div className="rounded-2xl bg-black/20 p-5">
          <Trophy
            size={26}
            className="text-yellow-400"
          />

          <h3 className="mt-3 text-2xl font-black text-white">
            {words.length}
          </h3>

          <p className="text-slate-400">
            Total Words
          </p>
        </div>

      </div>

      {/* Puzzle */}

      <div className="grid gap-8 p-8 lg:grid-cols-2">

        {/* Grid */}

        <div className="overflow-auto rounded-2xl border border-white/10 bg-black/20 p-4">

          <div
            className="grid gap-2"
            style={{
              gridTemplateColumns: `repeat(${grid[0]?.length || 10}, minmax(0,1fr))`,
            }}
          >
            {grid.flat().map((letter, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.08 }}
                className="flex aspect-square items-center justify-center rounded-lg border border-white/10 bg-slate-800 text-lg font-bold text-white"
              >
                {letter}
              </motion.div>
            ))}
          </div>

        </div>

        {/* Word List */}

        <div>

          <h3 className="mb-5 text-2xl font-black text-white">
            Find These Words
          </h3>

          <div className="space-y-3">

            {words.map((word) => {
              const found =
                foundWords.includes(word);

              return (
                <button
                  key={word}
                  onClick={() => markFound(word)}
                  className={`flex w-full items-center justify-between rounded-2xl border p-5 transition ${
                    found
                      ? "border-green-500 bg-green-500/10"
                      : "border-white/10 bg-black/20 hover:border-cyan-500"
                  }`}
                >
                  <span
                    className={`font-semibold ${
                      found
                        ? "line-through text-green-400"
                        : "text-white"
                    }`}
                  >
                    {word}
                  </span>

                  {found ? (
                    <CheckCircle2 className="text-green-400" />
                  ) : (
                    <Star className="text-slate-500" />
                  )}
                </button>
              );
            })}

          </div>

        </div>

      </div>

      {/* Footer */}

      <div className="border-t border-white/10 bg-black/20 p-6">

        <div className="flex items-center justify-between">

          <p className="text-slate-400">
            Found{" "}
            <span className="font-bold text-cyan-300">
              {foundWords.length}
            </span>{" "}
            of{" "}
            <span className="font-bold text-cyan-300">
              {words.length}
            </span>{" "}
            words.
          </p>

          <div className="h-3 w-52 overflow-hidden rounded-full bg-white/10">
            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: `${progress}%`,
              }}
              className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-green-500"
            />
          </div>

        </div>

      </div>

    </motion.section>
  );
};

export default WordSearch;