import React, {
  useMemo,
  useState,
} from "react";

import {
  motion,
} from "framer-motion";

import {
  useNavigate,
  useOutletContext,
} from "react-router-dom";

import {
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  Clock3,
  FileQuestion,
  Filter,
  GraduationCap,
  History,
  Play,
  Search,
  ShieldCheck,
  Target,
  Trophy,
  XCircle,
} from "lucide-react";

/* =========================================================
   CBT EXAM DATA
========================================================= */

const EXAMS = [
  {
    id: "jamb",
    name: "JAMB",
    fullName: "Joint Admissions and Matriculation Board",
    category: "Nigeria",
    subjects: ["English", "Mathematics", "Biology", "Physics"],
    questions: 40,
    duration: 120,
    attempts: 3,
    completed: 2,
    bestScore: 78,
    progress: 65,
    color: "cyan",
  },
  {
    id: "waec",
    name: "WAEC",
    fullName: "West African Examinations Council",
    category: "Nigeria",
    subjects: ["English", "Mathematics", "Biology", "Chemistry"],
    questions: 40,
    duration: 120,
    attempts: 4,
    completed: 3,
    bestScore: 84,
    progress: 72,
    color: "blue",
  },
  {
    id: "neco",
    name: "NECO",
    fullName: "National Examinations Council",
    category: "Nigeria",
    subjects: ["English", "Mathematics", "Biology", "Physics"],
    questions: 40,
    duration: 120,
    attempts: 2,
    completed: 1,
    bestScore: 71,
    progress: 46,
    color: "violet",
  },
  {
    id: "gce",
    name: "GCE",
    fullName: "General Certificate Examination",
    category: "Nigeria",
    subjects: ["English", "Mathematics", "Biology", "Chemistry"],
    questions: 40,
    duration: 120,
    attempts: 3,
    completed: 1,
    bestScore: 69,
    progress: 38,
    color: "emerald",
  },
  {
    id: "sat",
    name: "SAT",
    fullName: "Scholastic Assessment Test",
    category: "International",
    subjects: ["Reading", "Writing", "Mathematics"],
    questions: 44,
    duration: 134,
    attempts: 2,
    completed: 1,
    bestScore: 76,
    progress: 52,
    color: "amber",
  },
  {
    id: "igcse",
    name: "IGCSE",
    fullName: "International General Certificate",
    category: "International",
    subjects: ["English", "Mathematics", "Biology", "Physics"],
    questions: 40,
    duration: 120,
    attempts: 2,
    completed: 0,
    bestScore: null,
    progress: 0,
    color: "rose",
  },
];

/* =========================================================
   RECENT CBT RESULTS
========================================================= */

const RECENT_RESULTS = [
  {
    id: "result-001",
    exam: "JAMB",
    subject: "Mathematics",
    score: 78,
    questions: 40,
    correct: 31,
    date: "Sep 17, 2026",
  },
  {
    id: "result-002",
    exam: "WAEC",
    subject: "English",
    score: 84,
    questions: 40,
    correct: 34,
    date: "Sep 14, 2026",
  },
  {
    id: "result-003",
    exam: "NECO",
    subject: "Biology",
    score: 71,
    questions: 40,
    correct: 28,
    date: "Sep 11, 2026",
  },
];

/* =========================================================
   HELPERS
========================================================= */

const getInitials = (name = "") => {
  const parts = String(name)
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (!parts.length) return "ST";

  return parts
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
};

const getExamClasses = (color) => {
  const styles = {
    cyan: {
      icon: "bg-cyan-400/10 text-cyan-300",
      badge: "border-cyan-400/20 bg-cyan-400/10 text-cyan-300",
      progress: "bg-cyan-400",
    },
    blue: {
      icon: "bg-blue-400/10 text-blue-300",
      badge: "border-blue-400/20 bg-blue-400/10 text-blue-300",
      progress: "bg-blue-400",
    },
    violet: {
      icon: "bg-violet-400/10 text-violet-300",
      badge: "border-violet-400/20 bg-violet-400/10 text-violet-300",
      progress: "bg-violet-400",
    },
    emerald: {
      icon: "bg-emerald-400/10 text-emerald-300",
      badge: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
      progress: "bg-emerald-400",
    },
    amber: {
      icon: "bg-amber-400/10 text-amber-300",
      badge: "border-amber-400/20 bg-amber-400/10 text-amber-300",
      progress: "bg-amber-400",
    },
    rose: {
      icon: "bg-rose-400/10 text-rose-300",
      badge: "border-rose-400/20 bg-rose-400/10 text-rose-300",
      progress: "bg-rose-400",
    },
  };

  return styles[color] || styles.cyan;
};

