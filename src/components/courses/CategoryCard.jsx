import React from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Brain,
  FlaskConical,
} from "lucide-react";

export default function CategoryCard({
  category,
  onClick,
}) {
  const Icon = category.icon;

  return (
    <motion.div
      whileHover={{
        y: -12,
        scale: 1.02,
      }}
      whileTap={{
        scale: 0.98,
      }}
      onClick={onClick}
      className="
        group
        relative
        cursor-pointer
        overflow-hidden
        rounded-[34px]
        border
        border-slate-800
        bg-slate-900/70
        backdrop-blur-xl
        transition-all
        duration-300
      "
    >
      {/* Hover Gradient */}

      <div
        className={`
          absolute
          inset-0
          bg-gradient-to-br
          ${category.color}
          opacity-0
          transition-all
          duration-700
          group-hover:opacity-100
        `}
      />

      {/* Glow */}

      <div
        className={`
          absolute
          -right-24
          -top-24
          h-72
          w-72
          rounded-full
          bg-gradient-to-br
          ${category.color}
          opacity-20
          blur-[140px]
          transition-all
          duration-700
          group-hover:opacity-40
        `}
      />

      <div className="relative z-10 p-8">
        {/* Icon */}

        <div
          className={`
            flex
            h-20
            w-20
            items-center
            justify-center
            rounded-3xl
            bg-gradient-to-br
            ${category.color}
          `}
        >
          <Icon
            size={38}
            className="text-white"
          />
        </div>

        {/* Title */}

        <h2 className="mt-8 text-3xl font-black">
          {category.title}
        </h2>

        <p className="mt-4 leading-8 text-slate-300">
          {category.description}
        </p>

        {/* Stats */}

        <div className="mt-8 grid grid-cols-2 gap-4">
          <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-4">
            <p className="text-sm text-slate-400">
              Courses
            </p>

            <h3 className="mt-2 text-2xl font-black text-cyan-400">
              {category.courses}
            </h3>
          </div>

          <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-4">
            <p className="text-sm text-slate-400">
              Students
            </p>

            <h3 className="mt-2 text-2xl font-black text-cyan-400">
              {category.students}
            </h3>
          </div>
        </div>

        {/* Features */}

        <div className="mt-8 flex flex-wrap gap-3">
          {category.ai && (
            <div className="flex items-center gap-2 rounded-full bg-cyan-500/10 px-4 py-2">
              <Brain
                size={16}
                className="text-cyan-400"
              />

              <span className="text-sm font-semibold text-cyan-300">
                AI Tutor
              </span>
            </div>
          )}

          {category.labs && (
            <div className="flex items-center gap-2 rounded-full bg-emerald-500/10 px-4 py-2">
              <FlaskConical
                size={16}
                className="text-emerald-400"
              />

              <span className="text-sm font-semibold text-emerald-300">
                Virtual Lab
              </span>
            </div>
          )}
        </div>

        {/* Subjects */}

        <div className="mt-8 flex flex-wrap gap-2">
          {category.subjects.map((subject) => (
            <span
              key={subject}
              className="
                rounded-full
                border
                border-slate-700
                bg-slate-800/60
                px-4
                py-2
                text-sm
                text-slate-300
              "
            >
              {subject}
            </span>
          ))}
        </div>

        {/* Button */}

        <motion.button
          whileHover={{ x: 5 }}
          whileTap={{ scale: 0.98 }}
          className="
            mt-10
            flex
            w-full
            items-center
            justify-between
            rounded-2xl
            border
            border-cyan-500/20
            bg-cyan-500/10
            px-6
            py-4
            font-semibold
            text-cyan-300
            transition
            hover:border-cyan-400
            hover:bg-cyan-500/20
          "
        >
          <span>Browse Subjects</span>

          <ArrowRight
            size={20}
            className="transition group-hover:translate-x-1"
          />
        </motion.button>
      </div>
    </motion.div>
  );
}