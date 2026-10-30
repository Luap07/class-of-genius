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
} from "lucide-react";

const API_BASE_URL = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000"
).replace(/\/$/, "");

const SUBMISSIONS_URL =
  `${API_BASE_URL}/api/academy/tutor/task-submissions`;

/* =========================================================
   HELPERS
========================================================= */

function clean(value) {
  if (
    value === undefined ||
    value === null
  ) {
    return "";
  }

  return String(value).trim();
}

function parseJSON(value, fallback = []) {
  if (Array.isArray(value)) {
    return value;
  }

  if (
    value &&
    typeof value === "object"
  ) {
    return value;
  }

  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return fallback;
    }
  }

  return fallback;
}

/* =========================================================
   TUTOR REFERENCE

   Only accept the official SQA reference.
========================================================= */

function getTutorReference() {
  const keys = [
    "scholiqen_academy_user",
    "scholiqen_academy_token",
    "academy_user",
    "scholiqen_user",
    "user",
  ];

  for (const key of keys) {
    try {
      const raw = localStorage.getItem(key);

      if (!raw) continue;

      const parsed = JSON.parse(raw);

      const references = [
        parsed?.reference,
        parsed?.tutorReference,
        parsed?.tutor_reference,

        parsed?.user?.reference,
        parsed?.user?.tutorReference,
        parsed?.user?.tutor_reference,

        parsed?.tutor?.reference,
        parsed?.tutor?.tutorReference,
        parsed?.tutor?.tutor_reference,

        parsed?.user?.tutor?.reference,
        parsed?.user?.tutor?.tutorReference,
        parsed?.user?.tutor?.tutor_reference,
      ];

      const found = references.find(
        (value) =>
          typeof value === "string" &&
          /^SQA-/i.test(value.trim())
      );

      if (found) {
        return found.trim();
      }
    } catch {
      // Continue checking other keys.
    }
  }

  return "";
}

/* =========================================================
   RESPONSE NORMALIZATION
========================================================= */

