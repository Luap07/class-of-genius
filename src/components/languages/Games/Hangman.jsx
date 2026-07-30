import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  RotateCcw,
  Trophy,
  Heart,
  CheckCircle2,
  XCircle,
  Flag,
} from "lucide-react";

const MAX_LIVES = 6;

const Hangman = ({
  words = [],
  title = "Hangman",
  onWin,
  onLose,
}) => {
  const [word, setWord] = useState("");
  const [hint, setHint] = useState("");
  const [guessed, setGuessed] = useState([]);
  const [lives, setLives] = useState(MAX_LIVES);

  useEffect(() => {
    restartGame();
  }, [words]);

  const restartGame = () => {
    if (!words.length) return;

    const random =
      words[Math.floor(Math.random() * words.length)];

    setWord(random.word.toUpperCase());
    setHint(random.hint || "");
    setGuessed([]);
    setLives(MAX_LIVES);
  };

  const displayWord = useMemo(() => {
    return word
      .split("")
      .map((letter) =>
        guessed.includes(letter) ? letter : "_"
      )
      .join(" ");
  }, [word, guessed]);

  const won =
    word &&
    word.split("").every((letter) =>
      guessed.includes(letter)
    );

  const lost = lives <= 0;

  useEffect(() => {
    if (won) {
      onWin?.(word);
    }
  }, [won]);

  useEffect(() => {
    if (lost) {
      onLose?.(word);
    }
  }, [lost]);

  const guessLetter = (letter) => {
    if (
      guessed.includes(letter) ||
      won ||
      lost
    )
      return;

    setGuessed((prev) => [...prev, letter]);

    if (!word.includes(letter)) {
      setLives((prev) => prev - 1);
    }
  };

  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

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

      <div className="bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 p-8">

        <div className="flex items-center justify-between">

          <div>

            <h2 className="text-3xl font-black text-white">
              {title}
            </h2>

            <p className="mt-2 text-orange-100">
              Guess the hidden word before you run out of lives.
            </p>

          </div>

          <button
            onClick={restartGame}
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

          <Heart
            className="text-red-400"
            size={28}
          />

          <h3 className="mt-3 text-2xl font-black text-white">
            {lives}
          </h3>

          <p className="text-slate-400">
            Lives Left
          </p>

        </div>

        <div className="rounded-2xl bg-black/20 p-5">

          <Flag
            className="text-cyan-400"
            size={28}
          />

          <h3 className="mt-3 text-2xl font-black text-white">
            {guessed.length}
          </h3>

          <p className="text-slate-400">
            Letters Tried
          </p>

        </div>

        <div className="rounded-2xl bg-black/20 p-5">

          <Trophy
            className="text-yellow-400"
            size={28}
          />

          <h3 className="mt-3 text-2xl font-black text-white">
            {won ? "100%" : "0%"}
          </h3>

          <p className="text-slate-400">
            Progress
          </p>

        </div>

      </div>

      {/* Hint */}

      {hint && (
        <div className="border-b border-white/10 bg-cyan-500/5 p-6">

          <h3 className="font-bold text-cyan-300">
            Hint
          </h3>

          <p className="mt-2 text-slate-300">
            {hint}
          </p>

        </div>
      )}

      {/* Word */}

      <div className="p-10 text-center">

        <h2 className="break-all text-5xl font-black tracking-[0.6rem] text-white">
          {displayWord}
        </h2>

      </div>

      {/* Keyboard */}

      <div className="grid grid-cols-7 gap-3 p-8 md:grid-cols-9 lg:grid-cols-13">

        {alphabet.map((letter) => {
          const used =
            guessed.includes(letter);

          return (
            <button
              key={letter}
              disabled={used || won || lost}
              onClick={() =>
                guessLetter(letter)
              }
              className={`rounded-xl px-4 py-3 font-bold transition ${
                used
                  ? word.includes(letter)
                    ? "bg-green-600"
                    : "bg-red-600"
                  : "bg-white/5 hover:bg-cyan-600"
              }`}
            >
              {letter}
            </button>
          );
        })}

      </div>

      {/* Result */}

      {(won || lost) && (
        <div className="border-t border-white/10 p-8 text-center">

          {won ? (
            <>
              <CheckCircle2
                className="mx-auto text-green-400"
                size={60}
              />

              <h2 className="mt-5 text-3xl font-black text-white">
                You Won!
              </h2>

              <p className="mt-3 text-slate-300">
                Excellent! The word was{" "}
                <span className="font-bold text-cyan-300">
                  {word}
                </span>
              </p>
            </>
          ) : (
            <>
              <XCircle
                className="mx-auto text-red-400"
                size={60}
              />

              <h2 className="mt-5 text-3xl font-black text-white">
                Game Over
              </h2>

              <p className="mt-3 text-slate-300">
                The correct word was{" "}
                <span className="font-bold text-red-300">
                  {word}
                </span>
              </p>
            </>
          )}

        </div>
      )}

    </motion.section>
  );
};

export default Hangman;