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
  RefreshCw,
  RotateCcw,
  Trophy,
  X,
} from "lucide-react";

import { supabase } from "../../lib/supabaseClient";


/* ==========================================================================
   CONFIG
============================================================================ */

const QUESTIONS_PER_SUBJECT = 40;

const EXAM_DURATION_MINUTES = 120;

const FORCE_FRESH_EXAM = false;


/* ==========================================================================
   NORMALIZATION
============================================================================ */

const normalize = (value) => {
  return String(value ?? "")
    .replace(/\u00a0/g, " ")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
};


/* ==========================================================================
   SUBJECT MATCHING
============================================================================ */

const canonicalSubject = (subject) => {
  const value = normalize(subject);

  const aliases = {
    "use of english": "use of english",
    english: "use of english",
    "english language": "use of english",

    mathematics: "mathematics",
    maths: "mathematics",

    physics: "physics",

    chemistry: "chemistry",

    biology: "biology",

    agriculture: "agricultural science",
    "agricultural science": "agricultural science",

    "economics": "economics",

    commerce: "commerce",

    accounting: "accounting",

    "government": "government",

    "literature": "literature in english",
    "literature in english": "literature in english",

    geography: "geography",

    "civic education": "civic education",

    "christian religious studies":
      "christian religious studies",

    crs: "christian religious studies",

    "islamic religious studies":
      "islamic religious studies",

    irs: "islamic religious studies",
  };

  return aliases[value] || value;
};


const subjectsMatch = (
  subjectA,
  subjectB
) => {
  return (
    canonicalSubject(subjectA) ===
    canonicalSubject(subjectB)
  );
};


const getSubjectDisplayName = (
  subject
) => {
  const value = String(
    subject ?? ""
  ).trim();

  if (!value) {
    return "Subject";
  }

  if (
    canonicalSubject(value) ===
    "use of english"
  ) {
    return "Use of English";
  }

  return value;
};


/* ==========================================================================
   SHUFFLE
============================================================================ */

