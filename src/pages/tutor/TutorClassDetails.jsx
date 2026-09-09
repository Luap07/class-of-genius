import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Award,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock3,
  FileText,
  GraduationCap,
  HelpCircle,
  Megaphone,
  Play,
  Plus,
  Radio,
  Sparkles,
  Target,
  Users,
  Video,
  X,
  Zap,
} from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

/* =========================================================
   HARD-CODED DATA FOR NOW
========================================================= */

const HARD_CODED_ACTIVITIES = [
  {
    id: 1,
    type: "live",
    title: "Started a Live Class",
    description:
      "Started a live Mathematics lesson covering Quadratic Equations.",
    date: "Today",
    time: "10:30 AM",
    status: "Completed",
    duration: "1h 12m",
  },
  {
    id: 2,
    type: "assignment",
    title: "Created an Assignment",
    description:
      "Created an Algebra assignment containing 15 questions for the class.",
    date: "Today",
    time: "9:15 AM",
    status: "Published",
    duration: null,
  },
  {
    id: 3,
    type: "lesson",
    title: "Uploaded Lesson Material",
    description:
      "Uploaded a new learning resource for the current Mathematics topic.",
    date: "Yesterday",
    time: "4:20 PM",
    status: "Published",
    duration: null,
  },
  {
    id: 4,
    type: "quiz",
    title: "Created a Quiz",
    description:
      "Created a 20-question quiz to test students' understanding of the lesson.",
    date: "Yesterday",
    time: "1:45 PM",
    status: "Published",
    duration: null,
  },
  {
    id: 5,
    type: "announcement",
    title: "Posted a Class Announcement",
    description:
      "Reminded students about the upcoming Mathematics assessment.",
    date: "Sep 5, 2026",
    time: "11:00 AM",
    status: "Published",
    duration: null,
  },
  {
    id: 6,
    type: "live",
    title: "Completed a Live Class",
    description:
      "Completed a live lesson focused on simultaneous equations.",
    date: "Sep 4, 2026",
    time: "12:12 PM",
    status: "Completed",
    duration: "1h 05m",
  },
  {
    id: 7,
    type: "assignment",
    title: "Reviewed Student Assignment",
    description:
      "Reviewed submitted Mathematics assignments and provided feedback.",
    date: "Sep 3, 2026",
    time: "3:40 PM",
    status: "Completed",
    duration: null,
  },
  {
    id: 8,
    type: "lesson",
    title: "Added a New Lesson",
    description:
      "Added a new lesson covering equations, expressions and mathematical reasoning.",
    date: "Sep 2, 2026",
    time: "8:30 AM",
    status: "Published",
    duration: null,
  },
];

/* =========================================================
   HELPERS
========================================================= */

const clean = (value) =>
  typeof value === "string" ? value.trim() : value ?? "";

const normalize = (value) =>
  clean(value)
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .toLowerCase();

function getActivityIcon(type) {
  switch (type) {
    case "live":
      return Video;
    case "assignment":
      return FileText;
    case "lesson":
      return BookOpen;
    case "quiz":
      return HelpCircle;
    case "announcement":
      return Megaphone;
    default:
      return Zap;
  }
}

function getActivityLabel(type) {
  switch (type) {
    case "live":
      return "Live Class";
    case "assignment":
      return "Assignment";
    case "lesson":
      return "Lesson";
    case "quiz":
      return "Quiz";
    case "announcement":
      return "Announcement";
    default:
      return "Activity";
  }
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  icon: Icon,
  label,
  value,
  description,
  delay = 0,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay }}
      className="
        group relative overflow-hidden
        rounded-2xl
        border border-white/[0.08]
        bg-white/[0.035]
        p-5
        backdrop-blur-xl
        transition-all duration-300
        hover:-translate-y-1
        hover:border-white/[0.14]
        hover:bg-white/[0.055]
      "
    >
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-blue-500/10 blur-2xl transition-all group-hover:bg-blue-500/20" />

      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
            {label}
          </p>

          <p className="mt-2 text-3xl font-bold tracking-tight text-white">
            {value}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            {description}
          </p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.045]">
          <Icon className="h-5 w-5 text-blue-400" />
        </div>
      </div>
    </motion.div>
  );
}

/* =========================================================
   ACTIVITY ITEM
========================================================= */

