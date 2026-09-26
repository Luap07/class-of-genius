import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { motion } from "framer-motion";

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
  RefreshCw,
  Search,
  Upload,
  XCircle,
} from "lucide-react";

/* =========================================================
   CONFIG
========================================================= */

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

const ACADEMY_TOKEN_KEY =
  "scholiqen_academy_token";

const ACADEMY_USER_KEY =
  "scholiqen_academy_user";

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
    .map((part) =>
      part.charAt(0).toUpperCase()
    )
    .join("");
};

/* =========================================================
   CLASS NORMALIZATION
========================================================= */

const normalizeClass = (value = "") => {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/_/g, " ");
};

/* =========================================================
   SUBJECT NORMALIZATION
========================================================= */

const normalizeSubject = (value = "") => {
  const subject = String(value)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

  const aliases = {
    math: "mathematics",
    maths: "mathematics",
    mathematics: "mathematics",

    english: "english language",
    "english language": "english language",
    "english studies": "english language",

    ict: "computer studies",
    "computer science": "computer studies",
    "computer studies": "computer studies",
    "data processing": "computer studies",

    physics: "physics",

    chemistry: "chemistry",

    biology: "biology",

    phe: "physical and health education",
    "physical education":
      "physical and health education",
    "physical and health education":
      "physical and health education",

    crs: "christian religious studies",
    crk: "christian religious studies",
    "christian religious studies":
      "christian religious studies",

    irs: "islamic religious studies",
    irk: "islamic religious studies",
    "islamic religious studies":
      "islamic religious studies",

    economics: "economics",

    literature: "literature in english",
    "literature in english":
      "literature in english",

    "further maths": "further mathematics",
    "further mathematics":
      "further mathematics",

    "agricultural science":
      "agricultural science",
  };

  return aliases[subject] || subject;
};

/* =========================================================
   STATUS CONFIG
========================================================= */

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

    case "Open":
    default:
      return {
        icon: Clock3,
        className:
          "border-amber-400/20 bg-amber-400/10 text-amber-300",
      };
  }
};

/* =========================================================
   PRIORITY
========================================================= */

const getPriorityConfig = (priority) => {
  switch (
    String(priority || "")
      .trim()
      .toLowerCase()
  ) {
    case "high":
      return "text-red-300 bg-red-400/10 border-red-400/20";

    case "medium":
      return "text-amber-300 bg-amber-400/10 border-amber-400/20";

    case "low":
      return "text-slate-300 bg-slate-400/10 border-slate-400/20";

    default:
      return "text-amber-300 bg-amber-400/10 border-amber-400/20";
  }
};

/* =========================================================
   DATE FORMAT
========================================================= */

const formatDate = (value) => {
  if (!value) return "No due date";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

/* =========================================================
   DATE STATUS
========================================================= */

const isPastDue = (value) => {
  if (!value) return false;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return false;
  }

  return date.getTime() < Date.now();
};

/* =========================================================
   ATTACHMENT NORMALIZER
========================================================= */

const normalizeAttachments = (attachments) => {
  if (!attachments) return [];

  if (Array.isArray(attachments)) {
    return attachments;
  }

  if (typeof attachments === "string") {
    try {
      const parsed = JSON.parse(attachments);

      return Array.isArray(parsed)
        ? parsed
        : [];
    } catch {
      return [];
    }
  }

  return [];
};

/* =========================================================
   TASK NORMALIZER
========================================================= */

