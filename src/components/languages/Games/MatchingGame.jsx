import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Puzzle,
  Trophy,
  RotateCcw,
  CheckCircle2,
  Target,
  Star,
} from "lucide-react";

const shuffle = (array) => {
  const arr = [...array];

  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  return arr;
};

const MatchingGame = ({
  title = "Word Matching Game",
  description = "Match each word with its correct meaning.",
  pairs = [],
  onComplete,
}) => {
  const [leftItems, setLeftItems] = useState([]);
  const [rightItems, setRightItems] = useState([]);

  const [selectedLeft, setSelectedLeft] = useState(null);
  const [selectedRight, setSelectedRight] = useState(null);

  const [matchedIds, setMatchedIds] = useState([]);
  const [moves, setMoves] = useState(0);

  useEffect(() => {
    setLeftItems(shuffle(pairs));
    setRightItems(shuffle(pairs));
  }, [pairs]);

  useEffect(() => {
    if (
      selectedLeft === null ||
      selectedRight === null
    )
      return;

    setMoves((prev) => prev + 1);

    if (
      leftItems[selectedLeft].id ===
      rightItems[selectedRight].id
    ) {
      const id = leftItems[selectedLeft].id;

      const updated = [...matchedIds, id];

      setMatchedIds(updated);

      if (updated.length === pairs.length) {
        onComplete?.({
          moves: moves + 1,
          score: updated.length,
        });
      }
    }

    const timer = setTimeout(() => {
      setSelectedLeft(null);
      setSelectedRight(null);
    }, 500);

    return () => clearTimeout(timer);
  }, [
    selectedLeft,
    selectedRight,
    leftItems,
    rightItems,
    matchedIds,
    pairs,
    moves,
    onComplete,
  ]);

  const restart = () => {
    setLeftItems(shuffle(pairs));
    setRightItems(shuffle(pairs));
    setSelectedLeft(null);
    setSelectedRight(null);
    setMatchedIds([]);
    setMoves(0);
  };

  const progress = useMemo(() => {
    if (!pairs.length) return 0;

    return Math.round(
      (matchedIds.length / pairs.length) * 100
    );
  }, [matchedIds, pairs]);

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900"
    >
      {/* Header */}

      <div className="bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-700 p-8">

        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

          <div className="flex items-center gap-4">

            <div className="rounded-2xl bg-white/10 p-4">
              <Puzzle
                size={32}
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

          <Target
            className="text-cyan-400"
            size={26}
          />

          <h3 className="mt-3 text-2xl font-black text-white">
            {matchedIds.length}
          </h3>

          <p className="text-slate-400">
            Matches
          </p>

        </div>

        <div className="rounded-2xl bg-black/20 p-5">

          <Star
            className="text-yellow-400"
            size={26}
          />

          <h3 className="mt-3 text-2xl font-black text-white">
            {moves}
          </h3>

          <p className="text-slate-400">
            Moves
          </p>

        </div>

        <div className="rounded-2xl bg-black/20 p-5">

          <Trophy
            className="text-green-400"
            size={26}
          />

          <h3 className="mt-3 text-2xl font-black text-white">
            {progress}%
          </h3>

          <p className="text-slate-400">
            Progress
          </p>

        </div>

      </div>

      {/* Game */}

      <div className="grid gap-6 p-8 md:grid-cols-2">

        {/* Words */}

        <div className="space-y-4">

          {leftItems.map((item, index) => {
            const matched =
              matchedIds.includes(item.id);

            return (
              <button
                key={item.id}
                disabled={matched}
                onClick={() =>
                  setSelectedLeft(index)
                }
                className={`w-full rounded-2xl border p-5 text-left transition ${
                  matched
                    ? "border-green-500 bg-green-500/10"
                    : selectedLeft === index
                    ? "border-cyan-500 bg-cyan-500/10"
                    : "border-white/10 bg-black/20 hover:border-cyan-500"
                }`}
              >
                <div className="flex items-center justify-between">

                  <span className="text-lg font-semibold text-white">
                    {item.word}
                  </span>

                  {matched && (
                    <CheckCircle2 className="text-green-400" />
                  )}

                </div>
              </button>
            );
          })}

        </div>

        {/* Meanings */}

        <div className="space-y-4">

          {rightItems.map((item, index) => {
            const matched =
              matchedIds.includes(item.id);

            return (
              <button
                key={item.id}
                disabled={matched}
                onClick={() =>
                  setSelectedRight(index)
                }
                className={`w-full rounded-2xl border p-5 text-left transition ${
                  matched
                    ? "border-green-500 bg-green-500/10"
                    : selectedRight === index
                    ? "border-cyan-500 bg-cyan-500/10"
                    : "border-white/10 bg-black/20 hover:border-cyan-500"
                }`}
              >
                <div className="flex items-center justify-between">

                  <span className="text-slate-300">
                    {item.meaning}
                  </span>

                  {matched && (
                    <CheckCircle2 className="text-green-400" />
                  )}

                </div>
              </button>
            );
          })}

        </div>

      </div>

    </motion.section>
  );
};

export default MatchingGame;