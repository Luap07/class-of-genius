// src/pages/lms/Dashboard.jsx

import React from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  Clock3,
  Trophy,
  CheckCircle2,
  Flame,
  TrendingUp,
  CalendarDays,
  ArrowRight,
  PlayCircle,
} from "lucide-react";

import { useLMS } from "../../context/LMSContext";

/* =====================================================
   GLASS CARD
===================================================== */

const GlassCard = ({ children, className = "" }) => (
  <div
    className={`bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-3xl p-6 ${className}`}
  >
    {children}
  </div>
);

/* =====================================================
   STATS CARD
===================================================== */

const StatCard = ({ title, value, icon: Icon, color }) => (
  <motion.div
    whileHover={{ y: -6 }}
    transition={{ duration: 0.25 }}
    className="rounded-3xl bg-slate-900/50 border border-slate-800 p-6"
  >
    <div
      className={`w-14 h-14 rounded-2xl bg-gradient-to-r ${color} flex items-center justify-center`}
    >
      <Icon size={26} className="text-white" />
    </div>

    <p className="text-slate-400 mt-5">
      {title}
    </p>

    <h2 className="text-3xl font-bold mt-2">
      {value}
    </h2>
  </motion.div>
);

/* =====================================================
   DASHBOARD
===================================================== */

