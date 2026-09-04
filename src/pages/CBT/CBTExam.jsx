import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Navigate,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  AlertTriangle,
  ArrowLeft,
  BookOpen,
  Calculator,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  FileText,
  Flag,
  Maximize,
  Minimize,
  RotateCcw,
  Target,
  Trophy,
  X,
  XCircle,
} from "lucide-react";

import {
  motion,
  AnimatePresence,
} from "framer-motion";

/* ============================================================
   CONFIGURATION
============================================================ */

const QUESTIONS_PER_SUBJECT = 40;
const EXAM_DURATION_MINUTES = 120;

/*
 * Set this to true only when you want to
 * completely ignore an old saved exam.
 */
const FORCE_FRESH_EXAM = false;

const API_BASE_URL =
  import.meta.env.VITE_API_URL?.replace(
    /\/$/,
    ""
  ) || "http://localhost:5000";

/* ============================================================
   GENERAL HELPERS
============================================================ */

const normalize = (value) =>
  String(value ?? "")
    .replace(/\u00a0/g, " ")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();

const examsMatch = (a, b) =>
  normalize(a) === normalize(b);

const subjectsMatch = (a, b) =>
  normalize(a) === normalize(b);

const formatSubjectName = (subject) =>
  String(subject ?? "").trim() ||
  "Subject";

const shuffleArray = (items) => {
  const array = [...items];

  for (
    let i = array.length - 1;
    i > 0;
    i--
  ) {
    const j = Math.floor(
      Math.random() * (i + 1)
    );

    [
      array[i],
      array[j],
    ] = [
      array[j],
      array[i],
    ];
  }

  return array;
};

/* ============================================================
   QUESTION HELPERS
============================================================ */

const getQuestionText = (question) => {
  if (!question) {
    return "";
  }

  return (
    question.question ??
    question.question_text ??
    question.text ??
    ""
  );
};

const getQuestionOptions = (question) => {
  if (!question) {
    return [];
  }

  /*
   * First try JSONB options.
   */
  if (question.options) {
    let options =
      question.options;

    if (
      typeof options ===
      "string"
    ) {
      try {
        options =
          JSON.parse(options);
      } catch {
        options = null;
      }
    }

    /*
     * JSON array:
     *
     * [
     *   { key: "A", text: "..." },
     *   ...
     * ]
     */
    if (
      Array.isArray(options)
    ) {
      return options
        .map(
          (
            option,
            index
          ) => {
            if (
              option &&
              typeof option ===
                "object"
            ) {
              return {
                key:
                  option.key ??
                  option.letter ??
                  String.fromCharCode(
                    65 + index
                  ),
                text:
                  option.text ??
                  option.value ??
                  option.option ??
                  "",
              };
            }

            return {
              key:
                String.fromCharCode(
                  65 + index
                ),
              text: String(
                option ?? ""
              ),
            };
          }
        )
        .filter(
          (option) =>
            String(
              option.text ??
                ""
            ).trim() !== ""
        );
    }

    /*
     * JSON object.
     */
    if (
      options &&
      typeof options ===
        "object"
    ) {
      const result = [];
      const seen = new Set();

      const possibleKeys = [
        "A",
        "B",
        "C",
        "D",
        "a",
        "b",
        "c",
        "d",
        "optionA",
        "optionB",
        "optionC",
        "optionD",
      ];

      possibleKeys.forEach(
        (key) => {
          const value =
            options[key];

          if (
            value !==
              undefined &&
            value !== null &&
            String(
              value
            ).trim() !== ""
          ) {
            const normalizedValue =
              normalize(value);

            if (
              !seen.has(
                normalizedValue
              )
            ) {
              seen.add(
                normalizedValue
              );

              result.push({
                key: String.fromCharCode(
                  65 +
                    result.length
                ),
                text: String(
                  value
                ),
              });
            }
          }
        }
      );

      if (result.length) {
        return result;
      }
    }
  }

  /*
   * Neon columns.
   *
   * These are deliberately referenced
   * using normal JS property access.
   */
  return [
    {
      key: "A",
      text: question.optionA,
    },
    {
      key: "B",
      text: question.optionB,
    },
    {
      key: "C",
      text: question.optionC,
    },
    {
      key: "D",
      text: question.optionD,
    },
  ].filter(
    (option) =>
      option.text !==
        undefined &&
      option.text !==
        null &&
      String(
        option.text
      ).trim() !== ""
  );
};

const getCorrectAnswerValue = (
  question
) => {
  if (!question) {
    return "";
  }

  return String(
    question.answer ??
      question.correct_answer ??
      question.correctAnswer ??
      ""
  ).trim();
};

/* ============================================================
   COMPREHENSION HELPERS
============================================================ */

const getComprehensionId = (
  question
) => {
  if (!question) {
    return "";
  }

  return String(
    question.passage_id ??
      question.comprehension_id ??
      question.comprehensionId ??
      ""
  ).trim();
};

const getComprehensionName = (
  question
) => {
  if (!question) {
    return "";
  }

  return String(
    question.passage_title ??
      question.comprehension_title ??
      question.comprehensionTitle ??
      ""
  ).trim();
};

const getPassageValue = (
  question
) => {
  if (!question) {
    return "";
  }

  return String(
    question.passage ??
      question.passage_text ??
      question.comprehension ??
      ""
  ).trim();
};

const isComprehensionQuestion = (
  question
) =>
  Boolean(
    getComprehensionId(
      question
    ) ||
      getComprehensionName(
        question
      ) ||
      getPassageValue(
        question
      )
  );

/* ============================================================
   SELECT QUESTIONS
============================================================ */

const selectQuestionsKeepingComprehensionGroups =
  (
    questions,
    targetCount
  ) => {
    if (
      !Array.isArray(
        questions
      )
    ) {
      return [];
    }

    if (
      questions.length <=
      targetCount
    ) {
      return shuffleArray(
        questions
      );
    }

    const groups = new Map();
    const standalone = [];

    questions.forEach(
      (question) => {
        if (
          isComprehensionQuestion(
            question
          )
        ) {
          const id =
            getComprehensionId(
              question
            );

          const title =
            getComprehensionName(
              question
            );

          const key =
            id ||
            normalize(title) ||
            `passage-${Math.random()}`;

          if (!groups.has(key)) {
            groups.set(
              key,
              []
            );
          }

          groups
            .get(key)
            .push(question);
        } else {
          standalone.push(
            question
          );
        }
      }
    );

    const shuffledGroups =
      shuffleArray(
        Array.from(
          groups.values()
        )
      );

    const shuffledStandalone =
      shuffleArray(
        standalone
      );

    const selected = [];

    /*
     * Keep complete comprehension
     * groups where possible.
     */
    for (const group of shuffledGroups) {
      if (
        selected.length +
          group.length <=
        targetCount
      ) {
        selected.push(
          ...shuffleArray(
            group
          )
        );
      }
    }

    /*
     * Fill remaining spaces.
     */
    for (const question of shuffledStandalone) {
      if (
        selected.length >=
        targetCount
      ) {
        break;
      }

      selected.push(
        question
      );
    }

    /*
     * Final fallback.
     */
    if (
      selected.length <
      targetCount
    ) {
      const selectedIds =
        new Set(
          selected.map(
            (question) =>
              String(
                question.id
              )
          )
        );

      const remaining =
        shuffleArray(
          questions.filter(
            (question) =>
              !selectedIds.has(
                String(
                  question.id
                )
              )
          )
        );

      for (const question of remaining) {
        if (
          selected.length >=
          targetCount
        ) {
          break;
        }

        selected.push(
          question
        );
      }
    }

    return shuffleArray(
      selected.slice(
        0,
        targetCount
      )
    );
  };

/* ============================================================
   MATH RENDERING
============================================================ */

/*
 * This renderer handles mathematics coming from the CBT
 * database, including:
 *
 * <sup>8</sup>
 * <sub>2</sub>
 *
 * <span class="math-fraction">
 *   <span>1</span>
 *   <span>3</span>
 * </span>
 *
 * \<span class="math-fraction">\<span>1\</span>\<span>3\</span>\</span>
 *
 * \frac{1}{3}
 * \sqrt{x}
 * x^2
 * x^{2}
 * x_2
 * x_{2}
 *
 * IMPORTANT:
 *
 * \left(
 *
 * must NOT become:
 *
 * ≤ft(
 *
 * So \left and \right are processed BEFORE
 * \le / \leq / \ge / etc.
 */

/* ============================================================
   SUPERSCRIPT / SUBSCRIPT MAPS
============================================================ */

const SUPER_MAP = {
  "0": "⁰",
  "1": "¹",
  "2": "²",
  "3": "³",
  "4": "⁴",
  "5": "⁵",
  "6": "⁶",
  "7": "⁷",
  "8": "⁸",
  "9": "⁹",
  "+": "⁺",
  "-": "⁻",
  "=": "⁼",
  "(": "⁽",
  ")": "⁾",
  n: "ⁿ",
  i: "ⁱ",
};

const SUB_MAP = {
  "0": "₀",
  "1": "₁",
  "2": "₂",
  "3": "₃",
  "4": "₄",
  "5": "₅",
  "6": "₆",
  "7": "₇",
  "8": "₈",
  "9": "₉",
  "+": "₊",
  "-": "₋",
  "=": "₌",
  "(": "₍",
  ")": "₎",
  a: "ₐ",
  e: "ₑ",
  h: "ₕ",
  i: "ᵢ",
  j: "ⱼ",
  k: "ₖ",
  l: "ₗ",
  m: "ₘ",
  n: "ₙ",
  o: "ₒ",
  p: "ₚ",
  r: "ᵣ",
  s: "ₛ",
  t: "ₜ",
  u: "ᵤ",
  v: "ᵥ",
  x: "ₓ",
};

