import React from "react";
import { motion } from "framer-motion";
import {
  BookMarked,
  CheckCircle2,
  Sparkles,
  Brain,
  Target,
} from "lucide-react";

export default function LessonSummary({
  summary,
  keyPoints,
}) {
  if (!summary && !keyPoints) return null;

  let points = [];

  if (Array.isArray(keyPoints)) {
    points = keyPoints;
  } else if (typeof keyPoints === "string") {
    points = keyPoints
      .split("\n")
      .filter((item) => item.trim() !== "");
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
      {/* Glow */}
      <div
        className="
          absolute
          -right-20
          -bottom-20
          h-80
          w-80
          rounded-full
          bg-cyan-500/10
          blur-3xl
        "
      />

      <div className="relative">
        {/* Header */}

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
            <BookMarked
              size={28}
              className="text-cyan-400"
            />
          </div>

          <div>
            <h2 className="text-3xl font-black text-white">
              Lesson Summary
            </h2>

            <p className="mt-2 text-slate-400">
              Review everything you've learned before moving on.
            </p>
          </div>

          <Sparkles
            className="ml-auto text-cyan-400"
            size={26}
          />
        </div>

        {/* Summary */}

        {summary && (
          <div
            className="
              mt-10
              rounded-2xl
              border
              border-white/10
              bg-black/30
              p-6
            "
          >
            <div className="flex items-center gap-3">
              <Brain
                size={22}
                className="text-cyan-400"
              />

              <h3 className="text-xl font-bold text-white">
                Quick Recap
              </h3>
            </div>

            <p
              className="
                mt-5
                whitespace-pre-line
                leading-8
                text-slate-300
              "
            >
              {summary}
            </p>
          </div>
        )}

        {/* Key Points */}

        {points.length > 0 && (
          <div className="mt-10">
            <div className="flex items-center gap-3">
              <Target
                size={22}
                className="text-green-400"
              />

              <h3 className="text-2xl font-black text-white">
                Key Takeaways
              </h3>
            </div>

            <div className="mt-6 space-y-4">
              {points.map((point, index) => (
                <motion.div
                  key={index}
                  whileHover={{
                    x: 6,
                  }}
                  className="
                    flex
                    items-start
                    gap-4
                    rounded-2xl
                    border
                    border-green-500/20
                    bg-green-500/10
                    p-5
                  "
                >
                  <CheckCircle2
                    size={22}
                    className="
                      mt-1
                      shrink-0
                      text-green-400
                    "
                  />

                  <p
                    className="
                      leading-8
                      text-slate-200
                    "
                  >
                    {point}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Bottom Note */}

        <div
          className="
            mt-10
            rounded-2xl
            border
            border-cyan-500/20
            bg-cyan-500/10
            p-6
          "
        >
          <p
            className="
              text-center
              text-lg
              font-semibold
              text-cyan-200
            "
          >
            Master these concepts before proceeding to the next grammar lesson.
          </p>
        </div>
      </div>
    </motion.section>
  );
}