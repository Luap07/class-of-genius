import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Brain,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Trophy,
  ArrowRight,
  Sparkles,
  Target,
  Star,
} from "lucide-react";

const VocabularyPractice = ({
  title = "Vocabulary Practice",
  description = "Strengthen your vocabulary with interactive exercises.",
  words = [],
  onComplete,
  onRestart,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [finished, setFinished] = useState(false);

  const currentWord = words[currentIndex];

  const score = useMemo(() => {
    return answers.filter((answer) => answer.correct).length;
  }, [answers]);

  const handleNext = () => {
    if (selectedAnswer === null) return;

    const isCorrect =
      selectedAnswer === currentWord.correctAnswer;

    const updatedAnswers = [
      ...answers,
      {
        word: currentWord.word,
        correct: isCorrect,
        selected: selectedAnswer,
      },
    ];

    setAnswers(updatedAnswers);

    if (currentIndex === words.length - 1) {
      setFinished(true);

      onComplete?.({
        score: updatedAnswers.filter((a) => a.correct).length,
        total: words.length,
        answers: updatedAnswers,
      });

      return;
    }

    setCurrentIndex((prev) => prev + 1);
    setSelectedAnswer(null);
  };

  const restart = () => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setAnswers([]);
    setFinished(false);

    onRestart?.();
  };

  if (!words.length) {
    return (
      <div className="rounded-3xl border border-dashed border-white/10 bg-slate-900 p-12 text-center">
        <BookOpen
          size={64}
          className="mx-auto text-slate-600"
        />

        <h2 className="mt-6 text-2xl font-black text-white">
          No Vocabulary Available
        </h2>

        <p className="mt-3 text-slate-400">
          Add vocabulary words to begin practicing.
        </p>
      </div>
    );
  }

  if (finished) {
    return (
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="rounded-3xl border border-white/10 bg-slate-900 p-10"
      >
        <div className="text-center">

          <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-yellow-500/20">
            <Trophy
              size={54}
              className="text-yellow-400"
            />
          </div>

          <h2 className="mt-6 text-4xl font-black text-white">
            Practice Complete!
          </h2>

          <p className="mt-3 text-xl text-cyan-300">
            You scored {score} out of {words.length}
          </p>

          <div className="mt-8 h-4 overflow-hidden rounded-full bg-white/10">
            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: `${(score / words.length) * 100}%`,
              }}
              className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-blue-500 to-green-500"
            />
          </div>

          <button
            onClick={restart}
            className="mt-10 inline-flex items-center gap-3 rounded-2xl bg-cyan-600 px-8 py-4 font-bold transition hover:bg-cyan-500"
          >
            <RotateCcw size={18} />
            Practice Again
          </button>

        </div>
      </motion.section>
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

      <div className="bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-700 p-8">

        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

          <div className="flex items-center gap-4">

            <div className="rounded-2xl bg-white/10 p-4">
              <Brain
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

          <div className="rounded-2xl bg-white/10 px-5 py-4">

            <div className="flex items-center gap-2">

              <Target size={18} />

              <span className="font-bold">
                {currentIndex + 1}/{words.length}
              </span>

            </div>

          </div>

        </div>

      </div>

      {/* Question */}

      <div className="p-8">

        <AnimatePresence mode="wait">

          <motion.div
            key={currentIndex}
            initial={{
              opacity: 0,
              x: 30,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            exit={{
              opacity: 0,
              x: -30,
            }}
          >
            <div className="rounded-3xl border border-cyan-500/20 bg-cyan-500/5 p-8 text-center">

              <p className="text-sm uppercase tracking-widest text-cyan-300">
                Translate This Word
              </p>

              <h2 className="mt-4 text-5xl font-black text-white">
                {currentWord.word}
              </h2>

            </div>

            <div className="mt-8 space-y-4">

              {currentWord.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() =>
                    setSelectedAnswer(index)
                  }
                  className={`flex w-full items-center justify-between rounded-2xl border p-5 text-left transition ${
                    selectedAnswer === index
                      ? "border-cyan-500 bg-cyan-500/10"
                      : "border-white/10 bg-black/20 hover:border-cyan-500"
                  }`}
                >
                  <span className="text-lg text-white">
                    {option}
                  </span>

                  {selectedAnswer === index ? (
                    <CheckCircle2 className="text-cyan-400" />
                  ) : (
                    <XCircle className="opacity-0" />
                  )}
                </button>
              ))}

            </div>

          </motion.div>

        </AnimatePresence>

        {/* Footer */}

        <div className="mt-10 flex items-center justify-between">

          <div className="flex items-center gap-2 text-cyan-300">

            <Sparkles size={18} />

            <span>
              AI Vocabulary Trainer
            </span>

          </div>

          <button
            onClick={handleNext}
            disabled={selectedAnswer === null}
            className="flex items-center gap-3 rounded-2xl bg-cyan-600 px-8 py-4 font-bold transition hover:bg-cyan-500 disabled:opacity-50"
          >
            {currentIndex === words.length - 1
              ? "Finish"
              : "Next"}

            <ArrowRight size={18} />
          </button>

        </div>

      </div>

      {/* Score */}

      <div className="border-t border-white/10 bg-black/20 p-6">

        <div className="flex items-center gap-3 text-yellow-400">

          <Star size={20} />

          <span className="font-semibold">
            Current Score: {score}
          </span>

        </div>

      </div>

    </motion.section>
  );
};

export default VocabularyPractice;