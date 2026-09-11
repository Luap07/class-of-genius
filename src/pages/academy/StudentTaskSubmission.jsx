import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  FileText,
  Image as ImageIcon,
  Loader2,
  Paperclip,
  Send,
  Trash2,
  Upload,
  Video,
  AlertCircle,
  BookOpen,
  GraduationCap,
  Award,
  MessageSquare,
  X,
} from "lucide-react";

/* =========================================================
   API
========================================================= */

const RAW_API_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:5000";

const API_ROOT = RAW_API_URL.replace(/\/+$/, "");

const API_BASE_URL = API_ROOT.endsWith("/api/academy")
  ? API_ROOT
  : `${API_ROOT}/api/academy`;

const SUBMISSION_URL = `${API_BASE_URL}/student/task-submissions`;

/* =========================================================
   STORAGE
========================================================= */

const STUDENT_STORAGE_KEYS = [
  "scholiqen_academy_user",
  "scholiqen_student",
  "academyStudent",
  "academyStudentData",
  "currentStudent",
  "student",
  "user",
];

const TOKEN_KEYS = [
  "scholiqen_academy_token",
  "scholiqen_token",
  "access_token",
  "token",
];

/* =========================================================
   FILE SETTINGS
========================================================= */

const MAX_FILES = 10;
const MAX_FILE_SIZE = 250 * 1024 * 1024;

const ACCEPTED_EXTENSIONS = [
  ".pdf",
  ".doc",
  ".docx",
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
  ".svg",
  ".avif",
  ".mp4",
  ".webm",
  ".mov",
];

const ACCEPTED_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "image/avif",
  "video/mp4",
  "video/webm",
  "video/quicktime",
];

/* =========================================================
   HELPERS
========================================================= */

