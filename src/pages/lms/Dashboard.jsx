// src/pages/lms/Dashboard.jsx

import React from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  CheckCircle2,
  Clock3,
  Trophy,
  Flame,
  TrendingUp,
  CalendarDays,
  PlayCircle,
  ArrowRight,
  Target,
  Brain,
  Sparkles,
  BarChart3,
  Award,
} from "lucide-react";

import { Link } from "react-router-dom";

/* =========================
   CONTEXTS
========================= */

import { useCourses } from "../../context/LMSContext/CourseContext";
import { useProgress } from "../../context/LMSContext/ProgressContext";
import { useWeeklyTasks } from "../../context/LMSContext/WeeklyTaskContext";
import { useCertificates } from "../../context/LMSContext/CertificateContext";
import { useAchievements } from "../../context/LMSContext/AchievementContext";
import { useProfile } from "../../context/LMSContext/ProfileContext";

import Footer from "../../components/lms/Footer";

/* =========================
   GLASS CARD
========================= */

const GlassCard = ({ children, className = "" }) => (
  <motion.div
    whileHover={{ y: -4 }}
    transition={{ duration: 0.25 }}
    className={`relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/55 backdrop-blur-xl p-6 ${className}`}
  >
    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] via-transparent to-cyan-500/[0.03]" />
    <div className="relative z-10">{children}</div>
  </motion.div>
);

/* =========================
   PREMIUM STAT CARD
========================= */

const StatCard = ({
  title,
  value,
  icon: Icon,
  color,
  subtitle,
}) => (
  <motion.div
    whileHover={{
      y: -8,
      scale: 1.02,
    }}
    transition={{
      duration: 0.25,
    }}
    className="group relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/70 p-6"
  >
    <div
      className={`absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100 ${color}`}
    />

    <div className="relative z-10">
      <div className="flex items-center justify-between">
        <div className="rounded-2xl bg-white/10 p-4">
          <Icon size={28} />
        </div>

        <ArrowRight
          size={18}
          className="opacity-0 transition group-hover:translate-x-1 group-hover:opacity-100"
        />
      </div>

      <h2 className="mt-6 text-4xl font-black">
        {value}
      </h2>

      <p className="mt-2 text-slate-300 font-semibold">
        {title}
      </p>

      <p className="mt-1 text-sm text-slate-500">
        {subtitle}
      </p>
    </div>
  </motion.div>
);

/* =========================
   DASHBOARD
========================= */

