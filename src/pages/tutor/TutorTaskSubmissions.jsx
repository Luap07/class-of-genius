import React, { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle2,
  ClipboardList,
  Clock3,
  Download,
  FileText,
  Image as ImageIcon,
  Loader2,
  MessageSquare,
  RefreshCw,
  Search,
  Send,
  User,
  Video,
  X,
  AlertCircle,
  Eye,
  GraduationCap,
  BookOpen,
  CalendarDays,
  Award,
} from "lucide-react";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

const SUBMISSIONS_URL = `${API_BASE_URL}/api/academy/tutor/task-submissions`;

/* =========================================================
   HELPERS
========================================================= */

function clean(value) {
  return value === undefined || value === null ? "" : String(value).trim();
}

function getStoredTutor() {
  try {
    const raw = localStorage.getItem("scholiqen_academy_user");

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

function getStatusLabel(status) {
  const value = clean(status).toLowerCase();

  if (value === "reviewed" || value === "graded") {
    return "Reviewed";
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

function getAttachmentName(file, index) {
  return (
    file?.fileName ||
    file?.file_name ||
    file?.name ||
    `Attachment ${index + 1}`
  );
}

function getAttachmentUrl(file) {
  return getFileUrl(
    file?.url ||
      file?.fileUrl ||
      file?.file_url ||
      file?.path
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
  const [statusFilter, setStatusFilter] = useState("all");

  const [selectedSubmission, setSelectedSubmission] = useState(null);

  const [reviewScore, setReviewScore] = useState("");
  const [reviewFeedback, setReviewFeedback] = useState("");

  const [reviewing, setReviewing] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState("");

  /* =======================================================
     LOAD TUTOR
  ======================================================= */

  useEffect(() => {
    const storedTutor = getStoredTutor();

    if (storedTutor) {
      setTutor(storedTutor);
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

        const tutorReference = getTutorReference(tutor);

        const url = new URL(SUBMISSIONS_URL);

        if (tutorReference) {
          url.searchParams.set("tutorReference", tutorReference);
          url.searchParams.set("tutor_reference", tutorReference);
          url.searchParams.set("reference", tutorReference);
        }

        const response = await fetch(url.toString(), {
          method: "GET",
          headers: getAuthHeaders(),
        });

        const contentType =
          response.headers.get("content-type") || "";

        let data;

        if (contentType.includes("application/json")) {
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

        setSubmissions(rows);
      } catch (err) {
        console.error("Tutor task submissions error:", err);

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
      const status = clean(
        submission.status
      ).toLowerCase();

      if (
        statusFilter !== "all" &&
        status !== statusFilter
      ) {
        return false;
      }

      if (!query) {
        return true;
      }

      const searchable = [
        submission.student_name,
        submission.studentName,
        submission.student_email,
        submission.studentEmail,
        submission.task_title,
        submission.taskTitle,
        submission.title,
        submission.subject,
        submission.grade,
        submission.class,
        submission.class_name,
        submission.className,
      ]
        .map(clean)
        .join(" ")
        .toLowerCase();

      return searchable.includes(query);
    });
  }, [submissions, search, statusFilter]);

  /* =======================================================
     COUNTS
  ======================================================= */

  const counts = useMemo(() => {
    const submitted = submissions.filter(
      (item) =>
        clean(item.status).toLowerCase() ===
        "submitted"
    ).length;

    const reviewed = submissions.filter((item) => {
      const status = clean(item.status).toLowerCase();

      return (
        status === "reviewed" ||
        status === "graded"
      );
    }).length;

    return {
      total: submissions.length,
      submitted,
      reviewed,
    };
  }, [submissions]);

  /* =======================================================
     OPEN SUBMISSION
  ======================================================= */

  const openSubmission = (submission) => {
    setSelectedSubmission(submission);

    setReviewScore(
      submission.score === null ||
        submission.score === undefined
        ? ""
        : String(submission.score)
    );

    setReviewFeedback(
      submission.feedback ||
        submission.review_feedback ||
        ""
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
      setReviewError("Enter a score before submitting the review.");
      return;
    }

    const score = Number(rawScore);

    if (!Number.isFinite(score)) {
      setReviewError("Score must be a valid number.");
      return;
    }

    const maxScore =
      Number(
        selectedSubmission.max_score ??
          selectedSubmission.maxScore ??
          selectedSubmission.task_max_score ??
          100
      ) || 100;

    if (score < 0) {
      setReviewError("Score cannot be below 0.");
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
        selectedSubmission.id ||
        selectedSubmission.submission_id ||
        selectedSubmission.submissionId;

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
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            score,
            feedback: reviewFeedback.trim(),
            status: "reviewed",
          }),
        }
      );

      const contentType =
        response.headers.get("content-type") || "";

      let data;

      if (contentType.includes("application/json")) {
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
            item.id ||
            item.submission_id ||
            item.submissionId;

          if (String(itemId) !== String(submissionId)) {
            return item;
          }

          return {
            ...item,
            ...(reviewedSubmission &&
            typeof reviewedSubmission === "object"
              ? reviewedSubmission
              : {}),
            score,
            feedback: reviewFeedback.trim(),
            status: "reviewed",
            reviewed_at:
              reviewedSubmission?.reviewed_at ||
              new Date().toISOString(),
          };
        })
      );

      setSelectedSubmission((current) => {
        if (!current) return current;

        return {
          ...current,
          ...(reviewedSubmission &&
          typeof reviewedSubmission === "object"
            ? reviewedSubmission
            : {}),
          score,
          feedback: reviewFeedback.trim(),
          status: "reviewed",
          reviewed_at:
            reviewedSubmission?.reviewed_at ||
            new Date().toISOString(),
        };
      });

      setReviewSuccess(
        "Submission reviewed successfully."
      );
    } catch (err) {
      console.error("Review submission error:", err);

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
        {/* =================================================
            HEADER
        ================================================= */}

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

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                Review student responses, check submitted files,
                give scores, and provide feedback.
              </p>
            </div>

            <button
              type="button"
              onClick={() => fetchSubmissions(false)}
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

        {/* =================================================
            TUTOR INFO
        ================================================= */}

        {tutor && (
          <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-slate-800 bg-[#071426] p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
                <GraduationCap size={21} />
              </div>

              <div>
                <p className="text-sm font-semibold text-white">
                  {getTutorName(tutor) || "Tutor"}
                </p>

                <p className="text-xs text-slate-500">
                  Reference:{" "}
                  {getTutorReference(tutor) || "—"}
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

        {/* =================================================
            ERROR
        ================================================= */}

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
              onClick={() => fetchSubmissions(true)}
              className="rounded-lg border border-red-400/20 px-3 py-2 text-xs font-semibold text-red-300 transition hover:bg-red-400/10"
            >
              Retry
            </button>
          </div>
        )}

        {/* =================================================
            STATS
        ================================================= */}

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            icon={<ClipboardList size={19} />}
            label="Total submissions"
            value={counts.total}
          />

          <StatCard
            icon={<Clock3 size={19} />}
            label="Awaiting review"
            value={counts.submitted}
          />

          <StatCard
            icon={<CheckCircle2 size={19} />}
            label="Reviewed"
            value={counts.reviewed}
          />
        </div>

        {/* =================================================
            FILTERS
        ================================================= */}

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
                  setSearch(event.target.value)
                }
                placeholder="Search student, task, subject or class..."
                className="h-11 w-full rounded-xl border border-slate-700 bg-[#020617] pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-500/50"
              />
            </div>

            <div className="flex gap-2 overflow-x-auto">
              {[
                ["all", "All"],
                ["submitted", "Awaiting review"],
                ["reviewed", "Reviewed"],
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

        {/* =================================================
            CONTENT
        ================================================= */}

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
                    submission.id ||
                    submission.submission_id ||
                    `${submission.student_id || "student"}-${index}`
                  }
                  submission={submission}
                  onOpen={() =>
                    openSubmission(submission)
                  }
                />
              )
            )}
          </div>
        )}
      </div>

      {/* ===================================================
          REVIEW MODAL
      =================================================== */}

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

