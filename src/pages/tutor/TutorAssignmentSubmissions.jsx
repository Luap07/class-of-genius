import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Clock3,
  FileText,
  GraduationCap,
  Loader2,
  RefreshCw,
  User,
  Users,
  AlertCircle,
  X,
  Eye,
} from "lucide-react";

const API_BASE_URL = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000"
).replace(/\/$/, "");

const SUBMISSIONS_URL =
  `${API_BASE_URL}/api/academy/tutor/task-submissions`;

const ASSIGNMENTS_URL =
  `${API_BASE_URL}/api/academy/tutor/assignments`;

function clean(value) {
  if (
    value === undefined ||
    value === null
  ) {
    return "";
  }

  return String(value).trim();
}

function getTutorReference() {
  const keys = [
    "scholiqen_academy_user",
    "academy_user",
    "scholiqen_user",
    "user",
  ];

  for (const key of keys) {
    try {
      const raw =
        localStorage.getItem(key);

      if (!raw) continue;

      const parsed =
        JSON.parse(raw);

      const references = [
        parsed?.reference,
        parsed?.tutorReference,
        parsed?.tutor_reference,
        parsed?.user?.reference,
        parsed?.user?.tutorReference,
        parsed?.user?.tutor_reference,
        parsed?.user?.tutor?.reference,
        parsed?.user?.tutor?.tutorReference,
        parsed?.user?.tutor?.tutor_reference,
      ];

      const found =
        references.find(
          (value) =>
            value !== undefined &&
            value !== null &&
            String(value).trim() !== ""
        );

      if (found) {
        return String(found).trim();
      }
    } catch {
      // Continue.
    }
  }

  return "";
}

function getSubmissionId(
  submission
) {
  return (
    submission?.id ??
    submission?.submission_id ??
    submission?.submissionId
  );
}

function getStudentName(
  submission
) {
  return (
    clean(
      submission?.student_name
    ) ||
    clean(
      submission?.studentName
    ) ||
    clean(
      submission?.student?.name
    ) ||
    clean(
      submission?.student?.full_name
    ) ||
    clean(
      submission?.student?.fullName
    ) ||
    clean(
      submission?.name
    ) ||
    "Student"
  );
}

function getStudentReference(
  submission
) {
  return (
    clean(
      submission?.student_reference
    ) ||
    clean(
      submission?.studentReference
    ) ||
    clean(
      submission?.student?.reference
    ) ||
    clean(
      submission?.student_id
    ) ||
    clean(
      submission?.studentId
    )
  );
}

function getSubmissionDate(
  submission
) {
  return (
    submission?.submitted_at ??
    submission?.submittedAt ??
    submission?.created_at ??
    submission?.createdAt
  );
}

function formatDate(value) {
  if (!value) {
    return "No date";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "No date";
  }

  return date.toLocaleString(
    "en-NG",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }
  );
}

function getScore(
  submission
) {
  const score =
    submission?.score ??
    submission?.marks ??
    submission?.total_score ??
    submission?.totalScore;

  if (
    score === undefined ||
    score === null ||
    score === ""
  ) {
    return null;
  }

  return Number(score);
}

function getStatus(
  submission
) {
  const status =
    clean(
      submission?.status
    ).toLowerCase();

  if (
    status === "graded" ||
    status === "reviewed"
  ) {
    return "Graded";
  }

  if (
    status === "submitted" ||
    status === "completed"
  ) {
    return "Submitted";
  }

  return status
    ? status.charAt(0).toUpperCase() +
        status.slice(1)
    : "Submitted";
}

