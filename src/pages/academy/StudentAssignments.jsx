import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  FileText,
  Loader2,
  Search,
  Upload,
} from "lucide-react";

import { motion } from "framer-motion";
import {
  useNavigate,
  useOutletContext,
} from "react-router-dom";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

const ASSIGNMENTS_ENDPOINT =
  `${API_URL}/api/academy/student/assignments`;

const DEMO_ASSIGNMENTS = [
  {
    id: "assignment-001",
    title: "Quadratic Equations",
    subject: "Mathematics",
    className: "SS 1",
    description:
      "Solve the assigned quadratic equation problems and show all working steps.",
    dueDate: "2026-09-22",
    status: "pending",
    score: null,
    totalMarks: 20,
  },
  {
    id: "assignment-002",
    title: "Comprehension Exercise",
    subject: "English Language",
    className: "SS 1",
    description:
      "Read the provided passage and answer the comprehension questions.",
    dueDate: "2026-09-20",
    status: "submitted",
    score: null,
    totalMarks: 20,
  },
  {
    id: "assignment-003",
    title: "Cell Structure",
    subject: "Biology",
    className: "SS 1",
    description:
      "Explain the functions of the major parts of a typical cell.",
    dueDate: "2026-09-15",
    status: "graded",
    score: 17,
    totalMarks: 20,
  },
];

const getStudentId = (student) => {
  if (!student) return "";

  return (
    student.id ||
    student.studentId ||
    student.student_id ||
    student.enrollmentId ||
    student.enrollment_id ||
    ""
  );
};

const normalizeAssignment = (
  item,
  index
) => ({
  id:
    item?.id ||
    item?.assignmentId ||
    item?.assignment_id ||
    `assignment-${index}`,

  title:
    item?.title ||
    item?.name ||
    item?.assignmentTitle ||
    "Untitled Assignment",

  subject:
    item?.subject ||
    item?.subjectName ||
    item?.subject_name ||
    "General",

  className:
    item?.className ||
    item?.class_name ||
    item?.class ||
    item?.grade ||
    "Student",

  description:
    item?.description ||
    item?.instructions ||
    "Complete this assignment according to the instructions provided by your tutor.",

  dueDate:
    item?.dueDate ||
    item?.due_date ||
    item?.deadline ||
    "",

  status:
    String(
      item?.status ||
      item?.submissionStatus ||
      item?.submission_status ||
      "pending"
    ).toLowerCase(),

  score:
    item?.score ??
    item?.marks ??
    item?.grade ??
    null,

  totalMarks:
    item?.totalMarks ||
    item?.total_marks ||
    item?.maxMarks ||
    100,
});

const formatDate = (date) => {
  if (!date) return "No deadline";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return parsed.toLocaleDateString(
    "en-NG",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );
};

const getStatusLabel = (status) => {
  switch (status) {
    case "submitted":
      return "Submitted";

    case "graded":
      return "Graded";

    case "overdue":
      return "Overdue";

    default:
      return "Pending";
  }
};

