import React from "react";
import {
  BookOpen,
  Tag,
  FileText,
  Lightbulb,
  CheckCircle2,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
export default function GrammarCard({ item }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.35 }}
      className="
        group
        relative
        overflow-hidden
        rounded-[30px]
        border
        border-white/10
        bg-gradient-to-br
        from-slate-900
        via-slate-950
        to-black
        shadow-xl
        transition-all
        duration-300
        hover:border-cyan-500/40
        hover:shadow-cyan-500/20
      "
    >
      {/* Glow */}
      <div
        className="
          absolute
          inset-0
          opacity-0
          transition-opacity
          duration-300
          group-hover:opacity-100
          bg-[radial-gradient(circle_at_top_right,#06b6d430,transparent_45%)]
        "
      />

      <div className="relative p-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
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
              <BookOpen
                size={28}
                className="text-cyan-400"
              />
            </div>

            <div>
              <h2 className="text-2xl font-black text-white">
                {item.title}
              </h2>

              {item.category && (
                <div
                  className="
                    mt-3
                    inline-flex
                    items-center
                    gap-2
                    rounded-full
                    bg-cyan-500/15
                    px-4
                    py-2
                    text-sm
                    font-semibold
                    text-cyan-300
                  "
                >
                  <Tag size={15} />
                  {item.category}
                </div>
              )}
            </div>
          </div>

          <Sparkles
            size={24}
            className="text-cyan-400"
          />
        </div>

        {/* Explanation */}
        {item.explanation && (
          <div className="mt-8">
            <div className="flex items-center gap-3">
              <FileText
                size={20}
                className="text-cyan-400"
              />

              <h3 className="text-lg font-bold text-white">
                Explanation
              </h3>
            </div>

            <p
              className="
                mt-4
                leading-8
                text-slate-300
              "
            >
              {item.explanation}
            </p>
          </div>
        )}

        {/* Rules */}
        {item.rules && (
          <div
            className="
              mt-8
              rounded-2xl
              border
              border-green-500/20
              bg-green-500/10
              p-6
            "
          >
            <div className="flex items-center gap-3">
              <CheckCircle2
                size={20}
                className="text-green-400"
              />

              <h3 className="text-lg font-bold text-green-300">
                Grammar Rules
              </h3>
            </div>

            <p
              className="
                mt-4
                whitespace-pre-line
                leading-8
                text-slate-300
              "
            >
              {item.rules}
            </p>
          </div>
        )}

        {/* Examples */}
        {item.examples && (
          <div
            className="
              mt-8
              rounded-2xl
              border
              border-blue-500/20
              bg-blue-500/10
              p-6
            "
          >
            <div className="flex items-center gap-3">
              <Lightbulb
                size={20}
                className="text-blue-400"
              />

              <h3 className="text-lg font-bold text-blue-300">
                Examples
              </h3>
            </div>

            <p
              className="
                mt-4
                whitespace-pre-line
                leading-8
                text-slate-300
              "
            >
              {item.examples}
            </p>
          </div>
        )}

      {/* Notes */}
{item.notes && (
  <div
    className="
      mt-8
      rounded-2xl
      border
      border-yellow-500/20
      bg-yellow-500/10
      p-6
    "
  >
    <h3 className="text-lg font-bold text-yellow-300">
      Notes
    </h3>

    <p
      className="
        mt-4
        whitespace-pre-line
        leading-8
        text-slate-300
      "
    >
      {item.notes}
    </p>
  </div>
)}

{/* Footer */}
<div
  className="
    mt-10
    flex
    items-center
    justify-between
    border-t
    border-white/10
    pt-6
  "
>
  <span className="text-sm text-slate-500">
    {item.reading_time || "5 min read"}
  </span>

  <Link
    to={`/grammar/${item.id}`}
    className="
      flex
      items-center
      gap-2
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
    Continue Reading
    <ChevronRight size={18} />
  </Link>
</div>

      </div>
    </motion.article>
  );
}
 