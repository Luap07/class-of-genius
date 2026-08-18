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
} from "lucide-react";

import { supabase } from "../../lib/supabaseClient";
import cogLogo from "../../assets/cog.png";

/* ============================================================================
   CONFIG
============================================================================ */

const QUESTIONS_PER_SUBJECT = 40;
const EXAM_DURATION_MINUTES = 120;

/* ============================================================================
   HELPERS
============================================================================ */

const normalize = (value) =>
  String(value ?? "")
    .replace(/\u00a0/g, " ")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();

/* ============================================================================
   RANDOM SHUFFLE
============================================================================ */

const shuffleQuestions = (questions) => {
  const shuffled = [...questions];

  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));

    [shuffled[i], shuffled[j]] = [
      shuffled[j],
      shuffled[i],
    ];
  }

  return shuffled;
};

/* ============================================================================
   DISPLAY SUBJECT
============================================================================ */

const getSubjectDisplayName = (subject) => {
  return String(subject ?? "").trim();
};

/* ============================================================================
   SUBJECT MATCH
============================================================================ */

const subjectsMatch = (first, second) => {
  return (
    normalize(first) !== "" &&
    normalize(second) !== "" &&
    normalize(first) === normalize(second)
  );
};

/* ============================================================================
   QUESTION OPTIONS
============================================================================ */

const getQuestionOptions = (question) => {
  if (!question) {
    return [];
  }

  const separateOptions = [
    question.optionA,
    question.optionB,
    question.optionC,
    question.optionD,
  ];

  const hasSeparateOptions =
    separateOptions.some(
      (option) =>
        option !== undefined &&
        option !== null
    );

  if (hasSeparateOptions) {
    return separateOptions.filter(
      (option) =>
        option !== null &&
        option !== undefined &&
        String(option).trim() !== ""
    );
  }

  if (Array.isArray(question.options)) {
    return question.options.filter(
      (option) =>
        option !== null &&
        option !== undefined &&
        String(option).trim() !== ""
    );
  }

  return [];
};

/* ============================================================================
   CORRECT ANSWER
============================================================================ */