const Dashboard = () => {

  const {
    courses,
    continueLearning,
    totalCourses,
    completedLessons,
    studyHours,
    certificates,
    achievements,
    upcomingAssignments,
    weeklyProgress,
    completeLesson,
  } = useLMS();

  const stats = [
    {
      title: "Courses",
      value: totalCourses,
      icon: BookOpen,
      color: "from-blue-600 to-cyan-500",
    },

    {
      title: "Completed Lessons",
      value: completedLessons,
      icon: CheckCircle2,
      color: "from-emerald-500 to-green-600",
    },

    {
      title: "Study Hours",
      value: `${studyHours}h`,
      icon: Clock3,
      color: "from-purple-600 to-pink-600",
    },

    {
      title: "Certificates",
      value: certificates,
      icon: Trophy,
      color: "from-amber-500 to-orange-500",
    },
  ];

  return (
    <div className="space-y-8">

      {/* ==========================================
          HERO
      =========================================== */}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl
        bg-gradient-to-r
        from-indigo-900
        via-slate-900
        to-slate-950
        border
        border-slate-800
        p-10"
      >

        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-blue-500/10 blur-[120px]" />

        <div className="relative flex flex-col lg:flex-row justify-between gap-10">

          <div>

            <h1 className="text-5xl font-bold">
              Welcome Back 👋
            </h1>

            <p className="mt-5 text-slate-400 max-w-2xl text-lg">
              Continue where you stopped. Every completed lesson,
              assignment and quiz updates your dashboard automatically.
            </p>

            <button
              className="
              mt-8
              px-7
              py-4
              rounded-2xl
              bg-white
              text-slate-900
              font-bold
              hover:bg-slate-200
              transition"
            >
              Continue Learning
            </button>

          </div>

          <div
            className="
            rounded-3xl
            border
            border-white/10
            bg-white/5
            backdrop-blur-md
            p-6
            flex
            items-center
            gap-5"
          >

            <Flame
              size={40}
              className="text-orange-400"
            />

            <div>

              <h2 className="text-3xl font-bold">
                28 Day Streak
              </h2>

              <p className="text-slate-400">
                Keep learning every day.
              </p>

            </div>

          </div>

        </div>

      </motion.div>

      {/* ==========================================
          STATS GRID
      =========================================== */}

      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">

        {stats.map((item) => (
          <StatCard
            key={item.title}
            {...item}
          />
        ))}

      </div>
            {/* ==========================================
          MAIN GRID
      =========================================== */}

      <div className="grid xl:grid-cols-3 gap-6">

        {/* ======================================
            CONTINUE LEARNING
        ======================================= */}

        <GlassCard className="xl:col-span-2">

          <div className="flex items-center justify-between mb-6">

            <div>

              <h2 className="text-2xl font-bold">
                Continue Learning
              </h2>

              <p className="text-slate-400 mt-1">
                Pick up where you left off.
              </p>

            </div>

            <button className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition">

              View All

              <ArrowRight size={18} />

            </button>

          </div>

          <div className="space-y-5">

            {continueLearning.length === 0 ? (

              <div className="rounded-2xl border border-dashed border-slate-700 p-10 text-center">

                <BookOpen
                  size={42}
                  className="mx-auto text-slate-500"
                />

                <h3 className="mt-4 text-xl font-semibold">
                  No Active Courses
                </h3>

                <p className="text-slate-500 mt-2">
                  Start a course and it will appear here automatically.
                </p>

              </div>

            ) : (

              continueLearning.map((course) => (

                <motion.div
                  key={course.id}
                  whileHover={{ y: -3 }}
                  className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5"
                >

                  <div className="flex items-center justify-between">

                    <div>

                      <h3 className="text-xl font-bold">

                        {course.title}

                      </h3>

                      <p className="text-slate-400 mt-1">

                        {course.currentLesson}

                      </p>

                    </div>

                    <span className="text-blue-400 font-bold">

                      {course.progress}%

                    </span>

                  </div>

                  <div className="mt-5 h-3 rounded-full bg-slate-800 overflow-hidden">

                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: `${course.progress}%`,
                      }}
                      transition={{ duration: 0.6 }}
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400"
                    />

                  </div>

                  <div className="mt-6 flex items-center justify-between">

                    <div className="flex items-center gap-4 text-sm text-slate-400">

                      <div className="flex items-center gap-2">

                        <Clock3 size={16} />

                        {course.duration}

                      </div>

                      <div className="flex items-center gap-2">

                        <BookOpen size={16} />

                        {course.lessonsCompleted}/
                        {course.totalLessons} Lessons

                      </div>

                    </div>

                    <button
                      onClick={() => completeLesson(course.id)}
                      className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold hover:bg-blue-700 transition"
                    >

                      <PlayCircle size={18} />

                      Continue

                    </button>

                  </div>

                </motion.div>

              ))

            )}

          </div>

        </GlassCard>
                {/* ======================================
            WEEKLY PROGRESS
        ======================================= */}

        <GlassCard>

          <div className="flex items-center justify-between mb-6">

            <div>

              <h2 className="text-2xl font-bold">
                Weekly Progress
              </h2>

              <p className="text-slate-400 text-sm mt-1">
                Your learning activity this week
              </p>

            </div>

            <TrendingUp
              className="text-blue-400"
              size={26}
            />

          </div>

          <div className="flex items-end justify-between gap-3 h-64">

            {weeklyProgress.map((day) => (

              <div
                key={day.day}
                className="flex flex-col items-center flex-1"
              >

                <div className="relative group flex items-end h-48 w-full">

                  {/* Tooltip */}

                  <div
                    className="
                    absolute
                    -top-10
                    left-1/2
                    -translate-x-1/2
                    px-3
                    py-1
                    rounded-lg
                    bg-slate-800
                    text-xs
                    opacity-0
                    group-hover:opacity-100
                    transition"
                  >
                    {day.value}%
                  </div>

                  {/* Animated Bar */}

                  <motion.div
                    initial={{
                      height: 0,
                    }}
                    animate={{
                      height: `${day.value}%`,
                    }}
                    transition={{
                      duration: 0.8,
                    }}
                    className="
                    w-full
                    rounded-t-xl
                    bg-gradient-to-t
                    from-blue-600
                    to-cyan-400"
                  />

                </div>

                <p className="mt-3 text-sm text-slate-400">

                  {day.day}

                </p>

              </div>

            ))}

          </div>

          <div className="mt-8 border-t border-slate-800 pt-5">

            <div className="flex items-center justify-between">

              <span className="text-slate-400">

                Weekly Completion

              </span>

              <span className="font-bold text-blue-400">

                {Math.round(
                  weeklyProgress.reduce(
                    (sum, day) => sum + day.value,
                    0
                  ) / weeklyProgress.length
                )}
                %

              </span>

            </div>

          </div>

        </GlassCard>

      </div>
            {/* ==========================================
          ACHIEVEMENTS
      ========================================== */}

      <GlassCard>

        <div className="flex items-center justify-between mb-6">

          <div>

            <h2 className="text-2xl font-bold">
              Achievements
            </h2>

            <p className="text-slate-400 mt-1">
              Badges you've unlocked through learning.
            </p>

          </div>

          <Trophy
            size={26}
            className="text-amber-400"
          />

        </div>

        {achievements.length === 0 ? (

          <div className="rounded-2xl border border-dashed border-slate-700 p-10 text-center">

            <Trophy
              size={48}
              className="mx-auto text-slate-600"
            />

            <h3 className="mt-5 text-xl font-semibold">

              No Achievements Yet

            </h3>

            <p className="mt-2 text-slate-500">

              Complete lessons, quizzes and assignments to earn badges.

            </p>

          </div>

        ) : (

          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">

            {achievements.map((achievement) => (

              <motion.div
                key={achievement.id}
                whileHover={{
                  y: -6,
                  scale: 1.02,
                }}
                className="
                rounded-3xl
                border
                border-slate-800
                bg-slate-950
                p-6"
              >

                <div
                  className={`
                  w-16
                  h-16
                  rounded-2xl
                  bg-gradient-to-r
                  ${achievement.color}
                  flex
                  items-center
                  justify-center
                  text-white
                  text-3xl
                  shadow-lg`}
                >

                  {achievement.icon}

                </div>

                <h3 className="text-xl font-bold mt-5">

                  {achievement.title}

                </h3>

                <p className="text-slate-400 mt-2">

                  {achievement.description}

                </p>

                <div className="mt-5 flex items-center justify-between">

                  <span
                    className="
                    px-3
                    py-1
                    rounded-full
                    bg-emerald-600/20
                    text-emerald-400
                    text-sm"
                  >

                    Unlocked

                  </span>

                  <CheckCircle2
                    className="text-emerald-400"
                    size={22}
                  />

                </div>

              </motion.div>

            ))}

          </div>

        )}

      </GlassCard>
            {/* ==========================================
          UPCOMING ASSIGNMENTS
      ========================================== */}

      <GlassCard>

        <div className="flex items-center justify-between mb-6">

          <div>

            <h2 className="text-2xl font-bold">
              Upcoming Assignments
            </h2>

            <p className="text-slate-400 mt-1">
              Stay ahead of your deadlines.
            </p>

          </div>

          <CalendarDays
            size={26}
            className="text-cyan-400"
          />

        </div>

        {upcomingAssignments.length === 0 ? (

          <div className="rounded-2xl border border-dashed border-slate-700 p-10 text-center">

            <CalendarDays
              size={50}
              className="mx-auto text-slate-600"
            />

            <h3 className="mt-5 text-xl font-semibold">

              No Upcoming Assignments

            </h3>

            <p className="mt-2 text-slate-500">

              You're all caught up. Great job!

            </p>

          </div>

        ) : (

          <div className="space-y-4">

            {upcomingAssignments.map((assignment) => (

              <motion.div
                key={assignment.id}
                whileHover={{
                  y: -4,
                }}
                className="
                rounded-2xl
                border
                border-slate-800
                bg-slate-950
                p-5"
              >

                <div className="flex justify-between items-start">

                  <div>

                    <h3 className="text-lg font-bold">

                      {assignment.title}

                    </h3>

                    <p className="text-slate-400 mt-1">

                      {assignment.course}

                    </p>

                  </div>

                  <span
                    className={`
                    px-3
                    py-1
                    rounded-full
                    text-sm
                    ${
                      assignment.priority === "High"
                        ? "bg-red-500/20 text-red-400"
                        : assignment.priority === "Medium"
                        ? "bg-yellow-500/20 text-yellow-400"
                        : "bg-green-500/20 text-green-400"
                    }
                    `}
                  >

                    {assignment.priority}

                  </span>

                </div>

                <div className="mt-5 flex justify-between items-center">

                  <div className="flex items-center gap-2 text-slate-400">

                    <CalendarDays size={16} />

                    Due:

                    <span className="text-white">

                      {assignment.dueDate}

                    </span>

                  </div>

                  <button
                    className="
                    px-5
                    py-2
                    rounded-xl
                    bg-blue-600
                    hover:bg-blue-700
                    transition"
                  >

                    Open

                  </button>

                </div>

              </motion.div>

            ))}

          </div>

        )}

      </GlassCard>
            {/* ==========================================
          QUICK ACTIONS
      ========================================== */}

      <GlassCard>

        <div className="flex items-center justify-between mb-6">

          <div>

            <h2 className="text-2xl font-bold">
              Quick Actions
            </h2>

            <p className="text-slate-400 mt-1">
              Jump to your most used learning tools.
            </p>

          </div>

        </div>

        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-5">

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => window.alert("Open Courses")}
            className="rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 p-6 text-left"
          >

            <BookOpen size={34} />

            <h3 className="text-xl font-bold mt-5">

              Courses

            </h3>

            <p className="mt-2 text-white/80">

              Continue learning.

            </p>

          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => window.alert("Open Assignments")}
            className="rounded-2xl bg-gradient-to-r from-purple-600 to-pink-500 p-6 text-left"
          >

            <CheckCircle2 size={34} />

            <h3 className="text-xl font-bold mt-5">

              Assignments

            </h3>

            <p className="mt-2 text-white/80">

              View pending work.

            </p>

          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => window.alert("Open Progress")}
            className="rounded-2xl bg-gradient-to-r from-green-600 to-emerald-500 p-6 text-left"
          >

            <TrendingUp size={34} />

            <h3 className="text-xl font-bold mt-5">

              Progress

            </h3>

            <p className="mt-2 text-white/80">

              Track performance.

            </p>

          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => window.alert("Open Calendar")}
            className="rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 p-6 text-left"
          >

            <CalendarDays size={34} />

            <h3 className="text-xl font-bold mt-5">

              Calendar

            </h3>

            <p className="mt-2 text-white/80">

              Check upcoming events.

            </p>

          </motion.button>

        </div>

      </GlassCard>

    </div>

  );
};

export default Dashboard;