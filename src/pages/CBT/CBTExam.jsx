import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useLocation,
  Navigate,
} from "react-router-dom";

import {
  ChevronLeft,
  ChevronRight,
  Grid3X3,
  Calculator,
  X,
  CheckCircle2,
  Flag,
  Trophy,
  RotateCcw,
  Clock3,
  Menu,
  AlertTriangle,
  RefreshCw,
  Delete,
} from "lucide-react";

import { supabase } from "../../lib/supabaseClient";
import cogLogo from "../../assets/cog.png";

/* ============================================================================
   CONFIG
============================================================================ */

const QUESTIONS_PER_SUBJECT = 40;
const EXAM_DURATION_MINUTES = 120;

const FORCE_FRESH_EXAM = true;

/*
 * Supabase commonly limits a single response.
 * We therefore fetch cbt_questions in batches.
 */
const DATABASE_PAGE_SIZE = 1000;

/* ============================================================================
   NORMALIZE
============================================================================ */

const normalize = (value) =>
  String(value ?? "")
    .replace(/\u00a0/g, " ")
    .replace(/\r\n/g, " ")
    .replace(/\n/g, " ")
    .replace(/\t/g, " ")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();

const normalizeExam = (value) =>
  normalize(value);

const normalizeSubject = (value) =>
  normalize(value);

/* ============================================================================
   SUBJECT ALIASES
============================================================================ */

const SUBJECT_ALIASES = {
  english: "english language",
  "english language": "english language",

  math: "mathematics",
  maths: "mathematics",
  mathematics: "mathematics",

  chem: "chemistry",
  chemistry: "chemistry",

  bio: "biology",
  biology: "biology",

  phy: "physics",
  physics: "physics",

  econ: "economics",
  economics: "economics",

  govt: "government",
  government: "government",

  lit: "literature in english",
  literature: "literature in english",
  "literature in english":
    "literature in english",

  crs: "christian religious studies",
  "christian religious studies":
    "christian religious studies",

  irs: "islamic religious studies",
  "islamic religious studies":
    "islamic religious studies",

  commerce: "commerce",

  accounting: "financial accounting",
  "financial accounting":
    "financial accounting",

  agric: "agricultural science",
  agriculture: "agricultural science",
  "agricultural science":
    "agricultural science",

  geography: "geography",

  history: "history",

  civic: "civic education",
  "civic education":
    "civic education",

  "data processing":
    "data processing",

  computer: "computer studies",
  "computer studies":
    "computer studies",

  "technical drawing":
    "technical drawing",

  "home economics":
    "home economics",

  "visual art": "visual arts",
  "visual arts": "visual arts",

  music: "music",

  "physical education":
    "physical education",

  "physical education and health":
    "physical education",
};

/* ============================================================================
   CANONICAL SUBJECT
============================================================================ */

const canonicalSubject = (value) => {
  const normalized =
    normalizeSubject(value);

  return (
    SUBJECT_ALIASES[
      normalized
    ] || normalized
  );
};

/* ============================================================================
   SUBJECT MATCH
============================================================================ */

const subjectsMatch = (
  first,
  second
) => {
  const a =
    canonicalSubject(first);

  const b =
    canonicalSubject(second);

  if (!a || !b) {
    return false;
  }

  if (a === b) {
    return true;
  }

  const aWithoutLanguage =
    a.replace(
      /\s+language$/i,
      ""
    );

  const bWithoutLanguage =
    b.replace(
      /\s+language$/i,
      ""
    );

  return (
    aWithoutLanguage ===
    bWithoutLanguage
  );
};

/* ============================================================================
   SHUFFLE
============================================================================ */

const shuffleQuestions = (
  questions
) => {
  const shuffled = [
    ...questions,
  ];

  for (
    let i =
      shuffled.length - 1;
    i > 0;
    i--
  ) {
    const j =
      Math.floor(
        Math.random() *
          (i + 1)
      );

    [
      shuffled[i],
      shuffled[j],
    ] = [
      shuffled[j],
      shuffled[i],
    ];
  }

  return shuffled;
};

/* ============================================================================
   DISPLAY SUBJECT
============================================================================ */

const getSubjectDisplayName = (
  subject
) =>
  String(
    subject ?? ""
  ).trim();

/* ============================================================================
   OPTIONS
============================================================================ */

const getQuestionOptions = (
  question
) => {
  if (!question) {
    return [];
  }

  const directOptions = [
    question.optionA,
    question.optionB,
    question.optionC,
    question.optionD,
  ];

  const cleanedDirectOptions =
    directOptions.map(
      (option) =>
        option === null ||
        option === undefined
          ? ""
          : String(
              option
            ).trim()
    );

  if (
    cleanedDirectOptions.every(
      Boolean
    )
  ) {
    return cleanedDirectOptions;
  }

  if (
    question.options &&
    typeof question.options ===
      "object" &&
    !Array.isArray(
      question.options
    )
  ) {
    const options =
      question.options;

    return [
      options.A ??
        options.a ??
        options.optionA,

      options.B ??
        options.b ??
        options.optionB,

      options.C ??
        options.c ??
        options.optionC,

      options.D ??
        options.d ??
        options.optionD,
    ]
      .map((option) =>
        option === null ||
        option === undefined
          ? ""
          : String(
              option
            ).trim()
      )
      .filter(Boolean);
  }

  if (
    typeof question.options ===
    "string"
  ) {
    const raw =
      question.options.trim();

    if (!raw) {
      return [];
    }

    try {
      const parsed =
        JSON.parse(raw);

      if (
        Array.isArray(parsed)
      ) {
        return parsed
          .map((option) =>
            option === null ||
            option === undefined
              ? ""
              : String(
                  option
                ).trim()
          )
          .filter(Boolean)
          .slice(0, 4);
      }

      if (
        parsed &&
        typeof parsed ===
          "object"
      ) {
        return [
          parsed.A ??
            parsed.a ??
            parsed.optionA,

          parsed.B ??
            parsed.b ??
            parsed.optionB,

          parsed.C ??
            parsed.c ??
            parsed.optionC,

          parsed.D ??
            parsed.d ??
            parsed.optionD,
        ]
          .map((option) =>
            option === null ||
            option === undefined
              ? ""
              : String(
                  option
                ).trim()
          )
          .filter(Boolean);
      }
    } catch {
      if (
        raw.includes("\n")
      ) {
        return raw
          .split(/\r?\n/)
          .map((item) =>
            item
              .replace(
                /^[A-Da-d][.)]\s*/,
                ""
              )
              .trim()
          )
          .filter(Boolean)
          .slice(0, 4);
      }
    }
  }

  return [];
};

