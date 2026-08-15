import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  ChevronRight,
  Clock3,
  FileText,
  GraduationCap,
  Sparkles,
  Target,
  Trophy,
} from "lucide-react";

import { supabase } from "../../lib/supabaseClient";

const exams = [
  {
    name: "WAEC",
    description: "West African Examinations Council",
    subjects: "Core & Elective Subjects",
    accent: "from-blue-500 to-cyan-400",
  },
  {
    name: "NECO",
    description: "National Examinations Council",
    subjects: "Core & Elective Subjects",
    accent: "from-violet-500 to-purple-400",
  },
  {
    name: "GCE",
    description: "General Certificate Examination",
    subjects: "Multiple Subjects",
    accent: "from-fuchsia-500 to-pink-400",
  },
  {
    name: "JAMB",
    description: "Joint Admissions & Matriculation Board",
    subjects: "UTME Subjects",
    accent: "from-emerald-500 to-teal-400",
  },
  {
    name: "JUPEB",
    description: "Foundation examination",
    subjects: "Foundation Subjects",
    accent: "from-orange-500 to-amber-400",
  },
  {
    name: "IJMB",
    description: "Interim Joint Matriculation Board",
    subjects: "Advanced Subjects",
    accent: "from-red-500 to-orange-400",
  },
  {
    name: "SAT",
    description: "Scholastic Assessment Test",
    subjects: "Math & Reading",
    accent: "from-sky-500 to-blue-400",
  },
  {
    name: "IGCSE",
    description: "International GCSE",
    subjects: "International Subjects",
    accent: "from-indigo-500 to-blue-400",
  },
  {
    name: "ACT",
    description: "American College Testing",
    subjects: "Core Subjects",
    accent: "from-cyan-500 to-sky-400",
  },
  {
    name: "IB",
    description: "International Baccalaureate",
    subjects: "IB Subjects",
    accent: "from-purple-500 to-indigo-400",
  },
  {
    name: "JEE",
    description: "Joint Entrance Examination",
    subjects: "Engineering Subjects",
    accent: "from-yellow-500 to-orange-400",
  },
  {
    name: "NEET",
    description: "National Eligibility Entrance Test",
    subjects: "Medical Subjects",
    accent: "from-green-500 to-emerald-400",
  },
  {
    name: "GCSE",
    description: "General Certificate of Secondary Education",
    subjects: "Core Subjects",
    accent: "from-blue-500 to-indigo-400",
  },
  {
    name: "HSC",
    description: "Higher School Certificate",
    subjects: "Senior Secondary Subjects",
    accent: "from-teal-500 to-cyan-400",
  },
  {
    name: "VCE",
    description: "Victorian Certificate of Education",
    subjects: "VCE Subjects",
    accent: "from-pink-500 to-rose-400",
  },
  {
    name: "QCE",
    description: "Queensland Certificate of Education",
    subjects: "QCE Subjects",
    accent: "from-violet-500 to-fuchsia-400",
  },
  {
    name: "NCEA",
    description: "National Certificate of Educational Achievement",
    subjects: "NCEA Subjects",
    accent: "from-emerald-500 to-green-400",
  },
  {
    name: "IELTS",
    description: "International English Language Testing",
    subjects: "Listening, Reading & More",
    accent: "from-rose-500 to-pink-400",
  },
];

