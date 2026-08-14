import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Brain,
  BookOpen,
  Video,
  FileText,
  Users,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  Zap,
  GraduationCap,
} from "lucide-react";

/* =========================================================
   ANIMATIONS
========================================================= */

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const item = {
  hidden: {
    opacity: 0,
    y: 35,
  },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

/* =========================================================
   SERVICES DATA
========================================================= */

const services = [
  {
    title: "AI Learning Assistant",
    description:
      "Get intelligent learning support that helps you understand difficult topics, explore ideas, and learn at your own pace.",
    icon: Brain,
    color: "blue",
    badge: "Intelligent",
  },
  {
    title: "LMS Platform",
    description:
      "Access structured courses, learning materials, resources, and organized content across a wide range of subjects.",
    icon: BookOpen,
    color: "emerald",
    badge: "Learn",
  },
  {
    title: "Live Classes",
    description:
      "Experience interactive learning sessions designed to connect students with qualified tutors and educators.",
    icon: Video,
    color: "purple",
    badge: "Interactive",
  },
  {
    title: "CBT Practice",
    description:
      "Prepare for examinations with practice tests, past questions, timed assessments, and continuous practice.",
    icon: FileText,
    color: "yellow",
    badge: "Practice",
  },
  {
    title: "Tutor Connection",
    description:
      "Connect with tutors and educators for guidance, support, clarification, and a more personalized learning experience.",
    icon: Users,
    color: "rose",
    badge: "Guidance",
  },
  {
    title: "Smart Tools",
    description:
      "Use intelligent tools to create notes, summaries, study resources, and other materials that make learning easier.",
    icon: Sparkles,
    color: "cyan",
    badge: "Smart",
  },
];

/* =========================================================
   COLOR CONFIG
========================================================= */

const colorStyles = {
  blue: {
    icon: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-400/20",
    glow: "from-blue-500/30",
  },
  emerald: {
    icon: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-400/20",
    glow: "from-emerald-500/30",
  },
  purple: {
    icon: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-400/20",
    glow: "from-purple-500/30",
  },
  yellow: {
    icon: "text-yellow-400",
    bg: "bg-yellow-500/10",
    border: "border-yellow-400/20",
    glow: "from-yellow-500/30",
  },
  rose: {
    icon: "text-rose-400",
    bg: "bg-rose-500/10",
    border: "border-rose-400/20",
    glow: "from-rose-500/30",
  },
  cyan: {
    icon: "text-cyan-400",
    bg: "bg-cyan-500/10",
    border: "border-cyan-400/20",
    glow: "from-cyan-500/30",
  },
};

/* =========================================================
   GLOW CARD
========================================================= */

const GlowCard = ({
  title,
  description,
  icon: Icon,
  color,
  badge,
}) => {
  const styles = colorStyles[color];

  return (
    <motion.div
      whileHover={{
        y: -8,
      }}
      transition={{
        duration: 0.3,
      }}
      className="group relative h-full"
    >
      {/* Outer glow */}
      <div
        className={`absolute -inset-[1px] rounded-[28px] bg-gradient-to-r ${styles.glow} via-indigo-500/10 to-cyan-400/20 opacity-30 blur-xl transition-all duration-500 group-hover:opacity-80`}
      />

      {/* Card */}
      <div className="relative flex h-full min-h-[300px] flex-col overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.035] p-7 shadow-2xl shadow-black/20 backdrop-blur-2xl transition-all duration-500 group-hover:border-white/20 group-hover:bg-white/[0.055]">
        {/* Decorative glow */}
        <div
          className={`pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full ${styles.bg} blur-[70px] opacity-0 transition-opacity duration-500 group-hover:opacity-100`}
        />

        {/* Top line */}
        <div className="absolute left-1/2 top-0 h-[2px] w-0 -translate-x-1/2 bg-gradient-to-r from-transparent via-blue-400 to-transparent transition-all duration-500 group-hover:w-24" />

        {/* Icon */}
        <div className="relative z-10 mb-6 flex items-center justify-between">
          <div
            className={`flex h-14 w-14 items-center justify-center rounded-2xl border ${styles.border} ${styles.bg} transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3`}
          >
            <Icon className={`h-7 w-7 ${styles.icon}`} />
          </div>

          <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[9px] font-bold uppercase tracking-[0.16em] text-slate-500">
            {badge}
          </span>
        </div>

        {/* Content */}
        <div className="relative z-10">
          <h3 className="text-xl font-extrabold tracking-tight text-white">
            {title}
          </h3>

          <p className="mt-3 text-sm leading-7 text-slate-400">
            {description}
          </p>
        </div>

        {/* Bottom */}
        <div className="relative z-10 mt-auto flex items-center gap-2 pt-7 text-xs font-bold text-slate-500 transition-colors group-hover:text-blue-400">
          <span>Explore service</span>

          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
        </div>
      </div>
    </motion.div>
  );
};

/* =========================================================
   SERVICES PAGE
========================================================= */

const Services = () => {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050914] text-white">
      {/* =====================================================
          PREMIUM BACKGROUND
      ===================================================== */}

      <div className="pointer-events-none absolute inset-0">
        {/* Base */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#070b14] via-[#0a1220] to-[#04070d]" />

        {/* Blue glow */}
        <div className="absolute -left-48 top-0 h-[550px] w-[550px] rounded-full bg-blue-600/10 blur-[150px]" />

        {/* Indigo glow */}
        <div className="absolute right-[-150px] top-1/4 h-[500px] w-[500px] rounded-full bg-indigo-600/10 blur-[150px]" />

        {/* Cyan glow */}
        <div className="absolute bottom-[-200px] left-1/3 h-[450px] w-[450px] rounded-full bg-cyan-500/5 blur-[140px]" />

        {/* Dotted texture */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.9) 1px, transparent 1px)",
            backgroundSize: "26px 26px",
          }}
        />
      </div>

      {/* =====================================================
          CONTENT
      ===================================================== */}

      <div className="relative z-10 px-6 pb-24 pt-32 md:px-10">
        <div className="mx-auto max-w-7xl">
          {/* =================================================
              HERO
          ================================================= */}

          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="mx-auto max-w-4xl text-center"
          >
            {/* Badge */}
            <motion.div variants={item}>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-blue-300 backdrop-blur-xl">
                <Sparkles className="h-4 w-4" />
                <span>Everything You Need to Learn Better</span>
              </div>
            </motion.div>

            {/* Heading */}
            <motion.h1
              variants={item}
              className="text-5xl font-black tracking-tight sm:text-6xl md:text-7xl"
            >
              Powerful Tools for{" "}
              <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-400 bg-clip-text text-transparent">
                Better Learning
              </span>
            </motion.h1>

            {/* Description */}
            <motion.p
              variants={item}
              className="mx-auto mt-7 max-w-2xl text-base leading-8 text-slate-400 sm:text-lg"
            >
              Everything Scholiqen brings together to transform learning into
              a smarter, more interactive, personalized, and engaging
              experience.
            </motion.p>

            {/* Hero stats */}
            <motion.div
              variants={item}
              className="mt-9 flex flex-wrap items-center justify-center gap-3"
            >
              <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.035] px-4 py-2 text-xs font-semibold text-slate-400 backdrop-blur-xl">
                <Zap className="h-4 w-4 text-yellow-400" />
                Smart Learning
              </div>

              <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.035] px-4 py-2 text-xs font-semibold text-slate-400 backdrop-blur-xl">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                Built for Students
              </div>

              <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.035] px-4 py-2 text-xs font-semibold text-slate-400 backdrop-blur-xl">
                <GraduationCap className="h-4 w-4 text-blue-400" />
                Modern Education
              </div>
            </motion.div>
          </motion.div>

          {/* =================================================
              SERVICES GRID
          ================================================= */}

          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="mx-auto mt-20 grid max-w-6xl gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            {services.map((service) => (
              <motion.div
                key={service.title}
                variants={item}
              >
                <GlowCard {...service} />
              </motion.div>
            ))}
          </motion.div>

          {/* =================================================
              PREMIUM CTA
          ================================================= */}

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
              duration: 0.7,
            }}
            className="relative mx-auto mt-24 max-w-5xl"
          >
            {/* Glow */}
            <div className="absolute -inset-1 rounded-[34px] bg-gradient-to-r from-blue-500/20 via-cyan-400/10 to-indigo-500/20 blur-2xl" />

            {/* CTA */}
            <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.035] px-7 py-12 text-center shadow-2xl backdrop-blur-2xl sm:px-12">
              {/* Decorative glow */}
              <div className="pointer-events-none absolute left-1/2 top-[-150px] h-72 w-72 -translate-x-1/2 rounded-full bg-blue-500/10 blur-[100px]" />

              <div className="relative z-10">
                <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-400/20 bg-blue-500/10">
                  <Sparkles className="h-7 w-7 text-blue-400" />
                </div>

                <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                  Everything You Need in{" "}
                  <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                    One Platform
                  </span>
                </h2>

                <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-slate-400 sm:text-base">
                  From intelligent learning assistance to exam preparation and
                  tutor support, Scholiqen brings your learning experience
                  together.
                </p>

                {/* Features */}
                <div className="mt-7 flex flex-wrap justify-center gap-x-6 gap-y-3">
                  {[
                    "AI-powered learning",
                    "Interactive courses",
                    "CBT preparation",
                    "Smart study tools",
                  ].map((feature) => (
                    <div
                      key={feature}
                      className="flex items-center gap-2 text-xs font-semibold text-slate-400"
                    >
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      {feature}
                    </div>
                  ))}
                </div>

                {/* Button */}
                <Link
                  to="/login"
                  className="group mt-9 inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-7 py-4 text-sm font-extrabold text-white shadow-xl shadow-blue-950/30 transition-all duration-300 hover:-translate-y-1 hover:from-blue-500 hover:to-indigo-500"
                >
                  Start Learning
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </motion.div>

          {/* =================================================
              BOTTOM BRAND
          ================================================= */}

          <div className="mt-14 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-600">
              Scholiqen — Learn. Practice. Excel.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Services;