function unwrapSubmission(data) {
  if (!data) {
    return null;
  }

  if (data.submission) {
    return data.submission;
  }

  if (
    data.data &&
    !Array.isArray(data.data)
  ) {
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
   ANSWERS
========================================================= */

function getAnswerList(submission) {
  const answers = parseJSON(
    submission?.answers ??
      submission?.answer_details ??
      submission?.answerDetails ??
      submission?.responses ??
      submission?.response ??
      [],
    []
  );

  if (Array.isArray(answers)) {
    return answers;
  }

  if (
    typeof answers === "object" &&
    answers !== null
  ) {
    return Object.entries(answers).map(
      ([questionId, answer]) => ({
        question_id: questionId,
        student_answer: answer,
      })
    );
  }

  return [];
}

function getQuestionText(answer) {
  return (
    clean(answer?.question) ||
    clean(answer?.question_text) ||
    clean(answer?.questionText) ||
    clean(answer?.text) ||
    "Question"
  );
}

function getStudentAnswer(answer) {
  return (
    clean(answer?.student_answer) ||
    clean(answer?.studentAnswer) ||
    clean(answer?.answer) ||
    clean(answer?.response) ||
    ""
  );
}

function getCorrectAnswer(answer) {
  return (
    clean(answer?.correct_answer) ||
    clean(answer?.correctAnswer) ||
    clean(answer?.expected_answer) ||
    ""
  );
}

function getMaximumMark(answer, submission) {
  const value =
    answer?.marks ??
    answer?.max_marks ??
    answer?.maxMarks ??
    answer?.points ??
    submission?.max_score ??
    submission?.maxScore ??
    1;

  return Math.max(
    0,
    Number(value) || 1
  );
}

function getExistingMark(answer) {
  const value =
    answer?.earned_marks ??
    answer?.earnedMarks ??
    answer?.score ??
    answer?.marks_awarded ??
    answer?.marksAwarded;

  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return "";
  }

  return String(value);
}

/* =========================================================
   STUDENT DETAILS
========================================================= */

function getStudentName(submission) {
  return (
    clean(submission?.student_name) ||
    clean(submission?.studentName) ||
    clean(submission?.student?.name) ||
    clean(submission?.student?.full_name) ||
    clean(submission?.student?.fullName) ||
    clean(submission?.name) ||
    "Student"
  );
}

/* =========================================================
   SUBMITTED FILES
========================================================= */

function getSubmittedFiles(submission) {
  const possibleFiles = parseJSON(
    submission?.files ??
      submission?.attachments ??
      submission?.submitted_files ??
      submission?.submittedFiles ??
      [],
    []
  );

  let files = [];

  if (Array.isArray(possibleFiles)) {
    files = possibleFiles;
  } else if (
    possibleFiles &&
    typeof possibleFiles === "object"
  ) {
    files = Object.values(possibleFiles);
  }

  const singleFile =
    submission?.file_url ||
    submission?.fileUrl ||
    submission?.attachment_url ||
    submission?.attachmentUrl;

  if (
    singleFile &&
    !files.some(
      (file) =>
        clean(
          file?.url ??
            file?.file_url ??
            file?.fileUrl
        ) === clean(singleFile)
    )
  ) {
    files.push({
      url: singleFile,
      name:
        submission?.file_name ||
        submission?.fileName ||
        "Submitted file",
    });
  }

  return files
    .map((file) => {
      if (typeof file === "string") {
        return {
          url: file,
          name: file.split("/").pop(),
        };
      }

      return {
        url:
          file?.url ||
          file?.file_url ||
          file?.fileUrl ||
          file?.path ||
          file?.file_path ||
          "",

        name:
          file?.name ||
          file?.file_name ||
          file?.fileName ||
          file?.originalname ||
          "Submitted file",
      };
    })
    .filter((file) => file.url);
}

function getFileUrl(url) {
  const value = clean(url);

  if (!value) return "";

  if (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("blob:")
  ) {
    return value;
  }

  return `${API_BASE_URL}/${value.replace(/^\/+/, "")}`;
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

  const tutorReference = useMemo(
    () => getTutorReference(),
    []
  );

  const [submission, setSubmission] =
    useState(null);

  const [answers, setAnswers] =
    useState([]);

  const [feedback, setFeedback] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  /* =======================================================
     LOAD ONE SUBMISSION

     IMPORTANT:
     This uses the individual submission endpoint,
     not the submissions collection endpoint.
  ======================================================= */

  const loadSubmission = useCallback(
    async () => {
      if (!submissionId) {
        setError("Submission ID is missing.");
        setLoading(false);
        return;
      }

      if (!tutorReference) {
        setError(
          "Your tutor reference could not be found. Please log in again."
        );
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");
      setSuccess("");

      try {
        const params = new URLSearchParams();

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

        if (id) {
          params.set("assignmentId", id);
          params.set("assignment_id", id);
        }

        const endpoint =
          `${SUBMISSIONS_URL}/${encodeURIComponent(
            submissionId
          )}?${params.toString()}`;

        console.log(
          "Loading individual submission:",
          endpoint
        );

        const response = await fetch(endpoint, {
          method: "GET",
          headers: {
            Accept: "application/json",
            "x-tutor-reference": tutorReference,
            "x-tutor-ref": tutorReference,
          },
        });

        let data = null;

        try {
          data = await response.json();
        } catch {
          data = null;
        }

        if (!response.ok) {
          throw new Error(
            data?.details ||
              data?.error ||
              data?.message ||
              `Unable to load submission. Server returned ${response.status}.`
          );
        }

        const found = unwrapSubmission(data);

        if (!found) {
          console.error(
            "Unexpected submission response:",
            data
          );

          throw new Error(
            "The server did not return a valid submission record."
          );
        }

        setSubmission(found);

        let answerList = getAnswerList(found);

        /*
         * Some student submissions are essay/text submissions.
         * They may have submission_text without answer records.
         * Convert that submitted work into a grading item.
         */

        if (
          answerList.length === 0 &&
          clean(
            found?.submission_text ??
              found?.submissionText ??
              found?.student_answer ??
              found?.studentAnswer
          )
        ) {
          answerList = [
            {
              question_id: "submitted-work",
              question: "Student's Submitted Work",

              student_answer:
                found?.submission_text ??
                found?.submissionText ??
                found?.student_answer ??
                found?.studentAnswer,

              marks:
                found?.max_score ??
                found?.maxScore ??
                1,

              earned_marks:
                found?.score ?? "",
            },
          ];
        }

        setAnswers(
          answerList.map((answer) => ({
            ...answer,
            grade: getExistingMark(answer),
          }))
        );

        setFeedback(
          clean(found?.feedback) ||
            clean(found?.tutor_feedback) ||
            clean(found?.tutorFeedback) ||
            ""
        );
      } catch (err) {
        console.error(
          "Load submission error:",
          err
        );

        setSubmission(null);
        setAnswers([]);

        setError(
          err?.message ||
            "Unable to load student's submission."
        );
      } finally {
        setLoading(false);
      }
    },
    [
      submissionId,
      tutorReference,
      id,
    ]
  );

  useEffect(() => {
    loadSubmission();
  }, [loadSubmission]);

  /* =======================================================
     UPDATE GRADE
  ======================================================= */

  const updateGrade = useCallback(
    (index, value) => {
      setAnswers((current) =>
        current.map((answer, answerIndex) =>
          answerIndex === index
            ? {
                ...answer,
                grade: value,
              }
            : answer
        )
      );
    },
    []
  );

  /* =======================================================
     TOTALS
  ======================================================= */

  const totalMarks = answers.reduce(
    (total, answer) =>
      total +
      getMaximumMark(answer, submission),
    0
  );

  const awardedMarks = answers.reduce(
    (total, answer) => {
      const grade = Number(answer.grade) || 0;

      return total + grade;
    },
    0
  );

  const percentage =
    totalMarks > 0
      ? (
          (awardedMarks / totalMarks) *
          100
        ).toFixed(1)
      : "0.0";

  /* =======================================================
     SAVE GRADE
  ======================================================= */

  const saveGrade = useCallback(
    async () => {
      if (!submissionId || !submission) {
        setError(
          "Cannot save because the submission has not loaded."
        );
        return;
      }

      setSaving(true);
      setError("");
      setSuccess("");

      try {
        const response = await fetch(
          `${SUBMISSIONS_URL}/${encodeURIComponent(
            submissionId
          )}/review`,
          {
            method: "PATCH",

            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              "x-tutor-reference": tutorReference,
              "x-tutor-ref": tutorReference,
            },

            body: JSON.stringify({
              reference: tutorReference,
              tutorReference,
              tutor_reference: tutorReference,

              assignmentId: id,
              assignment_id: id,

              submissionId,
              submission_id: submissionId,

              answers: answers.map((answer) => ({
                ...answer,

                earned_marks:
                  Number(answer.grade) || 0,

                marks_awarded:
                  Number(answer.grade) || 0,
              })),

              score: awardedMarks,
              total_marks: totalMarks,
              percentage: Number(percentage),

              feedback: feedback.trim(),

              status: "graded",
            }),
          }
        );

        let data = null;

        try {
          data = await response.json();
        } catch {
          data = null;
        }

        if (!response.ok) {
          throw new Error(
            data?.details ||
              data?.error ||
              data?.message ||
              `Unable to save grade. Server returned ${response.status}.`
          );
        }

        setSuccess(
          data?.message ||
            "Grade saved successfully."
        );
      } catch (err) {
        console.error(
          "Save grade error:",
          err
        );

        setError(
          err?.message ||
            "Unable to save grade."
        );
      } finally {
        setSaving(false);
      }
    },
    [
      submissionId,
      submission,
      tutorReference,
      id,
      answers,
      awardedMarks,
      totalMarks,
      percentage,
      feedback,
    ]
  );

  /* =======================================================
     LOADING
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
              Loading student's submission...
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* =======================================================
     ERROR WITHOUT SUBMISSION
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
                Unable to load submission
              </p>

              <p className="mt-1 text-sm">
                {error ||
                  "The submitted work could not be found."}
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

  const submittedFiles =
    getSubmittedFiles(submission);

  const submittedText =
    clean(
      submission?.submission_text ??
        submission?.submissionText ??
        submission?.student_answer ??
        submission?.studentAnswer
    );

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
                    Grading Submission
                  </p>

                  <h1 className="text-2xl font-bold text-white">
                    {getStudentName(submission)}
                  </h1>
                </div>
              </div>

              <p className="mt-3 text-xs text-slate-500">
                Submission ID: {submissionId}
              </p>
            </div>

            <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/5 px-5 py-4">
              <p className="text-xs font-bold uppercase tracking-wider text-cyan-300">
                Current Score
              </p>

              <p className="mt-1 text-2xl font-bold text-white">
                {awardedMarks} / {totalMarks}
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

        {/* STUDENT'S ACTUAL SUBMITTED WORK */}

        <section className="mb-6 rounded-2xl border border-cyan-400/20 bg-[#071426] p-5 sm:p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
              <FileText size={20} />
            </div>

            <div>
              <h2 className="font-bold text-white">
                Student's Submitted Work
              </h2>

              <p className="text-xs text-slate-500">
                The actual work submitted by the student
              </p>
            </div>
          </div>

          {submittedText ? (
            <div className="rounded-xl border border-white/10 bg-[#020b18] p-5">
              <p className="whitespace-pre-wrap break-words text-sm leading-7 text-slate-200">
                {submittedText}
              </p>
            </div>
          ) : (
            <div className="rounded-xl border border-white/10 bg-[#020b18] p-5">
              <p className="text-sm text-slate-500">
                No written submission was included in this record.
              </p>
            </div>
          )}

          {/* UPLOADED FILES */}

          <div className="mt-5">
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
              Uploaded Attachments
            </h3>

            {submittedFiles.length > 0 ? (
              <div className="space-y-3">
                {submittedFiles.map(
                  (file, index) => {
                    const fileUrl =
                      getFileUrl(file.url);

                    return (
                      <div
                        key={`${file.url}-${index}`}
                        className="flex flex-col gap-3 rounded-xl border border-white/10 bg-[#020b18] p-4 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <FileText
                            size={20}
                            className="shrink-0 text-cyan-300"
                          />

                          <p className="break-all text-sm font-medium text-slate-200">
                            {file.name}
                          </p>
                        </div>

                        <div className="flex shrink-0 gap-2">
                          <a
                            href={fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-slate-300 hover:border-cyan-400/30 hover:text-white"
                          >
                            <ExternalLink size={14} />
                            Open
                          </a>

                          <a
                            href={fileUrl}
                            download
                            className="inline-flex items-center gap-2 rounded-lg bg-cyan-500/10 px-3 py-2 text-xs font-semibold text-cyan-300 hover:bg-cyan-500/20"
                          >
                            <Download size={14} />
                            Download
                          </a>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            ) : (
              <p className="rounded-xl border border-white/10 bg-[#020b18] p-4 text-sm text-slate-500">
                No uploaded files were found.
              </p>
            )}
          </div>
        </section>

        {/* QUESTION ANSWERS */}

        {answers.length > 0 && (
          <section className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-white">
                Answers and Grading
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Review the student's answers and award marks.
              </p>
            </div>

            {answers.map((answer, index) => {
              const maxMarks =
                getMaximumMark(
                  answer,
                  submission
                );

              return (
                <article
                  key={
                    answer?.question_id ??
                    answer?.questionId ??
                    index
                  }
                  className="rounded-2xl border border-white/10 bg-[#071426] p-5 sm:p-6"
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex min-w-0 flex-1 gap-4">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cyan-400/10 text-sm font-bold text-cyan-300">
                        {index + 1}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="text-base font-bold leading-6 text-white">
                          {getQuestionText(answer)}
                        </h3>

                        <div className="mt-4 rounded-xl border border-white/10 bg-[#020b18] p-4">
                          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                            Student Answer
                          </p>

                          <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-200">
                            {getStudentAnswer(answer) ||
                              "No answer provided."}
                          </p>
                        </div>

                        {getCorrectAnswer(answer) && (
                          <div className="mt-3 rounded-xl border border-emerald-400/10 bg-emerald-400/5 p-4">
                            <p className="text-xs font-bold uppercase tracking-wider text-emerald-400/70">
                              Correct Answer
                            </p>

                            <p className="mt-2 text-sm text-emerald-200">
                              {getCorrectAnswer(answer)}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="w-full shrink-0 lg:w-36">
                      <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                        Mark
                      </label>

                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          max={maxMarks}
                          step="0.5"
                          value={answer.grade}
                          onChange={(event) =>
                            updateGrade(
                              index,
                              event.target.value
                            )
                          }
                          className="w-full rounded-xl border border-cyan-400/20 bg-[#020b18] px-4 py-3 pr-14 text-sm font-bold text-white outline-none focus:border-cyan-400/50"
                        />

                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">
                          / {maxMarks}
                        </span>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        )}

        {/* FEEDBACK */}

        <section className="mt-6 rounded-2xl border border-white/10 bg-[#071426] p-5 sm:p-6">
          <div className="mb-3 flex items-center gap-2">
            <MessageSquare
              size={18}
              className="text-cyan-300"
            />

            <h2 className="font-bold">
              Feedback for Student
            </h2>
          </div>

          <textarea
            rows={5}
            value={feedback}
            onChange={(event) =>
              setFeedback(event.target.value)
            }
            placeholder="Write feedback for the student..."
            className="w-full resize-y rounded-xl border border-white/10 bg-[#020b18] px-4 py-3 text-sm leading-6 text-white outline-none focus:border-cyan-400/50"
          />
        </section>

        {/* SAVE */}

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
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-7 py-3 text-sm font-bold text-[#020617] hover:bg-cyan-400 disabled:opacity-60"
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