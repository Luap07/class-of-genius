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
  BookOpen,
  BrainCircuit,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  GraduationCap,
  PlayCircle,
  Target,
  TrendingUp,
  Trophy,
  Video,
  ChevronRight,
  ClipboardList,
} from "lucide-react";

/* =========================================================
   STUDENT OVERVIEW
   ---------------------------------------------------------
   This page is rendered INSIDE StudentLearningPortal.

   It intentionally does NOT contain:
   - Sidebar
   - Topbar
   - Main application navigation

   StudentLearningPortal owns those elements.

   This file owns:
   - Welcome section
   - Learning summary
   - Continue learning
   - Today's tasks
   - Upcoming lessons
   - Progress snapshot
   - Quick actions
========================================================= */

/* =========================================================
   HELPERS
========================================================= */

const getStoredStudent = () => {
  const possibleKeys = [
    "scholiqen_student",
    "academyStudent",
    "student",
    "scholiqen_user",
  ];

  for (const key of possibleKeys) {
    try {
      const raw = localStorage.getItem(key);

      if (!raw) continue;

      const parsed = JSON.parse(raw);

      if (parsed && typeof parsed === "object") {
        return parsed;
      }
    } catch {
      // Ignore malformed storage.
    }
  }

  return null;
};

const getStudentName = (student) => {
  if (!student) return "Student";

  return (
    student.full_name ||
    student.fullName ||
    student.student_name ||
    student.studentName ||
    student.name ||
    [student.first_name, student.last_name]
      .filter(Boolean)
      .join(" ") ||
    "Student"
  );
};

const getFirstName = (name) => {
  if (!name) return "Student";

  return name.trim().split(/\s+/)[0] || "Student";
};

/* =========================================================
   ANIMATION
========================================================= */

