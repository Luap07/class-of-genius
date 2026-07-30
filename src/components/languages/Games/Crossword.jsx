import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Grid3X3,
  RotateCcw,
  Trophy,
  CheckCircle2,
  Target,
  Lightbulb,
} from "lucide-react";

const Crossword = ({
  title = "Crossword Puzzle",
  description = "Fill in the correct words using the clues.",
  words = [],
  onComplete,
}) => {
  const [answers, setAnswers] = useState({});
  const [showSolutions, setShowSolutions] = useState(false);

  const completed = useMemo(() => {
    return words.filter((item) => {
      const value = answers[item.id] || "";

      return (
        value.trim().toUpperCase() ===
        item.answer.toUpperCase()
      );
    }).length;
  }, [answers, words]);

  const progress = useMemo(() => {
    if (!words.length) return 0;

    return Math.round(
      (completed / words.length) * 100
    );
  }, [completed, words]);

  const restart = () => {
    setAnswers({});
    setShowSolutions(false);
  };

  const checkAnswers = () => {
    if (completed === words.length) {
      onComplete?.({
        score: completed,
        total: words.length,
      });
    }
  };

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

      <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

          <div className="flex items-center gap-4">

            <div className="rounded-2xl bg-white/10 p-4">
              <Grid3X3
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
            className="text-green-400"
            size={26}
          />

          <h3 className="mt-3 text-2xl font-black text-white">
            {completed}
          </h3>

          <p className="text-slate-400">
            Correct
          </p>
        </div>

        <div className="rounded-2xl bg-black/20 p-5">
          <Target
            className="text-cyan-400"
            size={26}
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
            className="text-yellow-400"
            size={26}
          />

          <h3 className="mt-3 text-2xl font-black text-white">
            {words.length}
          </h3>

          <p className="text-slate-400">
            Total Clues
          </p>
        </div>

      </div>

      {/* Clues */}

      <div className="space-y-5 p-8">

        {words.map((item, index) => {
          const correct =
            (answers[item.id] || "")
              .trim()
              .toUpperCase() ===
            item.answer.toUpperCase();

          return (
            <div
              key={item.id}
              className="rounded-2xl border border-white/10 bg-black/20 p-6"
            >
              <div className="flex items-start justify-between gap-5">

                <div>

                  <h3 className="font-bold text-cyan-300">
                    Clue {index + 1}
                  </h3>

                  <p className="mt-2 text-slate-300">
                    {item.clue}
                  </p>

                </div>

                {correct && (
                  <CheckCircle2 className="text-green-400" />
                )}

              </div>

              <input
                type="text"
                value={answers[item.id] || ""}
                onChange={(e) =>
                  setAnswers((prev) => ({
                    ...prev,
                    [item.id]:
                      e.target.value,
                  }))
                }
                className="mt-5 w-full rounded-xl border border-white/10 bg-slate-800 px-4 py-3 uppercase text-white outline-none focus:border-cyan-500"
                placeholder={`Answer (${item.answer.length} letters)`}
              />

              {showSolutions && (
                <p className="mt-3 text-green-400">
                  Answer: {item.answer}
                </p>
              )}
            </div>
          );
        })}

      </div>

      {/* Footer */}

      <div className="flex flex-col gap-4 border-t border-white/10 p-6 md:flex-row">

        <button
          onClick={checkAnswers}
          className="flex-1 rounded-2xl bg-cyan-600 px-6 py-4 font-bold transition hover:bg-cyan-500"
        >
          Check Answers
        </button>

        <button
          onClick={() =>
            setShowSolutions((prev) => !prev)
          }
          className="flex items-center justify-center gap-2 rounded-2xl border border-yellow-500/20 bg-yellow-500/10 px-6 py-4 text-yellow-300 transition hover:bg-yellow-500/20"
        >
          <Lightbulb size={18} />
          {showSolutions
            ? "Hide Answers"
            : "Show Answers"}
        </button>

      </div>
    </motion.section>
  );
};

export default Crossword;