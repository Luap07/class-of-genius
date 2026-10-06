import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock3,
  FileText,
  Loader2,
  Send,
  AlertCircle,
  Award,
  RefreshCw,
  ExternalLink,
  Download,
  PlayCircle,
  Eye,
  Upload,
  X,
  Paperclip,
} from "lucide-react";

import {
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";

import { motion } from "framer-motion";

/* ============================================================
   API
============================================================ */

const API_URL = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000"
).replace(/\/$/, "");

/* ============================================================
   STORAGE KEYS
============================================================ */

const ACADEMY_TOKEN_KEYS = [
  "scholiqen_academy_token",
  "scholiqen_auth_token",
  "academy_token",
  "scholiqen_token",
  "access_token",
  "token",
];

const STUDENT_OBJECT_KEYS = [
  "scholiqen_academy_student",
  "scholiqen_academy_user",
  "academy_student",
  "academyStudent",
  "student",
  "currentStudent",
  "current_student",
  "studentUser",
  "student_user",
  "loggedInStudent",
  "logged_in_student",
];

const STUDENT_REFERENCE_KEYS = [
  "studentReference",
  "student_reference",
  "studentRef",
  "student_ref",
  "studentNumber",
  "student_number",
  "studentCode",
  "student_code",
  "reference",
  "enrollmentReference",
  "enrollment_reference",
];

const STUDENT_ID_KEYS = [
  "studentId",
  "student_id",
  "studentID",
];

const ENROLLMENT_KEYS = [
  "enrollmentId",
  "enrollment_id",
  "enrollmentID",
  "enrollment",
];

/* ============================================================
   GENERAL HELPERS
============================================================ */

const cleanValue = (value) => {
  if (
    value === undefined ||
    value === null
  ) {
    return "";
  }

  return String(value).trim();
};

const firstNonEmpty = (...values) => {
  for (const value of values) {
    const cleaned = cleanValue(value);

    if (cleaned) {
      return cleaned;
    }
  }

  return "";
};

const isUsableIdentity = (value) => {
  const cleaned = cleanValue(value);

  if (!cleaned) {
    return false;
  }

  const lower = cleaned.toLowerCase();

  return ![
    "undefined",
    "null",
    "nan",
    "[object object]",
  ].includes(lower);
};

const safelyParseJSON = (value) => {
  if (
    typeof value !== "string"
  ) {
    return value;
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return value;
  }

  try {
    return JSON.parse(trimmed);
  } catch {
    return value;
  }
};

const readLocalStorageObject = (
  key
) => {
  try {
    const raw =
      localStorage.getItem(key);

    if (!raw) {
      return null;
    }

    const parsed =
      safelyParseJSON(raw);

    if (
      parsed &&
      typeof parsed === "object"
    ) {
      return parsed;
    }

    return null;
  } catch {
    return null;
  }
};

const readLocalStorageValue = (
  keys
) => {
  for (const key of keys) {
    try {
      const value =
        localStorage.getItem(key);

      if (
        isUsableIdentity(value)
      ) {
        return cleanValue(value);
      }
    } catch {
      // Ignore storage errors.
    }
  }

  return "";
};

const findIdentityInObject = (
  object,
  keys
) => {
  if (
    !object ||
    typeof object !== "object"
  ) {
    return "";
  }

  for (const key of keys) {
    const value =
      object[key];

    if (
      isUsableIdentity(value)
    ) {
      return cleanValue(value);
    }
  }

  return "";
};

/* ============================================================
   FILE HELPERS
============================================================ */

const parsePossibleObject = (
  value
) => {
  if (!value) {
    return null;
  }

  if (
    typeof value === "object"
  ) {
    return value;
  }

  if (
    typeof value === "string"
  ) {
    const parsed =
      safelyParseJSON(value);

    if (
      parsed &&
      typeof parsed === "object"
    ) {
      return parsed;
    }
  }

  return null;
};

const deriveFileNameFromUrl = (
  url
) => {
  if (!url) {
    return "";
  }

  try {
    const cleanUrl =
      String(url).split("?")[0];

    const parts =
      cleanUrl.split("/");

    const last =
      parts[parts.length - 1] || "";

    return decodeURIComponent(
      last
    );
  } catch {
    return "";
  }
};

const normalizeFileCandidate = (
  candidate
) => {
  if (!candidate) {
    return {
      url: "",
      name: "",
      type: "",
      size: null,
    };
  }

  if (
    typeof candidate === "string"
  ) {
    const url =
      candidate.trim();

    return {
      url,
      name:
        deriveFileNameFromUrl(
          url
        ),
      type: "",
      size: null,
    };
  }

  if (
    typeof candidate !== "object"
  ) {
    return {
      url: "",
      name: "",
      type: "",
      size: null,
    };
  }

  const url = firstNonEmpty(
    candidate.url,
    candidate.fileUrl,
    candidate.file_url,
    candidate.documentUrl,
    candidate.document_url,
    candidate.attachmentUrl,
    candidate.attachment_url,
    candidate.uploadUrl,
    candidate.upload_url,
    candidate.publicUrl,
    candidate.public_url,
    candidate.downloadUrl,
    candidate.download_url,
    candidate.href,
    candidate.src,
    candidate.filePath,
    candidate.file_path,
    candidate.documentPath,
    candidate.document_path,
    candidate.storagePath,
    candidate.storage_path,
    candidate.path
  );

  const name =
    firstNonEmpty(
      candidate.name,
      candidate.fileName,
      candidate.file_name,
      candidate.filename,
      candidate.documentName,
      candidate.document_name,
      candidate.attachmentName,
      candidate.attachment_name,
      candidate.originalName,
      candidate.original_name
    ) ||
    deriveFileNameFromUrl(
      url
    );

  const type =
    firstNonEmpty(
      candidate.type,
      candidate.fileType,
      candidate.file_type,
      candidate.mimeType,
      candidate.mime_type,
      candidate.contentType,
      candidate.content_type
    );

  const sizeValue =
    candidate.size ??
    candidate.fileSize ??
    candidate.file_size;

  const size =
    Number.isFinite(
      Number(sizeValue)
    )
      ? Number(sizeValue)
      : null;

  return {
    url,
    name,
    type,
    size,
  };
};

const getAssignmentFile = (
  source
) => {
  if (!source) {
    return {
      url: "",
      name: "",
      type: "",
      size: null,
    };
  }

  const object =
    parsePossibleObject(
      source
    );

  if (!object) {
    return normalizeFileCandidate(
      source
    );
  }

  const directCandidates = [
    object.file,
    object.document,
    object.attachment,
    object.upload,
    object.uploadedFile,
    object.uploaded_file,
    object.assignmentFile,
    object.assignment_file,
    object.fileData,
    object.file_data,
    object.documentFile,
    object.document_file,
  ];

  for (
    const candidate of
    directCandidates
  ) {
    const normalized =
      normalizeFileCandidate(
        candidate
      );

    if (normalized.url) {
      return normalized;
    }
  }

  const arrays = [
    object.attachments,
    object.files,
    object.documents,
    object.uploads,
    object.resources,
  ];

  for (
    const list of arrays
  ) {
    if (
      !Array.isArray(list)
    ) {
      continue;
    }

    for (
      const candidate of list
    ) {
      const normalized =
        normalizeFileCandidate(
          candidate
        );

      if (normalized.url) {
        return normalized;
      }
    }
  }

  const directUrl =
    firstNonEmpty(
      object.fileUrl,
      object.file_url,
      object.documentUrl,
      object.document_url,
      object.attachmentUrl,
      object.attachment_url,
      object.uploadUrl,
      object.upload_url,
      object.publicUrl,
      object.public_url,
      object.downloadUrl,
      object.download_url,
      object.href,
      object.src,
      object.filePath,
      object.file_path,
      object.documentPath,
      object.document_path,
      object.storagePath,
      object.storage_path,
      object.path
    );

  if (directUrl) {
    return normalizeFileCandidate(
      {
        url: directUrl,
        name:
          firstNonEmpty(
            object.fileName,
            object.file_name,
            object.documentName,
            object.document_name,
            object.attachmentName,
            object.attachment_name
          ),
        type:
          firstNonEmpty(
            object.fileType,
            object.file_type,
            object.documentType,
            object.document_type,
            object.mimeType,
            object.mime_type
          ),
        size:
          object.fileSize ??
          object.file_size,
      }
    );
  }

  const nestedContainers = [
    object.data,
    object.result,
    object.assignment,
    object.activity,
    object.task,
  ];

  for (
    const nested of
    nestedContainers
  ) {
    const normalized =
      getAssignmentFile(
        nested
      );

    if (normalized.url) {
      return normalized;
    }
  }

  return {
    url: "",
    name: "",
    type: "",
    size: null,
  };
};

