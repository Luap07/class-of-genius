import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import katex from "katex";
import "katex/dist/katex.min.css";

import {
  Trash2,
  Search,
  Edit3,
  X,
  Save,
  CheckCircle2,
  Power,
  Bold,
  Italic,
  Superscript,
  Subscript,
  Sigma,
  Plus,
  ImageIcon,
  Eye,
  EyeOff,
  Loader2,
  Check,
  BookOpen,
  FileText,
  Layers3,
  ChevronDown,
  ChevronUp,
  Copy,
} from "lucide-react";

const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

const QUESTIONS_API = `${API_BASE_URL}/api/admin/cbt/questions`;

// This only controls the number displayed on each UI page.
// It does NOT limit how many questions are fetched.
const QUESTIONS_PER_PAGE = 40;

// ============================================================
// AUTHENTICATION
// ============================================================

const getAdminToken = () => {
  const keys = [
    "scholiqen_auth_token",
    "admin_token",
    "auth_token",
    "access_token",
    "token",
  ];

  for (const key of keys) {
    const value = localStorage.getItem(key);

    if (value) {
      try {
        const parsed = JSON.parse(value);

        if (typeof parsed === "string") return parsed;

        if (parsed?.token) return parsed.token;
        if (parsed?.access_token) return parsed.access_token;
      } catch {
        return value;
      }
    }
  }

  return "";
};

const apiRequest = async (url, options = {}) => {
  const token = getAdminToken();

  if (!token) {
    throw new Error(
      "Administrator session not found. Please log in again."
    );
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });

  let data = {};

  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok || data.success === false) {
    if (response.status === 401) {
      throw new Error(
        data.error ||
          "Your session has expired. Please log in again."
      );
    }

    if (response.status === 403) {
      throw new Error(
        data.error ||
          "Administrator access is required."
      );
    }

    throw new Error(
      data.error ||
        data.message ||
        `Request failed with status ${response.status}.`
    );
  }

  return data;
};

// ============================================================
// CONTENT HELPERS
// ============================================================

const decodeHtml = (value = "") => {
  if (typeof document === "undefined") {
    return String(value);
  }

  const textarea = document.createElement("textarea");
  textarea.innerHTML = String(value);

  return textarea.value;
};

const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const normalizeOptions = (options, question = {}) => {
  let normalized = [];

  if (Array.isArray(options)) {
    normalized = options.map((item, index) => {
      if (typeof item === "string") {
        return {
          label: String.fromCharCode(65 + index),
          text: item,
        };
      }

      return {
        label:
          item?.label ||
          String.fromCharCode(65 + index),
        text:
          item?.text ??
          item?.value ??
          item?.content ??
          "",
      };
    });
  } else if (
    options &&
    typeof options === "object"
  ) {
    normalized = Object.entries(options).map(
      ([key, value], index) => ({
        label:
          /^[a-d]$/i.test(key)
            ? key.toUpperCase()
            : String.fromCharCode(65 + index),
        text:
          typeof value === "string"
            ? value
            : value?.text || value?.value || "",
      })
    );
  }

  if (!normalized.length) {
    normalized = ["A", "B", "C", "D"].map(
      (label) => ({
        label,
        text:
          question[`option${label}`] || "",
      })
    );
  }

  return normalized.filter(
    (option) =>
      option.label || option.text
  );
};

const normalizeQuestionRecord = (item) => {
  const question = {
    ...item,
    id: item.id,
    exam: item.exam || "",
    subject: item.subject || "",
    question: item.question || "",
    options: normalizeOptions(
      item.options,
      item
    ),
    answer: item.answer || "",
    image: item.image || "",
    reason: item.reason || "",
    question_type:
      String(item.question_type || "").toLowerCase() ||
      (item.passage_id
        ? "comprehension"
        : "objective"),
    passage_id: item.passage_id || null,
    passage_title: item.passage_title || "",
    passage: item.passage || "",
    passage_order:
      item.passage_order ?? 0,
    active:
      item.active === undefined ||
      item.active === null
        ? true
        : item.active === true ||
          item.active === 1 ||
          item.active === "true",
  };

  return question;
};

const isComprehensionQuestion = (item) =>
  String(item?.question_type || "").toLowerCase() ===
    "comprehension" ||
  Boolean(item?.passage_id);

const cleanLatexMarkdown = (value = "") =>
  String(value)
    .replace(/\\\[/g, "$$")
    .replace(/\\\]/g, "$$")
    .replace(/\\\(/g, "$")
    .replace(/\\\)/g, "$");

const hasHtml = (value = "") =>
  /<\/?[a-z][\s\S]*>/i.test(String(value));

const convertCaretPowers = (value = "") =>
  String(value).replace(
    /([a-zA-Z0-9)])\^([a-zA-Z0-9]+)/g,
    "$1^{$2}"
  );

