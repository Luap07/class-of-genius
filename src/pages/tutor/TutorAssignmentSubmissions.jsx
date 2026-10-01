import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock3,
  FileText,
  Loader2,
  RefreshCw,
  User,
  XCircle,
} from "lucide-react";

// ============================================================
// API
// ============================================================

const API_BASE_URL = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000"
).replace(/\/$/, "");

const ASSIGNMENTS_URL =
  `${API_BASE_URL}/api/academy/tutor/assignments`;

// ============================================================
// HELPERS
// ============================================================

const clean = (value) => {
  if (
    value === undefined ||
    value === null
  ) {
    return "";
  }

  return String(value).trim();
};

const formatNumber = (value) => {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return 0;
  }

  return number;
};

// ============================================================
// TUTOR REFERENCE
// ============================================================

const getTutorReference = () => {
  const possibleKeys = [
    "scholiqen_academy_user",
    "tutorReference",
    "tutor_reference",
    "tutor",
    "academyTutor",
  ];

  for (const key of possibleKeys) {
    try {
      const raw = localStorage.getItem(key);

      if (!raw) {
        continue;
      }

      let value = raw;

      try {
        value = JSON.parse(raw);
      } catch {
        // Plain string.
      }

      const references = [
        typeof value === "string"
          ? value
          : null,

        value?.reference,
        value?.tutorReference,
        value?.tutor_reference,
        value?.applicationReference,
        value?.application_reference,
      ];

      for (const referenceValue of references) {
        const reference = clean(referenceValue);

        if (
          reference &&
          reference.toUpperCase().startsWith("SQA-")
        ) {
          return reference;
        }
      }
    } catch {
      // Ignore malformed localStorage values.
    }
  }

  return "";
};

// ============================================================
// TOKEN
// ============================================================

const getToken = () => {
  const keys = [
    "scholiqen_academy_token",
    "academy_token",
    "scholiqen_token",
    "access_token",
    "token",
  ];

  for (const key of keys) {
    try {
      const value = localStorage.getItem(key);

      if (value) {
        return value;
      }
    } catch {
      // Ignore localStorage errors.
    }
  }

  return "";
};

// ============================================================
// ERROR
// ============================================================

const getErrorMessage = (
  error,
  fallback
) => {
  if (
    error?.message &&
    !error.message.includes("HTTP")
  ) {
    return error.message;
  }

  return fallback;
};

// ============================================================
// SUBMISSION ID
// ============================================================

const getSubmissionId = (
  submission
) => {
  return (
    submission?.submissionId ??
    submission?.submission_id ??
    submission?.id ??
    null
  );
};

// ============================================================
// STUDENT REFERENCE
// ============================================================

const getStudentReference = (
  submission
) => {
  return clean(
    submission?.studentReference ??
    submission?.student_reference ??
    submission?.reference ??
    ""
  );
};

// ============================================================
// STUDENT ID
// ============================================================

const getStudentId = (
  submission
) => {
  return clean(
    submission?.studentId ??
    submission?.student_id ??
    submission?.enrollmentId ??
    submission?.enrollment_id ??
    ""
  );
};

// ============================================================
// STUDENT NAME
// ============================================================

const getStudentName = (
  submission
) => {
  return (
    clean(
      submission?.studentName ??
      submission?.student_name ??
      submission?.name ??
      ""
    ) ||
    getStudentReference(submission) ||
    getStudentId(submission) ||
    "Student"
  );
};

// ============================================================
// DATE
// ============================================================

const formatDate = (
  value
) => {
  if (!value) {
    return "Unknown date";
  }

  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return String(value);
  }

  return date.toLocaleString(
    undefined,
    {
      dateStyle: "medium",
      timeStyle: "short",
    }
  );
};

// ============================================================
// ANSWER NORMALIZER
// ============================================================

const normalizeAnswer = (
  answer,
  index = 0
) => {
  if (!answer) {
    return null;
  }

  const question =
    typeof answer.question === "object" &&
    answer.question !== null
      ? (
          answer.question.text ??
          answer.question.question ??
          ""
        )
      : (
          answer.question ??
          answer.questionText ??
          answer.question_text ??
          ""
        );

  const studentAnswer =
    answer.studentAnswer ??
    answer.student_answer ??
    answer.answer ??
    answer.selectedAnswer ??
    answer.selected_answer ??
    answer.response ??
    answer.response_text ??
    "";

  const correctAnswer =
    answer.correctAnswer ??
    answer.correct_answer ??
    answer.answerKey ??
    answer.answer_key ??
    answer.questionCorrectAnswer ??
    answer.question_correct_answer ??
    "";

  const marksAwarded =
    formatNumber(
      answer.marksAwarded ??
      answer.marks_awarded ??
      answer.score ??
      0
    );

  const marks =
    formatNumber(
      answer.marks ??
      answer.maxMarks ??
      answer.max_marks ??
      answer.questionMarks ??
      answer.question_marks ??
      0
    );

  const isCorrect =
    answer.isCorrect === true ||
    answer.is_correct === true ||
    String(
      answer.isCorrect ??
      answer.is_correct ??
      ""
    ).toLowerCase() === "true";

  return {
    ...answer,

    id:
      answer.id ??
      answer.answerId ??
      answer.answer_id ??
      `${index}`,

    answerId:
      answer.answerId ??
      answer.answer_id ??
      answer.id ??
      `${index}`,

    submissionId:
      answer.submissionId ??
      answer.submission_id ??
      null,

    questionId:
      answer.questionId ??
      answer.question_id ??
      (
        typeof answer.question === "object"
          ? answer.question?.id
          : null
      ) ??
      null,

    questionNumber:
      answer.questionNumber ??
      answer.question_number ??
      answer.number ??
      index + 1,

    question: clean(question),

    optionA: clean(
      answer.optionA ??
      answer.option_a ??
      ""
    ),

    optionB: clean(
      answer.optionB ??
      answer.option_b ??
      ""
    ),

    optionC: clean(
      answer.optionC ??
      answer.option_c ??
      ""
    ),

    optionD: clean(
      answer.optionD ??
      answer.option_d ??
      ""
    ),

    studentAnswer:
      clean(studentAnswer),

    correctAnswer:
      clean(correctAnswer),

    marksAwarded,

    marks,

    isCorrect,

    reason:
      answer.reason ??
      answer.explanation ??
      "",
  };
};

