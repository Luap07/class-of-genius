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
  ChevronDown,
  ChevronUp,
  Clock3,
  FileText,
  GraduationCap,
  Loader2,
  Save,
  Plus,
  Trash2,
  AlertCircle,
  X,
  Edit3,
} from "lucide-react";

/* =========================================================
   API
========================================================= */

const API_BASE_URL = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000"
).replace(/\/$/, "");

const ASSIGNMENTS_URL =
  `${API_BASE_URL}/api/academy/tutor/assignments`;

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

  return String(value);
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

function getQuestionId(question, index) {
  return (
    question?.id ??
    question?.question_id ??
    question?.questionId ??
    `question-${index}`
  );
}

function getQuestionText(question) {
  return clean(
    question?.question ??
      question?.question_text ??
      question?.questionText ??
      question?.text ??
      question?.prompt
  );
}

function getQuestionType(question) {
  return clean(
    question?.type ??
      question?.question_type ??
      question?.questionType ??
      "text"
  ).toLowerCase();
}

function getOptions(question) {
  const options =
    question?.options ??
    question?.choices ??
    question?.answers ??
    [];

  if (Array.isArray(options)) {
    return options.map((option) => {
      if (
        typeof option === "object" &&
        option !== null
      ) {
        return clean(
          option.text ??
            option.label ??
            option.value ??
            option.option
        );
      }

      return clean(option);
    });
  }

  if (
    typeof options === "object" &&
    options !== null
  ) {
    return [
      options.A,
      options.B,
      options.C,
      options.D,
    ]
      .filter(
        (value) =>
          value !== undefined &&
          value !== null
      )
      .map((value) => clean(value));
  }

  return [];
}

function getCorrectAnswer(question) {
  return clean(
    question?.correct_answer ??
      question?.correctAnswer ??
      question?.answer ??
      question?.correct_option ??
      question?.correctOption
  );
}

function getMarks(question) {
  const value =
    question?.marks ??
    question?.mark ??
    question?.points ??
    1;

  const number =
    Number(value);

  return Number.isFinite(number)
    ? number
    : 1;
}

function normalizeQuestion(
  question,
  index
) {
  return {
    id:
      getQuestionId(
        question,
        index
      ),
    question:
      getQuestionText(
        question
      ),
    type:
      getQuestionType(
        question
      ),
    options:
      getOptions(
        question
      ),
    correct_answer:
      getCorrectAnswer(
        question
      ),
    marks:
      getMarks(
        question
      ),
    explanation: clean(
      question?.explanation ??
        question?.reason ??
        ""
    ),
  };
}

function extractAssignment(data) {
  return (
    data?.assignment ??
    data?.data?.assignment ??
    data?.result?.assignment ??
    data?.data ??
    data
  );
}

function extractQuestions(data, assignment) {
  const possible =
    [
      data?.questions,
      data?.assignmentQuestions,
      data?.assignment_questions,
      assignment?.questions,
      assignment?.assignmentQuestions,
      assignment?.assignment_questions,
      assignment?.task?.questions,
      assignment?.items,
    ].find(
      (value) =>
        Array.isArray(value)
    );

  return possible || [];
}

/* =========================================================
   COMPONENT
========================================================= */