const containsLatex = (value = "") =>
  /\\\(|\\\[|\$\$|\$[^$]+\$|\\frac|\\sqrt|\\sum|\\int/.test(
    String(value)
  );

const normalizeLatexSource = (value = "") =>
  convertCaretPowers(
    cleanLatexMarkdown(value)
  );

const renderKatex = (value = "") => {
  try {
    return katex.renderToString(
      normalizeLatexSource(value),
      {
        throwOnError: false,
        strict: "ignore",
        displayMode: false,
        trust: false,
      }
    );
  } catch {
    return escapeHtml(value);
  }
};

const renderRichContentHtml = (value = "") => {
  if (!value) return "";

  const source = String(value);

  if (hasHtml(source)) {
    return source;
  }

  const escaped = escapeHtml(source);

  return escaped
    .replace(
      /\$\$([\s\S]+?)\$\$/g,
      (_, latex) =>
        katex.renderToString(
          normalizeLatexSource(latex),
          {
            displayMode: true,
            throwOnError: false,
            strict: "ignore",
          }
        )
    )
    .replace(
      /\$([^$\n]+)\$/g,
      (_, latex) =>
        renderKatex(latex)
    )
    .replace(/\n/g, "<br />");
};

const RichContent = memo(({ content }) => (
  <div
    className="rich-content break-words"
    dangerouslySetInnerHTML={{
      __html: renderRichContentHtml(content),
    }}
  />
));

const cleanRichContent = (value = "") =>
  String(value).trim();

const getTextFromContent = (value = "") => {
  if (typeof document === "undefined") {
    return String(value)
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  const element = document.createElement("div");
  element.innerHTML = String(value);

  return (
    element.textContent ||
    element.innerText ||
    ""
  )
    .replace(/\s+/g, " ")
    .trim();
};

const getEditorValue = (value = "") =>
  value === null || value === undefined
    ? ""
    : String(value);

const createPassageId = () =>
  `passage-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 9)}`;

const createEmptyQuestion = (type = "objective") => ({
  exam: "",
  subject: "",
  question: "",
  options: [
    { label: "A", text: "" },
    { label: "B", text: "" },
    { label: "C", text: "" },
    { label: "D", text: "" },
  ],
  answer: "A",
  image: "",
  reason: "",
  question_type: type,
  passage_id:
    type === "comprehension"
      ? createPassageId()
      : null,
  passage_title: "",
  passage: "",
  passage_order: 0,
  active: true,
});

// ============================================================
// MAIN COMPONENT
// ============================================================

function QuestionsAdmin() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [activeView, setActiveView] = useState("all");

  const [editingQuestion, setEditingQuestion] =
    useState(null);

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [activating, setActivating] = useState(null);

  // ==========================================================
  // FETCH ALL QUESTIONS FROM NEON
  // NO PAGE LIMIT
  // NO DATABASE QUESTION LIMIT
  // ==========================================================

  const fetchQuestions = useCallback(
    async ({ silent = false } = {}) => {
      if (!silent) {
        setLoading(true);
      }

      setLoadError("");

      try {
        // IMPORTANT:
        // Do not send page or limit.
        // The backend returns every matching question.

        const data = await apiRequest(
          QUESTIONS_API
        );

        const records = Array.isArray(data.questions)
          ? data.questions
          : [];

        setQuestions(
          records.map(normalizeQuestionRecord)
        );

        setPage(1);
      } catch (error) {
        console.error(
          "Fetch CBT Questions Error:",
          error
        );

        setLoadError(
          error.message ||
            "Unable to load questions."
        );

        if (!silent) {
          setQuestions([]);
        }
      } finally {
        if (!silent) {
          setLoading(false);
        }
      }
    },
    []
  );

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  // ==========================================================
  // UPDATE LOCAL QUESTION
  // ==========================================================

  const updateLocalQuestion = useCallback(
    (updatedQuestion) => {
      const normalized =
        normalizeQuestionRecord(updatedQuestion);

      setQuestions((current) =>
        current.map((item) =>
          String(item.id) ===
          String(normalized.id)
            ? normalized
            : item
        )
      );
    },
    []
  );

  // ==========================================================
  // EDITOR CONTROLS
  // ==========================================================

  const openCreateObjective = () => {
    setEditingQuestion({
      ...createEmptyQuestion("objective"),
      isNew: true,
    });
  };

  const openCreateComprehension = () => {
    setEditingQuestion({
      ...createEmptyQuestion("comprehension"),
      isNew: true,
    });
  };

  const openEditQuestion = (question) => {
    setEditingQuestion({
      ...normalizeQuestionRecord(question),
      isNew: false,
    });
  };

  const closeEditor = () => {
    if (!saving) {
      setEditingQuestion(null);
    }
  };

  const handleEditorFieldChange = (
    field,
    value
  ) => {
    setEditingQuestion((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleOptionChange = (
    index,
    value
  ) => {
    setEditingQuestion((current) => {
      const options = [...(current.options || [])];

      options[index] = {
        ...options[index],
        text: value,
      };

      return {
        ...current,
        options,
      };
    });
  };

  const addOption = () => {
    setEditingQuestion((current) => {
      const options = [...(current.options || [])];

      if (options.length >= 6) return current;

      options.push({
        label: String.fromCharCode(
          65 + options.length
        ),
        text: "",
      });

      return {
        ...current,
        options,
      };
    });
  };

  const removeOption = (index) => {
    setEditingQuestion((current) => {
      const options = current.options.filter(
        (_, optionIndex) =>
          optionIndex !== index
      );

      const answerStillExists = options.some(
        (option) =>
          option.label === current.answer
      );

      return {
        ...current,
        options,
        answer: answerStillExists
          ? current.answer
          : options[0]?.label || "A",
      };
    });
  };

  // ==========================================================
  // COUNTS
  // ==========================================================

  const comprehensionQuestions = useMemo(
    () =>
      questions.filter(
        isComprehensionQuestion
      ),
    [questions]
  );

  const objectiveQuestions = useMemo(
    () =>
      questions.filter(
        (item) =>
          !isComprehensionQuestion(item)
      ),
    [questions]
  );

  const passageGroups = useMemo(() => {
    const map = new Map();

    comprehensionQuestions.forEach((item) => {
      const key =
        item.passage_id ||
        item.passage_title ||
        item.id;

      if (!map.has(key)) {
        map.set(key, {
          id: key,
          title:
            item.passage_title ||
            "Untitled Passage",
          passage: item.passage || "",
          questions: [],
        });
      }

      map.get(key).questions.push(item);
    });

    return Array.from(map.values());
  }, [comprehensionQuestions]);

  // ==========================================================
  // FILTER
  // ==========================================================

  const filteredQuestions = useMemo(() => {
    const query = search.trim().toLowerCase();

    let source = questions;

    if (activeView === "objective") {
      source = objectiveQuestions;
    }

    if (activeView === "comprehension") {
      source = comprehensionQuestions;
    }

    if (!query) return source;

    return source.filter((item) => {
      const searchable = [
        item.exam,
        item.subject,
        item.question,
        item.passage_title,
        item.passage,
        item.answer,
        item.reason,
        item.image,
        ...(item.options || []).map(
          (option) => option.text
        ),
      ]
        .map((value) =>
          getTextFromContent(value || "")
        )
        .join(" ")
        .toLowerCase();

      return searchable.includes(query);
    });
  }, [
    questions,
    objectiveQuestions,
    comprehensionQuestions,
    activeView,
    search,
  ]);

  // ==========================================================
  // DISPLAY PAGINATION
  // This does not limit database fetching.
  // ==========================================================

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredQuestions.length /
        QUESTIONS_PER_PAGE
    )
  );

  const currentPage = Math.min(page, totalPages);

  const paginatedQuestions = useMemo(() => {
    const start =
      (currentPage - 1) *
      QUESTIONS_PER_PAGE;

    return filteredQuestions.slice(
      start,
      start + QUESTIONS_PER_PAGE
    );
  }, [filteredQuestions, currentPage]);

  useEffect(() => {
    setPage(1);
  }, [search, activeView]);

  // ==========================================================
  // DELETE QUESTION
  // DELETE /api/admin/cbt/questions/:id
  // ==========================================================

  const deleteQuestion = async (question) => {
    if (!question?.id) return;

    const confirmed = window.confirm(
      "Are you sure you want to permanently delete this question?"
    );

    if (!confirmed) return;

    setDeleting(question.id);

    try {
      await apiRequest(
        `${QUESTIONS_API}/${encodeURIComponent(
          question.id
        )}`,
        {
          method: "DELETE",
        }
      );

      setQuestions((current) =>
        current.filter(
          (item) =>
            String(item.id) !==
            String(question.id)
        )
      );

      setEditingQuestion((current) =>
        current &&
        String(current.id) ===
          String(question.id)
          ? null
          : current
      );
    } catch (error) {
      console.error(
        "Delete Question Error:",
        error
      );

      window.alert(
        error.message ||
          "Unable to delete question."
      );
    } finally {
      setDeleting(null);
    }
  };

  // ==========================================================
  // TOGGLE QUESTION STATUS
  // PATCH /api/admin/cbt/questions/:id/status
  // ==========================================================

  const toggleActive = async (question) => {
    if (!question?.id) return;

    const nextActive = !question.active;

    setActivating(question.id);

    try {
      const data = await apiRequest(
        `${QUESTIONS_API}/${encodeURIComponent(
          question.id
        )}/status`,
        {
          method: "PATCH",
          body: JSON.stringify({
            active: nextActive,
          }),
        }
      );

      const updated =
        data.question || {
          ...question,
          active: nextActive,
        };

      updateLocalQuestion(updated);
    } catch (error) {
      console.error(
        "Toggle Question Status Error:",
        error
      );

      window.alert(
        error.message ||
          "Unable to update question status."
      );
    } finally {
      setActivating(null);
    }
  };

  // ==========================================================
  // SAVE QUESTION
  // POST /api/admin/cbt/questions
  // PATCH /api/admin/cbt/questions/:id
  // ==========================================================

  const saveQuestion = async () => {
    if (!editingQuestion || saving) return;

    const current = editingQuestion;

    const exam = String(
      current.exam || ""
    ).trim();

    const subject = String(
      current.subject || ""
    ).trim();

    const questionText = cleanRichContent(
      current.question || ""
    );

    const answer = String(
      current.answer || ""
    ).trim();

    const questionType =
      String(
        current.question_type || "objective"
      ).toLowerCase() === "comprehension"
        ? "comprehension"
        : "objective";

    const options = (
      current.options || []
    )
      .map((option, index) => ({
        label:
          option.label ||
          String.fromCharCode(65 + index),
        text: String(
          option.text || ""
        ).trim(),
      }))
      .filter((option) => option.text);

    if (!exam) {
      window.alert("Please select an exam.");
      return;
    }

    if (!subject) {
      window.alert("Please enter a subject.");
      return;
    }

    if (!questionText) {
      window.alert("Please enter the question.");
      return;
    }

    if (!answer) {
      window.alert(
        "Please select the correct answer."
      );
      return;
    }

    if (options.length < 2) {
      window.alert(
        "Please provide at least two answer options."
      );
      return;
    }

    if (
      !options.some(
        (option) => option.label === answer
      )
    ) {
      window.alert(
        "The selected correct answer does not match an available option."
      );
      return;
    }

    if (
      questionType === "comprehension" &&
      !String(current.passage || "").trim()
    ) {
      window.alert(
        "Please enter the comprehension passage."
      );
      return;
    }

    if (
      questionType === "comprehension" &&
      !String(
        current.passage_title || ""
      ).trim()
    ) {
      window.alert(
        "Please enter the passage title."
      );
      return;
    }

    const optionMap = {};

    options.forEach((option) => {
      optionMap[option.label] = option.text;
    });

    const payload = {
      exam,
      subject,
      question: questionText,
      options,
      answer,
      image: String(current.image || "").trim(),
      reason: String(current.reason || "").trim(),

      question_type: questionType,

      passage_id:
        questionType === "comprehension"
          ? current.passage_id ||
            createPassageId()
          : null,

      passage_title:
        questionType === "comprehension"
          ? String(
              current.passage_title || ""
            ).trim()
          : null,

      passage:
        questionType === "comprehension"
          ? String(current.passage || "").trim()
          : null,

      passage_order:
        questionType === "comprehension"
          ? Number(current.passage_order) || 0
          : null,

      optionA: optionMap.A || "",
      optionB: optionMap.B || "",
      optionC: optionMap.C || "",
      optionD: optionMap.D || "",

      active:
        current.active !== false,
    };

    setSaving(true);

    try {
      const isNew =
        current.isNew ||
        !current.id;

      const url = isNew
        ? QUESTIONS_API
        : `${QUESTIONS_API}/${encodeURIComponent(
            current.id
          )}`;

      const data = await apiRequest(url, {
        method: isNew ? "POST" : "PATCH",
        body: JSON.stringify(payload),
      });

      const savedQuestion =
        data.question;

      if (!savedQuestion) {
        throw new Error(
          "The server did not return the saved question."
        );
      }

      const normalized =
        normalizeQuestionRecord(savedQuestion);

      if (isNew) {
        setQuestions((existing) => [
          normalized,
          ...existing,
        ]);

        setPage(1);
      } else {
        setQuestions((existing) =>
          existing.map((item) =>
            String(item.id) ===
            String(normalized.id)
              ? normalized
              : item
          )
        );
      }

      setEditingQuestion(null);
    } catch (error) {
      console.error(
        "Save Question Error:",
        error
      );

      window.alert(
        error.message ||
          "Unable to save question."
      );
    } finally {
      setSaving(false);
    }
  };

  // ==========================================================
  // DUPLICATE QUESTION
  // ==========================================================

  const duplicateQuestion = (question) => {
    const duplicate = {
      ...normalizeQuestionRecord(question),
      id: undefined,
      isNew: true,
      question: `${question.question || ""}`,
      passage_id: isComprehensionQuestion(question)
        ? createPassageId()
        : null,
      active: true,
      options: (
        question.options || []
      ).map((option) => ({
        ...option,
      })),
    };

    setEditingQuestion(duplicate);
  };

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="min-h-screen bg-slate-950 p-5 text-white sm:p-8">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}

        <div className="mb-8 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-cyan-400">
              <Layers3 size={16} />
              General CBT Management
            </div>

            <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
              Question Bank
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              Manage objective questions, comprehension passages,
              answers and explanations for your examinations.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={openCreateObjective}
              className="inline-flex items-center gap-2 rounded-xl border border-cyan-400/30 bg-cyan-500/10 px-4 py-3 text-sm font-bold text-cyan-300 transition hover:bg-cyan-500/20"
            >
              <Plus size={17} />
              Objective Question
            </button>

            <button
              type="button"
              onClick={openCreateComprehension}
              className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-400"
            >
              <BookOpen size={17} />
              Comprehension
            </button>
          </div>
        </div>

        {/* ERROR */}

        {loadError && (
          <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold text-red-300">
                Unable to load questions
              </p>

              <p className="mt-1 text-sm text-red-200/80">
                {loadError}
              </p>
            </div>

            <button
              type="button"
              onClick={() => fetchQuestions()}
              className="rounded-xl border border-red-400/30 px-4 py-2 text-sm font-bold text-red-200 hover:bg-red-500/10"
            >
              Try again
            </button>
          </div>
        )}

        {/* STATISTICS */}

        <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon={<Layers3 size={20} />}
            label="Total Questions"
            value={questions.length}
            description="Questions in your bank"
          />

          <StatCard
            icon={<FileText size={20} />}
            label="Objective"
            value={objectiveQuestions.length}
            description="Multiple-choice questions"
          />

          <StatCard
            icon={<BookOpen size={20} />}
            label="Comprehension"
            value={comprehensionQuestions.length}
            description={`${passageGroups.length} passage groups`}
          />

          <StatCard
            icon={<CheckCircle2 size={20} />}
            label="Active Questions"
            value={
              questions.filter(
                (item) => item.active
              ).length
            }
            description="Available questions"
          />
        </div>

        {/* SEARCH AND FILTERS */}

        <div className="mb-6 rounded-2xl border border-white/10 bg-slate-900/70 p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

            <div className="relative w-full lg:max-w-md">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
              />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search questions, subjects, passages..."
                className="w-full rounded-xl border border-white/10 bg-slate-950 py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/50"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                ["all", "All", questions.length],
                [
                  "objective",
                  "Objective",
                  objectiveQuestions.length,
                ],
                [
                  "comprehension",
                  "Comprehension",
                  comprehensionQuestions.length,
                ],
              ].map(([value, label, count]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() =>
                    setActiveView(value)
                  }
                  className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
                    activeView === value
                      ? "border-cyan-400/40 bg-cyan-500/10 text-cyan-300"
                      : "border-white/10 bg-white/[0.025] text-slate-400 hover:bg-white/[0.06] hover:text-white"
                  }`}
                >
                  {label}

                  <span className="rounded-md bg-black/20 px-2 py-0.5 text-xs">
                    {count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* QUESTION LIST */}

        {loading ? (
          <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-white/10 bg-slate-900/50">
            <Loader2
              size={34}
              className="animate-spin text-cyan-400"
            />

            <p className="mt-4 text-sm font-semibold text-slate-300">
              Loading questions...
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Connecting to the question database
            </p>
          </div>
        ) : filteredQuestions.length === 0 ? (
          <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-slate-900/40 px-5 text-center">
            <div className="mb-4 rounded-2xl bg-white/[0.04] p-4 text-slate-500">
              <BookOpen size={30} />
            </div>

            <h3 className="text-lg font-bold text-white">
              No questions found
            </h3>

            <p className="mt-2 max-w-md text-sm text-slate-500">
              {search
                ? "Try another search term or change your filters."
                : "Your question bank is empty. Create your first question to get started."}
            </p>

            {!search && (
              <button
                type="button"
                onClick={openCreateObjective}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 text-sm font-bold text-slate-950 hover:bg-cyan-400"
              >
                <Plus size={17} />
                Add Question
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {paginatedQuestions.map((question) => (
              <QuestionCard
                key={question.id}
                question={question}
                onEdit={openEditQuestion}
                onDelete={deleteQuestion}
                onToggle={toggleActive}
                onDuplicate={duplicateQuestion}
                deleting={deleting}
                activating={activating}
              />
            ))}
          </div>
        )}

        {/* PAGINATION */}

        {!loading &&
          filteredQuestions.length > 0 && (
            <div className="mt-7 flex flex-col gap-4 rounded-2xl border border-white/10 bg-slate-900/60 p-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-400">
                Showing{" "}
                <span className="font-bold text-white">
                  {(currentPage - 1) *
                    QUESTIONS_PER_PAGE +
                    1}
                </span>{" "}
                to{" "}
                <span className="font-bold text-white">
                  {Math.min(
                    currentPage *
                      QUESTIONS_PER_PAGE,
                    filteredQuestions.length
                  )}
                </span>{" "}
                of{" "}
                <span className="font-bold text-white">
                  {filteredQuestions.length}
                </span>{" "}
                questions
              </p>

              <Pagination
                page={currentPage}
                totalPages={totalPages}
                onChange={setPage}
              />
            </div>
          )}
      </div>

      {/* EDITOR MODAL */}

      {editingQuestion && (
        <EditQuestionModal
          question={editingQuestion}
          saving={saving}
          onClose={closeEditor}
          onSave={saveQuestion}
          onFieldChange={handleEditorFieldChange}
          onOptionChange={handleOptionChange}
          onAddOption={addOption}
          onRemoveOption={removeOption}
        />
      )}
    </div>
  );
}

// ============================================================
// QUESTION CARD
// ============================================================

const QuestionCard = memo(
  ({
    question,
    onEdit,
    onDelete,
    onToggle,
    onDuplicate,
    deleting,
    activating,
  }) => {
    const isComp =
      isComprehensionQuestion(question);

    return (
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/70 transition hover:border-cyan-400/20">

        {/* CARD HEADER */}

        <div className="flex flex-col gap-4 border-b border-white/[0.06] p-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="rounded-lg border border-cyan-400/20 bg-cyan-500/10 px-2.5 py-1 text-xs font-bold text-cyan-300">
                {question.exam || "General"}
              </span>

              <span className="rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs font-semibold text-slate-300">
                {question.subject || "No subject"}
              </span>

              <span
                className={`rounded-lg px-2.5 py-1 text-xs font-bold ${
                  isComp
                    ? "border border-purple-400/20 bg-purple-500/10 text-purple-300"
                    : "border border-blue-400/20 bg-blue-500/10 text-blue-300"
                }`}
              >
                {isComp
                  ? "Comprehension"
                  : "Objective"}
              </span>

              <span
                className={`rounded-lg px-2.5 py-1 text-xs font-bold ${
                  question.active
                    ? "border border-emerald-400/20 bg-emerald-500/10 text-emerald-300"
                    : "border border-red-400/20 bg-red-500/10 text-red-300"
                }`}
              >
                {question.active
                  ? "Active"
                  : "Inactive"}
              </span>
            </div>

            <div className="text-sm font-semibold leading-7 text-white">
              <RichContent
                content={question.question}
              />
            </div>
          </div>

          {/* ACTIONS */}

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              title="Duplicate question"
              onClick={() =>
                onDuplicate(question)
              }
              className="rounded-xl border border-white/10 bg-white/[0.035] p-2.5 text-slate-400 transition hover:border-cyan-400/30 hover:text-cyan-300"
            >
              <Copy size={16} />
            </button>

            <button
              type="button"
              title="Edit question"
              onClick={() =>
                onEdit(question)
              }
              className="rounded-xl border border-white/10 bg-white/[0.035] p-2.5 text-slate-400 transition hover:border-cyan-400/30 hover:text-cyan-300"
            >
              <Edit3 size={16} />
            </button>

            <button
              type="button"
              title={
                question.active
                  ? "Deactivate question"
                  : "Activate question"
              }
              disabled={
                String(activating) ===
                String(question.id)
              }
              onClick={() =>
                onToggle(question)
              }
              className="rounded-xl border border-white/10 bg-white/[0.035] p-2.5 text-slate-400 transition hover:border-amber-400/30 hover:text-amber-300 disabled:opacity-40"
            >
              {String(activating) ===
              String(question.id) ? (
                <Loader2
                  size={16}
                  className="animate-spin"
                />
              ) : (
                <Power size={16} />
              )}
            </button>

            <button
              type="button"
              title="Delete question"
              disabled={
                String(deleting) ===
                String(question.id)
              }
              onClick={() =>
                onDelete(question)
              }
              className="rounded-xl border border-white/10 bg-white/[0.035] p-2.5 text-slate-400 transition hover:border-red-400/30 hover:text-red-300 disabled:opacity-40"
            >
              {String(deleting) ===
              String(question.id) ? (
                <Loader2
                  size={16}
                  className="animate-spin"
                />
              ) : (
                <Trash2 size={16} />
              )}
            </button>
          </div>
        </div>

        {/* COMPREHENSION PASSAGE */}

        {isComp && question.passage && (
          <div className="border-b border-purple-400/10 bg-purple-500/[0.035] p-5">
            <div className="mb-3 flex items-center gap-2">
              <BookOpen
                size={16}
                className="text-purple-300"
              />

              <span className="text-xs font-bold uppercase tracking-wider text-purple-300">
                {question.passage_title ||
                  "Comprehension Passage"}
              </span>
            </div>

            <div className="rounded-xl border border-purple-400/10 bg-slate-950/50 p-4 text-sm leading-7 text-slate-300">
              <RichContent
                content={question.passage}
              />
            </div>
          </div>
        )}

        {/* QUESTION CONTENT */}

        <div className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Answer Options
            </span>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            {(question.options || []).map(
              (option, index) => {
                const isCorrect =
                  String(question.answer).toUpperCase() ===
                  String(option.label).toUpperCase();

                return (
                  <div
                    key={`${option.label}-${index}`}
                    className={`flex items-start gap-3 rounded-xl border p-3 ${
                      isCorrect
                        ? "border-emerald-400/25 bg-emerald-500/[0.07]"
                        : "border-white/[0.07] bg-white/[0.02]"
                    }`}
                  >
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-black ${
                        isCorrect
                          ? "bg-emerald-500 text-slate-950"
                          : "bg-white/[0.07] text-slate-400"
                      }`}
                    >
                      {option.label}
                    </span>

                    <div className="min-w-0 flex-1 pt-1 text-sm leading-6 text-slate-300">
                      <RichContent
                        content={option.text}
                      />
                    </div>

                    {isCorrect && (
                      <CheckCircle2
                        size={17}
                        className="mt-1 shrink-0 text-emerald-400"
                      />
                    )}
                  </div>
                );
              }
            )}
          </div>

          {/* ANSWER */}

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Correct answer:
            </span>

            <span className="rounded-lg border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-sm font-black text-emerald-300">
              {question.answer}
            </span>
          </div>

          {/* EXPLANATION */}

          {question.reason && (
            <div className="mt-4 rounded-xl border border-white/[0.07] bg-white/[0.025] p-4">
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                Explanation
              </p>

              <div className="text-sm leading-7 text-slate-300">
                <RichContent
                  content={question.reason}
                />
              </div>
            </div>
          )}

          {/* IMAGE */}

          {question.image && (
            <div className="mt-4">
              <img
                src={question.image}
                alt="Question illustration"
                loading="lazy"
                className="max-h-64 max-w-full rounded-xl border border-white/10 object-contain"
                onError={(event) => {
                  event.currentTarget.style.display =
                    "none";
                }}
              />
            </div>
          )}
        </div>
      </div>
    );
  }
);