const shuffleQuestions = (
  questions
) => {
  const array = Array.isArray(
    questions
  )
    ? [...questions]
    : [];

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


/* ==========================================================================
   JSON PARSER
============================================================================ */

const safeJsonParse = (
  value
) => {
  if (
    value === null ||
    value === undefined
  ) {
    return null;
  }

  if (
    typeof value === "object"
  ) {
    return value;
  }

  if (
    typeof value !== "string"
  ) {
    return null;
  }

  const trimmed =
    value.trim();

  if (!trimmed) {
    return null;
  }

  try {
    return JSON.parse(
      trimmed
    );
  } catch {
    return null;
  }
};


/* ==========================================================================
   QUESTION OPTIONS
============================================================================ */

/*
 * Your Supabase database uses:
 *
 * options = [
 *   "option one",
 *   "option two",
 *   "option three",
 *   "option four"
 * ]
 *
 * This helper handles:
 *
 * 1. PostgreSQL JSON/JSONB already returned as an array
 * 2. JSON stored as a string
 * 3. { A: "...", B: "...", C: "...", D: "..." }
 * 4. { optionA: "...", ... }
 * 5. Old optionA/B/C/D columns as fallback
 */

const getQuestionOptions = (
  question
) => {
  if (!question) {
    return [];
  }

  /* ------------------------------------------------------------
     PRIMARY SOURCE: options
  ------------------------------------------------------------ */

  const rawOptions =
    question.options;

  if (
    Array.isArray(
      rawOptions
    )
  ) {
    return rawOptions
      .map((option) =>
        String(
          option ?? ""
        ).trim()
      )
      .filter(Boolean);
  }

  if (
    typeof rawOptions ===
    "string"
  ) {
    const parsed =
      safeJsonParse(
        rawOptions
      );

    if (
      Array.isArray(parsed)
    ) {
      return parsed
        .map((option) =>
          String(
            option ?? ""
          ).trim()
        )
        .filter(Boolean);
    }

    if (
      parsed &&
      typeof parsed ===
        "object"
    ) {
      const values = [
        parsed.A,
        parsed.B,
        parsed.C,
        parsed.D,
        parsed.a,
        parsed.b,
        parsed.c,
        parsed.d,
        parsed.optionA,
        parsed.optionB,
        parsed.optionC,
        parsed.optionD,
      ];

      return values
        .map((option) =>
          String(
            option ?? ""
          ).trim()
        )
        .filter(Boolean);
    }
  }

  if (
    rawOptions &&
    typeof rawOptions ===
      "object"
  ) {
    const values = [
      rawOptions.A,
      rawOptions.B,
      rawOptions.C,
      rawOptions.D,
      rawOptions.a,
      rawOptions.b,
      rawOptions.c,
      rawOptions.d,
      rawOptions.optionA,
      rawOptions.optionB,
      rawOptions.optionC,
      rawOptions.optionD,
    ];

    const result =
      values
        .map((option) =>
          String(
            option ?? ""
          ).trim()
        )
        .filter(Boolean);

    if (
      result.length > 0
    ) {
      return result;
    }
  }

  /* ------------------------------------------------------------
     FALLBACK: OLD DATABASE COLUMNS
  ------------------------------------------------------------ */

  const fallback = [
    question.optionA,
    question.optionB,
    question.optionC,
    question.optionD,
  ]
    .map((option) =>
      String(
        option ?? ""
      ).trim()
    )
    .filter(Boolean);

  return fallback;
};


/* ==========================================================================
   CORRECT ANSWER
============================================================================ */

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


/* ==========================================================================
   QUESTION CONTENT
============================================================================ */

const parseQuestionContent = (
  value
) => {
  const text = String(
    value ?? ""
  ).trim();

  if (!text) {
    return {
      isComprehension: false,
      passage: "",
      question: "",
    };
  }

  /*
   * Supports JSON question content if your database
   * contains something like:
   *
   * {
   *   "passage": "...",
   *   "question": "..."
   * }
   */

  const parsed =
    safeJsonParse(text);

  if (
    parsed &&
    typeof parsed ===
      "object"
  ) {
    const passage =
      parsed.passage ??
      parsed.comprehension ??
      parsed.passage_text ??
      "";

    const question =
      parsed.question ??
      parsed.question_text ??
      parsed.text ??
      "";

    if (
      passage ||
      question
    ) {
      return {
        isComprehension:
          Boolean(passage),
        passage: String(
          passage ?? ""
        ).trim(),
        question: String(
          question || text
        ).trim(),
      };
    }
  }

  return {
    isComprehension: false,
    passage: "",
    question: text,
  };
};


/* ==========================================================================
   COMPREHENSION HELPERS
============================================================================ */

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
      question.passageId ??
      question.group_id ??
      question.comprehension_group ??
      ""
  ).trim();
};


const getDatabasePassage = (
  question
) => {
  if (!question) {
    return "";
  }

  const possiblePassage =
    question.passage ??
    question.comprehension_passage ??
    question.comprehension ??
    question.passage_text ??
    question.passageText ??
    "";

  return String(
    possiblePassage ?? ""
  ).trim();
};


const isComprehensionQuestion = (
  question
) => {
  if (!question) {
    return false;
  }

  const passage =
    getDatabasePassage(
      question
    );

  const comprehensionId =
    getComprehensionId(
      question
    );

  if (
    passage ||
    comprehensionId
  ) {
    return true;
  }

  const parsed =
    parseQuestionContent(
      question.question
    );

  return Boolean(
    parsed?.isComprehension
  );
};


