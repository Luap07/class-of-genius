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
} from "lucide-react";

const API_BASE_URL = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000"
).replace(/\/$/, "");

const SUBMISSIONS_URL =
  `${API_BASE_URL}/api/academy/tutor/task-submissions`;

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

function getAnswerList(
  submission
) {
  const answers =
    submission?.answers ??
    submission?.answer_details ??
    submission?.answerDetails ??
    submission?.response ??
    submission?.responses ??
    [];

  if (Array.isArray(answers)) {
    return answers;
  }

  if (
    typeof answers ===
      "object" &&
    answers !== null
  ) {
    return Object.entries(
      answers
    ).map(
      ([
        questionId,
        answer,
      ]) => ({
        question_id:
          questionId,
        student_answer:
          answer,
      })
    );
  }

  return [];
}

function getQuestionText(
  answer
) {
  return (
    clean(
      answer?.question
    ) ||
    clean(
      answer?.question_text
    ) ||
    clean(
      answer?.questionText
    ) ||
    clean(
      answer?.text
    ) ||
    "Question"
  );
}

function getStudentAnswer(
  answer
) {
  return (
    clean(
      answer?.student_answer
    ) ||
    clean(
      answer?.studentAnswer
    ) ||
    clean(
      answer?.answer
    ) ||
    clean(
      answer?.response
    ) ||
    ""
  );
}

function getCorrectAnswer(
  answer
) {
  return (
    clean(
      answer?.correct_answer
    ) ||
    clean(
      answer?.correctAnswer
    ) ||
    clean(
      answer?.expected_answer
    ) ||
    ""
  );
}

function getMaximumMark(
  answer
) {
  const value =
    answer?.marks ??
    answer?.max_marks ??
    answer?.maxMarks ??
    answer?.points ??
    1;

  return Number(value) || 1;
}

