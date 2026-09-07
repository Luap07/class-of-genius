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
import schoolImage from "../../assets/school.jpg";

const AcademyEnvironment = () => {
  const navItems = [
    { label: "Home", path: "/academy" },
    { label: "Academics", path: "/academics" },
    { label: "Resources", path: "/resources" },
    { label: "Community", path: "/community" },
    { label: "About", path: "/about" },
  ];

  const learningFeatures = [
    {
      icon: GraduationCap,
      title: "Primary Education",
      description:
        "A strong academic foundation designed to build confidence, curiosity, discipline and independent learning.",
      accent: "from-cyan-400 to-blue-500",
    },
    {
      icon: School,
      title: "Secondary Education",
      description:
        "Structured secondary education with subject depth, examination preparation and future-focused learning.",
      accent: "from-blue-400 to-indigo-500",
    },
    {
      icon: Users,
      title: "Tutor Guided",
      description:
        "Students learn with structured guidance, academic support and a learning environment built around progress.",
      accent: "from-indigo-400 to-purple-500",
    },
    {
      icon: Laptop,
      title: "Digital School",
      description:
        "Access lessons, academic resources, CBT practice and digital learning tools from one connected platform.",
      accent: "from-purple-400 to-fuchsia-500",
    },
  ];

  const ecosystem = [
    {
      icon: BookOpen,
      title: "Structured Learning",
      text: "Organised academic pathways that make learning easier to follow and measure.",
    },
    {
      icon: Brain,
      title: "Smart Learning Tools",
      text: "Modern digital tools designed to support understanding, revision and academic growth.",
    },
    {
      icon: FlaskConical,
      title: "Virtual Laboratory",
      text: "Explore scientific concepts through interactive digital practical experiences.",
    },
    {
      icon: FileText,
      title: "CBT & Examination Practice",
      text: "Prepare with structured computer-based tests and examination-focused practice.",
    },
    {
      icon: BookMarked,
      title: "Novel & Reading Experience",
      text: "Develop stronger reading habits with an engaging digital reading environment.",
    },
    {
      icon: Trophy,
      title: "Achievements",
      text: "Celebrate milestones and encourage students to keep improving.",
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
      text: "Interactive science learning",
      path: "/virtual-lab",
    },
    {
      icon: Sparkles,
      title: "AI Tutor",
      text: "Intelligent academic support",
      path: "/ai-tutor",
    },
    {
      icon: FileText,
      title: "CBT Practice",
      text: "Prepare for examinations",
      path: "/cbt",
    },
    {
      icon: BookMarked,
      title: "Novel Library",
      text: "Read and explore",
      path: "/novel",
    },
  ];

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#020617] text-white">
      {/* =========================================================
          GLOBAL BACKGROUND
      ========================================================= */}

      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute left-[-15%] top-[8%] h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-[140px]" />

        <div className="absolute right-[-15%] top-[38%] h-[600px] w-[600px] rounded-full bg-blue-600/10 blur-[160px]" />

        <div className="absolute bottom-[-15%] left-[30%] h-[500px] w-[500px] rounded-full bg-indigo-600/10 blur-[150px]" />

        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "30px 30px",
          }}
        />
      </div>

      {/* =========================================================
          HEADER
      ========================================================= */}

      <header className="fixed inset-x-0 top-0 z-50">
        <div className="border-b border-white/[0.07] bg-[#020617]/80 backdrop-blur-2xl">
          <div className="mx-auto flex h-[78px] max-w-[1600px] items-center justify-between px-5 sm:px-8 lg:px-12">
            {/* LOGO */}

            <Link
              to="/academy"
              className="group flex items-center gap-3"
            >
              <div className="relative">
                <div className="absolute inset-0 rounded-xl bg-cyan-400/20 blur-xl transition group-hover:bg-cyan-400/30" />

                <div className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-400/20 bg-white/[0.06] p-2 shadow-2xl">
                  <img
                    src={cogLogo}
                    alt="Class Of Genius"
                    className="h-full w-full object-contain"
                  />
                </div>
              </div>

              <div className="hidden text-left sm:block">
                <div className="text-sm font-semibold tracking-wide text-white">
                  Scholiqen
                </div>

                <div className="text-[10px] font-medium uppercase tracking-[0.25em] text-cyan-300/70">
                  Academy
                </div>
              </div>
            </Link>

            {/* DESKTOP NAVIGATION */}

            <nav className="hidden items-center gap-1 lg:flex">
              {navItems.map((item, index) => (
                <Link
                  key={item.label}
                  to={item.path}
                  className={`relative rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                    index === 0
                      ? "text-white"
                      : "text-slate-400 hover:bg-white/[0.04] hover:text-white"
                  }`}
                >
                  {item.label}

                  {index === 0 && (
                    <span className="absolute bottom-0 left-1/2 h-[2px] w-5 -translate-x-1/2 rounded-full bg-cyan-400" />
                  )}
                </Link>
              ))}
            </nav>

            {/* DESKTOP ACTIONS */}

            <div className="hidden items-center gap-2 md:flex">
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03] text-slate-400 transition hover:border-cyan-400/20 hover:bg-white/[0.06] hover:text-white"
                aria-label="Search"
              >
                <Search size={17} />
              </button>

              <button
                type="button"
                className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03] text-slate-400 transition hover:border-cyan-400/20 hover:bg-white/[0.06] hover:text-white"
                aria-label="Notifications"
              >
                <Bell size={17} />

                <span className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
              </button>

              <Link
                to="/academy/student-enrollment-login"
                className="ml-1 flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-white transition hover:border-cyan-400/20 hover:bg-white/[0.08]"
              >
                <User size={16} />
                Student
              </Link>

              <Link
                to="/academy/student-enrollment-login"
                className="group ml-1 flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-5 py-2.5 text-sm font-bold text-slate-950 shadow-lg shadow-cyan-500/10 transition hover:-translate-y-0.5 hover:shadow-cyan-500/20"
              >
                Enroll Now

                <ArrowRight
                  size={16}
                  className="transition-transform group-hover:translate-x-0.5"
                />
              </Link>
            </div>

            {/* MOBILE MENU */}

            <details className="relative md:hidden">
              <summary className="flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-white [&::-webkit-details-marker]:hidden">
                <span className="text-xl">☰</span>
              </summary>

              <div className="absolute right-0 top-14 w-[280px] overflow-hidden rounded-2xl border border-white/[0.08] bg-[#020617]/98 p-3 shadow-2xl backdrop-blur-2xl">
                <div className="space-y-1">
                  {navItems.map((item) => (
                    <Link
                      key={item.label}
                      to={item.path}
                      className="flex w-full items-center justify-between rounded-xl px-4 py-3.5 text-sm font-medium text-slate-300 transition hover:bg-white/[0.05] hover:text-white"
                    >
                      {item.label}

                      <ChevronRight size={16} />
                    </Link>
                  ))}
                </div>

                <div className="mt-3 border-t border-white/[0.07] pt-3">
                  <Link
                    to="/academy/student-enrollment-login"
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-5 py-3.5 text-sm font-bold text-slate-950"
                  >
                    Enroll Now

                    <ArrowRight size={17} />
                  </Link>
                </div>
              </div>
            </details>
          </div>
        </div>
      </header>

      {/* =========================================================
          MAIN
      ========================================================= */}

      <main>
        {/* =========================================================
            HERO
        ========================================================= */}

        <section className="relative isolate min-h-[780px] overflow-hidden pt-[78px] lg:min-h-[900px]">
          {/* SCHOOL IMAGE ONLY */}

          <img
            src={schoolImage}
            alt="Scholiqen Academy School"
            className="absolute inset-0 h-full w-full object-cover object-center"
          />

          {/* CINEMATIC OVERLAYS */}

          <div className="absolute inset-0 bg-[#020617]/30" />

          <div className="absolute inset-0 bg-gradient-to-b from-[#020617]/45 via-transparent to-[#020617]/95" />

          <div className="absolute inset-0 bg-gradient-to-r from-[#020617]/35 via-transparent to-[#020617]/20" />

          {/* HERO CONTENT */}

          <div className="relative z-10 mx-auto flex min-h-[702px] max-w-[1600px] items-center justify-center px-5 pb-36 pt-24 text-center sm:px-8 lg:px-12">
            <div className="mx-auto flex max-w-5xl flex-col items-center">
              {/* BADGE */}

              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-[#020617]/50 px-4 py-2 backdrop-blur-md">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-cyan-400/10">
                  <Sparkles
                    size={12}
                    className="text-cyan-300"
                  />
                </span>

                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-200 sm:text-[11px]">
                  Online Primary & Secondary School
                </span>
              </div>

              {/* BRAND */}

              <div className="mb-7 flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-[#020617]/45 p-2.5 shadow-2xl backdrop-blur-xl">
                  <img
                    src={cogLogo}
                    alt="Class Of Genius"
                    className="h-full w-full object-contain"
                  />
                </div>

                <div className="text-left">
                  <div className="text-xl font-bold tracking-tight text-white">
                    Scholiqen Academy
                  </div>

                  <div className="mt-1 text-xs font-medium uppercase tracking-[0.25em] text-slate-300">
                    Learn • Grow • Achieve
                  </div>
                </div>
              </div>

              {/* HEADING */}

              <h1 className="max-w-5xl text-5xl font-black leading-[0.98] tracking-[-0.045em] text-white drop-shadow-2xl sm:text-6xl lg:text-8xl">
                A greater

                <span className="block bg-gradient-to-r from-cyan-300 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
                  school experience.
                </span>
              </h1>

              {/* DESCRIPTION */}

              <p className="mx-auto mt-7 max-w-3xl text-base leading-8 text-slate-200 drop-shadow-lg sm:text-lg">
                A modern academic environment built to combine strong
                education, expert guidance and intelligent technology into one
                seamless learning experience.
              </p>

              {/* BUTTONS */}

              <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
                <Link
                  to="/academy/student-enrollment-login"
                  className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 px-7 py-4 text-sm font-black text-slate-950 shadow-2xl shadow-cyan-500/20 transition hover:-translate-y-1 hover:shadow-cyan-500/30"
                >
                  Start Your Journey

                  <ArrowRight
                    size={18}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </Link>

                <Link
                  to="/academics"
                  className="group inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-[#020617]/45 px-7 py-4 text-sm font-bold text-white backdrop-blur-md transition hover:-translate-y-1 hover:border-white/25 hover:bg-[#020617]/65"
                >
                  Explore Academics

                  <ChevronRight
                    size={17}
                    className="text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-white"
                  />
                </Link>
              </div>

              {/* TRUST POINTS */}

              <div className="mt-9 flex flex-wrap justify-center gap-x-6 gap-y-3">
                {[
                  "Primary School",
                  "Secondary School",
                  "Tutor Guided",
                  "Online-Based",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-2 text-xs font-medium text-slate-200"
                  >
                    <CheckCircle2
                      size={14}
                      className="text-cyan-300"
                    />

                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* BOTTOM STATS */}

          <div className="absolute bottom-0 left-0 right-0 z-20 border-t border-white/[0.08] bg-[#020617]/75 backdrop-blur-2xl">
            <div className="mx-auto grid max-w-[1600px] grid-cols-2 divide-x divide-white/[0.08] sm:grid-cols-4">
              {stats.map((stat, index) => (
                <div
                  key={stat.label}
                  className={`px-5 py-5 sm:px-8 sm:py-6 ${
                    index > 1
                      ? "border-t border-white/[0.08] sm:border-t-0"
                      : ""
                  }`}
                >
                  <div className="text-xl font-black tracking-tight text-white sm:text-2xl">
                    {stat.value}
                  </div>

                  <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* =========================================================
            INTRO
        ========================================================= */}

        <section className="relative border-b border-white/[0.06]">
          <div className="mx-auto max-w-[1600px] px-5 py-24 sm:px-8 lg:px-12 lg:py-32">
            <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
              <div>
                <div className="mb-5 flex items-center gap-3">
                  <span className="h-px w-8 bg-cyan-400" />

                  <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-cyan-300">
                    The Academy
                  </span>
                </div>

                <h2 className="text-4xl font-black leading-tight tracking-[-0.035em] text-white sm:text-5xl">
                  Education designed

                  <span className="block text-slate-500">
                    for the future.
                  </span>
                </h2>
              </div>

              <div>
                <p className="max-w-3xl text-base leading-8 text-slate-400 sm:text-lg">
                  Scholiqen Academy brings together academics, technology,
                  student support and meaningful experiences in a single
                  environment. Every part of the platform is designed to make
                  learning more organised, accessible and engaging.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            LEARNING FEATURES
        ========================================================= */}

        <section className="relative">
          <div className="mx-auto max-w-[1600px] px-5 py-24 sm:px-8 lg:px-12 lg:py-32">
            <div className="mb-14 flex flex-col justify-between gap-7 md:flex-row md:items-end">
              <div>
                <div className="mb-4 flex items-center gap-3">
                  <span className="h-px w-8 bg-cyan-400" />

                  <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-cyan-300">
                    Learning Environment
                  </span>
                </div>

                <h2 className="max-w-2xl text-4xl font-black tracking-[-0.035em] text-white sm:text-5xl">
                  Everything students need

                  <span className="text-slate-500">
                    {" "}
                    to move forward.
                  </span>
                </h2>
              </div>

              <Link
                to="/academics"
                className="group flex w-fit items-center gap-2 text-sm font-bold text-slate-300 transition hover:text-white"
              >
                View academics

                <ArrowRight
                  size={16}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>
            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {learningFeatures.map((feature, index) => {
                const Icon = feature.icon;

                return (
                  <div
                    key={feature.title}
                    className="group relative overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.025] p-7 transition duration-500 hover:-translate-y-1 hover:border-white/[0.14] hover:bg-white/[0.045]"
                  >
                    <div
                      className={`absolute left-0 top-0 h-1 w-full bg-gradient-to-r ${feature.accent} opacity-70`}
                    />

                    <div className="mb-8 flex items-center justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.04]">
                        <Icon
                          size={22}
                          className="text-cyan-300"
                        />
                      </div>

                      <span className="text-xs font-bold text-slate-700">
                        0{index + 1}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold tracking-tight text-white">
                      {feature.title}
                    </h3>

                    <p className="mt-3 text-sm leading-7 text-slate-500 transition group-hover:text-slate-400">
                      {feature.description}
                    </p>

                    <div className="mt-8 flex items-center gap-2 text-xs font-bold text-cyan-300">
                      Explore

                      <ArrowRight
                        size={14}
                        className="transition-transform group-hover:translate-x-1"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* =========================================================
            CONNECTED LEARNING ECOSYSTEM
        ========================================================= */}

        <section className="relative overflow-hidden border-y border-white/[0.06] bg-white/[0.015]">
          <div className="absolute right-[-10%] top-[20%] h-[450px] w-[450px] rounded-full bg-blue-500/10 blur-[140px]" />

          <div className="relative mx-auto max-w-[1600px] px-5 py-24 sm:px-8 lg:px-12 lg:py-32">
            <div className="grid gap-16 lg:grid-cols-[0.75fr_1.25fr]">
              <div className="lg:sticky lg:top-32 lg:self-start">
                <div className="mb-5 flex items-center gap-3">
                  <span className="h-px w-8 bg-blue-400" />

                  <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-blue-300">
                    Connected Learning
                  </span>
                </div>

                <h2 className="text-4xl font-black leading-tight tracking-[-0.04em] text-white sm:text-5xl">
                  More than a

                  <span className="block text-slate-500">
                    classroom.
                  </span>
                </h2>

                <p className="mt-6 max-w-md text-base leading-8 text-slate-400">
                  The academy connects the important parts of a modern
                  student's academic journey into one seamless experience.
                </p>

                <div className="mt-9 flex flex-wrap gap-3">
                  <div className="rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-2 text-xs font-semibold text-slate-300">
                    Academics
                  </div>

                  <div className="rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-2 text-xs font-semibold text-slate-300">
                    Technology
                  </div>

                  <div className="rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-2 text-xs font-semibold text-slate-300">
                    Community
                  </div>
                </div>

                <Link
                  to="/resources"
                  className="group mt-9 flex items-center gap-2 text-sm font-bold text-cyan-300 transition hover:text-cyan-200"
                >
                  Explore the ecosystem

                  <ArrowRight
                    size={16}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </Link>
              </div>

              <div className="grid gap-px overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.08] sm:grid-cols-2">
                {ecosystem.map((item, index) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.title}
                      className="group relative bg-[#020617]/95 p-7 transition hover:bg-[#071128]"
                    >
                      <div className="mb-7 flex items-center justify-between">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] transition group-hover:border-cyan-400/20 group-hover:bg-cyan-400/[0.06]">
                          <Icon
                            size={20}
                            className="text-slate-400 transition group-hover:text-cyan-300"
                          />
                        </div>

                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-700">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-white">
                        {item.title}
                      </h3>

                      <p className="mt-3 text-sm leading-7 text-slate-500">
                        {item.text}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            WHY SCHOLIQEN
        ========================================================= */}

        <section className="relative">
          <div className="mx-auto max-w-[1600px] px-5 py-24 sm:px-8 lg:px-12 lg:py-32">
            <div className="grid overflow-hidden rounded-[2rem] border border-white/[0.08] bg-gradient-to-br from-white/[0.045] to-white/[0.015] lg:grid-cols-[0.9fr_1.1fr]">
              {/* SCHOOL IMAGE */}

              <div className="relative min-h-[420px] overflow-hidden border-b border-white/[0.08] lg:border-b-0 lg:border-r">
                <img
                  src={schoolImage}
                  alt="Scholiqen Academy"
                  className="absolute inset-0 h-full w-full object-cover"
                />

                <div className="absolute inset-0 bg-gradient-to-br from-[#020617]/80 via-[#020617]/30 to-cyan-950/50" />

                <div className="absolute inset-x-0 bottom-0 p-8 sm:p-10">
                  <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1.5 backdrop-blur-md">
                    <ShieldCheck
                      size={13}
                      className="text-cyan-300"
                    />

                    <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-white">
                      Built for Students
                    </span>
                  </div>

                  <h3 className="max-w-md text-3xl font-black tracking-tight text-white sm:text-4xl">
                    A learning environment built around progress.
                  </h3>
                </div>
              </div>

              {/* CONTENT */}

              <div className="p-8 sm:p-10 lg:p-14">
                <div className="mb-5 flex items-center gap-3">
                  <span className="h-px w-8 bg-cyan-400" />

                  <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-cyan-300">
                    Why Scholiqen
                  </span>
                </div>

                <h2 className="max-w-xl text-3xl font-black tracking-[-0.035em] text-white sm:text-4xl">
                  Built to make every stage of learning feel more connected.
                </h2>

                <p className="mt-5 max-w-xl text-sm leading-7 text-slate-500 sm:text-base">
                  From foundational education to examination preparation,
                  Scholiqen brings academic structure and modern technology
                  together without making the learning experience complicated.
                </p>

                <div className="mt-9 grid gap-4 sm:grid-cols-2">
                  {principles.map((principle) => (
                    <div
                      key={principle}
                      className="flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.025] px-4 py-4"
                    >
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-cyan-400/[0.08]">
                        <CheckCircle2
                          size={15}
                          className="text-cyan-300"
                        />
                      </div>

                      <span className="text-sm font-medium text-slate-300">
                        {principle}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            QUICK ACCESS
        ========================================================= */}

        <section className="border-t border-white/[0.06]">
          <div className="mx-auto max-w-[1600px] px-5 py-24 sm:px-8 lg:px-12">
            <div className="mb-12">
              <div className="mb-4 flex items-center gap-3">
                <span className="h-px w-8 bg-indigo-400" />

                <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-indigo-300">
                  Student Experience
                </span>
              </div>

              <h2 className="text-4xl font-black tracking-[-0.035em] text-white sm:text-5xl">
                Your learning tools.

                <span className="text-slate-500">
                  {" "}
                  One place.
                </span>
              </h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {quickAccess.map((item) => {
                const Icon = item.icon;

                return (
                  <Link
                    key={item.title}
                    to={item.path}
                    className="group"
                  >
                    <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.025] p-6 transition duration-300 hover:-translate-y-1 hover:border-cyan-400/20 hover:bg-white/[0.05]">
                      <div className="flex items-center justify-between">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04]">
                          <Icon
                            size={19}
                            className="text-cyan-300"
                          />
                        </div>

                        <ArrowRight
                          size={17}
                          className="text-slate-600 transition group-hover:translate-x-1 group-hover:text-cyan-300"
                        />
                      </div>

                      <h3 className="mt-7 font-bold text-white">
                        {item.title}
                      </h3>

                      <p className="mt-1 text-xs text-slate-500">
                        {item.text}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* =========================================================
            ADMISSIONS CTA
        ========================================================= */}

        <section className="relative overflow-hidden">
          <div className="mx-auto max-w-[1600px] px-5 pb-24 sm:px-8 lg:px-12 lg:pb-32">
            <div className="relative overflow-hidden rounded-[2rem] border border-cyan-300/10 bg-gradient-to-br from-cyan-500/[0.12] via-blue-500/[0.08] to-indigo-500/[0.06] p-8 sm:p-12 lg:p-16">
              <div className="absolute right-[-10%] top-[-30%] h-[400px] w-[400px] rounded-full bg-cyan-400/10 blur-[100px]" />

              <div className="absolute bottom-[-40%] left-[20%] h-[300px] w-[300px] rounded-full bg-blue-500/10 blur-[100px]" />

              <div className="relative z-10 grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
                <div>
                  <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-300/15 bg-cyan-300/[0.06] px-4 py-2">
                    <GraduationCap
                      size={14}
                      className="text-cyan-300"
                    />

                    <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-200">
                      Admissions Open
                    </span>
                  </div>

                  <h2 className="max-w-3xl text-4xl font-black leading-tight tracking-[-0.04em] text-white sm:text-5xl lg:text-6xl">
                    Give your child a

                    <span className="block text-cyan-300">
                      better way to learn.
                    </span>
                  </h2>

                  <p className="mt-6 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
                    Begin the enrollment journey and give your child access
                    to a structured academic environment built for learning,
                    growth and achievement.
                  </p>
                </div>

                <div>
                  <Link
                    to="/academy/student-enrollment-login"
                    className="group flex w-full items-center justify-center gap-3 rounded-2xl bg-white px-7 py-4 text-sm font-black text-slate-950 shadow-2xl transition hover:-translate-y-1 hover:shadow-white/10 sm:w-auto"
                  >
                    Begin Enrollment

                    <ArrowRight
                      size={18}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </Link>

                  <p className="mt-3 text-center text-[10px] font-medium uppercase tracking-[0.15em] text-slate-600">
                    Start your academic journey
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* =========================================================
          FOOTER
      ========================================================= */}

      <footer className="border-t border-white/[0.07] bg-[#01040c]">
        <div className="mx-auto max-w-[1600px] px-5 py-14 sm:px-8 lg:px-12">
          <div className="grid gap-12 md:grid-cols-[1.5fr_1fr_1fr]">
            {/* BRAND */}

            <div>
              <Link
                to="/academy"
                className="flex items-center gap-3"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] p-2">
                  <img
                    src={cogLogo}
                    alt="Class Of Genius"
                    className="h-full w-full object-contain"
                  />
                </div>

                <div>
                  <div className="font-bold text-white">
                    Scholiqen Academy
                  </div>

                  <div className="text-[9px] font-bold uppercase tracking-[0.22em] text-cyan-300/60">
                    Learn • Grow • Achieve
                  </div>
                </div>
              </Link>

              <p className="mt-5 max-w-sm text-sm leading-7 text-slate-600">
                A modern digital learning environment designed to support
                students throughout their academic journey.
              </p>
            </div>

            {/* ACADEMY */}

            <div>
              <h4 className="text-xs font-bold uppercase tracking-[0.18em] text-white">
                Academy
              </h4>

              <div className="mt-5 space-y-3">
                <Link
                  to="/academics"
                  className="block text-sm text-slate-500 transition hover:text-white"
                >
                  Academics
                </Link>

                <Link
                  to="/resources"
                  className="block text-sm text-slate-500 transition hover:text-white"
                >
                  Resources
                </Link>

                <Link
                  to="/community"
                  className="block text-sm text-slate-500 transition hover:text-white"
                >
                  Community
                </Link>

                <Link
                  to="/about"
                  className="block text-sm text-slate-500 transition hover:text-white"
                >
                  About
                </Link>
              </div>
            </div>

            {/* STUDENT */}

            <div>
              <h4 className="text-xs font-bold uppercase tracking-[0.18em] text-white">
                Student
              </h4>

              <div className="mt-5 space-y-3">
                <Link
                  to="/academy/student-enrollment-login"
                  className="block text-sm text-slate-500 transition hover:text-white"
                >
                  Student Portal
                </Link>

                <Link
                  to="/cbt"
                  className="block text-sm text-slate-500 transition hover:text-white"
                >
                  CBT Practice
                </Link>

                <Link
                  to="/virtual-lab"
                  className="block text-sm text-slate-500 transition hover:text-white"
                >
                  Virtual Lab
                </Link>

                <Link
                  to="/ai-tutor"
                  className="block text-sm text-slate-500 transition hover:text-white"
                >
                  AI Tutor
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-12 flex flex-col justify-between gap-4 border-t border-white/[0.06] pt-7 text-xs text-slate-700 sm:flex-row">
            <span>
              © {new Date().getFullYear()} Scholiqen Academy. All rights
              reserved.
            </span>

            <span className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
              Built for better learning.
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AcademyEnvironment;