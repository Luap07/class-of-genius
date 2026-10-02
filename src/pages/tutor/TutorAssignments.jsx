// src/pages/academy/tutor/TutorAssignments.jsx

import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertCircle,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock3,
  Download,
  Edit3,
  Eye,
  File,
  FileText,
  Loader2,
  Paperclip,
  PlayCircle,
  RefreshCw,
  Search,
  Trash2,
  Upload,
  X,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

/* ============================================================
   CONFIG
============================================================ */

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

const ASSIGNMENTS_URL =
  `${API_BASE_URL}/api/academy/tutor/assignments`;

const MAX_FILE_SIZE =
  250 * 1024 * 1024;

const ACCEPTED_FILE_TYPES =
  ".pdf,.doc,.docx,.mp4,.webm,.mov";

/* ============================================================
   HELPERS
============================================================ */

const clean = (value) => {
  if (
    value === undefined ||
    value === null
  ) {
    return "";
  }

  return String(value).trim();
};

const getTutorReference = () => {
  const directKeys = [
    "tutorReference",
    "tutor_reference",
    "reference",
  ];

  for (const key of directKeys) {
    const value =
      clean(
        localStorage.getItem(key)
      );

    if (value) {
      return value;
    }
  }

  const objectKeys = [
    "scholiqen_academy_user",
    "academy_user",
    "scholiqen_user",
    "user",
    "tutor",
    "academyTutor",
  ];

  for (const key of objectKeys) {
    try {
      const raw =
        localStorage.getItem(key);

      if (!raw) continue;

      const parsed =
        JSON.parse(raw);

      const value =
        clean(
          parsed?.tutorReference ??
          parsed?.tutor_reference ??
          parsed?.reference ??
          parsed?.applicationReference ??
          parsed?.application_reference ??
          parsed?.id
        );

      if (value) {
        return value;
      }
    } catch {
      // Ignore malformed localStorage values.
    }
  }

  return "";
};

const getToken = () => {
  const tokenKeys = [
    "scholiqen_academy_token",
    "academy_token",
    "scholiqen_token",
    "access_token",
    "token",
  ];

  for (const key of tokenKeys) {
    const token =
      clean(
        localStorage.getItem(key)
      );

    if (token) {
      return token;
    }
  }

  return "";
};

const getTutorHeaders = () => {
  const reference =
    getTutorReference();

  const token =
    getToken();

  const headers = {
    Accept:
      "application/json",
  };

  if (reference) {
    headers[
      "x-tutor-reference"
    ] = reference;
  }

  if (token) {
    headers.Authorization =
      `Bearer ${token}`;
  }

  return headers;
};

const resolveFileUrl = (url) => {
  const value =
    clean(url);

  if (!value) {
    return "";
  }

  if (
    /^https?:\/\//i.test(value)
  ) {
    return value;
  }

  if (
    value.startsWith("/")
  ) {
    return `${API_BASE_URL}${value}`;
  }

  return `${API_BASE_URL}/${value}`;
};

const formatFileSize = (
  bytes
) => {
  const value =
    Number(bytes);

  if (
    !value ||
    value <= 0
  ) {
    return "";
  }

  if (
    value < 1024
  ) {
    return `${value} B`;
  }

  if (
    value < 1024 * 1024
  ) {
    return `${(
      value / 1024
    ).toFixed(1)} KB`;
  }

  if (
    value <
    1024 *
      1024 *
      1024
  ) {
    return `${(
      value /
      (1024 * 1024)
    ).toFixed(1)} MB`;
  }

  return `${(
    value /
    (1024 *
      1024 *
      1024)
  ).toFixed(1)} GB`;
};

const getFileExtension = (
  name
) => {
  const value =
    clean(name);

  if (!value) {
    return "";
  }

  const parts =
    value.split(".");

  if (
    parts.length < 2
  ) {
    return "";
  }

  return parts[
    parts.length - 1
  ].toLowerCase();
};

const getFileTypeLabel = (
  name,
  mime
) => {
  const extension =
    getFileExtension(name);

  if (extension) {
    return extension.toUpperCase();
  }

  const value =
    clean(mime);

  if (
    value.includes("pdf")
  ) {
    return "PDF";
  }

  if (
    value.includes("video")
  ) {
    return "VIDEO";
  }

  if (
    value.includes("word")
  ) {
    return "DOC";
  }

  return "FILE";
};

const isPdfFile = (
  name,
  mime
) => {
  const extension =
    getFileExtension(name);

  return (
    extension === "pdf" ||
    clean(mime)
      .toLowerCase()
      .includes("pdf")
  );
};

const isVideoFile = (
  name,
  mime
) => {
  const extension =
    getFileExtension(name);

  return (
    [
      "mp4",
      "webm",
      "mov",
    ].includes(extension) ||
    clean(mime)
      .toLowerCase()
      .startsWith("video/")
  );
};

const isWordFile = (
  name,
  mime
) => {
  const extension =
    getFileExtension(name);

  const normalized =
    clean(mime)
      .toLowerCase();

  return (
    [
      "doc",
      "docx",
    ].includes(extension) ||
    normalized.includes(
      "word"
    ) ||
    normalized.includes(
      "officedocument"
    )
  );
};

