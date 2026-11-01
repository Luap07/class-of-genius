import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useParams } from "react-router-dom";

import {
  AlertCircle,
   Award,
  ArrowLeft,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Download,
  FileText,
  GraduationCap,
  Image as ImageIcon,
  Loader2,
  MessageSquare,
  Paperclip,
  Send,
  Upload,
  User,
  Video,
  X,
} from "lucide-react";

import { motion } from "framer-motion";

/* =========================================================
   API CONFIGURATION
========================================================= */

const API_BASE_URL = (
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:5000"
).replace(/\/+$/, "");

function getAcademyApiBase() {
  if (/\/api\/academy$/i.test(API_BASE_URL)) {
    return API_BASE_URL;
  }

  if (/\/api$/i.test(API_BASE_URL)) {
    return `${API_BASE_URL}/academy`;
  }

  return `${API_BASE_URL}/api/academy`;
}

const ACADEMY_API = getAcademyApiBase();

const TASK_URL = `${ACADEMY_API}/student/tasks`;

const SUBMISSIONS_URL =
  `${ACADEMY_API}/student/task-submissions`;

const MAX_FILES = 10;

const MAX_FILE_SIZE =
  250 * 1024 * 1024;

const ACCEPTED_FILE_TYPES = [
  ".pdf",
  ".doc",
  ".docx",
  ".ppt",
  ".pptx",
  ".xls",
  ".xlsx",
  ".txt",
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
  ".mp4",
  ".webm",
  ".mov",
  ".zip",
];

/* =========================================================
   BASIC HELPERS
========================================================= */

function clean(value) {
  if (
    value === undefined ||
    value === null
  ) {
    return "";
  }

  return String(value).trim();
}

function firstValue(...values) {
  for (const value of values) {
    if (
      value !== undefined &&
      value !== null &&
      String(value).trim() !== ""
    ) {
      return value;
    }
  }

  return "";
}