function getExistingMark(
  answer
) {
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

export default function TutorAssignmentSubmissionGrade() {
  const navigate = useNavigate();

  const {
    id,
    submissionId,
  } = useParams();

  const tutorReference =
    useMemo(
      () =>
        getTutorReference(),
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
     LOAD
  ======================================================= */

  const loadSubmission =
    useCallback(
      async () => {
        if (!submissionId) {
          setError(
            "Submission ID is missing."
          );
          setLoading(false);
          return;
        }

        setLoading(true);
        setError("");

        try {
          const params =
            new URLSearchParams();

          params.set(
            "assignmentId",
            id || ""
          );

          params.set(
            "assignment_id",
            id || ""
          );

          params.set(
            "submissionId",
            submissionId
          );

          params.set(
            "submission_id",
            submissionId
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
                `Unable to load submission. Server returned ${response.status}.`
            );
          }

          const list =
            Array.isArray(
              data?.submissions
            )
              ? data.submissions
              : Array.isArray(
                  data?.data
                )
              ? data.data
              : Array.isArray(
                  data?.results
                )
              ? data.results
              : Array.isArray(data)
              ? data
              : [];

          const found =
            list.find(
              (item) =>
                String(
                  item?.id ??
                    item?.submission_id ??
                    item?.submissionId
                ) ===
                String(
                  submissionId
                )
            ) ||
            data?.submission ||
            data?.data?.submission;

          if (!found) {
            throw new Error(
              "The submitted work could not be found."
            );
          }

          setSubmission(
            found
          );

          setAnswers(
            getAnswerList(
              found
            ).map(
              (answer) => ({
                ...answer,
                grade:
                  getExistingMark(
                    answer
                  ),
              })
            )
          );

          setFeedback(
            clean(
              found?.feedback
            ) ||
              clean(
                found?.tutor_feedback
              ) ||
              ""
          );
        } catch (err) {
          console.error(
            "Load submission error:",
            err
          );

          setError(
            err?.message ||
              "Unable to load submission."
          );
        } finally {
          setLoading(false);
        }
      },
      [
        id,
        submissionId,
        tutorReference,
      ]
    );

  useEffect(() => {
    loadSubmission();
  }, [
    loadSubmission,
  ]);

  /* =======================================================
     CHANGE MARK
  ======================================================= */

  const updateGrade =
    useCallback(
      (
        index,
        value
      ) => {
        setAnswers(
          (current) =>
            current.map(
              (
                answer,
                answerIndex
              ) =>
                answerIndex ===
                index
                  ? {
                      ...answer,
                      grade:
                        value,
                    }
                  : answer
            )
        );
      },
      []
    );

  /* =======================================================
     TOTAL
  ======================================================= */

  const totalMarks =
    answers.reduce(
      (
        total,
        answer
      ) =>
        total +
        getMaximumMark(
          answer
        ),
      0
    );

  const awardedMarks =
    answers.reduce(
      (
        total,
        answer
      ) =>
        total +
        (
          Number(
            answer.grade
          ) || 0
        ),
      0
    );

  const percentage =
    totalMarks > 0
      ? (
          (awardedMarks /
            totalMarks) *
          100
        ).toFixed(1)
      : "0.0";

  /* =======================================================
     SAVE GRADE
  ======================================================= */

  const saveGrade =
    useCallback(
      async () => {
        if (!submissionId) {
          return;
        }

        setSaving(true);
        setError("");
        setSuccess("");

        try {
          const response =
            await fetch(
              `${SUBMISSIONS_URL}/${encodeURIComponent(
                submissionId
              )}/review`,
              {
                method: "PATCH",
                headers: {
                  "Content-Type":
                    "application/json",
                },
                body:
                  JSON.stringify({
                    reference:
                      tutorReference,
                    tutorReference:
                      tutorReference,
                    tutor_reference:
                      tutorReference,

                    assignmentId:
                      id,
                    assignment_id:
                      id,

                    submissionId:
                      submissionId,
                    submission_id:
                      submissionId,

                    answers:
                      answers.map(
                        (
                          answer
                        ) => ({
                          ...answer,
                          earned_marks:
                            Number(
                              answer.grade
                            ) || 0,
                          marks_awarded:
                            Number(
                              answer.grade
                            ) || 0,
                        })
                      ),

                    score:
                      awardedMarks,

                    total_marks:
                      totalMarks,

                    percentage:
                      Number(
                        percentage
                      ),

                    feedback:
                      feedback.trim(),

                    status:
                      "graded",
                  }),
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

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">

        <button
          type="button"
          onClick={() =>
            navigate(-1)
          }
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
                    {getStudentName(
                      submission
                    )}
                  </h1>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/5 px-5 py-4">
              <p className="text-xs font-bold uppercase tracking-wider text-cyan-300">
                Current Score
              </p>

              <p className="mt-1 text-2xl font-bold text-white">
                {awardedMarks} /{" "}
                {totalMarks}
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
              onClick={() =>
                setError("")
              }
            >
              <X size={17} />
            </button>
          </div>
        )}

        {success && (
          <div className="mb-5 flex items-center gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4 text-sm text-emerald-200">
            <CheckCircle2
              size={19}
            />
            {success}
          </div>
        )}

        {/* ANSWERS */}

        <div className="space-y-4">
          {answers.map(
            (
              answer,
              index
            ) => {
              const maxMarks =
                getMaximumMark(
                  answer
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

                      <div className="min-w-0">
                        <h2 className="text-base font-bold leading-6 text-white">
                          {getQuestionText(
                            answer
                          )}
                        </h2>

                        <div className="mt-4 rounded-xl border border-white/10 bg-[#020b18] p-4">
                          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                            Student Answer
                          </p>

                          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-200">
                            {getStudentAnswer(
                              answer
                            ) ||
                              "No answer provided."}
                          </p>
                        </div>

                        {getCorrectAnswer(
                          answer
                        ) && (
                          <div className="mt-3 rounded-xl border border-emerald-400/10 bg-emerald-400/5 p-4">
                            <p className="text-xs font-bold uppercase tracking-wider text-emerald-400/70">
                              Correct Answer
                            </p>

                            <p className="mt-2 text-sm text-emerald-200">
                              {getCorrectAnswer(
                                answer
                              )}
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
                          max={
                            maxMarks
                          }
                          step="0.5"
                          value={
                            answer.grade
                          }
                          onChange={(
                            event
                          ) =>
                            updateGrade(
                              index,
                              event
                                .target
                                .value
                            )
                          }
                          className="w-full rounded-xl border border-cyan-400/20 bg-[#020b18] px-4 py-3 pr-14 text-sm font-bold text-white outline-none focus:border-cyan-400/50"
                        />

                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">
                          /{" "}
                          {
                            maxMarks
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                </article>
              );
            }
          )}
        </div>

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
            onChange={(
              event
            ) =>
              setFeedback(
                event.target.value
              )
            }
            placeholder="Write feedback for the student..."
            className="w-full resize-y rounded-xl border border-white/10 bg-[#020b18] px-4 py-3 text-sm leading-6 text-white outline-none focus:border-cyan-400/50"
          />
        </section>

        {/* SAVE */}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() =>
              navigate(-1)
            }
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