/* =========================================================
   COMPONENT
========================================================= */

const StudentCBT = () => {
  const navigate = useNavigate();
  const { student } = useOutletContext() || {};

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  const studentName =
    student?.full_name ||
    student?.name ||
    student?.student_name ||
    student?.first_name ||
    "Student";

  /* =======================================================
     FILTERS
  ======================================================= */

  const categories = [
    "All",
    "Nigeria",
    "International",
  ];

  const filteredExams = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return EXAMS.filter((exam) => {
      const matchesSearch =
        !search ||
        exam.name.toLowerCase().includes(search) ||
        exam.fullName.toLowerCase().includes(search) ||
        exam.subjects.some((subject) =>
          subject.toLowerCase().includes(search)
        );

      const matchesCategory =
        categoryFilter === "All" ||
        exam.category === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [
    searchTerm,
    categoryFilter,
  ]);

  /* =======================================================
     STATS
  ======================================================= */

  const totalAttempts = EXAMS.reduce(
    (total, exam) => total + exam.completed,
    0
  );

  const scores = EXAMS
    .filter((exam) => exam.bestScore !== null)
    .map((exam) => exam.bestScore);

  const averageScore = scores.length
    ? Math.round(
        scores.reduce(
          (total, score) => total + score,
          0
        ) / scores.length
      )
    : 0;

  const completedExams = EXAMS.filter(
    (exam) => exam.completed > 0
  ).length;

  /* =======================================================
     ACTIONS
  ======================================================= */

  const startPractice = (exam) => {
    /*
      Replace this route later with your actual
      Examination Library / CBT exam route.

      Example:
      /cbt/examination-library?exam=jamb
    */

    navigate(
      `/cbt/examination-library?exam=${encodeURIComponent(
        exam.id
      )}`
    );
  };

  const viewResults = () => {
    navigate("/academy/student/progress");
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="min-h-full bg-[#020617] px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* =================================================
            HEADER
        ================================================= */}

        <motion.div
          initial={{
            opacity: 0,
            y: 12,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.35,
          }}
          className="mb-8"
        >
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">

            <div>
              <div className="mb-2 flex items-center gap-2 text-sm text-cyan-300">
                <Target size={16} />
                <span>CBT Practice</span>
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Examination Practice
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                Prepare for your examinations with timed
                computer based practice tests and track your
                performance as you improve.
              </p>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#071426] px-4 py-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
                <GraduationCap size={20} />
              </div>

              <div>
                <p className="text-xs text-slate-500">
                  Candidate
                </p>

                <p className="text-sm font-semibold text-white">
                  {studentName}
                </p>
              </div>
            </div>

          </div>
        </motion.div>

        {/* =================================================
            CBT STATISTICS
        ================================================= */}

        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">

          <StatCard
            icon={FileQuestion}
            label="Practice Tests"
            value={EXAMS.length}
            iconClass="bg-cyan-400/10 text-cyan-300"
          />

          <StatCard
            icon={CheckCircle2}
            label="Completed"
            value={completedExams}
            iconClass="bg-emerald-400/10 text-emerald-300"
          />

          <StatCard
            icon={Target}
            label="Average Score"
            value={`${averageScore}%`}
            iconClass="bg-blue-400/10 text-blue-300"
          />

          <StatCard
            icon={Trophy}
            label="Attempts"
            value={totalAttempts}
            iconClass="bg-amber-400/10 text-amber-300"
          />

        </div>

        {/* =================================================
            QUICK PRACTICE
        ================================================= */}

        <motion.div
          initial={{
            opacity: 0,
            y: 12,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.35,
            delay: 0.05,
          }}
          className="mb-8 overflow-hidden rounded-2xl border border-cyan-400/10 bg-gradient-to-br from-cyan-400/[0.08] via-[#071426] to-[#071426] p-6"
        >
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

            <div className="max-w-2xl">
              <div className="mb-3 flex items-center gap-2">
                <span className="rounded-lg border border-cyan-400/20 bg-cyan-400/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-cyan-300">
                  Practice Mode
                </span>

                <span className="text-xs text-slate-500">
                  Timed CBT
                </span>
              </div>

              <h2 className="text-xl font-bold text-white sm:text-2xl">
                Test yourself under examination conditions.
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                Choose an examination, select your subject,
                answer the questions, and review your result
                after completing the test.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                navigate("/cbt/examination-library")
              }
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-cyan-400 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-300"
            >
              Open Examination Library
              <ArrowRight size={17} />
            </button>

          </div>
        </motion.div>

        {/* =================================================
            SEARCH + FILTER
        ================================================= */}

        <div className="mb-6 rounded-2xl border border-white/10 bg-[#071426] p-4">

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">

            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
              />

              <input
                type="text"
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(event.target.value)
                }
                placeholder="Search examinations or subjects..."
                className="w-full rounded-xl border border-white/10 bg-[#020617] py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/40"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto">
              <Filter
                size={16}
                className="shrink-0 text-slate-500"
              />

              {categories.map((category) => {
                const active =
                  categoryFilter === category;

                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() =>
                      setCategoryFilter(category)
                    }
                    className={`whitespace-nowrap rounded-xl border px-4 py-2.5 text-xs font-semibold transition ${
                      active
                        ? "border-cyan-400/30 bg-cyan-400/10 text-cyan-300"
                        : "border-white/10 bg-[#020617] text-slate-400 hover:text-white"
                    }`}
                  >
                    {category}
                  </button>
                );
              })}
            </div>

          </div>
        </div>

        {/* =================================================
            EXAMINATION LIBRARY
        ================================================= */}

        <div className="mb-4">
          <h2 className="text-lg font-semibold text-white">
            Examination Library
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Select an examination to begin your practice.
          </p>
        </div>

        {filteredExams.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">

            {filteredExams.map((exam, index) => {
              const styles =
                getExamClasses(exam.color);

              return (
                <motion.div
                  key={exam.id}
                  initial={{
                    opacity: 0,
                    y: 12,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    duration: 0.3,
                    delay: index * 0.04,
                  }}
                  className="group rounded-2xl border border-white/10 bg-[#071426] p-5 transition hover:border-cyan-400/20"
                >

                  {/* TOP */}

                  <div className="flex items-start justify-between gap-4">

                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-xl ${styles.icon}`}
                    >
                      <BookOpen size={22} />
                    </div>

                    <span
                      className={`rounded-lg border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${styles.badge}`}
                    >
                      {exam.category}
                    </span>

                  </div>

                  {/* TITLE */}

                  <div className="mt-5">
                    <h3 className="text-lg font-bold text-white">
                      {exam.name}
                    </h3>

                    <p className="mt-1 text-xs text-slate-500">
                      {exam.fullName}
                    </p>
                  </div>

                  {/* SUBJECTS */}

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {exam.subjects.map((subject) => (
                      <span
                        key={subject}
                        className="rounded-md bg-white/[0.03] px-2 py-1 text-[10px] text-slate-400"
                      >
                        {subject}
                      </span>
                    ))}
                  </div>

                  {/* INFO */}

                  <div className="mt-5 grid grid-cols-3 gap-2 border-y border-white/10 py-4">

                    <div>
                      <p className="text-[10px] text-slate-600">
                        Questions
                      </p>

                      <p className="mt-1 text-sm font-semibold text-white">
                        {exam.questions}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] text-slate-600">
                        Duration
                      </p>

                      <p className="mt-1 text-sm font-semibold text-white">
                        {exam.duration}m
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] text-slate-600">
                        Attempts
                      </p>

                      <p className="mt-1 text-sm font-semibold text-white">
                        {exam.completed}/{exam.attempts}
                      </p>
                    </div>

                  </div>

                  {/* PROGRESS */}

                  <div className="mt-4">

                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-[11px] text-slate-500">
                        Preparation progress
                      </span>

                      <span className="text-[11px] font-semibold text-slate-300">
                        {exam.progress}%
                      </span>
                    </div>

                    <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
                      <div
                        className={`h-full rounded-full ${styles.progress}`}
                        style={{
                          width: `${exam.progress}%`,
                        }}
                      />
                    </div>

                  </div>

                  {/* SCORE */}

                  <div className="mt-4 flex items-center justify-between">

                    <div>
                      <p className="text-[10px] text-slate-600">
                        Best score
                      </p>

                      <p className="mt-1 text-sm font-bold text-white">
                        {exam.bestScore !== null
                          ? `${exam.bestScore}%`
                          : "Not attempted"}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        startPractice(exam)
                      }
                      className="inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-4 py-2.5 text-xs font-bold text-slate-950 transition hover:bg-cyan-300"
                    >
                      <Play size={14} />
                      Practice
                    </button>

                  </div>

                </motion.div>
              );
            })}

          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-white/10 bg-[#071426] px-6 py-16 text-center">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-300">
              <Search size={24} />
            </div>

            <h3 className="mt-5 text-lg font-semibold text-white">
              No examinations found
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Try another search term or category.
            </p>

            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                setCategoryFilter("All");
              }}
              className="mt-5 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-xs font-semibold text-slate-300 hover:text-white"
            >
              Reset Filters
            </button>

          </div>
        )}

        {/* =================================================
            RECENT RESULTS
        ================================================= */}

        <section className="mt-10">

          <div className="mb-4 flex items-end justify-between gap-4">

            <div>
              <h2 className="text-lg font-semibold text-white">
                Recent Results
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Review your latest CBT practice performance.
              </p>
            </div>

            <button
              type="button"
              onClick={viewResults}
              className="hidden items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-cyan-300 transition hover:bg-cyan-400/5 sm:flex"
            >
              View Progress
              <ArrowRight size={14} />
            </button>

          </div>

          <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#071426]">

            {RECENT_RESULTS.map((result, index) => (
              <div
                key={result.id}
                className={`flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between ${
                  index !==
                  RECENT_RESULTS.length - 1
                    ? "border-b border-white/10"
                    : ""
                }`}
              >

                <div className="flex items-center gap-4">

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300">
                    <CheckCircle2 size={19} />
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-semibold text-white">
                        {result.exam}
                      </h3>

                      <span className="text-slate-700">
                        •
                      </span>

                      <span className="text-xs text-slate-400">
                        {result.subject}
                      </span>
                    </div>

                    <div className="mt-1 flex flex-wrap items-center gap-3 text-[11px] text-slate-600">
                      <span>
                        {result.correct}/{result.questions} correct
                      </span>

                      <span className="flex items-center gap-1">
                        <History size={12} />
                        {result.date}
                      </span>
                    </div>
                  </div>

                </div>

                <div className="flex items-center justify-between gap-5 sm:justify-end">

                  <div className="text-right">
                    <p className="text-[10px] text-slate-600">
                      Score
                    </p>

                    <p className="text-lg font-bold text-emerald-300">
                      {result.score}%
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={viewResults}
                    className="rounded-xl border border-white/10 bg-white/[0.03] p-2.5 text-slate-400 transition hover:border-cyan-400/20 hover:text-cyan-300"
                    title="View progress"
                  >
                    <ArrowRight size={16} />
                  </button>

                </div>

              </div>
            ))}

          </div>

        </section>

        {/* =================================================
            CBT TIPS
        ================================================= */}

        <motion.section
          initial={{
            opacity: 0,
            y: 12,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.35,
            delay: 0.2,
          }}
          className="mt-8 grid gap-4 md:grid-cols-3"
        >

          <TipCard
            icon={Clock3}
            title="Manage Your Time"
            description="Keep an eye on the timer and avoid spending too long on one question."
          />

          <TipCard
            icon={ShieldCheck}
            title="Read Carefully"
            description="Read every question and all available options before choosing your answer."
          />

          <TipCard
            icon={Award}
            title="Review Results"
            description="Use your results to identify weak areas and focus your next study session."
          />

        </motion.section>

        {/* =================================================
            MOBILE PROGRESS BUTTON
        ================================================= */}

        <button
          type="button"
          onClick={viewResults}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#071426] px-4 py-3 text-xs font-semibold text-cyan-300 sm:hidden"
        >
          View My Progress
          <ArrowRight size={15} />
        </button>

      </div>
    </div>
  );
};

/* =========================================================
   STAT CARD
========================================================= */

const StatCard = ({
  icon: Icon,
  label,
  value,
  iconClass,
}) => {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#071426] p-4">

      <div className="flex items-start justify-between gap-3">

        <div>
          <p className="text-xs text-slate-500">
            {label}
          </p>

          <p className="mt-2 text-2xl font-bold text-white">
            {value}
          </p>
        </div>

        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconClass}`}
        >
          <Icon size={19} />
        </div>

      </div>

    </div>
  );
};

/* =========================================================
   TIP CARD
========================================================= */

const TipCard = ({
  icon: Icon,
  title,
  description,
}) => {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#071426] p-5">

      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
        <Icon size={19} />
      </div>

      <h3 className="mt-4 text-sm font-semibold text-white">
        {title}
      </h3>

      <p className="mt-2 text-xs leading-5 text-slate-500">
        {description}
      </p>

    </div>
  );
};

export default StudentCBT;