// ============================================================
// ANSWER LIST NORMALIZER
// ============================================================

const getAnswers = (
  submission
) => {
  if (!submission) {
    return [];
  }

  const possibleArrays = [
    submission.answers,
    submission.submittedAnswers,
    submission.submitted_answers,
    submission.answerRecords,
    submission.answer_records,
    submission.responses,
    submission.data?.answers,
    submission.data?.submittedAnswers,
    submission.data?.submitted_answers,
  ];

  for (const possible of possibleArrays) {
    if (Array.isArray(possible)) {
      return possible
        .map(normalizeAnswer)
        .filter(Boolean);
    }
  }

  return [];
};

// ============================================================
// ASSIGNMENT NORMALIZER
// ============================================================

const normalizeAssignment = (
  assignment
) => {
  if (!assignment) {
    return null;
  }

  return {
    ...assignment,

    id:
      assignment.id ??
      assignment.assignmentId ??
      assignment.assignment_id,

    title:
      assignment.title ||
      "Assignment",

    subject:
      assignment.subject ||
      assignment.subjectName ||
      assignment.subject_name ||
      "",

    grade:
      assignment.grade ||
      assignment.className ||
      assignment.class_name ||
      assignment.class ||
      "",

    totalQuestions:
      assignment.totalQuestions ??
      assignment.total_questions ??
      assignment.questionCount ??
      assignment.question_count ??
      0,

    totalMarks:
      formatNumber(
        assignment.totalMarks ??
        assignment.total_marks ??
        assignment.maxMarks ??
        assignment.max_marks ??
        0
      ),
  };
};

// ============================================================
// SUBMISSION NORMALIZER
// ============================================================

const normalizeSubmission = (
  submission,
  assignment
) => {
  if (!submission) {
    return null;
  }

  const answers =
    getAnswers(submission);

  const score =
    formatNumber(
      submission.score ??
      submission.marksObtained ??
      submission.marks_obtained ??
      0
    );

  const totalMarks =
    formatNumber(
      submission.totalMarks ??
      submission.total_marks ??
      submission.maxMarks ??
      submission.max_marks ??
      assignment?.totalMarks ??
      answers.reduce(
        (
          total,
          answer
        ) =>
          total +
          formatNumber(
            answer.marks
          ),
        0
      )
    );

  let percentage =
    submission.percentage;

  if (
    percentage === undefined ||
    percentage === null
  ) {
    percentage =
      totalMarks > 0
        ? Number(
            (
              (score /
                totalMarks) *
              100
            ).toFixed(2)
          )
        : 0;
  }

  return {
    ...submission,

    id:
      getSubmissionId(
        submission
      ),

    submissionId:
      getSubmissionId(
        submission
      ),

    assignmentId:
      submission.assignmentId ??
      submission.assignment_id ??
      assignment?.id ??
      "",

    studentId:
      getStudentId(
        submission
      ),

    studentReference:
      getStudentReference(
        submission
      ),

    studentName:
      getStudentName(
        submission
      ),

    score,

    totalMarks,

    percentage:
      formatNumber(
        percentage
      ),

    grade:
      submission.grade ||
      "",

    status:
      submission.status ||
      "submitted",

    submittedAt:
      submission.submittedAt ||
      submission.submitted_at ||
      submission.createdAt ||
      submission.created_at ||
      null,

    resultReleased:
      submission.resultReleased ===
        true ||
      submission.result_released ===
        true,

    answers,

    answerCount:
      answers.length,
  };
};

// ============================================================
// COMPONENT
// ============================================================

