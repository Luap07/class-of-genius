
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useOutletContext } from "react-router-dom";
import { motion } from "framer-motion";

import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  GraduationCap,
  Info,
  Loader2,
  LockKeyhole,
  RefreshCw,
  ShieldCheck,
  X,
  Hourglass,
} from "lucide-react";

import CBTInstructions from "../academy/student-cbt/CBTInstructions";
import CBTExamScreen from "../academy/student-cbt/CBTExamScreen";

const API_BASE = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

const CBT_BASE = `${API_BASE}/api/academy/student/cbt`;

const TOKEN_KEYS = [
  "scholiqen_academy_token",
  "academy_token",
  "scholiqen_token",
  "access_token",
  "token",
];

const DARK_PANEL =
  "rounded-2xl border border-white/[0.08] bg-[#071426]/90 shadow-[0_18px_60px_rgba(0,0,0,0.22)]";

/* =========================================================
   GENERAL HELPERS
========================================================= */

const clean = (value) =>
  value === undefined || value === null ? "" : String(value).trim();

const firstValue = (...values) =>
  values.find(
    (value) =>
      value !== undefined &&
      value !== null &&
      value !== ""
  );

const normalizeSubject = (value) =>
  clean(
    typeof value === "string"
      ? value
      : value?.subject ||
          value?.name ||
          value?.title ||
          value?.subject_name
  ).toLowerCase();

const getToken = () => {
  for (const key of TOKEN_KEYS) {
    const value = localStorage.getItem(key);
    if (value) return value;
  }

  return "";
};

const getExamId = (item) =>
  firstValue(
    item?.examId,
    item?.exam_id,
    item?.school_exam_id,
    item?.exam?.id,
    item?.schoolExam?.id,
    item?.id,
    ""
  );

const getExamFromSubject = (item) =>
  item?.exam || item?.schoolExam || item;

const getQuestionId = (question, index) =>
  clean(
    firstValue(
      question?.id,
      question?.question_id,
      question?.uuid,
      index
    )
  );

