import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  Clock3,
  Edit3,
  Eye,
  FileText,
  Loader2,
  Plus,
  RefreshCw,
  Save,
  Search,
  Trash2,
  Upload,
  Video,
  X,
} from "lucide-react";

/* ============================================================
   CONFIG
============================================================ */

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

const ASSIGNMENTS_URL =
  `${API_BASE_URL}/api/academy/tutor/assignments`;

const MAX_FILE_SIZE = 250 * 1024 * 1024;

const ACCEPTED_FILE_TYPES =
  ".pdf,.doc,.docx,.mp4,.webm,.mov";

/* ============================================================
   HELPERS
============================================================ */

const clean = (value) => {
  if (value === undefined || value === null) {
    return "";
  }

  return String(value).trim();
};

const safeLower = (value) =>
  clean(value).toLowerCase();

const formatFileSize = (bytes) => {
  const size = Number(bytes);

  if (!Number.isFinite(size) || size <= 0) {
    return "";
  }

  if (size < 1024) {
    return `${size} B`;
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  if (size < 1024 * 1024 * 1024) {
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  }

  return `${(size / (1024 * 1024 * 1024)).toFixed(1)} GB`;
};

const getFileExtension = (value) => {
  const text = clean(value);

  if (!text) {
    return "";
  }

  const withoutQuery = text.split("?")[0];
  const parts = withoutQuery.split(".");

  if (parts.length < 2) {
    return "";
  }

  return parts.pop().toLowerCase();
};

const getFileTypeLabel = (value) => {
  const extension = getFileExtension(value);

  if (extension === "pdf") {
    return "PDF";
  }

  if (["doc", "docx"].includes(extension)) {
    return "Word Document";
  }

  if (["mp4", "webm", "mov"].includes(extension)) {
    return "Video";
  }

  return "Document";
};

const isPdfFile = (file) => {
  const name = clean(
    file?.name ||
      file?.fileName ||
      file?.file_name ||
      file?.url ||
      file?.fileUrl
  );

  const type = safeLower(
    file?.type ||
      file?.fileType ||
      file?.file_type ||
      file?.mimeType ||
      file?.mime_type
  );

  return (
    type.includes("pdf") ||
    getFileExtension(name) === "pdf"
  );
};

const isVideoFile = (file) => {
  const name = clean(
    file?.name ||
      file?.fileName ||
      file?.file_name ||
      file?.url ||
      file?.fileUrl
  );

  const type = safeLower(
    file?.type ||
      file?.fileType ||
      file?.file_type ||
      file?.mimeType ||
      file?.mime_type
  );

  return (
    type.startsWith("video/") ||
    ["mp4", "webm", "mov"].includes(
      getFileExtension(name)
    )
  );
};

const isWordFile = (file) => {
  const name = clean(
    file?.name ||
      file?.fileName ||
      file?.file_name ||
      file?.url ||
      file?.fileUrl
  );

  const type = safeLower(
    file?.type ||
      file?.fileType ||
      file?.file_type ||
      file?.mimeType ||
      file?.mime_type
  );

  return (
    type.includes("word") ||
    type.includes("document") ||
    ["doc", "docx"].includes(
      getFileExtension(name)
    )
  );
};

const formatDate = (value) => {
  if (!value) {
    return "No date";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "No date";
  }

  return date.toLocaleDateString("en-NG", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatDateTime = (value) => {
  if (!value) {
    return "No date";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "No date";
  }

  return date.toLocaleString("en-NG", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const toDateTimeLocal = (value) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const offset =
    date.getTimezoneOffset() * 60000;

  const localDate = new Date(
    date.getTime() - offset
  );

  return localDate
    .toISOString()
    .slice(0, 16);
};

/* ============================================================
   FILE URL HELPERS
============================================================ */

const getFileNameFromPath = (value) => {
  const text = clean(value);

  if (!text) {
    return "";
  }

  const cleaned = text
    .split("?")[0]
    .replace(/\\/g, "/");

  const pieces = cleaned.split("/");

  return pieces[pieces.length - 1] || "";
};

const normalizeFilePath = (value) => {
  let path = clean(value);

  if (!path) {
    return "";
  }

  path = path.replace(/\\/g, "/");

  /*
   * Handle Windows paths such as:
   *
   * C:/Users/.../uploads/academy-assignments/file.pdf
   */
  const lower = path.toLowerCase();

  const uploadsIndex =
    lower.indexOf("/uploads/");

  if (uploadsIndex !== -1) {
    return path.slice(uploadsIndex + 1);
  }

  const academyIndex =
    lower.indexOf("academy-assignments/");

  if (academyIndex !== -1) {
    return path.slice(academyIndex);
  }

  return path.replace(/^\/+/, "");
};

const resolveFileUrl = (
  value,
  fallbackFileName = ""
) => {
  const raw = clean(value);

  if (!raw) {
    if (!fallbackFileName) {
      return "";
    }

    const fileName =
      getFileNameFromPath(fallbackFileName);

    if (!fileName) {
      return "";
    }

    return (
      `${API_BASE_URL}/uploads/academy-assignments/` +
      encodeURIComponent(fileName)
    );
  }

  /*
   * Already usable browser URLs.
   */
  if (
    raw.startsWith("http://") ||
    raw.startsWith("https://") ||
    raw.startsWith("blob:") ||
    raw.startsWith("data:")
  ) {
    return raw;
  }

  const normalized =
    normalizeFilePath(raw);

  if (!normalized) {
    return "";
  }

  /*
   * /uploads/academy-assignments/file.pdf
   */
  if (
    normalized.startsWith(
      "uploads/academy-assignments/"
    )
  ) {
    return (
      `${API_BASE_URL}/` +
      normalized
    );
  }

  /*
   * uploads/academy-assignments/file.pdf
   */
  if (
    normalized.startsWith(
      "uploads/"
    )
  ) {
    return (
      `${API_BASE_URL}/` +
      normalized
    );
  }

  /*
   * academy-assignments/file.pdf
   */
  if (
    normalized.startsWith(
      "academy-assignments/"
    )
  ) {
    return (
      `${API_BASE_URL}/uploads/` +
      normalized
    );
  }

  /*
   * A relative URL such as:
   *
   * /api/files/123
   */
  if (
    normalized.startsWith("api/")
  ) {
    return (
      `${API_BASE_URL}/` +
      normalized
    );
  }

  /*
   * A normal absolute-ish path.
   */
  if (normalized.includes("/")) {
    return (
      `${API_BASE_URL}/` +
      normalized
    );
  }

  /*
   * Plain filename.
   *
   * Example:
   * assignment.pdf
   */
  return (
    `${API_BASE_URL}/uploads/academy-assignments/` +
    encodeURIComponent(normalized)
  );
};

/* ============================================================
   TUTOR AUTH
============================================================ */

const getTutorReference = () => {
  const directKeys = [
    "tutorReference",
    "tutor_reference",
    "reference",
    "applicationReference",
    "application_reference",
  ];

  for (const key of directKeys) {
    const value = clean(
      localStorage.getItem(key)
    );

    if (
      value &&
      value.toUpperCase().startsWith("SQA-")
    ) {
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

      if (!raw) {
        continue;
      }

      const parsed =
        JSON.parse(raw);

      const candidates = [
        parsed?.reference,
        parsed?.tutorReference,
        parsed?.tutor_reference,
        parsed?.applicationReference,
        parsed?.application_reference,
      ];

      for (const candidate of candidates) {
        const value = clean(candidate);

        if (
          value &&
          value.toUpperCase().startsWith("SQA-")
        ) {
          return value;
        }
      }
    } catch {
      // Ignore malformed localStorage data.
    }
  }

  return "";
};

const getToken = () => {
  const keys = [
    "scholiqen_academy_token",
    "academy_token",
    "scholiqen_token",
    "access_token",
    "token",
  ];

  for (const key of keys) {
    const value = clean(
      localStorage.getItem(key)
    );

    if (value) {
      return value;
    }
  }

  return "";
};

const getTutorHeaders = () => {
  const reference =
    getTutorReference();

  const token = getToken();

  const headers = {
    Accept: "application/json",
  };

  if (reference) {
    headers["x-tutor-reference"] =
      reference;
  }

  if (token) {
    headers.Authorization =
      `Bearer ${token}`;
  }

  return headers;
};

/* ============================================================
   ASSIGNMENT FILE EXTRACTION
============================================================ */

const getAssignmentFileInfo = (
  source
) => {
  const assignment =
    source?.assignment ||
    source?.task ||
    source?.activity ||
    source ||
    {};

  const nestedFile =
    assignment?.file ||
    assignment?.attachment ||
    assignment?.document ||
    assignment?.uploadedFile ||
    assignment?.uploaded_file ||
    {};

  const nestedFileIsString =
    typeof nestedFile === "string";

  const directUrlCandidates = [
    assignment.fileUrl,
    assignment.file_url,
    assignment.attachmentUrl,
    assignment.attachment_url,
    assignment.documentUrl,
    assignment.document_url,
    assignment.document_url_path,
    assignment.originalFileUrl,
    assignment.original_file_url,

    nestedFileIsString
      ? nestedFile
      : nestedFile?.url,

    nestedFileIsString
      ? nestedFile
      : nestedFile?.fileUrl,

    nestedFileIsString
      ? nestedFile
      : nestedFile?.file_url,

    nestedFileIsString
      ? nestedFile
      : nestedFile?.path,

    nestedFileIsString
      ? nestedFile
      : nestedFile?.filePath,

    nestedFileIsString
      ? nestedFile
      : nestedFile?.file_path,
  ];

  const filePathCandidates = [
    assignment.filePath,
    assignment.file_path,
    assignment.storagePath,
    assignment.storage_path,
    assignment.path,
    assignment.documentPath,
    assignment.document_path,
    assignment.uploadPath,
    assignment.upload_path,
    assignment.savedPath,
    assignment.saved_path,
    assignment.file_location,
    assignment.fileLocation,

    nestedFileIsString
      ? nestedFile
      : nestedFile?.path,

    nestedFileIsString
      ? nestedFile
      : nestedFile?.filePath,

    nestedFileIsString
      ? nestedFile
      : nestedFile?.file_path,
  ];

  const fileNameCandidates = [
    assignment.fileName,
    assignment.file_name,
    assignment.filename,
    assignment.originalFileName,
    assignment.original_file_name,
    assignment.attachmentName,
    assignment.attachment_name,
    assignment.documentName,
    assignment.document_name,

    nestedFileIsString
      ? ""
      : nestedFile?.name,

    nestedFileIsString
      ? ""
      : nestedFile?.fileName,

    nestedFileIsString
      ? ""
      : nestedFile?.file_name,

    nestedFileIsString
      ? ""
      : nestedFile?.originalName,

    nestedFileIsString
      ? ""
      : nestedFile?.original_name,
  ];

  let fileUrl =
    directUrlCandidates
      .map(clean)
      .find(Boolean) || "";

  let filePath =
    filePathCandidates
      .map(clean)
      .find(Boolean) || "";

  let fileName =
    fileNameCandidates
      .map(clean)
      .find(Boolean) || "";

  if (!fileName && filePath) {
    fileName =
      getFileNameFromPath(filePath);
  }

  if (!fileName && fileUrl) {
    fileName =
      getFileNameFromPath(fileUrl);
  }

  const fileType =
    clean(
      assignment.fileType ||
      assignment.file_type ||
      assignment.mimeType ||
      assignment.mime_type ||
      assignment.documentType ||
      assignment.document_type ||
      nestedFile?.type ||
      nestedFile?.fileType ||
      nestedFile?.file_type ||
      nestedFile?.mimeType ||
      nestedFile?.mime_type
    );

  const fileSize =
    assignment.fileSize ||
    assignment.file_size ||
    assignment.attachmentSize ||
    assignment.attachment_size ||
    assignment.documentSize ||
    assignment.document_size ||
    nestedFile?.size ||
    nestedFile?.fileSize ||
    nestedFile?.file_size ||
    0;

  /*
   * If the backend gives us a path but no URL,
   * convert the path to a browser URL.
   */
  if (!fileUrl && filePath) {
    fileUrl =
      resolveFileUrl(
        filePath,
        fileName
      );
  }

  /*
   * If only the saved filename is returned,
   * try the standard assignment upload folder.
   */
  if (!fileUrl && fileName) {
    fileUrl =
      resolveFileUrl(
        fileName,
        fileName
      );
  }

  return {
    fileUrl,
    filePath,
    fileName,
    fileType,
    fileSize,
  };
};

const hasAssignmentFile = (
  assignment
) => {
  const file =
    getAssignmentFileInfo(
      assignment
    );

  return Boolean(
    file.fileUrl ||
    file.filePath ||
    file.fileName
  );
};

/* ============================================================
   NORMALIZE ASSIGNMENT
============================================================ */

const normalizeAssignment = (
  item,
  index = 0
) => {
  const assignment =
    item?.assignment ||
    item?.task ||
    item?.activity ||
    item ||
    {};

  const questions =
    Array.isArray(
      assignment.questions
    )
      ? assignment.questions
      : Array.isArray(item?.questions)
      ? item.questions
      : [];

  const file =
    getAssignmentFileInfo(
      assignment
    );

  const id =
    assignment.id ||
    assignment.assignment_id ||
    assignment.assignmentId ||
    item?.id ||
    item?.assignment_id ||
    item?.assignmentId ||
    `assignment-${index}`;

  const title =
    clean(
      assignment.title ||
      assignment.name ||
      assignment.assignment_title ||
      assignment.assignmentName ||
      item?.title ||
      item?.name
    ) ||
    "Untitled Assignment";

  const description =
    clean(
      assignment.description ||
      assignment.details ||
      item?.description
    );

  const instructions =
    clean(
      assignment.instructions ||
      assignment.instruction ||
      item?.instructions
    );

  const grade =
    clean(
      assignment.grade ||
      assignment.class ||
      assignment.class_name ||
      assignment.className ||
      assignment.student_class ||
      assignment.studentClass ||
      item?.grade ||
      item?.class ||
      item?.class_name
    );

  const subject =
    clean(
      assignment.subject ||
      assignment.subject_name ||
      assignment.subjectName ||
      item?.subject ||
      item?.subject_name
    );

  const dueDate =
    assignment.due_date ||
    assignment.dueDate ||
    assignment.deadline ||
    assignment.due ||
    item?.due_date ||
    item?.dueDate ||
    null;

  const createdAt =
    assignment.created_at ||
    assignment.createdAt ||
    item?.created_at ||
    item?.createdAt ||
    null;

  const status =
    clean(
      assignment.status ||
      item?.status
    ) || "published";

  const tutorName =
    clean(
      assignment.tutor_name ||
      assignment.tutorName ||
      item?.tutor_name ||
      item?.tutorName
    );

  return {
    ...assignment,

    id,

    title,
    description,
    instructions,

    grade,
    class: grade,
    class_name: grade,
    className: grade,

    subject,

    dueDate,
    due_date: dueDate,

    createdAt,
    created_at: createdAt,

    status,

    tutorName,
    tutor_name: tutorName,

    questions,

    fileName: file.fileName,
    file_name: file.fileName,

    fileUrl: file.fileUrl,
    file_url: file.fileUrl,

    filePath: file.filePath,
    file_path: file.filePath,

    attachmentUrl: file.fileUrl,
    attachment_url: file.fileUrl,

    attachmentName: file.fileName,
    attachment_name: file.fileName,

    fileType: file.fileType,
    file_type: file.fileType,

    mimeType: file.fileType,
    mime_type: file.fileType,

    fileSize: file.fileSize,
    file_size: file.fileSize,

    file: {
      url: file.fileUrl,
      fileUrl: file.fileUrl,
      path: file.filePath,
      filePath: file.filePath,
      name: file.fileName,
      fileName: file.fileName,
      type: file.fileType,
      mimeType: file.fileType,
      size: file.fileSize,
    },
  };
};

/* ============================================================
   COMPONENT
============================================================ */

export default function TutorAssignments() {
  const navigate = useNavigate();

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
  ] = useState(null);

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
    previewFile,
    setPreviewFile,
  ] = useState(null);

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

  /* ==========================================================
     LOAD ASSIGNMENTS
  ========================================================== */

  const loadAssignments = useCallback(
    async (
      showLoader = true
    ) => {
      const reference =
        getTutorReference();

      if (!reference) {
        setError(
          "Your tutor reference could not be found. Please log out and log in again."
        );

        setLoading(false);
        setRefreshing(false);

        return;
      }

      if (showLoader) {
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
            }
          );

        let payload = null;

        try {
          payload =
            await response.json();
        } catch {
          payload = null;
        }

        if (!response.ok) {
          throw new Error(
            payload?.message ||
              payload?.error ||
              `Unable to load assignments (${response.status}).`
          );
        }

        let rows = [];

        if (Array.isArray(payload)) {
          rows = payload;
        } else if (
          Array.isArray(
            payload?.assignments
          )
        ) {
          rows =
            payload.assignments;
        } else if (
          Array.isArray(
            payload?.tasks
          )
        ) {
          rows =
            payload.tasks;
        } else if (
          Array.isArray(
            payload?.classActivities
          )
        ) {
          rows =
            payload.classActivities;
        } else if (
          Array.isArray(
            payload?.class_activities
          )
        ) {
          rows =
            payload.class_activities;
        } else if (
          Array.isArray(
            payload?.activities
          )
        ) {
          rows =
            payload.activities;
        } else if (
          Array.isArray(
            payload?.data
          )
        ) {
          rows =
            payload.data;
        } else if (
          Array.isArray(
            payload?.results
          )
        ) {
          rows =
            payload.results;
        }

        const normalized =
          rows.map(
            normalizeAssignment
          );

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
    loadAssignments(true);
  }, [loadAssignments]);

  /* ==========================================================
     SEARCH
  ========================================================== */

  const filteredAssignments =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      if (!query) {
        return assignments;
      }

      return assignments.filter(
        (assignment) => {
          const file =
            getAssignmentFileInfo(
              assignment
            );

          const searchableValues = [
            assignment.title,

            assignment.description,

            assignment.instructions,

            assignment.subject,

            assignment.grade,

            assignment.class,

            assignment.class_name,

            assignment.className,

            assignment.status,

            assignment.tutor_name,

            assignment.tutorName,

            assignment.fileName,

            assignment.file_name,

            assignment.filePath,

            assignment.file_path,

            assignment.fileType,

            assignment.file_type,

            file.fileName,

            file.filePath,

            file.fileType,

            assignment.dueDate,

            assignment.due_date,
          ];

          const searchableText =
            searchableValues
              .filter(
                (value) =>
                  value !==
                    undefined &&
                  value !== null
              )
              .map(
                (value) =>
                  String(
                    value
                  ).toLowerCase()
              )
              .join(" ");

          return searchableText.includes(
            query
          );
        }
      );
    }, [
      assignments,
      search,
    ]);

  /* ==========================================================
     REFRESH
  ========================================================== */

  const handleRefresh =
    async () => {
      setRefreshing(true);

      await loadAssignments(
        false
      );
    };

  /* ==========================================================
     EDIT
  ========================================================== */

  const startEdit = (
    assignment
  ) => {
    const file =
      getAssignmentFileInfo(
        assignment
      );

    setEditingAssignment(
      assignment
    );

    setEditError("");
    setEditSuccess("");

    setForm({
      title:
        assignment.title || "",

      description:
        assignment.description ||
        "",

      instructions:
        assignment.instructions ||
        "",

      grade:
        assignment.grade ||
        assignment.class ||
        "",

      subject:
        assignment.subject ||
        "",

      dueDate:
        toDateTimeLocal(
          assignment.dueDate ||
            assignment.due_date
        ),

      file: null,
    });

    /*
     * Keep file information available
     * even when no replacement file is
     * selected.
     */
    if (file.fileUrl) {
      setEditingAssignment({
        ...assignment,
        fileUrl:
          file.fileUrl,
        fileName:
          file.fileName,
        filePath:
          file.filePath,
      });
    }
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

  const handleEditFile =
    (event) => {
      const file =
        event.target.files?.[0];

      if (!file) {
        return;
      }

      if (
        file.size >
        MAX_FILE_SIZE
      ) {
        setEditError(
          "The selected file is larger than 250 MB."
        );

        event.target.value = "";

        return;
      }

      setEditError("");

      setForm((previous) => ({
        ...previous,
        file,
      }));
    };

  const saveEdit =
    async (event) => {
      event.preventDefault();

      if (!editingAssignment?.id) {
        setEditError(
          "This assignment does not have a valid ID."
        );

        return;
      }

      const reference =
        getTutorReference();

      if (!reference) {
        setEditError(
          "Your tutor reference could not be found. Please log out and log in again."
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
        const body =
          new FormData();

        body.append(
          "reference",
          reference
        );

        body.append(
          "tutorReference",
          reference
        );

        body.append(
          "tutor_reference",
          reference
        );

        body.append(
          "title",
          clean(form.title)
        );

        body.append(
          "description",
          clean(
            form.description
          )
        );

        body.append(
          "instructions",
          clean(
            form.instructions
          )
        );

        body.append(
          "grade",
          clean(form.grade)
        );

        body.append(
          "class",
          clean(form.grade)
        );

        body.append(
          "class_name",
          clean(form.grade)
        );

        body.append(
          "className",
          clean(form.grade)
        );

        body.append(
          "subject",
          clean(form.subject)
        );

        body.append(
          "dueDate",
          clean(form.dueDate)
        );

        body.append(
          "due_date",
          clean(form.dueDate)
        );

        if (form.file) {
          body.append(
            "file",
            form.file
          );
        }

        const response =
          await fetch(
            `${ASSIGNMENTS_URL}/${encodeURIComponent(
              editingAssignment.id
            )}`,
            {
              method: "PATCH",
              headers: {
                Accept:
                  "application/json",
                "x-tutor-reference":
                  reference,
                ...(getToken()
                  ? {
                      Authorization:
                        `Bearer ${getToken()}`,
                    }
                  : {}),
              },
              body,
            }
          );

        let payload = null;

        try {
          payload =
            await response.json();
        } catch {
          payload = null;
        }

        if (!response.ok) {
          throw new Error(
            payload?.message ||
              payload?.error ||
              "Unable to update assignment."
          );
        }

        setEditSuccess(
          "Assignment updated successfully."
        );

        await loadAssignments(
          false
        );

        setTimeout(() => {
          closeEdit();
        }, 700);
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
    async (assignment) => {
      if (!assignment?.id) {
        return;
      }

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
          "Your tutor reference could not be found. Please log out and log in again."
        );

        return;
      }

      setDeletingId(
        assignment.id
      );

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
            `${ASSIGNMENTS_URL}/${encodeURIComponent(
              assignment.id
            )}?${params.toString()}`,
            {
              method: "DELETE",
              headers:
                getTutorHeaders(),
            }
          );

        let payload = null;

        try {
          payload =
            await response.json();
        } catch {
          payload = null;
        }

        if (!response.ok) {
          throw new Error(
            payload?.message ||
              payload?.error ||
              "Unable to delete assignment."
          );
        }

        setAssignments(
          (previous) =>
            previous.filter(
              (item) =>
                String(item.id) !==
                String(
                  assignment.id
                )
            )
        );

        if (
          String(expandedId) ===
          String(assignment.id)
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
     FILE PREVIEW
  ========================================================== */

  const openDocument = (
    assignment
  ) => {
    const file =
      getAssignmentFileInfo(
        assignment
      );

    const url =
      resolveFileUrl(
        file.fileUrl ||
          file.filePath ||
          file.fileName,
        file.fileName
      );

    if (!url) {
      setError(
        "This assignment does not have a usable document URL."
      );

      return;
    }

    setPreviewFile({
      url,
      name:
        file.fileName ||
        "Assignment Document",
      type:
        file.fileType ||
        getFileTypeLabel(
          file.fileName
        ),
      size:
        file.fileSize,
    });
  };

  const openDocumentInNewTab =
    (assignment) => {
      const file =
        getAssignmentFileInfo(
          assignment
        );

      const url =
        resolveFileUrl(
          file.fileUrl ||
            file.filePath ||
            file.fileName,
          file.fileName
        );

      if (!url) {
        setError(
          "This assignment does not have a usable document URL."
        );

        return;
      }

      window.open(
        url,
        "_blank",
        "noopener,noreferrer"
      );
    };

  const closePreview = () => {
    setPreviewFile(null);
  };

  /* ==========================================================
     INPUT HANDLER
  ========================================================== */

  const updateForm =
    (field, value) => {
      setForm((previous) => ({
        ...previous,
        [field]: value,
      }));
    };

  /* ==========================================================
     STATUS
  ========================================================== */

  const getStatusClass =
    (status) => {
      const normalized =
        safeLower(status);

      if (
        normalized ===
          "published" ||
        normalized === "active"
      ) {
        return "border-emerald-500/20 bg-emerald-500/10 text-emerald-300";
      }

      if (
        normalized ===
        "draft"
      ) {
        return "border-amber-500/20 bg-amber-500/10 text-amber-300";
      }

      if (
        normalized ===
        "closed"
      ) {
        return "border-red-500/20 bg-red-500/10 text-red-300";
      }

      return "border-slate-700 bg-slate-800 text-slate-300";
    };

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <div className="min-h-screen bg-[#050816] text-white">
      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="border-b border-slate-800 bg-[#071426]">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-3">
              <button
                type="button"
                onClick={() =>
                  navigate(-1)
                }
                className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-800 bg-[#050816] text-slate-400 transition hover:border-slate-700 hover:text-white"
                title="Go back"
              >
                <ArrowLeft
                  size={18}
                />
              </button>

              <div>
                <div className="flex items-center gap-2">
                  <ClipboardList
                    size={22}
                    className="text-cyan-400"
                  />

                  <h1 className="text-2xl font-bold tracking-tight">
                    Assignments
                  </h1>
                </div>

                <p className="mt-1 text-sm text-slate-500">
                  Create, search, edit and
                  manage your tutor
                  assignments.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={
                  handleRefresh
                }
                disabled={
                  refreshing
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-[#050816] px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-slate-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
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
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-cyan-400"
              >
                <Plus
                  size={17}
                />

                New Assignment
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================
          CONTENT
      ====================================================== */}

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* ERROR */}

        {error && (
          <div className="mb-5 flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-red-300">
            <AlertCircle
              size={20}
              className="mt-0.5 shrink-0"
            />

            <div className="flex-1">
              <p className="text-sm font-semibold">
                Unable to load
                assignments
              </p>

              <p className="mt-1 text-sm text-red-300/80">
                {error}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setError("")
              }
              className="text-red-300/60 transition hover:text-red-200"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* ====================================================
            SEARCH
        ==================================================== */}

        <div className="mb-4 rounded-2xl border border-slate-800 bg-[#071426] p-3">
          <div className="relative">
            <Search
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
            />

            <input
              type="search"
              value={search}
              onChange={(event) => {
                setSearch(
                  event.target.value
                );
              }}
              placeholder="Search assignments, classes, subjects or documents..."
              autoComplete="off"
              className="w-full rounded-xl border border-slate-800 bg-[#050816] py-3 pl-11 pr-12 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-500/50"
            />

            {search && (
              <button
                type="button"
                onClick={() =>
                  setSearch("")
                }
                className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-800 hover:text-white"
                title="Clear search"
              >
                <X size={15} />
              </button>
            )}
          </div>
        </div>

        {/* SEARCH COUNT */}

        <div className="mb-5 flex flex-col gap-2 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <span>
            Showing{" "}
            <span className="font-semibold text-slate-300">
              {
                filteredAssignments.length
              }
            </span>{" "}
            of{" "}
            <span className="font-semibold text-slate-300">
              {assignments.length}
            </span>{" "}
            assignments
          </span>

          {search && (
            <span>
              Searching for:{" "}
              <span className="font-semibold text-cyan-400">
                "{search}"
              </span>
            </span>
          )}
        </div>

        {/* ====================================================
            LOADING
        ==================================================== */}

        {loading ? (
          <div className="flex min-h-[320px] items-center justify-center rounded-2xl border border-slate-800 bg-[#071426]">
            <div className="flex flex-col items-center gap-3 text-slate-400">
              <Loader2
                size={32}
                className="animate-spin text-cyan-400"
              />

              <p className="text-sm">
                Loading assignments...
              </p>
            </div>
          </div>
        ) : filteredAssignments.length ===
          0 ? (
          /* ==================================================
             EMPTY
          ================================================== */

          <div className="rounded-2xl border border-dashed border-slate-700 bg-[#071426] px-6 py-16 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-800 text-slate-400">
              {search ? (
                <Search
                  size={25}
                />
              ) : (
                <ClipboardList
                  size={25}
                />
              )}
            </div>

            <h2 className="text-lg font-semibold text-white">
              {search
                ? "No matching assignments"
                : "No assignments yet"}
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              {search
                ? `Nothing matched "${search}". Try the assignment title, subject, class, or document name.`
                : "Assignments you create will appear here."}
            </p>

            {search ? (
              <button
                type="button"
                onClick={() =>
                  setSearch("")
                }
                className="mt-5 rounded-xl bg-cyan-500 px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-cyan-400"
              >
                Clear Search
              </button>
            ) : (
              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/academy/tutor/assignments/create"
                  )
                }
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-cyan-400"
              >
                <Plus
                  size={17}
                />

                Create Assignment
              </button>
            )}
          </div>
        ) : (
          /* ==================================================
             ASSIGNMENTS
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

                const file =
                  getAssignmentFileInfo(
                    assignment
                  );

                const hasFile =
                  hasAssignmentFile(
                    assignment
                  );

                return (
                  <div
                    key={
                      assignment.id
                    }
                    className="overflow-hidden rounded-2xl border border-slate-800 bg-[#071426] shadow-xl shadow-black/10"
                  >
                    {/* ==================================================
                        CARD HEADER
                    ================================================== */}

                    <div className="p-5">
                      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="mb-3 flex flex-wrap items-center gap-2">
                            <span
                              className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${getStatusClass(
                                assignment.status
                              )}`}
                            >
                              {assignment.status ||
                                "Published"}
                            </span>

                            {assignment.subject && (
                              <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2.5 py-1 text-[11px] font-semibold text-cyan-300">
                                {
                                  assignment.subject
                                }
                              </span>
                            )}

                            {assignment.grade && (
                              <span className="rounded-full border border-slate-700 bg-slate-800/70 px-2.5 py-1 text-[11px] font-semibold text-slate-300">
                                {
                                  assignment.grade
                                }
                              </span>
                            )}
                          </div>

                          <h2 className="break-words text-xl font-bold text-white">
                            {
                              assignment.title
                            }
                          </h2>

                          {assignment.description && (
                            <p className="mt-2 max-w-3xl whitespace-pre-wrap text-sm leading-6 text-slate-400">
                              {
                                assignment.description
                              }
                            </p>
                          )}

                          <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-500">
                            <span className="inline-flex items-center gap-1.5">
                              <CalendarDays
                                size={14}
                              />

                              Due:{" "}
                              <span className="text-slate-300">
                                {formatDate(
                                  assignment.dueDate
                                )}
                              </span>
                            </span>

                            <span className="inline-flex items-center gap-1.5">
                              <Clock3
                                size={14}
                              />

                              Created:{" "}
                              <span className="text-slate-300">
                                {formatDateTime(
                                  assignment.createdAt
                                )}
                              </span>
                            </span>

                            <span className="inline-flex items-center gap-1.5">
                              <ClipboardList
                                size={14}
                              />

                              Questions:{" "}
                              <span className="text-slate-300">
                                {
                                  assignment
                                    .questions
                                    ?.length
                                }
                              </span>
                            </span>
                          </div>
                        </div>

                        {/* ==================================================
                            ACTIONS
                        ================================================== */}

                        <div className="flex flex-wrap items-center gap-2 xl:max-w-[420px] xl:justify-end">
                          {hasFile && (
                            <button
                              type="button"
                              onClick={() =>
                                openDocument(
                                  assignment
                                )
                              }
                              className="inline-flex items-center gap-2 rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-3 py-2 text-xs font-bold text-cyan-300 transition hover:bg-cyan-500/20"
                            >
                              {isVideoFile(
                                file
                              ) ? (
                                <Video
                                  size={
                                    15
                                  }
                                />
                              ) : (
                                <FileText
                                  size={
                                    15
                                  }
                                />
                              )}

                              View Document
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() =>
                              startEdit(
                                assignment
                              )
                            }
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-[#050816] px-3 py-2 text-xs font-bold text-slate-300 transition hover:border-slate-600 hover:text-white"
                          >
                            <Edit3
                              size={
                                15
                              }
                            />

                            Edit
                          </button>

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
                            className="inline-flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs font-bold text-red-300 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {deletingId ===
                            assignment.id ? (
                              <Loader2
                                size={
                                  15
                                }
                                className="animate-spin"
                              />
                            ) : (
                              <Trash2
                                size={
                                  15
                                }
                              />
                            )}

                            Delete
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
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-[#050816] px-3 py-2 text-xs font-bold text-slate-300 transition hover:border-slate-600 hover:text-white"
                          >
                            {isExpanded ? (
                              <>
                                <ChevronUp
                                  size={
                                    15
                                  }
                                />

                                Hide
                              </>
                            ) : (
                              <>
                                <ChevronDown
                                  size={
                                    15
                                  }
                                />

                                Details
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* ==================================================
                        EXPANDED DETAILS
                    ================================================== */}

                    {isExpanded && (
                      <div className="border-t border-slate-800 bg-[#050816]/60 p-5">
                        <div className="grid gap-5 lg:grid-cols-2">
                          {/* DOCUMENT */}

                          {hasFile && (
                            <div className="rounded-2xl border border-slate-800 bg-[#071426] p-4">
                              <div className="mb-3 flex items-center justify-between gap-3">
                                <div>
                                  <h3 className="font-semibold text-white">
                                    Attached
                                    Document
                                  </h3>

                                  <p className="mt-1 text-xs text-slate-500">
                                    File attached
                                    to this
                                    assignment.
                                  </p>
                                </div>

                                <FileText
                                  size={20}
                                  className="text-cyan-400"
                                />
                              </div>

                              <div className="rounded-xl border border-slate-800 bg-[#050816] p-3">
                                <div className="flex items-center gap-3">
                                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-300">
                                    {isVideoFile(
                                      file
                                    ) ? (
                                      <Video
                                        size={
                                          19
                                        }
                                      />
                                    ) : (
                                      <FileText
                                        size={
                                          19
                                        }
                                      />
                                    )}
                                  </div>

                                  <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-semibold text-white">
                                      {file.fileName ||
                                        "Assignment document"}
                                    </p>

                                    <p className="mt-1 text-xs text-slate-500">
                                      {file.fileType ||
                                        getFileTypeLabel(
                                          file.fileName
                                        )}

                                      {file.fileSize
                                        ? ` • ${formatFileSize(
                                            file.fileSize
                                          )}`
                                        : ""}
                                    </p>
                                  </div>
                                </div>

                                <div className="mt-3 flex flex-wrap gap-2">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      openDocument(
                                        assignment
                                      )
                                    }
                                    className="inline-flex items-center gap-2 rounded-lg bg-cyan-500 px-3 py-2 text-xs font-bold text-slate-950 hover:bg-cyan-400"
                                  >
                                    <Eye
                                      size={
                                        14
                                      }
                                    />

                                    Open
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      openDocumentInNewTab(
                                        assignment
                                      )
                                    }
                                    className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-[#050816] px-3 py-2 text-xs font-bold text-slate-300 hover:text-white"
                                  >
                                    Open New
                                    Tab
                                  </button>
                                </div>

                                {file.filePath && (
                                  <p className="mt-3 break-all text-[11px] text-slate-600">
                                    Stored:
                                    {" "}
                                    {
                                      file.filePath
                                    }
                                  </p>
                                )}
                              </div>
                            </div>
                          )}

                          {/* INSTRUCTIONS */}

                          <div className="rounded-2xl border border-slate-800 bg-[#071426] p-4">
                            <h3 className="font-semibold text-white">
                              Instructions
                            </h3>

                            {assignment.instructions ? (
                              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-400">
                                {
                                  assignment.instructions
                                }
                              </p>
                            ) : (
                              <p className="mt-3 text-sm text-slate-600">
                                No instructions
                                provided.
                              </p>
                            )}
                          </div>

                          {/* QUESTIONS */}

                          <div className="rounded-2xl border border-slate-800 bg-[#071426] p-4 lg:col-span-2">
                            <div className="mb-4 flex items-center justify-between">
                              <div>
                                <h3 className="font-semibold text-white">
                                  Questions
                                </h3>

                                <p className="mt-1 text-xs text-slate-500">
                                  {
                                    assignment
                                      .questions
                                      ?.length
                                  }{" "}
                                  question(s)
                                </p>
                              </div>
                            </div>

                            {assignment.questions
                              ?.length >
                            0 ? (
                              <div className="space-y-3">
                                {assignment.questions.map(
                                  (
                                    question,
                                    questionIndex
                                  ) => (
                                    <div
                                      key={
                                        question.id ||
                                        question.question_id ||
                                        questionIndex
                                      }
                                      className="rounded-xl border border-slate-800 bg-[#050816] p-4"
                                    >
                                      <div className="flex gap-3">
                                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-xs font-bold text-slate-300">
                                          {questionIndex +
                                            1}
                                        </div>

                                        <div className="min-w-0 flex-1">
                                          <p className="text-sm font-medium leading-6 text-white">
                                            {question.question ||
                                              question.question_text ||
                                              question.text ||
                                              "Question"}
                                          </p>

                                          <div className="mt-3 grid gap-2 sm:grid-cols-2">
                                            {[
                                              [
                                                "A",
                                                question.option_a ||
                                                  question.optionA,
                                              ],
                                              [
                                                "B",
                                                question.option_b ||
                                                  question.optionB,
                                              ],
                                              [
                                                "C",
                                                question.option_c ||
                                                  question.optionC,
                                              ],
                                              [
                                                "D",
                                                question.option_d ||
                                                  question.optionD,
                                              ],
                                            ].map(
                                              (
                                                [
                                                  letter,
                                                  option,
                                                ]
                                              ) =>
                                                clean(
                                                  option
                                                ) ? (
                                                  <div
                                                    key={
                                                      letter
                                                    }
                                                    className="rounded-lg border border-slate-800 bg-[#071426] px-3 py-2 text-xs text-slate-400"
                                                  >
                                                    <span className="mr-2 font-bold text-cyan-400">
                                                      {
                                                        letter
                                                      }
                                                      .
                                                    </span>

                                                    {
                                                      option
                                                    }
                                                  </div>
                                                ) : null
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  )
                                )}
                              </div>
                            ) : (
                              <div className="rounded-xl border border-dashed border-slate-800 px-5 py-8 text-center">
                                <p className="text-sm text-slate-500">
                                  No questions
                                  have been
                                  added to this
                                  assignment.
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              }
            )}
          </div>
        )}
      </main>

      {/* ========================================================
          EDIT MODAL
      ======================================================== */}

      {editingAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-800 bg-[#071426] shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-800 bg-[#071426] px-5 py-4">
              <div>
                <h2 className="text-lg font-bold text-white">
                  Edit Assignment
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Update assignment
                  information or replace
                  its document.
                </p>
              </div>

              <button
                type="button"
                onClick={closeEdit}
                disabled={
                  savingEdit
                }
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-800 bg-[#050816] text-slate-400 transition hover:text-white disabled:opacity-50"
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={saveEdit}
              className="space-y-5 p-5"
            >
              {editError && (
                <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">
                  <AlertCircle
                    size={18}
                    className="mt-0.5 shrink-0"
                  />

                  <span>
                    {editError}
                  </span>
                </div>
              )}

              {editSuccess && (
                <div className="flex items-start gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-300">
                  <CheckCircle2
                    size={18}
                    className="mt-0.5 shrink-0"
                  />

                  <span>
                    {editSuccess}
                  </span>
                </div>
              )}

              {/* TITLE */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-300">
                  Assignment Title
                </label>

                <input
                  type="text"
                  value={form.title}
                  onChange={(event) =>
                    updateForm(
                      "title",
                      event.target.value
                    )
                  }
                  className="w-full rounded-xl border border-slate-800 bg-[#050816] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-500/50"
                  placeholder="Enter assignment title"
                />
              </div>

              {/* DESCRIPTION */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-300">
                  Description
                </label>

                <textarea
                  rows={4}
                  value={
                    form.description
                  }
                  onChange={(event) =>
                    updateForm(
                      "description",
                      event.target.value
                    )
                  }
                  className="w-full resize-none rounded-xl border border-slate-800 bg-[#050816] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-500/50"
                  placeholder="Describe the assignment..."
                />
              </div>

              {/* INSTRUCTIONS */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-300">
                  Instructions
                </label>

                <textarea
                  rows={4}
                  value={
                    form.instructions
                  }
                  onChange={(event) =>
                    updateForm(
                      "instructions",
                      event.target.value
                    )
                  }
                  className="w-full resize-none rounded-xl border border-slate-800 bg-[#050816] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-500/50"
                  placeholder="Enter instructions for students..."
                />
              </div>

              {/* GRADE + SUBJECT */}

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-300">
                    Class / Grade
                  </label>

                  <input
                    type="text"
                    value={form.grade}
                    onChange={(event) =>
                      updateForm(
                        "grade",
                        event.target.value
                      )
                    }
                    className="w-full rounded-xl border border-slate-800 bg-[#050816] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-500/50"
                    placeholder="e.g. SS2"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-300">
                    Subject
                  </label>

                  <input
                    type="text"
                    value={
                      form.subject
                    }
                    onChange={(event) =>
                      updateForm(
                        "subject",
                        event.target.value
                      )
                    }
                    className="w-full rounded-xl border border-slate-800 bg-[#050816] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-500/50"
                    placeholder="e.g. Mathematics"
                  />
                </div>
              </div>

              {/* DUE DATE */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-300">
                  Due Date
                </label>

                <input
                  type="datetime-local"
                  value={
                    form.dueDate
                  }
                  onChange={(event) =>
                    updateForm(
                      "dueDate",
                      event.target.value
                    )
                  }
                  className="w-full rounded-xl border border-slate-800 bg-[#050816] px-4 py-3 text-sm text-white outline-none focus:border-cyan-500/50"
                />
              </div>

              {/* CURRENT FILE */}

              {hasAssignmentFile(
                editingAssignment
              ) && (
                <div className="rounded-xl border border-slate-800 bg-[#050816] p-4">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-300">
                      <FileText
                        size={19}
                      />
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white">
                        Current document
                      </p>

                      <p className="truncate text-xs text-slate-500">
                        {
                          getAssignmentFileInfo(
                            editingAssignment
                          ).fileName
                        }
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      openDocument(
                        editingAssignment
                      )
                    }
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-[#071426] px-3 py-2 text-xs font-bold text-slate-300 hover:text-white"
                  >
                    <Eye
                      size={14}
                    />

                    View Current
                    Document
                  </button>
                </div>
              )}

              {/* REPLACEMENT FILE */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-300">
                  Replace Document
                </label>

                <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-slate-700 bg-[#050816] px-5 py-8 text-center transition hover:border-cyan-500/40 hover:bg-cyan-500/[0.03]">
                  <Upload
                    size={25}
                    className="mb-3 text-cyan-400"
                  />

                  <span className="text-sm font-semibold text-slate-300">
                    {form.file
                      ? form.file.name
                      : "Choose a replacement file"}
                  </span>

                  <span className="mt-1 text-xs text-slate-600">
                    PDF, DOC, DOCX, MP4,
                    WEBM or MOV • Maximum
                    250 MB
                  </span>

                  <input
                    type="file"
                    accept={
                      ACCEPTED_FILE_TYPES
                    }
                    onChange={
                      handleEditFile
                    }
                    className="hidden"
                  />
                </label>
              </div>

              {/* BUTTONS */}

              <div className="flex flex-col-reverse gap-2 border-t border-slate-800 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeEdit}
                  disabled={
                    savingEdit
                  }
                  className="rounded-xl border border-slate-700 bg-[#050816] px-4 py-3 text-sm font-semibold text-slate-300 hover:text-white disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    savingEdit
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {savingEdit ? (
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />
                  ) : (
                    <Save
                      size={17}
                    />
                  )}

                  {savingEdit
                    ? "Saving..."
                    : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          FILE PREVIEW MODAL
      ======================================================== */}

      {previewFile && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 p-3 backdrop-blur-sm sm:p-5">
          <div className="flex h-[95vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-slate-800 bg-[#071426] shadow-2xl">
            {/* PREVIEW HEADER */}

            <div className="flex shrink-0 items-center justify-between gap-4 border-b border-slate-800 px-4 py-3 sm:px-5">
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-white">
                  {
                    previewFile.name
                  }
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  {previewFile.type}

                  {previewFile.size
                    ? ` • ${formatFileSize(
                        previewFile.size
                      )}`
                    : ""}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    window.open(
                      previewFile.url,
                      "_blank",
                      "noopener,noreferrer"
                    )
                  }
                  className="hidden rounded-lg border border-slate-700 bg-[#050816] px-3 py-2 text-xs font-bold text-slate-300 hover:text-white sm:block"
                >
                  Open New Tab
                </button>

                <button
                  type="button"
                  onClick={
                    closePreview
                  }
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-700 bg-[#050816] text-slate-400 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* PREVIEW BODY */}

            <div className="min-h-0 flex-1 bg-[#020617]">
              {isPdfFile(
                previewFile
              ) ? (
                <iframe
                  title={
                    previewFile.name
                  }
                  src={`${previewFile.url}#toolbar=1&navpanes=0`}
                  className="h-full w-full border-0"
                />
              ) : isVideoFile(
                  previewFile
                ) ? (
                <div className="flex h-full items-center justify-center p-4">
                  <video
                    src={
                      previewFile.url
                    }
                    controls
                    className="max-h-full max-w-full rounded-xl"
                  >
                    Your browser
                    does not support
                    video playback.
                  </video>
                </div>
              ) : isWordFile(
                  previewFile
                ) ? (
                <div className="flex h-full flex-col items-center justify-center px-6 text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-300">
                    <FileText
                      size={30}
                    />
                  </div>

                  <h3 className="text-lg font-bold text-white">
                    Word document
                  </h3>

                  <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                    Word documents cannot
                    be rendered directly
                    inside this viewer.
                    Open the document in a
                    new tab to view or
                    download it.
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      window.open(
                        previewFile.url,
                        "_blank",
                        "noopener,noreferrer"
                      )
                    }
                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-3 text-sm font-bold text-slate-950 hover:bg-cyan-400"
                  >
                    <Eye
                      size={16}
                    />

                    Open Document
                  </button>
                </div>
              ) : (
                <div className="flex h-full flex-col items-center justify-center px-6 text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800 text-slate-400">
                    <FileText
                      size={30}
                    />
                  </div>

                  <h3 className="text-lg font-bold text-white">
                    Document preview
                  </h3>

                  <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                    This file type cannot be
                    previewed here.
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      window.open(
                        previewFile.url,
                        "_blank",
                        "noopener,noreferrer"
                      )
                    }
                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-3 text-sm font-bold text-slate-950 hover:bg-cyan-400"
                  >
                    <Eye
                      size={16}
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