// ============================================================
// EDIT QUESTION MODAL
// ============================================================

const EditQuestionModal = ({
  question,
  saving,
  onClose,
  onSave,
  onFieldChange,
  onOptionChange,
  onAddOption,
  onRemoveOption,
}) => {
  const isComp =
    String(question.question_type || "").toLowerCase() ===
      "comprehension" ||
    Boolean(question.passage_id);

  const [showQuestionPreview, setShowQuestionPreview] =
    useState(false);

  const [showPassagePreview, setShowPassagePreview] =
    useState(false);

  const [showReasonPreview, setShowReasonPreview] =
    useState(false);

  const [showMathTools, setShowMathTools] =
    useState(false);

  const updateQuestion = (value) =>
    onFieldChange("question", value);

  const updatePassage = (value) =>
    onFieldChange("passage", value);

  const updateReason = (value) =>
    onFieldChange("reason", value);

  const insertIntoField = (
    field,
    text
  ) => {
    const currentValue =
      question[field] || "";

    onFieldChange(
      field,
      `${currentValue}${currentValue ? " " : ""}${text}`
    );
  };

  const switchQuestionType = (type) => {
    if (type === "objective") {
      onFieldChange("question_type", "objective");
      onFieldChange("passage_id", null);
      onFieldChange("passage_title", "");
      onFieldChange("passage", "");
      onFieldChange("passage_order", null);
      return;
    }

    onFieldChange(
      "question_type",
      "comprehension"
    );

    onFieldChange(
      "passage_id",
      question.passage_id ||
        createPassageId()
    );
  };

  return (
    <div
      className="fixed inset-0 z-[100] overflow-y-auto bg-black/80 p-3 backdrop-blur-sm sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="mx-auto my-4 max-w-5xl overflow-hidden rounded-2xl border border-white/10 bg-slate-950 shadow-2xl shadow-black/50 sm:my-8">

        {/* MODAL HEADER */}

        <div className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-white/10 bg-slate-950/95 px-5 py-5 backdrop-blur sm:px-7">
          <div>
            <div className="mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-400">
              <FileText size={15} />
              General CBT Question Bank
            </div>

            <h2 className="text-xl font-black text-white sm:text-2xl">
              {question.isNew
                ? "Create Question"
                : "Edit Question"}
            </h2>
          </div>

          <button
            type="button"
            disabled={saving}
            onClick={onClose}
            className="rounded-xl border border-white/10 bg-white/[0.04] p-2.5 text-slate-400 transition hover:bg-white/10 hover:text-white disabled:opacity-40"
          >
            <X size={19} />
          </button>
        </div>

        {/* MODAL BODY */}

        <div className="space-y-7 p-5 sm:p-7">

          {/* QUESTION TYPE */}

          <section>
            <Field label="Question Type">
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() =>
                    switchQuestionType("objective")
                  }
                  className={`flex items-center justify-center gap-2 rounded-xl border p-4 text-sm font-bold transition ${
                    !isComp
                      ? "border-cyan-400/40 bg-cyan-500/10 text-cyan-300"
                      : "border-white/10 bg-white/[0.025] text-slate-400 hover:bg-white/[0.05]"
                  }`}
                >
                  <Layers3 size={17} />
                  Objective
                </button>

                <button
                  type="button"
                  onClick={() =>
                    switchQuestionType("comprehension")
                  }
                  className={`flex items-center justify-center gap-2 rounded-xl border p-4 text-sm font-bold transition ${
                    isComp
                      ? "border-purple-400/40 bg-purple-500/10 text-purple-300"
                      : "border-white/10 bg-white/[0.025] text-slate-400 hover:bg-white/[0.05]"
                  }`}
                >
                  <BookOpen size={17} />
                  Comprehension
                </button>
              </div>
            </Field>
          </section>

          {/* EXAM AND SUBJECT */}

          <section className="grid gap-5 sm:grid-cols-2">
            <Field label="Examination">
              <select
                value={question.exam || ""}
                onChange={(event) =>
                  onFieldChange(
                    "exam",
                    event.target.value
                  )
                }
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400/50"
              >
                <option value="">
                  Select examination
                </option>
                <option value="JAMB">JAMB</option>
                <option value="WAEC">WAEC</option>
                <option value="NECO">NECO</option>
                <option value="GCE">GCE</option>
                <option value="JUPEB">JUPEB</option>
                <option value="POST-UTME">
                  POST-UTME
                </option>
              </select>
            </Field>

            <Field label="Subject">
              <input
                type="text"
                value={question.subject || ""}
                onChange={(event) =>
                  onFieldChange(
                    "subject",
                    event.target.value
                  )
                }
                placeholder="e.g. Mathematics"
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-400/50"
              />
            </Field>
          </section>

          {/* COMPREHENSION PASSAGE */}

          {isComp && (
            <section className="space-y-5 rounded-2xl border border-purple-400/20 bg-purple-500/[0.035] p-4 sm:p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-purple-500/10 p-2.5 text-purple-300">
                  <BookOpen size={20} />
                </div>

                <div>
                  <h3 className="font-bold text-white">
                    Comprehension Passage
                  </h3>

                  <p className="mt-1 text-xs text-slate-500">
                    Questions with the same passage can share this passage ID.
                  </p>
                </div>
              </div>

              <Field label="Passage Title">
                <input
                  type="text"
                  value={
                    question.passage_title || ""
                  }
                  onChange={(event) =>
                    onFieldChange(
                      "passage_title",
                      event.target.value
                    )
                  }
                  placeholder="Enter passage title"
                  className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-purple-400/50"
                />
              </Field>

              <Field label="Passage Content">
                <textarea
                  rows={9}
                  value={question.passage || ""}
                  onChange={(event) =>
                    updatePassage(event.target.value)
                  }
                  placeholder="Enter the full comprehension passage..."
                  className="w-full resize-y rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm leading-7 text-white outline-none placeholder:text-slate-600 focus:border-purple-400/50"
                />
              </Field>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setShowPassagePreview(
                      !showPassagePreview
                    )
                  }
                  className="inline-flex items-center gap-2 rounded-lg border border-purple-400/20 px-3 py-2 text-xs font-bold text-purple-300 hover:bg-purple-500/10"
                >
                  {showPassagePreview ? (
                    <EyeOff size={14} />
                  ) : (
                    <Eye size={14} />
                  )}

                  {showPassagePreview
                    ? "Hide Preview"
                    : "Preview Passage"}
                </button>

                <span className="text-xs text-slate-500">
                  {(
                    question.passage || ""
                  ).length} characters
                </span>
              </div>

              {showPassagePreview && (
                <div className="rounded-xl border border-purple-400/15 bg-slate-950 p-4">
                  <div className="mb-3 text-xs font-bold uppercase tracking-wider text-purple-300">
                    Passage Preview
                  </div>

                  <div className="text-sm leading-7 text-slate-300">
                    <RichContent
                      content={question.passage}
                    />
                  </div>
                </div>
              )}
            </section>
          )}

          {/* QUESTION TEXT */}

          <section className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-sm font-bold text-white">
                Question Content
              </h3>

              <button
                type="button"
                onClick={() =>
                  setShowMathTools(!showMathTools)
                }
                className="inline-flex items-center gap-2 rounded-lg border border-cyan-400/20 px-3 py-2 text-xs font-bold text-cyan-300 hover:bg-cyan-500/10"
              >
                <Sigma size={15} />
                Math Tools
                {showMathTools ? (
                  <ChevronUp size={14} />
                ) : (
                  <ChevronDown size={14} />
                )}
              </button>
            </div>

            {showMathTools && (
              <div className="flex flex-wrap items-center gap-2 rounded-xl border border-white/10 bg-slate-900 p-3">
                <ToolbarButton
                  icon={<Bold size={15} />}
                  title="Bold"
                  onClick={() =>
                    insertIntoField(
                      "question",
                      "**bold text**"
                    )
                  }
                />

                <ToolbarButton
                  icon={<Italic size={15} />}
                  title="Italic"
                  onClick={() =>
                    insertIntoField(
                      "question",
                      "*italic text*"
                    )
                  }
                />

                <ToolbarButton
                  icon={<Superscript size={15} />}
                  title="Superscript"
                  onClick={() =>
                    insertIntoField(
                      "question",
                      "$x^{2}$"
                    )
                  }
                />

                <ToolbarButton
                  icon={<Subscript size={15} />}
                  title="Subscript"
                  onClick={() =>
                    insertIntoField(
                      "question",
                      "$x_{2}$"
                    )
                  }
                />

                <ToolbarDivider />

                <ToolbarButton
                  icon={<Sigma size={15} />}
                  title="Fraction"
                  onClick={() =>
                    insertIntoField(
                      "question",
                      "$\\frac{a}{b}$"
                    )
                  }
                />

                <ToolbarButton
                  icon={<span className="text-sm">√</span>}
                  title="Square root"
                  onClick={() =>
                    insertIntoField(
                      "question",
                      "$\\sqrt{x}$"
                    )
                  }
                />

                <ToolbarButton
                  icon={<span className="text-sm">∑</span>}
                  title="Summation"
                  onClick={() =>
                    insertIntoField(
                      "question",
                      "$\\sum_{i=1}^{n}x_i$"
                    )
                  }
                />

                <ToolbarButton
                  icon={<span className="text-sm">∫</span>}
                  title="Integral"
                  onClick={() =>
                    insertIntoField(
                      "question",
                      "$\\int_a^b f(x)\\,dx$"
                    )
                  }
                />
              </div>
            )}

            <Field label="Question">
              <textarea
                rows={5}
                value={question.question || ""}
                onChange={(event) =>
                  updateQuestion(event.target.value)
                }
                placeholder="Enter the question. You can use $...$ for inline mathematics and $$...$$ for displayed mathematics."
                className="w-full resize-y rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm leading-7 text-white outline-none placeholder:text-slate-600 focus:border-cyan-400/50"
              />
            </Field>

            <button
              type="button"
              onClick={() =>
                setShowQuestionPreview(
                  !showQuestionPreview
                )
              }
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs font-bold text-slate-400 hover:bg-white/[0.04] hover:text-white"
            >
              {showQuestionPreview ? (
                <EyeOff size={14} />
              ) : (
                <Eye size={14} />
              )}

              {showQuestionPreview
                ? "Hide Preview"
                : "Preview Question"}
            </button>

            {showQuestionPreview && (
              <div className="rounded-xl border border-cyan-400/15 bg-slate-900/80 p-4">
                <p className="mb-3 text-xs font-bold uppercase tracking-wider text-cyan-300">
                  Question Preview
                </p>

                <div className="text-sm leading-7 text-slate-200">
                  <RichContent
                    content={question.question}
                  />
                </div>
              </div>
            )}
          </section>

          {/* ANSWER OPTIONS */}

          <section className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-white">
                  Answer Options
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  Select the correct answer.
                </p>
              </div>

              <button
                type="button"
                onClick={onAddOption}
                disabled={
                  (question.options || []).length >= 6
                }
                className="inline-flex items-center gap-2 rounded-xl border border-cyan-400/20 bg-cyan-500/10 px-3 py-2 text-xs font-bold text-cyan-300 transition hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Plus size={15} />
                Add Option
              </button>
            </div>

            <div className="space-y-3">
              {(question.options || []).map(
                (option, index) => (
                  <OptionEditor
                    key={`${option.label}-${index}`}
                    option={option}
                    index={index}
                    answer={question.answer}
                    onChange={onOptionChange}
                    onRemove={onRemoveOption}
                    canRemove={
                      question.options.length > 2
                    }
                    onSelectAnswer={(label) =>
                      onFieldChange(
                        "answer",
                        label
                      )
                    }
                  />
                )
              )}
            </div>
          </section>

          {/* EXPLANATION */}

          <section className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-white">
                Answer Explanation
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                Explain why the selected answer is correct.
              </p>
            </div>

            <Field label="Reason / Explanation">
              <textarea
                rows={5}
                value={question.reason || ""}
                onChange={(event) =>
                  updateReason(event.target.value)
                }
                placeholder="Enter the explanation or solution..."
                className="w-full resize-y rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm leading-7 text-white outline-none placeholder:text-slate-600 focus:border-cyan-400/50"
              />
            </Field>

            <button
              type="button"
              onClick={() =>
                setShowReasonPreview(
                  !showReasonPreview
                )
              }
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs font-bold text-slate-400 hover:bg-white/[0.04] hover:text-white"
            >
              {showReasonPreview ? (
                <EyeOff size={14} />
              ) : (
                <Eye size={14} />
              )}

              {showReasonPreview
                ? "Hide Explanation Preview"
                : "Preview Explanation"}
            </button>

            {showReasonPreview && (
              <div className="rounded-xl border border-white/10 bg-slate-900/80 p-4">
                <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">
                  Explanation Preview
                </p>

                <div className="text-sm leading-7 text-slate-300">
                  <RichContent
                    content={question.reason}
                  />
                </div>
              </div>
            )}
          </section>

          {/* IMAGE */}

          <section className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-white">
                Question Image
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                Add an image URL if the question requires a diagram or illustration.
              </p>
            </div>

            <Field label="Image URL">
              <div className="relative">
                <ImageIcon
                  size={17}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                />

                <input
                  type="url"
                  value={question.image || ""}
                  onChange={(event) =>
                    onFieldChange(
                      "image",
                      event.target.value
                    )
                  }
                  placeholder="https://example.com/question-image.png"
                  className="w-full rounded-xl border border-white/10 bg-slate-900 py-3 pl-11 pr-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-400/50"
                />
              </div>
            </Field>

            {question.image && (
              <div className="rounded-xl border border-white/10 bg-slate-900 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Image Preview
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      onFieldChange("image", "")
                    }
                    className="inline-flex items-center gap-1 text-xs font-semibold text-red-400 hover:text-red-300"
                  >
                    <Trash2 size={13} />
                    Remove
                  </button>
                </div>

                <img
                  src={question.image}
                  alt="Question preview"
                  className="max-h-72 max-w-full rounded-lg object-contain"
                  onError={(event) => {
                    event.currentTarget.style.display =
                      "none";
                  }}
                />
              </div>
            )}
          </section>

          {/* STATUS */}

          <section className="rounded-xl border border-white/10 bg-slate-900/70 p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-white">
                  Question Availability
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  Control whether this question is active.
                </p>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={question.active !== false}
                onClick={() =>
                  onFieldChange(
                    "active",
                    question.active === false
                  )
                }
                className={`relative h-7 w-12 shrink-0 rounded-full transition ${
                  question.active !== false
                    ? "bg-emerald-500"
                    : "bg-slate-700"
                }`}
              >
                <span
                  className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${
                    question.active !== false
                      ? "left-6"
                      : "left-1"
                  }`}
                />
              </button>
            </div>

            <div className="mt-3">
              <span
                className={`inline-flex items-center gap-2 text-xs font-bold ${
                  question.active !== false
                    ? "text-emerald-400"
                    : "text-slate-500"
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    question.active !== false
                      ? "bg-emerald-400"
                      : "bg-slate-600"
                  }`}
                />

                {question.active !== false
                  ? "This question is active"
                  : "This question is inactive"}
              </span>
            </div>
          </section>
        </div>

        {/* MODAL FOOTER */}

        <div className="sticky bottom-0 z-20 flex flex-col-reverse gap-3 border-t border-white/10 bg-slate-950/95 px-5 py-5 backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:px-7">
          <button
            type="button"
            disabled={saving}
            onClick={onClose}
            className="rounded-xl border border-white/10 bg-white/[0.035] px-5 py-3 text-sm font-bold text-slate-300 transition hover:bg-white/[0.08] disabled:opacity-40"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={saving}
            onClick={onSave}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-7 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
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
                {question.isNew
                  ? "Create Question"
                  : "Save Changes"}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// OPTION EDITOR
// ============================================================

const OptionEditor = ({
  option,
  index,
  answer,
  onChange,
  onRemove,
  canRemove,
  onSelectAnswer,
}) => {
  const selected =
    String(answer).toUpperCase() ===
    String(option.label).toUpperCase();

  return (
    <div
      className={`flex items-start gap-3 rounded-xl border p-3 transition ${
        selected
          ? "border-emerald-400/30 bg-emerald-500/[0.055]"
          : "border-white/10 bg-slate-900/70"
      }`}
    >
      <button
        type="button"
        title="Set as correct answer"
        onClick={() =>
          onSelectAnswer(option.label)
        }
        className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-black transition ${
          selected
            ? "bg-emerald-500 text-slate-950"
            : "bg-white/[0.06] text-slate-400 hover:bg-white/10 hover:text-white"
        }`}
      >
        {selected ? (
          <Check size={16} />
        ) : (
          option.label
        )}
      </button>

      <div className="min-w-0 flex-1">
        <textarea
          rows={2}
          value={option.text || ""}
          onChange={(event) =>
            onChange(index, event.target.value)
          }
          placeholder={`Enter option ${option.label}...`}
          className="w-full resize-y rounded-lg border border-white/[0.07] bg-slate-950 px-3 py-2.5 text-sm leading-6 text-white outline-none placeholder:text-slate-600 focus:border-cyan-400/40"
        />

        {selected && (
          <span className="mt-2 inline-block text-[11px] font-bold uppercase tracking-wider text-emerald-400">
            Correct answer
          </span>
        )}
      </div>

      {canRemove && (
        <button
          type="button"
          title="Remove option"
          onClick={() => onRemove(index)}
          className="mt-1 rounded-lg p-2 text-slate-500 transition hover:bg-red-500/10 hover:text-red-400"
        >
          <Trash2 size={16} />
        </button>
      )}
    </div>
  );
};

