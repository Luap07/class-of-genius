import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import katex from "katex";
import "katex/dist/katex.min.css";

import { supabase } from "../../../lib/supabaseClient";

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
  Image as ImageIcon,
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

/* ============================================================
   CONFIG
============================================================ */

const QUESTIONS_PER_PAGE = 40;

/* ============================================================
   HTML DECODE
============================================================ */

const decodeHtml = (value = "") => {
  if (value === null || value === undefined) {
    return "";
  }

  let result = String(value);

  if (typeof document === "undefined") {
    return result;
  }

  for (let i = 0; i < 3; i += 1) {
    const textarea = document.createElement("textarea");

    textarea.innerHTML = result;

    const decoded = textarea.value;

    if (decoded === result) {
      break;
    }

    result = decoded;
  }

  return result;
};

/* ============================================================
   ESCAPE HTML
============================================================ */

const escapeHtml = (value = "") => {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

/* ============================================================
   NORMALIZE OPTIONS
============================================================ */

const normalizeOptions = (itemOrOptions) => {
  if (
    itemOrOptions === null ||
    itemOrOptions === undefined
  ) {
    return [];
  }

  if (
    typeof itemOrOptions === "object" &&
    !Array.isArray(itemOrOptions)
  ) {
    const item = itemOrOptions;

    if (
      item.options !== null &&
      item.options !== undefined
    ) {
      const normalized = normalizeOptions(
        item.options
      );

      if (normalized.length > 0) {
        return normalized;
      }
    }

    const separateOptions = [
      item.optionA,
      item.optionB,
      item.optionC,
      item.optionD,
    ];

    const hasSeparateOptions =
      separateOptions.some(
        (option) =>
          option !== null &&
          option !== undefined &&
          String(option).trim() !== ""
      );

    if (hasSeparateOptions) {
      return separateOptions.map(
        (option) =>
          option === null ||
          option === undefined
            ? ""
            : String(option)
      );
    }

    const objectKeys = [
      "A",
      "B",
      "C",
      "D",
      "E",
      "F",
      "G",
      "H",
    ];

    const objectOptions =
      objectKeys
        .filter((key) =>
          Object.prototype.hasOwnProperty.call(
            item,
            key
          )
        )
        .map((key) => item[key]);

    if (objectOptions.length > 0) {
      return objectOptions.map(
        (option) =>
          option === null ||
          option === undefined
            ? ""
            : String(option)
      );
    }

    return [];
  }

  if (Array.isArray(itemOrOptions)) {
    return itemOrOptions.map(
      (option) => {
        if (
          option === null ||
          option === undefined
        ) {
          return "";
        }

        if (
          typeof option === "object"
        ) {
          if (
            option.text !== undefined
          ) {
            return String(
              option.text
            );
          }

          if (
            option.value !== undefined
          ) {
            return String(
              option.value
            );
          }

          return JSON.stringify(
            option
          );
        }

        return String(option);
      }
    );
  }

  if (
    typeof itemOrOptions === "string"
  ) {
    const value =
      itemOrOptions.trim();

    if (!value) {
      return [];
    }

    if (
      value.startsWith("[") ||
      value.startsWith("{")
    ) {
      try {
        const parsed =
          JSON.parse(value);

        return normalizeOptions(
          parsed
        );
      } catch {
        // Continue.
      }
    }

    if (
      value.includes("\n")
    ) {
      return value
        .split("\n")
        .map((option) =>
          option.trim()
        )
        .filter(Boolean);
    }

    return [value];
  }

  return [];
};

/* ============================================================
   NORMALIZE QUESTION
============================================================ */

const normalizeQuestionRecord = (
  item
) => {
  if (!item) {
    return item;
  }

  return {
    ...item,
    options:
      normalizeOptions(item),

    question_type:
      item.question_type ||
      "objective",

    passage_id:
      item.passage_id ||
      null,

    passage_title:
      item.passage_title ||
      "",

    passage:
      item.passage ||
      "",

    passage_order:
      Number(
        item.passage_order || 0
      ),
  };
};

/* ============================================================
   QUESTION TYPE
============================================================ */

const isComprehensionQuestion = (
  question
) => {
  return (
    String(
      question?.question_type ||
        ""
    ).toLowerCase() ===
      "comprehension" ||
    Boolean(question?.passage_id)
  );
};

/* ============================================================
   CLEAN MARKDOWN / LATEX
============================================================ */

const cleanLatexMarkdown = (
  value = ""
) => {
  if (!value) {
    return "";
  }

  let content =
    decodeHtml(value);

  content = content.replace(
    /\*\*/g,
    ""
  );

  content = content.replace(
    /__/g,
    ""
  );

  const dollarCount =
    (content.match(/\$/g) || [])
      .length;

  if (dollarCount === 1) {
    content =
      content.replace(
        /^\$/,
        ""
      );

    content =
      content.replace(
        /\$$/,
        ""
      );
  }

  return content;
};

/* ============================================================
   HTML DETECTION
============================================================ */

const hasHtml = (
  value = ""
) => {
  return /<\/?[a-z][\s\S]*>/i.test(
    value
  );
};

/* ============================================================
   CARET POWER CONVERSION
============================================================ */

const convertCaretPowers = (
  value = ""
) => {
  if (!value) {
    return "";
  }

  let content =
    String(value);

  const protectedTags = [];

  content =
    content.replace(
      /<(sup|sub)\b[^>]*>[\s\S]*?<\/\1>/gi,
      (match) => {
        const token =
          `___MATH_TAG_${protectedTags.length}___`;

        protectedTags.push(
          match
        );

        return token;
      }
    );

  content =
    content.replace(
      /([A-Za-z0-9)\]])\^(\d+|[A-Za-z]+|\([^)]*\))/g,
      (_, base, exponent) => {
        let cleanExponent =
          exponent;

        if (
          cleanExponent.startsWith(
            "("
          ) &&
          cleanExponent.endsWith(
            ")"
          )
        ) {
          cleanExponent =
            cleanExponent.slice(
              1,
              -1
            );
        }

        return `${base}<sup>${cleanExponent}</sup>`;
      }
    );

  protectedTags.forEach(
    (tag, index) => {
      content =
        content.replace(
          `___MATH_TAG_${index}___`,
          tag
        );
    }
  );

  return content;
};

/* ============================================================
   LATEX DETECTION
============================================================ */

