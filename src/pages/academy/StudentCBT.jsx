
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useNavigate, useOutletContext } from "react-router-dom";

import {
  motion,
  AnimatePresence,
} from "framer-motion";

import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Award,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Check,
  Clock3,
  FileText,
  GraduationCap,
  Loader2,
  Lock,
  Play,
  RefreshCw,
  ShieldCheck,
  Timer,
  Trophy,
  XCircle,
} from "lucide-react";

// ============================================================
// CONFIGURATION
// ============================================================

const API_BASE = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000"
).replace(/\/+$/, "");

const CBT_BASE = `${API_BASE}/api/academy/student/cbt`;

const TOKEN_KEYS = [
  "scholiqen_academy_token",
  "academy_token",
  "scholiqen_token",
  "access_token",
  "token",
];

const ANSWER_SAVE_DELAY = 500;

const getToken = () => {
  for (const key of TOKEN_KEYS) {
    const value = localStorage.getItem(key);

    if (value) {
      return value;
    }
  }

  return "";
};

const getHeaders = (json = true) => {
  const token = getToken();

  const headers = {
    Accept: "application/json",
  };

  if (json) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
    headers["x-academy-token"] = token;
    headers["x-student-token"] = token;
  }

  return headers;
};

const apiRequest = async (url, options = {}) => {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getHeaders(),
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
    throw new Error(
      data.message ||
      data.error ||
      `Request failed (${response.status}).`
    );
  }

  return data;
};

// ============================================================
// HELPERS
// ============================================================

const clean = (value) => {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim();
};

const getExamId = (exam) =>
  clean(
    exam?.id ??
    exam?.exam_id ??
    exam?.examId ??
    exam?.uuid
  );

const getExamTitle = (exam) =>
  clean(
    exam?.title ||
    exam?.name ||
    exam?.exam_name ||
    exam?.exam ||
    "Scheduled Examination"
  );

const getExamDescription = (exam) =>
  clean(
    exam?.description ||
    exam?.instructions ||
    exam?.details
  );

const getExamSubjects = (exam) => {
  const subjects =
    exam?.subjects ||
    exam?.registered_subjects ||
    exam?.exam_subjects ||
    [];

  if (Array.isArray(subjects)) {
    return subjects
      .map((item) => {
        if (typeof item === "string") {
          return item;
        }

        return (
          item?.subject ||
          item?.name ||
          item?.title ||
          ""
        );
      })
      .filter(Boolean);
  }

  if (typeof subjects === "string") {
    try {
      const parsed = JSON.parse(subjects);

      if (Array.isArray(parsed)) {
        return parsed.map(String).filter(Boolean);
      }
    } catch {
      return subjects
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }
  }

  return [];
};

const getExamStart = (exam) =>
  exam?.start_at ||
  exam?.startAt ||
  exam?.scheduled_start ||
  exam?.scheduledStart ||
  exam?.exam_date ||
  exam?.start_date ||
  null;

const getExamEnd = (exam) =>
  exam?.end_at ||
  exam?.endAt ||
  exam?.scheduled_end ||
  exam?.scheduledEnd ||
  exam?.end_date ||
  null;

const getDuration = (exam) => {
  const value = Number(
    exam?.duration_minutes ??
    exam?.duration ??
    exam?.time_limit ??
    exam?.durationMinutes ??
    60
  );

  return Number.isFinite(value) && value > 0
    ? value
    : 60;
};

const formatDate = (value) => {
  if (!value) {
    return "Not specified";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return clean(value);
  }

  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Africa/Lagos",
  }).format(date);
};

const formatDuration = (minutes) => {
  const total = Math.max(0, Number(minutes) || 0);

  const hours = Math.floor(total / 60);
  const remaining = total % 60;

  if (hours > 0) {
    return `${hours} hour${hours === 1 ? "" : "s"} ${
      remaining > 0 ? `${remaining} minutes` : ""
    }`.trim();
  }

  return `${remaining} minutes`;
};

const formatTime = (seconds) => {
  const safe = Math.max(0, Math.floor(seconds || 0));

  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const remainingSeconds = safe % 60;

  return [
    String(hours).padStart(2, "0"),
    String(minutes).padStart(2, "0"),
    String(remainingSeconds).padStart(2, "0"),
  ].join(":");
};

const getQuestionId = (question) =>
  clean(
    question?.id ??
    question?.question_id ??
    question?.questionId
  );

const getQuestionText = (question) =>
  question?.question ||
  question?.question_text ||
  question?.text ||
  "";

const getQuestionOptions = (question) => {
  const raw = question?.options;

  if (Array.isArray(raw)) {
    return raw.map((option, index) => {
      if (typeof option === "string") {
        return {
          key: String.fromCharCode(65 + index),
          text: option,
        };
      }

      return {
        key:
          option?.key ||
          option?.label ||
          option?.option ||
          String.fromCharCode(65 + index),
        text:
          option?.text ||
          option?.value ||
          option?.content ||
          "",
      };
    }).filter((option) => option.text);
  }

  if (raw && typeof raw === "object") {
    return Object.entries(raw).map(([key, value]) => ({
      key,
      text:
        typeof value === "string"
          ? value
          : value?.text || value?.value || "",
    })).filter((option) => option.text);
  }

  return [
    { key: "A", text: question?.optionA || question?.option_a },
    { key: "B", text: question?.optionB || question?.option_b },
    { key: "C", text: question?.optionC || question?.option_c },
    { key: "D", text: question?.optionD || question?.option_d },
  ].filter((option) => option.text);
};

const getSavedAnswer = (answers, questionId) => {
  if (!answers || !questionId) {
    return "";
  }

  return clean(
    answers[questionId] ??
    answers[String(questionId)] ??
    ""
  );
};

const extractQuestions = (data) => {
  if (Array.isArray(data?.questions)) {
    return data.questions;
  }

  if (Array.isArray(data?.attempt?.questions)) {
    return data.attempt.questions;
  }

  if (Array.isArray(data?.data?.questions)) {
    return data.data.questions;
  }

  return [];
};

const extractAttempt = (data) =>
  data?.attempt ||
  data?.data?.attempt ||
  data?.data ||
  data;

