import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock3,
  FileText,
  Loader2,
  Send,
  AlertCircle,
  Award,
  RefreshCw,
} from "lucide-react";

import {
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";

import { motion } from "framer-motion";

/* ============================================================
   API
============================================================ */

const API_URL = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000"
).replace(/\/$/, "");

/* ============================================================
   STORAGE KEYS
============================================================ */

const ACADEMY_TOKEN_KEYS = [
  "scholiqen_academy_token",
  "academy_token",
  "scholiqen_token",
  "access_token",
  "token",
];

const STUDENT_OBJECT_KEYS = [
  "scholiqen_academy_student",
  "scholiqen_academy_user",
  "academy_student",
  "academyStudent",
  "student",
  "currentStudent",
  "current_student",
  "studentUser",
  "student_user",
  "loggedInStudent",
  "logged_in_student",
];

const STUDENT_REFERENCE_KEYS = [
  "studentReference",
  "student_reference",
  "studentRef",
  "student_ref",
  "studentNumber",
  "student_number",
  "studentCode",
  "student_code",
  "reference",
  "enrollmentReference",
  "enrollment_reference",
];

const STUDENT_ID_KEYS = [
  "studentId",
  "student_id",
  "studentID",
];

const ENROLLMENT_KEYS = [
  "enrollmentId",
  "enrollment_id",
  "enrollmentID",
  "enrollment",
];

/* ============================================================
   HELPERS
============================================================ */

const cleanValue = (value) => {
  if (
    value === undefined ||
    value === null
  ) {
    return "";
  }

  if (
    typeof value === "object"
  ) {
    return "";
  }

  return String(value).trim();
};

const isUsableIdentity = (value) => {
  const cleaned =
    cleanValue(value);

  if (!cleaned) {
    return false;
  }

  const lowered =
    cleaned.toLowerCase();

  if (
    lowered === "undefined" ||
    lowered === "null" ||
    lowered === "unknown" ||
    lowered === "student" ||
    lowered === "[object object]"
  ) {
    return false;
  }

  return true;
};