// ============================================================
// MATH BUTTON
// ============================================================

const MathButton = ({
  children,
  onClick,
  title,
}) => (
  <button
    type="button"
    title={title}
    onClick={onClick}
    className="flex h-9 min-w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.035] px-2 text-sm font-semibold text-slate-300 transition hover:border-cyan-400/30 hover:bg-cyan-500/10 hover:text-cyan-300"
  >
    {children}
  </button>
);

// ============================================================
// TOOLBAR BUTTON
// ============================================================

const ToolbarButton = ({
  icon,
  onClick,
  title,
}) => (
  <button
    type="button"
    title={title}
    onClick={onClick}
    className="flex h-9 min-w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.035] px-2 text-slate-300 transition hover:border-cyan-400/30 hover:bg-cyan-500/10 hover:text-cyan-300"
  >
    {icon}
  </button>
);

// ============================================================
// TOOLBAR DIVIDER
// ============================================================

const ToolbarDivider = () => (
  <div className="mx-1 h-6 w-px bg-white/10" />
);

// ============================================================
// FIELD
// ============================================================

const Field = ({
  label,
  children,
}) => (
  <div className="min-w-0 space-y-2">
    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
      {label}
    </label>

    {children}
  </div>
);

// ============================================================
// STAT CARD
// ============================================================

