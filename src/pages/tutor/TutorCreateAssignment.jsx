import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  FileText,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";

/* =========================================================
   API
========================================================= */

const API_BASE_URL = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000"
).replace(/\/$/, "");

const ASSIGNMENT_URL =
  `${API_BASE_URL}/api/academy/tutor/assignments`;

/* =========================================================
   CLASS OPTIONS
========================================================= */

const CLASS_OPTIONS = [
  "Primary 1",
  "Primary 2",
  "Primary 3",
  "Primary 4",
  "Primary 5",
  "Primary 6",
  "JSS 1",
  "JSS 2",
  "JSS 3",
  "SS 1",
  "SS 2",
  "SS 3",
];

/* =========================================================
   SUBJECT OPTIONS
========================================================= */

const PRIMARY_SUBJECTS = [
  "English Studies",
  "Mathematics",
  "Basic Science",
  "Social Studies",
  "Civic Education",
  "Computer Studies",
  "Agricultural Science",
  "Cultural and Creative Arts",
  "Physical and Health Education",
  "Religious Studies",
];

const JSS_SUBJECTS = [
  "English Language",
  "Mathematics",
  "Basic Science",
  "Basic Technology",
  "Social Studies",
  "Civic Education",
  "Computer Studies",
  "Agricultural Science",
  "Business Studies",
  "Home Economics",
  "Cultural and Creative Arts",
  "Christian Religious Studies",
  "Islamic Religious Studies",
];

const SS_SUBJECTS = [
  "English Language",
  "Mathematics",
  "Biology",
  "Chemistry",
  "Physics",
  "Economics",
  "Government",
  "Literature in English",
  "Civic Education",
  "Agricultural Science",
  "Commerce",
  "Financial Accounting",
  "Geography",
  "Computer Science",
  "Data Processing",
  "Christian Religious Studies",
  "Islamic Religious Studies",
  "Further Mathematics",
  "French",
];

/* =========================================================
   SUBJECT HELPER
========================================================= */

function getSubjectsForClass(grade) {
  if (grade.startsWith("Primary")) {
    return PRIMARY_SUBJECTS;
  }

  if (grade.startsWith("JSS")) {
    return JSS_SUBJECTS;
  }

  if (grade.startsWith("SS")) {
    return SS_SUBJECTS;
  }

  return [];
}

/* =========================================================
   QUESTION CREATOR
========================================================= */

function createQuestion() {
  let id;

  try {
    id = crypto.randomUUID();
  } catch {
    id = `${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}`;
  }

  return {
    id,
    question: "",
    optionA: "",
    optionB: "",
    optionC: "",
    optionD: "",
    correctAnswer: "A",
    explanation: "",
  };
}

/* =========================================================
   STORAGE KEYS
========================================================= */

const TUTOR_STORAGE_KEYS = [
  "scholiqen_academy_user",
  "academy_user",
  "scholiqen_user",
  "user",
];

/* =========================================================
   GET TUTOR REFERENCE
========================================================= */

