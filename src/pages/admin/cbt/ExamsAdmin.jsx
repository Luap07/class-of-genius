
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import {
  BookOpen,
  FileText,
  Layers3,
  RefreshCw,
  Search,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Clock3,
  XCircle,
  Upload,
  GraduationCap,
  ArrowUpRight,
  CalendarClock,
  CalendarCheck,
  Lock,
  PlayCircle,
  Save,
  AlertCircle,
  Pencil,
  Trash2,
  Eye,
  ClipboardList,
} from "lucide-react";

const SCHOOL_EXAM = "School Examination";

const SCHOOL_CLASSES = [
  "Primary 1",
  "Primary 2",
  "Primary 3",
  "Primary 4",
  "Primary 5",
  "Primary 6",
  "JSS 1",
  "JSS 2",
  "JSS 3",
  "SS 1",
  "SS 2",
  "SS 3",
];

const REQUIRED_QUESTIONS = 40;

const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

const SCHOOL_EXAMS_API = `${API_BASE_URL}/api/admin/school-exams`;
const SCHOOL_SCHEDULE_API = `${SCHOOL_EXAMS_API}/schedule`;

const LOCAL_SCHEDULE_KEY = "scholiqen_school_exam_schedule";

const normalize = (value) =>
  String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

const getAdminToken = () => {
  const tokenKeys = [
    "scholiqen_auth_token",
    "scholiqen_token",
    "admin_token",
    "access_token",
    "token",
  ];

  for (const key of tokenKeys) {
    const value = localStorage.getItem(key);
    if (value) return value;
  }

  return "";
};

const getHeaders = (json = false) => {
  const token = getAdminToken();

  const headers = {
    Accept: "application/json",
  };

  if (json) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

const getErrorMessage = (data, fallback) =>
  data?.message ||
  data?.error ||
  data?.details ||
  fallback;

const requestJson = async (url, options = {}) => {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getHeaders(
        options.method && options.method !== "GET"
      ),
      ...(options.headers || {}),
    },
  });

  let data = {};

  try {
    const text = await response.text();
    data = text ? JSON.parse(text) : {};
  } catch {
    throw new Error(
      `The server returned an invalid response (${response.status}).`
    );
  }

  if (!response.ok || data?.success === false) {
    throw new Error(
      getErrorMessage(
        data,
        `Request failed (${response.status}).`
      )
    );
  }

  return data;
};

const extractExams = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.exams)) return data.exams;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.results)) return data.results;

  if (data?.exam && typeof data.exam === "object") {
    return [data.exam];
  }

  return [];
};

const extractExam = (data) => {
  if (data?.exam && typeof data.exam === "object") {
    return data.exam;
  }

  if (data?.data && !Array.isArray(data.data)) {
    return data.data;
  }

  return data;
};

const getQuestionClass = (question) =>
  question?.class_name ||
  question?.className ||
  question?.class ||
  question?.student_class ||
  question?.studentClass ||
  question?.grade ||
  question?.level ||
  "";

const getQuestionSubject = (question) =>
  question?.subject ||
  question?.subject_name ||
  question?.subjectName ||
  "";

const getClassOrder = (className) =>
  SCHOOL_CLASSES.findIndex(
    (item) => normalize(item) === normalize(className)
  );

const formatNumber = (value) =>
  Number(value || 0).toLocaleString();

const getExamQuestionCount = (exam, questions = []) => {
  const storedCount = Number(
    exam?.question_count ??
      exam?.questionCount ??
      exam?.total_questions ??
      exam?.totalQuestions ??
      0
  );

  const loadedCount = questions.filter(
    (question) =>
      String(question.exam_id ?? question.examId ?? "") ===
      String(exam.id)
  ).length;

  return Math.max(storedCount, loadedCount);
};

/* =========================================================
   DATE AND SCHEDULE HELPERS
========================================================= */

const getTimestamp = (value) => {
  if (!value) return null;

  const timestamp = new Date(value).getTime();

  return Number.isFinite(timestamp) ? timestamp : null;
};