const StatCard = ({
  icon,
  label,
  value,
  description,
}) => (
  <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-5 transition hover:border-cyan-400/20">
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
        {label}
      </span>

      <div className="rounded-xl border border-cyan-400/10 bg-cyan-500/[0.07] p-2.5 text-cyan-300">
        {icon}
      </div>
    </div>

    <div className="mt-4 text-3xl font-black tracking-tight text-white">
      {Number(value || 0).toLocaleString()}
    </div>

    <p className="mt-1 text-xs text-slate-500">
      {description}
    </p>
  </div>
);

// ============================================================
// PAGINATION
// ============================================================

const Pagination = ({
  page,
  totalPages,
  onChange,
}) => {
  if (totalPages <= 1) return null;

  const getPages = () => {
    const pages = new Set([
      1,
      totalPages,
      page,
      page - 1,
      page + 1,
    ]);

    return Array.from(pages)
      .filter(
        (number) =>
          number >= 1 &&
          number <= totalPages
      )
      .sort((a, b) => a - b);
  };

  const pages = getPages();

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        disabled={page <= 1}
        onClick={() =>
          onChange(page - 1)
        }
        className="rounded-lg border border-white/10 bg-white/[0.035] px-3 py-2 text-xs font-bold text-slate-300 transition hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-30"
      >
        Previous
      </button>

      {pages.map((number, index) => (
        <React.Fragment key={number}>
          {index > 0 &&
            number - pages[index - 1] > 1 && (
              <span className="px-1 text-slate-600">
                ...
              </span>
            )}

          <button
            type="button"
            onClick={() => onChange(number)}
            className={`h-9 min-w-9 rounded-lg px-3 text-xs font-bold transition ${
              page === number
                ? "bg-cyan-500 text-slate-950"
                : "border border-white/10 bg-white/[0.035] text-slate-400 hover:bg-white/[0.08] hover:text-white"
            }`}
          >
            {number}
          </button>
        </React.Fragment>
      ))}

      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() =>
          onChange(page + 1)
        }
        className="rounded-lg border border-white/10 bg-white/[0.035] px-3 py-2 text-xs font-bold text-slate-300 transition hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-30"
      >
        Next
      </button>
    </div>
  );
};

// ============================================================
// EXPORT
// ============================================================

export default QuestionsAdmin;