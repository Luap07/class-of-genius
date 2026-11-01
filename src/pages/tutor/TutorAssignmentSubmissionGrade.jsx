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
  CheckCircle2,
  Loader2,
  Save,
  User,
  MessageSquare,
  AlertCircle,
  X,
  FileText,
  Download,
  ExternalLink,
  CalendarDays,
  BookOpen,
  Paperclip,
} from "lucide-react";

const API_BASE_URL = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000"
).replace(/\/$/, "");

// IMPORTANT: This is the ASSIGNMENT submission API.
// Do not replace it with the task-submissions endpoint.
const ASSIGNMENTS_URL =
  `${API_BASE_URL}/api/academy/tutor/assignments`;

/* =========================================================
   HELPERS
========================================================= */

function clean(value) {
  if (value === undefined || value === null) {
    return "";
  }

  return String(value).trim();
}

function parseJSON(value, fallback = null) {
  if (value && typeof value === "object") {
    return value;
  }

  if (typeof value !== "string") {
    return fallback;
  }

  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function firstValue(...values) {
  for (const value of values) {
    if (
      value !== undefined &&
      value !== null &&
      clean(value) !== ""
    ) {
      return value;
    }
  }

  return "";
}

/* =========================================================
   ACADEMY SESSION

   Only SQA-prefixed tutor references are accepted.
========================================================= */

const SESSION_KEYS = [
  "scholiqen_academy_user",
  "academy_user",
  "academyTutor",
  "tutor",
  "scholiqen_user",
  "user",
];

const TOKEN_KEYS = [
  "scholiqen_academy_token",
  "academy_token",
  "scholiqen_token",
  "access_token",
  "token",
];

function findSQAReference(value, depth = 0) {
  if (
    value === null ||
    value === undefined ||
    depth > 7
  ) {
    return "";
  }

  if (typeof value === "string") {
    const candidate = value.trim();

    if (/^SQA-[A-Z0-9-]+$/i.test(candidate)) {
      return candidate;
    }

    const parsed = parseJSON(candidate);

    if (parsed) {
      return findSQAReference(parsed, depth + 1);
    }

    return "";
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findSQAReference(
        item,
        depth + 1
      );

      if (found) return found;
    }

    return "";
  }

  if (typeof value === "object") {
    const preferredKeys = [
      "reference",
      "tutorReference",
      "tutor_reference",
      "applicationReference",
      "application_reference",
      "academyReference",
      "academy_reference",
      "tutor",
      "academyTutor",
      "user",
      "data",
      "profile",
      "session",
    ];

    for (const key of preferredKeys) {
      if (
        Object.prototype.hasOwnProperty.call(
          value,
          key
        )
      ) {
        const found = findSQAReference(
          value[key],
          depth + 1
        );

        if (found) return found;
      }
    }

    for (const [key, child] of Object.entries(value)) {
      if (
        /reference/i.test(key) &&
        typeof child === "string" &&
        /^SQA-[A-Z0-9-]+$/i.test(child.trim())
      ) {
        return child.trim();
      }
    }
  }

  return "";
}

function getTutorReference() {
  if (typeof window === "undefined") {
    return "";
  }

  for (const key of SESSION_KEYS) {
    try {
      const raw = localStorage.getItem(key);

      if (!raw) continue;

      const parsed = parseJSON(raw, raw);

      const reference = findSQAReference(parsed);

      if (reference) return reference;
    } catch {
      // Continue checking other session keys.
    }
  }

  try {
    for (
      let index = 0;
      index < localStorage.length;
      index++
    ) {
      const key = localStorage.key(index);

      if (
        !key ||
        !/academy|tutor|scholiqen_user/i.test(key)
      ) {
        continue;
      }

      const raw = localStorage.getItem(key);

      if (!raw) continue;

      const parsed = parseJSON(raw, raw);

      const reference = findSQAReference(parsed);

      if (reference) return reference;
    }
  } catch {
    // Ignore local storage inspection errors.
  }

  return "";
}