const containsLatex = (
  value = ""
) => {
  if (!value) {
    return false;
  }

  return (
    /\$[^$]+\$/.test(value) ||
    /\\frac\s*\{/.test(value) ||
    /\\text\s*\{/.test(value) ||
    /\\sqrt\s*\{/.test(value) ||
    /\\(?:circ|degree)\b/.test(value) ||
    /\\(?:times|div|cdot|pm|mp)\b/.test(
      value
    ) ||
    /\\(?:pi|theta|alpha|beta|gamma|delta|lambda|sigma|omega)\b/.test(
      value
    ) ||
    /\\(?:leq|geq|neq|approx)\b/.test(
      value
    ) ||
    /\^[A-Za-z0-9{(]/.test(
      value
    ) ||
    /_[A-Za-z0-9{(]/.test(
      value
    )
  );
};

/* ============================================================
   NORMALIZE LATEX
============================================================ */

const normalizeLatexSource = (
  value = ""
) => {
  let content =
    cleanLatexMarkdown(
      value
    );

  content =
    content.replace(
      /\$\s*([^$]+)\s*$/g,
      "$1"
    );

  if (
    content.endsWith("$") &&
    !content
      .slice(0, -1)
      .includes("$")
  ) {
    content =
      content.slice(
        0,
        -1
      );
  }

  return content;
};

/* ============================================================
   KATEX
============================================================ */

const renderKatex = (
  expression,
  displayMode = false
) => {
  if (!expression) {
    return "";
  }

  let source =
    String(expression).trim();

  source =
    normalizeLatexSource(
      source
    );

  if (
    source.startsWith("$") &&
    source.endsWith("$")
  ) {
    source =
      source.slice(
        1,
        -1
      );
  }

  source =
    source.trim();

  if (!source) {
    return "";
  }

  try {
    return katex.renderToString(
      source,
      {
        throwOnError: false,
        displayMode,
        strict: false,
        trust: false,
      }
    );
  } catch (error) {
    console.warn(
      "KaTeX error:",
      error
    );

    return escapeHtml(
      source
    );
  }
};

/* ============================================================
   RICH CONTENT
============================================================ */

const renderRichContentHtml = (
  value = ""
) => {
  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  let content =
    decodeHtml(
      String(value)
    );

  content =
    cleanLatexMarkdown(
      content
    );

  content =
    content
      .replace(
        /&nbsp;/gi,
        " "
      )
      .replace(
        /\u00a0/g,
        " "
      );

  if (hasHtml(content)) {
    return convertCaretPowers(
      content
    );
  }

  const parts = [];

  const regex =
    /\$([^$]+)\$/g;

  let lastIndex = 0;

  let match;

  while (
    (match =
      regex.exec(content)) !==
    null
  ) {
    const before =
      content.slice(
        lastIndex,
        match.index
      );

    if (before) {
      parts.push(
        escapeHtml(
          before
        )
      );
    }

    parts.push(
      renderKatex(
        match[1],
        false
      )
    );

    lastIndex =
      regex.lastIndex;
  }

  const remaining =
    content.slice(
      lastIndex
    );

  if (remaining) {
    if (
      containsLatex(
        remaining
      )
    ) {
      parts.push(
        renderKatex(
          remaining,
          false
        )
      );
    } else {
      parts.push(
        escapeHtml(
          remaining
        )
      );
    }
  }

  if (
    parts.length === 0 &&
    containsLatex(content)
  ) {
    return renderKatex(
      content
    );
  }

  return parts.join("");
};

/* ============================================================
   RICH CONTENT COMPONENT
============================================================ */

const RichContent = memo(
  ({ content }) => {
    if (
      content === null ||
      content === undefined ||
      content === ""
    ) {
      return (
        <span className="text-slate-600">
          —
        </span>
      );
    }

    const html =
      renderRichContentHtml(
        content
      );

    return (
      <span
        className="
          rich-content
          [&_.katex]:align-middle
          [&_.katex-display]:my-2
          [&_sup]:align-super
          [&_sup]:text-[0.7em]
          [&_sub]:align-sub
          [&_sub]:text-[0.7em]
          [&_br]:leading-none
        "
        dangerouslySetInnerHTML={{
          __html: html,
        }}
      />
    );
  }
);

/* ============================================================
   CLEAN CONTENT
============================================================ */

const cleanRichContent = (
  value = ""
) => {
  if (!value) {
    return "";
  }

  let content =
    decodeHtml(
      String(value)
    );

  content =
    content
      .replace(
        /&nbsp;/gi,
        " "
      )
      .replace(
        /\u00a0/g,
        " "
      );

  content =
    content.replace(
      /<span[^>]*class=["'][^"']*math-fraction[^"']*["'][^>]*>\s*<span[^>]*>(.*?)<\/span>\s*<span[^>]*>(.*?)<\/span>\s*<\/span>/gis,
      "$1/$2"
    );

  content =
    content.replace(
      /<span[^>]*style=["'][^"']*flex-direction\s*:\s*column[^"']*["'][^>]*>\s*<span[^>]*>(.*?)<\/span>\s*<span[^>]*>.*?<\/span>\s*<\/span>/gis,
      "$1"
    );

  return content.trim();
};

/* ============================================================
   TEXT EXTRACTION
============================================================ */

const getTextFromContent = (
  value = ""
) => {
  if (!value) {
    return "";
  }

  let text =
    decodeHtml(
      String(value)
    );

  if (
    hasHtml(text) &&
    typeof document !==
      "undefined"
  ) {
    const div =
      document.createElement(
        "div"
      );

    div.innerHTML =
      text;

    text =
      div.textContent ||
      div.innerText ||
      "";
  }

  text =
    text.replace(
      /\\text\s*\{\s*([^{}]*)\s*\}/gi,
      "$1"
    );

  text =
    text.replace(
      /\\frac\s*\{\s*([^{}]*)\s*\}\s*\{\s*([^{}]*)\s*\}/gi,
      "$1/$2"
    );

  text =
    text.replace(
      /\\sqrt\s*\{\s*([^{}]*)\s*\}/gi,
      "$1"
    );

  text =
    text.replace(
      /\\[A-Za-z]+/g,
      " "
    );

  text =
    text.replace(
      /[${}]/g,
      " "
    );

  return text
    .replace(
      /\s+/g,
      " "
    )
    .trim();
};

const getEditorValue = (
  value = ""
) => {
  if (!value) {
    return "";
  }

  return cleanRichContent(
    value
  );
};

/* ============================================================
   CREATE PASSAGE ID
============================================================ */

const createPassageId = () => {
  if (
    typeof crypto !==
      "undefined" &&
    crypto.randomUUID
  ) {
    return `COMP-${crypto
      .randomUUID()
      .replace(/-/g, "")
      .slice(0, 12)
      .toUpperCase()}`;
  }

  return `COMP-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)
    .toUpperCase()}`;
};

/* ============================================================
   MAIN COMPONENT
============================================================ */

const QuestionsAdmin = () => {
  const [
    questions,
    setQuestions,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    page,
    setPage,
  ] = useState(1);

  const [
    activeView,
    setActiveView,
  ] = useState("all");

  const [
    editingQuestion,
    setEditingQuestion,
  ] = useState(null);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    deleting,
    setDeleting,
  ] = useState(null);

  const [
    activating,
    setActivating,
  ] = useState(null);

  /* ==========================================================
     FETCH
  ========================================================== */

  const fetchQuestions =
    useCallback(
      async () => {
        try {
          setLoading(true);

          const batchSize =
            1000;

          let allQuestions =
            [];

          let from = 0;

          while (true) {
            const {
              data,
              error,
            } =
              await supabase
                .from(
                  "cbt_questions"
                )
                .select("*")
                .order(
                  "created_at",
                  {
                    ascending:
                      false,
                  }
                )
                .range(
                  from,
                  from +
                    batchSize -
                    1
                );

            if (error) {
              throw error;
            }

            const batch =
              data || [];

            allQuestions.push(
              ...batch.map(
                normalizeQuestionRecord
              )
            );

            if (
              batch.length <
              batchSize
            ) {
              break;
            }

            from +=
              batchSize;
          }

          setQuestions(
            allQuestions
          );
        } catch (error) {
          console.error(
            "Fetch Questions Error:",
            error
          );

          alert(
            error?.message ||
              "Failed to load questions."
          );
        } finally {
          setLoading(false);
        }
      },
      []
    );

  useEffect(() => {
    fetchQuestions();
  }, [
    fetchQuestions,
  ]);

  /* ==========================================================
     COUNTS
  ========================================================== */

  const comprehensionQuestions =
    useMemo(
      () =>
        questions.filter(
          isComprehensionQuestion
        ),
      [questions]
    );

  const objectiveQuestions =
    useMemo(
      () =>
        questions.filter(
          (item) =>
            !isComprehensionQuestion(
              item
            )
        ),
      [questions]
    );

  const passageGroups =
    useMemo(() => {
      const map =
        new Map();

      comprehensionQuestions.forEach(
        (item) => {
          const key =
            item.passage_id ||
            `legacy-${item.id}`;

          if (!map.has(key)) {
            map.set(key, {
              passage_id:
                key,
              passage_title:
                item.passage_title ||
                "Untitled Passage",
              passage:
                item.passage ||
                "",
              exam:
                item.exam ||
                "",
              subject:
                item.subject ||
                "",
              questions: [],
            });
          }

          map
            .get(key)
            .questions.push(
              item
            );
        }
      );

      return Array.from(
        map.values()
      ).map((group) => ({
        ...group,
        questions:
          group.questions.sort(
            (a, b) =>
              Number(
                a.passage_order ||
                  0
              ) -
              Number(
                b.passage_order ||
                  0
              )
          ),
      }));
    }, [
      comprehensionQuestions,
    ]);

  /* ==========================================================
     FILTER
  ========================================================== */

  const filteredQuestions =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      let source =
        questions;

      if (
        activeView ===
        "objective"
      ) {
        source =
          objectiveQuestions;
      }

      if (
        activeView ===
        "comprehension"
      ) {
        source =
          comprehensionQuestions;
      }

      if (!query) {
        return source;
      }

      return source.filter(
        (item) => {
          const options =
            normalizeOptions(
              item
            ).join(" ");

          const searchable = [
            item.exam || "",
            item.subject || "",
            item.question || "",
            item.passage_title ||
              "",
            item.passage || "",
            options,
            item.answer || "",
            item.reason || "",
          ]
            .map(
              getTextFromContent
            )
            .join(" ")
            .toLowerCase();

          return searchable.includes(
            query
          );
        }
      );
    }, [
      questions,
      objectiveQuestions,
      comprehensionQuestions,
      search,
      activeView,
    ]);

  useEffect(() => {
    setPage(1);
  }, [
    search,
    activeView,
  ]);

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        filteredQuestions.length /
          QUESTIONS_PER_PAGE
      )
    );

  useEffect(() => {
    if (
      page >
      totalPages
    ) {
      setPage(
        totalPages
      );
    }
  }, [
    page,
    totalPages,
  ]);

  const paginatedQuestions =
    useMemo(() => {
      const start =
        (page - 1) *
        QUESTIONS_PER_PAGE;

      return filteredQuestions.slice(
        start,
        start +
          QUESTIONS_PER_PAGE
      );
    }, [
      filteredQuestions,
      page,
    ]);

  /* ==========================================================
     OPEN EDITOR
  ========================================================== */

  const openEditor =
    useCallback(
      (question) => {
        const options =
          normalizeOptions(
            question
          );

        setEditingQuestion({
          ...question,

          question:
            getEditorValue(
              question.question ||
                ""
            ),

          options:
            options.map(
              (option) =>
                getEditorValue(
                  option
                )
            ),

          reason:
            getEditorValue(
              question.reason ||
                ""
            ),

          passage_title:
            getEditorValue(
              question.passage_title ||
                ""
            ),

          passage:
            getEditorValue(
              question.passage ||
                ""
            ),

          answer:
            String(
              question.answer ||
                ""
            )
              .trim()
              .toUpperCase(),

          question_type:
            isComprehensionQuestion(
              question
            )
              ? "comprehension"
              : "objective",

          passage_id:
            question.passage_id ||
            null,

          passage_order:
            Number(
              question.passage_order ||
                1
            ),
        });
      },
      []
    );

  /* ==========================================================
     NEW COMPREHENSION QUESTION
  ========================================================== */

  const createComprehensionQuestion =
    useCallback(() => {
      const passageId =
        createPassageId();

      setEditingQuestion({
        id: null,

        exam: "WAEC",

        subject:
          "English Language",

        question_type:
          "comprehension",

        passage_id:
          passageId,

        passage_title:
          "",

        passage:
          "",

        passage_order:
          1,

        question:
          "",

        options: [
          "",
          "",
          "",
        ],

        answer:
          "",

        reason:
          "",

        image:
          null,

        active:
          true,
      });
    }, []);

  /* ==========================================================
     NEW OBJECTIVE QUESTION
  ========================================================== */

  const createObjectiveQuestion =
    useCallback(() => {
      setEditingQuestion({
        id: null,

        exam: "WAEC",

        subject:
          "",

        question_type:
          "objective",

        question:
          "",

        options: [
          "",
          "",
          "",
        ],

        answer:
          "",

        reason:
          "",

        image:
          null,

        active:
          true,
      });
    }, []);

  /* ==========================================================
     CLOSE
  ========================================================== */

  const closeEditor =
    useCallback(() => {
      if (saving) {
        return;
      }

      setEditingQuestion(
        null
      );
    }, [saving]);

  /* ==========================================================
     FIELD
  ========================================================== */

  const updateField =
    useCallback(
      (
        field,
        value
      ) => {
        setEditingQuestion(
          (previous) => {
            if (!previous) {
              return previous;
            }

            return {
              ...previous,
              [field]:
                value,
            };
          }
        );
      },
      []
    );

  /* ==========================================================
     OPTION
  ========================================================== */

  const updateOption =
    useCallback(
      (
        index,
        value
      ) => {
        setEditingQuestion(
          (previous) => {
            if (!previous) {
              return previous;
            }

            const options =
              normalizeOptions(
                previous
              );

            options[index] =
              value;

            return {
              ...previous,
              options,
            };
          }
        );
      },
      []
    );

  /* ==========================================================
     ADD OPTION
  ========================================================== */

  const addOption =
    useCallback(() => {
      setEditingQuestion(
        (previous) => {
          if (!previous) {
            return previous;
          }

          return {
            ...previous,

            options: [
              ...normalizeOptions(
                previous
              ),
              "",
            ],
          };
        }
      );
    }, []);

  /* ==========================================================
     REMOVE OPTION
  ========================================================== */

  const removeOption =
    useCallback(
      (index) => {
        setEditingQuestion(
          (previous) => {
            if (!previous) {
              return previous;
            }

            const options =
              normalizeOptions(
                previous
              );

            options.splice(
              index,
              1
            );

            let answer =
              previous.answer ||
              "";

            const removedLetter =
              String.fromCharCode(
                65 + index
              );

            if (
              answer ===
              removedLetter
            ) {
              answer = "";
            }

            const answerIndex =
              answer
                ? answer.charCodeAt(
                    0
                  ) - 65
                : -1;

            if (
              answerIndex >
              index
            ) {
              answer =
                String.fromCharCode(
                  answer.charCodeAt(
                    0
                  ) - 1
                );
            }

            return {
              ...previous,
              options,
              answer,
            };
          }
        );
      },
      []
    );

  /* ==========================================================
     DELETE
  ========================================================== */

  const deleteQuestion =
    useCallback(
      async (id) => {
        if (!id) {
          return;
        }

        const confirmed =
          window.confirm(
            "Delete this question permanently?"
          );

        if (!confirmed) {
          return;
        }

        try {
          setDeleting(id);

          const {
            error,
          } =
            await supabase
              .from(
                "cbt_questions"
              )
              .delete()
              .eq(
                "id",
                id
              );

          if (error) {
            throw error;
          }

          setQuestions(
            (previous) =>
              previous.filter(
                (question) =>
                  question.id !==
                  id
              )
          );

          if (
            editingQuestion?.id ===
            id
          ) {
            setEditingQuestion(
              null
            );
          }
        } catch (error) {
          console.error(
            "Delete Question Error:",
            error
          );

          alert(
            error?.message ||
              "Failed to delete question."
          );
        } finally {
          setDeleting(
            null
          );
        }
      },
      [
        editingQuestion,
      ]
    );

  /* ==========================================================
     TOGGLE ACTIVE
  ========================================================== */

  const toggleActive =
    useCallback(
      async (question) => {
        if (!question?.id) {
          return;
        }

        try {
          setActivating(
            question.id
          );

          const newStatus =
            question.active ===
            false;

          const {
            data,
            error,
          } =
            await supabase
              .from(
                "cbt_questions"
              )
              .update({
                active:
                  newStatus,
              })
              .eq(
                "id",
                question.id
              )
              .select()
              .single();

          if (error) {
            throw error;
          }

          const normalizedData =
            normalizeQuestionRecord(
              data
            );

          setQuestions(
            (previous) =>
              previous.map(
                (item) =>
                  item.id ===
                  question.id
                    ? normalizedData
                    : item
              )
          );

          setEditingQuestion(
            (previous) =>
              previous?.id ===
              question.id
                ? {
                    ...previous,
                    ...normalizedData,
                  }
                : previous
          );
        } catch (error) {
          console.error(
            "Toggle Active Error:",
            error
          );

          alert(
            error?.message ||
              "Unable to change question status."
          );
        } finally {
          setActivating(
            null
          );
        }
      },
      []
    );

  /* ==========================================================
     SAVE
  ========================================================== */

  const saveQuestion =
    useCallback(
      async () => {
        if (!editingQuestion) {
          return;
        }

        try {
          setSaving(true);

          const isComp =
            editingQuestion.question_type ===
              "comprehension" ||
            Boolean(
              editingQuestion.passage_id
            );

          const cleanedQuestion =
            cleanRichContent(
              editingQuestion.question ||
                ""
            );

          const currentOptions =
            normalizeOptions(
              editingQuestion
            );

          const cleanedOptions =
            currentOptions.map(
              (option) =>
                cleanRichContent(
                  option || ""
                )
            );

          const cleanedReason =
            cleanRichContent(
              editingQuestion.reason ||
                ""
            );

          const questionText =
            getTextFromContent(
              cleanedQuestion
            ).trim();

          if (!questionText) {
            alert(
              "Please enter the question."
            );

            return;
          }

          if (
            cleanedOptions.length <
            2
          ) {
            alert(
              "Please provide at least two answer options."
            );

            return;
          }

          const hasEmptyOption =
            cleanedOptions.some(
              (option) =>
                !getTextFromContent(
                  option
                ).trim()
            );

          if (
            hasEmptyOption
          ) {
            alert(
              "Please fill all answer options."
            );

            return;
          }

          const answer =
            String(
              editingQuestion.answer ||
                ""
            )
              .trim()
              .toUpperCase();

          if (
            !/^[A-Z]$/.test(
              answer
            )
          ) {
            alert(
              "Please select a valid correct answer."
            );

            return;
          }

          const answerIndex =
            answer.charCodeAt(
              0
            ) - 65;

          if (
            answerIndex < 0 ||
            answerIndex >=
              cleanedOptions.length
          ) {
            alert(
              "The correct answer does not match an available option."
            );

            return;
          }

          let passageId =
            editingQuestion.passage_id ||
            null;

          if (isComp && !passageId) {
            passageId =
              createPassageId();
          }

          if (isComp) {
            const passageText =
              getTextFromContent(
                editingQuestion.passage ||
                  ""
              ).trim();

            if (!passageText) {
              alert(
                "Please enter the comprehension passage."
              );

              return;
            }
          }

          const payload = {
            exam: String(
              editingQuestion.exam ||
                ""
            ).trim(),

            subject: String(
              editingQuestion.subject ||
                ""
            ).trim(),

            question:
              cleanedQuestion,

            options:
              cleanedOptions,

            answer,

            reason:
              cleanedReason,

            image:
              editingQuestion.image ||
              null,

            question_type:
              isComp
                ? "comprehension"
                : "objective",

            active:
              editingQuestion.active !==
              false,
          };

          if (isComp) {
            payload.passage_id =
              passageId;

            payload.passage_title =
              cleanRichContent(
                editingQuestion.passage_title ||
                  ""
              );

            payload.passage =
              cleanRichContent(
                editingQuestion.passage ||
                  ""
              );

            payload.passage_order =
              Number(
                editingQuestion.passage_order ||
                  1
              );
          } else {
            payload.passage_id =
              null;

            payload.passage_title =
              null;

            payload.passage =
              null;

            payload.passage_order =
              0;
          }

          /*
           * Keep optionA-D synchronized
           * when those columns exist.
           */

          if (
            Object.prototype.hasOwnProperty.call(
              editingQuestion,
              "optionA"
            ) ||
            Object.prototype.hasOwnProperty.call(
              editingQuestion,
              "optionB"
            ) ||
            Object.prototype.hasOwnProperty.call(
              editingQuestion,
              "optionC"
            ) ||
            Object.prototype.hasOwnProperty.call(
              editingQuestion,
              "optionD"
            )
          ) {
            payload.optionA =
              cleanedOptions[0] ||
              "";

            payload.optionB =
              cleanedOptions[1] ||
              "";

            payload.optionC =
              cleanedOptions[2] ||
              "";

            payload.optionD =
              cleanedOptions[3] ||
              "";
          }

          let response;

          if (editingQuestion.id) {
            response =
              await supabase
                .from(
                  "cbt_questions"
                )
                .update(
                  payload
                )
                .eq(
                  "id",
                  editingQuestion.id
                )
                .select()
                .single();
          } else {
            response =
              await supabase
                .from(
                  "cbt_questions"
                )
                .insert(
                  payload
                )
                .select()
                .single();
          }

          if (response.error) {
            throw response.error;
          }

          const normalizedData =
            normalizeQuestionRecord(
              response.data
            );

          if (editingQuestion.id) {
            setQuestions(
              (previous) =>
                previous.map(
                  (item) =>
                    item.id ===
                    editingQuestion.id
                      ? normalizedData
                      : item
                )
            );
          } else {
            setQuestions(
              (previous) => [
                normalizedData,
                ...previous,
              ]
            );
          }

          setEditingQuestion(
            null
          );
        } catch (error) {
          console.error(
            "Save Question Error:",
            error
          );

          alert(
            error?.message ||
              "Failed to save question."
          );
        } finally {
          setSaving(false);
        }
      },
      [editingQuestion]
    );

  /* ==========================================================
     DUPLICATE COMPREHENSION QUESTION
  ========================================================== */

  const duplicateQuestion =
    useCallback(
      (question) => {
        const options =
          normalizeOptions(
            question
          );

        setEditingQuestion({
          ...question,

          id: null,

          question:
            getEditorValue(
              question.question ||
                ""
            ),

          options:
            options.map(
              (option) =>
                getEditorValue(
                  option
                )
            ),

          reason:
            getEditorValue(
              question.reason ||
                ""
            ),

          passage_title:
            getEditorValue(
              question.passage_title ||
                ""
            ),

          passage:
            getEditorValue(
              question.passage ||
                ""
            ),

          answer:
            String(
              question.answer ||
                ""
            )
              .trim()
              .toUpperCase(),

          passage_id:
            isComprehensionQuestion(
              question
            )
              ? question.passage_id
              : null,
        });
      },
      []
    );

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <div className="min-h-screen bg-slate-950 p-5 text-white sm:p-8">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}

        <div className="mb-8 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">

          <div>
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10">
                <Sigma
                  size={18}
                  className="text-blue-400"
                />
              </div>

              <span className="text-xs font-black uppercase tracking-[0.2em] text-blue-400">
                CBT Question Bank
              </span>
            </div>

            <h1 className="text-3xl font-black tracking-tight">
              Manage Questions
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Manage objective questions
              and comprehension sets from
              one question bank.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">

            <button
              type="button"
              onClick={
                createObjectiveQuestion
              }
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-xs font-black text-slate-300 hover:bg-white/[0.07]"
            >
              <Plus
                size={16}
              />
              Objective Question
            </button>

            <button
              type="button"
              onClick={
                createComprehensionQuestion
              }
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-500 px-4 py-3 text-xs font-black text-white hover:bg-blue-400"
            >
              <BookOpen
                size={16}
              />
              Comprehension
            </button>

          </div>

        </div>

        {/* SEARCH */}

        <div className="mb-5 flex flex-col gap-3 lg:flex-row">

          <div className="relative flex-1">

            <Search
              size={18}
              className="absolute left-4 top-3.5 text-slate-500"
            />

            <input
              type="text"
              placeholder="Search questions, passages, subjects..."
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              className="w-full rounded-2xl border border-white/10 bg-white/[0.03] py-3 pl-11 pr-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-400/30"
            />

          </div>

          <div className="flex rounded-2xl border border-white/10 bg-white/[0.025] p-1">

            {[
              [
                "all",
                "All",
              ],
              [
                "objective",
                "Objective",
              ],
              [
                "comprehension",
                "Comprehension",
              ],
            ].map(
              ([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() =>
                    setActiveView(
                      value
                    )
                  }
                  className={`rounded-xl px-4 py-2 text-xs font-black ${
                    activeView ===
                    value
                      ? "bg-blue-500 text-white"
                      : "text-slate-500 hover:text-white"
                  }`}
                >
                  {label}
                </button>
              )
            )}

          </div>

        </div>

        {/* STATS */}

        <div className="mb-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

          <StatCard
            label="Total Questions"
            value={
              questions.length
            }
            icon={Sigma}
          />

          <StatCard
            label="Objective"
            value={
              objectiveQuestions.length
            }
            icon={FileText}
          />

          <StatCard
            label="Comprehension"
            value={
              comprehensionQuestions.length
            }
            icon={BookOpen}
          />

          <StatCard
            label="Passage Sets"
            value={
              passageGroups.length
            }
            icon={Layers3}
          />

        </div>

        {/* CONTENT */}

        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="flex items-center gap-3 text-sm text-slate-500">
              <Loader2
                size={18}
                className="animate-spin"
              />
              Loading questions...
            </div>
          </div>
        ) : filteredQuestions.length ===
          0 ? (
          <div className="rounded-[2rem] border border-dashed border-white/10 bg-white/[0.02] p-14 text-center">
            <Sigma
              size={35}
              className="mx-auto text-slate-700"
            />

            <h3 className="mt-4 font-black">
              No Questions Found
            </h3>

            <p className="mt-2 text-sm text-slate-600">
              No questions match your
              current search or filter.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-4 flex items-center justify-between">

              <p className="text-xs font-bold text-slate-500">
                Showing{" "}
                <span className="text-white">
                  {Math.min(
                    (page - 1) *
                      QUESTIONS_PER_PAGE +
                      1,
                    filteredQuestions.length
                  )}
                </span>

                {" – "}

                <span className="text-white">
                  {Math.min(
                    page *
                      QUESTIONS_PER_PAGE,
                    filteredQuestions.length
                  )}
                </span>

                {" of "}

                <span className="text-white">
                  {
                    filteredQuestions.length
                  }
                </span>
              </p>

              <p className="text-xs font-bold text-slate-600">
                Page {page} /{" "}
                {totalPages}
              </p>

            </div>

            <div className="space-y-5">

              {paginatedQuestions.map(
                (
                  item,
                  index
                ) => (
                  <QuestionCard
                    key={
                      item.id
                    }
                    item={
                      item
                    }
                    index={
                      (page - 1) *
                        QUESTIONS_PER_PAGE +
                      index
                    }
                    onEdit={() =>
                      openEditor(
                        item
                      )
                    }
                    onDelete={() =>
                      deleteQuestion(
                        item.id
                      )
                    }
                    onToggleActive={() =>
                      toggleActive(
                        item
                      )
                    }
                    onDuplicate={() =>
                      duplicateQuestion(
                        item
                      )
                    }
                    deleting={
                      deleting ===
                      item.id
                    }
                    activating={
                      activating ===
                      item.id
                    }
                  />
                )
              )}

            </div>

            {totalPages >
              1 && (
              <Pagination
                page={page}
                totalPages={
                  totalPages
                }
                setPage={
                  setPage
                }
              />
            )}
          </>
        )}

      </div>

      {editingQuestion && (
        <EditQuestionModal
          question={
            editingQuestion
          }
          saving={
            saving
          }
          onClose={
            closeEditor
          }
          onSave={
            saveQuestion
          }
          onFieldChange={
            updateField
          }
          onOptionChange={
            updateOption
          }
          onAddOption={
            addOption
          }
          onRemoveOption={
            removeOption
          }
          onToggleActive={() =>
            editingQuestion.id &&
            toggleActive(
              editingQuestion
            )
          }
          activating={
            activating ===
            editingQuestion.id
          }
        />
      )}
    </div>
  );
};

