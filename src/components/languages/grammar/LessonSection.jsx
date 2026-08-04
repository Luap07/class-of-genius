import React from "react";
import { motion } from "framer-motion";
import {
  BookText,
  ChevronRight,
} from "lucide-react";

export default function LessonSection({
  title,
  content,
}) {
  if (!content) return null;

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
        border-white/10
        bg-gradient-to-br
        from-slate-900
        via-slate-950
        to-black
        p-8
      "
    >
      {/* Background Glow */}

      <div
        className="
          absolute
          right-0
          top-0
          h-52
          w-52
          rounded-full
          bg-cyan-500/5
          blur-3xl
        "
      />

      <div className="relative">

        {/* Heading */}

        <div
          className="
            flex
            items-center
            gap-4
          "
        >
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
            <BookText
              size={28}
              className="text-cyan-400"
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
              {title}
            </h2>

            <div
              className="
                mt-2
                flex
                items-center
                gap-2
                text-cyan-400
              "
            >
              <ChevronRight size={16} />

              <span className="text-sm font-medium">
                Grammar Lesson
              </span>
            </div>

          </div>
        </div>

        {/* Divider */}

        <div
          className="
            my-8
            h-px
            bg-gradient-to-r
            from-cyan-500/40
            via-white/10
            to-transparent
          "
        />

        {/* Content */}

        <div
          className="
            prose
            prose-invert
            max-w-none
            whitespace-pre-line
            text-lg
            leading-9
            text-slate-300
          "
        >
          {content}
        </div>

      </div>
    </motion.section>
  );
}