const toDateTimeLocal = (value) => {
  const timestamp = getTimestamp(value);

  if (timestamp === null) return "";

  const date = new Date(timestamp);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const dateTimeLocalToISO = (value) => {
  if (!value) return null;

  const timestamp = new Date(value).getTime();

  if (!Number.isFinite(timestamp)) return null;

  return new Date(timestamp).toISOString();
};

const formatScheduleDate = (value) => {
  const timestamp = getTimestamp(value);

  if (timestamp === null) return "Not set";

  return new Intl.DateTimeFormat("en-NG", {
    timeZone: "Africa/Lagos",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(timestamp);
};

const formatCountdown = (milliseconds) => {
  const totalSeconds = Math.max(
    0,
    Math.floor(milliseconds / 1000)
  );

  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
};

const getSavedLocalSchedule = () => {
  try {
    const saved = localStorage.getItem(LOCAL_SCHEDULE_KEY);

    if (!saved) {
      return {
        start_at: "",
        end_at: "",
      };
    }

    const parsed = JSON.parse(saved);

    return {
      start_at: parsed?.start_at || "",
      end_at: parsed?.end_at || "",
    };
  } catch {
    return {
      start_at: "",
      end_at: "",
    };
  }
};

const extractSchedule = (data) => {
  const schedule =
    data?.schedule ||
    data?.data?.schedule ||
    data?.data ||
    data;

  return {
    start_at:
      schedule?.start_at ||
      schedule?.scheduled_start_at ||
      schedule?.startAt ||
      schedule?.scheduledStartAt ||
      "",

    end_at:
      schedule?.end_at ||
      schedule?.scheduled_end_at ||
      schedule?.endAt ||
      schedule?.scheduledEndAt ||
      "",
  };
};

const getScheduleState = (schedule, now) => {
  const start = getTimestamp(schedule?.start_at);
  const end = getTimestamp(schedule?.end_at);

  if (start === null || end === null || end <= start) {
    return {
      type: "not_set",
      start,
      end,
      remaining: null,
    };
  }

  if (now < start) {
    return {
      type: "upcoming",
      start,
      end,
      remaining: start - now,
    };
  }

  if (now >= start && now < end) {
    return {
      type: "ongoing",
      start,
      end,
      remaining: end - now,
    };
  }

  return {
    type: "ended",
    start,
    end,
    remaining: null,
  };
};

/* =========================================================
   QUESTION STATUS
========================================================= */

const getSubjectStatus = (count) => {
  if (count >= REQUIRED_QUESTIONS) {
    return {
      label: "Ready",
      icon: CheckCircle2,
      color: "text-emerald-400",
      badge:
        "border-emerald-400/20 bg-emerald-400/10 text-emerald-400",
      bar: "bg-emerald-400",
    };
  }

  if (count > 0) {
    return {
      label: `${count}/${REQUIRED_QUESTIONS}`,
      icon: Clock3,
      color: "text-yellow-400",
      badge:
        "border-yellow-400/20 bg-yellow-400/10 text-yellow-400",
      bar: "bg-yellow-400",
    };
  }

  return {
    label: "No questions",
    icon: XCircle,
    color: "text-red-400",
    badge:
      "border-red-400/20 bg-red-400/10 text-red-400",
    bar: "bg-red-400",
  };
};

/* =========================================================
   LOAD EXAMS AND THEIR QUESTIONS
========================================================= */

const fetchSchoolExamData = async () => {
  const response = await requestJson(SCHOOL_EXAMS_API);

  const exams = extractExams(response);

  const results = await Promise.all(
    exams.map(async (exam) => {
      let examQuestions = Array.isArray(exam.questions)
        ? exam.questions
        : [];

      if (exam.id) {
        try {
          const detailResponse = await requestJson(
            `${SCHOOL_EXAMS_API}/${encodeURIComponent(exam.id)}`
          );

          const detailedExam = extractExam(detailResponse);

          if (Array.isArray(detailedExam?.questions)) {
            examQuestions = detailedExam.questions;
          }
        } catch (error) {
          // The exam list can still be displayed if detail loading fails.
          console.warn(
            `Could not load questions for exam ${exam.id}:`,
            error.message
          );
        }
      }

      const mappedQuestions = examQuestions.map((question) => ({
        ...question,

        class_name:
          getQuestionClass(question) ||
          exam.class_name ||
          exam.className ||
          exam.class ||
          "",

        subject:
          getQuestionSubject(question) ||
          exam.subject ||
          exam.subject_name ||
          "",

        exam: SCHOOL_EXAM,
        exam_id: question.exam_id || exam.id,
        exam_title: exam.title || SCHOOL_EXAM,
        exam_status: exam.status || "draft",
      }));

      return {
        exam,
        questions: mappedQuestions,
      };
    })
  );

  return {
    exams,
    questions: results.flatMap((item) => item.questions),
  };
};

/* =========================================================
   MAIN COMPONENT
========================================================= */

const ExamsAdmin = () => {
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [exams, setExams] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState("");

  const [search, setSearch] = useState("");
  const [selectedClass, setSelectedClass] =
    useState("All Classes");
  const [expandedClass, setExpandedClass] = useState(null);

  const [deletingExamId, setDeletingExamId] = useState(null);
  const [examActionError, setExamActionError] = useState("");
  const [examActionMessage, setExamActionMessage] = useState("");

  const [schedule, setSchedule] = useState(
    getSavedLocalSchedule
  );

  const [scheduleLoading, setScheduleLoading] = useState(true);
  const [scheduleSaving, setScheduleSaving] = useState(false);
  const [scheduleError, setScheduleError] = useState("");
  const [scheduleMessage, setScheduleMessage] = useState("");

  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  /* =======================================================
     LOAD EXAMS AND QUESTIONS
  ======================================================= */

  const fetchQuestions = useCallback(async (refresh = false) => {
    try {
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setLoadError("");

      const result = await fetchSchoolExamData();

      setExams(result.exams);
      setQuestions(result.questions);
    } catch (error) {
      console.error(
        "School examination loading error:",
        error
      );

      setLoadError(
        error?.message ||
          "Unable to load school examination data."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  /* =======================================================
     LOAD GENERAL SCHOOL SCHEDULE
  ======================================================= */

  const fetchSchedule = useCallback(async () => {
    setScheduleLoading(true);
    setScheduleError("");

    try {
      const response = await requestJson(
        SCHOOL_SCHEDULE_API
      );

      const savedSchedule = extractSchedule(response);

      setSchedule({
        start_at: savedSchedule.start_at
          ? toDateTimeLocal(savedSchedule.start_at)
          : "",
        end_at: savedSchedule.end_at
          ? toDateTimeLocal(savedSchedule.end_at)
          : "",
      });

      localStorage.setItem(
        LOCAL_SCHEDULE_KEY,
        JSON.stringify(savedSchedule)
      );
    } catch (error) {
      console.error("Unable to load general schedule:", error);

      setSchedule(getSavedLocalSchedule());

      setScheduleError(
        error?.message ||
          "Unable to load the saved school examination schedule."
      );
    } finally {
      setScheduleLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  const handleRefresh = async () => {
    await Promise.all([
      fetchQuestions(true),
      fetchSchedule(),
    ]);
  };

  /* =======================================================
     SAVE GENERAL SCHOOL SCHEDULE
  ======================================================= */

  const saveSchedule = async (event) => {
    event.preventDefault();

    setScheduleError("");
    setScheduleMessage("");

    if (!schedule.start_at || !schedule.end_at) {
      setScheduleError(
        "Please select both the examination start and closing date/time."
      );
      return;
    }

    const startISO = dateTimeLocalToISO(schedule.start_at);
    const endISO = dateTimeLocalToISO(schedule.end_at);

    if (!startISO || !endISO) {
      setScheduleError(
        "Please enter valid examination dates and times."
      );
      return;
    }

    if (new Date(endISO).getTime() <= new Date(startISO).getTime()) {
      setScheduleError(
        "The examination closing date and time must be after the start date and time."
      );
      return;
    }

    setScheduleSaving(true);

    try {
      const response = await requestJson(
        SCHOOL_SCHEDULE_API,
        {
          method: "PUT",
          body: JSON.stringify({
            start_at: startISO,
            end_at: endISO,
          }),
        }
      );

      const returnedSchedule = extractSchedule(response);

      const finalSchedule = {
        start_at: returnedSchedule.start_at || startISO,
        end_at: returnedSchedule.end_at || endISO,
      };

      setSchedule({
        start_at: toDateTimeLocal(finalSchedule.start_at),
        end_at: toDateTimeLocal(finalSchedule.end_at),
      });

      localStorage.setItem(
        LOCAL_SCHEDULE_KEY,
        JSON.stringify(finalSchedule)
      );

      setScheduleMessage(
        "The general school examination schedule has been saved successfully."
      );
    } catch (error) {
      console.error("Schedule save error:", error);

      setScheduleError(
        error?.message ||
          "Unable to save the school examination schedule."
      );
    } finally {
      setScheduleSaving(false);
    }
  };

  const clearSchedule = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to clear the general school examination schedule?"
    );

    if (!confirmed) return;

    setScheduleError("");
    setScheduleMessage("");
    setScheduleSaving(true);

    try {
      await requestJson(SCHOOL_SCHEDULE_API, {
        method: "PUT",
        body: JSON.stringify({
          start_at: null,
          end_at: null,
        }),
      });

      const emptySchedule = {
        start_at: "",
        end_at: "",
      };

      setSchedule(emptySchedule);
      localStorage.removeItem(LOCAL_SCHEDULE_KEY);

      setScheduleMessage(
        "The general school examination schedule has been cleared."
      );
    } catch (error) {
      setScheduleError(
        error?.message ||
          "Unable to clear the examination schedule."
      );
    } finally {
      setScheduleSaving(false);
    }
  };

  /* =======================================================
     EDIT EXAM
  ======================================================= */

  const editExam = (exam) => {
    if (!exam?.id) {
      setExamActionError("This examination does not have a valid ID.");
      return;
    }

    const params = new URLSearchParams({
      id: String(exam.id),
      edit: String(exam.id),
      exam: SCHOOL_EXAM,
    });

    navigate(
      `/admin/cbt/exams/create?${params.toString()}`
    );
  };

  /* =======================================================
     DELETE EXAM
  ======================================================= */

  const deleteExam = async (exam) => {
    if (!exam?.id) {
      setExamActionError("This examination does not have a valid ID.");
      return;
    }

    const confirmed = window.confirm(
      `Delete "${exam.title || SCHOOL_EXAM}" for ${exam.class_name || "this class"} - ${exam.subject || "this subject"}?\n\nThis action will permanently remove the examination and its attached questions if your backend delete route is configured to do so.`
    );

    if (!confirmed) return;

    setDeletingExamId(String(exam.id));
    setExamActionError("");
    setExamActionMessage("");

    try {
      await requestJson(
        `${SCHOOL_EXAMS_API}/${encodeURIComponent(exam.id)}`,
        {
          method: "DELETE",
        }
      );

      setExams((current) =>
        current.filter(
          (item) => String(item.id) !== String(exam.id)
        )
      );

      setQuestions((current) =>
        current.filter(
          (question) =>
            String(question.exam_id ?? question.examId ?? "") !==
            String(exam.id)
        )
      );

      setExamActionMessage(
        `${exam.subject || "The examination"} for ${exam.class_name || "the selected class"} was deleted.`
      );

      // Reload from the database to keep the display accurate.
      await fetchQuestions(true);
    } catch (error) {
      console.error("Exam deletion failed:", error);

      setExamActionError(
        error?.message ||
          "Unable to delete this examination. Check the backend DELETE route."
      );
    } finally {
      setDeletingExamId(null);
    }
  };

  /* =======================================================
     GENERAL SCHEDULE COUNTDOWN
  ======================================================= */

  const generalSchedule = useMemo(
    () => getScheduleState(schedule, now),
    [schedule, now]
  );

  const countdown = useMemo(
    () =>
      generalSchedule.remaining !== null
        ? formatCountdown(generalSchedule.remaining)
        : null,
    [generalSchedule.remaining]
  );

  /* =======================================================
     EXAM STATISTICS
  ======================================================= */

  const examStatistics = useMemo(() => {
    return {
      total: exams.length,
      published: exams.filter(
        (exam) => normalize(exam.status) === "published"
      ).length,
      drafts: exams.filter(
        (exam) => normalize(exam.status) !== "published"
      ).length,
    };
  }, [exams]);

  /* =======================================================
     GROUP QUESTIONS BY CLASS AND SUBJECT
  ======================================================= */

  const schoolData = useMemo(() => {
    const classes = SCHOOL_CLASSES.map((className) => ({
      name: className,
      key: normalize(className),
      subjects: {},
      totalQuestions: 0,
    }));

    const classMap = new Map(
      classes.map((item) => [item.key, item])
    );

    questions.forEach((question) => {
      const className = getQuestionClass(question);
      const subjectName = getQuestionSubject(question);

      if (!className || !subjectName) return;

      const classKey = normalize(className);

      let classItem = classMap.get(classKey);

      if (!classItem) {
        classItem = {
          name: String(className).trim(),
          key: classKey,
          subjects: {},
          totalQuestions: 0,
        };

        classMap.set(classKey, classItem);
        classes.push(classItem);
      }

      const subjectKey = normalize(subjectName);

      if (!classItem.subjects[subjectKey]) {
        classItem.subjects[subjectKey] = {
          name: String(subjectName).trim(),
          count: 0,
        };
      }

      classItem.subjects[subjectKey].count += 1;
      classItem.totalQuestions += 1;
    });

    return classes.sort((a, b) => {
      const first = getClassOrder(a.name);
      const second = getClassOrder(b.name);

      if (first !== -1 && second !== -1) {
        return first - second;
      }

      if (first !== -1) return -1;
      if (second !== -1) return 1;

      return a.name.localeCompare(b.name);
    });
  }, [questions]);

  /* =======================================================
     QUESTION STATISTICS
  ======================================================= */

  const statistics = useMemo(() => {
    const subjects = new Set();

    let completeSubjects = 0;
    let unassigned = 0;

    schoolData.forEach((classItem) => {
      Object.values(classItem.subjects).forEach((subject) => {
        subjects.add(subject.name);

        if (subject.count >= REQUIRED_QUESTIONS) {
          completeSubjects += 1;
        }
      });
    });

    questions.forEach((question) => {
      if (
        !getQuestionClass(question) ||
        !getQuestionSubject(question)
      ) {
        unassigned += 1;
      }
    });

    const activeClasses = schoolData.filter(
      (item) => item.totalQuestions > 0
    ).length;

    return {
      classes: activeClasses,
      subjects: subjects.size,
      questions: questions.length,
      completeSubjects,
      unassigned,
    };
  }, [questions, schoolData]);

  /* =======================================================
     SEARCH AND FILTER
  ======================================================= */

  const filteredClasses = useMemo(() => {
    const term = normalize(search);

    return schoolData.filter((classItem) => {
      if (
        selectedClass !== "All Classes" &&
        normalize(classItem.name) !== normalize(selectedClass)
      ) {
        return false;
      }

      if (!term) return true;

      if (normalize(classItem.name).includes(term)) {
        return true;
      }

      return Object.values(classItem.subjects).some(
        (subject) => normalize(subject.name).includes(term)
      );
    });
  }, [schoolData, search, selectedClass]);

  const toggleClass = (className) => {
    setExpandedClass((current) =>
      current === className ? null : className
    );
  };

  /* =======================================================
     QUESTION UPLOAD NAVIGATION
  ======================================================= */

  const openQuestionUploader = (className, subjectName) => {
    const params = new URLSearchParams({
      exam: SCHOOL_EXAM,
      class: className,
      subject: subjectName,
    });

    navigate(
      `/admin/cbt/exams/create?${params.toString()}`
    );
  };

  const openClassUploader = (className) => {
    const params = new URLSearchParams({
      exam: SCHOOL_EXAM,
      class: className,
    });

    navigate(
      `/admin/cbt/exams/create?${params.toString()}`
    );
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="min-h-full space-y-6 text-white">

      {/* HEADER */}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-400/20 bg-blue-500/10 text-blue-400">
            <GraduationCap size={25} />
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              School Examination
            </h1>

            <p className="mt-1 text-sm text-slate-400">
              Manage examinations, schedules and questions by class and subject.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={refreshing || scheduleLoading}
          className="flex h-10 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm text-slate-300 transition hover:border-blue-400/20 hover:bg-blue-500/10 hover:text-white disabled:opacity-50"
        >
          <RefreshCw
            size={16}
            className={
              refreshing || scheduleLoading
                ? "animate-spin"
                : ""
            }
          />
          Refresh Data
        </button>
      </div>

      {/* EXAMINATION IDENTITY */}

      <div className="rounded-2xl border border-blue-400/15 bg-gradient-to-br from-blue-500/[0.08] to-cyan-500/[0.025] p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-300">
              <span className="h-2 w-2 rounded-full bg-blue-400" />
              Internal Examination
            </div>

            <h2 className="text-xl font-bold text-white">
              {SCHOOL_EXAM}
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              Upload and manage examination questions prepared by your school.
              Every examination belongs to a specific class and subject.
              External examination question banks are managed separately.
            </p>
          </div>

          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.04] text-blue-300">
            <BookOpen size={30} />
          </div>
        </div>
      </div>

      {/* SAVED EXAMINATIONS MANAGEMENT */}

      <section className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#071426]">
        <div className="flex flex-col gap-3 border-b border-white/[0.07] p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-purple-400/20 bg-purple-500/10 text-purple-300">
              <ClipboardList size={21} />
            </div>

            <div>
              <h2 className="font-bold text-white">
                Manage Saved Examinations
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                Edit, review or delete examinations already saved in your database.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            <span className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-slate-300">
              {examStatistics.total} Total
            </span>

            <span className="rounded-lg border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-emerald-300">
              {examStatistics.published} Published
            </span>

            <span className="rounded-lg border border-yellow-400/20 bg-yellow-400/10 px-3 py-2 text-yellow-300">
              {examStatistics.drafts} Drafts
            </span>
          </div>
        </div>

        <div className="space-y-4 p-5">
          {examActionError && (
            <div className="flex items-start gap-2 rounded-xl border border-red-400/20 bg-red-400/[0.06] p-3 text-sm text-red-300">
              <AlertCircle size={17} className="mt-0.5 shrink-0" />
              {examActionError}
            </div>
          )}

          {examActionMessage && (
            <div className="flex items-start gap-2 rounded-xl border border-emerald-400/20 bg-emerald-400/[0.06] p-3 text-sm text-emerald-300">
              <CheckCircle2 size={17} className="mt-0.5 shrink-0" />
              {examActionMessage}
            </div>
          )}

          {loading ? (
            <div className="py-10 text-center text-sm text-slate-500">
              Loading saved examinations...
            </div>
          ) : exams.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-5 py-10 text-center">
              <FileText
                size={28}
                className="mx-auto text-slate-600"
              />

              <p className="mt-3 font-semibold text-white">
                No saved examinations yet
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Examinations you create will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {exams.map((exam) => {
                const questionCount = getExamQuestionCount(
                  exam,
                  questions
                );

                const isPublished =
                  normalize(exam.status) === "published";

                const isDeleting =
                  deletingExamId === String(exam.id);

                return (
                  <div
                    key={exam.id}
                    className="rounded-xl border border-white/[0.08] bg-white/[0.025] p-4 transition hover:border-blue-400/20"
                  >
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-bold text-white">
                            {exam.title || SCHOOL_EXAM}
                          </h3>

                          <span
                            className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
                              isPublished
                                ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                                : "border-yellow-400/20 bg-yellow-400/10 text-yellow-300"
                            }`}
                          >
                            {exam.status || "draft"}
                          </span>

                          <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] text-slate-400">
                            ID: {exam.id}
                          </span>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-400">
                          <span className="inline-flex items-center gap-1.5">
                            <GraduationCap size={14} />
                            {exam.class_name || exam.className || "Class not set"}
                          </span>

                          <span className="inline-flex items-center gap-1.5">
                            <BookOpen size={14} />
                            {exam.subject || "Subject not set"}
                          </span>

                          <span className="inline-flex items-center gap-1.5">
                            <FileText size={14} />
                            {formatNumber(questionCount)} questions
                          </span>

                          <span className="inline-flex items-center gap-1.5">
                            <Clock3 size={14} />
                            {exam.duration_minutes || 60} minutes
                          </span>
                        </div>

                        <div className="mt-3 grid gap-2 sm:grid-cols-2">
                          <div className="rounded-lg border border-white/[0.06] bg-black/10 px-3 py-2">
                            <p className="text-[10px] uppercase tracking-wide text-slate-500">
                              Starts
                            </p>

                            <p className="mt-1 text-xs text-slate-300">
                              {formatScheduleDate(
                                exam.scheduled_start_at
                              )}
                            </p>
                          </div>

                          <div className="rounded-lg border border-white/[0.06] bg-black/10 px-3 py-2">
                            <p className="text-[10px] uppercase tracking-wide text-slate-500">
                              Ends
                            </p>

                            <p className="mt-1 text-xs text-slate-300">
                              {formatScheduleDate(
                                exam.scheduled_end_at
                              )}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex shrink-0 flex-wrap gap-2 xl:justify-end">
                        <button
                          type="button"
                          onClick={() => editExam(exam)}
                          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-blue-400/20 bg-blue-500/10 px-4 text-xs font-semibold text-blue-300 transition hover:bg-blue-500/20 hover:text-white"
                        >
                          <Pencil size={15} />
                          Edit Exam
                        </button>

                        <button
                          type="button"
                          onClick={() => deleteExam(exam)}
                          disabled={isDeleting}
                          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-red-400/20 bg-red-500/[0.07] px-4 text-xs font-semibold text-red-300 transition hover:bg-red-500/15 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isDeleting ? (
                            <RefreshCw
                              size={15}
                              className="animate-spin"
                            />
                          ) : (
                            <Trash2 size={15} />
                          )}

                          {isDeleting ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* GENERAL SCHOOL EXAMINATION SCHEDULE */}

      <section className="overflow-hidden rounded-2xl border border-blue-400/20 bg-[#071426]">
        <div className="flex flex-col gap-3 border-b border-white/[0.07] p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-blue-400/20 bg-blue-500/10 text-blue-400">
              <CalendarClock size={22} />
            </div>

            <div>
              <h2 className="font-bold text-white">
                Set General School Examination Schedule
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                Set the official opening and closing dates for the school's examination period.
              </p>
            </div>
          </div>

          <span className="w-fit rounded-lg border border-blue-400/20 bg-blue-500/10 px-3 py-1.5 text-xs font-semibold text-blue-300">
            Africa/Lagos · WAT
          </span>
        </div>

        <div className="space-y-5 p-5 sm:p-6">
          <form onSubmit={saveSchedule}>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-4">
                <label className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
                  <CalendarClock size={17} className="text-blue-400" />
                  Examination Start Date and Time
                </label>

                <input
                  type="datetime-local"
                  value={schedule.start_at}
                  onChange={(event) => {
                    setSchedule((current) => ({
                      ...current,
                      start_at: event.target.value,
                    }));
                    setScheduleMessage("");
                    setScheduleError("");
                  }}
                  disabled={scheduleLoading || scheduleSaving}
                  required
                  className="h-12 w-full rounded-xl border border-white/10 bg-[#0b1020] px-3 text-sm text-white outline-none focus:border-blue-400/50 disabled:opacity-50 [color-scheme:dark]"
                />

                <p className="mt-2 text-xs text-slate-500">
                  Students will be allowed to start at this exact time.
                </p>
              </div>

              <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-4">
                <label className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
                  <CalendarCheck size={17} className="text-emerald-400" />
                  Examination Closing Date and Time
                </label>

                <input
                  type="datetime-local"
                  value={schedule.end_at}
                  onChange={(event) => {
                    setSchedule((current) => ({
                      ...current,
                      end_at: event.target.value,
                    }));
                    setScheduleMessage("");
                    setScheduleError("");
                  }}
                  disabled={scheduleLoading || scheduleSaving}
                  required
                  className="h-12 w-full rounded-xl border border-white/10 bg-[#0b1020] px-3 text-sm text-white outline-none focus:border-emerald-400/50 disabled:opacity-50 [color-scheme:dark]"
                />

                <p className="mt-2 text-xs text-slate-500">
                  Students will no longer be allowed to take the examination after this time.
                </p>
              </div>
            </div>

            {scheduleError && (
              <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-400/20 bg-red-400/[0.06] p-3 text-sm text-red-300">
                <AlertCircle size={17} className="mt-0.5 shrink-0" />
                <span>{scheduleError}</span>
              </div>
            )}

            {scheduleMessage && (
              <div className="mt-4 flex items-start gap-2 rounded-xl border border-emerald-400/20 bg-emerald-400/[0.06] p-3 text-sm text-emerald-300">
                <CheckCircle2 size={17} className="mt-0.5 shrink-0" />
                <span>{scheduleMessage}</span>
              </div>
            )}

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs leading-5 text-slate-500">
                This is one general schedule for the school. It is not set separately for each class or subject.
              </p>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={clearSchedule}
                  disabled={
                    scheduleSaving ||
                    scheduleLoading ||
                    (!schedule.start_at && !schedule.end_at)
                  }
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-red-400/20 bg-red-400/[0.06] px-4 text-sm font-semibold text-red-300 transition hover:bg-red-400/10 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <XCircle size={16} />
                  Clear Schedule
                </button>

                <button
                  type="submit"
                  disabled={scheduleSaving || scheduleLoading}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {scheduleSaving ? (
                    <RefreshCw size={16} className="animate-spin" />
                  ) : (
                    <Save size={16} />
                  )}

                  {scheduleSaving
                    ? "Saving Schedule..."
                    : "Save Examination Schedule"}
                </button>
              </div>
            </div>
          </form>

          <div className="border-t border-white/[0.07] pt-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-white">
                  General Examination Countdown
                </h3>

                <p className="mt-1 text-xs text-slate-400">
                  This countdown updates automatically every second.
                </p>
              </div>

              {generalSchedule.type === "upcoming" && (
                <span className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1.5 text-xs font-semibold text-blue-300">
                  <Clock3 size={14} />
                  Upcoming
                </span>
              )}

              {generalSchedule.type === "ongoing" && (
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-300">
                  <PlayCircle size={14} />
                  Examination In Progress
                </span>
              )}

              {generalSchedule.type === "ended" && (
                <span className="inline-flex items-center gap-2 rounded-full border border-red-400/20 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-300">
                  <Lock size={14} />
                  Examination Period Ended
                </span>
              )}
            </div>

            {scheduleLoading ? (
              <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] px-5 py-8 text-center text-sm text-slate-500">
                Loading saved examination schedule...
              </div>
            ) : generalSchedule.type === "not_set" ? (
              <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-5 py-8 text-center">
                <CalendarClock
                  size={30}
                  className="mx-auto text-slate-600"
                />

                <h4 className="mt-3 font-semibold text-white">
                  Examination schedule has not been set
                </h4>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                  Select the start and closing date/time above, then click Save Examination Schedule.
                </p>
              </div>
            ) : (
              <>
                {countdown && (
                  <div className="rounded-2xl border border-blue-400/15 bg-black/20 p-4 sm:p-5">
                    <p className="mb-4 text-center text-xs font-semibold uppercase tracking-wide text-slate-400">
                      {generalSchedule.type === "upcoming"
                        ? "Time Until Examination Begins"
                        : "Time Remaining Until Examination Closes"}
                    </p>

                    <div className="mx-auto grid max-w-2xl grid-cols-4 gap-2 sm:gap-4">
                      <CountdownUnit
                        value={countdown.days}
                        label="Days"
                      />

                      <CountdownUnit
                        value={countdown.hours}
                        label="Hours"
                      />

                      <CountdownUnit
                        value={countdown.minutes}
                        label="Minutes"
                      />

                      <CountdownUnit
                        value={countdown.seconds}
                        label="Seconds"
                      />
                    </div>
                  </div>
                )}

                {generalSchedule.type === "ended" && (
                  <div className="rounded-xl border border-red-400/15 bg-red-400/[0.04] p-5 text-center">
                    <Lock
                      size={25}
                      className="mx-auto text-red-300"
                    />

                    <p className="mt-2 font-semibold text-red-300">
                      The scheduled examination period has ended.
                    </p>
                  </div>
                )}

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-4">
                    <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      <CalendarClock
                        size={15}
                        className="text-blue-400"
                      />
                      Examination Begins
                    </p>

                    <p className="mt-3 text-sm font-semibold text-white">
                      {formatScheduleDate(schedule.start_at)}
                    </p>
                  </div>

                  <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-4">
                    <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      <CalendarCheck
                        size={15}
                        className="text-emerald-400"
                      />
                      Examination Closes
                    </p>

                    <p className="mt-3 text-sm font-semibold text-white">
                      {formatScheduleDate(schedule.end_at)}
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* QUESTION STATISTICS */}

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard
          icon={Layers3}
          label="Active Classes"
          value={statistics.classes}
          color="blue"
        />

        <StatCard
          icon={BookOpen}
          label="Active Subjects"
          value={statistics.subjects}
          color="purple"
        />

        <StatCard
          icon={FileText}
          label="Total Questions"
          value={loading ? "..." : formatNumber(statistics.questions)}
          color="cyan"
        />

        <StatCard
          icon={CheckCircle2}
          label="Ready Subject Banks"
          value={statistics.completeSubjects}
          color="emerald"
        />
      </div>

      {/* FILTERS */}

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-md">
          <Search
            size={17}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
          />

          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search class or subject..."
            className="h-11 w-full rounded-xl border border-white/10 bg-white/[0.035] pl-11 pr-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-400/30"
          />
        </div>

        <select
          value={selectedClass}
          onChange={(event) => setSelectedClass(event.target.value)}
          className="h-11 rounded-xl border border-white/10 bg-[#0b1020] px-4 text-sm text-white outline-none focus:border-blue-400/30"
        >
          <option value="All Classes">All Classes</option>

          {SCHOOL_CLASSES.map((className) => (
            <option key={className} value={className}>
              {className}
            </option>
          ))}
        </select>
      </div>

      {/* ERROR */}

      {loadError && (
        <div className="flex flex-col gap-3 rounded-xl border border-red-400/20 bg-red-400/[0.06] p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-red-300">
              Unable to load school examination data
            </p>

            <p className="mt-1 text-xs text-red-300/80">
              {loadError}
            </p>
          </div>

          <button
            type="button"
            onClick={() => fetchQuestions()}
            className="text-sm font-semibold text-red-300 hover:text-white"
          >
            Try again
          </button>
        </div>
      )}

      {/* CLASS LIST */}

      <div className="space-y-4">
        {loading ? (
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] px-6 py-16 text-center text-sm text-slate-500">
            Loading school examination data...
          </div>
        ) : filteredClasses.length === 0 ? (
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] px-6 py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.04] text-slate-500">
              <GraduationCap size={26} />
            </div>

            <h3 className="mt-4 font-semibold text-white">
              No matching classes
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Try another search or select a different class.
            </p>
          </div>
        ) : (
          filteredClasses.map((classItem) => {
            const subjects = Object.values(classItem.subjects).sort(
              (a, b) => a.name.localeCompare(b.name)
            );

            const isExpanded = expandedClass === classItem.name;

            const readySubjects = subjects.filter(
              (subject) => subject.count >= REQUIRED_QUESTIONS
            ).length;

            return (
              <div
                key={classItem.key}
                className="overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.025]"
              >
                <div className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex min-w-0 items-center gap-3">
                    <button
                      type="button"
                      onClick={() => toggleClass(classItem.name)}
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.035] text-slate-400 transition hover:border-blue-400/20 hover:text-blue-400"
                    >
                      {isExpanded ? (
                        <ChevronUp size={18} />
                      ) : (
                        <ChevronDown size={18} />
                      )}
                    </button>

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                      <GraduationCap size={21} />
                    </div>

                    <div className="min-w-0">
                      <h3 className="font-bold text-white">
                        {classItem.name}
                      </h3>

                      <p className="mt-1 text-xs text-slate-500">
                        {subjects.length} subject
                        {subjects.length === 1 ? "" : "s"}
                        {" · "}
                        {formatNumber(classItem.totalQuestions)} questions
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 lg:justify-end">
                    <span className="rounded-lg border border-emerald-400/15 bg-emerald-400/[0.06] px-3 py-2 text-xs text-emerald-300">
                      {readySubjects} ready
                    </span>

                    <button
                      type="button"
                      onClick={() => openClassUploader(classItem.name)}
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-500"
                    >
                      <Upload size={16} />
                      Upload Questions
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-white/[0.07] bg-black/10 p-5">
                    <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h4 className="font-semibold text-white">
                          {classItem.name} Subjects
                        </h4>

                        <p className="mt-1 text-xs text-slate-500">
                          Select a subject to upload questions specifically for this class.
                        </p>
                      </div>

                      <span className="text-xs text-slate-500">
                        Target: {REQUIRED_QUESTIONS} questions per subject
                      </span>
                    </div>

                    {subjects.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] p-8 text-center">
                        <BookOpen
                          size={24}
                          className="mx-auto text-slate-600"
                        />

                        <p className="mt-3 text-sm font-medium text-white">
                          No subjects uploaded yet
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          Start by uploading questions for this class.
                        </p>

                        <button
                          type="button"
                          onClick={() => openClassUploader(classItem.name)}
                          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-blue-500"
                        >
                          <Upload size={15} />
                          Upload First Questions
                        </button>
                      </div>
                    ) : (
                      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                        {subjects.map((subject) => {
                          const status = getSubjectStatus(subject.count);
                          const StatusIcon = status.icon;

                          return (
                            <div
                              key={subject.name}
                              className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-4"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-semibold text-white">
                                    {subject.name}
                                  </p>

                                  <p className="mt-1 text-xs text-slate-500">
                                    Target: {REQUIRED_QUESTIONS} questions
                                  </p>
                                </div>

                                <StatusIcon
                                  size={17}
                                  className={status.color}
                                />
                              </div>

                              <div className="mt-5 flex items-end justify-between gap-3">
                                <span className="text-2xl font-bold text-white">
                                  {formatNumber(subject.count)}
                                </span>

                                <span
                                  className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold ${status.badge}`}
                                >
                                  {status.label}
                                </span>
                              </div>

                              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                                <div
                                  className={`h-full rounded-full transition-all ${status.bar}`}
                                  style={{
                                    width: `${Math.min(
                                      (subject.count / REQUIRED_QUESTIONS) *
                                        100,
                                      100
                                    )}%`,
                                  }}
                                />
                              </div>

                              <button
                                type="button"
                                onClick={() =>
                                  openQuestionUploader(
                                    classItem.name,
                                    subject.name
                                  )
                                }
                                className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-blue-400/15 bg-blue-500/[0.06] px-3 py-2.5 text-xs font-semibold text-blue-300 transition hover:border-blue-400/30 hover:bg-blue-500/10 hover:text-white"
                              >
                                <Upload size={14} />
                                Upload {subject.name} Questions
                                <ArrowUpRight size={14} />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* UNASSIGNED QUESTIONS */}

      {!loading && statistics.unassigned > 0 && (
        <div className="rounded-xl border border-yellow-400/15 bg-yellow-400/[0.04] p-4">
          <div className="flex items-start gap-3">
            <XCircle
              size={19}
              className="mt-0.5 shrink-0 text-yellow-400"
            />

            <div>
              <h3 className="text-sm font-semibold text-yellow-300">
                Questions missing class or subject
              </h3>

              <p className="mt-1 text-xs leading-5 text-slate-400">
                {statistics.unassigned} school examination question(s) do not have both a class and subject assigned.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* STRUCTURE NOTICE */}

      <div className="rounded-2xl border border-blue-400/10 bg-blue-500/[0.04] p-5">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
            <BookOpen size={19} />
          </div>

          <div>
            <h3 className="font-semibold text-white">
              School CBT Question Structure
            </h3>

            <p className="mt-1 text-sm leading-6 text-slate-400">
              Each question belongs to School Examination, a class and a subject.
              The student CBT uses the student's class and selected subject to
              retrieve the correct question bank. The general examination
              schedule controls when the school examination period begins and
              ends. External examination question banks remain separate.
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {SCHOOL_CLASSES.map((className) => (
                <span
                  key={className}
                  className="rounded-lg border border-white/[0.07] bg-white/[0.035] px-3 py-2 text-xs text-slate-300"
                >
                  {className}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* =========================================================
   COUNTDOWN UNIT
========================================================= */

const CountdownUnit = ({ value, label }) => (
  <div className="rounded-lg border border-white/[0.06] bg-white/[0.035] px-1.5 py-3 text-center">
    <p className="text-xl font-bold tabular-nums text-white sm:text-2xl">
      {String(value).padStart(2, "0")}
    </p>

    <p className="mt-1 text-[9px] uppercase tracking-wide text-slate-500">
      {label}
    </p>
  </div>
);

/* =========================================================
   STAT CARD
========================================================= */

const StatCard = ({
  icon: Icon,
  label,
  value,
  color,
}) => {
  const colors = {
    blue: "bg-blue-500/10 text-blue-400",
    purple: "bg-purple-500/10 text-purple-400",
    cyan: "bg-cyan-500/10 text-cyan-400",
    emerald: "bg-emerald-500/10 text-emerald-400",
  };

  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.035] p-5">
      <div
        className={`mb-3 flex h-9 w-9 items-center justify-center rounded-xl ${
          colors[color] || colors.blue
        }`}
      >
        <Icon size={18} />
      </div>

      <p className="text-2xl font-bold text-white">
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-500">
        {label}
      </p>
    </div>
  );
};

export default ExamsAdmin;
