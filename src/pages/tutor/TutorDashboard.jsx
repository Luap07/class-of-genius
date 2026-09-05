import React, {
  useMemo,
  useState,
} from "react";

import {
  motion,
} from "framer-motion";

import {
  useNavigate,
} from "react-router-dom";

import {
  BookOpen,
  Users,
  ClipboardList,
  Clock3,
  ArrowRight,
  Plus,
  Radio,
  GraduationCap,
  FolderOpen,
  CheckCircle2,
  TrendingUp,
  Sparkles,
  MoreHorizontal,
  PenTool,
} from "lucide-react";

const ACADEMY_USER_KEY =
  "scholiqen_academy_user";

const TutorDashboard = () => {
  const navigate = useNavigate();

  const [showQuickActions, setShowQuickActions] =
    useState(false);

  /*
   * ============================================================
   * TUTOR SESSION
   * ============================================================
   */

  const tutor = useMemo(() => {
    try {
      const stored =
        localStorage.getItem(
          ACADEMY_USER_KEY
        );

      if (!stored) {
        return null;
      }

      return JSON.parse(stored);
    } catch (error) {
      console.error(
        "Unable to read tutor session:",
        error
      );

      return null;
    }
  }, []);

  /*
   * ============================================================
   * TUTOR NAME
   * ============================================================
   */

  const tutorName = useMemo(() => {
    if (!tutor) {
      return "Tutor";
    }

    return [
      tutor.firstName,
      tutor.middleName,
      tutor.lastName,
    ]
      .filter(Boolean)
      .join(" ")
      .trim() || "Tutor";
  }, [tutor]);

  const firstName =
    tutorName.split(" ")[0] ||
    "Tutor";

  /*
   * ============================================================
   * DASHBOARD STATS
   *
   * Temporary values for now.
   *
   * These will later come from the Academy API.
   * ============================================================
   */

  const stats = [
    {
      title: "My Classes",
      value: "0",
      description:
        "Classes assigned to you",
      icon: BookOpen,
      iconClass:
        "text-cyan-300 bg-cyan-400/10 border-cyan-400/15",
      path: "/academy/tutor/classes",
    },

    {
      title: "Students",
      value: "0",
      description:
        "Students in your classes",
      icon: Users,
      iconClass:
        "text-violet-300 bg-violet-400/10 border-violet-400/15",
      path: "/academy/tutor/students",
    },

    {
      title: "Active Tasks",
      value: "0",
      description:
        "Tasks currently running",
      icon: ClipboardList,
      iconClass:
        "text-emerald-300 bg-emerald-400/10 border-emerald-400/15",
      path: "/academy/tutor/tasks",
    },

    {
      title: "Pending Reviews",
      value: "0",
      description:
        "Submissions waiting for you",
      icon: Clock3,
      iconClass:
        "text-amber-300 bg-amber-400/10 border-amber-400/15",
      path: "/academy/tutor/tasks",
    },
  ];

  /*
   * ============================================================
   * QUICK ACTIONS
   * ============================================================
   */

  const quickActions = [
    {
      title: "Create Task",
      description:
        "Give students something to work on",
      icon: ClipboardList,
      path:
        "/academy/tutor/tasks/create",
    },

    {
      title: "Schedule Lecture",
      description:
        "Plan your next live classroom",
      icon: Radio,
      path:
        "/academy/tutor/live/schedule",
    },

    {
      title: "Upload Material",
      description:
        "Add PDFs, slides or resources",
      icon: FolderOpen,
      path:
        "/academy/tutor/materials/upload",
    },

    {
      title: "Create Lesson",
      description:
        "Prepare your next lesson",
      icon: GraduationCap,
      path:
        "/academy/tutor/lessons/create",
    },
  ];

  /*
   * ============================================================
   * TEMPORARY DATA
   *
   * These arrays will later be populated from the backend.
   * ============================================================
   */

  const upcomingLectures = [];

  const recentActivity = [];

  /*
   * ============================================================
   * RENDER
   * ============================================================
   */

  return (
    <div className="space-y-7">

      {/* =====================================================
          WELCOME
      ===================================================== */}

      <motion.section
        initial={{
          opacity: 0,
          y: 15,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.45,
        }}
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.055] via-white/[0.025] to-cyan-400/[0.025] p-6 shadow-2xl shadow-black/20 sm:p-8"
      >

        <div className="pointer-events-none absolute -right-20 -top-28 h-72 w-72 rounded-full bg-cyan-400/[0.08] blur-[100px]" />

        <div className="pointer-events-none absolute bottom-[-100px] right-[25%] h-64 w-64 rounded-full bg-violet-500/[0.06] blur-[100px]" />

        <div className="relative flex flex-col justify-between gap-7 lg:flex-row lg:items-center">

          <div className="max-w-2xl">

            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-400/15 bg-cyan-400/[0.06] px-3 py-1.5">

              <Sparkles
                size={13}
                className="text-cyan-300"
              />

              <span className="text-[9px] font-black uppercase tracking-[0.18em] text-cyan-300">
                Tutor Workspace
              </span>

            </div>

            <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">

              Good to see you{" "}

              <span className="bg-gradient-to-r from-cyan-300 via-sky-300 to-violet-300 bg-clip-text text-transparent">
                {firstName}
              </span>
              .

            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400">
              Your teaching workspace is ready.
              Manage your classes, create tasks,
              teach live lessons, share materials,
              and monitor your students from one
              place.
            </p>

            <div className="mt-5 flex flex-wrap gap-3">

              <button
                onClick={() =>
                  navigate(
                    "/academy/tutor/classes"
                  )
                }
                className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-sky-500 px-4 py-2.5 text-xs font-black text-slate-950 shadow-lg shadow-cyan-500/10 transition hover:shadow-cyan-500/20"
              >

                View My Classes

                <ArrowRight
                  size={14}
                  className="transition group-hover:translate-x-0.5"
                />

              </button>

              <button
                onClick={() =>
                  navigate(
                    "/academy/tutor/live/schedule"
                  )
                }
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.035] px-4 py-2.5 text-xs font-bold text-slate-300 transition hover:bg-white/[0.07] hover:text-white"
              >

                <Radio size={14} />

                Schedule Lecture

              </button>

            </div>

          </div>

          {/* STATUS */}

          <div className="relative shrink-0">

            <div className="rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.045] p-4">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/10">

                  <CheckCircle2
                    size={19}
                    className="text-emerald-300"
                  />

                </div>

                <div>

                  <p className="text-xs font-bold text-white">
                    Tutor Account
                  </p>

                  <div className="mt-1 flex items-center gap-2">

                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />

                    <span className="text-[10px] font-semibold text-emerald-300">
                      Verified
                    </span>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

      </motion.section>


      {/* =====================================================
          STATS
      ===================================================== */}

      <section>

        <div className="mb-4 flex items-center justify-between">

          <div>

            <h2 className="text-sm font-black text-white">
              Teaching Overview
            </h2>

            <p className="mt-1 text-[11px] text-slate-600">
              Your current Academy activity
            </p>

          </div>

        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

          {stats.map(
            (stat, index) => {

              const Icon =
                stat.icon;

              return (
                <motion.button
                  key={stat.title}
                  initial={{
                    opacity: 0,
                    y: 15,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    duration: 0.35,
                    delay:
                      index * 0.07,
                  }}
                  onClick={() =>
                    navigate(
                      stat.path
                    )
                  }
                  className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025] p-5 text-left transition duration-300 hover:-translate-y-0.5 hover:border-white/15 hover:bg-white/[0.045]"
                >

                  <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-cyan-400/[0.025] blur-2xl transition group-hover:bg-cyan-400/[0.06]" />

                  <div className="relative flex items-start justify-between">

                    <div>

                      <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-600">
                        {stat.title}
                      </p>

                      <p className="mt-2 text-3xl font-black tracking-tight text-white">
                        {stat.value}
                      </p>

                      <p className="mt-1 text-[10px] text-slate-500">
                        {stat.description}
                      </p>

                    </div>

                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl border ${stat.iconClass}`}
                    >

                      <Icon size={18} />

                    </div>

                  </div>

                  <div className="relative mt-4 flex items-center gap-1 text-[10px] font-bold text-slate-600 transition group-hover:text-cyan-300">

                    Open

                    <ArrowRight
                      size={12}
                      className="transition group-hover:translate-x-0.5"
                    />

                  </div>

                </motion.button>
              );
            }
          )}

        </div>

      </section>


      {/* =====================================================
          QUICK ACTIONS
      ===================================================== */}

      <section>

        <div className="mb-4 flex items-center justify-between">

          <div>

            <h2 className="text-sm font-black text-white">
              Quick Actions
            </h2>

            <p className="mt-1 text-[11px] text-slate-600">
              Start teaching activities quickly
            </p>

          </div>

          <button
            onClick={() =>
              setShowQuickActions(
                (value) => !value
              )
            }
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.035] px-3 py-2 text-[10px] font-bold text-slate-400 transition hover:bg-white/[0.06] hover:text-white"
          >

            <Plus size={14} />

            Actions

          </button>

        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

          {quickActions.map(
            (action, index) => {

              const Icon =
                action.icon;

              return (
                <motion.button
                  key={action.title}
                  initial={{
                    opacity: 0,
                    y: 10,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    delay:
                      index * 0.05,
                  }}
                  onClick={() =>
                    navigate(
                      action.path
                    )
                  }
                  className="group rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-left transition hover:border-cyan-400/15 hover:bg-cyan-400/[0.025]"
                >

                  <div className="flex items-center justify-between">

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.035] text-cyan-300 transition group-hover:border-cyan-400/20 group-hover:bg-cyan-400/10">

                      <Icon size={17} />

                    </div>

                    <ArrowRight
                      size={14}
                      className="text-slate-700 transition group-hover:translate-x-0.5 group-hover:text-cyan-400"
                    />

                  </div>

                  <h3 className="mt-4 text-xs font-black text-white">
                    {action.title}
                  </h3>

                  <p className="mt-1 text-[10px] leading-5 text-slate-600">
                    {action.description}
                  </p>

                </motion.button>
              );
            }
          )}

        </div>

      </section>


      {/* =====================================================
          MAIN GRID
      ===================================================== */}

      <div className="grid gap-5 xl:grid-cols-[1.35fr_1fr]">

        {/* ===================================================
            MY CLASSES
        =================================================== */}

        <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">

          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">

            <div>

              <h2 className="text-sm font-black text-white">
                My Classes
              </h2>

              <p className="mt-1 text-[10px] text-slate-600">
                Classes you teach
              </p>

            </div>

            <button
              onClick={() =>
                navigate(
                  "/academy/tutor/classes"
                )
              }
              className="text-[10px] font-bold text-cyan-400 transition hover:text-cyan-300"
            >
              View all
            </button>

          </div>

          <div className="p-5">

            <EmptyState
              icon={BookOpen}
              title="No classes yet"
              description="Your assigned classes will appear here once the Academy connects you with students."
              actionLabel="Go to Classes"
              onAction={() =>
                navigate(
                  "/academy/tutor/classes"
                )
              }
            />

          </div>

        </section>


        {/* ===================================================
            UPCOMING LECTURES
        =================================================== */}

        <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">

          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">

            <div>

              <h2 className="text-sm font-black text-white">
                Upcoming Lectures
              </h2>

              <p className="mt-1 text-[10px] text-slate-600">
                Your live teaching schedule
              </p>

            </div>

            <button
              onClick={() =>
                navigate(
                  "/academy/tutor/live"
                )
              }
              className="text-[10px] font-bold text-cyan-400 transition hover:text-cyan-300"
            >
              View all
            </button>

          </div>

          <div className="p-5">

            {upcomingLectures.length ===
            0 ? (

              <EmptyState
                icon={Radio}
                title="No lectures scheduled"
                description="Schedule a live lecture when you're ready to teach your class online."
                actionLabel="Schedule Lecture"
                onAction={() =>
                  navigate(
                    "/academy/tutor/live/schedule"
                  )
                }
              />

            ) : (

              <div>
                {/* Future lecture cards */}
              </div>

            )}

          </div>

        </section>

      </div>


      {/* =====================================================
          RECENT ACTIVITY
      ===================================================== */}

      <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">

        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">

          <div>

            <h2 className="text-sm font-black text-white">
              Recent Activity
            </h2>

            <p className="mt-1 text-[10px] text-slate-600">
              What's happening in your classes
            </p>

          </div>

          <button
            className="rounded-lg p-1.5 text-slate-600 transition hover:bg-white/5 hover:text-white"
            title="More"
          >

            <MoreHorizontal
              size={17}
            />

          </button>

        </div>

        <div className="p-5">

          {recentActivity.length ===
          0 ? (

            <div className="flex flex-col items-center justify-center py-10 text-center">

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03]">

                <TrendingUp
                  size={19}
                  className="text-slate-600"
                />

              </div>

              <h3 className="mt-4 text-xs font-black text-slate-300">
                No activity yet
              </h3>

              <p className="mt-1 max-w-sm text-[10px] leading-5 text-slate-600">
                Once you start creating tasks,
                teaching lessons and interacting
                with students, your activity will
                appear here.
              </p>

            </div>

          ) : (

            <div>
              {/* Future activity items */}
            </div>

          )}

        </div>

      </section>


      {/* =====================================================
          TEACHING TOOL STRIP
      ===================================================== */}

      <section className="relative overflow-hidden rounded-2xl border border-cyan-400/10 bg-gradient-to-r from-cyan-400/[0.04] via-transparent to-violet-500/[0.04] p-5">

        <div className="pointer-events-none absolute right-0 top-0 h-40 w-40 rounded-full bg-cyan-400/[0.05] blur-[70px]" />

        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

          <div>

            <div className="flex items-center gap-2">

              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-400/10">

                <Sparkles
                  size={15}
                  className="text-cyan-300"
                />

              </div>

              <h2 className="text-sm font-black text-white">
                Your Teaching Workspace
              </h2>

            </div>

            <p className="mt-2 max-w-2xl text-[11px] leading-5 text-slate-500">
              Scholiqen will bring your live classroom,
              presentation slides, PDFs, whiteboard,
              tasks, assignments and student progress
              together in one teaching environment.
            </p>

          </div>

          <div className="flex flex-wrap gap-2">

            <ToolButton
              icon={Radio}
              label="Live Class"
              onClick={() =>
                navigate(
                  "/academy/tutor/live"
                )
              }
            />

            <ToolButton
              icon={PenTool}
              label="Whiteboard"
              onClick={() =>
                navigate(
                  "/academy/tutor/whiteboard"
                )
              }
            />

            <ToolButton
              icon={FolderOpen}
              label="Materials"
              onClick={() =>
                navigate(
                  "/academy/tutor/materials"
                )
              }
            />

          </div>

        </div>

      </section>

    </div>
  );
};


/* ============================================================
   EMPTY STATE
============================================================ */

const EmptyState = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">

      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03]">

        <Icon
          size={19}
          className="text-slate-600"
        />

      </div>

      <h3 className="mt-4 text-xs font-black text-slate-300">
        {title}
      </h3>

      <p className="mt-1 max-w-sm text-[10px] leading-5 text-slate-600">
        {description}
      </p>

      {actionLabel && (
        <button
          onClick={onAction}
          className="mt-4 inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.035] px-3 py-2 text-[10px] font-bold text-slate-400 transition hover:border-cyan-400/20 hover:bg-cyan-400/[0.05] hover:text-cyan-300"
        >

          {actionLabel}

          <ArrowRight size={12} />

        </button>
      )}

    </div>
  );
};


/* ============================================================
   TOOL BUTTON
============================================================ */

const ToolButton = ({
  icon: Icon,
  label,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.035] px-3 py-2.5 text-[10px] font-bold text-slate-400 transition hover:border-cyan-400/20 hover:bg-cyan-400/[0.05] hover:text-cyan-300"
    >

      <Icon size={14} />

      {label}

    </button>
  );
};


export default TutorDashboard;
