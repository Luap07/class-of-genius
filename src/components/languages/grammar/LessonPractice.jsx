import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  PencilLine,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Sparkles,
} from "lucide-react";

export default function LessonPractice({
  exercises,
}) {
  const practiceList = useMemo(() => {
    if (!exercises) return [];

    if (Array.isArray(exercises)) {
      return exercises;
    }

    return String(exercises)
      .split("\n")
      .filter(Boolean)
      .map((line) => {
        const parts = line.split("|");

        return {
          question: parts[0]?.trim() || "",
          answer: parts[1]?.trim() || "",
        };
      });
  }, [exercises]);

  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState({});

  const handleChange = (index, value) => {
    setAnswers((prev) => ({
      ...prev,
      [index]: value,
    }));
  };

  const checkAnswer = (index) => {
    setSubmitted((prev) => ({
      ...prev,
      [index]: true,
    }));
  };

  const resetAnswer = (index) => {
    setAnswers((prev) => ({
      ...prev,
      [index]: "",
    }));

    setSubmitted((prev) => ({
      ...prev,
      [index]: false,
    }));
  };

  if (practiceList.length === 0) {
    return null;
  }

  return (
    <motion.section
      initial={{
        opacity: 0,
        y: 30,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
      }}
      viewport={{
        once: true,
      }}
      transition={{
        duration: 0.4,
      }}
      className="
        relative
        overflow-hidden
        rounded-[30px]
        border
        border-cyan-500/20
        bg-gradient-to-br
        from-cyan-500/10
        via-slate-900
        to-slate-950
        p-8
      "
    >
      <div
        className="
          absolute
          -right-24
          -bottom-24
          h-80
          w-80
          rounded-full
          bg-cyan-500/10
          blur-3xl
        "
      />

      <div className="relative">
        <div className="flex items-center gap-4">
          <div
            className="
              flex
              h-14
              w-14
              items-center
              justify-center
              rounded-2xl
              bg-cyan-500/15
            "
          >
            <PencilLine
              size={28}
              className="text-cyan-400"
            />
          </div>

          <div>
            <h2 className="text-3xl font-black text-white">
              Practice Exercise
            </h2>

            <p className="mt-2 text-slate-400">
              Answer the questions and compare with the correct answers.
            </p>
          </div>
        </div>

        <div className="mt-10 space-y-8">
          {practiceList.map((exercise, index) => {
            const correct =
              answers[index]?.trim().toLowerCase() ===
              exercise.answer.trim().toLowerCase();

            return (
              <div
                key={index}
                className="
                  rounded-2xl
                  border
                  border-white/10
                  bg-black/30
                  p-6
                "
              >
                <div className="flex items-center gap-2">
                  <Sparkles
                    size={18}
                    className="text-cyan-400"
                  />

                  <h3 className="font-bold text-white">
                    Question {index + 1}
                  </h3>
                </div>

                <p className="mt-4 text-slate-300">
                  {exercise.question}
                </p>

                <input
                  value={answers[index] || ""}
                  onChange={(e) =>
                    handleChange(
                      index,
                      e.target.value
                    )
                  }
                  placeholder="Type your answer..."
                  className="
                    mt-5
                    w-full
                    rounded-xl
                    border
                    border-white/10
                    bg-slate-900
                    px-4
                    py-3
                    text-white
                    outline-none
                    focus:border-cyan-400
                  "
                />

                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    onClick={() =>
                      checkAnswer(index)
                    }
                    className="
                      rounded-xl
                      bg-cyan-600
                      px-5
                      py-3
                      font-bold
                      text-white
                      transition
                      hover:bg-cyan-500
                    "
                  >
                    Check Answer
                  </button>

                  <button
                    onClick={() =>
                      resetAnswer(index)
                    }
                    className="
                      flex
                      items-center
                      gap-2
                      rounded-xl
                      border
                      border-white/10
                      px-5
                      py-3
                      text-white
                      transition
                      hover:bg-white/5
                    "
                  >
                    <RotateCcw size={18} />
                    Reset
                  </button>
                </div>

                {submitted[index] && (
                  <div
                    className={`
                      mt-6
                      rounded-2xl
                      p-5
                      ${
                        correct
                          ? "border border-green-500/20 bg-green-500/10"
                          : "border border-red-500/20 bg-red-500/10"
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      {correct ? (
                        <CheckCircle2 className="text-green-400" />
                      ) : (
                        <XCircle className="text-red-400" />
                      )}

                      <span className="font-bold text-white">
                        {correct
                          ? "Correct!"
                          : "Not quite."}
                      </span>
                    </div>

                    {!correct && (
                      <p className="mt-4 text-slate-300">
                        Correct Answer:
                        <span className="ml-2 font-bold text-cyan-300">
                          {exercise.answer}
                        </span>
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </motion.section>
  );
}