import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Clock3,
  Loader2,
  Send,
} from "lucide-react";

import { motion } from "framer-motion";

import {
  useLocation,
  useNavigate,
  useParams,
  useOutletContext,
} from "react-router-dom";

const API_URL = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000"
).replace(/\/$/, "");

const ASSIGNMENT_ENDPOINT =
  `${API_URL}/api/academy/student/assignments`;

const SUBMIT_ENDPOINT =
  `${API_URL}/api/academy/student/assignments`;

/* ============================================================
   HELPERS
============================================================ */

const getToken = () => {
  return (
    localStorage.getItem(
      "scholiqen_academy_token"
    ) ||
    localStorage.getItem(
      "academy_token"
    ) ||
    localStorage.getItem(
      "scholiqen_auth_token"
    ) ||
    localStorage.getItem(
      "access_token"
    ) ||
    localStorage.getItem(
      "token"
    ) ||
    ""
  );
};

const getAuthHeaders = () => {
  const token = getToken();

  return {
    "Content-Type": "application/json",

    ...(token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {}),
  };
};

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

/* ============================================================
   QUESTION NORMALIZER
============================================================ */

const normalizeQuestion = (
  item,
  index
) => {
  if (!item) {
    return {
      id: `question-${index + 1}`,
      question: `Question ${index + 1}`,
      options: [],
      answer: null,
      explanation: "",
      marks: 1,
    };
  }

  /*
   * Support every question format currently used
   * by the Scholiqen backend.
   */

  const optionA =
    item.optionA ??
    item.option_a ??
    item.options?.A ??
    item.options?.a ??
    "";

  const optionB =
    item.optionB ??
    item.option_b ??
    item.options?.B ??
    item.options?.b ??
    "";

  const optionC =
    item.optionC ??
    item.option_c ??
    item.options?.C ??
    item.options?.c ??
    "";

  const optionD =
    item.optionD ??
    item.option_d ??
    item.options?.D ??
    item.options?.d ??
    "";

  const rawOptions =
    item.options ||
    item.choices ||
    item.answers ||
    [];

  let options = [];

  /*
   * Array format
   *
   * [
   *   { id: "A", text: "..." },
   *   ...
   * ]
   */

  if (Array.isArray(rawOptions)) {
    options = rawOptions
      .map((option, optionIndex) => {
        if (
          typeof option ===
          "string"
        ) {
          return {
            id: String.fromCharCode(
              65 + optionIndex
            ),
            text: option,
          };
        }

        return {
          id:
            option?.id ||
            option?.key ||
            option?.value ||
            String.fromCharCode(
              65 + optionIndex
            ),

          text:
            option?.text ??
            option?.label ??
            option?.option ??
            option?.value ??
            "",
        };
      })
      .filter(
        (option) =>
          String(
            option.text || ""
          ).trim() !== ""
      );
  }

  /*
   * Object format
   *
   * {
   *   A: "...",
   *   B: "...",
   *   C: "...",
   *   D: "..."
   * }
   */

  else if (
    rawOptions &&
    typeof rawOptions ===
      "object" &&
    !Array.isArray(rawOptions)
  ) {
    options = Object.entries(
      rawOptions
    )
      .map(
        ([key, value]) => ({
          id: String(key),
          text:
            typeof value ===
            "string"
              ? value
              : value?.text ??
                value?.label ??
                value?.option ??
                "",
        })
      )
      .filter(
        (option) =>
          String(
            option.text || ""
          ).trim() !== ""
      );
  }

  /*
   * If no options were found above,
   * build them directly from the DB columns.
   */

  if (options.length === 0) {
    options = [
      ["A", optionA],
      ["B", optionB],
      ["C", optionC],
      ["D", optionD],
    ]
      .filter(
        ([, value]) =>
          value !==
            undefined &&
          value !== null &&
          String(value).trim() !== ""
      )
      .map(
        ([id, text]) => ({
          id,
          text: String(text),
        })
      );
  }

  /*
   * Make sure option IDs are normalized
   * to A/B/C/D.
   */

  options = options.map(
    (option, optionIndex) => ({
      id: String(
        option.id ||
          String.fromCharCode(
            65 + optionIndex
          )
      ).toUpperCase(),

      text: String(
        option.text || ""
      ),
    })
  );

  return {
    id:
      item.id ??
      item.questionId ??
      item.question_id ??
      `question-${index + 1}`,

    question:
      item.question ??
      item.questionText ??
      item.question_text ??
      item.text ??
      item.title ??
      `Question ${index + 1}`,

    options,

    answer:
      item.answer ??
      item.correctAnswer ??
      item.correct_answer ??
      null,

    explanation:
      item.explanation ??
      item.reason ??
      "",

    marks:
      Number(
        item.marks ??
        item.maxMarks ??
        item.max_marks ??
        1
      ) || 1,

    questionNumber:
      item.questionNumber ??
      item.question_number ??
      index + 1,
  };
};