const formatDate = (
  value
) => {
  if (!value) {
    return "No date";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return clean(value);
  }

  return date.toLocaleDateString(
    undefined,
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    }
  );
};

const formatDateTime = (
  value
) => {
  if (!value) {
    return "No due date";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return clean(value);
  }

  return date.toLocaleString(
    undefined,
    {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }
  );
};

const toDateTimeLocal = (
  value
) => {
  if (!value) {
    return "";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "";
  }

  const pad = (
    number
  ) =>
    String(number)
      .padStart(2, "0");

  return `${date.getFullYear()}-${pad(
    date.getMonth() + 1
  )}-${pad(
    date.getDate()
  )}T${pad(
    date.getHours()
  )}:${pad(
    date.getMinutes()
  )}`;
};

/* ============================================================
   NORMALIZE ASSIGNMENT
============================================================ */

const normalizeAssignment = (
  item
) => {
  const assignment =
    item?.assignment ??
    item?.task ??
    item?.activity ??
    item ??
    {};

  const questions =
    Array.isArray(
      assignment.questions
    )
      ? assignment.questions
      : [];

  const nestedFile =
    assignment.file ??
    assignment.attachment ??
    null;

  const fileName =
    clean(
      assignment.fileName ??
      assignment.file_name ??
      assignment.filename ??
      assignment.attachmentName ??
      assignment.attachment_name ??
      assignment.documentName ??
      assignment.document_name ??
      nestedFile?.name ??
      nestedFile?.originalName ??
      nestedFile?.fileName ??
      nestedFile?.filename
    );

  const fileUrl =
    clean(
      assignment.fileUrl ??
      assignment.file_url ??
      assignment.attachmentUrl ??
      assignment.attachment_url ??
      assignment.documentUrl ??
      assignment.document_url ??
      nestedFile?.url ??
      nestedFile?.fileUrl
    );

  const fileType =
    clean(
      assignment.fileType ??
      assignment.file_type ??
      assignment.mimeType ??
      assignment.mime_type ??
      assignment.documentType ??
      assignment.document_type ??
      nestedFile?.mimeType
    );

  const fileSize =
    Number(
      assignment.fileSize ??
      assignment.file_size ??
      assignment.attachmentSize ??
      assignment.attachment_size ??
      assignment.documentSize ??
      assignment.document_size ??
      nestedFile?.size ??
      0
    );

  const grade =
    clean(
      assignment.grade ??
      assignment.className ??
      assignment.class_name ??
      assignment.class ??
      assignment.studentClass ??
      assignment.student_class
    );

  const dueDate =
    assignment.dueDate ??
    assignment.due_date ??
    assignment.dueAt ??
    assignment.due_at ??
    null;

  const id =
    clean(
      assignment.id ??
      assignment.assignmentId ??
      assignment.assignment_id ??
      assignment.reference ??
      assignment.assignmentReference ??
      assignment.assignment_reference
    );

  return {
    ...assignment,

    id,

    reference:
      clean(
        assignment.reference ??
        assignment.assignmentReference ??
        assignment.assignment_reference ??
        id
      ),

    title:
      clean(
        assignment.title ??
        "Untitled Assignment"
      ),

    description:
      clean(
        assignment.description
      ),

    instructions:
      clean(
        assignment.instructions ??
        assignment.description
      ),

    grade,

    className:
      grade,

    subject:
      clean(
        assignment.subject
      ),

    dueDate,

    createdAt:
      assignment.createdAt ??
      assignment.created_at ??
      null,

    questions,

    totalQuestions:
      Number(
        assignment.totalQuestions ??
        assignment.total_questions ??
        questions.length ??
        0
      ),

    totalMarks:
      Number(
        assignment.totalMarks ??
        assignment.total_marks ??
        assignment.maxScore ??
        assignment.max_score ??
        0
      ),

    fileName,

    fileUrl,

    attachmentUrl:
      fileUrl,

    attachmentName:
      fileName,

    fileType,

    mimeType:
      fileType,

    fileSize,

    file:
      fileUrl || fileName
        ? {
            name:
              fileName,

            originalName:
              fileName,

            url:
              fileUrl,

            fileUrl:
              fileUrl,

            mimeType:
              fileType,

            size:
              fileSize,
          }
        : null,
  };
};

/* ============================================================
   COMPONENT
============================================================ */

