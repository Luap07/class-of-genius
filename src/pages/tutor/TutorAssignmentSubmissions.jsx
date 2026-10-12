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
// CONFIGURATION
// ============================================================

const API_BASE_URL = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000"
).replace(/\/$/, "");

const ASSIGNMENTS_URL =
  `${API_BASE_URL}/api/academy/tutor/assignments`;

const clean = (value) =>
  value === undefined || value === null
    ? ""
    : String(value).trim();

const number = (value) => {
  const result = Number(value);
  return Number.isFinite(result) ? result : 0;
};

const getToken = () => {
  for (const key of [
    "scholiqen_academy_token",
    "academy_token",
    "scholiqen_token",
    "access_token",
    "token",
  ]) {
    try {
      const token = localStorage.getItem(key);
      if (token) return token;
    } catch {
      // Ignore storage errors.
    }
  }

  return "";
};

// Only accept the actual SQA tutor reference.
const getTutorReference = () => {
  const keys = [
    "scholiqen_academy_user",
    "tutorReference",
    "tutor_reference",
    "tutor",
    "academyTutor",
  ];

  for (const key of keys) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) continue;

      let value = raw;

      try {
        value = JSON.parse(raw);
      } catch {
        // The stored value may be a plain string.
      }

      const candidates = [
        typeof value === "string" ? value : "",
        value?.reference,
        value?.tutorReference,
        value?.tutor_reference,
        value?.applicationReference,
        value?.application_reference,
      ];

      for (const candidate of candidates) {
        const reference = clean(candidate);

        if (/^SQA-/i.test(reference)) {
          return reference;
        }
      }
    } catch {
      // Ignore malformed storage.
    }
  }

  return "";
};

const buildHeaders = () => {
  const headers = {
    Accept: "application/json",
  };

  const token = getToken();
  const reference = getTutorReference();

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (reference) {
    headers["x-tutor-reference"] = reference;
  }

  return headers;
};

const readResponse = async (response) => {
  let data = {};

  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    throw new Error(
      data?.message ||
      data?.error ||
      `Request failed (${response.status}).`
    );
  }

  return data;
};

const getErrorMessage = (error, fallback) =>
  error?.message || fallback;

const getSubmissionId = (item) =>
  item?.submissionId ??
  item?.submission_id ??
  item?.id ??
  null;

const getStudentReference = (item) =>
  clean(
    item?.studentReference ??
    item?.student_reference ??
    item?.reference ??
    ""
  );

const getStudentId = (item) =>
  clean(
    item?.studentId ??
    item?.student_id ??
    item?.enrollmentId ??
    item?.enrollment_id ??
    ""
  );

const getStudentName = (item) =>
  clean(
    item?.studentName ??
    item?.student_name ??
    item?.name ??
    ""
  ) ||
  getStudentReference(item) ||
  getStudentId(item) ||
  "Student";