const formatDateTime = (value) => {
  if (!value) return "Not set";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Not set";

  return date.toLocaleString("en-NG", {
    timeZone: "Africa/Lagos",
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const isTrue = (value) =>
  value === true ||
  value === 1 ||
  ["true", "1", "yes"].includes(
    clean(value).toLowerCase()
  );

/* =========================================================
   PERMANENT SUBMISSION DETECTION

   IMPORTANT:
   Do not use the general exam "status" field here.
   That field may mean scheduled, published, closed, etc.
   Only attempt-related information identifies submission.
========================================================= */

const getAttemptObjects = (item) => {
  if (!item || typeof item !== "object") return [];

  const exam = getExamFromSubject(item);

  const objects = [
    item,
    item.attempt,
    item.latestAttempt,
    item.latest_attempt,
    item.completedAttempt,
    item.completed_attempt,
    item.submittedAttempt,
    item.submitted_attempt,
    exam,
    exam?.attempt,
    exam?.latestAttempt,
    exam?.latest_attempt,
    exam?.completedAttempt,
    exam?.completed_attempt,
    exam?.submittedAttempt,
    exam?.submitted_attempt,
  ];

  const arrays = [
    item.attempts,
    item.data?.attempts,
    exam?.attempts,
  ];

  arrays.forEach((array) => {
    if (Array.isArray(array)) {
      objects.push(...array);
    }
  });

  return objects.filter(
    (value) => value && typeof value === "object"
  );
};

const getSubmissionTimestamp = (item) => {
  const objects = getAttemptObjects(item);

  const timestamps = [
    item?.submittedAt,
    item?.submitted_at,
    item?.submitted_at_time,
    item?.completed_at,
    item?.completedAt,
    item?.exam?.submittedAt,
    item?.exam?.submitted_at,
    item?.schoolExam?.submittedAt,
    item?.schoolExam?.submitted_at,
  ];

  objects.forEach((attempt) => {
    timestamps.push(
      attempt?.submittedAt,
      attempt?.submitted_at,
      attempt?.submitted_at_time,
      attempt?.completedAt,
      attempt?.completed_at
    );
  });

  return firstValue(...timestamps, null);
};

const isExamSubmitted = (item) => {
  if (!item || typeof item !== "object") return false;

  const objects = getAttemptObjects(item);

  const flags = [
    item?.submitted,
    item?.isSubmitted,
    item?.is_submitted,
    item?.hasSubmitted,
    item?.has_submitted,
    item?.exam?.submitted,
    item?.exam?.is_submitted,
    item?.schoolExam?.submitted,
    item?.schoolExam?.is_submitted,
  ];

  objects.forEach((attempt) => {
    flags.push(
      attempt?.submitted,
      attempt?.isSubmitted,
      attempt?.is_submitted,
      attempt?.hasSubmitted,
      attempt?.has_submitted
    );
  });

  if (flags.some(isTrue)) return true;

  const statuses = objects
    .map((attempt) =>
      clean(
        firstValue(
          attempt?.attempt_status,
          attempt?.attemptStatus,
          attempt?.status
        )
      ).toLowerCase()
    )
    .filter(Boolean);

  if (
    statuses.some((status) =>
      ["submitted", "completed", "complete"].includes(status)
    )
  ) {
    return true;
  }

  /*
   * An expired attempt is considered submitted only when
   * the backend confirms that it has a submission/completion
   * timestamp. This avoids confusing an expired schedule
   * with a submitted examination.
   */
  const hasExpiredAttempt = objects.some((attempt) => {
    const status = clean(
      firstValue(
        attempt?.attempt_status,
        attempt?.attemptStatus,
        attempt?.status
      )
    ).toLowerCase();

    return (
      status === "expired" &&
      Boolean(
        firstValue(
          attempt?.submitted_at,
          attempt?.submittedAt,
          attempt?.completed_at,
          attempt?.completedAt
        )
      )
    );
  });

  return (
    hasExpiredAttempt ||
    Boolean(getSubmissionTimestamp(item))
  );
};

const makeSubmittedSubject = (
  subject,
  submittedAt = new Date().toISOString(),
  attemptId = null
) => ({
  ...subject,
  submitted: true,
  isSubmitted: true,
  is_submitted: true,
  has_submitted: true,
  submittedAt,
  submitted_at: submittedAt,
  attemptId: firstValue(
    attemptId,
    subject?.attemptId,
    subject?.attempt_id,
    subject?.submitted_attempt_id,
    null
  ),
  attemptStatus: "submitted",
  attempt_status: "submitted",
  attempt: {
    ...(subject?.attempt || {}),
    id: firstValue(
      attemptId,
      subject?.attempt?.id,
      subject?.attempt_id,
      null
    ),
    status: "submitted",
    attempt_status: "submitted",
    submitted: true,
    submitted_at: submittedAt,
  },
});

/* =========================================================
   SCHEDULE HELPERS
========================================================= */

const getScheduleStatus = (item, now = Date.now()) => {
  const exam = getExamFromSubject(item);

  const explicit = clean(
    firstValue(
      item?.availability_status,
      item?.schedule_status
    )
  ).toLowerCase();

  if (
    ["not_scheduled", "not scheduled", "unscheduled"].includes(
      explicit
    )
  ) {
    return "not_scheduled";
  }

  const start = firstValue(
    item?.scheduled_start_at,
    item?.startAt,
    item?.start_at,
    exam?.scheduled_start_at,
    exam?.start_at,
    exam?.startAt
  );

  const end = firstValue(
    item?.scheduled_end_at,
    item?.endAt,
    item?.end_at,
    exam?.scheduled_end_at,
    exam?.end_at,
    exam?.endAt
  );

  if (!start || !end) {
    if (explicit === "upcoming") return "upcoming";
    if (explicit === "closed") return "closed";
    return "not_scheduled";
  }

  const startMs = new Date(start).getTime();
  const endMs = new Date(end).getTime();

  if (
    !Number.isFinite(startMs) ||
    !Number.isFinite(endMs) ||
    endMs <= startMs
  ) {
    return "not_scheduled";
  }

  if (now < startMs) return "upcoming";
  if (now > endMs) return "closed";

  return "available";
};

const statusPresentation = {
  available: {
    label: "Available now",
    dot: "bg-emerald-400",
    text: "text-emerald-300",
    border: "border-emerald-400/20",
    background: "bg-emerald-400/[0.07]",
  },

  upcoming: {
    label: "Upcoming",
    dot: "bg-amber-400",
    text: "text-amber-300",
    border: "border-amber-400/20",
    background: "bg-amber-400/[0.07]",
  },

  closed: {
    label: "Closed",
    dot: "bg-rose-400",
    text: "text-rose-300",
    border: "border-rose-400/20",
    background: "bg-rose-400/[0.07]",
  },

  not_scheduled: {
    label: "Not scheduled",
    dot: "bg-slate-400",
    text: "text-slate-300",
    border: "border-white/10",
    background: "bg-white/[0.035]",
  },

  unavailable: {
    label: "Unavailable",
    dot: "bg-slate-400",
    text: "text-slate-300",
    border: "border-white/10",
    background: "bg-white/[0.035]",
  },

  submitted: {
    label: "Submitted",
    dot: "bg-emerald-400",
    text: "text-emerald-300",
    border: "border-emerald-400/25",
    background: "bg-emerald-400/[0.08]",
  },
};

/* =========================================================
   API RESPONSE HELPERS
========================================================= */

const readQuestionList = (payload) => {
  const candidates = [
    payload?.questions,
    payload?.attempt?.questions,
    payload?.data?.questions,
    payload?.data?.attempt?.questions,
  ];

  return candidates.find(Array.isArray) || [];
};

const readAttempt = (payload) =>
  payload?.attempt ||
  payload?.data?.attempt ||
  payload?.data ||
  {};

const readErrorMessage = (payload, fallback) =>
  clean(
    firstValue(
      payload?.message,
      payload?.error,
      payload?.details,
      payload?.data?.message,
      fallback
    )
  );

const isAlreadySubmittedError = (error) => {
  const message = clean(error?.message).toLowerCase();
  const code = clean(error?.code).toLowerCase();

  return (
    error?.status === 409 ||
    [
      "attempt_already_completed",
      "attempt_already_submitted",
      "exam_already_submitted",
      "already_submitted",
      "already_completed",
    ].includes(code) ||
    message.includes("already completed") ||
    message.includes("already submitted") ||
    message.includes("has been submitted") ||
    message.includes("attempt already")
  );
};

const getEnrolledSubjectNames = (value) => {
  let subjects = value;

  if (typeof subjects === "string") {
    try {
      subjects = JSON.parse(subjects);
    } catch {
      subjects = subjects.split(",").map((item) => item.trim());
    }
  }

  if (!Array.isArray(subjects)) return [];

  return subjects
    .map((subject) => {
      if (typeof subject === "string") return clean(subject);

      return clean(
        firstValue(
          subject?.subject,
          subject?.name,
          subject?.subject_name,
          subject?.title
        )
      );
    })
    .filter(Boolean);
};

const getPayloadArray = (payload, ...keys) => {
  for (const key of keys) {
    const value = key
      .split(".")
      .reduce((object, part) => object?.[part], payload);

    if (Array.isArray(value)) return value;
  }

  return [];
};

/* =========================================================
   ACADEMY-WIDE COUNTDOWN
========================================================= */

const getCountdownDetails = (startAt, endAt, now) => {
  if (!startAt || !endAt) {
    return {
      status: "not_set",
      label: "Schedule not set",
      target: null,
      message:
        "The administrator has not configured the examination schedule yet.",
    };
  }

  const start = new Date(startAt).getTime();
  const end = new Date(endAt).getTime();

  if (
    !Number.isFinite(start) ||
    !Number.isFinite(end) ||
    end <= start
  ) {
    return {
      status: "not_set",
      label: "Schedule unavailable",
      target: null,
      message: "The examination schedule is incomplete or invalid.",
    };
  }

  if (now < start) {
    return {
      status: "upcoming",
      label: "Examination begins in",
      target: start,
      message:
        "Get ready. The Academy examination period has not started yet.",
    };
  }

  if (now <= end) {
    return {
      status: "active",
      label: "Examination closes in",
      target: end,
      message: "The Academy examination period is currently active.",
    };
  }

  return {
    status: "ended",
    label: "Examination schedule has ended",
    target: null,
    message: "The scheduled Academy examination period is over.",
  };
};

function CountdownUnit({ value, label }) {
  return (
    <div className="rounded-xl border border-white/[0.08] bg-[#020b19]/90 px-2 py-4 text-center sm:px-4">
      <div className="font-mono text-2xl font-black tabular-nums tracking-tight text-white sm:text-4xl">
        {String(value).padStart(2, "0")}
      </div>

      <div className="mt-2 text-[9px] font-bold uppercase tracking-[0.16em] text-slate-500 sm:text-[10px]">
        {label}
      </div>
    </div>
  );
}

function AcademyScheduleCountdown({ startAt, endAt, now }) {
  const countdown = getCountdownDetails(startAt, endAt, now);

  let days = 0;
  let hours = 0;
  let minutes = 0;
  let seconds = 0;

  if (countdown.target) {
    const totalSeconds = Math.max(
      0,
      Math.ceil((countdown.target - now) / 1000)
    );

    days = Math.floor(totalSeconds / 86400);
    hours = Math.floor((totalSeconds % 86400) / 3600);
    minutes = Math.floor((totalSeconds % 3600) / 60);
    seconds = totalSeconds % 60;
  }

  const isActive = countdown.status === "active";
  const isEnded = countdown.status === "ended";

  return (
    <div className="mt-6 overflow-hidden rounded-2xl border border-blue-400/15 bg-[#020b19]/80 p-4 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${
              isEnded
                ? "border-rose-400/20 bg-rose-400/10 text-rose-300"
                : isActive
                  ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                  : "border-blue-400/20 bg-blue-400/10 text-blue-300"
            }`}
          >
            {isEnded ? <Clock3 size={21} /> : <Hourglass size={21} />}
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
              Academy examination countdown
            </p>

            <h3 className="mt-1 text-base font-bold text-white sm:text-lg">
              {countdown.label}
            </h3>
          </div>
        </div>

        <span
          className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider ${
            isEnded
              ? "border-rose-400/20 bg-rose-400/[0.07] text-rose-300"
              : isActive
                ? "border-emerald-400/20 bg-emerald-400/[0.07] text-emerald-300"
                : countdown.status === "upcoming"
                  ? "border-blue-400/20 bg-blue-400/[0.07] text-blue-300"
                  : "border-white/10 bg-white/[0.04] text-slate-400"
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              isEnded
                ? "bg-rose-400"
                : isActive
                  ? "bg-emerald-400"
                  : countdown.status === "upcoming"
                    ? "bg-blue-400"
                    : "bg-slate-500"
            }`}
          />

          {isEnded
            ? "Ended"
            : isActive
              ? "Schedule active"
              : countdown.status === "upcoming"
                ? "Upcoming"
                : "Not configured"}
        </span>
      </div>

      {countdown.target ? (
        <div className="mt-5 grid grid-cols-4 gap-2 sm:gap-3">
          <CountdownUnit value={days} label="Days" />
          <CountdownUnit value={hours} label="Hours" />
          <CountdownUnit value={minutes} label="Minutes" />
          <CountdownUnit value={seconds} label="Seconds" />
        </div>
      ) : (
        <div
          className={`mt-5 rounded-xl border p-5 text-center ${
            isEnded
              ? "border-rose-400/15 bg-rose-400/[0.05]"
              : "border-white/[0.07] bg-white/[0.025]"
          }`}
        >
          <p
            className={`text-sm font-semibold ${
              isEnded ? "text-rose-300" : "text-slate-300"
            }`}
          >
            {countdown.message}
          </p>
        </div>
      )}

      <p className="mt-4 text-xs leading-5 text-slate-500">
        {countdown.message}
      </p>
    </div>
  );
}

/* =========================================================
   SMALL UI COMPONENTS
========================================================= */

function StatusPill({ status }) {
  const presentation =
    statusPresentation[status] || statusPresentation.unavailable;

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${presentation.border} ${presentation.background} ${presentation.text}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${presentation.dot}`} />
      {presentation.label}
    </span>
  );
}

function InfoTile({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl border border-white/[0.07] bg-[#020b19]/70 p-4">
      <div className="mb-2 flex items-center gap-2 text-xs text-slate-400">
        <Icon size={14} />
        {label}
      </div>

      <div className="text-sm font-semibold text-slate-100">
        {value || "—"}
      </div>
    </div>
  );
}

function PrimaryButton({
  children,
  onClick,
  disabled = false,
  loading = false,
  type = "button",
  className = "",
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-950/30 transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-45 ${className}`}
    >
      {loading ? <Loader2 size={17} className="animate-spin" /> : null}
      {children}
    </button>
  );
}

