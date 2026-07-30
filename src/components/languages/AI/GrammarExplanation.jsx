import React from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  Lightbulb,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  GraduationCap,
} from "lucide-react";

const GrammarExplanation = ({
  topic = "",
  rule = "",
  explanation = "",
  examples = [],
  mistakes = [],
  tips = [],
  level = "Beginner",
}) => {
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

        <div className="flex items-center gap-4">

          <div className="rounded-2xl bg-white/10 p-4">
            <GraduationCap
              size={32}
              className="text-white"
            />
          </div>

          <div>
            <h2 className="text-3xl font-black text-white">
              {topic || "Grammar Lesson"}
            </h2>

            <p className="mt-1 text-cyan-100">
              Level: {level}
            </p>
          </div>

        </div>

      </div>

      <div className="space-y-8 p-6">

        {/* Rule */}

        <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-6">

          <div className="mb-3 flex items-center gap-2 text-cyan-300">

            <BookOpen size={20} />

            <h3 className="text-lg font-bold">
              Grammar Rule
            </h3>

          </div>

          <p className="leading-8 text-slate-300">
            {rule}
          </p>

        </div>

        {/* Explanation */}

        <div>

          <div className="mb-3 flex items-center gap-2 text-yellow-300">

            <Lightbulb size={20} />

            <h3 className="text-lg font-bold text-white">
              Explanation
            </h3>

          </div>

          <p className="leading-8 text-slate-300">
            {explanation}
          </p>

        </div>

        {/* Examples */}

        {examples.length > 0 && (

          <div>

            <div className="mb-4 flex items-center gap-2 text-green-400">

              <CheckCircle2 size={20} />

              <h3 className="text-lg font-bold text-white">
                Correct Examples
              </h3>

            </div>

            <div className="space-y-3">

              {examples.map((example, index) => (

                <div
                  key={index}
                  className="rounded-2xl border border-green-500/20 bg-green-500/5 p-4"
                >
                  <p className="leading-7 text-slate-200">
                    {example}
                  </p>
                </div>

              ))}

            </div>

          </div>

        )}

        {/* Common Mistakes */}

        {mistakes.length > 0 && (

          <div>

            <div className="mb-4 flex items-center gap-2 text-red-400">

              <AlertTriangle size={20} />

              <h3 className="text-lg font-bold text-white">
                Common Mistakes
              </h3>

            </div>

            <div className="space-y-3">

              {mistakes.map((mistake, index) => (

                <div
                  key={index}
                  className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4"
                >
                  <p className="leading-7 text-slate-300">
                    {mistake}
                  </p>
                </div>

              ))}

            </div>

          </div>

        )}

        {/* Tips */}

        {tips.length > 0 && (

          <div>

            <div className="mb-4 flex items-center gap-2 text-cyan-300">

              <Sparkles size={20} />

              <h3 className="text-lg font-bold text-white">
                Learning Tips
              </h3>

            </div>

            <div className="grid gap-4 md:grid-cols-2">

              {tips.map((tip, index) => (

                <div
                  key={index}
                  className="flex gap-3 rounded-2xl border border-white/10 bg-black/20 p-4"
                >
                  <ArrowRight
                    size={18}
                    className="mt-1 text-cyan-400"
                  />

                  <p className="leading-7 text-slate-300">
                    {tip}
                  </p>

                </div>

              ))}

            </div>

          </div>

        )}

      </div>

    </motion.section>
  );
};

export default GrammarExplanation;