/* ============================================================
   ASSIGNMENT NORMALIZER
============================================================ */

const normalizeAssignment = (
  item,
  externalQuestions = []
) => {
  if (!item) return null;

  /*
   * IMPORTANT:
   *
   * The backend may return:
   *
   * {
   *   assignment: {...},
   *   questions: [...]
   * }
   *
   * Therefore questions can come from:
   *
   * 1. externalQuestions
   * 2. item.questions
   * 3. item.items
   * 4. item.assignmentQuestions
   * 5. item.assignment_questions
   * 6. item.data.questions
   */

  let rawQuestions = [];

  if (
    Array.isArray(
      externalQuestions
    ) &&
    externalQuestions.length > 0
  ) {
    rawQuestions =
      externalQuestions;
  } else if (
    Array.isArray(
      item.questions
    )
  ) {
    rawQuestions =
      item.questions;
  } else if (
    Array.isArray(
      item.items
    )
  ) {
    rawQuestions =
      item.items;
  } else if (
    Array.isArray(
      item.assignmentQuestions
    )
  ) {
    rawQuestions =
      item.assignmentQuestions;
  } else if (
    Array.isArray(
      item.assignment_questions
    )
  ) {
    rawQuestions =
      item.assignment_questions;
  } else if (
    Array.isArray(
      item.data?.questions
    )
  ) {
    rawQuestions =
      item.data.questions;
  }

  return {
    id:
      item.id ??
      item.assignmentId ??
      item.assignment_id,

    title:
      item.title ??
      item.name ??
      item.assignmentTitle ??
      "Assignment",

    subject:
      item.subject ??
      item.subjectName ??
      item.subject_name ??
      "General",

    className:
      item.className ??
      item.class_name ??
      item.class ??
      item.grade ??
      "",

    description:
      item.description ??
      item.instructions ??
      "",

    instructions:
      item.instructions ??
      "",

    dueDate:
      item.dueDate ??
      item.due_date ??
      item.deadline ??
      "",

    status: String(
      item.status ??
        item.submissionStatus ??
        item.submission_status ??
        "pending"
    ).toLowerCase(),

    totalQuestions:
      Number(
        item.totalQuestions ??
        item.total_questions ??
        rawQuestions.length
      ) || rawQuestions.length,

    totalMarks:
      Number(
        item.totalMarks ??
        item.total_marks ??
        item.maxMarks ??
        item.max_marks ??
        rawQuestions.reduce(
          (sum, question) =>
            sum +
            (Number(
              question?.marks ??
                question?.maxMarks ??
                question?.max_marks ??
                1
            ) || 1),
          0
        )
      ) ||
      rawQuestions.length,

    questions:
      Array.isArray(rawQuestions)
        ? rawQuestions.map(
            normalizeQuestion
          )
        : [],
  };
};

/* ============================================================
   OPTION LETTER
============================================================ */