const getComprehensionPassage = (
  question,
  questions = []
) => {
  if (!question) {
    return "";
  }

  const directPassage =
    getDatabasePassage(
      question
    );

  if (directPassage) {
    return directPassage;
  }

  const parsed =
    parseQuestionContent(
      question.question
    );

  if (
    parsed?.isComprehension &&
    parsed?.passage
  ) {
    return String(
      parsed.passage
    ).trim();
  }

  const comprehensionId =
    getComprehensionId(
      question
    );

  if (
    comprehensionId &&
    Array.isArray(
      questions
    )
  ) {
    const groupedQuestion =
      questions.find(
        (item) =>
          item &&
          getComprehensionId(
            item
          ) ===
            comprehensionId &&
          getDatabasePassage(
            item
          )
      );

    if (
      groupedQuestion
    ) {
      return getDatabasePassage(
        groupedQuestion
      );
    }
  }

  return "";
};


const getComprehensionQuestionText = (
  question
) => {
  if (!question) {
    return "";
  }

  const parsed =
    parseQuestionContent(
      question.question
    );

  if (
    parsed?.isComprehension &&
    parsed?.question
  ) {
    return parsed.question;
  }

  return String(
    question.question ?? ""
  ).trim();
};


/* ==========================================================================
   TEXT COMPONENT
============================================================================ */

const MathText = ({
  children,
  className = "",
}) => {
  return (
    <span
      className={className}
    >
      {String(
        children ?? ""
      )}
    </span>
  );
};


/* ==========================================================================
   STORAGE
============================================================================ */

const createStorageKey = (
  exam,
  subjects
) => {
  const examKey =
    normalize(exam);

  const subjectKey =
    Array.isArray(
      subjects
    )
      ? subjects
          .map(
            canonicalSubject
          )
          .sort()
          .join("|")
      : "";

  return `scholiqen-cbt-session-${examKey}-${subjectKey}`;
};


/* ==========================================================================
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


/* ==========================================================================
   MAIN COMPONENT
============================================================================ */