const normalizeTask = (raw) => {
  const activity =
    raw?.activity || raw;

  const submission =
    raw?.submission ||
    raw?.student_submission ||
    null;

  const rawStatus = String(
    submission?.status ||
      raw?.submission_status ||
      raw?.status ||
      ""
  ).toLowerCase();

  let status = "Open";

  /*
   * IMPORTANT:
   *
   * There is no "Pending" student status anymore.
   *
   * If a student has not submitted the task,
   * the task is OPEN.
   */

  if (
    rawStatus === "graded"
  ) {
    status = "Graded";
  } else if (
    rawStatus === "submitted" ||
    rawStatus === "pending_review"
  ) {
    status = "Submitted";
  } else if (
    !submission &&
    isPastDue(
      activity?.due_date ||
        activity?.dueDate
    )
  ) {
    status = "Overdue";
  } else {
    status = "Open";
  }

  const attachments =
    normalizeAttachments(
      activity?.attachments
    );

  const metadata =
    activity?.metadata || {};

  const questionCount =
    activity?.question_count ??
    metadata?.questionCount ??
    metadata?.questions ??
    null;

  const priority =
    activity?.priority ||
    metadata?.priority ||
    "Medium";

  return {
    ...activity,

    id:
      activity?.id ??
      activity?.activity_id ??
      activity?.activityId,

    title:
      activity?.title ||
      "Untitled Task",

    subject:
      activity?.subject ||
      "General",

    type:
      activity?.activity_type ||
      activity?.activityType ||
      metadata?.activityType ||
      "Task",

    description:
      activity?.description ||
      "Complete the task assigned by your tutor.",

    instructions:
      activity?.instructions ||
      metadata?.instructions ||
      "",

    dueDate:
      activity?.due_date ||
      activity?.dueDate ||
      null,

    priority,

    maxScore:
      activity?.max_score ??
      activity?.maxScore ??
      metadata?.maxScore ??
      100,

    questions:
      questionCount,

    attachments,

    attachmentCount:
      attachments.length,

    estimatedTime:
      activity?.estimated_time ||
      activity?.estimatedTime ||
      metadata?.estimatedTime ||
      null,

    status,

    score:
      submission?.score ??
      raw?.score ??
      null,

    submission,

    metadata,
  };
};

/* =========================================================
   COMPONENT
========================================================= */

