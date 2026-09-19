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
  Award,
  BarChart3,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock3,
  GraduationCap,
  Target,
  TrendingUp,
  Trophy,
  XCircle,
} from "lucide-react";

/* =========================================================
   SUBJECT PROGRESS DATA
========================================================= */

const SUBJECT_PROGRESS = [
  {
    id: "mathematics",
    name: "Mathematics",
    code: "MTH",
    category: "Science",
    progress: 82,
    completed: 26,
    totalLessons: 32,
    score: 82,
    studyTime: 18,
    trend: "+8%",
    color: "cyan",
  },
  {
    id: "english",
    name: "English Language",
    code: "ENG",
    category: "Languages",
    progress: 76,
    completed: 21,
    totalLessons: 28,
    score: 76,
    studyTime: 15,
    trend: "+5%",
    color: "blue",
  },
  {
    id: "biology",
    name: "Biology",
    code: "BIO",
    category: "Science",
    progress: 68,
    completed: 20,
    totalLessons: 30,
    score: 68,
    studyTime: 14,
    trend: "+7%",
    color: "emerald",
  },
  {
    id: "physics",
    name: "Physics",
    code: "PHY",
    category: "Science",
    progress: 61,
    completed: 16,
    totalLessons: 26,
    score: 61,
    studyTime: 12,
    trend: "+3%",
    color: "violet",
  },
  {
    id: "chemistry",
    name: "Chemistry",
    code: "CHE",
    category: "Science",
    progress: 48,
    completed: 14,
    totalLessons: 29,
    score: 48,
    studyTime: 10,
    trend: "+6%",
    color: "amber",
  },
  {
    id: "computer-science",
    name: "Computer Science",
    code: "CSC",
    category: "Technology",
    progress: 35,
    completed: 8,
    totalLessons: 24,
    score: 35,
    studyTime: 8,
    trend: "+4%",
    color: "rose",
  },
  {
    id: "economics",
    name: "Economics",
    code: "ECO",
    category: "Social Science",
    progress: 24,
    completed: 5,
    totalLessons: 22,
    score: 24,
    studyTime: 6,
    trend: "+2%",
    color: "sky",
  },
  {
    id: "civic-education",
    name: "Civic Education",
    code: "CVE",
    category: "Social Science",
    progress: 15,
    completed: 3,
    totalLessons: 18,
    score: 15,
    studyTime: 4,
    trend: "+1%",
    color: "orange",
  },
];

/* =========================================================
   RECENT ACTIVITY
========================================================= */

const RECENT_ACTIVITY = [
  {
    id: "activity-001",
    title: "Completed Introduction to Algebra",
    subject: "Mathematics",
    date: "Today",
    score: "92%",
    type: "Lesson",
    icon: BookOpen,
    iconClass: "bg-cyan-400/10 text-cyan-300",
  },
  {
    id: "activity-002",
    title: "Completed JAMB Mathematics CBT",
    subject: "Mathematics",
    date: "Yesterday",
    score: "78%",
    type: "CBT",
    icon: Target,
    iconClass: "bg-blue-400/10 text-blue-300",
  },
  {
    id: "activity-003",
    title: "Submitted Cell Biology Worksheet",
    subject: "Biology",
    date: "Sep 16, 2026",
    score: "Pending",
    type: "Task",
    icon: CheckCircle2,
    iconClass: "bg-emerald-400/10 text-emerald-300",
  },
  {
    id: "activity-004",
    title: "Completed Reading Comprehension",
    subject: "English",
    date: "Sep 15, 2026",
    score: "86%",
    type: "Lesson",
    icon: BookOpen,
    iconClass: "bg-violet-400/10 text-violet-300",
  },
];

/* =========================================================
   WEEKLY STUDY DATA
========================================================= */

const WEEKLY_ACTIVITY = [
  {
    day: "Mon",
    hours: 1.5,
  },
  {
    day: "Tue",
    hours: 2.1,
  },
  {
    day: "Wed",
    hours: 1.2,
  },
  {
    day: "Thu",
    hours: 2.8,
  },
  {
    day: "Fri",
    hours: 1.9,
  },
  {
    day: "Sat",
    hours: 3.2,
  },
  {
    day: "Sun",
    hours: 2.4,
  },
];