const formatDate = (value) => {
  if (!value) return "Unknown date";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

// ============================================================
// RESPONSE NORMALIZERS
// ============================================================

const getQuestionText = (answer) => {
  const question = answer?.question;

  if (question && typeof question === "object") {
    return clean(
      question.question_text ??
      question.questionText ??
      question.text ??
      question.question ??
      ""
    );
  }

  return clean(
    answer?.questionText ??
    answer?.question_text ??
    answer?.question ??
    ""
  );
};

const normalizeAnswer = (answer, index = 0) => {
  if (!answer || typeof answer !== "object") {
    return null;
  }

  const question = answer.question;

  const studentAnswer =
    answer.studentAnswer ??
    answer.student_answer ??
    answer.selectedAnswer ??
    answer.selected_answer ??
    answer.response_text ??
    answer.response ??
    answer.answer ??
    "";

  const correctAnswer =
    answer.correctAnswer ??
    answer.correct_answer ??
    answer.answerKey ??
    answer.answer_key ??
    answer.questionCorrectAnswer ??
    answer.question_correct_answer ??
    question?.correctAnswer ??
    question?.correct_answer ??
    "";

  const rawCorrect =
    answer.isCorrect ??
    answer.is_correct;

  const isCorrect =
    rawCorrect === true ||
    rawCorrect === 1 ||
    String(rawCorrect).toLowerCase() === "true";

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

    questionId:
      answer.questionId ??
      answer.question_id ??
      question?.id ??
      null,

    questionNumber:
      answer.questionNumber ??
      answer.question_number ??
      question?.question_number ??
      answer.number ??
      index + 1,

    question: getQuestionText(answer),

    optionA: clean(
      answer.optionA ?? answer.option_a ??
      question?.option_a ?? question?.optionA ?? ""
    ),

    optionB: clean(
      answer.optionB ?? answer.option_b ??
      question?.option_b ?? question?.optionB ?? ""
    ),

    optionC: clean(
      answer.optionC ?? answer.option_c ??
      question?.option_c ?? question?.optionC ?? ""
    ),

    optionD: clean(
      answer.optionD ?? answer.option_d ??
      question?.option_d ?? question?.optionD ?? ""
    ),

    studentAnswer: clean(
      typeof studentAnswer === "object"
        ? JSON.stringify(studentAnswer)
        : studentAnswer
    ),

    correctAnswer: clean(correctAnswer),

    marksAwarded: number(
      answer.marksAwarded ??
      answer.marks_awarded ??
      answer.marks_obtained ??
      answer.score ??
      0
    ),

    marks: number(
      answer.marks ??
      answer.maxMarks ??
      answer.max_marks ??
      answer.questionMarks ??
      answer.question_marks ??
      question?.marks ??
      0
    ),

    isCorrect,

    reason: clean(
      answer.reason ??
      answer.explanation ??
      question?.explanation ??
      ""
    ),
  };
};

const getAnswers = (item) => {
  if (!item) return [];

  const candidates = [
    item.answers,
    item.answerRecords,
    item.answer_records,
    item.submittedAnswers,
    item.submitted_answers,
    item.responses,
    item.data?.answers,
    item.submission?.answers,
    item.data?.submission?.answers,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate
        .map(normalizeAnswer)
        .filter(Boolean);
    }
  }

  return [];
};

const normalizeAssignment = (item) => {
  if (!item || typeof item !== "object") {
    return null;
  }

  return {
    ...item,

    id:
      item.id ??
      item.assignmentId ??
      item.assignment_id,

    title: clean(item.title) || "Assignment",

    subject: clean(
      item.subject ??
      item.subjectName ??
      item.subject_name
    ),

    grade: clean(
      item.grade ??
      item.className ??
      item.class_name ??
      item.class ??
      item.className
    ),

    totalQuestions: number(
      item.totalQuestions ??
      item.total_questions ??
      item.questionCount ??
      item.question_count ??
      0
    ),

    totalMarks: number(
      item.totalMarks ??
      item.total_marks ??
      item.maxMarks ??
      item.max_marks ??
      item.max_score ??
      0
    ),
  };
};

const normalizeSubmission = (item, assignment) => {
  if (!item) return null;

  const answers = getAnswers(item);

  const score = number(
    item.score ??
    item.marksObtained ??
    item.marks_obtained ??
    0
  );

  const totalMarks = number(
    item.totalMarks ??
    item.total_marks ??
    item.maxMarks ??
    item.max_marks ??
    item.max_score ??
    assignment?.totalMarks ??
    answers.reduce((sum, answer) => sum + answer.marks, 0)
  );

  const percentage =
    item.percentage !== undefined &&
    item.percentage !== null
      ? number(item.percentage)
      : totalMarks > 0
        ? Number(((score / totalMarks) * 100).toFixed(2))
        : 0;

  return {
    ...item,

    id: getSubmissionId(item),
    submissionId: getSubmissionId(item),

    assignmentId:
      item.assignmentId ??
      item.assignment_id ??
      assignment?.id ??
      "",

    studentId: getStudentId(item),
    studentReference: getStudentReference(item),
    studentName: getStudentName(item),

    score,
    totalMarks,
    percentage,

    grade: clean(item.grade),

    status: clean(item.status) || "submitted",

    submittedAt:
      item.submittedAt ??
      item.submitted_at ??
      item.createdAt ??
      item.created_at ??
      null,

    resultReleased:
      item.resultReleased === true ||
      item.result_released === true,

    answers,
    answerCount: answers.length,
  };
};

