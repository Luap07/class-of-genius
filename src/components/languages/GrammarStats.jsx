import React from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  CheckCircle2,
  Layers3,
  Sparkles,
} from "lucide-react";

export default function GrammarStats({
  grammar = [],
}) {
  const totalLessons = grammar.length;

  const categories = [
    ...new Set(
      grammar
        .map((item) => item.category)
        .filter(Boolean)
    ),
  ].length;

  const examples = grammar.filter(
    (item) => item.examples
  ).length;

  const rules = grammar.filter(
    (item) => item.rules
  ).length;

  const stats = [
    {
      title: "Grammar Topics",
      value: totalLessons,
      icon: BookOpen,
      color:
        "from-cyan-500/20 to-cyan-600/10",
      iconColor: "text-cyan-400",
    },
    {
      title: "Categories",
      value: categories,
      icon: Layers3,
      color:
        "from-violet-500/20 to-violet-600/10",
      iconColor: "text-violet-400",
    },
    {
      title: "Grammar Rules",
      value: rules,
      icon: CheckCircle2,
      color:
        "from-green-500/20 to-green-600/10",
      iconColor: "text-green-400",
    },
    {
      title: "Worked Examples",
      value: examples,
      icon: Sparkles,
      color:
        "from-amber-500/20 to-amber-600/10",
      iconColor: "text-amber-400",
    },
  ];

  return (
    <section
      className="
        grid
        gap-6
        sm:grid-cols-2
        xl:grid-cols-4
      "
    >
      {stats.map((stat, index) => {
        const Icon = stat.icon;

        return (
          <motion.div
            key={stat.title}
            initial={{
              opacity: 0,
              y: 25,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: index * 0.08,
            }}
            whileHover={{
              y: -6,
            }}
            className={`
              relative
              overflow-hidden
              rounded-3xl
              border
              border-white/10
              bg-gradient-to-br
              ${stat.color}
              p-7
              shadow-xl
            `}
          >
            <div className="absolute inset-0 bg-black/30" />

            <div className="relative">
              <div
                className="
                  flex
                  h-14
                  w-14
                  items-center
                  justify-center
                  rounded-2xl
                  bg-white/10
                "
              >
                <Icon
                  size={28}
                  className={stat.iconColor}
                />
              </div>

              <p
                className="
                  mt-6
                  text-sm
                  uppercase
                  tracking-wider
                  text-slate-400
                "
              >
                {stat.title}
              </p>

              <h2
                className="
                  mt-2
                  text-4xl
                  font-black
                  text-white
                "
              >
                {stat.value}
              </h2>
            </div>
          </motion.div>
        );
      })}
    </section>
  );
}