/* =========================================================
   HELPERS
========================================================= */

const getProgressClasses = (color) => {
  const styles = {
    cyan: {
      bar: "bg-cyan-400",
      text: "text-cyan-300",
      icon: "bg-cyan-400/10 text-cyan-300",
    },
    blue: {
      bar: "bg-blue-400",
      text: "text-blue-300",
      icon: "bg-blue-400/10 text-blue-300",
    },
    emerald: {
      bar: "bg-emerald-400",
      text: "text-emerald-300",
      icon: "bg-emerald-400/10 text-emerald-300",
    },
    violet: {
      bar: "bg-violet-400",
      text: "text-violet-300",
      icon: "bg-violet-400/10 text-violet-300",
    },
    amber: {
      bar: "bg-amber-400",
      text: "text-amber-300",
      icon: "bg-amber-400/10 text-amber-300",
    },
    rose: {
      bar: "bg-rose-400",
      text: "text-rose-300",
      icon: "bg-rose-400/10 text-rose-300",
    },
    sky: {
      bar: "bg-sky-400",
      text: "text-sky-300",
      icon: "bg-sky-400/10 text-sky-300",
    },
    orange: {
      bar: "bg-orange-400",
      text: "text-orange-300",
      icon: "bg-orange-400/10 text-orange-300",
    },
  };

  return styles[color] || styles.cyan;
};

/* =========================================================
   COMPONENT
========================================================= */