export default function TutorAssignmentDetails() {
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

  const [questions, setQuestions] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [openQuestion, setOpenQuestion] =
    useState(0);

  /* =======================================================
     LOAD
  ======================================================= */

  const loadAssignment =
    useCallback(
      async () => {
        if (!id) {
          setError(
            "Assignment ID is missing."
          );
          setLoading(false);
          return;
        }

        setLoading(true);
        setError("");

        try {
          const query =
            new URLSearchParams();

          if (tutorReference) {
            query.set(
              "reference",
              tutorReference
            );

            query.set(
              "tutorReference",
              tutorReference
            );

            query.set(
              "tutor_reference",
              tutorReference
            );
          }

          const response =
            await fetch(
              `${ASSIGNMENTS_URL}/${encodeURIComponent(
                id
              )}?${query.toString()}`
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
                `Unable to load assignment. Server returned ${response.status}.`
            );
          }

          const loadedAssignment =
            extractAssignment(
              data
            );

          const loadedQuestions =
            extractQuestions(
              data,
              loadedAssignment
            );

          setAssignment(
            loadedAssignment
          );

          setQuestions(
            loadedQuestions.map(
              normalizeQuestion
            )
          );
        } catch (err) {
          console.error(
            "Load assignment error:",
            err
          );

          setError(
            err?.message ||
              "Unable to load assignment."
          );
        } finally {
          setLoading(false);
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

  /* =======================================================
     QUESTION CHANGE
  ======================================================= */

  const updateQuestion =
    useCallback(
      (
        index,
        field,
        value
      ) => {
        setQuestions(
          (current) =>
            current.map(
              (
                question,
                questionIndex
              ) =>
                questionIndex ===
                index
                  ? {
                      ...question,
                      [field]:
                        value,
                    }
                  : question
            )
        );
      },
      []
    );

  /* =======================================================
     OPTION CHANGE
  ======================================================= */

  const updateOption =
    useCallback(
      (
        questionIndex,
        optionIndex,
        value
      ) => {
        setQuestions(
          (current) =>
            current.map(
              (
                question,
                index
              ) => {
                if (
                  index !==
                  questionIndex
                ) {
                  return question;
                }

                const options =
                  Array.isArray(
                    question.options
                  )
                    ? [
                        ...question.options,
                      ]
                    : [];

                options[
                  optionIndex
                ] = value;

                return {
                  ...question,
                  options,
                };
              }
            )
        );
      },
      []
    );

  /* =======================================================
     ADD OPTION
  ======================================================= */

  const addOption =
    useCallback(
      (questionIndex) => {
        setQuestions(
          (current) =>
            current.map(
              (
                question,
                index
              ) =>
                index ===
                questionIndex
                  ? {
                      ...question,
                      options: [
                        ...(question.options ||
                          []),
                        "",
                      ],
                    }
                  : question
            )
        );
      },
      []
    );

  /* =======================================================
     REMOVE OPTION
  ======================================================= */

  const removeOption =
    useCallback(
      (
        questionIndex,
        optionIndex
      ) => {
        setQuestions(
          (current) =>
            current.map(
              (
                question,
                index
              ) => {
                if (
                  index !==
                  questionIndex
                ) {
                  return question;
                }

                const options =
                  (
                    question.options ||
                    []
                  ).filter(
                    (
                      _,
                      option
                    ) =>
                      option !==
                      optionIndex
                  );

                return {
                  ...question,
                  options,
                };
              }
            )
        );
      },
      []
    );

  /* =======================================================
     ADD QUESTION
  ======================================================= */

  const addQuestion =
    useCallback(() => {
      setQuestions(
        (current) => [
          ...current,
          {
            id: `new-${Date.now()}`,
            question: "",
            type: "text",
            options: [],
            correct_answer: "",
            marks: 1,
            explanation: "",
          },
        ]
      );

      setOpenQuestion(
        questions.length
      );
    }, [questions.length]);

  /* =======================================================
     DELETE QUESTION
  ======================================================= */

  const deleteQuestion =
    useCallback(
      (index) => {
        setQuestions(
          (current) =>
            current.filter(
              (
                _,
                questionIndex
              ) =>
                questionIndex !==
                index
            )
        );

        setOpenQuestion(
          0
        );
      },
      []
    );

  /* =======================================================
     SAVE
  ======================================================= */

  const saveAssignment =
    useCallback(
      async () => {
        if (!id) {
          return;
        }

        setSaving(true);
        setError("");
        setSuccess("");

        try {
          const response =
            await fetch(
              `${ASSIGNMENTS_URL}/${encodeURIComponent(
                id
              )}`,
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

                    title:
                      assignment?.title ||
                      "",

                    description:
                      assignment?.description ||
                      "",

                    instructions:
                      assignment?.instructions ||
                      "",

                    class:
                      assignment?.class ||
                      assignment?.grade ||
                      "",

                    grade:
                      assignment?.grade ||
                      assignment?.class ||
                      "",

                    subject:
                      assignment?.subject ||
                      "",

                    dueDate:
                      assignment?.due_date ||
                      assignment?.dueDate ||
                      "",

                    questions:
                      questions.map(
                        (
                          question
                        ) => ({
                          id:
                            question.id,
                          question:
                            question.question,
                          type:
                            question.type,
                          options:
                            question.options ||
                            [],
                          correct_answer:
                            question.correct_answer,
                          marks:
                            Number(
                              question.marks
                            ) || 1,
                          explanation:
                            question.explanation ||
                            "",
                        })
                      ),
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
                `Unable to save assignment. Server returned ${response.status}.`
            );
          }

          setSuccess(
            data?.message ||
              "Assignment and questions saved successfully."
          );

          await loadAssignment();
        } catch (err) {
          console.error(
            "Save assignment error:",
            err
          );

          setError(
            err?.message ||
              "Unable to save assignment."
          );
        } finally {
          setSaving(false);
        }
      },
      [
        id,
        tutorReference,
        assignment,
        questions,
        loadAssignment,
      ]
    );

  /* =======================================================
     TOTAL MARKS
  ======================================================= */

  const totalMarks =
    questions.reduce(
      (
        total,
        question
      ) =>
        total +
        (
          Number(
            question.marks
          ) || 0
        ),
      0
    );

  /* =======================================================
     RENDER
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

            <p className="mt-4 text-sm font-semibold text-slate-200">
              Loading assignment...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">

        {/* HEADER */}

        <div className="mb-7">
          <button
            type="button"
            onClick={() =>
              navigate(-1)
            }
            className="mb-5 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-[#071426] px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-cyan-400/30 hover:text-white"
          >
            <ArrowLeft size={17} />
            Back
          </button>

          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-cyan-300">
                <BookOpen size={14} />
                Assignment Editor
              </div>

              <h1 className="text-3xl font-bold text-white">
                {clean(
                  assignment?.title
                ) ||
                  "Untitled Assignment"}
              </h1>

              <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-400">
                <span className="inline-flex items-center gap-2">
                  <GraduationCap
                    size={16}
                  />
                  {clean(
                    assignment?.grade ||
                      assignment?.class
                  ) ||
                    "Class"}
                </span>

                <span className="inline-flex items-center gap-2">
                  <BookOpen size={16} />
                  {clean(
                    assignment?.subject
                  ) ||
                    "Subject"}
                </span>

                <span className="inline-flex items-center gap-2">
                  <FileText size={16} />
                  {questions.length} questions
                </span>

                <span className="inline-flex items-center gap-2">
                  <CheckCircle2
                    size={16}
                  />
                  {totalMarks} marks
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() =>
                  navigate(
                    `/academy/tutor/assignments/${encodeURIComponent(
                      id
                    )}/submissions`
                  )
                }
                className="inline-flex items-center gap-2 rounded-xl border border-cyan-400/20 bg-cyan-400/5 px-5 py-3 text-sm font-bold text-cyan-300 transition hover:bg-cyan-400/10"
              >
                <GraduationCap
                  size={17}
                />
                View Submissions
              </button>

              <button
                type="button"
                onClick={saveAssignment}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 text-sm font-bold text-[#020617] transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={17} />
                    Save Assignment
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ALERTS */}

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-400/20 bg-red-500/10 p-4 text-red-200">
            <AlertCircle
              size={19}
              className="mt-0.5 shrink-0"
            />

            <div className="min-w-0 flex-1">
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
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4 text-sm text-emerald-200">
            <CheckCircle2
              size={19}
            />
            {success}
          </div>
        )}

        {/* ASSIGNMENT INFO */}

        <section className="mb-6 rounded-2xl border border-white/10 bg-[#071426] p-5 sm:p-6">
          <div className="mb-4 flex items-center gap-2">
            <Edit3
              size={18}
              className="text-cyan-300"
            />

            <h2 className="text-lg font-bold">
              Assignment Information
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                Title
              </label>

              <input
                value={
                  assignment?.title ||
                  ""
                }
                onChange={(event) =>
                  setAssignment(
                    (current) => ({
                      ...current,
                      title:
                        event.target
                          .value,
                    })
                  )
                }
                className="w-full rounded-xl border border-white/10 bg-[#020b18] px-4 py-3 text-sm text-white outline-none focus:border-cyan-400/50"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                Due Date
              </label>

              <input
                type="datetime-local"
                value={
                  assignment?.due_date ||
                  assignment?.dueDate ||
                  ""
                }
                onChange={(event) =>
                  setAssignment(
                    (current) => ({
                      ...current,
                      due_date:
                        event.target
                          .value,
                    })
                  )
                }
                className="w-full rounded-xl border border-white/10 bg-[#020b18] px-4 py-3 text-sm text-white outline-none focus:border-cyan-400/50"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                Description
              </label>

              <textarea
                rows={3}
                value={
                  assignment?.description ||
                  ""
                }
                onChange={(event) =>
                  setAssignment(
                    (current) => ({
                      ...current,
                      description:
                        event.target
                          .value,
                    })
                  )
                }
                className="w-full resize-y rounded-xl border border-white/10 bg-[#020b18] px-4 py-3 text-sm leading-6 text-white outline-none focus:border-cyan-400/50"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                Instructions
              </label>

              <textarea
                rows={4}
                value={
                  assignment?.instructions ||
                  ""
                }
                onChange={(event) =>
                  setAssignment(
                    (current) => ({
                      ...current,
                      instructions:
                        event.target
                          .value,
                    })
                  )
                }
                className="w-full resize-y rounded-xl border border-white/10 bg-[#020b18] px-4 py-3 text-sm leading-6 text-white outline-none focus:border-cyan-400/50"
              />
            </div>
          </div>
        </section>

        {/* QUESTIONS */}

        <section className="rounded-2xl border border-white/10 bg-[#071426]">
          <div className="flex flex-col gap-4 border-b border-white/10 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
              <h2 className="text-xl font-bold">
                Assignment Questions
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Edit the questions, options,
                answers and marks.
              </p>
            </div>

            <button
              type="button"
              onClick={addQuestion}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-cyan-400/20 bg-cyan-400/5 px-4 py-2.5 text-sm font-bold text-cyan-300 hover:bg-cyan-400/10"
            >
              <Plus size={17} />
              Add Question
            </button>
          </div>

          <div className="space-y-3 p-4 sm:p-6">
            {questions.length === 0 && (
              <div className="rounded-xl border border-dashed border-white/10 px-6 py-12 text-center">
                <FileText
                  size={30}
                  className="mx-auto text-slate-600"
                />

                <p className="mt-3 font-semibold text-slate-300">
                  No questions found
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Add the first question to
                  this assignment.
                </p>
              </div>
            )}

            {questions.map(
              (
                question,
                index
              ) => {
                const expanded =
                  openQuestion ===
                  index;

                return (
                  <div
                    key={String(
                      getQuestionId(
                        question,
                        index
                      )
                    )}
                    className="overflow-hidden rounded-2xl border border-white/10 bg-[#020b18]"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setOpenQuestion(
                          expanded
                            ? -1
                            : index
                        )
                      }
                      className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left sm:px-5"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cyan-400/10 text-sm font-bold text-cyan-300">
                          {index + 1}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-white">
                            {question.question ||
                              "Untitled question"}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {question.type} •{" "}
                            {question.marks}{" "}
                            {question.marks ===
                            1
                              ? "mark"
                              : "marks"}
                          </p>
                        </div>
                      </div>

                      {expanded ? (
                        <ChevronUp
                          size={19}
                          className="shrink-0 text-slate-500"
                        />
                      ) : (
                        <ChevronDown
                          size={19}
                          className="shrink-0 text-slate-500"
                        />
                      )}
                    </button>

                    {expanded && (
                      <div className="border-t border-white/10 p-4 sm:p-5">
                        <div className="mb-5 flex justify-end">
                          <button
                            type="button"
                            onClick={() =>
                              deleteQuestion(
                                index
                              )
                            }
                            className="inline-flex items-center gap-2 rounded-xl border border-red-400/20 bg-red-500/5 px-3 py-2 text-xs font-semibold text-red-300 hover:bg-red-500/10"
                          >
                            <Trash2
                              size={15}
                            />
                            Remove Question
                          </button>
                        </div>

                        <div className="grid gap-5">
                          <div>
                            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                              Question
                            </label>

                            <textarea
                              rows={4}
                              value={
                                question.question
                              }
                              onChange={(
                                event
                              ) =>
                                updateQuestion(
                                  index,
                                  "question",
                                  event.target
                                    .value
                                )
                              }
                              className="w-full resize-y rounded-xl border border-white/10 bg-[#071426] px-4 py-3 text-sm leading-6 text-white outline-none focus:border-cyan-400/50"
                              placeholder="Enter question..."
                            />
                          </div>

                          <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                                Question Type
                              </label>

                              <select
                                value={
                                  question.type
                                }
                                onChange={(
                                  event
                                ) =>
                                  updateQuestion(
                                    index,
                                    "type",
                                    event.target
                                      .value
                                  )
                                }
                                className="w-full rounded-xl border border-white/10 bg-[#071426] px-4 py-3 text-sm text-white outline-none focus:border-cyan-400/50"
                              >
                                <option value="text">
                                  Text
                                </option>

                                <option value="mcq">
                                  Multiple Choice
                                </option>

                                <option value="multiple_choice">
                                  Multiple Choice
                                </option>

                                <option value="true_false">
                                  True / False
                                </option>
                              </select>
                            </div>

                            <div>
                              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                                Marks
                              </label>

                              <input
                                type="number"
                                min="0"
                                step="0.5"
                                value={
                                  question.marks
                                }
                                onChange={(
                                  event
                                ) =>
                                  updateQuestion(
                                    index,
                                    "marks",
                                    event.target
                                      .value
                                  )
                                }
                                className="w-full rounded-xl border border-white/10 bg-[#071426] px-4 py-3 text-sm text-white outline-none focus:border-cyan-400/50"
                              />
                            </div>
                          </div>

                          {(question.type ===
                            "mcq" ||
                            question.type ===
                              "multiple_choice") && (
                            <div>
                              <div className="mb-3 flex items-center justify-between">
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                  Options
                                </label>

                                <button
                                  type="button"
                                  onClick={() =>
                                    addOption(
                                      index
                                    )
                                  }
                                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-300 hover:text-cyan-200"
                                >
                                  <Plus
                                    size={14}
                                  />
                                  Add option
                                </button>
                              </div>

                              <div className="space-y-2">
                                {(
                                  question.options ||
                                  []
                                ).map(
                                  (
                                    option,
                                    optionIndex
                                  ) => (
                                    <div
                                      key={
                                        optionIndex
                                      }
                                      className="flex gap-2"
                                    >
                                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-[#071426] text-xs font-bold text-slate-400">
                                        {String.fromCharCode(
                                          65 +
                                            optionIndex
                                        )}
                                      </div>

                                      <input
                                        value={
                                          option
                                        }
                                        onChange={(
                                          event
                                        ) =>
                                          updateOption(
                                            index,
                                            optionIndex,
                                            event
                                              .target
                                              .value
                                          )
                                        }
                                        className="min-w-0 flex-1 rounded-xl border border-white/10 bg-[#071426] px-4 py-3 text-sm text-white outline-none focus:border-cyan-400/50"
                                        placeholder={`Option ${String.fromCharCode(
                                          65 +
                                            optionIndex
                                        )}`}
                                      />

                                      <button
                                        type="button"
                                        onClick={() =>
                                          removeOption(
                                            index,
                                            optionIndex
                                          )
                                        }
                                        className="rounded-xl border border-red-400/10 px-3 text-red-300 hover:bg-red-500/10"
                                      >
                                        <Trash2
                                          size={15}
                                        />
                                      </button>
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          )}

                          <div>
                            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                              Correct Answer
                            </label>

                            <input
                              value={
                                question.correct_answer
                              }
                              onChange={(
                                event
                              ) =>
                                updateQuestion(
                                  index,
                                  "correct_answer",
                                  event.target
                                    .value
                                )
                              }
                              className="w-full rounded-xl border border-emerald-400/10 bg-[#071426] px-4 py-3 text-sm text-white outline-none focus:border-emerald-400/40"
                              placeholder="Enter the correct answer"
                            />
                          </div>

                          <div>
                            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                              Explanation
                            </label>

                            <textarea
                              rows={3}
                              value={
                                question.explanation
                              }
                              onChange={(
                                event
                              ) =>
                                updateQuestion(
                                  index,
                                  "explanation",
                                  event.target
                                    .value
                                )
                              }
                              className="w-full resize-y rounded-xl border border-white/10 bg-[#071426] px-4 py-3 text-sm text-white outline-none focus:border-cyan-400/50"
                              placeholder="Optional explanation..."
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              }
            )}
          </div>

          <div className="flex flex-col gap-3 border-t border-white/10 p-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() =>
                navigate(-1)
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold text-slate-300 hover:bg-white/5 hover:text-white"
            >
              <ArrowLeft size={17} />
              Back
            </button>

            <button
              type="button"
              onClick={saveAssignment}
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-6 py-3 text-sm font-bold text-[#020617] hover:bg-cyan-400 disabled:opacity-60"
            >
              {saving ? (
                <>
                  <Loader2
                    size={17}
                    className="animate-spin"
                  />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={17} />
                  Save Questions
                </>
              )}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}