import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  FileText,
  Upload,
  User,
} from "lucide-react";

import { motion } from "framer-motion";

import {
  useLocation,
  useNavigate,
  useParams,
  useOutletContext,
} from "react-router-dom";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

const ASSIGNMENTS_ENDPOINT =
  `${API_URL}/api/academy/student/assignments`;


// ============================================================
// HELPERS
// ============================================================

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
      month: "long",
      year: "numeric",
    }
  );
};


const getStatusLabel = (status) => {
  switch (
    String(status || "").toLowerCase()
  ) {
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


const getStatusClasses = (status) => {
  switch (
    String(status || "").toLowerCase()
  ) {
    case "submitted":
      return "border-blue-400/20 bg-blue-400/10 text-blue-300";

    case "graded":
      return "border-emerald-400/20 bg-emerald-400/10 text-emerald-300";

    case "overdue":
      return "border-red-400/20 bg-red-400/10 text-red-300";

    default:
      return "border-amber-400/20 bg-amber-400/10 text-amber-300";
  }
};


const normalizeAssignment = (
  item,
  fallbackId
) => {
  if (!item) return null;

  return {
    id:
      item.id ||
      item.assignmentId ||
      item.assignment_id ||
      fallbackId,

    title:
      item.title ||
      item.name ||
      item.assignmentTitle ||
      "Untitled Assignment",

    subject:
      item.subject ||
      item.subjectName ||
      item.subject_name ||
      "General",

    className:
      item.className ||
      item.class_name ||
      item.class ||
      item.grade ||
      "Student",

    description:
      item.description ||
      item.instructions ||
      "Complete this assignment according to the instructions provided by your tutor.",

    instructions:
      item.instructions ||
      item.description ||
      item.task ||
      "",

    dueDate:
      item.dueDate ||
      item.due_date ||
      item.deadline ||
      "",

    status:
      String(
        item.status ||
        item.submissionStatus ||
        item.submission_status ||
        "pending"
      ).toLowerCase(),

    score:
      item.score ??
      item.marks ??
      item.grade ??
      null,

    totalMarks:
      item.totalMarks ||
      item.total_marks ||
      item.maxMarks ||
      100,

    tutorName:
      item.tutorName ||
      item.tutor_name ||
      item.tutor?.name ||
      item.teacherName ||
      item.teacher_name ||
      "Tutor",

    materials:
      item.materials ||
      item.attachments ||
      item.files ||
      [],

    questions:
      item.questions ||
      item.items ||
      [],

    response:
      item.response ||
      item.answer ||
      item.submission ||
      item.studentResponse ||
      "",

    feedback:
      item.feedback ||
      item.tutorFeedback ||
      item.tutor_feedback ||
      "",

    submittedAt:
      item.submittedAt ||
      item.submitted_at ||
      null,
  };
};


// ============================================================
// COMPONENT
// ============================================================

export default function StudentAssignmentDetails() {
  const navigate = useNavigate();

  const location = useLocation();

  const { id } = useParams();

  const { student } =
    useOutletContext() || {};

  const studentId =
    getStudentId(student);

  const stateAssignment =
    location.state?.assignment ||
    null;

  const [assignment, setAssignment] =
    useState(
      stateAssignment
        ? normalizeAssignment(
            stateAssignment,
            id
          )
        : null
    );

  const [loading, setLoading] =
    useState(!stateAssignment);

  const [error, setError] =
    useState("");


  // ==========================================================
  // LOAD ASSIGNMENT
  // ==========================================================

  useEffect(() => {
    if (stateAssignment) {
      setAssignment(
        normalizeAssignment(
          stateAssignment,
          id
        )
      );

      setLoading(false);

      return;
    }

    const loadAssignment = async () => {
      setLoading(true);
      setError("");

      try {
        const url = new URL(
          ASSIGNMENTS_ENDPOINT
        );

        if (id) {
          url.searchParams.set(
            "assignmentId",
            id
          );

          url.searchParams.set(
            "assignment_id",
            id
          );

          url.searchParams.set(
            "id",
            id
          );
        }

        if (studentId) {
          url.searchParams.set(
            "studentId",
            studentId
          );
        }

        const response =
          await fetch(
            url.toString()
          );

        if (!response.ok) {
          throw new Error(
            "Unable to load this assignment."
          );
        }

        const data =
          await response.json();

        let item = null;

        if (
          Array.isArray(data)
        ) {
          item = data.find(
            (entry) =>
              String(
                entry?.id ||
                entry?.assignmentId ||
                entry?.assignment_id
              ) === String(id)
          );
        } else if (
          data?.assignment
        ) {
          item = data.assignment;
        } else if (
          data?.data &&
          !Array.isArray(data.data)
        ) {
          item = data.data;
        } else if (
          Array.isArray(
            data?.assignments
          )
        ) {
          item =
            data.assignments.find(
              (entry) =>
                String(
                  entry?.id ||
                  entry?.assignmentId ||
                  entry?.assignment_id
                ) === String(id)
            );
        }

        if (!item) {
          throw new Error(
            "Assignment could not be found."
          );
        }

        setAssignment(
          normalizeAssignment(
            item,
            id
          )
        );
      } catch (err) {
        console.error(
          "STUDENT ASSIGNMENT DETAILS ERROR:",
          err
        );

        setError(
          err?.message ||
            "Unable to load this assignment."
        );
      } finally {
        setLoading(false);
      }
    };

    loadAssignment();
  }, [
    id,
    studentId,
    stateAssignment,
  ]);


  // ==========================================================
  // MATERIALS
  // ==========================================================

  const materials = useMemo(() => {
    if (
      !assignment?.materials
    ) {
      return [];
    }

    if (
      !Array.isArray(
        assignment.materials
      )
    ) {
      return [];
    }

    return assignment.materials;
  }, [assignment]);


  // ==========================================================
  // BACK
  // ==========================================================

  const goBack = () => {
    navigate(
      "/academy/student/assignments"
    );
  };


  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div className="min-h-full bg-[#020617] text-white">
        <div className="flex min-h-[500px] items-center justify-center">
          <div className="flex items-center gap-3 text-slate-400">
            <Clock3
              size={22}
              className="animate-pulse text-cyan-300"
            />

            Loading assignment...
          </div>
        </div>
      </div>
    );
  }


  // ==========================================================
  // ERROR
  // ==========================================================

  if (error || !assignment) {
    return (
      <div className="min-h-full bg-[#020617] p-4 text-white sm:p-6 lg:p-8">
        <div className="mx-auto max-w-4xl">

          <button
            type="button"
            onClick={goBack}
            className="mb-6 flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
          >
            <ArrowLeft size={18} />

            Back to Assignments
          </button>

          <div className="rounded-3xl border border-red-400/20 bg-red-400/10 p-8 text-center">

            <FileText
              size={42}
              className="mx-auto text-red-300"
            />

            <h1 className="mt-4 text-xl font-semibold">
              Unable to open assignment
            </h1>

            <p className="mt-2 text-sm text-red-200/80">
              {error ||
                "This assignment could not be found."}
            </p>

            <button
              type="button"
              onClick={goBack}
              className="mt-6 rounded-xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
            >
              Back to Assignments
            </button>

          </div>
        </div>
      </div>
    );
  }


  // ==========================================================
  // PAGE
  // ==========================================================

  return (
    <div className="min-h-full bg-[#020617] text-white">
      <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6 lg:p-8">

        {/* BACK */}

        <button
          type="button"
          onClick={goBack}
          className="flex items-center gap-2 text-sm text-slate-400 transition hover:text-cyan-300"
        >
          <ArrowLeft size={18} />

          Back to Assignments
        </button>


        {/* HEADER */}

        <motion.div
          initial={{
            opacity: 0,
            y: 10,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="overflow-hidden rounded-3xl border border-white/10 bg-[#071426]"
        >
          <div className="border-b border-white/10 p-6 sm:p-8">

            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">

              <div>

                <div className="flex flex-wrap items-center gap-2">

                  <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-300">
                    {assignment.subject}
                  </span>

                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-medium ${getStatusClasses(
                      assignment.status
                    )}`}
                  >
                    {getStatusLabel(
                      assignment.status
                    )}
                  </span>

                </div>

                <h1 className="mt-4 text-2xl font-bold sm:text-3xl">
                  {assignment.title}
                </h1>

                <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">
                  {assignment.description}
                </p>

              </div>

              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10">
                <ClipboardCheck
                  size={27}
                  className="text-cyan-300"
                />
              </div>

            </div>


            {/* META */}

            <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

              <div className="rounded-2xl border border-white/10 bg-[#020617]/60 p-4">

                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <CalendarDays size={15} />

                  Due Date
                </div>

                <div className="mt-2 text-sm font-medium text-slate-200">
                  {formatDate(
                    assignment.dueDate
                  )}
                </div>

              </div>


              <div className="rounded-2xl border border-white/10 bg-[#020617]/60 p-4">

                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <User size={15} />

                  Tutor
                </div>

                <div className="mt-2 text-sm font-medium text-slate-200">
                  {assignment.tutorName}
                </div>

              </div>


              <div className="rounded-2xl border border-white/10 bg-[#020617]/60 p-4">

                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <FileText size={15} />

                  Class
                </div>

                <div className="mt-2 text-sm font-medium text-slate-200">
                  {assignment.className}
                </div>

              </div>


              <div className="rounded-2xl border border-white/10 bg-[#020617]/60 p-4">

                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <CheckCircle2 size={15} />

                  Score
                </div>

                <div className="mt-2 text-sm font-medium text-cyan-300">
                  {assignment.score !==
                  null
                    ? `${assignment.score}/${assignment.totalMarks}`
                    : "Not graded"}
                </div>

              </div>

            </div>

          </div>
        </motion.div>


        {/* MAIN */}

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">

          {/* CONTENT */}

          <div className="space-y-6">

            {/* INSTRUCTIONS */}

            <section className="rounded-3xl border border-white/10 bg-[#071426] p-6 sm:p-7">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10">
                  <FileText
                    size={19}
                    className="text-cyan-300"
                  />
                </div>

                <div>
                  <h2 className="font-semibold">
                    Assignment Instructions
                  </h2>

                  <p className="text-xs text-slate-500">
                    Read carefully before completing the assignment.
                  </p>
                </div>

              </div>

              <div className="mt-6 rounded-2xl border border-white/10 bg-[#020617]/50 p-5">

                <p className="whitespace-pre-wrap text-sm leading-7 text-slate-300">
                  {assignment.instructions ||
                    assignment.description ||
                    "No additional instructions were provided."}
                </p>

              </div>

            </section>


            {/* QUESTIONS */}

            {assignment.questions.length >
              0 && (
              <section className="rounded-3xl border border-white/10 bg-[#071426] p-6 sm:p-7">

                <h2 className="font-semibold">
                  Questions
                </h2>

                <div className="mt-5 space-y-4">

                  {assignment.questions.map(
                    (question, index) => (
                      <div
                        key={
                          question?.id ||
                          index
                        }
                        className="rounded-2xl border border-white/10 bg-[#020617]/50 p-5"
                      >

                        <div className="flex gap-4">

                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cyan-400/10 text-sm font-semibold text-cyan-300">
                            {index + 1}
                          </div>

                          <div className="min-w-0">

                            <p className="text-sm leading-7 text-slate-300">
                              {typeof question ===
                              "string"
                                ? question
                                : question?.question ||
                                  question?.text ||
                                  question?.title ||
                                  "Question"}
                            </p>

                          </div>

                        </div>

                      </div>
                    )
                  )}

                </div>

              </section>
            )}


            {/* MATERIALS */}

            {materials.length >
              0 && (
              <section className="rounded-3xl border border-white/10 bg-[#071426] p-6 sm:p-7">

                <div className="flex items-center gap-3">

                  <Upload
                    size={20}
                    className="text-cyan-300"
                  />

                  <h2 className="font-semibold">
                    Assignment Materials
                  </h2>

                </div>

                <div className="mt-5 space-y-3">

                  {materials.map(
                    (material, index) => {

                      const title =
                        typeof material ===
                        "string"
                          ? material
                          : material?.title ||
                            material?.name ||
                            `Material ${index + 1}`;

                      const url =
                        typeof material ===
                        "string"
                          ? material
                          : material?.url ||
                            material?.file_url ||
                            material?.fileUrl ||
                            "";

                      return (
                        <div
                          key={
                            material?.id ||
                            index
                          }
                          className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-[#020617]/50 p-4"
                        >

                          <div className="flex min-w-0 items-center gap-3">

                            <FileText
                              size={18}
                              className="shrink-0 text-cyan-300"
                            />

                            <span className="truncate text-sm text-slate-300">
                              {title}
                            </span>

                          </div>

                          {url && (
                            <a
                              href={url}
                              target="_blank"
                              rel="noreferrer"
                              className="shrink-0 rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-cyan-300 transition hover:bg-cyan-400/10"
                            >
                              Open
                            </a>
                          )}

                        </div>
                      );
                    }
                  )}

                </div>

              </section>
            )}


            {/* SUBMISSION */}

            {assignment.response && (
              <section className="rounded-3xl border border-white/10 bg-[#071426] p-6 sm:p-7">

                <h2 className="font-semibold">
                  Your Submission
                </h2>

                <div className="mt-5 rounded-2xl border border-white/10 bg-[#020617]/50 p-5">

                  <p className="whitespace-pre-wrap text-sm leading-7 text-slate-300">
                    {typeof assignment.response ===
                    "string"
                      ? assignment.response
                      : JSON.stringify(
                          assignment.response,
                          null,
                          2
                        )}
                  </p>

                </div>

                {assignment.submittedAt && (
                  <p className="mt-3 text-xs text-slate-500">
                    Submitted{" "}
                    {formatDate(
                      assignment.submittedAt
                    )}
                  </p>
                )}

              </section>
            )}


            {/* FEEDBACK */}

            {assignment.feedback && (
              <section className="rounded-3xl border border-emerald-400/20 bg-emerald-400/5 p-6 sm:p-7">

                <div className="flex items-center gap-3">

                  <CheckCircle2
                    size={20}
                    className="text-emerald-300"
                  />

                  <h2 className="font-semibold">
                    Tutor Feedback
                  </h2>

                </div>

                <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-300">
                  {assignment.feedback}
                </p>

              </section>
            )}

          </div>


          {/* SIDEBAR */}

          <aside className="space-y-4">

            <div className="rounded-3xl border border-white/10 bg-[#071426] p-6">

              <h3 className="font-semibold">
                Assignment Status
              </h3>

              <div
                className={`mt-4 rounded-2xl border px-4 py-4 text-center text-sm font-semibold ${getStatusClasses(
                  assignment.status
                )}`}
              >
                {getStatusLabel(
                  assignment.status
                )}
              </div>

              {assignment.score !==
                null && (
                <div className="mt-5 rounded-2xl border border-cyan-400/10 bg-cyan-400/5 p-5 text-center">

                  <div className="text-xs text-slate-500">
                    Your Score
                  </div>

                  <div className="mt-2 text-3xl font-bold text-cyan-300">
                    {assignment.score}
                  </div>

                  <div className="text-sm text-slate-500">
                    out of{" "}
                    {assignment.totalMarks}
                  </div>

                </div>
              )}

            </div>


            <div className="rounded-3xl border border-white/10 bg-[#071426] p-6">

              <h3 className="font-semibold">
                Need Help?
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                If you have questions about this
                assignment, contact your tutor
                through the student portal.
              </p>

            </div>


            <button
              type="button"
              onClick={goBack}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#071426] px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white"
            >
              <ArrowLeft size={17} />

              Back to Assignments
            </button>

          </aside>

        </div>

      </div>
    </div>
  );
}
