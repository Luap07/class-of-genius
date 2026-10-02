import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  FileText,
  Upload,
  X,
  Trash2,
  Loader2,
} from "lucide-react";

/* =========================================================
   API
========================================================= */

const API_BASE_URL = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000"
).replace(/\/$/, "");

const ASSIGNMENT_URL =
  `${API_BASE_URL}/api/academy/tutor/assignments`;

/* =========================================================
   CLASS OPTIONS
========================================================= */

const CLASS_OPTIONS = [
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

/* =========================================================
   SUBJECT OPTIONS
========================================================= */

const PRIMARY_SUBJECTS = [
  "English Studies",
  "Mathematics",
  "Basic Science",
  "Social Studies",
  "Civic Education",
  "Computer Studies",
  "Agricultural Science",
  "Cultural and Creative Arts",
  "Physical and Health Education",
  "Religious Studies",
];

const JSS_SUBJECTS = [
  "English Language",
  "Mathematics",
  "Basic Science",
  "Basic Technology",
  "Social Studies",
  "Civic Education",
  "Computer Studies",
  "Agricultural Science",
  "Business Studies",
  "Home Economics",
  "Cultural and Creative Arts",
  "Christian Religious Studies",
  "Islamic Religious Studies",
];

const SS_SUBJECTS = [
  "English Language",
  "Mathematics",
  "Biology",
  "Chemistry",
  "Physics",
  "Economics",
  "Government",
  "Literature in English",
  "Civic Education",
  "Agricultural Science",
  "Commerce",
  "Financial Accounting",
  "Geography",
  "Computer Science",
  "Data Processing",
  "Christian Religious Studies",
  "Islamic Religious Studies",
  "Further Mathematics",
  "French",
];

/* =========================================================
   SUBJECT HELPER
========================================================= */

function getSubjectsForClass(grade = "") {
  if (grade.startsWith("Primary")) {
    return PRIMARY_SUBJECTS;
  }

  if (grade.startsWith("JSS")) {
    return JSS_SUBJECTS;
  }

  if (grade.startsWith("SS")) {
    return SS_SUBJECTS;
  }

  return [];
}

/* =========================================================
   STORAGE
========================================================= */

const TUTOR_STORAGE_KEYS = [
  "scholiqen_academy_user",
  "academy_user",
  "scholiqen_user",
  "user",
];

const TUTOR_TOKEN_KEYS = [
  "scholiqen_academy_token",
  "academy_token",
  "scholiqen_token",
  "access_token",
  "token",
];

/* =========================================================
   GET TUTOR USER
========================================================= */

function getTutorUser() {
  for (const key of TUTOR_STORAGE_KEYS) {
    try {
      const raw = localStorage.getItem(key);

      if (!raw) {
        continue;
      }

      const parsed = JSON.parse(raw);

      if (
        parsed &&
        typeof parsed === "object"
      ) {
        return parsed;
      }
    } catch {
      // Continue checking other storage keys.
    }
  }

  return null;
}

/* =========================================================
   GET TUTOR REFERENCE
========================================================= */

function getTutorReference() {
  const tutor = getTutorUser();

  const references = [
    tutor?.reference,
    tutor?.tutorReference,
    tutor?.tutor_reference,

    tutor?.user?.reference,
    tutor?.user?.tutorReference,
    tutor?.user?.tutor_reference,

    tutor?.tutor?.reference,
    tutor?.tutor?.tutorReference,
    tutor?.tutor?.tutor_reference,

    tutor?.applicationReference,
    tutor?.application_reference,
  ];

  const found = references.find(
    (value) =>
      value !== undefined &&
      value !== null &&
      String(value).trim() !== ""
  );

  if (found) {
    return String(found).trim();
  }

  for (const key of TUTOR_STORAGE_KEYS) {
    try {
      const raw = localStorage.getItem(key);

      if (!raw) {
        continue;
      }

      const parsed = JSON.parse(raw);

      const nestedReferences = [
        parsed?.reference,
        parsed?.tutorReference,
        parsed?.tutor_reference,
        parsed?.applicationReference,
        parsed?.application_reference,

        parsed?.user?.reference,
        parsed?.user?.tutorReference,
        parsed?.user?.tutor_reference,

        parsed?.tutor?.reference,
        parsed?.tutor?.tutorReference,
        parsed?.tutor?.tutor_reference,
      ];

      const reference =
        nestedReferences.find(
          (value) =>
            value !== undefined &&
            value !== null &&
            String(value).trim() !== ""
        );

      if (reference) {
        return String(reference).trim();
      }
    } catch {
      // Ignore invalid storage.
    }
  }

  return "";
}

/* =========================================================
   GET TOKEN
========================================================= */

function getAcademyToken() {
  for (const key of TUTOR_TOKEN_KEYS) {
    try {
      const token =
        localStorage.getItem(key);

      if (
        token &&
        String(token).trim() !== ""
      ) {
        return String(token).trim();
      }
    } catch {
      // Ignore storage errors.
    }
  }

  return "";
}

/* =========================================================
   COMPONENT
========================================================= */

export default function TutorCreateAssignment() {
  const navigate = useNavigate();

  const fileInputRef = useRef(null);

  /* =======================================================
     STATE
  ======================================================= */

  const [tutorReference, setTutorReference] =
    useState("");

  const [title, setTitle] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [instructions, setInstructions] =
    useState("");

  const [selectedClass, setSelectedClass] =
    useState("");

  const [subject, setSubject] =
    useState("");

  const [dueDate, setDueDate] =
    useState("");

  const [file, setFile] =
    useState(null);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  /* =======================================================
     SUBJECTS
  ======================================================= */

  const availableSubjects = useMemo(
    () =>
      getSubjectsForClass(
        selectedClass
      ),
    [selectedClass]
  );

  /* =======================================================
     LOAD TUTOR REFERENCE
  ======================================================= */

  useEffect(() => {
    const reference =
      getTutorReference();

    setTutorReference(reference);

    console.log(
      "Tutor reference loaded:",
      reference
    );
  }, []);

  /* =======================================================
     REFRESH TUTOR REFERENCE
  ======================================================= */

  const refreshTutorReference =
    useCallback(() => {
      const reference =
        getTutorReference();

      setTutorReference(reference);

      return reference;
    }, []);

  /* =======================================================
     CLASS CHANGE
  ======================================================= */

  const handleClassChange =
    useCallback((event) => {
      setSelectedClass(
        event.target.value
      );

      setSubject("");
      setError("");
    }, []);

  /* =======================================================
     FILE SELECTION
  ======================================================= */

  const handleFileChange =
    useCallback((event) => {
      const selectedFile =
        event.target.files?.[0];

      setError("");

      if (!selectedFile) {
        setFile(null);
        return;
      }

      /*
       * 250 MB maximum.
       */
      const maxSize =
        250 * 1024 * 1024;

      if (selectedFile.size > maxSize) {
        setError(
          "The assignment file cannot be larger than 250 MB."
        );

        event.target.value = "";
        setFile(null);

        return;
      }

      setFile(selectedFile);
    }, []);

  /* =======================================================
     REMOVE FILE
  ======================================================= */

  const removeFile =
    useCallback(() => {
      setFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }, []);

  /* =======================================================
     FORMAT FILE SIZE
  ======================================================= */

  const formatFileSize =
    useCallback((bytes) => {
      if (!bytes) {
        return "0 KB";
      }

      const units = [
        "B",
        "KB",
        "MB",
        "GB",
      ];

      const index = Math.min(
        Math.floor(
          Math.log(bytes) /
            Math.log(1024)
        ),
        units.length - 1
      );

      return `${(
        bytes /
        Math.pow(1024, index)
      ).toFixed(
        index === 0 ? 0 : 1
      )} ${units[index]}`;
    }, []);

  /* =======================================================
     VALIDATE
  ======================================================= */

  const validateForm =
    useCallback(() => {
      const reference =
        tutorReference ||
        refreshTutorReference();

      if (!reference) {
        return "Your tutor reference could not be found. Please log in again.";
      }

      if (
        title.trim().length < 3
      ) {
        return "Assignment title must be at least 3 characters.";
      }

      if (!selectedClass) {
        return "Please select a class.";
      }

      if (!subject) {
        return "Please select a subject.";
      }

      if (!file) {
        return "Please upload the assignment file.";
      }

      return "";
    }, [
      tutorReference,
      refreshTutorReference,
      title,
      selectedClass,
      subject,
      file,
    ]);

  /* =======================================================
     SUBMIT
  ======================================================= */

  const handleSubmit =
    async (event) => {
      event.preventDefault();

      setError("");
      setSuccess("");

      const validationError =
        validateForm();

      if (validationError) {
        setError(validationError);
        return;
      }

      const reference =
        tutorReference ||
        refreshTutorReference();

      if (!reference) {
        setError(
          "Tutor reference is missing. Please log in again."
        );

        return;
      }

      const token =
        getAcademyToken();

      setSaving(true);

      try {
        /*
         * IMPORTANT:
         *
         * This is now multipart/form-data
         * because the tutor is uploading an
         * actual assignment file.
         *
         * Do NOT manually set Content-Type.
         * The browser creates the multipart
         * boundary automatically.
         */
        const formData =
          new FormData();

        formData.append(
          "reference",
          reference
        );

        formData.append(
          "tutorReference",
          reference
        );

        formData.append(
          "tutor_reference",
          reference
        );

        formData.append(
          "title",
          title.trim()
        );

        formData.append(
          "description",
          description.trim()
        );

        formData.append(
          "instructions",
          instructions.trim()
        );

        formData.append(
          "class",
          selectedClass
        );

        formData.append(
          "grade",
          selectedClass
        );

        formData.append(
          "subject",
          subject
        );

        formData.append(
          "dueDate",
          dueDate || ""
        );

        formData.append(
          "due_date",
          dueDate || ""
        );

        formData.append(
          "activityType",
          "assignment"
        );

        formData.append(
          "activity_type",
          "assignment"
        );

        /*
         * The actual assignment file.
         */
        formData.append(
          "file",
          file
        );

        /*
         * Also send the same file name
         * under attachmentName for backend
         * compatibility.
         */
        formData.append(
          "attachmentName",
          file.name
        );

        console.log(
          "================================================"
        );

        console.log(
          "CREATING FILE ASSIGNMENT"
        );

        console.log(
          "Endpoint:",
          ASSIGNMENT_URL
        );

        console.log(
          "Tutor reference:",
          reference
        );

        console.log(
          "Class:",
          selectedClass
        );

        console.log(
          "Subject:",
          subject
        );

        console.log(
          "File:",
          {
            name: file.name,
            size: file.size,
            type: file.type,
          }
        );

        console.log(
          "================================================"
        );

        const headers = {
          Accept:
            "application/json",

          "x-tutor-reference":
            reference,

          "X-Tutor-Reference":
            reference,
        };

        if (token) {
          headers.Authorization =
            `Bearer ${token}`;

          headers[
            "x-academy-token"
          ] = token;
        }

        const response =
          await fetch(
            ASSIGNMENT_URL,
            {
              method: "POST",
              headers,
              body: formData,
            }
          );

        const responseText =
          await response.text();

        let data = null;

        try {
          data = responseText
            ? JSON.parse(
                responseText
              )
            : null;
        } catch {
          data = null;
        }

        console.log(
          "Create assignment response:",
          {
            status:
              response.status,
            ok: response.ok,
            data,
          }
        );

        if (!response.ok) {
          let message =
            data?.error ||
            data?.message ||
            "Unable to create assignment.";

          if (data?.details) {
            message +=
              ` ${data.details}`;
          }

          throw new Error(
            message
          );
        }

        if (
          data?.success === false
        ) {
          throw new Error(
            data?.error ||
              data?.message ||
              "The assignment was not created."
          );
        }

        setSuccess(
          data?.message ||
            "Assignment uploaded successfully."
        );

        /*
         * Clear form.
         */
        setTitle("");
        setDescription("");
        setInstructions("");
        setSelectedClass("");
        setSubject("");
        setDueDate("");
        setFile(null);

        if (fileInputRef.current) {
          fileInputRef.current.value =
            "";
        }

        /*
         * Give the success message
         * a moment before navigating.
         */
        setTimeout(() => {
          navigate(
            "/academy/tutor/assignments"
          );
        }, 1200);
      } catch (err) {
        console.error(
          "Create assignment error:",
          err
        );

        setError(
          err?.message ||
            "Unable to create assignment."
        );
      } finally {
        setSaving(false);
      }
    };

  /* =======================================================
     UI
  ======================================================= */

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      {/* =================================================
          HEADER
      ================================================= */}

      <div className="border-b border-slate-800 bg-[#071426]">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-5 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() =>
              navigate(-1)
            }
            disabled={saving}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-700 bg-slate-900 text-slate-300 transition hover:border-cyan-500 hover:text-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ArrowLeft size={19} />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <FileText
                size={20}
                className="text-cyan-400"
              />

              <h1 className="text-xl font-bold sm:text-2xl">
                Upload Assignment
              </h1>
            </div>

            <p className="mt-1 text-sm text-slate-400">
              Upload an assignment for
              your students to complete
              and submit.
            </p>
          </div>
        </div>
      </div>

      {/* =================================================
          CONTENT
      ================================================= */}

      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        {/* =================================================
            ALERTS
        ================================================= */}

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
            <X
              size={20}
              className="mt-0.5 shrink-0"
            />

            <div className="min-w-0">
              <p className="font-semibold">
                Unable to upload
                assignment
              </p>

              <p className="mt-1 break-words">
                {error}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setError("")
              }
              className="ml-auto shrink-0 rounded-lg p-1 transition hover:bg-red-500/10"
            >
              <X size={17} />
            </button>
          </div>
        )}

        {success && (
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-300">
            <CheckCircle2 size={20} />

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
              ASSIGNMENT DETAILS
          ================================================= */}

          <section className="rounded-2xl border border-slate-800 bg-[#071426] p-5 shadow-xl sm:p-6">
            <div className="mb-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
                  <FileText size={20} />
                </div>

                <div>
                  <h2 className="text-lg font-bold">
                    Assignment Details
                  </h2>

                  <p className="mt-1 text-sm text-slate-400">
                    Tell your students what
                    the assignment is about.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {/* TITLE */}

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Assignment Title
                </label>

                <input
                  type="text"
                  value={title}
                  onChange={(event) =>
                    setTitle(
                      event.target.value
                    )
                  }
                  disabled={saving}
                  placeholder="e.g. Biology Homework — Cell Structure"
                  className="w-full rounded-xl border border-slate-700 bg-[#020617] px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-500 disabled:opacity-50"
                />
              </div>

              {/* CLASS */}

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Class
                </label>

                <select
                  value={selectedClass}
                  onChange={
                    handleClassChange
                  }
                  disabled={saving}
                  className="w-full rounded-xl border border-slate-700 bg-[#020617] px-4 py-3 text-white outline-none transition focus:border-cyan-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">
                    Select class
                  </option>

                  {CLASS_OPTIONS.map(
                    (className) => (
                      <option
                        key={className}
                        value={className}
                      >
                        {className}
                      </option>
                    )
                  )}
                </select>
              </div>

              {/* SUBJECT */}

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Subject
                </label>

                <select
                  value={subject}
                  onChange={(event) =>
                    setSubject(
                      event.target.value
                    )
                  }
                  disabled={
                    !selectedClass ||
                    saving
                  }
                  className="w-full rounded-xl border border-slate-700 bg-[#020617] px-4 py-3 text-white outline-none transition focus:border-cyan-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">
                    {selectedClass
                      ? "Select subject"
                      : "Select class first"}
                  </option>

                  {availableSubjects.map(
                    (item) => (
                      <option
                        key={item}
                        value={item}
                      >
                        {item}
                      </option>
                    )
                  )}
                </select>
              </div>

              {/* DUE DATE */}

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Due Date
                  <span className="ml-2 text-xs text-slate-500">
                    Optional
                  </span>
                </label>

                <input
                  type="datetime-local"
                  value={dueDate}
                  onChange={(event) =>
                    setDueDate(
                      event.target.value
                    )
                  }
                  disabled={saving}
                  className="w-full rounded-xl border border-slate-700 bg-[#020617] px-4 py-3 text-white outline-none transition focus:border-cyan-500 disabled:opacity-50"
                />
              </div>

              {/* TUTOR REFERENCE */}

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Tutor Reference
                </label>

                <input
                  type="text"
                  value={
                    tutorReference ||
                    "Not found"
                  }
                  readOnly
                  className="w-full cursor-not-allowed rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-3 text-slate-400 outline-none"
                />
              </div>

              {/* DESCRIPTION */}

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Description
                  <span className="ml-2 text-xs text-slate-500">
                    Optional
                  </span>
                </label>

                <textarea
                  value={description}
                  onChange={(event) =>
                    setDescription(
                      event.target.value
                    )
                  }
                  disabled={saving}
                  rows={4}
                  placeholder="Describe the assignment..."
                  className="w-full resize-none rounded-xl border border-slate-700 bg-[#020617] px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-500 disabled:opacity-50"
                />
              </div>

              {/* INSTRUCTIONS */}

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Instructions
                  <span className="ml-2 text-xs text-slate-500">
                    Optional
                  </span>
                </label>

                <textarea
                  value={instructions}
                  onChange={(event) =>
                    setInstructions(
                      event.target.value
                    )
                  }
                  disabled={saving}
                  rows={4}
                  placeholder="Tell students exactly what they need to do..."
                  className="w-full resize-none rounded-xl border border-slate-700 bg-[#020617] px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-500 disabled:opacity-50"
                />
              </div>
            </div>
          </section>

          {/* =================================================
              FILE UPLOAD
          ================================================= */}

          <section className="rounded-2xl border border-slate-800 bg-[#071426] p-5 shadow-xl sm:p-6">
            <div className="mb-5">
              <h2 className="text-lg font-bold">
                Assignment File
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Upload the assignment your
                students will receive.
              </p>
            </div>

            {!file ? (
              <button
                type="button"
                onClick={() =>
                  fileInputRef.current?.click()
                }
                disabled={saving}
                className="group flex w-full flex-col items-center justify-center rounded-2xl border border-dashed border-slate-700 bg-[#020617] px-6 py-12 text-center transition hover:border-cyan-500/50 hover:bg-cyan-500/[0.03] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400 transition group-hover:bg-cyan-500/15">
                  <Upload size={25} />
                </div>

                <p className="mt-4 text-sm font-semibold text-white">
                  Click to upload assignment
                </p>

                <p className="mt-2 text-xs text-slate-500">
                  PDF, DOC, DOCX, PPT, PPTX,
                  XLS, XLSX, images, ZIP and
                  other supported files
                </p>

                <p className="mt-1 text-xs text-slate-600">
                  Maximum file size: 250 MB
                </p>
              </button>
            ) : (
              <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/[0.04] p-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
                    <FileText size={22} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-white">
                      {file.name}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {formatFileSize(
                        file.size
                      )}

                      {file.type
                        ? ` • ${file.type}`
                        : ""}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={
                      removeFile
                    }
                    disabled={saving}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-red-500/20 text-red-400 transition hover:bg-red-500/10 disabled:opacity-50"
                    title="Remove file"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              onChange={
                handleFileChange
              }
              disabled={saving}
              className="hidden"
            />

            {file && (
              <button
                type="button"
                onClick={() =>
                  fileInputRef.current?.click()
                }
                disabled={saving}
                className="mt-3 text-sm font-semibold text-cyan-400 transition hover:text-cyan-300 disabled:opacity-50"
              >
                Choose a different file
              </button>
            )}
          </section>

          {/* =================================================
              SUMMARY
          ================================================= */}

          <section className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-cyan-400">
                  Assignment Summary
                </p>

                <p className="mt-1 text-sm text-slate-400">
                  Students in the selected
                  class and subject will be
                  able to see this assignment
                  and submit their work.
                </p>
              </div>

              <div className="text-left sm:text-right">
                <p className="text-xs text-slate-500">
                  Class
                </p>

                <p className="font-semibold text-white">
                  {selectedClass ||
                    "Not selected"}
                </p>

                <p className="mt-2 text-xs text-slate-500">
                  Subject
                </p>

                <p className="font-semibold text-white">
                  {subject ||
                    "Not selected"}
                </p>

                <p className="mt-2 text-xs text-slate-500">
                  File
                </p>

                <p className="max-w-[220px] truncate font-semibold text-white">
                  {file?.name ||
                    "No file selected"}
                </p>
              </div>
            </div>
          </section>

          {/* =================================================
              ACTIONS
          ================================================= */}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() =>
                navigate(-1)
              }
              disabled={saving}
              className="rounded-xl border border-slate-700 bg-slate-900 px-6 py-3 text-sm font-semibold text-slate-300 transition hover:border-slate-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-7 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload size={18} />
                  Upload Assignment
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}