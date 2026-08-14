import React from "react";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  BookOpen,
  Brain,
  GraduationCap,
  MonitorPlay,
  ClipboardCheck,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { Link } from "react-router-dom";

const solutions = [
  {
    number: "01",
    icon: BookOpen,
    title: "Online Courses",
    desc: "Structured courses that make learning clear, practical, and easy to follow.",
    features: ["Structured lessons", "Learning resources"],
    accent: "blue",
  },

  {
    number: "02",
    icon: GraduationCap,
    title: "LMS Integration",
    desc: "Keep learning resources, academic activities, and progress connected.",
    features: ["Centralized learning", "Academic resources"],
    accent: "cyan",
  },

  {
    number: "03",
    icon: Brain,
    title: "AI Tutoring",
    desc: "Get intelligent guidance, explanations, and support whenever you learn.",
    features: ["Smart assistance", "Instant explanations"],
    accent: "violet",
    featured: true,
  },

  {
    number: "04",
    icon: MonitorPlay,
    title: "Virtual Classrooms",
    desc: "Access engaging digital learning experiences from wherever you are.",
    features: ["Interactive learning", "Flexible access"],
    accent: "emerald",
  },

  {
    number: "05",
    icon: ClipboardCheck,
    title: "Skill Assessment",
    desc: "Measure your understanding and discover areas where you can improve.",
    features: ["Performance insights", "Practice assessments"],
    accent: "amber",
  },
];

const accentStyles = {
  blue: {
    icon: "text-blue-400",
    iconBg: "bg-blue-500/10",
    iconBorder: "border-blue-500/20",
    glow: "bg-blue-500/10",
    hoverBorder: "group-hover:border-blue-400/30",
    number: "text-blue-400/50",
    line: "from-blue-500/60",
  },

  cyan: {
    icon: "text-cyan-400",
    iconBg: "bg-cyan-500/10",
    iconBorder: "border-cyan-500/20",
    glow: "bg-cyan-500/10",
    hoverBorder: "group-hover:border-cyan-400/30",
    number: "text-cyan-400/50",
    line: "from-cyan-500/60",
  },

  violet: {
    icon: "text-violet-400",
    iconBg: "bg-violet-500/10",
    iconBorder: "border-violet-500/20",
    glow: "bg-violet-500/15",
    hoverBorder: "group-hover:border-violet-400/40",
    number: "text-violet-400/60",
    line: "from-violet-500/70",
  },

  emerald: {
    icon: "text-emerald-400",
    iconBg: "bg-emerald-500/10",
    iconBorder: "border-emerald-500/20",
    glow: "bg-emerald-500/10",
    hoverBorder: "group-hover:border-emerald-400/30",
    number: "text-emerald-400/50",
    line: "from-emerald-500/60",
  },

  amber: {
    icon: "text-amber-400",
    iconBg: "bg-amber-500/10",
    iconBorder: "border-amber-500/20",
    glow: "bg-amber-500/10",
    hoverBorder: "group-hover:border-amber-400/30",
    number: "text-amber-400/50",
    line: "from-amber-500/60",
  },
};

const containerVariants = {
  hidden: {},

  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: {
    opacity: 0,
    y: 35,
  },

  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: "easeOut",
    },
  },
};

