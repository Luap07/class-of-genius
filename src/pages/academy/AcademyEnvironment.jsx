import React from "react";
import { Link } from "react-router-dom";

import {
  ArrowRight,
  BookOpen,
  GraduationCap,
  Users,
  Trophy,
  FlaskConical,
  FileText,
  BookMarked,
  ChevronRight,
  Search,
  Bell,
  User,
  Sparkles,
  School,
  Laptop,
  CheckCircle2,
  ShieldCheck,
  Brain,
} from "lucide-react";

import cogLogo from "../../assets/cog.png";
import hero from "../../assets/hero.jpeg";
import connect from "../../assets/connect.png";
import schoolImage from "../../assets/school.jpg";

const navItems = [
  { label: "Home", href: "/academy" },
  { label: "Academics", href: "/academics" },
  { label: "Resources", href: "/resources" },
  { label: "Community", href: "/community" },
  { label: "OurStory", href: "/our-story" },
];

const learningFeatures = [
  {
    icon: GraduationCap,
    title: "Primary Education",
    description:
      "Build strong academic foundations through structured, engaging learning experiences.",
  },
  {
    icon: BookOpen,
    title: "Secondary Education",
    description:
      "Develop deeper subject knowledge, critical thinking, and examination readiness.",
  },
  {
    icon: Users,
    title: "Tutor Guided",
    description:
      "Access academic guidance and support whenever students need an extra hand.",
  },
  {
    icon: Laptop,
    title: "Digital School",
    description:
      "Extend learning beyond the classroom with flexible digital learning tools.",
  },
];

const ecosystem = [
  {
    icon: BookOpen,
    title: "Structured Learning",
    description:
      "Organised academic content designed to help students learn progressively.",
  },
  {
    icon: Brain,
    title: "Smart Learning Tools",
    description:
      "Technology-powered tools that make learning more interactive and personalised.",
  },
  {
    icon: FlaskConical,
    title: "Virtual Laboratory",
    description:
      "Explore practical science concepts through an immersive digital environment.",
  },
  {
    icon: FileText,
    title: "CBT & Examination Practice",
    description:
      "Prepare for examinations with realistic computer-based practice and assessments.",
  },
  {
    icon: BookMarked,
    title: "Novel & Reading Experience",
    description:
      "Build stronger reading habits with access to books, novels, and learning materials.",
  },
  {
    icon: Trophy,
    title: "Achievements",
    description:
      "Celebrate progress, milestones, academic growth, and student accomplishments.",
  },
];

const stats = [
  {
    value: "01",
    label: "Connected Academy",
  },
  {
    value: "24/7",
    label: "Digital Access",
  },
  {
    value: "100%",
    label: "Student Focused",
  },
  {
    value: "∞",
    label: "Room to Grow",
  },
];

const principles = [
  "Strong academic foundations",
  "Technology-enhanced learning",
  "Student-centred experience",
  "Examination preparation",
  "Continuous academic support",
  "Future-ready skills",
];

const quickAccess = [
  {
    icon: FlaskConical,
    title: "Virtual Lab",
    description: "Explore practical learning",
    href: "/lab",
  },
  {
    icon: Brain,
    title: "AI Tutor",
    description: "Get intelligent academic help",
    href: "/ai-tutor",
  },
  {
    icon: FileText,
    title: "CBT Practice",
    description: "Test your knowledge",
    href: "/cbt",
  },
  {
    icon: BookMarked,
    title: "Novel Library",
    description: "Read and discover",
    href: "/novels",
  },
];

