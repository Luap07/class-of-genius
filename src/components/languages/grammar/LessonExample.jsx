import React from "react";
import { motion } from "framer-motion";
import {
  Lightbulb,
  Quote,
  CheckCircle2,
} from "lucide-react";

export default function LessonExample({
  examples,
}) {
  if (!examples) return null;

  const exampleList =
    Array.isArray(examples)
      ? examples
      : examples
          .split("\n")
          .filter((item) => item.trim() !== "");

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
        border-blue-500/20
        bg-gradient-to-br
        from-blue-500/10
        via-slate-900
        to-slate-950
        p-8
      "
    >
      {/* Background Glow */}

      <div
        className="
          absolute
          -right-16
          -top-16
          h-64
          w-64
          rounded-full
          bg-blue-500/10
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
              bg-blue-500/15
            "
          >
            <Lightbulb
              size={28}
              className="text-blue-400"
            />
          </div>

          <div>

            <h2
              className="
                text-3xl
                font-black
                text-white
              "
            >
              Examples
            </h2>

            <p className="mt-2 text-slate-400">
              Learn through practical examples.
            </p>

          </div>

        </div>

        {/* Examples */}

        <div className="mt-8 space-y-5">

          {exampleList.map(
            (example, index) => (
              <motion.div
                key={index}
                whileHover={{
                  x: 6,
                }}
                className="
                  rounded-2xl
                  border
                  border-blue-500/20
                  bg-slate-950/60
                  p-6
                "
              >
                <div className="flex items-start gap-4">

                  <Quote
                    size={22}
                    className="
                      mt-1
                      text-blue-400
                    "
                  />

                  <div className="flex-1">

                    <p
                      className="
                        leading-8
                        text-slate-200
                      "
                    >
                      {example}
                    </p>

                    <div
                      className="
                        mt-4
                        flex
                        items-center
                        gap-2
                        text-green-400
                      "
                    >
                      <CheckCircle2
                        size={18}
                      />

                      <span className="text-sm font-medium">
                        Correct Usage
                      </span>

                    </div>

                  </div>

                </div>
              </motion.div>
            )
          )}

        </div>

      </div>
    </motion.section>
  );
}