function StatCard({ icon, label, value }) {
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
    clean(
      submission.student_name ||
        submission.studentName
    ) || "Student";

  const taskTitle =
    clean(
      submission.task_title ||
        submission.taskTitle ||
        submission.title
    ) || "Task";

  const subject =
    clean(
      submission.subject ||
        submission.subject_name ||
        submission.subjectName
    ) || "Subject";

  const grade =
    clean(
      submission.grade ||
        submission.class ||
        submission.class_name ||
        submission.className
    ) || "Class";

  const submittedAt =
    submission.submitted_at ||
    submission.submittedAt ||
    submission.created_at;

  const status =
    submission.status || "submitted";

  const score =
    submission.score !== null &&
    submission.score !== undefined
      ? submission.score
      : null;

  const maxScore =
    submission.max_score ??
    submission.maxScore ??
    submission.task_max_score ??
    100;

  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onOpen}
      className="group w-full rounded-2xl border border-slate-800 bg-[#071426] p-4 text-left transition hover:border-cyan-500/30 hover:bg-[#0a192d] sm:p-5"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
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
                  status
                )}`}
              >
                {getStatusLabel(status)}
              </span>
            </div>

            <p className="mt-1 truncate text-sm font-medium text-slate-300">
              {taskTitle}
            </p>

            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
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
                {formatDate(submittedAt)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-5 border-t border-slate-800 pt-4 lg:min-w-[190px] lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">
              Score
            </p>

            <p className="mt-1 text-lg font-bold text-white">
              {score === null
                ? "—"
                : `${score}/${maxScore}`}
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-cyan-300">
            <Eye size={16} />
            Review
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
          : "Student submissions will appear here when students submit their tasks."}
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
    clean(
      submission.student_name ||
        submission.studentName
    ) || "Student";

  const taskTitle =
    clean(
      submission.task_title ||
        submission.taskTitle ||
        submission.title
    ) || "Task";

  const subject =
    clean(
      submission.subject ||
        submission.subject_name ||
        submission.subjectName
    ) || "Subject";

  const grade =
    clean(
      submission.grade ||
        submission.class ||
        submission.class_name ||
        submission.className
    ) || "Class";

  const email =
    clean(
      submission.student_email ||
        submission.studentEmail
    );

  const responseText =
    submission.response_text ||
    submission.responseText ||
    "";

  const submittedAt =
    submission.submitted_at ||
    submission.submittedAt ||
    submission.created_at;

  const maxScore =
    Number(
      submission.max_score ??
        submission.maxScore ??
        submission.task_max_score ??
        100
    ) || 100;

  const attachments = parseAttachments(
    submission.attachments
  );

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-3 backdrop-blur-sm sm:p-5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.98 }}
        transition={{ duration: 0.2 }}
        className="flex max-h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-slate-700 bg-[#071426] shadow-2xl"
      >
        {/* MODAL HEADER */}

        <div className="flex items-start justify-between gap-4 border-b border-slate-800 px-4 py-4 sm:px-6">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-lg bg-cyan-400/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-cyan-300">
                Submission review
              </span>

              <span
                className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${getStatusClass(
                  submission.status
                )}`}
              >
                {getStatusLabel(
                  submission.status
                )}
              </span>
            </div>

            <h2 className="mt-2 truncate text-lg font-bold text-white sm:text-xl">
              {taskTitle}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Submitted by {studentName}
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

        {/* MODAL BODY */}

        <div className="flex-1 overflow-y-auto">
          <div className="grid lg:grid-cols-[1fr_340px]">
            {/* LEFT */}

            <div className="space-y-5 p-4 sm:p-6">
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

                    {email && (
                      <p className="mt-1 truncate text-xs text-slate-500">
                        {email}
                      </p>
                    )}

                    <div className="mt-3 flex flex-wrap gap-2">
                      <InfoBadge
                        icon={<BookOpen size={13} />}
                        text={subject}
                      />

                      <InfoBadge
                        icon={
                          <GraduationCap size={13} />
                        }
                        text={grade}
                      />

                      <InfoBadge
                        icon={
                          <CalendarDays size={13} />
                        }
                        text={formatDateTime(
                          submittedAt
                        )}
                      />
                    </div>
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
                      Submitted files
                    </h3>
                  </div>

                  <span className="text-xs text-slate-600">
                    {attachments.length}{" "}
                    {attachments.length === 1
                      ? "file"
                      : "files"}
                  </span>
                </div>

                {attachments.length === 0 ? (
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
                <div className="mb-5">
                  <div className="mb-2 flex items-center gap-2">
                    <Award
                      size={18}
                      className="text-cyan-400"
                    />

                    <h3 className="text-sm font-semibold text-white">
                      Review
                    </h3>
                  </div>

                  <p className="text-xs leading-5 text-slate-500">
                    Give the student a score and optional
                    feedback.
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

                {/* ACTION */}

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
                      Saving review...
                    </>
                  ) : (
                    <>
                      <Send size={17} />
                      Save review
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
   INFO BADGE
========================================================= */

function InfoBadge({ icon, text }) {
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

function AttachmentCard({ file, index }) {
  const name = getAttachmentName(file, index);
  const url = getAttachmentUrl(file);

  const image = isImage(file);
  const video = isVideo(file);

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
            className="h-44 w-full object-cover transition hover:opacity-80"
            loading="lazy"
          />
        </a>
      ) : video && url ? (
        <div className="border-b border-slate-800 bg-black p-2">
          <video
            src={url}
            controls
            className="h-44 w-full rounded-xl object-contain"
          />
        </div>
      ) : null}

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
            title="Open file"
          >
            <Download size={16} />
          </a>
        )}
      </div>
    </div>
  );
}