function safeParse(value) {
  if (!value) {
    return null;
  }

  if (
    typeof value === "object"
  ) {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function getErrorMessage(error) {
  return (
    error?.message ||
    "Something went wrong. Please try again."
  );
}

/* =========================================================
   STUDENT SESSION
========================================================= */

function getStoredStudent() {
  if (
    typeof window === "undefined"
  ) {
    return null;
  }

  const keys = [
    "scholiqen_academy_user",
    "scholiqen_current_user",
    "academy_student",
    "student",
    "scholiqen_user",
    "current_user",
  ];

  for (const key of keys) {
    try {
      const raw =
        localStorage.getItem(key);

      if (!raw) {
        continue;
      }

      const parsed =
        safeParse(raw);

      if (
        parsed &&
        typeof parsed === "object"
      ) {
        return parsed;
      }
    } catch {
      continue;
    }
  }

  return null;
}

function getAcademyToken() {
  if (
    typeof window === "undefined"
  ) {
    return "";
  }

  const keys = [
    "scholiqen_academy_token",
    "academy_token",
    "scholiqen_token",
    "access_token",
    "token",
  ];

  for (const key of keys) {
    try {
      const value =
        localStorage.getItem(key);

      if (
        value &&
        value.trim()
      ) {
        return value.trim();
      }
    } catch {
      continue;
    }
  }

  return "";
}

/* =========================================================
   STUDENT IDENTIFIERS
========================================================= */

function getStudentIdentity(student) {
  if (!student) {
    return {
      studentId: "",
      enrollmentId: "",
      email: "",
      name: "",
      className: "",
      reference: "",
    };
  }

  const studentId = clean(
    firstValue(
      student.studentId,
      student.student_id,
      student.studentID,
      student.studentIdNumber,
      student.student_id_number,
      student.userId,
      student.user_id,
      student.id
    )
  );

  const enrollmentId = clean(
    firstValue(
      student.enrollmentId,
      student.enrollment_id,
      student.enrollmentID,
      student.academyEnrollmentId,
      student.academy_enrollment_id
    )
  );

  const email = clean(
    firstValue(
      student.email,
      student.studentEmail,
      student.student_email,
      student.emailAddress,
      student.email_address
    )
  );

  const name = clean(
    firstValue(
      student.fullName,
      student.full_name,
      student.studentName,
      student.student_name,
      student.name,
      [
        student.firstName ||
          student.first_name,
        student.middleName ||
          student.middle_name,
        student.lastName ||
          student.last_name,
      ]
        .map(clean)
        .filter(Boolean)
        .join(" ")
    )
  );

  const className = clean(
    firstValue(
      student.className,
      student.class_name,
      student.class,
      student.grade,
      student.gradeLevel,
      student.grade_level,
      student.studentClass,
      student.student_class
    )
  );

  const reference = clean(
    firstValue(
      student.studentReference,
      student.student_reference,
      student.reference,
      student.enrollmentReference,
      student.enrollment_reference
    )
  );

  return {
    studentId,
    enrollmentId,
    email,
    name,
    className,
    reference,
  };
}

/* =========================================================
   AUTH HEADERS
========================================================= */

function getStudentHeaders() {
  const token =
    getAcademyToken();

  const headers = {
    Accept: "application/json",
  };

  if (token) {
    headers.Authorization =
      `Bearer ${token}`;
  }

  return headers;
}

/* =========================================================
   RESPONSE HELPERS
========================================================= */

async function readResponse(response) {
  const contentType =
    response.headers.get(
      "content-type"
    ) || "";

  if (
    contentType.includes(
      "application/json"
    )
  ) {
    return response.json();
  }

  const text =
    await response.text();

  try {
    return text
      ? JSON.parse(text)
      : {};
  } catch {
    return {
      message: text,
    };
  }
}

function extractRows(data) {
  if (Array.isArray(data)) {
    return data;
  }

  const possibleRows = [
    data?.submissions,
    data?.rows,
    data?.results,
    data?.data?.submissions,
    data?.data?.rows,
    data?.data,
  ];

  for (const rows of possibleRows) {
    if (Array.isArray(rows)) {
      return rows;
    }
  }

  if (
    data?.submission &&
    typeof data.submission === "object"
  ) {
    return [data.submission];
  }

  if (
    data?.data?.submission &&
    typeof data.data.submission === "object"
  ) {
    return [data.data.submission];
  }

  return [];
}

/* =========================================================
   FILE HELPERS
========================================================= */

function parseAttachments(value) {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value.filter(Boolean);
  }

  if (
    typeof value === "object"
  ) {
    return Object.values(value);
  }

  if (
    typeof value === "string"
  ) {
    try {
      const parsed =
        JSON.parse(value);

      if (Array.isArray(parsed)) {
        return parsed;
      }

      if (
        parsed &&
        typeof parsed === "object"
      ) {
        return Object.values(parsed);
      }
    } catch {
      return [];
    }
  }

  return [];
}

function getFileName(file, index = 0) {
  if (typeof file === "string") {
    return (
      file
        .split("/")
        .pop()
        ?.split("?")[0] ||
      `Attachment ${index + 1}`
    );
  }

  return (
    clean(
      firstValue(
        file?.originalName,
        file?.original_name,
        file?.fileName,
        file?.file_name,
        file?.filename,
        file?.name
      )
    ) ||
    `Attachment ${index + 1}`
  );
}

function getFileUrl(file) {
  if (!file) {
    return "";
  }

  const raw =
    typeof file === "string"
      ? file
      : firstValue(
          file?.url,
          file?.fileUrl,
          file?.file_url,
          file?.downloadUrl,
          file?.download_url,
          file?.path,
          file?.filePath,
          file?.file_path
        );

  const url = clean(raw);

  if (!url) {
    return "";
  }

  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  if (url.startsWith("/")) {
    return `${API_BASE_URL}${url}`;
  }

  return `${API_BASE_URL}/${url}`;
}

function getFileType(file) {
  const name =
    getFileName(file).toLowerCase();

  const mimeType = clean(
    firstValue(
      file?.mimeType,
      file?.mime_type,
      file?.type
    )
  ).toLowerCase();

  if (
    mimeType.startsWith("image/") ||
    /\.(jpg|jpeg|png|webp|gif|svg|avif)$/i.test(name)
  ) {
    return "image";
  }

  if (
    mimeType.startsWith("video/") ||
    /\.(mp4|webm|mov)$/i.test(name)
  ) {
    return "video";
  }

  if (
    mimeType.includes("pdf") ||
    /\.pdf$/i.test(name)
  ) {
    return "pdf";
  }

  if (
    /\.(doc|docx|ppt|pptx|xls|xlsx|txt)$/i.test(name)
  ) {
    return "document";
  }

  return "file";
}

function formatFileSize(bytes) {
  const size = Number(bytes || 0);

  if (!size) {
    return "Unknown size";
  }

  if (size < 1024) {
    return `${size} B`;
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  return `${(
    size /
    (1024 * 1024)
  ).toFixed(1)} MB`;
}

/* =========================================================
   DATE HELPERS
========================================================= */

function parseDate(value) {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (
    Number.isNaN(date.getTime())
  ) {
    return null;
  }

  return date;
}

function formatDate(value) {
  const date = parseDate(value);

  if (!date) {
    return "Not specified";
  }

  return date.toLocaleDateString(
    "en-NG",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    }
  );
}

function formatDateTime(value) {
  const date = parseDate(value);

  if (!date) {
    return "Not available";
  }

  return date.toLocaleString(
    "en-NG",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }
  );
}

function isPastDue(value) {
  const due = parseDate(value);

  if (!due) {
    return false;
  }

  return Date.now() > due.getTime();
}