const StudentTasks = () => {
  const navigate = useNavigate();

  const outletContext =
    useOutletContext() || {};

  const contextStudent =
    outletContext.student;

  const [student, setStudent] =
    useState(contextStudent || null);

  const [tasks, setTasks] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [searchTerm, setSearchTerm] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("All");

  const [subjectFilter, setSubjectFilter] =
    useState("All");

  /* =======================================================
     LOAD STORED STUDENT
  ======================================================= */

  useEffect(() => {
    if (contextStudent) {
      setStudent(contextStudent);
      return;
    }

    try {
      const stored =
        localStorage.getItem(
          ACADEMY_USER_KEY
        );

      if (!stored) return;

      const parsed =
        JSON.parse(stored);

      setStudent(parsed);
    } catch (storageError) {
      console.error(
        "Unable to read academy student:",
        storageError
      );
    }
  }, [contextStudent]);

  /* =======================================================
     STUDENT INFORMATION
  ======================================================= */

  const studentName =
    student?.full_name ||
    student?.name ||
    student?.student_name ||
    [
      student?.first_name,
      student?.last_name,
    ]
      .filter(Boolean)
      .join(" ") ||
    "Student";

  const studentClass =
    student?.class ||
    student?.grade ||
    student?.student_class ||
    student?.studentClass ||
    student?.school_class ||
    "";

  const studentSubject =
    student?.subject ||
    student?.student_subject ||
    "";

  /* =======================================================
     AUTH TOKEN
  ======================================================= */

  const getToken = useCallback(() => {
    return localStorage.getItem(
      ACADEMY_TOKEN_KEY
    );
  }, []);

  /* =======================================================
     LOAD TASKS
  ======================================================= */

  const loadTasks = useCallback(
    async (showRefresh = false) => {
      const token = getToken();

      if (!token) {
        setLoading(false);

        setError(
          "Your student session has expired. Please log in again."
        );

        return;
      }

      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      try {
        const response = await fetch(
          `${API_URL}/api/academy/student/tasks`,
          {
            method: "GET",

            headers: {
              Authorization:
                `Bearer ${token}`,

              Accept:
                "application/json",
            },
          }
        );

        let data = null;

        try {
          data =
            await response.json();
        } catch {
          data = null;
        }

        if (!response.ok) {
          throw new Error(
            data?.message ||
              data?.error ||
              `Unable to load tasks (${response.status})`
          );
        }

        const incomingTasks =
          Array.isArray(data)
            ? data
            : Array.isArray(
                data?.tasks
              )
            ? data.tasks
            : Array.isArray(
                data?.activities
              )
            ? data.activities
            : Array.isArray(
                data?.results
              )
            ? data.results
            : [];

        const normalized =
          incomingTasks
            .map(normalizeTask)
            .filter(
              (task) =>
                task.id !==
                  undefined &&
                task.id !== null
            );

        setTasks(normalized);

        if (data?.student) {
          setStudent(
            (current) => ({
              ...(current || {}),
              ...data.student,
            })
          );
        }
      } catch (fetchError) {
        console.error(
          "Student tasks error:",
          fetchError
        );

        setError(
          fetchError?.message ||
            "Unable to load your tasks."
        );

        setTasks([]);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [getToken]
  );

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  /* =======================================================
     SUBJECT OPTIONS
  ======================================================= */

  const subjects = useMemo(() => {
    const uniqueSubjects =
      Array.from(
        new Map(
          tasks.map((task) => [
            normalizeSubject(
              task.subject
            ),
            task.subject,
          ])
        ).values()
      );

    return [
      "All",
      ...uniqueSubjects,
    ];
  }, [tasks]);

  /* =======================================================
     STATUS OPTIONS
  ======================================================= */

  const statuses = [
    "All",
    "Open",
    "Submitted",
    "Graded",
    "Overdue",
  ];

  /* =======================================================
     FILTER TASKS
  ======================================================= */

  const filteredTasks = useMemo(() => {
    const search =
      searchTerm
        .trim()
        .toLowerCase();

    const normalizedStudentClass =
      normalizeClass(
        studentClass
      );

    const normalizedStudentSubject =
      normalizeSubject(
        studentSubject
      );

    return tasks.filter(
      (task) => {
        const taskClass =
          task.grade ||
          task.class ||
          task.student_class ||
          task.studentClass ||
          "";

        const normalizedTaskClass =
          normalizeClass(
            taskClass
          );

        const classMatches =
          !normalizedStudentClass ||
          !normalizedTaskClass ||
          normalizedTaskClass ===
            normalizedStudentClass;

        const subjectMatches =
          !normalizedStudentSubject ||
          !task.subject ||
          normalizeSubject(
            task.subject
          ) ===
            normalizedStudentSubject;

        const matchesSearch =
          !search ||
          String(
            task.title || ""
          )
            .toLowerCase()
            .includes(search) ||
          String(
            task.subject || ""
          )
            .toLowerCase()
            .includes(search) ||
          String(
            task.type || ""
          )
            .toLowerCase()
            .includes(search) ||
          String(
            task.description || ""
          )
            .toLowerCase()
            .includes(search);

        const matchesStatus =
          statusFilter === "All" ||
          task.status ===
            statusFilter;

        const matchesSubject =
          subjectFilter === "All" ||
          task.subject ===
            subjectFilter;

        return (
          classMatches &&
          subjectMatches &&
          matchesSearch &&
          matchesStatus &&
          matchesSubject
        );
      }
    );
  }, [
    tasks,
    studentClass,
    studentSubject,
    searchTerm,
    statusFilter,
    subjectFilter,
  ]);

  /* =======================================================
     SUMMARY
  ======================================================= */

  const totalTasks =
    tasks.length;

  const openTasks =
    tasks.filter(
      (task) =>
        task.status === "Open"
    ).length;

  const submittedTasks =
    tasks.filter(
      (task) =>
        task.status ===
        "Submitted"
    ).length;

  const gradedTasks =
    tasks.filter(
      (task) =>
        task.status ===
        "Graded"
    ).length;

  const overdueTasks =
    tasks.filter(
      (task) =>
        task.status ===
        "Overdue"
    ).length;

  /* =======================================================
     OPEN TASK
  ======================================================= */

  const openTask = (task) => {
    if (!task?.id) {
      return;
    }

    /*
     * This is the actual task-detail route.
     *
     * The old route:
     *
     * /academy/student/tasks?task=ID
     *
     * did not automatically open a task-detail page.
     *
     * We now send the student directly to:
     *
     * /academy/student/task/:taskId
     */

    navigate(
      `/academy/student/task/${encodeURIComponent(
        task.id
      )}`
    );
  };

  /* =======================================================
     RESET FILTERS
  ======================================================= */

  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("All");
    setSubjectFilter("All");
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="min-h-full bg-[#020617] px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* PAGE HEADER */}

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
                <span>
                  Student Tasks
                </span>
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Your Tasks
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                Complete tasks and learning
                activities assigned to you by
                your tutors.
              </p>

              {studentClass && (
                <div className="mt-3 flex flex-wrap items-center gap-2">

                  <span className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-slate-400">
                    Class:{" "}
                    <span className="font-semibold text-slate-200">
                      {studentClass}
                    </span>
                  </span>

                  {studentSubject && (
                    <span className="rounded-lg border border-cyan-400/10 bg-cyan-400/5 px-3 py-1.5 text-xs text-cyan-300">
                      Subject:{" "}
                      <span className="font-semibold">
                        {studentSubject}
                      </span>
                    </span>
                  )}

                </div>
              )}
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#071426] px-4 py-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
                <GraduationCap
                  size={20}
                />
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

              <button
                type="button"
                onClick={() =>
                  loadTasks(true)
                }
                disabled={refreshing}
                title="Refresh tasks"
                className="ml-1 flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-slate-400 transition hover:border-cyan-400/20 hover:text-cyan-300 disabled:opacity-50"
              >
                <RefreshCw
                  size={15}
                  className={
                    refreshing
                      ? "animate-spin"
                      : ""
                  }
                />
              </button>

            </div>
          </div>
        </motion.div>

        {/* ERROR */}

        {error && (
          <div className="mb-6 rounded-2xl border border-red-400/20 bg-red-400/5 p-4">

            <div className="flex items-start gap-3">

              <AlertCircle
                size={18}
                className="mt-0.5 shrink-0 text-red-300"
              />

              <div className="min-w-0 flex-1">

                <p className="text-sm font-semibold text-red-200">
                  Unable to load tasks
                </p>

                <p className="mt-1 text-xs leading-5 text-red-300/70">
                  {error}
                </p>

              </div>

              <button
                type="button"
                onClick={() =>
                  loadTasks(true)
                }
                className="rounded-lg border border-red-400/20 bg-red-400/10 px-3 py-2 text-xs font-semibold text-red-200 hover:bg-red-400/15"
              >
                Retry
              </button>

            </div>
          </div>
        )}

        {/* SUMMARY */}

        <div className="mb-8 grid grid-cols-2 gap-4 xl:grid-cols-5">

          <SummaryCard
            label="Total Tasks"
            value={totalTasks}
            icon={FileText}
            iconClass="text-cyan-300 bg-cyan-400/10"
          />

          <SummaryCard
            label="Open"
            value={openTasks}
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

        {/* SEARCH + FILTERS */}

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
                  setSearchTerm(
                    event.target.value
                  )
                }
                placeholder="Search tasks, subjects, or task types..."
                className="w-full rounded-xl border border-white/10 bg-[#020617] py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/40"
              />

            </div>

            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">

              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Filter size={16} />
                <span>
                  Filter
                </span>
              </div>

              <div className="flex gap-2 overflow-x-auto pb-1">

                {statuses.map(
                  (status) => {
                    const active =
                      statusFilter ===
                      status;

                    return (
                      <button
                        key={status}
                        type="button"
                        onClick={() =>
                          setStatusFilter(
                            status
                          )
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
                  }
                )}

              </div>

              <div className="hidden h-7 w-px bg-white/10 lg:block" />

              <select
                value={subjectFilter}
                onChange={(event) =>
                  setSubjectFilter(
                    event.target.value
                  )
                }
                className="rounded-xl border border-white/10 bg-[#020617] px-3 py-2 text-xs text-slate-300 outline-none focus:border-cyan-400/40"
              >
                {subjects.map(
                  (subject) => (
                    <option
                      key={subject}
                      value={subject}
                      className="bg-[#020617]"
                    >
                      {subject ===
                      "All"
                        ? "All Subjects"
                        : subject}
                    </option>
                  )
                )}
              </select>

            </div>
          </div>
        </div>

        {/* RESULTS HEADER */}

        <div className="mb-4 flex items-center justify-between gap-4">

          <div>
            <h2 className="text-lg font-semibold text-white">
              Assignments & Activities
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Showing{" "}
              {filteredTasks.length}{" "}
              of {totalTasks} tasks
            </p>
          </div>

          {(searchTerm ||
            statusFilter !==
              "All" ||
            subjectFilter !==
              "All") && (
            <button
              type="button"
              onClick={
                resetFilters
              }
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-400 transition hover:bg-white/5 hover:text-white"
            >
              <XCircle
                size={15}
              />
              Clear filters
            </button>
          )}

        </div>

        {/* LOADING */}

        {loading ? (
          <div className="space-y-4">

            {Array.from({
              length: 4,
            }).map(
              (_, index) => (
                <div
                  key={index}
                  className="animate-pulse rounded-2xl border border-white/10 bg-[#071426] p-5"
                >
                  <div className="h-4 w-32 rounded bg-white/5" />

                  <div className="mt-4 h-5 w-2/3 rounded bg-white/5" />

                  <div className="mt-3 h-4 w-full rounded bg-white/5" />

                  <div className="mt-2 h-4 w-3/4 rounded bg-white/5" />

                  <div className="mt-5 h-9 w-28 rounded-xl bg-white/5" />
                </div>
              )
            )}

          </div>
        ) : filteredTasks.length > 0 ? (

          /* TASK LIST */

          <div className="space-y-4">

            {filteredTasks.map(
              (task, index) => {
                const statusConfig =
                  getStatusConfig(
                    task.status
                  );

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
                      delay:
                        index *
                        0.035,
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
                            {task.priority ||
                              "Medium"}{" "}
                            Priority
                          </span>

                        </div>

                        <h3 className="text-base font-semibold text-white sm:text-lg">
                          {task.title}
                        </h3>

                        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
                          {task.description}
                        </p>

                        {task.instructions && (
                          <div className="mt-3 rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2.5">

                            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                              Instructions
                            </p>

                            <p className="mt-1 text-xs leading-5 text-slate-400">
                              {task.instructions}
                            </p>

                          </div>
                        )}

                        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-500">

                          <div className="flex items-center gap-1.5">

                            <CalendarDays
                              size={14}
                            />

                            <span>
                              {task.dueDate
                                ? `Due ${formatDate(
                                    task.dueDate
                                  )}`
                                : "No due date"}
                            </span>

                          </div>

                          {task.estimatedTime && (
                            <div className="flex items-center gap-1.5">

                              <Clock3
                                size={14}
                              />

                              <span>
                                {
                                  task.estimatedTime
                                }
                              </span>

                            </div>
                          )}

                          {task.questions !==
                            null &&
                            task.questions !==
                              undefined && (
                              <div className="flex items-center gap-1.5">

                                <FileText
                                  size={14}
                                />

                                <span>
                                  {
                                    task.questions
                                  }{" "}
                                  {task.questions ===
                                  1
                                    ? "question"
                                    : "questions"}
                                </span>

                              </div>
                            )}

                          {task.maxScore && (
                            <div className="flex items-center gap-1.5">

                              <GraduationCap
                                size={14}
                              />

                              <span>
                                Max score:{" "}
                                {
                                  task.maxScore
                                }
                              </span>

                            </div>
                          )}

                          {task.attachmentCount >
                            0 && (
                            <div className="flex items-center gap-1.5">

                              <Paperclip
                                size={14}
                              />

                              <span>
                                {
                                  task.attachmentCount
                                }{" "}
                                {task.attachmentCount ===
                                1
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
                            <StatusIcon
                              size={13}
                            />

                            {task.status}
                          </span>

                        </div>

                        {task.score !==
                          null &&
                          task.score !==
                            undefined && (
                            <div className="flex items-center justify-between xl:justify-start">

                              <span className="text-xs text-slate-500">
                                Score
                              </span>

                              <span className="ml-3 text-sm font-bold text-emerald-300">
                                {task.score}
                              </span>

                            </div>
                          )}

                        <button
                          type="button"
                          onClick={() =>
                            openTask(
                              task
                            )
                          }
                          className="mt-1 inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-400 px-4 py-2.5 text-xs font-bold text-slate-950 transition hover:bg-cyan-300"
                        >
                          {task.status ===
                          "Graded"
                            ? "View Result"
                            : task.status ===
                              "Submitted"
                            ? "View Submission"
                            : "Open Task"}

                          <ArrowRight
                            size={15}
                          />
                        </button>

                      </div>

                    </div>

                  </motion.div>
                );
              }
            )}

          </div>

        ) : (

          /* EMPTY STATE */

          <div className="rounded-2xl border border-dashed border-white/10 bg-[#071426] px-6 py-16 text-center">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-300">
              <Search size={24} />
            </div>

            <h3 className="mt-5 text-lg font-semibold text-white">
              {tasks.length === 0
                ? "No tasks assigned yet"
                : "No tasks found"}
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              {tasks.length === 0
                ? "Your tutor has not assigned any tasks to your class yet. New tasks will appear here when they are created."
                : "No tasks match your current search and filter settings. Try changing the filters or search for another task."}
            </p>

            {tasks.length > 0 && (
              <button
                type="button"
                onClick={
                  resetFilters
                }
                className="mt-5 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-xs font-semibold text-slate-300 transition hover:bg-white/[0.06] hover:text-white"
              >
                Reset Filters
              </button>
            )}

          </div>
        )}

        {/* UPCOMING REMINDER */}

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
                <CalendarDays
                  size={19}
                />
              </div>

              <div>

                <p className="text-sm font-semibold text-white">
                  Keep an eye on your deadlines
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Complete open tasks before
                  their due dates to keep your
                  learning schedule on track.
                </p>

              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/academy/student/lessons"
                )
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#020617] px-4 py-2.5 text-xs font-semibold text-slate-300 transition hover:border-cyan-400/20 hover:text-white"
            >
              Continue Learning
              <ArrowRight
                size={14}
              />
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