const Solutions = () => {
  return (
    <section className="relative overflow-hidden py-28">

      {/* =====================================================
          BACKGROUND
      ===================================================== */}

      <div className="absolute inset-0 -z-20 bg-[#030712]" />

      <div className="pointer-events-none absolute -left-[180px] top-[10%] -z-10 h-[550px] w-[550px] rounded-full bg-blue-600/[0.07] blur-[150px]" />

      <div className="pointer-events-none absolute right-[-180px] top-[25%] -z-10 h-[600px] w-[600px] rounded-full bg-violet-600/[0.07] blur-[160px]" />

      <div className="pointer-events-none absolute bottom-[-250px] left-1/2 -z-10 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-cyan-500/[0.05] blur-[150px]" />

      {/* Fine grid */}

      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
          backgroundSize: "70px 70px",
        }}
      />

      {/* Fade */}

      <div className="pointer-events-none absolute left-0 right-0 top-0 h-40 bg-gradient-to-b from-[#030712] to-transparent" />

      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#030712] to-transparent" />


      {/* =====================================================
          CONTENT
      ===================================================== */}

      <div className="relative z-10 mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">

        {/* ===================================================
            HEADER
        =================================================== */}

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{
            once: true,
            amount: 0.2,
          }}
          variants={containerVariants}
          className="mx-auto max-w-3xl text-center"
        >

          <motion.div
            variants={cardVariants}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-400/15 bg-blue-500/[0.06] px-4 py-2 backdrop-blur-xl"
          >

            <Sparkles
              size={15}
              className="text-blue-400"
            />

            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-300">
              The Scholiqen Experience
            </span>

          </motion.div>


          <motion.h2
            variants={cardVariants}
            className="text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl"
          >

            Everything You Need

            <br />

            <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-violet-400 bg-clip-text text-transparent">
              To Learn Better
            </span>

          </motion.h2>


          <motion.p
            variants={cardVariants}
            className="mx-auto mt-6 max-w-2xl text-base leading-7 text-gray-400 sm:text-lg"
          >
            Powerful learning tools designed to help you learn,
            understand, practice, and grow.
          </motion.p>

        </motion.div>


        {/* ===================================================
            DIVIDER
        =================================================== */}

        <div className="mx-auto mt-16 h-px max-w-5xl bg-gradient-to-r from-transparent via-white/10 to-transparent" />


        {/* ===================================================
            SOLUTIONS
            AI TUTORING = EXACT CENTER
        =================================================== */}

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{
            once: true,
            amount: 0.08,
          }}
          variants={containerVariants}
          className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5"
        >

          {solutions.map((solution) => {
            const Icon = solution.icon;
            const style = accentStyles[solution.accent];

            return (
              <motion.div
                key={solution.title}
                variants={cardVariants}
                className="group relative"
              >

                {/* Glow */}

                <div
                  className={`pointer-events-none absolute -inset-1 rounded-[30px] ${style.glow} opacity-0 blur-2xl transition-all duration-700 group-hover:opacity-100`}
                />

                {/* Entire card is clickable */}

                <Link
                  to="/login"
                  className="relative block h-full"
                >

                  <div
                    className={`
                      relative h-full min-h-[390px]
                      overflow-hidden rounded-[28px]
                      border border-white/[0.08]
                      bg-[#080d18]/90
                      backdrop-blur-2xl
                      transition-all duration-500
                      ${style.hoverBorder}
                      group-hover:-translate-y-2
                      group-hover:shadow-2xl
                    `}
                  >

                    {/* Top shine */}

                    <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-50" />


                    {/* Internal glow */}

                    <div
                      className={`pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full ${style.glow} blur-[80px] opacity-30 transition-opacity duration-500 group-hover:opacity-70`}
                    />


                    <div className="relative flex h-full flex-col p-6">

                      {/* Number */}

                      <div className="flex items-center justify-between">

                        <span
                          className={`text-xs font-bold tracking-[0.2em] ${style.number}`}
                        >
                          {solution.number}
                        </span>

                        {solution.featured && (
                          <span className="rounded-full border border-violet-400/20 bg-violet-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-violet-300">
                            AI Powered
                          </span>
                        )}

                      </div>


                      {/* Icon */}

                      <div
                        className={`
                          relative mt-8 mb-7
                          flex h-16 w-16 items-center justify-center
                          rounded-2xl border
                          ${style.iconBorder}
                          ${style.iconBg}
                          ${style.icon}
                        `}
                      >

                        <div className="absolute inset-0 rounded-2xl bg-current opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-20" />

                        <Icon
                          size={28}
                          strokeWidth={1.7}
                          className="relative transition-transform duration-500 group-hover:scale-110"
                        />

                      </div>


                      {/* Title */}

                      <h3 className="text-xl font-bold tracking-tight text-white">
                        {solution.title}
                      </h3>


                      {/* Short description */}

                      <p className="mt-3 text-sm leading-6 text-gray-400">
                        {solution.desc}
                      </p>


                      {/* Features */}

                      <div className="mt-6 space-y-3">

                        {solution.features.map((feature) => (
                          <div
                            key={feature}
                            className="flex items-center gap-2.5 text-xs text-gray-500"
                          >

                            <CheckCircle2
                              size={14}
                              className={`${style.icon} shrink-0`}
                            />

                            <span>
                              {feature}
                            </span>

                          </div>
                        ))}

                      </div>


                      {/* Push footer down */}

                      <div className="mt-auto pt-7">

                        <div className="h-px bg-white/[0.06]" />


                        <div className="mt-5 flex items-center justify-between">

                          <span className="text-xs font-medium text-gray-500 transition-colors duration-300 group-hover:text-gray-200">
                            Get started
                          </span>

                          <div
                            className={`
                              flex h-9 w-9 items-center justify-center
                              rounded-full
                              border border-white/[0.08]
                              bg-white/[0.03]
                              ${style.icon}
                              transition-all duration-300
                              group-hover:border-white/20
                              group-hover:bg-white/[0.07]
                            `}
                          >

                            <ArrowUpRight
                              size={16}
                              className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                            />

                          </div>

                        </div>

                      </div>


                      {/* Bottom accent */}

                      <div
                        className={`
                          absolute bottom-0 left-0 right-0
                          h-px
                          bg-gradient-to-r
                          ${style.line}
                          to-transparent
                          opacity-0
                          transition-opacity duration-500
                          group-hover:opacity-100
                        `}
                      />

                    </div>

                  </div>

                </Link>

              </motion.div>
            );
          })}

        </motion.div>


        {/* ===================================================
            BOTTOM CTA
        =================================================== */}

        <motion.div
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
            amount: 0.2,
          }}
          transition={{
            duration: 0.8,
          }}
          className="relative mt-8 overflow-hidden rounded-[28px] border border-white/[0.08] bg-gradient-to-r from-[#080d18] via-[#0b1020] to-[#080d18]"
        >

          {/* Glow */}

          <div className="pointer-events-none absolute left-1/2 top-0 h-32 w-96 -translate-x-1/2 rounded-full bg-blue-500/[0.08] blur-[80px]" />


          <div className="relative flex flex-col gap-6 px-7 py-7 sm:flex-row sm:items-center sm:justify-between sm:px-9">

            <div className="flex items-center gap-4">

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-blue-400/15 bg-blue-500/10 text-blue-400">

                <Sparkles size={21} />

              </div>

              <div>

                <p className="font-semibold text-white">
                  Ready to start learning?
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  Enter Scholiqen and begin your learning journey.
                </p>

              </div>

            </div>


            <Link
              to="/login"
              className="group flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-blue-500/30"
            >

              Get Started

              <ArrowUpRight
                size={16}
                className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />

            </Link>

          </div>

        </motion.div>

      </div>
    </section>
  );
};

export default Solutions;