const getCorrectAnswerValue = (question) => {
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
   STORAGE KEY
============================================================================ */

const createStorageKey = (exam, subjects) => {
  const subjectKey = [...subjects]
    .map((subject) => normalize(subject))
    .sort()
    .join("|");

  return `scholiqen-cbt-session-${normalize(
    exam
  )}-${subjectKey}`;
};

/* ============================================================================
   MATHEMATICAL TEXT
============================================================================ */

const SUPERCHARS = {
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
  "a": "ᵃ",
  "b": "ᵇ",
  "c": "ᶜ",
  "d": "ᵈ",
  "e": "ᵉ",
  "f": "ᶠ",
  "g": "ᵍ",
  "h": "ʰ",
  "i": "ⁱ",
  "j": "ʲ",
  "k": "ᵏ",
  "l": "ˡ",
  "m": "ᵐ",
  "n": "ⁿ",
  "o": "ᵒ",
  "p": "ᵖ",
  "r": "ʳ",
  "s": "ˢ",
  "t": "ᵗ",
  "u": "ᵘ",
  "v": "ᵛ",
  "w": "ʷ",
  "x": "ˣ",
  "y": "ʸ",
  "z": "ᶻ",
};

/* ============================================================================
   HTML ENTITIES
============================================================================ */

const convertMathEntities = (text) => {
  return String(text ?? "")
    .replace(/&sup1;|&#185;|&#xB9;/gi, "¹")
    .replace(/&sup2;|&#178;|&#xB2;/gi, "²")
    .replace(/&sup3;|&#179;|&#xB3;/gi, "³")
    .replace(/&plusmn;|&#177;|&#xB1;/gi, "±")
    .replace(/&minus;|&#8722;|&#x2212;/gi, "−")
    .replace(/&times;|&#215;|&#xD7;/gi, "×")
    .replace(/&divide;|&#247;|&#xF7;/gi, "÷")
    .replace(/&nbsp;|&#160;/gi, " ");
};

/* ============================================================================
   SUPER SCRIPT
============================================================================ */

const toSuperscript = (value) => {
  return String(value)
    .split("")
    .map(
      (character) =>
        SUPERCHARS[character] ?? character
    )
    .join("");
};

/* ============================================================================
   POWER CONVERSION
============================================================================ */

const convertPowers = (text) => {
  let value = String(text ?? "");

  value = convertMathEntities(value);

  value = value.replace(
    /<sup\b[^>]*>([\s\S]*?)<\/sup>/gi,
    (_, exponent) =>
      toSuperscript(
        String(exponent)
          .replace(/<[^>]+>/g, "")
          .trim()
      )
  );

  value = value.replace(
    /\^\{([^{}]+)\}/g,
    (_, exponent) =>
      toSuperscript(exponent)
  );

  value = value.replace(
    /\^(-?\d+(?:\.\d+)?)/g,
    (_, exponent) =>
      toSuperscript(exponent)
  );

  value = value.replace(
    /\^([A-Za-z])/g,
    (_, exponent) =>
      toSuperscript(exponent)
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

  const text = String(children);

  const fractionPattern =
    /<span\s+class=["']math-fraction["']>\s*<span>(.*?)<\/span>\s*<span>(.*?)<\/span>\s*<\/span>/gis;

  const parts = [];

  let lastIndex = 0;
  let match;

  while (
    (match =
      fractionPattern.exec(text)) !== null
  ) {
    if (match.index > lastIndex) {
      const normalText = text.slice(
        lastIndex,
        match.index
      );

      parts.push(
        <React.Fragment
          key={`math-text-${lastIndex}`}
        >
          {convertPowers(normalText)}
        </React.Fragment>
      );
    }

    parts.push(
      <span
        key={`math-fraction-${match.index}`}
        className="math-fraction inline-flex flex-col items-center align-middle mx-1 leading-none"
        aria-label={`${match[1]} divided by ${match[2]}`}
      >
        <span className="px-1">
          {convertPowers(match[1])}
        </span>

        <span className="w-full border-t border-current my-0.5" />

        <span className="px-1">
          {convertPowers(match[2])}
        </span>
      </span>
    );

    lastIndex =
      match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(
      <React.Fragment
        key={`math-text-${lastIndex}`}
      >
        {convertPowers(
          text.slice(lastIndex)
        )}
      </React.Fragment>
    );
  }

  if (parts.length === 0) {
    return (
      <span className={className}>
        {convertPowers(text)}
      </span>
    );
  }

  return (
    <span className={className}>
      {parts}
    </span>
  );
};

/* ============================================================================
   CBT EXAM
============================================================================ */

const CBTExam = () => {
  const location = useLocation();

  const exam = location.state?.exam;

  /*
   * IMPORTANT:
   *
   * We DO NOT hard-code subjects here.
   *
   * Whatever subjects were selected on the previous page
   * come through location.state.subjects.
   */

  const suppliedSubjects = Array.isArray(
    location.state?.subjects
  )
    ? location.state.subjects
        .map((subject) =>
          String(subject ?? "").trim()
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

  /* ==========================================================================
     UI
  ========================================================================== */

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

  /* ==========================================================================
     TIMER
  ========================================================================== */

  const [
    endTime,
    setEndTime,
  ] = useState(null);

  const [
    timeLeft,
    setTimeLeft,
  ] = useState(
    EXAM_DURATION_MINUTES * 60
  );

  /* ==========================================================================
     STORAGE KEY
  ========================================================================== */

  const storageKey = useMemo(() => {
    if (!exam || suppliedSubjects.length === 0) {
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
     FETCH 40 RANDOM QUESTIONS PER SELECTED SUBJECT
  ========================================================================== */

  useEffect(() => {
    let mounted = true;

    const fetchQuestionsFromBackend = async () => {
      if (!exam) {
        if (mounted) {
          setLoading(false);
        }

        return;
      }

      if (suppliedSubjects.length === 0) {
        console.error(
          "CBT ERROR: No subjects were supplied."
        );

        if (mounted) {
          setQuestionsBySubject({});
          setSelectedSubjects([]);
          setLoading(false);
        }

        return;
      }

      try {
        setLoading(true);

        setLoadingMessage(
          `Loading ${suppliedSubjects.length} selected subject${
            suppliedSubjects.length > 1
              ? "s"
              : ""
          }...`
        );

        console.log(
          "========================================"
        );

        console.log(
          "CBT BACKEND QUESTION LOAD"
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
          "QUESTIONS PER SUBJECT:",
          QUESTIONS_PER_SUBJECT
        );

        console.log(
          "========================================"
        );

        /*
         * ================================================================
         * FETCH EACH SELECTED SUBJECT DIRECTLY FROM SUPABASE
         * ================================================================
         *
         * No hard-coded subject names.
         *
         * Example:
         *
         * If selectedSubjects is:
         *
         * ["English Language", "Mathematics", "Physics"]
         *
         * the backend receives:
         *
         * exam = selected exam
         * subject = English Language
         *
         * then:
         *
         * exam = selected exam
         * subject = Mathematics
         *
         * then:
         *
         * exam = selected exam
         * subject = Physics
         *
         * ================================================================
         */

        const subjectResults =
          await Promise.all(
            suppliedSubjects.map(
              async (selectedSubject) => {
                const cleanSubject =
                  String(
                    selectedSubject
                  ).trim();

                console.log(
                  `FETCHING BACKEND QUESTIONS FOR SUBJECT: "${cleanSubject}"`
                );

                /*
                 * ilike makes subject matching
                 * case-insensitive.
                 *
                 * So:
                 *
                 * Physics
                 * physics
                 * PHYSICS
                 *
                 * can match the same database subject.
                 */

                const {
                  data,
                  error,
                } = await supabase
                  .from(
                    "cbt_questions"
                  )
                  .select("*")
                  .eq(
                    "exam",
                    exam
                  )
                  .ilike(
                    "subject",
                    cleanSubject
                  );

                if (error) {
                  console.error(
                    `BACKEND ERROR FOR SUBJECT "${cleanSubject}":`,
                    error
                  );

                  return {
                    subject:
                      cleanSubject,
                    questions: [],
                    error,
                  };
                }

                console.log(
                  `BACKEND RETURNED ${data?.length || 0} QUESTIONS FOR "${cleanSubject}"`
                );

                /*
                 * Shuffle ONLY the questions returned
                 * from the backend for this selected subject.
                 */

                const randomQuestions =
                  shuffleQuestions(
                    data || []
                  ).slice(
                    0,
                    QUESTIONS_PER_SUBJECT
                  );

                console.log(
                  `USING ${randomQuestions.length} RANDOM QUESTIONS FOR "${cleanSubject}"`
                );

                return {
                  subject:
                    cleanSubject,
                  questions:
                    randomQuestions,
                  error: null,
                };
              }
            )
          );

        if (!mounted) {
          return;
        }

        /* ==================================================================
           BUILD QUESTIONS BY SUBJECT
        ================================================================== */

        const grouped = {};

        const finalSubjects = [];

        subjectResults.forEach(
          ({
            subject,
            questions,
          }) => {
            const displaySubject =
              getSubjectDisplayName(
                subject
              );

            /*
             * Keep the exact selected subject
             * as the key.
             */

            grouped[displaySubject] =
              questions;

            /*
             * Only include the subject if
             * backend returned questions.
             */

            if (
              questions &&
              questions.length > 0
            ) {
              finalSubjects.push(
                displaySubject
              );
            }
          }
        );

        console.log(
          "========================================"
        );

        console.log(
          "FINAL BACKEND QUESTIONS"
        );

        finalSubjects.forEach(
          (subject) => {
            console.log(
              `${subject}: ${
                grouped[subject]?.length ||
                0
              }`
            );
          }
        );

        console.log(
          "TOTAL SUBJECTS:",
          finalSubjects.length
        );

        console.log(
          "========================================"
        );

        if (finalSubjects.length === 0) {
          setQuestionsBySubject({});
          setSelectedSubjects([]);
          setLoading(false);

          return;
        }

        /*
         * New exam timer.
         */

        const newEndTime =
          Date.now() +
          EXAM_DURATION_MINUTES *
            60 *
            1000;

        /*
         * IMPORTANT:
         *
         * This is the actual backend result.
         *
         * Example:
         *
         * Mathematics = 40
         * Physics     = 40
         * Chemistry   = 40
         *
         * Total = 120
         */

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

        setEndTime(
          newEndTime
        );

        setTimeLeft(
          EXAM_DURATION_MINUTES *
            60
        );

        setSubmitted(false);

        /*
         * Save the backend-selected questions
         * so refresh does not change the questions
         * during an active exam.
         */

        const newStorageKey =
          createStorageKey(
            exam,
            finalSubjects
          );

        localStorage.setItem(
          newStorageKey,
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
            submitted: false,
          })
        );
      } catch (error) {
        console.error(
          "CBT BACKEND QUESTION LOADING ERROR:",
          error
        );

        if (mounted) {
          setQuestionsBySubject({});
          setSelectedSubjects([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchQuestionsFromBackend();

    return () => {
      mounted = false;
    };
  }, [
    exam,
    suppliedSubjects.join("|"),
  ]);

  /* ==========================================================================
     RESTORE ACTIVE EXAM SESSION
  ========================================================================== */

  useEffect(() => {
    if (
      loading ||
      !storageKey ||
      selectedSubjects.length === 0
    ) {
      return;
    }

    try {
      const saved =
        localStorage.getItem(
          storageKey
        );

      if (!saved) {
        return;
      }

      const session =
        JSON.parse(saved);

      if (
        !session?.questionsBySubject
      ) {
        return;
      }

      const savedSubjects =
        Array.isArray(
          session.subjects
        )
          ? session.subjects
          : [];

      const sameSubjects =
        savedSubjects.length ===
          selectedSubjects.length &&
        savedSubjects.every(
          (savedSubject) =>
            selectedSubjects.some(
              (currentSubject) =>
                subjectsMatch(
                  savedSubject,
                  currentSubject
                )
            )
        );

      if (!sameSubjects) {
        return;
      }

      setQuestionsBySubject(
        session.questionsBySubject
      );

      setActiveSubject(
        session.activeSubject ||
          selectedSubjects[0]
      );

      setCurrentIndex(
        Number.isInteger(
          session.currentIndex
        )
          ? session.currentIndex
          : 0
      );

      setAnswers(
        session.answers || {}
      );

      setMarked(
        session.marked || {}
      );

      if (session.endTime) {
        const savedEndTime =
          Number(
            session.endTime
          );

        if (
          savedEndTime &&
          !Number.isNaN(
            savedEndTime
          )
        ) {
          setEndTime(
            savedEndTime
          );

          setTimeLeft(
            Math.max(
              0,
              Math.floor(
                (savedEndTime -
                  Date.now()) /
                  1000
              )
            )
          );
        }
      }

      if (session.submitted) {
        setSubmitted(true);
      }
    } catch (error) {
      console.error(
        "FAILED TO RESTORE CBT SESSION:",
        error
      );
    }
  }, [
    loading,
    storageKey,
    selectedSubjects,
  ]);

  /* ==========================================================================
     SAVE ACTIVE SESSION
  ========================================================================== */

  useEffect(() => {
    if (
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
        "FAILED TO SAVE CBT SESSION:",
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

    const updateTimer = () => {
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

  /* ==========================================================================
     FORMAT TIME
  ========================================================================== */

  const formatTime = (seconds) => {
    const hours =
      Math.floor(
        seconds / 3600
      );

    const minutes =
      Math.floor(
        (seconds % 3600) / 60
      );

    const secs =
      seconds % 60;

    return [
      hours,
      minutes,
      secs,
    ]
      .map((value) =>
        String(value).padStart(
          2,
          "0"
        )
      )
      .join(":");
  };

  const timerDanger =
    timeLeft <= 10 * 60;

  const timerCritical =
    timeLeft <= 5 * 60;

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

  /* ==========================================================================
     GLOBAL QUESTION NUMBER
  ========================================================================== */

  const getGlobalQuestionNumber = (
    subject,
    index
  ) => {
    let number = 0;

    for (
      const selectedSubject of selectedSubjects
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

  /* ==========================================================================
     SELECT ANSWER
  ========================================================================== */

  const selectAnswer = (option) => {
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
     MARK QUESTION
  ========================================================================== */

  const toggleMark = () => {
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
     NEXT QUESTION
  ========================================================================== */

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

    const currentPosition =
      selectedSubjects.findIndex(
        (subject) =>
          subjectsMatch(
            subject,
            activeSubject
          )
      );

    const nextSubject =
      selectedSubjects[
        currentPosition + 1
      ];

    if (nextSubject) {
      setActiveSubject(
        nextSubject
      );

      setCurrentIndex(0);

      setShowCalculator(false);
    }
  };

  /* ==========================================================================
     PREVIOUS QUESTION
  ========================================================================== */

  const previousQuestion = () => {
    if (currentIndex > 0) {
      setCurrentIndex(
        (previous) =>
          previous - 1
      );

      return;
    }

    const currentPosition =
      selectedSubjects.findIndex(
        (subject) =>
          subjectsMatch(
            subject,
            activeSubject
          )
      );

    const previousSubject =
      selectedSubjects[
        currentPosition - 1
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
          previousQuestions.length -
            1,
          0
        )
      );

      setShowCalculator(false);
    }
  };

  /* ==========================================================================
     CHANGE SUBJECT
  ========================================================================== */

  const changeSubject = (
    subject
  ) => {
    setActiveSubject(
      subject
    );

    setCurrentIndex(0);

    setShowCalculator(false);
  };

  /* ==========================================================================
     CALCULATOR
  ========================================================================== */

  const calculatorPress = (
    value
  ) => {
    if (value === "C") {
      setCalculatorValue("");
      return;
    }

    if (value === "=") {
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

        // eslint-disable-next-line no-new-func
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

      return;
    }

    setCalculatorValue(
      (previous) =>
        previous + value
    );
  };

  /* ==========================================================================
     SUBMIT
  ========================================================================== */

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

  /* ==========================================================================
     CORRECT ANSWER
  ========================================================================== */

  const getCorrectAnswer = (
    question
  ) => {
    return getCorrectAnswerValue(
      question
    );
  };

  /* ==========================================================================
     CHECK ANSWER
  ========================================================================== */

  const isAnswerCorrect = (
    question
  ) => {
    if (!question) {
      return false;
    }

    const selectedAnswer =
      answers[
        question.id
      ];

    const correctAnswer =
      getCorrectAnswer(
        question
      );

    if (
      selectedAnswer ===
        undefined ||
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
      selectedIndex !== -1
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
      correctIndex !== -1
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
      (question) =>
        answers[
          question.id
        ] !== undefined &&
        answers[
          question.id
        ] !== null &&
        String(
          answers[
            question.id
          ]
        ).trim() !== ""
    ).length;

  /* ==========================================================================
     NO LOCATION
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
        <div className="text-center max-w-md">
          <div className="w-11 h-11 mx-auto mb-5 rounded-full border-2 border-blue-500/20 border-t-blue-500 animate-spin" />

          <p className="text-lg font-semibold">
            {loadingMessage}
          </p>

          <p className="text-sm text-slate-400 mt-2">
            Fetching{" "}
            {QUESTIONS_PER_SUBJECT}{" "}
            random questions from the
            backend for each selected
            subject.
          </p>

          <div className="mt-5 space-y-2 text-left">
            {suppliedSubjects.map(
              (subject) => (
                <div
                  key={subject}
                  className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10"
                >
                  <span className="text-sm text-slate-300">
                    {subject}
                  </span>

                  <span className="text-xs text-blue-400">
                    {QUESTIONS_PER_SUBJECT}{" "}
                    questions
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

  if (totalQuestions === 0) {
    return (
      <div className="min-h-screen bg-[#071426] text-white flex items-center justify-center px-6">
        <div className="max-w-lg text-center">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <X
              className="text-red-400"
              size={28}
            />
          </div>

          <h1 className="text-2xl font-bold mt-6">
            No Questions Found
          </h1>

          <p className="text-slate-400 mt-3 leading-7">
            The backend could not find
            questions for the selected
            subjects in this examination.
          </p>

          <div className="mt-5 p-4 rounded-xl bg-white/[0.03] border border-white/10 text-sm text-left">
            <p className="text-slate-500">
              Exam
            </p>

            <p className="font-semibold mt-1">
              {exam}
            </p>

            <p className="text-slate-500 mt-4">
              Selected Subjects
            </p>

            <div className="mt-2 space-y-2">
              {suppliedSubjects.map(
                (subject) => (
                  <div
                    key={subject}
                    className="flex items-center justify-between"
                  >
                    <span>
                      {subject}
                    </span>

                    <span className="text-slate-500">
                      0 /{" "}
                      {
                        QUESTIONS_PER_SUBJECT
                      }
                    </span>
                  </div>
                )
              )}
            </div>

            <p className="text-slate-500 mt-5">
              Check that the{" "}
              <strong className="text-slate-300">
                exam
              </strong>{" "}
              and{" "}
              <strong className="text-slate-300">
                subject
              </strong>{" "}
              values in{" "}
              <strong className="text-slate-300">
                cbt_questions
              </strong>{" "}
              match the selections.
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* ==========================================================================
     RESULT SCREEN
  ========================================================================== */

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
                examination was submitted
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
              value={`${answeredCount}`}
            />

            <ResultCard
              label="Unanswered"
              value={`${
                totalQuestions -
                answeredCount
              }`}
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
                      {subject}
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
                  getCorrectAnswer(
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
                          {index + 1}
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
                                Correct answer:
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
                                ) => {
                                  const letter =
                                    String.fromCharCode(
                                      65 +
                                        optionIndex
                                    );

                                  return (
                                    <div
                                      key={
                                        optionIndex
                                      }
                                      className="flex gap-3 text-sm text-slate-400"
                                    >
                                      <span className="font-bold text-slate-500">
                                        {
                                          letter
                                        }
                                        .
                                      </span>

                                      <MathText>
                                        {
                                          option
                                        }
                                      </MathText>
                                    </div>
                                  );
                                }
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
                if (storageKey) {
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
     CURRENT QUESTION
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

  const isLastQuestionOfExam =
    activeSubjectPosition ===
      selectedSubjects.length - 1 &&
    currentIndex ===
      currentQuestions.length - 1;

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
                    src={cogLogo}
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
                className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl border transition ${
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
              {currentQuestion &&
                currentOptions.length >
                  0 &&
                normalize(
                  activeSubject
                ) ===
                  normalize(
                    "mathematics"
                  ) && (
                  <button
                    onClick={() =>
                      setShowCalculator(
                        (previous) =>
                          !previous
                      )
                    }
                    title="Calculator"
                    className={`w-10 h-10 rounded-xl border flex items-center justify-center transition ${
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
                  setShowNavigator(true)
                }
                title="Question Navigator"
                className="w-10 h-10 rounded-xl border border-white/10 bg-white/[0.035] text-slate-300 hover:text-white hover:bg-white/[0.07] transition flex items-center justify-center"
              >
                <Grid3X3
                  size={18}
                />
              </button>

              <button
                onClick={submitExam}
                className="hidden sm:flex items-center gap-2 px-4 md:px-5 h-10 rounded-xl bg-blue-600 hover:bg-blue-500 transition font-semibold text-sm shadow-lg shadow-blue-600/10"
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
                      (question) =>
                        answers[
                          question.id
                        ] !== undefined &&
                        answers[
                          question.id
                        ] !== null &&
                        String(
                          answers[
                            question.id
                          ]
                        ).trim() !== ""
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
                          ? "bg-blue-600/15 border-blue-500/40 text-blue-300 shadow-lg shadow-blue-500/5"
                          : "bg-transparent border-transparent text-slate-400 hover:text-white hover:bg-white/[0.04]"
                      }`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <span>
                          {subject}
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
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition ${
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
          normalize(
            activeSubject
          ) ===
            normalize(
              "mathematics"
            ) && (
            <div className="fixed top-[88px] right-5 z-40 w-[310px] rounded-2xl border border-white/10 bg-[#0a1b30]/98 backdrop-blur-2xl shadow-2xl shadow-black/30 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <Calculator
                      size={16}
                      className="text-blue-400"
                    />
                  </div>

                  <div>
                    <p className="text-sm font-semibold">
                      Calculator
                    </p>

                    <p className="text-[9px] text-slate-500 uppercase tracking-wider">
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
                  className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="p-4">
                <input
                  value={
                    calculatorValue
                  }
                  readOnly
                  className="w-full h-14 bg-[#061326] border border-white/10 rounded-xl px-4 text-right text-xl font-mono text-white outline-none"
                  placeholder="0"
                />

                <div className="grid grid-cols-4 gap-2 mt-3">
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
                    "C",
                    "+",
                    "(",
                    ")",
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
                        className={`h-11 rounded-xl border border-white/10 font-semibold transition ${
                          value ===
                          "="
                            ? "bg-blue-600 hover:bg-blue-500 col-span-2"
                            : "bg-white/[0.04] hover:bg-white/[0.08] text-slate-200"
                        }`}
                      >
                        {value}
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>
          )}

        {/* QUESTION */}

        <div className="max-w-5xl mx-auto">
          <div className="rounded-3xl border border-white/[0.08] bg-white/[0.025] backdrop-blur-xl overflow-hidden">
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
                      {activeSubject}
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
                        key={index}
                        onClick={() =>
                          selectAnswer(
                            option
                          )
                        }
                        className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center gap-4 ${
                          selected
                            ? "border-blue-500/60 bg-blue-500/10 shadow-lg shadow-blue-500/5"
                            : "border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20"
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
                          className={
                            selected
                              ? "text-white"
                              : "text-slate-300"
                          }
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

              {currentOptions.length ===
                0 && (
                <div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-red-400 text-sm">
                  No options found for
                  this question. Make sure
                  your Supabase row has
                  optionA, optionB,
                  optionC and optionD.
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

      {/* QUESTION NAVIGATOR */}

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
                  {answeredCount}/
                  {totalQuestions}{" "}
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
                      (question) =>
                        answers[
                          question.id
                        ] !==
                          undefined &&
                        answers[
                          question.id
                        ] !== null &&
                        String(
                          answers[
                            question.id
                          ]
                        ).trim() !== ""
                    ).length;

                  return (
                    <div
                      key={subject}
                      className="mb-6"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                          {subject}
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
                                {index + 1}

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

export default CBTExam;