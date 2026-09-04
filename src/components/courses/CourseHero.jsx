import React from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  Layers3,
  PlayCircle,
  GraduationCap,
} from "lucide-react";

const fadeUp = {
  hidden: {
    opacity: 0,
    y: 18,
  },

  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const CourseHero = () => {
  const statItems = [
    {
      label: "Courses",
      icon: BookOpen,
    },
    {
      label: "Categories",
      icon: Layers3,
    },
    {
      label: "Lessons",
      icon: PlayCircle,
    },
    {
      label: "Subjects",
      icon: GraduationCap,
    },
  ];

  return (
    <section className="relative overflow-hidden bg-[#020617] text-white">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0 opacity-[0.055]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(56,189,248,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,0.18) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />

        <div className="absolute left-1/2 top-[-220px] h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-[130px]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-6 py-14 sm:py-16">
        {/* Hero Text */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mx-auto max-w-3xl text-center"
        >
          <div className="mb-4 flex items-center justify-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-cyan-400">
            <GraduationCap size={18} />
            Scholiqen Courses
          </div>

          <h1 className="text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
            Learn.
            <span className="bg-gradient-to-r from-cyan-300 via-blue-400 to-violet-400 bg-clip-text text-transparent">
              {" "}Grow.
            </span>
            {" "}Achieve.
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
            Explore courses, subjects, and learning
            resources designed to help you build
            knowledge and develop useful skills.
          </p>
        </motion.div>

        {/* 4-Grid */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.1 }}
          className="mx-auto mt-10 grid max-w-4xl grid-cols-2 border border-white/[0.07] bg-white/[0.02] sm:grid-cols-4"
        >
          {statItems.map((item, index) => {
            const Icon = item.icon;

            return (
              <div
                key={item.label}
                className={`
                  px-5 py-7 text-center
                  ${
                    index > 0
                      ? "border-t border-white/[0.07] sm:border-l sm:border-t-0"
                      : ""
                  }
                `}
              >
                <Icon
                  size={19}
                  className="mx-auto mb-3 text-cyan-400"
                />

                <div className="text-sm font-semibold text-slate-300">
                  {item.label}
                </div>
              </div>
            );
          })}
        </motion.div>
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-cyan-400/25 to-transparent" />
    </section>
  );
};

export default CourseHero;