const CBT = () => {
  const navigate = useNavigate();
  const examinationLibraryRef = useRef(null);

  const [questionCount, setQuestionCount] = useState(0);
  const [questionsLoading, setQuestionsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchQuestionCount = async () => {
      try {
        setQuestionsLoading(true);

        const { count, error } = await supabase
          .from("cbt_questions")
          .select("*", {
            count: "exact",
            head: true,
          });

        if (error) {
          console.error("CBT Question Count Error:", error);

          if (mounted) {
            setQuestionCount(0);
          }

          return;
        }

        if (mounted) {
          setQuestionCount(count || 0);
        }
      } catch (error) {
        console.error("CBT Question Count Error:", error);

        if (mounted) {
          setQuestionCount(0);
        }
      } finally {
        if (mounted) {
          setQuestionsLoading(false);
        }
      }
    };

    fetchQuestionCount();

    return () => {
      mounted = false;
    };
  }, []);

  const scrollToExaminationLibrary = () => {
    examinationLibraryRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const formattedQuestionCount = questionsLoading
    ? "..."
    : questionCount.toLocaleString();

  const stats = [
    {
      icon: FileText,
      value: "18+",
      label: "Exam Bodies",
    },
    {
      icon: BookOpen,
      value: formattedQuestionCount,
      label: "Practice Questions",
    },
    {
      icon: Target,
      value: "24/7",
      label: "Practice Access",
    },
    {
      icon: Trophy,
      value: "100%",
      label: "Exam Focused",
    },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050816] text-white">
      {/* =========================================================
          BACKGROUND
      ========================================================== */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-180px] top-[-180px] h-[520px] w-[520px] rounded-full bg-blue-600/10 blur-[150px]" />

        <div className="absolute right-[-180px] top-[20%] h-[520px] w-[520px] rounded-full bg-purple-600/10 blur-[150px]" />

        <div className="absolute bottom-[-200px] left-[25%] h-[500px] w-[500px] rounded-full bg-cyan-500/[0.06] blur-[150px]" />

        <div
          className="absolute inset-0 opacity-[0.18]"
          style={{
            backgroundImage:
              "radial-gradient(rgba(255,255,255,0.18) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-blue-500/[0.05] to-transparent" />

        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-purple-500/[0.05] to-transparent" />
      </div>

      {/* =========================================================
          MAIN
      ========================================================== */}

      <main className="relative z-10 mx-auto max-w-7xl px-5 pb-20 sm:px-8 lg:px-10">
        {/* =======================================================
            HERO
        ======================================================== */}

        <section className="pt-14 sm:pt-20 lg:pt-24">
          <div className="mx-auto max-w-4xl text-center">
            <motion.div
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/[0.08] px-4 py-2 text-xs font-medium text-blue-300 backdrop-blur-xl"
            >
              <Sparkles size={14} />
              <span>Scholiqen Computer-Based Testing</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl font-black tracking-tight sm:text-5xl lg:text-7xl"
            >
              Scholiqen{" "}
              <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-purple-400 bg-clip-text text-transparent">
                CBT Portal
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.6,
                delay: 0.15,
              }}
              className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base"
            >
              Prepare smarter with structured computer-based practice,
              exam-style questions, timed sessions, and detailed performance
              tracking across major examination bodies.
            </motion.p>

            {/* START PRACTICE */}

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.6,
                delay: 0.25,
              }}
              className="mt-8 flex justify-center"
            >
              <button
                onClick={scrollToExaminationLibrary}
                className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-3 text-sm font-semibold shadow-lg shadow-blue-500/20 transition hover:scale-[1.02] hover:shadow-blue-500/30"
              >
                Start Practice

                <ArrowRight
                  size={17}
                  className="transition-transform group-hover:translate-x-1"
                />
              </button>
            </motion.div>
          </div>
        </section>

        {/* =======================================================
            DIVIDER
        ======================================================== */}

        <div className="relative mx-auto mt-14 max-w-6xl">
          <div className="h-px bg-gradient-to-r from-transparent via-blue-400/30 to-transparent" />

          <motion.div
            animate={{
              x: ["-100%", "500%"],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute left-0 top-0 h-px w-40 bg-gradient-to-r from-transparent via-cyan-300 to-transparent"
          />
        </div>

        {/* =======================================================
            STATS
        ======================================================== */}

        <section className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;

            return (
              <motion.div
                key={stat.label}
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  duration: 0.5,
                  delay: 0.1 + index * 0.08,
                }}
                className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.035] p-5 backdrop-blur-xl"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.06] to-transparent opacity-0 transition group-hover:opacity-100" />

                <div className="relative">
                  <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl border border-blue-400/10 bg-blue-500/10 text-blue-400">
                    <Icon size={17} />
                  </div>

                  <div className="text-2xl font-bold text-white">
                    {stat.value}
                  </div>

                  <div className="mt-1 text-[11px] text-slate-500">
                    {stat.label}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </section>

        {/* =======================================================
            EXAMINATION LIBRARY
        ======================================================== */}

        <section
          ref={examinationLibraryRef}
          className="mt-20 scroll-mt-20"
        >
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-blue-400">
                <GraduationCap size={15} />
                Examination Library
              </div>

              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Choose your examination
              </h2>

              <p className="mt-2 max-w-xl text-sm text-slate-500">
                Select an examination body to explore available subjects and
                start a practice session.
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-full border border-white/[0.07] bg-white/[0.035] px-4 py-2 text-xs text-slate-400">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
              CBT System Online
            </div>
          </div>

          {/* =====================================================
              EXAM GRID
          ====================================================== */}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {exams.map((exam, index) => (
              <motion.button
                key={exam.name}
                initial={{
                  opacity: 0,
                  y: 25,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  duration: 0.45,
                  delay: Math.min(index * 0.035, 0.5),
                }}
                whileHover={{
                  y: -5,
                  transition: {
                    duration: 0.2,
                  },
                }}
                whileTap={{
                  scale: 0.98,
                }}
                onClick={() =>
                  navigate(`/cbt/exam/${exam.name}`)
                }
                className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.035] p-5 text-left backdrop-blur-xl transition-colors duration-300 hover:border-white/[0.16] hover:bg-white/[0.055]"
              >
                <div
                  className={`absolute left-0 right-0 top-0 h-[2px] bg-gradient-to-r ${exam.accent} opacity-40 transition-opacity group-hover:opacity-100`}
                />

                <div
                  className={`absolute -right-16 -top-16 h-36 w-36 rounded-full bg-gradient-to-br ${exam.accent} opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-10`}
                />

                <div className="relative">
                  <div className="flex items-start justify-between">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${exam.accent} text-sm font-black text-white shadow-lg`}
                    >
                      {exam.name.slice(0, 2)}
                    </div>

                    <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.035] text-slate-500 transition group-hover:border-blue-400/20 group-hover:text-blue-400">
                      <ChevronRight size={16} />
                    </div>
                  </div>

                  <div className="mt-5">
                    <h3 className="text-lg font-bold tracking-tight text-white">
                      {exam.name}
                    </h3>

                    <p className="mt-1 min-h-[36px] text-xs leading-5 text-slate-500">
                      {exam.description}
                    </p>
                  </div>

                  <div className="mt-5 space-y-2 border-t border-white/[0.06] pt-4">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="flex items-center gap-2 text-slate-500">
                        <BookOpen size={13} />
                        Subjects
                      </span>

                      <span className="text-right text-slate-300">
                        {exam.subjects}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px]">
                      <span className="flex items-center gap-2 text-slate-500">
                        <FileText size={13} />
                        Practice
                      </span>

                      <span className="text-slate-300">
                        Available
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-500 transition group-hover:text-blue-400">
                      Select examination
                    </span>

                    <ArrowRight
                      size={15}
                      className="text-slate-600 transition-all group-hover:translate-x-1 group-hover:text-blue-400"
                    />
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </section>

        {/* =======================================================
            FEATURE BANNER
        ======================================================== */}

        <motion.section
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
          }}
          transition={{
            duration: 0.6,
          }}
          className="relative mt-16 overflow-hidden rounded-3xl border border-blue-400/10 bg-gradient-to-br from-blue-500/[0.09] via-white/[0.025] to-purple-500/[0.08] p-7 sm:p-9"
        >
          <div className="absolute right-[-100px] top-[-100px] h-64 w-64 rounded-full bg-blue-500/10 blur-[90px]" />

          <div className="absolute bottom-[-100px] left-[-100px] h-64 w-64 rounded-full bg-purple-500/10 blur-[90px]" />

          <div className="relative">
            <div className="max-w-3xl">
              <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-400">
                <Clock3 size={14} />
                Built for serious preparation
              </div>

              <h3 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Practice like the real examination.
              </h3>

              <p className="mt-3 text-sm leading-6 text-slate-400">
                Train under realistic CBT conditions, improve your speed,
                strengthen weak subjects, and build confidence before the
                actual examination.
              </p>
            </div>
          </div>
        </motion.section>

        {/* =======================================================
            FOOTER
        ======================================================== */}

        <footer className="mt-16 border-t border-white/[0.06] pt-8 text-center">
          <p className="text-xs text-slate-500">
            Practice exam-standard CBT questions across multiple examination
            bodies.
          </p>

          <div className="mt-3 text-[10px] uppercase tracking-[0.18em] text-slate-700">
            Powered by Scholiqen CBT System ©{" "}
            {new Date().getFullYear()}
          </div>
        </footer>
      </main>
    </div>
  );
};

export default CBT;