const resolveFileUrl = (
  value
) => {
  if (!value) {
    return "";
  }

  const url =
    String(value).trim();

  if (!url) {
    return "";
  }

  if (
    url.startsWith("blob:")
  ) {
    return url;
  }

  if (
    url.startsWith("data:")
  ) {
    return url;
  }

  if (
    /^https?:\/\//i.test(
      url
    )
  ) {
    return url;
  }

  if (
    url.startsWith("//")
  ) {
    return `${window.location.protocol}${url}`;
  }

  if (
    url.startsWith("/")
  ) {
    return `${API_URL}${url}`;
  }

  return `${API_URL}/${url.replace(
    /^\/+/,
    ""
  )}`;
};

const getFileExtension = (
  name,
  type,
  url
) => {
  const source =
    firstNonEmpty(
      name,
      url
    );

  if (source) {
    const clean =
      source
        .split("?")[0]
        .split("#")[0];

    const match =
      clean.match(
        /\.([a-zA-Z0-9]+)$/
      );

    if (match?.[1]) {
      return match[1].toLowerCase();
    }
  }

  if (
    type &&
    type.includes("/")
  ) {
    return type
      .split("/")
      .pop()
      .toLowerCase();
  }

  return "";
};

const isPdfFile = (
  name,
  type,
  url
) => {
  const extension =
    getFileExtension(
      name,
      type,
      url
    );

  return (
    extension === "pdf" ||
    cleanValue(type)
      .toLowerCase()
      .includes("pdf")
  );
};

const isVideoFile = (
  name,
  type,
  url
) => {
  const extension =
    getFileExtension(
      name,
      type,
      url
    );

  return [
    "mp4",
    "webm",
    "ogg",
    "mov",
    "m4v",
  ].includes(extension);
};

const formatFileSize = (
  size
) => {
  if (
    size === undefined ||
    size === null ||
    size === ""
  ) {
    return "";
  }

  const number =
    Number(size);

  if (
    !Number.isFinite(number) ||
    number <= 0
  ) {
    return "";
  }

  if (number < 1024) {
    return `${number} B`;
  }

  if (
    number <
    1024 * 1024
  ) {
    return `${(
      number / 1024
    ).toFixed(1)} KB`;
  }

  if (
    number <
    1024 * 1024 * 1024
  ) {
    return `${(
      number /
      (1024 * 1024)
    ).toFixed(1)} MB`;
  }

  return `${(
    number /
    (1024 * 1024 * 1024)
  ).toFixed(1)} GB`;
};

/* ============================================================
   STUDENT IDENTITY
============================================================ */

const getStudentIdentity = () => {
  const objects = [];

  for (
    const key of
    STUDENT_OBJECT_KEYS
  ) {
    const object =
      readLocalStorageObject(
        key
      );

    if (object) {
      objects.push(object);
    }
  }

  const enrollmentObject =
    readLocalStorageObject(
      "enrollment"
    );

  if (
    enrollmentObject
  ) {
    objects.push(
      enrollmentObject
    );
  }

  let studentReference = "";
  let studentId = "";
  let enrollmentId = "";
  let studentName = "";

  for (
    const object of objects
  ) {
    if (
      !studentReference
    ) {
      studentReference =
        findIdentityInObject(
          object,
          STUDENT_REFERENCE_KEYS
        );
    }

    if (!studentId) {
      studentId =
        findIdentityInObject(
          object,
          STUDENT_ID_KEYS
        );
    }

    if (!enrollmentId) {
      enrollmentId =
        findIdentityInObject(
          object,
          ENROLLMENT_KEYS
        );
    }

    if (!studentName) {
      studentName =
        firstNonEmpty(
          object.name,
          object.fullName,
          object.full_name,
          object.studentName,
          object.student_name,
          object.displayName,
          object.display_name
        );
    }

    const nestedEnrollment =
      object.enrollment ||
      object.enrollmentData ||
      object.enrollment_data;

    if (
      nestedEnrollment &&
      typeof nestedEnrollment ===
        "object"
    ) {
      if (!enrollmentId) {
        enrollmentId =
          findIdentityInObject(
            nestedEnrollment,
            ENROLLMENT_KEYS
          ) ||
          firstNonEmpty(
            nestedEnrollment.id
          );
      }

      if (!studentReference) {
        studentReference =
          findIdentityInObject(
            nestedEnrollment,
            STUDENT_REFERENCE_KEYS
          );
      }
    }
  }

  if (!studentReference) {
    studentReference =
      readLocalStorageValue(
        STUDENT_REFERENCE_KEYS
      );
  }

  if (!studentId) {
    studentId =
      readLocalStorageValue(
        STUDENT_ID_KEYS
      );
  }

  if (!enrollmentId) {
    enrollmentId =
      readLocalStorageValue(
        ENROLLMENT_KEYS
      );
  }

  return {
    studentReference,
    studentId,
    enrollmentId,
    studentName,
  };
};

/* ============================================================
   TOKEN
============================================================ */

const getAcademyToken = () => {
  return readLocalStorageValue(
    ACADEMY_TOKEN_KEYS
  );
};

const getAuthHeaders = () => {
  const token =
    getAcademyToken();

  return {
    Accept:
      "application/json",

    ...(token
      ? {
          Authorization:
            `Bearer ${token}`,
          "x-academy-token":
            token,
          "x-student-token":
            token,
        }
      : {}),
  };
};

const getJsonAuthHeaders = () => ({
  ...getAuthHeaders(),
  "Content-Type":
    "application/json",
});

/* ============================================================
   QUESTION HELPERS
============================================================ */

const normalizeQuestion = (
  question,
  index
) => {
  if (!question) {
    return null;
  }

  return {
    id:
      question.id ??
      question.question_id ??
      question.questionId ??
      index + 1,

    question:
      question.question ??
      question.question_text ??
      question.questionText ??
      question.text ??
      "",

    optionA:
      question.optionA ??
      question.option_a ??
      question.a ??
      "",

    optionB:
      question.optionB ??
      question.option_b ??
      question.b ??
      "",

    optionC:
      question.optionC ??
      question.option_c ??
      question.c ??
      "",

    optionD:
      question.optionD ??
      question.option_d ??
      question.d ??
      "",

    marks:
      question.marks ??
      question.mark ??
      question.points ??
      1,

    correctAnswer:
      question.correctAnswer ??
      question.correct_answer ??
      "",
  };
};

const parseQuestionsValue = (
  value
) => {
  if (
    Array.isArray(value)
  ) {
    return value;
  }

  if (
    typeof value === "string"
  ) {
    const parsed =
      safelyParseJSON(value);

    if (
      Array.isArray(parsed)
    ) {
      return parsed;
    }
  }

  if (
    value &&
    typeof value === "object"
  ) {
    if (
      Array.isArray(
        value.questions
      )
    ) {
      return value.questions;
    }

    if (
      Array.isArray(
        value.items
      )
    ) {
      return value.items;
    }

    if (
      Array.isArray(
        value.data
      )
    ) {
      return value.data;
    }
  }

  return [];
};

const extractQuestions = (
  payload
) => {
  if (!payload) {
    return [];
  }

  const candidates = [
    payload.questions,
    payload.questionData,
    payload.items,
    payload.data?.questions,
    payload.data?.questionData,
    payload.data?.items,
    payload.result?.questions,
    payload.result?.questionData,
    payload.result?.items,
    payload.assignment?.questions,
    payload.assignment?.questionData,
    payload.data?.assignment?.questions,
    payload.result?.assignment?.questions,
  ];

  for (
    const candidate of
    candidates
  ) {
    const parsed =
      parseQuestionsValue(
        candidate
      );

    if (
      parsed.length
    ) {
      return parsed
        .map(
          normalizeQuestion
        )
        .filter(Boolean);
    }
  }

  return [];
};

const extractAssignment = (
  payload
) => {
  return (
    payload?.assignment ||
    payload?.data?.assignment ||
    payload?.result?.assignment ||
    payload?.data ||
    payload?.result ||
    null
  );
};

const extractServerMessage = (
  payload,
  fallback
) => {
  return firstNonEmpty(
    payload?.message,
    payload?.error,
    payload?.details,
    payload?.data?.message,
    payload?.data?.error,
    payload?.result?.message,
    fallback
  );
};