const containerVariants = {
  hidden: {
    opacity: 0,
  },

  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 12,
  },

  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35,
    },
  },
};

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  icon: Icon,
  label,
  value,
  description,
  iconClassName = "text-cyan-300",
  iconBackground = "bg-cyan-400/10",
}) {
  return (
    <motion.div
      variants={itemVariants}
      className="rounded-2xl border border-white/[0.07] bg-[#071426] p-5 transition hover:border-white/[0.12]"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-slate-500">
            {label}
          </p>

          <p className="mt-2 text-2xl font-bold tracking-tight text-white">
            {value}
          </p>

          <p className="mt-1 text-xs text-slate-600">
            {description}
          </p>
        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconBackground} ${iconClassName}`}
        >
          <Icon size={20} strokeWidth={1.8} />
        </div>
      </div>
    </motion.div>
  );
}

/* =========================================================
   QUICK ACTION
========================================================= */

function QuickAction({
  icon: Icon,
  title,
  description,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 text-left transition hover:border-cyan-400/20 hover:bg-cyan-400/[0.04]"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-cyan-400/10 text-cyan-300">
        <Icon size={18} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-white">
          {title}
        </p>

        <p className="mt-0.5 truncate text-xs text-slate-500">
          {description}
        </p>
      </div>

      <ChevronRight
        size={16}
        className="shrink-0 text-slate-600 transition group-hover:translate-x-0.5 group-hover:text-cyan-300"
      />
    </button>
  );
}

/* =========================================================
   CONTINUE LEARNING
========================================================= */

function ContinueLearningCard({
  title,
  subject,
  progress,
  lesson,
  onClick,
}) {
  return (
    <motion.div
      variants={itemVariants}
      className="rounded-2xl border border-white/[0.07] bg-[#071426] p-5"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
            <BookOpen
              size={20}
              strokeWidth={1.8}
            />
          </div>

          <div className="min-w-0">
            <p className="text-xs font-medium text-cyan-400">
              {subject}
            </p>

            <h3 className="mt-1 truncate text-sm font-semibold text-white">
              {title}
            </h3>
          </div>
        </div>

        <span className="shrink-0 text-xs font-semibold text-slate-400">
          {progress}%
        </span>
      </div>

      <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{
            duration: 0.8,
            ease: "easeOut",
          }}
          className="h-full rounded-full bg-cyan-400"
        />
      </div>

      <div className="mt-4 flex items-center justify-between">
        <p className="text-xs text-slate-500">
          {lesson}
        </p>

        <button
          type="button"
          onClick={onClick}
          className="flex items-center gap-1.5 text-xs font-semibold text-cyan-300 transition hover:text-cyan-200"
        >
          Continue
          <ArrowRight size={14} />
        </button>
      </div>
    </motion.div>
  );
}

/* =========================================================
   TASK ITEM
========================================================= */

function TaskItem({
  title,
  subject,
  due,
  completed,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full items-center gap-3 border-b border-white/[0.06] py-3.5 text-left last:border-b-0"
    >
      <div
        className={[
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
          completed
            ? "bg-emerald-400/10 text-emerald-300"
            : "bg-white/[0.04] text-slate-400 group-hover:text-cyan-300",
        ].join(" ")}
      >
        {completed ? (
          <CheckCircle2 size={17} />
        ) : (
          <ClipboardList size={17} />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p
          className={[
            "truncate text-sm font-medium",
            completed
              ? "text-slate-500 line-through"
              : "text-white",
          ].join(" ")}
        >
          {title}
        </p>

        <p className="mt-0.5 truncate text-xs text-slate-600">
          {subject}
        </p>
      </div>

      <div className="shrink-0 text-right">
        <p
          className={[
            "text-[11px] font-medium",
            completed
              ? "text-emerald-400"
              : "text-slate-500",
          ].join(" ")}
        >
          {completed ? "Completed" : due}
        </p>
      </div>
    </button>
  );
}

/* =========================================================
   UPCOMING LESSON
========================================================= */

function UpcomingLesson({
  title,
  subject,
  time,
  type,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 text-left transition hover:border-cyan-400/20 hover:bg-cyan-400/[0.03]"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-400/10 text-blue-300">
        {type === "Live Class" ? (
          <Video size={18} />
        ) : (
          <PlayCircle size={18} />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-white">
          {title}
        </p>

        <div className="mt-1 flex items-center gap-2">
          <span className="text-xs text-slate-500">
            {subject}
          </span>

          <span className="text-slate-700">
            •
          </span>

          <span className="text-xs text-slate-500">
            {type}
          </span>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1.5 text-xs text-slate-500">
        <Clock3 size={13} />
        {time}
      </div>
    </button>
  );
}

/* =========================================================
   STUDENT OVERVIEW
========================================================= */

export default function StudentOverview() {
  const navigate = useNavigate();

  const outletContext = useOutletContext();

  const contextStudent =
    outletContext?.student || null;

  const [localStudent] = useState(
    () => getStoredStudent()
  );

  const student =
    contextStudent || localStudent;

  const studentName = useMemo(
    () => getStudentName(student),
    [student]
  );

  const firstName = useMemo(
    () => getFirstName(studentName),
    [studentName]
  );

  const [activePeriod, setActivePeriod] =
    useState("This Week");

  /* =======================================================
     DEMO DASHBOARD DATA

     These values are intentionally local to the dashboard
     for now. They can later be connected to the academy API.
  ======================================================= */

  const stats = {
    subjects: 8,
    lessonsCompleted: 24,
    tasksCompleted: 17,
    overallProgress: 72,
  };

  const continueLearning = [
    {
      title: "Introduction to Algebra",
      subject: "Mathematics",
      progress: 68,
      lesson: "Lesson 7 of 10",
      path: "/academy/student/lessons",
    },
    {
      title: "Cell Structure and Functions",
      subject: "Biology",
      progress: 42,
      lesson: "Lesson 4 of 9",
      path: "/academy/student/lessons",
    },
    {
      title: "Understanding Motion",
      subject: "Physics",
      progress: 31,
      lesson: "Lesson 3 of 8",
      path: "/academy/student/lessons",
    },
  ];

  const tasks = [
    {
      title: "Algebra Practice Assignment",
      subject: "Mathematics",
      due: "Due tomorrow",
      completed: false,
    },
    {
      title: "Cell Biology Worksheet",
      subject: "Biology",
      due: "Due Friday",
      completed: false,
    },
    {
      title: "English Reading Task",
      subject: "English",
      due: "Completed",
      completed: true,
    },
    {
      title: "Physics Motion Questions",
      subject: "Physics",
      due: "Completed",
      completed: true,
    },
  ];

  const upcomingLessons = [
    {
      title: "Live Mathematics Class",
      subject: "Mathematics",
      time: "4:00 PM",
      type: "Live Class",
      path: "/academy/student/lessons",
    },
    {
      title: "Chemical Reactions",
      subject: "Chemistry",
      time: "Tomorrow",
      type: "Lesson",
      path: "/academy/student/lessons",
    },
    {
      title: "English Comprehension",
      subject: "English",
      time: "Wed, 10:00 AM",
      type: "Lesson",
      path: "/academy/student/lessons",
    },
  ];

  /* =======================================================
     PROGRESS
  ======================================================= */

  const progressItems = [
    {
      label: "Mathematics",
      value: 82,
    },
    {
      label: "English",
      value: 76,
    },
    {
      label: "Biology",
      value: 68,
    },
    {
      label: "Physics",
      value: 61,
    },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="mx-auto w-full max-w-[1500px] p-4 sm:p-6 lg:p-8"
    >
      {/* =====================================================
          WELCOME
      ===================================================== */}

      <motion.section
        variants={itemVariants}
        className="relative overflow-hidden rounded-3xl border border-white/[0.07] bg-[#071426] p-6 sm:p-8"
      >
        <div className="absolute right-[-80px] top-[-100px] h-64 w-64 rounded-full bg-cyan-400/[0.04] blur-3xl" />

        <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-400/10 bg-cyan-400/[0.05] px-3 py-1.5">
              <GraduationCap
                size={14}
                className="text-cyan-300"
              />

              <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-cyan-300">
                Student Dashboard
              </span>
            </div>

            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl">
              Welcome back,{" "}
              <span className="text-cyan-300">
                {firstName}
              </span>
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
              Keep building your knowledge, complete your
              tasks, and stay on track with your learning
              goals.
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <button
              type="button"
              onClick={() =>
                navigate("/academy/student/subjects")
              }
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/[0.06]"
            >
              <BookOpen size={17} />
              My Subjects
            </button>

            <button
              type="button"
              onClick={() =>
                navigate("/academy/student/lessons")
              }
              className="inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-4 py-3 text-sm font-bold text-[#020617] transition hover:bg-cyan-300"
            >
              Continue Learning
              <ArrowRight size={17} />
            </button>
          </div>
        </div>
      </motion.section>

      {/* =====================================================
          STATS
      ===================================================== */}

      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={BookOpen}
          label="Enrolled Subjects"
          value={stats.subjects}
          description="Active learning subjects"
        />

        <StatCard
          icon={CheckCircle2}
          label="Lessons Completed"
          value={stats.lessonsCompleted}
          description="Lessons finished"
          iconClassName="text-emerald-300"
          iconBackground="bg-emerald-400/10"
        />

        <StatCard
          icon={ClipboardList}
          label="Tasks Completed"
          value={stats.tasksCompleted}
          description="Assignments completed"
          iconClassName="text-blue-300"
          iconBackground="bg-blue-400/10"
        />

        <StatCard
          icon={TrendingUp}
          label="Overall Progress"
          value={`${stats.overallProgress}%`}
          description="Across your learning"
          iconClassName="text-violet-300"
          iconBackground="bg-violet-400/10"
        />
      </section>

      {/* =====================================================
          MAIN GRID
      ===================================================== */}

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.8fr)]">
        {/* ===================================================
            CONTINUE LEARNING
        =================================================== */}

        <section>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">
                Continue Learning
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                Pick up where you left off.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                navigate("/academy/student/lessons")
              }
              className="flex items-center gap-1 text-xs font-semibold text-cyan-300 hover:text-cyan-200"
            >
              View all
              <ArrowRight size={14} />
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
            {continueLearning.map((item) => (
              <ContinueLearningCard
                key={item.title}
                title={item.title}
                subject={item.subject}
                progress={item.progress}
                lesson={item.lesson}
                onClick={() =>
                  navigate(item.path)
                }
              />
            ))}
          </div>
        </section>

        {/* ===================================================
            QUICK ACTIONS
        =================================================== */}

        <section>
          <div className="mb-4">
            <h3 className="text-lg font-bold text-white">
              Quick Actions
            </h3>

            <p className="mt-1 text-xs text-slate-500">
              Jump straight into your learning.
            </p>
          </div>

          <div className="space-y-2.5">
            <QuickAction
              icon={BookOpen}
              title="Browse Subjects"
              description="Explore your subjects"
              onClick={() =>
                navigate(
                  "/academy/student/subjects"
                )
              }
            />

            <QuickAction
              icon={PlayCircle}
              title="Continue Lessons"
              description="Resume your lessons"
              onClick={() =>
                navigate(
                  "/academy/student/lessons"
                )
              }
            />

            <QuickAction
              icon={ClipboardList}
              title="View Tasks"
              description="Check assignments"
              onClick={() =>
                navigate(
                  "/academy/student/tasks"
                )
              }
            />

            <QuickAction
              icon={BrainCircuit}
              title="Practice CBT"
              description="Test your knowledge"
              onClick={() =>
                navigate(
                  "/academy/student/cbt"
                )
              }
            />

            <QuickAction
              icon={TrendingUp}
              title="View Progress"
              description="Track your performance"
              onClick={() =>
                navigate(
                  "/academy/student/progress"
                )
              }
            />
          </div>
        </section>
      </div>

      {/* =====================================================
          TASKS + UPCOMING
      ===================================================== */}

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* ===================================================
            TASKS
        =================================================== */}

        <motion.section
          variants={itemVariants}
          className="rounded-2xl border border-white/[0.07] bg-[#071426] p-5 sm:p-6"
        >
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">
                Tasks
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                Stay on top of your assignments.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                navigate("/academy/student/tasks")
              }
              className="flex items-center gap-1 text-xs font-semibold text-cyan-300 hover:text-cyan-200"
            >
              View all
              <ArrowRight size={14} />
            </button>
          </div>

          <div>
            {tasks.map((task) => (
              <TaskItem
                key={task.title}
                title={task.title}
                subject={task.subject}
                due={task.due}
                completed={task.completed}
                onClick={() =>
                  navigate(
                    "/academy/student/tasks"
                  )
                }
              />
            ))}
          </div>
        </motion.section>

        {/* ===================================================
            UPCOMING
        =================================================== */}

        <motion.section
          variants={itemVariants}
          className="rounded-2xl border border-white/[0.07] bg-[#071426] p-5 sm:p-6"
        >
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">
                Upcoming
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                Your next learning activities.
              </p>
            </div>

            <CalendarDays
              size={19}
              className="text-slate-600"
            />
          </div>

          <div className="space-y-2.5">
            {upcomingLessons.map((lesson) => (
              <UpcomingLesson
                key={lesson.title}
                title={lesson.title}
                subject={lesson.subject}
                time={lesson.time}
                type={lesson.type}
                onClick={() =>
                  navigate(lesson.path)
                }
              />
            ))}
          </div>
        </motion.section>
      </div>

      {/* =====================================================
          PROGRESS SNAPSHOT
      ===================================================== */}

      <motion.section
        variants={itemVariants}
        className="mt-6 rounded-2xl border border-white/[0.07] bg-[#071426] p-5 sm:p-6"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-bold text-white">
              Progress Snapshot
            </h3>

            <p className="mt-1 text-xs text-slate-500">
              See how you are progressing across subjects.
            </p>
          </div>

          <div className="flex items-center rounded-xl border border-white/[0.06] bg-white/[0.02] p-1">
            {["This Week", "This Month"].map(
              (period) => (
                <button
                  key={period}
                  type="button"
                  onClick={() =>
                    setActivePeriod(period)
                  }
                  className={[
                    "rounded-lg px-3 py-2 text-xs font-semibold transition",
                    activePeriod === period
                      ? "bg-cyan-400/10 text-cyan-300"
                      : "text-slate-500 hover:text-white",
                  ].join(" ")}
                >
                  {period}
                </button>
              )
            )}
          </div>
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {progressItems.map((item) => (
            <div key={item.label}>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400">
                  {item.label}
                </span>

                <span className="text-xs font-bold text-white">
                  {item.value}%
                </span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-white/[0.05]">
                <motion.div
                  initial={{
                    width: 0,
                  }}
                  animate={{
                    width: `${item.value}%`,
                  }}
                  transition={{
                    duration: 0.8,
                    ease: "easeOut",
                  }}
                  className="h-full rounded-full bg-cyan-400"
                />
              </div>
            </div>
          ))}
        </div>
      </motion.section>

      {/* =====================================================
          ACHIEVEMENT / MOTIVATION
      ===================================================== */}

      <motion.section
        variants={itemVariants}
        className="mt-6 overflow-hidden rounded-2xl border border-white/[0.07] bg-[#071426]"
      >
        <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-400/10 text-amber-300">
              <Trophy
                size={22}
                strokeWidth={1.8}
              />
            </div>

            <div>
              <p className="text-sm font-bold text-white">
                Keep building your streak
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Complete your lessons and tasks to keep
                making progress.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/academy/student/achievements"
              )
            }
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-xs font-semibold text-slate-200 transition hover:bg-white/[0.06]"
          >
            View Achievements
            <ArrowRight size={15} />
          </button>
        </div>
      </motion.section>
    </motion.div>
  );
}
