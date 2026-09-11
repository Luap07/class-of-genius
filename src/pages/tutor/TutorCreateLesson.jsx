import React, { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  File,
  FileText,
  Image as ImageIcon,
  Loader2,
  PlayCircle,
  Plus,
  Save,
  Trash2,
  Upload,
  Video,
  X,
} from "lucide-react";

/* =========================================================
   API
========================================================= */

const API_BASE_URL = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000"
).replace(/\/$/, "");

const LESSONS_URL =
  `${API_BASE_URL}/api/academy/tutor/lessons`;

/* =========================================================
   CLASS LISTS
========================================================= */

const PRIMARY_GRADES = [
  "Primary 1",
  "Primary 2",
  "Primary 3",
  "Primary 4",
  "Primary 5",
  "Primary 6",
];

const JSS_CLASSES = [
  "JSS 1",
  "JSS 2",
  "JSS 3",
];

const SSS_CLASSES = [
  "SSS 1",
  "SSS 2",
  "SSS 3",
];

/* =========================================================
   SUBJECTS
========================================================= */

const SUBJECTS = [
  "Mathematics",
  "English Language",
  "Basic Science",
  "Basic Technology",
  "Social Studies",
  "Civic Education",
  "Computer Studies",
  "Agricultural Science",
  "Home Economics",
  "Physical and Health Education",
  "Christian Religious Studies",
  "Islamic Religious Studies",
  "Biology",
  "Chemistry",
  "Physics",
  "Economics",
  "Government",
  "Geography",
  "Literature in English",
  "Commerce",
  "Accounting",
  "Further Mathematics",
  "French",
  "Data Processing",
  "History",
  "Technical Drawing",
  "Food and Nutrition",
  "Marketing",
  "Other",
];

/* =========================================================
   FILE TYPES
========================================================= */

const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/webm",
  "video/quicktime",
]);

const MAX_FILE_SIZE = 250 * 1024 * 1024;
const MAX_FILES = 10;

/* =========================================================
   HELPERS
========================================================= */

const getStoredUser = () => {
  const keys = [
    "scholiqen_academy_user",
    "academy_user",
    "scholiqen_user",
    "user",
  ];

  for (const key of keys) {
    try {
      const raw = localStorage.getItem(key);

      if (!raw) {
        continue;
      }

      const parsed = JSON.parse(raw);

      if (parsed) {
        return parsed;
      }
    } catch {
      // Continue checking other storage keys.
    }
  }

  return null;
};

/* =========================================================
   GET TUTOR REFERENCE
========================================================= */

const getTutorReference = () => {
  const user = getStoredUser();

  if (!user) {
    return "";
  }

  const reference =
    user.reference ||
    user.tutorReference ||
    user.tutor_reference ||
    user.academyReference ||
    user.academy_reference ||
    user.id ||
    user.user_id ||
    user.userId ||
    user.profile?.reference ||
    user.profile?.tutorReference ||
    user.profile?.tutor_reference ||
    user.tutor?.reference ||
    user.tutor?.tutorReference ||
    user.tutor?.tutor_reference ||
    "";

  return String(reference).trim();
};

/* =========================================================
   GET TUTOR NAME
========================================================= */

const getTutorName = () => {
  const user = getStoredUser();

  if (!user) {
    return "Tutor";
  }

  return (
    user.name ||
    user.full_name ||
    user.fullName ||
    user.displayName ||
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.profile?.name ||
    "Tutor"
  );
};

/* =========================================================
   FILE SIZE
========================================================= */

const formatFileSize = (bytes) => {
  if (!bytes) {
    return "0 B";
  }

  const units = [
    "B",
    "KB",
    "MB",
    "GB",
  ];

  const index = Math.floor(
    Math.log(bytes) / Math.log(1024)
  );

  return `${(
    bytes / Math.pow(1024, index)
  ).toFixed(index === 0 ? 0 : 1)} ${
    units[index] || "GB"
  }`;
};

/* =========================================================
   FILE ICON
========================================================= */