const extractSubmission = (
  payload
) => {
  return (
    payload?.submission ||
    payload?.data?.submission ||
    payload?.result?.submission ||
    payload?.result ||
    payload?.data ||
    null
  );
};

/* ============================================================
   COMPONENT
============================================================ */

const StudentAssignmentDetails =
  () => {
    const navigate =
      useNavigate();

    const location =
      useLocation();

    const params =
      useParams();

    const assignmentId =
      params.assignmentId ||
      params.id ||
      location.state?.assignment?.id ||
      location.state?.assignmentId;

    const fileInputRef =
      useRef(null);

    const [
      assignment,
      setAssignment,
    ] = useState(null);

    const [
      questions,
      setQuestions,
    ] = useState([]);

    const [
      answers,
      setAnswers,
    ] = useState({});

    const [
      loading,
      setLoading,
    ] = useState(true);

    const [
      submitting,
      setSubmitting,
    ] = useState(false);

    const [
      error,
      setError,
    ] = useState("");

    const [
      submitError,
      setSubmitError,
    ] = useState("");

    const [
      submitted,
      setSubmitted,
    ] = useState(false);

    const [
      savedSubmission,
      setSavedSubmission,
    ] = useState(null);

    const [
      expandedQuestion,
      setExpandedQuestion,
    ] = useState(null);

    const [
      protectedFileUrl,
      setProtectedFileUrl,
    ] = useState("");

    const [
      protectedFileLoading,
      setProtectedFileLoading,
    ] = useState(false);

    const [
      protectedFileError,
      setProtectedFileError,
    ] = useState("");

    const [
      protectedFileType,
      setProtectedFileType,
    ] = useState("");

    const [
      studentIdentity,
      setStudentIdentity,
    ] = useState(
      getStudentIdentity()
    );

    /*
     * NEW:
     * Student's completed assignment file.
     */
    const [
      studentSubmissionFile,
      setStudentSubmissionFile,
    ] = useState(null);

    const [
      submissionFileError,
      setSubmissionFileError,
    ] = useState("");

    /* ========================================================
       STUDENT IDENTITY
    ======================================================== */

    useEffect(() => {
      const identity =
        getStudentIdentity();

      setStudentIdentity(
        identity
      );

      console.log(
        "🎓 STUDENT IDENTITY FOUND:",
        identity
      );
    }, []);

    /* ========================================================
       LOAD ASSIGNMENT
    ======================================================== */

    const loadAssignment =
      useCallback(
        async () => {
          if (!assignmentId) {
            setError(
              "A valid assignment ID was not provided."
            );

            setLoading(false);

            return;
          }

          const token =
            getAcademyToken();

          const stateAssignment =
            location.state
              ?.assignment ||
            null;

          const stateFile =
            getAssignmentFile(
              stateAssignment
            );

          if (!token) {
            if (
              stateAssignment
            ) {
              setAssignment(
                stateAssignment
              );

              setQuestions(
                extractQuestions(
                  stateAssignment
                )
              );

              setLoading(false);

              return;
            }

            setError(
              "Your student session has expired. Please log in again."
            );

            setLoading(false);

            return;
          }

          try {
            setLoading(true);
            setError("");

            const response =
              await fetch(
                `${API_URL}/api/academy/student/assignments/${encodeURIComponent(
                  assignmentId
                )}`,
                {
                  method:
                    "GET",
                  credentials:
                    "include",
                  headers:
                    getAuthHeaders(),
                }
              );

            const rawText =
              await response
                .text();

            let data = {};

            try {
              data =
                rawText
                  ? JSON.parse(
                      rawText
                    )
                  : {};
            } catch {
              data = {
                message:
                  rawText ||
                  "The server returned an invalid response.",
              };
            }

            console.log(
              "📚 ASSIGNMENT DETAILS RESPONSE:",
              data
            );

            const assignmentData =
              extractAssignment(
                data
              );

            const detailFile =
              getAssignmentFile(
                assignmentData
              );

            let mergedAssignment =
              {
                ...(stateAssignment ||
                  {}),
                ...(assignmentData ||
                  {}),
              };

            if (
              !detailFile.url &&
              stateFile.url
            ) {
              mergedAssignment.file =
                {
                  url:
                    stateFile.url,
                  name:
                    stateFile.name,
                  type:
                    stateFile.type,
                  size:
                    stateFile.size,
                };

              mergedAssignment.fileUrl =
                stateFile.url;

              mergedAssignment.fileName =
                stateFile.name;

              mergedAssignment.fileType =
                stateFile.type;

              mergedAssignment.fileSize =
                stateFile.size;
            }

            const finalFile =
              getAssignmentFile(
                mergedAssignment
              );

            if (
              finalFile.url
            ) {
              mergedAssignment.file =
                {
                  url:
                    finalFile.url,
                  name:
                    finalFile.name,
                  type:
                    finalFile.type,
                  size:
                    finalFile.size,
                };

              mergedAssignment.fileUrl =
                finalFile.url;

              mergedAssignment.fileName =
                finalFile.name;

              mergedAssignment.fileType =
                finalFile.type;

              mergedAssignment.fileSize =
                finalFile.size;
            }

            if (
              stateAssignment?.document &&
              !mergedAssignment.document
            ) {
              mergedAssignment.document =
                stateAssignment.document;
            }

            if (
              stateAssignment?.attachment &&
              !mergedAssignment.attachment
            ) {
              mergedAssignment.attachment =
                stateAssignment.attachment;
            }

            const questionData =
              extractQuestions(
                data
              );

            if (
              !response.ok
            ) {
              if (
                stateAssignment
              ) {
                setAssignment(
                  mergedAssignment
                );

                setQuestions(
                  extractQuestions(
                    mergedAssignment
                  )
                );

                setLoading(
                  false
                );

                return;
              }

              throw new Error(
                extractServerMessage(
                  data,
                  "Unable to load assignment."
                )
              );
            }

            if (
              !assignmentData &&
              !stateAssignment
            ) {
              throw new Error(
                "The assignment was not found."
              );
            }

            setAssignment(
              mergedAssignment
            );

            setQuestions(
              questionData.length
                ? questionData
                : extractQuestions(
                    mergedAssignment
                  )
            );

            const existingAnswers =
              data?.answers ||
              data?.data?.answers ||
              data?.assignment?.answers ||
              [];

            if (
              Array.isArray(
                existingAnswers
              )
            ) {
              const answerMap =
                {};

              existingAnswers.forEach(
                (item) => {
                  const qid =
                    item.question_id ??
                    item.questionId ??
                    item.question?.id;

                  const selected =
                    item.student_answer ??
                    item.studentAnswer ??
                    item.answer ??
                    item.selected_answer ??
                    "";

                  if (
                    qid !==
                      undefined &&
                    qid !== null
                  ) {
                    answerMap[
                      String(qid)
                    ] =
                      selected;
                  }
                }
              );

              if (
                Object.keys(
                  answerMap
                ).length
              ) {
                setAnswers(
                  answerMap
                );
              }
            }

            /*
             * Detect an existing submission returned by the
             * assignment endpoint.
             */
            const existingSubmission =
              extractSubmission(
                data
              );

            if (
              existingSubmission &&
              (
                existingSubmission.id ||
                existingSubmission.submissionId ||
                existingSubmission.submission_id
              )
            ) {
              const submissionStatus =
                cleanValue(
                  existingSubmission.status
                ).toLowerCase();

              if (
                [
                  "submitted",
                  "reviewed",
                  "graded",
                  "completed",
                ].includes(
                  submissionStatus
                )
              ) {
                setSavedSubmission(
                  existingSubmission
                );

                setSubmitted(
                  true
                );
              }
            }

            console.log(
              "📝 QUESTIONS FOUND:",
              questionData.length
            );

            console.log(
              "📎 STATE FILE:",
              stateFile
            );

            console.log(
              "📎 DETAIL FILE:",
              detailFile
            );

            console.log(
              "📎 FINAL FILE:",
              getAssignmentFile(
                mergedAssignment
              )
            );

            console.log(
              "📚 FINAL ASSIGNMENT:",
              mergedAssignment
            );
          } catch (err) {
            console.error(
              "StudentAssignmentDetails load error:",
              err
            );

            if (
              stateAssignment
            ) {
              const fallbackAssignment =
                {
                  ...stateAssignment,
                };

              const fallbackFile =
                getAssignmentFile(
                  fallbackAssignment
                );

              if (
                fallbackFile.url
              ) {
                fallbackAssignment.file =
                  {
                    url:
                      fallbackFile.url,
                    name:
                      fallbackFile.name,
                    type:
                      fallbackFile.type,
                    size:
                      fallbackFile.size,
                  };

                fallbackAssignment.fileUrl =
                  fallbackFile.url;

                fallbackAssignment.fileName =
                  fallbackFile.name;

                fallbackAssignment.fileType =
                  fallbackFile.type;

                fallbackAssignment.fileSize =
                  fallbackFile.size;
              }

              setAssignment(
                fallbackAssignment
              );

              setQuestions(
                extractQuestions(
                  fallbackAssignment
                )
              );

              setError("");
            } else {
              setError(
                err?.message ||
                  "Unable to load this assignment."
              );
            }
          } finally {
            setLoading(false);
          }
        },
        [
          assignmentId,
          location.state,
        ]
      );

    useEffect(() => {
      loadAssignment();
    }, [
      loadAssignment,
    ]);

    /* ========================================================
       ASSIGNMENT DOCUMENT
    ======================================================== */

    const assignmentFile =
      useMemo(() => {
        const fromAssignment =
          getAssignmentFile(
            assignment
          );

        if (
          fromAssignment.url
        ) {
          return fromAssignment;
        }

        const fromStateDocument =
          getAssignmentFile(
            location.state
              ?.document
          );

        if (
          fromStateDocument.url
        ) {
          return fromStateDocument;
        }

        const fromStateAssignment =
          getAssignmentFile(
            location.state
              ?.assignment
          );

        if (
          fromStateAssignment.url
        ) {
          return fromStateAssignment;
        }

        return {
          url: "",
          name: "",
          type: "",
          size: null,
        };
      }, [
        assignment,
        location.state,
      ]);

    const assignmentFileUrl =
      useMemo(() => {
        return resolveFileUrl(
          assignmentFile.url
        );
      }, [
        assignmentFile.url,
      ]);

    const assignmentFileExtension =
      useMemo(() => {
        return getFileExtension(
          assignmentFile.name,
          assignmentFile.type,
          assignmentFile.url
        );
      }, [
        assignmentFile.name,
        assignmentFile.type,
        assignmentFile.url,
      ]);

    const hasAssignmentDocument =
      Boolean(
        assignmentFileUrl
      );

    const assignmentIsPdf =
      isPdfFile(
        assignmentFile.name,
        assignmentFile.type,
        assignmentFile.url
      );

    const assignmentIsVideo =
      isVideoFile(
        assignmentFile.name,
        assignmentFile.type,
        assignmentFile.url
      );

    /*
     * Document assignment means tutor supplied a file and there
     * are no multiple-choice questions.
     */
    const isDocumentAssignment =
      hasAssignmentDocument &&
      questions.length === 0;

    /* ========================================================
       PROTECTED FILE ENDPOINT
    ======================================================== */

    const protectedFileEndpoint =
      useMemo(() => {
        if (!assignmentId) {
          return "";
        }

        return `${API_URL}/api/academy/student/assignments/${encodeURIComponent(
          assignmentId
        )}/file`;
      }, [
        assignmentId,
      ]);

    /* ========================================================
       LOAD PROTECTED FILE
    ======================================================== */

    const loadProtectedFile =
      useCallback(
        async ({
          force = false,
        } = {}) => {
          if (
            !protectedFileEndpoint
          ) {
            return "";
          }

          if (
            protectedFileUrl &&
            !force
          ) {
            return protectedFileUrl;
          }

          const token =
            getAcademyToken();

          if (!token) {
            setProtectedFileError(
              "Your student session has expired. Please log in again."
            );

            return "";
          }

          try {
            setProtectedFileLoading(
              true
            );

            setProtectedFileError("");

            const response =
              await fetch(
                protectedFileEndpoint,
                {
                  method:
                    "GET",

                  credentials:
                    "include",

                  headers:
                    getAuthHeaders(),
                }
              );

            if (
              !response.ok
            ) {
              const raw =
                await response
                  .text()
                  .catch(
                    () => ""
                  );

              let data = {};

              try {
                data =
                  raw
                    ? JSON.parse(
                        raw
                      )
                    : {};
              } catch {
                data = {};
              }

              throw new Error(
                extractServerMessage(
                  data,
                  `Unable to load assignment file. Server returned ${response.status}.`
                )
              );
            }

            const blob =
              await response.blob();

            if (
              !blob ||
              blob.size === 0
            ) {
              throw new Error(
                "The assignment file is empty."
              );
            }

            let finalType =
              blob.type ||
              assignmentFile.type ||
              "";

            if (
              assignmentIsPdf &&
              !finalType.includes(
                "pdf"
              )
            ) {
              finalType =
                "application/pdf";
            }

            if (
              finalType &&
              blob.type !==
                finalType
            ) {
              const typedBlob =
                blob.slice(
                  0,
                  blob.size,
                  finalType
                );

              const objectUrl =
                URL.createObjectURL(
                  typedBlob
                );

              setProtectedFileType(
                finalType
              );

              setProtectedFileUrl(
                objectUrl
              );

              return objectUrl;
            }

            const objectUrl =
              URL.createObjectURL(
                blob
              );

            setProtectedFileType(
              finalType
            );

            setProtectedFileUrl(
              objectUrl
            );

            return objectUrl;
          } catch (err) {
            console.error(
              "❌ PROTECTED ASSIGNMENT FILE ERROR:",
              err
            );

            setProtectedFileError(
              err?.message ||
                "Unable to load the assignment file."
            );

            return "";
          } finally {
            setProtectedFileLoading(
              false
            );
          }
        },
        [
          protectedFileEndpoint,
          protectedFileUrl,
          assignmentFile.type,
          assignmentIsPdf,
        ]
      );

    /* ========================================================
       LOAD FILE WHEN ASSIGNMENT DOCUMENT EXISTS
    ======================================================== */

    useEffect(() => {
      if (
        !assignmentId ||
        !hasAssignmentDocument
      ) {
        return;
      }

      loadProtectedFile();
    }, [
      assignmentId,
      hasAssignmentDocument,
      loadProtectedFile,
    ]);

    /* ========================================================
       CLEAN OBJECT URL
    ======================================================== */

    useEffect(() => {
      return () => {
        if (
          protectedFileUrl &&
          protectedFileUrl.startsWith(
            "blob:"
          )
        ) {
          URL.revokeObjectURL(
            protectedFileUrl
          );
        }
      };
    }, [
      protectedFileUrl,
    ]);

    /* ========================================================
       HANDLE ANSWER
    ======================================================== */

    const handleAnswer = (
      questionId,
      answer
    ) => {
      setAnswers(
        (previous) => ({
          ...previous,

          [String(questionId)]:
            answer,
        })
      );

      setSubmitError("");
    };

    /* ========================================================
       HANDLE STUDENT SUBMISSION FILE
    ======================================================== */

    const handleSubmissionFileChange =
      (event) => {
        const file =
          event.target.files?.[0];

        setSubmissionFileError(
          ""
        );

        if (!file) {
          setStudentSubmissionFile(
            null
          );

          return;
        }

        /*
         * Keep the limit aligned with the tutor assignment
         * upload limit: 250 MB.
         */
        const MAX_SIZE =
          250 *
          1024 *
          1024;

        if (
          file.size >
          MAX_SIZE
        ) {
          setStudentSubmissionFile(
            null
          );

          setSubmissionFileError(
            "The selected file is larger than 250 MB."
          );

          if (
            fileInputRef.current
          ) {
            fileInputRef.current.value =
              "";
          }

          return;
        }

        const allowedExtensions = [
          "pdf",
          "doc",
          "docx",
          "txt",
          "ppt",
          "pptx",
          "xls",
          "xlsx",
          "jpg",
          "jpeg",
          "png",
          "webp",
          "zip",
        ];

        const extension =
          getFileExtension(
            file.name,
            file.type,
            ""
          );

        if (
          extension &&
          !allowedExtensions.includes(
            extension
          )
        ) {
          setStudentSubmissionFile(
            null
          );

          setSubmissionFileError(
            `The file type ".${extension}" is not supported. Please upload PDF, DOC, DOCX, image, spreadsheet, presentation, TXT or ZIP files.`
          );

          if (
            fileInputRef.current
          ) {
            fileInputRef.current.value =
              "";
          }

          return;
        }

        setStudentSubmissionFile(
          file
        );
        setSubmitError("");
      };

    const removeSubmissionFile =
      () => {
        setStudentSubmissionFile(
          null
        );

        setSubmissionFileError(
          ""
        );

        if (
          fileInputRef.current
        ) {
          fileInputRef.current.value =
            "";
        }
      };

    /* ========================================================
       SUBMIT QUESTION ASSIGNMENT
    ======================================================== */

    const submitQuestionAssignment =
      async () => {
        if (!assignment?.id) {
          setSubmitError(
            "This assignment does not have a valid ID."
          );

          return;
        }

        if (
          !questions.length
        ) {
          setSubmitError(
            "This assignment has no questions."
          );

          return;
        }

        const unansweredQuestions =
          questions.filter(
            (question) => {
              const questionId =
                String(
                  question.id
                );

              return !cleanValue(
                answers[
                  questionId
                ]
              );
            }
          );

        if (
          unansweredQuestions.length
        ) {
          setSubmitError(
            `Please answer all questions before submitting. ${
              unansweredQuestions.length
            } question${
              unansweredQuestions.length ===
              1
                ? ""
                : "s"
            } remaining.`
          );

          return;
        }

        const identity =
          getStudentIdentity();

        setStudentIdentity(
          identity
        );

        const {
          studentReference,
          studentId,
          enrollmentId,
          studentName,
        } = identity;

        if (
          !enrollmentId &&
          !studentReference
        ) {
          setSubmitError(
            "Your student enrollment information could not be found. Please log out and log in again."
          );

          return;
        }

        try {
          setSubmitting(true);
          setSubmitError("");

          const answerMap =
            {};

          const answerList =
            [];

          questions.forEach(
            (question) => {
              const questionId =
                String(
                  question.id
                );

              const selectedAnswer =
                cleanValue(
                  answers[
                    questionId
                  ]
                );

              answerMap[
                questionId
              ] =
                selectedAnswer;

              answerList.push({
                questionId:
                  question.id,

                question_id:
                  question.id,

                answer:
                  selectedAnswer,

                studentAnswer:
                  selectedAnswer,

                student_answer:
                  selectedAnswer,
              });
            }
          );

          const payload = {
            assignmentId:
              assignment.id,

            assignment_id:
              assignment.id,

            enrollmentId:
              enrollmentId || "",

            enrollment_id:
              enrollmentId || "",

            studentReference:
              studentReference || "",

            student_reference:
              studentReference || "",

            reference:
              studentReference || "",

            studentId:
              studentId || "",

            student_id:
              studentId || "",

            studentName:
              studentName ||
              "Student",

            student_name:
              studentName ||
              "Student",

            answers:
              answerMap,

            answerList:
              answerList,

            responses:
              answerMap,
          };

          const response =
            await fetch(
              `${API_URL}/api/academy/student/assignments/${encodeURIComponent(
                assignment.id
              )}/submit`,
              {
                method:
                  "POST",

                headers:
                  getJsonAuthHeaders(),

                credentials:
                  "include",

                body:
                  JSON.stringify(
                    payload
                  ),
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
            data = {
              message:
                rawText ||
                "The server returned an invalid response.",
            };
          }

          if (
            response.status ===
            409
          ) {
            const existingSubmission =
              extractSubmission(
                data
              );

            if (
              existingSubmission
            ) {
              setSavedSubmission(
                existingSubmission
              );

              setSubmitted(
                true
              );

              return;
            }

            throw new Error(
              extractServerMessage(
                data,
                "This assignment has already been submitted."
              )
            );
          }

          if (
            !response.ok
          ) {
            throw new Error(
              extractServerMessage(
                data,
                `Unable to submit assignment. Server returned ${response.status}.`
              )
            );
          }

          const saved =
            extractSubmission(
              data
            );

          setSavedSubmission(
            saved
          );

          setSubmitted(
            true
          );

          setAssignment(
            (previous) =>
              previous
                ? {
                    ...previous,
                    status:
                      "submitted",
                  }
                : previous
          );
        } catch (err) {
          console.error(
            "❌ ASSIGNMENT SUBMISSION ERROR:",
            err
          );

          setSubmitError(
            err?.message ||
              "Unable to submit assignment."
          );
        } finally {
          setSubmitting(
            false
          );
        }
      };

    /* ========================================================
       SUBMIT DOCUMENT ASSIGNMENT
    ======================================================== */

    const submitDocumentAssignment =
      async () => {
        if (!assignment?.id) {
          setSubmitError(
            "This assignment does not have a valid ID."
          );

          return;
        }

        if (
          !studentSubmissionFile
        ) {
          setSubmissionFileError(
            "Please select your completed assignment before submitting."
          );

          setSubmitError(
            "Please attach your completed assignment."
          );

          return;
        }

        const identity =
          getStudentIdentity();

        setStudentIdentity(
          identity
        );

        const {
          studentReference,
          studentId,
          enrollmentId,
          studentName,
        } = identity;

        if (
          !enrollmentId &&
          !studentReference &&
          !studentId
        ) {
          setSubmitError(
            "Your student enrollment information could not be found. Please log out and log in again."
          );

          return;
        }

        try {
          setSubmitting(true);
          setSubmitError(
            ""
          );
          setSubmissionFileError(
            ""
          );

          /*
           * IMPORTANT:
           * Document assignments are submitted as multipart/form-data
           * so the student's completed file can reach the server.
           *
           * Do NOT manually set Content-Type here.
           * The browser adds the multipart boundary automatically.
           */
          const formData =
            new FormData();

          formData.append(
            "assignmentId",
            String(
              assignment.id
            )
          );

          formData.append(
            "assignment_id",
            String(
              assignment.id
            )
          );

          if (
            enrollmentId
          ) {
            formData.append(
              "enrollmentId",
              enrollmentId
            );

            formData.append(
              "enrollment_id",
              enrollmentId
            );
          }

          if (
            studentReference
          ) {
            formData.append(
              "studentReference",
              studentReference
            );

            formData.append(
              "student_reference",
              studentReference
            );

            formData.append(
              "reference",
              studentReference
            );
          }

          if (
            studentId
          ) {
            formData.append(
              "studentId",
              studentId
            );

            formData.append(
              "student_id",
              studentId
            );
          }

          formData.append(
            "studentName",
            studentName ||
              "Student"
          );

          formData.append(
            "student_name",
            studentName ||
              "Student"
          );

          formData.append(
            "submissionType",
            "document"
          );

          formData.append(
            "submission_type",
            "document"
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
           * Send the file under several common field names.
           *
           * The primary field is "file".
           */
          formData.append(
            "file",
            studentSubmissionFile,
            studentSubmissionFile.name
          );

          formData.append(
            "submissionFile",
            studentSubmissionFile,
            studentSubmissionFile.name
          );

          formData.append(
            "submission_file",
            studentSubmissionFile,
            studentSubmissionFile.name
          );

          formData.append(
            "attachment",
            studentSubmissionFile,
            studentSubmissionFile.name
          );

          formData.append(
            "attachmentName",
            studentSubmissionFile.name
          );

          formData.append(
            "fileName",
            studentSubmissionFile.name
          );

          formData.append(
            "file_name",
            studentSubmissionFile.name
          );

          const response =
            await fetch(
              `${API_URL}/api/academy/student/assignments/${encodeURIComponent(
                assignment.id
              )}/submit`,
              {
                method:
                  "POST",

                headers:
                  getAuthHeaders(),

                credentials:
                  "include",

                body:
                  formData,
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
            data = {
              message:
                rawText ||
                "The server returned an invalid response.",
            };
          }

          console.log(
            "📤 DOCUMENT SUBMISSION RESPONSE:",
            response.status,
            data
          );

          if (
            response.status ===
            409
          ) {
            const existingSubmission =
              extractSubmission(
                data
              );

            if (
              existingSubmission
            ) {
              setSavedSubmission(
                existingSubmission
              );

              setSubmitted(
                true
              );

              return;
            }

            throw new Error(
              extractServerMessage(
                data,
                "This assignment has already been submitted."
              )
            );
          }

          if (
            !response.ok
          ) {
            throw new Error(
              extractServerMessage(
                data,
                `Unable to submit assignment. Server returned ${response.status}.`
              )
            );
          }

          const saved =
            extractSubmission(
              data
            );

          setSavedSubmission(
            saved
          );

          setSubmitted(
            true
          );

          setAssignment(
            (previous) =>
              previous
                ? {
                    ...previous,
                    status:
                      "submitted",
                  }
                : previous
          );

          setStudentSubmissionFile(
            null
          );

          if (
            fileInputRef.current
          ) {
            fileInputRef.current.value =
              "";
          }
        } catch (err) {
          console.error(
            "❌ DOCUMENT ASSIGNMENT SUBMISSION ERROR:",
            err
          );

          setSubmitError(
            err?.message ||
              "Unable to submit your assignment."
          );
        } finally {
          setSubmitting(
            false
          );
        }
      };

    /* ========================================================
       SUBMIT ASSIGNMENT
    ======================================================== */

    const submitAssignment =
      async () => {
        if (
          questions.length
        ) {
          await submitQuestionAssignment();
          return;
        }

        if (
          isDocumentAssignment
        ) {
          await submitDocumentAssignment();
          return;
        }

        setSubmitError(
          "This assignment does not contain questions or a document to submit."
        );
      };

    /* ========================================================
       OPEN PROTECTED DOCUMENT
    ======================================================== */

    const openAssignmentDocument =
      async () => {
        const url =
          await loadProtectedFile();

        if (!url) {
          return;
        }

        window.open(
          url,
          "_blank",
          "noopener,noreferrer"
        );
      };

    /* ========================================================
       DOWNLOAD PROTECTED DOCUMENT
    ======================================================== */

    const downloadAssignmentDocument =
      async () => {
        const url =
          await loadProtectedFile();

        if (!url) {
          return;
        }

        try {
          const anchor =
            document.createElement(
              "a"
            );

          anchor.href =
            url;

          anchor.download =
            assignmentFile.name ||
            "assignment-document";

          document.body.appendChild(
            anchor
          );

          anchor.click();

          anchor.remove();
        } catch (err) {
          console.error(
            "Assignment download error:",
            err
          );

          window.open(
            url,
            "_blank",
            "noopener,noreferrer"
          );
        }
      };

    /* ========================================================
       RETRY FILE
    ======================================================== */

    const retryProtectedFile =
      async () => {
        if (
          protectedFileUrl &&
          protectedFileUrl.startsWith(
            "blob:"
          )
        ) {
          URL.revokeObjectURL(
            protectedFileUrl
          );
        }

        setProtectedFileUrl("");

        setProtectedFileError("");

        await loadProtectedFile({
          force: true,
        });
      };

    /* ========================================================
       BACK
    ======================================================== */

    const goBack = () => {
      navigate(
        "/academy/student/assignments"
      );
    };

    /* ========================================================
       LOADING
    ======================================================== */

    if (loading) {
      return (
        <div className="min-h-screen bg-[#050816] text-white flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2
              size={34}
              className="animate-spin text-cyan-400"
            />

            <p className="text-slate-400">
              Loading assignment...
            </p>
          </div>
        </div>
      );
    }

    /* ========================================================
       ERROR
    ======================================================== */

    if (error) {
      return (
        <div className="min-h-screen bg-[#050816] text-white px-6 py-10">
          <div className="max-w-3xl mx-auto">
            <button
              type="button"
              onClick={goBack}
              className="flex items-center gap-2 text-slate-400 hover:text-white transition mb-8"
            >
              <ArrowLeft
                size={18}
              />

              Back to Assignments
            </button>

            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6">
              <div className="flex items-start gap-3">
                <AlertCircle
                  size={22}
                  className="text-red-400 mt-0.5"
                />

                <div>
                  <h2 className="font-semibold text-red-300">
                    Unable to load assignment
                  </h2>

                  <p className="text-sm text-red-200/80 mt-2">
                    {error}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    /* ========================================================
       NO ASSIGNMENT
    ======================================================== */

    if (!assignment) {
      return (
        <div className="min-h-screen bg-[#050816] text-white px-6 py-10">
          <div className="max-w-3xl mx-auto">
            <button
              type="button"
              onClick={goBack}
              className="flex items-center gap-2 text-slate-400 hover:text-white transition mb-8"
            >
              <ArrowLeft
                size={18}
              />

              Back to Assignments
            </button>

            <div className="rounded-2xl border border-white/10 bg-[#071426] p-8 text-center">
              <FileText
                size={42}
                className="mx-auto text-slate-500 mb-4"
              />

              <h2 className="text-xl font-semibold">
                Assignment not found
              </h2>
            </div>
          </div>
        </div>
      );
    }

    /* ========================================================
       SUBMITTED
    ======================================================== */

    if (submitted) {
      return (
        <div className="min-h-screen bg-[#050816] text-white px-6 py-10">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              className="rounded-3xl border border-emerald-500/20 bg-[#071426] p-8 md:p-10 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2
                  size={34}
                  className="text-emerald-400"
                />
              </div>

              <h1 className="text-2xl md:text-3xl font-bold">
                Assignment Submitted
              </h1>

              <p className="text-slate-400 mt-3 max-w-xl mx-auto">
                {isDocumentAssignment
                  ? "Your completed assignment has been successfully submitted. Your tutor can now review your work."
                  : "Your answers have been successfully submitted. Your tutor can now review your submission."}
              </p>

              {savedSubmission ? (
                <div className="mt-6 space-y-3">
                  {savedSubmission.id ? (
                    <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-slate-300">
                      <Award
                        size={17}
                        className="text-cyan-400"
                      />

                      Submission ID:

                      <span className="font-mono text-white">
                        {
                          savedSubmission.id
                        }
                      </span>
                    </div>
                  ) : null}

                  {savedSubmission.score !==
                  undefined ? (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
                      <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                        <p className="text-xs text-slate-500">
                          Score
                        </p>

                        <p className="text-xl font-bold mt-1">
                          {
                            savedSubmission.score
                          }
                          /
                          {
                            savedSubmission.totalMarks ??
                            savedSubmission.total_marks ??
                            0
                          }
                        </p>
                      </div>

                      <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                        <p className="text-xs text-slate-500">
                          Percentage
                        </p>

                        <p className="text-xl font-bold mt-1">
                          {
                            savedSubmission.percentage ??
                            0
                          }
                          %
                        </p>
                      </div>

                      <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                        <p className="text-xs text-slate-500">
                          Grade
                        </p>

                        <p className="text-xl font-bold mt-1">
                          {
                            savedSubmission.grade ??
                            "—"
                          }
                        </p>
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : null}

              <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  type="button"
                  onClick={goBack}
                  className="px-5 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition"
                >
                  Back to Assignments
                </button>

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      `/academy/student/assignments/${assignment.id}/result`
                    )
                  }
                  className="px-5 py-3 rounded-xl bg-cyan-500 text-slate-950 font-semibold hover:bg-cyan-400 transition"
                >
                  View Result
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      );
    }

    /* ========================================================
       MAIN PAGE
    ======================================================== */

    return (
      <div className="min-h-screen bg-[#050816] text-white px-4 sm:px-6 py-6 sm:py-10">
        <div className="max-w-4xl mx-auto">

          {/* BACK */}

          <button
            type="button"
            onClick={goBack}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition mb-6"
          >
            <ArrowLeft
              size={18}
            />

            Back to Assignments
          </button>

          {/* HEADER */}

          <div className="rounded-3xl border border-white/10 bg-[#071426] p-6 sm:p-8 mb-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
                <FileText
                  size={23}
                  className="text-cyan-400"
                />
              </div>

              <div className="min-w-0 flex-1">
                <h1 className="text-2xl sm:text-3xl font-bold">
                  {assignment.title ||
                    "Assignment"}
                </h1>

                {assignment.subject ? (
                  <p className="text-cyan-400 text-sm mt-2">
                    {
                      assignment.subject
                    }
                  </p>
                ) : null}

                {assignment.description ? (
                  <p className="text-slate-400 mt-3 leading-relaxed">
                    {
                      assignment.description
                    }
                  </p>
                ) : null}

                {assignment.instructions ? (
                  <div className="mt-4 rounded-xl border border-white/5 bg-black/20 p-4">
                    <p className="text-xs uppercase tracking-wider text-slate-500 mb-2">
                      Instructions
                    </p>

                    <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">
                      {
                        assignment.instructions
                      }
                    </p>
                  </div>
                ) : null}

                <div className="flex flex-wrap gap-3 mt-5">
                  <div className="inline-flex items-center gap-2 rounded-lg bg-black/20 border border-white/5 px-3 py-2 text-xs text-slate-400">
                    <FileText
                      size={14}
                    />

                    {questions.length >
                    0
                      ? `${questions.length} ${
                          questions.length ===
                          1
                            ? "Question"
                            : "Questions"
                        }`
                      : hasAssignmentDocument
                      ? "Assignment Document"
                      : "Assignment"}
                  </div>

                  {assignment.due_date ||
                  assignment.dueDate ||
                  assignment.dueAt ||
                  assignment.due_at ? (
                    <div className="inline-flex items-center gap-2 rounded-lg bg-black/20 border border-white/5 px-3 py-2 text-xs text-slate-400">
                      <Clock3
                        size={14}
                      />

                      Due{" "}

                      {new Date(
                        assignment.due_date ||
                          assignment.dueDate ||
                          assignment.dueAt ||
                          assignment.due_at
                      ).toLocaleDateString()}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          {/* ====================================================
              TUTOR DOCUMENT
          ==================================================== */}

          {hasAssignmentDocument &&
          !questions.length ? (
            <motion.div
              initial={{
                opacity: 0,
                y: 10,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              className="rounded-3xl border border-cyan-400/15 bg-[#071426] overflow-hidden mb-6"
            >
              {/* DOCUMENT HEADER */}

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 border-b border-white/10">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-xl bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center shrink-0">
                    {assignmentIsVideo ? (
                      <PlayCircle
                        size={21}
                        className="text-cyan-400"
                      />
                    ) : (
                      <FileText
                        size={21}
                        className="text-cyan-400"
                      />
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs uppercase tracking-wider text-slate-500">
                      Tutor Assignment
                    </p>

                    <h2 className="mt-1 font-semibold truncate">
                      {
                        assignmentFile.name ||
                        "Assignment Document"
                      }
                    </h2>

                    <div className="flex flex-wrap gap-2 mt-1 text-xs text-slate-500">
                      {assignmentFileExtension ? (
                        <span className="uppercase">
                          {
                            assignmentFileExtension
                          }
                        </span>
                      ) : null}

                      {formatFileSize(
                        assignmentFile.size
                      ) ? (
                        <>
                          <span>
                            •
                          </span>

                          <span>
                            {
                              formatFileSize(
                                assignmentFile.size
                              )
                            }
                          </span>
                        </>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={
                      openAssignmentDocument
                    }
                    disabled={
                      protectedFileLoading ||
                      !assignmentFileUrl
                    }
                    className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-200 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    {protectedFileLoading ? (
                      <Loader2
                        size={16}
                        className="animate-spin"
                      />
                    ) : (
                      <ExternalLink
                        size={16}
                      />
                    )}

                    {protectedFileLoading
                      ? "Loading..."
                      : "Open"}
                  </button>

                  <button
                    type="button"
                    onClick={
                      downloadAssignmentDocument
                    }
                    disabled={
                      protectedFileLoading ||
                      !assignmentFileUrl
                    }
                    className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    <Download
                      size={16}
                    />

                    Download
                  </button>
                </div>
              </div>

              {/* PROTECTED FILE ERROR */}

              {protectedFileError ? (
                <div className="p-4 sm:p-6">
                  <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-5">
                    <div className="flex items-start gap-3">
                      <AlertCircle
                        size={20}
                        className="text-red-400 mt-0.5 shrink-0"
                      />

                      <div className="flex-1">
                        <h3 className="font-semibold text-red-300">
                          Unable to load assignment file
                        </h3>

                        <p className="mt-2 text-sm text-red-200/80">
                          {
                            protectedFileError
                          }
                        </p>

                        <button
                          type="button"
                          onClick={
                            retryProtectedFile
                          }
                          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-red-400/10 border border-red-400/20 px-4 py-2.5 text-sm font-semibold text-red-300 hover:bg-red-400/20 transition"
                        >
                          <RefreshCw
                            size={16}
                          />

                          Try Again
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}

              {/* FILE LOADING */}

              {protectedFileLoading &&
              !protectedFileUrl ? (
                <div className="flex min-h-[400px] items-center justify-center p-8">
                  <div className="flex flex-col items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10">
                      <Loader2
                        size={28}
                        className="animate-spin text-cyan-400"
                      />
                    </div>

                    <div className="text-center">
                      <p className="font-semibold">
                        Loading assignment document
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        Securely loading the file...
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}

              {/* PDF */}

              {assignmentIsPdf &&
              protectedFileUrl ? (
                <div className="p-4 sm:p-6">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <Eye
                        size={16}
                        className="text-cyan-400"
                      />

                      Secure PDF Preview
                    </div>

                    <button
                      type="button"
                      onClick={
                        openAssignmentDocument
                      }
                      className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-white/10 transition"
                    >
                      <ExternalLink
                        size={14}
                      />

                      Open Full Screen
                    </button>
                  </div>

                  <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/30">
                    <iframe
                      src={`${protectedFileUrl}#toolbar=1&navpanes=0`}
                      title={
                        assignmentFile.name ||
                        "Assignment PDF"
                      }
                      className="w-full h-[70vh] min-h-[500px]"
                    />
                  </div>
                </div>
              ) : null}

              {/* VIDEO */}

              {assignmentIsVideo &&
              protectedFileUrl ? (
                <div className="p-4 sm:p-6">
                  <div className="overflow-hidden rounded-2xl border border-white/10 bg-black">
                    <video
                      src={
                        protectedFileUrl
                      }
                      controls
                      playsInline
                      className="w-full max-h-[70vh]"
                    >
                      Your browser does not
                      support video playback.
                    </video>
                  </div>
                </div>
              ) : null}

              {/* OTHER DOCUMENTS */}

              {!assignmentIsPdf &&
              !assignmentIsVideo &&
              !protectedFileError ? (
                <div className="p-6 sm:p-10">
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-8 text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-400/10 border border-cyan-400/20">
                      <FileText
                        size={30}
                        className="text-cyan-400"
                      />
                    </div>

                    <h3 className="mt-5 text-lg font-semibold">
                      Assignment Document
                    </h3>

                    <p className="mt-2 text-sm text-slate-400 max-w-md mx-auto">
                      This assignment contains a{" "}
                      {assignmentFileExtension
                        ? assignmentFileExtension.toUpperCase()
                        : "document"}{" "}
                      uploaded by your tutor.
                    </p>

                    <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={
                          openAssignmentDocument
                        }
                        disabled={
                          protectedFileLoading ||
                          !assignmentFileUrl
                        }
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 font-semibold text-slate-950 hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed transition"
                      >
                        {protectedFileLoading ? (
                          <Loader2
                            size={18}
                            className="animate-spin"
                          />
                        ) : (
                          <ExternalLink
                            size={18}
                          />
                        )}

                        {protectedFileLoading
                          ? "Loading..."
                          : "Open Document"}
                      </button>

                      <button
                        type="button"
                        onClick={
                          downloadAssignmentDocument
                        }
                        disabled={
                          protectedFileLoading ||
                          !assignmentFileUrl
                        }
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 font-medium text-slate-200 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition"
                      >
                        <Download
                          size={18}
                        />

                        Download
                      </button>
                    </div>
                  </div>
                </div>
              ) : null}
            </motion.div>
          ) : null}

          {/* ====================================================
              DOCUMENT SUBMISSION
          ==================================================== */}

          {isDocumentAssignment ? (
            <motion.div
              initial={{
                opacity: 0,
                y: 10,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              className="rounded-3xl border border-emerald-400/15 bg-[#071426] overflow-hidden mb-6"
            >
              <div className="p-5 sm:p-6 border-b border-white/10">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-400/10">
                    <Upload
                      size={22}
                      className="text-emerald-400"
                    />
                  </div>

                  <div>
                    <h2 className="text-lg sm:text-xl font-semibold">
                      Submit Your Work
                    </h2>

                    <p className="mt-1 text-sm text-slate-400 leading-relaxed">
                      Complete the assignment above,
                      save your work as a file, then
                      upload it here for your tutor to
                      review.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-5 sm:p-6">
                <input
                  ref={
                    fileInputRef
                  }
                  type="file"
                  className="hidden"
                  accept=".pdf,.doc,.docx,.txt,.ppt,.pptx,.xls,.xlsx,.jpg,.jpeg,.png,.webp,.zip,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/*"
                  onChange={
                    handleSubmissionFileChange
                  }
                />

                {!studentSubmissionFile ? (
                  <button
                    type="button"
                    onClick={() =>
                      fileInputRef.current?.click()
                    }
                    disabled={
                      submitting
                    }
                    className="w-full rounded-2xl border-2 border-dashed border-white/10 bg-black/20 hover:border-cyan-400/30 hover:bg-cyan-400/[0.03] p-8 sm:p-10 transition disabled:opacity-50"
                  >
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10">
                      <Upload
                        size={25}
                        className="text-cyan-400"
                      />
                    </div>

                    <p className="mt-4 font-semibold text-slate-200">
                      Upload your completed assignment
                    </p>

                    <p className="mt-2 text-sm text-slate-500">
                      Click to choose your file
                    </p>

                    <p className="mt-3 text-xs text-slate-600">
                      PDF, DOC, DOCX, images,
                      spreadsheets, presentations,
                      TXT or ZIP • Maximum 250 MB
                    </p>
                  </button>
                ) : (
                  <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.04] p-4 sm:p-5">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-cyan-400/10 border border-cyan-400/20">
                        <Paperclip
                          size={21}
                          className="text-cyan-400"
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-slate-200 break-all">
                          {
                            studentSubmissionFile.name
                          }
                        </p>

                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                          <span>
                            {
                              studentSubmissionFile.type ||
                              "Document"
                            }
                          </span>

                          <span>
                            •
                          </span>

                          <span>
                            {
                              formatFileSize(
                                studentSubmissionFile.size
                              )
                            }
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={
                          removeSubmissionFile
                        }
                        disabled={
                          submitting
                        }
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-400 hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400 transition disabled:opacity-50"
                        aria-label="Remove selected file"
                      >
                        <X
                          size={17}
                        />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        fileInputRef.current?.click()
                      }
                      disabled={
                        submitting
                      }
                      className="mt-4 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/10 transition disabled:opacity-50"
                    >
                      <RefreshCw
                        size={15}
                      />

                      Choose another file
                    </button>
                  </div>
                )}

                {submissionFileError ? (
                  <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle
                        size={18}
                        className="text-red-400 mt-0.5 shrink-0"
                      />

                      <p className="text-sm text-red-300">
                        {
                          submissionFileError
                        }
                      </p>
                    </div>
                  </div>
                ) : null}

                {submitError ? (
                  <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle
                        size={19}
                        className="text-red-400 mt-0.5 shrink-0"
                      />

                      <div className="flex-1">
                        <p className="text-sm text-red-300">
                          {
                            submitError
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                ) : null}

                <div className="mt-6 rounded-2xl border border-white/5 bg-black/20 p-4 sm:p-5">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
                    <div>
                      <h3 className="font-semibold">
                        Ready to submit?
                      </h3>

                      <p className="text-sm text-slate-500 mt-1">
                        Make sure this is the
                        completed version you want
                        your tutor to review.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={
                        submitAssignment
                      }
                      disabled={
                        submitting ||
                        !studentSubmissionFile
                      }
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 text-slate-950 font-semibold hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      {submitting ? (
                        <>
                          <Loader2
                            size={18}
                            className="animate-spin"
                          />

                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send
                            size={18}
                          />

                          Submit Assignment
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2 text-xs text-slate-600">
                  <CheckCircle2
                    size={14}
                    className="text-emerald-500"
                  />

                  Your uploaded file will be
                  attached to this assignment
                  submission for your tutor.
                </div>
              </div>
            </motion.div>
          ) : null}

          {/* ====================================================
              QUESTIONS
          ==================================================== */}

          {questions.length > 0 ? (
            <>
              <div className="space-y-4">
                {questions.map(
                  (
                    question,
                    index
                  ) => {
                    const questionId =
                      String(
                        question.id
                      );

                    const selectedAnswer =
                      answers[
                        questionId
                      ] || "";

                    const expanded =
                      expandedQuestion ===
                      questionId;

                    return (
                      <motion.div
                        key={
                          questionId
                        }
                        initial={{
                          opacity: 0,
                          y: 10,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                        }}
                        transition={{
                          delay:
                            index *
                            0.03,
                        }}
                        className="rounded-2xl border border-white/10 bg-[#071426] overflow-hidden"
                      >
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedQuestion(
                              expanded
                                ? null
                                : questionId
                            )
                          }
                          className="w-full flex items-center justify-between gap-4 p-5 text-left hover:bg-white/[0.02] transition"
                        >
                          <div className="flex items-start gap-4">
                            <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-sm font-semibold">
                              {
                                index +
                                1
                              }
                            </div>

                            <div>
                              <p className="font-medium leading-relaxed">
                                {
                                  question.question ||
                                  "Question"
                                }
                              </p>

                              <p className="text-xs text-slate-500 mt-2">
                                {
                                  question.marks ||
                                  1
                                }{" "}
                                mark
                                {(question.marks ||
                                  1) !==
                                1
                                  ? "s"
                                  : ""}
                              </p>
                            </div>
                          </div>

                          {expanded ? (
                            <ChevronUp
                              size={19}
                              className="text-slate-500 shrink-0"
                            />
                          ) : (
                            <ChevronDown
                              size={19}
                              className="text-slate-500 shrink-0"
                            />
                          )}
                        </button>

                        {expanded ? (
                          <div className="px-5 pb-5">
                            <div className="border-t border-white/5 pt-5 space-y-3">
                              {[
                                [
                                  "A",
                                  question.optionA,
                                ],
                                [
                                  "B",
                                  question.optionB,
                                ],
                                [
                                  "C",
                                  question.optionC,
                                ],
                                [
                                  "D",
                                  question.optionD,
                                ],
                              ].map(
                                ([
                                  letter,
                                  option,
                                ]) => {
                                  if (
                                    !option
                                  ) {
                                    return null;
                                  }

                                  const isSelected =
                                    selectedAnswer ===
                                      letter ||
                                    selectedAnswer ===
                                      option;

                                  return (
                                    <button
                                      key={
                                        letter
                                      }
                                      type="button"
                                      onClick={() =>
                                        handleAnswer(
                                          questionId,
                                          letter
                                        )
                                      }
                                      className={`w-full text-left rounded-xl border px-4 py-3 transition ${
                                        isSelected
                                          ? "border-cyan-400/50 bg-cyan-400/10"
                                          : "border-white/10 bg-black/10 hover:bg-white/[0.03]"
                                      }`}
                                    >
                                      <div className="flex items-center gap-3">
                                        <span
                                          className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-semibold ${
                                            isSelected
                                              ? "bg-cyan-400 text-slate-950"
                                              : "bg-white/5 text-slate-300"
                                          }`}
                                        >
                                          {
                                            letter
                                          }
                                        </span>

                                        <span className="text-sm text-slate-200">
                                          {
                                            option
                                          }
                                        </span>
                                      </div>
                                    </button>
                                  );
                                }
                              )}
                            </div>

                            {selectedAnswer ? (
                              <div className="mt-4 flex items-center gap-2 text-xs text-emerald-400">
                                <CheckCircle2
                                  size={15}
                                />

                                Answer selected
                              </div>
                            ) : null}
                          </div>
                        ) : null}
                      </motion.div>
                    );
                  }
                )}
              </div>

              {submitError ? (
                <div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/10 p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle
                      size={19}
                      className="text-red-400 mt-0.5 shrink-0"
                    />

                    <div className="flex-1">
                      <p className="text-sm text-red-300">
                        {
                          submitError
                        }
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="mt-8 rounded-2xl border border-white/10 bg-[#071426] p-5 sm:p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
                  <div>
                    <h2 className="font-semibold">
                      Ready to submit?
                    </h2>

                    <p className="text-sm text-slate-500 mt-1">
                      Make sure you have answered
                      every question before
                      submitting.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={
                      submitAssignment
                    }
                    disabled={
                      submitting
                    }
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-cyan-500 text-slate-950 font-semibold hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    {submitting ? (
                      <>
                        <Loader2
                          size={18}
                          className="animate-spin"
                        />

                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send
                          size={18}
                        />

                        Submit Assignment
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="mt-5 rounded-xl border border-white/5 bg-black/10 p-4">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <RefreshCw
                    size={13}
                  />

                  <span>
                    Enrollment:
                  </span>

                  <span className="font-mono text-slate-400">
                    {studentIdentity.enrollmentId ||
                      "not found"}
                  </span>
                </div>
              </div>
            </>
          ) : !hasAssignmentDocument ? (
            /* NO QUESTIONS / NO DOCUMENT */

            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-6">
              <div className="flex items-start gap-3">
                <AlertCircle
                  size={22}
                  className="text-amber-400 mt-0.5"
                />

                <div>
                  <h2 className="font-semibold text-amber-300">
                    No Questions Available
                  </h2>

                  <p className="text-sm text-amber-200/70 mt-2">
                    This assignment has been
                    created, but no questions or
                    document have been added yet.
                  </p>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    );
  };

export default StudentAssignmentDetails;
