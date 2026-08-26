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
  Delete,
  Flag,
  Grid3X3,
  Menu,
  RotateCcw,
  Trophy,
  X,
} from "lucide-react";

import { supabase } from "../../lib/supabaseClient";

/*
|--------------------------------------------------------------------------
| CONFIGURATION
|--------------------------------------------------------------------------
*/

const QUESTIONS_PER_SUBJECT = 40;
const EXAM_DURATION_MINUTES = 120;
const FORCE_FRESH_EXAM = false;


/*
|--------------------------------------------------------------------------
| NORMALIZATION
|--------------------------------------------------------------------------
*/

const normalize = (value) => {
  return String(value ?? "")
    .replace(/\u00A0/g, " ")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
};

const examsMatch = (first, second) => {
  const a = normalize(first);
  const b = normalize(second);

  return Boolean(a && b && a === b);
};

const subjectsMatch = (first, second) => {
  const a = normalize(first);
  const b = normalize(second);

  return Boolean(a && b && a === b);
};


/*
|--------------------------------------------------------------------------
| SUBJECT DISPLAY
|--------------------------------------------------------------------------
*/

const getSubjectDisplayName = (subject) => {
  return String(subject ?? "").trim();
};


/*
|--------------------------------------------------------------------------
| SHUFFLE
|--------------------------------------------------------------------------
*/

const shuffleQuestions = (questions) => {
  const array = Array.isArray(questions)
    ? [...questions]
    : [];

  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));

    [array[i], array[j]] = [
      array[j],
      array[i],
    ];
  }

  return array;
};


/*
|--------------------------------------------------------------------------
| QUESTION TEXT
|--------------------------------------------------------------------------
*/

const getQuestionText = (question) => {
  if (!question) {
    return "";
  }

  return String(
    question.question ??
      question.question_text ??
      question.questionText ??
      ""
  ).trim();
};


/*
|--------------------------------------------------------------------------
| OPTIONS
|--------------------------------------------------------------------------
*/

const getQuestionOptionsMap = (question) => {
  if (!question) {
    return {};
  }

  let options = question.options;

  /*
   * JSONB object
   */
  if (
    options &&
    typeof options === "object" &&
    !Array.isArray(options)
  ) {
    return {
      A: String(options.A ?? "").trim(),
      B: String(options.B ?? "").trim(),
      C: String(options.C ?? "").trim(),
      D: String(options.D ?? "").trim(),
    };
  }

  /*
   * JSON string
   */
  if (typeof options === "string") {
    try {
      const parsed = JSON.parse(options);

      if (
        parsed &&
        typeof parsed === "object" &&
        !Array.isArray(parsed)
      ) {
        return {
          A: String(parsed.A ?? "").trim(),
          B: String(parsed.B ?? "").trim(),
          C: String(parsed.C ?? "").trim(),
          D: String(parsed.D ?? "").trim(),
        };
      }

      if (Array.isArray(parsed)) {
        return {
          A: String(parsed[0] ?? "").trim(),
          B: String(parsed[1] ?? "").trim(),
          C: String(parsed[2] ?? "").trim(),
          D: String(parsed[3] ?? "").trim(),
        };
      }
    } catch (error) {
      /*
       * Some databases may contain plain text
       * inside the options column rather than JSON.
       */
      console.warn(
        "Unable to parse question.options as JSON:",
        error
      );
    }
  }

  /*
   * Legacy option columns
   */
  const legacyOptions = {
    A: String(question.optionA ?? "").trim(),
    B: String(question.optionB ?? "").trim(),
    C: String(question.optionC ?? "").trim(),
    D: String(question.optionD ?? "").trim(),
  };

  if (Object.values(legacyOptions).some(Boolean)) {
    return legacyOptions;
  }

  /*
   * Legacy array
   */
  if (Array.isArray(question.options)) {
    const getArrayValue = (item) => {
      if (item && typeof item === "object") {
        return String(
          item.text ??
            item.value ??
            item.label ??
            ""
        ).trim();
      }

      return String(item ?? "").trim();
    };

    return {
      A: getArrayValue(question.options[0]),
      B: getArrayValue(question.options[1]),
      C: getArrayValue(question.options[2]),
      D: getArrayValue(question.options[3]),
    };
  }

  return {};
};

const getQuestionOptions = (question) => {
  const optionMap = getQuestionOptionsMap(question);

  return ["A", "B", "C", "D"]
    .map((letter) => optionMap[letter])
    .filter(Boolean);
};


/*
|--------------------------------------------------------------------------
| CORRECT ANSWER
|--------------------------------------------------------------------------
*/

const getCorrectAnswerValue = (question) => {
  if (!question) {
    return "";
  }

  return String(
    question.answer ??
      question.correct_answer ??
      question.correctAnswer ??
      question.correct_option ??
      question.correctOption ??
      ""
  ).trim();
};

const normalizeAnswerLetter = (value) => {
  return normalize(value)
    .replace(/^option\s*/i, "")
    .replace(
      /^[\(\[]?([abcd])[\)\].:\-\s]*$/i,
      "$1"
    );
};


/*
|--------------------------------------------------------------------------
| COMPREHENSION
|--------------------------------------------------------------------------
*/

const getComprehensionId = (question) => {
  if (!question) {
    return "";
  }

  return String(
    question.comprehension_id ??
      question.comprehensionId ??
      question.passage_id ??
      question.passageId ??
      question.comprehension_group_id ??
      ""
  ).trim();
};

const getComprehensionName = (question) => {
  if (!question) {
    return "";
  }

  return String(
    question.comprehension_name ??
      question.comprehensionName ??
      question.passage_name ??
      question.passageName ??
      question.comprehension_title ??
      question.comprehensionTitle ??
      ""
  ).trim();
};

const getPassageValue = (question) => {
  if (!question) {
    return "";
  }

  return String(
    question.passage ??
      question.comprehension_passage ??
      question.comprehensionPassage ??
      question.passage_text ??
      question.passageText ??
      ""
  ).trim();
};

const isComprehensionQuestion = (question) => {
  if (!question) {
    return false;
  }

  return Boolean(
    getPassageValue(question) ||
      getComprehensionId(question) ||
      getComprehensionName(question) ||
      normalize(question.question_type) === "comprehension" ||
      normalize(question.questionType) === "comprehension"
  );
};

const comprehensionNamesMatch = (first, second) => {
  return (
    normalize(first) !== "" &&
    normalize(first) === normalize(second)
  );
};

const getComprehensionPassage = (
  question,
  questions
) => {
  if (!question) {
    return "";
  }

  const directPassage = getPassageValue(question);

  if (directPassage) {
    return directPassage;
  }

  const comprehensionId =
    getComprehensionId(question);

  if (comprehensionId && Array.isArray(questions)) {
    const matching = questions.find(
      (item) =>
        getComprehensionId(item) === comprehensionId &&
        getPassageValue(item)
    );

    if (matching) {
      return getPassageValue(matching);
    }
  }

  const comprehensionName =
    getComprehensionName(question);

  if (comprehensionName && Array.isArray(questions)) {
    const matching = questions.find(
      (item) =>
        comprehensionNamesMatch(
          getComprehensionName(item),
          comprehensionName
        ) &&
        getPassageValue(item)
    );

    if (matching) {
      return getPassageValue(matching);
    }
  }

  return "";
};

const getComprehensionQuestionText = (question) => {
  return getQuestionText(question)
    .replace(/^\s*passage\s*:/i, "")
    .trim();
};


/*
|--------------------------------------------------------------------------
| COMPREHENSION GROUP SELECTION
|--------------------------------------------------------------------------
*/

const selectQuestionsKeepingComprehensionGroups = (
  questions,
  count
) => {
  if (
    !Array.isArray(questions) ||
    questions.length === 0 ||
    count <= 0
  ) {
    return [];
  }

  const comprehensionGroups = new Map();
  const standalone = [];

  questions.forEach((question) => {
    const id = getComprehensionId(question);
    const name = getComprehensionName(question);

    const key = id
      ? `id:${id}`
      : name
      ? `name:${normalize(name)}`
      : "";

    if (key) {
      if (!comprehensionGroups.has(key)) {
        comprehensionGroups.set(key, []);
      }

      comprehensionGroups.get(key).push(question);
    } else {
      standalone.push(question);
    }
  });

  const groups = shuffleQuestions(
    Array.from(comprehensionGroups.values())
  );

  const result = [];

  for (const group of groups) {
    if (result.length + group.length <= count) {
      result.push(...shuffleQuestions(group));
    }
  }

  const shuffledStandalone =
    shuffleQuestions(standalone);

  for (const question of shuffledStandalone) {
    if (result.length >= count) {
      break;
    }

    result.push(question);
  }

  if (result.length < count) {
    const usedIds = new Set(
      result.map((question) =>
        String(question.id ?? "")
      )
    );

    const remaining = shuffleQuestions(
      questions.filter(
        (question) =>
          !usedIds.has(String(question.id ?? ""))
      )
    );

    for (const question of remaining) {
      if (result.length >= count) {
        break;
      }

      result.push(question);
    }
  }

  return shuffleQuestions(result).slice(0, count);
};


