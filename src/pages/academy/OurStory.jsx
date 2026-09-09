import React from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Award,
  BookOpen,
  Brain,
  CheckCircle2,
  ChevronRight,
  GraduationCap,
  Heart,
  Lightbulb,
  MessageCircle,
  Rocket,
  Sparkles,
  Target,
  Users,
} from "lucide-react";

import Cog from "../../assets/cog.png";
import heroImage from "../../assets/school.jpg";

const fadeUp = {
  hidden: {
    opacity: 0,
    y: 30,
  },
  visible: {
    opacity: 1,
    y: 0,
  },
};

const stagger = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const values = [
  {
    title: "Excellence",
    description:
      "We believe every learner deserves access to quality educational content, useful tools and an environment that encourages them to become better.",
    icon: Award,
    gradient: "from-cyan-400 to-blue-500",
  },
  {
    title: "Innovation",
    description:
      "We combine modern technology, interactive learning and intelligent tools to create a better way for students to learn.",
    icon: Lightbulb,
    gradient: "from-blue-400 to-indigo-500",
  },
  {
    title: "Accessibility",
    description:
      "Learning should be easier to access. Scholiqen brings study materials, practice and learning communities together in one platform.",
    icon: Users,
    gradient: "from-sky-400 to-cyan-500",
  },
  {
    title: "Growth",
    description:
      "Our goal goes beyond completing lessons. We want learners to build confidence, develop skills and continuously improve.",
    icon: Rocket,
    gradient: "from-indigo-400 to-blue-500",
  },
];

const features = [
  {
    title: "Structured Learning",
    description:
      "Organised academic resources help students move from learning concepts to practising and mastering them.",
    icon: BookOpen,
  },
  {
    title: "Interactive Practice",
    description:
      "CBT practice, revision activities and practical learning experiences help students test what they know.",
    icon: Brain,
  },
  {
    title: "Learning Community",
    description:
      "Students can connect, discuss ideas, ask questions and learn alongside other members of the community.",
    icon: MessageCircle,
  },
  {
    title: "Future-Focused Education",
    description:
      "We use technology and intelligent learning tools to prepare students for an increasingly digital world.",
    icon: GraduationCap,
  },
];

const stats = [
  {
    value: "01",
    label: "Learning Platform",
  },
  {
    value: "24/7",
    label: "Learning Access",
  },
  {
    value: "∞",
    label: "Room to Grow",
  },
  {
    value: "1",
    label: "Learning Community",
  },
];