const StudentProgress = () => {
  const navigate = useNavigate();
  const { student } = useOutletContext() || {};

  const [period, setPeriod] = useState("This Week");

  const studentName =
    student?.full_name ||
    student?.name ||
    student?.student_name ||
    student?.first_name ||
    "Student";

  /* =======================================================
     OVERALL CALCULATIONS
  ======================================================= */

  const overallProgress = useMemo(() => {
    const totalProgress = SUBJECT_PROGRESS.reduce(
      (total, subject) => total + subject.progress,
      0
    );

    return Math.round(
      totalProgress / SUBJECT_PROGRESS.length
    );
  }, []);

  const totalLessons = useMemo(() => {
    return SUBJECT_PROGRESS.reduce(
      (total, subject) =>
        total + subject.totalLessons,
      0
    );
  }, []);

  const completedLessons = useMemo(() => {
    return SUBJECT_PROGRESS.reduce(
      (total, subject) =>
        total + subject.completed,
      0
    );
  }, []);

  const totalStudyHours = useMemo(() => {
    return WEEKLY_ACTIVITY.reduce(
      (total, day) => total + day.hours,
      0
    );
  }, []);

  const averageScore = useMemo(() => {
    const total = SUBJECT_PROGRESS.reduce(
      (sum, subject) => sum + subject.score,
      0
    );

    return Math.round(
      total / SUBJECT_PROGRESS.length
    );
  }, []);

  const bestSubject = useMemo(() => {
    return [...SUBJECT_PROGRESS].sort(
      (a, b) => b.progress - a.progress
    )[0];
  }, []);

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
                <TrendingUp size={16} />
                <span>Learning Progress</span>
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Your Progress
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                Track your lessons, scores, study activity,
                and overall academic progress.
              </p>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#071426] px-4 py-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
                <GraduationCap size={20} />
              </div>

              <div>
                <p className="text-xs text-slate-500">
                  Student
                </p>

                <p className="text-sm font-semibold text-white">
                  {studentName}
                </p>
              </div>

            </div>

          </div>
        </motion.div>

        {/* =================================================
            OVERALL PROGRESS HERO
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
            delay: 0.04,
          }}
          className="mb-8 overflow-hidden rounded-2xl border border-cyan-400/10 bg-gradient-to-br from-cyan-400/[0.08] via-[#071426] to-[#071426] p-6"
        >
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-lg border border-cyan-400/20 bg-cyan-400/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-cyan-300">
                  Overall Performance
                </span>

                <span className="text-xs text-slate-500">
                  All Subjects
                </span>
              </div>

              <div className="mt-5 flex items-end gap-3">
                <span className="text-5xl font-bold tracking-tight text-white">
                  {overallProgress}%
                </span>

                <span className="mb-1.5 flex items-center gap-1 text-xs font-semibold text-emerald-300">
                  <TrendingUp size={13} />
                  +6% this month
                </span>
              </div>

              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">
                You have completed {completedLessons} of{" "}
                {totalLessons} lessons across your subjects.
                Keep building consistency to improve your
                overall performance.
              </p>

              <div className="mt-5 max-w-xl">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    Overall completion
                  </span>

                  <span className="text-xs font-semibold text-cyan-300">
                    {overallProgress}%
                  </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-white/5">
                  <motion.div
                    initial={{
                      width: 0,
                    }}
                    animate={{
                      width: `${overallProgress}%`,
                    }}
                    transition={{
                      duration: 0.8,
                      ease: "easeOut",
                    }}
                    className="h-full rounded-full bg-cyan-400"
                  />
                </div>
              </div>
            </div>

            <div className="flex h-36 w-36 shrink-0 items-center justify-center rounded-full border-8 border-cyan-400/10 bg-[#020617] sm:h-40 sm:w-40">

              <div className="text-center">
                <p className="text-3xl font-bold text-white">
                  {overallProgress}%
                </p>

                <p className="mt-1 text-[10px] uppercase tracking-wider text-slate-500">
                  Complete
                </p>
              </div>

            </div>

          </div>
        </motion.section>

        {/* =================================================
            SUMMARY STATS
        ================================================= */}

        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">

          <ProgressStat
            icon={BookOpen}
            label="Lessons Completed"
            value={completedLessons}
            suffix={` / ${totalLessons}`}
            iconClass="bg-cyan-400/10 text-cyan-300"
          />

          <ProgressStat
            icon={Target}
            label="Average Score"
            value={averageScore}
            suffix="%"
            iconClass="bg-blue-400/10 text-blue-300"
          />

          <ProgressStat
            icon={Clock3}
            label="Study Time"
            value={totalStudyHours.toFixed(1)}
            suffix=" hrs"
            iconClass="bg-violet-400/10 text-violet-300"
          />

          <ProgressStat
            icon={Trophy}
            label="Top Subject"
            value={bestSubject.code}
            suffix=""
            iconClass="bg-amber-400/10 text-amber-300"
          />

        </div>

        {/* =================================================
            MAIN GRID
        ================================================= */}

        <div className="grid gap-6 xl:grid-cols-[1.55fr_1fr]">

          {/* ===============================================
              SUBJECT PROGRESS
          =============================================== */}

          <section className="rounded-2xl border border-white/10 bg-[#071426] p-5 sm:p-6">

            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">

              <div>
                <h2 className="text-lg font-semibold text-white">
                  Subject Progress
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Your current progress across every subject.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  navigate("/academy/student/subjects")
                }
                className="inline-flex items-center gap-2 self-start rounded-lg px-2 py-1.5 text-xs font-semibold text-cyan-300 transition hover:bg-cyan-400/5"
              >
                View Subjects
                <TrendingUp size={14} />
              </button>

            </div>

            <div className="space-y-5">

              {SUBJECT_PROGRESS.map(
                (subject, index) => {
                  const styles =
                    getProgressClasses(
                      subject.color
                    );

                  return (
                    <motion.div
                      key={subject.id}
                      initial={{
                        opacity: 0,
                        x: -8,
                      }}
                      animate={{
                        opacity: 1,
                        x: 0,
                      }}
                      transition={{
                        duration: 0.3,
                        delay: index * 0.035,
                      }}
                    >

                      <div className="mb-2 flex items-center justify-between gap-4">

                        <div className="flex min-w-0 items-center gap-3">

                          <div
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${styles.icon}`}
                          >
                            <span className="text-[10px] font-bold">
                              {subject.code}
                            </span>
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-white">
                              {subject.name}
                            </p>

                            <p className="mt-0.5 text-[10px] text-slate-600">
                              {subject.completed}/
                              {subject.totalLessons} lessons
                            </p>
                          </div>

                        </div>

                        <div className="text-right">
                          <p
                            className={`text-sm font-bold ${styles.text}`}
                          >
                            {subject.progress}%
                          </p>

                          <p className="text-[10px] text-emerald-400">
                            {subject.trend}
                          </p>
                        </div>

                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-white/5">
                        <motion.div
                          initial={{
                            width: 0,
                          }}
                          animate={{
                            width: `${subject.progress}%`,
                          }}
                          transition={{
                            duration: 0.7,
                            delay: index * 0.05,
                            ease: "easeOut",
                          }}
                          className={`h-full rounded-full ${styles.bar}`}
                        />
                      </div>

                    </motion.div>
                  );
                }
              )}

            </div>

          </section>

          {/* ===============================================
              WEEKLY STUDY ACTIVITY
          =============================================== */}

          <section className="rounded-2xl border border-white/10 bg-[#071426] p-5 sm:p-6">

            <div className="flex items-start justify-between gap-4">

              <div>
                <h2 className="text-lg font-semibold text-white">
                  Study Activity
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Your learning activity for the week.
                </p>
              </div>

              <div className="relative">
                <select
                  value={period}
                  onChange={(event) =>
                    setPeriod(event.target.value)
                  }
                  className="appearance-none rounded-lg border border-white/10 bg-[#020617] py-2 pl-3 pr-8 text-[10px] font-medium text-slate-400 outline-none"
                >
                  <option
                    value="This Week"
                    className="bg-[#020617]"
                  >
                    This Week
                  </option>

                  <option
                    value="This Month"
                    className="bg-[#020617]"
                  >
                    This Month
                  </option>

                  <option
                    value="This Year"
                    className="bg-[#020617]"
                  >
                    This Year
                  </option>
                </select>

                <ChevronDown
                  size={13}
                  className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-600"
                />
              </div>

            </div>

            <div className="mt-8">

              <div className="flex h-52 items-end justify-between gap-2">

                {WEEKLY_ACTIVITY.map(
                  (day, index) => {
                    const maxHours = Math.max(
                      ...WEEKLY_ACTIVITY.map(
                        (item) => item.hours
                      )
                    );

                    const height =
                      (day.hours / maxHours) *
                      100;

                    return (
                      <div
                        key={day.day}
                        className="flex h-full flex-1 flex-col items-center justify-end gap-2"
                      >

                        <div className="relative flex h-full w-full items-end justify-center">

                          <motion.div
                            initial={{
                              height: 0,
                            }}
                            animate={{
                              height: `${height}%`,
                            }}
                            transition={{
                              duration: 0.65,
                              delay: index * 0.06,
                              ease: "easeOut",
                            }}
                            className="group relative w-full max-w-8 rounded-t-lg bg-cyan-400/70 transition hover:bg-cyan-300"
                          >
                            <div className="absolute -top-7 left-1/2 hidden -translate-x-1/2 rounded-md border border-white/10 bg-[#020617] px-2 py-1 text-[9px] text-white group-hover:block">
                              {day.hours}h
                            </div>
                          </motion.div>

                        </div>

                        <span className="text-[10px] text-slate-600">
                          {day.day}
                        </span>

                      </div>
                    );
                  }
                )}

              </div>

              <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">

                <div className="flex items-center gap-2">
                  <CalendarDays
                    size={14}
                    className="text-slate-600"
                  />

                  <span className="text-xs text-slate-500">
                    {period}
                  </span>
                </div>

                <span className="text-sm font-bold text-cyan-300">
                  {totalStudyHours.toFixed(1)} hours
                </span>

              </div>

            </div>

          </section>

        </div>

        {/* =================================================
            RECENT ACTIVITY + ACHIEVEMENT
        ================================================= */}

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_1fr]">

          {/* ===============================================
              RECENT ACTIVITY
          =============================================== */}

          <section className="rounded-2xl border border-white/10 bg-[#071426] p-5 sm:p-6">

            <div className="mb-5">
              <h2 className="text-lg font-semibold text-white">
                Recent Activity
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Your latest learning activities.
              </p>
            </div>

            <div className="space-y-2">

              {RECENT_ACTIVITY.map(
                (activity) => {
                  const Icon = activity.icon;

                  return (
                    <div
                      key={activity.id}
                      className="flex items-center gap-4 rounded-xl border border-transparent p-3 transition hover:border-white/10 hover:bg-white/[0.02]"
                    >

                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${activity.iconClass}`}
                      >
                        <Icon size={18} />
                      </div>

                      <div className="min-w-0 flex-1">

                        <p className="truncate text-sm font-medium text-white">
                          {activity.title}
                        </p>

                        <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px] text-slate-600">
                          <span>
                            {activity.subject}
                          </span>

                          <span>•</span>

                          <span>
                            {activity.type}
                          </span>

                          <span>•</span>

                          <span>
                            {activity.date}
                          </span>
                        </div>

                      </div>

                      <div className="shrink-0 text-right">

                        {activity.score ===
                        "Pending" ? (
                          <span className="text-[10px] font-medium text-amber-300">
                            Pending
                          </span>
                        ) : (
                          <span className="text-sm font-bold text-emerald-300">
                            {activity.score}
                          </span>
                        )}

                      </div>

                    </div>
                  );
                }
              )}

            </div>

          </section>

          {/* ===============================================
              PERFORMANCE SUMMARY
          =============================================== */}

          <section className="rounded-2xl border border-white/10 bg-[#071426] p-5 sm:p-6">

            <div className="mb-6">
              <h2 className="text-lg font-semibold text-white">
                Performance Summary
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                A quick look at your learning performance.
              </p>
            </div>

            <div className="space-y-4">

              <PerformanceRow
                icon={Trophy}
                label="Highest Progress"
                value={`${bestSubject.name} • ${bestSubject.progress}%`}
                iconClass="bg-amber-400/10 text-amber-300"
              />

              <PerformanceRow
                icon={Target}
                label="Average Score"
                value={`${averageScore}%`}
                iconClass="bg-cyan-400/10 text-cyan-300"
              />

              <PerformanceRow
                icon={BookOpen}
                label="Lessons Completed"
                value={`${completedLessons}`}
                iconClass="bg-blue-400/10 text-blue-300"
              />

              <PerformanceRow
                icon={Clock3}
                label="Weekly Study Time"
                value={`${totalStudyHours.toFixed(1)} hrs`}
                iconClass="bg-violet-400/10 text-violet-300"
              />

            </div>

            <div className="mt-6 rounded-xl border border-emerald-400/10 bg-emerald-400/[0.04] p-4">

              <div className="flex items-start gap-3">

                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-400/10 text-emerald-300">
                  <TrendingUp size={17} />
                </div>

                <div>
                  <p className="text-sm font-semibold text-white">
                    Keep your momentum
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Consistent study sessions can help you
                    maintain progress across your subjects.
                  </p>
                </div>

              </div>

            </div>

          </section>

        </div>

        {/* =================================================
            BOTTOM ACTIONS
        ================================================= */}

        <section className="mt-6 grid gap-4 sm:grid-cols-3">

          <ProgressAction
            icon={BookOpen}
            title="Continue Lessons"
            description="Continue where you stopped."
            onClick={() =>
              navigate("/academy/student/lessons")
            }
          />

          <ProgressAction
            icon={Target}
            title="Practice CBT"
            description="Test your knowledge."
            onClick={() =>
              navigate("/academy/student/cbt")
            }
          />

          <ProgressAction
            icon={Award}
            title="View Achievements"
            description="See your earned milestones."
            onClick={() =>
              navigate("/academy/student/achievements")
            }
          />

        </section>

      </div>
    </div>
  );
};