export default function TutorAssignmentSubmissions() {
  const navigate =
    useNavigate();

  const params =
    useParams();

  // ==========================================================
  // ASSIGNMENT ID
  // ==========================================================

  const assignmentId =
    useMemo(() => {
      return (
        params.assignmentId ||
        params.assignment_id ||
        params.id ||
        ""
      );
    }, [
      params.assignmentId,
      params.assignment_id,
      params.id,
    ]);

  // ==========================================================
  // STATE
  // ==========================================================

  const [
    tutorReference,
    setTutorReference,
  ] = useState("");

  const [
    assignment,
    setAssignment,
  ] = useState(null);

  const [
    submissions,
    setSubmissions,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    expandedSubmission,
    setExpandedSubmission,
  ] = useState(null);

  const [
    loadingAnswers,
    setLoadingAnswers,
  ] = useState({});

  const [
    answerErrors,
    setAnswerErrors,
  ] = useState({});

  // ==========================================================
  // HEADERS
  // ==========================================================

  const buildHeaders =
    useCallback(() => {
      const token =
        getToken();

      const reference =
        getTutorReference();

      const headers = {
        Accept:
          "application/json",
      };

      if (token) {
        headers.Authorization =
          `Bearer ${token}`;
      }

      if (reference) {
        headers[
          "x-tutor-reference"
        ] = reference;
      }

      return headers;
    }, []);

  // ==========================================================
  // LOAD ASSIGNMENT + SUBMISSIONS
  // ==========================================================

  const loadData =
    useCallback(
      async ({
        silent = false,
      } = {}) => {
        if (!assignmentId) {
          setError(
            "Assignment ID could not be found in the URL."
          );

          setLoading(false);

          return;
        }

        const reference =
          getTutorReference();

        setTutorReference(
          reference
        );

        if (!silent) {
          setLoading(true);
        }

        if (silent) {
          setRefreshing(true);
        }

        setError("");

        try {
          const query =
            new URLSearchParams();

          if (reference) {
            query.set(
              "reference",
              reference
            );

            query.set(
              "tutorReference",
              reference
            );
          }

          const encodedId =
            encodeURIComponent(
              assignmentId
            );

          const queryString =
            query.toString();

          const assignmentUrl =
            `${ASSIGNMENTS_URL}/${encodedId}${
              queryString
                ? `?${queryString}`
                : ""
            }`;

          const submissionsUrl =
            `${ASSIGNMENTS_URL}/${encodedId}/submissions${
              queryString
                ? `?${queryString}`
                : ""
            }`;

          const headers =
            buildHeaders();

          console.log(
            "=============================================="
          );

          console.log(
            "📚 TUTOR ASSIGNMENT SUBMISSIONS"
          );

          console.log(
            "Assignment ID:",
            assignmentId
          );

          console.log(
            "Tutor Reference:",
            reference ||
              "NONE"
          );

          console.log(
            "Submissions URL:",
            submissionsUrl
          );

          console.log(
            "=============================================="
          );

          const [
            assignmentResponse,
            submissionsResponse,
          ] = await Promise.all([
            fetch(
              assignmentUrl,
              {
                method: "GET",
                headers,
              }
            ),

            fetch(
              submissionsUrl,
              {
                method: "GET",
                headers,
              }
            ),
          ]);

          let assignmentData =
            {};

          let submissionsData =
            {};

          try {
            assignmentData =
              await assignmentResponse.json();
          } catch {
            assignmentData = {};
          }

          try {
            submissionsData =
              await submissionsResponse.json();
          } catch {
            submissionsData = {};
          }

          console.log(
            "📌 Assignment HTTP:",
            assignmentResponse.status
          );

          console.log(
            "📌 Submissions HTTP:",
            submissionsResponse.status
          );

          console.log(
            "📌 Assignment response:",
            assignmentData
          );

          console.log(
            "📌 Submissions response:",
            submissionsData
          );

          if (
            !assignmentResponse.ok
          ) {
            throw new Error(
              assignmentData?.message ||
              "Unable to load assignment."
            );
          }

          if (
            !submissionsResponse.ok
          ) {
            throw new Error(
              submissionsData?.message ||
              "Unable to load submissions."
            );
          }

          // ==================================================
          // ASSIGNMENT
          // ==================================================

          const loadedAssignment =
            assignmentData?.assignment ||
            assignmentData?.data?.assignment ||
            assignmentData?.data ||
            null;

          const normalizedAssignment =
            normalizeAssignment(
              loadedAssignment
            );

          setAssignment(
            normalizedAssignment
          );

          // ==================================================
          // SUBMISSIONS
          // ==================================================

          let loadedSubmissions =
            [];

          if (
            Array.isArray(
              submissionsData?.submissions
            )
          ) {
            loadedSubmissions =
              submissionsData.submissions;
          } else if (
            Array.isArray(
              submissionsData?.results
            )
          ) {
            loadedSubmissions =
              submissionsData.results;
          } else if (
            Array.isArray(
              submissionsData?.data?.submissions
            )
          ) {
            loadedSubmissions =
              submissionsData.data.submissions;
          } else if (
            Array.isArray(
              submissionsData?.data
            )
          ) {
            loadedSubmissions =
              submissionsData.data;
          } else if (
            Array.isArray(
              submissionsData?.result
            )
          ) {
            loadedSubmissions =
              submissionsData.result;
          }

          const normalized =
            loadedSubmissions
              .map(
                (submission) =>
                  normalizeSubmission(
                    submission,
                    normalizedAssignment
                  )
              )
              .filter(Boolean);

          console.log(
            "✅ NORMALIZED SUBMISSIONS:",
            normalized
          );

          setSubmissions(
            normalized
          );

          // ==================================================
          // IMPORTANT
          //
          // Automatically select the most recent submission
          // when the API returns multiple records for the
          // same student.
          // ==================================================

          if (normalized.length > 0) {
            const sorted =
              [...normalized].sort(
                (a, b) => {
                  const dateA =
                    new Date(
                      a.submittedAt || 0
                    ).getTime();

                  const dateB =
                    new Date(
                      b.submittedAt || 0
                    ).getTime();

                  if (
                    dateA !== dateB
                  ) {
                    return (
                      dateB - dateA
                    );
                  }

                  return (
                    Number(
                      b.id || 0
                    ) -
                    Number(
                      a.id || 0
                    )
                  );
                }
              );

            console.log(
              "🎯 Most recent submission:",
              sorted[0]
            );
          }
        } catch (requestError) {
          console.error(
            "❌ Tutor submissions error:",
            requestError
          );

          setError(
            getErrorMessage(
              requestError,
              "Unable to load submitted assignments."
            )
          );

          setSubmissions([]);
        } finally {
          setLoading(false);
          setRefreshing(false);
        }
      },
      [
        assignmentId,
        buildHeaders,
      ]
    );

  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ==========================================================
  // LOAD FULL SUBMISSION
  // ==========================================================

  const loadSubmissionAnswers =
    useCallback(
      async (submission) => {
        const submissionId =
          getSubmissionId(
            submission
          );

        if (!submissionId) {
          console.error(
            "❌ Cannot load answers: submission ID missing.",
            submission
          );

          setAnswerErrors(
            (current) => ({
              ...current,
              unknown:
                "The submission ID could not be found.",
            })
          );

          return;
        }

        // ----------------------------------------------------
        // If answers are already available, do not request
        // them again.
        // ----------------------------------------------------

        if (
          Array.isArray(
            submission.answers
          ) &&
          submission.answers.length > 0
        ) {
          return;
        }

        setLoadingAnswers(
          (current) => ({
            ...current,
            [submissionId]: true,
          })
        );

        setAnswerErrors(
          (current) => ({
            ...current,
            [submissionId]: "",
          })
        );

        try {
          const reference =
            tutorReference ||
            getTutorReference();

          const query =
            new URLSearchParams();

          if (reference) {
            query.set(
              "reference",
              reference
            );

            query.set(
              "tutorReference",
              reference
            );
          }

          const queryString =
            query.toString();

          const url =
            `${ASSIGNMENTS_URL}/${encodeURIComponent(
              assignmentId
            )}/submissions/${encodeURIComponent(
              submissionId
            )}${
              queryString
                ? `?${queryString}`
                : ""
            }`;

          console.log(
            "📥 Loading FULL tutor submission:",
            {
              assignmentId,
              submissionId,
              url,
            }
          );

          const response =
            await fetch(
              url,
              {
                method: "GET",
                headers:
                  buildHeaders(),
              }
            );

          let data = {};

          try {
            data =
              await response.json();
          } catch {
            data = {};
          }

          console.log(
            "📥 FULL SUBMISSION HTTP:",
            response.status
          );

          console.log(
            "📥 FULL SUBMISSION RESPONSE:",
            data
          );

          if (!response.ok) {
            throw new Error(
              data?.message ||
              data?.error ||
              "Unable to load submission answers."
            );
          }

          // --------------------------------------------------
          // Find the actual submission object.
          // --------------------------------------------------

          const fullSubmission =
            data?.submission ||
            data?.data?.submission ||
            (
              data?.data &&
              !Array.isArray(data.data)
                ? data.data
                : null
            ) ||
            data?.result ||
            null;

          // --------------------------------------------------
          // Find answer array directly from response first.
          //
          // This is important because the backend currently
          // returns:
          //
          // {
          //   submission,
          //   answers,
          //   data: {
          //     submission,
          //     answers
          //   }
          // }
          // --------------------------------------------------

          let fullAnswers = [];

          if (
            Array.isArray(
              data?.answers
            )
          ) {
            fullAnswers =
              data.answers;
          } else if (
            Array.isArray(
              data?.data?.answers
            )
          ) {
            fullAnswers =
              data.data.answers;
          } else if (
            Array.isArray(
              fullSubmission?.answers
            )
          ) {
            fullAnswers =
              fullSubmission.answers;
          } else {
            fullAnswers =
              getAnswers(
                fullSubmission
              );
          }

          fullAnswers =
            fullAnswers
              .map(
                normalizeAnswer
              )
              .filter(Boolean);

          console.log(
            "📝 FULL ANSWERS:",
            fullAnswers
          );

          // --------------------------------------------------
          // Verify that the server returned the same
          // submission that we requested.
          // --------------------------------------------------

          const returnedSubmissionId =
            getSubmissionId(
              fullSubmission
            );

          console.log(
            "🔐 Requested submission:",
            submissionId
          );

          console.log(
            "🔐 Returned submission:",
            returnedSubmissionId
          );

          if (
            returnedSubmissionId &&
            String(
              returnedSubmissionId
            ) !==
              String(
                submissionId
              )
          ) {
            throw new Error(
              `The server returned submission ${returnedSubmissionId} instead of submission ${submissionId}.`
            );
          }

          // --------------------------------------------------
          // If answers are empty, make one direct diagnostic
          // request through the same endpoint response shape.
          // --------------------------------------------------

          if (
            fullAnswers.length === 0
          ) {
            console.warn(
              "⚠️ Submission exists but answer array is empty.",
              {
                submissionId,
                response: data,
              }
            );

            setAnswerErrors(
              (current) => ({
                ...current,
                [submissionId]:
                  "The submission was found, but the server returned no answer records.",
              })
            );

            // Keep the submission open so the tutor can see
            // the actual diagnostic state.
            setSubmissions(
              (current) =>
                current.map(
                  (item) => {
                    const itemId =
                      getSubmissionId(
                        item
                      );

                    if (
                      String(
                        itemId
                      ) !==
                      String(
                        submissionId
                      )
                    ) {
                      return item;
                    }

                    return {
                      ...item,
                      answers: [],
                      answerCount: 0,
                    };
                  }
                )
            );

            return;
          }

          // --------------------------------------------------
          // Merge server submission + server answers.
          // --------------------------------------------------

          setSubmissions(
            (current) =>
              current.map(
                (item) => {
                  const itemId =
                    getSubmissionId(
                      item
                    );

                  if (
                    String(
                      itemId
                    ) !==
                    String(
                      submissionId
                    )
                  ) {
                    return item;
                  }

                  const merged =
                    {
                      ...item,
                      ...(fullSubmission || {}),

                      id:
                        itemId,

                      submissionId:
                        itemId,

                      studentId:
                        getStudentId(
                          fullSubmission
                        ) ||
                        item.studentId,

                      studentReference:
                        getStudentReference(
                          fullSubmission
                        ) ||
                        item.studentReference,

                      studentName:
                        getStudentName(
                          fullSubmission
                        ) ||
                        item.studentName,

                      score:
                        formatNumber(
                          fullSubmission?.score ??
                          item.score
                        ),

                      totalMarks:
                        formatNumber(
                          fullSubmission?.totalMarks ??
                          fullSubmission?.total_marks ??
                          item.totalMarks
                        ),

                      percentage:
                        formatNumber(
                          fullSubmission?.percentage ??
                          item.percentage
                        ),

                      grade:
                        fullSubmission?.grade ||
                        item.grade ||
                        "",

                      status:
                        fullSubmission?.status ||
                        item.status ||
                        "submitted",

                      submittedAt:
                        fullSubmission?.submittedAt ||
                        fullSubmission?.submitted_at ||
                        item.submittedAt ||
                        null,

                      resultReleased:
                        fullSubmission?.resultReleased ===
                          true ||
                        fullSubmission?.result_released ===
                          true ||
                        item.resultReleased ===
                          true,

                      answers:
                        fullAnswers,

                      answerCount:
                        fullAnswers.length,
                    };

                  return merged;
                }
              )
          );

          setAnswerErrors(
            (current) => ({
              ...current,
              [submissionId]: "",
            })
          );

          console.log(
            "✅ ANSWERS LOADED SUCCESSFULLY:",
            {
              submissionId,
              answerCount:
                fullAnswers.length,
              answers:
                fullAnswers,
            }
          );
        } catch (requestError) {
          console.error(
            "❌ Full submission error:",
            requestError
          );

          setAnswerErrors(
            (current) => ({
              ...current,
              [submissionId]:
                getErrorMessage(
                  requestError,
                  "Unable to load the student's answers."
                ),
            })
          );
        } finally {
          setLoadingAnswers(
            (current) => ({
              ...current,
              [submissionId]: false,
            })
          );
        }
      },
      [
        assignmentId,
        buildHeaders,
        tutorReference,
      ]
    );

  // ==========================================================
  // TOGGLE
  // ==========================================================

  const toggleSubmission =
    async (
      submission
    ) => {
      const submissionId =
        getSubmissionId(
          submission
        );

      if (!submissionId) {
        return;
      }

      const willExpand =
        String(
          expandedSubmission
        ) !==
        String(
          submissionId
        );

      setExpandedSubmission(
        willExpand
          ? submissionId
          : null
      );

      if (willExpand) {
        await loadSubmissionAnswers(
          submission
        );
      }
    };

  // ==========================================================
  // OPEN GRADING PAGE
  // ==========================================================

  const openGradePage = (
    submission
  ) => {
    const submissionId =
      getSubmissionId(
        submission
      );

    if (!submissionId) {
      console.error(
        "❌ Submission ID missing:",
        submission
      );

      return;
    }

    navigate(
      `/academy/tutor/assignments/${assignmentId}/submissions/${submissionId}`
    );
  };

  // ==========================================================
  // STATS
  // ==========================================================

  const stats =
    useMemo(() => {
      const submitted =
        submissions.length;

      const graded =
        submissions.filter(
          (submission) =>
            Boolean(
              submission.grade
            ) ||
            submission.status ===
              "graded" ||
            submission.status ===
              "reviewed"
        ).length;

      const pending =
        Math.max(
          submitted - graded,
          0
        );

      return {
        submitted,
        graded,
        pending,
      };
    }, [
      submissions,
    ]);

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050816] text-white flex items-center justify-center px-6">
        <div className="flex flex-col items-center gap-4">
          <Loader2
            className="animate-spin text-cyan-400"
            size={38}
          />

          <p className="text-slate-300">
            Loading submitted assignments...
          </p>
        </div>
      </div>
    );
  }

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="min-h-screen bg-[#050816] text-white px-4 py-6 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">

          <div className="flex items-start gap-3">

            <button
              type="button"
              onClick={() =>
                navigate(-1)
              }
              className="mt-1 h-10 w-10 rounded-xl border border-white/10 bg-white/[0.04] flex items-center justify-center hover:bg-white/[0.08] transition"
            >
              <ArrowLeft
                size={19}
              />
            </button>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <FileText
                  size={18}
                  className="text-cyan-400"
                />

                <span className="text-xs uppercase tracking-[0.2em] text-cyan-400 font-semibold">
                  Tutor
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold">
                Submitted Assignments
              </h1>

              <p className="text-slate-400 mt-1">
                {assignment?.title ||
                  "Assignment submissions"}
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={refreshing}
            onClick={() =>
              loadData({
                silent: true,
              })
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium hover:bg-white/[0.08] disabled:opacity-50 transition"
          >
            <RefreshCw
              size={17}
              className={
                refreshing
                  ? "animate-spin"
                  : ""
              }
            />

            Refresh
          </button>
        </div>

        {/* ERROR */}

        {error && (
          <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/[0.07] p-5">
            <div className="flex items-start gap-3">

              <XCircle
                className="text-red-400 shrink-0"
                size={21}
              />

              <div className="flex-1">

                <h3 className="font-semibold text-red-300">
                  Unable to load submissions
                </h3>

                <p className="text-sm text-red-200/80 mt-1">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={() =>
                    loadData()
                  }
                  className="mt-4 rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-2 text-sm text-red-300 hover:bg-red-500/20 transition"
                >
                  Try again
                </button>

              </div>
            </div>
          </div>
        )}

        {/* ASSIGNMENT INFO */}

        {assignment && (
          <div className="rounded-2xl border border-white/10 bg-[#071426] p-5 mb-6">

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

              <div className="flex items-start gap-4">

                <div className="h-12 w-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
                  <BookOpen
                    className="text-cyan-400"
                    size={23}
                  />
                </div>

                <div>

                  <h2 className="font-semibold text-lg">
                    {assignment.title ||
                      "Assignment"}
                  </h2>

                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-400 mt-1">

                    <span>
                      Subject:{" "}
                      {assignment.subject ||
                        "—"}
                    </span>

                    <span>
                      Class:{" "}
                      {assignment.grade ||
                        "—"}
                    </span>

                    <span>
                      Questions:{" "}
                      {assignment.totalQuestions ??
                        "—"}
                    </span>

                    <span>
                      Marks:{" "}
                      {assignment.totalMarks ||
                        "—"}
                    </span>

                  </div>
                </div>
              </div>

              <div className="text-sm text-slate-500">
                Assignment ID:{" "}
                <span className="text-slate-300 font-mono">
                  {assignmentId}
                </span>
              </div>

            </div>
          </div>
        )}

        {/* STATS */}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-7">

          <div className="rounded-2xl border border-white/10 bg-[#071426] p-5">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-slate-400">
                  Submitted
                </p>

                <p className="text-3xl font-bold mt-1">
                  {stats.submitted}
                </p>
              </div>

              <div className="h-11 w-11 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                <FileText
                  className="text-cyan-400"
                  size={21}
                />
              </div>

            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#071426] p-5">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-slate-400">
                  Graded
                </p>

                <p className="text-3xl font-bold mt-1">
                  {stats.graded}
                </p>
              </div>

              <div className="h-11 w-11 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle2
                  className="text-emerald-400"
                  size={21}
                />
              </div>

            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#071426] p-5">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-slate-400">
                  Awaiting Review
                </p>

                <p className="text-3xl font-bold mt-1">
                  {stats.pending}
                </p>
              </div>

              <div className="h-11 w-11 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <Clock3
                  className="text-amber-400"
                  size={21}
                />
              </div>

            </div>
          </div>

        </div>

        {/* NO SUBMISSIONS */}

        {!error &&
          submissions.length === 0 && (
            <div className="rounded-2xl border border-white/10 bg-[#071426] p-10 text-center">

              <div className="mx-auto h-16 w-16 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center mb-4">
                <FileText
                  size={28}
                  className="text-slate-500"
                />
              </div>

              <h2 className="text-lg font-semibold">
                No submissions yet
              </h2>

              <p className="text-slate-400 text-sm mt-2 max-w-md mx-auto">
                No student submission has
                been found for this
                assignment.
              </p>

              <div className="mt-5 text-xs text-slate-600 font-mono">
                Assignment ID:{" "}
                {assignmentId}
              </div>

              <button
                type="button"
                onClick={() =>
                  loadData()
                }
                className="mt-5 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm hover:bg-white/[0.08] transition"
              >
                <RefreshCw
                  size={16}
                />
                Check Again
              </button>

            </div>
          )}

        {/* SUBMISSIONS */}

        {submissions.length > 0 && (
          <div className="space-y-4">

            {submissions.map(
              (
                submission,
                index
              ) => {
                const submissionId =
                  getSubmissionId(
                    submission
                  );

                const answers =
                  getAnswers(
                    submission
                  );

                const expanded =
                  String(
                    expandedSubmission
                  ) ===
                  String(
                    submissionId
                  );

                const isLoadingAnswers =
                  Boolean(
                    loadingAnswers[
                      submissionId
                    ]
                  );

                const submissionAnswerError =
                  answerErrors[
                    submissionId
                  ];

                return (
                  <div
                    key={
                      submissionId ||
                      `${index}-${getStudentReference(
                        submission
                      )}`
                    }
                    className="rounded-2xl border border-white/10 bg-[#071426] overflow-hidden"
                  >

                    {/* SUBMISSION HEADER */}

                    <div className="p-5">

                      <div className="flex flex-col xl:flex-row xl:items-center gap-5">

                        <div className="flex items-center gap-4 flex-1">

                          <div className="h-12 w-12 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
                            <User
                              size={21}
                              className="text-cyan-400"
                            />
                          </div>

                          <div className="min-w-0">

                            <h3 className="font-semibold text-lg truncate">
                              {getStudentName(
                                submission
                              )}
                            </h3>

                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-400 mt-1">

                              {getStudentReference(
                                submission
                              ) && (
                                <span className="font-mono">
                                  {getStudentReference(
                                    submission
                                  )}
                                </span>
                              )}

                              {getStudentId(
                                submission
                              ) && (
                                <span>
                                  ID:{" "}
                                  {getStudentId(
                                    submission
                                  )}
                                </span>
                              )}

                              <span>
                                Submitted:{" "}
                                {formatDate(
                                  submission.submittedAt
                                )}
                              </span>

                              <span className="font-mono text-slate-500">
                                Submission:{" "}
                                {submissionId}
                              </span>

                            </div>
                          </div>
                        </div>

                        {/* RESULT */}

                        <div className="flex flex-wrap items-center gap-3">

                          <div className="rounded-xl bg-white/[0.03] border border-white/10 px-4 py-2">
                            <p className="text-[11px] uppercase tracking-wider text-slate-500">
                              Score
                            </p>

                            <p className="font-semibold">
                              {submission.score}{" "}
                              /{" "}
                              {submission.totalMarks ||
                                "—"}
                            </p>
                          </div>

                          <div className="rounded-xl bg-white/[0.03] border border-white/10 px-4 py-2">
                            <p className="text-[11px] uppercase tracking-wider text-slate-500">
                              Percentage
                            </p>

                            <p className="font-semibold">
                              {
                                submission.percentage
                              }
                              %
                            </p>
                          </div>

                          <div className="rounded-xl bg-white/[0.03] border border-white/10 px-4 py-2">
                            <p className="text-[11px] uppercase tracking-wider text-slate-500">
                              Grade
                            </p>

                            <p className="font-semibold">
                              {submission.grade ||
                                "Pending"}
                            </p>
                          </div>

                        </div>
                      </div>

                      {/* ACTIONS */}

                      <div className="flex flex-wrap items-center gap-3 mt-5 pt-5 border-t border-white/5">

                        <button
                          type="button"
                          onClick={() =>
                            toggleSubmission(
                              submission
                            )
                          }
                          disabled={
                            isLoadingAnswers
                          }
                          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium hover:bg-white/[0.08] disabled:opacity-60 transition"
                        >

                          {isLoadingAnswers ? (
                            <Loader2
                              size={17}
                              className="animate-spin"
                            />
                          ) : expanded ? (
                            <ChevronUp
                              size={17}
                            />
                          ) : (
                            <ChevronDown
                              size={17}
                            />
                          )}

                          {isLoadingAnswers
                            ? "Loading Answers..."
                            : expanded
                              ? "Hide Answers"
                              : `View Answers${
                                  answers.length
                                    ? ` (${answers.length})`
                                    : ""
                                }`}
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            openGradePage(
                              submission
                            )
                          }
                          className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-cyan-400 transition"
                        >
                          Grade Submission
                        </button>

                      </div>
                    </div>

                    {/* ANSWERS */}

                    {expanded && (
                      <div className="border-t border-white/10 bg-black/10 p-5">

                        {/* ANSWER ERROR */}

                        {submissionAnswerError && (
                          <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/[0.05] p-4">

                            <div className="flex items-start gap-3">

                              <XCircle
                                className="text-red-400 shrink-0"
                                size={20}
                              />

                              <div>

                                <p className="text-red-300 font-medium">
                                  Unable to load answers
                                </p>

                                <p className="text-sm text-slate-400 mt-1">
                                  {
                                    submissionAnswerError
                                  }
                                </p>

                                <button
                                  type="button"
                                  onClick={() =>
                                    loadSubmissionAnswers(
                                      submission
                                    )
                                  }
                                  className="mt-3 inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm hover:bg-white/[0.08]"
                                >
                                  <RefreshCw
                                    size={15}
                                  />

                                  Try Again
                                </button>

                              </div>
                            </div>
                          </div>
                        )}

                        {/* LOADING */}

                        {isLoadingAnswers ? (
                          <div className="py-10 flex flex-col items-center justify-center">

                            <Loader2
                              size={30}
                              className="animate-spin text-cyan-400"
                            />

                            <p className="text-slate-400 text-sm mt-3">
                              Loading student answers...
                            </p>

                          </div>
                        ) : answers.length === 0 ? (

                          <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.05] p-5 text-center">

                            <FileText
                              size={27}
                              className="mx-auto text-amber-400 mb-3"
                            />

                            <p className="text-amber-300 font-medium">
                              No answer records were returned.
                            </p>

                            <p className="text-sm text-slate-500 mt-1">
                              Submission{" "}
                              <span className="font-mono text-slate-400">
                                {submissionId}
                              </span>{" "}
                              was found, but the server did not
                              return its saved answers.
                            </p>

                          </div>

                        ) : (

                          <div className="space-y-4">

                            {answers.map(
                              (
                                answer,
                                answerIndex
                              ) => {
                                const correct =
                                  answer.isCorrect ===
                                  true;

                                return (
                                  <div
                                    key={
                                      answer.id ||
                                      answer.answerId ||
                                      `${submissionId}-${answerIndex}`
                                    }
                                    className="rounded-xl border border-white/10 bg-[#050816] p-5"
                                  >

                                    {/* QUESTION */}

                                    <div className="flex items-start justify-between gap-4">

                                      <div className="flex items-start gap-3 flex-1">

                                        <div className="h-8 w-8 rounded-lg bg-white/[0.05] flex items-center justify-center text-xs font-bold shrink-0">
                                          {answer.questionNumber ||
                                            answerIndex +
                                              1}
                                        </div>

                                        <div className="flex-1">

                                          <p className="font-medium leading-relaxed">
                                            {answer.question ||
                                              "Question unavailable"}
                                          </p>

                                          {answer.questionId && (
                                            <p className="text-[11px] text-slate-600 font-mono mt-1">
                                              Question ID:{" "}
                                              {
                                                answer.questionId
                                              }
                                            </p>
                                          )}

                                        </div>
                                      </div>

                                      <div>
                                        {correct ? (
                                          <CheckCircle2
                                            size={20}
                                            className="text-emerald-400"
                                          />
                                        ) : (
                                          <XCircle
                                            size={20}
                                            className="text-red-400"
                                          />
                                        )}
                                      </div>

                                    </div>

                                    {/* OPTIONS */}

                                    {(answer.optionA ||
                                      answer.optionB ||
                                      answer.optionC ||
                                      answer.optionD) && (
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">

                                        {[
                                          [
                                            "A",
                                            answer.optionA,
                                          ],
                                          [
                                            "B",
                                            answer.optionB,
                                          ],
                                          [
                                            "C",
                                            answer.optionC,
                                          ],
                                          [
                                            "D",
                                            answer.optionD,
                                          ],
                                        ].map(
                                          ([
                                            letter,
                                            text,
                                          ]) =>
                                            text ? (
                                              <div
                                                key={
                                                  letter
                                                }
                                                className={`rounded-lg border p-3 ${
                                                  clean(
                                                    answer.studentAnswer
                                                  ).toUpperCase() ===
                                                  letter
                                                    ? "border-cyan-500/30 bg-cyan-500/[0.06]"
                                                    : "border-white/5 bg-white/[0.02]"
                                                }`}
                                              >
                                                <span className="font-semibold mr-2">
                                                  {letter}.
                                                </span>

                                                <span className="text-slate-300">
                                                  {text}
                                                </span>
                                              </div>
                                            ) : null
                                        )}
                                      </div>
                                    )}

                                    {/* STUDENT / CORRECT */}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-5">

                                      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">

                                        <p className="text-xs uppercase tracking-wider text-slate-500 mb-2">
                                          Student Answer
                                        </p>

                                        <p
                                          className={
                                            correct
                                              ? "text-emerald-300 font-medium"
                                              : "text-red-300 font-medium"
                                          }
                                        >
                                          {answer.studentAnswer ||
                                            "No answer"}
                                        </p>

                                      </div>

                                      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">

                                        <p className="text-xs uppercase tracking-wider text-slate-500 mb-2">
                                          Correct Answer
                                        </p>

                                        <p className="text-emerald-300 font-medium">
                                          {answer.correctAnswer ||
                                            "Not available"}
                                        </p>

                                      </div>

                                    </div>

                                    {/* MARKS */}

                                    <div className="flex flex-wrap gap-3 mt-4 text-sm">

                                      <div className="rounded-lg bg-white/[0.03] px-3 py-2">

                                        <span className="text-slate-500">
                                          Marks:
                                        </span>{" "}

                                        <span className="font-medium">
                                          {
                                            answer.marksAwarded
                                          }{" "}
                                          /{" "}
                                          {
                                            answer.marks
                                          }
                                        </span>

                                      </div>

                                      <div
                                        className={`rounded-lg px-3 py-2 ${
                                          correct
                                            ? "bg-emerald-500/10 text-emerald-300"
                                            : "bg-red-500/10 text-red-300"
                                        }`}
                                      >
                                        {correct
                                          ? "Correct"
                                          : "Incorrect"}
                                      </div>

                                    </div>

                                    {/* EXPLANATION */}

                                    {answer.reason && (
                                      <div className="mt-4 rounded-xl border border-white/5 bg-white/[0.02] p-4">

                                        <p className="text-xs uppercase tracking-wider text-slate-500 mb-1">
                                          Explanation
                                        </p>

                                        <p className="text-sm text-slate-300 leading-relaxed">
                                          {
                                            answer.reason
                                          }
                                        </p>

                                      </div>
                                    )}

                                  </div>
                                );
                              }
                            )}

                          </div>
                        )}

                      </div>
                    )}

                  </div>
                );
              }
            )}

          </div>
        )}

      </div>
    </div>
  );
}