export default function StudentAssignments() {
  const navigate = useNavigate();
  const { student } = useOutletContext() || {};

  const [assignments, setAssignments] =
    useState([]);

  const [search, setSearch] =
    useState("");

  const [filter, setFilter] =
    useState("all");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const studentId =
    getStudentId(student);

  const loadAssignments = async () => {
    setLoading(true);
    setError("");

    try {
      const url = new URL(
        ASSIGNMENTS_ENDPOINT
      );

      if (studentId) {
        url.searchParams.set(
          "studentId",
          studentId
        );
      }

      const response = await fetch(
        url.toString()
      );

      if (!response.ok) {
        throw new Error(
          "Unable to load assignments."
        );
      }

      const data =
        await response.json();

      const rawItems =
        Array.isArray(data)
          ? data
          : data.assignments ||
            data.data ||
            data.items ||
            [];

      if (!Array.isArray(rawItems)) {
        throw new Error(
          "Invalid assignment response."
        );
      }

      setAssignments(
        rawItems.map(
          normalizeAssignment
        )
      );
    } catch (err) {
      console.error(
        "STUDENT ASSIGNMENTS ERROR:",
        err
      );

      setAssignments(
        DEMO_ASSIGNMENTS
      );

      setError(
        "Assignments could not be loaded from the server. Showing available sample assignments."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssignments();
  }, [studentId]);

  const filteredAssignments =
    useMemo(() => {
      const query =
        search.trim().toLowerCase();

      return assignments.filter(
        (assignment) => {
          const matchesSearch =
            !query ||
            assignment.title
              .toLowerCase()
              .includes(query) ||
            assignment.subject
              .toLowerCase()
              .includes(query);

          const matchesFilter =
            filter === "all" ||
            assignment.status === filter;

          return (
            matchesSearch &&
            matchesFilter
          );
        }
      );
    }, [
      assignments,
      search,
      filter,
    ]);

  const stats = useMemo(() => {
    return {
      total: assignments.length,

      pending: assignments.filter(
        (item) =>
          item.status === "pending"
      ).length,

      submitted: assignments.filter(
        (item) =>
          item.status === "submitted"
      ).length,

      graded: assignments.filter(
        (item) =>
          item.status === "graded"
      ).length,
    };
  }, [assignments]);

  const openAssignment = (
    assignment
  ) => {
    navigate(
      `/academy/student/assignments/${assignment.id}`,
      {
        state: {
          assignment,
        },
      }
    );
  };

  return (
    <div className="min-h-full bg-[#020617] text-white">
      <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">

        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10">
              <ClipboardCheck
                size={24}
                className="text-cyan-300"
              />
            </div>

            <div>
              <h1 className="text-2xl font-bold sm:text-3xl">
                Assignments
              </h1>

              <p className="mt-1 text-sm text-slate-400">
                View and complete assignments
                from your tutors.
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-3 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-amber-200">
            <AlertCircle
              size={18}
              className="mt-0.5 shrink-0"
            />

            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            {
              label: "Total",
              value: stats.total,
              icon: ClipboardCheck,
            },
            {
              label: "Pending",
              value: stats.pending,
              icon: Clock3,
            },
            {
              label: "Submitted",
              value: stats.submitted,
              icon: Upload,
            },
            {
              label: "Graded",
              value: stats.graded,
              icon: CheckCircle2,
            },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.label}
                className="rounded-2xl border border-white/10 bg-[#071426] p-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">
                    {item.label}
                  </span>

                  <Icon
                    size={18}
                    className="text-cyan-300"
                  />
                </div>

                <div className="mt-2 text-2xl font-bold">
                  {item.value}
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
          <div className="relative">
            <Search
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
            />

            <input
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search assignments..."
              className="w-full rounded-2xl border border-white/10 bg-[#071426] py-3.5 pl-11 pr-4 text-sm text-white outline-none focus:border-cyan-400/40"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto">
            {[
              ["all", "All"],
              ["pending", "Pending"],
              ["submitted", "Submitted"],
              ["graded", "Graded"],
            ].map(
              ([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() =>
                    setFilter(value)
                  }
                  className={`whitespace-nowrap rounded-xl px-4 py-3 text-sm font-medium transition ${
                    filter === value
                      ? "bg-cyan-400 text-slate-950"
                      : "border border-white/10 bg-[#071426] text-slate-300 hover:bg-white/5"
                  }`}
                >
                  {label}
                </button>
              )
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="flex items-center gap-3 text-slate-400">
              <Loader2
                size={22}
                className="animate-spin"
              />
              Loading assignments...
            </div>
          </div>
        ) : filteredAssignments.length ===
          0 ? (
          <div className="rounded-3xl border border-white/10 bg-[#071426] p-12 text-center">
            <FileText
              size={42}
              className="mx-auto text-slate-600"
            />

            <h3 className="mt-4 text-lg font-semibold">
              No assignments found
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              There are no assignments matching
              your current filter.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAssignments.map(
              (assignment, index) => (
                <motion.div
                  key={assignment.id}
                  initial={{
                    opacity: 0,
                    y: 10,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    delay: index * 0.04,
                  }}
                  className="rounded-3xl border border-white/10 bg-[#071426] p-5 transition hover:border-cyan-400/20"
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-300">
                          {assignment.subject}
                        </span>

                        <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-400">
                          {getStatusLabel(
                            assignment.status
                          )}
                        </span>
                      </div>

                      <h2 className="mt-3 text-lg font-semibold">
                        {assignment.title}
                      </h2>

                      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
                        {assignment.description}
                      </p>

                      <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-500">
                        <span>
                          Class:{" "}
                          <strong className="text-slate-300">
                            {assignment.className}
                          </strong>
                        </span>

                        <span className="flex items-center gap-1.5">
                          <CalendarDays size={14} />
                          Due:{" "}
                          <strong className="text-slate-300">
                            {formatDate(
                              assignment.dueDate
                            )}
                          </strong>
                        </span>

                        {assignment.score !==
                          null && (
                          <span>
                            Score:{" "}
                            <strong className="text-cyan-300">
                              {
                                assignment.score
                              }
                              /
                              {
                                assignment.totalMarks
                              }
                            </strong>
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        openAssignment(
                          assignment
                        )
                      }
                      className="shrink-0 rounded-xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
                    >
                      {assignment.status ===
                      "graded"
                        ? "View Result"
                        : assignment.status ===
                          "submitted"
                        ? "View Submission"
                        : "Open Assignment"}
                    </button>
                  </div>
                </motion.div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}