function getAcademyToken() {
  if (typeof window === "undefined") {
    return "";
  }

  for (const key of TOKEN_KEYS) {
    try {
      const value = clean(
        localStorage.getItem(key)
      );

      if (!value) continue;

      const parsed = parseJSON(value);

      if (parsed && typeof parsed === "object") {
        const token = firstValue(
          parsed.token,
          parsed.accessToken,
          parsed.access_token,
          parsed.academyToken
        );

        if (token) {
          return clean(token).replace(
            /^Bearer\s+/i,
            ""
          );
        }
      }

      if (
        value.length > 20 &&
        !value.startsWith("{") &&
        !value.startsWith("[")
      ) {
        return value.replace(/^Bearer\s+/i, "");
      }
    } catch {
      // Continue checking token keys.
    }
  }

  return "";
}

/* =========================================================
   RESPONSE NORMALIZATION
========================================================= */

function unwrapSubmission(data) {
  if (!data) return null;

  if (data.submission) {
    return data.submission;
  }

  if (data.data && !Array.isArray(data.data)) {
    if (data.data.submission) {
      return data.data.submission;
    }

    if (
      data.data.id ||
      data.data.submission_id ||
      data.data.submissionId
    ) {
      return data.data;
    }
  }

  if (
    data.id ||
    data.submission_id ||
    data.submissionId
  ) {
    return data;
  }

  return null;
}

/* =========================================================
   STUDENT RESPONSE
========================================================= */

function getSubmittedText(submission) {
  return clean(
    firstValue(
      submission?.response_text,
      submission?.responseText,
      submission?.student_response,
      submission?.studentResponse,
      submission?.submission_text,
      submission?.submissionText,
      submission?.student_answer,
      submission?.studentAnswer,
      submission?.written_answer,
      submission?.writtenAnswer,
      submission?.answer
    )
  );
}

/* =========================================================
   ANSWER RECORDS

   These are the actual answers saved in
   academy_assignment_answers.
========================================================= */

function getAnswerRecords(submission) {
  const possibleAnswers = firstValue(
    submission?.answers,
    submission?.answerRecords,
    submission?.answer_records,
    submission?.data?.answers,
    submission?.data?.answerRecords
  );

  const parsed = parseJSON(possibleAnswers, []);

  if (Array.isArray(parsed)) {
    return parsed;
  }

  if (parsed && typeof parsed === "object") {
    return Object.values(parsed);
  }

  return [];
}

function getQuestionText(answer, index) {
  return clean(
    firstValue(
      answer?.question_text,
      answer?.questionText,
      answer?.question,
      answer?.question_title,
      answer?.questionTitle,
      answer?.prompt,
      answer?.title,
      `Question ${index + 1}`
    )
  );
}

function getAnswerText(answer) {
  return clean(
    firstValue(
      answer?.student_answer,
      answer?.studentAnswer,
      answer?.answer_text,
      answer?.answerText,
      answer?.answer,
      answer?.response,
      answer?.response_text,
      answer?.responseText,
      answer?.written_answer,
      answer?.writtenAnswer,
      answer?.selected_option,
      answer?.selectedOption
    )
  );
}

/* =========================================================
   ATTACHMENT INFORMATION
========================================================= */

function getSubmissionFileInfo(submission) {
  if (!submission) return null;

  const fileUrl = firstValue(
    submission.submissionFileUrl,
    submission.submission_file_url,
    submission.file_url,
    submission.fileUrl,
    submission.attachment_url,
    submission.attachmentUrl
  );

  const fileName = firstValue(
    submission.fileName,
    submission.file_name,
    submission.attachmentName,
    submission.attachment_name,
    submission.original_filename,
    submission.originalFilename,
    submission.filename,
    "Student submission"
  );

  const hasAttachment =
    Boolean(fileUrl) ||
    Boolean(submission.hasAttachment) ||
    Boolean(submission.has_attachment) ||
    Boolean(submission.attachment_path) ||
    Boolean(submission.file_path) ||
    Boolean(submission.document_path);

  if (!hasAttachment) return null;

  return {
    url: clean(fileUrl),
    name: clean(fileName),
  };
}