/* ============================================================================
   CORRECT ANSWER
============================================================================ */

const getCorrectAnswerValue = (
  question
) => {
  if (!question) {
    return "";
  }

  return (
    question.answer ??
    question.correct_answer ??
    question.correctAnswer ??
    question.correct_option ??
    question.correctOption ??
    ""
  );
};

/* ============================================================================
   STORAGE
============================================================================ */

const createStorageKey = (
  exam,
  subjects
) => {
  const subjectKey =
    [...subjects]
      .map((subject) =>
        canonicalSubject(
          subject
        )
      )
      .sort()
      .join("|");

  return `scholiqen-cbt-session-${normalizeExam(
    exam
  )}-${subjectKey}`;
};

/* ============================================================================
   MATH
============================================================================ */

const SUPERCHARS = {
  0: "⁰",
  1: "¹",
  2: "²",
  3: "³",
  4: "⁴",
  5: "⁵",
  6: "⁶",
  7: "⁷",
  8: "⁸",
  9: "⁹",
  "+": "⁺",
  "-": "⁻",
  "=": "⁼",
  "(": "⁽",
  ")": "⁾",
  a: "ᵃ",
  b: "ᵇ",
  c: "ᶜ",
  d: "ᵈ",
  e: "ᵉ",
  f: "ᶠ",
  g: "ᵍ",
  h: "ʰ",
  i: "ⁱ",
  j: "ʲ",
  k: "ᵏ",
  l: "ˡ",
  m: "ᵐ",
  n: "ⁿ",
  o: "ᵒ",
  p: "ᵖ",
  r: "ʳ",
  s: "ˢ",
  t: "ᵗ",
  u: "ᵘ",
  v: "ᵛ",
  w: "ʷ",
  x: "ˣ",
  y: "ʸ",
  z: "ᶻ",
};

const convertMathEntities = (
  text
) =>
  String(text ?? "")
    .replace(
      /&sup1;|&#185;|&#xB9;/gi,
      "¹"
    )
    .replace(
      /&sup2;|&#178;|&#xB2;/gi,
      "²"
    )
    .replace(
      /&sup3;|&#179;|&#xB3;/gi,
      "³"
    )
    .replace(
      /&plusmn;|&#177;|&#xB1;/gi,
      "±"
    )
    .replace(
      /&minus;|&#8722;|&#x2212;/gi,
      "−"
    )
    .replace(
      /&times;|&#215;|&#xD7;/gi,
      "×"
    )
    .replace(
      /&divide;|&#247;|&#xF7;/gi,
      "÷"
    )
    .replace(
      /&nbsp;|&#160;/gi,
      " "
    );

const toSuperscript = (
  value
) =>
  String(value)
    .split("")
    .map(
      (character) =>
        SUPERCHARS[
          character
        ] ?? character
    )
    .join("");

const convertPowers = (
  text
) => {
  let value =
    convertMathEntities(
      text
    );

  value = value.replace(
    /<sup\b[^>]*>([\s\S]*?)<\/sup>/gi,
    (_, exponent) =>
      toSuperscript(
        String(
          exponent
        )
          .replace(
            /<[^>]+>/g,
            ""
          )
          .trim()
      )
  );

  value = value.replace(
    /\^\{([^{}]+)\}/g,
    (_, exponent) =>
      toSuperscript(
        exponent
      )
  );

  value = value.replace(
    /\^(-?\d+(?:\.\d+)?)/g,
    (_, exponent) =>
      toSuperscript(
        exponent
      )
  );

  value = value.replace(
    /\^([A-Za-z])/g,
    (_, exponent) =>
      toSuperscript(
        exponent
      )
  );

  return value;
};

/* ============================================================================
   MATH TEXT
============================================================================ */