/*
|--------------------------------------------------------------------------
| MATHEMATICAL HTML
|--------------------------------------------------------------------------
|
| IMPORTANT:
|
| The database may contain:
|
| <span class="math-fraction">
|   <span>1</span>
|   <span>5</span>
| </span>
|
| React normally escapes this and displays the tags as text.
|
| MathText below safely sanitizes trusted mathematical markup
| and then renders the allowed mathematical HTML.
|
|--------------------------------------------------------------------------
*/


/*
 * Convert common LaTeX-style fractions:
 *
 * \frac{1}{5}
 * \frac{a+b}{c}
 */
const convertLatexFractions = (value) => {
  let text = String(value ?? "");

  let previous = "";

  /*
   * Repeat because a fraction may contain another fraction.
   */
  while (previous !== text) {
    previous = text;

    text = text.replace(
      /\\frac\s*\{([^{}]*)\}\s*\{([^{}]*)\}/g,
      (_, numerator, denominator) => {
        return (
          `<span class="math-fraction">` +
          `<span>${numerator}</span>` +
          `<span>${denominator}</span>` +
          `</span>`
        );
      }
    );
  }

  return text;
};


/*
 * Convert common simple LaTeX commands to HTML.
 */
const convertCommonMathSyntax = (value) => {
  let text = String(value ?? "");

  text = convertLatexFractions(text);

  /*
   * Square root
   *
   * \sqrt{x}
   */
  text = text.replace(
    /\\sqrt\s*\{([^{}]*)\}/g,
    `<span class="math-root"><span class="math-root-symbol">√</span><span>$1</span></span>`
  );

  /*
   * Superscripts:
   *
   * x^2
   * x^{2}
   */
  text = text.replace(
    /\^\{([^{}]+)\}/g,
    `<sup>$1</sup>`
  );

  text = text.replace(
    /\^([A-Za-z0-9]+)/g,
    `<sup>$1</sup>`
  );

  /*
   * Subscripts:
   *
   * x_1
   * x_{12}
   */
  text = text.replace(
    /_\{([^{}]+)\}/g,
    `<sub>$1</sub>`
  );

  text = text.replace(
    /_([A-Za-z0-9]+)/g,
    `<sub>$1</sub>`
  );

  /*
   * Common LaTeX symbols.
   */
  const replacements = [
    [/\\times/g, "×"],
    [/\\div/g, "÷"],
    [/\\pm/g, "±"],
    [/\\leq/g, "≤"],
    [/\\le/g, "≤"],
    [/\\geq/g, "≥"],
    [/\\ge/g, "≥"],
    [/\\neq/g, "≠"],
    [/\\ne/g, "≠"],
    [/\\approx/g, "≈"],
    [/\\pi/g, "π"],
    [/\\infty/g, "∞"],
    [/\\theta/g, "θ"],
    [/\\alpha/g, "α"],
    [/\\beta/g, "β"],
    [/\\gamma/g, "γ"],
    [/\\delta/g, "δ"],
    [/\\lambda/g, "λ"],
    [/\\mu/g, "μ"],
    [/\\sigma/g, "σ"],
    [/\\omega/g, "ω"],
    [/\\degree/g, "°"],
  ];

  replacements.forEach(([pattern, replacement]) => {
    text = text.replace(pattern, replacement);
  });

  return text;
};


/*
 * Allowed HTML tags for question content.
 */
const ALLOWED_MATH_TAGS = new Set([
  "SPAN",
  "SUP",
  "SUB",
  "BR",
  "STRONG",
  "B",
  "EM",
  "I",
  "U",
  "P",
  "DIV",
  "SMALL",
  "MARK",
]);


/*
 * Only mathematical/presentation classes are allowed.
 */
const ALLOWED_MATH_CLASSES = new Set([
  "math-fraction",
  "math-root",
  "math-root-symbol",
  "math-inline",
  "math-display",
  "math-equation",
  "math-numerator",
  "math-denominator",
  "math-sup",
  "math-sub",
]);


/*
 * Sanitize mathematical HTML.
 *
 * This prevents question content from executing scripts
 * or injecting arbitrary event handlers.
 */
const sanitizeMathHtml = (value) => {
  if (value === null || value === undefined) {
    return "";
  }

  let text = String(value);

  /*
   * If there is no HTML and no LaTeX syntax,
   * return normal text safely through React.
   */
  const hasMarkup =
    /<[^>]+>/.test(text) ||
    /\\(frac|sqrt|times|div|leq|geq|neq|pi|infty|alpha|beta|gamma|delta|theta)/.test(
      text
    );

  if (!hasMarkup) {
    return text
      .replace(/\u00A0/g, " ");
  }

  text = convertCommonMathSyntax(text);

  /*
   * DOMParser is available in the browser where the CBT runs.
   */
  if (typeof window === "undefined") {
    return text;
  }

  const parser = new DOMParser();
  const document = parser.parseFromString(
    `<div>${text}</div>`,
    "text/html"
  );

  const root = document.body.firstElementChild;

  if (!root) {
    return text;
  }

  const cleanNode = (node) => {
    /*
     * Remove comments.
     */
    if (node.nodeType === Node.COMMENT_NODE) {
      node.remove();
      return;
    }

    /*
     * Text node.
     */
    if (node.nodeType === Node.TEXT_NODE) {
      return;
    }

    /*
     * Remove anything that is not an element.
     */
    if (node.nodeType !== Node.ELEMENT_NODE) {
      node.remove();
      return;
    }

    const tagName = node.tagName.toUpperCase();

    /*
     * Remove dangerous tags entirely.
     */
    if (
      [
        "SCRIPT",
        "STYLE",
        "IFRAME",
        "OBJECT",
        "EMBED",
        "FORM",
        "INPUT",
        "BUTTON",
        "TEXTAREA",
        "SELECT",
        "OPTION",
        "LINK",
        "META",
        "SVG",
        "MATH",
      ].includes(tagName)
    ) {
      node.remove();
      return;
    }

    /*
     * Unsupported tags:
     *
     * Keep their text/content but remove the tag.
     */
    if (!ALLOWED_MATH_TAGS.has(tagName)) {
      const fragment =
        document.createDocumentFragment();

      while (node.firstChild) {
        fragment.appendChild(node.firstChild);
      }

      node.replaceWith(fragment);
      return;
    }

    /*
     * Remove every attribute except class.
     */
    Array.from(node.attributes).forEach(
      (attribute) => {
        const name =
          attribute.name.toLowerCase();

        if (name !== "class") {
          node.removeAttribute(
            attribute.name
          );
        }
      }
    );

    /*
     * Restrict class names.
     */
    if (node.hasAttribute("class")) {
      const classes =
        node
          .getAttribute("class")
          .split(/\s+/)
          .filter((className) =>
            ALLOWED_MATH_CLASSES.has(
              className
            )
          );

      if (classes.length > 0) {
        node.setAttribute(
          "class",
          classes.join(" ")
        );
      } else {
        node.removeAttribute("class");
      }
    }

    /*
     * Recursively clean children.
     */
    Array.from(node.childNodes).forEach(
      cleanNode
    );
  };

  Array.from(root.childNodes).forEach(
    cleanNode
  );

  return root.innerHTML;
};


/*
|--------------------------------------------------------------------------
| MATH TEXT COMPONENT
|--------------------------------------------------------------------------
*/

const MathText = ({
  children,
  className = "",
}) => {
  const rawValue =
    children === null ||
    children === undefined
      ? ""
      : String(children);

  const html =
    sanitizeMathHtml(rawValue);

  /*
   * If there is no HTML, render normally.
   * This gives React normal text handling.
   */
  if (
    !/<[^>]+>/.test(html)
  ) {
    return (
      <span
        className={className}
      >
        {html}
      </span>
    );
  }

  return (
    <span
      className={className}
      dangerouslySetInnerHTML={{
        __html: html,
      }}
    />
  );
};


/*
|--------------------------------------------------------------------------
| MATHEMATICAL CSS
|--------------------------------------------------------------------------
*/

const MathStyles = () => {
  return (
    <style>
      {`
        /*
         * Proper stacked fraction.
         *
         * Example:
         *
         *  1
         *  ─
         *  5
         */
        .math-fraction {
          display: inline-flex;
          flex-direction: column;
          align-items: stretch;
          justify-content: center;
          vertical-align: middle;
          text-align: center;
          line-height: 1;
          margin: 0 0.16em;
          min-width: 1.15em;
          position: relative;
          top: 0.08em;
        }

        .math-fraction > span:first-child {
          display: block;
          padding: 0 0.22em 0.12em;
          line-height: 1.05;
          border-bottom: 1.5px solid currentColor;
        }

        .math-fraction > span:last-child {
          display: block;
          padding: 0.12em 0.22em 0;
          line-height: 1.05;
        }

        /*
         * Larger fractions inside equations.
         */
        .math-display .math-fraction,
        .math-equation .math-fraction {
          font-size: 1.05em;
        }

        /*
         * Square root.
         */
        .math-root {
          display: inline-flex;
          align-items: flex-start;
          vertical-align: middle;
          white-space: nowrap;
          margin: 0 0.08em;
        }

        .math-root-symbol {
          font-size: 1.15em;
          line-height: 1;
          margin-right: 0.03em;
        }

        .math-root > span:last-child {
          border-top: 1px solid currentColor;
          padding: 0 0.15em;
          line-height: 1.05;
        }

        /*
         * Superscript and subscript.
         */
        .math-inline sup,
        .math-equation sup,
        sup {
          font-size: 0.68em;
          line-height: 0;
          vertical-align: super;
        }

        .math-inline sub,
        .math-equation sub,
        sub {
          font-size: 0.68em;
          line-height: 0;
          vertical-align: sub;
        }

        /*
         * Equations.
         */
        .math-equation {
          display: inline-block;
          font-family:
            "Cambria Math",
            "STIX Two Math",
            "STIX Math",
            "Times New Roman",
            serif;
          letter-spacing: 0.01em;
        }

        /*
         * Keep mathematical HTML aligned nicely
         * with normal text.
         */
        .math-inline {
          display: inline;
        }

        /*
         * Paragraphs inside stored HTML.
         */
        .math-content p {
          margin: 0 0 0.75rem;
        }

        .math-content p:last-child {
          margin-bottom: 0;
        }

        /*
         * Prevent huge injected formatting.
         */
        .math-content {
          overflow-wrap: break-word;
          word-break: normal;
        }
      `}
    </style>
  );
};