export default function OurStory() {
  return (
    <div className="min-h-screen overflow-hidden bg-[#020617] text-white">
      {/* =====================================================
          GLOBAL BACKGROUND
      ===================================================== */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute left-[-20%] top-[10%] h-[500px] w-[500px] rounded-full bg-cyan-500/[0.04] blur-[140px]" />
        <div className="absolute right-[-15%] top-[40%] h-[600px] w-[600px] rounded-full bg-blue-600/[0.04] blur-[160px]" />
        <div className="absolute bottom-[-20%] left-[25%] h-[500px] w-[500px] rounded-full bg-indigo-500/[0.03] blur-[150px]" />
      </div>

      {/* =====================================================
          NAVBAR
      ===================================================== */}
      <header className="fixed left-0 right-0 top-0 z-50">
        <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-6 lg:px-8">
          <nav className="flex h-[72px] items-center justify-between rounded-2xl border border-white/[0.08] bg-[#020617]/70 px-4 shadow-2xl shadow-black/20 backdrop-blur-2xl sm:px-6">
            {/* LOGO */}
            <a href="/" className="group flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 rounded-xl bg-cyan-400/20 blur-xl transition-all duration-300 group-hover:bg-cyan-400/30" />
                <img
                  src={Cog}
                  alt="Scholiqen"
                  className="relative h-10 w-10 object-contain"
                />
              </div>

              <div className="hidden sm:block">
                <p className="text-base font-black tracking-tight text-white">
                  Scholiqen
                </p>
                <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-cyan-400">
                  Academy
                </p>
              </div>
            </a>

            {/* DESKTOP NAV */}
            <div className="hidden items-center gap-1 md:flex">
              <a
                href="/academy"
                className="rounded-xl px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/[0.05] hover:text-white"
              >
                Academy
              </a>
              <a
                href="/academics"
                className="rounded-xl px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/[0.05] hover:text-white"
              >
                Academics
              </a>
              <a
                href="/resources"
                className="rounded-xl px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/[0.05] hover:text-white"
              >
                Resources
              </a>
              <a
                href="/community"
                className="rounded-xl px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/[0.05] hover:text-white"
              >
                Community
              </a>
              <a
                href="/OurStory"
                className="rounded-xl bg-white/[0.06] px-4 py-2.5 text-sm font-semibold text-cyan-300"
              >
                OurStory
              </a>
            </div>

            {/* NAV ACTION */}
            <a
              href="/academy/sign-in"
              className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-4 py-2.5 text-sm font-bold text-slate-950 shadow-lg shadow-cyan-500/10 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-cyan-500/20 sm:px-5"
            >
              <span className="hidden sm:inline">Get Started</span>
              <ArrowRight
                size={17}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </a>
          </nav>
        </div>
      </header>

      {/* =====================================================
          HERO (CENTERED TEXT & ELEMENTS)
      ===================================================== */}
      <section className="relative flex min-h-[720px] items-center overflow-hidden pt-28">
        {/* HERO IMAGE */}
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Scholiqen learning environment"
            className="h-full w-full object-cover object-center"
          />

          {/* Dark overlay */}
          <div className="absolute inset-0 bg-[#020617]/55" />

          {/* Centered cinematic radial gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#020617]/80 via-[#020617]/50 to-[#020617]" />

          {/* Subtle dotted texture */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.035]"
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(103, 232, 249, 0.9) 0.6px, transparent 0.6px)",
              backgroundSize: "30px 30px",
            }}
          />
        </div>

        {/* SOFT GLOWS */}
        <motion.div
          animate={{
            opacity: [0.35, 0.55, 0.35],
            scale: [1, 1.08, 1],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[450px] w-[450px] rounded-full bg-cyan-500/10 blur-[130px]"
        />

        {/* HERO CONTENT */}
        <div className="relative z-10 mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="mx-auto flex flex-col items-center max-w-3xl"
          >
            {/* EYEBROW */}
            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.7 }}
              className="mb-6 inline-flex items-center gap-3 rounded-full border border-cyan-400/20 bg-cyan-400/[0.05] px-4 py-2 backdrop-blur-md"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-30" />
                <span className="relative h-2.5 w-2.5 rounded-full bg-cyan-400" />
              </span>
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">
                About Scholiqen
              </span>
            </motion.div>

            {/* TITLE */}
            <motion.h1
              variants={fadeUp}
              transition={{ duration: 0.8 }}
              className="text-4xl font-black leading-[1.04] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
            >
              Education, <br />
              <span className="bg-gradient-to-r from-cyan-300 via-sky-400 to-blue-500 bg-clip-text text-transparent">
                Reimagined.
              </span>
            </motion.h1>

            {/* DESCRIPTION */}
            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.8 }}
              className="mt-7 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg"
            >
              Scholiqen is a modern learning platform built to bring education,
              technology and community together — giving learners the tools,
              resources and environment they need to learn with confidence.
            </motion.p>

            {/* BUTTONS */}
            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.8 }}
              className="mt-9 flex flex-col justify-center gap-3 sm:flex-row w-full"
            >
              <a
                href="/academy/sign-in"
                className="group inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-6 py-3.5 text-sm font-bold text-slate-950 shadow-xl shadow-cyan-500/15 transition-all duration-300 hover:-translate-y-1 hover:shadow-cyan-500/25"
              >
                Start Your Journey
                <ArrowRight
                  size={18}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </a>

              <a
                href="#mission"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-6 py-3.5 text-sm font-semibold text-white backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/20 hover:bg-white/[0.07]"
              >
                Discover Our Mission
                <ChevronRight size={18} className="text-cyan-300" />
              </a>
            </motion.div>
          </motion.div>
        </div>

        {/* BOTTOM FADE */}
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-36 bg-gradient-to-t from-[#020617] to-transparent" />
      </section>

      {/* =====================================================
          STATS
      ===================================================== */}
      <section className="relative border-y border-white/[0.05] bg-[#020617]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 divide-x divide-white/[0.06] md:grid-cols-4">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.1,
                }}
                className="px-5 py-8 text-center sm:py-10"
              >
                <div className="text-2xl font-black text-white sm:text-3xl">
                  {stat.value}
                </div>
                <div className="mt-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          MISSION
      ===================================================== */}
      <section id="mission" className="relative overflow-hidden py-24 sm:py-32">
        <div className="absolute left-1/2 top-0 h-px w-[70%] -translate-x-1/2 bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
            {/* LEFT */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.8 }}
            >
              <div className="mb-5 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">
                <Target size={16} />
                Our Mission
              </div>

              <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl md:text-5xl">
                Making learning
                <span className="text-cyan-400"> more meaningful.</span>
              </h2>

              <p className="mt-6 text-base leading-8 text-slate-400">
                Education should not feel like simply memorising pages of
                information. It should inspire curiosity, encourage exploration
                and give learners the confidence to solve problems.
              </p>

              <p className="mt-5 text-base leading-8 text-slate-400">
                Scholiqen brings together academic resources, digital learning
                tools, practice environments and a supportive community so
                students can experience a more connected way of learning.
              </p>

              <div className="mt-8 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400/15 bg-cyan-400/[0.06]">
                  <Heart size={18} className="text-cyan-400" />
                </div>
                <p className="text-sm font-semibold text-slate-300">
                  Built around the learner.
                </p>
              </div>
            </motion.div>

            {/* RIGHT */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="absolute -inset-5 rounded-[2rem] bg-cyan-500/[0.04] blur-2xl" />

              <div className="relative overflow-hidden rounded-[2rem] border border-white/[0.08] bg-white/[0.025] p-7 backdrop-blur-xl sm:p-9">
                <div className="absolute right-[-60px] top-[-60px] h-40 w-40 rounded-full bg-cyan-400/[0.08] blur-3xl" />

                <div className="relative">
                  <div className="mb-8 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">
                        The Scholiqen Vision
                      </p>
                      <h3 className="mt-2 text-xl font-bold text-white">
                        Learn. Practise. Grow.
                      </h3>
                    </div>

                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 shadow-lg shadow-cyan-500/20">
                      <Sparkles size={22} className="text-slate-950" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    {[
                      {
                        title: "Learn",
                        text: "Build strong foundations through structured academic content.",
                        icon: BookOpen,
                      },
                      {
                        title: "Practise",
                        text: "Test your understanding through questions, activities and experiments.",
                        icon: Brain,
                      },
                      {
                        title: "Grow",
                        text: "Develop confidence, knowledge and skills for the future.",
                        icon: Rocket,
                      },
                    ].map((item, index) => {
                      const Icon = item.icon;

                      return (
                        <motion.div
                          key={item.title}
                          initial={{ opacity: 0, x: 15 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{
                            duration: 0.5,
                            delay: index * 0.12,
                          }}
                          className="flex gap-4 rounded-2xl border border-white/[0.06] bg-black/20 p-4"
                        >
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-400/[0.07]">
                            <Icon size={19} className="text-cyan-400" />
                          </div>

                          <div>
                            <h4 className="font-bold text-white">
                              {item.title}
                            </h4>
                            <p className="mt-1 text-sm leading-6 text-slate-500">
                              {item.text}
                            </p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* =====================================================
          WHAT WE OFFER
      ===================================================== */}
      <section className="relative border-y border-white/[0.05] bg-white/[0.015] py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="mx-auto max-w-2xl text-center"
          >
            <div className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">
              Why Scholiqen
            </div>

            <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl md:text-5xl">
              More than a place to
              <span className="text-cyan-400"> study.</span>
            </h2>

            <p className="mt-5 text-base leading-7 text-slate-400">
              We are building an ecosystem where learning, practice, technology
              and community work together.
            </p>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-4"
          >
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <motion.div
                  key={feature.title}
                  variants={fadeUp}
                  transition={{ duration: 0.6 }}
                  className="group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-[#050b1c]/80 p-6 transition-all duration-300 hover:-translate-y-2 hover:border-cyan-400/20"
                >
                  <div className="absolute right-[-40px] top-[-40px] h-28 w-28 rounded-full bg-cyan-400/[0.04] blur-2xl transition-all duration-500 group-hover:bg-cyan-400/[0.08]" />

                  <div className="relative">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-cyan-400/10 bg-cyan-400/[0.06]">
                      <Icon size={21} className="text-cyan-400" />
                    </div>

                    <h3 className="mt-6 text-lg font-bold text-white">
                      {feature.title}
                    </h3>

                    <p className="mt-3 text-sm leading-7 text-slate-500">
                      {feature.description}
                    </p>

                    <div className="mt-6 flex items-center gap-1 text-xs font-semibold text-cyan-400 opacity-0 transition-all duration-300 group-hover:opacity-100">
                      Explore
                      <ArrowRight size={14} />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* =====================================================
          VALUES
      ===================================================== */}
      <section className="relative py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            {/* HEADING */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="lg:sticky lg:top-32"
            >
              <div className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">
                What We Believe
              </div>

              <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                Built on values that
                <span className="text-cyan-400"> matter.</span>
              </h2>

              <p className="mt-5 max-w-md text-base leading-7 text-slate-400">
                Every part of Scholiqen is shaped by the belief that technology
                should make education more useful, engaging and accessible.
              </p>
            </motion.div>

            {/* VALUES */}
            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.15 }}
              className="grid gap-5 sm:grid-cols-2"
            >
              {values.map((value) => {
                const Icon = value.icon;

                return (
                  <motion.div
                    key={value.title}
                    variants={fadeUp}
                    transition={{ duration: 0.6 }}
                    className="group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.02] p-7 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:bg-white/[0.035]"
                  >
                    <div
                      className={`absolute right-[-50px] top-[-50px] h-36 w-36 rounded-full bg-gradient-to-br ${value.gradient} opacity-[0.05] blur-3xl transition-opacity duration-500 group-hover:opacity-10`}
                    />

                    <div className="relative">
                      <div className="flex items-center justify-between">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.04]">
                          <Icon size={21} className="text-cyan-400" />
                        </div>
                        <CheckCircle2
                          size={18}
                          className="text-slate-700 transition-colors group-hover:text-cyan-400"
                        />
                      </div>

                      <h3 className="mt-6 text-xl font-bold text-white">
                        {value.title}
                      </h3>

                      <p className="mt-3 text-sm leading-7 text-slate-500">
                        {value.description}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </div>
      </section>

      {/* =====================================================
          CTA
      ===================================================== */}
      <section className="relative overflow-hidden py-24 sm:py-32">
        <div className="absolute inset-x-0 top-0 mx-auto h-px max-w-5xl bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent" />
        <div className="absolute left-1/2 top-1/2 h-[400px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/[0.05] blur-[120px]" />

        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-400/15 bg-cyan-400/[0.06]">
              <GraduationCap size={28} className="text-cyan-400" />
            </div>

            <h2 className="mt-7 text-3xl font-black tracking-tight text-white sm:text-4xl md:text-5xl">
              Your learning journey
              <br />
              <span className="bg-gradient-to-r from-cyan-300 to-blue-500 bg-clip-text text-transparent">
                starts here.
              </span>
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-400">
              Explore Scholiqen, discover new ways to learn and take the next
              step toward becoming the best version of yourself.
            </p>

            <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
              <a
                href="/academy/sign-in"
                className="group inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-7 py-3.5 text-sm font-bold text-slate-950 shadow-xl shadow-cyan-500/15 transition-all duration-300 hover:-translate-y-1"
              >
                Get Started
                <ArrowRight
                  size={18}
                  className="transition-transform group-hover:translate-x-1"
                />
              </a>

              <a
                href="/community"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-7 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:border-cyan-400/20 hover:bg-white/[0.06]"
              >
                Join the Community
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* =====================================================
          FOOTER
      ===================================================== */}
      <footer className="border-t border-white/[0.06] bg-[#01040d]">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            {/* BRAND */}
            <div className="flex items-center gap-3">
              <img
                src={Cog}
                alt="Scholiqen"
                className="h-10 w-10 object-contain"
              />
              <div>
                <p className="font-black text-white">Scholiqen</p>
                <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-cyan-400">
                  Academy
                </p>
              </div>
            </div>

            {/* LINKS */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-slate-500">
              <a href="/academy" className="transition hover:text-cyan-400">
                Academy
              </a>
              <a href="/academics" className="transition hover:text-cyan-400">
                Academics
              </a>
              <a href="/resources" className="transition hover:text-cyan-400">
                Resources
              </a>
              <a href="/community" className="transition hover:text-cyan-400">
                Community
              </a>
            </div>
          </div>

          <div className="mt-10 border-t border-white/[0.05] pt-6">
            <p className="text-center text-xs text-slate-600">
              © {new Date().getFullYear()} Scholiqen Academy. Learn. Grow. Become
              more.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}