import React, {
  useMemo,
  useState,
} from "react";

import {
  motion,
} from "framer-motion";

import {
  Award,
  BookOpen,
  CheckCircle2,
  Clock3,
  Crown,
  Flame,
  GraduationCap,
  Lock,
  Medal,
  Star,
  Target,
  Trophy,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";

import {
  useNavigate,
  useOutletContext,
} from "react-router-dom";

/* =========================================================
   DEMO ACHIEVEMENTS
========================================================= */

const ACHIEVEMENTS = [
  {
    id: "first-lesson",
    title: "First Step",
    description: "Complete your first lesson.",
    category: "Learning",
    icon: BookOpen,
    color: "cyan",
    unlocked: true,
    date: "Sep 3, 2026",
    progress: 100,
    requirement: "1 lesson completed",
    current: 1,
    target: 1,
  },

  {
    id: "ten-lessons",
    title: "Getting Started",
    description: "Complete 10 lessons.",
    category: "Learning",
    icon: GraduationCap,
    color: "blue",
    unlocked: true,
    date: "Sep 7, 2026",
    progress: 100,
    requirement: "10 lessons completed",
    current: 10,
    target: 10,
  },

  {
    id: "fifty-lessons",
    title: "Knowledge Builder",
    description: "Complete 50 lessons.",
    category: "Learning",
    icon: Award,
    color: "violet",
    unlocked: true,
    date: "Sep 12, 2026",
    progress: 100,
    requirement: "50 lessons completed",
    current: 50,
    target: 50,
  },

  {
    id: "hundred-lessons",
    title: "Learning Machine",
    description: "Complete 100 lessons.",
    category: "Learning",
    icon: Crown,
    color: "amber",
    unlocked: true,
    date: "Sep 16, 2026",
    progress: 100,
    requirement: "100 lessons completed",
    current: 113,
    target: 100,
  },

  {
    id: "perfect-score",
    title: "Perfect Score",
    description: "Score 100% on a lesson, task, or assessment.",
    category: "Performance",
    icon: Star,
    color: "yellow",
    unlocked: false,
    date: null,
    progress: 86,
    requirement: "Get a 100% score",
    current: 86,
    target: 100,
  },

  {
    id: "high-achiever",
    title: "High Achiever",
    description: "Reach an average academic score of 80% or higher.",
    category: "Performance",
    icon: Trophy,
    color: "orange",
    unlocked: false,
    date: null,
    progress: 64,
    requirement: "80% average score",
    current: 51,
    target: 80,
  },

  {
    id: "task-master",
    title: "Task Master",
    description: "Complete 20 academic tasks.",
    category: "Tasks",
    icon: Target,
    color: "emerald",
    unlocked: false,
    date: null,
    progress: 85,
    requirement: "20 tasks completed",
    current: 17,
    target: 20,
  },

  {
    id: "cbt-challenger",
    title: "CBT Challenger",
    description: "Complete 10 CBT practice examinations.",
    category: "CBT",
    icon: Zap,
    color: "purple",
    unlocked: false,
    date: null,
    progress: 40,
    requirement: "10 CBT exams completed",
    current: 4,
    target: 10,
  },

  {
    id: "consistent-learner",
    title: "Consistent Learner",
    description: "Maintain a learning streak of 7 consecutive days.",
    category: "Consistency",
    icon: Flame,
    color: "red",
    unlocked: false,
    date: null,
    progress: 71,
    requirement: "7 day learning streak",
    current: 5,
    target: 7,
  },

  {
    id: "study-champion",
    title: "Study Champion",
    description: "Complete 25 hours of learning activity.",
    category: "Consistency",
    icon: Clock3,
    color: "pink",
    unlocked: false,
    date: null,
    progress: 60,
    requirement: "25 study hours",
    current: 15,
    target: 25,
  },

  {
    id: "subject-master",
    title: "Subject Master",
    description: "Reach 90% progress in any subject.",
    category: "Mastery",
    icon: Medal,
    color: "indigo",
    unlocked: false,
    date: null,
    progress: 91,
    requirement: "90% subject progress",
    current: 82,
    target: 90,
  },

  {
    id: "community-learner",
    title: "Community Learner",
    description: "Participate in 10 academic discussions.",
    category: "Community",
    icon: Users,
    color: "teal",
    unlocked: false,
    date: null,
    progress: 30,
    requirement: "10 discussions",
    current: 3,
    target: 10,
  },
];

/* =========================================================
   HELPERS
========================================================= */

const COLOR_STYLES = {
  cyan: {
    icon: "text-cyan-400",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/20",
    bar: "bg-cyan-400",
  },

  blue: {
    icon: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    bar: "bg-blue-400",
  },

  violet: {
    icon: "text-violet-400",
    bg: "bg-violet-500/10",
    border: "border-violet-500/20",
    bar: "bg-violet-400",
  },

  amber: {
    icon: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    bar: "bg-amber-400",
  },

  yellow: {
    icon: "text-yellow-400",
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/20",
    bar: "bg-yellow-400",
  },

  orange: {
    icon: "text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/20",
    bar: "bg-orange-400",
  },

  emerald: {
    icon: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    bar: "bg-emerald-400",
  },

  purple: {
    icon: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
    bar: "bg-purple-400",
  },

  red: {
    icon: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
    bar: "bg-red-400",
  },

  pink: {
    icon: "text-pink-400",
    bg: "bg-pink-500/10",
    border: "border-pink-500/20",
    bar: "bg-pink-400",
  },

  indigo: {
    icon: "text-indigo-400",
    bg: "bg-indigo-500/10",
    border: "border-indigo-500/20",
    bar: "bg-indigo-400",
  },

  teal: {
    icon: "text-teal-400",
    bg: "bg-teal-500/10",
    border: "border-teal-500/20",
    bar: "bg-teal-400",
  },
};

/* =========================================================
   COMPONENT
========================================================= */

export default function StudentAchievements() {
  const navigate = useNavigate();

  const outletContext = useOutletContext();

  const studentFromContext = outletContext?.student || null;

  const [activeFilter, setActiveFilter] = useState("All");

  const student =
    studentFromContext ||
    (() => {
      try {
        const stored =
          localStorage.getItem("scholiqen_student") ||
          localStorage.getItem("academyStudent") ||
          localStorage.getItem("student") ||
          localStorage.getItem("scholiqen_user");

        return stored ? JSON.parse(stored) : {};
      } catch {
        return {};
      }
    })();

  const studentName =
    student?.firstName ||
    student?.first_name ||
    student?.name ||
    student?.fullName ||
    student?.full_name ||
    "Student";

  const unlockedAchievements = useMemo(
    () =>
      ACHIEVEMENTS.filter(
        (achievement) => achievement.unlocked
      ),
    []
  );

  const lockedAchievements = useMemo(
    () =>
      ACHIEVEMENTS.filter(
        (achievement) => !achievement.unlocked
      ),
    []
  );

  const categories = [
    "All",
    "Learning",
    "Performance",
    "Tasks",
    "CBT",
    "Consistency",
    "Mastery",
    "Community",
  ];

  const filteredAchievements = useMemo(() => {
    if (activeFilter === "All") {
      return ACHIEVEMENTS;
    }

    return ACHIEVEMENTS.filter(
      (achievement) =>
        achievement.category === activeFilter
    );
  }, [activeFilter]);

  const unlockedCount = unlockedAchievements.length;

  const totalCount = ACHIEVEMENTS.length;

  const completionPercentage = Math.round(
    (unlockedCount / totalCount) * 100
  );

  const nextAchievement =
    lockedAchievements[0] || null;

  return (
    <div className="min-h-full bg-[#020617] text-slate-100">
      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div className="mb-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-400">
              <Trophy size={14} />
              Student Achievements
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
              Your Achievements
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              Keep learning, completing tasks, improving your
              scores, and building your academic record.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              navigate("/academy/student/progress")
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:border-cyan-500/40 hover:bg-slate-800"
          >
            <TrendingUp size={17} />
            View Progress
          </button>
        </div>
      </div>

      {/* =====================================================
          ACHIEVEMENT SUMMARY
      ===================================================== */}

      <section className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/10 to-slate-900/60 p-5"
        >
          <div className="mb-4 flex items-center justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
              <Trophy size={22} />
            </div>

            <span className="text-xs font-medium text-slate-500">
              Unlocked
            </span>
          </div>

          <div className="text-3xl font-bold text-white">
            {unlockedCount}
          </div>

          <p className="mt-1 text-sm text-slate-400">
            Achievements earned
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5"
        >
          <div className="mb-4 flex items-center justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
              <Award size={22} />
            </div>

            <span className="text-xs font-medium text-slate-500">
              Total
            </span>
          </div>

          <div className="text-3xl font-bold text-white">
            {totalCount}
          </div>

          <p className="mt-1 text-sm text-slate-400">
            Available achievements
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5"
        >
          <div className="mb-4 flex items-center justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
              <Target size={22} />
            </div>

            <span className="text-xs font-medium text-slate-500">
              Completion
            </span>
          </div>

          <div className="text-3xl font-bold text-white">
            {completionPercentage}%
          </div>

          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-800">
            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: `${completionPercentage}%`,
              }}
              transition={{
                duration: 0.8,
              }}
              className="h-full rounded-full bg-violet-400"
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5"
        >
          <div className="mb-4 flex items-center justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
              <Flame size={22} />
            </div>

            <span className="text-xs font-medium text-slate-500">
              Current streak
            </span>
          </div>

          <div className="text-3xl font-bold text-white">
            5 days
          </div>

          <p className="mt-1 text-sm text-slate-400">
            Keep learning every day
          </p>
        </motion.div>
      </section>

      {/* =====================================================
          NEXT ACHIEVEMENT
      ===================================================== */}

      {nextAchievement && (
        <section className="mb-8 overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900/90 to-[#071426]">
          <div className="grid gap-6 p-6 lg:grid-cols-[1fr_auto] lg:items-center lg:p-7">
            <div className="flex items-start gap-4">
              <div
                className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${
                  COLOR_STYLES[nextAchievement.color]?.bg ||
                  "bg-cyan-500/10"
                } ${
                  COLOR_STYLES[nextAchievement.color]?.icon ||
                  "text-cyan-400"
                }`}
              >
                <nextAchievement.icon size={26} />
              </div>

              <div className="min-w-0">
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
                    Next Achievement
                  </span>

                  <span className="rounded-full border border-slate-700 bg-slate-800/70 px-2 py-1 text-[10px] font-medium text-slate-400">
                    {nextAchievement.category}
                  </span>
                </div>

                <h2 className="text-xl font-bold text-white">
                  {nextAchievement.title}
                </h2>

                <p className="mt-1 max-w-2xl text-sm text-slate-400">
                  {nextAchievement.description}
                </p>

                <div className="mt-4 max-w-xl">
                  <div className="mb-2 flex items-center justify-between text-xs">
                    <span className="text-slate-500">
                      Progress
                    </span>

                    <span className="font-semibold text-slate-300">
                      {nextAchievement.current} /{" "}
                      {nextAchievement.target}
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: `${nextAchievement.progress}%`,
                      }}
                      transition={{
                        duration: 0.8,
                      }}
                      className={`h-full rounded-full ${
                        COLOR_STYLES[nextAchievement.color]?.bar ||
                        "bg-cyan-400"
                      }`}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/50 px-5 py-4 lg:min-w-[170px]">
              <p className="text-xs text-slate-500">
                Requirement
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-200">
                {nextAchievement.requirement}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* =====================================================
          FILTERS
      ===================================================== */}

      <section className="mb-6">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-800">
          {categories.map((category) => {
            const active =
              activeFilter === category;

            return (
              <button
                key={category}
                type="button"
                onClick={() =>
                  setActiveFilter(category)
                }
                className={`whitespace-nowrap rounded-xl border px-4 py-2.5 text-sm font-medium transition ${
                  active
                    ? "border-cyan-500/30 bg-cyan-500/10 text-cyan-400"
                    : "border-slate-800 bg-slate-900/50 text-slate-400 hover:border-slate-700 hover:bg-slate-800 hover:text-slate-200"
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>
      </section>

      {/* =====================================================
          ACHIEVEMENTS GRID
      ===================================================== */}

      <section>
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">
              Achievement Collection
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {filteredAchievements.length} achievement
              {filteredAchievements.length !== 1
                ? "s"
                : ""}{" "}
              shown
            </p>
          </div>
        </div>

        {filteredAchievements.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 px-6 py-16 text-center">
            <Award
              size={38}
              className="mx-auto text-slate-600"
            />

            <h3 className="mt-4 text-lg font-semibold text-white">
              No achievements found
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Try selecting another category.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredAchievements.map(
              (achievement, index) => {
                const Icon = achievement.icon;

                const styles =
                  COLOR_STYLES[achievement.color] ||
                  COLOR_STYLES.cyan;

                return (
                  <motion.article
                    key={achievement.id}
                    initial={{
                      opacity: 0,
                      y: 15,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    transition={{
                      delay: index * 0.035,
                    }}
                    className={`group relative overflow-hidden rounded-2xl border bg-slate-900/50 p-5 transition ${
                      achievement.unlocked
                        ? `${styles.border} hover:bg-slate-900`
                        : "border-slate-800 opacity-80 hover:opacity-100"
                    }`}
                  >
                    {achievement.unlocked && (
                      <div className="absolute right-4 top-4">
                        <div className="flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-400">
                          <CheckCircle2 size={11} />
                          Earned
                        </div>
                      </div>
                    )}

                    {!achievement.unlocked && (
                      <div className="absolute right-4 top-4">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-700 bg-slate-950 text-slate-500">
                          <Lock size={14} />
                        </div>
                      </div>
                    )}

                    <div
                      className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl ${styles.bg} ${styles.icon}`}
                    >
                      <Icon size={27} />
                    </div>

                    <div className="mb-2 pr-12">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                        {achievement.category}
                      </p>

                      <h3 className="mt-1 text-lg font-bold text-white">
                        {achievement.title}
                      </h3>
                    </div>

                    <p className="min-h-[48px] text-sm leading-6 text-slate-400">
                      {achievement.description}
                    </p>

                    {achievement.unlocked ? (
                      <div className="mt-5 flex items-center justify-between border-t border-slate-800 pt-4">
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <CheckCircle2
                            size={14}
                            className="text-emerald-400"
                          />
                          Earned
                        </div>

                        <span className="text-xs font-medium text-slate-400">
                          {achievement.date}
                        </span>
                      </div>
                    ) : (
                      <div className="mt-5 border-t border-slate-800 pt-4">
                        <div className="mb-2 flex items-center justify-between text-xs">
                          <span className="text-slate-500">
                            Progress
                          </span>

                          <span className="font-semibold text-slate-300">
                            {achievement.current}/
                            {achievement.target}
                          </span>
                        </div>

                        <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
                          <motion.div
                            initial={{
                              width: 0,
                            }}
                            animate={{
                              width: `${achievement.progress}%`,
                            }}
                            transition={{
                              duration: 0.7,
                              delay: index * 0.035,
                            }}
                            className={`h-full rounded-full ${styles.bar}`}
                          />
                        </div>

                        <p className="mt-2 text-xs text-slate-500">
                          {achievement.requirement}
                        </p>
                      </div>
                    )}
                  </motion.article>
                );
              }
            )}
          </div>
        )}
      </section>

      {/* =====================================================
          MOTIVATION
      ===================================================== */}

      <section className="mt-8 rounded-2xl border border-cyan-500/15 bg-gradient-to-r from-cyan-500/5 via-slate-900/60 to-blue-500/5 p-6 md:p-7">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
              <Flame size={23} />
            </div>

            <div>
              <h3 className="text-lg font-bold text-white">
                Keep going, {studentName}.
              </h3>

              <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-400">
                You have already earned{" "}
                <span className="font-semibold text-cyan-400">
                  {unlockedCount}
                </span>{" "}
                achievements. Keep completing lessons,
                submitting tasks, and practicing with CBTs to
                unlock more.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              navigate("/academy/student/lessons")
            }
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-400"
          >
            <BookOpen size={17} />
            Continue Learning
          </button>
        </div>
      </section>
    </div>
  );
}
