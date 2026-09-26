import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { motion, AnimatePresence } from "framer-motion";

import {
  AlertCircle,
  Award,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Clock3,
  Download,
  Eye,
  FileText,
  GraduationCap,
  Hash,
  Loader2,
  Mail,
  MessageSquare,
  RefreshCw,
  Search,
  Send,
  User,
  Video,
  Image as ImageIcon,
  X,
} from "lucide-react";

/* =========================================================
   API
========================================================= */

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

const SUBMISSIONS_URL =
  `${API_BASE_URL}/api/academy/tutor/task-submissions`;

/* =========================================================
   BASIC HELPERS
========================================================= */

function clean(value) {
  if (value === undefined || value === null) {
    return "";
  }

  return String(value).trim();
}

function firstValue(...values) {
  for (const value of values) {
    if (
      value !== undefined &&
      value !== null &&
      String(value).trim() !== ""
    ) {
      return value;
    }
  }

  return "";
}

/* =========================================================
   TUTOR STORAGE
========================================================= */

function getStoredTutor() {
  if (typeof window === "undefined") {
    return null;
  }

  const keys = [
    "scholiqen_academy_user",
    "tutorReference",
    "tutor_reference",
    "tutor",
    "academyTutor",
  ];

  for (const key of keys) {
    try {
      const raw = localStorage.getItem(key);

      if (!raw) continue;

      try {
        return JSON.parse(raw);
      } catch {
        return {
          reference: raw,
        };
      }
    } catch {
      continue;
    }
  }

  return null;
}

function getTutorReference(tutor) {
  return clean(
    firstValue(
      tutor?.reference,
      tutor?.tutor_reference,
      tutor?.tutorReference,
      tutor?.reference_id,
      tutor?.referenceId,
      tutor?.applicationReference,
      tutor?.application_reference,
      tutor?.id
    )
  );
}

function getTutorName(tutor) {
  const direct = clean(
    firstValue(
      tutor?.name,
      tutor?.full_name,
      tutor?.fullName,
      tutor?.tutorName
    )
  );

  if (direct) {
    return direct;
  }

  return [
    tutor?.first_name || tutor?.firstName,
    tutor?.middle_name || tutor?.middleName,
    tutor?.last_name || tutor?.lastName,
  ]
    .map(clean)
    .filter(Boolean)
    .join(" ");
}

function getAcademyToken() {
  if (typeof window === "undefined") {
    return "";
  }

  const keys = [
    "scholiqen_academy_token",
    "academy_token",
    "scholiqen_token",
    "access_token",
    "token",
  ];

  for (const key of keys) {
    const value = localStorage.getItem(key);

    if (value && value.trim()) {
      return value.trim();
    }
  }

  return "";
}

function getAuthHeaders(tutorReference = "") {
  const token = getAcademyToken();

  const headers = {
    Accept: "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (tutorReference) {
    headers["x-tutor-reference"] =
      tutorReference;
  }

  return headers;
}

/* =========================================================
   RESPONSE
========================================================= */

async function readResponse(response) {
  const contentType =
    response.headers.get("content-type") || "";

  if (
    contentType.includes("application/json")
  ) {
    return response.json();
  }

  const text = await response.text();

  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return {
      message: text,
    };
  }
}

/* =========================================================
   URL / FILE HELPERS
========================================================= */

function getFileUrl(value) {
  if (!value) {
    return "";
  }

  const raw =
    typeof value === "string"
      ? value
      : value?.url ||
        value?.fileUrl ||
        value?.file_url ||
        value?.downloadUrl ||
        value?.download_url ||
        value?.path ||
        value?.filePath ||
        value?.file_path ||
        "";

  const url = clean(raw);

  if (!url) {
    return "";
  }

  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  if (url.startsWith("/")) {
    return `${API_BASE_URL}${url}`;
  }

  return `${API_BASE_URL}/${url}`;
}

function getAttachmentName(file, index = 0) {
  if (typeof file === "string") {
    return (
      file
        .split("/")
        .pop()
        ?.split("?")[0] ||
      `Attachment ${index + 1}`
    );
  }

  return (
    clean(
      firstValue(
        file?.originalName,
        file?.original_name,
        file?.fileName,
        file?.file_name,
        file?.filename,
        file?.name
      )
    ) ||
    `Attachment ${index + 1}`
  );
}

function getAttachmentUrl(file) {
  return getFileUrl(file);
}

function parseAttachments(value) {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value.filter(Boolean);
  }

  if (typeof value === "object") {
    return Object.values(value);
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);

      if (Array.isArray(parsed)) {
        return parsed;
      }

      if (
        parsed &&
        typeof parsed === "object"
      ) {
        return Object.values(parsed);
      }
    } catch {
      return [];
    }
  }

  return [];
}

function getAttachmentType(file) {
  const type = clean(
    firstValue(
      file?.mimeType,
      file?.mime_type,
      file?.fileType,
      file?.file_type,
      file?.type
    )
  ).toLowerCase();

  const name =
    getAttachmentName(file).toLowerCase();

  if (
    type.startsWith("image/") ||
    /\.(jpg|jpeg|png|webp|gif|svg|avif)$/i.test(
      name
    )
  ) {
    return "image";
  }

  if (
    type.startsWith("video/") ||
    /\.(mp4|webm|mov)$/i.test(name)
  ) {
    return "video";
  }

  if (
    type.includes("pdf") ||
    /\.pdf$/i.test(name)
  ) {
    return "pdf";
  }

  if (
    type.includes("word") ||
    type.includes("officedocument") ||
    /\.(doc|docx)$/i.test(name)
  ) {
    return "document";
  }

  return "file";
}

/* =========================================================
   DATE HELPERS
========================================================= */