const extractAssignments = (data) => {
  const candidates = [
    data?.assignments,
    data?.results,
    data?.data?.assignments,
    data?.data?.results,
    data?.data,
    data?.result,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate
        .map(normalizeAssignment)
        .filter((item) => item?.id !== undefined && item?.id !== null);
    }
  }

  return [];
};

const extractSubmissions = (data) => {
  const candidates = [
    data?.submissions,
    data?.results,
    data?.data?.submissions,
    data?.data?.results,
    data?.data,
    data?.result,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate;
    }
  }

  return [];
};

// ============================================================
// COMPONENT
// ============================================================

export default function TutorAssignmentSubmissions() {
  const navigate = useNavigate();
  const params = useParams();

  const routeAssignmentId =
    params.assignmentId ??
    params.assignment_id ??
    params.id ??
    "";

  const [tutorReference, setTutorReference] = useState(
    getTutorReference
  );

  const [assignments, setAssignments] = useState([]);
  const [selectedAssignmentId, setSelectedAssignmentId] =
    useState(String(routeAssignmentId));

  const [assignment, setAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [expandedSubmission, setExpandedSubmission] =
    useState(null);

  const [loadingAnswers, setLoadingAnswers] = useState({});
  const [answerErrors, setAnswerErrors] = useState({});

  const activeAssignmentId =
    String(routeAssignmentId || selectedAssignmentId || "");

  const assignmentById = useMemo(() => {
    const map = new Map();

    for (const item of assignments) {
      map.set(String(item.id), item);
    }

    if (assignment?.id !== undefined && assignment?.id !== null) {
      map.set(String(assignment.id), assignment);
    }

    return map;
  }, [assignments, assignment]);

  // ==========================================================
  // LOAD AVAILABLE ASSIGNMENTS
  // Required by /academy/tutor/assignments/submissions
  // ==========================================================

  const loadAssignments = useCallback(async () => {
    const reference = getTutorReference();
    setTutorReference(reference);

    if (!reference) {
      throw new Error(
        "A valid SQA tutor reference could not be found. Please log in to your tutor account again."
      );
    }

    const query = new URLSearchParams({
      reference,
      tutorReference: reference,
    });

    const response = await fetch(
      `${ASSIGNMENTS_URL}?${query.toString()}`,
      {
        method: "GET",
        headers: buildHeaders(),
      }
    );

    const data = await readResponse(response);
    const list = extractAssignments(data);

    setAssignments(list);

    return list;
  }, []);

  // ==========================================================
  // LOAD ASSIGNMENT AND SUBMISSIONS
  // ==========================================================

  const loadData = useCallback(
    async ({ silent = false, requestedId = "" } = {}) => {
      const id = String(requestedId || activeAssignmentId || "");

      setError("");

      if (!silent) setLoading(true);
      if (silent) setRefreshing(true);

      try {
        const list = await loadAssignments();

        // Landing route: show assignments for selection.
        if (!id) {
          setAssignment(null);
          setSubmissions([]);
          setExpandedSubmission(null);
          return;
        }

        const query = new URLSearchParams();

        const reference = getTutorReference();

        if (reference) {
          query.set("reference", reference);
          query.set("tutorReference", reference);
        }

        const suffix = query.toString()
          ? `?${query.toString()}`
          : "";

        const encodedId = encodeURIComponent(id);

        const [assignmentResponse, submissionsResponse] =
          await Promise.all([
            fetch(`${ASSIGNMENTS_URL}/${encodedId}${suffix}`, {
              method: "GET",
              headers: buildHeaders(),
            }),

            fetch(
              `${ASSIGNMENTS_URL}/${encodedId}/submissions${suffix}`,
              {
                method: "GET",
                headers: buildHeaders(),
              }
            ),
          ]);

        const [assignmentData, submissionsData] =
          await Promise.all([
            readResponse(assignmentResponse),
            readResponse(submissionsResponse),
          ]);

        const rawAssignment =
          assignmentData?.assignment ??
          assignmentData?.data?.assignment ??
          assignmentData?.data ??
          assignmentData?.result ??
          list.find((item) => String(item.id) === id) ??
          null;

        const loadedAssignment =
          normalizeAssignment(rawAssignment);

        setAssignment(loadedAssignment);

        const loadedSubmissions =
          extractSubmissions(submissionsData);

        const normalized = loadedSubmissions
          .map((item) =>
            normalizeSubmission(item, loadedAssignment)
          )
          .filter(Boolean);

        setSubmissions(normalized);

        setExpandedSubmission(null);
        setAnswerErrors({});
      } catch (requestError) {
        console.error(
          "Tutor assignment submissions error:",
          requestError
        );

        setError(
          getErrorMessage(
            requestError,
            "Unable to load assignment submissions."
          )
        );

        setSubmissions([]);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [activeAssignmentId, loadAssignments]
  );

  useEffect(() => {
    loadData({
      requestedId: routeAssignmentId,
    });
  }, [routeAssignmentId, loadData]);

  // ==========================================================
  // SELECT ASSIGNMENT FROM THE LANDING PAGE
  // ==========================================================

  const handleAssignmentChange = (event) => {
    const id = event.target.value;

    setSelectedAssignmentId(id);
    setExpandedSubmission(null);
    setAnswerErrors({});

    if (!id) {
      setAssignment(null);
      setSubmissions([]);
      return;
    }

    setLoading(true);

    loadData({
      requestedId: id,
    });
  };

  // ==========================================================
  // LOAD SAVED ANSWERS FOR A SUBMISSION
  // ==========================================================

  const loadSubmissionAnswers = useCallback(
    async (submission) => {
      const submissionId = getSubmissionId(submission);

      if (!submissionId) {
        setAnswerErrors((current) => ({
          ...current,
          unknown: "The submission ID is missing.",
        }));
        return;
      }

      if (getAnswers(submission).length > 0) {
        return;
      }

      setLoadingAnswers((current) => ({
        ...current,
        [submissionId]: true,
      }));

      setAnswerErrors((current) => ({
        ...current,
        [submissionId]: "",
      }));

      try {
        const reference = tutorReference || getTutorReference();

        const query = new URLSearchParams();

        if (reference) {
          query.set("reference", reference);
          query.set("tutorReference", reference);
        }

        const suffix = query.toString()
          ? `?${query.toString()}`
          : "";

        const url =
          `${ASSIGNMENTS_URL}/` +
          `${encodeURIComponent(activeAssignmentId)}/submissions/` +
          `${encodeURIComponent(submissionId)}${suffix}`;

        const response = await fetch(url, {
          method: "GET",
          headers: buildHeaders(),
        });

        const data = await readResponse(response);

        const fullSubmission =
          data?.submission ??
          data?.data?.submission ??
          data?.result?.submission ??
          data?.result ??
          (
            data?.data &&
            !Array.isArray(data.data)
              ? data.data
              : null
          );

        const returnedId = getSubmissionId(fullSubmission);

        if (
          returnedId !== null &&
          String(returnedId) !== String(submissionId)
        ) {
          throw new Error(
            "The server returned a different submission."
          );
        }

        let rawAnswers = [];

        if (Array.isArray(data?.answers)) {
          rawAnswers = data.answers;
        } else if (Array.isArray(data?.data?.answers)) {
          rawAnswers = data.data.answers;
        } else if (
          Array.isArray(data?.result?.answers)
        ) {
          rawAnswers = data.result.answers;
        } else {
          rawAnswers = getAnswers(fullSubmission);
        }

        const answers = rawAnswers
          .map(normalizeAnswer)
          .filter(Boolean);

        if (answers.length === 0) {
          throw new Error(
            "The submission was found, but the server returned no saved answer records. Check that the backend retrieves academy_assignment_answers using the correct submission_id."
          );
        }

        setSubmissions((current) =>
          current.map((item) => {
            if (
              String(getSubmissionId(item)) !==
              String(submissionId)
            ) {
              return item;
            }

            return {
              ...item,
              ...(fullSubmission || {}),

              id: submissionId,
              submissionId,

              studentId:
                getStudentId(fullSubmission || {}) ||
                item.studentId,

              studentReference:
                getStudentReference(fullSubmission || {}) ||
                item.studentReference,

              studentName:
                getStudentName(fullSubmission || {}) !== "Student"
                  ? getStudentName(fullSubmission || {})
                  : item.studentName,

              score: number(
                fullSubmission?.score ?? item.score
              ),

              totalMarks: number(
                fullSubmission?.totalMarks ??
                fullSubmission?.total_marks ??
                fullSubmission?.max_score ??
                item.totalMarks
              ),

              answers,
              answerCount: answers.length,
            };
          })
        );
      } catch (requestError) {
        console.error(
          "Unable to load saved submission answers:",
          requestError
        );

        setAnswerErrors((current) => ({
          ...current,
          [submissionId]: getErrorMessage(
            requestError,
            "Unable to load the student's answers."
          ),
        }));
      } finally {
        setLoadingAnswers((current) => ({
          ...current,
          [submissionId]: false,
        }));
      }
    },
    [activeAssignmentId, tutorReference]
  );

  const toggleSubmission = async (submission) => {
    const id = getSubmissionId(submission);

    if (!id) return;

    const opening =
      String(expandedSubmission) !== String(id);

    setExpandedSubmission(opening ? id : null);

    if (opening) {
      await loadSubmissionAnswers(submission);
    }
  };

  const openGradePage = (submission) => {
    const id = getSubmissionId(submission);

    if (!id || !activeAssignmentId) return;

    navigate(
      `/academy/tutor/assignments/${encodeURIComponent(
        activeAssignmentId
      )}/submissions/${encodeURIComponent(id)}`
    );
  };

  const stats = useMemo(() => {
    const submitted = submissions.length;

    const graded = submissions.filter((item) =>
      Boolean(item.grade) ||
      ["graded", "reviewed"].includes(
        clean(item.status).toLowerCase()
      )
    ).length;

    return {
      submitted,
      graded,
      pending: Math.max(submitted - graded, 0),
    };
  }, [submissions]);

  // ==========================================================
  // LOADING SCREEN
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
            Loading assignment submissions...
          </p>
        </div>
      </div>
    );
  }

  // ==========================================================
  // PAGE
  // ==========================================================

  return (
    <div className="min-h-screen bg-[#050816] text-white px-4 py-6 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">

        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
          <div className="flex items-start gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="mt-1 h-10 w-10 rounded-xl border border-white/10 bg-white/[0.04] flex items-center justify-center hover:bg-white/[0.08]"
              aria-label="Go back"
            >
              <ArrowLeft size={19} />
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
                Assignment Submissions
              </h1>

              <p className="text-slate-400 mt-1">
                View student work and review submitted answers.
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={refreshing}
            onClick={() =>
              loadData({
                silent: true,
                requestedId: activeAssignmentId,
              })
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium hover:bg-white/[0.08] disabled:opacity-50"
          >
            <RefreshCw
              size={17}
              className={refreshing ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </header>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/[0.07] p-5">
            <div className="flex items-start gap-3">
              <XCircle
                className="text-red-400 shrink-0"
                size={21}
              />

              <div>
                <h3 className="font-semibold text-red-300">
                  Unable to load submissions
                </h3>

                <p className="text-sm text-red-200/80 mt-1">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={() =>
                    loadData({
                      requestedId: activeAssignmentId,
                    })
                  }
                  className="mt-4 rounded-lg border border-red-500/20 px-4 py-2 text-sm text-red-300 hover:bg-red-500/10"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ASSIGNMENT SELECTOR */}
        <section className="rounded-2xl border border-white/10 bg-[#071426] p-5 mb-6">
          <label
            htmlFor="submission-assignment"
            className="block text-sm font-medium text-slate-300 mb-2"
          >
            Select assignment
          </label>

          <select
            id="submission-assignment"
            value={activeAssignmentId}
            onChange={handleAssignmentChange}
            className="w-full rounded-xl border border-white/10 bg-[#050816] px-4 py-3 text-white outline-none focus:border-cyan-500 sm:max-w-2xl"
          >
            <option value="">
              Choose an assignment to view submissions
            </option>

            {assignments.map((item) => (
              <option
                key={item.id}
                value={String(item.id)}
              >
                {item.title}
                {item.subject ? ` — ${item.subject}` : ""}
                {item.grade ? ` (${item.grade})` : ""}
              </option>
            ))}
          </select>

          {!activeAssignmentId && (
            <p className="text-sm text-slate-400 mt-3">
              Select an assignment above to view the students who submitted it.
            </p>
          )}
        </section>

        {/* ASSIGNMENT INFORMATION */}
        {assignment && (
          <section className="rounded-2xl border border-white/10 bg-[#071426] p-5 mb-6">
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
                    {assignment.title}
                  </h2>

                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-400 mt-1">
                    <span>
                      Subject: {assignment.subject || "—"}
                    </span>
                    <span>
                      Class: {assignment.grade || "—"}
                    </span>
                    <span>
                      Questions: {assignment.totalQuestions}
                    </span>
                    <span>
                      Marks: {assignment.totalMarks || "—"}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-sm text-slate-500">
                Assignment ID:{" "}
                <span className="text-slate-300 font-mono">
                  {activeAssignmentId}
                </span>
              </p>
            </div>
          </section>
        )}

        {/* STATISTICS */}
        {activeAssignmentId && (
          <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-7">
            {[
              {
                label: "Submitted",
                value: stats.submitted,
                icon: FileText,
                color: "text-cyan-400",
              },
              {
                label: "Graded",
                value: stats.graded,
                icon: CheckCircle2,
                color: "text-emerald-400",
              },
              {
                label: "Awaiting Review",
                value: stats.pending,
                icon: Clock3,
                color: "text-amber-400",
              },
            ].map((stat) => {
              const Icon = stat.icon;

              return (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-white/10 bg-[#071426] p-5"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-400">
                        {stat.label}
                      </p>
                      <p className="text-3xl font-bold mt-1">
                        {stat.value}
                      </p>
                    </div>

                    <div className="h-11 w-11 rounded-xl bg-white/[0.04] flex items-center justify-center">
                      <Icon
                        className={stat.color}
                        size={21}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </section>
        )}

        {/* EMPTY STATE */}
        {activeAssignmentId &&
          !error &&
          submissions.length === 0 && (
            <section className="rounded-2xl border border-white/10 bg-[#071426] p-10 text-center">
              <FileText
                size={30}
                className="mx-auto text-slate-500 mb-4"
              />

              <h2 className="text-lg font-semibold">
                No submissions yet
              </h2>

              <p className="text-slate-400 text-sm mt-2">
                No student submissions were returned for this assignment.
              </p>

              <button
                type="button"
                onClick={() =>
                  loadData({
                    silent: true,
                    requestedId: activeAssignmentId,
                  })
                }
                className="mt-5 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm hover:bg-white/[0.08]"
              >
                <RefreshCw size={16} />
                Check again
              </button>
            </section>
          )}

        {/* SUBMISSION LIST */}
        <div className="space-y-4">
          {submissions.map((submission, index) => {
            const id = getSubmissionId(submission);
            const answers = getAnswers(submission);

            const expanded =
              String(expandedSubmission) === String(id);

            const answerLoading = Boolean(loadingAnswers[id]);
            const answerError = answerErrors[id];

            return (
              <article
                key={id ?? `${index}-${getStudentName(submission)}`}
                className="rounded-2xl border border-white/10 bg-[#071426] overflow-hidden"
              >
                <div className="p-5">
                  <div className="flex flex-col xl:flex-row xl:items-center gap-5">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="h-12 w-12 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
                        <User
                          size={21}
                          className="text-cyan-400"
                        />
                      </div>

                      <div className="min-w-0">
                        <h3 className="font-semibold text-lg">
                          {getStudentName(submission)}
                        </h3>

                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-400 mt-1">
                          {getStudentReference(submission) && (
                            <span className="font-mono">
                              {getStudentReference(submission)}
                            </span>
                          )}

                          {getStudentId(submission) && (
                            <span>
                              Enrollment ID: {getStudentId(submission)}
                            </span>
                          )}

                          <span>
                            Submitted: {formatDate(submission.submittedAt)}
                          </span>

                          <span className="font-mono text-slate-500">
                            Submission: {id}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      {[
                        {
                          label: "Score",
                          value: `${submission.score} / ${submission.totalMarks || "—"}`,
                        },
                        {
                          label: "Percentage",
                          value: `${submission.percentage}%`,
                        },
                        {
                          label: "Grade",
                          value: submission.grade || "Pending",
                        },
                      ].map((item) => (
                        <div
                          key={item.label}
                          className="rounded-xl bg-white/[0.03] border border-white/10 px-4 py-2"
                        >
                          <p className="text-[11px] uppercase tracking-wider text-slate-500">
                            {item.label}
                          </p>
                          <p className="font-semibold">
                            {item.value}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 mt-5 pt-5 border-t border-white/5">
                    <button
                      type="button"
                      onClick={() => toggleSubmission(submission)}
                      disabled={answerLoading}
                      className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm hover:bg-white/[0.08] disabled:opacity-60"
                    >
                      {answerLoading ? (
                        <Loader2
                          size={17}
                          className="animate-spin"
                        />
                      ) : expanded ? (
                        <ChevronUp size={17} />
                      ) : (
                        <ChevronDown size={17} />
                      )}

                      {answerLoading
                        ? "Loading answers..."
                        : expanded
                          ? "Hide answers"
                          : `View answers${answers.length ? ` (${answers.length})` : ""}`}
                    </button>

                    <button
                      type="button"
                      onClick={() => openGradePage(submission)}
                      className="rounded-xl bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-cyan-400"
                    >
                      Grade submission
                    </button>
                  </div>
                </div>

                {/* ANSWERS */}
                {expanded && (
                  <div className="border-t border-white/10 bg-black/10 p-5">
                    {answerError && (
                      <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/[0.05] p-4">
                        <p className="text-red-300 font-medium">
                          Unable to load answers
                        </p>

                        <p className="text-sm text-slate-400 mt-1">
                          {answerError}
                        </p>

                        <button
                          type="button"
                          onClick={() =>
                            loadSubmissionAnswers(submission)
                          }
                          className="mt-3 inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm hover:bg-white/[0.08]"
                        >
                          <RefreshCw size={15} />
                          Try again
                        </button>
                      </div>
                    )}

                    {answerLoading ? (
                      <div className="py-10 flex flex-col items-center">
                        <Loader2
                          size={30}
                          className="animate-spin text-cyan-400"
                        />
                        <p className="text-slate-400 text-sm mt-3">
                          Loading saved student answers...
                        </p>
                      </div>
                    ) : answers.length === 0 ? (
                      <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.05] p-5 text-center">
                        <FileText
                          size={27}
                          className="mx-auto text-amber-400 mb-3"
                        />

                        <p className="text-amber-300 font-medium">
                          No answer records available
                        </p>

                        <p className="text-sm text-slate-400 mt-2">
                          {answerError
                            ? "Resolve the error above and try again."
                            : "The submission has no answers loaded yet."}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {answers.map((answer, answerIndex) => {
                          const correct = answer.isCorrect;

                          return (
                            <div
                              key={
                                answer.id ??
                                `${id}-${answerIndex}`
                              }
                              className="rounded-xl border border-white/10 bg-[#050816] p-5"
                            >
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex items-start gap-3 flex-1">
                                  <div className="h-8 w-8 rounded-lg bg-white/[0.05] flex items-center justify-center text-xs font-bold shrink-0">
                                    {answer.questionNumber || answerIndex + 1}
                                  </div>

                                  <div>
                                    <p className="font-medium leading-relaxed">
                                      {answer.question || "Question unavailable"}
                                    </p>

                                    {answer.questionId && (
                                      <p className="text-[11px] text-slate-600 font-mono mt-1">
                                        Question ID: {answer.questionId}
                                      </p>
                                    )}
                                  </div>
                                </div>

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

                              {(answer.optionA ||
                                answer.optionB ||
                                answer.optionC ||
                                answer.optionD) && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
                                  {[
                                    ["A", answer.optionA],
                                    ["B", answer.optionB],
                                    ["C", answer.optionC],
                                    ["D", answer.optionD],
                                  ].map(([letter, option]) =>
                                    option ? (
                                      <div
                                        key={letter}
                                        className="rounded-lg border border-white/10 bg-white/[0.02] p-3"
                                      >
                                        <span className="font-semibold mr-2">
                                          {letter}.
                                        </span>
                                        <span className="text-slate-300">
                                          {option}
                                        </span>
                                      </div>
                                    ) : null
                                  )}
                                </div>
                              )}

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-5">
                                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                                  <p className="text-xs uppercase tracking-wider text-slate-500 mb-2">
                                    Student answer
                                  </p>
                                  <p className="text-slate-200 font-medium whitespace-pre-wrap break-words">
                                    {answer.studentAnswer || "No answer"}
                                  </p>
                                </div>

                                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                                  <p className="text-xs uppercase tracking-wider text-slate-500 mb-2">
                                    Correct answer
                                  </p>
                                  <p className="text-emerald-300 font-medium whitespace-pre-wrap break-words">
                                    {answer.correctAnswer || "Not available"}
                                  </p>
                                </div>
                              </div>

                              <div className="flex flex-wrap gap-3 mt-4 text-sm">
                                <div className="rounded-lg bg-white/[0.03] px-3 py-2">
                                  <span className="text-slate-500">
                                    Marks:
                                  </span>{" "}
                                  <span className="font-medium">
                                    {answer.marksAwarded} / {answer.marks}
                                  </span>
                                </div>

                                <div
                                  className={`rounded-lg px-3 py-2 ${
                                    correct
                                      ? "bg-emerald-500/10 text-emerald-300"
                                      : "bg-red-500/10 text-red-300"
                                  }`}
                                >
                                  {correct ? "Correct" : "Incorrect"}
                                </div>
                              </div>

                              {answer.reason && (
                                <div className="mt-4 rounded-xl border border-white/5 bg-white/[0.02] p-4">
                                  <p className="text-xs uppercase tracking-wider text-slate-500 mb-1">
                                    Explanation
                                  </p>
                                  <p className="text-sm text-slate-300 leading-relaxed">
                                    {answer.reason}
                                  </p>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