const getFileIcon = (file) => {
  if (!file) {
    return <File size={20} />;
  }

  const type = file.type || "";
  const name = file.name || "";

  if (type.startsWith("video/")) {
    return <Video size={20} />;
  }

  if (type.startsWith("image/")) {
    return <ImageIcon size={20} />;
  }

  if (
    type === "application/pdf" ||
    name.toLowerCase().endsWith(".pdf")
  ) {
    return <FileText size={20} />;
  }

  if (
    type.includes("word") ||
    name.toLowerCase().endsWith(".doc") ||
    name.toLowerCase().endsWith(".docx")
  ) {
    return <FileText size={20} />;
  }

  return <File size={20} />;
};

/* =========================================================
   FILE VALIDATION
========================================================= */

const isAllowedFile = (file) => {
  if (!file) {
    return false;
  }

  const extension =
    file.name
      ?.split(".")
      .pop()
      ?.toLowerCase();

  const allowedExtensions = new Set([
    "pdf",
    "doc",
    "docx",
    "jpg",
    "jpeg",
    "png",
    "webp",
    "gif",
    "mp4",
    "webm",
    "mov",
  ]);

  /*
    Some browsers may provide an empty MIME type.
    We therefore accept a valid extension as well.
  */

  if (
    file.type &&
    ALLOWED_MIME_TYPES.has(file.type)
  ) {
    return true;
  }

  return allowedExtensions.has(
    extension
  );
};

/* =========================================================
   READ BACKEND ERROR
========================================================= */

const getResponseMessage = (
  data,
  response
) => {
  /*
    IMPORTANT:
    The backend may return:

    {
      success: false,
      message: "Unable to create lesson.",
      error: "actual database error"
    }

    Always prefer the detailed error.
  */

  if (data?.error) {
    return String(data.error);
  }

  if (data?.message) {
    return String(data.message);
  }

  if (data?.details) {
    return String(data.details);
  }

  if (response) {
    return `Unable to create lesson. Server returned ${response.status} ${response.statusText}.`;
  }

  return "Unable to create lesson.";
};

/* =========================================================
   RESPONSE JSON
========================================================= */

const readResponse = async (response) => {
  const contentType =
    response.headers.get(
      "content-type"
    ) || "";

  if (
    contentType.includes(
      "application/json"
    )
  ) {
    return response.json().catch(() => ({}));
  }

  const text = await response
    .text()
    .catch(() => "");

  return {
    success: response.ok,
    message: text,
  };
};

/* =========================================================
   COMPONENT
========================================================= */

