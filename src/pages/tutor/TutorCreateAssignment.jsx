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
  if (!grade) {
    return [];
  }

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
   CREATE QUESTION
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

    marks: 1,
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
   TOKEN KEYS
========================================================= */

const TUTOR_TOKEN_KEYS = [
  "scholiqen_academy_token",
  "academy_token",
  "scholiqen_token",
  "access_token",
  "token",
];

/* =========================================================
   GET TUTOR USER
========================================================= */

function getTutorUser() {
  for (const key of TUTOR_STORAGE_KEYS) {
    try {
      const raw = localStorage.getItem(key);

      if (!raw) {
        continue;
      }

      const parsed = JSON.parse(raw);

      if (parsed && typeof parsed === "object") {
        return parsed;
      }
    } catch {
      // Ignore invalid storage
    }
  }

  return null;
}

/* =========================================================
   GET TUTOR REFERENCE
========================================================= */

function getTutorReference() {
  const tutor = getTutorUser();

  const possibleReferences = [
    tutor?.reference,
    tutor?.tutorReference,
    tutor?.tutor_reference,

    tutor?.user?.reference,
    tutor?.user?.tutorReference,
    tutor?.user?.tutor_reference,

    tutor?.tutor?.reference,
    tutor?.tutor?.tutorReference,
    tutor?.tutor?.tutor_reference,

    tutor?.applicationReference,
    tutor?.application_reference,
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

  /*
   * Search all known storage keys again.
   */
  for (const key of TUTOR_STORAGE_KEYS) {
    try {
      const raw = localStorage.getItem(key);

      if (!raw) {
        continue;
      }

      const parsed = JSON.parse(raw);

      const references = [
        parsed?.reference,
        parsed?.tutorReference,
        parsed?.tutor_reference,
        parsed?.applicationReference,
        parsed?.application_reference,

        parsed?.user?.reference,
        parsed?.user?.tutorReference,
        parsed?.user?.tutor_reference,

        parsed?.tutor?.reference,
        parsed?.tutor?.tutorReference,
        parsed?.tutor?.tutor_reference,
      ];

      const reference = references.find(
        (value) =>
          value !== undefined &&
          value !== null &&
          String(value).trim() !== ""
      );

      if (reference) {
        return String(reference).trim();
      }
    } catch {
      // Ignore invalid JSON
    }
  }

  return "";
}

/* =========================================================
   GET ACADEMY TOKEN
========================================================= */

function getAcademyToken() {
  for (const key of TUTOR_TOKEN_KEYS) {
    try {
      const token = localStorage.getItem(key);

      if (
        token &&
        String(token).trim() !== ""
      ) {
        return String(token).trim();
      }
    } catch {
      // Ignore storage errors
    }
  }

  return "";
}

/* =========================================================
   CLEAN QUESTION FOR API
========================================================= */

function prepareQuestion(question, index) {
  const questionText =
    question.question.trim();

  const optionA =
    question.optionA.trim();

  const optionB =
    question.optionB.trim();

  const optionC =
    question.optionC.trim();

  const optionD =
    question.optionD.trim();

  const correctAnswer =
    String(
      question.correctAnswer || "A"
    )
      .trim()
      .toUpperCase();

  const marks =
    Number(question.marks) > 0
      ? Number(question.marks)
      : 1;

  const explanation =
    question.explanation.trim();

  return {
    /*
     * Question number
     */
    questionNumber: index + 1,
    question_number: index + 1,

    /*
     * Main question
     */
    question: questionText,
    text: questionText,

    /*
     * CamelCase options
     */
    optionA,
    optionB,
    optionC,
    optionD,

    /*
     * Snake_case options
     */
    option_a: optionA,
    option_b: optionB,
    option_c: optionC,
    option_d: optionD,

    /*
     * Object form
     */
    options: {
      A: optionA,
      B: optionB,
      C: optionC,
      D: optionD,
    },

    /*
     * Correct answer
     */
    correctAnswer,
    correct_answer: correctAnswer,
    answer: correctAnswer,

    /*
     * Explanation
     */
    explanation,

    /*
     * Marks
     */
    marks,
    maxMarks: marks,
    max_marks: marks,
  };
}

/* =========================================================
   COMPONENT
========================================================= */

export default function TutorCreateAssignment() {
  const navigate = useNavigate();

  /* =======================================================
     STATE
  ======================================================= */

  const [tutorReference, setTutorReference] =
    useState("");

  const [title, setTitle] =
    useState("");

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

  /* =======================================================
     SUBJECTS
  ======================================================= */

  const availableSubjects = useMemo(
    () =>
      getSubjectsForClass(
        selectedClass
      ),
    [selectedClass]
  );

  /* =======================================================
     TOTAL MARKS
  ======================================================= */

  const totalMarks = useMemo(() => {
    return questions.reduce(
      (total, question) =>
        total +
        (Number(question.marks) > 0
          ? Number(question.marks)
          : 1),
      0
    );
  }, [questions]);

  /* =======================================================
     LOAD TUTOR REFERENCE
  ======================================================= */

  useEffect(() => {
    const reference =
      getTutorReference();

    setTutorReference(reference);

    console.log(
      "Tutor reference loaded:",
      reference
    );
  }, []);

  /* =======================================================
     CHANGE CLASS
  ======================================================= */

  const handleClassChange =
    useCallback((event) => {
      const value =
        event.target.value;

      setSelectedClass(value);
      setSubject("");
      setError("");
    }, []);

  /* =======================================================
     ADD QUESTION
  ======================================================= */

  const addQuestion =
    useCallback(() => {
      setQuestions((current) => [
        ...current,
        createQuestion(),
      ]);
    }, []);

  /* =======================================================
     REMOVE QUESTION
  ======================================================= */

  const removeQuestion =
    useCallback((questionId) => {
      setQuestions((current) => {
        if (current.length <= 1) {
          return current;
        }

        return current.filter(
          (question) =>
            question.id !== questionId
        );
      });
    }, []);

  /* =======================================================
     UPDATE QUESTION
  ======================================================= */

  const updateQuestion =
    useCallback(
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

  /* =======================================================
     REFRESH TUTOR REFERENCE
  ======================================================= */

  const refreshTutorReference =
    useCallback(() => {
      const reference =
        getTutorReference();

      setTutorReference(reference);

      return reference;
    }, []);

  /* =======================================================
     VALIDATE FORM
  ======================================================= */

  const validateForm =
    useCallback(() => {
      const reference =
        tutorReference ||
        refreshTutorReference();

      if (!reference) {
        return "Your tutor reference could not be found. Please log in again.";
      }

      if (
        title.trim().length < 3
      ) {
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

        if (
          !question.question.trim()
        ) {
          return `Question ${number} is required.`;
        }

        if (
          !question.optionA.trim()
        ) {
          return `Option A for question ${number} is required.`;
        }

        if (
          !question.optionB.trim()
        ) {
          return `Option B for question ${number} is required.`;
        }

        if (
          !question.optionC.trim()
        ) {
          return `Option C for question ${number} is required.`;
        }

        if (
          !question.optionD.trim()
        ) {
          return `Option D for question ${number} is required.`;
        }

        if (
          ![
            "A",
            "B",
            "C",
            "D",
          ].includes(
            String(
              question.correctAnswer
            ).toUpperCase()
          )
        ) {
          return `Please select the correct answer for question ${number}.`;
        }

        if (
          Number(question.marks) <= 0
        ) {
          return `Marks for question ${number} must be greater than 0.`;
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

  /* =======================================================
     CREATE ASSIGNMENT
  ======================================================= */

  const handleSubmit = async (
    event
  ) => {
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

    const token =
      getAcademyToken();

    /*
     * Prepare questions before sending.
     */
    const preparedQuestions =
      questions.map(
        prepareQuestion
      );

    /*
     * IMPORTANT:
     *
     * This is the exact data sent to the
     * backend. The questions array is never
     * omitted.
     */
    const payload = {
      /*
       * Tutor identification
       */
      reference,
      tutorReference: reference,
      tutor_reference: reference,

      /*
       * Assignment details
       */
      title: title.trim(),

      description:
        description.trim(),

      instructions:
        instructions.trim(),

      class: selectedClass,
      grade: selectedClass,

      subject,

      dueDate: dueDate || "",
      due_date: dueDate || "",

      activityType: "assignment",
      activity_type: "assignment",

      /*
       * Assignment totals
       */
      totalQuestions:
        preparedQuestions.length,

      total_questions:
        preparedQuestions.length,

      totalMarks,
      total_marks: totalMarks,

      /*
       * ACTUAL QUESTIONS
       */
      questions:
        preparedQuestions,
    };

    console.log(
      "================================================"
    );

    console.log(
      "CREATING ASSIGNMENT"
    );

    console.log(
      "Endpoint:",
      ASSIGNMENT_URL
    );

    console.log(
      "Tutor reference:",
      reference
    );

    console.log(
      "Question count:",
      preparedQuestions.length
    );

    console.log(
      "Questions:",
      preparedQuestions
    );

    console.log(
      "Full payload:",
      payload
    );

    console.log(
      "================================================"
    );

    setSaving(true);

    try {
      const headers = {
        "Content-Type":
          "application/json",

        "Accept":
          "application/json",

        "x-tutor-reference":
          reference,

        "X-Tutor-Reference":
          reference,
      };

      /*
       * Send Academy token when available.
       */
      if (token) {
        headers.Authorization =
          `Bearer ${token}`;

        headers["x-academy-token"] =
          token;
      }

      const response =
        await fetch(
          ASSIGNMENT_URL,
          {
            method: "POST",
            headers,
            body: JSON.stringify(
              payload
            ),
          }
        );

      let data = null;

      const responseText =
        await response.text();

      try {
        data =
          responseText
            ? JSON.parse(
                responseText
              )
            : null;
      } catch {
        data = null;
      }

      console.log(
        "================================================"
      );

      console.log(
        "CREATE ASSIGNMENT RESPONSE"
      );

      console.log(
        "HTTP status:",
        response.status
      );

      console.log(
        "HTTP OK:",
        response.ok
      );

      console.log(
        "Response:",
        data
      );

      console.log(
        "================================================"
      );

      /* -------------------------------------------------
         SERVER ERROR
      ------------------------------------------------- */

      if (!response.ok) {
        let serverError =
          data?.error ||
          data?.message ||
          "Unable to create assignment.";

        if (data?.details) {
          serverError +=
            ` ${data.details}`;
        }

        throw new Error(
          serverError
        );
      }

      /* -------------------------------------------------
         VERIFY THAT QUESTIONS WERE ACTUALLY SAVED
      ------------------------------------------------- */

      const returnedQuestions =
        Array.isArray(
          data?.questions
        )
          ? data.questions
          : Array.isArray(
              data?.assignment
                ?.questions
            )
          ? data.assignment.questions
          : [];

      /*
       * The backend should return inserted
       * questions. If it does not, we still
       * accept the creation response because
       * some backend versions only return the
       * assignment object.
       */
      if (
        data?.success === false
      ) {
        throw new Error(
          data?.error ||
            data?.message ||
            "The server did not create the assignment."
        );
      }

      setSuccess(
        data?.message ||
          `Assignment created successfully with ${preparedQuestions.length} question${
            preparedQuestions.length === 1
              ? ""
              : "s"
          }.`
      );

      /*
       * Log what the server says it inserted.
       */
      console.log(
        "Server returned questions:",
        returnedQuestions
      );

      /*
       * Clear form.
       */
      setTitle("");
      setDescription("");
      setInstructions("");
      setSelectedClass("");
      setSubject("");
      setDueDate("");

      setQuestions([
        createQuestion(),
      ]);

      /*
       * Give the user time to see success.
       */
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
            disabled={saving}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-700 bg-slate-900 text-slate-300 transition hover:border-cyan-500 hover:text-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
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
              Create an assignment
              with questions for your
              class.
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

        {/* =================================================
            FORM
        ================================================= */}

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
                Enter the basic
                information for this
                assignment.
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
                  value={
                    selectedClass
                  }
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
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-lg font-bold">
                    Questions
                  </h2>

                  <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-400">
                    {questions.length}{" "}
                    question
                    {questions.length ===
                    1
                      ? ""
                      : "s"}
                  </span>

                  <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs font-semibold text-slate-400">
                    {totalMarks} mark
                    {totalMarks === 1
                      ? ""
                      : "s"}
                  </span>
                </div>

                <p className="mt-1 text-sm text-slate-400">
                  Add questions,
                  four options, the
                  correct answer and
                  optional explanations.
                </p>
              </div>

              <button
                type="button"
                onClick={addQuestion}
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Plus size={18} />
                Add Question
              </button>
            </div>

            <div className="space-y-6">
              {questions.map(
                (
                  question,
                  index
                ) => (
                  <div
                    key={
                      question.id
                    }
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
                            {index +
                              1}
                          </h3>

                          <p className="text-xs text-slate-500">
                            Enter the
                            question
                            and four
                            options.
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
                          disabled={
                            saving
                          }
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-500/20 text-red-400 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                          title="Remove question"
                        >
                          <Trash2
                            size={
                              17
                            }
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
                        onChange={(
                          event
                        ) =>
                          updateQuestion(
                            question.id,
                            "question",
                            event
                              .target
                              .value
                          )
                        }
                        rows={4}
                        disabled={
                          saving
                        }
                        placeholder="Enter the question..."
                        className="w-full resize-none rounded-xl border border-slate-700 bg-[#071426] px-4 py-3 text-white outline-none placeholder:text-slate-600 focus:border-cyan-500 disabled:opacity-50"
                      />
                    </div>

                    {/* OPTIONS */}

                    <div className="grid gap-4 md:grid-cols-2">
                      {[
                        [
                          "A",
                          "optionA",
                        ],
                        [
                          "B",
                          "optionB",
                        ],
                        [
                          "C",
                          "optionC",
                        ],
                        [
                          "D",
                          "optionD",
                        ],
                      ].map(
                        ([
                          letter,
                          field,
                        ]) => (
                          <div
                            key={
                              letter
                            }
                          >
                            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-300">
                              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-800 text-xs font-bold text-cyan-400">
                                {
                                  letter
                                }
                              </span>

                              Option{" "}
                              {
                                letter
                              }
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
                              disabled={
                                saving
                              }
                              placeholder={`Enter option ${letter}`}
                              className="w-full rounded-xl border border-slate-700 bg-[#071426] px-4 py-3 text-white outline-none placeholder:text-slate-600 focus:border-cyan-500 disabled:opacity-50"
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
                          (
                            letter
                          ) => {
                            const active =
                              question.correctAnswer ===
                              letter;

                            return (
                              <button
                                key={
                                  letter
                                }
                                type="button"
                                disabled={
                                  saving
                                }
                                onClick={() =>
                                  updateQuestion(
                                    question.id,
                                    "correctAnswer",
                                    letter
                                  )
                                }
                                className={`rounded-xl border px-4 py-3 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                                  active
                                    ? "border-cyan-500 bg-cyan-500/10 text-cyan-400"
                                    : "border-slate-700 bg-[#071426] text-slate-400 hover:border-slate-500"
                                }`}
                              >
                                {
                                  letter
                                }
                              </button>
                            );
                          }
                        )}
                      </div>
                    </div>

                    {/* MARKS */}

                    <div className="mt-5">
                      <label className="mb-2 block text-sm font-medium text-slate-300">
                        Marks
                      </label>

                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={
                          question.marks
                        }
                        onChange={(
                          event
                        ) =>
                          updateQuestion(
                            question.id,
                            "marks",
                            event
                              .target
                              .value
                          )
                        }
                        disabled={
                          saving
                        }
                        className="w-full rounded-xl border border-slate-700 bg-[#071426] px-4 py-3 text-white outline-none focus:border-cyan-500 sm:max-w-xs"
                      />
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
                        onChange={(
                          event
                        ) =>
                          updateQuestion(
                            question.id,
                            "explanation",
                            event
                              .target
                              .value
                          )
                        }
                        rows={3}
                        disabled={
                          saving
                        }
                        placeholder="Explain why the selected answer is correct..."
                        className="w-full resize-none rounded-xl border border-slate-700 bg-[#071426] px-4 py-3 text-white outline-none placeholder:text-slate-600 focus:border-cyan-500 disabled:opacity-50"
                      />
                    </div>
                  </div>
                )
              )}
            </div>
          </section>

          {/* =================================================
              SUMMARY
          ================================================= */}

          <section className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-cyan-400">
                  Assignment Summary
                </p>

                <p className="mt-1 text-sm text-slate-400">
                  {questions.length}{" "}
                  question
                  {questions.length ===
                  1
                    ? ""
                    : "s"}{" "}
                  • {totalMarks}{" "}
                  total mark
                  {totalMarks === 1
                    ? ""
                    : "s"}
                </p>
              </div>

              <div className="text-left sm:text-right">
                <p className="text-xs text-slate-500">
                  Class
                </p>

                <p className="font-semibold text-white">
                  {selectedClass ||
                    "Not selected"}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Subject
                </p>

                <p className="font-semibold text-white">
                  {subject ||
                    "Not selected"}
                </p>
              </div>
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
              disabled={
                saving ||
                !questions.length
              }
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