export default function AcademyEnvironment() {
  return (
    <div className="min-h-screen overflow-hidden bg-[#020617] text-white">

      {/* =========================================================
          ANIMATION STYLES
      ========================================================= */}
      <style>{`
        @keyframes heroZoom {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.045);
          }
        }

        @keyframes floatSlow {
          0%, 100% {
            transform: translate3d(0, 0, 0);
          }
          50% {
            transform: translate3d(0, -14px, 0);
          }
        }

        @keyframes floatReverse {
          0%, 100% {
            transform: translate3d(0, 0, 0);
          }
          50% {
            transform: translate3d(0, 12px, 0);
          }
        }

        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translate3d(0, 24px, 0);
          }
          to {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }

        @keyframes fadeRight {
          from {
            opacity: 0;
            transform: translate3d(-20px, 0, 0);
          }
          to {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-120%);
          }
          100% {
            transform: translateX(120%);
          }
        }

        @keyframes pulseSoft {
          0%, 100% {
            opacity: .35;
            transform: scale(1);
          }
          50% {
            opacity: .65;
            transform: scale(1.08);
          }
        }

        @keyframes borderGlow {
          0%, 100% {
            opacity: .25;
          }
          50% {
            opacity: .7;
          }
        }

        .academy-hero-image {
          animation: heroZoom 18s ease-in-out infinite;
        }

        .academy-float {
          animation: floatSlow 7s ease-in-out infinite;
        }

        .academy-float-reverse {
          animation: floatReverse 8s ease-in-out infinite;
        }

        .academy-fade-up {
          animation: fadeUp .8s cubic-bezier(.22, 1, .36, 1) both;
        }

        .academy-fade-right {
          animation: fadeRight .8s cubic-bezier(.22, 1, .36, 1) both;
        }

        .academy-delay-1 {
          animation-delay: .12s;
        }

        .academy-delay-2 {
          animation-delay: .24s;
        }

        .academy-delay-3 {
          animation-delay: .36s;
        }

        .academy-delay-4 {
          animation-delay: .48s;
        }

        .academy-pulse {
          animation: pulseSoft 5s ease-in-out infinite;
        }

        .academy-border-glow {
          animation: borderGlow 4s ease-in-out infinite;
        }

        .academy-shimmer {
          position: absolute;
          inset: 0;
          width: 45%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255,255,255,.045),
            transparent
          );
          transform: translateX(-120%);
          animation: shimmer 7s ease-in-out infinite;
          pointer-events: none;
        }

        @media (prefers-reduced-motion: reduce) {
          .academy-hero-image,
          .academy-float,
          .academy-float-reverse,
          .academy-fade-up,
          .academy-fade-right,
          .academy-pulse,
          .academy-border-glow,
          .academy-shimmer {
            animation: none !important;
          }
        }
      `}</style>

      {/* =========================================================
          HEADER
      ========================================================= */}
      <header className="fixed inset-x-0 top-0 z-[100] border-b border-white/[0.06] bg-[#020617]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-8">

          {/* Logo */}
          <Link
            to="/academy"
            className="group flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-white transition duration-300 group-hover:scale-105">
              <img
                src={cogLogo}
                alt="Scholiqen"
                className="h-full w-full object-contain"
              />
            </div>

            <div className="hidden sm:block">
              <div className="text-sm font-bold tracking-wide text-white">
                SCHOLIQEN
              </div>

              <div className="text-[10px] font-medium uppercase tracking-[0.2em] text-slate-500">
                Academy
              </div>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden items-center gap-1 lg:flex">
            {navItems.map((item, index) => (
              <Link
                key={item.label}
                to={item.href}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition duration-300 ${
                  index === 0
                    ? "bg-white/[0.08] text-white"
                    : "text-slate-400 hover:bg-white/[0.05] hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="hidden h-10 w-10 items-center justify-center rounded-xl text-slate-400 transition duration-300 hover:bg-white/[0.06] hover:text-white sm:flex"
            >
              <Search size={18} />
            </button>

            <button
              type="button"
              className="hidden h-10 w-10 items-center justify-center rounded-xl text-slate-400 transition duration-300 hover:bg-white/[0.06] hover:text-white sm:flex"
            >
              <Bell size={18} />
            </button>

            <Link
            to="/academy/sign-in"              
            className="group flex h-10 items-center gap-2 rounded-xl border border-white/[0.1] bg-white/[0.04] px-4 text-sm font-semibold text-white transition duration-300 hover:border-white/[0.18] hover:bg-white/[0.08]"
            >
              <User
                size={16}
                className="transition-transform duration-300 group-hover:scale-110"
              />

              <span className="hidden sm:inline">
                Enroll now 
              </span>
            </Link>
          </div>
        </div>
      </header>

      {/* =========================================================
          HERO
      ========================================================= */}
      <section className="relative isolate min-h-[760px] overflow-hidden pt-20">

        {/* HERO IMAGE */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img
            src={hero}
            alt="Scholiqen Academy"
            className="academy-hero-image h-full w-full object-cover object-center"
          />
        </div>

        {/* Main dark overlay */}
        <div className="absolute inset-0 z-10 bg-[#020617]/20" />

        {/* Left cinematic gradient */}
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-[#020617] via-[#020617]/75 to-[#020617]/20" />

        {/* Bottom fade */}
        <div className="absolute inset-x-0 bottom-0 z-10 h-80 bg-gradient-to-t from-[#020617] via-[#020617]/85 to-transparent" />

        {/* Top fade */}
        <div className="absolute inset-x-0 top-0 z-10 h-52 bg-gradient-to-b from-[#020617]/65 to-transparent" />

        {/* Decorative glows */}
        <div className="academy-pulse absolute left-[8%] top-[22%] z-10 h-72 w-72 rounded-full bg-blue-600/10 blur-[110px]" />

        <div className="academy-float-reverse absolute right-[8%] top-[24%] z-10 h-96 w-96 rounded-full bg-cyan-500/10 blur-[130px]" />

        {/* Hero Content */}
        <div className="relative z-20 mx-auto flex min-h-[680px] max-w-7xl items-center px-5 py-20 sm:px-6 lg:px-8">
          <div className="max-w-3xl">

            {/* Badge */}
            <div className="academy-fade-right inline-flex items-center gap-2 rounded-full border border-white/[0.1] bg-white/[0.06] px-4 py-2 backdrop-blur-md">
              <Sparkles
                size={14}
                className="text-cyan-300"
              />

              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
                The Scholiqen Academy
              </span>
            </div>

            {/* Heading */}
            <h1 className="academy-fade-up academy-delay-1 mt-7 text-5xl font-black leading-[0.98] tracking-[-0.04em] text-white sm:text-6xl lg:text-7xl">
              A smarter

              <span className="block bg-gradient-to-r from-cyan-300 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
                environment for learning.
              </span>
            </h1>

            {/* Description */}
            <p className="academy-fade-up academy-delay-2 mt-7 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
              Scholiqen Academy brings academics, technology, resources,
              guidance, and student experiences together in one connected
              learning environment.
            </p>

            {/* CTA */}
            <div className="academy-fade-up academy-delay-3 mt-9 flex flex-col gap-3 sm:flex-row">

              <Link
                to="/academics"
                className="group inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-slate-950 shadow-xl shadow-black/20 transition duration-300 hover:-translate-y-0.5 hover:bg-slate-100"
              >
                Explore Academics

                <ArrowRight
                  size={17}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </Link>

              <Link
                to="/resources"
                className="group inline-flex items-center justify-center gap-2 rounded-xl border border-white/[0.15] bg-white/[0.05] px-6 py-3.5 text-sm font-bold text-white backdrop-blur-md transition duration-300 hover:-translate-y-0.5 hover:bg-white/[0.1]"
              >
                Explore Resources

                <ChevronRight
                  size={17}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </Link>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="absolute inset-x-0 bottom-0 z-30">
          <div className="mx-auto max-w-7xl px-5 pb-7 sm:px-6 lg:px-8">

            <div className="academy-fade-up academy-delay-4 grid grid-cols-2 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#020617]/75 shadow-2xl shadow-black/30 backdrop-blur-xl lg:grid-cols-4">
              {stats.map((stat, index) => (
                <div
                  key={stat.label}
                  className={`group px-5 py-5 transition duration-300 hover:bg-white/[0.03] sm:px-7 ${
                    index !== stats.length - 1
                      ? "border-b border-white/[0.06] lg:border-b-0 lg:border-r"
                      : ""
                  }`}
                >
                  <div className="text-2xl font-black tracking-tight text-white transition duration-300 group-hover:text-cyan-300">
                    {stat.value}
                  </div>

                  <div className="mt-1 text-xs font-medium uppercase tracking-[0.12em] text-slate-500">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================
          INTRO
      ========================================================= */}
      <section className="relative z-20 bg-[#020617] px-5 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">

          <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:items-end">

            <div className="academy-fade-up">
              <div className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">
                Learning without limits
              </div>

              <h2 className="max-w-xl text-4xl font-black tracking-[-0.035em] text-white sm:text-5xl">
                Everything students need to move forward.
              </h2>
            </div>

            <div className="academy-fade-up academy-delay-1">
              <p className="text-base leading-8 text-slate-400">
                The Academy is designed around the complete student journey.
                From foundational education to examination preparation,
                digital resources, practical experiences, and continuous
                support, every part of the environment works together.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================
          LEARNING FEATURES
      ========================================================= */}
      <section className="relative z-20 border-y border-white/[0.05] bg-[#030a1b] px-5 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">

          <div className="mb-14 max-w-2xl">
            <div className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-blue-400">
              Learning experience
            </div>

            <h2 className="text-4xl font-black tracking-[-0.035em] text-white sm:text-5xl">
              Built around how students learn.
            </h2>

            <p className="mt-5 text-base leading-7 text-slate-400">
              A flexible academic environment that combines structured
              learning with the tools students need to understand, practise,
              and grow.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {learningFeatures.map((feature) => {
              const Icon = feature.icon;

              return (
                <div
                  key={feature.title}
                  className="group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.025] p-7 transition duration-500 hover:-translate-y-1 hover:border-cyan-400/[0.2] hover:bg-white/[0.045]"
                >
                  {/* Hover glow */}
                  <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-cyan-500/0 blur-3xl transition duration-500 group-hover:bg-cyan-500/10" />

                  <div className="relative z-10">
                    <div className="mb-7 flex h-12 w-12 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.05] transition duration-300 group-hover:scale-105 group-hover:border-cyan-400/20">
                      <Icon
                        size={22}
                        className="text-cyan-300"
                      />
                    </div>

                    <h3 className="text-lg font-bold text-white">
                      {feature.title}
                    </h3>

                    <p className="mt-3 text-sm leading-6 text-slate-400">
                      {feature.description}
                    </p>

                    <Link
                      to="/academics"
                      className="mt-6 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.12em] text-slate-300 transition duration-300 group-hover:text-cyan-300"
                    >
                      Learn more

                      <ArrowRight
                        size={14}
                        className="transition-transform duration-300 group-hover:translate-x-1"
                      />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* =========================================================
          CONNECTED LEARNING
      ========================================================= */}
      <section className="relative z-20 overflow-hidden bg-[#020617] px-5 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">

          <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">

            {/* CONNECT IMAGE */}
            <div className="relative min-h-[600px] overflow-hidden rounded-[2rem] border border-white/[0.08] bg-[#020617] shadow-2xl shadow-black/20 lg:sticky lg:top-28 lg:self-start">

              <img
                src={connect}
                alt="Connected learning environment"
                className="absolute inset-0 z-0 h-full w-full object-cover transition duration-[1.5s] hover:scale-105"
              />

              {/* Strong dark overlay */}
              <div className="absolute inset-0 z-10 bg-[#020617]/55" />

              <div className="absolute inset-0 z-10 bg-gradient-to-b from-[#020617]/55 via-[#020617]/70 to-[#020617]/95" />

              <div className="absolute inset-0 z-10 bg-gradient-to-r from-[#020617]/80 via-transparent to-blue-950/20" />

              {/* Content */}
              <div className="relative z-20 flex min-h-[600px] flex-col justify-between p-8 sm:p-10 lg:p-12">

                <div>
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-white/[0.12] bg-white/[0.08] backdrop-blur-md">
                    <School
                      size={22}
                      className="text-cyan-300"
                    />
                  </div>

                  <div className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">
                    Connected learning
                  </div>

                  <h2 className="mt-4 text-4xl font-black leading-tight tracking-[-0.035em] text-white sm:text-5xl">
                    One environment.

                    <span className="block text-slate-400">
                      Multiple ways to learn.
                    </span>
                  </h2>

                  <p className="mt-6 max-w-lg text-sm leading-7 text-slate-300">
                    Learning doesn't stop when the classroom ends. Scholiqen
                    connects academic content, digital tools, practical
                    experiences, reading, assessment, and support into one
                    environment.
                  </p>
                </div>

                <div className="mt-12">

                  <div className="flex items-center gap-3 text-sm font-semibold text-white">
                    <CheckCircle2
                      size={18}
                      className="text-cyan-300"
                    />
                    Everything connected in one place
                  </div>

                  <div className="mt-3 flex items-center gap-3 text-sm font-semibold text-white">
                    <CheckCircle2
                      size={18}
                      className="text-cyan-300"
                    />
                    Designed around student progress
                  </div>

                  <div className="mt-3 flex items-center gap-3 text-sm font-semibold text-white">
                    <CheckCircle2
                      size={18}
                      className="text-cyan-300"
                    />
                    Built for the future of education
                  </div>

                </div>
              </div>
            </div>

            {/* ECOSYSTEM */}
            <div>
              <div className="mb-8">
                <div className="text-xs font-bold uppercase tracking-[0.2em] text-blue-400">
                  Academy ecosystem
                </div>

                <h3 className="mt-3 text-3xl font-black tracking-[-0.03em] text-white">
                  A complete learning toolkit.
                </h3>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {ecosystem.map((item, index) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.title}
                      className="group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-[#071022] p-6 transition duration-500 hover:-translate-y-1 hover:border-cyan-400/[0.18]"
                    >
                      <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-blue-500/0 blur-2xl transition duration-500 group-hover:bg-blue-500/15" />

                      <div className="relative z-20">
                        <div className="flex items-start justify-between">

                          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] transition duration-300 group-hover:scale-105">
                            <Icon
                              size={20}
                              className="text-cyan-300"
                            />
                          </div>

                          <span className="text-xs font-bold text-slate-600">
                            0{index + 1}
                          </span>
                        </div>

                        <h4 className="mt-6 text-base font-bold text-white">
                          {item.title}
                        </h4>

                        <p className="mt-2 text-sm leading-6 text-slate-400">
                          {item.description}
                        </p>

                        <div className="mt-5 flex items-center gap-1 text-xs font-bold text-slate-500 transition duration-300 group-hover:text-cyan-300">
                          Explore

                          <ChevronRight
                            size={14}
                            className="transition-transform duration-300 group-hover:translate-x-1"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================
          WHY SCHOLIQEN
      ========================================================= */}
      <section className="relative z-20 border-y border-white/[0.05] bg-[#030a1b] px-5 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">

          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">

            {/* IMAGE */}
            <div className="group relative overflow-hidden rounded-[2rem] border border-white/[0.08] bg-[#020617]">

              <img
                src={schoolImage}
                alt="Students learning at Scholiqen Academy"
                className="h-[520px] w-full object-cover object-center grayscale-[10%] brightness-[0.55] transition duration-[1.2s] group-hover:scale-105 group-hover:brightness-[0.62]"
              />

              {/* MUCH DARKER OVERLAY */}
              <div className="absolute inset-0 bg-[#020617]/30" />

              <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/20 to-[#020617]/5" />

              <div className="absolute inset-0 bg-gradient-to-r from-[#020617]/40 via-transparent to-[#020617]/20" />

              <div className="absolute bottom-7 left-7 right-7">

                <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.1] bg-[#020617]/80 px-4 py-2 text-xs font-semibold text-white shadow-xl backdrop-blur-xl">
                  <ShieldCheck
                    size={15}
                    className="text-cyan-300"
                  />
                  Built around students
                </div>

              </div>
            </div>

            {/* CONTENT */}
            <div>

              <div className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">
                Why Scholiqen
              </div>

              <h2 className="mt-4 text-4xl font-black tracking-[-0.035em] text-white sm:text-5xl">
                Education that prepares students for more.
              </h2>

              <p className="mt-6 text-base leading-8 text-slate-400">
                Scholiqen Academy is more than a place to access lessons. It
                is an environment designed to help students build knowledge,
                confidence, independence, and the skills required for the next
                stage of their journey.
              </p>

              <div className="mt-8 space-y-4">
                {principles.map((principle) => (
                  <div
                    key={principle}
                    className="group flex items-center gap-3 text-sm font-medium text-slate-300"
                  >
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-400/10 transition duration-300 group-hover:bg-cyan-400/20">
                      <CheckCircle2
                        size={15}
                        className="text-cyan-300"
                      />
                    </div>

                    {principle}
                  </div>
                ))}
              </div>

              <Link
                to="/OurStory"
                className="group mt-9 inline-flex items-center gap-2 rounded-xl border border-white/[0.1] bg-white/[0.04] px-5 py-3 text-sm font-bold text-white transition duration-300 hover:-translate-y-0.5 hover:bg-white/[0.08]"
              >
                Discover Scholiqen

                <ArrowRight
                  size={16}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </Link>

            </div>
          </div>

        </div>
      </section>

      {/* =========================================================
          QUICK ACCESS
      ========================================================= */}
      <section className="relative z-20 bg-[#020617] px-5 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">

          <div className="mb-12 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">

            <div>
              <div className="text-xs font-bold uppercase tracking-[0.2em] text-blue-400">
                Quick access
              </div>

              <h2 className="mt-3 text-3xl font-black tracking-[-0.03em] text-white sm:text-4xl">
                Go straight to what you need.
              </h2>
            </div>

            <Link
              to="/resources"
              className="group inline-flex items-center gap-2 text-sm font-bold text-slate-400 transition duration-300 hover:text-white"
            >
              View all resources

              <ArrowRight
                size={16}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>

          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {quickAccess.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.title}
                  to={item.href}
                  className="group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.025] p-6 transition duration-500 hover:-translate-y-1 hover:border-cyan-400/[0.18] hover:bg-white/[0.045]"
                >
                  <div className="absolute -right-12 -top-12 h-28 w-28 rounded-full bg-blue-500/0 blur-3xl transition duration-500 group-hover:bg-cyan-500/10" />

                  <div className="relative z-10">

                    <div className="flex items-center justify-between">

                      <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.05] transition duration-300 group-hover:scale-105">
                        <Icon
                          size={20}
                          className="text-cyan-300"
                        />
                      </div>

                      <ArrowRight
                        size={17}
                        className="text-slate-600 transition duration-300 group-hover:translate-x-1 group-hover:text-white"
                      />
                    </div>

                    <h3 className="mt-7 text-base font-bold text-white">
                      {item.title}
                    </h3>

                    <p className="mt-2 text-sm text-slate-500">
                      {item.description}
                    </p>

                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================
          START THE JOURNEY — UPGRADED
      ========================================================= */}
      <section className="relative z-20 px-5 pb-24 sm:px-6 lg:px-8">

        <div className="mx-auto max-w-7xl">

          <div className="group relative overflow-hidden rounded-[2rem] border border-white/[0.09] bg-[#040b1b] shadow-[0_30px_100px_rgba(0,0,0,0.35)]">

            {/* =====================================================
                BACKGROUND LAYERS
            ===================================================== */}

            {/* Grid texture */}
            <div
              className="absolute inset-0 opacity-[0.12]"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)
                `,
                backgroundSize: "42px 42px",
              }}
            />

            {/* Main blue spotlight */}
            <div className="academy-pulse absolute -right-32 -top-40 h-[520px] w-[520px] rounded-full bg-blue-600/15 blur-[120px]" />

            {/* Cyan spotlight */}
            <div className="academy-float absolute -bottom-40 left-[30%] h-[420px] w-[420px] rounded-full bg-cyan-500/10 blur-[120px]" />

            {/* Small floating light */}
            <div className="academy-float-reverse absolute right-[22%] top-[35%] h-32 w-32 rounded-full bg-indigo-500/10 blur-[60px]" />

            {/* Animated inner border */}
            <div className="academy-border-glow pointer-events-none absolute inset-3 rounded-[1.7rem] border border-cyan-400/10" />

            {/* Shimmer */}
            <div className="academy-shimmer z-10" />

            {/* =====================================================
                CONTENT
            ===================================================== */}
            <div className="relative z-20 px-7 py-16 sm:px-12 sm:py-20 lg:px-16 lg:py-24">

              <div className="max-w-4xl">

                {/* Eyebrow */}
                <div className="academy-fade-up inline-flex items-center gap-2 rounded-full border border-cyan-300/15 bg-cyan-300/[0.06] px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-cyan-200 backdrop-blur-md">

                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-300 opacity-50" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-300" />
                  </span>

                  Start the journey
                </div>

                {/* Heading */}
                <h2 className="academy-fade-up academy-delay-1 mt-7 max-w-4xl text-4xl font-black leading-[1.03] tracking-[-0.04em] text-white sm:text-5xl lg:text-6xl">
                  Give learning a{" "}
                  <span className="bg-gradient-to-r from-white via-cyan-100 to-blue-300 bg-clip-text text-transparent">
                    better environment.
                  </span>
                </h2>

                {/* Description */}
                <p className="academy-fade-up academy-delay-2 mt-6 max-w-2xl text-base leading-8 text-slate-400 sm:text-lg">
                  Discover an academy built to support students through every
                  stage of their educational journey — from the classroom to
                  digital learning, practice, discovery, and beyond.
                </p>

                {/* CTA */}
                <div className="academy-fade-up academy-delay-3 mt-9 flex flex-col gap-3 sm:flex-row">

                  <Link
                    to="/academy/sign-in"
                    className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-slate-950 shadow-xl shadow-black/20 transition duration-300 hover:-translate-y-1 hover:bg-slate-100"
                  >
                    <span className="relative z-10">
                      Explore Admissions
                    </span>

                    <ArrowRight
                      size={17}
                      className="relative z-10 transition-transform duration-300 group-hover:translate-x-1"
                    />

                    {/* Button shimmer */}
                    <span className="absolute inset-y-0 left-[-100%] w-1/2 skew-x-[-20deg] bg-white/40 transition-all duration-700 group-hover:left-[140%]" />
                  </Link>

                  <Link
                    to="/community"
                    className="group inline-flex items-center justify-center gap-2 rounded-xl border border-white/[0.12] bg-white/[0.04] px-6 py-3.5 text-sm font-bold text-white backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:border-white/[0.2] hover:bg-white/[0.08]"
                  >
                    Join the Community

                    <Users
                      size={17}
                      className="transition-transform duration-300 group-hover:scale-110"
                    />
                  </Link>

                </div>

                {/* Bottom trust row */}
                <div className="academy-fade-up academy-delay-4 mt-12 flex flex-wrap items-center gap-x-7 gap-y-4 border-t border-white/[0.07] pt-7">

                  <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                    <CheckCircle2
                      size={15}
                      className="text-cyan-300"
                    />
                    Student focused
                  </div>

                  <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                    <CheckCircle2
                      size={15}
                      className="text-cyan-300"
                    />
                    Digital first
                  </div>

                  <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                    <CheckCircle2
                      size={15}
                      className="text-cyan-300"
                    />
                    Built for growth
                  </div>

                </div>

              </div>

              {/* Decorative right-side mark */}
              <div className="academy-float pointer-events-none absolute bottom-8 right-8 hidden h-36 w-36 items-center justify-center rounded-full border border-white/[0.06] bg-white/[0.02] lg:flex">

                <div className="flex h-24 w-24 items-center justify-center rounded-full border border-cyan-300/[0.12] bg-cyan-300/[0.025]">

                  <GraduationCap
                    size={40}
                    strokeWidth={1.2}
                    className="text-cyan-300/60"
                  />

                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          FOOTER
      ========================================================= */}
      <footer className="relative z-20 border-t border-white/[0.06] bg-[#01040d] px-5 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">

          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">

            {/* Brand */}
            <div>
              <Link
                to="/academy"
                className="group flex items-center gap-3"
              >
                <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-white transition duration-300 group-hover:scale-105">
                  <img
                    src={cogLogo}
                    alt="Scholiqen"
                    className="h-full w-full object-contain"
                  />
                </div>

                <div>
                  <div className="text-sm font-bold tracking-wide text-white">
                    SCHOLIQEN
                  </div>

                  <div className="text-[10px] uppercase tracking-[0.2em] text-slate-600">
                    Academy
                  </div>
                </div>
              </Link>

              <p className="mt-5 max-w-xs text-sm leading-6 text-slate-500">
                A connected learning environment designed to help every
                student learn, grow, and move forward.
              </p>
            </div>

            {/* Academy */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-[0.16em] text-slate-300">
                Academy
              </h4>

              <div className="mt-5 space-y-3">

                <Link
                  to="/academics"
                  className="block text-sm text-slate-500 transition duration-300 hover:text-white"
                >
                  Academics
                </Link>

                <Link
                  to="/resources"
                  className="block text-sm text-slate-500 transition duration-300 hover:text-white"
                >
                  Resources
                </Link>

                <Link
                  to="/community"
                  className="block text-sm text-slate-500 transition duration-300 hover:text-white"
                >
                  Community
                </Link>

                <Link
                  to="/OurStory"
                  className="block text-sm text-slate-500 transition duration-300 hover:text-white"
                >
                  About
                </Link>

              </div>
            </div>

            {/* Resources */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-[0.16em] text-slate-300">
                Resources
              </h4>

              <div className="mt-5 space-y-3">

                <Link
                  to="/virtual-lab"
                  className="block text-sm text-slate-500 transition duration-300 hover:text-white"
                >
                  Virtual Lab
                </Link>

                <Link
                  to="/ai-tutor"
                  className="block text-sm text-slate-500 transition duration-300 hover:text-white"
                >
                  AI Tutor
                </Link>

                <Link
                  to="/cbt"
                  className="block text-sm text-slate-500 transition duration-300 hover:text-white"
                >
                  CBT Practice
                </Link>

                <Link
                  to="/library"
                  className="block text-sm text-slate-500 transition duration-300 hover:text-white"
                >
                  Novel Library
                </Link>

              </div>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-[0.16em] text-slate-300">
                Support
              </h4>

              <div className="mt-5 space-y-3">

                <Link
                  to="/admissions"
                  className="block text-sm text-slate-500 transition duration-300 hover:text-white"
                >
                  Admissions
                </Link>

                <Link
                  to="/community"
                  className="block text-sm text-slate-500 transition duration-300 hover:text-white"
                >
                  Student Community
                </Link>

                <Link
                  to="/contact"
                  className="block text-sm text-slate-500 transition duration-300 hover:text-white"
                >
                  Contact
                </Link>

                <Link
                  to="/help"
                  className="block text-sm text-slate-500 transition duration-300 hover:text-white"
                >
                  Help Centre
                </Link>

              </div>
            </div>

          </div>

          <div className="mt-12 flex flex-col justify-between gap-4 border-t border-white/[0.06] pt-7 text-xs text-slate-600 sm:flex-row">

            <p>
              © {new Date().getFullYear()} Scholiqen Academy. All rights reserved.
            </p>

            <div className="flex gap-5">

              <Link
                to="/privacy"
                className="transition duration-300 hover:text-slate-300"
              >
                Privacy
              </Link>

              <Link
                to="/terms"
                className="transition duration-300 hover:text-slate-300"
              >
                Terms
              </Link>

            </div>
          </div>

        </div>
      </footer>
    </div>
  );
}