const toSuperscript = (value) =>
  String(value ?? "")
    .split("")
    .map(
      (char) =>
        SUPER_MAP[char] ?? char
    )
    .join("");

const toSubscript = (value) =>
  String(value ?? "")
    .split("")
    .map(
      (char) =>
        SUB_MAP[char] ?? char
    )
    .join("");

/* ============================================================
   HTML ENTITY CLEANING
============================================================ */

const decodeHtmlEntities = (value) => {
  if (!value) {
    return "";
  }

  return String(value)
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&#039;/gi, "'")
    .replace(/&times;/gi, "×")
    .replace(/&divide;/gi, "÷")
    .replace(/&minus;/gi, "−")
    .replace(/&plusmn;/gi, "±")
    .replace(/&le;/gi, "≤")
    .replace(/&ge;/gi, "≥")
    .replace(/&ne;/gi, "≠");
};

const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const stripHtmlTags = (value) =>
  String(value ?? "")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/gi, " ");

/* ============================================================
   NORMALIZE ESCAPED HTML
============================================================ */

const normalizeMathMarkup = (value) => {
  let text = String(value ?? "");

  /*
   * Convert escaped HTML:
   *
   * \<span>
   *
   * into:
   *
   * <span>
   */

  text = text
    .replace(/\\</g, "<")
    .replace(/\\>/g, ">")
    .replace(/\\"/g, '"')
    .replace(/\\'/g, "'");

  /*
   * Decode HTML entities.
   */
  text = decodeHtmlEntities(text);

  return text;
};

/* ============================================================
   HTML SUP / SUB
============================================================ */

const convertHtmlMathTags = (value) => {
  let text = normalizeMathMarkup(value);

  /*
   * <sup>8</sup>
   * ↓
   * ⁸
   */

  text = text.replace(
    /<sup\b[^>]*>([\s\S]*?)<\/sup>/gi,
    (_, content) => {
      const clean = String(content)
        .replace(/<[^>]*>/g, "")
        .trim();

      return toSuperscript(clean);
    }
  );

  /*
   * <sub>2</sub>
   * ↓
   * ₂
   */

  text = text.replace(
    /<sub\b[^>]*>([\s\S]*?)<\/sub>/gi,
    (_, content) => {
      const clean = String(content)
        .replace(/<[^>]*>/g, "")
        .trim();

      return toSubscript(clean);
    }
  );

  return text;
};

/* ============================================================
   MATH FRACTION EXTRACTION
============================================================ */

/*
 * Converts:
 *
 * <span class="math-fraction">
 *   <span>1</span>
 *   <span>3</span>
 * </span>
 *
 * into:
 *
 * [[MATH_FRACTION:1:3]]
 *
 * We do this BEFORE removing HTML tags.
 */

const convertMathFractionSpans = (value) => {
  let text = normalizeMathMarkup(value);

  /*
   * Remove unnecessary whitespace between tags.
   */
  text = text.replace(
    />\s+</g,
    "><"
  );

  /*
   * Standard:
   *
   * <span class="math-fraction"><span>1</span><span>3</span></span>
   */

  text = text.replace(
    /<span\b[^>]*class\s*=\s*["'][^"']*math-fraction[^"']*["'][^>]*>\s*<span\b[^>]*>([\s\S]*?)<\/span>\s*<span\b[^>]*>([\s\S]*?)<\/span>\s*<\/span>/gi,
    (_, numerator, denominator) => {
      const cleanNumerator =
        stripHtmlTags(
          decodeHtmlEntities(
            numerator
          )
        ).trim();

      const cleanDenominator =
        stripHtmlTags(
          decodeHtmlEntities(
            denominator
          )
        ).trim();

      return `[[MATH_FRACTION:${cleanNumerator}:${cleanDenominator}]]`;
    }
  );

  /*
   * Some generated questions may have the class
   * before other attributes or slightly different spacing.
   */

  text = text.replace(
    /<span\b[^>]*math-fraction[^>]*>\s*<span\b[^>]*>([\s\S]*?)<\/span>\s*<span\b[^>]*>([\s\S]*?)<\/span>\s*<\/span>/gi,
    (_, numerator, denominator) => {
      const cleanNumerator =
        stripHtmlTags(
          decodeHtmlEntities(
            numerator
          )
        ).trim();

      const cleanDenominator =
        stripHtmlTags(
          decodeHtmlEntities(
            denominator
          )
        ).trim();

      return `[[MATH_FRACTION:${cleanNumerator}:${cleanDenominator}]]`;
    }
  );

  return text;
};

/* ============================================================
   BALANCED BRACE READER
============================================================ */

const readBalancedGroup = (
  text,
  startIndex
) => {
  if (
    text[startIndex] !== "{"
  ) {
    return null;
  }

  let depth = 0;

  for (
    let i = startIndex;
    i < text.length;
    i++
  ) {
    if (text[i] === "{") {
      depth++;
    }

    if (text[i] === "}") {
      depth--;

      if (depth === 0) {
        return {
          content: text.slice(
            startIndex + 1,
            i
          ),
          endIndex: i,
        };
      }
    }
  }

  return null;
};

/* ============================================================
   LATEX COMMAND MAP
============================================================ */

const LATEX_SYMBOLS = {
  "\\times": "×",
  "\\cdot": "·",
  "\\div": "÷",
  "\\pm": "±",
  "\\mp": "∓",
  "\\leq": "≤",
  "\\le": "≤",
  "\\geq": "≥",
  "\\ge": "≥",
  "\\neq": "≠",
  "\\approx": "≈",
  "\\equiv": "≡",
  "\\infty": "∞",
  "\\pi": "π",
  "\\alpha": "α",
  "\\beta": "β",
  "\\gamma": "γ",
  "\\delta": "δ",
  "\\theta": "θ",
  "\\lambda": "λ",
  "\\mu": "μ",
  "\\sigma": "σ",
  "\\omega": "ω",
  "\\sum": "∑",
  "\\int": "∫",
  "\\rightarrow": "→",
  "\\to": "→",
  "\\angle": "∠",
  "\\degree": "°",
};

/* ============================================================
   RENDER LATEX
============================================================ */

const renderLatexMath = (rawValue) => {
  /*
   * STEP 1
   *
   * Convert HTML sup/sub.
   */
  let text =
    convertHtmlMathTags(
      rawValue
    );

  /*
   * STEP 2
   *
   * Convert math-fraction spans BEFORE
   * removing remaining HTML.
   */
  text =
    convertMathFractionSpans(
      text
    );

  /*
   * STEP 3
   *
   * Fix common corrupted forms.
   *
   * If old data has:
   *
   * ≤ft(
   *
   * this came from:
   *
   * \left(
   *
   * being incorrectly interpreted as \le.
   *
   * We repair it here too.
   */

  text = text
    .replace(/≤ft/gi, "\\left")
    .replace(/≥ight/gi, "\\right");

  /*
   * STEP 4
   *
   * Remove math delimiters.
   */

  text = text
    .replace(
      /\$\$(.*?)\$\$/gs,
      "$1"
    )
    .replace(
      /\$(.*?)\$/gs,
      "$1"
    )
    .replace(
      /\\\((.*?)\\\)/gs,
      "$1"
    )
    .replace(
      /\\\[(.*?)\\\]/gs,
      "$1"
    );

  /*
   * STEP 5
   *
   * Remove remaining ordinary HTML tags.
   *
   * IMPORTANT:
   *
   * math-fraction has already been
   * converted to an internal marker.
   */
  text = text.replace(
    /<[^>]*>/g,
    ""
  );

  /*
   * STEP 6
   *
   * Process the mathematical content.
   */

  let output = "";
  let i = 0;

  while (
    i < text.length
  ) {
    /* --------------------------------------------------------
       INTERNAL FRACTION
    -------------------------------------------------------- */

    if (
      text.startsWith(
        "[[MATH_FRACTION:",
        i
      )
    ) {
      const end =
        text.indexOf(
          "]]",
          i
        );

      if (end !== -1) {
        const content =
          text.slice(
            i +
              "[[MATH_FRACTION:"
                .length,
            end
          );

        const separator =
          content.indexOf(":");

        if (
          separator !== -1
        ) {
          const numerator =
            content
              .slice(
                0,
                separator
              )
              .trim();

          const denominator =
            content
              .slice(
                separator + 1
              )
              .trim();

          output +=
            `<span class="math-frac">` +
            `<span class="math-num">` +
            renderLatexMath(
              numerator
            ) +
            `</span>` +
            `<span class="math-den">` +
            renderLatexMath(
              denominator
            ) +
            `</span>` +
            `</span>`;

          i =
            end + 2;

          continue;
        }
      }
    }

    /* --------------------------------------------------------
       \left
       
       IMPORTANT:
       Process this BEFORE \le.
       -------------------------------------------------------- */

    if (
      text.startsWith(
        "\\left",
        i
      )
    ) {
      i += 5;
      continue;
    }

    /* --------------------------------------------------------
       \right
       -------------------------------------------------------- */

    if (
      text.startsWith(
        "\\right",
        i
      )
    ) {
      i += 6;
      continue;
    }

    /* --------------------------------------------------------
       \frac{a}{b}
       -------------------------------------------------------- */

    if (
      text.startsWith(
        "\\frac",
        i
      )
    ) {
      let cursor =
        i + 5;

      while (
        cursor <
          text.length &&
        /\s/.test(
          text[cursor]
        )
      ) {
        cursor++;
      }

      const numerator =
        readBalancedGroup(
          text,
          cursor
        );

      if (numerator) {
        cursor =
          numerator.endIndex +
          1;

        while (
          cursor <
            text.length &&
          /\s/.test(
            text[cursor]
          )
        ) {
          cursor++;
        }

        const denominator =
          readBalancedGroup(
            text,
            cursor
          );

        if (denominator) {
          output +=
            `<span class="math-frac">` +
            `<span class="math-num">` +
            renderLatexMath(
              numerator.content
            ) +
            `</span>` +
            `<span class="math-den">` +
            renderLatexMath(
              denominator.content
            ) +
            `</span>` +
            `</span>`;

          i =
            denominator.endIndex +
            1;

          continue;
        }
      }
    }

    /* --------------------------------------------------------
       \sqrt{x}
       -------------------------------------------------------- */

    if (
      text.startsWith(
        "\\sqrt",
        i
      )
    ) {
      let cursor =
        i + 5;

      while (
        cursor <
          text.length &&
        /\s/.test(
          text[cursor]
        )
      ) {
        cursor++;
      }

      const root =
        readBalancedGroup(
          text,
          cursor
        );

      if (root) {
        output +=
          `<span class="math-root">` +
          `<span class="math-root-symbol">√</span>` +
          `<span class="math-root-content">` +
          renderLatexMath(
            root.content
          ) +
          `</span>` +
          `</span>`;

        i =
          root.endIndex +
          1;

        continue;
      }
    }

    /* --------------------------------------------------------
       x^{8}
       -------------------------------------------------------- */

    if (
      text[i] === "^" &&
      text[i + 1] === "{"
    ) {
      const group =
        readBalancedGroup(
          text,
          i + 1
        );

      if (group) {
        output +=
          toSuperscript(
            stripHtmlTags(
              group.content
            )
          );

        i =
          group.endIndex +
          1;

        continue;
      }
    }

    /* --------------------------------------------------------
       x^8
       -------------------------------------------------------- */

    if (
      text[i] === "^"
    ) {
      const next =
        text[i + 1];

      if (
        next &&
        /[A-Za-z0-9+\-=()]/.test(
          next
        )
      ) {
        output +=
          SUPER_MAP[next] ??
          next;

        i += 2;

        continue;
      }
    }

    /* --------------------------------------------------------
       x_{1}
       -------------------------------------------------------- */

    if (
      text[i] === "_" &&
      text[i + 1] === "{"
    ) {
      const group =
        readBalancedGroup(
          text,
          i + 1
        );

      if (group) {
        output +=
          toSubscript(
            stripHtmlTags(
              group.content
            )
          );

        i =
          group.endIndex +
          1;

        continue;
      }
    }

    /* --------------------------------------------------------
       x_1
       -------------------------------------------------------- */

    if (
      text[i] === "_"
    ) {
      const next =
        text[i + 1];

      if (
        next &&
        /[A-Za-z0-9]/.test(
          next
        )
      ) {
        output +=
          SUB_MAP[next] ??
          next;

        i += 2;

        continue;
      }
    }

    /* --------------------------------------------------------
       LATEX SYMBOLS
       
       IMPORTANT:
       \left and \right have already been handled above.
       -------------------------------------------------------- */

    let foundCommand =
      false;

    for (
      const [
        command,
        symbol,
      ] of Object.entries(
        LATEX_SYMBOLS
      )
    ) {
      if (
        text.startsWith(
          command,
          i
        )
      ) {
        output += symbol;

        i +=
          command.length;

        foundCommand =
          true;

        break;
      }
    }

    if (foundCommand) {
      continue;
    }

    /* --------------------------------------------------------
       Remove LaTeX braces.
       -------------------------------------------------------- */

    if (
      text[i] === "{" ||
      text[i] === "}"
    ) {
      i++;
      continue;
    }

    /* --------------------------------------------------------
       Remove remaining escaped HTML markers.
       -------------------------------------------------------- */

    if (
      text.startsWith(
        "\\<",
        i
      )
    ) {
      i += 2;
      continue;
    }

    if (
      text.startsWith(
        "\\>",
        i
      )
    ) {
      i += 2;
      continue;
    }

    /* --------------------------------------------------------
       Normal character.
       -------------------------------------------------------- */

    output += escapeHtml(
      text[i]
    );

    i++;
  }

  return output;
};

/* ============================================================
   MATH TEXT COMPONENT
============================================================ */

const MathText = ({
  children,
  className = "",
}) => {
  const html =
    renderLatexMath(
      children
    );

  return (
    <span
      className={className}
      dangerouslySetInnerHTML={{
        __html: html,
      }}
    />
  );
};

/* ============================================================
   MATH CSS
============================================================ */

const MathStyles = () => (
  <style>{`
    .math-frac {
      display: inline-flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      vertical-align: middle;
      margin: 0 0.2em;
      min-width: 1.2em;
      line-height: 1;
    }

    .math-num {
      display: block;
      padding: 0 0.3em 0.14em;
      border-bottom: 1.5px solid currentColor;
      text-align: center;
      line-height: 1.1;
      white-space: nowrap;
    }

    .math-den {
      display: block;
      padding: 0.14em 0.3em 0;
      text-align: center;
      line-height: 1.1;
      white-space: nowrap;
    }

    .math-root {
      display: inline-flex;
      align-items: flex-start;
      vertical-align: middle;
      margin: 0 0.08em;
    }

    .math-root-symbol {
      font-size: 1.2em;
      line-height: 1;
    }

    .math-root-content {
      border-top: 1.5px solid currentColor;
      padding: 0 0.15em;
      line-height: 1.1;
    }
  `}</style>
);

/* ============================================================
   RESULT CARD
============================================================ */

const ResultCard = ({
  title,
  value,
  icon: Icon,
  description,
}) => (
  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
    <div className="mb-3 flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-400">
        <Icon size={20} />
      </div>

      <span className="text-sm text-slate-400">
        {title}
      </span>
    </div>

    <div className="text-3xl font-black text-white">
      {value}
    </div>

    {description && (
      <p className="mt-1 text-xs text-slate-500">
        {description}
      </p>
    )}
  </div>
);

/* ============================================================
   MAIN COMPONENT
============================================================ */

const CBTExam = () => {
  const navigate =
    useNavigate();

  const location =
    useLocation();

  const params =
    useParams();

  const exam = useMemo(
    () =>
      location.state?.exam ??
      params.exam ??
      "",
    [
      location.state?.exam,
      params.exam,
    ]
  );

  const suppliedSubjects =
    useMemo(() => {
      const subjects =
        location.state?.subjects;

      if (
        !Array.isArray(subjects)
      ) {
        return [];
      }

      return subjects
        .map((subject) =>
          String(
            subject ?? ""
          ).trim()
        )
        .filter(Boolean);
    }, [
      location.state?.subjects,
    ]);

  /* ==========================================================
     STATE
  ========================================================== */

  const [loading, setLoading] =
    useState(true);

  const [
    loadingMessage,
    setLoadingMessage,
  ] = useState(
    "Loading examination..."
  );

  const [
    fetchError,
    setFetchError,
  ] = useState("");

  const [
    questionsBySubject,
    setQuestionsBySubject,
  ] = useState({});

  const [
    selectedSubjects,
    setSelectedSubjects,
  ] = useState([]);

  const [
    activeSubject,
    setActiveSubject,
  ] = useState("");

  const [
    currentIndex,
    setCurrentIndex,
  ] = useState(0);

  const [answers, setAnswers] =
    useState({});

  const [marked, setMarked] =
    useState({});

  const [
    submitted,
    setSubmitted,
  ] = useState(false);

  const [endTime, setEndTime] =
    useState(null);

  const [timeLeft, setTimeLeft] =
    useState(
      EXAM_DURATION_MINUTES *
        60
    );

  /*
   * IMPORTANT:
   *
   * FALSE = navigator CLOSED
   * by default.
   */
  const [
    showNavigator,
    setShowNavigator,
  ] = useState(false);

  const [
    showCalculator,
    setShowCalculator,
  ] = useState(false);

  const [
    calculatorValue,
    setCalculatorValue,
  ] = useState("");

  const [
    isFullscreen,
    setIsFullscreen,
  ] = useState(false);

  /* ==========================================================
     STORAGE KEY
  ========================================================== */

  const storageKey = useMemo(() => {
    const examPart =
      normalize(exam) ||
      "unknown-exam";

    const subjectPart =
      suppliedSubjects.length
        ? suppliedSubjects
            .map(normalize)
            .sort()
            .join("-")
        : "all";

    return `scholiqen-cbt-session-${examPart}-${subjectPart}`;
  }, [
    exam,
    suppliedSubjects,
  ]);

  /* ==========================================================
     LOAD QUESTIONS
  ========================================================== */

  useEffect(() => {
    let mounted = true;

    const loadQuestions =
      async () => {
        try {
          setLoading(true);
          setFetchError("");

          /*
           * RESTORE SESSION
           */
          let savedSession =
            null;

          if (
            !FORCE_FRESH_EXAM
          ) {
            try {
              const saved =
                localStorage.getItem(
                  storageKey
                );

              if (saved) {
                savedSession =
                  JSON.parse(
                    saved
                  );
              }
            } catch (error) {
              console.error(
                "Saved CBT session error:",
                error
              );
            }
          }

          /*
           * RESTORE IF VALID
           */
          if (
            savedSession &&
            savedSession.questionsBySubject &&
            savedSession.endTime
          ) {
            const savedSubjects =
              Array.isArray(
                savedSession.subjects
              )
                ? savedSession.subjects
                : Object.keys(
                    savedSession.questionsBySubject
                  );

            const savedQuestions =
              savedSession.questionsBySubject;

            const savedCount =
              savedSubjects.reduce(
                (
                  total,
                  subject
                ) =>
                  total +
                  (
                    savedQuestions[
                      subject
                    ] || []
                  ).length,
                0
              );

            const savedEnd =
              Number(
                savedSession.endTime
              );

            if (
              savedCount > 0 &&
              savedEnd >
                Date.now()
            ) {
              if (!mounted) {
                return;
              }

              setQuestionsBySubject(
                savedQuestions
              );

              setSelectedSubjects(
                savedSubjects
              );

              setActiveSubject(
                savedSession.activeSubject ||
                  savedSubjects[0] ||
                  ""
              );

              setCurrentIndex(
                Math.max(
                  0,
                  Number(
                    savedSession.currentIndex ??
                      0
                  )
                )
              );

              setAnswers(
                savedSession.answers ||
                  {}
              );

              setMarked(
                savedSession.marked ||
                  {}
              );

              setSubmitted(
                Boolean(
                  savedSession.submitted
                )
              );

              setEndTime(
                savedEnd
              );

              setTimeLeft(
                Math.max(
                  0,
                  Math.floor(
                    (
                      savedEnd -
                      Date.now()
                    ) / 1000
                  )
                )
              );

              setLoadingMessage(
                "Restoring your examination..."
              );

              setLoading(false);

              return;
            }

            try {
              localStorage.removeItem(
                storageKey
              );
            } catch {
              // ignore
            }
          }

          /*
           * CLEAN REQUESTED SUBJECTS.
           */
          const requestedSubjects =
            [];

          suppliedSubjects.forEach(
            (subject) => {
              const clean =
                String(
                  subject ?? ""
                ).trim();

              if (!clean) {
                return;
              }

              const alreadyExists =
                requestedSubjects.some(
                  (existing) =>
                    subjectsMatch(
                      existing,
                      clean
                    )
                );

              if (
                !alreadyExists
              ) {
                requestedSubjects.push(
                  clean
                );
              }
            }
          );

          setLoadingMessage(
            requestedSubjects.length
              ? "Loading your selected subjects..."
              : "Loading examination subjects..."
          );

          /*
           * API REQUEST
           */
          const query =
            new URLSearchParams();

          query.set(
            "exam",
            String(exam).trim()
          );

          if (
            requestedSubjects.length
          ) {
            query.set(
              "subjects",
              requestedSubjects.join(
                ","
              )
            );
          }

          const url =
            `${API_BASE_URL}/api/cbt/questions?${query.toString()}`;

          console.log(
            "======================================"
          );

          console.log(
            "📝 CBT QUESTIONS REQUEST"
          );

          console.log(
            "Exam:",
            exam
          );

          console.log(
            "Subjects:",
            requestedSubjects
          );

          console.log(
            "URL:",
            url
          );

          console.log(
            "======================================"
          );

          const response =
            await fetch(url, {
              method: "GET",
              headers: {
                Accept:
                  "application/json",
              },
              cache: "no-store",
            });

          let data;

          try {
            data =
              await response.json();
          } catch {
            data = null;
          }

          if (!response.ok) {
            throw new Error(
              data?.error ||
                data?.message ||
                `CBT server error (${response.status})`
            );
          }

          const examQuestions =
            Array.isArray(data)
              ? data
              : Array.isArray(
                  data?.questions
                )
              ? data.questions
              : Array.isArray(
                  data?.data
                )
              ? data.data
              : [];

          if (
            !examQuestions.length
          ) {
            throw new Error(
              requestedSubjects.length
                ? `No questions were found for ${exam} under the selected subjects.`
                : `No questions were found for ${exam}.`
            );
          }

          /*
           * DATABASE SUBJECTS
           */
          const databaseSubjects =
            [
              ...new Set(
                examQuestions
                  .map((row) =>
                    String(
                      row.subject ??
                        ""
                    ).trim()
                  )
                  .filter(Boolean)
              ),
            ];

          console.log(
            "DATABASE SUBJECTS:",
            databaseSubjects
          );

          /*
           * USE THE ACTUAL SELECTED
           * SUBJECTS.
           */
          const subjectsToLoad =
            requestedSubjects.length
              ? requestedSubjects
              : databaseSubjects;

          const uniqueSubjects =
            [];

          subjectsToLoad.forEach(
            (subject) => {
              const clean =
                String(
                  subject ?? ""
                ).trim();

              if (!clean) {
                return;
              }

              if (
                !uniqueSubjects.some(
                  (existing) =>
                    subjectsMatch(
                      existing,
                      clean
                    )
                )
              ) {
                uniqueSubjects.push(
                  clean
                );
              }
            }
          );

          /*
           * GROUP QUESTIONS.
           */
          const grouped = {};
          const finalSubjects =
            [];

          uniqueSubjects.forEach(
            (subject) => {
              const matching =
                examQuestions.filter(
                  (row) =>
                    examsMatch(
                      row.exam,
                      exam
                    ) &&
                    subjectsMatch(
                      row.subject,
                      subject
                    )
                );

              console.log(
                `${subject}: ${matching.length} questions`
              );

              if (
                !matching.length
              ) {
                return;
              }

              const selected =
                selectQuestionsKeepingComprehensionGroups(
                  matching,
                  QUESTIONS_PER_SUBJECT
                );

              if (
                selected.length
              ) {
                grouped[
                  subject
                ] = selected;

                finalSubjects.push(
                  subject
                );
              }
            }
          );

          const total =
            finalSubjects.reduce(
              (
                count,
                subject
              ) =>
                count +
                (
                  grouped[
                    subject
                  ] || []
                ).length,
              0
            );

          if (
            !finalSubjects.length ||
            !total
          ) {
            throw new Error(
              "No questions are available for the selected subjects."
            );
          }

          /*
           * NEW EXAM.
           */
          const newEndTime =
            Date.now() +
            EXAM_DURATION_MINUTES *
              60 *
              1000;

          const newSession = {
            exam,
            subjects:
              finalSubjects,
            questionsBySubject:
              grouped,
            activeSubject:
              finalSubjects[0],
            currentIndex: 0,
            answers: {},
            marked: {},
            endTime:
              newEndTime,
            submitted: false,
          };

          try {
            localStorage.setItem(
              storageKey,
              JSON.stringify(
                newSession
              )
            );
          } catch (error) {
            console.error(
              "CBT session storage error:",
              error
            );
          }

          if (!mounted) {
            return;
          }

          setQuestionsBySubject(
            grouped
          );

          setSelectedSubjects(
            finalSubjects
          );

          setActiveSubject(
            finalSubjects[0]
          );

          setCurrentIndex(0);
          setAnswers({});
          setMarked({});
          setSubmitted(false);

          setEndTime(
            newEndTime
          );

          setTimeLeft(
            EXAM_DURATION_MINUTES *
              60
          );
        } catch (error) {
          console.error(
            "❌ CBT LOAD ERROR:",
            error
          );

          if (mounted) {
            setFetchError(
              error?.message ||
                "Unable to load CBT questions."
            );
          }
        } finally {
          if (mounted) {
            setLoading(false);
          }
        }
      };

    loadQuestions();

    return () => {
      mounted = false;
    };
  }, [
    exam,
    storageKey,
    suppliedSubjects,
  ]);

  /* ==========================================================
     SAVE SESSION
  ========================================================== */

  useEffect(() => {
    if (
      loading ||
      !endTime ||
      !storageKey ||
      !Object.keys(
        questionsBySubject
      ).length
    ) {
      return;
    }

    const session = {
      exam,
      subjects:
        selectedSubjects,
      questionsBySubject,
      activeSubject,
      currentIndex,
      answers,
      marked,
      endTime,
      submitted,
    };

    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify(session)
      );
    } catch (error) {
      console.error(
        "CBT save error:",
        error
      );
    }
  }, [
    loading,
    storageKey,
    exam,
    selectedSubjects,
    questionsBySubject,
    activeSubject,
    currentIndex,
    answers,
    marked,
    endTime,
    submitted,
  ]);

  /* ==========================================================
     TIMER
  ========================================================== */

  useEffect(() => {
    if (
      !endTime ||
      submitted
    ) {
      return undefined;
    }

    const updateTimer =
      () => {
        const remaining =
          Math.max(
            0,
            Math.floor(
              (
                endTime -
                Date.now()
              ) / 1000
            )
          );

        setTimeLeft(
          remaining
        );

        if (
          remaining <= 0
        ) {
          setSubmitted(true);
        }
      };

    updateTimer();

    const timer =
      setInterval(
        updateTimer,
        1000
      );

    return () =>
      clearInterval(timer);
  }, [
    endTime,
    submitted,
  ]);

  /* ==========================================================
     TIME DISPLAY
  ========================================================== */

  const formattedTime =
    useMemo(() => {
      const hours =
        Math.floor(
          timeLeft / 3600
        );

      const minutes =
        Math.floor(
          (timeLeft % 3600) /
            60
        );

      const seconds =
        timeLeft % 60;

      return [
        hours,
        minutes,
        seconds,
      ]
        .map((value) =>
          String(
            value
          ).padStart(2, "0")
        )
        .join(":");
    }, [timeLeft]);

  /* ==========================================================
     CURRENT QUESTIONS
  ========================================================== */

  const currentQuestions =
    questionsBySubject[
      activeSubject
    ] || [];

  const currentQuestion =
    currentQuestions[
      currentIndex
    ] || null;

  /* ==========================================================
     TOTAL QUESTIONS
  ========================================================== */

  const totalQuestions =
    useMemo(
      () =>
        selectedSubjects.reduce(
          (
            total,
            subject
          ) =>
            total +
            (
              questionsBySubject[
                subject
              ] || []
            ).length,
          0
        ),
      [
        selectedSubjects,
        questionsBySubject,
      ]
    );

  /* ==========================================================
     GLOBAL QUESTION NUMBER
  ========================================================== */

  const getGlobalQuestionNumber =
    useCallback(
      (
        subject,
        index
      ) => {
        let number = 0;

        for (
          const currentSubject of
            selectedSubjects
        ) {
          if (
            subjectsMatch(
              currentSubject,
              subject
            )
          ) {
            break;
          }

          number +=
            (
              questionsBySubject[
                currentSubject
              ] || []
            ).length;
        }

        return (
          number +
          index +
          1
        );
      },
      [
        selectedSubjects,
        questionsBySubject,
      ]
    );

  /* ==========================================================
     SELECT ANSWER
  ========================================================== */

  const selectAnswer = (
    questionId,
    answer
  ) => {
    if (submitted) {
      return;
    }

    setAnswers(
      (previous) => ({
        ...previous,
        [questionId]:
          answer,
      })
    );
  };

  /* ==========================================================
     MARK QUESTION
  ========================================================== */

  const toggleMark = (
    questionId
  ) => {
    if (submitted) {
      return;
    }

    setMarked(
      (previous) => ({
        ...previous,
        [questionId]:
          !previous[
            questionId
          ],
      })
    );
  };

  /* ==========================================================
     NEXT
  ========================================================== */

  const goNext = () => {
    if (
      currentIndex <
      currentQuestions.length -
        1
    ) {
      setCurrentIndex(
        (value) =>
          value + 1
      );

      return;
    }

    const subjectIndex =
      selectedSubjects.findIndex(
        (subject) =>
          subjectsMatch(
            subject,
            activeSubject
          )
      );

    if (
      subjectIndex <
      selectedSubjects.length -
        1
    ) {
      const nextSubject =
        selectedSubjects[
          subjectIndex + 1
        ];

      setActiveSubject(
        nextSubject
      );

      setCurrentIndex(0);
    }
  };

  /* ==========================================================
     PREVIOUS
  ========================================================== */

  const goPrevious = () => {
    if (
      currentIndex > 0
    ) {
      setCurrentIndex(
        (value) =>
          value - 1
      );

      return;
    }

    const subjectIndex =
      selectedSubjects.findIndex(
        (subject) =>
          subjectsMatch(
            subject,
            activeSubject
          )
      );

    if (
      subjectIndex > 0
    ) {
      const previousSubject =
        selectedSubjects[
          subjectIndex - 1
        ];

      const previousQuestions =
        questionsBySubject[
          previousSubject
        ] || [];

      setActiveSubject(
        previousSubject
      );

      setCurrentIndex(
        Math.max(
          0,
          previousQuestions.length -
            1
        )
      );
    }
  };

  /* ==========================================================
     CHANGE SUBJECT
  ========================================================== */

  const changeSubject = (
    subject
  ) => {
    setActiveSubject(
      subject
    );

    setCurrentIndex(0);
  };

  /* ==========================================================
     CALCULATOR
  ========================================================== */

  const calculateExpression =
    () => {
      const expression =
        calculatorValue.trim();

      if (!expression) {
        return;
      }

      if (
        !/^[0-9+\-*/().%\s]+$/.test(
          expression
        )
      ) {
        setCalculatorValue(
          "Invalid"
        );

        return;
      }

      try {
        const result =
          Function(
            `"use strict"; return (${expression})`
          )();

        setCalculatorValue(
          String(result)
        );
      } catch {
        setCalculatorValue(
          "Error"
        );
      }
    };

  /* ==========================================================
     FULLSCREEN
  ========================================================== */

  const toggleFullscreen =
    async () => {
      try {
        if (
          !document.fullscreenElement
        ) {
          await document.documentElement.requestFullscreen();

          setIsFullscreen(
            true
          );
        } else {
          await document.exitFullscreen();

          setIsFullscreen(
            false
          );
        }
      } catch (error) {
        console.error(
          "Fullscreen error:",
          error
        );
      }
    };

  useEffect(() => {
    const handleFullscreen =
      () => {
        setIsFullscreen(
          Boolean(
            document.fullscreenElement
          )
        );
      };

    document.addEventListener(
      "fullscreenchange",
      handleFullscreen
    );

    return () => {
      document.removeEventListener(
        "fullscreenchange",
        handleFullscreen
      );
    };
  }, []);

  /* ==========================================================
     ANSWER CHECK
  ========================================================== */

  const isAnswerCorrect =
    useCallback(
      (question) => {
        if (!question) {
          return false;
        }

        const questionId =
          String(
            question.id
          );

        const selected =
          answers[
            questionId
          ];

        if (
          selected ===
            undefined ||
          selected ===
            null ||
          String(
            selected
          ).trim() === ""
        ) {
          return false;
        }

        const correct =
          getCorrectAnswerValue(
            question
          );

        const selectedNormalized =
          normalize(
            selected
          );

        const correctNormalized =
          normalize(
            correct
          );

        /*
         * Direct answer comparison.
         */
        if (
          selectedNormalized ===
          correctNormalized
        ) {
          return true;
        }

        /*
         * Compare selected option text.
         */
        const options =
          getQuestionOptions(
            question
          );

        const selectedOption =
          options.find(
            (option) =>
              normalize(
                option.key
              ) ===
              selectedNormalized
          );

        if (
          selectedOption &&
          normalize(
            selectedOption.text
          ) ===
            correctNormalized
        ) {
          return true;
        }

        /*
         * Compare correct option
         * against selected text.
         */
        const correctOption =
          options.find(
            (option) =>
              normalize(
                option.key
              ) ===
              correctNormalized
          );

        if (
          correctOption &&
          normalize(
            correctOption.text
          ) ===
            selectedNormalized
        ) {
          return true;
        }

        return false;
      },
      [answers]
    );

  /* ==========================================================
     ALL QUESTIONS
  ========================================================== */

  const allQuestions =
    useMemo(() => {
      const result = [];

      selectedSubjects.forEach(
        (subject) => {
          const questions =
            questionsBySubject[
              subject
            ] || [];

          questions.forEach(
            (
              question,
              index
            ) => {
              result.push({
                question,
                subject,
                index,
              });
            }
          );
        }
      );

      return result;
    }, [
      selectedSubjects,
      questionsBySubject,
    ]);

  /* ==========================================================
     SCORE
  ========================================================== */

  const score =
    useMemo(
      () =>
        allQuestions.filter(
          ({
            question,
          }) =>
            isAnswerCorrect(
              question
            )
        ).length,
      [
        allQuestions,
        isAnswerCorrect,
      ]
    );

  /* ==========================================================
     ANSWERED
  ========================================================== */

  const answeredCount =
    useMemo(
      () =>
        allQuestions.filter(
          ({
            question,
          }) => {
            const answer =
              answers[
                String(
                  question.id
                )
              ];

            return (
              answer !==
                undefined &&
              answer !==
                null &&
              String(
                answer
              ).trim() !== ""
            );
          }
        ).length,
      [
        allQuestions,
        answers,
      ]
    );

  const unansweredCount =
    Math.max(
      0,
      totalQuestions -
        answeredCount
    );

  const percentage =
    totalQuestions
      ? Math.round(
          (score /
            totalQuestions) *
            100
        )
      : 0;

  /* ==========================================================
     SUBJECT SCORES
  ========================================================== */

  const subjectScores =
    useMemo(
      () =>
        selectedSubjects.map(
          (subject) => {
            const questions =
              questionsBySubject[
                subject
              ] || [];

            const correct =
              questions.filter(
                (
                  question
                ) =>
                  isAnswerCorrect(
                    question
                  )
              ).length;

            return {
              subject,
              total:
                questions.length,
              correct,
              percentage:
                questions.length
                  ? Math.round(
                      (correct /
                        questions.length) *
                        100
                    )
                  : 0,
            };
          }
        ),
      [
        selectedSubjects,
        questionsBySubject,
        isAnswerCorrect,
      ]
    );

  /* ==========================================================
     SUBMIT
  ========================================================== */

  const submitExam = () => {
    const confirmed =
      window.confirm(
        "Are you sure you want to submit your examination?"
      );

    if (!confirmed) {
      return;
    }

    setSubmitted(true);

    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          exam,
          subjects:
            selectedSubjects,
          questionsBySubject,
          activeSubject,
          currentIndex,
          answers,
          marked,
          endTime,
          submitted: true,
        })
      );
    } catch (error) {
      console.error(
        "Submit storage error:",
        error
      );
    }
  };

  /* ==========================================================
     ROUTE GUARD
  ========================================================== */

  if (!exam) {
    return (
      <Navigate
        to="/cbt"
        replace
      />
    );
  }

  /* ==========================================================
     LOADING SCREEN
  ========================================================== */

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] text-white">
        <MathStyles />

        <div className="flex min-h-screen items-center justify-center px-6">
          <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-white/[0.04] p-10 text-center">

            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-400">
              <BookOpen
                size={30}
              />
            </div>

            <div className="mb-5 h-2 overflow-hidden rounded-full bg-white/10">
              <motion.div
                className="h-full rounded-full bg-cyan-400"
                initial={{
                  width: "0%",
                }}
                animate={{
                  width: "100%",
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  repeatType:
                    "reverse",
                }}
              />
            </div>

            <h1 className="text-2xl font-black">
              Preparing Your Examination
            </h1>

            <p className="mt-3 text-sm text-slate-400">
              {loadingMessage}
            </p>

            <p className="mt-5 text-xs text-slate-600">
              Loading questions from Neon...
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* ============================================================
     ERROR SCREEN
  ============================================================ */

  if (
    fetchError ||
    selectedSubjects.length ===
      0 ||
    totalQuestions === 0
  ) {
    return (
      <div className="min-h-screen bg-[#020617] px-6 py-12 text-white">
        <MathStyles />

        <div className="mx-auto flex min-h-[80vh] max-w-2xl items-center justify-center">
          <div className="w-full rounded-3xl border border-red-400/20 bg-red-400/[0.04] p-8 text-center">

            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-400/10 text-red-400">
              <AlertTriangle
                size={30}
              />
            </div>

            <h1 className="text-2xl font-black">
              Unable to Start Examination
            </h1>

            <p className="mt-4 text-sm leading-7 text-slate-400">
              {fetchError ||
                "No questions are available for this examination."}
            </p>

            <button
              onClick={() =>
                navigate(
                  "/cbt"
                )
              }
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-5 py-3 font-bold text-slate-950 hover:bg-cyan-300"
            >
              <ArrowLeft
                size={18}
              />
              Back to CBT
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ============================================================
     RESULT SCREEN
  ============================================================ */

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#020617] px-4 py-8 text-white sm:px-6">
        <MathStyles />

        <div className="mx-auto max-w-6xl">

          <div className="mb-8 rounded-3xl border border-white/10 bg-white/[0.04] p-6">
            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">

              <div>
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-400">
                  Examination Completed
                </p>

                <h1 className="mt-2 text-3xl font-black">
                  {exam}
                </h1>

                <p className="mt-2 text-sm text-slate-400">
                  Your examination result is ready.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">

                <button
                  onClick={() => {
                    localStorage.removeItem(
                      storageKey
                    );

                    window.location.reload();
                  }}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-bold text-slate-300 hover:bg-white/[0.08]"
                >
                  <RotateCcw
                    size={17}
                  />
                  Retake
                </button>

                <button
                  onClick={() =>
                    navigate(
                      "/cbt"
                    )
                  }
                  className="inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-4 py-3 text-sm font-bold text-slate-950 hover:bg-cyan-300"
                >
                  <ArrowLeft
                    size={17}
                  />
                  Exit
                </button>

              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

            <ResultCard
              title="Total Questions"
              value={
                totalQuestions
              }
              icon={FileText}
            />

            <ResultCard
              title="Score"
              value={`${score}/${totalQuestions}`}
              icon={Trophy}
            />

            <ResultCard
              title="Percentage"
              value={`${percentage}%`}
              icon={Target}
            />

            <ResultCard
              title="Answered"
              value={`${answeredCount}/${totalQuestions}`}
              icon={CheckCircle2}
            />

          </div>

          {/* SUBJECT PERFORMANCE */}

          <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.04] p-6">
            <h2 className="text-xl font-black">
              Subject Performance
            </h2>

            <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">

              {subjectScores.map(
                ({
                  subject,
                  total,
                  correct,
                  percentage:
                    subjectPercentage,
                }) => (
                  <div
                    key={
                      subject
                    }
                    className="rounded-2xl border border-white/10 bg-black/20 p-5"
                  >
                    <div className="flex items-center justify-between gap-3">

                      <h3 className="font-bold text-white">
                        {formatSubjectName(
                          subject
                        )}
                      </h3>

                      <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-xs font-bold text-cyan-400">
                        {
                          subjectPercentage
                        }
                        %
                      </span>
                    </div>

                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-cyan-400"
                        style={{
                          width: `${subjectPercentage}%`,
                        }}
                      />
                    </div>

                    <p className="mt-3 text-xs text-slate-500">
                      {correct} correct out of{" "}
                      {total}
                    </p>
                  </div>
                )
              )}

            </div>
          </div>

          {/* REVIEW */}

          <div className="mt-8">
            <h2 className="text-xl font-black">
              Question Review
            </h2>

            <div className="mt-5 space-y-5">

              {allQuestions.map(
                ({
                  question,
                  subject,
                  index,
                }) => {
                  const questionId =
                    String(
                      question.id
                    );

                  const selected =
                    answers[
                      questionId
                    ];

                  const correct =
                    isAnswerCorrect(
                      question
                    );

                  const options =
                    getQuestionOptions(
                      question
                    );

                  const correctAnswer =
                    getCorrectAnswerValue(
                      question
                    );

                  return (
                    <div
                      key={
                        questionId
                      }
                      className={`rounded-3xl border p-6 ${
                        correct
                          ? "border-emerald-400/20 bg-emerald-400/[0.03]"
                          : "border-red-400/20 bg-red-400/[0.03]"
                      }`}
                    >

                      <div className="flex flex-wrap items-center justify-between gap-3">

                        <div>
                          <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                            {formatSubjectName(
                              subject
                            )}
                          </span>

                          <h3 className="mt-1 font-bold text-slate-200">
                            Question{" "}
                            {getGlobalQuestionNumber(
                              subject,
                              index
                            )}
                          </h3>
                        </div>

                        {correct ? (
                          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-400/10 px-3 py-2 text-xs font-bold text-emerald-400">
                            <CheckCircle2
                              size={15}
                            />
                            Correct
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-2 rounded-full bg-red-400/10 px-3 py-2 text-xs font-bold text-red-400">
                            <XCircle
                              size={15}
                            />
                            Incorrect
                          </span>
                        )}

                      </div>

                      {/* PASSAGE */}

                      {isComprehensionQuestion(
                        question
                      ) &&
                        getPassageValue(
                          question
                        ) && (
                          <div className="mt-5 rounded-2xl border border-cyan-400/10 bg-cyan-400/[0.03] p-5">

                            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-cyan-400">
                              {getComprehensionName(
                                question
                              ) ||
                                "Passage"}
                            </p>

                            <div className="whitespace-pre-wrap text-sm leading-7 text-slate-300">
                              <MathText>
                                {getPassageValue(
                                  question
                                )}
                              </MathText>
                            </div>

                          </div>
                        )}

                      {/* QUESTION */}

                      <div className="mt-5 text-base leading-8 text-white">
                        <MathText>
                          {getQuestionText(
                            question
                          )}
                        </MathText>
                      </div>

                      {/* OPTIONS */}

                      <div className="mt-6 space-y-3">

                        {options.map(
                          (
                            option
                          ) => {
                            const isSelected =
                              normalize(
                                selected
                              ) ===
                                normalize(
                                  option.key
                                ) ||
                              normalize(
                                selected
                              ) ===
                                normalize(
                                  option.text
                                );

                            const isCorrectOption =
                              normalize(
                                option.key
                              ) ===
                                normalize(
                                  correctAnswer
                                ) ||
                              normalize(
                                option.text
                              ) ===
                                normalize(
                                  correctAnswer
                                );

                            return (
                              <div
                                key={
                                  option.key
                                }
                                className={`rounded-2xl border p-4 ${
                                  isCorrectOption
                                    ? "border-emerald-400/30 bg-emerald-400/10"
                                    : isSelected
                                    ? "border-red-400/30 bg-red-400/10"
                                    : "border-white/10 bg-white/[0.02]"
                                }`}
                              >
                                <div className="flex gap-3">

                                  <span className="font-black text-cyan-400">
                                    {
                                      option.key
                                    }
                                    .
                                  </span>

                                  <MathText className="text-sm leading-7 text-slate-300">
                                    {
                                      option.text
                                    }
                                  </MathText>

                                </div>
                              </div>
                            );
                          }
                        )}

                      </div>

                      {/* ANSWERS */}

                      <div className="mt-5 grid gap-3 md:grid-cols-2">

                        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                            Your Answer
                          </p>

                          <p className="mt-2 text-sm text-slate-200">
                            {selected ||
                              "Not answered"}
                          </p>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                            Correct Answer
                          </p>

                          <p className="mt-2 text-sm font-bold text-emerald-400">
                            {correctAnswer ||
                              "Not available"}
                          </p>
                        </div>

                      </div>

                      {/* REASON */}

                      {question.reason && (
                        <div className="mt-5 rounded-2xl border border-cyan-400/10 bg-cyan-400/[0.03] p-5">

                          <p className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                            Explanation
                          </p>

                          <div className="mt-2 text-sm leading-7 text-slate-300">
                            <MathText>
                              {
                                question.reason
                              }
                            </MathText>
                          </div>

                        </div>
                      )}

                    </div>
                  );
                }
              )}

            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ============================================================
     MAIN EXAM UI
  ============================================================ */

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <MathStyles />

      {/* BACKGROUND */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">

        <div className="absolute left-0 top-0 h-[450px] w-[450px] rounded-full bg-cyan-500/5 blur-[130px]" />

        <div className="absolute bottom-0 right-0 h-[450px] w-[450px] rounded-full bg-blue-500/5 blur-[130px]" />

        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize:
              "24px 24px",
          }}
        />

      </div>

      {/* ========================================================
          HEADER
      ======================================================== */}

      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#020617]/90 backdrop-blur-xl">

        <div className="mx-auto max-w-[1600px] px-4 py-4 sm:px-6">

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

            <div className="flex min-w-0 items-center gap-3">

              <button
                onClick={() =>
                  navigate(
                    "/cbt"
                  )
                }
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-300 hover:bg-white/[0.08] hover:text-white"
              >
                <ArrowLeft
                  size={19}
                />
              </button>

              <div className="min-w-0">

                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-cyan-400">
                  CBT Examination
                </p>

                <h1 className="truncate text-lg font-black sm:text-xl">
                  {exam}
                </h1>

              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">

              {/* TIMER */}

              <div
                className={`flex items-center gap-2 rounded-xl border px-3 py-2 sm:px-4 ${
                  timeLeft <= 300
                    ? "border-red-400/30 bg-red-400/10 text-red-400"
                    : "border-white/10 bg-white/[0.04] text-slate-200"
                }`}
              >
                <Clock3
                  size={18}
                />

                <span className="font-mono text-sm font-bold sm:text-base">
                  {
                    formattedTime
                  }
                </span>
              </div>

              {/* NAVIGATOR TOGGLE */}

              <button
                onClick={() =>
                  setShowNavigator(
                    (value) =>
                      !value
                  )
                }
                className={`inline-flex h-10 items-center gap-2 rounded-xl border px-3 text-sm font-bold transition ${
                  showNavigator
                    ? "border-cyan-400/30 bg-cyan-400/10 text-cyan-400"
                    : "border-white/10 bg-white/[0.04] text-slate-300 hover:bg-white/[0.08]"
                }`}
              >
                <FileText
                  size={17}
                />

                <span className="hidden sm:inline">
                  Questions
                </span>
              </button>

              {/* FULLSCREEN */}

              <button
                onClick={
                  toggleFullscreen
                }
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-300 hover:bg-white/[0.08]"
              >
                {isFullscreen ? (
                  <Minimize
                    size={17}
                  />
                ) : (
                  <Maximize
                    size={17}
                  />
                )}
              </button>

            </div>
          </div>
        </div>
      </header>

      {/* ========================================================
          SUBJECT BAR
      ======================================================== */}

      <div className="relative z-40 border-b border-white/10 bg-[#020617]/80 backdrop-blur-xl">

        <div className="mx-auto max-w-[1600px] px-4 py-3 sm:px-6">

          <div className="flex gap-2 overflow-x-auto pb-1">

            {selectedSubjects.map(
              (subject) => {
                const subjectQuestions =
                  questionsBySubject[
                    subject
                  ] || [];

                const subjectAnswered =
                  subjectQuestions.filter(
                    (
                      question
                    ) => {
                      const answer =
                        answers[
                          String(
                            question.id
                          )
                        ];

                      return (
                        answer !==
                          undefined &&
                        answer !==
                          null &&
                        String(
                          answer
                        ).trim() !==
                          ""
                      );
                    }
                  ).length;

                const active =
                  subjectsMatch(
                    subject,
                    activeSubject
                  );

                return (
                  <button
                    key={
                      subject
                    }
                    onClick={() =>
                      changeSubject(
                        subject
                      )
                    }
                    className={`shrink-0 rounded-xl border px-4 py-2.5 text-sm font-bold ${
                      active
                        ? "border-cyan-400/30 bg-cyan-400/10 text-cyan-300"
                        : "border-white/10 bg-white/[0.03] text-slate-400 hover:bg-white/[0.07] hover:text-white"
                    }`}
                  >

                    {formatSubjectName(
                      subject
                    )}

                    <span className="ml-2 text-xs opacity-60">
                      {
                        subjectAnswered
                      }
                      /
                      {
                        subjectQuestions.length
                      }
                    </span>

                  </button>
                );
              }
            )}

          </div>
        </div>
      </div>

      {/* ========================================================
          MAIN
      ======================================================== */}

      <main className="relative z-10 mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:py-8">

        {/*
         * THIS IS THE IMPORTANT GRID FIX.
         *
         * Navigator closed:
         *     one full-width column.
         *
         * Navigator open:
         *     question + right navigator.
         */}
        <div
          className={`grid gap-6 ${
            showNavigator
              ? "lg:grid-cols-[minmax(0,1fr)_330px]"
              : "lg:grid-cols-1"
          }`}
        >

          {/* ======================================================
              QUESTION AREA
          ====================================================== */}

          <section className="min-w-0">

            {/* STATS */}

            <div className="mb-5 grid gap-3 sm:grid-cols-3">

              <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
                <p className="text-xs text-slate-500">
                  Total Questions
                </p>

                <p className="mt-1 text-2xl font-black">
                  {
                    totalQuestions
                  }
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
                <p className="text-xs text-slate-500">
                  Answered
                </p>

                <p className="mt-1 text-2xl font-black text-cyan-400">
                  {
                    answeredCount
                  }
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
                <p className="text-xs text-slate-500">
                  Remaining
                </p>

                <p className="mt-1 text-2xl font-black">
                  {
                    unansweredCount
                  }
                </p>
              </div>

            </div>

            {/* CALCULATOR */}

            <AnimatePresence>
              {showCalculator && (
                <motion.div
                  initial={{
                    opacity: 0,
                    y: -10,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  exit={{
                    opacity: 0,
                    y: -10,
                  }}
                  className="mb-5 rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.03] p-5"
                >

                  <div className="mb-3 flex items-center justify-between">

                    <div className="flex items-center gap-2">
                      <Calculator
                        size={18}
                        className="text-cyan-400"
                      />

                      <span className="font-bold">
                        Calculator
                      </span>
                    </div>

                    <button
                      onClick={() =>
                        setShowCalculator(
                          false
                        )
                      }
                      className="text-slate-500 hover:text-white"
                    >
                      <X
                        size={18}
                      />
                    </button>

                  </div>

                  <input
                    value={
                      calculatorValue
                    }
                    onChange={(
                      event
                    ) =>
                      setCalculatorValue(
                        event.target
                          .value
                      )
                    }
                    onKeyDown={(
                      event
                    ) => {
                      if (
                        event.key ===
                        "Enter"
                      ) {
                        calculateExpression();
                      }
                    }}
                    placeholder="Example: 25 * 4 + 10"
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 font-mono text-white outline-none focus:border-cyan-400/30"
                  />

                  <div className="mt-3 flex gap-2">

                    <button
                      onClick={
                        calculateExpression
                      }
                      className="rounded-xl bg-cyan-400 px-4 py-2 text-sm font-bold text-slate-950 hover:bg-cyan-300"
                    >
                      Calculate
                    </button>

                    <button
                      onClick={() =>
                        setCalculatorValue(
                          ""
                        )
                      }
                      className="rounded-xl border border-white/10 px-4 py-2 text-sm font-bold text-slate-300 hover:bg-white/[0.05]"
                    >
                      Clear
                    </button>

                  </div>

                </motion.div>
              )}
            </AnimatePresence>

            {/* ====================================================
                QUESTION CARD
            ==================================================== */}

            {currentQuestion && (
              <motion.div
                key={`${activeSubject}-${currentQuestion.id}`}
                initial={{
                  opacity: 0,
                  y: 10,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                className="rounded-3xl border border-white/10 bg-white/[0.035] p-5 shadow-2xl shadow-black/20 sm:p-7"
              >

                {/* ==================================================
                    QUESTION HEADER

                    SUBJECT + QUESTION NUMBER ARE TOGETHER.
                ================================================== */}

                <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                  <div className="min-w-0">

                    <div className="flex flex-wrap items-center gap-2">

                      {/* ACTIVE SUBJECT */}

                      <span className="rounded-full bg-cyan-400/10 px-3 py-1.5 text-xs font-black text-cyan-400">
                        {formatSubjectName(
                          activeSubject
                        )}
                      </span>

                      {/* QUESTION NUMBER */}

                      <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-bold text-slate-300">
                        Question{" "}
                        {currentIndex +
                          1}{" "}
                        of{" "}
                        {
                          currentQuestions.length
                        }
                      </span>

                    </div>

                    <p className="mt-2 text-xs text-slate-600">
                      Overall question{" "}
                      {getGlobalQuestionNumber(
                        activeSubject,
                        currentIndex
                      )}{" "}
                      of{" "}
                      {totalQuestions}
                    </p>

                  </div>

                  <div className="flex shrink-0 items-center gap-2">

                    {/* CALCULATOR */}

                    {normalize(
                      activeSubject
                    ).includes(
                      "mathemat"
                    ) && (
                      <button
                        onClick={() =>
                          setShowCalculator(
                            (value) =>
                              !value
                          )
                        }
                        className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-bold text-slate-300 hover:bg-white/[0.07] hover:text-white"
                      >
                        <Calculator
                          size={16}
                        />

                        <span className="hidden sm:inline">
                          Calculator
                        </span>
                      </button>
                    )}

                    {/* MARK */}

                    <button
                      onClick={() =>
                        toggleMark(
                          String(
                            currentQuestion.id
                          )
                        )
                      }
                      className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold ${
                        marked[
                          String(
                            currentQuestion.id
                          )
                        ]
                          ? "border-amber-400/30 bg-amber-400/10 text-amber-400"
                          : "border-white/10 bg-white/[0.03] text-slate-400 hover:text-white"
                      }`}
                    >
                      <Flag
                        size={16}
                      />

                      <span className="hidden sm:inline">
                        {marked[
                          String(
                            currentQuestion.id
                          )
                        ]
                          ? "Marked"
                          : "Mark"}
                      </span>
                    </button>

                  </div>
                </div>

                {/* ==================================================
                    PASSAGE
                ================================================== */}

                {isComprehensionQuestion(
                  currentQuestion
                ) &&
                  getPassageValue(
                    currentQuestion
                  ) && (
                    <div className="mb-7 rounded-2xl border border-cyan-400/10 bg-cyan-400/[0.025] p-5">

                      <div className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-[0.15em] text-cyan-400">

                        <BookOpen
                          size={15}
                        />

                        {getComprehensionName(
                          currentQuestion
                        ) ||
                          "Comprehension Passage"}

                      </div>

                      <div className="whitespace-pre-wrap text-sm leading-8 text-slate-300">
                        <MathText>
                          {getPassageValue(
                            currentQuestion
                          )}
                        </MathText>
                      </div>

                    </div>
                  )}

                {/* ==================================================
                    QUESTION TEXT
                ================================================== */}

                <div className="text-lg font-semibold leading-9 text-white sm:text-xl">
                  <MathText>
                    {getQuestionText(
                      currentQuestion
                    )}
                  </MathText>
                </div>

                {/* IMAGE */}

                {currentQuestion.image && (
                  <div className="mt-6">
                    <img
                      src={
                        currentQuestion.image
                      }
                      alt="Question illustration"
                      className="max-h-[500px] max-w-full rounded-2xl border border-white/10 object-contain"
                    />
                  </div>
                )}

                {/* ==================================================
                    OPTIONS
                ================================================== */}

                <div className="mt-8 space-y-3">

                  {getQuestionOptions(
                    currentQuestion
                  ).map(
                    (option) => {
                      const questionId =
                        String(
                          currentQuestion.id
                        );

                      const selected =
                        answers[
                          questionId
                        ];

                      const active =
                        normalize(
                          selected
                        ) ===
                          normalize(
                            option.key
                          ) ||
                        normalize(
                          selected
                        ) ===
                          normalize(
                            option.text
                          );

                      return (
                        <button
                          key={
                            option.key
                          }
                          onClick={() =>
                            selectAnswer(
                              questionId,
                              option.key
                            )
                          }
                          className={`group flex w-full items-start gap-4 rounded-2xl border p-4 text-left transition ${
                            active
                              ? "border-cyan-400/40 bg-cyan-400/10"
                              : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.05]"
                          }`}
                        >

                          <span
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border text-sm font-black ${
                              active
                                ? "border-cyan-400/30 bg-cyan-400/20 text-cyan-300"
                                : "border-white/10 bg-white/[0.04] text-slate-400 group-hover:text-white"
                            }`}
                          >
                            {
                              option.key
                            }
                          </span>

                          <MathText className="pt-1 text-sm leading-7 text-slate-300 sm:text-base">
                            {
                              option.text
                            }
                          </MathText>

                        </button>
                      );
                    }
                  )}

                </div>

                {/* ==================================================
                    NAVIGATION
                ================================================== */}

                <div className="mt-8 flex flex-col gap-3 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">

                  <button
                    onClick={
                      goPrevious
                    }
                    disabled={
                      currentIndex ===
                        0 &&
                      selectedSubjects.findIndex(
                        (
                          subject
                        ) =>
                          subjectsMatch(
                            subject,
                            activeSubject
                          )
                      ) === 0
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-bold text-slate-300 hover:bg-white/[0.07] disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <ChevronLeft
                      size={18}
                    />
                    Previous
                  </button>

                  <button
                    onClick={
                      submitExam
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-400/20 bg-red-400/10 px-5 py-3 text-sm font-black text-red-400 hover:bg-red-400/15"
                  >
                    <CheckCircle2
                      size={18}
                    />
                    Submit Exam
                  </button>

                  <button
                    onClick={goNext}
                    disabled={
                      currentIndex ===
                        currentQuestions.length -
                          1 &&
                      selectedSubjects.findIndex(
                        (
                          subject
                        ) =>
                          subjectsMatch(
                            subject,
                            activeSubject
                          )
                      ) ===
                        selectedSubjects.length -
                          1
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-400 px-5 py-3 text-sm font-black text-slate-950 hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    Next
                    <ChevronRight
                      size={18}
                    />
                  </button>

                </div>

              </motion.div>
            )}

          </section>

          {/* ======================================================
              RIGHT QUESTION NAVIGATOR

              CLOSED BY DEFAULT.

              It appears only when:
              showNavigator === true
          ====================================================== */}

          {showNavigator && (
            <aside className="block">

              <div className="sticky top-[130px] space-y-5">

                {/* PROGRESS */}

                <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-5">

                  <div className="flex items-center justify-between">

                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Progress
                      </p>

                      <p className="mt-1 text-2xl font-black">
                        {totalQuestions
                          ? Math.round(
                              (answeredCount /
                                totalQuestions) *
                                100
                            )
                          : 0}
                        %
                      </p>
                    </div>

                    <Target
                      size={26}
                      className="text-cyan-400"
                    />

                  </div>

                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-cyan-400 transition-all"
                      style={{
                        width: `${
                          totalQuestions
                            ? (
                                answeredCount /
                                totalQuestions
                              ) *
                              100
                            : 0
                        }%`,
                      }}
                    />
                  </div>

                </div>

                {/* QUESTION NAVIGATOR */}

                <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-5">

                  <div className="mb-4 flex items-center justify-between">

                    <div>
                      <h2 className="font-black">
                        Question Navigator
                      </h2>

                      <p className="mt-1 text-xs text-slate-500">
                        Select a question
                      </p>
                    </div>

                    <button
                      onClick={() =>
                        setShowNavigator(
                          false
                        )
                      }
                      className="text-slate-500 hover:text-white"
                    >
                      <X
                        size={18}
                      />
                    </button>

                  </div>

                  <div className="max-h-[55vh] overflow-y-auto pr-1">

                    {selectedSubjects.map(
                      (subject) => {
                        const questions =
                          questionsBySubject[
                            subject
                          ] || [];

                        return (
                          <div
                            key={
                              subject
                            }
                            className="mb-5 last:mb-0"
                          >

                            {/* SUBJECT */}

                            <div className="mb-3 flex items-center justify-between">

                              <span className="truncate text-xs font-bold text-slate-300">
                                {formatSubjectName(
                                  subject
                                )}
                              </span>

                              <span className="text-[10px] text-slate-600">
                                {
                                  questions.length
                                }
                              </span>

                            </div>

                            {/* NUMBER GRID */}

                            <div className="grid grid-cols-5 gap-2">

                              {questions.map(
                                (
                                  question,
                                  index
                                ) => {
                                  const id =
                                    String(
                                      question.id
                                    );

                                  const answered =
                                    answers[
                                      id
                                    ] !==
                                      undefined &&
                                    answers[
                                      id
                                    ] !==
                                      null &&
                                    String(
                                      answers[
                                        id
                                      ]
                                    ).trim() !==
                                      "";

                                  const current =
                                    subjectsMatch(
                                      subject,
                                      activeSubject
                                    ) &&
                                    currentIndex ===
                                      index;

                                  const isMarked =
                                    Boolean(
                                      marked[
                                        id
                                      ]
                                    );

                                  return (
                                    <button
                                      key={
                                        id
                                      }
                                      onClick={() => {
                                        setActiveSubject(
                                          subject
                                        );

                                        setCurrentIndex(
                                          index
                                        );

                                        /*
                                         * Close after
                                         * selecting on
                                         * small screens.
                                         */
                                        if (
                                          window.innerWidth <
                                          1024
                                        ) {
                                          setShowNavigator(
                                            false
                                          );
                                        }
                                      }}
                                      className={`relative flex h-9 items-center justify-center rounded-lg border text-xs font-bold transition ${
                                        current
                                          ? "border-cyan-400 bg-cyan-400 text-slate-950"
                                          : answered
                                          ? "border-cyan-400/20 bg-cyan-400/10 text-cyan-400"
                                          : "border-white/10 bg-white/[0.025] text-slate-500 hover:bg-white/[0.08] hover:text-white"
                                      }`}
                                    >

                                      {
                                        index +
                                        1
                                      }

                                      {isMarked && (
                                        <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-amber-400" />
                                      )}

                                    </button>
                                  );
                                }
                              )}

                            </div>
                          </div>
                        );
                      }
                    )}

                  </div>
                </div>

                {/* SUBJECT SUMMARY */}

                <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-5">

                  <h2 className="mb-4 font-black">
                    Subject Summary
                  </h2>

                  <div className="space-y-3">

                    {selectedSubjects.map(
                      (subject) => {
                        const questions =
                          questionsBySubject[
                            subject
                          ] || [];

                        const answered =
                          questions.filter(
                            (
                              question
                            ) => {
                              const answer =
                                answers[
                                  String(
                                    question.id
                                  )
                                ];

                              return (
                                answer !==
                                  undefined &&
                                answer !==
                                  null &&
                                String(
                                  answer
                                ).trim() !==
                                  ""
                              );
                            }
                          ).length;

                        const active =
                          subjectsMatch(
                            subject,
                            activeSubject
                          );

                        return (
                          <button
                            key={
                              subject
                            }
                            onClick={() =>
                              changeSubject(
                                subject
                              )
                            }
                            className={`w-full rounded-2xl border p-4 text-left ${
                              active
                                ? "border-cyan-400/20 bg-cyan-400/[0.05]"
                                : "border-white/10 bg-white/[0.02] hover:bg-white/[0.05]"
                            }`}
                          >

                            <div className="flex items-center justify-between gap-3">

                              <span className="truncate text-sm font-bold text-slate-200">
                                {formatSubjectName(
                                  subject
                                )}
                              </span>

                              <ChevronRight
                                size={15}
                                className="shrink-0 text-slate-600"
                              />

                            </div>

                            <div className="mt-2 flex items-center justify-between text-xs">

                              <span className="text-slate-500">
                                {
                                  answered
                                }{" "}
                                answered
                              </span>

                              <span className="text-slate-600">
                                {
                                  questions.length
                                }{" "}
                                questions
                              </span>

                            </div>

                          </button>
                        );
                      }
                    )}

                  </div>
                </div>

                {/* SUBMIT */}

                <button
                  onClick={
                    submitExam
                  }
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-red-400 px-5 py-4 font-black text-slate-950 hover:bg-red-300"
                >
                  <CheckCircle2
                    size={19}
                  />
                  Submit Examination
                </button>

              </div>
            </aside>
          )}

        </div>
      </main>
    </div>
  );
};

export default CBTExam;