/* =========================================================
   STUDENT INFORMATION
========================================================= */

function getStudentName(submission) {
  return clean(
    firstValue(
      submission?.student_name,
      submission?.studentName,
      submission?.student?.name,
      submission?.student?.full_name,
      submission?.student?.fullName,
      submission?.name
    )
  ) || "Student";
}

function getStudentEmail(submission) {
  return clean(
    firstValue(
      submission?.student_email,
      submission?.studentEmail,
      submission?.student?.email,
      submission?.email
    )
  );
}

function getStudentClass(submission) {
  return clean(
    firstValue(
      submission?.student_class,
      submission?.studentClass,
      submission?.class_name,
      submission?.className,
      submission?.class,
      submission?.student?.class_name,
      submission?.student?.class
    )
  );
}

function getAssignmentTitle(submission) {
  return clean(
    firstValue(
      submission?.assignment_title,
      submission?.assignmentTitle,
      submission?.title,
      submission?.assignment?.title
    )
  ) || "Submitted Assignment";
}

function getSubject(submission) {
  return clean(
    firstValue(
      submission?.subject,
      submission?.assignment_subject,
      submission?.assignmentSubject,
      submission?.assignment?.subject
    )
  );
}

function getSubmissionDate(submission) {
  const value = firstValue(
    submission?.submitted_at,
    submission?.submittedAt,
    submission?.created_at,
    submission?.createdAt
  );

  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return clean(value);
  }

  return date.toLocaleString();
}

/* =========================================================
   COMPONENT
========================================================= */