/* =========================================================
   PROGRESS STAT
========================================================= */

const ProgressStat = ({
  icon: Icon,
  label,
  value,
  suffix,
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
            <span className="text-sm font-medium text-slate-500">
              {suffix}
            </span>
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
   PERFORMANCE ROW
========================================================= */

const PerformanceRow = ({
  icon: Icon,
  label,
  value,
  iconClass,
}) => {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-[#020617]/50 p-3">

      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${iconClass}`}
      >
        <Icon size={16} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[10px] text-slate-600">
          {label}
        </p>

        <p className="mt-0.5 truncate text-xs font-semibold text-white">
          {value}
        </p>
      </div>

    </div>
  );
};

/* =========================================================
   PROGRESS ACTION
========================================================= */

const ProgressAction = ({
  icon: Icon,
  title,
  description,
  onClick,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-[#071426] p-4 text-left transition hover:border-cyan-400/20 hover:bg-[#0a182b]"
    >

      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300 transition group-hover:bg-cyan-400/15">
        <Icon size={18} />
      </div>

      <div className="min-w-0">
        <p className="text-sm font-semibold text-white">
          {title}
        </p>

        <p className="mt-1 text-xs text-slate-500">
          {description}
        </p>
      </div>

    </button>
  );
};

export default StudentProgress;