function ActivityItem({
  activity,
  index,
  onOpen,
}) {
  const Icon = getActivityIcon(activity.type);

  return (
    <motion.button
      type="button"
      onClick={() => onOpen(activity)}
      initial={{ opacity: 0, x: -15 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        duration: 0.35,
        delay: index * 0.055,
      }}
      className="
        group relative flex w-full
        gap-4 text-left
        rounded-2xl
        border border-white/[0.06]
        bg-white/[0.025]
        p-4
        transition-all duration-300
        hover:border-blue-400/20
        hover:bg-white/[0.045]
      "
    >
      {/* timeline */}
      <div className="absolute left-[31px] top-[60px] bottom-[-22px] w-px bg-white/[0.06] group-last:hidden" />

      <div
        className="
          relative z-10 flex h-11 w-11 shrink-0
          items-center justify-center
          rounded-xl
          border border-blue-400/15
          bg-blue-500/[0.08]
        "
      >
        <Icon className="h-5 w-5 text-blue-400" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold text-white">
                {activity.title}
              </h3>

              <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-slate-500">
                {getActivityLabel(activity.type)}
              </span>
            </div>

            <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-400">
              {activity.description}
            </p>
          </div>

          <div className="shrink-0 text-right">
            <p className="text-xs font-medium text-slate-300">
              {activity.date}
            </p>

            <p className="mt-1 text-[11px] text-slate-600">
              {activity.time}
            </p>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span
            className={`
              inline-flex items-center gap-1.5 rounded-full
              border px-2.5 py-1 text-[11px] font-medium
              ${
                activity.status === "Completed"
                  ? "border-emerald-400/15 bg-emerald-400/[0.07] text-emerald-400"
                  : "border-blue-400/15 bg-blue-400/[0.07] text-blue-400"
              }
            `}
          >
            <CheckCircle2 className="h-3 w-3" />
            {activity.status}
          </span>

          {activity.duration && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.07] bg-white/[0.025] px-2.5 py-1 text-[11px] text-slate-500">
              <Clock3 className="h-3 w-3" />
              {activity.duration}
            </span>
          )}
        </div>
      </div>

      <ChevronDown className="mt-3 h-4 w-4 shrink-0 -rotate-90 text-slate-700 transition-all group-hover:translate-x-1 group-hover:text-blue-400" />
    </motion.button>
  );
}

/* =========================================================
   ACTIVITY MODAL
========================================================= */