/*
|--------------------------------------------------------------------------
| RESULT CARD
|--------------------------------------------------------------------------
*/

const ResultCard = ({
  label,
  value,
}) => {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <p className="text-xs uppercase tracking-wider text-slate-500">
        {label}
      </p>

      <p className="text-2xl font-bold text-blue-400 mt-2">
        {value}
      </p>
    </div>
  );
};


/*
|--------------------------------------------------------------------------
| MAIN COMPONENT
|--------------------------------------------------------------------------
*/

const CBTExam = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();

  const exam =
    location.state?.exam ??
    params.exam ??
    "";

  const suppliedSubjects =
    Array.isArray(location.state?.subjects)
      ? location.state.subjects
      : [];


  /*
  |--------------------------------------------------------------------------
  | STATE
  |--------------------------------------------------------------------------
  */

  const [loading, setLoading] =
    useState(true);

  const [loadingMessage, setLoadingMessage] =
    useState(
      "Loading your examination..."
    );

  const [fetchError, setFetchError] =
    useState("");

  const [
    questionsBySubject,
    setQuestionsBySubject,
  ] = useState({});

  const [
    selectedSubjects,
    setSelectedSubjects,
  ] = useState([]);

  const [activeSubject, setActiveSubject] =
    useState("");

  const [currentIndex, setCurrentIndex] =
    useState(0);

  const [answers, setAnswers] =
    useState({});

  const [marked, setMarked] =
    useState({});

  const [submitted, setSubmitted] =
    useState(false);

  const [endTime, setEndTime] =
    useState(null);

  const [timeLeft, setTimeLeft] =
    useState(
      EXAM_DURATION_MINUTES * 60
    );

  const [showNavigator, setShowNavigator] =
    useState(false);

  const [showCalculator, setShowCalculator] =
    useState(false);

  const [calculatorValue, setCalculatorValue] =
    useState("");


  /*
  |--------------------------------------------------------------------------
  | STORAGE KEY
  |--------------------------------------------------------------------------
  */

  const storageKey = useMemo(() => {
    if (!exam) {
      return "";
    }

    const subjectPart =
      suppliedSubjects
        .map((subject) =>
          normalize(subject)
            .replace(/[^a-z0-9]+/g, "-")
        )
        .filter(Boolean)
        .sort()
        .join("-");

    const examPart =
      normalize(exam)
        .replace(/[^a-z0-9]+/g, "-");

    return `scholiqen-cbt-session-${examPart}-${subjectPart || "all"}`;
  }, [
    exam,
    suppliedSubjects,
  ]);


  /*
  |--------------------------------------------------------------------------
  | LOAD QUESTIONS
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    let mounted = true;

    const loadQuestions = async () => {
      try {
        setLoading(true);
        setLoadingMessage(
          "Loading examination questions..."
        );
        setFetchError("");

        const PAGE_SIZE = 1000;

        let allDatabaseQuestions = [];
        let from = 0;

        while (true) {
          const to =
            from + PAGE_SIZE - 1;

          console.log(
            `Fetching CBT questions ${from} - ${to}`
          );

          const {
            data: pageData,
            error: pageError,
          } = await supabase
            .from("cbt_questions")
            .select("*")
            .range(from, to);

          if (pageError) {
            throw pageError;
          }

          const rows =
            Array.isArray(pageData)
              ? pageData
              : [];

          allDatabaseQuestions.push(
            ...rows
          );

          if (rows.length < PAGE_SIZE) {
            break;
          }

          from += PAGE_SIZE;
        }

        if (!mounted) {
          return;
        }

        console.log(
          "TOTAL DATABASE QUESTIONS:",
          allDatabaseQuestions.length
        );

        if (
          allDatabaseQuestions.length === 0
        ) {
          setFetchError(
            "The cbt_questions table returned no questions."
          );

          setQuestionsBySubject({});
          setSelectedSubjects([]);
          setLoading(false);

          return;
        }

        /*
         * Selected exam
         */
        const examQuestions =
          allDatabaseQuestions.filter(
            (row) =>
              examsMatch(
                row.exam,
                exam
              )
          );

        console.log(
          "SELECTED EXAM:",
          exam
        );

        console.log(
          "EXAM QUESTIONS:",
          examQuestions.length
        );

        if (examQuestions.length === 0) {
          const availableExams = [
            ...new Set(
              allDatabaseQuestions
                .map((row) =>
                  String(
                    row.exam ?? ""
                  ).trim()
                )
                .filter(Boolean)
            ),
          ];

          setFetchError(
            `No questions were found for "${exam}". Available exams: ${
              availableExams.join(", ") ||
              "None"
            }`
          );

          setQuestionsBySubject({});
          setSelectedSubjects([]);
          setLoading(false);

          return;
        }

        /*
         * Database subjects
         */
        const databaseSubjects = [
          ...new Set(
            examQuestions
              .map((row) =>
                String(
                  row.subject ?? ""
                ).trim()
              )
              .filter(Boolean)
          ),
        ];

        /*
         * Use supplied subjects if present.
         * Otherwise use all subjects for exam.
         */
        const subjectsToLoad =
          suppliedSubjects.length > 0
            ? suppliedSubjects
            : databaseSubjects;

        const uniqueSubjects = [];

        subjectsToLoad.forEach(
          (subject) => {
            const cleanSubject =
              String(
                subject ?? ""
              ).trim();

            if (!cleanSubject) {
              return;
            }

            const exists =
              uniqueSubjects.some(
                (existing) =>
                  subjectsMatch(
                    existing,
                    cleanSubject
                  )
              );

            if (!exists) {
              uniqueSubjects.push(
                cleanSubject
              );
            }
          }
        );

        /*
         * Restore session
         */
        let savedSession = null;

        if (
          !FORCE_FRESH_EXAM &&
          storageKey
        ) {
          try {
            const saved =
              localStorage.getItem(
                storageKey
              );

            if (saved) {
              savedSession =
                JSON.parse(saved);
            }
          } catch (error) {
            console.error(
              "READ SAVED SESSION ERROR:",
              error
            );

            savedSession = null;
          }
        }

        /*
         * Restore valid session
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

          const savedQuestionCount =
            savedSubjects.reduce(
              (total, subject) =>
                total +
                (
                  savedQuestions[
                    subject
                  ] || []
                ).length,
              0
            );

          const savedEndTime =
            Number(
              savedSession.endTime
            );

          const sessionExpired =
            savedEndTime <= Date.now();

          if (
            savedQuestionCount > 0 &&
            !sessionExpired
          ) {
            setQuestionsBySubject(
              savedQuestions
            );

            setSelectedSubjects(
              savedSubjects
            );

            setActiveSubject(
              savedSession.activeSubject ||
                savedSubjects[0]
            );

            setCurrentIndex(
              Math.max(
                0,
                Number(
                  savedSession.currentIndex ?? 0
                )
              )
            );

            setAnswers(
              savedSession.answers || {}
            );

            setMarked(
              savedSession.marked || {}
            );

            setSubmitted(
              Boolean(
                savedSession.submitted
              )
            );

            const remaining =
              Math.max(
                0,
                Math.floor(
                  (
                    savedEndTime -
                    Date.now()
                  ) / 1000
                )
              );

            setEndTime(savedEndTime);
            setTimeLeft(remaining);

            setLoadingMessage(
              "Restoring your examination..."
            );

            setLoading(false);

            return;
          }

          localStorage.removeItem(
            storageKey
          );

          savedSession = null;
        }

        /*
         * Create new question set
         */
        const grouped = {};
        const finalSubjects = [];

        uniqueSubjects.forEach(
          (selectedSubject) => {
            const matchingQuestions =
              examQuestions.filter(
                (row) =>
                  examsMatch(
                    row.exam,
                    exam
                  ) &&
                  subjectsMatch(
                    row.subject,
                    selectedSubject
                  )
              );

            const selectedQuestions =
              selectQuestionsKeepingComprehensionGroups(
                matchingQuestions,
                QUESTIONS_PER_SUBJECT
              );

            if (
              selectedQuestions.length > 0
            ) {
              grouped[
                selectedSubject
              ] = selectedQuestions;

              finalSubjects.push(
                selectedSubject
              );
            }
          }
        );

        const totalFinalQuestions =
          finalSubjects.reduce(
            (total, subject) =>
              total +
              (
                grouped[
                  subject
                ] || []
              ).length,
            0
          );

        if (
          finalSubjects.length === 0 ||
          totalFinalQuestions === 0
        ) {
          setQuestionsBySubject({});
          setSelectedSubjects([]);

          setFetchError(
            `No questions were found for the selected subjects under ${exam}: ${
              uniqueSubjects.join(", ") ||
              "None selected"
            }`
          );

          setLoading(false);

          return;
        }

        /*
         * New timer
         */
        const newEndTime =
          Date.now() +
          EXAM_DURATION_MINUTES *
            60 *
            1000;

        const newSession = {
          exam,
          subjects: finalSubjects,
          questionsBySubject: grouped,
          activeSubject: finalSubjects[0],
          currentIndex: 0,
          answers: {},
          marked: {},
          endTime: newEndTime,
          submitted: false,
        };

        if (storageKey) {
          try {
            localStorage.setItem(
              storageKey,
              JSON.stringify(
                newSession
              )
            );
          } catch (error) {
            console.error(
              "INITIAL SESSION SAVE ERROR:",
              error
            );
          }
        }

        setQuestionsBySubject(grouped);
        setSelectedSubjects(finalSubjects);
        setActiveSubject(finalSubjects[0]);
        setCurrentIndex(0);
        setAnswers({});
        setMarked({});
        setSubmitted(false);
        setEndTime(newEndTime);

        setTimeLeft(
          EXAM_DURATION_MINUTES * 60
        );
      } catch (error) {
        console.error(
          "CBT LOAD ERROR:",
          error
        );

        if (mounted) {
          setFetchError(
            error?.message ||
              "Unable to load CBT questions."
          );

          setQuestionsBySubject({});
          setSelectedSubjects([]);
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


  /*
  |--------------------------------------------------------------------------
  | SAVE SESSION
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (
      FORCE_FRESH_EXAM ||
      loading ||
      !storageKey ||
      selectedSubjects.length === 0 ||
      Object.keys(
        questionsBySubject
      ).length === 0
    ) {
      return;
    }

    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          exam,
          subjects: selectedSubjects,
          questionsBySubject,
          activeSubject,
          currentIndex,
          answers,
          marked,
          endTime,
          submitted,
        })
      );
    } catch (error) {
      console.error(
        "SAVE SESSION ERROR:",
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


  /*
  |--------------------------------------------------------------------------
  | TIMER
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (
      loading ||
      submitted ||
      !endTime
    ) {
      return undefined;
    }

    const updateTimer = () => {
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

      setTimeLeft(remaining);

      if (remaining <= 0) {
        setSubmitted(true);
        setShowNavigator(false);
        setShowCalculator(false);
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
    loading,
    submitted,
    endTime,
  ]);


  /*
  |--------------------------------------------------------------------------
  | TIME FORMAT
  |--------------------------------------------------------------------------
  */

  const formatTime = (seconds) => {
    const safeSeconds =
      Math.max(
        0,
        Number(seconds) || 0
      );

    const hours =
      Math.floor(
        safeSeconds / 3600
      );

    const minutes =
      Math.floor(
        (safeSeconds % 3600) / 60
      );

    const secs =
      safeSeconds % 60;

    return [
      hours,
      minutes,
      secs,
    ]
      .map((value) =>
        String(value).padStart(2, "0")
      )
      .join(":");
  };

  const timerDanger =
    timeLeft <= 10 * 60;

  const timerCritical =
    timeLeft <= 5 * 60;


  /*
  |--------------------------------------------------------------------------
  | CURRENT QUESTION
  |--------------------------------------------------------------------------
  */

  const currentQuestions =
    questionsBySubject[
      activeSubject
    ] || [];

  const currentQuestion =
    currentQuestions[
      currentIndex
    ];


  /*
  |--------------------------------------------------------------------------
  | CURRENT QUESTION CONTENT
  |--------------------------------------------------------------------------
  */

  const currentQuestionContent =
    useMemo(() => {
      if (!currentQuestion) {
        return {
          isComprehension: false,
          passage: "",
          question: "",
        };
      }

      const directPassage =
        getPassageValue(
          currentQuestion
        );

      const sharedPassage =
        getComprehensionPassage(
          currentQuestion,
          currentQuestions
        );

      return {
        isComprehension:
          isComprehensionQuestion(
            currentQuestion
          ),

        passage:
          sharedPassage ||
          directPassage ||
          "",

        question:
          getComprehensionQuestionText(
            currentQuestion
          ),
      };
    }, [
      currentQuestion,
      currentQuestions,
    ]);


  /*
  |--------------------------------------------------------------------------
  | TOTAL QUESTIONS
  |--------------------------------------------------------------------------
  */

  const totalQuestions =
    useMemo(() => {
      return selectedSubjects.reduce(
        (total, subject) =>
          total +
          (
            questionsBySubject[
              subject
            ] || []
          ).length,
        0
      );
    }, [
      selectedSubjects,
      questionsBySubject,
    ]);


  /*
  |--------------------------------------------------------------------------
  | GLOBAL QUESTION NUMBER
  |--------------------------------------------------------------------------
  */

  const getGlobalQuestionNumber = (
    subject,
    index
  ) => {
    let number = 0;

    for (
      const selectedSubject of
        selectedSubjects
    ) {
      if (
        subjectsMatch(
          selectedSubject,
          subject
        )
      ) {
        return (
          number +
          index +
          1
        );
      }

      number +=
        (
          questionsBySubject[
            selectedSubject
          ] || []
        ).length;
    }

    return index + 1;
  };


  /*
  |--------------------------------------------------------------------------
  | SELECT ANSWER
  |--------------------------------------------------------------------------
  */

  const selectAnswer = (option) => {
    if (
      !currentQuestion ||
      submitted
    ) {
      return;
    }

    setAnswers((previous) => ({
      ...previous,
      [currentQuestion.id]:
        option,
    }));
  };


  /*
  |--------------------------------------------------------------------------
  | MARK
  |--------------------------------------------------------------------------
  */

  const toggleMark = () => {
    if (
      !currentQuestion ||
      submitted
    ) {
      return;
    }

    setMarked((previous) => ({
      ...previous,
      [currentQuestion.id]:
        !previous[
          currentQuestion.id
        ],
    }));
  };


  /*
  |--------------------------------------------------------------------------
  | NEXT
  |--------------------------------------------------------------------------
  */

  const nextQuestion = () => {
    if (
      currentIndex <
      currentQuestions.length - 1
    ) {
      setCurrentIndex(
        (previous) =>
          previous + 1
      );

      return;
    }

    const position =
      selectedSubjects.findIndex(
        (subject) =>
          subjectsMatch(
            subject,
            activeSubject
          )
      );

    const nextSubject =
      selectedSubjects[
        position + 1
      ];

    if (nextSubject) {
      setActiveSubject(
        nextSubject
      );

      setCurrentIndex(0);
      setShowCalculator(false);
    }
  };


  /*
  |--------------------------------------------------------------------------
  | PREVIOUS
  |--------------------------------------------------------------------------
  */

  const previousQuestion = () => {
    if (currentIndex > 0) {
      setCurrentIndex(
        (previous) =>
          previous - 1
      );

      return;
    }

    const position =
      selectedSubjects.findIndex(
        (subject) =>
          subjectsMatch(
            subject,
            activeSubject
          )
      );

    const previousSubject =
      selectedSubjects[
        position - 1
      ];

    if (previousSubject) {
      const previousQuestions =
        questionsBySubject[
          previousSubject
        ] || [];

      setActiveSubject(
        previousSubject
      );

      setCurrentIndex(
        Math.max(
          previousQuestions.length - 1,
          0
        )
      );

      setShowCalculator(false);
    }
  };


  /*
  |--------------------------------------------------------------------------
  | CHANGE SUBJECT
  |--------------------------------------------------------------------------
  */

  const changeSubject = (subject) => {
    setActiveSubject(subject);
    setCurrentIndex(0);

    if (
      normalize(subject) !==
      "mathematics"
    ) {
      setShowCalculator(false);
    }
  };


  /*
  |--------------------------------------------------------------------------
  | CALCULATOR
  |--------------------------------------------------------------------------
  */

  const calculatorPress = (value) => {
    if (value === "C") {
      setCalculatorValue("");
      return;
    }

    if (value === "DEL") {
      setCalculatorValue(
        (previous) =>
          previous.slice(0, -1)
      );

      return;
    }

    if (value === "=") {
      try {
        const expression =
          calculatorValue
            .replace(/×/g, "*")
            .replace(/÷/g, "/")
            .replace(/−/g, "-");

        if (!expression.trim()) {
          return;
        }

        if (
          !/^[0-9+\-*/().\s]+$/.test(
            expression
          )
        ) {
          setCalculatorValue("Error");
          return;
        }

        /*
         * Calculator expression has already
         * been restricted to numeric operators.
         */
        const result =
          Function(
            `"use strict"; return (${expression})`
          )();

        if (
          typeof result === "number" &&
          Number.isFinite(result)
        ) {
          setCalculatorValue(
            String(
              Number(
                result.toFixed(10)
              )
            )
          );
        } else {
          setCalculatorValue("Error");
        }
      } catch {
        setCalculatorValue("Error");
      }

      return;
    }

    setCalculatorValue(
      (previous) =>
        previous === "Error"
          ? value
          : previous + value
    );
  };


  /*
  |--------------------------------------------------------------------------
  | SUBMIT
  |--------------------------------------------------------------------------
  */

  const submitExam = () => {
    const confirmed =
      window.confirm(
        "Are you sure you want to submit this examination?"
      );

    if (!confirmed) {
      return;
    }

    setSubmitted(true);
    setShowNavigator(false);
    setShowCalculator(false);
  };


  /*
  |--------------------------------------------------------------------------
  | ANSWER CHECK
  |--------------------------------------------------------------------------
  */

  const isAnswerCorrect =
    useCallback(
      (question) => {
        if (!question) {
          return false;
        }

        const selectedAnswer =
          answers[
            question.id
          ];

        const correctAnswer =
          getCorrectAnswerValue(
            question
          );

        if (
          selectedAnswer === undefined ||
          selectedAnswer === null ||
          !correctAnswer
        ) {
          return false;
        }

        const selected =
          normalize(
            selectedAnswer
          );

        const correct =
          normalize(
            correctAnswer
          );

        /*
         * Exact match.
         */
        if (selected === correct) {
          return true;
        }

        const optionMap =
          getQuestionOptionsMap(
            question
          );

        /*
         * Convert selected option text to letter.
         */
        let selectedLetter = "";

        for (
          const letter of [
            "A",
            "B",
            "C",
            "D",
          ]
        ) {
          if (
            normalize(
              optionMap[letter]
            ) === selected
          ) {
            selectedLetter =
              letter.toLowerCase();

            break;
          }
        }

        if (!selectedLetter) {
          selectedLetter =
            normalizeAnswerLetter(
              selected
            );
        }

        /*
         * Correct answer may be A/B/C/D.
         */
        let correctLetter =
          normalizeAnswerLetter(
            correct
          );

        /*
         * Correct answer may be option text.
         */
        if (
          ![
            "a",
            "b",
            "c",
            "d",
          ].includes(correctLetter)
        ) {
          for (
            const letter of [
              "A",
              "B",
              "C",
              "D",
            ]
          ) {
            if (
              normalize(
                optionMap[letter]
              ) === correct
            ) {
              correctLetter =
                letter.toLowerCase();

              break;
            }
          }
        }

        return (
          selectedLetter !== "" &&
          correctLetter !== "" &&
          selectedLetter ===
            correctLetter
        );
      },
      [answers]
    );


  /*
  |--------------------------------------------------------------------------
  | ALL QUESTIONS
  |--------------------------------------------------------------------------
  */

  const allQuestions =
    useMemo(() => {
      return selectedSubjects.flatMap(
        (subject) =>
          questionsBySubject[
            subject
          ] || []
      );
    }, [
      selectedSubjects,
      questionsBySubject,
    ]);


  /*
  |--------------------------------------------------------------------------
  | SCORE
  |--------------------------------------------------------------------------
  */

  const score =
    useMemo(() => {
      return allQuestions.filter(
        (question) =>
          isAnswerCorrect(question)
      ).length;
    }, [
      allQuestions,
      isAnswerCorrect,
    ]);


  /*
  |--------------------------------------------------------------------------
  | ANSWERED
  |--------------------------------------------------------------------------
  */

  const answeredCount =
    useMemo(() => {
      return allQuestions.filter(
        (question) => {
          const answer =
            answers[
              question.id
            ];

          return (
            answer !== undefined &&
            answer !== null &&
            String(answer).trim() !== ""
          );
        }
      ).length;
    }, [
      allQuestions,
      answers,
    ]);


  /*
  |--------------------------------------------------------------------------
  | LOCATION CHECK
  |--------------------------------------------------------------------------
  */

  if (
    !location.state &&
    !params.exam
  ) {
    return (
      <Navigate
        to="/cbt"
        replace
      />
    );
  }


  /*
  |--------------------------------------------------------------------------
  | LOADING
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <>
        <MathStyles />

        <div className="min-h-screen bg-[#071426] text-white flex items-center justify-center px-6">
          <div className="text-center max-w-xl w-full">

            <div className="relative w-16 h-16 mx-auto mb-6">

              <div className="absolute inset-0 rounded-2xl bg-blue-500/10 border border-blue-500/20" />

              <div className="absolute inset-2 rounded-xl border-2 border-blue-500/20 border-t-blue-400 animate-spin" />

            </div>

            <p className="text-xl font-bold">
              {loadingMessage}
            </p>

            <p className="text-sm text-slate-500 mt-2">
              Loading your questions,
              examination settings
              and saved progress.
            </p>

          </div>
        </div>
      </>
    );
  }


  /*
  |--------------------------------------------------------------------------
  | NO QUESTIONS
  |--------------------------------------------------------------------------
  */

  if (totalQuestions === 0) {
    return (
      <>
        <MathStyles />

        <div className="min-h-screen bg-[#071426] text-white flex items-center justify-center px-6">

          <div className="max-w-2xl w-full">

            <div className="rounded-3xl border border-red-500/20 bg-red-500/[0.04] p-8 md:p-10 text-center shadow-2xl">

              <div className="w-16 h-16 mx-auto rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">

                <AlertTriangle
                  size={30}
                  className="text-red-400"
                />

              </div>

              <h1 className="text-2xl md:text-3xl font-bold mt-6">
                No Questions Found
              </h1>

              <p className="text-slate-400 mt-3 leading-7">
                No questions could
                be found for the
                selected subjects
                under {exam}.
              </p>

              {fetchError && (
                <div className="mt-5 p-4 rounded-xl bg-red-500/5 border border-red-500/10 text-left">

                  <p className="text-xs uppercase tracking-wider text-red-400 font-bold">
                    Database Response
                  </p>

                  <p className="text-sm text-slate-300 mt-2 break-words">
                    {fetchError}
                  </p>

                </div>
              )}

              <button
                onClick={() =>
                  navigate("/cbt")
                }
                className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 font-semibold transition"
              >
                <ArrowLeft size={17} />
                Back to CBT
              </button>

            </div>

          </div>

        </div>
      </>
    );
  }


  /*
  |--------------------------------------------------------------------------
  | RESULT
  |--------------------------------------------------------------------------
  */

  if (submitted) {
    const percentage =
      totalQuestions > 0
        ? Math.round(
            (score /
              totalQuestions) *
              100
          )
        : 0;

    return (
      <>
        <MathStyles />

        <div className="min-h-screen bg-[#071426] text-white px-4 py-10">

          <div className="max-w-6xl mx-auto">

            <div className="text-center mb-10">

              <div className="w-20 h-20 mx-auto rounded-3xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">

                <Trophy
                  size={36}
                  className="text-blue-400"
                />

              </div>

              <h1 className="text-3xl md:text-4xl font-bold mt-5">
                Examination Complete
              </h1>

              <p className="text-slate-400 mt-2">
                {exam} CBT Examination
              </p>

              <p className="text-blue-400 text-sm mt-2">
                {selectedSubjects.join(
                  " • "
                )}
              </p>

              <p className="text-slate-500 text-xs mt-3">
                {totalQuestions} total
                questions
              </p>

              {timeLeft === 0 && (
                <p className="mt-3 text-red-400 text-sm font-semibold">
                  Time expired. Your
                  examination was
                  submitted
                  automatically.
                </p>
              )}

            </div>


            <div className="grid md:grid-cols-4 gap-4 mb-10">

              <ResultCard
                label="Score"
                value={`${score}/${totalQuestions}`}
              />

              <ResultCard
                label="Percentage"
                value={`${percentage}%`}
              />

              <ResultCard
                label="Answered"
                value={answeredCount}
              />

              <ResultCard
                label="Unanswered"
                value={
                  totalQuestions -
                  answeredCount
                }
              />

            </div>


            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">

              {selectedSubjects.map(
                (subject) => {
                  const subjectQuestions =
                    questionsBySubject[
                      subject
                    ] || [];

                  const subjectScore =
                    subjectQuestions.filter(
                      (question) =>
                        isAnswerCorrect(
                          question
                        )
                    ).length;

                  return (
                    <div
                      key={subject}
                      className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
                    >

                      <p className="text-sm text-slate-400">
                        {getSubjectDisplayName(
                          subject
                        )}
                      </p>

                      <p className="text-2xl font-bold text-blue-400 mt-2">
                        {subjectScore}/
                        {
                          subjectQuestions.length
                        }
                      </p>

                      <p className="text-xs text-slate-500 mt-1">
                        {subjectQuestions.length
                          ? Math.round(
                              (
                                subjectScore /
                                subjectQuestions.length
                              ) *
                                100
                            )
                          : 0}
                        %
                      </p>

                    </div>
                  );
                }
              )}

            </div>


            <div className="space-y-5">

              {allQuestions.map(
                (
                  question,
                  index
                ) => {
                  const correct =
                    isAnswerCorrect(
                      question
                    );

                  const selectedAnswer =
                    answers[
                      question.id
                    ];

                  const correctAnswer =
                    getCorrectAnswerValue(
                      question
                    );

                  const optionMap =
                    getQuestionOptionsMap(
                      question
                    );

                  const resultPassage =
                    getComprehensionPassage(
                      question,
                      allQuestions
                    );

                  const resultIsComprehension =
                    isComprehensionQuestion(
                      question
                    );

                  return (
                    <div
                      key={
                        question.id ||
                        index
                      }
                      className={`rounded-2xl border p-6 ${
                        correct
                          ? "bg-emerald-500/5 border-emerald-500/20"
                          : "bg-red-500/5 border-red-500/20"
                      }`}
                    >

                      <div className="flex items-start gap-4">

                        <div
                          className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center ${
                            correct
                              ? "bg-emerald-500/10 text-emerald-400"
                              : "bg-red-500/10 text-red-400"
                          }`}
                        >
                          {correct ? (
                            <CheckCircle2
                              size={20}
                            />
                          ) : (
                            <X size={20} />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">

                          <p className="text-xs text-slate-500 mb-2">
                            Question{" "}
                            {index + 1}
                          </p>

                          {question.subject && (
                            <p className="text-xs text-blue-400 mb-2">
                              {getSubjectDisplayName(
                                question.subject
                              )}
                            </p>
                          )}

                          {resultIsComprehension &&
                            resultPassage && (
                              <div className="mb-5 rounded-2xl border border-blue-500/20 bg-[#091a2e] overflow-hidden">

                                <div className="px-4 py-3 border-b border-blue-500/10 bg-blue-500/[0.05] flex items-center gap-2">

                                  <BookOpen
                                    size={15}
                                    className="text-blue-400"
                                  />

                                  <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                                    Comprehension
                                    Passage
                                  </span>

                                </div>

                                <div className="p-5 max-h-[420px] overflow-y-auto">

                                  <MathText
                                    className="math-content block text-sm md:text-base leading-7 text-slate-300 whitespace-pre-wrap"
                                  >
                                    {resultPassage}
                                  </MathText>

                                </div>

                              </div>
                            )}

                          <h2 className="font-semibold text-lg leading-7">

                            <MathText className="math-content">
                              {getComprehensionQuestionText(
                                question
                              )}
                            </MathText>

                          </h2>

                          {question.image && (
                            <img
                              src={
                                question.image
                              }
                              alt="Question"
                              className="max-w-full max-h-[350px] mt-5 rounded-xl object-contain border border-white/10"
                            />
                          )}

                          <div className="mt-4 space-y-2">

                            <p className="text-sm">

                              <span className="text-slate-500">
                                Your answer:
                              </span>{" "}

                              <span
                                className={
                                  correct
                                    ? "text-emerald-400"
                                    : "text-red-400"
                                }
                              >
                                {selectedAnswer ? (
                                  <MathText className="math-content">
                                    {selectedAnswer}
                                  </MathText>
                                ) : (
                                  "Not answered"
                                )}
                              </span>

                            </p>

                            {!correct && (
                              <p className="text-sm">

                                <span className="text-slate-500">
                                  Correct answer:
                                </span>{" "}

                                <span className="text-emerald-400">

                                  {correctAnswer ? (
                                    <MathText className="math-content">
                                      {correctAnswer}
                                    </MathText>
                                  ) : (
                                    "Not provided"
                                  )}

                                </span>

                              </p>
                            )}

                            <div className="mt-4 space-y-2">

                              {[
                                "A",
                                "B",
                                "C",
                                "D",
                              ].map(
                                (letter) => {
                                  const option =
                                    optionMap[
                                      letter
                                    ];

                                  if (!option) {
                                    return null;
                                  }

                                  return (
                                    <div
                                      key={
                                        letter
                                      }
                                      className="flex gap-3 text-sm text-slate-400"
                                    >

                                      <span className="font-bold text-slate-500">
                                        {letter}.
                                      </span>

                                      <MathText className="math-content">
                                        {option}
                                      </MathText>

                                    </div>
                                  );
                                }
                              )}

                            </div>

                            {question.reason && (
                              <div className="mt-4 p-4 rounded-xl bg-[#0b1b30] border border-white/10">

                                <p className="text-xs uppercase tracking-wider text-blue-400 font-semibold mb-2">
                                  Reason
                                </p>

                                <MathText className="math-content text-sm text-slate-300 leading-6">
                                  {question.reason}
                                </MathText>

                              </div>
                            )}

                          </div>

                        </div>

                      </div>

                    </div>
                  );
                }
              )}

            </div>


            <div className="flex justify-center mt-10">

              <button
                onClick={() => {
                  if (storageKey) {
                    localStorage.removeItem(
                      storageKey
                    );
                  }

                  window.location.reload();
                }}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 transition font-semibold"
              >

                <RotateCcw size={18} />

                Retake Examination

              </button>

            </div>

          </div>

        </div>
      </>
    );
  }


  /*
  |--------------------------------------------------------------------------
  | CURRENT DATA
  |--------------------------------------------------------------------------
  */

  const globalNumber =
    getGlobalQuestionNumber(
      activeSubject,
      currentIndex
    );

  const currentAnswer =
    currentQuestion
      ? answers[
          currentQuestion.id
        ]
      : null;

  const currentOptionMap =
    getQuestionOptionsMap(
      currentQuestion
    );

  const activeSubjectPosition =
    selectedSubjects.findIndex(
      (subject) =>
        subjectsMatch(
          subject,
          activeSubject
        )
    );

  const isMathematics =
    normalize(activeSubject) ===
    "mathematics";

  const isLastQuestionOfExam =
    activeSubjectPosition ===
      selectedSubjects.length - 1 &&
    currentIndex ===
      currentQuestions.length - 1;


  /*
  |--------------------------------------------------------------------------
  | RENDER
  |--------------------------------------------------------------------------
  */

  return (
    <>
      <MathStyles />

      <div className="min-h-screen bg-[#071426] text-white">

        {/* BACKGROUND */}

        <div className="fixed inset-0 pointer-events-none overflow-hidden">

          <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-600/[0.04] rounded-full blur-3xl" />

          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-indigo-600/[0.035] rounded-full blur-3xl" />

          <div
            className="absolute inset-0 opacity-[0.025]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
              backgroundSize:
                "28px 28px",
            }}
          />

        </div>


        {/* HEADER */}

        <header className="sticky top-0 z-50 bg-[#071426]/95 backdrop-blur-2xl border-b border-white/[0.08] shadow-2xl">

          <div className="max-w-[1600px] mx-auto px-4 md:px-7">

            <div className="h-[76px] grid grid-cols-[1fr_auto_1fr] items-center gap-4">

              <div className="flex items-center gap-4 min-w-0">

                <div className="flex items-center gap-2.5 shrink-0">

                  <div className="w-10 h-10 rounded-xl bg-blue-500/[0.08] border border-blue-400/20 flex items-center justify-center">

                    <div className="font-black text-blue-400">
                      COG
                    </div>

                  </div>

                  <div className="hidden sm:block">

                    <p className="font-bold text-base tracking-tight">
                      Scholiqen
                    </p>

                    <p className="text-[9px] uppercase tracking-[0.22em] text-slate-500">
                      Learning Portal
                    </p>

                  </div>

                </div>

                <div className="hidden md:block w-px h-9 bg-white/10" />

                <div
                  className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl border ${
                    timerCritical
                      ? "bg-red-500/10 border-red-500/30 text-red-400"
                      : timerDanger
                      ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                      : "bg-white/[0.035] border-white/10 text-slate-200"
                  }`}
                >

                  <Clock3
                    size={17}
                    className={
                      timerCritical
                        ? "text-red-400"
                        : timerDanger
                        ? "text-amber-400"
                        : "text-blue-400"
                    }
                  />

                  <div className="leading-none">

                    <p className="text-[8px] uppercase tracking-[0.18em] text-slate-500 mb-1">
                      Time Left
                    </p>

                    <p className="font-mono text-sm font-bold tracking-wider">
                      {formatTime(
                        timeLeft
                      )}
                    </p>

                  </div>

                </div>

              </div>


              <div className="text-center min-w-0">

                <p className="text-[10px] uppercase tracking-[0.25em] text-blue-400 font-semibold truncate">
                  {exam}
                </p>

                <h1 className="font-bold text-base md:text-lg mt-1 truncate">
                  CBT Examination
                </h1>

              </div>


              <div className="flex items-center justify-end gap-2">

                {isMathematics && (
                  <button
                    onClick={() =>
                      setShowCalculator(
                        (previous) =>
                          !previous
                      )
                    }
                    title="Open Mathematics Calculator"
                    className={`w-10 h-10 rounded-xl border flex items-center justify-center ${
                      showCalculator
                        ? "bg-blue-600 border-blue-400 text-white"
                        : "bg-white/[0.035] border-white/10 text-slate-300 hover:text-white hover:bg-white/[0.07]"
                    }`}
                  >
                    <Calculator size={18} />
                  </button>
                )}

                <button
                  onClick={() =>
                    setShowNavigator(true)
                  }
                  title="Question Navigator"
                  className="w-10 h-10 rounded-xl border border-white/10 bg-white/[0.035] text-slate-300 hover:text-white hover:bg-white/[0.07] transition flex items-center justify-center"
                >
                  <Grid3X3 size={18} />
                </button>

                <button
                  onClick={submitExam}
                  className="hidden sm:flex items-center gap-2 px-4 md:px-5 h-10 rounded-xl bg-blue-600 hover:bg-blue-500 transition font-semibold text-sm"
                >
                  Submit

                  <span className="hidden md:inline">
                    Exam
                  </span>
                </button>

                <button
                  onClick={() =>
                    setShowNavigator(true)
                  }
                  className="sm:hidden w-10 h-10 rounded-xl border border-white/10 bg-white/[0.035] flex items-center justify-center"
                >
                  <Menu size={18} />
                </button>

              </div>

            </div>

          </div>

        </header>


        {/* MAIN */}

        <main className="relative z-10 max-w-[1400px] mx-auto px-4 md:px-7 py-7">

          {/* SUBJECT TABS */}

          <div className="mb-6">

            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] backdrop-blur-xl p-2">

              <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">

                {selectedSubjects.map(
                  (subject) => {
                    const subjectQuestions =
                      questionsBySubject[
                        subject
                      ] || [];

                    const subjectAnswered =
                      subjectQuestions.filter(
                        (question) => {
                          const answer =
                            answers[
                              question.id
                            ];

                          return (
                            answer !== undefined &&
                            answer !== null &&
                            String(
                              answer
                            ).trim() !== ""
                          );
                        }
                      ).length;

                    const active =
                      subjectsMatch(
                        activeSubject,
                        subject
                      );

                    return (
                      <button
                        key={subject}
                        onClick={() =>
                          changeSubject(
                            subject
                          )
                        }
                        className={`relative shrink-0 min-w-[150px] px-5 py-3 rounded-xl text-sm font-semibold transition-all border ${
                          active
                            ? "bg-blue-600/15 border-blue-500/40 text-blue-300"
                            : "bg-transparent border-transparent text-slate-400 hover:text-white hover:bg-white/[0.04]"
                        }`}
                      >

                        <div className="flex items-center justify-center gap-2">

                          <span>
                            {getSubjectDisplayName(
                              subject
                            )}
                          </span>

                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded-md ${
                              active
                                ? "bg-blue-500/15 text-blue-300"
                                : "bg-white/[0.05] text-slate-500"
                            }`}
                          >
                            {subjectAnswered}/
                            {
                              subjectQuestions.length
                            }
                          </span>

                        </div>

                        {active && (
                          <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-0.5 rounded-full bg-blue-400" />
                        )}

                      </button>
                    );
                  }
                )}

              </div>

            </div>

          </div>


          {/* SUBJECT SUMMARY */}

          <div className="max-w-5xl mx-auto mb-6">

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">

              {selectedSubjects.map(
                (subject) => {
                  const count =
                    (
                      questionsBySubject[
                        subject
                      ] || []
                    ).length;

                  return (
                    <div
                      key={`summary-${subject}`}
                      className="rounded-xl border border-white/10 bg-white/[0.025] px-4 py-3"
                    >

                      <p className="text-xs text-slate-500 truncate">
                        {getSubjectDisplayName(
                          subject
                        )}
                      </p>

                      <p className="text-lg font-bold text-blue-400 mt-1">
                        {count}{" "}
                        <span className="text-xs text-slate-500 font-normal">
                          questions
                        </span>
                      </p>

                    </div>
                  );
                }
              )}

            </div>

          </div>


          {/* TOOLBAR */}

          <div className="max-w-5xl mx-auto mb-6">

            <div className="flex items-center justify-between gap-4">

              <div>

                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                  Current Subject
                </p>

                <h2 className="text-lg font-bold mt-1">
                  {getSubjectDisplayName(
                    activeSubject
                  )}
                </h2>

              </div>

              <button
                onClick={toggleMark}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-xs font-semibold ${
                  marked[
                    currentQuestion?.id
                  ]
                    ? "border-yellow-500/30 bg-yellow-500/10 text-yellow-400"
                    : "border-white/10 bg-white/[0.03] text-slate-400 hover:text-white"
                }`}
              >
                <Flag size={15} />

                {marked[
                  currentQuestion?.id
                ]
                  ? "Marked"
                  : "Mark Question"}
              </button>

            </div>

          </div>


          {/* CALCULATOR */}

          {showCalculator &&
            isMathematics && (
              <div className="fixed top-[88px] right-5 z-50 w-[330px] rounded-3xl border border-blue-400/20 bg-[#081a2f]/98 backdrop-blur-2xl shadow-2xl overflow-hidden">

                <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">

                  <div className="flex items-center gap-3">

                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-400/20 flex items-center justify-center">

                      <Calculator
                        size={19}
                        className="text-blue-400"
                      />

                    </div>

                    <div>

                      <p className="text-sm font-bold">
                        Scientific Calculator
                      </p>

                      <p className="text-[9px] text-blue-400 uppercase tracking-[0.18em] mt-1">
                        Mathematics
                      </p>

                    </div>

                  </div>

                  <button
                    onClick={() =>
                      setShowCalculator(false)
                    }
                    className="w-9 h-9 rounded-xl hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white"
                  >
                    <X size={17} />
                  </button>

                </div>

                <div className="p-5">

                  <input
                    value={calculatorValue}
                    readOnly
                    className="w-full h-16 bg-[#04101f] border border-white/10 rounded-2xl px-4 text-right text-2xl font-mono text-white outline-none"
                    placeholder="0"
                  />

                  <div className="grid grid-cols-4 gap-2 mt-4">

                    {[
                      "7",
                      "8",
                      "9",
                      "÷",
                      "4",
                      "5",
                      "6",
                      "×",
                      "1",
                      "2",
                      "3",
                      "−",
                      "0",
                      ".",
                      "(",
                      ")",
                      "C",
                      "DEL",
                      "+",
                      "=",
                    ].map(
                      (value) => (
                        <button
                          key={value}
                          onClick={() =>
                            calculatorPress(
                              value
                            )
                          }
                          className={`h-12 rounded-xl border font-semibold ${
                            value === "="
                              ? "bg-blue-600 hover:bg-blue-500 border-blue-400 text-white"
                              : value === "C" ||
                                value === "DEL"
                              ? "bg-red-500/10 hover:bg-red-500/20 border-red-500/20 text-red-300"
                              : "bg-white/[0.035] hover:bg-white/[0.08] border-white/10 text-slate-200"
                          }`}
                        >
                          {value === "DEL" ? (
                            <Delete
                              size={17}
                              className="mx-auto"
                            />
                          ) : (
                            value
                          )}
                        </button>
                      )
                    )}

                  </div>

                </div>

              </div>
            )}


          {/* QUESTION */}

          <div className="max-w-5xl mx-auto">

            <div className="rounded-3xl border border-white/[0.08] bg-white/[0.025] backdrop-blur-xl overflow-hidden shadow-2xl">

              <div className="px-5 md:px-8 py-5 border-b border-white/[0.07]">

                <div className="flex items-center justify-between gap-4">

                  <div className="flex items-center gap-3">

                    <div className="w-11 h-11 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold">
                      {globalNumber}
                    </div>

                    <div>

                      <p className="text-xs text-slate-500">
                        Question
                      </p>

                      <p className="text-sm font-semibold">
                        {getSubjectDisplayName(
                          activeSubject
                        )}
                      </p>

                    </div>

                  </div>

                  <div className="text-right">

                    <p className="text-[10px] uppercase tracking-wider text-slate-500">
                      Subject Progress
                    </p>

                    <p className="text-sm font-semibold mt-1">
                      {currentIndex + 1} /{" "}
                      {
                        currentQuestions.length
                      }
                    </p>

                  </div>

                </div>

              </div>


              <div className="p-5 md:p-8">

                {/* IMAGE */}

                {currentQuestion?.image && (
                  <div className="mb-6">

                    <img
                      src={
                        currentQuestion.image
                      }
                      alt="Question"
                      className="max-w-full max-h-[400px] mx-auto rounded-2xl object-contain border border-white/10"
                    />

                  </div>
                )}


                {/* COMPREHENSION PASSAGE */}

                {currentQuestionContent.isComprehension &&
                  currentQuestionContent.passage && (
                    <div className="mb-8 rounded-2xl border border-blue-500/20 bg-[#091a2e]/80 overflow-hidden shadow-xl">

                      <div className="px-5 md:px-6 py-4 border-b border-blue-500/10 bg-blue-500/[0.06]">

                        <div className="flex items-center justify-between gap-4">

                          <div className="flex items-center gap-3">

                            <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">

                              <BookOpen
                                size={17}
                                className="text-blue-400"
                              />

                            </div>

                            <div>

                              <p className="text-[10px] uppercase tracking-[0.2em] text-blue-400 font-bold">
                                Comprehension
                              </p>

                              <p className="text-sm font-semibold text-white mt-0.5">
                                Comprehension
                                Passage
                              </p>

                            </div>

                          </div>

                          <div className="text-right shrink-0">

                            <p className="text-[9px] uppercase tracking-wider text-slate-500">
                              Related
                              Questions
                            </p>

                            <p className="text-xs text-blue-400 font-semibold mt-1">

                              {(() => {
                                const comprehensionId =
                                  getComprehensionId(
                                    currentQuestion
                                  );

                                const currentName =
                                  getComprehensionName(
                                    currentQuestion
                                  );

                                if (
                                  comprehensionId
                                ) {
                                  const related =
                                    currentQuestions.filter(
                                      (
                                        question
                                      ) =>
                                        getComprehensionId(
                                          question
                                        ) ===
                                        comprehensionId
                                    ).length;

                                  return `${related} question${
                                    related === 1
                                      ? ""
                                      : "s"
                                  }`;
                                }

                                if (
                                  currentName
                                ) {
                                  const related =
                                    currentQuestions.filter(
                                      (
                                        question
                                      ) =>
                                        comprehensionNamesMatch(
                                          getComprehensionName(
                                            question
                                          ),
                                          currentName
                                        )
                                    ).length;

                                  return `${related} question${
                                    related === 1
                                      ? ""
                                      : "s"
                                  }`;
                                }

                                return "Passage";
                              })()}

                            </p>

                          </div>

                        </div>

                      </div>

                      <div className="p-5 md:p-7 max-h-[480px] overflow-y-auto overscroll-contain">

                        <MathText
                          className="math-content block text-[15px] md:text-base leading-8 text-slate-300 whitespace-pre-wrap"
                        >
                          {
                            currentQuestionContent.passage
                          }
                        </MathText>

                      </div>

                    </div>
                  )}


                {/* QUESTION TEXT */}

                <div>

                  {currentQuestionContent.isComprehension && (
                    <div className="flex items-center gap-2 mb-3">

                      <span className="text-[10px] uppercase tracking-[0.18em] text-slate-500 font-bold">
                        Question
                      </span>

                      <span className="w-1 h-1 rounded-full bg-blue-400" />

                    </div>
                  )}

                  <MathText className="math-content block text-lg md:text-xl font-semibold leading-8 text-white whitespace-pre-wrap">
                    {
                      currentQuestionContent.question
                    }
                  </MathText>

                </div>


                {/* OPTIONS */}

                <div className="mt-8 space-y-3">

                  {[
                    "A",
                    "B",
                    "C",
                    "D",
                  ].map(
                    (letter) => {
                      const option =
                        currentOptionMap[
                          letter
                        ];

                      if (!option) {
                        return null;
                      }

                      const selected =
                        normalize(
                          currentAnswer
                        ) ===
                        normalize(
                          option
                        );

                      return (
                        <button
                          key={`${currentQuestion?.id}-${letter}`}
                          onClick={() =>
                            selectAnswer(
                              option
                            )
                          }
                          className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center gap-4 ${
                            selected
                              ? "border-blue-500/60 bg-blue-500/10"
                              : "border-white/10 bg-white/[0.02] hover:bg-white/[0.05]"
                          }`}
                        >

                          <span
                            className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                              selected
                                ? "bg-blue-600 text-white"
                                : "bg-[#102238] text-slate-400"
                            }`}
                          >
                            {letter}
                          </span>

                          <MathText
                            className={`math-content ${
                              selected
                                ? "text-white"
                                : "text-slate-300"
                            }`}
                          >
                            {option}
                          </MathText>

                          {selected && (
                            <CheckCircle2
                              className="ml-auto text-blue-400 shrink-0"
                              size={20}
                            />
                          )}

                        </button>
                      );
                    }
                  )}

                </div>


                {/* NO OPTIONS */}

                {Object.values(
                  currentOptionMap
                ).filter(Boolean).length ===
                  0 && (
                  <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/5 p-5">

                    <div className="flex items-start gap-3">

                      <AlertTriangle
                        size={20}
                        className="text-red-400 shrink-0"
                      />

                      <div>

                        <p className="font-semibold text-red-300">
                          No options found
                        </p>

                        <p className="text-sm text-red-300/70 mt-1">
                          This database
                          question has
                          no readable
                          options.
                        </p>

                        <p className="text-xs text-slate-500 mt-2">
                          Expected database
                          format:
                        </p>

                        <pre className="mt-2 text-[10px] text-blue-300 bg-black/20 rounded-lg p-3 overflow-auto">
{`{
  "A": "Option A",
  "B": "Option B",
  "C": "Option C",
  "D": "Option D"
}`}
                        </pre>

                        <details className="mt-3">

                          <summary className="cursor-pointer text-xs text-slate-500">
                            View database
                            record
                          </summary>

                          <pre className="mt-3 text-[10px] text-slate-500 overflow-auto whitespace-pre-wrap">
                            {JSON.stringify(
                              currentQuestion,
                              null,
                              2
                            )}
                          </pre>

                        </details>

                      </div>

                    </div>

                  </div>
                )}

              </div>

            </div>


            {/* NAVIGATION */}

            <div className="flex items-center justify-between gap-3 mt-5">

              <button
                onClick={
                  previousQuestion
                }
                disabled={
                  currentIndex === 0 &&
                  activeSubjectPosition === 0
                }
                className="flex items-center gap-2 px-5 py-3 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.07] disabled:opacity-30 disabled:cursor-not-allowed transition font-semibold text-sm"
              >

                <ChevronLeft size={18} />

                Previous

              </button>


              <button
                onClick={() =>
                  setShowNavigator(true)
                }
                className="flex items-center gap-2 px-4 py-3 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.07] transition text-sm font-semibold"
              >

                <Grid3X3 size={17} />

                Questions

              </button>


              {isLastQuestionOfExam ? (

                <button
                  onClick={submitExam}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 transition font-semibold text-sm"
                >

                  Submit Exam

                  <CheckCircle2 size={18} />

                </button>

              ) : (

                <button
                  onClick={nextQuestion}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 transition font-semibold text-sm"
                >

                  Next

                  <ChevronRight size={18} />

                </button>

              )}

            </div>

          </div>

        </main>


        {/* QUESTION NAVIGATOR */}

        {showNavigator && (
          <>

            <div
              onClick={() =>
                setShowNavigator(false)
              }
              className="fixed inset-0 z-[55] bg-black/40 backdrop-blur-[2px]"
            />

            <aside className="fixed right-4 top-20 z-[60] w-[330px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-105px)] overflow-y-auto rounded-2xl border border-white/10 bg-[#0a1b30]/98 backdrop-blur-2xl shadow-2xl">

              <div className="sticky top-0 z-10 bg-[#0a1b30]/98 backdrop-blur-xl border-b border-white/10 p-4 flex items-center justify-between">

                <div>

                  <h3 className="font-semibold">
                    Question Navigator
                  </h3>

                  <p className="text-xs text-slate-500 mt-1">
                    {answeredCount}/
                    {totalQuestions}{" "}
                    answered
                  </p>

                </div>

                <button
                  onClick={() =>
                    setShowNavigator(false)
                  }
                  className="p-2 rounded-lg hover:bg-white/10"
                >
                  <X size={18} />
                </button>

              </div>


              <div className="p-4">

                {selectedSubjects.map(
                  (subject) => {
                    const subjectQuestions =
                      questionsBySubject[
                        subject
                      ] || [];

                    const subjectAnswered =
                      subjectQuestions.filter(
                        (question) => {
                          const answer =
                            answers[
                              question.id
                            ];

                          return (
                            answer !== undefined &&
                            answer !== null &&
                            String(
                              answer
                            ).trim() !== ""
                          );
                        }
                      ).length;

                    return (
                      <div
                        key={subject}
                        className="mb-6"
                      >

                        <div className="flex items-center justify-between mb-3">

                          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                            {getSubjectDisplayName(
                              subject
                            )}
                          </p>

                          <span className="text-[10px] text-slate-600">
                            {subjectAnswered}/
                            {
                              subjectQuestions.length
                            }
                          </span>

                        </div>


                        <div className="grid grid-cols-5 gap-2">

                          {subjectQuestions.map(
                            (
                              question,
                              index
                            ) => {
                              const selected =
                                answers[
                                  question.id
                                ];

                              const markedQuestion =
                                marked[
                                  question.id
                                ];

                              const isCurrent =
                                subjectsMatch(
                                  subject,
                                  activeSubject
                                ) &&
                                index ===
                                  currentIndex;

                              const isComprehension =
                                isComprehensionQuestion(
                                  question
                                );

                              return (
                                <button
                                  key={
                                    question.id ||
                                    `${subject}-${index}`
                                  }
                                  onClick={() => {
                                    setActiveSubject(
                                      subject
                                    );

                                    setCurrentIndex(
                                      index
                                    );

                                    setShowNavigator(
                                      false
                                    );
                                  }}
                                  title={
                                    isComprehension
                                      ? "Comprehension question"
                                      : "Question"
                                  }
                                  className={`relative aspect-square rounded-xl text-xs font-semibold border transition ${
                                    isCurrent
                                      ? "bg-blue-600 border-blue-400 text-white"
                                      : selected
                                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                                      : "bg-[#102238] border-white/10 text-slate-400 hover:bg-[#17304d]"
                                  }`}
                                >

                                  {index + 1}

                                  {isComprehension && (
                                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-blue-400" />
                                  )}

                                  {markedQuestion && (
                                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-yellow-400" />
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


              <div className="border-t border-white/10 p-4">

                <div className="grid grid-cols-2 gap-3 text-[10px] text-slate-500">

                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded bg-blue-600" />
                    Current
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded bg-emerald-500/20 border border-emerald-500/30" />
                    Answered
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded bg-[#102238] border border-white/10" />
                    Unanswered
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-yellow-400" />
                    Marked
                  </div>

                  <div className="flex items-center gap-2 col-span-2">
                    <span className="w-3 h-3 rounded-full bg-blue-400" />
                    Comprehension
                  </div>

                </div>

              </div>

            </aside>

          </>
        )}

      </div>
    </>
  );
};

export default CBTExam;
