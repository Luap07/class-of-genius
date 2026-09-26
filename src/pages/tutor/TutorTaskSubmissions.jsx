import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Award,
  AlertCircle,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Clock3,
  Download,
  Eye,
  FileText,
  GraduationCap,
  Image as ImageIcon,
  Loader2,
  MessageSquare,
  RefreshCw,
  Search,
  Send,
  User,
  Video,
  X,
} from "lucide-react";

/* =========================================================
   API
========================================================= */

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

const SUBMISSIONS_URL =
  `${API_BASE_URL}/api/academy/tutor/task-submissions`;

/* =========================================================
   HELPERS
========================================================= */

function clean(value) {
  return value === undefined || value === null
    ? ""
    : String(value).trim();
}

function getStoredTutor() {
  try {
    const raw = localStorage.getItem(
      "scholiqen_academy_user"
    );

    if (!raw) return null;

    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function getTutorReference(tutor) {
  return clean(
    tutor?.reference ||
      tutor?.tutor_reference ||
      tutor?.tutorReference ||
      tutor?.reference_id ||
      tutor?.referenceId
  );
}

function getTutorName(tutor) {
  const direct = clean(
    tutor?.name ||
      tutor?.full_name ||
      tutor?.fullName
  );

  if (direct) return direct;

  return [
    tutor?.first_name || tutor?.firstName,
    tutor?.middle_name || tutor?.middleName,
    tutor?.last_name || tutor?.lastName,
  ]
    .map(clean)
    .filter(Boolean)
    .join(" ");
}

function getAuthHeaders() {
  const token =
    localStorage.getItem("scholiqen_academy_token") ||
    localStorage.getItem("academy_token");

  const headers = {
    Accept: "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

function getFileUrl(url) {
  if (!url) return "";

  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  if (url.startsWith("/")) {
    return `${API_BASE_URL}${url}`;
  }

  return `${API_BASE_URL}/${url}`;
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-NG", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatDateTime(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("en-NG", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/* =========================================================
   FIELD NORMALIZATION
========================================================= */

function getStudentName(submission) {
  return (
    clean(
      submission.student_name ||
        submission.studentName ||
        submission.student_full_name ||
        submission.studentFullName ||
        submission.full_name
    ) || "Student"
  );
}

function getStudentEmail(submission) {
  return clean(
    submission.student_email ||
      submission.studentEmail ||
      submission.email
  );
}

function getTaskId(submission) {
  return (
    submission.task_id ||
    submission.taskId ||
    submission.assignment_id ||
    submission.assignmentId
  );
}

function getTaskTitle(submission) {
  return (
    clean(
      submission.task_title ||
        submission.taskTitle ||
        submission.assignment_title ||
        submission.assignmentTitle ||
        submission.title ||
        submission.task?.title ||
        submission.assignment?.title
    ) || "Task"
  );
}

function getTaskDescription(submission) {
  return clean(
    submission.task_description ||
      submission.taskDescription ||
      submission.assignment_description ||
      submission.assignmentDescription ||
      submission.description ||
      submission.task?.description ||
      submission.assignment?.description
  );
}

function getTaskInstructions(submission) {
  return clean(
    submission.task_instructions ||
      submission.taskInstructions ||
      submission.assignment_instructions ||
      submission.assignmentInstructions ||
      submission.instructions ||
      submission.task?.instructions ||
      submission.assignment?.instructions
  );
}

function getSubject(submission) {
  return (
    clean(
      submission.subject ||
        submission.subject_name ||
        submission.subjectName ||
        submission.task_subject ||
        submission.taskSubject ||
        submission.task?.subject ||
        submission.assignment?.subject
    ) || "Subject"
  );
}

function getGrade(submission) {
  return (
    clean(
      submission.grade ||
        submission.class ||
        submission.class_name ||
        submission.className ||
        submission.task_grade ||
        submission.taskGrade ||
        submission.task?.grade ||
        submission.task?.class_name ||
        submission.assignment?.grade
    ) || "Class"
  );
}

function getDueAt(submission) {
  return (
    submission.due_at ||
    submission.dueAt ||
    submission.deadline ||
    submission.task_due_at ||
    submission.taskDueAt ||
    submission.assignment_due_at ||
    submission.assignmentDueAt ||
    submission.task?.due_at ||
    submission.task?.dueAt ||
    submission.assignment?.due_at ||
    submission.assignment?.dueAt ||
    null
  );
}

function getSubmittedAt(submission) {
  return (
    submission.submitted_at ||
    submission.submittedAt ||
    submission.created_at ||
    submission.createdAt
  );
}

function getResponseText(submission) {
  return clean(
    submission.response_text ||
      submission.responseText ||
      submission.answer ||
      submission.student_response ||
      submission.studentResponse ||
      submission.response
  );
}

function getMaxScore(submission) {
  return (
    Number(
      submission.max_score ??
        submission.maxScore ??
        submission.task_max_score ??
        submission.taskMaxScore ??
        submission.task?.max_score ??
        submission.task?.maxScore ??
        submission.assignment?.max_score ??
        submission.assignment?.maxScore ??
        100
    ) || 100
  );
}

function getScore(submission) {
  if (
    submission.score === null ||
    submission.score === undefined ||
    submission.score === ""
  ) {
    return null;
  }

  const number = Number(submission.score);

  return Number.isFinite(number) ? number : null;
}

function getStatus(submission) {
  return clean(
    submission.status ||
      submission.submission_status ||
      submission.submissionStatus ||
      "submitted"
  ).toLowerCase();
}

function getSubmissionId(submission) {
  return (
    submission.id ||
    submission.submission_id ||
    submission.submissionId
  );
}

/* =========================================================
   GRADED / OVERDUE / LATE
========================================================= */

function isGraded(submission) {
  const status = getStatus(submission);
  const score = getScore(submission);

  return (
    status === "reviewed" ||
    status === "graded" ||
    score !== null
  );
}

function isOverdue(submission) {
  const dueAt = getDueAt(submission);

  if (!dueAt) return false;

  const due = new Date(dueAt);

  if (Number.isNaN(due.getTime())) {
    return false;
  }

  /*
    A submitted task is not considered "overdue" merely because
    the deadline has passed. It becomes "Late" instead.

    "Overdue" here means the task deadline has passed and the
    submission is still awaiting review.
  */
  const submittedAt = getSubmittedAt(submission);

  if (submittedAt) {
    return false;
  }

  return due.getTime() < Date.now();
}

function isLateSubmission(submission) {
  const dueAt = getDueAt(submission);
  const submittedAt = getSubmittedAt(submission);

  if (!dueAt || !submittedAt) return false;

  const due = new Date(dueAt);
  const submitted = new Date(submittedAt);

  if (
    Number.isNaN(due.getTime()) ||
    Number.isNaN(submitted.getTime())
  ) {
    return false;
  }

  return submitted.getTime() > due.getTime();
}

function getSubmissionState(submission) {
  if (isGraded(submission)) {
    return {
      key: "graded",
      label: "Graded",
      className:
        "text-emerald-300 bg-emerald-400/10 border-emerald-400/20",
      icon: CheckCircle2,
    };
  }

  if (isLateSubmission(submission)) {
    return {
      key: "late",
      label: "Submitted Late",
      className:
        "text-orange-300 bg-orange-400/10 border-orange-400/20",
      icon: Clock3,
    };
  }

  if (isOverdue(submission)) {
    return {
      key: "overdue",
      label: "Overdue",
      className:
        "text-red-300 bg-red-400/10 border-red-400/20",
      icon: AlertCircle,
    };
  }

  return {
    key: "submitted",
    label: "Awaiting Review",
    className:
      "text-cyan-300 bg-cyan-400/10 border-cyan-400/20",
    icon: Clock3,
  };
}

function getStatusLabel(status) {
  const value = clean(status).toLowerCase();

  if (value === "reviewed" || value === "graded") {
    return "Graded";
  }

  if (value === "returned") {
    return "Returned";
  }

  if (value === "submitted") {
    return "Submitted";
  }

  return status || "Submitted";
}

function getStatusClass(status) {
  const value = clean(status).toLowerCase();

  if (value === "reviewed" || value === "graded") {
    return "text-emerald-300 bg-emerald-400/10 border-emerald-400/20";
  }

  if (value === "returned") {
    return "text-amber-300 bg-amber-400/10 border-amber-400/20";
  }

  return "text-cyan-300 bg-cyan-400/10 border-cyan-400/20";
}

/* =========================================================
   ATTACHMENTS
========================================================= */

function getAttachmentName(file, index) {
  return (
    file?.fileName ||
    file?.file_name ||
    file?.originalName ||
    file?.original_name ||
    file?.name ||
    `Attachment ${index + 1}`
  );
}

function getAttachmentUrl(file) {
  return getFileUrl(
    file?.url ||
      file?.fileUrl ||
      file?.file_url ||
      file?.path ||
      file?.filePath
  );
}

function getAttachmentType(file) {
  return clean(
    file?.fileType ||
      file?.file_type ||
      file?.mimeType ||
      file?.mime_type ||
      file?.type
  ).toLowerCase();
}

function isImage(file) {
  const type = getAttachmentType(file);
  const name = getAttachmentName(file).toLowerCase();

  return (
    type.startsWith("image/") ||
    /\.(jpg|jpeg|png|webp|gif|svg|avif)$/i.test(name)
  );
}

function isVideo(file) {
  const type = getAttachmentType(file);
  const name = getAttachmentName(file).toLowerCase();

  return (
    type.startsWith("video/") ||
    /\.(mp4|webm|mov)$/i.test(name)
  );
}

function isPdf(file) {
  const type = getAttachmentType(file);
  const name = getAttachmentName(file).toLowerCase();

  return (
    type === "application/pdf" ||
    /\.pdf$/i.test(name)
  );
}

function parseAttachments(value) {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value;
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

      if (parsed && typeof parsed === "object") {
        return Object.values(parsed);
      }
    } catch {
      return [];
    }
  }

  return [];
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function TutorTaskSubmissions() {
  const [tutor, setTutor] = useState(null);

  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("all");

  const [selectedSubmission, setSelectedSubmission] =
    useState(null);

  const [reviewScore, setReviewScore] = useState("");
  const [reviewFeedback, setReviewFeedback] =
    useState("");

  const [reviewing, setReviewing] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] =
    useState("");

  /* =======================================================
     LOAD TUTOR
  ======================================================= */

  useEffect(() => {
    const storedTutor = getStoredTutor();

    if (storedTutor) {
      setTutor(storedTutor);
    } else {
      setLoading(false);
    }
  }, []);

  /* =======================================================
     FETCH SUBMISSIONS
  ======================================================= */

  const fetchSubmissions = useCallback(
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

        const url = new URL(SUBMISSIONS_URL);

        if (tutorReference) {
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
        }

        const response = await fetch(
          url.toString(),
          {
            method: "GET",
            headers: getAuthHeaders(),
            credentials: "include",
          }
        );

        const contentType =
          response.headers.get("content-type") ||
          "";

        let data;

        if (
          contentType.includes(
            "application/json"
          )
        ) {
          data = await response.json();
        } else {
          const text = await response.text();

          try {
            data = JSON.parse(text);
          } catch {
            data = {
              message: text,
            };
          }
        }

        if (!response.ok) {
          throw new Error(
            data?.message ||
              data?.error ||
              `Unable to load submissions (${response.status})`
          );
        }

        const rows = Array.isArray(data)
          ? data
          : data?.submissions ||
            data?.data ||
            data?.rows ||
            [];

        setSubmissions(
          Array.isArray(rows) ? rows : []
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
    if (tutor !== null) {
      fetchSubmissions(true);
    }
  }, [tutor, fetchSubmissions]);

  /* =======================================================
     FILTER
  ======================================================= */

  const filteredSubmissions = useMemo(() => {
    const query = clean(search).toLowerCase();

    return submissions.filter((submission) => {
      const state =
        getSubmissionState(submission);

      if (
        statusFilter !== "all" &&
        state.key !== statusFilter
      ) {
        return false;
      }

      if (!query) {
        return true;
      }

      const searchable = [
        getStudentName(submission),
        getStudentEmail(submission),
        getTaskTitle(submission),
        getTaskDescription(submission),
        getTaskInstructions(submission),
        getSubject(submission),
        getGrade(submission),
        getTaskId(submission),
      ]
        .map(clean)
        .join(" ")
        .toLowerCase();

      return searchable.includes(query);
    });
  }, [
    submissions,
    search,
    statusFilter,
  ]);

  /* =======================================================
     COUNTS
  ======================================================= */

  const counts = useMemo(() => {
    let awaitingReview = 0;
    let graded = 0;
    let overdue = 0;
    let late = 0;

    submissions.forEach((submission) => {
      const state =
        getSubmissionState(submission);

      if (state.key === "graded") {
        graded++;
      } else if (state.key === "overdue") {
        overdue++;
      } else if (state.key === "late") {
        late++;
      } else {
        awaitingReview++;
      }
    });

    return {
      total: submissions.length,
      awaitingReview,
      graded,
      overdue,
      late,
    };
  }, [submissions]);

  /* =======================================================
     OPEN SUBMISSION
  ======================================================= */

  const openSubmission = (submission) => {
    setSelectedSubmission(submission);

    const score = getScore(submission);

    setReviewScore(
      score === null ? "" : String(score)
    );

    setReviewFeedback(
      clean(
        submission.feedback ||
          submission.review_feedback ||
          submission.reviewFeedback
      )
    );

    setReviewError("");
    setReviewSuccess("");
  };

  const closeSubmission = () => {
    if (reviewing) return;

    setSelectedSubmission(null);
    setReviewScore("");
    setReviewFeedback("");
    setReviewError("");
    setReviewSuccess("");
  };

  /* =======================================================
     REVIEW SUBMISSION
  ======================================================= */

  const reviewSubmission = async () => {
    if (!selectedSubmission) return;

    setReviewError("");
    setReviewSuccess("");

    const rawScore = clean(reviewScore);

    if (rawScore === "") {
      setReviewError(
        "Enter a score before submitting the review."
      );
      return;
    }

    const score = Number(rawScore);

    if (!Number.isFinite(score)) {
      setReviewError(
        "Score must be a valid number."
      );
      return;
    }

    const maxScore =
      getMaxScore(selectedSubmission);

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

    try {
      setReviewing(true);

      const submissionId =
        getSubmissionId(
          selectedSubmission
        );

      if (!submissionId) {
        throw new Error(
          "This submission does not have a valid submission ID."
        );
      }

      const response = await fetch(
        `${SUBMISSIONS_URL}/${encodeURIComponent(
          submissionId
        )}/review`,
        {
          method: "PATCH",
          headers: {
            ...getAuthHeaders(),
            "Content-Type":
              "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            score,
            feedback:
              reviewFeedback.trim(),
            status: "reviewed",
          }),
        }
      );

      const contentType =
        response.headers.get("content-type") ||
        "";

      let data;

      if (
        contentType.includes(
          "application/json"
        )
      ) {
        data = await response.json();
      } else {
        const text = await response.text();

        try {
          data = JSON.parse(text);
        } catch {
          data = {
            message: text,
          };
        }
      }

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            `Unable to review submission (${response.status})`
        );
      }

      const reviewedSubmission =
        data?.submission ||
        data?.data ||
        data;

      setSubmissions((current) =>
        current.map((item) => {
          const itemId =
            getSubmissionId(item);

          if (
            String(itemId) !==
            String(submissionId)
          ) {
            return item;
          }

          return {
            ...item,
            ...(reviewedSubmission &&
            typeof reviewedSubmission ===
              "object"
              ? reviewedSubmission
              : {}),
            score,
            feedback:
              reviewFeedback.trim(),
            status: "reviewed",
            reviewed_at:
              reviewedSubmission?.reviewed_at ||
              new Date().toISOString(),
          };
        })
      );

      setSelectedSubmission(
        (current) => {
          if (!current) return current;

          return {
            ...current,
            ...(reviewedSubmission &&
            typeof reviewedSubmission ===
              "object"
              ? reviewedSubmission
              : {}),
            score,
            feedback:
              reviewFeedback.trim(),
            status: "reviewed",
            reviewed_at:
              reviewedSubmission?.reviewed_at ||
              new Date().toISOString(),
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
          "Unable to review this submission."
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

        <div className="mb-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-cyan-400">
                <ClipboardList size={19} />

                <span className="text-xs font-semibold uppercase tracking-[0.2em]">
                  Academy
                </span>
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Task Submissions
              </h1>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
                View the exact tasks submitted by your
                students, read their responses, inspect
                uploaded files, and grade their work.
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
        </div>

        {/* TUTOR INFO */}

        {tutor && (
          <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-slate-800 bg-[#071426] p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
                <GraduationCap size={21} />
              </div>

              <div>
                <p className="text-sm font-semibold text-white">
                  {getTutorName(tutor) ||
                    "Tutor"}
                </p>

                <p className="text-xs text-slate-500">
                  Reference:{" "}
                  {getTutorReference(tutor) ||
                    "—"}
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
                fetchSubmissions(true)
              }
              className="rounded-lg border border-red-400/20 px-3 py-2 text-xs font-semibold text-red-300 transition hover:bg-red-400/10"
            >
              Retry
            </button>
          </div>
        )}

        {/* STATS */}

        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">

          <StatCard
            icon={<ClipboardList size={19} />}
            label="Total"
            value={counts.total}
          />

          <StatCard
            icon={<Clock3 size={19} />}
            label="Awaiting review"
            value={counts.awaitingReview}
          />

          <StatCard
            icon={<Award size={19} />}
            label="Graded"
            value={counts.graded}
          />

          <StatCard
            icon={<AlertCircle size={19} />}
            label="Overdue"
            value={counts.overdue}
            danger={counts.overdue > 0}
          />

        </div>

        {/* FILTERS */}

        <div className="mb-5 rounded-2xl border border-slate-800 bg-[#071426] p-4">
          <div className="flex flex-col gap-3">

            <div className="relative">
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
                className="h-11 w-full rounded-xl border border-slate-700 bg-[#020617] pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-500/50"
              />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1">
              {[
                ["all", "All"],
                [
                  "submitted",
                  "Awaiting review",
                ],
                ["graded", "Graded"],
                ["overdue", "Overdue"],
                ["late", "Late"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() =>
                    setStatusFilter(value)
                  }
                  className={`whitespace-nowrap rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
                    statusFilter === value
                      ? "border-cyan-400/30 bg-cyan-400/10 text-cyan-300"
                      : "border-slate-700 bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

          </div>
        </div>

        {/* CONTENT */}

        {loading ? (
          <div className="flex min-h-[400px] items-center justify-center rounded-2xl border border-slate-800 bg-[#071426]">
            <div className="flex flex-col items-center gap-3 text-center">
              <Loader2
                size={30}
                className="animate-spin text-cyan-400"
              />

              <p className="text-sm font-medium text-slate-400">
                Loading task submissions...
              </p>
            </div>
          </div>
        ) : filteredSubmissions.length === 0 ? (
          <EmptyState
            hasFilters={
              Boolean(search.trim()) ||
              statusFilter !== "all"
            }
            onClear={() => {
              setSearch("");
              setStatusFilter("all");
            }}
          />
        ) : (
          <div className="space-y-3">
            {filteredSubmissions.map(
              (submission, index) => (
                <SubmissionCard
                  key={
                    getSubmissionId(
                      submission
                    ) ||
                    `${getStudentName(
                      submission
                    )}-${index}`
                  }
                  submission={submission}
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

      {/* REVIEW MODAL */}

      <AnimatePresence>
        {selectedSubmission && (
          <ReviewModal
            submission={selectedSubmission}
            score={reviewScore}
            feedback={reviewFeedback}
            setScore={setReviewScore}
            setFeedback={setReviewFeedback}
            reviewing={reviewing}
            error={reviewError}
            success={reviewSuccess}
            onReview={reviewSubmission}
            onClose={closeSubmission}
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
  danger = false,
}) {
  return (
    <div
      className={`rounded-2xl border p-5 ${
        danger
          ? "border-red-500/20 bg-red-500/[0.04]"
          : "border-slate-800 bg-[#071426]"
      }`}
    >
      <div
        className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl ${
          danger
            ? "bg-red-400/10 text-red-300"
            : "bg-cyan-400/10 text-cyan-300"
        }`}
      >
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
    getStudentName(submission);

  const taskTitle =
    getTaskTitle(submission);

  const subject =
    getSubject(submission);

  const grade =
    getGrade(submission);

  const submittedAt =
    getSubmittedAt(submission);

  const dueAt =
    getDueAt(submission);

  const score =
    getScore(submission);

  const maxScore =
    getMaxScore(submission);

  const state =
    getSubmissionState(submission);

  const StateIcon =
    state.icon;

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
      <div className="flex flex-col gap-4">

        {/* TOP */}

        <div className="flex items-start gap-3">

          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-cyan-300">
            <User size={19} />
          </div>

          <div className="min-w-0 flex-1">

            <div className="flex flex-wrap items-center gap-2">

              <h3 className="text-sm font-semibold text-white">
                {studentName}
              </h3>

              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${state.className}`}
              >
                <StateIcon size={11} />

                {state.label}
              </span>

            </div>

            {/* ACTUAL TASK */}

            <div className="mt-3 rounded-xl border border-slate-800 bg-[#020617] p-3">

              <div className="flex items-start gap-3">

                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cyan-400/10 text-cyan-300">
                  <FileText size={17} />
                </div>

                <div className="min-w-0 flex-1">

                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-cyan-400">
                    Task submitted
                  </p>

                  <p className="mt-1 truncate text-sm font-bold text-white">
                    {taskTitle}
                  </p>

                  {getTaskDescription(
                    submission
                  ) && (
                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
                      {getTaskDescription(
                        submission
                      )}
                    </p>
                  )}

                </div>
              </div>
            </div>

            {/* INFO */}

            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">

              <span className="inline-flex items-center gap-1.5">
                <BookOpen size={13} />
                {subject}
              </span>

              <span className="inline-flex items-center gap-1.5">
                <GraduationCap size={13} />
                {grade}
              </span>

              <span className="inline-flex items-center gap-1.5">
                <CalendarDays size={13} />
                Submitted{" "}
                {formatDate(
                  submittedAt
                )}
              </span>

              {dueAt && (
                <span
                  className={`inline-flex items-center gap-1.5 ${
                    isLateSubmission(
                      submission
                    )
                      ? "text-orange-400"
                      : isOverdue(
                          submission
                        )
                      ? "text-red-400"
                      : ""
                  }`}
                >
                  <Clock3 size={13} />
                  Due{" "}
                  {formatDate(dueAt)}
                </span>
              )}

            </div>

          </div>
        </div>

        {/* BOTTOM */}

        <div className="flex items-center justify-between gap-5 border-t border-slate-800 pt-4">

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
            View submission
          </div>

        </div>

      </div>
    </motion.button>
  );
}

/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyState({
  hasFilters,
  onClear,
}) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800 bg-[#071426] px-6 text-center">

      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-slate-500">
        <ClipboardList size={25} />
      </div>

      <h3 className="mt-4 text-base font-semibold text-white">
        {hasFilters
          ? "No matching submissions"
          : "No task submissions yet"}
      </h3>

      <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
        {hasFilters
          ? "Try changing the search or status filter."
          : "Student task submissions will appear here when students submit their work."}
      </p>

      {hasFilters && (
        <button
          type="button"
          onClick={onClear}
          className="mt-5 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-slate-800"
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
  const studentName =
    getStudentName(submission);

  const studentEmail =
    getStudentEmail(submission);

  const taskId =
    getTaskId(submission);

  const taskTitle =
    getTaskTitle(submission);

  const taskDescription =
    getTaskDescription(
      submission
    );

  const taskInstructions =
    getTaskInstructions(
      submission
    );

  const subject =
    getSubject(submission);

  const grade =
    getGrade(submission);

  const dueAt =
    getDueAt(submission);

  const submittedAt =
    getSubmittedAt(submission);

  const responseText =
    getResponseText(submission);

  const maxScore =
    getMaxScore(submission);

  const currentScore =
    getScore(submission);

  const attachments =
    parseAttachments(
      submission.attachments ||
        submission.submission_attachments ||
        submission.submissionAttachments
    );

  const state =
    getSubmissionState(submission);

  const StateIcon =
    state.icon;

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
        transition={{
          duration: 0.2,
        }}
        className="flex max-h-[94vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-slate-700 bg-[#071426] shadow-2xl"
      >

        {/* HEADER */}

        <div className="flex items-start justify-between gap-4 border-b border-slate-800 px-4 py-4 sm:px-6">

          <div className="min-w-0 flex-1">

            <div className="flex flex-wrap items-center gap-2">

              <span className="rounded-lg bg-cyan-400/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-cyan-300">
                Student task submission
              </span>

              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${state.className}`}
              >
                <StateIcon size={11} />
                {state.label}
              </span>

            </div>

            <h2 className="mt-2 text-lg font-bold text-white sm:text-xl">
              {taskTitle}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Submitted by{" "}
              <span className="font-semibold text-slate-300">
                {studentName}
              </span>
            </p>

          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={reviewing}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-700 text-slate-400 transition hover:bg-slate-800 hover:text-white disabled:opacity-50"
            aria-label="Close"
          >
            <X size={18} />
          </button>

        </div>

        {/* BODY */}

        <div className="flex-1 overflow-y-auto">

          <div className="grid lg:grid-cols-[1fr_350px]">

            {/* LEFT */}

            <div className="space-y-5 p-4 sm:p-6">

              {/* ACTUAL TASK */}

              <section className="rounded-2xl border border-cyan-500/20 bg-cyan-500/[0.04] p-5">

                <div className="mb-4 flex items-center gap-2">
                  <FileText
                    size={18}
                    className="text-cyan-400"
                  />

                  <h3 className="text-sm font-bold text-white">
                    Task submitted
                  </h3>
                </div>

                <h4 className="text-xl font-bold text-white">
                  {taskTitle}
                </h4>

                {taskId && (
                  <p className="mt-1 text-[11px] text-slate-600">
                    Task ID: {taskId}
                  </p>
                )}

                <div className="mt-4 grid gap-3 sm:grid-cols-2">

                  <InfoBox
                    icon={
                      <BookOpen
                        size={15}
                      />
                    }
                    label="Subject"
                    value={subject}
                  />

                  <InfoBox
                    icon={
                      <GraduationCap
                        size={15}
                      />
                    }
                    label="Class"
                    value={grade}
                  />

                  <InfoBox
                    icon={
                      <CalendarDays
                        size={15}
                      />
                    }
                    label="Deadline"
                    value={formatDateTime(
                      dueAt
                    )}
                  />

                  <InfoBox
                    icon={
                      <Clock3
                        size={15}
                      />
                    }
                    label="Submitted"
                    value={formatDateTime(
                      submittedAt
                    )}
                  />

                </div>

              </section>

              {/* TASK DESCRIPTION */}

              {taskDescription && (
                <section>

                  <div className="mb-2 flex items-center gap-2">
                    <BookOpen
                      size={17}
                      className="text-cyan-400"
                    />

                    <h3 className="text-sm font-semibold text-white">
                      Task description
                    </h3>
                  </div>

                  <div className="rounded-2xl border border-slate-800 bg-[#020617] p-4">

                    <p className="whitespace-pre-wrap text-sm leading-7 text-slate-300">
                      {taskDescription}
                    </p>

                  </div>

                </section>
              )}

              {/* INSTRUCTIONS */}

              {taskInstructions && (
                <section>

                  <div className="mb-2 flex items-center gap-2">
                    <ClipboardList
                      size={17}
                      className="text-cyan-400"
                    />

                    <h3 className="text-sm font-semibold text-white">
                      Task instructions
                    </h3>
                  </div>

                  <div className="rounded-2xl border border-slate-800 bg-[#020617] p-4">

                    <p className="whitespace-pre-wrap text-sm leading-7 text-slate-300">
                      {taskInstructions}
                    </p>

                  </div>

                </section>
              )}

              {/* STUDENT */}

              <section className="rounded-2xl border border-slate-800 bg-[#020617] p-4">

                <div className="flex items-start gap-3">

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
                    <User size={19} />
                  </div>

                  <div className="min-w-0 flex-1">

                    <p className="text-sm font-semibold text-white">
                      {studentName}
                    </p>

                    {studentEmail && (
                      <p className="mt-1 truncate text-xs text-slate-500">
                        {studentEmail}
                      </p>
                    )}

                  </div>

                </div>

              </section>

              {/* RESPONSE */}

              <section>

                <div className="mb-2 flex items-center gap-2">

                  <MessageSquare
                    size={17}
                    className="text-cyan-400"
                  />

                  <h3 className="text-sm font-semibold text-white">
                    Student response
                  </h3>

                </div>

                <div className="min-h-[150px] rounded-2xl border border-slate-800 bg-[#020617] p-4">

                  {responseText ? (
                    <p className="whitespace-pre-wrap text-sm leading-7 text-slate-300">
                      {responseText}
                    </p>
                  ) : (
                    <div className="flex min-h-[110px] items-center justify-center text-center">
                      <p className="text-sm text-slate-600">
                        No written response was submitted.
                      </p>
                    </div>
                  )}

                </div>

              </section>

              {/* ATTACHMENTS */}

              <section>

                <div className="mb-3 flex items-center justify-between">

                  <div className="flex items-center gap-2">

                    <FileText
                      size={17}
                      className="text-cyan-400"
                    />

                    <h3 className="text-sm font-semibold text-white">
                      Student submitted files
                    </h3>

                  </div>

                  <span className="text-xs text-slate-600">
                    {attachments.length}{" "}
                    {attachments.length ===
                    1
                      ? "file"
                      : "files"}
                  </span>

                </div>

                {attachments.length ===
                0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-800 bg-[#020617] p-6 text-center">
                    <p className="text-sm text-slate-600">
                      No files were submitted.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">

                    {attachments.map(
                      (file, index) => (
                        <AttachmentCard
                          key={`${getAttachmentName(
                            file,
                            index
                          )}-${index}`}
                          file={file}
                          index={index}
                        />
                      )
                    )}

                  </div>
                )}

              </section>

            </div>

            {/* RIGHT */}

            <aside className="border-t border-slate-800 bg-[#061121] p-4 sm:p-6 lg:border-l lg:border-t-0">

              <div className="lg:sticky lg:top-0">

                {/* GRADE SUMMARY */}

                <div className="mb-5 rounded-2xl border border-slate-800 bg-[#020617] p-4">

                  <div className="flex items-center justify-between">

                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">
                        Current grade
                      </p>

                      <p className="mt-1 text-2xl font-bold text-white">
                        {currentScore ===
                        null
                          ? "—"
                          : `${currentScore}/${maxScore}`}
                      </p>
                    </div>

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
                      <Award size={20} />
                    </div>

                  </div>

                </div>

                {/* REVIEW */}

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
                    Give the student a score and
                    optional feedback.
                  </p>

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
                      max={maxScore}
                      step="0.01"
                      value={score}
                      onChange={(event) =>
                        setScore(
                          event.target.value
                        )
                      }
                      placeholder="0"
                      className="h-12 w-full rounded-xl border border-slate-700 bg-[#020617] px-4 text-base font-semibold text-white outline-none transition placeholder:text-slate-700 focus:border-cyan-500/50"
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
                    value={feedback}
                    onChange={(event) =>
                      setFeedback(
                        event.target.value
                      )
                    }
                    rows={8}
                    placeholder="Write feedback for the student..."
                    className="w-full resize-none rounded-xl border border-slate-700 bg-[#020617] px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-slate-700 focus:border-cyan-500/50"
                  />

                </label>

                {/* MESSAGES */}

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
                  onClick={onReview}
                  disabled={reviewing}
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
                      <Send size={17} />

                      Save grade
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  disabled={reviewing}
                  className="mt-2 h-11 w-full rounded-xl border border-slate-700 bg-slate-900 px-4 text-sm font-semibold text-slate-300 transition hover:bg-slate-800 disabled:opacity-50"
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
   INFO BOX
========================================================= */

function InfoBox({
  icon,
  label,
  value,
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-[#020617] p-3">

      <div className="flex items-center gap-2 text-cyan-400">
        {icon}

        <span className="text-[10px] font-bold uppercase tracking-wider">
          {label}
        </span>
      </div>

      <p className="mt-2 text-xs font-semibold text-slate-300">
        {value || "—"}
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

  const image =
    isImage(file);

  const video =
    isVideo(file);

  const pdf =
    isPdf(file);

  const Icon = image
    ? ImageIcon
    : video
    ? Video
    : FileText;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800 bg-[#020617]">

      {/* IMAGE */}

      {image && url && (
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="block border-b border-slate-800 bg-black"
        >
          <img
            src={url}
            alt={name}
            className="h-44 w-full object-cover transition hover:opacity-80"
            loading="lazy"
          />
        </a>
      )}

      {/* VIDEO */}

      {video && url && (
        <div className="border-b border-slate-800 bg-black p-2">

          <video
            src={url}
            controls
            className="h-44 w-full rounded-xl object-contain"
          />

        </div>
      )}

      {/* PDF */}

      {pdf && url && (
        <div className="border-b border-slate-800 bg-white">

          <iframe
            src={`${url}#page=1&toolbar=0&navpanes=0&scrollbar=0`}
            title={name}
            className="h-44 w-full"
          />

        </div>
      )}

      {/* FILE INFO */}

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
            {video
              ? "Video"
              : image
              ? "Image"
              : pdf
              ? "PDF document"
              : "Document"}
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
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-700 text-slate-400 transition hover:bg-slate-800 hover:text-cyan-300"
            title="Download file"
          >
            <Download size={16} />
          </a>
        )}

      </div>

    </div>
  );
}