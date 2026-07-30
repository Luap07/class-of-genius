import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Brain,
  RotateCcw,
  Trophy,
  CheckCircle2,
  Star,
  Timer,
} from "lucide-react";

const shuffle = (array) => {
  const items = [...array];

  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    [items[i], items[j]] = [
      items[j],
      items[i],
    ];
  }

  return items;
};

const MemoryGame = ({
  title = "Memory Match",
  description = "Find all matching vocabulary pairs.",
  cards = [],
  onComplete,
}) => {
  const gameCards = useMemo(() => {
    const duplicated = cards.flatMap((card) => [
      {
        ...card,
        uniqueId: `${card.id}-1`,
      },
      {
        ...card,
        uniqueId: `${card.id}-2`,
      },
    ]);

    return shuffle(duplicated);
  }, [cards]);

  const [opened, setOpened] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (opened.length !== 2) return;

    setMoves((prev) => prev + 1);

    const [first, second] = opened;

    if (first.id === second.id) {
      setMatched((prev) => [...prev, first.id]);
      setOpened([]);
    } else {
      const timeout = setTimeout(() => {
        setOpened([]);
      }, 700);

      return () => clearTimeout(timeout);
    }
  }, [opened]);

  useEffect(() => {
    if (
      cards.length &&
      matched.length === cards.length
    ) {
      onComplete?.({
        moves,
        time: seconds,
      });
    }
  }, [matched]);

  const restart = () => {
    window.location.reload();
  };

  const flipCard = (card) => {
    if (
      opened.find(
        (item) =>
          item.uniqueId === card.uniqueId
      ) ||
      matched.includes(card.id) ||
      opened.length === 2
    )
      return;

    setOpened((prev) => [...prev, card]);
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

      <div className="bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-600 p-8">

        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

          <div className="flex items-center gap-4">

            <div className="rounded-2xl bg-white/10 p-4">

              <Brain
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

      <div className="grid gap-5 border-b border-white/10 p-6 md:grid-cols-4">

        <div className="rounded-2xl bg-black/20 p-5">

          <CheckCircle2
            size={26}
            className="text-green-400"
          />

          <h3 className="mt-3 text-2xl font-black text-white">
            {matched.length}
          </h3>

          <p className="text-slate-400">
            Matches
          </p>

        </div>

        <div className="rounded-2xl bg-black/20 p-5">

          <Star
            size={26}
            className="text-yellow-400"
          />

          <h3 className="mt-3 text-2xl font-black text-white">
            {moves}
          </h3>

          <p className="text-slate-400">
            Moves
          </p>

        </div>

        <div className="rounded-2xl bg-black/20 p-5">

          <Timer
            size={26}
            className="text-cyan-400"
          />

          <h3 className="mt-3 text-2xl font-black text-white">
            {seconds}s
          </h3>

          <p className="text-slate-400">
            Time
          </p>

        </div>

        <div className="rounded-2xl bg-black/20 p-5">

          <Trophy
            size={26}
            className="text-purple-400"
          />

          <h3 className="mt-3 text-2xl font-black text-white">
            {cards.length}
          </h3>

          <p className="text-slate-400">
            Total Pairs
          </p>

        </div>

      </div>

      {/* Cards */}

      <div className="grid grid-cols-2 gap-5 p-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">

        {gameCards.map((card) => {
          const isOpen =
            opened.find(
              (item) =>
                item.uniqueId === card.uniqueId
            ) ||
            matched.includes(card.id);

          return (
            <motion.button
              key={card.uniqueId}
              whileHover={{
                scale: 1.05,
              }}
              whileTap={{
                scale: 0.95,
              }}
              onClick={() =>
                flipCard(card)
              }
              className={`aspect-square rounded-2xl border transition ${
                isOpen
                  ? "border-cyan-500 bg-cyan-500/10"
                  : "border-white/10 bg-black/20"
              }`}
            >
              {isOpen ? (
                <div className="flex h-full flex-col items-center justify-center gap-2 p-3">

                  <span className="text-center text-lg font-bold text-white">
                    {card.word}
                  </span>

                  <span className="text-center text-sm text-cyan-300">
                    {card.translation}
                  </span>

                </div>
              ) : (
                <div className="flex h-full items-center justify-center">

                  <Brain
                    size={34}
                    className="text-slate-500"
                  />

                </div>
              )}
            </motion.button>
          );
        })}

      </div>

    </motion.section>
  );
};

export default MemoryGame;