export default function TutorAssignmentSubmissions() {
  const navigate = useNavigate();

  const { id } =
    useParams();

  const tutorReference =
    useMemo(
      () =>
        getTutorReference(),
      []
    );

  const [assignment, setAssignment] =
    useState(null);

  const [submissions, setSubmissions] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  /* =======================================================
     LOAD ASSIGNMENT
  ======================================================= */

  const loadAssignment =
    useCallback(
      async () => {
        if (!id) {
          return;
        }

        try {
          const params =
            new URLSearchParams();

          if (tutorReference) {
            params.set(
              "reference",
              tutorReference
            );

            params.set(
              "tutorReference",
              tutorReference
            );

            params.set(
              "tutor_reference",
              tutorReference
            );
          }

          const response =
            await fetch(
              `${ASSIGNMENTS_URL}/${encodeURIComponent(
                id
              )}?${params.toString()}`
            );

          if (!response.ok) {
            return;
          }

          const data =
            await response.json();

          setAssignment(
            data?.assignment ??
              data?.data ??
              data
          );
        } catch (err) {
          console.warn(
            "Unable to load assignment information:",
            err
          );
        }
      },
      [
        id,
        tutorReference,
      ]
    );

  /* =======================================================
     LOAD SUBMISSIONS
  ======================================================= */

  const loadSubmissions =
    useCallback(
      async (
        showRefresh = false
      ) => {
        if (!id) {
          setError(
            "Assignment ID is missing."
          );
          setLoading(false);
          return;
        }

        if (showRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        try {
          const params =
            new URLSearchParams();

          params.set(
            "assignmentId",
            id
          );

          params.set(
            "assignment_id",
            id
          );

          params.set(
            "id",
            id
          );

          if (tutorReference) {
            params.set(
              "reference",
              tutorReference
            );

            params.set(
              "tutorReference",
              tutorReference
            );

            params.set(
              "tutor_reference",
              tutorReference
            );
          }

          const response =
            await fetch(
              `${SUBMISSIONS_URL}?${params.toString()}`
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
              data?.details ||
                data?.error ||
                data?.message ||
                `Unable to load submissions. Server returned ${response.status}.`
            );
          }

          let loaded =
            [];

          if (
            Array.isArray(
              data?.submissions
            )
          ) {
            loaded =
              data.submissions;
          } else if (
            Array.isArray(
              data?.data
            )
          ) {
            loaded =
              data.data;
          } else if (
            Array.isArray(
              data?.results
            )
          ) {
            loaded =
              data.results;
          } else if (
            Array.isArray(data)
          ) {
            loaded =
              data;
          }

          /*
           * The endpoint can return submissions
           * belonging to several assignments.
           * Keep only this assignment.
           */

          const filtered =
            loaded.filter(
              (submission) => {
                const submissionAssignmentId =
                  clean(
                    submission?.assignment_id ??
                      submission?.assignmentId ??
                      submission?.assignment?.id
                  );

                return (
                  !submissionAssignmentId ||
                  submissionAssignmentId ===
                    String(id)
                );
              }
            );

          setSubmissions(
            filtered
          );
        } catch (err) {
          console.error(
            "Load submissions error:",
            err
          );

          setError(
            err?.message ||
              "Unable to load submissions."
          );
        } finally {
          setLoading(false);
          setRefreshing(false);
        }
      },
      [
        id,
        tutorReference,
      ]
    );

  useEffect(() => {
    loadAssignment();
  }, [
    loadAssignment,
  ]);

  useEffect(() => {
    loadSubmissions();
  }, [
    loadSubmissions,
  ]);

  /* =======================================================
     GRADE
  ======================================================= */

  const openGradePage =
    useCallback(
      (submission) => {
        const submissionId =
          getSubmissionId(
            submission
          );

        if (!submissionId) {
          setError(
            "This submission does not have a valid submission ID."
          );
          return;
        }

        navigate(
          `/academy/tutor/assignments/${encodeURIComponent(
            id
          )}/submissions/${encodeURIComponent(
            submissionId
          )}`
        );
      },
      [id, navigate]
    );

  const gradedCount =
    submissions.filter(
      (submission) =>
        getStatus(
          submission
        ).toLowerCase() ===
        "graded"
    ).length;

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

        {/* HEADER */}

        <div className="mb-8">
          <button
            type="button"
            onClick={() =>
              navigate(-1)
            }
            className="mb-5 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-[#071426] px-4 py-2.5 text-sm font-semibold text-slate-300 hover:border-cyan-400/30 hover:text-white"
          >
            <ArrowLeft size={17} />
            Back
          </button>

          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-cyan-300">
                <Users size={14} />
                Assignment Grading
              </div>

              <h1 className="text-3xl font-bold text-white sm:text-4xl">
                {clean(
                  assignment?.title
                ) ||
                  "Assignment Submissions"}
              </h1>

              <p className="mt-2 text-sm text-slate-400">
                Review students who have submitted
                this assignment and grade their work.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                loadSubmissions(true)
              }
              disabled={
                loading ||
                refreshing
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#071426] px-4 py-3 text-sm font-semibold text-slate-200 hover:border-cyan-400/30 hover:bg-[#0b1b31] disabled:opacity-50"
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

        {/* ERROR */}

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-400/20 bg-red-500/10 p-4 text-sm text-red-200">
            <AlertCircle
              size={19}
              className="mt-0.5 shrink-0"
            />

            <div className="flex-1">
              <p className="font-semibold">
                Unable to load submissions
              </p>

              <p className="mt-1 text-red-200/80">
                {error}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setError("")
              }
            >
              <X size={17} />
            </button>
          </div>
        )}

        {/* STATS */}

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-[#071426] p-5">
            <Users
              size={21}
              className="text-cyan-300"
            />

            <p className="mt-4 text-xs font-bold uppercase tracking-wider text-slate-500">
              Submitted
            </p>

            <p className="mt-1 text-2xl font-bold">
              {submissions.length}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#071426] p-5">
            <CheckCircle2
              size={21}
              className="text-emerald-300"
            />

            <p className="mt-4 text-xs font-bold uppercase tracking-wider text-slate-500">
              Graded
            </p>

            <p className="mt-1 text-2xl font-bold">
              {gradedCount}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#071426] p-5">
            <Clock3
              size={21}
              className="text-blue-300"
            />

            <p className="mt-4 text-xs font-bold uppercase tracking-wider text-slate-500">
              Waiting for Grade
            </p>

            <p className="mt-1 text-2xl font-bold">
              {submissions.length -
                gradedCount}
            </p>
          </div>
        </div>

        {/* LOADING */}

        {loading && (
          <div className="flex min-h-[350px] items-center justify-center rounded-2xl border border-white/10 bg-[#071426]">
            <div className="text-center">
              <Loader2
                size={34}
                className="mx-auto animate-spin text-cyan-400"
              />

              <p className="mt-4 text-sm font-semibold">
                Loading student submissions...
              </p>
            </div>
          </div>
        )}

        {/* EMPTY */}

        {!loading &&
          !error &&
          submissions.length === 0 && (
            <div className="rounded-2xl border border-white/10 bg-[#071426] px-6 py-16 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-400/5 text-cyan-300">
                <Users size={28} />
              </div>

              <h2 className="mt-5 text-xl font-bold">
                No submissions yet
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">
                Students who complete and submit
                this assignment will appear here.
              </p>
            </div>
          )}

        {/* SUBMISSIONS */}

        {!loading &&
          submissions.length > 0 && (
            <div className="space-y-4">
              {submissions.map(
                (
                  submission,
                  index
                ) => {
                  const submissionId =
                    getSubmissionId(
                      submission
                    );

                  const studentName =
                    getStudentName(
                      submission
                    );

                  const studentReference =
                    getStudentReference(
                      submission
                    );

                  const score =
                    getScore(
                      submission
                    );

                  const status =
                    getStatus(
                      submission
                    );

                  return (
                    <article
                      key={
                        submissionId ||
                        `${studentReference}-${index}`
                      }
                      className="rounded-2xl border border-white/10 bg-[#071426] p-5 transition hover:border-cyan-400/20 sm:p-6"
                    >
                      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex min-w-0 items-start gap-4">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/5 text-cyan-300">
                            <User size={21} />
                          </div>

                          <div className="min-w-0">
                            <h2 className="break-words text-lg font-bold text-white">
                              {studentName}
                            </h2>

                            {studentReference && (
                              <p className="mt-1 text-xs text-slate-500">
                                Reference:{" "}
                                {
                                  studentReference
                                }
                              </p>
                            )}

                            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500">
                              <span className="inline-flex items-center gap-1.5">
                                <Clock3
                                  size={14}
                                />
                                Submitted{" "}
                                {formatDate(
                                  getSubmissionDate(
                                    submission
                                  )
                                )}
                              </span>

                              <span className="inline-flex items-center gap-1.5">
                                <FileText
                                  size={14}
                                />
                                Submission{" "}
                                {index + 1}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                          <span
                            className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold ${
                              status.toLowerCase() ===
                              "graded"
                                ? "border-emerald-400/20 bg-emerald-400/5 text-emerald-300"
                                : "border-amber-400/20 bg-amber-400/5 text-amber-300"
                            }`}
                          >
                            <CheckCircle2
                              size={14}
                            />
                            {status}
                          </span>

                          {score !==
                            null && (
                            <span className="rounded-xl border border-white/10 bg-[#020b18] px-3 py-2 text-sm font-bold text-white">
                              Score:{" "}
                              {score}
                            </span>
                          )}

                          <button
                            type="button"
                            onClick={() =>
                              openGradePage(
                                submission
                              )
                            }
                            disabled={
                              !submissionId
                            }
                            className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 text-sm font-bold text-[#020617] transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <Eye size={17} />
                            {status.toLowerCase() ===
                            "graded"
                              ? "Review Grade"
                              : "Grade"}
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                }
              )}
            </div>
          )}
      </div>
    </div>
  );
}