function ActivityModal({ activity, onClose }) {
  if (!activity) return null;

  const Icon = getActivityIcon(activity.type);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onMouseDown={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 25, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 15, scale: 0.98 }}
          transition={{ duration: 0.25 }}
          onMouseDown={(event) => event.stopPropagation()}
          className="
            w-full max-w-lg
            overflow-hidden
            rounded-3xl
            border border-white/[0.09]
            bg-[#0b1020]
            shadow-2xl shadow-black/50
          "
        >
          <div className="relative overflow-hidden border-b border-white/[0.07] p-6">
            <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-blue-500/10 blur-3xl" />

            <div className="relative flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-400/15 bg-blue-500/10">
                  <Icon className="h-6 w-6 text-blue-400" />
                </div>

                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-blue-400">
                    {getActivityLabel(activity.type)}
                  </p>

                  <h2 className="mt-1 text-xl font-bold text-white">
                    {activity.title}
                  </h2>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="rounded-xl p-2 text-slate-500 transition hover:bg-white/[0.05] hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="space-y-5 p-6">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-600">
                What happened
              </p>

              <p className="mt-2 text-sm leading-7 text-slate-300">
                {activity.description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4">
                <p className="text-[11px] uppercase tracking-wider text-slate-600">
                  Date
                </p>
                <p className="mt-1 text-sm font-medium text-white">
                  {activity.date}
                </p>
              </div>

              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4">
                <p className="text-[11px] uppercase tracking-wider text-slate-600">
                  Time
                </p>
                <p className="mt-1 text-sm font-medium text-white">
                  {activity.time}
                </p>
              </div>

              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4">
                <p className="text-[11px] uppercase tracking-wider text-slate-600">
                  Status
                </p>
                <p className="mt-1 text-sm font-medium text-emerald-400">
                  {activity.status}
                </p>
              </div>

              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4">
                <p className="text-[11px] uppercase tracking-wider text-slate-600">
                  Activity
                </p>
                <p className="mt-1 text-sm font-medium text-white">
                  {getActivityLabel(activity.type)}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="
                flex w-full items-center justify-center
                rounded-xl border border-white/[0.08]
                bg-white/[0.04]
                px-4 py-3
                text-sm font-medium text-white
                transition hover:bg-white/[0.07]
              "
            >
              Close
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function TutorClassDetails() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();

  const [selectedActivity, setSelectedActivity] =
    useState(null);

  const [activityFilter, setActivityFilter] =
    useState("all");

  /* -------------------------------------------------------
     CLASS DATA
  ------------------------------------------------------- */

  const classData =
    location.state?.classData ||
    location.state?.class ||
    {};

  const grade =
    clean(
      classData.grade ||
        location.state?.selectedClass ||
        params.grade ||
        "Senior Secondary"
    ) || "Senior Secondary";

  const subject =
    clean(
      classData.subject ||
        location.state?.selectedSubject ||
        params.subject ||
        "Mathematics"
    ) || "Mathematics";

  const tutor =
    location.state?.tutor ||
    {};

  const tutorName =
    clean(
      tutor.name ||
        tutor.fullName ||
        tutor.displayName ||
        tutor.tutorName
    ) || "Tutor";

  const tutorEmail =
    clean(tutor.email) || "tutor@scholiqen.com";

  /* -------------------------------------------------------
     ACTIVITY FILTERING
  ------------------------------------------------------- */

  const filteredActivities = useMemo(() => {
    if (activityFilter === "all") {
      return HARD_CODED_ACTIVITIES;
    }

    return HARD_CODED_ACTIVITIES.filter(
      (activity) =>
        normalize(activity.type) ===
        normalize(activityFilter)
    );
  }, [activityFilter]);

  /* -------------------------------------------------------
     STATS
  ------------------------------------------------------- */

  const stats = useMemo(() => {
    return {
      lessons: HARD_CODED_ACTIVITIES.filter(
        (item) => item.type === "lesson"
      ).length,

      assignments: HARD_CODED_ACTIVITIES.filter(
        (item) => item.type === "assignment"
      ).length,

      quizzes: HARD_CODED_ACTIVITIES.filter(
        (item) => item.type === "quiz"
      ).length,

      liveClasses: HARD_CODED_ACTIVITIES.filter(
        (item) => item.type === "live"
      ).length,
    };
  }, []);

  /* -------------------------------------------------------
     QUICK ACTION
  ------------------------------------------------------- */

  const handleQuickAction = (action) => {
    if (action === "live") {
      alert(
        "Live Class is ready to be connected to your backend."
      );
      return;
    }

    if (action === "assignment") {
      alert(
        "Assignment creation is ready to be connected."
      );
      return;
    }

    if (action === "lesson") {
      alert(
        "Lesson creation is ready to be connected."
      );
      return;
    }

    if (action === "quiz") {
      alert(
        "Quiz creation is ready to be connected."
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#050814] text-white">
      {/* ===================================================
          BACKGROUND
      =================================================== */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[10%] top-[-10%] h-[350px] w-[350px] rounded-full bg-blue-600/[0.07] blur-[120px]" />

        <div className="absolute right-[5%] top-[30%] h-[300px] w-[300px] rounded-full bg-indigo-600/[0.05] blur-[120px]" />

        <div
          className="
            absolute inset-0 opacity-[0.035]
            bg-[radial-gradient(circle_at_1px_1px,_white_1px,_transparent_0)]
            [background-size:24px_24px]
          "
        />
      </div>

      {/* ===================================================
          CONTENT
      =================================================== */}

      <main className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* =================================================
            TOP NAV
        ================================================= */}

        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex items-center justify-between gap-4"
        >
          <button
            type="button"
            onClick={() =>
              navigate(
                "/academy/tutor/classes"
              )
            }
            className="
              group inline-flex items-center gap-2
              rounded-xl
              border border-white/[0.07]
              bg-white/[0.025]
              px-3.5 py-2.5
              text-sm font-medium text-slate-400
              transition-all
              hover:border-white/[0.12]
              hover:bg-white/[0.05]
              hover:text-white
            "
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to My Classes
          </button>

          <div className="hidden items-center gap-2 sm:flex">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/30" />

            <span className="text-xs text-slate-500">
              Tutor workspace
            </span>
          </div>
        </motion.div>

        {/* =================================================
            HERO
        ================================================= */}

        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="
            relative overflow-hidden
            rounded-3xl
            border border-white/[0.08]
            bg-gradient-to-br
            from-blue-500/[0.10]
            via-white/[0.035]
            to-indigo-500/[0.06]
            p-6
            shadow-2xl shadow-black/10
            sm:p-8
          "
        >
          <div className="absolute right-[-80px] top-[-100px] h-72 w-72 rounded-full bg-blue-500/[0.08] blur-[80px]" />

          <div className="relative flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div
                className="
                  flex h-16 w-16 shrink-0
                  items-center justify-center
                  rounded-2xl
                  border border-blue-400/20
                  bg-blue-500/10
                  shadow-lg shadow-blue-950/20
                "
              >
                <GraduationCap className="h-8 w-8 text-blue-400" />
              </div>

              <div className="min-w-0">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-blue-400/15 bg-blue-400/[0.07] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-blue-400">
                    Tutor Class
                  </span>

                  <span className="rounded-full border border-emerald-400/15 bg-emerald-400/[0.06] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-400">
                    Active
                  </span>
                </div>

                <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  {subject}
                </h1>

                <p className="mt-2 text-sm text-slate-400">
                  {grade} · Tutor activity workspace
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-500">
                  <span className="inline-flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5" />
                    32 Students
                  </span>

                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays className="h-3.5 w-3.5" />
                    3 Classes / Week
                  </span>

                  <span className="inline-flex items-center gap-1.5">
                    <Award className="h-3.5 w-3.5" />
                    {tutorName}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/[0.07] bg-black/10 p-4 lg:min-w-[230px]">
              <p className="text-[10px] uppercase tracking-[0.18em] text-slate-600">
                Tutor
              </p>

              <p className="mt-2 font-semibold text-white">
                {tutorName}
              </p>

              <p className="mt-1 truncate text-xs text-slate-500">
                {tutorEmail}
              </p>

              <div className="mt-3 flex items-center gap-2 text-xs text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Active tutor
              </div>
            </div>
          </div>
        </motion.section>

        {/* =================================================
            STATS
        ================================================= */}

        <section className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard
            icon={BookOpen}
            label="Lessons"
            value={stats.lessons}
            description="Lessons added"
            delay={0.05}
          />

          <StatCard
            icon={FileText}
            label="Assignments"
            value={stats.assignments}
            description="Assignments created"
            delay={0.1}
          />

          <StatCard
            icon={HelpCircle}
            label="Quizzes"
            value={stats.quizzes}
            description="Quizzes created"
            delay={0.15}
          />

          <StatCard
            icon={Video}
            label="Live Classes"
            value={stats.liveClasses}
            description="Live sessions"
            delay={0.2}
          />
        </section>

        {/* =================================================
            MAIN GRID
        ================================================= */}

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          {/* ===============================================
              ACTIVITY
          =============================================== */}

          <section
            className="
              rounded-3xl
              border border-white/[0.08]
              bg-white/[0.025]
              p-5
              sm:p-6
            "
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <ActivityPulse />

                  <h2 className="text-lg font-bold text-white">
                    Tutor Activity
                  </h2>
                </div>

                <p className="mt-1 text-sm text-slate-500">
                  Everything the tutor has done in this class.
                </p>
              </div>

              <div className="relative">
                <select
                  value={activityFilter}
                  onChange={(event) =>
                    setActivityFilter(
                      event.target.value
                    )
                  }
                  className="
                    appearance-none
                    rounded-xl
                    border border-white/[0.08]
                    bg-white/[0.035]
                    py-2.5 pl-3 pr-9
                    text-xs font-medium
                    text-slate-300
                    outline-none
                    transition
                    focus:border-blue-400/30
                  "
                >
                  <option
                    value="all"
                    className="bg-[#0b1020]"
                  >
                    All Activity
                  </option>

                  <option
                    value="live"
                    className="bg-[#0b1020]"
                  >
                    Live Classes
                  </option>

                  <option
                    value="assignment"
                    className="bg-[#0b1020]"
                  >
                    Assignments
                  </option>

                  <option
                    value="lesson"
                    className="bg-[#0b1020]"
                  >
                    Lessons
                  </option>

                  <option
                    value="quiz"
                    className="bg-[#0b1020]"
                  >
                    Quizzes
                  </option>

                  <option
                    value="announcement"
                    className="bg-[#0b1020]"
                  >
                    Announcements
                  </option>
                </select>

                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-600" />
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <AnimatePresence mode="popLayout">
                {filteredActivities.map(
                  (activity, index) => (
                    <ActivityItem
                      key={activity.id}
                      activity={activity}
                      index={index}
                      onOpen={setSelectedActivity}
                    />
                  )
                )}
              </AnimatePresence>

              {filteredActivities.length === 0 && (
                <div className="rounded-2xl border border-dashed border-white/[0.08] p-10 text-center">
                  <Sparkles className="mx-auto h-7 w-7 text-slate-700" />

                  <p className="mt-3 text-sm font-medium text-slate-400">
                    No activity found
                  </p>

                  <p className="mt-1 text-xs text-slate-600">
                    Try another activity filter.
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* ===============================================
              SIDEBAR
          =============================================== */}

          <aside className="space-y-6">
            {/* Class Overview */}
            <motion.div
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="
                rounded-3xl
                border border-white/[0.08]
                bg-white/[0.025]
                p-5
              "
            >
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-blue-400" />

                <h3 className="font-semibold text-white">
                  Class Overview
                </h3>
              </div>

              <div className="mt-5 space-y-3">
                <OverviewRow
                  icon={GraduationCap}
                  label="Grade"
                  value={grade}
                />

                <OverviewRow
                  icon={BookOpen}
                  label="Subject"
                  value={subject}
                />

                <OverviewRow
                  icon={Users}
                  label="Students"
                  value="32"
                />

                <OverviewRow
                  icon={CalendarDays}
                  label="Schedule"
                  value="Mon · Wed · Fri"
                />

                <OverviewRow
                  icon={Clock3}
                  label="Duration"
                  value="1 hour"
                />
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.28 }}
              className="
                rounded-3xl
                border border-white/[0.08]
                bg-white/[0.025]
                p-5
              "
            >
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-blue-400" />

                <h3 className="font-semibold text-white">
                  Quick Actions
                </h3>
              </div>

              <div className="mt-4 space-y-2">
                <QuickAction
                  icon={Radio}
                  label="Start Live Class"
                  onClick={() =>
                    handleQuickAction("live")
                  }
                />

                <QuickAction
                  icon={FileText}
                  label="Create Assignment"
                  onClick={() =>
                    handleQuickAction("assignment")
                  }
                />

                <QuickAction
                  icon={BookOpen}
                  label="Add Lesson"
                  onClick={() =>
                    handleQuickAction("lesson")
                  }
                />

                <QuickAction
                  icon={HelpCircle}
                  label="Create Quiz"
                  onClick={() =>
                    handleQuickAction("quiz")
                  }
                />
              </div>
            </motion.div>

            {/* Activity summary */}
            <motion.div
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.34 }}
              className="
                relative overflow-hidden
                rounded-3xl
                border border-blue-400/10
                bg-blue-500/[0.045]
                p-5
              "
            >
              <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-blue-500/10 blur-3xl" />

              <div className="relative">
                <Sparkles className="h-5 w-5 text-blue-400" />

                <h3 className="mt-3 font-semibold text-white">
                  Activity Overview
                </h3>

                <p className="mt-2 text-xs leading-5 text-slate-500">
                  This section will eventually show real-time
                  activity coming directly from the tutor
                  dashboard.
                </p>

                <div className="mt-4 flex items-center gap-2 text-xs text-blue-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                  Tracking enabled
                </div>
              </div>
            </motion.div>
          </aside>
        </div>

        {/* =================================================
            FOOT NOTE
        ================================================= */}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 flex items-center justify-center gap-2 pb-8 text-[11px] text-slate-700"
        >
          <Sparkles className="h-3 w-3" />
          Scholiqen Tutor Workspace
        </motion.div>
      </main>

      {/* ===================================================
          MODAL
      =================================================== */}

      <ActivityModal
        activity={selectedActivity}
        onClose={() => setSelectedActivity(null)}
      />
    </div>
  );
}

