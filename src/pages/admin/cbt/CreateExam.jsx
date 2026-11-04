
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import {
  ArrowLeft,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  FileText,
  ImagePlus,
  Loader2,
  Plus,
  Save,
  Trash2,
  Upload,
  X,
  ClipboardList,
  Eye,
  Settings2,
  Layers3,
  AlertCircle,
  Pencil,
} from "lucide-react";

// ============================================================
// CONFIGURATION
// ============================================================

const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

const API_URL = `${API_BASE_URL}/api/admin/school-exams`;

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

const CLASSES = [
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

const SUBJECTS = [
  "Mathematics",
  "English Language",
  "Basic Science",
  "Basic Technology",
  "Social Studies",
  "Civic Education",
  "Computer Studies",
  "Agricultural Science",
  "Physical and Health Education",
  "Christian Religious Studies",
  "Islamic Religious Studies",
  "Business Studies",
  "Home Economics",
  "French",
  "Literature in English",
  "Government",
  "Economics",
  "Biology",
  "Chemistry",
  "Physics",
  "Geography",
  "Further Mathematics",
  "Financial Accounting",
  "Commerce",
];

// ============================================================
// HELPERS
// ============================================================

const createOption = (label) => ({
  label,
  text: "",
});

const createQuestion = (number = 1) => ({
  id: `${Date.now()}-${Math.random()}`,
  question_type: "objective",
  question_text: "",
  options: [
    createOption("A"),
    createOption("B"),
    createOption("C"),
    createOption("D"),
  ],
  correct_answer: "",
  explanation: "",
  marks: 1,
  passage_id: "",
  passage_title: "",
  passage: "",
  passage_order: number,
  image_url: "",
});

const getAdminToken = () => {
  const keys = [
    "scholiqen_auth_token",
    "scholiqen_token",
    "admin_token",
    "access_token",
    "token",
  ];

  for (const key of keys) {
    const value = localStorage.getItem(key);

    if (value) {
      return value.replace(/^Bearer\s+/i, "").trim();
    }
  }

  return "";
};

const parseOptions = (options) => {
  if (Array.isArray(options)) {
    return options.map((option, index) => {
      if (typeof option === "string") {
        return {
          label: String.fromCharCode(65 + index),
          text: option,
        };
      }

      return {
        label:
          option?.label ||
          String.fromCharCode(65 + index),
        text: String(
          option?.text ??
          option?.value ??
          ""
        ),
      };
    });
  }

  if (options && typeof options === "object") {
    return Object.entries(options).map(
      ([label, text]) => ({
        label,
        text: String(text ?? ""),
      })
    );
  }

  return [];
};

// ============================================================
// NORMALIZE SAVED QUESTION
// ============================================================

const normalizeQuestion = (question, index) => {
  const rawType =
    question.question_type ||
    question.questionType ||
    question.type ||
    "objective";

  const type =
    String(rawType).toLowerCase() === "comprehension"
      ? "comprehension"
      : "objective";

  let options = parseOptions(question.options);

  if (type === "objective" && options.length === 0) {
    options = [
      createOption("A"),
      createOption("B"),
      createOption("C"),
      createOption("D"),
    ];
  }

  return {
    id:
      question.id ||
      question.question_id ||
      `${Date.now()}-${index}-${Math.random()}`,

    question_type: type,

    question_text:
      question.question_text ??
      question.questionText ??
      question.question ??
      question.text ??
      "",

    options:
      type === "objective" ? options : [],

    correct_answer: String(
      question.correct_answer ??
      question.correctAnswer ??
      question.answer ??
      ""
    ),

    explanation:
      question.explanation ??
      question.reason ??
      "",

    marks: Number(question.marks) || 1,

    passage_id:
      question.passage_id ??
      question.passageId ??
      "",

    passage_title:
      question.passage_title ??
      question.passageTitle ??
      "",

    passage:
      question.passage ??
      "",

    passage_order:
      Number(
        question.passage_order ??
        question.passageOrder
      ) || index + 1,

    image_url:
      question.image_url ??
      question.imageUrl ??
      question.image ??
      "",
  };
};

// ============================================================
// COMPONENT
// ============================================================

export default function CreateExam() {
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

  // ----------------------------------------------------------
  // URL PARAMETERS
  // ----------------------------------------------------------

  const initialClass =
    searchParams.get("class") || "";

  const initialSubject =
    searchParams.get("subject") || "";

  const editId =
    searchParams.get("id") ||
    searchParams.get("edit") ||
    "";

  // ----------------------------------------------------------
  // SAVED EXAMINATION STATES
  // ----------------------------------------------------------

  const [editingExamId, setEditingExamId] =
    useState(editId);

  const [selectedExamId, setSelectedExamId] =
    useState(editId);

  const [savedExams, setSavedExams] =
    useState([]);

  const [loadingSavedExams, setLoadingSavedExams] =
    useState(false);

  const [isEditing, setIsEditing] =
    useState(Boolean(editId));

  // ----------------------------------------------------------
  // EXAM DETAILS
  // ----------------------------------------------------------

  const [examTitle, setExamTitle] = useState(
    initialSubject
      ? `${initialSubject} Examination`
      : "School Examination"
  );

  const [className, setClassName] =
    useState(initialClass);

  const [subject, setSubject] =
    useState(initialSubject);

  const [duration, setDuration] =
    useState("60");

  const [instructions, setInstructions] =
    useState(
      "Answer all questions. Choose the correct option for each objective question."
    );

  const [status, setStatus] =
    useState("draft");

  // ----------------------------------------------------------
  // QUESTIONS
  // ----------------------------------------------------------

  const [questions, setQuestions] =
    useState([createQuestion(1)]);

  const [activeQuestion, setActiveQuestion] =
    useState(0);

  // ----------------------------------------------------------
  // UI STATES
  // ----------------------------------------------------------

  const [saving, setSaving] = useState(false);

  const [loadingExam, setLoadingExam] =
    useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const [showSettings, setShowSettings] =
    useState(true);

  const [showPreview, setShowPreview] =
    useState(false);

  const [importing, setImporting] =
    useState(false);

  const [uploadingImage, setUploadingImage] =
    useState(false);

  // ----------------------------------------------------------
  // COUNTS
  // ----------------------------------------------------------

  const objectiveCount = useMemo(
    () =>
      questions.filter(
        (question) =>
          question.question_type === "objective"
      ).length,
    [questions]
  );

  const comprehensionCount = useMemo(
    () =>
      questions.filter(
        (question) =>
          question.question_type === "comprehension"
      ).length,
    [questions]
  );

  const totalMarks = useMemo(
    () =>
      questions.reduce(
        (total, question) =>
          total + (Number(question.marks) || 0),
        0
      ),
    [questions]
  );

  const currentQuestion =
    questions[activeQuestion];

  // ==========================================================
  // LOAD SAVED EXAMINATIONS FOR SELECTED CLASS
  // ==========================================================

  useEffect(() => {
    let cancelled = false;

    const loadSavedExams = async () => {
      if (!className) {
        setSavedExams([]);
        return;
      }

      try {
        setLoadingSavedExams(true);

        const token = getAdminToken();

        if (!token) {
          throw new Error(
            "Your admin session could not be found. Please log in again."
          );
        }

        const response = await fetch(
          `${API_URL}?class=${encodeURIComponent(className)}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.error ||
            result.message ||
            "Unable to load saved examinations."
          );
        }

        if (!cancelled) {
          const exams = Array.isArray(result.exams)
            ? result.exams
            : [];

          setSavedExams(exams);
        }
      } catch (err) {
        if (!cancelled) {
          setSavedExams([]);
          setError(
            err.message ||
            "Unable to load saved examinations."
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingSavedExams(false);
        }
      }
    };

    loadSavedExams();

    return () => {
      cancelled = true;
    };
  }, [className]);

  // ==========================================================
  // LOAD ONE SAVED EXAMINATION WITH ALL QUESTIONS
  // ==========================================================

  const loadExam = useCallback(
    async (examId) => {
      if (!examId) return;

      setLoadingExam(true);
      setError("");
      setSuccess("");

      try {
        const token = getAdminToken();

        if (!token) {
          throw new Error(
            "Your admin session could not be found. Please log in again."
          );
        }

        const response = await fetch(
          `${API_URL}/${encodeURIComponent(examId)}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.error ||
            result.message ||
            "Unable to load this examination."
          );
        }

        const exam =
          result.exam ||
          result.data ||
          result;

        const savedQuestions =
          Array.isArray(exam.questions)
            ? exam.questions
            : Array.isArray(result.questions)
              ? result.questions
              : [];

        setExamTitle(
          exam.title || "School Examination"
        );

        setClassName(
          exam.class_name ||
          exam.className ||
          ""
        );

        setSubject(exam.subject || "");

        setDuration(
          String(
            exam.duration_minutes ??
            exam.duration ??
            60
          )
        );

        setInstructions(
          exam.instructions || ""
        );

        setStatus(
          exam.status === "published"
            ? "published"
            : "draft"
        );

        setEditingExamId(String(exam.id || examId));
        setSelectedExamId(String(exam.id || examId));
        setIsEditing(true);

        if (savedQuestions.length > 0) {
          const loadedQuestions =
            savedQuestions.map(normalizeQuestion);

          setQuestions(loadedQuestions);
          setActiveQuestion(0);

          setSuccess(
            `${loadedQuestions.length} saved question(s) loaded successfully.`
          );
        } else {
          setQuestions([createQuestion(1)]);
          setActiveQuestion(0);

          setError(
            "The examination was found, but it contains no saved questions in school_exam_questions."
          );
        }
      } catch (err) {
        setError(
          err.message ||
          "Unable to load examination."
        );
      } finally {
        setLoadingExam(false);
      }
    },
    []
  );

  // ----------------------------------------------------------
  // LOAD EXAMINATION FROM URL
  // ----------------------------------------------------------

  useEffect(() => {
    if (!editId) return;

    loadExam(editId);
  }, [editId, loadExam]);

  // ----------------------------------------------------------
  // KEEP URL SELECTIONS IN SYNC FOR NEW EXAMS
  // ----------------------------------------------------------

  useEffect(() => {
    if (editId) return;

    const selectedClass =
      searchParams.get("class");

    const selectedSubject =
      searchParams.get("subject");

    if (selectedClass) {
      setClassName(selectedClass);
    }

    if (selectedSubject) {
      setSubject(selectedSubject);

      setExamTitle((previous) =>
        previous === "School Examination" ||
        previous === ""
          ? `${selectedSubject} Examination`
          : previous
      );
    }
  }, [searchParams, editId]);

  // ==========================================================
  // SELECT SAVED EXAMINATION
  // ==========================================================

  const handleSavedExamChange = async (examId) => {
    setSelectedExamId(examId);

    if (!examId) {
      setEditingExamId("");
      setIsEditing(false);

      setExamTitle(
        subject
          ? `${subject} Examination`
          : "School Examination"
      );

      setDuration("60");

      setInstructions(
        "Answer all questions. Choose the correct option for each objective question."
      );

      setStatus("draft");

      setQuestions([createQuestion(1)]);
      setActiveQuestion(0);

      setError("");
      setSuccess("");

      return;
    }

    await loadExam(examId);
  };

  // ==========================================================
  // UPDATE QUESTION
  // ==========================================================

  const updateQuestion = useCallback(
    (index, field, value) => {
      setQuestions((previous) =>
        previous.map((question, questionIndex) =>
          questionIndex === index
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

  // ==========================================================
  // DIRECT QUESTION IMAGE UPLOAD
  // ==========================================================

  const uploadQuestionImage = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setError("");
    setSuccess("");

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setError(
        "Unsupported image format. Please upload JPG, PNG, WEBP or GIF."
      );

      event.target.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setError(
        "Image size must not exceed 5MB. Please choose a smaller image."
      );

      event.target.value = "";
      return;
    }

    setUploadingImage(true);

    const reader = new FileReader();

    reader.onload = () => {
      const imageData = reader.result;

      if (
        typeof imageData !== "string" ||
        !imageData.startsWith("data:image/")
      ) {
        setError(
          "Unable to process this image. Please try another file."
        );

        setUploadingImage(false);
        event.target.value = "";
        return;
      }

      updateQuestion(
        activeQuestion,
        "image_url",
        imageData
      );

      setSuccess(
        "Question image uploaded successfully."
      );

      setUploadingImage(false);
      event.target.value = "";
    };

    reader.onerror = () => {
      setError(
        "Unable to read the selected image. Please try again."
      );

      setUploadingImage(false);
      event.target.value = "";
    };

    reader.readAsDataURL(file);
  };

  // ==========================================================
  // REMOVE QUESTION IMAGE
  // ==========================================================

  const removeQuestionImage = () => {
    updateQuestion(
      activeQuestion,
      "image_url",
      ""
    );

    setError("");
    setSuccess("Question image removed.");
  };

  // ==========================================================
  // ADD QUESTION
  // ==========================================================

  const addQuestion = (type = "objective") => {
    const newQuestion = createQuestion(
      questions.length + 1
    );

    newQuestion.question_type = type;

    setQuestions((previous) => [
      ...previous,
      newQuestion,
    ]);

    setActiveQuestion(questions.length);
    setError("");
    setSuccess("");
  };

  // ==========================================================
  // DELETE QUESTION
  // ==========================================================

  const deleteQuestion = (index) => {
    if (questions.length === 1) {
      setError(
        "An examination must contain at least one question."
      );
      return;
    }

    const updated = questions.filter(
      (_, questionIndex) =>
        questionIndex !== index
    );

    setQuestions(updated);

    setActiveQuestion((previous) => {
      if (previous >= updated.length) {
        return updated.length - 1;
      }

      if (previous > index) {
        return previous - 1;
      }

      return previous;
    });

    setError("");
  };

  // ==========================================================
  // CHANGE QUESTION TYPE
  // ==========================================================

  const changeQuestionType = (index, type) => {
    setQuestions((previous) =>
      previous.map((question, questionIndex) => {
        if (questionIndex !== index) {
          return question;
        }

        return {
          ...question,
          question_type: type,
          correct_answer: "",
          options:
            type === "objective"
              ? question.options.length
                ? question.options
                : [
                    createOption("A"),
                    createOption("B"),
                    createOption("C"),
                    createOption("D"),
                  ]
              : [],
        };
      })
    );
  };

  // ==========================================================
  // UPDATE OPTION
  // ==========================================================

  const updateOption = (
    questionIndex,
    optionIndex,
    value
  ) => {
    setQuestions((previous) =>
      previous.map((question, index) => {
        if (index !== questionIndex) {
          return question;
        }

        const updatedOptions =
          question.options.map(
            (option, currentIndex) =>
              currentIndex === optionIndex
                ? {
                    ...option,
                    text: value,
                  }
                : option
          );

        return {
          ...question,
          options: updatedOptions,
        };
      })
    );
  };

  // ==========================================================
  // ADD OPTION
  // ==========================================================

  const addOption = (questionIndex) => {
    setQuestions((previous) =>
      previous.map((question, index) => {
        if (index !== questionIndex) {
          return question;
        }

        if (question.options.length >= 8) {
          return question;
        }

        const label = String.fromCharCode(
          65 + question.options.length
        );

        return {
          ...question,
          options: [
            ...question.options,
            createOption(label),
          ],
        };
      })
    );
  };

  // ==========================================================
  // DELETE OPTION
  // ==========================================================

  const removeOption = (
    questionIndex,
    optionIndex
  ) => {
    setQuestions((previous) =>
      previous.map((question, index) => {
        if (index !== questionIndex) {
          return question;
        }

        const removedLabel =
          question.options[optionIndex]?.label;

        const updatedOptions =
          question.options
            .filter(
              (_, currentIndex) =>
                currentIndex !== optionIndex
            )
            .map((option, currentIndex) => ({
              ...option,
              label: String.fromCharCode(
                65 + currentIndex
              ),
            }));

        return {
          ...question,
          options: updatedOptions,
          correct_answer:
            question.correct_answer === removedLabel
              ? ""
              : question.correct_answer,
        };
      })
    );
  };

  // ==========================================================
  // IMPORT QUESTIONS FROM JSON OR CSV
  // ==========================================================

  const importQuestions = async (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setImporting(true);
    setError("");
    setSuccess("");

    try {
      const extension = file.name
        .split(".")
        .pop()
        .toLowerCase();

      let imported = [];

      if (extension === "json") {
        const fileText = await file.text();
        const parsed = JSON.parse(fileText);

        const records = Array.isArray(parsed)
          ? parsed
          : parsed.questions;

        if (!Array.isArray(records)) {
          throw new Error(
            "The JSON file must contain a questions array."
          );
        }

        imported = records.map((item, index) => ({
          ...normalizeQuestion(item, index),
          id: `${Date.now()}-${index}-${Math.random()}`,
        }));
      } else if (extension === "csv") {
        const fileText = await file.text();

        const rows = fileText
          .split(/\r?\n/)
          .filter((row) => row.trim());

        if (rows.length < 2) {
          throw new Error(
            "The CSV file must contain a header and at least one question."
          );
        }

        const parseCSVRow = (line) => {
          const values = [];
          let current = "";
          let insideQuotes = false;

          for (
            let index = 0;
            index < line.length;
            index++
          ) {
            const character = line[index];

            if (character === '"') {
              if (
                insideQuotes &&
                line[index + 1] === '"'
              ) {
                current += '"';
                index++;
              } else {
                insideQuotes = !insideQuotes;
              }
            } else if (
              character === "," &&
              !insideQuotes
            ) {
              values.push(current.trim());
              current = "";
            } else {
              current += character;
            }
          }

          values.push(current.trim());

          return values;
        };

        const headers = parseCSVRow(
          rows[0]
        ).map((header) =>
          header.toLowerCase().trim()
        );

        const column = (...names) => {
          for (const name of names) {
            const index = headers.indexOf(name);

            if (index !== -1) return index;
          }

          return -1;
        };

        const getValue = (values, ...names) => {
          const index = column(...names);

          return index === -1
            ? ""
            : values[index] || "";
        };

        imported = rows.slice(1).map(
          (row, index) => {
            const values = parseCSVRow(row);

            const options = [
              ["A", "optiona", "option_a"],
              ["B", "optionb", "option_b"],
              ["C", "optionc", "option_c"],
              ["D", "optiond", "option_d"],
              ["E", "optione", "option_e"],
              ["F", "optionf", "option_f"],
            ]
              .map(([label, ...names]) => ({
                label,
                text: getValue(values, ...names),
              }))
              .filter((option) => option.text);

            return {
              ...createQuestion(index + 1),

              question_text: getValue(
                values,
                "question",
                "question_text",
                "text"
              ),

              question_type: "objective",
              options,

              correct_answer: getValue(
                values,
                "answer",
                "correct_answer"
              ),

              explanation: getValue(
                values,
                "explanation",
                "reason"
              ),

              marks:
                Number(
                  getValue(values, "marks")
                ) || 1,
            };
          }
        );
      } else {
        throw new Error(
          "Only JSON and CSV question files are supported."
        );
      }

      const validImported = imported.filter(
        (question) =>
          String(question.question_text).trim()
      );

      if (!validImported.length) {
        throw new Error(
          "No valid questions were found in the selected file."
        );
      }

      const existingEmpty =
        questions.length === 1 &&
        !questions[0].question_text.trim();

      setQuestions((previous) => {
        const existing =
          previous.length === 1 &&
          !previous[0].question_text.trim()
            ? []
            : previous;

        return [...existing, ...validImported];
      });

      setActiveQuestion(
        existingEmpty ? 0 : questions.length
      );

      setSuccess(
        `${validImported.length} question(s) imported successfully.`
      );
    } catch (err) {
      setError(
        err.message ||
        "Unable to import questions."
      );
    } finally {
      setImporting(false);
      event.target.value = "";
    }
  };

  // ==========================================================
  // VALIDATE EXAMINATION
  // ==========================================================

  const validateExam = () => {
    if (examTitle.trim().length < 3) {
      return "Enter an examination title containing at least 3 characters.";
    }

    if (!className) {
      return "Select the examination class.";
    }

    if (!subject.trim()) {
      return "Enter or select the examination subject.";
    }

    if (
      !Number.isInteger(Number(duration)) ||
      Number(duration) < 1 ||
      Number(duration) > 1440
    ) {
      return "Enter a valid examination duration between 1 and 1440 minutes.";
    }

    if (!questions.length) {
      return "Add at least one question.";
    }

    for (
      let index = 0;
      index < questions.length;
      index++
    ) {
      const question = questions[index];

      if (!question.question_text.trim()) {
        return `Question ${index + 1}: Enter the question text.`;
      }

      if (!question.correct_answer.trim()) {
        return `Question ${index + 1}: Select or enter the correct answer.`;
      }

      if (
        question.question_type === "objective"
      ) {
        const filledOptions =
          question.options.filter(
            (option) => option.text.trim()
          );

        if (filledOptions.length < 2) {
          return `Question ${index + 1}: Provide at least two answer options.`;
        }

        const correctOptionExists =
          filledOptions.some(
            (option) =>
              option.label ===
              question.correct_answer
          );

        if (!correctOptionExists) {
          return `Question ${index + 1}: Select a valid correct option.`;
        }
      }

      if (
        question.question_type === "comprehension" &&
        !question.passage.trim()
      ) {
        return `Question ${index + 1}: Add the comprehension passage.`;
      }

      if (
        !Number.isFinite(Number(question.marks)) ||
        Number(question.marks) <= 0
      ) {
        return `Question ${index + 1}: Enter valid marks.`;
      }
    }

    return null;
  };

  // ==========================================================
  // SAVE OR UPDATE EXAMINATION
  // ==========================================================

  const saveExam = async () => {
    setError("");
    setSuccess("");

    const validationError = validateExam();

    if (validationError) {
      setError(validationError);
      return;
    }

    const token = getAdminToken();

    if (!token) {
      setError(
        "Your admin session could not be found. Please log in again."
      );
      return;
    }

    setSaving(true);

    try {
      const payload = {
        title: examTitle.trim(),
        exam_type: "School Examination",
        class_name: className,
        subject: subject.trim(),
        duration_minutes: Number(duration),
        instructions: instructions.trim(),
        status,

        questions: questions.map(
          (question) => ({
            question_type:
              question.question_type,

            question_text:
              question.question_text.trim(),

            options:
              question.question_type === "objective"
                ? question.options
                    .filter((option) =>
                      option.text.trim()
                    )
                    .map((option) => ({
                      label: option.label,
                      text: option.text.trim(),
                    }))
                : [],

            correct_answer:
              question.correct_answer.trim(),

            explanation:
              question.explanation.trim(),

            marks:
              Number(question.marks) || 1,

            passage_id:
              question.passage_id || null,

            passage_title:
              question.passage_title || null,

            passage:
              question.passage || null,

            passage_order:
              question.passage_order || null,

            // Directly uploaded image data URL.
            image_url:
              question.image_url || null,
          })
        ),
      };

      const response = await fetch(
        isEditing && editingExamId
          ? `${API_URL}/${encodeURIComponent(editingExamId)}`
          : API_URL,
        {
          method:
            isEditing && editingExamId
              ? "PUT"
              : "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.error ||
          result.message ||
          "Unable to save examination."
        );
      }

      const savedId = result.exam?.id;

      if (savedId) {
        setEditingExamId(String(savedId));
        setSelectedExamId(String(savedId));
        setIsEditing(true);
      }

      setSuccess(
        isEditing
          ? "School examination updated successfully."
          : "School examination saved successfully."
      );

      // Refresh saved examinations for the selected class.
      const refreshResponse = await fetch(
        `${API_URL}?class=${encodeURIComponent(className)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (refreshResponse.ok) {
        const refreshResult =
          await refreshResponse.json();

        if (refreshResult.success) {
          setSavedExams(
            Array.isArray(refreshResult.exams)
              ? refreshResult.exams
              : []
          );
        }
      }
    } catch (err) {
      setError(
        err.message ||
        "Something went wrong while saving the examination."
      );
    } finally {
      setSaving(false);
    }
  };

  // ==========================================================
  // NAVIGATION
  // ==========================================================

  const goBack = () => {
    navigate("/admin/cbt/exams");
  };

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="min-h-screen bg-[#020617] p-4 text-white sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1500px]">

        {/* HEADER */}

        <div className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-center">

          <div className="flex items-start gap-4">

            <button
              type="button"
              onClick={goBack}
              className="mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-300 transition hover:border-blue-400/40 hover:bg-blue-500/10 hover:text-white"
            >
              <ArrowLeft size={19} />
            </button>

            <div>
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-blue-400">
                <ClipboardList size={14} />
                School Examination
              </div>

              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                {isEditing
                  ? "Edit Examination"
                  : "Examination Builder"}
              </h1>

              <p className="mt-2 text-sm text-slate-400">
                {isEditing
                  ? "Edit your saved examination and its questions."
                  : "Create examinations and add questions for your students."}
              </p>
            </div>

          </div>

          <div className="flex flex-wrap gap-3">

            <button
              type="button"
              onClick={() =>
                setShowPreview(!showPreview)
              }
              disabled={loadingExam}
              className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/[0.08] hover:text-white disabled:opacity-40"
            >
              <Eye size={17} />
              Preview
            </button>

            <button
              type="button"
              onClick={saveExam}
              disabled={saving || loadingExam || uploadingImage}
              className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-950/30 transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <Loader2
                  size={18}
                  className="animate-spin"
                />
              ) : isEditing ? (
                <Pencil size={18} />
              ) : (
                <Save size={18} />
              )}

              {saving
                ? "Saving..."
                : isEditing
                  ? "Update Examination"
                  : "Save Examination"}
            </button>

          </div>

        </div>

        {/* LOADING */}

        {loadingExam && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-blue-500/20 bg-blue-500/[0.06] p-5 text-sm text-blue-300">
            <Loader2
              size={19}
              className="animate-spin"
            />
            Loading saved examination and questions...
          </div>
        )}

        {/* ALERTS */}

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/[0.08] p-4 text-sm text-red-300">
            <AlertCircle
              size={19}
              className="mt-0.5 shrink-0"
            />

            <span>{error}</span>

            <button
              type="button"
              onClick={() => setError("")}
              className="ml-auto"
            >
              <X size={17} />
            </button>
          </div>
        )}

        {success && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.08] p-4 text-sm text-emerald-300">
            <CheckCircle2 size={19} />
            {success}
          </div>
        )}

        {/* STATISTICS */}

        <div className="mb-7 grid grid-cols-2 gap-3 lg:grid-cols-4">

          {[
            {
              label: "Total Questions",
              value: questions.length,
              icon: FileText,
              color: "text-blue-400",
            },
            {
              label: "Objective",
              value: objectiveCount,
              icon: CheckCircle2,
              color: "text-emerald-400",
            },
            {
              label: "Comprehension",
              value: comprehensionCount,
              icon: BookOpen,
              color: "text-purple-400",
            },
            {
              label: "Total Marks",
              value: totalMarks,
              icon: Layers3,
              color: "text-amber-400",
            },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.label}
                className="rounded-2xl border border-white/[0.08] bg-[#071426] p-4 sm:p-5"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-400">
                    {item.label}
                  </span>

                  <Icon
                    size={18}
                    className={item.color}
                  />
                </div>

                <div className="text-2xl font-bold tabular-nums">
                  {item.value}
                </div>
              </div>
            );
          })}

        </div>

        {/* EXAM SETTINGS */}

        <section className="mb-7 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#071426]">

          <button
            type="button"
            onClick={() =>
              setShowSettings(!showSettings)
            }
            className="flex w-full items-center justify-between border-b border-white/[0.07] px-5 py-5 text-left sm:px-6"
          >

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                <Settings2 size={19} />
              </div>

              <div>
                <h2 className="font-bold">
                  Examination Details
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  Set the class, subject and examination information.
                </p>
              </div>
            </div>

            {showSettings ? (
              <ChevronUp
                size={19}
                className="text-slate-400"
              />
            ) : (
              <ChevronDown
                size={19}
                className="text-slate-400"
              />
            )}

          </button>

          {showSettings && (
            <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">

              {/* TITLE */}

              <div className="sm:col-span-2">
                <label className="mb-2 block text-xs font-semibold text-slate-300">
                  Examination Title
                </label>

                <input
                  value={examTitle}
                  onChange={(event) =>
                    setExamTitle(event.target.value)
                  }
                  placeholder="e.g. First Term Mathematics Examination"
                  className="w-full rounded-xl border border-white/10 bg-[#020b19] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500/60"
                />
              </div>

              {/* CLASS */}

              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-300">
                  Class
                </label>

                <select
                  value={className}
                  onChange={(event) => {
                    const value = event.target.value;

                    setClassName(value);
                    setSelectedExamId("");
                    setEditingExamId("");
                    setIsEditing(false);
                    setSavedExams([]);

                    setError("");
                    setSuccess("");
                  }}
                  className="w-full rounded-xl border border-white/10 bg-[#020b19] px-4 py-3 text-sm text-white outline-none focus:border-blue-500/60"
                >
                  <option value="">
                    Select class
                  </option>

                  {CLASSES.map((item) => (
                    <option
                      key={item}
                      value={item}
                    >
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              {/* SAVED EXAMINATION DROPDOWN */}

              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-300">
                  Load Saved Examination
                </label>

                <select
                  value={selectedExamId}
                  onChange={(event) =>
                    handleSavedExamChange(
                      event.target.value
                    )
                  }
                  disabled={
                    !className ||
                    loadingSavedExams ||
                    loadingExam
                  }
                  className="w-full rounded-xl border border-white/10 bg-[#020b19] px-4 py-3 text-sm text-white outline-none focus:border-blue-500/60 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">
                    {loadingSavedExams
                      ? "Loading examinations..."
                      : !className
                        ? "Select a class first"
                        : savedExams.length
                          ? "Select an examination"
                          : "No saved examinations for this class"}
                  </option>

                  {savedExams.map((exam) => (
                    <option
                      key={exam.id}
                      value={String(exam.id)}
                    >
                      {exam.title} — {exam.subject} (
                      {exam.total_questions || 0} questions)
                    </option>
                  ))}
                </select>

                <p className="mt-2 text-[10px] text-slate-500">
                  Select an existing examination to retrieve its saved questions.
                </p>
              </div>

              {/* SUBJECT */}

              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-300">
                  Subject
                </label>

                <input
                  list="school-exam-subjects"
                  value={subject}
                  onChange={(event) =>
                    setSubject(event.target.value)
                  }
                  placeholder="Type or select any subject"
                  className="w-full rounded-xl border border-white/10 bg-[#020b19] px-4 py-3 text-sm text-white outline-none focus:border-blue-500/60"
                />

                <datalist id="school-exam-subjects">
                  {SUBJECTS.map((item) => (
                    <option
                      key={item}
                      value={item}
                    />
                  ))}
                </datalist>

                <p className="mt-2 text-[10px] text-slate-500">
                  You can type a subject that is not listed.
                </p>
              </div>

              {/* DURATION */}

              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-300">
                  Duration (minutes)
                </label>

                <div className="relative">
                  <Clock
                    size={17}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                  />

                  <input
                    type="number"
                    min="1"
                    max="1440"
                    value={duration}
                    onChange={(event) =>
                      setDuration(event.target.value)
                    }
                    className="w-full rounded-xl border border-white/10 bg-[#020b19] py-3 pl-11 pr-4 text-sm text-white outline-none focus:border-blue-500/60"
                  />
                </div>
              </div>

              {/* STATUS */}

              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-300">
                  Examination Status
                </label>

                <select
                  value={status}
                  onChange={(event) =>
                    setStatus(event.target.value)
                  }
                  className="w-full rounded-xl border border-white/10 bg-[#020b19] px-4 py-3 text-sm text-white outline-none focus:border-blue-500/60"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>

              {/* INSTRUCTIONS */}

              <div className="sm:col-span-2">
                <label className="mb-2 block text-xs font-semibold text-slate-300">
                  Examination Instructions
                </label>

                <textarea
                  rows={3}
                  value={instructions}
                  onChange={(event) =>
                    setInstructions(event.target.value)
                  }
                  placeholder="Enter instructions for students..."
                  className="w-full resize-y rounded-xl border border-white/10 bg-[#020b19] px-4 py-3 text-sm text-white outline-none focus:border-blue-500/60"
                />
              </div>

            </div>
          )}

        </section>

        {/* QUESTION BUILDER */}

        <section className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#071426]">

          {/* QUESTION HEADER */}

          <div className="flex flex-col justify-between gap-4 border-b border-white/[0.07] p-5 sm:flex-row sm:items-center sm:px-6">

            <div>
              <div className="flex items-center gap-2">
                <FileText
                  size={19}
                  className="text-blue-400"
                />

                <h2 className="font-bold">
                  Examination Questions
                </h2>
              </div>

              <p className="mt-2 text-xs text-slate-400">
                Write your questions, provide answers and assign marks.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">

              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-xs font-semibold text-slate-300 transition hover:bg-white/[0.08]">
                {importing ? (
                  <Loader2
                    size={15}
                    className="animate-spin"
                  />
                ) : (
                  <Upload size={15} />
                )}

                Import Questions

                <input
                  type="file"
                  accept=".json,.csv"
                  onChange={importQuestions}
                  className="hidden"
                  disabled={importing || loadingExam}
                />
              </label>

              <button
                type="button"
                onClick={() =>
                  addQuestion("objective")
                }
                disabled={loadingExam}
                className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-blue-500 disabled:opacity-40"
              >
                <Plus size={16} />
                Add Question
              </button>

            </div>

          </div>

          {/* QUESTION WORKSPACE */}

          <div
            id="question-editor"
            className="grid min-h-[650px] lg:grid-cols-[260px_minmax(0,1fr)]"
          >

            {/* QUESTION SIDEBAR */}

            <aside className="border-b border-white/[0.07] bg-[#050e1d] p-4 lg:border-b-0 lg:border-r">

              <div className="mb-4 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Questions
                </span>

                <span className="rounded-lg bg-blue-500/10 px-2.5 py-1 text-xs font-bold text-blue-400">
                  {questions.length}
                </span>
              </div>

              <div className="grid max-h-[520px] grid-cols-4 gap-2 overflow-y-auto sm:grid-cols-6 lg:grid-cols-2">

                {questions.map(
                  (question, index) => (
                    <button
                      key={question.id}
                      type="button"
                      onClick={() => {
                        setActiveQuestion(index);
                        setError("");
                      }}
                      className={`flex min-h-[66px] flex-col items-center justify-center rounded-xl border p-2 transition ${
                        activeQuestion === index
                          ? "border-blue-500/60 bg-blue-500/10 text-blue-300"
                          : "border-white/[0.07] bg-white/[0.025] text-slate-400 hover:border-white/20 hover:text-white"
                      }`}
                    >
                      <span className="text-sm font-bold">
                        Q{index + 1}
                      </span>

                      <span className="mt-1 text-[9px] uppercase tracking-wide">
                        {question.question_type === "objective"
                          ? "Objective"
                          : "Comprehension"}
                      </span>
                    </button>
                  )
                )}

              </div>

              <div className="mt-6 space-y-2 border-t border-white/[0.07] pt-5">

                <button
                  type="button"
                  onClick={() =>
                    addQuestion("objective")
                  }
                  disabled={loadingExam}
                  className="flex w-full items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.025] px-3 py-3 text-left text-xs font-semibold text-slate-300 transition hover:border-blue-500/40 hover:bg-blue-500/10 hover:text-white disabled:opacity-40"
                >
                  <Plus
                    size={15}
                    className="text-blue-400"
                  />
                  Add Objective
                </button>

                <button
                  type="button"
                  onClick={() =>
                    addQuestion("comprehension")
                  }
                  disabled={loadingExam}
                  className="flex w-full items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.025] px-3 py-3 text-left text-xs font-semibold text-slate-300 transition hover:border-purple-500/40 hover:bg-purple-500/10 hover:text-white disabled:opacity-40"
                >
                  <Plus
                    size={15}
                    className="text-purple-400"
                  />
                  Add Comprehension
                </button>

              </div>

            </aside>

            {/* QUESTION EDITOR */}

            <div className="min-w-0 p-5 sm:p-7">

              {currentQuestion && (
                <div>

                  {/* EDITOR TOP */}

                  <div className="mb-7 flex flex-wrap items-center justify-between gap-4">

                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wider text-blue-400">
                        Question {activeQuestion + 1}
                      </div>

                      <h3 className="mt-1 text-lg font-bold">
                        Question Editor
                      </h3>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        deleteQuestion(activeQuestion)
                      }
                      className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/[0.06] px-3 py-2.5 text-xs font-semibold text-red-300 transition hover:bg-red-500/10"
                    >
                      <Trash2 size={15} />
                      Delete Question
                    </button>

                  </div>

                  {/* TYPE AND MARKS */}

                  <div className="mb-6 grid gap-4 sm:grid-cols-2">

                    <div>
                      <label className="mb-2 block text-xs font-semibold text-slate-300">
                        Question Type
                      </label>

                      <select
                        value={currentQuestion.question_type}
                        onChange={(event) =>
                          changeQuestionType(
                            activeQuestion,
                            event.target.value
                          )
                        }
                        className="w-full rounded-xl border border-white/10 bg-[#020b19] px-4 py-3 text-sm text-white outline-none focus:border-blue-500/60"
                      >
                        <option value="objective">
                          Objective Question
                        </option>

                        <option value="comprehension">
                          Comprehension Question
                        </option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-xs font-semibold text-slate-300">
                        Marks
                      </label>

                      <input
                        type="number"
                        min="0.5"
                        step="0.5"
                        value={currentQuestion.marks}
                        onChange={(event) =>
                          updateQuestion(
                            activeQuestion,
                            "marks",
                            event.target.value
                          )
                        }
                        className="w-full rounded-xl border border-white/10 bg-[#020b19] px-4 py-3 text-sm text-white outline-none focus:border-blue-500/60"
                      />
                    </div>

                  </div>

                  {/* COMPREHENSION PASSAGE */}

                  {currentQuestion.question_type === "comprehension" && (
                    <div className="mb-6 rounded-2xl border border-purple-500/20 bg-purple-500/[0.035] p-5">

                      <div className="mb-4 flex items-center gap-2 text-sm font-bold text-purple-300">
                        <BookOpen size={17} />
                        Comprehension Passage
                      </div>

                      <div className="mb-4">
                        <label className="mb-2 block text-xs font-semibold text-slate-300">
                          Passage Title
                        </label>

                        <input
                          value={currentQuestion.passage_title}
                          onChange={(event) =>
                            updateQuestion(
                              activeQuestion,
                              "passage_title",
                              event.target.value
                            )
                          }
                          placeholder="Enter passage title"
                          className="w-full rounded-xl border border-white/10 bg-[#020b19] px-4 py-3 text-sm text-white outline-none focus:border-purple-500/60"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-xs font-semibold text-slate-300">
                          Passage Text
                        </label>

                        <textarea
                          rows={7}
                          value={currentQuestion.passage}
                          onChange={(event) =>
                            updateQuestion(
                              activeQuestion,
                              "passage",
                              event.target.value
                            )
                          }
                          placeholder="Write or paste the comprehension passage here..."
                          className="w-full resize-y rounded-xl border border-white/10 bg-[#020b19] px-4 py-3 text-sm leading-7 text-white outline-none focus:border-purple-500/60"
                        />
                      </div>

                      <p className="mt-3 text-[11px] text-slate-500">
                        Questions using the same passage can share the same passage title and passage text.
                      </p>

                    </div>
                  )}

                  {/* QUESTION TEXT */}

                  <div className="mb-7">

                    <label className="mb-2 block text-xs font-semibold text-slate-300">
                      Question Text
                    </label>

                    <textarea
                      rows={5}
                      value={currentQuestion.question_text}
                      onChange={(event) =>
                        updateQuestion(
                          activeQuestion,
                          "question_text",
                          event.target.value
                        )
                      }
                      placeholder="Write your examination question here..."
                      className="w-full resize-y rounded-xl border border-white/10 bg-[#020b19] px-4 py-4 text-sm leading-7 text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500/60"
                    />

                  </div>

                  {/* OBJECTIVE OPTIONS */}

                  {currentQuestion.question_type === "objective" && (
                    <div className="mb-7">

                      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">

                        <div>
                          <h4 className="text-sm font-bold">
                            Answer Options
                          </h4>

                          <p className="mt-1 text-xs text-slate-500">
                            Enter the available answers and select the correct one.
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            addOption(activeQuestion)
                          }
                          disabled={
                            currentQuestion.options.length >= 8
                          }
                          className="flex items-center gap-2 rounded-lg border border-blue-500/20 bg-blue-500/[0.07] px-3 py-2 text-xs font-semibold text-blue-300 transition hover:bg-blue-500/15 disabled:opacity-40"
                        >
                          <Plus size={14} />
                          Add Option
                        </button>

                      </div>

                      <div className="space-y-3">

                        {currentQuestion.options.map(
                          (option, optionIndex) => (
                            <div
                              key={option.label}
                              className={`flex items-center gap-3 rounded-xl border p-3 transition ${
                                currentQuestion.correct_answer === option.label
                                  ? "border-emerald-500/40 bg-emerald-500/[0.055]"
                                  : "border-white/[0.08] bg-[#020b19]"
                              }`}
                            >

                              <button
                                type="button"
                                onClick={() =>
                                  updateQuestion(
                                    activeQuestion,
                                    "correct_answer",
                                    option.label
                                  )
                                }
                                title="Set as correct answer"
                                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border text-xs font-bold transition ${
                                  currentQuestion.correct_answer === option.label
                                    ? "border-emerald-500 bg-emerald-500 text-white"
                                    : "border-white/10 bg-white/[0.04] text-slate-400 hover:border-emerald-500/40 hover:text-emerald-300"
                                }`}
                              >
                                {currentQuestion.correct_answer === option.label ? (
                                  <Check size={17} />
                                ) : (
                                  option.label
                                )}
                              </button>

                              <input
                                value={option.text}
                                onChange={(event) =>
                                  updateOption(
                                    activeQuestion,
                                    optionIndex,
                                    event.target.value
                                  )
                                }
                                placeholder={`Enter option ${option.label}`}
                                className="min-w-0 flex-1 bg-transparent py-2 text-sm text-white outline-none placeholder:text-slate-600"
                              />

                              {currentQuestion.options.length > 2 && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    removeOption(
                                      activeQuestion,
                                      optionIndex
                                    )
                                  }
                                  className="rounded-lg p-2 text-slate-500 transition hover:bg-red-500/10 hover:text-red-400"
                                >
                                  <X size={16} />
                                </button>
                              )}

                            </div>
                          )
                        )}

                      </div>

                      <p className="mt-3 text-xs text-slate-500">
                        Click the option letter to mark it as the correct answer.
                      </p>

                    </div>
                  )}

                  {/* COMPREHENSION ANSWER */}

                  {currentQuestion.question_type === "comprehension" && (
                    <div className="mb-7">

                      <label className="mb-2 block text-xs font-semibold text-slate-300">
                        Correct Answer
                      </label>

                      <textarea
                        rows={3}
                        value={currentQuestion.correct_answer}
                        onChange={(event) =>
                          updateQuestion(
                            activeQuestion,
                            "correct_answer",
                            event.target.value
                          )
                        }
                        placeholder="Enter the expected answer..."
                        className="w-full resize-y rounded-xl border border-white/10 bg-[#020b19] px-4 py-3 text-sm text-white outline-none focus:border-blue-500/60"
                      />

                    </div>
                  )}

                  {/* EXPLANATION */}

                  <div className="mb-7">

                    <label className="mb-2 block text-xs font-semibold text-slate-300">
                      Explanation / Marking Guide
                    </label>

                    <textarea
                      rows={3}
                      value={currentQuestion.explanation}
                      onChange={(event) =>
                        updateQuestion(
                          activeQuestion,
                          "explanation",
                          event.target.value
                        )
                      }
                      placeholder="Enter the explanation or marking guide..."
                      className="w-full resize-y rounded-xl border border-white/10 bg-[#020b19] px-4 py-3 text-sm text-white outline-none focus:border-blue-500/60"
                    />

                  </div>

                  {/* DIRECT IMAGE UPLOAD */}

                  <div className="mb-7">

                    <div className="mb-3 flex items-center justify-between gap-3">

                      <label className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                        <ImagePlus size={16} className="text-blue-400" />
                        Question Image
                      </label>

                      <span className="text-[10px] text-slate-500">
                        Maximum 5MB
                      </span>

                    </div>

                    {!currentQuestion.image_url ? (
                      <label className="group flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/10 bg-[#020b19] px-5 py-10 text-center transition hover:border-blue-500/50 hover:bg-blue-500/[0.035]">

                        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10 text-blue-400 transition group-hover:scale-105">
                          {uploadingImage ? (
                            <Loader2
                              size={25}
                              className="animate-spin"
                            />
                          ) : (
                            <ImagePlus size={25} />
                          )}
                        </div>

                        <p className="text-sm font-bold text-white">
                          {uploadingImage
                            ? "Processing image..."
                            : "Click to upload question image"}
                        </p>

                        <p className="mt-2 text-xs text-slate-500">
                          Select an image directly from your computer.
                        </p>

                        <p className="mt-3 text-[10px] font-medium text-slate-600">
                          JPG, PNG, WEBP or GIF
                        </p>

                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/gif"
                          onChange={uploadQuestionImage}
                          disabled={uploadingImage || loadingExam}
                          className="hidden"
                        />

                      </label>
                    ) : (
                      <div className="overflow-hidden rounded-2xl border border-blue-500/20 bg-[#020b19]">

                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.07] px-4 py-3">

                          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-300">
                            <CheckCircle2 size={16} />
                            Image attached to this question
                          </div>

                          <div className="flex flex-wrap gap-2">

                            <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-slate-300 transition hover:bg-white/[0.09] hover:text-white">
                              <Upload size={14} />
                              Replace

                              <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp,image/gif"
                                onChange={uploadQuestionImage}
                                disabled={uploadingImage || loadingExam}
                                className="hidden"
                              />
                            </label>

                            <button
                              type="button"
                              onClick={removeQuestionImage}
                              disabled={uploadingImage}
                              className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/[0.06] px-3 py-2 text-xs font-semibold text-red-300 transition hover:bg-red-500/15 disabled:opacity-50"
                            >
                              <Trash2 size={14} />
                              Remove
                            </button>

                          </div>

                        </div>

                        <div className="flex min-h-[180px] items-center justify-center bg-black/20 p-4 sm:p-6">

                          <img
                            src={currentQuestion.image_url}
                            alt={`Question ${activeQuestion + 1}`}
                            className="max-h-[350px] max-w-full rounded-xl object-contain"
                            onError={() => {
                              setError(
                                "The saved question image could not be displayed."
                              );
                            }}
                          />

                        </div>

                      </div>
                    )}

                    <p className="mt-3 text-[11px] leading-5 text-slate-500">
                      The uploaded image will be saved with Question {activeQuestion + 1}. You can use this for diagrams, maps, mathematical illustrations and other examination images.
                    </p>

                  </div>

                  {/* QUESTION NAVIGATION */}

                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.07] pt-6">

                    <button
                      type="button"
                      disabled={activeQuestion === 0}
                      onClick={() =>
                        setActiveQuestion((previous) =>
                          Math.max(0, previous - 1)
                        )
                      }
                      className="rounded-xl border border-white/10 bg-white/[0.035] px-5 py-3 text-xs font-semibold text-slate-300 transition hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      Previous Question
                    </button>

                    <span className="text-xs text-slate-500">
                      {activeQuestion + 1} of {questions.length}
                    </span>

                    <button
                      type="button"
                      onClick={() => {
                        if (activeQuestion < questions.length - 1) {
                          setActiveQuestion(activeQuestion + 1);
                        } else {
                          addQuestion("objective");
                        }
                      }}
                      className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-xs font-bold text-white transition hover:bg-blue-500"
                    >
                      {activeQuestion === questions.length - 1
                        ? "Add Next Question"
                        : "Next Question"}

                      <Plus size={15} />
                    </button>

                  </div>

                </div>
              )}

            </div>

          </div>

        </section>

        {/* FOOTER */}

        <div className="mt-7 flex flex-col justify-between gap-4 rounded-2xl border border-white/[0.07] bg-[#071426] p-5 sm:flex-row sm:items-center">

          <div>
            <p className="text-sm font-bold">
              {isEditing
                ? "Ready to update your examination?"
                : "Ready to save your examination?"}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              {className || "No class selected"} ·{" "}
              {subject || "No subject selected"} ·{" "}
              {questions.length} questions
            </p>
          </div>

          <button
            type="button"
            onClick={saveExam}
            disabled={saving || loadingExam || uploadingImage}
            className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-7 py-3.5 text-sm font-bold text-white transition hover:bg-blue-500 disabled:opacity-50"
          >
            {saving ? (
              <Loader2
                size={18}
                className="animate-spin"
              />
            ) : (
              <Save size={18} />
            )}

            {saving
              ? "Saving Examination..."
              : isEditing
                ? "Update Examination"
                : "Save Examination"}
          </button>

        </div>

      </div>

      {/* PREVIEW MODAL */}

      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-sm">

          <div className="my-auto max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-white/10 bg-[#071426] shadow-2xl">

            <div className="sticky top-0 flex items-center justify-between border-b border-white/[0.08] bg-[#071426] p-5">

              <div>
                <h2 className="font-bold">
                  Examination Preview
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  {className} · {subject}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowPreview(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white"
              >
                <X size={19} />
              </button>

            </div>

            <div className="p-5 sm:p-8">

              <div className="mb-8 border-b border-white/10 pb-6 text-center">

                <div className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-blue-400">
                  School Examination
                </div>

                <h1 className="text-2xl font-bold">
                  {examTitle || "Untitled Examination"}
                </h1>

                <p className="mt-3 text-sm text-slate-400">
                  {className} · {subject}
                </p>

                <p className="mt-2 text-xs text-slate-500">
                  Duration: {duration} minutes · Total Marks: {totalMarks}
                </p>

                {instructions && (
                  <p className="mt-5 rounded-xl bg-white/[0.035] p-4 text-left text-sm leading-6 text-slate-300">
                    {instructions}
                  </p>
                )}

              </div>

              <div className="space-y-8">

                {questions.map((question, index) => (
                  <div
                    key={question.id}
                    className="border-b border-white/[0.07] pb-7 last:border-0"
                  >

                    {question.question_type === "comprehension" &&
                      question.passage && (
                        <div className="mb-4 rounded-xl border border-purple-500/20 bg-purple-500/[0.05] p-4">

                          <h3 className="mb-2 text-sm font-bold text-purple-300">
                            {question.passage_title || "Comprehension Passage"}
                          </h3>

                          <p className="whitespace-pre-wrap text-sm leading-7 text-slate-300">
                            {question.passage}
                          </p>

                        </div>
                      )}

                    <div className="mb-3 flex items-start justify-between gap-3">

                      <p className="text-sm font-semibold leading-7 text-white">
                        <span className="mr-2 text-blue-400">
                          {index + 1}.
                        </span>

                        {question.question_text || "Question text not entered"}
                      </p>

                      <span className="shrink-0 text-xs text-slate-500">
                        {question.marks} mark(s)
                      </span>

                    </div>

                    {/* QUESTION IMAGE IN PREVIEW */}

                    {question.image_url && (
                      <div className="mb-5 ml-6 rounded-xl border border-white/[0.08] bg-[#020b19] p-3">
                        <img
                          src={question.image_url}
                          alt={`Question ${index + 1}`}
                          className="max-h-[350px] max-w-full rounded-lg object-contain"
                        />
                      </div>
                    )}

                    {question.question_type === "objective" && (
                      <div className="ml-6 grid gap-2 sm:grid-cols-2">

                        {question.options.map((option) => (
                          <div
                            key={option.label}
                            className="rounded-lg border border-white/[0.07] bg-white/[0.025] p-3 text-sm text-slate-300"
                          >
                            <span className="mr-2 font-bold text-blue-400">
                              {option.label}.
                            </span>

                            {option.text || "Empty option"}
                          </div>
                        ))}

                      </div>
                    )}

                  </div>
                ))}

              </div>

            </div>

            <div className="sticky bottom-0 flex justify-end border-t border-white/[0.08] bg-[#071426] p-4">

              <button
                type="button"
                onClick={() => setShowPreview(false)}
                className="rounded-xl bg-blue-600 px-5 py-3 text-xs font-bold text-white hover:bg-blue-500"
              >
                Close Preview
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}