const getOptionLetter = (
  option,
  index
) => {
  if (
    option?.id &&
    String(option.id).length === 1
  ) {
    return String(
      option.id
    ).toUpperCase();
  }

  return String.fromCharCode(
    65 + index
  );
};

/* ============================================================
   COMPONENT
============================================================ */

export default function StudentAssignmentDetails() {
  const navigate = useNavigate();

  const { assignmentId } =
    useParams();

  const location =
    useLocation();

  const { student } =
    useOutletContext() || {};

  const [assignment, setAssignment] =
    useState(
      location.state?.assignment
        ? normalizeAssignment(
            location.state.assignment,
            location.state.assignment
              ?.questions || []
          )
        : null
    );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [currentQuestion, setCurrentQuestion] =
    useState(0);

  const [answers, setAnswers] =
    useState({});

  const [showReview, setShowReview] =
    useState(false);

  const [submitting, setSubmitting] =
    useState(false);

  const [submitted, setSubmitted] =
    useState(
      false
    );

  const studentId =
    getStudentId(student);

  /* ==========================================================
     LOAD ASSIGNMENT
  ========================================================== */

  useEffect(() => {
    let cancelled = false;

    const loadAssignment = async () => {
      if (!assignmentId) {
        setError(
          "Assignment ID is missing."
        );
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const response =
          await fetch(
            `${ASSIGNMENT_ENDPOINT}/${assignmentId}`,
            {
              method: "GET",
              headers:
                getAuthHeaders(),
            }
          );

        const data =
          await response
            .json()
            .catch(() => ({}));

        if (!response.ok) {
          throw new Error(
            data?.message ||
              "Unable to load assignment."
          );
        }

        console.log(
          "STUDENT ASSIGNMENT RESPONSE:",
          data
        );

        /*
         * ======================================================
         * IMPORTANT FIX
         * ======================================================
         *
         * Backend response:
         *
         * {
         *   success: true,
         *   assignment: {...},
         *   questions: [...]
         * }
         *
         * Previously the component only used:
         *
         * data.assignment
         *
         * and therefore lost data.questions.
         */

        const backendAssignment =
          data?.assignment ||
          data?.data?.assignment ||
          data?.data ||
          data;

        const backendQuestions =
          Array.isArray(
            data?.questions
          )
            ? data.questions
            : Array.isArray(
                data?.data?.questions
              )
            ? data.data.questions
            : Array.isArray(
                backendAssignment?.questions
              )
            ? backendAssignment.questions
            : [];

        console.log(
          "STUDENT ASSIGNMENT:",
          backendAssignment
        );

        console.log(
          "STUDENT ASSIGNMENT QUESTIONS:",
          backendQuestions
        );

        const normalized =
          normalizeAssignment(
            backendAssignment,
            backendQuestions
          );

        if (
          !normalized
        ) {
          throw new Error(
            "Assignment could not be loaded."
          );
        }

        if (
          !cancelled
        ) {
          setAssignment(
            normalized
          );

          setSubmitted(
            normalized.status ===
              "submitted" ||
            normalized.status ===
              "graded" ||
            normalized.status ===
              "reviewed"
          );

          setCurrentQuestion(
            0
          );
        }
      } catch (err) {
        console.error(
          "STUDENT ASSIGNMENT DETAILS ERROR:",
          err
        );

        if (
          !cancelled
        ) {
          /*
           * If navigation state already
           * contains a usable assignment,
           * keep it as a fallback.
           */

          if (
            location.state
              ?.assignment
          ) {
            const fallback =
              normalizeAssignment(
                location.state
                  .assignment,
                location.state
                  .assignment
                  ?.questions || []
              );

            setAssignment(
              fallback
            );

            setSubmitted(
              fallback?.status ===
                "submitted" ||
              fallback?.status ===
                "graded" ||
              fallback?.status ===
                "reviewed"
            );

            setError("");
          } else {
            setError(
              err.message ||
                "Unable to load assignment."
            );
          }
        }
      } finally {
        if (
          !cancelled
        ) {
          setLoading(false);
        }
      }
    };

    loadAssignment();

    return () => {
      cancelled = true;
    };
  }, [
    assignmentId,
  ]);

  /* ==========================================================
     QUESTIONS
  ========================================================== */

  const questions =
    assignment?.questions || [];

  const question =
    questions[
      currentQuestion
    ];

  /* ==========================================================
     ANSWER COUNTS
  ========================================================== */

  const answeredCount =
    useMemo(() => {
      return Object.keys(
        answers
      ).length;
    }, [answers]);

  const unansweredCount =
    Math.max(
      questions.length -
        answeredCount,
      0
    );

  const progress =
    questions.length > 0
      ? ((currentQuestion + 1) /
          questions.length) *
        100
      : 0;

  /* ==========================================================
     SELECT ANSWER
  ========================================================== */

  const selectAnswer = (
    option
  ) => {
    if (
      submitted ||
      !question
    ) {
      return;
    }

    setAnswers(
      (previous) => ({
        ...previous,
        [question.id]:
          option.id,
      })
    );
  };

  /* ==========================================================
     NAVIGATION
  ========================================================== */

  const goNext = () => {
    if (
      currentQuestion <
      questions.length - 1
    ) {
      setCurrentQuestion(
        (previous) =>
          previous + 1
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } else {
      setShowReview(true);
    }
  };

  const goPrevious = () => {
    if (
      currentQuestion > 0
    ) {
      setCurrentQuestion(
        (previous) =>
          previous - 1
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  const jumpToQuestion = (
    index
  ) => {
    setCurrentQuestion(index);
    setShowReview(false);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /* ==========================================================
     SUBMIT ASSIGNMENT
  ========================================================== */

  const submitAssignment =
    async () => {
      if (
        !assignment
      ) {
        return;
      }

      if (
        unansweredCount > 0
      ) {
        setShowReview(true);
        return;
      }

      setSubmitting(true);
      setError("");

      const submission = {
        assignmentId:
          assignment.id,

        studentId,

        answers:
          questions.map(
            (item) => ({
              questionId:
                item.id,

              answer:
                answers[
                  item.id
                ] ?? null,
            })
          ),
      };

      try {
        const response =
          await fetch(
            `${SUBMIT_ENDPOINT}/${assignment.id}/submit`,
            {
              method: "POST",

              headers:
                getAuthHeaders(),

              body: JSON.stringify(
                submission
              ),
            }
          );

        const data =
          await response
            .json()
            .catch(() => null);

        if (
          !response.ok
        ) {
          throw new Error(
            data?.message ||
              "Unable to submit assignment."
          );
        }

        setSubmitted(true);

        setAssignment(
          (previous) => ({
            ...previous,
            status:
              "submitted",
          })
        );

        setShowReview(false);
      } catch (err) {
        console.error(
          "SUBMIT ASSIGNMENT ERROR:",
          err
        );

        setError(
          err.message ||
            "Unable to submit assignment."
        );
      } finally {
        setSubmitting(false);
      }
    };

  /* ==========================================================
     LOADING
  ========================================================== */

  if (loading) {
    return (
      <div className="min-h-full bg-[#020617] text-white">
        <div className="flex min-h-[500px] items-center justify-center">
          <div className="flex items-center gap-3 text-slate-400">
            <Loader2
              size={24}
              className="animate-spin"
            />

            Loading assignment...
          </div>
        </div>
      </div>
    );
  }

  /* ==========================================================
     ERROR
  ========================================================== */

  if (
    error &&
    !assignment
  ) {
    return (
      <div className="min-h-full bg-[#020617] p-6 text-white">
        <div className="mx-auto max-w-3xl rounded-3xl border border-red-400/20 bg-[#071426] p-8">
          <AlertCircle
            size={40}
            className="text-red-400"
          />

          <h1 className="mt-4 text-xl font-bold">
            Unable to load assignment
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            {error}
          </p>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/academy/student/assignments"
              )
            }
            className="mt-6 rounded-xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950"
          >
            Back to Assignments
          </button>
        </div>
      </div>
    );
  }

  if (!assignment) {
    return null;
  }

  /* ==========================================================
     REVIEW SCREEN
  ========================================================== */

  if (
    showReview
  ) {
    return (
      <div className="min-h-full bg-[#020617] text-white">
        <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6 lg:p-8">

          <button
            type="button"
            onClick={() =>
              navigate(
                "/academy/student/assignments"
              )
            }
            className="flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
          >
            <ArrowLeft size={18} />

            Back to Assignments
          </button>

          <div className="rounded-3xl border border-white/10 bg-[#071426] p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

              <div>
                <div className="flex items-center gap-3">

                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-400/10">
                    <ClipboardCheck
                      size={22}
                      className="text-cyan-300"
                    />
                  </div>

                  <div>
                    <h1 className="text-2xl font-bold">
                      Review Assignment
                    </h1>

                    <p className="mt-1 text-sm text-slate-400">
                      {assignment.title}
                    </p>
                  </div>

                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm">
                <span className="text-slate-400">
                  Answered
                </span>

                <strong className="ml-2 text-cyan-300">
                  {answeredCount}/
                  {questions.length}
                </strong>
              </div>

            </div>
          </div>

          {error && (
            <div className="flex items-start gap-3 rounded-2xl border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-200">

              <AlertCircle
                size={18}
                className="mt-0.5 shrink-0"
              />

              <span>
                {error}
              </span>

            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">

            {questions.map(
              (item, index) => {
                const selected =
                  answers[
                    item.id
                  ];

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() =>
                      jumpToQuestion(
                        index
                      )
                    }
                    className="rounded-2xl border border-white/10 bg-[#071426] p-5 text-left transition hover:border-cyan-400/30"
                  >
                    <div className="flex items-start gap-4">

                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${
                          selected
                            ? "bg-cyan-400 text-slate-950"
                            : "bg-white/5 text-slate-400"
                        }`}
                      >
                        {selected ? (
                          <CheckCircle2
                            size={20}
                          />
                        ) : (
                          index + 1
                        )}
                      </div>

                      <div className="min-w-0">

                        <p className="text-sm font-medium leading-6 text-slate-200">
                          {item.question}
                        </p>

                        <p className="mt-2 text-xs text-slate-500">
                          {selected
                            ? `Selected option ${selected}`
                            : "Not answered"}
                        </p>

                      </div>
                    </div>
                  </button>
                );
              }
            )}

          </div>

          {unansweredCount > 0 && (
            <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-amber-200">
              You still have{" "}
              <strong>
                {unansweredCount}
              </strong>{" "}
              unanswered question
              {unansweredCount !==
              1
                ? "s"
                : ""}.
            </div>
          )}

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">

            <button
              type="button"
              onClick={() =>
                setShowReview(false)
              }
              className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#071426] px-5 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/5"
            >
              <ChevronLeft
                size={18}
              />

              Continue Answering
            </button>

            <button
              type="button"
              disabled={
                submitting ||
                unansweredCount > 0 ||
                submitted
              }
              onClick={
                submitAssignment
              }
              className="flex items-center justify-center gap-2 rounded-xl bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {submitting ? (
                <>
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />

                  Submitting...
                </>
              ) : (
                <>
                  <Send size={18} />

                  Submit Assignment
                </>
              )}
            </button>

          </div>
        </div>
      </div>
    );
  }

  /* ==========================================================
     NO QUESTIONS
  ========================================================== */

  if (
    questions.length === 0
  ) {
    return (
      <div className="min-h-full bg-[#020617] text-white">

        <div className="mx-auto max-w-3xl p-6 lg:p-8">

          <button
            type="button"
            onClick={() =>
              navigate(
                "/academy/student/assignments"
              )
            }
            className="mb-6 flex items-center gap-2 text-sm text-slate-400 hover:text-white"
          >
            <ArrowLeft size={18} />

            Back to Assignments
          </button>

          <div className="rounded-3xl border border-white/10 bg-[#071426] p-10 text-center">

            <ClipboardCheck
              size={48}
              className="mx-auto text-slate-600"
            />

            <h1 className="mt-5 text-xl font-bold">
              No Questions Available
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              This assignment has been
              created, but no questions have
              been added yet.
            </p>

          </div>
        </div>
      </div>
    );
  }

  /*
   * Safety guard in case the question
   * index ever becomes invalid.
   */

  if (!question) {
    setCurrentQuestion(0);
    return null;
  }

  /* ==========================================================
     QUESTION SCREEN
  ========================================================== */

  return (
    <div className="min-h-full bg-[#020617] text-white">

      <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6 lg:p-8">

        {/* HEADER */}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <button
            type="button"
            onClick={() =>
              navigate(
                "/academy/student/assignments"
              )
            }
            className="flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
          >
            <ArrowLeft size={18} />

            Back to Assignments
          </button>

          <div className="flex items-center gap-2 text-sm text-slate-400">

            <Clock3 size={17} />

            <span>
              Assignment
            </span>

          </div>

        </div>

        {/* ASSIGNMENT HEADER */}

        <div className="rounded-3xl border border-white/10 bg-[#071426] p-5 sm:p-6">

          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

            <div>

              <div className="flex flex-wrap items-center gap-2">

                <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-300">
                  {assignment.subject}
                </span>

                <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-400">
                  {assignment.className}
                </span>

              </div>

              <h1 className="mt-3 text-2xl font-bold">
                {assignment.title}
              </h1>

              {assignment.description && (
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
                  {assignment.description}
                </p>
              )}

            </div>

            <div className="shrink-0 rounded-2xl border border-white/10 bg-black/20 p-4">

              <p className="text-xs text-slate-500">
                Question
              </p>

              <p className="mt-1 text-xl font-bold">

                {currentQuestion + 1}

                <span className="text-slate-500">
                  {" "}
                  / {questions.length}
                </span>

              </p>

            </div>

          </div>

          <div className="mt-6 h-2 overflow-hidden rounded-full bg-white/5">

            <motion.div
              className="h-full rounded-full bg-cyan-400"
              initial={{
                width: 0,
              }}
              animate={{
                width: `${progress}%`,
              }}
              transition={{
                duration: 0.25,
              }}
            />

          </div>

        </div>

        {/* ERROR */}

        {error && (
          <div className="flex items-start gap-3 rounded-2xl border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-200">

            <AlertCircle
              size={18}
              className="mt-0.5 shrink-0"
            />

            <span>
              {error}
            </span>

          </div>
        )}

        {/* CONTENT */}

        <div className="grid gap-6 lg:grid-cols-[1fr_280px]">

          {/* QUESTION */}

          <motion.div
            key={question.id}
            initial={{
              opacity: 0,
              x: 10,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            className="rounded-3xl border border-white/10 bg-[#071426] p-6 sm:p-8"
          >

            <div className="flex items-start gap-4">

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-cyan-400 text-sm font-bold text-slate-950">
                {currentQuestion + 1}
              </div>

              <div className="min-w-0">

                <p className="text-xs font-medium uppercase tracking-wider text-cyan-300">
                  Question{" "}
                  {currentQuestion + 1}
                </p>

                <h2 className="mt-2 text-xl font-semibold leading-8 text-white sm:text-2xl">
                  {question.question}
                </h2>

              </div>

            </div>

            {/* OPTIONS */}

            <div className="mt-8 space-y-3">

              {question.options.map(
                (option, index) => {
                  const letter =
                    getOptionLetter(
                      option,
                      index
                    );

                  const selected =
                    answers[
                      question.id
                    ] ===
                    option.id;

                  return (
                    <button
                      key={`${question.id}-${option.id}-${index}`}
                      type="button"
                      disabled={
                        submitted
                      }
                      onClick={() =>
                        selectAnswer(
                          option
                        )
                      }
                      className={`group flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition ${
                        selected
                          ? "border-cyan-400 bg-cyan-400/10"
                          : "border-white/10 bg-black/10 hover:border-cyan-400/30 hover:bg-white/[0.03]"
                      } ${
                        submitted
                          ? "cursor-default"
                          : "cursor-pointer"
                      }`}
                    >

                      <span
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border text-sm font-bold transition ${
                          selected
                            ? "border-cyan-400 bg-cyan-400 text-slate-950"
                            : "border-white/10 bg-white/5 text-slate-400 group-hover:border-cyan-400/40 group-hover:text-cyan-300"
                        }`}
                      >
                        {selected ? (
                          <CheckCircle2
                            size={19}
                          />
                        ) : (
                          letter
                        )}
                      </span>

                      <span
                        className={`text-sm leading-6 sm:text-base ${
                          selected
                            ? "font-medium text-cyan-100"
                            : "text-slate-300"
                        }`}
                      >
                        {option.text}
                      </span>

                    </button>
                  );
                }
              )}

            </div>

            {/* NAVIGATION */}

            <div className="mt-8 flex flex-col gap-3 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">

              <button
                type="button"
                disabled={
                  currentQuestion ===
                  0
                }
                onClick={
                  goPrevious
                }
                className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-black/10 px-5 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-30"
              >
                <ChevronLeft
                  size={18}
                />

                Previous
              </button>

              <button
                type="button"
                onClick={
                  goNext
                }
                className="flex items-center justify-center gap-2 rounded-xl bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
              >
                {currentQuestion ===
                questions.length - 1 ? (
                  <>
                    Review Answers

                    <CheckCircle2
                      size={18}
                    />
                  </>
                ) : (
                  <>
                    Next Question

                    <ChevronRight
                      size={18}
                    />
                  </>
                )}
              </button>

            </div>

          </motion.div>

          {/* QUESTION NAVIGATOR */}

          <aside className="rounded-3xl border border-white/10 bg-[#071426] p-5">

            <div className="flex items-center justify-between">

              <div>

                <h3 className="font-semibold">
                  Questions
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  Select a question
                </p>

              </div>

              <span className="rounded-lg bg-cyan-400/10 px-2.5 py-1 text-xs font-semibold text-cyan-300">
                {answeredCount}/
                {questions.length}
              </span>

            </div>

            <div className="mt-5 grid grid-cols-5 gap-2">

              {questions.map(
                (item, index) => {
                  const answered =
                    answers[
                      item.id
                    ] !==
                    undefined;

                  const active =
                    index ===
                    currentQuestion;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() =>
                        jumpToQuestion(
                          index
                        )
                      }
                      className={`relative flex h-11 items-center justify-center rounded-xl text-sm font-semibold transition ${
                        active
                          ? "bg-cyan-400 text-slate-950"
                          : answered
                          ? "bg-cyan-400/15 text-cyan-300"
                          : "border border-white/10 bg-black/10 text-slate-500 hover:bg-white/5"
                      }`}
                    >
                      {index + 1}

                      {answered &&
                        !active && (
                          <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-cyan-400" />
                        )}
                    </button>
                  );
                }
              )}

            </div>

            <div className="mt-6 space-y-3 border-t border-white/10 pt-5 text-xs">

              <div className="flex items-center gap-2 text-slate-400">
                <span className="h-3 w-3 rounded bg-cyan-400" />
                Current question
              </div>

              <div className="flex items-center gap-2 text-slate-400">
                <span className="h-3 w-3 rounded bg-cyan-400/20" />
                Answered
              </div>

              <div className="flex items-center gap-2 text-slate-400">
                <span className="h-3 w-3 rounded border border-white/10" />
                Not answered
              </div>

            </div>

            <button
              type="button"
              onClick={() =>
                setShowReview(true)
              }
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-400/15"
            >
              <ClipboardCheck
                size={17}
              />

              Review Answers
            </button>

          </aside>

        </div>
      </div>
    </div>
  );
}