export default function TutorAssignmentSubmissionGrade() {
  const navigate = useNavigate();

  const {
    id,
    submissionId,
  } = useParams();

  const [submission, setSubmission] = useState(null);

  const [tutorReference, setTutorReference] =
    useState("");

  const [score, setScore] = useState("0");

  const [maxScore, setMaxScore] = useState("100");

  const [feedback, setFeedback] = useState("");

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [fileLoading, setFileLoading] = useState(false);

  const [fileError, setFileError] = useState("");

  const [fileObjectUrl, setFileObjectUrl] =
    useState("");

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  /* =======================================================
     SESSION
  ======================================================= */

  const refreshSession = useCallback(() => {
    const reference = getTutorReference();
    const token = getAcademyToken();

    setTutorReference(reference);

    return {
      reference,
      token,
    };
  }, []);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  /* =======================================================
     REQUEST HEADERS
  ======================================================= */

  const getRequestHeaders = useCallback(
    (reference, token, json = false) => {
      const headers = {
        Accept: "application/json",
        "x-tutor-reference": reference,
        "x-tutor-ref": reference,
        "x-academy-tutor-reference": reference,
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      if (json) {
        headers["Content-Type"] = "application/json";
      }

      return headers;
    },
    []
  );

  /* =======================================================
     LOAD ASSIGNMENT SUBMISSION
  ======================================================= */

  const loadSubmission = useCallback(async () => {
    if (!submissionId) {
      setError("Submission ID is missing.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const session = refreshSession();

      const reference = session.reference;
      const token = session.token;

      if (!reference) {
        throw new Error(
          "A valid SQA tutor reference could not be found. Please sign in again using your tutor account."
        );
      }

      const params = new URLSearchParams();

      params.set("reference", reference);
      params.set("tutorReference", reference);
      params.set("tutor_reference", reference);

      if (id) {
        params.set("assignmentId", id);
        params.set("assignment_id", id);
      }

      // Correct assignment submission endpoint.
      const endpoint =
        `${ASSIGNMENTS_URL}/submissions/${encodeURIComponent(
          submissionId
        )}?${params.toString()}`;

      console.log("Loading assignment submission:", {
        submissionId,
        assignmentId: id,
        tutorReference: reference,
        endpoint,
      });

      const response = await fetch(endpoint, {
        method: "GET",
        headers: getRequestHeaders(reference, token),
        credentials: "include",
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.details ||
          data?.message ||
          data?.error ||
          `Unable to load assignment submission. Server returned ${response.status}.`
        );
      }

      if (data?.success === false) {
        throw new Error(
          data?.message ||
          data?.error ||
          "The server could not load this submission."
        );
      }

      const found = unwrapSubmission(data);

      if (!found) {
        console.error(
          "Invalid assignment submission response:",
          data
        );

        throw new Error(
          "The server did not return a valid assignment submission record."
        );
      }

      setSubmission(found);

      setScore(
        String(
          firstValue(
            found.score,
            found.marks_awarded,
            found.marksAwarded,
            0
          )
        )
      );

      setMaxScore(
        String(
          firstValue(
            found.max_score,
            found.maxScore,
            found.total_marks,
            found.totalMarks,
            100
          )
        )
      );

      setFeedback(
        clean(
          firstValue(
            found.feedback,
            found.tutor_feedback,
            found.tutorFeedback
          )
        )
      );

      console.log("Assignment submission loaded:", {
        id: found.id,
        assignmentId: found.assignment_id,
        answerRecords: getAnswerRecords(found).length,
        hasWrittenResponse: Boolean(getSubmittedText(found)),
        hasAttachment: Boolean(getSubmissionFileInfo(found)),
      });
    } catch (err) {
      console.error("Load assignment submission error:", err);

      setSubmission(null);

      setError(
        err?.message ||
        "Unable to load the student's assignment submission."
      );
    } finally {
      setLoading(false);
    }
  }, [
    submissionId,
    id,
    refreshSession,
    getRequestHeaders,
  ]);

  useEffect(() => {
    loadSubmission();
  }, [loadSubmission]);

  /* =======================================================
     NORMALIZED DATA
  ======================================================= */

  const submittedText = useMemo(
    () => getSubmittedText(submission),
    [submission]
  );

  const answerRecords = useMemo(
    () => getAnswerRecords(submission),
    [submission]
  );

  const submittedFile = useMemo(
    () => getSubmissionFileInfo(submission),
    [submission]
  );

  const studentName = useMemo(
    () => getStudentName(submission),
    [submission]
  );

  const studentEmail = useMemo(
    () => getStudentEmail(submission),
    [submission]
  );

  const studentClass = useMemo(
    () => getStudentClass(submission),
    [submission]
  );

  const assignmentTitle = useMemo(
    () => getAssignmentTitle(submission),
    [submission]
  );

  const subject = useMemo(
    () => getSubject(submission),
    [submission]
  );

  const submittedAt = useMemo(
    () => getSubmissionDate(submission),
    [submission]
  );

  const numericScore = Math.max(
    0,
    Number(score) || 0
  );

  const numericMaxScore = Math.max(
    0,
    Number(maxScore) || 0
  );

  const percentage =
    numericMaxScore > 0
      ? (
          numericScore /
          numericMaxScore *
          100
        ).toFixed(1)
      : "0.0";

  /* =======================================================
     LOAD SUBMITTED FILE

     The backend file route is protected.
     Fetch with tutor authentication instead of using
     a plain anchor that cannot send the required headers.
  ======================================================= */

  const loadSubmittedFile = useCallback(async () => {
    if (!submissionId || !submittedFile) {
      return;
    }

    setFileLoading(true);
    setFileError("");

    try {
      const session = refreshSession();

      if (!session.reference) {
        throw new Error(
          "Your tutor session is not available."
        );
      }

      const params = new URLSearchParams();

      params.set("reference", session.reference);
      params.set("tutorReference", session.reference);
      params.set("tutor_reference", session.reference);

      const endpoint =
        `${ASSIGNMENTS_URL}/submissions/${encodeURIComponent(
          submissionId
        )}/file?${params.toString()}`;

      const response = await fetch(endpoint, {
        method: "GET",
        headers: getRequestHeaders(
          session.reference,
          session.token
        ),
        credentials: "include",
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);

        throw new Error(
          data?.details ||
          data?.message ||
          data?.error ||
          `Unable to retrieve the submitted file. Server returned ${response.status}.`
        );
      }

      const blob = await response.blob();

      if (!blob || blob.size === 0) {
        throw new Error(
          "The submitted file is empty or unavailable."
        );
      }

      const newUrl = URL.createObjectURL(blob);

      setFileObjectUrl((previousUrl) => {
        if (previousUrl) {
          URL.revokeObjectURL(previousUrl);
        }

        return newUrl;
      });
    } catch (err) {
      console.error("Submitted file error:", err);

      setFileError(
        err?.message ||
        "Unable to open the student's uploaded file."
      );
    } finally {
      setFileLoading(false);
    }
  }, [
    submissionId,
    submittedFile,
    refreshSession,
    getRequestHeaders,
  ]);

  useEffect(() => {
    if (submittedFile) {
      loadSubmittedFile();
    }

    return () => {
      setFileObjectUrl((previousUrl) => {
        if (previousUrl) {
          URL.revokeObjectURL(previousUrl);
        }

        return "";
      });
    };
  }, [loadSubmittedFile, submittedFile]);

  /* =======================================================
     SAVE GRADE

     Assignment backend:
     PATCH /submissions/:submissionId/grade

     Expected fields:
     score, feedback, max_score
  ======================================================= */

  const saveGrade = useCallback(async () => {
    if (!submissionId || !submission) {
      setError(
        "Cannot save because the assignment submission has not loaded."
      );
      return;
    }

    const finalScore = Number(score);
    const finalMaxScore = Number(maxScore);

    if (
      !Number.isFinite(finalScore) ||
      !Number.isFinite(finalMaxScore) ||
      finalMaxScore <= 0 ||
      finalScore < 0 ||
      finalScore > finalMaxScore
    ) {
      setError(
        "Enter a valid score. The score cannot exceed the maximum mark."
      );
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const session = refreshSession();

      if (!session.reference) {
        throw new Error(
          "A valid SQA tutor reference is required to save this grade. Please sign in again."
        );
      }

      const params = new URLSearchParams();

      params.set("reference", session.reference);
      params.set("tutorReference", session.reference);
      params.set("tutor_reference", session.reference);

      // Correct assignment grading endpoint.
      const endpoint =
        `${ASSIGNMENTS_URL}/submissions/${encodeURIComponent(
          submissionId
        )}/grade?${params.toString()}`;

      const response = await fetch(endpoint, {
        method: "PATCH",
        headers: getRequestHeaders(
          session.reference,
          session.token,
          true
        ),
        credentials: "include",
        body: JSON.stringify({
          reference: session.reference,
          tutorReference: session.reference,
          tutor_reference: session.reference,
          score: finalScore,
          max_score: finalMaxScore,
          feedback: feedback.trim(),
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.details ||
          data?.message ||
          data?.error ||
          `Unable to save grade. Server returned ${response.status}.`
        );
      }

      if (data?.success === false) {
        throw new Error(
          data?.message ||
          data?.error ||
          "The server could not save the grade."
        );
      }

      setSubmission((current) => ({
        ...current,
        score: finalScore,
        max_score: finalMaxScore,
        feedback: feedback.trim(),
        status: "graded",
      }));

      setSuccess(
        data?.message ||
        "Grade and feedback saved successfully."
      );
    } catch (err) {
      console.error("Save assignment grade error:", err);

      setError(
        err?.message ||
        "Unable to save the assignment grade."
      );
    } finally {
      setSaving(false);
    }
  }, [
    submissionId,
    submission,
    score,
    maxScore,
    feedback,
    refreshSession,
    getRequestHeaders,
  ]);

  /* =======================================================
     FILE ACTIONS
  ======================================================= */

  const openSubmittedFile = () => {
    if (!fileObjectUrl) return;

    window.open(
      fileObjectUrl,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const downloadSubmittedFile = () => {
    if (!fileObjectUrl || !submittedFile) return;

    const link = document.createElement("a");

    link.href = fileObjectUrl;
    link.download = submittedFile.name || "student-submission";

    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  /* =======================================================
     LOADING SCREEN
  ======================================================= */

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] text-white">
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <Loader2
              size={36}
              className="mx-auto animate-spin text-cyan-400"
            />

            <p className="mt-4 text-sm font-semibold">
              Loading student's assignment submission...
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* =======================================================
     ERROR SCREEN
  ======================================================= */

  if (!submission) {
    return (
      <div className="min-h-screen bg-[#020617] px-4 py-10 text-white">
        <div className="mx-auto max-w-2xl rounded-2xl border border-white/10 bg-[#071426] p-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-300 hover:text-white"
          >
            <ArrowLeft size={17} />
            Back to Submissions
          </button>

          <div className="flex items-start gap-3 rounded-xl border border-red-400/20 bg-red-500/10 p-4 text-red-200">
            <AlertCircle
              size={20}
              className="mt-0.5 shrink-0"
            />

            <div>
              <p className="font-semibold">
                Unable to load assignment submission
              </p>

              <p className="mt-1 text-sm">
                {error ||
                  "The student's submitted work could not be found."}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={loadSubmission}
            className="mt-5 rounded-xl bg-cyan-500 px-5 py-3 text-sm font-bold text-[#020617] hover:bg-cyan-400"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  /* =======================================================
     MAIN PAGE
  ======================================================= */

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">

        {/* BACK */}

        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-6 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-[#071426] px-4 py-2.5 text-sm font-semibold text-slate-300 hover:border-cyan-400/30 hover:text-white"
        >
          <ArrowLeft size={17} />
          Back to Submissions
        </button>

        {/* HEADER */}

        <div className="mb-6 rounded-2xl border border-white/10 bg-[#071426] p-5 sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
                  <User size={21} />
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Academy Assignment Submission
                  </p>

                  <h1 className="text-2xl font-bold text-white">
                    {studentName}
                  </h1>
                </div>
              </div>

              <p className="mt-3 text-sm text-slate-400">
                {assignmentTitle}
              </p>

              <p className="mt-2 text-xs text-slate-500">
                Submission ID: {submission.id || submissionId}
              </p>
            </div>

            <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/5 px-5 py-4">
              <p className="text-xs font-bold uppercase tracking-wider text-cyan-300">
                Current Score
              </p>

              <p className="mt-1 text-2xl font-bold text-white">
                {numericScore} / {numericMaxScore}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                {percentage}%
              </p>
            </div>
          </div>
        </div>

        {/* ALERTS */}

        {error && (
          <div className="mb-5 flex items-start gap-3 rounded-2xl border border-red-400/20 bg-red-500/10 p-4 text-red-200">
            <AlertCircle
              size={19}
              className="mt-0.5 shrink-0"
            />

            <div className="flex-1">
              <p className="font-semibold">
                Something went wrong
              </p>

              <p className="mt-1 text-sm text-red-200/80">
                {error}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setError("")}
              aria-label="Close error"
            >
              <X size={17} />
            </button>
          </div>
        )}

        {success && (
          <div className="mb-5 flex items-center gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4 text-sm text-emerald-200">
            <CheckCircle2 size={19} />
            {success}
          </div>
        )}

        {/* STUDENT INFORMATION */}

        <section className="mb-6 rounded-2xl border border-white/10 bg-[#071426] p-5 sm:p-6">
          <h2 className="mb-4 font-bold text-white">
            Student Information
          </h2>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <p className="text-xs text-slate-500">
                Student Name
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-200">
                {studentName}
              </p>
            </div>

            {studentEmail && (
              <div>
                <p className="text-xs text-slate-500">
                  Email Address
                </p>

                <p className="mt-1 break-all text-sm font-semibold text-slate-200">
                  {studentEmail}
                </p>
              </div>
            )}

            {studentClass && (
              <div>
                <p className="text-xs text-slate-500">
                  Class
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-200">
                  {studentClass}
                </p>
              </div>
            )}

            {subject && (
              <div>
                <p className="text-xs text-slate-500">
                  Subject
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-200">
                  {subject}
                </p>
              </div>
            )}

            {submittedAt && (
              <div>
                <p className="text-xs text-slate-500">
                  Submitted At
                </p>

                <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-slate-200">
                  <CalendarDays
                    size={15}
                    className="text-cyan-300"
                  />
                  {submittedAt}
                </p>
              </div>
            )}

            <div>
              <p className="text-xs text-slate-500">
                Submission Status
              </p>

              <p className="mt-1 text-sm font-semibold capitalize text-cyan-300">
                {clean(submission.status) || "Submitted"}
              </p>
            </div>
          </div>
        </section>

        {/* ACTUAL STUDENT WORK */}

        <section className="mb-6 rounded-2xl border border-cyan-400/20 bg-[#071426] p-5 sm:p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
              <FileText size={20} />
            </div>

            <div>
              <h2 className="font-bold text-white">
                Student's Submitted Work
              </h2>

              <p className="text-xs text-slate-500">
                Actual work retrieved from the assignment submission
              </p>
            </div>
          </div>

          {/* WRITTEN RESPONSE */}

          <div>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
              Written Response
            </h3>

            {submittedText ? (
              <div className="rounded-xl border border-white/10 bg-[#020b18] p-5">
                <p className="whitespace-pre-wrap break-words text-sm leading-7 text-slate-200">
                  {submittedText}
                </p>
              </div>
            ) : (
              <div className="rounded-xl border border-white/10 bg-[#020b18] p-5">
                <p className="text-sm text-slate-500">
                  No general written response was included in this submission.
                </p>
              </div>
            )}
          </div>

          {/* QUESTION ANSWERS */}

          <div className="mt-6">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Submitted Answers
              </h3>

              <span className="rounded-lg bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-300">
                {answerRecords.length} answer(s)
              </span>
            </div>

            {answerRecords.length > 0 ? (
              <div className="space-y-4">
                {answerRecords.map((answer, index) => (
                  <div
                    key={
                      answer.id ||
                      answer.answer_id ||
                      answer.question_id ||
                      index
                    }
                    className="rounded-xl border border-white/10 bg-[#020b18] p-5"
                  >
                    <p className="mb-3 text-xs font-bold uppercase tracking-wider text-cyan-300">
                      {getQuestionText(answer, index)}
                    </p>

                    <div className="rounded-lg border border-white/5 bg-[#071426] p-4">
                      <p className="whitespace-pre-wrap break-words text-sm leading-7 text-slate-200">
                        {getAnswerText(answer) ||
                          "No answer was recorded for this question."}
                      </p>
                    </div>

                    {answer.is_correct !== undefined && (
                      <p className="mt-3 text-xs text-slate-400">
                        Answer status:{" "}
                        <span
                          className={
                            answer.is_correct
                              ? "font-semibold text-emerald-300"
                              : "font-semibold text-amber-300"
                          }
                        >
                          {answer.is_correct
                            ? "Correct"
                            : "Not correct"}
                        </span>
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="rounded-xl border border-white/10 bg-[#020b18] p-4 text-sm text-slate-500">
                No individual question-answer records were returned for this submission.
              </p>
            )}
          </div>

          {/* UPLOADED FILE */}

          <div className="mt-6">
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
              Uploaded Attachment
            </h3>

            {submittedFile ? (
              <div className="rounded-xl border border-white/10 bg-[#020b18] p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-center gap-3">
                    <Paperclip
                      size={22}
                      className="shrink-0 text-cyan-300"
                    />

                    <div className="min-w-0">
                      <p className="break-all text-sm font-semibold text-slate-200">
                        {submittedFile.name}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Student's uploaded assignment file
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={openSubmittedFile}
                      disabled={!fileObjectUrl}
                      className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-slate-300 hover:border-cyan-400/30 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <ExternalLink size={14} />
                      Open
                    </button>

                    <button
                      type="button"
                      onClick={downloadSubmittedFile}
                      disabled={!fileObjectUrl}
                      className="inline-flex items-center gap-2 rounded-lg bg-cyan-500/10 px-3 py-2 text-xs font-semibold text-cyan-300 hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Download size={14} />
                      Download
                    </button>
                  </div>
                </div>

                {fileLoading && (
                  <p className="mt-4 flex items-center gap-2 text-xs text-cyan-300">
                    <Loader2
                      size={15}
                      className="animate-spin"
                    />
                    Retrieving submitted file...
                  </p>
                )}

                {fileError && (
                  <div className="mt-4 rounded-lg border border-red-400/20 bg-red-500/10 p-3 text-xs text-red-200">
                    {fileError}

                    <button
                      type="button"
                      onClick={loadSubmittedFile}
                      className="ml-2 font-bold underline"
                    >
                      Retry
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <p className="rounded-xl border border-white/10 bg-[#020b18] p-4 text-sm text-slate-500">
                No uploaded file was recorded for this submission.
              </p>
            )}
          </div>
        </section>

        {/* GRADING */}

        <section className="rounded-2xl border border-white/10 bg-[#071426] p-5 sm:p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
              <BookOpen size={20} />
            </div>

            <div>
              <h2 className="font-bold text-white">
                Grade Student Submission
              </h2>

              <p className="text-xs text-slate-500">
                Award marks and provide feedback on the submitted work.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-400">
                Maximum Mark
              </label>

              <input
                type="number"
                min="1"
                step="0.5"
                value={maxScore}
                onChange={(event) =>
                  setMaxScore(event.target.value)
                }
                className="w-full rounded-xl border border-white/10 bg-[#020b18] px-4 py-3 text-sm font-semibold text-white outline-none focus:border-cyan-400/50"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-400">
                Student's Score
              </label>

              <input
                type="number"
                min="0"
                max={maxScore}
                step="0.5"
                value={score}
                onChange={(event) =>
                  setScore(event.target.value)
                }
                className="w-full rounded-xl border border-cyan-400/20 bg-[#020b18] px-4 py-3 text-sm font-bold text-white outline-none focus:border-cyan-400/50"
              />

              <p className="mt-2 text-xs text-slate-500">
                Percentage: {percentage}%
              </p>
            </div>
          </div>

          {/* FEEDBACK */}

          <div className="mt-6">
            <div className="mb-3 flex items-center gap-2">
              <MessageSquare
                size={18}
                className="text-cyan-300"
              />

              <label className="font-bold text-white">
                Feedback for Student
              </label>
            </div>

            <textarea
              rows={5}
              value={feedback}
              onChange={(event) =>
                setFeedback(event.target.value)
              }
              placeholder="Write feedback about the student's submitted assignment..."
              className="w-full resize-y rounded-xl border border-white/10 bg-[#020b18] px-4 py-3 text-sm leading-6 text-white outline-none focus:border-cyan-400/50"
            />
          </div>
        </section>

        {/* ACTIONS */}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 px-6 py-3 text-sm font-semibold text-slate-300 hover:bg-white/5 hover:text-white"
          >
            <ArrowLeft size={17} />
            Back
          </button>

          <button
            type="button"
            onClick={saveGrade}
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-7 py-3 text-sm font-bold text-[#020617] hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <>
                <Loader2
                  size={17}
                  className="animate-spin"
                />
                Saving Grade...
              </>
            ) : (
              <>
                <Save size={17} />
                Save Grade
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