function parseDate(value) {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

function formatDate(value) {
  const date = parseDate(value);

  if (!date) {
    return "—";
  }

  return date.toLocaleDateString("en-NG", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatDateTime(value) {
  const date = parseDate(value);

  if (!date) {
    return "—";
  }

  return date.toLocaleString("en-NG", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function isLateSubmission(
  submittedAt,
  dueAt
) {
  const submitted = parseDate(
    submittedAt
  );

  const due = parseDate(dueAt);

  if (!submitted || !due) {
    return false;
  }

  return submitted.getTime() > due.getTime();
}

function isDueOverdueWithoutSubmission(
  submittedAt,
  dueAt
) {
  const submitted = parseDate(
    submittedAt
  );

  const due = parseDate(dueAt);

  if (!due) {
    return false;
  }

  if (submitted) {
    return submitted.getTime() > due.getTime();
  }

  return false;
}

/* =========================================================
   STATUS HELPERS
========================================================= */

function getRawStatus(submission) {
  return clean(
    firstValue(
      submission?.status,
      submission?.submissionStatus,
      submission?.submission_status
    )
  ).toLowerCase();
}

function isGraded(submission) {
  const status = getRawStatus(
    submission
  );

  return (
    status === "reviewed" ||
    status === "graded" ||
    status === "completed"
  );
}

function getStatusLabel(submission) {
  if (isGraded(submission)) {
    return "Graded";
  }

  const status =
    getRawStatus(submission);

  if (status === "returned") {
    return "Returned";
  }

  return "Awaiting review";
}

function getStatusClass(submission) {
  if (isGraded(submission)) {
    return "border-emerald-400/20 bg-emerald-400/10 text-emerald-300";
  }

  const status =
    getRawStatus(submission);

  if (status === "returned") {
    return "border-amber-400/20 bg-amber-400/10 text-amber-300";
  }

  return "border-cyan-400/20 bg-cyan-400/10 text-cyan-300";
}

/* =========================================================
   NORMALIZE TASK
========================================================= */

function normalizeTask(task) {
  if (!task || typeof task !== "object") {
    return null;
  }

  return {
    ...task,

    id: firstValue(
      task?.id,
      task?.task_id,
      task?.taskId,
      task?.reference,
      task?.task_reference,
      task?.taskReference,
      task?.assignment_id,
      task?.assignmentId
    ),

    title:
      clean(
        firstValue(
          task?.title,
          task?.task_title,
          task?.taskTitle,
          task?.assignment_title,
          task?.assignmentTitle,
          task?.name
        )
      ) || "Task",

    description: clean(
      firstValue(
        task?.description,
        task?.task_description,
        task?.taskDescription
      )
    ),

    instructions: clean(
      firstValue(
        task?.instructions,
        task?.task_instructions,
        task?.taskInstructions
      )
    ),

    subject: clean(
      firstValue(
        task?.subject,
        task?.subject_name,
        task?.subjectName,
        task?.taskSubject,
        task?.task_subject
      )
    ),

    grade: clean(
      firstValue(
        task?.grade,
        task?.class,
        task?.class_name,
        task?.className,
        task?.taskGrade,
        task?.task_grade
      )
    ),

    dueAt: firstValue(
      task?.dueAt,
      task?.due_at,
      task?.taskDueAt,
      task?.task_due_at,
      task?.deadline,
      task?.dueDate,
      task?.due_date,
      task?.taskDeadline,
      task?.task_deadline
    ),

    maxScore:
      Number(
        firstValue(
          task?.maxScore,
          task?.max_score,
          task?.taskMaxScore,
          task?.task_max_score,
          100
        )
      ) || 100,

    attachments: parseAttachments(
      firstValue(
        task?.attachments,
        task?.task_attachments,
        task?.taskAttachments,
        task?.task_files,
        task?.taskFiles
      )
    ),
  };
}

/* =========================================================
   NORMALIZE SUBMISSION
========================================================= */

function normalizeSubmission(
  submission
) {
  if (
    !submission ||
    typeof submission !== "object"
  ) {
    return null;
  }

  const nestedTask =
    submission?.task ||
    submission?.assignment ||
    submission?.activity ||
    null;

  const task = normalizeTask(
    nestedTask
  );

  const normalized = {
    ...submission,

    id: firstValue(
      submission?.id,
      submission?.submission_id,
      submission?.submissionId
    ),

    submissionId: firstValue(
      submission?.submissionId,
      submission?.submission_id,
      submission?.id
    ),

    taskId: firstValue(
      submission?.taskId,
      submission?.task_id,
      submission?.task_reference,
      submission?.taskReference,
      submission?.activityId,
      submission?.activity_id,
      submission?.assignmentId,
      submission?.assignment_id,
      task?.id
    ),

    studentId: firstValue(
      submission?.studentId,
      submission?.student_id
    ),

    studentName:
      clean(
        firstValue(
          submission?.studentName,
          submission?.student_name,
          submission?.studentFullName,
          submission?.student_full_name
        )
      ) || "Student",

    studentEmail: clean(
      firstValue(
        submission?.studentEmail,
        submission?.student_email,
        submission?.email
      )
    ),

    taskTitle:
      clean(
        firstValue(
          submission?.taskTitle,
          submission?.task_title,
          submission?.assignmentTitle,
          submission?.assignment_title,
          submission?.title,
          task?.title
        )
      ) || "Task",

    taskDescription: clean(
      firstValue(
        submission?.taskDescription,
        submission?.task_description,
        submission?.description,
        task?.description
      )
    ),

    taskInstructions: clean(
      firstValue(
        submission?.taskInstructions,
        submission?.task_instructions,
        submission?.instructions,
        task?.instructions
      )
    ),

    subject:
      clean(
        firstValue(
          submission?.subject,
          submission?.taskSubject,
          submission?.task_subject,
          submission?.subject_name,
          submission?.subjectName,
          task?.subject
        )
      ) || "Subject",

    grade:
      clean(
        firstValue(
          submission?.grade,
          submission?.taskGrade,
          submission?.task_grade,
          submission?.class,
          submission?.class_name,
          submission?.className,
          task?.grade
        )
      ) || "Class",

    dueAt: firstValue(
      submission?.dueAt,
      submission?.due_at,
      submission?.taskDueAt,
      submission?.task_due_at,
      submission?.deadline,
      submission?.dueDate,
      submission?.due_date,
      submission?.taskDeadline,
      submission?.task_deadline,
      task?.dueAt
    ),

    maxScore:
      Number(
        firstValue(
          submission?.maxScore,
          submission?.max_score,
          submission?.taskMaxScore,
          submission?.task_max_score,
          task?.maxScore,
          100
        )
      ) || 100,

    responseText: clean(
      firstValue(
        submission?.responseText,
        submission?.response_text,
        submission?.answer,
        submission?.answer_text,
        submission?.studentResponse,
        submission?.student_response
      )
    ),

    attachments: parseAttachments(
      firstValue(
        submission?.attachments,
        submission?.submissionAttachments,
        submission?.submission_attachments,
        submission?.studentAttachments,
        submission?.student_attachments
      )
    ),

    taskAttachments: parseAttachments(
      firstValue(
        submission?.taskAttachments,
        submission?.task_attachments,
        submission?.taskFiles,
        submission?.task_files,
        task?.attachments
      )
    ),

    status:
      clean(
        firstValue(
          submission?.status,
          submission?.submissionStatus,
          submission?.submission_status
        )
      ) || "submitted",

    score:
      submission?.score !== null &&
      submission?.score !== undefined &&
      submission?.score !== ""
        ? Number(submission.score)
        : null,

    feedback: clean(
      firstValue(
        submission?.feedback,
        submission?.tutorFeedback,
        submission?.tutor_feedback,
        submission?.review_feedback
      )
    ),

    submittedAt: firstValue(
      submission?.submittedAt,
      submission?.submitted_at,
      submission?.submissionDate,
      submission?.submission_date,
      submission?.createdAt,
      submission?.created_at
    ),

    reviewedAt: firstValue(
      submission?.reviewedAt,
      submission?.reviewed_at
    ),

    reviewedBy: clean(
      firstValue(
        submission?.reviewedBy,
        submission?.reviewed_by
      )
    ),

    explicitOverdue:
      submission?.overdue ??
      submission?.isOverdue ??
      submission?.is_overdue ??
      submission?.late ??
      submission?.isLate ??
      null,
  };

  return {
    ...normalized,

    isLate:
      normalized.explicitOverdue !==
      null
        ? Boolean(
            normalized.explicitOverdue
          )
        : isLateSubmission(
            normalized.submittedAt,
            normalized.dueAt
          ),
  };
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function TutorTaskSubmissions() {
  const [tutor, setTutor] =
    useState(null);

  const [
    submissions,
    setSubmissions,
  ] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [
    statusFilter,
    setStatusFilter,
  ] = useState("all");

  const [
    selectedSubmission,
    setSelectedSubmission,
  ] = useState(null);

  const [reviewScore, setReviewScore] =
    useState("");

  const [
    reviewFeedback,
    setReviewFeedback,
  ] = useState("");

  const [reviewing, setReviewing] =
    useState(false);

  const [reviewError, setReviewError] =
    useState("");

  const [
    reviewSuccess,
    setReviewSuccess,
  ] = useState("");

  /* =======================================================
     LOAD TUTOR
  ======================================================= */

  useEffect(() => {
    const storedTutor =
      getStoredTutor();

    if (!storedTutor) {
      setError(
        "Tutor information was not found. Please log in again."
      );

      setLoading(false);
      return;
    }

    setTutor(storedTutor);
  }, []);

  /* =======================================================
     FETCH SUBMISSIONS
  ======================================================= */

  const fetchSubmissions =
    useCallback(
      async (showLoader = true) => {
        try {
          if (showLoader) {
            setLoading(true);
          } else {
            setRefreshing(true);
          }

          setError("");

          const tutorReference =
            getTutorReference(tutor);

          if (!tutorReference) {
            throw new Error(
              "Tutor reference was not found. Please log in again."
            );
          }

          const url = new URL(
            SUBMISSIONS_URL
          );

          url.searchParams.set(
            "tutorReference",
            tutorReference
          );

          url.searchParams.set(
            "tutor_reference",
            tutorReference
          );

          url.searchParams.set(
            "reference",
            tutorReference
          );

          const response =
            await fetch(
              url.toString(),
              {
                method: "GET",
                headers:
                  getAuthHeaders(
                    tutorReference
                  ),
                credentials:
                  "include",
              }
            );

          const data =
            await readResponse(
              response
            );

          if (!response.ok) {
            throw new Error(
              data?.message ||
                data?.error ||
                `Unable to load submissions (${response.status}).`
            );
          }

          const rows = Array.isArray(
            data
          )
            ? data
            : data?.submissions ||
              data?.rows ||
              data?.data ||
              data?.results ||
              [];

          const normalizedRows =
            rows
              .filter(
                (item) =>
                  item &&
                  typeof item ===
                    "object"
              )
              .map(
                normalizeSubmission
              )
              .filter(Boolean);

          setSubmissions(
            normalizedRows
          );
        } catch (err) {
          console.error(
            "Tutor task submissions error:",
            err
          );

          setError(
            err?.message ||
              "Unable to load task submissions."
          );

          setSubmissions([]);
        } finally {
          setLoading(false);
          setRefreshing(false);
        }
      },
      [tutor]
    );

  useEffect(() => {
    if (tutor) {
      fetchSubmissions(true);
    }
  }, [
    tutor,
    fetchSubmissions,
  ]);

  /* =======================================================
     COUNTS
  ======================================================= */

  const counts = useMemo(() => {
    const graded =
      submissions.filter(
        isGraded
      ).length;

    const awaiting =
      submissions.filter(
        (item) =>
          !isGraded(item)
      ).length;

    const overdue =
      submissions.filter(
        (item) => item.isLate
      ).length;

    return {
      total: submissions.length,
      awaiting,
      graded,
      overdue,
    };
  }, [submissions]);

  /* =======================================================
     FILTER
  ======================================================= */

  const filteredSubmissions =
    useMemo(() => {
      const query =
        clean(search).toLowerCase();

      return submissions.filter(
        (submission) => {
          if (
            statusFilter ===
            "awaiting" &&
            isGraded(submission)
          ) {
            return false;
          }

          if (
            statusFilter ===
            "graded" &&
            !isGraded(submission)
          ) {
            return false;
          }

          if (
            statusFilter ===
            "overdue" &&
            !submission.isLate
          ) {
            return false;
          }

          if (!query) {
            return true;
          }

          const searchable = [
            submission.studentName,
            submission.studentEmail,
            submission.taskTitle,
            submission.subject,
            submission.grade,
            submission.responseText,
            submission.taskDescription,
            submission.taskInstructions,
          ]
            .map(clean)
            .join(" ")
            .toLowerCase();

          return searchable.includes(
            query
          );
        }
      );
    }, [
      submissions,
      search,
      statusFilter,
    ]);

  /* =======================================================
     OPEN SUBMISSION
  ======================================================= */

  const openSubmission = (
    submission
  ) => {
    const normalized =
      normalizeSubmission(
        submission
      );

    setSelectedSubmission(
      normalized
    );

    setReviewScore(
      normalized?.score ===
        null ||
      normalized?.score ===
        undefined
        ? ""
        : String(
            normalized.score
          )
    );

    setReviewFeedback(
      normalized?.feedback || ""
    );

    setReviewError("");
    setReviewSuccess("");
  };

  const closeSubmission = () => {
    if (reviewing) {
      return;
    }

    setSelectedSubmission(
      null
    );

    setReviewScore("");
    setReviewFeedback("");
    setReviewError("");
    setReviewSuccess("");
  };

  /* =======================================================
     REVIEW / GRADE
  ======================================================= */

  const reviewSubmission =
    async () => {
      if (!selectedSubmission) {
        return;
      }

      setReviewError("");
      setReviewSuccess("");

      const tutorReference =
        getTutorReference(tutor);

      if (!tutorReference) {
        setReviewError(
          "Tutor reference was not found. Please log in again."
        );

        return;
      }

      const rawScore =
        clean(reviewScore);

      if (!rawScore) {
        setReviewError(
          "Enter a score before saving the review."
        );

        return;
      }

      const score =
        Number(rawScore);

      if (!Number.isFinite(score)) {
        setReviewError(
          "Score must be a valid number."
        );

        return;
      }

      const maxScore =
        Number(
          selectedSubmission.maxScore ||
            100
        ) || 100;

      if (score < 0) {
        setReviewError(
          "Score cannot be below 0."
        );

        return;
      }

      if (score > maxScore) {
        setReviewError(
          `Score cannot be greater than ${maxScore}.`
        );

        return;
      }

      const submissionId =
        selectedSubmission.id ||
        selectedSubmission.submissionId;

      if (!submissionId) {
        setReviewError(
          "This submission does not have a valid submission ID."
        );

        return;
      }

      try {
        setReviewing(true);

        const response =
          await fetch(
            `${SUBMISSIONS_URL}/${encodeURIComponent(
              submissionId
            )}/review`,
            {
              method: "PATCH",

              headers: {
                ...getAuthHeaders(
                  tutorReference
                ),
                "Content-Type":
                  "application/json",
              },

              credentials:
                "include",

              body: JSON.stringify({
                score,
                maxScore,

                feedback:
                  reviewFeedback.trim(),

                status:
                  "reviewed",

                tutorReference,

                tutor_reference:
                  tutorReference,

                reference:
                  tutorReference,
              }),
            }
          );

        const data =
          await readResponse(
            response
          );

        if (!response.ok) {
          throw new Error(
            data?.message ||
              data?.error ||
              `Unable to review submission (${response.status}).`
          );
        }

        const returned =
          data?.submission ||
          data?.data?.submission ||
          data?.data ||
          data;

        const reviewed =
          returned &&
          typeof returned ===
            "object"
            ? normalizeSubmission(
                returned
              )
            : null;

        const reviewedAt =
          reviewed?.reviewedAt ||
          new Date().toISOString();

        setSubmissions(
          (current) =>
            current.map(
              (item) => {
                const itemId =
                  item.id ||
                  item.submissionId;

                if (
                  String(itemId) !==
                  String(
                    submissionId
                  )
                ) {
                  return item;
                }

                return {
                  ...item,
                  ...(reviewed ||
                    {}),

                  id:
                    item.id ||
                    reviewed?.id ||
                    submissionId,

                  submissionId:
                    item.submissionId ||
                    reviewed?.submissionId ||
                    submissionId,

                  score,
                  maxScore,

                  feedback:
                    reviewFeedback.trim(),

                  status:
                    "reviewed",

                  reviewedAt,

                  reviewed_at:
                    reviewedAt,
                };
              }
            )
        );

        setSelectedSubmission(
          (current) => {
            if (!current) {
              return current;
            }

            return {
              ...current,
              ...(reviewed ||
                {}),

              id:
                current.id ||
                reviewed?.id ||
                submissionId,

              submissionId:
                current.submissionId ||
                reviewed?.submissionId ||
                submissionId,

              score,
              maxScore,

              feedback:
                reviewFeedback.trim(),

              status:
                "reviewed",

              reviewedAt,

              reviewed_at:
                reviewedAt,
            };
          }
        );

        setReviewSuccess(
          "Submission graded successfully."
        );
      } catch (err) {
        console.error(
          "Review submission error:",
          err
        );

        setReviewError(
          err?.message ||
            "Unable to grade this submission."
        );
      } finally {
        setReviewing(false);
      }
    };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100">
      <div className="mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">

        {/* HEADER */}

        <div className="mb-7 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-cyan-400">
              <ClipboardList
                size={19}
              />

              <span className="text-xs font-semibold uppercase tracking-[0.2em]">
                Academy
              </span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Task Submissions
            </h1>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
              Receive the task together with
              the student's actual submission,
              then grade it and send feedback.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              fetchSubmissions(false)
            }
            disabled={refreshing}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 text-sm font-semibold text-slate-200 transition hover:border-cyan-500/40 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              size={17}
              className={
                refreshing
                  ? "animate-spin"
                  : ""
              }
            />

            Refresh
          </button>
        </div>

        {/* TUTOR */}

        {tutor && (
          <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-slate-800 bg-[#071426] p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
                <GraduationCap
                  size={21}
                />
              </div>

              <div>
                <p className="text-sm font-semibold text-white">
                  {getTutorName(
                    tutor
                  ) || "Tutor"}
                </p>

                <p className="text-xs text-slate-500">
                  Reference:{" "}
                  {getTutorReference(
                    tutor
                  ) || "—"}
                </p>
              </div>
            </div>

            <div className="text-xs text-slate-500">
              {counts.total}{" "}
              {counts.total === 1
                ? "submission"
                : "submissions"}
            </div>
          </div>
        )}

        {/* ERROR */}

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-4">
            <AlertCircle
              size={19}
              className="mt-0.5 shrink-0 text-red-400"
            />

            <div className="flex-1">
              <p className="text-sm font-semibold text-red-300">
                Unable to load submissions
              </p>

              <p className="mt-1 text-sm text-red-200/70">
                {error}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                fetchSubmissions(
                  true
                )
              }
              className="rounded-lg border border-red-400/20 px-3 py-2 text-xs font-semibold text-red-300 hover:bg-red-400/10"
            >
              Retry
            </button>
          </div>
        )}

        {/* STATS */}

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon={
              <ClipboardList
                size={19}
              />
            }
            label="Total submissions"
            value={counts.total}
          />

          <StatCard
            icon={
              <Clock3 size={19} />
            }
            label="Awaiting review"
            value={counts.awaiting}
          />

          <StatCard
            icon={
              <CheckCircle2
                size={19}
              />
            }
            label="Graded"
            value={counts.graded}
          />

          <StatCard
            icon={
              <AlertCircle
                size={19}
              />
            }
            label="Overdue / Late"
            value={counts.overdue}
          />
        </div>

        {/* FILTERS */}

        <div className="mb-5 rounded-2xl border border-slate-800 bg-[#071426] p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search
                size={17}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
              />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Search student, task, subject or class..."
                className="h-11 w-full rounded-xl border border-slate-700 bg-[#020617] pl-10 pr-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-500/50"
              />
            </div>

            <div className="flex gap-2 overflow-x-auto">
              {[
                ["all", "All"],
                [
                  "awaiting",
                  "Awaiting review",
                ],
                ["graded", "Graded"],
                ["overdue", "Overdue"],
              ].map(
                ([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() =>
                      setStatusFilter(
                        value
                      )
                    }
                    className={`whitespace-nowrap rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
                      statusFilter ===
                      value
                        ? "border-cyan-400/30 bg-cyan-400/10 text-cyan-300"
                        : "border-slate-700 bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                    }`}
                  >
                    {label}
                  </button>
                )
              )}
            </div>
          </div>
        </div>

        {/* LIST */}

        {loading ? (
          <div className="flex min-h-[400px] items-center justify-center rounded-2xl border border-slate-800 bg-[#071426]">
            <div className="text-center">
              <Loader2
                size={30}
                className="mx-auto animate-spin text-cyan-400"
              />

              <p className="mt-3 text-sm text-slate-400">
                Loading task submissions...
              </p>
            </div>
          </div>
        ) : filteredSubmissions.length ===
          0 ? (
          <EmptyState
            hasFilters={
              Boolean(
                search.trim()
              ) ||
              statusFilter !==
                "all"
            }
            onClear={() => {
              setSearch("");
              setStatusFilter(
                "all"
              );
            }}
          />
        ) : (
          <div className="space-y-3">
            {filteredSubmissions.map(
              (
                submission,
                index
              ) => (
                <SubmissionCard
                  key={
                    submission.id ||
                    submission.submissionId ||
                    `${submission.studentId || "student"}-${index}`
                  }
                  submission={
                    submission
                  }
                  onOpen={() =>
                    openSubmission(
                      submission
                    )
                  }
                />
              )
            )}
          </div>
        )}
      </div>

      {/* MODAL */}

      <AnimatePresence>
        {selectedSubmission && (
          <ReviewModal
            submission={
              selectedSubmission
            }
            score={reviewScore}
            feedback={
              reviewFeedback
            }
            setScore={
              setReviewScore
            }
            setFeedback={
              setReviewFeedback
            }
            reviewing={
              reviewing
            }
            error={
              reviewError
            }
            success={
              reviewSuccess
            }
            onReview={
              reviewSubmission
            }
            onClose={
              closeSubmission
            }
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  icon,
  label,
  value,
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-[#071426] p-5">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
        {icon}
      </div>

      <p className="text-sm text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-2xl font-bold text-white">
        {value}
      </p>
    </div>
  );
}

/* =========================================================
   SUBMISSION CARD
========================================================= */

function SubmissionCard({
  submission,
  onOpen,
}) {
  const studentName =
    submission.studentName ||
    "Student";

  const taskTitle =
    submission.taskTitle ||
    "Task";

  const subject =
    submission.subject ||
    "Subject";

  const grade =
    submission.grade ||
    "Class";

  const score =
    submission.score !== null &&
    submission.score !==
      undefined
      ? submission.score
      : null;

  const maxScore =
    submission.maxScore ||
    100;

  return (
    <motion.button
      type="button"
      initial={{
        opacity: 0,
        y: 8,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.2,
      }}
      onClick={onOpen}
      className="group w-full rounded-2xl border border-slate-800 bg-[#071426] p-4 text-left transition hover:border-cyan-500/30 hover:bg-[#0a192d] sm:p-5"
    >
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center">

        <div className="flex min-w-0 flex-1 items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-cyan-300">
            <User size={19} />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="truncate text-sm font-semibold text-white">
                {studentName}
              </h3>

              <span
                className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${getStatusClass(
                  submission
                )}`}
              >
                {getStatusLabel(
                  submission
                )}
              </span>

              {submission.isLate && (
                <span className="rounded-full border border-red-400/20 bg-red-400/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-red-300">
                  Late
                </span>
              )}
            </div>

            <p className="mt-1 truncate text-sm font-medium text-slate-300">
              {taskTitle}
            </p>

            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <BookOpen
                  size={13}
                />
                {subject}
              </span>

              <span className="inline-flex items-center gap-1.5">
                <GraduationCap
                  size={13}
                />
                {grade}
              </span>

              <span className="inline-flex items-center gap-1.5">
                <CalendarDays
                  size={13}
                />
                Submitted{" "}
                {formatDate(
                  submission.submittedAt
                )}
              </span>

              {submission.dueAt && (
                <span className="inline-flex items-center gap-1.5">
                  <Clock3
                    size={13}
                  />
                  Due{" "}
                  {formatDate(
                    submission.dueAt
                  )}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-5 border-t border-slate-800 pt-4 xl:min-w-[230px] xl:border-l xl:border-t-0 xl:pl-5 xl:pt-0">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">
              Score
            </p>

            <p className="mt-1 text-lg font-bold text-white">
              {score === null
                ? "Not graded"
                : `${score}/${maxScore}`}
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-cyan-300">
            <Eye size={16} />
            Open
          </div>
        </div>
      </div>
    </motion.button>
  );
}

/* =========================================================
   EMPTY
========================================================= */

function EmptyState({
  hasFilters,
  onClear,
}) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800 bg-[#071426] px-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-slate-500">
        <ClipboardList
          size={25}
        />
      </div>

      <h3 className="mt-4 text-base font-semibold text-white">
        {hasFilters
          ? "No matching submissions"
          : "No task submissions yet"}
      </h3>

      <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
        {hasFilters
          ? "Try changing the search or status filter."
          : "Student submissions will appear here when students submit their tasks."}
      </p>

      {hasFilters && (
        <button
          type="button"
          onClick={onClear}
          className="mt-5 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm font-semibold text-slate-300 hover:bg-slate-800"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}

/* =========================================================
   REVIEW MODAL
========================================================= */

function ReviewModal({
  submission,
  score,
  feedback,
  setScore,
  setFeedback,
  reviewing,
  error,
  success,
  onReview,
  onClose,
}) {
  const taskAttachments =
    submission.taskAttachments ||
    [];

  const submittedAttachments =
    submission.attachments || [];

  const maxScore =
    Number(
      submission.maxScore || 100
    ) || 100;

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-3 backdrop-blur-sm sm:p-5"
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
      }}
      exit={{
        opacity: 0,
      }}
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}
    >
      <motion.div
        initial={{
          opacity: 0,
          y: 20,
          scale: 0.98,
        }}
        animate={{
          opacity: 1,
          y: 0,
          scale: 1,
        }}
        exit={{
          opacity: 0,
          y: 20,
          scale: 0.98,
        }}
        className="flex max-h-[94vh] w-full max-w-7xl flex-col overflow-hidden rounded-2xl border border-slate-700 bg-[#071426] shadow-2xl"
      >

        {/* HEADER */}

        <div className="flex items-start justify-between gap-4 border-b border-slate-800 px-4 py-4 sm:px-6">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-lg bg-cyan-400/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-cyan-300">
                Task submission
              </span>

              <span
                className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${getStatusClass(
                  submission
                )}`}
              >
                {getStatusLabel(
                  submission
                )}
              </span>

              {submission.isLate && (
                <span className="rounded-full border border-red-400/20 bg-red-400/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-red-300">
                  Late submission
                </span>
              )}
            </div>

            <h2 className="mt-2 truncate text-lg font-bold text-white sm:text-xl">
              {submission.taskTitle}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Submitted by{" "}
              <span className="text-slate-300">
                {submission.studentName}
              </span>
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={reviewing}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        {/* BODY */}

        <div className="flex-1 overflow-y-auto">
          <div className="grid xl:grid-cols-[1fr_390px]">

            {/* LEFT */}

            <div className="space-y-6 p-4 sm:p-6">

              {/* =================================================
                  TASK RECEIVED
              ================================================= */}

              <section>
                <div className="mb-3 flex items-center gap-2">
                  <ClipboardList
                    size={18}
                    className="text-cyan-400"
                  />

                  <h3 className="text-sm font-semibold text-white">
                    Task received
                  </h3>
                </div>

                <div className="rounded-2xl border border-cyan-500/10 bg-[#020617] p-5">

                  <div className="flex flex-wrap gap-2">
                    <InfoBadge
                      icon={
                        <BookOpen
                          size={13}
                        />
                      }
                      text={
                        submission.subject ||
                        "Subject"
                      }
                    />

                    <InfoBadge
                      icon={
                        <GraduationCap
                          size={13}
                        />
                      }
                      text={
                        submission.grade ||
                        "Class"
                      }
                    />

                    <InfoBadge
                      icon={
                        <Award
                          size={13}
                        />
                      }
                      text={`Max score: ${maxScore}`}
                    />

                    {submission.taskId && (
                      <InfoBadge
                        icon={
                          <Hash
                            size={13}
                          />
                        }
                        text={`Task ${submission.taskId}`}
                      />
                    )}
                  </div>

                  <div className="mt-5">
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-cyan-400/70">
                      Task title
                    </p>

                    <h4 className="mt-1 text-xl font-bold text-white">
                      {submission.taskTitle}
                    </h4>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <TaskMeta
                      icon={
                        <CalendarDays
                          size={15}
                        />
                      }
                      label="Due date"
                      value={
                        submission.dueAt
                          ? formatDateTime(
                              submission.dueAt
                            )
                          : "Not specified"
                      }
                    />

                    <TaskMeta
                      icon={
                        <Clock3
                          size={15}
                        />
                      }
                      label="Submitted"
                      value={
                        submission.submittedAt
                          ? formatDateTime(
                              submission.submittedAt
                            )
                          : "Not available"
                      }
                    />
                  </div>

                  {submission.isLate && (
                    <div className="mt-4 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-3">
                      <AlertCircle
                        size={17}
                        className="mt-0.5 shrink-0 text-red-400"
                      />

                      <div>
                        <p className="text-xs font-semibold text-red-300">
                          This submission was late
                        </p>

                        <p className="mt-1 text-xs leading-5 text-red-200/60">
                          The student's submission time
                          was after the task due date.
                        </p>
                      </div>
                    </div>
                  )}

                  {submission.taskDescription && (
                    <div className="mt-5">
                      <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                        Description
                      </p>

                      <p className="whitespace-pre-wrap text-sm leading-7 text-slate-300">
                        {
                          submission.taskDescription
                        }
                      </p>
                    </div>
                  )}

                  {submission.taskInstructions && (
                    <div className="mt-5 border-t border-slate-800 pt-5">
                      <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                        Instructions
                      </p>

                      <p className="whitespace-pre-wrap text-sm leading-7 text-slate-300">
                        {
                          submission.taskInstructions
                        }
                      </p>
                    </div>
                  )}
                </div>
              </section>

              {/* =================================================
                  TASK MATERIALS
              ================================================= */}

              <section>
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText
                      size={18}
                      className="text-violet-400"
                    />

                    <h3 className="text-sm font-semibold text-white">
                      Task materials
                    </h3>
                  </div>

                  <span className="text-xs text-slate-600">
                    {taskAttachments.length}{" "}
                    {taskAttachments.length ===
                    1
                      ? "file"
                      : "files"}
                  </span>
                </div>

                {taskAttachments.length ===
                0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-800 bg-[#020617] p-5 text-center">
                    <FileText
                      size={25}
                      className="mx-auto text-slate-700"
                    />

                    <p className="mt-2 text-xs text-slate-600">
                      No task attachment was provided.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {taskAttachments.map(
                      (
                        file,
                        index
                      ) => (
                        <AttachmentCard
                          key={`task-${index}-${getAttachmentName(
                            file,
                            index
                          )}`}
                          file={file}
                          index={
                            index
                          }
                        />
                      )
                    )}
                  </div>
                )}
              </section>

              {/* =================================================
                  STUDENT
              ================================================= */}

              <section>
                <div className="mb-3 flex items-center gap-2">
                  <User
                    size={18}
                    className="text-cyan-400"
                  />

                  <h3 className="text-sm font-semibold text-white">
                    Student
                  </h3>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-[#020617] p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
                      <User
                        size={19}
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-white">
                        {
                          submission.studentName
                        }
                      </p>

                      {submission.studentEmail && (
                        <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                          <Mail
                            size={12}
                          />

                          {
                            submission.studentEmail
                          }
                        </p>
                      )}

                      <div className="mt-3 flex flex-wrap gap-2">
                        <InfoBadge
                          icon={
                            <BookOpen
                              size={13}
                            />
                          }
                          text={
                            submission.subject
                          }
                        />

                        <InfoBadge
                          icon={
                            <GraduationCap
                              size={13}
                            />
                          }
                          text={
                            submission.grade
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* =================================================
                  STUDENT RESPONSE
              ================================================= */}

              <section>
                <div className="mb-3 flex items-center gap-2">
                  <MessageSquare
                    size={18}
                    className="text-cyan-400"
                  />

                  <h3 className="text-sm font-semibold text-white">
                    Student submission
                  </h3>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-[#020617] p-5">

                  <div>
                    <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                      Written response
                    </p>

                    {submission.responseText ? (
                      <p className="whitespace-pre-wrap text-sm leading-7 text-slate-300">
                        {
                          submission.responseText
                        }
                      </p>
                    ) : (
                      <div className="flex min-h-[120px] items-center justify-center rounded-xl border border-dashed border-slate-800 text-center">
                        <div>
                          <MessageSquare
                            size={27}
                            className="mx-auto text-slate-700"
                          />

                          <p className="mt-2 text-sm text-slate-600">
                            No written response was submitted.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </section>

              {/* =================================================
                  STUDENT FILES
              ================================================= */}

              <section>
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText
                      size={18}
                      className="text-cyan-400"
                    />

                    <h3 className="text-sm font-semibold text-white">
                      Student submitted files
                    </h3>
                  </div>

                  <span className="text-xs text-slate-600">
                    {
                      submittedAttachments.length
                    }{" "}
                    {submittedAttachments.length ===
                    1
                      ? "file"
                      : "files"}
                  </span>
                </div>

                {submittedAttachments.length ===
                0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-800 bg-[#020617] p-6 text-center">
                    <FileText
                      size={28}
                      className="mx-auto text-slate-700"
                    />

                    <p className="mt-3 text-sm text-slate-600">
                      The student did not submit any files.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {submittedAttachments.map(
                      (
                        file,
                        index
                      ) => (
                        <AttachmentCard
                          key={`student-${index}-${getAttachmentName(
                            file,
                            index
                          )}`}
                          file={file}
                          index={
                            index
                          }
                        />
                      )
                    )}
                  </div>
                )}
              </section>
            </div>

            {/* =================================================
                GRADING SIDEBAR
            ================================================= */}

            <aside className="border-t border-slate-800 bg-[#061121] p-4 sm:p-6 xl:border-l xl:border-t-0">
              <div className="xl:sticky xl:top-0">

                <div className="mb-5">
                  <div className="mb-2 flex items-center gap-2">
                    <Award
                      size={18}
                      className="text-cyan-400"
                    />

                    <h3 className="text-sm font-semibold text-white">
                      Grade submission
                    </h3>
                  </div>

                  <p className="text-xs leading-5 text-slate-500">
                    Enter the student's score
                    and optional feedback.
                  </p>
                </div>

                {/* CURRENT STATUS */}

                <div className="mb-5 rounded-2xl border border-slate-800 bg-[#020617] p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                    Current status
                  </p>

                  <div className="mt-2 flex flex-wrap gap-2">
                    <span
                      className={`rounded-full border px-3 py-1.5 text-xs font-bold ${getStatusClass(
                        submission
                      )}`}
                    >
                      {getStatusLabel(
                        submission
                      )}
                    </span>

                    {submission.isLate && (
                      <span className="rounded-full border border-red-400/20 bg-red-400/10 px-3 py-1.5 text-xs font-bold text-red-300">
                        Late
                      </span>
                    )}
                  </div>
                </div>

                {/* SCORE */}

                <label className="block">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Score
                  </span>

                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      max={
                        maxScore
                      }
                      step="0.01"
                      value={score}
                      onChange={(
                        event
                      ) =>
                        setScore(
                          event.target
                            .value
                        )
                      }
                      placeholder="0"
                      className="h-12 w-full rounded-xl border border-slate-700 bg-[#020617] px-4 text-base font-semibold text-white outline-none placeholder:text-slate-700 focus:border-cyan-500/50"
                    />

                    <span className="shrink-0 text-sm font-semibold text-slate-500">
                      / {maxScore}
                    </span>
                  </div>
                </label>

                {/* FEEDBACK */}

                <label className="mt-5 block">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Feedback
                  </span>

                  <textarea
                    value={
                      feedback
                    }
                    onChange={(
                      event
                    ) =>
                      setFeedback(
                        event.target
                          .value
                      )
                    }
                    rows={8}
                    placeholder="Write feedback for the student..."
                    className="w-full resize-none rounded-xl border border-slate-700 bg-[#020617] px-4 py-3 text-sm leading-6 text-white outline-none placeholder:text-slate-700 focus:border-cyan-500/50"
                  />
                </label>

                {/* EXISTING GRADE */}

                {submission.score !==
                  null &&
                  submission.score !==
                    undefined && (
                    <div className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                        Existing grade
                      </p>

                      <p className="mt-1 text-lg font-bold text-emerald-300">
                        {
                          submission.score
                        }
                        /
                        {
                          maxScore
                        }
                      </p>

                      {submission.reviewedAt && (
                        <p className="mt-1 text-[11px] text-slate-600">
                          Graded{" "}
                          {formatDateTime(
                            submission.reviewedAt
                          )}
                        </p>
                      )}
                    </div>
                  )}

                {/* ERROR */}

                {error && (
                  <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3">
                    <div className="flex gap-2">
                      <AlertCircle
                        size={16}
                        className="mt-0.5 shrink-0 text-red-400"
                      />

                      <p className="text-xs leading-5 text-red-300">
                        {error}
                      </p>
                    </div>
                  </div>
                )}

                {/* SUCCESS */}

                {success && (
                  <div className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3">
                    <div className="flex gap-2">
                      <CheckCircle2
                        size={16}
                        className="mt-0.5 shrink-0 text-emerald-400"
                      />

                      <p className="text-xs leading-5 text-emerald-300">
                        {success}
                      </p>
                    </div>
                  </div>
                )}

                {/* SAVE */}

                <button
                  type="button"
                  onClick={
                    onReview
                  }
                  disabled={
                    reviewing
                  }
                  className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-cyan-500 px-4 text-sm font-bold text-[#020617] transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {reviewing ? (
                    <>
                      <Loader2
                        size={17}
                        className="animate-spin"
                      />

                      Saving grade...
                    </>
                  ) : (
                    <>
                      <Send
                        size={17}
                      />

                      Save grade
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={
                    onClose
                  }
                  disabled={
                    reviewing
                  }
                  className="mt-2 h-11 w-full rounded-xl border border-slate-700 bg-slate-900 px-4 text-sm font-semibold text-slate-300 hover:bg-slate-800 disabled:opacity-50"
                >
                  Close
                </button>
              </div>
            </aside>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* =========================================================
   TASK META
========================================================= */

function TaskMeta({
  icon,
  label,
  value,
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
      <div className="flex items-center gap-2 text-slate-500">
        {icon}

        <span className="text-[10px] font-bold uppercase tracking-wider">
          {label}
        </span>
      </div>

      <p className="mt-1 text-xs font-semibold text-slate-300">
        {value}
      </p>
    </div>
  );
}

/* =========================================================
   INFO BADGE
========================================================= */

function InfoBadge({
  icon,
  text,
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1.5 text-[11px] font-medium text-slate-400">
      {icon}
      {text}
    </span>
  );
}

/* =========================================================
   ATTACHMENT CARD
========================================================= */

function AttachmentCard({
  file,
  index,
}) {
  const name =
    getAttachmentName(
      file,
      index
    );

  const url =
    getAttachmentUrl(file);

  const type =
    getAttachmentType(file);

  const image =
    type === "image";

  const video =
    type === "video";

  const Icon = image
    ? ImageIcon
    : video
    ? Video
    : FileText;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800 bg-[#020617]">

      {image && url ? (
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="block border-b border-slate-800 bg-black"
        >
          <img
            src={url}
            alt={name}
            className="h-48 w-full object-cover hover:opacity-80"
            loading="lazy"
          />
        </a>
      ) : video && url ? (
        <div className="border-b border-slate-800 bg-black p-2">
          <video
            src={url}
            controls
            preload="metadata"
            className="h-48 w-full rounded-xl object-contain"
          />
        </div>
      ) : (
        <div className="flex h-32 items-center justify-center border-b border-slate-800 bg-[#061121]">
          <Icon
            size={38}
            className={
              type === "pdf"
                ? "text-red-400"
                : "text-slate-700"
            }
          />
        </div>
      )}

      <div className="flex items-center gap-3 p-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-cyan-300">
          <Icon size={18} />
        </div>

        <div className="min-w-0 flex-1">
          <p
            className="truncate text-xs font-semibold text-slate-200"
            title={name}
          >
            {name}
          </p>

          <p className="mt-1 text-[10px] uppercase tracking-wide text-slate-600">
            {type === "video"
              ? "Video"
              : type === "image"
              ? "Image"
              : type === "pdf"
              ? "PDF"
              : type === "document"
              ? "Document"
              : "File"}
          </p>
        </div>

        {url && (
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            download
            onClick={(event) =>
              event.stopPropagation()
            }
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-cyan-300"
            title="Open / download file"
          >
            <Download
              size={16}
            />
          </a>
        )}
      </div>
    </div>
  );
}