/* =========================================================
   NORMALIZE TASK
========================================================= */

function normalizeTask(task) {
  if (
    !task ||
    typeof task !== "object"
  ) {
    return null;
  }

  const metadata =
    safeParse(task.metadata) ||
    task.metadata ||
    {};

  const attachments = parseAttachments(
    firstValue(
      task.attachments,
      task.task_attachments,
      task.taskAttachments,
      task.files,
      task.resources,
      metadata?.attachments,
      metadata?.files,
      metadata?.resources
    )
  );

  return {
    ...task,

    id: clean(
      firstValue(
        task.id,
        task.taskId,
        task.task_id,
        task.activityId,
        task.activity_id,
        task.reference
      )
    ),

    title:
      clean(
        firstValue(
          task.title,
          task.task_title,
          task.taskTitle,
          task.name
        )
      ) || "Task",

    description: clean(
      firstValue(
        task.description,
        task.task_description,
        task.taskDescription
      )
    ),

    instructions: clean(
      firstValue(
        task.instructions,
        task.task_instructions,
        task.taskInstructions,
        metadata?.instructions
      )
    ),

    subject: clean(
      firstValue(
        task.subject,
        task.subject_name,
        task.subjectName
      )
    ),

    grade: clean(
      firstValue(
        task.grade,
        task.class,
        task.class_name,
        task.className
      )
    ),

    dueAt: firstValue(
      task.dueAt,
      task.due_at,
      task.dueDate,
      task.due_date,
      task.deadline
    ),

    maxScore:
      Number(
        firstValue(
          task.maxScore,
          task.max_score,
          task.total_marks,
          task.totalMarks,
          100
        )
      ) || 100,

    attachments,
  };
}

/* =========================================================
   NORMALIZE SUBMISSION
========================================================= */

function normalizeSubmission(submission) {
  if (
    !submission ||
    typeof submission !== "object"
  ) {
    return null;
  }

  return {
    ...submission,

    id: clean(
      firstValue(
        submission.id,
        submission.submissionId,
        submission.submission_id
      )
    ),

    taskId: clean(
      firstValue(
        submission.taskId,
        submission.task_id,
        submission.activityId,
        submission.activity_id
      )
    ),

    responseText: clean(
      firstValue(
        submission.responseText,
        submission.response_text,
        submission.submissionText,
        submission.submission_text,
        submission.answer,
        submission.answer_text
      )
    ),

    status:
      clean(
        firstValue(
          submission.status,
          submission.submissionStatus,
          submission.submission_status
        )
      ) || "submitted",

    submittedAt: firstValue(
      submission.submittedAt,
      submission.submitted_at,
      submission.createdAt,
      submission.created_at
    ),

    attachments: parseAttachments(
      firstValue(
        submission.attachments,
        submission.files,
        submission.submissionFiles,
        submission.submission_files,
        submission.studentAttachments,
        submission.student_attachments
      )
    ),

    score:
      submission.score !== undefined &&
      submission.score !== null &&
      submission.score !== ""
        ? Number(submission.score)
        : null,

    feedback: clean(
      firstValue(
        submission.feedback,
        submission.tutorFeedback,
        submission.tutor_feedback
      )
    ),
  };
}

/* =========================================================
   TASK RESPONSE EXTRACTION
========================================================= */

function extractTask(data) {
  if (!data) {
    return null;
  }

  const possibleTasks = [
    data.task,
    data.activity,
    data.data?.task,
    data.data?.activity,
    data.data,
    data,
  ];

  for (const item of possibleTasks) {
    if (
      item &&
      typeof item === "object" &&
      !Array.isArray(item) &&
      firstValue(
        item.id,
        item.taskId,
        item.task_id,
        item.title,
        item.task_title
      )
    ) {
      return normalizeTask(item);
    }
  }

  return null;
}

/* =========================================================
   COMPONENT
========================================================= */