const Dashboard = () => {

  const {
    totalCourses = 0,
  } = useCourses() || {};

  const {
    profile,
  } = useProfile() || {};

  const {
    currentLearning = [],
    weeklyProgress = [],
    totalCompletedLessons = 0,
    studyHours = 0,
    completeLesson = () => {},
  } = useProgress() || {};

  const {
    tasks = [],
  } = useWeeklyTasks() || {};

  const {
    totalCertificates = 0,
  } = useCertificates() || {};

  const {
    badges = [],
  } = useAchievements() || {};

  /* =========================
     SAFE DATA
  ========================= */

  const username =
    profile?.username
      ? profile.username.charAt(0).toUpperCase() +
        profile.username.slice(1)
      : "Student";

  const firstName = username.split(" ")[0];

  const greeting = (() => {
    const hour = new Date().getHours();

    if (hour < 12) return "Good Morning";

    if (hour < 17) return "Good Afternoon";

    return "Ready to learn today?";
  })();

  const today = new Date().toLocaleDateString(
    "en-US",
    {
      weekday: "long",
      month: "long",
      day: "numeric",
    }
  );

  const courses = Array.isArray(currentLearning)
    ? currentLearning
    : [];

  const progress = Array.isArray(weeklyProgress)
    ? weeklyProgress
    : [];

  const weeklyTasks = Array.isArray(tasks)
    ? tasks
    : [];

  const achievements = Array.isArray(badges)
    ? badges
    : [];

  const streak = 28;

  const xp =
    totalCompletedLessons * 15;

  const level =
    Math.floor(xp / 100) + 1;

  const stats = [
    {
      title: "Courses",
      value: totalCourses,
      icon: BookOpen,
      subtitle: "Available Courses",
      color:
        "bg-gradient-to-br from-cyan-500/10 to-transparent",
    },
    {
      title: "Lessons",
      value: totalCompletedLessons,
      icon: CheckCircle2,
      subtitle: "Completed Lessons",
      color:
        "bg-gradient-to-br from-emerald-500/10 to-transparent",
    },
    {
      title: "Study Hours",
      value: `${studyHours}h`,
      icon: Clock3,
      subtitle: "Learning Time",
      color:
        "bg-gradient-to-br from-orange-500/10 to-transparent",
    },
    {
      title: "Certificates",
      value: totalCertificates,
      icon: Trophy,
      subtitle: "Achievements",
      color:
        "bg-gradient-to-br from-violet-500/10 to-transparent",
    },
  ];
  return (
  <div className="space-y-8">

    {/* =========================
        HERO
    ========================= */}

    <motion.section
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-[36px] border border-slate-800 bg-gradient-to-br from-[#08111f] via-[#0d1628] to-[#050913]"
    >

      <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-cyan-500/10 blur-[120px]" />

      <div className="absolute right-0 bottom-0 h-80 w-80 rounded-full bg-blue-600/10 blur-[120px]" />

      <div className="absolute inset-0 opacity-[0.04] [background-image:linear-gradient(rgba(255,255,255,.15)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.15)_1px,transparent_1px)] [background-size:40px_40px]" />

      <div className="relative z-10 p-10 lg:p-14">

        <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">

          {/* LEFT */}

          <div className="max-w-3xl">

            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-5 py-2 text-cyan-300">

              <Sparkles size={18} />

              Welcome Back

            </div>

            <h1 className="mt-8 text-5xl font-black leading-tight lg:text-6xl">

              {greeting},

              <span className="text-cyan-400">

                {" "}
                {firstName}

              </span>

            </h1>

            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-400">

              {today}

              <br />

              Continue your learning journey, complete weekly
              tasks, earn certificates and build your future.

            </p>

            <div className="mt-10 flex flex-wrap gap-4">

              <Link
                to="/lms/courses"
                className="flex items-center gap-3 rounded-2xl bg-cyan-500 px-8 py-4 font-semibold text-slate-950 transition hover:bg-cyan-400"
              >
                <BookOpen size={20} />

                Browse Courses

              </Link>

              <Link
                to="/lms/profile"
                className="flex items-center gap-3 rounded-2xl border border-slate-700 bg-slate-900/60 px-8 py-4 font-semibold transition hover:border-cyan-500"
              >
                <Brain size={20} />

                My Profile

              </Link>

            </div>

          </div>

          {/* RIGHT */}

          <div className="grid gap-5 sm:grid-cols-2">

            <GlassCard className="min-w-[220px]">

              <div className="flex items-center gap-4">

                <div className="rounded-2xl bg-orange-500/20 p-4">

                  <Flame
                    className="text-orange-400"
                    size={28}
                  />

                </div>

                <div>

                  <h2 className="text-4xl font-black">

                    {streak}

                  </h2>

                  <p className="text-slate-400">

                    Day Streak

                  </p>

                </div>

              </div>

            </GlassCard>

            <GlassCard>

              <div className="flex items-center gap-4">

                <div className="rounded-2xl bg-blue-500/20 p-4">

                  <Award
                    className="text-blue-400"
                    size={28}
                  />

                </div>

                <div>

                  <h2 className="text-4xl font-black">

                    Lv {level}

                  </h2>

                  <p className="text-slate-400">

                    Learning Level

                  </p>

                </div>

              </div>

            </GlassCard>

            <GlassCard>

              <div className="flex items-center gap-4">

                <div className="rounded-2xl bg-emerald-500/20 p-4">

                  <Target
                    className="text-emerald-400"
                    size={28}
                  />

                </div>

                <div>

                  <h2 className="text-4xl font-black">

                    {xp}

                  </h2>

                  <p className="text-slate-400">

                    XP Earned

                  </p>

                </div>

              </div>

            </GlassCard>

            <GlassCard>

              <div className="flex items-center gap-4">

                <div className="rounded-2xl bg-violet-500/20 p-4">

                  <BarChart3
                    className="text-violet-400"
                    size={28}
                  />

                </div>

                <div>

                  <h2 className="text-4xl font-black">

                    {weeklyTasks.length}

                  </h2>

                  <p className="text-slate-400">

                    Active Tasks

                  </p>

                </div>

              </div>

            </GlassCard>

          </div>

        </div>

      </div>

    </motion.section>

    {/* =========================
        LIVE STATS
    ========================= */}

    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

      {stats.map((item) => (
        <StatCard
          key={item.title}
          {...item}
        />
      ))}

    </div>
        {/* =========================
        MAIN GRID
    ========================= */}

    <div className="grid gap-8 xl:grid-cols-3">

      {/* =========================
          CONTINUE LEARNING
      ========================= */}

      <GlassCard className="xl:col-span-2">

        <div className="mb-8 flex items-center justify-between">

          <div>

            <h2 className="text-3xl font-bold">
              Continue Learning
            </h2>

            <p className="mt-2 text-slate-400">
              Resume exactly where you stopped.
            </p>

          </div>

          <Link
            to="/lms/courses"
            className="rounded-xl border border-slate-700 px-5 py-3 transition hover:border-cyan-500"
          >
            View All
          </Link>

        </div>

        {courses.length === 0 ? (

          <div className="rounded-3xl border border-dashed border-slate-700 py-16 text-center">

            <BookOpen
              size={60}
              className="mx-auto text-slate-600"
            />

            <h3 className="mt-6 text-2xl font-bold">
              No Active Course
            </h3>

            <p className="mt-3 text-slate-500">
              Enroll in a course to begin learning.
            </p>

            <Link
              to="/lms/courses"
              className="mt-8 inline-flex items-center gap-3 rounded-2xl bg-cyan-500 px-8 py-4 font-semibold text-slate-950"
            >
              Browse Courses
            </Link>

          </div>

        ) : (

          <div className="space-y-6">

            {courses.map((course) => (

              <motion.div
                key={course.id}
                whileHover={{
                  y: -5,
                }}
                className="rounded-3xl border border-slate-800 bg-slate-950 p-6"
              >

                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

                  <div className="flex items-center gap-5">

                    <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl bg-slate-800">

                      {course.thumbnail ? (

                        <img
                          src={course.thumbnail}
                          alt={course.title}
                          className="h-full w-full object-cover"
                        />

                      ) : (

                        <BookOpen
                          size={34}
                          className="text-cyan-400"
                        />

                      )}

                    </div>

                    <div>

                      <h3 className="text-2xl font-bold">

                        {course.title}

                      </h3>

                      <p className="mt-2 text-slate-400">

                        {course.currentLesson ||
                          "Continue your next lesson"}

                      </p>

                      <div className="mt-3 flex flex-wrap gap-3">

                        <span className="rounded-full bg-blue-500/10 px-3 py-1 text-sm text-blue-300">

                          {course.level || "Beginner"}

                        </span>

                        <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-sm text-emerald-300">

                          {course.lessonsCompleted || 0}/
                          {course.totalLessons ||
                            course.lessons ||
                            0} Lessons

                        </span>

                      </div>

                    </div>

                  </div>

                  <div className="w-full lg:w-72">

                    <div className="mb-2 flex justify-between text-sm">

                      <span className="text-slate-400">

                        Progress

                      </span>

                      <span className="font-bold text-cyan-400">

                        {course.progress || 0}%

                      </span>

                    </div>

                    <div className="h-3 overflow-hidden rounded-full bg-slate-800">

                      <motion.div
                        initial={{
                          width: 0,
                        }}
                        animate={{
                          width: `${course.progress || 0}%`,
                        }}
                        transition={{
                          duration: 1,
                        }}
                        className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"
                      />

                    </div>

                    <button
                      onClick={() =>
                        completeLesson(course.id)
                      }
                      className="mt-6 flex w-full items-center justify-center gap-3 rounded-2xl bg-cyan-500 py-4 font-bold text-slate-950 transition hover:bg-cyan-400"
                    >

                      <PlayCircle size={20} />

                      Continue Learning

                    </button>

                  </div>

                </div>

              </motion.div>

            ))}

          </div>

        )}

      </GlassCard>
            {/* =========================
          RIGHT SIDEBAR
      ========================= */}

      <div className="space-y-8">

        {/* =========================
            WEEKLY PROGRESS
        ========================= */}

        <GlassCard>

          <div className="flex items-center justify-between">

            <div>

              <h2 className="text-2xl font-bold">
                Weekly Progress
              </h2>

              <p className="mt-2 text-slate-400">
                Your learning activity this week.
              </p>

            </div>

            <TrendingUp
              size={28}
              className="text-cyan-400"
            />

          </div>

          <div className="mt-8 flex h-56 items-end gap-3">

            {progress.length === 0 ? (

              <div className="flex h-full w-full items-center justify-center rounded-2xl border border-dashed border-slate-700 text-slate-500">

                No progress available.

              </div>

            ) : (

              progress.map((day) => (

                <div
                  key={day.day}
                  className="flex flex-1 flex-col items-center"
                >

                  <div className="flex h-44 w-full items-end">

                    <motion.div
                      initial={{
                        height: 0,
                      }}
                      animate={{
                        height: `${day.value || 0}%`,
                      }}
                      transition={{
                        duration: 1,
                      }}
                      className="w-full rounded-t-xl bg-gradient-to-t from-cyan-500 to-blue-500"
                    />

                  </div>

                  <span className="mt-3 text-sm text-slate-400">

                    {day.day}

                  </span>

                </div>

              ))

            )}

          </div>

        </GlassCard>

        {/* =========================
            UPCOMING TASKS
        ========================= */}

        <GlassCard>

          <div className="flex items-center justify-between">

            <div>

              <h2 className="text-2xl font-bold">
                Weekly Tasks
              </h2>

              <p className="mt-2 text-slate-400">
                Don't miss your deadlines.
              </p>

            </div>

            <CalendarDays
              size={28}
              className="text-blue-400"
            />

          </div>

          <div className="mt-8 space-y-5">

            {weeklyTasks.length === 0 ? (

              <div className="rounded-2xl border border-dashed border-slate-700 py-10 text-center text-slate-500">

                No weekly task available.

              </div>

            ) : (

              weeklyTasks.map((task) => (

                <motion.div
                  key={task.id}
                  whileHover={{
                    x: 6,
                  }}
                  className="rounded-2xl border border-slate-800 bg-slate-950 p-5"
                >

                  <div className="flex items-start justify-between gap-4">

                    <div>

                      <h3 className="font-bold">

                        {task.title}

                      </h3>

                      <p className="mt-2 text-sm text-slate-400">

                        {task.course || "General Course"}

                      </p>

                    </div>

                    <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs text-cyan-300">

                      {task.dueDate || "No Date"}

                    </span>

                  </div>

                </motion.div>

              ))

            )}

          </div>

        </GlassCard>

      </div>

    </div>
          {/* =========================
          ACHIEVEMENTS
      ========================= */}

      <GlassCard>

        <div className="flex items-center justify-between mb-8">

          <div>

            <h2 className="text-3xl font-bold">
              Achievements
            </h2>

            <p className="text-slate-400 mt-2">
              Rewards you've unlocked through learning.
            </p>

          </div>

          <Trophy
            size={30}
            className="text-yellow-400"
          />

        </div>

        {achievements.length === 0 ? (

          <div className="rounded-3xl border border-dashed border-slate-700 py-14 text-center">

            <Trophy
              size={60}
              className="mx-auto text-slate-600"
            />

            <h3 className="mt-6 text-2xl font-bold">
              No Achievements Yet
            </h3>

            <p className="mt-3 text-slate-500">
              Complete courses, quizzes and weekly tasks to unlock badges.
            </p>

          </div>

        ) : (

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">

            {achievements.map((badge) => (

              <motion.div
                key={badge.id}
                whileHover={{
                  y: -6,
                  scale: 1.02,
                }}
                className="rounded-3xl border border-slate-800 bg-slate-950 p-6"
              >

                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-yellow-500">

                  <Trophy size={30} />

                </div>

                <h3 className="mt-6 text-xl font-bold">

                  {badge.title || "Achievement"}

                </h3>

                <p className="mt-3 text-slate-400">

                  {badge.description || "Achievement unlocked."}

                </p>

                <div className="mt-6 flex items-center gap-2 text-emerald-400">

                  <CheckCircle2 size={18} />

                  <span>Unlocked</span>

                </div>

              </motion.div>

            ))}

          </div>

        )}

      </GlassCard>

      {/* =========================
          QUICK ACTIONS
      ========================= */}

      <GlassCard>

        <div className="mb-8">

          <h2 className="text-3xl font-bold">
            Quick Actions
          </h2>

          <p className="mt-2 text-slate-400">
            Jump straight into your learning.
          </p>

        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

          <motion.button
            whileHover={{ scale: 1.03 }}
            className="rounded-3xl bg-gradient-to-br from-cyan-500 to-blue-600 p-6 text-left"
          >

            <BookOpen size={34} />

            <h3 className="mt-5 text-xl font-bold">
              Courses
            </h3>

            <p className="mt-2 text-white/80">
              Browse all available courses.
            </p>

          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            className="rounded-3xl bg-gradient-to-br from-purple-600 to-violet-700 p-6 text-left"
          >

            <CheckCircle2 size={34} />

            <h3 className="mt-5 text-xl font-bold">
              Weekly Tasks
            </h3>

            <p className="mt-2 text-white/80">
              Finish your assignments.
            </p>

          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            className="rounded-3xl bg-gradient-to-br from-emerald-500 to-green-600 p-6 text-left"
          >

            <TrendingUp size={34} />

            <h3 className="mt-5 text-xl font-bold">
              Progress
            </h3>

            <p className="mt-2 text-white/80">
              Track your learning journey.
            </p>

          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            className="rounded-3xl bg-gradient-to-br from-orange-500 to-red-500 p-6 text-left"
          >

            <CalendarDays size={34} />

            <h3 className="mt-5 text-xl font-bold">
              Calendar
            </h3>

            <p className="mt-2 text-white/80">
              View upcoming events.
            </p>

          </motion.button>

        </div>

      </GlassCard>

      {/* =========================
          FOOTER
      ========================= */}

      <Footer />

    </div>

  );

};

export default Dashboard;