const safelyParseJSON = (value) => {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

const readLocalStorageObject = (key) => {
  try {
    const raw =
      localStorage.getItem(key);

    if (!raw) {
      return null;
    }

    return safelyParseJSON(raw);
  } catch {
    return null;
  }
};

const readLocalStorageValue = (keys) => {
  for (const key of keys) {
    try {
      const value =
        localStorage.getItem(key);

      if (
        isUsableIdentity(value)
      ) {
        return cleanValue(value);
      }
    } catch {
      // Ignore.
    }
  }

  return "";
};

const findIdentityInObject = (
  object,
  keys
) => {
  if (
    !object ||
    typeof object !== "object"
  ) {
    return "";
  }

  for (const key of keys) {
    const value =
      object[key];

    if (
      isUsableIdentity(value)
    ) {
      return cleanValue(value);
    }
  }

  return "";
};

/* ============================================================
   STUDENT IDENTITY
============================================================ */

const getStudentIdentity = () => {
  const objects = [];

  for (
    const key of STUDENT_OBJECT_KEYS
  ) {
    const object =
      readLocalStorageObject(key);

    if (
      object &&
      typeof object === "object"
    ) {
      objects.push(object);
    }
  }

  /* ----------------------------------------------------------
     STUDENT REFERENCE
  ---------------------------------------------------------- */

  const referenceObjectKeys = [
    "reference",
    "studentReference",
    "student_reference",
    "studentRef",
    "student_ref",
    "studentNumber",
    "student_number",
    "studentCode",
    "student_code",
    "enrollmentReference",
    "enrollment_reference",
  ];

  let studentReference = "";

  for (
    const student of objects
  ) {
    studentReference =
      findIdentityInObject(
        student,
        referenceObjectKeys
      );

    if (studentReference) {
      break;
    }

    const nestedCandidates = [
      student.student,
      student.user,
      student.profile,
      student.data,
      student.account,
      student.studentData,
      student.student_data,
    ];

    for (
      const nested of nestedCandidates
    ) {
      studentReference =
        findIdentityInObject(
          nested,
          referenceObjectKeys
        );

      if (studentReference) {
        break;
      }
    }

    if (studentReference) {
      break;
    }
  }

  if (!studentReference) {
    studentReference =
      readLocalStorageValue(
        STUDENT_REFERENCE_KEYS
      );
  }

  /* ----------------------------------------------------------
     STUDENT ID
  ---------------------------------------------------------- */

  let studentId = "";

  for (
    const student of objects
  ) {
    studentId =
      findIdentityInObject(
        student,
        [
          "studentId",
          "student_id",
          "studentID",
        ]
      );

    if (studentId) {
      break;
    }

    const nestedCandidates = [
      student.student,
      student.user,
      student.profile,
      student.data,
      student.account,
    ];

    for (
      const nested of nestedCandidates
    ) {
      studentId =
        findIdentityInObject(
          nested,
          [
            "studentId",
            "student_id",
            "studentID",
          ]
        );

      if (studentId) {
        break;
      }
    }

    if (studentId) {
      break;
    }
  }

  if (!studentId) {
    studentId =
      readLocalStorageValue(
        STUDENT_ID_KEYS
      );
  }

  /* ----------------------------------------------------------
     ENROLLMENT ID
  ---------------------------------------------------------- */

  let enrollmentId = "";

  const enrollmentKeys = [
    "enrollmentId",
    "enrollment_id",
    "enrollmentID",
  ];

  for (
    const student of objects
  ) {
    enrollmentId =
      findIdentityInObject(
        student,
        enrollmentKeys
      );

    if (enrollmentId) {
      break;
    }

    const nestedCandidates = [
      student.student,
      student.user,
      student.profile,
      student.data,
      student.account,
      student.studentData,
      student.student_data,
    ];

    for (
      const nested of nestedCandidates
    ) {
      enrollmentId =
        findIdentityInObject(
          nested,
          enrollmentKeys
        );

      if (enrollmentId) {
        break;
      }
    }

    if (enrollmentId) {
      break;
    }
  }

  /* ----------------------------------------------------------
     enrollment.id
  ---------------------------------------------------------- */

  if (!enrollmentId) {
    for (
      const student of objects
    ) {
      const enrollmentObjects = [
        student.enrollment,
        student.enrollmentData,
        student.enrollment_data,
      ];

      for (
        const enrollment
        of enrollmentObjects
      ) {
        if (
          enrollment &&
          typeof enrollment === "object"
        ) {
          enrollmentId =
            findIdentityInObject(
              enrollment,
              [
                "id",
                "enrollmentId",
                "enrollment_id",
              ]
            );

          if (enrollmentId) {
            break;
          }
        }
      }

      if (enrollmentId) {
        break;
      }
    }
  }

  /* ----------------------------------------------------------
     data.enrollment.id
  ---------------------------------------------------------- */

  if (!enrollmentId) {
    for (
      const student of objects
    ) {
      const nestedObjects = [
        student.data,
        student.student,
        student.user,
        student.profile,
      ];

      for (
        const nested of nestedObjects
      ) {
        if (
          nested &&
          typeof nested === "object"
        ) {
          const enrollment =
            nested.enrollment ||
            nested.enrollmentData ||
            nested.enrollment_data;

          if (
            enrollment &&
            typeof enrollment === "object"
          ) {
            enrollmentId =
              findIdentityInObject(
                enrollment,
                [
                  "id",
                  "enrollmentId",
                  "enrollment_id",
                ]
              );

            if (enrollmentId) {
              break;
            }
          }
        }
      }

      if (enrollmentId) {
        break;
      }
    }
  }

  /*
   * Some login implementations place the enrollment
   * record itself in `student.enrollment`.
   *
   * Also accept an enrollment object stored directly
   * under localStorage.
   */
  if (!enrollmentId) {
    try {
      const rawEnrollment =
        localStorage.getItem(
          "enrollment"
        );

      const parsed =
        safelyParseJSON(
          rawEnrollment
        );

      if (
        parsed &&
        typeof parsed === "object"
      ) {
        enrollmentId =
          findIdentityInObject(
            parsed,
            [
              "id",
              "enrollmentId",
              "enrollment_id",
            ]
          );
      }
    } catch {
      // Ignore.
    }
  }

  /*
   * Finally check direct localStorage aliases.
   */
  if (!enrollmentId) {
    enrollmentId =
      readLocalStorageValue(
        ENROLLMENT_KEYS.filter(
          (key) => key !== "enrollment"
        )
      );
  }

  /* ----------------------------------------------------------
     STUDENT NAME
  ---------------------------------------------------------- */

  let studentName = "";

  const nameKeys = [
    "name",
    "fullName",
    "full_name",
    "studentName",
    "student_name",
    "displayName",
    "display_name",
  ];

  for (
    const student of objects
  ) {
    studentName =
      findIdentityInObject(
        student,
        nameKeys
      );

    if (studentName) {
      break;
    }

    const firstName =
      cleanValue(
        student.firstName ||
        student.first_name ||
        student.givenName ||
        student.given_name
      );

    const lastName =
      cleanValue(
        student.lastName ||
        student.last_name ||
        student.surname ||
        student.familyName ||
        student.family_name
      );

    if (
      firstName ||
      lastName
    ) {
      studentName =
        `${firstName} ${lastName}`.trim();

      break;
    }

    const nestedCandidates = [
      student.student,
      student.user,
      student.profile,
      student.data,
    ];

    for (
      const nested of nestedCandidates
    ) {
      studentName =
        findIdentityInObject(
          nested,
          nameKeys
        );

      if (studentName) {
        break;
      }

      const nestedFirstName =
        cleanValue(
          nested?.firstName ||
          nested?.first_name ||
          nested?.givenName ||
          nested?.given_name
        );

      const nestedLastName =
        cleanValue(
          nested?.lastName ||
          nested?.last_name ||
          nested?.surname ||
          nested?.familyName ||
          nested?.family_name
        );

      if (
        nestedFirstName ||
        nestedLastName
      ) {
        studentName =
          `${nestedFirstName} ${nestedLastName}`.trim();

        break;
      }
    }

    if (studentName) {
      break;
    }
  }

  return {
    studentReference:
      cleanValue(studentReference),

    studentId:
      cleanValue(studentId),

    enrollmentId:
      cleanValue(enrollmentId),

    studentName:
      cleanValue(studentName),
  };
};

/* ============================================================
   TOKEN
============================================================ */

const getAcademyToken = () => {
  for (
    const key of ACADEMY_TOKEN_KEYS
  ) {
    try {
      const token =
        localStorage.getItem(key);

      if (
        isUsableIdentity(token)
      ) {
        return token.trim();
      }
    } catch {
      // Ignore.
    }
  }

  return "";
};

/* ============================================================
   AUTH HEADERS
============================================================ */

const getAuthHeaders = () => {
  const token =
    getAcademyToken();

  return {
    "Content-Type":
      "application/json",

    Accept:
      "application/json",

    ...(token
      ? {
          Authorization:
            `Bearer ${token}`,
        }
      : {}),
  };
};

/* ============================================================
   NORMALIZE QUESTION
============================================================ */

const normalizeQuestion = (
  question,
  index
) => {
  return {
    ...question,

    id:
      question.id ??
      question.question_id ??
      question.questionId ??
      index + 1,

    question:
      question.question ??
      question.question_text ??
      question.text ??
      "",

    optionA:
      question.optionA ??
      question.option_a ??
      "",

    optionB:
      question.optionB ??
      question.option_b ??
      "",

    optionC:
      question.optionC ??
      question.option_c ??
      "",

    optionD:
      question.optionD ??
      question.option_d ??
      "",

    marks:
      Number(
        question.marks ??
        question.mark ??
        1
      ),
  };
};

/* ============================================================
   EXTRACT QUESTIONS
============================================================ */

const extractQuestions = (
  payload
) => {
  const possibleArrays = [
    payload?.assignment?.questions,
    payload?.questions,
    payload?.data?.assignment?.questions,
    payload?.data?.questions,
    payload?.result?.assignment?.questions,
    payload?.result?.questions,
  ];

  for (
    const candidate
    of possibleArrays
  ) {
    if (
      Array.isArray(candidate)
    ) {
      return candidate.map(
        (question, index) =>
          normalizeQuestion(
            question,
            index
          )
      );
    }
  }

  return [];
};

/* ============================================================
   EXTRACT ASSIGNMENT
============================================================ */

const extractAssignment = (
  payload
) => {
  return (
    payload?.assignment ||
    payload?.data?.assignment ||
    payload?.result?.assignment ||
    payload?.data ||
    payload?.result ||
    null
  );
};

/* ============================================================
   EXTRACT ERROR MESSAGE
============================================================ */

const extractServerMessage = (
  data,
  fallback
) => {
  if (
    typeof data === "string" &&
    data.trim()
  ) {
    return data.trim();
  }

  const message =
    data?.message ||
    data?.error ||
    data?.details ||
    data?.reason ||
    data?.data?.message ||
    data?.data?.error ||
    data?.result?.message ||
    data?.result?.error;

  if (
    typeof message === "string" &&
    message.trim()
  ) {
    return message.trim();
  }

  return fallback;
};

/* ============================================================
   EXTRACT SUBMISSION
============================================================ */

const extractSubmission = (
  data
) => {
  return (
    data?.submission ||
    data?.data?.submission ||
    data?.result?.submission ||
    data?.result ||
    data?.data ||
    null
  );
};

/* ============================================================
   COMPONENT
============================================================ */

export default function StudentAssignmentDetails() {
  const navigate =
    useNavigate();

  const location =
    useLocation();

  const params =
    useParams();

  /* ==========================================================
     ASSIGNMENT ID
  ========================================================== */

  const assignmentId =
    useMemo(() => {
      return (
        params.assignmentId ||
        params.id ||
        params.assignment_id ||
        location.state?.assignment?.id ||
        ""
      );
    }, [
      params.assignmentId,
      params.id,
      params.assignment_id,
      location.state,
    ]);

  /* ==========================================================
     STATE
  ========================================================== */

  const [
    assignment,
    setAssignment,
  ] = useState(null);

  const [
    questions,
    setQuestions,
  ] = useState([]);

  const [
    answers,
    setAnswers,
  ] = useState({});

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    submitError,
    setSubmitError,
  ] = useState("");

  const [
    submitted,
    setSubmitted,
  ] = useState(false);

  const [
    savedSubmission,
    setSavedSubmission,
  ] = useState(null);

  const [
    expandedQuestion,
    setExpandedQuestion,
  ] = useState(null);

  const [
    studentIdentity,
    setStudentIdentity,
  ] = useState({
    studentReference: "",
    studentId: "",
    enrollmentId: "",
    studentName: "",
  });

  /* ==========================================================
     LOAD IDENTITY
  ========================================================== */

  useEffect(() => {
    const identity =
      getStudentIdentity();

    setStudentIdentity(
      identity
    );

    console.log(
      "🎓 STUDENT IDENTITY FOUND:",
      identity
    );
  }, []);

  /* ==========================================================
     LOAD ASSIGNMENT
  ========================================================== */

  const loadAssignment =
    useCallback(
      async () => {
        if (!assignmentId) {
          setError(
            "Assignment ID was not found."
          );

          setLoading(false);

          return;
        }

        try {
          setLoading(true);
          setError("");

          const response =
            await fetch(
              `${API_URL}/api/academy/student/assignments/${encodeURIComponent(
                assignmentId
              )}`,
              {
                method: "GET",
                headers:
                  getAuthHeaders(),
              }
            );

          const data =
            await response
              .json()
              .catch(
                () => ({})
              );

          console.log(
            "📚 ASSIGNMENT DETAILS RESPONSE:",
            data
          );

          if (
            !response.ok
          ) {
            throw new Error(
              extractServerMessage(
                data,
                "Unable to load assignment."
              )
            );
          }

          const assignmentData =
            extractAssignment(
              data
            );

          const questionData =
            extractQuestions(
              data
            );

          if (!assignmentData) {
            throw new Error(
              "The assignment was not found."
            );
          }

          setAssignment(
            assignmentData
          );

          setQuestions(
            questionData
          );

          /*
           * If the backend returns existing answers
           * with the assignment, preload them.
           */
          const existingAnswers =
            data?.answers ||
            data?.data?.answers ||
            data?.assignment?.answers ||
            [];

          if (
            Array.isArray(
              existingAnswers
            )
          ) {
            const answerMap = {};

            existingAnswers.forEach(
              (item) => {
                const qid =
                  item.question_id ??
                  item.questionId ??
                  item.question?.id;

                const selected =
                  item.student_answer ??
                  item.studentAnswer ??
                  item.answer ??
                  item.selected_answer ??
                  "";

                if (
                  qid !== undefined &&
                  qid !== null
                ) {
                  answerMap[
                    String(qid)
                  ] = selected;
                }
              }
            );

            if (
              Object.keys(
                answerMap
              ).length
            ) {
              setAnswers(
                answerMap
              );
            }
          }

          console.log(
            "📝 QUESTIONS FOUND:",
            questionData.length
          );
        } catch (err) {
          console.error(
            "StudentAssignmentDetails load error:",
            err
          );

          setError(
            err?.message ||
              "Unable to load this assignment."
          );
        } finally {
          setLoading(false);
        }
      },
      [assignmentId]
    );

  useEffect(() => {
    loadAssignment();
  }, [
    loadAssignment,
  ]);

  /* ==========================================================
     HANDLE ANSWER
  ========================================================== */

  const handleAnswer = (
    questionId,
    answer
  ) => {
    setAnswers(
      (previous) => ({
        ...previous,

        [String(questionId)]:
          answer,
      })
    );

    setSubmitError("");
  };

  /* ==========================================================
     SUBMIT ASSIGNMENT
  ========================================================== */

  const submitAssignment =
    async () => {
      if (!assignment?.id) {
        setSubmitError(
          "This assignment does not have a valid ID."
        );

        return;
      }

      if (!questions.length) {
        setSubmitError(
          "This assignment has no questions."
        );

        return;
      }

      /* ------------------------------------------------------
         CHECK ANSWERS
      ------------------------------------------------------ */

      const unansweredQuestions =
        questions.filter(
          (question) => {
            const questionId =
              String(
                question.id
              );

            return !cleanValue(
              answers[
                questionId
              ]
            );
          }
        );

      if (
        unansweredQuestions.length
      ) {
        setSubmitError(
          `Please answer all questions before submitting. ${
            unansweredQuestions.length
          } question${
            unansweredQuestions.length ===
            1
              ? ""
              : "s"
          } remaining.`
        );

        return;
      }

      /* ------------------------------------------------------
         READ IDENTITY
      ------------------------------------------------------ */

      const identity =
        getStudentIdentity();

      setStudentIdentity(
        identity
      );

      const {
        studentReference,
        studentId,
        enrollmentId,
        studentName,
      } = identity;

      console.log(
        "📤 SUBMISSION IDENTITY:",
        identity
      );

      /*
       * Do not silently fail here.
       *
       * We require either enrollmentId OR studentReference.
       * The backend can use the reference to resolve the
       * student's enrollment when supported.
       */

      if (
        !enrollmentId &&
        !studentReference
      ) {
        setSubmitError(
          "Your student enrollment information could not be found. Please log out and log in again."
        );

        console.error(
          "❌ No enrollmentId or studentReference found:",
          identity
        );

        return;
      }

      try {
        setSubmitting(true);
        setSubmitError("");

        /* ----------------------------------------------------
           ANSWER MAP
        ---------------------------------------------------- */

        const answerMap = {};

        const answerList = [];

        questions.forEach(
          (question) => {
            const questionId =
              String(
                question.id
              );

            const selectedAnswer =
              cleanValue(
                answers[
                  questionId
                ]
              );

            answerMap[
              questionId
            ] =
              selectedAnswer;

            answerList.push({
              questionId:
                question.id,

              question_id:
                question.id,

              answer:
                selectedAnswer,

              studentAnswer:
                selectedAnswer,

              student_answer:
                selectedAnswer,
            });
          }
        );

        /* ----------------------------------------------------
           PAYLOAD
        ---------------------------------------------------- */

        const payload = {
          assignmentId:
            assignment.id,

          assignment_id:
            assignment.id,

          /*
           * Primary identity.
           */
          enrollmentId:
            enrollmentId || "",

          enrollment_id:
            enrollmentId || "",

          /*
           * Student reference.
           */
          studentReference:
            studentReference || "",

          student_reference:
            studentReference || "",

          reference:
            studentReference || "",

          /*
           * Compatibility only.
           */
          studentId:
            studentId || "",

          student_id:
            studentId || "",

          studentName:
            studentName ||
            "Student",

          student_name:
            studentName ||
            "Student",

          /*
           * Main answer format used by backend.
           */
          answers:
            answerMap,

          /*
           * Additional compatible answer format.
           */
          answerList:
            answerList,

          responses:
            answerMap,
        };

        console.log(
          "📤 SUBMITTING ASSIGNMENT PAYLOAD:",
          payload
        );

        console.log(
          "📝 ANSWER COUNT:",
          answerList.length
        );

        /* ----------------------------------------------------
           SEND
        ---------------------------------------------------- */

        const response =
          await fetch(
            `${API_URL}/api/academy/student/assignments/${encodeURIComponent(
              assignment.id
            )}/submit`,
            {
              method: "POST",

              headers:
                getAuthHeaders(),

              body:
                JSON.stringify(
                  payload
                ),
            }
          );

        const rawText =
          await response.text();

        let data = {};

        try {
          data =
            rawText
              ? JSON.parse(
                  rawText
                )
              : {};
        } catch {
          data = {
            message:
              rawText ||
              "The server returned an invalid response.",
          };
        }

        console.log(
          "📥 SUBMISSION HTTP STATUS:",
          response.status
        );

        console.log(
          "📥 SUBMISSION RESPONSE:",
          data
        );

        /* ----------------------------------------------------
           ALREADY SUBMITTED
        ---------------------------------------------------- */

        if (
          response.status === 409
        ) {
          const existingSubmission =
            extractSubmission(
              data
            );

          console.warn(
            "⚠️ ASSIGNMENT ALREADY SUBMITTED:",
            existingSubmission
          );

          if (
            existingSubmission
          ) {
            setSavedSubmission(
              existingSubmission
            );

            setSubmitted(
              true
            );

            return;
          }

          throw new Error(
            extractServerMessage(
              data,
              "This assignment has already been submitted."
            )
          );
        }

        /* ----------------------------------------------------
           OTHER SERVER ERROR
        ---------------------------------------------------- */

        if (
          !response.ok
        ) {
          throw new Error(
            extractServerMessage(
              data,
              `Unable to submit assignment. Server returned ${response.status}.`
            )
          );
        }

        /* ----------------------------------------------------
           SAVE SUBMISSION
        ---------------------------------------------------- */

        const saved =
          extractSubmission(
            data
          );

        console.log(
          "✅ ASSIGNMENT SUBMITTED:",
          saved
        );

        /*
         * The backend should return a submission.
         *
         * Even if it does not, don't treat a successful
         * HTTP response as a failed submission.
         */
        setSavedSubmission(
          saved
        );

        setSubmitted(
          true
        );

        setAssignment(
          (previous) =>
            previous
              ? {
                  ...previous,
                  status:
                    "submitted",
                }
              : previous
        );
      } catch (err) {
        console.error(
          "❌ ASSIGNMENT SUBMISSION ERROR:",
          err
        );

        setSubmitError(
          err?.message ||
            "Unable to submit assignment."
        );
      } finally {
        setSubmitting(
          false
        );
      }
    };

  /* ==========================================================
     BACK
  ========================================================== */

  const goBack = () => {
    navigate(
      "/academy/student/assignments"
    );
  };

  /* ==========================================================
     LOADING
  ========================================================== */

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050816] text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2
            size={34}
            className="animate-spin text-cyan-400"
          />

          <p className="text-slate-400">
            Loading assignment...
          </p>
        </div>
      </div>
    );
  }

  /* ==========================================================
     ERROR
  ========================================================== */

  if (error) {
    return (
      <div className="min-h-screen bg-[#050816] text-white px-6 py-10">
        <div className="max-w-3xl mx-auto">
          <button
            type="button"
            onClick={goBack}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition mb-8"
          >
            <ArrowLeft size={18} />

            Back to Assignments
          </button>

          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6">
            <div className="flex items-start gap-3">
              <AlertCircle
                size={22}
                className="text-red-400 mt-0.5"
              />

              <div>
                <h2 className="font-semibold text-red-300">
                  Unable to load assignment
                </h2>

                <p className="text-sm text-red-200/80 mt-2">
                  {error}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ==========================================================
     NO ASSIGNMENT
  ========================================================== */

  if (!assignment) {
    return (
      <div className="min-h-screen bg-[#050816] text-white px-6 py-10">
        <div className="max-w-3xl mx-auto">
          <button
            type="button"
            onClick={goBack}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition mb-8"
          >
            <ArrowLeft size={18} />

            Back to Assignments
          </button>

          <div className="rounded-2xl border border-white/10 bg-[#071426] p-8 text-center">
            <FileText
              size={42}
              className="mx-auto text-slate-500 mb-4"
            />

            <h2 className="text-xl font-semibold">
              Assignment not found
            </h2>
          </div>
        </div>
      </div>
    );
  }

  /* ==========================================================
     SUBMITTED
  ========================================================== */

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#050816] text-white px-6 py-10">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="rounded-3xl border border-emerald-500/20 bg-[#071426] p-8 md:p-10 text-center"
          >
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2
                size={34}
                className="text-emerald-400"
              />
            </div>

            <h1 className="text-2xl md:text-3xl font-bold">
              Assignment Submitted
            </h1>

            <p className="text-slate-400 mt-3 max-w-xl mx-auto">
              Your answers have been
              successfully submitted.
              Your tutor can now review
              your submission.
            </p>

            {savedSubmission ? (
              <div className="mt-6 space-y-3">
                {savedSubmission.id ? (
                  <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-slate-300">
                    <Award
                      size={17}
                      className="text-cyan-400"
                    />

                    Submission ID:

                    <span className="font-mono text-white">
                      {
                        savedSubmission.id
                      }
                    </span>
                  </div>
                ) : null}

                {savedSubmission.score !==
                undefined ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
                    <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                      <p className="text-xs text-slate-500">
                        Score
                      </p>

                      <p className="text-xl font-bold mt-1">
                        {
                          savedSubmission.score
                        }
                        /
                        {
                          savedSubmission.totalMarks ??
                          savedSubmission.total_marks ??
                          0
                        }
                      </p>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                      <p className="text-xs text-slate-500">
                        Percentage
                      </p>

                      <p className="text-xl font-bold mt-1">
                        {
                          savedSubmission.percentage ??
                          0
                        }
                        %
                      </p>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                      <p className="text-xs text-slate-500">
                        Grade
                      </p>

                      <p className="text-xl font-bold mt-1">
                        {
                          savedSubmission.grade ??
                          "—"
                        }
                      </p>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}

            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <button
                type="button"
                onClick={goBack}
                className="px-5 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition"
              >
                Back to Assignments
              </button>

              <button
                type="button"
                onClick={() =>
                  navigate(
                    `/academy/student/assignments/${assignment.id}/result`
                  )
                }
                className="px-5 py-3 rounded-xl bg-cyan-500 text-slate-950 font-semibold hover:bg-cyan-400 transition"
              >
                View Result
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  /* ==========================================================
     MAIN PAGE
  ========================================================== */

  return (
    <div className="min-h-screen bg-[#050816] text-white px-4 sm:px-6 py-6 sm:py-10">
      <div className="max-w-4xl mx-auto">

        {/* BACK */}

        <button
          type="button"
          onClick={goBack}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition mb-6"
        >
          <ArrowLeft size={18} />

          Back to Assignments
        </button>

        {/* HEADER */}

        <div className="rounded-3xl border border-white/10 bg-[#071426] p-6 sm:p-8 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
              <FileText
                size={23}
                className="text-cyan-400"
              />
            </div>

            <div className="min-w-0 flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold">
                {assignment.title ||
                  "Assignment"}
              </h1>

              {assignment.subject ? (
                <p className="text-cyan-400 text-sm mt-2">
                  {
                    assignment.subject
                  }
                </p>
              ) : null}

              {assignment.description ? (
                <p className="text-slate-400 mt-3 leading-relaxed">
                  {
                    assignment.description
                  }
                </p>
              ) : null}

              <div className="flex flex-wrap gap-3 mt-5">
                <div className="inline-flex items-center gap-2 rounded-lg bg-black/20 border border-white/5 px-3 py-2 text-xs text-slate-400">
                  <FileText size={14} />

                  {questions.length}{" "}

                  {questions.length ===
                  1
                    ? "Question"
                    : "Questions"}
                </div>

                {assignment.due_date ||
                assignment.dueDate ? (
                  <div className="inline-flex items-center gap-2 rounded-lg bg-black/20 border border-white/5 px-3 py-2 text-xs text-slate-400">
                    <Clock3
                      size={14}
                    />

                    Due{" "}

                    {new Date(
                      assignment.due_date ||
                      assignment.dueDate
                    ).toLocaleDateString()}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        {/* NO QUESTIONS */}

        {!questions.length ? (
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-6">
            <div className="flex items-start gap-3">
              <AlertCircle
                size={22}
                className="text-amber-400 mt-0.5"
              />

              <div>
                <h2 className="font-semibold text-amber-300">
                  No Questions Available
                </h2>

                <p className="text-sm text-amber-200/70 mt-2">
                  This assignment has
                  been created, but no
                  questions have been
                  added yet.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* QUESTIONS */}

            <div className="space-y-4">
              {questions.map(
                (
                  question,
                  index
                ) => {
                  const questionId =
                    String(
                      question.id
                    );

                  const selectedAnswer =
                    answers[
                      questionId
                    ] || "";

                  const expanded =
                    expandedQuestion ===
                    questionId;

                  return (
                    <motion.div
                      key={
                        questionId
                      }
                      initial={{
                        opacity: 0,
                        y: 10,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      transition={{
                        delay:
                          index *
                          0.03,
                      }}
                      className="rounded-2xl border border-white/10 bg-[#071426] overflow-hidden"
                    >
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedQuestion(
                            expanded
                              ? null
                              : questionId
                          )
                        }
                        className="w-full flex items-center justify-between gap-4 p-5 text-left hover:bg-white/[0.02] transition"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-sm font-semibold">
                            {
                              index +
                              1
                            }
                          </div>

                          <div>
                            <p className="font-medium leading-relaxed">
                              {
                                question.question ||
                                "Question"
                              }
                            </p>

                            <p className="text-xs text-slate-500 mt-2">
                              {
                                question.marks ||
                                1
                              }{" "}
                              mark
                              {(question.marks ||
                                1) !==
                              1
                                ? "s"
                                : ""}
                            </p>
                          </div>
                        </div>

                        {expanded ? (
                          <ChevronUp
                            size={19}
                            className="text-slate-500 shrink-0"
                          />
                        ) : (
                          <ChevronDown
                            size={19}
                            className="text-slate-500 shrink-0"
                          />
                        )}
                      </button>

                      {expanded ? (
                        <div className="px-5 pb-5">
                          <div className="border-t border-white/5 pt-5 space-y-3">
                            {[
                              [
                                "A",
                                question.optionA,
                              ],
                              [
                                "B",
                                question.optionB,
                              ],
                              [
                                "C",
                                question.optionC,
                              ],
                              [
                                "D",
                                question.optionD,
                              ],
                            ].map(
                              ([
                                letter,
                                option,
                              ]) => {
                                if (
                                  !option
                                ) {
                                  return null;
                                }

                                const isSelected =
                                  selectedAnswer ===
                                    letter ||
                                  selectedAnswer ===
                                    option;

                                return (
                                  <button
                                    key={
                                      letter
                                    }
                                    type="button"
                                    onClick={() =>
                                      handleAnswer(
                                        questionId,
                                        letter
                                      )
                                    }
                                    className={`w-full text-left rounded-xl border px-4 py-3 transition ${
                                      isSelected
                                        ? "border-cyan-400/50 bg-cyan-400/10"
                                        : "border-white/10 bg-black/10 hover:bg-white/[0.03]"
                                    }`}
                                  >
                                    <div className="flex items-center gap-3">
                                      <span
                                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-semibold ${
                                          isSelected
                                            ? "bg-cyan-400 text-slate-950"
                                            : "bg-white/5 text-slate-300"
                                        }`}
                                      >
                                        {
                                          letter
                                        }
                                      </span>

                                      <span className="text-sm text-slate-200">
                                        {
                                          option
                                        }
                                      </span>
                                    </div>
                                  </button>
                                );
                              }
                            )}
                          </div>

                          {selectedAnswer ? (
                            <div className="mt-4 flex items-center gap-2 text-xs text-emerald-400">
                              <CheckCircle2
                                size={15}
                              />

                              Answer selected
                            </div>
                          ) : null}
                        </div>
                      ) : null}
                    </motion.div>
                  );
                }
              )}
            </div>

            {/* SUBMIT ERROR */}

            {submitError ? (
              <div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/10 p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle
                    size={19}
                    className="text-red-400 mt-0.5 shrink-0"
                  />

                  <div className="flex-1">
                    <p className="text-sm text-red-300">
                      {
                        submitError
                      }
                    </p>
                  </div>
                </div>
              </div>
            ) : null}

            {/* SUBMIT */}

            <div className="mt-8 rounded-2xl border border-white/10 bg-[#071426] p-5 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
                <div>
                  <h2 className="font-semibold">
                    Ready to submit?
                  </h2>

                  <p className="text-sm text-slate-500 mt-1">
                    Make sure you
                    have answered
                    every question
                    before
                    submitting.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={
                    submitAssignment
                  }
                  disabled={
                    submitting
                  }
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-cyan-500 text-slate-950 font-semibold hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {submitting ? (
                    <>
                      <Loader2
                        size={18}
                        className="animate-spin"
                      />

                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send
                        size={18}
                      />

                      Submit Assignment
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* IDENTITY DEBUG INFO */}

            <div className="mt-5 rounded-xl border border-white/5 bg-black/10 p-4">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <RefreshCw
                  size={13}
                />

                <span>
                  Enrollment:
                </span>

                <span className="font-mono text-slate-400">
                  {studentIdentity.enrollmentId ||
                    "not found"}
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