export default function StudentTaskSubmission({
  taskId: suppliedTaskId,
}) {
  const params = useParams();

  const taskId = clean(
    firstValue(
      suppliedTaskId,
      params?.taskId,
      params?.id
    )
  );

  const fileInputRef = useRef(null);

  const [student, setStudent] =
    useState(null);

  const [task, setTask] =
    useState(null);

  const [submission, setSubmission] =
    useState(null);

  const [responseText, setResponseText] =
    useState("");

  const [selectedFiles, setSelectedFiles] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [taskLoading, setTaskLoading] =
    useState(false);

  const [submissionLoading, setSubmissionLoading] =
    useState(false);

  /* =======================================================
     STUDENT SESSION
  ======================================================= */

  useEffect(() => {
    const currentStudent =
      getStoredStudent();

    if (!currentStudent) {
      setError(
        "Your student session could not be found. Please sign in again."
      );

      setLoading(false);
      return;
    }

    const identity =
      getStudentIdentity(
        currentStudent
      );

    if (
      !identity.studentId &&
      !identity.email
    ) {
      setError(
        "Your student ID or email address is missing from your Academy session. Please sign in again."
      );

      setLoading(false);
      return;
    }

    setStudent(currentStudent);
  }, []);

  /* =======================================================
     FETCH TASK
  ======================================================= */

  const fetchTask = useCallback(
    async () => {
      if (!taskId) {
        throw new Error(
          "Task ID is missing from the page URL."
        );
      }

      setTaskLoading(true);

      try {
        const url =
          `${TASK_URL}/${encodeURIComponent(taskId)}`;

        console.log(
          "Loading student task:",
          url
        );

        const response =
          await fetch(url, {
            method: "GET",
            headers: getStudentHeaders(),
            credentials: "include",
          });

        const data =
          await readResponse(response);

        if (!response.ok) {
          throw new Error(
            data?.message ||
              data?.error ||
              `Unable to load task (${response.status}).`
          );
        }

        const normalizedTask =
          extractTask(data);

        if (!normalizedTask) {
          throw new Error(
            "The server returned the task response, but no task record was found."
          );
        }

        setTask(normalizedTask);

        return normalizedTask;
      } finally {
        setTaskLoading(false);
      }
    },
    [taskId]
  );

  /* =======================================================
     FETCH STUDENT SUBMISSION
  ======================================================= */

  const fetchSubmission =
    useCallback(
      async () => {
        if (!student) {
          return null;
        }

        const identity =
          getStudentIdentity(student);

        if (
          !identity.studentId &&
          !identity.email
        ) {
          throw new Error(
            "Student ID or email is required to load your submission."
          );
        }

        setSubmissionLoading(true);

        try {
          const url =
            new URL(SUBMISSIONS_URL);

          if (identity.studentId) {
            url.searchParams.set(
              "studentId",
              identity.studentId
            );
          }

          if (identity.email) {
            url.searchParams.set(
              "email",
              identity.email
            );
          }

          if (identity.enrollmentId) {
            url.searchParams.set(
              "enrollmentId",
              identity.enrollmentId
            );
          }

          if (taskId) {
            url.searchParams.set(
              "taskId",
              taskId
            );
          }

          console.log(
            "Loading student submission:",
            url.toString()
          );

          const response =
            await fetch(
              url.toString(),
              {
                method: "GET",
                headers: getStudentHeaders(),
                credentials: "include",
              }
            );

          const data =
            await readResponse(response);

          if (!response.ok) {
            throw new Error(
              data?.message ||
                data?.error ||
                `Unable to load your submission (${response.status}).`
            );
          }

          const rows =
            extractRows(data);

          const normalizedRows =
            rows
              .map(normalizeSubmission)
              .filter(Boolean);

          const matchingSubmission =
            normalizedRows.find(
              (item) =>
                String(item.taskId) ===
                String(taskId)
            ) ||
            (
              normalizedRows.length === 1
                ? normalizedRows[0]
                : null
            );

          setSubmission(
            matchingSubmission
          );

          if (matchingSubmission) {
            setResponseText(
              matchingSubmission.responseText ||
                ""
            );
          }

          return matchingSubmission;
        } finally {
          setSubmissionLoading(false);
        }
      },
      [student, taskId]
    );

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  const loadPage = useCallback(
    async () => {
      if (!student) {
        return;
      }

      setLoading(true);
      setError("");
      setSuccess("");

      try {
        await Promise.all([
          fetchTask(),
          fetchSubmission(),
        ]);
      } catch (err) {
        console.error(
          "Student task submission load error:",
          err
        );

        setError(
          getErrorMessage(err)
        );
      } finally {
        setLoading(false);
      }
    },
    [
      student,
      fetchTask,
      fetchSubmission,
    ]
  );

  useEffect(() => {
    if (student) {
      loadPage();
    }
  }, [student, loadPage]);

  /* =======================================================
     FILE VALIDATION
  ======================================================= */

  const handleFiles = useCallback(
    (event) => {
      const incoming = Array.from(
        event.target.files || []
      );

      if (!incoming.length) {
        return;
      }

      setError("");
      setSuccess("");

      const validFiles = [];

      for (const file of incoming) {
        if (
          file.size > MAX_FILE_SIZE
        ) {
          setError(
            `${file.name} is larger than the 250 MB upload limit.`
          );

          continue;
        }

        validFiles.push(file);
      }

      setSelectedFiles((current) => {
        const combined = [
          ...current,
          ...validFiles,
        ];

        const unique = [];

        const seen = new Set();

        for (const file of combined) {
          const key = [
            file.name,
            file.size,
            file.lastModified,
          ].join("-");

          if (!seen.has(key)) {
            seen.add(key);
            unique.push(file);
          }
        }

        if (unique.length > MAX_FILES) {
          setError(
            `You can upload a maximum of ${MAX_FILES} files.`
          );

          return unique.slice(0, MAX_FILES);
        }

        return unique;
      });

      event.target.value = "";
    },
    []
  );

  const removeFile = (index) => {
    setSelectedFiles((current) =>
      current.filter(
        (_, fileIndex) =>
          fileIndex !== index
      )
    );
  };

  /* =======================================================
     SUBMIT TASK
  ======================================================= */

  const submitTask = async () => {
    setError("");
    setSuccess("");

    if (!student) {
      setError(
        "Your student session has expired. Please sign in again."
      );

      return;
    }

    if (!taskId) {
      setError(
        "Task ID is missing."
      );

      return;
    }

    const identity =
      getStudentIdentity(student);

    if (
      !identity.studentId &&
      !identity.email
    ) {
      setError(
        "Your student ID or email address could not be found."
      );

      return;
    }

    if (
      !responseText.trim() &&
      selectedFiles.length === 0
    ) {
      setError(
        "Write your answer or attach at least one file before submitting."
      );

      return;
    }

    if (
      selectedFiles.length > MAX_FILES
    ) {
      setError(
        `You can upload a maximum of ${MAX_FILES} files.`
      );

      return;
    }

    const totalSize =
      selectedFiles.reduce(
        (total, file) =>
          total + file.size,
        0
      );

    if (
      selectedFiles.some(
        (file) =>
          file.size > MAX_FILE_SIZE
      )
    ) {
      setError(
        "One or more files exceed the 250 MB upload limit."
      );

      return;
    }

    if (
      totalSize >
      MAX_FILES * MAX_FILE_SIZE
    ) {
      setError(
        "The selected files exceed the allowed upload size."
      );

      return;
    }

    try {
      setSubmitting(true);

      const formData =
        new FormData();

      formData.append(
        "taskId",
        taskId
      );

      formData.append(
        "responseText",
        responseText.trim()
      );

      if (identity.studentId) {
        formData.append(
          "studentId",
          identity.studentId
        );
      }

      if (identity.email) {
        formData.append(
          "email",
          identity.email
        );
      }

      if (identity.enrollmentId) {
        formData.append(
          "enrollmentId",
          identity.enrollmentId
        );
      }

      if (identity.reference) {
        formData.append(
          "studentReference",
          identity.reference
        );
      }

      if (identity.name) {
        formData.append(
          "studentName",
          identity.name
        );
      }

      /*
        IMPORTANT:
        The backend expects each uploaded file under
        the multipart field name "files".
      */

      selectedFiles.forEach((file) => {
        formData.append(
          "files",
          file
        );
      });

      console.log(
        "Submitting student task:",
        {
          url: SUBMISSIONS_URL,
          taskId,
          studentId: identity.studentId,
          email: identity.email,
          fileCount: selectedFiles.length,
        }
      );

      const response =
        await fetch(
          SUBMISSIONS_URL,
          {
            method: "POST",

            headers:
              getStudentHeaders(),

            credentials: "include",

            /*
              Do not manually set Content-Type.
              The browser must generate the multipart
              boundary for FormData.
            */

            body: formData,
          }
        );

      const data =
        await readResponse(response);

      console.log(
        "Student submission response:",
        {
          status: response.status,
          ok: response.ok,
          data,
        }
      );

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            `Submission failed (${response.status}).`
        );
      }

      const returned =
        data?.submission ||
        data?.data?.submission ||
        data?.data ||
        data;

      const normalized =
        normalizeSubmission(
          returned
        );

      if (normalized) {
        setSubmission({
          ...normalized,

          taskId:
            normalized.taskId ||
            taskId,

          responseText:
            normalized.responseText ||
            responseText.trim(),

          status:
            normalized.status ||
            "submitted",

          attachments:
            normalized.attachments ||
            [],
        });
      } else {
        setSubmission({
          id:
            data?.submissionId ||
            data?.submission_id ||
            `submission-${Date.now()}`,

          taskId,

          responseText:
            responseText.trim(),

          status: "submitted",

          submittedAt:
            new Date().toISOString(),

          attachments: [],
        });
      }

      setSelectedFiles([]);

      setSuccess(
        data?.message ||
          "Your task has been submitted successfully."
      );

      /*
        Refresh the submission from the database.
      */

      try {
        await fetchSubmission();
      } catch (refreshError) {
        console.warn(
          "Submission saved, but refreshing its details failed:",
          refreshError
        );
      }
    } catch (err) {
      console.error(
        "Student task submission error:",
        err
      );

      const message =
        getErrorMessage(err);

      if (
        message === "Failed to fetch"
      ) {
        setError(
          `Unable to connect to the Academy server at ${SUBMISSIONS_URL}. Check that your backend is running, that VITE_API_URL is correct, and that the backend allows requests from your frontend through CORS.`
        );
      } else {
        setError(message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  /* =======================================================
     STATUS
  ======================================================= */

  const status = clean(
    submission?.status
  ).toLowerCase();

  const isGraded = [
    "graded",
    "reviewed",
    "completed",
  ].includes(status);

  const isReturned =
    status === "returned";

  const isSubmitted =
    Boolean(submission);

  const dueDate =
    task?.dueAt;

  const overdue =
    dueDate &&
    isPastDue(dueDate) &&
    !isSubmitted;

  const taskAttachments =
    task?.attachments || [];

  const submittedAttachments =
    submission?.attachments || [];

  const studentIdentity =
    useMemo(
      () =>
        getStudentIdentity(student),
      [student]
    );

  /* =======================================================
     RENDER
  ======================================================= */

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#020617] text-slate-100">
        <div className="text-center">
          <Loader2
            size={34}
            className="mx-auto animate-spin text-cyan-400"
          />

          <p className="mt-4 text-sm text-slate-400">
            Loading your task...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">

        {/* HEADER */}

        <div className="mb-7">
          <button
            type="button"
            onClick={() => {
              if (window.history.length > 1) {
                window.history.back();
              } else {
                window.location.href =
                  "/academy/student/tasks";
              }
            }}
            className="mb-6 inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-cyan-500/30 hover:text-white"
          >
            <ArrowLeft size={16} />
            Back to tasks
          </button>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-cyan-400">
                <BookOpen size={18} />

                <span className="text-xs font-bold uppercase tracking-[0.2em]">
                  Student Academy
                </span>
              </div>

              <h1 className="text-2xl font-bold text-white sm:text-3xl">
                {task?.title || "Task Submission"}
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                Read the task instructions, prepare your answer,
                and submit your work to your tutor.
              </p>
            </div>

            <button
              type="button"
              onClick={loadPage}
              disabled={
                taskLoading ||
                submissionLoading
              }
              className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 text-sm font-semibold text-slate-300 hover:bg-slate-800 disabled:opacity-50"
            >
              <Loader2
                size={15}
                className={
                  taskLoading ||
                  submissionLoading
                    ? "animate-spin"
                    : "hidden"
                }
              />

              <span>
                Refresh
              </span>
            </button>
          </div>
        </div>

        {/* ERROR */}

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-4">
            <AlertCircle
              size={19}
              className="mt-0.5 shrink-0 text-red-400"
            />

            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-red-300">
                Something went wrong
              </p>

              <p className="mt-1 break-words text-sm leading-6 text-red-200/70">
                {error}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setError("")}
              className="text-red-300 hover:text-white"
            >
              <X size={17} />
            </button>
          </div>
        )}

        {/* SUCCESS */}

        {success && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">
            <CheckCircle2
              size={19}
              className="mt-0.5 shrink-0 text-emerald-400"
            />

            <div className="flex-1">
              <p className="text-sm font-semibold text-emerald-300">
                Success
              </p>

              <p className="mt-1 text-sm text-emerald-200/70">
                {success}
              </p>
            </div>
          </div>
        )}

        {/* STUDENT DETAILS */}

        {student && (
          <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-slate-800 bg-[#071426] p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
                <User size={20} />
              </div>

              <div>
                <p className="text-sm font-semibold text-white">
                  {studentIdentity.name || "Student"}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  {studentIdentity.email || "Student account"}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {studentIdentity.className && (
                <span className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-400">
                  {studentIdentity.className}
                </span>
              )}

              {studentIdentity.reference && (
                <span className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-400">
                  {studentIdentity.reference}
                </span>
              )}
            </div>
          </div>
        )}

        {/* TASK DETAILS */}

        {task && (
          <div className="mb-6 rounded-2xl border border-slate-800 bg-[#071426] p-5 sm:p-6">
            <div className="mb-5 flex flex-wrap items-center gap-2">
              {task.subject && (
                <InfoBadge
                  icon={<BookOpen size={13} />}
                  text={task.subject}
                />
              )}

              {task.grade && (
                <InfoBadge
                  icon={<GraduationCap size={13} />}
                  text={task.grade}
                />
              )}

              <InfoBadge
                icon={<Award size={13} />}
                text={`Maximum score: ${task.maxScore}`}
              />
            </div>

            <h2 className="text-xl font-bold text-white">
              {task.title}
            </h2>

            {task.description && (
              <div className="mt-4">
                <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                  Description
                </p>

                <p className="whitespace-pre-wrap text-sm leading-7 text-slate-300">
                  {task.description}
                </p>
              </div>
            )}

            {task.instructions && (
              <div className="mt-5 rounded-xl border border-cyan-500/10 bg-[#020617] p-4">
                <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                  Instructions
                </p>

                <p className="whitespace-pre-wrap text-sm leading-7 text-slate-300">
                  {task.instructions}
                </p>
              </div>
            )}

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <TaskMeta
                icon={<CalendarDays size={15} />}
                label="Due date"
                value={formatDateTime(task.dueAt)}
              />

              <TaskMeta
                icon={<Clock3 size={15} />}
                label="Maximum score"
                value={`${task.maxScore} marks`}
              />
            </div>

            {overdue && (
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-300">
                <AlertCircle size={16} />
                This task is past its due date.
              </div>
            )}
          </div>
        )}

        {/* TASK ATTACHMENTS */}

        {taskAttachments.length > 0 && (
          <div className="mb-6 rounded-2xl border border-slate-800 bg-[#071426] p-5">
            <div className="mb-4 flex items-center gap-2">
              <Paperclip
                size={18}
                className="text-cyan-400"
              />

              <h2 className="text-sm font-semibold text-white">
                Materials provided by your tutor
              </h2>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {taskAttachments.map(
                (file, index) => (
                  <AttachmentCard
                    key={`task-${index}`}
                    file={file}
                    index={index}
                  />
                )
              )}
            </div>
          </div>
        )}

        {/* EXISTING SUBMISSION STATUS */}

        {submission && (
          <div className="mb-6 rounded-2xl border border-slate-800 bg-[#071426] p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Your submission status
                </p>

                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full border px-3 py-1.5 text-xs font-bold ${
                      isGraded
                        ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                        : isReturned
                        ? "border-amber-400/20 bg-amber-400/10 text-amber-300"
                        : "border-cyan-400/20 bg-cyan-400/10 text-cyan-300"
                    }`}
                  >
                    {isGraded
                      ? "Graded"
                      : isReturned
                      ? "Returned"
                      : "Submitted"}
                  </span>

                  <span className="text-xs text-slate-500">
                    {formatDateTime(
                      submission.submittedAt
                    )}
                  </span>
                </div>
              </div>

              {submission.score !== null &&
                submission.score !== undefined && (
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3">
                    <p className="text-[10px] font-bold uppercase text-slate-500">
                      Your score
                    </p>

                    <p className="mt-1 text-xl font-bold text-emerald-300">
                      {submission.score}/{task?.maxScore || 100}
                    </p>
                  </div>
                )}
            </div>

            {submission.feedback && (
              <div className="mt-4 rounded-xl border border-slate-800 bg-[#020617] p-4">
                <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-400">
                  <MessageSquare size={14} />
                  Tutor feedback
                </p>

                <p className="whitespace-pre-wrap text-sm leading-6 text-slate-300">
                  {submission.feedback}
                </p>
              </div>
            )}

            {submittedAttachments.length > 0 && (
              <div className="mt-5">
                <p className="mb-3 text-xs font-semibold text-slate-400">
                  Previously submitted files
                </p>

                <div className="grid gap-3 sm:grid-cols-2">
                  {submittedAttachments.map(
                    (file, index) => (
                      <AttachmentCard
                        key={`submitted-${index}`}
                        file={file}
                        index={index}
                      />
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* SUBMISSION FORM */}

        {!isGraded && (
          <div className="rounded-2xl border border-slate-800 bg-[#071426] p-5 sm:p-6">
            <div className="mb-5">
              <div className="mb-2 flex items-center gap-2">
                <Send
                  size={18}
                  className="text-cyan-400"
                />

                <h2 className="text-base font-bold text-white">
                  {submission
                    ? "Update your submission"
                    : "Submit your task"}
                </h2>
              </div>

              <p className="text-sm leading-6 text-slate-500">
                Write your answer below or attach your completed work.
              </p>
            </div>

            <label className="mb-5 block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                Your answer
              </span>

              <textarea
                value={responseText}
                onChange={(event) =>
                  setResponseText(
                    event.target.value
                  )
                }
                rows={9}
                disabled={submitting}
                placeholder="Type your answer or explain the work you have completed..."
                className="w-full resize-y rounded-xl border border-slate-700 bg-[#020617] px-4 py-3 text-sm leading-7 text-white outline-none placeholder:text-slate-600 focus:border-cyan-500/50 disabled:opacity-60"
              />
            </label>

            {/* FILE UPLOAD */}

            <div className="mb-5">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Attach your work
                </span>

                <span className="text-[11px] text-slate-600">
                  Maximum {MAX_FILES} files · 250 MB per file
                </span>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept={ACCEPTED_FILE_TYPES.join(",")}
                onChange={handleFiles}
                disabled={
                  submitting ||
                  selectedFiles.length >= MAX_FILES
                }
                className="hidden"
              />

              <button
                type="button"
                onClick={() =>
                  fileInputRef.current?.click()
                }
                disabled={
                  submitting ||
                  selectedFiles.length >= MAX_FILES
                }
                className="flex min-h-[130px] w-full flex-col items-center justify-center rounded-2xl border border-dashed border-slate-700 bg-[#020617] px-5 py-6 text-center transition hover:border-cyan-500/40 hover:bg-cyan-500/[0.03] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
                  <Upload size={21} />
                </div>

                <p className="mt-3 text-sm font-semibold text-slate-200">
                  Click to select files
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  PDF, Word, PowerPoint, Excel, images, videos and ZIP
                </p>
              </button>

              {selectedFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  {selectedFiles.map(
                    (file, index) => (
                      <div
                        key={`${file.name}-${file.lastModified}-${index}`}
                        className="flex items-center gap-3 rounded-xl border border-slate-800 bg-[#020617] p-3"
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-cyan-300">
                          <FileText size={17} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-semibold text-slate-200">
                            {file.name}
                          </p>

                          <p className="mt-1 text-[10px] text-slate-500">
                            {formatFileSize(file.size)}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            removeFile(index)
                          }
                          disabled={submitting}
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-500 hover:bg-red-500/10 hover:text-red-300 disabled:opacity-50"
                          title="Remove file"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>

            {/* SUBMIT BUTTON */}

            <button
              type="button"
              onClick={submitTask}
              disabled={submitting}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-cyan-500 px-5 text-sm font-bold text-[#020617] transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:min-w-[220px]"
            >
              {submitting ? (
                <>
                  <Loader2
                    size={17}
                    className="animate-spin"
                  />

                  Submitting...
                </>
              ) : (
                <>
                  <Send size={17} />

                  {submission
                    ? "Update submission"
                    : "Submit task"}
                </>
              )}
            </button>

            <p className="mt-3 text-[11px] leading-5 text-slate-600">
              Ensure your answer and attachments are correct before submitting.
            </p>
          </div>
        )}

        {/* GRADED NOTICE */}

        {isGraded && (
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5">
            <div className="flex items-start gap-3">
              <CheckCircle2
                size={22}
                className="mt-0.5 shrink-0 text-emerald-400"
              />

              <div>
                <h3 className="font-semibold text-emerald-300">
                  Your task has been graded
                </h3>

                <p className="mt-1 text-sm leading-6 text-slate-400">
                  Your tutor has reviewed this submission. Check the feedback above.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   INFO BADGE
========================================================= */

function InfoBadge({
  icon,
  text,
}) {
  if (!text) {
    return null;
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1.5 text-[11px] font-medium text-slate-400">
      {icon}
      {text}
    </span>
  );
}

/* =========================================================
   TASK META
========================================================= */

function TaskMeta({
  icon,
  label,
  value,
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-[#020617] p-3">
      <div className="flex items-center gap-2 text-slate-500">
        {icon}

        <span className="text-[10px] font-bold uppercase tracking-wider">
          {label}
        </span>
      </div>

      <p className="mt-1 text-xs font-semibold text-slate-300">
        {value}
      </p>
    </div>
  );
}

/* =========================================================
   ATTACHMENT CARD
========================================================= */

function AttachmentCard({
  file,
  index,
}) {
  const name =
    getFileName(file, index);

  const url =
    getFileUrl(file);

  const type =
    getFileType(file);

  const Icon =
    type === "image"
      ? ImageIcon
      : type === "video"
      ? Video
      : FileText;

  return (
    <div className="overflow-hidden rounded-xl border border-slate-800 bg-[#020617]">
      {type === "image" && url ? (
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="block border-b border-slate-800 bg-black"
        >
          <img
            src={url}
            alt={name}
            loading="lazy"
            className="h-40 w-full object-contain"
          />
        </a>
      ) : type === "video" && url ? (
        <div className="border-b border-slate-800 bg-black p-2">
          <video
            src={url}
            controls
            preload="metadata"
            className="h-40 w-full rounded-lg object-contain"
          />
        </div>
      ) : (
        <div className="flex h-28 items-center justify-center border-b border-slate-800 bg-[#061121]">
          <Icon
            size={35}
            className={
              type === "pdf"
                ? "text-red-400"
                : "text-slate-600"
            }
          />
        </div>
      )}

      <div className="flex items-center gap-3 p-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-cyan-300">
          <Icon size={17} />
        </div>

        <div className="min-w-0 flex-1">
          <p
            className="truncate text-xs font-semibold text-slate-200"
            title={name}
          >
            {name}
          </p>

          <p className="mt-1 text-[10px] uppercase text-slate-600">
            {type}
          </p>
        </div>

        {url && (
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            download
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-cyan-300"
            title="Download attachment"
          >
            <Download size={15} />
          </a>
        )}
      </div>
    </div>
  );
}