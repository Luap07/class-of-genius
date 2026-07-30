import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Trophy,
  Clock,
  ArrowRight,
  Sparkles,
} from "lucide-react";

const QuizGenerator = ({
  title = "AI Language Quiz",
  description = "Test your knowledge with AI-generated questions.",
  questions = [],
  onComplete,
  onRestart,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [showResult, setShowResult] = useState(false);

  const currentQuestion = questions[currentIndex];

  const score = useMemo(() => {
    return answers.filter((answer) => answer.correct).length;
  }, [answers]);

  const handleOptionClick = (optionIndex) => {
    if (showResult) return;

    setSelected(optionIndex);
  };

  const handleNext = () => {
    if (selected === null) return;

    const correct =
      selected === currentQuestion.correctAnswer;

    const updatedAnswers = [
      ...answers,
      {
        question: currentQuestion.question,
        selected,
        correct,
      },
    ];

    setAnswers(updatedAnswers);

    if (currentIndex === questions.length - 1) {
      onComplete?.({
        score: updatedAnswers.filter((a) => a.correct).length,
        total: questions.length,
        answers: updatedAnswers,
      });

      setShowResult(true);
      return;
    }

    setSelected(null);
    setCurrentIndex((prev) => prev + 1);
  };

  const restartQuiz = () => {
    setCurrentIndex(0);
    setSelected(null);
    setAnswers([]);
    setShowResult(false);

    onRestart?.();
  };

  if (!questions.length) {
    return (
      <div className="rounded-3xl border border-dashed border-white/10 bg-slate-900 p-10 text-center">
        <Brain
          size={60}
          className="mx-auto text-slate-600"
        />

        <h2 className="mt-6 text-2xl font-black text-white">
          No Quiz Available
        </h2>

        <p className="mt-3 text-slate-400">
          Generate a quiz to begin practicing.
        </p>
      </div>
    );
  }

  if (showResult) {
    return (
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="rounded-3xl border border-white/10 bg-slate-900 p-8"
      >
        <div className="text-center">

          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-yellow-500/20">
            <Trophy
              size={50}
              className="text-yellow-400"
            />
          </div>

          <h2 className="mt-6 text-4xl font-black text-white">
            Quiz Complete!
          </h2>

          <p className="mt-4 text-xl text-cyan-300">
            {score} / {questions.length}
          </p>

          <div className="mt-8 h-4 overflow-hidden rounded-full bg-white/10">

            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: `${(score / questions.length) * 100}%`,
              }}
              className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-green-500"
            />

          </div>

          <button
            onClick={restartQuiz}
            className="mt-10 inline-flex items-center gap-3 rounded-2xl bg-cyan-600 px-8 py-4 font-bold transition hover:bg-cyan-500"
          >
            <RotateCcw size={18} />
            Restart Quiz
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

      <div className="bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-700 p-6">

        <div className="flex items-center justify-between">

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

          <div className="rounded-2xl bg-white/10 px-4 py-3">

            <div className="flex items-center gap-2">

              <Clock size={18} />

              <span className="font-bold">
                {currentIndex + 1}/{questions.length}
              </span>

            </div>

          </div>

        </div>

      </div>

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
            <h3 className="text-2xl font-black text-white">
              {currentQuestion.question}
            </h3>

            <div className="mt-8 space-y-4">

              {currentQuestion.options.map(
                (option, index) => (
                  <button
                    key={index}
                    onClick={() =>
                      handleOptionClick(index)
                    }
                    className={`flex w-full items-center justify-between rounded-2xl border p-5 text-left transition ${
                      selected === index
                        ? "border-cyan-500 bg-cyan-500/10"
                        : "border-white/10 bg-black/20 hover:border-cyan-500"
                    }`}
                  >
                    <span className="text-lg text-white">
                      {option}
                    </span>

                    {selected === index && (
                      <CheckCircle2 className="text-cyan-400" />
                    )}
                  </button>
                )
              )}

            </div>

          </motion.div>

        </AnimatePresence>

        <div className="mt-10 flex items-center justify-between">

          <div className="flex items-center gap-2 text-cyan-300">

            <Sparkles size={18} />

            AI Generated Question

          </div>

          <button
            onClick={handleNext}
            disabled={selected === null}
            className="flex items-center gap-3 rounded-2xl bg-cyan-600 px-8 py-4 font-bold transition hover:bg-cyan-500 disabled:opacity-50"
          >
            {currentIndex === questions.length - 1
              ? "Finish"
              : "Next"}

            <ArrowRight size={18} />
          </button>

        </div>

      </div>

    </motion.section>
  );
};

export default QuizGenerator;