function getTutorReference() {
  for (const key of TUTOR_STORAGE_KEYS) {
    try {
      const raw = localStorage.getItem(key);

      if (!raw) {
        continue;
      }

      const parsed = JSON.parse(raw);

      const possibleReferences = [
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

      const found = possibleReferences.find(
        (value) =>
          value !== undefined &&
          value !== null &&
          String(value).trim() !== ""
      );

      if (found) {
        return String(found).trim();
      }
    } catch {
      // Ignore invalid localStorage JSON
    }
  }

  return "";
}

/* =========================================================
   COMPONENT
========================================================= */

export default function TutorCreateAssignment() {
  const navigate = useNavigate();

  /* -------------------------------------------------------
     STATE
  ------------------------------------------------------- */

  const [tutorReference, setTutorReference] =
    useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] =
    useState("");
  const [instructions, setInstructions] =
    useState("");

  const [selectedClass, setSelectedClass] =
    useState("");

  const [subject, setSubject] =
    useState("");

  const [dueDate, setDueDate] =
    useState("");

  const [questions, setQuestions] =
    useState([createQuestion()]);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  /* -------------------------------------------------------
     SUBJECTS
  ------------------------------------------------------- */

  const availableSubjects = useMemo(
    () => getSubjectsForClass(selectedClass),
    [selectedClass]
  );

  /* -------------------------------------------------------
     LOAD TUTOR REFERENCE
  ------------------------------------------------------- */

  useEffect(() => {
    const reference =
      getTutorReference();

    setTutorReference(reference);
  }, []);

  /* -------------------------------------------------------
     CHANGE CLASS
  ------------------------------------------------------- */

  const handleClassChange = useCallback(
    (event) => {
      const value =
        event.target.value;

      setSelectedClass(value);

      setSubject("");
      setError("");
    },
    []
  );

  /* -------------------------------------------------------
     ADD QUESTION
  ------------------------------------------------------- */

  const addQuestion = useCallback(() => {
    setQuestions((current) => [
      ...current,
      createQuestion(),
    ]);
  }, []);

  /* -------------------------------------------------------
     REMOVE QUESTION
  ------------------------------------------------------- */

  const removeQuestion = useCallback(
    (questionId) => {
      setQuestions((current) => {
        if (current.length <= 1) {
          return current;
        }

        return current.filter(
          (question) =>
            question.id !== questionId
        );
      });
    },
    []
  );

  /* -------------------------------------------------------
     UPDATE QUESTION
  ------------------------------------------------------- */

  const updateQuestion = useCallback(
    (questionId, field, value) => {
      setQuestions((current) =>
        current.map((question) =>
          question.id === questionId
            ? {
                ...question,
                [field]: value,
              }
            : question
        )
      );
    },
    []
  );

  /* -------------------------------------------------------
     REFRESH TUTOR REFERENCE
  ------------------------------------------------------- */

  const refreshTutorReference =
    useCallback(() => {
      const reference =
        getTutorReference();

      setTutorReference(reference);

      return reference;
    }, []);

  /* -------------------------------------------------------
     VALIDATE
  ------------------------------------------------------- */

  const validateForm = useCallback(() => {
    const reference =
      tutorReference ||
      refreshTutorReference();

    if (!reference) {
      return "Your tutor reference could not be found. Please log in again.";
    }

    if (title.trim().length < 3) {
      return "Assignment title must be at least 3 characters.";
    }

    if (!selectedClass) {
      return "Please select a class.";
    }

    if (!subject) {
      return "Please select a subject.";
    }

    if (!questions.length) {
      return "Please add at least one question.";
    }

    for (
      let index = 0;
      index < questions.length;
      index++
    ) {
      const question =
        questions[index];

      const number = index + 1;

      if (!question.question.trim()) {
        return `Question ${number} is required.`;
      }

      if (!question.optionA.trim()) {
        return `Option A for question ${number} is required.`;
      }

      if (!question.optionB.trim()) {
        return `Option B for question ${number} is required.`;
      }

      if (!question.optionC.trim()) {
        return `Option C for question ${number} is required.`;
      }

      if (!question.optionD.trim()) {
        return `Option D for question ${number} is required.`;
      }

      if (
        !["A", "B", "C", "D"].includes(
          question.correctAnswer
        )
      ) {
        return `Please select the correct answer for question ${number}.`;
      }
    }

    return "";
  }, [
    tutorReference,
    refreshTutorReference,
    title,
    selectedClass,
    subject,
    questions,
  ]);

  /* -------------------------------------------------------
     CREATE ASSIGNMENT
  ------------------------------------------------------- */

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const validationError =
      validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    const reference =
      tutorReference ||
      refreshTutorReference();

    if (!reference) {
      setError(
        "Tutor reference is missing. Please log in again."
      );
      return;
    }

    setSaving(true);

    try {
      const payload = {
        reference,

        tutorReference: reference,

        tutor_reference: reference,

        title: title.trim(),

        description:
          description.trim(),

        instructions:
          instructions.trim(),

        class: selectedClass,

        grade: selectedClass,

        subject,

        dueDate: dueDate || "",

        activityType:
          "assignment",

        activity_type:
          "assignment",

        questions:
          questions.map(
            (question, index) => ({
              questionNumber:
                index + 1,

              question:
                question.question.trim(),

              options: {
                A:
                  question.optionA.trim(),

                B:
                  question.optionB.trim(),

                C:
                  question.optionC.trim(),

                D:
                  question.optionD.trim(),
              },

              optionA:
                question.optionA.trim(),

              optionB:
                question.optionB.trim(),

              optionC:
                question.optionC.trim(),

              optionD:
                question.optionD.trim(),

              correctAnswer:
                question.correctAnswer,

              explanation:
                question.explanation.trim(),
            })
          ),
      };

      console.log(
        "Creating academy assignment:",
        payload
      );

      const response =
        await fetch(
          ASSIGNMENT_URL,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify(
              payload
            ),
          }
        );

      let data = null;

      try {
        data =
          await response.json();
      } catch {
        data = null;
      }

      console.log(
        "Create assignment response:",
        {
          status: response.status,
          ok: response.ok,
          data,
        }
      );

      /* ---------------------------------------------------
         SERVER ERROR
      --------------------------------------------------- */

      if (!response.ok) {
        const serverError =
          data?.details
            ? `${
                data?.error ||
                data?.message ||
                "Unable to create assignment."
              } ${data.details}`
            : data?.error ||
              data?.message ||
              `Unable to create assignment. Server returned ${response.status}.`;

        throw new Error(
          serverError
        );
      }

      /* ---------------------------------------------------
         SUCCESS
      --------------------------------------------------- */

      setSuccess(
        data?.message ||
          "Assignment created successfully."
      );

      setTitle("");
      setDescription("");
      setInstructions("");
      setSelectedClass("");
      setSubject("");
      setDueDate("");
      setQuestions([
        createQuestion(),
      ]);

      /* ---------------------------------------------------
         OPTIONAL REDIRECT
      --------------------------------------------------- */

      setTimeout(() => {
        navigate(
          "/academy/tutor/assignments"
        );
      }, 1200);
    } catch (error) {
      console.error(
        "Create assignment error:",
        error
      );

      setError(
        error?.message ||
          "Unable to create assignment."
      );
    } finally {
      setSaving(false);
    }
  };

  /* =======================================================
     UI
  ======================================================= */

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      {/* =================================================
          HEADER
      ================================================= */}

      <div className="border-b border-slate-800 bg-[#071426]">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-5 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() =>
              navigate(-1)
            }
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-700 bg-slate-900 text-slate-300 transition hover:border-cyan-500 hover:text-cyan-400"
          >
            <ArrowLeft
              size={19}
            />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <FileText
                size={20}
                className="text-cyan-400"
              />

              <h1 className="text-xl font-bold sm:text-2xl">
                Create Assignment
              </h1>
            </div>

            <p className="mt-1 text-sm text-slate-400">
              Create an assignment for
              your class.
            </p>
          </div>
        </div>
      </div>

      {/* =================================================
          CONTENT
      ================================================= */}

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* =================================================
            ALERTS
        ================================================= */}

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
            <X
              size={20}
              className="mt-0.5 shrink-0"
            />

            <div>
              <p className="font-semibold">
                Unable to create
                assignment
              </p>

              <p className="mt-1 break-words">
                {error}
              </p>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-300">
            <CheckCircle2
              size={20}
            />

            <span>
              {success}
            </span>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {/* =================================================
              ASSIGNMENT DETAILS
          ================================================= */}

          <section className="rounded-2xl border border-slate-800 bg-[#071426] p-5 shadow-xl sm:p-6">
            <div className="mb-6">
              <h2 className="text-lg font-bold">
                Assignment Details
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Enter the basic information
                for this assignment.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {/* TITLE */}

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Assignment Title
                </label>

                <input
                  type="text"
                  value={title}
                  onChange={(event) =>
                    setTitle(
                      event.target.value
                    )
                  }
                  placeholder="Enter assignment title"
                  className="w-full rounded-xl border border-slate-700 bg-[#020617] px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-500"
                />
              </div>

              {/* CLASS */}

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Class
                </label>

                <select
                  value={selectedClass}
                  onChange={
                    handleClassChange
                  }
                  className="w-full rounded-xl border border-slate-700 bg-[#020617] px-4 py-3 text-white outline-none focus:border-cyan-500"
                >
                  <option value="">
                    Select class
                  </option>

                  {CLASS_OPTIONS.map(
                    (className) => (
                      <option
                        key={className}
                        value={
                          className
                        }
                      >
                        {className}
                      </option>
                    )
                  )}
                </select>
              </div>

              {/* SUBJECT */}

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Subject
                </label>

                <select
                  value={subject}
                  onChange={(event) =>
                    setSubject(
                      event.target.value
                    )
                  }
                  disabled={
                    !selectedClass
                  }
                  className="w-full rounded-xl border border-slate-700 bg-[#020617] px-4 py-3 text-white outline-none disabled:cursor-not-allowed disabled:opacity-50 focus:border-cyan-500"
                >
                  <option value="">
                    {selectedClass
                      ? "Select subject"
                      : "Select class first"}
                  </option>

                  {availableSubjects.map(
                    (item) => (
                      <option
                        key={item}
                        value={item}
                      >
                        {item}
                      </option>
                    )
                  )}
                </select>
              </div>

              {/* DUE DATE */}

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Due Date
                  <span className="ml-2 text-xs text-slate-500">
                    Optional
                  </span>
                </label>

                <input
                  type="datetime-local"
                  value={dueDate}
                  onChange={(event) =>
                    setDueDate(
                      event.target.value
                    )
                  }
                  className="w-full rounded-xl border border-slate-700 bg-[#020617] px-4 py-3 text-white outline-none focus:border-cyan-500"
                />
              </div>

              {/* TUTOR REFERENCE */}

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Tutor Reference
                </label>

                <input
                  type="text"
                  value={
                    tutorReference ||
                    "Not found"
                  }
                  readOnly
                  className="w-full cursor-not-allowed rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-3 text-slate-400 outline-none"
                />
              </div>

              {/* DESCRIPTION */}

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Description
                  <span className="ml-2 text-xs text-slate-500">
                    Optional
                  </span>
                </label>

                <textarea
                  value={description}
                  onChange={(event) =>
                    setDescription(
                      event.target.value
                    )
                  }
                  rows={4}
                  placeholder="Describe what students should know about this assignment..."
                  className="w-full resize-none rounded-xl border border-slate-700 bg-[#020617] px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-500"
                />
              </div>

              {/* INSTRUCTIONS */}

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Instructions
                  <span className="ml-2 text-xs text-slate-500">
                    Optional
                  </span>
                </label>

                <textarea
                  value={instructions}
                  onChange={(event) =>
                    setInstructions(
                      event.target.value
                    )
                  }
                  rows={4}
                  placeholder="Give students instructions for completing the assignment..."
                  className="w-full resize-none rounded-xl border border-slate-700 bg-[#020617] px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-500"
                />
              </div>
            </div>
          </section>

          {/* =================================================
              QUESTIONS
          ================================================= */}

          <section className="rounded-2xl border border-slate-800 bg-[#071426] p-5 shadow-xl sm:p-6">
            <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-lg font-bold">
                  Questions
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  Add questions and choose
                  the correct answer.
                </p>
              </div>

              <button
                type="button"
                onClick={addQuestion}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
              >
                <Plus size={18} />
                Add Question
              </button>
            </div>

            <div className="space-y-6">
              {questions.map(
                (question, index) => (
                  <div
                    key={question.id}
                    className="rounded-2xl border border-slate-800 bg-[#020617] p-4 sm:p-5"
                  >
                    {/* QUESTION HEADER */}

                    <div className="mb-5 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500/10 text-sm font-bold text-cyan-400">
                          {index + 1}
                        </div>

                        <div>
                          <h3 className="font-semibold">
                            Question{" "}
                            {index + 1}
                          </h3>

                          <p className="text-xs text-slate-500">
                            Enter the question
                            and four options.
                          </p>
                        </div>
                      </div>

                      {questions.length >
                        1 && (
                        <button
                          type="button"
                          onClick={() =>
                            removeQuestion(
                              question.id
                            )
                          }
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-500/20 text-red-400 transition hover:bg-red-500/10"
                          title="Remove question"
                        >
                          <Trash2
                            size={17}
                          />
                        </button>
                      )}
                    </div>

                    {/* QUESTION TEXT */}

                    <div className="mb-5">
                      <label className="mb-2 block text-sm font-medium text-slate-300">
                        Question
                      </label>

                      <textarea
                        value={
                          question.question
                        }
                        onChange={(event) =>
                          updateQuestion(
                            question.id,
                            "question",
                            event.target
                              .value
                          )
                        }
                        rows={4}
                        placeholder="Enter the question..."
                        className="w-full resize-none rounded-xl border border-slate-700 bg-[#071426] px-4 py-3 text-white outline-none placeholder:text-slate-600 focus:border-cyan-500"
                      />
                    </div>

                    {/* OPTIONS */}

                    <div className="grid gap-4 md:grid-cols-2">
                      {[
                        ["A", "optionA"],
                        ["B", "optionB"],
                        ["C", "optionC"],
                        ["D", "optionD"],
                      ].map(
                        ([
                          letter,
                          field,
                        ]) => (
                          <div
                            key={letter}
                          >
                            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-300">
                              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-800 text-xs font-bold text-cyan-400">
                                {letter}
                              </span>

                              Option{" "}
                              {letter}
                            </label>

                            <input
                              type="text"
                              value={
                                question[
                                  field
                                ]
                              }
                              onChange={(
                                event
                              ) =>
                                updateQuestion(
                                  question.id,
                                  field,
                                  event
                                    .target
                                    .value
                                )
                              }
                              placeholder={`Enter option ${letter}`}
                              className="w-full rounded-xl border border-slate-700 bg-[#071426] px-4 py-3 text-white outline-none placeholder:text-slate-600 focus:border-cyan-500"
                            />
                          </div>
                        )
                      )}
                    </div>

                    {/* CORRECT ANSWER */}

                    <div className="mt-5">
                      <label className="mb-2 block text-sm font-medium text-slate-300">
                        Correct Answer
                      </label>

                      <div className="grid grid-cols-4 gap-2">
                        {[
                          "A",
                          "B",
                          "C",
                          "D",
                        ].map(
                          (letter) => {
                            const active =
                              question.correctAnswer ===
                              letter;

                            return (
                              <button
                                key={letter}
                                type="button"
                                onClick={() =>
                                  updateQuestion(
                                    question.id,
                                    "correctAnswer",
                                    letter
                                  )
                                }
                                className={`rounded-xl border px-4 py-3 text-sm font-bold transition ${
                                  active
                                    ? "border-cyan-500 bg-cyan-500/10 text-cyan-400"
                                    : "border-slate-700 bg-[#071426] text-slate-400 hover:border-slate-500"
                                }`}
                              >
                                {letter}
                              </button>
                            );
                          }
                        )}
                      </div>
                    </div>

                    {/* EXPLANATION */}

                    <div className="mt-5">
                      <label className="mb-2 block text-sm font-medium text-slate-300">
                        Explanation
                        <span className="ml-2 text-xs text-slate-500">
                          Optional
                        </span>
                      </label>

                      <textarea
                        value={
                          question.explanation
                        }
                        onChange={(event) =>
                          updateQuestion(
                            question.id,
                            "explanation",
                            event.target
                              .value
                          )
                        }
                        rows={3}
                        placeholder="Explain why the selected answer is correct..."
                        className="w-full resize-none rounded-xl border border-slate-700 bg-[#071426] px-4 py-3 text-white outline-none placeholder:text-slate-600 focus:border-cyan-500"
                      />
                    </div>
                  </div>
                )
              )}
            </div>
          </section>

          {/* =================================================
              BOTTOM ACTIONS
          ================================================= */}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() =>
                navigate(-1)
              }
              disabled={saving}
              className="rounded-xl border border-slate-700 bg-slate-900 px-6 py-3 text-sm font-semibold text-slate-300 transition hover:border-slate-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-6 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
                  Creating...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Create Assignment
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