/* ============================================================
   QUESTION CARD
============================================================ */

const QuestionCard = memo(
  ({
    item,
    index,
    onEdit,
    onDelete,
    onToggleActive,
    onDuplicate,
    deleting,
    activating,
  }) => {
    const isActive =
      item.active !== false;

    const options =
      normalizeOptions(
        item
      );

    const isComp =
      isComprehensionQuestion(
        item
      );

    return (
      <div
        className={`rounded-[1.75rem] border p-6 ${
          isActive
            ? "border-white/10 bg-white/[0.025]"
            : "border-red-500/10 bg-red-500/[0.015] opacity-75"
        }`}
      >

        {/* HEADER */}

        <div className="flex flex-col gap-5 lg:flex-row lg:justify-between">

          <div className="min-w-0 flex-1">

            <div className="mb-4 flex flex-wrap items-center gap-2">

              <span className="rounded-full bg-blue-500/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-blue-400">
                {item.exam ||
                  "Exam"}
              </span>

              <span className="rounded-full bg-purple-500/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-purple-400">
                {item.subject ||
                  "Subject"}
              </span>

              {isComp && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-amber-400">
                  <BookOpen
                    size={11}
                  />
                  Comprehension
                </span>
              )}

              <span
                className={`rounded-full px-3 py-1.5 text-[10px] font-black uppercase ${
                  isActive
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "bg-red-500/10 text-red-400"
                }`}
              >
                {isActive
                  ? "Active"
                  : "Inactive"}
              </span>

            </div>

            {/* PASSAGE */}

            {isComp && (
              <div className="mb-6 rounded-2xl border border-amber-400/10 bg-amber-400/[0.025] p-5">

                <div className="mb-3 flex items-center gap-2">

                  <BookOpen
                    size={16}
                    className="text-amber-400"
                  />

                  <span className="text-[10px] font-black uppercase tracking-[0.15em] text-amber-400">
                    Comprehension Passage
                  </span>

                </div>

                <h3 className="mb-3 text-lg font-black text-white">
                  {item.passage_title ||
                    "Untitled Passage"}
                </h3>

                <div className="max-h-56 overflow-y-auto text-sm leading-7 text-slate-400">
                  <RichContent
                    content={
                      item.passage
                    }
                  />
                </div>

              </div>
            )}

            {/* QUESTION */}

            <div className="text-lg font-bold leading-8 text-white">

              <span className="mr-2 text-blue-400">
                {isComp
                  ? `Q${
                      item.passage_order ||
                      index + 1
                    }.`
                  : `${index + 1}.`}
              </span>

              <RichContent
                content={
                  item.question
                }
              />

            </div>

          </div>

          {/* ACTIONS */}

          <div className="flex shrink-0 items-start gap-2">

            <button
              type="button"
              onClick={
                onDuplicate
              }
              title="Duplicate"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-slate-500 hover:text-white"
            >
              <Copy
                size={15}
              />
            </button>

            <button
              type="button"
              onClick={
                onEdit
              }
              className="flex items-center gap-2 rounded-xl border border-blue-400/15 bg-blue-400/10 px-4 py-2.5 text-xs font-black text-blue-400"
            >
              <Edit3
                size={16}
              />
              Edit
            </button>

            <button
              type="button"
              onClick={
                onToggleActive
              }
              disabled={
                activating
              }
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-slate-400"
            >
              {activating ? (
                <Loader2
                  size={16}
                  className="animate-spin"
                />
              ) : isActive ? (
                <EyeOff
                  size={16}
                />
              ) : (
                <Power
                  size={16}
                />
              )}
            </button>

            <button
              type="button"
              onClick={
                onDelete
              }
              disabled={
                deleting
              }
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-red-400/10 bg-red-400/[0.05] text-red-400"
            >
              {deleting ? (
                <Loader2
                  size={16}
                  className="animate-spin"
                />
              ) : (
                <Trash2
                  size={17}
                />
              )}
            </button>

          </div>

        </div>

        {/* OPTIONS */}

        <div className="mt-6 grid gap-3 md:grid-cols-2">

          {options.map(
            (
              option,
              optionIndex
            ) => {
              const letter =
                String.fromCharCode(
                  65 +
                    optionIndex
                );

              const isCorrect =
                String(
                  item.answer ||
                    ""
                )
                  .trim()
                  .toUpperCase() ===
                letter;

              return (
                <div
                  key={
                    optionIndex
                  }
                  className={`rounded-xl border p-4 text-sm ${
                    isCorrect
                      ? "border-emerald-400/20 bg-emerald-400/[0.06] text-emerald-300"
                      : "border-white/5 bg-white/[0.025] text-slate-400"
                  }`}
                >

                  <div className="flex gap-3">

                    <span className="font-black text-slate-500">
                      {letter}.
                    </span>

                    <div className="min-w-0 flex-1">
                      <RichContent
                        content={
                          option
                        }
                      />
                    </div>

                    {isCorrect && (
                      <CheckCircle2
                        size={16}
                        className="shrink-0 text-emerald-400"
                      />
                    )}

                  </div>

                </div>
              );
            }
          )}

        </div>

        {/* ANSWER */}

        <div className="mt-5 flex flex-wrap items-center gap-3 text-sm">

          <span className="font-black text-slate-600">
            Correct Answer:
          </span>

          <span className="rounded-lg bg-emerald-400/10 px-3 py-1.5 font-black text-emerald-400">
            {item.answer ||
              "Not set"}
          </span>

        </div>

        {/* REASON */}

        {item.reason && (
          <div className="mt-5 rounded-xl border border-white/5 bg-white/[0.02] p-4">

            <p className="mb-2 text-[10px] font-black uppercase tracking-wider text-slate-600">
              Explanation
            </p>

            <div className="text-sm leading-7 text-slate-400">
              <RichContent
                content={
                  item.reason
                }
              />
            </div>

          </div>
        )}

        {/* IMAGE */}

        {item.image && (
          <div className="mt-5">
            <img
              src={
                item.image
              }
              alt="Question"
              className="max-h-64 max-w-full rounded-2xl border border-white/10 object-contain"
            />
          </div>
        )}

      </div>
    );
  }
);

