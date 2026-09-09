import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Brain,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileText,
  FlaskConical,
  GraduationCap,
  Layers3,
  Laptop,
  Search,
  Sparkles,
  Star,
  Target,
  Trophy,
  Users,
  X,
  Zap,
} from "lucide-react";

import cogLogo from "../../assets/cog.png";
import schoolImage from "../../assets/hero.jpeg";

const Academics = () => {
  const [level, setLevel] = useState("secondary");
  const [search, setSearch] = useState("");

  const subjects = {
    primary: [
      {
        name: "English Language",
        code: "ENG",
        category: "Languages",
        description:
          "Build strong communication, reading, writing and comprehension skills.",
        icon: BookOpen,
        gradient: "from-cyan-400 to-blue-500",
      },
      {
        name: "Mathematics",
        code: "MAT",
        category: "Core",
        description:
          "Develop numerical reasoning, problem-solving and mathematical confidence.",
        icon: Target,
        gradient: "from-blue-400 to-indigo-500",
      },
      {
        name: "Basic Science",
        code: "SCI",
        category: "Science",
        description:
          "Discover the scientific world through concepts, observation and exploration.",
        icon: FlaskConical,
        gradient: "from-emerald-400 to-cyan-500",
      },
      {
        name: "Basic Technology",
        code: "TEC",
        category: "Technology",
        description:
          "Understand technology, tools, systems and how they shape everyday life.",
        icon: Laptop,
        gradient: "from-violet-400 to-purple-500",
      },
      {
        name: "Computer Studies",
        code: "ICT",
        category: "Technology",
        description:
          "Develop digital literacy and foundational computer skills.",
        icon: Laptop,
        gradient: "from-indigo-400 to-blue-500",
      },
      {
        name: "Civic Education",
        code: "CIV",
        category: "Humanities",
        description:
          "Learn about citizenship, responsibility, values and society.",
        icon: Users,
        gradient: "from-amber-400 to-orange-500",
      },
      {
        name: "Security Education",
        code: "SEC",
        category: "Life Skills",
        description:
          "Understand personal safety, security awareness and responsible behaviour.",
        icon: CheckCircle2,
        gradient: "from-rose-400 to-red-500",
      },
      {
        name: "Social Studies",
        code: "SOS",
        category: "Humanities",
        description:
          "Explore people, communities, culture and the world around us.",
        icon: Users,
        gradient: "from-fuchsia-400 to-pink-500",
      },
    ],

    secondary: [
      {
        name: "English Language",
        code: "ENG",
        category: "Languages",
        description:
          "Master comprehension, grammar, writing, oral English and communication.",
        icon: BookOpen,
        gradient: "from-cyan-400 to-blue-500",
      },
      {
        name: "Mathematics",
        code: "MAT",
        category: "Core",
        description:
          "Build strong mathematical reasoning and examination-ready problem-solving skills.",
        icon: Target,
        gradient: "from-blue-400 to-indigo-500",
      },
      {
        name: "Further Mathematics",
        code: "F-MAT",
        category: "Advanced",
        description:
          "Explore advanced mathematical concepts for ambitious learners.",
        icon: Brain,
        gradient: "from-indigo-400 to-violet-500",
      },
      {
        name: "Physics",
        code: "PHY",
        category: "Science",
        description:
          "Understand matter, motion, energy, forces and the physical universe.",
        icon: Zap,
        gradient: "from-cyan-400 to-teal-500",
      },
      {
        name: "Chemistry",
        code: "CHE",
        category: "Science",
        description:
          "Explore matter, reactions, elements and the principles of chemistry.",
        icon: FlaskConical,
        gradient: "from-emerald-400 to-cyan-500",
      },
      {
        name: "Biology",
        code: "BIO",
        category: "Science",
        description:
          "Study life, organisms, ecosystems, genetics and biological processes.",
        icon: Layers3,
        gradient: "from-green-400 to-emerald-500",
      },
      {
        name: "Economics",
        code: "ECO",
        category: "Commercial",
        description:
          "Understand markets, resources, production, consumption and economic systems.",
        icon: Trophy,
        gradient: "from-amber-400 to-orange-500",
      },
      {
        name: "Commerce",
        code: "COM",
        category: "Commercial",
        description:
          "Learn how businesses, trade and commercial activities operate.",
        icon: GraduationCap,
        gradient: "from-orange-400 to-red-500",
      },
      {
        name: "Accounting",
        code: "ACC",
        category: "Commercial",
        description:
          "Develop practical understanding of financial records and accounting principles.",
        icon: FileText,
        gradient: "from-violet-400 to-purple-500",
      },
      {
        name: "Government",
        code: "GOV",
        category: "Humanities",
        description:
          "Explore political systems, governance, institutions and civic structures.",
        icon: Users,
        gradient: "from-blue-400 to-indigo-500",
      },
      {
        name: "Literature in English",
        code: "LIT",
        category: "Humanities",
        description:
          "Read, analyse and appreciate poetry, prose, drama and literary expression.",
        icon: BookOpen,
        gradient: "from-pink-400 to-fuchsia-500",
      },
      {
        name: "Geography",
        code: "GEO",
        category: "Humanities",
        description:
          "Explore people, places, environments, maps and the physical world.",
        icon: Layers3,
        gradient: "from-teal-400 to-cyan-500",
      },
      {
        name: "Agricultural Science",
        code: "AGR",
        category: "Science",
        description:
          "Understand agriculture, farming systems, crops, animals and food production.",
        icon: FlaskConical,
        gradient: "from-lime-400 to-green-500",
      },
      {
        name: "Computer Studies",
        code: "ICT",
        category: "Technology",
        description:
          "Build digital literacy, computational thinking and technology skills.",
        icon: Laptop,
        gradient: "from-purple-400 to-indigo-500",
      },
      {
        name: "Basic Technology",
        code: "TEC",
        category: "Technology",
        description:
          "Explore technical principles, design, tools and practical technology.",
        icon: Laptop,
        gradient: "from-sky-400 to-blue-500",
      },
      {
        name: "Civic Education",
        code: "CIV",
        category: "Humanities",
        description:
          "Develop civic awareness, responsibility, values and national consciousness.",
        icon: Users,
        gradient: "from-amber-400 to-yellow-500",
      },

    
    ],
  };

  const currentSubjects = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return subjects[level];

    return subjects[level].filter(
      (subject) =>
        subject.name.toLowerCase().includes(query) ||
        subject.category.toLowerCase().includes(query) ||
        subject.code.toLowerCase().includes(query)
    );
  }, [level, search]);

  const academicStats = [
    {
      value: subjects.primary.length,
      label: "Primary Subjects",
      icon: BookOpen,
    },
    {
      value: subjects.secondary.length,
      label: "Secondary Subjects",
      icon: GraduationCap,
    },
    {
      value: "24/7",
      label: "Digital Access",
      icon: Laptop,
    },
    {
      value: "∞",
      label: "Learning Potential",
      icon: Sparkles,
    },
  ];

  const pathways = [
    {
      icon: BookOpen,
      number: "01",
      title: "Learn",
      text: "Follow structured lessons designed around your academic level.",
    },
    {
      icon: Brain,
      number: "02",
      title: "Understand",
      text: "Use smart learning tools and practical experiences to deepen understanding.",
    },
    {
      icon: Target,
      number: "03",
      title: "Practise",
      text: "Strengthen your knowledge through questions, assignments and CBT practice.",
    },
    {
      icon: Trophy,
      number: "04",
      title: "Achieve",
      text: "Track your progress and continue developing toward your academic goals.",
    },
  ];

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#01030a] text-white selection:bg-cyan-400/30">

      {/* =========================================================
          BACKGROUND
      ========================================================= */}

      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">

        <motion.div
          animate={{
            x: [0, 60, -20, 0],
            y: [0, -40, 30, 0],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute left-[-15%] top-[5%] h-[500px] w-[500px] rounded-full bg-cyan-500/[0.07] blur-[150px]"
        />

        <motion.div
          animate={{
            x: [0, -50, 20, 0],
            y: [0, 40, -20, 0],
          }}
          transition={{
            duration: 21,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute right-[-15%] top-[35%] h-[600px] w-[600px] rounded-full bg-blue-600/[0.08] blur-[160px]"
        />

        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      {/* =========================================================
          NAVBAR
      ========================================================= */}

      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/[0.07] bg-[#01030a]/80 backdrop-blur-2xl">

        <div className="mx-auto flex h-[78px] max-w-[1600px] items-center justify-between px-5 sm:px-8 lg:px-12">

          <Link
            to="/academy"
            className="group flex items-center gap-3"
          >

            <div className="relative">

              <div className="absolute inset-0 rounded-xl bg-cyan-400/20 blur-xl transition group-hover:bg-cyan-400/30" />

              <div className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] p-2">
                <img
                  src={cogLogo}
                  alt="Class Of Genius"
                  className="h-full w-full object-contain"
                />
              </div>

            </div>

            <div className="hidden sm:block">
              <div className="text-sm font-bold text-white">
                Scholiqen
              </div>

              <div className="text-[9px] font-bold uppercase tracking-[0.3em] text-cyan-300/70">
                Academy
              </div>
            </div>

          </Link>

          <nav className="hidden items-center gap-1 lg:flex">

            {[
              ["Home", "/academy"],
              ["Academics", "/academics"],
              ["Resources", "/resources"],
              ["Community", "/community"],
              ["OurStory", "/our-story"],
            ].map(([label, path]) => (
              <Link
                key={label}
                to={path}
                className={`relative rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                  label === "Academics"
                    ? "text-white"
                    : "text-slate-400 hover:bg-white/[0.04] hover:text-white"
                }`}
              >
                {label}

                {label === "Academics" && (
                  <span className="absolute bottom-0 left-1/2 h-[2px] w-5 -translate-x-1/2 rounded-full bg-cyan-400" />
                )}
              </Link>
            ))}

          </nav>

          <div className="flex items-center gap-2">

            <button
              type="button"
              className="hidden h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03] text-slate-400 transition hover:border-cyan-400/20 hover:text-white sm:flex"
            >
              <Search size={17} />
            </button>

            <Link
              to="/academy/student-enrollment-login"
              className="hidden items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/[0.08] sm:flex"
            >
              <Users size={16} />
              Student
            </Link>

            <Link
              to="/academy/student-enrollment-login"
              className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-5 py-2.5 text-sm font-black text-slate-950 shadow-lg shadow-cyan-500/10 transition hover:-translate-y-0.5"
            >
              Enroll
              <ArrowRight
                size={15}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>

          </div>
        </div>
      </header>

      {/* =========================================================
          HERO
      ========================================================= */}

      <main className="relative z-10">

        <section className="relative overflow-hidden pt-[78px]">

          <div className="absolute inset-0">

            <img
              src={schoolImage}
              alt="Scholiqen Academy"
              className="h-full min-h-[700px] w-full object-cover object-center opacity-45"
            />

            <div className="absolute inset-0 bg-[#01030a]/10" />

            <div className="absolute inset-0 bg-gradient-to-b from-[#01030a]/55 via-[#01030a]/50 to-[#01030a]" />

            <div className="absolute inset-0 bg-gradient-to-r from-[#01030a]/60 via-[#01030a]/20 to-[#01030a]/45" />

          </div>

          <div className="relative mx-auto max-w-[1600px] px-5 py-24 sm:px-8 lg:px-12 lg:py-36">

            <div className="max-w-5xl">

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
                className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/[0.06] px-4 py-2 backdrop-blur-xl"
              >

                <Sparkles
                  size={13}
                  className="text-cyan-300"
                />

                <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-cyan-200">
                  Academic Centre
                </span>

              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.8 }}
                className="text-5xl font-black leading-[0.95] tracking-[-0.055em] text-white sm:text-7xl lg:text-[88px]"
              >
                Your academic

                <span className="block bg-gradient-to-r from-cyan-200 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
                  journey starts here.
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className="mt-7 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg"
              >
                Explore structured primary and secondary education,
                discover your subjects, build knowledge and prepare for
                the next stage of your academic journey.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="mt-9 flex flex-wrap gap-3"
              >

                <a
                  href="#subjects"
                  className="group flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 px-6 py-4 text-sm font-black text-slate-950 shadow-xl shadow-cyan-500/15 transition hover:-translate-y-1"
                >
                  Explore Subjects

                  <ArrowRight
                    size={17}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </a>

                <Link
                  to="/cbt"
                  className="group flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-4 text-sm font-bold text-white backdrop-blur-xl transition hover:-translate-y-1 hover:bg-white/[0.07]"
                >
                  <FileText
                    size={16}
                    className="text-cyan-300"
                  />

                  Exam Practice

                  <ChevronRight
                    size={16}
                    className="text-slate-500 transition group-hover:translate-x-1"
                  />
                </Link>

              </motion.div>

            </div>

            {/* HERO MINI PANEL */}

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="mt-16 grid max-w-4xl grid-cols-2 overflow-hidden rounded-3xl border border-white/[0.08] bg-[#01030a]/65 backdrop-blur-2xl sm:grid-cols-4"
            >

              {academicStats.map((stat, index) => {
                const Icon = stat.icon;

                return (
                  <div
                    key={stat.label}
                    className={`p-5 sm:p-6 ${
                      index > 1
                        ? "border-t border-white/[0.07] sm:border-t-0"
                        : ""
                    } ${
                      index % 2 === 1
                        ? "border-l border-white/[0.07]"
                        : ""
                    } sm:border-l ${
                      index === 0
                        ? "sm:border-l-0"
                        : ""
                    }`}
                  >

                    <div className="flex items-center gap-3">

                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-400/[0.07]">
                        <Icon
                          size={17}
                          className="text-cyan-300"
                        />
                      </div>

                      <div>

                        <div className="text-xl font-black text-white">
                          {stat.value}
                        </div>

                        <div className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-600">
                          {stat.label}
                        </div>

                      </div>

                    </div>
                  </div>
                );
              })}

            </motion.div>

          </div>
        </section>

        {/* =========================================================
            LEVEL SELECTOR
        ========================================================= */}

        <section
          id="subjects"
          className="relative border-y border-white/[0.06]"
        >

          <div className="mx-auto max-w-[1600px] px-5 py-20 sm:px-8 lg:px-12 lg:py-28">

            <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">

              <div>

                <div className="mb-4 flex items-center gap-3">

                  <span className="h-px w-8 bg-cyan-400" />

                  <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-cyan-300">
                    Curriculum
                  </span>

                </div>

                <h2 className="text-4xl font-black tracking-[-0.045em] text-white sm:text-6xl">
                  Explore your

                  <span className="text-slate-600">
                    {" "}
                    subjects.
                  </span>
                </h2>

                <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-500 sm:text-base">
                  Choose your academic level and explore the subjects
                  available within the Scholiqen learning environment.
                </p>

              </div>

              {/* SWITCHER */}

              <div className="inline-flex w-fit rounded-2xl border border-white/[0.08] bg-white/[0.025] p-1">

                {[
                  ["primary", "Primary"],
                  ["secondary", "Secondary"],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => {
                      setLevel(value);
                      setSearch("");
                    }}
                    className={`relative rounded-xl px-5 py-3 text-sm font-bold transition ${
                      level === value
                        ? "text-slate-950"
                        : "text-slate-500 hover:text-white"
                    }`}
                  >

                    {level === value && (
                      <motion.div
                        layoutId="academic-level"
                        className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500"
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 30,
                        }}
                      />
                    )}

                    <span className="relative z-10">
                      {label}
                    </span>

                  </button>
                ))}

              </div>

            </div>

            {/* SEARCH */}

            <div className="mt-12">

              <div className="relative max-w-xl">

                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600"
                />

                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search subjects..."
                  className="h-14 w-full rounded-2xl border border-white/[0.08] bg-white/[0.025] pl-12 pr-12 text-sm text-white outline-none placeholder:text-slate-700 transition focus:border-cyan-400/30 focus:bg-white/[0.04]"
                />

                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white"
                  >
                    <X size={16} />
                  </button>
                )}

              </div>

            </div>

            {/* SUBJECT GRID */}

            <AnimatePresence mode="wait">

              <motion.div
                key={`${level}-${search}`}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.35 }}
                className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              >

                {currentSubjects.map((subject, index) => {
                  const Icon = subject.icon;

                  return (
                    <motion.div
                      key={subject.name}
                      initial={{
                        opacity: 0,
                        y: 20,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      transition={{
                        delay: index * 0.035,
                      }}
                      whileHover={{
                        y: -7,
                      }}
                      className="group relative overflow-hidden rounded-[1.5rem] border border-white/[0.08] bg-white/[0.025] p-6 transition-colors duration-300 hover:border-cyan-400/20 hover:bg-white/[0.045]"
                    >

                      <div
                        className={`absolute left-0 top-0 h-[2px] w-full bg-gradient-to-r ${subject.gradient}`}
                      />

                      <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-cyan-400/[0.03] blur-2xl transition group-hover:bg-cyan-400/[0.08]" />

                      <div className="relative flex items-center justify-between">

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] transition group-hover:border-cyan-400/20 group-hover:bg-cyan-400/[0.06]">

                          <Icon
                            size={19}
                            className="text-cyan-300 transition-transform group-hover:scale-110"
                          />

                        </div>

                        <span className="text-[10px] font-bold tracking-[0.18em] text-slate-700">
                          {subject.code}
                        </span>

                      </div>

                      <div className="relative mt-6">

                        <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-cyan-400/60">
                          {subject.category}
                        </div>

                        <h3 className="mt-2 text-lg font-bold text-white">
                          {subject.name}
                        </h3>

                        <p className="mt-2 text-xs leading-6 text-slate-500">
                          {subject.description}
                        </p>

                      </div>

                      <div className="relative mt-6 flex items-center justify-between">

                        <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-700 transition group-hover:text-cyan-300">
                          Explore
                        </span>

                        <ArrowUpRight
                          size={16}
                          className="text-slate-700 transition group-hover:text-cyan-300"
                        />

                      </div>

                    </motion.div>
                  );
                })}

              </motion.div>

            </AnimatePresence>

            {currentSubjects.length === 0 && (
              <div className="mt-10 rounded-3xl border border-white/[0.08] bg-white/[0.02] p-12 text-center">

                <Search
                  size={30}
                  className="mx-auto text-slate-700"
                />

                <h3 className="mt-5 text-lg font-bold text-white">
                  No subjects found
                </h3>

                <p className="mt-2 text-sm text-slate-600">
                  Try searching for another subject.
                </p>

              </div>
            )}

          </div>
        </section>

        {/* =========================================================
            ACADEMIC PATHWAY
        ========================================================= */}

        <section className="relative overflow-hidden">

          <div className="absolute left-[-10%] top-[20%] h-[400px] w-[400px] rounded-full bg-indigo-500/[0.06] blur-[140px]" />

          <div className="mx-auto max-w-[1600px] px-5 py-24 sm:px-8 lg:px-12 lg:py-32">

            <div className="grid gap-14 lg:grid-cols-[0.75fr_1.25fr]">

              <motion.div
                initial={{
                  opacity: 0,
                  x: -25,
                }}
                whileInView={{
                  opacity: 1,
                  x: 0,
                }}
                viewport={{
                  once: true,
                  amount: 0.2,
                }}
              >

                <div className="mb-5 flex items-center gap-3">

                  <span className="h-px w-8 bg-indigo-400" />

                  <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-indigo-300">
                    The Learning Path
                  </span>

                </div>

                <h2 className="text-4xl font-black leading-tight tracking-[-0.045em] text-white sm:text-6xl">
                  Learn with

                  <span className="block text-slate-600">
                    purpose.
                  </span>
                </h2>

                <p className="mt-6 max-w-md text-base leading-8 text-slate-500">
                  Scholiqen is designed around a simple academic progression:
                  learn, understand, practise and achieve.
                </p>

              </motion.div>

              <div className="grid gap-4 sm:grid-cols-2">

                {pathways.map((item, index) => {
                  const Icon = item.icon;

                  return (
                    <motion.div
                      key={item.title}
                      initial={{
                        opacity: 0,
                        y: 25,
                      }}
                      whileInView={{
                        opacity: 1,
                        y: 0,
                      }}
                      viewport={{
                        once: true,
                        amount: 0.15,
                      }}
                      transition={{
                        delay: index * 0.08,
                      }}
                      whileHover={{
                        y: -5,
                      }}
                      className="group rounded-[1.5rem] border border-white/[0.08] bg-white/[0.025] p-7 transition hover:border-cyan-400/15 hover:bg-white/[0.045]"
                    >

                      <div className="flex items-center justify-between">

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-400/[0.06]">
                          <Icon
                            size={20}
                            className="text-cyan-300"
                          />
                        </div>

                        <span className="text-[10px] font-bold tracking-widest text-slate-700">
                          {item.number}
                        </span>

                      </div>

                      <h3 className="mt-7 text-xl font-bold text-white">
                        {item.title}
                      </h3>

                      <p className="mt-3 text-sm leading-7 text-slate-500">
                        {item.text}
                      </p>

                    </motion.div>
                  );
                })}

              </div>

            </div>
          </div>
        </section>

        {/* =========================================================
            DIGITAL ACADEMIC TOOLS
        ========================================================= */}

        <section className="border-y border-white/[0.06] bg-white/[0.012]">

          <div className="mx-auto max-w-[1600px] px-5 py-24 sm:px-8 lg:px-12 lg:py-32">

            <div className="mb-14">

              <div className="mb-4 flex items-center gap-3">

                <span className="h-px w-8 bg-cyan-400" />

                <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-cyan-300">
                  Digital Academic Tools
                </span>

              </div>

              <h2 className="text-4xl font-black tracking-[-0.045em] text-white sm:text-6xl">
                More tools.

                <span className="text-slate-600">
                  {" "}
                  Better learning.
                </span>
              </h2>

            </div>

            <div className="grid gap-5 lg:grid-cols-3">

              {/* AI */}

              <Link
                to="/ai-tutor"
                className="group relative overflow-hidden rounded-[2rem] border border-white/[0.08] bg-gradient-to-br from-cyan-500/[0.09] to-transparent p-8 transition duration-500 hover:-translate-y-2 hover:border-cyan-400/20"
              >

                <div className="absolute right-[-30px] top-[-30px] h-40 w-40 rounded-full bg-cyan-400/[0.08] blur-3xl" />

                <div className="relative">

                  <div className="flex items-center justify-between">

                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/[0.08]">
                      <Brain
                        size={22}
                        className="text-cyan-300"
                      />
                    </div>

                    <ArrowUpRight
                      size={19}
                      className="text-slate-600 transition group-hover:text-cyan-300"
                    />

                  </div>

                  <h3 className="mt-9 text-2xl font-black text-white">
                    AI Tutor
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-slate-500">
                    Get intelligent academic assistance when you need help
                    understanding difficult concepts.
                  </p>

                </div>
              </Link>

              {/* LAB */}

              <Link
                to="/virtual-lab"
                className="group relative overflow-hidden rounded-[2rem] border border-white/[0.08] bg-gradient-to-br from-indigo-500/[0.09] to-transparent p-8 transition duration-500 hover:-translate-y-2 hover:border-indigo-400/20"
              >

                <div className="absolute right-[-30px] top-[-30px] h-40 w-40 rounded-full bg-indigo-400/[0.08] blur-3xl" />

                <div className="relative">

                  <div className="flex items-center justify-between">

                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-400/[0.08]">
                      <FlaskConical
                        size={22}
                        className="text-indigo-300"
                      />
                    </div>

                    <ArrowUpRight
                      size={19}
                      className="text-slate-600 transition group-hover:text-indigo-300"
                    />

                  </div>

                  <h3 className="mt-9 text-2xl font-black text-white">
                    Virtual Laboratory
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-slate-500">
                    Explore science through interactive practical experiences
                    and digital simulations.
                  </p>

                </div>
              </Link>

              {/* CBT */}

              <Link
                to="/cbt"
                className="group relative overflow-hidden rounded-[2rem] border border-white/[0.08] bg-gradient-to-br from-blue-500/[0.09] to-transparent p-8 transition duration-500 hover:-translate-y-2 hover:border-blue-400/20"
              >

                <div className="absolute right-[-30px] top-[-30px] h-40 w-40 rounded-full bg-blue-400/[0.08] blur-3xl" />

                <div className="relative">

                  <div className="flex items-center justify-between">

                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-400/[0.08]">
                      <FileText
                        size={22}
                        className="text-blue-300"
                      />
                    </div>

                    <ArrowUpRight
                      size={19}
                      className="text-slate-600 transition group-hover:text-blue-300"
                    />

                  </div>

                  <h3 className="mt-9 text-2xl font-black text-white">
                    CBT Practice
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-slate-500">
                    Test your knowledge with examination-focused computer
                    based practice.
                  </p>

                </div>
              </Link>

            </div>
          </div>
        </section>

        {/* =========================================================
            PREMIUM CTA
        ========================================================= */}

        <section className="relative overflow-hidden">

          <div className="mx-auto max-w-[1600px] px-5 py-24 sm:px-8 lg:px-12 lg:py-32">

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
              className="relative overflow-hidden rounded-[2.25rem] border border-cyan-300/10 bg-gradient-to-br from-cyan-500/[0.12] via-blue-500/[0.08] to-indigo-500/[0.08] p-8 sm:p-12 lg:p-16"
            >

              <div className="absolute right-[-10%] top-[-40%] h-[450px] w-[450px] rounded-full bg-cyan-400/[0.1] blur-[120px]" />

              <div className="relative z-10 flex flex-col justify-between gap-10 lg:flex-row lg:items-end">

                <div>

                  <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-300/15 bg-cyan-300/[0.06] px-4 py-2">

                    <GraduationCap
                      size={14}
                      className="text-cyan-300"
                    />

                    <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-200">
                      Start Learning
                    </span>

                  </div>

                  <h2 className="max-w-4xl text-4xl font-black leading-[0.98] tracking-[-0.05em] text-white sm:text-6xl">
                    Your next academic

                    <span className="block text-cyan-300">
                      chapter starts now.
                    </span>
                  </h2>

                  <p className="mt-6 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
                    Explore your subjects, access digital tools and build
                    the knowledge you need for your academic future.
                  </p>

                </div>

                <Link
                  to="/academy/student-enrollment-login"
                  className="group flex w-full items-center justify-center gap-3 rounded-2xl bg-white px-7 py-4 text-sm font-black text-slate-950 shadow-2xl transition hover:-translate-y-1 sm:w-auto"
                >

                  Get Started

                  <ArrowRight
                    size={18}
                    className="transition-transform group-hover:translate-x-1"
                  />

                </Link>

              </div>
            </motion.div>

          </div>
        </section>

      </main>

      {/* =========================================================
          FOOTER
      ========================================================= */}

      <footer className="border-t border-white/[0.07] bg-[#010208]">

        <div className="mx-auto max-w-[1600px] px-5 py-12 sm:px-8 lg:px-12">

          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">

            <Link
              to="/academy"
              className="flex items-center gap-3"
            >

              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] p-2">
                <img
                  src={cogLogo}
                  alt="Class Of Genius"
                  className="h-full w-full object-contain"
                />
              </div>

              <div>

                <div className="text-sm font-bold text-white">
                  Scholiqen Academy
                </div>

                <div className="text-[9px] font-bold uppercase tracking-[0.22em] text-cyan-300/60">
                  Learn • Grow • Achieve
                </div>

              </div>

            </Link>

            <div className="flex flex-wrap gap-5 text-xs text-slate-600">

              <Link
                to="/academy"
                className="transition hover:text-white"
              >
                Academy
              </Link>

              <Link
                to="/resources"
                className="transition hover:text-white"
              >
                Resources
              </Link>

              <Link
                to="/community"
                className="transition hover:text-white"
              >
                Community
              </Link>

              <Link
                to="/our-story"
                className="transition hover:text-white"
              >
                OurStory
              </Link>

            </div>

          </div>

          <div className="mt-8 border-t border-white/[0.06] pt-6 text-xs text-slate-700">
            © {new Date().getFullYear()} Scholiqen Academy. All rights reserved.
          </div>

        </div>
      </footer>

    </div>
  );
};

export default Academics;