const MathText = ({
  children,
  className = "",
}) => {
  if (
    children === null ||
    children === undefined
  ) {
    return null;
  }

  const text =
    String(children);

  const fractionPattern =
    /<span\s+class=["']math-fraction["']>\s*<span>(.*?)<\/span>\s*<span>(.*?)<\/span>\s*<\/span>/gis;

  const parts = [];

  let lastIndex = 0;
  let match;

  while (
    (match =
      fractionPattern.exec(
        text
      )) !== null
  ) {
    if (
      match.index >
      lastIndex
    ) {
      parts.push(
        <React.Fragment
          key={`math-${lastIndex}`}
        >
          {convertPowers(
            text.slice(
              lastIndex,
              match.index
            )
          )}
        </React.Fragment>
      );
    }

    parts.push(
      <span
        key={`fraction-${match.index}`}
        className="math-fraction inline-flex flex-col items-center align-middle mx-1 leading-none"
      >
        <span className="px-1">
          {convertPowers(
            match[1]
          )}
        </span>

        <span className="w-full border-t border-current my-0.5" />

        <span className="px-1">
          {convertPowers(
            match[2]
          )}
        </span>
      </span>
    );

    lastIndex =
      match.index +
      match[0].length;
  }

  if (
    lastIndex < text.length
  ) {
    parts.push(
      <React.Fragment
        key={`math-last-${lastIndex}`}
      >
        {convertPowers(
          text.slice(
            lastIndex
          )
        )}
      </React.Fragment>
    );
  }

  if (
    parts.length === 0
  ) {
    return (
      <span
        className={
          className
        }
      >
        {convertPowers(
          text
        )}
      </span>
    );
  }

  return (
    <span
      className={
        className
      }
    >
      {parts}
    </span>
  );
};

/* ============================================================================
   CBT EXAM
============================================================================ */

const CBTExam = () => {
  const location =
    useLocation();

  const exam =
    location.state?.exam;

  /*
   * Subjects selected on the previous page.
   */
  const suppliedSubjects =
    Array.isArray(
      location.state?.subjects
    )
      ? location.state.subjects
          .map((subject) =>
            String(
              subject ?? ""
            ).trim()
          )
          .filter(Boolean)
      : [];

  /* ==========================================================================
     STATE
  ========================================================================== */

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

  const [
    answers,
    setAnswers,
  ] = useState({});

  const [
    marked,
    setMarked,
  ] = useState({});

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    loadingMessage,
    setLoadingMessage,
  ] = useState(
    "Loading questions..."
  );

  const [
    submitted,
    setSubmitted,
  ] = useState(false);

  const [
    fetchError,
    setFetchError,
  ] = useState("");

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
    endTime,
    setEndTime,
  ] = useState(null);

  const [
    timeLeft,
    setTimeLeft,
  ] = useState(
    EXAM_DURATION_MINUTES *
      60
  );

  /* ==========================================================================
     STORAGE KEY
  ========================================================================== */

  const storageKey =
    useMemo(() => {
      if (
        !exam ||
        suppliedSubjects.length ===
          0
      ) {
        return null;
      }

      return createStorageKey(
        exam,
        suppliedSubjects
      );
    }, [
      exam,
      suppliedSubjects.join("|"),
    ]);

  /* ==========================================================================
     CLEAR OLD SESSION
  ========================================================================== */

  useEffect(() => {
    if (
      FORCE_FRESH_EXAM &&
      storageKey
    ) {
      localStorage.removeItem(
        storageKey
      );
    }
  }, [storageKey]);

  /* ==========================================================================
     LOAD ALL DATABASE QUESTIONS
  ========================================================================== */

  useEffect(() => {
    let mounted = true;

    const loadQuestions =
      async () => {
        if (!exam) {
          if (mounted) {
            setLoading(false);
          }

          return;
        }

        try {
          setLoading(true);
          setFetchError("");

          setLoadingMessage(
            `Loading ${exam} questions...`
          );

          console.log(
            "================================================"
          );

          console.log(
            "SCHOLIQEN CBT QUESTION LOAD"
          );

          console.log(
            "EXAM:",
            exam
          );

          console.log(
            "SELECTED SUBJECTS:",
            suppliedSubjects
          );

          console.log(
            "================================================"
          );

          /* ==========================================================
             FETCH DATABASE IN BATCHES
          ========================================================== */

          let allRows = [];
          let from = 0;

          while (true) {
            const to =
              from +
              DATABASE_PAGE_SIZE -
              1;

            console.log(
              `Fetching cbt_questions rows ${from} - ${to}`
            );

            const {
              data,
              error,
            } = await supabase
              .from(
                "cbt_questions"
              )
              .select("*")
              .range(
                from,
                to
              );

            if (error) {
              console.error(
                "SUPABASE ERROR:",
                error
              );

              throw error;
            }

            const batch =
              Array.isArray(data)
                ? data
                : [];

            console.log(
              `Received ${batch.length} rows`
            );

            allRows.push(
              ...batch
            );

            /*
             * Last page reached.
             */
            if (
              batch.length <
              DATABASE_PAGE_SIZE
            ) {
              break;
            }

            from +=
              DATABASE_PAGE_SIZE;
          }

          console.log(
            "TOTAL DATABASE ROWS FETCHED:",
            allRows.length
          );

          /* ==========================================================
             FILTER EXAM
          ========================================================== */

          const examQuestions =
            allRows.filter(
              (row) =>
                normalizeExam(
                  row.exam
                ) ===
                normalizeExam(
                  exam
                )
            );

          console.log(
            "QUESTIONS FOR CURRENT EXAM:",
            examQuestions.length
          );

          /* ==========================================================
             DATABASE SUBJECTS
          ========================================================== */

          const databaseSubjects = [
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
            "DATABASE SUBJECTS FOR CURRENT EXAM:",
            databaseSubjects
          );

          /* ==========================================================
             IMPORTANT FIX

             NEVER replace the selected subjects with all database
             subjects.

             If user selected:
             English + Mathematics + Chemistry + Physics

             we load exactly those four.

             If no subjects were supplied, then we fall back to
             every subject available for the exam.
          ========================================================== */

          let subjectsToLoad =
            suppliedSubjects.length >
            0
              ? [
                  ...suppliedSubjects,
                ]
              : [
                  ...databaseSubjects,
                ];

          /* ==========================================================
             REMOVE DUPLICATES
          ========================================================== */

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

              const alreadyExists =
                uniqueSubjects.some(
                  (existing) =>
                    subjectsMatch(
                      existing,
                      cleanSubject
                    )
                );

              if (
                !alreadyExists
              ) {
                uniqueSubjects.push(
                  cleanSubject
                );
              }
            }
          );

          console.log(
            "FINAL SUBJECTS TO LOAD:",
            uniqueSubjects
          );

          /* ==========================================================
             GROUP QUESTIONS
          ========================================================== */

          const grouped = {};

          const finalSubjects = [];

          uniqueSubjects.forEach(
            (selectedSubject) => {
              const matchingQuestions =
                examQuestions.filter(
                  (row) =>
                    subjectsMatch(
                      row.subject,
                      selectedSubject
                    )
                );

              console.log(
                "--------------------------------------------"
              );

              console.log(
                "SELECTED SUBJECT:",
                selectedSubject
              );

              console.log(
                "CANONICAL SUBJECT:",
                canonicalSubject(
                  selectedSubject
                )
              );

              console.log(
                "MATCHING QUESTIONS:",
                matchingQuestions.length
              );

              /*
               * Show exactly what subject names exist in the DB
               * for this selection.
               */
              const matchedNames = [
                ...new Set(
                  matchingQuestions.map(
                    (row) =>
                      String(
                        row.subject ??
                          ""
                      ).trim()
                  )
                ),
              ];

              console.log(
                "MATCHED DATABASE SUBJECT NAMES:",
                matchedNames
              );

              /* ========================================================
                 SHUFFLE + TAKE 40
              ======================================================== */

              const selectedQuestions =
                shuffleQuestions(
                  matchingQuestions
                ).slice(
                  0,
                  QUESTIONS_PER_SUBJECT
                );

              /*
               * IMPORTANT:
               * Use the selected subject as the object key.
               */
              grouped[
                selectedSubject
              ] =
                selectedQuestions;

              if (
                selectedQuestions.length >
                0
              ) {
                finalSubjects.push(
                  selectedSubject
                );
              }

              console.log(
                `${selectedSubject}: ${selectedQuestions.length} questions selected`
              );
            }
          );

          /* ==========================================================
             DEBUG FINAL DATA
          ========================================================== */

          console.log(
            "================================================"
          );

          console.log(
            "FINAL CBT QUESTION BREAKDOWN"
          );

          finalSubjects.forEach(
            (subject) => {
              console.log(
                subject,
                "=>",
                grouped[
                  subject
                ]?.length || 0
              );
            }
          );

          const totalFinalQuestions =
            finalSubjects.reduce(
              (
                total,
                subject
              ) =>
                total +
                (
                  grouped[
                    subject
                  ] || []
                ).length,
              0
            );

          console.log(
            "TOTAL FINAL QUESTIONS:",
            totalFinalQuestions
          );

          console.log(
            "================================================"
          );

          /* ==========================================================
             SUBJECTS WITH ZERO QUESTIONS
          ========================================================== */

          const missingSubjects =
            uniqueSubjects.filter(
              (subject) =>
                !finalSubjects.some(
                  (loadedSubject) =>
                    subjectsMatch(
                      loadedSubject,
                      subject
                    )
                )
            );

          if (
            missingSubjects.length >
            0
          ) {
            console.warn(
              "SUBJECTS WITH NO QUESTIONS:",
              missingSubjects
            );
          }

          /* ==========================================================
             NO QUESTIONS
          ========================================================== */

          if (
            finalSubjects.length ===
              0 ||
            totalFinalQuestions ===
              0
          ) {
            if (mounted) {
              setQuestionsBySubject(
                {}
              );

              setSelectedSubjects(
                []
              );

              setFetchError(
                `No questions were found for the selected subjects: ${uniqueSubjects.join(
                  ", "
                )}`
              );
            }

            return;
          }

          /* ==========================================================
             TIMER
          ========================================================== */

          const newEndTime =
            Date.now() +
            EXAM_DURATION_MINUTES *
              60 *
              1000;

          if (!mounted) {
            return;
          }

          /* ==========================================================
             SET QUESTIONS
          ========================================================== */

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

          /* ==========================================================
             SAVE FRESH SESSION
          ========================================================== */

          if (storageKey) {
            localStorage.setItem(
              storageKey,
              JSON.stringify({
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
                submitted:
                  false,
              })
            );
          }
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

            setQuestionsBySubject(
              {}
            );

            setSelectedSubjects(
              []
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
    suppliedSubjects.join("|"),
  ]);

  /* ==========================================================================
     SAVE SESSION
  ========================================================================== */

  useEffect(() => {
    if (
      FORCE_FRESH_EXAM ||
      loading ||
      !storageKey ||
      selectedSubjects.length ===
        0 ||
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
          subjects:
            selectedSubjects,
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

  /* ==========================================================================
     TIMER
  ========================================================================== */

  useEffect(() => {
    if (
      loading ||
      submitted ||
      !endTime
    ) {
      return undefined;
    }

    const updateTimer =
      () => {
        const remaining =
          Math.max(
            0,
            Math.floor(
              (endTime -
                Date.now()) /
                1000
            )
          );

        setTimeLeft(
          remaining
        );

        if (
          remaining <= 0
        ) {
          setSubmitted(
            true
          );

          setShowNavigator(
            false
          );

          setShowCalculator(
            false
          );
        }
      };

    updateTimer();

    const timer =
      setInterval(
        updateTimer,
        1000
      );

    return () =>
      clearInterval(
        timer
      );
  }, [
    loading,
    submitted,
    endTime,
  ]);

  /* ==========================================================================
     TIME
  ========================================================================== */

  const formatTime = (
    seconds
  ) => {
    const hours =
      Math.floor(
        seconds / 3600
      );

    const minutes =
      Math.floor(
        (seconds % 3600) /
          60
      );

    const secs =
      seconds % 60;

    return [
      hours,
      minutes,
      secs,
    ]
      .map((value) =>
        String(
          value
        ).padStart(2, "0")
      )
      .join(":");
  };

  const timerDanger =
    timeLeft <=
    10 * 60;

  const timerCritical =
    timeLeft <=
    5 * 60;

  /* ==========================================================================
     CURRENT QUESTION
  ========================================================================== */

  const currentQuestions =
    questionsBySubject[
      activeSubject
    ] || [];

  const currentQuestion =
    currentQuestions[
      currentIndex
    ];

  /* ==========================================================================
     TOTAL QUESTIONS
  ========================================================================== */

  const totalQuestions =
    useMemo(() => {
      return selectedSubjects.reduce(
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
      );
    }, [
      selectedSubjects,
      questionsBySubject,
    ]);

  /* ==========================================================================
     GLOBAL QUESTION NUMBER
  ========================================================================== */

  const getGlobalQuestionNumber =
    (
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

      return (
        index + 1
      );
    };

  /* ==========================================================================
     SELECT ANSWER
  ========================================================================== */

  const selectAnswer = (
    option
  ) => {
    if (
      !currentQuestion ||
      submitted
    ) {
      return;
    }

    setAnswers(
      (previous) => ({
        ...previous,
        [currentQuestion.id]:
          option,
      })
    );
  };

  /* ==========================================================================
     MARK
  ========================================================================== */

  const toggleMark =
    () => {
      if (
        !currentQuestion ||
        submitted
      ) {
        return;
      }

      setMarked(
        (previous) => ({
          ...previous,
          [currentQuestion.id]:
            !previous[
              currentQuestion.id
            ],
        })
      );
    };

  /* ==========================================================================
     NEXT
  ========================================================================== */

  const nextQuestion =
    () => {
      if (
        currentIndex <
        currentQuestions.length -
          1
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

        setCurrentIndex(
          0
        );

        setShowCalculator(
          false
        );
      }
    };

  /* ==========================================================================
     PREVIOUS
  ========================================================================== */

  const previousQuestion =
    () => {
      if (
        currentIndex >
        0
      ) {
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

      if (
        previousSubject
      ) {
        const previousQuestions =
          questionsBySubject[
            previousSubject
          ] || [];

        setActiveSubject(
          previousSubject
        );

        setCurrentIndex(
          Math.max(
            previousQuestions.length -
              1,
            0
          )
        );

        setShowCalculator(
          false
        );
      }
    };

  /* ==========================================================================
     CHANGE SUBJECT
  ========================================================================== */

  const changeSubject =
    (subject) => {
      setActiveSubject(
        subject
      );

      setCurrentIndex(
        0
      );

      if (
        !subjectsMatch(
          subject,
          "Mathematics"
        )
      ) {
        setShowCalculator(
          false
        );
      }
    };

  /* ==========================================================================
     CALCULATOR
  ========================================================================== */

  const calculatorPress =
    (value) => {
      if (
        value === "C"
      ) {
        setCalculatorValue(
          ""
        );

        return;
      }

      if (
        value === "DEL"
      ) {
        setCalculatorValue(
          (previous) =>
            previous.slice(
              0,
              -1
            )
        );

        return;
      }

      if (
        value === "="
      ) {
        try {
          const expression =
            calculatorValue
              .replace(
                /×/g,
                "*"
              )
              .replace(
                /÷/g,
                "/"
              )
              .replace(
                /−/g,
                "-"
              );

          if (
            !expression.trim()
          ) {
            return;
          }

          if (
            !/^[0-9+\-*/().\s]+$/.test(
              expression
            )
          ) {
            setCalculatorValue(
              "Error"
            );

            return;
          }

          // eslint-disable-next-line no-new-func
          const result =
            Function(
              `"use strict"; return (${expression})`
            )();

          if (
            typeof result ===
              "number" &&
            Number.isFinite(
              result
            )
          ) {
            setCalculatorValue(
              String(
                Number(
                  result.toFixed(
                    10
                  )
                )
              )
            );
          } else {
            setCalculatorValue(
              "Error"
            );
          }
        } catch {
          setCalculatorValue(
            "Error"
          );
        }

        return;
      }

      setCalculatorValue(
        (previous) =>
          previous ===
            "Error"
            ? value
            : previous + value
      );
    };

  /* ==========================================================================
     SUBMIT
  ========================================================================== */

  const submitExam =
    () => {
      const confirmed =
        window.confirm(
          "Are you sure you want to submit this examination?"
        );

      if (!confirmed) {
        return;
      }

      setSubmitted(
        true
      );

      setShowNavigator(
        false
      );

      setShowCalculator(
        false
      );
    };

  /* ==========================================================================
     ANSWER CHECK
  ========================================================================== */

  const isAnswerCorrect =
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
        selectedAnswer ===
          undefined ||
        selectedAnswer ===
          null ||
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

      if (
        selected ===
        correct
      ) {
        return true;
      }

      const options =
        getQuestionOptions(
          question
        );

      const selectedIndex =
        options.findIndex(
          (option) =>
            normalize(
              option
            ) === selected
        );

      if (
        selectedIndex !==
        -1
      ) {
        const selectedLetter =
          String.fromCharCode(
            65 +
              selectedIndex
          ).toLowerCase();

        if (
          selectedLetter ===
          correct
        ) {
          return true;
        }
      }

      const correctIndex =
        options.findIndex(
          (option) =>
            normalize(
              option
            ) === correct
        );

      if (
        correctIndex !==
        -1
      ) {
        const correctLetter =
          String.fromCharCode(
            65 +
              correctIndex
          ).toLowerCase();

        if (
          correctLetter ===
          selected
        ) {
          return true;
        }
      }

      return false;
    };

  /* ==========================================================================
     ALL QUESTIONS
  ========================================================================== */

  const allQuestions =
    selectedSubjects.flatMap(
      (subject) =>
        questionsBySubject[
          subject
        ] || []
    );

  /* ==========================================================================
     SCORE
  ========================================================================== */

  const score =
    allQuestions.filter(
      (question) =>
        isAnswerCorrect(
          question
        )
    ).length;

  /* ==========================================================================
     ANSWERED
  ========================================================================== */

  const answeredCount =
    allQuestions.filter(
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

  /* ==========================================================================
     LOCATION CHECK
  ========================================================================== */

  if (!location.state) {
    return (
      <Navigate
        to="/cbt"
        replace
      />
    );
  }

  /* ==========================================================================
     LOADING
  ========================================================================== */

  if (loading) {
    return (
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
            Loading questions for
            all selected subjects.
          </p>

          <div className="mt-6 space-y-2 text-left">
            {(
              suppliedSubjects.length
                ? suppliedSubjects
                : ["Detecting subjects..."]
            ).map(
              (
                subject,
                index
              ) => (
                <div
                  key={`${subject}-${index}`}
                  className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10"
                >
                  <span className="text-sm text-slate-300">
                    {subject}
                  </span>

                  <span className="text-xs text-blue-400 font-semibold">
                    Loading...
                  </span>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    );
  }

  /* ==========================================================================
     NO QUESTIONS
  ========================================================================== */

  if (
    totalQuestions === 0
  ) {
    return (
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
              selected subjects.
            </p>

            {fetchError && (
              <div className="mt-5 p-4 rounded-xl bg-red-500/5 border border-red-500/10 text-left">
                <p className="text-xs uppercase tracking-wider text-red-400 font-bold">
                  Database Response
                </p>

                <p className="text-sm text-slate-300 mt-2">
                  {fetchError}
                </p>
              </div>
            )}

            <div className="mt-6 p-5 rounded-2xl bg-black/10 border border-white/10 text-left">
              <p className="text-xs uppercase tracking-wider text-slate-500">
                Examination
              </p>

              <p className="font-bold mt-1">
                {exam}
              </p>

              <p className="text-xs uppercase tracking-wider text-slate-500 mt-5">
                Selected Subjects
              </p>

              <div className="mt-3 space-y-2">
                {suppliedSubjects.map(
                  (
                    subject
                  ) => (
                    <div
                      key={
                        subject
                      }
                      className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/[0.03]"
                    >
                      <span>
                        {subject}
                      </span>

                      <span className="text-red-400 text-sm">
                        0 /{" "}
                        {
                          QUESTIONS_PER_SUBJECT
                        }
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>

            <button
              onClick={() =>
                window.location.reload()
              }
              className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 font-semibold transition"
            >
              <RefreshCw
                size={17}
              />

              Reload Questions
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ==========================================================================
     RESULT
  ========================================================================== */

  if (submitted) {
    const percentage =
      totalQuestions >
      0
        ? Math.round(
            (score /
              totalQuestions) *
              100
          )
        : 0;

    return (
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
              {exam} CBT
              Examination
            </p>

            <p className="text-blue-400 text-sm mt-2">
              {selectedSubjects.join(
                " • "
              )}
            </p>

            <p className="text-slate-500 text-xs mt-3">
              {totalQuestions}{" "}
              total questions
            </p>

            {timeLeft ===
              0 && (
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
              value={
                answeredCount
              }
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
                    (
                      question
                    ) =>
                      isAnswerCorrect(
                        question
                      )
                  ).length;

                return (
                  <div
                    key={
                      subject
                    }
                    className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
                  >
                    <p className="text-sm text-slate-400">
                      {subject}
                    </p>

                    <p className="text-2xl font-bold text-blue-400 mt-2">
                      {
                        subjectScore
                      }
                      /
                      {
                        subjectQuestions.length
                      }
                    </p>

                    <p className="text-xs text-slate-500 mt-1">
                      {subjectQuestions.length
                        ? Math.round(
                            (subjectScore /
                              subjectQuestions.length) *
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

                const options =
                  getQuestionOptions(
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
                          <X
                            size={20}
                          />
                        )}
                      </div>

                      <div className="flex-1">
                        <p className="text-xs text-slate-500 mb-2">
                          Question{" "}
                          {index +
                            1}
                        </p>

                        {question.subject && (
                          <p className="text-xs text-blue-400 mb-2">
                            {
                              question.subject
                            }
                          </p>
                        )}

                        <h2 className="font-semibold text-lg leading-7">
                          <MathText>
                            {
                              question.question
                            }
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
                              Your
                              answer:
                            </span>{" "}
                            <span
                              className={
                                correct
                                  ? "text-emerald-400"
                                  : "text-red-400"
                              }
                            >
                              {selectedAnswer ? (
                                <MathText>
                                  {
                                    selectedAnswer
                                  }
                                </MathText>
                              ) : (
                                "Not answered"
                              )}
                            </span>
                          </p>

                          {!correct && (
                            <p className="text-sm">
                              <span className="text-slate-500">
                                Correct
                                answer:
                              </span>{" "}
                              <span className="text-emerald-400">
                                {correctAnswer ? (
                                  <MathText>
                                    {
                                      correctAnswer
                                    }
                                  </MathText>
                                ) : (
                                  "Not provided"
                                )}
                              </span>
                            </p>
                          )}

                          {options.length >
                            0 && (
                            <div className="mt-4 space-y-2">
                              {options.map(
                                (
                                  option,
                                  optionIndex
                                ) => (
                                  <div
                                    key={
                                      optionIndex
                                    }
                                    className="flex gap-3 text-sm text-slate-400"
                                  >
                                    <span className="font-bold text-slate-500">
                                      {String.fromCharCode(
                                        65 +
                                          optionIndex
                                      )}
                                      .
                                    </span>

                                    <MathText>
                                      {
                                        option
                                      }
                                    </MathText>
                                  </div>
                                )
                              )}
                            </div>
                          )}

                          {question.reason && (
                            <div className="mt-4 p-4 rounded-xl bg-[#0b1b30] border border-white/10">
                              <p className="text-xs uppercase tracking-wider text-blue-400 font-semibold mb-2">
                                Reason
                              </p>

                              <MathText className="text-sm text-slate-300 leading-6">
                                {
                                  question.reason
                                }
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
                if (
                  storageKey
                ) {
                  localStorage.removeItem(
                    storageKey
                  );
                }

                window.location.reload();
              }}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 transition font-semibold"
            >
              <RotateCcw
                size={18}
              />

              Retake Examination
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ==========================================================================
     CURRENT DATA
  ========================================================================== */

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

  const currentOptions =
    getQuestionOptions(
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
    subjectsMatch(
      activeSubject,
      "Mathematics"
    );

  const isLastQuestionOfExam =
    activeSubjectPosition ===
      selectedSubjects.length -
        1 &&
    currentIndex ===
      currentQuestions.length -
        1;

  /* ==========================================================================
     RENDER
  ========================================================================== */

  return (
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
                <div className="w-10 h-10 rounded-xl bg-blue-500/[0.08] border border-blue-400/20 flex items-center justify-center overflow-hidden">
                  <img
                    src={
                      cogLogo
                    }
                    alt="Scholiqen"
                    className="w-7 h-7 object-contain"
                  />
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
                  <Calculator
                    size={18}
                  />
                </button>
              )}

              <button
                onClick={() =>
                  setShowNavigator(
                    true
                  )
                }
                title="Question Navigator"
                className="w-10 h-10 rounded-xl border border-white/10 bg-white/[0.035] text-slate-300 hover:text-white hover:bg-white/[0.07] transition flex items-center justify-center"
              >
                <Grid3X3
                  size={18}
                />
              </button>

              <button
                onClick={
                  submitExam
                }
                className="hidden sm:flex items-center gap-2 px-4 md:px-5 h-10 rounded-xl bg-blue-600 hover:bg-blue-500 transition font-semibold text-sm"
              >
                Submit
                <span className="hidden md:inline">
                  Exam
                </span>
              </button>

              <button
                onClick={() =>
                  setShowNavigator(
                    true
                  )
                }
                className="sm:hidden w-10 h-10 rounded-xl border border-white/10 bg-white/[0.035] flex items-center justify-center"
              >
                <Menu
                  size={18}
                />
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
                      activeSubject,
                      subject
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
                      className={`relative shrink-0 min-w-[150px] px-5 py-3 rounded-xl text-sm font-semibold transition-all border ${
                        active
                          ? "bg-blue-600/15 border-blue-500/40 text-blue-300"
                          : "bg-transparent border-transparent text-slate-400 hover:text-white hover:bg-white/[0.04]"
                      }`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <span>
                          {
                            getSubjectDisplayName(
                              subject
                            )
                          }
                        </span>

                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded-md ${
                            active
                              ? "bg-blue-500/15 text-blue-300"
                              : "bg-white/[0.05] text-slate-500"
                          }`}
                        >
                          {
                            subjectAnswered
                          }
                          /
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
                    key={
                      `summary-${subject}`
                    }
                    className="rounded-xl border border-white/10 bg-white/[0.025] px-4 py-3"
                  >
                    <p className="text-xs text-slate-500 truncate">
                      {subject}
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
                {activeSubject}
              </h2>
            </div>

            <button
              onClick={
                toggleMark
              }
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-xs font-semibold ${
                marked[
                  currentQuestion?.id
                ]
                  ? "border-yellow-500/30 bg-yellow-500/10 text-yellow-400"
                  : "border-white/10 bg-white/[0.03] text-slate-400 hover:text-white"
              }`}
            >
              <Flag
                size={15}
              />

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
                    setShowCalculator(
                      false
                    )
                  }
                  className="w-9 h-9 rounded-xl hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white"
                >
                  <X
                    size={17}
                  />
                </button>
              </div>

              <div className="p-5">
                <input
                  value={
                    calculatorValue
                  }
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
                        key={
                          value
                        }
                        onClick={() =>
                          calculatorPress(
                            value
                          )
                        }
                        className={`h-12 rounded-xl border font-semibold ${
                          value ===
                          "="
                            ? "bg-blue-600 hover:bg-blue-500 border-blue-400 text-white"
                            : value ===
                                "C" ||
                              value ===
                                "DEL"
                            ? "bg-red-500/10 hover:bg-red-500/20 border-red-500/20 text-red-300"
                            : "bg-white/[0.035] hover:bg-white/[0.08] border-white/10 text-slate-200"
                        }`}
                      >
                        {value ===
                        "DEL" ? (
                          <Delete
                            size={
                              17
                            }
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
                    {
                      globalNumber
                    }
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">
                      Question
                    </p>

                    <p className="text-sm font-semibold">
                      {
                        activeSubject
                      }
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-wider text-slate-500">
                    Subject Progress
                  </p>

                  <p className="text-sm font-semibold mt-1">
                    {currentIndex +
                      1}{" "}
                    /{" "}
                    {
                      currentQuestions.length
                    }
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5 md:p-8">
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

              <MathText className="block text-lg md:text-xl font-semibold leading-8 text-white whitespace-pre-wrap">
                {
                  currentQuestion?.question
                }
              </MathText>

              <div className="mt-8 space-y-3">
                {currentOptions.map(
                  (
                    option,
                    index
                  ) => {
                    const letter =
                      String.fromCharCode(
                        65 +
                          index
                      );

                    const selected =
                      normalize(
                        currentAnswer
                      ) ===
                      normalize(
                        option
                      );

                    return (
                      <button
                        key={`${currentQuestion?.id}-${index}`}
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
                          {
                            letter
                          }
                        </span>

                        <MathText
                          className={
                            selected
                              ? "text-white"
                              : "text-slate-300"
                          }
                        >
                          {
                            option
                          }
                        </MathText>

                        {selected && (
                          <CheckCircle2
                            className="ml-auto text-blue-400 shrink-0"
                            size={
                              20
                            }
                          />
                        )}
                      </button>
                    );
                  }
                )}
              </div>

              {currentOptions.length ===
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
                        question
                        has no
                        readable
                        options.
                      </p>

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
                currentIndex ===
                  0 &&
                activeSubjectPosition ===
                  0
              }
              className="flex items-center gap-2 px-5 py-3 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.07] disabled:opacity-30 disabled:cursor-not-allowed transition font-semibold text-sm"
            >
              <ChevronLeft
                size={18}
              />

              Previous
            </button>

            <button
              onClick={() =>
                setShowNavigator(
                  true
                )
              }
              className="flex items-center gap-2 px-4 py-3 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.07] transition text-sm font-semibold"
            >
              <Grid3X3
                size={17}
              />

              Questions
            </button>

            {isLastQuestionOfExam ? (
              <button
                onClick={
                  submitExam
                }
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 transition font-semibold text-sm"
              >
                Submit Exam

                <CheckCircle2
                  size={18}
                />
              </button>
            ) : (
              <button
                onClick={
                  nextQuestion
                }
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 transition font-semibold text-sm"
              >
                Next

                <ChevronRight
                  size={18}
                />
              </button>
            )}
          </div>
        </div>
      </main>

      {/* =========================================================================
          QUESTION NAVIGATOR
      ========================================================================= */}

      {showNavigator && (
        <>
          <div
            onClick={() =>
              setShowNavigator(
                false
              )
            }
            className="fixed inset-0 z-[55] bg-black/40 backdrop-blur-[2px]"
          />

          <aside className="fixed right-4 top-20 z-[60] w-[330px] max-h-[calc(100vh-105px)] overflow-y-auto rounded-2xl border border-white/10 bg-[#0a1b30]/98 backdrop-blur-2xl shadow-2xl">
            <div className="sticky top-0 z-10 bg-[#0a1b30]/98 backdrop-blur-xl border-b border-white/10 p-4 flex items-center justify-between">
              <div>
                <h3 className="font-semibold">
                  Question Navigator
                </h3>

                <p className="text-xs text-slate-500 mt-1">
                  {
                    answeredCount
                  }
                  /
                  {
                    totalQuestions
                  }{" "}
                  answered
                </p>
              </div>

              <button
                onClick={() =>
                  setShowNavigator(
                    false
                  )
                }
                className="p-2 rounded-lg hover:bg-white/10"
              >
                <X
                  size={18}
                />
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

                  return (
                    <div
                      key={
                        subject
                      }
                      className="mb-6"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                          {
                            subject
                          }
                        </p>

                        <span className="text-[10px] text-slate-600">
                          {
                            subjectAnswered
                          }
                          /
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
                                className={`relative aspect-square rounded-xl text-xs font-semibold border transition ${
                                  isCurrent
                                    ? "bg-blue-600 border-blue-400 text-white"
                                    : selected
                                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                                    : "bg-[#102238] border-white/10 text-slate-400 hover:bg-[#17304d]"
                                }`}
                              >
                                {
                                  index +
                                    1
                                }

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
              </div>
            </div>
          </aside>
        </>
      )}
    </div>
  );
};

/* ============================================================================
   RESULT CARD
============================================================================ */

const ResultCard = ({
  label,
  value,
}) => {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-center">
      <p className="text-xs uppercase tracking-wider text-slate-500">
        {label}
      </p>

      <p className="text-2xl font-bold mt-2 text-blue-400">
        {value}
      </p>
    </div>
  );
};

/* ============================================================================
   EXPORT
============================================================================ */

export default CBTExam;