/* ============================================================
   EDIT MODAL
============================================================ */

const EditQuestionModal = ({
  question,
  saving,
  onClose,
  onSave,
  onFieldChange,
  onOptionChange,
  onAddOption,
  onRemoveOption,
  onToggleActive,
  activating,
}) => {
  const [
    questionText,
    setQuestionText,
  ] = useState(
    question.question ||
      ""
  );

  const [
    reasonText,
    setReasonText,
  ] = useState(
    question.reason ||
      ""
  );

  const [
    passageText,
    setPassageText,
  ] = useState(
    question.passage ||
      ""
  );

  const [
    passageTitle,
    setPassageTitle,
  ] = useState(
    question.passage_title ||
      ""
  );

  const options =
    normalizeOptions(
      question
    );

  const isComp =
    question.question_type ===
      "comprehension" ||
    Boolean(
      question.passage_id
    );

  useEffect(() => {
    setQuestionText(
      question.question ||
        ""
    );

    setReasonText(
      question.reason ||
        ""
    );

    setPassageText(
      question.passage ||
        ""
    );

    setPassageTitle(
      question.passage_title ||
        ""
    );
  }, [
    question.id,
    question.question,
    question.reason,
    question.passage,
    question.passage_title,
  ]);

  const updateQuestion =
    (value) => {
      setQuestionText(
        value
      );

      onFieldChange(
        "question",
        value
      );
    };

  const updateReason =
    (value) => {
      setReasonText(
        value
      );

      onFieldChange(
        "reason",
        value
      );
    };

  const updatePassage =
    (value) => {
      setPassageText(
        value
      );

      onFieldChange(
        "passage",
        value
      );
    };

  const updatePassageTitle =
    (value) => {
      setPassageTitle(
        value
      );

      onFieldChange(
        "passage_title",
        value
      );
    };

  const insertLatex =
    (value) => {
      updateQuestion(
        `${questionText}${value}`
      );
    };

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-md sm:p-8">

      <div className="my-4 w-full max-w-6xl overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950 shadow-2xl">

        {/* HEADER */}

        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-white/10 bg-slate-950/95 px-5 py-4 backdrop-blur-xl sm:px-7">

          <div>

            <div className="flex items-center gap-2">

              {isComp ? (
                <BookOpen
                  size={16}
                  className="text-amber-400"
                />
              ) : (
                <Sigma
                  size={16}
                  className="text-blue-400"
                />
              )}

              <p
                className={`text-[10px] font-black uppercase tracking-[0.2em] ${
                  isComp
                    ? "text-amber-400"
                    : "text-blue-400"
                }`}
              >
                {isComp
                  ? "Comprehension Editor"
                  : "Question Editor"}
              </p>

            </div>

            <h2 className="mt-1 text-xl font-black">
              {question.id
                ? "Edit CBT Question"
                : "Create CBT Question"}
            </h2>

          </div>

          <button
            type="button"
            onClick={
              onClose
            }
            disabled={
              saving
            }
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-slate-400"
          >
            <X
              size={19}
            />
          </button>

        </div>

        <div className="max-h-[calc(100vh-150px)] overflow-y-auto p-5 sm:p-7">

          {/* TYPE */}

          <div className="mb-7 rounded-2xl border border-white/10 bg-white/[0.025] p-4">

            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

              <div>

                <p className="text-xs font-black uppercase tracking-[0.15em] text-slate-500">
                  Question Type
                </p>

                <p className="mt-1 text-xs text-slate-600">
                  Choose whether this is a
                  normal CBT question or part
                  of a comprehension passage.
                </p>

              </div>

              <div className="flex rounded-xl border border-white/10 bg-black/20 p-1">

                <button
                  type="button"
                  onClick={() =>
                    onFieldChange(
                      "question_type",
                      "objective"
                    )
                  }
                  className={`rounded-lg px-4 py-2 text-xs font-black ${
                    !isComp
                      ? "bg-blue-500 text-white"
                      : "text-slate-500"
                  }`}
                >
                  Objective
                </button>

                <button
                  type="button"
                  onClick={() =>
                    onFieldChange(
                      "question_type",
                      "comprehension"
                    )
                  }
                  className={`rounded-lg px-4 py-2 text-xs font-black ${
                    isComp
                      ? "bg-amber-500 text-slate-950"
                      : "text-slate-500"
                  }`}
                >
                  Comprehension
                </button>

              </div>

            </div>

          </div>

          {/* EXAM / SUBJECT */}

          <div className="grid gap-4 md:grid-cols-2">

            <Field
              label="Exam"
              value={
                question.exam ||
                ""
              }
              onChange={(
                value
              ) =>
                onFieldChange(
                  "exam",
                  value
                )
              }
              placeholder="e.g. WAEC"
            />

            <Field
              label="Subject"
              value={
                question.subject ||
                ""
              }
              onChange={(
                value
              ) =>
                onFieldChange(
                  "subject",
                  value
                )
              }
              placeholder="e.g. English Language"
            />

          </div>

          {/* ==================================================
              COMPREHENSION PASSAGE
          ================================================== */}

          {isComp && (
            <div className="mt-7 rounded-[1.75rem] border border-amber-400/10 bg-amber-400/[0.025] p-5 sm:p-6">

              <div className="mb-5 flex items-start gap-3">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-400/10">
                  <BookOpen
                    size={18}
                    className="text-amber-400"
                  />
                </div>

                <div>
                  <p className="text-xs font-black uppercase tracking-[0.15em] text-amber-400">
                    Comprehension Passage
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-600">
                    This passage is shared by
                    every question using the
                    same Passage ID.
                  </p>
                </div>

              </div>

              <Field
                label="Passage Title"
                value={
                  passageTitle
                }
                onChange={
                  updatePassageTitle
                }
                placeholder="e.g. The Value of Education"
              />

              <div className="mt-5">

                <label className="mb-2 block text-xs font-black uppercase tracking-[0.15em] text-slate-500">
                  Passage
                </label>

                <textarea
                  value={
                    passageText
                  }
                  onChange={(
                    event
                  ) =>
                    updatePassage(
                      event.target
                        .value
                    )
                  }
                  rows={12}
                  spellCheck={false}
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.025] p-5 text-[15px] leading-8 text-white outline-none focus:border-amber-400/30"
                  placeholder="Paste or type the complete comprehension passage here..."
                />

                <div className="mt-4 rounded-2xl border border-white/5 bg-black/10 p-5">

                  <p className="mb-3 text-[10px] font-black uppercase tracking-[0.15em] text-amber-400">
                    Passage Preview
                  </p>

                  <div className="max-h-80 overflow-y-auto text-sm leading-8 text-slate-300">
                    <RichContent
                      content={
                        passageText
                      }
                    />
                  </div>

                </div>

              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2">

                <Field
                  label="Passage ID"
                  value={
                    question.passage_id ||
                    ""
                  }
                  onChange={
                    (value) =>
                      onFieldChange(
                        "passage_id",
                        value
                      )
                  }
                  placeholder="Automatically generated"
                />

                <Field
                  label="Question Number"
                  value={
                    question.passage_order ||
                    1
                  }
                  onChange={(
                    value
                  ) =>
                    onFieldChange(
                      "passage_order",
                      Number(
                        value
                      ) || 1
                    )
                  }
                  placeholder="1"
                />

              </div>

            </div>
          )}

          {/* QUESTION */}

          <div className="mt-7">

            <div className="mb-2 flex items-center justify-between">

              <label className="text-xs font-black uppercase tracking-[0.15em] text-slate-500">
                Question
              </label>

              <span className="text-[10px] font-bold text-blue-400">
                LaTeX enabled
              </span>

            </div>

            {/* TOOLBAR */}

            <div className="flex flex-wrap gap-1 rounded-t-2xl border border-white/10 bg-white/[0.03] p-2">

              <ToolbarButton
                icon={Bold}
                title="Bold"
                onClick={() =>
                  insertLatex(
                    "**text**"
                  )
                }
              />

              <ToolbarButton
                icon={Italic}
                title="Italic"
                onClick={() =>
                  insertLatex(
                    "*text*"
                  )
                }
              />

              <ToolbarButton
                icon={
                  Superscript
                }
                title="Power"
                onClick={() =>
                  insertLatex(
                    "$x^2$"
                  )
                }
              />

              <ToolbarButton
                icon={
                  Subscript
                }
                title="Subscript"
                onClick={() =>
                  insertLatex(
                    "$x_2$"
                  )
                }
              />

              <ToolbarDivider />

              <MathButton
                title="Fraction"
                value="$\\frac{5}{2}$"
                display="½"
                onClick={
                  insertLatex
                }
              />

              <MathButton
                title="Square root"
                value="$\\sqrt{x}$"
                display="√"
                onClick={
                  insertLatex
                }
              />

              <MathButton
                title="Degree"
                value="$40^\\circ$"
                display="°"
                onClick={
                  insertLatex
                }
              />

              <MathButton
                title="Pi"
                value="$\\pi$"
                display="π"
                onClick={
                  insertLatex
                }
              />

              <MathButton
                title="Plus or minus"
                value="$\\pm$"
                display="±"
                onClick={
                  insertLatex
                }
              />

              <MathButton
                title="Times"
                value="$\\times$"
                display="×"
                onClick={
                  insertLatex
                }
              />

              <MathButton
                title="Division"
                value="$\\div$"
                display="÷"
                onClick={
                  insertLatex
                }
              />

            </div>

            <textarea
              value={
                questionText
              }
              onChange={(
                event
              ) =>
                updateQuestion(
                  event.target
                    .value
                )
              }
              rows={7}
              spellCheck={false}
              className="w-full rounded-b-2xl border-x border-b border-white/10 bg-white/[0.025] p-5 text-[15px] leading-8 text-white outline-none focus:border-blue-400/30"
              placeholder="Enter the question here..."
            />

            {/* PREVIEW */}

            <div className="mt-4 rounded-2xl border border-blue-400/10 bg-blue-400/[0.03] p-5">

              <div className="mb-3 flex items-center justify-between">

                <span className="text-[10px] font-black uppercase tracking-[0.15em] text-blue-400">
                  Live Preview
                </span>

              </div>

              <div className="text-[15px] leading-8 text-slate-200">

                <RichContent
                  content={
                    questionText
                  }
                />

              </div>

            </div>

          </div>

          {/* OPTIONS */}

          <div className="mt-7">

            <div className="mb-4 flex items-center justify-between">

              <div>
                <p className="text-xs font-black uppercase tracking-[0.15em] text-slate-500">
                  Answer Options
                </p>

                <p className="mt-1 text-xs text-slate-600">
                  Click a letter to set the
                  correct answer.
                </p>
              </div>

              <button
                type="button"
                onClick={
                  onAddOption
                }
                className="inline-flex items-center gap-2 rounded-xl border border-blue-400/15 bg-blue-400/10 px-3.5 py-2 text-xs font-black text-blue-400"
              >
                <Plus
                  size={15}
                />
                Add Option
              </button>

            </div>

            <div className="space-y-3">

              {options.map(
                (
                  option,
                  index
                ) => {
                  const letter =
                    String.fromCharCode(
                      65 +
                        index
                    );

                  const isCorrect =
                    String(
                      question.answer ||
                        ""
                    )
                      .trim()
                      .toUpperCase() ===
                    letter;

                  return (
                    <OptionEditor
                      key={`${question.id || "new"}-${index}`}
                      index={
                        index
                      }
                      letter={
                        letter
                      }
                      value={
                        option
                      }
                      isCorrect={
                        isCorrect
                      }
                      onChange={(
                        value
                      ) =>
                        onOptionChange(
                          index,
                          value
                        )
                      }
                      onRemove={() =>
                        onRemoveOption(
                          index
                        )
                      }
                      onSetCorrect={() =>
                        onFieldChange(
                          "answer",
                          letter
                        )
                      }
                    />
                  );
                }
              )}

            </div>

          </div>

          {/* REASON */}

          <div className="mt-7">

            <label className="mb-2 block text-xs font-black uppercase tracking-[0.15em] text-slate-500">
              Reason / Explanation
            </label>

            <textarea
              value={
                reasonText
              }
              onChange={(
                event
              ) =>
                updateReason(
                  event.target
                    .value
                )
              }
              rows={6}
              spellCheck={false}
              className="w-full rounded-2xl border border-white/10 bg-white/[0.025] p-5 text-sm leading-7 text-white outline-none focus:border-blue-400/30"
              placeholder="Explain why the selected answer is correct..."
            />

            <div className="mt-3 rounded-2xl border border-white/5 bg-white/[0.02] p-4">

              <p className="mb-2 text-[10px] font-black uppercase tracking-wider text-slate-600">
                Explanation Preview
              </p>

              <div className="text-sm leading-7 text-slate-400">

                <RichContent
                  content={
                    reasonText
                  }
                />

              </div>

            </div>

          </div>

          {/* IMAGE */}

          <div className="mt-7">

            <label className="mb-2 block text-xs font-black uppercase tracking-[0.15em] text-slate-500">
              Question Image
            </label>

            <div className="relative">

              <ImageIcon
                size={17}
                className="absolute left-4 top-3.5 text-slate-600"
              />

              <input
                type="text"
                value={
                  question.image ||
                  ""
                }
                onChange={(
                  event
                ) =>
                  onFieldChange(
                    "image",
                    event.target
                      .value
                  )
                }
                placeholder="Image URL (optional)"
                className="w-full rounded-2xl border border-white/10 bg-white/[0.025] py-3 pl-11 pr-4 text-sm text-white outline-none placeholder:text-slate-700 focus:border-blue-400/30"
              />

            </div>

            {question.image && (
              <img
                src={
                  question.image
                }
                alt="Question preview"
                className="mt-4 max-h-64 rounded-2xl border border-white/10 object-contain"
              />
            )}

          </div>

          {/* STATUS */}

          <div className="mt-7 rounded-2xl border border-white/10 bg-white/[0.025] p-5">

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

              <div className="flex items-center gap-3">

                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                    question.active !==
                    false
                      ? "bg-emerald-400/10"
                      : "bg-red-400/10"
                  }`}
                >
                  {question.active !==
                  false ? (
                    <Eye
                      size={19}
                      className="text-emerald-400"
                    />
                  ) : (
                    <EyeOff
                      size={19}
                      className="text-red-400"
                    />
                  )}
                </div>

                <div>

                  <p className="font-black">
                    Question Status
                  </p>

                  <p className="mt-1 text-xs text-slate-600">
                    {question.active !==
                    false
                      ? "Available to students."
                      : "Hidden from students."}
                  </p>

                </div>

              </div>

              {question.id && (
                <button
                  type="button"
                  onClick={
                    onToggleActive
                  }
                  disabled={
                    activating
                  }
                  className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-black ${
                    question.active !==
                    false
                      ? "bg-red-400/10 text-red-400"
                      : "bg-emerald-400/10 text-emerald-400"
                  }`}
                >
                  {activating ? (
                    <Loader2
                      size={15}
                      className="animate-spin"
                    />
                  ) : question.active !==
                    false ? (
                    <>
                      <EyeOff
                        size={15}
                      />
                      Deactivate
                    </>
                  ) : (
                    <>
                      <Power
                        size={15}
                      />
                      Activate
                    </>
                  )}
                </button>
              )}

            </div>

          </div>

        </div>

        {/* FOOTER */}

        <div className="sticky bottom-0 flex flex-col-reverse gap-3 border-t border-white/10 bg-slate-950/95 p-5 backdrop-blur-xl sm:flex-row sm:justify-end sm:px-7">

          <button
            type="button"
            onClick={
              onClose
            }
            disabled={
              saving
            }
            className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-black text-slate-400"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={
              onSave
            }
            disabled={
              saving
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-500 px-6 py-3 text-sm font-black text-white disabled:opacity-60"
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
                <Save
                  size={17}
                />
                {question.id
                  ? "Save Changes"
                  : "Create Question"}
              </>
            )}

          </button>

        </div>

      </div>

    </div>
  );
};