export default function TutorCreateLesson() {
  const navigate = useNavigate();

  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    content: "",
    className: "",
    subject: "",
  });

  const [files, setFiles] = useState([]);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const tutorName = useMemo(
    () => getTutorName(),
    []
  );

  /* =======================================================
     FORM CHANGE
  ======================================================= */

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  /* =======================================================
     FILE SELECT
  ======================================================= */

  const handleFileSelect = (event) => {
    const selectedFiles =
      Array.from(
        event.target.files || []
      );

    if (!selectedFiles.length) {
      return;
    }

    setError("");
    setSuccess("");

    /* -----------------------------------------------------
       VALID TYPES
    ----------------------------------------------------- */

    const invalidFiles =
      selectedFiles.filter(
        (file) =>
          !isAllowedFile(file)
      );

    if (invalidFiles.length) {
      setError(
        `Unsupported file type: ${invalidFiles
          .map(
            (file) => file.name
          )
          .join(", ")}`
      );

      event.target.value = "";
      return;
    }

    /* -----------------------------------------------------
       FILE SIZE
    ----------------------------------------------------- */

    const tooLarge =
      selectedFiles.find(
        (file) =>
          file.size >
          MAX_FILE_SIZE
      );

    if (tooLarge) {
      setError(
        `${tooLarge.name} is larger than the 250MB maximum file size.`
      );

      event.target.value = "";
      return;
    }

    /* -----------------------------------------------------
       MAX FILE COUNT
    ----------------------------------------------------- */

    const combined = [
      ...files,
      ...selectedFiles,
    ];

    if (
      combined.length >
      MAX_FILES
    ) {
      setError(
        `You can upload a maximum of ${MAX_FILES} files.`
      );

      event.target.value = "";
      return;
    }

    /* -----------------------------------------------------
       REMOVE DUPLICATES
    ----------------------------------------------------- */

    const existingKeys =
      new Set(
        files.map(
          (file) =>
            `${file.name}-${file.size}-${file.lastModified}`
        )
      );

    const uniqueNewFiles =
      selectedFiles.filter(
        (file) =>
          !existingKeys.has(
            `${file.name}-${file.size}-${file.lastModified}`
          )
      );

    setFiles((previous) => [
      ...previous,
      ...uniqueNewFiles,
    ]);

    event.target.value = "";
  };

  /* =======================================================
     REMOVE FILE
  ======================================================= */

  const removeFile = (index) => {
    setFiles((previous) =>
      previous.filter(
        (_file, fileIndex) =>
          fileIndex !== index
      )
    );

    setError("");
    setSuccess("");
  };

  /* =======================================================
     CLEAR FILES
  ======================================================= */

  const clearFiles = () => {
    setFiles([]);

    setError("");
    setSuccess("");
  };

  /* =======================================================
     VALIDATION
  ======================================================= */

  const validate = () => {
    if (!form.className.trim()) {
      return "Class is required.";
    }

    if (!form.subject.trim()) {
      return "Subject is required.";
    }

    if (!form.title.trim()) {
      return "Lesson title is required.";
    }

    if (!form.content.trim()) {
      return "Lesson content is required.";
    }

    return "";
  };

  /* =======================================================
     SUBMIT
  ======================================================= */

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    /* -----------------------------------------------------
       FRONTEND VALIDATION
    ----------------------------------------------------- */

    const validationError =
      validate();

    if (validationError) {
      setError(
        validationError
      );
      return;
    }

    /* -----------------------------------------------------
       TUTOR REFERENCE
    ----------------------------------------------------- */

    const tutorReference =
      getTutorReference();

    if (!tutorReference) {
      setError(
        "Tutor account information could not be found. Please log in again."
      );
      return;
    }

    try {
      setSaving(true);

      /* ---------------------------------------------------
         FORM DATA
      --------------------------------------------------- */

      const formData =
        new FormData();

      formData.append(
        "reference",
        tutorReference
      );

      formData.append(
        "tutorReference",
        tutorReference
      );

      formData.append(
        "tutor_reference",
        tutorReference
      );

      formData.append(
        "title",
        form.title.trim()
      );

      formData.append(
        "description",
        form.description.trim()
      );

      formData.append(
        "content",
        form.content.trim()
      );

      formData.append(
        "subject",
        form.subject.trim()
      );

      formData.append(
        "class_name",
        form.className.trim()
      );

      formData.append(
        "className",
        form.className.trim()
      );

      formData.append(
        "status",
        "published"
      );

      files.forEach((file) => {
        formData.append(
          "files",
          file,
          file.name
        );
      });

      /* ---------------------------------------------------
         DEBUG
      --------------------------------------------------- */

      console.log(
        "Creating Academy lesson..."
      );

      console.log(
        "Lesson endpoint:",
        LESSONS_URL
      );

      console.log(
        "Tutor reference:",
        tutorReference
      );

      console.log(
        "Class:",
        form.className
      );

      console.log(
        "Subject:",
        form.subject
      );

      console.log(
        "Files:",
        files.map(
          (file) => ({
            name: file.name,
            type: file.type,
            size: file.size,
          })
        )
      );

      /* ---------------------------------------------------
         REQUEST
      --------------------------------------------------- */

      const response =
        await fetch(
          LESSONS_URL,
          {
            method: "POST",
            body: formData,
          }
        );

      /* ---------------------------------------------------
         READ RESPONSE
      --------------------------------------------------- */

      const data =
        await readResponse(
          response
        );

      console.log(
        "Lesson create response:",
        {
          status:
            response.status,
          ok:
            response.ok,
          data,
        }
      );

      /* ---------------------------------------------------
         ERROR
      --------------------------------------------------- */

      if (!response.ok) {
        throw new Error(
          getResponseMessage(
            data,
            response
          )
        );
      }

      if (
        data?.success === false
      ) {
        throw new Error(
          getResponseMessage(
            data,
            response
          )
        );
      }

      /* ---------------------------------------------------
         SUCCESS
      --------------------------------------------------- */

      setSuccess(
        data?.message ||
          "Lesson created successfully."
      );

      setForm({
        title: "",
        description: "",
        content: "",
        className: "",
        subject: "",
      });

      setFiles([]);

      /* ---------------------------------------------------
         REDIRECT
      --------------------------------------------------- */

      window.setTimeout(
        () => {
          navigate(
            "/academy/tutor/lessons"
          );
        },
        900
      );
    } catch (submitError) {
      console.error(
        "Create lesson error:",
        submitError
      );

      let message =
        submitError?.message ||
        "Unable to create lesson.";

      /*
        If browser/network error occurs,
        make it clearer.
      */

      if (
        message ===
        "Failed to fetch"
      ) {
        message =
          `Unable to connect to the Academy server at ${API_BASE_URL}. Make sure the backend is running and VITE_API_URL is correct.`;
      }

      setError(message);
    } finally {
      setSaving(false);
    }
  };

  /* =======================================================
     UI
  ======================================================= */

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100">
      <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">

        {/* =================================================
            TOP BAR
        ================================================= */}

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/academy/tutor/lessons"
                )
              }
              className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-800 bg-[#071426] text-slate-300 transition hover:border-cyan-500/40 hover:text-cyan-300"
              aria-label="Back to lessons"
            >
              <ArrowLeft
                size={19}
              />
            </button>

            <div>

              <div className="mb-1 flex items-center gap-2">
                <BookOpen
                  size={18}
                  className="text-cyan-400"
                />

                <span className="text-sm font-medium text-cyan-400">
                  Academy Lessons
                </span>
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Create Lesson
              </h1>

              <p className="mt-1 text-sm text-slate-400">
                Create a lesson for a specific class and subject.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-[#071426] px-4 py-2.5">

            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-500/10 text-cyan-400">
              <BookOpen
                size={16}
              />
            </div>

            <div className="min-w-0">

              <p className="text-[11px] uppercase tracking-wider text-slate-500">
                Tutor
              </p>

              <p className="max-w-[180px] truncate text-sm font-medium text-slate-200">
                {tutorName}
              </p>

            </div>
          </div>
        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="mb-5 flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3.5 text-sm text-red-300">

            <X
              size={18}
              className="mt-0.5 shrink-0"
            />

            <div className="min-w-0 flex-1">

              <p className="font-medium text-red-200">
                Unable to create lesson
              </p>

              <p className="mt-1 break-words text-red-300">
                {error}
              </p>

            </div>
          </div>
        )}

        {/* =================================================
            SUCCESS
        ================================================= */}

        {success && (
          <div className="mb-5 flex items-start gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3.5 text-sm text-emerald-300">

            <CheckCircle2
              size={18}
              className="mt-0.5 shrink-0"
            />

            <span>
              {success}
            </span>

          </div>
        )}

        {/* =================================================
            FORM
        ================================================= */}

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >

          {/* =================================================
              CLASS + SUBJECT
          ================================================= */}

          <section className="rounded-2xl border border-slate-800 bg-[#071426] p-5 sm:p-6">

            <div className="mb-5">

              <h2 className="text-lg font-semibold text-white">
                Lesson Assignment
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Choose exactly which class and subject should receive this lesson.
              </p>

            </div>

            <div className="grid gap-5 md:grid-cols-2">

              {/* CLASS */}

              <div>

                <label
                  htmlFor="className"
                  className="mb-2 block text-sm font-medium text-slate-200"
                >
                  Class
                  <span className="ml-1 text-cyan-400">
                    *
                  </span>
                </label>

                <select
                  id="className"
                  name="className"
                  value={
                    form.className
                  }
                  onChange={
                    handleChange
                  }
                  className="w-full rounded-xl border border-slate-700 bg-[#020b18] px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/10"
                  required
                >

                  <option value="">
                    Select class
                  </option>

                  <optgroup label="Primary">

                    {PRIMARY_GRADES.map(
                      (grade) => (
                        <option
                          key={grade}
                          value={grade}
                        >
                          {grade}
                        </option>
                      )
                    )}

                  </optgroup>

                  <optgroup label="Junior Secondary">

                    {JSS_CLASSES.map(
                      (grade) => (
                        <option
                          key={grade}
                          value={grade}
                        >
                          {grade}
                        </option>
                      )
                    )}

                  </optgroup>

                  <optgroup label="Senior Secondary">

                    {SSS_CLASSES.map(
                      (grade) => (
                        <option
                          key={grade}
                          value={grade}
                        >
                          {grade}
                        </option>
                      )
                    )}

                  </optgroup>

                </select>

              </div>

              {/* SUBJECT */}

              <div>

                <label
                  htmlFor="subject"
                  className="mb-2 block text-sm font-medium text-slate-200"
                >
                  Subject
                  <span className="ml-1 text-cyan-400">
                    *
                  </span>
                </label>

                <select
                  id="subject"
                  name="subject"
                  value={
                    form.subject
                  }
                  onChange={
                    handleChange
                  }
                  className="w-full rounded-xl border border-slate-700 bg-[#020b18] px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/10"
                  required
                >

                  <option value="">
                    Select subject
                  </option>

                  {SUBJECTS.map(
                    (subject) => (
                      <option
                        key={subject}
                        value={subject}
                      >
                        {subject}
                      </option>
                    )
                  )}

                </select>

              </div>

            </div>

          </section>

          {/* =================================================
              INFORMATION
          ================================================= */}

          <section className="rounded-2xl border border-slate-800 bg-[#071426] p-5 sm:p-6">

            <div className="mb-5">

              <h2 className="text-lg font-semibold text-white">
                Lesson Information
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Give students a clear title and introduction to the lesson.
              </p>

            </div>

            <div className="space-y-5">

              {/* TITLE */}

              <div>

                <label
                  htmlFor="title"
                  className="mb-2 block text-sm font-medium text-slate-200"
                >
                  Lesson title
                  <span className="ml-1 text-cyan-400">
                    *
                  </span>
                </label>

                <input
                  id="title"
                  name="title"
                  type="text"
                  value={
                    form.title
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="e.g. Introduction to Quadratic Equations"
                  className="w-full rounded-xl border border-slate-700 bg-[#020b18] px-4 py-3 text-sm text-white placeholder:text-slate-600 outline-none transition focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/10"
                  maxLength={200}
                  required
                />

              </div>

              {/* DESCRIPTION */}

              <div>

                <label
                  htmlFor="description"
                  className="mb-2 block text-sm font-medium text-slate-200"
                >
                  Short description
                </label>

                <textarea
                  id="description"
                  name="description"
                  value={
                    form.description
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Briefly explain what students will learn in this lesson..."
                  rows={4}
                  maxLength={1000}
                  className="w-full resize-y rounded-xl border border-slate-700 bg-[#020b18] px-4 py-3 text-sm leading-6 text-white placeholder:text-slate-600 outline-none transition focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/10"
                />

                <p className="mt-1.5 text-right text-xs text-slate-600">
                  {
                    form.description
                      .length
                  }
                  /1000
                </p>

              </div>

            </div>

          </section>

          {/* =================================================
              CONTENT
          ================================================= */}

          <section className="rounded-2xl border border-slate-800 bg-[#071426] p-5 sm:p-6">

            <div className="mb-5">

              <h2 className="text-lg font-semibold text-white">
                Lesson Content
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Write the main lesson students will read and study.
              </p>

            </div>

            <div>

              <label
                htmlFor="content"
                className="mb-2 block text-sm font-medium text-slate-200"
              >
                Content
                <span className="ml-1 text-cyan-400">
                  *
                </span>
              </label>

              <textarea
                id="content"
                name="content"
                value={
                  form.content
                }
                onChange={
                  handleChange
                }
                placeholder={`Write your lesson here...

You can include:
• Explanations
• Definitions
• Examples
• Worked solutions
• Important notes
• Study instructions`}
                rows={18}
                className="w-full resize-y rounded-xl border border-slate-700 bg-[#020b18] px-4 py-4 text-sm leading-7 text-white placeholder:text-slate-600 outline-none transition focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/10"
                required
              />

              <p className="mt-2 text-xs text-slate-500">
                The lesson content will be displayed to students when they open the lesson.
              </p>

            </div>

          </section>

          {/* =================================================
              RESOURCES
          ================================================= */}

          <section className="rounded-2xl border border-slate-800 bg-[#071426] p-5 sm:p-6">

            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">

              <div>

                <h2 className="text-lg font-semibold text-white">
                  Lesson Resources
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  Attach PDFs, Word documents, images or videos for students.
                </p>

              </div>

              {files.length > 0 && (
                <button
                  type="button"
                  onClick={
                    clearFiles
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-400 transition hover:bg-red-500/10 hover:text-red-300"
                >
                  <Trash2
                    size={14}
                  />
                  Remove all
                </button>
              )}

            </div>

            {/* UPLOAD */}

            <button
              type="button"
              onClick={() =>
                fileInputRef.current?.click()
              }
              className="group flex w-full flex-col items-center justify-center rounded-2xl border border-dashed border-slate-700 bg-[#020b18] px-5 py-10 text-center transition hover:border-cyan-500/50 hover:bg-cyan-500/[0.03]"
            >

              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400 transition group-hover:bg-cyan-500/15">
                <Upload
                  size={24}
                />
              </div>

              <p className="text-sm font-semibold text-slate-200">
                Upload lesson resources
              </p>

              <p className="mt-1 max-w-md text-xs leading-5 text-slate-500">
                PDF, DOC, DOCX, JPG, PNG, WEBP, GIF, MP4, WEBM and MOV.
                Maximum 10 files and 250MB per file.
              </p>

              <span className="mt-4 inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-[#071426] px-4 py-2 text-xs font-medium text-slate-300">
                <Plus
                  size={14}
                />
                Choose files
              </span>

            </button>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp,.gif,.mp4,.webm,.mov"
              onChange={
                handleFileSelect
              }
              className="hidden"
            />

            {/* FILE LIST */}

            {files.length > 0 && (
              <div className="mt-5 space-y-2">

                <div className="mb-2 flex items-center justify-between">

                  <p className="text-sm font-medium text-slate-300">
                    Selected files
                  </p>

                  <p className="text-xs text-slate-500">
                    {files.length}/10 files
                  </p>

                </div>

                {files.map(
                  (
                    file,
                    index
                  ) => (
                    <div
                      key={`${file.name}-${file.size}-${file.lastModified}-${index}`}
                      className="flex items-center gap-3 rounded-xl border border-slate-800 bg-[#020b18] p-3"
                    >

                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400">
                        {getFileIcon(
                          file
                        )}
                      </div>

                      <div className="min-w-0 flex-1">

                        <p className="truncate text-sm font-medium text-slate-200">
                          {file.name}
                        </p>

                        <p className="mt-0.5 text-xs text-slate-500">
                          {formatFileSize(
                            file.size
                          )}
                        </p>

                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          removeFile(
                            index
                          )
                        }
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-red-500/10 hover:text-red-300"
                        aria-label={`Remove ${file.name}`}
                      >
                        <Trash2
                          size={16}
                        />
                      </button>

                    </div>
                  )
                )}

              </div>
            )}

          </section>

          {/* =================================================
              SUMMARY
          ================================================= */}

          <section className="rounded-2xl border border-cyan-500/10 bg-cyan-500/[0.03] p-5 sm:p-6">

            <div className="flex items-start gap-3">

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
                <PlayCircle
                  size={19}
                />
              </div>

              <div>

                <h3 className="text-sm font-semibold text-white">
                  Publishing this lesson
                </h3>

                <p className="mt-1 text-xs leading-5 text-slate-400">
                  Once created, the lesson is published and can be shown to students whose class and subject match the lesson.
                </p>

                <div className="mt-3 flex flex-wrap gap-2">

                  {form.className && (
                    <span className="rounded-full border border-slate-700 bg-[#071426] px-3 py-1 text-xs text-slate-300">
                      {form.className}
                    </span>
                  )}

                  {form.subject && (
                    <span className="rounded-full border border-cyan-500/20 bg-cyan-500/5 px-3 py-1 text-xs text-cyan-300">
                      {form.subject}
                    </span>
                  )}

                  {files.length > 0 && (
                    <span className="rounded-full border border-slate-700 bg-[#071426] px-3 py-1 text-xs text-slate-300">
                      {files.length} resource
                      {files.length !==
                      1
                        ? "s"
                        : ""}
                    </span>
                  )}

                </div>

              </div>

            </div>

          </section>

          {/* =================================================
              ACTIONS
          ================================================= */}

          <div className="flex flex-col-reverse gap-3 border-t border-slate-800 pt-6 sm:flex-row sm:justify-end">

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/academy/tutor/lessons"
                )
              }
              disabled={saving}
              className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-slate-700 bg-[#071426] px-5 text-sm font-medium text-slate-300 transition hover:border-slate-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              <X
                size={17}
              />
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-cyan-500 px-6 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
            >

              {saving ? (
                <>
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />
                  Creating lesson...
                </>
              ) : (
                <>
                  <Save
                    size={18}
                  />
                  Create Lesson
                </>
              )}

            </button>

          </div>

        </form>

      </div>
    </div>
  );
}