function clean(value) {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

function safeParse(value) {
  if (!value) return null;

  if (typeof value === "object") {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function readStorageObject(key) {
  try {
    const value = localStorage.getItem(key);

    if (!value) return null;

    return safeParse(value);
  } catch {
    return null;
  }
}

function getStoredStudent() {
  for (const key of STUDENT_STORAGE_KEYS) {
    const value = readStorageObject(key);

    if (value && typeof value === "object") {
      return value;
    }
  }

  return null;
}

function getStoredToken() {
  for (const key of TOKEN_KEYS) {
    try {
      const value = localStorage.getItem(key);

      if (value) {
        return value;
      }
    } catch {
      // Ignore storage errors.
    }
  }

  return "";
}

function getStudentId(student) {
  if (!student) return "";

  return clean(
    student.id ||
      student.studentId ||
      student.student_id ||
      student.userId ||
      student.user_id ||
      student.reference ||
      student.studentReference ||
      student.student_reference
  );
}

function getStudentName(student) {
  if (!student) return "";

  const direct = clean(
    student.name ||
      student.full_name ||
      student.fullName ||
      student.studentName ||
      student.student_name
  );

  if (direct) return direct;

  return [
    student.first_name || student.firstName,
    student.middle_name || student.middleName,
    student.last_name || student.lastName,
  ]
    .map(clean)
    .filter(Boolean)
    .join(" ");
}

function getStudentEmail(student) {
  if (!student) return "";

  return clean(
    student.email ||
      student.studentEmail ||
      student.student_email
  );
}

function getStudentGrade(student) {
  if (!student) return "";

  return clean(
    student.grade ||
      student.class ||
      student.class_name ||
      student.className ||
      student.level
  );
}

function getTaskId(task) {
  if (!task) return "";

  return clean(
    task.id ||
      task.taskId ||
      task.task_id ||
      task.activityId ||
      task.activity_id
  );
}

function getTaskTitle(task) {
  if (!task) return "Task";

  return clean(
    task.title ||
      task.task_title ||
      task.name ||
      "Task"
  );
}

function getTaskSubject(task) {
  if (!task) return "";

  return clean(
    task.subject ||
      task.subject_name ||
      task.subjectName
  );
}

function getTaskGrade(task) {
  if (!task) return "";

  return clean(
    task.grade ||
      task.class ||
      task.class_name ||
      task.className
  );
}

function getTaskDescription(task) {
  if (!task) return "";

  return clean(
    task.description ||
      task.task_description
  );
}

function getTaskInstructions(task) {
  if (!task) return "";

  return clean(
    task.instructions ||
      task.instruction ||
      task.task_instructions ||
      task.metadata?.instructions
  );
}

function getTaskDueDate(task) {
  if (!task) return "";

  return clean(
    task.dueDate ||
      task.due_date ||
      task.metadata?.dueDate ||
      task.metadata?.due_date
  );
}

function getTaskMaxScore(task) {
  if (!task) return "";

  return clean(
    task.maxScore ||
      task.max_score ||
      task.metadata?.maxScore ||
      task.metadata?.max_score
  );
}

function formatDate(value) {
  if (!value) return "No due date";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString([], {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatFileSize(bytes) {
  if (!bytes) return "0 B";

  const units = ["B", "KB", "MB", "GB"];
  const index = Math.floor(Math.log(bytes) / Math.log(1024));

  return `${(bytes / Math.pow(1024, index)).toFixed(
    index === 0 ? 0 : 1
  )} ${units[index]}`;
}

function getFileExtension(fileName) {
  const name = clean(fileName).toLowerCase();

  const index = name.lastIndexOf(".");

  if (index === -1) return "";

  return name.slice(index);
}

function isAllowedFile(file) {
  if (!file) return false;

  const extension = getFileExtension(file.name);

  if (ACCEPTED_EXTENSIONS.includes(extension)) {
    return true;
  }

  if (file.type && ACCEPTED_MIME_TYPES.includes(file.type)) {
    return true;
  }

  return false;
}

function getFileIcon(file) {
  const type = clean(file?.type).toLowerCase();
  const extension = getFileExtension(file?.name);

  if (
    type.startsWith("image/") ||
    [".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg", ".avif"].includes(
      extension
    )
  ) {
    return ImageIcon;
  }

  if (
    type.startsWith("video/") ||
    [".mp4", ".webm", ".mov"].includes(extension)
  ) {
    return Video;
  }

  return FileText;
}

function extractApiError(data, fallback) {
  if (!data) return fallback;

  if (typeof data === "string") {
    return data || fallback;
  }

  return (
    data.message ||
    data.error ||
    data.details ||
    data?.data?.message ||
    fallback
  );
}

/* =========================================================
   COMPONENT
========================================================= */

export default function StudentTaskSubmission({
  task: taskProp = null,
  student: studentProp = null,
  onSubmitted = null,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();

  const fileInputRef = useRef(null);

  const [task, setTask] = useState(taskProp);
  const [student, setStudent] = useState(studentProp);

  const [responseText, setResponseText] = useState("");
  const [files, setFiles] = useState([]);

  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [previousSubmission, setPreviousSubmission] = useState(null);

  const [dragActive, setDragActive] = useState(false);

  /* =========================================================
     LOAD TASK + STUDENT
  ========================================================= */

  useEffect(() => {
    const stateTask =
      location.state?.task ||
      location.state?.activity ||
      location.state?.classActivity ||
      null;

    const stateStudent =
      location.state?.student ||
      location.state?.user ||
      null;

    if (!taskProp && stateTask) {
      setTask(stateTask);
    }

    if (!studentProp && stateStudent) {
      setStudent(stateStudent);
    }

    if (!studentProp && !stateStudent) {
      const storedStudent = getStoredStudent();

      if (storedStudent) {
        setStudent(storedStudent);
      }
    }
  }, [taskProp, studentProp, location.state]);

  /* =========================================================
     QUERY TASK FALLBACK
  ========================================================= */

  useEffect(() => {
    const query = new URLSearchParams(location.search);

    const queryTaskId =
      query.get("taskId") ||
      query.get("task_id") ||
      "";

    if (!task && queryTaskId) {
      setTask({
        id: queryTaskId,
      });
    }
  }, [location.search, task]);

  /* =========================================================
     TASK ID
  ========================================================= */

  const taskId = useMemo(() => {
    return (
      getTaskId(task) ||
      clean(params.taskId) ||
      clean(params.id) ||
      new URLSearchParams(location.search).get("taskId") ||
      new URLSearchParams(location.search).get("task_id") ||
      ""
    );
  }, [task, params, location.search]);

  /* =========================================================
     STUDENT DETAILS
  ========================================================= */

  const studentId = useMemo(
    () => getStudentId(student),
    [student]
  );

  const studentName = useMemo(
    () => getStudentName(student),
    [student]
  );

  const studentEmail = useMemo(
    () => getStudentEmail(student),
    [student]
  );

  const studentGrade = useMemo(
    () => getStudentGrade(student),
    [student]
  );

  /* =========================================================
     LOAD PREVIOUS SUBMISSION
  ========================================================= */

  useEffect(() => {
    let cancelled = false;

    async function loadPreviousSubmission() {
      if (!taskId) return;

      if (!studentId && !studentEmail && !studentName) {
        return;
      }

      setLoading(true);

      try {
        const paramsObject = new URLSearchParams();

        paramsObject.set("taskId", taskId);

        if (studentId) {
          paramsObject.set("studentId", studentId);
        }

        if (studentEmail) {
          paramsObject.set("email", studentEmail);
        }

        if (studentName) {
          paramsObject.set("studentName", studentName);
        }

        const token = getStoredToken();

        const response = await fetch(
          `${SUBMISSION_URL}?${paramsObject.toString()}`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
              ...(token
                ? {
                    Authorization: `Bearer ${token}`,
                  }
                : {}),
            },
          }
        );

        const data = await response.json().catch(() => null);

        if (!response.ok) {
          return;
        }

        if (cancelled) return;

        const submissions =
          Array.isArray(data)
            ? data
            : data?.submissions ||
              data?.data ||
              [];

        if (Array.isArray(submissions)) {
          const matching = submissions.find((item) => {
            return (
              clean(
                item.task_id ||
                  item.taskId ||
                  item.activity_id ||
                  item.activityId
              ) === taskId
            );
          });

          if (matching) {
            setPreviousSubmission(matching);
          }
        } else if (data?.submission) {
          setPreviousSubmission(data.submission);
        }
      } catch {
        // Previous submission lookup should not prevent submission.
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadPreviousSubmission();

    return () => {
      cancelled = true;
    };
  }, [
    taskId,
    studentId,
    studentEmail,
    studentName,
  ]);

  /* =========================================================
     FILE HANDLING
  ========================================================= */

  function validateAndAddFiles(incomingFiles) {
    setError("");
    setSuccess("");

    const selectedFiles = Array.from(incomingFiles || []);

    if (!selectedFiles.length) {
      return;
    }

    if (files.length + selectedFiles.length > MAX_FILES) {
      setError(
        `You can upload a maximum of ${MAX_FILES} files.`
      );
      return;
    }

    const validFiles = [];

    for (const file of selectedFiles) {
      if (!isAllowedFile(file)) {
        setError(
          `"${file.name}" is not supported. Upload PDF, DOC, DOCX, images, or video files.`
        );
        continue;
      }

      if (file.size > MAX_FILE_SIZE) {
        setError(
          `"${file.name}" is larger than the 250 MB limit.`
        );
        continue;
      }

      const duplicate = files.some(
        (existing) =>
          existing.name === file.name &&
          existing.size === file.size &&
          existing.lastModified === file.lastModified
      );

      if (duplicate) {
        continue;
      }

      validFiles.push(file);
    }

    if (validFiles.length) {
      setFiles((current) => [
        ...current,
        ...validFiles,
      ]);
    }
  }

  function handleFileInput(event) {
    validateAndAddFiles(event.target.files);

    event.target.value = "";
  }

  function handleDrop(event) {
    event.preventDefault();

    setDragActive(false);

    validateAndAddFiles(event.dataTransfer.files);
  }

  function removeFile(index) {
    setFiles((current) =>
      current.filter((_, fileIndex) => fileIndex !== index)
    );
  }

  /* =========================================================
     SUBMIT
  ========================================================= */

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!taskId) {
      setError(
        "This task could not be identified. Please open the task again from your class activities."
      );
      return;
    }

    if (!studentId && !studentEmail && !studentName) {
      setError(
        "Your student account could not be identified. Please log in again and open the task from your student dashboard."
      );
      return;
    }

    if (!clean(responseText) && files.length === 0) {
      setError(
        "Write your response or attach at least one file before submitting."
      );
      return;
    }

    if (files.length > MAX_FILES) {
      setError(
        `You can upload a maximum of ${MAX_FILES} files.`
      );
      return;
    }

    for (const file of files) {
      if (!isAllowedFile(file)) {
        setError(
          `"${file.name}" is not a supported file type.`
        );
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        setError(
          `"${file.name}" exceeds the 250 MB file limit.`
        );
        return;
      }
    }

    const formData = new FormData();

    formData.append("taskId", taskId);
    formData.append("task_id", taskId);

    if (studentId) {
      formData.append("studentId", studentId);
      formData.append("student_id", studentId);
    }

    if (studentName) {
      formData.append("studentName", studentName);
      formData.append("student_name", studentName);
    }

    if (studentEmail) {
      formData.append("studentEmail", studentEmail);
      formData.append("student_email", studentEmail);
      formData.append("email", studentEmail);
    }

    if (studentGrade) {
      formData.append("grade", studentGrade);
      formData.append("class", studentGrade);
    }

    const subject = getTaskSubject(task);

    if (subject) {
      formData.append("subject", subject);
      formData.append("subject_name", subject);
    }

    formData.append(
      "responseText",
      responseText.trim()
    );

    formData.append(
      "response_text",
      responseText.trim()
    );

    files.forEach((file) => {
      formData.append("files", file);
    });

    formData.append(
      "metadata",
      JSON.stringify({
        taskId,
        taskTitle: getTaskTitle(task),
        subject,
        grade: getTaskGrade(task),
        studentId,
        studentName,
        studentEmail,
        submittedFrom: "scholiqen-academy",
      })
    );

    try {
      setSubmitting(true);

      const token = getStoredToken();

      const response = await fetch(
        SUBMISSION_URL,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            ...(token
              ? {
                  Authorization: `Bearer ${token}`,
                }
              : {}),
          },
          body: formData,
        }
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          extractApiError(
            data,
            `Unable to submit task. Server returned ${response.status}.`
          )
        );
      }

      const submitted =
        data?.submission ||
        data?.data ||
        data;

      setPreviousSubmission(submitted || null);

      setResponseText("");
      setFiles([]);

      setSuccess(
        "Task submitted successfully. Your tutor can now review your submission."
      );

      if (typeof onSubmitted === "function") {
        onSubmitted(submitted);
      }
    } catch (submissionError) {
      setError(
        submissionError?.message ||
          "Unable to submit task. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  /* =========================================================
     EMPTY TASK
  ========================================================= */

  if (!taskId && !task) {
    return (
      <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center px-6">
        <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-[#071426] p-8 text-center shadow-2xl">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 text-red-400">
            <AlertCircle size={30} />
          </div>

          <h1 className="text-2xl font-bold">
            Task not found
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-400">
            This page needs to be opened from a task in your
            Academy class activities.
          </p>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
          >
            <ArrowLeft size={17} />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const title = getTaskTitle(task);
  const subject = getTaskSubject(task);
  const grade = getTaskGrade(task);
  const description = getTaskDescription(task);
  const instructions = getTaskInstructions(task);
  const dueDate = getTaskDueDate(task);
  const maxScore = getTaskMaxScore(task);

  /* =========================================================
     UI
  ========================================================= */

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      {/* =====================================================
          TOP BAR
      ===================================================== */}

      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#020617]/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:border-cyan-400/30 hover:bg-cyan-400/5 hover:text-white"
          >
            <ArrowLeft size={17} />
            <span className="hidden sm:inline">
              Back
            </span>
          </button>

          <div className="min-w-0 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-cyan-400">
              Scholiqen Academy
            </p>

            <h1 className="mt-1 truncate text-base font-bold text-white sm:text-lg">
              Submit Task
            </h1>
          </div>

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-cyan-400">
            <BookOpen size={18} />
          </div>
        </div>
      </header>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8 lg:py-10">
        {/* ===================================================
            ALERTS
        =================================================== */}

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-4 text-sm text-red-200">
            <AlertCircle
              size={19}
              className="mt-0.5 shrink-0 text-red-400"
            />

            <div className="flex-1 leading-6">
              {error}
            </div>

            <button
              type="button"
              onClick={() => setError("")}
              className="rounded-lg p-1 text-red-300 transition hover:bg-red-500/10"
            >
              <X size={17} />
            </button>
          </div>
        )}

        {success && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-4 text-sm text-emerald-200">
            <CheckCircle2
              size={19}
              className="mt-0.5 shrink-0 text-emerald-400"
            />

            <div className="flex-1 leading-6">
              {success}
            </div>

            <button
              type="button"
              onClick={() => setSuccess("")}
              className="rounded-lg p-1 text-emerald-300 transition hover:bg-emerald-500/10"
            >
              <X size={17} />
            </button>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
          {/* =================================================
              TASK INFORMATION
          ================================================= */}

          <section className="space-y-6">
            <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#071426] shadow-xl">
              <div className="border-b border-white/10 bg-gradient-to-br from-cyan-500/10 via-transparent to-blue-500/5 p-6 sm:p-7">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-400">
                    <FileText size={23} />
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-400">
                      Class Task
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Task ID: {taskId}
                    </p>
                  </div>
                </div>

                <h2 className="text-2xl font-bold leading-tight text-white sm:text-3xl">
                  {title}
                </h2>

                {(subject || grade) && (
                  <div className="mt-5 flex flex-wrap gap-2">
                    {grade && (
                      <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-slate-300">
                        <GraduationCap size={14} />
                        {grade}
                      </span>
                    )}

                    {subject && (
                      <span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/15 bg-cyan-400/5 px-3 py-1.5 text-xs font-medium text-cyan-300">
                        <BookOpen size={14} />
                        {subject}
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="p-6 sm:p-7">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-4">
                    <div className="mb-2 flex items-center gap-2 text-slate-500">
                      <Clock3 size={15} />
                      <span className="text-xs font-medium">
                        Due Date
                      </span>
                    </div>

                    <p className="text-sm font-semibold text-white">
                      {formatDate(dueDate)}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-4">
                    <div className="mb-2 flex items-center gap-2 text-slate-500">
                      <Award size={15} />
                      <span className="text-xs font-medium">
                        Maximum Score
                      </span>
                    </div>

                    <p className="text-sm font-semibold text-white">
                      {maxScore || "Not specified"}
                    </p>
                  </div>
                </div>

                {description && (
                  <div className="mt-6">
                    <h3 className="text-sm font-bold text-white">
                      Description
                    </h3>

                    <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-400">
                      {description}
                    </p>
                  </div>
                )}

                {instructions && (
                  <div className="mt-6 rounded-2xl border border-cyan-400/10 bg-cyan-400/[0.04] p-5">
                    <div className="flex items-center gap-2">
                      <MessageSquare
                        size={17}
                        className="text-cyan-400"
                      />

                      <h3 className="text-sm font-bold text-white">
                        Instructions
                      </h3>
                    </div>

                    <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-400">
                      {instructions}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* =================================================
                STUDENT INFO
            ================================================= */}

            <div className="rounded-3xl border border-white/10 bg-[#071426] p-6 shadow-xl sm:p-7">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                  <GraduationCap size={19} />
                </div>

                <div>
                  <h3 className="text-sm font-bold text-white">
                    Submitting as
                  </h3>

                  <p className="text-xs text-slate-500">
                    Your Academy student account
                  </p>
                </div>
              </div>

              {studentName || studentEmail || studentGrade ? (
                <div className="space-y-3">
                  {studentName && (
                    <div className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.025] px-4 py-3">
                      <span className="text-xs text-slate-500">
                        Name
                      </span>

                      <span className="text-right text-sm font-medium text-white">
                        {studentName}
                      </span>
                    </div>
                  )}

                  {studentEmail && (
                    <div className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.025] px-4 py-3">
                      <span className="text-xs text-slate-500">
                        Email
                      </span>

                      <span className="max-w-[65%] truncate text-right text-sm font-medium text-white">
                        {studentEmail}
                      </span>
                    </div>
                  )}

                  {studentGrade && (
                    <div className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.025] px-4 py-3">
                      <span className="text-xs text-slate-500">
                        Class
                      </span>

                      <span className="text-right text-sm font-medium text-white">
                        {studentGrade}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle
                      size={18}
                      className="mt-0.5 shrink-0 text-amber-400"
                    />

                    <p className="text-sm leading-6 text-amber-200">
                      Your student account details were not
                      found. Please log in again before
                      submitting this task.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* =================================================
              SUBMISSION FORM
          ================================================= */}

          <section>
            <form
              onSubmit={handleSubmit}
              className="rounded-3xl border border-white/10 bg-[#071426] p-5 shadow-xl sm:p-7"
            >
              <div className="mb-7">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-400">
                  Your Submission
                </p>

                <h2 className="mt-2 text-2xl font-bold text-white">
                  Complete this task
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Add your answer below and attach any files
                  required by your tutor.
                </p>
              </div>

              {/* =================================================
                  RESPONSE
              ================================================= */}

              <div>
                <label
                  htmlFor="task-response"
                  className="mb-2 block text-sm font-semibold text-slate-200"
                >
                  Your response
                  <span className="ml-1 text-slate-500">
                    (optional if you attach files)
                  </span>
                </label>

                <textarea
                  id="task-response"
                  value={responseText}
                  onChange={(event) =>
                    setResponseText(event.target.value)
                  }
                  rows={9}
                  placeholder="Write your answer, explanation, solution, or response here..."
                  className="w-full resize-y rounded-2xl border border-white/10 bg-[#020617] px-4 py-4 text-sm leading-7 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/40 focus:ring-4 focus:ring-cyan-400/5"
                />

                <div className="mt-2 flex justify-end">
                  <span className="text-[11px] text-slate-600">
                    {responseText.length} characters
                  </span>
                </div>
              </div>

              {/* =================================================
                  FILE UPLOAD
              ================================================= */}

              <div className="mt-7">
                <div className="mb-2 flex items-center justify-between gap-4">
                  <label className="block text-sm font-semibold text-slate-200">
                    Attach files
                  </label>

                  <span className="text-xs text-slate-500">
                    {files.length}/{MAX_FILES}
                  </span>
                </div>

                <div
                  onDragEnter={(event) => {
                    event.preventDefault();
                    setDragActive(true);
                  }}
                  onDragOver={(event) => {
                    event.preventDefault();
                    setDragActive(true);
                  }}
                  onDragLeave={(event) => {
                    event.preventDefault();
                    setDragActive(false);
                  }}
                  onDrop={handleDrop}
                  className={[
                    "rounded-2xl border border-dashed p-7 text-center transition",
                    dragActive
                      ? "border-cyan-400 bg-cyan-400/10"
                      : "border-white/15 bg-[#020617] hover:border-cyan-400/30 hover:bg-white/[0.015]",
                  ].join(" ")}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept={ACCEPTED_EXTENSIONS.join(",")}
                    onChange={handleFileInput}
                    className="hidden"
                  />

                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-400">
                    <Upload size={25} />
                  </div>

                  <h3 className="mt-4 text-sm font-bold text-white">
                    Drop your files here
                  </h3>

                  <p className="mt-1 text-xs text-slate-500">
                    or choose files from your device
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      fileInputRef.current?.click()
                    }
                    className="mt-5 inline-flex items-center gap-2 rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-2.5 text-xs font-semibold text-cyan-300 transition hover:bg-cyan-400/15 hover:text-cyan-200"
                  >
                    <Paperclip size={15} />
                    Choose files
                  </button>

                  <p className="mx-auto mt-4 max-w-lg text-[11px] leading-5 text-slate-600">
                    PDF, DOC, DOCX, JPG, PNG, WEBP, GIF, SVG,
                    AVIF, MP4, WebM or MOV.
                    <br />
                    Maximum {MAX_FILES} files • Maximum 250 MB
                    per file.
                  </p>
                </div>
              </div>

              {/* =================================================
                  SELECTED FILES
              ================================================= */}

              {files.length > 0 && (
                <div className="mt-5 space-y-2">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-white">
                      Attached files
                    </h3>

                    <button
                      type="button"
                      onClick={() => setFiles([])}
                      className="text-xs text-slate-500 transition hover:text-red-400"
                    >
                      Remove all
                    </button>
                  </div>

                  {files.map((file, index) => {
                    const FileIcon = getFileIcon(file);

                    return (
                      <div
                        key={`${file.name}-${file.lastModified}-${index}`}
                        className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#020617] p-3"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.04] text-cyan-400">
                          <FileIcon size={18} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p
                            className="truncate text-sm font-medium text-slate-200"
                            title={file.name}
                          >
                            {file.name}
                          </p>

                          <p className="mt-0.5 text-[11px] text-slate-600">
                            {formatFileSize(file.size)}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-500 transition hover:bg-red-500/10 hover:text-red-400"
                          aria-label={`Remove ${file.name}`}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* =================================================
                  PREVIOUS SUBMISSION
              ================================================= */}

              {previousSubmission && (
                <div className="mt-7 rounded-2xl border border-blue-400/15 bg-blue-400/[0.04] p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-400/10 text-blue-400">
                      <CheckCircle2 size={19} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-bold text-white">
                        Previous submission
                      </h3>

                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        You have already submitted this task.
                        You can submit again if your tutor allows
                        resubmissions.
                      </p>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {previousSubmission.status && (
                          <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-semibold capitalize text-slate-300">
                            {previousSubmission.status}
                          </span>
                        )}

                        {previousSubmission.score !== null &&
                          previousSubmission.score !== undefined && (
                            <span className="rounded-full border border-cyan-400/15 bg-cyan-400/5 px-3 py-1 text-[11px] font-semibold text-cyan-300">
                              Score: {previousSubmission.score}
                              {previousSubmission.max_score
                                ? `/${previousSubmission.max_score}`
                                : ""}
                            </span>
                          )}
                      </div>

                      {previousSubmission.feedback && (
                        <div className="mt-4 rounded-xl border border-white/10 bg-black/10 p-3">
                          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                            Tutor feedback
                          </p>

                          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-300">
                            {previousSubmission.feedback}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* =================================================
                  SUBMIT
              ================================================= */}

              <div className="mt-8 border-t border-white/10 pt-6">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-500 px-5 py-4 text-sm font-bold text-slate-950 shadow-lg shadow-cyan-500/10 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <Loader2
                        size={19}
                        className="animate-spin"
                      />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      Submit Task
                    </>
                  )}
                </button>

                <p className="mt-3 text-center text-[11px] leading-5 text-slate-600">
                  Make sure your response and attachments are
                  correct before submitting.
                </p>
              </div>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
}