/* ============================================================
   OPTION EDITOR
============================================================ */

const OptionEditor = ({
  index,
  letter,
  value,
  isCorrect,
  onChange,
  onRemove,
  onSetCorrect,
}) => {
  return (
    <div
      className={`rounded-2xl border p-3 ${
        isCorrect
          ? "border-emerald-400/20 bg-emerald-400/[0.04]"
          : "border-white/10 bg-white/[0.02]"
      }`}
    >

      <div className="flex items-start gap-3">

        <button
          type="button"
          onClick={
            onSetCorrect
          }
          title="Set as correct answer"
          className={`mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-black ${
            isCorrect
              ? "bg-emerald-400 text-slate-950"
              : "bg-white/[0.05] text-slate-500"
          }`}
        >
          {isCorrect ? (
            <Check
              size={16}
            />
          ) : (
            letter
          )}
        </button>

        <div className="min-w-0 flex-1">

          <textarea
            value={
              value || ""
            }
            onChange={(
              event
            ) =>
              onChange(
                event.target
                  .value
              )
            }
            rows={3}
            spellCheck={false}
            className="w-full rounded-xl border border-white/5 bg-black/10 p-3 text-sm leading-6 text-white outline-none focus:border-blue-400/20"
            placeholder={`Option ${letter}`}
          />

          <div className="mt-3 rounded-xl border border-white/5 bg-white/[0.02] p-3">

            <p className="mb-2 text-[9px] font-black uppercase tracking-wider text-slate-700">
              Preview
            </p>

            <div className="text-sm text-slate-400">

              <RichContent
                content={
                  value
                }
              />

            </div>

          </div>

        </div>

        <button
          type="button"
          onClick={
            onRemove
          }
          className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-600 hover:bg-red-400/10 hover:text-red-400"
        >
          <X
            size={16}
          />
        </button>

      </div>

    </div>
  );
};