/* =========================================================
   SMALL COMPONENTS
========================================================= */

function ActivityPulse() {
  return (
    <span className="relative flex h-5 w-5 items-center justify-center">
      <span className="absolute h-2.5 w-2.5 rounded-full bg-blue-400/30 animate-ping" />

      <span className="relative h-2 w-2 rounded-full bg-blue-400" />
    </span>
  );
}

function OverviewRow({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.05] bg-white/[0.02] px-3 py-3">
      <div className="flex min-w-0 items-center gap-2.5">
        <Icon className="h-4 w-4 shrink-0 text-slate-600" />

        <span className="text-xs text-slate-500">
          {label}
        </span>
      </div>

      <span className="max-w-[150px] truncate text-right text-xs font-medium text-slate-300">
        {value}
      </span>
    </div>
  );
}

function QuickAction({
  icon: Icon,
  label,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="
        group flex w-full items-center
        justify-between
        rounded-xl
        border border-white/[0.06]
        bg-white/[0.02]
        px-3 py-3
        text-left
        transition-all
        hover:border-blue-400/15
        hover:bg-blue-500/[0.05]
      "
    >
      <span className="flex items-center gap-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.04]">
          <Icon className="h-4 w-4 text-slate-400 transition group-hover:text-blue-400" />
        </span>

        <span className="text-xs font-medium text-slate-300">
          {label}
        </span>
      </span>

      <Plus className="h-4 w-4 text-slate-700 transition group-hover:text-blue-400" />
    </button>
  );
}