const CBTExam = () => {
  const location =
    useLocation();

  const navigate =
    useNavigate();

  const params =
    useParams();


  /* ========================================================================
     LOCATION DATA
  ======================================================================== */

  const locationState =
    location.state || {};

  const exam =
    locationState.exam ??
    params.exam ??
    "JAMB";

  /*
   * IMPORTANT:
   * Subjects are NOT hardcoded.
   *
   * The page can receive:
   *
   * state:
   * {
   *   exam: "JAMB",
   *   subjects: ["Use of English"]
   * }
   *
   * OR:
   *
   * state:
   * {
   *   exam: "JAMB",
   *   selectedSubjects: ["Use of English"]
   * }
   */

  const suppliedSubjects =
    useMemo(() => {
      const source =
        locationState.subjects ??
        locationState.selectedSubjects ??
        locationState.selectedSubject ??
        [];

      if (
        Array.isArray(source)
      ) {
        return source
          .map((subject) =>
            String(
              subject ?? ""
            ).trim()
          )
          .filter(Boolean);
      }

      if (
        typeof source ===
        "string"
      ) {
        return source
          .split(",")
          .map((subject) =>
            subject.trim()
          )
          .filter(Boolean);
      }

      return [];
    }, [
      locationState.subjects,
      locationState.selectedSubjects,
      locationState.selectedSubject,
    ]);


  const initialStorageKey =
    createStorageKey(
      exam,
      suppliedSubjects
    );


  /* ========================================================================
     STATE
  ======================================================================== */

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    loadingMessage,
    setLoadingMessage,
  ] = useState(
    "Preparing examination..."
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

  const [
    answers,
    setAnswers,
  ] = useState({});

  const [
    marked,
    setMarked,
  ] = useState({});

  const [
    submitted,
    setSubmitted,
  ] = useState(false);

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

  const storageKey =
    initialStorageKey;


  /* ========================================================================
     LOAD EXAM
  ======================================================================== */

  useEffect(() => {
    let mounted = true;

    const loadQuestions =
      async () => {
        try {
          setLoading(true);
          setFetchError(
            ""
          );
          setLoadingMessage(
            "Loading examination questions..."
          );


          /* ================================================================
             FETCH DATABASE QUESTIONS
          ================================================================ */

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
            .limit(5000);

          if (error) {
            throw error;
          }

          if (!mounted) {
            return;
          }

          const examQuestions =
            Array.isArray(data)
              ? data
              : [];


          console.log(
            "TOTAL QUESTIONS FETCHED:",
            examQuestions.length
          );


          /* ================================================================
             DATABASE SUBJECTS
          ================================================================ */

          const databaseSubjects =
            [
              ...new Set(
                examQuestions
                  .map(
                    (row) =>
                      String(
                        row.subject ??
                          ""
                      ).trim()
                  )
                  .filter(
                    Boolean
                  )
              ),
            ];


          console.log(
            "DATABASE SUBJECTS:",
            databaseSubjects
          );


          /* ================================================================
             DETERMINE SUBJECTS
          ================================================================ */

          let subjectsToLoad;

          /*
           * If Admin/CBT page supplied subjects,
           * use them directly.
           *
           * Otherwise detect every subject
           * directly from the database.
           */

          if (
            suppliedSubjects.length >
            0
          ) {
            subjectsToLoad = [
              ...suppliedSubjects,
            ];
          } else {
            subjectsToLoad = [
              ...databaseSubjects,
            ];
          }


          /* ================================================================
             REMOVE DUPLICATES
          ================================================================ */

          const uniqueSubjects =
            [];

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
                  (
                    existing
                  ) =>
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


          console.log(
            "FINAL SUBJECTS:",
            uniqueSubjects
          );


          /* ================================================================
             CHECK SAVED SESSION
          ================================================================ */

          let savedSession =
            null;

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
                  JSON.parse(
                    saved
                  );
              }
            } catch (storageError) {
              console.error(
                "READ SAVED SESSION ERROR:",
                storageError
              );

              savedSession =
                null;
            }
          }


          /* ================================================================
             RESTORE EXISTING SESSION
          ================================================================ */

          if (
            savedSession &&
            savedSession.questionsBySubject &&
            savedSession.endTime
          ) {
            console.log(
              "RESTORING EXISTING CBT SESSION"
            );

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


            /*
             * Make sure the saved session actually
             * contains questions.
             */

            const savedQuestionCount =
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


            if (
              savedQuestionCount >
              0
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

              const savedEndTime =
                Number(
                  savedSession.endTime
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

              setEndTime(
                savedEndTime
              );

              setTimeLeft(
                remaining
              );

              setLoadingMessage(
                "Restoring your examination..."
              );

              setLoading(
                false
              );

              return;
            }
          }


          /* ================================================================
             CREATE NEW SESSION
          ================================================================ */

          const grouped = {};

          const finalSubjects =
            [];


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
                "SUBJECT:",
                selectedSubject
              );

              console.log(
                "MATCHING QUESTIONS:",
                matchingQuestions.length
              );


              const selectedQuestions =
                shuffleQuestions(
                  matchingQuestions
                ).slice(
                  0,
                  QUESTIONS_PER_SUBJECT
                );


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


          if (
            finalSubjects.length ===
              0 ||
            totalFinalQuestions ===
              0
          ) {
            setQuestionsBySubject(
              {}
            );

            setSelectedSubjects(
              []
            );

            setFetchError(
              `No questions were found for the selected subjects: ${
                uniqueSubjects.join(
                  ", "
                )
              }`
            );

            setLoading(
              false
            );

            return;
          }


          /* ================================================================
             NEW TIMER
          ================================================================ */

          const newEndTime =
            Date.now() +
            EXAM_DURATION_MINUTES *
              60 *
              1000;


          /* ================================================================
             SAVE NEW SESSION
          ================================================================ */

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


          if (
            storageKey
          ) {
            localStorage.setItem(
              storageKey,
              JSON.stringify(
                newSession
              )
            );
          }


          /* ================================================================
             UPDATE STATE
          ================================================================ */

          setQuestionsBySubject(
            grouped
          );

          setSelectedSubjects(
            finalSubjects
          );

          setActiveSubject(
            finalSubjects[0]
          );

          setCurrentIndex(
            0
          );

          setAnswers(
            {}
          );

          setMarked(
            {}
          );

          setSubmitted(
            false
          );

          setEndTime(
            newEndTime
          );

          setTimeLeft(
            EXAM_DURATION_MINUTES *
              60
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

            setQuestionsBySubject(
              {}
            );

            setSelectedSubjects(
              []
            );
          }
        } finally {
          if (mounted) {
            setLoading(
              false
            );
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
    suppliedSubjects.join(
      "|"
    ),
  ]);


  /* ========================================================================
     SAVE SESSION AUTOMATICALLY
  ======================================================================== */

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


  /* ========================================================================
     TIMER
  ======================================================================== */

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
          remaining <=
          0
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


  /* ========================================================================
     FORMAT TIME
  ======================================================================== */

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
        ).padStart(
          2,
          "0"
        )
      )
      .join(":");
  };


  const timerDanger =
    timeLeft <=
    10 * 60;

  const timerCritical =
    timeLeft <=
    5 * 60;


  /* ========================================================================
     CURRENT QUESTIONS
  ======================================================================== */

  const currentQuestions =
    questionsBySubject[
      activeSubject
    ] || [];


  const currentQuestion =
    currentQuestions[
      currentIndex
    ];


  /* ========================================================================
     CURRENT QUESTION CONTENT
  ======================================================================== */

  const currentQuestionContent =
    useMemo(() => {
      if (!currentQuestion) {
        return {
          isComprehension: false,
          passage: "",
          question: "",
        };
      }


      const parsed =
        parseQuestionContent(
          currentQuestion.question
        );


      const sharedPassage =
        getComprehensionPassage(
          currentQuestion,
          currentQuestions
        );


      const comprehension =
        isComprehensionQuestion(
          currentQuestion
        );


      return {
        ...parsed,

        isComprehension:
          comprehension,

        passage:
          sharedPassage ||
          parsed?.passage ||
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


  /* ========================================================================
     TOTAL QUESTIONS
  ======================================================================== */

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


  /* ========================================================================
     GLOBAL QUESTION NUMBER
  ======================================================================== */

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


  /* ========================================================================
     SELECT ANSWER
  ======================================================================== */

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


  /* ========================================================================
     MARK QUESTION
  ======================================================================== */

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


  /* ========================================================================
     NEXT QUESTION
  ======================================================================== */

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


      if (
        nextSubject
      ) {
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


  /* ========================================================================
     PREVIOUS QUESTION
  ======================================================================== */

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


  /* ========================================================================
     CHANGE SUBJECT
  ======================================================================== */

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


  /* ========================================================================
     CALCULATOR
  ======================================================================== */

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


  /* ========================================================================
     SUBMIT
  ======================================================================== */

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


  /* ========================================================================
     ANSWER CHECK
  ======================================================================== */

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


      /*
       * Selected answer may be:
       *
       * A
       * B
       * C
       * D
       *
       * or the actual option text.
       */


      const selectedIndex =
        options.findIndex(
          (option) =>
            normalize(
              option
            ) ===
            selected
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
            ) ===
            correct
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


  /* ========================================================================
     ALL QUESTIONS
  ======================================================================== */

  const allQuestions =
    selectedSubjects.flatMap(
      (subject) =>
        questionsBySubject[
          subject
        ] || []
    );


  /* ========================================================================
     SCORE
  ======================================================================== */

  const score =
    allQuestions.filter(
      (question) =>
        isAnswerCorrect(
          question
        )
    ).length;


  /* ========================================================================
     ANSWERED COUNT
  ======================================================================== */

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


  /* ========================================================================
     LOCATION CHECK
  ======================================================================== */

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


  /* ========================================================================
     LOADING
  ======================================================================== */

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
            Restoring your questions,
            answers and examination time.
          </p>

        </div>

      </div>
    );
  }


  /* ========================================================================
     NO QUESTIONS
  ======================================================================== */

  if (
    totalQuestions ===
    0
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


            <button
              onClick={() =>
                navigate(
                  "/cbt"
                )
              }
              className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 font-semibold transition"
            >

              <ArrowLeft
                size={17}
              />

              Back to CBT

            </button>

          </div>

        </div>

      </div>
    );
  }


  /* ========================================================================
     RESULT
  ======================================================================== */

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
              {exam} CBT Examination
            </p>


            <p className="text-blue-400 text-sm mt-2">
              {selectedSubjects.join(
                " • "
              )}
            </p>


            <p className="text-slate-500 text-xs mt-3">
              {totalQuestions} total questions
            </p>


            {timeLeft ===
              0 && (
              <p className="mt-3 text-red-400 text-sm font-semibold">
                Time expired. Your
                examination was
                submitted automatically.
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


                const options =
                  getQuestionOptions(
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


                        {resultIsComprehension &&
                          resultPassage && (
                            <div className="mb-5 rounded-2xl border border-blue-500/20 bg-[#091a2e] overflow-hidden">

                              <div className="px-4 py-3 border-b border-blue-500/10 bg-blue-500/[0.05] flex items-center gap-2">

                                <BookOpen
                                  size={15}
                                  className="text-blue-400"
                                />

                                <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                                  Comprehension Passage
                                </span>

                              </div>


                              <div className="p-5 max-h-[420px] overflow-y-auto">

                                <MathText className="block text-sm md:text-base leading-7 text-slate-300 whitespace-pre-wrap">
                                  {
                                    resultPassage
                                  }
                                </MathText>

                              </div>

                            </div>
                          )}


                        <h2 className="font-semibold text-lg leading-7">

                          <MathText>
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


  /* ========================================================================
     CURRENT DATA
  ======================================================================== */

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


  /* ========================================================================
     RENDER
  ======================================================================== */

  return (
    <div className="min-h-screen bg-[#071426] text-white">

      {/* ====================================================================
          BACKGROUND
      ==================================================================== */}

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


      {/* ====================================================================
          HEADER
      ==================================================================== */}

      <header className="sticky top-0 z-50 bg-[#071426]/95 backdrop-blur-2xl border-b border-white/[0.08] shadow-2xl">

        <div className="max-w-[1600px] mx-auto px-4 md:px-7">

          <div className="h-[76px] grid grid-cols-[1fr_auto_1fr] items-center gap-4">

            <div className="flex items-center gap-4 min-w-0">

              <div className="flex items-center gap-2.5 shrink-0">

                <div className="w-10 h-10 rounded-xl bg-blue-500/[0.08] border border-blue-400/20 flex items-center justify-center">

                  <div className="font-black text-blue-400">
                    C
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


      {/* ====================================================================
          MAIN
      ==================================================================== */}

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

              {/* QUESTION IMAGE */}

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
                              Comprehension Passage
                            </p>

                          </div>

                        </div>


                        <div className="text-right shrink-0">

                          <p className="text-[9px] uppercase tracking-wider text-slate-500">
                            Related Questions
                          </p>


                          <p className="text-xs text-blue-400 font-semibold mt-1">

                            {(() => {
                              const comprehensionId =
                                getComprehensionId(
                                  currentQuestion
                                );


                              if (
                                !comprehensionId
                              ) {
                                return "Passage";
                              }


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
                                related ===
                                1
                                  ? ""
                                  : "s"
                              }`;
                            })()}

                          </p>

                        </div>

                      </div>

                    </div>


                    <div className="p-5 md:p-7 max-h-[480px] overflow-y-auto overscroll-contain">

                      <MathText
                        className="block text-[15px] md:text-base leading-8 text-slate-300 whitespace-pre-wrap"
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


                <MathText className="block text-lg md:text-xl font-semibold leading-8 text-white whitespace-pre-wrap">
                  {
                    currentQuestionContent.question
                  }
                </MathText>

              </div>


              {/* OPTIONS */}

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


              {/* NO OPTIONS */}

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


      {/* ====================================================================
          QUESTION NAVIGATOR
      ==================================================================== */}

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

                                {
                                  index +
                                    1
                                }


                                {isComprehension && (
                                  <span
                                    className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-blue-400"
                                  />
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
  );
};


export default CBTExam;