/* ============================================================
   MATH BUTTON
============================================================ */

const MathButton = ({
  title,
  value,
  display,
  onClick,
}) => (
  <button
    type="button"
    title={title}
    onClick={() =>
      onClick(value)
    }
    className="flex h-8 items-center justify-center rounded-lg px-3 text-sm font-black text-slate-400 hover:bg-white/10 hover:text-white"
  >
    {display}
  </button>
);

/* ============================================================
   TOOLBAR BUTTON
============================================================ */

const ToolbarButton = ({
  icon: Icon,
  title,
  onClick,
}) => (
  <button
    type="button"
    title={title}
    onClick={onClick}
    className="flex h-8 items-center justify-center rounded-lg px-2.5 text-slate-400 hover:bg-white/10 hover:text-white"
  >
    <Icon
      size={15}
    />
  </button>
);

/* ============================================================
   TOOLBAR DIVIDER
============================================================ */

const ToolbarDivider =
  () => (
    <div className="mx-1 h-8 w-px bg-white/10" />
  );

/* ============================================================
   FIELD
============================================================ */

const Field = ({
  label,
  value,
  onChange,
  placeholder,
}) => (
  <div>

    <label className="mb-2 block text-xs font-black uppercase tracking-[0.15em] text-slate-500">
      {label}
    </label>

    <input
      type="text"
      value={
        value ?? ""
      }
      onChange={(
        event
      ) =>
        onChange(
          event.target
            .value
        )
      }
      placeholder={
        placeholder
      }
      className="w-full rounded-2xl border border-white/10 bg-white/[0.025] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-700 focus:border-blue-400/30"
    />

  </div>
);

