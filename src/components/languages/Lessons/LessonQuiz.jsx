import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  CheckCircle2,
  XCircle,
  Trophy,
  RotateCcw,
  ArrowRight,
  Clock,
  Target,
} from "lucide-react";

const LessonQuiz = ({
  title = "Lesson Quiz",
  questions = [],
  onComplete,
  onRestart,
}) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [finished, setFinished] = useState(false);

  const current = questions[currentQuestion];

  const score = useMemo(() => {
    return answers.filter((item) => item.correct).length;
  }, [answers]);

  const handleNext = () => {
    if (selectedAnswer === null) return;

    const correct =
      selectedAnswer === current.correctAnswer;

    const updatedAnswers = [
      ...answers,
      {
        question: current.question,
        selected: selectedAnswer,
        correct,
      },
    ];

    setAnswers(updatedAnswers);

    if (currentQuestion === questions.length - 1) {
      setFinished(true);

      onComplete?.({
        score: updatedAnswers.filter(
          (item) => item.correct
        ).length,
        total: questions.length,
        answers: updatedAnswers,
      });

      return;
    }

    setCurrentQuestion((prev) => prev + 1);
    setSelectedAnswer(null);
  };

  const restartQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setAnswers([]);
    setFinished(false);

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
          This lesson doesn't contain any quiz yet.
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

          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-yellow-500/20">
            <Trophy
              size={50}
              className="text-yellow-400"
            />
          </div>

          <h2 className="mt-6 text-4xl font-black text-white">
            Lesson Complete
          </h2>

          <p className="mt-3 text-xl text-cyan-300">
            Score: {score} / {questions.length}
          </p>

          <div className="mt-8 h-4 overflow-hidden rounded-full bg-white/10">
            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: `${
                  (score / questions.length) * 100
                }%`,
              }}
              className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-green-500"
            />
          </div>

          <button
            onClick={restartQuiz}
            className="mt-10 inline-flex items-center gap-3 rounded-2xl bg-cyan-600 px-8 py-4 font-bold transition hover:bg-cyan-500"
          >
            <RotateCcw size={18} />
            Try Again
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

      <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 p-6">

        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

          <div>

            <h2 className="text-3xl font-black text-white">
              {title}
            </h2>

            <p className="mt-2 text-purple-100">
              Test what you've learned.
            </p>

          </div>

          <div className="flex gap-4">

            <div className="rounded-2xl bg-white/10 px-5 py-3">

              <div className="flex items-center gap-2">

                <Clock size={18} />

                <span>
                  {currentQuestion + 1}/
                  {questions.length}
                </span>

              </div>

            </div>

            <div className="rounded-2xl bg-white/10 px-5 py-3">

              <div className="flex items-center gap-2">

                <Target size={18} />

                <span>
                  {score} Correct
                </span>

              </div>

            </div>

          </div>

        </div>

      </div>

      {/* Question */}

      <div className="p-8">

        <AnimatePresence mode="wait">

          <motion.div
            key={currentQuestion}
            initial={{
              opacity: 0,
              x: 25,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            exit={{
              opacity: 0,
              x: -25,
            }}
          >
            <h3 className="text-2xl font-black text-white">
              {current.question}
            </h3>

            <div className="mt-8 space-y-4">

              {current.options.map(
                (option, index) => {
                  const active =
                    selectedAnswer === index;

                  return (
                    <button
                      key={index}
                      onClick={() =>
                        setSelectedAnswer(index)
                      }
                      className={`flex w-full items-center justify-between rounded-2xl border p-5 text-left transition ${
                        active
                          ? "border-cyan-500 bg-cyan-500/10"
                          : "border-white/10 bg-black/20 hover:border-cyan-500"
                      }`}
                    >
                      <span className="text-white">
                        {option}
                      </span>

                      {active ? (
                        <CheckCircle2 className="text-cyan-400" />
                      ) : (
                        <XCircle className="opacity-0" />
                      )}
                    </button>
                  );
                }
              )}

            </div>

          </motion.div>

        </AnimatePresence>

        <div className="mt-10 flex justify-end">

          <button
            disabled={selectedAnswer === null}
            onClick={handleNext}
            className="flex items-center gap-3 rounded-2xl bg-cyan-600 px-8 py-4 font-bold transition hover:bg-cyan-500 disabled:opacity-50"
          >
            {currentQuestion === questions.length - 1
              ? "Finish"
              : "Next"}

            <ArrowRight size={18} />
          </button>

        </div>

      </div>

    </motion.section>
  );
};

export default LessonQuiz;