export default function TutorAssignments() {
  const navigate =
    useNavigate();

  const [
    assignments,
    setAssignments,
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
    search,
    setSearch,
  ] = useState("");

  const [
    expandedId,
    setExpandedId,
  ] = useState(null);

  const [
    editingAssignment,
    setEditingAssignment,
  ] =
    useState(null);

  const [
    savingEdit,
    setSavingEdit,
  ] = useState(false);

  const [
    deletingId,
    setDeletingId,
  ] = useState(null);

  const [
    editError,
    setEditError,
  ] = useState("");

  const [
    editSuccess,
    setEditSuccess,
  ] = useState("");

  const [
    form,
    setForm,
  ] = useState({
    title: "",
    description: "",
    instructions: "",
    grade: "",
    subject: "",
    dueDate: "",
    file: null,
  });

  const [
    previewFile,
    setPreviewFile,
  ] = useState(null);

  /* ==========================================================
     LOAD ASSIGNMENTS
  ========================================================== */

  const loadAssignments =
    useCallback(
      async (
        silent = false
      ) => {
        const reference =
          getTutorReference();

        if (!reference) {
          setError(
            "Tutor reference could not be found. Please sign in again."
          );

          setLoading(false);
          return;
        }

        if (silent) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        try {
          const params =
            new URLSearchParams();

          params.set(
            "reference",
            reference
          );

          params.set(
            "tutorReference",
            reference
          );

          params.set(
            "tutor_reference",
            reference
          );

          const response =
            await fetch(
              `${ASSIGNMENTS_URL}?${params.toString()}`,
              {
                method: "GET",
                headers:
                  getTutorHeaders(),
                credentials:
                  "include",
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
            throw new Error(
              rawText ||
                "Invalid server response."
            );
          }

          if (!response.ok) {
            throw new Error(
              data?.error ||
                data?.message ||
                `Unable to load assignments (${response.status}).`
            );
          }

          const rawAssignments =
            data?.assignments ??
            data?.tasks ??
            data?.classActivities ??
            data?.class_activities ??
            data?.activities ??
            data?.data ??
            data?.results ??
            [];

          const normalized =
            Array.isArray(
              rawAssignments
            )
              ? rawAssignments.map(
                  normalizeAssignment
                )
              : [];

          setAssignments(
            normalized
          );
        } catch (err) {
          console.error(
            "Tutor assignments error:",
            err
          );

          setError(
            err?.message ||
              "Unable to load assignments."
          );
        } finally {
          setLoading(false);
          setRefreshing(false);
        }
      },
      []
    );

  useEffect(() => {
    loadAssignments();
  }, [
    loadAssignments,
  ]);

  /* ==========================================================
     FILTER
  ========================================================== */

  const filteredAssignments =
    useMemo(() => {
      const query =
        clean(search)
          .toLowerCase();

      if (!query) {
        return assignments;
      }

      return assignments.filter(
        (assignment) => {
          return [
            assignment.title,
            assignment.description,
            assignment.instructions,
            assignment.subject,
            assignment.grade,
            assignment.className,
            assignment.fileName,
          ]
            .join(" ")
            .toLowerCase()
            .includes(query);
        }
      );
    }, [
      assignments,
      search,
    ]);

  /* ==========================================================
     EDIT
  ========================================================== */

  const startEdit = (
    assignment
  ) => {
    setEditingAssignment(
      assignment
    );

    setForm({
      title:
        assignment.title ||
        "",

      description:
        assignment.description ||
        "",

      instructions:
        assignment.instructions ||
        "",

      grade:
        assignment.grade ||
        assignment.className ||
        "",

      subject:
        assignment.subject ||
        "",

      dueDate:
        toDateTimeLocal(
          assignment.dueDate
        ),

      file: null,
    });

    setEditError("");
    setEditSuccess("");
  };

  const closeEdit = () => {
    if (savingEdit) {
      return;
    }

    setEditingAssignment(
      null
    );

    setEditError("");
    setEditSuccess("");

    setForm({
      title: "",
      description: "",
      instructions: "",
      grade: "",
      subject: "",
      dueDate: "",
      file: null,
    });
  };

  const handleFormChange = (
    field,
    value
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleReplacementFile =
    (event) => {
      const file =
        event.target.files?.[0] ||
        null;

      if (!file) {
        handleFormChange(
          "file",
          null
        );
        return;
      }

      if (
        file.size >
        MAX_FILE_SIZE
      ) {
        setEditError(
          "The selected document is larger than 250 MB."
        );

        event.target.value = "";

        return;
      }

      setEditError("");

      handleFormChange(
        "file",
        file
      );
    };

  const clearReplacementFile =
    () => {
      setForm((previous) => ({
        ...previous,
        file: null,
      }));
    };

  /* ==========================================================
     SAVE EDIT
  ========================================================== */

  const saveEdit = async (
    event
  ) => {
    event.preventDefault();

    if (!editingAssignment) {
      return;
    }

    const reference =
      getTutorReference();

    if (!reference) {
      setEditError(
        "Tutor reference could not be found. Please sign in again."
      );

      return;
    }

    if (
      !clean(form.title)
    ) {
      setEditError(
        "Assignment title is required."
      );

      return;
    }

    setSavingEdit(true);
    setEditError("");
    setEditSuccess("");

    try {
      const id =
        editingAssignment.id;

      if (!id) {
        throw new Error(
          "Assignment ID is missing."
        );
      }

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
        form.title.trim()
      );

      formData.append(
        "description",
        form.description.trim()
      );

      formData.append(
        "instructions",
        form.instructions.trim()
      );

      formData.append(
        "class",
        form.grade
      );

      formData.append(
        "grade",
        form.grade
      );

      formData.append(
        "class_name",
        form.grade
      );

      formData.append(
        "className",
        form.grade
      );

      formData.append(
        "subject",
        form.subject
      );

      formData.append(
        "dueDate",
        form.dueDate || ""
      );

      formData.append(
        "due_date",
        form.dueDate || ""
      );

      if (form.file) {
        formData.append(
          "file",
          form.file
        );
      }

      const token =
        getToken();

      const headers = {
        Accept:
          "application/json",

        "x-tutor-reference":
          reference,
      };

      if (token) {
        headers.Authorization =
          `Bearer ${token}`;
      }

      const response =
        await fetch(
          `${ASSIGNMENTS_URL}/${encodeURIComponent(
            id
          )}`,
          {
            method: "PATCH",
            headers,
            credentials:
              "include",
            body: formData,
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
        throw new Error(
          rawText ||
            "Invalid server response."
        );
      }

      if (!response.ok) {
        throw new Error(
          data?.error ||
            data?.message ||
            `Unable to update assignment (${response.status}).`
        );
      }

      const updated =
        normalizeAssignment(
          data?.assignment ??
            data?.data ??
            data
        );

      setAssignments(
        (previous) =>
          previous.map(
            (item) =>
              String(
                item.id
              ) ===
              String(id)
                ? {
                    ...item,
                    ...updated,
                  }
                : item
          )
      );

      setEditingAssignment(
        updated
      );

      setForm(
        (previous) => ({
          ...previous,
          file: null,
        })
      );

      setEditSuccess(
        form.file
          ? "Assignment and document updated successfully."
          : "Assignment updated successfully."
      );

      setTimeout(() => {
        closeEdit();
      }, 900);
    } catch (err) {
      console.error(
        "Update assignment error:",
        err
      );

      setEditError(
        err?.message ||
          "Unable to update assignment."
      );
    } finally {
      setSavingEdit(false);
    }
  };

  /* ==========================================================
     DELETE
  ========================================================== */

  const deleteAssignment =
    async (
      assignment
    ) => {
      const confirmed =
        window.confirm(
          `Delete "${assignment.title}"? This action cannot be undone.`
        );

      if (!confirmed) {
        return;
      }

      const reference =
        getTutorReference();

      if (!reference) {
        setError(
          "Tutor reference could not be found."
        );

        return;
      }

      setDeletingId(
        assignment.id
      );

      try {
        const params =
          new URLSearchParams();

        params.set(
          "reference",
          reference
        );

        params.set(
          "tutorReference",
          reference
        );

        params.set(
          "tutor_reference",
          reference
        );

        const token =
          getToken();

        const headers =
          getTutorHeaders();

        if (token) {
          headers.Authorization =
            `Bearer ${token}`;
        }

        const response =
          await fetch(
            `${ASSIGNMENTS_URL}/${encodeURIComponent(
              assignment.id
            )}?${params.toString()}`,
            {
              method: "DELETE",
              headers,
              credentials:
                "include",
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
          throw new Error(
            rawText ||
              "Invalid server response."
          );
        }

        if (!response.ok) {
          throw new Error(
            data?.error ||
              data?.message ||
              "Unable to delete assignment."
          );
        }

        setAssignments(
          (previous) =>
            previous.filter(
              (item) =>
                String(
                  item.id
                ) !==
                String(
                  assignment.id
                )
            )
        );

        if (
          expandedId ===
          assignment.id
        ) {
          setExpandedId(null);
        }
      } catch (err) {
        console.error(
          "Delete assignment error:",
          err
        );

        setError(
          err?.message ||
            "Unable to delete assignment."
        );
      } finally {
        setDeletingId(null);
      }
    };

  /* ==========================================================
     DOCUMENT VIEWER
  ========================================================== */

  const openDocument =
    (assignment) => {
      const fileUrl =
        resolveFileUrl(
          assignment.fileUrl ||
            assignment.attachmentUrl
        );

      if (!fileUrl) {
        setError(
          "This assignment does not have a document attached."
        );

        return;
      }

      setPreviewFile({
        url: fileUrl,
        name:
          assignment.fileName ||
          "Assignment document",
        type:
          assignment.fileType ||
          assignment.mimeType ||
          "",
        size:
          assignment.fileSize ||
          0,
      });
    };

  const openDocumentInNewTab =
    (file) => {
      const url =
        resolveFileUrl(
          file?.url ||
            file?.fileUrl
        );

      if (!url) {
        return;
      }

      window.open(
        url,
        "_blank",
        "noopener,noreferrer"
      );
    };

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

        {/* ====================================================
            HEADER
        ==================================================== */}

        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm text-slate-400">
              <BookOpen
                size={16}
              />
              Academy
              <span>
                /
              </span>
              Tutor
              <span>
                /
              </span>
              Assignments
            </div>

            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              My Assignments
            </h1>

            <p className="mt-1 text-sm text-slate-400">
              View, edit, manage and replace your assignment documents.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() =>
                loadAssignments(
                  true
                )
              }
              disabled={
                refreshing
              }
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:border-slate-600 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw
                size={16}
                className={
                  refreshing
                    ? "animate-spin"
                    : ""
                }
              />

              Refresh
            </button>

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/academy/tutor/assignments/create"
                )
              }
              className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
            >
              <Paperclip
                size={16}
              />

              Create Assignment
            </button>
          </div>
        </div>

        {/* ====================================================
            ERROR
        ==================================================== */}

        {error && (
          <div className="mb-5 flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            <AlertCircle
              size={18}
              className="mt-0.5 shrink-0"
            />

            <div className="flex-1">
              {error}
            </div>

            <button
              type="button"
              onClick={() =>
                setError("")
              }
              className="text-red-300 hover:text-white"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* ====================================================
            SEARCH
        ==================================================== */}

        <div className="mb-6 rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
            />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search assignments, subjects, classes or documents..."
              className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-slate-500"
            />
          </div>
        </div>

        {/* ====================================================
            LOADING
        ==================================================== */}

        {loading ? (
          <div className="flex min-h-[350px] items-center justify-center">
            <div className="flex flex-col items-center gap-3 text-slate-400">
              <Loader2
                size={32}
                className="animate-spin"
              />

              <span className="text-sm">
                Loading assignments...
              </span>
            </div>
          </div>
        ) : filteredAssignments.length ===
          0 ? (
          <div className="rounded-3xl border border-dashed border-slate-800 bg-slate-900/40 px-6 py-16 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-800">
              <FileText
                size={25}
                className="text-slate-400"
              />
            </div>

            <h2 className="text-lg font-semibold">
              {search
                ? "No matching assignments"
                : "No assignments yet"}
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
              {search
                ? "Try a different search term."
                : "Assignments you create will appear here."}
            </p>
          </div>
        ) : (
          /* ==================================================
             ASSIGNMENT LIST
          ================================================== */

          <div className="space-y-4">
            {filteredAssignments.map(
              (assignment) => {
                const isExpanded =
                  String(
                    expandedId
                  ) ===
                  String(
                    assignment.id
                  );

                const hasFile =
                  Boolean(
                    assignment.fileUrl ||
                      assignment.attachmentUrl
                  );

                return (
                  <div
                    key={
                      assignment.id
                    }
                    className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/70 shadow-xl shadow-black/10"
                  >
                    {/* ==================================================
                       CARD HEADER
                    ================================================== */}

                    <div className="p-5 sm:p-6">
                      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">

                        <div className="min-w-0 flex-1">
                          <div className="mb-3 flex flex-wrap items-center gap-2">
                            {assignment.subject && (
                              <span className="rounded-full border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-300">
                                {
                                  assignment.subject
                                }
                              </span>
                            )}

                            {assignment.grade && (
                              <span className="rounded-full border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-300">
                                {
                                  assignment.grade
                                }
                              </span>
                            )}

                            {hasFile && (
                              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-300">
                                <Paperclip
                                  size={12}
                                />

                                Document attached
                              </span>
                            )}
                          </div>

                          <h2 className="truncate text-xl font-bold text-white">
                            {
                              assignment.title
                            }
                          </h2>

                          {assignment.description && (
                            <p className="mt-2 line-clamp-2 max-w-3xl text-sm leading-6 text-slate-400">
                              {
                                assignment.description
                              }
                            </p>
                          )}

                          <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-500">
                            <span className="inline-flex items-center gap-1.5">
                              <Calendar
                                size={14}
                              />

                              Due{" "}
                              {formatDate(
                                assignment.dueDate
                              )}
                            </span>

                            {assignment.totalQuestions >
                              0 && (
                              <span className="inline-flex items-center gap-1.5">
                                <FileText
                                  size={14}
                                />

                                {
                                  assignment.totalQuestions
                                }{" "}
                                questions
                              </span>
                            )}

                            {assignment.totalMarks >
                              0 && (
                              <span className="inline-flex items-center gap-1.5">
                                <CheckCircle2
                                  size={14}
                                />

                                {
                                  assignment.totalMarks
                                }{" "}
                                marks
                              </span>
                            )}
                          </div>
                        </div>

                        {/* ==================================================
                           ACTIONS
                        ================================================== */}

                        <div className="flex flex-wrap items-center gap-2">
                          {hasFile && (
                            <button
                              type="button"
                              onClick={() =>
                                openDocument(
                                  assignment
                                )
                              }
                              className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3.5 py-2.5 text-sm font-medium text-emerald-300 transition hover:bg-emerald-500/20"
                            >
                              <Eye
                                size={16}
                              />

                              View Document
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() =>
                              navigate(
                                `/academy/tutor/assignments/${assignment.id}`
                              )
                            }
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-slate-700"
                          >
                            <Eye
                              size={16}
                            />

                            View
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              startEdit(
                                assignment
                              )
                            }
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-slate-700"
                          >
                            <Edit3
                              size={16}
                            />

                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              navigate(
                                `/academy/tutor/assignments/${assignment.id}/submissions`
                              )
                            }
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-slate-700"
                          >
                            <FileText
                              size={16}
                            />

                            Submissions
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              setExpandedId(
                                isExpanded
                                  ? null
                                  : assignment.id
                              )
                            }
                            className="inline-flex items-center justify-center rounded-xl border border-slate-700 bg-slate-800 p-2.5 text-slate-300 transition hover:bg-slate-700"
                            title={
                              isExpanded
                                ? "Collapse"
                                : "Expand"
                            }
                          >
                            {isExpanded ? (
                              <ChevronUp
                                size={17}
                              />
                            ) : (
                              <ChevronDown
                                size={17}
                              />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* ==================================================
                         EXPANDED INFO
                      ================================================== */}

                      {isExpanded && (
                        <div className="mt-6 border-t border-slate-800 pt-6">
                          <div className="grid gap-4 md:grid-cols-2">

                            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                              <div className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-500">
                                Instructions
                              </div>

                              <p className="whitespace-pre-wrap text-sm leading-6 text-slate-300">
                                {assignment.instructions ||
                                  "No instructions provided."}
                              </p>
                            </div>

                            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                              <div className="mb-3 text-xs font-medium uppercase tracking-wider text-slate-500">
                                Assignment Details
                              </div>

                              <div className="space-y-3 text-sm">
                                <div className="flex items-center justify-between gap-4">
                                  <span className="text-slate-500">
                                    Class
                                  </span>

                                  <span className="font-medium text-slate-200">
                                    {assignment.grade ||
                                      "—"}
                                  </span>
                                </div>

                                <div className="flex items-center justify-between gap-4">
                                  <span className="text-slate-500">
                                    Subject
                                  </span>

                                  <span className="font-medium text-slate-200">
                                    {assignment.subject ||
                                      "—"}
                                  </span>
                                </div>

                                <div className="flex items-center justify-between gap-4">
                                  <span className="text-slate-500">
                                    Due
                                  </span>

                                  <span className="font-medium text-slate-200">
                                    {formatDateTime(
                                      assignment.dueDate
                                    )}
                                  </span>
                                </div>

                                <div className="flex items-center justify-between gap-4">
                                  <span className="text-slate-500">
                                    Questions
                                  </span>

                                  <span className="font-medium text-slate-200">
                                    {
                                      assignment.totalQuestions
                                    }
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* DOCUMENT CARD */}

                          {hasFile && (
                            <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex min-w-0 items-center gap-3">
                                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-800">
                                    <FileText
                                      size={20}
                                      className="text-slate-300"
                                    />
                                  </div>

                                  <div className="min-w-0">
                                    <div className="truncate text-sm font-semibold text-white">
                                      {
                                        assignment.fileName
                                      }
                                    </div>

                                    <div className="mt-1 flex flex-wrap gap-2 text-xs text-slate-500">
                                      <span>
                                        {getFileTypeLabel(
                                          assignment.fileName,
                                          assignment.fileType
                                        )}
                                      </span>

                                      {assignment.fileSize >
                                        0 && (
                                        <>
                                          <span>
                                            •
                                          </span>

                                          <span>
                                            {formatFileSize(
                                              assignment.fileSize
                                            )}
                                          </span>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                <div className="flex shrink-0 gap-2">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      openDocument(
                                        assignment
                                      )
                                    }
                                    className="inline-flex items-center gap-2 rounded-xl bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
                                  >
                                    <Eye
                                      size={16}
                                    />

                                    Open
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      openDocumentInNewTab(
                                        {
                                          url:
                                            assignment.fileUrl ||
                                            assignment.attachmentUrl,
                                        }
                                      )
                                    }
                                    className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-slate-700"
                                  >
                                    <Download
                                      size={16}
                                    />

                                    Open Tab
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* ==================================================
                       FOOTER
                    ================================================== */}

                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 bg-slate-950/40 px-5 py-3 sm:px-6">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Clock3
                          size={14}
                        />

                        Created{" "}
                        {formatDate(
                          assignment.createdAt
                        )}
                      </div>

                      <button
                        type="button"
                        disabled={
                          deletingId ===
                          assignment.id
                        }
                        onClick={() =>
                          deleteAssignment(
                            assignment
                          )
                        }
                        className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-red-400 transition hover:bg-red-500/10 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {deletingId ===
                        assignment.id ? (
                          <Loader2
                            size={14}
                            className="animate-spin"
                          />
                        ) : (
                          <Trash2
                            size={14}
                          />
                        )}

                        Delete
                      </button>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        )}
      </div>

      {/* ========================================================
          EDIT MODAL
      ======================================================== */}

      {editingAssignment && (
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/70 p-4 backdrop-blur-sm">
          <div className="flex min-h-full items-center justify-center py-8">
            <div className="w-full max-w-3xl overflow-hidden rounded-3xl border border-slate-800 bg-[#07111f] shadow-2xl">

              {/* HEADER */}

              <div className="flex items-start justify-between border-b border-slate-800 px-5 py-5 sm:px-6">
                <div>
                  <div className="mb-1 text-xs font-medium uppercase tracking-wider text-slate-500">
                    Edit Assignment
                  </div>

                  <h2 className="text-xl font-bold text-white">
                    Change assignment
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    You can also replace the document attached to this assignment.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={
                    closeEdit
                  }
                  disabled={
                    savingEdit
                  }
                  className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white disabled:opacity-50"
                >
                  <X
                    size={20}
                  />
                </button>
              </div>

              <form
                onSubmit={
                  saveEdit
                }
              >
                <div className="max-h-[75vh] overflow-y-auto px-5 py-6 sm:px-6">

                  {/* ERROR */}

                  {editError && (
                    <div className="mb-5 flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                      <AlertCircle
                        size={18}
                        className="mt-0.5 shrink-0"
                      />

                      <span>
                        {
                          editError
                        }
                      </span>
                    </div>
                  )}

                  {/* SUCCESS */}

                  {editSuccess && (
                    <div className="mb-5 flex items-start gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                      <CheckCircle2
                        size={18}
                        className="mt-0.5 shrink-0"
                      />

                      <span>
                        {
                          editSuccess
                        }
                      </span>
                    </div>
                  )}

                  {/* BASIC DETAILS */}

                  <div className="grid gap-5 md:grid-cols-2">

                    <div className="md:col-span-2">
                      <label className="mb-2 block text-sm font-medium text-slate-300">
                        Assignment title
                      </label>

                      <input
                        type="text"
                        value={
                          form.title
                        }
                        onChange={(
                          event
                        ) =>
                          handleFormChange(
                            "title",
                            event
                              .target
                              .value
                          )
                        }
                        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-slate-500"
                        placeholder="Assignment title"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-300">
                        Class
                      </label>

                      <input
                        type="text"
                        value={
                          form.grade
                        }
                        onChange={(
                          event
                        ) =>
                          handleFormChange(
                            "grade",
                            event
                              .target
                              .value
                          )
                        }
                        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-slate-500"
                        placeholder="e.g. JSS 1"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-300">
                        Subject
                      </label>

                      <input
                        type="text"
                        value={
                          form.subject
                        }
                        onChange={(
                          event
                        ) =>
                          handleFormChange(
                            "subject",
                            event
                              .target
                              .value
                          )
                        }
                        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-slate-500"
                        placeholder="Subject"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="mb-2 block text-sm font-medium text-slate-300">
                        Due date
                      </label>

                      <input
                        type="datetime-local"
                        value={
                          form.dueDate
                        }
                        onChange={(
                          event
                        ) =>
                          handleFormChange(
                            "dueDate",
                            event
                              .target
                              .value
                          )
                        }
                        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-slate-500"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="mb-2 block text-sm font-medium text-slate-300">
                        Description
                      </label>

                      <textarea
                        value={
                          form.description
                        }
                        onChange={(
                          event
                        ) =>
                          handleFormChange(
                            "description",
                            event
                              .target
                              .value
                          )
                        }
                        rows={4}
                        className="w-full resize-none rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm leading-6 text-white outline-none focus:border-slate-500"
                        placeholder="Assignment description"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="mb-2 block text-sm font-medium text-slate-300">
                        Instructions
                      </label>

                      <textarea
                        value={
                          form.instructions
                        }
                        onChange={(
                          event
                        ) =>
                          handleFormChange(
                            "instructions",
                            event
                              .target
                              .value
                          )
                        }
                        rows={5}
                        className="w-full resize-none rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm leading-6 text-white outline-none focus:border-slate-500"
                        placeholder="Instructions for students"
                      />
                    </div>
                  </div>

                  {/* ==================================================
                     CURRENT DOCUMENT
                  ================================================== */}

                  <div className="mt-7">
                    <div className="mb-3 flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-semibold text-white">
                          Current document
                        </h3>

                        <p className="mt-1 text-xs text-slate-500">
                          This is the document currently attached to the assignment.
                        </p>
                      </div>
                    </div>

                    {editingAssignment.fileUrl ||
                    editingAssignment.attachmentUrl ? (
                      <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-800">
                              {isVideoFile(
                                editingAssignment.fileName,
                                editingAssignment.fileType
                              ) ? (
                                <PlayCircle
                                  size={21}
                                  className="text-slate-300"
                                />
                              ) : (
                                <FileText
                                  size={21}
                                  className="text-slate-300"
                                />
                              )}
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-white">
                                {editingAssignment.fileName ||
                                  "Attached document"}
                              </p>

                              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                                <span>
                                  {getFileTypeLabel(
                                    editingAssignment.fileName,
                                    editingAssignment.fileType
                                  )}
                                </span>

                                {editingAssignment.fileSize >
                                  0 && (
                                  <>
                                    <span>
                                      •
                                    </span>

                                    <span>
                                      {formatFileSize(
                                        editingAssignment.fileSize
                                      )}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              openDocument(
                                editingAssignment
                              )
                            }
                            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
                          >
                            <Eye
                              size={16}
                            />

                            View Document
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-950/50 px-4 py-6 text-center text-sm text-slate-500">
                        No document is currently attached.
                      </div>
                    )}
                  </div>

                  {/* ==================================================
                     REPLACE DOCUMENT
                  ================================================== */}

                  <div className="mt-7">
                    <div className="mb-3">
                      <h3 className="text-sm font-semibold text-white">
                        Replace document
                      </h3>

                      <p className="mt-1 text-xs text-slate-500">
                        Select a new PDF, Word document or video. The existing document will be replaced when you save.
                      </p>
                    </div>

                    {!form.file ? (
                      <label className="group flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-slate-700 bg-slate-950/50 px-6 py-8 text-center transition hover:border-slate-500 hover:bg-slate-950">
                        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-800 transition group-hover:bg-slate-700">
                          <Upload
                            size={21}
                            className="text-slate-300"
                          />
                        </div>

                        <div className="text-sm font-semibold text-slate-200">
                          Choose replacement document
                        </div>

                        <div className="mt-1 text-xs text-slate-500">
                          PDF, DOC, DOCX, MP4, WebM or MOV • Max 250 MB
                        </div>

                        <input
                          type="file"
                          accept={
                            ACCEPTED_FILE_TYPES
                          }
                          onChange={
                            handleReplacementFile
                          }
                          className="hidden"
                        />
                      </label>
                    ) : (
                      <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10">
                              <File
                                size={20}
                                className="text-emerald-300"
                              />
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-white">
                                {
                                  form.file
                                    .name
                                }
                              </p>

                              <div className="mt-1 text-xs text-slate-500">
                                {getFileTypeLabel(
                                  form.file.name,
                                  form.file.type
                                )}{" "}
                                •{" "}
                                {formatFileSize(
                                  form.file.size
                                )}
                              </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={
                              clearReplacementFile
                            }
                            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-3.5 py-2.5 text-sm font-medium text-red-300 transition hover:bg-red-500/20"
                          >
                            <X
                              size={16}
                            />

                            Remove
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* ==================================================
                   FOOTER
                ================================================== */}

                <div className="flex flex-col-reverse gap-3 border-t border-slate-800 bg-slate-950/50 px-5 py-4 sm:flex-row sm:items-center sm:justify-end sm:px-6">
                  <button
                    type="button"
                    onClick={
                      closeEdit
                    }
                    disabled={
                      savingEdit
                    }
                    className="rounded-xl border border-slate-700 bg-slate-900 px-5 py-3 text-sm font-medium text-slate-300 transition hover:bg-slate-800 disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={
                      savingEdit
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {savingEdit ? (
                      <>
                        <Loader2
                          size={17}
                          className="animate-spin"
                        />

                        Saving...
                      </>
                    ) : (
                      <>
                        <CheckCircle2
                          size={17}
                        />

                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          DOCUMENT PREVIEW MODAL
      ======================================================== */}

      {previewFile && (
        <div className="fixed inset-0 z-[120] flex flex-col bg-black/90 backdrop-blur-sm">

          {/* HEADER */}

          <div className="flex shrink-0 items-center justify-between border-b border-white/10 bg-[#07111f] px-4 py-3 sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-800">
                {isVideoFile(
                  previewFile.name,
                  previewFile.type
                ) ? (
                  <PlayCircle
                    size={18}
                  />
                ) : (
                  <FileText
                    size={18}
                  />
                )}
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">
                  {
                    previewFile.name
                  }
                </p>

                <p className="text-xs text-slate-500">
                  {getFileTypeLabel(
                    previewFile.name,
                    previewFile.type
                  )}

                  {previewFile.size >
                    0 &&
                    ` • ${formatFileSize(
                      previewFile.size
                    )}`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  openDocumentInNewTab(
                    previewFile
                  )
                }
                className="hidden items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-slate-800 sm:inline-flex"
              >
                <Download
                  size={16}
                />

                Open Tab
              </button>

              <button
                type="button"
                onClick={() =>
                  setPreviewFile(
                    null
                  )
                }
                className="rounded-xl p-2.5 text-slate-400 transition hover:bg-slate-800 hover:text-white"
              >
                <X
                  size={21}
                />
              </button>
            </div>
          </div>

          {/* CONTENT */}

          <div className="min-h-0 flex-1 p-3 sm:p-5">
            <div className="h-full overflow-hidden rounded-2xl border border-white/10 bg-[#020617]">

              {isPdfFile(
                previewFile.name,
                previewFile.type
              ) ? (
                <iframe
                  title={
                    previewFile.name
                  }
                  src={
                    previewFile.url
                  }
                  className="h-full w-full"
                />
              ) : isVideoFile(
                  previewFile.name,
                  previewFile.type
                ) ? (
                <div className="flex h-full items-center justify-center p-4">
                  <video
                    src={
                      previewFile.url
                    }
                    controls
                    playsInline
                    className="max-h-full max-w-full rounded-xl"
                  >
                    Your browser does not support video playback.
                  </video>
                </div>
              ) : isWordFile(
                  previewFile.name,
                  previewFile.type
                ) ? (
                <div className="flex h-full flex-col items-center justify-center px-6 text-center">
                  <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800">
                    <FileText
                      size={28}
                      className="text-slate-300"
                    />
                  </div>

                  <h3 className="text-lg font-semibold text-white">
                    Word document
                  </h3>

                  <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                    DOC and DOCX files are not reliably rendered directly inside every browser. Open the document in a new tab to view or download it.
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      openDocumentInNewTab(
                        previewFile
                      )
                    }
                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
                  >
                    <Download
                      size={17}
                    />

                    Open Document
                  </button>
                </div>
              ) : (
                <div className="flex h-full flex-col items-center justify-center px-6 text-center">
                  <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800">
                    <File
                      size={28}
                      className="text-slate-300"
                    />
                  </div>

                  <h3 className="text-lg font-semibold text-white">
                    Document attached
                  </h3>

                  <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                    This file type cannot be previewed directly here.
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      openDocumentInNewTab(
                        previewFile
                      )
                    }
                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
                  >
                    <Download
                      size={17}
                    />

                    Open Document
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}