/* ============================================================
   STAT CARD
============================================================ */

const StatCard = ({
  label,
  value,
  icon: Icon,
}) => (
  <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">

    <div className="flex items-center gap-4">

      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-400/10">

        <Icon
          size={19}
          className="text-blue-400"
        />

      </div>

      <div>

        <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-600">
          {label}
        </p>

        <p className="mt-1 text-2xl font-black">
          {value}
        </p>

      </div>

    </div>

  </div>
);

/* ============================================================
   PAGINATION
============================================================ */

const Pagination = ({
  page,
  totalPages,
  setPage,
}) => (
  <div className="mt-8 flex flex-wrap items-center justify-center gap-2">

    <button
      type="button"
      disabled={
        page === 1
      }
      onClick={() =>
        setPage(
          (current) =>
            Math.max(
              1,
              current - 1
            )
        )
      }
      className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-xs font-black text-slate-400 disabled:opacity-30"
    >
      Previous
    </button>

    {Array.from(
      {
        length:
          totalPages,
      },
      (_, index) =>
        index + 1
    )
      .filter(
        (number) =>
          number === 1 ||
          number ===
            totalPages ||
          Math.abs(
            number - page
          ) <= 2
      )
      .map(
        (number) => (
          <button
            key={
              number
            }
            type="button"
            onClick={() =>
              setPage(
                number
              )
            }
            className={`h-10 min-w-10 rounded-xl px-3 text-xs font-black ${
              page ===
              number
                ? "bg-blue-500 text-white"
                : "border border-white/10 bg-white/[0.03] text-slate-500"
            }`}
          >
            {
              number
            }
          </button>
        )
      )}

    <button
      type="button"
      disabled={
        page ===
        totalPages
      }
      onClick={() =>
        setPage(
          (current) =>
            Math.min(
              totalPages,
              current + 1
            )
        )
      }
      className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-xs font-black text-slate-400 disabled:opacity-30"
    >
      Next
    </button>

  </div>
);

export default QuestionsAdmin;