function SecondaryButton({
  children,
  onClick,
  disabled = false,
  className = "",
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.045] px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-40 ${className}`}
    >
      {children}
    </button>
  );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function StudentCBT() {
  const outletContext = useOutletContext() || {};

  const [screen, setScreen] = useState("welcome");

  const [loading, setLoading] = useState(false);
  const [starting, setStarting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [student, setStudent] = useState(
    outletContext?.student || outletContext?.user || null
  );

  const [examInfo, setExamInfo] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [activeSubmittedCard, setActiveSubmittedCard] = useState(null);

  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedExam, setSelectedExam] = useState(null);

  const [questions, setQuestions] = useState([]);
  const [attempt, setAttempt] = useState(null);
  const [answers, setAnswers] = useState({});

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [markedQuestions, setMarkedQuestions] = useState([]);
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  const [mobileQuestionNav, setMobileQuestionNav] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

  const [submittedMessage, setSubmittedMessage] = useState("");
  const [submissionTimestamp, setSubmissionTimestamp] = useState(null);

  const [scheduleNow, setScheduleNow] = useState(Date.now());

  const submittingRef = useRef(false);
  const answersRef = useRef({});
  const attemptRef = useRef(null);
  const questionsRef = useRef([]);
  const deadlineRef = useRef(null);
  const saveTimerRef = useRef(null);
  const lastSavedRef = useRef("");
  const timerSubmittingRef = useRef(false);

  const token = useMemo(() => getToken(), []);

  /* =========================================================
     API REQUEST
  ========================================================= */

  const apiRequest = useCallback(
    async (path, options = {}) => {
      const currentToken = getToken() || token;

      const headers = {
        Accept: "application/json",

        ...(options.body
          ? { "Content-Type": "application/json" }
          : {}),

        ...(currentToken
          ? {
              Authorization: `Bearer ${currentToken}`,
              "x-academy-token": currentToken,
              "x-student-token": currentToken,
            }
          : {}),

        ...(options.headers || {}),
      };

      const response = await fetch(`${CBT_BASE}${path}`, {
        ...options,
        headers,
        credentials: "include",
      });

      const contentType = response.headers.get("content-type") || "";

      let payload = {};

      if (contentType.includes("application/json")) {
        payload = await response.json();
      } else {
        const raw = await response.text();
        payload = raw ? { message: raw } : {};
      }

      if (!response.ok || payload?.success === false) {
        const requestError = new Error(
          readErrorMessage(
            payload,
            `Request failed (${response.status})`
          )
        );

        requestError.status = response.status;
        requestError.code =
          payload?.code || payload?.errorCode || null;
        requestError.payload = payload;

        throw requestError;
      }

      return payload;
    },
    [token]
  );

  /* =========================================================
     MARK A SUBJECT AS SUBMITTED IMMEDIATELY
  ========================================================= */

  const markSubjectSubmitted = useCallback(
    (subjectRow, timestamp, attemptId = null) => {
      const submittedAt =
        timestamp || new Date().toISOString();

      const targetExamId = getExamId(subjectRow);
      const targetSubject = normalizeSubject(subjectRow?.subject);

      setSubjects((current) =>
        current.map((item) => {
          const sameExam =
            targetExamId &&
            getExamId(item) &&
            String(getExamId(item)) === String(targetExamId);

          const sameSubject =
            targetSubject &&
            normalizeSubject(item.subject) === targetSubject;

          if (!sameExam && !sameSubject) return item;

          return makeSubmittedSubject(
            item,
            submittedAt,
            attemptId
          );
        })
      );

      if (selectedSubject) {
        const sameSelectedExam =
          targetExamId &&
          String(getExamId(selectedSubject)) === String(targetExamId);

        const sameSelectedSubject =
          targetSubject &&
          normalizeSubject(selectedSubject.subject) === targetSubject;

        if (sameSelectedExam || sameSelectedSubject) {
          setSelectedSubject((current) =>
            current
              ? makeSubmittedSubject(
                  current,
                  submittedAt,
                  attemptId
                )
              : current
          );
        }
      }

      if (selectedExam) {
        const sameSelectedExam =
          targetExamId &&
          String(getExamId(selectedExam)) === String(targetExamId);

        if (sameSelectedExam) {
          setSelectedExam((current) =>
            current
              ? makeSubmittedSubject(
                  current,
                  submittedAt,
                  attemptId
                )
              : current
          );
        }
      }
    },
    [selectedSubject, selectedExam]
  );

  /* =========================================================
     LOAD ENROLLED SUBJECTS AND SUBMISSION STATUS
  ========================================================= */

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const payload = await apiRequest("/exams");

      const sourceStudent =
        payload?.student ||
        payload?.data?.student ||
        outletContext?.student ||
        outletContext?.user ||
        null;

      if (sourceStudent) {
        setStudent(sourceStudent);
      }

      const rawSubjectRows = getPayloadArray(
        payload,
        "subjects",
        "data.subjects"
      );

      const rawExams = getPayloadArray(
        payload,
        "exams",
        "data.exams"
      );

      const enrollmentSubjects = firstValue(
        payload?.registeredSubjects,
        payload?.enrolledSubjects,
        payload?.student?.subjects,
        sourceStudent?.subjects,
        payload?.data?.registeredSubjects,
        payload?.data?.enrolledSubjects,
        []
      );

      const enrolledNames =
        getEnrolledSubjectNames(enrollmentSubjects);

      const rowNames = rawSubjectRows
        .map((row) =>
          clean(
            firstValue(
              row?.subject,
              row?.subject_name,
              row?.name
            )
          )
        )
        .filter(Boolean);

      const names = enrolledNames.length
        ? enrolledNames
        : rowNames;

      const allNames = [
        ...new Map(
          names.map((name) => [
            normalizeSubject(name),
            name,
          ])
        ).values(),
      ];

      const mappedSubjects = allNames.map((subjectName) => {
        const existingRow =
          rawSubjectRows.find(
            (row) =>
              normalizeSubject(
                row?.subject ||
                  row?.subject_name ||
                  row?.name
              ) === normalizeSubject(subjectName)
          ) || null;

        const examInList =
          rawExams.find(
            (exam) =>
              normalizeSubject(exam?.subject) ===
              normalizeSubject(subjectName)
          ) || null;

        /*
         * Do not mistake a subject/enrollment row's own ID
         * for the actual examination ID.
         *
         * Prefer an actual nested exam object, then the
         * matching exam from the exams array.
         */
        const nestedExam =
          existingRow?.exam ||
          existingRow?.schoolExam ||
          null;

        const rowExamId = firstValue(
          existingRow?.exam_id,
          existingRow?.examId,
          existingRow?.school_exam_id,
          nestedExam?.id
        );

        const matchingExamById =
          rowExamId
            ? rawExams.find(
                (exam) =>
                  String(exam?.id) === String(rowExamId)
              )
            : null;

        const exam =
          nestedExam ||
          matchingExamById ||
          examInList ||
          null;

        /*
         * Submission metadata can be attached to either
         * the subject row or the matching exam.
         */
        const combined = {
          ...(existingRow || {}),

          subject: subjectName,
          exam: exam || null,

          examId: firstValue(
            exam?.id,
            rowExamId,
            existingRow?.exam_id,
            null
          ),

          scheduled_start_at: firstValue(
            existingRow?.scheduled_start_at,
            existingRow?.startAt,
            existingRow?.start_at,
            exam?.scheduled_start_at,
            exam?.start_at,
            exam?.startAt
          ),

          scheduled_end_at: firstValue(
            existingRow?.scheduled_end_at,
            existingRow?.endAt,
            existingRow?.end_at,
            exam?.scheduled_end_at,
            exam?.end_at,
            exam?.endAt
          ),

          duration_minutes: firstValue(
            existingRow?.duration_minutes,
            exam?.duration_minutes,
            exam?.durationMinutes
          ),

          total_questions: firstValue(
            existingRow?.total_questions,
            existingRow?.question_count,
            exam?.total_questions,
            exam?.question_count
          ),

          instructions: firstValue(
            existingRow?.instructions,
            exam?.instructions,
            ""
          ),

          title: firstValue(
            existingRow?.title,
            exam?.title,
            `${subjectName} Examination`
          ),

          /*
           * Preserve both camelCase and snake_case response
           * fields because the API may return either format.
           */
          submitted: Boolean(
            existingRow?.submitted ||
              existingRow?.isSubmitted ||
              existingRow?.is_submitted ||
              existingRow?.has_submitted ||
              exam?.submitted ||
              exam?.isSubmitted ||
              exam?.is_submitted ||
              exam?.has_submitted
          ),

          isSubmitted: Boolean(
            existingRow?.submitted ||
              existingRow?.isSubmitted ||
              existingRow?.is_submitted ||
              existingRow?.has_submitted ||
              exam?.submitted ||
              exam?.isSubmitted ||
              exam?.is_submitted ||
              exam?.has_submitted
          ),

          submittedAt: firstValue(
            existingRow?.submittedAt,
            existingRow?.submitted_at,
            existingRow?.latest_attempt?.submitted_at,
            existingRow?.latestAttempt?.submitted_at,
            existingRow?.attempt?.submitted_at,
            exam?.submittedAt,
            exam?.submitted_at,
            exam?.latest_attempt?.submitted_at,
            exam?.latestAttempt?.submitted_at,
            exam?.attempt?.submitted_at,
            null
          ),

          submitted_at: firstValue(
            existingRow?.submitted_at,
            existingRow?.submittedAt,
            existingRow?.latest_attempt?.submitted_at,
            existingRow?.latestAttempt?.submitted_at,
            exam?.submitted_at,
            exam?.submittedAt,
            exam?.latest_attempt?.submitted_at,
            exam?.latestAttempt?.submitted_at,
            null
          ),

          attemptId: firstValue(
            existingRow?.attemptId,
            existingRow?.attempt_id,
            existingRow?.submitted_attempt_id,
            existingRow?.latest_attempt?.id,
            existingRow?.latestAttempt?.id,
            existingRow?.attempt?.id,
            exam?.attemptId,
            exam?.attempt_id,
            exam?.submitted_attempt_id,
            exam?.latest_attempt?.id,
            exam?.latestAttempt?.id,
            exam?.attempt?.id,
            null
          ),

          attemptStatus: firstValue(
            existingRow?.attemptStatus,
            existingRow?.attempt_status,
            existingRow?.latest_attempt?.status,
            existingRow?.latestAttempt?.status,
            existingRow?.attempt?.status,
            exam?.attemptStatus,
            exam?.attempt_status,
            exam?.latest_attempt?.status,
            exam?.latestAttempt?.status,
            exam?.attempt?.status,
            null
          ),

          attempt_status: firstValue(
            existingRow?.attempt_status,
            existingRow?.attemptStatus,
            existingRow?.latest_attempt?.status,
            existingRow?.latestAttempt?.status,
            existingRow?.attempt?.status,
            exam?.attempt_status,
            exam?.attemptStatus,
            exam?.latest_attempt?.status,
            exam?.latestAttempt?.status,
            exam?.attempt?.status,
            null
          ),

          latest_attempt: firstValue(
            existingRow?.latest_attempt,
            existingRow?.latestAttempt,
            exam?.latest_attempt,
            exam?.latestAttempt,
            null
          ),

          latestAttempt: firstValue(
            existingRow?.latestAttempt,
            existingRow?.latest_attempt,
            exam?.latestAttempt,
            exam?.latest_attempt,
            null
          ),

          attempts: firstValue(
            existingRow?.attempts,
            exam?.attempts,
            []
          ),
        };

        const submitted =
          isExamSubmitted(combined) ||
          isExamSubmitted(exam);

        const submittedAt = firstValue(
          getSubmissionTimestamp(combined),
          getSubmissionTimestamp(exam),
          null
        );

        const finalSubject = submitted
          ? makeSubmittedSubject(
              combined,
              submittedAt,
              combined.attemptId
            )
          : {
              ...combined,
              submitted: false,
              isSubmitted: false,
            };

        const scheduleStatus = getScheduleStatus(
          finalSubject,
          Date.now()
        );

        return {
          ...finalSubject,
          status: scheduleStatus,
        };
      });

      setSubjects(mappedSubjects);

      setExamInfo(
        payload?.examInfo ||
          payload?.examination ||
          payload?.details ||
          payload?.data?.examInfo ||
          null
      );

      if (!mappedSubjects.length) {
        setNotice(
          "No registered subjects were returned for this student. Please contact the Academy administrator."
        );
      } else {
        setNotice("");
      }
    } catch (requestError) {
      setError(
        requestError.message ||
          "Unable to load your examination subjects."
      );
    } finally {
      setLoading(false);
    }
  }, [apiRequest, outletContext]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  /* =========================================================
     LIVE ACADEMY-WIDE COUNTDOWN
  ========================================================= */

  useEffect(() => {
    if (screen !== "subjects") return undefined;

    const interval = window.setInterval(() => {
      setScheduleNow(Date.now());
    }, 1000);

    return () => window.clearInterval(interval);
  }, [screen]);

  /* =========================================================
     REFRESH ADMIN SCHEDULE
  ========================================================= */

  useEffect(() => {
    if (screen !== "subjects") return undefined;

    let active = true;

    const refreshGlobalSchedule = async () => {
      try {
        const payload = await apiRequest("/exams");

        if (!active) return;

        const latestSchedule =
          payload?.examInfo ||
          payload?.examination ||
          payload?.details ||
          payload?.data?.examInfo ||
          null;

        if (latestSchedule) {
          setExamInfo(latestSchedule);
        }

        setScheduleNow(Date.now());
      } catch (refreshError) {
        console.warn(
          "Unable to refresh Academy examination schedule:",
          refreshError.message
        );
      }
    };

    const interval = window.setInterval(
      refreshGlobalSchedule,
      30000
    );

    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [screen, apiRequest]);

  /* =========================================================
     REFRESH SUBJECT SCHEDULE STATUS
  ========================================================= */

  useEffect(() => {
    if (screen !== "subjects") return undefined;

    const interval = window.setInterval(() => {
      setSubjects((current) =>
        current.map((item) => ({
          ...item,
          status: isExamSubmitted(item)
            ? "submitted"
            : getScheduleStatus(item, Date.now()),
        }))
      );
    }, 15000);

    return () => window.clearInterval(interval);
  }, [screen]);

  /* =========================================================
     OPEN ONE SUBJECT
  ========================================================= */

  const openSubject = useCallback(
    async (subjectRow) => {
      setError("");
      setNotice("");

      if (isExamSubmitted(subjectRow)) {
        setActiveSubmittedCard(
          `${normalizeSubject(subjectRow.subject)}-${getExamId(subjectRow) || "none"}`
        );
        return;
      }

      const status = getScheduleStatus(
        subjectRow,
        Date.now()
      );

      if (status !== "available") {
        setError(
          status === "upcoming"
            ? "This subject's examination has not started yet."
            : status === "closed"
              ? "The scheduled time for this examination has ended."
              : "An examination has not been scheduled for this subject yet."
        );

        return;
      }

      const examId = getExamId(subjectRow);

      if (!examId) {
        setError(
          "The examination for this subject could not be found."
        );
        return;
      }

      setLoading(true);

      try {
        const payload = await apiRequest(
          `/exams/${encodeURIComponent(examId)}`
        );

        const exam =
          payload?.exam ||
          payload?.data?.exam ||
          payload?.data ||
          getExamFromSubject(subjectRow);

        if (isExamSubmitted(exam)) {
          const submittedAt =
            getSubmissionTimestamp(exam) ||
            new Date().toISOString();

          markSubjectSubmitted(
            subjectRow,
            submittedAt,
            exam?.attemptId ||
              exam?.attempt_id ||
              exam?.latest_attempt?.id
          );

          setActiveSubmittedCard(
            `${normalizeSubject(subjectRow.subject)}-${examId}`
          );

          return;
        }

        setSelectedSubject(subjectRow);

        setSelectedExam({
          ...exam,

          id: firstValue(exam?.id, examId),

          subject: firstValue(
            exam?.subject,
            subjectRow.subject
          ),

          duration_minutes: firstValue(
            exam?.duration_minutes,
            exam?.durationMinutes,
            subjectRow.duration_minutes
          ),

          scheduled_start_at: firstValue(
            exam?.scheduled_start_at,
            exam?.start_at,
            subjectRow.scheduled_start_at
          ),

          scheduled_end_at: firstValue(
            exam?.scheduled_end_at,
            exam?.end_at,
            subjectRow.scheduled_end_at
          ),

          instructions: firstValue(
            exam?.instructions,
            subjectRow.instructions,
            ""
          ),

          title: firstValue(
            exam?.title,
            subjectRow.title,
            `${subjectRow.subject} Examination`
          ),

          total_questions: firstValue(
            exam?.total_questions,
            exam?.question_count,
            subjectRow.total_questions
          ),
        });

        setScreen("subject-details");
      } catch (requestError) {
        if (isAlreadySubmittedError(requestError)) {
          const submittedAt =
            getSubmissionTimestamp(requestError.payload) ||
            new Date().toISOString();

          markSubjectSubmitted(subjectRow, submittedAt);

          setActiveSubmittedCard(
            `${normalizeSubject(subjectRow.subject)}-${examId}`
          );

          setError("");
        } else {
          setError(
            requestError.message ||
              "Unable to open this examination."
          );
        }
      } finally {
        setLoading(false);
      }
    },
    [apiRequest, markSubjectSubmitted]
  );

  /* =========================================================
     START EXAMINATION
  ========================================================= */

  const startExam = useCallback(async () => {
    if (!selectedExam?.id || !selectedSubject) return;

    if (
      isExamSubmitted(selectedSubject) ||
      isExamSubmitted(selectedExam)
    ) {
      setScreen("subjects");
      setError("");
      await loadDashboard();
      return;
    }

    const latestStatus = getScheduleStatus(
      selectedSubject,
      Date.now()
    );

    if (latestStatus !== "available") {
      setError("This examination is not currently available.");
      setScreen("subjects");
      await loadDashboard();
      return;
    }

    setStarting(true);
    setError("");

    submittingRef.current = false;
    timerSubmittingRef.current = false;

    try {
      const payload = await apiRequest(
        `/exams/${encodeURIComponent(selectedExam.id)}/start`,
        {
          method: "POST",
          body: JSON.stringify({}),
        }
      );

      const newAttempt = readAttempt(payload);
      const questionList = readQuestionList(payload);

      if (!newAttempt?.id && !newAttempt?.attempt_id) {
        throw new Error(
          "The server did not return an examination attempt."
        );
      }

      if (!questionList.length) {
        throw new Error(
          "No questions have been uploaded for this subject yet."
        );
      }

      const attemptId = firstValue(
        newAttempt.id,
        newAttempt.attempt_id
      );

      const normalizedAttempt = {
        ...newAttempt,
        id: attemptId,
      };

      setAttempt(normalizedAttempt);
      attemptRef.current = normalizedAttempt;

      setQuestions(questionList);
      questionsRef.current = questionList;

      const initialAnswers =
        newAttempt?.answers &&
        typeof newAttempt.answers === "object"
          ? newAttempt.answers
          : payload?.answers &&
              typeof payload.answers === "object"
            ? payload.answers
            : {};

      setAnswers(initialAnswers);
      answersRef.current = initialAnswers;

      lastSavedRef.current = JSON.stringify(initialAnswers);

      setCurrentQuestionIndex(0);
      setMarkedQuestions([]);

      const serverRemaining = Number(
        firstValue(
          payload?.remaining_seconds,
          payload?.remainingSeconds,
          newAttempt?.remaining_seconds,
          newAttempt?.remainingSeconds
        )
      );

      const expiry = firstValue(
        newAttempt?.expires_at,
        newAttempt?.expiresAt,
        payload?.expires_at,
        payload?.expiresAt
      );

      let deadline = null;

      if (expiry) {
        const parsed = new Date(expiry).getTime();

        if (Number.isFinite(parsed)) {
          deadline = parsed;
        }
      }

      if (
        !deadline &&
        Number.isFinite(serverRemaining) &&
        serverRemaining > 0
      ) {
        deadline = Date.now() + serverRemaining * 1000;
      }

      if (!deadline) {
        const duration = Number(
          firstValue(
            newAttempt?.duration_minutes,
            selectedExam?.duration_minutes,
            selectedExam?.durationMinutes,
            60
          )
        );

        deadline =
          Date.now() + Math.max(1, duration) * 60 * 1000;
      }

      deadlineRef.current = deadline;

      setRemainingSeconds(
        Math.max(
          0,
          Math.floor((deadline - Date.now()) / 1000)
        )
      );

      setMobileQuestionNav(false);
      setShowSubmitConfirm(false);
      setScreen("exam");
    } catch (requestError) {
      if (isAlreadySubmittedError(requestError)) {
        const submittedAt =
          getSubmissionTimestamp(requestError.payload) ||
          new Date().toISOString();

        markSubjectSubmitted(
          selectedSubject,
          submittedAt,
          requestError?.payload?.attempt?.id ||
            requestError?.payload?.attempt_id
        );

        setScreen("subjects");
        setSelectedExam(null);
        setSelectedSubject(null);
        setError("");

        await loadDashboard();

        /*
         * Re-apply the local submitted state after refresh
         * in case the dashboard response is briefly stale.
         */
        markSubjectSubmitted(selectedSubject, submittedAt);
      } else {
        setError(
          requestError.message ||
            "Unable to start this examination."
        );
      }
    } finally {
      setStarting(false);
    }
  }, [
    apiRequest,
    loadDashboard,
    markSubjectSubmitted,
    selectedExam,
    selectedSubject,
  ]);

  /* =========================================================
     SAVE ANSWERS
  ========================================================= */

  const saveAnswers = useCallback(
    async (answersToSave = answersRef.current, quiet = false) => {
      const currentAttempt = attemptRef.current;

      if (!currentAttempt?.id || !questionsRef.current.length) {
        return;
      }

      const serialized = JSON.stringify(answersToSave || {});

      if (serialized === lastSavedRef.current) {
        return;
      }

      if (!quiet) setSaving(true);

      try {
        await apiRequest(
          `/attempts/${encodeURIComponent(currentAttempt.id)}/answers`,
          {
            method: "PUT",
            body: JSON.stringify({
              answers: answersToSave || {},
            }),
          }
        );

        lastSavedRef.current = serialized;
      } catch (requestError) {
        if (!quiet) {
          setError(
            requestError.message ||
              "Unable to save your answers."
          );
        }
      } finally {
        if (!quiet) setSaving(false);
      }
    },
    [apiRequest]
  );

  const updateAnswer = useCallback(
    (questionId, answer) => {
      const next = {
        ...answersRef.current,
        [questionId]: answer,
      };

      answersRef.current = next;
      setAnswers(next);

      if (saveTimerRef.current) {
        window.clearTimeout(saveTimerRef.current);
      }

      saveTimerRef.current = window.setTimeout(() => {
        saveAnswers(next, true);
      }, 650);
    },
    [saveAnswers]
  );

  /* =========================================================
     SUBMIT EXAMINATION
  ========================================================= */

  const submitExam = useCallback(
    async (automatic = false) => {
      const currentAttempt = attemptRef.current;

      if (!currentAttempt?.id || submittingRef.current) {
        return;
      }

      submittingRef.current = true;
      setSubmitting(true);
      setShowSubmitConfirm(false);
      setError("");

      if (saveTimerRef.current) {
        window.clearTimeout(saveTimerRef.current);
        saveTimerRef.current = null;
      }

      try {
        const serialized = JSON.stringify(
          answersRef.current || {}
        );

        if (serialized !== lastSavedRef.current) {
          await apiRequest(
            `/attempts/${encodeURIComponent(currentAttempt.id)}/answers`,
            {
              method: "PUT",
              body: JSON.stringify({
                answers: answersRef.current || {},
              }),
            }
          );

          lastSavedRef.current = serialized;
        }

        const submissionPayload = await apiRequest(
          `/attempts/${encodeURIComponent(currentAttempt.id)}/submit`,
          {
            method: "POST",
            body: JSON.stringify({
              answers: answersRef.current || {},
              automatic,
            }),
          }
        );

        const submissionResult =
          submissionPayload?.result ||
          submissionPayload?.data?.result ||
          submissionPayload?.data ||
          submissionPayload;

        const submittedAt = firstValue(
          submissionResult?.submittedAt,
          submissionResult?.submitted_at,
          submissionPayload?.submittedAt,
          submissionPayload?.submitted_at,
          submissionResult?.attempt?.submitted_at,
          new Date().toISOString()
        );

        const submittedAttemptId = firstValue(
          submissionResult?.attempt?.id,
          submissionResult?.attempt_id,
          submissionPayload?.attempt?.id,
          currentAttempt.id
        );

        setSubmissionTimestamp(submittedAt);

        setSubmittedMessage(
          automatic
            ? "Your examination time has ended. Your answers have been submitted."
            : "Your examination has been submitted successfully."
        );

        markSubjectSubmitted(
          selectedSubject || selectedExam,
          submittedAt,
          submittedAttemptId
        );

        setScreen("submitted");

        setAttempt(null);
        attemptRef.current = null;
        deadlineRef.current = null;
      } catch (requestError) {
        submittingRef.current = false;

        setError(
          requestError.message ||
            "Your examination could not be submitted. Please try again."
        );
      } finally {
        setSubmitting(false);
      }
    },
    [
      apiRequest,
      markSubjectSubmitted,
      selectedExam,
      selectedSubject,
    ]
  );

  /* =========================================================
     INDIVIDUAL EXAMINATION COUNTDOWN
  ========================================================= */

  useEffect(() => {
    if (screen !== "exam" || !deadlineRef.current) {
      return undefined;
    }

    const tick = () => {
      const seconds = Math.max(
        0,
        Math.floor(
          (deadlineRef.current - Date.now()) / 1000
        )
      );

      setRemainingSeconds(seconds);

      if (
        seconds <= 0 &&
        !timerSubmittingRef.current &&
        !submittingRef.current
      ) {
        timerSubmittingRef.current = true;
        submitExam(true);
      }
    };

    tick();

    const interval = window.setInterval(tick, 1000);

    return () => window.clearInterval(interval);
  }, [screen, submitExam]);

  /* =========================================================
     CLEANUP
  ========================================================= */

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        window.clearTimeout(saveTimerRef.current);
      }
    };
  }, []);

  /* =========================================================
     RETURN TO SUBJECTS
  ========================================================= */

  const returnToSubjects = useCallback(async () => {
    setScreen("subjects");

    setSelectedSubject(null);
    setSelectedExam(null);
    setQuestions([]);
    setAnswers({});

    answersRef.current = {};
    questionsRef.current = [];

    setAttempt(null);
    attemptRef.current = null;

    setCurrentQuestionIndex(0);
    setMarkedQuestions([]);
    setRemainingSeconds(0);

    setMobileQuestionNav(false);
    setShowSubmitConfirm(false);

    setError("");
    setNotice("");

    submittingRef.current = false;
    timerSubmittingRef.current = false;
    deadlineRef.current = null;

    await loadDashboard();
  }, [loadDashboard]);

  /* =========================================================
     QUESTION STATE
  ========================================================= */

  const currentQuestion =
    questions[currentQuestionIndex] || null;

  const currentQuestionId = currentQuestion
    ? getQuestionId(currentQuestion, currentQuestionIndex)
    : "";

  const currentOptions = useMemo(() => {
    if (!currentQuestion) return [];

    const raw = firstValue(
      currentQuestion?.options,
      currentQuestion?.answers,
      currentQuestion?.choices,
      []
    );

    let options = raw;

    if (typeof raw === "string") {
      try {
        options = JSON.parse(raw);
      } catch {
        options = [];
      }
    }

    if (!Array.isArray(options)) {
      if (options && typeof options === "object") {
        options = Object.entries(options).map(([label, text]) => ({
          label,
          text,
        }));
      } else {
        options = [];
      }
    }

    return options.map((option, index) => {
      if (typeof option === "string") {
        return {
          label: String.fromCharCode(65 + index),
          text: option,
          value: option,
        };
      }

      const fallbackLetter = String.fromCharCode(65 + index);

      const label = clean(
        firstValue(
          option?.key,
          option?.option_key,
          option?.letter,
          option?.option_label,
          typeof option?.label === "string" &&
            option.label.length <= 3
            ? option.label
            : null,
          typeof option?.value === "string" &&
            option.value.length <= 3
            ? option.value
            : null,
          fallbackLetter
        )
      );

      const text = clean(
        firstValue(
          option?.text,
          option?.content,
          option?.answer,
          option?.option_text,
          typeof option?.label === "string" &&
            option.label.length > 3
            ? option.label
            : null,
          typeof option?.value === "string" &&
            option.value.length > 3
            ? option.value
            : null,
          ""
        )
      );

      return {
        ...option,
        label,
        text,
        value: clean(
          firstValue(
            option?.key,
            option?.option_key,
            option?.letter,
            option?.option_label,
            typeof option?.value === "string" &&
              option.value.length <= 3
              ? option.value
              : null,
            label
          )
        ),
      };
    });
  }, [currentQuestion]);

  const currentAnswer = currentQuestionId
    ? answers[currentQuestionId]
    : undefined;

  const answeredCount = useMemo(
    () =>
      questions.filter((question, index) => {
        const value = answers[getQuestionId(question, index)];

        return (
          value !== undefined &&
          value !== null &&
          clean(value) !== ""
        );
      }).length,
    [answers, questions]
  );

  const unansweredCount = Math.max(
    0,
    questions.length - answeredCount
  );

  /* =========================================================
     ANSWER SELECTION
  ========================================================= */

  const selectAnswer = useCallback(
    (option) => {
      if (!currentQuestionId) return;

      const selectedValue =
        option !== null && typeof option === "object"
          ? firstValue(
              option.value,
              option.text,
              option.label,
              option.content,
              option.id
            )
          : option;

      const answer = clean(selectedValue);

      if (!answer) return;

      updateAnswer(currentQuestionId, answer);
    },
    [currentQuestionId, updateAnswer]
  );

  const toggleMarked = useCallback((questionId) => {
    setMarkedQuestions((current) =>
      current.includes(questionId)
        ? current.filter((id) => id !== questionId)
        : [...current, questionId]
    );
  }, []);

  const goToQuestion = useCallback(
    (index) => {
      if (index < 0 || index >= questions.length) return;

      setCurrentQuestionIndex(index);
      setMobileQuestionNav(false);
    },
    [questions.length]
  );

  /* =========================================================
     SUBJECT COUNTS
  ========================================================= */

  const submittedSubjects = useMemo(
    () => subjects.filter(isExamSubmitted),
    [subjects]
  );

  const activeSubjects = useMemo(
    () => subjects.filter((item) => !isExamSubmitted(item)),
    [subjects]
  );

  const subjectCounts = useMemo(
    () => ({
      available: activeSubjects.filter(
        (item) =>
          getScheduleStatus(item, scheduleNow) === "available"
      ).length,

      upcoming: activeSubjects.filter(
        (item) =>
          getScheduleStatus(item, scheduleNow) === "upcoming"
      ).length,

      closed: activeSubjects.filter(
        (item) =>
          getScheduleStatus(item, scheduleNow) === "closed"
      ).length,

      submitted: submittedSubjects.length,
    }),
    [activeSubjects, submittedSubjects, scheduleNow]
  );

  const studentName = clean(
    firstValue(
      student?.full_name,
      student?.name,
      [
        student?.first_name,
        student?.middle_name,
        student?.last_name,
      ]
        .filter(Boolean)
        .join(" "),
      "Student"
    )
  );

  /* =========================================================
     SCREEN 1: WELCOME
  ========================================================= */

  const renderWelcome = () => (
    <main className="mx-auto flex min-h-[calc(100vh-90px)] w-full max-w-7xl items-center px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid w-full items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/[0.07] px-4 py-2 text-xs font-semibold text-blue-200">
            <ShieldCheck size={14} />
            Secure Academy Examination
          </div>

          <p className="mb-3 text-sm font-bold uppercase tracking-[0.22em] text-blue-300">
            Welcome to
          </p>

          <h1 className="max-w-2xl text-4xl font-black leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl">
            Scholiqen CBT
            <span className="mt-2 block text-blue-400">
              Academy Session Examination
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-base leading-8 text-slate-400">
            Your examination portal is ready. Review the
            examination details and instructions before
            proceeding to the subjects registered under your
            Academy enrollment.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <PrimaryButton onClick={() => setScreen("details")}>
              Proceed to Examination Details
              <ArrowRight size={17} />
            </PrimaryButton>

            <span className="text-xs text-slate-500">
              Please read the instructions carefully.
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="relative"
        >
          <div className="absolute -inset-5 rounded-[2rem] bg-blue-500/[0.06] blur-3xl" />

          <div className={`${DARK_PANEL} relative overflow-hidden p-6 sm:p-8`}>
            <div className="absolute right-0 top-0 h-44 w-44 rounded-full bg-blue-500/[0.08] blur-3xl" />

            <div className="relative flex min-h-[330px] flex-col justify-between">
              <div>
                <div className="mb-7 flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-300/20 bg-blue-500/10 text-blue-300">
                  <GraduationCap size={34} />
                </div>

                <h2 className="text-2xl font-bold text-white">
                  Your examination journey
                </h2>

                <p className="mt-2 max-w-sm text-sm leading-6 text-slate-400">
                  Follow the steps in order. Each subject
                  examination is independent and follows its
                  own approved schedule.
                </p>
              </div>

              <div className="mt-8 space-y-4">
                {[
                  ["01", "Welcome and examination details"],
                  ["02", "Review your registered subjects"],
                  ["03", "Take each available subject examination"],
                  ["04", "Submit your answers"],
                ].map(([number, label]) => (
                  <div key={number} className="flex items-center gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-blue-400/20 bg-blue-400/[0.07] text-xs font-bold text-blue-300">
                      {number}
                    </span>

                    <span className="text-sm font-medium text-slate-300">
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );

  /* =========================================================
     SCREEN 3: REGISTERED SUBJECTS
  ========================================================= */

  const renderSubjects = () => (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-300">
            Student examination portal
          </p>

          <h1 className="mt-2 text-3xl font-black text-white sm:text-4xl">
            Your Registered Subjects
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">
            All subjects in your Academy enrollment are listed
            below. Each subject has its own questions, schedule
            and examination duration.
          </p>
        </div>

        <SecondaryButton onClick={loadDashboard} disabled={loading}>
          <RefreshCw
            size={15}
            className={loading ? "animate-spin" : ""}
          />
          Refresh
        </SecondaryButton>
      </div>

      {(() => {
        const generalStart = firstValue(
          examInfo?.scheduled_start_at,
          examInfo?.start_at,
          examInfo?.startAt,
          examInfo?.exam_start_at,
          examInfo?.schedule_start_at
        );

        const generalEnd = firstValue(
          examInfo?.scheduled_end_at,
          examInfo?.end_at,
          examInfo?.endAt,
          examInfo?.exam_end_at,
          examInfo?.schedule_end_at
        );

        const generalTitle = firstValue(
          examInfo?.title,
          examInfo?.exam_title,
          "General Examination Schedule"
        );

        return (
          <section className={`${DARK_PANEL} mb-6 p-5 sm:p-6`}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-300">
                  Academy-wide schedule
                </p>

                <h2 className="mt-2 text-lg font-bold text-white">
                  {generalTitle}
                </h2>

                <p className="mt-1 text-xs leading-5 text-slate-400">
                  General examination dates and times configured by the administrator.
                </p>
              </div>
            </div>

            <AcademyScheduleCountdown
              startAt={generalStart}
              endAt={generalEnd}
              now={scheduleNow}
            />

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <InfoTile
                icon={CalendarDays}
                label="General start"
                value={formatDateTime(generalStart)}
              />

              <InfoTile
                icon={Clock3}
                label="General end"
                value={formatDateTime(generalEnd)}
              />
            </div>
          </section>
        );
      })()}

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className={`${DARK_PANEL} p-4`}>
          <p className="text-xs text-slate-400">Available now</p>
          <p className="mt-1 text-2xl font-black text-emerald-300">
            {subjectCounts.available}
          </p>
        </div>

        <div className={`${DARK_PANEL} p-4`}>
          <p className="text-xs text-slate-400">Upcoming</p>
          <p className="mt-1 text-2xl font-black text-amber-300">
            {subjectCounts.upcoming}
          </p>
        </div>

        <div className={`${DARK_PANEL} p-4`}>
          <p className="text-xs text-slate-400">Closed</p>
          <p className="mt-1 text-2xl font-black text-rose-300">
            {subjectCounts.closed}
          </p>
        </div>

        <div className={`${DARK_PANEL} p-4`}>
          <p className="text-xs text-slate-400">Submitted</p>
          <p className="mt-1 text-2xl font-black text-emerald-300">
            {subjectCounts.submitted}
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-5 flex items-start gap-3 rounded-xl border border-rose-400/20 bg-rose-400/[0.07] p-4 text-sm text-rose-200">
          <Info size={17} className="mt-0.5 shrink-0" />
          <span>{error}</span>

          <button
            type="button"
            onClick={() => setError("")}
            className="ml-auto text-rose-200/70 hover:text-white"
            aria-label="Dismiss error"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {notice && (
        <div className="mb-5 rounded-xl border border-amber-400/20 bg-amber-400/[0.06] p-4 text-sm text-amber-100">
          {notice}
        </div>
      )}

      {loading && !subjects.length ? (
        <div className={`${DARK_PANEL} flex min-h-56 items-center justify-center gap-3 text-sm text-slate-400`}>
          <Loader2 className="animate-spin text-blue-300" size={20} />
          Loading your registered subjects...
        </div>
      ) : subjects.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {subjects.map((item, index) => {
            const submitted = isExamSubmitted(item);

            const status = submitted
              ? "submitted"
              : getScheduleStatus(item, scheduleNow);

            const exam = getExamFromSubject(item);

            const presentation =
              statusPresentation[status] ||
              statusPresentation.unavailable;

            const canOpen =
              !submitted &&
              status === "available" &&
              Boolean(getExamId(item));

            const cardKey = `${normalizeSubject(item.subject)}-${getExamId(item) || "none"}`;

            const submittedLabelVisible =
              submitted && activeSubmittedCard === cardKey;

            const revealSubmitted = () => {
              if (submitted) {
                setActiveSubmittedCard(cardKey);
              }
            };

            return (
              <motion.article
                key={cardKey}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: Math.min(index * 0.035, 0.2),
                }}
                role={submitted ? "button" : undefined}
                tabIndex={submitted ? 0 : undefined}
                aria-label={
                  submitted
                    ? `${item.subject} — Submitted`
                    : undefined
                }
                onClick={revealSubmitted}
                onKeyDown={(event) => {
                  if (
                    submitted &&
                    (event.key === "Enter" || event.key === " ")
                  ) {
                    event.preventDefault();
                    revealSubmitted();
                  }
                }}
                className={`${DARK_PANEL} group relative flex min-h-[270px] flex-col overflow-hidden p-5 transition hover:border-white/[0.14] focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60 ${
                  submitted
                    ? "cursor-pointer border-emerald-400/15"
                    : ""
                }`}
              >
                <div
                  className={`flex min-h-full flex-1 flex-col ${
                    submitted
                      ? "opacity-40 grayscale transition-all duration-200 group-hover:opacity-55 group-hover:grayscale-0"
                      : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-xl border ${
                        submitted
                          ? "border-emerald-400/20 bg-emerald-400/[0.08] text-emerald-300"
                          : "border-blue-400/15 bg-blue-500/[0.08] text-blue-300"
                      }`}
                    >
                      {submitted ? (
                        <CheckCircle2 size={21} />
                      ) : (
                        <BookOpen size={21} />
                      )}
                    </div>

                    {!submitted && <StatusPill status={status} />}
                  </div>

                  <div className="mt-5">
                    <h2 className="text-lg font-bold text-white">
                      {item.subject}
                    </h2>

                    <p className="mt-1 text-xs text-slate-500">
                      {clean(
                        firstValue(
                          item.title,
                          exam?.title,
                          `${item.subject} Examination`
                        )
                      )}
                    </p>
                  </div>

                  <div className="mt-5 space-y-3">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <CalendarDays size={14} className="text-slate-500" />
                      <span>
                        Starts: {formatDateTime(item.scheduled_start_at)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <CalendarDays size={14} className="text-slate-500" />
                      <span>
                        Ends: {formatDateTime(item.scheduled_end_at)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Clock3 size={14} className="text-slate-500" />
                      <span>
                        Duration:{" "}
                        {item.duration_minutes
                          ? `${item.duration_minutes} minutes`
                          : "Set by administrator"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <FileText size={14} className="text-slate-500" />
                      <span>
                        {item.total_questions
                          ? `${item.total_questions} questions`
                          : "Questions set by administrator"}
                      </span>
                    </div>
                  </div>

                  {!submitted && (
                    <div className="mt-auto pt-6">
                      {canOpen ? (
                        <PrimaryButton
                          className="w-full"
                          onClick={(event) => {
                            event.stopPropagation();
                            openSubject(item);
                          }}
                          loading={
                            loading &&
                            selectedSubject?.subject === item.subject
                          }
                        >
                          View Examination
                          <ArrowRight size={16} />
                        </PrimaryButton>
                      ) : (
                        <button
                          type="button"
                          disabled
                          className={`flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold ${presentation.border} ${presentation.background} ${presentation.text} opacity-80`}
                        >
                          {status === "upcoming" ? (
                            <LockKeyhole size={15} />
                          ) : status === "closed" ? (
                            <Clock3 size={15} />
                          ) : (
                            <CalendarDays size={15} />
                          )}

                          {status === "upcoming"
                            ? "Not Yet Available"
                            : status === "closed"
                              ? "Examination Closed"
                              : "Not Scheduled"}
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {submitted && (
                  <div
                    className={`pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-[#020617]/55 backdrop-blur-[2px] transition-opacity duration-200 ${
                      submittedLabelVisible
                        ? "opacity-100"
                        : "opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100"
                    }`}
                  >
                    <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-5 py-2.5 text-sm font-black tracking-wide text-emerald-300 shadow-xl shadow-black/30">
                      <CheckCircle2 size={17} />
                      Submitted
                    </span>
                  </div>
                )}
              </motion.article>
            );
          })}
        </div>
      ) : (
        <div className={`${DARK_PANEL} flex min-h-64 flex-col items-center justify-center px-6 text-center`}>
          <BookOpen size={34} className="text-slate-500" />

          <h2 className="mt-4 text-lg font-bold text-white">
            No registered subjects found
          </h2>

          <p className="mt-2 max-w-md text-sm leading-6 text-slate-400">
            Your enrolled subjects could not be loaded. Please
            contact the Academy administrator to confirm your
            enrollment.
          </p>
        </div>
      )}
    </main>
  );

  /* =========================================================
     SUBJECT EXAMINATION DETAILS
  ========================================================= */

  const renderSubjectDetails = () => {
    const alreadySubmitted =
      isExamSubmitted(selectedSubject) ||
      isExamSubmitted(selectedExam);

    const status = alreadySubmitted
      ? "submitted"
      : getScheduleStatus(selectedSubject || {}, Date.now());

    const canStart = status === "available" && !alreadySubmitted;

    return (
      <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-7">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-300">
            Subject examination
          </p>

          <h1 className="mt-2 text-3xl font-black text-white">
            {selectedExam?.subject || selectedSubject?.subject}
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Review the details for this subject before starting.
          </p>
        </div>

        <section className={`${DARK_PANEL} p-5 sm:p-7`}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-white">
                {selectedExam?.title ||
                  `${selectedSubject?.subject} Examination`}
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                {selectedExam?.class_name ||
                  selectedSubject?.class_name ||
                  "Academy Examination"}
              </p>
            </div>

            <StatusPill status={status} />
          </div>

          {alreadySubmitted && (
            <div className="mt-5 rounded-xl border border-emerald-400/20 bg-emerald-400/[0.06] p-4">
              <div className="flex items-center gap-2 font-bold text-emerald-300">
                <CheckCircle2 size={17} />
                This examination has already been submitted.
              </div>

              <p className="mt-2 text-sm text-slate-300">
                Submission time:{" "}
                {formatDateTime(
                  getSubmissionTimestamp(selectedSubject) ||
                    getSubmissionTimestamp(selectedExam)
                )}
              </p>
            </div>
          )}

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <InfoTile
              icon={CalendarDays}
              label="Scheduled start"
              value={formatDateTime(
                selectedExam?.scheduled_start_at
              )}
            />

            <InfoTile
              icon={CalendarDays}
              label="Scheduled end"
              value={formatDateTime(
                selectedExam?.scheduled_end_at
              )}
            />

            <InfoTile
              icon={Clock3}
              label="Examination duration"
              value={
                selectedExam?.duration_minutes
                  ? `${selectedExam.duration_minutes} minutes`
                  : "Set by administrator"
              }
            />

            <InfoTile
              icon={FileText}
              label="Total questions"
              value={
                selectedExam?.total_questions ||
                "As uploaded by administrator"
              }
            />
          </div>

          <div className="mt-7 rounded-xl border border-white/[0.07] bg-[#020b19]/70 p-5">
            <h3 className="text-sm font-bold text-white">
              Instructions
            </h3>

            <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-300">
              {clean(
                firstValue(
                  selectedExam?.instructions,
                  "Read each question carefully. Select the option that best answers the question. Your answers are saved automatically. You may move between questions before submitting."
                )
              )}
            </p>
          </div>

          <div className="mt-7 flex flex-col-reverse justify-between gap-3 border-t border-white/[0.07] pt-6 sm:flex-row sm:items-center">
            <SecondaryButton
              onClick={() => {
                setError("");
                setScreen("subjects");
              }}
            >
              Back to Subjects
            </SecondaryButton>

            <PrimaryButton
              onClick={startExam}
              loading={starting}
              disabled={!canStart}
            >
              {alreadySubmitted
                ? "Already Submitted"
                : canStart
                  ? "Start This Examination"
                  : "Examination Not Available"}

              <ArrowRight size={17} />
            </PrimaryButton>
          </div>
        </section>
      </main>
    );
  };

  /* =========================================================
     SUBMISSION CONFIRMATION
  ========================================================= */

  const renderSubmitted = () => (
    <main className="mx-auto flex min-h-[calc(100vh-90px)] w-full max-w-3xl items-center px-4 py-12 sm:px-6">
      <motion.section
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${DARK_PANEL} w-full px-6 py-10 text-center sm:px-10`}
      >
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-emerald-400/20 bg-emerald-400/10 text-emerald-300">
          <CheckCircle2 size={42} />
        </div>

        <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">
          Submission complete
        </p>

        <h1 className="mt-3 text-3xl font-black text-white">
          Examination Submitted
        </h1>

        <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-slate-400">
          {submittedMessage ||
            "Your answers have been submitted successfully."}
        </p>

        {submissionTimestamp && (
          <div className="mx-auto mt-6 max-w-md rounded-xl border border-emerald-400/15 bg-emerald-400/[0.045] p-4 text-left">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-300">
              <CalendarDays size={15} />
              Submission date and time
            </div>

            <p className="mt-2 text-base font-bold text-white">
              {formatDateTime(submissionTimestamp)}
            </p>
          </div>
        )}

        <p className="mt-5 text-xs text-slate-500">
          You can return to your registered subjects to
          continue with another examination when it becomes
          available. This subject will remain marked as submitted.
        </p>

        <PrimaryButton
          className="mt-8"
          onClick={returnToSubjects}
        >
          Return to Registered Subjects
          <ArrowRight size={16} />
        </PrimaryButton>
      </motion.section>
    </main>
  );

  /* =========================================================
     MAIN RENDER
  ========================================================= */

  return (
    <div className="relative min-h-screen bg-[#020617] text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 top-20 h-96 w-96 rounded-full bg-blue-600/[0.055] blur-[110px]" />

        <div className="absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-indigo-500/[0.045] blur-[110px]" />
      </div>

      <div className="relative">
        {screen === "welcome" && renderWelcome()}

        {screen === "details" && (
          <CBTInstructions
            examInfo={examInfo}
            student={student}
            onBack={() => setScreen("welcome")}
            onContinue={() => {
              setError("");
              setScreen("subjects");
            }}
          />
        )}

        {screen === "subjects" && renderSubjects()}

        {screen === "subject-details" && renderSubjectDetails()}

        {screen === "exam" && (
          <CBTExamScreen
            selectedExam={selectedExam}
            questions={questions}
            answers={answers}
            currentQuestionIndex={currentQuestionIndex}
            currentQuestion={currentQuestion}
            currentQuestionId={currentQuestionId}
            currentOptions={currentOptions}
            currentAnswer={currentAnswer}
            markedQuestions={markedQuestions}
            remainingSeconds={remainingSeconds}
            answeredCount={answeredCount}
            unansweredCount={unansweredCount}
            saving={saving}
            submitting={submitting}
            error={error}
            mobileQuestionNav={mobileQuestionNav}
            showSubmitConfirm={showSubmitConfirm}
            onSelectAnswer={selectAnswer}
            onToggleMarked={toggleMarked}
            onGoToQuestion={goToQuestion}
            onToggleMobileNav={() =>
              setMobileQuestionNav((value) => !value)
            }
            onCloseMobileNav={() => setMobileQuestionNav(false)}
            onShowSubmitConfirm={() => setShowSubmitConfirm(true)}
            onCloseSubmitConfirm={() =>
              setShowSubmitConfirm(false)
            }
            onSubmit={() => submitExam(false)}
            onReturnToSubjects={returnToSubjects}
          />
        )}

        {screen === "submitted" && renderSubmitted()}
      </div>
    </div>
  );
}