const extractDeadline = (data, attempt, exam) => {
  const deadline =
    attempt?.expires_at ||
    attempt?.expiresAt ||
    attempt?.end_at ||
    attempt?.endAt ||
    data?.expires_at ||
    data?.expiresAt ||
    data?.end_at ||
    data?.endAt;

  if (deadline) {
    const parsed = new Date(deadline).getTime();

    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  const durationSeconds =
    Number(
      data?.remaining_seconds ??
      data?.remainingSeconds ??
      attempt?.remaining_seconds ??
      attempt?.remainingSeconds
    );

  if (Number.isFinite(durationSeconds) && durationSeconds > 0) {
    return Date.now() + durationSeconds * 1000;
  }

  const startedAt =
    attempt?.started_at ||
    attempt?.startedAt;

  if (startedAt) {
    const duration = getDuration(exam);
    const start = new Date(startedAt).getTime();

    if (Number.isFinite(start)) {
      return start + duration * 60 * 1000;
    }
  }

  return Date.now() + getDuration(exam) * 60 * 1000;
};

const getExamStatus = (exam) => {
  const status = clean(exam?.status).toLowerCase();

  if (
    ["cancelled", "canceled", "disabled", "draft"].includes(status)
  ) {
    return "unavailable";
  }

  const now = Date.now();

  const start = getExamStart(exam)
    ? new Date(getExamStart(exam)).getTime()
    : null;

  const end = getExamEnd(exam)
    ? new Date(getExamEnd(exam)).getTime()
    : null;

  if (Number.isFinite(end) && now > end) {
    return "closed";
  }

  if (Number.isFinite(start) && now < start) {
    return "upcoming";
  }

  if (
    status === "published" ||
    status === "scheduled" ||
    status === "active" ||
    status === "ongoing"
  ) {
    return "available";
  }

  if (!status && Number.isFinite(start)) {
    return "available";
  }

  return status === "completed" ? "closed" : "available";
};

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function StudentCBT() {
  const navigate = useNavigate();

  const outletContext = useOutletContext() || {};

  const student = outletContext.student || {};

  // ----------------------------------------------------------
  // STATE
  // ----------------------------------------------------------

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  const [exams, setExams] = useState([]);
  const [results, setResults] = useState([]);

  const [registeredSubjects, setRegisteredSubjects] = useState([]);

  const [screen, setScreen] = useState("dashboard");

  const [selectedExam, setSelectedExam] = useState(null);

  const [attempt, setAttempt] = useState(null);

  const [questions, setQuestions] = useState([]);

  const [answers, setAnswers] = useState({});

  const [currentQuestion, setCurrentQuestion] = useState(0);

  const [markedQuestions, setMarkedQuestions] = useState([]);

  const [remainingSeconds, setRemainingSeconds] = useState(0);

  const [examDeadline, setExamDeadline] = useState(null);

  const [startingExam, setStartingExam] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  const [submitConfirmation, setSubmitConfirmation] = useState(false);

  const [examResult, setExamResult] = useState(null);

  const [reviewMode, setReviewMode] = useState(false);

  const [saveStatus, setSaveStatus] = useState("saved");

  const [showInstructions, setShowInstructions] = useState(false);

  const [showQuestionGrid, setShowQuestionGrid] = useState(true);

  const [now, setNow] = useState(Date.now());

  // ----------------------------------------------------------
  // REFS
  // ----------------------------------------------------------

  const saveTimerRef = useRef(null);

  const answersRef = useRef({});

  const submittingRef = useRef(false);

  const deadlineRef = useRef(null);

  const mountedRef = useRef(true);

  // ----------------------------------------------------------
  // STUDENT DETAILS
  // ----------------------------------------------------------

  const studentName =
    student?.full_name ||
    student?.name ||
    student?.student_name ||
    [
      student?.first_name,
      student?.last_name,
    ].filter(Boolean).join(" ") ||
    "Student";

  // ==========================================================
  // LOAD EXAMS AND RESULTS
  // ==========================================================

  const loadDashboard = useCallback(async (isRefresh = false) => {
    if (!getToken()) {
      setError(
        "Your student login session could not be found. Please sign in again."
      );

      setLoading(false);
      return;
    }

    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const [examResponse, resultResponse] = await Promise.all([
        apiRequest(`${CBT_BASE}/exams`),

        apiRequest(`${CBT_BASE}/results`).catch(() => ({
          results: [],
        })),
      ]);

      if (!mountedRef.current) {
        return;
      }

      const examList =
        examResponse?.exams ||
        examResponse?.data?.exams ||
        examResponse?.data ||
        [];

      const resultList =
        resultResponse?.results ||
        resultResponse?.data?.results ||
        resultResponse?.data ||
        [];

      setExams(Array.isArray(examList) ? examList : []);

      setResults(Array.isArray(resultList) ? resultList : []);

      const subjects =
        examResponse?.registeredSubjects ||
        examResponse?.registered_subjects ||
        examResponse?.subjects ||
        [];

      setRegisteredSubjects(
        Array.isArray(subjects)
          ? subjects.map((item) =>
              typeof item === "string"
                ? item
                : item?.subject || item?.name || ""
            ).filter(Boolean)
          : []
      );
    } catch (err) {
      console.error("ACADEMY CBT DASHBOARD ERROR:", err);

      if (mountedRef.current) {
        setError(err.message || "Unable to load your examinations.");
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;

    loadDashboard();

    return () => {
      mountedRef.current = false;

      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, [loadDashboard]);

  // ==========================================================
  // CLOCK
  // ==========================================================

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // ==========================================================
  // DERIVED EXAM LISTS
  // ==========================================================

  const availableExams = useMemo(
    () =>
      exams.filter(
        (exam) => getExamStatus(exam) === "available"
      ),
    [exams, now]
  );

  const upcomingExams = useMemo(
    () =>
      exams.filter(
        (exam) => getExamStatus(exam) === "upcoming"
      ),
    [exams, now]
  );

  const closedExams = useMemo(
    () =>
      exams.filter(
        (exam) =>
          ["closed", "unavailable"].includes(
            getExamStatus(exam)
          )
      ),
    [exams, now]
  );

  // ==========================================================
  // EXAM DETAILS
  // ==========================================================

  const openExam = useCallback(async (exam) => {
    const examId = getExamId(exam);

    if (!examId) {
      setError("This examination does not have a valid ID.");
      return;
    }

    try {
      setError("");

      setSelectedExam(exam);

      setShowInstructions(true);

      setScreen("instructions");

      const response = await apiRequest(
        `${CBT_BASE}/exams/${encodeURIComponent(examId)}`
      );

      const fullExam =
        response?.exam ||
        response?.data?.exam ||
        response?.data ||
        exam;

      setSelectedExam(fullExam);
    } catch (err) {
      console.error("CBT EXAM DETAILS ERROR:", err);

      setError(err.message || "Unable to load examination details.");

      setScreen("dashboard");
    }
  }, []);

  // ==========================================================
  // START EXAM
  // ==========================================================

  const startExam = useCallback(async () => {
    if (!selectedExam || startingExam) {
      return;
    }

    const examId = getExamId(selectedExam);

    if (!examId) {
      setError("Invalid examination.");
      return;
    }

    if (getExamStatus(selectedExam) === "upcoming") {
      setError("This examination has not started yet.");
      return;
    }

    try {
      setStartingExam(true);
      setError("");

      const response = await apiRequest(
        `${CBT_BASE}/exams/${encodeURIComponent(examId)}/start`,
        {
          method: "POST",
          body: JSON.stringify({}),
        }
      );

      const newAttempt = extractAttempt(response);

      const questionList = extractQuestions(response);

      if (!questionList.length) {
        throw new Error(
          "No examination questions were returned. Please contact your administrator."
        );
      }

      const attemptId =
        newAttempt?.id ||
        newAttempt?.attempt_id ||
        newAttempt?.attemptId;

      if (!attemptId) {
        throw new Error(
          "The server did not return a valid examination attempt."
        );
      }

      const savedAnswers =
        newAttempt?.answers ||
        response?.answers ||
        {};

      const normalizedAnswers = {};

      if (Array.isArray(savedAnswers)) {
        savedAnswers.forEach((item) => {
          const questionId =
            item?.question_id ||
            item?.questionId;

          const answer =
            item?.answer ??
            item?.selected_answer ??
            item?.selectedAnswer;

          if (questionId && answer !== undefined) {
            normalizedAnswers[String(questionId)] = String(answer);
          }
        });
      } else if (
        savedAnswers &&
        typeof savedAnswers === "object"
      ) {
        Object.entries(savedAnswers).forEach(([key, value]) => {
          normalizedAnswers[String(key)] =
            typeof value === "object"
              ? String(
                  value?.answer ??
                  value?.selected_answer ??
                  ""
                )
              : String(value ?? "");
        });
      }

      const deadline = extractDeadline(
        response,
        newAttempt,
        selectedExam
      );

      setAttempt(newAttempt);

      setQuestions(questionList);

      setAnswers(normalizedAnswers);

      answersRef.current = normalizedAnswers;

      setMarkedQuestions([]);

      setCurrentQuestion(0);

      setExamDeadline(deadline);

      deadlineRef.current = deadline;

      setRemainingSeconds(
        Math.max(
          0,
          Math.floor((deadline - Date.now()) / 1000)
        )
      );

      setSaveStatus("saved");

      setReviewMode(false);

      setScreen("exam");
    } catch (err) {
      console.error("CBT START EXAM ERROR:", err);

      setError(err.message || "Unable to start examination.");
    } finally {
      setStartingExam(false);
    }
  }, [selectedExam, startingExam]);

  // ==========================================================
  // SAVE ANSWERS
  // ==========================================================

  const saveAnswers = useCallback(async (answerData) => {
    if (!attempt || submittingRef.current) {
      return;
    }

    const attemptId =
      attempt?.id ||
      attempt?.attempt_id ||
      attempt?.attemptId;

    if (!attemptId) {
      return;
    }

    try {
      setSaveStatus("saving");

      await apiRequest(
        `${CBT_BASE}/attempts/${encodeURIComponent(attemptId)}/answers`,
        {
          method: "PUT",
          body: JSON.stringify({
            answers: answerData,
          }),
        }
      );

      if (mountedRef.current) {
        setSaveStatus("saved");
      }
    } catch (err) {
      console.error("CBT ANSWER SAVE ERROR:", err);

      if (mountedRef.current) {
        setSaveStatus("error");
      }
    }
  }, [attempt]);

  const scheduleAnswerSave = useCallback((nextAnswers) => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    saveTimerRef.current = setTimeout(() => {
      saveAnswers(nextAnswers);
    }, ANSWER_SAVE_DELAY);
  }, [saveAnswers]);

  // ==========================================================
  // SELECT ANSWER
  // ==========================================================

  const selectAnswer = useCallback((questionId, answer) => {
    if (!questionId || submittingRef.current) {
      return;
    }

    setAnswers((previous) => {
      const next = {
        ...previous,
        [String(questionId)]: String(answer),
      };

      answersRef.current = next;

      scheduleAnswerSave(next);

      return next;
    });
  }, [scheduleAnswerSave]);

  // ==========================================================
  // MARK QUESTION FOR REVIEW
  // ==========================================================

  const toggleMarkQuestion = useCallback((questionId) => {
    setMarkedQuestions((previous) => {
      if (previous.includes(questionId)) {
        return previous.filter((id) => id !== questionId);
      }

      return [...previous, questionId];
    });
  }, []);

  // ==========================================================
  // COUNTDOWN
  // ==========================================================

  useEffect(() => {
    if (screen !== "exam" || !examDeadline) {
      return;
    }

    const updateTimer = () => {
      const remaining = Math.max(
        0,
        Math.floor((examDeadline - Date.now()) / 1000)
      );

      setRemainingSeconds(remaining);
    };

    updateTimer();

    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [screen, examDeadline]);

  // ==========================================================
  // SUBMIT EXAM
  // ==========================================================

  const submitExam = useCallback(async (automatic = false) => {
    if (!attempt || submittingRef.current) {
      return;
    }

    const attemptId =
      attempt?.id ||
      attempt?.attempt_id ||
      attempt?.attemptId;

    if (!attemptId) {
      setError("Your examination attempt could not be identified.");
      return;
    }

    try {
      submittingRef.current = true;

      setSubmitting(true);

      setError("");

      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
        saveTimerRef.current = null;
      }

      const response = await apiRequest(
        `${CBT_BASE}/attempts/${encodeURIComponent(attemptId)}/submit`,
        {
          method: "POST",
          body: JSON.stringify({
            answers: answersRef.current,
            automatic,
          }),
        }
      );

      const result =
        response?.result ||
        response?.data?.result ||
        response?.attempt ||
        response?.data ||
        response;

      setExamResult(result);

      setScreen("result");

      setSubmitConfirmation(false);

      setSaveStatus("saved");

      await loadDashboard(true);
    } catch (err) {
      console.error("CBT SUBMISSION ERROR:", err);

      setError(
        err.message ||
        "Unable to submit examination. Please try again."
      );
    } finally {
      submittingRef.current = false;

      setSubmitting(false);
    }
  }, [attempt, loadDashboard]);

  // ==========================================================
  // AUTO SUBMIT WHEN TIME EXPIRES
  // ==========================================================

  useEffect(() => {
    if (
      screen !== "exam" ||
      remainingSeconds > 0 ||
      submittingRef.current
    ) {
      return;
    }

    submitExam(true);
  }, [screen, remainingSeconds, submitExam]);

  // ==========================================================
  // QUESTION COUNTS
  // ==========================================================

  const answeredCount = useMemo(
    () =>
      questions.filter((question) => {
        const id = getQuestionId(question);

        return Boolean(getSavedAnswer(answers, id));
      }).length,
    [questions, answers]
  );

  const unansweredCount = questions.length - answeredCount;

  const currentQuestionData = questions[currentQuestion];

  const currentQuestionId = getQuestionId(currentQuestionData);

  const currentAnswer = getSavedAnswer(
    answers,
    currentQuestionId
  );

  const currentOptions = useMemo(
    () => getQuestionOptions(currentQuestionData || {}),
    [currentQuestionData]
  );

  // ==========================================================
  // QUESTION NAVIGATION
  // ==========================================================

  const goToQuestion = (index) => {
    if (index < 0 || index >= questions.length) {
      return;
    }

    setCurrentQuestion(index);
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((previous) => previous + 1);
    }
  };

  const previousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((previous) => previous - 1);
    }
  };

  // ==========================================================
  // EXIT EXAM
  // ==========================================================

  const exitExam = () => {
    if (screen === "exam") {
      setError(
        "Your examination is still in progress. Submit it before leaving."
      );
      return;
    }

    setScreen("dashboard");
  };

  // ==========================================================
  // RESULT HELPERS
  // ==========================================================

  const resultScore = Number(
    examResult?.score ??
    examResult?.marks_obtained ??
    examResult?.total_score ??
    examResult?.correct_answers ??
    0
  );

  const resultTotal = Number(
    examResult?.total_marks ??
    examResult?.maximum_score ??
    examResult?.total_questions ??
    examResult?.question_count ??
    questions.length ??
    0
  );

  const resultPercentage = Number(
    examResult?.percentage ??
    (
      resultTotal > 0
        ? (resultScore / resultTotal) * 100
        : 0
    )
  );

  const passed =
    examResult?.passed ??
    examResult?.status === "passed" ??
    resultPercentage >= 50;

  // ==========================================================
  // LOADING SCREEN
  // ==========================================================

  if (loading) {
    return (
      <div className="min-h-[65vh] flex flex-col items-center justify-center text-center text-slate-300">
        <Loader2 className="w-10 h-10 animate-spin text-blue-400 mb-4" />

        <h2 className="text-lg font-semibold text-white">
          Loading your examinations
        </h2>

        <p className="text-sm text-slate-400 mt-2">
          Checking your scheduled Academy CBT exams...
        </p>
      </div>
    );
  }

  // ==========================================================
  // EXAMINATION SCREEN
  // ==========================================================

  if (screen === "exam") {
    if (!currentQuestionData) {
      return (
        <div className="p-6 text-center text-white">
          <AlertCircle className="w-10 h-10 mx-auto mb-3 text-red-400" />

          <p>Examination questions could not be displayed.</p>

          <button
            onClick={() => submitExam(true)}
            className="mt-5 px-5 py-3 rounded-xl bg-red-600"
          >
            Submit examination
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-5 text-slate-200">
        {/* EXAM HEADER */}

        <div className="rounded-2xl border border-slate-700 bg-[#071426] p-4 md:p-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-blue-400 text-xs font-semibold uppercase tracking-wider">
                <ShieldCheck size={15} />
                Scholiqen Academy CBT
              </div>

              <h1 className="text-xl md:text-2xl font-bold text-white mt-2">
                {getExamTitle(selectedExam)}
              </h1>

              <p className="text-sm text-slate-400 mt-1">
                {studentName}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div
                className={`rounded-xl border px-4 py-3 ${
                  remainingSeconds <= 300
                    ? "border-red-500/50 bg-red-500/10"
                    : "border-slate-700 bg-[#020617]"
                }`}
              >
                <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                  <Timer size={14} />
                  Time remaining
                </div>

                <div
                  className={`font-mono text-xl font-bold ${
                    remainingSeconds <= 300
                      ? "text-red-400"
                      : "text-white"
                  }`}
                >
                  {formatTime(remainingSeconds)}
                </div>
              </div>

              <button
                onClick={() => setSubmitConfirmation(true)}
                disabled={submitting}
                className="px-4 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-semibold disabled:opacity-50"
              >
                Submit
              </button>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-3">
            <div className="rounded-xl bg-[#020617] p-3">
              <p className="text-xs text-slate-400">Questions</p>
              <p className="text-xl font-bold text-white">
                {questions.length}
              </p>
            </div>

            <div className="rounded-xl bg-[#020617] p-3">
              <p className="text-xs text-slate-400">Answered</p>
              <p className="text-xl font-bold text-emerald-400">
                {answeredCount}
              </p>
            </div>

            <div className="rounded-xl bg-[#020617] p-3">
              <p className="text-xs text-slate-400">Unanswered</p>
              <p className="text-xl font-bold text-amber-400">
                {unansweredCount}
              </p>
            </div>
          </div>

          <div className="h-2 rounded-full bg-slate-800 overflow-hidden mt-4">
            <div
              className="h-full bg-blue-500 transition-all"
              style={{
                width: `${
                  questions.length
                    ? (answeredCount / questions.length) * 100
                    : 0
                }%`,
              }}
            />
          </div>

          <div className="flex justify-between items-center mt-2 text-xs text-slate-400">
            <span>Answer progress</span>

            <span>
              {answeredCount}/{questions.length}
            </span>
          </div>
        </div>

        {/* SAVE STATUS */}

        <div className="flex justify-between items-center text-xs px-1">
          <span className="text-slate-400">
            Question {currentQuestion + 1} of {questions.length}
          </span>

          <span className="flex items-center gap-2">
            {saveStatus === "saving" && (
              <>
                <Loader2 size={13} className="animate-spin" />
                Saving answer...
              </>
            )}

            {saveStatus === "saved" && (
              <>
                <CheckCircle2 size={13} className="text-emerald-400" />
                Answers saved
              </>
            )}

            {saveStatus === "error" && (
              <>
                <AlertCircle size={13} className="text-red-400" />
                Save failed
              </>
            )}
          </span>
        </div>

        {/* QUESTION AND NAVIGATION */}

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-5">
          <div className="rounded-2xl border border-slate-700 bg-[#071426] overflow-hidden">
            <div className="border-b border-slate-700 p-4 md:p-5 flex justify-between items-center">
              <div>
                <p className="text-xs text-blue-400 font-semibold uppercase tracking-wider">
                  {currentQuestionData.subject || selectedExam?.subject || "Examination"}
                </p>

                <h2 className="text-white font-semibold mt-1">
                  Question {currentQuestion + 1}
                </h2>
              </div>

              <button
                onClick={() => toggleMarkQuestion(currentQuestionId)}
                className={`text-xs rounded-lg px-3 py-2 border ${
                  markedQuestions.includes(currentQuestionId)
                    ? "border-amber-500/50 bg-amber-500/10 text-amber-300"
                    : "border-slate-600 text-slate-400 hover:text-white"
                }`}
              >
                {markedQuestions.includes(currentQuestionId)
                  ? "Marked for review"
                  : "Mark for review"}
              </button>
            </div>

            <div className="p-5 md:p-7">
              {currentQuestionData.passage && (
                <div className="rounded-xl border border-slate-700 bg-[#020617] p-4 mb-5">
                  {currentQuestionData.passage_title && (
                    <h3 className="font-semibold text-white mb-2">
                      {currentQuestionData.passage_title}
                    </h3>
                  )}

                  <p className="text-sm leading-7 text-slate-300 whitespace-pre-wrap">
                    {currentQuestionData.passage}
                  </p>
                </div>
              )}

              {currentQuestionData.image && (
                <div className="mb-5">
                  <img
                    src={
                      currentQuestionData.image.startsWith("http")
                        ? currentQuestionData.image
                        : `${API_BASE}${currentQuestionData.image.startsWith("/") ? "" : "/"}${currentQuestionData.image}`
                    }
                    alt="Question illustration"
                    className="max-h-80 max-w-full rounded-xl object-contain"
                  />
                </div>
              )}

              <div className="text-base md:text-lg leading-8 text-white whitespace-pre-wrap">
                {getQuestionText(currentQuestionData)}
              </div>

              <div className="space-y-3 mt-7">
                {currentOptions.map((option) => {
                  const selected =
                    currentAnswer.toUpperCase() ===
                    option.key.toUpperCase();

                  return (
                    <button
                      key={option.key}
                      onClick={() =>
                        selectAnswer(currentQuestionId, option.key)
                      }
                      disabled={submitting}
                      className={`w-full flex items-start gap-3 p-4 rounded-xl border text-left transition-all ${
                        selected
                          ? "border-blue-500 bg-blue-500/10"
                          : "border-slate-700 bg-[#020617] hover:border-slate-500"
                      }`}
                    >
                      <span
                        className={`w-8 h-8 shrink-0 rounded-lg flex items-center justify-center text-sm font-bold ${
                          selected
                            ? "bg-blue-600 text-white"
                            : "bg-slate-800 text-slate-300"
                        }`}
                      >
                        {option.key}
                      </span>

                      <span className="flex-1 text-sm md:text-base leading-7 text-slate-200 pt-0.5">
                        {option.text}
                      </span>

                      {selected && (
                        <CheckCircle2
                          size={19}
                          className="text-blue-400 shrink-0"
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              {!currentOptions.length && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300 mt-5">
                  No answer options were supplied for this question.
                </div>
              )}

              {/* NAVIGATION */}

              <div className="flex flex-wrap justify-between gap-3 mt-9 pt-5 border-t border-slate-700">
                <button
                  onClick={previousQuestion}
                  disabled={currentQuestion === 0}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl border border-slate-600 text-slate-300 hover:bg-slate-800 disabled:opacity-30"
                >
                  <ArrowLeft size={17} />
                  Previous
                </button>

                {currentQuestion < questions.length - 1 ? (
                  <button
                    onClick={nextQuestion}
                    className="flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold"
                  >
                    Next question
                    <ArrowRight size={17} />
                  </button>
                ) : (
                  <button
                    onClick={() => setSubmitConfirmation(true)}
                    className="flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
                  >
                    Finish examination
                    <Check size={17} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* QUESTION NAVIGATION PANEL */}

          <aside className="rounded-2xl border border-slate-700 bg-[#071426] p-4 h-fit">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white">
                Question navigator
              </h3>

              <button
                onClick={() => setShowQuestionGrid((value) => !value)}
                className="text-xs text-blue-400"
              >
                {showQuestionGrid ? "Hide" : "Show"}
              </button>
            </div>

            {showQuestionGrid && (
              <>
                <div className="grid grid-cols-5 gap-2">
                  {questions.map((question, index) => {
                    const id = getQuestionId(question);

                    const answered = Boolean(
                      getSavedAnswer(answers, id)
                    );

                    const marked = markedQuestions.includes(id);

                    const active = currentQuestion === index;

                    return (
                      <button
                        key={id || index}
                        onClick={() => goToQuestion(index)}
                        className={`aspect-square rounded-lg text-sm font-semibold border ${
                          active
                            ? "border-blue-400 bg-blue-600 text-white"
                            : marked
                              ? "border-amber-500 bg-amber-500/20 text-amber-300"
                              : answered
                                ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-300"
                                : "border-slate-600 bg-[#020617] text-slate-400"
                        }`}
                      >
                        {index + 1}
                      </button>
                    );
                  })}
                </div>

                <div className="space-y-3 mt-5 text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded bg-emerald-500/30 border border-emerald-500" />
                    Answered
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded bg-amber-500/30 border border-amber-500" />
                    Marked for review
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded bg-[#020617] border border-slate-600" />
                    Not answered
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded bg-blue-600 border border-blue-400" />
                    Current question
                  </div>
                </div>
              </>
            )}

            <div className="border-t border-slate-700 mt-5 pt-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-400">Answered</span>
                <span className="text-emerald-400 font-semibold">
                  {answeredCount}
                </span>
              </div>

              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-400">Unanswered</span>
                <span className="text-amber-400 font-semibold">
                  {unansweredCount}
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Review</span>
                <span className="text-white font-semibold">
                  {markedQuestions.length}
                </span>
              </div>
            </div>

            <button
              onClick={() => setSubmitConfirmation(true)}
              disabled={submitting}
              className="w-full mt-5 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-semibold disabled:opacity-50"
            >
              Submit examination
            </button>
          </aside>
        </div>

        {/* SUBMISSION CONFIRMATION */}

        <AnimatePresence>
          {submitConfirmation && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.95, y: 15 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 15 }}
                className="w-full max-w-md rounded-2xl border border-slate-700 bg-[#071426] p-6"
              >
                <div className="w-12 h-12 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center mb-4">
                  <FileText size={24} />
                </div>

                <h2 className="text-xl font-bold text-white">
                  Submit examination?
                </h2>

                <p className="text-sm text-slate-400 leading-6 mt-2">
                  Are you sure you want to submit this examination?
                  You will not be able to change your answers afterward.
                </p>

                <div className="grid grid-cols-2 gap-3 mt-5">
                  <div className="rounded-xl bg-[#020617] p-3">
                    <p className="text-xs text-slate-400">
                      Answered
                    </p>

                    <p className="text-xl font-bold text-emerald-400">
                      {answeredCount}
                    </p>
                  </div>

                  <div className="rounded-xl bg-[#020617] p-3">
                    <p className="text-xs text-slate-400">
                      Unanswered
                    </p>

                    <p className="text-xl font-bold text-amber-400">
                      {unansweredCount}
                    </p>
                  </div>
                </div>

                {unansweredCount > 0 && (
                  <p className="text-xs text-amber-300 mt-4">
                    You still have {unansweredCount} unanswered question(s).
                  </p>
                )}

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setSubmitConfirmation(false)}
                    disabled={submitting}
                    className="flex-1 py-3 rounded-xl border border-slate-600 text-slate-300 hover:bg-slate-800"
                  >
                    Continue exam
                  </button>

                  <button
                    onClick={() => submitExam(false)}
                    disabled={submitting}
                    className="flex-1 py-3 rounded-xl bg-red-600 text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {submitting ? (
                      <Loader2 size={17} className="animate-spin" />
                    ) : (
                      <Check size={17} />
                    )}

                    {submitting ? "Submitting..." : "Submit now"}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* SUBMISSION ERROR */}

        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 flex gap-3 text-sm text-red-300">
            <AlertCircle size={18} className="shrink-0" />
            {error}
          </div>
        )}
      </div>
    );
  }

  // ==========================================================
  // RESULT SCREEN
  // ==========================================================

  if (screen === "result") {
    return (
      <div className="max-w-3xl mx-auto space-y-6 text-slate-200">
        <div className="rounded-2xl border border-slate-700 bg-[#071426] p-6 md:p-9 text-center">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            {passed ? (
              <Trophy size={32} />
            ) : (
              <Award size={32} />
            )}
          </div>

          <p className="text-xs uppercase tracking-widest text-blue-400 font-semibold mt-5">
            Examination completed
          </p>

          <h1 className="text-2xl md:text-3xl font-bold text-white mt-2">
            {passed ? "Well done!" : "Examination submitted"}
          </h1>

          <p className="text-sm text-slate-400 mt-2">
            {getExamTitle(selectedExam)}
          </p>

          <div className="my-8">
            <div className="text-5xl md:text-6xl font-black text-white">
              {Number.isFinite(resultPercentage)
                ? resultPercentage.toFixed(1)
                : "0.0"}
              <span className="text-2xl text-slate-400">%</span>
            </div>

            <p className="text-sm text-slate-400 mt-2">
              Your examination score
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
            <div className="rounded-xl bg-[#020617] p-4">
              <p className="text-xs text-slate-400">
                Score
              </p>

              <p className="text-xl font-bold text-white mt-1">
                {resultScore}
                {resultTotal > 0 ? ` / ${resultTotal}` : ""}
              </p>
            </div>

            <div className="rounded-xl bg-[#020617] p-4">
              <p className="text-xs text-slate-400">
                Result
              </p>

              <p
                className={`text-xl font-bold mt-1 ${
                  passed ? "text-emerald-400" : "text-amber-400"
                }`}
              >
                {passed ? "Passed" : "Completed"}
              </p>
            </div>
          </div>

          {examResult?.feedback && (
            <div className="mt-6 rounded-xl bg-[#020617] border border-slate-700 p-4 text-left">
              <h3 className="text-sm font-semibold text-white mb-2">
                Feedback
              </h3>

              <p className="text-sm text-slate-400 leading-6">
                {examResult.feedback}
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row justify-center gap-3 mt-8">
            <button
              onClick={() => {
                setScreen("dashboard");
                setAttempt(null);
                setQuestions([]);
                setAnswers({});
                setExamResult(null);
                setSelectedExam(null);
                setExamDeadline(null);
                loadDashboard(true);
              }}
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold"
            >
              Back to examinations
            </button>

            <button
              onClick={() => navigate("/academy/student/progress")}
              className="px-6 py-3 rounded-xl border border-slate-600 text-slate-300 hover:bg-slate-800"
            >
              View my progress
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================================
  // INSTRUCTIONS SCREEN
  // ==========================================================

  if (screen === "instructions" && selectedExam) {
    const examStatus = getExamStatus(selectedExam);

    const subjects = getExamSubjects(selectedExam);

    const startTime = getExamStart(selectedExam);

    const endTime = getExamEnd(selectedExam);

    return (
      <div className="max-w-4xl mx-auto space-y-5 text-slate-200">
        <button
          onClick={() => {
            setScreen("dashboard");
            setSelectedExam(null);
            setError("");
          }}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-white"
        >
          <ArrowLeft size={17} />
          Back to examinations
        </button>

        <div className="rounded-2xl border border-slate-700 bg-[#071426] overflow-hidden">
          <div className="p-6 md:p-8 border-b border-slate-700">
            <div className="flex items-center gap-2 text-blue-400 text-xs font-semibold uppercase tracking-wider">
              <GraduationCap size={17} />
              Scholiqen Academy
            </div>

            <h1 className="text-2xl md:text-3xl font-bold text-white mt-4">
              {getExamTitle(selectedExam)}
            </h1>

            <p className="text-sm text-slate-400 mt-2">
              Read the examination information and instructions carefully before starting.
            </p>

            <div className="flex flex-wrap gap-2 mt-5">
              <span
                className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                  examStatus === "available"
                    ? "bg-emerald-500/10 text-emerald-400"
                    : examStatus === "upcoming"
                      ? "bg-amber-500/10 text-amber-300"
                      : "bg-red-500/10 text-red-300"
                }`}
              >
                {examStatus === "available"
                  ? "Available"
                  : examStatus === "upcoming"
                    ? "Not started"
                    : "Unavailable"}
              </span>

              <span className="px-3 py-1.5 rounded-full bg-slate-800 text-slate-300 text-xs">
                {formatDuration(getDuration(selectedExam))}
              </span>
            </div>
          </div>

          <div className="p-6 md:p-8 space-y-7">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-xl bg-[#020617] border border-slate-700 p-4">
                <div className="flex items-center gap-2 text-slate-400 text-xs">
                  <CalendarDays size={15} />
                  Scheduled start
                </div>

                <p className="text-white font-semibold mt-2">
                  {formatDate(startTime)}
                </p>
              </div>

              <div className="rounded-xl bg-[#020617] border border-slate-700 p-4">
                <div className="flex items-center gap-2 text-slate-400 text-xs">
                  <Clock3 size={15} />
                  Scheduled closing
                </div>

                <p className="text-white font-semibold mt-2">
                  {formatDate(endTime)}
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-white font-semibold mb-3">
                Examination subjects
              </h2>

              {subjects.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {subjects.map((subject) => (
                    <span
                      key={subject}
                      className="px-3 py-2 rounded-lg border border-slate-700 bg-[#020617] text-sm text-slate-300"
                    >
                      {subject}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400">
                  Your examination subjects will be determined by your registered course and the examination configuration.
                </p>
              )}
            </div>

            {getExamDescription(selectedExam) && (
              <div>
                <h2 className="text-white font-semibold mb-3">
                  Examination information
                </h2>

                <div className="rounded-xl border border-slate-700 bg-[#020617] p-4 text-sm leading-7 text-slate-300 whitespace-pre-wrap">
                  {getExamDescription(selectedExam)}
                </div>
              </div>
            )}

            <div>
              <h2 className="text-white font-semibold mb-4">
                Examination instructions
              </h2>

              <div className="space-y-3">
                {[
                  "Make sure you have a stable internet connection before starting.",
                  "The examination timer starts when your attempt begins.",
                  "Answer each question by selecting the option you consider correct.",
                  "Use the question navigator to move between questions.",
                  "You can mark questions for review before submitting.",
                  "Your answers are saved while you work.",
                  "The examination will be submitted automatically when the time expires.",
                  "You cannot change your answers after submitting the examination.",
                ].map((instruction, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 text-sm text-slate-300"
                  >
                    <CheckCircle2
                      size={17}
                      className="text-emerald-400 shrink-0 mt-0.5"
                    />

                    <span>{instruction}</span>
                  </div>
                ))}
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
                {error}
              </div>
            )}

            {examStatus === "upcoming" && (
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
                <div className="flex items-center gap-2 text-amber-300 font-semibold text-sm">
                  <Lock size={17} />
                  Examination not yet available
                </div>

                <p className="text-xs text-amber-200/80 mt-2">
                  You can start this examination when the scheduled start time arrives.
                </p>
              </div>
            )}

            <button
              onClick={startExam}
              disabled={
                startingExam ||
                examStatus !== "available"
              }
              className="w-full flex items-center justify-center gap-3 py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {startingExam ? (
                <>
                  <Loader2 size={19} className="animate-spin" />
                  Starting examination...
                </>
              ) : examStatus === "upcoming" ? (
                <>
                  <Lock size={19} />
                  Examination not yet open
                </>
              ) : (
                <>
                  <Play size={19} />
                  I am ready - Start examination
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================================
  // DASHBOARD SCREEN
  // ==========================================================

  return (
    <div className="space-y-6 text-slate-200">
      {/* HEADER */}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-400 text-xs font-semibold uppercase tracking-wider">
            <GraduationCap size={16} />
            Scholiqen Academy
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-white mt-2">
            Computer Based Test
          </h1>

          <p className="text-sm text-slate-400 mt-2">
            Welcome, {studentName}. View your scheduled examinations and check your results.
          </p>
        </div>

        <button
          onClick={() => loadDashboard(true)}
          disabled={refreshing}
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-slate-700 bg-[#071426] hover:bg-slate-800 text-sm text-slate-300 disabled:opacity-50"
        >
          <RefreshCw
            size={16}
            className={refreshing ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </div>

      {/* ERROR */}

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 flex items-start gap-3 text-sm text-red-300">
          <AlertCircle size={18} className="shrink-0 mt-0.5" />

          <div className="flex-1">
            {error}
          </div>

          <button
            onClick={() => setError("")}
            className="text-red-300 hover:text-white"
          >
            <XCircle size={17} />
          </button>
        </div>
      )}

      {/* SUMMARY */}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-700 bg-[#071426] p-5">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
            <FileText size={20} />
          </div>

          <p className="text-sm text-slate-400 mt-4">
            Total examinations
          </p>

          <p className="text-3xl font-bold text-white mt-1">
            {exams.length}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-700 bg-[#071426] p-5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <Play size={20} />
          </div>

          <p className="text-sm text-slate-400 mt-4">
            Available now
          </p>

          <p className="text-3xl font-bold text-white mt-1">
            {availableExams.length}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-700 bg-[#071426] p-5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
            <CalendarDays size={20} />
          </div>

          <p className="text-sm text-slate-400 mt-4">
            Upcoming exams
          </p>

          <p className="text-3xl font-bold text-white mt-1">
            {upcomingExams.length}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-700 bg-[#071426] p-5">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
            <Award size={20} />
          </div>

          <p className="text-sm text-slate-400 mt-4">
            Completed results
          </p>

          <p className="text-3xl font-bold text-white mt-1">
            {results.length}
          </p>
        </div>
      </div>

      {/* REGISTERED SUBJECTS */}

      {registeredSubjects.length > 0 && (
        <div className="rounded-2xl border border-slate-700 bg-[#071426] p-5">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen size={18} className="text-blue-400" />

            <h2 className="font-semibold text-white">
              Your registered subjects
            </h2>
          </div>

          <div className="flex flex-wrap gap-2">
            {registeredSubjects.map((subject) => (
              <span
                key={subject}
                className="px-3 py-2 rounded-lg border border-slate-700 bg-[#020617] text-sm text-slate-300"
              >
                {subject}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* AVAILABLE EXAMS */}

      <section>
        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-lg font-bold text-white">
              Available examinations
            </h2>

            <p className="text-xs text-slate-400 mt-1">
              Examinations currently within their scheduled access window.
            </p>
          </div>

          <span className="text-xs text-emerald-400">
            {availableExams.length} available
          </span>
        </div>

        {availableExams.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {availableExams.map((exam) => {
              const subjects = getExamSubjects(exam);

              return (
                <motion.div
                  key={getExamId(exam)}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl border border-slate-700 bg-[#071426] p-5 flex flex-col"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="w-11 h-11 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                      <GraduationCap size={23} />
                    </div>

                    <span className="text-xs px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400">
                      Available
                    </span>
                  </div>

                  <h3 className="font-bold text-white text-lg mt-5">
                    {getExamTitle(exam)}
                  </h3>

                  <p className="text-xs text-slate-400 mt-2 leading-6 line-clamp-3">
                    {getExamDescription(exam) ||
                      "Scheduled computer-based examination for your registered subjects."}
                  </p>

                  <div className="space-y-3 mt-5 text-xs">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Clock3 size={15} />
                      {formatDuration(getDuration(exam))}
                    </div>

                    <div className="flex items-center gap-2 text-slate-400">
                      <CalendarDays size={15} />
                      {formatDate(getExamStart(exam))}
                    </div>

                    {subjects.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {subjects.slice(0, 4).map((subject) => (
                          <span
                            key={subject}
                            className="rounded-lg bg-[#020617] border border-slate-700 px-2 py-1 text-slate-300"
                          >
                            {subject}
                          </span>
                        ))}

                        {subjects.length > 4 && (
                          <span className="text-slate-500 py-1">
                            +{subjects.length - 4} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => openExam(exam)}
                    className="w-full mt-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm flex items-center justify-center gap-2"
                  >
                    View instructions
                    <ArrowRight size={16} />
                  </button>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-700 bg-[#071426] p-8 text-center">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center mx-auto text-blue-400">
              <CalendarDays size={26} />
            </div>

            <h3 className="text-white font-semibold mt-4">
              No examination available right now
            </h3>

            <p className="text-sm text-slate-400 max-w-md mx-auto mt-2 leading-6">
              Your administrator has not opened an examination for you yet. Upcoming scheduled examinations will appear here when they are published.
            </p>
          </div>
        )}
      </section>

      {/* UPCOMING EXAMS */}

      {upcomingExams.length > 0 && (
        <section>
          <div className="mb-4">
            <h2 className="text-lg font-bold text-white">
              Upcoming examinations
            </h2>

            <p className="text-xs text-slate-400 mt-1">
              These examinations are locked until their scheduled start time.
            </p>
          </div>

          <div className="space-y-3">
            {upcomingExams.map((exam) => (
              <div
                key={getExamId(exam)}
                className="rounded-xl border border-slate-700 bg-[#071426] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
                    <Lock size={19} />
                  </div>

                  <div>
                    <h3 className="font-semibold text-white">
                      {getExamTitle(exam)}
                    </h3>

                    <p className="text-xs text-slate-400 mt-1">
                      Starts: {formatDate(getExamStart(exam))}
                    </p>

                    <p className="text-xs text-slate-500 mt-1">
                      Duration: {formatDuration(getDuration(exam))}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => openExam(exam)}
                  className="px-4 py-2.5 rounded-xl border border-slate-600 text-slate-300 hover:bg-slate-800 text-sm"
                >
                  View details
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* RECENT RESULTS */}

      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-white">
              Examination results
            </h2>

            <p className="text-xs text-slate-400 mt-1">
              Your actual submitted examination records.
            </p>
          </div>

          <button
            onClick={() => navigate("/academy/student/progress")}
            className="text-xs text-blue-400 hover:text-blue-300"
          >
            View progress
          </button>
        </div>

        {results.length > 0 ? (
          <div className="rounded-2xl border border-slate-700 bg-[#071426] overflow-hidden">
            {results.slice(0, 8).map((result, index) => {
              const title =
                result?.exam_title ||
                result?.title ||
                result?.exam_name ||
                result?.exam ||
                "Completed examination";

              const percentage = Number(
                result?.percentage ??
                result?.score_percentage ??
                0
              );

              return (
                <div
                  key={
                    result?.id ||
                    result?.attempt_id ||
                    index
                  }
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-700 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                      <Award size={19} />
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-white">
                        {title}
                      </h3>

                      <p className="text-xs text-slate-400 mt-1">
                        {formatDate(
                          result?.submitted_at ||
                          result?.completed_at ||
                          result?.created_at
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span
                      className={`text-sm font-bold ${
                        percentage >= 50
                          ? "text-emerald-400"
                          : "text-amber-400"
                      }`}
                    >
                      {percentage.toFixed(1)}%
                    </span>

                    <span className="text-xs text-slate-400">
                      {result?.status || "Submitted"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-700 bg-[#071426] p-7 text-center">
            <Award size={28} className="mx-auto text-slate-500" />

            <p className="text-sm font-semibold text-white mt-3">
              No examination results yet
            </p>

            <p className="text-xs text-slate-400 mt-2">
              Your results will appear here after you submit an examination.
            </p>
          </div>
        )}
      </section>

      {/* CLOSED EXAMS */}

      {closedExams.length > 0 && (
        <section>
          <h2 className="text-lg font-bold text-white mb-4">
            Closed examinations
          </h2>

          <div className="space-y-3">
            {closedExams.map((exam) => (
              <div
                key={getExamId(exam)}
                className="rounded-xl border border-slate-800 bg-[#071426]/70 p-4 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 text-slate-500 flex items-center justify-center">
                    <FileText size={18} />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-slate-300">
                      {getExamTitle(exam)}
                    </p>

                    <p className="text-xs text-slate-500 mt-1">
                      {formatDate(getExamStart(exam))}
                    </p>
                  </div>
                </div>

                <span className="text-xs text-slate-500">
                  Closed
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* FOOTER */}

      <div className="rounded-2xl border border-slate-700 bg-[#071426] p-5 flex items-start gap-3">
        <ShieldCheck size={20} className="text-blue-400 shrink-0 mt-0.5" />

        <div>
          <h3 className="text-sm font-semibold text-white">
            Examination security
          </h3>

          <p className="text-xs text-slate-400 mt-1 leading-6">
            Examination access is controlled by the server schedule. Your examination time is managed by the backend, and refreshing the page should not restart your attempt.
          </p>
        </div>
      </div>
    </div>
  );
}
