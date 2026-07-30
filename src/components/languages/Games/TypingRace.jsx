import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Keyboard,
  Timer,
  Trophy,
  RotateCcw,
  CheckCircle2,
  Target,
  Zap,
  Award,
} from "lucide-react";

const TypingRace = ({
  title = "Typing Race",
  text =
    "Learning a new language becomes easier with consistent daily practice.",
  duration = 60,
  onComplete,
}) => {
  const [input, setInput] = useState("");
  const [timeLeft, setTimeLeft] = useState(duration);
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    if (!started || finished) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setFinished(true);
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [started, finished]);

  const stats = useMemo(() => {
    const targetWords = text.trim().split(/\s+/);

    const typedWords = input.trim().split(/\s+/);

    let correct = 0;

    typedWords.forEach((word, index) => {
      if (word === targetWords[index]) {
        correct++;
      }
    });

    const accuracy = typedWords.length
      ? Math.round((correct / typedWords.length) * 100)
      : 100;

    const elapsed = duration - timeLeft || 1;

    const wpm = Math.round(
      typedWords.length / (elapsed / 60)
    );

    return {
      typed: typedWords.length,
      correct,
      accuracy,
      wpm: Number.isFinite(wpm) ? wpm : 0,
    };
  }, [input, text, duration, timeLeft]);

  useEffect(() => {
    if (!finished) return;

    onComplete?.({
      ...stats,
    });
  }, [finished]);

  const restart = () => {
    setInput("");
    setStarted(false);
    setFinished(false);
    setTimeLeft(duration);
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900"
    >
      {/* Header */}

      <div className="bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-700 p-8">

        <div className="flex items-center justify-between">

          <div className="flex items-center gap-4">

            <div className="rounded-2xl bg-white/10 p-4">
              <Keyboard
                size={32}
                className="text-white"
              />
            </div>

            <div>

              <h2 className="text-3xl font-black text-white">
                {title}
              </h2>

              <p className="text-cyan-100">
                Type as quickly and accurately as possible.
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
          <Timer className="text-cyan-400" size={26} />
          <h3 className="mt-3 text-2xl font-black text-white">
            {timeLeft}s
          </h3>
          <p className="text-slate-400">
            Time Left
          </p>
        </div>

        <div className="rounded-2xl bg-black/20 p-5">
          <Zap className="text-yellow-400" size={26} />
          <h3 className="mt-3 text-2xl font-black text-white">
            {stats.wpm}
          </h3>
          <p className="text-slate-400">
            WPM
          </p>
        </div>

        <div className="rounded-2xl bg-black/20 p-5">
          <Target className="text-green-400" size={26} />
          <h3 className="mt-3 text-2xl font-black text-white">
            {stats.accuracy}%
          </h3>
          <p className="text-slate-400">
            Accuracy
          </p>
        </div>

        <div className="rounded-2xl bg-black/20 p-5">
          <Award className="text-purple-400" size={26} />
          <h3 className="mt-3 text-2xl font-black text-white">
            {stats.correct}
          </h3>
          <p className="text-slate-400">
            Correct Words
          </p>
        </div>

      </div>

      {/* Text */}

      <div className="p-8">

        <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-6 leading-9 text-slate-200">
          {text}
        </div>

        <textarea
          value={input}
          disabled={finished}
          onFocus={() => setStarted(true)}
          onChange={(e) =>
            setInput(e.target.value)
          }
          placeholder="Start typing here..."
          className="mt-6 h-56 w-full resize-none rounded-2xl border border-white/10 bg-black/20 p-5 text-lg text-white outline-none focus:border-cyan-500"
        />

      </div>

      {/* Footer */}

      <div className="border-t border-white/10 bg-black/20 p-6">

        {finished ? (
          <div className="flex items-center justify-center gap-3 text-green-400">

            <CheckCircle2 size={26} />

            <span className="text-lg font-bold">
              Challenge Complete!
            </span>

          </div>
        ) : (
          <div className="flex items-center justify-center gap-3 text-yellow-400">

            <Trophy size={22} />

            <span>
              Finish before the timer reaches zero.
            </span>

          </div>
        )}

      </div>

    </motion.section>
  );
};

export default TypingRace;