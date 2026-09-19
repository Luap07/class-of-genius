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
  AlertCircle,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  Filter,
  GraduationCap,
  Paperclip,
  Search,
  Upload,
  XCircle,
} from "lucide-react";

/* =========================================================
   DEMO TASK DATA
========================================================= */

const TASKS = [
  {
    id: "task-001",
    title: "Algebra Practice Assignment",
    subject: "Mathematics",
    type: "Assignment",
    description:
      "Solve the assigned algebra problems covering linear expressions and equations.",
    dueDate: "Sep 20, 2026",
    status: "Pending",
    priority: "High",
    score: null,
    questions: 20,
    attachments: 1,
    estimatedTime: "45 min",
  },
  {
    id: "task-002",
    title: "Cell Biology Worksheet",
    subject: "Biology",
    type: "Worksheet",
    description:
      "Complete the worksheet on cell structure, organelles, and their functions.",
    dueDate: "Sep 21, 2026",
    status: "Pending",
    priority: "Medium",
    score: null,
    questions: 15,
    attachments: 2,
    estimatedTime: "35 min",
  },
  {
    id: "task-003",
    title: "English Reading Task",
    subject: "English",
    type: "Reading",
    description:
      "Read the assigned passage and answer the comprehension questions.",
    dueDate: "Sep 17, 2026",
    status: "Submitted",
    priority: "Medium",
    score: null,
    questions: 10,
    attachments: 1,
    estimatedTime: "30 min",
  },
  {
    id: "task-004",
    title: "Physics Motion Questions",
    subject: "Physics",
    type: "Assignment",
    description:
      "Work through the questions covering speed, velocity, acceleration, and motion.",
    dueDate: "Sep 15, 2026",
    status: "Graded",
    priority: "Low",
    score: 86,
    questions: 18,
    attachments: 0,
    estimatedTime: "40 min",
  },
  {
    id: "task-005",
    title: "Chemical Reactions Exercise",
    subject: "Chemistry",
    type: "Exercise",
    description:
      "Balance chemical equations and identify the reaction types shown.",
    dueDate: "Sep 23, 2026",
    status: "Pending",
    priority: "High",
    score: null,
    questions: 20,
    attachments: 1,
    estimatedTime: "40 min",
  },
  {
    id: "task-006",
    title: "Introduction to Programming",
    subject: "Computer Science",
    type: "Practical",
    description:
      "Complete the programming exercises covering variables, conditions, and basic logic.",
    dueDate: "Sep 25, 2026",
    status: "Pending",
    priority: "Medium",
    score: null,
    questions: 8,
    attachments: 0,
    estimatedTime: "60 min",
  },
  {
    id: "task-007",
    title: "Demand and Supply Analysis",
    subject: "Economics",
    type: "Assignment",
    description:
      "Explain how demand and supply affect market equilibrium using examples.",
    dueDate: "Sep 13, 2026",
    status: "Overdue",
    priority: "High",
    score: null,
    questions: 6,
    attachments: 1,
    estimatedTime: "35 min",
  },
  {
    id: "task-008",
    title: "Essay Writing Practice",
    subject: "English",
    type: "Writing",
    description:
      "Write a structured essay using an introduction, supporting paragraphs, and conclusion.",
    dueDate: "Sep 18, 2026",
    status: "Submitted",
    priority: "High",
    score: null,
    questions: 1,
    attachments: 0,
    estimatedTime: "50 min",
  },
  {
    id: "task-009",
    title: "Functions and Graphs",
    subject: "Mathematics",
    type: "Exercise",
    description:
      "Complete the exercises on functions, tables of values, and graphical representation.",
    dueDate: "Sep 11, 2026",
    status: "Graded",
    priority: "Low",
    score: 92,
    questions: 15,
    attachments: 1,
    estimatedTime: "45 min",
  },
  {
    id: "task-010",
    title: "Living Organisms Quiz",
    subject: "Biology",
    type: "Quiz",
    description:
      "Answer the quiz questions covering characteristics and classification of living organisms.",
    dueDate: "Sep 10, 2026",
    status: "Graded",
    priority: "Medium",
    score: 78,
    questions: 20,
    attachments: 0,
    estimatedTime: "25 min",
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

const getStatusConfig = (status) => {
  switch (status) {
    case "Submitted":
      return {
        icon: CheckCircle2,
        className:
          "border-blue-400/20 bg-blue-400/10 text-blue-300",
      };

    case "Graded":
      return {
        icon: CheckCircle2,
        className:
          "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
      };

    case "Overdue":
      return {
        icon: XCircle,
        className:
          "border-red-400/20 bg-red-400/10 text-red-300",
      };

    default:
      return {
        icon: Clock3,
        className:
          "border-amber-400/20 bg-amber-400/10 text-amber-300",
      };
  }
};

const getPriorityConfig = (priority) => {
  switch (priority) {
    case "High":
      return "text-red-300 bg-red-400/10 border-red-400/20";

    case "Medium":
      return "text-amber-300 bg-amber-400/10 border-amber-400/20";

    default:
      return "text-slate-300 bg-slate-400/10 border-slate-400/20";
  }
};

/* =========================================================
   COMPONENT
========================================================= */

const StudentTasks = () => {
  const navigate = useNavigate();
  const { student } = useOutletContext() || {};

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [subjectFilter, setSubjectFilter] = useState("All");

  const studentName =
    student?.full_name ||
    student?.name ||
    student?.student_name ||
    student?.first_name ||
    "Student";

  /* =======================================================
     FILTER OPTIONS
  ======================================================= */

  const subjects = useMemo(() => {
    return [
      "All",
      ...Array.from(
        new Set(TASKS.map((task) => task.subject))
      ),
    ];
  }, []);

  const statuses = [
    "All",
    "Pending",
    "Submitted",
    "Graded",
    "Overdue",
  ];

  /* =======================================================
     FILTERED TASKS
  ======================================================= */

  const filteredTasks = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return TASKS.filter((task) => {
      const matchesSearch =
        !search ||
        task.title.toLowerCase().includes(search) ||
        task.subject.toLowerCase().includes(search) ||
        task.type.toLowerCase().includes(search) ||
        task.description.toLowerCase().includes(search);

      const matchesStatus =
        statusFilter === "All" ||
        task.status === statusFilter;

      const matchesSubject =
        subjectFilter === "All" ||
        task.subject === subjectFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesSubject
      );
    });
  }, [
    searchTerm,
    statusFilter,
    subjectFilter,
  ]);

  /* =======================================================
     SUMMARY
  ======================================================= */

  const totalTasks = TASKS.length;

  const pendingTasks = TASKS.filter(
    (task) => task.status === "Pending"
  ).length;

  const submittedTasks = TASKS.filter(
    (task) => task.status === "Submitted"
  ).length;

  const gradedTasks = TASKS.filter(
    (task) => task.status === "Graded"
  ).length;

  const overdueTasks = TASKS.filter(
    (task) => task.status === "Overdue"
  ).length;

  /* =======================================================
     TASK ACTION
  ======================================================= */

  const openTask = (task) => {
    navigate(
      `/academy/student/tasks?task=${encodeURIComponent(
        task.id
      )}`
    );
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="min-h-full bg-[#020617] px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* =================================================
            PAGE HEADER
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
                <FileText size={16} />
                <span>Student Tasks</span>
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Your Tasks
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                Stay on top of your assignments, exercises,
                practical work, and other learning activities.
              </p>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#071426] px-4 py-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
                <GraduationCap size={20} />
              </div>

              <div>
                <p className="text-xs text-slate-500">
                  Keep learning
                </p>

                <p className="text-sm font-semibold text-white">
                  {studentName}
                </p>
              </div>

              <div className="ml-2 hidden h-8 w-px bg-white/10 sm:block" />

              <div className="hidden sm:block">
                <p className="text-xs text-slate-500">
                  Total tasks
                </p>

                <p className="text-sm font-semibold text-cyan-300">
                  {totalTasks}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* =================================================
            SUMMARY CARDS
        ================================================= */}

        <div className="mb-8 grid grid-cols-2 gap-4 xl:grid-cols-5">

          <SummaryCard
            label="Total Tasks"
            value={totalTasks}
            icon={FileText}
            iconClass="text-cyan-300 bg-cyan-400/10"
          />

          <SummaryCard
            label="Pending"
            value={pendingTasks}
            icon={Clock3}
            iconClass="text-amber-300 bg-amber-400/10"
          />

          <SummaryCard
            label="Submitted"
            value={submittedTasks}
            icon={Upload}
            iconClass="text-blue-300 bg-blue-400/10"
          />

          <SummaryCard
            label="Graded"
            value={gradedTasks}
            icon={CheckCircle2}
            iconClass="text-emerald-300 bg-emerald-400/10"
          />

          <SummaryCard
            label="Overdue"
            value={overdueTasks}
            icon={AlertCircle}
            iconClass="text-red-300 bg-red-400/10"
          />

        </div>

        {/* =================================================
            SEARCH + FILTERS
        ================================================= */}

        <div className="mb-6 rounded-2xl border border-white/10 bg-[#071426] p-4">
          <div className="flex flex-col gap-4">

            <div className="relative">
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
                placeholder="Search tasks, subjects, or task types..."
                className="w-full rounded-xl border border-white/10 bg-[#020617] py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/40"
              />
            </div>

            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">

              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Filter size={16} />
                <span>Filter</span>
              </div>

              <div className="flex gap-2 overflow-x-auto pb-1">
                {statuses.map((status) => {
                  const active =
                    statusFilter === status;

                  return (
                    <button
                      key={status}
                      type="button"
                      onClick={() =>
                        setStatusFilter(status)
                      }
                      className={`whitespace-nowrap rounded-xl border px-3 py-2 text-xs font-medium transition ${
                        active
                          ? "border-cyan-400/30 bg-cyan-400/10 text-cyan-300"
                          : "border-white/10 bg-[#020617] text-slate-400 hover:border-white/20 hover:text-white"
                      }`}
                    >
                      {status}
                    </button>
                  );
                })}
              </div>

              <div className="hidden h-7 w-px bg-white/10 lg:block" />

              <select
                value={subjectFilter}
                onChange={(event) =>
                  setSubjectFilter(event.target.value)
                }
                className="rounded-xl border border-white/10 bg-[#020617] px-3 py-2 text-xs text-slate-300 outline-none focus:border-cyan-400/40"
              >
                {subjects.map((subject) => (
                  <option
                    key={subject}
                    value={subject}
                    className="bg-[#020617]"
                  >
                    {subject === "All"
                      ? "All Subjects"
                      : subject}
                  </option>
                ))}
              </select>

            </div>
          </div>
        </div>

        {/* =================================================
            RESULTS HEADER
        ================================================= */}

        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">
              Assignments & Activities
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Showing {filteredTasks.length} of {totalTasks} tasks
            </p>
          </div>

          {(searchTerm ||
            statusFilter !== "All" ||
            subjectFilter !== "All") && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("All");
                setSubjectFilter("All");
              }}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-400 transition hover:bg-white/5 hover:text-white"
            >
              <XCircle size={15} />
              Clear filters
            </button>
          )}
        </div>

        {/* =================================================
            TASK LIST
        ================================================= */}

        {filteredTasks.length > 0 ? (
          <div className="space-y-4">

            {filteredTasks.map((task, index) => {
              const statusConfig =
                getStatusConfig(task.status);

              const StatusIcon =
                statusConfig.icon;

              return (
                <motion.div
                  key={task.id}
                  initial={{
                    opacity: 0,
                    y: 10,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    duration: 0.3,
                    delay: index * 0.035,
                  }}
                  className="group rounded-2xl border border-white/10 bg-[#071426] p-5 transition hover:border-cyan-400/20"
                >
                  <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">

                    {/* TASK INFO */}

                    <div className="min-w-0 flex-1">

                      <div className="mb-3 flex flex-wrap items-center gap-2">

                        <span className="rounded-lg border border-cyan-400/15 bg-cyan-400/10 px-2.5 py-1 text-[11px] font-semibold text-cyan-300">
                          {task.subject}
                        </span>

                        <span className="rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[11px] font-medium text-slate-400">
                          {task.type}
                        </span>

                        <span
                          className={`rounded-lg border px-2.5 py-1 text-[11px] font-medium ${getPriorityConfig(
                            task.priority
                          )}`}
                        >
                          {task.priority} Priority
                        </span>

                      </div>

                      <h3 className="text-base font-semibold text-white sm:text-lg">
                        {task.title}
                      </h3>

                      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
                        {task.description}
                      </p>

                      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-500">

                        <div className="flex items-center gap-1.5">
                          <CalendarDays size={14} />
                          <span>
                            Due {task.dueDate}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <Clock3 size={14} />
                          <span>
                            {task.estimatedTime}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <FileText size={14} />
                          <span>
                            {task.questions}{" "}
                            {task.questions === 1
                              ? "question"
                              : "questions"}
                          </span>
                        </div>

                        {task.attachments > 0 && (
                          <div className="flex items-center gap-1.5">
                            <Paperclip size={14} />
                            <span>
                              {task.attachments}{" "}
                              {task.attachments === 1
                                ? "attachment"
                                : "attachments"}
                            </span>
                          </div>
                        )}

                      </div>
                    </div>

                    {/* STATUS + ACTION */}

                    <div className="flex flex-col gap-3 border-t border-white/10 pt-4 xl:min-w-[190px] xl:border-l xl:border-t-0 xl:pl-5 xl:pt-0">

                      <div className="flex items-center justify-between xl:justify-start">
                        <span className="text-xs text-slate-500">
                          Status
                        </span>

                        <span
                          className={`ml-3 inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold ${statusConfig.className}`}
                        >
                          <StatusIcon size={13} />
                          {task.status}
                        </span>
                      </div>

                      {task.score !== null && (
                        <div className="flex items-center justify-between xl:justify-start">
                          <span className="text-xs text-slate-500">
                            Score
                          </span>

                          <span className="ml-3 text-sm font-bold text-emerald-300">
                            {task.score}%
                          </span>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => openTask(task)}
                        className="mt-1 inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-400 px-4 py-2.5 text-xs font-bold text-slate-950 transition hover:bg-cyan-300"
                      >
                        {task.status === "Graded"
                          ? "View Result"
                          : task.status === "Submitted"
                          ? "View Submission"
                          : "Open Task"}

                        <ArrowRight size={15} />
                      </button>

                    </div>
                  </div>
                </motion.div>
              );
            })}

          </div>
        ) : (
          /* ===============================================
             EMPTY STATE
          =============================================== */

          <div className="rounded-2xl border border-dashed border-white/10 bg-[#071426] px-6 py-16 text-center">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-300">
              <Search size={24} />
            </div>

            <h3 className="mt-5 text-lg font-semibold text-white">
              No tasks found
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              No tasks match your current search and filter
              settings. Try changing the filters or search
              for another task.
            </p>

            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("All");
                setSubjectFilter("All");
              }}
              className="mt-5 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-xs font-semibold text-slate-300 transition hover:bg-white/[0.06] hover:text-white"
            >
              Reset Filters
            </button>

          </div>
        )}

        {/* =================================================
            UPCOMING REMINDER
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
            delay: 0.15,
          }}
          className="mt-8 rounded-2xl border border-cyan-400/10 bg-gradient-to-r from-cyan-400/[0.07] to-transparent p-5"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
                <CalendarDays size={19} />
              </div>

              <div>
                <p className="text-sm font-semibold text-white">
                  Keep an eye on your deadlines
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Complete pending tasks before their due dates
                  to keep your learning schedule on track.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                navigate("/academy/student/lessons")
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#020617] px-4 py-2.5 text-xs font-semibold text-slate-300 transition hover:border-cyan-400/20 hover:text-white"
            >
              Continue Learning
              <ArrowRight size={14} />
            </button>

          </div>
        </motion.div>

      </div>
    </div>
  );
};

/* =========================================================
   SUMMARY CARD
========================================================= */

const SummaryCard = ({
  label,
  value,
  icon: Icon,
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

export default StudentTasks;
