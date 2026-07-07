import React from "react";
import { motion } from "framer-motion";
import {
  Bot,
  Sparkles,
  MessageCircle,
} from "lucide-react";

const AITutorButton = ({
  course,
  module,
  onOpen,
}) => {
  const handleClick = () => {
    if (onOpen) {
      onOpen({
        course,
        module,
      });
      return;
    }

    alert(
      "AI Tutor integration will be connected here."
    );
  };

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 15,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      whileHover={{
        y: -3,
      }}
      className="
        rounded-3xl
        border
        border-indigo-500/30
        bg-gradient-to-r
        from-indigo-900/40
        via-slate-900
        to-blue-900/40
        p-6
      "
    >
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

        <div className="flex items-start gap-4">

          <div
            className="
              w-16
              h-16
              rounded-2xl
              bg-blue-600
              flex
              items-center
              justify-center
            "
          >
            <Bot
              size={34}
              className="text-white"
            />
          </div>

          <div>

            <div className="flex items-center gap-2">

              <h2 className="text-2xl font-bold">
                AI Tutor
              </h2>

              <Sparkles
                size={18}
                className="text-yellow-400"
              />

            </div>

            <p className="text-slate-400 mt-2">
              Ask questions about this lesson, request
              explanations, summaries, examples, quizzes,
              or practice exercises.
            </p>

            {course && (
              <div className="mt-4 text-sm text-slate-300">

                <p>
                  <span className="font-semibold">
                    Course:
                  </span>{" "}
                  {course.title}
                </p>

                {module && (
                  <p className="mt-1">
                    <span className="font-semibold">
                      Module:
                    </span>{" "}
                    {module.title}
                  </p>
                )}

              </div>
            )}

          </div>

        </div>

        <button
          onClick={handleClick}
          className="
            flex
            items-center
            justify-center
            gap-3
            rounded-2xl
            bg-blue-600
            hover:bg-blue-700
            transition
            px-8
            py-4
            font-semibold
          "
        >
          <MessageCircle size={20} />
          Ask AI Tutor
        </button>

      </div>
    </motion.div>
  );
};

export default AITutorButton;